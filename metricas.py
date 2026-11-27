#!/usr/bin/env python3
"""
Placar de metricas (Atualizacao 2.0): descobre QUAL edicao / pegada / tipo de
video esta dando mais visualizacao e ajusta os pesos do sorteio de amanha.

Fluxo (roda 1x/dia pelo workflow "Placar de metricas", e pode rodar na mao):
  1. le state/videos.json (cada video publicado + estilo + pegada + tipo);
  2. busca as views atuais de cada um. Tenta, nesta ordem:
       a) YouTube Data API com chave (secret YOUTUBE_API_KEY), se existir;
       b) token OAuth do canal (so funciona se tiver o escopo "readonly");
       c) pagina publica do video (sem login, sem chave);
  3. calcula views/dia (limitado aos 4 primeiros dias) por video, so de quem
     ja tem 20h+ no ar, e compara cada estilo/pegada/tipo com a media geral
     (com "encolhimento": poucos videos = peso quase neutro);
  4. grava state/pesos.json (usado por estilos.planejar_dia) e state/placar.md.

Piso de 0.4 e teto de 2.5 nos pesos: o que vai mal aparece menos mas nunca
some (continua sendo testado), o que vai bem aparece mais mas nao toma tudo.
Nunca derruba o workflow: sem dado novo, os pesos ficam como estao.
"""
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone

import config
import estilos

VIEWS_ARQ = config.STATE_DIR / "views.json"
VIDEOS_ARQ = config.STATE_DIR / "videos.json"
PLACAR_ARQ = config.STATE_DIR / "placar.md"
IDADE_MIN_H = 20
DIAS_JANELA = 4
PRIOR = 2          # "videos fantasmas" na media geral (encolhimento)
MIN_AMOSTRA = 5    # menos que isso de videos medidos: pesos ficam neutros
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def _ler_json(p, padrao):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return padrao


# ------------------------------------------------------------- coleta de views

def _views_api_chave(ids: list, chave: str) -> dict:
    saida = {}
    for i in range(0, len(ids), 50):
        lote = ids[i:i + 50]
        url = ("https://www.googleapis.com/youtube/v3/videos?part=statistics&id="
               f"{','.join(lote)}&key={chave}")
        with urllib.request.urlopen(url, timeout=25) as r:
            dados = json.loads(r.read().decode("utf-8"))
        for it in dados.get("items", []):
            saida[it["id"]] = int(it.get("statistics", {}).get("viewCount", 0))
    return saida


def _views_oauth(ids: list) -> dict:
    from googleapiclient.discovery import build
    import upload
    creds = upload._get_credentials()
    yt = build("youtube", "v3", credentials=creds)
    saida = {}
    for i in range(0, len(ids), 50):
        resp = yt.videos().list(part="statistics", id=",".join(ids[i:i + 50])).execute()
        for it in resp.get("items", []):
            saida[it["id"]] = int(it.get("statistics", {}).get("viewCount", 0))
    return saida


def _views_pagina(vid: str):
    url = f"https://www.youtube.com/watch?v={vid}"
    req = urllib.request.Request(url, headers={
        "User-Agent": UA, "Accept-Language": "pt-BR,pt;q=0.9",
        "Cookie": "CONSENT=YES+1; SOCS=CAI"})
    with urllib.request.urlopen(req, timeout=25) as r:
        html = r.read().decode("utf-8", "ignore")
    m = re.search(r'"viewCount":"(\d+)"', html) or re.search(r'itemprop="interactionCount" content="(\d+)"', html)
    return int(m.group(1)) if m else None


def coletar_views(ids: list) -> tuple:
    """(dict id->views, nome do metodo que funcionou)."""
    chave = os.environ.get("YOUTUBE_API_KEY", "").strip()
    if chave:
        try:
            v = _views_api_chave(ids, chave)
            if v:
                return v, "api-chave"
        except Exception as exc:
            print(f"[metricas] API com chave falhou: {str(exc)[:120]}")
    try:
        v = _views_oauth(ids)
        if v:
            return v, "oauth"
    except Exception as exc:
        print(f"[metricas] token do canal sem escopo de leitura ({str(exc)[:90]}) - tentando a pagina publica.")
    v = {}
    for vid in ids:
        try:
            n = _views_pagina(vid)
            if n is not None:
                v[vid] = n
        except Exception as exc:
            print(f"[metricas] pagina de {vid} falhou: {str(exc)[:90]}")
    return v, ("pagina" if v else "nenhum")


# ------------------------------------------------------------- calculo

def _idade_h(video: dict, agora: datetime) -> float:
    try:
        t = datetime.fromisoformat(video["publicado_em"])
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        return (agora - t).total_seconds() / 3600
    except Exception:
        return -1


def _pesos_por_grupo(medidas: list, campo: str, media: float) -> tuple:
    """medidas = [(video, views_por_dia)]. Devolve ({nome: peso}, {nome: (n, media)})."""
    grupos: dict = {}
    for v, vpd in medidas:
        nome = v.get(campo) or ""
        if nome:
            grupos.setdefault(nome, []).append(vpd)
    pesos, resumo = {}, {}
    for nome, xs in grupos.items():
        m = sum(xs) / len(xs)
        resumo[nome] = (len(xs), m)
        if media > 0:
            ratio = ((sum(xs) + PRIOR * media) / (len(xs) + PRIOR)) / media
            pesos[nome] = round(min(2.5, max(0.4, ratio)), 3)
    return pesos, resumo


def _votos():
    """Le os comentarios dos Shorts com votacao (nao derruba o placar se falhar)."""
    try:
        import votos
        votos.coletar()
    except Exception as exc:
        print(f"[metricas] leitor de votos falhou: {str(exc)[:150]}")


def main() -> int:
    _votos()
    videos = _ler_json(VIDEOS_ARQ, [])
    if not videos:
        print("[metricas] state/videos.json vazio (nenhum video publicado ainda).")
        return 0
    agora = datetime.now(timezone.utc)
    recentes = sorted(videos, key=lambda v: v.get("publicado_em", ""), reverse=True)[:80]
    ids = [v["video_id"] for v in recentes]
    views, metodo = coletar_views(ids)
    if not views:
        print("[metricas] nao consegui ler views por nenhum metodo - pesos mantidos.")
        return 0
    cache = _ler_json(VIEWS_ARQ, {})
    for vid, n in views.items():
        cache[vid] = {"views": n, "lido_em": agora.isoformat(timespec="minutes")}
    VIEWS_ARQ.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding="utf-8")

    medidas = []
    for v in videos:
        idade = _idade_h(v, agora)
        info = cache.get(v["video_id"])
        if info is None or idade < IDADE_MIN_H:
            continue
        dias = min(max(idade / 24, 1.0), DIAS_JANELA)
        medidas.append((v, info["views"] / dias))

    pesos = {"estilos": {}, "formatos": {}}
    resumos = {}
    if len(medidas) >= MIN_AMOSTRA:
        media = sum(x for _v, x in medidas) / len(medidas)
        for campo, chave in (("estilo", "estilos"), ("formato", "formatos")):
            pesos[chave], resumos[chave] = _pesos_por_grupo(medidas, campo, media)
    else:
        media = sum(x for _v, x in medidas) / len(medidas) if medidas else 0.0
    pesos["amostra"] = len(medidas)
    pesos["media_views_dia"] = round(media, 1)
    pesos["atualizado"] = agora.isoformat(timespec="minutes")
    pesos["fonte_views"] = metodo
    estilos.PESOS_ARQ.write_text(json.dumps(pesos, ensure_ascii=False, indent=1), encoding="utf-8")

    linhas = [f"# Placar do Plano B - {agora:%d/%m/%Y %H:%M} UTC", "",
              f"Fonte das views: {metodo}. Videos medidos (20h+ no ar): {len(medidas)}. "
              f"Media geral: {media:.1f} views/dia (janela de {DIAS_JANELA} dias).", ""]
    if len(medidas) < MIN_AMOSTRA:
        linhas.append(f"Amostra ainda pequena (minimo {MIN_AMOSTRA}): pesos neutros por enquanto.")
    for titulo, chave in (("Estilos de edicao", "estilos"), ("Formatos", "formatos")):
        if chave in resumos:
            linhas += ["", f"## {titulo}", "", "| nome | videos | views/dia | peso |", "|---|---|---|---|"]
            for nome, (n, m) in sorted(resumos[chave].items(), key=lambda kv: -kv[1][1]):
                linhas.append(f"| {nome} | {n} | {m:.1f} | {pesos[chave].get(nome, 1.0)} |")
    linhas += ["", "## Ultimos videos", "", "| video | estilo | formato | views |", "|---|---|---|---|"]
    for v in recentes[:15]:
        linhas.append(f"| {v.get('titulo','')[:55]} | {v.get('estilo','')} | {v.get('formato','')} | "
                      f"{cache.get(v['video_id'], {}).get('views', '?')} |")
    PLACAR_ARQ.write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:   # o placar nunca pode derrubar nada
        print(f"[metricas] erro inesperado (ignorado): {exc!r}")
        sys.exit(0)

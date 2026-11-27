#!/usr/bin/env python3
"""Episodio de CONTINUACAO pelo voto dos comentarios (a promessa "a mais votada vira o proximo video").

Roda toda noite depois de votos.py (workflow metricas.yml):
  1. para cada Short com votacao que ja tem vencedora (>= 1 voto valido) e esta no ar ha 18 h ou mais,
  2. se ainda nao existe roteiro com "continuacao_de" = esse video,
  3. escreve o proximo episodio (Groq) continuando A HISTORIA pela opcao vencedora, no mesmo mundo (mesmo motor e
     cenario quando for 2D), com "Vocês escolheram ..." na abertura e uma nova votacao A/B no fim.
O roteiro entra com prioridade na fila (o programador escala continuacoes primeiro) e a descricao do video leva os
creditos de quem votou (publish._descricao + votos.creditos).

Uso: python continuacao.py            (no maximo MAX_POR_NOITE roteiros novos)
     python continuacao.py --listar   (so mostra o que esta pendente)
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timedelta, timezone

import config
import roteirista as R
import votos

MAX_POR_NOITE = 3
IDADE_MIN = timedelta(hours=18)

CONTEXTO = """
CONTINUACAO (obrigatorio): este video e o EPISODIO SEGUINTE de "{titulo}".
O que aconteceu no episodio anterior: {resumo}
Os espectadores votaram nos comentarios e a opcao vencedora foi {rotulo}.
- A primeira cena COMECA com "Vocês escolheram {curto}." e mostra imediatamente a consequencia dessa escolha.
- Mesmo protagonista, mesmo lugar e mesma epoca do episodio anterior (continuidade total). Fatos historicos reais; o que for
  hipotetico vem marcado ("imagine", "talvez").
- Termina com uma NOVA votacao A ou B ("Comenta A para ..., ou B para ... A mais votada vira o próximo vídeo.").
"""


def _ler(p, padrao):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return padrao


def _conteudos() -> dict:
    out = {}
    for arq in config.CONTEUDO_DIR.glob("*.json"):
        c = _ler(arq, None)
        if c and c.get("id"):
            out[c["id"]] = c
    return out


def _resumo(c: dict, max_chars: int = 600) -> str:
    falas = []
    for cena in c.get("cenas", []):
        falas += [b.get("texto", "") for b in (cena.get("beats") or cena.get("falas") or [])] or [cena.get("fala", "")]
    return " ".join(x for x in falas if x)[:max_chars]


def pendentes() -> list:
    """[(video_info_votos, conteudo_original)] que merecem continuacao e ainda nao tem."""
    todos = _conteudos()
    ja = {c.get("continuacao_de") for c in todos.values() if c.get("continuacao_de")}
    pubs = {p["id"]: p for p in _ler(config.STATE_DIR / "publicados.json", [])}
    agora = datetime.now(timezone.utc)
    saida = []
    for vid, v in _ler(votos.VOTOS, {}).items():
        item = v.get("item_id")
        if not v.get("vencedora") or item in ja or item not in todos:
            continue
        p = pubs.get(item) or {}
        try:
            quando = datetime.fromisoformat(str(p.get("publicado_em", "")).replace("Z", "+00:00"))
            if quando.tzinfo is None:
                quando = quando.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if agora - quando < IDADE_MIN:
            continue
        saida.append((v, todos[item]))
    saida.sort(key=lambda x: -sum(x[0].get("contagem", {}).values()))
    return saida


def escrever(v: dict, orig: dict):
    letra = v["vencedora"]
    rot = v["rotulos"].get(letra, letra)
    curto = rot.split(":", 1)[-1].strip() if ":" in rot else rot
    titulo_orig = orig.get("titulo", "")
    titulo = f"{titulo_orig.split(':')[0].split('.')[0].strip()} (parte 2): {curto}"[:90]
    ctx = CONTEXTO.format(titulo=titulo_orig, resumo=_resumo(orig), rotulo=rot, curto=curto)
    fmt = "escolha"
    d = R.gerar(fmt, titulo, contexto=ctx, motor_de=orig)
    if not d:
        return None
    ordem = 0           # prioridade: o programador escala continuacao antes de tudo
    import re
    num = re.match(r"\d+", orig["id"])
    c = {"id": f"{int(num.group()) if num else 0:02d}c-{R._slug(titulo)}"[:60],
         "ordem": ordem, "formato": fmt, "titulo": titulo, "continuacao_de": orig["id"], "voto_vencedor": letra,
         "descricao": d.get("descricao", titulo), "tags": d.get("tags", []), "cenas": d["cenas"],
         "thumb_texto": d.get("thumb_texto", ""), "titulo_curto": d.get("titulo_curto", ""),
         "titulo_youtube": d.get("titulo_youtube", ""), "comentario_fixado": d.get("comentario_fixado", "")}
    for k in ("motor", "tema", "elenco", "perfil", "estilo"):          # mesmo mundo do episodio anterior
        if orig.get(k) is not None:
            c[k] = orig[k]
    if orig.get("motor") == "2d":
        amb = next((x.get("amb") for x in orig.get("cenas", []) if x.get("amb")), None)
        for cena in c["cenas"]:
            cena.pop("cenario", None)
            if amb:
                cena["amb"] = amb
    else:
        for cena in c["cenas"]:
            if cena.get("cenario") and not cena.get("amb"):
                cena["amb"] = cena.pop("cenario")
    (config.CONTEUDO_DIR / f"{c['id']}.json").write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[continuacao] {orig['id']} -> {c['id']} (vencedora {rot})", flush=True)
    return c["id"]


def main(argv) -> int:
    pend = pendentes()
    if "--listar" in argv:
        for v, o in pend:
            print(f"{o['id']}: {v['contagem']} -> {v['vencedora']}")
        return 0
    feitos = 0
    for v, o in pend:
        if feitos >= MAX_POR_NOITE:
            break
        try:
            if escrever(v, o):
                feitos += 1
        except Exception as exc:
            print(f"[continuacao] {o['id']}: falhou ({str(exc)[:120]})", flush=True)
    print(f"[continuacao] {feitos} episodio(s) de continuacao escrito(s); {len(pend) - feitos} na espera.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

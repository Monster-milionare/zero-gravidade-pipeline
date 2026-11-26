#!/usr/bin/env python3
"""Renderiza e publica o(s) proximo(s) video(s) do Zero Gravidade BR.

Uso:
  python publish.py                 # publica 1 video pendente (o mais antigo)
  python publish.py --max 2         # ate 2
  python publish.py --id 03-einstein-newton
  python publish.py --dry-run       # renderiza e NAO envia (teste)
  python publish.py --id 01-brasil-ingles --so-instagram   # re-renderiza e posta SO no Instagram (video ja no YouTube)
O que ja foi publicado fica em state/publicados.json; o que foi medido em state/videos.json.
"""
import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import config
import estilos
import render


def _renderizar(c, saida, estilo):
    if c.get("motor") != "classico":
        import render3d
        return render3d.render_pov3d(c, saida, estilo)
    return render.render_video(c, saida, estilo)

PUB = config.STATE_DIR / "publicados.json"
VIDEOS = config.STATE_DIR / "videos.json"
HASHTAGS = "#shorts #espaco #ciencia #nasa #curiosidades #zerogravidade #astronomia"


class CotaEsgotada(Exception):
    pass


def _ler(p, padrao):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return padrao


def pendentes() -> list:
    feitos = {d["id"] for d in _ler(PUB, [])}
    itens = []
    for arq in sorted(config.CONTEUDO_DIR.glob("*.json")):
        try:
            c = json.loads(arq.read_text(encoding="utf-8"))
        except Exception:
            continue
        if c.get("id") and c["id"] not in feitos and not c["id"].startswith("00-") and not c.get("desativado") and c.get("formato") != "longo":
            itens.append(c)
    itens.sort(key=lambda c: (c.get("ordem", 999), c["id"]))
    return itens


def _motor(c: dict) -> str:
    return "2d" if c.get("motor") == "2d" else "3d"


def alternar(fila: list) -> list:
    """Rodizio do dia: 3 Shorts 2D + 1 Short 3D. O 3D entra como o 2o Short do dia (horario nobre da tarde);
    os outros tres sao 2D. Sem estoque do motor desejado, segue a fila normal (e avisa no log)."""
    if not fila:
        return fila
    if not any(_motor(c) == "3d" for c in fila):
        return fila  # canal 100% 2D: nao ha rodizio com 3D
    from zoneinfo import ZoneInfo
    pub = _ler(PUB, [])
    por_id = {}
    for arq in config.CONTEUDO_DIR.glob("*.json"):
        try:
            d = json.loads(arq.read_text(encoding="utf-8"))
            por_id[d.get("id")] = d
        except Exception:
            pass
    tz = ZoneInfo("America/Sao_Paulo")
    hoje = datetime.now(tz).date()
    feitos_hoje = []
    for d in pub:
        c = por_id.get(d.get("id"))
        try:
            dia = datetime.fromisoformat(d["publicado_em"]).astimezone(tz).date()
        except Exception:
            continue
        if c and c.get("formato") != "longo" and dia == hoje:
            feitos_hoje.append(_motor(c))
    n, tem3d = len(feitos_hoje), "3d" in feitos_hoje
    quer = "3d" if (n >= 1 and not tem3d) else "2d"
    pref = [c for c in fila if _motor(c) == quer]
    if not pref:
        print(f"[publish] rodizio: hoje {n} Short(s) ({', '.join(feitos_hoje) or '-'}), queria {quer.upper()} mas nao ha estoque - seguindo a fila normal. CRIE MAIS Shorts {quer.upper()}.", flush=True)
        return fila
    print(f"[publish] rodizio 3x2D+1x3D: hoje {n} Short(s) ({', '.join(feitos_hoje) or '-'}) -> agora {quer.upper()} ({pref[0]['id']}).", flush=True)
    return pref + [c for c in fila if c not in pref]


def _descricao(c: dict) -> str:
    import chamada_longo
    fixo = c.get("comentario_fixado")
    lg = chamada_longo.info(c)
    topo = (f"▶ Vídeo completo sobre isso no canal: {lg['url']}\n\n" if lg else "")
    if c.get("continuacao_de"):
        try:
            import votos
            cred = votos.creditos(c["continuacao_de"])
            topo += (cred + "\n\n") if cred else ""
        except Exception:
            pass
    cred = ""
    if c.get("_creditos_musica"):
        cred = "\n\nMúsica:\n" + "\n".join(dict.fromkeys(c["_creditos_musica"]))
    return (topo + (f"{fixo}\n\n" if fixo else "") + f"{c['descricao']}\n\nSe inscreva no Zero Gravidade BR: o espaço, a ciência e as decisões que mudam tudo, em animação.\nComente A ou B: a opção mais votada vira o próximo vídeo!\n\nDramatização educativa baseada em fatos e relatos reais; as decisões em aberto são hipóteses.{cred}\n\n{HASHTAGS}")


def _enviar_youtube(video: Path, c: dict, publicar_em: str | None = None) -> str:
    import upload
    from googleapiclient.errors import HttpError
    try:
        tit = (c.get("titulo_youtube") or c["titulo"]).strip()
        return upload.upload_video(video, tit[:92] + " #shorts" if len(tit) <= 92 else tit[:100],
                                   _descricao(c), c.get("tags", []) + ["shorts"], publicar_em, True)
    except HttpError as exc:
        if "quota" in str(exc).lower() or "uploadLimitExceeded" in str(exc):
            raise CotaEsgotada(str(exc)[:200]) from exc
        raise


def registrar(c: dict, video_id: str, estilo: str, agora_iso: str, ig_id=None, agendado: bool = False):
    pubs = [d for d in _ler(PUB, []) if d["id"] != c["id"]]
    item = {"id": c["id"], "video_id": video_id, "publicado_em": agora_iso, "instagram": ig_id}
    if agendado:
        item["agendado"] = True
    pubs.append(item)
    PUB.write_text(json.dumps(pubs, ensure_ascii=False, indent=1), encoding="utf-8")
    vids = [d for d in _ler(VIDEOS, []) if d.get("video_id") != video_id]
    vids.append({"video_id": video_id, "item_id": c["id"], "titulo": c["titulo"], "estilo": estilo,
                 "formato": c.get("formato", ""), "publicado_em": agora_iso})
    VIDEOS.write_text(json.dumps(vids, ensure_ascii=False, indent=1), encoding="utf-8")


def _legenda_ig(c: dict) -> str:
    return (f"{c['titulo']}\n\nSegue @zerogravidadebr pra mais viagens pelo espaço! Comenta A ou B.\n\n#espaco #ciencia #nasa #astronomia #curiosidades")


def _so_instagram(fila: list, a) -> int:
    """Re-renderiza o video (o mesmo estilo do YouTube) e posta apenas no Instagram."""
    import instagram
    pubs = _ler(PUB, [])
    vids = {d["item_id"]: d for d in _ler(VIDEOS, [])}
    erros = 0
    for c in fila[: a.max]:
        ja = next((d for d in pubs if d["id"] == c["id"]), None)
        if not ja:
            print(f"[publish] {c['id']} ainda nao esta no YouTube - use o fluxo normal.")
            erros += 1
            continue
        if ja.get("instagram"):
            print(f"[publish] {c['id']} ja esta no Instagram ({ja['instagram']}) - nada a fazer.")
            continue
        estilo = c.get("estilo") or (vids.get(c["id"]) or {}).get("estilo") or estilos.sortear(c["id"], evitar=None)
        saida = config.OUT_DIR / f"{c['id']}.mp4"
        print(f"[publish] (so IG) {c['id']} | estilo={estilo}", flush=True)
        try:
            _renderizar(c, saida, estilo)
        except Exception as exc:
            print(f"[publish] render falhou: {exc!r}")
            erros += 1
            continue
        ig = instagram.postar(saida, _legenda_ig(c))
        if not ig:
            erros += 1
            continue
        ja["instagram"] = ig
        PUB.write_text(json.dumps(pubs, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"[publish] Instagram OK: {ig}", flush=True)
    return 1 if erros else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--id")
    ap.add_argument("--max", type=int, default=1)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--se-nao-publicou-ha", type=float, default=0, help="pula se algo foi publicado nas ultimas N horas (reforco de agendamento)")
    ap.add_argument("--so-instagram", action="store_true", help="posta so no Instagram um video ja publicado no YouTube")
    ap.add_argument("--publicar-em", default="", help="ISO UTC: sobe AGENDADO no YouTube (privado + publishAt); Instagram fica pro ig_agendado")
    a = ap.parse_args()
    if a.se_nao_publicou_ha and not a.id:
        try:
            ult = max(datetime.fromisoformat(d["publicado_em"]) for d in _ler(PUB, []) if d.get("publicado_em"))
            if (datetime.now(timezone.utc) - ult).total_seconds() < a.se_nao_publicou_ha * 3600:
                print(f"[publish] ja publicou ha menos de {a.se_nao_publicou_ha}h ({ult.isoformat()}) - pulando este horario.")
                return 0
        except ValueError:
            pass

    fila = pendentes()
    if not a.id:
        import coerencia
        validos = []
        for c in fila:
            r = coerencia.validar(c)
            if r["erros"]:
                print(f"[publish] {c['id']} BLOQUEADO pela checagem de coerencia (fica na fila, nao e removido): {r['erros'][0]}"
                      f"{' (+' + str(len(r['erros']) - 1) + ')' if len(r['erros']) > 1 else ''}", flush=True)
                continue
            validos.append(c)
        fila = alternar(validos)
        try:
            import diversidade
            fila = diversidade.diversificar(fila)
        except Exception as exc:
            print(f"[publish] trava de variedade falhou ({str(exc)[:80]}): fila normal", flush=True)
    if a.id:
        todos = {json.loads(p.read_text(encoding="utf-8"))["id"]: json.loads(p.read_text(encoding="utf-8"))
                 for p in config.CONTEUDO_DIR.glob("*.json")}
        fila = [todos[a.id]] if a.id in todos else []
    if not fila:
        print("[publish] nada pendente - gere mais roteiros (roteirista.py).")
        return 0

    if a.so_instagram:
        return _so_instagram(fila, a)

    vids = _ler(VIDEOS, [])
    ultimo_estilo = vids[-1]["estilo"] if vids else None
    erros = 0
    for c in fila[: a.max]:
        estilo = c.get("estilo") or estilos.sortear(c["id"], evitar=ultimo_estilo)
        saida = config.OUT_DIR / f"{c['id']}.mp4"
        import coerencia
        coerencia.exigir(c)          # mesmo com --id: nunca renderiza roteiro incoerente
        if a.publicar_em:
            c["_publicar_em"] = a.publicar_em
        print(f"[publish] {c['id']} | estilo={estilo}", flush=True)
        try:
            r = _renderizar(c, saida, estilo)
        except Exception as exc:
            print(f"[publish] render falhou: {exc!r}")
            erros += 1
            continue
        try:
            c["_creditos_musica"] = [f[2] for f in (r or {}).get("faixas") or [] if isinstance(f, tuple) and len(f) > 2 and f[2]]
        except Exception:
            pass
        ultimo_estilo = estilo
        if a.dry_run:
            print(f"[publish] dry-run: {saida}")
            continue
        try:
            vid = _enviar_youtube(saida, c, a.publicar_em or None)
        except CotaEsgotada as exc:
            print(f"[publish] cota diaria do YouTube esgotada: {exc}")
            return 2
        except Exception as exc:
            print(f"[publish] upload falhou: {exc!r}")
            erros += 1
            continue
        print(f"[publish] YouTube OK: https://youtube.com/shorts/{vid}" + (f" (agendado para {a.publicar_em})" if a.publicar_em else ""), flush=True)
        try:
            import thumb
            import upload as _up
            th = thumb.gerar(c, estilo, config.OUT_DIR / f"{c['id']}_thumb.jpg", video=saida)  # fundo = quadro do proprio video
            _up.set_thumbnail(vid, th)
            print("[publish] thumbnail customizada enviada", flush=True)
        except Exception as exc:
            print(f"[publish] thumbnail pulada: {str(exc)[:160]}", flush=True)
        if a.publicar_em:          # agendado: o Instagram posta na hora marcada (ig_agendado.py)
            registrar(c, vid, estilo, a.publicar_em, None, agendado=True)
            continue
        import instagram
        ig = instagram.postar(saida, _legenda_ig(c))
        registrar(c, vid, estilo, datetime.now(timezone.utc).isoformat(timespec="seconds"), ig)
    return 1 if erros and not a.dry_run and erros == len(fila[: a.max]) else 0


if __name__ == "__main__":
    sys.exit(main())

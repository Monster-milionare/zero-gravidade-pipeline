"""Chamada para o video longo no final dos Shorts.

Um Short pode trazer "longo_id" (id do conteudo do video longo sobre o mesmo assunto) e, opcional,
"longo_chamada" (texto curto do cartao). A chamada so aparece se o longo JA foi publicado (existe em
state/publicados.json), para nunca apontar para um video que nao existe.
"""
import json

import config


def info(c: dict):
    lid = c.get("longo_id")
    if not lid:
        return None
    try:
        pubs = json.loads((config.STATE_DIR / "publicados.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    from datetime import datetime, timezone
    ref = datetime.fromisoformat(c["_publicar_em"]) if c.get("_publicar_em") else datetime.now(timezone.utc)

    def no_ar(d):   # longo agendado so conta se ja estiver publico quando este Short for ao ar
        try:
            return datetime.fromisoformat(d["publicado_em"]) <= ref
        except Exception:
            return True
    vid = next((d.get("video_id") for d in pubs if d.get("id") == lid and d.get("video_id") and no_ar(d)), None)
    if not vid:
        return None
    chamada = c.get("longo_chamada")
    if not chamada:
        try:
            chamada = json.loads((config.CONTEUDO_DIR / f"{lid}.json").read_text(encoding="utf-8")).get("titulo_curto") or ""
        except (OSError, ValueError):
            chamada = ""
    return {"video_id": vid, "url": f"https://youtu.be/{vid}", "chamada": (chamada or "").strip()}

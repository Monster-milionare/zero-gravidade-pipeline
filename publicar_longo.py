#!/usr/bin/env python3
"""Publica no YouTube um video LONGO (16:9) ja renderizado por render_longo.py.

Uso: python publicar_longo.py <id> <video.mp4> [--dry-run]
Capitulos: cada cena do roteiro pode ter "capitulo": "Nome"; viram a lista 00:00 na descricao.
Nao posta no Instagram (Reels e vertical). A thumbnail customizada e opcional (403 sem verificacao).
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import config
import publish

HASHTAGS = "#historia #documentario #curiosidades #historiadobrasil #planobdahistoria"


def _tempo(seg: float) -> str:
    seg = int(seg)
    return f"{seg // 60:02d}:{seg % 60:02d}" if seg < 3600 else f"{seg // 3600}:{seg % 3600 // 60:02d}:{seg % 60:02d}"


def capitulos_texto(caps: list) -> str:
    caps = [(n, float(t)) for n, t in caps]
    if not caps or caps[0][1] > 0.5:
        caps.insert(0, ("Introdução", 0.0))
    caps[0] = (caps[0][0], 0.0)
    ok = [caps[0]]
    for n, t in caps[1:]:
        if t - ok[-1][1] >= 12:      # o YouTube exige no minimo 10 s por capitulo
            ok.append((n, t))
    if len(ok) < 3:
        return ""
    return "\n".join(f"{_tempo(t)} {n}" for n, t in ok)


def descricao(c: dict, caps: list) -> str:
    cap = capitulos_texto(caps)
    return (f"{c['descricao']}\n\n" + (f"CAPÍTULOS\n{cap}\n\n" if cap else "") +
            "Se inscreva no Plano B da História: toda semana, o pior dia da história contado em 3D. "
            "Comente o que você faria no lugar dele!\n\n"
            "Dramatização baseada em fatos históricos e relatos da época. Diálogos e cenas são recriações.\n\n" + HASHTAGS)


def main() -> int:
    id_, video = sys.argv[1], Path(sys.argv[2])
    c = json.loads((config.CONTEUDO_DIR / f"{id_}.json").read_text(encoding="utf-8"))
    plano = json.loads((config.OUT_DIR / f"_longo_{id_}" / "plano.json").read_text(encoding="utf-8"))
    desc = descricao(c, plano.get("capitulos", []))
    titulo = (c.get("titulo_youtube") or c["titulo"]).strip()[:100]
    if "--dry-run" in sys.argv:
        print(titulo, "\n", desc)
        return 0
    import upload
    import programador
    quando = programador.publicar_em_de(id_)        # longo da agenda do dia: sobe AGENDADO
    vid = upload.upload_video(video, titulo, desc, c.get("tags", []), quando, False)
    print(f"[longo] YouTube OK: https://youtu.be/{vid}" + (f" (agendado para {quando})" if quando else ""), flush=True)
    try:
        import thumb
        th = thumb.gerar(c, c.get("estilo") or "sepia", config.OUT_DIR / f"{id_}_thumb.jpg", video=video)
        upload.set_thumbnail(vid, th)
        print("[longo] thumbnail customizada enviada", flush=True)
    except Exception as exc:
        print(f"[longo] thumbnail pulada: {str(exc)[:160]}", flush=True)
    publish.registrar(c, vid, c.get("estilo") or "sepia", quando or datetime.now(timezone.utc).isoformat(timespec="seconds"), None, agendado=bool(quando))
    return 0


if __name__ == "__main__":
    sys.exit(main())

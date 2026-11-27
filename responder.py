#!/usr/bin/env python3
"""Responde nos comentarios do YouTube quem votou (pedido do Andre: "esses comentarios nao estao sendo respondidos").

Duas respostas por pessoa, no maximo:
  1. "voto anotado" (rascunhos de votos.py em state/respostas_sugeridas.json), logo depois do voto;
  2. "saiu a continuacao" com o link, quando o episodio da opcao vencedora e publicado.

Responder comentario exige o escopo youtube.force-ssl no token do canal. Se o token atual so tiver upload/leitura,
o YouTube recusa (403 insufficientPermissions): nada quebra, os rascunhos ficam guardados e state/respostas_status.json
marca "precisa_autorizar" (o supervisor avisa). Para liberar, gerar o token de novo com autorizar_youtube.py.

Uso: python responder.py [--max N] [--dry-run]
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone

import config
import votos

STATUS = config.STATE_DIR / "respostas_status.json"
MAX_PADRAO = 40           # respostas por noite (cota da API: cada resposta custa 50 unidades)


def _ler(p, padrao):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return padrao


def _yt():
    from googleapiclient.discovery import build
    import upload
    return build("youtube", "v3", credentials=upload._get_credentials())


def _responder(yt, comentario_id: str, texto: str):
    return yt.comments().insert(part="snippet", body={"snippet": {"parentId": comentario_id, "textOriginal": texto}}).execute()


def avisos_de_continuacao() -> list:
    """Respostas 'saiu a continuacao' para quem votou na opcao vencedora de um video que ja ganhou o proximo episodio."""
    pubs = {p["id"]: p for p in _ler(config.STATE_DIR / "publicados.json", [])}
    resp = _ler(votos.RESPOSTAS, [])
    ja = {(r["comentario_id"], r.get("tipo", "voto")) for r in resp}
    novos = []
    conts = {}
    for arq in config.CONTEUDO_DIR.glob("*.json"):
        c = _ler(arq, {})
        if c.get("continuacao_de") and c["id"] in pubs:
            conts[c["continuacao_de"]] = (c, pubs[c["id"]])
    for vid, v in _ler(votos.VOTOS, {}).items():
        if v.get("item_id") not in conts:
            continue
        c, p = conts[v["item_id"]]
        try:   # so avisa quando o video ja esta publico (agendado ainda nao)
            if datetime.fromisoformat(str(p["publicado_em"]).replace("Z", "+00:00")) > datetime.now(timezone.utc):
                continue
        except Exception:
            pass
        link = f"https://youtube.com/shorts/{p['video_id']}"
        for x in v.get("votantes", []):
            if (x["comentario_id"], "continuacao") in ja:
                continue
            a = x["autor"] if x["autor"].startswith("@") else "@" + x["autor"]
            ganhou = x["voto"] == c.get("voto_vencedor")
            txt = (f"{a} o seu voto venceu! A continuação já saiu: {link} Bora decidir o próximo capítulo?" if ganhou else
                   f"{a} a outra opção ganhou por pouco, mas a história continua aqui: {link} Seu voto conta no próximo!")
            novos.append({"video_id": vid, "item_id": v["item_id"], "comentario_id": x["comentario_id"], "autor": x["autor"],
                          "voto": x["voto"], "comentario": x.get("texto", ""), "publicado": False, "tipo": "continuacao", "rascunho": txt})
    return novos


def main(argv) -> int:
    maxn = int(argv[argv.index("--max") + 1]) if "--max" in argv else MAX_PADRAO
    seco = "--dry-run" in argv
    resp = _ler(votos.RESPOSTAS, [])
    resp += avisos_de_continuacao()
    fila = [r for r in resp if not r.get("publicado")]
    status = {"atualizado": datetime.now(timezone.utc).isoformat(timespec="minutes"), "pendentes": len(fila), "publicadas": 0}
    if not fila:
        print("[responder] nada para responder.")
    elif seco:
        for r in fila[:maxn]:
            print(f"[responder] (seco) {r['autor']}: {r['rascunho']}")
    else:
        try:
            yt = _yt()
        except Exception as exc:
            yt = None
            status["erro"] = f"sem credencial: {str(exc)[:120]}"
        for r in fila[:maxn] if yt else []:
            try:
                _responder(yt, r["comentario_id"], r["rascunho"])
                r["publicado"] = True
                r["publicado_em"] = datetime.now(timezone.utc).isoformat(timespec="minutes")
                status["publicadas"] += 1
            except Exception as exc:
                det = str(getattr(exc, "content", b"") or exc)
                if "insufficient" in det.lower() or "403" in det:
                    status["precisa_autorizar"] = True
                    status["erro"] = "o token do canal nao tem permissao para comentar (escopo youtube.force-ssl): rode autorizar_youtube.py"
                    print("[responder] " + status["erro"], flush=True)
                    break
                r["erro"] = det[:160]
        print(f"[responder] {status['publicadas']} resposta(s) publicada(s); {len(fila) - status['publicadas']} na fila.", flush=True)
    votos.RESPOSTAS.write_text(json.dumps(resp, ensure_ascii=False, indent=1), encoding="utf-8")
    STATUS.write_text(json.dumps(status, ensure_ascii=False, indent=1), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

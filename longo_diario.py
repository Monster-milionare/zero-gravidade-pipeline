#!/usr/bin/env python3
"""Decide o video LONGO do dia (meta: 1 por dia, horario de Brasilia). Escreve id=<roteiro> em $GITHUB_OUTPUT
(vazio = nao disparar). Se a fila de longos estiver vazia, escreve um roteiro novo (roteirista_longo)."""
import json
import os
import sys
from datetime import datetime, timedelta, timezone

import config

BRT = timezone(timedelta(hours=-3))
PUB = config.STATE_DIR / "publicados.json"


def _ler(p, d):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return d


def longos():
    out = {}
    for p in config.CONTEUDO_DIR.glob("*.json"):
        c = _ler(p, {})
        if c.get("formato") == "longo" and c.get("id") and not c["id"].startswith("00-") and not c.get("desativado") and c.get("revisado") is True:
            out[c["id"]] = c        # so entra roteiro marcado "revisado": true (conferido com o quadro de contato)
    return out


def escolher():
    todos = longos()
    pubs = _ler(PUB, [])
    hoje = datetime.now(BRT).date()
    for d in pubs:
        if d["id"] in todos:
            try:
                if datetime.fromisoformat(d["publicado_em"]).astimezone(BRT).date() == hoje:
                    print(f"[longo_diario] longo de hoje ja publicado: {d['id']}")
                    return ""
            except Exception:
                pass
    feitos = {d["id"] for d in pubs}
    fila = sorted((c for i, c in todos.items() if i not in feitos), key=lambda c: (c.get("ordem", 999), c["id"]))
    if not fila:
        if os.environ.get("AUTO_GERAR_LONGO") != "1":
            print("[longo_diario] fila de longos vazia; geracao automatica desligada (roteiros precisam de revisao)")
            return ""
        import roteirista_longo
        novo = roteirista_longo.main_gerar()
        return novo or ""
    import coerencia
    for c in fila:
        r = coerencia.validar(c)
        if not r["erros"]:
            return c["id"]
        print(f"[longo_diario] {c['id']} bloqueado pela coerencia: {r['erros'][0]}")
    return ""


if __name__ == "__main__":
    vid = escolher()
    print(f"[longo_diario] escolhido: {vid or '(nenhum)'}")
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a") as f:
            f.write(f"id={vid}\n")
    sys.exit(0)

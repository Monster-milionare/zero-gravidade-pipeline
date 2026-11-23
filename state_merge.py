"""Resolve conflitos de `git pull --rebase` nos arquivos de estado (state/*.json).

Dois workflows (Short e longo) podem commitar o estado ao mesmo tempo; os dois acrescentam no fim da mesma lista
e o git acusa conflito. Aqui juntamos as duas versoes (uniao por video_id/id/item_id) em vez de perder uma delas.
Uso (dentro de um rebase em andamento):  python state_merge.py && GIT_EDITOR=true git rebase --continue
"""
from __future__ import annotations

import json
import subprocess
import sys


def _git(*a) -> str:
    return subprocess.run(["git", *a], capture_output=True, text=True, check=False).stdout


def _chave(d):
    if isinstance(d, dict):
        for k in ("video_id", "id", "item_id"):
            if d.get(k):
                return (k, d[k])
    return ("json", json.dumps(d, sort_keys=True, ensure_ascii=False))


def _juntar(a, b):
    """a = versao do servidor (ja publicada), b = versao do nosso commit; o nosso vence nos campos repetidos."""
    if isinstance(a, list) and isinstance(b, list):
        saida, pos = [], {}
        for x in a + b:
            k = _chave(x)
            if k in pos:
                saida[pos[k]] = _juntar(saida[pos[k]], x) if isinstance(x, dict) else x
            else:
                pos[k] = len(saida)
                saida.append(x)
        return saida
    if isinstance(a, dict) and isinstance(b, dict):
        r = dict(a)
        for k, v in b.items():
            r[k] = _juntar(a[k], v) if k in a and isinstance(v, (dict, list)) and isinstance(a[k], type(v)) else v
        return r
    return b


def main() -> int:
    conflitos = [p for p in _git("diff", "--name-only", "--diff-filter=U").split() if p]
    if not conflitos:
        print("[state_merge] nenhum conflito.")
        return 0
    for p in conflitos:
        if not (p.startswith("state/") and p.endswith(".json")):
            print(f"[state_merge] conflito fora de state/: {p} (nao resolvo)")
            return 1
        try:
            servidor = json.loads(_git("show", f":2:{p}") or "null")
            nosso = json.loads(_git("show", f":3:{p}") or "null")
        except Exception as exc:
            print(f"[state_merge] {p}: JSON invalido ({exc})")
            return 1
        if servidor is None:
            res = nosso
        elif nosso is None:
            res = servidor
        else:
            res = _juntar(servidor, nosso)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        subprocess.run(["git", "add", p], check=False)
        print(f"[state_merge] {p}: versoes unidas")
    return 0


if __name__ == "__main__":
    sys.exit(main())

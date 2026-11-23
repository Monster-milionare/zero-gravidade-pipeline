"""Variedade entre videos: assinatura (tema, cenarios, elenco, motor) e trava anti-repeticao na fila.

A fila NUNCA perde itens: so e reordenada (regra do canal). `diversificar` empurra para a frente o que menos
se parece com os ultimos Shorts publicados (mesmo tema, mesmos cenarios, mesmo elenco), e usa state/foco.json
(escrito pelo supervisor.py) para dar um bonus aos temas que estao rendendo mais views.
"""
from __future__ import annotations

import json
from pathlib import Path

import config

PUB = config.STATE_DIR / "publicados.json"
FOCO = config.STATE_DIR / "foco.json"
FAMILIAS_2D = {
    "nasa": {"lancamento", "nave-cabine", "modulo-lunar", "espaco", "houston", "oceano", "superficie-lunar", "descida-lunar"},
    "cretaceo": {"selva-cretaceo"},
}
K_RECENTES = 6


def _ler(p, padrao):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except Exception:
        return padrao


def motor(c: dict) -> str:
    return "2d" if c.get("motor") == "2d" else "3d"


def tema(c: dict) -> str:
    """Tema do video: 'tema' do roteiro, senao familia de cenarios 2D, senao o perfil de elenco do 3D."""
    if c.get("tema"):
        return c["tema"]
    if motor(c) == "2d":
        ambs = {x.get("amb") for x in c.get("cenas", []) if x.get("amb")}
        for fam, cj in FAMILIAS_2D.items():
            if ambs & cj:
                return fam
    try:
        import cenografo
        return cenografo.escolher_perfil(c)
    except Exception:
        return "generico"


def assinatura(c: dict) -> dict:
    el = c.get("elenco") or {}
    elenco = {el.get("prot")} | set(el.get("f") or [])
    return {"id": c.get("id"), "motor": motor(c), "tema": tema(c), "formato": c.get("formato"), "estilo": c.get("estilo"),
            "cenarios": {x.get("amb") for x in c.get("cenas", []) if x.get("amb")}, "elenco": {x for x in elenco if x}}


def _todos() -> dict:
    por_id = {}
    for arq in config.CONTEUDO_DIR.glob("*.json"):
        d = _ler(arq, None)
        if d and d.get("id"):
            por_id[d["id"]] = d
    return por_id


def recentes(n: int = K_RECENTES) -> list:
    """Assinaturas dos ultimos n Shorts publicados (mais recente primeiro)."""
    por_id = _todos()
    saida = []
    for d in reversed(_ler(PUB, [])):
        c = por_id.get(d.get("id"))
        if c and c.get("formato") != "longo":
            saida.append(assinatura(c))
        if len(saida) == n:
            break
    return saida


def _jac(a: set, b: set) -> float:
    return len(a & b) / len(a | b) if a and b and (a | b) else 0.0


def repeticao(c: dict, rec: list) -> float:
    """Quanto este roteiro se parece com os ultimos publicados (maior = mais repetido)."""
    s = assinatura(c)
    pen = 0.0
    for i, r in enumerate(rec):
        w = 1.0 / (1 + i)
        pen += w * (3.0 * (s["tema"] == r["tema"]) + 1.0 * (s["formato"] == r["formato"]) + 1.5 * _jac(s["cenarios"], r["cenarios"])
                    + 1.0 * _jac(s["elenco"], r["elenco"]) + 0.5 * (s["estilo"] is not None and s["estilo"] == r["estilo"]))
    return pen


def diversificar(fila: list) -> list:
    """Reordena o grupo do inicio da fila (mesmo motor do primeiro) pelo que menos repete os ultimos videos.
    Nao remove ninguem. Bonus de foco: temas com mais views/dia sobem."""
    if len(fila) < 2:
        return fila
    rec = recentes()
    if not rec:
        return fila
    foco = _ler(FOCO, {}).get("tema_peso", {})
    m0 = motor(fila[0])
    n = 0
    while n < len(fila) and motor(fila[n]) == m0:
        n += 1
    grupo, resto = fila[:n], fila[n:]

    def nota(ic):
        i, c = ic
        return (repeticao(c, rec) - 1.5 * (foco.get(tema(c), 1.0) - 1.0), i)

    grupo = [c for _i, c in sorted(enumerate(grupo), key=nota)]
    if grupo[0] is not fila[0]:
        print(f"[diversidade] {grupo[0]['id']} passa na frente de {fila[0]['id']} (menos parecido com os ultimos videos)", flush=True)
    return grupo + resto

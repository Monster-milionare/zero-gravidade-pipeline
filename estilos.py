"""Estilos de edicao que ROTACIONAM (mesma ideia da Atualizacao 2.0 do GTA).
Cada video sorteia um estilo (grade de cor, legenda, ritmo, transicao); pesos
vem de state/pesos.json (metricas.py), com piso 0.4 e teto 2.5."""
import json
import random
from dataclasses import dataclass

import config

PESOS_ARQ = config.STATE_DIR / "pesos.json"
AMARELO = (255, 214, 10)
BRANCO = (255, 255, 255)
CIANO = (60, 235, 255)
MAGENTA = (255, 70, 200)
LARANJA = (255, 150, 40)
VERDE = (150, 255, 150)


@dataclass(frozen=True)
class Estilo:
    nome: str
    estilo_img: str          # sufixo do prompt de imagem
    grade: str               # epico | sepia | neon | noir | aquarela
    corte: float             # duracao media de um plano (s)
    legenda_forte: tuple
    legenda_alt: tuple | None
    glitch: bool
    flash: float
    vinheta: float
    grao: float
    musica: str              # epica | misteriosa | tensa | leve


ESTILOS = {e.nome: e for e in [
    Estilo("epico", "epic cinematic oil painting, dramatic golden lighting, rich colors, highly detailed",
           "epico", 1.7, AMARELO, None, False, 0.9, 0.55, 0.02, "epica"),
    Estilo("sepia", "vintage sepia photograph style, old archive photo, film grain, dramatic composition",
           "sepia", 2.0, BRANCO, LARANJA, False, 0.5, 0.7, 0.05, "misteriosa"),
    Estilo("neon", "cyberpunk neon illustration, glowing cyan and magenta lights, dark background, highly detailed",
           "neon", 1.4, CIANO, MAGENTA, True, 1.1, 0.5, 0.02, "tensa"),
    Estilo("noir", "dramatic black and white high contrast illustration, ink and charcoal, cinematic",
           "noir", 1.8, BRANCO, AMARELO, False, 0.6, 0.75, 0.06, "misteriosa"),
    Estilo("aquarela", "colorful stylized storybook illustration, soft painterly shading, vibrant, cute and detailed",
           "aquarela", 1.9, AMARELO, VERDE, False, 0.7, 0.35, 0.0, "leve"),
]}


def ler_pesos() -> dict:
    try:
        d = json.loads(PESOS_ARQ.read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else {}
    except Exception:
        return {}


def sortear(seed: str, evitar: str | None = None, preferido: str | None = None) -> str:
    if preferido and preferido in ESTILOS:
        return preferido
    pe = ler_pesos().get("estilos", {})
    rng = random.Random(f"planob-{seed}")
    pool = [n for n in ESTILOS if n != evitar] or list(ESTILOS)
    pesos = []
    for n in pool:
        try:
            pesos.append(min(2.5, max(0.4, float(pe.get(n, 1.0)))))
        except Exception:
            pesos.append(1.0)
    return rng.choices(pool, weights=pesos, k=1)[0]

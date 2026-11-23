"""Trilha de fundo ORIGINAL gerada por codigo (sem direitos autorais, R$0)."""
import wave

import numpy as np

SR = 32000
_NOTA = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def _f(semi, oitava=4):
    return 440.0 * 2 ** ((semi - 9 + 12 * (oitava - 4)) / 12)


def _tom(freq, dur, t0, n, forma="suave", vol=1.0, ataque=0.02, rel=0.4):
    t = np.arange(int(dur * SR)) / SR
    if forma == "suave":
        s = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2 * t) + 0.12 * np.sin(2 * np.pi * freq * 3 * t)
    elif forma == "serra":
        s = sum(np.sin(2 * np.pi * freq * k * t) / k for k in range(1, 6))
    else:
        s = np.sin(2 * np.pi * freq * t)
    env = np.minimum(t / max(ataque, 1e-3), 1) * np.exp(-t / max(rel, 1e-3))
    s = s * env * vol
    i0 = int(t0 * SR)
    fim = min(n, i0 + len(s))
    if i0 < n:
        return i0, s[: fim - i0]
    return 0, np.zeros(0)


def _bumbo(n, t0, vol=1.0):
    t = np.arange(int(0.45 * SR)) / SR
    f = 55 + 80 * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * vol
    i0 = int(t0 * SR)
    return i0, s[: max(0, min(len(s), n - i0))]


def gerar(duracao: float, mood: str, saida: str, seed: int = 0):
    rng = np.random.default_rng(seed)
    n = int(duracao * SR)
    y = np.zeros(n, np.float32)

    def add(par):
        i0, s = par
        if len(s):
            y[i0:i0 + len(s)] += s.astype(np.float32)

    prog = {
        "epica": ([9, 5, 0, 7], 96, "serra"),       # Am F C G
        "misteriosa": ([9, 4, 5, 2], 70, "suave"),
        "tensa": ([2, 10, 7, 9], 124, "serra"),
        "leve": ([0, 7, 9, 5], 108, "suave"),
    }[mood]
    acordes, bpm, forma = prog
    beat = 60.0 / bpm
    barra = 4 * beat
    menor = mood != "leve"
    t = 0.0
    k = 0
    while t < duracao:
        raiz = acordes[k % 4]
        terca = raiz + (3 if menor else 4)
        quinta = raiz + 7
        for semi in (raiz, terca, quinta):
            add(_tom(_f(semi % 12, 3), barra + 0.6, t, n, forma, 0.10, 0.25, 1.8))
        add(_tom(_f(raiz % 12, 2), barra, t, n, "suave", 0.22, 0.05, 1.4))
        # arpejo
        passos = 8 if mood in ("tensa", "leve") else 4
        for j in range(passos):
            semi = [raiz, terca, quinta, raiz + 12][j % 4]
            add(_tom(_f(semi % 12, 5), beat * 4 / passos * 1.4, t + j * barra / passos, n, "suave", 0.06, 0.01, 0.25))
        # batida
        if mood in ("epica", "tensa"):
            for j in range(4):
                add(_bumbo(n, t + j * beat, 0.5 if j % 2 == 0 else 0.3))
        t += barra
        k += 1
    y += rng.normal(0, 0.002, n).astype(np.float32)
    # fade in/out
    fi, fo = int(1.0 * SR), int(1.5 * SR)
    y[:fi] *= np.linspace(0, 1, fi)
    y[-fo:] *= np.linspace(1, 0, fo)
    y /= max(1e-6, np.abs(y).max())
    pcm = (y * 0.9 * 32767).astype(np.int16)
    with wave.open(saida, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return saida

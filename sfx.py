"""Efeitos sonoros sintetizados (gratis, sem direitos autorais): whoosh de camera, asas, impacto, sino, gelo...

Cada efeito e gerado por codigo (ruido filtrado + osciladores), entao nunca ha risco de Content ID.
gerar_trilha(cues, total, saida) monta uma faixa estereo com todos os efeitos nos tempos pedidos.
"""
import wave

import numpy as np

SR = 44100


def _env(n, ataque=0.01, queda=None):
    t = np.arange(n) / SR
    a = np.clip(t / max(ataque, 1e-4), 0, 1)
    if queda:
        a *= np.exp(-t / queda)
    return a


def _ruido(n, rng):
    return rng.standard_normal(n).astype(np.float32)


def _passa_banda(x, f0, f1):
    """Filtro simples por FFT (corta fora da banda f0-f1)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < f0) | (f > f1)] *= 0.02
    return np.fft.irfft(X, len(x)).astype(np.float32)


def _varredura(x, f_ini, f_fim, largura=0.6):
    """Ruido com banda que desliza (o 'shhhuu' do whoosh)."""
    n = len(x)
    out = np.zeros(n, np.float32)
    blocos = 24
    for k in range(blocos):
        i0, i1 = k * n // blocos, (k + 1) * n // blocos
        u = k / (blocos - 1)
        fc = f_ini * (f_fim / f_ini) ** u
        seg = _passa_banda(x[max(0, i0 - 512):i1 + 512], fc * (1 - largura / 2), fc * (1 + largura / 2))
        seg = seg[(i0 - max(0, i0 - 512)):(i0 - max(0, i0 - 512)) + (i1 - i0)]
        out[i0:i1] = seg
    return out


def whoosh(rng, dur=0.42):
    n = int(dur * SR)
    x = _varredura(_ruido(n, rng), 300, 2600, 0.9)
    t = np.linspace(0, 1, n)
    env = np.sin(np.pi * t) ** 1.6
    return x * env * 0.9


def asas(rng, dur=2.4):
    n = int(dur * SR)
    out = np.zeros(n, np.float32)
    t = 0.0
    k = 0
    while t < dur - 0.3:
        m = int(0.32 * SR)
        x = _passa_banda(_ruido(m, rng), 60, 700) * _env(m, 0.03, 0.09) * 2.2
        x += np.sin(2 * np.pi * 55 * np.arange(m) / SR).astype(np.float32) * _env(m, 0.02, 0.07) * 0.8
        i = int(t * SR)
        out[i:i + m] += x[: max(0, min(m, n - i))]
        t += 0.42 + 0.08 * k
        k += 1
    return out * 0.8


def impacto(rng, dur=1.1):
    n = int(dur * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (70 - 30 * t) * t) * np.exp(-t / 0.35)
    hit = _passa_banda(_ruido(n, rng), 80, 3000) * np.exp(-t / 0.08)
    return (boom * 1.1 + hit * 0.7).astype(np.float32)


def susto(rng, dur=0.9):
    """Stinger de susto: batida grave + agudo dissonante curto."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    grave = np.sin(2 * np.pi * 48 * t) * np.exp(-t / 0.4)
    agudo = (np.sin(2 * np.pi * 1180 * t) + np.sin(2 * np.pi * 1253 * t)) * 0.18 * np.exp(-t / 0.25) * np.clip(t / 0.02, 0, 1)
    return (grave + agudo + _passa_banda(_ruido(n, rng), 200, 4000) * 0.25 * np.exp(-t / 0.05)).astype(np.float32)


def rugido(rng, dur=1.8):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 62 + 18 * np.sin(2 * np.pi * 0.7 * t)
    base = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.4
    ronco = _passa_banda(_ruido(n, rng), 90, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t))
    env = np.clip(t / 0.25, 0, 1) * np.clip((dur - t) / 0.6, 0, 1)
    return np.tanh((base + ronco) * 1.6).astype(np.float32) * env * 0.8


def sino(rng, dur=2.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for fr, amp, q in ((523, 1.0, 1.6), (1046, 0.5, 1.0), (1290, 0.35, 0.7), (1650, 0.25, 0.5), (2093, 0.2, 0.35), (261, 0.3, 2.0)):
        x += amp * np.sin(2 * np.pi * fr * t) * np.exp(-t / q)
    x *= np.clip(t / 0.003, 0, 1)
    return (x * 0.45).astype(np.float32)


def telefone(rng, dur=1.3):
    n = int(dur * SR)
    t = np.arange(n) / SR
    camp = (np.sin(2 * np.pi * 900 * t) + 0.6 * np.sin(2 * np.pi * 1350 * t)) * (np.sin(2 * np.pi * 18 * t) > 0)
    env = ((t % 0.65) < 0.45).astype(float)
    return (camp * env * 0.25).astype(np.float32)


def gelo(rng, dur=3.2):
    """Raspar de gelo no casco: ronco grave + estalos."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    ronco = _passa_banda(_ruido(n, rng), 30, 260) * 2.4
    estalos = np.zeros(n, np.float32)
    for _ in range(int(dur * 9)):
        i = rng.integers(0, n - 4000)
        m = 4000
        estalos[i:i + m] += _passa_banda(_ruido(m, rng), 800, 6000) * np.exp(-np.arange(m) / SR / 0.012) * rng.uniform(0.3, 1.0)
    env = np.clip(t / 0.4, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return np.tanh((ronco + estalos) * 0.9).astype(np.float32) * env


def vento(rng, dur=4.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = _passa_banda(_ruido(n, rng), 150, 1200) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t + 1))
    env = np.clip(t / 0.8, 0, 1) * np.clip((dur - t) / 0.8, 0, 1)
    return (x * env * 0.5).astype(np.float32)


def trovao(rng, dur=3.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = _passa_banda(_ruido(n, rng), 25, 400) * np.exp(-t / 0.9) * 3
    x += _passa_banda(_ruido(n, rng), 400, 4000) * np.exp(-t / 0.05) * 0.8
    return np.tanh(x).astype(np.float32)


def passos(rng, dur=1.6):
    n = int(dur * SR)
    out = np.zeros(n, np.float32)
    for k in range(int(dur / 0.38)):
        i = int(k * 0.38 * SR)
        m = int(0.12 * SR)
        out[i:i + m] += _passa_banda(_ruido(m, rng), 80, 1500) * _env(m, 0.003, 0.03) * 1.4
    return out


def agua(rng, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (_passa_banda(_ruido(n, rng), 300, 5000) * np.exp(-t / 0.25) * np.clip(t / 0.01, 0, 1) * 0.9).astype(np.float32)


EFEITOS = {"whoosh": whoosh, "asas": asas, "impacto": impacto, "susto": susto, "rugido": rugido, "sino": sino,
           "telefone": telefone, "gelo": gelo, "vento": vento, "trovao": trovao, "passos": passos, "agua": agua}
VOLUME = {"whoosh": 0.32, "asas": 0.55, "impacto": 0.6, "susto": 0.5, "rugido": 0.55, "sino": 0.5, "telefone": 0.35,
          "gelo": 0.6, "vento": 0.3, "trovao": 0.55, "passos": 0.4, "agua": 0.45}


def gerar_trilha(cues, total: float, saida: str, seed: int = 7) -> int:
    """cues = [(t, nome)]. Escreve wav estereo 44.1k. Devolve quantos efeitos entraram."""
    rng = np.random.default_rng(seed)
    n_total = int((total + 1) * SR)
    mix = np.zeros((n_total, 2), np.float32)
    usados = 0
    for i, (t, nome) in enumerate(cues):
        f = EFEITOS.get(nome)
        if not f:
            continue
        x = f(rng) * VOLUME.get(nome, 0.4)
        i0 = int(max(0.0, t) * SR)
        i1 = min(n_total, i0 + len(x))
        if i1 <= i0:
            continue
        pan = 0.5 + 0.25 * np.sin(i * 1.7)        # espalha um pouco no estereo
        mix[i0:i1, 0] += x[: i1 - i0] * (1.2 - pan)
        mix[i0:i1, 1] += x[: i1 - i0] * (0.2 + pan)
        usados += 1
    pico = float(np.abs(mix).max()) or 1.0
    if pico > 0.95:
        mix *= 0.95 / pico
    with wave.open(saida, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
    return usados

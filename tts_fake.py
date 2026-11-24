"""SO PARA TESTES LOCAIS (sem rede): gera 'fala' sintetica com o mesmo formato
do tts.py. Nunca e usado em producao (PLANOB_FAKE_TTS so existe em teste)."""
import re
import subprocess
from pathlib import Path

import numpy as np

import tts


def synthesize_sentences(text: str, out_dir: Path, cta: bool = False, voz=None, tom=None) -> list:
    out_dir.mkdir(parents=True, exist_ok=True)
    segs = []
    for i, frase in enumerate(tts._split_sentences(text)):
        palavras = frase.split()
        t, words = 0.0, []
        for p in palavras:
            d = 0.12 + 0.045 * len(re.sub(r"\W", "", p))
            words.append((p, t, t + d))
            t += d
        dur = t + 0.1
        sr = 24000
        n = int(dur * sr)
        x = np.arange(n) / sr
        env = np.zeros(n)
        for (_p, a, b) in words:
            ia, ib = int(a * sr), int(b * sr)
            env[ia:ib] = np.hanning(max(ib - ia, 2)) ** 0.6
        sinal = (np.sin(2 * np.pi * 140 * x) + 0.4 * np.sin(2 * np.pi * 280 * x) + 0.2 * np.random.randn(n)) * env * 0.35
        wav = out_dir / f"{i:03d}.wav"
        import wave
        with wave.open(str(wav), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes((sinal * 32767).astype(np.int16).tobytes())
        mp3 = out_dir / f"{i:03d}.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        segs.append(tts.Segment(text=frase, audio_path=mp3, duration_sec=dur + tts.PAUSA_ENTRE_FRASES_SEC,
                                is_cta=cta, words=words, energica=("!" in frase or "?" in frase)))
    return segs

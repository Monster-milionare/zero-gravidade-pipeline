"""Mapa de profundidade (1 = perto, 0 = longe) pra criar o efeito 3D/parallax.
1) Depth Anything V2 (IA, gratis, via transformers) quando disponivel;
2) heuristica (gradiente vertical + nitidez + centro) como reserva - nunca falha."""
import hashlib

import cv2
import numpy as np

import config

_pipe = None
_pipe_falhou = False


def _carregar_ia():
    global _pipe, _pipe_falhou
    if _pipe is not None or _pipe_falhou or not config.USAR_DEPTH_IA:
        return _pipe
    try:
        from transformers import pipeline
        _pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf")
        print("[depth] Depth Anything V2 carregado.", flush=True)
    except Exception as exc:
        _pipe_falhou = True
        print(f"[depth] IA indisponivel ({str(exc)[:80]}) - usando heuristica.", flush=True)
    return _pipe


def _heuristica(rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    pequeno = cv2.resize(rgb, (w // 4, h // 4), interpolation=cv2.INTER_AREA)
    cinza = cv2.cvtColor(pequeno, cv2.COLOR_RGB2GRAY).astype(np.float32)
    hh, ww = cinza.shape
    yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
    vertical = yy / hh                                   # embaixo = perto
    cx = np.exp(-(((xx / ww - 0.5) / 0.38) ** 2 + ((yy / hh - 0.55) / 0.45) ** 2))
    lap = np.abs(cv2.Laplacian(cv2.GaussianBlur(cinza, (0, 0), 1.2), cv2.CV_32F))
    nit = cv2.GaussianBlur(lap, (0, 0), 9)
    nit = nit / (nit.max() + 1e-6)
    sat = cv2.GaussianBlur(cv2.cvtColor(pequeno, cv2.COLOR_RGB2HSV)[:, :, 1].astype(np.float32) / 255, (0, 0), 7)
    d = 0.38 * vertical + 0.30 * cx + 0.20 * nit + 0.12 * sat
    d = cv2.GaussianBlur(d, (0, 0), 3)
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)
    return cv2.resize(d, (w, h), interpolation=cv2.INTER_CUBIC)


def estimar(rgb: np.ndarray) -> np.ndarray:
    """rgb uint8 HxWx3 -> float32 HxW em [0,1]."""
    pipe = _carregar_ia()
    if pipe is not None:
        try:
            from PIL import Image
            pequena = cv2.resize(rgb, (518, int(518 * rgb.shape[0] / rgb.shape[1])))
            saida = pipe(Image.fromarray(pequena))["depth"]
            d = np.asarray(saida).astype(np.float32)
            d = (d - d.min()) / (d.max() - d.min() + 1e-6)
            d = cv2.GaussianBlur(cv2.resize(d, (rgb.shape[1], rgb.shape[0]), interpolation=cv2.INTER_CUBIC), (0, 0), 2)
            # mistura leve com heuristica pra suavizar erros da IA
            return np.clip(0.8 * d + 0.2 * _heuristica(rgb), 0, 1).astype(np.float32)
        except Exception as exc:
            print(f"[depth] IA falhou nesta imagem ({str(exc)[:60]}) - heuristica.", flush=True)
    return _heuristica(rgb).astype(np.float32)

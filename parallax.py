"""Camera 2.5D: move/gira a camera sobre UMA imagem usando o mapa de
profundidade, entao o que esta perto desliza mais que o fundo (efeito 3D)."""
import math

import cv2
import numpy as np

import config

W, H = config.W, config.H
_YY, _XX = np.mgrid[0:H, 0:W].astype(np.float32)
_XC, _YC = _XX - W / 2, _YY - H / 2
ESCALA_FONTE = 1.32          # imagem-fonte e 32% maior que o quadro (folga pra mover)


def preparar(rgb: np.ndarray, depth: np.ndarray):
    """Ajusta imagem e profundidade ao tamanho-fonte (cover)."""
    sw, sh = int(W * ESCALA_FONTE), int(H * ESCALA_FONTE)
    h0, w0 = rgb.shape[:2]
    k = max(sw / w0, sh / h0)
    nw, nh = int(math.ceil(w0 * k)), int(math.ceil(h0 * k))
    img = cv2.resize(rgb, (nw, nh), interpolation=cv2.INTER_CUBIC if k > 1 else cv2.INTER_AREA)
    dep = cv2.resize(depth, (nw, nh), interpolation=cv2.INTER_LINEAR)
    x0, y0 = (nw - sw) // 2, (nh - sh) // 2
    return img[y0:y0 + sh, x0:x0 + sw].copy(), dep[y0:y0 + sh, x0:x0 + sw].copy()


MOVIMENTOS = ["push", "pull", "pan_l", "pan_r", "tilt_up", "tilt_down", "orbit_l", "orbit_r", "dolly"]


def pose(movimento: str, u: float, forca: float = 1.0):
    """u em [0,1] -> (zoom, dx, dy, paralaxe) ; dx/dy em px do quadro-fonte."""
    e = u * u * (3 - 2 * u)  # ease in-out
    f = forca
    if movimento == "push":
        return 1.0 + 0.20 * e * f, 0, 0, 55 * f * e
    if movimento == "pull":
        return 1.22 - 0.20 * e * f, 0, 0, 55 * f * (1 - e)
    if movimento == "pan_l":
        return 1.10 + 0.04 * e, 90 * f * (0.5 - e), 0, 70 * f
    if movimento == "pan_r":
        return 1.10 + 0.04 * e, -90 * f * (0.5 - e), 0, 70 * f
    if movimento == "tilt_up":
        return 1.12, 0, 110 * f * (0.5 - e), 45 * f
    if movimento == "tilt_down":
        return 1.12, 0, -110 * f * (0.5 - e), 45 * f
    if movimento == "orbit_l":
        return 1.12 + 0.05 * e, 60 * f * math.sin(math.pi * (e - 0.5)) * -1, 0, 95 * f * (0.5 - e) * 2
    if movimento == "orbit_r":
        return 1.12 + 0.05 * e, 60 * f * math.sin(math.pi * (e - 0.5)), 0, -95 * f * (0.5 - e) * 2
    # dolly: avanca forte com paralaxe grande
    return 1.0 + 0.30 * e * f, 0, 0, 90 * f * e


def quadro(fonte: np.ndarray, dep: np.ndarray, movimento: str, u: float, forca: float = 1.0,
           punch: float = 0.0) -> np.ndarray:
    """Devolve um quadro WxH RGB uint8."""
    zoom, dx, dy, par = pose(movimento, u, forca)
    zoom += punch
    sh, sw = fonte.shape[:2]
    # coordenada-fonte base (sem paralaxe)
    bx = sw / 2 + _XC / zoom * (sw / (W * ESCALA_FONTE)) * ESCALA_FONTE / ESCALA_FONTE + dx
    by = sh / 2 + _YC / zoom * (sh / (H * ESCALA_FONTE)) * ESCALA_FONTE / ESCALA_FONTE + dy
    d = cv2.remap(dep, bx, by, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    desloc = (d - 0.45) * par
    sinal = -1.0 if movimento in ("pan_l", "orbit_l", "tilt_up") else 1.0
    mx = bx + desloc * (1.0 if movimento not in ("tilt_up", "tilt_down") else 0.0) * sinal
    my = by + desloc * (0.6 if movimento in ("tilt_up", "tilt_down") else 0.18) * sinal
    return cv2.remap(fonte, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

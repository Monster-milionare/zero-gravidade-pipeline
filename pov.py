"""Modo POV: alterna cenas em 3D de tela cheia (camera 'dentro' do personagem) com cenas em
SLIDE (cartao com perspectiva 3D sobre fundo desfocado). As transicoes entre os modos sao
animadas: o slide cresce ate virar tela cheia, a tela cheia encolhe e vira slide, e um slide
empurra o outro para o lado girando em 3D."""
import math
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw

W, H = 1080, 1920
F_CAM = 1700.0           # distancia focal da camera virtual
CARD_W, CARD_H = 940, 1180
CARD_CY = int(H * 0.41)
DUR_TRANS = 0.65

MOV_3D = ["push", "dolly", "orbit_l", "orbit_r", "pull"]
MOV_SLIDE = ["pan_l", "pan_r", "tilt_up", "tilt_down", "push"]


def planejar_modos(cenas):
    """'3d' | 'slide' por cena. Respeita cena['modo'] se existir; senao alterna com bom senso."""
    n = len(cenas)
    modos = []
    for i, c in enumerate(cenas):
        m = c.get("modo")
        if m not in ("3d", "slide"):
            if i == 0 or i == n - 1 or c.get("emocao") == "surpreso":
                m = "3d"
            else:
                m = "slide"
        modos.append(m)
    # nunca 3 iguais seguidos
    for i in range(2, n):
        if modos[i] == modos[i - 1] == modos[i - 2] and "modo" not in cenas[i]:
            modos[i] = "slide" if modos[i] == "3d" else "3d"
    return modos


def _ease(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def _ease_io(x):
    x = min(1.0, max(0.0, x))
    return 3 * x * x - 2 * x ** 3


@lru_cache(maxsize=64)
def _mascara(ch: int, raio: int, borda: int):
    """mascara arredondada (ch x 1080) e anel de borda."""
    m = np.zeros((ch, 1080), np.uint8)
    if raio > 0:
        cv2.rectangle(m, (raio, 0), (1080 - raio, ch), 255, -1)
        cv2.rectangle(m, (0, raio), (1080, ch - raio), 255, -1)
        for cx, cy in ((raio, raio), (1080 - raio, raio), (raio, ch - raio), (1080 - raio, ch - raio)):
            cv2.circle(m, (cx, cy), raio, 255, -1, cv2.LINE_AA)
    else:
        m[:] = 255
    if borda > 0 and raio > 0:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (borda * 2 + 1, borda * 2 + 1))
        anel = cv2.subtract(m, cv2.erode(m, k, borderType=cv2.BORDER_CONSTANT, borderValue=0))
    else:
        anel = np.zeros_like(m)
    return m, anel


class Pov:
    def __init__(self, cenas, estilo, fonte_fn):
        self.cenas = cenas
        self.n = len(cenas)
        self.modos = planejar_modos(cenas)
        self.cor = tuple(int(x) for x in estilo.legenda_forte[:3])
        self.ci = -1
        self.prev = None
        self.prev_modo = None
        self.last = None
        self._fonte = fonte_fn
        self._badges = {}

    # --- dados para o planejador de planos
    def movimentos(self, ci):
        return MOV_3D if self.modos[ci] == "3d" else MOV_SLIDE

    def forca(self, ci, base):
        return base * (1.25 if self.modos[ci] == "3d" else 0.8)

    # --- selo "n/N"
    def _badge(self, ci):
        if ci not in self._badges:
            txt = f"{ci + 1}/{self.n}"
            f = self._fonte(54)
            im = Image.new("RGBA", (190, 84), (0, 0, 0, 0))
            d = ImageDraw.Draw(im)
            d.rounded_rectangle([0, 0, 189, 83], 28, fill=(12, 10, 26, 215), outline=self.cor + (255,), width=4)
            bb = d.textbbox((0, 0), txt, font=f)
            d.text(((190 - (bb[2] - bb[0])) / 2 - bb[0], (84 - (bb[3] - bb[1])) / 2 - bb[1] - 2), txt, font=f, fill=(255, 255, 255, 255))
            self._badges[ci] = np.asarray(im)
        return self._badges[ci]

    # --- camada 3D
    def _camada(self, saida, tex, ci, k, tx=0.0, rot_y=0.0, rot_x=0.0, esc=1.0, sombra=True):
        k = round(min(1.0, max(0.0, k)) * 24) / 24.0
        ch = int(round(1920 + (1355 - 1920) * k))
        y0 = (1920 - ch) // 2
        crop = tex[y0:y0 + ch]
        raio = int(52 * k)
        borda = int(9 * k)
        m, anel = _mascara(ch, raio, borda)
        rgb = crop
        if k > 0.35:
            rgb = crop.copy()
            rgb[anel > 0] = self.cor
            b = self._badge(ci)
            bh, bw = b.shape[:2]
            x1, y1 = 1080 - bw - 46, 44
            a = (b[..., 3:4].astype(np.float32) / 255.0) * min(1.0, (k - 0.35) / 0.4)
            reg = rgb[y1:y1 + bh, x1:x1 + bw].astype(np.float32)
            rgb[y1:y1 + bh, x1:x1 + bw] = (reg * (1 - a) + b[..., :3].astype(np.float32) * a).astype(np.uint8)
        rgba = np.dstack([rgb, m])
        hw = (540 + (CARD_W / 2 - 540) * k) * esc
        hh = (960 + (CARD_H / 2 - 960) * k) * esc
        cx = W / 2 + tx
        cy = 960 + (CARD_CY - 960) * k
        ry, rx = math.radians(rot_y), math.radians(rot_x)
        dst = []
        for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            x, y = sx * hw, sy * hh
            X, Z = x * math.cos(ry), x * math.sin(ry)
            Y, Z2 = y * math.cos(rx), y * math.sin(rx)
            Z = Z + Z2
            s = F_CAM / (F_CAM + Z)
            dst.append((cx + X * s, cy + Y * s))
        dst = np.array(dst, np.float32)
        src = np.array([[0, 0], [1080, 0], [1080, ch], [0, ch]], np.float32)
        # regiao de interesse (com folga para a sombra)
        mg = 70
        bx0, by0 = int(max(0, dst[:, 0].min() - mg)), int(max(0, dst[:, 1].min() - mg))
        bx1, by1 = int(min(W, dst[:, 0].max() + mg)), int(min(H, dst[:, 1].max() + mg + 30))
        if bx1 - bx0 < 4 or by1 - by0 < 4:
            return
        T = np.array([[1, 0, -bx0], [0, 1, -by0], [0, 0, 1]], np.float64)
        M = T @ cv2.getPerspectiveTransform(src, dst).astype(np.float64)
        warp = cv2.warpPerspective(rgba, M, (bx1 - bx0, by1 - by0), flags=cv2.INTER_LINEAR,
                                   borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        alfa = warp[..., 3]
        roi = saida[by0:by1, bx0:bx1]
        if sombra and k > 0.05:
            sh = cv2.GaussianBlur(alfa, (0, 0), 22)
            sh = np.roll(sh, 26, axis=0)
            roi[:] = cv2.convertScaleAbs(roi.astype(np.float32) * (1 - 0.6 * (sh.astype(np.float32) / 255.0)[..., None] * k))
        a = (alfa.astype(np.float32) / 255.0)[..., None]
        roi[:] = (roi.astype(np.float32) * (1 - a) + warp[..., :3].astype(np.float32) * a).astype(np.uint8)

    @staticmethod
    def _fundo(tex):
        pequeno = cv2.resize(tex, (36, 64), interpolation=cv2.INTER_AREA)
        g = cv2.resize(pequeno, (W, H), interpolation=cv2.INTER_CUBIC)
        return cv2.convertScaleAbs(g, alpha=0.42, beta=0)

    def compor(self, frame, ci, t, t_ini_cena):
        """frame: imagem 1080x1920 ja tratada (cor, vinheta). Devolve o quadro final do modo POV."""
        if ci != self.ci:
            self.prev, self.prev_modo = self.last, (self.modos[self.ci] if self.ci >= 0 else None)
            self.ci = ci
        modo = self.modos[ci]
        tt = t - t_ini_cena
        p = _ease(tt / DUR_TRANS) if tt < DUR_TRANS else 1.0
        self.last = frame.copy()
        prev_modo, prev = self.prev_modo, self.prev
        emtrans = tt < DUR_TRANS and prev is not None

        sway_y = 6.5 * math.sin(2 * math.pi * t / 7.0 + ci)
        sway_x = 2.5 * math.sin(2 * math.pi * t / 5.0 + ci * 0.7)

        # 3D -> 3D: corte seco (o render ja faz flash/glitch)
        if modo == "3d" and (not emtrans or prev_modo == "3d"):
            return frame

        out = self._fundo(frame)
        if modo == "slide" and emtrans and prev_modo == "slide":
            # slide empurra slide, girando em 3D
            self._camada(out, prev, ci - 1, 1.0, tx=-p * W * 1.05, rot_y=44 * p, rot_x=0)
            self._camada(out, frame, ci, 1.0, tx=(1 - p) * W * 1.05, rot_y=-44 * (1 - p) + sway_y * p, rot_x=sway_x * p)
            v = math.sin(math.pi * min(1.0, tt / DUR_TRANS))
            kb = int(1 + 70 * v) | 1
            if kb > 3:
                out = cv2.blur(out, (kb, 1))
            return out
        if modo == "slide" and emtrans and prev_modo == "3d":
            # tela cheia encolhe e vira slide (com giro)
            e = _ease_io(tt / DUR_TRANS)
            self._camada(out, frame, ci, e, rot_y=sway_y * e + 26 * math.sin(math.pi * e) * (-1 if ci % 2 else 1),
                         rot_x=sway_x * e, esc=1.0 + 0.04 * math.sin(math.pi * e))
            return out
        if modo == "3d" and emtrans and prev_modo == "slide":
            # slide cresce ate virar tela cheia
            e = 1 - _ease_io(tt / DUR_TRANS)
            self._camada(out, frame, ci, e, rot_y=sway_y * e - 20 * math.sin(math.pi * e) * (-1 if ci % 2 else 1),
                         rot_x=sway_x * e, esc=1.0)
            return out
        # slide em regime
        self._camada(out, frame, ci, 1.0, rot_y=sway_y, rot_x=sway_x)
        return out

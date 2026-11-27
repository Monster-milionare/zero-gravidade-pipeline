"""TIC, o mascote do Plano B da Historia: um viajante do tempo fofinho com
relogio na barriga. 100% original (formas desenhadas em codigo), com
sombreamento/brilho pra dar volume 3D, boca sincronizada com a fala, piscar,
bracos que acenam e emocoes (neutro, feliz, surpreso, preocupado)."""
import math
from functools import lru_cache

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

LW, LH = 360, 470
OUT = (24, 20, 40, 255)
TEAL = (70, 198, 206)
TEAL_ESC = (36, 140, 160)
TEAL_CLARO = (150, 238, 240)
BARRIGA = (255, 244, 214)
BOTA = (255, 150, 60)
BOTA_ESC = (200, 100, 30)
OURO = (250, 200, 70)
ROSA = (255, 130, 150)
BRANCO = (255, 255, 255)
BOCA = (96, 28, 44)
LINGUA = (240, 100, 120)


class _P:
    def __init__(self, k):
        self.k = k
        self.im = Image.new("RGBA", (int(LW * k), int(LH * k)), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def pt(self, x, y):
        return (x * self.k, y * self.k)

    def elipse(self, cx, cy, rx, ry, cor, contorno=0):
        k = self.k
        if contorno:
            self.d.ellipse([(cx - rx - contorno) * k, (cy - ry - contorno) * k,
                            (cx + rx + contorno) * k, (cy + ry + contorno) * k], fill=OUT)
        self.d.ellipse([(cx - rx) * k, (cy - ry) * k, (cx + rx) * k, (cy + ry) * k], fill=cor)

    def capsula(self, p0, p1, larg, cor, contorno=6):
        for l, c in ((larg + 2 * contorno, OUT), (larg, cor)):
            self.d.line([self.pt(*p0), self.pt(*p1)], fill=c, width=max(1, int(l * self.k)))
            for (x, y) in (p0, p1):
                r = l / 2
                self.d.ellipse([*self.pt(x - r, y - r), *self.pt(x + r, y + r)], fill=c)


@lru_cache(maxsize=16)
def _grade_luz(h, w, cx, cy, r, k, forca):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    lx, ly = cx * k - r * k * 0.35, cy * k - r * k * 0.4
    dist = np.sqrt((xx - lx) ** 2 + (yy - ly) ** 2) / (r * k * 1.5)
    luz = np.clip(1.12 - dist * forca * 1.35, 0.62, 1.18)
    dentro = ((xx - cx * k) ** 2 + (yy - cy * k) ** 2) < (r * k) ** 2
    return luz.astype(np.float32), dentro


def _sombrear(im: Image.Image, cx, cy, r, k, forca=0.55):
    """Aplica gradiente radial (luz vindo de cima-esquerda) so onde ha pixel
    opaco dentro do circulo -> volume 3D."""
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    luz, dentro = _grade_luz(h, w, float(cx), float(cy), float(r), k, forca)
    cor = a[:, :, :3]
    mask = (a[:, :, 3] > 200) & dentro
    # so recolore pixels que nao sao contorno escuro
    claro = cor.sum(axis=2) > 150
    m = (mask & claro)[:, :, None]
    cor2 = np.where(m, np.clip(cor * luz[:, :, None], 0, 255), cor)
    a[:, :, :3] = cor2
    return Image.fromarray(a.astype(np.uint8), "RGBA")


@lru_cache(maxsize=4)
def _sombra(size, k):
    sh = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([70 * k, 440 * k, 290 * k, 466 * k], fill=(0, 0, 0, 90))
    return sh.filter(ImageFilter.GaussianBlur(6 * k))


@lru_cache(maxsize=1024)
def _sprite(boca: int, olhar: int, piscar: int, emocao: str, braco_e: int, braco_d: int,
            bob: int, minuto: int, altura: int) -> Image.Image:
    k = 2
    p = _P(k)
    # sombra no chao
    p.im.alpha_composite(_sombra(p.im.size, k))

    sy = -bob * 0.5  # sobe/desce o corpo
    # pernas + botas
    for x in (140, 220):
        p.capsula((x, 380 + sy), (x, 428), 34, TEAL_ESC)
        p.elipse(x + (6 if x > 180 else -6), 438, 30, 17, BOTA, 6)
        p.elipse(x + (6 if x > 180 else -6) - 8, 432, 12, 5, (255, 200, 140))
    # bracos (atras do corpo)
    def braco(lado, ang):
        ox = 82 if lado < 0 else 278
        oy = 280 + sy
        a = math.radians(ang)
        ex, ey = ox + lado * 58 * math.cos(a) , oy + 58 * math.sin(a) * (-1 if ang > 0 else 1) * 0 - 58 * math.sin(a)
        p.capsula((ox, oy), (ex, ey), 30, TEAL_ESC)
        p.elipse(ex, ey, 22, 22, TEAL_CLARO, 5)
    braco(-1, braco_e - 40)
    braco(+1, braco_d - 40)

    # corpo (barriga redonda)
    p.elipse(180, 300 + sy, 108, 112, TEAL, 8)
    # barriga-relogio
    p.elipse(180, 318 + sy, 66, 66, BARRIGA, 6)
    for i in range(12):
        a = i * math.pi / 6
        r0, r1 = 52, 60 if i % 3 else 56
        p.d.line([p.pt(180 + r0 * math.sin(a), 318 + sy - r0 * math.cos(a)),
                  p.pt(180 + r1 * math.sin(a), 318 + sy - r1 * math.cos(a))], fill=OUT, width=int(3 * k))
    am = math.radians(minuto * 6)
    ah = math.radians(minuto * 0.5 + 40)
    p.d.line([p.pt(180, 318 + sy), p.pt(180 + 48 * math.sin(am), 318 + sy - 48 * math.cos(am))], fill=OUT, width=int(5 * k))
    p.d.line([p.pt(180, 318 + sy), p.pt(180 + 32 * math.sin(ah), 318 + sy - 32 * math.cos(ah))], fill=(200, 60, 60, 255), width=int(6 * k))
    p.elipse(180, 318 + sy, 6, 6, OUT)

    # cabeca
    hy = 172 + sy
    p.elipse(180, hy, 112, 100, TEAL, 8)
    # engrenagem dourada no topo (chapeuzinho)
    gx, gy = 180, hy - 112
    p.elipse(gx, gy + 6, 30, 22, OURO, 5)
    for i in range(8):
        a = i * math.pi / 4
        p.elipse(gx + 34 * math.cos(a), gy + 6 + 25 * math.sin(a), 8, 8, OURO, 3)
    p.elipse(gx, gy + 6, 12, 9, (255, 236, 160))

    # olhos
    for ex in (140, 220):
        ey = hy - 6
        if piscar:
            p.d.line([p.pt(ex - 26, ey + 4), p.pt(ex + 26, ey + 4)], fill=OUT, width=int(8 * k))
        else:
            rx, ry = 30, 36 if emocao != "surpreso" else 42
            p.elipse(ex, ey, rx, ry, BRANCO, 6)
            px = ex + (olhar - 1) * 9
            pr = 17 if emocao != "surpreso" else 12
            p.elipse(px, ey + 4, pr, pr + 2, OUT)
            p.elipse(px - 5, ey - 4, 6, 6, BRANCO)
    # sobrancelhas
    for lado, ex in ((-1, 140), (1, 220)):
        by = hy - 56
        if emocao == "feliz":
            a0, a1 = (ex - 24, by + 4), (ex + 24, by - 6 * lado * 0 - 2)
        elif emocao == "preocupado":
            a0, a1 = (ex - 24 * lado * -1 * 0 - 24, by + (10 if lado < 0 else -4)), (ex + 24, by + (-4 if lado < 0 else 10))
        elif emocao == "surpreso":
            a0, a1 = (ex - 22, by - 12), (ex + 22, by - 12)
        else:
            a0, a1 = (ex - 22, by), (ex + 22, by - 2)
        p.d.line([p.pt(*a0), p.pt(*a1)], fill=OUT, width=int(8 * k))
    # bochechas
    p.elipse(100, hy + 34, 17, 11, ROSA)
    p.elipse(260, hy + 34, 17, 11, ROSA)
    # boca
    mx, my = 180, hy + 44
    ab = boca / 4.0
    if emocao == "surpreso" and ab < 0.3:
        ab = 0.45
    if ab < 0.12:
        if emocao == "preocupado":
            p.d.arc([*p.pt(mx - 26, my - 4), *p.pt(mx + 26, my + 26)], 200, 340, fill=OUT, width=int(7 * k))
        else:
            p.d.arc([*p.pt(mx - 28, my - 16), *p.pt(mx + 28, my + 14)], 20, 160, fill=OUT, width=int(7 * k))
    else:
        rx, ry = 26 + 6 * ab, 8 + 30 * ab
        p.elipse(mx, my + ry * 0.35, rx, ry, BOCA, 6)
        if ab > 0.4:
            p.elipse(mx, my + ry * 0.35 + ry * 0.45, rx * 0.6, ry * 0.4, LINGUA)

    im = p.im
    im = _sombrear(im, 180, 300 + sy, 108, k)
    im = _sombrear(im, 180, hy, 112, k)
    # brilho especular
    spec = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(spec)
    sd.ellipse([100 * k, (hy - 78) * k, 148 * k, (hy - 52) * k], fill=(255, 255, 255, 110))
    sd.ellipse([86 * k, (hy - 36) * k, 100 * k, (hy - 14) * k], fill=(255, 255, 255, 70))
    im.alpha_composite(spec)
    # borda de luz (rim) clara pra destacar do fundo
    alpha = np.asarray(im.getchannel("A"))
    rim = cv2.dilate(alpha, np.ones((7, 7), np.uint8))
    rim = cv2.GaussianBlur(rim, (0, 0), 4 * k).astype(np.uint8) // 3
    halo = np.zeros((*alpha.shape, 4), np.uint8)
    halo[:, :, 0], halo[:, :, 1], halo[:, :, 2], halo[:, :, 3] = 255, 235, 180, rim
    base = Image.fromarray(halo, "RGBA")
    base.alpha_composite(im)
    w = int(LW * altura / LH)
    return base.resize((w, altura), Image.LANCZOS)


def sprite(t: float, boca: float, fala: bool, emocao: str = "neutro", altura: int = 470, ritmo: float = 1.0):
    """t = segundos; boca em [0,1]. Devolve imagem RGBA do Tic naquele instante."""
    bo = int(round(max(0.0, min(1.0, boca)) * 4))
    bob = int(round(math.sin(t * 6.0 * ritmo) * 6 + (4 if fala else 0) * math.sin(t * 11)))
    ciclo = t % 3.4
    piscar = 1 if ciclo > 3.25 else 0
    olhar = 1 + (1 if math.sin(t * 0.9) > 0.6 else (-1 if math.sin(t * 0.9) < -0.6 else 0))
    acenar = 38 + int(34 * math.sin(t * 9)) if emocao == "feliz" else 34 + int(8 * math.sin(t * 3))
    be = acenar
    bd = 20 + int(10 * math.sin(t * 4 + 1))
    minuto = int((t * 6) % 60)
    return _sprite(bo, olhar, piscar, emocao, be // 12 * 12, bd // 12 * 12, bob // 4 * 4, minuto // 6 * 6, altura)

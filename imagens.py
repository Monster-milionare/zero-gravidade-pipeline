"""Imagens 100% gratis para cada cena.
Ordem: cache -> Wikimedia Commons (so dominio publico/CC0, quando a cena pede
'wiki:termo') -> Pollinations (ilustracao gerada, sem chave) -> arte
procedural (nunca falha; ja nasce com profundidade real)."""
import hashlib
import io
import math
import random
import re
import time
import urllib.parse

import cv2
import numpy as np
import requests

import config

UA = {"User-Agent": "PlanoBDaHistoria/1.0 (canal educativo; contato.luard@gmail.com)"}
BASE_PROMPT = ("vertical composition, no text, no letters, no watermark, no logo, "
               "single clear subject in the foreground, depth, atmospheric perspective")


def _chave(texto: str) -> str:
    return hashlib.sha1(texto.encode("utf-8")).hexdigest()[:16]


def _decodificar(conteudo: bytes):
    arr = np.frombuffer(conteudo, np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None or bgr.shape[0] < 400 or bgr.shape[1] < 250:
        return None
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    if rgb.std() < 6:      # imagem vazia/lisa
        return None
    return rgb


_FALHAS_SEGUIDAS = 0
_ULTIMA = {}


def _pollinations(prompt: str, seed: int):
    global _FALHAS_SEGUIDAS
    if _FALHAS_SEGUIDAS >= 3:      # servico fora do ar: nao perde tempo
        return None
    r = _pollinations_tenta(prompt, seed)
    _FALHAS_SEGUIDAS = 0 if r is not None else _FALHAS_SEGUIDAS + 1
    return r


def _pollinations_tenta(prompt: str, seed: int):
    q = urllib.parse.quote(prompt[:900])
    for modelo in ("flux", "turbo"):
        url = (f"https://image.pollinations.ai/prompt/{q}?width=768&height=1344"
               f"&seed={seed}&nologo=true&model={modelo}")
        for tentativa in range(2):
            try:
                r = requests.get(url, headers=UA, timeout=75)
                if r.status_code == 200 and r.headers.get("content-type", "").startswith("image"):
                    rgb = _decodificar(r.content)
                    if rgb is not None:
                        # corta a faixa de baixo (marca d'agua do servico)
                        return rgb[: int(rgb.shape[0] * 0.93)]
            except Exception as exc:
                print(f"[img] pollinations {modelo}: {str(exc)[:70]}", flush=True)
            time.sleep(3 + 4 * tentativa)
    return None


def _wikimedia(termo: str):
    """So aceita licencas livres de atribuicao (dominio publico / CC0)."""
    try:
        r = requests.get("https://commons.wikimedia.org/w/api.php", headers=UA, timeout=30, params={
            "action": "query", "generator": "search", "gsrsearch": termo, "gsrnamespace": 6,
            "gsrlimit": 12, "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime",
            "iiurlwidth": 1400, "format": "json"})
        paginas = list(r.json().get("query", {}).get("pages", {}).values())
        for p in sorted(paginas, key=lambda x: x.get("index", 99)):
            ii = (p.get("imageinfo") or [{}])[0]
            lic = (ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", "") or "").lower()
            if not (lic.startswith("public domain") or lic in ("pd", "cc0", "cc-zero") or lic.startswith("pd-")):
                continue
            if ii.get("mime") not in ("image/jpeg", "image/png"):
                continue
            url = ii.get("thumburl") or ii.get("url")
            img = requests.get(url, headers=UA, timeout=60)
            rgb = _decodificar(img.content) if img.status_code == 200 else None
            if rgb is not None:
                return rgb
    except Exception as exc:
        print(f"[img] wikimedia: {str(exc)[:70]}", flush=True)
    return None


# ----------------------------------------------------------- arte procedural

_PALETAS = {
    "epico": [((255, 170, 70), (120, 40, 70), (20, 18, 40))],
    "sepia": [((236, 200, 150), (150, 100, 60), (40, 28, 20))],
    "neon": [((255, 60, 200), (60, 30, 140), (8, 6, 30))],
    "noir": [((220, 220, 220), (110, 110, 120), (14, 14, 18))],
    "aquarela": [((255, 214, 140), (120, 200, 190), (40, 90, 120))],
}


def _grad(h, w, c0, c1):
    t = np.linspace(0, 1, h, dtype=np.float32)[:, None, None]
    return (np.array(c0, np.float32) * (1 - t) + np.array(c1, np.float32) * t) * np.ones((1, w, 1), np.float32)


def _cordilheira(w, h, base, amp, rng, n=7):
    xs = np.linspace(0, w, n * 3)
    ys = base + np.cumsum(rng.uniform(-amp, amp, len(xs))) * 0.6
    ys = base + (ys - ys.mean()) + np.sin(xs / w * rng.uniform(3, 7)) * amp * 0.5
    pts = np.array([[0, h]] + list(zip(xs, ys)) + [[w, h]], np.int32)
    return pts


def arte_procedural(prompt: str, estilo: str = "epico", seed: int = 0):
    """Devolve (rgb, depth) 768x1344 com camadas (ceu, montanhas, silhueta, neblina)."""
    rng = np.random.default_rng(int(_chave(prompt + str(seed)), 16) % (2 ** 32))
    w, h = 768, 1344
    c_top, c_mid, c_bot = _PALETAS.get(estilo, _PALETAS["epico"])[0]
    img = _grad(h, w, c_bot, c_mid)
    img[: int(h * 0.55)] = _grad(int(h * 0.55), w, c_bot, c_top)[::-1] * 0.0 + _grad(int(h * 0.55), w, c_bot, c_top)
    dep = np.zeros((h, w), np.float32)
    # sol/lua com brilho
    sx, sy, sr = int(rng.uniform(0.25, 0.75) * w), int(h * rng.uniform(0.28, 0.42)), int(w * rng.uniform(0.1, 0.17))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    glow = np.exp(-(((xx - sx) ** 2 + (yy - sy) ** 2) / (2 * (sr * 2.6) ** 2)))
    img += glow[:, :, None] * np.array(c_top, np.float32) * 0.55
    cv2.circle(img, (sx, sy), sr, (255, 245, 220), -1, cv2.LINE_AA)
    # estrelas/particulas
    for _ in range(80):
        cv2.circle(img, (int(rng.uniform(0, w)), int(rng.uniform(0, h * 0.5))), int(rng.integers(1, 3)),
                   (255, 255, 240), -1, cv2.LINE_AA)
    p = prompt.lower()
    camadas = [(0.52, 130, 0.18, 0.25), (0.60, 150, 0.42, 0.5), (0.72, 120, 0.7, 0.8)]
    for i, (base, amp, prof, esc) in enumerate(camadas):
        pts = _cordilheira(w, h, h * base, amp * 0.6, rng)
        cor = np.array(c_bot, np.float32) * (0.35 + 0.35 * i) + np.array(c_mid, np.float32) * (0.5 - 0.15 * i)
        cv2.fillPoly(img, [pts], tuple(float(v) for v in cor), cv2.LINE_AA)
        cv2.fillPoly(dep, [pts], prof, cv2.LINE_AA)
        neb = _grad(h, w, (0, 0, 0), (0, 0, 0))
    # motivos por palavra-chave (silhuetas em primeiro plano)
    fg = np.zeros((h, w), np.uint8)
    cx = int(rng.uniform(0.3, 0.7) * w)
    base_y = int(h * 0.80)
    if re.search(r"ship|navi|fleet|caravel|boat|sea|ocean|armada", p):
        cv2.fillPoly(fg, [np.array([[cx - 230, base_y], [cx + 230, base_y], [cx + 160, base_y + 70], [cx - 170, base_y + 70]], np.int32)], 255)
        cv2.rectangle(fg, (cx - 6, base_y - 380), (cx + 6, base_y), 255, -1)
        cv2.fillPoly(fg, [np.array([[cx + 10, base_y - 360], [cx + 190, base_y - 150], [cx + 10, base_y - 120]], np.int32)], 255)
        cv2.fillPoly(fg, [np.array([[cx - 10, base_y - 320], [cx - 150, base_y - 130], [cx - 10, base_y - 110]], np.int32)], 255)
    elif re.search(r"rome|roman|legion|colosse|empire|temple|greek|column", p):
        for i in range(5):
            x = int(w * (0.12 + i * 0.19))
            cv2.rectangle(fg, (x - 28, base_y - 480), (x + 28, base_y + 80), 255, -1)
            cv2.rectangle(fg, (x - 44, base_y - 510), (x + 44, base_y - 480), 255, -1)
        cv2.rectangle(fg, (0, base_y - 560), (w, base_y - 510), 255, -1)
    elif re.search(r"rocket|apollo|moon|space|astronaut|lunar", p):
        cv2.ellipse(fg, (cx, base_y - 200), (60, 250), 0, 0, 360, 255, -1)
        cv2.fillPoly(fg, [np.array([[cx - 60, base_y - 40], [cx - 130, base_y + 70], [cx - 40, base_y + 20]], np.int32)], 255)
        cv2.fillPoly(fg, [np.array([[cx + 60, base_y - 40], [cx + 130, base_y + 70], [cx + 40, base_y + 20]], np.int32)], 255)
    elif re.search(r"city|internet|computer|tech|skyscraper|london|rio|paris|street", p):
        for i in range(9):
            x0 = int(i * w / 8.5) - 20
            bh = int(rng.uniform(220, 640))
            cv2.rectangle(fg, (x0, base_y - bh), (x0 + int(w / 8.5) - 6, base_y + 100), 255, -1)
    elif re.search(r"soldier|army|battle|napoleon|war|knight|general", p):
        for i in range(7):
            x = int(w * (0.1 + i * 0.13))
            cv2.circle(fg, (x, base_y - 210), 26, 255, -1)
            cv2.rectangle(fg, (x - 30, base_y - 184), (x + 30, base_y + 60), 255, -1)
            cv2.line(fg, (x + 40, base_y - 260), (x + 40, base_y + 50), 255, 8)
    else:
        for i in range(6):
            x = int(rng.uniform(0, w))
            th = int(rng.uniform(260, 560))
            cv2.fillPoly(fg, [np.array([[x - 50, base_y + 60], [x, base_y - th], [x + 50, base_y + 60]], np.int32)], 255)
    cv2.rectangle(fg, (0, base_y + 40), (w, h), 255, -1)
    fg_b = cv2.GaussianBlur(fg, (0, 0), 1.2).astype(np.float32) / 255
    cor_fg = np.array(c_bot, np.float32) * 0.45
    img = img * (1 - fg_b[:, :, None]) + cor_fg * fg_b[:, :, None]
    dep = np.maximum(dep, fg_b * 0.92)
    # neblina volumetrica entre camadas
    neb = np.exp(-((yy - h * 0.66) / (h * 0.08)) ** 2)[:, :, None] * np.array(c_mid, np.float32) * 0.22
    img += neb
    # vinheta suave
    img = np.clip(img, 0, 255).astype(np.uint8)
    dep = cv2.GaussianBlur(dep, (0, 0), 2.0)
    return img, np.clip(dep, 0, 1).astype(np.float32)


def obter(visual: str, estilo, seed: int):
    """visual: prompt (ou 'wiki:termo'). Devolve (rgb, depth_ou_None, origem)."""
    arq = config.CACHE_DIR / f"{_chave(visual + estilo.nome + str(seed))}.png"
    if arq.exists():
        bgr = cv2.imread(str(arq))
        if bgr is not None:
            return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB), None, "cache"
    rgb = None
    origem = ""
    if visual.lower().startswith("wiki:"):
        rgb = _wikimedia(visual[5:].strip())
        origem = "wikimedia"
        if rgb is None:
            visual = visual[5:].strip()
    if rgb is None:
        prompt = f"{visual}, {estilo.estilo_img}, {BASE_PROMPT}"
        rgb = _pollinations(prompt, seed)
        origem = "pollinations"
        if rgb is None:     # 2a chance: prompt curto e outra semente
            curto = " ".join(visual.split()[:7])
            rgb = _pollinations(f"{curto}, {estilo.estilo_img}, vertical", seed + 7919)
            origem = "pollinations-curto"
    if rgb is not None:
        _ULTIMA["rgb"] = rgb
        cv2.imwrite(str(arq), cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
        return rgb, None, origem
    if _ULTIMA.get("rgb") is not None:   # reaproveita a imagem anterior (camera diferente)
        return _ULTIMA["rgb"], None, "reuso"
    rgb, dep = arte_procedural(visual, estilo.grade, seed)
    return rgb, dep, "procedural"

"""Thumbnail chamativa 1280x720 (alto contraste, texto gigante, Tic reagindo, cor do estilo)."""
import re
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import config
import estilos
import imagens
import mascote

TW, TH = 1280, 720
FONTE = config.ASSETS_DIR / "fontes" / "Anton-Regular.ttf"
PALAVRAS_FRACAS = {"de", "da", "do", "das", "dos", "o", "a", "os", "as", "um", "uma", "em", "no", "na", "que", "e", "se",
                   "tivesse", "sido", "para", "por", "com", "ao", "ou"}

CORES = {  # (texto forte, texto 2, faixa)
    "epico": ((255, 214, 10), (255, 255, 255), (214, 40, 40)),
    "sepia": ((255, 200, 60), (255, 255, 255), (190, 60, 30)),
    "neon": ((60, 255, 240), (255, 255, 255), (255, 40, 160)),
    "noir": ((255, 255, 255), (255, 214, 10), (200, 30, 30)),
    "aquarela": ((255, 230, 60), (255, 255, 255), (230, 70, 90)),
}


def _fonte(tam):
    return ImageFont.truetype(str(FONTE), tam)


def texto_gancho(c: dict) -> str:
    """Frase curta (2-4 palavras) para a thumbnail. Usa c['thumb_texto'] se existir."""
    if c.get("thumb_texto"):
        return c["thumb_texto"].upper()
    t = re.sub(r"^(POV:|Você acorda em|Você é|E se|Quem venceria:)\s*", "", c["titulo"], flags=re.I).rstrip("?!. ")
    fortes = [w for w in t.split() if w.lower() not in PALAVRAS_FRACAS]
    return " ".join(fortes[:4]).upper() + ("?" if c.get("formato") == "e-se" else "")


def _quebrar(texto: str, max_chars: int):
    linhas, atual = [], ""
    for w in texto.split():
        if atual and len(atual) + 1 + len(w) > max_chars:
            linhas.append(atual)
            atual = w
        else:
            atual = (atual + " " + w).strip()
    if atual:
        linhas.append(atual)
    return linhas


def _linhas(texto: str, max_chars=11):
    """Quebra o gancho em ate 3 linhas SEM perder palavras (antes cortava o fim: 'CANCELOU A' em vez de '...A LUA')."""
    for mc in (max_chars, 13, 15, 18, 22):
        ls = _quebrar(texto, mc)
        if len(ls) <= 3:
            return ls
    palavras = texto.split()
    return _quebrar(" ".join(palavras[:5]), 22)[:3]


def _imagem_base(c: dict, estilo, idx_cena: int):
    from render import hash_seed
    cena = c["cenas"][idx_cena]
    rgb, _dep, _o = imagens.obter(cena["visuais"][0], estilo, seed=hash_seed(c["id"], idx_cena, 0))
    h, w = rgb.shape[:2]
    alvo_h = int(w * TH / TW)
    y0 = int(max(0, min(h - alvo_h, h * 0.18)))
    faixa = rgb[y0:y0 + alvo_h]
    g = cv2.resize(faixa, (TW, TH), interpolation=cv2.INTER_CUBIC)
    # sat + contraste + nitidez
    hsv = cv2.cvtColor(g, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.35, 0, 255)
    g = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    g = cv2.convertScaleAbs(g, alpha=1.18, beta=-14)
    blur = cv2.GaussianBlur(g, (0, 0), 3)
    return cv2.addWeighted(g, 1.6, blur, -0.6, 0)


def _duracao(video: Path) -> float:
    import subprocess
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                       capture_output=True, text=True, timeout=60)
    return float(r.stdout.strip())


def _nota_quadro(img: np.ndarray) -> float:
    """Cor viva + detalhe + brilho medio (evita quadros pretos, lavados ou sem nada)."""
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    detalhe = min(cv2.Laplacian(g, cv2.CV_64F).var() / 400.0, 1.5)
    r, gg, b = [img[..., i].astype(np.float32) for i in range(3)]
    rg, yb = r - gg, 0.5 * (r + gg) - b
    cor = min((np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)) / 80.0, 1.5)
    br = g.mean() / 255.0
    luz = 1.0 - min(abs(br - 0.42) / 0.42, 1.0)
    return 1.0 * detalhe + 1.2 * cor + 1.5 * luz


def _quadro_do_video(video: Path):
    """Melhor quadro do proprio video (cena coerente com o assunto), recortado para 16:9 sem a faixa das legendas."""
    import subprocess
    dur = _duracao(video)
    melhor, nota_m = None, -1.0
    for frac in (0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84):
        tmp = config.OUT_DIR / "_thumb_quadro.png"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{dur * frac:.2f}", "-i", str(video), "-frames:v", "1", str(tmp)],
                       check=True, timeout=120)
        img = cv2.cvtColor(cv2.imread(str(tmp)), cv2.COLOR_BGR2RGB)
        h, w = img.shape[:2]
        if w >= h:                      # horizontal: tira ~16% de baixo (legenda) e centraliza em 16:9
            h2 = int(h * 0.84)
            w2 = min(w, int(h2 * 16 / 9))
            x0 = (w - w2) // 2
            rec = img[:h2, x0:x0 + w2]
        else:                           # vertical (Short): faixa 16:9 do miolo
            h2 = int(w * 9 / 16)
            y0 = int(h * 0.22)
            rec = img[y0:y0 + h2]
        n = _nota_quadro(rec)
        if n > nota_m:
            melhor, nota_m = rec, n
    g = cv2.resize(melhor, (TW, TH), interpolation=cv2.INTER_CUBIC)
    hsv = cv2.cvtColor(g, cv2.COLOR_RGB2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.25, 0, 255)
    g = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)
    g = cv2.convertScaleAbs(g, alpha=1.15, beta=-8)
    blur = cv2.GaussianBlur(g, (0, 0), 3)
    return cv2.addWeighted(g, 1.5, blur, -0.5, 0)


def _gerar_vertical(c: dict, estilo_nome: str, saida: Path, video: Path) -> Path:
    """Capa 1080x1920 dos Shorts. A capa deitada era recortada no meio pelo YouTube e o texto saia cortado."""
    import subprocess
    W, H = 1080, 1920
    cor1, cor2, cor_faixa = CORES.get(estilo_nome, CORES["epico"])
    dur = _duracao(video)
    melhor, nota_m = None, -1.0
    for frac in (0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84):
        tmp = config.OUT_DIR / "_thumb_quadro.png"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{dur * frac:.2f}", "-i", str(video), "-frames:v", "1", str(tmp)],
                       check=True, timeout=120)
        img = cv2.cvtColor(cv2.imread(str(tmp)), cv2.COLOR_BGR2RGB)
        n = _nota_quadro(img[int(img.shape[0] * 0.3):int(img.shape[0] * 0.85)])
        if n > nota_m:
            melhor, nota_m = img, n
    g = cv2.resize(melhor, (W, H), interpolation=cv2.INTER_CUBIC)
    g = cv2.convertScaleAbs(g, alpha=1.15, beta=-8)
    # topo escurecido: o texto estoura e a legenda do proprio quadro some atras dele
    sombra = np.interp(np.arange(H), [0, 800, 1050, H], [0.22, 0.30, 1.0, 1.0]).astype(np.float32)[:, None, None]
    im = Image.fromarray((g.astype(np.float32) * sombra).astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(im)
    rotulo = {"e-se": "E SE...?", "voce-acorda": "VOCÊ ACORDA EM...", "quem-venceria": "QUEM VENCERIA?", "pov": "POV",
              "escolha": "VOCÊ ESCOLHE", "futuro": "VOCÊ ACORDA NO FUTURO"}.get(c.get("formato", ""), "PLANO B")
    f_r = _fonte(60)
    larg = d.textlength(rotulo, font=f_r) + 64
    d.rounded_rectangle([(W - larg) / 2, 230, (W + larg) / 2, 330], 18, fill=cor_faixa + (255,), outline=(255, 255, 255, 255), width=5)
    d.text((W / 2, 280), rotulo, font=f_r, anchor="mm", fill=(255, 255, 255, 255))
    y = 380
    for i, ln in enumerate(_linhas(texto_gancho(c), 10)):
        f = _fonte(210)
        larg = d.textlength(ln, font=f)
        if larg > 940:
            f = _fonte(int(210 * 940 / larg))
        d.text((W / 2, y), ln, font=f, anchor="ma", fill=(cor1 if i % 2 == 0 else cor2) + (255,),
               stroke_width=14, stroke_fill=(8, 6, 16, 255))
        y += int(f.size * 1.14)
    spr = mascote.sprite(1.3, 0.6, True, "surpreso", altura=460)
    im.alpha_composite(spr, ((W - spr.width) // 2, H - spr.height - 200))
    saida.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(saida, quality=90)
    return saida


def gerar(c: dict, estilo_nome: str, saida: Path, video=None) -> Path:
    if c.get("formato") != "longo" and video and Path(video).exists():
        try:
            return _gerar_vertical(c, estilo_nome, saida, Path(video))
        except Exception as exc:
            print(f"[thumb] capa vertical falhou ({str(exc)[:80]}): usando a deitada", flush=True)
    estilo = estilos.ESTILOS[estilo_nome]
    cor1, cor2, cor_faixa = CORES.get(estilo_nome, CORES["epico"])
    base = None
    if video and Path(video).exists():
        try:
            base = _quadro_do_video(Path(video))
        except Exception as exc:
            print(f"[thumb] quadro do video falhou ({str(exc)[:80]}): usando imagem do roteiro", flush=True)
    if base is None:
        # cena mais forte: a que tem 'surpreso' no meio do roteiro, senao a 2a
        cand = [i for i, x in enumerate(c["cenas"]) if x.get("emocao") == "surpreso" and i > 0] or [min(1, len(c["cenas"]) - 1)]
        base = _imagem_base(c, estilo, cand[0])
    # mascote e texto trocam de lado de video para video (o canal nao fica com cara de copia)
    esquerda = (sum(map(ord, c.get("id", ""))) % 2 == 1)

    # escurece a esquerda para o texto estourar
    grad = np.linspace(0.30, 1.0, TW, dtype=np.float32)[None, :, None]
    if esquerda:
        grad = grad[:, ::-1]
    base = (base.astype(np.float32) * grad).astype(np.uint8)
    vig = np.zeros((TH, TW), np.float32)
    cv2.ellipse(vig, (TW // 2, TH // 2), (int(TW * 0.75), int(TH * 0.85)), 0, 0, 360, 1, -1)
    vig = cv2.GaussianBlur(vig, (0, 0), 120)
    base = (base.astype(np.float32) * (0.55 + 0.45 * vig[..., None])).astype(np.uint8)
    im = Image.fromarray(base).convert("RGBA")
    d = ImageDraw.Draw(im)

    # faixa de formato (canto superior esquerdo)
    rotulo = {"e-se": "E SE...?", "voce-acorda": "VOCÊ ACORDA EM...", "quem-venceria": "QUEM VENCERIA?", "pov": "POV",
              "longo": c.get("thumb_selo") or "HISTÓRIA REAL", "escolha": "VOCÊ ESCOLHE"}.get(c.get("formato", ""), "PLANO B")
    f_r = _fonte(64)
    bb = d.textbbox((0, 0), rotulo, font=f_r)
    bx = 34 if not esquerda else TW - 34 - ((bb[2] - bb[0]) + 56)
    d.rounded_rectangle([bx, 30, bx + (bb[2] - bb[0]) + 56, 30 + 96], 18, fill=cor_faixa + (255,), outline=(255, 255, 255, 255), width=5)
    d.text((bx + 28 - bb[0], 30 + 48 - (bb[3] - bb[1]) // 2 - bb[1]), rotulo, font=f_r, fill=(255, 255, 255, 255))

    # texto gancho gigante
    linhas = _linhas(texto_gancho(c))
    tam = 210 if len(linhas) == 1 else 190 if len(linhas) == 2 else 150
    f = _fonte(tam)
    y = 170 if len(linhas) < 3 else 150
    camada = Image.new("RGBA", (TW, TH), (0, 0, 0, 0))
    dc = ImageDraw.Draw(camada)
    for i, ln in enumerate(linhas):
        cor = cor1 if i % 2 == 0 else cor2
        wln = dc.textlength(ln, font=f)
        if wln > 820:
            f2 = _fonte(int(tam * 820 / wln))
        else:
            f2 = f
        x = 40 if not esquerda else TW - 40 - int(min(wln, 820))
        dc.text((x + 8, y + 10), ln, font=f2, fill=(0, 0, 0, 200), stroke_width=14, stroke_fill=(0, 0, 0, 200))
        dc.text((x, y), ln, font=f2, fill=cor + (255,), stroke_width=12, stroke_fill=(8, 6, 16, 255))
        y += int(f2.size * 0.98)
    camada = camada.rotate(3, resample=Image.BICUBIC, center=(0, TH))
    im.alpha_composite(camada)

    # Tic grande, espantado, a direita
    from collections import Counter
    emos = Counter(x.get("emocao") for x in c["cenas"] if x.get("emocao") in ("preocupado", "misterioso", "feliz", "surpreso"))
    emo = emos.most_common(1)[0][0] if emos else "surpreso"
    if emo == "feliz":
        emo = "surpreso"                 # thumb com Tic feliz nao passa tensao
    spr = mascote.sprite(1.3, 0.6, True, emo, altura=560)
    im.alpha_composite(spr, ((TW - spr.width - 20) if not esquerda else 20, TH - spr.height - 6))

    # contorno externo claro para destacar no feed
    d2 = ImageDraw.Draw(im)
    d2.rectangle([0, 0, TW - 1, TH - 1], outline=cor1 + (255,), width=10)
    saida.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(saida, quality=92)
    return saida

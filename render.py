"""Motor de render do Plano B da Historia (Shorts/Reels 1080x1920).

Por video: voz (edge-tts) -> imagens por cena -> profundidade -> camera 2.5D
(parallax) com cortes rapidos -> grade de cor do estilo -> mascote Tic falando
-> legendas palavra a palavra com destaque -> carimbo de ano -> musica original.
"""
import math
import os
import random
import re
import subprocess
import wave
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

import config
import depth
import estilos
import imagens
import mascote
import musica
import musica_real
import parallax
import pov
import tts

W, H, FPS = config.W, config.H, config.FPS
FONTE = str(config.ASSETS_DIR / "fontes" / "Anton-Regular.ttf")
HANDLE = "@naofacaisso"   # NFI:handle


@lru_cache(maxsize=64)
def _fonte(tam: int):
    return ImageFont.truetype(FONTE, tam)


# ------------------------------------------------------------------ utilidades

def _blit(frame: np.ndarray, rgba: Image.Image, x: int, y: int, opac: float = 1.0):
    a = np.asarray(rgba)
    h, w = a.shape[:2]
    x0, y0 = max(x, 0), max(y, 0)
    x1, y1 = min(x + w, W), min(y + h, H)
    if x1 <= x0 or y1 <= y0:
        return
    sub = a[y0 - y:y1 - y, x0 - x:x1 - x]
    alfa = (sub[:, :, 3:4].astype(np.float32) / 255.0) * opac
    dst = frame[y0:y1, x0:x1].astype(np.float32)
    frame[y0:y1, x0:x1] = (dst * (1 - alfa) + sub[:, :, :3].astype(np.float32) * alfa).astype(np.uint8)


def _texto_contorno(texto: str, tam: int, cor, contorno=10, cor_contorno=(10, 8, 20)):
    f = _fonte(tam)
    bb = f.getbbox(texto)
    w, h = bb[2] - bb[0] + contorno * 4, bb[3] - bb[1] + contorno * 4
    im = Image.new("RGBA", (w, h + tam // 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.text((contorno * 2 - bb[0], contorno * 2 - bb[1]), texto, font=f, fill=cor + (255,),
           stroke_width=contorno, stroke_fill=cor_contorno + (255,))
    return im


@lru_cache(maxsize=512)
def _chunk_sprite(palavras: tuple, ativa: int, forte: tuple, alt, tam: int):
    """Imagem da legenda: palavras do bloco, a ATIVA em destaque (cor forte, maior)."""
    f = _fonte(tam)
    partes, larg_total, altura = [], 0, 0
    for i, p in enumerate(palavras):
        cor = forte if i == ativa else (alt if (alt and i % 2) else (255, 255, 255))
        t = tam if i != ativa else int(tam * 1.18)
        im = _texto_contorno(p.upper(), t, cor, contorno=max(8, tam // 11))
        partes.append(im)
        larg_total += im.width - 8
        altura = max(altura, im.height)
    canvas = Image.new("RGBA", (larg_total + 20, altura), (0, 0, 0, 0))
    x = 10
    for im in partes:
        canvas.alpha_composite(im, (x, altura - im.height))
        x += im.width - 8
    if canvas.width > W - 60:
        k = (W - 60) / canvas.width
        canvas = canvas.resize((int(canvas.width * k), int(canvas.height * k)), Image.LANCZOS)
    return canvas


@lru_cache(maxsize=64)
def _carimbo_ano(texto: str):
    im = _texto_contorno(texto, 210, (255, 232, 120), contorno=14, cor_contorno=(40, 14, 10))
    return im


@lru_cache(maxsize=16)
def _chip(texto: str, cor: tuple):
    f = _fonte(54)
    bb = f.getbbox(texto)
    w, h = bb[2] - bb[0] + 70, 96
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=40, fill=cor + (245,), outline=(10, 8, 20, 255), width=6)
    d.text((35 - bb[0], 14 - bb[1] + 4), texto, font=f, fill=(15, 10, 30, 255))
    return im


@lru_cache(maxsize=32)
def _titulo_sprite(titulo: str):
    linhas, atual = [], ""
    f = _fonte(78)
    for p in titulo.upper().split():
        teste = (atual + " " + p).strip()
        if f.getlength(teste) > W - 140 and atual:
            linhas.append(atual)
            atual = p
        else:
            atual = teste
    linhas.append(atual)
    imgs = [_texto_contorno(l, 78, (255, 255, 255), 9) for l in linhas[:3]]
    h = sum(i.height - 20 for i in imgs) + 20
    canvas = Image.new("RGBA", (W, h), (0, 0, 0, 0))
    y = 0
    for i in imgs:
        canvas.alpha_composite(i, ((W - i.width) // 2, y))
        y += i.height - 20
    return canvas


# ------------------------------------------------------------------ grade de cor

def _lut(grade: str):
    x = np.arange(256, dtype=np.float32) / 255.0
    def s(v, c=1.0):
        return np.clip(0.5 + (v - 0.5) * c, 0, 1)
    if grade == "epico":
        r, g, b = s(x * 1.06 + 0.02, 1.18), s(x * 1.0, 1.12), s(x * 0.92 + 0.03, 1.08)
    elif grade == "sepia":
        r, g, b = s(x * 1.08 + 0.04, 1.1), s(x * 0.95 + 0.02, 1.1), s(x * 0.78 + 0.01, 1.05)
    elif grade == "neon":
        r, g, b = s(x * 1.1 + 0.02, 1.22), s(x * 0.9, 1.2), s(x * 1.12 + 0.04, 1.2)
    elif grade == "noir":
        r = g = b = s(x, 1.35)
    else:  # aquarela
        r, g, b = s(x * 1.02 + 0.03, 1.05), s(x * 1.02 + 0.03, 1.05), s(x * 1.0 + 0.03, 1.03)
    return np.stack([r, g, b], axis=1).__mul__(255).astype(np.uint8)  # 256x3


@lru_cache(maxsize=8)
def _luts(grade: str):
    t = _lut(grade)
    return [np.ascontiguousarray(t[:, i]) for i in range(3)]


def _grade(frame: np.ndarray, grade: str) -> np.ndarray:
    lr, lg, lb = _luts(grade)
    if grade == "noir":
        g = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        g = cv2.LUT(g, lr)
        return cv2.cvtColor(g, cv2.COLOR_GRAY2RGB)
    r, g, b = cv2.split(frame)
    return cv2.merge([cv2.LUT(r, lr), cv2.LUT(g, lg), cv2.LUT(b, lb)])


@lru_cache(maxsize=8)
def _vinheta(forca: float):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.62)) ** 2)
    v = np.clip(1.0 - forca * np.clip(d - 0.35, 0, 1) ** 1.6 * 1.5, 0.15, 1.0)
    return np.repeat((v * 255).astype(np.uint8)[:, :, None], 3, axis=2)


_RUIDO = None


def _grao(frame, forca, i):
    global _RUIDO
    if _RUIDO is None:
        rng = np.random.default_rng(7)
        _RUIDO = [rng.normal(128, 40, (H, W)).clip(0, 255).astype(np.uint8) for _ in range(3)]
    n = _RUIDO[i % 3]
    return cv2.addWeighted(frame, 1.0, cv2.merge([n, n, n]), forca, -128 * forca)


# ------------------------------------------------------------------ audio

def _montar_audio(segs, caminho_voz: Path):
    """Concatena as frases (com pausa) num wav mono 24k e devolve (inicios, envelope)."""
    inicios, t = [], 0.0
    lista = caminho_voz.parent / "lista.txt"
    linhas = []
    for i, s in enumerate(segs):
        inicios.append(t)
        wav = s.audio_path.with_suffix(".seg.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(s.audio_path), "-ar", "24000", "-ac", "1",
                        "-af", f"apad=whole_dur={s.duration_sec:.3f}", "-t", f"{s.duration_sec:.3f}", str(wav)], check=True)
        linhas.append(f"file '{wav.resolve()}'")
        t += s.duration_sec
    lista.write_text("\n".join(linhas), encoding="utf-8")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lista),
                    "-c", "copy", str(caminho_voz)], check=True)
    with wave.open(str(caminho_voz)) as w:
        sr = w.getframerate()
        dados = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    janela = int(sr / FPS)
    n = len(dados) // janela
    env = np.sqrt((dados[: n * janela].reshape(n, janela) ** 2).mean(axis=1))
    env = env / (np.percentile(env, 95) + 1e-6)
    return inicios, np.clip(env, 0, 1), t


# ------------------------------------------------------------------ planejamento

def _palavras_abs(segs, inicios):
    saida = []
    for s, t0 in zip(segs, inicios):
        ws = s.words
        if not ws:
            toks = s.text.split()
            total = max(1, sum(len(x) for x in toks))
            tt = 0.0
            for x in toks:
                d = (s.duration_sec - 0.2) * len(x) / total
                ws.append((x, tt, tt + d))
                tt += d
        for (p, a, b) in ws:
            saida.append((p, t0 + a, t0 + b))
    return saida


def _blocos_legenda(palavras):
    """Agrupa palavras em blocos de 2-3 para a legenda. Fim de frase (. ! ? ...) SEMPRE fecha o bloco, mesmo com
    1 palavra: a legenda nunca junta o fim de uma frase com o comeco da proxima (o "LUA. 14" do longo da Apollo).
    Pausa longa entre palavras (>0.45 s) tambem fecha o bloco."""
    blocos, atual = [], []
    for k, w in enumerate(palavras):
        if atual and w[1] - atual[-1][2] > 0.45:
            blocos.append(atual)
            atual = []
        atual.append(w)
        txt = w[0].rstrip().rstrip('"\u201d\u2019)')
        fim_frase = txt.endswith((".", "!", "?", "…", ";"))
        virgula = txt.endswith((",", ":"))
        if fim_frase or len(atual) >= 3 or (virgula and len(atual) >= 2) or sum(len(x[0]) for x in atual) > 17:
            blocos.append(atual)
            atual = []
    if atual:
        blocos.append(atual)
    return blocos


def _planejar_planos(cenas, tempos_cena, estilo, rng, pov_ctx=None):
    """Cada cena -> planos (inicio, fim, indice_visual, movimento, forca)."""
    planos = []
    ultimo_mov = None
    for ci, (cena, (t0, t1)) in enumerate(zip(cenas, tempos_cena)):
        vis = cena["visuais"]
        dur = t1 - t0
        nvis = len(vis)
        for vi in range(nvis):
            a = t0 + dur * vi / nvis
            b = t0 + dur * (vi + 1) / nvis
            span = b - a
            n = max(1, round(span / estilo.corte))
            limites = [a + span * k / n for k in range(n + 1)]
            for k in range(n):
                base_mov = pov_ctx.movimentos(ci) if pov_ctx else parallax.MOVIMENTOS
                opcoes = [m for m in base_mov if m != ultimo_mov] or list(base_mov)
                mov = rng.choice(opcoes)
                ultimo_mov = mov
                planos.append({"ini": limites[k], "fim": limites[k + 1], "visual": (ci, vi),
                               "mov": mov, "forca": (pov_ctx.forca(ci, rng.uniform(0.85, 1.25)) if pov_ctx else rng.uniform(0.85, 1.25)), "nova_cena": k == 0 and vi == 0})
    planos[-1]["fim"] = max(planos[-1]["fim"], tempos_cena[-1][1])
    return planos


# ------------------------------------------------------------------ render

def render_video(conteudo: dict, out_path: Path, estilo_nome: str | None = None, fake_tts: bool = False,
                 fim_cena_extra: float = 0.9):
    work = config.OUT_DIR / f"_work_{conteudo['id']}"
    work.mkdir(parents=True, exist_ok=True)
    estilo = estilos.ESTILOS.get(estilo_nome or conteudo.get("estilo") or "epico") or estilos.ESTILOS["epico"]
    rng = random.Random(conteudo["id"])
    cenas = conteudo["cenas"]

    # 1) voz
    sintetizar = tts.synthesize_sentences
    if fake_tts or os.environ.get("PLANOB_FAKE_TTS") == "1":
        import tts_fake
        sintetizar = tts_fake.synthesize_sentences
    segs_por_cena = []
    for i, c in enumerate(cenas):
        segs_por_cena.append(sintetizar(c["fala"], work / f"voz{i:02d}"))
    todos = [s for ss in segs_por_cena for s in ss]
    inicios, env, dur_voz = _montar_audio(todos, work / "voz.wav")
    # tempos por cena
    tempos_cena, k = [], 0
    for ss in segs_por_cena:
        a = inicios[k]
        k += len(ss)
        b = inicios[k] if k < len(inicios) else dur_voz
        tempos_cena.append((a, b))
    palavras = _palavras_abs(todos, inicios)
    blocos = _blocos_legenda(palavras)
    total = dur_voz + fim_cena_extra
    nframes = int(total * FPS)

    # 2) planos e imagens
    pov_ctx = pov.Pov(cenas, estilo, _fonte) if conteudo.get("formato") == "pov" else None
    planos = _planejar_planos(cenas, tempos_cena, estilo, rng, pov_ctx)
    fontes = {}

    def carregar(ci, vi):
        chave = (ci, vi)
        if chave in fontes:
            return fontes[chave]
        for antigo in [k for k in fontes if k != chave and (k[0] < ci or (k[0] == ci and k[1] < vi))]:
            fontes.pop(antigo, None)
        rgb, dep, origem = imagens.obter(cenas[ci]["visuais"][vi], estilo, seed=hash_seed(conteudo["id"], ci, vi))
        if dep is None:
            dep = depth.estimar(rgb)
        fontes[chave] = parallax.preparar(rgb, dep)
        print(f"[render] cena {ci}.{vi} imagem={origem}", flush=True)
        return fontes[chave]

    # 3) ffmpeg (pipe de quadros)
    music_wav = work / "musica.wav"
    segmentos = musica_real.plano_por_cenas(cenas, tempos_cena, estilo.musica)
    faixas = musica_real.gerar(total + 1, segmentos, str(music_wav), seed=hash_seed(conteudo["id"], 9, 9))
    if faixas is None:
        print("[render] trilha real indisponivel - usando a sintetizada", flush=True)
        musica.gerar(total + 2, estilo.musica, str(music_wav), seed=hash_seed(conteudo["id"], 9, 9))
    video_tmp = work / "video.mp4"
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video_tmp)], stdin=subprocess.PIPE)

    vig = _vinheta(estilo.vinheta)
    palavra_inicios = np.array([p[1] for p in palavras])
    destaques = {re.sub(r"\W", "", d.lower()) for c in cenas for d in c.get("destaques", [])}
    bloco_idx, plano_idx, cena_atual = 0, 0, -1
    ano_ate, ano_txt = -1.0, ""
    titulo_spr = _titulo_sprite(conteudo.get("titulo_curto") or conteudo["titulo"])
    formato = {"e-se": "E SE...?", "voce-acorda": "VOCÊ ACORDA EM...", "quem-venceria": "QUEM VENCERIA?", "pov": "POV"}.get(
        conteudo.get("formato", "e-se"), "PLANO B")
    chip = _chip(formato, (255, 214, 10))

    for fi in range(nframes):
        t = fi / FPS
        while plano_idx < len(planos) - 1 and t >= planos[plano_idx]["fim"]:
            plano_idx += 1
        pl = planos[plano_idx]
        ci, vi = pl["visual"]
        fonte, dep = carregar(ci, vi)
        u = min(1.0, max(0.0, (t - pl["ini"]) / max(0.05, pl["fim"] - pl["ini"])))
        # soco de zoom nas palavras de impacto
        punch = 0.0
        idx_w = int(np.searchsorted(palavra_inicios, t, side="right")) - 1
        if idx_w >= 0:
            w = palavras[idx_w]
            chave = re.sub(r"\W", "", w[0].lower())
            if (chave in destaques or chave.isdigit()) and 0 <= t - w[1] < 0.28:
                punch = 0.07 * (1 - (t - w[1]) / 0.28)
        # soco no inicio de cada plano (cortes dinamicos)
        dt_corte = t - pl["ini"]
        if dt_corte < 0.18:
            punch += 0.06 * (1 - dt_corte / 0.18)
        frame = parallax.quadro(fonte, dep, pl["mov"], u, pl["forca"], punch)
        frame = _grade(frame, estilo.grade)
        # glitch RGB / flash no corte
        if dt_corte < 0.15 and not (pov_ctx and pov_ctx.modos[ci] == "slide"):
            if estilo.glitch:
                d = int(14 * (1 - dt_corte / 0.15))
                frame[:, :, 0] = np.roll(frame[:, :, 0], d, axis=1)
                frame[:, :, 2] = np.roll(frame[:, :, 2], -d, axis=1)
            fl = estilo.flash * 0.5 * (1 - dt_corte / 0.15)
            if fl > 0:
                frame = cv2.addWeighted(frame, 1 - fl * 0.5, np.full_like(frame, 255), fl * 0.5, 0)
        frame = cv2.multiply(frame, vig, scale=1 / 255.0)
        if pov_ctx:
            frame = pov_ctx.compor(frame, ci, t, tempos_cena[ci][0])
        if estilo.grao > 0.015:
            frame = _grao(frame, estilo.grao, fi)

        # carimbo de ano
        if ci != cena_atual:
            cena_atual = ci
            c = cenas[ci]
            if c.get("ano"):
                ano_txt, ano_ate = str(c["ano"]), tempos_cena[ci][0] + 2.4
            else:
                ano_ate = -1
        if ano_ate > 0 and t < ano_ate:
            spr = _carimbo_ano(ano_txt)
            ent = min(1.0, (t - (ano_ate - 2.4)) / 0.25)
            k = 0.55 + 0.45 * (1 - (1 - ent) ** 3) if ent < 1 else 1.0
            im = spr.resize((int(spr.width * k), int(spr.height * k)), Image.BILINEAR)
            sai = min(1.0, (ano_ate - t) / 0.3)
            _blit(frame, im, (W - im.width) // 2, int(H * 0.27), opac=min(ent, sai))

        # titulo (primeiros 2.6s)
        if t < 2.6 and conteudo.get("titulo"):
            ent = min(1.0, t / 0.3)
            sai = min(1.0, (2.6 - t) / 0.35)
            o = min(ent, sai)
            off = int((1 - ent) * -80)
            _blit(frame, chip, (W - chip.width) // 2, int(H * 0.07) + off, opac=o)
            _blit(frame, titulo_spr, 0, int(H * 0.07) + 120 + off, opac=o)

        # legenda palavra a palavra
        while bloco_idx < len(blocos) - 1 and t >= blocos[bloco_idx][-1][2] + 0.05 and t >= blocos[bloco_idx + 1][0][1] - 0.02:
            bloco_idx += 1
        bl = blocos[bloco_idx]
        if bl[0][1] - 0.05 <= t <= bl[-1][2] + 0.35:
            ativa = 0
            for j, w in enumerate(bl):
                if t >= w[1] - 0.02:
                    ativa = j
            spr = _chunk_sprite(tuple(x[0] for x in bl), ativa, estilo.legenda_forte, estilo.legenda_alt, 104)
            pop = 1.0 + 0.12 * max(0.0, 1 - (t - bl[ativa][1]) / 0.12)
            im = spr if pop < 1.01 else spr.resize((int(spr.width * pop), int(spr.height * pop)), Image.BILINEAR)
            _blit(frame, im, (W - im.width) // 2, int(H * (0.77 if (pov_ctx and pov_ctx.modos[ci] == 'slide') else 0.60)) - im.height // 2)

        # mascote Tic
        fala_ci = ci
        lado_dir = (ci % 2 == 1)
        amp = float(env[min(fi, len(env) - 1)]) if fi < len(env) else 0.0
        em = cenas[fala_ci].get("emocao", "neutro")
        spr = mascote.sprite(t + ci, amp ** 0.8, amp > 0.12, em, altura=(330 if (pov_ctx and pov_ctx.modos[ci] == 'slide') else 520))
        t_cena = t - tempos_cena[ci][0]
        entra = min(1.0, max(0.0, t_cena / 0.35))
        quica = 1 + 0.18 * math.sin(entra * math.pi) if entra < 1 else 1.0
        mx = int((W - spr.width - 20) if lado_dir else 20)
        mx += int((1 - entra) * (240 if lado_dir else -240))
        my = int(H - spr.height - 38 - (0.18 * spr.height * (quica - 1)))
        _blit(frame, spr, mx, my)

        # barra de progresso + handle
        cv2.rectangle(frame, (0, 0), (int(W * fi / nframes), 10), (255, 214, 10), -1)
        if t > 2.6:
            h_im = _texto_contorno(HANDLE, 40, (255, 255, 255), 6)
            _blit(frame, h_im, W - h_im.width - 20, 36, opac=0.8)

        proc.stdin.write(frame.tobytes())
    proc.stdin.close()
    proc.wait()

    # 4) mistura de audio: voz + musica (ducking leve)
    vol_m = 1.0 if faixas else {"epica": 0.20, "misteriosa": 0.22, "tensa": 0.18, "leve": 0.22}[estilo.musica]
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(video_tmp), "-i", str(work / "voz.wav"), "-i", str(music_wav),
         "-filter_complex",
         f"[1:a]volume=1.35,aresample=44100,aformat=channel_layouts=stereo,apad,asplit=2[v1][v2];[2:a]aresample=44100,aformat=channel_layouts=stereo,volume={vol_m}[m];[m][v1]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=300[md];"
         f"[v2][md]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-t", f"{total:.2f}",
         str(out_path)], check=True)
    return {"duracao": total, "estilo": estilo.nome}


def hash_seed(vid: str, a: int, b: int) -> int:
    import hashlib
    return int(hashlib.md5(f"{vid}-{a}-{b}".encode()).hexdigest()[:7], 16)


def porta_abrindo(frame, u):
    """Transicao 'porta': duas folhas de madeira escura se abrem do centro para os lados (u = 0..1)."""
    import numpy as _np
    if u >= 1:
        return frame
    h, w = frame.shape[:2]
    k = (1 - (1 - u) ** 3)
    meia = int(w / 2 * (1 - k))
    if meia <= 0:
        return frame
    cor = _np.array([46, 30, 20], _np.uint8)
    frame[:, :meia] = cor
    frame[:, w - meia:] = cor
    frame[:, max(0, meia - 8):meia] = (20, 12, 8)
    frame[:, w - meia:min(w, w - meia + 8)] = (20, 12, 8)
    # macaneta
    y0 = int(h * 0.52)
    x0 = max(0, meia - 40)
    frame[y0 - 10:y0 + 10, x0:x0 + 22] = (200, 170, 80)
    return frame

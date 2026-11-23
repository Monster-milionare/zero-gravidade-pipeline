"""Video LONGO 16:9 (1280x720, 24 fps) do Zero Gravidade BR, renderizado em PARALELO.

O render 3D (Chromium + SwiftShader, sem GPU) faz ~1-2 quadros por segundo. Um video de 9 min tem ~13 mil
quadros, entao o trabalho e dividido em trechos que rodam em jobs separados do GitHub Actions:

  python render_longo.py preparar  <id>              -> voz, musica e plano.json (uma vez)
  python render_longo.py trecho    <id> <i> <n>      -> out/_longo_<id>/trecho_<i>.mp4 (so imagem)
  python render_longo.py montar    <id> <n> <saida>  -> junta os trechos e mixa o audio (voz 100%, musica 30%)

Nada do render dos Shorts (render3d.py) e alterado: este modulo so reutiliza as funcoes dele.
"""
import base64
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import config
import cenografo
import estilos
import musica
import musica_real
import render as R
import render3d as R3
import tts

LW, LH, LFPS = 1280, 720, 24
ENV_FPS = config.FPS          # o envelope de volume e amostrado na taxa dos Shorts (30)
TAXA_ENV = ENV_FPS


def _conteudo(id_: str) -> dict:
    return json.loads((config.CONTEUDO_DIR / f"{id_}.json").read_text(encoding="utf-8"))


def _work(id_: str) -> Path:
    w = config.OUT_DIR / f"_longo_{id_}"
    w.mkdir(parents=True, exist_ok=True)
    return w


def preparar(id_: str, fake_tts: bool = False) -> dict:
    conteudo = _conteudo(id_)
    work = _work(id_)
    estilo = estilos.ESTILOS[conteudo.get("estilo") or "sepia"]
    import coerencia
    coerencia.exigir(conteudo)       # roteiro x cenario x elenco: nada incoerente chega ao render
    conteudo = cenografo.preparar(conteudo)
    cenas = conteudo["cenas"]
    sintetizar = tts.synthesize_sentences
    if fake_tts:
        import tts_fake
        sintetizar = tts_fake.synthesize_sentences
    import vozes
    elenco_vozes = vozes.Elenco(conteudo.get("elenco") or {})

    segs_por_cena, spans_ref = [], []
    for i, c in enumerate(cenas):
        linhas = c.get("falas") or [{"quem": "narrador", "texto": c["fala"]}]
        ss_cena, refs = [], []
        for j, ln in enumerate(linhas):
            quem = ln.get("quem") or "narrador"
            voz, tom = elenco_vozes.voz(quem, c)
            ss = sintetizar(ln["texto"], work / f"voz{i:03d}_{j}", voz=voz, tom=tom if quem != "narrador" else None)
            ss_cena.extend(ss)
            refs.append((len(ss_cena) - len(ss), len(ss_cena), quem))
        segs_por_cena.append(ss_cena)
        spans_ref.append(refs)
    todos = [s for ss in segs_por_cena for s in ss]
    inicios, env, dur_voz = R._montar_audio(todos, work / "voz.wav")

    tempos_cena, k, spans_por_cena = [], 0, {}
    for ci, ss in enumerate(segs_por_cena):
        a = inicios[k]
        base = k
        spans = []
        for (i0, i1, quem) in spans_ref[ci]:
            sa = inicios[base + i0]
            sb = inicios[base + i1] if base + i1 < len(inicios) else dur_voz
            spans.append((sa, sb, quem))
        spans_por_cena[ci] = spans
        k += len(ss)
        b = inicios[k] if k < len(inicios) else dur_voz
        tempos_cena.append((a, b))
    palavras = R._palavras_abs(todos, inicios)
    total = dur_voz + 1.6
    shots = R3._linha_do_tempo(cenas, tempos_cena, spans_por_cena)

    segmentos = musica_real.plano_por_cenas(cenas, tempos_cena, estilo.musica)
    music_wav = work / "musica.wav"
    faixas = musica_real.gerar(total + 1, segmentos, str(music_wav), seed=R.hash_seed(conteudo["id"], 9, 9))
    if faixas is None:
        musica.gerar(total + 2, estilo.musica, str(music_wav), seed=R.hash_seed(conteudo["id"], 9, 9))

    plano = {
        "id": conteudo["id"], "total": total, "nframes": int(total * LFPS),
        "shots": shots, "palavras": [[p[0], p[1], p[2]] for p in palavras],
        "tempos_cena": tempos_cena, "env": [float(x) for x in env],
        "cenas": [{"ano": c.get("ano"), "ui": c.get("ui")} for c in cenas],
        "elenco": conteudo.get("elenco"), "formato": conteudo.get("formato"), "motor": conteudo.get("motor", "3d"),
        "titulo": conteudo.get("titulo_curto") or conteudo["titulo"], "episodio": conteudo.get("episodio"),
        "estilo": estilo.nome,
        "capitulos": [(c.get("capitulo"), tempos_cena[i][0]) for i, c in enumerate(cenas) if c.get("capitulo")],
    }
    (work / "plano.json").write_text(json.dumps(plano, ensure_ascii=False), encoding="utf-8")
    print(f"[longo] preparado: {total:.1f}s, {plano['nframes']} quadros, {len(shots)} planos, {len(cenas)} cenas", flush=True)
    return plano


def _faixas_do_trecho(nframes: int, i: int, n: int):
    base = nframes // n
    f0 = i * base
    f1 = nframes if i == n - 1 else (i + 1) * base
    return f0, f1


def trecho(id_: str, i: int, n: int, ate_quadro: int | None = None) -> Path:
    from playwright.sync_api import sync_playwright
    work = _work(id_)
    p = json.loads((work / "plano.json").read_text(encoding="utf-8"))
    nframes, shots, env = p["nframes"], p["shots"], p["env"]
    palavras = [(a, b, c) for a, b, c in p["palavras"]]
    blocos = R._blocos_legenda(palavras)
    tempos_cena = [tuple(x) for x in p["tempos_cena"]]
    cenas = p["cenas"]
    f0, f1 = _faixas_do_trecho(nframes, i, n)
    if ate_quadro:
        f1 = min(f1, f0 + ate_quadro)

    # as funcoes de desenho do render.py usam W/H do modulo: ajusta para 16:9
    R.W, R.H = LW, LH
    R._chunk_sprite.cache_clear()
    vig = R._vinheta(0.55)
    ep = p.get("episodio") or {"e-se": "E SE...?", "voce-acorda": "VOCÊ ACORDA EM...", "quem-venceria": "QUEM VENCERIA?",
                               "debate": "QUEM TEM RAZÃO?", "pov": "POV", "escolha": "VOCÊ ESCOLHE",
                               "futuro": "VOCÊ ACORDA NO FUTURO", "longo": "PLANO B DA HISTÓRIA"}.get(p.get("formato", "longo"), "PLANO B DA HISTÓRIA")
    barra = R3._barra_ep(ep, p["titulo"])
    barra = barra.resize((int(barra.width * 0.62), int(barra.height * 0.62)), Image.LANCZOS)

    saida = work / f"trecho_{i:03d}.mp4"
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{LW}x{LH}", "-r", str(LFPS),
         "-i", "-", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-g", str(LFPS * 2),
         "-an", str(saida)], stdin=subprocess.PIPE)

    bloco_idx = 0
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=R3.FLAGS)
        dw, dh = (1920, 1080) if p.get("motor") == "2d" else (LW, LH)      # o motor 2D desenha em 1920x1080 e o quadro e reduzido
        pg = br.new_page(viewport={"width": dw, "height": dh})
        pg.add_init_script(f"window.__W={dw};window.__H={dh};")
        pg.goto((R3.MOTOR.parent / ("engine2d.html" if p.get("motor") == "2d" else R3.MOTOR.name)).resolve().as_uri())
        pg.wait_for_timeout(600)
        if p.get("elenco"):
            pg.evaluate("e => window.setElenco(e)", p["elenco"])
        pg.evaluate("s => window.setShots(s)", shots)
        for fi in range(f0, f1):
            t = fi / LFPS
            ei = int(t * TAXA_ENV)
            amp = env[ei] if ei < len(env) else 0.0
            dados = pg.evaluate("([t, a]) => window.frame(t, a)", [t, amp])
            buf = np.frombuffer(base64.b64decode(dados.split(",", 1)[1]), np.uint8)
            frame = cv2.cvtColor(cv2.imdecode(buf, cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB)
            if frame.shape[1] != LW or frame.shape[0] != LH:
                frame = cv2.resize(frame, (LW, LH))
            frame = cv2.multiply(frame, vig, scale=1 / 255.0)

            for s in shots:   # soco leve no corte
                if s["t0"] <= t < s["t0"] + 0.12 and s["t0"] > 0.1:
                    fl = 0.12 * (1 - (t - s["t0"]) / 0.12)
                    frame = cv2.addWeighted(frame, 1 - fl, np.full_like(frame, 255), fl, 0)
                    break

            for ci, (cena, (a0, b0)) in enumerate(zip(cenas, tempos_cena)):   # carimbo de ano
                if cena.get("ano") and a0 <= t < a0 + 2.6:
                    spr = R._carimbo_ano(str(cena["ano"]))
                    ent = min(1.0, (t - a0) / 0.25)
                    k = (0.55 + 0.45 * (1 - (1 - ent) ** 3) if ent < 1 else 1.0) * 0.42
                    im = spr.resize((max(1, int(spr.width * k)), max(1, int(spr.height * k))), Image.BILINEAR)
                    sai = min(1.0, (a0 + 2.6 - t) / 0.3)
                    R._blit(frame, im, (LW - im.width) // 2, int(LH * 0.30), opac=min(ent, sai))
                    break

            if t < 3.5:   # chip + titulo no inicio
                ent = min(1.0, t / 0.3)
                sai = min(1.0, (3.5 - t) / 0.35)
                R._blit(frame, barra, (LW - barra.width) // 2, int(LH * 0.05) + int((1 - ent) * -60), opac=min(ent, sai))

            while bloco_idx < len(blocos) - 1 and t >= blocos[bloco_idx][-1][2] + 0.05 and t >= blocos[bloco_idx + 1][0][1] - 0.02:
                bloco_idx += 1
            bl = blocos[bloco_idx]
            if bl[0][1] - 0.05 <= t <= bl[-1][2] + 0.35:
                ativa = 0
                for j, w in enumerate(bl):
                    if t >= w[1] - 0.02:
                        ativa = j
                spr = R._chunk_sprite(tuple(x[0] for x in bl), ativa, (255, 214, 10), None, 58)
                pop = 1.0 + 0.10 * max(0.0, 1 - (t - bl[ativa][1]) / 0.12)
                im = spr if pop < 1.01 else spr.resize((int(spr.width * pop), int(spr.height * pop)), Image.BILINEAR)
                R._blit(frame, im, (LW - im.width) // 2, int(LH * 0.86) - im.height // 2)

            cv2.rectangle(frame, (0, 0), (int(LW * fi / nframes), 6), (255, 214, 10), -1)
            if t > 3.5:
                h_im = R._texto_contorno(R.HANDLE, 26, (255, 255, 255), 4)
                R._blit(frame, h_im, LW - h_im.width - 16, 20, opac=0.8)
            proc.stdin.write(frame.tobytes())
            if (fi - f0) % 120 == 0:
                print(f"[longo] trecho {i}/{n}: quadro {fi - f0}/{f1 - f0}", flush=True)
        br.close()
    proc.stdin.close()
    proc.wait()
    print(f"[longo] trecho {i} pronto: {saida}", flush=True)
    return saida


def montar(id_: str, n: int, saida: Path) -> dict:
    work = _work(id_)
    p = json.loads((work / "plano.json").read_text(encoding="utf-8"))
    lista = work / "trechos.txt"
    partes = [work / f"trecho_{i:03d}.mp4" for i in range(n)]
    faltando = [x.name for x in partes if not x.exists()]
    if faltando:
        raise SystemExit(f"[longo] faltam trechos: {faltando}")
    lista.write_text("".join(f"file '{x.resolve()}'\n" for x in partes), encoding="utf-8")
    video = work / "video.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(video)], check=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(video), "-i", str(work / "voz.wav"), "-i", str(work / "musica.wav"),
         "-filter_complex",
         "[1:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-15:TP=-1.5:LRA=9,apad[v];"
         f"[2:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-15:TP=-1.5:LRA=9,volume={R3.MUSICA_VOL}[m];"
         "[v][m]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
         "-t", f"{p['total']:.2f}", str(saida)], check=True)
    return {"duracao": p["total"], "capitulos": p.get("capitulos", [])}


if __name__ == "__main__":
    cmd, id_ = sys.argv[1], sys.argv[2]
    if cmd == "preparar":
        preparar(id_, fake_tts="--fake" in sys.argv)
    elif cmd == "trecho":
        trecho(id_, int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]) if len(sys.argv) > 5 else None)
    elif cmd == "montar":
        print(montar(id_, int(sys.argv[3]), Path(sys.argv[4])))

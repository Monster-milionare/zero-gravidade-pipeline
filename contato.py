#!/usr/bin/env python3
"""Quadro de contato: 1 quadro por cena (camera da cena + camera de quem fala) com o texto da narracao embaixo.
E a conferencia VISUAL antes de publicar um longo: da para ver se o cenario/elenco combina com o que o roteiro diz.
Uso: python contato.py <id> [pasta_saida]   -> pasta/contato_01.jpg ...  (8 cenas por pagina)
Sem TTS e sem musica: so o motor de imagem. Rapido (segundos)."""
import base64
import json
import sys
import textwrap
from pathlib import Path

import cv2
import numpy as np

import cenografo
import config

FLAGS = ["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"]


def main(id_, saida):
    from playwright.sync_api import sync_playwright
    c = json.loads((config.CONTEUDO_DIR / f"{id_}.json").read_text(encoding="utf-8"))
    c = cenografo.preparar(c)
    is2d, longo = c.get("motor") == "2d", c.get("formato") == "longo"
    W, H = ((1920, 1080) if is2d else (1280, 720)) if longo else (config.W, config.H)
    motor = config.BASE_DIR / "pov3d" / ("engine2d.html" if is2d else "engine.html")
    saida = Path(saida); saida.mkdir(parents=True, exist_ok=True)
    quadros = []
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=FLAGS)
        pg = br.new_page(viewport={"width": W, "height": H})
        pg.on("pageerror", lambda e: print("ERRO no motor:", e))
        pg.add_init_script(f"window.__W={W};window.__H={H};")
        pg.goto(motor.resolve().as_uri()); pg.wait_for_timeout(600)
        if c.get("elenco"):
            pg.evaluate("e => window.setElenco(e)", c["elenco"])
        shots, legendas = [], []
        t = 0.0
        for i, cena in enumerate(c["cenas"]):
            cams = [cena["cams"][0]]
            for ln in cena.get("falas") or []:
                q = ln.get("quem")
                if q == "prot":
                    cams.append("eu-frente")
                elif q and q[0] == "f" and q[1:].isdigit():
                    cams.append(f"f{q[1:]}c")
            for cam in dict.fromkeys(cams):
                shots.append({"t0": t, "t1": t + 2, "amb": cena["amb"], "cam": cam, "hora": cena.get("hora"), "fx": cena.get("fx", ""),
                              "falante": next((l["quem"] for l in cena.get("falas", []) if l.get("quem") not in ("narrador", "radio", None)), "")})
                legendas.append((i, cena["amb"], cena.get("fx", ""), cam, cena.get("fala", "")))
                t += 2
        pg.evaluate("s => window.setShots(s)", shots)
        for s, (i, amb, fx, cam, fala) in zip(shots, legendas):
            d = pg.evaluate("([t, a]) => window.frame(t, a)", [s["t0"] + 1.0, 0.5])
            fr = cv2.imdecode(np.frombuffer(base64.b64decode(d.split(",", 1)[1]), np.uint8), cv2.IMREAD_COLOR)
            fr = cv2.resize(fr, (640, int(640 * fr.shape[0] / fr.shape[1])))
            fr = cv2.copyMakeBorder(fr, 0, 92, 0, 0, cv2.BORDER_CONSTANT, value=(24, 24, 24))
            cv2.putText(fr, f"#{i} {amb} {('fx=' + fx) if fx else ''} cam={cam}", (6, fr.shape[0] - 74), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
            for k, ln in enumerate(textwrap.wrap(fala.encode("ascii", "ignore").decode() or fala, 74)[:3]):
                cv2.putText(fr, ln, (6, fr.shape[0] - 52 + k * 18), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (235, 235, 235), 1)
            quadros.append(fr)
        br.close()
    por_pag = 8
    h = max(q.shape[0] for q in quadros)
    for p in range(0, len(quadros), por_pag):
        blocos = [cv2.copyMakeBorder(q, 0, h - q.shape[0], 0, 0, cv2.BORDER_CONSTANT, value=(24, 24, 24)) for q in quadros[p:p + por_pag]]
        while len(blocos) % 2:
            blocos.append(np.zeros_like(blocos[0]))
        folha = np.vstack([np.hstack(blocos[k:k + 2]) for k in range(0, len(blocos), 2)])
        cv2.imwrite(str(saida / f"contato_{p // por_pag + 1:02d}.jpg"), folha, [cv2.IMWRITE_JPEG_QUALITY, 85])
    print(f"[contato] {len(quadros)} quadros em {saida}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else str(config.OUT_DIR / "contato"))

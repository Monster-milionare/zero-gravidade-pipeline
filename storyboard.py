"""Storyboard rapido: 1 quadro por cena de cada roteiro (sem voz/musica) para conferir cenario, elenco e camera."""
import base64, glob, json, sys
from pathlib import Path
import cenografo, config
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
import render3d

def main(ids):
    out = Path("/tmp/claude-0/sb"); out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=render3d.FLAGS)
        pg = br.new_page(viewport={"width": 360, "height": 640})
        pg.add_init_script("window.__W=360;window.__H=640;")
        pg.goto(render3d.MOTOR.resolve().as_uri()); pg.wait_for_timeout(700)
        for f in sorted(glob.glob(str(config.CONTEUDO_DIR / "*.json"))):
            c = json.load(open(f, encoding="utf-8"))
            if ids and not any(c["id"].startswith(i) for i in ids): continue
            c = cenografo.preparar(c)
            tempos = [(i * 4.0, i * 4.0 + 4.0) for i in range(len(c["cenas"]))]
            shots = render3d._linha_do_tempo(c["cenas"], tempos)
            pg.evaluate("e => window.setElenco(e)", c["elenco"]); pg.evaluate("s => window.setShots(s)", shots)
            quadros = []
            for i, (a, b) in enumerate(tempos):
                ss = [s for s in shots if s["t0"] >= a and s["t1"] <= b + 1e-6]
                for k, s in enumerate(ss[:2]):
                    t = (s["t0"] + s["t1"]) / 2
                    d = pg.evaluate("([t,a]) => window.frame(t,a)", [t, 0.6])
                    p = out / f"{c['id']}_{i}_{k}.jpg"; p.write_bytes(base64.b64decode(d.split(",", 1)[1])); quadros.append((p, s["amb"], s["cam"]))
            cols = 8; rows = (len(quadros) + cols - 1) // cols; w, h = 180, 320
            sh = Image.new("RGB", (cols * w, rows * h))
            for j, (p, amb, cam) in enumerate(quadros):
                im = Image.open(p).resize((w, h)); ImageDraw.Draw(im).text((4, 4), f"{amb}/{cam}", fill=(255, 255, 0)); sh.paste(im, ((j % cols) * w, (j // cols) * h))
            sh.save(out / f"{c['id']}_sheet.jpg"); print(c["id"], c["perfil"], [x["amb"] for x in c["cenas"]], flush=True)
        br.close()
main(sys.argv[1:])

"""Ficha-dossie de pessoa REAL nos videos longos (pedido do Andre: "voce e Pete Conrad" -> mostrar quem e o cara).

Sem foto de pessoa real (regra do canal): o video da zoom no personagem e entra um cartao estilo arquivo/dossie
com NOME, CARGO e 1-2 linhas de fatos (datas, missao). Os dados vem do roteiro, campo opcional:

    "pessoas": [{"papel": "prot|f0|f1", "nome": "Pete Conrad", "cargo": "Comandante da Apollo 12",
                 "info": ["1930 - 1999", "3o homem a pisar na Lua"], "selo": "APOLLO 12"}]

O cartao aparece na PRIMEIRA vez que a pessoa e citada pelo nome (ou fala), por ~4 s.
"""
import re
import unicodedata

from PIL import Image, ImageDraw

import render as R

DUR = 4.4


def _norm(t: str) -> str:
    t = unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", t)


def fichas(conteudo: dict, P: dict, bloqueios=None) -> list:
    """-> [{'t0','t1','nome','cargo','info','selo','papel','lado'}] na ordem do video (uma por pessoa).
    bloqueios = [(a, b)]: momentos em que ja tem algo grande na tela (titulo, carimbo do ano); a ficha espera."""
    pessoas = conteudo.get("pessoas") or []
    saida, usados = [], set()
    for x in P["beats"]:
        txt = _norm(x["texto"])
        for p in pessoas:
            if p["nome"] in usados:
                continue
            sobrenome = _norm(p["nome"]).split()[-1]
            citado = bool(txt) and (re.search(r"\b" + re.escape(_norm(p["nome"])) + r"\b", txt) or re.search(r"\b" + re.escape(sobrenome) + r"\b", txt))
            fala = p.get("papel") and x["quem"] == p.get("papel") and p.get("papel") != "prot"
            if citado or fala:
                usados.add(p["nome"])
                t0 = x["a"] + 0.25
                pap = str(p.get("papel") or "")
                for sh in P["shots"]:     # entra junto com o plano que mostra essa pessoa (zoom nela)
                    if x["a"] - 0.01 <= sh["t0"] < x["t1"] and re.match(r"^" + re.escape(pap) + r"c?$", str(sh["cam"])) and pap.startswith("f"):
                        t0 = sh["t0"] + 0.15
                        break
                saida.append({"t0": round(t0, 3), "t1": round(t0 + DUR, 3), "nome": p["nome"], "cargo": p.get("cargo", ""),
                              "info": list(p.get("info") or [])[:2], "selo": p.get("selo", ""), "papel": p.get("papel", ""),
                              "lado": "dir" if len(saida) % 2 else "esq"})
    for f in saida:
        for a, b in sorted(bloqueios or []):
            if a - 0.2 < f["t0"] < b:
                f["t0"] = round(b + 0.1, 3)
                f["t1"] = round(f["t0"] + DUR, 3)
    # duas fichas nunca se sobrepoem: a anterior sai quando a proxima entra (minimo 2 s na tela)
    saida.sort(key=lambda f: f["t0"])
    for a, b in zip(saida, saida[1:]):
        if b["t0"] < a["t1"] + 0.2:
            a["t1"] = max(a["t0"] + 2.0, b["t0"] - 0.2)
            if b["t0"] < a["t1"] + 0.2:
                b["t0"] = a["t1"] + 0.2
                b["t1"] = b["t0"] + DUR
    return saida


def cartao(f: dict) -> Image.Image:
    """Cartao de arquivo: papel envelhecido, carimbo vermelho, nome grande, cargo e fatos."""
    w, h = 760, 360
    im = Image.new("RGBA", (w + 24, h + 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 16, w + 14, h + 16], radius=18, fill=(0, 0, 0, 110))                      # sombra
    d.rounded_rectangle([0, 0, w, h], radius=18, fill=(236, 224, 196, 252), outline=(60, 44, 30, 255), width=5)
    d.rectangle([0, 0, w, 62], fill=(40, 34, 30, 255))
    d.rounded_rectangle([0, 0, w, 62], radius=18, fill=(40, 34, 30, 255))
    d.rectangle([0, 40, w, 62], fill=(40, 34, 30, 255))
    d.text((26, 10), "ARQUIVO  •  QUEM É", font=R._fonte(36), fill=(255, 214, 10, 255))
    nome = R._texto_contorno(f["nome"].upper(), 66, (30, 24, 20), 0)
    if nome.width > w - 52:
        k = (w - 52) / nome.width
        nome = nome.resize((int(nome.width * k), int(nome.height * k)), Image.LANCZOS)
    im.alpha_composite(nome, (26, 76))
    y = 76 + nome.height + 6
    if f.get("cargo"):
        d.text((28, y), f["cargo"], font=R._fonte(36), fill=(150, 30, 24, 255))
        y += 50
    for linha in f.get("info") or []:
        d.text((28, y), "• " + linha, font=R._fonte(32), fill=(50, 40, 32, 255))
        y += 42
    if f.get("selo"):     # carimbo inclinado com o nome da missao/evento
        s = Image.new("RGBA", (300, 92), (0, 0, 0, 0))
        ds = ImageDraw.Draw(s)
        ds.rounded_rectangle([4, 4, 296, 88], radius=12, outline=(190, 30, 30, 230), width=6)
        bb = R._fonte(40).getbbox(f["selo"].upper())
        ds.text(((300 - (bb[2] - bb[0])) // 2 - bb[0], (92 - (bb[3] - bb[1])) // 2 - bb[1]), f["selo"].upper(), font=R._fonte(40), fill=(190, 30, 30, 230))
        s = s.rotate(12, expand=True, resample=Image.BICUBIC)
        im.alpha_composite(s, (w - s.width - 18, h - s.height - 10))
    return im

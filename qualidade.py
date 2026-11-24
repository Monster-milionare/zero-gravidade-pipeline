#!/usr/bin/env python3
"""Inspetor de QUALIDADE do filme (camada 2 do supervisor). Roda sobre o PLANO do diretor (o que a camera vai mostrar),
antes do render. coerencia.py ve o roteiro; este ve a direcao.

ERRO (o video nao sobe; volta pra fila para ser corrigido):
  - legenda que junta o fim de uma frase com o comeco de outra ("LUA. 14")
  - camera apontada para um personagem que nao esta em cena
  - figurante falando na abertura de um POV (a historia comeca com voce sozinho)
AVISO (sobe, mas entra no relatorio do supervisor para melhorar o roteiro):
  - elenco inteiro entrando de uma vez / ninguem entra (historia nao se constroi)
  - plano parado longo demais (> 7 s sem movimento) ou pouca variedade de camera
  - pessoa real citada sem ficha no longo

Uso: python qualidade.py <id> | --fila    (simula com voz falsa, sem rede)
"""
import json
import re
import sys
from pathlib import Path

import config

FIM_FRASE = re.compile(r"[.!?…;][\"”’)]*$")
FORMATOS_POV = ("pov", "pov3d", "voce-acorda", "escolha", "futuro")


def avaliar(conteudo: dict, P: dict) -> dict:
    erros, avisos = [], []
    pov = P.get("pov")
    shots, pres = P["shots"], P.get("presenca")

    # 1. legenda nunca atravessa o fim de frase
    for L in P["legendas"]:
        ws = [w[0] for w in L["palavras"]]
        for k, w in enumerate(ws[:-1]):
            if FIM_FRASE.search(w.strip()):
                erros.append(f"legenda junta duas frases: '{' '.join(ws)}' ({L['t0']:.1f}s)")
                break

    # 2. camera em personagem ausente
    def presente(fid, amb, t):
        if pres is None:
            return True
        return any(i[2] == amb and i[0] <= t + 0.05 and t < i[1] for i in pres.get(fid, []))
    for s in shots:
        m = re.match(r"^(f\d)c?$", str(s.get("cam")))
        if m and not presente(m.group(1), s["amb"], (s["t0"] + s["t1"]) / 2):
            erros.append(f"camera em '{s['cam']}' que nao esta em cena ({s['amb']}, {s['t0']:.1f}s)")

    # 3. abertura de POV: voce sozinho (ninguem fala nem esta em cena na primeira batida, a nao ser que o roteiro
    #    declare "presentes" de proposito, ex.: os dois vigias no cesto da gavea)
    if pov and conteudo.get("formato") != "longo" and P["beats"]:
        b0 = P["beats"][0]
        declarado = bool(b0["c"].get("presentes"))
        if re.match(r"^f\d$", b0["quem"] or "") and not declarado:
            erros.append("figurante fala na primeira batida do POV (a historia tem que comecar com voce sozinho)")
        cedo = [f for f, ints in (pres or {}).items() if any(i[0] < 0.5 for i in ints)]
        if cedo and not declarado:
            avisos.append(f"{cedo} ja em cena no primeiro segundo (o ideal e voce sozinho na abertura)")

    # 4. a historia se constroi (entradas espalhadas)
    if pres is not None and pov:
        ent = sorted(i[0] for ints in pres.values() for i in ints if i[3])
        if len(ent) >= 3 and ent[-1] - ent[0] < 2.0:
            avisos.append("todo o elenco entra ao mesmo tempo: espalhe as entradas pela historia")
    if pres is not None and conteudo.get("formato") != "longo" and not pres:
        avisos.append("nenhum personagem entra em cena (video so com voce e o cenario)")

    # 5. ritmo de camera
    parados = [s for s in shots if s["t1"] - s["t0"] > 7.0 and (s.get("mov") or "corte") in ("corte",)]
    if parados:
        avisos.append(f"{len(parados)} plano(s) parado(s) com mais de 7 s (ex.: {parados[0]['cam']} em {parados[0]['t0']:.0f}s)")
    if conteudo.get("formato") != "longo" and len({s['cam'] for s in shots}) < 4:
        avisos.append(f"so {len({s['cam'] for s in shots})} enquadramentos diferentes: pouca variedade de camera")

    # 6. longo: pessoas reais com ficha
    if conteudo.get("formato") == "longo":
        nomes = [p.get("nome") for p in conteudo.get("pessoas") or []]
        if not nomes:
            avisos.append("longo sem campo 'pessoas' (sem ficha-dossie de quem e quem)")
    return {"erros": erros, "avisos": avisos}


def simular(conteudo: dict) -> dict:
    """Planeja com voz falsa (sem rede) e avalia: usado pelo supervisor para inspecionar a fila inteira."""
    import cenografo
    import diretor
    import tts_fake
    import vozes
    c = cenografo.preparar(conteudo)
    ev = vozes.Elenco(c.get("elenco") or {}, semente=c["id"], feminino=False, n_pub=0)
    work = config.OUT_DIR / f"_qual_{c['id']}"
    P = diretor.planejar(c, tts_fake.synthesize_sentences, ev, work)
    return avaliar(c, P)


def main(argv):
    import publish
    if argv and argv[0] == "--fila":
        itens = publish.pendentes()
    else:
        itens = [json.loads((config.CONTEUDO_DIR / f"{a}.json").read_text(encoding="utf-8")) for a in argv]
    ruins = 0
    for c in itens:
        try:
            r = simular(c)
        except Exception as exc:
            print(f"== {c['id']}: nao deu para simular ({str(exc)[:120]})")
            continue
        ruins += bool(r["erros"])
        print(f"== {c['id']}: {'ERRO' if r['erros'] else 'ok'}")
        for e in r["erros"]:
            print("   ERRO :", e)
        for a in r["avisos"]:
            print("   aviso:", a)
    return 1 if ruins and argv and argv[0] != "--fila" else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

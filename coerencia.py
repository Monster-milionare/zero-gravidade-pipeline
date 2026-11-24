#!/usr/bin/env python3
"""Garantia de coerencia ROTEIRO x IMAGEM. Nenhum video e renderizado/publicado se o que o roteiro diz nao bate com o
que o cenario, o elenco e a camera realmente mostram.

Camadas (todas objetivas, sem IA):
  1. EXISTENCIA   - o cenario existe no motor do video (2D ou 3D)? os papeis do elenco existem? o efeito existe?
                    (antes, nome desconhecido caia em silencio no cenario/figurino errado)
  2. FORMATO      - cenario horizontal so em video longo; vertical so em Short.
  3. ELENCO/CAMERA- quem fala existe na cena? a camera aponta para alguem que esta em cena? (nada de camera num lugar vazio)
  4. LUGAR        - se o texto cita um lugar/objeto-chave (Kennedy, Houston, oceano...), o cenario tem que ser um dos que
                    mostram isso. Foi o erro do Apollo 13: "Kennedy" sobre o campo do Santos Dumont.
  5. EPOCA        - nada de astronauta/futuro em cenario medieval, nem marujo de caravela no Titanic (aviso).
  6. HORA         - o texto diz "noite" e o ceu esta de dia? (so cenarios com ceu)
  7. CONTINUIDADE - cenas sem cenario/efeito declarado em video 2D, falas sem texto etc.

Uso: python coerencia.py <id> | --todos      (codigo de saida 1 se houver ERRO)
Integracao: publish.py (Shorts), render_longo.py (longos) e longo_diario.py chamam validar() antes de renderizar.
"""
import json
import re
import sys

import cenografo
import catalogo_cenas as cat
import config

# (nome, regex no texto normalizado, cenarios que mostram isso, explicacao)
LUGARES = [
    ("kennedy", r"\b(kennedy|canaveral|plataforma de lancamento|base de lancamento|base espacial|centro espacial|contagem regressiva|saturn)\b",
     {"lancamento", "espaco"}, "o texto fala da base de lancamento/foguete (precisa do cenario 'lancamento')"),
    ("houston", r"\b(centro de controle|sala de controle|diretor de voo|kranz|controladores?|centro de missao)\b",
     {"houston", "laboratorio"}, "o texto fala do centro de controle (precisa de 'houston')"),
    ("lado-lua", r"\b(lado escondido|lado oculto|lado escuro da lua|superficie da lua)\b",
     {"espaco", "modulo-lunar", "lua", "superficie-lunar", "descida-lunar"}, "o texto fala da Lua vista de perto"),
    ("oceano", r"\b(oceano pacifico|ilhas samoa|samoa|navio de resgate|amerissag\w*|caiu na agua|cai na agua)\b",
     {"oceano", "conves", "vapor", "terra"}, "o texto fala do mar/resgate (precisa de 'oceano')"),
    ("paraquedas", r"\b(paraquedas)\b", {"oceano", "espaco"}, "paraquedas aparece so em 'oceano'/'espaco'"),
    ("pouso-lua", r"\b(pisa|pisou|pisam|primeiro passo|passo na lua|bandeira|mar da tranquilidade|base da tranquilidade|caminhar na lua|caminham na lua)\b",
     {"superficie-lunar", "descida-lunar"}, "o texto fala de estar na superficie da Lua (precisa de 'superficie-lunar'/'descida-lunar')"),
    ("marte", r"\b(marte|marciano\w*|planeta vermelho)\b", {"marte"}, "o texto fala de Marte (precisa de um cenario 'marte' vermelho; a Lua e cinza)"),
    ("reentrada", r"\b(reentrada|reentra)\b", {"espaco", "oceano", "nave-cabine", "houston"}, "reentrada: espaco/cabine/oceano"),
]

# conteudo de epoca moderna/futuro nao pode estar num cenario de epoca antiga
EPOCA_MODERNA = r"\b(astronauta\w*|nasa|foguete\w*|apollo|robo\w*|inteligencia artificial|2100|2050|2200|maquinas fizessem|ciborgue\w*)\b"
PAPEIS_ESPACO = {"astronauta", "cientista"}
HORAS_EQ = {"amanhecer": "manha", "madrugada": "noite", "entardecer": "tarde", "manha": "manha", "dia": "dia", "tarde": "tarde", "noite": "noite"}


def _falas(c):
    """falas da cena: as do formato novo (beats) ou as antigas."""
    if c.get("beats"):
        return [{"quem": b.get("quem") or "narrador", "texto": b.get("texto", "")} for b in c["beats"] if (b.get("texto") or "").strip()]
    return c.get("falas") or []


def _texto_cena(c):
    t = " ".join(l.get("texto", "") for l in _falas(c))
    return cenografo._norm(t or c.get("fala", ""))


def _amb_valido(amb, motor):
    if motor == "2d":
        return amb in cat.cenarios_2d_do_motor()
    return amb in cat.AMB_3D


def validar(conteudo: dict) -> dict:
    """-> {'erros': [...], 'avisos': [...]} (cada item: 'cena N: mensagem')."""
    c = cenografo.preparar(conteudo)            # preenche amb/cams/elenco/hora como o render faria
    motor = "2d" if c.get("motor") == "2d" else "3d"
    longo = c.get("formato") == "longo"
    erros, avisos = [], []
    E = lambda i, m: erros.append(f"cena {i}: {m}" if i is not None else m)
    A = lambda i, m: avisos.append(f"cena {i}: {m}" if i is not None else m)

    elenco = c.get("elenco") or {}
    papeis_ok = cat.papeis_2d_do_motor() if motor == "2d" else cat.papeis_3d_do_motor()
    amb_2d = cat.AMB_2D
    base_f = elenco.get("f") or []

    def lista_f(amb):
        return (elenco.get("amb") or {}).get(amb) or base_f

    def prot_de(amb):
        return (elenco.get("protAmb") or {}).get(amb) or elenco.get("prot")

    # 1. existencia de papeis (em todas as listas do elenco)
    todos_papeis = {elenco.get("prot")} | set(base_f) | {p for l in (elenco.get("amb") or {}).values() for p in l} | set((elenco.get("protAmb") or {}).values())
    for p in sorted(x for x in todos_papeis if x):
        if p not in papeis_ok:
            E(None, f"papel '{p}' nao existe no motor {motor} (cairia num figurino errado)")

    anterior_txt_ano = f"{c.get('titulo', '')} {c.get('ano', '')}"
    for i, cena in enumerate(c["cenas"]):
        amb = cena.get("amb")
        txt = _texto_cena(cena)
        if not (cena.get("fala") or _falas(cena)):
            E(i, "cena sem fala")
        # 1. existencia do cenario / efeito
        if not _amb_valido(amb, motor):
            E(i, f"cenario '{amb}' nao existe no motor {motor}")
            continue
        info2 = amb_2d.get(amb) if motor == "2d" else None
        fx = cena.get("fx", "")
        if motor == "2d":
            if info2 is None:
                E(i, f"cenario 2D '{amb}' sem entrada em catalogo_cenas.py")
                continue
            # 2. formato
            if info2["formato"] == "horizontal" and not longo:
                E(i, f"cenario '{amb}' e horizontal (16:9) e este video e vertical")
            if info2["formato"] == "vertical" and longo:
                E(i, f"cenario '{amb}' e vertical (9:16) e este video e longo (16:9)")
            if fx not in info2["fx"]:
                E(i, f"efeito '{fx}' nao existe em '{amb}' (validos: {info2['fx']})")
            hora = cena.get("hora")
            if hora and info2.get("horas") and info2.get("ceu") and hora not in info2["horas"] and cenografo.hora_do_texto(txt) is None:
                A(i, f"hora '{hora}' sem paleta em '{amb}'")
        # 3. elenco e camera
        if motor == "2d":
            n_f = 0 if info2.get("vazio") else min(len(lista_f(amb)), info2["max_f"])
            presentes = set() if info2.get("vazio") else {"prot"} | {f"f{k}" for k in range(n_f)}
            for ln in _falas(cena):
                q = ln.get("quem") or "narrador"
                if q in ("narrador", "radio"):
                    continue
                if q not in presentes:
                    E(i, f"fala de '{q}' mas essa pessoa nao aparece em '{amb}' (em cena: {sorted(presentes) or 'ninguem'})")
            for cam in cena.get("cams") or []:
                m = re.fullmatch(r"f(\d)c?", cam)
                if m and f"f{m.group(1)}" not in presentes:
                    E(i, f"camera '{cam}' aponta para um lugar vazio em '{amb}'")
                if cam.startswith("eu-") and "prot" not in presentes:
                    E(i, f"camera '{cam}' sem protagonista em '{amb}'")
            if fx and info2.get("vazio") and cena.get("falante") not in (None, "", "narrador"):
                E(i, f"'{amb}' nao tem personagens e a cena tem falante '{cena.get('falante')}'")
        # 3b. direcao (formato novo): alvo de camera, trajetorias e gestos tem que existir no cenario
        if cena.get("beats"):
            pontos = cat.PONTOS.get(amb, set())
            ents = cat.ENTIDADES.get(amb, set())
            n_f = len(lista_f(amb))
            pessoas = {"prot"} | {f"f{k}" for k in range(n_f)}
            for bi, b in enumerate(cena["beats"]):
                alvo = b.get("cam") or "ampla"
                if alvo not in pontos | ents | pessoas | cat.ALVOS_GERAIS and not re.fullmatch(r"(eu-\w+|f\dc|pov[\w-]*|alto)", alvo):
                    E(i, f"batida {bi}: camera para '{alvo}', que nao existe em '{amb}'")
                if not (b.get("texto") or "").strip() and not b.get("dur"):
                    A(i, f"batida {bi}: batida muda sem 'dur' (usa 1.4 s)")
                for ev in (b.get("evento") if isinstance(b.get("evento"), list) else [b["evento"]] if b.get("evento") else []):
                    if ev.get("ent") not in ents:
                        E(i, f"batida {bi}: entidade '{ev.get('ent')}' nao existe em '{amb}' (existem: {sorted(ents) or 'nenhuma'})")
                    for k in ("de", "para"):
                        if ev.get(k) and ev[k] not in pontos | {"fora"}:
                            E(i, f"batida {bi}: trajetoria {k} '{ev[k]}' nao e ponto de '{amb}'")
                for ac in b.get("acoes") or []:
                    q = ac.get("quem", "todos")
                    if q != "todos" and q not in pessoas:
                        E(i, f"batida {bi}: acao de '{q}', que nao esta em cena")
                    if ac.get("para") and ac["para"] not in pontos | ents | pessoas | cat.ALVOS_GERAIS:
                        E(i, f"batida {bi}: '{q}' {ac.get('faz')} para '{ac['para']}', que nao existe em '{amb}'")
        # 4. lugar
        liberado = set(cena.get("permite") or [])      # excecao deliberada e revisada: "permite": ["hora", "lugar", "epoca"]
        for nome, rx, ok, msg in LUGARES:
            if "lugar" not in liberado and re.search(rx, txt) and amb not in ok:
                E(i, f"{msg}, mas a cena usa '{amb}' ({(info2 or cat.AMB_3D.get(amb, {})).get('mostra', '')})")
        # 5. epoca
        if motor == "3d":
            era = cat.AMB_3D.get(amb, {}).get("era")
            if "epoca" not in liberado and re.search(EPOCA_MODERNA, cenografo._norm(anterior_txt_ano + " " + txt)) and era in cat.ERAS_ANTIGAS and not re.search(r"\b(passado|antigamente|historia)\b", txt):
                E(i, f"conteudo moderno/futuro/espacial em cenario de epoca antiga ('{amb}' = {cat.AMB_3D[amb]['mostra']})")
            for p in [prot_de(amb)] + list(lista_f(amb)):
                if "epoca" not in liberado and p in PAPEIS_ESPACO and p == "astronauta" and era in cat.ERAS_ANTIGAS:
                    E(i, f"astronauta num cenario de epoca antiga ('{amb}')")
            if amb == "vapor" and any(p in ("marujo", "marujo2") for p in lista_f(amb) + [prot_de(amb)]):
                A(i, "figurino 'marujo' e de caravela, nao de navio a vapor (Titanic)")
        # 6. hora (so cenarios com ceu)
        ceu = (info2 or {}).get("ceu", motor == "3d" and amb in ("conves", "terra", "campo", "cidade", "cidade-antiga", "deserto", "selva", "aerodromo", "vapor", "arena", "muro"))
        h_txt = cenografo.hora_do_texto(" ".join(l.get("texto", "") for l in _falas(cena)) or cena.get("fala", ""))
        if ceu and h_txt and cena.get("hora") and "hora" not in liberado and HORAS_EQ.get(h_txt) != HORAS_EQ.get(cena["hora"], cena["hora"]):
            noite = lambda h: h in ("noite", "madrugada")
            if noite(h_txt) != noite(cena["hora"]):
                E(i, f"o texto diz '{h_txt}' mas o ceu esta '{cena['hora']}' (dia x noite)")
            else:
                A(i, f"o texto diz '{h_txt}' e o ceu esta '{cena['hora']}' (horario proximo)")
    return {"erros": erros, "avisos": avisos}


def exigir(conteudo: dict, quem: str = "") -> None:
    """Levanta SystemExit com a lista de erros (usado antes de renderizar)."""
    r = validar(conteudo)
    for a in r["avisos"]:
        print(f"[coerencia] aviso {conteudo.get('id')}: {a}", flush=True)
    if r["erros"]:
        msg = "\n".join(f"  - {e}" for e in r["erros"][:25])
        raise SystemExit(f"[coerencia] {conteudo.get('id')} BLOQUEADO ({len(r['erros'])} erro(s)):\n{msg}")


def main(argv):
    ids = []
    if argv and argv[0] == "--todos":
        ids = sorted(p.stem for p in config.CONTEUDO_DIR.glob("*.json"))
    else:
        ids = argv
    ruim = 0
    for i in ids:
        c = json.loads((config.CONTEUDO_DIR / f"{i}.json").read_text(encoding="utf-8"))
        r = validar(c)
        if r["erros"] or r["avisos"]:
            print(f"== {i} ({'BLOQUEADO' if r['erros'] else 'ok com avisos'})")
            for e in r["erros"][:12]:
                print("   ERRO :", e)
            for a in r["avisos"][:4]:
                print("   aviso:", a)
        else:
            print(f"== {i}: ok")
        ruim += bool(r["erros"])
    return 1 if ruim else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

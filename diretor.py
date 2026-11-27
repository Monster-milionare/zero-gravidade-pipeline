"""Diretor: transforma o roteiro em uma HISTORIA filmada (o que a camera mostra, o que se mexe, quem reage).

Formato novo (opcional) de cena: "beats" = batidas da historia, em ordem. Cada batida e uma fala OU uma acao
sem fala, e diz pra onde a camera vai:

    {"quem": "narrador|prot|f0|f1|radio", "texto": "...",      # fala (vazio = batida muda, so acao)
     "dur": 1.8,                                               # duracao da batida muda (ou minimo da falada)
     "cam": "ceu|lago|f0|ptero|grupo|ampla|...",               # ALVO da camera (ponto do cenario, personagem ou entidade)
     "mov": "corte|pan|chicote|zoom|recua|segue|tremor|caminha",  # como a camera chega no alvo (caminha = voce anda ate la)
     "transicao": "porta",                                     # abre uma porta para entrar no lugar novo
     "entra": ["f1"],                                          # alguem ENTRA em cena nessa batida (chega andando)
     "zoom": 1.4, "pov": true, "maos": "aponta|binoculo|sino|telefone|neutro",
     "acoes": [{"quem": "f0|todos|prot", "faz": "olha|aponta|susto|anda|corre|esconde|pula|abaixa|comemora", "para": "ceu", "dur": 1.5, "atraso": 0.2}],
     "evento": {"ent": "ptero", "faz": "voa|pousa|anda|surge|some|passa", "de": "ceu-esq", "para": "lago", "dur": 3.0, "atraso": 0.0},
     "sfx": "whoosh|asas|rugido|impacto|sino|telefone|gelo|trovao|passos|vento",
     "clima": "tensa|epica|misterio|aventura|triste|animada"}

Roteiros antigos (so "falas") ganham direcao automatica: a camera vai para o que a fala menciona (lago, ceu,
vulcao...), corta para quem fala, faz plano de reacao em falas longas e separa o "A ou B" em dois movimentos.

A legenda e montada POR FALA: so aparece enquanto a pessoa fala e nunca junta o fim de uma fala com o comeco
de outra (o "DOBRADO OS CIENTISTAS" que o Andre viu).
"""
import re
import subprocess
import unicodedata
import wave
from pathlib import Path

import numpy as np

import render as R
import tts

FORMATOS_POV = ("pov", "pov3d", "voce-acorda", "escolha", "futuro")
MAX_PLANO = 4.2
FX_SEM_ELENCO = {"decolagem"}     # efeitos em que o elenco nao aparece (a tripulacao esta dentro do foguete)           # fala mais longa que isso ganha um segundo plano (reacao/detalhe)
PAUSA_FALA = 0.06

# ---------------------------------------------------------------- pontos de interesse por cenario (auto-direcao)
# alvo -> palavras que, ditas na fala, levam a camera ate ele. O motor ignora alvo que o cenario nao tem.
PONTOS_KW = {
    "selva-cretaceo": {
        "ptero": r"pterossaur\w*|quetzalcoatl\w*|voa\w*|asas?|sombra|gigante do ceu|bicho que (ja )?voou",
        "ceu": r"\bceu\b|nuvens?|\bcima\b|alto",
        "lago": r"\blago\b|\bagua\b|\brio\b|beira",
        "mata": r"\bmata\b|floresta|escond\w*|arbustos?|folhas?",
        "vulcao": r"vulc\w*|fumaca|lava|cinzas?",
        "ninho": r"\bninho\b|\bovos?\b|filhote",
        "trilha": r"pegadas?|rastro|trilha|patas",
        "dinos": r"dinossaur\w*|manada|braquiossaur\w*|pescoco",
        "trex": r"\bt-?rex\b|tiranossaur\w*|predador",
    },
    "roma": {
        "coliseu": r"coliseu|anfiteatro|gladiador\w*|arena",
        "templo": r"templo\w*|deuses|sacrific\w*|altar",
        "arco": r"\barco\b|triunfo",
        "fogo": r"\bfogo\b|chamas?|incendi\w*|queima\w*|fumaca",
        "cidade": r"\broma\b|cidade|forum|ruas?",
        "escadaria": r"escada\w*|degraus",
        "chao": r"\bchao\b|corpos?|mort[oa]s",
    },
    "chernobyl": {
        "reator": r"reator\w*|bloco (quatro|4)|explos\w*|nucleo|telhado",
        "coluna": r"\bazul\b|brilho|luz|coluna",
        "chamine": r"chamine\w*|torre",
        "cidade": r"pripyat|cidade|predios?|casa|familia",
        "roda": r"roda.gigante|parque",
        "caminhao": r"caminh\w*|bombeiros?|mangueira\w*|sirene\w*",
        "grafite": r"grafite|pedras? pretas?|blocos? pretos?|\bchao\b|destrocos",
    },
    "vapor": {
        "iceberg": r"iceberg|gelo|montanha de gelo",
        "mar": r"\bmar\b|oceano|\bagua\b|escuro",
        "proa": r"\bproa\b|\bfrente\b",
        "sino": r"\bsino\b|bate\w*",
        "telefone": r"telefon\w*|ponte de comando|liga\w*",
        "ceu": r"estrelas?|\bceu\b|\blua\b",
        "chamines": r"chamin\w*|fumaca",
        "botes": r"\bbotes?\b|salva-vidas",
    },
}
# papeis genericos (nao sao nome de pessoa): "o marujo" no texto nao aponta a camera para um marujo especifico
NAO_NOMES = {"cidadao", "cidada", "marujo", "nativo", "soldado", "soldado romano", "soldado frances", "soldado ingles",
             "soldado holandes", "controlador", "engenheiro", "cientista", "astronauta", "explorador", "exploradora",
             "guia", "mongol", "campones", "camponesa", "passageira", "passageiro", "bombeiro", "operador", "medico peste",
             "senador", "pretoriano", "escravo", "gladiador", "legionario", "plebeu", "plebeia", "menino", "menina", "dino",
             "bebe tricera", "viking", "egipcio", "samurai", "asteca", "cavaleiro", "engenheiro usina", "liquidador",
             "morador", "moradora", "oficial sovietico", "cidadao romano", "cidada romana", "medico"}
PONTOS_KW.update({
    "cidade-medieval": {"igreja": r"igreja\w*|catedral|sinos?|padre|missa", "poco": r"\bpoco\b|\bagua\b", "mercado": r"mercado|feira|barraca\w*|vende\w*"},
    "cidade-colonial": {"igreja": r"igreja\w*|capela|sinos?|missa", "chafariz": r"chafariz|fonte|praca|\bagua\b"},
    "cidade-vitoriana": {"relogio": r"relogio|torre|horas?\b", "bonde": r"bonde|eletric\w*|trilhos?", "banca": r"jorna\w*|noticia\w*|banca"},
    "cidade-futuro": {"torre": r"torre|predios?|arranha", "carros": r"carros?|voador\w*|voando|drones?"},
    "cidade-oriental": {"pagode": r"pagode|templo|santuario", "torii": r"portal|torii|portao"},
})
PONTOS_KW_GERAIS = {"ceu": r"\bceu\b|estrelas|\blua\b", "grupo": r"todos|voces|grupo|juntos"}


def _norm(t: str) -> str:
    t = unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", t)


def _alvos_mencionados(texto: str, amb: str):
    """-> lista de alvos na ordem em que aparecem no texto."""
    txt = _norm(texto)
    achados = []
    for alvo, rx in list(PONTOS_KW.get(amb, {}).items()) + list(PONTOS_KW_GERAIS.items()):
        m = re.search(rx, txt)
        if m:
            achados.append((m.start(), alvo))
    vistos, saida = set(), []
    for _, a in sorted(achados):
        if a not in vistos:
            vistos.add(a)
            saida.append(a)
    return saida


# ---------------------------------------------------------------- auto-direcao (roteiros sem "beats")
_RX_AB = re.compile(r"^(.*?\bA\b[^,.]*?)(,?\s*ou\s+B\b.*)$", re.S)


def _separar_ab(texto: str):
    """'Comenta A para seguir..., ou B para ficar...' -> ['Comenta A para seguir...,', 'ou B para ficar...']."""
    m = _RX_AB.match(texto.strip())
    if not m or "comenta" not in _norm(texto) and "a ou b" not in _norm(texto):
        return [texto]
    a, b = m.group(1).strip(), m.group(2).strip().lstrip(",").strip()
    if len(a.split()) < 3 or len(b.split()) < 3:
        return [texto]
    return [a + ",", b]


def personagens_mencionados(texto: str, papeis: dict):
    """{'f0': 'lovell-traje', ...} -> ids cujo papel e citado pelo nome no texto ('Jim Lovell' -> f0), na ordem do texto.
    Chaves extras '_nome:f1' -> 'pete conrad' (pessoas reais do roteiro) tambem contam (nome completo ou sobrenome)."""
    txt = _norm(texto)
    achados = []
    for k, nome in papeis.items():
        if k.startswith("_nome:"):
            fid = k.split(":", 1)[1]
            for alvo in (_norm(nome), _norm(nome).split()[-1] if nome.strip() else ""):
                m = re.search(r"\b" + re.escape(alvo) + r"\b", txt) if len(alvo) >= 4 else None
                if m:
                    achados.append((m.start(), fid))
                    break
    prot_base = papeis.get("_prot", "")
    for fid, papel in papeis.items():
        if fid.startswith("_"):
            continue
        base = re.sub(r"(-traje|\d+)$", "", papel or "").replace("-", " ").strip()
        if len(base) < 4 or base in NAO_NOMES or base == prot_base:      # "voce e o vigia" fala de VOCE, nao do outro vigia
            continue
        m = re.search(r"\b" + re.escape(base) + r"(e?s)?\b", txt)
        if m:
            achados.append((m.start(), fid))
    return list(dict.fromkeys(f for _, f in sorted(achados)))


def auto_beats(cena: dict, pov: bool, ultimo_alvo=None, papeis=None):
    """Falas -> batidas dirigidas. Nunca inventa fala: so decide camera, reacoes e efeitos.
    papeis = {'f0': papel, ...} do cenario: quando o narrador cita alguem pelo nome, a camera vai nele."""
    amb = cena.get("amb", "")
    papeis = papeis or {}
    falas = cena.get("falas") or [{"quem": "narrador", "texto": cena.get("fala", "")}]
    enchimento = [x for x in (cena.get("cams") or []) if x not in ("pov",)]
    beats = []
    for f in falas:
        quem = f.get("quem") or "narrador"
        texto = (f.get("texto") or "").strip()
        partes = _separar_ab(texto) if quem == "narrador" else [texto]
        for k, parte in enumerate(partes):
            alvos = _alvos_mencionados(parte, amb)
            gente = personagens_mencionados(parte, papeis) if quem in ("narrador", "radio") else []
            b = {"quem": quem, "texto": parte}
            if gente:
                b["_menciona"] = gente
            if quem in ("narrador", "radio"):
                if gente and not alvos:
                    alvo = gente[0]
                elif alvos:
                    alvo = alvos[0]
                elif enchimento:
                    alvo = enchimento[len(beats) % len(enchimento)]
                    b["_enchimento"] = True
                else:
                    alvo = "grupo" if ultimo_alvo not in (None, "grupo") else "ampla"
                b["cam"] = alvo
                b["mov"] = "chicote" if (len(partes) > 1 and k > 0) else ("pan" if ultimo_alvo and alvo != ultimo_alvo else "zoom")
                if alvo in ("ptero",):
                    b["mov"] = "segue"
                if alvos and alvo == alvos[0] and alvo not in ("ceu", "grupo", "ampla"):
                    b["acoes"] = [{"quem": "todos", "faz": "olha", "para": alvo}]
            elif quem == "prot" and pov:
                # voce e o protagonista: a camera e o seu olho, olhando para o que voce fala ou para o grupo
                b["cam"] = alvos[0] if alvos else "grupo"
                b["pov"] = True
                b["mov"] = "pan" if ultimo_alvo and b["cam"] != ultimo_alvo else "zoom"
                if alvos:
                    b["maos"] = "aponta"
            else:
                b["cam"] = quem
                b["mov"] = "corte"
                if alvos and alvos[0] not in ("grupo",):
                    b["acoes"] = [{"quem": quem, "faz": "aponta", "para": alvos[0]}]
            if "?" in parte and quem != "narrador":
                b.setdefault("acoes", []).append({"quem": "todos", "faz": "olha", "para": quem})
            ultimo_alvo = b["cam"]
            beats.append(b)
    if beats and cena.get("acao") == "anda":        # voce caminha ate o proximo ponto (camera avanca com passos)
        beats[0]["mov"] = "caminha"
        beats[0]["pov"] = True
    if beats and cena.get("acao") == "porta":       # voce abre a porta e o lugar novo aparece
        beats[0]["transicao"] = "porta"
    return beats, ultimo_alvo


# ---------------------------------------------------------------- audio
def _silencio(caminho: Path, dur: float) -> tts.Segment:
    sr = 24000
    with wave.open(str(caminho), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(np.zeros(int(sr * dur), np.int16).tobytes())
    return tts.Segment(text="", audio_path=caminho, duration_sec=dur, words=[])


def _lista(x):
    if not x:
        return []
    return x if isinstance(x, list) else [x]


# ---------------------------------------------------------------- planejamento completo
def planejar(conteudo: dict, sintetizar, elenco_vozes, work: Path):
    """-> dict com: segs, inicios, env, dur_voz, beats (com tempos), shots, eventos, acoes, sfx, legendas,
    tempos_cena, climas. 'sintetizar' e tts.synthesize_sentences (ou o falso dos testes)."""
    cenas = conteudo["cenas"]
    pov = conteudo.get("formato", "") in FORMATOS_POV or bool(conteudo.get("pov"))
    todos, bt, ultimo = [], [], None
    for ci, c in enumerate(cenas):
        c = _quem_para_boneco(conteudo, c)
        if c.get("beats"):
            beats = [dict(b) for b in c["beats"]]
            pap = papeis_do_amb(conteudo, c.get("amb"), com_nomes=True)
            for b in beats:     # narrador citou alguem pelo nome: essa pessoa entra em cena (a camera ja foi escolhida pelo roteiro)
                if (b.get("quem") or "narrador") in ("narrador", "radio") and b.get("texto"):
                    g = personagens_mencionados(b["texto"], pap)
                    if g:
                        b["_menciona"] = g
        else:
            beats, ultimo = auto_beats(c, pov, ultimo, papeis_do_amb(conteudo, c.get("amb"), com_nomes=True))
        for bi, b in enumerate(beats):
            quem = b.get("quem") or "narrador"
            texto = (b.get("texto") or "").strip()
            i0 = len(todos)
            if texto:
                cena_voz = dict(c)
                voz, tom = elenco_vozes.voz(quem, cena_voz)
                ss = sintetizar(texto, work / f"b{ci:02d}_{bi:02d}", voz=voz, tom=tom if (quem != "narrador" or str(tom).startswith("~")) else None)
                todos.extend(ss)
                falado = sum(s.duration_sec for s in ss)
                if b.get("dur") and b["dur"] > falado:
                    todos.append(_silencio(work / f"b{ci:02d}_{bi:02d}_pad.wav", b["dur"] - falado))
            else:
                todos.append(_silencio(work / f"b{ci:02d}_{bi:02d}_mudo.wav", float(b.get("dur") or 1.4)))
            bt.append({"ci": ci, "bi": bi, "quem": quem if texto else "", "texto": texto, "i0": i0, "i1": len(todos), "b": b, "c": c})
    inicios, env, dur_voz = R._montar_audio(todos, work / "voz.wav")
    for x in bt:
        x["a"] = inicios[x["i0"]]
        x["t1"] = inicios[x["i1"]] if x["i1"] < len(inicios) else dur_voz
    tempos_cena = []
    for ci in range(len(cenas)):
        xs = [x for x in bt if x["ci"] == ci]
        tempos_cena.append((xs[0]["a"], xs[-1]["t1"]))

    presenca = calcular_presenca(bt, conteudo, pov)

    def presentes(amb, t):
        if presenca is None:
            return sorted(papeis_do_amb(conteudo, amb))
        return sorted(fid for fid, ints in presenca.items() if any(i[2] == amb and i[0] <= t + 0.05 and t < i[1] for i in ints))

    shots, eventos, acoes, sfx = [], [], [], []
    for k, x in enumerate(bt):
        b, c, a, t1 = x["b"], x["c"], x["a"], x["t1"]
        alvo = b.get("cam") or "ampla"
        mov = b.get("mov") or "corte"
        amb_b = b.get("amb") or c["amb"]
        aqui = presentes(amb_b, a + 0.3)
        fid = re.match(r"^(f\d)c?$", str(alvo))
        if fid and fid.group(1) not in aqui:            # camera num personagem que nao esta em cena: mostra o lugar
            alvo = ("grupo" if aqui else "ampla")
            if mov == "corte":
                mov = "zoom"
        if alvo == "grupo" and not aqui:
            alvo = "ampla"
        if (b.get("fx", c.get("fx", "")) in FX_SEM_ELENCO) and (fid or alvo in ("grupo", "prot") or str(alvo).startswith("eu-")):
            alvo, mov = "ampla", ("recua" if mov == "corte" else mov)      # ninguem fica na base vendo o foguete subir
        base = {"amb": amb_b, "hora": b.get("hora") or c.get("hora"), "falante": x["quem"],
                "fx": b.get("fx", c.get("fx", "")), "pov": bool(b.get("pov", pov and alvo not in ("prot",) and not str(alvo).startswith("eu-"))),
                "maos": b.get("maos")}
        dur = t1 - a
        gente = [g for g in (b.get("_menciona") or []) if g in aqui or presenca is None]
        if len(gente) >= 2 and alvo == gente[0] and mov not in ("segue",):
            # narrador cita varias pessoas ("Ao seu lado estao Alan Bean e Richard Gordon"): um plano para cada uma
            n = len(gente[:3])
            for k, g in enumerate(gente[:3]):
                shots.append(dict(base, t0=a + dur * k / n, t1=a + dur * (k + 1) / n, cam=g, mov=mov if k == 0 else "pan", zoom=b.get("zoom")))
            gente = None
        sem_elenco = b.get("fx", c.get("fx", "")) in FX_SEM_ELENCO
        reac = _alvo_reacao(alvo, x["quem"], c, presentes(amb_b, a + dur * 0.55)) if dur > MAX_PLANO and not sem_elenco else None
        if gente is None:
            pass
        elif reac and mov not in ("segue", "chicote") and not b.get("plano_unico"):
            meio = a + dur * 0.55
            shots.append(dict(base, t0=a, t1=meio, cam=alvo, mov=mov, zoom=b.get("zoom")))
            shots.append(dict(base, t0=meio, t1=t1, cam=reac, mov="corte", zoom=None, maos=None))
            if reac != alvo and reac.startswith("f") and alvo not in ("grupo", "ampla"):
                acoes.append({"quem": reac, "faz": "olha", "para": alvo, "t0": meio, "t1": t1})
        else:
            shots.append(dict(base, t0=a, t1=t1, cam=alvo, mov=mov, zoom=b.get("zoom")))
        if b.get("tremor"):
            shots[-1]["tremor"] = b["tremor"]
        for ac in _lista(b.get("acoes")):
            ta = a + float(ac.get("atraso", 0))
            acoes.append({"quem": ac.get("quem", "todos"), "faz": ac.get("faz", "olha"), "para": ac.get("para", alvo),
                          "t0": ta, "t1": ta + float(ac.get("dur", max(0.6, t1 - ta)))})
            if ac.get("faz") == "susto":
                sfx.append((ta, "susto"))
        for ev in _lista(b.get("evento")):
            ta = a + float(ev.get("atraso", 0))
            d = float(ev.get("dur", max(0.8, t1 - ta)))
            eventos.append({"ent": ev["ent"], "faz": ev.get("faz", "passa"), "de": ev.get("de"), "para": ev.get("para"),
                            "t0": ta, "t1": ta + d, "amb": base["amb"], "dir": ev.get("dir")})
            if ev.get("faz") in ("voa", "passa", "surge") and ev["ent"].startswith("ptero"):
                sfx.append((ta, "asas"))
        for s in _lista(b.get("sfx")):
            if isinstance(s, dict):
                sfx.append((a + float(s.get("atraso", 0)), s.get("nome", "")))
            else:
                sfx.append((a + float(b.get("sfx_atraso", 0)), s))
        if mov == "chicote":
            sfx.append((max(0.0, a - 0.12), "whoosh"))
        if mov == "caminha":
            sfx.append((a, "passos"))
        if b.get("transicao"):              # "porta": voce abre a porta e o novo lugar aparece
            next(s for s in reversed(shots) if s["t0"] <= a + 0.01)["transicao"] = b["transicao"]
            sfx.append((a, "porta" if b["transicao"] == "porta" else "whoosh"))
        if mov == "tremor" or b.get("tremor"):
            sfx.append((a, "impacto"))
    shots[0]["t0"] = 0.0
    shots[-1]["t1"] = dur_voz + 2.0

    # legendas: blocos curtos POR FALA, visiveis so enquanto a fala acontece
    legendas = []
    for x in bt:
        if not x["texto"]:
            continue
        segs = todos[x["i0"]:x["i1"]]
        pal = [p for p in R._palavras_abs(segs, inicios[x["i0"]:x["i1"]]) if p[0].strip()]
        for bl in R._blocos_legenda(pal):
            legendas.append({"palavras": bl, "t0": bl[0][1] - 0.04, "t1": bl[-1][2] + 0.22, "fim_fala": x["t1"], "quem": x["quem"]})
    for i, L in enumerate(legendas):
        lim = L["fim_fala"] - 0.02
        if i + 1 < len(legendas):
            lim = min(lim, legendas[i + 1]["t0"] - 0.01)
        L["t1"] = max(L["t0"] + 0.25, min(L["t1"], lim))

    # clima da musica: o da batida (se o roteiro mandar) ou o da cena
    climas = []
    for x in bt:
        cl = x["b"].get("clima") or x["c"].get("clima")
        climas.append(({"clima": cl} if cl else {"emocao": x["c"].get("emocao", "neutro")}, (x["a"], x["t1"])))
    for ent in presenca or {}:          # passos de quem chega andando
        for t0, t1, amb_e, anda in presenca[ent]:
            if anda:
                sfx.append((t0 + 0.1, "passos"))
    return {"segs": todos, "inicios": inicios, "env": env, "dur_voz": dur_voz, "beats": bt, "shots": shots,
            "eventos": eventos, "acoes": acoes, "sfx": sorted(sfx), "legendas": legendas, "tempos_cena": tempos_cena,
            "climas": climas, "pov": pov, "presenca": presenca}


def _alvo_reacao(alvo: str, quem: str, cena: dict, aqui=None):
    """Plano de reacao: alguem QUE ESTA EM CENA olhando para o que esta sendo mostrado (ou o falante).
    Ninguem em cena -> None (o plano nao e dividido: nunca corta para um lugar vazio)."""
    aqui = list(aqui if aqui is not None else ["f0", "f1", "f2"])
    if quem and quem not in ("narrador", "radio", "prot"):
        if alvo != quem and quem in aqui:
            return quem
        return "grupo" if len(aqui) >= 2 else None
    if not aqui:
        return None
    h = sum(map(ord, (cena.get("fala") or alvo)))
    escolha = aqui[h % len(aqui)]
    if escolha == alvo:
        return "grupo" if len(aqui) >= 2 else None
    return escolha


# ---------------------------------------------------------------- quem esta em cena (entrada progressiva)
def papeis_do_amb(conteudo: dict, amb, com_nomes: bool = False) -> dict:
    """{'f0': papel, 'f1': papel, ...} dos figurantes que esse cenario PODE ter.
    com_nomes: inclui '_nome:fN' -> nome real (campo "pessoas" do roteiro) para a camera achar quem e citado."""
    el = conteudo.get("elenco") or {}
    if amb in (el.get("vazio") or []):
        return {}
    lista = (el.get("amb") or {}).get(amb) or el.get("f") or []
    saida = {f"f{i}": p for i, p in enumerate(lista[:3])}
    if com_nomes:
        pr = (el.get("protAmb") or {}).get(amb) or el.get("prot") or ""
        saida["_prot"] = re.sub(r"(-traje|\d+)$", "", pr).replace("-", " ").strip()
        for p in conteudo.get("pessoas") or []:
            if re.match(r"^f\d$", str(p.get("papel", ""))) and p["papel"] in saida and p.get("nome"):
                saida["_nome:" + p["papel"]] = p["nome"]
    return saida


def _envolvidos(x) -> list:
    """Quem a batida coloca em cena: quem fala, quem a camera mira (de proposito), quem age, quem e citado ou 'entra'."""
    b = x["b"]
    ids = []
    if re.match(r"^f\d$", x["quem"] or ""):
        ids.append(x["quem"])
    m = re.match(r"^(f\d)c?$", str(b.get("cam") or ""))
    if m and (not b.get("_enchimento") or x["a"] > 3.0):
        # camera de enchimento (roteiro so com narrador) tambem traz a pessoa, mas nunca na abertura (voce sozinho)
        ids.append(m.group(1))
    for ac in _lista(b.get("acoes")):
        for k in ("quem", "para"):
            if re.match(r"^f\d$", str(ac.get(k) or "")):
                ids.append(ac[k])
    ids += list(b.get("_menciona") or []) + list(_lista(b.get("entra")))
    return [i for i in dict.fromkeys(ids)]


def calcular_presenca(bt: list, conteudo: dict, pov: bool):
    """-> {'f0': [[t0, t1, amb, chega_andando], ...]} ou None (elenco fixo, comportamento antigo).

    Regra do Andre: a historia se CONSTROI. No primeiro lugar do video voce comeca sozinho e cada pessoa
    ENTRA (chega andando) quando fala, quando a camera vai nela ou quando o narrador a cita. Num lugar novo
    (corte de cena) so aparece quem participa dali: quem ja mora no lugar (ex.: o capitao na ponte de
    comando) ja esta la desde o comeco; ninguem e 'teletransportado' junto so por ter aparecido antes.
    A cena pode forcar: "presentes": ["f0"] (ja estao la) e a batida: "entra": ["f1"]."""
    if conteudo.get("elenco_fixo") or not bt:
        return None
    blocos, atual = [], None
    for x in bt:
        amb = x["b"].get("amb") or x["c"].get("amb")
        if atual is None or atual["amb"] != amb:
            atual = {"amb": amb, "xs": [], "t0": x["a"]}
            blocos.append(atual)
        atual["xs"].append(x)
        atual["t1"] = x["t1"]
    blocos[-1]["t1"] = bt[-1]["t1"] + 3.0
    for k in range(len(blocos) - 1):
        blocos[k]["t1"] = blocos[k + 1]["t0"]
    pres = {}
    for bi, bl in enumerate(blocos):
        possiveis = papeis_do_amb(conteudo, bl["amb"])
        if not possiveis:
            continue
        entrada = {}
        for x in bl["xs"]:
            for fid in _envolvidos(x):
                if fid in possiveis and fid not in entrada:
                    # quem chega para FALAR comeca a andar um pouco antes: quando a camera corta, ele ja esta chegando
                    entrada[fid] = max(bl["t0"], x["a"] - 0.7) if x["quem"] == fid else x["a"]
        fixos = set()
        for x in bl["xs"]:
            fixos |= {f for f in _lista(x["c"].get("presentes")) if f in possiveis}
        # figurante GENERICO que nao participa do trecho (controladores de Houston, passageiros no convés) e
        # parte do cenario: ja esta la, ao fundo. Personagem com nome so aparece quando a historia o chama.
        for fid, papel in possiveis.items():
            base = re.sub(r"(-traje|\d+)$", "", papel or "").replace("-", " ").strip()
            if bi > 0 and fid not in entrada and base in NAO_NOMES and not conteudo.get("so_quem_participa"):
                fixos.add(fid)
        for fid in fixos:
            entrada[fid] = bl["t0"]
        for fid, te in entrada.items():
            if fid in fixos:
                anda, t0 = False, bl["t0"]
            elif bi == 0 or _entra_explicito(bl["xs"], fid):
                # primeiro lugar do video (ou "entra" do roteiro): chega andando quando a historia pede
                anda, t0 = te > bl["t0"] + 0.05 or bi == 0, te
            else:
                anda, t0 = False, bl["t0"]       # lugar novo: quem participa dali ja esta la
            pres.setdefault(fid, []).append([round(t0, 3), round(bl["t1"], 3), bl["amb"], bool(anda)])
    return pres


def _entra_explicito(xs, fid) -> bool:
    return any(fid in _lista(x["b"].get("entra")) for x in xs)


def _quem_para_boneco(conteudo: dict, cena: dict) -> dict:
    """Roteiro que escreve o NOME do papel em "quem" (ex.: "camponesa") vira "f0/f1/f2" ou "prot". Sem isso a pessoa
    nao entrava em cena, a camera nao ia nela e a voz saia como a do narrador (masculina ate para mulher)."""
    el = conteudo.get("elenco") or {}
    amb = cena.get("amb", "")
    lista = ((el.get("amb") or {}).get(amb) or el.get("f") or [])[:3]
    prot = (el.get("protAmb") or {}).get(amb) or el.get("prot")

    def troca(x):
        q = x.get("quem")
        if not q or q in ("narrador", "radio", "prot") or re.match(r"^f\d$", q):
            return x
        if q in lista:
            return dict(x, quem=f"f{lista.index(q)}")
        if q == prot:
            return dict(x, quem="prot")
        print(f"[diretor] aviso: '{q}' fala em '{amb}' mas nao esta no elenco desse cenario", flush=True)
        return x

    cena = dict(cena)
    for k in ("falas", "beats"):
        if cena.get(k):
            cena[k] = [troca(x) for x in cena[k]]
    return cena


def legenda_em(legendas, t, idx=0):
    """-> (indice, bloco) visivel no instante t, ou (indice, None). 'idx' acelera a busca (tempo so avanca)."""
    while idx < len(legendas) - 1 and t >= legendas[idx + 1]["t0"]:
        idx += 1
    if legendas and legendas[idx]["t0"] <= t <= legendas[idx]["t1"]:
        return idx, legendas[idx]
    return idx, None

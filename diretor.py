"""Diretor: transforma o roteiro em uma HISTORIA filmada (o que a camera mostra, o que se mexe, quem reage).

Formato novo (opcional) de cena: "beats" = batidas da historia, em ordem. Cada batida e uma fala OU uma acao
sem fala, e diz pra onde a camera vai:

    {"quem": "narrador|prot|f0|f1|radio", "texto": "...",      # fala (vazio = batida muda, so acao)
     "dur": 1.8,                                               # duracao da batida muda (ou minimo da falada)
     "cam": "ceu|lago|f0|ptero|grupo|ampla|...",               # ALVO da camera (ponto do cenario, personagem ou entidade)
     "mov": "corte|pan|chicote|zoom|recua|segue|tremor",       # como a camera chega no alvo
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
MAX_PLANO = 4.2           # fala mais longa que isso ganha um segundo plano (reacao/detalhe)
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


def auto_beats(cena: dict, pov: bool, ultimo_alvo=None):
    """Falas -> batidas dirigidas. Nunca inventa fala: so decide camera, reacoes e efeitos."""
    amb = cena.get("amb", "")
    falas = cena.get("falas") or [{"quem": "narrador", "texto": cena.get("fala", "")}]
    beats = []
    for f in falas:
        quem = f.get("quem") or "narrador"
        texto = (f.get("texto") or "").strip()
        partes = _separar_ab(texto) if quem == "narrador" else [texto]
        for k, parte in enumerate(partes):
            alvos = _alvos_mencionados(parte, amb)
            b = {"quem": quem, "texto": parte}
            if quem in ("narrador", "radio"):
                alvo = alvos[0] if alvos else ("grupo" if ultimo_alvo not in (None, "grupo") else "ampla")
                b["cam"] = alvo
                b["mov"] = "chicote" if (len(partes) > 1 and k > 0) else ("pan" if ultimo_alvo and alvo != ultimo_alvo else "zoom")
                if alvo in ("ptero",):
                    b["mov"] = "segue"
                if alvos and alvo not in ("ceu", "grupo", "ampla"):
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
        if c.get("beats"):
            beats = [dict(b) for b in c["beats"]]
        else:
            beats, ultimo = auto_beats(c, pov, ultimo)
        for bi, b in enumerate(beats):
            quem = b.get("quem") or "narrador"
            texto = (b.get("texto") or "").strip()
            i0 = len(todos)
            if texto:
                cena_voz = dict(c)
                voz, tom = elenco_vozes.voz(quem, cena_voz)
                ss = sintetizar(texto, work / f"b{ci:02d}_{bi:02d}", voz=voz, tom=tom if quem != "narrador" else None)
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

    shots, eventos, acoes, sfx = [], [], [], []
    for k, x in enumerate(bt):
        b, c, a, t1 = x["b"], x["c"], x["a"], x["t1"]
        alvo = b.get("cam") or "ampla"
        mov = b.get("mov") or "corte"
        base = {"amb": b.get("amb") or c["amb"], "hora": b.get("hora") or c.get("hora"), "falante": x["quem"],
                "fx": c.get("fx", ""), "pov": bool(b.get("pov", pov and alvo not in ("prot",) and not str(alvo).startswith("eu-"))),
                "maos": b.get("maos")}
        dur = t1 - a
        if dur > MAX_PLANO and mov not in ("segue", "chicote") and not b.get("plano_unico"):
            meio = a + dur * 0.55
            shots.append(dict(base, t0=a, t1=meio, cam=alvo, mov=mov, zoom=b.get("zoom")))
            reac = _alvo_reacao(alvo, x["quem"], c)
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
    return {"segs": todos, "inicios": inicios, "env": env, "dur_voz": dur_voz, "beats": bt, "shots": shots,
            "eventos": eventos, "acoes": acoes, "sfx": sorted(sfx), "legendas": legendas, "tempos_cena": tempos_cena,
            "climas": climas, "pov": pov}


def _alvo_reacao(alvo: str, quem: str, cena: dict) -> str:
    """Plano de reacao: alguem do grupo olhando para o que esta sendo mostrado (ou o falante, se for personagem)."""
    if quem and quem not in ("narrador", "radio", "prot"):
        return quem if alvo != quem else "grupo"
    n = len((cena.get("elenco_amb") or [])) or 3
    h = sum(map(ord, (cena.get("fala") or alvo)))
    escolha = f"f{h % max(1, min(n, 3))}"
    return escolha if alvo != escolha else "grupo"


def legenda_em(legendas, t, idx=0):
    """-> (indice, bloco) visivel no instante t, ou (indice, None). 'idx' acelera a busca (tempo so avanca)."""
    while idx < len(legendas) - 1 and t >= legendas[idx + 1]["t0"]:
        idx += 1
    if legendas and legendas[idx]["t0"] <= t <= legendas[idx]["t1"]:
        return idx, legendas[idx]
    return idx, None

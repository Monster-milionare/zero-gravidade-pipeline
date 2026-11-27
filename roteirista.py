#!/usr/bin/env python3
"""Escreve roteiros novos no mesmo formato dos 10 de teste, via Groq (gratis).
Pega o proximo tema de temas.txt que ainda nao virou conteudo/*.json.
Valida (tamanho, estrutura, sem tracos longos) e tenta ate 3 vezes."""
import json
import re
import sys
import unicodedata

import requests

import config

PROMPT_PLANOB = """Voce e roteirista de Shorts virais em portugues do Brasil para o canal "Plano B da Historia" (historia alternativa e suspense historico, animacao 3D de bonecos redondinhos).
Formato: {formato}. Tema: {titulo}

OBJETIVO: o espectador precisa ESCOLHER ASSISTIR (nao deslizar) e ver ate o fim e REASSISTIR. Tudo abaixo existe pra isso.

ESTRUTURA OBRIGATORIA (45 a 60 segundos de fala, 105 a 150 palavras no total):
1. GANCHO (cena 1, no maximo 14 palavras): uma afirmacao chocante, um numero concreto ou uma pergunta que o espectador PRECISA ver respondida. Nada de "ola", "hoje vamos falar", nem repetir o titulo palavra por palavra. Ex bons: "Em 1969, o computador da Apollo 11 quase cancelou a Lua." / "Voce tem 40 segundos pra decidir quem vive."
2. LACUNA ABERTA (cena 2): prometa algo concreto que so sera revelado no fim ("o ultimo detalhe muda tudo"), mas SO se voce realmente entregar.
3. ESCALADA (cenas 3 a 6): a cada cena sobe a tensao ou a surpresa. Cada cena traz um fato novo, um numero ou uma reviravolta. Frases curtas (4 a 14 palavras), ritmo de narrador de suspense. Corte qualquer enrolacao.
4. VIRADA (penultima cena): a revelacao prometida, a consequencia mais inesperada.
5. FECHO EM LOOP (ultima cena): uma pergunta para o espectador VOTAR nos comentarios entre duas opcoes ("Comenta VERMELHO ou AZUL") e uma frase final que reconecta com a primeira frase do video, de modo que ao reiniciar tudo faca sentido de novo.

REGRAS DE VERDADE (nao negociaveis):
- Fatos historicos (datas, nomes, numeros) tem que ser REAIS e verificaveis. Se nao tiver certeza, NAO cite. Proibido inventar "detalhe que ninguem viu", estatistica ou citacao.
- A parte hipotetica deve vir marcada ("imagine", "talvez", "e so uma hipotese").
- Numeros falados por extenso na fala; o campo "ano" pode ter digitos.
- Sem tracos longos, emojis, asteriscos, hashtags.

CENAS: 7 a 9 cenas. Cada cena: "fala" (1 a 2 frases, o texto completo da cena), "emocao" (neutro|feliz|surpreso|preocupado|misterioso), opcional "ano", "destaques" (1 a 3 palavras da fala para enfatizar na legenda), "visuais" (lista com 1 descricao curta em INGLES). Opcional "cenario" com um destes: conves, terra, cabine, palacio, cidade-antiga (Roma/Grecia/Egito), cidade-medieval (Europa 1300-1500), cidade-colonial (Brasil/Americas 1600-1850), cidade-vitoriana (1850-1930), cidade-futuro (2050+), cidade-oriental (Japao/China antigos), campo, laboratorio, lua, arena, deserto, aerodromo, selva (use quando o lugar for obvio; cidade SEMPRE a da epoca certa). Opcional "hora" (dia, manha, amanhecer, tarde, entardecer, noite, madrugada): o CEU do video segue isso, entao se a fala diz "na manha seguinte" ou "a noite", ponha a hora certa (se a fala ja cita a hora, o sistema deduz sozinho).
- DIVISAO DE FALAS (obrigatorio): cada cena traz tambem "falas": lista de {{"quem": "narrador"|"prot"|"f0"|"f1"|"f2", "texto": "..."}}. O NARRADOR conta e contextualiza; os PERSONAGENS falam em primeira pessoa, com frases curtas de ate 10 palavras ("prot" = o protagonista, "f0/f1/f2" = os outros bonecos da cena). Pelo menos 3 cenas devem ter fala de personagem, alternando quem fala, como um mini dialogo. O campo "fala" tem que ser exatamente todos os "texto" juntos, em ordem. Cada voz e diferente, entao nao ponha duas falas seguidas do mesmo "quem" sem necessidade.
- CONTINUIDADE (voce sera reprovado se errar): o lugar, a hora do dia, a epoca e quem esta na cena tem que bater com a fala. "Manha seguinte" nao pode ser de noite; ninguem usa objeto que ainda nao existia; quem morreu nao fala.
- Se o formato for "escolha": o espectador decide o destino. A ultima cena apresenta DUAS opcoes concretas e opostas e pede o voto: "Comenta A para <opcao A> ou B para <opcao B>". O proximo episodio segue a opcao mais votada, entao diga isso ("a mais votada vira o proximo episodio"). Narre em primeira pessoa, com perigo ou decisao iminente.
- Se o formato for "futuro": o espectador acorda no ano indicado (ex.: 2100) no meio da sociedade; mostre COMO e a vida (trabalho, comida, moradia, governo, tecnologia), com consequencias surpreendentes e coerentes com tendencias reais de hoje. Deixe claro que e uma projecao ("segundo projecoes", "imagine"), nunca afirme o futuro como fato. Termine com voto A ou B sobre o que fazer.
- Se o formato for "pov" ou "pov3d": narre em PRIMEIRA PESSOA, como se o espectador fosse o personagem, sempre com perigo ou decisao iminente.
- Inclua "thumb_texto" (gancho de 2 a 4 palavras em MAIUSCULAS que gere curiosidade), "titulo_curto" (ate 24 caracteres, MAIUSCULAS), "titulo_youtube" (ate 62 caracteres, com lacuna de curiosidade e um nome ou numero concreto, sem clickbait falso) e "comentario_fixado" (1 frase que pergunta a opiniao e repete a votacao).
HISTORIA CONSTRUIDA (regra do Andre, a mais importante): o video e um FILME em primeira pessoa, nao uma apresentacao de elenco.
- Cena 1: SO VOCE ("prot") no lugar. O narrador diz onde voce esta e o que voce ve ou ouve. Nenhum figurante fala na cena 1.
- Os personagens ENTRAM UM POR VEZ, quando a historia precisa deles: a PRIMEIRA fala de um figurante e o momento em que ele aparece
  (o narrador pode anunciar: "um colega chega correndo", "o capitao se vira pra voce"). Nunca apresente todo mundo de uma vez.
- Tem ACAO: voce ve algo ao longe, aponta, chama alguem, ANDA ate outro lugar, ABRE uma porta, pega o radio. Para mostrar isso,
  a cena pode ter "acao": "anda" (voce caminha ate o proximo ponto) ou "porta" (voce abre a porta e o lugar novo aparece).
- Exemplo do Titanic: voce no convés, passageiros passeando; voce ve o iceberg ao longe; vira pra um marujo ("tem um iceberg!");
  "acao": "anda" ate a ponte; "acao": "porta" e o capitao ja esta la dentro; ele pergunta o que houve; a decisao A ou B.
- Use os figurantes com papeis DIFERENTES entre si (nada de dois iguais) e so quem faz sentido estar naquele lugar.
TEMA QUENTE (regra do canal): o assunto e escolhido para gerar CLIQUE e debate (desastres, imperios, pestes, guerras,
ditadores, decisoes impossiveis). Pese a mao no drama e na decisao, mas SEMPRE com fato real e sem glorificar violencia.
Temas sensiveis (YouTube desmonetiza apologia):
- Segunda Guerra/Alemanha de 1933-1945: NUNCA escreva as palavras "nazista", "nazismo", "Hitler" nem "suastica" e nunca descreva
  simbolos do regime. Diga "Terceiro Reich", "o regime", "o partido", "o ditador de bigodinho". O ponto de vista e de gente comum
  tentando sobreviver ou fugir do regime; humor so as custas do ditador e do regime, NUNCA das vitimas; sem piada com perseguicao,
  campos ou mortes.
- Desastres e pestes: respeito as vitimas, nada de piada com mortos; numeros so se forem reais.
{bloco_2d}
Responda SOMENTE com JSON valido: {{"descricao": "...", "tags": ["..."], "thumb_texto": "...", "titulo_curto": "...", "titulo_youtube": "...", "comentario_fixado": "...", {campo_elenco}"cenas": [ ... ]}}"""

# Temas que tem cenario no motor 2D ilustrado (o motor principal: 3 de cada 4 Shorts do dia).
# Se o titulo bater com "rx", o roteiro e escrito para esse cenario 2D (amb fixo, hora da lista, elenco do menu).
PRESETS_2D = {
    "roma": dict(rx=r"\broma\b|romano|marco aurelio|comodo|trajano|adriano|gladiador|coliseu|legiao|legionario|nero",
                 horas=["manha", "dia", "tarde", "entardecer", "noite", "incendio"],
                 nota="Forum Romano no seculo II com o Coliseu ao fundo (o Coliseu so ficou pronto em 80 d.C.: historia de antes disso usa SO a hora 'incendio', que mostra Roma em chamas no ano 64, sem o Coliseu)",
                 comuns=["cidadao-romano", "cidada-romana", "legionario", "escravo", "senador"],
                 papeis=["marco-aurelio", "comodo", "nero", "galeno", "senador", "legionario", "centuriao", "cidadao-romano", "cidada-romana", "escravo"]),
    "chernobyl": dict(rx=r"chernobyl|tchernobyl|pripyat|reator nuclear|usina nuclear|radiacao",
                      horas=["noite", "madrugada", "dia", "evacuacao"],
                      nota="Usina de Chernobyl em 1986: bloco 4 destruido, chamine listrada, Pripyat ao fundo. Hora 'evacuacao' = 27/04 com os onibus.",
                      comuns=["bombeiro2", "morador", "moradora", "bombeiro", "operador"],
                 papeis=["bombeiro", "bombeiro2", "operador", "engenheiro-usina", "liquidador", "morador", "moradora", "oficial-sovietico"]),
    "selva-cretaceo": dict(rx=r"dinossaur|cretaceo|t-?rex|pterossaur|jurassic|asteroide",
                           horas=["manha", "dia", "tarde", "entardecer", "impacto", "noite"],
                           nota="Selva do Cretaceo com vulcao, lago e dinossauros. Hora 'impacto' = o dia do asteroide.",
                           comuns=["exploradora", "guia", "explorador"],
                 papeis=["explorador", "exploradora", "guia", "bebe-tricera"]),
}


def preset_2d(titulo: str):
    t = unicodedata.normalize("NFKD", titulo).encode("ascii", "ignore").decode().lower()
    for amb, p in PRESETS_2D.items():
        if re.search(p["rx"], t):
            return amb, p
    return None, None


def _bloco_2d(amb, p) -> str:
    if not amb:
        return ""
    return (f"\nCENARIO 2D FIXO: todas as cenas acontecem em '{amb}' ({p['nota']}). Nao use o campo 'cenario'. Cada cena TEM que ter "
            f"'hora' de uma destas: {', '.join(p['horas'])}. ELENCO: escolha 'prot' (quem o espectador e) e de 1 a 3 figurantes 'f' "
            f"(f0, f1, f2 nas falas, NESSA ordem) SO desta lista: {', '.join(p['papeis'])}. Quem nao estava la nao aparece.\n")

CRITICO = """Voce e um editor severo de Shorts virais. Avalie este roteiro (JSON) para o tema "{titulo}".
De nota de 0 a 10 para: gancho (a primeira cena faria alguem parar de deslizar em 2 segundos?), tensao crescente (a historia se CONSTROI: voce comeca sozinho, os personagens entram um a um, ha acao e deslocamento; apresentar todo mundo de uma vez = nota baixa), final em loop com voto, continuidade (hora do dia, lugar, epoca e personagens batem com as falas? dialogos naturais e bem divididos entre narrador e personagens?) e risco factual (0 = nada inventado, 10 = muito inventado).
Se QUALQUER nota de gancho/tensao/loop/continuidade for menor que 8 ou risco factual maior que 2, REESCREVA o roteiro inteiro corrigindo os problemas, mantendo o formato JSON identico e os fatos reais.
Responda SOMENTE com JSON: {{"notas": {{"gancho": n, "tensao": n, "loop": n, "continuidade": n, "risco_factual": n}}, "roteiro": <o roteiro, reescrito se preciso, no mesmo formato>}}
ROTEIRO:
{roteiro}"""


def _slug(t: str) -> str:
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:40]


def proximo_tema():
    feitos = {p.stem.split("-", 1)[1] for p in config.CONTEUDO_DIR.glob("*.json") if "-" in p.stem}
    for linha in (config.BASE_DIR / "temas.txt").read_text(encoding="utf-8").splitlines():
        if "|" not in linha:
            continue
        fmt, titulo = linha.split("|", 1)
        if _slug(titulo) not in feitos:
            return fmt.strip(), titulo.strip()
    return None


def _validar(d: dict):
    cenas = d.get("cenas")
    if not isinstance(cenas, list) or not 6 <= len(cenas) <= 10:
        return "numero de cenas fora de 6-10"
    if len(str(cenas[0].get("fala", "")).split()) > 18:
        return "gancho longo demais (max 18 palavras)"
    if not any(w in str(cenas[-1].get("fala", "")).lower() for w in ("comenta", "vermelho", "azul", "vota")):
        return "ultima cena sem pedido de voto/comentario"
    total = 0
    for c in cenas:
        if not isinstance(c.get("fala"), str):
            return "cena sem fala"
        c.setdefault("visuais", [c.get("cenario", "cinematic scene")])
        if not isinstance(c["visuais"], list) or not c["visuais"]:
            c["visuais"] = ["cinematic scene"]
        if any(x in c["fala"] for x in ("—", "–", "*", "#")):
            return "caractere proibido na fala"
        if c.get("falas"):
            ok = isinstance(c["falas"], list) and all(isinstance(x, dict) and isinstance(x.get("texto"), str) for x in c["falas"])
            if not ok:
                return "falas mal formadas"
            for x in c["falas"]:
                if x.get("quem") not in ("narrador", "prot", "f0", "f1", "f2"):
                    x["quem"] = "narrador"
            c["fala"] = " ".join(x["texto"].strip() for x in c["falas"])
            if any(ch in c["fala"] for ch in ("—", "–", "*", "#")):
                return "caractere proibido na fala"
        total += len(c["fala"].split())
        c.setdefault("emocao", "neutro")
        if c["emocao"] not in ("neutro", "feliz", "surpreso", "preocupado", "misterioso"):
            c["emocao"] = "neutro"
    for x in cenas[0].get("falas") or []:      # historia construida: na cena 1 voce esta sozinho
        if str(x.get("quem", "")).startswith("f"):
            return "na cena 1 so o narrador e voce (prot) falam: os figurantes entram depois"
    for c in cenas:
        if c.get("acao") not in (None, "", "anda", "porta"):
            c.pop("acao", None)
    if sum(1 for c in cenas if any(x.get("quem") != "narrador" for x in c.get("falas", []))) < 2:
        return "poucas falas de personagem (minimo 2 cenas com dialogo)"
    if not 95 <= total <= 160:
        return f"{total} palavras (precisa 95-160)"
    return None


def _validar_2d(d: dict, amb: str, p: dict):
    el = d.get("elenco") or {}
    papeis = [el.get("prot")] + list(el.get("f") or [])
    if not el.get("prot") or any(x not in p["papeis"] for x in papeis) or not 1 <= len(el.get("f") or []) <= 3:
        return f"elenco 2D invalido: {el}"
    n_f = len(el["f"])
    for c in d.get("cenas", []):
        if c.get("hora") not in p["horas"]:
            c["hora"] = p["horas"][0] if not c.get("hora") else c["hora"]
            if c["hora"] not in p["horas"]:
                return f"hora '{c.get('hora')}' nao existe em {amb}"
        for x in c.get("falas") or []:
            q = x.get("quem", "narrador")
            if q.startswith("f") and q[1:].isdigit() and int(q[1:]) >= n_f:
                return f"fala de {q} mas o elenco so tem {n_f} figurantes"
    return None


def _groq(prompt: str, temp: float = 0.8):
    r = requests.post("https://api.groq.com/openai/v1/chat/completions", timeout=180,
                      headers={"Authorization": f"Bearer {config.GROQ_API_KEY}"},
                      json={"model": config.GROQ_MODEL, "temperature": temp, "response_format": {"type": "json_object"},
                            "messages": [{"role": "user", "content": prompt}]})
    return json.loads(r.json()["choices"][0]["message"]["content"])


def _quer_2d(titulo: str, motor_de=None):
    """Motor do roteiro novo. Pente fino de 26/11: o 3D rende ~2x mais views, entao o 2D so e escrito para manter um
    estoque minimo (1 Short 2D por dia) ou para continuar um episodio que ja era 2D."""
    if motor_de is not None:
        if motor_de.get("motor") != "2d":
            return None, None
        amb = motor_de.get("tema") or next((x.get("amb") for x in motor_de.get("cenas", []) if x.get("amb")), None)
        return (amb, PRESETS_2D[amb]) if amb in PRESETS_2D else preset_2d(titulo)
    return None, None          # Andre 27/11: roteiro novo e sempre 3D (o 2D so continua episodio que ja era 2D)
    amb2d, p2d = preset_2d(titulo)
    if not amb2d:
        return None, None
    try:
        import publish
        estoque_2d = sum(1 for c in publish.pendentes() if c.get("motor") == "2d")
    except Exception:
        estoque_2d = 0
    return (amb2d, p2d) if estoque_2d < 3 else (None, None)


def gerar(fmt: str, titulo: str, contexto: str = "", motor_de=None):
    """Rascunho -> critico severo (reescreve se gancho/tensao/loop < 8 ou risco factual > 2) -> validacao.
    contexto: instrucoes extras (ex.: continuacao pelo voto); motor_de: roteiro anterior (continua no mesmo motor/cenario)."""
    if not config.GROQ_API_KEY:
        print("[roteirista] GROQ_API_KEY ausente.")
        return None
    melhor = None
    amb2d, p2d = _quer_2d(titulo, motor_de)
    for tentativa in range(4):
        try:
            d = _groq(PROMPT.format(formato=fmt, titulo=titulo, bloco_2d=_bloco_2d(amb2d, p2d) + (contexto or ""),
                                    campo_elenco='"elenco": {"prot": "...", "f": ["...", "..."]}, ' if amb2d else ""))
            if amb2d and _validar_2d(d, amb2d, p2d):
                print(f"[roteirista] tentativa {tentativa + 1}: {_validar_2d(d, amb2d, p2d)}")
                continue
            if _validar(d):
                print(f"[roteirista] tentativa {tentativa + 1}: {_validar(d)}")
                continue
            try:
                av = _groq(CRITICO.format(titulo=titulo, roteiro=json.dumps(d, ensure_ascii=False)), 0.4)
                n = av.get("notas", {})
                print(f"[roteirista] notas do critico: {n}")
                r2 = av.get("roteiro")
                if isinstance(r2, dict) and amb2d and not r2.get("elenco"):
                    r2["elenco"] = d.get("elenco")
                if isinstance(r2, dict) and not _validar(r2) and not (amb2d and _validar_2d(r2, amb2d, p2d)):
                    d = r2
            except Exception as exc:
                n = {}
                print(f"[roteirista] critico falhou ({str(exc)[:80]}); usando o rascunho validado")
            melhor = d
            if min(n.get("gancho", 8), n.get("tensao", 8), n.get("loop", 8)) >= 8 and n.get("risco_factual", 0) <= 2:
                return d
        except Exception as exc:
            print(f"[roteirista] tentativa {tentativa + 1} falhou: {str(exc)[:120]}")
    return melhor


FILA_ALVO = 10     # 4 Shorts por dia: a fila nunca deve ficar abaixo de ~2 dias e meio
MAX_POR_DISPARO = 3


def main() -> int:
    if "--se-fila-curta" in sys.argv:
        import publish
        escritos = 0
        while sum(1 for c in publish.pendentes() if c.get("motor") != "2d") < FILA_ALVO and escritos < MAX_POR_DISPARO:   # estoque 3D
            if _um() is None:
                break
            escritos += 1
        if not escritos:
            print(f"[roteirista] fila com {FILA_ALVO}+ roteiros - nada a escrever.")
        return 0
    _um()
    return 0


def _um():
    t = proximo_tema()
    if not t:
        print("[roteirista] temas.txt acabou - adicione mais temas.")
        return None
    fmt, titulo = t
    d = gerar(fmt, titulo)
    if not d:
        return None
    amb2d, p2d = _quer_2d(titulo)
    ordem = 1 + max([json.loads(p.read_text(encoding="utf-8")).get("ordem", 0) for p in config.CONTEUDO_DIR.glob("*.json")] or [0])
    c = {"id": f"{ordem:02d}-{_slug(titulo)}", "ordem": ordem, "formato": fmt, "titulo": titulo,
         "descricao": d.get("descricao", titulo), "tags": d.get("tags", []), "cenas": d["cenas"],
         "thumb_texto": d.get("thumb_texto", ""), "titulo_curto": d.get("titulo_curto", ""),
         "titulo_youtube": d.get("titulo_youtube", ""), "comentario_fixado": d.get("comentario_fixado", "")}
    if amb2d and d.get("elenco"):
        c["motor"], c["tema"] = "2d", amb2d
        c["elenco"] = {"prot": d["elenco"]["prot"], "f": list(d["elenco"]["f"])}
        for extra in p2d.get("comuns") or p2d["papeis"]:      # o cenario tem 3 lugares de figurante: completa com gente comum
            if len(c["elenco"]["f"]) >= 3:
                break
            if extra not in c["elenco"]["f"] and extra != c["elenco"]["prot"]:
                c["elenco"]["f"].append(extra)
        for cena in c["cenas"]:
            cena.pop("cenario", None)
            cena["amb"] = amb2d
    for cena in c["cenas"]:
        if cena.get("cenario") and not cena.get("amb"):
            cena["amb"] = cena.pop("cenario")
    (config.CONTEUDO_DIR / f"{c['id']}.json").write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[roteirista] novo roteiro: {c['id']}")
    return c["id"]


if __name__ == "__main__":
    sys.exit(main())

# NFI: roteirista do canal de humor "Nao Faca Isso"
PROMPT = """Voce e roteirista de Shorts de HUMOR ABSURDO em portugues do Brasil para o canal "Nao Faca Isso" (animacao 3D de bonecos redondinhos).
Formato: {formato}. Tema: {titulo}{bloco_2d}

O CANAL: o manual do que NUNCA fazer na vida. O protagonista e sempre o JORGINHO ("prot"), um cara sem nocao que faz exatamente o que
nao se deve, do jeito mais ABSURDO possivel, na frente de quem nao devia. O narrador e um brasileiro zoeiro que fala como amigo no bar:
girias, palavrao liberado (porra, caralho, merda, cacete, puta que pariu, vai tomar no cu) quando a piada pede, ritmo rapido.
O humor vem do ABSURDO e da reacao das pessoas (ex.: no primeiro encontro, o Jorginho sobe na mesa e caga na frente da crush).

ESTRUTURA (35 a 50 segundos de fala, 90 a 130 palavras no total, 7 a 9 cenas):
1. GANCHO (cena 1, ate 14 palavras): "Primeiro encontro? Presta atencao, porque o Jorginho fez TUDO errado." Ja com a crush/o chefe na cena.
2. TRES REGRAS. Cada regra ocupa 2 cenas:
   a) o narrador anuncia ("Regra numero um: nunca, em hipotese alguma, ...") e o Jorginho FAZ a besteira (batida muda com acao);
   b) a REACAO: a outra pessoa xinga ou reage curto e grosso (ate 10 palavras) e entra o carimbo "NAO FACA ISSO".
   A terceira regra e a MAIS absurda (escalada).
3. FECHO (ultima cena): "Comenta a pior coisa que voce ja fez num <situacao>. E segue, que o Jorginho nao aprende nunca."

USE "beats" (batidas) em cada cena: lista de {{"quem": "narrador|prot|f0|f1|f2", "texto": "...", "cam": "...", "acoes": [...], "sfx": "...",
"dur": 1.6, "regra": "REGRA Nº 1", "carimbo": true, "censura": true}}. Batida muda (sem texto) com "dur" serve para a acao acontecer.
- cam: ampla | grupo | mesa | alto | eu-frente (close do Jorginho) | eu-lado | f0 | f0c (close da outra pessoa) | f1 | f1c | f2 | f2c
- acoes: {{"quem": "prot|f0|f1|todos", "faz": "sobe|agacha|danca|rebola|grita|treme|cai|vira|susto|comemora|aponta|olha", "para": "mesa|f0|camera"}}
  ("sobe" com "para": "mesa" = sobe em cima da mesa e fica la; "cai" = cai duro no chao)
- sfx: peido | scratch (disco arranhando, na hora da besteira) | boing | buzina | plim | risada | impacto | whoosh
- "censura": true na batida da nojeira/pelada (o quadro fica pixelado com a tarja CENSURADO); "carimbo": true na batida da reacao.
Cada cena tambem tem "amb" (o cenario, fixo no video), "fala" (todos os textos da cena juntos, em ordem) e "presentes": ["f0"] na cena 1.

CENARIOS E ELENCO (escolha o que combina com o tema e use SO esses papeis):
- restaurante (primeiro encontro, jantar): f0 = "crush" (ou "crush-m"), f1 = "garcom". Pontos: mesa, vela, balcao.
- escritorio (entrevista de emprego, reuniao, primeiro dia): f0 = "chefe" (ou "chefa"). Pontos: mesa, computador, janela, planta.
- casamento (casamento de amigo, padrinho): f0 = "noiva", f1 = "noivo", f2 = "padre". Pontos: altar, noiva, bancos, bolo.
- elevador (elevador do trabalho, do predio): f0 = "chefa", f1 = "seguranca". Pontos: botoes, espelho, teto.

LIMITES (o YouTube derruba o canal se passar disso): nada de sexo explicito, nada com crianca, nada de preconceito (raca, religiao,
genero, deficiencia, orientacao), nada de violencia real ou drogas. Escatologico, vergonha alheia, mico e absurdo: pode tudo.
Sem tracos longos, emojis, asteriscos ou hashtags na fala. Numeros por extenso.

Inclua "thumb_texto" (2 a 4 palavras em MAIUSCULAS), "titulo_curto" (ate 24 caracteres), "titulo_youtube" (ate 60 caracteres, ex.:
"O que NUNCA fazer no primeiro encontro") e "comentario_fixado" (pergunta pra galera contar o mico dela).
Responda SOMENTE com JSON valido: {{"descricao": "...", "tags": ["..."], "thumb_texto": "...", "titulo_curto": "...", "titulo_youtube": "...",
"comentario_fixado": "...", {campo_elenco}"elenco": {{"prot": "jorginho", "f": ["...", "..."]}}, "cenas": [ ... ]}}"""

# NFI: o roteiro de humor sai sempre 3D e com o formato "nao-faca"
def _quer_2d(titulo, motor_de=None):
    return None, None


_validar_planob = _validar


def _validar(d):
    for c in d.get("cenas", []) if isinstance(d, dict) else []:
        if not c.get("fala") and c.get("beats"):
            c["fala"] = " ".join(b.get("texto", "") for b in c["beats"] if b.get("texto")).strip() or "..."
    return _validar_planob(d)

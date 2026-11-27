#!/usr/bin/env python3
"""Transforma o motor 3D do Plano B no canal de HUMOR "Nao Faca Isso" (antigo Zero Gravidade BR).

Roda DEPOIS de copiar o codigo do Plano B para este repositorio (workflow importar_motor.yml). E idempotente:
cada troca so e feita uma vez (marca "NFI:" no arquivo). Nunca mexe em conteudo/ nem em state/.

O que muda:
  - cenarios de humor (pov3d/ambiente_humor.js): restaurante, escritorio, casamento, elevador
  - acoes novas dos bonecos: sobe (na mesa), agacha, danca, rebola, grita, treme, cai, vira
  - efeitos sonoros de comedia: peido, scratch (disco arranhando), boing, buzina, plim, risada
  - na tela: faixa "REGRA No 1", carimbo vermelho "NAO FACA ISSO" e tarja "CENSURADO" (pixelada)
  - trilha comica do comeco ao fim (as faixas engracadas que o Plano B nao usa)
  - narrador animado, palavrao liberado, roteirista de humor absurdo
  - identidade do canal (nome, @, descricao, hashtags), sem videos longos, 100% 3D
"""
from pathlib import Path

BASE = Path(__file__).resolve().parent
NOME = "Não Faça Isso"
HANDLE = "@naofacaisso"


def troca(arq: str, velho: str, novo: str, marca: str, obrigatorio: bool = True):
    p = BASE / arq
    s = p.read_text(encoding="utf-8")
    if marca in s:
        return
    if velho not in s:
        if obrigatorio:
            raise SystemExit(f"[humor_patch] {arq}: trecho nao encontrado ({velho[:60]!r})")
        print(f"[humor_patch] {arq}: trecho opcional nao encontrado, pulando")
        return
    p.write_text(s.replace(velho, novo, 1), encoding="utf-8")
    print(f"[humor_patch] {arq}: ok ({marca})")


def anexar(arq: str, bloco: str, marca: str):
    p = BASE / arq
    s = p.read_text(encoding="utf-8")
    if marca in s:
        return
    p.write_text(s.rstrip("\n") + "\n\n" + bloco.strip("\n") + "\n", encoding="utf-8")
    print(f"[humor_patch] {arq}: anexado ({marca})")


# ---------------------------------------------------------------- motor 3D
troca("pov3d/engine.html", '<script src="ambiente_cidades.js"></script>',
      '<script src="ambiente_cidades.js"></script>\n<script src="ambiente_humor.js"></script><!-- NFI:humor -->', "NFI:humor")
troca("pov3d/diretor3d.js", """      c.position.lerp(dest, k);
    }
  }""", """      c.position.lerp(dest, k);
    }
    if (window.humorPos) window.humorPos(c, a, t, acoesDe(d.id, t, d.prot));   // NFI:pos
  }""", "NFI:pos")
troca("pov3d/diretor3d.js",
      "    if (!acoesDe(d.id, t, d.prot).some(x => x.faz === 'abaixa' && t < x.t1) && c.userData.esc0) c.scale.y = c.userData.esc0;",
      "    if (window.humorPose) { const hp = window.humorPose(c, a, t, acoesDe(d.id, t, d.prot), {y, bE, bD}); y = hp.y; bE = hp.bE; bD = hp.bD; }   // NFI:pose\n"
      "    else if (!acoesDe(d.id, t, d.prot).some(x => x.faz === 'abaixa' && t < x.t1) && c.userData.esc0) c.scale.y = c.userData.esc0;", "NFI:pose")

# ---------------------------------------------------------------- identidade e configuracao
anexar("config.py", f'''# NFI: canal de humor "{NOME}" (antigo Zero Gravidade BR). Liga o modo humor no motor do Plano B.
CANAL_NOME = "{NOME}"
CANAL_HUMOR = True
SEM_LONGO = True''', "NFI: canal de humor")
troca("render.py", 'HANDLE = "@planobdahistoria"', f'HANDLE = "{HANDLE}"   # NFI:handle', "NFI:handle")
troca("publish.py", 'HASHTAGS = "#shorts #historia #historiaalternativa #eseo #curiosidades #brasil"',
      'HASHTAGS = "#shorts #humor #comedia #naofacaisso #memes #zoeira #brasil"   # NFI:hashtags', "NFI:hashtags")
troca("publish.py", """f"{c['descricao']}\\n\\nSe inscreva no Plano B da História: toda semana, um \\"e se...\\" que muda o mundo.\\n"
            f"Comente qual história alternativa você quer ver no próximo vídeo!\\n\\n"
            f"Conteúdo especulativo e educativo: os fatos citados são históricos, as hipóteses são imaginação.{cred}\\n\\n{HASHTAGS}")""",
      """f"{c['descricao']}\\n\\nSe inscreva no Não Faça Isso: o manual do que NUNCA fazer na vida (o Jorginho faz por você).\\n"
            f"Comenta a pior coisa que você já fez nessa situação!\\n\\n"
            f"Humor e ficção: não tente fazer isso em casa (nem em lugar nenhum).{cred}\\n\\n{HASHTAGS}")   # NFI:descricao""", "NFI:descricao")
troca("publish.py", """    return (f"{c['titulo']}\\n\\nSegue @planobdahistoria pra mais histórias alternativas! Comenta qual quer ver.\\n\\n"
            f"#historia #historiaalternativa #eseo #curiosidades #brasil")""",
      """    return (f"{c['titulo']}\\n\\nSegue @naofacaisso: o manual do que NUNCA fazer!\\n\\n#humor #comedia #memes #zoeira")   # NFI:ig""", "NFI:ig", obrigatorio=False)
troca("programador.py", 'ORDEM_MOTOR = ["3d"]', 'ORDEM_MOTOR = ["3d"]   # NFI:3d', "NFI:3d", obrigatorio=False)
troca("programador.py", '    if not ag.get("longo") or ag["longo"]["id"] not in pubs:',
      '    if not getattr(config, "SEM_LONGO", False) and (not ag.get("longo") or ag["longo"]["id"] not in pubs):   # NFI:semlongo', "NFI:semlongo")
troca("musica_real.py", 'UA = "PlanoBDaHistoria/1.0 (canal educativo de YouTube; contato.luard@gmail.com)"',
      'UA = "NaoFacaIsso/1.0 (canal de humor no YouTube; contato.luard@gmail.com)"   # NFI:ua', "NFI:ua", obrigatorio=False)

# ---------------------------------------------------------------- trilha comica
troca("musica_real.py", '''    nome_tema, tema = tema_musical(conteudo)''', '''    if getattr(config, "CANAL_HUMOR", False):     # NFI:trilha - humor: UMA faixa comica do comeco ao fim (troca so em video longo)
        total = max(b for _, b in tempos_cena) if tempos_cena else 30.0
        comicas = ["Monkeys Spinning Monkeys", "Fluffing a Duck", "Sneaky Snitch", "Wallpaper", "Bumbly March", "Carefree", "Can-Can"]
        segs = [(0.0, total, "animada", {"tema": "humor", "preferidas": comicas, "gancho": True})]
        print(f"[musica] direcao (humor): 0-{total:.0f}s animada (comica)", flush=True)
        return segs
    nome_tema, tema = tema_musical(conteudo)''', "NFI:trilha")
troca("musica_real.py", '''        opcoes = [x for x in opcoes if not any(p in x.get("titulo", "") for p in PROIBIDAS)]''',
      '''        if not getattr(config, "CANAL_HUMOR", False):      # NFI:proibidas (no humor as comicas sao justamente as preferidas)
            opcoes = [x for x in opcoes if not any(p in x.get("titulo", "") for p in PROIBIDAS)]''', "NFI:proibidas")

# ---------------------------------------------------------------- vozes: narrador animado, papeis femininos novos
anexar("vozes.py", '''# NFI: vozes do canal de humor - narrador de zoeira (rapido, animado) e papeis femininos novos
FEMININOS |= {"crush", "chefa", "noiva", "convidada", "sogra", "jorginha"}
GRAVES |= {"seguranca", "chefe", "padre"}
NARRADORES_M = [("pt-BR-MacerioMultilingualNeural", "~+4Hz@+10%"), ("pt-BR-AntonioNeural", "~+3Hz@+8%")]
NARRADORES_F = [("pt-BR-ThalitaMultilingualNeural", "~+3Hz@+9%")]
NARRADORES = NARRADORES_M + NARRADORES_F''', "NFI: vozes")

# ---------------------------------------------------------------- catalogo e cenografo
anexar("catalogo_cenas.py", '''# NFI: cenarios do canal de humor
AMB_3D.update({
    "restaurante": dict(era="moderno", mostra="restaurante a luz de velas: mesa do casal (sentados frente a frente), garcom, casais ao fundo"),
    "escritorio": dict(era="moderno", mostra="sala do chefe: mesa, computador, estante, janelao com predios (entrevista de emprego)"),
    "casamento": dict(era="moderno", mostra="igreja enfeitada: tapete vermelho, bancos com convidados, altar com arco de flores, noiva, noivo e padre"),
    "elevador": dict(era="moderno", mostra="elevador de inox apertado: painel de botoes, espelho, visor do andar"),
})
PONTOS.update({"restaurante": {"mesa", "vela", "porta", "balcao"}, "escritorio": {"mesa", "computador", "janela", "planta"},
               "casamento": {"altar", "noiva", "bancos", "bolo"}, "elevador": {"botoes", "espelho", "teto"}})''', "NFI: cenarios do canal de humor")
troca("cenografo.py", '''            "cidade-oriental"]''', '''            "cidade-oriental", "restaurante", "escritorio", "casamento", "elevador"]   # NFI:cenarios''', "NFI:cenarios")
anexar("cenografo.py", '''# NFI: perfis do canal de humor (o Jorginho passa vergonha em situacoes do dia a dia)
PERFIS.update({
    "encontro": dict(kw=["encontro", "date", "crush", "jantar", "restaurante", "namorada", "namoro", "garcom"], prot="jorginho",
                     f=["crush", "garcom"], amb={"restaurante": ["crush", "garcom"]}, ambientes=["restaurante"]),
    "entrevista": dict(kw=["entrevista", "emprego", "chefe", "trabalho", "escritorio", "reuniao", "estagio", "curriculo"], prot="jorginho",
                       f=["chefe"], amb={"escritorio": ["chefe", "chefa"]}, ambientes=["escritorio"]),
    "casamento": dict(kw=["casamento", "noiva", "noivo", "padre", "altar", "igreja", "padrinho", "madrinha"], prot="jorginho",
                      f=["noiva", "noivo", "padre"], amb={"casamento": ["noiva", "noivo", "padre"]}, ambientes=["casamento"]),
    "elevador": dict(kw=["elevador", "predio", "condominio", "vizinho"], prot="jorginho",
                     f=["chefa", "seguranca"], amb={"elevador": ["chefa", "seguranca"]}, ambientes=["elevador"]),
})''', "NFI: perfis do canal de humor")

# ---------------------------------------------------------------- efeitos sonoros de comedia
anexar("sfx.py", '''# NFI: efeitos de comedia (sintetizados, sem direitos autorais)
def peido(rng, dur=0.9):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 70 + 25 * np.sin(2 * np.pi * 9 * t) + 30 * np.exp(-t * 3)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + _ruido(n, rng) * 0.25
    return _passa_banda(s, 40, 900) * _env(n, 0.01, 0.35)


def scratch(rng, dur=0.5):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 900 * (1 + 0.8 * np.sin(2 * np.pi * 7 * t))
    s = _ruido(n, rng) * 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR)
    return _passa_banda(s, 300, 4000) * _env(n, 0.005, 0.12)


def boing(rng, dur=0.7):
    n = int(SR * dur); t = np.arange(n) / SR
    f = 180 + 260 * np.exp(-t * 6) + 40 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 3)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.005, 0.25)


def buzina(rng, dur=0.8):
    n = int(SR * dur); t = np.arange(n) / SR
    s = sum(np.sign(np.sin(2 * np.pi * f * t)) / k for k, f in enumerate((415, 523, 622), 1))
    return _passa_banda(s, 200, 3000) * 0.5 * _env(n, 0.02, 0.6)


def plim(rng, dur=0.9):
    n = int(SR * dur); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1975 * t)) * 0.5 * np.exp(-t * 5)


def risada(rng, dur=2.2):
    n = int(SR * dur); t = np.arange(n) / SR
    s = np.zeros(n)
    for _ in range(14):     # varias pessoas rindo ("ha-ha-ha") em ritmos diferentes
        f0, rit, fase = rng.uniform(160, 320), rng.uniform(5, 8), rng.uniform(0, 6)
        pulso = np.clip(np.sin(2 * np.pi * rit * t + fase), 0, 1) ** 2
        s += np.sin(2 * np.pi * f0 * t + 3 * np.sin(2 * np.pi * 4 * t)) * pulso * rng.uniform(0.4, 1)
    s = _passa_banda(s + _ruido(n, rng) * 0.4, 200, 3500)
    return s / (np.abs(s).max() + 1e-6) * _env(n, 0.15, 0.9)


EFEITOS.update({"peido": peido, "scratch": scratch, "boing": boing, "buzina": buzina, "plim": plim, "risada": risada})
VOLUME.update({"peido": 0.7, "scratch": 0.45, "boing": 0.45, "buzina": 0.4, "plim": 0.35, "risada": 0.3})''', "NFI: efeitos de comedia")

# ---------------------------------------------------------------- na tela: regra, carimbo, censura
troca("render3d.py", '''"pov": "POV", "escolha": "VOCÊ ESCOLHE", "futuro": "VOCÊ ACORDA NO FUTURO"}''',
      '''"pov": "POV", "escolha": "VOCÊ ESCOLHE", "futuro": "VOCÊ ACORDA NO FUTURO", "nao-faca": "NÃO FAÇA ISSO"}''', '"nao-faca": "NÃO FAÇA ISSO"')
troca("render3d.py", '''            # chip do episodio + titulo (primeiros 3 s)''', '''            # NFI:overlay - humor: faixa "REGRA No 1", carimbo "NAO FACA ISSO" e tarja "CENSURADO", por batida
            if getattr(config, "CANAL_HUMOR", False):
                frame = _humor_overlay(frame, t, P["beats"])

            # chip do episodio + titulo (primeiros 3 s)''', "NFI:overlay")
anexar("render3d.py", '''# NFI: sprites do canal de humor
from functools import lru_cache as _lru


@_lru(maxsize=16)
def _faixa_regra(texto):
    f = R._fonte(86)
    bb = f.getbbox(texto)
    w, h = bb[2] - bb[0] + 90, 150
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.polygon([(18, 10), (w - 1, 0), (w - 18, h - 12), (0, h - 1)], fill=(255, 214, 10, 250), outline=(10, 8, 20, 255))
    for x in range(-h, w, 46):
        d.line([(x, h - 6), (x + 24, h - 6)], fill=(10, 8, 20, 255), width=8)
    d.text((45 - bb[0], 22 - bb[1]), texto, font=f, fill=(15, 10, 30, 255))
    return im.rotate(-3, expand=True, resample=Image.BICUBIC)


@_lru(maxsize=8)
def _carimbo_nao(texto):
    f = R._fonte(150)
    linhas = texto.split("|") if "|" in texto else ([texto] if len(texto) < 9 else [" ".join(texto.split()[:-1]), texto.split()[-1]])
    larg = max(f.getbbox(x)[2] - f.getbbox(x)[0] for x in linhas)
    w, h = larg + 130, 175 * len(linhas) + 80
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cor = (220, 20, 30, 235)
    d.rounded_rectangle([6, 6, w - 7, h - 7], radius=26, outline=cor, width=14)
    d.rounded_rectangle([22, 22, w - 23, h - 23], radius=18, outline=cor, width=5)
    for i, x in enumerate(linhas):
        bb = f.getbbox(x)
        d.text(((w - (bb[2] - bb[0])) // 2 - bb[0], 42 + i * 175 - bb[1]), x, font=f, fill=cor)
    return im.rotate(12, expand=True, resample=Image.BICUBIC)


def _humor_overlay(frame, t, beats):
    for x in beats:
        b, a, t1 = x["b"], x["a"], x["t1"]
        if b.get("censura") and a <= t < t1 + 0.15:          # tarja pixelada no meio do quadro (onde o Jorginho apronta)
            y0, y1, x0, x1 = int(H * 0.40), int(H * 0.80), int(W * 0.12), int(W * 0.88)
            reg = frame[y0:y1, x0:x1]
            peq = cv2.resize(reg, (max(1, (x1 - x0) // 34), max(1, (y1 - y0) // 34)), interpolation=cv2.INTER_AREA)
            frame[y0:y1, x0:x1] = cv2.resize(peq, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
            tag = R._texto_contorno("CENSURADO", 84, (255, 255, 255), 10)
            fundo = Image.new("RGBA", (tag.width + 50, tag.height + 24), (10, 10, 12, 235))
            fundo.alpha_composite(tag, (25, 12))
            R._blit(frame, fundo, (W - fundo.width) // 2, (y0 + y1) // 2 - fundo.height // 2, opac=1.0)
        if b.get("regra") and a <= t < a + 2.2:
            im = _faixa_regra(str(b["regra"]).upper())
            ent = min(1.0, (t - a) / 0.18)
            sai = min(1.0, (a + 2.2 - t) / 0.25)
            R._blit(frame, im, (W - im.width) // 2 + int((1 - ent) * -W), int(H * 0.30), opac=min(1.0, sai))
        if b.get("carimbo") and a + 0.15 <= t < t1 + 0.6:
            im = _carimbo_nao("NÃO FAÇA ISSO" if b["carimbo"] is True else str(b["carimbo"]).upper())
            u = min(1.0, (t - a - 0.15) / 0.16)
            k = 1.9 - 0.9 * u                                  # bate na tela: comeca grande e "carimba"
            spr = im.resize((max(1, int(im.width * k * 0.92)), max(1, int(im.height * k * 0.92))), Image.BILINEAR)
            R._blit(frame, spr, (W - spr.width) // 2, int(H * 0.5) - spr.height // 2, opac=min(1.0, 0.4 + u))
    return frame''', "NFI: sprites do canal de humor")
troca("render3d.py", "import render as R", "import config   # NFI:config\nimport render as R", "NFI:config", obrigatorio=False)

# ---------------------------------------------------------------- roteirista de humor
troca("roteirista.py", 'PROMPT = """Voce e roteirista de Shorts virais em portugues do Brasil para o canal "Plano B da Historia"',
      'PROMPT_PLANOB = """Voce e roteirista de Shorts virais em portugues do Brasil para o canal "Plano B da Historia"', "PROMPT_PLANOB")
anexar("roteirista.py", '''# NFI: roteirista do canal de humor "Nao Faca Isso"
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
"comentario_fixado": "...", {campo_elenco}"elenco": {{"prot": "jorginho", "f": ["...", "..."]}}, "cenas": [ ... ]}}"""''', "NFI: roteirista do canal de humor")
anexar("roteirista.py", '''# NFI: o roteiro de humor sai sempre 3D e com o formato "nao-faca"
def _quer_2d(titulo, motor_de=None):
    return None, None


_validar_planob = _validar


def _validar(d):
    for c in d.get("cenas", []) if isinstance(d, dict) else []:
        if not c.get("fala") and c.get("beats"):
            c["fala"] = " ".join(b.get("texto", "") for b in c["beats"] if b.get("texto")).strip() or "..."
    return _validar_planob(d)''', "NFI: o roteiro de humor sai sempre 3D")

print("[humor_patch] pronto.")

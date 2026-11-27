"""Cenografo: transforma QUALQUER roteiro em direcao de cena 3D (cenario, elenco e cameras por cena).

Le o titulo, as falas e as descricoes de imagem, escolhe um PERFIL de epoca/tema (elenco + cenarios
coerentes) e distribui cenarios e planos de camera de forma variada. Campos que o roteiro ja traz
(amb, cams, elenco, perfil) tem prioridade, entao um roteirista (IA ou humano) pode mandar na direcao.
"""
import random
import re
import unicodedata

CENARIOS = ["conves", "terra", "cabine", "palacio", "cidade", "cidade-antiga", "campo", "laboratorio", "lua", "arena",
            "deserto", "aerodromo", "selva", "vapor", "cidade-medieval", "cidade-colonial", "cidade-vitoriana", "cidade-futuro",
            "cidade-oriental", "restaurante", "escritorio", "casamento", "elevador"]   # NFI:cenarios
# Protagonistas "viajantes no tempo" (o VOCE dos formatos em que o espectador acorda em outra epoca): rodizio pelo id
VIAJANTES = ["viajante", "viajante-f", "estudante"]

PERFIS = {
    "cabral": dict(kw=["cabral", "1500", "descobrimento", "frota", "caravela", "pau-brasil", "pero vaz"], prot="cabral",
                   f=["marujo", "marujo2", "caminha"], amb={"terra": ["nativo", "nativo2", "nativo3"], "cabine": ["caminha", "marujo", "marujo2"],
                                                           "palacio": ["rei", "caminha", "cidadao"], "cidade": ["cidadao", "cidada", "marujo"]},
                   ambientes=["conves", "terra", "cabine", "cidade", "palacio"]),
    "roma": dict(kw=["roma", "romano", "romana", "pompeia", "vesuvio", "cesar", "gladiador", "coliseu", "legiao", "imperio romano"], prot="general-romano",
                 f=["soldado-romano", "cidadao", "gladiador"], amb={"arena": ["gladiador", "soldado-romano", "imperador"], "palacio": ["imperador", "soldado-romano", "cidada"]},
                 ambientes=["cidade-antiga", "arena", "palacio", "campo"]),
    "napoleao": dict(kw=["napoleao", "waterloo", "wellington", "frances", "franca"], prot="napoleao", f=["soldado-frances", "soldado-ingles", "soldado-frances"],
                     amb={"palacio": ["rei", "soldado-frances", "cidada"]}, ambientes=["campo", "palacio", "cidade"]),
    "dompedro": dict(kw=["dom pedro", "ipiranga", "1822", "independencia"], prot="dompedro", f=["tropeiro", "senhora-colonial", "soldado-colonial"],
                     amb={"palacio": ["rei", "cidada", "cidadao"], "cidade-colonial": ["tropeiro", "senhora-colonial", "soldado-colonial"]}, ambientes=["campo", "cidade-colonial", "palacio"]),
    "ciencia": dict(kw=["einstein", "newton", "gravidade", "relatividade", "cientista", "fisica"], prot="einstein", f=["newton", "cientista", "cidadao2"],
                    amb={"cidade-vitoriana": ["cavalheiro", "dama-vitoriana", "jornaleiro"]}, ambientes=["laboratorio", "cidade-vitoriana", "campo"]),
    "apollo": dict(quadro=["HOUSTON: APOLLO 11", "T-00:03:00", "ALARME 1202", "COMBUSTIVEL BAIXO"], kw=["apollo", "lua", "astronauta", "armstrong", "foguete", "1969", "nasa"], prot="astronauta", f=["astronauta", "cientista", "astronauta"],
                   amb={"laboratorio": ["cientista", "cientista", "cidadao2"], "cidade": ["cidadao", "cidada", "cidadao2"]}, ambientes=["lua", "laboratorio", "cidade"]),
    "dumont": dict(kw=["santos dumont", "14-bis", "aviao", "aviador", "voo"], prot="aviador", f=["cavalheiro", "dama-vitoriana", "jornaleiro"], amb={"cidade-vitoriana": ["cavalheiro", "dama-vitoriana", "jornaleiro"]}, ambientes=["aerodromo", "cidade-vitoriana", "campo"]),
    "holandes": dict(kw=["holand", "nassau", "mauricio de nassau"], prot="soldado-holandes", f=["marujo", "nativo", "soldado-holandes"],
                     amb={"terra": ["nativo", "nativo2", "soldado-holandes"], "cidade-colonial": ["soldado-holandes", "senhora-colonial", "quitandeira"], "palacio": ["rei", "soldado-holandes", "cidada"]},
                     ambientes=["conves", "terra", "cidade-colonial", "palacio"]),
    "ingles": dict(kw=["ingles", "ingleses", "britanic", "inglaterra"], prot="soldado-ingles", f=["marujo", "nativo", "soldado-ingles"],
                   amb={"terra": ["nativo", "nativo2", "soldado-ingles"], "cidade": ["soldado-ingles", "cidadao", "cidada"], "palacio": ["rei", "soldado-ingles", "cidada"]},
                   ambientes=["conves", "terra", "cidade", "palacio"]),
    "internet": dict(kw=["internet", "telegrafo", "computador", "1900", "rede"], prot="cientista", f=["jornaleiro", "dama-vitoriana", "operario"], amb={"cidade-vitoriana": ["jornaleiro", "dama-vitoriana", "cavalheiro"]}, ambientes=["laboratorio", "cidade-vitoriana"]),
    "egito": dict(kw=["egito", "cleopatra", "fara", "piramide", "alexandria"], prot="cleopatra", f=["egipcio", "faraoh", "soldado-romano"],
                  ambientes=["deserto", "palacio", "cidade-antiga"]),
    "dino": dict(kw=["dinossauro", "dinossauros", "jurassico", "extincao", "meteoro"], prot="cientista", f=["dino", "dino2", "dino3"], ambientes=["selva", "campo"]),
    "viking": dict(kw=["viking", "vikings"], prot="viking", f=["viking", "nativo", "marujo"], ambientes=["conves", "terra", "campo"]),
    "titanic": dict(kw=["titanic"], prot="marujo", f=["cidadao", "cidada", "marujo2"], ambientes=["vapor", "palacio"]),
    "mongol": dict(kw=["mongol", "mongois", "gengis", "khan", "estepe"], prot="gengis", f=["mongol", "mongol2", "mongol"],
                   amb={"palacio": ["mongol", "rei", "mongol2"], "cidade-oriental": ["mercador-oriental", "monge-budista", "mongol"]}, ambientes=["campo", "palacio", "cidade-oriental"]),
    "peste": dict(kw=["peste negra", "peste bubonica", "1348", "medico da peste", "pestilencia"], prot="campones", f=["camponesa", "medico-peste", "monge"],
                  amb={"cidade-medieval": ["camponesa", "medico-peste", "mercador"]}, ambientes=["cidade-medieval", "campo"]),
    "medieval": dict(kw=["medieval", "cavaleiro", "castelo", "idade media", "cruzada", "templario"], prot="cavaleiro", f=["rei", "rainha", "nobre-medieval"],
                     amb={"cidade-medieval": ["mercador", "aldea", "ferreiro"]}, ambientes=["cidade-medieval", "palacio", "campo"]),
    "asteca": dict(kw=["asteca", "tenochtitlan", "espanhol", "cortes", "maia", "inca"], prot="asteca", f=["asteca", "cavaleiro", "nativo"], ambientes=["selva", "cidade-antiga", "deserto"]),
    "guerra": dict(kw=["guerra mundial", "segunda guerra", "trincheira"], prot="soldado-ingles", f=["soldado-frances", "operario", "dama-vitoriana"], amb={"cidade-vitoriana": ["operario", "dama-vitoriana", "jornaleiro"]}, ambientes=["campo", "cidade-vitoriana"]),
    "tiradentes": dict(kw=["tiradentes", "inconfidencia", "forca", "ouro preto", "vila rica"], prot="tiradentes", f=["tropeiro", "soldado-colonial", "senhora-colonial"],
                       amb={"cidade-colonial": ["tropeiro", "soldado-colonial", "senhora-colonial"]}, ambientes=["cidade-colonial", "campo", "palacio"]),
    "isabel": dict(kw=["princesa isabel", "lei aurea", "escravidao", "escravid", "abolicao"], prot="isabel", f=["padre", "senhora-colonial", "quitandeira"],
                   amb={"cidade-colonial": ["padre", "senhora-colonial", "quitandeira"]}, ambientes=["palacio", "cidade-colonial", "campo"]),
    "joao": dict(kw=["dom joao", "1808", "corte portuguesa", "joao vi"], prot="rei", f=["senhora-colonial", "padre", "marujo"],
                 amb={"cidade-colonial": ["senhora-colonial", "padre", "soldado-colonial"]}, ambientes=["conves", "terra", "cidade-colonial", "palacio"]),
    "samurai": dict(kw=["samurai", "japao", "japones", "xogum", "edo", "kyoto", "china", "chines", "dinastia", "muralha da china"], prot="samurai", f=["dama-japonesa", "monge-budista", "mercador-oriental"],
                    amb={"cidade-oriental": ["dama-japonesa", "monge-budista", "mercador-oriental"]}, ambientes=["cidade-oriental", "campo", "palacio"]),
    "alexandre": dict(kw=["alexandre", "gaugamela", "macedonia", "persia"], prot="general-romano", f=["soldado-romano", "egipcio", "cidadao"], ambientes=["campo", "deserto", "palacio"]),
    "futuro": dict(kw=["2100", "2050", "2200", "futuro", "robo", "robos", "inteligencia artificial", "marte", "ciborgue", "daqui a"], prot="viajante-f",
                   f=["cidada-futuro", "robo", "entregador"], amb={"laboratorio": ["cientista", "robo", "cidada-futuro"], "cidade-futuro": ["cidada-futuro", "robo", "entregador"]}, ambientes=["cidade-futuro", "laboratorio", "lua"]),
    "generico": dict(kw=[], prot="cidadao", f=["cidadao2", "cidada", "marujo"], ambientes=["cidade", "campo", "palacio"]),
}

CHAVES_AMB = [
    ("vapor", r"\b(titanic|transatlantico|transatlanticos|navio a vapor|iceberg|icebergs|chamine|chamines|casco de aco)\b"),
    ("conves", r"\b(navio|navios|mar|oceano|frota|caravela|barco|marujo|bordo|ship|ocean|fleet|sailor|deck|porto|viagem)\b"),
    ("terra", r"\b(praia|costa|terra a vista|desembarc|beach|coast|shore|litoral|ilha)\b"),
    ("palacio", r"\b(palacio|trono|corte|rei|rainha|imperador|imperatriz|palace|throne|king|queen|castelo|nobre|assin)\w*"),
    ("laboratorio", r"\b(laboratorio|experimento|invenca|inventor|cientista|lab|quadro|formula|equacao|teoria|computador|maquina)\w*"),
    ("lua", r"\b(lua|moon|lunar|espaco|foguete|apollo|modulo|orbita|space|rocket)\b"),
    ("arena", r"\b(coliseu|arena|gladiador|gladiadores|circo)\b"),
    ("deserto", r"\b(deserto|egito|piramide|piramides|desert|pyramid|sphinx|esfinge)\b"),
    ("aerodromo", r"\b(aviao|voo|aerodromo|14-bis|aviador|plane|flight|airfield|decolag)\w*"),
    ("campo", r"\b(batalha|exercito|exercitos|tropas|campo de batalha|guerra|colina|battle|army|troops|soldado|soldados|general|canhao|canhoes)\b"),
    ("selva", r"\b(floresta|selva|jungle|forest|dinossauro|dinossauros|dinosaur|jurassico|mata|vulcao)\b"),
    ("cidade", r"\b(cidade|rua|praca|mercado|vila|city|street|market|town|povo|multidao|cidadaos|ruas)\b"),
]

PADROES_CAM_POV = [["pov", "f0", "eu-costas"], ["f1c", "pov-luneta", "eu-lado"], ["panoramica", "f0c", "alto"], ["eu-frente", "f2", "pov-lanterna"], ["ampla", "f1", "pov"]]
PADROES_CAM_3P = [["ampla", "f0", "eu-costas"], ["f1c", "eu-lado", "panoramica"], ["alto", "f0c", "eu-frente"], ["eu-costas", "f2", "ampla"], ["panoramica", "f1", "eu-lado"]]


# hora do dia pedida pela fala: o ceu tem que bater com o que o narrador diz ("na manha seguinte" = ceu de manha)
HORAS_RX = [
    ("amanhecer", r"\b(amanhec\w*|alvorada|nascer do sol|raiar do dia|primeiros raios)\b"),
    ("madrugada", r"\b(madrugada|meia[- ]noite)\b"),
    ("entardecer", r"\b(entardecer|por do sol|crepusculo|anoitecer|anoiteceu|fim do dia|fim de tarde)\b"),
    ("noite", r"\b(noite|noturn\w*|escuridao|luar|lua cheia|a luz da lua)\b"),
    ("manha", r"\b(manha|manhazinha|dia seguinte|proximo dia|na manha)\b"),
    ("dia", r"\b(meio[- ]dia|ao meio dia|de dia|sol a pino|em pleno dia)\b"),
    ("tarde", r"(?<!mais )\b(tarde|a tarde|de tarde)\b"),
]


def hora_do_texto(txt: str):
    """Devolve a hora do dia mencionada primeiro no texto, ou None."""
    txt = _norm(txt)
    achados = []
    for h, rx in HORAS_RX:
        m = re.search(rx, txt)
        if m:
            achados.append((m.start(), h))
    return min(achados)[1] if achados else None


def _norm(t: str) -> str:
    t = unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", t)


def _texto(c: dict) -> str:
    partes = [c.get("titulo", "")] * 3
    for cena in c["cenas"]:
        partes.append(cena.get("fala", ""))
        partes.extend(cena.get("visuais", []))
    return _norm(" ".join(partes))


def escolher_perfil(c: dict) -> str:
    if c.get("perfil") in PERFIS:
        return c["perfil"]
    titulo, resto = _norm(c.get("titulo", "")), _texto(c)
    melhor, pontos = "generico", 0
    import re as _re
    if c.get("formato") == "futuro" or any(2030 <= int(a) <= 2999 for a in _re.findall(r"\b(2\d{3})\b", titulo)):
        melhor, pontos = "futuro", 3          # "voce acorda em 2150": qualquer ano futuro e o cenario do futuro
    for nome, p in PERFIS.items():
        s = 0
        for k in p["kw"]:
            s += 4 * titulo.count(k) + resto.count(k)
        if s > pontos:
            melhor, pontos = nome, s
    return melhor


def cidade_do_perfil(perfil: dict):
    """A cidade DA EPOCA do perfil (medieval, colonial, vitoriana, futuro, oriental, antiga) - nunca a rua generica."""
    return next((a for a in perfil["ambientes"] if a.startswith("cidade-")), None)


def _ambiente_da_cena(cena: dict, perfil: dict, era_antiga: bool):
    txt = _norm(cena.get("fala", "") + " " + " ".join(cena.get("visuais", [])))
    hits = [amb for amb, rx in CHAVES_AMB if re.search(rx, txt)]
    for h in hits:
        if h == "cidade":
            h = cidade_do_perfil(perfil) or h
        if h in perfil["ambientes"]:
            return h
    return None


def preparar(c: dict, semente: str | None = None) -> dict:
    """Devolve uma copia do roteiro com 'amb', 'cams' e 'elenco' preenchidos (sem sobrescrever o que ja existe)."""
    c = dict(c)
    c["cenas"] = [dict(x) for x in c["cenas"]]
    nome_perfil = escolher_perfil(c)
    perfil = PERFIS[nome_perfil]
    c["perfil"] = nome_perfil
    rng = random.Random(semente or c.get("id", "x"))
    formato = c.get("formato", "e-se")
    pov = formato in ("pov", "pov3d", "voce-acorda", "escolha", "futuro")
    padroes = PADROES_CAM_POV if pov else PADROES_CAM_3P
    era_antiga = nome_perfil in ("roma", "egito", "alexandre", "asteca")

    if "elenco" not in c:
        prot = perfil["prot"]
        if formato in ("voce-acorda", "futuro") and nome_perfil in ("generico", "futuro", "internet", "ciencia", "dumont"):
            # o espectador ACORDA em outra epoca: o "voce" e um viajante no tempo (3 protagonistas em rodizio)
            prot = VIAJANTES[sum(map(ord, c.get("id", "x"))) % len(VIAJANTES)]
        c["elenco"] = {"prot": prot, "f": perfil["f"], "amb": perfil.get("amb", {})}
        if perfil.get("quadro"):
            c["elenco"]["quadro"] = perfil["quadro"]

    n = len(c["cenas"])
    anterior, seguidos, ciclo, hora_atual = None, 0, 0, None
    for i, cena in enumerate(c["cenas"]):
        if not cena.get("amb"):
            amb = _ambiente_da_cena(cena, perfil, era_antiga)
            pool = perfil["ambientes"]
            if amb is None:
                amb = pool[0] if i == 0 else pool[(i * 2 // 3) % len(pool)]
            if amb == anterior and seguidos >= 2 and len(pool) > 1:
                amb = next(a for a in pool if a != anterior)
            cena["amb"] = amb
        if cena["amb"] == "cidade" and cidade_do_perfil(perfil) and c.get("motor") != "2d":
            cena["amb"] = cidade_do_perfil(perfil)        # rua generica -> a cidade da epoca (fim da cidade repetida)
        seguidos = seguidos + 1 if cena["amb"] == anterior else 1
        anterior = cena["amb"]
        if not cena.get("hora"):
            h = hora_do_texto(cena.get("fala", "") + " " + " ".join(l.get("texto", "") for l in cena.get("falas", [])))
            if h:
                hora_atual = h
            if hora_atual:
                cena["hora"] = hora_atual
        else:
            hora_atual = cena["hora"]
        if not cena.get("cams"):
            if i == 0:
                cams = ["ampla", "eu-frente", "f0"] if not pov else ["pov", "ampla", "eu-frente"]
            elif i == n - 1:
                cams = ["eu-frente", "eu-lado", "alto"]
            else:
                cams = list(padroes[ciclo % len(padroes)])
                ciclo += 1
            # so enquadra quem pode existir nesse lugar (cenario sem gente = so planos de cenario)
            el = c.get("elenco") or {}
            n_f = len((el.get("amb") or {}).get(cena["amb"]) or el.get("f") or [])
            if cena["amb"] in (el.get("vazio") or []):
                cams = ["ampla", "panoramica", "alto"]
            else:
                cams = [x for x in cams if not (re.match(r"^f(\d)c?$", x) and int(re.match(r"^f(\d)", x).group(1)) >= n_f)] or ["ampla"]
            cena["cams"] = cams
    return c

# NFI: perfis do canal de humor (o Jorginho passa vergonha em situacoes do dia a dia)
PERFIS.update({
    "encontro": dict(kw=["encontro", "date", "crush", "jantar", "restaurante", "namorada", "namoro", "garcom"], prot="jorginho",
                     f=["crush", "garcom"], amb={"restaurante": ["crush", "garcom"]}, ambientes=["restaurante"]),
    "entrevista": dict(kw=["entrevista", "emprego", "chefe", "trabalho", "escritorio", "reuniao", "estagio", "curriculo"], prot="jorginho",
                       f=["chefe"], amb={"escritorio": ["chefe", "chefa"]}, ambientes=["escritorio"]),
    "casamento": dict(kw=["casamento", "noiva", "noivo", "padre", "altar", "igreja", "padrinho", "madrinha"], prot="jorginho",
                      f=["noiva", "noivo", "padre"], amb={"casamento": ["noiva", "noivo", "padre"]}, ambientes=["casamento"]),
    "elevador": dict(kw=["elevador", "predio", "condominio", "vizinho"], prot="jorginho",
                     f=["chefa", "seguranca"], amb={"elevador": ["chefa", "seguranca"]}, ambientes=["elevador"]),
})

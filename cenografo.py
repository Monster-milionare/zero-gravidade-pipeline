"""Cenografo: transforma QUALQUER roteiro em direcao de cena 3D (cenario, elenco e cameras por cena).

Le o titulo, as falas e as descricoes de imagem, escolhe um PERFIL de epoca/tema (elenco + cenarios
coerentes) e distribui cenarios e planos de camera de forma variada. Campos que o roteiro ja traz
(amb, cams, elenco, perfil) tem prioridade, entao um roteirista (IA ou humano) pode mandar na direcao.
"""
import random
import re
import unicodedata

CENARIOS = ["conves", "terra", "cabine", "palacio", "cidade", "cidade-antiga", "campo", "laboratorio", "lua", "arena",
            "deserto", "aerodromo", "selva", "vapor"]

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
    "dompedro": dict(kw=["dom pedro", "ipiranga", "1822", "independencia"], prot="dompedro", f=["cidadao", "cidada", "cidadao2"],
                     amb={"palacio": ["rei", "cidada", "cidadao"]}, ambientes=["campo", "cidade", "palacio"]),
    "ciencia": dict(kw=["einstein", "newton", "gravidade", "relatividade", "cientista", "fisica"], prot="einstein", f=["newton", "cientista", "cidadao2"],
                    ambientes=["laboratorio", "cidade", "campo"]),
    "apollo": dict(quadro=["HOUSTON: APOLLO 11", "T-00:03:00", "ALARME 1202", "COMBUSTIVEL BAIXO"], kw=["apollo", "lua", "astronauta", "armstrong", "foguete", "1969", "nasa"], prot="astronauta", f=["astronauta", "cientista", "astronauta"],
                   amb={"laboratorio": ["cientista", "cientista", "cidadao2"], "cidade": ["cidadao", "cidada", "cidadao2"]}, ambientes=["lua", "laboratorio", "cidade"]),
    "dumont": dict(kw=["santos dumont", "14-bis", "aviao", "aviador", "voo"], prot="aviador", f=["cidadao", "cidada", "cidadao2"], ambientes=["aerodromo", "cidade", "campo"]),
    "holandes": dict(kw=["holand", "nassau", "mauricio de nassau"], prot="soldado-holandes", f=["marujo", "nativo", "soldado-holandes"],
                     amb={"terra": ["nativo", "nativo2", "soldado-holandes"], "cidade": ["soldado-holandes", "cidadao", "cidada"], "palacio": ["rei", "soldado-holandes", "cidada"]},
                     ambientes=["conves", "terra", "cidade", "palacio"]),
    "ingles": dict(kw=["ingles", "ingleses", "britanic", "inglaterra"], prot="soldado-ingles", f=["marujo", "nativo", "soldado-ingles"],
                   amb={"terra": ["nativo", "nativo2", "soldado-ingles"], "cidade": ["soldado-ingles", "cidadao", "cidada"], "palacio": ["rei", "soldado-ingles", "cidada"]},
                   ambientes=["conves", "terra", "cidade", "palacio"]),
    "internet": dict(kw=["internet", "telegrafo", "computador", "1900", "rede"], prot="cientista", f=["cidadao", "cidada", "cidadao2"], ambientes=["laboratorio", "cidade"]),
    "egito": dict(kw=["egito", "cleopatra", "fara", "piramide", "alexandria"], prot="cleopatra", f=["egipcio", "faraoh", "soldado-romano"],
                  ambientes=["deserto", "palacio", "cidade-antiga"]),
    "dino": dict(kw=["dinossauro", "dinossauros", "jurassico", "extincao", "meteoro"], prot="cientista", f=["dino", "dino2", "dino3"], ambientes=["selva", "campo"]),
    "viking": dict(kw=["viking", "vikings"], prot="viking", f=["viking", "nativo", "marujo"], ambientes=["conves", "terra", "campo"]),
    "titanic": dict(kw=["titanic"], prot="marujo", f=["cidadao", "cidada", "marujo2"], ambientes=["vapor", "palacio"]),
    "medieval": dict(kw=["medieval", "cavaleiro", "castelo", "idade media", "mongol", "gengis"], prot="cavaleiro", f=["rei", "rainha", "cavaleiro"], ambientes=["campo", "palacio", "cidade"]),
    "asteca": dict(kw=["asteca", "tenochtitlan", "espanhol", "cortes", "maia", "inca"], prot="asteca", f=["asteca", "cavaleiro", "nativo"], ambientes=["selva", "cidade-antiga", "deserto"]),
    "guerra": dict(kw=["guerra mundial", "segunda guerra", "trincheira"], prot="soldado-ingles", f=["soldado-frances", "cidadao", "cidada"], ambientes=["campo", "cidade"]),
    "tiradentes": dict(kw=["tiradentes", "inconfidencia", "forca"], prot="tiradentes", f=["cidadao", "soldado-ingles", "cidada"], ambientes=["cidade", "campo", "palacio"]),
    "isabel": dict(kw=["princesa isabel", "lei aurea", "escravidao", "escravid", "abolicao"], prot="isabel", f=["cidadao", "cidada", "dompedro"], ambientes=["palacio", "cidade", "campo"]),
    "joao": dict(kw=["dom joao", "1808", "corte portuguesa", "joao vi"], prot="rei", f=["cidadao", "cidada", "marujo"], ambientes=["conves", "terra", "cidade", "palacio"]),
    "samurai": dict(kw=["samurai", "japao", "japones"], prot="samurai", f=["samurai", "cidadao", "cidada"], ambientes=["campo", "cidade", "palacio"]),
    "alexandre": dict(kw=["alexandre", "gaugamela", "macedonia", "persia"], prot="general-romano", f=["soldado-romano", "egipcio", "cidadao"], ambientes=["campo", "deserto", "palacio"]),
    "futuro": dict(kw=["2100", "2050", "2200", "futuro", "robo", "robos", "inteligencia artificial", "marte", "ciborgue", "daqui a"], prot="cientista",
                   f=["cidadao2", "cidada", "astronauta"], amb={"laboratorio": ["cientista", "cidada", "astronauta"]}, ambientes=["cidade", "laboratorio", "lua"]),
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
    for nome, p in PERFIS.items():
        s = 0
        for k in p["kw"]:
            s += 4 * titulo.count(k) + resto.count(k)
        if s > pontos:
            melhor, pontos = nome, s
    return melhor


def _ambiente_da_cena(cena: dict, perfil: dict, era_antiga: bool):
    txt = _norm(cena.get("fala", "") + " " + " ".join(cena.get("visuais", [])))
    hits = [amb for amb, rx in CHAVES_AMB if re.search(rx, txt)]
    for h in hits:
        if h == "cidade" and era_antiga and "cidade-antiga" in perfil["ambientes"]:
            h = "cidade-antiga"
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
        c["elenco"] = {"prot": perfil["prot"], "f": perfil["f"], "amb": perfil.get("amb", {})}
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
            cena["cams"] = cams
    return c

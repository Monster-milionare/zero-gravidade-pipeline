"""Catalogo dos cenarios: o que cada cenario MOSTRA de verdade, para o validador (coerencia.py) cruzar com o roteiro.

Regra de ouro: o roteiro nunca pode falar de um lugar/objeto que o cenario escolhido nao mostra.
Cenario novo = entrada nova aqui (e no motor). Cenario que nao esta aqui nem no motor nao renderiza.

2D: os nomes sao lidos do proprio motor (pov3d/cena2d_*.js: scenes['nome']) e os papeis de ROLES; aqui ficam
so os metadados que o JS nao diz (formato, efeitos, se e interior, quantos figurantes cabem).
"""
import re
from pathlib import Path

import config

POV = Path(config.BASE_DIR) / "pov3d"

# metadados dos cenarios 2D ---------------------------------------------------------------------------------------
# formato: "horizontal" (16:9, so longos) | "vertical" (so Shorts 9:16) | "ambos" (o cenario se adapta aos dois)
# ceu: o cenario mostra o ceu (a hora do dia importa) | fx: efeitos validos (a chave '' = padrao)
# max_f: quantos figurantes o cenario comporta (alem do protagonista) | vazio: cenario sem personagens
AMB_2D = {
    "selva-cretaceo": dict(mostra="selva do Cretaceo com vulcao, dinossauros e lago", formato="vertical", ceu=True, fx=[""], max_f=3,
                           horas=["manha", "dia", "tarde", "entardecer", "impacto", "noite"]),
    "lancamento": dict(mostra="base de lancamento (Kennedy, Florida): foguete Saturn V na plataforma, torre de servico, edificio de montagem",
                       formato="ambos", ceu=True, fx=["", "decolagem"], max_f=3, horas=["dia", "manha", "tarde", "noite"]),
    "nave-cabine": dict(mostra="interior do modulo de comando Odyssey: paineis, escotilhas com a Terra", formato="ambos", ceu=False,
                        fx=["", "alarme", "escuro", "frio", "clarao"], max_f=3),
    "modulo-lunar": dict(mostra="interior apertado do modulo lunar Aquarius ou Eagle (paredes douradas, janelas triangulares com a Lua)", formato="ambos",
                         ceu=False, fx=["", "frio", "escuro", "alarme"], max_f=3),
    "espaco": dict(mostra="o espaco: Terra, Lua e a nave Apollo vista de fora (sem personagens)", formato="ambos", ceu=False,
                   fx=["", "terra", "lua", "vazamento", "perto", "reentrada"], max_f=0, vazio=True),
    "houston": dict(mostra="centro de controle de missao em Houston: telao de trajetoria, fileiras de consoles, controladores", formato="ambos",
                    ceu=False, fx=["", "tensao"], max_f=3),
    "oceano": dict(mostra="oceano Pacifico: capsula com paraquedas ou boiando, navio de resgate, helicoptero (sem personagens)", formato="ambos",
                   ceu=True, fx=["", "paraquedas", "pouso"], max_f=0, vazio=True, horas=["dia"]),
    "superficie-lunar": dict(mostra="superficie da Lua: chao cinza com crateras, modulo lunar Eagle, Terra no ceu preto, astronautas de traje (e a bandeira)",
                             formato="ambos", ceu=False, fx=["", "bandeira"], max_f=3),
    "descida-lunar": dict(mostra="o modulo lunar Eagle visto de fora, descendo com o motor aceso ou ja pousado na Lua (sem personagens)",
                          formato="ambos", ceu=False, fx=["", "descida", "poeira", "pousado"], max_f=0, vazio=True),
    "roma": dict(mostra="Forum Romano no seculo II: templos de colunas, arco do triunfo, pinheiros, o Coliseu ao fundo "
                      "(hora 'incendio' = o Grande Incendio de 64 d.C., cidade em chamas e SEM o Coliseu, que so ficou pronto em 80 d.C.)",
                 formato="vertical", ceu=True, fx=[""], max_f=3, horas=["manha", "dia", "tarde", "entardecer", "noite", "incendio"]),
    "chernobyl": dict(mostra="usina nuclear de Chernobyl em 1986: bloco 4 destruido pegando fogo, chamine listrada, brilho azul subindo do "
                           "reator, caminhoes de bombeiro, grafite no chao; ao fundo os predios de Pripyat e a roda-gigante amarela "
                           "(hora 'dia' = 26/04 a tarde; 'evacuacao' = 27/04 com os onibus)",
                      formato="vertical", ceu=True, fx=[""], max_f=3, horas=["noite", "madrugada", "dia", "evacuacao"]),
}

# cenarios 3D (motor three.js). 'era' = a que epoca/tema o cenario pertence (usado para barrar anacronismo).
AMB_3D = {
    "conves": dict(era="vela", mostra="convés de caravela/navio a vela, mar"),
    "terra": dict(era="vela", mostra="praia/costa com mata"),
    "cabine": dict(era="vela", mostra="cabine de navio antigo"),
    "palacio": dict(era="antigo", mostra="salao de palacio com trono"),
    "cidade": dict(era="medieval", mostra="cidade/rua medieval com barris e casas"),
    "cidade-antiga": dict(era="antigo", mostra="cidade romana/antiga"),
    "campo": dict(era="antigo", mostra="campo de batalha / descampado"),
    "laboratorio": dict(era="moderno", mostra="laboratorio / sala de controle"),
    "lua": dict(era="espaco", mostra="superficie lunar"),
    "arena": dict(era="antigo", mostra="coliseu/arena"),
    "deserto": dict(era="antigo", mostra="deserto com piramides"),
    "aerodromo": dict(era="1900", mostra="campo de aviacao com biplano e hangar (Santos Dumont, 1906)"),
    "selva": dict(era="natureza", mostra="floresta tropical"),
    "vapor": dict(era="1900", mostra="navio a vapor de aco (Titanic), icebergs"),
    "muro": dict(era="1900", mostra="Muro de Berlim"),
    "gavea": dict(era="1900", mostra="cesto da gavea do Titanic, noite sem lua, iceberg"),
    "cidade-medieval": dict(era="medieval", mostra="rua medieval europeia (1300-1500): casas de enxaimel, catedral gotica, poco, feira"),
    "cidade-colonial": dict(era="colonial", mostra="rua colonial brasileira (1600-1850): casario colorido, igreja barroca, chafariz, palmeiras"),
    "cidade-vitoriana": dict(era="1900", mostra="rua de 1850-1930 (Londres/Paris/NY): predios de tijolo, chamines, lampioes a gas, torre do relogio, bonde"),
    "cidade-futuro": dict(era="futuro", mostra="cidade do futuro (2050-2200): torres de vidro com neon, carros voadores, hologramas, robos"),
    "cidade-oriental": dict(era="medieval", mostra="cidade oriental feudal (Japao/China): casas de madeira e papel, pagode, torii, lanternas, cerejeiras"),
}

# DIRECAO: pontos de interesse (alvos de camera e de trajetoria) e entidades que cada cenario sabe desenhar.
PONTOS = {
    "selva-cretaceo": {"ampla", "ceu", "ceu-esq", "ceu-dir", "alto", "lago", "lago-ceu", "mata", "ninho", "vulcao", "trilha", "dinos",
                       "trex", "chao", "perto", "margem", "margem2", "beira"},
    "roma": {"ampla", "ceu", "coliseu", "cidade", "templo", "arco", "fogo", "chao", "perto", "escadaria", "fora-esq", "fora-dir"},
    "chernobyl": {"ampla", "ceu", "reator", "coluna", "chamine", "cidade", "roda", "caminhao", "grafite", "chao", "perto", "fora-esq", "fora-dir"},
    "gavea": {"proa", "mar", "horizonte", "frente", "ceu", "estrelas", "sino", "telefone", "ponte", "chamine", "baixo", "lado",
              "ice-longe", "ice-frente", "ice-perto", "ice-lado", "ice-passou", "ext-proa", "ext-lado", "ext-alto"},
}
PONTOS.update({
    "cidade-medieval": {"igreja", "poco", "mercado"},
    "cidade-colonial": {"igreja", "chafariz"},
    "cidade-vitoriana": {"relogio", "bonde", "banca"},
    "cidade-futuro": {"torre", "carros"},
    "cidade-oriental": {"pagode", "torii"},
})
ENTIDADES = {"selva-cretaceo": {"ptero", "sombra"}, "gavea": {"iceberg"}, "chernobyl": {"helicoptero"}}
ALVOS_GERAIS = {"grupo", "ampla", "panoramica", "prot", "camera", "voce", "todos", "fora", "fora-esq", "fora-dir"}

ERAS_ANTIGAS = {"vela", "antigo", "medieval", "colonial"}


def _ler(arq):
    try:
        return (POV / arq).read_text(encoding="utf-8")
    except OSError:
        return ""


def cenarios_2d_do_motor() -> set:
    nomes = set()
    for p in POV.glob("cena2d_*.js"):
        nomes |= set(re.findall(r"scenes\['([\w-]+)'\]\s*=", p.read_text(encoding="utf-8")))
    return nomes


def papeis_2d_do_motor() -> set:
    papeis = set()
    for p in POV.glob("cena2d_*.js"):
        t = p.read_text(encoding="utf-8")
        for bloco in re.finditer(r"Object\.assign\(ROLES,\s*\{(.*?)\n\}\);", t, re.S):
            papeis |= {a or b for a, b in re.findall(r"^\s{2}(?:'([\w-]+)'|([\w]+)):\s*\{", bloco.group(1), re.M)}
    return papeis


def papeis_3d_do_motor() -> set:
    papeis = set()
    t = _ler("ambientes.js")
    blocos = re.findall(r"const PAPEIS = \{(.*?)\n\};", t, re.S)
    for p in POV.glob("ambiente_*.js"):
        blocos += re.findall(r"Object\.assign\(PAPEIS,\s*\{(.*?)\n\}\);", p.read_text(encoding="utf-8"), re.S)
    for b in blocos:
        papeis |= {a or c for a, c in re.findall(r"^\s{2}(?:'([\w-]+)'|([\w]+)):\s*\{", b, re.M)}
    return papeis

# NFI: cenarios do canal de humor
AMB_3D.update({
    "restaurante": dict(era="moderno", mostra="restaurante a luz de velas: mesa do casal (sentados frente a frente), garcom, casais ao fundo"),
    "escritorio": dict(era="moderno", mostra="sala do chefe: mesa, computador, estante, janelao com predios (entrevista de emprego)"),
    "casamento": dict(era="moderno", mostra="igreja enfeitada: tapete vermelho, bancos com convidados, altar com arco de flores, noiva, noivo e padre"),
    "elevador": dict(era="moderno", mostra="elevador de inox apertado: painel de botoes, espelho, visor do andar"),
})
PONTOS.update({"restaurante": {"mesa", "vela", "porta", "balcao"}, "escritorio": {"mesa", "computador", "janela", "planta"},
               "casamento": {"altar", "noiva", "bancos", "bolo"}, "elevador": {"botoes", "espelho", "teto"}})

"""Vozes: narrador + uma voz fixa por personagem (edge-tts, gratis).

Cada papel (cabral, rei, cidada...) recebe UMA voz e UM tom, o mesmo em todas as cenas do video.
Se uma voz sumir do catalogo, tts.py cai sozinho para a voz padrao (o video nunca para).
"""
FEMININOS = {"rainha", "cidada", "cleopatra", "isabel", "cidada-berlim", "cidada-berlim2", "exploradora", "bebe-tricera"}
GRAVES = {"rei", "imperador", "cabral", "general-romano", "faraoh", "viking", "napoleao"}   # tom mais grave
AGUDOS = {"cidadao2", "marujo2", "nativo3", "newton"}                                       # tom mais agudo

NARRADOR = ("pt-BR-MacerioMultilingualNeural", "-1Hz")
MASCULINAS = [("pt-BR-AntonioNeural", "+0Hz"), ("pt-PT-DuarteNeural", "+0Hz"), ("pt-BR-AntonioNeural", "-6Hz"),
              ("pt-PT-DuarteNeural", "+8Hz"), ("pt-BR-AntonioNeural", "+7Hz")]
FEMININAS = [("pt-BR-FranciscaNeural", "+0Hz"), ("pt-BR-ThalitaMultilingualNeural", "+0Hz"), ("pt-PT-RaquelNeural", "+0Hz"),
             ("pt-BR-FranciscaNeural", "+6Hz")]


def _hz(base: str, extra: int) -> str:
    n = int(base.replace("Hz", "")) + extra
    return f"{n:+d}Hz"


def papel_de(quem: str, cena: dict, elenco: dict) -> str:
    """'prot' -> papel do protagonista; 'f1' -> papel do 2o figurante daquele cenario."""
    if quem == "radio":
        return "radio"                      # voz fora de cena (Houston no radio): voz propria, sem personagem na tela
    if quem == "prot":
        return (elenco.get("protAmb") or {}).get(cena.get("amb")) or elenco.get("prot", "cidadao")
    if quem.startswith("f") and quem[1:].isdigit():
        lista = (elenco.get("amb") or {}).get(cena.get("amb")) or elenco.get("f") or ["cidadao"]
        return lista[int(quem[1:]) % len(lista)]
    return "narrador"


class Elenco:
    def __init__(self, elenco: dict):
        self.elenco = elenco
        self.por_papel = {}
        self.nm = self.nf = 0

    def voz(self, quem: str, cena: dict):
        """-> (voz, tom_Hz) para quem fala nessa cena."""
        if quem in ("", "narrador", None):
            return NARRADOR
        papel = papel_de(quem, cena, self.elenco).replace("-traje", "")     # mesma pessoa = mesma voz, com ou sem traje
        if papel not in self.por_papel:
            if papel in FEMININOS:
                v = FEMININAS[self.nf % len(FEMININAS)]
                self.nf += 1
            else:
                v = MASCULINAS[self.nm % len(MASCULINAS)]
                self.nm += 1
            extra = -4 if papel in GRAVES else 5 if papel in AGUDOS else 0
            self.por_papel[papel] = (v[0], _hz(v[1], extra))
        return self.por_papel[papel]

"""Vozes: narrador + uma voz fixa por personagem (edge-tts, gratis), com MAIS variedade entre videos.

- O narrador muda de video pra video (sorteio estavel pelo id): Macerio, Thalita, Antonio ou Francisca.
- Cada papel (cabral, exploradora, guia...) recebe UMA voz e UM tom, o mesmo em todas as cenas do video,
  diferente da do narrador. SO vozes com sotaque brasileiro (Antonio, Macerio, Francisca, Thalita); a variedade
  entre personagens vem do tom.
Se uma voz sumir do catalogo, tts.py cai sozinho para a voz padrao (o video nunca para).
"""
import hashlib

FEMININOS = {"rainha", "cidada", "cleopatra", "isabel", "cidada-berlim", "cidada-berlim2", "exploradora", "bebe-tricera",
             "passageira", "telefonista"}
GRAVES = {"rei", "imperador", "cabral", "general-romano", "faraoh", "viking", "napoleao", "guia", "oficial", "capitao"}
AGUDOS = {"cidadao2", "marujo2", "nativo3", "newton", "bebe-tricera", "menino"}

# PERSONAS de narracao (pedido do Andre: "so uma voz feminina pra narrar sempre nao da"). So existem duas vozes
# femininas e duas masculinas com sotaque brasileiro no edge-tts gratis; cada persona e uma voz + TOM + RITMO
# fixos no video inteiro ("~tom@ritmo": o tts varia so um pouquinho em volta). Rodizio pela contagem de videos:
# dois videos seguidos com narradora nunca tem a mesma persona.
NARRADORES_F = [("pt-BR-FranciscaNeural", "~-3Hz@-4%"),            # documentario
                ("pt-BR-ThalitaMultilingualNeural", "~+3Hz@+6%"),  # apresentadora animada
                ("pt-BR-FranciscaNeural", "~-9Hz@-8%"),            # suspense, mais grave e lenta
                ("pt-BR-ThalitaMultilingualNeural", "~-5Hz@-2%"),  # contadora de historia
                ("pt-BR-FranciscaNeural", "~+6Hz@+9%")]            # jovem e rapida
NARRADORES_M = [("pt-BR-MacerioMultilingualNeural", "~-1Hz@+0%"),  # padrao do canal
                ("pt-BR-AntonioNeural", "~-6Hz@-6%"),              # documentario grave
                ("pt-BR-MacerioMultilingualNeural", "~+4Hz@+8%"),  # animado
                ("pt-BR-AntonioNeural", "~-10Hz@-9%"),             # suspense
                ("pt-BR-MacerioMultilingualNeural", "~-6Hz@-3%")]  # contador de historia
NARRADORES = NARRADORES_M + NARRADORES_F
NARRADOR = NARRADORES[0]
# SO sotaque brasileiro (pedido do Andre): as vozes "Multilingual" estrangeiras e a de Portugal saiam com sotaque.
# A variedade entre personagens vem do tom (Hz) de cada um.
MASCULINAS = [("pt-BR-AntonioNeural", "+0Hz"), ("pt-BR-MacerioMultilingualNeural", "+4Hz"), ("pt-BR-AntonioNeural", "-6Hz"),
              ("pt-BR-MacerioMultilingualNeural", "-5Hz"), ("pt-BR-AntonioNeural", "+7Hz")]
FEMININAS = [("pt-BR-FranciscaNeural", "+0Hz"), ("pt-BR-ThalitaMultilingualNeural", "+3Hz"), ("pt-BR-FranciscaNeural", "+6Hz"),
             ("pt-BR-ThalitaMultilingualNeural", "-4Hz")]
PORTUGUESES = set()       # todos com sotaque brasileiro


def _hz(base: str, extra: int) -> str:
    n = int(base.replace("Hz", "")) + extra
    return f"{n:+d}Hz"


def _h(txt: str) -> int:
    return int(hashlib.md5(txt.encode()).hexdigest()[:8], 16)


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
    def __init__(self, elenco: dict, semente: str = "", feminino=None, n_pub=None):
        """feminino: True/False alterna narradora/narrador entre videos (pedido do Andre); None = sorteio pelo id.
        n_pub (videos ja publicados) faz o rodizio das personas: cada video do mesmo genero usa a seguinte."""
        self.elenco = elenco
        self.por_papel = {}
        self.semente = semente or "planob"
        lista = NARRADORES if feminino is None else (NARRADORES_F if feminino else NARRADORES_M)
        idx = (n_pub // 2) if n_pub is not None else _h(self.semente)
        self.narrador = (elenco.get("narrador_voz") and (elenco["narrador_voz"], "+0Hz")) or lista[idx % len(lista)]
        k = _h(self.semente + "m")
        self.masc = MASCULINAS[k % len(MASCULINAS):] + MASCULINAS[:k % len(MASCULINAS)]
        k = _h(self.semente + "f")
        self.fem = FEMININAS[k % len(FEMININAS):] + FEMININAS[:k % len(FEMININAS)]
        self.nm = self.nf = 0

    def _proxima(self, lista, idx):
        """proxima voz da lista, de preferencia diferente da do narrador (e se for a mesma, com tom bem diferente)."""
        for k in range(len(lista)):
            v = lista[(idx + k) % len(lista)]
            if v[0] != self.narrador[0]:
                return v, idx + k + 1
        v = lista[idx % len(lista)]
        return (v[0], _hz(v[1], 6)), idx + 1

    def voz(self, quem: str, cena: dict):
        """-> (voz, tom_Hz) para quem fala nessa cena."""
        if quem in ("", "narrador", None):
            return self.narrador
        papel = papel_de(quem, cena, self.elenco).replace("-traje", "")     # mesma pessoa = mesma voz, com ou sem traje
        if papel not in self.por_papel:
            if papel in FEMININOS:
                v, self.nf = self._proxima(self.fem, self.nf)
            else:
                v, self.nm = self._proxima(self.masc, self.nm)
            extra = -4 if papel in GRAVES else 6 if papel in AGUDOS else 0
            self.por_papel[papel] = (v[0], _hz(v[1], extra))
        return self.por_papel[papel]

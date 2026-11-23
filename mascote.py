"""Figurante do canal (miniaturas): sprite pronto em assets/mascote_zg.png. Mesma API do mascote antigo."""
from functools import lru_cache
from pathlib import Path
from PIL import Image

_ARQ = Path(__file__).resolve().parent / "assets" / "mascote_zg.png"


@lru_cache(maxsize=16)
def _carrega(altura: int):
    im = Image.open(_ARQ).convert("RGBA")
    w = int(im.width * altura / im.height)
    return im.resize((w, altura), Image.LANCZOS)


def sprite(t: float = 0.0, boca: float = 0.0, fala: bool = False, emocao: str = "neutro", altura: int = 470, ritmo: float = 1.0):
    return _carrega(int(altura)).copy()

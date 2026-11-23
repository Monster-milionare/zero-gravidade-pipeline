"""
Narração 100% grátis via edge-tts (usa o serviço de leitura em voz alta do
Microsoft Edge, sem precisar do navegador nem de chave de API — biblioteca
não-oficial, mas é a opção free mais usada em canais faceless).

Divide o roteiro em frases e gera 1 áudio por frase. Além do áudio, guarda
o TEMPO DE CADA PALAVRA (evento "WordBoundary" do edge-tts) em
Segment.words — é isso que deixa o render.py fazer legenda palavra por
palavra e boca do mascote sincronizadas com a voz, sem rodar nenhuma IA de
transcrição.

SOBRE EXPRESSIVIDADE DE VOZ (honesto, pra não vender ilusão): edge-tts é a
melhor opção 100% grátis que existe, mas ele usa um modelo de prosódia fixo
por voz — não é um modelo conversacional tipo o do ChatGPT/Gemini. Pra
compensar, aqui a gente varia rate/pitch por frase E aumenta a energia
(rate/pitch mais altos) em frases de impacto (exclamação/pergunta, ou CTA).
"""
import asyncio
import inspect
import random
import re
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path

import edge_tts

import config

# Voz "humana" — pt-BR-MacerioMultilingualNeural é a voz masculina neural
# multilíngue mais recente da Microsoft pra PT-BR. Se algum dia ela sumir
# do catálogo do edge-tts, cai pro fallback automaticamente.
VOICE_PREFERENCIAS = [
    getattr(config, "EDGE_TTS_VOICE", None),
    "pt-BR-MacerioMultilingualNeural",
    "pt-BR-AntonioNeural",
]


def _dedup_preservando_ordem(itens: list) -> list:
    vistos: set = set()
    out = []
    for item in itens:
        if item and item not in vistos:
            vistos.add(item)
            out.append(item)
    return out


VOICE_PREFERENCIAS = _dedup_preservando_ordem(VOICE_PREFERENCIAS)
VOICE = VOICE_PREFERENCIAS[0]

# IMPORTANTE: edge-tts exige sinal explícito (+/-) mesmo pra zero - "0%"
# sozinho derruba com ValueError (bug real que já quebrou a publicação).
_RATE_VARIACAO = ("+18%", "+20%", "+17%", "+22%", "+19%", "+21%")
_PITCH_VARIACAO = ("+0Hz", "+2Hz", "-2Hz", "+4Hz", "-3Hz", "+1Hz")
_RATE_VARIACAO_ENERGICA = ("+24%", "+26%", "+25%", "+27%")
_PITCH_VARIACAO_ENERGICA = ("+4Hz", "+6Hz", "+8Hz", "+5Hz")

PAUSA_ENTRE_FRASES_SEC = 0.10


@dataclass
class Segment:
    text: str
    audio_path: Path
    duration_sec: float
    is_cta: bool = False
    # [(palavra, inicio_seg, fim_seg)] relativo ao começo do áudio da frase
    words: list = field(default_factory=list)
    energica: bool = False


def _split_sentences(text: str) -> list:
    text = re.sub(r"\s+", " ", text).strip()
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


def _eh_frase_energica(sentence: str, cta: bool) -> bool:
    """CTA sempre entra com energia; fora isso, frase com exclamação ou
    interrogação ganha rate/pitch mais altos."""
    return cta or "!" in sentence or "?" in sentence


def _probe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(path),
        ],
        capture_output=True, text=True, check=True,
    )
    return float(result.stdout.strip())


async def _synth_one(text: str, out_path: Path, voice: str, rate: str, pitch: str) -> list:
    kwargs = {}
    # edge-tts >= 7 só manda o tempo de cada palavra se pedir explicitamente
    if "boundary" in inspect.signature(edge_tts.Communicate.__init__).parameters:
        kwargs["boundary"] = "WordBoundary"
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, **kwargs)
    words = []
    recebeu_audio = False
    with open(out_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
                recebeu_audio = True
            elif chunk["type"] == "WordBoundary":
                inicio = chunk["offset"] / 10_000_000
                words.append((chunk["text"], inicio, inicio + chunk["duration"] / 10_000_000))
    if not recebeu_audio:
        raise RuntimeError("edge-tts não devolveu áudio")
    return words


_TROCAS_VOZ = {
    0x2010: "-", 0x2011: "-", 0x2012: "-", 0x2013: "-", 0x2014: "-", 0x2015: "-",
    0x00A0: " ", 0x202F: " ", 0x2009: " ", 0x200B: None, 0x200D: None, 0xFEFF: None,
    0x2018: "'", 0x2019: "'", 0x201C: '"', 0x201D: '"', 0x2022: "-", 0x2026: "...",
}


def _limpar_para_voz(text: str) -> str:
    """Caracteres 'especiais' (hifen nao-quebravel, aspas curvas...) ja
    derrubaram a sintese de voz de uma frase; troca por equivalentes ASCII."""
    return re.sub(r"\s+", " ", text.translate(_TROCAS_VOZ)).strip()


# Pronuncia: a voz le "GTA VI"/"GTA 6" errado (sexto, "vi"...). Pra VOZ troca
# por "gê tê á seis"; na LEGENDA continua aparecendo "GTA VI" (ver
# _restaurar_palavras, que junta de volta os tempos das 4 palavras faladas).
_RE_GTA6 = re.compile(r"(?!x)x")
_FALA_GTA6 = "gê tê á seis"


def _pronuncia(text: str) -> str:
    return _RE_GTA6.sub(_FALA_GTA6, text)


def _norm_palavra(p: str) -> str:
    return re.sub(r"[^a-zê á]", "", p.lower()).replace(" ", "")


def _restaurar_palavras(words: list) -> list:
    """Junta 'gê tê á seis' (4 palavras do TTS) de volta em 'GTA VI' pra legenda."""
    alvo = "gêtêáseis"
    out, i = [], 0
    while i < len(words):
        acum, j = "", i
        while j < len(words) and j < i + 5 and len(acum) < len(alvo):
            acum += _norm_palavra(words[j][0])
            j += 1
        if acum == alvo:
            ultimo = words[j - 1][0]
            pont = re.sub(r"[\w]", "", ultimo, flags=re.UNICODE).strip()
            out.append(("GTA VI" + pont, words[i][1], words[j - 1][2]))
            i = j
        else:
            out.append(words[i])
            i += 1
    return out


def _synth_gtts(text: str, out_path: Path) -> list:
    """Ultimo recurso se o edge-tts estiver fora do ar: voz do Google Tradutor
    (mais robotica, mas mantem o canal publicando). Sem tempo por palavra
    (words=[]) - o render.py estima os tempos."""
    try:
        from gtts import gTTS
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "gTTS"], check=False)
        from gtts import gTTS
    gTTS(text=text, lang="pt", tld="com.br").save(str(out_path))
    return []


def _synth_com_fallback(text: str, out_path: Path, rate: str, pitch: str, voz: str | None = None) -> list:
    texto = _pronuncia(_limpar_para_voz(text) or text)
    ultimo_erro = None
    # 1) vozes do edge-tts, varias tentativas com espera crescente (soluco de
    #    rede/servico). Na ultima volta tenta sem rate/pitch customizados.
    for volta in range(3):
        for voice in ([voz] if voz and volta < 2 else []) + VOICE_PREFERENCIAS:
            r, p = (rate, pitch) if volta < 2 else ("+0%", "+0Hz")
            try:
                return _restaurar_palavras(asyncio.run(_synth_one(texto, out_path, voice, r, p)))
            except Exception as exc:
                ultimo_erro = exc
        time.sleep(2 + 4 * volta)
    # 2) fallback final: gTTS
    try:
        print(f"[tts] edge-tts falhou ({ultimo_erro!r}) - usando gTTS de reserva.", flush=True)
        return _synth_gtts(texto, out_path)
    except Exception as exc:
        raise RuntimeError(
            f"Nenhuma voz funcionou (edge-tts: {ultimo_erro!r}; gTTS: {exc!r})."
        ) from exc


def synthesize_sentences(text: str, out_dir: Path, cta: bool = False, voz: str | None = None, tom: str | None = None) -> list:
    """Gera um mp3 por frase do roteiro e retorna cada um com sua duração
    e o tempo de cada palavra.

    cta=True marca o(s) segmento(s) como pedido de like/inscrição (render.py
    anima o botão de like/inscrição e o mascote aponta pra ele)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    sentences = _split_sentences(text)
    segments = []
    for i, sentence in enumerate(sentences):
        audio_path = out_dir / f"{i:03d}.mp3"
        energica = _eh_frase_energica(sentence, cta)
        if energica:
            rate = random.choice(_RATE_VARIACAO_ENERGICA)
            pitch = random.choice(_PITCH_VARIACAO_ENERGICA)
        else:
            rate = random.choice(_RATE_VARIACAO)
            pitch = random.choice(_PITCH_VARIACAO)
        if tom:   # voz de personagem: tom fixo (com uma variacao minima) em vez de sortear
            base = int(tom.replace("Hz", ""))
            pitch = f"{base + (4 if energica else 0):+d}Hz"
        words = _synth_com_fallback(sentence, audio_path, rate, pitch, voz)
        duration = _probe_duration(audio_path) + PAUSA_ENTRE_FRASES_SEC
        segments.append(Segment(text=sentence, audio_path=audio_path, duration_sec=duration,
                                is_cta=cta, words=words, energica=energica))
    return segments

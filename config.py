"""Configuracao central do pipeline do canal PLANO B DA HISTORIA. R$0."""
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent
CONTEUDO_DIR = BASE_DIR / "conteudo"
STATE_DIR = BASE_DIR / "state"
ASSETS_DIR = BASE_DIR / "assets"
OUT_DIR = BASE_DIR / "out"
CACHE_DIR = BASE_DIR / "cache"
for _d in (CONTEUDO_DIR, STATE_DIR, ASSETS_DIR, OUT_DIR, CACHE_DIR):
    _d.mkdir(exist_ok=True)

# Video vertical (Shorts / Reels)
W, H, FPS = 1080, 1920, 30

# Voz (edge-tts, gratis). tts.py tem fallback automatico.
EDGE_TTS_VOICE = os.getenv("EDGE_TTS_VOICE", "pt-BR-MacerioMultilingualNeural")

# Roteiros automaticos (Groq, gratis, sem cartao)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

# YouTube
YOUTUBE_CLIENT_SECRETS_FILE = os.getenv("YOUTUBE_CLIENT_SECRETS_FILE", "client_secret.json")
YOUTUBE_TOKEN_FILE = os.getenv("YOUTUBE_TOKEN_FILE", "token.json")

# Profundidade por IA (Depth Anything). "1" = tenta usar; sem isso, heuristica.
USAR_DEPTH_IA = os.getenv("PLANOB_DEPTH", "1") == "1"

# E-mail (opcional)
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
NOTIFY_TO_EMAIL = os.getenv("NOTIFY_TO_EMAIL")

# NFI: canal de humor "Não Faça Isso" (antigo Zero Gravidade BR). Liga o modo humor no motor do Plano B.
CANAL_NOME = "Não Faça Isso"
CANAL_HUMOR = True
SEM_LONGO = True

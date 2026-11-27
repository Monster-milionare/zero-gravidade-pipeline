"""
Upload agendado pro YouTube via YouTube Data API v3.

Setup (uma vez só, manual):
1. Crie um projeto no Google Cloud Console e ative a "YouTube Data API v3".
2. Crie credenciais OAuth (tipo "Desktop app") e baixe o client_secret.json
   pra pasta do projeto.
3. Na primeira execução, um link de autorização vai abrir/ser impresso;
   autorize com a conta dona do canal. Isso salva token.json e não pede
   de novo (o token é renovado sozinho).
"""
import os
from pathlib import Path

import google.auth.transport.requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

import config

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]
# autorizacao nova (autorizar_youtube.py) tambem pede para responder comentarios (votos dos Shorts)
SCOPES_COMPLETOS = SCOPES + ["https://www.googleapis.com/auth/youtube.force-ssl"]


def _get_credentials() -> Credentials:
    token_path = Path(config.YOUTUBE_TOKEN_FILE)
    creds = None
    if token_path.exists():
        # sem forcar a lista de escopos: o token usa os que foram autorizados (antigo = upload+leitura; novo = + comentarios)
        creds = Credentials.from_authorized_user_file(str(token_path))

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(google.auth.transport.requests.Request())
        elif os.environ.get("CI") or os.environ.get("GITHUB_ACTIONS"):
            # Rodando no GitHub Actions: não tem navegador pra autorizar do
            # zero aqui. token.json (com refresh_token válido) precisa ter
            # sido gerado 1x localmente e restaurado a partir do secret
            # YOUTUBE_TOKEN_JSON antes de chamar isto — ver README.
            raise RuntimeError(
                "token.json ausente/inválido em ambiente sem navegador. Gere-o "
                "1x na sua máquina (rode publish.py localmente uma vez) e "
                "salve o conteúdo no secret YOUTUBE_TOKEN_JSON do repositório."
            )
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                config.YOUTUBE_CLIENT_SECRETS_FILE, SCOPES_COMPLETOS
            )
            creds = flow.run_local_server(port=0)
        token_path.write_text(creds.to_json(), encoding="utf-8")

    return creds


def upload_video(
    video_path: Path,
    title: str,
    description: str,
    tags: list[str],
    publish_at_iso: str | None = None,
    is_short: bool = False,
) -> str:
    """publish_at_iso: ex. '2026-11-10T14:00:00Z' para agendar; None publica direto."""
    creds = _get_credentials()
    youtube = build("youtube", "v3", credentials=creds)

    status = {"selfDeclaredMadeForKids": False}
    if publish_at_iso:
        status["privacyStatus"] = "private"
        status["publishAt"] = publish_at_iso
    else:
        status["privacyStatus"] = "public"

    body = {
        "snippet": {
            "title": title[:100],
            "description": description,
            "tags": tags,
            "categoryId": "27",  # Educacao
        },
        "status": status,
    }

    media = MediaFileUpload(str(video_path), chunksize=-1, resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = request.execute()
    return response["id"]


def set_thumbnail(video_id: str, thumbnail_path: Path) -> None:
    """Define a thumbnail customizada de um vídeo já enviado (gerar_thumbnail.py
    gera o arquivo). O escopo `youtube.upload` já usado acima é suficiente
    pra isso (confirmado na documentação oficial da API - não precisa pedir
    nenhuma permissão OAuth nova). Chame isto dentro de um try/except no
    chamador: canais que ainda não verificaram o telefone no YouTube levam
    403 ("doesn't have permissions to upload and set custom video
    thumbnails") até fazer a verificação - isso nunca deve travar o
    publish.py, só pular a thumbnail customizada naquele vídeo."""
    creds = _get_credentials()
    youtube = build("youtube", "v3", credentials=creds)
    media = MediaFileUpload(str(thumbnail_path))
    youtube.thumbnails().set(videoId=video_id, media_body=media).execute()

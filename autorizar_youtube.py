#!/usr/bin/env python3
"""Gera o token do canal COM permissao para responder comentarios (rodar 1x no computador do Andre).

1. Na pasta do projeto (onde esta o client_secret.json), rode:  python autorizar_youtube.py
2. O navegador abre: entre com a conta DONA DO CANAL e aceite (upload, leitura e gerenciar comentarios).
3. O script grava token.json e mostra o conteudo. Copie TUDO e cole no secret YOUTUBE_TOKEN_JSON do repositorio
   (GitHub > Settings > Secrets and variables > Actions > YOUTUBE_TOKEN_JSON > Update).
Depois disso o responder.py passa a responder os votos e avisar quando a continuacao sai.
"""
from pathlib import Path

from google_auth_oauthlib.flow import InstalledAppFlow

import config
import upload

flow = InstalledAppFlow.from_client_secrets_file(config.YOUTUBE_CLIENT_SECRETS_FILE, upload.SCOPES_COMPLETOS)
creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")
Path(config.YOUTUBE_TOKEN_FILE).write_text(creds.to_json(), encoding="utf-8")
print("\nToken salvo em", config.YOUTUBE_TOKEN_FILE)
print("Escopos:", creds.scopes)
print("\n===== copie daqui ate o fim e cole no secret YOUTUBE_TOKEN_JSON =====\n")
print(creds.to_json())

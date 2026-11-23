"""Posta o mesmo video vertical como Reel no Instagram (@planobdahistoria).
Precisa dos secrets IG_ACCESS_TOKEN e IG_USER_ID; sem eles, so o YouTube roda."""
import os
import subprocess
import time
from pathlib import Path

import requests

GRAPH = "https://graph.facebook.com/v21.0"


def _erro(resp) -> str:
    try:
        return str(resp.json())[:300]
    except Exception:
        return f"HTTP {resp.status_code}: {resp.text[:200]}"


def _normalizar(video: Path) -> Path:
    """Re-encoda num perfil conservador que o Instagram aceita sempre.

    Alguns arquivos do motor de render eram recusados no upload (erro
    ProcessingFailedError); o mesmo video, re-encodado assim, passa."""
    saida = video.with_name(video.stem + "_ig.mp4")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(video),
           "-c:v", "libx264", "-preset", "veryfast", "-profile:v", "high", "-level", "4.1",
           "-crf", "23", "-maxrate", "8M", "-bufsize", "16M", "-pix_fmt", "yuv420p",
           "-r", "30", "-g", "60",
           "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
           "-movflags", "+faststart", str(saida)]
    try:
        r = subprocess.run(cmd, capture_output=True, timeout=600)
        if r.returncode == 0 and saida.exists() and saida.stat().st_size > 50_000:
            return saida
        print(f"[instagram] re-encode falhou (codigo {r.returncode}) - uso o arquivo original.", flush=True)
    except Exception as exc:
        print(f"[instagram] re-encode indisponivel ({exc!r}) - uso o arquivo original.", flush=True)
    return video


def _enviar(token: str, ig_id: str, video: Path, legenda: str) -> str:
    """Cria o container, envia o video e espera o processamento. Devolve o id do container."""
    r = requests.post(f"{GRAPH}/{ig_id}/media", data={
        "media_type": "REELS", "upload_type": "resumable", "caption": legenda,
        "share_to_feed": "true", "access_token": token}, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f"criar container falhou: {_erro(r)}")
    dados = r.json()
    container, uri = dados["id"], dados.get("uri")
    if not uri:
        raise RuntimeError(f"Instagram nao devolveu endereco de upload: {dados}")

    tamanho = video.stat().st_size
    with open(video, "rb") as f:
        up = requests.post(uri, data=f, timeout=600, headers={
            "Authorization": f"OAuth {token}", "offset": "0", "file_size": str(tamanho)})
    if up.status_code != 200:
        raise RuntimeError(f"upload do video falhou: {_erro(up)}")

    status = ""
    for _ in range(40):                      # ate ~7 min
        time.sleep(10)
        s = requests.get(f"{GRAPH}/{container}", timeout=30,
                         params={"fields": "status_code,status", "access_token": token})
        if s.status_code == 200:
            status = s.json().get("status_code", "")
            if status == "FINISHED":
                break
            if status in ("ERROR", "EXPIRED"):
                raise RuntimeError(f"processamento falhou: {s.json()}")
    if status != "FINISHED":
        raise RuntimeError(f"Instagram nao terminou de processar (ultimo status: {status or '?'})")
    return container


def postar_reel(token: str, ig_id: str, video: Path, legenda: str) -> str:
    """Devolve o id da midia publicada ou levanta RuntimeError.

    O envio (container + upload + processamento) tenta ate 5 vezes, sempre com
    container novo; a publicacao final acontece uma vez so (sem risco de duplicar)."""
    arquivo = _normalizar(video)
    ultimo = None
    for tentativa in range(1, 6):
        try:
            container = _enviar(token, ig_id, arquivo, legenda)
            break
        except RuntimeError as exc:
            ultimo = exc
            print(f"[instagram] envio falhou (tentativa {tentativa}/5): {str(exc)[:200]}", flush=True)
            if tentativa < 5:
                time.sleep(30 * tentativa)
    else:
        raise ultimo

    p = requests.post(f"{GRAPH}/{ig_id}/media_publish", timeout=60,
                      data={"creation_id": container, "access_token": token})
    if p.status_code != 200:
        raise RuntimeError(f"publicar falhou: {_erro(p)}")
    try:
        if arquivo != video:
            arquivo.unlink()
    except Exception:
        pass
    return p.json().get("id", "?")


def postar(video: Path, legenda: str) -> str | None:
    """Devolve o id do Reel, ou None se nao configurado/erro (nunca levanta)."""
    token = os.environ.get("IG_ACCESS_TOKEN", "").strip()
    ig_id = os.environ.get("IG_USER_ID", "").strip()
    if not token or not ig_id:
        print("[instagram] IG_ACCESS_TOKEN/IG_USER_ID nao configurados - pulando (so YouTube).")
        return None
    try:
        chk = requests.get(f"{GRAPH}/{ig_id}", timeout=30, params={"fields": "username", "access_token": token})
        if chk.status_code != 200:
            print(f"[instagram] token/ID invalidos ou sem permissao: {_erro(chk)}")
            return None
        print(f"[instagram] conta: @{chk.json().get('username', '?')}")
        return postar_reel(token, ig_id, video, legenda)
    except Exception as exc:
        print(f"[instagram] ERRO: {str(exc)[:300]}", flush=True)
        return None

"""Trilha REAL (obras classicas em dominio publico / CC0 do Wikimedia Commons, ou faixas
suas em assets/musica/<clima>/). Troca de clima conforme a emocao de cada cena, com crossfade.
Se nada puder ser baixado/lido, devolve None e o render cai na trilha sintetizada."""
import hashlib
import json
import os
import random
import subprocess
import wave
from pathlib import Path
from urllib.parse import quote

import numpy as np

import config

SR = 44100
CLIMAS = ("triste", "epica", "animada", "tensa", "misterio", "aventura")
EMOCAO_CLIMA = {"feliz": "animada", "preocupado": "triste", "surpreso": "epica", "misterioso": "misterio", "tenso": "tensa"}
# clima sem faixa disponivel cai no vizinho mais parecido
VIZINHO = {"misterio": ["tensa", "triste"], "aventura": ["epica", "animada"], "tensa": ["misterio", "epica"], "epica": ["aventura"], "triste": ["misterio"], "animada": ["aventura"]}
BASE_DO_ESTILO = {"epica": "epica", "misteriosa": "tensa", "tensa": "tensa", "leve": "animada"}
UA = "ZeroGravidadeBR/1.0 (canal educativo de YouTube; contato.luard@gmail.com)"
PASTA = config.CACHE_DIR / "musica"
NIVEL_RMS = 0.075          # nivel alvo da trilha (a voz fica por cima, com ducking no ffmpeg)
CROSSFADE = 1.6
MIN_SEGMENTO = 7.5


def _catalogo() -> dict:
    try:
        return json.loads((config.BASE_DIR / "trilhas.json").read_text(encoding="utf-8"))
    except Exception:
        return {}


def _locais(clima: str):
    pasta = config.ASSETS_DIR / "musica" / clima
    if not pasta.is_dir():
        return []
    return [{"arquivo": str(p), "titulo": p.stem, "local": True}
            for p in sorted(pasta.iterdir()) if p.suffix.lower() in (".mp3", ".ogg", ".wav", ".flac", ".m4a")]


_HOSTS_RUINS = set()     # host que falhou nesta execucao nao e tentado de novo (evita esperar timeout em cada faixa)


def _baixar(item: dict) -> Path | None:
    if item.get("local"):
        return Path(item["arquivo"])
    from urllib.parse import urlparse
    host = urlparse(item.get("url") or "https://commons.wikimedia.org").netloc
    if host in _HOSTS_RUINS:
        return None
    PASTA.mkdir(parents=True, exist_ok=True)
    nome = hashlib.md5(item["arquivo"].encode()).hexdigest()[:12] + Path(item["arquivo"]).suffix.lower()
    destino = PASTA / nome
    if destino.exists() and destino.stat().st_size > 100_000:
        return destino
    import requests
    url = item.get("url") or ("https://commons.wikimedia.org/wiki/Special:FilePath/" + quote(item["arquivo"]))
    try:
        with requests.get(url, headers={"User-Agent": UA}, stream=True, timeout=25, allow_redirects=True) as r:
            if r.status_code != 200:
                print(f"[musica] {item['titulo']}: HTTP {r.status_code}", flush=True)
                if r.status_code in (403, 429) or r.status_code >= 500:
                    _HOSTS_RUINS.add(host)
                return None
            tmp = destino.with_suffix(destino.suffix + ".part")
            with open(tmp, "wb") as f:
                for pedaco in r.iter_content(1 << 16):
                    f.write(pedaco)
            tmp.rename(destino)
        if destino.stat().st_size < 100_000:
            destino.unlink()
            return None
        return destino
    except Exception as exc:
        print(f"[musica] {item['titulo']}: falhou ({str(exc)[:80]})", flush=True)
        _HOSTS_RUINS.add(host)
        return None


def _decodificar(caminho: Path, max_seg: float = 420.0):
    """-> array float32 estereo (n,2) a 44.1 kHz, ou None."""
    try:
        p = subprocess.run(["ffmpeg", "-v", "error", "-i", str(caminho), "-t", str(max_seg), "-ac", "2", "-ar", str(SR),
                            "-f", "f32le", "-"], capture_output=True, timeout=180)
        a = np.frombuffer(p.stdout, np.float32)
        if len(a) < SR * 2 * 8:
            return None
        return a.reshape(-1, 2).copy()
    except Exception as exc:
        print(f"[musica] decodificar {caminho.name}: {str(exc)[:80]}", flush=True)
        return None


def plano_por_cenas(cenas, tempos_cena, base: str):
    """-> lista de segmentos [(t0, t1, clima)] seguindo a emocao das cenas, sem trocar a toda hora."""
    base_clima = BASE_DO_ESTILO.get(base, "epica")
    segs = []
    for c, (a, b) in zip(cenas, tempos_cena):
        clima = c.get("clima") or EMOCAO_CLIMA.get(c.get("emocao", "neutro"), base_clima)
        if segs and segs[-1][2] == clima:
            segs[-1][1] = b
        elif segs and (segs[-1][1] - segs[-1][0]) < MIN_SEGMENTO:
            segs[-1][1] = b          # trecho curto demais: segura o clima anterior
        else:
            segs.append([a, b, clima])
    if len(segs) > 1 and (segs[-1][1] - segs[-1][0]) < MIN_SEGMENTO * 0.6:
        segs[-2][1] = segs[-1][1]
        segs.pop()
    segs[0][0] = 0.0
    return [tuple(s) for s in segs]


def _escolher_trecho(audio, dur, rng):
    """Pega 'dur' segundos de uma faixa evitando comeco silencioso; se a faixa for curta, repete com crossfade."""
    n = int(dur * SR)
    mono = np.abs(audio).mean(axis=1)
    janela = SR
    rms = np.array([mono[i:i + janela].mean() for i in range(0, len(mono) - janela, janela)]) if len(mono) > janela * 2 else np.array([mono.mean()])
    mediana = float(np.median(rms)) or 1e-6
    ok = [i for i, v in enumerate(rms) if v >= 0.7 * mediana]
    if len(audio) <= n:
        trecho = audio[int(SR * ok[0]):] if ok else audio
        saida = trecho
        while len(saida) < n:
            xf = min(int(SR * 2), len(trecho) // 3)
            fade = np.linspace(0, 1, xf)[:, None]
            saida = np.concatenate([saida[:-xf], saida[-xf:] * (1 - fade) + trecho[:xf] * fade, trecho[xf:]])
        return saida[:n]
    ate = (len(audio) - n) / SR
    candidatos = [i for i in ok if i <= ate] or [0]
    # prefere comecos na primeira metade (aberturas costumam ser as mais reconheciveis)
    candidatos = candidatos[: max(1, len(candidatos) // 2 + 1)]
    ini = int(SR * rng.choice(candidatos))
    return audio[ini:ini + n]


def gerar(total: float, segmentos, saida: str, seed: int = 0):
    """Monta a trilha completa em 'saida' (wav estereo 44.1k). Devolve lista de titulos usados, ou None."""
    if os.environ.get("CANAL_MUSICA") == "sint":
        return None
    cat = _catalogo()
    rng = random.Random(seed)
    usadas, resultado, creditos = set(), [], []
    n_total = int((total + 1) * SR)
    mix = np.zeros((n_total, 2), np.float32)
    for (t0, t1, clima) in segmentos:
        # inicio um pouco antes da cena para a musica "entrar" junto com a emocao
        ini = max(0.0, t0 - CROSSFADE * 0.35) if t0 > 0 else 0.0
        fim = min(total + 1, t1 + CROSSFADE * 0.65) if t1 < total else total + 1
        dur = fim - ini
        opcoes = _locais(clima) + [dict(x) for x in cat.get(clima, [])]
        for viz in VIZINHO.get(clima, []):
            opcoes += [dict(x, _viz=True) for x in _locais(viz) + cat.get(viz, [])]
        rng.shuffle(opcoes)
        opcoes.sort(key=lambda x: (x["arquivo"] in usadas, x.get("_viz", False), not x.get("local", False), not x.get("url")))
        audio, escolhido = None, None
        for item in opcoes:
            arq = _baixar(item)
            if not arq:
                continue
            audio = _decodificar(arq)
            if audio is not None:
                escolhido = item
                break
        if audio is None:
            print(f"[musica] sem faixa para o clima '{clima}'", flush=True)
            continue
        usadas.add(escolhido["arquivo"])
        trecho = _escolher_trecho(audio, dur, rng)
        # normaliza pelo RMS do trecho
        rms = float(np.sqrt((trecho ** 2).mean())) or 1e-6
        trecho = np.clip(trecho * (NIVEL_RMS / rms), -1, 1)
        n = len(trecho)
        env = np.ones(n, np.float32)
        xf = int(CROSSFADE * SR)
        if ini > 0:
            f = min(xf, n // 2)
            env[:f] = np.sin(np.linspace(0, np.pi / 2, f)) ** 1.0
        else:
            f = min(int(1.0 * SR), n // 2)
            env[:f] = np.linspace(0, 1, f)
        if fim < total + 1:
            f = min(xf, n // 2)
            env[-f:] = np.cos(np.linspace(0, np.pi / 2, f))
        else:
            f = min(int(2.0 * SR), n // 2)
            env[-f:] = np.linspace(1, 0, f)
        i0 = int(ini * SR)
        i1 = min(n_total, i0 + n)
        mix[i0:i1] += trecho[: i1 - i0] * env[: i1 - i0, None]
        resultado.append((clima, escolhido["titulo"], escolhido.get("credito", "")))
        print(f"[musica] {ini:5.1f}-{fim:5.1f}s {clima:8s} <- {escolhido['titulo']}", flush=True)
    if not resultado:
        return None
    pico = float(np.abs(mix).max())
    if pico > 0.98:
        mix *= 0.98 / pico
    pcm = (np.clip(mix, -1, 1) * 32767).astype("<i2")
    with wave.open(saida, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    return resultado

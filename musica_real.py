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
# DIRECAO MUSICAL v2 (27/11, Andre: "comecou uma musica de tristeza no comeco do video de Chernobyl"):
# "preocupado" e TENSAO, nao tristeza; "feliz" e AVENTURA (as faixas comicas ficam fora do canal de historia).
EMOCAO_CLIMA = {"feliz": "aventura", "preocupado": "tensa", "surpreso": "epica", "misterioso": "misterio", "tenso": "tensa",
                "triste": "triste", "medo": "tensa", "raiva": "epica", "decidido": "epica", "curioso": "misterio"}
# clima sem faixa disponivel cai no vizinho mais parecido
VIZINHO = {"misterio": ["tensa", "triste"], "aventura": ["epica", "animada"], "tensa": ["misterio", "epica"], "epica": ["aventura"], "triste": ["misterio"], "animada": ["aventura"]}
BASE_DO_ESTILO = {"epica": "epica", "misteriosa": "tensa", "tensa": "tensa", "leve": "animada"}
UA = "NaoFacaIsso/1.0 (canal de humor no YouTube; contato.luard@gmail.com)"   # NFI:ua
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


# Faixas que NAO combinam com o Plano B: cortejo funebre/requiem (pesadas demais) e as comicas (quebram o clima).
PROIBIDAS = ("Marcha Funebre", "Lacrimosa", "Sad Trio", "Heartbreaking", "Monkeys Spinning Monkeys", "Fluffing a Duck",
             "Sneaky Snitch", "Can-Can", "Wallpaper", "Bumbly March")
CLIMAS_GANCHO = ("tensa", "misterio", "epica")

# Paleta por TEMA: o gancho (primeiros segundos) e as faixas preferidas de cada clima (prefixo do titulo no trilhas.json).
TEMAS = [
    ("desastre", dict(kw=["chernobyl", "pripyat", "reator", "radiac", "usina", "titanic", "iceberg", "pompeia", "vesuvio", "vulcao",
                          "terremoto", "tsunami", "incendio", "naufrag"], gancho="tensa",
                      pref={"tensa": ["Dark Fog", "Unseen Horrors", "Volatile Reaction", "Oppressive Gloom", "Long Note Four"],
                            "misterio": ["Night Cave", "Ghost Story", "Mesmerize"], "epica": ["Hero Down", "Stormfront"],
                            "triste": ["Lasting Hope", "At Rest", "Satie"], "aventura": ["Crossing the Chasm"]})),
    ("espaco", dict(kw=["apollo", "nasa", "foguete", "astronauta", "saturn", "orbita", "espaco", " lua", "marte", "galaxia"], gancho="misterio",
                    pref={"misterio": ["Floating Cities", "Infinite Perspective", "Lost Frontier", "Cipher"],
                          "tensa": ["Volatile Reaction", "Crypto", "Darkling"], "epica": ["Prelude and Action", "Exhilarate", "Heroic Age"],
                          "aventura": ["Crossing the Chasm", "Adventure Meme"], "triste": ["Dreamer", "Lasting Hope"]})),
    ("dinos", dict(kw=["dinossaur", "cretaceo", "t-rex", "rex", "pterossaur", "jurassico", "asteroide"], gancho="tensa",
                   pref={"tensa": ["Unseen Horrors", "Volatile Reaction", "Darkling"], "epica": ["Stormfront", "Achilles"],
                         "aventura": ["Rhinoceros", "Crossing the Chasm"], "misterio": ["Night Cave", "Lost Frontier"],
                         "triste": ["At Rest", "Healing"]})),
    ("futuro", dict(kw=["futuro", "2100", "2150", "2080", "robo", "inteligencia artificial", "ciborgue"], gancho="misterio",
                    pref={"misterio": ["Floating Cities", "Mesmerize", "Infinite Perspective", "Cipher"], "tensa": ["Crypto", "Volatile Reaction"],
                          "epica": ["Exhilarate", "Prelude and Action"], "aventura": ["Adventure Meme"], "triste": ["Dreamer"]})),
    ("antiga", dict(kw=["roma", "romano", "coliseu", "gladiador", "cesar", "nero", "comodo", "marco aurelio", "egito", "farao", "piramide",
                        "cleopatra", "alexandre", "esparta", "grecia", "troia", "china han"], gancho="epica",
                    pref={"epica": ["Achilles", "Clash Defiant", "Five Armies", "Heroic Age", "Holst"], "misterio": ["Curse of the Scarab", "Grim Idol"],
                          "tensa": ["Gathering Darkness", "Darkling"], "aventura": ["Master of the Feast", "Rhinoceros"], "triste": ["At Rest", "Bach - Air"]})),
    ("medieval", dict(kw=["peste", "1348", "medieval", "cavaleiro", "viking", "joana", "samurai", "xogum", "gengis", "mongol", "temujin",
                          "castelo", "cruzada", "napoleao", "waterloo"], gancho="tensa",
                      pref={"tensa": ["Gathering Darkness", "Oppressive Gloom", "Lightless Dawn", "Darkling"],
                            "epica": ["Five Armies", "Clash Defiant", "Stormfront", "Achilles"], "misterio": ["Ghost Story", "Night Cave"],
                            "aventura": ["Thatched Villagers", "Master of the Feast"], "triste": ["At Rest", "Chopin - Noturno"]})),
    ("brasil", dict(kw=["brasil ", "brasil?", "tiradentes", "cabral", "dom pedro", "d. pedro", "ipiranga", "1822", "1808", "holand", "colonia",
                        "imperador", "dom joao", "lisboa", "vila rica", "bandeirante"], gancho="epica",
                    pref={"epica": ["Heroic Age", "Exhilarate", "Prelude and Action"], "aventura": ["Crossing the Chasm", "Adventure Meme", "Thatched Villagers"],
                          "misterio": ["Investigations", "Spy Glass", "Comfortable Mystery"], "tensa": ["Hitman", "Echoes of Time"], "triste": ["Lasting Hope", "Healing"]})),
    ("invencoes", dict(kw=["dumont", "aviao", "wright", "14-bis", "14bis", "einstein", "tesla", "edison", "internet", "1900", "invenc", "newton", "londres"], gancho="misterio",
                       pref={"misterio": ["Investigations", "Comfortable Mystery", "Spy Glass", "Cipher"], "aventura": ["Adventure Meme", "Crossing the Chasm"],
                             "epica": ["Exhilarate", "Heroic Age"], "tensa": ["Echoes of Time", "Hitman"], "triste": ["Dreamer", "Satie"]})),
]


def tema_musical(conteudo: dict | None):
    """-> (nome, paleta) do tema do video (pela palavra-chave no titulo/tema/perfil); paleta neutra se nada casar."""
    if not conteudo:
        return "geral", {"gancho": "tensa", "pref": {}}
    import unicodedata
    txt = " ".join(str(conteudo.get(k, "")) for k in ("titulo", "tema", "perfil", "titulo_youtube"))
    txt = " " + "".join(ch for ch in unicodedata.normalize("NFD", txt.lower()) if unicodedata.category(ch) != "Mn")
    melhor, pontos = None, 0
    for nome, t in TEMAS:
        p = sum(txt.count(k) for k in t["kw"])
        if p > pontos:
            melhor, pontos = (nome, t), p
    return melhor or ("geral", {"gancho": "tensa", "pref": {}})


def plano_por_cenas(cenas, tempos_cena, base: str, conteudo: dict | None = None):
    """-> segmentos [(t0, t1, clima, preferidas)] com ARCO de Short:
    1. GANCHO (abertura, ate ~25% ou 8 s): sempre tensao/misterio/epico (o clima do tema). Nunca triste, nunca comico.
    2. MEIO: segue a emocao das cenas. Tristeza so depois de 40% do video (e no maximo um trecho).
    3. FINAL (pergunta A ou B): tensao ou epico, pra pessoa querer comentar.
    Sem trocar a toda hora: trechos de no minimo 7,5 s e, em Short, no maximo 3 climas."""
    if conteudo is None:             # render.py/render3d.py/render_longo.py chamam sem o roteiro: pega do chamador
        import inspect
        f = inspect.currentframe().f_back
        conteudo = f.f_locals.get("conteudo") if f else None
        conteudo = conteudo if isinstance(conteudo, dict) else None
    if getattr(config, "CANAL_HUMOR", False):     # NFI:trilha - humor: UMA faixa comica do comeco ao fim (troca so em video longo)
        total = max(b for _, b in tempos_cena) if tempos_cena else 30.0
        comicas = ["Monkeys Spinning Monkeys", "Fluffing a Duck", "Sneaky Snitch", "Wallpaper", "Bumbly March", "Carefree", "Can-Can"]
        segs = [(0.0, total, "animada", {"tema": "humor", "preferidas": comicas, "gancho": True})]
        print(f"[musica] direcao (humor): 0-{total:.0f}s animada (comica)", flush=True)
        return segs
    nome_tema, tema = tema_musical(conteudo)
    gancho = tema.get("gancho", "tensa")
    if not tempos_cena:
        return []
    total = max(b for _, b in tempos_cena)
    fim_gancho = max(min(8.0, total * 0.25), tempos_cena[0][1] if tempos_cena[0][1] <= 12 else 8.0)
    brutos = []
    ja_triste = False
    for i, (c, (a, b)) in enumerate(zip(cenas, tempos_cena)):
        clima = c.get("clima") or EMOCAO_CLIMA.get(c.get("emocao", "neutro")) or gancho
        if clima == "animada":
            clima = "aventura"
        if a < fim_gancho - 0.5:
            clima = clima if clima in CLIMAS_GANCHO else gancho
            if i == 0:
                clima = gancho if clima not in CLIMAS_GANCHO else clima
        elif clima == "triste":
            if a < total * 0.40 or ja_triste:
                clima = "misterio" if gancho != "misterio" else "tensa"
            ja_triste = True
        if i == len(cenas) - 1 and len(cenas) > 2 and clima not in ("tensa", "epica"):
            clima = "tensa" if gancho != "epica" else "epica"
        brutos.append([a, b, clima])
    segs = []
    for k, (a, b, clima) in enumerate(brutos):
        final = k == len(brutos) - 1 and len(brutos) > 2
        if segs and segs[-1][2] == clima:
            segs[-1][1] = b
        elif segs and (segs[-1][1] - segs[-1][0]) < MIN_SEGMENTO and not final:
            segs[-1][1] = b          # trecho curto demais: segura o clima anterior
        else:
            segs.append([a, b, clima])
    if len(segs) > 1 and (segs[-1][1] - segs[-1][0]) < 3.0:      # a pergunta final tem clima proprio (so some se for curtissima)
        segs[-2][1] = segs[-1][1]
        segs.pop()
    if total <= 90:
        while len(segs) > 3:         # Short: no maximo 3 climas. Some primeiro o trecho "ilhado" entre dois iguais, depois o mais curto
            i = min(range(1, len(segs) - 1), key=lambda k: (segs[k - 1][2] != segs[k + 1][2], segs[k][2] == "triste", segs[k][1] - segs[k][0]))
            segs[i - 1][1] = segs[i][1]
            segs.pop(i)
            if i < len(segs) and segs[i - 1][2] == segs[i][2]:
                segs[i - 1][1] = segs[i][1]
                segs.pop(i)
    juntos = []
    for sg in segs:                  # dois trechos seguidos com o mesmo clima viram um so (a mesma faixa continua)
        if juntos and juntos[-1][2] == sg[2]:
            juntos[-1][1] = sg[1]
        else:
            juntos.append(sg)
    segs = juntos
    segs[0][0] = 0.0
    pref = tema.get("pref", {})
    out = [(s[0], s[1], s[2], {"tema": nome_tema, "preferidas": pref.get(s[2], []), "gancho": k == 0}) for k, s in enumerate(segs)]
    print("[musica] direcao (" + nome_tema + "): " + " | ".join(f"{a:.0f}-{b:.0f}s {c}" for a, b, c, _ in out), flush=True)
    return out


def _escolher_trecho(audio, dur, rng, gancho=False):
    """Pega 'dur' segundos de uma faixa evitando comeco silencioso; se a faixa for curta, repete com crossfade."""
    n = int(dur * SR)
    mono = np.abs(audio).mean(axis=1)
    janela = SR
    rms = np.array([mono[i:i + janela].mean() for i in range(0, len(mono) - janela, janela)]) if len(mono) > janela * 2 else np.array([mono.mean()])
    mediana = float(np.median(rms)) or 1e-6
    ok = [i for i, v in enumerate(rms) if v >= (1.0 if gancho else 0.7) * mediana]   # gancho: so trecho com energia (nada de intro baixinha)
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
    if os.environ.get("PLANOB_MUSICA") == "sint":
        return None
    cat = _catalogo()
    rng = random.Random(seed)
    usadas, resultado, creditos = set(), [], []
    n_total = int((total + 1) * SR)
    mix = np.zeros((n_total, 2), np.float32)
    for seg in segmentos:
        t0, t1, clima = seg[:3]
        info = seg[3] if len(seg) > 3 else {}
        preferidas = info.get("preferidas", [])
        # inicio um pouco antes da cena para a musica "entrar" junto com a emocao
        ini = max(0.0, t0 - CROSSFADE * 0.35) if t0 > 0 else 0.0
        fim = min(total + 1, t1 + CROSSFADE * 0.65) if t1 < total else total + 1
        dur = fim - ini
        opcoes = _locais(clima) + [dict(x) for x in cat.get(clima, [])]
        for viz in VIZINHO.get(clima, []):
            opcoes += [dict(x, _viz=True) for x in _locais(viz) + cat.get(viz, [])]
        if not getattr(config, "CANAL_HUMOR", False):      # NFI:proibidas (no humor as comicas sao justamente as preferidas)
            opcoes = [x for x in opcoes if not any(p in x.get("titulo", "") for p in PROIBIDAS)]
        rng.shuffle(opcoes)

        def _pref(x):
            return not any(x.get("titulo", "").startswith(p) for p in preferidas)
        opcoes.sort(key=lambda x: (x["arquivo"] in usadas, not x.get("local", False), x.get("_viz", False), _pref(x), not x.get("url")))
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
        trecho = _escolher_trecho(audio, dur, rng, gancho=info.get("gancho", False))
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
            f = min(int(0.15 * SR), n // 2)          # o gancho entra JA (fade de 0,15 s), junto com a primeira frase
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

"""Leitor de votos nos comentarios (A/B, cores, palavras) dos Shorts.

Le os comentarios publicos de cada Short que tem votacao (API do YouTube; funciona com a chave
YOUTUBE_API_KEY ou com o token OAuth, so leitura), entende o voto mesmo quando a pessoa escreve a cor
("azul, quero ver o caos", "bolinha vermelha", "vou de B") e grava:

  state/votos.json              contagem por video + quem votou em que (para dar os creditos)
  state/respostas_sugeridas.json  rascunhos de resposta marcando @usuario (NAO publica nada: o Andre aprova)

Como o Short declara a votacao (opcional, no JSON do roteiro):
  "votacao": {"A": {"rotulo": "VERMELHO: fugir", "palavras": ["vermelho", "foge", "fugir"]},
              "B": {"rotulo": "AZUL: ficar",     "palavras": ["azul", "fica", "ficar", "esperar"]}}
Sem esse campo, a votacao e inferida do comentario_fixado ("A: ... B: ..." ou "Vermelho: ... Azul: ...").

Uso:  python votos.py            (le todos os Shorts com votacao)
      python votos.py --testar   (testa o classificador com frases de exemplo)
"""
from __future__ import annotations

import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import config

PUB = config.STATE_DIR / "publicados.json"
VOTOS = config.STATE_DIR / "votos.json"
RESPOSTAS = config.STATE_DIR / "respostas_sugeridas.json"
NEGACAO = {"nao", "nunca", "jamais", "nem", "sem"}


def _ler(p: Path, padrao):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except Exception:
        return padrao


def _norm(t: str) -> str:
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(ch for ch in t if unicodedata.category(ch) != "Mn")
    return re.sub(r"([a-z])\1{2,}", r"\1", t)        # "azuuul" -> "azul"


def _variantes(w: str) -> set:
    w = _norm(w).strip()
    v = {w}
    if len(w) > 3:
        if w[-1] in "oa":
            v |= {w[:-1] + "o", w[:-1] + "a", w[:-1] + "os", w[:-1] + "as"}
        if w.endswith("ar") or w.endswith("er") or w.endswith("ir"):
            pass
        if w.endswith("l"):
            v.add(w[:-1] + "is")        # azul -> azuis
        v.add(w + "s")
    return v


PARADAS = {"para", "voce", "voces", "com", "sua", "seu", "suas", "seus", "uma", "que", "pra", "por", "ele", "ela", "mais", "agora",
           "comenta", "fazer", "faria", "quer", "ficar", "isso", "esse", "essa", "onde", "como", "todo", "toda", "nao"}


def _opcao(letra: str, texto: str) -> dict:
    texto = re.sub(r"\s+", " ", texto).strip(" .,;:!?")
    pal = [w for w in re.findall(r"[a-zà-ÿ]{4,}", texto.lower()) if _norm(w) not in PARADAS][:6]
    return {"rotulo": f"{letra}: {texto}"[:70], "palavras": pal}


def votacao(c: dict) -> dict | None:
    """Opcoes da votacao do roteiro: {"A": {"rotulo", "palavras"}, "B": {...}} ou None.
    Ordem: campo "votacao" > comentario fixado "A: ... B: ..." > a ultima cena ("Comenta A: ... Ou B: ...")."""
    if c.get("votacao"):
        return c["votacao"]
    fixo = c.get("comentario_fixado") or ""
    falas = []
    for cena in c.get("cenas", [])[-2:]:
        falas += [b.get("texto", "") for b in (cena.get("beats") or cena.get("falas") or [])] or [cena.get("fala", "")]
    for txt in (fixo, " ".join(falas)):
        m = re.search(r"\bA\s*(?::|para|pra|=|-)\s*(.+?)(?:[.;!?]|,?\s+ou\b)\s*(?:ou\s+)?(?:comenta\s+)?\bB\s*(?::|para|pra|=|-)\s*(.+?)(?:[.;!?]|$)", txt, re.I | re.S)
        if m:
            oa, ob = _opcao("A", m.group(1)), _opcao("B", m.group(2))
            comuns = {_norm(w) for w in oa["palavras"]} & {_norm(w) for w in ob["palavras"]}
            for o in (oa, ob):                      # palavra que aparece nas duas opcoes nao decide voto
                o["palavras"] = [w for w in o["palavras"] if _norm(w) not in comuns]
            return {"A": oa, "B": ob}
    # "Vermelho: foge agora. Azul: fica e espera."  /  "A: continuar. B: abortar."
    rot = re.findall(r"(?:^|[.?!]\s+)([A-Za-zÀ-ÿ]{1,12}):", fixo)
    if len(rot) >= 2:
        return {"A": {"rotulo": rot[0].upper(), "palavras": [rot[0]]},
                "B": {"rotulo": rot[1].upper(), "palavras": [rot[1]]}}
    return None


def classificar(texto: str, opc: dict) -> str | None:
    """'A', 'B' ou None (sem voto claro / ambiguo / negado)."""
    t = _norm(texto)
    toks = re.findall(r"[a-z0-9]+", t)
    if not toks:
        return None
    achou = {}
    for letra, o in opc.items():
        letra = letra.upper()
        palavras = set()
        for p in o.get("palavras", []):
            palavras |= _variantes(p)
        for i, tk in enumerate(toks):
            if tk in palavras and len(tk) > 1:
                if any(x in NEGACAO for x in toks[max(0, i - 2):i]):
                    achou.setdefault(letra, -1)       # "nao quero azul": nao conta
                else:
                    achou[letra] = achou.get(letra, 0) + 1 if achou.get(letra, 0) >= 0 else 1
    # letras soltas (A / B / 1 / 2): so valem em comentario curto ou com "letra/opcao/vou de"
    curto = len(toks) <= 4
    rot = {"A": ("a", "1"), "B": ("b", "2")}
    for letra, simbolos in rot.items():
        if letra in achou:
            continue
        for s in simbolos:
            if (curto and s in toks) or re.search(rf"\b(letra|opcao|alternativa|caminho|escolho|voto|vou de|vou na|vou no)\s+{s}\b", t) \
                    or re.match(rf"^\s*{s}\b(?!\s+(gente|pessoal))", t) and len(toks) <= 6:
                if re.search(r"\b(a|b)\b", t) or s in "12":
                    achou[letra] = achou.get(letra, 0) + 1
                break
    pos = {k: v for k, v in achou.items() if v > 0}
    if len(pos) == 1:
        return next(iter(pos))
    if len(pos) == 2:                      # cita as duas: vale a que tem mais mencoes; empate = ambiguo
        (k1, v1), (k2, v2) = sorted(pos.items(), key=lambda kv: -kv[1])
        return k1 if v1 > v2 else None
    return None


# --------------------------------------------------------------------------- leitura (YouTube)
def _comentarios(video_id: str) -> list:
    """[{id, autor, texto, likes, publicado_em}] (ate ~300 mais recentes)."""
    chave = os.environ.get("YOUTUBE_API_KEY", "").strip()
    saida, token = [], None
    yt = None
    if not chave:
        from googleapiclient.discovery import build
        import upload
        yt = build("youtube", "v3", credentials=upload._get_credentials())
    for _ in range(3):
        if chave:
            q = {"part": "snippet", "videoId": video_id, "maxResults": 100, "order": "time",
                 "textFormat": "plainText", "key": chave}
            if token:
                q["pageToken"] = token
            with urllib.request.urlopen("https://www.googleapis.com/youtube/v3/commentThreads?" + urllib.parse.urlencode(q), timeout=25) as r:
                d = json.loads(r.read().decode("utf-8"))
        else:
            d = yt.commentThreads().list(part="snippet", videoId=video_id, maxResults=100, order="time",
                                         textFormat="plainText", pageToken=token).execute()
        for it in d.get("items", []):
            s = it["snippet"]["topLevelComment"]["snippet"]
            saida.append({"id": it["id"], "autor": s.get("authorDisplayName", ""), "texto": s.get("textOriginal") or s.get("textDisplay", ""),
                          "likes": s.get("likeCount", 0), "publicado_em": s.get("publishedAt", "")})
        token = d.get("nextPageToken")
        if not token:
            break
    return saida


def coletar() -> dict:
    pubs = _ler(PUB, [])
    antigo = _ler(VOTOS, {})
    resp = _ler(RESPOSTAS, [])
    ja_respondido = {r["comentario_id"] for r in resp}
    por_id = {}
    for arq in config.CONTEUDO_DIR.glob("*.json"):
        try:
            d = json.loads(arq.read_text(encoding="utf-8"))
            por_id[d.get("id")] = d
        except Exception:
            pass
    agora = datetime.now(timezone.utc).isoformat(timespec="minutes")
    novo = {}
    for p in pubs:
        c = por_id.get(p["id"])
        if not c or c.get("formato") == "longo":
            continue
        opc = votacao(c)
        if not opc:
            continue
        try:
            coms = _comentarios(p["video_id"])
        except Exception as exc:
            det = getattr(exc, "content", b"")
            det = det.decode("utf-8", "ignore") if isinstance(det, bytes) else str(det)
            mot = re.search(r'"reason":\s*"([^"]+)"', det)
            print(f"[votos] {p['id']}: nao consegui ler comentarios (HTTP {getattr(getattr(exc, 'resp', None), 'status', '?')} "
                  f"{mot.group(1) if mot else str(exc)[:80]})", flush=True)
            if p["video_id"] in antigo:
                novo[p["video_id"]] = antigo[p["video_id"]]
            continue
        votantes = {}
        for cm in sorted(coms, key=lambda x: x["publicado_em"]):   # o ultimo comentario da pessoa vale
            v = classificar(cm["texto"], opc)
            if v:
                votantes[cm["autor"]] = {"autor": cm["autor"], "voto": v, "likes": cm["likes"], "texto": cm["texto"][:200],
                                         "comentario_id": cm["id"]}
        cont = {"A": 0, "B": 0}
        for x in votantes.values():
            cont[x["voto"]] += 1
        venc = "A" if cont["A"] > cont["B"] else "B" if cont["B"] > cont["A"] else None
        novo[p["video_id"]] = {
            "item_id": p["id"], "titulo": c.get("titulo_youtube") or c.get("titulo", ""),
            "rotulos": {k: o.get("rotulo", k) for k, o in opc.items()}, "contagem": cont, "vencedora": venc,
            "comentarios_lidos": len(coms), "votantes": list(votantes.values()), "atualizado": agora}
        for x in votantes.values():
            if x["comentario_id"] not in ja_respondido:
                rot = opc[x["voto"]].get("rotulo", x["voto"])
                resp.append({"video_id": p["video_id"], "item_id": p["id"], "comentario_id": x["comentario_id"], "autor": x["autor"],
                             "voto": x["voto"], "comentario": x["texto"], "publicado": False,
                             "rascunho": rascunho_resposta(x["autor"], rot)})
                ja_respondido.add(x["comentario_id"])
        print(f"[votos] {p['id']} ({p['video_id']}): A={cont['A']} B={cont['B']} lidos={len(coms)}", flush=True)
    VOTOS.write_text(json.dumps(novo, ensure_ascii=False, indent=1), encoding="utf-8")
    RESPOSTAS.write_text(json.dumps(resp, ensure_ascii=False, indent=1), encoding="utf-8")
    return novo


def rascunho_resposta(autor: str, rotulo: str) -> str:
    a = autor if autor.startswith("@") else "@" + autor
    return (f"{a} voto anotado: {rotulo}! Quando a continuação sair, o seu nome vai nos créditos. "
            f"Chama quem pensa diferente pra votar também!")


def creditos(item_id: str, max_nomes: int = 6) -> str:
    """Bloco para a descricao/comentario fixado da continuacao: quem escolheu o caminho vencedor."""
    for v in _ler(VOTOS, {}).values():
        if v.get("item_id") != item_id or not v.get("vencedora"):
            continue
        venc = v["vencedora"]
        gente = sorted([x for x in v["votantes"] if x["voto"] == venc], key=lambda x: -x["likes"])[:max_nomes]
        if not gente:
            return ""
        nomes = ", ".join(x["autor"] if x["autor"].startswith("@") else "@" + x["autor"] for x in gente)
        rot = v["rotulos"].get(venc, venc)
        return (f"Este episódio existe por causa da votação do vídeo anterior: o caminho mais votado foi {rot}. "
                f"Créditos a quem votou: {nomes}. Obrigado por decidir a história!")
    return ""


def _testar() -> int:
    opc = {"A": {"rotulo": "VERMELHO", "palavras": ["vermelho", "foge", "fugir"]},
           "B": {"rotulo": "AZUL", "palavras": ["azul", "fica", "ficar", "esperar"]}}
    casos = [("Azul, quero ver o caos", "B"), ("bolinha vermelha!!", "A"), ("VERMELHA", "A"), ("vou de A", "A"), ("B", "B"),
             ("Eu fugia, vermelho", "A"), ("Duvido acharem a bandeira do Estados Unidos", None),
             ("nao quero azul", None), ("a gente morre de qualquer jeito", None), ("azul ou vermelho?", None),
             ("Azuuul", "B"), ("fica e espera", "B"), ("Letra A", "A"), ("opção 2", "B")]
    ruim = 0
    for t, esp in casos:
        r = classificar(t, opc)
        ok = r == esp
        ruim += not ok
        print(("OK   " if ok else "ERRO ") + f"{t!r} -> {r} (esperado {esp})")
    return 1 if ruim else 0


if __name__ == "__main__":
    if "--testar" in sys.argv:
        sys.exit(_testar())
    coletar()

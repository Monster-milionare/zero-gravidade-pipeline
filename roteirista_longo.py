#!/usr/bin/env python3
"""Escreve um roteiro LONGO (documentario de ~9 min, 16:9) via Groq, capitulo por capitulo.

Pega o proximo tema de temas_longos.txt que ainda nao virou conteudo/*.json.
1) Plano: titulo, descricao e 8 capitulos (nome, ano, hora, cenario, fatos reais).
2) Cada capitulo vira ~9 cenas no mesmo formato dos Shorts (falas com narrador e personagens).
Valida e tenta ate 3 vezes por capitulo. Imprime o id do roteiro novo.
"""
import json
import re
import sys
import unicodedata

import config
import roteirista as R

AMBIENTES = "conves, terra, cabine, palacio, cidade, cidade-antiga, campo, laboratorio, lua, arena, deserto, aerodromo, selva, vapor"
HORAS = "dia, manha, amanhecer, tarde, entardecer, noite, madrugada"
PROIBIDOS = ("—", "–", "*", "#")

PLANO = """Voce e roteirista de documentarios curtos de historia em portugues do Brasil para o canal "Plano B da Historia" (animacao de bonecos redondinhos, narracao em segunda pessoa: "voce acorda em...").
Tema: {titulo}
Planeje um video de 9 minutos com 8 capitulos em ordem cronologica. Liste em "pessoas" as ate 4 pessoas REAIS principais (o espectador e a primeira, papel "prot"); se nao tiver certeza de um dado, deixe fora. REGRAS DE VERDADE: so fatos reais e verificaveis (datas, nomes, numeros). Se nao tiver certeza, nao inclua. Nada inventado.
Responda SOMENTE com JSON: {{"titulo": "...", "titulo_youtube": "ate 95 caracteres, com numero ou nome concreto e curiosidade, sem clickbait falso", "titulo_curto": "ate 28 caracteres MAIUSCULAS", "thumb_texto": "2 a 4 palavras MAIUSCULAS", "descricao": "2 a 3 frases", "comentario_fixado": "1 frase que pergunta a opiniao e repete a votacao A ou B", "tags": ["..."],
"opcao_a": "decisao concreta A do espectador no fim", "opcao_b": "decisao concreta B",
"pessoas": [{{"nome": "nome real completo", "papel": "prot (quem o espectador e) ou f0/f1/f2", "cargo": "cargo/funcao curta", "info": ["2 fatos curtos REAIS: datas de vida, feito marcante"], "selo": "missao/evento em ate 14 letras"}}],
"capitulos": [{{"nome": "...", "ano": "ano ou data curta, ex.: 79 d.C.", "hora": "{horas}", "cenario": "UM destes: {amb}", "fatos": ["3 a 5 fatos REAIS deste capitulo"]}}]}}"""

CAP = """Voce e roteirista de documentarios de historia em portugues do Brasil (canal "Plano B da Historia"). Escreva o capitulo {i} de {n} do video "{titulo}".
Capitulo: {nome} ({ano}). Cenario: {cenario}. Fatos reais permitidos (use SO estes e o que for notoriamente verdadeiro; nao invente numeros, citacoes nem detalhes): {fatos}
{contexto}
ESTILO: narracao em segunda pessoa ("voce"), ritmo de suspense, frases curtas, gancho ao fim do capitulo. Numeros por extenso na fala. Sem tracos longos, emojis, asteriscos, hashtags. A parte hipotetica deve vir marcada ("imagine", "talvez").
CENAS: 8 a 10 cenas, 130 a 220 palavras no total. Cada cena: "falas": lista de {{"quem": "narrador"|"prot"|"f0"|"f1"|"f2", "texto": "..."}} (o narrador conta; personagens falam em primeira pessoa com ate 12 palavras; pelo menos 3 cenas com dialogo de personagem), "emocao" (neutro|feliz|surpreso|preocupado|misterioso), "destaques" (1 a 3 palavras da fala) e opcional "hora" ({horas}) quando mudar. CONTINUIDADE: lugar, hora, epoca e quem esta em cena tem que bater com a fala; ninguem usa objeto que ainda nao existia; quem morreu nao fala.
HISTORIA CONSTRUIDA: em cada capitulo voce chega ao lugar e os personagens ENTRAM um a um quando falam ou sao citados pelo nome (nunca todos de uma vez). Pessoas reais deste video: {pessoas}. Quando citar alguem, use o NOME e o "quem" dele (f0/f1/f2) nas falas dele. Pode usar "acao": "anda" (voce caminha ate outro ponto) ou "porta" (voce abre uma porta) numa cena. Um efeito visual opcional "fx" so se a fala descrever exatamente isso.
{fecho}
Responda SOMENTE com JSON: {{"cenas": [ ... ]}}"""

FECHO_FINAL = ('ULTIMA cena do video: peca o voto: "Comenta A para {a}, ou B para {b}. A mais votada vira o proximo episodio." '
               "e termine reconectando com a primeira frase do video.")


def _slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:40]


def proximo_tema():
    feitos = {p.stem.split("-", 1)[1] for p in config.CONTEUDO_DIR.glob("*.json") if "-" in p.stem}
    arq = config.BASE_DIR / "temas_longos.txt"
    for linha in arq.read_text(encoding="utf-8").splitlines():
        if linha.strip() and _slug(linha) not in feitos and _slug(linha + "-longo") not in feitos:
            return linha.strip()
    return None


def validar_cap(cenas, ultimo):
    if not isinstance(cenas, list) or not 6 <= len(cenas) <= 13:
        return "numero de cenas fora de 6-13"
    total, dialogos = 0, 0
    for c in cenas:
        fl = c.get("falas")
        if not isinstance(fl, list) or not fl or not all(isinstance(x, dict) and isinstance(x.get("texto"), str) for x in fl):
            return "falas mal formadas"
        for x in fl:
            if x.get("quem") not in ("narrador", "prot", "f0", "f1", "f2"):
                x["quem"] = "narrador"
        c["fala"] = " ".join(x["texto"].strip() for x in fl)
        if any(ch in c["fala"] for ch in PROIBIDOS):
            return "caractere proibido"
        if len(c["fala"].split()) > 45:
            return "cena longa demais"
        total += len(c["fala"].split())
        dialogos += any(x["quem"] != "narrador" for x in fl)
        if c.get("emocao") not in ("neutro", "feliz", "surpreso", "preocupado", "misterioso"):
            c["emocao"] = "neutro"
        c["visuais"] = ["cinematic scene"]
        c.pop("hora", None) if c.get("hora") not in HORAS.split(", ") else None
    if dialogos < 2:
        return "poucos dialogos"
    if not 90 <= total <= 300:
        return f"{total} palavras (precisa 90-300)"
    if ultimo and not any(w in cenas[-1]["fala"].lower() for w in ("comenta", "vota")):
        return "ultima cena sem pedido de voto"
    return None


def _pedir(prompt, temp=0.7):
    """Chamada ao Groq com espera e nova tentativa quando o limite por minuto (429) ou um erro temporario aparece."""
    import time
    import requests
    ultimo = ""
    for t in range(6):
        r = requests.post("https://api.groq.com/openai/v1/chat/completions", timeout=180,
                          headers={"Authorization": f"Bearer {config.GROQ_API_KEY}"},
                          json={"model": config.GROQ_MODEL, "temperature": temp, "response_format": {"type": "json_object"},
                                "messages": [{"role": "user", "content": prompt}]})
        try:
            j = r.json()
        except Exception:
            j = {}
        if r.status_code == 200 and j.get("choices"):
            time.sleep(2)
            return json.loads(j["choices"][0]["message"]["content"])
        ultimo = f"{r.status_code} {str(j)[:200]}"
        espera = float(r.headers.get("retry-after", 0) or 0) or 15 * (t + 1)
        print(f"[longo-roteirista] Groq respondeu {ultimo}; esperando {min(espera, 70):.0f}s", flush=True)
        time.sleep(min(espera, 70))
    raise RuntimeError(f"Groq indisponivel: {ultimo}")


def gerar(titulo):
    if not config.GROQ_API_KEY:
        print("[longo-roteirista] GROQ_API_KEY ausente.")
        return None
    plano = None
    for t in range(3):
        try:
            p = _pedir(PLANO.format(titulo=titulo, horas=HORAS, amb=AMBIENTES), 0.5)
            caps = p.get("capitulos")
            if isinstance(caps, list) and len(caps) >= 6 and p.get("opcao_a") and p.get("opcao_b"):
                plano = p
                break
        except Exception as exc:
            print(f"[longo-roteirista] plano tentativa {t + 1} falhou: {str(exc)[:100]}")
    if not plano:
        return None
    caps = plano["capitulos"][:9]
    cenas, resumo = [], ""
    for i, cap in enumerate(caps, 1):
        ultimo = i == len(caps)
        amb = cap.get("cenario") if cap.get("cenario") in AMBIENTES.split(", ") else "cidade"
        ok = None
        for t in range(3):
            try:
                prompt = CAP.format(i=i, n=len(caps), titulo=plano.get("titulo", titulo), nome=cap.get("nome", ""), ano=cap.get("ano", ""),
                                    cenario=amb, fatos="; ".join(map(str, cap.get("fatos", []))),
                                    contexto=(f"Resumo do que ja foi contado: {resumo}\n" if resumo else "Este e o INICIO: a primeira cena e um gancho de ate 14 palavras que prende em 2 segundos.\n"),
                                    horas=HORAS, pessoas=json.dumps(plano.get("pessoas") or [], ensure_ascii=False)[:500], fecho=(FECHO_FINAL.format(a=plano["opcao_a"], b=plano["opcao_b"]) if ultimo else "A ultima cena deixa um gancho para o proximo capitulo."))
                d = _pedir(prompt)
                err = validar_cap(d.get("cenas"), ultimo)
                if err:
                    print(f"[longo-roteirista] cap {i} tentativa {t + 1}: {err}")
                    continue
                ok = d["cenas"]
                break
            except Exception as exc:
                print(f"[longo-roteirista] cap {i} tentativa {t + 1} falhou: {str(exc)[:100]}")
        if not ok:
            print(f"[longo-roteirista] capitulo {i} nao validou; abortando (nada e salvo).")
            return None
        for j, c in enumerate(ok):
            c["amb"] = amb
            if j == 0:
                c["capitulo"] = cap.get("nome", f"Parte {i}")
                c["ano"] = str(cap.get("ano", ""))
                if cap.get("hora") in HORAS.split(", ") and not c.get("hora"):
                    c["hora"] = cap["hora"]
        cenas += ok
        resumo = (resumo + " " + str(cap.get("nome", "")) + ".").strip()[-600:]
    ordem = 900 + len(list(config.CONTEUDO_DIR.glob("*-longo*.json"))) + 1
    c = {"id": f"{ordem - 860:02d}-{_slug(titulo)}-longo", "ordem": ordem, "formato": "longo", "estilo": "epico",
         "titulo": plano.get("titulo", titulo), "titulo_youtube": str(plano.get("titulo_youtube") or titulo)[:99],
         "titulo_curto": str(plano.get("titulo_curto") or titulo)[:28].upper(), "thumb_texto": str(plano.get("thumb_texto") or titulo).upper(),
         "descricao": plano.get("descricao", titulo), "comentario_fixado": plano.get("comentario_fixado", ""),
         "tags": plano.get("tags", []), "cenas": cenas,
         "pessoas": [p for p in (plano.get("pessoas") or []) if isinstance(p, dict) and p.get("nome")][:4]}
    (config.CONTEUDO_DIR / f"{c['id']}.json").write_text(json.dumps(c, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[longo-roteirista] novo roteiro longo: {c['id']} ({len(cenas)} cenas, {sum(len(x['fala'].split()) for x in cenas)} palavras)")
    return c["id"]


def main_gerar():
    t = proximo_tema()
    if not t:
        print("[longo-roteirista] temas_longos.txt acabou.")
        return None
    return gerar(t)


def main():
    main_gerar()
    return 0


if __name__ == "__main__":
    sys.exit(main())

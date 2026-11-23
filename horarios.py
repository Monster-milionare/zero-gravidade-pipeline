#!/usr/bin/env python3
"""Agenda de horarios de publicacao: escolhe os melhores horarios do dia e vai aprendendo com as views.

Como funciona
  1. PRIOR: curva de audiencia tipica de Shorts no Brasil (Brasilia), uma para dia util e outra para fim de semana.
  2. APRENDIZADO: cada video medido (state/videos.json + state/views.json, 20h+ no ar) vira uma nota
     "views/dia dele / views/dia esperado para o tipo dele" (corrige o efeito do conteudo: um 'escolha' sempre vai
     melhor que um 'voce-acorda', e isso nao pode ser creditado ao horario). A nota vai para a hora em que o video
     foi publicado (e, com metade do peso, para as horas vizinhas).
  3. ESCOLHA: nota do horario = (soma das notas + K * prior) / (n + K) + bonus de exploracao (horas pouco testadas
     ganham um empurrao, para o sistema nunca parar de testar). Pega as 4 melhores com >= 2h entre si.
     Determinista por data: o mesmo dia sempre gera a mesma agenda (por isso nao precisa gravar nada).

Uso:  python horarios.py              (agenda de hoje + tabela das horas)
      python horarios.py 2026-11-25   (agenda de outro dia)
      python horarios.py --testar
"""
from __future__ import annotations

import json
import math
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

BRT = timezone(timedelta(hours=-3))
BASE = Path(__file__).resolve().parent
STATE = BASE / "state"

HORAS = list(range(7, 23))            # candidatas: 07h..22h (Brasilia)
ESPACO_H = 2                          # minimo entre dois Shorts
K_PRIOR = 3.0                         # peso do prior (equivale a 3 videos "fantasmas")
EXPLORA = 0.35                        # forca do bonus de exploracao
IDADE_MIN_H = 20
DIAS_JANELA = 4

# Prior de audiencia (0..1.3). Dia util: pico no almoco e das 18h as 21h. Fim de semana: manha e tarde mais fortes.
PRIOR_UTIL = {7: .70, 8: .65, 9: .60, 10: .60, 11: .70, 12: 1.05, 13: .95, 14: .70, 15: .70, 16: .80, 17: .95,
              18: 1.20, 19: 1.30, 20: 1.30, 21: 1.15, 22: .85}
PRIOR_FDS = {7: .50, 8: .60, 9: .80, 10: 1.00, 11: 1.10, 12: 1.10, 13: 1.00, 14: .90, 15: .95, 16: 1.00, 17: 1.10,
             18: 1.20, 19: 1.25, 20: 1.25, 21: 1.10, 22: .85}


def _ler(p, padrao):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except Exception:
        return padrao


def _prior(d: date) -> dict:
    return PRIOR_FDS if d.weekday() >= 5 else PRIOR_UTIL


def observacoes(videos: list, views: dict, pesos: dict, agora: datetime | None = None) -> list:
    """[(hora_brt, nota)] - nota = views/dia do video / views/dia esperado para o tipo dele."""
    agora = agora or datetime.now(timezone.utc)
    medidas = []
    for v in videos:
        if v.get("formato") == "longo":
            continue
        info = views.get(v.get("video_id"))
        try:
            t = datetime.fromisoformat(v["publicado_em"])
        except Exception:
            continue
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        idade = (agora - t).total_seconds() / 3600
        if not info or idade < IDADE_MIN_H:
            continue
        vpd = info["views"] / min(max(idade / 24, 1.0), DIAS_JANELA)
        medidas.append((v, t.astimezone(BRT), vpd))
    if not medidas:
        return []
    media = sum(x[2] for x in medidas) / len(medidas)
    if media <= 0:
        return []
    saida = []
    for v, t, vpd in medidas:
        esperado = media * pesos.get("formatos", {}).get(v.get("formato"), 1.0) * pesos.get("estilos", {}).get(v.get("estilo"), 1.0)
        saida.append((t.hour, min(3.0, vpd / max(esperado, 1e-6))))
    return saida


def tabela(d: date, obs: list) -> dict:
    """{hora: dict(nota, n, prior, ucb)} para as horas candidatas."""
    pri = _prior(d)
    res = {}
    for h in HORAS:
        n = soma = 0.0
        for hh, nota in obs:
            peso = 1.0 if hh == h else 0.5 if abs(hh - h) == 1 else 0.0
            n += peso
            soma += peso * nota
        nota = (soma + K_PRIOR * pri[h]) / (n + K_PRIOR)
        ucb = nota + EXPLORA / math.sqrt(n + 1)
        res[h] = dict(nota=nota, n=n, prior=pri[h], ucb=ucb)
    return res


def planejar(d: date, videos=None, views=None, pesos=None, qtd: int = 4, agora=None) -> list:
    """Lista de horas (BRT) para os Shorts do dia `d`, em ordem."""
    videos = _ler(STATE / "videos.json", []) if videos is None else videos
    views = _ler(STATE / "views.json", {}) if views is None else views
    pesos = _ler(STATE / "pesos.json", {}) if pesos is None else pesos
    tab = tabela(d, observacoes(videos, views, pesos, agora))
    # desempate determinista por data (evita sempre as mesmas horas quando as notas empatam)
    def chave(h):
        return (round(tab[h]["ucb"], 3), -((h * 7 + d.toordinal()) % 5))
    escolhidas = []
    for h in sorted(HORAS, key=chave, reverse=True):
        if all(abs(h - x) >= ESPACO_H for x in escolhidas):
            escolhidas.append(h)
        if len(escolhidas) == qtd:
            break
    return sorted(escolhidas)


def horario_longo(d: date) -> int:
    """O longo rende mais com a pessoa sentada: noite no dia util, fim de manha/tarde no fim de semana."""
    return 11 if d.weekday() >= 5 else 19


def _testar() -> int:
    d = date(2026, 11, 25)
    ag = planejar(d, [], {}, {})
    ok = len(ag) == 4 and all(b - a >= ESPACO_H for a, b in zip(ag, ag[1:])) and any(h in (19, 20) for h in ag)
    print("sem dados:", ag, "OK" if ok else "ERRO")
    # com dados: videos publicados as 20h BRT (23Z) muito acima do esperado -> 20h tem que entrar
    agora = datetime(2026, 11, 25, 12, 0, tzinfo=timezone.utc)
    vids, vw = [], {}
    for i in range(8):
        dia = 10 + i
        vids.append({"video_id": f"a{i}", "formato": "e-se", "estilo": "epico", "publicado_em": f"2026-11-{dia:02d}T23:10:00+00:00"})
        vw[f"a{i}"] = {"views": 4000}
        vids.append({"video_id": f"b{i}", "formato": "e-se", "estilo": "epico", "publicado_em": f"2026-11-{dia:02d}T12:10:00+00:00"})
        vw[f"b{i}"] = {"views": 100}
    ag2 = planejar(d, vids, vw, {}, agora=agora)
    ok2 = 20 in ag2 and 9 not in ag2
    print("com dados (20h forte, 9h fraco):", ag2, "OK" if ok2 else "ERRO")
    ok3 = planejar(d, [], {}, {}) == planejar(d, [], {}, {})
    print("determinista:", "OK" if ok3 else "ERRO")
    return 0 if ok and ok2 and ok3 else 1


if __name__ == "__main__":
    if "--testar" in sys.argv:
        sys.exit(_testar())
    alvo = next((date.fromisoformat(a) for a in sys.argv[1:] if a[:2] == "20"), datetime.now(BRT).date())
    ag = planejar(alvo)
    print(f"Agenda de {alvo:%d/%m/%Y} (Brasilia): Shorts as {', '.join(f'{h:02d}h' for h in ag)}; longo as {horario_longo(alvo):02d}h")
    obs = observacoes(_ler(STATE / 'videos.json', []), _ler(STATE / 'views.json', {}), _ler(STATE / 'pesos.json', {}))
    print(f"({len(obs)} videos medidos)")
    for h, x in tabela(alvo, obs).items():
        print(f"  {h:02d}h  nota {x['nota']:.2f}  (prior {x['prior']:.2f}, amostra {x['n']:.1f})" + ("  <-- escolhido" if h in ag else ""))

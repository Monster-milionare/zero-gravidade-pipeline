#!/usr/bin/env python3
"""Supervisor geral do canal: roda todo dia (junto do placar de metricas) e escreve:

  state/supervisor.md  relatorio: alertas de repeticao/qualidade/estoque + o que fazer (lido pelo Claude supervisor)
  state/foco.json      pesos por tema (views/dia relativo) que diversidade.diversificar usa para priorizar a fila

Auditorias: (1) repeticao de tema, cenarios e elenco nos ultimos Shorts; (2) rodizio 2D/3D; (3) estoque por motor e tema;
(4) elenco generico/suspeito; (5) metricas por tema/formato/horario. Nunca derruba o workflow e nunca remove item da fila.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone

import config
import diversidade
import publish

JANELA = 8
PRIOR = 2
MIN_VIDEOS = 3


def _ler(p, padrao):
    return diversidade._ler(p, padrao)


def auditar() -> tuple:
    alertas, tarefas = [], []
    por_id = diversidade._todos()
    pubs = _ler(config.STATE_DIR / "publicados.json", [])
    rec = diversidade.recentes(JANELA)
    temas = Counter(r["tema"] for r in rec)
    for t, n in temas.items():
        if n >= 3:
            alertas.append(f"REPETICAO de tema: '{t}' em {n} dos ultimos {len(rec)} Shorts.")
            tarefas.append(f"Criar roteiros de OUTROS temas (nao '{t}') e novos cenarios/modelos para sair da mesmice.")
    seguidos = sum(1 for a, b in zip(rec, rec[1:]) if a["tema"] == b["tema"])
    if seguidos >= 2:
        alertas.append(f"{seguidos} pares de Shorts seguidos com o mesmo tema.")
    cen = Counter(c for r in rec for c in r["cenarios"])
    for c, n in cen.items():
        if n >= max(4, len(rec) // 2 + 1):
            alertas.append(f"CENARIO repetido: '{c}' aparece em {n} dos ultimos {len(rec)} Shorts.")
    elenco = Counter(e for r in rec for e in r["elenco"])
    for e, n in elenco.items():
        if n >= max(4, len(rec) // 2 + 1):
            alertas.append(f"MODELO repetido: '{e}' aparece em {n} dos ultimos {len(rec)} Shorts.")
    motores = Counter(r["motor"] for r in rec)
    if rec and (motores["2d"] == 0 or motores["3d"] == 0):
        alertas.append(f"Rodizio 2D/3D quebrado nos ultimos {len(rec)} Shorts: {dict(motores)}.")
    # estoque
    fila = publish.pendentes()
    import coerencia
    ok = [c for c in fila if not coerencia.validar(c)["erros"]]
    est = Counter(diversidade.motor(c) for c in ok)
    for m in ("2d", "3d"):
        if est[m] < 3:
            alertas.append(f"ESTOQUE baixo de Shorts {m.upper()} liberados: {est[m]} (meta >= 3).")
            tarefas.append(f"Escrever mais Shorts {m.upper()} (temas novos, cenarios novos).")
    tem_est = Counter(diversidade.tema(c) for c in ok)
    # direcao do filme (qualidade.py): o que o espectador vai VER em cada roteiro da fila
    import qualidade
    for c in ok[:20]:
        try:
            q = qualidade.simular(c)
        except Exception:
            continue
        for e in q["erros"]:
            alertas.append(f"QUALIDADE {c['id']}: {e} (barrado ate corrigir)")
            tarefas.append(f"Corrigir a direcao de {c['id']}: {e}")
        for a in q["avisos"]:
            alertas.append(f"direcao {c['id']}: {a}")
    st = _ler(config.STATE_DIR / "respostas_status.json", {})
    if False and st.get("precisa_autorizar"):     # Andre 26/11: nao precisa responder comentario, so fazer o video
        alertas.append(f"COMENTARIOS: {st.get('pendentes', 0)} resposta(s) de voto esperando: o token do canal nao tem permissao de comentar.")
        tarefas.append("Andre: rodar autorizar_youtube.py no PC e atualizar o secret YOUTUBE_TOKEN_JSON (libera as respostas aos votos).")
    try:
        import continuacao
        pend = continuacao.pendentes()
        if pend:
            alertas.append(f"CONTINUACAO: {len(pend)} video(s) com voto vencedor ainda sem episodio seguinte: " + ", ".join(o["id"] for _, o in pend[:5]))
    except Exception:
        pass
    for c in ok:
        r = coerencia.validar(c)
        for a in r["avisos"]:
            if "o texto diz" in a:
                alertas.append(f"luz/efeito {c['id']}: {a}")
    # elenco suspeito: perfil generico no 3D, ou cenario antigo com protagonista cientista/internet
    for d in pubs[-12:]:
        c = por_id.get(d.get("id"))
        if not c or c.get("formato") == "longo" or diversidade.motor(c) == "2d":
            continue
        if diversidade.tema(c) in ("generico", "internet") and not c.get("perfil"):
            alertas.append(f"Elenco suspeito em {c['id']}: perfil '{diversidade.tema(c)}' sem perfil explicito no roteiro.")
            tarefas.append(f"Definir 'perfil' explicito (ou criar perfil novo) em {c['id']}.")
    return alertas, tarefas, est, tem_est


def foco() -> tuple:
    """Pesos por tema e formato a partir das views (mesma ideia do placar: media/dia, encolhimento para a media geral)."""
    vids = _ler(config.STATE_DIR / "videos.json", [])
    views = _ler(config.STATE_DIR / "views.json", {})
    por_id = diversidade._todos()
    agora = datetime.now(timezone.utc)
    med = []
    for v in vids:
        c = por_id.get(v.get("item_id"))
        info = views.get(v.get("video_id"))
        if not c or not info or c.get("formato") == "longo":
            continue
        try:
            t = datetime.fromisoformat(v["publicado_em"])
        except Exception:
            continue
        if t.tzinfo is None:
            t = t.replace(tzinfo=timezone.utc)
        idade = (agora - t).total_seconds() / 3600
        if idade < 20:
            continue
        med.append((diversidade.tema(c), c.get("formato"), info["views"] / min(max(idade / 24, 1.0), 4)))
    if len(med) < 5:
        return {}, {}, med
    media = sum(x[2] for x in med) / len(med)

    def pesos(idx):
        g = {}
        for m in med:
            g.setdefault(m[idx], []).append(m[2])
        return {k: (round(min(2.0, max(0.5, ((sum(xs) + PRIOR * media) / (len(xs) + PRIOR)) / media)), 3), len(xs), sum(xs) / len(xs))
                for k, xs in g.items()}
    return pesos(0), pesos(1), med


def main() -> int:
    alertas, tarefas, est, tem_est = auditar()
    tp, fp, med = foco()
    agora = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC")
    L = [f"# Supervisor geral - Plano B ({agora})", ""]
    L += ["## Alertas", ""] + ([f"- {a}" for a in alertas] or ["- Nenhum alerta de repeticao ou estoque."]) + [""]
    L += ["## O que fazer", ""] + ([f"- {t}" for t in dict.fromkeys(tarefas)] or ["- Nada urgente."]) + [""]
    L += ["## Estoque liberado (fila)", "", f"- 2D: {est['2d']} | 3D: {est['3d']}",
          "- Por tema: " + (", ".join(f"{k}={v}" for k, v in tem_est.most_common()) or "vazio"), ""]
    if tp:
        L += ["## Foco por tema (views/dia, peso 0.5-2.0)", "", "| tema | videos | views/dia | peso |", "|---|---|---|---|"]
        L += [f"| {k} | {n} | {m:.0f} | {p} |" for k, (p, n, m) in sorted(tp.items(), key=lambda kv: -kv[1][0])]
        L += ["", "## Foco por formato", "", "| formato | videos | views/dia | peso |", "|---|---|---|---|"]
        L += [f"| {k} | {n} | {m:.0f} | {p} |" for k, (p, n, m) in sorted(fp.items(), key=lambda kv: -kv[1][0])]
    else:
        L += ["Amostra de views ainda pequena para definir foco (minimo 5 videos com 20h+)."]
    (config.STATE_DIR / "supervisor.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    (config.STATE_DIR / "foco.json").write_text(json.dumps(
        {"atualizado": agora, "tema_peso": {k: v[0] for k, v in tp.items()}, "formato_peso": {k: v[0] for k, v in fp.items()},
         "alertas": alertas, "tarefas": list(dict.fromkeys(tarefas))}, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\n".join(L))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as exc:
        print(f"[supervisor] falhou sem derrubar nada: {str(exc)[:200]}")

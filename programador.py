#!/usr/bin/env python3
"""Programador do dia: roda de madrugada (depois que a cota do YouTube zera, ~02h BRT), escolhe TODOS os videos do
dia e os horarios, e o workflow programar_dia.yml renderiza e sobe cada um como AGENDADO (privado + publishAt).

- 4 Shorts: rodizio 3x 2D + 1x 3D (o 3D e o 2o do dia). Um Short sempre cai no TRAJETO DA MANHA (07h, pedido do
  Andre: o pessoal indo pro trabalho/faculdade vendo celular); os outros nos melhores horarios aprendidos (horarios.py).
- 1 longo (fila de longos revisados), no horario do longo (noite no dia util, fim de manha no fim de semana).
- state/agenda.json guarda o plano do dia. Como os videos agendados ja entram em publicados.json com a hora marcada,
  o agendador de hora em hora (meta_dia.py) e o longo_diario.py veem o dia "cheio" e nao publicam nada a mais.

Uso:  python programador.py            -> planeja o dia (BRT de agora), grava state/agenda.json e as saidas do workflow
      python programador.py 2026-11-25 -> so mostra o plano de outra data (nao grava)
"""
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone

import config

BRT = timezone(timedelta(hours=-3))
AGENDA = config.STATE_DIR / "agenda.json"
PUB = config.STATE_DIR / "publicados.json"
MANHA = (7, 0)                  # o Short do trajeto da manha
MINUTOS = [0, 10, 5, 15]        # pequenos deslocamentos (evita bater na hora cheia de todo mundo)
ORDEM_MOTOR = ["2d", "3d", "2d", "2d"]
MIN_ANTECEDENCIA = timedelta(minutes=50)   # o YouTube exige publishAt no futuro; damos folga pro render


def _ler(p, d):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return d


def horas_do_dia(d: date, qtd: int = 4) -> list:
    """[(h, m)]: 07h00 fixo (trajeto) + as melhores horas aprendidas a partir das 11h, com 2h+ de espaco."""
    ranking = []
    try:
        import horarios
        tab = horarios.tabela(d, horarios.observacoes(horarios._ler(horarios.STATE / "videos.json", []),
                                                      horarios._ler(horarios.STATE / "views.json", {}),
                                                      horarios._ler(horarios.STATE / "pesos.json", {})))
        ranking = sorted((h for h in tab if h >= 11), key=lambda h: (round(tab[h]["ucb"], 3), -((h * 7 + d.toordinal()) % 5)), reverse=True)
    except Exception as exc:
        print(f"[programador] horarios.py falhou ({str(exc)[:80]}): usando 12h/18h/20h")
    escolhidas = [MANHA[0]]
    for h in ranking + [12, 18, 20, 22, 15]:
        if len(escolhidas) == qtd:
            break
        if all(abs(h - x) >= 2 for x in escolhidas):
            escolhidas.append(h)
    escolhidas = sorted(escolhidas)[:qtd]
    return [(h, MANHA[1] if h == MANHA[0] else MINUTOS[i % len(MINUTOS)]) for i, h in enumerate(escolhidas)]


def _fila_valida():
    import coerencia
    import publish
    ok = []
    for c in publish.pendentes():
        r = coerencia.validar(c)
        if r["erros"]:
            print(f"[programador] {c['id']} bloqueado pela coerencia (fica na fila): {r['erros'][0]}")
            continue
        ok.append(c)
    try:
        import diversidade
        ok = diversidade.diversificar(ok)
    except Exception:
        pass
    return ok


def planejar(d: date, gravar: bool = True) -> dict:
    import publish
    agora = datetime.now(timezone.utc)
    ag = _ler(AGENDA, {})
    if ag.get("data") != d.isoformat():
        ag = {"data": d.isoformat(), "shorts": [], "longo": None}
    pubs = {x["id"]: x for x in _ler(PUB, [])}
    horas = horas_do_dia(d)
    fila = _fila_valida()
    usados = {s["id"] for s in ag["shorts"]}
    novos = []
    for i, (h, m) in enumerate(horas):
        quando = datetime(d.year, d.month, d.day, h, m, tzinfo=BRT)
        ja = next((s for s in ag["shorts"] if s.get("slot") == i), None)
        if ja and ja["id"] in pubs:
            continue                       # ja renderizado e agendado
        if quando.astimezone(timezone.utc) < agora + MIN_ANTECEDENCIA:
            print(f"[programador] slot {h:02d}h{m:02d} ja esta perto/passou - fica pro agendador normal")
            continue
        quer = ORDEM_MOTOR[i % len(ORDEM_MOTOR)]
        livres = [c for c in fila if c["id"] not in usados and c["id"] not in pubs]
        escolha = next((c for c in livres if publish._motor(c) == quer), None) or (livres[0] if livres else None)
        if not escolha:
            print(f"[programador] sem roteiro para o slot {h:02d}h{m:02d} (fila vazia)")
            continue
        usados.add(escolha["id"])
        item = {"slot": i, "id": escolha["id"], "motor": publish._motor(escolha),
                "publicar_em": quando.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}
        ag["shorts"] = [s for s in ag["shorts"] if s.get("slot") != i] + [item]
        novos.append(item)
    # longo
    if not ag.get("longo") or ag["longo"]["id"] not in pubs:
        try:
            import horarios
            hl = horarios.horario_longo(d)
        except Exception:
            hl = 19
        hl_m = 30
        if any(h == hl for h, _ in horas):
            hl_m = 50
        quando = datetime(d.year, d.month, d.day, hl, hl_m, tzinfo=BRT)
        lid = ""
        if quando.astimezone(timezone.utc) > agora + timedelta(minutes=70):
            try:
                import longo_diario
                lid = longo_diario.escolher()
            except Exception as exc:
                print(f"[programador] escolha do longo falhou: {str(exc)[:120]}")
        ag["longo"] = {"id": lid, "publicar_em": quando.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")} if lid else ag.get("longo")
    ag["shorts"].sort(key=lambda s: s["publicar_em"])
    ag["gerado_em"] = agora.isoformat(timespec="seconds")
    if gravar:
        AGENDA.write_text(json.dumps(ag, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[programador] agenda de {d:%d/%m}:")
    for s in ag["shorts"]:
        t = datetime.fromisoformat(s["publicar_em"]).astimezone(BRT)
        print(f"   {t:%H:%M}  {s['motor'].upper()}  {s['id']}{'  (novo)' if s in novos else ''}")
    if ag.get("longo"):
        t = datetime.fromisoformat(ag["longo"]["publicar_em"]).astimezone(BRT)
        print(f"   {t:%H:%M}  LONGO {ag['longo']['id']}")
    return {"agenda": ag, "novos": novos}


def publicar_em_de(id_: str):
    """Hora agendada (ISO UTC) de um video na agenda de hoje, se ainda estiver no futuro."""
    ag = _ler(AGENDA, {})
    itens = list(ag.get("shorts") or []) + ([ag["longo"]] if ag.get("longo") else [])
    for s in itens:
        if s and s.get("id") == id_:
            t = datetime.fromisoformat(s["publicar_em"])
            if t > datetime.now(timezone.utc) + timedelta(minutes=15):
                return s["publicar_em"]
    return None


def main(argv):
    if argv and argv[0][:2] == "20":
        planejar(date.fromisoformat(argv[0]), gravar=False)
        return 0
    d = datetime.now(BRT).date()
    r = planejar(d, gravar=True)
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a") as f:
            f.write(f"shorts={json.dumps([{'id': s['id'], 'quando': s['publicar_em']} for s in r['novos']])}\n")
            f.write(f"tem_shorts={'true' if r['novos'] else 'false'}\n")
            lg = r["agenda"].get("longo") or {}
            f.write(f"longo={lg.get('id', '') if lg.get('id') and lg['id'] not in {x['id'] for x in _ler(PUB, [])} else ''}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

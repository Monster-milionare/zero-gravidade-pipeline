// ================================================================ DIRETOR 3D
// Mesmo protocolo do motor 2D: shots com ALVO de camera (ponto do cenario, personagem ou entidade) e movimento
// (corte/pan/chicote/zoom/recua/segue/tremor), POV de verdade (a camera e o olho do protagonista, virando a cabeca),
// maos fazendo coisas (sino, telefone, apontar), personagens que olham/apontam/levam susto/andam, e entidades com
// trajetoria (iceberg...). Carregado depois de polir.js; substitui window.frame.
var ENTS3D = window.ENTS3D || (window.ENTS3D = {});
let TL = {eventos: [], acoes: [], pov: false};
window.setTimeline = tl => { TL = Object.assign({eventos: [], acoes: [], pov: false}, tl || {}); for (const k in _fim3) delete _fim3[k]; };
const _setShotsBase = window.setShots;
window.setShots = s => { _setShotsBase(s); for (const k in _fim3) delete _fim3[k]; };
const _fim3 = {};
const _v = (x, y, z) => new THREE.Vector3(x, y, z);
const entObjs = {};

function mundo(a, p) { return _v(p[0] + a.g.position.x, p[1], p[2]); }
function pontoLocal(a, nome) { const P = a.pontos || {}; return P[nome] ? P[nome].pos : null; }

function entEstado3d(a, nome, t) {
  let ev = null;
  for (const e of TL.eventos) if (e.ent === nome && (!e.amb || e.amb === a.nome) && e.t0 <= t) { if (!ev || e.t0 >= ev.t0) ev = e; }
  if (!ev) return null;
  const u = Math.min(1, Math.max(0, (t - ev.t0) / Math.max(0.05, ev.t1 - ev.t0)));
  if ((ev.faz === 'some' || ev.para === 'fora') && u >= 1) return null;
  const de = pontoLocal(a, ev.de || ev.para), pa = pontoLocal(a, ev.para || ev.de);
  if (!de || !pa) return null;
  const k = ev.faz === 'pousa' ? 1 - Math.pow(1 - u, 2.2) : (ev.faz === 'passa' || ev.faz === 'surge') ? u : ease(u);
  const p = V(de, pa, k);
  if (ev.faz === 'voa') p[1] += Math.sin(Math.PI * u) * 6;
  return {pos: mundo(a, p), u, faz: ev.faz, ev, dir: _v(pa[0] - de[0], 0, pa[2] - de[2])};
}
function entObj(a, nome) {
  const key = a.nome + '|' + nome;
  if (!entObjs[key] && ENTS3D[nome]) { const o = ENTS3D[nome].build(a); o.visible = false; scene.add(o); entObjs[key] = o; }
  return entObjs[key];
}

function idsDe(a) {
  const m = {};
  for (const c of a.chars) m[c.userData.id] = c;
  return m;
}
function cabecaW(c) { const p = new THREE.Vector3(); c.updateMatrixWorld(true); c.userData.cab.getWorldPosition(p); return p; }
function olho(a) {
  if (a.pov) return mundo(a, a.pov.pos);
  const P = a.P || [0, 2]; return mundo(a, [P[0], (a.chaoY || 0) + 1.8, P[1]]);
}

function alvoW(a, alvo, t) {
  const P = a.pontos || {};
  if (P[alvo]) return mundo(a, P[alvo].pos);
  const ids = idsDe(a);
  if (ids[alvo]) return cabecaW(ids[alvo]);
  if (ENTS3D[alvo]) { const st = entEstado3d(a, alvo, t); if (st) return st.pos.clone().add(_v(0, 4, 0)); }
  if (alvo === 'grupo') {
    const cs = a.chars.filter(c => !c.userData.prot);
    if (cs.length) { const s = _v(0, 0, 0); cs.forEach(c => s.add(cabecaW(c))); return s.multiplyScalar(1 / cs.length); }
  }
  return null;
}

function camDe(i, t) {
  const s = shots[i], a = amb[s.amb];
  const dur = Math.max(0.05, s.t1 - s.t0), u = Math.min(1, Math.max(0, (t - s.t0) / dur));
  const L = alvoW(a, s.cam, s.mov === 'segue' ? t - 0.1 : t);
  let pos, look, fov;
  if (!L) {
    const f = a.cams[s.cam] || a.cams.ampla || Object.values(a.cams)[0];
    const cs = f(u);
    pos = _v(cs.pos[0] + a.g.position.x, cs.pos[1], cs.pos[2]); look = _v(cs.look[0] + a.g.position.x, cs.look[1], cs.look[2]);
    return {pos, look, fov: (cs.fov || 60) / (s.zoom || 1), maos: cs.maos, tremor: cs.tremor === undefined ? (s.tremor ? s.tremor * 0.06 : 0.012) : cs.tremor};
  }
  const P = a.pontos || {}, ids = idsDe(a);
  if (s.pov) { pos = olho(a); look = L; fov = 62;
    if (ids[s.cam]) { const d = L.clone().sub(pos); d.y = 0; d.normalize(); pos = pos.clone().sub(d.multiplyScalar(0.4)).add(_v(0, 0.08, 0)); look = L.clone().add(_v(0, -0.3, 0)); fov = 66; } }
  else if (P[s.cam] && P[s.cam].cam) { pos = mundo(a, P[s.cam].cam); look = L; fov = 48; }
  else if (ENTS3D[s.cam] && a.camExterna) { pos = mundo(a, a.camExterna); look = L.clone().add(_v(0, -3, 0)); fov = 46; }
  else if (ids[s.cam]) {
    const c = ids[s.cam], ry = c.rotation.y, f = _v(Math.sin(ry), 0, Math.cos(ry)), side = _v(f.z, 0, -f.x);
    pos = L.clone().add(f.multiplyScalar(2.3)).add(side.multiplyScalar(0.45)).add(_v(0, 0.12, 0)); look = L.clone(); fov = 46;
  } else {
    const e = olho(a), d = L.clone().sub(e).normalize(), side = _v(d.z, 0, -d.x);
    pos = e.clone().sub(d.clone().multiplyScalar(2.4)).add(side.multiplyScalar(0.9)).add(_v(0, 0.6, 0)); look = L; fov = 52;
  }
  fov /= (s.zoom || 1);
  const mov = s.mov || 'corte';
  if (mov === 'pan' || mov === 'chicote') {
    let B = null;
    if (i > 0 && shots[i - 1].amb === s.amb) { if (!_fim3[i - 1]) _fim3[i - 1] = camDe(i - 1, shots[i - 1].t1 - 0.001); B = _fim3[i - 1]; }
    if (B) {
      const tp = mov === 'chicote' ? 0.26 : Math.min(1.2, dur * 0.6), k = ease(Math.min(1, (t - s.t0) / tp));
      const dA = B.look.clone().sub(B.pos).normalize(), dB = look.clone().sub(pos).normalize();
      const dist = lerp(B.look.distanceTo(B.pos), look.distanceTo(pos), k);
      pos = B.pos.clone().lerp(pos, k);
      const d = dA.lerp(dB, k).normalize();
      look = pos.clone().add(d.multiplyScalar(dist));
      fov = lerp(B.fov, fov, k);
    }
  } else if (mov === 'zoom') fov *= lerp(1.12, 0.92, ease(u));
  else if (mov === 'recua') fov *= lerp(0.82, 1.08, ease(u));
  else if (mov === 'corte') fov *= lerp(1.0, 0.96, u);
  else if (mov === 'caminha') {   // voce anda (1a pessoa): a camera avanca na direcao do alvo, com o balanco do passo
    const d = look.clone().sub(pos); d.y = 0; const dist = d.length(); d.normalize();
    pos = pos.clone().add(d.multiplyScalar(Math.min(3.2, dist * 0.55) * ease(u))).add(_v(0, Math.abs(Math.sin(t * 7.5)) * 0.06 - 0.03, 0));
    look = look.clone().add(_v(Math.sin(t * 3.75) * 0.08, 0, 0));
  }
  return {pos, look, fov, tremor: (mov === 'tremor' || s.tremor) ? (s.tremor || 1) * 0.06 * Math.max(0.2, 1 - u) : (s.pov ? 0.006 : 0.01)};
}

// ------------------------------------------------ gestos dos personagens
function acoesDe(id, t, prot) { return TL.acoes.filter(x => (x.quem === id || (x.quem === 'todos' && !(TL.pov && prot))) && x.t0 <= t); }
function olharPara(c, T) {
  const d = c.userData; c.updateMatrixWorld(true);
  const loc = c.worldToLocal(T.clone());
  const esc = c.scale.y || 1;
  const yaw = Math.max(-1.15, Math.min(1.15, Math.atan2(loc.x, loc.z)));
  const pit = Math.max(-0.6, Math.min(0.7, -Math.atan2(loc.y - 1.72 * esc, Math.hypot(loc.x, loc.z))));
  d.cab.rotation.y = yaw; d.cab.rotation.x = pit;
  return [yaw, pit];
}

// ------------------------------------------------ maos em 1a pessoa: poses animadas novas
const propFone = new THREE.Group(); { mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 8), M(0x111111), 0, 0, 0, propFone); mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.07, 10), M(0x111111), 0, 0.15, 0, propFone); mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.07, 10), M(0x111111), 0, -0.15, 0, propFone); propFone.visible = false; maosG.add(propFone); }
let _maosCor = null;
function corMaos(spec) {
  const chave = JSON.stringify(spec || {}); if (_maosCor === chave) return; _maosCor = chave;
  if (!spec) return;
  for (const m of [mE, mD]) m.traverse(o => {
    if (!o.isMesh) return; const c = o.userData.c0 !== undefined ? o.userData.c0 : (o.userData.c0 = o.material.color.getHex());
    o.material = o.material.clone();
    if (c === 0x6a3c1c) o.material.color.setHex(spec.mao || 0xf0c8a0);
    else if (c === 0x7a1f2e) o.material.color.setHex(spec.manga || 0x1d2536);
    else if (c === 0xd9b24a || c === 0xf6f1e6) o.material.color.setHex(spec.punho || spec.manga || 0x1d2536);
    else if (c === 0xff2a3a) o.visible = false;
    if (o.geometry && o.geometry.type === 'TorusGeometry') o.visible = false;
  });
}
function poseMaos(tipo, t, s, camPos, camLook) {
  const bob = Math.sin(t * 3.3) * 0.012;
  const st = (e, d, curl, prop) => ({e, d, curl, prop});
  const u = t - s.t0;
  if (tipo === 'sino') {   // puxa a cordinha do sino 3 vezes (mao direita no alto, esquerda segurando a borda)
    const puxa = Math.max(0, Math.sin(u * Math.PI / 0.6 * 2)) ** 2 * 0.14;
    return st([-0.42, -0.62, -0.95, 0.25], [0.03, -0.1 - puxa, -0.9, -0.05], 1.15);
  }
  if (tipo === 'telefone') return st([-0.3, -0.3, -0.62, 0.7], [0.4, -0.62, -0.95, -0.2], 1.0, [propFone, -0.26, -0.18, -0.58]);
  if (tipo === 'aponta') return st([-0.42, -0.64, -0.95, 0.2], [0.22, -0.3 + bob, -0.98, -0.35], 0.12);
  if (tipo === 'segura' || tipo === 'neutro') return st([-0.4, -0.62, -0.92, 0.2], [0.4, -0.62, -0.92, -0.2], 0.9);
  return null;
}

// ------------------------------------------------ quadro
window.frame = function (t, amp, fmt) {
  let si = shots.length - 1;
  for (let i = 0; i < shots.length; i++) if (t >= shots[i].t0 && t < shots[i].t1) { si = i; break; }
  const s = shots[si], a = amb[s.amb];
  aplicarHora(a, s.hora); if (ativo !== s.amb) entrar(s.amb);
  a.ponto.intensity = a.pontoBase;
  for (const f of a.anim) f(t);
  a.ponto.intensity *= a.pontoMult;

  // entidades deste cenario
  for (const key in entObjs) entObjs[key].visible = false;
  for (const nome of Object.keys(ENTS3D)) {
    const st = entEstado3d(a, nome, t); if (!st) continue;
    const o = entObj(a, nome); if (!o) continue;
    o.visible = true; o.position.copy(st.pos); if (ENTS3D[nome].update) ENTS3D[nome].update(o, st, t);
  }
  if (a.esconderComEntidade) for (const [nome, objs] of Object.entries(a.esconderComEntidade)) { const tem = TL.eventos.some(e => e.ent === nome); objs.forEach(o => { o.visible = !tem; }); }

  // personagens: posicao (caminhadas), olhar, gestos, boca
  const ids = idsDe(a);
  for (const c of a.chars) {
    const d = c.userData;
    if (d.p0 === undefined) d.p0 = c.position.clone(), d.ry0 = c.rotation.y;
    c.position.copy(d.p0); c.rotation.y = d.ry0;
    // entrada progressiva (TL.presenca): ausente = invisivel; quem chega vem andando de lado
    d._ausente = false; d._chegada = 1;
    if (!d.prot && TL.presenca) {
      const it = (TL.presenca[d.id] || []).find(i => i[2] === s.amb && i[0] <= t && t < i[1]);
      if (!it) d._ausente = true;
      else if (it[3]) {
        d._chegada = Math.min(1, Math.max(0, (t - it[0]) / 1.1));
        if (d._chegada < 1) { const lado = d.p0.x < 0 ? -1 : 1, k = ease(d._chegada); c.position.x += lado * (1 - k) * 4.5; c.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2; }
      }
    }
    for (const ac of acoesDe(d.id, t, d.prot)) {
      if (!['anda', 'corre'].includes(ac.faz)) continue;
      const alvo = pontoLocal(a, ac.para); if (!alvo) continue;
      const k = ease(Math.min(1, (t - ac.t0) / Math.max(0.1, ac.t1 - ac.t0)));
      const dest = _v(alvo[0], c.position.y, alvo[2]);
      if (k < 1) c.rotation.y = Math.atan2(dest.x - c.position.x, dest.z - c.position.z);
      c.position.lerp(dest, k);
    }
    if (window.humorPos) window.humorPos(c, a, t, acoesDe(d.id, t, d.prot));   // NFI:pos
  }
  const camAt = camDe(si, t);
  const sh = camAt.tremor;
  cam.position.copy(camAt.pos).add(_v(Math.sin(t * 21) * sh, Math.sin(t * 17.3) * sh + (s.pov ? Math.sin(t * 2.1) * 0.012 : 0), Math.cos(t * 19.7) * sh));
  cam.fov = camAt.fov; cam.updateProjectionMatrix();
  cam.lookAt(camAt.look.x + Math.sin(t * 1.3) * (s.pov ? 0.05 : 0.02), camAt.look.y + Math.sin(t * 1.7) * (s.pov ? 0.04 : 0.015), camAt.look.z);

  const falante = s.falante || '';
  for (const c of a.chars) {
    const d = c.userData, fala = (falante === d.id) || (d.prot && falante === 'prot');
    c.visible = d.prot ? !(s.pov || TL.pov && !String(s.cam).startsWith('eu-')) : !d._ausente;
    const bob = Math.sin(t * 2.2 + d.fase);
    let y = d.base + (fala ? Math.abs(Math.sin(t * 6 + d.fase)) * 0.03 : 0);
    if (d._chegada < 1) y += Math.abs(Math.sin(t * 9)) * 0.08;
    c.rotation.z = Math.sin(t * 1.7 + d.fase) * 0.025;
    // olhar padrao: quem fala olha pra camera (voce); os outros olham quem fala
    let alvoOlhar = null;
    if (fala || s.pov) alvoOlhar = cam.position.clone();
    else if (falante && ids[falante] && falante !== d.id) alvoOlhar = cabecaW(ids[falante]);
    else if (falante === 'prot' || TL.pov) alvoOlhar = olho(a);
    if (alvoOlhar) olharPara(c, alvoOlhar); else { d.cab.rotation.x = 0.04 + bob * 0.02; d.cab.rotation.y = Math.sin(t * 0.9 + d.fase) * 0.18; }
    if (fala) { d.cab.rotation.x += Math.sin(t * 5) * 0.03; d.cab.rotation.y += Math.sin(t * 2.4 + d.fase) * 0.06; }
    let bE = 0.25 + (fala ? Math.sin(t * 4.5) * 0.35 + 0.2 : bob * 0.05), bD = -0.25 - (fala ? Math.sin(t * 4.0 + 1) * 0.3 + 0.2 : bob * 0.05), bDx = 0, bEx = 0;
    for (const ac of acoesDe(d.id, t, d.prot).filter(x => t < x.t1)) {
      const T = alvoW(a, ac.para, t) || (ac.para === 'camera' || ac.para === 'voce' ? cam.position.clone() : null);
      const u = Math.min(1, (t - ac.t0) / Math.max(0.1, ac.t1 - ac.t0));
      if (T && ['olha', 'aponta', 'susto', 'abaixa'].includes(ac.faz)) { const [yaw, pit] = olharPara(c, T);
        if (ac.faz === 'aponta') { const k = ease(Math.min(1, u * 4)); c.rotation.y += yaw * 0.5 * k; bD = lerp(bD, -0.15, k); bDx = lerp(0, -(Math.PI / 2 - pit * 1.2), k); } }
      if (ac.faz === 'susto') { const k = Math.min(1, (t - ac.t0) / 0.15) * Math.min(1, (ac.t1 - t) / 0.4); y += Math.max(0, Math.sin(Math.PI * Math.min(1, (t - ac.t0) / 0.45))) * 0.35; bE = lerp(bE, -2.6, k); bD = lerp(bD, 2.6, k); }
      if (ac.faz === 'abaixa') { const k = ease(Math.min(1, u * 3)); c.scale.y = (c.userData.esc0 || (c.userData.esc0 = c.scale.x)) * (1 - 0.15 * k); }
      if (ac.faz === 'comemora') { bE = -2.7 + Math.sin(t * 9) * 0.2; bD = 2.7 - Math.sin(t * 9) * 0.2; y += Math.abs(Math.sin((t - ac.t0) * 7)) * 0.2; }
      if (ac.faz === 'anda' || ac.faz === 'corre') { y += Math.abs(Math.sin((t - ac.t0) * (ac.faz === 'corre' ? 14 : 8))) * 0.08; bE = 0.25 + Math.sin((t - ac.t0) * 8) * 0.5; bD = -0.25 + Math.sin((t - ac.t0) * 8) * 0.5; }
    }
    if (window.humorPose) { const hp = window.humorPose(c, a, t, acoesDe(d.id, t, d.prot), {y, bE, bD}); y = hp.y; bE = hp.bE; bD = hp.bD; }   // NFI:pose
    else if (!acoesDe(d.id, t, d.prot).some(x => x.faz === 'abaixa' && t < x.t1) && c.userData.esc0) c.scale.y = c.userData.esc0;
    c.position.y = y;
    const abre = fala ? Math.min(0.7, amp * 0.9) : 0.0;
    d.boca.scale.set(1.2 - abre * 0.35, 0.2 + abre * 1.0, 0.5);
    const piscar = (Math.sin(t * 1.3 + d.fase * 3) > 0.985) ? 0.1 : 1;
    for (const e of d.olhos) e.scale.y = piscar;
    d.bracos[0].rotation.set(bEx, 0, bE); d.bracos[1].rotation.set(bDx, 0, bD);
  }

  // sino balancando quando tocado; fone fora do gancho quando em uso
  if (a.sino) { const tocando = s.maos === 'sino'; const u = t - s.t0; a.sino.g.rotation.z = tocando ? Math.sin(u * Math.PI / 0.3) * 0.35 * Math.max(0, Math.sin(u * Math.PI / 0.6)) : Math.sin(t * 0.7) * 0.02; }
  if (a.telefone) a.telefone.fone.visible = !(s.pov && s.maos === 'telefone');

  // maos em 1a pessoa
  let pose = s.pov && s.maos ? (poseMaos(s.maos, t, s, cam.position, camAt.look) || POSES[s.maos]) : (camAt.maos ? POSES[camAt.maos] : null);
  maosG.visible = !!pose;
  if (pose) {
    corMaos(TL.maosCor || null);
    maosG.position.copy(cam.position); maosG.quaternion.copy(cam.quaternion);
    const bob = Math.sin(t * 3.3) * 0.012;
    // mantem as maos dentro do quadro vertical (o campo horizontal do 9:16 e estreito)
    const kv = Math.tan(cam.fov * Math.PI / 360), kh = kv * cam.aspect;
    const caber = q => { const z = Math.abs(q[2]); return [Math.max(-0.78 * kh * z, Math.min(0.78 * kh * z, q[0])), Math.max(-0.92 * kv * z, q[1]), q[2], q[3]]; };
    const pe = caber(pose.e), pd = caber(pose.d);
    mE.scale.setScalar(0.78); mD.scale.setScalar(0.78);
    mE.position.set(pe[0], pe[1] + bob, pe[2] - 0.08); mE.rotation.set(0, pe[3], 0);
    mD.position.set(pd[0], pd[1] + bob, pd[2] - 0.08); mD.rotation.set(0, pd[3], 0);
    for (const l of [-1, 1]) luvas[l].dedos.forEach((dd, i) => { dd.rotation.x = -pose.curl * (0.85 + i * 0.05) + Math.sin(t * 2 + i) * 0.03; });
    for (const p of [propLuneta, propLanterna, propBussola, propFone]) p.visible = false;
    if (pose.prop) { const p = pose.prop[0]; p.visible = true; const q = caber([pose.prop[1], pose.prop[2], pose.prop[3], 0]); p.position.set(q[0] + 0.03, q[1] + 0.08 + bob, q[2]); p.rotation.set(0.2, 0, 0.25); }
  }
  window.posRender(t);
  return fmt === 'png' ? renderer.domElement.toDataURL('image/png') : renderer.domElement.toDataURL('image/jpeg', 0.93);
};

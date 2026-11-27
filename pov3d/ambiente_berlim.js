// Cenario MURO (Berlim, 9 de novembro de 1989) + chapeus/papeis da epoca.
// Carregado depois de ambiente_vapor.js e antes de polir.js.

// ---- chapeus novos: quepe (guarda), gorro de la, boina; fuzil no ombro do guarda
(function () {
  const _ce = window.chapeuExtra;
  window.chapeuExtra = function (o, cab, g) {
    _ce(o, cab, g);
    const h = o.chapeu;
    if (h === 'quepe') {
      const cor = o.corChapeu || 0x5a6250;
      mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.24, 18), M(cor), 0, 0.4, 0, cab);
      mesh(new THREE.CylinderGeometry(0.6, 0.5, 0.1, 18), M(cor), 0, 0.55, 0, cab).scale.set(1, 1, 0.92);
      mesh(new THREE.CylinderGeometry(0.565, 0.565, 0.09, 18), M(0x15151a), 0, 0.3, 0, cab);
      mesh(new THREE.BoxGeometry(0.62, 0.04, 0.34), B(0x0c0c10), 0, 0.3, 0.55, cab);
      mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 10), M(0xe8c14a), 0, 0.46, 0.55, cab).rotation.x = Math.PI / 2;
    }
    if (h === 'gorro') {
      const cor = o.corChapeu || 0xc8281e;
      mesh(new THREE.SphereGeometry(0.58, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), M(cor), 0, 0.06, 0, cab);
      const dobra = mesh(new THREE.TorusGeometry(0.52, 0.09, 8, 20), M(cor), 0, 0.12, 0, cab); dobra.rotation.x = Math.PI / 2;
      mesh(new THREE.SphereGeometry(0.13, 10, 8), M(0xf2f2f2), 0, 0.64, 0, cab);
    }
    if (h === 'boina') {
      const cor = o.corChapeu || 0x2a2a30;
      mesh(new THREE.CylinderGeometry(0.62, 0.55, 0.16, 18), M(cor), 0.04, 0.4, 0, cab);
      mesh(new THREE.BoxGeometry(0.5, 0.04, 0.26), M(cor), 0, 0.32, 0.54, cab);
    }
    if (o.fuzil) {
      const f = new THREE.Group();
      mesh(new THREE.BoxGeometry(0.09, 0.09, 1.1), M(0x20202a), 0, 0, 0, f);
      mesh(new THREE.BoxGeometry(0.1, 0.16, 0.3), M(0x6a4a2a), 0, -0.05, 0.45, f);
      f.position.set(0.18, 0.95, -0.52); f.rotation.set(0.12, 0.25, 1.35); g.add(f);
    }
    if (o.cachecol) {
      const t = mesh(new THREE.TorusGeometry(0.43, 0.11, 8, 18), M(o.cachecol), 0, 1.32, 0, g); t.rotation.x = Math.PI / 2;
      mesh(new THREE.BoxGeometry(0.16, 0.5, 0.06), M(o.cachecol), 0.18, 1.05, 0.42, g);
    }
  };
})();

Object.assign(PAPEIS, {
  'oficial-ddr':   {roupa: 0x78806c, pele: 0xe3b48a, chapeu: 'quepe', corChapeu: 0x69725c, cinto: 0x15151a, botoes: 0xd9b24a, gola: false, bigode: 0x3a2a1a, punho: 0x15151a},
  'guarda-ddr':    {roupa: 0x6a7060, pele: 0xf2c8a0, chapeu: 'quepe', corChapeu: 0x5a6250, cinto: 0x15151a, botoes: 0xd9b24a, fuzil: true, bota: 0x15151a},
  'cidadao-berlim':  {roupa: 0x35588a, pele: 0xe3b48a, chapeu: 'gorro', corChapeu: 0xc8281e, cabelo: 0x4a2f1c, cinto: 0x2a2a30, cachecol: 0xe8d8a0},
  'cidada-berlim':   {roupa: 0x8a3a52, pele: 0xf2c8a0, vestido: true, chapeu: 'gorro', corChapeu: 0xe8b830, cabelo: 0x6a3a1a, cinto: 0xf6f1e6, cachecol: 0x2f6f9a},
  'cidadao-berlim2': {roupa: 0x6e5236, pele: 0xd9a77c, chapeu: 'boina', corChapeu: 0x2a2a30, cinto: 0x2a1a10, cachecol: 0x9a2a2a},
  'cidada-berlim2':  {roupa: 0x3a6a5a, pele: 0xe3b48a, vestido: true, cabelo: 0xc89a5a, cinto: 0xe8d8a0, cachecol: 0xf2f2f2},
  'jornalista':      {roupa: 0xa89468, pele: 0xe3b48a, chapeu: 'bone', corChapeu: 0x3a3a46, cinto: 0x5b3a20, gola: true, punho: 0xf6f1e6},
  'idoso-berlim':    {roupa: 0x5a5a64, pele: 0xf2c8a0, chapeu: 'boina', corChapeu: 0x7a7a84, barba: 0xe8e8ee, cinto: 0x2a2a30, cachecol: 0x3a5a3a},
});

function texGrafite(sem) {
  return canvasTex(512, 480, (g, w, h) => {
    g.fillStyle = '#b8b5ac'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(90,88,82,${rnd() * 0.07})`; g.fillRect(rnd() * w, rnd() * h, 8, 8); }
    const cores = ['#e8352f', '#2f6fd8', '#f2c230', '#2fb86a', '#f26ab0', '#ffffff', '#1a1a22', '#ff8a2a', '#8a4ad8'];
    for (let i = 0; i < 9; i++) { g.fillStyle = cores[(rnd() * cores.length) | 0]; const x = rnd() * w, y = rnd() * h, r = 24 + rnd() * 70; g.globalAlpha = 0.85;
      if (i % 3 === 0) { g.beginPath(); g.ellipse(x, y, r, r * 0.6, rnd() * 3, 0, 7); g.fill(); } else if (i % 3 === 1) g.fillRect(x - r, y - r * 0.5, r * 2, r); else { g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.8, y + r * 0.7); g.lineTo(x - r * 0.8, y + r * 0.7); g.closePath(); g.fill(); } }
    g.globalAlpha = 1; g.lineJoin = 'round';
    const frases = sem === 0 ? ['LIBERDADE', 'FREI'] : sem === 1 ? ['MAUER', 'WEG!'] : ['PAZ', 'LIVRE'];
    frases.forEach((t, i) => { g.font = `bold ${92 - i * 14}px sans-serif`; g.lineWidth = 12; g.strokeStyle = '#111'; g.strokeText(t, 24 + i * 40, 150 + i * 150); g.fillStyle = i ? '#f2c230' : '#ffffff'; g.fillText(t, 24 + i * 40, 150 + i * 150); });
    g.strokeStyle = '#e8352f'; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 440); g.bezierCurveTo(160, 340, 300, 470, 480, 380); g.stroke();
    g.fillStyle = '#e8352f'; g.beginPath(); g.moveTo(400, 60); g.bezierCurveTo(360, 20, 330, 80, 400, 120); g.bezierCurveTo(470, 80, 440, 20, 400, 60); g.fill();
  });
}
function texPredio() {
  const t = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#6a6a70'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { const luz = rnd() < 0.38; g.fillStyle = luz ? (rnd() < 0.7 ? '#ffd27a' : '#cfe8ff') : '#23232c'; g.fillRect(8 + x * 30, 10 + y * 31, 20, 22); }
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < 16; y++) g.fillRect(0, 36 + y * 31, w, 3);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
}
function texCartaz(txt, bg, fg) {
  return canvasTex(256, 192, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = fg; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; const ls = txt.split('|'); ls.forEach((t, i) => g.fillText(t, w / 2, h / 2 + 18 + (i - (ls.length - 1) / 2) * 56)); });
}
const CARTAZES = [texCartaz('ABRAM|O PORTÃO', '#f2f2f2', '#c8281e'), texCartaz('LIBER-|DADE', '#f2c230', '#1a1a22'), texCartaz('SOMOS|UM POVO', '#c8281e', '#ffffff'), texCartaz('MUROS|CAEM', '#2f6fd8', '#ffffff')];
const texBandeiraDDR = canvasTex(256, 160, (g, w, h) => {
  g.fillStyle = '#111'; g.fillRect(0, 0, w, h / 3); g.fillStyle = '#cc1a1a'; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = '#f2c230'; g.fillRect(0, 2 * h / 3, w, h / 3 + 1);
  g.strokeStyle = '#f2c230'; g.lineWidth = 9; g.beginPath(); g.arc(w / 2, h / 2, 34, 0, 7); g.stroke();
  g.strokeStyle = '#111'; g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2 - 22, h / 2 + 22); g.lineTo(w / 2 + 22, h / 2 - 22); g.stroke();
  g.fillStyle = '#f2c230'; g.fillRect(w / 2 - 6, h / 2 - 30, 12, 60);
});
const texPlaca = canvasTex(512, 96, (g, w, h) => { g.fillStyle = '#1a3a6a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#fff'; g.font = 'bold 50px sans-serif'; g.textAlign = 'center'; g.fillText('GRENZÜBERGANG', w / 2, 64); });

(function () {
  const a = novoAmb('muro', {hemiCeu: 0x7f8fc8, hemiChao: 0x35302c, hemiInt: 1.75, pontoCor: 0xffd8a0, pontoInt: 20, pontoDist: 22, pontoPos: [0, 5.2, -7],
    dirCor: 0xc0ccff, dirInt: 0.95, dirPos: [-8, 14, 10], fundo: 0x0e1230, nevoa: [0x1a2040, 18, 120], ceu: [0x04061a, 0x151c42, 0x4a3a5a]});
  a.g.position.x = 4200;
  // chao: asfalto, calcada, faixas
  chao(a, 0x4c4c56, 120, 160, 0, -0.15, -30);
  mesh(new THREE.BoxGeometry(7.6, 0.04, 60), M(0x383842), 0, 0.01, -12, a.g).receiveShadow = true;
  for (let z = 10; z > -13; z -= 2.4) mesh(new THREE.BoxGeometry(0.14, 0.02, 1.2), B(0xcfcfc4), 0, 0.03, z, a.g);
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(5, 0.2, 60), M(0x6a6a70), 6.8 * s, 0.0, -12, a.g).receiveShadow = true; mesh(new THREE.BoxGeometry(0.2, 0.22, 60), M(0x9a9aa0), 4.2 * s, 0.02, -12, a.g); }
  // o MURO: segmentos de concreto com topo arredondado e grafite (lado de ca)
  const tex = [texGrafite(0), texGrafite(1), texGrafite(2)];
  let k = 0;
  for (let x = -43; x <= 43; x += 3.6) {
    if (Math.abs(x) < 1.9) continue;
    const tom = 0xb4b1a8 + ((rnd() * 8) | 0) * 0x010101;
    const seg = mesh(new THREE.BoxGeometry(3.5, 3.6, 0.5), M(tom, {emissive: 0x30302e}), x, 1.8, -14, a.g); seg.castShadow = true; seg.receiveShadow = true;
    const topo = mesh(new THREE.CylinderGeometry(0.44, 0.44, 3.5, 12), M(0xc6c3ba), x, 3.78, -14, a.g); topo.rotation.z = Math.PI / 2;
    if (rnd() < 0.75) { const p = mesh(new THREE.PlaneGeometry(3.4, 3.2), new THREE.MeshBasicMaterial({map: tex[k % 3], color: 0xc8c8d0}), x, 1.8, -13.73, a.g); k++; }
  }
  // posto de fronteira: cancela, guarita, placa, bandeira
  const canc = new THREE.Group(); canc.position.set(-1.6, 1.15, -12.6);
  for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.9, 0.16, 0.12), M(i % 2 ? 0xf2f2f2 : 0xcc1a1a), 0.45 + i * 0.9, 0, 0, canc);
  a.g.add(canc); a.anim.push(t => { canc.rotation.z = 0; });
  mesh(new THREE.CylinderGeometry(0.16, 0.2, 1.4, 10), M(0xe8e8e8), -1.6, 0.7, -12.6, a.g);
  const gua = new THREE.Group(); gua.position.set(-6.1, 0, -12.4); a.g.add(gua);
  mesh(new THREE.BoxGeometry(2.2, 2.6, 2.2), M(0x6e7568), 0, 1.3, 0, gua).castShadow = true;
  mesh(new THREE.BoxGeometry(2.5, 0.2, 2.5), M(0x4a4f46), 0, 2.7, 0, gua);
  mesh(new THREE.BoxGeometry(1.6, 0.9, 0.06), B(0xffd890), 0, 1.7, 1.12, gua); mesh(new THREE.BoxGeometry(1.7, 1.0, 0.04), M(0x222228), 0, 1.7, 1.1, gua);
  brilho(0xffc070, 4.2, 0, 1.7, 1.6, gua);
  const placa = mesh(new THREE.PlaneGeometry(4.2, 0.8), new THREE.MeshBasicMaterial({map: texPlaca}), 0, 5.2, -13.6, a.g);
  mesh(new THREE.BoxGeometry(0.1, 1.9, 0.1), M(0x3a3a42), -1.7, 4.3, -13.62, a.g); mesh(new THREE.BoxGeometry(0.1, 1.9, 0.1), M(0x3a3a42), 1.9, 4.3, -13.62, a.g);
  const mastro = mesh(new THREE.CylinderGeometry(0.06, 0.07, 6, 8), M(0xcfcfcf), 5.6, 3.0, -12.3, a.g);
  const flag = mesh(new THREE.PlaneGeometry(2.3, 1.45), new THREE.MeshBasicMaterial({map: texBandeiraDDR, side: THREE.DoubleSide}), 6.75, 5.2, -12.3, a.g);
  a.anim.push(t => { flag.rotation.y = Math.sin(t * 2.6) * 0.18; });
  // ouricos tcheco (barreira antiveiculo)
  for (const [x, z] of [[-2.4, -9.3], [2.2, -10.4], [0.2, -8.6]]) { const h = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = mesh(new THREE.BoxGeometry(0.14, 1.5, 0.14), M(0x3a3a40), 0, 0.5, 0, h); b.rotation.set(i * 0.9, i * 1.2, 0.8 - i * 0.4); } h.position.set(x, 0.2, z); a.g.add(h); }
  // torre de vigia com holofote varrendo
  const torre = new THREE.Group(); torre.position.set(14, 0, -21); a.g.add(torre);
  mesh(new THREE.CylinderGeometry(0.75, 0.95, 9.4, 12), M(0x8e8c84), 0, 4.7, 0, torre).castShadow = true;
  mesh(new THREE.BoxGeometry(3.2, 2.1, 3.2), M(0x6e7268), 0, 10.4, 0, torre); mesh(new THREE.BoxGeometry(3.6, 0.3, 3.6), M(0x4a4e46), 0, 11.6, 0, torre);
  mesh(new THREE.BoxGeometry(2.6, 0.9, 0.06), B(0xffe8a0), 0, 10.6, 1.62, torre);
  const feixe = new THREE.Group(); feixe.position.set(0, 10.2, 0); torre.add(feixe);
  const cg = new THREE.ConeGeometry(3.6, 26, 20, 1, true); cg.translate(0, -13, 0);
  const cone = new THREE.Mesh(cg, new THREE.MeshBasicMaterial({color: 0xfff0c0, transparent: true, opacity: 0.055, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide})); cone.rotation.x = 1.2; feixe.add(cone);
  brilho(0xfff0c0, 3.4, 0, 10.2, 1.5, torre);
  a.anim.push(t => { feixe.rotation.y = 1.15 + Math.sin(t * 0.55) * 0.75; });
  // postes de luz amarela e arvores sem folhas
  for (const s of [-1, 1]) for (const z of [4, -3, -9]) {
    mesh(new THREE.CylinderGeometry(0.07, 0.1, 5.4, 8), M(0x3a3a40), 4.6 * s, 2.7, z, a.g);
    mesh(new THREE.BoxGeometry(1.1, 0.08, 0.1), M(0x3a3a40), 4.2 * s, 5.35, z, a.g);
    mesh(new THREE.SphereGeometry(0.22, 8, 6), B(0xffc070), 3.7 * s, 5.2, z, a.g); brilho(0xffa648, 1.1, 3.7 * s, 5.2, z, a.g);
  }
  for (const [x, z, e] of [[-8.5, 1, 1], [9, -2, 1.1], [-9, -8, 0.9], [8.6, -9.5, 1], [-12, 6, 1.2], [12, 5, 1]]) {
    const t = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.16, 0.26, 3.4, 7), M(0x3a2e24), 0, 1.7, 0, t).castShadow = true;
    for (let i = 0; i < 5; i++) { const r = mesh(new THREE.CylinderGeometry(0.04, 0.09, 1.7, 5), M(0x3a2e24), 0, 3.2, 0, t); r.rotation.set(0.7 * Math.cos(i * 1.26), i * 1.26, 0.7 * Math.sin(i * 1.26)); r.position.y = 3.2 + 0.4 * Math.sin(i); }
    t.position.set(x, 0, z); t.scale.setScalar(e); a.g.add(t);
  }
  // predios de concreto (blocos de apartamentos com janelas acesas)
  for (const [x, z, w, h] of [[-34, -6, 14, 24], [-30, -34, 16, 30], [34, -8, 14, 22], [31, -38, 16, 28], [-8, -52, 22, 18], [18, -54, 18, 22]]) {
    const b = mesh(new THREE.BoxGeometry(w, h, 9), new THREE.MeshBasicMaterial({map: texPredio(), color: 0xb0b0c0}), x, h / 2, z, a.g);
    mesh(new THREE.BoxGeometry(w + 0.4, 0.5, 9.4), M(0x2a2a30), x, h + 0.2, z, a.g);
  }
  // Portao de Brandemburgo ao fundo, iluminado (lado oeste)
  const pg = new THREE.Group(); pg.position.set(0, 0, -78); a.g.add(pg);
  const arenito = M(0xd8c8a0, {emissive: 0x3a3018});
  mesh(new THREE.BoxGeometry(26, 0.8, 7), arenito, 0, 0.4, 0, pg);
  for (let i = 0; i < 6; i++) mesh(new THREE.CylinderGeometry(1.0, 1.1, 12, 14), arenito, -8 + i * 3.2, 6.8, 0, pg);
  mesh(new THREE.BoxGeometry(23, 2.8, 6.2), arenito, 0, 13.6, 0, pg); mesh(new THREE.BoxGeometry(19, 2.2, 5.4), arenito, 0, 16.1, 0, pg);
  mesh(new THREE.BoxGeometry(4, 2.6, 3), M(0xb89a50, {emissive: 0x2a2208}), 0, 18.5, 0, pg);
  for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.9, 1.9, 1.5), M(0xb89a50, {emissive: 0x2a2208}), -1.9 + i * 1.3, 19.6, 0, pg);
  brilho(0xffd890, 34, 0, 9, 4, pg);
  // multidao ao fundo (so decoracao, sem fala): povo de casacos coloridos olhando o portao
  const roupas = [0x35588a, 0x8a3a52, 0x6e5236, 0x3a6a5a, 0xa89468, 0x5a5a64, 0x7a3a2a, 0x2f6f9a], gorros = [0xc8281e, 0xe8b830, 0x2a2a30, 0xf2f2f2, 0x3a8a4a];
  const povo = [];
  for (let i = 0; i < 16; i++) {
    const lado = i % 2 ? 1 : -1, x = lado * (3.3 + rnd() * 6.2), z = -2.2 - rnd() * 8.5;
    const f = rnd() < 0.4;
    const c = personagem('povo' + i, {roupa: roupas[i % roupas.length], pele: [0xe3b48a, 0xf2c8a0, 0xd9a77c, 0xc9966c][i % 4], vestido: f, chapeu: i % 3 ? 'gorro' : 'boina', corChapeu: gorros[i % gorros.length], cabelo: [0x2a1a10, 0x6a3a1a, 0xc89a5a][i % 3], cinto: 0x2a2a30, cachecol: gorros[(i + 2) % gorros.length], escala: 0.9 + rnd() * 0.2});
    c.position.set(x, 0, z); c.rotation.y = Math.PI + (rnd() - 0.5) * 0.6; a.g.add(c); povo.push({c, f: rnd() * 6, y0: c.position.y});
    c.userData.boca && c.userData.boca.scale.set(1.0, 0.1, 0.5);
  }
  a.anim.push(t => { for (const p of povo) { p.c.position.y = p.y0 + Math.abs(Math.sin(t * 3 + p.f)) * 0.02; p.c.rotation.z = Math.sin(t * 1.6 + p.f) * 0.03; } });
  // lixo e papeis no chao + cartazes de protesto
  for (let i = 0; i < 6; i++) { const cz = -3 - rnd() * 7, cx = (rnd() - 0.5) * 12; const cart = mesh(new THREE.PlaneGeometry(1.1, 0.83), new THREE.MeshBasicMaterial({map: CARTAZES[i % 4], side: THREE.DoubleSide}), cx, 2.5, cz, a.g); cart.rotation.y = rnd() * 0.5; mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.7, 4), M(0x8a6a40), cx, 1.6, cz, a.g); }
  // carros da epoca (Trabant)
  function trabant(x, z, ry, cor) {
    const g = new THREE.Group();
    mesh(new THREE.BoxGeometry(1.7, 0.6, 3.5), M(cor), 0, 0.62, 0, g).castShadow = true;
    mesh(new THREE.BoxGeometry(1.5, 0.62, 1.9), M(cor), 0, 1.2, -0.1, g);
    mesh(new THREE.BoxGeometry(1.52, 0.4, 1.7), M(0x1a2230, {emissive: 0x0a1018}), 0, 1.25, -0.1, g);
    for (const sx of [-1, 1]) for (const sz of [-1.1, 1.1]) mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 14), M(0x111114), 0.85 * sx, 0.34, sz, g).rotation.z = Math.PI / 2;
    brilho(0xffe0a0, 1.0, 0.55, 0.7, 1.78, g); brilho(0xffe0a0, 1.0, -0.55, 0.7, 1.78, g);
    g.position.set(x, 0, z); g.rotation.y = ry; a.g.add(g);
  }
  trabant(-7.4, -5.5, 0.3, 0x7a9ac0); trabant(8.2, -8, -0.2, 0xd8c890); trabant(7.4, 2, 0.1, 0x9ab08a);
  lua(a, 70, 60, -140, 0xfff6d6, 3); nuvens(a, 0x2a3358, 5);
  stdCams(a, [0.2, 2.8], [0, 1.6, -13], [[-1.6, -4.2], [2.3, -7.4], [-2.4, -10]]);
  a.cams.ampla = u => ({pos: [3.0 - u * 3.6, 3.7, 9.5], look: [0, 2.5, -14], fov: 70});
  a.cams.portao = u => ({pos: [0.4, 1.9, 4 - u * 2], look: [-0.4, 1.6, -13], fov: 58});
  a.cams.torre = u => ({pos: [5, 1.9, 3], look: V([10, 6.5, -20], [13, 9, -20], u), fov: 62});
  a.cams.muro = u => ({pos: [V([-6, 1.8, -2], [2, 1.8, -2], ease(u))[0], 1.8, -2], look: [V([-8, 2, -14], [4, 2, -14], ease(u))[0], 2.0, -14], fov: 56});
})();

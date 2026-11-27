// NAO FACA ISSO (canal de humor absurdo, 27/11/2026). Cenarios do dia a dia onde o Jorginho passa vergonha:
//   restaurante  primeiro encontro: mesa a luz de vela, casal SENTADO frente a frente, garcom, mesas ao fundo
//   escritorio   entrevista de emprego: mesa do chefe, cadeiras, estante, janela da cidade, planta
//   casamento    igreja enfeitada: corredor, bancos com convidados, altar com arco de flores, noiva, noivo, padre
//   elevador     caixa de metal apertada, painel de botoes, musiquinha de elevador
// Acoes novas (window.humorPose / humorPos, chamadas pelo diretor3d.js): sobe (sobe na mesa), agacha, danca, cai,
// grita, treme, vira (vira de costas), rebola. Quem esta "sentado" fica mais baixo, atras da toalha/mesa.
// Carregado depois de ambiente_cidades.js e antes de polir.js.

Object.assign(PAPEIS, {
  jorginho:   {roupa: 0x9be22a, pele: 0xf0c49a, cabelo: 0xe0701e, cinto: 0x2a2a3a, gravata: 0xd8281e, botoes: 0xffffff, topete: true},
  jorginha:   {roupa: 0xff7ac8, pele: 0xe3b48a, chapeu: 'rabo', cabelo: 0xe0701e, cinto: 0x2a2a3a, botoes: 0xffffff},
  crush:      {roupa: 0xc8102e, pele: 0xe8b890, vestido: true, chapeu: 'rabo', cabelo: 0x5a2a12, cinto: 0x1a1a1a, colar: 0xf2e6c8, flor: 0xff6b8a},
  'crush-m':  {roupa: 0x1f3f7a, pele: 0xc98a5a, cabelo: 0x111111, cinto: 0x1a1a1a, botoes: 0xe8e4dc, gola: true},
  garcom:     {roupa: 0x15151a, pele: 0xd9a77c, cabelo: 0x111111, cinto: 0x0a0a0a, borboleta: 0xc8102e, avental: 0xf6f6f2, bigode: 0x111111, gola: true},
  chefe:      {roupa: 0x2a2f3a, pele: 0xf2c8a0, cabelo: 0x8a8a8a, cinto: 0x111111, gravata: 0x1f3f7a, oculos: true, botoes: 0xd9d9e0},
  chefa:      {roupa: 0x3a2a4a, pele: 0x8d5733, chapeu: 'coque', cabelo: 0x111111, palito: 0x111111, flor: 0x3a2a4a, cinto: 0x111111, oculos: true, colar: 0xe8c14a},
  noiva:      {roupa: 0xfbfaf6, pele: 0xf0c49a, vestido: true, cabelo: 0x8a5a2a, cabeloTras: true, veu: true, cinto: 0xe8e0d0, colar: 0xf6f1e6, buque: true},
  noivo:      {roupa: 0x111116, pele: 0xd9a77c, cabelo: 0x2a1a10, cinto: 0x0a0a0a, borboleta: 0x111116, botoes: 0xe8e4dc, gola: true, flor: 0xffffff},
  convidado:  {roupa: 0x4a5a7a, pele: 0xc98a5a, cabelo: 0x2a1a10, cinto: 0x1a1a1a, gravata: 0x8a1f2e},
  convidada:  {roupa: 0x2f8a6a, pele: 0xf2c8a0, vestido: true, chapeu: 'chapeu-dama', corChapeu: 0xf2b8c8, flor: 0xffffff, cabelo: 0x6a3a1e},
  sogra:      {roupa: 0x7a2a6a, pele: 0xe3b48a, vestido: true, cabelo: 0xb8b8c0, chapeu: 'coque', palito: 0xd9b24a, flor: 0xd9b24a, oculos: true, colar: 0xf2e6c8},
  vizinho:    {roupa: 0xe8742a, pele: 0x8d5733, chapeu: 'bone', corChapeu: 0x1f6a3a, cabelo: 0x111111, cinto: 0x2a2a3a, barba: 0x111111},
  seguranca:  {roupa: 0x111114, pele: 0x6e4227, cabelo: 0x111111, cinto: 0x0a0a0a, oculos: true, escala: 1.12, brava: true},
});

// acessorios: gravata, gravata-borboleta, oculos, veu, colar, buque, topete, batom
(function () {
  const _ce = window.chapeuExtra;
  window.chapeuExtra = function (o, cab, g) {
    _ce(o, cab, g);
    if (o.gravata) { const k = mesh(new THREE.BoxGeometry(0.14, 0.6, 0.05), M(o.gravata), 0, 1.02, 0.49, g); k.rotation.z = o.topete ? 0.18 : 0.02;
      mesh(new THREE.BoxGeometry(0.18, 0.12, 0.07), M(o.gravata), 0, 1.33, 0.48, g); }
    if (o.borboleta) for (const s of [-1, 1]) { const b = mesh(new THREE.ConeGeometry(0.1, 0.18, 4), M(o.borboleta), 0.09 * s, 1.33, 0.48, g); b.rotation.z = s * Math.PI / 2; }
    if (o.oculos) { for (const s of [-1, 1]) { const l = mesh(new THREE.TorusGeometry(0.13, 0.025, 6, 16), M(0x111111), 0.2 * s, 0.08, 0.55, cab); }
      mesh(new THREE.BoxGeometry(0.16, 0.025, 0.025), M(0x111111), 0, 0.1, 0.56, cab); }
    if (o.veu) { const v = mesh(new THREE.ConeGeometry(0.75, 1.9, 18, 1, true), new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide}), 0, -0.25, -0.2, cab);
      mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), M(0xf6f1e6), 0, 0.42, 0, cab).rotation.x = Math.PI / 2; }
    if (o.colar) { const t = mesh(new THREE.TorusGeometry(0.36, 0.035, 6, 18), M(o.colar, {metalness: 0.4, roughness: 0.3}), 0, 1.3, 0.05, g); t.rotation.x = Math.PI / 2 - 0.25; }
    if (o.buque) { mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.3, 6), M(0x3a7a3a), 0.3, 0.75, 0.55, g);
      for (let i = 0; i < 6; i++) mesh(new THREE.SphereGeometry(0.1, 8, 6), M([0xffffff, 0xffc0d8, 0xff6b8a][i % 3]), 0.3 + Math.cos(i) * 0.1, 0.95 + Math.sin(i * 2) * 0.04, 0.55 + Math.sin(i) * 0.1, g); }
    if (o.topete) { const t = mesh(new THREE.SphereGeometry(0.3, 12, 10), M(o.cabelo), 0.05, 0.5, 0.25, cab); t.scale.set(1.2, 0.8, 1.3); t.rotation.x = -0.5; }
    if (o.batom) mesh(new THREE.BoxGeometry(0.2, 0.05, 0.04), M(0xb0102a), 0, -0.2, 0.52, cab);
  };
})();

// ================================================================ utilidades
function hMadeira(cor, veio) {
  return canvasTex(256, 256, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, y, w, 2); for (let k = 0; k < 6; k++) { g.fillStyle = `rgba(${veio},${0.05 + rnd() * 0.1})`; g.fillRect(0, y + rnd() * 30, w, 1 + rnd() * 2); } } });
}
function hParede(a, w, h, z, cor, x, rotY) { const m = mesh(new THREE.BoxGeometry(w, h, 0.2), M(cor), x || 0, h / 2, z, a.g); if (rotY) m.rotation.y = rotY; m.receiveShadow = true; return m; }
function hCadeira(a, x, z, ry, cor) {
  const g = new THREE.Group(); mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9), M(cor || 0x5a3a22), 0, 0.5, 0, g);
  mesh(new THREE.BoxGeometry(0.9, 1.2, 0.08), M(cor || 0x5a3a22), 0, 1.1, -0.42, g);
  for (const [dx, dz] of [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]]) mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), M(0x2a1a10), dx, 0.25, dz, g);
  g.position.set(x, 0, z); g.rotation.y = ry; a.g.add(g); return g;
}
function hMesa(a, x, z, w, d, toalha, cor2) {
  const topo = 0.86;
  mesh(new THREE.BoxGeometry(w, 0.08, d), M(toalha), x, topo, z, a.g).castShadow = true;
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(w, topo, 0.03), M(toalha), x, topo / 2, z + s * d / 2, a.g); mesh(new THREE.BoxGeometry(0.03, topo, d), M(toalha), x + s * w / 2, topo / 2, z, a.g); }
  if (cor2) for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(w + 0.01, 0.06, 0.04), M(cor2), x, 0.2 + k * 0.12, z + d / 2 + 0.01, a.g);
  return topo;
}
function hQuadro(a, x, y, z, w, h, desenho, rotY) {
  const t = canvasTex(256, Math.round(256 * h / w), desenho); const m = mesh(new THREE.BoxGeometry(w, h, 0.05), new THREE.MeshStandardMaterial({map: t, roughness: 0.8}), x, y, z, a.g);
  if (rotY) m.rotation.y = rotY; mesh(new THREE.BoxGeometry(w + 0.12, h + 0.12, 0.03), M(0x2a1a10), x, y, z - 0.02, a.g).rotation.y = rotY || 0; return m;
}
function hJanelaNoite(a, x, y, z, w, h) {
  const t = canvasTex(256, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a1030'); gr.addColorStop(1, '#2a2050'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) { const bx = rnd() * W, bw = 14 + rnd() * 26, bh = 60 + rnd() * 140; g.fillStyle = '#141830'; g.fillRect(bx, H - bh, bw, bh);
      for (let k = 0; k < 10; k++) if (rnd() < 0.5) { g.fillStyle = rnd() < 0.7 ? '#ffd27a' : '#9ad8ff'; g.fillRect(bx + 3 + rnd() * (bw - 8), H - bh + 6 + rnd() * (bh - 12), 3, 4); } }
    g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(W * 0.8, H * 0.18, 14, 0, 7); g.fill(); });
  mesh(new THREE.BoxGeometry(w, h, 0.05), new THREE.MeshBasicMaterial({map: t}), x, y, z, a.g);
  mesh(new THREE.BoxGeometry(w + 0.2, 0.12, 0.12), M(0x2a1a10), x, y - h / 2, z + 0.05, a.g); mesh(new THREE.BoxGeometry(w + 0.2, 0.12, 0.12), M(0x2a1a10), x, y + h / 2, z + 0.05, a.g);
  mesh(new THREE.BoxGeometry(0.08, h, 0.1), M(0x2a1a10), x, y, z + 0.05, a.g);
}
function hVela(a, x, y, z) {
  mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8), M(0xf6f1e6), x, y + 0.14, z, a.g);
  const f = mesh(new THREE.ConeGeometry(0.04, 0.12, 6), B(0xffb84a), x, y + 0.34, z, a.g); brilho(0xffa040, 1.1, x, y + 0.34, z, a.g);
  a.anim.push(t => { f.scale.set(1, 1 + Math.sin(t * 13) * 0.15, 1); });
}
function hSentadoNaMesa(a, mesas, papeis, y) {     // casais de fundo SENTADOS (figurantes, nao falam)
  let i = 0;
  for (const [x, z] of mesas) {
    hMesa(a, x, z, 1.4, 1.0, 0xf6f1e6, 0xc8102e); hVela(a, x, 0.9, z);
    for (const s of [-1, 1]) { const o = variar3d(papel(papeis[i % papeis.length]), Math.floor(i / papeis.length)); i++;
      const c = personagem('fundo-' + a.nome + '-' + i, o); c.position.set(x + s * 1.0, y, z); c.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; c.scale.multiplyScalar(0.95); a.g.add(c);
      const f = rnd() * 9; a.anim.push(t => { const d = c.userData; if (d.cab) d.cab.rotation.y = Math.sin(t * 0.8 + f) * 0.2; if (d.bracos) d.bracos[s > 0 ? 0 : 1].rotation.z = (s > 0 ? 0.25 : -0.25) + Math.sin(t * 2 + f) * 0.15; }); }
  }
}
function hCam(a, nome, pos, look, fov) { a.cams[nome] = u => ({pos: [pos[0] + (look[0] - pos[0]) * u * 0.06, pos[1], pos[2] + (look[2] - pos[2]) * u * 0.06], look, fov: fov || 50}); }

const SENTADO = -0.46;      // altura da base de quem esta sentado (a toalha/mesa esconde o corpo)

// ================================================================ 1) RESTAURANTE (primeiro encontro)
(function () {
  const a = novoAmb('restaurante', cfgInterior({hemiCeu: 0xfff0dc, hemiChao: 0x4a3020, hemiInt: 1.15, pontoCor: 0xffd8a8, pontoInt: 12, pontoDist: 16, pontoPos: [0, 3.8, -1],
    dirCor: 0xfff0e0, dirInt: 0.7, fundo: 0x1a0e08, nevoa: [0x1a0e08, 14, 40]}));
  a.g.position.x = 7000;
  const piso = hMadeira('#7a4a2a', '40,20,10'); piso.wrapS = piso.wrapT = THREE.RepeatWrapping; piso.repeat.set(4, 6);
  mesh(new THREE.BoxGeometry(16, 0.3, 20), new THREE.MeshStandardMaterial({map: piso, roughness: 0.7}), 0, -0.15, -4, a.g).receiveShadow = true;
  hParede(a, 16, 5, -9.5, 0x6a1a22); hParede(a, 20, 5, -4, 0x5a161c, -7.5, Math.PI / 2); hParede(a, 20, 5, -4, 0x5a161c, 7.5, Math.PI / 2);
  for (let k = 0; k < 8; k++) mesh(new THREE.BoxGeometry(0.08, 5, 0.04), M(0x4a1016), -7 + k * 2, 2.5, -9.38, a.g);
  mesh(new THREE.BoxGeometry(16, 1.1, 0.06), M(0x3a1a10), 0, 0.55, -9.36, a.g);
  hJanelaNoite(a, -3.2, 2.6, -9.35, 2.4, 2.0); hJanelaNoite(a, 3.2, 2.6, -9.35, 2.4, 2.0);
  hQuadro(a, 0, 3.0, -9.35, 1.4, 1.0, (g, w, h) => { g.fillStyle = '#e8d8b0'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a1f2e'; g.beginPath(); g.ellipse(w / 2, h / 2, 50, 70, 0, 0, 7); g.fill(); g.fillStyle = '#2f6a3a'; g.fillRect(w / 2 - 4, h / 2 + 50, 8, 60); });
  // lustre
  mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), M(0x2a2a2a), 0, 4.4, -2, a.g); mesh(new THREE.ConeGeometry(0.6, 0.4, 12, 1, true), M(0xd9b24a, {side: THREE.DoubleSide, metalness: 0.5}), 0, 3.7, -2, a.g);
  brilho(0xffc070, 1.1, 0, 3.55, -2, a.g);
  // A MESA do casal (a toalha vai ate o chao: esconde as pernas de quem esta sentado)
  const topo = hMesa(a, 0, -2, 2.5, 1.3, 0xf6f1e6, 0xc8102e);
  hVela(a, 0, topo, -2); mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.4, 8), new THREE.MeshStandardMaterial({color: 0x3a6a3a, transparent: true, opacity: 0.75}), 0.25, topo + 0.2, -2.25, a.g);
  mesh(new THREE.SphereGeometry(0.07, 8, 6), M(0xc8102e), 0.25, topo + 0.45, -2.25, a.g);
  for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.04, 18), M(0xffffff), s * 0.75, topo + 0.05, -2, a.g);
    mesh(new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(s < 0 ? 0xd8a040 : 0x6a3a1e), s * 0.75, topo + 0.07, -2, a.g);
    const ta = mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.18, 10), new THREE.MeshStandardMaterial({color: 0x8a1020, transparent: true, opacity: 0.8}), s * 0.6, topo + 0.25, -2.4, a.g);
    mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 5), M(0xdddddd), s * 0.6, topo + 0.1, -2.4, a.g); }
  hCadeira(a, -1.85, -2, Math.PI / 2, 0x3a2414); hCadeira(a, 1.85, -2, -Math.PI / 2, 0x3a2414);
  // mesas do fundo com casais sentados + balcao
  hSentadoNaMesa(a, [[-4.4, -7.0], [3.6, -7.4], [-5.4, -2.6]], ['convidado', 'convidada', 'crush-m', 'chefa', 'vizinho', 'sogra'], SENTADO);
  mesh(new THREE.BoxGeometry(4, 1.1, 0.8), M(0x3a2014), 4.8, 0.55, -8.5, a.g); for (let k = 0; k < 7; k++) mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), M([0x2a6a3a, 0x6a1a22, 0xd9b24a][k % 3]), 3.2 + k * 0.5, 1.7, -9.2, a.g);
  mesh(new THREE.BoxGeometry(4, 0.06, 0.3), M(0x2a1a10), 4.8, 1.48, -9.2, a.g);
  a.pontos = {mesa: {pos: [0, topo, -2], cam: [0, 2.8, 3.6]}, vela: {pos: [0, topo + 0.3, -2], cam: [0.3, 1.5, -0.6]}, porta: {pos: [-6.5, 1.2, 3], cam: [0, 2.2, 3]}, balcao: {pos: [4.8, 1.2, -8.5], cam: [2, 2, -4]}};
  // camera: o casal de lado, frente a frente (Jorginho a esquerda, a crush a direita). Cabeca de quem esta sentado ~1,3 m.
  hCam(a, 'ampla', [0.0, 2.5, 6.2], [0, 1.15, -2.2], 52);
  hCam(a, 'grupo', [0.6, 2.9, 7.4], [0, 1.2, -2.6], 56);
  hCam(a, 'mesa', [0.0, 2.8, 3.6], [0, 1.9, -2], 56);
  hCam(a, 'alto', [-3.2, 6.0, 3.0], [0, 0.8, -2.4], 60);
  hCam(a, 'eu-frente', [0.6, 1.5, -0.95], [-1.85, 1.32, -2], 44);
  hCam(a, 'eu-lado', [1.5, 1.8, 0.5], [-1.85, 1.25, -2], 46);
  hCam(a, 'f0c', [-0.6, 1.5, -0.95], [1.85, 1.32, -2], 44);
  hCam(a, 'f0', [-1.5, 1.8, 0.5], [1.85, 1.25, -2], 46);
  hCam(a, 'f1c', [0.2, 1.95, -1.1], [0.2, 1.8, -4.1], 44); hCam(a, 'f1', [1.6, 2.1, 0.4], [0.2, 1.6, -4.1], 48);
  stdCams(a, [-1.85, -2], [1.85, 1.3, -2], [[1.85, -2], [0.2, -4.1]]);
  a.assentos = {prot: SENTADO, f0: SENTADO};
})();

// ================================================================ 2) ESCRITORIO (entrevista de emprego)
(function () {
  const a = novoAmb('escritorio', cfgDia({ceu: [0x2a6ad8, 0x8ac0f0, 0xe8f4ff], fundo: 0xdfe6ee, nevoa: [0xdfe6ee, 18, 60], hemiCeu: 0xf2f6ff, hemiChao: 0x8a8070, hemiInt: 1.25,
    dirCor: 0xffffff, dirInt: 0.9, dirPos: [6, 12, 8]}));
  a.g.position.x = 7300;
  const piso = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b8bcc4'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#aab0ba' : '#c4c8d0'; g.fillRect(i * 64, j * 64, 64, 64); } });
  piso.wrapS = piso.wrapT = THREE.RepeatWrapping; piso.repeat.set(5, 6);
  mesh(new THREE.BoxGeometry(20, 0.3, 16), new THREE.MeshStandardMaterial({map: piso, roughness: 0.6}), 0, -0.15, -3, a.g).receiveShadow = true;
  hParede(a, 20, 4.2, -7.5, 0xe8ecf0); hParede(a, 16, 4.2, -3, 0xdfe4ea, -8.5, Math.PI / 2);
  // janelao com a cidade de dia
  const vista = canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5aa0e8'); gr.addColorStop(1, '#cfe6ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 22; i++) { const bx = i * 24 + rnd() * 10, bh = 60 + rnd() * 150; g.fillStyle = ['#7a8aa0', '#8a96aa', '#6a7890'][i % 3]; g.fillRect(bx, h - bh, 20, bh); g.fillStyle = 'rgba(255,255,255,0.35)'; for (let k = 0; k < 8; k++) g.fillRect(bx + 3, h - bh + 6 + k * 16, 14, 6); } });
  mesh(new THREE.BoxGeometry(6.5, 2.6, 0.05), new THREE.MeshBasicMaterial({map: vista}), 2.5, 2.2, -7.35, a.g);
  for (let k = 0; k < 4; k++) mesh(new THREE.BoxGeometry(0.08, 2.7, 0.1), M(0x3a3f4a), -0.75 + k * 2.17, 2.2, -7.3, a.g);
  // mesa do chefe + cadeira de couro + cadeira do candidato
  mesh(new THREE.BoxGeometry(2.6, 0.1, 1.2), M(0x4a2a18), 0, 0.92, -3.2, a.g).castShadow = true;
  mesh(new THREE.BoxGeometry(2.5, 0.88, 0.06), M(0x3a2010), 0, 0.44, -2.62, a.g);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.06, 0.88, 1.1), M(0x3a2010), s * 1.22, 0.44, -3.2, a.g);
  mesh(new THREE.BoxGeometry(0.7, 0.45, 0.05), M(0x15151a), 0.6, 1.2, -3.55, a.g).rotation.y = -0.3; mesh(new THREE.BoxGeometry(0.64, 0.38, 0.02), B(0x5ab0ff), 0.6, 1.2, -3.52, a.g).rotation.y = -0.3;
  mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), M(0xf6f6f2), -0.4, 0.98, -3.0, a.g); mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 10), M(0xffffff), -0.8, 1.03, -3.3, a.g);
  mesh(new THREE.BoxGeometry(0.5, 0.05, 0.08), M(0xd9b24a), -0.2, 0.99, -2.8, a.g);
  hCadeira(a, 0, -4.3, 0, 0x15151a); hCadeira(a, 0, -1.5, Math.PI, 0x6a6f7a);
  // estante, planta, quadro motivacional, bebedouro
  mesh(new THREE.BoxGeometry(2.4, 3.2, 0.5), M(0x5a3a22), -4.4, 1.6, -7.1, a.g);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) mesh(new THREE.BoxGeometry(0.22, 0.5, 0.35), M([0x8a1f2e, 0x1f3f7a, 0x2f6a3a, 0xd9b24a, 0x3a3a44][(r + k) % 5]), -5.3 + k * 0.3, 0.45 + r * 0.78, -6.95, a.g);
  mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 12), M(0xd8d0c0), 4.8, 0.3, -6, a.g); for (let i = 0; i < 7; i++) { const f = mesh(new THREE.SphereGeometry(0.35, 8, 6), M(0x2f7a3a, {flatShading: true}), 4.8 + rr(-0.3, 0.3), 1.0 + i * 0.18, -6 + rr(-0.3, 0.3), a.g); }
  hQuadro(a, -1.6, 2.8, -7.35, 1.6, 1.0, (g, w, h) => { g.fillStyle = '#1a2a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23f'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.fillText('FOCO', w / 2, 60); g.font = 'bold 22px sans-serif'; g.fillStyle = '#ffffff'; g.fillText('TRABALHO EM', w / 2, 100); g.fillText('EQUIPE', w / 2, 128); });
  mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), M(0xe8ecf0), -5.6, 0.6, -4.5, a.g); mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 12), new THREE.MeshStandardMaterial({color: 0x8ac8ff, transparent: true, opacity: 0.7}), -5.6, 1.5, -4.5, a.g);
  for (let k = 0; k < 4; k++) { mesh(new THREE.BoxGeometry(1.4, 0.04, 0.2), M(0xf6f6f2), 0, 4.15, -6 + k * 2, a.g); brilho(0xffffff, 1.2, 0, 4.0, -6 + k * 2, a.g); }
  a.pontos = {mesa: {pos: [0, 0.97, -3.2], cam: [5.6, 2.7, -2.6]}, computador: {pos: [0.6, 1.2, -3.55], cam: [-0.4, 1.6, -2.0]}, janela: {pos: [2.5, 2.2, -7.3], cam: [0, 2, -1]}, planta: {pos: [4.8, 1.2, -6], cam: [2.4, 1.8, -2.6]}};
  hCam(a, 'ampla', [7.6, 2.3, -2.9], [0, 1.15, -2.9], 46);
  hCam(a, 'grupo', [6.2, 3.0, 1.6], [0, 1.1, -3.0], 54);
  hCam(a, 'mesa', [6.6, 3.0, -2.4], [0, 1.9, -3.2], 50);
  hCam(a, 'alto', [-3.2, 5.4, 1.2], [0, 0.8, -3.0], 60);
  hCam(a, 'eu-frente', [0.55, 1.5, -3.5], [0, 1.32, -1.5], 44);
  hCam(a, 'eu-lado', [-1.0, 1.85, -5.8], [0, 1.25, -1.5], 46);
  hCam(a, 'f0c', [0.55, 1.5, -2.0], [0, 1.32, -4.3], 44);
  hCam(a, 'f0', [1.0, 1.85, 0.3], [0, 1.25, -4.3], 46);
  stdCams(a, [0, -1.5], [0, 1.3, -4.3], [[0, -4.3], [-4.6, -5.6]]);
  a.assentos = {prot: SENTADO, f0: SENTADO};
})();

// ================================================================ 3) CASAMENTO (igreja enfeitada)
(function () {
  const a = novoAmb('casamento', cfgInterior({hemiCeu: 0xfff2e0, hemiChao: 0x6a5040, hemiInt: 1.45, pontoCor: 0xfff0d0, pontoInt: 26, pontoDist: 22, pontoPos: [0, 6, -6],
    dirCor: 0xfff6e8, dirInt: 0.8, dirPos: [4, 12, 6], fundo: 0xe8dcc8, nevoa: [0xe8dcc8, 24, 70]}));
  a.g.position.x = 7600;
  const piso = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8e0d0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,100,80,0.25)'; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } });
  piso.wrapS = piso.wrapT = THREE.RepeatWrapping; piso.repeat.set(6, 12);
  mesh(new THREE.BoxGeometry(16, 0.3, 34), new THREE.MeshStandardMaterial({map: piso, roughness: 0.5}), 0, -0.15, -8, a.g).receiveShadow = true;
  mesh(new THREE.BoxGeometry(2.2, 0.02, 30), M(0xb8102e), 0, 0.02, -8, a.g);                          // tapete vermelho
  hParede(a, 16, 9, -21, 0xf2ead8); hParede(a, 34, 9, -8, 0xece2cc, -8, Math.PI / 2); hParede(a, 34, 9, -8, 0xece2cc, 8, Math.PI / 2);
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { mesh(new THREE.BoxGeometry(0.1, 3.6, 1.4), B(k % 2 ? 0x6a9ad8 : 0xd86a8a), s * 7.88, 4.4, 2 - k * 5, a.g); brilho(0xfff0d0, 1.6, s * 7.4, 4.4, 2 - k * 5, a.g); }
  // altar: degrau, arco de flores, cruz discreta, velas
  mesh(new THREE.BoxGeometry(8, 0.4, 4), M(0xf6f1e6), 0, 0.2, -17.5, a.g);
  for (let i = 0; i <= 20; i++) { const ang = Math.PI * i / 20, x = Math.cos(ang) * 2.4, y = 0.4 + Math.sin(ang) * 3.4;
    mesh(new THREE.SphereGeometry(0.28, 8, 6), M([0xffffff, 0xffc0d8, 0xff6b8a, 0xf2e6c8][i % 4]), x, y, -17.2, a.g); if (i % 2) mesh(new THREE.SphereGeometry(0.2, 6, 5), M(0x3a7a3a), x * 1.06, y + 0.15, -17.3, a.g); }
  mesh(new THREE.BoxGeometry(0.15, 1.6, 0.1), M(0xd9b24a, {metalness: 0.5}), 0, 6.4, -20.85, a.g); mesh(new THREE.BoxGeometry(0.8, 0.15, 0.1), M(0xd9b24a, {metalness: 0.5}), 0, 6.8, -20.85, a.g);
  for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.6, 8), M(0xd9b24a, {metalness: 0.5}), s * 3.2, 1.2, -18.5, a.g); hVela(a, s * 3.2, 2.0, -18.5); }
  // bancos com convidados sentados (dos dois lados do corredor), com laco branco
  const conv = ['convidado', 'convidada', 'sogra', 'vizinho', 'chefa', 'crush-m', 'convidada', 'convidado'];
  let n = 0;
  for (let r = 0; r < 5; r++) for (const s of [-1, 1]) {
    const z = -12.5 + r * 2.6, x0 = s * 3.6;
    mesh(new THREE.BoxGeometry(4.8, 0.12, 0.8), M(0x6a3a1e), x0, 0.55, z, a.g); mesh(new THREE.BoxGeometry(4.8, 1.0, 0.1), M(0x5a3018), x0, 1.0, z + 0.4, a.g);
    for (const dx of [-1.4, 0.0, 1.4]) { if ((r + n) % 3 === 2) { n++; continue; }
      const o = variar3d(papel(conv[n % conv.length]), Math.floor(n / conv.length)); n++;
      const c = personagem('fundo-' + a.nome + '-' + n, o); c.position.set(x0 + dx, -0.12, z - 0.05); c.rotation.y = Math.PI; c.scale.multiplyScalar(0.92); a.g.add(c);
      const f = rnd() * 9; a.anim.push(t => { const d = c.userData; if (d.cab) d.cab.rotation.y = Math.sin(t * 0.6 + f) * 0.25; }); }
  }
  a.pontos = {altar: {pos: [0, 1.6, -17.5], cam: [0, 2.2, -10]}, noiva: {pos: [-0.8, 1.6, -16.6], cam: [0.8, 1.9, -13]}, bancos: {pos: [3.6, 1.0, -8], cam: [0, 2.5, -2]}, bolo: {pos: [5.6, 1.4, -15], cam: [3, 2, -11]}};
  // bolo de casamento no canto
  for (let k = 0; k < 3; k++) mesh(new THREE.CylinderGeometry(0.55 - k * 0.15, 0.55 - k * 0.15, 0.4, 18), M(0xfbf6ee), 5.6, 1.1 + k * 0.4, -15, a.g);
  mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4), M(0xf6f1e6), 5.6, 0.45, -15, a.g);
  hCam(a, 'ampla', [0.55, 2.6, -5.6], [0.55, 1.7, -15.0], 50);
  hCam(a, 'grupo', [-2.4, 3.0, -8.0], [0.4, 1.7, -15.8], 54);
  hCam(a, 'alto', [-3.5, 6.5, -4.0], [0, 0.8, -12], 64);
  hCam(a, 'eu-frente', [0.75, 1.95, -15.7], [2.0, 1.75, -13.9], 46);
  hCam(a, 'eu-lado', [-0.6, 2.2, -11.6], [2.0, 1.7, -13.9], 48);
  hCam(a, 'f0c', [0.75, 2.25, -14.5], [-0.9, 2.1, -16.4], 44); hCam(a, 'f0', [2.6, 2.4, -12.6], [-0.9, 2.0, -16.4], 46);
  hCam(a, 'f1c', [-0.2, 2.25, -14.2], [0.9, 2.1, -16.4], 44); hCam(a, 'f1', [-1.6, 2.4, -12.6], [0.9, 2.0, -16.4], 46);
  hCam(a, 'f2c', [0.0, 2.95, -15.5], [0, 2.15, -18.6], 42); hCam(a, 'f2', [-0.8, 3.0, -13.2], [0, 2.1, -18.6], 46);
  stdCams(a, [2.0, -13.9], [0.2, 1.7, -17.2], [[-0.9, -16.4], [0.9, -16.4], [0, -18.6]]);
  a.chaoAlt = {f0: 0.4, f1: 0.4, f2: 0.4};      // noiva, noivo e padre ficam no degrau do altar
})();

// ================================================================ 4) ELEVADOR
(function () {
  const a = novoAmb('elevador', cfgInterior({hemiCeu: 0xf0f4ff, hemiChao: 0x50545a, hemiInt: 1.3, pontoCor: 0xf6f8ff, pontoInt: 18, pontoDist: 9, pontoPos: [0, 3.3, -1.4],
    dirInt: 0.4, fundo: 0x2a2c30, nevoa: [0x2a2c30, 12, 30]}));
  a.g.position.x = 7900;
  const inox = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#9aa0a8'); gr.addColorStop(0.5, '#d8dce2'); gr.addColorStop(1, '#8a9098'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.12})`; g.fillRect(0, rnd() * h, w, 1); } });
  const mi = new THREE.MeshStandardMaterial({map: inox, metalness: 0.55, roughness: 0.35});
  mesh(new THREE.BoxGeometry(3.4, 0.2, 3.0), M(0x3a3a40), 0, -0.1, -1.4, a.g);
  mesh(new THREE.BoxGeometry(3.4, 3.4, 0.12), mi, 0, 1.7, -2.9, a.g);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.12, 3.4, 3.0), mi, s * 1.7, 1.7, -1.4, a.g);
  mesh(new THREE.BoxGeometry(3.4, 0.1, 3.0), M(0xe8ecf2), 0, 3.4, -1.4, a.g); mesh(new THREE.BoxGeometry(1.6, 0.04, 1.0), B(0xf6f8ff), 0, 3.34, -1.4, a.g);
  mesh(new THREE.BoxGeometry(3.3, 0.06, 0.06), M(0xc9ccd6, {metalness: 0.7}), 0, 1.0, -2.8, a.g);
  mesh(new THREE.BoxGeometry(1.2, 1.6, 0.05), new THREE.MeshStandardMaterial({color: 0xaab4c4, metalness: 0.9, roughness: 0.08}), -0.7, 1.9, -2.83, a.g);      // espelho
  // painel de botoes + visor do andar
  mesh(new THREE.BoxGeometry(0.05, 1.2, 0.45), M(0x2a2c30), 1.63, 1.5, -0.6, a.g);
  for (let k = 0; k < 10; k++) mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), B(k === 6 ? 0xffb030 : 0xe8ecf2), 1.6, 1.1 + Math.floor(k / 2) * 0.17, -0.7 + (k % 2) * 0.18, a.g).rotation.z = Math.PI / 2;
  const visor = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#100a08'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff5a2a'; g.font = 'bold 44px monospace'; g.textAlign = 'center'; g.fillText('13', w / 2, 48); });
  mesh(new THREE.BoxGeometry(0.6, 0.3, 0.05), new THREE.MeshBasicMaterial({map: visor}), 0, 3.0, -2.82, a.g);
  a.pontos = {botoes: {pos: [1.6, 1.4, -0.6], cam: [0.2, 1.7, 0.6]}, espelho: {pos: [-0.7, 1.9, -2.8], cam: [0.3, 1.8, 0.2]}, teto: {pos: [0, 3.3, -1.4], cam: [0, 1.6, 0.8]}};
  hCam(a, 'ampla', [0.0, 2.15, 2.9], [0, 1.55, -1.5], 64);
  hCam(a, 'grupo', [0.3, 2.3, 3.4], [0, 1.5, -1.5], 66);
  hCam(a, 'alto', [1.25, 3.2, 0.2], [-0.2, 0.7, -1.8], 78);
  hCam(a, 'eu-frente', [-0.4, 2.0, 1.5], [-0.6, 1.75, -1.4], 50);
  hCam(a, 'eu-lado', [1.4, 2.0, 1.0], [-0.6, 1.75, -1.4], 54);
  hCam(a, 'f0c', [0.6, 2.0, 1.3], [0.75, 1.8, -1.9], 50); hCam(a, 'f0', [-0.2, 2.0, 1.2], [0.75, 1.8, -1.9], 52);
  hCam(a, 'f1c', [0.15, 2.9, 0.9], [0.15, 1.85, -2.45], 48); hCam(a, 'f1', [0.8, 2.0, 1.3], [0.15, 1.8, -2.45], 52);
  stdCams(a, [-0.6, -1.4], [-0.6, 1.6, 3.0], [[0.75, -1.9, 0], [0.15, -2.45, 0]]);
})();

// ================================================================ assentos e acoes de humor
(function () {
  const _se = window.setElenco;
  window.setElenco = function (spec) {
    _se(Object.assign({}, spec, {exato: true}));     // figurante a mais nunca vira clone
    for (const k of ['restaurante', 'escritorio', 'casamento', 'elevador']) {
      const a = amb[k]; if (!a) continue;
      for (const c of a.chars) { const d = c.userData, id = d.prot ? 'prot' : d.id;
        const y = (a.assentos && a.assentos[id] !== undefined) ? a.assentos[id] : ((a.chaoAlt && a.chaoAlt[id]) || 0);
        c.position.y = y; d.base = y; d.p0 = undefined; }
    }
  };
  const ez = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
  // posicao: "sobe" leva o personagem ate o ponto (mesa) e o deixa EM CIMA dele (fica la ate o fim)
  window.humorPos = function (c, a, t, acoes) {
    for (const ac of acoes) {
      if (ac.faz !== 'sobe') continue;
      const P = (a.pontos && a.pontos[ac.para]) ? a.pontos[ac.para].pos : null; if (!P) continue;
      const k = ez((t - ac.t0) / Math.max(0.2, Math.min(1.0, ac.t1 - ac.t0)));
      c.position.x += (P[0] - c.position.x) * k; c.position.z += (P[2] - c.position.z) * k;
      c.userData._sobe = {k, alt: P[1]};
    }
  };
  // pose: altura, bracos e tombos. Devolve {y, bE, bD}
  window.humorPose = function (c, a, t, acoes, p) {
    const d = c.userData; c.rotation.x = 0;
    if (d._sobe) { const s = d._sobe; p.y = p.y + (s.alt - d.base) * s.k + Math.sin(Math.PI * Math.min(1, s.k)) * 0.5; d._sobe = null; }
    for (const ac of acoes) {
      const ativo = t < ac.t1, u = Math.min(1, (t - ac.t0) / Math.max(0.1, ac.t1 - ac.t0));
      if (ac.faz === 'cai') { const k = ez((t - ac.t0) / 0.5); c.rotation.x = -1.45 * k; p.y -= 0.35 * k; p.bE = -1.2; p.bD = 1.2; }   // fica caido
      if (ac.faz === 'vira' ) { c.rotation.y += Math.PI * ez((t - ac.t0) / 0.4); }
      if (!ativo) continue;
      if (ac.faz === 'agacha') { const k = ez(u * 3); c.scale.y = (d.esc0 || (d.esc0 = c.scale.x)) * (1 - 0.32 * k); p.y -= 0.15 * k; p.bE = 0.9; p.bD = -0.9; }
      if (ac.faz === 'danca') { p.y += Math.abs(Math.sin(t * 8)) * 0.18; c.rotation.y += Math.sin(t * 5) * 0.5; p.bE = -2.4 + Math.sin(t * 8) * 0.8; p.bD = 2.4 + Math.sin(t * 8 + 1) * 0.8; }
      if (ac.faz === 'rebola') { c.rotation.z = Math.sin(t * 10) * 0.18; c.position.x += Math.sin(t * 10) * 0.08; p.bE = -1.6; p.bD = 1.6; }
      if (ac.faz === 'grita') { p.bE = -2.8 + Math.sin(t * 20) * 0.15; p.bD = 2.8 - Math.sin(t * 20) * 0.15; p.y += Math.abs(Math.sin(t * 16)) * 0.05; c.rotation.z = Math.sin(t * 30) * 0.04; }
      if (ac.faz === 'treme') { c.position.x += Math.sin(t * 60) * 0.03; c.rotation.z = Math.sin(t * 47) * 0.05; }
    }
    if (!acoes.some(x => x.faz === 'agacha' && t < x.t1) && d.esc0 && !acoes.some(x => x.faz === 'abaixa' && t < x.t1)) c.scale.y = d.esc0;
    return p;
  };
})();

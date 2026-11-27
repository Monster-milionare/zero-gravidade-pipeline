// REPERTORIO DE CIDADES 3D (pedido do Andre, 26/11/2026: "a cidade e a mesma desde o comeco do canal").
// Cinco cidades de epocas diferentes, cada uma com arquitetura, ceu, chao, marco no fim da rua, aderecos e
// GENTE DE FUNDO andando de verdade (figurantes animados, fora do elenco da historia):
//   cidade-medieval  (Europa 1300-1500: Peste Negra, cavaleiros)      casas de enxaimel, catedral gotica, poco, feira
//   cidade-colonial  (Brasil/Americas 1500-1850: Ipiranga, Tiradentes) casario colorido, igreja barroca, chafariz, palmeiras
//   cidade-vitoriana (1850-1930: Londres/Paris/NY, Einstein, 1900)      predios de tijolo, chamines, lampioes a gas, torre do relogio, bonde
//   cidade-futuro    (2050-2200)                                        torres de vidro com neon, carros voadores, hologramas
//   cidade-oriental  (Japao/China feudal: samurais, mongois)            casas de madeira e papel, pagode, torii, lanternas, cerejeiras
// Mais: 17 papeis novos de figurante e 3 protagonistas novos (viajantes no tempo), com chapeus/acessorios proprios.
// Carregado depois de ambiente_berlim.js e antes de polir.js.

// ================================================================ chapeus e acessorios novos
(function () {
  const _ce = window.chapeuExtra;
  window.chapeuExtra = function (o, cab, g) {
    _ce(o, cab, g);
    const h = o.chapeu;
    if (h === 'chapeu-largo') {          // tropeiro / vaqueiro
      const cor = o.corChapeu || 0x6a4a2a;
      mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.05, 22), M(cor), 0, 0.36, 0, cab);
      mesh(new THREE.CylinderGeometry(0.4, 0.48, 0.38, 16), M(cor), 0, 0.56, 0, cab);
      mesh(new THREE.CylinderGeometry(0.485, 0.485, 0.07, 16), M(0x2a1a10), 0, 0.42, 0, cab);
    }
    if (h === 'conico') {                // chapeu de palha conico (Asia)
      const c = mesh(new THREE.ConeGeometry(0.95, 0.45, 20), M(o.corChapeu || 0xd8b870, {flatShading: true}), 0, 0.55, 0, cab);
      mesh(new THREE.TorusGeometry(0.93, 0.03, 4, 22), M(0x8a6a3a), 0, 0.33, 0, cab).rotation.x = Math.PI / 2;
    }
    if (h === 'capacete-policial') {     // capacete de policial vitoriano
      const cor = o.corChapeu || 0x15192a;
      const d = mesh(new THREE.SphereGeometry(0.5, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), M(cor), 0, 0.42, 0, cab); d.scale.set(1, 1.45, 1);
      mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 18), M(cor), 0, 0.33, 0, cab);
      mesh(new THREE.SphereGeometry(0.09, 8, 6), M(0xd9d9e0, {metalness: 0.6, roughness: 0.3}), 0, 0.62, 0.45, cab);
      mesh(new THREE.SphereGeometry(0.06, 8, 6), M(0xd9d9e0, {metalness: 0.6, roughness: 0.3}), 0, 1.15, 0, cab);
    }
    if (h === 'chapeu-dama') {           // chapeu de aba com flor (dama vitoriana / senhora)
      const cor = o.corChapeu || 0x7a2a4a;
      mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.05, 22), M(cor), 0, 0.42, 0, cab);
      mesh(new THREE.CylinderGeometry(0.42, 0.5, 0.3, 16), M(cor), 0, 0.58, 0, cab);
      mesh(new THREE.TorusGeometry(0.47, 0.06, 6, 16), M(o.fita || 0xf2e8d0), 0, 0.48, 0, cab).rotation.x = Math.PI / 2;
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.07, 8, 6), M(o.flor || 0xff6b8a), 0.38 + Math.cos(a) * 0.08, 0.6 + Math.sin(a) * 0.08, 0.32, cab); }
    }
    if (h === 'coque') {                 // coque com palito (cabelo preso)
      mesh(new THREE.SphereGeometry(0.58, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), M(o.cabelo || 0x111111), 0, 0.05, -0.03, cab);
      mesh(new THREE.SphereGeometry(0.26, 12, 10), M(o.cabelo || 0x111111), 0, 0.55, -0.22, cab);
      const p = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6), M(o.palito || 0xc8281e), 0, 0.6, -0.22, cab); p.rotation.z = 1.2;
      mesh(new THREE.SphereGeometry(0.07, 8, 6), M(o.flor || 0xff8ab0), 0.3, 0.45, 0.1, cab);
    }
    if (h === 'rabo') {                  // cabelo com rabo de cavalo
      mesh(new THREE.SphereGeometry(0.58, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), M(o.cabelo || 0x3a2412), 0, 0.05, -0.03, cab);
      const r = mesh(new THREE.SphereGeometry(0.2, 10, 8), M(o.cabelo || 0x3a2412), 0, 0.05, -0.7, cab); r.scale.set(1, 2.0, 1);
    }
    if (h === 'visor') {                 // visor luminoso (futuro)
      mesh(new THREE.SphereGeometry(0.57, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), M(o.cabelo || 0x1a1a22), 0, 0.05, -0.02, cab);
      const v = mesh(new THREE.TorusGeometry(0.56, 0.06, 6, 24, Math.PI), new THREE.MeshBasicMaterial({color: o.corVisor || 0x3af0ff}), 0, 0.12, 0, cab); v.rotation.set(0, 0, 0);
      v.rotation.x = Math.PI / 2; v.rotation.z = Math.PI;
    }
    if (h === 'antena') {                // robo: antena com bolinha acesa
      mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), M(0x9aa2ae, {metalness: 0.6, roughness: 0.35}), 0, 0.75, 0, cab);
      mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({color: o.corVisor || 0x3af0ff}), 0, 1.02, 0, cab);
      for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.12, 12), M(0x7a828e, {metalness: 0.6, roughness: 0.35}), 0.55 * s, 0.02, 0, cab).rotation.z = Math.PI / 2;
    }
    if (h === 'goggles') {               // oculos de aviador na testa (viajante)
      mesh(new THREE.SphereGeometry(0.57, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), M(o.cabelo || 0x3a2412), 0, 0.05, -0.03, cab);
      mesh(new THREE.TorusGeometry(0.555, 0.04, 6, 24), M(0x3a2a1a), 0, 0.3, 0, cab).rotation.x = Math.PI / 2 - 0.15;
      for (const s of [-1, 1]) { mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 14), M(0x8a6a3a, {metalness: 0.4}), 0.19 * s, 0.4, 0.47, cab).rotation.x = Math.PI / 2 - 0.4;
        mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 14), new THREE.MeshStandardMaterial({color: 0x8ad8ff, metalness: 0.2, roughness: 0.1}), 0.19 * s, 0.42, 0.5, cab).rotation.x = Math.PI / 2 - 0.4; }
    }
    if (h === 'kabuto') {                // elmo de samurai com crescente dourado
      const cor = o.corChapeu || 0x1a1a22;
      mesh(new THREE.SphereGeometry(0.6, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), M(cor, {metalness: 0.3, roughness: 0.4}), 0, 0.08, 0, cab);
      const aba = mesh(new THREE.CylinderGeometry(0.62, 0.82, 0.35, 18, 1, true), M(cor, {metalness: 0.3}), 0, -0.05, -0.08, cab); aba.material.side = THREE.DoubleSide;
      for (const s of [-1, 1]) { const ch = mesh(new THREE.TorusGeometry(0.32, 0.04, 6, 14, Math.PI * 0.75), M(0xe8c14a, {metalness: 0.7, roughness: 0.25}), 0.16 * s, 0.62, 0.42, cab); ch.rotation.z = s > 0 ? -0.2 : Math.PI + 0.2; }
      mesh(new THREE.SphereGeometry(0.08, 8, 6), M(0xc8281e), 0, 0.42, 0.55, cab);
    }
    if (h === 'tonsura') {               // monge: coroa de cabelo
      mesh(new THREE.TorusGeometry(0.5, 0.11, 8, 20), M(o.cabelo || 0x5a3a1e), 0, 0.2, 0, cab).rotation.x = Math.PI / 2;
    }
    // ---- acessorios do corpo
    if (o.avental) mesh(new THREE.BoxGeometry(0.62, 0.8, 0.06), M(o.avental), 0, 0.62, 0.5, g);
    if (o.bengala) { const b = mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), M(0x1a1a1a), 0.72, 0.55, 0.15, g); b.rotation.z = 0.08; mesh(new THREE.SphereGeometry(0.06, 8, 6), M(0xd9b24a, {metalness: 0.5}), 0.69, 1.15, 0.15, g); }
    if (o.cajado) { mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.2, 6), M(0x6b4423), 0.72, 1.0, 0.15, g); }
    if (o.jornais) { const j = mesh(new THREE.BoxGeometry(0.42, 0.55, 0.16), M(0xece6d6), -0.66, 0.85, 0.12, g); j.rotation.z = 0.25; mesh(new THREE.BoxGeometry(0.3, 0.06, 0.17), M(0x2a2a2a), -0.66, 0.95, 0.12, g).rotation.z = 0.25; }
    if (o.bolsa) { mesh(new THREE.BoxGeometry(0.42, 0.34, 0.16), M(o.bolsa), 0.55, 0.7, 0.2, g); const al = mesh(new THREE.TorusGeometry(0.55, 0.025, 4, 18, Math.PI * 1.1), M(o.bolsa), 0.15, 1.0, 0.18, g); al.rotation.z = -0.9; }
    if (o.lenco) { const t = mesh(new THREE.TorusGeometry(0.43, 0.11, 8, 18), M(o.lenco), 0, 1.32, 0, g); t.rotation.x = Math.PI / 2; mesh(new THREE.BoxGeometry(0.16, 0.42, 0.06), M(o.lenco), -0.16, 1.08, 0.42, g); }
    if (o.obi) mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.26, 16), M(o.obi), 0, 0.95, 0, g);
    if (o.neon) { const n = mesh(new THREE.TorusGeometry(0.49, 0.03, 4, 22), new THREE.MeshBasicMaterial({color: o.neon}), 0, 0.95, 0, g); n.rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.03, 0.6, 0.03), new THREE.MeshBasicMaterial({color: o.neon}), 0.25 * s, 1.0, 0.47, g); }
    if (o.metal) g.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material.color.getHex() === o.roupa) { m.material = m.material.clone(); m.material.metalness = 0.55; m.material.roughness = 0.35; } });
  };
})();

// ================================================================ elenco novo: 17 figurantes + 3 protagonistas
Object.assign(PAPEIS, {
  // medieval
  mercador:    {roupa: 0x8a3a2a, pele: 0xe3b48a, chapeu: 'boina', corChapeu: 0x2a4a2a, cinto: 0xc9a14a, barba: 0x6a4a2a, bolsa: 0x6b4423, gola: true},
  monge:       {roupa: 0x5a4030, pele: 0xf0c8a0, chapeu: 'tonsura', cabelo: 0x6a4a2a, cinto: 0xe8dcc0, cajado: true, vestido: true},
  ferreiro:    {roupa: 0x4a4a52, pele: 0xc9966c, cabelo: 0x111111, barba: 0x1a1410, cinto: 0x2a1a10, avental: 0x5a3a1e, punho: 0x2a2a2a},
  aldea:       {roupa: 0x7a6a3a, pele: 0xf2c8a0, vestido: true, chapeu: 'capuz', corChapeu: 0xe8dcc0, cinto: 0x5b3a20, avental: 0xf2ead8},
  'nobre-medieval': {roupa: 0x2a3a7a, pele: 0xf2c8a0, chapeu: 'barrete', corChapeu: 0x7a1f2e, cinto: 0xe8c14a, gola: true, botoes: 0xe8c14a, manto: 0x5a1a4a, bigode: 0x6a4a2a},
  // colonial
  padre:       {roupa: 0x16161a, pele: 0xf2c8a0, cabelo: 0x5a4a3a, cinto: 0x8a1f2e, vestido: true, gola: true, botoes: 0xe8e4dc},
  tropeiro:    {roupa: 0x9a6a3a, pele: 0xc98a5a, chapeu: 'chapeu-largo', corChapeu: 0x5a3a1e, cinto: 0x2a1a10, bigode: 0x2a1a10, lenco: 0xc8281e},
  'senhora-colonial': {roupa: 0x2a6a9a, pele: 0xf2c8a0, vestido: true, chapeu: 'chapeu-dama', corChapeu: 0xf2ead8, fita: 0x2a6a9a, flor: 0xffd23f, cabelo: 0x2a1a10, cinto: 0xf6f1e6, gola: true},
  quitandeira: {roupa: 0xf2ead8, pele: 0x8d5733, vestido: true, chapeu: 'bandana', corChapeu: 0xe8742a, cinto: 0x2f8a4a, bolsa: 0xd9b868},
  'soldado-colonial': {roupa: 0x1f3f7a, pele: 0xe3b48a, chapeu: 'bicorne', cinto: 0xf6f1e6, botoes: 0xe8c14a, lanca: true, gola: true},
  // vitoriana
  cavalheiro:  {roupa: 0x22222a, pele: 0xf2c8a0, chapeu: 'cartola', corChapeu: 0x15151c, cinto: 0x3a3a44, gola: true, botoes: 0xd9b24a, bigode: 0x4a2f1c, bengala: true, punho: 0xf6f1e6},
  'dama-vitoriana': {roupa: 0x6a2a4a, pele: 0xf2c8a0, vestido: true, chapeu: 'chapeu-dama', corChapeu: 0x3a1a2a, flor: 0xf2ead8, cabelo: 0x8a5a2a, cinto: 0x2a1a2a, gola: true},
  jornaleiro:  {roupa: 0x6a5a44, pele: 0xf0c49a, chapeu: 'boina', corChapeu: 0x4a4a52, cinto: 0x2a1a10, jornais: true, escala: 0.86},
  operario:    {roupa: 0x3a4a5a, pele: 0xe3b48a, chapeu: 'boina', corChapeu: 0x2a2a30, cinto: 0x6a4a2a, bigode: 0x2a1a10, avental: 0x4a3a2a},
  'policial-vitoriano': {roupa: 0x15192a, pele: 0xf2c8a0, chapeu: 'capacete-policial', cinto: 0x0e0e14, botoes: 0xd9d9e0, bigode: 0x6a4a2a, gola: false},
  // futuro
  robo:        {roupa: 0xb8c0cc, pele: 0xc8d0dc, chapeu: 'antena', corVisor: 0x3af0ff, iris: 0x3af0ff, cinto: 0x3a4250, botoes: 0x3af0ff, bota: 0x5a6270, metal: true},
  'cidada-futuro': {roupa: 0x2a2a44, pele: 0xd9a77c, chapeu: 'visor', corVisor: 0xff3ad0, cabelo: 0x6a3af0, cinto: 0x111118, neon: 0xff3ad0},
  entregador:  {roupa: 0xe8f0f8, pele: 0x8d5733, chapeu: 'visor', corVisor: 0x3af0ff, cabelo: 0x111111, cinto: 0x2a2a3a, neon: 0x3af0ff, mochila: 0x2a7aff},
  // oriental
  'dama-japonesa': {roupa: 0xc8284a, pele: 0xf2d0b0, vestido: true, chapeu: 'coque', cabelo: 0x0a0a0a, obi: 0xe8c14a, palito: 0x2a2a2a, flor: 0xffffff},
  'monge-budista': {roupa: 0xe8742a, pele: 0xe3b48a, vestido: true, cinto: 0xb8421e, manto: 0xd85a1e},
  'mercador-oriental': {roupa: 0x2a4a6a, pele: 0xe3b48a, chapeu: 'conico', cinto: 0x8a6a3a, bigode: 0x111111, bolsa: 0x8a6a3a},
  samurai:     {roupa: 0x1c1c2a, pele: 0xe3b48a, chapeu: 'kabuto', corChapeu: 0x1a1a22, cinto: 0xb8281e, espada: true, bigode: 0x111111, manto: 0x7a1f2e},
  // PROTAGONISTAS novos: viajantes no tempo (o "voce" dos videos que acordam em outra epoca)
  viajante:    {roupa: 0x6a3a1e, pele: 0xf0c49a, chapeu: 'goggles', cabelo: 0x3a2412, cinto: 0x2a1a10, mochila: 0x3a5a3a, lenco: 0xc8281e, botoes: 0xd9b24a, brava: true},
  'viajante-f': {roupa: 0x1f6a7a, pele: 0xe3b48a, chapeu: 'rabo', cabelo: 0x5a2a12, cinto: 0x2a1a10, bolsa: 0x8a4a2a, lenco: 0xe8c14a, botoes: 0xe8e4dc},
  estudante:   {roupa: 0xe8b830, pele: 0xc98a5a, chapeu: 'bone', corChapeu: 0x2a4aa8, cabelo: 0x111111, cinto: 0x2a2a3a, mochila: 0xc8281e},
});

// ================================================================ utilidades das cidades
function pedraTex(base, linhas, tam) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const n = tam || 16;
    for (let y = 0; y < h; y += n) for (let x = (y / n) % 2 ? -n / 2 : 0; x < w; x += n * 1.4) {
      g.fillStyle = `rgba(${linhas},${0.08 + rnd() * 0.16})`; g.beginPath(); g.ellipse(x + n * 0.7, y + n / 2, n * 0.62, n * 0.42, 0, 0, 7); g.fill();
      g.strokeStyle = `rgba(${linhas},0.35)`; g.lineWidth = 2; g.stroke();
    }
  });
}
function chaoTex(a, tex, rep, w, d, z, cor) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rep[0], rep[1]);
  try { tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); } catch (e) {}
  const m = mesh(new THREE.BoxGeometry(w, 0.3, d), new THREE.MeshStandardMaterial({map: tex, color: cor || 0xffffff, roughness: 0.95}), 0, -0.15, z, a.g); m.receiveShadow = true; return m;
}
function janela(a, x, y, z, side, w, h, vidro, moldura) {
  const jx = x - side * 0.02;
  mesh(new THREE.BoxGeometry(0.08, h + 0.16, w + 0.16), M(moldura), jx, y, z, a.g);
  mesh(new THREE.BoxGeometry(0.1, h, w), vidro.isMaterial ? vidro : B(vidro), jx - side * 0.01, y, z, a.g);
}
// figurantes de fundo: gente andando pela rua (nao fazem parte da historia nem da presenca)
function gentePasseando(a, papeis, n, faixa, z0, z1, esc) {
  for (let i = 0; i < n; i++) {
    const o = variar3d(papel(papeis[i % papeis.length]), Math.floor(i / papeis.length));
    const c = personagem('fundo-' + a.nome + '-' + i, o);
    const x = faixa[i % faixa.length] + rr(-0.4, 0.4), ida = i % 2 === 0, vel = rr(0.55, 0.9), fase = rnd() * 40, L = z0 - z1;
    c.scale.multiplyScalar(esc || 0.82); a.g.add(c);
    a.anim.push(t => {
      const s = ((t * vel + fase) % (2 * L)), k = s < L ? s : 2 * L - s, z = ida ? z0 - k : z1 + k;
      const dir = (s < L) === ida ? -1 : 1;
      c.position.set(x, Math.abs(Math.sin(t * 6 + fase)) * 0.05, z);
      c.rotation.y = dir < 0 ? Math.PI : 0;
      const d = c.userData; if (d.bracos) { d.bracos[0].rotation.x = Math.sin(t * 6 + fase) * 0.5; d.bracos[1].rotation.x = -Math.sin(t * 6 + fase) * 0.5; }
    });
  }
}
function lampiao(a, x, z, cor, alt) {
  const h = alt || 3.6;
  mesh(new THREE.CylinderGeometry(0.07, 0.1, h, 8), M(0x1a1a1e, {metalness: 0.4}), x, h / 2, z, a.g);
  mesh(new THREE.BoxGeometry(0.42, 0.5, 0.42), new THREE.MeshBasicMaterial({color: cor || 0xffd080}), x, h + 0.2, z, a.g);
  mesh(new THREE.ConeGeometry(0.36, 0.3, 4), M(0x1a1a1e), x, h + 0.6, z, a.g).rotation.y = Math.PI / 4;
  brilho(cor || 0xffb050, 1.9, x, h + 0.2, z, a.g);
}
function arvoreCopa(a, x, z, h, cores, esc) {
  mesh(new THREE.CylinderGeometry(0.16, 0.26, h, 7), M(0x5a3a22), x, h / 2, z, a.g).castShadow = true;
  for (let i = 0; i < 5; i++) { const s = mesh(new THREE.SphereGeometry((esc || 1) * rr(0.9, 1.4), 10, 8), M(pick(cores), {flatShading: true}), x + rr(-0.8, 0.8), h + rr(-0.3, 0.8), z + rr(-0.8, 0.8), a.g); s.castShadow = true; }
}
const RUA = {P: [0.2, 4.0], alvo: [0, 1.6, -14], slots: [[-1.8, -2], [2.0, -4.5], [-2.4, -7]]};

// ================================================================ 1) CIDADE MEDIEVAL
(function () {
  const a = novoAmb('cidade-medieval', cfgDia({ceu: [0x4a5266, 0x8a92a2, 0xc8ccd2], fundo: 0xb4b8c0, nevoa: [0xb4b8c0, 22, 110], dirCor: 0xe8e2d6, dirInt: 0.8,
    hemiCeu: 0xc8ccd8, hemiChao: 0x5a5040, hemiInt: 1.05}));
  a.g.position.x = 5400;
  chaoTex(a, pedraTex('#7a756c', '30,28,24', 18), [4, 14], 40, 90, -30);
  { const tr = pedraTex('#6a655c', '20,18,16', 12); tr.wrapS = tr.wrapT = THREE.RepeatWrapping; tr.repeat.set(1, 14); try { tr.anisotropy = 8; } catch (e) {} mesh(new THREE.BoxGeometry(5.2, 0.04, 90), new THREE.MeshStandardMaterial({map: tr, roughness: 1}), 0, 0.02, -30, a.g); }
  for (let i = 0; i < 5; i++) { const p = mesh(new THREE.CylinderGeometry(rr(0.5, 1.1), rr(0.5, 1.1), 0.02, 14), new THREE.MeshStandardMaterial({color: 0x4a4436, roughness: 0.2, metalness: 0.1}), rr(-2, 2), 0.04, -rr(2, 30), a.g); p.scale.z = rr(1, 2); }
  const PAREDES = [0xece2c8, 0xe2d6b8, 0xf0e8d6, 0xd8cca8, 0xe8dcc0], VIGA = 0x3e2a18;
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 9; i++) {
    const w = 4.6 + rnd() * 1.6, h1 = 3.0, h2 = 2.8 + rnd() * 1.4, z = 6 - i * 5.6, x = side * (5.6 + w / 2), parede = pick(PAREDES);
    const t1 = mesh(new THREE.BoxGeometry(w, h1, 4.6), M(parede), x, h1 / 2, z, a.g); t1.castShadow = true; t1.receiveShadow = true;
    const x2 = x - side * 0.35;                                         // andar de cima avanca sobre a rua (enxaimel)
    mesh(new THREE.BoxGeometry(w + 0.2, h2, 4.8), M(parede), x2, h1 + h2 / 2, z, a.g).castShadow = true;
    const fx = x - side * (w / 2 + 0.02), fx2 = x2 - side * (w / 2 + 0.12);
    for (const [xx, yb, hh] of [[fx, 0, h1], [fx2, h1, h2]]) {                 // vigas de madeira na fachada
      for (const dz of [-2.25, -0.75, 0.75, 2.25]) mesh(new THREE.BoxGeometry(0.1, hh, 0.16), M(VIGA), xx, yb + hh / 2, z + dz, a.g);
      mesh(new THREE.BoxGeometry(0.1, 0.16, 4.7), M(VIGA), xx, yb + hh - 0.08, z, a.g); mesh(new THREE.BoxGeometry(0.1, 0.16, 4.7), M(VIGA), xx, yb + 0.08, z, a.g);
      for (const s of [-1, 1]) { const d = mesh(new THREE.BoxGeometry(0.1, Math.hypot(hh, 1.5), 0.12), M(VIGA), xx, yb + hh / 2, z + s * 1.5, a.g); d.rotation.x = s * Math.atan2(1.5, hh); }
    }
    janela(a, fx2, h1 + h2 * 0.55, z - 1.5, side, 0.7, 0.9, 0x2a3040, VIGA); janela(a, fx2, h1 + h2 * 0.55, z + 1.5, side, 0.7, 0.9, i % 3 ? 0x2a3040 : 0xffc870, VIGA);
    janela(a, fx, 1.9, z + 1.4, side, 0.7, 0.8, 0x2a3040, VIGA);
    mesh(new THREE.BoxGeometry(0.1, 2.0, 1.1), M(0x4a2f1a), fx, 1.0, z - 0.9, a.g);
    const tel = mesh(new THREE.ConeGeometry((w + 0.8) * 0.74, 3.4 + rnd(), 4), M(pick([0x4a3a34, 0x5a3a2a, 0x3a3640]), {flatShading: true}), x2, h1 + h2 + 1.7, z, a.g); tel.rotation.y = Math.PI / 4; tel.scale.set(1, 1, 0.92); tel.castShadow = true;
    if (i % 3 === 1) { const ch = mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), M(0x6a5a52), x2 + side * 0.8, h1 + h2 + 2.4, z + 1, a.g); fumaca(a, x2 + side * 0.8 + a.g.position.x * 0, z + 1, 3); }
    if (i % 4 === 0) { const pl = mesh(new THREE.BoxGeometry(0.06, 0.6, 0.9), M(pick([0x8a1f1e, 0x1f3f7a, 0x2f6a3a])), fx - side * 0.7, 2.6, z + 2.3, a.g); mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), M(0x1a1a1a), fx - side * 0.35, 2.95, z + 2.3, a.g); }
  }
  // catedral gotica no fim da rua
  mesh(new THREE.BoxGeometry(9, 11, 7), M(0xb8b0a0), 0, 5.5, -40, a.g).castShadow = true;
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(2.6, 17, 2.6), M(0xaaa292), 3.6 * s, 8.5, -37.6, a.g); const p = mesh(new THREE.ConeGeometry(1.9, 6, 4), M(0x5a5a64, {flatShading: true}), 3.6 * s, 20, -37.6, a.g); p.rotation.y = Math.PI / 4; }
  const tri = mesh(new THREE.ConeGeometry(5.4, 4, 3), M(0xa8a090), 0, 13, -36.6, a.g); tri.scale.set(1, 1, 0.2); tri.rotation.z = 0;
  mesh(new THREE.CircleGeometry(1.5, 24), new THREE.MeshBasicMaterial({color: 0x6a8ad8}), 0, 8, -36.45, a.g); mesh(new THREE.TorusGeometry(1.5, 0.12, 6, 24), M(0x8a8272), 0, 8, -36.43, a.g);
  for (let k = 0; k < 8; k++) mesh(new THREE.BoxGeometry(0.06, 2.9, 0.04), M(0x8a8272), 0, 8, -36.42, a.g).rotation.z = k / 8 * Math.PI;
  mesh(new THREE.BoxGeometry(2, 3.6, 0.3), M(0x3a2414), 0, 1.8, -36.4, a.g); mesh(new THREE.CylinderGeometry(1, 1, 0.3, 16, 1, false, 0, Math.PI), M(0x3a2414), 0, 3.6, -36.4, a.g).rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  brilho(0xffd890, 3, 0, 8, -36, a.g);
  // poco, barraca da feira, carroca, feno, barris, varal
  mesh(new THREE.CylinderGeometry(1.1, 1.2, 1.0, 14), M(0x8a8478), 0, 0.5, -16, a.g); mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.1, 14), B(0x1a2a3a), 0, 0.98, -16, a.g);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), M(0x4a2f1a), 0.9 * s, 1.6, -16, a.g);
  const tp = mesh(new THREE.ConeGeometry(1.6, 1.0, 4), M(0x5a3a2a), 0, 3.1, -16, a.g); tp.rotation.y = Math.PI / 4;
  for (const [x, z, c1, c2] of [[-3.4, -8.5, 0xb81e1e, 0xf2ead8], [3.4, -11, 0x1f4f8a, 0xf2e8c8]]) {
    for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.34, 0.06, 1.6), M(k % 2 ? c1 : c2), x - 0.85 + k * 0.34, 2.3, z, a.g);
    mesh(new THREE.BoxGeometry(2.0, 0.8, 1.2), M(0x6b4423), x, 0.4, z, a.g);
    for (let k = 0; k < 5; k++) mesh(new THREE.SphereGeometry(0.16, 8, 6), M(pick([0xd83a2a, 0xe8c14a, 0x6aa84a, 0xe8742a])), x - 0.7 + k * 0.35, 0.92, z + rr(-0.3, 0.3), a.g);
    for (const dx of [-0.95, 0.95]) mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.3, 5), M(0x4a2f1a), x + dx, 1.15, z - 0.6, a.g);
  }
  const car = new THREE.Group(); mesh(new THREE.BoxGeometry(1.4, 0.5, 2.4), M(0x7a5232), 0, 0.9, 0, car); for (const s of [-1, 1]) { const r = mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 12), M(0x4a2f1a), 0.78 * s, 0.55, 0.3, car); r.rotation.z = Math.PI / 2; }
  mesh(new THREE.BoxGeometry(1.2, 0.5, 1.8), M(0xd9c070), 0, 1.35, 0, car); car.position.set(-3.6, 0, -21); car.rotation.y = 0.3; a.g.add(car);
  barril(a, 3.0, 0.5); barril(a, -2.9, -2.4, 1.1); caixote(a, 3.2, -3.8, 0.9, 0.9, 0.3);
  for (const [x, z] of [[-4.2, -3], [4.2, -14], [-4.2, -24]]) tocha(a, x, 2.4, z);
  mesh(new THREE.BoxGeometry(9, 0.02, 0.02), M(0x3a2a1a), 0, 5.2, -6, a.g); for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.6, 0.8, 0.03), M(pick([0xf2ead8, 0xc8d0d8, 0xd8c8a0])), -3 + k * 1.2, 4.75, -6, a.g);
  aves(a, 6, 0, 16, -22, 14, 0x15151a); nuvens(a, 0xa0a4ac, 10);
  gentePasseando(a, ['campones', 'aldea', 'monge', 'mercador', 'ferreiro', 'camponesa'], 6, [-3.4, 3.4], 2, -30);
  a.pontos = {igreja: {pos: [0, 8, -36.4], cam: [0, 3.2, 2]}, poco: {pos: [0, 1.2, -16], cam: [2.4, 2.6, -9]}, mercado: {pos: [-3.4, 1.2, -8.5], cam: [0.6, 2.4, -2]}};
  stdCams(a, RUA.P, RUA.alvo, RUA.slots);
})();

// ================================================================ 2) CIDADE COLONIAL
(function () {
  const a = novoAmb('cidade-colonial', cfgDia({ceu: [0x1f6fd8, 0x6ab4f0, 0xe8f6ff], fundo: 0xa8d8ff, nevoa: [0xd8eeff, 40, 160], dirCor: 0xfff4dc, dirInt: 1.3, hemiChao: 0x8a7a50}));
  a.g.position.x = 5700;
  chaoTex(a, pedraTex('#a89878', '60,48,30', 20), [4, 14], 40, 90, -30);
  const CORES = [0xf6f2e8, 0xf2d27a, 0x8ac0d8, 0xe8a8a0, 0xa8d0a0, 0xf6f2e8, 0xe8c8f0], MOLD = [0x2a5aa8, 0x2a7a4a, 0xd8a030, 0x7a2a2a];
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 9; i++) {
    const w = 5 + rnd() * 1.4, andares = rnd() < 0.55 ? 2 : 1, hh = andares * 3.1, z = 6 - i * 5.6, x = side * (5.8 + w / 2), cor = pick(CORES), mold = pick(MOLD);
    mesh(new THREE.BoxGeometry(w, hh, 4.8), M(cor), x, hh / 2, z, a.g).castShadow = true;
    const fx = x - side * (w / 2 + 0.02);
    mesh(new THREE.BoxGeometry(0.06, 0.9, 4.82), M(mold), fx, 0.45, z, a.g);                                  // barrado
    mesh(new THREE.BoxGeometry(0.12, 0.22, 4.9), M(0xf6f2e8), fx, hh - 0.1, z, a.g);                          // cimalha
    for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.1, hh, 0.24), M(0xf6f2e8), fx, hh / 2, z + s * 2.3, a.g); // cunhais
    for (let r = 0; r < andares; r++) for (const dz of [-1.5, 0, 1.5]) {
      if (r === 0 && dz === 0) { mesh(new THREE.BoxGeometry(0.1, 2.2, 1.0), M(0x5a3a22), fx, 1.1, z, a.g); mesh(new THREE.BoxGeometry(0.12, 2.4, 1.2), M(mold), fx + side * 0.01, 1.15, z, a.g); continue; }
      janela(a, fx, 1.6 + r * 3.1, z + dz, side, 0.75, 1.25, r ? 0x3a5a7a : 0x2a3a4a, mold);
      if (r === 1) { mesh(new THREE.BoxGeometry(0.5, 0.06, 1.0), M(0x2a2a2a), fx - side * 0.25, 1.05 + 3.1, z + dz, a.g); for (let k = 0; k < 5; k++) mesh(new THREE.BoxGeometry(0.03, 0.55, 0.03), M(0x1a1a1a), fx - side * 0.48, 1.35 + 3.1, z + dz - 0.4 + k * 0.2, a.g); }
    }
    const tl = mesh(new THREE.ConeGeometry((w + 0.6) * 0.72, 1.6, 4), M(0xb8582a, {flatShading: true}), x, hh + 0.8, z, a.g); tl.rotation.y = Math.PI / 4; tl.scale.set(1, 1, 0.95);
    if (i % 3 === 0) for (let k = 0; k < 3; k++) mesh(new THREE.SphereGeometry(0.22, 8, 6), M(pick([0xff6b8a, 0xffd23f, 0xe8742a])), fx - side * 0.3, 1.05 + 3.1 + 0.1, z - 0.5 + k * 0.5, a.g);
  }
  // igreja barroca com duas torres
  mesh(new THREE.BoxGeometry(10, 9, 6), M(0xf6f2e8), 0, 4.5, -40, a.g).castShadow = true;
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(2.6, 14, 2.6), M(0xf6f2e8), 4.2 * s, 7, -37.4, a.g); mesh(new THREE.SphereGeometry(1.25, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2a6a9a), 4.2 * s, 14, -37.4, a.g);
    mesh(new THREE.BoxGeometry(1.0, 1.4, 0.1), B(0x2a2a3a), 4.2 * s, 11.5, -36.05, a.g); mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), M(0xd9b24a), 4.2 * s, 15.6, -37.4, a.g); mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), M(0xd9b24a), 4.2 * s, 15.8, -37.4, a.g);
    for (const yy of [0.2, 7]) mesh(new THREE.BoxGeometry(2.8, 0.3, 2.8), M(0xd8a030), 4.2 * s, yy, -37.4, a.g); }
  const fr = mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.5, 24, 1, false, 0, Math.PI), M(0xf6f2e8), 0, 9, -37.1, a.g); fr.rotation.set(Math.PI / 2, 0, Math.PI / 2 + Math.PI / 2);
  mesh(new THREE.TorusGeometry(3.6, 0.15, 6, 24, Math.PI), M(0xd8a030), 0, 9, -36.8, a.g);
  mesh(new THREE.BoxGeometry(2.2, 4, 0.3), M(0x5a3a22), 0, 2, -36.9, a.g); mesh(new THREE.BoxGeometry(2.6, 4.4, 0.2), M(0x2a5aa8), 0, 2.2, -36.95, a.g);
  mesh(new THREE.CircleGeometry(0.9, 20), B(0x3a5a8a), 0, 6.3, -36.85, a.g); mesh(new THREE.BoxGeometry(0.12, 1.0, 0.1), M(0xd9b24a), 0, 11.2, -37.0, a.g); mesh(new THREE.BoxGeometry(0.6, 0.12, 0.1), M(0xd9b24a), 0, 11.4, -37.0, a.g);
  // chafariz, palmeiras, carroca, lampioes
  mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.6, 18), M(0xe8e0d0), 0, 0.3, -16, a.g); mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.4, 18), new THREE.MeshStandardMaterial({color: 0x3a9ad8, roughness: 0.15}), 0, 0.55, -16, a.g);
  mesh(new THREE.CylinderGeometry(0.25, 0.35, 2.0, 10), M(0xe8e0d0), 0, 1.3, -16, a.g); mesh(new THREE.CylinderGeometry(0.8, 0.4, 0.3, 14), M(0xe8e0d0), 0, 2.4, -16, a.g);
  const agua = []; for (let k = 0; k < 8; k++) agua.push(mesh(new THREE.SphereGeometry(0.08, 6, 4), new THREE.MeshBasicMaterial({color: 0xbfe6ff}), 0, 2.6, -16, a.g));
  a.anim.push(t => agua.forEach((g, k) => { const u = (t * 0.9 + k / 8) % 1, an = k / 8 * Math.PI * 2; g.position.set(Math.cos(an) * u * 0.9, 2.6 + u * 0.6 - u * u * 2.2, -16 + Math.sin(an) * u * 0.9); }));
  for (const [x, z] of [[-3.8, -26], [3.8, -30], [-3.6, -5.5], [3.9, -19]]) palmeira(a, x, z, rr(4.5, 6), rr(-0.15, 0.15));
  for (const [x, z] of [[-3.6, -11], [3.6, -24], [3.6, -2]]) lampiao(a, x, z, 0xffd890, 3.2);
  const car = new THREE.Group(); mesh(new THREE.BoxGeometry(1.5, 0.5, 2.6), M(0x8a5a32), 0, 0.95, 0, car); for (const s of [-1, 1]) { const r = mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 12), M(0x5a3a1e), 0.82 * s, 0.6, 0.2, car); r.rotation.z = Math.PI / 2; }
  for (let k = 0; k < 6; k++) mesh(new THREE.SphereGeometry(0.22, 8, 6), M(pick([0xe8c14a, 0x6aa84a, 0xe8742a])), rr(-0.5, 0.5), 1.35, rr(-0.9, 0.9), car);
  car.position.set(3.5, 0, -8); car.rotation.y = -0.25; a.g.add(car);
  barril(a, -3.0, 0.5); caixote(a, 3.1, 1.2, 0.8, 0.8, 0.2);
  sol(a, 50, 60, -110, 0xfff6d0, 7); nuvens(a, 0xffffff, 7); aves(a, 5, 0, 18, -20, 14, 0xffffff);
  gentePasseando(a, ['senhora-colonial', 'tropeiro', 'padre', 'quitandeira', 'soldado-colonial', 'cidadao'], 6, [-3.3, 3.3], 2, -30);
  a.pontos = {igreja: {pos: [0, 7, -37], cam: [0, 3.0, 1]}, chafariz: {pos: [0, 2, -16], cam: [2.2, 2.6, -9]}};
  stdCams(a, RUA.P, RUA.alvo, RUA.slots);
})();

// ================================================================ 3) CIDADE VITORIANA (1850-1930)
(function () {
  const a = novoAmb('cidade-vitoriana', cfgDia({ceu: [0x5a5a64, 0x9a8e7e, 0xd2c4ac], fundo: 0xc4b6a0, nevoa: [0xc4b6a0, 28, 140], dirCor: 0xffe2b8, dirInt: 0.9,
    hemiCeu: 0xd8c8b0, hemiChao: 0x4a3a2a, hemiInt: 1.0}));
  a.g.position.x = 6000;
  chaoTex(a, pedraTex('#5a5650', '20,20,22', 14), [4, 16], 40, 90, -30);
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(1.8, 0.18, 90), M(0x8a8478), 3.5 * s, 0.09, -30, a.g); mesh(new THREE.BoxGeometry(0.08, 0.05, 90), M(0x9a9aa4, {metalness: 0.7, roughness: 0.3}), 0.7 * s, 0.03, -30, a.g); }
  const TIJOLO = [0x8a3a2a, 0x7a4a3a, 0x6a2a22, 0x9a5a3a, 0x5a3a30], LOJA = [0x1f4f3a, 0x7a1f2e, 0x1f2f5a, 0x3a2a1a];
  const toldo = [0xb81e2e, 0x2f6f4e, 0xe8c14a, 0x2a4a8a];
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 9; i++) {
    const w = 5 + rnd() * 1.2, andares = 3 + Math.floor(rnd() * 2), hh = andares * 2.8 + 0.6, z = 6 - i * 5.6, x = side * (6.6 + w / 2), cor = pick(TIJOLO);
    mesh(new THREE.BoxGeometry(w, hh, 4.9), M(cor), x, hh / 2, z, a.g).castShadow = true;
    const fx = x - side * (w / 2 + 0.02);
    mesh(new THREE.BoxGeometry(0.14, 3.0, 4.92), M(pick(LOJA)), fx, 1.5, z, a.g);                             // fachada da loja
    mesh(new THREE.BoxGeometry(0.12, 1.6, 3.2), new THREE.MeshStandardMaterial({color: 0xf0d8a0, emissive: 0x3a2a10, roughness: 0.2}), fx - side * 0.02, 1.4, z, a.g);
    const tc = pick(toldo); for (let k = 0; k < 6; k++) { const tt = mesh(new THREE.BoxGeometry(1.2, 0.05, 0.55), M(k % 2 ? tc : 0xf2ead8), fx - side * 0.55, 2.85, z - 1.4 + k * 0.56, a.g); tt.rotation.z = side * 0.35; }
    for (let r = 1; r < andares; r++) {
      mesh(new THREE.BoxGeometry(0.16, 0.14, 4.94), M(0xe8e0d0), fx, 0.3 + r * 2.8 + 0.1, z, a.g);
      for (const dz of [-1.6, 0, 1.6]) janela(a, fx, 1.7 + r * 2.8, z + dz, side, 0.75, 1.5, (i + r + dz) % 4 === 0 ? 0xffd890 : 0x2a3036, 0xf2ead8);
    }
    mesh(new THREE.BoxGeometry(0.4, 0.4, 5.1), M(0xe8e0d0), fx + side * 0.1, hh, z, a.g);                    // cornija
    for (const dz of [-1.6, 1.4]) { mesh(new THREE.BoxGeometry(0.7, 1.8, 0.9), M(0x6a3a2a), x + side * 0.6, hh + 0.9, z + dz, a.g); for (let k = 0; k < 2; k++) mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), M(0x8a5a3a), x + side * 0.6, hh + 1.95, z + dz - 0.2 + k * 0.4, a.g); }
    if (i % 2 === 0) fumaca(a, x + side * 0.6, z - 1.6, 3);
    if (i % 3 === 1) { const pl = mesh(new THREE.BoxGeometry(0.06, 0.5, 2.6), M(0x1a1a1a), fx - side * 0.04, 3.4, z, a.g); mesh(new THREE.BoxGeometry(0.07, 0.36, 2.4), M(0xd9b24a), fx - side * 0.06, 3.4, z, a.g); }
  }
  // torre do relogio
  mesh(new THREE.BoxGeometry(5, 22, 5), M(0xc8b890), 0, 11, -42, a.g).castShadow = true;
  for (let k = 0; k < 5; k++) mesh(new THREE.BoxGeometry(5.3, 0.3, 5.3), M(0xe8dcc0), 0, 2 + k * 4.2, -42, a.g);
  mesh(new THREE.BoxGeometry(5.6, 5.6, 5.6), M(0xb8a880), 0, 24.6, -42, a.g);
  const relogio = new THREE.MeshStandardMaterial({color: 0xfff6dc, emissive: 0x8a7a40, roughness: 0.4});
  mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.2, 30), relogio, 0, 24.6, -39.15, a.g).rotation.x = Math.PI / 2;
  const pont1 = mesh(new THREE.BoxGeometry(0.14, 1.6, 0.06), M(0x1a1a1a), 0, 25.2, -38.95, a.g), pont2 = mesh(new THREE.BoxGeometry(0.16, 1.1, 0.06), M(0x1a1a1a), 0, 24.95, -38.93, a.g);
  pont1.geometry.translate(0, 0.6, 0); pont2.geometry.translate(0, 0.45, 0); pont1.position.y = 24.6; pont2.position.y = 24.6;
  a.anim.push(t => { pont1.rotation.z = -t * 0.3; pont2.rotation.z = -t * 0.025 - 1; });
  const ptr = mesh(new THREE.ConeGeometry(4.2, 7, 4), M(0x3a4a4a, {flatShading: true}), 0, 31, -42, a.g); ptr.rotation.y = Math.PI / 4;
  brilho(0xffe6a0, 5, 0, 24.6, -38.9, a.g);
  // bonde, lampioes a gas, banca de jornal, caixa de correio
  const bonde = new THREE.Group();
  mesh(new THREE.BoxGeometry(2.3, 2.4, 6.5), M(0x8a1f1e), 0, 1.6, 0, bonde).castShadow = true; mesh(new THREE.BoxGeometry(2.4, 0.2, 6.7), M(0xe8c14a), 0, 2.9, 0, bonde);
  for (let k = 0; k < 5; k++) for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.05, 0.8, 0.9), new THREE.MeshStandardMaterial({color: 0xffe0a0, emissive: 0x4a3a10}), 1.17 * s, 2.0, -2.4 + k * 1.2, bonde);
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 5), M(0x1a1a1a), 0, 4.0, -1.5, bonde).rotation.x = 0.5;
  bonde.position.set(-0.7, 0, -28); a.g.add(bonde); a.anim.push(t => { bonde.position.z = -36 + ((t * 1.4) % 26); });
  for (const [x, z] of [[-3.0, -3], [3.0, -9], [-3.0, -15], [3.0, -21], [-3.0, -27]]) lampiao(a, x, z, 0xffcf80, 3.8);
  const banca = new THREE.Group(); mesh(new THREE.BoxGeometry(1.8, 2.2, 1.2), M(0x1f4f3a), 0, 1.1, 0, banca); mesh(new THREE.BoxGeometry(2.1, 0.15, 1.5), M(0x1a1a1a), 0, 2.3, 0, banca);
  for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.4, 0.5, 0.04), M(pick([0xf2ead8, 0xe8e0c0])), -0.6 + (k % 3) * 0.6, 0.9 + Math.floor(k / 3) * 0.6, 0.62, banca);
  banca.position.set(3.4, 0, -4.5); banca.rotation.y = -Math.PI / 2; a.g.add(banca);
  mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.3, 12), M(0xb81e1e), -3.3, 0.65, 0.6, a.g); mesh(new THREE.SphereGeometry(0.33, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0xb81e1e), -3.3, 1.3, 0.6, a.g);
  aves(a, 5, 0, 16, -22, 14, 0x2a2a30); nuvens(a, 0x8a8478, 10);
  gentePasseando(a, ['cavalheiro', 'dama-vitoriana', 'jornaleiro', 'operario', 'policial-vitoriano', 'cidada'], 6, [-3.5, 3.5], 2, -32);
  a.pontos = {relogio: {pos: [0, 24.6, -39], cam: [0, 4.0, 2]}, bonde: {pos: [-0.7, 1.6, -24], cam: [2.6, 2.4, -10]}, banca: {pos: [3.4, 1.4, -4.5], cam: [0, 2.2, 1.5]}};
  stdCams(a, RUA.P, RUA.alvo, RUA.slots);
})();

// ================================================================ 4) CIDADE DO FUTURO (2050-2200)
(function () {
  const a = novoAmb('cidade-futuro', cfgDia({ceu: [0x140c34, 0x5a2a7a, 0xf08a6a], fundo: 0x2a1a4a, nevoa: [0x3a2a5a, 30, 170], dirCor: 0xffb8d8, dirInt: 0.85, dirPos: [-12, 10, 10],
    hemiCeu: 0x8a6ad8, hemiChao: 0x1a2a4a, hemiInt: 1.1, semEstrelas: false}));
  a.g.position.x = 6300;
  const chaoT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#1c2030'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,160,255,0.25)'; g.lineWidth = 2; for (let k = 0; k < w; k += 32) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); } });
  chaoTex(a, chaoT, [6, 14], 40, 90, -30);
  for (const s of [-1, 0, 1]) mesh(new THREE.BoxGeometry(0.12, 0.03, 90), new THREE.MeshBasicMaterial({color: s ? 0x3af0ff : 0xff3ad0}), s * 2.2, 0.03, -30, a.g);
  const VIDRO = [0x1a3a5a, 0x2a2a4a, 0x16405a, 0x3a2a5a], NEONS = [0x3af0ff, 0xff3ad0, 0xffd23f, 0x7aff6a];
  const holoTex = ['2100', 'NOVA', 'IA', 'ROBÔ', 'MARTE'].map(txt => canvasTex(256, 128, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.strokeStyle = '#3af0ff'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#ff6af0'; g.font = 'bold 72px sans-serif'; g.textAlign = 'center'; g.fillText(txt, w / 2, 92); }));
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 8; i++) {
    const w = 5 + rnd() * 2, hh = 12 + rnd() * 22, z = 6 - i * 6.2, x = side * (7 + w / 2), neon = pick(NEONS);
    const torre = mesh(new THREE.BoxGeometry(w, hh, 5), new THREE.MeshStandardMaterial({color: pick(VIDRO), roughness: 0.15, metalness: 0.6}), x, hh / 2, z, a.g); torre.castShadow = true;
    const fx = x - side * (w / 2 + 0.03);
    for (let y = 2.5; y < hh; y += 2.2) mesh(new THREE.BoxGeometry(0.05, 0.08, 5.02), new THREE.MeshBasicMaterial({color: neon}), fx, y, z, a.g);
    for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.06, 0.6, 0.5), new THREE.MeshBasicMaterial({color: rnd() < 0.5 ? 0xfff0c0 : 0x8ad8ff}), fx - side * 0.01, rr(2, hh - 1), z + rr(-2, 2), a.g);
    mesh(new THREE.BoxGeometry(0.15, 2.8, 4.0), new THREE.MeshStandardMaterial({color: 0x8ad8ff, emissive: 0x1a3a5a, roughness: 0.1, transparent: true, opacity: 0.7}), fx - side * 0.02, 1.4, z, a.g);
    if (i % 2 === 0) { const ht = mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshBasicMaterial({map: pick(holoTex), transparent: true, opacity: 0.9, side: THREE.DoubleSide}), fx - side * 1.2, 6 + rnd() * 6, z, a.g); ht.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      a.anim.push(t => { ht.material.opacity = 0.75 + 0.2 * Math.sin(t * 6 + z); }); brilho(0xff6af0, 4, fx - side * 1.3, ht.position.y, z, a.g); }
    for (let k = 0; k < 4; k++) mesh(new THREE.SphereGeometry(rr(0.6, 1.0), 8, 6), M(pick([0x3a9a4a, 0x4aba5a, 0x2a7a3a]), {flatShading: true}), x + rr(-1.5, 1.5), hh + 0.4, z + rr(-1.5, 1.5), a.g);
  }
  // torre-anel no fim da avenida
  mesh(new THREE.CylinderGeometry(1.4, 2.2, 40, 16), new THREE.MeshStandardMaterial({color: 0xd8e0f0, metalness: 0.7, roughness: 0.2}), 0, 20, -52, a.g);
  for (const [y, r, c] of [[14, 6, 0x3af0ff], [24, 4.6, 0xff3ad0], [33, 3.2, 0x3af0ff]]) { const anel = mesh(new THREE.TorusGeometry(r, 0.35, 8, 40), new THREE.MeshBasicMaterial({color: c}), 0, y, -52, a.g); anel.rotation.x = Math.PI / 2;
    a.anim.push(t => { anel.rotation.z = t * 0.4 * (r > 5 ? 1 : -1); }); brilho(c, r * 2.6, 0, y, -52, a.g); }
  // carros voadores e drones
  for (let k = 0; k < 7; k++) {
    const carro = new THREE.Group(), cor = pick([0xf2f2f8, 0xe8c14a, 0xd82a4a, 0x2a7aff]);
    const corpo = mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.5, 1.6, 6, 12) : new THREE.CylinderGeometry(0.5, 0.5, 2.2, 12), new THREE.MeshStandardMaterial({color: cor, metalness: 0.5, roughness: 0.25}), 0, 0, 0, carro); corpo.rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({color: 0x8ad8ff, roughness: 0.05, transparent: true, opacity: 0.75}), 0, 0.3, 0.2, carro);
    mesh(new THREE.BoxGeometry(0.5, 0.08, 0.1), new THREE.MeshBasicMaterial({color: 0xff3a3a}), 0, 0, -1.3, carro); brilho(0x3af0ff, 1.6, 0, -0.5, 0, carro);
    a.g.add(carro); const alt = rr(6, 18), faixa = rr(-4, 4), vel = rr(3, 7) * (k % 2 ? 1 : -1), fase = rnd() * 80;
    a.anim.push(t => { const z = -50 + (((t * vel + fase) % 70) + 70) % 70; carro.position.set(faixa, alt + Math.sin(t + k) * 0.3, z); carro.rotation.y = vel > 0 ? 0 : Math.PI; });
  }
  for (const [x, z] of [[-3.6, -4], [3.6, -12], [-3.6, -20], [3.6, -28]]) { mesh(new THREE.BoxGeometry(1.4, 0.7, 1.4), M(0x3a3a4a), x, 0.35, z, a.g); arvoreCopa(a, x, z, 2.2, [0x3a9a4a, 0x5aba6a], 0.7); lampiao(a, x * 0.92, z + 3, 0x8af0ff, 4.0); }
  gentePasseando(a, ['cidada-futuro', 'robo', 'entregador', 'cidadao2', 'robo'], 6, [-3.2, 3.2], 2, -32);
  a.pontos = {torre: {pos: [0, 22, -52], cam: [0, 3.0, 3]}, carros: {pos: [0, 12, -24], cam: [2.0, 2.2, 0]}};
  stdCams(a, RUA.P, RUA.alvo, RUA.slots);
})();

// ================================================================ 5) CIDADE ORIENTAL (Japao/China feudal)
(function () {
  const a = novoAmb('cidade-oriental', cfgDia({ceu: [0x3a7ad8, 0xf0c0c4, 0xfff0e4], fundo: 0xf0d8d0, nevoa: [0xf0dcd8, 28, 140], dirCor: 0xfff0e0, dirInt: 1.15, hemiChao: 0x7a6a50}));
  a.g.position.x = 6600;
  chaoTex(a, pedraTex('#c8b48e', '90,70,40', 26), [4, 12], 40, 90, -30);
  for (let k = 0; k < 16; k++) mesh(new THREE.BoxGeometry(1.4, 0.06, 0.9), M(0xa8a090), rr(-0.3, 0.3), 0.04, 4 - k * 2.2, a.g);
  const MAD = 0x4a2a1a, PAPEL = 0xf4ecd8;
  function telhadoCurvo(x, y, z, w, d, cor) {
    const t = mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 1.5, 4), M(cor, {flatShading: true}), x, y, z, a.g); t.rotation.y = Math.PI / 4; t.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
    mesh(new THREE.BoxGeometry(w + 1.0, 0.16, d + 1.0), M(cor), x, y - 0.68, z, a.g);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = mesh(new THREE.ConeGeometry(0.16, 0.6, 5), M(cor), x + sx * (w / 2 + 0.5), y - 0.45, z + sz * (d / 2 + 0.5), a.g); p.rotation.z = -sx * 0.7; }
  }
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 9; i++) {
    const w = 4.8 + rnd(), andares = rnd() < 0.4 ? 2 : 1, z = 6 - i * 5.6, x = side * (5.8 + w / 2);
    for (let r = 0; r < andares; r++) {
      const y0 = r * 3.0, ww = w - r * 0.8;
      mesh(new THREE.BoxGeometry(ww, 2.8, 4.4), M(PAPEL), x, y0 + 1.4, z, a.g).castShadow = true;
      const fx = x - side * (ww / 2 + 0.02);
      for (const dz of [-2.15, -0.72, 0.72, 2.15]) mesh(new THREE.BoxGeometry(0.12, 2.8, 0.14), M(r ? MAD : 0xa8281e), fx, y0 + 1.4, z + dz, a.g);
      for (let k = 1; k < 4; k++) mesh(new THREE.BoxGeometry(0.06, 0.04, 4.3), M(MAD), fx, y0 + k * 0.7, z, a.g);
      for (let k = -3; k <= 3; k++) mesh(new THREE.BoxGeometry(0.06, 2.7, 0.035), M(MAD), fx, y0 + 1.4, z + k * 0.6, a.g);
      telhadoCurvo(x, y0 + 3.4, z, ww, 4.4, pick([0x3a3a46, 0x2a3a3a, 0x4a3a3a]));
    }
    if (i % 2 === 0) { const nor = mesh(new THREE.BoxGeometry(0.04, 1.4, 1.1), M(pick([0x1f2f5a, 0x7a1f2e, 0xe8e0d0])), x - side * (w / 2 + 0.06), 2.0, z - 1.4, a.g); }
    const lt = mesh(new THREE.SphereGeometry(0.32, 12, 10), new THREE.MeshStandardMaterial({color: 0xe82a2a, emissive: 0x8a1010}), x - side * (w / 2 + 0.6), 2.5, z + 1.6, a.g); lt.scale.y = 1.3;
    mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 10), M(0x1a1a1a), x - side * (w / 2 + 0.6), 2.95, z + 1.6, a.g); brilho(0xff5030, 1.8, x - side * (w / 2 + 0.6), 2.5, z + 1.6, a.g);
  }
  // pagode de 5 andares
  for (let k = 0; k < 5; k++) { const ww = 6 - k * 0.9, y = k * 3.4; mesh(new THREE.BoxGeometry(ww, 2.6, ww), M(k ? 0xa8281e : 0xb8382a), 0, y + 1.3, -42, a.g).castShadow = true; telhadoCurvo(0, y + 3.0, -42, ww + 0.6, ww + 0.6, 0x2a3a3a); }
  mesh(new THREE.CylinderGeometry(0.1, 0.2, 4, 8), M(0xd9b24a, {metalness: 0.5}), 0, 18.6, -42, a.g); for (let k = 0; k < 6; k++) mesh(new THREE.TorusGeometry(0.4 - k * 0.04, 0.05, 6, 14), M(0xd9b24a, {metalness: 0.5}), 0, 17.4 + k * 0.4, -42, a.g).rotation.x = Math.PI / 2;
  // torii no meio da rua
  for (const s of [-1, 1]) mesh(new THREE.CylinderGeometry(0.3, 0.34, 6, 12), M(0xd8281e), 2.8 * s, 3, -20, a.g);
  const kas = mesh(new THREE.BoxGeometry(8.2, 0.5, 0.6), M(0x1a1a1a), 0, 6.1, -20, a.g); mesh(new THREE.BoxGeometry(7.2, 0.35, 0.45), M(0xd8281e), 0, 5.2, -20, a.g);
  for (const s of [-1, 1]) { const p = mesh(new THREE.BoxGeometry(0.8, 0.3, 0.6), M(0x1a1a1a), 4.3 * s, 6.25, -20, a.g); p.rotation.z = s * 0.2; }
  // cerejeiras, lanternas de pedra, varal de lanternas
  for (const [x, z] of [[-3.8, -6], [3.8, -13], [-3.8, -27], [3.9, -31]]) arvoreCopa(a, x, z, 2.6, [0xffb0c8, 0xff9ab8, 0xffc8dc, 0xf8a0c0], 0.85);
  const petalas = []; for (let k = 0; k < 40; k++) petalas.push({m: mesh(new THREE.BoxGeometry(0.08, 0.02, 0.08), new THREE.MeshBasicMaterial({color: 0xffb8d0}), 0, 0, 0, a.g), x: rr(-5, 5), z: rr(-30, 4), f: rnd() * 20});
  a.anim.push(t => { for (const p of petalas) { const u = ((t * 0.12 + p.f) % 1); p.m.position.set(p.x + Math.sin(t + p.f) * 0.6, 5 - u * 5, p.z); p.m.rotation.set(t * 2 + p.f, t, 0); } });
  for (const [x, z] of [[-2.6, -10], [2.6, -10], [-2.6, -30], [2.6, -30]]) { mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.2, 6), M(0x9a968a), x, 0.6, z, a.g); mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), M(0x9a968a), x, 1.5, z, a.g); mesh(new THREE.BoxGeometry(0.5, 0.35, 0.82), new THREE.MeshBasicMaterial({color: 0xffd890}), x, 1.5, z, a.g); mesh(new THREE.ConeGeometry(0.75, 0.5, 4), M(0x8a867a), x, 2.05, z, a.g).rotation.y = Math.PI / 4; }
  mesh(new THREE.BoxGeometry(9, 0.02, 0.02), M(0x1a1a1a), 0, 4.6, -4, a.g); for (let k = 0; k < 7; k++) { const lan = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.45, 10), new THREE.MeshStandardMaterial({color: k % 2 ? 0xe8c14a : 0xe82a2a, emissive: k % 2 ? 0x5a4a10 : 0x5a1010}), -3.6 + k * 1.2, 4.2, -4, a.g); a.anim.push(t => { lan.rotation.z = Math.sin(t * 1.5 + k) * 0.08; }); }
  sol(a, 50, 55, -120, 0xfff0e0, 7); nuvens(a, 0xfff0f4, 7); aves(a, 4, 0, 18, -20, 14, 0x2a2a30);
  gentePasseando(a, ['dama-japonesa', 'monge-budista', 'mercador-oriental', 'samurai', 'campones'], 6, [-3.3, 3.3], 2, -30);
  a.pontos = {pagode: {pos: [0, 9, -42], cam: [0, 3.0, 2]}, torii: {pos: [0, 5, -20], cam: [1.6, 2.2, -6]}};
  stdCams(a, RUA.P, RUA.alvo, RUA.slots);
})();

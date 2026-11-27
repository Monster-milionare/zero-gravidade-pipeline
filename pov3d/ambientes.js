// Biblioteca de cenarios, elenco (papeis) e cameras padrao do motor 3D.
// Carregado depois do motor base (usa mesh, M, B, brilho, novoAmb, nuvens, lua, mar, palmeira, ...).
const rr = (a, b) => a + rnd() * (b - a);
const pick = arr => arr[Math.floor(rnd() * arr.length)];

// ---------------------------------------------------------------- chapeus/acessorios extras
window.chapeuExtra = function (o, cab, g) {
  const h = o.chapeu;
  if (h === 'capacete-romano') {
    mesh(new THREE.SphereGeometry(0.58, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), M(0xb9bcc6), 0, 0.06, 0, cab);
    const cr = mesh(new THREE.BoxGeometry(0.12, 0.32, 0.9), M(0xc8281e), 0, 0.62, 0, cab);
    mesh(new THREE.BoxGeometry(1.1, 0.06, 0.12), M(0xb9bcc6), 0, 0.14, 0.5, cab);
  }
  if (h === 'coroa') {
    mesh(new THREE.CylinderGeometry(0.4, 0.46, 0.22, 14), M(0xe8c14a, {emissive: 0x3a2a00}), 0, 0.55, 0, cab);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; mesh(new THREE.ConeGeometry(0.08, 0.2, 5), M(0xe8c14a, {emissive: 0x3a2a00}), Math.cos(a) * 0.4, 0.78, Math.sin(a) * 0.4, cab); }
    mesh(new THREE.SphereGeometry(0.07, 8, 6), B(0xff2a3a), 0, 0.58, 0.46, cab);
  }
  if (h === 'bicorne') {
    mesh(new THREE.BoxGeometry(1.25, 0.28, 0.5), M(0x15151c), 0, 0.5, 0, cab);
    mesh(new THREE.SphereGeometry(0.07, 8, 6), B(0xff2a3a), 0, 0.5, 0.27, cab); mesh(new THREE.BoxGeometry(1.1, 0.05, 0.4), M(0xd9b24a), 0, 0.37, 0, cab);
  }
  if (h === 'capacete-astro') {
    const v = mesh(new THREE.SphereGeometry(0.78, 18, 14), new THREE.MeshPhongMaterial({color: 0xbfe3ff, transparent: true, opacity: 0.3, shininess: 120}), 0, 0, 0, cab);
    mesh(new THREE.TorusGeometry(0.62, 0.1, 8, 18), M(0xe8e8ee), 0, -0.55, 0, cab).rotation.x = Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.9, 1.0, 0.45), M(0xdcdce4), 0, -1.2, -0.62, cab);
  }
  if (h === 'peruca') {
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.2, 8, 6), M(0xf2f2f2), Math.cos(a) * 0.5, 0.05 - (i % 2) * 0.12, Math.sin(a) * 0.45 - 0.05, cab); }
    mesh(new THREE.SphereGeometry(0.58, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), M(0xf2f2f2), 0, 0.06, -0.04, cab);
  }
  if (h === 'cabelo-louco') {
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.2, 8, 6), M(0xf6f6f6), Math.cos(a) * 0.58, 0.22 + (i % 3) * 0.1, Math.sin(a) * 0.4, cab); }
    for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(0.22, 8, 6), M(0xf6f6f6), (i - 2) * 0.22, 0.58, 0, cab);
    mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), M(0xf2f2f2), 0, -0.2, 0.52, cab);
  }
  if (h === 'capacete-viking') {
    mesh(new THREE.SphereGeometry(0.58, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), M(0x8a8f9c), 0, 0.06, 0, cab);
    for (const s of [-1, 1]) { const c = mesh(new THREE.ConeGeometry(0.1, 0.55, 8), M(0xf0e8d0), 0.6 * s, 0.3, 0, cab); c.rotation.z = -0.9 * s; }
  }
  if (h === 'nemes') {
    mesh(new THREE.BoxGeometry(1.16, 0.9, 0.9), M(0x1c4fa6), 0, 0.08, -0.12, cab);
    mesh(new THREE.BoxGeometry(1.18, 0.12, 0.92), M(0xe8c14a), 0, 0.45, -0.12, cab);
    for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.2, 0.9, 0.5), M(0xe8c14a), 0.5 * s, -0.5, 0.0, cab);
  }
  if (h === 'aviador') {
    mesh(new THREE.SphereGeometry(0.57, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), M(0x7a4d26), 0, 0.04, -0.02, cab);
    for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.13, 0.04, 6, 12), M(0x222222), 0.2 * s, 0.34, 0.46, cab);
    mesh(new THREE.BoxGeometry(0.1, 0.06, 0.05), M(0x222222), 0, 0.34, 0.5, cab);
  }
  if (h === 'palha') {
    mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.05, 20), M(0xd9b868), 0, 0.38, 0, cab); mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.3, 14), M(0xd9b868), 0, 0.52, 0, cab);
  }
  if (h === 'elmo-cavaleiro') {
    mesh(new THREE.CylinderGeometry(0.56, 0.56, 0.9, 14), M(0xa9adba), 0, 0.12, 0, cab); mesh(new THREE.SphereGeometry(0.56, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), M(0xa9adba), 0, 0.57, 0, cab);
    mesh(new THREE.BoxGeometry(0.9, 0.08, 0.1), B(0x111111), 0, 0.12, 0.54, cab); const pena = mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), M(0xc8281e), 0, 1.1, 0, cab);
  }
  if (h === 'turbante') {
    mesh(new THREE.SphereGeometry(0.6, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), M(0xf2e8d0), 0, 0.1, 0, cab); mesh(new THREE.TorusGeometry(0.5, 0.15, 8, 16), M(0xe0d4b8), 0, 0.25, 0, cab).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.07, 8, 6), B(0x2fb86a), 0, 0.3, 0.55, cab);
  }
  if (h === 'mongol') {   // chapeu mongol: copa conica colorida com aba de pele
    mesh(new THREE.ConeGeometry(0.46, 0.75, 14), M(o.corChapeu || 0xa8281e), 0, 0.78, 0, cab);
    mesh(new THREE.TorusGeometry(0.5, 0.17, 8, 18), M(o.pelo || 0x6a4a2a), 0, 0.42, 0, cab).rotation.x = Math.PI / 2;
    mesh(new THREE.SphereGeometry(0.08, 8, 6), M(0xe8c14a, {emissive: 0x3a2a00}), 0, 1.18, 0, cab);
  }
  if (h === 'capuz') {    // capuz escuro (camponeses, monges, Peste Negra)
    mesh(new THREE.SphereGeometry(0.66, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), M(o.corChapeu || 0x3a3028), 0, 0.02, -0.06, cab);
  }
  if (h === 'coroa-rainha') {
    mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.2, 14), M(0xe8c14a, {emissive: 0x3a2a00}), 0, 0.55, 0, cab);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; mesh(new THREE.SphereGeometry(0.06, 6, 6), B(0x2a7aff), Math.cos(a) * 0.34, 0.72, Math.sin(a) * 0.34, cab); }
    for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.28, 10, 8), M(o.cabelo || 0x1a1008), 0.5 * s, -0.25, -0.05, cab);
  }
  if (o.bigode) mesh(new THREE.BoxGeometry(0.42, 0.07, 0.07), M(o.bigode), 0, -0.14, 0.53, cab);
  if (o.mochila) mesh(new THREE.BoxGeometry(0.7, 0.9, 0.35), M(o.mochila), 0, 0.85, -0.5, g);
  if (o.escudo) { const e = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 14), M(o.escudo), -0.62, 0.7, 0.3, g); e.rotation.z = Math.PI / 2; mesh(new THREE.SphereGeometry(0.1, 8, 6), M(0xd9b24a), -0.68, 0.7, 0.3, g); }
  if (o.lanca) { const l = mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), M(0x6b4423), 0.7, 1.2, 0.2, g); mesh(new THREE.ConeGeometry(0.07, 0.22, 6), M(0xc9ccd6), 0.7, 2.6, 0.2, g); }
  if (o.manto) { const c = mesh(new THREE.CylinderGeometry(0.46, 0.7, 1.3, 14, 1, true, Math.PI * 0.55, Math.PI * 0.9), new THREE.MeshLambertMaterial({color: o.manto, side: THREE.DoubleSide}), 0, 0.85, -0.12, g); c.rotation.y = Math.PI; }
};

// ---------------------------------------------------------------- dinossauro fofo (cilindros e esferas)
window.dinoBuild = function (id, o) {
  const g = new THREE.Group(), cor = o.roupa, bar = o.barriga || 0xf0e2a8;
  const corpo = mesh(new THREE.SphereGeometry(0.85, 16, 12), M(cor), 0, 1.0, -0.2, g); corpo.scale.set(1, 0.95, 1.4); corpo.castShadow = true;
  mesh(new THREE.SphereGeometry(0.7, 14, 10), M(bar), 0, 0.85, 0.15, g).scale.set(0.85, 0.7, 1.1);
  const pescoco = mesh(new THREE.CylinderGeometry(0.28, 0.4, 1.1, 10), M(cor), 0, 1.7, 0.7, g); pescoco.rotation.x = -0.35;
  const cab = new THREE.Group(); cab.position.set(0, 2.3, 0.9); g.add(cab);
  mesh(new THREE.SphereGeometry(0.5, 16, 12), M(cor), 0, 0, 0.05, cab).castShadow = true;
  mesh(new THREE.SphereGeometry(0.32, 12, 10), M(cor), 0, -0.08, 0.5, cab).scale.set(1, 0.8, 1.2);
  const olhos = [];
  for (const s of [-1, 1]) { const eg = new THREE.Group(); eg.position.set(0.3 * s, 0.18, 0.32); mesh(new THREE.SphereGeometry(0.13, 12, 10), M(0xffffff), 0, 0, 0, eg); mesh(new THREE.SphereGeometry(0.065, 10, 8), B(0x151515), 0, 0, 0.1, eg); cab.add(eg); olhos.push(eg);
    mesh(new THREE.SphereGeometry(0.06, 8, 6), M(0xe08a7a, {transparent: true, opacity: 0.6}), 0.38 * s, -0.05, 0.3, cab); mesh(new THREE.SphereGeometry(0.03, 6, 6), B(0x000000), 0.1 * s, -0.04, 0.78, cab); }
  const boca = mesh(new THREE.SphereGeometry(0.16, 12, 10), B(0x6a1c18), 0, -0.2, 0.62, cab); boca.scale.set(1.1, 0.2, 0.6);
  for (let i = 0; i < 4; i++) mesh(new THREE.ConeGeometry(0.1, 0.2, 5), M(o.espinhos || 0x2f8a4a), 0, 1.5 - i * 0.28, -0.7 - i * 0.12, g).rotation.x = -0.5;
  const cauda = mesh(new THREE.ConeGeometry(0.5, 1.9, 10), M(cor), 0, 0.7, -1.6, g); cauda.rotation.x = Math.PI / 2 + 0.2;
  for (const [x, z] of [[-0.5, 0.35], [0.5, 0.35], [-0.5, -0.7], [0.5, -0.7]]) mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.7, 10), M(cor), x, 0.35, z, g);
  const bracos = [new THREE.Group(), new THREE.Group()];
  g.userData = {cab, boca, olhos, bracos, base: 0, fase: rnd() * 6, id, prot: false};
  g.scale.setScalar(o.escala || 1);
  return g;
};

// ---------------------------------------------------------------- elenco: papeis prontos
const PAPEIS = {
  cabral:   {roupa: 0x7a1f2e, pele: 0xf2c8a0, chapeu: 'barrete', corChapeu: 0x1c2a5c, barba: 0x4a2f1c, cabelo: 0x3a2412, cabeloTras: true, cinto: 0xd9b24a, botoes: 0xe8c14a, gola: true, capa: 0x1f2f66, espada: true, punho: 0xd9b24a, brava: true},
  marujo:   {roupa: 0xe8e0c8, pele: 0xd9a77c, chapeu: 'bandana', corChapeu: 0xb81e1e, cinto: 0x5b3a20},
  marujo2:  {roupa: 0x6a7f9a, pele: 0xc9966c, chapeu: 'bandana', corChapeu: 0x2f6f4e, cinto: 0x5b3a20},
  caminha:  {roupa: 0x2f4f3a, pele: 0xe3b48a, chapeu: 'barrete', corChapeu: 0x111111, cinto: 0xc9a14a, barba: 0x2a1a10, gola: true, botoes: 0xc9a14a},
  nativo:   {roupa: 0x9a6038, pele: 0x9a6038, chapeu: 'cocar', cabelo: 0x111111, cinto: 0xb8321e, bota: 0x9a6038},
  nativo2:  {roupa: 0x8d5733, pele: 0x8d5733, chapeu: 'cocar', cabelo: 0x111111, cinto: 0x2f8a4a, bota: 0x8d5733},
  nativo3:  {roupa: 0xa66b40, pele: 0xa66b40, cabelo: 0x111111, cinto: 0xe8c230, bota: 0xa66b40},
  rei:      {roupa: 0x6a1f7a, pele: 0xf2c8a0, chapeu: 'coroa', barba: 0x6a5a40, cinto: 0xe8c14a, gola: true, botoes: 0xe8c14a, manto: 0xb81e1e, punho: 0xf6f1e6},
  rainha:   {roupa: 0x1c4fa6, pele: 0xf2c8a0, vestido: true, chapeu: 'coroa-rainha', cabelo: 0x3a2412, cinto: 0xe8c14a, gola: true},
  dompedro: {roupa: 0x1f4f8a, pele: 0xf2c8a0, chapeu: 'bicorne', bigode: 0x2a1a10, cabelo: 0x2a1a10, cinto: 0xe8c14a, botoes: 0xe8c14a, gola: true, punho: 0xe8c14a, manto: 0x2f8a4a},
  napoleao: {roupa: 0x1c2a5c, pele: 0xf2c8a0, chapeu: 'bicorne', cabelo: 0x3a2a1a, cinto: 0xf6f1e6, botoes: 0xe8c14a, gola: true, punho: 0xe8c14a},
  'soldado-frances': {roupa: 0x1c3a7a, pele: 0xe3b48a, chapeu: 'bicorne', cinto: 0xf6f1e6, botoes: 0xe8c14a, lanca: true},
  'soldado-ingles':  {roupa: 0xc8281e, pele: 0xf2c8a0, chapeu: 'cartola', corChapeu: 0x15151c, cinto: 0xf6f1e6, botoes: 0xe8c14a, bigode: 0x6a4a2a},
  'soldado-holandes': {roupa: 0xe8742a, pele: 0xf2c8a0, chapeu: 'cartola', corChapeu: 0x1c2a5c, cinto: 0xf6f1e6, botoes: 0xe8c14a, gola: true},
  'soldado-romano': {roupa: 0xb8281e, pele: 0xd9a77c, chapeu: 'capacete-romano', escudo: 0xb8281e, cinto: 0xb08a3a, lanca: true},
  'general-romano': {roupa: 0xf2eadc, pele: 0xe3b48a, chapeu: 'capacete-romano', manto: 0xb8281e, cinto: 0xe8c14a, espada: true},
  imperador: {roupa: 0xf6f1e6, pele: 0xe3b48a, chapeu: 'coroa', manto: 0x7a1f7a, cinto: 0xe8c14a, cabelo: 0x3a2a1a},
  gladiador: {roupa: 0xc9a066, pele: 0xd9a77c, chapeu: 'capacete-romano', escudo: 0x8a8f9c, cinto: 0x5b3a20, espada: true},
  cidadao:  {roupa: 0x8a6a4a, pele: 0xe3b48a, chapeu: 'palha', cinto: 0x5b3a20, cabelo: 0x3a2a1a},
  cidadao2: {roupa: 0x4a7a6a, pele: 0xc9966c, cabelo: 0x2a1a10, cinto: 0x2a2a2a},
  cidada:   {roupa: 0xb84a7a, pele: 0xd9a77c, vestido: true, cabelo: 0x2a1a10, cinto: 0xf6f1e6},
  einstein: {roupa: 0x3a3a46, pele: 0xf2c8a0, chapeu: 'cabelo-louco', bigode: 0xf2f2f2, cinto: 0x6a4a2a, gola: false},
  newton:   {roupa: 0x5a2a3a, pele: 0xf2c8a0, chapeu: 'peruca', gola: true, botoes: 0xe8c14a, punho: 0xf6f1e6, cinto: 0xe8c14a},
  cientista: {roupa: 0xf6f6fa, pele: 0xe3b48a, cabelo: 0x2a1a10, bigode: 0x2a1a10, cinto: 0xb0b0c0},
  astronauta: {roupa: 0xeeeeF4, pele: 0xf2c8a0, chapeu: 'capacete-astro', cinto: 0xc8281e, botoes: 0x2a7aff, bota: 0x9a9aa8},
  aviador:  {roupa: 0x7a4d26, pele: 0xf2c8a0, chapeu: 'aviador', bigode: 0x2a1a10, cinto: 0xd9b24a, punho: 0xf6f1e6, gola: true},
  gengis:   {roupa: 0x1f3a6a, pele: 0xd9a77c, chapeu: 'mongol', corChapeu: 0xa8281e, pelo: 0x5a3a1e, bigode: 0x1a1410, barba: 0x1a1410, cinto: 0xe8c14a, manto: 0x8a1f1e, espada: true},
  mongol:   {roupa: 0x7a3a22, pele: 0xd29a6c, chapeu: 'mongol', corChapeu: 0x2a4a7a, pelo: 0x6a4a2a, bigode: 0x1a1410, cinto: 0x3a2a1a, lanca: true},
  mongol2:  {roupa: 0x3a5a3a, pele: 0xc89068, chapeu: 'mongol', corChapeu: 0x8a6a2a, pelo: 0x4a3a2a, cinto: 0x3a2a1a, escudo: 0x7a4a2a},
  campones: {roupa: 0x6a5a44, pele: 0xe3b48a, chapeu: 'capuz', corChapeu: 0x4a3a2a, cinto: 0x3a2a1a, barba: 0x5a3a1e},
  camponesa:{roupa: 0x7a4a3a, pele: 0xf0c8a0, chapeu: 'capuz', corChapeu: 0x5a4a3a, cinto: 0x3a2a1a},
  'medico-peste': {roupa: 0x1a1a1e, pele: 0xe3b48a, chapeu: 'cartola', cinto: 0x3a2a1a, manto: 0x121214, bigode: 0xe8dcc0},
  egipcio:  {roupa: 0xf2eadc, pele: 0xb9824e, cabelo: 0x111111, cinto: 0xe8c14a, chapeu: 'turbante'},
  faraoh:   {roupa: 0xf6f1e6, pele: 0xb9824e, chapeu: 'nemes', cinto: 0xe8c14a, botoes: 0x1c4fa6, gola: true, barba: 0x1c4fa6},
  cleopatra: {roupa: 0xf6f1e6, pele: 0xc9966c, vestido: true, chapeu: 'coroa-rainha', cabelo: 0x0a0a0a, cinto: 0xe8c14a, gola: true},
  viking:   {roupa: 0x6a4a2a, pele: 0xf2c8a0, chapeu: 'capacete-viking', barba: 0xc9722a, escudo: 0xb8321e, cinto: 0x2a2a2a},
  samurai:  {roupa: 0x1c1c2a, pele: 0xe3b48a, chapeu: 'elmo-cavaleiro', cinto: 0xb8281e, espada: true, bigode: 0x111111},
  cavaleiro: {roupa: 0xa9adba, pele: 0xf2c8a0, chapeu: 'elmo-cavaleiro', escudo: 0x1c4fa6, cinto: 0x5b3a20, espada: true, lanca: true},
  tiradentes: {roupa: 0x8a7a5a, pele: 0xf2c8a0, cabelo: 0x3a2412, barba: 0x3a2412, cinto: 0xf6f1e6},
  isabel:   {roupa: 0xd94a8a, pele: 0xf2c8a0, vestido: true, chapeu: 'coroa-rainha', cabelo: 0x3a2412, cinto: 0xf6f1e6, gola: true},
  asteca:   {roupa: 0x1f8a6a, pele: 0xa66b40, chapeu: 'cocar', cabelo: 0x111111, cinto: 0xe8c14a, escudo: 0xe8c230},
  dino:     {dino: true, roupa: 0x4aa05a, barriga: 0xf0e2a8, espinhos: 0xc8742a},
  dino2:    {dino: true, roupa: 0xd9742a, barriga: 0xf6e8b8, espinhos: 0x7a3a1a, escala: 0.8},
  dino3:    {dino: true, roupa: 0x5a7ad9, barriga: 0xe8f0f8, espinhos: 0x2a4aa0, escala: 1.2},
};
window.papel = n => Object.assign({}, PAPEIS[n] || PAPEIS.cidadao);
window.listaPapeis = () => Object.keys(PAPEIS);

// ---------------------------------------------------------------- cameras padrao (iguais em TODOS os cenarios)
function stdCams(a, P, alvo, slots) {
  const dx = alvo[0] - P[0], dz = alvo[2] - P[1], n = Math.hypot(dx, dz) || 1, D = [dx / n, dz / n], S = [D[1], -D[0]];
  a.P = P; a.alvo = alvo; a.slots = slots; a.Pry = Math.atan2(D[0], D[1]);
  const add = (nome, fn) => { if (!a.cams[nome]) a.cams[nome] = fn; };
  add('pov',         u => ({pos: [P[0], 1.8, P[1] - D[1] * u * 0.4], look: alvo, fov: 64, maos: 'agarrar'}));
  add('pov-lanterna', u => ({pos: [P[0], 1.78, P[1]], look: [alvo[0], 1.5, alvo[2]], fov: 64, maos: 'lanterna'}));
  add('pov-luneta',  u => ({pos: [P[0], 1.8, P[1]], look: V([alvo[0] - 6, 1.7, alvo[2]], [alvo[0] + 6, 1.9, alvo[2]], ease(u)), fov: 50, maos: 'luneta'}));
  add('pov-bussola', u => ({pos: [P[0], 1.8, P[1]], look: [alvo[0] - D[0] * 0, 0.4, alvo[2] * 0.2 + P[1] * 0.8], fov: 66, maos: 'bussola', tremor: 0.02}));
  add('eu-costas',   u => ({pos: [P[0] - D[0] * (2.8 + u * 0.4) + S[0] * 0.9, 2.6, P[1] - D[1] * (2.8 + u * 0.4) + S[1] * 0.9], look: [alvo[0], 1.5, alvo[2]], fov: 56}));
  add('eu-frente',   u => ({pos: [P[0] + D[0] * (3.2 - u * 0.4) + S[0] * 0.3, 2.1, P[1] + D[1] * (3.2 - u * 0.4) + S[1] * 0.3], look: [P[0], 1.8, P[1]], fov: 46}));
  add('eu-lado',     u => ({pos: [P[0] + S[0] * (4.0 - u * 0.5) + D[0] * 0.8, 2.0, P[1] + S[1] * (4.0 - u * 0.5) + D[1] * 0.8], look: [P[0], 1.65, P[1]], fov: 52}));
  add('ampla',       u => ({pos: [P[0] - D[0] * 8 + S[0] * (2 - u * 3), 4.6 - u * 0.6, P[1] - D[1] * 8 + S[1] * (2 - u * 3)], look: [P[0] + D[0] * 6, 1.6, P[1] + D[1] * 6], fov: 68}));
  add('alto',        u => ({pos: [P[0] - D[0] * 3 + S[0] * (2.5 - u * 5), 8.5 - u, P[1] - D[1] * 3 + S[1] * (2.5 - u * 5)], look: [alvo[0], 0.6, alvo[2] * 0.6 + P[1] * 0.4], fov: 70}));
  add('panoramica',  u => ({pos: [P[0], 2.2, P[1]], look: V([alvo[0] - 10 * S[0] - D[0] * 2, 2, alvo[2] - 10 * S[1]], [alvo[0] + 10 * S[0], 2, alvo[2] + 10 * S[1]], ease(u)), fov: 70}));
  slots.forEach((Q, i) => {
    const ex = Q[0] - P[0], ez = Q[1] - P[1], m = Math.hypot(ex, ez) || 1, E = [ex / m, ez / m], T = [E[1], -E[0]];
    add('f' + i,       u => ({pos: [P[0] + E[0] * (0.9 - u * 0.2) + T[0] * 0.9, 2.15, P[1] + E[1] * (0.9 - u * 0.2) + T[1] * 0.9], look: [Q[0], 1.8, Q[1]], fov: 52}));
    add('f' + i + 'c', u => ({pos: [Q[0] - E[0] * (3.0 - u * 0.5) + T[0] * 0.3, 1.95, Q[1] - E[1] * (3.0 - u * 0.5) + T[1] * 0.3], look: [Q[0], 1.85, Q[1]], fov: 46}));
  });
}
window.camsDe = nome => Object.keys(amb[nome].cams);

window.setQuadro = function (linhas) {
  const cv = quadroTex.image, g = cv.getContext('2d'), w = cv.width, h = cv.height;
  g.fillStyle = '#10202e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7fe0ff'; g.lineWidth = 3; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#9ff0ff'; g.font = 'bold 40px monospace'; linhas.slice(0, 5).forEach((t, i) => g.fillText(t, 26, 62 + i * 56));
  quadroTex.needsUpdate = true;
};
// figurante repetido NUNCA e clone: a 2a, 3a copia do mesmo papel muda pele, cabelo, barba, roupa e altura
const _PELES3 = [0xf2c9a0, 0xd9a77c, 0xb57e55, 0x8d5733, 0xe8b890, 0x6e4227];
const _CABELOS3 = [0x2a1a10, 0x6a4a2a, 0xc9a050, 0x111111, 0x8a3a1a, 0x9a9a9a];
function _tom(cor, k) {      // gira levemente a cor da roupa
  const c = new THREE.Color(cor), h = {}; c.getHSL(h); c.setHSL((h.h + 0.11 * k) % 1, Math.min(1, h.s * (0.8 + 0.15 * k)), Math.max(0.12, Math.min(0.85, h.l * (k % 2 ? 0.8 : 1.15)))); return c.getHex();
}
function variar3d(o, k) {
  if (!k || o.dino) return o;
  o = Object.assign({}, o);
  o.pele = _PELES3[(_PELES3.indexOf(o.pele) + 1 + k * 2) % _PELES3.length];
  if (o.cabelo !== undefined) o.cabelo = _CABELOS3[(k * 2 + 1) % _CABELOS3.length];
  if (o.barba !== undefined || k % 2) o.barba = k % 2 ? (o.cabelo !== undefined ? o.cabelo : _CABELOS3[k % _CABELOS3.length]) : undefined;
  if (o.roupa !== undefined) o.roupa = _tom(o.roupa, k);
  o.escala = (o.escala || 1) * (k % 2 ? 0.93 : 1.07);
  return o;
}
window.variar3d = variar3d;
window.setElenco = function (spec) {
  if (spec.quadro) window.setQuadro(spec.quadro);
  for (const k in amb) {
    const a = amb[k]; if (!a.slots) continue;
    for (const c of a.chars) a.g.remove(c); a.chars.length = 0;
    const f = (spec.amb && spec.amb[k]) || spec.f || [];
    const pr = (spec.protAmb && spec.protAmb[k]) || spec.prot, y0 = a.chaoY || 0;
    if (pr) { const c = personagem('prot', Object.assign(papel(pr), {protagonista: true})); c.position.set(a.P[0], y0, a.P[1]); c.rotation.y = a.Pry; c.userData.base = y0; a.g.add(c); a.chars.push(c); }
    const vistos = {};
    if (f.length) a.slots.forEach((q, i) => { if (i >= f.length && spec.exato) return; const nome = f[i % f.length]; vistos[nome] = (vistos[nome] || 0) + 1;
      const c = personagem('f' + i, variar3d(papel(nome), vistos[nome] - 1)); c.position.set(q[0], y0, q[1]); c.rotation.y = q[2] !== undefined ? q[2] : Math.atan2(a.P[0] - q[0], a.P[1] - q[1]); c.userData.base = y0; a.g.add(c); a.chars.push(c); });
  }
};

// ---------------------------------------------------------------- utilidades de cenario
const CEU_DIA = [0x2f6fd0, 0x78b4ee, 0xe4f2ff];
const CEU_POR = [0x1f2f7a, 0xd9764a, 0xffd28a];
function cfgDia(extra) { return Object.assign({hemiCeu: 0xbfd8ff, hemiChao: 0x7a6a50, hemiInt: 1.0, pontoCor: 0xffe0b0, pontoInt: 0.001, pontoDist: 8, pontoPos: [0, 5, 0], dirCor: 0xfff2d8, dirInt: 1.15, dirPos: [-8, 16, 10],
  fundo: 0x9fd0ff, nevoa: [0xcfe6ff, 40, 160], ceu: CEU_DIA, semEstrelas: true}, extra || {}); }
function cfgInterior(extra) { return Object.assign({hemiCeu: 0x8a6a4a, hemiChao: 0x2a1c10, hemiInt: 0.95, pontoCor: 0xffc060, pontoInt: 22, pontoDist: 14, pontoPos: [0, 4, -2],
  dirCor: 0xffe0b0, dirInt: 0.3, dirPos: [3, 8, 5], fundo: 0x140e08, nevoa: [0x140e08, 10, 40], ceu: [0x140e08, 0x140e08, 0x140e08], semEstrelas: true}, extra || {}); }
function sol(a, x, y, z, cor, esc) { lua(a, x, y, z, cor, esc); }
function chao(a, cor, w, d, x, y, z) { const m = mesh(new THREE.BoxGeometry(w, 0.3, d), M(cor), x || 0, (y === undefined ? -0.15 : y), z || 0, a.g); m.receiveShadow = true; return m; }
function coluna(a, x, z, h, cor, r) { mesh(new THREE.CylinderGeometry(r || 0.5, (r || 0.5) * 1.1, h, 12), M(cor || 0xe8e0d0), x, h / 2, z, a.g).castShadow = true; mesh(new THREE.BoxGeometry((r || 0.5) * 2.6, 0.3, (r || 0.5) * 2.6), M(cor || 0xe8e0d0), x, 0.15, z, a.g); mesh(new THREE.BoxGeometry((r || 0.5) * 2.6, 0.3, (r || 0.5) * 2.6), M(cor || 0xe8e0d0), x, h, z, a.g); }
function tocha(a, x, y, z) { mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.6, 6), M(0x3a2a1a), x, y, z, a.g); const f = mesh(new THREE.ConeGeometry(0.14, 0.35, 6), B(0xffa02e), x, y + 0.45, z, a.g); brilho(0xff9a2e, 2.4, x, y + 0.45, z, a.g); a.anim.push(t => { f.scale.y = 1 + Math.sin(t * 13 + x) * 0.25; }); }
function bandeiraPano(a, x, y, z, cor, cor2) { const g = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.4, 6), M(0x5b3a20), 0, 1.7, 0, g); const p = mesh(new THREE.BoxGeometry(1.4, 0.9, 0.04), M(cor), 0.75, 3.0, 0, g); if (cor2) mesh(new THREE.BoxGeometry(1.42, 0.25, 0.05), M(cor2), 0.75, 3.0, 0, g); g.position.set(x, y, z); a.g.add(g); a.anim.push(t => { p.rotation.y = Math.sin(t * 3 + x) * 0.2; }); }
function fumaca(a, x, z, n) { const bolas = []; for (let i = 0; i < n; i++) { const b = mesh(new THREE.SphereGeometry(0.6, 8, 6), new THREE.MeshBasicMaterial({color: 0x9a9aa4, transparent: true, opacity: 0.5}), x, 1, z, a.g); bolas.push({b, f: i / n}); }
  a.anim.push(t => { for (const o of bolas) { const k = (t * 0.2 + o.f) % 1; o.b.position.set(x + Math.sin(k * 6 + o.f * 9) * 0.8, 0.5 + k * 8, z); o.b.scale.setScalar(0.6 + k * 2.2); o.b.material.opacity = 0.55 * (1 - k); } }); }
const xadrezTex = canvasTex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#2a2630' : '#ece6da'; g.fillRect(i * 32, j * 32, 32, 32); } });
xadrezTex.wrapS = xadrezTex.wrapT = THREE.RepeatWrapping; xadrezTex.repeat.set(7, 12);
const quadroTex = canvasTex(512, 300, (g, w, h) => { g.fillStyle = '#1f3a2e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8d0b0'; g.fillStyle = '#e8e4cc'; g.lineWidth = 3; g.font = 'bold 54px sans-serif'; g.fillText('E = mc²', 30, 80); g.font = '40px sans-serif'; g.fillText('F = m·a', 300, 80); g.fillText('F = G·m₁m₂/r²', 40, 150);
  g.beginPath(); g.arc(400, 210, 50, 0, 7); g.stroke(); g.beginPath(); g.moveTo(20, 250); g.bezierCurveTo(100, 160, 200, 290, 300, 200); g.stroke(); g.font = '34px sans-serif'; g.fillText('?', 395, 225); });
const terraTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#1f5fb0'; g.fillRect(0, 0, w, h); g.fillStyle = '#3f9a4a'; for (const [x, y, r] of [[70, 80, 40], [160, 150, 50], [210, 60, 25], [60, 200, 30]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.5, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 30, 8, Math.random(), 0, 7); g.fill(); } });

// ---- PALACIO (sala do trono) ----
(function () {
  const a = novoAmb('palacio', cfgInterior({hemiInt: 1.1}));
  a.g.position.x = 900;
  const piso = mesh(new THREE.BoxGeometry(14, 0.3, 28), new THREE.MeshLambertMaterial({map: xadrezTex}), 0, -0.15, -6, a.g); piso.receiveShadow = true;
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.4, 8, 28), M(0xcfc4a8), 7 * s, 4, -6, a.g);
  mesh(new THREE.BoxGeometry(14, 8, 0.4), M(0xcfc4a8), 0, 4, -20, a.g); mesh(new THREE.BoxGeometry(14, 0.4, 28), M(0x8a6a3a), 0, 8, -6, a.g);
  mesh(new THREE.BoxGeometry(2.6, 0.04, 24), M(0xb81e2e), 0, 0.03, -5, a.g); for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.15, 0.05, 24), M(0xe8c14a), 1.35 * s, 0.04, -5, a.g);
  for (const s of [-1, 1]) for (let z = 4; z > -16; z -= 4) { coluna(a, 5 * s, z, 8, 0xe8e0d0, 0.55); bandeiraPano(a, 4.4 * s, 0, z - 2, 0xb81e2e, 0xe8c14a); tocha(a, 4.3 * s, 2.6, z); }
  for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(5 - i, 0.35, 3 - i * 0.5), M(0x8a7a60), 0, 0.17 + i * 0.35, -17 + i * 0.4, a.g);
  mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2), M(0x7a1f2e), 0, 1.7, -17.3, a.g); mesh(new THREE.BoxGeometry(1.8, 3.4, 0.4), M(0xd9b24a, {emissive: 0x3a2a00}), 0, 3.4, -18.2, a.g); mesh(new THREE.SphereGeometry(0.3, 10, 8), M(0xb81e2e), 0, 5.3, -18.2, a.g);
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(1.8, 4.2, 0.2), B(0x6a9ae8), 5.5 * s, 4.6, -19.7, a.g); brilho(0x8fb0ff, 6, 5.5 * s, 4.6, -19.5, a.g); }
  for (const z of [3, -6]) { mesh(new THREE.TorusGeometry(1.2, 0.08, 6, 20), M(0xe8c14a), 0, 6.3, z, a.g).rotation.x = Math.PI / 2; for (let i = 0; i < 6; i++) { const ang = i / 6 * Math.PI * 2; brilho(0xffb050, 1.4, Math.cos(ang) * 1.2, 6.4, z + Math.sin(ang) * 1.2, a.g); } }
  mesh(new THREE.BoxGeometry(14, 8, 0.4), M(0xcfc4a8), 0, 4, 9, a.g); tocha(a, -3, 2.6, 8.6); tocha(a, 3, 2.6, 8.6);
  a.cams.ampla = u => ({pos: [3.2 - u * 3, 3.4, 7.6], look: [0, 1.5, -8], fov: 68});
  stdCams(a, [0.2, 3.5], [0, 1.6, -14], [[-1.8, -3.5], [2.0, -6.5], [-2.4, -9.5]]);
})();

// ---- CIDADE (rua) : variantes por 'estilo' ----
function construirCidade(nome, pal, opt) {
  const a = novoAmb(nome, cfgDia(opt.cfg || {})); a.g.position.x = opt.x;
  chao(a, opt.chao || 0x9a9082, 40, 90, 0, -0.15, -30);
  mesh(new THREE.BoxGeometry(7, 0.05, 90), M(opt.rua || 0xb8ad98), 0, 0.01, -30, a.g);
  for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 9; i++) {
    const w = 5 + rnd() * 2, hgt = 5 + rnd() * 5, z = 6 - i * 5.6, x = side * (6 + w / 2);
    const cor = pick(pal);
    const b = mesh(new THREE.BoxGeometry(w, hgt, 4.8), M(cor), x, hgt / 2, z, a.g); b.castShadow = true; b.receiveShadow = true;
    if (opt.telhado === 'plano') mesh(new THREE.BoxGeometry(w + 0.3, 0.3, 5.1), M(0xe8e0d0), x, hgt + 0.15, z, a.g);
    else { const t = mesh(new THREE.ConeGeometry(w * 0.78, 2.2, 4), M(opt.telha || 0xb8412a, {flatShading: true}), x, hgt + 1.1, z, a.g); t.rotation.y = Math.PI / 4; t.scale.set(1, 1, 0.95); }
    for (let r = 0; r < Math.floor(hgt / 2.2); r++) for (let c = -1; c <= 1; c += 2) { const jx = x - side * (w / 2 + 0.02); mesh(new THREE.BoxGeometry(0.06, 0.9, 0.7), B(0x2a3a5a), jx, 1.6 + r * 2.1, z + c * 1.1, a.g); mesh(new THREE.BoxGeometry(0.1, 1.0, 0.8), M(0xf0e8d8), jx + side * 0.0, 1.6 + r * 2.1, z + c * 1.1, a.g).position.x = jx - side * 0.02; }
    mesh(new THREE.BoxGeometry(0.08, 1.7, 1.0), M(0x5b3a20), x - side * (w / 2 + 0.03), 0.85, z, a.g);
  }
  if (opt.templo) { for (let i = -3; i <= 3; i++) coluna(a, i * 1.6, -36, 6, 0xf0ece0, 0.45); mesh(new THREE.BoxGeometry(12, 0.5, 4), M(0xf0ece0), 0, 6.25, -36, a.g); const fr = mesh(new THREE.ConeGeometry(6.4, 2.4, 3), M(0xe8dcc4), 0, 7.7, -36, a.g); fr.rotation.set(0, 0, 0); fr.scale.set(1, 1, 0.3); mesh(new THREE.BoxGeometry(12, 0.5, 6), M(0xe8e0d0), 0, 0.25, -36, a.g); }
  else { mesh(new THREE.BoxGeometry(5, 12, 5), M(0xe8dcc0), 0, 6, -36, a.g); mesh(new THREE.ConeGeometry(3.8, 6, 4), M(0xa8382a), 0, 15, -36, a.g).rotation.y = Math.PI / 4; mesh(new THREE.BoxGeometry(1, 1.4, 0.1), B(0x2a3a5a), 0, 9, -33.4, a.g); mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 16), M(0xf0e8d8), 0, 11, -33.4, a.g).rotation.x = Math.PI / 2; }
  mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.6, 14), M(0xb8b4a8), 0, 0.3, -16, a.g); mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 14), new THREE.MeshLambertMaterial({color: 0x3a8ad8}), 0, 0.55, -16, a.g);
  mesh(new THREE.CylinderGeometry(0.22, 0.3, 2, 8), M(0xb8b4a8), 0, 1.3, -16, a.g); mesh(new THREE.SphereGeometry(0.5, 10, 8), M(0xb8b4a8), 0, 2.4, -16, a.g);
  for (const [x, z] of [[-3.3, -3], [3.2, -8.5], [-3.4, -11]]) { mesh(new THREE.BoxGeometry(1.8, 0.1, 1.2), M(0xb8412a), x, 2.1, z, a.g); mesh(new THREE.BoxGeometry(1.7, 0.8, 1.0), M(0x8a5a33), x, 0.4, z, a.g); for (const s of [-0.8, 0.8]) mesh(new THREE.CylinderGeometry(0.04, 0.04, 2, 4), M(0x5b3a20), x + s, 1, z - 0.5, a.g); }
  barril(a, 2.6, 1.0); barril(a, -2.8, -1.2, 1.1); caixote(a, 3.0, -4.6, 0.9, 0.9, 0.3);
  sol(a, 60, 55, -120, 0xfff6d0, 6); nuvens(a, 0xffffff, 8); aves(a, 4, 0, 18, -20, 14, 0xffffff);
  for (const [x, y, z] of [[-3, 5.5, -5], [3, 5.5, -12]]) { mesh(new THREE.BoxGeometry(6, 0.05, 0.05), M(0x5b3a20), x * 0, y, z, a.g); for (let k = 0; k < 6; k++) mesh(new THREE.BoxGeometry(0.5, 0.7, 0.04), M([0xb81e2e, 0xe8c14a, 0x2f6fd0][k % 3]), -2.5 + k, y - 0.4, z, a.g); }
  stdCams(a, [0.2, 4.0], [0, 1.6, -14], [[-1.8, -2], [2.0, -4.5], [-2.4, -7]]);
  return a;
}
construirCidade('cidade', [0xe8d8b0, 0xd9a07a, 0xc98a6a, 0xeadfc8, 0xb7c6d8, 0xd8b890], {x: 1200});
construirCidade('cidade-antiga', [0xf0ece0, 0xe8dcc4, 0xd8ccb0, 0xf4efe4, 0xe0c9a0], {x: 1500, templo: true, telhado: 'plano', chao: 0xb8ad98, rua: 0xcfc4a8});

// ---- CAMPO (planicie / batalha / colina) ----
(function () {
  const a = novoAmb('campo', cfgDia({ceu: CEU_POR, fundo: 0xd9764a, nevoa: [0xe8b080, 40, 170], dirCor: 0xffb070, dirInt: 1.05, dirPos: [-14, 9, 12], hemiCeu: 0xffd0a0, hemiChao: 0x4a5a30, hemiInt: 1.0}));
  a.g.position.x = 1800;
  const gr = mesh(new THREE.PlaneGeometry(400, 400), M(0x5a9a42), 0, 0, -60, a.g); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true;
  for (let i = 0; i < 18; i++) { const c = mesh(new THREE.SphereGeometry(rr(10, 22), 12, 8), M(pick([0x4e8a3a, 0x5a9a42, 0x447a34, 0x6aa84a])), rr(-90, 90), -rr(3, 7), -rr(30, 110), a.g); c.scale.y = 0.35; }
  for (const [x, z, c] of [[-9, -10, 0xe8dcc0], [-12, -14, 0xb8412a], [10, -12, 0xe8dcc0], [13, -9, 0x2f6fd0], [-6, -20, 0xb8412a], [8, -24, 0xe8dcc0]]) { const t = mesh(new THREE.ConeGeometry(2.2, 3.4, 8), M(c), x, 1.7, z, a.g); t.castShadow = true; mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 4), M(0x5b3a20), x, 4, z, a.g); }
  for (let f = 0; f < 3; f++) for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) { const cx = -16 + i * 2.7, cz = -34 - r * 2 - f * 0, col = f === 0 ? 0x1c3a7a : (f === 1 ? 0xb8281e : 0x2f7a3a); const o = f === 0 ? 0 : (f === 1 ? 0 : 0);
    const s = mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.0, 6), M(col), cx * (f === 2 ? 0 : 1) + (f === 1 ? 0 : 0), 0.5, cz - (f === 1 ? 7 : 0), a.g); mesh(new THREE.SphereGeometry(0.28, 6, 6), M(0xe3b48a), s.position.x, 1.25, s.position.z, a.g); if (f === 2) { s.visible = false; } }
  bandeiraPano(a, -5, 0, -30, 0x1c3a7a, 0xf6f1e6); bandeiraPano(a, 6, 0, -31, 0xb8281e, 0xe8c14a);
  canhao(a, -4, -6, 1); canhao(a, 4.5, -8, -1); fumaca(a, -4, -9, 5); fumaca(a, 14, -40, 5);
  for (let i = 0; i < 10; i++) mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), M(0x6b4423), -8 + i * 1.8, 0.45, 1.2, a.g);
  sol(a, 70, 20, -130, 0xffe0a0, 8); nuvens(a, 0xf0c090, 8); aves(a, 4, 0, 12, -25, 14, 0x333344);
  stdCams(a, [0.2, 4.0], [0, 1.6, -14], [[-1.8, -2.5], [2.2, -5], [-2.6, -8]]);
})();

// ---- LABORATORIO ----
(function () {
  const a = novoAmb('laboratorio', cfgInterior({hemiCeu: 0x9a8a6a, hemiInt: 0.85, pontoInt: 12}));
  a.g.position.x = 2100;
  chao(a, 0x6b4a2a, 12, 14, 0, -0.15, -2); mesh(new THREE.BoxGeometry(12, 6, 0.3), M(0x7a8a74), 0, 3, -8.5, a.g); for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.3, 6, 14), M(0x6a7a64), 6 * s, 3, -2, a.g); mesh(new THREE.BoxGeometry(12, 0.3, 14), M(0x5a4a3a), 0, 6, -2, a.g);
  mesh(new THREE.BoxGeometry(5, 3, 0.1), new THREE.MeshBasicMaterial({map: quadroTex}), 0, 3.2, -8.3, a.g); mesh(new THREE.BoxGeometry(5.3, 3.3, 0.08), M(0x5b3a20), 0, 3.2, -8.35, a.g);
  mesh(new THREE.CylinderGeometry(1, 1, 0.12, 18), B(0x1b2c5a), -4.2, 3.6, -8.3, a.g).rotation.x = Math.PI / 2; mesh(new THREE.TorusGeometry(1.02, 0.08, 6, 18), M(0xc9a13a), -4.2, 3.6, -8.28, a.g); brilho(0x8fb0ff, 3.4, -4.2, 3.6, -8.1, a.g);
  for (const [x, z] of [[-2.4, -4.5], [2.4, -4.5]]) { mesh(new THREE.BoxGeometry(2.6, 0.2, 1.4), M(0x7a4d26), x, 1.0, z, a.g).castShadow = true; for (const dx of [-1.1, 1.1]) for (const dz of [-0.5, 0.5]) mesh(new THREE.BoxGeometry(0.14, 1, 0.14), M(0x5b3a20), x + dx, 0.5, z + dz, a.g);
    for (let i = 0; i < 3; i++) { const c = pick([0x3ad86a, 0xd83a8a, 0x3a8ad8, 0xe8c14a]); mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.5, 10), new THREE.MeshLambertMaterial({color: c, transparent: true, opacity: 0.75}), x - 0.8 + i * 0.7, 1.35, z, a.g); brilho(c, 0.9, x - 0.8 + i * 0.7, 1.4, z, a.g); } }
  mesh(new THREE.SphereGeometry(0.4, 14, 10), M(0xd82a2a), 0.0, 1.2, -4.3, a.g); mesh(new THREE.BoxGeometry(0.03, 0.12, 0.03), M(0x2a5a1a), 0, 1.65, -4.3, a.g);
  for (let s = 0; s < 2; s++) { mesh(new THREE.BoxGeometry(3, 4, 0.7), M(0x5b3a20), 4.6 * (s ? -1 : 1) + (s ? 0 : 0), 2, -7.9, a.g); for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) mesh(new THREE.BoxGeometry(0.2, 0.7, 0.45), M([0x7a1f2e, 0x2f4f3a, 0x1c2a5c, 0x8a6a2a, 0xb8832a][i % 5]), (s ? -1 : 1) * 4.6 - 1.2 + i * 0.28, 0.9 + r * 1.2, -7.7, a.g); }
  mesh(new THREE.SphereGeometry(0.5, 14, 10), M(0x3a7ab8), -1.2, 1.6, -3.4, a.g); mesh(new THREE.CylinderGeometry(0.06, 0.24, 0.3, 8), M(0xc9a13a), -1.2, 1.2, -3.4, a.g);
  lanternaPendurada(a, 0, 5.0, -3); lanternaPendurada(a, -5, 3, -2); lanternaPendurada(a, 5, 3, -2);
  mesh(new THREE.TorusGeometry(2.0, 0.08, 6, 24), M(0x8a8a96), 0, 0.03, -2, a.g).rotation.x = Math.PI / 2;
  mesh(new THREE.BoxGeometry(12, 6, 0.3), M(0x7a8a74), 0, 3, 5.4, a.g);
  a.cams.ampla = u => ({pos: [4.4 - u * 2, 3.0, 4.6], look: [0, 1.4, -4], fov: 70});
  stdCams(a, [0.2, 2.4], [0, 1.6, -6], [[-1.5, -2.5], [1.9, -2.8], [0, -4.3]]);
})();

// ---- LUA ----
(function () {
  const a = novoAmb('lua', {hemiCeu: 0x7a7a9a, hemiChao: 0x6a6a78, hemiInt: 1.9, pontoCor: 0xffffff, pontoInt: 0.001, pontoDist: 8, pontoPos: [0, 5, 0], dirCor: 0xffffff, dirInt: 2.4, dirPos: [-14, 9, 8],
    fundo: 0x000008, nevoa: [0x000008, 120, 400], ceu: [0x000004, 0x000008, 0x05050f]});
  a.g.position.x = 2400;
  const solo = mesh(new THREE.PlaneGeometry(500, 500, 40, 40), M(0x9a9aa2, {flatShading: true}), 0, 0, -60, a.g); solo.rotation.x = -Math.PI / 2; solo.receiveShadow = true;
  const gp = solo.geometry.attributes.position; for (let i = 0; i < gp.count; i++) gp.setZ(i, (Math.sin(gp.getX(i) * 0.15) * Math.cos(gp.getY(i) * 0.12)) * 0.5); solo.geometry.computeVertexNormals();
  for (let i = 0; i < 26; i++) { const r = rr(1.2, 4), x = rr(-30, 30), z = -rr(6, 70); mesh(new THREE.CylinderGeometry(r, r, 0.05, 20), M(0x6a6a72), x, 0.1, z, a.g); mesh(new THREE.TorusGeometry(r, 0.18, 6, 20), M(0xb0b0b8), x, 0.12, z, a.g).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 24; i++) mesh(new THREE.DodecahedronGeometry(rr(0.2, 0.9), 0), M(0x7a7a84, {flatShading: true}), rr(-30, 30), 0.2, -rr(2, 60), a.g).castShadow = true;
  const ter = mesh(new THREE.SphereGeometry(14, 24, 18), new THREE.MeshBasicMaterial({map: terraTex, fog: false}), -55, 55, -130, a.g); brilho(0x7aaaff, 52, -55, 55, -130, a.g);
  a.anim.push(t => { ter.rotation.y = t * 0.05; });
  const mod = new THREE.Group(); mesh(new THREE.BoxGeometry(3, 2.2, 3), M(0xd9b24a, {emissive: 0x2a1c00}), 0, 3.2, 0, mod).castShadow = true; mesh(new THREE.CylinderGeometry(1.6, 2.0, 1.2, 8), M(0xe8e8ee), 0, 1.7, 0, mod);
  for (const [x, z] of [[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]]) { const p = mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 5), M(0xc8c8d0), x, 1.3, z, mod); p.rotation.z = x > 0 ? -0.3 : 0.3; mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 10), M(0xc8c8d0), x * 1.3, 0.04, z * 1.3, mod); }
  mod.position.set(8, 0, -18); a.g.add(mod);
  bandeiraPano(a, -3.5, 0, -12, 0xb81e2e, 0xf6f1e6);
  for (let i = 0; i < 12; i++) mesh(new THREE.SphereGeometry(0.22, 6, 4), M(0x5a5a62), rr(-2, 2), 0.02, 1 - i * 0.9, a.g).scale.set(1, 0.1, 1.8);
  stdCams(a, [0.2, 4.0], [0, 1.6, -14], [[-1.8, -2], [2.2, -4.5], [0, -8]]);
})();

// ---- ARENA (coliseu) ----
(function () {
  const a = novoAmb('arena', cfgDia({hemiChao: 0xb89a60}));
  a.g.position.x = 2700;
  const areia = mesh(new THREE.CylinderGeometry(15, 15, 0.3, 40), M(0xe3c78f), 0, -0.15, -4, a.g); areia.receiveShadow = true;
  for (let t = 0; t < 4; t++) { const r1 = 15 + t * 2.2, hh = 3.2; for (let i = 0; i < 40; i++) { const ang = i / 40 * Math.PI * 2, x = Math.cos(ang) * r1, z = -4 + Math.sin(ang) * r1;
      const blk = mesh(new THREE.BoxGeometry(2.6, hh, 2.4), M(t % 2 ? 0xd8cba8 : 0xe8dcc0), x, t * 2.4 + hh / 2, z, a.g); blk.rotation.y = -ang + Math.PI / 2; if (t === 0) { const arco = mesh(new THREE.BoxGeometry(1.2, 2.0, 0.3), B(0x1a1410), Math.cos(ang) * (r1 - 1.2), 1.0, -4 + Math.sin(ang) * (r1 - 1.2), a.g); arco.rotation.y = -ang + Math.PI / 2; } } }
  for (let t = 0; t < 3; t++) for (let i = 0; i < 70; i++) { const ang = i / 70 * Math.PI * 2, r = 15.6 + t * 2.2; mesh(new THREE.SphereGeometry(0.28, 6, 5), M(pick([0xe8c14a, 0xb81e2e, 0x2f6fd0, 0xf6f1e6, 0x3a8a4a, 0xe08a5a])), Math.cos(ang) * r, 3.4 + t * 2.4, -4 + Math.sin(ang) * r, a.g); }
  for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2; bandeiraPano(a, Math.cos(ang) * 17, 6.5, -4 + Math.sin(ang) * 17, 0xb81e2e, 0xe8c14a); }
  mesh(new THREE.BoxGeometry(2.4, 0.2, 2.4), M(0x8a7a60), 0, 0.1, -4, a.g);
  sol(a, 50, 60, -100, 0xfff6d0, 6); nuvens(a, 0xffffff, 6); aves(a, 5, 0, 20, -4, 12, 0xffffff);
  a.cams.ampla = u => ({pos: [3 - u * 4, 4.6, 8.2], look: [0, 1.5, -6], fov: 68});
  stdCams(a, [0.2, 4.0], [0, 1.6, -8], [[-2.0, -1.0], [2.4, -3.0], [0, -6.5]]);
})();

// ---- DESERTO (Egito) ----
(function () {
  const a = novoAmb('deserto', cfgDia({ceu: [0x2f78c8, 0xe8c080, 0xffe6b0], fundo: 0xf0d090, nevoa: [0xf2dcb0, 40, 180], dirCor: 0xffe0a8, dirInt: 1.2, hemiChao: 0xc9a060}));
  a.g.position.x = 3000;
  const ar = mesh(new THREE.PlaneGeometry(500, 500), M(0xe2c27a), 0, 0, -60, a.g); ar.rotation.x = -Math.PI / 2; ar.receiveShadow = true;
  for (let i = 0; i < 16; i++) { const d = mesh(new THREE.SphereGeometry(rr(8, 20), 12, 8), M(pick([0xe8c880, 0xd9b668, 0xeccf90])), rr(-90, 90), -rr(3, 6), -rr(15, 120), a.g); d.scale.y = 0.3; }
  for (const [x, z, s] of [[-14, -70, 1.5], [10, -86, 2.1], [34, -62, 1.0]]) { const p = mesh(new THREE.ConeGeometry(14 * s, 14 * s, 4), M(0xe2b868, {flatShading: true}), x, 7 * s, z, a.g); p.rotation.y = Math.PI / 4; p.castShadow = true; }
  mesh(new THREE.BoxGeometry(2.2, 14, 2.2), M(0xe8c88a), -22, 7, -30, a.g); mesh(new THREE.ConeGeometry(1.5, 2, 4), M(0xe8c14a, {emissive: 0x3a2a00}), -22, 15, -30, a.g).rotation.y = Math.PI / 4;
  const es = mesh(new THREE.BoxGeometry(2.8, 2.4, 6), M(0xd9b668), 12, 1.2, -30, a.g); mesh(new THREE.SphereGeometry(1.3, 12, 10), M(0xd9b668), 12, 3.2, -27.4, a.g);
  for (let i = 0; i < 8; i++) palmeira(a, rr(-14, 14), -rr(8, 40), rr(3, 4.5), rr(-0.2, 0.2));
  for (const [x, z, c] of [[-5, -8, 0xb8412a], [5, -11, 0x2f6fd0], [-6, -16, 0xe8c14a]]) { mesh(new THREE.BoxGeometry(2.6, 0.12, 2.2), M(c), x, 2.4, z, a.g); for (const dx of [-1.2, 1.2]) mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 4), M(0x5b3a20), x + dx, 1.2, z - 1, a.g); }
  sol(a, 40, 60, -110, 0xfff2c0, 9); nuvens(a, 0xfff4e0, 4); aves(a, 4, 0, 16, -22, 12, 0x2a2a30);
  stdCams(a, [0.2, 4.0], [0, 1.6, -14], [[-1.8, -2.5], [2.2, -5], [-2.6, -8]]);
})();

// ---- AERODROMO (14-bis) ----
(function () {
  const a = novoAmb('aerodromo', cfgDia());
  a.g.position.x = 3300;
  const gr = mesh(new THREE.PlaneGeometry(500, 500), M(0x68a84a), 0, 0, -60, a.g); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true;
  mesh(new THREE.BoxGeometry(6, 0.04, 60), M(0xb8ad98), 0, 0.02, -20, a.g);
  const pl = new THREE.Group(); const asa = (y) => { mesh(new THREE.BoxGeometry(4.6, 0.12, 1.3), M(0xf2e8d0), 0, y, 0, pl).castShadow = true; };
  asa(1.2); asa(2.4); for (const s of [-1, 1]) for (const z of [-0.5, 0.5]) mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 4), M(0x5b3a20), 2.0 * s, 1.8, z, pl);
  mesh(new THREE.BoxGeometry(0.15, 0.15, 3.6), M(0x5b3a20), 0, 1.0, 0.9, pl); mesh(new THREE.BoxGeometry(1.4, 0.1, 0.5), M(0xf2e8d0), 0, 1.0, 2.7, pl); mesh(new THREE.BoxGeometry(0.1, 0.9, 0.4), M(0xf2e8d0), 0, 1.4, 2.7, pl);
  mesh(new THREE.BoxGeometry(1.2, 0.1, 0.5), M(0xf2e8d0), 0, 1.0, -1.8, pl); for (const s of [-1, 1]) { const w = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 12), M(0x222222), 0.9 * s, 0.4, 0.2, pl); w.rotation.z = Math.PI / 2; }
  mesh(new THREE.BoxGeometry(0.6, 0.6, 0.8), M(0x7a4d26), 0, 1.0, 0.2, pl);
  pl.scale.setScalar(1.7); pl.position.set(0, 0, -10); a.g.add(pl); a.anim.push(t => { pl.position.y = Math.sin(t * 2) * 0.01; });
  mesh(new THREE.BoxGeometry(10, 5, 8), M(0xb8412a), 16, 2.5, -20, a.g); mesh(new THREE.CylinderGeometry(5, 5, 8, 12, 1, false, 0, Math.PI), M(0x8a8f9c), 16, 5, -20, a.g).rotation.set(Math.PI / 2, 0, Math.PI / 2);
  const m = mesh(new THREE.CylinderGeometry(0.04, 0.04, 4, 5), M(0xdddddd), -7, 2, -6, a.g); const man = mesh(new THREE.ConeGeometry(0.4, 1.6, 8), M(0xe8742a), -6.2, 4, -6, a.g); man.rotation.z = Math.PI / 2; a.anim.push(t => { man.rotation.y = Math.sin(t * 3) * 0.2; });
  for (let i = 0; i < 12; i++) { const x = rr(-30, 30); if (Math.abs(x) < 8) continue; mesh(new THREE.CylinderGeometry(0.2, 0.3, 3, 6), M(0x6a4a2a), x, 1.5, -rr(10, 60), a.g); }
  for (let i = 0; i < 12; i++) { const t = a.g.children[a.g.children.length - 1 - i]; }
  for (let i = 0; i < 12; i++) mesh(new THREE.SphereGeometry(rr(1.2, 2), 8, 6), M(0x3a8a3a, {flatShading: true}), rr(-34, 34), 3.4, -rr(12, 60), a.g).scale.y = 0.9;
  sol(a, 60, 60, -120, 0xfff6d0, 6); nuvens(a, 0xffffff, 9); aves(a, 5, 0, 20, -18, 14, 0xffffff);
  stdCams(a, [0.2, 4.0], [0, 1.6, -10], [[-3.8, -3], [3.6, -4], [-5.5, -8]]);
})();

// ---- SELVA / JURASSICO ----
(function () {
  const a = novoAmb('selva', cfgDia({ceu: [0x2a6a8a, 0x7ab8a0, 0xf0d9a0], fundo: 0xa8d0a8, nevoa: [0xbcd8b0, 18, 110], dirCor: 0xffe8b0, dirInt: 1.0, hemiCeu: 0xaaf0c0, hemiChao: 0x3a5a2a, hemiInt: 1.05}));
  a.g.position.x = 3600;
  const gr = mesh(new THREE.PlaneGeometry(400, 400), M(0x3f7a38), 0, 0, -60, a.g); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true;
  const rio = mesh(new THREE.BoxGeometry(8, 0.05, 120), M(0x3a9ad8), 9, 0.03, -40, a.g); a.anim.push(t => { rio.position.x = 9 + Math.sin(t) * 0.05; });
  for (let i = 0; i < 50; i++) { const x = rr(-40, 40), z = -rr(4, 70); if (Math.abs(x) < 4 && z > -24) continue; const h = rr(5, 11); const tr = mesh(new THREE.CylinderGeometry(0.3, 0.5, h, 6), M(0x5b3a20), x, h / 2, z, a.g); tr.castShadow = true;
    if (rnd() < 0.5) { for (let k = 0; k < 6; k++) { const f = mesh(new THREE.BoxGeometry(0.5, 0.06, 3.4), M(0x2f9a3c, {flatShading: true}), x, h, z, a.g); f.geometry.translate(0, 0, 1.7); f.rotation.y = k * 1.05; f.rotation.x = 0.35; } } else mesh(new THREE.SphereGeometry(rr(2.4, 3.6), 8, 6), M(pick([0x2f8a3c, 0x3a9a44, 0x24743a]), {flatShading: true}), x, h + 1, z, a.g); }
  for (let i = 0; i < 30; i++) { const x = rr(-12, 12), z = -rr(2, 30); for (let k = 0; k < 5; k++) { const f = mesh(new THREE.ConeGeometry(0.16, 1.4, 4), M(0x3aa44a), x + rr(-0.3, 0.3), 0.6, z + rr(-0.3, 0.3), a.g); f.rotation.set(rr(-0.5, 0.5), 0, rr(-0.5, 0.5)); } }
  const vul = mesh(new THREE.ConeGeometry(30, 34, 10), M(0x5a4a42, {flatShading: true}), -30, 17, -110, a.g); brilho(0xff6a1e, 18, -30, 34, -110, a.g); mesh(new THREE.ConeGeometry(4, 4, 8), B(0xff7a2e), -30, 33, -110, a.g); fumaca(a, -30, -110, 6);
  sol(a, 60, 45, -120, 0xfff0c0, 6); nuvens(a, 0xffffff, 5); aves(a, 6, 0, 16, -30, 14, 0x2a2a30);
  stdCams(a, [0.2, 4.0], [0, 1.6, -14], [[-2.2, -3], [2.6, -5.5], [-3, -9]]);
})();

// ---------------------------------------------------------------- aplica cameras padrao nos cenarios originais (navio, praia, cabine)
stdCams(amb.conves, [0.2, 2.6], [0, 1.6, -9], [[-1.3, -3.2], [2.1, -9], [-2.0, -12]]);
stdCams(amb.terra, [0, 2.0], [1, 1.4, -20], [[-1.5, -19], [2.5, -22], [6, -18]]);
amb.cabine.cams.ampla = amb.cabine.cams.sala;
mesh(new THREE.BoxGeometry(9, 4.2, 0.3), M(0x5a3a1e), 0, 2.1, 3.0, amb.cabine.g);
stdCams(amb.cabine, [-1.8, -1.0], [0.3, 1.5, -4.4], [[0.3, -4.4], [2.6, -4.6], [-2.6, -4.8]]);
stdCams(amb.cabine, [-1.8, -1.0], [0.3, 1.5, -4.4], [[0.3, -4.4], [2.6, -4.6], [-2.6, -4.8]]);

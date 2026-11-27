var ENTS3D = window.ENTS3D || (window.ENTS3D = {});
// Cenario GAVEA: cesto da gavea (crow's nest) do Titanic, 14/04/1912, 23h39. Noite sem lua, mar parado,
// ceu cheio de estrelas. Visao do vigia para a proa; atras, a ponte de comando iluminada e a 1a chamine.
// Carregado depois de ambiente_vapor.js e antes de polir.js. Pontos de interesse em a.pontos (diretor3d.js).
Object.assign(PAPEIS, {
  vigia:  {roupa: 0x1d2536, pele: 0xf0c8a0, chapeu: 'bone', corChapeu: 0x161c2a, cabelo: 0x3a2818, cinto: 0x111111, bota: 0x15151a, botoes: 0xc9a14a},
  vigia2: {roupa: 0x242c3e, pele: 0xe8b48a, chapeu: 'bone', corChapeu: 0x1a2030, bigode: 0x4a3020, cabelo: 0x4a3020, cinto: 0x111111, bota: 0x15151a, botoes: 0xc9a14a},
  oficial: {roupa: 0x10141f, pele: 0xf0c8a0, chapeu: 'bone', corChapeu: 0x10141f, barba: 0x8a7a6a, cinto: 0xc9a14a, botoes: 0xe8c14a, gola: true},
});
(function () {
  const a = novoAmb('gavea', {hemiCeu: 0x8ea2e8, hemiChao: 0x26304a, hemiInt: 2.3, pontoCor: 0xc8d4ff, pontoInt: 1.6, pontoDist: 7, pontoPos: [-0.2, 14.2, -29.6],
    dirCor: 0xb8c8ff, dirInt: 1.6, dirPos: [-14, 34, -40], fundo: 0x0a1226, nevoa: [0x16244a, 80, 250], ceu: [0x03060f, 0x0e1a3c, 0x2c3e70], semEstrelas: false});
  a.g.position.x = 4800;
  const aco = M(0x16181e), branco = M(0xece8dc), deck = M(0x9a7a52), ferro = M(0x2a2e36), bege = M(0xc99a3e), madeira = M(0x6a4526);
  const NEST_Y = 11, MAST_Z = -30;

  // ---- mar parado (espelho) com o reflexo das estrelas
  const marGeo = new THREE.PlaneGeometry(700, 700, 40, 40); marGeo.rotateX(-Math.PI / 2);
  const marM = mesh(marGeo, new THREE.MeshStandardMaterial({color: 0x0e1a38, roughness: 0.3, metalness: 0.3}), 0, -9, -60, a.g);
  a.mar = marM; a.marCor = new THREE.Color(0x0e1a38);
  const mb = Float32Array.from(marGeo.attributes.position.array);
  a.anim.push(t => { const p = marGeo.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 1] = Math.sin(mb[i] * 0.2 + t * 0.6) * 0.04; marGeo.attributes.position.needsUpdate = true; });
  { const pts = []; for (let i = 0; i < 900; i++) { const r = 30 + rnd() * 300, an = -Math.PI * 0.15 - rnd() * Math.PI * 0.7; pts.push(Math.cos(an) * r * 1.6, -8.9, Math.sin(an) * r - 40); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    a.g.add(new THREE.Points(sg, new THREE.PointsMaterial({color: 0xbfd0ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.55}))); }
  // estrelas extras (noite sem lua: o ceu e um mar de estrelas) + via lactea
  { const pts = []; for (let i = 0; i < 1600; i++) { const an = rnd() * Math.PI * 2, e = 0.05 + Math.pow(rnd(), 0.7) * 1.4, r = 172; pts.push(Math.cos(an) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(an) * Math.cos(e) * r - 60); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    a.g.add(new THREE.Points(sg, new THREE.PointsMaterial({color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false})));
    const via = canvasTex(512, 128, (g, w, h) => { for (let i = 0; i < 2600; i++) { const x = Math.random() * w, y = h / 2 + (Math.random() - 0.5) * h * 0.7 * Math.random(); g.fillStyle = `rgba(200,210,255,${Math.random() * 0.25})`; g.fillRect(x, y, 2, 2); } });
    const vm = mesh(new THREE.PlaneGeometry(260, 60), new THREE.MeshBasicMaterial({map: via, transparent: true, opacity: 0.6, depthWrite: false, fog: false}), 0, 110, -150, a.g); vm.rotation.set(0.5, 0, 0.6); }

  // ---- casco (so a parte da frente aparece) e proa em ponta
  mesh(new THREE.BoxGeometry(9, 9, 80), aco, 0, -4.5, -20, a.g).castShadow = true;
  mesh(new THREE.BoxGeometry(9.1, 0.4, 80), branco, 0, -0.25, -20, a.g);
  { const s = new THREE.Shape(); s.moveTo(-4.5, 0); s.lineTo(4.5, 0); s.lineTo(0, -16); s.lineTo(-4.5, 0);
    const gg = new THREE.ExtrudeGeometry(s, {depth: 9, bevelEnabled: false}); gg.rotateX(Math.PI / 2); gg.translate(0, 0, -60);
    mesh(gg, aco, 0, 0, 0, a.g).castShadow = true;
    const gd = new THREE.ExtrudeGeometry(s, {depth: 0.3, bevelEnabled: false}); gd.rotateX(Math.PI / 2); gd.translate(0, 0.05, -60);
    mesh(gd, deck, 0, 0, 0, a.g).receiveShadow = true; }
  // conves do castelo de proa (madeira) e poço mais baixo atras dele
  mesh(new THREE.BoxGeometry(8.8, 0.3, 26), deck, 0, -0.1, -47, a.g).receiveShadow = true;
  for (let i = -4; i <= 4; i++) mesh(new THREE.BoxGeometry(0.03, 0.02, 26), M(0x5a4228), i * 0.95, 0.06, -47, a.g);
  mesh(new THREE.BoxGeometry(8.8, 0.3, 24), deck, 0, -2.6, -22, a.g).receiveShadow = true;
  mesh(new THREE.BoxGeometry(8.8, 2.6, 0.3), branco, 0, -1.3, -34, a.g);
  // amurada da proa (corrimao) dos dois lados ate a ponta
  for (const s of [-1, 1]) {
    const pts = [[4.4 * s, -34], [4.4 * s, -60], [0.15 * s, -75.5]];
    for (let k = 0; k < pts.length - 1; k++) { const [x0, z0] = pts[k], [x1, z1] = pts[k + 1]; const L = Math.hypot(x1 - x0, z1 - z0);
      const r = mesh(new THREE.BoxGeometry(0.12, 0.12, L), ferro, (x0 + x1) / 2, 1.1, (z0 + z1) / 2, a.g); r.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      const r2 = mesh(new THREE.BoxGeometry(0.06, 0.06, L), ferro, (x0 + x1) / 2, 0.6, (z0 + z1) / 2, a.g); r2.rotation.y = r.rotation.y;
      for (let u = 0; u <= 1; u += 1.6 / L) mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 5), ferro, lerp(x0, x1, u), 0.55, lerp(z0, z1, u), a.g); }
  }
  // cabrestantes, cabecos, guindastes de ancora, escotilha
  for (const [x, z] of [[-1.6, -52], [1.6, -52], [0, -58]]) { mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.8, 14), ferro, x, 0.4, z, a.g).castShadow = true; mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.12, 14), M(0x3a3e48), x, 0.85, z, a.g); }
  for (const s of [-1, 1]) for (const z of [-40, -46, -56]) { mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.5, 8), ferro, 3.6 * s, 0.25, z, a.g); mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.5, 8), ferro, 3.6 * s, 0.25, z - 0.6, a.g); }
  for (const s of [-1, 1]) { const gq = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8), ferro, 0, 1.3, 0, gq); const b = mesh(new THREE.BoxGeometry(0.12, 0.12, 2.0), ferro, 0, 2.5, -0.8, gq); b.rotation.x = -0.3; gq.position.set(2.6 * s, 0, -63); a.g.add(gq); }
  mesh(new THREE.BoxGeometry(3.4, 0.5, 3.0), madeira, 0, 0.25, -41, a.g).castShadow = true;
  mesh(new THREE.BoxGeometry(3.6, 0.08, 3.2), M(0x3a2a1a), 0, 0.52, -41, a.g);
  // luz de navegacao no mastro e lampadas fracas no castelo de proa
  for (const [x, z] of [[-3.8, -36], [3.8, -36], [-3.2, -50], [3.2, -50], [0, -64]]) { mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 4), ferro, x, 0.7, z, a.g); mesh(new THREE.SphereGeometry(0.13, 8, 6), B(0xffe4a8), x, 1.45, z, a.g); brilho(0xffc878, 1.1, x, 1.45, z, a.g); }
  { const l = new THREE.PointLight(0xffd8a0, 6, 30, 1.6); l.position.set(0, 4, -50); a.g.add(l); }

  // ---- mastro de proa, cesto da gavea, estai ate a proa
  mesh(new THREE.CylinderGeometry(0.22, 0.32, 24, 12), M(0x8a6a44), 0, 12, MAST_Z, a.g).castShadow = true;
  mesh(new THREE.CylinderGeometry(0.12, 0.16, 6, 8), M(0x8a6a44), 0, 26, MAST_Z, a.g);
  brilho(0xfff0c8, 3.2, 0, 23.6, MAST_Z - 0.3, a.g); mesh(new THREE.SphereGeometry(0.16, 8, 6), B(0xfff6dc), 0, 23.6, MAST_Z - 0.3, a.g);
  { const cabo = (p0, p1) => { const v = new THREE.Vector3(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]); const L = v.length();
      const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, L, 4), M(0x1a1a1e), (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2, a.g);
      c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize()); };
    cabo([0, 22, MAST_Z], [0, 1.5, -74]); cabo([0, 22, MAST_Z], [3.8, 0.6, -38]); cabo([0, 22, MAST_Z], [-3.8, 0.6, -38]);
    cabo([0, 22, MAST_Z], [0, 18, 20]); }
  // cesto: anel de ferro aberto em cima, piso de tabuas
  const cesto = new THREE.Group(); cesto.position.set(0, NEST_Y, MAST_Z); a.g.add(cesto);
  mesh(new THREE.CylinderGeometry(1.45, 1.4, 0.15, 24), madeira, 0, 0, 0, cesto).receiveShadow = true;
  const parede = mesh(new THREE.CylinderGeometry(1.5, 1.45, 1.15, 28, 1, true), new THREE.MeshStandardMaterial({color: 0x2a2e38, roughness: 0.6, metalness: 0.3, side: THREE.DoubleSide}), 0, 0.6, 0, cesto);
  parede.castShadow = true;
  for (const y of [0.05, 1.18]) { const r = mesh(new THREE.TorusGeometry(1.5, 0.05, 6, 32), M(0x14161c), 0, y, 0, cesto); r.rotation.x = Math.PI / 2; }
  // sino de bronze num suporte na frente do cesto, com a cordinha
  const sinoG = new THREE.Group(); sinoG.position.set(-0.45, 2.95, -1.3); cesto.add(sinoG);
  mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), ferro, 0, 0.2, 0.32, sinoG).rotation.x = 0.0;
  mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 5), ferro, 0, -0.2, 0.68, sinoG);
  const sinoCorpo = new THREE.Group(); sinoCorpo.position.set(0, 0.2, 0); sinoG.add(sinoCorpo);
  { const perfil = [[0.0, 0.02], [0.08, 0.02], [0.1, -0.02], [0.11, -0.1], [0.14, -0.22], [0.2, -0.3], [0.25, -0.34], [0.24, -0.36], [0.0, -0.36]].map(([x, y]) => new THREE.Vector2(x, y));
    mesh(new THREE.LatheGeometry(perfil, 20), M(0xd4a23a, {metalness: 0.65, roughness: 0.3, emissive: 0x2a1a00, side: THREE.DoubleSide}), 0, 0, 0, sinoCorpo); }
  mesh(new THREE.TorusGeometry(0.235, 0.03, 6, 16), M(0xb8852a, {metalness: 0.6}), 0, -0.34, 0, sinoCorpo).rotation.x = Math.PI / 2;
  const corda = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.55, 4), M(0x8a7a5a), 0, -0.6, 0, sinoCorpo);
  a.sino = {g: sinoCorpo, corda};
  // telefone da ponte de comando (caixa de madeira com o fone pendurado)
  const tel = new THREE.Group(); tel.position.set(-1.38, 1.3, 0.15); tel.rotation.y = Math.PI / 2; cesto.add(tel);
  mesh(new THREE.BoxGeometry(0.34, 0.46, 0.18), madeira, 0, 0, 0, tel);
  mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), M(0x2a2a2a), 0, 0.08, 0.1, tel).rotation.x = Math.PI / 2;
  const fone = new THREE.Group(); mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.28, 8), M(0x111111), 0, 0, 0, fone);
  mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.07, 10), M(0x111111), 0, 0.16, 0, fone); fone.position.set(0.22, -0.02, 0.06); tel.add(fone);
  a.telefone = {g: tel, fone};

  // ---- atras: ponte de comando iluminada e a primeira chamine (o que se ve ao olhar para tras)
  mesh(new THREE.BoxGeometry(9, 4.2, 9), branco, 0, 2.1 - 2.6, 4, a.g).castShadow = true;
  mesh(new THREE.BoxGeometry(7, 3, 6), branco, 0, 3.0, 5, a.g).castShadow = true;
  mesh(new THREE.BoxGeometry(11, 0.25, 2.2), branco, 0, 4.6, 1.6, a.g);
  for (let i = -3; i <= 3; i++) { mesh(new THREE.BoxGeometry(0.7, 0.55, 0.05), B(0xffdc8a), i * 0.95, 3.4, 1.98, a.g); }
  for (let i = -4; i <= 4; i++) mesh(new THREE.BoxGeometry(0.5, 0.4, 0.05), B(0xffe2a0), i * 0.95, 0.2, -0.52, a.g);
  brilho(0xffc070, 9, 0, 3.4, 2.4, a.g);
  mesh(new THREE.CylinderGeometry(2.0, 2.3, 14, 20), bege, 0, 9, 16, a.g).castShadow = true;
  mesh(new THREE.CylinderGeometry(2.02, 2.02, 2.4, 20), M(0x111114), 0, 15, 16, a.g);
  const fum = []; for (let k = 0; k < 6; k++) { const b = mesh(new THREE.SphereGeometry(1.4, 8, 6), new THREE.MeshBasicMaterial({color: 0x2a2c36, transparent: true, opacity: 0.35}), 0, 17, 16, a.g); fum.push({b, f: k / 6}); }
  a.anim.push(t => { for (const o of fum) { const k = (t * 0.12 + o.f) % 1; o.b.position.set(-k * 2, 17 + k * 7, 16 + k * 10); o.b.scale.setScalar(0.8 + k * 2.6); o.b.material.opacity = 0.35 * (1 - k); } });

  // ---- elenco: voce (Frederick Fleet) e o outro vigia (Reginald Lee), em pe dentro do cesto
  { const f = new THREE.PointLight(0xc8d6ff, 3.2, 6, 1.5); f.position.set(0.2, NEST_Y + 2.6, MAST_Z - 2.2); a.g.add(f); }
  a.chaoY = NEST_Y + 0.08;
  a.P = [-0.75, MAST_Z - 0.35]; a.Pry = Math.PI;
  a.slots = [[0.8, MAST_Z - 1.0, Math.PI + 0.35]];
  a.camExterna = [-16, 26, -6];
  a.pov = {pos: [-0.75, NEST_Y + 1.95, MAST_Z - 0.35]};
  const P = (x, y, z) => ({pos: [x, y, z]});
  a.pontos = {
    'proa': P(0, 0.5, -70), 'mar': P(0, -9, -150), 'horizonte': P(0, -6, -300), 'frente': P(0, -4, -200),
    'ceu': P(-10, 60, -140), 'estrelas': P(30, 90, -100), 'sino': P(-0.45, NEST_Y + 2.8, MAST_Z - 1.3), 'telefone': P(-1.38, NEST_Y + 1.3, MAST_Z + 0.15),
    'ponte': P(0, 3.4, 2), 'chamine': P(0, 12, 16), 'baixo': P(0, 0, -42), 'lado': P(14, -6, -40),
    'ice-longe': P(4, -9, -235), 'ice-frente': P(3.5, -9, -140), 'ice-perto': P(6.5, -9, -92), 'ice-lado': P(11, -9, -42), 'ice-passou': P(12, -9, 25),
    // planos de fora (camera no ar, olhando o navio e o iceberg)
    'ext-proa': {pos: [4, -2, -62], cam: [24, 6, -96]},
    'ext-lado': {pos: [4, -1, -40], cam: [26, 3, -10]},
    'ext-alto': {pos: [6, -2, -36], cam: [-20, 30, -12]},
  };
  a.cams.ampla = u => ({pos: [-0.55, NEST_Y + 2.0, MAST_Z - 0.3], look: [0, 0, -120], fov: 62});
  a.cams['eu-frente'] = u => ({pos: [-0.4, NEST_Y + 2.1, MAST_Z - 2.6], look: [-0.55, NEST_Y + 1.8, MAST_Z - 0.25], fov: 50});
})();

// ---- entidade: o iceberg (aparece da escuridao, cresce, raspa o lado direito do navio)
ENTS3D.iceberg = {
  build(a) {
    const g = new THREE.Group();
    const gelo = new THREE.MeshStandardMaterial({color: 0xeef6ff, roughness: 0.5, metalness: 0.0, flatShading: true, emissive: 0x3a4a6a});
    const gelo2 = new THREE.MeshStandardMaterial({color: 0xc8dcf4, roughness: 0.55, flatShading: true, emissive: 0x2a3858});
    const pecas = [[0, 6, 0, 9, 1.0, 1.3, 0.9], [-6, 3, 2, 6.5, 1.1, 0.9, 1.0], [5, 4, -2, 6, 1.0, 1.2, 1.0], [1, 12, 1, 4.2, 0.8, 1.4, 0.8], [-3, 9, -3, 4, 1, 1.1, 1], [7, 1.5, 3, 4, 1.2, 0.6, 1.1]];
    for (const [x, y, z, r, sx, sy, sz] of pecas) { const m = mesh(new THREE.IcosahedronGeometry(r, 0), (x + y) % 2 ? gelo : gelo2, x, y - 3, z, g); m.scale.set(sx, sy, sz); m.rotation.set(x * 0.3, y * 0.2, z * 0.4); m.castShadow = true; }
    return g;
  },
  update(obj, st, t) { obj.rotation.y = 0.3 + st.u * 0.15; }
};

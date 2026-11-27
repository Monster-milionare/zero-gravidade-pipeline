// Cenario VAPOR (navio a vapor de aco). Carregado depois de ambientes.js e antes de polir.js.
// ---- VAPOR (navio a vapor de aco: Titanic e transatlanticos; casco preto, chamines, botes) ----
(function () {
  const a = novoAmb('vapor', {hemiCeu: 0x8aa0f0, hemiChao: 0x2a2a34, hemiInt: 1.3, pontoCor: 0xffd890, pontoInt: 22, pontoDist: 18, pontoPos: [0.5, 3.4, -2],
    dirCor: 0xa8bcff, dirInt: 0.8, dirPos: [-6, 12, 8], fundo: 0x0c1430, nevoa: [0x16204a, 16, 110], ceu: [0x050920, 0x16224f, 0x42467a]});
  a.g.position.x = 3900;
  mar(a, 0x14305c, 260, -8.2);
  const aco = M(0x20242c), branco = M(0xf0ece0), bege = M(0xd9a441), deck = M(0xc9a26b), ferro = M(0x3a3e48);
  // casco de aco preto com faixa vermelha embaixo e proa em ponta
  mesh(new THREE.BoxGeometry(7.6, 8, 78), aco, 0, -4, -26, a.g).castShadow = true;
  mesh(new THREE.BoxGeometry(7.7, 1.4, 78), M(0x8a1a1a), 0, -7.3, -26, a.g);
  mesh(new THREE.BoxGeometry(7.7, 0.35, 78), branco, 0, -0.2, -26, a.g);
  const bs = new THREE.Shape(); bs.moveTo(-3.8, 0); bs.lineTo(3.8, 0); bs.lineTo(0, -11); bs.lineTo(-3.8, 0);
  const bg = new THREE.ExtrudeGeometry(bs, {depth: 8, bevelEnabled: false}); bg.rotateX(Math.PI / 2); bg.translate(0, 0, -65);
  mesh(bg, aco, 0, 0, 0, a.g).position.y = 0;
  // piso de madeira clara em tabuas
  mesh(new THREE.BoxGeometry(7.2, 0.3, 78), deck, 0, -0.15, -26, a.g).receiveShadow = true;
  for (let i = -3; i <= 3; i++) mesh(new THREE.BoxGeometry(0.04, 0.02, 78), M(0x8a6a40), i * 0.95, 0.01, -26, a.g);
  // corrimao de aco nos dois lados
  for (const s of [-1, 1]) { mesh(new THREE.BoxGeometry(0.1, 0.1, 78), ferro, 3.55 * s, 1.15, -26, a.g);
    mesh(new THREE.BoxGeometry(0.06, 0.06, 78), ferro, 3.55 * s, 0.6, -26, a.g);
    for (let z = 10; z > -62; z -= 1.8) mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.15, 6), ferro, 3.55 * s, 0.57, z, a.g); }
  // superestrutura branca na popa (atras da camera) e casa de conves com chamines a frente
  mesh(new THREE.BoxGeometry(7, 4, 6), branco, 0, 2, 9, a.g).castShadow = true;
  const casa = mesh(new THREE.BoxGeometry(5.6, 3.6, 24), branco, 0, 1.8, -27, a.g); casa.castShadow = true;
  mesh(new THREE.BoxGeometry(5.8, 0.2, 24.2), M(0xb8b4a8), 0, 3.7, -27, a.g);
  for (const s of [-1, 1]) for (let z = -17; z > -39; z -= 1.9) { mesh(new THREE.BoxGeometry(0.06, 1.0, 0.9), B(0xffd88a), 2.82 * s, 2.0, z, a.g); mesh(new THREE.BoxGeometry(0.05, 1.12, 1.02), ferro, 2.81 * s, 2.0, z, a.g); }
  for (const z of [-17, -29]) { }
  // quatro chamines bege com topo preto
  const fum = [];
  for (const z of [-19, -25, -31, -37]) {
    mesh(new THREE.CylinderGeometry(1.25, 1.45, 7.5, 18), bege, 0, 7.4, z, a.g).castShadow = true;
    mesh(new THREE.CylinderGeometry(1.27, 1.27, 1.5, 18), M(0x15151a), 0, 10.4, z, a.g);
    mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 4), ferro, 0, 8.6, z + 1.6, a.g);
    for (let k = 0; k < 4; k++) { const b = mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({color: 0x56566a, transparent: true, opacity: 0.4}), 0, 11, z, a.g); fum.push({b, z, f: k / 4 + (z % 5) * 0.07}); }
  }
  a.anim.push(t => { for (const o of fum) { const k = (t * 0.17 + o.f) % 1; o.b.position.set(-k * 3.5, 11.2 + k * 5, o.z); o.b.scale.setScalar(0.7 + k * 2.4); o.b.material.opacity = 0.42 * (1 - k); } });
  // mastros
  mesh(new THREE.CylinderGeometry(0.16, 0.24, 15, 8), ferro, 0, 7.5, -48, a.g); mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), ferro, 0, 14, -48, a.g).rotation.z = Math.PI / 2;
  brilho(0xffd890, 2.4, 0, 15.2, -48, a.g);
  mesh(new THREE.CylinderGeometry(0.14, 0.2, 11, 8), ferro, 0, 5.5, 11, a.g);
  // botes salva-vidas brancos (lado direito, em turcos) e no teto da casa
  const bote = (x, y, z, esc) => { const g = new THREE.Group(); const c = mesh(new THREE.SphereGeometry(1, 14, 10), M(0xb9b4a6), 0, 0, 0, g); c.scale.set(0.8, 0.45, 2.7); mesh(new THREE.BoxGeometry(1.6, 0.06, 4.8), M(0x8a5a2a), 0, 0.28, 0, g); mesh(new THREE.BoxGeometry(1.64, 0.1, 5.2), M(0xe8742a), 0, 0.0, 0, g).scale.set(1, 0.3, 0.9);
    g.position.set(x, y, z); g.scale.setScalar(esc || 1); a.g.add(g); return g; };
  for (const z of [-2.5, -8.5]) { bote(2.7, 1.9, z, 0.85); for (const dz of [-1.4, 1.4]) mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), ferro, 3.2, 1.1, z + dz, a.g); }
  for (const [x, z] of [[-1.7, -22], [1.7, -22], [-1.7, -33], [1.7, -33]]) bote(x, 4.2, z, 0.9);
  // lampadas de conves e estrelas pelo ceu
  for (const [x, z] of [[-3.2, -1], [-3.2, -8], [3.2, -13], [-3.2, -15]]) { mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6, 4), ferro, x, 1.5, z, a.g); mesh(new THREE.SphereGeometry(0.14, 8, 6), B(0xffe8b0), x, 2.35, z, a.g); brilho(0xffd890, 2.6, x, 2.35, z, a.g); }
  // caixotes de bagagem e cabos
  caixote(a, 2.2, 3.4, 0.9, 0.9, 0.2); caixote(a, 2.8, 2.5, 0.7, 0.7, -0.3); corda(a, -2.3, -6); corda(a, -2.6, -11);
  // iceberg ao longe, ceu de gelo
  const ice = new THREE.Group(); ice.position.set(38, -3, -78); a.g.add(ice);
  const ib = mesh(new THREE.IcosahedronGeometry(9, 0), M(0xdcecff, {flatShading: true, emissive: 0x16243a}), 0, 3, 0, ice); ib.scale.set(1.4, 1.1, 1.0);
  mesh(new THREE.ConeGeometry(5, 11, 6), M(0xeaf4ff, {flatShading: true, emissive: 0x1a2a40}), -3, 9, 1, ice);
  for (const [x, z, e] of [[-26, -52, 2.2], [-40, -85, 3.0], [20, -105, 3.4]]) { const m = mesh(new THREE.IcosahedronGeometry(e, 0), M(0xe0efff, {flatShading: true, emissive: 0x16243a}), x, -6.5 + e * 0.6, z, a.g); m.scale.y = 0.7; }
  lua(a, -55, 48, -115, 0xfff6d6, 5); nuvens(a, 0x2a3b78, 6);
  for (let i = 0; i < 8; i++) mesh(new THREE.BoxGeometry(0.8 + rnd() * 1.6, 0.02, 0.06), B(0xcfe0ff), (rnd() - 0.5) * 30, -8.0, -4 - rnd() * 40, a.g);
  stdCams(a, [0.2, 2.6], [0, 1.6, -11], [[-1.3, -3.2], [2.1, -6.5], [-2.0, -9]]);
  a.cams.ampla = u => ({pos: [2.6 - u * 3.4, 3.6, 8.2], look: [0, 3.0, -22], fov: 70});
  a.cams.chamines = u => ({pos: [1.6, 1.8, 2.5 - u * 3], look: V([-0.5, 7, -22], [0.5, 9.5, -25], u), fov: 66});
  a.cams.proa = u => ({pos: [0.4, 2.1, -43.5 + u * 1.5], look: [0, 6.5, -24], fov: 66});
  a.cams.mar = u => ({pos: [3.0, 1.9, 1.5 - u * 1.2], look: V([14, -1.5, -30], [20, 1.0, -60], ease(u)), fov: 62});
})();

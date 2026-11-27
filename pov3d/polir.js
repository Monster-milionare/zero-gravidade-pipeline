// Polimento visual: pos-processamento (bloom, vinheta, grade de cor, grao) + decoracao automatica dos cenarios.
// Carregado depois de ambientes.js, antes do loop de quadros.

// ---------------------------------------------------------------- pos-processamento
const _hdr = {type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter};
const rtCena = new THREE.WebGLRenderTarget(W, H, Object.assign({samples: 0}, _hdr));
const BW = Math.ceil(W / 4), BH = Math.ceil(H / 4);
const rtA = new THREE.WebGLRenderTarget(BW, BH, _hdr), rtB = new THREE.WebGLRenderTarget(BW, BH, _hdr);
const _quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const _quadGeo = new THREE.PlaneGeometry(2, 2);
function passe(frag, uniforms) {
  const m = new THREE.ShaderMaterial({uniforms, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: frag});
  const s = new THREE.Scene(); s.add(new THREE.Mesh(_quadGeo, m)); return {s, m};
}
const _pBright = passe(`varying vec2 vUv; uniform sampler2D tex; uniform vec2 px;
  void main(){ vec3 c = texture2D(tex, vUv + px*vec2(-1.5,-1.5)).rgb + texture2D(tex, vUv + px*vec2(1.5,-1.5)).rgb + texture2D(tex, vUv + px*vec2(-1.5,1.5)).rgb + texture2D(tex, vUv + px*vec2(1.5,1.5)).rgb; c *= 0.25;
    float l = max(c.r, max(c.g, c.b)); float k = smoothstep(0.62, 1.0, l); gl_FragColor = vec4(c * k, 1.0); }`, {tex: {value: null}, px: {value: new THREE.Vector2(1 / W, 1 / H)}});
const _blurFrag = `varying vec2 vUv; uniform sampler2D tex; uniform vec2 dir;
  void main(){ vec3 c = texture2D(tex, vUv).rgb * 0.227027; c += (texture2D(tex, vUv + dir*1.3846).rgb + texture2D(tex, vUv - dir*1.3846).rgb) * 0.316216; c += (texture2D(tex, vUv + dir*3.2308).rgb + texture2D(tex, vUv - dir*3.2308).rgb) * 0.070270; gl_FragColor = vec4(c, 1.0); }`;
const _pBlur = passe(_blurFrag, {tex: {value: null}, dir: {value: new THREE.Vector2()}});
const _pFinal = passe(`varying vec2 vUv; uniform sampler2D tex; uniform sampler2D bloom; uniform float t; uniform vec2 px;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }
  void main(){
    vec2 d = vUv - 0.5; float r2 = dot(d, d);
    vec2 ca = d * r2 * 0.012;
    vec3 cc = texture2D(tex, vUv).rgb;
    vec3 cn = texture2D(tex, vUv + vec2(0.0, px.y)).rgb, cs = texture2D(tex, vUv - vec2(0.0, px.y)).rgb, ce = texture2D(tex, vUv + vec2(px.x, 0.0)).rgb, cw = texture2D(tex, vUv - vec2(px.x, 0.0)).rgb;
    vec3 lw = vec3(0.299, 0.587, 0.114);
    float lC = dot(cc, lw), lN = dot(cn, lw), lS = dot(cs, lw), lE = dot(ce, lw), lW = dot(cw, lw);
    float cont = max(max(lN, lS), max(lE, lW)) - min(min(lN, lS), min(lE, lW));
    vec2 g = vec2(lN - lS, lE - lW); float gl = length(g) + 1e-4; vec2 tg = vec2(-g.y, g.x) / gl;     // tangente a borda
    float aa = clamp(cont * 4.0, 0.0, 1.0);
    vec3 sm = (texture2D(tex, vUv + tg * px * 0.75).rgb + texture2D(tex, vUv - tg * px * 0.75).rgb + cc) / 3.0;
    cc = mix(cc, sm, aa);
    vec3 c = vec3(texture2D(tex, vUv + ca).r * 0.0 + cc.r, cc.g, cc.b);
    vec3 b = texture2D(bloom, vUv).rgb;
    c += b * 0.30;
    c = mix(c, aces(c * 1.18), 0.35);
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, 1.04);                                  // saturacao
    c = (c - 0.5) * 1.03 + 0.5 + vec3(0.004, 0.0, -0.004);   // contraste + leve aquecida
    c *= 1.0 - smoothstep(0.2, 0.7, r2) * 0.32;               // vinheta
    c = pow(max(c, 0.0), vec3(1.0 / 2.2));
    c += (h(vUv * vec2(1080.0, 1920.0) + t) - 0.5) * 0.022;     // grao de filme
    gl_FragColor = vec4(c, 1.0);
  }`, {tex: {value: rtCena.texture}, bloom: {value: rtA.texture}, t: {value: 0}, px: {value: new THREE.Vector2(1 / W, 1 / H)}});
function _rodar(p, alvo) { renderer.setRenderTarget(alvo); renderer.render(p.s, _quadCam); }
window.posRender = function (t) {
  renderer.setRenderTarget(rtCena); renderer.render(scene, cam);
  _pBright.m.uniforms.tex.value = rtCena.texture; _rodar(_pBright, rtA);
  for (let i = 0; i < 2; i++) {
    const k = 1 + i * 1.6;
    _pBlur.m.uniforms.tex.value = rtA.texture; _pBlur.m.uniforms.dir.value.set(k / BW, 0); _rodar(_pBlur, rtB);
    _pBlur.m.uniforms.tex.value = rtB.texture; _pBlur.m.uniforms.dir.value.set(0, k / BH); _rodar(_pBlur, rtA);
  }
  _pFinal.m.uniforms.t.value = (t * 7.3) % 50; _rodar(_pFinal, null);
};

// ---------------------------------------------------------------- decoracao dos cenarios
const DEC = {
  campo:   {grama: 2200, flores: 160, pedras: 30, x: [-34, 34], z: [-46, 10], poeira: 0xfff0c0},
  terra:   {grama: 700, flores: 60, pedras: 50, x: [-30, 30], z: [-44, -6], poeira: 0xffd9a0},
  selva:   {grama: 2400, flores: 260, pedras: 24, x: [-30, 30], z: [-40, 8], poeira: 0xd8ffb0, vagalumes: 0xd8ff7a},
  deserto: {grama: 0, flores: 0, pedras: 90, x: [-40, 40], z: [-50, 8], poeira: 0xffe0b0},
  cidade:  {grama: 0, flores: 0, pedras: 12, x: [-3.2, 3.2], z: [-30, 6], poeira: 0xfff2d0, caixaFlor: true},
  'cidade-antiga': {grama: 0, flores: 0, pedras: 12, x: [-3, 3], z: [-30, 6], poeira: 0xfff2d0},
  arena:   {grama: 0, flores: 0, pedras: 40, x: [-9, 9], z: [-12, 8], poeira: 0xf0d8a8},
  terraco: {grama: 0, flores: 0, pedras: 0, x: [-5, 5], z: [-5, 5], poeira: 0xfff0d0},
  palacio: {grama: 0, flores: 0, pedras: 0, x: [-5, 5], z: [-14, 6], poeira: 0xffeab0},
  laboratorio: {grama: 0, flores: 0, pedras: 0, x: [-5, 5], z: [-4, 4], poeira: 0xd8f0ff},
  aerodromo: {grama: 900, flores: 40, pedras: 10, x: [-26, 26], z: [-30, 12], poeira: 0xfff0c0},
  conves:  {grama: 0, flores: 0, pedras: 0, x: [-3, 3], z: [-16, 6], poeira: 0xffd9a0},
  cabine:  {grama: 0, flores: 0, pedras: 0, x: [-3, 3], z: [-3, 5], poeira: 0xffd0a0},
  lua:     {grama: 0, flores: 0, pedras: 140, x: [-34, 34], z: [-44, 8], poeira: null},
  'cidade-medieval': {grama: 260, flores: 0, pedras: 30, x: [-4.4, 4.4], z: [-32, 6], poeira: 0xe8e4dc},
  'cidade-colonial': {grama: 120, flores: 40, pedras: 10, x: [-4.4, 4.4], z: [-32, 6], poeira: 0xfff2d0},
  'cidade-vitoriana': {grama: 0, flores: 0, pedras: 0, x: [-3, 3], z: [-30, 6], poeira: 0xffe8c0},
  'cidade-futuro': {grama: 0, flores: 0, pedras: 0, x: [-3, 3], z: [-30, 6], poeira: 0x8af0ff},
  'cidade-oriental': {grama: 160, flores: 60, pedras: 16, x: [-4.4, 4.4], z: [-32, 6], poeira: 0xffd8e8},
};
const _tmpM = new THREE.Object3D(), _tmpC = new THREE.Color();
function _inst(geo, mat, n, a, fn) {
  const im = new THREE.InstancedMesh(geo, mat, n);
  for (let i = 0; i < n; i++) { fn(_tmpM, _tmpC, i); _tmpM.updateMatrix(); im.setMatrixAt(i, _tmpM.matrix); im.setColorAt(i, _tmpC); }
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; a.g.add(im); return im;
}
function decorar(nome, d) {
  const a = amb[nome]; if (!a) return;
  const R = (u, v) => u + rnd() * (v - u);
  const livre = (x, z) => Math.abs(x) < 2.6 && z > -5 && z < 5;      // deixa a area dos personagens limpa
  if (d.grama) {
    const base = a.cfg.dirCor ? 0x4c9a45 : 0x4c9a45;
    const verdes = nome === 'deserto' ? [0xb9a46a, 0xa8935a] : [0x6fc455, 0x86d85f, 0x5aab48, 0xa3e36e];
    const g = _inst(new THREE.ConeGeometry(0.07, 0.55, 4), M(0xffffff, {flatShading: true}), d.grama, a, (o, c) => {
      let x, z; do { x = R(d.x[0], d.x[1]); z = R(d.z[0], d.z[1]); } while (livre(x, z));
      const e = R(0.6, 1.5); o.position.set(x, 0.2 * e, z); o.rotation.set(R(-0.25, 0.25), R(0, 6.28), R(-0.25, 0.25)); o.scale.set(e, e * R(0.8, 1.6), e);
      c.setHex(verdes[Math.floor(rnd() * verdes.length)]); });
    a.anim.push(t => { g.rotation.z = Math.sin(t * 1.4) * 0.012; });
  }
  if (d.flores) {
    const cores = [0xff6b8a, 0xffd23f, 0xffffff, 0xa78bfa, 0xff9248];
    _inst(new THREE.SphereGeometry(0.11, 8, 6), M(0xffffff, {emissive: 0x111111}), d.flores, a, (o, c) => {
      let x, z; do { x = R(d.x[0], d.x[1]); z = R(d.z[0], d.z[1]); } while (livre(x, z));
      o.position.set(x, R(0.22, 0.42), z); o.rotation.set(0, 0, 0); const s = R(0.7, 1.3); o.scale.set(s, s * 0.7, s); c.setHex(cores[Math.floor(rnd() * cores.length)]); });
  }
  if (d.pedras) {
    const tom = nome === 'lua' ? [0x7a7a86, 0x66666f, 0x8e8e98] : nome === 'deserto' ? [0xb98b52, 0xa57a46, 0xc9a06a] : [0x8d8a83, 0x77746d, 0xa09c92];
    _inst(new THREE.IcosahedronGeometry(0.45, 0), M(0xffffff, {flatShading: true, roughness: 1}), d.pedras, a, (o, c) => {
      let x, z; do { x = R(d.x[0], d.x[1]); z = R(d.z[0], d.z[1]); } while (livre(x, z));
      const s = R(0.25, 1.1) * (nome === 'lua' || nome === 'deserto' ? 1.3 : 0.8); o.position.set(x, 0.12 * s, z); o.rotation.set(R(0, 3), R(0, 3), R(0, 3)); o.scale.set(s * R(0.9, 1.5), s * R(0.5, 0.9), s * R(0.9, 1.4)); c.setHex(tom[Math.floor(rnd() * tom.length)]); });
  }
  if (d.poeira) {                                                       // particulas flutuando na luz
    const n = 110, pos = new Float32Array(n * 3), sem = [];
    for (let i = 0; i < n; i++) { pos[i * 3] = R(-9, 9); pos[i * 3 + 1] = R(0.4, 7); pos[i * 3 + 2] = R(-14, 7); sem.push([rnd() * 6, 0.12 + rnd() * 0.25, rnd() * 6]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({map: brilhoTex, color: d.poeira, size: 0.15, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false}));
    a.g.add(pts);
    a.anim.push(t => { const p = geo.attributes.position.array; for (let i = 0; i < n; i++) { const s = sem[i]; p[i * 3 + 1] += Math.sin(t * s[1] + s[0]) * 0.0035; p[i * 3] += Math.cos(t * s[1] * 0.7 + s[2]) * 0.003; } geo.attributes.position.needsUpdate = true; });
  }
  if (d.vagalumes) {
    const lumes = []; for (let i = 0; i < 26; i++) lumes.push({s: brilho(d.vagalumes, 0.6, 0, 0, 0, a.g), x: R(-10, 10), y: R(0.6, 3.2), z: R(-18, 4), f: rnd() * 6});
    a.anim.push(t => { for (const l of lumes) { l.s.position.set(l.x + Math.sin(t * 0.7 + l.f) * 1.2, l.y + Math.sin(t * 1.1 + l.f) * 0.4, l.z + Math.cos(t * 0.6 + l.f) * 1.2); l.s.material.opacity = 0.5 + 0.5 * Math.sin(t * 2.2 + l.f); } });
  }
}
for (const k in DEC) if (DEC[k]) decorar(k, DEC[k]);

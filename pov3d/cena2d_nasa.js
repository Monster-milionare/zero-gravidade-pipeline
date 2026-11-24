// Cenarios 2D "Programa espacial" (Apollo 13): base de lancamento, cabine do modulo de comando, modulo lunar,
// espaco (Terra/Lua/nave), centro de controle de Houston e oceano (amerissagem).
// Pensado para 16:9 (o video longo usa window.__W=1920, __H=1080). Usa o motor engine2d.html.
// Cada cenario le api.shot.fx para variar: ver o catalogo em catalogo_cenas.py (mesmos nomes).

// ---------------------------------------------------------------- papeis (elenco)
const AZUL_VOO = '#3d6cae';
Object.assign(ROLES, {
  // tripulacao da Apollo 13 (macacao azul de voo)
  lovell:   {pele: '#e8b890', cabelo: '#7a6650', penteado: 'mop', camisa: AZUL_VOO, manga: AZUL_VOO, calca: '#2f5a94', bota: '#d8d8d0', emblema: '#c8281e', cinto: '#2a3f66'},
  swigert:  {pele: '#eec29a', cabelo: '#2a1a12', penteado: 'mop', camisa: AZUL_VOO, manga: AZUL_VOO, calca: '#2f5a94', bota: '#d8d8d0', emblema: '#c8281e', cinto: '#2a3f66'},
  haise:    {pele: '#e0a984', cabelo: '#4a3020', penteado: 'mop', camisa: AZUL_VOO, manga: AZUL_VOO, calca: '#2f5a94', bota: '#d8d8d0', emblema: '#c8281e', cinto: '#2a3f66'},
  // mesmos tres de traje branco + capacete (base de lancamento)
  'lovell-traje':  {pele: '#e8b890', cabelo: '#7a6650', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#c8281e'},
  'swigert-traje': {pele: '#eec29a', cabelo: '#2a1a12', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#c8281e'},
  'haise-traje':   {pele: '#e0a984', cabelo: '#4a3020', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#c8281e'},
  // Houston
  kranz:    {pele: '#e6b58e', cabelo: '#2a2018', penteado: 'mop', camisa: '#f4f4f0', manga: '#f4f4f0', colete: '#efe9d8', gravata: '#1a1a22', calca: '#2c2c36', bota: '#1a1a1a', headset: true},
  controlador:  {pele: '#e8bc96', cabelo: '#3a281a', penteado: 'mop', camisa: '#f2f2ee', manga: '#f2f2ee', gravata: '#20202a', calca: '#32323c', bota: '#1a1a1a', headset: true},
  controlador2: {pele: '#d29c76', cabelo: '#1c1410', penteado: 'mop', camisa: '#e9edf2', manga: '#e9edf2', gravata: '#2a2030', calca: '#2a2a34', bota: '#1a1a1a', headset: true, oculos: '#2a2a30'},
  engenheiro:   {pele: '#e8bc96', cabelo: '#8a7a6a', penteado: 'careca', camisa: '#e6eaee', manga: '#e6eaee', colete: '#7a8a9a', calca: '#3a3a44', bota: '#1a1a1a', oculos: '#2a2a30', bigode: '#8a7a6a'},
});

// ---------------------------------------------------------------- utilidades do cenario
const WWn = Math.round(W * 1.5), Mg = (WWn - W) / 2;
function mkL(p, y0, hh, fn) { const w = Math.ceil(W + 2 * Mg * p + 80); const [c, x] = off(w, hh); fn(x, w, hh); return {c, p, y: y0}; }
function aTela(L, lx, ly, cam) {  // ponto da camada -> tela
  const zl = 1 + (cam.z - 1) * (0.25 + 0.75 * L.p), sx = (cam.cx - WWn / 2) * L.p, sy = (cam.cy - H / 2) * L.p * 0.8;
  return [W / 2 + (lx - L.c.width / 2 - sx) * zl, H / 2 + (L.y + ly - H / 2 - sy) * zl, zl];
}
function estrelas(x, w, hh, n, seed) {
  const sv = _s; _s = seed;
  for (let i = 0; i < n; i++) { const a = rr(0.25, 0.95); x.fillStyle = `rgba(255,255,255,${a})`; const r = rnd() < 0.12 ? rr(2, 3.4) : rr(0.8, 1.8); ell(x, rr(0, w), rr(0, hh), r, r); x.fill(); }
  _s = sv;
}
function terra(c, cx, cy, r, noite) {
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
  c.fillStyle = lg(c, cx - r, cy - r, cx + r, cy + r, [[0, '#4f9cf0'], [0.55, '#1f56b4'], [1, '#0c2a6a']]); c.fillRect(cx - r, cy - r, r * 2, r * 2);
  const sv = _s; _s = 777;
  c.fillStyle = '#3f9a52';
  for (let i = 0; i < 9; i++) { ell(c, cx + rr(-0.7, 0.7) * r, cy + rr(-0.7, 0.7) * r, r * rr(0.12, 0.3), r * rr(0.08, 0.2), rr(0, 3)); c.fill(); }
  c.fillStyle = '#b6a265'; for (let i = 0; i < 3; i++) { ell(c, cx + rr(-0.6, 0.6) * r, cy + rr(-0.5, 0.5) * r, r * rr(0.06, 0.12), r * rr(0.05, 0.1), rr(0, 3)); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 14; i++) { ell(c, cx + rr(-0.9, 0.9) * r, cy + rr(-0.9, 0.9) * r, r * rr(0.12, 0.4), r * rr(0.02, 0.06), rr(-0.4, 0.4)); c.fill(); }
  _s = sv;
  c.fillStyle = rg(c, cx + r * 0.35, cy + r * 0.2, r * 0.3, r * 1.25, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,10,${noite || 0.62})`]]); c.fillRect(cx - r, cy - r, r * 2, r * 2);
  c.restore();
  c.strokeStyle = 'rgba(130,190,255,0.55)'; c.lineWidth = Math.max(3, r * 0.025); c.beginPath(); c.arc(cx, cy, r + 1, 0, Math.PI * 2); c.stroke();
  glow(c, cx, cy, r * 1.25, '#5aa8ff', 0.22);
}
function lua(c, cx, cy, r, escuro) {
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
  c.fillStyle = lg(c, cx - r, cy - r, cx + r, cy + r, [[0, '#d8d6d0'], [0.6, '#a6a49e'], [1, '#6a6862']]); c.fillRect(cx - r, cy - r, r * 2, r * 2);
  const sv = _s; _s = 555;
  c.fillStyle = 'rgba(80,78,74,0.45)'; for (let i = 0; i < 6; i++) { ell(c, cx + rr(-0.6, 0.6) * r, cy + rr(-0.6, 0.6) * r, r * rr(0.14, 0.3), r * rr(0.1, 0.24), rr(0, 3)); c.fill(); }
  for (let i = 0; i < 26; i++) { const x = cx + rr(-0.85, 0.85) * r, y = cy + rr(-0.85, 0.85) * r, k = r * rr(0.03, 0.1);
    c.fillStyle = 'rgba(60,58,54,0.55)'; ell(c, x, y, k, k * 0.9); c.fill(); c.fillStyle = 'rgba(230,228,220,0.6)'; ell(c, x - k * 0.25, y - k * 0.25, k * 0.7, k * 0.55); c.fill(); }
  _s = sv;
  c.fillStyle = rg(c, cx - r * 0.4, cy - r * 0.3, r * 0.2, r * 1.3, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${escuro || 0.55})`]]); c.fillRect(cx - r, cy - r, r * 2, r * 2);
  c.restore();
}
function interruptor(c, x, y, on, cor) {
  c.fillStyle = '#2a2a2e'; rrect(c, x - 9, y - 9, 18, 26, 4); c.fill();
  c.fillStyle = '#d8d8d4'; rrect(c, x - 3, on ? y - 13 : y + 1, 6, 14, 3); c.fill();
  c.fillStyle = on ? (cor || '#5ae85a') : '#3a3a3e'; ell(c, x, y - 18, 4, 4); c.fill();
}
function mostrador(c, x, y, r, valor, cor) {
  c.fillStyle = '#16161a'; ell(c, x, y, r + 5, r + 5); c.fill(); c.fillStyle = '#e6e2d2'; ell(c, x, y, r, r); c.fill();
  c.strokeStyle = '#4a4a4a'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const a = Math.PI * (0.8 + i * 0.05 * 2.4 / 1.2); c.beginPath(); c.moveTo(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78); c.lineTo(x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95); c.stroke(); }
  const a = Math.PI * (0.8 + valor * 1.4); c.strokeStyle = cor || '#c8281e'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85); c.stroke();
  c.fillStyle = '#222'; ell(c, x, y, 4, 4); c.fill();
}
function painel(c, x, y, w, h, seed, nivel) {   // painel de cabine: fileiras de interruptores, mostradores e luzes
  const sv = _s; _s = seed;
  c.fillStyle = lg(c, x, y, x, y + h, [[0, '#5a5a60'], [1, '#3a3a40']]); rrect(c, x, y, w, h, 10); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 3; rrect(c, x, y, w, h, 10); c.stroke();
  const cores = ['#5ae85a', '#ffd23a', '#ff4a3a', '#5ac8ff'];
  for (let ry = y + 34; ry < y + h - 24; ry += 52) {
    if (rnd() < 0.34) { for (let mx = x + 52; mx < x + w - 40; mx += 84) mostrador(c, mx, ry + 6, 24, rr(0, 1), pick(['#c8281e', '#1a1a1a'])); }
    else { for (let ix = x + 24; ix < x + w - 14; ix += 36) interruptor(c, ix, ry + 4, rnd() < 0.55, pick(cores)); }
  }
  c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(x + 6, y + h - 10, w - 12, 4);
  _s = sv;
}
function nave(c, x, y, s, ang, o) {   // conjunto Apollo: modulo de servico + modulo de comando + modulo lunar (lado)
  o = o || {};
  c.save(); c.translate(x, y); c.rotate(ang || 0); c.scale(s, s);
  // bocal do motor
  c.fillStyle = '#6a6a72'; c.beginPath(); c.moveTo(-150, -22); c.lineTo(-215, -48); c.lineTo(-215, 48); c.lineTo(-150, 22); c.closePath(); c.fill();
  c.fillStyle = '#2a2a30'; ell(c, -215, 0, 8, 48); c.fill();
  // modulo de servico (cilindro prateado)
  c.fillStyle = lg(c, 0, -56, 0, 56, [[0, '#f2f2f2'], [0.5, '#c8cad0'], [1, '#7a7c86']]); rrect(c, -150, -56, 190, 112, 6); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(-150, -8, 190, 5); c.fillRect(-150, 12, 190, 5);
  c.fillStyle = '#e8e8ea'; c.fillRect(-60, -56, 18, 112);
  if (o.dano) { c.fillStyle = '#1a1a1e'; c.beginPath(); c.moveTo(-70, -56); c.lineTo(-30, -56); c.lineTo(-40, -20); c.lineTo(-62, -30); c.closePath(); c.fill(); c.fillStyle = '#3a3a40'; ell(c, -50, -44, 18, 10); c.fill(); }
  // modulo de comando (cone)
  c.fillStyle = lg(c, 0, -52, 0, 52, [[0, '#ffffff'], [0.6, '#cfd2d8'], [1, '#8a8c96']]);
  c.beginPath(); c.moveTo(40, -52); c.lineTo(140, -22); c.lineTo(140, 22); c.lineTo(40, 52); c.closePath(); c.fill();
  c.fillStyle = '#3a6ab0'; c.beginPath(); c.moveTo(80, -30); c.lineTo(104, -22); c.lineTo(80, -14); c.closePath(); c.fill();
  // tunel + modulo lunar (dourado)
  c.fillStyle = '#9a9aa2'; c.fillRect(140, -12, 22, 24);
  c.fillStyle = lg(c, 0, -60, 0, 60, [[0, '#f0cc66'], [1, '#a87a22']]); c.beginPath(); c.moveTo(162, -60); c.lineTo(250, -52); c.lineTo(258, 52); c.lineTo(162, 60); c.closePath(); c.fill();
  c.fillStyle = 'rgba(80,50,10,0.25)'; for (let i = 0; i < 6; i++) c.fillRect(170 + i * 14, -54 + (i % 2) * 6, 6, 108);
  c.fillStyle = '#c8c8ce'; c.beginPath(); c.moveTo(190, -60); c.lineTo(236, -60); c.lineTo(250, -96); c.lineTo(206, -106); c.closePath(); c.fill();
  c.fillStyle = '#1a2a3a'; c.beginPath(); c.moveTo(208, -92); c.lineTo(228, -90); c.lineTo(218, -76); c.closePath(); c.fill();
  c.strokeStyle = '#8a8a92'; c.lineWidth = 6; c.lineCap = 'round'; for (const [ax, ay, bx, by] of [[176, 60, 150, 100], [250, 54, 290, 96], [176, -60, 150, -100], [250, -52, 290, -92]]) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
  c.restore();
}

// ---------------------------------------------------------------- cenario: base de lancamento (Centro Espacial Kennedy)
function foguete(c, x, yBase, h) {   // Saturn V: x = centro, yBase = chao, h = altura total
  const w = h * 0.115;
  c.save(); c.translate(x, yBase);
  // aletas
  c.fillStyle = '#d8d8d6'; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(sx * w * 0.5, -h * 0.02); c.lineTo(sx * w * 1.15, 0); c.lineTo(sx * w * 0.5, -h * 0.17); c.closePath(); c.fill(); }
  // primeiro estagio (branco, faixas pretas)
  c.fillStyle = lg(c, -w / 2, 0, w / 2, 0, [[0, '#cfcfcc'], [0.4, '#ffffff'], [1, '#9a9a98']]); c.fillRect(-w / 2, -h * 0.6, w, h * 0.6);
  c.fillStyle = '#16161a'; for (let i = 0; i < 4; i++) c.fillRect(-w / 2, -h * (0.08 + i * 0.08), w, h * 0.034);
  c.fillStyle = '#e8e8e6'; c.font = `bold ${Math.round(h * 0.036)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.save(); c.translate(0, -h * 0.4); c.rotate(-Math.PI / 2); c.fillStyle = '#16161a'; c.fillText('U S A', 0, 0); c.restore();
  // entre-estagio + segundo estagio
  c.fillStyle = '#16161a'; c.fillRect(-w * 0.5, -h * 0.64, w, h * 0.04);
  c.fillStyle = lg(c, -w * 0.46, 0, w * 0.46, 0, [[0, '#cfcfcc'], [0.4, '#ffffff'], [1, '#9a9a98']]); c.fillRect(-w * 0.46, -h * 0.79, w * 0.92, h * 0.15);
  c.fillStyle = '#16161a'; c.fillRect(-w * 0.46, -h * 0.7, w * 0.92, h * 0.014);
  // terceiro estagio + unidade de instrumentos
  c.fillStyle = lg(c, -w * 0.36, 0, w * 0.36, 0, [[0, '#cfcfcc'], [0.4, '#ffffff'], [1, '#9a9a98']]); c.fillRect(-w * 0.36, -h * 0.9, w * 0.72, h * 0.11);
  c.fillStyle = '#16161a'; c.fillRect(-w * 0.36, -h * 0.9, w * 0.72, h * 0.012);
  // capsula + torre de escape
  c.fillStyle = '#e4e4e2'; c.beginPath(); c.moveTo(-w * 0.36, -h * 0.9); c.lineTo(-w * 0.16, -h * 0.955); c.lineTo(w * 0.16, -h * 0.955); c.lineTo(w * 0.36, -h * 0.9); c.closePath(); c.fill();
  c.fillStyle = '#d8d8d6'; c.beginPath(); c.moveTo(-w * 0.16, -h * 0.955); c.lineTo(-w * 0.04, -h * 0.99); c.lineTo(w * 0.04, -h * 0.99); c.lineTo(w * 0.16, -h * 0.955); c.closePath(); c.fill();
  c.strokeStyle = '#b8b8b6'; c.lineWidth = Math.max(2, w * 0.05); c.beginPath(); c.moveTo(0, -h * 0.99); c.lineTo(0, -h * 1.06); c.stroke();
  c.fillStyle = '#e8e8e6'; c.beginPath(); c.moveTo(-w * 0.04, -h * 1.06); c.lineTo(0, -h * 1.1); c.lineTo(w * 0.04, -h * 1.06); c.closePath(); c.fill();
  c.restore();
}
function torre(c, x, yBase, h, w) {   // torre de servico (estrutura vermelha/laranja com bracos)
  c.save(); c.translate(x, yBase);
  c.strokeStyle = '#c8502a'; c.lineWidth = 7;
  c.strokeRect(-w / 2, -h, w, h);
  c.lineWidth = 3;
  const n = 14; for (let i = 0; i < n; i++) { const y0 = -h + (h / n) * i, y1 = y0 + h / n; c.beginPath(); c.moveTo(-w / 2, y0); c.lineTo(w / 2, y1); c.moveTo(w / 2, y0); c.lineTo(-w / 2, y1); c.stroke(); c.beginPath(); c.moveTo(-w / 2, y1); c.lineTo(w / 2, y1); c.stroke(); }
  c.fillStyle = '#e8e4dc'; for (const k of [0.34, 0.56, 0.78]) { c.fillRect(w / 2, -h * k - 8, w * 1.4, 16); }
  c.fillStyle = '#d8dde4'; c.fillRect(-w * 0.2, -h - 40, w * 0.4, 40);
  c.restore();
}
function vab(c, x, y, w, h) {   // edificio de montagem (VAB): bloco cinza com bandeira e emblema
  c.fillStyle = lg(c, x, y, x + w, y, [[0, '#b8bcc0'], [0.5, '#d8dce0'], [1, '#9aa0a6']]); c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 1; i < 12; i++) c.fillRect(x + (w / 12) * i, y, 3, h);
  c.fillStyle = '#16161a'; c.fillRect(x + w * 0.04, y + h * 0.16, w * 0.14, h * 0.22);
  c.fillStyle = '#f2f2f2'; c.fillRect(x + w * 0.05, y + h * 0.2, w * 0.12, h * 0.14);
  c.fillStyle = '#16161a'; c.fillRect(x + w * 0.36, y + h * 0.04, w * 0.04, h * 0.3); c.fillRect(x + w * 0.36, y + h * 0.04, w * 0.28, h * 0.04); c.fillRect(x + w * 0.6, y + h * 0.04, w * 0.04, h * 0.3);
  c.fillStyle = '#1a2a6a'; c.fillRect(x + w * 0.74, y - h * 0.5, w * 0.012, h * 0.5);
  c.fillStyle = '#b8282a'; c.fillRect(x + w * 0.752, y - h * 0.5, w * 0.12, h * 0.22);
  c.fillStyle = '#f4f4f4'; for (let i = 0; i < 3; i++) c.fillRect(x + w * 0.752, y - h * 0.5 + h * 0.044 + i * h * 0.07, w * 0.12, h * 0.022);
  c.fillStyle = '#1a2a6a'; c.fillRect(x + w * 0.752, y - h * 0.5, w * 0.05, h * 0.12);
}
function palma(c, x, y, h, tr, fo) {
  c.strokeStyle = tr; c.lineCap = 'round'; c.lineWidth = Math.max(5, h / 14); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + h * 0.1, y - h * 0.5, x + h * 0.04, y - h); c.stroke();
  const tx = x + h * 0.04, ty = y - h; c.strokeStyle = fo; c.lineWidth = Math.max(3, h / 30);
  for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.02 + i * 0.12) - 0.08; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * h * 0.3, ty + Math.sin(a) * h * 0.3 - h * 0.08, tx + Math.cos(a) * h * 0.5, ty + Math.sin(a) * h * 0.5 + h * 0.16); c.stroke(); }
}
const PAL_KSC = {
  dia:   {sky: ['#2f8fe0', '#8ccaf0', '#e0f2fa'], sol: [0.72, 0.18], mar: ['#4aa4d0', '#2a78a8'], grama: ['#6aa83a', '#3e7a2a'], torre: 1, tom: 'rgba(255,255,255,0.03)', noite: 0},
  manha: {sky: ['#5aa0e0', '#f4c890', '#ffe6b8'], sol: [0.24, 0.34], mar: ['#e0a878', '#a87a6a'], grama: ['#8aa83a', '#4a7a2a'], torre: 1, tom: 'rgba(255,190,110,0.16)', noite: 0},
  tarde: {sky: ['#3a8ad8', '#f0c078', '#ffe2a8'], sol: [0.8, 0.32], mar: ['#d8a070', '#9a7060'], grama: ['#9aa63a', '#5a7a2a'], torre: 1, tom: 'rgba(255,180,90,0.16)', noite: 0},
  noite: {sky: ['#060a1c', '#10204a', '#2a3a6a'], sol: [0.8, 0.12], mar: ['#102a4a', '#0a1a34'], grama: ['#1a3a22', '#0e2216'], torre: 0.8, tom: 'rgba(20,30,80,0.25)', noite: 0.55},
};
const HORA_KSC = {dia: 'dia', manha: 'manha', amanhecer: 'manha', tarde: 'tarde', entardecer: 'tarde', noite: 'noite', madrugada: 'noite'};
const GY = Math.round(H * 0.885);   // linha do chao (pes dos personagens)

scenes['lancamento'] = {
  build(horaIn) {
    const pk = HORA_KSC[horaIn] || 'dia', P = PAL_KSC[pk]; _s = 31337 + pk.length;
    const WW = WWn;
    const ceu = mkL(0.03, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh * 0.78, [[0, P.sky[0]], [0.6, P.sky[1]], [1, P.sky[2]]]); x.fillRect(0, 0, w, hh);
      if (P.noite) estrelas(x, w, hh * 0.6, 160, 99);
      const sx = w * P.sol[0], sy = hh * P.sol[1];
      if (!P.noite) { glow(x, sx, sy, 380, '#fff4c8', 0.55); x.fillStyle = '#fffbe0'; ell(x, sx, sy, 62, 62); x.fill(); }
      else { x.fillStyle = '#e8ecf4'; ell(x, sx, sy, 46, 46); x.fill(); x.fillStyle = 'rgba(40,50,90,0.5)'; ell(x, sx + 14, sy - 6, 40, 40); x.fill(); glow(x, sx, sy, 240, '#a8c0ff', 0.28); }
      x.fillStyle = P.noite ? 'rgba(120,140,200,0.12)' : 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 7; i++) { const cx = rr(0, w), cy = rr(60, hh * 0.45); for (let k = 0; k < 6; k++) { ell(x, cx + k * 52, cy + Math.sin(k * 1.7) * 14, rr(60, 100), rr(20, 34)); x.fill(); } }
    });
    const longe = mkL(0.12, 0, H, (x, w, hh) => {      // mar, vegetacao baixa e o edificio de montagem ao longe
      x.fillStyle = lg(x, 0, hh * 0.62, 0, hh * 0.72, [[0, P.mar[0]], [1, P.mar[1]]]); x.fillRect(0, hh * 0.62, w, hh * 0.12);
      x.fillStyle = P.noite ? '#0a1a14' : '#4f7f46'; x.fillRect(0, hh * 0.7, w, hh * 0.1);
      for (let i = 0; i < 40; i++) { x.fillStyle = P.noite ? '#0c2018' : mix('#3f7a3a', '#2a5a2a', rnd()); ell(x, rr(0, w), hh * 0.72 + rr(-4, 6), rr(40, 90), rr(10, 22)); x.fill(); }
      vab(x, w * 0.1, hh * 0.46, 300, 250);
      if (P.noite) { x.fillStyle = 'rgba(0,0,40,0.4)'; x.fillRect(0, hh * 0.4, w, hh * 0.4); }
    });
    const base = mkL(0.4, 0, H, (x, w, hh) => {       // plataforma, torre, foguete
      const fx = w * 0.56, yb = GY - 60;
      x.fillStyle = '#9a9a96'; x.fillRect(fx - 330, yb - 4, 640, 70);
      x.fillStyle = '#7a7a78'; x.fillRect(fx - 330, yb + 40, 640, 26);
      x.fillStyle = '#5a5a58'; x.fillRect(fx - 250, yb - 40, 160, 40);
      torre(x, fx - 150, yb - 4, 760, 120);
      foguete(x, fx + 30, yb - 4, 770);
      if (P.noite) { x.fillStyle = 'rgba(0,0,30,0.18)'; x.fillRect(0, 0, w, hh); }
      for (const dx of [-300, 300]) { x.fillStyle = '#c8c8c4'; x.fillRect(fx + dx - 4, yb - 220, 8, 224); glow(x, fx + dx, yb - 224, 90, P.noite ? '#ffe8a0' : '#ffffff', P.noite ? 0.8 : 0.0); }
    });
    const chao = mkL(1.0, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, GY - 60, 0, hh, [[0, P.grama[0]], [1, P.grama[1]]]); x.fillRect(0, GY - 60, w, hh - (GY - 60));
      x.fillStyle = '#6e6e6a'; x.beginPath(); x.moveTo(0, GY + 40); x.lineTo(w, GY + 40); x.lineTo(w, GY + 150); x.lineTo(0, GY + 150); x.closePath(); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.22)'; for (let i = 0; i < 14; i++) x.fillRect(i * (w / 13) + 40, GY + 94, 110, 8);
      for (let i = 0; i < 260; i++) { x.strokeStyle = pick([P.grama[0], mix(P.grama[0], '#ffffff', 0.2), P.grama[1]]); x.lineWidth = rr(2, 3.6); const px = rr(0, w), py = rr(GY - 40, GY + 36), hg = rr(10, 30); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + rr(-6, 6), py - hg * 0.6, px + rr(-14, 14), py - hg); x.stroke(); }
      for (let i = 0; i < 6; i++) palma(x, rr(60, w - 60), GY - 40 - rr(0, 20), rr(230, 330), P.noite ? '#2a2018' : '#6a4a2a', P.noite ? '#1a4a2a' : '#2f8a3a');
    });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2 - 330, GY + 70, 0.76], f: [[WW / 2 - 600, GY + 60, 0.74], [WW / 2 - 70, GY + 64, 0.74], [WW / 2 - 860, GY + 58, 0.72]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || '';
        api.layer(ceu); api.layer(longe);
        if (fx === 'decolagem') {
          // o foguete ja subindo: a base vazia + o foguete (deslocado) com fogo e fumaca
          const L = base, off = Math.pow(clamp(api.u, 0, 1), 1.6) * 1100 + 60;
          const zl = 1 + (cam.z - 1) * (0.25 + 0.75 * L.p), sx = (cam.cx - WW / 2) * L.p, sy = (cam.cy - H / 2) * L.p * 0.8;
          const xx = W / 2 + (L.c.width * 0.56 + 30 - L.c.width / 2 - sx) * zl, yy = H / 2 + (GY - 64 - H / 2 - sy) * zl;
          // fumaca na base
          for (let i = 0; i < 16; i++) { const k = ((t * 0.5 + i / 16) % 1); g.fillStyle = `rgba(235,235,232,${0.55 * (1 - k)})`; ell(g, xx + (i % 2 ? 1 : -1) * k * 340 * zl, yy - 30 * zl + k * 10 * zl, (60 + k * 150) * zl, (36 + k * 70) * zl); g.fill(); }
          g.save(); g.translate(0, -off * zl); g.globalCompositeOperation = 'lighter'; glow(g, xx, yy + 20 * zl, 340 * zl, '#ffb040', 0.9); glow(g, xx, yy + 12 * zl, 150 * zl, '#fff0b0', 0.95); g.restore();
          g.save(); g.translate(0, -off * zl); g.globalCompositeOperation = 'source-over'; g.fillStyle = '#ffc860'; g.beginPath(); g.moveTo(xx - 38 * zl, yy); g.lineTo(xx + 38 * zl, yy); g.lineTo(xx, yy + (190 + 50 * Math.sin(t * 40)) * zl); g.closePath(); g.fill(); g.fillStyle = '#fff6d0'; g.beginPath(); g.moveTo(xx - 18 * zl, yy); g.lineTo(xx + 18 * zl, yy); g.lineTo(xx, yy + 110 * zl); g.closePath(); g.fill(); g.restore();
          g.save(); g.translate(xx, yy - off * zl); g.scale(zl, zl); foguete(g, 0, 0, 770); g.restore();
          api.layer(chao);
        } else {
          api.layer(base); api.layer(chao);
        }
        if (fx !== 'decolagem') api.personagens();     // na decolagem a tripulacao esta DENTRO do foguete
        g.fillStyle = P.tom; g.fillRect(0, 0, W, H);
      },
    };
  },
};

// ---------------------------------------------------------------- cenario: cabine do modulo de comando (Odyssey)
scenes['nave-cabine'] = {
  build(horaIn) {
    _s = 5150; const WW = WWn;
    const fundo = mkL(0.2, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, '#a8a290'], [1, '#c4bca6']]); x.fillRect(0, 0, w, hh);
      x.fillStyle = 'rgba(0,0,0,0.10)'; for (let i = 0; i < 18; i++) x.fillRect(i * (w / 17), 0, 4, hh);
      for (let i = 0; i < 90; i++) { x.fillStyle = 'rgba(70,64,52,0.5)'; ell(x, rr(0, w), rr(0, hh), 3, 3); x.fill(); }   // rebites
      // janelas (escotilhas) com o espaco e a Terra
      for (const [px, py, r] of [[w * 0.30, hh * 0.28, 92], [w * 0.5, hh * 0.22, 104], [w * 0.70, hh * 0.28, 92]]) {
        x.fillStyle = '#5a5a5e'; ell(x, px, py, r + 20, r + 20); x.fill(); x.fillStyle = '#2a2a2e'; ell(x, px, py, r + 8, r + 8); x.fill();
        x.save(); x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.clip(); x.fillStyle = '#03030a'; x.fillRect(px - r, py - r, r * 2, r * 2);
        estrelas(x, w, hh, 0, 1); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${rr(0.4, 1)})`; ell(x, px + rr(-r, r), py + rr(-r, r), rr(0.8, 2), rr(0.8, 2)); x.fill(); }
        terra(x, px - r * 0.2, py + r * 1.05, r * 1.0, 0.5);
        x.restore();
        x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 4; x.beginPath(); x.arc(px, py, r, Math.PI * 1.1, Math.PI * 1.45); x.stroke();
      }
    });
    const paineis = mkL(0.55, 0, H, (x, w, hh) => {
      painel(x, w * 0.02, hh * 0.34, w * 0.27, hh * 0.46, 11, 1);
      painel(x, w * 0.71, hh * 0.34, w * 0.27, hh * 0.46, 22, 1);
      painel(x, w * 0.36, hh * 0.52, w * 0.28, hh * 0.28, 33, 1);
      // luz de alarme mestre
      x.fillStyle = '#3a1a1a'; rrect(x, w * 0.46, hh * 0.40, 130, 56, 8); x.fill();
    });
    const piso = mkL(1.0, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, GY - 30, 0, hh, [[0, '#6a6a70'], [1, '#3a3a40']]); x.fillRect(0, GY - 30, w, hh - (GY - 30));
      x.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 16; i++) x.fillRect(i * (w / 15), GY - 30, 6, hh);
      x.fillStyle = '#2a2a2e'; x.fillRect(0, GY - 36, w, 10);
      // bancos (macas) laterais
      x.fillStyle = '#4a4a52'; rrect(x, w * 0.05, GY - 170, 280, 150, 24); x.fill(); rrect(x, w * 0.8, GY - 170, 280, 150, 24); x.fill();
    });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2 + 40, GY + 40, 0.82], f: [[WW / 2 - 320, GY + 40, 0.8], [WW / 2 + 400, GY + 40, 0.8], [WW / 2, GY + 100, 0.78]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || '';
        api.layer(fundo); api.layer(paineis); api.layer(piso);
        api.personagens();
        // alarme: faixa vermelha pulsante nas bordas + luz de alarme
        if (fx === 'alarme') {
          const k = 0.5 + 0.5 * Math.sin(t * 9);
          g.fillStyle = `rgba(255,30,20,${0.10 + 0.14 * k})`; g.fillRect(0, 0, W, H);
          g.fillStyle = rg(g, W / 2, H / 2, H * 0.3, H * 0.9, [[0, 'rgba(255,0,0,0)'], [1, `rgba(255,0,0,${0.25 + 0.3 * k})`]]); g.fillRect(0, 0, W, H);
          const [lx, ly, z] = aTela(paineis, paineis.c.width * 0.46 + 65, H * 0.40 + 28, cam);
          g.save(); g.globalCompositeOperation = 'lighter'; glow(g, lx, ly, 130 * z, '#ff3020', 0.9 * k); g.restore();
        } else if (fx === 'escuro') {
          g.fillStyle = 'rgba(4,6,16,0.62)'; g.fillRect(0, 0, W, H);
        } else if (fx === 'frio') {
          g.fillStyle = 'rgba(120,170,255,0.18)'; g.fillRect(0, 0, W, H);
        } else if (fx === 'clarao') {      // luz BRANCA entrando pelas escotilhas (sol / nascer da Terra)
          const k = clamp(api.u * 3, 0, 1) * (0.85 + 0.15 * Math.sin(t * 2));
          g.save(); g.globalCompositeOperation = 'lighter';
          for (const [px, py] of [[0.30, 0.28], [0.5, 0.22], [0.70, 0.28]]) { const [lx, ly, z] = aTela(fundo, fundo.c.width * px, H * py, cam); glow(g, lx, ly, 420 * z, '#ffffff', 0.55 * k); }
          g.restore();
          g.fillStyle = `rgba(255,255,255,${0.16 * k})`; g.fillRect(0, 0, W, H);
        }
        g.fillStyle = 'rgba(255,240,200,0.05)'; g.fillRect(0, 0, W, H);
      },
    };
  },
};

// ---------------------------------------------------------------- cenario: modulo lunar (Aquarius)
scenes['modulo-lunar'] = {
  build(horaIn) {
    _s = 9090; const WW = WWn;
    const paredes = mkL(0.2, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, w, hh, [[0, '#6e5a2c'], [0.5, '#a88a3c'], [1, '#5a4620']]); x.fillRect(0, 0, w, hh);
      for (let i = 0; i < 240; i++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '255,226,140' : '60,40,10'},${rr(0.08, 0.28)})`; const px = rr(0, w), py = rr(0, hh); x.beginPath(); x.moveTo(px, py); x.lineTo(px + rr(20, 90), py + rr(-30, 30)); x.lineTo(px + rr(-20, 40), py + rr(30, 80)); x.closePath(); x.fill(); }
      x.fillStyle = '#7a7a82'; x.fillRect(0, hh * 0.64, w, hh * 0.36);
      // janelas triangulares
      for (const [px, py] of [[w * 0.22, hh * 0.22], [w * 0.78, hh * 0.22]]) {
        x.fillStyle = '#c8c8ce'; x.beginPath(); x.moveTo(px - 130, py + 110); x.lineTo(px + 130, py + 110); x.lineTo(px + 70, py - 120); x.lineTo(px - 70, py - 120); x.closePath(); x.fill();
        x.save(); x.beginPath(); x.moveTo(px - 112, py + 94); x.lineTo(px + 112, py + 94); x.lineTo(px + 58, py - 104); x.lineTo(px - 58, py - 104); x.closePath(); x.clip();
        x.fillStyle = '#02020a'; x.fillRect(px - 130, py - 120, 260, 240); for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,255,${rr(0.4, 1)})`; ell(x, px + rr(-110, 110), py + rr(-100, 100), rr(0.8, 2), rr(0.8, 2)); x.fill(); }
        lua(x, px + 40, py + 130, 120, 0.45);
        x.restore();
      }
    });
    const consola = mkL(0.55, 0, H, (x, w, hh) => {
      x.fillStyle = '#3c3c42'; rrect(x, w * 0.34, hh * 0.38, w * 0.32, hh * 0.38, 14); x.fill();
      const sv = _s; _s = 41;
      for (let ry = hh * 0.42; ry < hh * 0.72; ry += 46) for (let ix = w * 0.355; ix < w * 0.64; ix += 38) { interruptor(x, ix, ry, rnd() < 0.5, pick(['#5ae85a', '#ffd23a', '#5ac8ff'])); }
      mostrador(x, w * 0.5, hh * 0.46, 30, 0.5); _s = sv;
    });
    const piso = mkL(1.0, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, GY - 20, 0, hh, [[0, '#5a5a62'], [1, '#2a2a30']]); x.fillRect(0, GY - 20, w, hh - (GY - 20));
      x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, GY - 26, w, 8);
    });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2 + 10, GY + 50, 0.88], f: [[WW / 2 - 300, GY + 50, 0.86], [WW / 2 + 320, GY + 50, 0.86], [WW / 2, GY + 110, 0.8]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || '';
        api.layer(paredes); api.layer(consola); api.layer(piso);
        api.personagens();
        if (fx === 'frio') {
          g.fillStyle = 'rgba(110,160,240,0.26)'; g.fillRect(0, 0, W, H);
          g.fillStyle = rg(g, W / 2, H / 2, H * 0.25, H * 0.85, [[0, 'rgba(210,235,255,0)'], [1, 'rgba(210,235,255,0.55)']]); g.fillRect(0, 0, W, H);
          const sv = _s; _s = 12; g.strokeStyle = 'rgba(240,250,255,0.55)'; g.lineWidth = 2;
          for (let i = 0; i < 70; i++) { const side = i % 4, px = side < 2 ? rr(0, W) : (side === 2 ? rr(0, W * 0.16) : rr(W * 0.84, W)), py = side === 0 ? rr(0, H * 0.14) : side === 1 ? rr(H * 0.86, H) : rr(0, H); const l = rr(14, 46); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; g.beginPath(); g.moveTo(px - Math.cos(a) * l, py - Math.sin(a) * l); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); g.stroke(); } }
          _s = sv;
          g.fillStyle = 'rgba(235,245,255,0.35)'; for (let i = 0; i < 5; i++) { const k = (t * 0.35 + i / 5) % 1; ell(g, W * (0.3 + i * 0.1), H * (0.52 - k * 0.2), 40 + k * 60, 18 + k * 30); g.fill(); }   // vapor da respiracao
        } else if (fx === 'escuro') { g.fillStyle = 'rgba(4,6,16,0.55)'; g.fillRect(0, 0, W, H); }
        g.fillStyle = 'rgba(255,235,170,0.07)'; g.fillRect(0, 0, W, H);
      },
    };
  },
};

// ---------------------------------------------------------------- cenario: espaco (Terra, Lua, nave)
scenes['espaco'] = {
  build(horaIn) {
    _s = 7001; const WW = WWn;
    const fundo = mkL(0.04, 0, H, (x, w, hh) => { x.fillStyle = lg(x, 0, 0, 0, hh, [[0, '#010106'], [1, '#07071a']]); x.fillRect(0, 0, w, hh); estrelas(x, w, hh, 420, 2024); });
    const terraGrande = mkL(0.1, 0, H, (x, w, hh) => { terra(x, w * 0.2, hh * 1.0, 560, 0.55); });
    const luaPequena = mkL(0.08, 0, H, (x, w, hh) => { lua(x, w * 0.84, hh * 0.22, 120, 0.5); });
    const luaGrande = mkL(0.1, 0, H, (x, w, hh) => { lua(x, w * 0.5, hh * 1.75, 1100, 0.6); });
    const terraPequena = mkL(0.06, 0, H, (x, w, hh) => { terra(x, w * 0.82, hh * 0.2, 90, 0.5); });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2, GY, 0.7], f: [[WW / 2 - 200, GY, 0.7], [WW / 2 + 200, GY, 0.7], [WW / 2, GY, 0.7]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || 'terra';
        api.layer(fundo);
        if (fx === 'lua') { api.layer(luaGrande); api.layer(terraPequena); } else { api.layer(terraGrande); api.layer(luaPequena); }
        // nave (flutua devagar); 'perto' = mais perto da camera
        const u = clamp(api.u, 0, 1), bx = W * (0.5 + (fx === 'lua' ? 0.18 - u * 0.36 : -0.05 + u * 0.1)), by = H * (fx === 'lua' ? 0.4 : 0.46) + Math.sin(t * 0.8) * 8;
        const esc = fx === 'perto' ? 1.5 : fx === 'lua' ? 0.7 : 0.9;
        if (fx === 'reentrada') {
          // capsula em chamas
          g.save(); g.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 22; i++) { const k = i / 22; glow(g, W * 0.5 - k * 520, H * 0.45 - k * 140, 150 * (1 - k * 0.6), k < 0.2 ? '#fff0c0' : '#ff6a20', 0.55 * (1 - k)); }
          glow(g, W * 0.5, H * 0.45, 260, '#ffb060', 0.9); g.restore();
          g.save(); g.translate(W * 0.5, H * 0.45); g.rotate(-0.28); g.fillStyle = '#4a3a34'; g.beginPath(); g.moveTo(-90, -70); g.lineTo(80, -34); g.lineTo(80, 34); g.lineTo(-90, 70); g.closePath(); g.fill(); g.fillStyle = '#ff7a30'; g.beginPath(); g.ellipse(-90, 0, 22, 70, 0, 0, Math.PI * 2); g.fill(); g.restore();
        } else {
          nave(g, bx, by, esc, fx === 'lua' ? -0.05 : 0.05, {dano: fx === 'vazamento' || fx === 'perto'});
          if (fx === 'vazamento') {
            // jato de oxigenio saindo do modulo de servico
            const [px, py] = [bx - 50 * esc, by - 56 * esc];
            g.save(); g.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 46; i++) { const k = ((t * 0.9 + i / 46) % 1); g.fillStyle = `rgba(230,240,255,${0.7 * (1 - k)})`; ell(g, px - k * 380 * esc + Math.sin(i * 3) * 20, py - k * 300 * esc + Math.cos(i * 2) * 14, (8 + k * 34) * esc, (8 + k * 30) * esc); g.fill(); }
            glow(g, px, py, 120 * esc, '#cfe4ff', 0.55); g.restore();
          }
        }
        g.fillStyle = 'rgba(160,190,255,0.04)'; g.fillRect(0, 0, W, H);
      },
    };
  },
};

// ---------------------------------------------------------------- cenario: centro de controle de Houston
scenes['houston'] = {
  build(horaIn) {
    _s = 4242; const WW = WWn;
    const parede = mkL(0.2, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, '#10202c'], [1, '#1a3040']]); x.fillRect(0, 0, w, hh);
      // telao
      const sx = w * 0.18, sy = hh * 0.05, sw = w * 0.64, sh = hh * 0.46;
      x.fillStyle = '#05080c'; rrect(x, sx - 16, sy - 16, sw + 32, sh + 32, 14); x.fill();
      x.fillStyle = lg(x, sx, sy, sx, sy + sh, [[0, '#0a2a3a'], [1, '#051820']]); x.fillRect(sx, sy, sw, sh);
      x.strokeStyle = 'rgba(80,220,200,0.18)'; x.lineWidth = 1; for (let i = 0; i <= 20; i++) { x.beginPath(); x.moveTo(sx + (sw / 20) * i, sy); x.lineTo(sx + (sw / 20) * i, sy + sh); x.stroke(); } for (let i = 0; i <= 10; i++) { x.beginPath(); x.moveTo(sx, sy + (sh / 10) * i); x.lineTo(sx + sw, sy + (sh / 10) * i); x.stroke(); }
      terra(x, sx + sw * 0.14, sy + sh * 0.56, sh * 0.2, 0.45); lua(x, sx + sw * 0.86, sy + sh * 0.4, sh * 0.09, 0.4);
      x.strokeStyle = '#5affc8'; x.lineWidth = 4; x.setLineDash([14, 10]); x.beginPath(); x.moveTo(sx + sw * 0.2, sy + sh * 0.5); x.bezierCurveTo(sx + sw * 0.4, sy + sh * 0.05, sx + sw * 0.75, sy + sh * 0.08, sx + sw * 0.84, sy + sh * 0.36); x.stroke(); x.setLineDash([]);
      x.fillStyle = '#5affc8'; x.font = 'bold 26px monospace'; x.fillText('APOLLO  TRAJETORIA', sx + 30, sy + 44);
      for (const [fx, c1] of [[0.04, '#b8282a'], [0.9, '#1a3a8a']]) { x.fillStyle = c1; x.fillRect(w * fx, hh * 0.06, w * 0.06, hh * 0.18); x.fillStyle = '#f2f2f2'; for (let i = 0; i < 3; i++) x.fillRect(w * fx, hh * 0.09 + i * hh * 0.05, w * 0.06, hh * 0.02); }
    });
    const fileiras = mkL(0.5, 0, H, (x, w, hh) => {   // fileiras de consoles com controladores de costas
      for (let r = 0; r < 3; r++) {
        const y = hh * (0.56 + r * 0.1), s = 0.62 + r * 0.14, n = 7;
        x.fillStyle = '#1e2c38'; x.fillRect(0, y + 38 * s, w, 34 * s);
        for (let i = 0; i < n; i++) {
          const px = w * (0.06 + i * (0.88 / (n - 1)));
          x.fillStyle = '#2c3e4c'; rrect(x, px - 70 * s, y - 20 * s, 140 * s, 60 * s, 6); x.fill();
          x.fillStyle = '#0a1a14'; rrect(x, px - 58 * s, y - 14 * s, 116 * s, 40 * s, 4); x.fill();
          x.fillStyle = `rgba(90,255,150,${0.5 + 0.3 * rnd()})`; for (let k = 0; k < 4; k++) x.fillRect(px - 50 * s, y - 8 * s + k * 9 * s, rr(30, 98) * s, 4 * s);
          glow(x, px, y + 4 * s, 90 * s, '#5aff96', 0.18);
          // controlador de costas
          const cor = pick(['#e8e8e4', '#d8dce2', '#eceff2']);
          x.fillStyle = cor; rrect(x, px - 34 * s, y + 44 * s, 68 * s, 70 * s, 18 * s); x.fill();
          x.fillStyle = pick(['#d4a07c', '#e8bc96', '#c88e68']); ell(x, px, y + 30 * s, 22 * s, 24 * s); x.fill();
          x.fillStyle = pick(['#2a1c12', '#3a281a', '#6a5a4a', '#1c1410']); x.beginPath(); x.arc(px, y + 26 * s, 24 * s, Math.PI, 0); x.fill();
          x.strokeStyle = '#16161c'; x.lineWidth = 4 * s; x.beginPath(); x.arc(px, y + 28 * s, 26 * s, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
        }
      }
    });
    const piso = mkL(1.0, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, GY - 40, 0, hh, [[0, '#26323c'], [1, '#12181e']]); x.fillRect(0, GY - 40, w, hh - (GY - 40));
      // console do diretor de voo (primeiro plano)
      x.fillStyle = '#3a4a58'; rrect(x, w * 0.36, GY - 210, w * 0.28, 150, 12); x.fill();
      x.fillStyle = '#0a1a14'; rrect(x, w * 0.375, GY - 196, w * 0.25, 90, 8); x.fill();
      x.fillStyle = 'rgba(90,255,150,0.6)'; for (let k = 0; k < 7; k++) x.fillRect(w * 0.385, GY - 186 + k * 11, rr(60, 330), 5);
      glow(x, w * 0.5, GY - 150, 260, '#5aff96', 0.22);
    });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2 + 30, GY + 40, 0.9], f: [[WW / 2 - 330, GY + 20, 0.84], [WW / 2 + 380, GY + 20, 0.84], [WW / 2 - 700, GY + 10, 0.8]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || '';
        api.layer(parede); api.layer(fileiras); api.layer(piso);
        api.personagens();
        // ponto da nave caminhando na trajetoria do telao
        { const L = parede, sx = L.c.width * 0.18, sw = L.c.width * 0.64, sh = H * 0.46, sy = H * 0.05; const k = (t * 0.06) % 1;
          const bz = (a, b, c2, d) => (1 - k) ** 3 * a + 3 * (1 - k) ** 2 * k * b + 3 * (1 - k) * k * k * c2 + k ** 3 * d;
          const px = sx + sw * bz(0.2, 0.4, 0.75, 0.84), py = sy + sh * bz(0.5, 0.05, 0.08, 0.36);
          const [ax, ay, z] = aTela(L, px, py, cam); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, ax, ay, 26 * z, '#ffe060', 0.9); g.restore(); }
        g.fillStyle = 'rgba(40,120,110,0.07)'; g.fillRect(0, 0, W, H);
        if (fx === 'tensao') { const k = 0.5 + 0.5 * Math.sin(t * 5); g.fillStyle = `rgba(255,40,30,${0.04 + 0.05 * k})`; g.fillRect(0, 0, W, H); }
      },
    };
  },
};

// ---------------------------------------------------------------- cenario: oceano (amerissagem no Pacifico)
scenes['oceano'] = {
  build(horaIn) {
    _s = 6006; const WW = WWn;
    const ceu = mkL(0.03, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh * 0.62, [[0, '#2a88e0'], [0.6, '#8ccaf0'], [1, '#e0f4fa']]); x.fillRect(0, 0, w, hh);
      glow(x, w * 0.74, hh * 0.18, 360, '#fff4c8', 0.5); x.fillStyle = '#fffbe0'; ell(x, w * 0.74, hh * 0.18, 56, 56); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 7; i++) { const cx = rr(0, w), cy = rr(60, hh * 0.4); for (let k = 0; k < 6; k++) { ell(x, cx + k * 56, cy + Math.sin(k * 1.7) * 14, rr(60, 100), rr(20, 34)); x.fill(); } }
    });
    const mar = mkL(0.2, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, hh * 0.6, 0, hh, [[0, '#4ab0d8'], [1, '#124a7a']]); x.fillRect(0, hh * 0.6, w, hh * 0.4);
      x.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < 140; i++) { const py = rr(hh * 0.62, hh), k = (py - hh * 0.6) / (hh * 0.4); x.fillRect(rr(0, w), py, rr(20, 90) * (0.4 + k), 2 + k * 2); }
      // navio de resgate (porta-avioes) ao longe
      const nx = w * 0.7, ny = hh * 0.625;
      x.fillStyle = '#6a7078'; x.beginPath(); x.moveTo(nx - 360, ny); x.lineTo(nx + 360, ny); x.lineTo(nx + 320, ny + 56); x.lineTo(nx - 320, ny + 56); x.closePath(); x.fill();
      x.fillStyle = '#8a9098'; x.fillRect(nx - 340, ny - 12, 680, 12);
      x.fillStyle = '#9aa0a8'; x.fillRect(nx + 120, ny - 74, 90, 74); x.fillRect(nx + 148, ny - 108, 36, 34);
      x.fillStyle = '#d8dce0'; x.fillRect(nx - 280, ny - 24, 110, 12); x.fillStyle = '#e8c84a'; x.fillRect(nx - 280, ny - 18, 110, 3);
      x.fillStyle = '#b8282a'; x.fillRect(nx - 100, ny - 20, 40, 8);
    });
    const ondas = mkL(1.0, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, hh * 0.72, 0, hh, [[0, '#2a8ab8'], [1, '#0c3a66']]); x.fillRect(0, hh * 0.72, w, hh * 0.28);
      x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 4; for (let i = 0; i < 60; i++) { const px = rr(0, w), py = rr(hh * 0.74, hh); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 30, py - 12, px + 70, py); x.stroke(); }
    });
    function paraquedas(g, px, py, s, cor, alvoX, alvoY) {
      g.save(); g.translate(px, py); g.scale(s, s);
      g.fillStyle = cor; g.beginPath(); g.moveTo(-130, 0); g.quadraticCurveTo(0, -150, 130, 0); g.quadraticCurveTo(70, 22, 0, 8); g.quadraticCurveTo(-70, 22, -130, 0); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.9)'; for (const [a, b] of [[-90, -50], [-20, 20], [50, 90]]) { g.beginPath(); g.moveTo(a, -2); g.quadraticCurveTo((a + b) / 2, -112, b, -2); g.quadraticCurveTo((a + b) / 2, 10, a, -2); g.closePath(); g.fill(); }
      g.restore();
      g.strokeStyle = 'rgba(40,40,44,0.8)'; g.lineWidth = 2; for (const lx of [-120, -60, 0, 60, 120]) { g.beginPath(); g.moveTo(px + lx * s, py + 6 * s); g.lineTo(alvoX, alvoY); g.stroke(); }
    }
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2, GY, 0.7], f: [[WW / 2 - 200, GY, 0.7], [WW / 2 + 200, GY, 0.7], [WW / 2, GY, 0.7]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || 'paraquedas';
        api.layer(ceu); api.layer(mar);
        // helicoptero de resgate
        { const hx = W * (0.06 + ((t * 0.015) % 0.22)), hy = H * 0.4 + Math.sin(t) * 10; g.save(); g.translate(hx, hy); g.fillStyle = '#2f4a6a'; ell(g, 0, 0, 56, 26); g.fill(); g.fillRect(40, -6, 70, 10); g.fillStyle = '#9ad0f0'; ell(g, -22, -4, 20, 12); g.fill();
          g.strokeStyle = 'rgba(20,20,20,0.7)'; g.lineWidth = 5; g.beginPath(); g.moveTo(-90 * Math.cos(t * 30), -30); g.lineTo(90 * Math.cos(t * 30), -30); g.stroke(); g.restore(); }
        const u = clamp(api.u, 0, 1);
        if (fx === 'paraquedas') {
          const cy = H * (0.1 + u * 0.38), cx = W * 0.46;
          const ax = cx, ay = cy + 205;
          paraquedas(g, cx - 160, cy - 40, 0.9, '#d8382a', ax, ay); paraquedas(g, cx + 160, cy - 40, 0.9, '#e8742a', ax, ay); paraquedas(g, cx, cy - 90, 1.05, '#d8382a', ax, ay);
          g.save(); g.translate(cx, cy + 250); g.fillStyle = '#d0ccc4'; g.beginPath(); g.moveTo(-34, -50); g.lineTo(34, -50); g.lineTo(54, 40); g.lineTo(-54, 40); g.closePath(); g.fill(); g.fillStyle = '#4a3a34'; g.fillRect(-54, 28, 108, 14); g.restore();
        } else {
          // capsula flutuando, com bolsas de flutuacao e marcas de queima
          const cx = W * 0.5, cy = H * 0.68 + Math.sin(t * 1.4) * 6; g.save(); g.translate(cx, cy);
          g.fillStyle = '#d0ccc4'; g.beginPath(); g.moveTo(-60, -80); g.lineTo(60, -80); g.lineTo(96, 20); g.lineTo(-96, 20); g.closePath(); g.fill(); g.fillStyle = '#4a3a34'; g.fillRect(-96, 4, 192, 22);
          g.fillStyle = '#e8742a'; ell(g, -110, 4, 28, 20); g.fill(); ell(g, 110, 4, 28, 20); g.fill(); g.restore();
        }
        api.layer(ondas);
        g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(0, 0, W, H);
      },
    };
  },
};

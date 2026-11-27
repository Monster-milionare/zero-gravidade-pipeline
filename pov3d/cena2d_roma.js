// Cenario 2D "Roma": o Forum Romano com o Coliseu ao fundo (seculo II), templos, arco do triunfo, pinheiros.
// Hora "incendio" = o Grande Incendio de 64 d.C. (ainda SEM o Coliseu, que so ficou pronto em 80 d.C.).

Object.assign(ROLES, {
  // Marco Aurelio: barba e cabelo cacheados, toga branca, manto purpura, coroa de louros
  'marco-aurelio': {pele: '#e6b892', cabelo: '#6a4a2a', cachos: '#6a4a2a', barba: '#6a4a2a', bigode: '#6a4a2a', camisa: '#f4efe2', manga: '#f4efe2', toga: '#f8f4ea', togaFaixa: '#6a1f6a', capa: '#6a1f6a', calca: '#f0e8d8', bota: '#8a5a2a', cinto: '#d8b84a', chapeu: 'louros'},
  'comodo':        {pele: '#ecc29c', cabelo: '#c8a050', cachos: '#c8a050', camisa: '#f4efe2', manga: '#f4efe2', toga: '#f8f4ea', togaFaixa: '#6a1f6a', calca: '#f0e8d8', bota: '#8a5a2a', cinto: '#d8b84a'},
  'nero':          {pele: '#eec8a0', cabelo: '#b8702a', cachos: '#b8702a', barba: '#b8702a', camisa: '#f4efe2', manga: '#f4efe2', toga: '#f8f4ea', togaFaixa: '#6a1f6a', capa: '#7a1f3a', calca: '#f0e8d8', bota: '#8a5a2a', cinto: '#d8b84a', chapeu: 'louros'},
  'galeno':        {pele: '#d9a77c', cabelo: '#d8d4cc', penteado: 'careca', barba: '#d8d4cc', bigode: '#d8d4cc', camisa: '#c8b896', manga: '#c8b896', toga: '#e8dcc0', calca: '#b8a888', bota: '#6a4a2a', cinto: '#6a4a2a'},
  'senador':       {pele: '#e3b48a', cabelo: '#8a8a88', camisa: '#f4efe2', manga: '#f4efe2', toga: '#f8f4ea', togaFaixa: '#8a1f2a', calca: '#f0e8d8', bota: '#5a3a1e', cinto: '#c8a040'},
  'legionario':    {pele: '#d9a77c', cabelo: '#3a2a1a', camisa: '#a8acb6', manga: '#b81e1e', listras: '#7a808c', saia: '#b81e1e', tiras: '#6a4a2a', calca: '#d9a77c', bota: '#6a4a2a', cinto: '#6a4a2a', chapeu: 'galea', corChapeu: '#b8b8c0', capa: '#9a1a1a', lanca: '#6a4a2a'},
  'centuriao':     {pele: '#c89268', cabelo: '#2a1a10', barba: '#2a1a10', camisa: '#c8ccd4', manga: '#b81e1e', listras: '#8a909c', saia: '#b81e1e', tiras: '#5a3a1e', calca: '#c89268', bota: '#5a3a1e', cinto: '#d8b84a', chapeu: 'galea-centuriao', corChapeu: '#c8c8d0', capa: '#b81e1e'},
  'cidadao-romano':{pele: '#d9a77c', cabelo: '#2a1a10', camisa: '#c8a070', manga: '#c8a070', saia: '#c8a070', calca: '#d9a77c', bota: '#6a4a2a', cinto: '#6a4a2a'},
  'cidada-romana': {pele: '#e8b890', cabelo: '#3a2412', penteado: 'rabo', camisa: '#4a7ab8', manga: '#4a7ab8', saia: '#4a7ab8', calca: '#4a7ab8', bota: '#6a4a2a', cinto: '#e8c14a'},
  'escravo':       {pele: '#a8724a', cabelo: '#1a1410', camisa: '#a89878', manga: '#a89878', saia: '#a89878', calca: '#a8724a', bota: '#5a3a1e', cinto: '#5a3a1e'},
});

const PAL_R = {
  manha: {sky: ['#5aa8e6', '#b8def0', '#ffe8c0'], sol: ['#fff4d0', 0.8, 0.24, 150], haze: '#efe2cc', colina: ['#a8b490', '#8a9c78'], mar: '#efe6d4', mar2: '#c4b496', trav: '#e2d0a8', telha: '#c0603a', pinho: '#3a6236', chao: ['#d4c6a6', '#a89a7a'], tom: 'rgba(255,226,170,0.10)', noite: 0, fogo: 0},
  dia: {sky: ['#2f8ae0', '#88c6f0', '#e2f2ff'], sol: ['#ffffff', 0.62, 0.16, 130], haze: '#eef0ea', colina: ['#9cb48a', '#7e9a70'], mar: '#f4ecdc', mar2: '#c8b898', trav: '#e8d6ae', telha: '#c8663e', pinho: '#3a6a38', chao: ['#dccfae', '#ae9f7e'], tom: 'rgba(255,255,255,0.03)', noite: 0, fogo: 0},
  tarde: {sky: ['#4a8ad0', '#f0c478', '#ffe0a0'], sol: ['#fff0b0', 0.24, 0.32, 190], haze: '#ffe2b4', colina: ['#b8a47a', '#9a8a6a'], mar: '#f4dcb0', mar2: '#c8a478', trav: '#ecc890', telha: '#c85a32', pinho: '#3e5a2e', chao: ['#e0c49a', '#a88a62'], tom: 'rgba(255,180,90,0.16)', noite: 0, fogo: 0},
  entardecer: {sky: ['#2a2a70', '#e07062', '#ffc27a'], sol: ['#ffd890', 0.3, 0.42, 210], haze: '#ffb48a', colina: ['#8a6a7a', '#6a5670'], mar: '#e8b8a0', mar2: '#a87a78', trav: '#d8a888', telha: '#a84a3a', pinho: '#2a3a2e', chao: ['#c8a088', '#8a6a5e'], tom: 'rgba(255,120,80,0.20)', noite: 0.15, fogo: 0},
  noite: {sky: ['#060a1e', '#16224a', '#2e3a62'], sol: ['#e8ecff', 0.72, 0.18, 110], haze: '#2a3456', colina: ['#1e2a40', '#18223a'], mar: '#6a7290', mar2: '#3e4664', trav: '#5e6684', telha: '#4a3442', pinho: '#121c22', chao: ['#4a5068', '#2a2e44'], tom: 'rgba(40,60,140,0.20)', noite: 0.45, fogo: 0, lua: 1},
  incendio: {sky: ['#140606', '#7a200e', '#ff8a3a'], sol: ['#ffb070', 0.5, 0.6, 0], haze: '#ff8a4a', colina: ['#4a1e18', '#3a1812'], mar: '#c87a5a', mar2: '#7a3a2a', trav: '#b8704a', telha: '#6a2a1a', pinho: '#1a0e0a', chao: ['#8a5a3e', '#4a2e20'], tom: 'rgba(255,90,30,0.24)', noite: 0.3, fogo: 1},
};
const HORA_R = {manha: 'manha', amanhecer: 'manha', dia: 'dia', tarde: 'tarde', entardecer: 'entardecer', noite: 'noite', madrugada: 'noite', incendio: 'incendio', fogo: 'incendio'};

function colunaR(c, x, yb, h, w, cor, cor2) {
  c.fillStyle = cor2; c.fillRect(x - w * 0.75, yb - h * 0.05, w * 1.5, h * 0.05);                 // base
  c.fillStyle = lg(c, x - w / 2, 0, x + w / 2, 0, [[0, mix(cor, '#000000', 0.18)], [0.35, mix(cor, '#ffffff', 0.18)], [1, mix(cor, '#000000', 0.3)]]);
  c.fillRect(x - w / 2, yb - h * 0.95, w, h * 0.9);
  c.strokeStyle = hex('#000000', 0.12); c.lineWidth = Math.max(1, w / 14);
  for (let k = 1; k < 5; k++) { const xx = x - w / 2 + k * w / 5; c.beginPath(); c.moveTo(xx, yb - h * 0.94); c.lineTo(xx, yb - h * 0.06); c.stroke(); }
  c.fillStyle = cor2; c.fillRect(x - w * 0.8, yb - h, w * 1.6, h * 0.06);                          // capitel
  c.fillStyle = cor; ell(c, x - w * 0.62, yb - h * 0.96, w * 0.2, w * 0.16); c.fill(); ell(c, x + w * 0.62, yb - h * 0.96, w * 0.2, w * 0.16); c.fill();
}
function temploR(c, x, yb, n, w, h, cor, cor2, telha) {
  const cw = w / (n * 1.6), passo = (w - cw) / (n - 1);
  c.fillStyle = cor2; c.fillRect(x - w / 2 - 20, yb - h * 0.1, w + 40, h * 0.1);                   // escadaria
  c.fillStyle = hex('#000000', 0.12); for (let k = 0; k < 4; k++) c.fillRect(x - w / 2 - 20, yb - h * 0.1 + k * h * 0.025, w + 40, 3);
  c.fillStyle = mix(cor2, '#000000', 0.35); c.fillRect(x - w / 2 + cw, yb - h * 0.82, w - cw * 2, h * 0.72);   // cela (escura atras)
  for (let i = 0; i < n; i++) colunaR(c, x - w / 2 + cw / 2 + i * passo, yb - h * 0.1, h * 0.72, cw, cor, cor2);
  c.fillStyle = cor2; c.fillRect(x - w / 2 - 6, yb - h * 0.9, w + 12, h * 0.08);                     // entablamento
  c.fillStyle = cor; c.beginPath(); c.moveTo(x - w / 2 - 14, yb - h * 0.9); c.lineTo(x, yb - h * 1.12); c.lineTo(x + w / 2 + 14, yb - h * 0.9); c.closePath(); c.fill();
  c.fillStyle = mix(cor, '#000000', 0.14); c.beginPath(); c.moveTo(x - w / 2 + 16, yb - h * 0.91); c.lineTo(x, yb - h * 1.07); c.lineTo(x + w / 2 - 16, yb - h * 0.91); c.closePath(); c.fill();
  if (telha) { c.strokeStyle = telha; c.lineWidth = 6; c.beginPath(); c.moveTo(x - w / 2 - 14, yb - h * 0.9); c.lineTo(x, yb - h * 1.12); c.lineTo(x + w / 2 + 14, yb - h * 0.9); c.stroke(); }
}
function arcoR(c, x, yb, w, h, cor, cor2) {
  c.fillStyle = lg(c, x - w / 2, 0, x + w / 2, 0, [[0, mix(cor, '#000000', 0.15)], [0.4, mix(cor, '#ffffff', 0.1)], [1, mix(cor, '#000000', 0.25)]]);
  c.fillRect(x - w / 2, yb - h, w, h);
  c.fillStyle = mix(cor2, '#000000', 0.45); c.beginPath(); c.moveTo(x - w * 0.22, yb); c.lineTo(x - w * 0.22, yb - h * 0.5); c.arc(x, yb - h * 0.5, w * 0.22, Math.PI, 0); c.lineTo(x + w * 0.22, yb); c.closePath(); c.fill();
  c.fillStyle = cor2; c.fillRect(x - w / 2 - 8, yb - h * 0.8, w + 16, h * 0.05); c.fillRect(x - w / 2 - 4, yb - h, w + 8, h * 0.06);
  for (const sx of [-1, 1]) colunaR(c, x + sx * w * 0.36, yb, h * 0.78, w * 0.06, cor, cor2);
  c.fillStyle = hex('#000000', 0.18); c.fillRect(x - w * 0.3, yb - h * 0.95, w * 0.6, h * 0.12);   // placa da inscricao
}
function casaR(c, x, yb, w, h, parede, telha) {
  c.fillStyle = parede; c.fillRect(x - w / 2, yb - h, w, h);
  c.fillStyle = telha; c.beginPath(); c.moveTo(x - w / 2 - 12, yb - h); c.lineTo(x, yb - h - h * 0.28); c.lineTo(x + w / 2 + 12, yb - h); c.closePath(); c.fill();
  c.fillStyle = hex('#000000', 0.35); for (let k = 0; k < Math.floor(w / 46); k++) c.fillRect(x - w / 2 + 16 + k * 46, yb - h * 0.7, 16, 22);
}
function pinheiroManso(c, x, yb, h, tr, folha) {
  c.strokeStyle = tr; c.lineWidth = Math.max(4, h / 26); c.lineCap = 'round';
  c.beginPath(); c.moveTo(x, yb); c.quadraticCurveTo(x + h * 0.08, yb - h * 0.5, x + h * 0.02, yb - h * 0.86); c.stroke();
  c.lineWidth = Math.max(2, h / 50); for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(x + h * 0.03, yb - h * 0.78); c.lineTo(x + sx * h * 0.22, yb - h * 0.9); c.stroke(); }
  for (let i = 0; i < 9; i++) { c.fillStyle = i % 3 ? folha : mix(folha, '#ffffff', 0.1); ell(c, x + (i - 4) * h * 0.075, yb - h * 0.95 - Math.sin(i * 1.3) * h * 0.03 - (4 - Math.abs(i - 4)) * h * 0.02, h * 0.15, h * 0.07); c.fill(); }
}
function cipresteR(c, x, yb, h, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, yb - h); c.quadraticCurveTo(x + h * 0.11, yb - h * 0.5, x + h * 0.06, yb); c.lineTo(x - h * 0.06, yb); c.quadraticCurveTo(x - h * 0.11, yb - h * 0.5, x, yb - h); c.fill(); }
function coliseuR(c, cx, yb, w, h, cor) {
  const esc = mix(cor, '#000000', 0.5), tiers = [0.27, 0.27, 0.27, 0.19];
  c.fillStyle = lg(c, cx - w / 2, 0, cx + w / 2, 0, [[0, mix(cor, '#000000', 0.25)], [0.45, mix(cor, '#ffffff', 0.12)], [1, mix(cor, '#000000', 0.32)]]);
  c.beginPath(); c.moveTo(cx - w / 2, yb); c.lineTo(cx - w / 2, yb - h * 0.9); c.quadraticCurveTo(cx, yb - h * 1.08, cx + w / 2, yb - h * 0.9); c.lineTo(cx + w / 2, yb); c.closePath(); c.fill();
  let y0 = yb;
  for (let k = 0; k < 4; k++) {
    const th = h * tiers[k], y1 = y0 - th, n = k === 3 ? 22 : 15;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, ax = cx - w / 2 + u * w, aw = w / n * (k === 3 ? 0.3 : 0.56), cv = Math.sin(Math.PI * u) * h * 0.1 * (k / 3);
      const sombra = 0.55 + 0.45 * Math.abs(u - 0.5) * 2;
      c.fillStyle = hex(esc, sombra);
      if (k === 3) { c.fillRect(ax - aw / 2, y1 + th * 0.35 - cv, aw, th * 0.3); continue; }
      c.beginPath(); c.moveTo(ax - aw / 2, y0 - th * 0.12 - cv); c.lineTo(ax - aw / 2, y1 + th * 0.42 - cv); c.arc(ax, y1 + th * 0.42 - cv, aw / 2, Math.PI, 0); c.lineTo(ax + aw / 2, y0 - th * 0.12 - cv); c.closePath(); c.fill();
    }
    c.fillStyle = hex('#ffffff', 0.12); c.fillRect(cx - w / 2, y1 - 4 - Math.sin(Math.PI * 0.5) * 0, w, 6);
    y0 = y1;
  }
}
function aquedutoR(c, x0, x1, yb, h, cor) {
  c.fillStyle = cor; c.fillRect(x0, yb - h, x1 - x0, h * 0.14);
  const n = Math.floor((x1 - x0) / (h * 0.5));
  for (let i = 0; i <= n; i++) { const x = x0 + i * (x1 - x0) / n; c.fillRect(x - h * 0.05, yb - h, h * 0.1, h); }
  c.fillStyle = hex('#000000', 0.08); c.fillRect(x0, yb - h * 0.86, x1 - x0, 4);
}
function chamaR(g, x, y, s, t, f) {     // lingua de fogo animada
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) {
    const hh = s * (1.0 + 0.3 * Math.sin(t * 7 + f + k)), ww = s * (0.36 - k * 0.06), dx = Math.sin(t * 5 + f * 2 + k) * s * 0.08;
    g.fillStyle = ['rgba(255,80,20,0.55)', 'rgba(255,140,30,0.55)', 'rgba(255,200,80,0.6)', 'rgba(255,245,200,0.7)'][k];
    g.beginPath(); g.moveTo(x - ww, y); g.quadraticCurveTo(x - ww * 0.9 + dx, y - hh * 0.6, x + dx * 2, y - hh * (1 - k * 0.15)); g.quadraticCurveTo(x + ww * 0.9 + dx, y - hh * 0.6, x + ww, y); g.closePath(); g.fill();
  }
  g.restore();
}

scenes['roma'] = {
  build(horaIn) {
    const pk = HORA_R[horaIn] || 'dia', P = PAL_R[pk];
    const WW = 2592, YMIN = -420, YMAX = H;
    const mk = (p, y0, hh, fn) => { const w = Math.min(WW + 200, Math.ceil(W + 2 * 1012 * p + 60)); const [c, x] = off(w, hh); fn(x, w, hh); return {c, p, y: y0}; };
    _s = 616161 + pk.length * 11;
    const sky = mk(0.02, YMIN, H + 620, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.sky[0]], [0.55, P.sky[1]], [1, P.sky[2]]]); x.fillRect(0, 0, w, hh);
      if (P.sol[3]) { const sy = H * P.sol[2] + 420, sxp = w * P.sol[1]; glow(x, sxp, sy, 480, P.sol[0], P.lua ? 0.25 : 0.5); x.fillStyle = P.sol[0]; ell(x, sxp, sy, P.sol[3] * 0.42, P.sol[3] * 0.42); x.fill();
        if (P.lua) { x.fillStyle = hex('#9aa0c0', 0.5); ell(x, sxp + 10, sy - 6, 12, 9); x.fill(); ell(x, sxp - 14, sy + 12, 8, 7); x.fill(); } }
      if (P.noite > 0.25 && !P.fogo) for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,240,${rr(0.2, 0.9)})`; ell(x, rr(0, w), rr(0, hh * 0.45), rr(1, 3), rr(1, 3)); x.fill(); }
      for (let i = 0; i < 7; i++) { const cy = rr(320, 860), cxp = rr(0, w); x.fillStyle = hex(P.fogo ? '#2a1410' : P.haze, P.fogo ? 0.55 : 0.28); for (let k = 0; k < 6; k++) { ell(x, cxp + k * 70, cy + Math.sin(k) * 14, 120, 30); x.fill(); } }
    });
    const montes = mk(0.07, 330, 640, (x, w, hh) => {
      for (const [k, col] of [[0, P.colina[0]], [1, P.colina[1]]]) {
        x.fillStyle = col; x.beginPath(); x.moveTo(0, hh);
        for (let i = 0; i <= 30; i++) { const px = i / 30 * w; x.lineTo(px, hh - 120 - k * 60 - Math.abs(Math.sin(i * 0.45 + k * 1.7)) * (110 - k * 30)); }
        x.lineTo(w, hh); x.closePath(); x.fill();
      }
      aquedutoR(x, w * 0.02, w * 0.42, hh - 110, 150, mix(P.trav, P.colina[1], 0.45));
      for (let i = 0; i < 14; i++) pinheiroManso(x, rr(0, w), hh - rr(90, 150), rr(110, 170), mix(P.pinho, P.colina[1], 0.5), mix(P.pinho, P.colina[1], 0.4));
      x.fillStyle = lg(x, 0, hh - 200, 0, hh, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.55)]]); x.fillRect(0, hh - 200, w, 200);
    });
    const coliseu = P.fogo ? null : mk(0.14, 470, 700, (x, w, hh) => {
      coliseuR(x, w / 2 + 160, hh - 40, 860, 470, P.trav);
      for (let i = 0; i < 6; i++) cipresteR(x, w / 2 - 420 + i * 40 + rr(-10, 10), hh - 30, rr(170, 250), mix(P.pinho, P.haze, 0.25));
      x.fillStyle = lg(x, 0, hh - 160, 0, hh, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.5)]]); x.fillRect(0, hh - 160, w, 160);
    });
    const fundoFogo = P.fogo ? mk(0.14, 520, 640, (x, w, hh) => {
      for (let i = 0; i < 26; i++) casaR(x, rr(0, w), hh - rr(30, 90), rr(90, 180), rr(110, 220), mix(P.mar2, '#000000', 0.35), P.telha);
      x.fillStyle = lg(x, 0, hh - 220, 0, hh, [[0, hex('#ff6a2a', 0)], [1, hex('#ff6a2a', 0.45)]]); x.fillRect(0, hh - 220, w, 220);
    }) : null;
    const cidade = mk(0.3, 500, 1150, (x, w, hh) => {
      const yb = 820, C0 = w / 2;
      x.fillStyle = mix(P.chao[0], P.haze, 0.3); x.fillRect(0, yb - 150, w, hh - yb + 150);
      for (let i = 0; i < 9; i++) casaR(x, C0 - 900 + i * 210 + rr(-30, 30), yb - 120, rr(150, 220), rr(150, 230), mix(P.trav, '#000000', 0.12), P.telha);
      temploR(x, C0 - 470, yb, 8, 420, 560, P.mar, P.mar2, P.telha);             // templo de Saturno (8 colunas)
      arcoR(x, C0 + 470, yb, 300, 430, P.mar, P.mar2);                           // arco do triunfo
      temploR(x, C0 + 40, yb + 10, 6, 300, 400, mix(P.mar, '#000000', 0.06), P.mar2, P.telha);
      for (const px of [C0 - 760, C0 - 160, C0 + 250, C0 + 760]) { colunaR(x, px, yb, 470, 30, P.mar, P.mar2); x.fillStyle = mix(P.mar2, '#000000', 0.3); ell(x, px, yb - 500, 22, 34); x.fill(); x.fillRect(px - 14, yb - 480, 28, 20); }
      for (let i = 0; i < 6; i++) pinheiroManso(x, C0 - 840 + i * 330 + rr(-40, 40), yb - 90, rr(300, 380), mix(P.pinho, '#000000', 0.2), P.pinho);
      x.fillStyle = lg(x, 0, yb - 200, 0, yb, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.38)]]); x.fillRect(0, yb - 200, w, 200);
      x.fillStyle = lg(x, 0, yb, 0, hh, [[0, mix(P.chao[0], P.haze, 0.3)], [1, P.chao[0]]]); x.fillRect(0, yb, w, hh - yb);
    });
    const chao = mk(1.0, 1290, YMAX - 1290 + 160, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.chao[0]], [1, P.chao[1]]]); x.fillRect(0, 0, w, hh);
      x.fillStyle = hex('#000000', 0.10); x.fillRect(0, 40, w, 16);
      for (let r = 0; r < 14; r++) { const y = 60 + r * r * 3.6 + r * 18, hgt = 18 + r * 7; let px = rr(-60, 0);
        while (px < w) { const pw = rr(60, 120) * (0.6 + r * 0.12); x.strokeStyle = hex('#000000', 0.14 + r * 0.006); x.lineWidth = 2 + r * 0.3; rrect(x, px, y, pw, hgt, 6); x.stroke();
          x.fillStyle = hex(rr(0, 1) > 0.5 ? '#ffffff' : '#000000', rr(0.02, 0.07)); x.fill(); px += pw + 2; } }
      // via sacra: faixa central levemente mais clara
      x.fillStyle = hex('#ffffff', 0.05); x.beginPath(); x.moveTo(w / 2 - 160, 40); x.lineTo(w / 2 + 160, 40); x.lineTo(w / 2 + 700, hh); x.lineTo(w / 2 - 700, hh); x.closePath(); x.fill();
    });
    const frente = mk(1.28, 0, YMAX + 160, (x, w, hh) => {
      for (const lado of [-1, 1]) { const px = w / 2 + lado * (W / 2 - 10); colunaR(x, px, hh - 170, hh - 120, 210, mix(P.mar, '#000000', 0.12), mix(P.mar2, '#000000', 0.15)); }
    });
    const passaros = []; for (let i = 0; i < 7; i++) passaros.push({x: rr(0, 1), y: rr(0.08, 0.26), v: rr(0.01, 0.025), f: rr(0, 6)});
    const brasas = []; for (let i = 0; i < 90; i++) brasas.push({x: rr(0, 1), y: rr(0, 1), r: rr(1.5, 4.5), v: rr(14, 40), f: rr(0, 6)});
    const focos = []; for (let i = 0; i < 16; i++) focos.push({u: rr(0.02, 0.98), s: rr(90, 210), f: rr(0, 6)});
    function aScreen(L, lx, ly, cam) {
      const zl = 1 + (cam.z - 1) * (0.25 + 0.75 * L.p), sx = (cam.cx - WW / 2) * L.p, sy = (cam.cy - H / 2) * L.p * 0.8;
      return [W / 2 + (lx - L.c.width / 2 - sx) * zl, H / 2 + (L.y + ly - H / 2 - sy) * zl, zl];
    }
    const C = WW / 2;
    const inst = {
      WW, yMin: YMIN, yMax: YMAX, cyBase: 0,
      slots: {prot: [C + 150, 1540, 1.18], f: [[C - 270, 1480, 1.14], [C + 450, 1470, 1.14], [C - 60, 1730, 1.1]]},
      pontos: {
        'ampla':    {cx: C, cy: 960, z: 1.0},
        'ceu':      {cx: C, cy: 560, z: 1.0, pos: [C, 380], esc: 1.0},
        'coliseu':  {cx: C + 520, cy: 780, z: 1.22},
        'cidade':   {cx: C, cy: 820, z: 1.12},
        'templo':   {cx: C - 760, cy: 900, z: 1.18},
        'arco':     {cx: C + 760, cy: 900, z: 1.18},
        'fogo':     {cx: C - 200, cy: 760, z: 1.15, pos: [C - 200, 900]},
        'chao':     {cx: C, cy: 1300, z: 1.3, pos: [C, 1560]},
        'perto':    {cx: C + 60, cy: 1100, z: 1.25, pos: [C + 80, 1290], esc: 0.75},
        'escadaria':{cx: C - 520, cy: 1180, z: 1.3, pos: [C - 600, 1420]},
        'fora-esq': {cx: C - 700, cy: 1100, z: 1.1, pos: [-500, 1500]},
        'fora-dir': {cx: C + 700, cy: 1100, z: 1.1, pos: [WW + 500, 1500]},
      },
      draw(g, t, cam, api) {
        api.layer(sky);
        for (const p of passaros) { if (P.fogo || P.noite > 0.3) break; const px = ((p.x + t * p.v) % 1.2 - 0.1) * W, py = p.y * H + Math.sin(t + p.f) * 14; g.strokeStyle = hex('#2a2a30', 0.7); g.lineWidth = 3; const f = Math.sin(t * 8 + p.f) * 8; g.beginPath(); g.moveTo(px - 14, py - f); g.quadraticCurveTo(px - 6, py - 4, px, py); g.quadraticCurveTo(px + 6, py - 4, px + 14, py - f); g.stroke(); }
        api.layer(montes);
        if (coliseu) api.layer(coliseu);
        if (fundoFogo) {
          api.layer(fundoFogo);
          for (const f of focos) { const [px, py, z] = aScreen(fundoFogo, f.u * fundoFogo.c.width, fundoFogo.c.height - 120, cam); chamaR(g, px, py, f.s * z, t, f.f);
            const k = (t * 0.07 + f.f) % 1; g.fillStyle = hex('#1a0c08', 0.4 * (1 - k)); ell(g, px + k * 120 * z, py - 200 * z - k * 700 * z, (60 + k * 200) * z, (50 + k * 150) * z); g.fill(); }
        }
        api.layer(cidade);
        if (P.fogo) for (let i = 0; i < 7; i++) { const [px, py, z] = aScreen(cidade, cidade.c.width * (0.12 + i * 0.13), 820 - 260 - (i % 3) * 60, cam); chamaR(g, px, py, (150 + (i % 3) * 60) * z, t, i * 1.3); }
        if (P.noite > 0.3) for (const u of [0.2, 0.42, 0.62, 0.84]) { const [px, py, z] = aScreen(cidade, cidade.c.width * u, 820 - 50, cam); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, px, py - 60 * z, 160 * z, '#ffb050', 0.5); g.restore(); chamaR(g, px, py - 40 * z, 40 * z, t, u * 9); }
        api.layer(chao);
        api.personagens();
        if (cam.z < 1.12) { g.globalAlpha = clamp((1.12 - cam.z) / 0.06, 0, 1); api.layer(frente); g.globalAlpha = 1; }
        if (P.fogo) { g.save(); g.globalCompositeOperation = 'lighter';
          for (const p of brasas) { const px = ((p.x * W + Math.sin(t * 0.7 + p.f) * 50) % W + W) % W, py = ((p.y * H - t * p.v * 3) % H + H) % H; g.fillStyle = `rgba(255,${130 + (p.f * 20) | 0},40,${0.4 + 0.4 * Math.sin(t * 4 + p.f)})`; ell(g, px, py, p.r, p.r); g.fill(); }
          g.restore(); }
        g.fillStyle = P.tom; g.fillRect(0, 0, W, H);
        if (P.noite > 0) { g.fillStyle = `rgba(0,0,20,${P.noite * 0.3})`; g.fillRect(0, 0, W, H); }
      },
    };
    return inst;
  },
};

// Cenario 2D "Cretaceo": selva com vulcao, rio, dinossauros, e o dia do asteroide.
// Usa o motor engine2d.html (scenes, ROLES, utilidades).

// ---------------------------------------------------------------- papeis (elenco)
Object.assign(ROLES, {
  explorador:   {pele: '#e9b98c', cabelo: '#4a2f1c', penteado: 'mop', chapeu: 'safari', corChapeu: '#c8b27c', faixa: '#6a4a2a', camisa: '#e3d6a8', colete: '#8a7a4a', calca: '#5a4a32', bota: '#3a2a1a', binoculos: true, lenco: '#c8381e'},
  exploradora:  {pele: '#d8a07a', cabelo: '#2a1a14', penteado: 'rabo', chapeu: 'bone', corChapeu: '#2f7a8a', camisa: '#f2f2ea', colete: '#5a8a6a', calca: '#4a4a3a', bota: '#2a1a14', oculos: '#2a2a30', mochila: '#6a3a2a'},
  guia:         {pele: '#c89268', cabelo: '#d8d4cc', penteado: 'careca', barba: '#d8d4cc', chapeu: 'safari', corChapeu: '#8a7a54', faixa: '#2a2a24', camisa: '#c05a3a', colete: '#4a5a3a', calca: '#6a5a40', bota: '#2a1a10', bigode: '#d8d4cc'},
  'bebe-tricera': {tipo: 'tricera', cor: '#72b46a', barriga: '#efe6a8', babado: '#e8744a', escala: 1.0},
});

// ---------------------------------------------------------------- paletas por hora
const PAL2 = {
  manha:  {sky: ['#4cb4ea', '#9fe0dc', '#ffe8b0'], sol: ['#fff8d0', 0.74, 0.26, 150], haze: '#c6f2dc', ridge: ['#86c4c0', '#5fa8aa'], vulc: '#6f8a9a', far: '#3f9a86', mid: '#2a7c58', near: '#1d6840', chao: ['#76b640', '#3a7a2a'], agua: ['#8ee4ee', '#3a9ec0'], tom: 'rgba(255,236,180,0.10)', noite: 0},
  dia:    {sky: ['#2a94e6', '#78cdf4', '#d8f4ff'], sol: ['#ffffff', 0.62, 0.18, 130], haze: '#d4f4f0', ridge: ['#7ec0c8', '#5aa4b0'], vulc: '#6a8a9c', far: '#3a9684', mid: '#2a8458', near: '#1a6e3c', chao: ['#7ec444', '#3a8030'], agua: ['#8ae8f6', '#2a98c8'], tom: 'rgba(255,255,255,0.04)', noite: 0},
  tarde:  {sky: ['#4a92d8', '#f4c474', '#ffe2a0'], sol: ['#fff0b0', 0.28, 0.34, 190], haze: '#ffe0b0', ridge: ['#c8a88a', '#9a8a8a'], vulc: '#8a7a88', far: '#6a8a5a', mid: '#4a7a3a', near: '#2c5a2a', chao: ['#a8aa44', '#5a6a2a'], agua: ['#ffd8a0', '#c8884a'], tom: 'rgba(255,190,100,0.16)', noite: 0},
  entardecer: {sky: ['#2a2c78', '#e0705a', '#ffc070'], sol: ['#ffd890', 0.30, 0.42, 210], haze: '#ffb08a', ridge: ['#b8707a', '#8a5a78'], vulc: '#7a5a74', far: '#5a5a5a', mid: '#3e5a38', near: '#243e2a', chao: ['#8a8a3a', '#4a5a28'], agua: ['#ffb088', '#a85a60'], tom: 'rgba(255,120,80,0.22)', noite: 0.15},
  impacto: {sky: ['#2a0a18', '#b83a1a', '#ffa43a'], sol: ['#ffe8a0', 0.40, 0.46, 240], haze: '#ff8a4a', ridge: ['#8a3a3a', '#5a2a34'], vulc: '#5a2a2e', far: '#4a2a2a', mid: '#2e2a22', near: '#1a1a16', chao: ['#7a6a2a', '#3a3a1a'], agua: ['#ff9a5a', '#8a3a2a'], tom: 'rgba(255,90,40,0.28)', noite: 0.3},
  noite:  {sky: ['#10081a', '#4a1218', '#b83a1e'], sol: ['#ffb070', 0.5, 0.5, 260], haze: '#c04a2a', ridge: ['#5a2a3a', '#3a1a2a'], vulc: '#3a1a22', far: '#2a1a1c', mid: '#1c1618', near: '#100c0c', chao: ['#4a3a22', '#241c14'], agua: ['#a04a2a', '#401a18'], tom: 'rgba(255,70,30,0.30)', noite: 0.5},
};
const HORA_MAP2 = {manha: 'manha', amanhecer: 'manha', dia: 'dia', tarde: 'tarde', entardecer: 'entardecer', impacto: 'impacto', noite: 'noite', madrugada: 'noite', 'ceu-vermelho': 'noite'};

// ---------------------------------------------------------------- desenho de plantas
function fronde(c, x, y, len, ang, queda, col, esp) {
  const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len + queda, cx = x + Math.cos(ang) * len * 0.55, cy = y + Math.sin(ang) * len * 0.55 - queda * 0.2;
  c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = esp * 0.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(cx, cy, ex, ey); c.stroke();
  const n = Math.max(8, Math.floor(len / 14));
  c.lineWidth = esp;
  for (let i = 1; i < n; i++) {
    const u = i / n, px = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx + u * u * ex, py = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy + u * u * ey;
    const tx = 2 * (1 - u) * (cx - x) + 2 * u * (ex - cx), ty = 2 * (1 - u) * (cy - y) + 2 * u * (ey - cy), tl = Math.hypot(tx, ty) || 1, nx = -ty / tl, ny = tx / tl;
    const l = esp * 3.4 * (1 - u * 0.75) * (0.8 + 0.4 * Math.sin(i * 1.9));
    c.beginPath(); c.moveTo(px - nx * l, py - ny * l + l * 0.25); c.lineTo(px, py); c.lineTo(px + nx * l, py + ny * l + l * 0.25); c.stroke();
  }
}
function samambaia(c, x, y, r, col, col2, n) {
  for (let i = 0; i < n; i++) { const a = -Math.PI + (i + 0.5) * Math.PI / n + rr(-0.12, 0.12); fronde(c, x, y, r * rr(0.75, 1.1), a, r * 0.35, i % 2 ? col : col2, Math.max(3, r / 22)); }
}
function palmeiraT(c, x, y, h, col, tr, folha) {
  c.strokeStyle = tr; c.lineCap = 'round'; c.lineWidth = Math.max(6, h / 16); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + h * 0.12, y - h * 0.5, x + h * 0.04, y - h); c.stroke();
  c.strokeStyle = mix(tr, '#000000', 0.25); c.lineWidth = Math.max(2, h / 60);
  for (let k = 1; k < 9; k++) { const u = k / 9; c.beginPath(); c.moveTo(x + h * 0.1 * u - h / 34, y - h * u); c.lineTo(x + h * 0.1 * u + h / 34, y - h * u - 3); c.stroke(); }
  const tx = x + h * 0.04, ty = y - h;
  for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.05 + i * 0.1) - 0.1; fronde(c, tx, ty, h * 0.42, a, h * 0.2, i % 2 ? folha : mix(folha, '#ffffff', 0.12), Math.max(3, h / 40)); }
  c.fillStyle = mix(tr, '#000000', 0.3); ell(c, tx, ty + 4, h / 28, h / 34); c.fill();
}
function araucaria(c, x, y, h, tr, folha) {
  c.fillStyle = tr; c.beginPath(); c.moveTo(x - h / 30, y); c.lineTo(x - h / 55, y - h); c.lineTo(x + h / 55, y - h); c.lineTo(x + h / 30, y); c.closePath(); c.fill();
  for (let i = 0; i < 9; i++) { const yy = y - h * (0.32 + i * 0.075), w = h * (0.34 - i * 0.025);
    c.strokeStyle = i % 2 ? folha : mix(folha, '#ffffff', 0.08); c.lineCap = 'round'; c.lineWidth = Math.max(6, h / 42);
    c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x - w * 0.6, yy - h * 0.02, x - w, yy + h * 0.045); c.stroke();
    c.beginPath(); c.moveTo(x, yy); c.quadraticCurveTo(x + w * 0.6, yy - h * 0.02, x + w, yy + h * 0.045); c.stroke(); }
  c.fillStyle = folha; ell(c, x, y - h * 1.0, h * 0.1, h * 0.07); c.fill();
}
function arvoreGuardaChuva(c, x, y, h, tr, folha, folha2) {
  c.fillStyle = tr; c.beginPath(); c.moveTo(x - h / 18, y); c.quadraticCurveTo(x - h / 40, y - h * 0.5, x - h / 36, y - h); c.lineTo(x + h / 36, y - h); c.quadraticCurveTo(x + h / 40, y - h * 0.5, x + h / 18, y); c.closePath(); c.fill();
  for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.06 + i * 0.147); c.strokeStyle = tr; c.lineWidth = h / 40; c.beginPath(); c.moveTo(x, y - h * 0.9); c.quadraticCurveTo(x + Math.cos(a) * h * 0.2, y - h * 1.1 + Math.sin(a) * h * 0.2, x + Math.cos(a) * h * 0.4, y - h * 1.0 + Math.sin(a) * h * 0.25); c.stroke(); }
  for (let i = 0; i < 12; i++) { const a = rr(0, Math.PI * 2), r = rr(0, h * 0.4); const px = x + Math.cos(a) * r * 1.2, py = y - h * 1.05 + Math.sin(a) * r * 0.4;
    c.fillStyle = i % 3 ? folha : folha2; ell(c, px, py, h * rr(0.12, 0.2), h * rr(0.06, 0.1)); c.fill(); }
}
function cipo(c, x, y, len, col) { c.strokeStyle = col; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + rr(-20, 20), y + len * 0.33, x + rr(-26, 26), y + len * 0.66, x + rr(-12, 12), y + len); c.stroke(); for (let i = 0; i < 4; i++) { c.fillStyle = col; ell(c, x + rr(-10, 10), y + len * (0.3 + i * 0.18), 9, 5); c.fill(); } }
function pedra(c, x, y, w, h, col) { c.fillStyle = lg(c, x - w, y - h, x + w, y, [[0, mix(col, '#ffffff', 0.25)], [1, mix(col, '#000000', 0.25)]]); c.beginPath(); c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 0.8, y - h, x - w * 0.1, y - h * 1.05); c.quadraticCurveTo(x + w * 0.8, y - h, x + w, y); c.closePath(); c.fill(); }
function cogumelo(c, x, y, s, cor) { c.fillStyle = '#efe6d0'; rrect(c, x - s * 0.18, y - s * 0.7, s * 0.36, s * 0.7, s * 0.12); c.fill(); c.fillStyle = cor; c.beginPath(); c.arc(x, y - s * 0.7, s * 0.55, Math.PI, 0); c.closePath(); c.fill(); c.fillStyle = 'rgba(255,255,255,0.85)'; for (const [dx, dy] of [[-0.25, -0.15], [0.12, -0.3], [0.28, -0.1]]) { ell(c, x + dx * s, y - s * 0.7 + dy * s, s * 0.08, s * 0.06); c.fill(); } }

// ---------------------------------------------------------------- dinossauros (silhuetas laterais)
function braquio(c, x, y, s, col, col2, fase, dir) {
  c.save(); c.translate(x, y); c.scale(s * (dir || 1), s);
  const pas = Math.sin(fase) * 12;
  c.fillStyle = col2;
  for (const [lx, ph] of [[-90, 0], [-50, Math.PI], [70, Math.PI], [110, 0]]) { c.beginPath(); c.moveTo(lx - 20, -90); c.lineTo(lx - 16 + Math.sin(fase + ph) * 14, 0); c.lineTo(lx + 16 + Math.sin(fase + ph) * 14, 0); c.lineTo(lx + 20, -90); c.closePath(); c.fill(); }
  c.fillStyle = lg(c, 0, -230, 0, -60, [[0, mix(col, '#ffffff', 0.18)], [1, col]]);
  ell(c, 10, -130, 170, 76); c.fill();
  c.beginPath(); c.moveTo(150, -150); c.quadraticCurveTo(250 + pas, -240, 262 + pas, -400); c.lineTo(310 + pas, -402); c.quadraticCurveTo(300 + pas, -230, 170, -88); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-150, -150); c.quadraticCurveTo(-270, -150, -400 + pas, -80); c.quadraticCurveTo(-270, -118, -150, -90); c.closePath(); c.fill();
  ell(c, 296 + pas, -410, 40, 22, -0.2); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, 308 + pas, -416, 5, 5); c.fill(); c.fillStyle = '#10161a'; ell(c, 309 + pas, -416, 2.6, 2.6); c.fill();
  c.restore();
}
function trex(c, x, y, s, col, col2, fase, dir, rugir) {
  c.save(); c.translate(x, y); c.scale(s * (dir || 1), s);
  const pas = Math.sin(fase) * 10, boca = rugir || 0;
  c.fillStyle = col2;
  for (const [lx, ph] of [[-20, 0], [-60, Math.PI]]) { c.beginPath(); c.moveTo(lx - 36, -170); c.quadraticCurveTo(lx - 10, -90, lx - 14 + Math.sin(fase + ph) * 12, -14); c.lineTo(lx + 42 + Math.sin(fase + ph) * 12, -14); c.lineTo(lx + 34, -20); c.quadraticCurveTo(lx + 36, -90, lx + 40, -170); c.closePath(); c.fill(); }
  c.fillStyle = lg(c, 0, -300, 0, -120, [[0, mix(col, '#ffffff', 0.15)], [1, col]]);
  c.beginPath(); c.moveTo(-230, -190); c.quadraticCurveTo(-120, -230, -40, -260); c.quadraticCurveTo(60, -300, 130, -250); c.quadraticCurveTo(180, -210, 160, -150); c.quadraticCurveTo(60, -110, -40, -120); c.quadraticCurveTo(-120, -140, -230, -190); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(100, -250); c.quadraticCurveTo(160 + pas * 0.3, -340, 190, -390); c.lineTo(260, -392); c.quadraticCurveTo(300, -380, 300, -340); c.lineTo(290, -318); c.lineTo(190, -300 + boca * 20); c.quadraticCurveTo(150, -270, 150, -190); c.closePath(); c.fill();
  c.fillStyle = col2; c.beginPath(); c.moveTo(196, -312); c.lineTo(292, -322); c.lineTo(282, -290 + boca * 38); c.quadraticCurveTo(230, -270 + boca * 38, 196, -280); c.closePath(); c.fill();
  c.fillStyle = '#f2ecd8'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(212 + i * 14, -314); c.lineTo(218 + i * 14, -298); c.lineTo(224 + i * 14, -314); c.fill(); }
  c.fillStyle = '#ffd24a'; ell(c, 232, -360, 9, 7); c.fill(); c.fillStyle = '#10100a'; ell(c, 234, -360, 3.4, 5); c.fill();
  c.strokeStyle = col2; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(120, -230); c.lineTo(160, -190); c.stroke();
  c.restore();
}
function ptero(c, x, y, s, col, fase) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  const f = Math.sin(fase) * 0.9;
  c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(-90, -30 - f * 60, -170, -10 - f * 90); c.quadraticCurveTo(-90, 6 - f * 20, -30, 14); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(6, 0); c.quadraticCurveTo(90, -30 - f * 60, 170, -10 - f * 90); c.quadraticCurveTo(90, 6 - f * 20, 30, 14); c.closePath(); c.fill();
  ell(c, 0, 8, 20, 9); c.fill(); c.beginPath(); c.moveTo(14, 6); c.lineTo(52, 2); c.lineTo(16, 12); c.fill(); c.beginPath(); c.moveTo(10, 0); c.lineTo(-6, -22); c.lineTo(20, 2); c.fill();
  c.restore();
}

// ---------------------------------------------------------------- construcao do cenario
scenes['selva-cretaceo'] = {
  build(horaIn) {
    const pk = HORA_MAP2[horaIn] || 'manha', P = PAL2[pk];
    const WW = 2592, YMIN = -420, YMAX = H;
    const mk = (p, y0, hh, fn) => { const w = Math.min(WW + 200, Math.ceil(W + 2 * 1012 * p + 60)); const [c, x] = off(w, hh); fn(x, w, hh); return {c, p, y: y0}; };
    _s = 424242 + pk.length * 7;

    // ---- ceu
    const sky = mk(0.02, YMIN, H + 420 + 200, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.sky[0]], [0.55, P.sky[1]], [1, P.sky[2]]]); x.fillRect(0, 0, w, hh);
      const sy = (H * P.sol[2]) + 420, sxp = w * P.sol[1];
      glow(x, sxp, sy, 520, P.sol[0], 0.55); glow(x, sxp, sy, 240, '#ffffff', 0.55);
      x.fillStyle = P.sol[0]; ell(x, sxp, sy, P.sol[3] * 0.42, P.sol[3] * 0.42); x.fill();
      if (P.noite > 0.25) for (let i = 0; i < 120; i++) { x.fillStyle = `rgba(255,230,200,${rr(0.2, 0.8)})`; ell(x, rr(0, w), rr(0, hh * 0.5), rr(1, 3), rr(1, 3)); x.fill(); }
      // faixas de nuvem altas
      for (let i = 0; i < 6; i++) { const cy = rr(300, 900), cxp = rr(0, w); x.fillStyle = hex(P.haze, 0.22); for (let k = 0; k < 6; k++) { ell(x, cxp + k * 70, cy + Math.sin(k) * 14, 110, 26); x.fill(); } }
    });
    // ---- cordilheiras + vulcao
    const volX = 0.62;
    const ridge = mk(0.07, 260, 700, (x, w, hh) => {
      for (const [k, col] of [[0, P.ridge[0]], [1, P.ridge[1]]]) {
        x.fillStyle = col; x.beginPath(); x.moveTo(0, hh);
        for (let i = 0; i <= 40; i++) { const px = i / 40 * w; x.lineTo(px, hh - 160 - k * 70 - Math.abs(Math.sin(i * 0.7 + k * 2)) * (150 - k * 40) - Math.sin(i * 0.31 + k) * 40); }
        x.lineTo(w, hh); x.closePath(); x.fill();
      }
      const vx = w * volX, base = hh - 130;
      x.fillStyle = lg(x, vx, base - 360, vx, base, [[0, mix(P.vulc, '#ffffff', 0.12)], [1, P.vulc]]);
      x.beginPath(); x.moveTo(vx - 520, hh); x.quadraticCurveTo(vx - 190, base - 40, vx - 70, base - 330); x.lineTo(vx + 70, base - 330); x.quadraticCurveTo(vx + 190, base - 40, vx + 520, hh); x.closePath(); x.fill();
      x.fillStyle = '#ff7a2a'; ell(x, vx, base - 332, 72, 14); x.fill(); glow(x, vx, base - 340, 190, '#ff6a1a', P.noite > 0.2 ? 0.8 : 0.45);
      x.fillStyle = hex(P.haze, 0.5); x.fillRect(0, hh - 90, w, 90);
    });
    ridge.vx = volX;
    // ---- selva de fundo (silhuetas de arvores)
    const far = mk(0.15, 360, 700, (x, w, hh) => {
      x.fillStyle = hex(P.haze, 0.0);
      for (let i = 0; i < 46; i++) { const px = rr(0, w), py = hh - 40 - rr(0, 40), h = rr(160, 340); const t = i % 3;
        if (t === 0) araucaria(x, px, py, h, mix(P.far, '#000000', 0.3), P.far); else if (t === 1) palmeiraT(x, px, py, h * 0.8, P.far, mix(P.far, '#000000', 0.35), P.far); else arvoreGuardaChuva(x, px, py, h, mix(P.far, '#000000', 0.3), P.far, mix(P.far, P.haze, 0.2)); }
      x.fillStyle = lg(x, 0, hh - 260, 0, hh, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.62)]]); x.fillRect(0, hh - 260, w, 260);
    });
    // ---- floresta media
    const mid = mk(0.3, 380, 760, (x, w, hh) => {
      for (let i = 0; i < 20; i++) { const px = rr(0, w), py = hh - rr(10, 60), h = rr(420, 640); const t = i % 3;
        if (t === 0) araucaria(x, px, py, h, mix(P.mid, '#000000', 0.45), P.mid); else if (t === 1) arvoreGuardaChuva(x, px, py, h, mix(P.mid, '#000000', 0.45), P.mid, mix(P.mid, '#ffffff', 0.1)); else palmeiraT(x, px, py, h * 0.6, P.mid, mix(P.mid, '#000000', 0.4), mix(P.mid, '#ffffff', 0.08)); }
      for (let i = 0; i < 20; i++) samambaia(x, rr(0, w), hh - rr(0, 40), rr(90, 170), P.mid, mix(P.mid, '#ffffff', 0.12), 9);
      x.fillStyle = lg(x, 0, hh - 220, 0, hh, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.45)]]); x.fillRect(0, hh - 220, w, 220);
    });
    // ---- lago com reflexo e neblina
    const lago = mk(0.45, 1090, 330, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.agua[0]], [1, P.agua[1]]]); x.fillRect(0, 40, w, hh);
      x.fillStyle = lg(x, 0, 0, 0, 90, [[0, hex(P.haze, 0.8)], [1, hex(P.haze, 0)]]); x.fillRect(0, 20, w, 90);
      for (let i = 0; i < 70; i++) { x.strokeStyle = `rgba(255,255,255,${rr(0.1, 0.35)})`; x.lineWidth = rr(2, 4); const px = rr(0, w), py = rr(60, hh - 10); x.beginPath(); x.moveTo(px, py); x.lineTo(px + rr(40, 160), py); x.stroke(); }
      for (let i = 0; i < 22; i++) { x.fillStyle = mix(P.mid, '#000000', 0.2); const px = rr(0, w); x.fillRect(px, 14, 5, rr(40, 90)); ell(x, px + 2, 14, 8, 22); x.fill(); }
    });
    // ---- chao (mesma paralaxe dos personagens)
    const chao = mk(1.0, 1290, YMAX - 1290 + 160, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.chao[0]], [1, P.chao[1]]]);
      x.beginPath(); x.moveTo(0, 60); for (let i = 0; i <= 60; i++) x.lineTo(i / 60 * w, 38 + Math.sin(i * 0.9) * 16 + Math.sin(i * 2.3) * 8); x.lineTo(w, hh); x.lineTo(0, hh); x.closePath(); x.fill();
      x.fillStyle = hex('#000000', 0.12); for (let i = 0; i < 14; i++) { ell(x, rr(0, w), rr(60, hh), rr(80, 240), rr(12, 30)); x.fill(); }
      x.fillStyle = hex(P.chao[0], 0.0);
      // trilha de pegadas
      x.fillStyle = hex('#000000', 0.18); for (let i = 0; i < 7; i++) { const px = w * (0.18 + i * 0.09), py = 230 + Math.sin(i) * 20 + i * 24; ell(x, px, py, 30, 20, 0.3); x.fill(); for (let k = -1; k <= 1; k++) { ell(x, px + k * 26, py - 26, 9, 14, k * 0.3); x.fill(); } }
      for (let i = 0; i < 520; i++) { const px = rr(0, w), py = rr(10, hh), h = rr(14, 52) * (0.5 + py / hh); x.strokeStyle = pick([P.chao[0], mix(P.chao[0], '#ffffff', 0.22), mix(P.chao[1], '#000000', 0.1), '#3f8a30']); x.lineWidth = rr(2, 4); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + rr(-8, 8), py - h * 0.6, px + rr(-18, 18), py - h); x.stroke(); }
      for (let i = 0; i < 60; i++) { const px = rr(0, w), py = rr(10, hh * 0.55), s = rr(10, 20); x.fillStyle = pick(['#ffd23f', '#ff6b8a', '#ffffff', '#c78bff']); ell(x, px, py, s * 0.5, s * 0.4); x.fill(); x.fillStyle = '#6a3a10'; ell(x, px, py, s * 0.18, s * 0.15); x.fill(); }
      for (let i = 0; i < 9; i++) pedra(x, rr(0, w), rr(60, hh - 30), rr(30, 80), rr(20, 50), mix('#8a8678', P.chao[1], 0.15));
      for (let i = 0; i < 10; i++) cogumelo(x, rr(100, w - 100), rr(70, hh - 20), rr(30, 56), pick(['#e8452f', '#e8a02f', '#c85ad8']));
    });
    // ---- moldura em primeiro plano: folhas gigantes nas laterais (p alto)
    const frente = mk(1.28, 520, YMAX - 520 + 160, (x, w, hh) => {
      for (const lado of [0, 1]) {
        const bx = w / 2 + (lado ? 1 : -1) * (W / 2 + 30), by = hh - 20;
        for (let i = 0; i < 8; i++) fronde(x, bx, by - i * 22, rr(520, 880), (lado ? Math.PI + rr(0.25, 1.1) : -rr(0.25, 1.1)), rr(60, 190), i % 2 ? P.near : mix(P.near, '#ffffff', 0.12), 15);
        for (let i = 0; i < 4; i++) cipo(x, w / 2 + (lado ? 1 : -1) * (W / 2 - rr(0, 230)), -10, rr(260, 560), mix(P.near, '#ffffff', 0.05));
      }
      for (const lado of [0, 1]) for (let i = 0; i < 5; i++) { const px = w / 2 + (lado ? 1 : -1) * (W / 2 - rr(-30, 140)); samambaia(x, px, hh - rr(0, 30), rr(200, 330), mix(P.near, '#ffffff', 0.12), P.near, 9); }
    });

    // ---- dinossauros animados (fora do alcance dos personagens)
    const sauros = [{x: 0.34, y: 0.88, s: 0.66, cor: 0.55, v: 8, ph: 0}, {x: 0.52, y: 0.9, s: 0.5, cor: 0.6, v: 6, ph: 1.7}, {x: 0.74, y: 0.86, s: 0.58, cor: 0.55, v: 7, ph: 3.1}];
    const ptes = []; for (let i = 0; i < 5; i++) ptes.push({x: rr(0, 1), y: rr(0.08, 0.3), s: rr(0.12, 0.28), v: rr(0.012, 0.03), f: rr(0, 6)});
    const poeira = []; for (let i = 0; i < 70; i++) poeira.push({x: rr(0, 1), y: rr(0, 1), r: rr(1.5, 4.5), v: rr(8, 24), f: rr(0, 6)});
    const fumos = []; for (let i = 0; i < 9; i++) fumos.push({f: i / 9});

    function aScreen(L, lx, ly, cam) {  // ponto da camada -> tela
      const zl = 1 + (cam.z - 1) * (0.25 + 0.75 * L.p), sx = (cam.cx - WW / 2) * L.p, sy = (cam.cy - H / 2) * L.p * 0.8;
      return [W / 2 + (lx - L.c.width / 2 - sx) * zl, H / 2 + (L.y + ly - H / 2 - sy) * zl, zl];
    }
    const ESCOLHAS = {impacto: 1, noite: 1, entardecer: 0.4};
    return {
      WW, yMin: YMIN, yMax: YMAX, cyBase: 0,
      slots: {prot: [WW / 2 + 150, 1540, 1.18], f: [[WW / 2 - 270, 1480, 1.14], [WW / 2 + 450, 1470, 1.14], [WW / 2 - 60, 1730, 1.1]]},
      draw(g, t, cam, api) {
        api.layer(sky);
        // nuvens suaves
        for (let i = 0; i < 6; i++) { const [px, py, z] = aScreen(sky, ((i * 0.23 + t * 0.004) % 1.2) * sky.c.width - 100, 520 + (i % 3) * 150, cam); g.fillStyle = hex(P.haze, 0.38); for (let k = 0; k < 5; k++) { ell(g, px + k * 60 * z, py + Math.sin(k) * 12, 80 * z, 26 * z); g.fill(); } }
        // asteroide
        if (pk === 'impacto') {
          const u = clamp(((t % 6) / 6), 0, 1), ex = W * (0.06 + u * 0.62), ey = H * (0.0 + u * 0.27);
          g.save(); g.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 24; k++) { const kk = k / 24; glow(g, ex - kk * 360, ey - kk * 220, 90 * (1 - kk * 0.6), kk < 0.2 ? '#fff2c0' : '#ff7a2a', 0.5 * (1 - kk)); }
          glow(g, ex, ey, 220, '#ffd890', 0.9); g.restore();
          g.fillStyle = '#2a1a14'; ell(g, ex, ey, 52, 44); g.fill(); g.fillStyle = '#ff8a2a'; ell(g, ex + 8, ey + 8, 36, 28); g.fill();
        }
        // pterossauros
        for (const p of ptes) { const px = ((p.x + t * p.v) % 1.3 - 0.15) * W, py = p.y * H + Math.sin(t * 0.9 + p.f) * 18; ptero(g, px, py, p.s * 1.4, pk === 'dia' || pk === 'manha' ? '#2a3a4a' : '#1a0e10', t * 5 + p.f); }
        api.layer(ridge);
        // fumaca do vulcao
        { const [vx, vy, z] = aScreen(ridge, ridge.c.width * ridge.vx, ridge.c.height - 130 - 332, cam); for (const f of fumos) { const k = (t * 0.05 + f.f) % 1; g.fillStyle = hex(pk === 'impacto' || pk === 'noite' ? '#3a2018' : '#8a8a94', 0.34 * (1 - k)); ell(g, vx + k * 90 * z + Math.sin(k * 6 + f.f * 9) * 20 * z, vy - k * 420 * z, (40 + k * 150) * z, (34 + k * 110) * z); g.fill(); } }
        api.layer(far);
        // saurios distantes caminhando
        for (const d of sauros) { const [px, py, z] = aScreen(far, ((d.x + t * 0.003 * d.v) % 1.1) * far.c.width, far.c.height - 40, cam); braquio(g, px, py, d.s * z * 0.9, mix(P.far, '#000000', 0.15), mix(P.far, '#000000', 0.35), t * 1.4 + d.ph, 1); }
        api.layer(mid);
        { const [px, py, z] = aScreen(mid, mid.c.width * 0.22, mid.c.height - 30, cam); trex(g, px, py, 0.5 * z, mix(P.mid, '#000000', 0.3), mix(P.mid, '#000000', 0.5), t * 1.1, 1, pk === 'impacto' || pk === 'noite' ? 0.5 + 0.5 * Math.sin(t * 4) : 0); }
        api.layer(lago);
        api.layer(chao);
        // ovos de dinossauro (ninho no chao, perto)
        { const [nx, ny, z] = aScreen(chao, chao.c.width * 0.56, 360, cam); g.fillStyle = '#5a3a1e'; ell(g, nx, ny, 150 * z, 40 * z); g.fill(); g.fillStyle = '#7a5230'; ell(g, nx, ny - 4 * z, 130 * z, 30 * z); g.fill();
          for (const [dx, dy, tc] of [[-60, -14, '#efe6c8'], [-5, -26, '#e8dcb4'], [55, -12, '#f2ead0'], [18, 6, '#e4d8b0']]) { g.fillStyle = tc; ell(g, nx + dx * z, ny + dy * z, 30 * z, 38 * z); g.fill(); g.fillStyle = 'rgba(120,90,50,0.25)'; ell(g, nx + (dx + 9) * z, ny + (dy + 8) * z, 8 * z, 9 * z); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; ell(g, nx + (dx - 9) * z, ny + (dy - 14) * z, 7 * z, 11 * z); g.fill(); } }
        api.personagens();
        if (cam.z < 1.3) { g.globalAlpha = clamp((1.3 - cam.z) / 0.15, 0, 1); api.layer(frente); g.globalAlpha = 1; }
        // brilho, poeira e brasas
        g.save(); g.globalCompositeOperation = 'lighter';
        for (const p of poeira) { const px = ((p.x * W + Math.sin(t * 0.5 + p.f) * 40 + t * p.v * (pk === 'impacto' ? -1 : 1)) % W + W) % W, py = ((p.y * H + t * p.v * (pk === 'impacto' || pk === 'noite' ? 2.4 : -0.6)) % H + H) % H;
          g.fillStyle = pk === 'impacto' || pk === 'noite' ? `rgba(255,${120 + (p.f * 20) | 0},40,${0.45 + 0.4 * Math.sin(t * 3 + p.f)})` : `rgba(255,248,200,${0.25 + 0.25 * Math.sin(t * 2 + p.f)})`; ell(g, px, py, p.r, p.r); g.fill(); }
        g.restore();
        if (pk === 'impacto' || pk === 'noite') { const [hx, hy, z] = aScreen(ridge, ridge.c.width * 0.78, ridge.c.height - 20, cam); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, hx, hy, (520 + 80 * Math.sin(t * 5)) * z, '#ff6a1a', 0.55); glow(g, hx, hy, 220 * z, '#ffd890', 0.45); g.restore(); }
        g.fillStyle = P.tom; g.fillRect(0, 0, W, H);
        if (pk === 'impacto') { const fl = Math.max(0, 1 - ((t % 6) - 4.6) * 2.2); if ((t % 6) > 4.6 && fl > 0) { g.fillStyle = `rgba(255,240,210,${fl * 0.7})`; g.fillRect(0, 0, W, H); } }
        if (P.noite > 0) { g.fillStyle = `rgba(10,0,10,${P.noite * 0.35})`; g.fillRect(0, 0, W, H); }
      },
    };
  },
};

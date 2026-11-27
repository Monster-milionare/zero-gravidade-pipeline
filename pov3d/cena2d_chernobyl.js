// Cenario 2D "Chernobyl": a usina V.I. Lenin, 26 de abril de 1986. Bloco 4 destruido, chamine listrada (VT-2),
// fogo no telhado, brilho azulado subindo do reator (relato de testemunhas), caminhoes de bombeiro, grafite no chao.
// Ao fundo, os predios de Pripyat e a roda-gigante amarela (que iria inaugurar em 1o de maio). Hora "dia" = o dia
// seguinte (26/04 a tarde, sol, a cidade ainda normal); "evacuacao" = 27/04 a tarde, onibus na rua.

Object.assign(ROLES, {
  'bombeiro':     {pele: '#e8b890', cabelo: '#3a2a1a', camisa: '#4a4a3a', manga: '#4a4a3a', calca: '#3a3a30', bota: '#1a1a1a', cinto: '#b8a040', chapeu: 'bombeiro', corChapeu: '#4a4a4a'},
  'bombeiro2':    {pele: '#eec29a', cabelo: '#6a4a2a', bigode: '#6a4a2a', camisa: '#4a4a3a', manga: '#4a4a3a', calca: '#3a3a30', bota: '#1a1a1a', cinto: '#b8a040', chapeu: 'bombeiro', corChapeu: '#4a4a4a'},
  'operador':     {pele: '#e8bc96', cabelo: '#3a281a', camisa: '#f4f4f0', manga: '#f4f4f0', calca: '#e8e8e4', bota: '#d8d8d4', cinto: '#d8d8d4', chapeu: 'touca', dosimetro: true},
  'engenheiro-usina': {pele: '#e3b48a', cabelo: '#8a8a88', penteado: 'careca', oculos: '#2a2a30', camisa: '#f4f4f0', manga: '#f4f4f0', calca: '#e8e8e4', bota: '#d8d8d4', cinto: '#d8d8d4', chapeu: 'touca'},
  'liquidador':   {pele: '#e8b890', cabelo: '#3a2a1a', camisa: '#5a6048', manga: '#5a6048', calca: '#4a503a', bota: '#1a1a1a', cinto: '#3a3a2a', chapeu: 'quepe', corChapeu: '#5a6048', mascara: true, dosimetro: true},
  'morador':      {pele: '#eec29a', cabelo: '#5a3a1e', penteado: 'mop', camisa: '#3a6aa8', manga: '#3a6aa8', calca: '#2a2a3a', bota: '#2a1a10', cinto: '#2a1a10'},
  'moradora':     {pele: '#f0c8a0', cabelo: '#c89850', penteado: 'rabo', camisa: '#c84a5a', manga: '#c84a5a', calca: '#3a3a4a', bota: '#2a1a10', cinto: '#2a1a10'},
  'oficial-sovietico': {pele: '#e6b58e', cabelo: '#4a4a48', camisa: '#6a6a6e', manga: '#6a6a6e', colete: '#5a5a5e', gravata: '#3a1a1a', calca: '#4a4a4e', bota: '#1a1a1a', cinto: '#2a2a2a'},
});

const PAL_C = {
  noite: {sky: ['#02040c', '#0a1224', '#1a2234'], haze: '#1a2436', floresta: '#0a120e', predio: '#2a3040', predioJ: '#d8b860', usina: '#5a5e66', usina2: '#3a3e46', chao: ['#2a2c30', '#141518'], tom: 'rgba(20,40,90,0.18)', noite: 0.4, fogo: 1, azul: 1, fumaca: '#2a2a30'},
  madrugada: {sky: ['#050810', '#14182a', '#3a2a30'], haze: '#2a2a38', floresta: '#0e1612', predio: '#323848', predioJ: '#c8a858', usina: '#62666e', usina2: '#42464e', chao: ['#32343a', '#18191c'], tom: 'rgba(60,40,80,0.16)', noite: 0.3, fogo: 0.8, azul: 0.6, fumaca: '#3a383c'},
  dia: {sky: ['#4a9ad8', '#a8d4ee', '#e8f2f4'], haze: '#d8e4e8', floresta: '#3a5a34', predio: '#e8e6e0', predioJ: '#4a5a6a', usina: '#d8d8d4', usina2: '#a8aaa8', chao: ['#9a9a94', '#6a6a66'], tom: 'rgba(255,255,240,0.04)', noite: 0, fogo: 0.15, azul: 0, fumaca: '#5a5a5e'},
  evacuacao: {sky: ['#6a9ac8', '#c8d8e0', '#f0eee4'], haze: '#e0e0dc', floresta: '#425e3a', predio: '#e4e2dc', predioJ: '#4a5a6a', usina: '#cfcfcb', usina2: '#a0a2a0', chao: ['#9a9a94', '#6a6a66'], tom: 'rgba(255,240,220,0.06)', noite: 0, fogo: 0.1, azul: 0, fumaca: '#6a6a6e', onibus: 1},
};
const HORA_C = {noite: 'noite', madrugada: 'madrugada', amanhecer: 'madrugada', dia: 'dia', manha: 'dia', tarde: 'dia', entardecer: 'evacuacao', evacuacao: 'evacuacao'};

function predioSov(c, x, yb, w, h, cor, janela, acesas) {
  c.fillStyle = cor; c.fillRect(x - w / 2, yb - h, w, h);
  c.fillStyle = hex('#000000', 0.12); c.fillRect(x + w * 0.3, yb - h, w * 0.2, h);
  const nx = Math.max(3, Math.floor(w / 30)), ny = Math.max(4, Math.floor(h / 34));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const lit = acesas && rnd() < acesas;
    c.fillStyle = lit ? '#ffd890' : janela; c.fillRect(x - w / 2 + 8 + i * (w - 16) / nx, yb - h + 12 + j * (h - 20) / ny, (w - 16) / nx * 0.55, (h - 20) / ny * 0.5);
  }
}
function rodaGigante(c, x, yb, r, cor, t) {
  c.strokeStyle = cor; c.lineWidth = 6;
  c.beginPath(); c.moveTo(x - r * 0.55, yb); c.lineTo(x, yb - r * 1.15); c.lineTo(x + r * 0.55, yb); c.stroke();
  const cy = yb - r * 1.15;
  c.beginPath(); c.arc(x, cy, r, 0, Math.PI * 2); c.stroke(); c.lineWidth = 2;
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + (t || 0); c.beginPath(); c.moveTo(x, cy); c.lineTo(x + Math.cos(a) * r, cy + Math.sin(a) * r); c.stroke(); }
  c.fillStyle = cor; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; rrect(c, x + Math.cos(a) * r - 9, cy + Math.sin(a) * r, 18, 16, 4); c.fill(); }
}
function chamineVT(c, x, yb, h, w) {
  // chamine de ventilacao VT-2: tubo alto, trelica ate 3/4 da altura, faixas vermelhas e brancas no topo
  c.fillStyle = lg(c, x - w / 2, 0, x + w / 2, 0, [[0, '#a8aaae'], [0.4, '#e8e8e4'], [1, '#8a8c90']]); c.fillRect(x - w / 2, yb - h, w, h);
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#f0f0ec' : '#c8281e'; c.fillRect(x - w / 2, yb - h + k * h * 0.06, w, h * 0.06 + 1); }
  c.strokeStyle = '#8a8c90'; c.lineWidth = 3;
  const n = 12, ht = h * 0.74;
  for (let k = 0; k < n; k++) { const y0 = yb - k * ht / n, y1 = yb - (k + 1) * ht / n, a = w * (2.4 - k * 0.12), b = w * (2.4 - (k + 1) * 0.12);
    c.beginPath(); c.moveTo(x - a, y0); c.lineTo(x + b, y1); c.moveTo(x + a, y0); c.lineTo(x - b, y1); c.moveTo(x - b, y1); c.lineTo(x + b, y1); c.moveTo(x - a, y0); c.lineTo(x - b, y1); c.moveTo(x + a, y0); c.lineTo(x + b, y1); c.stroke(); }
}
function caminhaoBomb(c, x, yb, s) {
  c.save(); c.translate(x, yb); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 0, 4, 260, 20); c.fill();
  c.fillStyle = '#b81e1e'; rrect(c, -230, -190, 330, 150, 10); c.fill();
  c.fillStyle = '#c82a22'; rrect(c, 100, -170, 120, 130, 14); c.fill();
  c.fillStyle = '#a8c8e0'; rrect(c, 130, -156, 70, 50, 6); c.fill();
  c.fillStyle = '#f0f0ec'; c.fillRect(-230, -96, 450, 12);
  c.fillStyle = '#8a8a8e'; c.fillRect(-220, -214, 300, 14); for (let k = 0; k < 8; k++) c.fillRect(-210 + k * 38, -224, 6, 30);
  c.fillStyle = '#1a1a1a'; for (const wx of [-160, -60, 160]) { ell(c, wx, -36, 40, 40); c.fill(); c.fillStyle = '#6a6a6e'; ell(c, wx, -36, 16, 16); c.fill(); c.fillStyle = '#1a1a1a'; }
  c.restore();
}
function onibus(c, x, yb, s, cor) {
  c.save(); c.translate(x, yb); c.scale(s, s);
  c.fillStyle = cor; rrect(c, -260, -190, 520, 160, 26); c.fill();
  c.fillStyle = '#f0f0ec'; c.fillRect(-260, -100, 520, 14);
  c.fillStyle = '#9ab8cc'; for (let k = 0; k < 7; k++) rrect(c, -236 + k * 70, -172, 56, 56, 6), c.fill();
  c.fillStyle = '#1a1a1a'; for (const wx of [-170, 170]) { ell(c, wx, -30, 36, 36); c.fill(); }
  c.restore();
}

scenes['chernobyl'] = {
  build(horaIn) {
    const pk = HORA_C[horaIn] || 'noite', P = PAL_C[pk];
    const WW = 2592, YMIN = -420, YMAX = H;
    const mk = (p, y0, hh, fn) => { const w = Math.min(WW + 200, Math.ceil(W + 2 * 1012 * p + 60)); const [c, x] = off(w, hh); fn(x, w, hh); return {c, p, y: y0}; };
    _s = 198604 + pk.length * 13;
    const sky = mk(0.02, YMIN, H + 620, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.sky[0]], [0.6, P.sky[1]], [1, P.sky[2]]]); x.fillRect(0, 0, w, hh);
      if (P.noite > 0.25) for (let i = 0; i < 170; i++) { x.fillStyle = `rgba(230,240,255,${rr(0.15, 0.8)})`; ell(x, rr(0, w), rr(0, hh * 0.5), rr(1, 2.6), rr(1, 2.6)); x.fill(); }
      else { glow(x, w * 0.8, 520, 420, '#fffbe0', 0.5); x.fillStyle = '#fffbe8'; ell(x, w * 0.8, 520, 56, 56); x.fill(); }
    });
    const fundo = mk(0.1, 560, 640, (x, w, hh) => {
      // floresta de pinheiros e Pripyat (a uns 3 km da usina)
      x.fillStyle = P.floresta; x.beginPath(); x.moveTo(0, hh);
      for (let i = 0; i <= 120; i++) x.lineTo(i / 120 * w, hh - 120 - (i % 2 ? 26 : 0) - Math.sin(i * 0.3) * 10); x.lineTo(w, hh); x.closePath(); x.fill();
      for (let i = 0; i < 7; i++) predioSov(x, w * 0.03 + i * 62 + rr(-8, 8), hh - 110, rr(54, 76), rr(200, 300), mix(P.predio, P.haze, 0.35), mix(P.predioJ, P.haze, 0.3), P.noite > 0.2 ? 0.18 : 0);
      rodaGigante(x, w * 0.2, hh - 110, 80, mix('#e8c020', P.haze, P.noite > 0.2 ? 0.6 : 0.15), 0);
      x.fillStyle = lg(x, 0, hh - 220, 0, hh, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.5)]]); x.fillRect(0, hh - 220, w, 220);
    });
    const usina = mk(0.26, 300, 1150, (x, w, hh) => {
      const yb = 860, C0 = w / 2 + 60, K = 1.35;
      // sala das turbinas (longa e baixa), so do lado direito: a esquerda fica a vista de Pripyat
      x.fillStyle = P.usina2; x.fillRect(C0 - 260, yb - 220 * K, 1200, 220 * K);
      x.fillStyle = hex('#000000', 0.15); for (let k = 0; k < 22; k++) x.fillRect(C0 - 250 + k * 55, yb - 200 * K, 6, 180 * K);
      // bloco 3 (inteiro)
      x.fillStyle = P.usina; x.fillRect(C0 - 480, yb - 470 * K, 400, 470 * K);
      x.fillStyle = hex('#000000', 0.18); for (let k = 0; k < 6; k++) x.fillRect(C0 - 462 + k * 66, yb - 450 * K, 24, 420 * K);
      // chamine VT-2 entre o 3 e o 4
      chamineVT(x, C0 - 40, yb, 820, 52);
      // bloco 4 (destruido): parede com topo arrebentado
      const Y = v => yb - v * K;
      x.fillStyle = P.usina; x.beginPath(); x.moveTo(C0 + 20, yb); x.lineTo(C0 + 20, Y(430)); x.lineTo(C0 + 80, Y(470)); x.lineTo(C0 + 120, Y(380));
      x.lineTo(C0 + 170, Y(420)); x.lineTo(C0 + 230, Y(300)); x.lineTo(C0 + 290, Y(360)); x.lineTo(C0 + 340, Y(260)); x.lineTo(C0 + 400, Y(390)); x.lineTo(C0 + 460, Y(450)); x.lineTo(C0 + 460, yb); x.closePath(); x.fill();
      x.fillStyle = hex('#000000', 0.3); for (let k = 0; k < 6; k++) x.fillRect(C0 + 40 + k * 70, Y(250), 22, 230 * K);
      x.strokeStyle = hex('#1a1a1a', 0.7); x.lineWidth = 5; for (let k = 0; k < 9; k++) { x.beginPath(); x.moveTo(C0 + 100 + k * 36, Y(300 + (k % 3) * 30)); x.lineTo(C0 + 100 + k * 36 + rr(-20, 20), Y(360 + (k % 2) * 60)); x.stroke(); }
      // cerca
      x.fillStyle = mix(P.usina2, '#000000', 0.3); for (let k = 0; k < 40; k++) x.fillRect(k * w / 40, yb - 70, 5, 70);
      x.fillRect(0, yb - 60, w, 4); x.fillRect(0, yb - 30, w, 4);
      x.fillStyle = lg(x, 0, yb - 160, 0, yb, [[0, hex(P.haze, 0)], [1, hex(P.haze, 0.35)]]); x.fillRect(0, yb - 160, w, 160);
      x.fillStyle = lg(x, 0, yb, 0, hh, [[0, mix(P.chao[0], P.haze, 0.3)], [1, P.chao[0]]]); x.fillRect(0, yb - 8, w, hh - yb + 8);
    });
    usina.rx = 0.5 + 300 / usina.c.width;          // centro do buraco do reator (fracao da camada)
    const chao = mk(1.0, 1290, YMAX - 1290 + 160, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, P.chao[0]], [1, P.chao[1]]]); x.fillRect(0, 0, w, hh);
      x.fillStyle = hex('#000000', 0.12); for (let i = 0; i < 18; i++) { ell(x, rr(0, w), rr(80, hh), rr(80, 260), rr(10, 30)); x.fill(); }
      // pocas d'agua (das mangueiras)
      for (let i = 0; i < 8; i++) { x.fillStyle = hex(P.noite > 0.2 ? '#3a4a6a' : '#b8c8d8', 0.35); ell(x, rr(0, w), rr(100, hh - 40), rr(90, 200), rr(14, 26)); x.fill(); }
      // blocos de grafite espalhados (do nucleo)
      for (let i = 0; i < 26; i++) { const px = rr(0, w), py = rr(70, hh - 30), s = rr(14, 34) * (0.6 + py / hh); x.fillStyle = '#121214'; x.save(); x.translate(px, py); x.rotate(rr(-0.6, 0.6)); x.fillRect(-s, -s * 0.6, s * 2, s * 1.2); x.fillStyle = '#2a2a2e'; x.fillRect(-s, -s * 0.6, s * 2, s * 0.3); x.restore(); }
      // monte de grafite bem perto (ponto 'grafite')
      for (let i = 0; i < 12; i++) { const px = WW / 2 + 940 + rr(-200, 200), py = 270 + rr(-50, 60), s = rr(30, 62); x.save(); x.translate(px, py); x.rotate(rr(-0.7, 0.7));
        x.fillStyle = '#0e0e10'; x.fillRect(-s, -s * 0.55, s * 2, s * 1.1); x.fillStyle = '#2e2e34'; x.fillRect(-s, -s * 0.55, s * 2, s * 0.28); x.fillStyle = '#1c1c20'; x.fillRect(s * 0.6, -s * 0.55, s * 0.4, s * 1.1); x.restore(); }
      // mangueiras
      x.strokeStyle = '#c8c0a0'; x.lineWidth = 9; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(rr(0, w * 0.3), hh); x.bezierCurveTo(rr(0, w), rr(100, hh), rr(0, w), rr(60, hh), rr(w * 0.4, w), 50); x.stroke(); }
    });
    const veic = mk(0.62, 1060, 360, (x, w, hh) => {
      if (P.onibus) { for (let i = 0; i < 4; i++) onibus(x, w * 0.18 + i * 380, hh - 30, 0.6, i % 2 ? '#e8c84a' : '#3a7ac8'); }
      else { caminhaoBomb(x, w * 0.26, hh - 30, 0.62); caminhaoBomb(x, w * 0.74, hh - 24, 0.66); }
    });
    const particulas = []; for (let i = 0; i < 110; i++) particulas.push({x: rr(0, 1), y: rr(0, 1), r: rr(1, 3.5), v: rr(10, 34), f: rr(0, 6)});
    const fumos = []; for (let i = 0; i < 12; i++) fumos.push({f: i / 12});
    function aScreen(L, lx, ly, cam) {
      const zl = 1 + (cam.z - 1) * (0.25 + 0.75 * L.p), sx = (cam.cx - WW / 2) * L.p, sy = (cam.cy - H / 2) * L.p * 0.8;
      return [W / 2 + (lx - L.c.width / 2 - sx) * zl, H / 2 + (L.y + ly - H / 2 - sy) * zl, zl];
    }
    const C = WW / 2;
    return {
      WW, yMin: YMIN, yMax: YMAX, cyBase: 0,
      slots: {prot: [C + 150, 1540, 1.18], f: [[C - 270, 1480, 1.14], [C + 450, 1470, 1.14], [C - 60, 1730, 1.1]]},
      pontos: {
        'ampla':    {cx: C, cy: 960, z: 1.0},
        'ceu':      {cx: C + 300, cy: 520, z: 1.0, pos: [C + 300, 360], esc: 1.0},
        'reator':   {cx: C + 560, cy: 640, z: 1.2, pos: [C + 640, 560]},
        'coluna':   {cx: C + 560, cy: 420, z: 1.05, pos: [C + 640, 200]},
        'chamine':  {cx: C, cy: 520, z: 1.15},
        'cidade':   {cx: C - 760, cy: 900, z: 1.2},
        'roda':     {cx: C - 740, cy: 860, z: 1.3},
        'caminhao': {cx: C - 520, cy: 1180, z: 1.3},
        'grafite':  {cx: C + 820, cy: 1500, z: 2.0, pos: [C + 840, 1560]},
        'chao':     {cx: C, cy: 1300, z: 1.3, pos: [C, 1560]},
        'perto':    {cx: C + 60, cy: 1100, z: 1.25, pos: [C + 80, 1290], esc: 0.75},
        'fora-esq': {cx: C - 700, cy: 1100, z: 1.1, pos: [-500, 1500]},
        'fora-dir': {cx: C + 700, cy: 1100, z: 1.1, pos: [WW + 500, 1500]},
      },
      draw(g, t, cam, api) {
        api.layer(sky);
        // coluna azulada de ar ionizado sobre o reator (como contaram testemunhas) + fumaca
        const [rx, ry, rz] = aScreen(usina, usina.c.width * usina.rx, 860 - 420, cam);
        if (P.azul) { g.save(); g.globalCompositeOperation = 'lighter';
          const a = P.azul * (0.5 + 0.08 * Math.sin(t * 3));
          g.fillStyle = lg(g, 0, ry - 1500 * rz, 0, ry, [[0, 'rgba(120,170,255,0)'], [0.7, `rgba(140,190,255,${a * 0.35})`], [1, `rgba(200,225,255,${a * 0.6})`]]);
          g.beginPath(); g.moveTo(rx - 90 * rz, ry); g.lineTo(rx - 210 * rz, ry - 1500 * rz); g.lineTo(rx + 210 * rz, ry - 1500 * rz); g.lineTo(rx + 90 * rz, ry); g.closePath(); g.fill(); g.fill();
          glow(g, rx, ry, 260 * rz, '#9ac0ff', a * 0.6); g.restore(); }
        api.layer(fundo);
        for (const f of fumos) { const k = (t * 0.045 + f.f) % 1; g.fillStyle = hex(P.fumaca, (P.noite > 0.2 ? 0.45 : 0.55) * (1 - k)); ell(g, rx + k * 260 * rz + Math.sin(k * 5 + f.f * 7) * 30 * rz, ry - 80 * rz - k * 900 * rz, (70 + k * 260) * rz, (60 + k * 180) * rz); g.fill(); }
        api.layer(usina);
        if (P.fogo) { const [ux, uy, uz] = aScreen(usina, usina.c.width * 0.5 + 760, 860 - 80, cam);
          g.save(); g.globalCompositeOperation = 'lighter';
          glow(g, rx, ry + 40 * rz, 320 * rz, '#ff7a2a', 0.55 * P.fogo);
          for (let i = 0; i < 6; i++) chamaR(g, ux - 300 * uz + i * 110 * uz, uy - 220 * uz, (50 + (i % 3) * 30) * uz * P.fogo, t, i * 1.7);     // fogo no telhado da sala das turbinas
          for (let i = 0; i < 4; i++) chamaR(g, rx - 90 * rz + i * 60 * rz, ry + 20 * rz, (90 + (i % 2) * 50) * rz * P.fogo, t, i * 2.3);
          g.restore(); }
        api.layer(veic);
        if (!P.onibus && P.noite > 0.2) { const [vx, vy, vz] = aScreen(veic, veic.c.width * 0.26 + 30, veic.c.height - 170, cam); const on = Math.sin(t * 9) > 0;
          g.save(); g.globalCompositeOperation = 'lighter'; glow(g, vx, vy, 160 * vz, on ? '#3a7aff' : '#ff3a3a', 0.6); const [wx, wy] = aScreen(veic, veic.c.width * 0.74 + 30, veic.c.height - 170, cam); glow(g, wx, wy, 160 * vz, on ? '#ff3a3a' : '#3a7aff', 0.6); g.restore(); }
        api.layer(chao);
        api.personagens();
        g.save(); g.globalCompositeOperation = 'lighter';
        for (const p of particulas) { const px = ((p.x * W + Math.sin(t * 0.5 + p.f) * 40) % W + W) % W, py = ((p.y * H - t * p.v * (P.fogo > 0.5 ? 1.6 : 0.4)) % H + H) % H;
          g.fillStyle = P.fogo > 0.5 ? `rgba(255,${150 + (p.f * 15) | 0},70,${0.3 + 0.35 * Math.sin(t * 3 + p.f)})` : `rgba(255,255,230,${0.12 + 0.12 * Math.sin(t * 2 + p.f)})`; ell(g, px, py, p.r, p.r); g.fill(); }
        g.restore();
        g.fillStyle = P.tom; g.fillRect(0, 0, W, H);
        if (P.noite > 0) { g.fillStyle = `rgba(0,0,12,${P.noite * 0.3})`; g.fillRect(0, 0, W, H); }
      },
    };
  },
};
// helicoptero Mi-8 (dias depois: jogaram areia, chumbo e boro no reator)
ENTS['helicoptero'] = {draw(g, sx, sy, esc, t, e) {
  g.save(); g.translate(sx, sy); g.scale(esc * (e.dir || 1), esc);
  g.fillStyle = '#4a5a3a'; ell(g, 0, 0, 170, 56); g.fill(); g.fillRect(120, -24, 220, 30); g.fillStyle = '#3a4a2e'; g.fillRect(320, -70, 26, 70);
  g.fillStyle = '#9ab8cc'; ell(g, -120, -6, 46, 30); g.fill();
  g.strokeStyle = '#1a1a1a'; g.lineWidth = 6; const r = Math.sin(t * 40) * 260; g.beginPath(); g.moveTo(-r, -66); g.lineTo(r, -66); g.stroke(); g.fillStyle = '#2a2a2a'; g.fillRect(-12, -72, 24, 18);
  g.fillStyle = '#2a2a2a'; g.fillRect(-90, 56, 180, 8);
  g.restore();
}};

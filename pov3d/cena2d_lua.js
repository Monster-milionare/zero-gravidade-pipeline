// Cenarios 2D "Superficie da Lua" (Apollo 11): superficie com astronautas e bandeira, e a descida/pouso do modulo lunar visto de fora.
// Depende de cena2d_nasa.js (helpers mkL, estrelas, terra, WWn, GY). Carregar DEPOIS dele. Mesmo motor engine2d.html.

// ---------------------------------------------------------------- papeis: tripulacao da Apollo 11
Object.assign(ROLES, {
  armstrong:        {pele: '#e8b890', cabelo: '#6a5238', penteado: 'mop', camisa: AZUL_VOO, manga: AZUL_VOO, calca: '#2f5a94', bota: '#d8d8d0', emblema: '#c8281e', cinto: '#2a3f66'},
  aldrin:           {pele: '#eec29a', cabelo: '#b8a074', penteado: 'mop', camisa: AZUL_VOO, manga: AZUL_VOO, calca: '#2f5a94', bota: '#d8d8d0', emblema: '#c8281e', cinto: '#2a3f66'},
  collins:          {pele: '#e0a984', cabelo: '#2a1c14', penteado: 'mop', camisa: AZUL_VOO, manga: AZUL_VOO, calca: '#2f5a94', bota: '#d8d8d0', emblema: '#c8281e', cinto: '#2a3f66'},
  'armstrong-traje': {pele: '#e8b890', cabelo: '#6a5238', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#c8281e'},
  'aldrin-traje':    {pele: '#eec29a', cabelo: '#b8a074', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#c8281e'},
  'collins-traje':   {pele: '#e0a984', cabelo: '#2a1c14', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#c8281e'},
});

// ---------------------------------------------------------------- utilidades
function modLunar(c, x, y, s, o) {   // Eagle: x = centro, y = base das sapatas; s = escala; o.chama = true (motor de descida ligado)
  o = o || {};
  c.save(); c.translate(x, y); c.scale(s, s);
  // pernas e sapatas
  c.strokeStyle = '#b8b8bc'; c.lineWidth = 9; c.lineCap = 'round';
  for (const [ax, ay, bx, by] of [[-62, -92, -140, -4], [62, -92, 140, -4], [-30, -88, -50, -2], [30, -88, 50, -2]]) { c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); }
  c.fillStyle = '#d8d8dc'; for (const px of [-150, 150]) { ell(c, px, 0, 26, 6); c.fill(); }
  c.strokeStyle = '#8a8a92'; c.lineWidth = 5; c.beginPath(); c.moveTo(-100, -50); c.lineTo(-6, -92); c.moveTo(100, -50); c.lineTo(6, -92); c.stroke();
  // estagio de descida (dourado)
  c.fillStyle = lg(c, 0, -150, 0, -80, [[0, '#f4d276'], [0.5, '#d8a63a'], [1, '#8a6218']]);
  c.beginPath(); c.moveTo(-82, -150); c.lineTo(82, -150); c.lineTo(96, -88); c.lineTo(-96, -88); c.closePath(); c.fill();
  c.fillStyle = 'rgba(70,44,8,0.3)'; for (let i = 0; i < 6; i++) c.fillRect(-72 + i * 28, -148, 5, 58);
  c.fillStyle = '#e8e8ec'; c.fillRect(-90, -92, 180, 6);
  // estagio de subida (cinza, com janelas triangulares)
  c.fillStyle = lg(c, -70, -250, 70, -150, [[0, '#dcdce0'], [1, '#8e8e98']]);
  c.beginPath(); c.moveTo(-66, -150); c.lineTo(66, -150); c.lineTo(78, -220); c.lineTo(40, -262); c.lineTo(-40, -262); c.lineTo(-78, -220); c.closePath(); c.fill();
  c.fillStyle = '#1a2230'; for (const dx of [-30, 30]) { c.beginPath(); c.moveTo(dx - 15, -206); c.lineTo(dx + 15, -206); c.lineTo(dx + (dx < 0 ? 4 : -4), -236); c.closePath(); c.fill(); }
  c.fillStyle = '#a8a8b0'; rrect(c, -22, -278, 44, 18, 4); c.fill();
  c.strokeStyle = '#7a7a82'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, -278); c.lineTo(0, -310); c.stroke(); ell(c, 0, -316, 18, 8); c.fill();
  // escada na perna da frente
  c.strokeStyle = '#c8c8cc'; c.lineWidth = 4; c.beginPath(); c.moveTo(-22, -88); c.lineTo(-40, -4); c.stroke();
  for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-26 - i * 3, -80 + i * 17); c.lineTo(-14 - i * 3, -80 + i * 17); c.stroke(); }
  if (o.chama) {
    c.fillStyle = 'rgba(255,200,90,0.9)'; c.beginPath(); c.moveTo(-18, -88); c.lineTo(18, -88); c.lineTo(0, -88 + 130 + rr(-10, 14)); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,250,210,0.95)'; c.beginPath(); c.moveTo(-8, -88); c.lineTo(8, -88); c.lineTo(0, -88 + 70 + rr(-6, 8)); c.closePath(); c.fill();
  }
  c.restore();
}
function bandeiraEUA(c, x, y, h) {   // haste + bandeira "esticada" (sem vento na Lua), x = pe do mastro
  c.strokeStyle = '#dcdce0'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke();
  c.beginPath(); c.moveTo(x, y - h + 4); c.lineTo(x + h * 0.5, y - h + 4); c.stroke();
  const w = h * 0.5, hh = h * 0.34, y0 = y - h + 4;
  for (let i = 0; i < 7; i++) { c.fillStyle = i % 2 ? '#f4f4f4' : '#c8282e'; c.fillRect(x, y0 + i * hh / 7, w, hh / 7 + 0.5); }
  c.fillStyle = '#26408a'; c.fillRect(x, y0, w * 0.42, hh * 4 / 7);
  c.fillStyle = '#ffffff'; for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) ell(c, x + 8 + k * (w * 0.42 - 12) / 3.4, y0 + 7 + r * (hh * 4 / 7 - 10) / 3.4, 1.6, 1.6), c.fill();
}
function solo_lunar(x, w, hh, y0, seed) {   // chao cinza com crateras e pedras
  const sv = _s; _s = seed;
  x.fillStyle = lg(x, 0, y0, 0, hh, [[0, '#8e8c86'], [0.5, '#6e6c68'], [1, '#3e3d3b']]); x.fillRect(0, y0, w, hh - y0);
  for (let i = 0; i < 26; i++) { const cx = rr(0, w), cy = rr(y0 + 20, hh - 20), r = rr(30, 120);
    x.fillStyle = 'rgba(40,39,37,0.45)'; ell(x, cx, cy, r, r * 0.28); x.fill(); x.fillStyle = 'rgba(190,188,180,0.35)'; ell(x, cx - r * 0.1, cy - r * 0.07, r * 0.9, r * 0.2); x.fill(); }
  for (let i = 0; i < 90; i++) { const cx = rr(0, w), cy = rr(y0 + 10, hh), r = rr(4, 16);
    x.fillStyle = 'rgba(30,30,28,0.6)'; ell(x, cx + r * 0.3, cy + r * 0.25, r, r * 0.55); x.fill(); x.fillStyle = mix('#a8a6a0', '#7a7874', rnd()); ell(x, cx, cy, r, r * 0.6); x.fill(); }
  _s = sv;
}

// ---------------------------------------------------------------- cenario: superficie da Lua (com astronautas)
scenes['superficie-lunar'] = {
  build(horaIn) {
    _s = 2102; const WW = WWn;
    const ceu = mkL(0.03, 0, H, (x, w, hh) => { x.fillStyle = '#000004'; x.fillRect(0, 0, w, hh); estrelas(x, w, hh * 0.7, 360, 1969); terra(x, w * 0.72, hh * 0.2, 96, 0.35); });
    const longe = mkL(0.14, 0, H, (x, w, hh) => {   // colinas baixas ao longe
      x.fillStyle = '#5c5a56'; x.beginPath(); x.moveTo(0, hh * 0.62);
      for (let i = 0; i <= 24; i++) x.lineTo(i * w / 24, hh * (0.56 + 0.05 * Math.sin(i * 1.3) + 0.03 * Math.cos(i * 2.9)));
      x.lineTo(w, hh); x.lineTo(0, hh); x.closePath(); x.fill();
    });
    const meio = mkL(0.4, 0, H, (x, w, hh) => { solo_lunar(x, w, hh, hh * 0.66, 4242); modLunar(x, w * 0.72, hh * 0.76, 1.3); });
    const chao = mkL(1.0, 0, H, (x, w, hh) => {
      solo_lunar(x, w, hh, GY - 40, 777);
      x.fillStyle = 'rgba(30,30,28,0.35)'; for (let i = 0; i < 18; i++) { const px = w * (0.1 + 0.04 * i); ell(x, px, GY + 70 + (i % 2) * 18, 9, 4); x.fill(); }   // pegadas
    });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2 - 200, GY + 70, 0.92], f: [[WW / 2 + 120, GY + 64, 0.9], [WW / 2 - 480, GY + 60, 0.88], [WW / 2 + 380, GY + 58, 0.88]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || '';
        api.layer(ceu); api.layer(longe); api.layer(meio);
        if (fx === 'bandeira') {
          const L = chao, zl = 1 + (cam.z - 1) * (0.25 + 0.75 * L.p), sx = (cam.cx - WW / 2) * L.p, sy = (cam.cy - H / 2) * L.p * 0.8;
          const bx = W / 2 + (WW / 2 + 520 - sx - WW / 2) * zl, by = H / 2 + (GY + 40 - H / 2 - sy) * zl;
          api.layer(chao);
          g.save(); g.translate(bx, by); g.scale(zl, zl); bandeiraEUA(g, 0, 0, 330); g.restore();
        } else api.layer(chao);
        api.personagens();
        g.fillStyle = 'rgba(255,250,235,0.05)'; g.fillRect(0, 0, W, H);
      },
    };
  },
};

// ---------------------------------------------------------------- cenario: descida e pouso do modulo lunar visto de fora (sem personagens)
scenes['descida-lunar'] = {
  build(horaIn) {
    _s = 2103; const WW = WWn;
    const ceu = mkL(0.03, 0, H, (x, w, hh) => { x.fillStyle = '#000004'; x.fillRect(0, 0, w, hh); estrelas(x, w, hh * 0.7, 300, 1970); terra(x, w * 0.8, hh * 0.18, 80, 0.35); });
    const longe = mkL(0.2, 0, H, (x, w, hh) => {
      x.fillStyle = '#5c5a56'; x.beginPath(); x.moveTo(0, hh * 0.68);
      for (let i = 0; i <= 24; i++) x.lineTo(i * w / 24, hh * (0.64 + 0.04 * Math.sin(i * 1.9) + 0.025 * Math.cos(i * 3.3)));
      x.lineTo(w, hh); x.lineTo(0, hh); x.closePath(); x.fill();
    });
    const chao = mkL(1.0, 0, H, (x, w, hh) => { solo_lunar(x, w, hh, H * 0.7, 91); });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2, GY, 0.7], f: [[WW / 2, GY, 0.7], [WW / 2, GY, 0.7], [WW / 2, GY, 0.7]]},
      draw(g, t, cam, api) {
        const fx = (api.shot && api.shot.fx) || 'descida';
        api.layer(ceu); api.layer(longe); api.layer(chao);
        const u = clamp(api.u, 0, 1), gy = H * 0.86;
        const x0 = W * 0.5 + Math.sin(t * 0.6) * 4;
        if (fx === 'pousado') {
          modLunar(g, x0, gy, 1.5);
          g.fillStyle = 'rgba(200,198,190,0.22)'; for (let i = 0; i < 9; i++) { const k = (t * 0.12 + i / 9) % 1; ell(g, x0 + (i % 2 ? 1 : -1) * (80 + k * 520), gy - 4, 40 + k * 120, 6 + k * 10); g.fill(); }   // poeira assentando
        } else {
          const alt = (1 - u) * 330 + 20;                           // desce devagar durante o plano
          if (fx === 'poeira') { /* poeira levantada pelo jato */ }
          g.fillStyle = 'rgba(205,203,195,0.35)';
          for (let i = 0; i < 26; i++) { const k = (t * 0.9 + i / 26) % 1, d = (i % 2 ? 1 : -1) * k * 620; ell(g, x0 + d, gy - 2 - k * 20, 34 + k * 70, 7 + k * 8); g.fill(); }
          modLunar(g, x0, gy - alt, 1.5, {chama: true});
          g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x0, gy - alt - 20, 260, '#ffc870', 0.45); g.restore();
        }
        g.fillStyle = 'rgba(255,250,235,0.04)'; g.fillRect(0, 0, W, H);
      },
    };
  },
};

// ---------------------------------------------------------------- extensao: efeito 'alarme' no interior do modulo lunar (alarme 1202 da Apollo 11)
(function () {
  const base = scenes['modulo-lunar'].build;
  scenes['modulo-lunar'].build = function (horaIn) {
    const r = base.call(this, horaIn), d0 = r.draw;
    r.draw = function (g, t, cam, api) {
      d0.call(this, g, t, cam, api);
      if (((api.shot && api.shot.fx) || '') === 'alarme') {
        const k = 0.5 + 0.5 * Math.sin(t * 9);
        g.fillStyle = `rgba(255,30,20,${0.08 + 0.12 * k})`; g.fillRect(0, 0, W, H);
        g.fillStyle = rg(g, W / 2, H / 2, H * 0.3, H * 0.9, [[0, 'rgba(255,0,0,0)'], [1, `rgba(255,0,0,${0.22 + 0.28 * k})`]]); g.fillRect(0, 0, W, H);
      }
    };
    return r;
  };
})();

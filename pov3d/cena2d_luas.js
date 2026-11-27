// Zero Gravidade: cenarios "europa" (gelo de Jupiter), "tita" (lago de metano) e "asteroide".
function chaoMundo(x, w, hh, y0, c1, c2, seed, n) {
  const sv = _s; _s = seed;
  x.fillStyle = lg(x, 0, y0, 0, hh, [[0, c1], [1, c2]]); x.beginPath(); x.moveTo(0, y0 + 20);
  for (let i = 0; i <= 48; i++) x.lineTo(i / 48 * w, y0 + Math.sin(i * 1.7) * 14 + rr(-8, 8));
  x.lineTo(w, hh); x.lineTo(0, hh); x.closePath(); x.fill();
  for (let i = 0; i < n; i++) { const px = rr(0, w), py = rr(y0 + 30, hh), r = rr(6, 34); x.fillStyle = 'rgba(0,0,0,0.20)'; ell(x, px + r * 0.3, py + r * 0.2, r, r * 0.4); x.fill(); x.fillStyle = mix(c1, c2, rnd()); ell(x, px, py, r, r * 0.45); x.fill(); }
  _s = sv;
}
function picos(x, w, hh, base, alt, col, n, seed) {
  const sv = _s; _s = seed; x.fillStyle = col; x.beginPath(); x.moveTo(0, hh); x.lineTo(0, base);
  for (let i = 0; i <= n; i++) { x.lineTo((i + 0.35) / n * w, base - rr(alt * 0.2, alt)); x.lineTo((i + 1) / n * w, base - rr(0, alt * 0.25)); }
  x.lineTo(w, hh); x.closePath(); x.fill(); _s = sv;
}
function mundo(camadas, extra) {
  return {
    WW: WWn, yMin: 0, yMax: H, cyBase: 0,
    slots: {prot: [WWn / 2 - 200, GY + 70, 0.92], f: [[WWn / 2 + 130, GY + 64, 0.9], [WWn / 2 - 480, GY + 60, 0.88], [WWn / 2 + 390, GY + 58, 0.88]]},
    draw(g, t, cam, api) { camadas.forEach(L => api.layer(L)); api.personagens(); if (extra) extra(g, t); },
  };
}

scenes['europa'] = {
  build() {
    const ceu = mkL(0.03, 0, H, (x, w, hh) => {
      x.fillStyle = '#04060f'; x.fillRect(0, 0, w, hh); estrelas(x, w, hh * 0.75, 380, 5150);
      const jx = w * 0.62, jy = hh * 0.27, R = 330;
      glow(x, jx, jy, R * 1.5, '#ffd8a0', 0.22);
      x.save(); ell(x, jx, jy, R, R); x.clip();
      const faixas = ['#e8d0a8', '#c89468', '#f0e0c0', '#a8704c', '#e8c898', '#f4e8d0', '#b8805a', '#e0c090', '#c8a078'];
      faixas.forEach((col, i) => { x.fillStyle = col; x.fillRect(jx - R, jy - R + i * R * 2 / faixas.length, R * 2, R * 2 / faixas.length + 2); });
      x.fillStyle = '#b85a3a'; ell(x, jx + R * 0.3, jy + R * 0.32, 74, 44); x.fill();
      x.fillStyle = 'rgba(0,0,10,0.55)'; ell(x, jx - R * 0.75, jy, R * 0.85, R * 1.25); x.fill();
      x.restore();
    });
    const longe = mkL(0.14, 0, H, (x, w, hh) => { picos(x, w, hh, hh * 0.66, 190, '#6a88a8', 18, 311); });
    const meio = mkL(0.4, 0, H, (x, w, hh) => { chaoMundo(x, w, hh, hh * 0.69, '#b8d4e8', '#5a7c9c', 612, 40); picos(x, w, hh * 0.72, hh * 0.72, 100, '#d4e8f6', 9, 77); });
    const chao = mkL(1.0, 0, H, (x, w, hh) => {
      chaoMundo(x, w, hh, GY - 40, '#e4f2fc', '#8aaac4', 913, 60);
      const sv = _s; _s = 44;
      for (let k = 0; k < 9; k++) { let px = rr(0, w), py = rr(GY - 10, hh - 20); x.strokeStyle = k % 3 ? '#a8603a' : '#2a5a8a'; x.lineWidth = rr(4, 9); x.beginPath(); x.moveTo(px, py); for (let i = 0; i < 7; i++) { px += rr(30, 90); py += rr(-28, 28); x.lineTo(px, py); } x.stroke(); }
      _s = sv;
    });
    return mundo([ceu, longe, meio, chao], (g, t) => {
      g.fillStyle = 'rgba(210,240,255,0.7)'; for (let i = 0; i < 45; i++) { const k = (t * 0.05 + i * 0.137) % 1; ell(g, (i * 223) % W, H * (1 - k), 2 + (i % 3), 2 + (i % 3)); g.fill(); }
      g.fillStyle = 'rgba(80,130,200,0.08)'; g.fillRect(0, 0, W, H);
    });
  },
};

scenes['tita'] = {
  build() {
    const ceu = mkL(0.03, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, '#6a3a10'], [0.45, '#b8701e'], [0.68, '#e8a840']]); x.fillRect(0, 0, w, hh);
      glow(x, w * 0.3, hh * 0.24, 330, '#ffe0a0', 0.45);
      for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(255,200,110,0.13)'; ell(x, (i * 331) % w, hh * (0.1 + 0.05 * i), 420, 34); x.fill(); }
    });
    const longe = mkL(0.14, 0, H, (x, w, hh) => { picos(x, w, hh, hh * 0.64, 130, '#9a5a24', 11, 912); });
    const lago = mkL(0.4, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, hh * 0.65, 0, hh, [[0, '#d89038'], [0.25, '#5a3412'], [1, '#2a1808']]); x.fillRect(0, hh * 0.65, w, hh * 0.35);
      const sv = _s; _s = 818; for (let i = 0; i < 80; i++) { x.fillStyle = 'rgba(255,210,130,' + rr(0.12, 0.45) + ')'; rrect(x, rr(0, w), rr(hh * 0.67, hh * 0.86), rr(40, 170), 5, 2); x.fill(); } _s = sv;
    });
    const chao = mkL(1.0, 0, H, (x, w, hh) => {
      chaoMundo(x, w, hh, GY - 10, '#8a5a2a', '#3a2210', 215, 70);
      const sv = _s; _s = 99; for (let i = 0; i < 26; i++) pedraT(x, rr(0, w), rr(GY, hh - 20), rr(20, 62)); _s = sv;
    });
    return mundo([ceu, longe, lago, chao], (g, t) => {
      g.fillStyle = 'rgba(255,170,60,0.12)'; g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,220,160,0.30)'; for (let i = 0; i < 38; i++) { const k = (t * 0.09 + i * 0.211) % 1; ell(g, (i * 191) % W + Math.sin(t + i) * 22, H * k, 3, 8); g.fill(); }
    });
  },
};
function pedraT(x, px, py, r) { x.fillStyle = 'rgba(0,0,0,0.3)'; ell(x, px + r * 0.2, py + r * 0.1, r * 1.1, r * 0.35); x.fill(); x.fillStyle = lg(x, px - r, py - r, px + r, py, [[0, '#d8a060'], [1, '#6a421c']]); ell(x, px, py - r * 0.3, r, r * 0.55); x.fill(); }

scenes['asteroide'] = {
  build() {
    const ceu = mkL(0.03, 0, H, (x, w, hh) => {
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, '#020208'], [1, '#14122a']]); x.fillRect(0, 0, w, hh); estrelas(x, w, hh, 620, 777);
      glow(x, w * 0.2, hh * 0.18, 300, '#fff4d0', 0.5); x.fillStyle = '#fffbe8'; ell(x, w * 0.2, hh * 0.18, 30, 30); x.fill();
      x.fillStyle = '#2a6ab8'; ell(x, w * 0.75, hh * 0.33, 36, 36); x.fill(); x.fillStyle = '#e8f4ff'; ell(x, w * 0.75 - 8, hh * 0.33 - 8, 14, 8); x.fill();
    });
    const nave = mkL(0.2, 0, H, (x, w, hh) => {
      const px = w * 0.52, py = hh * 0.46; x.fillStyle = '#c8ccd8'; rrect(x, px - 60, py - 40, 120, 80, 18); x.fill(); x.fillStyle = '#e8b040'; rrect(x, px - 52, py - 6, 104, 40, 8); x.fill();
      x.fillStyle = '#24468a'; for (const d of [-1, 1]) { rrect(x, px + d * 150 - 74, py - 28, 148, 56, 6); x.fill(); x.fillRect(px + d * 68 - 12, py - 4, 24, 8); }
      x.strokeStyle = '#9aa0b0'; x.lineWidth = 7; x.beginPath(); x.moveTo(px, py + 40); x.lineTo(px - 20, py + 120); x.stroke();
    });
    const meio = mkL(0.4, 0, H, (x, w, hh) => { picos(x, w, hh, hh * 0.74, 150, '#3a342e', 14, 54); });
    const chao = mkL(1.0, 0, H, (x, w, hh) => {
      chaoMundo(x, w, hh, GY - 60, '#6a6058', '#26221e', 1999, 130);
      const sv = _s; _s = 31; for (let i = 0; i < 34; i++) { const px = rr(0, w), py = rr(GY - 30, hh - 20), r = rr(14, 58); x.fillStyle = lg(x, px - r, py - r, px + r, py, [[0, '#8a8076'], [1, '#2a2622']]); ell(x, px, py - r * 0.3, r, r * 0.7, rr(-0.4, 0.4)); x.fill(); } _s = sv;
    });
    return mundo([ceu, nave, meio, chao], (g, t) => {
      for (let i = 0; i < 14; i++) { const px = (i * 263 + t * (12 + i)) % (W + 80) - 40, py = H * (0.3 + 0.045 * i) + Math.sin(t * 0.8 + i) * 18; g.fillStyle = '#7a7068'; ell(g, px, py, 6 + (i % 4) * 3, 5 + (i % 3) * 2, i); g.fill(); }
    });
  },
};

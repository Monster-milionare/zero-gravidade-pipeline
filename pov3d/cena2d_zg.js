// Zero Gravidade BR: elenco proprio (astronautas e cientistas ficticios) + cenario de Marte.
// Usa utilidades de cena2d_nasa.js (mkL, WWn, GY, estrelas) e cena2d_lua.js.

Object.assign(ROLES, {
  // astronautas ficticios (macacao laranja de lancamento / traje branco com capacete)
  comandante:   {pele: '#e0a984', cabelo: '#2a1c14', penteado: 'mop', camisa: '#e8742a', manga: '#e8742a', calca: '#d8641e', bota: '#d8d8d0', emblema: '#2a5ab8', cinto: '#2a3f66'},
  piloto:       {pele: '#d29c76', cabelo: '#1c1410', penteado: 'rabo', camisa: '#2f5a94', manga: '#2f5a94', calca: '#2a4a7c', bota: '#d8d8d0', emblema: '#e8c030', cinto: '#1c2a44'},
  cientista:    {pele: '#eec29a', cabelo: '#7a4a2a', penteado: 'rabo', camisa: '#f4f4f0', manga: '#f4f4f0', calca: '#3a4a6a', bota: '#2a2a30', oculos: '#2a2a30', jaleco: true},
  'comandante-traje': {pele: '#e0a984', cabelo: '#2a1c14', penteado: 'mop', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#e8742a', emblema: '#2a5ab8'},
  'piloto-traje':     {pele: '#d29c76', cabelo: '#1c1410', penteado: 'rabo', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#2f8ae8', emblema: '#e8c030'},
  'cientista-traje':  {pele: '#eec29a', cabelo: '#7a4a2a', penteado: 'rabo', camisa: '#f1f1ec', manga: '#f1f1ec', calca: '#e6e6e0', bota: '#c8c8c2', capacete: true, cinto: '#6ac848', emblema: '#c8281e'},
});

// ---------------------------------------------------------------- Marte
function solo_marte(x, w, hh, y0, seed) {
  const sv = _s; _s = seed;
  x.fillStyle = lg(x, 0, y0, 0, hh, [[0, '#c4683a'], [0.5, '#a34f2c'], [1, '#6a301a']]); x.fillRect(0, y0, w, hh - y0);
  for (let i = 0; i < 22; i++) { const cx = rr(0, w), cy = rr(y0 + 20, hh - 20), r = rr(40, 140);
    x.fillStyle = 'rgba(70,28,14,0.35)'; ell(x, cx, cy, r, r * 0.26); x.fill(); x.fillStyle = 'rgba(240,150,100,0.25)'; ell(x, cx - r * 0.1, cy - r * 0.07, r * 0.9, r * 0.18); x.fill(); }
  for (let i = 0; i < 110; i++) { const cx = rr(0, w), cy = rr(y0 + 10, hh), r = rr(4, 18);
    x.fillStyle = 'rgba(50,20,10,0.55)'; ell(x, cx + r * 0.3, cy + r * 0.25, r, r * 0.55); x.fill(); x.fillStyle = mix('#b8643a', '#7a3a20', rnd()); ell(x, cx, cy, r, r * 0.6); x.fill(); }
  _s = sv;
}
function habitat(c, x, y, s) {   // cupula de pouso + painel solar
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 0, 4, 190, 20); c.fill();
  c.fillStyle = lg(c, 0, -190, 0, 0, [[0, '#f2f2ee'], [1, '#b0b2b8']]); c.beginPath(); c.moveTo(-150, 0); c.quadraticCurveTo(-150, -190, 0, -190); c.quadraticCurveTo(150, -190, 150, 0); c.closePath(); c.fill();
  c.strokeStyle = '#8a8c94'; c.lineWidth = 4; c.stroke();
  c.fillStyle = '#26406a'; rrect(c, -34, -118, 68, 50, 14); c.fill(); c.fillStyle = 'rgba(160,210,255,0.5)'; rrect(c, -28, -112, 30, 20, 8); c.fill();
  c.fillStyle = '#3a4a66'; rrect(c, 78, -70, 36, 70, 6); c.fill();
  // painel solar
  c.strokeStyle = '#7a7c84'; c.lineWidth = 5; c.beginPath(); c.moveTo(-150, -40); c.lineTo(-210, -40); c.stroke();
  c.fillStyle = '#1c3a7a'; c.beginPath(); c.moveTo(-330, -20); c.lineTo(-210, -62); c.lineTo(-210, 6); c.lineTo(-330, 20); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(160,200,255,0.5)'; c.lineWidth = 2; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-330 + i * 30, -20 + i * 10 / 3 * 0); c.lineTo(-330 + i * 30, 20 - i * 3); c.stroke(); }
  c.restore();
}
scenes['marte'] = {
  build(horaIn) {
    const noite = horaIn === 'noite' || horaIn === 'madrugada';
    const tempestade = horaIn === 'tempestade';
    _s = 4301; const WW = WWn;
    const ceu = mkL(0.03, 0, H, (x, w, hh) => {
      if (noite) { x.fillStyle = lg(x, 0, 0, 0, hh, [[0, '#0a0614'], [1, '#3a1a2a']]); x.fillRect(0, 0, w, hh); estrelas(x, w, hh * 0.7, 300, 1976); return; }
      const t = tempestade ? ['#6a3a22', '#a8623a', '#d8946a'] : ['#c8785a', '#e8a07a', '#f6cfa8'];
      x.fillStyle = lg(x, 0, 0, 0, hh, [[0, t[0]], [0.6, t[1]], [1, t[2]]]); x.fillRect(0, 0, w, hh);
      if (!tempestade) { glow(x, w * 0.7, hh * 0.3, 380, '#cfe6ff', 0.4); x.fillStyle = '#eaf4ff'; ell(x, w * 0.7, hh * 0.3, 48, 48); x.fill(); }
    });
    const longe = mkL(0.14, 0, H, (x, w, hh) => {
      x.fillStyle = tempestade ? '#7a4a38' : '#9a5a42'; x.beginPath(); x.moveTo(0, hh * 0.64);
      for (let i = 0; i <= 24; i++) x.lineTo(i * w / 24, hh * (0.56 + 0.06 * Math.sin(i * 1.3) + 0.04 * Math.cos(i * 2.9)));
      x.lineTo(w, hh); x.lineTo(0, hh); x.closePath(); x.fill();
    });
    const meio = mkL(0.4, 0, H, (x, w, hh) => { solo_marte(x, w, hh, hh * 0.66, 5252); habitat(x, w * 0.74, hh * 0.77, 1.25); });
    const chao = mkL(1.0, 0, H, (x, w, hh) => {
      solo_marte(x, w, hh, GY - 40, 878);
      x.fillStyle = 'rgba(60,22,10,0.35)'; for (let i = 0; i < 18; i++) { const px = w * (0.1 + 0.04 * i); ell(x, px, GY + 70 + (i % 2) * 18, 9, 4); x.fill(); }
    });
    return {
      WW, yMin: 0, yMax: H, cyBase: 0,
      slots: {prot: [WW / 2 - 200, GY + 70, 0.92], f: [[WW / 2 + 120, GY + 64, 0.9], [WW / 2 - 480, GY + 60, 0.88], [WW / 2 + 380, GY + 58, 0.88]]},
      draw(g, t, cam, api) {
        api.layer(ceu); api.layer(longe); api.layer(meio); api.layer(chao);
        api.personagens();
        if (tempestade) {   // poeira em suspensao
          g.fillStyle = 'rgba(200,110,60,0.28)'; g.fillRect(0, 0, W, H);
          g.fillStyle = 'rgba(255,200,150,0.35)';
          for (let i = 0; i < 70; i++) { const k = (t * 0.7 + i / 70) % 1; ell(g, (i * 137) % W + Math.sin(t + i) * 30, H * ((i * 53) % 100) / 100, 60 + k * 40, 3); g.fill(); }
        } else { g.fillStyle = 'rgba(255,190,140,0.06)'; g.fillRect(0, 0, W, H); }
      },
    };
  },
};

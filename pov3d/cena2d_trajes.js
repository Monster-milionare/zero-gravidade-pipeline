// Trajes extras do motor 2D (ganchos chamados por humano() em engine2d.html).
// Corpo: origem nos pes, tronco de y=-325 a -138, ombros em (+-80, -308). Cabeca: centro (0,0), raio ~114.
//   capa: cor da capa (atras do corpo)          toga: cor da toga (faixa diagonal)   togaFaixa: borda (purpura do senador)
//   saia: tunica/saiote (cobre a coxa)          tiras: tiras de couro no saiote       lanca: cor da haste (lanca ao lado)
//   chapeu: galea | galea-centuriao | louros | bombeiro | touca | mongol | quepe | elmo-medieval | capuz
//   mascara: respirador branco                  cachos: cor dos cachos (cabelo cacheado por cima)
//   bico: mascara de medico da peste (bico)     dosimetro: caixinha no peito
window.TRAJES = {
  tras(c, o) {
    if (o.capa) {
      c.fillStyle = lg(c, 0, -330, 0, -40, [[0, mix(o.capa, '#ffffff', 0.1)], [1, mix(o.capa, '#000000', 0.25)]]);
      c.beginPath(); c.moveTo(-92, -318); c.quadraticCurveTo(-150, -170, -132, -46); c.lineTo(132, -46); c.quadraticCurveTo(150, -170, 92, -318); c.closePath(); c.fill();
    }
    if (o.lanca) {
      c.strokeStyle = o.lanca; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(150, -10); c.lineTo(150, -640); c.stroke();
      c.fillStyle = '#c8ccd4'; c.beginPath(); c.moveTo(138, -630); c.lineTo(150, -720); c.lineTo(162, -630); c.closePath(); c.fill();
    }
  },
  corpo(c, o) {
    if (o.saia) {
      c.fillStyle = o.saia;
      c.beginPath(); c.moveTo(-70, -152); c.lineTo(70, -152); c.lineTo(92, -62); c.quadraticCurveTo(0, -48, -92, -62); c.closePath(); c.fill();
      if (o.tiras) { c.fillStyle = o.tiras; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 22 - 8, -150); c.lineTo(i * 26 - 9, -64); c.lineTo(i * 26 + 9, -64); c.lineTo(i * 22 + 8, -150); c.closePath(); c.fill(); }
        c.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = -3; i <= 3; i++) { ell(c, i * 26, -66, 8, 4); c.fill(); } }
    }
    if (o.toga) {
      c.fillStyle = lg(c, -80, -330, 80, -150, [[0, mix(o.toga, '#ffffff', 0.15)], [1, mix(o.toga, '#000000', 0.12)]]);
      c.beginPath(); c.moveTo(-82, -330); c.lineTo(-22, -336); c.lineTo(74, -186); c.lineTo(70, -132); c.lineTo(20, -132); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 4;
      for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-70 + k * 16, -330); c.lineTo(30 + k * 12, -140); c.stroke(); }
      if (o.togaFaixa) { c.strokeStyle = o.togaFaixa; c.lineWidth = 12; c.beginPath(); c.moveTo(-24, -334); c.lineTo(72, -184); c.stroke(); }
    }
    if (o.dosimetro) { c.fillStyle = '#2a2a2a'; rrect(c, 22, -296, 42, 56, 6); c.fill(); c.fillStyle = '#c8e070'; rrect(c, 28, -288, 30, 16, 3); c.fill(); }
  },
  rosto(c, o) {
    if (o.mascara) {
      c.fillStyle = '#f4f4f0'; ell(c, 0, 50, 66, 46); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-60, 46); c.quadraticCurveTo(0, 30, 60, 46); c.stroke();
      c.beginPath(); c.moveTo(0, 6); c.lineTo(0, 94); c.stroke();
      c.strokeStyle = '#d8d8d0'; c.lineWidth = 5; c.beginPath(); c.moveTo(-64, 40); c.lineTo(-112, 0); c.moveTo(64, 40); c.lineTo(112, 0); c.stroke();
    }
    if (o.bico) {
      c.fillStyle = '#e8dcc0'; c.beginPath(); c.moveTo(-40, 10); c.quadraticCurveTo(40, 30, 190, 150); c.quadraticCurveTo(40, 110, -30, 80); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 4; c.stroke();
      c.fillStyle = '#1a1a1a'; for (const sx of [-1, 1]) { ell(c, 44 * sx, -4, 34, 34); c.fill(); }
      c.fillStyle = 'rgba(200,220,255,0.35)'; for (const sx of [-1, 1]) { ell(c, 44 * sx - 6, -12, 14, 12); c.fill(); }
    }
  },
  cabeca(c, o) {
    if (o.cachos) { c.fillStyle = o.cachos; for (let i = 0; i < 11; i++) { const a = Math.PI * (1.08 + i * 0.084); ell(c, Math.cos(a) * 106, Math.sin(a) * 100 - 4, 26, 24); c.fill(); } }
    const ch = o.chapeu;
    if (ch === 'galea' || ch === 'galea-centuriao') {
      const br = o.corChapeu || '#b8b8c0';
      if (ch === 'galea-centuriao') {   // crista transversal de penas vermelhas (o centuriao)
        c.fillStyle = '#b81e1e'; c.beginPath(); c.moveTo(-150, -96); c.quadraticCurveTo(0, -250, 150, -96); c.quadraticCurveTo(0, -150, -150, -96); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.22)'; c.lineWidth = 3; for (let k = -6; k <= 6; k++) { c.beginPath(); c.moveTo(k * 20, -128); c.lineTo(k * 24, -170 + Math.abs(k) * 6); c.stroke(); }
      } else {
        c.fillStyle = '#b81e1e'; c.beginPath(); c.moveTo(-26, -112); c.quadraticCurveTo(0, -210, 26, -112); c.closePath(); c.fill();
        c.fillStyle = '#8a1414'; ell(c, 0, -170, 34, 46); c.fill(); c.fillStyle = '#c8281e'; ell(c, -6, -176, 22, 38); c.fill();
      }
      c.fillStyle = lg(c, -110, -130, 110, -20, [[0, mix(br, '#ffffff', 0.35)], [1, mix(br, '#000000', 0.25)]]);
      c.beginPath(); c.moveTo(-120, -6); c.quadraticCurveTo(-126, -128, 0, -132); c.quadraticCurveTo(126, -128, 120, -6); c.quadraticCurveTo(0, -52, -120, -6); c.closePath(); c.fill();
      c.fillStyle = mix(br, '#000000', 0.2); c.fillRect(-118, -58, 236, 14);
      for (const sx of [-1, 1]) { c.fillStyle = mix(br, '#000000', 0.08); c.beginPath(); c.moveTo(102 * sx, -30); c.lineTo(122 * sx, -30); c.lineTo(108 * sx, 70); c.lineTo(80 * sx, 60); c.closePath(); c.fill(); }
    }
    if (ch === 'louros') {
      for (const sx of [-1, 1]) for (let i = 0; i < 8; i++) {
        const a = Math.PI * 1.5 + sx * (0.25 + i * 0.16), x = Math.cos(a) * 112, y = Math.sin(a) * 92 - 20;
        c.fillStyle = i % 2 ? '#4a8a3a' : '#6aa84a'; ell(c, x, y, 26, 11, a + sx * 0.9); c.fill();
      }
      c.fillStyle = '#d8b84a'; ell(c, 0, -112, 10, 8); c.fill();
    }
    if (ch === 'bombeiro') {
      const cor = o.corChapeu || '#3a3a3e';
      c.fillStyle = mix(cor, '#000000', 0.15); ell(c, 0, -48, 150, 26); c.fill();
      c.fillStyle = lg(c, -100, -150, 100, -40, [[0, mix(cor, '#ffffff', 0.25)], [1, cor]]);
      c.beginPath(); c.moveTo(-108, -48); c.quadraticCurveTo(-112, -160, 0, -164); c.quadraticCurveTo(112, -160, 108, -48); c.closePath(); c.fill();
      c.fillStyle = mix(cor, '#ffffff', 0.35); c.fillRect(-8, -164, 16, 116);
      c.fillStyle = '#d8b84a'; ell(c, 0, -92, 16, 18); c.fill();
    }
    if (ch === 'touca') {
      c.fillStyle = o.corChapeu || '#f6f6f2'; rrect(c, -100, -158, 200, 100, 30); c.fill();
      c.fillStyle = 'rgba(0,0,0,0.08)'; c.fillRect(-100, -78, 200, 12);
    }
    if (ch === 'quepe') {
      const cor = o.corChapeu || '#5a6048';
      c.fillStyle = mix(cor, '#000000', 0.15); ell(c, 0, -112, 128, 30); c.fill();
      c.fillStyle = cor; rrect(c, -104, -120, 208, 64, 18); c.fill();
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(-90, -58); c.quadraticCurveTo(0, -30, 90, -58); c.lineTo(80, -64); c.quadraticCurveTo(0, -48, -80, -64); c.closePath(); c.fill();
      c.fillStyle = o.insignia || '#c8c8c8'; ell(c, 0, -94, 12, 12); c.fill();
    }
    if (ch === 'mongol') {
      const cor = o.corChapeu || '#a8281e';
      c.fillStyle = lg(c, 0, -230, 0, -70, [[0, mix(cor, '#ffffff', 0.15)], [1, cor]]);
      c.beginPath(); c.moveTo(-92, -76); c.quadraticCurveTo(-60, -200, 0, -236); c.quadraticCurveTo(60, -200, 92, -76); c.closePath(); c.fill();
      c.fillStyle = '#d8b84a'; ell(c, 0, -240, 14, 14); c.fill();
      c.fillStyle = o.pelo || '#6a4a2a'; rrect(c, -126, -100, 252, 56, 26); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 12; i++) { ell(c, -110 + i * 20, -80 + (i % 2) * 10, 8, 14); c.fill(); }
    }
    if (ch === 'elmo-medieval') {
      c.fillStyle = lg(c, -100, -140, 100, -20, [[0, '#d8dce4'], [1, '#7a808c']]);
      c.beginPath(); c.moveTo(-118, -10); c.quadraticCurveTo(-124, -140, 0, -150); c.quadraticCurveTo(124, -140, 118, -10); c.quadraticCurveTo(0, -46, -118, -10); c.closePath(); c.fill();
      c.fillStyle = '#6a707c'; c.fillRect(-8, -60, 16, 110);
    }
    if (ch === 'capuz') {
      c.fillStyle = o.corChapeu || '#2a2420';
      c.beginPath(); c.moveTo(-132, 90); c.quadraticCurveTo(-150, -150, 0, -150); c.quadraticCurveTo(150, -150, 132, 90); c.quadraticCurveTo(120, -40, 0, -70); c.quadraticCurveTo(-120, -40, -132, 90); c.closePath(); c.fill();
      if (o.bico) { c.fillStyle = mix(o.corChapeu || '#2a2420', '#000000', 0.2); ell(c, 0, -150, 140, 18); c.fill(); c.fillRect(-80, -210, 160, 62); }
    }
  },
};

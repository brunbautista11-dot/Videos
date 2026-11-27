// Virales 27/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: el mensaje enviado con gravedad (U. de Queensland) · p2: papas en suelo lunar simulado (Oregon State) · p3: la era de hielo que el calentamiento frenó (Columbia)
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'MENSAJE CON<br>GRAVEDAD', ts: 108, tag: 'FÍSICA<b>NUEVO ESTUDIO</b>', sub: 'ATRAVESÓ UNA PARED', spk: { n: ['#a8e0ff', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'PAPAS EN<br>LA LUNA', ts: 120, tag: 'ESPACIO<b>NUEVO ESTUDIO</b>', sub: 'SUELO LUNAR', spk: { n: ['#d8ffb0', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: '¿ERA DE<br>HIELO?', ts: 125, tag: 'PLANETA<b>NUEVO ESTUDIO</b>', sub: 'YA HABÍA EMPEZADO', spk: { n: ['#c8ecff', '', 0], q: ['#ffd95a', '', 0] } },
}[P];
init({ tag: '', title: CFG.title, titleSize: CFG.ts, spk: CFG.spk });
document.getElementById('tag').innerHTML = CFG.tag;
document.querySelector('#title .p i').textContent = CFG.sub;
rig.visible = false;
document.getElementById('sub').style.top = '1400px'; document.getElementById('who').style.top = '1340px';
// ------------------------------------------------------------------ data panel (canvas texture on a plane)
const scr = document.createElement('canvas'); scr.width = 720; scr.height = 720; const sg = scr.getContext('2d');
const scrT = new THREE.CanvasTexture(scr); scrT.colorSpace = THREE.SRGBColorSpace; scrT.anisotropy = 8;
let PANEL = null;
function makePanel(pos, ry, W, frameCol, glowCol) {
  const g = grp(scene); g.position.copy(pos); g.rotation.y = ry;
  box(g, W + .3, W + .3, .12, mat(0x10141c), 0, 0, -.08, 0);
  add(g, new THREE.PlaneGeometry(W, W), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false, fog: false }), 0, 0, .0);
  const fm = basic(frameCol, { fog: false }); const e = W / 2 + .1;
  for (const [w, h, x, y] of [[W + .3, .06, 0, e], [W + .3, .06, 0, -e], [.06, W + .3, -e, 0], [.06, W + .3, e, 0]]) box(g, w, h, .06, fm, x, y, .01, 0);
  const gl = glowSprite(g, glowCol, W * 2.1, 0, 0, -.3); gl.material.opacity = .28;
  PANEL = { g, W, gl, n: V(Math.sin(ry), 0, Math.cos(ry)), c: pos.clone() }; return PANEL;
}
// camera key that frames the panel (panel sits in the upper part of the frame, above the subtitles)
function pv(t, d = 1.72, side = 0, fov = 60, dz = 0) {
  const { c, n, W } = PANEL; const r = V(n.z, 0, -n.x);
  const e = c.clone().addScaledVector(n, W * d + dz).addScaledVector(r, side); e.y -= W * .3;
  const tg = c.clone(); tg.y -= W * .3; return [t, [e.x, e.y, e.z], [tg.x, tg.y, tg.z], fov];
}
// ---- 2D drawing helpers
const F = (s, w = 900) => `${w} ${s}px Inter, sans-serif`;
function txt(s, x, y, size, col, o = {}) { sg.save(); sg.font = F(size, o.w || 900); sg.textAlign = o.a || 'center'; sg.textBaseline = 'middle'; if (o.glow) { sg.shadowColor = o.glow; sg.shadowBlur = o.blur || 30 } sg.fillStyle = col; sg.fillText(s, x, y); sg.restore() }
function bgS(t, c1, c2, grid = 'rgba(255,255,255,.07)') { const gr = sg.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, c1); gr.addColorStop(1, c2); sg.fillStyle = gr; sg.fillRect(0, 0, 720, 720);
  sg.strokeStyle = grid; sg.lineWidth = 2; for (let i = 0; i <= 12; i++) { sg.beginPath(); sg.moveTo(i * 60, 0); sg.lineTo(i * 60, 720); sg.stroke(); sg.beginPath(); sg.moveTo(0, i * 60); sg.lineTo(720, i * 60); sg.stroke() } }
function scanlines(a = .1) { sg.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < 720; y += 4) sg.fillRect(0, y, 720, 2) }
function pill(s, x, y, col, tc = '#fff', size = 40) { sg.font = F(size); const w = sg.measureText(s).width + 50; sg.fillStyle = col; sg.beginPath(); sg.roundRect(x - w / 2, y - size * .75, w, size * 1.5, 16); sg.fill(); txt(s, x, y + 2, size, tc) }
function bar(x, y, w, h, k, col) { sg.fillStyle = 'rgba(255,255,255,.13)'; sg.beginPath(); sg.roundRect(x, y, w, h, h / 2); sg.fill(); sg.fillStyle = col; sg.shadowColor = col; sg.shadowBlur = 20; sg.beginPath(); sg.roundRect(x, y, Math.max(h, w * cl(k)), h, h / 2); sg.fill(); sg.shadowBlur = 0 }
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function stampMark(s, x, y, k, col = '#ff2a3a', rot = -.14, size = 60) { if (k <= 0) return; sg.save(); sg.translate(x, y); sg.rotate(rot); const sc = 1 + (1 - ss(cl(k * 3))) * 1.2; sg.scale(sc, sc); sg.globalAlpha = cl(k * 4); sg.strokeStyle = col; sg.lineWidth = 9; sg.font = F(size); const w = sg.measureText(s).width + 44; sg.strokeRect(-w / 2, -size * .78, w, size * 1.56); txt(s, 0, 4, size, col); sg.restore() }
function frameEdge(col) { sg.strokeStyle = col; sg.lineWidth = 8; sg.strokeRect(14, 14, 692, 692) }
function corners(col) { sg.strokeStyle = col; sg.lineWidth = 6; for (const [x, y, a, b] of [[30, 30, 1, 1], [690, 30, -1, 1], [30, 690, 1, -1], [690, 690, -1, -1]]) { sg.beginPath(); sg.moveTo(x, y + 60 * b); sg.lineTo(x, y); sg.lineTo(x + 60 * a, y); sg.stroke() } }
const radT = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64) });

let frame;
function skyDome(top, mid, bot, r = 150) {
  const t = tex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(.62, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h) }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, 2 * PI, 0, PI * .6), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false })); scene.add(s);
  const uv = s.geometry.attributes.uv, pos = s.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setY(i, cl(pos.getY(i) / r * 1.4 + .02)); uv.needsUpdate = true; return s;
}
function starField(N, r, minY = .05, size = 1.0, band = 0) {
  const p = new Float32Array(N * 3), c = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const th = hash(i * 1.3) * 2 * PI; let y = minY + hash(i * 2.7) * (1 - minY); if (band && i < N * band) { y = cl(.25 + (hash(i * 5.1) - .5) * .25 + Math.sin(th * 1.0) * .5, minY, 1) }
    const rr = Math.sqrt(1 - y * y); p[i * 3] = Math.cos(th) * rr * r; p[i * 3 + 1] = y * r; p[i * 3 + 2] = Math.sin(th) * rr * r; const w = .5 + hash(i * 9) * .5; c[i * 3] = w * (.85 + hash(i) * .15); c[i * 3 + 1] = w * .92; c[i * 3 + 2] = w }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  const m = new THREE.PointsMaterial({ size, map: radT, vertexColors: true, transparent: true, depthWrite: false, fog: false }); const pts = new THREE.Points(g, m); scene.add(pts); return pts;
}
const flashW = (t, ms, a = .3) => ms.reduce((acc, m) => Math.max(acc, win(t, m - .02, m + .16, .02, .14) * a), 0);
function cross(x, y, s, col = '#ff2a3a', k = 1) { if (k <= 0) return; sg.strokeStyle = col; sg.lineWidth = 12; sg.lineCap = 'round'; const d = s * ss(cl(k)); sg.beginPath(); sg.moveTo(x - s, y - s); sg.lineTo(x - s + 2 * d, y - s + 2 * d); sg.stroke(); if (k > .5) { const d2 = s * ss(cl((k - .5) * 2)); sg.beginPath(); sg.moveTo(x + s, y - s); sg.lineTo(x + s - 2 * d2, y - s + 2 * d2); sg.stroke() } sg.lineCap = 'butt' }
function bolt(x, y, s, col) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.shadowColor = col; sg.shadowBlur = 30; sg.beginPath(); sg.moveTo(10, -60); sg.lineTo(-30, 8); sg.lineTo(-2, 8); sg.lineTo(-12, 60); sg.lineTo(30, -10); sg.lineTo(2, -10); sg.closePath(); sg.fill(); sg.restore() }
// camera sequence: for each mark → panel shot (optionally a short 3D cutaway first)
function autoK(head, marks, cuts, tail) {
  const K = [...head]; marks.forEach((m, i) => { const nx = i < marks.length - 1 ? marks[i + 1] : M.endcard, c = cuts[i], sd = i % 2 ? .35 : -.35;
    if (c) { K.push([m + .05, c[0][0], c[0][1], c[0][2]], [m + c[2], c[1][0], c[1][1], c[1][2]], pv(m + c[2] + .25, 1.85, sd, 60)) } else K.push(pv(m + .05, 1.88, sd, 60));
    K.push(pv(nx - .3, 1.72, 0, 60)) }); return path([...K, ...tail]);
}
function star(x, y, r, col, n = 5) { sg.fillStyle = col; sg.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * PI / n - PI / 2, rr = i % 2 ? r * .45 : r; sg.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) } sg.closePath(); sg.fill() }
function burst(x, y, r, col, t) { sg.save(); sg.translate(x, y); sg.strokeStyle = col; sg.lineCap = 'round'; for (let i = 0; i < 16; i++) { const a = i * PI / 8 + t * .2, l = r * (.6 + .4 * Math.abs(Math.sin(t * 3 + i))); sg.lineWidth = i % 2 ? 6 : 10; sg.beginPath(); sg.moveTo(Math.cos(a) * r * .35, Math.sin(a) * r * .35); sg.lineTo(Math.cos(a) * l, Math.sin(a) * l); sg.stroke() } sg.restore() }
const galT = tex(512, 512, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); g.translate(256, 256); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 90); gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(1, 'rgba(255,200,150,0)'); g.fillStyle = gr; g.fillRect(-256, -256, 512, 512);
  for (let i = 0; i < 9000; i++) { const arm = i % 2, k = Math.random(), a = k * 4.2 + arm * PI + (Math.random() - .5) * .5, r = 30 + k * 200; const x = Math.cos(a) * r, y = Math.sin(a) * r * .55; g.fillStyle = `rgba(${170 + Math.random() * 80 | 0},${180 + Math.random() * 60 | 0},255,${.15 + Math.random() * .35})`; g.fillRect(x, y, 2, 2) } });
galT.wrapS = galT.wrapT = THREE.ClampToEdgeWrapping;
function galaxy2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.rotate(t * .05); sg.scale(s, s); const gr = sg.createRadialGradient(0, 0, 0, 0, 0, 40); gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(1, 'rgba(255,200,150,0)'); sg.fillStyle = gr; sg.fillRect(-60, -60, 120, 120);
  for (let i = 0; i < 700; i++) { const arm = i % 2, k = hash(i * 1.7), a = k * 4.2 + arm * PI + (hash(i * 3.3) - .5) * .5, r = 14 + k * 110; sg.fillStyle = `rgba(190,200,255,${.25 + hash(i) * .5})`; sg.fillRect(Math.cos(a) * r, Math.sin(a) * r * .55, 3, 3) } sg.restore() }

function rockGeo(seed, det = 2) { const g = new THREE.IcosahedronGeometry(1, det); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)); const k = 1 + .22 * Math.sin(v.x * 3.1 + seed) + .16 * Math.sin(v.y * 4.3 - seed * 2) + .1 * Math.sin(v.z * 6.7 + seed * 3); p.setXYZ(i, v.x * k, v.y * k * .85, v.z * k) } g.computeVertexNormals(); return g }
function personIcon(x, y, h, col) { sg.fillStyle = col; const s = h / 200; sg.beginPath(); sg.arc(x, y - 170 * s, 24 * s, 0, 7); sg.fill(); sg.beginPath(); sg.roundRect(x - 32 * s, y - 140 * s, 64 * s, 80 * s, 14 * s); sg.fill(); sg.fillRect(x - 28 * s, y - 70 * s, 22 * s, 70 * s); sg.fillRect(x + 6 * s, y - 70 * s, 22 * s, 70 * s) }
function rock2D(x, y, r, col = '#9a8a7a') { sg.save(); sg.translate(x, y); sg.fillStyle = col; sg.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * 2 * PI, rr = r * (1 + .14 * Math.sin(a * 3 + 1) + .08 * Math.sin(a * 7)); sg.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .85) } sg.closePath(); sg.fill(); sg.fillStyle = 'rgba(0,0,0,.25)'; for (const [a, b, c] of [[-.3, -.2, .18], [.35, .2, .14], [.0, .35, .1]]) { sg.beginPath(); sg.arc(a * r, b * r, c * r, 0, 7); sg.fill() } sg.restore() }
function circ(x, y, r, col, glow) { sg.save(); if (glow) { sg.shadowColor = glow; sg.shadowBlur = r * .8 } sg.fillStyle = col; sg.beginPath(); sg.arc(x, y, r, 0, 7); sg.fill(); sg.restore() }
function check(x, y, s, col, k = 1) { if (k <= 0) return; sg.strokeStyle = col; sg.lineWidth = 12; sg.lineCap = 'round'; sg.beginPath(); sg.moveTo(x - s, y); sg.lineTo(x - s * .3, y + s * .7 * cl(k * 2)); if (k > .5) sg.lineTo(x - s * .3 + s * 1.3 * (k - .5) * 2, y + s * .7 - s * 1.5 * (k - .5) * 2); sg.stroke(); sg.lineCap = 'butt' }
const near = (p, o, fov) => [[p[0] + o[0], p[1] + o[1], p[2] + o[2]], p, fov];
function arrow(x1, y1, x2, y2, col, k = 1, w = 8) { if (k <= 0) return; const x = lerp(x1, x2, k), y = lerp(y1, y2, k); sg.strokeStyle = col; sg.fillStyle = col; sg.lineWidth = w; sg.lineCap = 'round'; sg.beginPath(); sg.moveTo(x1, y1); sg.lineTo(x, y); sg.stroke(); const a = Math.atan2(y2 - y1, x2 - x1); sg.beginPath(); sg.moveTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); sg.lineTo(x + Math.cos(a + 2.5) * 22, y + Math.sin(a + 2.5) * 22); sg.lineTo(x + Math.cos(a - 2.5) * 22, y + Math.sin(a - 2.5) * 22); sg.fill(); sg.lineCap = 'butt' }
function probe2D(x, y, s, t = 0) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.rotate(Math.sin(t * .5) * .05);
  sg.strokeStyle = '#c8d0dc'; sg.lineWidth = 5; sg.beginPath(); sg.moveTo(0, 30); sg.lineTo(-150, 90); sg.moveTo(0, 30); sg.lineTo(140, 60); sg.moveTo(0, 10); sg.lineTo(30, -150); sg.stroke();
  sg.fillStyle = '#8a8070'; sg.fillRect(-170, 80, 40, 24); sg.fillStyle = '#d8b060'; sg.fillRect(-36, 10, 72, 40);
  const gr = sg.createLinearGradient(-90, -40, 90, 0); gr.addColorStop(0, '#f4f6fa'); gr.addColorStop(1, '#9aa4b4'); sg.fillStyle = gr; sg.beginPath(); sg.ellipse(0, -10, 100, 34, 0, PI, 0); sg.lineTo(100, -10); sg.quadraticCurveTo(0, 30, -100, -10); sg.fill();
  sg.strokeStyle = '#fff'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(0, -10); sg.lineTo(0, -60); sg.stroke(); circ(0, -62, 6, '#fff'); sg.restore() }
function tort2D(x, y, s, t = 0, col = '#7a6a3a') { sg.save(); sg.translate(x, y); sg.scale(s, s); const sk = '#8a8a6a';
  sg.fillStyle = sk; for (const [lx, ly] of [[-70, 40], [70, 40], [-40, 50], [40, 50]]) { sg.beginPath(); sg.roundRect(lx - 16, ly - 10, 32, 46, 12); sg.fill() }
  const hx = 120 + Math.sin(t * 1.2) * 6; sg.beginPath(); sg.ellipse(hx - 30, -6, 40, 18, -.2, 0, 7); sg.fill(); sg.beginPath(); sg.ellipse(hx, -18, 30, 22, 0, 0, 7); sg.fill(); circ(hx + 10, -26, 5, '#111');
  sg.fillStyle = col; sg.beginPath(); sg.ellipse(0, 10, 110, 80, 0, PI, 0); sg.lineTo(110, 26); sg.lineTo(-110, 26); sg.closePath(); sg.fill();
  sg.strokeStyle = 'rgba(40,30,10,.7)'; sg.lineWidth = 4; for (const [cx, cy] of [[0, -40], [-55, -20], [55, -20], [-30, 10], [30, 10], [-80, 12], [80, 12]]) { sg.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3; sg.lineTo(cx + Math.cos(a) * 24, cy + Math.sin(a) * 18) } sg.closePath(); sg.stroke() }
  sg.fillStyle = '#5a4a2a'; sg.fillRect(-112, 20, 224, 10); sg.restore() }
function skull2D(x, y, s, col = '#e8d8b0', t = 0) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.shadowColor = 'rgba(255,200,120,.6)'; sg.shadowBlur = 30;
  sg.beginPath(); sg.ellipse(-10, -40, 100, 90, 0, 0, 7); sg.fill(); sg.beginPath(); sg.moveTo(30, -10); sg.quadraticCurveTo(110, 0, 96, 60); sg.lineTo(40, 80); sg.lineTo(-30, 70); sg.lineTo(-50, 20); sg.fill(); sg.shadowBlur = 0;
  sg.fillStyle = '#4a3a22'; sg.beginPath(); sg.ellipse(50, -10, 22, 18, 0, 0, 7); sg.fill(); sg.beginPath(); sg.ellipse(88, 20, 7, 11, 0, 0, 7); sg.fill();
  sg.fillStyle = '#fff8e0'; for (let i = 0; i < 6; i++) sg.fillRect(36 + i * 10, 60, 7, 12); sg.strokeStyle = 'rgba(90,70,40,.5)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(-80, -70); sg.quadraticCurveTo(-30, -60, -20, -110); sg.stroke(); sg.restore() }
function disc2D(x, y, r, t) { const gr = sg.createRadialGradient(x - r * .3, y - r * .3, 10, x, y, r); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(.6, '#e0a830'); gr.addColorStop(1, '#8a5a10'); circ(x, y, r, '#c89020', '#ffc040'); sg.fillStyle = gr; sg.beginPath(); sg.arc(x, y, r, 0, 7); sg.fill();
  sg.strokeStyle = 'rgba(90,50,0,.35)'; sg.lineWidth = 2; for (let rr = r * .3; rr < r * .96; rr += 7) { sg.beginPath(); sg.arc(x, y, rr, 0, 7); sg.stroke() } circ(x, y, r * .22, '#6a4a10'); const a = t * 1.5; sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 10; sg.beginPath(); sg.arc(x, y, r * .7, a, a + .5); sg.stroke() }
function helix(x0, x1, y, amp, t, c1, c2, n = 30) { for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)), a = Math.sin(i * .5 + t * 3) * amp; if (i % 2 == 0) { sg.strokeStyle = 'rgba(255,255,255,.25)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(x, y + a); sg.lineTo(x, y - a); sg.stroke() } circ(x, y + a, 8, c1); circ(x, y - a, 8, c2) } }
function spider2D(x, y, s, t = 0, col = '#5a3a22') { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = col; sg.lineCap = 'round'; sg.lineWidth = 9;
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const a = (-.7 + i * .45) + Math.sin(t * 6 + i) * .05; sg.beginPath(); sg.moveTo(sx * 20, 0); const kx = sx * (70 + i * 6), ky = -40 + i * 26; sg.lineTo(kx * Math.cos(a * .2), ky - 30); sg.lineTo(sx * (110 + i * 4), ky + 40 + i * 8); sg.stroke() }
  sg.fillStyle = col; sg.beginPath(); sg.ellipse(0, 50, 46, 58, 0, 0, 7); sg.fill(); sg.fillStyle = '#7a5434'; sg.beginPath(); sg.ellipse(0, -18, 36, 32, 0, 0, 7); sg.fill();
  sg.fillStyle = '#fff'; for (const ex of [-12, -4, 4, 12]) { sg.beginPath(); sg.arc(ex, -36, 4, 0, 7); sg.fill() } sg.lineCap = 'butt'; sg.restore() }
function brick2D(x, y, s, kind, col, rot = 0) { sg.save(); sg.translate(x, y); sg.rotate(rot); sg.scale(s, s); sg.fillStyle = col; sg.strokeStyle = 'rgba(0,0,0,.35)'; sg.lineWidth = 4;
  const R_ = kind == 'x' ? [[-20, -60, 40, 120], [-60, -20, 120, 40]] : [[-60, -60, 34, 120], [26, -60, 34, 120], [-26, -16, 52, 32]];
  sg.beginPath(); for (const [a, b, c, d] of R_) sg.rect(a, b, c, d); sg.fill(); for (const [a, b, c, d] of R_) sg.strokeRect(a, b, c, d);
  sg.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 14; i++) { sg.beginPath(); sg.arc((hash(i * 3 + s) - .5) * 80, (hash(i * 7 + s) - .5) * 80, 3, 0, 7); sg.fill() } sg.restore() }
function snowflake(x, y, r, col, t = 0) { sg.save(); sg.translate(x, y); sg.rotate(t * .3); sg.strokeStyle = col; sg.lineWidth = Math.max(3, r * .08); sg.lineCap = 'round'; for (let i = 0; i < 6; i++) { sg.rotate(PI / 3); sg.beginPath(); sg.moveTo(0, 0); sg.lineTo(0, -r); sg.moveTo(0, -r * .55); sg.lineTo(-r * .22, -r * .75); sg.moveTo(0, -r * .55); sg.lineTo(r * .22, -r * .75); sg.stroke() } sg.restore() }
function thermo(x, y, h, k, col) { sg.fillStyle = 'rgba(255,255,255,.18)'; sg.beginPath(); sg.roundRect(x - 18, y - h, 36, h, 18); sg.fill(); circ(x, y + 10, 34, col, col); sg.fillStyle = col; sg.beginPath(); sg.roundRect(x - 10, y - h * cl(k), 20, h * cl(k) + 10, 10); sg.fill() }
function plant2D(x, y, s, col = '#6a8a3a') { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = col; sg.lineCap = 'round'; sg.lineWidth = 6; for (let i = -3; i <= 3; i++) { sg.beginPath(); sg.moveTo(0, 0); sg.quadraticCurveTo(i * 10, -40, i * 22, -70 + Math.abs(i) * 8); sg.stroke() } sg.fillStyle = '#5a4020'; sg.beginPath(); sg.ellipse(0, 4, 30, 10, 0, 0, 7); sg.fill(); sg.restore() }
function mapCanada(k, col) { sg.save(); sg.fillStyle = col; sg.beginPath(); const pts = [[120, 260], [190, 200], [300, 190], [380, 150], [470, 170], [560, 150], [620, 220], [600, 300], [530, 340], [470, 400], [400, 430], [320, 440], [240, 420], [170, 380], [120, 330]]; pts.forEach(([x, y], i) => { const cx = 370, cy = 300; const xx = cx + (x - cx) * k, yy = cy + (y - cy) * k; i ? sg.lineTo(xx, yy) : sg.moveTo(xx, yy) }); sg.closePath(); sg.fill(); sg.restore() }
// ---- helpers for today
function redGiant2D(x, y, r, t, hot = 0) { const gr = sg.createRadialGradient(x - r * .2, y - r * .2, r * .1, x, y, r); gr.addColorStop(0, '#ffd080'); gr.addColorStop(.5, '#ff6a2a'); gr.addColorStop(1, '#a01a1a'); sg.save(); sg.shadowColor = '#ff3a1a'; sg.shadowBlur = r * .6; sg.fillStyle = gr; sg.beginPath(); sg.arc(x, y, r, 0, 7); sg.fill(); sg.restore();
  for (let i = 0; i < 9; i++) { const a = hash(i * 3.1) * 7, rr = r * .7 * Math.sqrt(hash(i * 1.7)); sg.fillStyle = `rgba(120,20,10,${.25 + hash(i) * .2})`; sg.beginPath(); sg.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * (.08 + hash(i * 5) * .1), 0, 7); sg.fill() }
  if (hot > 0) for (let i = 0; i < 4; i++) { const a = i * 1.7 + .4, rr = r * (.35 + .12 * i); circ(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * .07 * hot * (1 + .2 * Math.sin(t * 6 + i)), '#fff8d0', '#fff0a0') } }
function loop2D(x, y, r, h, k, col, w = 14) { if (k <= 0) return; sg.save(); sg.strokeStyle = col; sg.shadowColor = col; sg.shadowBlur = 30; sg.lineWidth = w; sg.lineCap = 'round'; sg.beginPath(); const N = 60; for (let i = 0; i <= N * k; i++) { const a = PI + i / N * PI; const xx = x + Math.cos(a) * r, yy = y + Math.sin(a) * h; i ? sg.lineTo(xx, yy) : sg.moveTo(xx, yy) } sg.stroke(); sg.restore() }
function saturn2D(x, y, r, t) { sg.save(); sg.translate(x, y); sg.rotate(-.3); sg.strokeStyle = 'rgba(230,210,160,.9)'; sg.lineWidth = r * .18; sg.beginPath(); sg.ellipse(0, 0, r * 2, r * .55, 0, PI, 2 * PI); sg.stroke(); circ(0, 0, r, '#e0c080'); sg.fillStyle = 'rgba(160,120,60,.4)'; sg.fillRect(-r, -r * .2, r * 2, r * .15); sg.beginPath(); sg.ellipse(0, 0, r * 2, r * .55, 0, 0, PI); sg.stroke(); sg.restore() }
function dish2D(x, y, s, col = '#e8eef8') { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.beginPath(); sg.ellipse(0, -40, 60, 22, -.5, 0, 7); sg.fill(); sg.fillStyle = '#9aa8bc'; sg.fillRect(-8, -30, 16, 70); sg.fillRect(-30, 36, 60, 10); sg.strokeStyle = col; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(0, -40); sg.lineTo(30, -90); sg.stroke(); sg.restore() }
// ---- helpers for today
function bricks2D(x, y, w, h, k = 1) { sg.save(); sg.beginPath(); sg.rect(x, y, w, h); sg.clip(); sg.fillStyle = '#5a2a1e'; sg.fillRect(x, y, w, h); const bw = 70, bh = 34;
  for (let r = 0; r * bh < h; r++) for (let c = -1; c * bw < w; c++) { const bx = x + c * bw + (r % 2 ? bw / 2 : 0), by = y + r * bh; sg.fillStyle = `rgb(${150 + hash(r * 13 + c) * 50 | 0},${60 + hash(r * 7 + c) * 25 | 0},${40 + hash(c * 3 + r) * 20 | 0})`; sg.fillRect(bx + 3, by + 3, bw - 6, bh - 6) } sg.restore() }
function gwave(x, y, r0, t, col, n = 4, sp = 1) { for (let i = 0; i < n; i++) { const w = (t * .6 * sp + i / n) % 1, r = r0 + w * 260; sg.strokeStyle = col; sg.globalAlpha = (1 - w) * .8; sg.lineWidth = 7; sg.beginPath(); sg.arc(x, y, r, -.9, .9); sg.stroke() } sg.globalAlpha = 1 }
function weight2D(x, y, s, col = '#c8ccd4') { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.shadowColor = '#ffb040'; sg.shadowBlur = 24; sg.beginPath(); sg.roundRect(-60, -40, 120, 80, 10); sg.fill(); sg.shadowBlur = 0; sg.fillStyle = '#6a707c'; for (let i = 0; i < 3; i++) sg.fillRect(-56, -26 + i * 24, 112, 6); sg.strokeStyle = '#9aa0a8'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(0, -40); sg.lineTo(0, -400); sg.stroke(); sg.restore() }
function gravi2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = '#2a3a4a'; sg.beginPath(); sg.roundRect(-60, -90, 120, 150, 14); sg.fill(); sg.fillStyle = '#0a1420'; sg.fillRect(-44, -72, 88, 50); sg.strokeStyle = '#5affd0'; sg.lineWidth = 3; sg.beginPath(); for (let i = 0; i <= 40; i++) { const xx = -40 + i * 2, yy = -47 + Math.sin(i * .5 + t * 6) * 10 * (i % 10 < 5 ? 1 : .3); i ? sg.lineTo(xx, yy) : sg.moveTo(xx, yy) } sg.stroke(); circ(0, 20, 20, '#5affd0', '#5affd0'); sg.fillStyle = '#1a2430'; sg.fillRect(-50, 60, 20, 30); sg.fillRect(30, 60, 20, 30); sg.restore() }
function clock2D(x, y, r, a, col = '#fff') { sg.strokeStyle = col; sg.lineWidth = 10; sg.beginPath(); sg.arc(x, y, r, 0, 7); sg.stroke(); for (let i = 0; i < 12; i++) { const b = i * PI / 6; sg.lineWidth = 5; sg.beginPath(); sg.moveTo(x + Math.cos(b) * r * .8, y + Math.sin(b) * r * .8); sg.lineTo(x + Math.cos(b) * r * .92, y + Math.sin(b) * r * .92); sg.stroke() } sg.lineCap = 'round'; sg.lineWidth = 10; sg.beginPath(); sg.moveTo(x, y); sg.lineTo(x + Math.sin(a) * r * .75, y - Math.cos(a) * r * .75); sg.stroke(); sg.lineWidth = 7; sg.beginPath(); sg.moveTo(x, y); sg.lineTo(x + Math.sin(a / 12) * r * .5, y - Math.cos(a / 12) * r * .5); sg.stroke(); sg.lineCap = 'butt'; circ(x, y, 10, col) }
function radio2D(x, y, s, col) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = col; sg.lineWidth = 8; sg.beginPath(); sg.moveTo(0, 60); sg.lineTo(0, -20); sg.stroke(); circ(0, -26, 10, col); for (let i = 1; i < 4; i++) { sg.beginPath(); sg.arc(0, -26, i * 26, -PI * .8, -PI * .2); sg.stroke() } sg.restore() }
function potato2D(x, y, s, rot = 0, col = '#c8a060') { sg.save(); sg.translate(x, y); sg.rotate(rot); sg.scale(s, s); const gr = sg.createRadialGradient(-20, -20, 10, 0, 0, 90); gr.addColorStop(0, '#e8c88a'); gr.addColorStop(1, col); sg.fillStyle = gr; sg.beginPath(); for (let i = 0; i < 30; i++) { const a = i / 30 * 2 * PI, r = 1 + .08 * Math.sin(a * 3 + 1) + .05 * Math.sin(a * 5); sg.lineTo(Math.cos(a) * 80 * r, Math.sin(a) * 56 * r) } sg.closePath(); sg.fill(); sg.fillStyle = 'rgba(110,70,30,.6)'; for (const [a, b] of [[-40, -14], [10, -26], [36, 10], [-14, 22], [52, -20]]) { sg.beginPath(); sg.ellipse(a, b, 5, 3, 0, 0, 7); sg.fill() } sg.restore() }
function sprout2D(x, y, h, col = '#5ac04a') { if (h <= 2) return; sg.strokeStyle = '#3a8a2a'; sg.lineWidth = Math.max(3, h * .05); sg.beginPath(); sg.moveTo(x, y); sg.lineTo(x, y - h); sg.stroke(); sg.fillStyle = col; for (let i = 0; i < 4; i++) { const yy = y - h * (.35 + i * .2), sx = i % 2 ? 1 : -1, l = h * .3 * (1 - i * .12); sg.beginPath(); sg.ellipse(x + sx * l * .6, yy, l * .6, l * .25, sx * -.5, 0, 7); sg.fill() } }
function worm2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = '#e08a8a'; sg.lineCap = 'round'; sg.lineWidth = 26; sg.beginPath(); for (let i = 0; i <= 20; i++) { const xx = -120 + i * 12, yy = Math.sin(i * .6 + t * 4) * 18; i ? sg.lineTo(xx, yy) : sg.moveTo(xx, yy) } sg.stroke(); sg.strokeStyle = 'rgba(150,60,60,.5)'; sg.lineWidth = 3; for (let i = 2; i < 20; i += 2) { const xx = -120 + i * 12, yy = Math.sin(i * .6 + t * 4) * 18; sg.beginPath(); sg.moveTo(xx, yy - 12); sg.lineTo(xx, yy + 12); sg.stroke() } circ(124, Math.sin(20 * .6 + t * 4) * 18 - 4, 3, '#111'); sg.lineCap = 'butt'; sg.restore() }
function jar2D(x, y, s, col, fill = 1) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.beginPath(); sg.roundRect(-40, 60 - 100 * fill, 80, 100 * fill, 10); sg.fill(); sg.strokeStyle = 'rgba(220,240,255,.8)'; sg.lineWidth = 5; sg.beginPath(); sg.roundRect(-44, -50, 88, 114, 14); sg.stroke(); sg.fillStyle = '#8a9aa8'; sg.fillRect(-36, -62, 72, 14); sg.restore() }
function moon2D(x, y, r, col = '#c8c8c0') { circ(x, y, r, col, 'rgba(255,255,255,.4)'); sg.fillStyle = 'rgba(80,80,80,.35)'; for (let i = 0; i < 9; i++) { const a = hash(i * 3) * 7, rr = r * .75 * Math.sqrt(hash(i * 5)); sg.beginPath(); sg.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, r * (.06 + hash(i * 7) * .12), 0, 7); sg.fill() } }
function earth2D(x, y, r) { circ(x, y, r, '#2a6ac8', '#4a9aff'); sg.fillStyle = '#4a9a4a'; for (const [a, b, c] of [[-.3, -.2, .35], [.35, .25, .28], [.1, -.5, .2]]) { sg.beginPath(); sg.ellipse(x + a * r, y + b * r, c * r, c * r * .6, a, 0, 7); sg.fill() } sg.fillStyle = 'rgba(255,255,255,.55)'; sg.beginPath(); sg.ellipse(x + .1 * r, y + .5 * r, .5 * r, .1 * r, 0, 0, 7); sg.fill() }
function iceMap2D(k, t) { // simplified North America outline, ice sheet extent k (0..1)
  sg.fillStyle = '#3a6a3a'; sg.beginPath(); [[120, 180], [230, 120], [380, 110], [520, 150], [600, 220], [580, 300], [520, 360], [470, 460], [420, 560], [360, 640], [300, 600], [260, 500], [180, 420], [130, 330], [100, 250]].forEach(([a, b], i) => i ? sg.lineTo(a, b) : sg.moveTo(a, b)); sg.closePath(); sg.fill();
  if (k > 0) { sg.save(); sg.globalAlpha = .92; sg.fillStyle = '#eaf6ff'; sg.shadowColor = '#bfe6ff'; sg.shadowBlur = 30; sg.beginPath(); sg.ellipse(400, 210, 230 * k, 170 * k, -.1, 0, 7); sg.fill(); sg.restore() } }
function graph2D(t, k, cut, x0 = 70, y0 = 520, w = 580, h = 300) { sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(x0, y0 - h); sg.lineTo(x0, y0); sg.lineTo(x0 + w, y0); sg.stroke();
  const f = u => u < .45 ? .8 - u / .45 * .55 : u < .62 ? .25 + (u - .45) * .2 : u < .93 ? .28 + (u - .62) * 1.2 : .65 - (u - .93) / .07 * .45 * cut;
  const seg = (u0, u1, col) => { if (u1 <= u0) return; sg.strokeStyle = col; sg.shadowColor = col; sg.shadowBlur = 16; sg.lineWidth = 9; sg.lineCap = 'round'; sg.beginPath(); for (let u = u0; u <= u1 + 1e-6; u += .01) { const xx = x0 + u * w, yy = y0 - f(Math.min(u, u1)) * h; u == u0 ? sg.moveTo(xx, yy) : sg.lineTo(xx, yy) } sg.stroke(); sg.shadowBlur = 0; sg.lineCap = 'butt' };
  seg(0, Math.min(k, .93), '#bfe6ff'); if (cut > 0 && k > .93) seg(.93, k, '#ff6a4a');
  return u => [x0 + u * w, y0 - f(u) * h] }
// ==================================================================================== PART 1 — EL MENSAJE CON GRAVEDAD (campus al anochecer, cian y naranja)
if (P == 1) {
  skyDome('#0a1238', '#4a3a7a', '#e88a5a'); scene.background = new THREE.Color(0x2a2a5a); scene.fog = new THREE.Fog(0x4a3a6a, 40, 150);
  hemi.color.setHex(0xc8d0ff); hemi.groundColor.setHex(0x3a2a2a); hemi.intensity = 1.2; R.toneMappingExposure = 1.15;
  const moonL = new THREE.DirectionalLight(0xffc8a0, 1.6); moonL.position.set(30, 20, 20); moonL.castShadow = true; moonL.shadow.mapSize.set(1024, 1024); Object.assign(moonL.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 }); scene.add(moonL);
  const gT = tex(256, 256, (g, w, h) => { g.fillStyle = '#3a4a3a'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .25, '20,30,20') }, 20, 20);
  const GR = add(scene, new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ map: gT }), 0, 0, 0, 2); GR.rotation.x = -PI / 2;
  const walkT = tex(64, 64, (g, w, h) => { g.fillStyle = '#8a8478'; g.fillRect(0, 0, w, h); speck(g, w, h, 300, .2) }, 4, 30); const WK = add(scene, new THREE.PlaneGeometry(6, 80), new THREE.MeshLambertMaterial({ map: walkT }), 2, .02, 0, 2); WK.rotation.x = -PI / 2;
  // building with lit windows (brick facade)
  const facT = tex(512, 512, (g, w, h) => { g.fillStyle = '#7a3a2a'; g.fillRect(0, 0, w, h); for (let r = 0; r < 64; r++) for (let c = 0; c < 16; c++) { g.fillStyle = `rgb(${120 + Math.random() * 40 | 0},${50 + Math.random() * 20 | 0},${35 + Math.random() * 15 | 0})`; g.fillRect(c * 32 + (r % 2) * 16, r * 8, 30, 6) }
    for (let fy = 0; fy < 5; fy++) for (let fx = 0; fx < 6; fx++) { const on = Math.random() < .6; g.fillStyle = on ? '#ffd890' : '#1a2030'; g.fillRect(30 + fx * 80, 40 + fy * 95, 50, 60); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(30 + fx * 80 + 24, 40 + fy * 95, 3, 60) } });
  const BLD = box(scene, 18, 15, 8, new THREE.MeshLambertMaterial({ map: facT, emissive: 0x332211, emissiveMap: facT, emissiveIntensity: .9 }), 0, 7.5, -18, 3);
  box(scene, 18.6, .6, 8.6, mat(0x4a3a34), 0, 15.2, -18, 1);
  // elevator shaft (glass) + counterweight
  const SX = -6.5, SZ = -13.2; for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(scene, .14, 15.5, .14, mat(0x9aa4b4), SX + dx * 1.2, 7.75, SZ + dz * 1.0, 1);
  for (let y = 0; y <= 15; y += 3) box(scene, 2.5, .1, 2.1, mat(0x9aa4b4), SX, y + .05, SZ, 0);
  add(scene, new THREE.BoxGeometry(2.4, 15.4, 2.0), new THREE.MeshLambertMaterial({ color: 0x8ad8ff, transparent: true, opacity: .14, depthWrite: false }), SX, 7.7, SZ, 0);
  const CW = box(scene, 1.6, 1.4, 1.2, new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: .7, roughness: .35, emissive: 0x402000, emissiveIntensity: .4 }), SX, 4, SZ, 1);
  const CWG = glowSprite(scene, 0xffa040, 5, SX, 4, SZ + 1.2); CWG.material.opacity = .5;
  const CAB = add(scene, G.cyl, mat(0x4a4a4a), SX, 10, SZ, 0); CAB.scale.set(.04, 1, .04);
  // free-standing brick wall + gravimeter on the other side
  const brT = tex(256, 128, (g, w, h) => { g.fillStyle = '#4a2a20'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = -1; c < 8; c++) { g.fillStyle = `rgb(${140 + Math.random() * 50 | 0},${55 + Math.random() * 25 | 0},${38 + Math.random() * 18 | 0})`; g.fillRect(c * 34 + (r % 2) * 17 + 2, r * 16 + 2, 30, 12) } }, 2, 2);
  const WALL = box(scene, 7, 4.2, .5, new THREE.MeshLambertMaterial({ map: brT }), 1.5, 2.1, -6.5, 3); WALL.rotation.y = .6;
  const GV = grp(scene); GV.position.set(4.6, 0, -3.8); box(GV, .8, 1.0, .6, mat(0x2a3a4a), 0, .5, 0, 1); const GVL = add(GV, new THREE.PlaneGeometry(.6, .35), basic(0x5affd0), 0, .75, .31); const GVG = glowSprite(GV, 0x5affd0, 2.2, 0, .8, .4);
  // gravity rings emitted by the counterweight
  const RINGS = []; for (let i = 0; i < 5; i++) { const r = add(scene, new THREE.TorusGeometry(1, .05, 8, 48), new THREE.MeshBasicMaterial({ color: 0x8ad8ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), SX, 4, SZ, 0); r.rotation.y = .9; RINGS.push(r) }
  const STARS = starField(900, 140, .35, 1.0, 0);
  makePanel(V(0, 6.2, -1), 0, 4.2, 0xa8e0ff, 0x3ab0ff);
  const BITS = '01000111';
  function draw(t) {
    const gold = '#ffd95a', cy = '#a8e0ff', or = '#ffa040';
    if (t < M.who) { bgS(t, '#06122a', '#0e2244', 'rgba(168,224,255,.07)'); txt('UN MENSAJE', 360, 70, 70, cy); txt('A TRAVÉS DE LA PARED', 360, 136, 44, '#fff'); bricks2D(330, 220, 70, 360); gwave(160, 400, 30, t, cy, 5, 1.4); weight2D(140, 400, .7);
      gravi2D(560, 420, .9, t); stampMark('CON GRAVEDAD', 360, 650, ramp(t, 2.4, 3.0), gold, -.05, 50) }
    else if (t < M.lift) { bgS(t, '#081228', '#10224a', 'rgba(168,224,255,.07)'); txt('QUEENSLAND', 360, 76, 74, '#fff', { glow: '#3ab0ff', blur: 30 }); pill('AUSTRALIA', 360, 160, '#1a3a6a', '#fff', 36);
      const k = sr(t, M.who + 2.6, M.who + 3.4); radio2D(220, 380, 1.3, '#8aa0b8'); cross(220, 360, 80, '#ff3a4a', k); circ(500, 380, 90, '#0e2a4a', '#3ab0ff'); txt('G', 500, 384, 110, cy, { glow: '#3ab0ff' });
      sg.globalAlpha = sr(t, Ln.g1.end - 1.4, Ln.g1.end - .8); pill('USARON GRAVEDAD', 360, 620, '#2a5a8a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.bits) { bgS(t, '#14100a', '#2a1e10', 'rgba(255,200,140,.07)'); txt('UN ASCENSOR', 360, 66, 66, '#ffd8a0'); pill('AÑOS 50', 580, 150, '#5a3a14', '#fff', 34); sg.strokeStyle = '#6a7080'; sg.lineWidth = 6; sg.strokeRect(120, 130, 160, 520);
      const y = 260 + 280 * (.5 + .5 * Math.sin(t * 1.4)); weight2D(200, y, .9); const k = ss(ramp(t, M.lift + 4.6, M.lift + 6.4)); txt((1.8 * k).toFixed(1).replace('.', ','), 500, 380, 120, '#fff', { glow: or }); txt('TONELADAS', 500, 470, 40, gold); txt('CONTRAPESO', 500, 530, 32, '#ffd8a0', { w: 700 }) }
    else if (t < M.wall) { bgS(t, '#04140e', '#082a1e', 'rgba(90,255,208,.07)'); txt('CERO O UNO', 360, 80, 84, '#5affd0', { glow: '#2aff9a' }); const n = Math.floor(ramp(t, M.bits + 1.0, Ln.g3.end) * 8.99);
      for (let i = 0; i < 8; i++) { const x = 95 + i * 76, on = i < n, b = BITS[i]; sg.fillStyle = on ? (b == '1' ? '#5affd0' : '#1e4a3a') : 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(x - 32, 230, 64, 90, 12); sg.fill(); if (on) txt(b, x, 278, 60, b == '1' ? '#04140e' : '#5affd0') }
      const cur = BITS[Math.max(0, n - 1)]; sg.strokeStyle = '#6a7080'; sg.lineWidth = 6; sg.strokeRect(300, 380, 120, 260); weight2D(360, cur == '1' ? 430 : 590, .6); txt('ARRIBA = 1', 560, 450, 32, '#fff', { w: 700 }); txt('ABAJO = 0', 560, 590, 32, '#fff', { w: 700 }); txt('= "G"', 160, 520, 60, gold) }
    else if (t < M.why) { bgS(t, '#06122a', '#0e2244', 'rgba(168,224,255,.07)'); txt('GRAVÍMETRO', 360, 70, 70, cy); bricks2D(300, 160, 70, 380); gwave(150, 350, 30, t, cy, 5, 1.2); weight2D(130, 350, .6); gravi2D(560, 360, 1.1, t);
      const word = 'GRAVITY', n = Math.floor(ramp(t, Ln.g4.end - 2.6, Ln.g4.end - .6) * 7.99); sg.fillStyle = 'rgba(0,0,0,.45)'; sg.beginPath(); sg.roundRect(110, 580, 500, 100, 20); sg.fill(); txt(word.slice(0, n) + (n < 7 && (t * 3 % 1) < .5 ? '_' : ''), 360, 632, 72, '#5affd0', { glow: '#2aff9a' }) }
    else if (t < M.slow) { bgS(t, '#0a1628', '#142a48', 'rgba(168,224,255,.07)'); txt('¿SE PUEDE BLOQUEAR?', 360, 70, 50, cy); const k = sr(t, M.why + .6, M.why + 1.6); for (let i = 0; i < 3; i++) bricks2D(180 + i * 130, 200, 60, 340);
      sg.globalAlpha = k; gwave(100, 370, 20, t, '#8ad8ff', 6, 1.4); sg.globalAlpha = 1; circ(640, 370, 26, '#5affd0', '#5affd0'); stampMark('NO SE PUEDE', 360, 630, ramp(t, Ln.g5.end - 1.0, Ln.g5.end - .4), '#5affd0', -.05, 60) }
    else if (t < M.pub) { bgS(t, '#1a0a0a', '#300e0e', 'rgba(255,160,140,.07)'); txt('LENTÍSIMO', 360, 70, 80, '#ffb0a0', { glow: '#ff4a3a' }); clock2D(360, 320, 150, t * 2.6); pill('1 BIT POR MINUTO', 360, 540, '#5a1a1a', '#fff', 40);
      sg.globalAlpha = sr(t, Ln.g6.end - 2.2, Ln.g6.end - 1.6); txt('1 PALABRA = 1 HORA', 360, 640, 46, gold); sg.globalAlpha = 1 }
    else { bgS(t, '#0a0a24', '#16163e', 'rgba(180,170,255,.07)'); txt('EL FUTURO', 360, 70, 72, '#c8c0ff'); pill('SENSORES CUÁNTICOS', 360, 160, '#2a2a6a', '#fff', 36); const k = ss(ramp(t, M.pub + 1.4, M.pub + 3.6)); bar(80, 300, 560, 46, k, '#8a7aff'); txt('≈ ' + fmt(500 * k) + ' M', 360, 400, 90, '#fff', { glow: '#8a7aff' }); txt('EN TEORÍA', 360, 470, 36, gold);
      sg.globalAlpha = sr(t, Ln.g7.end - 2.6, Ln.g7.end - 2.0); pill('SCIENCE ADVANCES', 360, 580, '#3a2a6a', '#fff', 38); txt('UNIVERSIDAD DE QUEENSLAND', 360, 655, 28, '#c8c0ff', { w: 700 }); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(168,224,255,.6)');
  }
  const tc = [SX, 6, SZ], wc = [2.5, 1.8, -5.5];
  const K = autoK([[0, [-3.5, 2.2, 5], [SX, 7.5, SZ], 56], [M.title - .3, [-13, 4, 3], [SX, 6, SZ], 56], [M.title + .9, [0, 4.8, 6.8], [0, 5.0, -1], 60]],
    [M.who, M.lift, M.bits, M.wall, M.why, M.slow, M.pub],
    [[[[16, 12, 14], [0, 8, -18], 56], [[-12, 10, 14], [0, 8, -18], 56], 2.4], [[[SX + 6, 3, SZ + 6], [SX, 4, SZ], 50], [[SX + 4, 9, SZ + 6], [SX, 7, SZ], 50], 2.6], null, [[[8, 2, 2], wc, 54], [[9, 3.5, -1], wc, 54], 2.6], [[[-2, 2, 2], wc, 56], [[1, 3, 4], wc, 56], 2.2], null, [[[20, 14, 16], [-2, 6, -14], 56], [[-16, 12, 14], [-2, 6, -14], 56], 2.4]],
    [[M.endcard, [12, 4, 6], tc, 56], [C.dur, [-12, 5, 6], tc, 58]]);
  frame = function (t) {
    const cur = t > M.bits && t < M.wall ? BITS[Math.max(0, Math.floor(ramp(t, M.bits + 1.0, Ln.g3.end) * 8.99) - 1)] : null;
    const tgt = cur ? (cur == '1' ? 9 : 2.5) : 5.5 + 3.5 * Math.sin(t * .9); CW.position.y = lerp(CW.position.y, tgt, .12); CWG.position.y = CW.position.y; CAB.position.y = (CW.position.y + 15.4) / 2; CAB.scale.y = 15.4 - CW.position.y;
    RINGS.forEach((r, i) => { const w = (t * .35 + i / 5) % 1; r.position.set(SX, CW.position.y, SZ); r.scale.setScalar(1 + w * 14); r.material.opacity = (1 - w) * .55 });
    GVL.material.color.setHSL(.45, 1, .5 + .2 * Math.sin(t * 8)); GVG.material.opacity = .5 + .3 * Math.sin(t * 5);
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(60,160,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.lift, M.bits, M.wall, M.why, M.slow, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿MANDARÍAS UN<br>MENSAJE ASÍ?', qs: 100, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 2 — PAPAS EN LA LUNA (superficie lunar, sol rasante, verde y dorado)
if (P == 2) {
  scene.background = new THREE.Color(0x02030a); scene.fog = null; const STARS = starField(3000, 140, -.1, 1.0, .2);
  hemi.color.setHex(0xdde4ff); hemi.groundColor.setHex(0x3a3a40); hemi.intensity = 1.0; R.toneMappingExposure = 1.15;
  const sun = new THREE.DirectionalLight(0xfff4e0, 3.2); sun.position.set(-30, 14, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 }); scene.add(sun);
  const regT = tex(512, 512, (g, w, h) => { g.fillStyle = '#8a8a86'; g.fillRect(0, 0, w, h); blot(g, w, h, 60, .25, '50,50,50', 80); speck(g, w, h, 9000, .35, '30,30,30'); speck(g, w, h, 3000, .3, '220,220,210') }, 10, 10);
  const gG = new THREE.PlaneGeometry(240, 240, 120, 120); gG.rotateX(-PI / 2); const gp = gG.attributes.position;
  const CR = [[-14, -20, 5], [12, -30, 7], [-30, -8, 4], [20, -6, 3], [6, -46, 9], [-22, -40, 6], [34, -26, 5]];
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); let y = .4 * Math.sin(x * .07) * Math.cos(z * .05) + .15 * Math.sin(x * .3 + z * .2); for (const [cx, cz, r] of CR) { const d = Math.hypot(x - cx, z - cz) / r; if (d < 1.4) y += d < 1 ? -1.2 * (1 - d * d) * r * .25 : .5 * Math.sin((d - 1) / .4 * PI) * r * .12 } gp.setY(i, y) } gG.computeVertexNormals();
  add(scene, gG, new THREE.MeshLambertMaterial({ map: regT }), 0, 0, 0, 2);
  for (let i = 0; i < 26; i++) { const rk = add(scene, rockGeo(i + 7, 1), mat(0x7a7a76), (hash(i) - .5) * 60, .1, -4 - hash(i * 3) * 40, 3); rk.scale.setScalar(.2 + hash(i * 5) * .7) }
  // Earth in the sky
  const eaT = tex(512, 256, (g, w, h) => { g.fillStyle = '#1a4a9a'; g.fillRect(0, 0, w, h); blot(g, w, h, 30, .9, '60,120,60', 50); blot(g, w, h, 40, .7, '255,255,255', 40) });
  const EA = add(scene, new THREE.SphereGeometry(7, 48, 24), new THREE.MeshLambertMaterial({ map: eaT, emissive: 0x0a1a3a }), 30, 32, -90, 0); glowSprite(scene, 0x6aaaff, 22, 30, 32, -89).material.opacity = .5;
  // greenhouse dome with potato plants
  const GH = grp(scene); GH.position.set(-1, 0, -9);
  add(GH, new THREE.SphereGeometry(4.2, 40, 20, 0, 2 * PI, 0, PI / 2), new THREE.MeshStandardMaterial({ color: 0xbfe8ff, transparent: true, opacity: .18, roughness: .05, metalness: .2, depthWrite: false, side: THREE.DoubleSide }), 0, 0, 0, 0);
  for (let i = 0; i < 6; i++) { const a = add(GH, new THREE.TorusGeometry(4.2, .05, 6, 40, PI), mat(0xd8dce4), 0, 0, 0, 0); a.rotation.y = i * PI / 6 }
  add(GH, new THREE.CylinderGeometry(4.25, 4.25, .3, 40), mat(0x9aa0a8), 0, .15, 0, 3);
  const soil = add(GH, new THREE.CylinderGeometry(3.6, 3.6, .25, 40), mat(0x4a3424), 0, .3, 0, 2);
  const PL = []; const leafM = new THREE.MeshLambertMaterial({ color: 0x4aa83a, emissive: 0x0a2a08 });
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 1 + (i % 3) * .9; const p = grp(GH); p.position.set(Math.cos(a) * r, .4, Math.sin(a) * r);
    for (let j = 0; j < 7; j++) { const l = sph(p, .28, leafM, Math.cos(j * .9) * .25, .25 + j * .12, Math.sin(j * .9) * .25, 1); l.scale.set(.32, .12, .2) } PL.push(p) }
  const GL = new THREE.PointLight(0xc8ffb0, 18, 10, 1.2); GL.position.set(0, 3.2, 0); GH.add(GL); glowSprite(GH, 0xd8ffb0, 6, 0, 3.4, 0).material.opacity = .35;
  // lander-ish module (generic) + flag-free antenna
  const MOD = grp(scene); MOD.position.set(7, 0, -14); box(MOD, 2.4, 1.6, 2.4, new THREE.MeshStandardMaterial({ color: 0xe8e4da, metalness: .3, roughness: .5 }), 0, 1.6, 0, 3); for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const lg = add(MOD, G.cyl, mat(0xb0b0b0), dx * 1.4, .5, dz * 1.4, 1); lg.scale.set(.06, 1.4, .06); lg.rotation.z = dx * .4; lg.rotation.x = -dz * .4 }
  const pan = box(MOD, 3.4, .05, 1.2, new THREE.MeshStandardMaterial({ color: 0x1a2a5a, metalness: .6, roughness: .3 }), 3.0, 2.2, 0, 1); const mst = add(MOD, G.cyl, mat(0xb0b0b0), -.6, 2.9, 0, 1); mst.scale.set(.05, 1.0, .05); const dsh = add(MOD, new THREE.SphereGeometry(.6, 16, 8, 0, 2 * PI, 0, PI / 3), new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide }), -.6, 3.3, 0, 1); dsh.rotation.x = PI + .6;
  const DUST = []; for (let i = 0; i < 60; i++) { const d = glowSprite(scene, 0xc8c8c0, .25 + hash(i) * .3, 0, 0, 0); d.material.opacity = 0; DUST.push(d) }
  makePanel(V(0, 6.2, -1), 0, 4.2, 0xd8ffb0, 0x6aff6a);
  function draw(t) {
    const gold = '#ffd95a', gr = '#d8ffb0';
    if (t < M.who) { bgS(t, '#0a1006', '#16220e', 'rgba(216,255,176,.07)'); txt('PAPAS', 360, 80, 96, gold, { glow: '#ff9a00' }); txt('EN SUELO LUNAR', 360, 156, 46, '#fff'); moon2D(500, 400, 150); potato2D(260, 430, 1.4, -.3); sprout2D(250, 400, 120 * sr(t, .8, 2.6)) }
    else if (t < M.comp) { bgS(t, '#0a120a', '#142414', 'rgba(216,255,176,.07)'); txt('OREGÓN', 360, 76, 84, '#fff', { glow: '#3aff6a', blur: 30 }); pill('ESTADOS UNIDOS', 360, 160, '#1a4a1a', '#fff', 34);
      for (let i = 0; i < 5; i++) { const k = sr(t, M.who + 2.6 + i * .35, M.who + 3.0 + i * .35); if (k <= 0) continue; sg.globalAlpha = k; jar2D(110 + i * 125, 360, 1.0, ['#9a9a94', '#7a7a74', '#b0aca0', '#8a8680', '#a4a49c'][i], .7); sg.globalAlpha = 1 }
      sg.globalAlpha = sr(t, M.who + 3.4, M.who + 4.0); txt('5 SIMULANTES', 360, 520, 56, gold); txt('POLVO QUE IMITA LA LUNA', 360, 590, 32, gr, { w: 700 }); sg.globalAlpha = 1 }
    else if (t < M.pct) { bgS(t, '#140e06', '#24180a', 'rgba(255,216,160,.07)'); txt('SOLO NO ALCANZA', 360, 70, 58, '#ffd8a0'); sg.fillStyle = '#8a8a86'; sg.fillRect(80, 330, 220, 120); sprout2D(190, 330, 60); cross(190, 260, 40, '#ff3a4a', sr(t, M.comp + 1.6, M.comp + 2.4));
      const k = sr(t, M.comp + 3.4, M.comp + 4.2); sg.globalAlpha = k; worm2D(500, 380, 1.0, t); txt('HUMUS', 500, 480, 50, '#fff'); txt('DE LOMBRIZ', 500, 530, 36, gold); sg.globalAlpha = 1; stampMark('EL TRUCO', 360, 640, ramp(t, Ln.r2.end - 1.0, Ln.r2.end - .4), gold, -.05, 52) }
    else if (t < M.safe) { bgS(t, '#06140a', '#0c2412', 'rgba(216,255,176,.07)'); txt('% DE HUMUS', 360, 70, 66, gr); const L_ = [['0 %', 40, .1], ['5-15 %', 110, .5], ['30 %', 230, 1]];
      L_.forEach(([s, h, q], i) => { const t0 = M.pct + (i == 0 ? .2 : i == 1 ? .6 : 3.4), k = sr(t, t0, t0 + 1.2); const x = 140 + i * 220; sg.fillStyle = '#6a5a4a'; sg.beginPath(); sg.moveTo(x - 70, 470); sg.lineTo(x + 70, 470); sg.lineTo(x + 54, 560); sg.lineTo(x - 54, 560); sg.fill(); sprout2D(x, 470, h * k); txt(s, x, 610, 44, i == 2 ? gold : '#fff') });
      stampMark('COMO EN LA TIERRA', 360, 160, ramp(t, Ln.r3.end - 1.2, Ln.r3.end - .6), gold, -.04, 46) }
    else if (t < M.base) { bgS(t, '#140e06', '#24180a', 'rgba(255,216,160,.07)'); txt('¿SE PUEDE COMER?', 360, 70, 58, '#ffd8a0'); potato2D(360, 260, 1.5, .1); const k = sr(t, M.safe + 2.0, M.safe + 3.0);
      bar(100, 420, 520, 36, .22 * k, '#ffb040'); txt('TOXINAS NATURALES', 360, 395, 32, '#fff', { w: 700 }); sg.globalAlpha = sr(t, Ln.r4.end - 1.2, Ln.r4.end - .6); check(360, 540, 50, '#5aff8a', 1); txt('SIN SUBA SIGNIFICATIVA', 360, 640, 38, gold); sg.globalAlpha = 1 }
    else if (t < M.dust) { bgS(t, '#06081a', '#0e1230', 'rgba(180,200,255,.07)'); txt('ARTEMISA', 360, 80, 88, '#fff', { glow: '#6a8aff', blur: 30 }); moon2D(360, 400, 200); const k = sr(t, M.base + 3.0, M.base + 4.0); circ(360, 590, 16 + 6 * Math.sin(t * 5), '#ff4a3a', '#ff2a1a');
      sg.globalAlpha = k; pill('BASE · POLO SUR', 360, 660, '#2a3a6a', '#fff', 38); sg.globalAlpha = 1; earth2D(620, 190, 46) }
    else if (t < M.pub) { bgS(t, '#16140e', '#2a261a', 'rgba(255,240,200,.07)'); txt('FALTA RESOLVER', 360, 70, 62, '#ffe8c0'); for (let i = 0; i < 80; i++) { const w = (t * .2 + hash(i)) % 1; circ(60 + hash(i * 3) * 600, 600 - w * 420, 3 + hash(i * 5) * 4, `rgba(200,200,190,${.7 * Math.sin(w * PI)})`) }
      sg.globalAlpha = sr(t, M.dust + .6, M.dust + 1.2); pill('POLVO FINÍSIMO', 360, 260, '#4a4a3a', '#fff', 42); sg.globalAlpha = sr(t, M.dust + 1.6, M.dust + 2.2); pill('METALES PESADOS', 360, 400, '#5a2a1a', '#fff', 42); sg.globalAlpha = 1 }
    else { bgS(t, '#0a1206', '#16240c', 'rgba(216,255,176,.07)'); txt('NPJ MICROGRAVITY', 360, 76, 54, gr); pill('UNIVERSIDAD ESTATAL DE OREGÓN', 360, 150, '#1a4a1a', '#fff', 28); const n = Math.floor(ramp(t, M.pub + 3.0, M.pub + 5.0) * 10.99);
      for (let i = 0; i < Math.min(10, n); i++) potato2D(110 + (i % 5) * 125, 320 + Math.floor(i / 5) * 140, .55, i * .7, ['#c8a060', '#b0704a', '#d8b878', '#8a5a7a', '#c89060'][i % 5]); sg.globalAlpha = sr(t, M.pub + 4.0, M.pub + 4.6); txt('PRÓXIMO: 10 VARIEDADES', 360, 640, 40, gold); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(216,255,176,.6)');
  }
  const tc = [-1, 1.6, -9], mc = [7, 1.6, -14];
  const K = autoK([[0, [-4, 2.2, 4], [-1, 1.4, -9], 52], [M.title - .3, [-9, 3, 0], [-1, 1.6, -9], 54], [M.title + .9, [0, 4.8, 6.8], [0, 5.0, -1], 60]],
    [M.who, M.comp, M.pct, M.safe, M.base, M.dust, M.pub],
    [[[[-12, 8, 6], [10, 20, -60], 56], [[-10, 4, 4], tc, 56], 2.6], [near(tc, [5, 2, 5], 50), near(tc, [-5, 2.5, 5], 50), 2.4], null, [near(tc, [6, 5.5, 6], 50), near(tc, [-6, 5, 6.5], 50), 2.2], [[[8, 1.8, 2], [30, 32, -90], 54], [[5, 2.2, 3], [30, 32, -90], 54], 2.6], [near(mc, [-9, 2.5, 9], 50), near(mc, [-5, 2.0, 10], 50), 2.2], null],
    [[M.endcard, [-8, 3, 0], tc, 54], [C.dur, [6, 3.5, 0], tc, 56]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; EA.rotation.y = t * .05;
    PL.forEach((p, i) => { const g = .55 + .45 * sr(t, M.pct + 3.4, M.pct + 5.0); p.scale.setScalar(g * (1 + .04 * Math.sin(t * 1.5 + i))) });
    const dk = win(t, M.dust - .2, M.pub + .2, .6, .6); DUST.forEach((d, i) => { const w = (t * .1 + hash(i)) % 1; d.position.set(-4 + hash(i * 3) * 14, .2 + w * 2.5, -6 + hash(i * 5) * -12); d.material.opacity = .6 * dk * Math.sin(w * PI) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(120,255,120,.04)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.comp, M.pct, M.safe, M.base, M.dust, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿PROBARÍAS UNA<br>PAPA LUNAR?', qs: 105, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 3 — ¿ERA DE HIELO? (Ártico de día, blanco y celeste)
if (P == 3) {
  skyDome('#3a6aaa', '#a8cce8', '#e8f2fa'); scene.background = new THREE.Color(0xc8e0f0); scene.fog = new THREE.Fog(0xd8e8f4, 50, 170);
  hemi.color.setHex(0xe8f4ff); hemi.groundColor.setHex(0x5a5a50); hemi.intensity = 1.1; R.toneMappingExposure = 1.0;
  const sun = new THREE.DirectionalLight(0xffe0b8, 2.4); sun.position.set(-40, 14, -10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); scene.add(sun);
  glowSprite(scene, 0xfff4d0, 14, -90, 22, -40).material.opacity = .9;
  const tunT = tex(512, 512, (g, w, h) => { g.fillStyle = '#6a6250'; g.fillRect(0, 0, w, h); blot(g, w, h, 80, .5, '90,110,70', 60); blot(g, w, h, 60, .5, '230,240,245', 50); speck(g, w, h, 6000, .3, '40,36,30') }, 8, 8);
  const tG = new THREE.PlaneGeometry(260, 260, 100, 100); tG.rotateX(-PI / 2); const tp = tG.attributes.position; for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i); tp.setY(i, .5 * Math.sin(x * .08) * Math.cos(z * .06) + .3 * Math.sin(x * .2 + z * .15) + (z < -60 ? -3 : 0)) } tG.computeVertexNormals();
  add(scene, tG, new THREE.MeshLambertMaterial({ map: tunT }), 0, 0, 0, 2);
  const SEA = add(scene, new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: .2, metalness: .2 }), 0, -.8, -160, 0); SEA.rotation.x = -PI / 2;
  for (let i = 0; i < 10; i++) { const b = add(scene, rockGeo(i + 50, 1), new THREE.MeshLambertMaterial({ color: 0xeaf6ff, emissive: 0x203040 }), -80 + i * 18, 0, -80 - hash(i) * 40, 1); b.scale.set(3 + hash(i) * 4, 2 + hash(i * 2) * 3, 3) }
  // the ice cap (a flattened, wobbly dome)
  const iceT = tex(512, 512, (g, w, h) => { g.fillStyle = '#eef8ff'; g.fillRect(0, 0, w, h); blot(g, w, h, 50, .35, '160,200,230', 60); for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(120,170,210,${Math.random() * .4})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 20, w * .6, y - 20, w, y + 10); g.stroke() } }, 2, 2);
  const icG = new THREE.SphereGeometry(1, 64, 24, 0, 2 * PI, 0, PI / 2); const ip = icG.attributes.position; for (let i = 0; i < ip.count; i++) { const x = ip.getX(i), z = ip.getZ(i), a = Math.atan2(z, x); const k = 1 + .12 * Math.sin(a * 3 + 1) + .07 * Math.sin(a * 7); ip.setX(i, x * k); ip.setZ(i, z * k) } icG.computeVertexNormals();
  const ICE = add(scene, icG, new THREE.MeshStandardMaterial({ map: iceT, roughness: .35, metalness: .05, color: 0xf4fbff }), 0, -.2, -26, 3);
  const ICEB = add(scene, new THREE.CylinderGeometry(1, 1.02, .4, 64), new THREE.MeshLambertMaterial({ color: 0xa8d8f0, transparent: true, opacity: .6 }), 0, 0, -26, 0);
  // ancient plants exposed at the ice margin
  const MOSS = []; for (let i = 0; i < 26; i++) { const a = -.5 + hash(i) * 1.0 + PI / 2; const m = grp(scene); for (let j = 0; j < 5; j++) { const l = sph(m, .18, mat(0x4a6a2a), (hash(i * 9 + j) - .5) * .4, .05, (hash(i * 7 + j) - .5) * .4, 1); l.scale.set(.2, .08, .2) } m.userData.a = a; m.userData.r = .96 + hash(i * 3) * .1; MOSS.push(m) }
  const SNOW = []; for (let i = 0; i < 160; i++) { const s = glowSprite(scene, 0xffffff, .12 + hash(i) * .12, 0, 0, 0); s.material.opacity = .8; SNOW.push(s) }
  const DRIP = []; for (let i = 0; i < 24; i++) { const d = glowSprite(scene, 0x6ac8ff, .35, 0, 0, 0); d.material.opacity = 0; DRIP.push(d) }
  makePanel(V(0, 6.4, -1), 0, 4.2, 0xc8ecff, 0x6ac8ff);
  function draw(t) {
    const gold = '#ffd95a', ic = '#c8ecff';
    if (t < M.who) { bgS(t, '#0a1a2e', '#12304e', 'rgba(200,236,255,.08)'); txt('¿ERA DE HIELO?', 360, 80, 70, ic); snowflake(250, 380, 120, '#eaf8ff', t); thermo(520, 500, 260, .3 + .1 * Math.sin(t), '#6ac8ff') }
    else if (t < M.lau) { bgS(t, '#0a1a2e', '#12304e', 'rgba(200,236,255,.08)'); txt('SCIENCE', 360, 100, 110, '#fff', { glow: '#6ac8ff', blur: 40 }); pill('UNIVERSIDAD DE COLUMBIA', 360, 220, '#1a3a6a', '#fff', 34); sg.globalAlpha = sr(t, M.who + 2.4, M.who + 3.0); pill('ESTADOS UNIDOS', 360, 300, '#2a4a7a', '#fff', 30); sg.globalAlpha = 1; snowflake(360, 500, 110, ic, t) }
    else if (t < M.barnes) { bgS(t, '#0a2030', '#123a50', 'rgba(200,236,255,.08)'); const k = ss(ramp(t, M.lau + .6, M.lau + 3.6)); iceMap2D(k, t); sg.fillStyle = 'rgba(10,30,50,.6)'; sg.fillRect(0, 0, 720, 120); txt('HACE ' + fmt(20000 * ss(ramp(t, M.lau + .2, M.lau + 1.8))) + ' AÑOS', 360, 64, 56, '#fff');
      sg.globalAlpha = sr(t, M.lau + 3.0, M.lau + 3.6); pill('LAURENTIDA', 400, 210, '#2a5a8a', '#fff', 40); sg.globalAlpha = 1; stampMark('+3 KM DE ALTO', 360, 650, ramp(t, Ln.i2.end - 1.4, Ln.i2.end - .8), gold, -.05, 52) }
    else if (t < M.plants) { bgS(t, '#0a2030', '#123a50', 'rgba(200,236,255,.08)'); txt('HOY QUEDA ESTO', 360, 70, 58, ic); iceMap2D(.0, t); sg.save(); sg.fillStyle = '#5a7a4a'; sg.beginPath(); sg.ellipse(420, 170, 70, 40, -.5, 0, 7); sg.fill(); const k = 1 - .35 * sr(t, M.barnes + 4, Ln.i3.end); sg.fillStyle = '#f0faff'; sg.shadowColor = '#bfe6ff'; sg.shadowBlur = 24; sg.beginPath(); sg.ellipse(420, 170, 34 * k, 18 * k, -.5, 0, 7); sg.fill(); sg.restore();
      arrow(560, 300, 450, 190, gold, sr(t, M.barnes + .6, M.barnes + 1.4)); sg.globalAlpha = sr(t, M.barnes + 1.0, M.barnes + 1.6); pill('CASQUETE BARNES', 470, 340, '#2a5a8a', '#fff', 36); txt('ISLA DE BAFFIN · CANADÁ', 360, 650, 32, '#fff', { w: 700 }); sg.globalAlpha = 1 }
    else if (t < M.grow) { bgS(t, '#0e1a12', '#18301e', 'rgba(200,255,200,.07)'); txt('PLANTAS ANTIGUAS', 360, 70, 56, '#d8ffd0'); const k = sr(t, M.plants + .4, M.plants + 3.0); sg.fillStyle = '#5a4a3a'; sg.fillRect(60, 420, 600, 200); sg.fillStyle = 'rgba(240,250,255,.95)'; sg.fillRect(60 + 600 * k, 250, 600 * (1 - k), 200);
      for (let i = 0; i < 6; i++) { const x = 110 + i * 100; if (x < 60 + 600 * k) { sg.fillStyle = '#6a8a3a'; sg.beginPath(); sg.ellipse(x, 420, 34, 16, 0, PI, 0); sg.fill() } } sg.globalAlpha = sr(t, Ln.i4.end - 2.2, Ln.i4.end - 1.6); pill('CARBONO 14', 360, 560, '#2a4a2a', '#fff', 46); sg.globalAlpha = 1 }
    else if (t < M.stop) { bgS(t, '#0a1a2e', '#12304e', 'rgba(200,236,255,.08)'); txt('TAMAÑO DEL HIELO', 360, 70, 52, ic); const k = ss(ramp(t, M.grow + .4, Ln.i5.end - .4)); const f = graph2D(t, k * .9, 0);
      if (k > .5) { const [x, y] = f(.45); circ(x, y, 12, gold); sg.globalAlpha = sr(t, M.grow + 2.4, M.grow + 3.0); txt('HACE 3.000', x, y + 50, 30, gold) } sg.globalAlpha = 1; if (k > .66) { const [x, y] = f(.62); circ(x, y, 12, '#fff'); txt('HACE 2.000', x + 40, y - 40, 30, '#fff') } sg.globalAlpha = sr(t, Ln.i5.end - 1.2, Ln.i5.end - .6); stampMark('VOLVIÓ A CRECER', 360, 640, ramp(t, Ln.i5.end - 1.2, Ln.i5.end - .6), '#6ac8ff', -.04, 48); sg.globalAlpha = 1 }
    else if (t < M.pub) { bgS(t, '#1a0e0a', '#301a12', 'rgba(255,200,170,.07)'); txt('¿LA PRÓXIMA GLACIACIÓN?', 360, 70, 44, ic); const k = ss(ramp(t, M.stop + 3.4, M.stop + 5.4)); const f = graph2D(t, .9 + .1 * k, k);
      if (k > .2) { const [x, y] = f(.95); txt('AÑOS 60', x - 40, y - 80, 34, '#ff8a6a') } thermo(620, 280, 140, .3 + .6 * k, '#ff6a4a'); stampMark('EL CALOR LO FRENÓ', 360, 640, ramp(t, Ln.i6.end - 1.4, Ln.i6.end - .8), '#ff6a4a', -.04, 46) }
    else { bgS(t, '#0a1a2e', '#12304e', 'rgba(200,236,255,.08)'); txt('HOY', 360, 76, 86, '#fff'); const k = sr(t, M.pub + .6, M.pub + 4.0); sg.save(); sg.fillStyle = '#f0faff'; sg.shadowColor = '#bfe6ff'; sg.shadowBlur = 30; sg.beginPath(); sg.ellipse(360, 330, 220 * (1 - .6 * k), 120 * (1 - .6 * k), 0, 0, 7); sg.fill(); sg.restore();
      for (let i = 0; i < 8; i++) { const w = (t * .8 + i / 8) % 1; circ(200 + i * 45, 440 + w * 80, 8, `rgba(106,200,255,${1 - w})`) } sg.globalAlpha = sr(t, M.pub + 1.4, M.pub + 2.0); pill('PIERDE MÁS DE LO QUE GANA', 360, 560, '#2a4a6a', '#fff', 32); sg.globalAlpha = sr(t, Ln.i7.end - 1.6, Ln.i7.end - 1.0); txt('¿PRÓXIMOS SIGLOS?', 360, 650, 46, gold); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(200,236,255,.6)');
  }
  function iceK(t) { let k = 1.25; k = lerp(k, 1.0, sr(t, M.barnes, M.plants)); k = lerp(k, .92, sr(t, M.plants, M.grow)); k = lerp(k, 1.12, sr(t, M.grow + 3, M.stop)); k = lerp(k, .8, sr(t, M.stop + 3, M.pub + 2)); k = lerp(k, .7, sr(t, M.pub + 2, M.endcard)); return k }
  const tc = [0, 2, -26];
  const K = autoK([[0, [-24, 9, 10], tc, 54], [M.title - .3, [20, 8, 10], tc, 56], [M.title + .9, [0, 5.0, 6.8], [0, 5.2, -1], 60]],
    [M.who, M.lau, M.barnes, M.plants, M.grow, M.stop, M.pub],
    [null, [[[0, 30, 10], tc, 60], [[10, 26, 4], tc, 60], 2.6], [[[-20, 4, -10], tc, 54], [[-24, 6, -16], tc, 54], 2.4], [[[-4, 1.6, -9], [0, .4, -15], 50], [[2, 1.4, -9], [0, .4, -15], 50], 2.6], [[[24, 8, 0], tc, 56], [[18, 10, 4], tc, 56], 2.4], [[[-18, 12, 6], tc, 56], [[-12, 9, 8], tc, 56], 2.4], [[[12, 3, -8], tc, 52], [[8, 4, -6], tc, 52], 2.2]],
    [[M.endcard, [-14, 6, -2], tc, 54], [C.dur, [14, 7, -2], tc, 56]]);
  frame = function (t) {
    const k = iceK(t); ICE.scale.set(14 * k, 5 * k, 11 * k); ICEB.scale.set(14 * k * 1.02, 1, 11 * k * 1.02);
    const ex = sr(t, M.plants, M.plants + 3); MOSS.forEach((m, i) => { const a = m.userData.a, r = m.userData.r * 1.04; m.position.set(Math.cos(a) * 14 * k * r * (1 + .12 * Math.sin(a * 3 + 1)), .05, -26 + Math.sin(a) * 11 * k * r * (1 + .07 * Math.sin(a * 7))); m.visible = ex > hash(i * 11) });
    SNOW.forEach((s, i) => { const w = (t * (.06 + hash(i) * .05) + hash(i * 2)) % 1; s.position.set(-20 + hash(i * 3) * 40 + Math.sin(t + i) * .5, 14 - w * 14, -30 + hash(i * 5) * 36) });
    const melt = Math.max(win(t, M.barnes, M.plants, .5, .5), win(t, M.stop + 3, C.dur, .5, .5)); DRIP.forEach((d, i) => { const w = (t * .5 + hash(i)) % 1, a = PI / 2 + (hash(i * 3) - .5) * 1.2; d.position.set(Math.cos(a) * 14 * k, 1.4 * (1 - w), -26 + Math.sin(a) * 11 * k + .5); d.material.opacity = .8 * melt * (1 - w) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(120,200,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.lau, M.barnes, M.plants, M.grow, M.stop, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿PREFERÍS EL FRÍO<br>O EL CALOR?', qs: 100, a: 'FRÍO', b: 'CALOR', cta: 'COMENTÁ  FRÍO  o  CALOR', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

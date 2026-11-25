// Virales 25/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: la era de hielo que ya había empezado · p2: el núcleo de la Tierra se filtra por un volcán · p3: la ballena con la cara más torcida
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'LA FRENAMOS', ts: 130, tag: 'PLANETA<b>NUEVO ESTUDIO</b>', sub: 'LA ERA DE HIELO', spk: { n: ['#bfe8ff', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'SE ESCAPA<br>EL NÚCLEO', ts: 125, tag: 'PLANETA<b>NUEVO ESTUDIO</b>', sub: 'DESDE HAWÁI', spk: { n: ['#ffc08a', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'LA CARA<br>TORCIDA', ts: 140, tag: 'FÓSILES<b>NUEVO ESTUDIO</b>', sub: 'UNA BALLENA DE PERÚ', spk: { n: ['#9af0e8', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — LA ERA DE HIELO QUE FRENAMOS (Ártico de día, blanco y celeste)
if (P == 1) {
  skyDome('#1a5ab8', '#6aa8e8', '#cfe6fa'); scene.background = new THREE.Color(0xa8d0f4); scene.fog = new THREE.Fog(0xb8daf6, 60, 220);
  hemi.color.setHex(0xf4faff); hemi.groundColor.setHex(0x8aa0b8); hemi.intensity = 1.1; R.toneMappingExposure = .95;
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.6); sun.position.set(-20, 8, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 90 }); scene.add(sun);
  glowSprite(scene, 0xfff4d0, 14, -90, 14, -60); glowSprite(scene, 0xffe0a0, 50, -90, 14, -60).material.opacity = .35;
  const sT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .12, '90,110,140') }, 40, 40);
  const gG = new THREE.PlaneGeometry(300, 240, 120, 100); gG.rotateX(-PI / 2); const gp = gG.attributes.position;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); const d = Math.hypot(x, z + 30); gp.setY(i, .5 * Math.sin(x * .11 + z * .07) + .3 * Math.sin(x * .27 - z * .19) + (d > 60 ? (d - 60) * .12 : 0)) } gG.computeVertexNormals();
  add(scene, gG, new THREE.MeshLambertMaterial({ color: 0x8a8070, map: sT }), 0, -.05, 0, 2); // bare tundra rock
  // the ice cap (dome) that shrinks during the "stop" section; edge reveals plants
  const iT = tex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,90,150,.45)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const y = hash(i * 3.1) * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * .05 + i) * 6 + (hash(i + x) - .5) * 4); g.stroke() } speck(g, w, h, 2000, .1, '60,110,170') }, 3, 3);
  const capM = new THREE.MeshStandardMaterial({ color: 0xd8ecfa, roughness: .45, metalness: .0, map: iT });
  const CAP = sph(scene, 1, capM, 0, 0, -34, 3); CAP.scale.set(26, 6, 20);
  const CAP2 = sph(scene, 1, new THREE.MeshStandardMaterial({ color: 0xbfe4ff, roughness: .2, transparent: true, opacity: .55 }), 0, 0, -34); CAP2.scale.set(26.6, 6.4, 20.6);
  const PL = []; const plM = [mat(0x6a7a3a), mat(0x7a6a3a), mat(0x5a6a2a)];
  for (let i = 0; i < 80; i++) { const a = hash(i * 1.9) * PI * 1.0 + PI * .0, r = 1 + hash(i * 3.3) * .25; const g = grp(scene); g.position.set(Math.cos(a) * 26 * r * .95, 0, -34 + Math.sin(a) * 20 * r * .95 + 0); if (g.position.z < -34) g.position.z = -34 + (-34 - g.position.z) * -1; for (let k = 0; k < 4; k++) { const b = add(g, G.cyl, plM[(i + k) % 3], (hash(i + k) - .5) * .4, .2, (hash(i * k + 2) - .5) * .4, 1); b.scale.set(.05, .35 + hash(i * k) * .3, .05); b.rotation.z = (hash(i * 7 + k) - .5) * 1.2 } g.userData.a = hash(i * 5.1); PL.push(g) }
  for (let i = 0; i < 30; i++) { const a = hash(i * 2.3) * 2 * PI, r = 6 + hash(i * 1.7) * 20; const rk = add(scene, rockGeo(i, 1), mat(0x6a6660), Math.cos(a) * r, .1, Math.sin(a) * r + 4, 3); rk.scale.setScalar(.3 + hash(i * 4) * .8) }
  const SNOW = []; for (let i = 0; i < 70; i++) { const s = glowSprite(scene, 0xffffff, .12, 0, 0, 0); s.material.opacity = .85; SNOW.push(s) }
  makePanel(V(0, 5.0, -2), 0, 4.2, 0xbfe8ff, 0x4aa8ff);
  function draw(t) {
    const gold = '#ffd95a', ic = '#bfe8ff', wa = '#ff8a5a';
    if (t < M.ice) { bgS(t, '#0a1e36', '#14365a', 'rgba(191,232,255,.08)'); txt('PRÓXIMA ERA', 360, 70, 62, ic); txt('DE HIELO', 360, 135, 62, '#fff'); snowflake(250, 360, 120, '#e8f6ff', t); const k = ramp(t, 1.4, 2.6);
      cross(470, 360, 90, wa, k); thermo(600, 470, 200, .3 + .5 * ss(ramp(t, 1.0, 3.0)), wa); txt('¿FRENADA?', 360, 620, 64, gold, { glow: '#ff9a00' }) }
    else if (t < M.barnes) { bgS(t, '#0c2440', '#163c64', 'rgba(191,232,255,.08)'); txt('HACE 20.000 AÑOS', 360, 70, 54, ic); mapCanada(1, '#3a5a3a'); mapCanada(ss(ramp(t, M.ice + .6, M.ice + 2.6)) * .98 + .01, '#eef8ff'); txt('CANADÁ', 360, 300, 50, '#2a4a6a');
      const k = ss(ramp(t, M.ice + 4.0, M.ice + 5.4)); sg.globalAlpha = cl(k * 3); txt('+' + (3 * k).toFixed(0) + ' KM', 360, 560, 110, '#fff', { glow: '#4aa8ff', blur: 30 }); txt('DE ESPESOR', 360, 645, 40, gold); sg.globalAlpha = 1 }
    else if (t < M.plants) { bgS(t, '#0a1a30', '#122c4c', 'rgba(191,232,255,.08)'); txt('LO ÚLTIMO QUE QUEDA', 360, 70, 50, ic); mapCanada(1, '#3a5a3a'); circ(420, 230, 26 + 6 * Math.sin(t * 4), '#ffffff', '#bfe8ff');
      sg.globalAlpha = sr(t, M.barnes + .6, M.barnes + 1.2); pill('CASQUETE BARNES', 360, 520, '#1a4a7a', '#fff', 46); sg.globalAlpha = sr(t, M.barnes + 2.4, M.barnes + 3.0); txt('ISLA DE BAFFIN · ÁRTICO', 360, 620, 38, gold); sg.globalAlpha = 1 }
    else if (t < M.dating) { bgS(t, '#14200c', '#26381a', 'rgba(200,255,180,.07)'); txt('ABAJO DEL HIELO', 360, 70, 56, '#d8ffb8'); const k = ss(ramp(t, M.plants + .6, M.plants + 3.0));
      sg.fillStyle = '#5a4a30'; sg.fillRect(40, 420, 640, 260); for (let i = 0; i < 5; i++) plant2D(120 + i * 120, 430, 1.1); sg.fillStyle = 'rgba(230,246,255,.92)'; sg.fillRect(40, 220, 640 * (1 - k), 220); sg.fillStyle = 'rgba(190,230,255,.9)'; sg.fillRect(40 + 640 * (1 - k) - 10, 220, 10, 220);
      stampMark('INTACTAS', 360, 600, ramp(t, Ln.d3.end - 1.6, Ln.d3.end - 1.0), gold, -.06, 56) }
    else if (t < M.start) { bgS(t, '#0c1830', '#18284a', 'rgba(191,232,255,.08)'); txt('CARBONO 14', 360, 64, 56, ic); sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(60, 560); sg.lineTo(670, 560); sg.stroke();
      const xs = a => 640 - a / 4000 * 560; [['4.000', 4000], ['3.000', 3000], ['2.000', 2000], ['1.000', 1000], ['HOY', 0]].forEach(([s, a]) => { txt(s, xs(a), 600, 28, '#fff', { w: 700 }); sg.fillStyle = '#fff'; sg.fillRect(xs(a) - 2, 548, 4, 24) }); txt('AÑOS ATRÁS', 360, 650, 28, 'rgba(255,255,255,.7)', { w: 700 });
      const k = ss(ramp(t, M.dating + 2.0, M.dating + 6.0)); sg.strokeStyle = ic; sg.lineWidth = 10; sg.shadowColor = '#4aa8ff'; sg.shadowBlur = 20; sg.beginPath(); const sz = a => a > 3000 ? 300 - (4000 - a) / 1000 * 120 : a > 2000 ? 180 + 0 : a > 70 ? 180 + (2000 - a) / 1930 * 150 : 330 - (70 - a) / 70 * 90;
      for (let i = 0; i <= 100 * k; i++) { const a = 4000 - i * 40; const y = 540 - sz(a); i ? sg.lineTo(xs(a), y) : sg.moveTo(xs(a), y) } sg.stroke(); sg.shadowBlur = 0;
      if (t > M.dating + 3.5) { circ(xs(3000), 540 - 180, 14, gold, gold); txt('MÍNIMO', xs(3000), 410, 30, gold) } if (t > M.dating + 5.0) { arrow(xs(2000), 340, xs(1000), 240, '#7aff9a', sr(t, M.dating + 5.0, M.dating + 6.0)); txt('VUELVE A CRECER', xs(900), 190, 34, '#7aff9a') } }
    else if (t < M.stop) { bgS(t, '#0a1e3a', '#143462', 'rgba(191,232,255,.08)'); txt('EL ARRANQUE', 360, 70, 62, ic); txt('DE LA GLACIACIÓN', 360, 135, 50, '#fff'); for (let i = 0; i < 7; i++) snowflake(100 + i * 87, 300 + Math.sin(t * 2 + i) * 20, 34, 'rgba(232,246,255,.85)', t + i);
      sg.globalAlpha = sr(t, M.start + 3.2, M.start + 3.8); txt('MODELOS:', 360, 470, 44, '#fff'); stampMark('FALTABAN MILES DE AÑOS', 360, 580, ramp(t, M.start + 3.8, M.start + 4.4), '#ff5a5a', -.05, 40); sg.globalAlpha = 1 }
    else if (t < M.pub) { const k = ss(ramp(t, M.stop + .8, M.stop + 3.0)); bgS(t, k > .5 ? '#3a1408' : '#1a1a30', k > .5 ? '#5a2410' : '#2a2a48', 'rgba(255,160,120,.08)'); txt('SIGLO XX', 360, 70, 70, wa, { glow: '#ff5a2a', blur: 30 }); thermo(160, 520, 340, .2 + .7 * k, wa);
      const s = 1 - .45 * ss(ramp(t, M.stop + 3.0, M.stop + 5.5)); sg.fillStyle = '#eef8ff'; sg.beginPath(); sg.ellipse(450, 420, 200 * s, 90 * s, 0, PI, 0); sg.fill(); sg.fillStyle = '#5a4a30'; sg.fillRect(230, 420, 440, 30); txt('DESDE 1960', 450, 520, 44, '#fff'); txt('PIERDE MÁS DE LO QUE GANA', 360, 620, 36, gold) }
    else { bgS(t, '#141e30', '#22304a', 'rgba(191,232,255,.08)'); txt('¿Y AHORA?', 360, 70, 62, ic); const s = .3 + .7 * (1 - ss(ramp(t, M.pub + .5, M.pub + 2.8))); sg.fillStyle = '#eef8ff'; sg.beginPath(); sg.ellipse(360, 330, 220 * s, 100 * s, 0, PI, 0); sg.fill(); sg.fillStyle = '#5a4a30'; sg.fillRect(120, 330, 480, 30);
      txt('PODRÍA DESAPARECER', 360, 440, 46, '#fff'); txt('EN UNOS SIGLOS', 360, 500, 46, gold); sg.globalAlpha = sr(t, Ln.d7.end - 2.4, Ln.d7.end - 1.8); pill('REVISTA SCIENCE', 360, 630, '#1a3a6a', '#fff', 42); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(191,232,255,.6)');
  }
  const tc = [0, 3, -34];
  const K = autoK([[0, [14, 6, 4], tc, 50], [M.title - .3, [-12, 7, 6], tc, 52], [M.title + .9, [0, 3.6, 7.8], [0, 4.2, -2], 60]],
    [M.ice, M.barnes, M.plants, M.dating, M.start, M.stop, M.pub],
    [[[[18, 14, 20], tc, 56], [[-18, 16, 20], tc, 56], 2.4], null, [[[24, 2.4, -20], [26, .3, -34], 44], [[22, 2.6, -16], [24, .3, -30], 44], 2.6], null, null, [[[10, 8, 14], tc, 54], [[-10, 10, 16], tc, 54], 2.6], null],
    [[M.endcard, [12, 6, 8], tc, 54], [C.dur, [-12, 7, 10], tc, 56]]);
  frame = function (t) {
    const melt = ss(ramp(t, M.stop + .5, C.dur)); CAP.scale.set(26 - 4 * melt, 6 - 2.4 * melt, 20 - 3 * melt); CAP2.scale.set(26.6 - 4 * melt, 6.4 - 2.4 * melt, 20.6 - 3 * melt);
    capM.color.setHSL(.57, .5 - .2 * melt, .95 - .08 * melt);
    PL.forEach(p => { const v = cl(melt * 1.4 - p.userData.a * .3 + (t > M.plants ? .5 : 0)); p.scale.setScalar(.01 + v); p.rotation.y = t * .2 });
    SNOW.forEach((s, i) => { const w = (t * .12 + hash(i)) % 1; s.position.set((hash(i * 2) - .5) * 30 + Math.sin(t + i) * .5, 10 - w * 10, (hash(i * 3) - .5) * 20 - 4); s.material.opacity = .8 * Math.sin(w * PI) * (1 - melt * .8) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.ice - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(120,180,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.ice, M.barnes, M.plants, M.dating, M.start, M.stop, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿MÁS FRÍO O<br>MÁS CALOR?', qs: 115, a: 'FRÍO', b: 'CALOR', cta: 'COMENTÁ  FRÍO  o  CALOR', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
function earthLayers(x, y, r, k, t) { // cutaway: crust, mantle, outer core, inner core
  const L_ = [[1, '#6a4a2a'], [.97, '#d0502a'], [.55, '#ffa030'], [.2, '#fff0a0']]; L_.forEach(([f, c], i) => { const rr = r * f * (i == 0 ? 1 : lerp(1, 1, 1)); sg.fillStyle = c; sg.beginPath(); sg.arc(x, y, rr, 0, 7); sg.fill() });
  sg.fillStyle = '#0a0a14'; sg.beginPath(); sg.moveTo(x, y); sg.arc(x, y, r + 4, -PI / 2 + 2 * PI * (1 - .25 * k), -PI / 2); sg.closePath(); sg.fill();
  sg.fillStyle = '#3a7ad8'; sg.beginPath(); sg.arc(x, y, r, -PI / 2, -PI / 2 + 2 * PI * (1 - .25 * k)); sg.arc(x, y, r * .97, -PI / 2 + 2 * PI * (1 - .25 * k), -PI / 2, true); sg.fill() }
function volcano2D(x, y, s, t, glow = 1) { sg.save(); sg.translate(x, y); sg.scale(s, s); const gr = sg.createLinearGradient(0, -160, 0, 0); gr.addColorStop(0, '#5a3a2a'); gr.addColorStop(1, '#2a1a14'); sg.fillStyle = gr; sg.beginPath(); sg.moveTo(-220, 0); sg.lineTo(-50, -160); sg.lineTo(50, -160); sg.lineTo(220, 0); sg.closePath(); sg.fill();
  sg.fillStyle = '#ff6a1a'; sg.shadowColor = '#ff4a00'; sg.shadowBlur = 40 * glow; sg.beginPath(); sg.ellipse(0, -160, 50, 12, 0, 0, 7); sg.fill(); sg.shadowBlur = 0; for (let i = 0; i < 3; i++) { sg.strokeStyle = '#ff8a2a'; sg.lineWidth = 8; sg.beginPath(); sg.moveTo(-20 + i * 20, -158); sg.quadraticCurveTo(-40 + i * 40 + Math.sin(t + i) * 10, -80, -70 + i * 70, -10); sg.stroke() } sg.restore() }
function crystal2D(x, y, s, t, drops = 1) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = 'rgba(160,230,140,.55)'; sg.strokeStyle = '#c8ffb0'; sg.lineWidth = 4; sg.beginPath(); const P_ = [[0, -150], [100, -60], [90, 90], [0, 150], [-90, 90], [-100, -60]]; P_.forEach(([a, b], i) => i ? sg.lineTo(a, b) : sg.moveTo(a, b)); sg.closePath(); sg.fill(); sg.stroke();
  sg.strokeStyle = 'rgba(255,255,255,.4)'; sg.beginPath(); sg.moveTo(0, -150); sg.lineTo(0, 150); sg.moveTo(-100, -60); sg.lineTo(90, 90); sg.stroke();
  for (let i = 0; i < 6; i++) { if (i / 6 >= drops) continue; const dx = (hash(i * 2.1) - .5) * 120, dy = (hash(i * 3.7) - .5) * 200; circ(dx, dy, 14 + hash(i) * 10, '#ff8a3a', '#ff5a00'); circ(dx - 4, dy - 4, 4, 'rgba(255,255,255,.7)') } sg.restore() }
function meteor2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); const gr = sg.createLinearGradient(0, 0, 260, -200); gr.addColorStop(0, 'rgba(255,200,120,.9)'); gr.addColorStop(1, 'rgba(255,120,60,0)'); sg.fillStyle = gr; sg.beginPath(); sg.moveTo(-10, -30); sg.lineTo(260, -230); sg.lineTo(290, -190); sg.lineTo(30, 20); sg.fill(); rock2D(0, 0, 50, '#4a4038'); sg.restore() }
// ==================================================================================== PART 2 — EL NÚCLEO SE ESCAPA POR UN VOLCÁN (volcán de noche, rojo y naranja)
if (P == 2) {
  scene.background = new THREE.Color(0x0a0610); scene.fog = new THREE.Fog(0x1a0a0a, 30, 150); const STARS = starField(3000, 140, .05, 1.0, .25);
  hemi.color.setHex(0xffc8a0); hemi.groundColor.setHex(0x3a1a10); hemi.intensity = .9; R.toneMappingExposure = 1.15;
  const moon = new THREE.DirectionalLight(0xa8b8ff, 1.0); moon.position.set(20, 30, 10); scene.add(moon);
  const lavaL = new THREE.PointLight(0xff6a1a, 60, 60, 1.4); lavaL.position.set(0, 9, -30); scene.add(lavaL);
  const rT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, .35, '30,20,20') }, 30, 30);
  // the volcano: lathe cone with a crater
  const prof = []; for (let i = 0; i <= 24; i++) { const k = i / 24, r = lerp(24, 4, Math.pow(k, .6)); prof.push(new THREE.Vector2(r, k * 12)) } prof.push(new THREE.Vector2(3, 11), new THREE.Vector2(.1, 10));
  const cone = add(scene, new THREE.LatheGeometry(prof, 64), new THREE.MeshLambertMaterial({ color: 0x4a3a34, map: rT }), 0, -.1, -30, 2);
  const LAVA = add(scene, new THREE.CylinderGeometry(3.3, 3.3, .2, 32), new THREE.MeshBasicMaterial({ color: 0xff7a20, fog: false }), 0, 10.9, -30); const LG = glowSprite(scene, 0xff5a10, 22, 0, 13, -30); LG.material.opacity = .55;
  // lava rivers down the slope
  const RIV = []; for (let i = 0; i < 5; i++) { const a = -.6 + i * .3, pts = []; for (let j = 0; j <= 20; j++) { const k = j / 20, r = lerp(3.5, 23, k), aa = a + Math.sin(k * 6 + i) * .08; pts.push(V(Math.sin(aa) * r, lerp(10.8, .2, Math.pow(k, 1.3)) + .15, -30 + Math.cos(aa) * r)) }
    const tb = add(scene, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .35, 6), new THREE.MeshBasicMaterial({ color: 0xff5a10, fog: false }), 0, 0, 0); RIV.push(tb) }
  const gG = new THREE.PlaneGeometry(300, 240, 80, 60); gG.rotateX(-PI / 2); const gp = gG.attributes.position; for (let i = 0; i < gp.count; i++) gp.setY(i, .4 * Math.sin(gp.getX(i) * .15) + .3 * Math.sin(gp.getZ(i) * .2)); gG.computeVertexNormals();
  add(scene, gG, new THREE.MeshLambertMaterial({ color: 0x2a2220, map: rT }), 0, -.3, 0, 2);
  for (let i = 0; i < 40; i++) { const a = hash(i * 1.3) * 2 * PI, r = 4 + hash(i * 2.2) * 20; const rk = add(scene, rockGeo(i, 1), mat(0x2a2420), Math.cos(a) * r, 0, Math.sin(a) * r + 6, 3); rk.scale.setScalar(.3 + hash(i * 3.5) * .9) }
  const EMB = []; for (let i = 0; i < 80; i++) { const e = glowSprite(scene, 0xff8a2a, .25, 0, 0, 0); EMB.push(e) }
  makePanel(V(0, 5.0, -2), 0, 4.2, 0xffc08a, 0xff5a1a);
  function draw(t) {
    const gold = '#ffd95a', or = '#ffa050', rd = '#ff6a3a';
    if (t < M.layers) { bgS(t, '#200806', '#3a0e08', 'rgba(255,160,100,.08)'); txt('UN VOLCÁN', 360, 70, 62, or); txt('SUELTA EL NÚCLEO', 360, 135, 54, '#fff'); volcano2D(360, 560, 1.4, t); earthLayers(360, 320, 90, 1, t);
      arrow(360, 410, 360, 330, gold, 0); for (let i = 0; i < 6; i++) { const w = (t * .8 + i / 6) % 1; circ(360 + Math.sin(i * 2 + t) * 8, lerp(400, 300 - 120, w), 7, gold, gold) } }
    else if (t < M.kilauea) { bgS(t, '#100810', '#20101a', 'rgba(255,160,100,.07)'); txt('EL MANTO', 360, 70, 66, or); const k = ss(ramp(t, M.layers + .3, M.layers + 1.4)); earthLayers(360, 360, 220, k, t);
      const k2 = ss(ramp(t, M.layers + 1.6, M.layers + 3.2)); sg.globalAlpha = cl(k2 * 3); pill('≈ ' + fmt(2900 * k2) + ' KM', 360, 640, '#5a1a0a', '#fff', 50); sg.globalAlpha = 1 }
    else if (t < M.drops) { bgS(t, '#180a06', '#2e120a', 'rgba(255,160,100,.08)'); txt('KILAUEA', 360, 70, 84, '#fff', { glow: '#ff5a00', blur: 34 }); volcano2D(360, 560, 1.4, t); sg.globalAlpha = sr(t, M.kilauea + 1.0, M.kilauea + 1.6); pill('HAWÁI', 360, 200, '#5a1a0a', '#fff', 44);
      sg.globalAlpha = sr(t, M.kilauea + 2.6, M.kilauea + 3.2); txt('UNIVERSIDAD DE COLUMBIA', 360, 640, 36, gold); sg.globalAlpha = 1 }
    else if (t < M.number) { bgS(t, '#0a1408', '#14240e', 'rgba(200,255,180,.07)'); txt('GOTITAS ATRAPADAS', 360, 70, 52, '#c8ffb0'); crystal2D(360, 360, 1.3, t, ramp(t, M.drops + 1.0, M.drops + 3.0));
      sg.globalAlpha = sr(t, Ln.c3.end - 1.8, Ln.c3.end - 1.2); pill('CARBONO ORIGINAL', 360, 640, '#2a4a1a', '#fff', 42); sg.globalAlpha = 1 }
    else if (t < M.core) { bgS(t, '#140a1a', '#24102e', 'rgba(220,180,255,.07)'); txt('¿QUÉ TAN PESADO?', 360, 66, 54, '#e0c0ff'); const x0 = 80, x1 = 640, v2x = v => lerp(x0, x1, (v + 8) / 8);
      sg.strokeStyle = 'rgba(255,255,255,.6)'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(x0, 420); sg.lineTo(x1, 420); sg.stroke(); for (let v = -8; v <= 0; v++) { sg.fillStyle = '#fff'; sg.fillRect(v2x(v) - 2, 408, 4, 24); txt(v == 0 ? '0' : '−' + (-v), v2x(v), 460, 30, '#fff', { w: 700 }) }
      const k1 = sr(t, M.number + 2.0, M.number + 3.0); sg.globalAlpha = k1; sg.fillStyle = 'rgba(120,180,255,.5)'; sg.fillRect(v2x(-7), 380, v2x(-5) - v2x(-7), 80); txt('MANTO NORMAL', v2x(-6), 515, 34, '#9ac8ff'); sg.globalAlpha = 1;
      const k2 = ss(ramp(t, M.number + 4.6, M.number + 6.0)); if (k2 > 0) { const x = v2x(lerp(-6, -1, k2)); circ(x, 420, 22, rd, rd); txt('KILAUEA', x, 260, 40, or); txt('−1', x, 320, 64, '#fff', { glow: '#ff5a00' }) }
      stampMark('RARÍSIMO', 360, 600, ramp(t, Ln.c4.end - 1.4, Ln.c4.end - .8), gold, -.06, 64) }
    else if (t < M.meteor) { bgS(t, '#1e0a04', '#3a1206', 'rgba(255,160,100,.08)'); txt('¿DE DÓNDE VIENE?', 360, 70, 56, or); earthLayers(360, 400, 220, 1, t); for (let i = 0; i < 8; i++) { const w = (t * .5 + i / 8) % 1; const y = lerp(400, 180, w); circ(360 + Math.sin(w * 8 + i) * 16, y, 10, gold, gold) }
      sg.globalAlpha = sr(t, M.core + .8, M.core + 1.4); stampMark('¿DEL NÚCLEO?', 360, 560, ramp(t, M.core + .8, M.core + 1.4), gold, -.05, 56); sg.globalAlpha = 1 }
    else if (t < M.caveat) { bgS(t, '#060a1e', '#0c1438', 'rgba(160,200,255,.07)'); txt('METEORITOS', 360, 70, 66, '#9ac8ff'); const k = ss(ramp(t, M.meteor + .3, M.meteor + 2.0)); meteor2D(lerp(620, 380, k), lerp(160, 330, k), 1.2, t); circ(250, 560, 160, '#8a3a1a', '#ff5a1a');
      const k2 = ss(ramp(t, M.meteor + 2.0, M.meteor + 3.6)); sg.globalAlpha = cl(k2 * 3); txt('+' + fmt(4500 * k2), 470, 520, 84, '#fff', { glow: '#4a8aff' }); txt('MILLONES DE AÑOS', 470, 590, 34, gold); sg.globalAlpha = 1 }
    else { bgS(t, '#1e1606', '#342608', 'rgba(255,217,90,.07)'); txt('OJO', 360, 80, 90, gold, { glow: '#ff9a00' }); txt('TODAVÍA', 360, 220, 60, '#fff'); stampMark('NO ESTÁ PROBADO', 360, 330, ramp(t, M.caveat + .8, M.caveat + 1.4), '#ff5a5a', -.05, 54);
      sg.globalAlpha = sr(t, M.caveat + 2.0, M.caveat + 2.6); txt('FALTAN MÁS MEDICIONES', 360, 480, 40, gold); sg.globalAlpha = sr(t, Ln.c7.end - 2.0, Ln.c7.end - 1.4); pill('REVISTA PNAS', 360, 620, '#5a3a0a', '#fff', 44); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,192,138,.6)');
  }
  const tc = [0, 8, -30];
  const K = autoK([[0, [24, 5, 14], tc, 50], [M.title - .3, [-20, 6, 16], tc, 52], [M.title + .9, [0, 3.6, 7.8], [0, 4.2, -2], 60]],
    [M.layers, M.kilauea, M.drops, M.number, M.core, M.meteor, M.caveat],
    [null, [[[18, 10, 0], [0, 10, -30], 50], [[-16, 12, 2], [0, 10, -30], 50], 2.6], null, null, [[[6, 16, -14], [0, 10, -30], 54], [[-6, 15, -12], [0, 10, -30], 54], 2.4], null, null],
    [[M.endcard, [22, 6, 14], tc, 54], [C.dur, [-20, 7, 16], tc, 56]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; const fl = .85 + .15 * Math.sin(t * 7) * Math.sin(t * 3.1); lavaL.intensity = 60 * fl; LG.material.opacity = .5 * fl; LAVA.material.color.setHSL(.06, 1, .5 + .06 * Math.sin(t * 5));
    RIV.forEach((r, i) => r.material.color.setHSL(.04 + .02 * Math.sin(t * 2 + i), 1, .5));
    EMB.forEach((e, i) => { const w = (t * .25 + hash(i)) % 1; e.position.set((hash(i * 2) - .5) * 8 * (1 + w * 2), 11 + w * 16, -30 + (hash(i * 3) - .5) * 8); e.material.opacity = .9 * Math.sin(w * PI) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .18 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.layers - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,100,40,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.layers, M.kilauea, M.drops, M.number, M.core, M.meteor, M.caveat]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VERÍAS UN VOLCÁN<br>DE CERCA?', qs: 100, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
function whale2D(x, y, s, t, o = {}) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.rotate(o.tilt || 0); const col = o.col || '#5a6a80';
  sg.fillStyle = col; sg.beginPath(); sg.moveTo(-200, 0); sg.quadraticCurveTo(-120, -70, 40, -60); sg.quadraticCurveTo(150, -50, 170, 10); sg.quadraticCurveTo(150, 60, 40, 50); sg.quadraticCurveTo(-120, 50, -200, 0); sg.fill();
  const tw = Math.sin(t * 3) * 20; sg.beginPath(); sg.moveTo(-190, 0); sg.lineTo(-260, -40 + tw); sg.lineTo(-240, 0); sg.lineTo(-260, 40 + tw); sg.closePath(); sg.fill();
  sg.save(); sg.translate(150, 10); sg.rotate(o.snout || 0); sg.fillStyle = o.sc || col; sg.beginPath(); sg.roundRect(0, -24, 110, 48, 24); sg.fill(); sg.restore();
  sg.fillStyle = '#c8d4e0'; sg.beginPath(); sg.ellipse(20, 40, 120, 14, 0, 0, PI); sg.fill(); circ(110, -10, 7, '#111'); sg.fillStyle = '#4a5a6e'; sg.beginPath(); sg.ellipse(20, 30, 40, 12, .5, 0, 7); sg.fill(); sg.restore() }
function skullTop(x, y, s, k, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = '#e8dcc0'; sg.shadowColor = 'rgba(255,230,180,.5)'; sg.shadowBlur = 24; sg.beginPath(); sg.moveTo(0, -200); sg.quadraticCurveTo(70, -190, 80, -60); sg.quadraticCurveTo(170, 20, 140, 130); sg.quadraticCurveTo(0, 190, -140, 130); sg.quadraticCurveTo(-170, 20, -80, -60); sg.quadraticCurveTo(-70, -190, 0, -200); sg.fill(); sg.shadowBlur = 0;
  sg.strokeStyle = 'rgba(120,100,70,.5)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(0, -190); sg.lineTo(lerp(0, -40, k), 120); sg.stroke(); // midline bends
  const dx = lerp(0, -60, k); for (const ox of [-22, 22]) { const xx = lerp(ox, dx + ox * .7, k); sg.fillStyle = '#3a2a1a'; sg.beginPath(); sg.ellipse(xx, 10, 16, 26, 0, 0, 7); sg.fill() } sg.restore() }
// ==================================================================================== PART 3 — LA BALLENA DE CARA TORCIDA (fondo marino poco profundo, turquesa)
if (P == 3) {
  scene.background = new THREE.Color(0x0a4a5a); scene.fog = new THREE.FogExp2(0x0e5a6a, .028);
  hemi.color.setHex(0xc8fff8); hemi.groundColor.setHex(0x2a4a3a); hemi.intensity = 1.6; R.toneMappingExposure = 1.15;
  const sun = new THREE.DirectionalLight(0xe0fff4, 2.0); sun.position.set(4, 30, 6); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 80 }); scene.add(sun);
  const sT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .25, '90,70,40') }, 30, 30);
  const gG = new THREE.PlaneGeometry(200, 200, 100, 100); gG.rotateX(-PI / 2); const gp = gG.attributes.position; for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); gp.setY(i, .25 * Math.sin(x * .6 + z * .2) * .5 + .4 * Math.sin(x * .1 - z * .13)) } gG.computeVertexNormals();
  add(scene, gG, new THREE.MeshLambertMaterial({ color: 0xd8c08a, map: sT }), 0, -.1, 0, 2);
  // caustic-ish light shafts
  const RAYS = []; for (let i = 0; i < 9; i++) { const r = add(scene, new THREE.PlaneGeometry(1.2 + hash(i) * 1.5, 30), new THREE.MeshBasicMaterial({ color: 0xc8fff4, transparent: true, opacity: .06, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }), (hash(i * 2) - .5) * 30, 12, -6 - hash(i * 3) * 20); r.rotation.z = .25; RAYS.push(r) }
  const weedM = [mat(0x3a7a4a), mat(0x4a8a3a), mat(0x2a6a5a)]; const WEED = []; for (let i = 0; i < 60; i++) { const x = (hash(i * 1.7) - .5) * 40, z = -2 - hash(i * 2.9) * 30; if (Math.abs(x) < 3 && z > -8) continue; const w = add(scene, G.cyl, weedM[i % 3], x, .8, z, 1); w.scale.set(.06, 1.6 + hash(i) * 2, .06); w.userData.p = hash(i * 4) * 6; WEED.push(w) }
  for (let i = 0; i < 30; i++) { const a = hash(i * 1.3) * 2 * PI, r = 4 + hash(i * 2.2) * 18; const rk = add(scene, rockGeo(i, 1), mat(0x7a7468), Math.cos(a) * r, .0, Math.sin(a) * r - 8, 3); rk.scale.setScalar(.2 + hash(i * 3.5) * .7) }
  // the whale (stylised, original): body, tail, tube snout pointing down, blowhole on the LEFT
  const WH = grp(scene); const wm = new THREE.MeshStandardMaterial({ color: 0x5a6a80, roughness: .5 }), bm = new THREE.MeshStandardMaterial({ color: 0xc8d4e0, roughness: .6 });
  const bd = sph(WH, 1, wm, 0, 0, 0, 1); bd.scale.set(1.6, .7, .75); const bl = sph(WH, 1, bm, 0, -.25, 0); bl.scale.set(1.4, .45, .62);
  const SN = grp(WH); SN.position.set(1.35, -.05, 0); SN.rotation.z = -.54; const sn_ = add(SN, G.cyl, wm, .55, 0, 0, 1); sn_.scale.set(.32, 1.1, .32); sn_.rotation.z = PI / 2; sph(SN, .32, wm, 1.1, 0, 0);
  const BH = sph(WH, .09, basic(0x1a1a24), .9, .6, -.32);
  const TL_ = grp(WH); TL_.position.set(-1.5, 0, 0); const tl1 = add(TL_, G.cyl, wm, -.5, 0, 0, 1); tl1.scale.set(.3, 1, .25); tl1.rotation.z = PI / 2; const fl = box(TL_, .5, .06, 1.4, wm, -1.0, 0, 0, 1);
  for (const sz of [-1, 1]) { const f = box(WH, .5, .05, .3, wm, .4, -.35, sz * .75, 1); f.rotation.x = sz * .3 }
  sph(WH, .06, basic(0x0a0a10), 1.15, .1, .62); sph(WH, .06, basic(0x0a0a10), 1.15, .1, -.62);
  WH.position.set(0, 1.4, -6);
  const BUB = []; for (let i = 0; i < 50; i++) { const b = glowSprite(scene, 0xe8fff8, .14, 0, 0, 0); b.material.opacity = .6; BUB.push(b) }
  const FISH = []; for (let i = 0; i < 14; i++) { const f = sph(scene, .12, mat(0xffc84a), 0, 0, 0); f.scale.set(.19, .085, .06); FISH.push(f) }
  makePanel(V(0, 5.6, -2), 0, 4.2, 0x9af0e8, 0x2ad0c0);
  function draw(t) {
    const gold = '#ffd95a', aq = '#9af0e8';
    if (t < M.name) { bgS(t, '#04202a', '#083a44', 'rgba(154,240,232,.07)'); txt('LA CARA MÁS TORCIDA', 360, 70, 50, aq); skullTop(360, 380, 1.1, ss(ramp(t, .8, 2.6)), t); stampMark('NO ES UN ERROR', 360, 640, ramp(t, 2.6, 3.2), gold, -.05, 48) }
    else if (t < M.size) { bgS(t, '#062430', '#0a3c4a', 'rgba(154,240,232,.07)'); txt('CACHALOTE ENANO', 360, 70, 56, aq); whale2D(380, 290, 1.0, t, { snout: .54 });
      sg.globalAlpha = sr(t, M.name + .6, M.name + 1.2); txt('Scaphokogia huachafo', 360, 450, 46, '#fff', { w: 800 }); sg.globalAlpha = sr(t, M.name + 3.0, M.name + 3.6); txt('HACE ≈ 6 MILLONES DE AÑOS', 360, 545, 38, gold); pill('PERÚ', 360, 640, '#0a4a5a', '#fff', 44); sg.globalAlpha = 1 }
    else if (t < M.nose) { bgS(t, '#0a1e2a', '#123244', 'rgba(154,240,232,.07)'); txt('TAMAÑO', 360, 70, 62, aq); const k = ss(ramp(t, M.size + .3, M.size + 1.6)); whale2D(lerp(200, 330, k), 290, .85, t, { snout: .54 }); personIcon(620, 360, 170, '#ffd95a');
      txt((2.7 * k).toFixed(1).replace('.', ',') + ' M', 330, 470, 90, '#fff', { glow: '#2ad0c0' }); sg.globalAlpha = sr(t, M.size + 2.6, M.size + 3.2); pill('FÓSIL: AÑOS 90 · SUR DE PERÚ', 360, 630, '#0a4a5a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.real) { bgS(t, '#200a14', '#381224', 'rgba(255,160,200,.07)'); txt('VISTO DESDE ARRIBA', 360, 66, 48, '#ffb0d0'); skullTop(360, 360, 1.05, 1, t); const k = sr(t, M.nose + 1.6, M.nose + 2.4); arrow(140, 230, 260, 330, gold, k); txt('IZQUIERDA', 160, 190, 36, gold);
      stampMark('LOS DOS', 360, 640, ramp(t, Ln.w3.end - 1.2, Ln.w3.end - .6), '#ff5a8a', -.06, 60) }
    else if (t < M.snout) { bgS(t, '#0a1a24', '#14303e', 'rgba(154,240,232,.07)'); txt('¿SE DEFORMÓ?', 360, 70, 62, aq); skullTop(360, 330, .9, 1, t); const k = ramp(t, M.real + 2.2, M.real + 3.2);
      const rows = [['FRACTURAS', M.real + 2.4], ['DAÑOS', M.real + 3.2]]; rows.forEach(([s, t0], i) => { sg.globalAlpha = sr(t, t0, t0 + .4); txt(s, 300, 560 + i * 70, 42, '#fff', { a: 'right' }); cross(380, 560 + i * 70, 20, '#ff5a5a', ramp(t, t0, t0 + .5)); sg.globalAlpha = 1 });
      stampMark('ERA ASÍ', 520, 600, ramp(t, Ln.w4.end - 1.4, Ln.w4.end - .8), '#4aff9a', -.08, 52) }
    else if (t < M.hunt) { bgS(t, '#0a2418', '#123a26', 'rgba(160,255,200,.07)'); txt('HOCICO HACIA ABAJO', 360, 66, 50, '#b0ffd0'); const k = ss(ramp(t, M.snout + .3, M.snout + 1.6)), k2 = ss(ramp(t, M.snout + 3.0, M.snout + 4.6));
      whale2D(330, 300, .9, t, { snout: .54 * k + .42 * k2, sc: '#7a8aa0' }); const deg = k2 > 0 ? Math.round(31 + 24 * k2) : Math.round(31 * k); txt(deg + '°', 360, 520, 120, '#fff', { glow: '#2ad09a' }); txt(k2 > .02 ? 'DOBLANDO LA CABEZA' : 'HACIA ABAJO', 360, 625, 40, gold) }
    else if (t < M.word) { bgS(t, '#04202a', '#083a44', 'rgba(154,240,232,.07)'); txt('COMÍA EN EL FONDO', 360, 66, 50, aq); sg.fillStyle = '#c8a870'; sg.fillRect(40, 470, 640, 210); for (let i = 0; i < 5; i++) { const x = 120 + i * 120; sg.fillStyle = 'rgba(80,60,30,.6)'; sg.beginPath(); sg.ellipse(x, 540 + (i % 2) * 40, 22, 10, 0, 0, 7); sg.fill() }
      whale2D(360, 320, .8, t, { snout: .96, tilt: .12 }); for (let i = 0; i < 3; i++) { const w = (t * 1.2 + i / 3) % 1; sg.strokeStyle = `rgba(154,240,232,${(1 - w) * .8})`; sg.lineWidth = 5; sg.beginPath(); sg.arc(520, 420, 20 + w * 120, .3, 1.6); sg.stroke() }
      sg.globalAlpha = sr(t, Ln.w6.end - 2.6, Ln.w6.end - 2.0); pill('ECOLOCALIZACIÓN', 360, 640, '#0a4a5a', '#fff', 42); sg.globalAlpha = 1 }
    else { bgS(t, '#24120a', '#3e1e10', 'rgba(255,217,90,.07)'); txt('«HUACHAFO»', 360, 90, 84, gold, { glow: '#ff9a00', blur: 30 }); sg.globalAlpha = sr(t, M.word + 1.6, M.word + 2.2); txt('= LLAMATIVO', 360, 220, 54, '#fff'); txt('EXTRAVAGANTE', 360, 290, 54, '#fff'); sg.globalAlpha = 1;
      whale2D(360, 450, .6, t, { snout: .54 }); sg.globalAlpha = sr(t, Ln.w7.end - 2.4, Ln.w7.end - 1.8); pill('UNIVERSIDAD DE ZÚRICH', 360, 640, '#5a2a0a', '#fff', 40); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(154,240,232,.6)');
  }
  const tc = [0, 1.4, -6];
  const K = autoK([[0, [6, 2.4, 0], tc, 48], [M.title - .3, [-5.5, 2.8, -.2], tc, 50], [M.title + .9, [0, 4.2, 7.8], [0, 4.8, -2], 60]],
    [M.name, M.size, M.nose, M.real, M.snout, M.hunt, M.word],
    [[near(tc, [4, 1.2, 4], 46), near(tc, [-4, 1.6, 4], 46), 2.4], null, [near(tc, [.5, 4.5, 1.0], 48), near(tc, [-.5, 4.6, 1.2], 48), 2.6], null, [near(tc, [0, .6, 5], 44), near(tc, [1.5, .8, 4.6], 44), 2.4], [near(tc, [5, 1.0, 2], 48), near(tc, [-5, 1.4, 2.4], 48), 2.6], null],
    [[M.endcard, [4.6, 2.2, -1], tc, 48], [C.dur, [-4.4, 2.6, -1], tc, 50]]);
  frame = function (t) {
    const hunt = win(t, M.hunt, M.word + 1, .8, .8); WH.position.set(Math.sin(t * .3) * .6, 1.4 - .7 * hunt + Math.sin(t * 1.1) * .08, -6 + Math.cos(t * .3) * .3); WH.rotation.z = -.15 * hunt + Math.sin(t * .9) * .03; WH.rotation.y = Math.sin(t * .3) * .25;
    SN.rotation.z = -.54 - .42 * win(t, M.snout + 3.0, M.hunt + 2, .8, .8); TL_.rotation.y = Math.sin(t * 2.5) * .25;
    RAYS.forEach((r, i) => r.material.opacity = .05 + .035 * Math.sin(t * .8 + i * 1.7)); WEED.forEach(w => w.rotation.z = Math.sin(t * 1.2 + w.userData.p) * .15);
    BUB.forEach((b, i) => { const w = (t * .15 + hash(i)) % 1; b.position.set((hash(i * 2) - .5) * 14 + Math.sin(t * 2 + i) * .2, w * 12, (hash(i * 3) - .5) * 12 - 6); b.material.opacity = .5 * Math.sin(w * PI) });
    FISH.forEach((f, i) => { const a = t * .4 + i * .45; f.position.set(Math.cos(a) * 6 + hash(i) * 1.5, 2.6 + Math.sin(t + i) * .3 + hash(i * 2) * .8, -8 + Math.sin(a) * 4); f.rotation.y = -a });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(60,200,200,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.name, M.size, M.nose, M.real, M.snout, M.hunt, M.word]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿TE GUSTARÍA<br>VERLA NADAR?', qs: 115, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

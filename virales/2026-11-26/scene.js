// Virales 26/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: la tormenta magnética de Mira que llega hasta Saturno · p2: los puercoespines que brillan con luz UV · p3: el polen escondido en un barco romano
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'TORMENTA<br>GIGANTE', ts: 125, tag: 'ESPACIO<b>NUEVO ESTUDIO</b>', sub: 'HASTA SATURNO', spk: { n: ['#ffb0a0', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'BRILLAN EN<br>LA OSCURIDAD', ts: 110, tag: 'ANIMALES<b>NUEVO ESTUDIO</b>', sub: 'PUERCOESPINES', spk: { n: ['#b8ffb0', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'EL SECRETO<br>DEL CASCO', ts: 115, tag: 'HISTORIA<b>NUEVO ESTUDIO</b>', sub: 'UN BARCO ROMANO', spk: { n: ['#ffd8a0', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — LA TORMENTA DE MIRA (espacio profundo, rojo y violeta)
if (P == 1) {
  scene.background = new THREE.Color(0x05030c); scene.fog = null; const STARS = starField(4000, 140, -1, 1.1, .3);
  hemi.color.setHex(0xffb0a0); hemi.groundColor.setHex(0x20102a); hemi.intensity = .7; R.toneMappingExposure = 1.1;
  const nebT = tex(512, 512, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .25, '120,40,160', 160); blot(g, w, h, 30, .2, '200,60,80', 140) });
  const neb = new THREE.Mesh(new THREE.SphereGeometry(130, 32, 16), new THREE.MeshBasicMaterial({ map: nebT, side: THREE.BackSide, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(neb);
  // the red giant
  const stT = tex(512, 256, (g, w, h) => { g.fillStyle = '#ff6a2a'; g.fillRect(0, 0, w, h); blot(g, w, h, 70, .5, '150,20,10', 60); blot(g, w, h, 40, .45, '255,200,100', 40); speck(g, w, h, 4000, .3, '255,230,160') });
  const SC = V(0, 9, -42); const STAR = add(scene, new THREE.SphereGeometry(10, 64, 32), new THREE.MeshBasicMaterial({ map: stT, fog: false }), SC.x, SC.y, SC.z);
  const G1 = glowSprite(scene, 0xff4a1a, 34, SC.x, SC.y, SC.z + 2); G1.material.opacity = .8; const G2 = glowSprite(scene, 0xff2a4a, 60, SC.x, SC.y, SC.z); G2.material.opacity = .35;
  const HOT = []; for (let i = 0; i < 5; i++) { const a = -.8 + i * .4, b = -.5 + hash(i) * 1.0; const h = glowSprite(scene, 0xfff0b0, 2.4, SC.x + Math.sin(a) * 9.6 * Math.cos(b), SC.y + Math.sin(b) * 9.6, SC.z + Math.cos(a) * 9.6 * Math.cos(b)); h.material.opacity = 0; HOT.push(h) }
  // the magnetic loop (grows during the flare section)
  const lp_ = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * PI; lp_.push(V(SC.x + 6 + Math.cos(a) * -10, SC.y + 3 + Math.sin(a) * 14, SC.z + 8)) }
  const LG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lp_), 200, .9, 10); const LOOP = add(scene, LG, new THREE.MeshBasicMaterial({ color: 0xff8a6a, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), 0, 0, 0);
  const LG2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lp_), 200, 2.0, 10); const LOOP2 = add(scene, LG2, new THREE.MeshBasicMaterial({ color: 0xff3a8a, transparent: true, opacity: .25, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), 0, 0, 0);
  const IDX = LG.index.count, IDX2 = LG2.index.count;
  // a ringed planet far away (for scale)
  const PLN = grp(scene); PLN.position.set(26, 3, -26); sph(PLN, 2.2, new THREE.MeshLambertMaterial({ color: 0xe0c080 }), 0, 0, 0, 0); const ring = add(PLN, new THREE.RingGeometry(3, 5, 48), new THREE.MeshBasicMaterial({ color: 0xd8c8a0, side: THREE.DoubleSide, transparent: true, opacity: .7 }), 0, 0, 0); ring.rotation.x = -1.2;
  const sunL = new THREE.PointLight(0xff8a5a, 400, 200, 1.2); sunL.position.copy(SC); scene.add(sunL);
  // drifting gas particles thrown out by the storm
  const GAS = []; for (let i = 0; i < 90; i++) { const e = glowSprite(scene, i % 2 ? 0xff7a4a : 0xff4aa0, .6 + hash(i) * .8, 0, 0, 0); GAS.push(e) }
  makePanel(V(0, 5.0, -2), 0, 4.2, 0xffb0a0, 0xff4a6a);
  function draw(t) {
    const gold = '#ffd95a', rs = '#ffb0a0', pk = '#ff7ab0';
    if (t < M.who) { bgS(t, '#14040e', '#2a0818', 'rgba(255,160,180,.07)'); txt('TORMENTA', 360, 70, 70, rs); txt('EN UNA ESTRELLA', 360, 138, 48, '#fff'); redGiant2D(250, 420, 130, t); loop2D(330, 330, 150, 200, ss(ramp(t, .6, 2.6)), pk); saturn2D(610, 230, 26, t); arrow(470, 260, 570, 240, gold, sr(t, 2.0, 2.8)) }
    else if (t < M.alma) { bgS(t, '#100414', '#22082a', 'rgba(255,160,180,.07)'); txt('MIRA', 360, 90, 110, '#fff', { glow: '#ff3a5a', blur: 40 }); redGiant2D(360, 330, 110, t); const k = ss(ramp(t, M.who + 2.6, M.who + 4.2));
      sg.globalAlpha = cl(k * 3); txt('≈ ' + fmt(330 * k), 360, 520, 92, '#fff', { glow: '#ff5a7a' }); txt('AÑOS LUZ', 360, 590, 40, gold); sg.globalAlpha = sr(t, M.who + 4.6, M.who + 5.2); pill('CONSTELACIÓN DE LA BALLENA', 360, 660, '#4a1030', '#fff', 32); sg.globalAlpha = 1 }
    else if (t < M.spots) { bgS(t, '#0c0618', '#1a0c2e', 'rgba(200,180,255,.07)'); txt('VS. EL SOL', 360, 70, 62, rs); const k = ss(ramp(t, M.alma + .8, M.alma + 2.4)); circ(150, 300, 10, '#fff0a0', '#ffe060'); txt('SOL', 150, 350, 30, '#fff');
      redGiant2D(440, 300, 40 + 170 * k, t); sg.globalAlpha = sr(t, M.alma + 1.0, M.alma + 1.6); txt('MÁS FRÍA · MÁS GRANDE', 360, 530, 40, gold); sg.globalAlpha = sr(t, Ln.m2.end - 3.0, Ln.m2.end - 2.4); dish2D(200, 640, .8); pill('10 AÑOS · ALMA', 420, 630, '#3a1a5a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.flare) { bgS(t, '#1a0806', '#320e08', 'rgba(255,200,140,.07)'); txt('MANCHAS CALIENTES', 360, 70, 52, '#ffc890'); redGiant2D(360, 270, 140, t, sr(t, M.spots + .6, M.spots + 1.6));
      const k = ss(ramp(t, M.spots + 2.4, M.spots + 4.2)); bar(80, 470, 560, 40, .25, '#ff8a3a'); txt('PROMEDIO ≈ 2.000 K', 360, 450, 30, '#fff', { w: 700 }); bar(80, 570, 560, 40, k, '#fff0a0'); txt('MANCHAS: ' + fmt(8000 * k) + ' K', 360, 550, 34, gold); stampMark('x4', 600, 660, ramp(t, Ln.m3.end - .9, Ln.m3.end - .3), '#ff5a5a', -.1, 48) }
    else if (t < M.saturn) { bgS(t, '#14040e', '#2a0818', 'rgba(255,160,180,.07)'); const k = ss(ramp(t, M.flare + 2.4, M.flare + 6.0)); const yr = t < M.flare + 2.4 ? '2023' : t < M.flare + 6.0 ? (2023 + Math.floor(k * 2.99)).toString() : '2025'; txt(yr, 360, 80, 96, '#fff', { glow: '#ff3a8a' });
      redGiant2D(360, 470, 120, t); circ(360 + 60, 360, 18 + 10 * Math.sin(t * 8), '#fff0c0', '#ffe0a0'); loop2D(360, 380, 60 + 200 * k, 80 + 200 * k, sr(t, M.flare + 1.0, M.flare + 3.0), pk, 10 + 10 * k);
      sg.globalAlpha = sr(t, Ln.m4.end - 2.2, Ln.m4.end - 1.6); pill('FOTOGRAFIADO EN 2025', 360, 660, '#4a1030', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.mag) { bgS(t, '#06040e', '#100c22', 'rgba(200,180,255,.06)'); txt('¿QUÉ TAN GRANDE?', 360, 64, 54, rs); const k = ss(ramp(t, M.saturn + .8, M.saturn + 3.0)); const cx = 90, cy = 430;
      [60, 90, 125, 190, 360, 560].forEach((r, i) => { sg.strokeStyle = 'rgba(255,255,255,.22)'; sg.lineWidth = 2; sg.beginPath(); sg.arc(cx, cy, r, -1.1, 1.1); sg.stroke() }); circ(cx, cy, 26, '#fff0a0', '#ffe060'); saturn2D(cx + 560 * Math.cos(-.35), cy + 560 * Math.sin(-.35), 18, t);
      sg.globalAlpha = .9; sg.strokeStyle = pk; sg.shadowColor = pk; sg.shadowBlur = 20; sg.lineWidth = 12; sg.beginPath(); sg.moveTo(cx, cy); sg.lineTo(cx + 560 * k * Math.cos(-.35), cy + 560 * k * Math.sin(-.35)); sg.stroke(); sg.shadowBlur = 0; sg.globalAlpha = 1;
      txt('EL RIZO', 330, 600, 44, '#fff'); stampMark('HASTA SATURNO', 360, 670, ramp(t, Ln.m5.end - .9, Ln.m5.end - .3), gold, -.04, 44) }
    else if (t < M.pub) { bgS(t, '#0a0420', '#180a3a', 'rgba(180,160,255,.07)'); txt('TORMENTA', 360, 66, 66, '#c8b0ff'); txt('MAGNÉTICA', 360, 134, 60, '#fff'); redGiant2D(360, 420, 100, t);
      for (let i = 0; i < 5; i++) { const r = 130 + i * 34; sg.strokeStyle = `rgba(200,170,255,${.6 - i * .1})`; sg.lineWidth = 5; sg.beginPath(); sg.ellipse(360, 420, r * .55, r, 0, -PI * .5 - .9, -PI * .5 + .9); sg.stroke(); sg.beginPath(); sg.ellipse(360, 420, r * .55, r, 0, PI * .5 - .9, PI * .5 + .9); sg.stroke() }
      bolt(560, 260, .9, gold); const k = sr(t, M.mag + 4.0, M.mag + 6.0); for (let i = 0; i < 8; i++) { const w = (t * .6 + i / 8) % 1; circ(360 + Math.cos(i * .8) * (110 + w * 240), 420 + Math.sin(i * .8) * (110 + w * 240), 8 * k, pk, pk) } sg.globalAlpha = k; pill('LANZA GAS AL ESPACIO', 360, 660, '#3a1a6a', '#fff', 38); sg.globalAlpha = 1 }
    else { bgS(t, '#1a0c04', '#341808', 'rgba(255,217,90,.07)'); txt('NUESTRO SOL', 360, 70, 62, gold); txt('EN EL FUTURO', 360, 135, 46, '#fff'); const k = ss(ramp(t, M.pub + .8, M.pub + 3.0)); circ(lerp(360, 200, k), 360, 40, '#fff0a0', '#ffe060'); if (k > 0) { arrow(260, 360, 360, 360, '#fff', k); redGiant2D(500, 360, 40 + 90 * k, t) }
      sg.globalAlpha = sr(t, Ln.m7.end - 2.8, Ln.m7.end - 2.2); pill('UNIVERSIDAD CHALMERS · SUECIA', 360, 570, '#5a2a0a', '#fff', 32); txt('ASTRONOMY & ASTROPHYSICS', 360, 650, 30, '#ffd8b0', { w: 700 }); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,176,160,.6)');
  }
  const tc = [SC.x, SC.y, SC.z];
  const K = autoK([[0, [18, 4, 10], [0, 12, -42], 50], [M.title - .3, [-16, 6, 12], [0, 12, -42], 52], [M.title + .9, [0, 3.6, 7.8], [0, 4.2, -2], 60]],
    [M.who, M.alma, M.spots, M.flare, M.saturn, M.mag, M.pub],
    [[[[14, 10, 0], tc, 56], [[-14, 12, 2], tc, 56], 2.4], null, [[[6, 9, -22], tc, 60], [[-6, 10, -21], tc, 60], 2.4], [[[20, 14, -8], [4, 16, -38], 58], [[8, 16, -6], [4, 16, -38], 58], 2.6], [[[30, 14, 26], [12, 12, -34], 62], [[34, 12, 22], [14, 10, -32], 62], 2.4], [[[-14, 8, 0], tc, 56], [[-8, 14, 2], tc, 56], 2.6], null],
    [[M.endcard, [18, 6, 10], [0, 12, -42], 54], [C.dur, [-16, 8, 12], [0, 12, -42], 56]]);
  frame = function (t) {
    STARS.rotation.y = t * .003; neb.rotation.y = t * .004; STAR.rotation.y = t * .03; G1.material.opacity = .7 + .1 * Math.sin(t * 2);
    const hot = sr(t, M.spots + .6, M.spots + 1.6); HOT.forEach((h, i) => h.material.opacity = hot * (.7 + .3 * Math.sin(t * 5 + i)));
    const g = t < M.flare ? 0 : ss(ramp(t, M.flare + .8, M.saturn)); const n = Math.max(0, Math.floor(IDX * g / 6) * 6); LG.setDrawRange(0, n); LG2.setDrawRange(0, Math.floor(IDX2 * g / 6) * 6); LOOP.visible = LOOP2.visible = g > 0.01;
    LOOP.material.opacity = .75 + .2 * Math.sin(t * 4); const gas = sr(t, M.mag + 3.0, M.mag + 6.0);
    GAS.forEach((e, i) => { const w = (t * .05 + hash(i)) % 1, a = hash(i * 2) * 2 * PI, b = (hash(i * 3) - .5) * 2; const r = 11 + w * 28 * (.3 + .7 * gas); e.position.set(SC.x + Math.cos(a) * r * Math.cos(b), SC.y + Math.sin(b) * r, SC.z + Math.sin(a) * r * Math.cos(b)); e.material.opacity = (.25 + .6 * gas) * Math.sin(w * PI) });
    PLN.rotation.y = t * .1;
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .18 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,80,120,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.alma, M.spots, M.flare, M.saturn, M.mag, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿TE GUSTARÍA<br>VERLA DE CERCA?', qs: 105, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
function porc2D(x, y, s, t, g = 0, o = {}) { // original stylised porcupine; g = 0 daylight colours … 1 UV glow
  sg.save(); sg.translate(x, y); sg.scale(s * (o.flip ? -1 : 1), s); const qc = g > .5 ? `rgb(${lerp(230, 80, g) | 0},${lerp(200, 255, g) | 0},${lerp(90, 150, g) | 0})` : '#e0c060';
  if (g > 0) { sg.shadowColor = '#5aff9a'; sg.shadowBlur = 40 * g }
  sg.strokeStyle = qc; sg.lineWidth = 5; sg.lineCap = 'round'; for (let i = 0; i < 46; i++) { const a = PI * (1.05 + i / 46 * .95), r1 = 70, r2 = 112 + 14 * hash(i); sg.beginPath(); sg.moveTo(Math.cos(a) * r1, Math.sin(a) * r1 * .8); sg.lineTo(Math.cos(a) * r2, Math.sin(a) * r2 * .8); sg.stroke() }
  sg.fillStyle = g > .5 ? '#2a6a5a' : '#6a5040'; sg.beginPath(); sg.ellipse(0, 0, 90, 66, 0, 0, 7); sg.fill();
  sg.shadowBlur = 0; const hg = g > .5 ? `rgba(160,255,200,${g})` : '#8a6a50'; if (g > 0) { sg.shadowColor = '#9affc0'; sg.shadowBlur = 60 * g } sg.fillStyle = g > .5 ? hg : '#8a6a50'; sg.beginPath(); sg.ellipse(92, 6, 44, 36, .2, 0, 7); sg.fill(); sg.shadowBlur = 0;
  circ(132, 18, 9, '#f0b0a0'); circ(100, -6, 7, '#111'); circ(102, -8, 2.5, '#fff');
  sg.strokeStyle = g > .5 ? '#4aa890' : '#5a4030'; sg.lineWidth = 12; sg.beginPath(); sg.moveTo(-80, 20); sg.quadraticCurveTo(-140, 40, -130, 90 + Math.sin(t * 2) * 6); sg.stroke(); // prehensile tail
  for (const lx of [-40, 40]) { sg.beginPath(); sg.moveTo(lx, 50); sg.lineTo(lx + 6, 84); sg.stroke() } sg.lineCap = 'butt'; sg.restore() }
function torch2D(x, y, s, on, rot = -.5) { sg.save(); sg.translate(x, y); sg.rotate(rot); sg.scale(s, s); if (on > 0) { const gr = sg.createLinearGradient(40, 0, 420, 0); gr.addColorStop(0, `rgba(170,90,255,${.75 * on})`); gr.addColorStop(1, 'rgba(120,60,255,0)'); sg.fillStyle = gr; sg.beginPath(); sg.moveTo(40, -16); sg.lineTo(420, -120); sg.lineTo(420, 120); sg.lineTo(40, 16); sg.fill() }
  sg.fillStyle = '#3a3a48'; sg.beginPath(); sg.roundRect(-80, -16, 110, 32, 8); sg.fill(); sg.fillStyle = '#5a5a6a'; sg.beginPath(); sg.roundRect(26, -24, 22, 48, 6); sg.fill(); circ(48, 0, 14, on > 0 ? '#c890ff' : '#666', on > 0 ? '#a060ff' : null); sg.restore() }
function wave2D(x0, x1, y, amp, freq, col, t, k = 1) { sg.strokeStyle = col; sg.shadowColor = col; sg.shadowBlur = 16; sg.lineWidth = 7; sg.beginPath(); for (let x = x0; x <= lerp(x0, x1, k); x += 3) { const yy = y + Math.sin((x - x0) * freq - t * 6) * amp; x == x0 ? sg.moveTo(x, yy) : sg.lineTo(x, yy) } sg.stroke(); sg.shadowBlur = 0 }
function tree2D(x, y, h, col = '#1a2a1a') { sg.fillStyle = '#2a1e14'; sg.fillRect(x - 8, y - h, 16, h); sg.fillStyle = col; for (const [dx, dy, r] of [[0, -h, 40], [-26, -h + 20, 30], [26, -h + 24, 30]]) { sg.beginPath(); sg.arc(x + dx, y + dy, r, 0, 7); sg.fill() } }
// ==================================================================================== PART 2 — LOS PUERCOESPINES QUE BRILLAN (selva de noche, violeta UV y verde)
if (P == 2) {
  scene.background = new THREE.Color(0x07061a); scene.fog = new THREE.FogExp2(0x16123a, .03); const STARS = starField(1500, 140, .25, 1.0, 0);
  hemi.color.setHex(0xc8c4e8); hemi.groundColor.setHex(0x2a4a3a); hemi.intensity = 1.5; R.toneMappingExposure = 1.35; const fillL = new THREE.PointLight(0xffe0c0, 30, 14, 1.2); fillL.position.set(1.5, 4.5, -2.5); scene.add(fillL);
  const moonL = new THREE.DirectionalLight(0x9aa8ff, 1.0); moonL.position.set(-10, 20, 8); scene.add(moonL); glowSprite(scene, 0xdde4ff, 10, -40, 34, -80); glowSprite(scene, 0x8a9aff, 30, -40, 34, -80).material.opacity = .3;
  const gT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, .35, '20,40,20') }, 30, 30);
  const gG = new THREE.PlaneGeometry(200, 200, 60, 60); gG.rotateX(-PI / 2); const gp = gG.attributes.position; for (let i = 0; i < gp.count; i++) gp.setY(i, .3 * Math.sin(gp.getX(i) * .3) + .3 * Math.sin(gp.getZ(i) * .25)); gG.computeVertexNormals();
  add(scene, gG, new THREE.MeshLambertMaterial({ color: 0x1a3a22, map: gT }), 0, -.2, 0, 2);
  const barkM = mat(0x3a2a20), leafM = [mat(0x1a4a2a), mat(0x24522e), mat(0x14402a)];
  for (let i = 0; i < 46; i++) { const x = (hash(i * 1.3) - .5) * 60, z = -6 - hash(i * 2.1) * 40; if (Math.abs(x) < 4 && z > -9) continue; const h = 6 + hash(i * 3) * 8; const tr = add(scene, G.cyl, barkM, x, h / 2, z, 1); tr.scale.set(.35 + hash(i) * .2, h, .35 + hash(i) * .2);
    for (let k = 0; k < 3; k++) { const c = sph(scene, 2 + hash(i * k + 1) * 1.6, leafM[(i + k) % 3], x + (hash(i + k) - .5) * 3, h + (hash(i * 2 + k) - .2) * 2, z + (hash(i * 5 + k) - .5) * 3, 0) } }
  // the branch and the porcupine (stylised, original)
  const BR = add(scene, G.cyl, barkM, 0, 2.0, -5, 1); BR.scale.set(.18, 9, .18); BR.rotation.z = PI / 2 - .08; const TRK = add(scene, G.cyl, barkM, -4.4, 3, -5, 1); TRK.scale.set(.45, 8, .45);
  const PO = grp(scene); PO.position.set(.4, 2.55, -5); const bodyM = new THREE.MeshStandardMaterial({ color: 0x6a5040, roughness: .8, emissive: 0x2aff8a, emissiveIntensity: 0 });
  const headM = new THREE.MeshStandardMaterial({ color: 0x8a6a50, roughness: .8, emissive: 0x9affc0, emissiveIntensity: 0 }); const quillM = new THREE.MeshStandardMaterial({ color: 0xe0c060, roughness: .6, emissive: 0x4aff9a, emissiveIntensity: 0 });
  const bd = sph(PO, 1, bodyM, 0, 0, 0, 1); bd.scale.set(.62, .42, .42); const hd = sph(PO, .26, headM, .62, .04, 0, 1); sph(PO, .06, basic(0xf0b0a0), .86, .02, 0, 0); for (const z of [-.12, .12]) sph(PO, .04, basic(0x050505), .76, .12, z, 0);
  const qG = new THREE.ConeGeometry(.018, .24, 5); qG.translate(0, .12, 0); const QN = 140, QI = new THREE.InstancedMesh(qG, quillM, QN); const dm = new THREE.Object3D();
  for (let i = 0; i < QN; i++) { const u = hash(i * 1.7), v = hash(i * 2.9); const th = u * 2 * PI, ph = Math.acos(1 - v * 1.3); const n = V(Math.sin(ph) * Math.cos(th) * .9 - .2, Math.cos(ph), Math.sin(ph) * Math.sin(th)).normalize(); if (n.x > .55 || n.y < -.25) { dm.scale.setScalar(0) } else dm.scale.setScalar(.8 + hash(i) * .5);
    dm.position.set(n.x * .55, n.y * .36, n.z * .38); dm.quaternion.setFromUnitVectors(V(0, 1, 0), V(n.x - .5, n.y, n.z).normalize()); dm.updateMatrix(); QI.setMatrixAt(i, dm.matrix) } PO.add(QI);
  const TAIL = add(PO, G.cyl, bodyM, -.7, -.25, 0, 1); TAIL.scale.set(.06, .6, .06); TAIL.rotation.z = -.6;
  const PG = glowSprite(PO, 0x5aff9a, 3.2, 0, 0, 0); PG.material.opacity = 0;
  // the UV flashlight beam
  const uvL = new THREE.SpotLight(0xa070ff, 0, 30, .35, .5, 1.2); uvL.position.set(3.5, 4.5, 1); uvL.target = PO; scene.add(uvL);
  const BEAM = add(scene, new THREE.ConeGeometry(1.1, 7, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xa070ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), 0, 0, 0);
  const FF = []; for (let i = 0; i < 40; i++) { const f = glowSprite(scene, 0xc8ff8a, .18, 0, 0, 0); FF.push(f) }
  makePanel(V(0, 5.6, -2), 0, 4.2, 0xb8ffb0, 0x6a4aff);
  function draw(t) {
    const gold = '#ffd95a', gr = '#b8ffb0', vi = '#c8a0ff';
    if (t < M.who) { bgS(t, '#0a0620', '#140a36', 'rgba(200,170,255,.07)'); txt('LUZ UV', 360, 70, 72, vi, { glow: '#8a4aff' }); const k = sr(t, .6, 1.6); torch2D(90, 600, 1, k, -.75); porc2D(400, 330, 1.2, t, k); stampMark('¡BRILLA!', 470, 560, ramp(t, 1.8, 2.4), gr, -.08, 56) }
    else if (t < M.torch) { bgS(t, '#06140e', '#0e2418', 'rgba(184,255,176,.07)'); txt('PUERCOESPÍN', 360, 64, 62, gr); txt('ENANO MEXICANO', 360, 126, 46, '#fff'); for (let i = 0; i < 4; i++) tree2D(80 + i * 190, 520, 220 + (i % 2) * 40, '#1a3a24'); sg.fillStyle = '#3a2a1a'; sg.fillRect(40, 350, 640, 16); porc2D(360, 300, .7, t, 0);
      sg.globalAlpha = sr(t, M.who + 1.6, M.who + 2.2); circ(620, 200, 30, '#eef0ff', '#c8d0ff'); txt('DE NOCHE', 360, 580, 40, gold); sg.globalAlpha = sr(t, M.who + 3.4, M.who + 4.0); pill('MÉXICO → PANAMÁ', 360, 650, '#1a4a2a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.glow) { bgS(t, '#0a0820', '#16103a', 'rgba(200,170,255,.07)'); txt('JUNIO 2024', 360, 70, 66, vi); txt('CHETUMAL · MÉXICO', 360, 134, 40, '#fff'); porc2D(470, 380, .8, t, 0); porc2D(470, 560, .6, t, 0, { flip: 0 });
      const k = sr(t, Ln.p2.end - 2.2, Ln.p2.end - 1.4); torch2D(110, 520, 1, k, -.35); sg.globalAlpha = sr(t, M.torch + 3.4, M.torch + 4.0); pill('2 HEMBRAS RESCATADAS', 360, 240, '#2a1a5a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.twenty) { const k = sr(t, M.glow + .2, M.glow + 1.2); bgS(t, '#04060e', '#0a0e20', 'rgba(184,255,176,.06)'); txt('¡BRILLARON!', 360, 70, 72, gr, { glow: '#2aff8a', blur: 30 }); porc2D(330, 340, 1.15, t, k);
      sg.globalAlpha = sr(t, M.glow + 2.0, M.glow + 2.6); txt('DE DÍA: AMARILLAS', 200, 560, 32, '#e0c060'); txt('CON UV: VERDES', 520, 560, 32, gr); sg.globalAlpha = 1; stampMark('LA CABEZA', 360, 650, ramp(t, Ln.p3.end - 1.6, Ln.p3.end - 1.0), gold, -.05, 50); if (t > Ln.p3.end - 1.6) arrow(560, 300, 470, 330, gold, sr(t, Ln.p3.end - 1.6, Ln.p3.end - .9)) }
    else if (t < M.science) { bgS(t, '#04060e', '#0a1020', 'rgba(184,255,176,.06)'); const n = Math.min(20, Math.floor(ramp(t, M.twenty + .6, M.twenty + 3.0) * 20)); txt(n + ' / 20', 360, 76, 84, '#fff', { glow: '#2aff8a' });
      for (let i = 0; i < 20; i++) porc2D(110 + (i % 5) * 125, 200 + Math.floor(i / 5) * 105, .32, t, i < n ? 1 : 0); stampMark('TODOS', 360, 640, ramp(t, Ln.p4.end - .9, Ln.p4.end - .3), gr, -.06, 60) }
    else if (t < M.count) { bgS(t, '#08061c', '#120c30', 'rgba(200,170,255,.07)'); txt('FOTOLUMINISCENCIA', 360, 70, 48, '#fff'); const k1 = sr(t, M.science + 1.6, M.science + 3.0), k2 = sr(t, M.science + 3.6, M.science + 5.0);
      wave2D(40, 300, 260, 22, .16, '#a060ff', t, k1); txt('UV', 150, 200, 44, vi); circ(360, 300, 60, '#2a6a5a', k2 > 0 ? '#5aff9a' : null); wave2D(420, 690, 380, 26, .07, '#5affc0', t, k2); txt('VERDE AZULADO', 540, 460, 34, '#9affd8');
      sg.globalAlpha = sr(t, M.science + 2.0, M.science + 2.6); txt('ABSORBE', 170, 340, 34, '#fff'); sg.globalAlpha = k2; txt('DEVUELVE', 550, 300, 34, '#fff'); sg.globalAlpha = 1; pill('OTRO COLOR', 360, 620, '#1a4a3a', '#fff', 42) }
    else if (t < M.why) { bgS(t, '#060a1a', '#0e1630', 'rgba(184,255,176,.06)'); txt('PARA CONTARLOS', 360, 70, 56, gr); const k = ramp(t, M.count + 1.6, M.count + 4.0);
      sg.strokeStyle = 'rgba(255,255,255,.3)'; sg.lineWidth = 6; sg.setLineDash([14, 14]); sg.beginPath(); sg.moveTo(60, 500); sg.bezierCurveTo(200, 300, 520, 640, 660, 340); sg.stroke(); sg.setLineDash([]);
      for (let i = 0; i < 12; i++) { if (i / 12 < k) circ(60 + i * 54, 200, 16, '#c8a0ff', '#8a4aff') } txt(Math.min(12, Math.ceil(k * 12)) + ' CAMINATAS', 360, 260, 40, vi);
      const k2 = ss(ramp(t, M.count + 3.0, M.count + 4.6)); sg.globalAlpha = cl(k2 * 3); txt(Math.round(20 * k2) + ' VECES', 360, 450, 92, '#fff', { glow: '#2aff8a' }); txt('LOS ENCONTRARON', 360, 530, 38, gold); sg.globalAlpha = 1; porc2D(560, 640, .35, t, 1) }
    else { bgS(t, '#1a1406', '#2e2408', 'rgba(255,217,90,.07)'); txt('¿PARA QUÉ?', 360, 80, 84, gold, { glow: '#ff9a00' }); stampMark('NO SE SABE', 360, 210, ramp(t, M.why + 1.2, M.why + 1.8), '#ff5a5a', -.05, 52); porc2D(230, 420, .55, t, 1); porc2D(500, 420, .55, t, 1, { flip: 1 });
      sg.globalAlpha = sr(t, M.why + 3.0, M.why + 3.6); txt('¿PARA VERSE DE NOCHE?', 360, 560, 38, '#fff'); sg.globalAlpha = sr(t, Ln.p7.end - 2.2, Ln.p7.end - 1.6); pill('ECOSUR · MÉXICO', 360, 650, '#5a3a0a', '#fff', 40); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(184,255,176,.55)');
  }
  const tc = [.4, 2.6, -5];
  const K = autoK([[0, [3.2, 3.0, -1.6], tc, 46], [M.title - .3, [-2.8, 3.2, -1.8], tc, 48], [M.title + .9, [0, 4.2, 7.8], [0, 4.8, -2], 60]],
    [M.who, M.torch, M.glow, M.twenty, M.science, M.count, M.why],
    [[near(tc, [2.6, .8, 3.0], 46), near(tc, [-2.4, 1.0, 3.0], 46), 2.4], null, [near(tc, [1.6, .6, 2.4], 42), near(tc, [.6, .8, 2.2], 40), 2.6], null, null, [[[8, 5, 6], tc, 56], [[-8, 6, 6], tc, 56], 2.4], null],
    [[M.endcard, [3.0, 3.2, -1.4], tc, 48], [C.dur, [-2.8, 3.4, -1.6], tc, 50]]);
  frame = function (t) {
    const uv = Math.max(sr(t, .6, 1.4) * (1 - sr(t, M.title - .2, M.title + .4)), sr(t, Ln.p2.end - 2.2, Ln.p2.end - 1.4)); const gl = Math.max(sr(t, .9, 1.6) * (1 - sr(t, M.title - .2, M.title + .4)), sr(t, M.glow, M.glow + 1.0));
    uvL.intensity = 50 * uv; BEAM.material.opacity = .16 * uv; const bp = uvL.position, tg = PO.position; BEAM.position.copy(bp).lerp(tg, .5); BEAM.lookAt(tg); BEAM.rotateX(-PI / 2);
    bodyM.emissiveIntensity = .1 * gl; headM.emissiveIntensity = .35 * gl; quillM.emissiveIntensity = .3 * gl; bodyM.color.setHex(gl > .5 ? 0x24382e : 0x4a3424); headM.color.setHex(gl > .5 ? 0x3a6a50 : 0x6a4a34); quillM.color.setHex(gl > .5 ? 0x4aa878 : 0xe0c060); PG.material.opacity = .28 * gl;
    PO.position.x = .4 + Math.sin(t * .4) * .25; PO.rotation.y = Math.sin(t * .4) * .15; hd.position.y = .04 + Math.sin(t * 1.4) * .02; TAIL.rotation.z = -.6 + Math.sin(t * 1.1) * .15;
    FF.forEach((f, i) => { f.position.set((hash(i * 2) - .5) * 20 + Math.sin(t * .5 + i) * 1.2, 1 + hash(i * 3) * 5 + Math.sin(t * .8 + i * 2) * .4, -4 - hash(i * 5) * 14); f.material.opacity = .4 + .4 * Math.sin(t * 3 + i * 1.7) });
    STARS.rotation.y = t * .002;
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(120,80,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.torch, M.glow, M.twenty, M.science, M.count, M.why]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿SABÍAS QUE HAY<br>ANIMALES QUE BRILLAN?', qs: 90, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
function ship2D(x, y, s, t, o = {}) { sg.save(); sg.translate(x, y); sg.rotate(o.tilt || Math.sin(t * 1.2) * .03); sg.scale(s, s); const segs = o.segs;
  sg.strokeStyle = '#5a3a20'; sg.lineWidth = 8; sg.beginPath(); sg.moveTo(0, -20); sg.lineTo(0, -230); sg.stroke(); sg.fillStyle = '#f0e2c0'; sg.beginPath(); sg.moveTo(-90, -210); sg.quadraticCurveTo(0, -190, 90, -210); sg.lineTo(100, -60); sg.quadraticCurveTo(0, -40, -100, -60); sg.closePath(); sg.fill(); sg.fillStyle = 'rgba(180,60,40,.6)'; sg.fillRect(-96, -150, 192, 18);
  const hull = (c) => { sg.fillStyle = c; sg.beginPath(); sg.moveTo(-200, -30); sg.lineTo(200, -30); sg.quadraticCurveTo(190, 40, 120, 50); sg.lineTo(-130, 50); sg.quadraticCurveTo(-200, 30, -220, -50); sg.closePath(); sg.fill() };
  hull(o.hull || '#6a4424'); if (segs) { const cols = ['#c0602a', '#3a2214', '#8a5a2a', '#e0a040']; sg.save(); sg.beginPath(); sg.moveTo(-200, -30); sg.lineTo(200, -30); sg.quadraticCurveTo(190, 40, 120, 50); sg.lineTo(-130, 50); sg.quadraticCurveTo(-200, 30, -220, -50); sg.closePath(); sg.clip();
    sg.globalAlpha = segs; sg.fillStyle = '#4a7aaa'; sg.fillRect(-230, -60, 300, 120); for (let i = 0; i < 3; i++) { sg.fillStyle = cols[i + 1]; sg.fillRect(70 + i * 44, -60, 44, 120) } sg.restore() }
  sg.strokeStyle = 'rgba(0,0,0,.3)'; sg.lineWidth = 3; for (let i = 0; i < 3; i++) { sg.beginPath(); sg.moveTo(-200 + i * 6, -14 + i * 20); sg.lineTo(190 - i * 20, -14 + i * 20); sg.stroke() }
  for (let i = 0; i < 4; i++) { const ax = -120 + i * 60; sg.fillStyle = '#c87a4a'; sg.beginPath(); sg.ellipse(ax, -46, 12, 18, 0, 0, 7); sg.fill(); sg.fillRect(ax - 4, -70, 8, 10) } sg.restore() }
function sea2D(y, t, col = '#1a4a7a') { sg.fillStyle = col; sg.beginPath(); sg.moveTo(0, 720); for (let x = 0; x <= 720; x += 12) sg.lineTo(x, y + Math.sin(x * .03 + t * 2) * 8); sg.lineTo(720, 720); sg.fill() }
function pollen2D(x, y, r, col, t, kind = 0) { sg.save(); sg.translate(x, y); sg.rotate(t * .4 + x); circ(0, 0, r, col, col); sg.fillStyle = 'rgba(0,0,0,.25)'; if (kind == 0) { for (const sx of [-1, 1]) { sg.beginPath(); sg.ellipse(sx * r * .9, -r * .2, r * .6, r * .5, 0, 0, 7); sg.fillStyle = col; sg.fill() } } else { for (let i = 0; i < 10; i++) { const a = i * PI / 5; circ(Math.cos(a) * r * .65, Math.sin(a) * r * .65, r * .12, 'rgba(0,0,0,.25)') } } sg.restore() }
function adriatic2D(k, t) { sg.fillStyle = '#4a6a3a'; sg.beginPath(); [[0, 220], [120, 180], [260, 250], [380, 330], [470, 420], [560, 520], [620, 560], [720, 600], [720, 720], [0, 720]].forEach(([a, b], i) => i ? sg.lineTo(a, b) : sg.moveTo(a, b)); sg.fill(); // Italy side (bottom-left)
  sg.fillStyle = '#5a7a44'; sg.beginPath(); [[200, 0], [260, 60], [330, 90], [420, 160], [520, 230], [620, 300], [720, 330], [720, 0]].forEach(([a, b], i) => i ? sg.lineTo(a, b) : sg.moveTo(a, b)); sg.fill(); // Croatian coast (top-right)
  for (let i = 0; i < 9; i++) { sg.fillStyle = '#6a8a4a'; sg.beginPath(); sg.ellipse(300 + i * 34, 140 + i * 18 + hash(i) * 20, 16, 7, .6, 0, 7); sg.fill() } }
// ==================================================================================== PART 3 — EL BARCO ROMANO (Mediterráneo al atardecer, dorado y azul)
if (P == 3) {
  skyDome('#2a2a6a', '#e87a4a', '#ffd08a'); scene.background = new THREE.Color(0xf0a070); scene.fog = new THREE.Fog(0xf0a878, 50, 180);
  hemi.color.setHex(0xffd8b0); hemi.groundColor.setHex(0x2a3a5a); hemi.intensity = 1.0; R.toneMappingExposure = 1.0;
  const sun = new THREE.DirectionalLight(0xffb070, 2.6); sun.position.set(-30, 10, -40); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 120 }); scene.add(sun);
  glowSprite(scene, 0xfff0c0, 16, -60, 6, -120); glowSprite(scene, 0xffa060, 60, -60, 6, -120).material.opacity = .45;
  // animated sea
  const sG = new THREE.PlaneGeometry(260, 220, 90, 80); sG.rotateX(-PI / 2); const sp = sG.attributes.position, base = Float32Array.from(sp.array);
  const SEA = add(scene, sG, new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: .25, metalness: .1, flatShading: true }), 0, 0, -20, 2);
  for (let i = 0; i < 6; i++) { const rk = add(scene, rockGeo(i + 30, 2), mat(0x6a6a5a), -70 + i * 26, -1, -100 - hash(i) * 20, 0); rk.scale.set(10 + hash(i) * 10, 4 + hash(i * 2) * 5, 6) }
  // the ship (stylised, original)
  const SH = grp(scene); const woodM = new THREE.MeshStandardMaterial({ color: 0x6a4424, roughness: .8 }), tarM = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: .4, metalness: .1 });
  const hullG = new THREE.SphereGeometry(1, 32, 16, 0, 2 * PI, PI / 2, PI / 2); const HU = add(SH, hullG, tarM, 0, .2, 0, 1); HU.scale.set(4.2, 1.3, 1.25);
  const deck = add(SH, new THREE.CircleGeometry(1, 32), woodM, 0, .21, 0, 2); deck.rotation.x = -PI / 2; deck.scale.set(4.2, 1.25, 1);
  for (const z of [-1.2, 1.2]) box(SH, 8.0, .25, .08, woodM, 0, .3, z * .98, 1);
  const st_ = add(SH, G.cyl, woodM, -4.0, .9, 0, 1); st_.scale.set(.12, 1.6, .12); st_.rotation.z = .5; const bw = add(SH, G.cyl, woodM, 4.1, .8, 0, 1); bw.scale.set(.1, 1.4, .1); bw.rotation.z = -.6;
  const mast = add(SH, G.cyl, woodM, 0, 3.0, 0, 1); mast.scale.set(.1, 5.6, .1); const yard = add(SH, G.cyl, woodM, 0, 5.4, 0, 1); yard.scale.set(.06, 4.4, .06); yard.rotation.x = PI / 2;
  const sailT = tex(256, 256, (g, w, h) => { g.fillStyle = '#f0e2c0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(170,60,40,.65)'; g.fillRect(0, 100, w, 26); speck(g, w, h, 1500, .08, '90,70,40') });
  const sailG = new THREE.PlaneGeometry(4.2, 3.4, 12, 8); const sailP = sailG.attributes.position, sailB = Float32Array.from(sailP.array); const SAIL = add(SH, sailG, new THREE.MeshStandardMaterial({ map: sailT, side: THREE.DoubleSide, roughness: .9 }), 0, 3.65, .12, 1); SAIL.rotation.y = PI / 2;
  const ampM = new THREE.MeshStandardMaterial({ color: 0xc87a4a, roughness: .7 }); const ampG = new THREE.LatheGeometry([[0, 0], [.12, .05], [.2, .3], [.2, .5], [.1, .7], [.06, .8], [.08, .85], [0, .86]].map(([a, b]) => new THREE.Vector2(a, b)), 12);
  for (let i = 0; i < 10; i++) { const a = add(SH, ampG, ampM, -2.6 + (i % 5) * 1.0 + (i > 4 ? .5 : 0), .22, i > 4 ? .45 : -.45, 1); a.scale.setScalar(.9) }
  for (let i = 0; i < 8; i++) for (const z of [-1, 1]) { const o = add(SH, G.cyl, woodM, -2.4 + i * .7, -.1, z * 1.6, 0); o.scale.set(.04, 1.4, .04); o.rotation.x = z * 1.1 }
  SH.position.set(0, 0, -8); const GULL = []; for (let i = 0; i < 6; i++) { const g = grp(scene); for (const s of [-1, 1]) { const w = box(g, .5, .02, .12, basic(0x2a2a2a), s * .25, 0, 0, 0); w.userData.s = s } GULL.push(g) }
  makePanel(V(0, 6.0, -2), 0, 4.2, 0xffd8a0, 0xff8a3a);
  function draw(t) {
    const gold = '#ffd95a', sa = '#ffd8a0', bl = '#9ac8ff';
    if (t < M.ship) { bgS(t, '#2a1208', '#4a1e0a', 'rgba(255,216,160,.07)'); txt('HUNDIDO HACE', 360, 70, 56, sa); txt('2.200 AÑOS', 360, 140, 76, '#fff', { glow: '#ff8a2a' }); const k = ss(ramp(t, 1.2, 3.6)); sea2D(380, t); ship2D(360, 330 + 220 * k, .9, t, { tilt: .25 * k }); stampMark('¿UN SECRETO?', 360, 640, ramp(t, 2.6, 3.2), gold, -.05, 48) }
    else if (t < M.tar) { bgS(t, '#0a1e36', '#14325a', 'rgba(154,200,255,.07)'); adriatic2D(1, t); txt('ILOVIK-PARŽINE 1', 360, 70, 52, '#fff', { glow: '#000', blur: 20 }); const k = sr(t, M.ship + 2.0, M.ship + 2.8); circ(470, 210, 14 + 6 * Math.sin(t * 5), '#ff4a3a', '#ff2a1a');
      sg.globalAlpha = k; pill('CROACIA', 560, 150, '#7a2a1a', '#fff', 36); sg.globalAlpha = sr(t, Ln.r1.end - 1.6, Ln.r1.end - 1.0); stampMark('HALLADO EN 2016', 360, 600, ramp(t, Ln.r1.end - 1.6, Ln.r1.end - 1.0), gold, -.05, 44); sg.globalAlpha = 1; txt('ITALIA', 140, 470, 36, 'rgba(255,255,255,.8)') }
    else if (t < M.wax) { bgS(t, '#1a0e06', '#2e1a0a', 'rgba(255,216,160,.07)'); txt('BREA DE PINO', 360, 70, 66, sa); ship2D(360, 330, 1.0, t, { hull: '#2a1a10' }); const k = sr(t, M.tar + .6, M.tar + 2.0); sg.fillStyle = `rgba(20,10,4,${.8 * k})`; sg.beginPath(); sg.roundRect(140, 290, 440, 90 * k, 20); sg.fill();
      sea2D(400, t, 'rgba(30,80,130,.85)'); for (let i = 0; i < 6; i++) { const w = (t * .7 + i / 6) % 1; cross(160 + i * 80, 470 + w * 40, 10, '#9ac8ff', 1) } pill('NO ENTRA AGUA', 360, 630, '#5a3a14', '#fff', 42) }
    else if (t < M.pollen) { bgS(t, '#1e1406', '#36240a', 'rgba(255,217,90,.07)'); txt('10 MUESTRAS', 360, 70, 66, sa); const n = Math.min(10, Math.floor(ramp(t, M.wax + .3, M.wax + 1.8) * 10)); for (let i = 0; i < 10; i++) { const x = 90 + (i % 5) * 135, y = 200 + Math.floor(i / 5) * 150, sp_ = i == 7 && t > M.wax + 2.6;
        sg.fillStyle = i < n ? (sp_ ? '#e0a040' : '#9a6a3a') : 'rgba(255,255,255,.12)'; sg.beginPath(); sg.roundRect(x - 34, y - 50, 68, 100, 14); sg.fill(); if (sp_) { sg.strokeStyle = gold; sg.lineWidth = 6; sg.strokeRect(x - 42, y - 58, 84, 116) } }
      sg.globalAlpha = sr(t, M.wax + 2.8, M.wax + 3.4); txt('BREA + CERA DE ABEJA', 360, 520, 40, gold); sg.globalAlpha = 1; stampMark('ZOPISSA', 360, 630, ramp(t, Ln.r3.end - 1.4, Ln.r3.end - .8), '#ff7a3a', -.05, 64) }
    else if (t < M.batches) { bgS(t, '#0e1a0a', '#1a2e12', 'rgba(200,255,160,.07)'); txt('POLEN ATRAPADO', 360, 70, 60, '#d8ffb0'); const names = [['PINO', '#e0d060', 0], ['ENCINA', '#c8a050', 1], ['OLIVO', '#a8c070', 1], ['AVELLANO', '#e0b060', 1], ['ABETO', '#d0e090', 0], ['HAYA', '#c8b080', 1]];
      names.forEach(([s, c, kd], i) => { const t0 = M.pollen + (i < 4 ? 1.0 + i * .9 : 4.6 + (i - 4) * .6); const k = sr(t, t0, t0 + .4); if (k <= 0) return; sg.globalAlpha = k; const x = 140 + (i % 3) * 220, y = 220 + Math.floor(i / 3) * 230; pollen2D(x, y, 52, c, t, kd); txt(s, x, y + 90, 34, '#fff'); sg.globalAlpha = 1 });
      sg.globalAlpha = sr(t, Ln.r4.end - 1.8, Ln.r4.end - 1.2); pill('DE MONTAÑA', 360, 660, '#2a4a1a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.map) { bgS(t, '#14100a', '#261c10', 'rgba(255,216,160,.07)'); const k = ss(ramp(t, M.batches + 1.0, M.batches + 2.6)); txt(k > .5 ? '4 O 5 TANDAS' : 'TANDAS DE BREA', 360, 70, 60, sa); ship2D(360, 330, 1.25, t, { segs: k, tilt: 0 });
      sg.globalAlpha = sr(t, M.batches + 3.8, M.batches + 4.4); txt('PROA: 3', 520, 470, 46, gold); arrow(520, 430, 560, 380, gold, 1); sg.globalAlpha = 1; stampMark('REPARACIONES', 360, 620, ramp(t, Ln.r5.end - 1.8, Ln.r5.end - 1.2), '#ff7a3a', -.05, 50) }
    else if (t < M.pub) { bgS(t, '#0a1e36', '#14325a', 'rgba(154,200,255,.07)'); adriatic2D(1, t); txt('LA RUTA', 360, 66, 62, '#fff', { glow: '#000', blur: 20 }); circ(210, 560, 14, gold, gold); txt('BRINDISI', 210, 620, 34, '#fff'); const k = sr(t, M.map + 3.0, M.map + 4.6);
      circ(470, 210, 14, '#ff4a3a', '#ff2a1a'); sg.strokeStyle = gold; sg.lineWidth = 6; sg.setLineDash([16, 12]); sg.beginPath(); sg.moveTo(210, 560); sg.quadraticCurveTo(300, 300, lerp(210, 470, k), lerp(560, 210, k)); sg.stroke(); sg.setLineDash([]); sg.globalAlpha = sr(t, M.map + .8, M.map + 1.4); pill('ITALIA', 200, 420, '#1a3a6a', '#fff', 34); sg.globalAlpha = 1 }
    else { bgS(t, '#24120a', '#3e1e10', 'rgba(255,217,90,.07)'); txt('PRIMERA VEZ', 360, 90, 78, gold, { glow: '#ff9a00', blur: 30 }); txt('QUÍMICA', 210, 260, 46, '#fff'); txt('+', 360, 260, 60, gold); txt('POLEN', 500, 260, 46, '#fff'); pollen2D(500, 380, 50, '#e0d060', t, 0); circ(210, 390, 44, '#3a2214', '#8a5a2a');
      sg.globalAlpha = sr(t, Ln.r7.end - 2.6, Ln.r7.end - 2.0); pill('FRONTIERS IN MATERIALS', 360, 580, '#5a2a0a', '#fff', 36); txt('EQUIPO DE FRANCIA Y CROACIA', 360, 660, 26, '#ffd8b0', { w: 700 }); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,216,160,.6)');
  }
  const tc = [0, 1.6, -8];
  const K = autoK([[0, [16, 3, -4], tc, 50], [M.title - .3, [-14, 3.5, -4], tc, 52], [M.title + .9, [0, 4.6, 7.8], [0, 5.2, -2], 60]],
    [M.ship, M.tar, M.wax, M.pollen, M.batches, M.map, M.pub],
    [[[[22, 9, 10], tc, 54], [[-20, 10, 10], tc, 54], 2.4], [near(tc, [8, 1, 9], 50), near(tc, [-8, 1.5, 9], 50), 2.4], null, null, [near(tc, [12, 6, 10], 52), near(tc, [14, 5, 6], 52), 2.6], [[[0, 18, 16], tc, 56], [[-8, 16, 14], tc, 56], 2.4], null],
    [[M.endcard, [16, 5, 4], tc, 52], [C.dur, [-16, 6, 4], tc, 54]]);
  frame = function (t) {
    for (let i = 0; i < sp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; sp.setY(i, .25 * Math.sin(x * .25 + t * 1.3) + .18 * Math.sin(z * .3 - t * 1.7) + .08 * Math.sin((x + z) * .8 + t * 2.4)) } sp.needsUpdate = true; sG.computeVertexNormals();
    SH.position.y = .12 * Math.sin(t * 1.3); SH.rotation.z = .035 * Math.sin(t * 1.1); SH.rotation.x = .02 * Math.sin(t * .9); SH.position.x = Math.sin(t * .2) * .3;
    for (let i = 0; i < sailP.count; i++) { const x = sailB[i * 3], y = sailB[i * 3 + 1]; sailP.setZ(i, .35 * (1 - (x / 2.1) ** 2) * (1 - (y / 1.7) ** 2 * .3) + .04 * Math.sin(t * 3 + y)) } sailP.needsUpdate = true;
    GULL.forEach((g, i) => { const a = t * .3 + i * 1.1; g.position.set(Math.cos(a) * (8 + i), 8 + i * .6 + Math.sin(t + i) * .3, -14 + Math.sin(a) * 6); g.rotation.y = -a; g.children.forEach(w => w.rotation.z = w.userData.s * Math.sin(t * 6 + i) * .4) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.ship - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,140,60,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.ship, M.tar, M.wax, M.pollen, M.batches, M.map, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿BUCEARÍAS HASTA<br>UN BARCO HUNDIDO?', qs: 95, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>historia</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

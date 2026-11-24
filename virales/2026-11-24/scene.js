// Virales 24/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: la estrella que se tragó a otra (Andrómeda) · p2: la arañita con más ADN que vos · p3: ladrillos de polvo lunar que encastran
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'SE TRAGÓ<br>UNA ESTRELLA', ts: 120, tag: 'ESPACIO<b>NUEVO ESTUDIO</b>', sub: 'EN ANDRÓMEDA', spk: { n: ['#ffb0f0', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'MÁS ADN<br>QUE VOS', ts: 150, tag: 'ANIMALES<b>CIENCIA</b>', sub: 'DE CALIFORNIA', spk: { n: ['#ffe08a', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'LADRILLOS<br>DE LUNA', ts: 140, tag: 'ESPACIO<b>INVENTO</b>', sub: 'POLVO LUNAR + LÁSER', spk: { n: ['#9ae8ff', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — LA ESTRELLA QUE SE TRAGÓ A OTRA (Andrómeda, violeta y naranja)
if (P == 1) {
  scene.background = new THREE.Color(0x0a0418); scene.fog = null; const STARS = starField(5000, 140, -1, 1.0, .3);
  hemi.color.setHex(0xffd8f0); hemi.groundColor.setHex(0x201030); hemi.intensity = 1.0; R.toneMappingExposure = 1.2;
  const GAL = new THREE.Sprite(new THREE.SpriteMaterial({ map: galT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, opacity: .9 })); GAL.position.set(-40, 18, -90); GAL.scale.set(70, 70, 1); scene.add(GAL);
  const NEB = []; for (let i = 0; i < 8; i++) { const n = glowSprite(scene, [0x8a3aff, 0xff4aa8, 0x3a6aff][i % 3], 30 + hash(i) * 30, (hash(i * 2) - .5) * 120, (hash(i * 3) - .5) * 60, -60 - hash(i * 4) * 40); n.material.opacity = .12; NEB.push(n) }
  const SC = [6, 0, -16];
  const BIG = sph(scene, 2.0, new THREE.MeshBasicMaterial({ color: 0xffa050, fog: false }), ...SC); const BIGG = glowSprite(scene, 0xff8a3a, 9, ...SC); BIGG.material.opacity = .7;
  const LIT = sph(scene, .6, new THREE.MeshBasicMaterial({ color: 0xfff0a0, fog: false }), 0, 0, 0); const LITG = glowSprite(scene, 0xffe080, 3, 0, 0, 0);
  const FLARE = glowSprite(scene, 0xffffff, 1, ...SC); FLARE.material.opacity = 0;
  const ND = 900, dp = new Float32Array(ND * 3), dv = []; for (let i = 0; i < ND; i++) { const th = hash(i * 1.1) * 2 * PI, ph = Math.acos(2 * hash(i * 2.3) - 1); dv.push(V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)).multiplyScalar(.6 + hash(i * 5.5) * .4)) }
  const dG = new THREE.BufferGeometry(); dG.setAttribute('position', new THREE.BufferAttribute(dp, 3)); const DUSTM = new THREE.PointsMaterial({ size: .35, map: radT, color: 0xff9a60, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }); scene.add(new THREE.Points(dG, DUSTM));
  makePanel(V(0, 4.4, 0), 0, 4.4, 0xffb0f0, 0xc04aff);
  function draw(t) {
    const gold = '#ffd95a', pk = '#ffb0f0', or = '#ffa050';
    if (t < M.andro) { bgS(t, '#140626', '#2a0c40', 'rgba(255,176,240,.07)'); txt('UNA ESTRELLA', 360, 70, 56, pk); txt('SE TRAGÓ A OTRA', 360, 135, 56, '#fff');
      const k = ss(ramp(t, .3, 4.2)); circ(360, 400, 110, or, '#ff6a2a'); const a = t * 3, r = 230 * (1 - k) + 20; if (k < .97) circ(360 + Math.cos(a) * r, 400 + Math.sin(a) * r * .5, 30, '#fff0a0', '#ffe080'); if (k > .9) burst(360, 400, 200, 'rgba(255,240,200,.8)', t) }
    else if (t < M.big) { bgS(t, '#0c0620', '#1e0e3a', 'rgba(255,176,240,.07)'); txt('ANDRÓMEDA', 360, 80, 88, '#fff', { glow: '#c04aff', blur: 36 }); galaxy2D(360, 360, 1.9, t);
      const k = sr(t, M.andro + 1.0, M.andro + 1.6); sg.globalAlpha = k; pill('GALAXIA VECINA', 360, 580, '#4a1a6a', '#fff', 44); sg.globalAlpha = sr(t, Ln.d1.end - 1.2, Ln.d1.end - .6); txt('APODO: «BAO»', 360, 665, 46, gold); sg.globalAlpha = 1 }
    else if (t < M.little) { bgS(t, '#200a06', '#3a1408', 'rgba(255,160,80,.08)'); txt('BIG BAO', 360, 70, 80, or, { glow: '#ff6a2a', blur: 30 }); const k = ss(ramp(t, M.big + .5, M.big + 1.6)); circ(180, 330, 110 * k + 1, or, '#ff6a2a');
      txt('≈ ' + Math.round(7 * k), 500, 250, 120, '#fff', { glow: '#ff6a2a' }); txt('MASAS DEL SOL', 500, 330, 34, gold); const k2 = ss(ramp(t, M.big + 2.6, M.big + 4.2)); sg.globalAlpha = cl(k2 * 4); txt(fmt(18000 * k2), 360, 560, 110, '#fff', { glow: '#ffb000', blur: 30 }); txt('VECES EL BRILLO DEL SOL', 360, 650, 36, gold); sg.globalAlpha = 1 }
    else if (t < M.spiral) { bgS(t, '#1a1606', '#2e2808', 'rgba(255,240,160,.07)'); txt('LITTLE BAO', 360, 70, 80, '#fff0a0', { glow: '#ffd040', blur: 30 }); const k = ss(ramp(t, M.little + .4, M.little + 1.4)); circ(360, 300, 60 * k + 1, '#fff0a0', '#ffe080');
      txt('0,7', 360, 460, 120, '#fff', { glow: '#ffb000' }); txt('MASAS DEL SOL', 360, 540, 38, gold); const k2 = sr(t, M.little + 2.0, M.little + 3.0); txt('BIG', 60, 615, 30, or, { a: 'left' }); bar(150, 598, 510, 32, k2, or); txt('LITTLE', 60, 670, 30, '#fff0a0', { a: 'left' }); bar(150, 653, 510, 32, .1 * k2, '#fff0a0') }
    else if (t < M.flash) { bgS(t, '#120a24', '#24103e', 'rgba(255,176,240,.07)'); txt('EN ESPIRAL', 360, 70, 60, pk); const k = ss(ramp(t, M.spiral + .4, M.spiral + 5.0)), n = 7 * k, a = n * 2 * PI, r = 200 * (1 - k * .85);
      circ(360, 330, 70, or, '#ff6a2a'); sg.strokeStyle = 'rgba(255,240,160,.35)'; sg.lineWidth = 3; sg.beginPath(); for (let i = 0; i <= 120; i++) { const q = i / 120 * k, aa = q * 7 * 2 * PI, rr = 200 * (1 - q * .85); sg.lineTo(360 + Math.cos(aa) * rr, 330 + Math.sin(aa) * rr * .6) } sg.stroke(); circ(360 + Math.cos(a) * r, 330 + Math.sin(a) * r * .6, 22, '#fff0a0', '#ffe080');
      txt(Math.floor(n) + ' VUELTAS', 360, 560, 76, '#fff', { glow: '#c04aff' }); txt('≈ 7 AÑOS', 360, 630, 44, gold); stampMark('OTRAS: MILES', 360, 470, ramp(t, Ln.d4.end - 1.4, Ln.d4.end - .8), '#ff5a8a', -.08, 50) }
    else if (t < M.webb) { const k = ramp(t, M.flash + 2.4, M.flash + 4.0); bgS(t, k > .1 ? '#3a1a10' : '#140a20', k > .1 ? '#5a2a10' : '#240e3a', 'rgba(255,220,180,.08)'); txt('17 OCT 2025', 360, 70, 64, '#fff');
      circ(360, 360, 60 + 180 * ss(k), '#fff8e0', '#ffb060'); if (k > 0) burst(360, 360, 120 + 220 * ss(k), 'rgba(255,200,120,.7)', t); sg.globalAlpha = sr(t, Ln.d5.end - 1.8, Ln.d5.end - 1.2); pill('BRILLO MÁXIMO: 1 SEMANA', 360, 640, '#6a2a10', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.dust) { bgS(t, '#060a20', '#0c1640', 'rgba(160,200,255,.07)'); txt('JAMES WEBB', 360, 70, 76, '#fff', { glow: '#4a8aff', blur: 30 });
      for (let i = 0; i < 7; i++) { const a = i / 6 * 2 * PI, hx = i ? 360 + Math.cos(a) * 64 : 360, hy = i ? 260 + Math.sin(a) * 64 : 260; sg.fillStyle = '#e0b040'; sg.beginPath(); for (let j = 0; j < 6; j++) sg.lineTo(hx + Math.cos(j * PI / 3 + PI / 6) * 34, hy + Math.sin(j * PI / 3 + PI / 6) * 34); sg.closePath(); sg.fill() }
      const k = ss(ramp(t, M.webb + .3, M.webb + 1.8)); txt(Math.round(47 * k) + ' DÍAS', 360, 450, 100, '#fff', { glow: '#ffb000' }); txt('DESPUÉS · INFRARROJO', 360, 525, 38, '#a8c8ff'); stampMark('NUNCA TAN PRONTO', 360, 640, ramp(t, Ln.d6.end - 1.4, Ln.d6.end - .8), gold, -.05, 46) }
    else { bgS(t, '#1a0a14', '#341424', 'rgba(255,176,200,.07)'); txt('LO QUE QUEDÓ', 360, 70, 60, pk); circ(360, 330, 60, '#ffd0a0', '#ff8a3a'); for (let i = 0; i < 260; i++) { const a = hash(i * 1.3) * 2 * PI, r = 110 + hash(i * 2.1) * 120 + Math.sin(t + i) * 4; sg.fillStyle = `rgba(255,${140 + hash(i) * 80 | 0},90,${.3 + hash(i * 4) * .5})`; sg.fillRect(360 + Math.cos(a) * r, 330 + Math.sin(a) * r * .8, 4, 4) }
      txt('POLVO DE CIENTOS DE AÑOS', 360, 545, 40, '#fff'); sg.globalAlpha = sr(t, Ln.d7.end - 2.0, Ln.d7.end - 1.4); pill('REVISTA NATURE', 360, 640, '#5a1a3a', '#fff', 42); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,176,240,.6)');
  }
  const K = autoK([[0, [SC[0] + 7, SC[1] + 2, SC[2] + 11], SC, 50], [M.title - .3, [SC[0] - 6, SC[1] + 3, SC[2] + 12], SC, 52], [M.title + .9, [0, 3.4, 12], [0, 4.0, 0], 60]],
    [M.andro, M.big, M.little, M.spiral, M.flash, M.webb, M.dust],
    [[[[-10, 8, 8], [-40, 18, -90], 50], [[-4, 10, 4], [-40, 18, -90], 46], 2.4], [near(SC, [5, 1, 8], 46), near(SC, [-3, 1.5, 9], 48), 2.2], null, [near(SC, [0, 9, 9], 56), near(SC, [3, 8, 10], 56), 2.8],
     [near(SC, [6, 2, 12], 54), near(SC, [-6, 3, 13], 56), 2.8], null, [near(SC, [8, 2, 14], 56), near(SC, [-7, 3, 14], 56), 2.4]],
    [[M.endcard, [SC[0] - 8, SC[1] + 4, SC[2] + 14], SC, 56], [C.dur, [SC[0] - 11, SC[1] + 5, SC[2] + 16], SC, 58]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; GAL.material.rotation = t * .01;
    const k = cl((t - M.spiral) / (M.flash + 2.6 - M.spiral)), r = t < M.spiral ? 4.2 : lerp(4.2, 0, ss(k)), a = t * (1.0 + 3 * k);
    LIT.position.set(SC[0] + Math.cos(a) * r, SC[1] + Math.sin(a) * r * .25, SC[2] + Math.sin(a) * r); LITG.position.copy(LIT.position); const gone = t > M.flash + 2.6; LIT.visible = LITG.visible = !gone;
    const fk = ramp(t, M.flash + 2.4, M.flash + 4.5), fd = 1 - ramp(t, M.flash + 4.5, M.webb + 3); FLARE.scale.setScalar(2 + 40 * ss(fk)); FLARE.material.opacity = gone ? .9 * fd : 0;
    BIG.scale.setScalar(1 + .25 * ss(fk) - .1 * Math.sin(t * 2) * .1); BIGG.scale.setScalar(9 + 6 * ss(fk) + Math.sin(t * 2) * .4);
    const dk = ramp(t, M.flash + 3, C.dur), p = dG.attributes.position; for (let i = 0; i < ND; i++) { const s = 3 + 9 * dv[i].length() * ss(dk) * 1.4; p.setXYZ(i, SC[0] + dv[i].x * s, SC[1] + dv[i].y * s, SC[2] + dv[i].z * s) } p.needsUpdate = true; DUSTM.opacity = .8 * ramp(t, M.flash + 3, M.webb);
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.andro - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(200,80,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.andro, M.big, M.little, M.spiral, M.flash, M.webb, M.dust]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿TE GUSTARÍA<br>VERLO?', qs: 120, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 2 — LA ARAÑITA CON MÁS ADN QUE VOS (dunas de la costa al atardecer, dorado y turquesa)
if (P == 2) {
  skyDome('#3a5aa8', '#ffb07a', '#ffe0b0'); scene.background = new THREE.Color(0xffd0a0); scene.fog = new THREE.Fog(0xffd2a8, 25, 140);
  hemi.color.setHex(0xfff0dc); hemi.groundColor.setHex(0x6a5030); hemi.intensity = 1.4; R.toneMappingExposure = 1.08;
  const sun = new THREE.DirectionalLight(0xffc890, 2.6); sun.position.set(-20, 9, -14); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 80 }); scene.add(sun);
  glowSprite(scene, 0xfff0c0, 16, -80, 10, -70); glowSprite(scene, 0xff9a50, 60, -80, 10, -70).material.opacity = .4;
  const sea = add(scene, new THREE.PlaneGeometry(600, 300), new THREE.MeshStandardMaterial({ color: 0x3a7aa0, roughness: .2, metalness: .5 }), 0, -.6, -160); sea.rotation.x = -PI / 2;
  const dG = new THREE.PlaneGeometry(240, 200, 120, 100); dG.rotateX(-PI / 2); const dp = dG.attributes.position; for (let i = 0; i < dp.count; i++) { const x = dp.getX(i), z = dp.getZ(i); const d = Math.hypot(x, z); dp.setY(i, (d < 4 ? 0 : 1) * (1.6 * Math.sin(x * .09 + z * .05) + 1.0 * Math.sin(x * .21 - z * .13 + 1) + .5 * Math.sin(z * .3)) * cl((d - 4) / 10) - .02) } dG.computeVertexNormals();
  const sT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .25, '120,80,30') }, 40, 40);
  const dune = add(scene, dG, new THREE.MeshLambertMaterial({ color: 0xe8c890, map: sT }), 0, 0, -40, 2);
  const grassM = [mat(0x7a9a4a), mat(0x8aa85a), mat(0x6a8a3a)]; for (let i = 0; i < 120; i++) { const x = (hash(i * 1.7) - .5) * 60, z = -2 - hash(i * 2.9) * 50; if (Math.hypot(x, z) < 3) continue; const g = grp(scene); g.position.set(x, .0, z); for (let k = 0; k < 5; k++) { const b = add(g, G.cyl, grassM[(i + k) % 3], (hash(i + k) - .5) * .3, .35, (hash(i * k + 3) - .5) * .3, 1); b.scale.set(.025, .7 + hash(i * k) * .5, .025); b.rotation.z = (hash(i * 7 + k) - .5) * .8 } }
  // burrow with a hinged silk door (original, generic)
  const silk = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: .9 }); const hole = add(scene, new THREE.CylinderGeometry(.32, .32, .05, 24), mat(0x1a120a), 0, .02, 0);
  const ring = add(scene, new THREE.TorusGeometry(.34, .05, 8, 24), silk, 0, .03, 0); ring.rotation.x = PI / 2;
  const HG = grp(scene); HG.position.set(0, .05, -.34); const DOOR = add(HG, new THREE.CylinderGeometry(.36, .36, .06, 24), new THREE.MeshLambertMaterial({ color: 0xc8a878, map: sT }), 0, 0, .34, 2);
  // the spider (stylised)
  const SP = grp(scene); const body = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: .5 }), ceph = new THREE.MeshStandardMaterial({ color: 0x7a5030, roughness: .4 });
  const ab = sph(SP, 1, body, 0, .14, -.2, 1); ab.scale.set(.2, .16, .26); const cp = sph(SP, 1, ceph, 0, .14, .1, 1); cp.scale.set(.15, .11, .16);
  for (const ex of [-.04, -.013, .013, .04]) sph(SP, .016, basic(0xffffff), ex, .22, .23);
  const LEGS = []; for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const lg = grp(SP); lg.position.set(sx * .1, .14, .16 - i * .08); lg.rotation.y = sx * (-.5 + i * .35) + (sx < 0 ? PI : 0);
    const u = add(lg, G.cyl, ceph, .14, .06, 0, 1); u.scale.set(.025, .3, .025); u.rotation.z = -1.0; const d = add(lg, G.cyl, ceph, .3, -.04, 0, 1); d.scale.set(.02, .3, .02); d.rotation.z = .7; lg.userData = { sx, i }; LEGS.push(lg) }
  SP.scale.setScalar(1.4); SP.position.set(0, -.5, 0);
  const SAND = []; for (let i = 0; i < 30; i++) { const d = glowSprite(scene, 0xffe8c0, .08, 0, 0, 0); d.material.opacity = .7; SAND.push(d) }
  makePanel(V(0, 4.8, -5), 0, 4.0, 0xffe08a, 0xffa040);
  function draw(t) {
    const gold = '#ffd95a', am = '#ffe08a', tq = '#7af0e0';
    if (t < M.name) { bgS(t, '#1e1206', '#3a2408', 'rgba(255,224,138,.07)'); txt('ENTRA EN UNA MONEDA', 360, 70, 46, am); circ(360, 340, 150, '#c8a040', '#ffd060'); circ(360, 340, 130, '#e0b850'); spider2D(360, 345, .9, t);
      const k = ss(ramp(t, 1.6, 3.6)); txt('ADN +' + Math.round(50 * k) + ' %', 360, 580, 100, '#fff', { glow: '#ff9a00', blur: 30 }); txt('QUE UN HUMANO', 360, 660, 40, gold) }
    else if (t < M.home) { bgS(t, '#1a1208', '#33220c', 'rgba(255,224,138,.07)'); txt('ARAÑA DE TRAMPILLA', 360, 70, 52, am); spider2D(360, 320, 1.0, t);
      sg.globalAlpha = sr(t, M.name + 2.6, M.name + 3.2); txt('Aptostichus', 360, 530, 54, '#fff', { w: 800 }); txt('stephencolberti', 360, 595, 54, '#fff', { w: 800 }); sg.globalAlpha = sr(t, Ln.s1.end - 2.0, Ln.s1.end - 1.4); pill('CALIFORNIA', 360, 670, '#6a4a1a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.genome) { bgS(t, '#06202a', '#0a3a44', 'rgba(122,240,224,.07)'); txt('DUNAS DE LA COSTA', 360, 70, 52, tq); sg.fillStyle = '#e8c890'; sg.beginPath(); sg.moveTo(40, 600); for (let x = 40; x <= 680; x += 10) sg.lineTo(x, 470 + 40 * Math.sin(x * .02 + t * .3)); sg.lineTo(680, 600); sg.fill();
      sg.strokeStyle = '#fff'; sg.lineWidth = 6; sg.setLineDash([12, 10]); sg.beginPath(); sg.moveTo(160, 330); sg.quadraticCurveTo(360, 240 + 0 * t, 560, 330); sg.stroke(); sg.setLineDash([]); circ(160, 330, 18, gold, gold); circ(560, 330, 18, gold, gold);
      txt('SAN FRANCISCO', 160, 210, 30, '#fff'); txt('MONTEREY', 560, 210, 30, '#fff') }
    else if (t < M.chrom) { bgS(t, '#120a24', '#24123e', 'rgba(200,160,255,.07)'); txt('SU GENOMA', 360, 70, 60, '#d8b8ff'); helix(70, 650, 240, 50, t, '#ffd95a', '#7af0e0', 32);
      const k = ss(ramp(t, M.genome + 2.4, M.genome + 4.2)); txt(fmt(4600 * k), 360, 440, 130, '#fff', { glow: '#a04aff', blur: 36 }); txt('MILLONES DE LETRAS', 360, 530, 44, gold); sg.globalAlpha = sr(t, M.genome + 1.0, M.genome + 1.6); pill('UC DAVIS', 360, 640, '#3a1a5a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.rep) { bgS(t, '#1a0e06', '#2e1a0a', 'rgba(255,224,138,.07)'); txt('CROMOSOMAS', 360, 70, 60, am); const k = ss(ramp(t, M.chrom + .3, M.chrom + 1.6)), k2 = ss(ramp(t, M.chrom + 1.8, M.chrom + 2.8));
      txt('ARAÑA', 190, 170, 40, '#fff'); txt(Math.round(52 * k), 190, 300, 150, gold, { glow: '#ff9a00' }); txt('HUMANO', 530, 170, 40, '#fff'); sg.globalAlpha = cl(k2 * 3); txt(Math.round(46 * k2), 530, 300, 150, tq, { glow: '#2ac0b0' }); sg.globalAlpha = 1;
      for (let i = 0; i < 52; i++) { const x = 80 + (i % 13) * 22, y = 430 + Math.floor(i / 13) * 52; if (i / 52 < k) { sg.fillStyle = gold; sg.beginPath(); sg.roundRect(x, y, 10, 40, 5); sg.fill() } }
      for (let i = 0; i < 46; i++) { const x = 410 + (i % 12) * 22, y = 430 + Math.floor(i / 12) * 52; if (i / 46 < k2) { sg.fillStyle = tq; sg.beginPath(); sg.roundRect(x, y, 10, 40, 5); sg.fill() } } }
    else if (t < M.burrow) { bgS(t, '#200a14', '#3a1224', 'rgba(255,160,200,.07)'); txt('¿POR QUÉ TANTO?', 360, 70, 60, '#ffb0d0'); const k = ss(ramp(t, M.rep + 2.0, M.rep + 3.6));
      sg.save(); sg.translate(360, 330); sg.lineWidth = 70; sg.strokeStyle = 'rgba(255,255,255,.12)'; sg.beginPath(); sg.arc(0, 0, 150, 0, 7); sg.stroke(); sg.strokeStyle = '#ff6aa8'; sg.shadowColor = '#ff6aa8'; sg.shadowBlur = 20; sg.beginPath(); sg.arc(0, 0, 150, -PI / 2, -PI / 2 + 2 * PI * .77 * k); sg.stroke(); sg.restore();
      txt(Math.round(77 * k) + ' %', 360, 340, 100, '#fff'); txt('ADN REPETIDO', 360, 570, 50, '#fff'); txt('ATCG ATCG ATCG ATCG', 360, 650, 36, 'rgba(255,176,208,.8)', { w: 700 }) }
    else if (t < M.safe) { bgS(t, '#140c04', '#2a1a08', 'rgba(255,224,138,.07)'); txt('LA TRAMPA', 360, 70, 64, am); sg.fillStyle = '#c8a070'; sg.fillRect(40, 220, 640, 460); sg.fillStyle = '#8a6a40'; sg.fillRect(40, 220, 640, 20);
      sg.fillStyle = '#3a2410'; sg.beginPath(); sg.roundRect(300, 240, 120, 380, 50); sg.fill(); sg.strokeStyle = '#f4efe6'; sg.lineWidth = 6; sg.beginPath(); sg.roundRect(300, 240, 120, 380, 50); sg.stroke();
      const op = ramp(t, Ln.s6.end - 2.2, Ln.s6.end - 1.4); sg.save(); sg.translate(300, 222); sg.rotate(-op * 1.3); sg.fillStyle = '#e8c890'; sg.fillRect(0, -10, 130, 24); sg.restore(); spider2D(360, lerp(520, 280, ss(op)), .45, t);
      for (let i = 0; i < 3; i++) { const w = (t * 1.5 + i / 3) % 1; sg.strokeStyle = `rgba(255,255,255,${(1 - w) * .6})`; sg.lineWidth = 4; sg.beginPath(); sg.arc(560, 210, 20 + w * 90, PI, 2 * PI); sg.stroke() } txt('VIBRACIONES', 560, 140, 30, '#fff') }
    else { bgS(t, '#06201a', '#0a3a2e', 'rgba(122,240,180,.07)'); txt('TRANQUI', 360, 80, 84, '#7affb0', { glow: '#2aff8a', blur: 30 }); spider2D(360, 330, .8, t); check(360, 520, 40, '#4aff9a', ramp(t, M.safe + 1.0, M.safe + 1.6));
      txt('NO ES PELIGROSA', 360, 600, 44, '#fff'); sg.globalAlpha = sr(t, Ln.s7.end - 2.0, Ln.s7.end - 1.4); pill('CUIDAR LAS DUNAS', 360, 670, '#1a5a3a', '#fff', 36); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,224,138,.6)');
  }
  const tc = [0, .3, 0];
  const K = autoK([[0, [2.3, 1.5, 3.0], tc, 42], [M.title - .2, [-2.4, 1.6, 2.9], tc, 44], [M.title + .9, [0, 3.0, 5.6], [0, 3.8, -5], 60]],
    [M.name, M.home, M.genome, M.chrom, M.rep, M.burrow, M.safe],
    [[near(tc, [1.8, 1.1, 2.4], 40), near(tc, [-1.6, 1.2, 2.4], 42), 2.4], [[[-6, 5, 8], [0, 0, -40], 56], [[6, 5, 8], [0, 0, -40], 56], 2.6], null, null, null, [near(tc, [1.8, 1.3, 2.4], 42), near(tc, [-.4, .9, 1.8], 44), 3.0], null],
    [[M.endcard, [2.2, 1.5, 3.0], tc, 46], [C.dur, [-2.2, 1.8, 3.2], tc, 48]]);
  frame = function (t) {
    // the spider pops out of the burrow at the start (hook) and during the hunting line
    const out = Math.max(win(t, .2, M.title + .9, .6, .4), win(t, Ln.s6.end - 1.6, M.safe + 2.6, .4, .6), ramp(t, M.endcard - .3, M.endcard + .5), win(t, M.name, M.name + 2.6, .5, .5), win(t, M.chrom, M.chrom + 2.2, .4, .4));
    DOOR.parent.rotation.x = -1.6 * ss(cl(out * 1.6)); SP.position.y = lerp(-.5, .04, ss(out)); SP.position.z = lerp(0, .25, ss(out)); SP.rotation.y = Math.sin(t * .6) * .3;
    LEGS.forEach(l => l.rotation.x = Math.sin(t * 9 + l.userData.i * 1.5 + l.userData.sx) * .12 * out);
    SAND.forEach((s, i) => { const w = (t * .4 + hash(i)) % 1; s.position.set(-8 + w * 16, .2 + Math.sin(i + t) * .2 + hash(i * 3) * .6, -2 + hash(i * 5) * 4); s.material.opacity = .6 * Math.sin(w * PI) });
    sea.material.color.setHSL(.55, .5, .4 + .02 * Math.sin(t));
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,180,90,.05)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.name, M.home, M.genome, M.chrom, M.rep, M.burrow, M.safe]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿LE TENÉS MIEDO<br>A LAS ARAÑAS?', qs: 105, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 3 — LADRILLOS DE POLVO LUNAR (superficie de la Luna, la Tierra en el cielo, gris y celeste)
if (P == 3) {
  scene.background = new THREE.Color(0x05070e); scene.fog = new THREE.Fog(0x0a0e18, 40, 160); const STARS = starField(4000, 140, .02, 1.0, .2);
  hemi.color.setHex(0xe0ecff); hemi.groundColor.setHex(0x404650); hemi.intensity = 1.5; R.toneMappingExposure = 1.15;
  const sun = new THREE.DirectionalLight(0xffffff, 3.0); sun.position.set(18, 14, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 80 }); scene.add(sun);
  const EARTH = sph(scene, 10, new THREE.MeshStandardMaterial({ color: 0x3a7ad8, roughness: .6, emissive: 0x1a4a8a }), -30, 26, -110); const EG = glowSprite(scene, 0x6ab8ff, 34, -30, 26, -110); EG.material.opacity = .35;
  const gG = new THREE.PlaneGeometry(260, 220, 130, 110); gG.rotateX(-PI / 2); const gp = gG.attributes.position; const CR = []; for (let i = 0; i < 26; i++) CR.push([(hash(i * 1.9) - .5) * 120, -10 - hash(i * 2.7) * 100, 2 + hash(i * 3.1) * 6]);
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i) - 40; let y = .4 * Math.sin(x * .1 + z * .07) + .25 * Math.sin(x * .3 - z * .2); for (const [cx, cz, r] of CR) { const d = Math.hypot(x - cx, z - cz) / r; if (d < 1.3) y += d < 1 ? -1.2 * (1 - d * d) * r * .25 : .6 * (1.3 - d) * r * .25 } y *= ss(cl((Math.hypot(x, z) - 6) / 6)); gp.setY(i, y - .02) } gG.computeVertexNormals();
  const rT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, .3, '40,40,50') }, 40, 40);
  add(scene, gG, new THREE.MeshLambertMaterial({ color: 0xb8b8bc, map: rT }), 0, 0, -40, 2);
  for (let i = 0; i < 40; i++) { const a = hash(i * 1.3) * 2 * PI, r = 5 + hash(i * 2.2) * 30; const s = .2 + hash(i * 3.5) * 1.0; const rk = add(scene, rockGeo(i, 2), mat(0x9a9aa0), Math.cos(a) * r, s * .2, Math.sin(a) * r - 6, 3); rk.scale.setScalar(s) }
  // the printer (generic machine): base, glass box, laser head
  const PR = grp(scene); PR.position.set(0, 0, 0); box(PR, 2.4, .6, 2.0, new THREE.MeshStandardMaterial({ color: 0xe8ecf2, metalness: .3, roughness: .4 }), 0, .3, 0, 3);
  const bed = box(PR, 1.6, .06, 1.4, mat(0x6a6a70), 0, .63, 0, 2);
  for (const [x, z] of [[-1.15, -.95], [1.15, -.95], [-1.15, .95], [1.15, .95]]) box(PR, .08, 1.8, .08, mat(0xc0c8d0), x, 1.5, z, 1);
  box(PR, 2.4, .1, 2.0, new THREE.MeshStandardMaterial({ color: 0xe8ecf2, metalness: .3, roughness: .4 }), 0, 2.4, 0, 1);
  const HEAD = grp(PR); HEAD.position.set(0, 2.25, 0); box(HEAD, .3, .25, .3, mat(0x2a2a30), 0, 0, 0, 1);
  const BEAM = add(HEAD, G.cyl, new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: .85 }), 0, -.8, 0); BEAM.scale.set(.02, 1.6, .02); const SPOT = glowSprite(scene, 0xff6a3a, .7, 0, .7, 0);
  // the interlocking bricks
  const brickM = new THREE.MeshStandardMaterial({ color: 0x9a9690, roughness: .95, map: rT });
  function brick(kind) { const g = grp(scene); if (kind == 'x') { box(g, .7, .25, .22, brickM, 0, 0, 0, 3); box(g, .22, .25, .7, brickM, 0, 0, 0, 3) } else { box(g, .2, .25, .7, brickM, -.25, 0, 0, 3); box(g, .2, .25, .7, brickM, .25, 0, 0, 3); box(g, .3, .25, .2, brickM, 0, 0, 0, 3) } return g }
  const BR = []; for (let i = 0; i < 8; i++) { const b = brick(i % 2 ? 'h' : 'x'); BR.push(b) }
  const DUST = []; for (let i = 0; i < 40; i++) { const d = glowSprite(scene, 0xd8d8e0, .1, 0, 0, 0); d.material.opacity = .5; DUST.push(d) }
  makePanel(V(0, 5.6, -5), 0, 4.0, 0x9ae8ff, 0x3a9aff);
  function draw(t) {
    const gold = '#ffd95a', cy = '#9ae8ff', gr = '#c8c8d0';
    if (t < M.dust) { bgS(t, '#0a0e1a', '#141c30', 'rgba(154,232,255,.07)'); txt('POLVO DE LUNA', 360, 70, 60, cy); const k = ss(ramp(t, .6, 3.2));
      for (let i = 0; i < 160; i++) { const x = 360 + (hash(i) - .5) * 400 * (1 - k), y = 330 + (hash(i * 3) - .5) * 300 * (1 - k); circ(x, y, 4, gr) } if (k > .6) { sg.globalAlpha = (k - .6) / .4; brick2D(260, 380, 1.1, 'x', '#a8a49c'); brick2D(470, 380, 1.1, 'h', '#a8a49c', .0); sg.globalAlpha = 1 } txt('= LADRILLOS', 360, 600, 70, '#fff', { glow: '#3a9aff' }) }
    else if (t < M.laser) { bgS(t, '#101014', '#22222a', 'rgba(255,255,255,.06)'); txt('SUELO LUNAR', 360, 70, 60, '#fff'); txt('«DE MENTIRA»', 360, 135, 44, gold); for (let i = 0; i < 300; i++) circ(360 + (hash(i * 1.1) - .5) * 520, 330 + (hash(i * 2.3) - .5) * 220, 3 + hash(i * 3) * 6, `rgb(${150 + hash(i * 5) * 60 | 0},${150 + hash(i * 5) * 60 | 0},${160 + hash(i * 5) * 60 | 0})`);
      sg.globalAlpha = sr(t, M.dust + 2.6, M.dust + 3.2); pill('COMO LAS MUESTRAS APOLO', 360, 600, '#2a3a5a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.nobind) { bgS(t, '#1a0606', '#320a0a', 'rgba(255,120,120,.07)'); txt('LÁSER', 360, 70, 76, '#ff8a8a', { glow: '#ff2a2a', blur: 30 }); const k = (t - M.laser) / 3.6, layers = Math.min(6, Math.floor(k * 6) + 1);
      for (let i = 0; i < layers; i++) { sg.fillStyle = i == layers - 1 ? '#ffb070' : '#a8a49c'; sg.fillRect(200, 520 - i * 40, 320, 34) } const lx = 200 + ((t * 1.3) % 1) * 320; sg.strokeStyle = '#ff3a3a'; sg.lineWidth = 6; sg.shadowColor = '#ff3a3a'; sg.shadowBlur = 20; sg.beginPath(); sg.moveTo(360, 170); sg.lineTo(lx, 520 - (layers - 1) * 40); sg.stroke(); sg.shadowBlur = 0;
      txt('CAPA ' + layers, 360, 640, 56, '#fff') }
    else if (t < M.shape) { bgS(t, '#06141e', '#0a2a3a', 'rgba(154,232,255,.07)'); txt('SIN PEGAMENTO', 360, 70, 64, cy); cross(360, 260, 70, '#ff5a5a', ramp(t, M.nobind + .8, M.nobind + 1.6)); txt('PEGAMENTO', 360, 380, 44, '#ff8a8a');
      txt('SE FUSIONA SOLO', 360, 480, 50, '#fff'); stampMark('¡PRIMERA VEZ!', 360, 620, ramp(t, Ln.m3.end - 1.6, Ln.m3.end - 1.0), gold, -.06, 56) }
    else if (t < M.why) { bgS(t, '#14141c', '#262636', 'rgba(255,255,255,.06)'); txt('ENCASTRAN', 360, 70, 70, '#fff', { glow: '#3a9aff' }); const k = ss(ramp(t, M.shape + 2.6, M.shape + 4.2));
      brick2D(lerp(180, 300, k), 330, 1.3, 'x', '#a8a49c'); brick2D(lerp(540, 420, k), 330, 1.3, 'h', '#bab6ae'); txt('CRUZ', 180, 500, 40, gold); txt('H', 540, 500, 40, gold); txt('UNOS POCOS CENTÍMETROS', 360, 620, 38, cy) }
    else if (t < M.limit) { bgS(t, '#04101e', '#082036', 'rgba(154,232,255,.07)'); txt('¿PARA QUÉ?', 360, 70, 66, cy); circ(150, 360, 70, '#3a7ad8', '#6ab8ff'); txt('TIERRA', 150, 470, 28, '#fff'); circ(590, 360, 54, '#c8c8d0', '#ffffff'); txt('LUNA', 590, 460, 28, '#fff');
      const k = sr(t, M.why + 1.2, M.why + 2.4); arrow(240, 360, 520, 360, '#ff8a8a', k); cross(380, 360, 40, '#ff5a5a', ramp(t, M.why + 2.6, M.why + 3.2)); sg.globalAlpha = sr(t, M.why + 3.4, M.why + 4.0); pill('BASES CON MATERIAL DE LA LUNA', 360, 600, '#1a3a5a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.team) { bgS(t, '#1e1206', '#36200a', 'rgba(255,217,90,.07)'); txt('OJO', 360, 70, 80, gold, { glow: '#ff9a00' }); brick2D(360, 280, 1.2, 'x', '#a8a49c');
      const rows = [['POROS', M.limit + 1.0], ['MENOS RESISTENCIA', M.limit + 2.2], ['FALTA PROBAR EN LA LUNA', M.limit + 4.0]]; rows.forEach(([s, t0], i) => { sg.globalAlpha = sr(t, t0, t0 + .5); txt('• ' + s, 360, 470 + i * 70, 42, '#fff'); sg.globalAlpha = 1 }) }
    else { bgS(t, '#0a0a20', '#14143a', 'rgba(200,200,255,.07)'); txt('UNIVERSIDAD', 360, 80, 60, '#fff'); txt('DE ARKANSAS', 360, 150, 60, cy); personIcon(360, 480, 220, '#9ae8ff');
      sg.globalAlpha = sr(t, Ln.m7.end - 3.0, Ln.m7.end - 2.4); pill('PRIMER AUTOR: ESTUDIANTE', 360, 600, '#2a2a6a', '#fff', 38); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(154,232,255,.6)');
  }
  const tc = [0, 1.2, 0];
  const K = autoK([[0, [3.6, 1.6, 4.0], [.8, .9, .4], 46], [M.title - .2, [-2.6, 1.8, 4.4], [.8, .9, .4], 48], [M.title + .9, [0, 4.2, 5.4], [0, 5.0, -5], 60]],
    [M.dust, M.laser, M.nobind, M.shape, M.why, M.limit, M.team],
    [[[[-3, 1.5, 6], [-30, 26, -110], 44], [[3, 1.5, 6], [-30, 26, -110], 44], 2.4], [near([0, .9, 0], [1.6, 1.0, 2.2], 40), near([0, .9, 0], [-1.4, 1.2, 2.2], 42), 3.0], null, [[[3.6, 1.9, 3.4], [3.0, .1, 1.2], 44], [[2.4, 2.1, 3.6], [3.0, .1, 1.2], 44], 2.4], [[[-4, 3, 8], [-30, 26, -110], 50], [[4, 3, 8], [-30, 26, -110], 50], 2.6], null, null],
    [[M.endcard, [3.4, 2.4, 4.8], tc, 48], [C.dur, [-3.2, 2.8, 5.2], tc, 50]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; EARTH.rotation.y = t * .05;
    const hx = Math.sin(t * 2.2) * .55, hz = Math.cos(t * 1.7) * .45; HEAD.position.x = hx; HEAD.position.z = hz; SPOT.position.set(hx, .72, hz); SPOT.scale.setScalar(.6 + .2 * Math.sin(t * 20));
    // bricks: printed in the machine, then lined up interlocked on the ground next to it
    BR.forEach((b, i) => { const k = ss(ramp(t, (i - 2) * 4.5 + 1, (i - 2) * 4.5 + 3)); b.visible = t > (i - 2) * 4.5; const tx = 2.2 + (i % 4) * .55, tz = .9 + Math.floor(i / 4) * .6; b.position.set(lerp(0, tx, k), lerp(.78, .13, k) + Math.sin(k * PI) * .6, lerp(0, tz, k)); b.rotation.y = (i % 2) * PI / 4 * k });
    DUST.forEach((d, i) => { const w = (t * .3 + hash(i)) % 1; d.position.set((hash(i * 2) - .5) * 10, w * 2, (hash(i * 3) - .5) * 8); d.material.opacity = .4 * Math.sin(w * PI) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.dust - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(120,180,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.dust, M.laser, M.nobind, M.shape, M.why, M.limit, M.team]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VIVIRÍAS<br>EN LA LUNA?', qs: 125, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

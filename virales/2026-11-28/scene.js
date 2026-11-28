// Virales 28/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: el cuásar récord de Euclid · p2: el colmillo del narval · p3: las cuevas escondidas del Nullarbor
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'EL MONSTRUO<br>MÁS ANTIGUO', ts: 108, tag: 'ESPACIO<b>RÉCORD</b>', sub: 'UN CUÁSAR BEBÉ', spk: { n: ['#e0c8ff', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'EL SECRETO<br>DEL NARVAL', ts: 112, tag: 'ANIMALES<b>NUEVO ESTUDIO</b>', sub: 'NO ES UN CUERNO', spk: { n: ['#bfeaff', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'CUEVAS<br>ESCONDIDAS', ts: 120, tag: 'PLANETA<b>NUEVO ESTUDIO</b>', sub: 'Y MARTE', spk: { n: ['#ffd8b0', '', 0], q: ['#ffd95a', '', 0] } },
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
// ---- helpers for today
function bh2D(x, y, r, t, col = '#ff9a3a') { sg.save(); sg.translate(x, y); const gr = sg.createRadialGradient(0, 0, r * .6, 0, 0, r * 2.4); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(.25, col); gr.addColorStop(1, 'rgba(120,20,80,0)'); sg.fillStyle = gr; sg.beginPath(); sg.ellipse(0, 0, r * 2.4, r * .75, -.15, 0, 7); sg.fill();
  sg.strokeStyle = 'rgba(255,220,160,.8)'; sg.lineWidth = r * .12; sg.beginPath(); sg.arc(0, 0, r * 1.08, 0, 7); sg.stroke(); sg.fillStyle = '#000'; sg.beginPath(); sg.arc(0, 0, r, 0, 7); sg.fill();
  sg.fillStyle = 'rgba(255,230,180,.9)'; sg.beginPath(); sg.ellipse(0, r * .1, r * 2.4, r * .16, -.15, 0, PI); sg.fill(); for (let i = 0; i < 18; i++) { const a = t * 1.2 + i * .35, rr = r * (1.3 + (i % 4) * .25); circ(Math.cos(a) * rr, Math.sin(a) * rr * .3, 4, 'rgba(255,240,200,.9)') } sg.restore() }
function telescope2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.rotate(Math.sin(t * .4) * .04); sg.fillStyle = '#d8dce8'; sg.beginPath(); sg.roundRect(-40, -110, 80, 150, 16); sg.fill(); sg.fillStyle = '#1a1e2a'; sg.beginPath(); sg.ellipse(0, -110, 40, 12, 0, 0, 7); sg.fill();
  sg.fillStyle = '#c8a040'; sg.beginPath(); sg.moveTo(-90, 60); sg.lineTo(90, 60); sg.lineTo(60, 100); sg.lineTo(-60, 100); sg.fill(); sg.fillStyle = '#2a3a7a'; sg.fillRect(50, -40, 90, 50); sg.strokeStyle = 'rgba(255,255,255,.3)'; sg.lineWidth = 2; for (let i = 1; i < 4; i++) { sg.beginPath(); sg.moveTo(50 + i * 22, -40); sg.lineTo(50 + i * 22, 10); sg.stroke() } sg.restore() }
function sunsGrid(n, x0, y0, cols, sz, k) { const N = Math.floor(n * k); for (let i = 0; i < N; i++) circ(x0 + (i % cols) * sz, y0 + Math.floor(i / cols) * sz, sz * .36, '#ffd040', '#ffb000') }
function fort2D(x, y, s) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = '#2a4a2a'; sg.beginPath(); sg.moveTo(-200, 0); sg.lineTo(160, 0); sg.lineTo(170, 120); sg.lineTo(-200, 120); sg.fill(); sg.fillStyle = '#5a6a7a'; sg.fillRect(160, 0, 14, 120);
  sg.strokeStyle = '#a8a49a'; sg.lineWidth = 14; for (const r of [60, 110, 160]) { sg.beginPath(); sg.arc(150, 0, r, PI * .95, PI * 1.5); sg.stroke() } sg.fillStyle = '#2a6ab0'; sg.fillRect(175, 40, 60, 80); sg.restore() }
// ==================================================================================== PART 1 — EL CUÁSAR RÉCORD (espacio profundo, violeta y naranja)
if (P == 1) {
  scene.background = new THREE.Color(0x05020c); scene.fog = null; const STARS = starField(4000, 160, -1, 1.1, .3);
  hemi.color.setHex(0xd8c8ff); hemi.groundColor.setHex(0x2a1a3a); hemi.intensity = 1.0; R.toneMappingExposure = 1.15;
  const QC = V(0, 8, -42); const Q = grp(scene); Q.position.copy(QC); Q.rotation.x = .38; Q.rotation.z = -.12;
  const GAL = add(scene, new THREE.PlaneGeometry(90, 90), new THREE.MeshBasicMaterial({ map: galT, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), QC.x, QC.y, QC.z - 6); GAL.rotation.x = -.9; GAL.rotation.z = .3;
  const diskT = tex(512, 512, (g, w, h) => { g.translate(256, 256); for (let r = 250; r > 60; r -= 2) { const k = (r - 60) / 190; g.strokeStyle = `rgba(${255},${Math.round(230 - k * 150)},${Math.round(180 - k * 160)},${(1 - k) * .9 + .05})`; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke() }
    for (let i = 0; i < 400; i++) { const a = Math.random() * 7, r = 70 + Math.random() * 170; g.strokeStyle = `rgba(255,255,230,${Math.random() * .5})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r, a, a + .3); g.stroke() } });
  const DISK = add(Q, new THREE.RingGeometry(1.6, 9, 96, 1), new THREE.MeshBasicMaterial({ map: diskT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), 0, 0, 0); DISK.rotation.x = -PI / 2;
  const ruv = DISK.geometry.attributes.uv, rp = DISK.geometry.attributes.position; for (let i = 0; i < ruv.count; i++) { ruv.setXY(i, rp.getX(i) / 18 + .5, rp.getY(i) / 18 + .5) } ruv.needsUpdate = true;
  add(Q, new THREE.SphereGeometry(1.5, 32, 16), basic(0x000000, { fog: false }), 0, 0, 0);
  const HALO = glowSprite(Q, 0xffc890, 9, 0, 0, 0); HALO.material.opacity = .7; glowSprite(Q, 0xb070ff, 30, 0, 0, 0).material.opacity = .45;
  const JETS = []; for (const s of [1, -1]) { const j = add(Q, new THREE.ConeGeometry(.9, 26, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x7ab8ff, transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }), 0, s * 13, 0); if (s > 0) j.rotation.x = PI; JETS.push(j) }
  const GAS = []; for (let i = 0; i < 70; i++) { const g = glowSprite(scene, i % 3 ? 0xffb070 : 0xd090ff, .6 + hash(i) * 1.2, 0, 0, 0); g.userData = { r: 10 + hash(i * 3) * 14, a: hash(i * 7) * 7, sp: .1 + hash(i * 5) * .2 }; GAS.push(g) }
  for (let i = 0; i < 14; i++) { const rk = add(scene, rockGeo(i + 3, 1), mat(0x4a4258), (hash(i) - .5) * 40, -6 + hash(i * 2) * 26, -6 - hash(i * 3) * 24, 0); rk.scale.setScalar(.3 + hash(i * 5) * .8); rk.userData.s = hash(i * 9) }
  makePanel(V(0, 6.2, -1), 0, 4.2, 0xe0c8ff, 0x9a5aff);
  function draw(t) {
    const gold = '#ffd95a', vi = '#e0c8ff', or = '#ffb060';
    if (t < M.who) { bgS(t, '#0e0620', '#1e0e3a', 'rgba(224,200,255,.07)'); txt('UN MONSTRUO', 360, 76, 78, vi, { glow: '#9a5aff' }); txt('DEL UNIVERSO BEBÉ', 360, 150, 46, '#fff'); bh2D(360, 420, 90 * (.6 + .4 * sr(t, .2, 2.2)), t) }
    else if (t < M.what) { bgS(t, '#060a20', '#0e1640', 'rgba(200,210,255,.07)'); txt('EUCLID', 360, 80, 96, '#fff', { glow: '#6a8aff', blur: 36 }); pill('AGENCIA ESPACIAL EUROPEA', 360, 168, '#2a2a6a', '#fff', 32); telescope2D(220, 430, 1.1, t);
      const k = sr(t, M.who + 2.4, M.what - .3); for (let i = 0; i < 160 * k; i++) circ(400 + hash(i * 3) * 280, 260 + hash(i * 7) * 300, 2 + hash(i) * 3, `rgba(220,220,255,${.4 + hash(i * 2) * .6})`); sg.globalAlpha = k; txt('MILLONES DE OBJETOS', 360, 650, 40, gold); sg.globalAlpha = 1 }
    else if (t < M.age) { bgS(t, '#140620', '#2a0e3a', 'rgba(255,200,240,.07)'); txt('¿QUÉ ES UN CUÁSAR?', 360, 70, 54, vi); galaxy2D(360, 380, 1.9, t); bh2D(360, 380, 26, t); sg.globalAlpha = sr(t, M.what + 2.2, M.what + 2.8); arrow(560, 250, 400, 360, gold, 1); pill('AGUJERO NEGRO', 560, 220, '#4a1a5a', '#fff', 32); sg.globalAlpha = sr(t, Ln.q2.end - 1.8, Ln.q2.end - 1.2); pill('TRAGA GAS · BRILLA', 360, 640, '#6a2a14', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.rec) { bgS(t, '#080a1e', '#12163a', 'rgba(200,210,255,.07)'); txt('VIAJE EN EL TIEMPO', 360, 66, 54, vi); const k = ss(ramp(t, M.age + .4, M.age + 3.4)); txt(fmt(13100 * k) + ' M', 360, 190, 96, '#fff', { glow: '#9a5aff' }); txt('DE AÑOS VIAJÓ SU LUZ', 360, 260, 34, '#e0d8ff', { w: 700 });
      const x0 = 70, x1 = 650, k2 = sr(t, Ln.q3.end - 3.6, Ln.q3.end - 2.4); bar(x0, 380, x1 - x0, 30, 1, '#5a4aaa'); txt('BIG BANG', x0 + 50, 450, 26, '#fff', { w: 700 }); txt('HOY', x1 - 30, 450, 26, '#fff', { w: 700 }); const xm = x0 + (x1 - x0) * .046; sg.globalAlpha = k2; circ(xm, 395, 22, gold, gold); arrow(xm + 60, 330, xm + 8, 380, gold, 1, 6); sg.globalAlpha = 1;
      stampMark('630 MILLONES DE AÑOS', 360, 560, ramp(t, Ln.q3.end - 2.4, Ln.q3.end - 1.8), gold, -.04, 46); sg.globalAlpha = sr(t, Ln.q3.end - 1.6, Ln.q3.end - 1.0); txt('DESPUÉS DEL BIG BANG', 360, 650, 36, '#fff'); sg.globalAlpha = 1 }
    else if (t < M.mass) { bgS(t, '#1a1006', '#2a1a0a', 'rgba(255,220,160,.07)'); txt('RÉCORD', 360, 80, 100, gold, { glow: '#ff9a00' }); const k = sr(t, M.rec + 2.6, M.rec + 4.2);
      txt('RÉCORD DE JULIO', 200, 250, 30, '#fff', { w: 700 }); bar(80, 280, 560, 34, .92, '#8a7a6a'); txt('NUEVO', 200, 380, 34, gold); bar(80, 410, 560, 34, .92 - .06 * k, '#ffb040'); sg.globalAlpha = k; txt('≈ 40 MILLONES DE AÑOS ANTES', 360, 500, 34, '#fff'); sg.globalAlpha = 1;
      stampMark('EL MÁS ANTIGUO', 360, 620, ramp(t, M.rec + 1.0, M.rec + 1.6), '#ff6a3a', -.05, 54) }
    else if (t < M.why) { bgS(t, '#1a0e04', '#301a08', 'rgba(255,220,160,.07)'); const k = ss(ramp(t, M.mass + 1.6, M.mass + 4.2)); txt(fmt(360 * k), 360, 110, 130, '#fff', { glow: or }); txt('MILLONES DE SOLES', 360, 200, 44, gold); sunsGrid(120, 90, 280, 15, 38, k);
      sg.globalAlpha = sr(t, Ln.q5.end - 2.0, Ln.q5.end - 1.4); pill('LO MIDIÓ EL JAMES WEBB', 360, 640, '#4a2a0a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.pub) { bgS(t, '#100620', '#200a3a', 'rgba(224,200,255,.07)'); txt('EL MISTERIO', 360, 70, 70, vi); bh2D(250, 330, 60, t * .25); pill('HOY COME DESPACIO', 250, 480, '#3a1a5a', '#fff', 32);
      sg.globalAlpha = sr(t, M.why + 2.6, M.why + 3.2); txt('?', 540, 340, 260, gold, { glow: '#ff9a00', blur: 40 }); sg.globalAlpha = sr(t, Ln.q6.end - 1.8, Ln.q6.end - 1.2); txt('¿TAN GRANDE, TAN RÁPIDO?', 360, 640, 40, '#fff'); sg.globalAlpha = 1 }
    else { bgS(t, '#060e14', '#0e1e2a', 'rgba(200,240,255,.07)'); txt('ASTRONOMY', 360, 70, 62, '#fff'); txt('& ASTROPHYSICS', 360, 130, 46, '#c8e8ff'); const k = sr(t, Ln.q7.end - 3.2, Ln.q7.end - 2.4); sg.globalAlpha = k; fort2D(330, 380, 1.15); pill('APODO: DÚN AONGHASA', 360, 580, '#2a4a2a', '#fff', 36); txt('UN FUERTE ANTIGUO DE IRLANDA', 360, 655, 28, '#d8ffd8', { w: 700 }); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(224,200,255,.6)');
  }
  const qc = [QC.x, QC.y, QC.z];
  const K = autoK([[0, [6, 10, -14], qc, 54], [M.title - .3, [-10, 6, -10], qc, 56], [M.title + .9, [0, 4.8, 6.8], [0, 5.0, -1], 60]],
    [M.who, M.what, M.age, M.rec, M.mass, M.why, M.pub],
    [null, [[[18, 14, -26], qc, 56], [[-16, 12, -24], qc, 56], 2.6], null, [[[0, 30, -30], qc, 58], [[8, 26, -22], qc, 58], 2.2], [[[-8, 4, -30], qc, 50], [[-4, 7, -28], qc, 50], 2.6], [[[14, 3, -30], qc, 52], [[10, 6, -26], qc, 52], 2.2], null],
    [[M.endcard, [-12, 6, -16], qc, 56], [C.dur, [12, 8, -14], qc, 56]]);
  frame = function (t) {
    STARS.rotation.y = t * .003; DISK.rotation.z = -t * .35; GAL.rotation.z = .3 + t * .01; HALO.material.opacity = .6 + .15 * Math.sin(t * 4);
    JETS.forEach((j, i) => j.material.opacity = .25 + .12 * Math.sin(t * 6 + i));
    GAS.forEach(g => { const u = g.userData, a = u.a + t * u.sp, r = u.r * (1 - ((t * .03 + u.a) % 1) * .5); g.position.set(QC.x + Math.cos(a) * r, QC.y + Math.sin(a * 2) * .6 + (r - 10) * .05, QC.z + Math.sin(a) * r) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(160,90,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.what, M.age, M.rec, M.mass, M.why, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿EL ESPACIO TE DA<br>MIEDO O CURIOSIDAD?', qs: 92, a: 'MIEDO', b: 'CURIOSIDAD', cta: 'COMENTÁ  MIEDO  o  CURIOSIDAD', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
// ---- narwhal helpers
function narwhal2D(x, y, s, t, tusk = 1, flip = 1) { sg.save(); sg.translate(x, y); sg.scale(s * flip, s); const sw = Math.sin(t * 2.2) * 8;
  sg.fillStyle = '#7a8a96'; sg.beginPath(); sg.moveTo(-150, sw * .3); sg.lineTo(-215, -34 + sw); sg.quadraticCurveTo(-190, sw, -215, 34 + sw); sg.closePath(); sg.fill();
  const gr = sg.createLinearGradient(0, -50, 0, 50); gr.addColorStop(0, '#5a6a78'); gr.addColorStop(1, '#c8d2da'); sg.fillStyle = gr; sg.beginPath(); sg.ellipse(0, 0, 160, 50, 0, 0, 7); sg.fill();
  sg.fillStyle = 'rgba(40,50,60,.35)'; for (let i = 0; i < 22; i++) { sg.beginPath(); sg.ellipse(-120 + hash(i * 3) * 240, -30 + hash(i * 7) * 34, 8, 5, 0, 0, 7); sg.fill() }
  sg.fillStyle = '#6a7a88'; sg.beginPath(); sg.ellipse(40, 34, 30, 10, .6, 0, 7); sg.fill(); circ(120, -8, 6, '#111');
  if (tusk > 0) { const L = 300 * tusk; sg.fillStyle = '#efe6cc'; sg.beginPath(); sg.moveTo(150, -14); sg.lineTo(150 + L, -24); sg.lineTo(150, -2); sg.fill(); sg.strokeStyle = 'rgba(120,100,60,.55)'; sg.lineWidth = 2; for (let u = 0; u < L; u += 16) { sg.beginPath(); sg.moveTo(150 + u, -14 - u / L * 10 + 6 * (1 - u / L)); sg.lineTo(150 + u + 10, -2 - u / L * 22); sg.stroke() } } sg.restore() }
function helix2D(x0, x1, y, amp, t, col, dir, w = 10) { sg.strokeStyle = col; sg.lineWidth = w; sg.lineCap = 'round'; sg.shadowColor = col; sg.shadowBlur = 16; sg.beginPath(); for (let i = 0; i <= 80; i++) { const u = i / 80, x = lerp(x0, x1, u), a = u * 18 * dir + t * 3 * dir; const yy = y + Math.sin(a) * amp; i ? sg.lineTo(x, yy) : sg.moveTo(x, yy) } sg.stroke(); sg.shadowBlur = 0; sg.lineCap = 'butt' }
function rings2D(x, y, r, k, t) { const n = Math.floor(14 * k); for (let i = n; i >= 1; i--) { circ(x, y, r * i / 14, i % 2 ? '#e8dcb8' : '#cdbf96') } circ(x, y, r * .06, '#a89870') }
// ==================================================================================== PART 2 — EL NARVAL (Ártico al atardecer, mar y hielo)
if (P == 2) {
  skyDome('#1a2a5a', '#d88aa0', '#ffc8a0'); scene.background = new THREE.Color(0x4a5a8a); scene.fog = new THREE.Fog(0x8a90b0, 40, 160);
  hemi.color.setHex(0xe0e8ff); hemi.groundColor.setHex(0x203040); hemi.intensity = 1.7; R.toneMappingExposure = 1.3;
  const sun = new THREE.DirectionalLight(0xffc8a0, 2.2); sun.position.set(-40, 8, -30); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 140 }); scene.add(sun);
  glowSprite(scene, 0xffd0a0, 26, -100, 8, -90).material.opacity = .9;
  const wG = new THREE.PlaneGeometry(300, 300, 120, 120); wG.rotateX(-PI / 2); const wp = wG.attributes.position; const W0 = Float32Array.from(wp.array);
  const SEA = add(scene, wG, new THREE.MeshStandardMaterial({ color: 0x4a80b0, roughness: .3, metalness: .1, transparent: true, opacity: .72, depthWrite: false }), 0, 0, 0, 2);
  const iceM = new THREE.MeshLambertMaterial({ color: 0xf2f8ff, emissive: 0x1a2a3a });
  const FLOES = []; for (let i = 0; i < 26; i++) { const a = hash(i) * 7, r = 12 + hash(i * 3) * 50; const f = add(scene, rockGeo(i + 70, 1), iceM, Math.cos(a) * r, 0, -10 + Math.sin(a) * r - 12, 3); f.scale.set(1.5 + hash(i * 5) * 4, .35 + hash(i * 2) * .4, 1.5 + hash(i * 7) * 3); FLOES.push(f) }
  for (let i = 0; i < 8; i++) { const b = add(scene, rockGeo(i + 90, 1), iceM, -90 + i * 26, 0, -110 - hash(i) * 20, 1); b.scale.set(6 + hash(i) * 6, 4 + hash(i * 2) * 6, 5) }
  // 3D narwhals (generic animal built from primitives)
  const skinM = new THREE.MeshLambertMaterial({ color: 0xa8b4c2, emissive: 0x1a2028 }), bellyM = mat(0xd0d8de), tuskM = new THREE.MeshStandardMaterial({ map: tex(64, 512, (g, w, h) => { g.fillStyle = '#efe6cc'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(130,110,70,.6)'; g.lineWidth = 6; for (let y = -64; y < h + 64; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 40); g.stroke() } }), roughness: .5, emissive: 0x3a3428 });
  function narwhal(sc) { const g = grp(scene), b = grp(g); const body = sph(b, 1, skinM, 0, 0, 0, 1); body.scale.set(2.4, .8, .85); const bl = sph(b, 1, bellyM, 0, -.28, 0, 0); bl.scale.set(2.1, .5, .7);
    const hd = sph(b, .7, skinM, 2.1, .05, 0, 1); hd.scale.set(1, .85, .9); const tl = grp(b); tl.position.set(-2.3, 0, 0); const tk = sph(tl, .5, skinM, -.4, 0, 0, 1); tk.scale.set(1.2, .35, .4);
    const fl = sph(tl, .6, skinM, -1.0, 0, 0, 1); fl.scale.set(.5, .1, 1.6); for (const s of [1, -1]) { const fp = sph(b, .4, skinM, 1.0, -.45, s * .7, 1); fp.scale.set(.8, .12, .45) }
    const tu = add(b, new THREE.ConeGeometry(.12, 5.2, 16, 1), tuskM, 5.2, .15, 0, 1); tu.rotation.z = -PI / 2;
    for (const s of [1, -1]) sph(b, .07, mat(0x111111), 2.55, .2, s * .45, 0); g.scale.setScalar(sc); return { g, b, tl, tu } }
  const NW = [narwhal(1), narwhal(.85)]; NW[0].g.position.set(-2, -.1, -9); NW[1].g.position.set(4, -.2, -15); NW[1].g.rotation.y = .7;
  const BUB = []; for (let i = 0; i < 40; i++) { const d = glowSprite(scene, 0xc8f0ff, .25, 0, 0, 0); d.material.opacity = 0; BUB.push(d) }
  const SN = []; for (let i = 0; i < 120; i++) { const s = glowSprite(scene, 0xffffff, .1 + hash(i) * .1, 0, 0, 0); s.material.opacity = .7; SN.push(s) }
  makePanel(V(0, 6.4, -1), 0, 4.2, 0xbfeaff, 0x5ac8ff);
  function draw(t) {
    const gold = '#ffd95a', ic = '#bfeaff';
    if (t < M.who) { bgS(t, '#06162a', '#0c2a48', 'rgba(191,234,255,.07)'); txt('EL UNICORNIO', 360, 76, 74, ic, { glow: '#5ac8ff' }); txt('DEL MAR', 360, 150, 54, '#fff'); narwhal2D(260, 420, 1.0, t, sr(t, .3, 2.4)) }
    else if (t < M.tooth) { bgS(t, '#06162a', '#0c2a48', 'rgba(191,234,255,.07)'); txt('EL NARVAL', 360, 80, 96, '#fff', { glow: '#5ac8ff', blur: 36 }); narwhal2D(250, 330, .8, t, 1);
      ['SUIZA', 'DINAMARCA', '+ OTROS PAÍSES'].forEach((s, i) => { sg.globalAlpha = sr(t, M.who + 2.4 + i * .5, M.who + 2.9 + i * .5); pill(s, 360, 480 + i * 80, ['#8a1a2a', '#a01a2a', '#2a4a6a'][i], '#fff', 34) }); sg.globalAlpha = 1 }
    else if (t < M.len) { bgS(t, '#140e06', '#24180a', 'rgba(255,230,180,.07)'); txt('NO ES UN CUERNO', 360, 70, 60, '#ffe0b0');
      stampMark('ES UN DIENTE', 360, 180, ramp(t, M.tooth + 1.6, M.tooth + 2.4), gold, -.05, 62); narwhal2D(220, 400, .75, t, 1); sg.globalAlpha = sr(t, M.tooth + 3.6, M.tooth + 4.2); arrow(470, 520, 380, 410, gold, 1); pill('CANINO SUPERIOR IZQUIERDO', 360, 600, '#5a3a14', '#fff', 30); sg.globalAlpha = sr(t, Ln.n2.end - 1.6, Ln.n2.end - 1.0); txt('CRECE EN ESPIRAL', 360, 670, 34, '#fff'); sg.globalAlpha = 1 }
    else if (t < M.xray) { bgS(t, '#06162a', '#0c2a48', 'rgba(191,234,255,.07)'); const k = ss(ramp(t, M.len + .4, M.len + 1.8)); txt((2 * k).toFixed(1).replace('.', ',') + ' M', 360, 110, 120, '#fff', { glow: '#5ac8ff' }); narwhal2D(170, 380, .62, t, 1);
      sg.strokeStyle = gold; sg.lineWidth = 5; sg.beginPath(); sg.moveTo(265, 470); sg.lineTo(265 + 186 * k, 470); sg.stroke(); txt('COLMILLO', 360, 510, 30, gold); sg.globalAlpha = sr(t, Ln.n3.end - 1.6, Ln.n3.end - 1.0); pill('HASTA LA MITAD DEL CUERPO', 360, 620, '#1a4a6a', '#fff', 32); sg.globalAlpha = 1 }
    else if (t < M.helix) { bgS(t, '#040c1a', '#08182e', 'rgba(120,220,255,.08)'); txt('RAYOS X', 360, 74, 90, '#7af0ff', { glow: '#2ad0ff' }); const y = 300; sg.fillStyle = '#efe6cc'; sg.beginPath(); sg.moveTo(80, y - 30); sg.lineTo(640, y - 6); sg.lineTo(640, y + 6); sg.lineTo(80, y + 30); sg.fill(); helix2D(80, 640, y, 18, t, 'rgba(130,100,60,.5)', 1, 4);
      const sx = 80 + ((t - M.xray) * 140) % 560; sg.fillStyle = 'rgba(122,240,255,.35)'; sg.fillRect(sx - 6, 180, 12, 240); circ(sx, 300, 14, '#7af0ff', '#7af0ff');
      ['SUIZA', 'SUECIA', 'FRANCIA'].forEach((s, i) => { sg.globalAlpha = sr(t, M.xray + 1.4 + i * .4, M.xray + 1.9 + i * .4); pill(s, 140 + i * 220, 480, '#1a3a5a', '#fff', 30) }); sg.globalAlpha = sr(t, Ln.n4.end - 2.4, Ln.n4.end - 1.8); txt('MILLONES DE MEDICIONES', 360, 580, 38, gold); txt('→ MODELO 3D', 360, 645, 36, '#fff'); sg.globalAlpha = 1 }
    else if (t < M.why) { bgS(t, '#0a0a1e', '#14143a', 'rgba(200,200,255,.07)'); txt('NO ES UNA ESPIRAL', 360, 66, 52, '#fff'); stampMark('SON DOS', 360, 150, ramp(t, M.helix + 1.6, M.helix + 2.2), gold, -.04, 58);
      const k1 = sr(t, M.helix + 3.0, M.helix + 3.8), k2 = sr(t, M.helix + 5.0, M.helix + 5.8); sg.globalAlpha = k1; helix2D(90, 630, 330, 50, t, '#ff8a5a', 1); txt('AFUERA ↺', 360, 410, 34, '#ffb090'); sg.globalAlpha = k2; helix2D(90, 630, 500, 50, t, '#5ac8ff', -1); txt('ADENTRO ↻', 360, 580, 34, '#a8e0ff'); sg.globalAlpha = sr(t, Ln.n5.end - 1.8, Ln.n5.end - 1.2); pill('COMO UNA CUERDA', 360, 660, '#3a2a5a', '#fff', 34); sg.globalAlpha = 1 }
    else if (t < M.pub) { bgS(t, '#06162a', '#0c2a48', 'rgba(191,234,255,.07)'); txt('RESISTE', 360, 70, 80, ic, { glow: '#5ac8ff' }); const b = Math.sin(t * 2.4) * 40; sg.strokeStyle = '#efe6cc'; sg.lineWidth = 22; sg.lineCap = 'round'; sg.beginPath(); sg.moveTo(100, 300); sg.quadraticCurveTo(360, 300 + b, 620, 300 + b * 1.6); sg.stroke(); sg.lineCap = 'butt';
      for (let i = 0; i < 5; i++) { const w = (t * .8 + i / 5) % 1; arrow(620 - w * 520, 220, 560 - w * 520, 220, 'rgba(120,200,255,.7)', 1, 5) } sg.globalAlpha = sr(t, M.why + 2.4, M.why + 3.0); pill('TORSIONES + AGUA', 360, 430, '#1a4a6a', '#fff', 36); sg.globalAlpha = 1;
      stampMark('DURO Y FLEXIBLE', 360, 600, ramp(t, Ln.n6.end - 1.4, Ln.n6.end - .8), gold, -.04, 52) }
    else { bgS(t, '#100e06', '#201c0e', 'rgba(255,240,200,.07)'); txt('CAPAS', 360, 70, 80, '#ffe8b0'); rings2D(360, 330, 190, sr(t, M.pub + .4, M.pub + 3.0), t); sg.globalAlpha = sr(t, M.pub + 2.6, M.pub + 3.2); pill('ARCHIVO DEL CLIMA DEL ÁRTICO', 360, 570, '#4a3a14', '#fff', 30); sg.globalAlpha = sr(t, Ln.n7.end - 2.2, Ln.n7.end - 1.6); txt('NATURE COMMUNICATIONS', 360, 650, 40, ic); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(191,234,255,.6)');
  }
  const nc = [-.5, 0, -9], tk = [4.4, .45, -9];
  const K = autoK([[0, [-.5, 2.6, 6], nc, 60], [M.title - .3, [-9, 3, 1], nc, 58], [M.title + .9, [0, 5.0, 6.8], [0, 5.2, -1], 60]],
    [M.who, M.tooth, M.len, M.xray, M.helix, M.why, M.pub],
    [[[[-6, 3, 6], nc, 60], [[5, 3.5, 6], nc, 60], 2.4], [[[3, 1.5, -4.5], [1.5, .1, -9], 48], [[0, 1.8, -4.5], [1.5, .1, -9], 48], 2.4], null, [[[-.5, 14, -5], nc, 58], [[2, 13, -3.5], nc, 58], 2.2], [[[5.8, .8, -5.6], tk, 44], [[3, .9, -5.6], tk, 44], 2.6], [near([5, 0, -16], [-7, 3, 8], 56), near([5, 0, -16], [-2, 3.5, 9], 56), 2.2], null],
    [[M.endcard, [-8, 3.5, 4], nc, 58], [C.dur, [8, 4, 4], nc, 58]]);
  frame = function (t) {
    for (let i = 0; i < wp.count; i++) { const x = W0[i * 3], z = W0[i * 3 + 2]; wp.setY(i, .12 * Math.sin(x * .35 + t * 1.3) + .1 * Math.cos(z * .4 + t * 1.1)) } wp.needsUpdate = true; wG.computeVertexNormals();
    NW.forEach((n, i) => { n.b.position.y = .12 * Math.sin(t * 1.4 + i * 2); n.b.rotation.z = .05 * Math.sin(t * 1.4 + i); n.tl.rotation.z = .35 * Math.sin(t * 3 + i); const d = t * (i ? .03 : .045); n.g.position.y = i ? -.2 : -.1; n.g.position.x = (i ? 4 : -2) + d * Math.cos(n.g.rotation.y); n.g.position.z = (i ? -15 : -9) - d * Math.sin(n.g.rotation.y) });
    FLOES.forEach((f, i) => f.position.y = .05 * Math.sin(t + i));
    BUB.forEach((d, i) => { const w = (t * .5 + hash(i)) % 1; d.position.set(NW[0].g.position.x - 2 + hash(i * 3) * 2, -.2 + w * .8, -9 + hash(i * 5) * 1.4 - .7); d.material.opacity = .6 * Math.sin(w * PI) });
    PANEL.g.visible = !(t < M.title + .75 || t > M.endcard || [[M.who, 2.4], [M.tooth, 2.4], [M.xray, 2.2], [M.helix, 2.6], [M.why, 2.2]].some(([m, d]) => t > m && t < m + d + .12));
    SN.forEach((s, i) => { const w = (t * (.05 + hash(i) * .04) + hash(i * 2)) % 1; s.position.set(-18 + hash(i * 3) * 36, 12 - w * 12, -24 + hash(i * 5) * 26) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(90,200,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.tooth, M.len, M.xray, M.helix, M.why, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿SABÍAS QUE<br>ERA UN DIENTE?', qs: 105, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
// ---- cave helpers
function drone2D(x, y, s, t) { sg.save(); sg.translate(x, y + Math.sin(t * 3) * 6); sg.scale(s, s); sg.strokeStyle = '#d8dce4'; sg.lineWidth = 8; sg.beginPath(); sg.moveTo(-60, -10); sg.lineTo(60, -10); sg.stroke(); sg.fillStyle = '#3a3e4a'; sg.beginPath(); sg.roundRect(-26, -22, 52, 30, 8); sg.fill(); circ(0, 14, 9, '#1a1a1a');
  for (const sx of [-60, 60]) { sg.fillStyle = 'rgba(220,230,240,.6)'; sg.beginPath(); sg.ellipse(sx, -18, 34 * Math.abs(Math.cos(t * 30)), 5, 0, 0, 7); sg.fill() } sg.restore() }
function sat2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.rotate(Math.sin(t) * .1); sg.fillStyle = '#2a4a9a'; sg.fillRect(-110, -18, 70, 36); sg.fillRect(40, -18, 70, 36); sg.fillStyle = '#c8b060'; sg.fillRect(-30, -28, 60, 56); sg.strokeStyle = '#ddd'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(-40, 0); sg.lineTo(40, 0); sg.stroke(); sg.restore() }
function drill2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = '#c8c0b0'; sg.lineWidth = 6; sg.beginPath(); sg.moveTo(-40, 40); sg.lineTo(0, -80); sg.lineTo(40, 40); sg.stroke(); sg.fillStyle = '#ffb040'; sg.fillRect(-6, -80, 12, 200); sg.restore() }
function section2D(t, k, x0 = 40, w = 640, ys = 300) { // limestone cross-section with a cave that migrates upward (k 0..1)
  sg.fillStyle = '#e8b878'; sg.fillRect(x0, ys - 120, w, 120); sg.fillStyle = '#b8906a'; sg.fillRect(x0, ys, w, 720 - ys - 50);
  sg.strokeStyle = 'rgba(80,50,30,.35)'; sg.lineWidth = 3; for (let y = ys + 40; y < 670; y += 50) { sg.beginPath(); sg.moveTo(x0, y); sg.lineTo(x0 + w, y); sg.stroke() }
  const cy = lerp(560, ys + 70, k), cr = 60 + 20 * k; sg.fillStyle = '#2a1a12'; sg.beginPath(); sg.ellipse(360, cy, cr * 1.6, cr * .7, 0, 0, 7); sg.fill();
  for (let i = 0; i < 6; i++) rock2D(300 + i * 24, cy + cr * .55 - 10, 12, '#8a6a4a');
  sg.fillStyle = 'rgba(255,255,255,.1)'; sg.fillRect(x0, ys, w, 4); const dip = 26 * k; sg.fillStyle = '#e8b878'; sg.beginPath(); sg.moveTo(x0, ys); sg.lineTo(260, ys); sg.quadraticCurveTo(360, ys + dip * 2, 460, ys); sg.lineTo(x0 + w, ys); sg.lineTo(x0 + w, ys + 2); sg.lineTo(x0, ys + 2); sg.fill(); return cy }
// ==================================================================================== PART 3 — CUEVAS DEL NULLARBOR (llanura al atardecer, ocre y naranja)
if (P == 3) {
  skyDome('#2a3a7a', '#e88a5a', '#ffd8a0'); scene.background = new THREE.Color(0xd8906a); scene.fog = new THREE.Fog(0xe8a878, 60, 190);
  hemi.color.setHex(0xffe8d0); hemi.groundColor.setHex(0x6a4a3a); hemi.intensity = 1.15; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xffc890, 2.6); sun.position.set(-40, 10, -20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); scene.add(sun);
  glowSprite(scene, 0xffe0a0, 30, -110, 10, -60).material.opacity = .95;
  const gT = tex(512, 512, (g, w, h) => { g.fillStyle = '#c89c70'; g.fillRect(0, 0, w, h); blot(g, w, h, 70, .4, '160,120,80', 70); blot(g, w, h, 50, .35, '220,170,120', 60); speck(g, w, h, 8000, .3, '70,40,20') }, 12, 12);
  const TR = [[-8, 1.4], [6, 1.1], [18, 1.6]]; // trench x positions & widths (run along z)
  const gG = new THREE.PlaneGeometry(280, 280, 180, 180); gG.rotateX(-PI / 2); const gp = gG.attributes.position;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); let y = .25 * Math.sin(x * .09) * Math.cos(z * .07) + .08 * Math.sin(x * .5 + z * .3); for (const [tx, tw] of TR) { const d = (x - tx - 2 * Math.sin(z * .04)) / tw; y -= .9 * Math.exp(-d * d) } const sd = Math.hypot(x - 2, z + 22) / 2.6; if (sd < 1.3) y -= sd < 1 ? 3 * (1 - sd * sd) : 0; gp.setY(i, y) } gG.computeVertexNormals();
  add(scene, gG, new THREE.MeshLambertMaterial({ map: gT }), 0, 0, 0, 2);
  add(scene, new THREE.CircleGeometry(2.3, 32), basic(0x1a0e08), 2, -1.6, -22).rotation.x = -PI / 2;
  const bushM = new THREE.MeshLambertMaterial({ color: 0x7a8a6a }); for (let i = 0; i < 160; i++) { const b = sph(scene, .35 + hash(i) * .4, bushM, (hash(i * 3) - .5) * 90, .1, 10 - hash(i * 7) * 90, 1); b.scale.y *= .55 }
  const DR = grp(scene); box(DR, .7, .22, .7, mat(0x3a3e4a), 0, 0, 0, 1); const PROPS = []; for (const [dx, dz] of [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]]) { box(DR, .9, .05, .06, mat(0xd8dce4), dx / 2, 0, dz / 2, 0).rotation.y = Math.atan2(dz, dx); const pr = add(DR, new THREE.CylinderGeometry(.32, .32, .02, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .4 }), dx, .1, dz); PROPS.push(pr) }
  const DRL = glowSprite(DR, 0xff4040, .5, 0, -.1, .36);
  const MARS = add(scene, new THREE.SphereGeometry(9, 48, 24), new THREE.MeshLambertMaterial({ map: tex(512, 256, (g, w, h) => { g.fillStyle = '#c0582a'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .6, '120,50,20', 50); blot(g, w, h, 30, .5, '230,140,90', 40); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(0, 0, w, 12) }), emissive: 0x3a1408 }), 40, -20, -120, 0);
  const DUST = []; for (let i = 0; i < 50; i++) { const d = glowSprite(scene, 0xe8c090, .5 + hash(i) * .6, 0, 0, 0); d.material.opacity = 0; DUST.push(d) }
  makePanel(V(0, 6.2, -1), 0, 4.2, 0xffd8b0, 0xff9a4a);
  function draw(t) {
    const gold = '#ffd95a', oc = '#ffd8b0';
    if (t < M.who) { bgS(t, '#1a0c06', '#2e160a', 'rgba(255,216,176,.07)'); txt('CUEVAS', 360, 76, 96, oc, { glow: '#ff8a3a' }); txt('BAJO EL DESIERTO', 360, 150, 46, '#fff'); section2D(t, .35, 40, 640, 330); moon2D(600, 250, 34, '#d0603a') }
    else if (t < M.sea) { bgS(t, '#1a0c06', '#2e160a', 'rgba(255,216,176,.07)'); txt('NULLARBOR', 360, 80, 90, '#fff', { glow: '#ff8a3a', blur: 32 }); pill('SUR DE AUSTRALIA', 360, 166, '#6a2a0a', '#fff', 34);
      const k = ss(ramp(t, M.who + 3.0, M.who + 4.8)); txt('+' + fmt(200000 * k), 360, 330, 104, gold, { glow: '#ff9a00' }); txt('KM²', 360, 420, 50, '#fff'); sg.globalAlpha = sr(t, Ln.c1.end - 1.6, Ln.c1.end - 1.0); pill('PIEDRA CALIZA', 360, 560, '#8a6a4a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.trench) { bgS(t, '#06121e', '#0c2236', 'rgba(170,220,255,.07)'); const k = ss(ramp(t, M.sea + 1.6, Ln.c2.end - 1.0)); txt('HACE 14 MILLONES', 360, 66, 54, '#fff'); txt('DE AÑOS', 360, 122, 40, '#c8e8ff');
      sg.fillStyle = '#d8b080'; sg.fillRect(40, 470, 640, 200); const wl = lerp(250, 470, k); sg.fillStyle = 'rgba(40,140,200,.85)'; sg.fillRect(40, wl, 640, 470 - wl); for (let i = 0; i < 7; i++) { sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 4; sg.beginPath(); for (let x = 40; x <= 680; x += 10) { const y = wl + Math.sin(x * .04 + t * 3 + i) * 5; x == 40 ? sg.moveTo(x, y) : sg.lineTo(x, y) } sg.stroke(); break }
      sg.globalAlpha = 1 - k; pill('UN MAR', 360, 360, '#1a5a8a', '#fff', 44); sg.globalAlpha = k; pill('QUEDÓ LA ROCA', 360, 580, '#7a4a2a', '#fff', 42); sg.globalAlpha = 1 }
    else if (t < M.study) { bgS(t, '#20120a', '#3a2010', 'rgba(255,216,176,.07)'); txt('DESDE EL AIRE', 360, 66, 58, oc); sg.fillStyle = '#c8946a'; sg.fillRect(60, 120, 600, 420); const k = sr(t, M.trench + .8, M.trench + 3.4);
      for (const [x, w] of [[180, 10], [330, 8], [500, 12]]) { sg.strokeStyle = 'rgba(70,40,20,.7)'; sg.lineWidth = w; sg.beginPath(); for (let y = 120; y <= 120 + 420 * k; y += 10) { const xx = x + 14 * Math.sin(y * .02); y == 120 ? sg.moveTo(xx, y) : sg.lineTo(xx, y) } sg.stroke() } drone2D(560, 180, .9, t);
      sg.globalAlpha = sr(t, M.trench + 3.2, M.trench + 3.8); pill('HASTA 20 KM DE LARGO', 360, 600, '#6a2a0a', '#fff', 34); sg.globalAlpha = sr(t, Ln.c3.end - 1.8, Ln.c3.end - 1.2); txt('UNOS METROS DE HONDO', 360, 670, 34, gold); sg.globalAlpha = 1 }
    else if (t < M.ans) { bgS(t, '#0a1020', '#141e36', 'rgba(200,220,255,.07)'); txt('LA INVESTIGACIÓN', 360, 66, 54, '#fff'); pill('AUSTRALIA', 210, 150, '#1a3a6a', '#fff', 32); pill('ESLOVENIA', 510, 150, '#2a4a8a', '#fff', 32);
      const ic = [[drone2D, 150, 'DRONES'], [sat2D, 360, 'SATÉLITES'], [drill2D, 570, 'PERFORACIONES']]; ic.forEach(([f, x, s], i) => { const k = sr(t, M.study + .8 + i * .9, M.study + 1.3 + i * .9); sg.globalAlpha = k; f(x, 360, i == 1 ? .7 : .9, t); txt(s, x, 500, 28, gold); sg.globalAlpha = 1 }) }
    else if (t < M.mars) { bgS(t, '#1a0c06', '#2e160a', 'rgba(255,216,176,.07)'); const k = sr(t, M.ans + 3.0, Ln.c5.end - .6); txt('NO SON RÍOS', 330, 66, 50, '#fff'); cross(590, 66, 26, '#ff3a4a', sr(t, M.ans + .4, M.ans + 1.2));
      section2D(t, k, 40, 640, 300); sg.globalAlpha = sr(t, M.ans + 3.4, M.ans + 4.0); arrow(560, 560, 560, 380, gold, 1, 8); txt('SE DERRUMBA', 560, 600, 28, gold); txt('HACIA ARRIBA', 560, 635, 28, gold); sg.globalAlpha = 1 }
    else if (t < M.pub) { bgS(t, '#1a0806', '#30100a', 'rgba(255,190,160,.07)'); txt('COMO MARTE', 360, 70, 70, '#ffb090', { glow: '#ff5a2a' }); moon2D(360, 330, 160, '#c0582a'); sg.fillStyle = '#1a0a06'; sg.beginPath(); sg.ellipse(430, 250, 30, 12, -.2, 0, 7); sg.fill();
      const k = sr(t, M.mars + 4.6, M.mars + 5.4); sg.globalAlpha = k; for (let i = 0; i < 6; i++) { const x = 120 + i * 90, w = (t * .9 + i * .3) % 1; arrow(x, 120 + w * 120, x + 10, 160 + w * 120, '#c8ff5a', 1, 5) } sg.globalAlpha = sr(t, Ln.c6.end - 2.0, Ln.c6.end - 1.4); pill('REFUGIO CONTRA LA RADIACIÓN', 360, 600, '#5a1a0a', '#fff', 30); sg.globalAlpha = 1 }
    else { bgS(t, '#100a06', '#20140c', 'rgba(255,230,200,.07)'); txt('COMMUNICATIONS', 360, 120, 58, '#fff'); txt('EARTH & ENVIRONMENT', 360, 190, 44, oc); section2D(t, .7, 120, 480, 440); sg.globalAlpha = sr(t, M.pub + 2.0, M.pub + 2.6); stampMark('NUEVO ESTUDIO', 360, 262, 1, gold, -.05, 44); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,216,176,.6)');
  }
  const sc = [2, -1, -22], tc = [6, 0, -30];
  const K = autoK([[0, [10, 3, -10], sc, 54], [M.title - .3, [-10, 4, -8], sc, 56], [M.title + .9, [0, 4.8, 6.8], [0, 5.0, -1], 60]],
    [M.who, M.sea, M.trench, M.study, M.ans, M.mars, M.pub],
    [[[[0, 30, 10], [0, 0, -40], 60], [[12, 26, 4], [0, 0, -40], 60], 2.6], null, [[[-4, 18, 0], [6, 0, -30], 58], [[16, 16, -2], [6, 0, -30], 58], 2.6], [[[-3, 7, -12], [0, 6, -20], 52], [[3, 8, -12], [0, 6, -20], 52], 2.2], [[[6, 2, -16], sc, 48], [[-2, 2.5, -15], sc, 48], 2.4], [[[0, 3, -10], [40, -20, -120], 50], [[6, 2.5, -10], [40, -20, -120], 50], 2.6], null],
    [[M.endcard, [-10, 4, -8], sc, 54], [C.dur, [10, 5, -8], sc, 56]]);
  frame = function (t) {
    const my = lerp(-20, 14, ss(sr(t, M.mars - .5, M.mars + 4))); MARS.position.y = my; MARS.rotation.y = t * .05;
    DR.position.set(Math.sin(t * .23) * 8, 6 + Math.sin(t * .7) * .5, -20 + Math.cos(t * .19) * 6); DR.rotation.y = t * .2; PROPS.forEach(p => p.rotation.y = t * 40); DRL.material.opacity = (t * 2 % 1) < .5 ? .9 : .2;
    const dk = win(t, M.ans + 2.5, M.mars, .6, .6); DUST.forEach((d, i) => { const w = (t * .3 + hash(i)) % 1; d.position.set(2 + (hash(i * 3) - .5) * 5, -1 + w * 3, -22 + (hash(i * 5) - .5) * 5); d.material.opacity = .7 * dk * Math.sin(w * PI) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .05 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,150,80,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.sea, M.trench, M.study, M.ans, M.mars, M.pub]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VIVIRÍAS EN UNA<br>CUEVA EN MARTE?', qs: 100, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

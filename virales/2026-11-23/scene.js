// Virales 23/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: la Voyager 1 llega a un día luz · p2: Jonathan, la tortuga de 194 años y su ADN · p3: el Niño de Taung complica la evolución humana
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'UN DÍA<br>LUZ', ts: 160, tag: 'ESPACIO<b>RÉCORD HISTÓRICO</b>', sub: 'VOYAGER 1', spk: { n: ['#8ae0ff', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: '194<br>AÑOS', ts: 170, tag: 'ANIMALES<b>CIENCIA</b>', sub: 'EL SECRETO DE JONATHAN', spk: { n: ['#b8ff9a', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'EL NIÑO<br>DE TAUNG', ts: 140, tag: 'EVOLUCIÓN<b>NUEVO ESTUDIO</b>', sub: '3 MILLONES DE AÑOS', spk: { n: ['#ffc08a', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — VOYAGER 1 A UN DÍA LUZ (espacio interestelar, turquesa y dorado)
if (P == 1) {
  scene.background = new THREE.Color(0x020812); scene.fog = null; const STARS = starField(5000, 140, -1, 1.0, .45);
  hemi.color.setHex(0xcfe8ff); hemi.groundColor.setHex(0x102030); hemi.intensity = 1.1; R.toneMappingExposure = 1.2;
  const key = new THREE.DirectionalLight(0xfff0d0, 2.4); key.position.set(-20, 8, 30); scene.add(key);
  const PR = [5, 0, -14];
  const PG = grp(scene); PG.position.set(...PR);
  const foil = new THREE.MeshStandardMaterial({ color: 0xd8b060, metalness: .8, roughness: .35 }), wht = new THREE.MeshStandardMaterial({ color: 0xf0f2f6, metalness: .2, roughness: .5, side: THREE.DoubleSide }), dk = mat(0x3a3a40), gry = mat(0xa0a8b4);
  add(PG, new THREE.CylinderGeometry(.75, .75, .5, 10), foil, 0, 0, 0);
  const dish = add(PG, new THREE.SphereGeometry(2.2, 40, 12, 0, 2 * PI, 0, .55), wht, 0, 2.8, 0); dish.rotation.x = PI;
  add(PG, G.cyl, gry, 0, 1.3, 0).scale.set(.06, 1.4, .06); sph(PG, .1, gry, 0, 2.0, 0);
  const b1 = add(PG, G.cyl, gry, -1.6, -.2, 0); b1.scale.set(.05, 3.2, .05); b1.rotation.z = PI / 2 - .3;
  const rtg = add(PG, G.cyl, dk, -3.1, -.7, 0); rtg.scale.set(.22, .9, .22); rtg.rotation.z = PI / 2 - .3;
  const b2 = add(PG, G.cyl, gry, 2.0, -.1, 0); b2.scale.set(.04, 4, .04); b2.rotation.z = PI / 2 + .15;
  const b3 = add(PG, G.cyl, gry, .4, -1.8, .6); b3.scale.set(.04, 3.2, .04); b3.rotation.x = .4;
  const GD = add(PG, new THREE.CircleGeometry(.3, 32), new THREE.MeshStandardMaterial({ color: 0xffc040, metalness: 1, roughness: .2, emissive: 0x3a2400 }), 0, 0, .77);
  PG.rotation.set(.35, -.5, .1);
  const SUN = glowSprite(scene, 0xfff4d0, 4, -60, 10, 110); glowSprite(scene, 0xffd080, 14, -60, 10, 110).material.opacity = .35;
  const EARTH = glowSprite(scene, 0x6ab8ff, 1.6, -54, 8, 104);
  const PULSE = glowSprite(scene, 0x8ae0ff, 2.2, 0, 0, 0);
  const beamG = new THREE.BufferGeometry().setFromPoints([V(-54, 8, 104), V(...PR)]); const BEAM = new THREE.Line(beamG, new THREE.LineBasicMaterial({ color: 0x8ae0ff, transparent: true, opacity: .25 })); scene.add(BEAM);
  makePanel(V(0, 4.2, 0), 0, 4.4, 0x8ae0ff, 0x2a9aff);
  function draw(t) {
    const gold = '#ffd95a', cy = '#8ae0ff';
    if (t < M.who) { bgS(t, '#020c1a', '#06203a', 'rgba(138,224,255,.07)'); txt('UN MENSAJE A LA', 360, 70, 44, cy); txt('VELOCIDAD DE LA LUZ', 360, 125, 44, cy); circ(110, 330, 34, '#3a8aff', '#6ab8ff'); txt('TIERRA', 110, 400, 28, '#fff'); probe2D(600, 340, .45, t);
      const k = ramp(t, .4, 3.6); sg.strokeStyle = 'rgba(138,224,255,.35)'; sg.lineWidth = 4; sg.setLineDash([10, 12]); sg.beginPath(); sg.moveTo(150, 330); sg.lineTo(540, 335); sg.stroke(); sg.setLineDash([]); circ(lerp(150, 540, k), 330, 14, '#fff', cy);
      txt(Math.round(24 * ss(k)) + ' h', 360, 560, 150, '#fff', { glow: '#2a9aff', blur: 40 }) }
    else if (t < M.date) { bgS(t, '#04101e', '#0a2440', 'rgba(138,224,255,.07)'); txt('VOYAGER 1', 360, 90, 92, '#fff', { glow: '#2a9aff', blur: 36 }); probe2D(360, 360, 1.0, t); const k = sr(t, M.who + 2.2, M.who + 2.8); sg.globalAlpha = k; pill('SALIÓ EN 1977', 360, 600, '#1a4a7a', '#fff', 50); sg.globalAlpha = 1 }
    else if (t < M.dist) { bgS(t, '#0a0c20', '#161a44', 'rgba(200,200,255,.07)'); txt('18 DE NOVIEMBRE', 360, 90, 56, '#d8d8ff'); txt('2026', 360, 170, 60, gold); const k = sr(t, M.date + 1.6, M.date + 2.4);
      txt('1', 360, 380, 260 * (.6 + .4 * k), '#fff', { glow: '#8ae0ff', blur: 50 }); txt('DÍA LUZ', 360, 540, 74, cy); stampMark('HISTÓRICO', 360, 650, ramp(t, Ln.d2.end - .9, Ln.d2.end - .3), gold, -.06, 50) }
    else if (t < M.light) { bgS(t, '#061424', '#0a2a40', 'rgba(138,224,255,.07)'); txt('DISTANCIA', 360, 70, 50, cy); const k = ss(ramp(t, M.dist + .4, M.dist + 2.6)); txt('≈ ' + fmt(25900 * k), 360, 210, 120, '#fff', { glow: '#2a9aff', blur: 36 }); txt('MILLONES DE KM', 360, 310, 46, gold);
      const k2 = sr(t, M.dist + 3.4, M.dist + 4.0); sg.globalAlpha = k2; txt('VELOCIDAD', 360, 430, 40, cy); txt(fmt(61000 * ss(ramp(t, M.dist + 3.4, M.dist + 5.0))), 300, 530, 100, '#fff', { glow: '#ff9a00', blur: 30 }); txt('km/h', 560, 545, 44, gold); sg.globalAlpha = 1 }
    else if (t < M.cmd) { bgS(t, '#0a0a1a', '#141434', 'rgba(255,217,90,.06)'); txt('LO QUE TARDA LA LUZ', 360, 70, 46, '#ffe0a0');
      const rows = [['LUNA', '≈ 1 s', .03, '#c8c8d8', M.light + .6], ['NEPTUNO', '≈ 4 h', .17, '#5a8aff', M.light + 3.2], ['VOYAGER 1', '24 h', 1, cy, M.light + 5.2]];
      rows.forEach(([nm, v, w, c, t0], i) => { const k = sr(t, t0, t0 + .8); sg.globalAlpha = cl(k * 3); txt(nm, 60, 190 + i * 160, 40, '#fff', { a: 'left' }); txt(v, 660, 190 + i * 160, 44, c, { a: 'right' }); bar(60, 225 + i * 160, 600, 40, w * k, c); sg.globalAlpha = 1 }) }
    else if (t < M.pow) { bgS(t, '#04141a', '#082a30', 'rgba(138,255,224,.07)'); txt('UNA ORDEN DE LA NASA', 360, 70, 44, '#a8ffe8'); circ(110, 320, 40, '#3a8aff', '#6ab8ff'); probe2D(600, 320, .4, t);
      arrow(170, 280, 530, 280, cy, sr(t, M.cmd + .3, M.cmd + 1.8)); txt('IDA: 1 DÍA', 350, 230, 38, cy); const k = sr(t, M.cmd + 2.4, M.cmd + 3.6); if (k > 0) { arrow(530, 370, 170, 370, gold, k); txt('VUELTA: 1 DÍA', 350, 430, 38, gold) }
      const k2 = sr(t, Ln.d5.end - .8, Ln.d5.end - .2); sg.globalAlpha = k2; pill('= 2 DÍAS', 360, 590, '#1a5a6a', '#fff', 64); sg.globalAlpha = 1 }
    else if (t < M.gold) { bgS(t, '#1a1004', '#2e2008', 'rgba(255,217,90,.07)'); txt('ENERGÍA NUCLEAR', 360, 70, 50, '#ffe0a0'); const lvl = 1 - .7 * ss(ramp(t, M.pow + 1.0, M.pow + 5.5));
      sg.strokeStyle = '#fff'; sg.lineWidth = 8; sg.beginPath(); sg.roundRect(110, 170, 340, 150, 18); sg.stroke(); sg.fillStyle = '#fff'; sg.fillRect(450, 215, 22, 60); sg.fillStyle = lvl > .5 ? '#4aff9a' : '#ffb03a'; sg.fillRect(124, 184, 312 * lvl, 122);
      txt('≈ 50', 580, 220, 70, '#fff'); txt('AÑOS', 580, 280, 34, gold); const k = sr(t, M.pow + 2.6, M.pow + 3.2); sg.globalAlpha = k; txt('−4 W', 360, 440, 110, '#ffb03a', { glow: '#ff6a00', blur: 30 }); txt('POR AÑO', 360, 520, 40, '#fff'); sg.globalAlpha = 1;
      stampMark('APAGANDO APARATOS', 360, 640, ramp(t, Ln.d6.end - 1.8, Ln.d6.end - 1.2), '#ff5a3a', -.05, 44) }
    else { bgS(t, '#140e02', '#2a1e06', 'rgba(255,217,90,.07)'); txt('ESPACIO INTERESTELAR', 360, 70, 44, '#ffe0a0'); txt('DESDE 2012', 360, 130, 52, '#fff'); const k = sr(t, M.gold + 2.4, M.gold + 3.2); if (k > 0) disc2D(360, 390, 170 * k, t);
      sg.globalAlpha = sr(t, Ln.d7.end - 2.4, Ln.d7.end - 1.8); pill('SONIDOS Y SALUDOS', 360, 640, '#6a4a10', '#fff', 42); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(138,224,255,.6)');
  }
  const K = autoK([[0, [PR[0] + 6, PR[1] + 2, PR[2] + 9], PR, 50], [M.title - .3, [PR[0] - 5, PR[1] + 3, PR[2] + 10], PR, 52], [M.title + .9, [0, 3.2, 12], [0, 3.8, 0], 60]],
    [M.who, M.date, M.dist, M.light, M.cmd, M.pow, M.gold],
    [[near(PR, [4, 1.5, 6], 46), near(PR, [-3, 2, 7], 48), 2.4], [near(PR, [8, 5, 14], 56), near(PR, [2, 6, 16], 58), 2.0], [near(PR, [-6, 2, -9], 50), near(PR, [-8, 3, -6], 50), 2.6], null,
     [near(PR, [3, -1, 5], 44), near(PR, [-2, -1.5, 6], 46), 2.0], [near([PR[0] - 2.6, PR[1] - .6, PR[2]], [1.5, 1, 3], 40), near([PR[0] - 2.6, PR[1] - .6, PR[2]], [-1, 1.4, 3.4], 42), 2.4], [near(PR, [2.4, 1.2, 6], 42), near(PR, [-1.2, 1.4, 6.5], 44), 2.6]],
    [[M.endcard, [PR[0] - 7, PR[1] + 4, PR[2] + 12], PR, 56], [C.dur, [PR[0] - 10, PR[1] + 5, PR[2] + 14], PR, 58]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; PG.rotation.y = -.5 + t * .03; PG.position.x = PR[0] + Math.sin(t * .2) * .1;
    const pk = (t * .25) % 1; PULSE.position.set(lerp(-54, PR[0], pk), lerp(8, PR[1], pk), lerp(104, PR[2], pk)); PULSE.material.opacity = .9 * Math.sin(pk * PI);
    EARTH.scale.setScalar(1.6 + .2 * Math.sin(t * 2));
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(60,160,255,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.who, M.date, M.dist, M.light, M.cmd, M.pow, M.gold]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿TE SUBIRÍAS<br>SIN VUELTA?', qs: 115, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 2 — JONATHAN, 194 AÑOS (jardín en una isla del Atlántico Sur, día soleado)
if (P == 2) {
  skyDome('#3a8ae8', '#bfe4ff', '#e8f6ff'); scene.background = new THREE.Color(0xcfeaff); scene.fog = new THREE.Fog(0xd8eeff, 30, 150);
  hemi.color.setHex(0xf4fbff); hemi.groundColor.setHex(0x3a5a2a); hemi.intensity = 1.3; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xfff2d8, 2.4); sun.position.set(12, 18, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 60 }); scene.add(sun);
  const sea = add(scene, new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x2a6aa8, roughness: .15, metalness: .5 }), 0, -1.2, 0); sea.rotation.x = -PI / 2;
  const gT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .3, '20,60,10') }, 24, 24);
  const lawn = add(scene, new THREE.CylinderGeometry(45, 48, 2.4, 48), new THREE.MeshLambertMaterial({ color: 0x5a9a3a, map: gT }), 0, -1.2, -6, 2);
  const FL = []; for (let i = 0; i < 90; i++) { const a = hash(i * 1.9) * 2 * PI, r = 3 + hash(i * 3.3) * 16; const f = sph(scene, .06, mat([0xffe04a, 0xffffff, 0xff8ac8][i % 3]), Math.cos(a) * r, .05, Math.sin(a) * r - 4, 0); FL.push(f) }
  // the governor's house (generic white house)
  const H = grp(scene); H.position.set(-11, 0, -22); box(H, 12, 5, 6, mat(0xf4f0e6), 0, 2.5, 0); const roof = add(H, new THREE.CylinderGeometry(.01, 4.6, 3, 4), mat(0x5a6a7a), 0, 6.5, 0); roof.rotation.y = PI / 4; roof.scale.set(1.9, 1, .95);
  for (let i = 0; i < 5; i++) { box(H, 1, 1.6, .1, mat(0x2a3a4a), -4.4 + i * 2.2, 3.2, 3.02, 0); box(H, 1, 1.6, .1, mat(0x2a3a4a), -4.4 + i * 2.2, 1.0, 3.02, 0) }
  const trunk = mat(0x5a4030), leaf = [mat(0x2e7a2a), mat(0x3e8a32), mat(0x26602a)];
  for (let i = 0; i < 22; i++) { const a = hash(i * 2.3) * 2 * PI, r = 14 + hash(i * 4.1) * 18; const x = Math.cos(a) * r, z = Math.sin(a) * r - 8; if (z > 4) continue; const s = 1 + hash(i * 6) * .9, g = grp(scene); g.position.set(x, 0, z);
    const tr = add(g, G.cyl, trunk, 0, 2.5 * s, 0, 1); tr.scale.set(.25 * s, 5 * s, .25 * s); for (let k = 0; k < 4; k++) { const b = sph(g, (1.5 + hash(i + k) * .6) * s, leaf[(i + k) % 3], (hash(i * k + 1) - .5) * 1.8 * s, (5 + k * .6) * s, (hash(i * k + 2) - .5) * 1.8 * s); b.scale.y *= .8 } }
  // the tortoise (original stylised model)
  const TT = grp(scene); const hexT = tex(512, 256, (g, w, h) => { g.fillStyle = '#7a6a3e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2c14'; g.lineWidth = 7; for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { const cx = c * 60 + (r % 2) * 30, cy = r * 64 + 20; g.fillStyle = `rgb(${110 + hash(r * 9 + c) * 30 | 0},${92 + hash(r * 9 + c) * 25 | 0},${50})`; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i * PI / 3 + PI / 6; g.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 34) } g.closePath(); g.fill(); g.stroke() } speck(g, w, h, 2000, .25, '30,20,0') });
  const shM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: hexT, roughness: .7 }), skM = mat(0x8a8a6e), eyM = mat(0x111111);
  const shell = add(TT, new THREE.SphereGeometry(1, 40, 20, 0, 2 * PI, 0, PI / 2), shM, 0, .45, 0, 1); shell.scale.set(1.05, .85, 1.35);
  const rim = add(TT, new THREE.TorusGeometry(1.08, .09, 8, 40), mat(0x4a3a1e), 0, .47, 0, 1); rim.rotation.x = PI / 2; rim.scale.set(1, 1.27, 1);
  const legs = []; for (const [x, z] of [[-.8, .8], [.8, .8], [-.8, -.8], [.8, -.8]]) { const l = add(TT, G.cyl, skM, x, .25, z, 1); l.scale.set(.25, .5, .25); legs.push(l) }
  const NK = grp(TT); NK.position.set(0, .55, 1.2); const nk = add(NK, G.cyl, skM, 0, .15, .3, 1); nk.scale.set(.18, .7, .18); nk.rotation.x = 1.0;
  const HD = sph(NK, 1, skM, 0, .42, .68, 1); HD.scale.set(.24, .2, .3); for (const sx of [-1, 1]) sph(NK, .04, eyM, sx * .17, .48, .78, 0);
  TT.position.set(.8, 0, .6); TT.rotation.y = -.6;
  const BUT = []; for (let i = 0; i < 4; i++) { const b = grp(scene); for (const sx of [-1, 1]) { const w = add(b, new THREE.CircleGeometry(.09, 12), new THREE.MeshBasicMaterial({ color: [0xffffff, 0xffd84a][i % 2], side: THREE.DoubleSide }), sx * .08, 0, 0); w.userData.sx = sx } BUT.push(b) }
  makePanel(V(0, 5.0, -5.0), 0, 4.0, 0xb8ff9a, 0x40c040);
  function draw(t) {
    const gold = '#ffd95a', gr = '#b8ff9a';
    if (t < M.name) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('TENDRÍA', 360, 80, 48, gr); txt(Math.round(194 * ss(ramp(t, .3, 2.6))) + '', 360, 220, 190, '#fff', { glow: '#ffb000', blur: 44 }); txt('AÑOS', 360, 340, 60, gold); tort2D(360, 520, 1.05, t) }
    else if (t < M.home) { bgS(t, '#14100a', '#2a2010', 'rgba(255,217,90,.07)'); txt('SE LLAMA', 360, 70, 42, '#ffe0a0'); txt('JONATHAN', 360, 170, 104, gold, { glow: '#ff9a00', blur: 36 }); txt('TORTUGA GIGANTE', 360, 280, 44, '#fff'); txt('DE ALDABRA', 360, 335, 44, '#fff');
      tort2D(360, 480, .8, t); const k = sr(t, Ln.t1.end - 2.2, Ln.t1.end - 1.6); sg.globalAlpha = k; pill('NACIÓ ≈ 1832', 360, 640, '#5a4a1a', '#fff', 48); sg.globalAlpha = 1 }
    else if (t < M.arrive) { bgS(t, '#06203a', '#0a3a5a', 'rgba(140,220,255,.07)'); txt('DÓNDE VIVE', 360, 70, 50, '#9fdfff'); sg.fillStyle = '#5a9a3a'; sg.beginPath(); for (let i = 0; i < 26; i++) { const a = i / 26 * 2 * PI, r = 120 * (1 + .15 * Math.sin(a * 3 + 1) + .08 * Math.sin(a * 7)); sg.lineTo(360 + Math.cos(a) * r, 320 + Math.sin(a) * r * .75) } sg.closePath(); sg.fill();
      sg.strokeStyle = 'rgba(255,255,255,.4)'; sg.lineWidth = 3; for (let i = 1; i < 4; i++) { sg.beginPath(); sg.ellipse(360, 320, 140 + i * 40 + Math.sin(t * 2 + i) * 6, 105 + i * 30, 0, 0, 7); sg.stroke() } txt('SANTA ELENA', 360, 320, 52, '#fff', { glow: '#000', blur: 10 });
      const k = sr(t, M.home + 2.0, M.home + 2.6); sg.globalAlpha = k; pill('ATLÁNTICO SUR', 360, 540, '#1a4a7a', '#fff', 46); sg.globalAlpha = sr(t, M.home + 4.0, M.home + 4.6); txt('JARDÍN DEL GOBERNADOR', 360, 650, 36, gold); sg.globalAlpha = 1 }
    else if (t < M.oldest) { bgS(t, '#061a2a', '#0a304a', 'rgba(140,220,255,.07)'); txt('LLEGÓ COMO REGALO', 360, 70, 48, '#9fdfff'); circ(590, 220, 34, '#5a9a3a'); txt('SEYCHELLES', 590, 290, 30, '#fff'); circ(130, 420, 34, '#5a9a3a'); txt('SANTA ELENA', 150, 490, 30, '#fff');
      const k = sr(t, M.arrive + .8, M.arrive + 2.6); sg.strokeStyle = gold; sg.lineWidth = 6; sg.setLineDash([14, 12]); sg.beginPath(); for (let s = 0; s <= 30 * k; s++) { const u = s / 30; sg.lineTo(lerp(560, 170, u), lerp(240, 400, u) - Math.sin(u * PI) * 120) } sg.stroke(); sg.setLineDash([]);
      const n = Math.round(144 * ss(ramp(t, M.arrive + 1.6, M.arrive + 3.2))); txt('HACE ' + n + ' AÑOS', 400, 590, 60, '#fff', { glow: '#2a9aff' }); stampMark('YA ERA GRANDE', 360, 670, ramp(t, Ln.t3.end - 1.0, Ln.t3.end - .4), gold, -.05, 40) }
    else if (t < M.epi) { bgS(t, '#1a1404', '#362a08', 'rgba(255,217,90,.07)'); const k = sr(t, M.oldest + .3, M.oldest + 1.0); circ(360, 280, 150 * k, '#e0a830', '#ffc040'); circ(360, 280, 120 * k, '#ffd95a'); txt('#1', 360, 285, 150 * k + 1, '#6a4a10');
      txt('EL ANIMAL TERRESTRE', 360, 510, 44, '#fff'); txt('VIVO MÁS VIEJO', 360, 570, 56, gold); txt('QUE SE CONOCE', 360, 630, 36, '#ffe0a0') }
    else if (t < M.var) { bgS(t, '#0a1424', '#142a44', 'rgba(160,200,255,.07)'); txt('EPIGENOMA', 360, 70, 70, '#fff', { glow: '#4a8aff' }); helix(80, 640, 250, 60, t, '#4affb0', '#ff9a4a', 30);
      const k = sr(t, M.epi + 2.8, M.epi + 3.4); for (let i = 0; i < 5; i++) { const on = (Math.floor(t * 1.5) + i) % 2; sg.globalAlpha = k; circ(140 + i * 110, 420, 26, on ? '#4aff9a' : '#ff4a4a', on ? '#4aff9a' : '#ff4a4a'); txt(on ? 'ON' : 'OFF', 140 + i * 110, 470, 24, '#fff') } sg.globalAlpha = 1;
      txt('MARCAS QUE PRENDEN', 360, 540, 34, gold); txt('Y APAGAN GENES', 360, 585, 34, gold); const k2 = sr(t, Ln.t5.end - 2.4, Ln.t5.end - 1.8); sg.globalAlpha = k2; pill('VS. TORTUGAS JÓVENES', 360, 665, '#2a4a8a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.stable) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt(Math.round(287 * ss(ramp(t, M.var + .6, M.var + 2.4))) + '', 360, 150, 160, '#fff', { glow: '#4aff6a', blur: 40 }); txt('VARIANTES ANTI-ENVEJECIMIENTO', 360, 260, 32, gold);
      [['REPARAR EL ADN', '#2a7a4a'], ['INFLAMACIÓN', '#2a5a8a'], ['INSULINA', '#7a5a1a'], ['FRENAR EL CÁNCER', '#8a2a3a']].forEach(([s, c], i) => { sg.globalAlpha = sr(t, M.var + 4.2 + i * 1.0, M.var + 4.7 + i * 1.0); pill(s, 360, 350 + i * 92, c, '#fff', 40) }); sg.globalAlpha = 1 }
    else { bgS(t, '#141a06', '#2a3a0a', 'rgba(220,255,140,.07)'); txt('REPARACIÓN DEL ADN', 360, 70, 46, '#e0ffa0'); const k = ss(ramp(t, M.stable + 1.0, M.stable + 2.6));
      txt('JONATHAN', 70, 190, 40, '#fff', { a: 'left' }); bar(70, 220, 580, 50, .92 * k, gold); txt('TORTUGA JOVEN', 70, 330, 40, '#fff', { a: 'left' }); bar(70, 360, 580, 50, .95 * k, '#4aff9a'); stampMark('CASI IGUAL', 360, 500, ramp(t, M.stable + 2.8, M.stable + 3.4), '#4aff9a', -.05, 64);
      sg.globalAlpha = sr(t, Ln.t7.end - 2.0, Ln.t7.end - 1.4); pill('SCIENCE ADVANCES', 360, 640, '#3a4a1a', '#fff', 42); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(184,255,154,.6)');
  }
  const tc = [.8, .9, .6], hc = [1.4, 1.0, 1.4];
  const K = autoK([[0, [5.6, 2.6, 7.4], tc, 44], [M.title - .2, [-3.6, 2.8, 7.6], tc, 46], [M.title + .9, [0, 3.8, 3.6], [0, 5.0, -5.0], 60]],
    [M.name, M.home, M.arrive, M.oldest, M.epi, M.var, M.stable],
    [[near(hc, [3.6, 1.0, 4.4], 40), near(hc, [.6, 1.2, 5.2], 42), 2.4], [[[-4, 3.5, 6], [-11, 3, -22], 50], [[2, 4, 7], [-11, 3, -22], 52], 2.6], [[[8, 4, 10], [0, -1, -40], 60], [[-6, 4, 10], [0, -1, -40], 60], 2.4], [near(tc, [-5, 1.6, 6], 44), near(tc, [4.6, 2.0, 6.4], 46), 2.0], null, [near(hc, [3.0, .8, 3.8], 38), near(hc, [-.6, 1.0, 4.4], 40), 2.0], null],
    [[M.endcard, [5.4, 2.6, 7.2], tc, 46], [C.dur, [-3.4, 3.0, 7.8], tc, 48]]);
  frame = function (t) {
    NK.rotation.y = Math.sin(t * .5) * .35; NK.rotation.x = Math.sin(t * .7) * .1 - .05; HD.scale.z = .3 * (1 + .03 * Math.sin(t * 3)); legs.forEach((l, i) => l.rotation.x = Math.sin(t * .8 + i * PI / 2) * .05);
    BUT.forEach((b, i) => { b.position.set(.8 + Math.sin(t * .6 + i * 2) * 3, 1.4 + Math.sin(t * 1.3 + i) * .5, .6 + Math.cos(t * .5 + i * 2) * 2.4); b.children.forEach(w => w.rotation.y = w.userData.sx * (.3 + Math.abs(Math.sin(t * 14 + i)) * 1.1)) });
    sea.material.color.setHSL(.58, .6, .38 + .02 * Math.sin(t));
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(120,220,120,.04)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.name, M.home, M.arrive, M.oldest, M.epi, M.var, M.stable]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VIVIRÍAS<br>200 AÑOS?', qs: 130, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 3 — EL NIÑO DE TAUNG (Sudáfrica hace 3 millones de años, amanecer húmedo y boscoso)
if (P == 3) {
  skyDome('#4a3a8a', '#ff9a6a', '#ffd8a0'); scene.background = new THREE.Color(0xffc090); scene.fog = new THREE.Fog(0xffc898, 18, 110);
  hemi.color.setHex(0xffe8d0); hemi.groundColor.setHex(0x3a3a1a); hemi.intensity = 1.35; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xffb880, 2.6); sun.position.set(25, 10, -20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 80 }); scene.add(sun);
  glowSprite(scene, 0xfff0b0, 18, 70, 12, -100); glowSprite(scene, 0xff8040, 70, 70, 12, -100).material.opacity = .45;
  const gT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .3, '60,40,10') }, 30, 30);
  const floor = add(scene, new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: 0x7a7a3a, map: gT }), 0, 0, 0, 2); floor.rotation.x = -PI / 2;
  const rockM = [mat(0x9a7a5a), mat(0x8a6a4a), mat(0xa88a6a)];
  const PED = add(scene, rockGeo(3, 3), rockM[0], 0, .45, 0, 3); PED.scale.set(1.3, .7, 1.1);
  for (let i = 0; i < 26; i++) { const a = hash(i * 1.3) * 2 * PI, r = 4 + hash(i * 2.2) * 30; const s = .4 + hash(i * 3.5) * 2.2; const rk = add(scene, rockGeo(i, 2), rockM[i % 3], Math.cos(a) * r, s * .3, Math.sin(a) * r - 6, 3); rk.scale.setScalar(s) }
  const trunk = mat(0x4a3424), leafM = [mat(0x3a6a22), mat(0x4a7a2a), mat(0x2e5a1e)];
  for (let i = 0; i < 70; i++) { const x = (hash(i * 1.7) - .5) * 120, z = -8 - hash(i * 2.9) * 90; const s = 1 + hash(i * 4.4) * 1.4, g = grp(scene); g.position.set(x, 0, z);
    const tr = add(g, G.cyl, trunk, 0, 3 * s, 0, 1); tr.scale.set(.25 * s, 6 * s, .25 * s); if (i % 2) { const c = sph(g, 3 * s, leafM[i % 3], 0, 6.4 * s, 0); c.scale.y *= .35 } else for (let k = 0; k < 3; k++) sph(g, (1.6 + hash(i + k)) * s, leafM[(i + k) % 3], (hash(i * k + 1) - .5) * 2 * s, (5.6 + k * .7) * s, (hash(i * k + 2) - .5) * 2 * s) }
  // the fossil (original stylised skull, no real image)
  const SK = grp(scene); SK.position.set(0, 1.25, 0); const bone = new THREE.MeshStandardMaterial({ color: 0xe8d4a8, roughness: .6, emissive: 0x3a2a10 }), dk = mat(0x3a2a18);
  const cr = sph(SK, 1, bone, 0, .12, -.04, 1); cr.scale.set(.3, .27, .36); const fc = sph(SK, 1, bone, 0, -.03, .22, 1); fc.scale.set(.24, .22, .2);
  for (const sx of [-1, 1]) { const e = sph(SK, 1, dk, sx * .1, .04, .4, 0); e.scale.set(.075, .065, .05) } const ns = sph(SK, 1, dk, 0, -.07, .45, 0); ns.scale.set(.03, .05, .03);
  const jaw = sph(SK, 1, bone, 0, -.2, .26, 1); jaw.scale.set(.22, .1, .17); for (let i = 0; i < 6; i++) box(SK, .03, .04, .03, mat(0xfff8e0), -.08 + i * .032, -.14, .42, 0);
  const SKG = glowSprite(scene, 0xffd080, 3.4, 0, 1.3, 0); SKG.material.opacity = .4;
  const DUST = []; for (let i = 0; i < 40; i++) { const d = glowSprite(scene, 0xfff0c0, .12, 0, 0, 0); d.material.opacity = .6; DUST.push(d) }
  makePanel(V(0, 5.6, -6), 0, 4.0, 0xffc08a, 0xff7a30);
  function draw(t) {
    const gold = '#ffd95a', or = '#ffc08a';
    if (t < M.taung) { bgS(t, '#200c06', '#3a160a', 'rgba(255,192,138,.07)'); txt('HACE', 360, 70, 44, or); txt(Math.round(3 * ss(ramp(t, .3, 2.0))) + ' MILLONES', 360, 160, 80, '#fff', { glow: '#ff6a2a' }); txt('DE AÑOS', 360, 240, 46, gold); skull2D(360, 470, 1.15, '#e8d8b0', t); txt('?', 610, 360, 120, gold, { glow: '#ffb000' }) }
    else if (t < M.age) { bgS(t, '#1a1006', '#36200a', 'rgba(255,217,90,.07)'); txt('EL NIÑO', 360, 80, 84, '#fff', { glow: '#ff9a00' }); txt('DE TAUNG', 360, 170, 84, gold, { glow: '#ff9a00' }); skull2D(360, 380, .9, '#e8d8b0', t);
      const k = sr(t, M.taung + 2.6, M.taung + 3.2); sg.globalAlpha = k; pill('SUDÁFRICA · 1924', 360, 560, '#6a3a1a', '#fff', 44); sg.globalAlpha = sr(t, Ln.k1.end - 3.2, Ln.k1.end - 2.6); txt('Australopithecus africanus', 360, 660, 40, '#ffe0a0', { w: 800 }); sg.globalAlpha = 1 }
    else if (t < M.only) { bgS(t, '#14100a', '#2a2010', 'rgba(255,217,90,.07)'); txt('SU EDAD', 360, 70, 56, '#ffe0a0'); const k = ss(ramp(t, M.age + 1.6, M.age + 3.2)); sg.fillStyle = 'rgba(255,255,255,.15)'; sg.fillRect(60, 330, 600, 14);
      for (let i = 0; i <= 4; i++) { const x = 60 + i * 150; sg.fillStyle = '#fff'; sg.fillRect(x - 2, 315, 4, 44); txt((2.8 + i * .1).toFixed(1).replace('.', ','), x, 395, 28, '#fff') } sg.fillStyle = gold; sg.shadowColor = gold; sg.shadowBlur = 24; sg.fillRect(300, 318, 105 * k, 38); sg.shadowBlur = 0;
      txt('2,96 – 3,03', 360, 210, 100, '#fff', { glow: '#ff9a00', blur: 30 }); txt('MILLONES DE AÑOS', 360, 520, 46, gold) }
    else if (t < M.teeth) { bgS(t, '#0a1a10', '#16301a', 'rgba(184,255,154,.07)'); txt('ÚNICO FÓSIL', 360, 70, 60, '#b8ff9a'); txt('SEGURO DE SU ESPECIE', 360, 130, 42, '#fff'); skull2D(360, 360, .85, '#ffe0a0', t); check(360, 560, 40, '#4aff9a', ramp(t, M.only + 1.4, M.only + 2.0));
      for (const [x, y] of [[110, 600], [610, 600], [110, 260], [610, 260]]) { sg.globalAlpha = .5; skull2D(x, y, .32, '#9a8a6a', t); sg.globalAlpha = 1; txt('?', x, y - 70, 44, gold) } }
    else if (t < M.many) { bgS(t, '#06142a', '#0a2a4a', 'rgba(140,200,255,.07)'); txt('CÓMO CRECÍAN', 360, 70, 56, '#9fd8ff'); const k1 = sr(t, M.teeth + .6, M.teeth + 1.2), k2 = sr(t, M.teeth + 1.8, M.teeth + 2.4);
      sg.globalAlpha = k1; sg.fillStyle = '#fff8e0'; sg.beginPath(); sg.moveTo(140, 200); sg.quadraticCurveTo(200, 170, 260, 200); sg.lineTo(250, 300); sg.lineTo(225, 260); sg.lineTo(200, 330); sg.lineTo(175, 260); sg.lineTo(150, 300); sg.closePath(); sg.fill(); txt('DIENTES', 200, 380, 38, gold);
      sg.globalAlpha = k2; sg.fillStyle = '#ff9ab8'; sg.beginPath(); sg.ellipse(520, 260, 110, 80, 0, 0, 7); sg.fill(); sg.strokeStyle = '#c85a7a'; sg.lineWidth = 6; for (let i = 0; i < 5; i++) { sg.beginPath(); sg.arc(470 + i * 26, 250 + (i % 2) * 30, 26, .5, 2.8); sg.stroke() } txt('CEREBRO', 520, 380, 38, gold); sg.globalAlpha = 1;
      stampMark('CRECÍAN DISTINTO', 360, 560, ramp(t, Ln.k4.end - 1.0, Ln.k4.end - .4), '#ff5a3a', -.05, 52) }
    else if (t < M.clim) { bgS(t, '#1a0c20', '#301640', 'rgba(220,180,255,.07)'); const k = ss(ramp(t, M.many + .8, M.many + 3.0)); txt(k < .5 ? '¿1 ESPECIE?' : '¿VARIAS?', 360, 80, 70, '#fff', { glow: '#a04aff' });
      const cols = ['#ffb070', '#7ad0ff', '#b8ff9a', '#ff8ac8']; for (let i = 0; i < 4; i++) { const a = i / 4 * 2 * PI + .6, r = 150 * k; sg.globalAlpha = .9; circ(360 + Math.cos(a) * r, 340 + Math.sin(a) * r, 110 - 40 * k, k < .1 ? '#ffb070' : cols[i]); sg.globalAlpha = 1; if (k > .6) skull2D(360 + Math.cos(a) * r - 6, 350 + Math.sin(a) * r + 14, .3, '#fff0d0', t) }
      sg.globalAlpha = sr(t, Ln.k5.end - 1.8, Ln.k5.end - 1.2); pill('MISMA ZONA DE SUDÁFRICA', 360, 640, '#4a2a6a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.bush) { const wet = Math.sin((t - M.clim) * 1.6) > 0; bgS(t, wet ? '#06202a' : '#2a1a06', wet ? '#0a3a3a' : '#4a2e0a', 'rgba(255,255,255,.06)'); txt('EL CLIMA', 360, 70, 60, '#fff'); txt(wet ? 'HÚMEDO' : 'SECO', 360, 150, 70, wet ? '#7ae0ff' : '#ffb03a', { glow: wet ? '#2a9aff' : '#ff6a00' });
      if (wet) { for (let i = 0; i < 40; i++) { const x = hash(i) * 720, y = (hash(i * 2) * 720 + t * 600) % 720; sg.strokeStyle = 'rgba(160,220,255,.5)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(x, y); sg.lineTo(x - 6, y + 24); sg.stroke() } } else burst(600, 200, 70, '#ffd95a', t);
      const sep = .5 + .5 * Math.sin((t - M.clim) * 1.6 + PI); for (let g = 0; g < 2; g++) for (let i = 0; i < 6; i++) circ(360 + (g ? 1 : -1) * (40 + 140 * sep) + (hash(i + g * 9) - .5) * 80, 420 + (hash(i * 3 + g) - .5) * 120, 18, g ? '#ffb070' : '#7ad0ff');
      txt('SE SEPARABAN Y SE JUNTABAN', 360, 640, 34, gold) }
    else { bgS(t, '#0a1a0a', '#163016', 'rgba(184,255,154,.07)'); txt('NO UN TRONCO...', 360, 70, 50, '#b8ff9a'); const k = ramp(t, M.bush + .6, M.bush + 4.5); sg.strokeStyle = '#c89a5a'; sg.lineCap = 'round';
      function br(x, y, a, l, d, id) { if (d > 6 || hash(id) > .93 && d > 2) return; const kk = cl(k * 7 - d); if (kk <= 0) return; const x2 = x + Math.cos(a) * l * kk, y2 = y + Math.sin(a) * l * kk; sg.lineWidth = 14 - d * 2; sg.beginPath(); sg.moveTo(x, y); sg.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x2, y2); sg.stroke(); if (kk >= 1) { br(x2, y2, a - .5 - hash(id * 2) * .5, l * .75, d + 1, id * 2 + 1); br(x2, y2, a + .4 + hash(id * 3) * .6, l * .72, d + 1, id * 2 + 2); if (d % 2) br(x2, y2, a + 1.6, l * .5, d + 2, id * 5 + 3) } }
      br(360, 600, -PI / 2, 110, 0, 1); sg.lineCap = 'butt'; stampMark('UN ARBUSTO ENREDADO', 360, 160, ramp(t, Ln.k7.end - 1.6, Ln.k7.end - 1.0), gold, -.04, 46);
      sg.globalAlpha = sr(t, M.bush + 1.0, M.bush + 1.6); pill('UNIV. LIBRE DE BRUSELAS', 360, 665, '#2a5a2a', '#fff', 34); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,192,138,.6)');
  }
  const sc = [0, 1.3, 0];
  const K = autoK([[0, [3.4, 2.4, 4.6], sc, 42], [M.title - .2, [-3.2, 2.6, 4.8], sc, 44], [M.title + .9, [0, 4.4, 3.4], [0, 5.6, -6], 60]],
    [M.taung, M.age, M.only, M.teeth, M.many, M.clim, M.bush],
    [[near(sc, [2.0, .5, 3.0], 38), near(sc, [-1.6, .6, 3.2], 40), 2.4], null, [near(sc, [-2.8, .5, 2.8], 38), near(sc, [.8, .7, 3.4], 40), 2.0], [near(sc, [1.2, .1, 2.4], 34), near(sc, [-1.0, .2, 2.5], 34), 2.0], [[[-8, 5, 12], [0, 3, -40], 60], [[6, 5, 12], [0, 3, -40], 60], 2.4], [[[10, 3, 8], [60, 8, -90], 56], [[4, 3, 10], [60, 8, -90], 54], 2.4], null],
    [[M.endcard, [3.4, 2.4, 4.8], sc, 46], [C.dur, [-2.8, 2.8, 5.2], sc, 48]]);
  frame = function (t) {
    SK.rotation.y = Math.sin(t * .4) * .5 + .2; SKG.material.opacity = .32 + .08 * Math.sin(t * 2);
    DUST.forEach((d, i) => { const a = hash(i) * 6.28 + t * .1 * (hash(i * 2) + .2); d.position.set(Math.cos(a) * (1 + hash(i * 3) * 3), .3 + ((hash(i * 5) * 3 + t * .15) % 3), Math.sin(a) * (1 + hash(i * 3) * 3)) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.taung - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,140,60,.05)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.taung, M.age, M.only, M.teeth, M.many, M.clim, M.bush]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿SABÍAS QUE<br>HUBO TANTOS?', qs: 115, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

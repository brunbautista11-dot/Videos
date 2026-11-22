// Virales 22/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: el sistema de tres estrellas que no debería existir · p2: la rana voladora que pone huevos en gelatina · p3: dos monos aulladores nuevos
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'NO DEBERÍA<br>EXISTIR', ts: 140, tag: 'ESPACIO<b>ESTA SEMANA</b>', sub: 'A 28 AÑOS LUZ', spk: { n: ['#ffb08a', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'LA RANA<br>DE GELATINA', ts: 130, tag: 'ANIMALES<b>ESPECIE NUEVA</b>', sub: 'SULAWESI · INDONESIA', spk: { n: ['#9aff8a', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'MONOS<br>NUEVOS', ts: 150, tag: 'AMAZONAS<b>ESPECIES NUEVAS</b>', sub: 'YA EN PELIGRO', spk: { n: ['#ffb070', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — TRES ESTRELLAS IMPOSIBLES (espacio profundo, tonos rojos y azules)
if (P == 1) {
  scene.background = new THREE.Color(0x05030c); scene.fog = null; const STARS = starField(4000, 140, -1, 1.0, .3);
  hemi.color.setHex(0xffb0a0); hemi.groundColor.setHex(0x101030); hemi.intensity = .9; R.toneMappingExposure = 1.25;
  const S0 = V(6, -2, -26);
  const rdT = tex(256, 128, (g, w, h) => { g.fillStyle = '#ff5a2a'; g.fillRect(0, 0, w, h); blot(g, w, h, 60, .5, '255,190,90', 30); blot(g, w, h, 40, .4, '150,20,10', 25) }, 1, 1);
  const RD = add(scene, new THREE.SphereGeometry(2.3, 48, 32), new THREE.MeshBasicMaterial({ map: rdT, fog: false }), S0.x, S0.y, S0.z);
  const rdG = glowSprite(scene, 0xff5a2a, 10, S0.x, S0.y, S0.z); rdG.material.opacity = .8; glowSprite(scene, 0xff3010, 30, S0.x, S0.y, S0.z).material.opacity = .3;
  const rdL = new THREE.PointLight(0xff7040, 60, 80, 1.5); rdL.position.copy(S0); scene.add(rdL);
  const WD = add(scene, new THREE.SphereGeometry(.55, 32, 20), new THREE.MeshBasicMaterial({ color: 0xeaf4ff, fog: false }), 0, 0, 0);
  const wdG = glowSprite(scene, 0x9ad0ff, 4.2, 0, 0, 0); wdG.material.opacity = .9;
  const WD2 = add(scene, new THREE.SphereGeometry(.5, 24, 16), new THREE.MeshBasicMaterial({ color: 0xdfeaff, fog: false }), -38, 14, -80); glowSprite(scene, 0x9ad0ff, 6, -38, 14, -80).material.opacity = .8;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(9, .03, 6, 160), basic(0x9ad0ff, { transparent: true, opacity: .35 })); ring.position.copy(S0); ring.rotation.x = PI / 2 - .3; scene.add(ring);
  const GIANT = add(scene, new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, fog: false }), 0, 0, 0);
  const giG = glowSprite(scene, 0xff9a30, 1, 0, 0, 0); giG.material.opacity = 0;
  const wdPos = t => { const a = t * .25; return V(S0.x + Math.cos(a) * 9, S0.y + Math.sin(a) * 9 * Math.sin(.3) * -1 * 0 + Math.sin(a) * 2.6, S0.z + Math.sin(a) * 9 * Math.cos(.3)) };
  makePanel(V(0, 4.2, 0), 0, 4.4, 0xffb08a, 0xff5a2a);
  function draw(t) {
    const gold = '#ffd95a', rd = '#ff6a3a', bl = '#bfe0ff';
    if (t < M.hunt) { bgS(t, '#14060a', '#2a0a14', 'rgba(255,140,120,.07)'); txt('A 28 AÑOS LUZ', 360, 90, 60, '#ffb08a'); circ(200, 330, 80, rd, '#ff4a1a'); circ(360, 300, 34, '#eaf4ff', '#9ad0ff'); circ(530, 330, 34, '#eaf4ff', '#9ad0ff'); txt('3 ESTRELLAS', 360, 500, 64, '#fff'); stampMark('¿IMPOSIBLE?', 360, 630, ramp(t, .6, 1.2), '#ff3a3a', -.06, 54) }
    else if (t < M.wob) { bgS(t, '#060a20', '#101a40', 'rgba(160,190,255,.07)'); txt('BUSCABAN PLANETAS', 360, 80, 50, bl); circ(360, 330, 90, rd, '#ff4a1a'); sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.setLineDash([10, 10]); sg.lineWidth = 4; sg.beginPath(); sg.ellipse(360, 330, 210, 80, 0, 0, 7); sg.stroke(); sg.setLineDash([]);
      const a = t * 1.5; circ(360 + Math.cos(a) * 210, 330 + Math.sin(a) * 80, 22, '#6ab0ff'); txt('?', 360 + Math.cos(a) * 210, 330 + Math.sin(a) * 80 - 50, 46, gold); const k = sr(t, M.hunt + 3.4, M.hunt + 4.0); sg.globalAlpha = k; pill('ENANA ROJA', 360, 520, '#a02a1a', '#fff', 50); sg.globalAlpha = 1; txt('UNIVERSIDAD DE MONTREAL', 360, 640, 32, '#fff', { w: 800 }) }
    else if (t < M.wd) { bgS(t, '#140a06', '#2e140a', 'rgba(255,200,140,.07)'); txt('SE MOVÍA RARÍSIMO', 360, 80, 50, '#ffc890'); const k = ss(ramp(t, M.wob + 1.4, M.wob + 3.4)); txt('≈ ' + Math.round(16 * k), 300, 230, 130, '#fff', { glow: '#ff6a2a', blur: 36 }); txt('km/s', 560, 250, 54, gold);
      sg.strokeStyle = gold; sg.lineWidth = 6; sg.beginPath(); for (let x = 60; x <= 660; x += 6) sg.lineTo(x, 420 + Math.sin(x * .03 - t * 5) * 50 * k); sg.stroke(); stampMark('NO ES UN PLANETA', 360, 600, ramp(t, Ln.d2.end - 1.0, Ln.d2.end - .4), '#ff3a3a', -.06, 50) }
    else if (t < M.mass) { bgS(t, '#04101e', '#0a2038', 'rgba(140,200,255,.07)'); txt('EL CULPABLE', 360, 80, 56, bl); circ(250, 300, 90, rd, '#ff4a1a'); const k = sr(t, M.wd + 2.0, M.wd + 2.6); if (k > 0) circ(250 + 160 * k, 300, 30, '#eaf4ff', '#9ad0ff');
      sg.globalAlpha = k; pill('ENANA BLANCA', 470, 420, '#1f4f90', '#fff', 42); sg.globalAlpha = 1; txt('TELESCOPIO EN HAWÁI', 360, 530, 36, gold); const k2 = sr(t, Ln.d3.end - 2.0, Ln.d3.end - 1.4); sg.globalAlpha = k2; circ(620, 150, 16, '#eaf4ff', '#9ad0ff'); pill('+ OTRA MÁS LEJOS', 360, 630, '#3a2a7a', '#fff', 38); sg.globalAlpha = 1 }
    else if (t < M.giant) { bgS(t, '#160e02', '#2e2006', 'rgba(255,217,90,.07)'); txt('ANTES ERA UNA ESTRELLA', 360, 80, 44, '#ffe0a0'); const k = ss(ramp(t, M.mass + 1.4, M.mass + 3.2));
      txt('SOL', 70, 230, 40, '#fff', { a: 'left' }); bar(70, 260, 400, 50, k, '#ffd95a'); txt('ELLA', 70, 370, 40, '#fff', { a: 'left' }); bar(70, 400, 560, 50, k, '#ff8a3a'); txt('+40%', 360, 560, 120, gold, { glow: '#ff9a00', blur: 36 }); txt('DE MASA', 360, 650, 40, '#fff') }
    else if (t < M.imp) { bgS(t, '#200806', '#40120a', 'rgba(255,160,100,.07)'); txt('SE INFLÓ', 360, 70, 56, '#ffb08a'); const k = ss(ramp(t, M.giant + .4, M.giant + 3.0)); circ(360, 370, 30 + 190 * k, 'rgba(255,150,60,.85)', '#ff7a20'); circ(600, 560, 22, rd, '#ff4a1a');
      txt('× CIENTOS', 360, 370, 80, '#fff', { glow: '#000', blur: 12 }); txt('LA VECINA', 600, 610, 26, '#fff'); stampMark('SOBREVIVIÓ', 300, 620, ramp(t, Ln.d5.end - .9, Ln.d5.end - .3), '#4aff9a', -.06, 64) }
    else if (t < M.name) { bgS(t, '#1a0410', '#360a20', 'rgba(255,120,160,.07)'); txt('EL SISTEMA', 360, 90, 56, '#ffb0c8'); txt('NO DEBERÍA', 360, 230, 96, '#fff', { glow: '#ff2a5a', blur: 40 }); txt('EXISTIR', 360, 340, 110, '#ff4a6a', { glow: '#ff2a5a', blur: 40 });
      const k = sr(t, M.imp + 3.4, M.imp + 4.0); sg.globalAlpha = k; pill('¿POR QUÉ? NO SE SABE', 360, 520, '#7a1a3a', '#fff', 44); sg.globalAlpha = 1; for (let i = 0; i < 3; i++) txt('?', 140 + i * 220, 640, 60, gold) }
    else { bgS(t, '#060a20', '#10164a', 'rgba(200,190,255,.07)'); txt('SU NOMBRE', 360, 90, 48, '#d8c8ff'); txt('Welopōʻai', 360, 250, 108, gold, { glow: '#ff9a00', blur: 36, w: 800 }); pill('NOMBRE HAWAIANO', 360, 430, '#2a4a8a', '#fff', 46);
      circ(220, 580, 40, rd, '#ff4a1a'); circ(310, 560, 16, '#eaf4ff', '#9ad0ff'); circ(520, 600, 16, '#eaf4ff', '#9ad0ff') }
    scanlines(.05); frameEdge('rgba(255,176,138,.6)');
  }
  const near = (p, o, fov) => [[p.x + o[0], p.y + o[1], p.z + o[2]], [p.x, p.y, p.z], fov];
  const K = autoK([[0, [S0.x + 8, S0.y + 3, S0.z + 14], [S0.x, S0.y, S0.z], 50], [M.title - .3, [S0.x - 6, S0.y + 4, S0.z + 16], [S0.x, S0.y, S0.z], 54], [M.title + .9, [0, 3.2, 12], [0, 3.8, 0], 60]],
    [M.hunt, M.wob, M.wd, M.mass, M.giant, M.imp, M.name],
    [[near(S0, [7, 3, 15], 48), near(S0, [-4, 4, 16], 50), 2.4], [near(S0, [3, 1.5, 13], 46), near(S0, [-3, 2.5, 14], 46), 2.2], [near(wdPos(M.wd + 1), [2, 1, 5], 44), near(wdPos(M.wd + 3), [-2, 1.5, 6], 46), 2.6], null,
     [near(S0, [12, 6, 26], 60), near(S0, [16, 8, 30], 62), 2.6], [[[-10, 8, 20], [-38, 14, -80], 50], [[-6, 6, 18], [-38, 14, -80], 46], 2.4], [near(S0, [0, 10, 22], 60), near(S0, [6, 12, 20], 60), 2.0]],
    [[M.endcard, [S0.x - 8, S0.y + 6, S0.z + 22], [S0.x, S0.y, S0.z], 60], [C.dur, [S0.x - 12, S0.y + 8, S0.z + 24], [S0.x, S0.y, S0.z], 62]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; RD.rotation.y = t * .1; const w = wdPos(t); WD.position.copy(w); wdG.position.copy(w);
    rdG.scale.setScalar(10 + Math.sin(t * 2) * .4);
    const gk = win(t, M.giant + .2, M.imp + .3, 2.4, 1.0); GIANT.position.copy(w); GIANT.scale.setScalar(.6 + 7.5 * gk); GIANT.material.opacity = .55 * gk; giG.position.copy(w); giG.scale.setScalar(2 + 22 * gk); giG.material.opacity = .6 * gk;
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .5);
    const O = { tag: .95, title: win(t, .45, M.hunt - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,80,60,.05)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.hunt, M.wob, M.wd, M.mass, M.giant, M.imp, M.name]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VIVIRÍAS CON<br>3 SOLES?', qs: 120, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
function frog2D(x, y, s, col = '#5ad04a', t = 0, spread = 0) { sg.save(); sg.translate(x, y); sg.scale(s, s); const dk = '#2a7a2a';
  sg.fillStyle = col; for (const sx of [-1, 1]) { sg.save(); sg.scale(sx, 1); sg.beginPath(); sg.moveTo(30, 20); sg.lineTo(70 + spread * 30, 50 + spread * 10); sg.lineTo(95 + spread * 40, 40 + spread * 30); sg.lineTo(100 + spread * 40, 70 + spread * 20); sg.lineTo(80, 80); sg.lineTo(40, 50); sg.fill();
    sg.beginPath(); sg.moveTo(25, -20); sg.lineTo(60 + spread * 30, -40 - spread * 20); sg.lineTo(80 + spread * 30, -60 - spread * 10); sg.lineTo(85 + spread * 30, -30 - spread * 10); sg.lineTo(40, -5); sg.fill(); sg.fillStyle = '#ffb04a'; for (const [px, py] of [[95 + spread * 40, 40 + spread * 30], [100 + spread * 40, 70 + spread * 20], [80 + spread * 30, -60 - spread * 10], [85 + spread * 30, -30 - spread * 10]]) { sg.beginPath(); sg.arc(px, py, 7, 0, 7); sg.fill() } sg.fillStyle = col; sg.restore() }
  sg.beginPath(); sg.ellipse(0, 10, 52, 66, 0, 0, 7); sg.fill(); sg.beginPath(); sg.moveTo(-40, -30); sg.quadraticCurveTo(0, -100, 40, -30); sg.fill();
  sg.fillStyle = '#e8f8c8'; sg.beginPath(); sg.ellipse(0, 26, 30, 40, 0, 0, 7); sg.fill();
  for (const sx of [-1, 1]) { sg.fillStyle = col; sg.beginPath(); sg.arc(sx * 30, -52, 20, 0, 7); sg.fill(); sg.fillStyle = '#c8a020'; sg.beginPath(); sg.arc(sx * 30, -54, 14, 0, 7); sg.fill(); sg.fillStyle = '#111'; sg.beginPath(); sg.ellipse(sx * 30, -54, 9, 4 + 2 * Math.abs(Math.sin(t)), 0, 0, 7); sg.fill() }
  sg.strokeStyle = dk; sg.lineWidth = 3; sg.beginPath(); sg.arc(0, -30, 20, .3, PI - .3); sg.stroke(); sg.restore() }
function gel2D(x, y, s, t) { sg.save(); sg.translate(x, y); sg.scale(s, s); const gr = sg.createRadialGradient(-20, -20, 10, 0, 0, 110); gr.addColorStop(0, 'rgba(230,255,240,.85)'); gr.addColorStop(1, 'rgba(160,230,200,.35)'); sg.fillStyle = gr; sg.beginPath();
  for (let i = 0; i < 30; i++) { const a = i / 30 * 2 * PI, r = 100 * (1 + .12 * Math.sin(a * 3 + t) + .06 * Math.sin(a * 5 - t)); sg.lineTo(Math.cos(a) * r, Math.sin(a) * r * .85) } sg.closePath(); sg.fill();
  for (let i = 0; i < 18; i++) { const a = hash(i * 2.1) * 6.28, r = hash(i * 3.7) * 70; const ex = Math.cos(a) * r, ey = Math.sin(a) * r * .8; sg.fillStyle = 'rgba(255,250,220,.9)'; sg.beginPath(); sg.arc(ex, ey, 13, 0, 7); sg.fill(); sg.fillStyle = '#2a2a1a'; sg.beginPath(); sg.arc(ex + 2, ey + 1, 6, 0, 7); sg.fill() } sg.restore() }
// ==================================================================================== PART 2 — LA RANA DE GELATINA (lago de montaña con bruma, mañana verde)
if (P == 2) {
  skyDome('#6ab0e8', '#d8f0e8', '#eaf8f0'); scene.background = new THREE.Color(0xd8f0e8); scene.fog = new THREE.Fog(0xd8eee4, 14, 90);
  hemi.color.setHex(0xf0fff0); hemi.groundColor.setHex(0x2a4a2a); hemi.intensity = 1.4; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xfff4d8, 2.2); sun.position.set(14, 20, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 60 }); scene.add(sun);
  const lake = add(scene, new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: 0x3a7a7a, roughness: .12, metalness: .55 }), 0, 0, 0); lake.rotation.x = -PI / 2;
  const shoreT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .25, '30,50,10') }, 20, 20);
  const shore = add(scene, new THREE.RingGeometry(16, 120, 64), new THREE.MeshLambertMaterial({ color: 0x4a7a32, map: shoreT }), 0, .05, -10); shore.rotation.x = -PI / 2;
  for (let i = 0; i < 9; i++) { const a = -PI * .1 - i / 8 * PI * .8, r = 70 + hash(i) * 20; const m = add(scene, new THREE.ConeGeometry(22 + hash(i * 3) * 14, 26 + hash(i * 5) * 22, 9), mat(i % 2 ? 0x3a6a4a : 0x2e5a40), Math.cos(a) * r, 10, -10 + Math.sin(a) * r * .9); m.rotation.y = i }
  const trunk = mat(0x5a4030), leaf = [mat(0x3e8a2a), mat(0x2e7a3a), mat(0x4a9a3a)];
  for (let i = 0; i < 60; i++) { const a = hash(i * 2.3) * 2 * PI, r = 17 + hash(i * 4.1) * 18; const x = Math.cos(a) * r, z = Math.sin(a) * r - 10; if (z > 0) continue; const s = .8 + hash(i * 6) * .8, g = grp(scene); g.position.set(x, 0, z);
    const tr = add(g, G.cyl, trunk, 0, 2.5 * s, 0, 1); tr.scale.set(.2 * s, 5 * s, .2 * s); for (let k = 0; k < 4; k++) { const b = sph(g, (1.3 + hash(i + k) * .6) * s, leaf[(i + k) % 3], (hash(i * k + 1) - .5) * 1.6 * s, (5 + k * .6) * s, (hash(i * k + 2) - .5) * 1.6 * s); b.scale.y *= .8 } }
  // near branch over the water with big leaves, the frog and the gel mass hanging
  const BR = add(scene, G.cyl, trunk, -.2, 2.2, .2, 1); BR.scale.set(.08, 5, .08); BR.rotation.z = PI / 2 - .15;
  const leafG = new THREE.SphereGeometry(1, 20, 10); const LEAVES = [];
  for (const [x, y, z, ry, rz, s] of [[.6, 2.3, .25, .2, -.2, .7], [-1.3, 2.05, .3, -.3, .3, .6], [1.7, 2.45, .1, .5, -.4, .55], [-.3, 2.1, -.2, 1.0, .1, .5]]) { const l = add(scene, leafG, mat(0x4aa83a, { side: THREE.DoubleSide }), x, y, z, 3); l.scale.set(s, .03, s * .45); l.rotation.set(0, ry, rz); LEAVES.push(l) }
  // gel mass hanging under a leaf
  const GEL = grp(scene); GEL.position.set(-1.3, 1.55, .3);
  add(GEL, new THREE.SphereGeometry(.38, 32, 20), new THREE.MeshPhongMaterial({ color: 0xd8fff0, transparent: true, opacity: .45, shininess: 120, depthWrite: false }), 0, 0, 0).scale.set(1, 1.15, 1);
  for (let i = 0; i < 16; i++) { const a = hash(i * 3.1) * 6.28, b = hash(i * 4.3) * 3.14, r = hash(i * 1.7) * .26; const e = sph(GEL, .045, mat(0xfff0c0), Math.cos(a) * Math.sin(b) * r, Math.cos(b) * r * 1.1, Math.sin(a) * Math.sin(b) * r, 0); sph(GEL, .022, mat(0x2a2a1a), e.position.x + .02, e.position.y, e.position.z + .02, 0) }
  const DRIP = sph(scene, .03, new THREE.MeshPhongMaterial({ color: 0xd8fff0, transparent: true, opacity: .7 }), -1.3, 1.1, .3, 0);
  // the frog (original stylised model)
  function makeFrog() { const F0 = grp(scene); const gm = mat(0x5ad04a), bm = mat(0xe0f4b8), om = mat(0xffb04a), ey = mat(0xc8a020), pp = mat(0x111111);
    const body = sph(F0, 1, gm, 0, .13, 0); body.scale.set(.16, .11, .22); const belly = sph(F0, 1, bm, 0, .08, .02); belly.scale.set(.13, .07, .18);
    const head = sph(F0, 1, gm, 0, .17, .17); head.scale.set(.14, .09, .11); const snout = sph(F0, 1, gm, 0, .15, .27); snout.scale.set(.06, .05, .06);
    for (const sx of [-1, 1]) { sph(F0, .055, gm, sx * .09, .25, .17); sph(F0, .045, ey, sx * .1, .26, .2, 0); sph(F0, .025, pp, sx * .11, .27, .235, 0);
      const fl = sph(F0, 1, gm, sx * .16, .06, .14); fl.scale.set(.05, .04, .08); const bl = sph(F0, 1, gm, sx * .18, .07, -.12); bl.scale.set(.07, .05, .14);
      for (const [dx, dz] of [[.05, .22], [-.0, .23], [.1, .19], [.1, -.27], [.02, -.3], [.16, -.24]]) { const tp = sph(F0, .022, om, sx * (.16 + dx), .03, dz, 0) } }
    F0.traverse(o => { if (o.isMesh) o.castShadow = true }); return { g: F0, body, head } }
  const FROG = makeFrog(); FROG.g.position.set(.6, 2.33, .3); FROG.g.scale.setScalar(1.2); FROG.g.rotation.y = -.5;
  const MIST = []; for (let i = 0; i < 10; i++) { const m = glowSprite(scene, 0xffffff, 18, (hash(i) - .5) * 60, 2 + hash(i * 2) * 4, -20 - hash(i * 3) * 40); m.material.blending = THREE.NormalBlending; m.material.opacity = .25; MIST.push(m) }
  makePanel(V(0, 5.0, -5.0), 0, 4.0, 0x9aff8a, 0x40c040);
  function draw(t) {
    const gold = '#ffd95a', gr = '#b8ff9a';
    if (t < M.name) { bgS(t, '#062010', '#0e3a1a', 'rgba(184,255,154,.07)'); txt('NUNCA SE HABÍA VISTO', 360, 80, 46, gr); frog2D(360, 360, 1.7 + .04 * Math.sin(t * 4), '#5ad04a', t); txt('?', 600, 220, 120, gold, { glow: '#ffb000' }) }
    else if (t < M.glide) { bgS(t, '#0a1a10', '#16301a', 'rgba(184,255,154,.07)'); txt('SE LLAMA', 360, 70, 42, gr); txt('Rhacophorus', 360, 170, 84, '#fff', { glow: '#4aff6a', w: 800 }); txt('kurniatiae', 360, 260, 76, gold, { w: 800 });
      const k = sr(t, M.name + 3.0, M.name + 3.5); sg.globalAlpha = k; sg.fillStyle = '#3a6a3a'; sg.beginPath(); sg.moveTo(200, 560); sg.lineTo(300, 420); sg.lineTo(360, 480); sg.lineTo(430, 400); sg.lineTo(530, 560); sg.fill(); sg.fillStyle = '#4a9ac8'; sg.beginPath(); sg.ellipse(400, 460, 30, 12, 0, 0, 7); sg.fill(); txt('MONTAÑAS MEKONGGA', 360, 600, 34, '#fff');
      sg.globalAlpha = sr(t, M.name + 4.4, M.name + 4.9); pill('SULAWESI · INDONESIA', 360, 670, '#2a6a3a', '#fff', 32); sg.globalAlpha = 1 }
    else if (t < M.size) { bgS(t, '#062030', '#0a3a4a', 'rgba(140,240,255,.07)'); txt('RANA VOLADORA', 360, 70, 58, '#9fefff'); const k = ((t - M.glide) * .25) % 1; sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.setLineDash([12, 12]); sg.lineWidth = 4; sg.beginPath(); sg.moveTo(80, 160); sg.quadraticCurveTo(360, 200, 640, 520); sg.stroke(); sg.setLineDash([]);
      const px = lerp(80, 640, k), py = 160 + (520 - 160) * k * k * .9 + 40 * k; frog2D(px, py, .8, '#5ad04a', t, 1); const k2 = sr(t, M.glide + 2.6, M.glide + 3.2); sg.globalAlpha = k2; stampMark('NO VUELA: PLANEA', 360, 600, k2, '#ff5a3a', -.06, 48); sg.globalAlpha = sr(t, Ln.f2.end - 2.4, Ln.f2.end - 1.8); pill('PATAS = PARACAÍDAS', 360, 690, '#1a5a7a', '#fff', 34); sg.globalAlpha = 1 }
    else if (t < M.gel) { bgS(t, '#201406', '#3a240a', 'rgba(255,200,140,.07)'); txt('TAMAÑO', 360, 70, 52, '#ffc890'); sg.fillStyle = '#e8b890'; sg.beginPath(); sg.arc(360, 400, 230, 0, 7); sg.fill(); sg.fillStyle = '#f0a090'; sg.beginPath(); sg.ellipse(470, 460, 70, 46, 0, 0, 7); sg.fill();
      sg.fillStyle = '#3a2a20'; for (const x of [280, 440]) { sg.beginPath(); sg.ellipse(x, 340, 18, 24, 0, 0, 7); sg.fill() } frog2D(470, 440, .42 * sr(t, M.size + .4, M.size + 1.0), '#5ad04a', t); txt('CABE EN TU CACHETE', 360, 680, 44, gold) }
    else if (t < M.first) { bgS(t, '#062018', '#0a3a2a', 'rgba(160,255,220,.07)'); const k = sr(t, M.gel + .2, M.gel + .8); txt('SUS PARIENTES', 190, 90, 34, '#a8ffd8'); txt('ELLA', 530, 90, 40, gold);
      sg.globalAlpha = k; for (let i = 0; i < 30; i++) { sg.strokeStyle = 'rgba(255,255,255,.8)'; sg.lineWidth = 3; sg.beginPath(); sg.arc(190 + (hash(i) - .5) * 200, 260 + (hash(i * 2) - .5) * 160, 8 + hash(i * 3) * 18, 0, 7); sg.stroke() } txt('ESPUMA', 190, 410, 44, '#fff'); sg.globalAlpha = 1;
      const k2 = sr(t, M.gel + 3.2, M.gel + 3.8); if (k2 > 0) { gel2D(530, 260, .9 * k2, t); txt('GELATINA', 530, 410, 44, '#fff') } sg.strokeStyle = 'rgba(255,255,255,.3)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(360, 130); sg.lineTo(360, 440); sg.stroke();
      const k3 = sr(t, Ln.f4.end - 2.4, Ln.f4.end - 1.8); sg.globalAlpha = k3; pill('RENACUAJOS ADENTRO', 360, 560, '#1a6a5a', '#fff', 42); sg.globalAlpha = 1 }
    else if (t < M.test) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('EN SU GRUPO', 360, 90, 50, gr); gel2D(360, 320, 1.3, t); stampMark('PRIMERA VEZ', 360, 580, ramp(t, M.first + 2.2, M.first + 2.8), gold, -.06, 74) }
    else if (t < M.snout) { bgS(t, '#06142a', '#0e2a4a', 'rgba(140,200,255,.07)'); txt('¿ES NUEVA?', 360, 70, 52, '#9fd8ff'); const k = ss(ramp(t, M.test + 1.2, M.test + 2.6)); txt(Math.round(28 * k) + '', 180, 250, 140, '#fff', { glow: '#4aa8ff' }); txt('RASGOS', 180, 350, 34, gold);
      const k2 = sr(t, M.test + 3.0, M.test + 3.4), k3 = sr(t, M.test + 4.0, M.test + 4.4); sg.globalAlpha = k2; for (let i = 0; i < 16; i++) { const a = Math.sin(i * .6 + t * 3) * 26; circ(430 + i * 14, 230 + a, 6, '#4affb0'); circ(430 + i * 14, 230 - a, 6, '#ff6ad0') } txt('ADN', 540, 350, 40, gold);
      sg.globalAlpha = k3; sg.strokeStyle = '#fff'; sg.lineWidth = 6; sg.beginPath(); for (let x = 120; x <= 600; x += 6) sg.lineTo(x, 500 + Math.sin(x * .12) * 40 * Math.sin(x * .02 + t * 4)); sg.stroke(); txt('CANTO', 360, 600, 40, gold); sg.globalAlpha = 1;
      check(300, 680, 24, '#4aff9a', ramp(t, Ln.f6.end - .6, Ln.f6.end)); txt('CONFIRMADO', 420, 680, 34, '#4aff9a', { a: 'left' }) }
    else { bgS(t, '#201a06', '#3a300a', 'rgba(255,217,90,.07)'); txt('HOCICO PUNTIAGUDO', 360, 80, 48, '#ffe0a0'); sg.save(); sg.translate(360, 330); sg.fillStyle = '#5ad04a'; sg.beginPath(); sg.moveTo(-200, 60); sg.quadraticCurveTo(-180, -110, 40, -80); sg.lineTo(210, 20); sg.quadraticCurveTo(80, 90, -200, 60); sg.fill(); circ(-30, -70, 40, '#5ad04a'); circ(-30, -72, 28, '#c8a020'); circ(-30, -72, 12, '#111'); sg.restore();
      const k = sr(t, M.snout + 3.0, M.snout + 3.6); sg.globalAlpha = k; pill('REVISTA ZOOTAXA', 360, 560, '#5a4a1a', '#fff', 44); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(154,255,138,.6)');
  }
  const fc = [.6, 2.45, .3], gc = [-1.3, 1.6, .3];
  const K = autoK([[0, [2.2, 3.0, 2.6], fc, 42], [M.title - .2, [-.8, 3.1, 2.8], fc, 44], [M.title + .9, [0, 3.8, 3.6], [0, 5.0, -5.0], 60]],
    [M.name, M.glide, M.size, M.gel, M.first, M.test, M.snout],
    [[[[-10, 5, 14], [0, 4, -40], 60], [[-4, 4, 12], [10, 6, -50], 58], 2.4], [[[2.2, 3.2, 2.0], fc, 44], [[-1.0, 3.4, 2.4], fc, 46], 2.2], [[[1.4, 2.8, 1.6], fc, 36], [[0, 2.9, 1.9], fc, 36], 1.8], [[[-.2, 2.0, 2.4], gc, 40], [[-2.6, 1.9, 2.3], gc, 40], 2.8], null, [[[2.0, 2.9, 1.8], fc, 40], [[-.6, 3.0, 2.0], fc, 40], 2.0], null],
    [[M.endcard, [2.0, 3.0, 2.6], fc, 44], [C.dur, [-1.0, 3.1, 2.8], fc, 46]]);
  frame = function (t) {
    FROG.body.scale.y = .11 * (1 + .06 * Math.sin(t * 5)); FROG.g.rotation.y = -.5 + Math.sin(t * .5) * .2;
    GEL.rotation.y = t * .2; GEL.position.y = 1.55 + Math.sin(t * 1.3) * .02; const dk = (t * .5) % 1; DRIP.position.y = 1.15 - dk * 1.2; DRIP.material.opacity = .7 * (1 - dk);
    LEAVES.forEach((l, i) => l.rotation.x = Math.sin(t * 1.1 + i) * .05);
    MIST.forEach((m, i) => { m.position.x = (hash(i) - .5) * 60 + Math.sin(t * .1 + i) * 4 });
    lake.material.color.setHSL(.5, .35, .33 + .02 * Math.sin(t));
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(80,220,120,.05)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.name, M.glide, M.size, M.gel, M.first, M.test, M.snout]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿LINDA<br>O RARA?', qs: 140, a: 'LINDA', b: 'RARA', cta: 'COMENTÁ  LINDA  o  RARA', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
function monkey2D(x, y, s, col = '#c8461e', t = 0) { sg.save(); sg.translate(x, y); sg.scale(s, s);
  sg.strokeStyle = col; sg.lineWidth = 16; sg.lineCap = 'round'; sg.beginPath(); sg.moveTo(40, 80); sg.bezierCurveTo(120, 100, 130, 10, 100, -10 + Math.sin(t * 2) * 6); sg.stroke(); sg.lineCap = 'butt';
  sg.fillStyle = col; sg.beginPath(); sg.ellipse(0, 60, 60, 70, 0, 0, 7); sg.fill(); sg.beginPath(); sg.arc(0, -40, 52, 0, 7); sg.fill();
  sg.fillStyle = '#9a3214'; sg.beginPath(); sg.moveTo(-40, -10); sg.quadraticCurveTo(0, 70, 40, -10); sg.fill();
  sg.fillStyle = '#3a2418'; sg.beginPath(); sg.ellipse(0, -40, 32, 30, 0, 0, 7); sg.fill(); sg.fillStyle = '#fff'; for (const sx of [-1, 1]) { sg.beginPath(); sg.arc(sx * 13, -48, 8, 0, 7); sg.fill() } sg.fillStyle = '#111'; for (const sx of [-1, 1]) { sg.beginPath(); sg.arc(sx * 13, -47, 4.5, 0, 7); sg.fill() }
  sg.fillStyle = '#1a0e08'; sg.beginPath(); sg.ellipse(0, -26, 9, 6, 0, 0, 7); sg.fill(); sg.restore() }
function icon(kind, x, y, s, col) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.strokeStyle = col; sg.lineWidth = 8;
  if (kind == 'tree') { sg.fillRect(-8, 0, 16, 50); sg.beginPath(); sg.arc(0, -10, 40, 0, 7); sg.fill(); sg.strokeStyle = '#ff3a3a'; sg.lineWidth = 10; sg.beginPath(); sg.moveTo(-50, 30); sg.lineTo(50, 30); sg.stroke() }
  else if (kind == 'temp') { sg.beginPath(); sg.roundRect(-12, -50, 24, 80, 12); sg.stroke(); sg.beginPath(); sg.arc(0, 40, 22, 0, 7); sg.fill(); sg.fillRect(-6, -20, 12, 50) }
  else { sg.beginPath(); sg.moveTo(-45, 0); sg.lineTo(0, -40); sg.lineTo(45, 0); sg.closePath(); sg.fill(); sg.fillRect(-32, 0, 64, 45); sg.fillStyle = '#000'; sg.fillRect(-10, 15, 20, 30) } sg.restore() }
// ==================================================================================== PART 3 — MONOS AULLADORES NUEVOS (selva amazónica al atardecer, río)
if (P == 3) {
  skyDome('#3a4a9a', '#ff9a5a', '#ffc890'); scene.background = new THREE.Color(0xffb080); scene.fog = new THREE.Fog(0xffb888, 20, 120);
  hemi.color.setHex(0xffe0c0); hemi.groundColor.setHex(0x2a3a1a); hemi.intensity = 1.35; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xffb070, 2.6); sun.position.set(-30, 12, -20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 80 }); scene.add(sun);
  glowSprite(scene, 0xfff0b0, 16, -70, 14, -100); glowSprite(scene, 0xff8040, 60, -70, 14, -100).material.opacity = .45;
  const river = add(scene, new THREE.PlaneGeometry(500, 30), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: .2, metalness: .4 }), 0, -6, -40); river.rotation.x = -PI / 2; river.rotation.z = .25;
  const jT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .25, '20,40,10') }, 30, 30);
  const floor = add(scene, new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: 0x3a6a2a, map: jT }), 0, -6.3, 0); floor.rotation.x = -PI / 2;
  const leafM = [mat(0x2e6a22), mat(0x3a7a2a), mat(0x4a8a2e), mat(0x285a1e)], trunk = mat(0x5a4030);
  // canopy: dense crowns at different heights (the camera is up in the trees)
  for (let i = 0; i < 160; i++) { const x = (hash(i * 1.7) - .5) * 120, z = -hash(i * 2.9) * 110 + 14; if (Math.abs(x) < 6 && z > -6 && z < 6) continue; if (Math.abs(z + 40 - x * .25) < 16) continue;
    const s = 1.6 + hash(i * 4.4) * 2.4, y = -1 + hash(i * 5.5) * 3; const c = sph(scene, s, leafM[i % 4], x, y, z); c.scale.y *= .7; if (i % 3 == 0) { const tr = add(scene, G.cyl, trunk, x, y - 4, z); tr.scale.set(.3, 7, .3) } }
  // the big branch where the monkeys sit
  const BR = add(scene, G.cyl, trunk, 0, 1.6, 0, 3); BR.scale.set(.14, 9, .14); BR.rotation.z = PI / 2 - .08; BR.rotation.y = .2;
  for (let i = 0; i < 14; i++) { const l = sph(scene, .5 + hash(i) * .4, leafM[i % 4], (hash(i * 3) - .5) * 9, 2 + hash(i * 5) * 1.2, -1 - hash(i * 7) * 1.5); l.scale.y *= .6 }
  const VINES = []; for (let i = 0; i < 8; i++) { const v = add(scene, G.cyl, mat(0x3a5a22), -4 + i * 1.2, -.5, -1.2 - hash(i) * 2); v.scale.set(.025, 4 + hash(i * 2) * 3, .025); VINES.push(v) }
  function makeMonkey(col) { const B = grp(scene); const fm = mat(col), fd = mat(0x8a2a10), sk = mat(0x6a4430), dm = mat(0x3a2418), wm = mat(0xf0e8d8), pm = mat(0x111111), ir = mat(0x6a3a1a);
    const body = sph(B, 1, fm, 0, .3, -.02); body.scale.set(.2, .26, .18); const chest = sph(B, 1, fd, 0, .34, .08); chest.scale.set(.13, .17, .1);
    const H = grp(B); H.position.set(0, .64, .05); const hd = sph(H, 1, fm, 0, 0, 0); hd.scale.set(.15, .14, .14);
    const face = sph(H, 1, sk, 0, -.01, .1); face.scale.set(.095, .09, .06); const muz = sph(H, 1, dm, 0, -.055, .14); muz.scale.set(.06, .045, .045);
    const brow = sph(H, 1, fm, 0, .065, .1); brow.scale.set(.11, .035, .05); for (const sx of [-1, 1]) { sph(H, .035, fm, sx * .14, .02, -.01); sph(H, .024, wm, sx * .04, .015, .148, 0); sph(H, .016, ir, sx * .04, .015, .163, 0); sph(H, .008, pm, sx * .04, .015, .172, 0); sph(H, .008, pm, sx * .015, -.04, .183, 0) }
    const beard = sph(H, 1, fd, 0, -.13, .06); beard.scale.set(.12, .13, .09);
    const arms = []; for (const sx of [-1, 1]) { const a = grp(B); a.position.set(sx * .17, .44, .02); const m = add(a, G.cap, fm, 0, -.17, .05, 1); m.scale.set(.045, .1, .045); m.rotation.x = -.3; arms.push(a);
      const lg = add(B, G.cap, fm, sx * .11, .1, .1, 1); lg.scale.set(.055, .09, .055); lg.rotation.x = 1.3; const ft = sph(B, 1, sk, sx * .11, .06, .24); ft.scale.set(.04, .025, .05) }
    const tail = []; let p = B; for (let k = 0; k < 8; k++) { const s = grp(p); s.position.set(0, k ? -.11 : .12, k ? 0 : -.16); const c = add(s, G.cyl, fm, 0, -.055, 0, 1); c.scale.set(.035 - k * .002, .12, .035 - k * .002); tail.push(s); p = s }
    B.traverse(o => { if (o.isMesh) o.castShadow = true }); return { g: B, H, arms, tail } }
  const MK1 = makeMonkey(0xb8521e), MK2 = makeMonkey(0x9a4418); MK1.g.position.set(-.5, 1.72, .1); MK2.g.position.set(1.2, 1.75, -.15); MK2.g.scale.setScalar(.85); MK1.g.rotation.y = .3; MK2.g.rotation.y = -.4;
  makePanel(V(0, 5.6, -6), 0, 4.0, 0xffb070, 0xff7a30);
  function draw(t) {
    const gold = '#ffd95a', or = '#ffb070';
    if (t < M.who) { bgS(t, '#200c06', '#3a160a', 'rgba(255,176,112,.07)'); txt('2 MONOS NUEVOS', 360, 80, 56, or); monkey2D(220, 330, 1.2, '#c8461e', t); monkey2D(500, 330, 1.2, '#a83a18', t + 1); pill('AMAZONAS', 360, 560, '#2a6a2a', '#fff', 46); stampMark('YA EN PELIGRO', 360, 660, ramp(t, 2.2, 2.8), '#ff3a3a', -.05, 44) }
    else if (t < M.names) { bgS(t, '#1a0a06', '#36160a', 'rgba(255,176,112,.07)'); txt('MONO AULLADOR', 360, 80, 58, '#fff', { glow: '#ff6a2a' }); monkey2D(360, 340, 1.6, '#c8461e', t);
      const k = sr(t, M.who + 1.8, M.who + 2.3), k2 = sr(t, M.who + 3.0, M.who + 3.5); sg.globalAlpha = k; pill('BARBA', 180, 600, '#7a3a1a', '#fff', 44); sg.globalAlpha = k2; pill('PELO ROJO', 500, 600, '#a83a18', '#fff', 44); sg.globalAlpha = 1 }
    else if (t < M.dna) { bgS(t, '#14100a', '#2a2010', 'rgba(255,217,90,.07)'); txt('SE LLAMAN', 360, 70, 42, '#ffe0a0'); txt('Alouatta', 360, 165, 76, '#fff', { w: 800 }); txt('iroi', 360, 250, 80, gold, { glow: '#ff9a00', w: 800 });
      const k = sr(t, M.names + 1.6, M.names + 2.1); sg.globalAlpha = k; txt('Alouatta', 360, 420, 76, '#fff', { w: 800 }); txt('matogrossensis', 360, 510, 70, gold, { glow: '#ff9a00', w: 800 }); sg.globalAlpha = 1; txt('&', 360, 335, 50, '#ffb070') }
    else if (t < M.rivers) { bgS(t, '#0a1a14', '#10302a', 'rgba(160,255,220,.07)'); txt('LEYERON SU ADN', 360, 70, 50, '#a8ffd8'); for (let i = 0; i < 34; i++) { const x = 60 + i * 18, a = Math.sin(i * .5 + t * 3) * 50; circ(x, 260 + a, 8, '#4affb0'); circ(x, 260 - a, 8, '#ff9a4a'); if (i % 2 == 0) { sg.strokeStyle = 'rgba(255,255,255,.25)'; sg.lineWidth = 3; sg.beginPath(); sg.moveTo(x, 260 + a); sg.lineTo(x, 260 - a); sg.stroke() } }
      const k = ss(ramp(t, M.dna + 2.4, M.dna + 3.8)); txt(Math.round(11 * k) + '', 360, 470, 130, '#fff', { glow: '#4aff9a' }); txt('ESPECIES DE AULLADORES', 360, 580, 38, gold) }
    else if (t < M.n16) { bgS(t, '#061424', '#0a2a40', 'rgba(140,200,255,.07)'); txt('LOS RÍOS LOS SEPARARON', 360, 70, 42, '#9fd8ff'); sg.fillStyle = '#2a5a2a'; sg.fillRect(40, 120, 640, 520);
      const k = ss(ramp(t, M.rivers + .4, M.rivers + 3.4)); sg.strokeStyle = '#5ab0e8'; sg.lineCap = 'round';
      const rv = [[[40, 300], [250, 260], [470, 330], [680, 290], 18, 'AMAZONAS', 560, 250], [[470, 330], [500, 450], [440, 560], [480, 640], 11, 'XINGÚ', 540, 560], [[250, 260], [220, 190], [280, 150], [240, 120], 9, 'BRANCO', 150, 170]];
      rv.forEach(([a, b, c, d, w, nm, lx, ly], i) => { const kk = cl(k * 3 - i); if (kk <= 0) return; sg.lineWidth = w; sg.beginPath(); sg.moveTo(...a); for (let s = 0; s <= 20 * kk; s++) { const u = s / 20, x = (1 - u) ** 3 * a[0] + 3 * (1 - u) ** 2 * u * b[0] + 3 * (1 - u) * u * u * c[0] + u ** 3 * d[0], y = (1 - u) ** 3 * a[1] + 3 * (1 - u) ** 2 * u * b[1] + 3 * (1 - u) * u * u * c[1] + u ** 3 * d[1]; sg.lineTo(x, y) } sg.stroke(); txt(nm, lx, ly, 30, '#fff', { glow: '#000', blur: 8 }) }); sg.lineCap = 'butt';
      const k2 = sr(t, Ln.m4.end - 2.0, Ln.m4.end - 1.4); for (const [x, y, c] of [[150, 420, '#c8461e'], [600, 450, '#a83a18'], [380, 180, '#e05a2a']]) { sg.globalAlpha = k2; monkey2D(x, y, .4, c, t) } sg.globalAlpha = 1 }
    else if (t < M.risk) { bgS(t, '#1a1006', '#36200a', 'rgba(255,217,90,.07)'); txt('YA SE CONOCEN', 360, 70, 48, '#ffe0a0'); const n = Math.round(16 * ss(ramp(t, M.n16 + .4, M.n16 + 2.0))); txt(n + '', 360, 230, 170, '#fff', { glow: '#ff9a00', blur: 44 });
      for (let i = 0; i < n; i++) monkey2D(110 + (i % 8) * 72, 420 + Math.floor(i / 8) * 110, .3, i >= 14 ? gold : '#c8461e', t + i); txt('ESPECIES DE AULLADORES', 360, 660, 36, gold) }
    else if (t < M.why) { bgS(t, '#200606', '#3a0a0a', 'rgba(255,120,120,.07)'); txt('PELIGRO', 360, 80, 70, '#ff6a6a', { glow: '#ff2a2a' }); monkey2D(160, 260, .8, '#a83a18', t); txt('matogrossensis', 430, 230, 40, gold, { w: 800 }); txt('AL BORDE DE', 430, 290, 34, '#fff'); txt('LA EXTINCIÓN', 430, 335, 34, '#fff');
      const k = sr(t, M.risk + 3.6, M.risk + 4.2); sg.globalAlpha = k; monkey2D(160, 500, .8, '#c8461e', t + 1); txt('iroi', 430, 460, 44, gold, { w: 800 }); txt('UNA REPRESA', 430, 520, 34, '#fff'); txt('EN EL RÍO BRANCO', 430, 565, 34, '#fff'); sg.globalAlpha = 1 }
    else { bgS(t, '#0a1a0a', '#163016', 'rgba(184,255,154,.07)'); txt('LAS AMENAZAS', 360, 70, 52, '#b8ff9a'); const ks = [sr(t, M.why + .3, M.why + .8), sr(t, M.why + 1.6, M.why + 2.1), sr(t, M.why + 3.0, M.why + 3.5)];
      [['tree', 'DEFORESTACIÓN'], ['temp', 'CAMBIO CLIMÁTICO'], ['house', 'PÉRDIDA DE HOGAR']].forEach(([ic, nm], i) => { sg.globalAlpha = ks[i]; icon(ic, 130, 190 + i * 140, 1, '#ffb070'); txt(nm, 230, 190 + i * 140, 44, '#fff', { a: 'left' }) }); sg.globalAlpha = sr(t, Ln.m7.end - 2.6, Ln.m7.end - 2.0); pill('COMMUNICATIONS BIOLOGY', 360, 640, '#2a5a2a', '#fff', 34); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,176,112,.6)');
  }
  const m1 = [-.5, 2.35, .1], m2 = [1.2, 2.3, -.15];
  const K = autoK([[0, [.6, 2.7, 2.6], m1, 42], [M.title - .2, [-1.4, 2.8, 2.8], m1, 46], [M.title + .9, [0, 4.4, 3.4], [0, 5.6, -6], 60]],
    [M.who, M.names, M.dna, M.rivers, M.n16, M.risk, M.why],
    [[[[.3, 2.5, 1.6], m1, 36], [[-1.2, 2.6, 1.8], m1, 38], 2.4], null, [[[1.9, 2.5, 1.4], m2, 38], [[.6, 2.6, 1.5], m2, 38], 2.0], [[[-6, 8, 14], [0, -4, -40], 60], [[4, 9, 14], [6, -5, -42], 60], 2.6], null, [[[.4, 2.4, 1.5], m1, 34], [[-.9, 2.5, 1.6], m1, 36], 2.2], [[[-8, 6, 10], [-10, 0, -20], 60], [[-4, 6, 9], [-8, 0, -22], 58], 2.4]],
    [[M.endcard, [.8, 2.8, 3.0], [.3, 2.3, 0], 46], [C.dur, [-1.0, 2.9, 3.2], [.3, 2.3, 0], 48]]);
  frame = function (t) {
    for (const [mk, o] of [[MK1, 0], [MK2, 2]]) { mk.H.rotation.y = Math.sin(t * .7 + o) * .5; mk.H.rotation.x = Math.sin(t * .9 + o) * .12; mk.arms[0].rotation.x = Math.sin(t * 1.2 + o) * .3 - .2; mk.arms[1].rotation.x = Math.sin(t * 1.0 + o + 1) * .3 - .4; mk.tail.forEach((s, i) => { s.rotation.x = .2 + Math.sin(t * 1.5 + i * .5 + o) * .12; s.rotation.z = Math.sin(t + i) * .05 }) }
    VINES.forEach((v, i) => v.rotation.z = Math.sin(t * .8 + i) * .04);
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.who - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,140,60,.05)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.who, M.names, M.dna, M.rivers, M.n16, M.risk, M.why]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿SABÍAS QUE<br>EXISTÍAN?', qs: 125, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

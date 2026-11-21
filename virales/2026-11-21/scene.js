// Virales 21/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: la mini luna 2026 QQ8 · p2: el pájaro gigante de la cueva del hobbit · p3: la araña con el primer nombre científico
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'LA TIERRA TIENE<br>OTRA LUNA', ts: 118, tag: 'ESPACIO<b>ESTA SEMANA</b>', sub: '2026 QQ8', spk: { n: ['#8ad8ff', '', 0], q: ['#ffd95a', '', 0] } },
  2: { title: 'EL PÁJARO<br>GIGANTE', ts: 140, tag: 'FÓSILES<b>CIENCIA</b>', sub: 'ISLA DE FLORES', spk: { n: ['#ffd95a', '', 0], q: ['#9aff8a', '', 0] } },
  3: { title: 'EL PRIMER<br>NOMBRE', ts: 150, tag: 'ANIMALES<b>CIENCIA</b>', sub: 'DESDE 1757', spk: { n: ['#ffb0e0', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — LA MINI LUNA (espacio, la Tierra de día y la Luna)
if (P == 1) {
  scene.background = new THREE.Color(0x02030c); const STARS = starField(3500, 140, -1, 1.0, .25);
  hemi.color.setHex(0x8aa0ff); hemi.groundColor.setHex(0x101020); hemi.intensity = 1.1; R.toneMappingExposure = 1.3;
  const sunL = new THREE.DirectionalLight(0xfff4e0, 3.0); sunL.position.set(-40, 18, 30); scene.add(sunL);
  glowSprite(scene, 0xfff0c0, 22, -95, 40, 60).material.opacity = .9; glowSprite(scene, 0xffc070, 60, -95, 40, 60).material.opacity = .35;
  // Earth (procedural, invented continents)
  const earthT = tex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a4a9a'); gr.addColorStop(.5, '#1f5fb8'); gr.addColorStop(1, '#1a4a9a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.1) * w, y = h * (.2 + hash(i * 5.3) * .6), r = 30 + hash(i * 7.7) * 90; g.fillStyle = i % 3 ? '#3a8a3a' : '#a08a4a'; g.beginPath(); for (let k = 0; k < 30; k++) { const a = k / 30 * 2 * PI, rr = r * (1 + .35 * Math.sin(a * 3 + i) + .2 * Math.sin(a * 5 + i * 2)); g.lineTo(x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr * .8) } g.fill() }
    g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, w, 26); g.fillRect(0, h - 30, w, 30) }, 1, 1);
  const cloudT = tex(1024, 512, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const x = hash(i * 1.7) * w, y = h * (.1 + hash(i * 2.9) * .8), r = 10 + hash(i * 4.4) * 40; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r * 2, y - r, r * 4, r * 2) } }, 1, 1);
  const E0 = V(10, -6, -34), ER = 13;
  const EARTH = add(scene, new THREE.SphereGeometry(ER, 64, 48), new THREE.MeshLambertMaterial({ map: earthT, emissive: 0x0a1a3a }), E0.x, E0.y, E0.z);
  const CLOUD = add(scene, new THREE.SphereGeometry(ER * 1.012, 64, 48), new THREE.MeshLambertMaterial({ map: cloudT, transparent: true, depthWrite: false }), E0.x, E0.y, E0.z);
  const atm = glowSprite(scene, 0x4aa8ff, ER * 2.6, E0.x, E0.y, E0.z - 2); atm.material.opacity = .55;
  const MOON = add(scene, new THREE.SphereGeometry(3.2, 40, 30), new THREE.MeshLambertMaterial({ map: tex(256, 128, (g, w, h) => { g.fillStyle = '#b8b4ac'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .5, '80,78,74', 20); speck(g, w, h, 1500, .3, '60,60,60') }, 1, 1) }), -34, 16, -70);
  // the mini moon: a small rock with a glowing trail
  const ROCK = add(scene, rockGeo(1.3, 3), new THREE.MeshLambertMaterial({ color: 0xc8b8a4, emissive: 0x2a2018, map: tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 1800, .5, '60,50,40') }, 2, 2) }), 0, 0, 0); ROCK.scale.setScalar(.55);
  const RGL = glowSprite(scene, 0xffe0a0, 2.2, 0, 0, 0); RGL.material.opacity = .35;
  const rockPos = t => { const a = -.9 + t * .045, b = t * .55; return V(E0.x + Math.cos(a) * 22 + Math.cos(b) * 3, E0.y + 7 + Math.sin(b) * 2.2, E0.z + Math.sin(a) * 22 + Math.sin(b) * 3) };
  const NT = 160, trP = new Float32Array(NT * 3), trGeo = new THREE.BufferGeometry(); trGeo.setAttribute('position', new THREE.BufferAttribute(trP, 3));
  const TRAIL = new THREE.Line(trGeo, new THREE.LineBasicMaterial({ color: 0xffd080, transparent: true, opacity: .55, fog: false })); scene.add(TRAIL);
  // orbit ring of the real Moon distance (decor)
  const ring = new THREE.Mesh(new THREE.TorusGeometry(26, .03, 6, 160), basic(0x6aa8ff, { transparent: true, opacity: .35, fog: false })); ring.position.copy(E0); ring.rotation.x = PI / 2 - .25; scene.add(ring);
  // the six mini moons (appear at the end)
  const SIX = []; for (let i = 0; i < 6; i++) { const m = add(scene, rockGeo(i * 2.1 + .5, 1), mat(0xa89a8a)); m.scale.setScalar(.35); m.visible = false; SIX.push(m) }
  makePanel(V(0, 4.2, 0), 0, 4.4, 0x8ad8ff, 0x3a7aff);
  function draw(t) {
    const gold = '#ffd95a', cy = '#8ad8ff';
    if (t < M.name) { bgS(t, '#040a20', '#0a1a44', 'rgba(138,216,255,.07)'); txt('LA TIERRA TIENE', 360, 90, 50, cy); txt('UNA LUNA', 360, 170, 76, '#fff'); txt('NUEVA', 360, 255, 90, gold, { glow: '#ffb000' });
      rock2D(230, 470, 70 * (.9 + .1 * Math.sin(t * 4))); txt('<', 360, 470, 90, '#fff'); sg.fillStyle = '#ff5a5a'; sg.beginPath(); sg.roundRect(420, 450, 200, 60, 18); sg.fill(); sg.fillRect(460, 415, 110, 45); sg.fillStyle = '#222'; for (const x of [460, 580]) { sg.beginPath(); sg.arc(x, 515, 20, 0, 7); sg.fill() } txt('AUTO', 520, 600, 36, '#fff') }
    else if (t < M.disc) { bgS(t, '#060a24', '#10144a', 'rgba(160,170,255,.07)'); txt('SE LLAMA', 360, 80, 46, '#b8c0ff'); const s = '2026 QQ8', n = Math.floor(cl((t - M.name - .6) / 1.2) * s.length + .001);
      sg.fillStyle = 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(60, 160, 600, 170, 26); sg.fill(); txt(s.slice(0, n) + (Math.sin(t * 10) > 0 ? '|' : ' '), 360, 248, 110, '#fff', { glow: '#4aa8ff', blur: 30, w: 800 });
      const k = sr(t, M.name + 2.6, M.name + 3.1); sg.globalAlpha = k; pill('MINI LUNA', 360, 430, '#1f5fb0', '#fff', 56); sg.globalAlpha = sr(t, M.name + 4.0, M.name + 4.5); txt('= ASTEROIDE ATRAPADO', 360, 560, 44, gold); sg.globalAlpha = 1 }
    else if (t < M.nat) { bgS(t, '#04141e', '#0a2a3a', 'rgba(140,220,255,.07)'); txt('LA DESCUBRIERON', 360, 80, 48, cy); sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 6; sg.beginPath(); sg.moveTo(120, 330); sg.lineTo(600, 330); sg.stroke();
      const k1 = sr(t, M.disc + .5, M.disc + 1.0), k2 = sr(t, M.disc + 3.6, M.disc + 4.1); sg.globalAlpha = k1; sg.fillStyle = gold; sg.beginPath(); sg.arc(160, 330, 20, 0, 7); sg.fill(); txt('20 AGO', 160, 250, 46, '#fff'); txt('LA VEN', 160, 410, 34, '#ffe0a0');
      sg.globalAlpha = k2; sg.fillStyle = '#4aff9a'; sg.beginPath(); sg.arc(560, 330, 20, 0, 7); sg.fill(); txt('29 OCT', 560, 250, 46, '#fff'); txt('OFICIAL', 560, 410, 34, '#a8ffd8'); sg.globalAlpha = 1;
      stampMark('CONFIRMADA', 360, 590, ramp(t, Ln.d2.end - .8, Ln.d2.end - .3), '#4aff9a', -.08, 60) }
    else if (t < M.size) { bgS(t, '#140a06', '#2e180a', 'rgba(255,200,140,.07)'); txt('¿ROCA O COHETE VIEJO?', 360, 80, 46, '#ffc890');
      rock2D(200, 300, 90); sg.save(); sg.translate(520, 300); sg.fillStyle = '#d8dce8'; sg.beginPath(); sg.moveTo(0, -120); sg.quadraticCurveTo(40, -80, 36, 80); sg.lineTo(-36, 80); sg.quadraticCurveTo(-40, -80, 0, -120); sg.fill(); sg.fillStyle = '#ff5a3a'; sg.beginPath(); sg.moveTo(-36, 40); sg.lineTo(-70, 100); sg.lineTo(-36, 90); sg.fill(); sg.beginPath(); sg.moveTo(36, 40); sg.lineTo(70, 100); sg.lineTo(36, 90); sg.fill(); sg.restore();
      cross(520, 300, 110, '#ff3a3a', ramp(t, M.nat + 4.4, M.nat + 5.2)); const k = sr(t, M.nat + 3.4, M.nat + 3.9); sg.globalAlpha = k; pill('HAWÁI', 220, 500, '#1a6a7a', '#fff', 40); pill('ARIZONA', 500, 500, '#7a4a1a', '#fff', 40); sg.globalAlpha = 1;
      stampMark('NATURAL', 360, 630, ramp(t, Ln.d3.end - .8, Ln.d3.end - .3), '#4aff9a', -.06, 70) }
    else if (t < M.stay) { bgS(t, '#0a0626', '#1c0e44', 'rgba(200,170,255,.07)'); txt('TAMAÑO', 360, 80, 52, '#d8c8ff'); txt('1 a 2 m', 360, 190, 120, '#fff', { glow: '#b070ff', blur: 36 });
      const k = sr(t, M.size + .6, M.size + 1.6); rock2D(250, 520, 40 + 70 * k); personIcon(480, 640, 280, 'rgba(255,255,255,.9)'); txt('≈', 365, 520, 80, gold) }
    else if (t < M.dist) { bgS(t, '#04141a', '#082a30', 'rgba(140,255,230,.07)'); txt('SE QUEDA CON NOSOTROS', 360, 80, 44, '#a8fff0'); const ms = ['ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const k = ss(ramp(t, M.stay + .6, M.stay + 3.6)); bar(70, 260, 580, 50, k, '#2affd0'); ms.forEach((m, i) => txt(m, 90 + i * 67.5, 350, 26, i <= k * 8.5 ? '#fff' : 'rgba(255,255,255,.4)', { w: 800 }));
      txt('ABRIL', 120, 200, 40, '#fff'); txt('→ 2027', 560, 200, 40, gold); const k2 = sr(t, Ln.d5.end - 2.0, Ln.d5.end - 1.4); sg.globalAlpha = k2; pill('FIN DE AÑO o PRINCIPIOS DE 2027', 360, 520, '#1a7a6a', '#fff', 34); sg.globalAlpha = 1 }
    else if (t < M.six) { bgS(t, '#06142a', '#0e2a4a', 'rgba(140,200,255,.07)'); txt('LO MÁS CERCA QUE PASA', 360, 70, 44, '#9fd8ff'); const k = ss(ramp(t, M.dist + 1.2, M.dist + 4.6));
      txt(fmt(568000 * k), 360, 190, 110, '#fff', { glow: '#4aa8ff' }); txt('KILÓMETROS', 360, 275, 40, gold); txt('LUNA', 90, 380, 30, '#fff', { a: 'left' }); bar(90, 400, 540, 40, .66, '#c0c0c8'); txt('QQ8', 90, 480, 30, '#fff', { a: 'left' }); bar(90, 500, 540, 40, .98 * k, gold);
      const k2 = sr(t, Ln.d6.end - 1.6, Ln.d6.end - 1.0); sg.globalAlpha = k2; txt('≈ 1,5 ×', 560, 590, 56, '#fff'); sg.globalAlpha = 1; stampMark('SIN RIESGO', 230, 610, ramp(t, M.dist + .6, M.dist + 1.2), '#4aff9a', -.08, 52) }
    else { bgS(t, '#10082a', '#2a0e48', 'rgba(255,154,224,.07)'); txt('LA TIERRA PODRÍA TENER', 360, 70, 42, '#ffb0e0'); txt('HASTA', 360, 150, 50, '#fff'); txt('6', 360, 300, 220, gold, { glow: '#ffb000', blur: 44 });
      sg.strokeStyle = 'rgba(255,255,255,.3)'; sg.lineWidth = 3; sg.beginPath(); sg.ellipse(360, 300, 250, 120, 0, 0, 7); sg.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * PI + t * .8, k = sr(t, M.six + .8 + i * .25, M.six + 1.1 + i * .25); if (k > 0) rock2D(360 + Math.cos(a) * 250, 300 + Math.sin(a) * 120, 22 * k) }
      txt('MINI LUNAS A LA VEZ', 360, 520, 48, '#fff'); pill('SEGÚN ALGUNOS ESTUDIOS', 360, 630, '#7a2a8a', '#fff', 34) }
    scanlines(.05); frameEdge('rgba(138,216,255,.6)');
  }
  const r0 = rockPos(0), r2 = rockPos(2.5), rA = rockPos(M.nat + .2), rB = rockPos(M.size + .2), rC = rockPos(M.stay + 1), rD = rockPos(M.six);
  const nearRock = (p, o, fov) => { const d = p.clone().sub(E0).setY(0).normalize(), sd = V(-d.z, 0, d.x); const e = p.clone().addScaledVector(d, o[2]).addScaledVector(sd, o[0]); e.y += o[1]; return [[e.x, e.y, e.z], [p.x, p.y - .3, p.z], fov] };
  const K = autoK([[0, ...nearRock(r0, [2.0, 1.0, 5.5], 44)], [M.title - .3, ...nearRock(r2, [-2.6, 1.6, 7.0], 50)], [M.title + .9, [0, 3.2, 12], [0, 3.8, 0], 60]],
    [M.name, M.disc, M.nat, M.size, M.stay, M.dist, M.six],
    [[[[0, 6, 18], [E0.x, E0.y, E0.z], 60], [[-3, 4, 14], [E0.x - 2, E0.y + 2, E0.z], 56], 2.4], null, [nearRock(rA, [2.4, 1.0, 5.5], 44), nearRock(rockPos(M.nat + 2.4), [1.4, 1.4, 4.5], 40), 2.2], [nearRock(rB, [1.6, .8, 4.6], 40), nearRock(rockPos(M.size + 2.2), [-1.6, 1.0, 5.0], 40), 2.0],
     [[[-6, 12, 30], [E0.x, E0.y, E0.z], 64], [[-10, 16, 26], [E0.x, E0.y, E0.z], 66], 2.4], [[[-14, 10, 20], [-20, 6, -50], 62], [[-8, 8, 22], [-24, 10, -60], 58], 2.4], [[[0, 22, 36], [E0.x, E0.y, E0.z], 66], [[8, 26, 30], [E0.x, E0.y, E0.z], 66], 2.4]],
    [[M.endcard, [-4, 8, 26], [E0.x, E0.y + 2, E0.z], 62], [C.dur, [-8, 10, 30], [E0.x, E0.y + 2, E0.z], 64]]);
  frame = function (t) {
    STARS.rotation.y = t * .002; EARTH.rotation.y = t * .03; CLOUD.rotation.y = t * .04;
    const p = rockPos(t); ROCK.position.copy(p); RGL.position.copy(p); ROCK.rotation.set(t * .7, t * .5, t * .3);
    for (let i = 0; i < NT; i++) { const q = rockPos(t - i * .12); trP[i * 3] = q.x; trP[i * 3 + 1] = q.y; trP[i * 3 + 2] = q.z } trGeo.attributes.position.needsUpdate = true;
    const k6 = t > M.six + .6; SIX.forEach((m, i) => { m.visible = k6; const a = i / 6 * 2 * PI + t * .1, rr = 18 + i * 1.6; m.position.set(E0.x + Math.cos(a) * rr, E0.y + Math.sin(a * 2 + i) * 4, E0.z + Math.sin(a) * rr); m.rotation.set(t, t * .7, 0) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .5);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(60,120,255,.06)',
      black: 1 - ramp(t, 0, .25), white: flashW(t, [M.name, M.disc, M.nat, M.size, M.stay, M.dist, M.six]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿QUÉ NOMBRE<br>LE PONDRÍAS?', qs: 120, cta: 'COMENTÁ TU NOMBRE', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
function bone2D(x, y, s, col = '#f2e6c8') { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.strokeStyle = '#8a7a5a'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(-18, -120); sg.lineTo(18, -120); sg.lineTo(22, 40); sg.quadraticCurveTo(70, 70, 60, 110); sg.lineTo(20, 90); sg.lineTo(0, 120); sg.lineTo(-20, 90); sg.lineTo(-60, 110); sg.quadraticCurveTo(-70, 70, -22, 40); sg.closePath(); sg.fill(); sg.stroke();
  sg.strokeStyle = '#ff5a3a'; sg.setLineDash([10, 8]); sg.beginPath(); sg.moveTo(-30, -120); sg.lineTo(30, -126); sg.stroke(); sg.setLineDash([]); sg.restore() }
function egg2D(x, y, s, col = '#f4ead8') { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.beginPath(); sg.ellipse(0, 0, 40, 54, 0, 0, 7); sg.fill(); sg.fillStyle = 'rgba(160,120,80,.35)'; for (let i = 0; i < 8; i++) { sg.beginPath(); sg.arc((hash(i * 3) - .5) * 50, (hash(i * 5) - .5) * 70, 4, 0, 7); sg.fill() } sg.restore() }
function bird2D(x, y, s, col) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = col; sg.beginPath(); sg.ellipse(0, 0, 70, 50, -.1, 0, 7); sg.fill(); sg.beginPath(); sg.arc(62, -48, 24, 0, 7); sg.fill(); sg.fillStyle = '#e88a2a'; sg.beginPath(); sg.moveTo(82, -50); sg.lineTo(104, -44); sg.lineTo(82, -38); sg.fill(); sg.fillStyle = '#111'; sg.beginPath(); sg.arc(68, -54, 4, 0, 7); sg.fill();
  sg.strokeStyle = '#e88a2a'; sg.lineWidth = 7; for (const dx of [-15, 15]) { sg.beginPath(); sg.moveTo(dx, 40); sg.lineTo(dx, 85); sg.lineTo(dx + 18, 92); sg.moveTo(dx, 85); sg.lineTo(dx - 12, 94); sg.stroke() } sg.restore() }
// ==================================================================================== PART 2 — EL PÁJARO GIGANTE DE FLORES (isla tropical, tarde, volcán)
if (P == 2) {
  skyDome('#3a8ad8', '#ffd8a0', '#ffe8c0'); scene.background = new THREE.Color(0xffd8a8); scene.fog = new THREE.Fog(0xffe0b8, 30, 140);
  hemi.color.setHex(0xfff0d0); hemi.groundColor.setHex(0x3a5a2a); hemi.intensity = 1.35; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xffd8a0, 2.4); sun.position.set(-20, 22, 12); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 80 }); scene.add(sun);
  glowSprite(scene, 0xfff0b0, 14, -60, 26, -90); glowSprite(scene, 0xffa050, 50, -60, 26, -90).material.opacity = .4;
  const grassT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .22, '40,60,10') }, 50, 50);
  const ground = add(scene, new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: 0x6a8a3a, map: grassT })); ground.rotation.x = -PI / 2; ground.receiveShadow = true;
  // sea on the horizon + volcano
  const sea = add(scene, new THREE.PlaneGeometry(600, 300), new THREE.MeshStandardMaterial({ color: 0x3a8ab0, roughness: .2, metalness: .4 }), 0, .05, -170); sea.rotation.x = -PI / 2;
  const vol = add(scene, new THREE.ConeGeometry(30, 26, 40, 1, true), mat(0x5a6a3a), 30, 12, -95); add(scene, new THREE.ConeGeometry(42, 14, 40), mat(0x4a6a32), -40, 7, -110);
  const smoke = []; for (let i = 0; i < 6; i++) { const s2 = glowSprite(scene, 0xffffff, 8, 30, 26 + i * 3, -95); s2.material.blending = THREE.NormalBlending; s2.material.opacity = .35; smoke.push(s2) }
  // hill with the cave mouth
  const hill = add(scene, new THREE.SphereGeometry(14, 32, 20, 0, 2 * PI, 0, PI / 2), mat(0x7a7a5a), -6, -2, -24); hill.scale.set(1.3, .8, 1);
  const cave = add(scene, new THREE.CircleGeometry(4, 32, 0, PI), basic(0x0e0a06), -6, -.2, -10.6); cave.scale.set(1.2, 1.1, 1); cave.rotation.x = -.18;
  for (let i = 0; i < 14; i++) { const a = i / 13 * PI; const r = sph(scene, .5 + hash(i) * .5, mat(0x8a8466), -6 + Math.cos(a) * 4.9, Math.sin(a) * 4.4 - .2, -10.5, 1); r.scale.y *= .7 }
  // jungle: palms + broadleaf trees + ferns
  const trunk = mat(0x6a4a30), leaf = [mat(0x3e8a2a), mat(0x4e9a32), mat(0x2e7a2a)];
  for (let i = 0; i < 34; i++) { const a = hash(i * 2.3) * 2 * PI, r = 9 + hash(i * 4.1) * 32; const x = Math.cos(a) * r, z = Math.sin(a) * r - 10; if (z > 2 && Math.abs(x) < 10) continue; if (Math.abs(x + 6) < 8 && z > -14 && z < -8) continue; const s = .9 + hash(i * 6) * .9; const g = grp(scene); g.position.set(x, 0, z);
    const tr = add(g, G.cyl, trunk, 0, 3 * s, 0, 1); tr.scale.set(.18 * s, 6 * s, .18 * s); tr.rotation.z = (hash(i) - .5) * .25; for (let k = 0; k < 8; k++) { const lf = add(g, new THREE.ConeGeometry(.45 * s, 3.6 * s, 4), leaf[(i + k) % 3], 0, 6 * s, 0, 1); lf.rotation.order = 'YXZ'; lf.rotation.y = k * .8 + i; lf.rotation.x = 1.3; lf.translateY(1.6 * s) } }
  for (let i = 0; i < 80; i++) { const x = (hash(i * 3.7) - .5) * 44, z = -hash(i * 5.9) * 30 + 8; if (Math.abs(x) < 3.5 && z > -4) continue; const f = add(scene, new THREE.ConeGeometry(.5, 1.0, 6), leaf[i % 3], x, .5, z, 1); f.scale.set(1 + hash(i), .7 + hash(i * 2) * .6, 1 + hash(i)) }
  // mound of leaves and soil (incubation mound) with half-buried eggs
  const MOUND = add(scene, new THREE.SphereGeometry(1.3, 24, 12, 0, 2 * PI, 0, PI / 2), mat(0x6a4a2a), 1.8, 0, -.6, 2); MOUND.scale.y = .55;
  for (let i = 0; i < 40; i++) { const a = hash(i * 1.3) * 6.28, r = hash(i * 2.1) * 1.2; const l = add(scene, new THREE.PlaneGeometry(.22, .12), mat(i % 2 ? 0x8a6a2a : 0x5a7a2a, { side: THREE.DoubleSide }), 1.8 + Math.cos(a) * r, .7 * Math.sqrt(Math.max(0, 1 - (r / 1.3) ** 2)) + .02, -.6 + Math.sin(a) * r); l.rotation.set(-PI / 2 + (hash(i) - .5), 0, a) }
  const EGGS = []; for (const [x, z] of [[1.5, -.2], [2.1, -.4]]) { const e = sph(scene, .16, mat(0xf4ead8), x, .55, z); e.scale.y *= 1.3; EGGS.push(e) }
  const HEAT = []; for (let i = 0; i < 5; i++) { const h = glowSprite(scene, 0xff8a40, .7, 1.8, .6, -.6); h.material.opacity = 0; HEAT.push(h) }
  // the giant megapode (original stylised model) + a small living one for scale
  function megapode(body, s) {
    const B = grp(scene); B.scale.setScalar(s); const bm = mat(body), dk = mat(0x1a1410), leg = mat(0xe8862a), red = mat(0xc84a2a);
    const torso = sph(B, 1, bm, 0, .62, 0); torso.scale.set(.32, .3, .44); const tail = sph(B, 1, bm, 0, .7, -.42); tail.scale.set(.18, .14, .2); tail.rotation.x = .6;
    const H = grp(B); H.position.set(0, .92, .34); const neck = add(H, G.cyl, bm, 0, -.08, -.04, 1); neck.scale.set(.08, .22, .08); neck.rotation.x = .4; const head = sph(H, .13, bm, 0, .08, .04); sph(H, 1, red, 0, .07, .03).scale.set(.12, .045, .07);
    const beak = add(H, new THREE.ConeGeometry(.04, .14, 8), mat(0x3a3028), 0, .07, .2, 1); beak.rotation.x = PI / 2; for (const sx of [-1, 1]) sph(H, .025, dk, sx * .09, .12, .1, 0);
    const legs = []; for (const sx of [-1, 1]) { const l = grp(B); l.position.set(sx * .12, .4, .02); const m = add(l, G.cyl, leg, 0, -.18, 0, 1); m.scale.set(.035, .36, .035); for (const a of [-.5, 0, .5]) { const toe = add(l, G.cyl, leg, Math.sin(a) * .07, -.36, Math.cos(a) * .07, 1); toe.scale.set(.025, .16, .025); toe.rotation.set(PI / 2, 0, -a) } legs.push(l) }
    B.traverse(o => { if (o.isMesh) o.castShadow = true }); return { g: B, H, legs, torso };
  }
  const BIG = megapode(0x5a4a3a, 1.0), SMALL = megapode(0x6a5a48, .42);
  makePanel(V(0, 4.6, -6.5), 0, 4.0, 0xffd95a, 0xffa040);
  function animB(b, t, x, z, ry, moving, peck) { b.g.position.set(x, 0, z); b.g.rotation.y = ry; const ph = t * 7; b.legs.forEach((l, i) => l.rotation.x = moving ? Math.sin(ph + i * PI) * .5 : 0); b.torso.position.y = .62 + (moving ? Math.abs(Math.sin(ph)) * .02 : 0); b.H.rotation.x = peck ? Math.max(0, Math.sin(t * 4)) * .9 : Math.sin(t * 1.3) * .1; b.H.rotation.y = Math.sin(t * .8) * .4 }
  function draw(t) {
    const gold = '#ffd95a', gr = '#b8ff9a';
    if (t < M.cave) { bgS(t, '#2a1a08', '#4a2e10', 'rgba(255,217,90,.07)'); const k = ss(ramp(t, .4, 3.0)); txt('ESPERÓ', 360, 80, 48, '#ffc890'); txt(Math.round(17 * k) + ' AÑOS', 360, 200, 120, '#fff', { glow: '#ff8a30', blur: 36 }); bone2D(360, 450, 1.0 + .03 * Math.sin(t * 5)); txt('2009 → 2026', 360, 660, 40, gold) }
    else if (t < M.bone) { bgS(t, '#06202a', '#0a3a44', 'rgba(127,240,224,.07)'); txt('CUEVA LIANG BUA', 360, 70, 48, '#7ff0e0'); txt('ISLA DE FLORES · INDONESIA', 360, 125, 32, '#fff', { w: 800 });
      sg.fillStyle = '#3a8a4a'; sg.beginPath(); for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * PI, rr = 1 + .25 * Math.sin(a * 3) + .1 * Math.sin(a * 7); sg.lineTo(360 + Math.cos(a) * 250 * rr, 330 + Math.sin(a) * 60 * rr) } sg.closePath(); sg.fill();
      const pk = sr(t, M.cave + 1.0, M.cave + 1.5); if (pk > 0) { sg.globalAlpha = pk; sg.fillStyle = '#ff4a3a'; sg.beginPath(); sg.arc(300, 270, 26, PI, 0); sg.lineTo(300, 330); sg.closePath(); sg.fill(); sg.fillStyle = '#fff'; sg.beginPath(); sg.arc(300, 270, 10, 0, 7); sg.fill(); sg.globalAlpha = 1 }
      const k = sr(t, M.cave + 5.0, M.cave + 5.6); sg.globalAlpha = k; pill('LA CUEVA DEL "HOBBIT"', 360, 520, '#7a3a1a', '#fff', 42); txt('Homo floresiensis', 360, 620, 40, gold, { w: 700 }); sg.globalAlpha = 1 }
    else if (t < M.kg) { bgS(t, '#1a1410', '#2e241a', 'rgba(242,230,200,.07)'); txt('UN PEDAZO DE PATA', 360, 70, 46, '#f2e6c8'); bone2D(360, 330, 1.25); stampMark('EL MÁS GRANDE DE SU GRUPO', 360, 620, ramp(t, M.bone + 3.0, M.bone + 3.6), '#ff5a3a', -.05, 36) }
    else if (t < M.mound) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('PESO', 360, 70, 50, gr); const k = ss(ramp(t, M.kg + .6, M.kg + 2.6)), k2 = sr(t, M.kg + 3.4, M.kg + 4.0);
      bird2D(200, 290, 1.25 * (.6 + .4 * k), '#6a5440'); txt((3.9 * k).toFixed(1).replace('.', ',') + ' kg', 500, 270, 90, '#fff', { glow: '#4aff6a' }); txt('ROKUSI', 500, 345, 34, gold);
      sg.globalAlpha = k2; bird2D(200, 540, .45, '#9a8a70'); txt('0,5 – 1,2 kg', 490, 520, 56, '#fff'); txt('SU PARIENTE DE HOY', 490, 580, 30, gr); sg.globalAlpha = 1; stampMark('× 3 a 8', 360, 670, ramp(t, Ln.f3.end - .8, Ln.f3.end - .3), '#ff5a3a', -.06, 40) }
    else if (t < M.age) { bgS(t, '#200e06', '#3a1a0a', 'rgba(255,170,120,.07)'); txt('MEGÁPODO', 360, 70, 64, '#fff', { glow: '#ff8a30' }); txt('pariente de las gallinas', 360, 130, 34, '#ffc890', { w: 700 });
      sg.fillStyle = '#7a5230'; sg.beginPath(); sg.ellipse(360, 520, 300, 150, 0, PI, 0); sg.fill(); sg.fillStyle = '#5a3a20'; sg.fillRect(60, 520, 600, 30); for (const x of [270, 360, 450]) egg2D(x, 470, .7);
      for (let i = 0; i < 6; i++) { const x = 160 + i * 80, y = 330 - ((t * 60 + i * 30) % 90); sg.strokeStyle = `rgba(255,140,60,${.9 - ((t * 60 + i * 30) % 90) / 100})`; sg.lineWidth = 5; sg.beginPath(); for (let k = 0; k < 6; k++) sg.lineTo(x + Math.sin(k + t * 4) * 8, y + k * 10); sg.stroke() }
      const k = sr(t, M.mound + 3.2, M.mound + 3.8); sg.globalAlpha = k; pill('NO EMPOLLA: LOS ENTIERRA', 360, 230, '#c85a1a', '#fff', 38); sg.globalAlpha = 1 }
    else if (t < M.name) { bgS(t, '#14102a', '#241a44', 'rgba(200,180,255,.07)'); txt('VIVIÓ HACE', 360, 90, 50, '#d8c8ff'); const k = ss(ramp(t, M.age + .5, M.age + 2.2)); txt(fmt(190000 * k), 360, 250, 110, '#fff', { glow: '#b070ff' }); txt('a', 360, 340, 44, '#d8c8ff'); txt(fmt(120000 * k), 360, 430, 110, '#fff', { glow: '#b070ff' }); txt('AÑOS', 360, 540, 56, gold) }
    else if (t < M.eggs) { bgS(t, '#2a1a08', '#4a2e10', 'rgba(255,217,90,.07)'); txt('SU NOMBRE', 360, 70, 42, '#ffc890'); txt('MEGAPODIUS', 360, 180, 92, '#fff', { glow: '#ff8a30', blur: 36 }); txt('rokusi', 360, 275, 64, gold, { w: 700 });
      const k = sr(t, M.name + 2.2, M.name + 2.7); sg.globalAlpha = k; pill('POR ROKUS DUE AWE', 360, 430, '#7a3a1a', '#fff', 40); txt('científico indonesio', 360, 530, 36, '#fff', { w: 700 }); sg.globalAlpha = 1 }
    else { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('¿COMIDA DEL HOBBIT?', 360, 80, 50, gr); egg2D(360, 320, 2.2 + .05 * Math.sin(t * 4)); txt('?', 360, 330, 120, '#5a3a20');
      const k = sr(t, M.eggs + 2.6, M.eggs + 3.1); sg.globalAlpha = k; pill('PUDO SER', 360, 520, '#2a6a3a', '#fff', 44); sg.globalAlpha = 1; stampMark('NO PROBADO', 360, 640, ramp(t, Ln.f7.end - .8, Ln.f7.end - .3), '#ff5a3a', -.06, 56) }
    scanlines(.04); frameEdge('rgba(255,217,90,.6)');
  }
  const K = autoK([[0, [2.6, 1.7, 4.4], [0, .55, 0], 48], [M.title - .2, [-2.2, 1.9, 4.2], [0, .6, 0], 50], [M.title + .9, [0, 3.2, 3], [0, 4.6, -6.5], 60]],
    [M.cave, M.bone, M.kg, M.mound, M.age, M.name, M.eggs],
    [[[[2, 3, 6], [-6, 2, -11], 56], [[-2, 2.2, 1], [-6, 1.6, -11], 50], 2.6], null, [[[3.0, 1.2, 3.2], [.4, .7, 0], 48], [[-1.4, 1.0, 3.4], [.4, .7, 0], 48], 2.4], [[[3.6, 1.6, 2.4], [1.8, .4, -.6], 46], [[.6, 1.4, 2.8], [1.8, .4, -.6], 44], 2.6], [[[9, 5, 4], [30, 14, -95], 54], [[7, 5, 3], [30, 16, -95], 50], 2.2], null, [[[2.4, .9, 2.6], [1.5, .5, -.4], 44], [[.4, 1.0, 2.8], [1.6, .5, -.4], 42], 2.2]],
    [[M.endcard, [3, 1.6, 5], [.5, .8, 0], 52], [C.dur, [-3, 2, 5.4], [.5, .8, 0], 54]]);
  frame = function (t) {
    const wk = t < 3 || (t > M.bone && t < M.bone + 2) || (t > M.endcard);
    animB(BIG, t, lerp(-1.2, 0, ss(ramp(t, 0, 3))) + (t > M.endcard ? Math.sin(t * .5) * .3 : 0), .2, .5 + Math.sin(t * .3) * .3, wk, t > M.mound && t < M.age);
    animB(SMALL, t, 1.0, 1.0, -.8 + Math.sin(t * .9) * .5, Math.sin(t * 2) > .4, Math.sin(t * 1.7) > .6);
    smoke.forEach((s2, i) => { const k = ((t * .05 + i / 6) % 1); s2.position.set(30 + k * 6, 26 + k * 18, -95); s2.scale.setScalar(6 + k * 14); s2.material.opacity = .35 * (1 - k) });
    const hk = win(t, M.mound, M.age + .5, .5, .5); HEAT.forEach((h, i) => { const k = ((t * .5 + i / 5) % 1); h.position.set(1.8 + Math.sin(i * 2) * .5, .5 + k * 1.4, -.6 + Math.cos(i * 2) * .4); h.material.opacity = hk * .5 * (1 - k) });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .5);
    const O = { tag: .95, title: win(t, .45, M.cave - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,150,60,.06)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.cave, M.bone, M.kg, M.mound, M.age, M.name, M.eggs]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿LO TENDRÍAS<br>EN EL PATIO?', qs: 125, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}
function spider2D(x, y, s, col = '#c87a3a', t = 0) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.strokeStyle = '#3a2418'; sg.lineWidth = 5; sg.lineCap = 'round';
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const a = -.9 + i * .55, w = Math.sin(t * 6 + i) * .05; sg.beginPath(); sg.moveTo(0, 10); sg.lineTo(sx * Math.cos(a + w) * 60, 10 + Math.sin(a + w) * 50); sg.lineTo(sx * Math.cos(a + w) * 95, 10 + Math.sin(a + w) * 50 + 40); sg.stroke() }
  sg.fillStyle = '#5a3a24'; sg.beginPath(); sg.ellipse(0, -12, 22, 20, 0, 0, 7); sg.fill(); sg.fillStyle = col; sg.beginPath(); sg.moveTo(0, 0); sg.bezierCurveTo(-56, 6, -46, 70, 0, 96); sg.bezierCurveTo(46, 70, 56, 6, 0, 0); sg.fill();
  sg.fillStyle = '#7a4a24'; sg.beginPath(); sg.arc(-30, 18, 8, 0, 7); sg.fill(); sg.beginPath(); sg.arc(30, 18, 8, 0, 7); sg.fill(); sg.strokeStyle = 'rgba(60,30,10,.6)'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(0, 30); sg.lineTo(-20, 60); sg.moveTo(0, 30); sg.lineTo(20, 60); sg.stroke(); sg.lineCap = 'butt'; sg.restore() }
function tl2(years, k, cols) { sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 6; sg.beginPath(); sg.moveTo(80, 360); sg.lineTo(640, 360); sg.stroke(); years.forEach((y, i) => { const a = sr(k, i * .3, i * .3 + .3); sg.globalAlpha = a; const x = 80 + i * 560 / Math.max(1, years.length - 1); sg.fillStyle = cols[i]; sg.beginPath(); sg.arc(x, 360, 18, 0, 7); sg.fill(); txt(y, x, 300, 44, '#fff'); sg.globalAlpha = 1 }) }
// ==================================================================================== PART 3 — LA ARAÑA DEL PRIMER NOMBRE (isla del Báltico, amanecer con bruma)
if (P == 3) {
  skyDome('#4a5aa8', '#f0a8b8', '#ffd8c0'); scene.background = new THREE.Color(0xf0c0c0); scene.fog = new THREE.Fog(0xf0c8c8, 18, 90);
  hemi.color.setHex(0xffe0e8); hemi.groundColor.setHex(0x3a4a3a); hemi.intensity = 1.4; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xffc8a0, 2.2); sun.position.set(30, 8, -40); scene.add(sun); const fill = new THREE.DirectionalLight(0xb0c8ff, 1.2); fill.position.set(-10, 10, 14); scene.add(fill);
  glowSprite(scene, 0xfff0d0, 18, 60, 6, -110); glowSprite(scene, 0xffa080, 60, 60, 6, -110).material.opacity = .45;
  const sea = add(scene, new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x5a7aa8, roughness: .15, metalness: .5 }), 0, -.3, 0); sea.rotation.x = -PI / 2;
  // rocky island + meadow
  const isl = add(scene, new THREE.CylinderGeometry(16, 19, 1.2, 40), mat(0x8a8a7a), 0, .1, -6, 2);
  const mead = add(scene, new THREE.CylinderGeometry(14, 15.5, .3, 40), new THREE.MeshLambertMaterial({ color: 0x7a9a4a, map: tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .2, '40,60,10') }, 20, 20) }), 0, .8, -6, 2);
  for (let i = 0; i < 40; i++) { const a = hash(i * 1.9) * 6.28, r = 15 + hash(i * 3.1) * 4; const rk = sph(scene, .5 + hash(i) * 1.1, mat(i % 2 ? 0x9a9488 : 0x7a7468), Math.cos(a) * r, .2, -6 + Math.sin(a) * r); rk.scale.y *= .55 }
  // pines + birches + juniper
  const pineM = [mat(0x2a4a2a), mat(0x34583a)], trunkM = mat(0x5a4030);
  for (let i = 0; i < 30; i++) { const a = hash(i * 2.7) * 6.28, r = 5 + hash(i * 5.1) * 9; const x = Math.cos(a) * r, z = -6 + Math.sin(a) * r; if (z > -10 && Math.abs(x) < 6.5) continue; const s = .8 + hash(i * 7) * .8, g = grp(scene); g.position.set(x, .9, z);
    const tr = add(g, G.cyl, trunkM, 0, 1.2 * s, 0, 1); tr.scale.set(.12 * s, 2.4 * s, .12 * s); for (let k = 0; k < 4; k++) add(g, new THREE.ConeGeometry((1.3 - k * .25) * s, 1.6 * s, 9), pineM[k % 2], 0, (1.8 + k * .8) * s, 0, 1) }
  for (let i = 0; i < 30; i++) { const x = (hash(i * 4.4) - .5) * 20, z = -hash(i * 6.6) * 14 + 2; if (Math.abs(x) < 3 && z > -9) continue; const b = sph(scene, .5 + hash(i) * .4, mat(0x4a6a3a), x, 1.0, z); b.scale.y *= .6 }
  // big orb web between two branches (macro, near the camera) + dew drops
  const W0 = V(0, 2.0, 1.2), WR = 1.15; const WEB = grp(scene); WEB.position.copy(W0); const wM = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .75, fog: false });
  const spokes = 22, wp = []; for (let i = 0; i < spokes; i++) { const a = i / spokes * 2 * PI; wp.push(0, 0, 0, Math.cos(a) * WR, Math.sin(a) * WR, 0) }
  for (let r = .12; r < WR; r += .07) for (let i = 0; i < spokes; i++) { const a = i / spokes * 2 * PI, b = (i + 1) / spokes * 2 * PI; wp.push(Math.cos(a) * r, Math.sin(a) * r, 0, Math.cos(b) * r, Math.sin(b) * r, 0) }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3)); WEB.add(new THREE.LineSegments(wg, wM));
  for (const [x1, y1, x2, y2] of [[-1.6, 1.4, 1.7, 1.3], [-1.5, -1.4, 1.6, -1.6]]) { const br = add(scene, G.cyl, trunkM, W0.x + (x1 + x2) / 2, W0.y + (y1 + y2) / 2, W0.z - .05); br.scale.set(.05, Math.hypot(x2 - x1, y2 - y1), .05); br.rotation.z = Math.atan2(y2 - y1, x2 - x1) - PI / 2 }
  const ln2 = []; for (const [x, y] of [[-1.1, .9], [1.15, .85], [-1.0, -.95], [1.1, -1.05]]) ln2.push(0, 0, 0, x * 1.25, y * 1.4, 0); const ag = new THREE.BufferGeometry(); ag.setAttribute('position', new THREE.Float32BufferAttribute(ln2, 3)); WEB.add(new THREE.LineSegments(ag, wM));
  const DEW = []; for (let i = 0; i < 46; i++) { const a = hash(i * 3.3) * 6.28, r = .15 + hash(i * 5.5) * .95; const d = glowSprite(WEB, 0xffffff, .07 + hash(i) * .05, Math.cos(a) * r, Math.sin(a) * r, .01); d.material.opacity = .8; DEW.push(d) }
  // spider (original stylised orb weaver, brown with two humps)
  const SP = grp(WEB); SP.position.set(0, .02, .03); const abM = mat(0xb06a32), ceM = mat(0x5a3a24), lgM = mat(0x3a2418);
  const ab = sph(SP, 1, abM, 0, -.08, 0); ab.scale.set(.12, .14, .08); for (const sx of [-1, 1]) sph(SP, .03, mat(0x7a4a24), sx * .07, -.02, .05);
  const ce = sph(SP, 1, ceM, 0, .1, .01); ce.scale.set(.06, .06, .04); const LEGS = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const a = .9 - i * .55; const l = grp(SP); l.position.set(sx * .03, .1, .02); l.rotation.z = sx * (PI / 2 - a) * -1 + (sx < 0 ? PI : 0); const s1 = add(l, G.cyl, lgM, .09, 0, 0); s1.scale.set(.008, .18, .008); s1.rotation.z = PI / 2; const s2 = add(l, G.cyl, lgM, .2, -.05, 0); s2.scale.set(.007, .14, .007); s2.rotation.z = PI / 2 + .9 * (i < 2 ? -1 : 1) * .5; LEGS.push(l) }
  SP.scale.setScalar(1.25);
  // a tiny button next to the web (size reference, appears at the end)
  const BTN = add(scene, new THREE.CylinderGeometry(.09, .09, .03, 24), mat(0xd8c8a8), .55, 1.5, 1.25); BTN.rotation.x = PI / 2; BTN.visible = false;
  makePanel(V(0, 5.6, -5.5), 0, 4.0, 0xffb0e0, 0xff70b0);
  function draw(t) {
    const gold = '#ffd95a', pk = '#ffb0e0';
    if (t < M.name) { bgS(t, '#2a0a20', '#4a1438', 'rgba(255,176,224,.07)'); txt('EL PRIMER', 360, 80, 54, pk); txt('NOMBRE CIENTÍFICO', 360, 150, 50, '#fff'); txt('#1', 360, 330, 200, gold, { glow: '#ffb000', blur: 44 }); spider2D(360, 520, .9 + .05 * Math.sin(t * 4), '#c87a3a', t) }
    else if (t < M.lin) { bgS(t, '#1a1410', '#2e241a', 'rgba(242,230,200,.07)'); txt('SE LLAMA', 360, 70, 42, '#f2e6c8'); txt('Araneus', 360, 180, 100, '#fff', { glow: '#ff8a30', w: 800 }); txt('angulatus', 360, 290, 84, gold, { w: 800 });
      const k = sr(t, M.name + 2.4, M.name + 2.9), k2 = sr(t, M.name + 3.4, M.name + 3.9); sg.globalAlpha = k; pill('CARL CLERCK · SUECIA', 360, 440, '#7a3a1a', '#fff', 38); sg.globalAlpha = k2; txt('1757', 360, 580, 110, '#fff', { glow: '#ff8a30' }); sg.globalAlpha = 1 }
    else if (t < M.out) { bgS(t, '#0a1426', '#142a4a', 'rgba(160,200,255,.07)'); txt('¿QUIÉN FUE PRIMERO?', 360, 80, 48, '#9fd8ff'); tl2(['1757', '1758'], ramp(t, M.lin + .2, M.lin + 1.6), [gold, '#9ac0ff']); txt('CLERCK', 80, 430, 36, gold, { a: 'left' }); txt('LINNEO', 640, 430, 36, '#9ac0ff', { a: 'right' });
      stampMark('1 AÑO ANTES', 360, 600, ramp(t, Ln.s2.end - 1.0, Ln.s2.end - .5), '#ff5a3a', -.06, 60) }
    else if (t < M.exc) { bgS(t, '#200a0a', '#3a1414', 'rgba(255,140,140,.07)'); txt('CONGRESO DE', 360, 80, 44, '#ffb0a0'); txt('1892', 360, 200, 140, '#fff', { glow: '#ff3a3a' }); txt('TODO EMPIEZA CON LINNEO', 360, 350, 40, '#fff');
      const k = sr(t, M.out + 3.6, M.out + 4.1); sg.globalAlpha = k; pill('CLERCK', 360, 500, '#7a3a1a', '#fff', 56); sg.globalAlpha = 1; cross(360, 500, 120, '#ff3a3a', ramp(t, Ln.s3.end - 1.0, Ln.s3.end - .3)); txt('AFUERA', 360, 640, 52, '#ff8a8a') }
    else if (t < M.lost) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('PERO EN', 360, 80, 44, '#b8ff9a'); txt('1948', 360, 200, 140, '#fff', { glow: '#4aff6a' }); pill('CLERCK VUELVE', 360, 360, '#2a7a3a', '#fff', 50);
      burst(360, 360, 260 * sr(t, M.exc + 1.6, M.exc + 2.2), 'rgba(255,217,90,.5)', t); stampMark('EXCEPCIÓN ÚNICA', 360, 560, ramp(t, Ln.s4.end - 1.2, Ln.s4.end - .6), gold, -.06, 64) }
    else if (t < M.isle) { bgS(t, '#14102a', '#241a44', 'rgba(200,180,255,.07)'); txt('3 ARAÑAS DE MUESTRA', 360, 80, 46, '#d8c8ff'); const fk = ramp(t, Ln.s5.end - 1.6, Ln.s5.end - .2);
      for (let i = 0; i < 3; i++) { sg.globalAlpha = 1 - fk; sg.strokeStyle = '#d8c8ff'; sg.lineWidth = 4; sg.strokeRect(70 + i * 205, 170, 170, 230); spider2D(155 + i * 205, 260, .65, '#c87a3a', t + i); sg.globalAlpha = 1; sg.strokeStyle = `rgba(216,200,255,${.4 + .6 * fk})`; sg.setLineDash([12, 10]); sg.strokeRect(70 + i * 205, 170, 170, 230); sg.setLineDash([]) }
      txt('1858 → 1965', 360, 490, 70, '#fff'); stampMark('DESAPARECIERON', 360, 630, ramp(t, Ln.s5.end - .8, Ln.s5.end - .2), '#ff5a3a', -.06, 54) }
    else if (t < M.dna) { bgS(t, '#04142a', '#0a2a4a', 'rgba(140,200,255,.07)'); txt('MAR BÁLTICO', 360, 80, 60, '#9fd8ff'); txt('SUECIA', 360, 145, 40, '#fff');
      sg.strokeStyle = 'rgba(160,210,255,.6)'; sg.lineWidth = 4; for (let r = 0; r < 4; r++) { sg.beginPath(); for (let x = 60; x <= 660; x += 10) sg.lineTo(x, 470 + r * 50 + Math.sin(x * .03 + t * 2 + r) * 10); sg.stroke() } sg.fillStyle = '#5a7a4a'; sg.beginPath(); sg.ellipse(360, 420, 170, 60, 0, PI, 0); sg.fill();
      for (let i = 0; i < 5; i++) { sg.fillStyle = '#2a4a2a'; sg.beginPath(); sg.moveTo(270 + i * 45, 400); sg.lineTo(290 + i * 45, 320); sg.lineTo(310 + i * 45, 400); sg.fill() } const k = sr(t, M.isle + 1.4, M.isle + 1.9); sg.globalAlpha = k; pill('MUSEO SMITHSONIANO', 360, 240, '#1f5fb0', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.museum) { bgS(t, '#0a1a12', '#123020', 'rgba(160,255,200,.07)'); const n = Math.min(8, Math.floor(ramp(t, M.dna + .3, M.dna + 1.6) * 8 + .001)); txt('8 ARAÑAS', 360, 70, 52, '#a8ffc8');
      for (let i = 0; i < 8; i++) { if (i >= n) continue; const sel = i == 4 && t > M.dna + 4.6; sg.globalAlpha = t > M.dna + 4.6 && !sel ? .3 : 1; spider2D(90 + (i % 4) * 180, 190 + Math.floor(i / 4) * 150, .45, sel ? gold : '#c87a3a', t + i); sg.globalAlpha = 1 }
      sg.save(); sg.translate(0, 0); for (let i = 0; i < 30; i++) { const x = 80 + i * 19, a = Math.sin(i * .5 + t * 3) * 36; sg.fillStyle = '#4affb0'; sg.beginPath(); sg.arc(x, 520 + a, 7, 0, 7); sg.fill(); sg.fillStyle = '#ff6ad0'; sg.beginPath(); sg.arc(x, 520 - a, 7, 0, 7); sg.fill() } sg.restore(); txt('ADN', 360, 520, 56, '#fff', { glow: '#000', blur: 10 });
      stampMark('NEOTIPO', 360, 650, ramp(t, Ln.s7.end - .9, Ln.s7.end - .3), gold, -.06, 56) }
    else { bgS(t, '#2a0a20', '#4a1438', 'rgba(255,176,224,.07)'); txt('TAMAÑO', 360, 70, 46, pk); sg.fillStyle = '#d8c8a8'; sg.beginPath(); sg.arc(220, 260, 90, 0, 7); sg.fill(); sg.fillStyle = '#b8a888'; for (const [dx, dy] of [[-22, -22], [22, -22], [-22, 22], [22, 22]]) { sg.beginPath(); sg.arc(220 + dx, 260 + dy, 12, 0, 7); sg.fill() } txt('BOTÓN', 220, 400, 34, '#fff');
      txt('≈', 360, 260, 90, gold); spider2D(500, 220, .95, gold, t); txt('ARAÑA', 500, 400, 34, '#fff'); const k = sr(t, M.museum + 2.4, M.museum + 2.9); sg.globalAlpha = k; pill('MUSEO SUECO', 360, 520, '#7a2a6a', '#fff', 44); txt('DE HISTORIA NATURAL', 360, 610, 38, '#fff'); sg.globalAlpha = 1 }
    scanlines(.04); frameEdge('rgba(255,176,224,.6)');
  }
  const wc = [W0.x, W0.y, W0.z];
  const K = autoK([[0, [.6, 2.3, 3.7], wc, 42], [M.title - .2, [-.8, 2.5, 4.2], wc, 46], [M.title + .9, [0, 4.4, 2.6], [0, 5.6, -5.5], 60]],
    [M.name, M.lin, M.out, M.exc, M.lost, M.isle, M.dna, M.museum],
    [[[[1.2, 2.1, 2.6], wc, 36], [[-1.0, 2.3, 2.8], wc, 38], 2.4], null, null, null, [[[.3, 2.1, 3.2], wc, 38], [[-.4, 2.2, 3.4], wc, 40], 1.8], [[[-8, 6, 16], [0, 1, -8], 60], [[-3, 4, 12], [0, 1, -8], 56], 2.4], null, [[[.9, 2.1, 3.5], [.3, 1.9, 1.2], 38], [[-.3, 2.2, 3.6], [.2, 1.9, 1.2], 38], 2.4]],
    [[M.endcard, [1.2, 2.4, 3.6], wc, 46], [C.dur, [-1.2, 2.6, 4.0], wc, 48]]);
  frame = function (t) {
    WEB.rotation.y = Math.sin(t * .6) * .06; WEB.rotation.x = Math.sin(t * .45) * .03; LEGS.forEach((l, i) => l.rotation.y = Math.sin(t * 3 + i) * .08);
    DEW.forEach((d, i) => d.material.opacity = .55 + .35 * Math.sin(t * 2 + i));
    BTN.visible = t > M.museum; sea.material.color.setHSL(.6, .3, .5 + .03 * Math.sin(t));
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .16 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .4);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,120,180,.05)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.name, M.lin, M.out, M.exc, M.lost, M.isle, M.dna, M.museum]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿LE TENÉS MIEDO<br>A LAS ARAÑAS?', qs: 110, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

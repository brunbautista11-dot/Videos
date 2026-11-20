// Virales 20/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: supernova SN 2026ahvu · p2: la piedra del fondo del mar con 245 bichitos · p3: el roedor gigante de 30 kilos
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'EXPLOTÓ<br>UNA ESTRELLA', ts: 140, tag: 'ESPACIO<b>ESTA SEMANA</b>', sub: 'SN 2026ahvu', spk: { n: ['#ffd95a', '', 0], q: ['#ff9ae0', '', 0] } },
  2: { title: '245 BICHOS<br>EN UNA PIEDRA', ts: 128, tag: 'OCÉANO<b>CIENCIA</b>', sub: 'ESTUDIO 2026', spk: { n: ['#7ff0e0', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: 'EL RATÓN<br>GIGANTE', ts: 150, tag: 'FÓSILES<b>CIENCIA</b>', sub: 'HACE 34 MILLONES DE AÑOS', spk: { n: ['#ffd95a', '', 0], q: ['#9aff8a', '', 0] } },
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

// ==================================================================================== PART 1 — SUPERNOVA (observatorio en la montaña, de noche)
if (P == 1) {
  skyDome('#05061a', '#1e1548', '#5a3a7a'); const STARS = starField(3000, 140, .02, 1.1, .3);
  scene.background = new THREE.Color(0x0c0c26); scene.fog = new THREE.Fog(0x2a2250, 40, 150);
  hemi.color.setHex(0x9aa0ff); hemi.groundColor.setHex(0x3a3040); hemi.intensity = 1.6; R.toneMappingExposure = 1.2;
  const moon = new THREE.DirectionalLight(0xc8d0ff, 1.6); moon.position.set(-25, 30, 20); scene.add(moon);
  const GN = 100, gGeo = new THREE.PlaneGeometry(260, 260, GN, GN); gGeo.rotateX(-PI / 2); const gp = gGeo.attributes.position;
  const hY = (x, z) => { const d = Math.hypot(x, z + 6); return Math.max(-14, -d * d * .004) + Math.sin(x * .2) * .3 + Math.cos(z * .17) * .3 + (z < -60 ? (Math.sin(x * .06) + 1.2) * 6 : 0) };
  for (let i = 0; i < gp.count; i++) gp.setY(i, hY(gp.getX(i), gp.getZ(i)));
  gGeo.computeVertexNormals(); const rockT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .3, '40,30,30') }, 30, 30);
  add(scene, gGeo, new THREE.MeshLambertMaterial({ color: 0x6a5a5a, map: rockT }));
  for (let i = 0; i < 40; i++) { const x = (hash(i * 2.2) - .5) * 40, z = (hash(i * 3.3) - .5) * 30 - 6; if (Math.abs(x) < 4 && z > -16) continue; const r = sph(scene, .3 + hash(i) * .8, mat(0x5a4c4c), x, hY(x, z), z, 0); r.scale.y *= .6 }
  // observatory domes (original design)
  const OBS = []; for (const [x, z, s] of [[-7, -16, 1.6], [8, -20, 1.1]]) { const g = grp(scene); g.position.set(x, hY(x, z), z); g.scale.setScalar(s);
    add(g, new THREE.CylinderGeometry(2.2, 2.3, 3, 24), mat(0xe8e8f0), 0, 1.5, 0, 0); const dome = add(g, new THREE.SphereGeometry(2.25, 24, 12, 0, 2 * PI, 0, PI / 2), new THREE.MeshLambertMaterial({ color: 0xf4f4ff, emissive: 0x202040 }), 0, 3, 0, 0);
    const slit = box(g, .9, 2.3, .3, basic(0x0a0a18), 0, 4.1, 1.75, 0); slit.rotation.x = -.6; box(g, .8, 1.4, .05, basic(0xffd890), 0, .7, 2.28, 0); glowSprite(g, 0xffc060, 2, 0, .8, 2.4).material.opacity = .5; OBS.push({ g, dome, slit }) }
  // the galaxy + the supernova in the sky
  const GAL = new THREE.Sprite(new THREE.SpriteMaterial({ map: galT, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: .9 })); GAL.scale.set(34, 34, 1); GAL.position.set(26, 44, -70); scene.add(GAL);
  const SN = glowSprite(scene, 0xfff2d0, 3, 32, 42, -69), SNH = glowSprite(scene, 0xff9ae0, 12, 32, 42, -69.2);
  const RING = glowSprite(scene, 0xffffff, 1, 32, 42, -69.1);
  makePanel(V(0, 6.6, -10), 0, 4.4, 0xffd95a, 0xb070ff);
  function bright(t) { return .15 + .85 * sr(t, M.atlas, M.mag + 3.5) + .6 * win(t, Ln.d5.end - .4, Ln.d5.end + 1.2, .05, 1.0) }
  function draw(t) {
    const gold = '#ffd95a', pk = '#ff9ae0';
    if (t < M.name) { bgS(t, '#10082a', '#2a0e48', 'rgba(255,154,224,.07)'); burst(360, 380, 230 * (.8 + .2 * Math.sin(t * 6)), '#ffd95a', t); star(360, 380, 90, '#fff') }
    else if (t < M.gal) { bgS(t, '#0a0a24', '#16164a', 'rgba(160,170,255,.07)'); txt('SU NOMBRE OFICIAL', 360, 90, 46, '#b8c0ff'); const s = 'SN 2026ahvu', n = Math.floor(cl((t - M.name - 2.4) / 1.6) * s.length + .001);
      sg.fillStyle = 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(50, 230, 620, 170, 26); sg.fill(); txt(s.slice(0, n) + (Math.sin(t * 10) > 0 ? '|' : ' '), 360, 318, 96, '#fff', { glow: '#ff6ad0', blur: 30, w: 800 });
      const k = sr(t, Ln.d1.end - .6, Ln.d1.end - .2); sg.globalAlpha = k; pill('¿O UNA CONTRASEÑA?', 360, 560, '#7a2a8a', '#fff', 46); sg.globalAlpha = 1 }
    else if (t < M.old) { bgS(t, '#04041a', '#0e0e36', 'rgba(160,170,255,.06)'); txt('GALAXIA NGC 1433', 360, 80, 50, '#b8c0ff'); galaxy2D(360, 280, 1.6, t);
      const sx = 360 + 70, sy = 280 - 30, sk = sr(t, M.gal + 1.6, M.gal + 2.2); if (sk > 0) { sg.globalAlpha = sk; sg.strokeStyle = gold; sg.lineWidth = 5; sg.beginPath(); sg.arc(sx, sy, 34 + 6 * Math.sin(t * 6), 0, 7); sg.stroke(); star(sx, sy, 18, '#fff'); sg.globalAlpha = 1 }
      const k = ss(ramp(t, M.gal + 3.4, M.gal + 4.8)); sg.globalAlpha = cl(k * 3); txt(fmt(50000000 * k), 360, 560, 92, '#fff', { glow: '#6a7aff' }); txt('AÑOS LUZ', 360, 650, 46, gold); sg.globalAlpha = 1 }
    else if (t < M.atlas) { bgS(t, '#140a06', '#2e180a', 'rgba(255,200,140,.07)'); txt('ESA LUZ SALIÓ HACE', 360, 80, 46, '#ffc890'); txt('≈ 50', 360, 230, 170, '#fff', { glow: '#ff8a30', blur: 40 }); txt('MILLONES DE AÑOS', 360, 360, 56, '#ffc890');
      sg.strokeStyle = 'rgba(255,255,255,.5)'; sg.lineWidth = 4; sg.beginPath(); sg.moveTo(80, 480); sg.lineTo(640, 480); sg.stroke(); const lx = lerp(80, 640, sr(t, M.old + .4, M.old + 2.6)); star(lx, 480, 22, gold);
      stampMark('TODAVÍA NO HABÍA HUMANOS', 360, 610, ramp(t, Ln.d3.end - 1.4, Ln.d3.end - .8), '#ff5a3a', -.06, 38) }
    else if (t < M.ia) { bgS(t, '#04140e', '#0a2a1e', 'rgba(140,255,200,.07)'); txt('LA DESCUBRIÓ', 360, 80, 46, '#a8ffd8'); txt('ATLAS', 360, 190, 130, '#fff', { glow: '#2affb0', blur: 40 });
      sg.save(); sg.translate(360, 430); sg.strokeStyle = 'rgba(140,255,200,.4)'; sg.lineWidth = 3; for (const r of [60, 110, 160]) { sg.beginPath(); sg.arc(0, 0, r, 0, 7); sg.stroke() } const a = t * 3; sg.strokeStyle = '#2affb0'; sg.lineWidth = 6; sg.beginPath(); sg.moveTo(0, 0); sg.lineTo(Math.cos(a) * 160, Math.sin(a) * 160); sg.stroke();
      const bk = sr(t, M.atlas + .4, M.atlas + .7); if (bk > 0) { sg.fillStyle = `rgba(255,217,90,${bk})`; sg.beginPath(); sg.arc(80, -60, 14 + 6 * Math.sin(t * 9), 0, 7); sg.fill() } sg.restore();
      const k = sr(t, M.atlas + 1.6, M.atlas + 2.1); sg.globalAlpha = k; pill('2 DE NOVIEMBRE', 360, 655, '#1a7a5a', '#fff', 46); sg.globalAlpha = 1 }
    else if (t < M.mag) { bgS(t, '#0a0626', '#1c0e44', 'rgba(200,170,255,.07)'); txt('TIPO Ia', 360, 80, 70, '#fff', { glow: '#b070ff' }); const end = Ln.d5.end - .35, boomK = ramp(t, end, end + .8);
      if (boomK <= 0) { const wd = [250, 360], cs = [520, 360]; const g2 = sg.createRadialGradient(cs[0], cs[1], 0, cs[0], cs[1], 120); g2.addColorStop(0, '#ffb060'); g2.addColorStop(1, 'rgba(255,90,40,0)'); sg.fillStyle = g2; sg.beginPath(); sg.arc(cs[0], cs[1], 120, 0, 7); sg.fill();
        for (let i = 0; i < 40; i++) { const k = ((i / 40 + t * .6) % 1); const x = lerp(cs[0] - 90, wd[0], k), y = wd[1] + Math.sin(k * PI * 2 + 1) * 40 * (1 - k); sg.fillStyle = `rgba(255,190,120,${.9 - k * .6})`; sg.beginPath(); sg.arc(x, y, 7 - k * 4, 0, 7); sg.fill() }
        const grow = 1 + .4 * sr(t, M.ia + 2, end); sg.fillStyle = '#fff'; sg.shadowColor = '#bfe0ff'; sg.shadowBlur = 40; sg.beginPath(); sg.arc(wd[0], wd[1], 26 * grow, 0, 7); sg.fill(); sg.shadowBlur = 0;
        txt('ENANA BLANCA', 250, 470, 32, '#dfe8ff'); txt('COMPAÑERA', 520, 520, 32, '#ffc890'); bar(110, 600, 500, 40, sr(t, M.ia + 1.5, end), '#ff6ad0'); txt('¿CUÁNTO AGUANTA?', 360, 670, 34, '#fff') }
      else { burst(360, 380, 120 + 260 * ss(boomK), '#fff2c0', t); star(360, 380, 70 + 40 * ss(boomK), '#fff'); txt('¡BOOM!', 360, 640, 90, gold, { glow: '#ff8a00' }) } }
    else if (t < M.ruler) { bgS(t, '#10082a', '#2a0e48', 'rgba(255,154,224,.07)'); txt('BRILLO (MAGNITUD)', 360, 70, 44, pk); txt('menos número = más brillo', 360, 120, 30, 'rgba(255,255,255,.7)', { w: 700 });
      const k = ss(ramp(t, M.mag + 1.6, M.mag + 3.6)), m = lerp(17, 13.5, k); txt(m.toFixed(1).replace('.', ','), 360, 280, 180, '#fff', { glow: '#ff6ad0', blur: 44 }); bar(110, 420, 500, 44, lerp(.2, .75, k), '#ffd95a'); txt('17', 110, 490, 32, '#fff', { a: 'left' }); txt('13,5', 610, 490, 32, '#fff', { a: 'right' });
      const k2 = sr(t, Ln.d6.end - 2.2, Ln.d6.end - 1.6); sg.globalAlpha = k2; pill('PICO: 18 – 23 NOV', 360, 620, '#c89a1a', '#1a1a2a', 50); sg.globalAlpha = 1 }
    else if (t < M.where) { bgS(t, '#06142a', '#0e2a4a', 'rgba(140,200,255,.07)'); txt('UNA REGLA CÓSMICA', 360, 80, 52, '#9fd8ff');
      sg.fillStyle = '#ffd95a'; sg.fillRect(80, 220, 560, 70); sg.fillStyle = '#1a1a2a'; for (let i = 0; i <= 28; i++) sg.fillRect(80 + i * 20, 220, 4, i % 5 ? 24 : 44); const k = sr(t, M.ruler + 1.2, M.ruler + 2.4); star(lerp(100, 600, k), 360, 26, '#fff');
      const k2 = sr(t, Ln.d7.end - 2.4, Ln.d7.end - 1.8); sg.globalAlpha = sr(t, M.ruler + 1.4, M.ruler + 1.9); txt('MIDE DISTANCIAS', 360, 470, 56, '#fff'); sg.globalAlpha = k2; pill('EXPANSIÓN DEL UNIVERSO', 360, 600, '#1f5fb0', '#fff', 42); sg.globalAlpha = 1 }
    else { bgS(t, '#04081e', '#0c1640', 'rgba(160,190,255,.07)'); txt('CONSTELACIÓN', 360, 70, 44, '#b8c0ff'); txt('DEL RELOJ', 360, 135, 70, '#fff', { glow: '#6a8aff' });
      const pts = [[200, 260], [290, 300], [350, 380], [430, 410], [500, 500], [470, 590]]; sg.strokeStyle = 'rgba(255,255,255,.55)'; sg.lineWidth = 4; sg.beginPath(); pts.forEach((p, i) => i ? sg.lineTo(...p) : sg.moveTo(...p)); sg.stroke(); pts.forEach(p => star(p[0], p[1], 12, '#fff'));
      const bl = .6 + .4 * Math.sin(t * 7); star(560, 330, 20 + 8 * bl, gold); sg.strokeStyle = gold; sg.lineWidth = 4; sg.beginPath(); sg.arc(560, 330, 40, 0, 7); sg.stroke();
      const k = sr(t, Ln.d8.end - 2.8, Ln.d8.end - 2.2); sg.globalAlpha = k; pill('TELESCOPIO CHICO = CHANCE', 360, 660, '#2a9a5a', '#fff', 38); sg.globalAlpha = 1 }
    scanlines(.05); frameEdge('rgba(255,217,90,.6)');
  }
  const K = autoK([[0, [2, 2.4, 10], [32, 42, -69], 58], [.6, [2, 2.4, 10], [32, 42, -69], 52], [M.title - .2, [1, 2.6, 8], [28, 40, -69], 56], [M.title + .9, [0, 4.4, 4], [0, 6.6, -10], 60]],
    [M.name, M.gal, M.old, M.atlas, M.ia, M.mag, M.ruler, M.where],
    [null, [[[3, 2.2, 4], [26, 44, -70], 40], [[2, 2.4, 2], [30, 43, -70], 30], 2.4], null, [[[-2, 1.8, -6], [-7, 7, -16], 60], [[1, 2.4, -8], [-7, 6, -16], 56], 2.0], null, [[[4, 2.4, 2], [32, 42, -69], 34], [[3, 2.6, 0], [32, 42, -69], 26], 2.0], null, null],
    [[M.endcard, [0, 3, 12], [24, 30, -60], 62], [C.dur, [-3, 3.4, 15], [24, 32, -60], 64]]);
  frame = function (t) {
    STARS.rotation.y = t * .003; const b = bright(t), fl = win(t, 0, .9, .05, .8);
    SN.scale.setScalar(2 + 6 * b + 20 * fl); SNH.scale.setScalar(6 + 18 * b + 40 * fl); SNH.material.opacity = .35 + .3 * b; RING.material.opacity = win(t, Ln.d5.end - .4, Ln.d5.end + 1.4, .05, 1) * .8; RING.scale.setScalar(2 + 40 * ramp(t, Ln.d5.end - .4, Ln.d5.end + 1.4));
    OBS.forEach((o, i) => o.dome.rotation.y = Math.sin(t * .2 + i) * .3); OBS.forEach(o => { o.slit.position.x = 0 });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .6);
    const O = { tag: .95, title: win(t, .45, M.name - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .05, tint: 'rgba(160,90,255,.08)',
      black: 1 - ramp(t, 0, .25), white: Math.max(flashW(t, [M.name, M.gal, M.old, M.atlas, M.ia, M.mag, M.ruler, M.where]), fl * .3, win(t, Ln.d5.end - .4, Ln.d5.end + .3, .05, .25) * .5),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿LA SALÍS<br>A BUSCAR?', qs: 140, cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 2 — NÓDULOS DEL FONDO DEL MAR (llanura abisal)
if (P == 2) {
  scene.background = new THREE.Color(0x0a3448); scene.fog = new THREE.Fog(0x0e4058, 10, 70);
  hemi.color.setHex(0x9ff0ff); hemi.groundColor.setHex(0x2a4a50); hemi.intensity = 1.7; R.toneMappingExposure = 1.15;
  const top = new THREE.DirectionalLight(0xbff6ff, 1.2); top.position.set(5, 30, 10); scene.add(top);
  const GN = 90, gGeo = new THREE.PlaneGeometry(200, 200, GN, GN); gGeo.rotateX(-PI / 2); const gp = gGeo.attributes.position;
  const hY = (x, z) => Math.sin(x * .12) * .4 + Math.sin(z * .09 + x * .05) * .5;
  for (let i = 0; i < gp.count; i++) gp.setY(i, hY(gp.getX(i), gp.getZ(i))); gGeo.computeVertexNormals();
  const sandT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .18, '60,60,40') }, 30, 30);
  add(scene, gGeo, new THREE.MeshLambertMaterial({ color: 0x9a9a84, map: sandT }));
  // lumpy nodules scattered on the floor
  const nodGeo = new THREE.SphereGeometry(1, 16, 12); { const p = nodGeo.attributes.position; for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)); const k = 1 + .18 * Math.sin(v.x * 5 + v.y * 3) + .12 * Math.sin(v.z * 7 - v.y * 4); p.setXYZ(i, v.x * k, v.y * k * .75, v.z * k) } nodGeo.computeVertexNormals() }
  const nodT = tex(128, 128, (g, w, h) => { g.fillStyle = '#4a3626'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .5, '20,12,8'); blot(g, w, h, 30, .4, '120,90,60', 30) });
  const nodM = new THREE.MeshLambertMaterial({ map: nodT });
  for (let i = 0; i < 260; i++) { const x = (hash(i * 1.9) - .5) * 60, z = -hash(i * 2.7) * 55 + 8; if (Math.abs(x) < 2.5 && z > -5 && z < 3) continue; const s = .12 + hash(i * 4.3) * .22; const n = add(scene, nodGeo, nodM, x, hY(x, z) + s * .4, z, 0); n.scale.setScalar(s); n.rotation.y = hash(i) * 6 }
  // hero nodule (macro scale) with tiny glowing critters
  const HERO = add(scene, nodGeo, new THREE.MeshLambertMaterial({ map: nodT, emissive: 0x3a2a1c }), 0, hY(0, 0) + .4, 0, 0); HERO.scale.setScalar(.55);
  const CRIT = []; for (let i = 0; i < 46; i++) { const sp = glowSprite(scene, i % 3 ? 0xffe0a0 : 0x9fffe8, .11, 0, 0, 0); sp.material.opacity = 0; CRIT.push(sp) }
  // sea pens / sponges for life
  for (let i = 0; i < 18; i++) { const x = (hash(i * 7.7) - .5) * 30, z = -4 - hash(i * 8.8) * 30; const st2 = add(scene, G.cyl, mat(0xe8d8c0), x, hY(x, z) + .6, z, 0); st2.scale.set(.03, 1.2, .03); glowSprite(scene, 0xfff0d0, .5, x, hY(x, z) + 1.25, z).material.opacity = .5 }
  // marine snow
  const NS = 1600, sp = new Float32Array(NS * 3); for (let i = 0; i < NS; i++) { sp[i * 3] = (hash(i * 1.1) - .5) * 40; sp[i * 3 + 1] = hash(i * 2.2) * 14; sp[i * 3 + 2] = -hash(i * 3.3) * 40 + 10 }
  const sGeo = new THREE.BufferGeometry(); sGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3)); const SNOW = new THREE.Points(sGeo, new THREE.PointsMaterial({ size: .07, map: radT, color: 0xe8ffff, transparent: true, opacity: .8, depthWrite: false })); scene.add(SNOW);
  // ROV (original design): yellow frame + two lamps
  const ROV = grp(scene); box(ROV, 1.6, .7, 1.1, mat(0xf2c21a), 0, 0, 0, 0); box(ROV, 1.7, .12, 1.2, mat(0x2a2a2a), 0, -.42, 0, 0); box(ROV, .5, .4, .2, mat(0x1a1a1a), 0, -.05, .62, 0);
  for (const s of [-1, 1]) { box(ROV, .25, .25, .25, mat(0x3a3a3a), s * .65, .2, .55, 0); glowSprite(ROV, 0xfff4d0, 1.4, s * .65, .2, .7) }
  const lampL = new THREE.SpotLight(0xfff0d0, 0, 20, .5, .6, 1); ROV.add(lampL); lampL.position.set(0, 0, .6); const lt = new THREE.Object3D(); lt.position.set(0, -2, 4); ROV.add(lt); lampL.target = lt;
  makePanel(V(0, 4.9, -7), 0, 4.2, 0x7ff0e0, 0x30c0d0);
  function draw(t) {
    const cy = '#7ff0e0', gold = '#ffd95a';
    if (t < M.nod) { bgS(t, '#04202a', '#0a3a44', 'rgba(127,240,224,.07)'); txt('EN UNA SOLA PIEDRA', 360, 80, 46, cy); txt(fmt(245 * ss(ramp(t, .3, 3.2))), 360, 300, 230, '#fff', { glow: '#2ad0c0', blur: 44 }); txt('BICHITOS', 360, 470, 70, cy);
      for (let i = 0; i < 26; i++) { const a = i * 2.4 + t * .8, r = 250 + 30 * Math.sin(i + t * 2); sg.fillStyle = 'rgba(255,224,160,.7)'; sg.beginPath(); sg.arc(360 + Math.cos(a) * r * .9, 330 + Math.sin(a) * r * .55 + 120, 6, 0, 7); sg.fill() } }
    else if (t < M.deep) { bgS(t, '#1a120a', '#2e2010', 'rgba(255,200,140,.07)'); txt('NÓDULO', 360, 80, 70, '#fff', { glow: '#c08040' }); txt('POLIMETÁLICO', 360, 150, 44, '#ffc890');
      sg.save(); sg.translate(360, 360); sg.fillStyle = '#5a4030'; sg.beginPath(); for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * PI, r = 120 * (1 + .12 * Math.sin(a * 5) + .07 * Math.sin(a * 9)); sg.lineTo(Math.cos(a) * r, Math.sin(a) * r * .8) } sg.closePath(); sg.fill(); for (let i = 0; i < 60; i++) { sg.fillStyle = `rgba(30,18,10,${hash(i) * .6})`; sg.fillRect(-90 + hash(i * 3) * 180, -70 + hash(i * 5) * 140, 6, 6) } sg.restore();
      const k = sr(t, M.nod + 2.4, M.nod + 2.9); sg.globalAlpha = k; pill('HIERRO', 190, 520, '#8a3a2a', '#fff', 40); pill('MANGANESO', 510, 520, '#4a4a6a', '#fff', 40); sg.globalAlpha = sr(t, Ln.f1.end - 1.4, Ln.f1.end - .9); pill('DEL TAMAÑO DE UN PUÑO', 360, 640, '#c89a1a', '#1a1a2a', 40); sg.globalAlpha = 1 }
    else if (t < M.slow) { bgS(t, '#020a20', '#04203a', 'rgba(127,200,255,.06)'); txt('OCÉANO PACÍFICO', 360, 70, 46, '#9fd8ff');
      sg.fillStyle = 'rgba(255,255,255,.1)'; sg.fillRect(110, 120, 70, 560); const k = ss(ramp(t, M.deep + .6, M.deep + 2.8)); const g2 = sg.createLinearGradient(0, 120, 0, 680); g2.addColorStop(0, '#2a9adf'); g2.addColorStop(1, '#021030'); sg.fillStyle = g2; sg.fillRect(110, 120, 70, 560 * k);
      for (let i = 0; i <= 6; i++) txt(fmt(i * 1000) + ' m', 200, 120 + i * 93, 26, 'rgba(255,255,255,.7)', { a: 'left', w: 700 }); sg.fillStyle = 'rgba(255,217,90,.25)'; sg.fillRect(110, 120 + 4 * 93, 70, 2 * 93);
      txt(fmt(4000 * k), 480, 330, 90, '#fff', { glow: '#2a9adf' }); txt('a', 480, 410, 40, '#9fd8ff'); txt(fmt(6000 * k), 480, 490, 90, '#fff', { glow: '#2a9adf' }); txt('METROS', 480, 580, 46, gold) }
    else if (t < M.count) { bgS(t, '#0a1a12', '#123020', 'rgba(160,255,200,.07)'); txt('CRECEN LENTÍSIMO', 360, 80, 52, '#a8ffc8'); txt('UNOS', 360, 200, 46, '#fff'); txt('mm', 360, 300, 150, '#fff', { glow: '#2aff8a', blur: 40 });
      txt('EN', 360, 420, 40, 'rgba(255,255,255,.8)'); txt(fmt(1000000 * ss(ramp(t, M.slow + 1.4, M.slow + 3.0))), 360, 510, 90, gold, { glow: '#ffb000' }); txt('DE AÑOS', 360, 590, 46, '#fff'); stampMark('¡A VECES!', 560, 300, ramp(t, Ln.f3.end - .7, Ln.f3.end - .2), '#ff5a3a', .12, 40) }
    else if (t < M.bugs) { bgS(t, '#04202a', '#0a3a44', 'rgba(127,240,224,.07)'); txt('MARUM · ALEMANIA', 360, 70, 44, cy); const k = ss(ramp(t, M.count + 2.0, M.count + 3.2)), k2 = ss(ramp(t, M.count + 3.8, M.count + 5.6));
      txt(fmt(244 * k), 360, 200, 130, '#fff', { glow: '#2ad0c0' }); txt('NÓDULOS ABIERTOS', 360, 290, 44, cy); sg.globalAlpha = cl(k2 * 3); txt('+' + fmt(4100 * k2), 360, 450, 140, gold, { glow: '#ffb000', blur: 40 }); txt('SERES DIMINUTOS', 360, 560, 50, '#fff'); sg.globalAlpha = 1 }
    else if (t < M.diff) { bgS(t, '#04202a', '#0a3a44', 'rgba(127,240,224,.07)'); txt('¿QUIÉNES VIVEN AHÍ?', 360, 70, 46, cy);
      sg.strokeStyle = '#ffe0a0'; sg.lineWidth = 9; sg.lineCap = 'round'; sg.beginPath(); for (let x = 0; x <= 160; x += 4) { const y = Math.sin(x * .07 + t * 6) * 16; x ? sg.lineTo(130 + x, 190 + y) : sg.moveTo(130 + x, 190 + y) } sg.stroke(); txt('GUSANITOS', 210, 250, 30, '#fff');
      sg.save(); sg.translate(510, 190); sg.fillStyle = '#ffb090'; sg.beginPath(); sg.ellipse(0, 0, 60, 26, 0, 0, 7); sg.fill(); sg.strokeStyle = '#ffb090'; sg.lineWidth = 4; for (let i = -2; i <= 2; i++) { sg.beginPath(); sg.moveTo(i * 18, 18); sg.lineTo(i * 20 + Math.sin(t * 12 + i) * 5, 42); sg.stroke() } sg.beginPath(); sg.moveTo(55, -10); sg.lineTo(90, -40); sg.stroke(); sg.restore(); txt('CRUSTÁCEOS', 510, 250, 30, '#fff'); pill('< 1 mm', 360, 310, '#1a6a7a', '#fff', 36);
      const k = sr(t, M.bugs + 4.4, M.bugs + 5.0); sg.globalAlpha = k; txt('PROMEDIO', 200, 420, 34, cy); txt('17', 200, 500, 100, '#fff'); sg.globalAlpha = sr(t, M.bugs + 6.2, M.bugs + 6.8); txt('RÉCORD', 520, 420, 34, gold); txt('245', 520, 505, 110, gold, { glow: '#ffb000', blur: 40 }); sg.globalAlpha = 1;
      stampMark('¡EN UNA SOLA!', 360, 640, ramp(t, Ln.f5.end - .7, Ln.f5.end - .2), '#ff5a3a', -.06, 50) }
    else if (t < M.mine) { bgS(t, '#14102a', '#241a44', 'rgba(200,180,255,.07)'); txt('DISTINTOS A LOS', 360, 80, 44, '#d8c8ff'); txt('DEL BARRO', 360, 140, 60, '#fff');
      for (const [x, c, l] of [[200, '#5a4030', 'NÓDULO'], [520, '#7a7a64', 'BARRO']]) { sg.fillStyle = c; sg.beginPath(); sg.arc(x, 360, 110, 0, 7); sg.fill(); for (let i = 0; i < 12; i++) { sg.fillStyle = x < 360 ? '#ffe0a0' : '#9fffe8'; sg.beginPath(); sg.arc(x + Math.cos(i * 2.1 + t) * 70 * hash(i), 360 + Math.sin(i * 1.7 + t) * 70 * hash(i * 2), 7, 0, 7); sg.fill() } txt(l, x, 520, 40, '#fff') }
      txt('≠', 360, 360, 120, '#ffd95a', { glow: '#ffb000' }) }
    else { bgS(t, '#200a0a', '#3a1414', 'rgba(255,140,140,.07)'); txt('TIENEN METALES', 360, 70, 46, '#ffb0a0'); ['NÍQUEL', 'COBALTO', 'COBRE'].forEach((n, i) => { const a = sr(t, M.mine + 1.0 + i * .5, M.mine + 1.3 + i * .5); sg.globalAlpha = a; pill(n, 360, 170 + i * 95, ['#5a6a7a', '#2a4aa0', '#b0602a'][i], '#fff', 46); sg.globalAlpha = 1 });
      const k = sr(t, M.mine + 3.0, M.mine + 3.5); sg.globalAlpha = k; txt('MINERÍA', 360, 480, 60, '#fff'); sg.globalAlpha = 1; stampMark('NO VUELVE EN TIEMPOS HUMANOS', 360, 610, ramp(t, Ln.f7.end - 2.0, Ln.f7.end - 1.4), '#ffd95a', -.05, 34) }
    scanlines(.05); frameEdge('rgba(127,240,224,.6)');
  }
  const K = autoK([[0, [1.6, 1.4, 3.2], [0, .45, 0], 50], [M.title - .2, [-1.5, 1.6, 3.4], [0, .5, 0], 52], [M.title + .9, [0, 3.2, 4], [0, 4.9, -7], 60]],
    [M.nod, M.deep, M.slow, M.count, M.bugs, M.diff, M.mine],
    [[[[2.2, 1.3, 2.4], [0, .4, 0], 46], [[-2.0, 1.4, 2.6], [0, .4, 0], 46], 2.6], [[[0, 6, 6], [0, 0, -20], 64], [[0, 2.2, 3], [0, 0, -20], 60], 2.0], null, [[[2.5, 2.4, -2], [-2, 1, -12], 58], [[1, 2, 0], [-2, .6, -10], 56], 2.4], [[[1.6, 1.1, 2.0], [0, .4, 0], 44], [[-1.5, 1.2, 2.1], [0, .4, 0], 44], 2.4], null, [[[-5, 2.4, 3], [0, .3, -15], 60], [[-2, 2, 1], [2, .3, -15], 58], 2.2]],
    [[M.endcard, [3, 2.2, 4.4], [0, .4, 0], 56], [C.dur, [-3, 2.8, 5.2], [0, .4, 0], 58]]);
  frame = function (t) {
    const sp2 = SNOW.geometry.attributes.position; for (let i = 0; i < NS; i++) { let y = hash(i * 2.2) * 14 - t * (.15 + hash(i) * .2); y = ((y % 14) + 14) % 14; sp2.setY(i, y); sp2.setX(i, (hash(i * 1.1) - .5) * 40 + Math.sin(t * .5 + i) * .2) } sp2.needsUpdate = true;
    const ck = Math.max(win(t, .2, M.nod, .5, .3), win(t, M.bugs, M.diff + 1, .4, .4), sr(t, M.endcard, M.endcard + .5) * .8);
    CRIT.forEach((c, i) => { const a = hash(i) * 6.28 + t * (.2 + hash(i * 3) * .4), b = (hash(i * 5) - .5) * 2.4; const r = .68; c.position.set(Math.cos(a) * Math.cos(b) * r * 1.1, HERO.position.y + Math.sin(b) * r * .8, Math.sin(a) * Math.cos(b) * r * 1.1); c.material.opacity = ck * (.6 + .4 * Math.sin(t * 5 + i)) });
    HERO.rotation.y = t * .15; ROV.position.set(-6 + Math.sin(t * .2) * 3, 3.0 + Math.sin(t * .7) * .2, -15 + Math.cos(t * .15) * 2); ROV.rotation.y = .8 + Math.sin(t * .2) * .3; LI(lampL, 3);
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .8);
    const O = { tag: .95, title: win(t, .45, M.nod - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .05, tint: 'rgba(40,200,220,.07)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.nod, M.deep, M.slow, M.count, M.bugs, M.diff, M.mine]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS QUÉ<br>HARÍAS?', qs: 140, a: 'DEJARLOS', b: 'MINARLOS', cta: 'COMENTÁ  A  o  B', nxt: 'Seguime para más <i>océano</i>' } : null };
    overlay(t, O);
  };
}
// ==================================================================================== PART 3 — EL ROEDOR GIGANTE (bosque pantanoso de hace 34 millones de años, tarde dorada)
if (P == 3) {
  skyDome('#4a8ad8', '#ffc890', '#ffe0a8'); scene.background = new THREE.Color(0xffd0a0); scene.fog = new THREE.Fog(0xffd8a8, 25, 110);
  hemi.color.setHex(0xfff0d0); hemi.groundColor.setHex(0x4a5a2a); hemi.intensity = 1.3; R.toneMappingExposure = 1.05;
  const sun = new THREE.DirectionalLight(0xffd090, 2.4); sun.position.set(-25, 18, -30); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 100 }); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xb0c8ff, 1.4); fill.position.set(10, 8, 14); scene.add(fill);
  glowSprite(scene, 0xfff0b0, 16, -55, 22, -90); glowSprite(scene, 0xffa050, 55, -55, 22, -90).material.opacity = .45;
  const grassT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .22, '40,60,10') }, 50, 50);
  const ground = add(scene, new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: 0x6a8a3a, map: grassT })); ground.rotation.x = -PI / 2; ground.receiveShadow = true;
  for (const [x, z, w, d] of [[-9, -10, 10, 6], [10, -18, 14, 7], [3, 7, 8, 4]]) { const wtr = add(scene, new THREE.CircleGeometry(1, 32), new THREE.MeshStandardMaterial({ color: 0x4a8a9a, roughness: .15, metalness: .3 }), x, .03, z); wtr.rotation.x = -PI / 2; wtr.scale.set(w / 2, d / 2, 1) }
  // ancient forest: tall trunks with leaf fans + ferns
  const trunk = mat(0x5a4230), leaf = [mat(0x3e7a2a), mat(0x4e8a32), mat(0x2e6a2a)];
  for (let i = 0; i < 26; i++) { const a = hash(i * 2.3) * 2 * PI, r = 9 + hash(i * 4.1) * 30; const x = Math.cos(a) * r, z = Math.sin(a) * r - 8; if (z > 3 && Math.abs(x) < 9) continue; const s = .9 + hash(i * 6) * .9; const g = grp(scene); g.position.set(x, 0, z);
    const tr = add(g, G.cyl, trunk, 0, 3 * s, 0, 1); tr.scale.set(.2 * s, 6 * s, .2 * s); for (let k = 0; k < 7; k++) { const lf = add(g, new THREE.ConeGeometry(.5 * s, 3.2 * s, 5), leaf[(i + k) % 3], 0, 6 * s, 0, 1); lf.rotation.set(1.1, k * .9 + i, 0, 'YXZ'); lf.rotation.order = 'YXZ'; lf.rotation.y = k * .9 + i; lf.rotation.x = 1.15; lf.translateY(1.4 * s) } }
  for (let i = 0; i < 70; i++) { const x = (hash(i * 3.7) - .5) * 40, z = -hash(i * 5.9) * 30 + 6; if (Math.abs(x) < 3 && z > -3) continue; const f = add(scene, new THREE.ConeGeometry(.5, 1.0, 6), leaf[i % 3], x, .5, z, 1); f.scale.set(1 + hash(i), .7 + hash(i * 2) * .6, 1 + hash(i)) }
  // ---------------- giant rodent (original stylised model) + tiny modern mouse for scale
  function rodent(col, s) {
    const R0 = grp(scene); R0.scale.setScalar(s); const fM = mat(col), dk = mat(0x2a1a12), pinkM = mat(0xd89a8a);
    const body = sph(R0, 1, fM, 0, .55, 0); body.scale.set(.42, .38, .7);
    const H = grp(R0); H.position.set(0, .7, .62); const head = sph(H, 1, fM, 0, 0, .05); head.scale.set(.27, .25, .32); const sn2 = sph(H, 1, fM, 0, -.06, .32); sn2.scale.set(.15, .13, .14); sph(H, .05, dk, 0, -.02, .45, 0);
    for (const s2 of [-1, 1]) { sph(H, .045, dk, s2 * .17, .08, .22, 0); const ear = sph(H, 1, pinkM, s2 * .17, .24, -.02, 0); ear.scale.set(.1, .12, .04) }
    const inc = box(H, .1, .1, .03, mat(0xf0a030), 0, -.19, .4, 0);
    const legs = []; for (const [x, z] of [[-.25, .4], [.25, .4], [-.27, -.35], [.27, -.35]]) { const l = grp(R0); l.position.set(x, .35, z); const m = add(l, G.cyl, fM, 0, -.17, 0, 1); m.scale.set(.09, .34, .09); sph(l, .07, pinkM, 0, -.34, .05, 0); legs.push(l) }
    const tail = add(R0, new THREE.CylinderGeometry(.03, .08, 1.3, 8), mat(0x8a6a5a), 0, .35, -1.15, 1); tail.rotation.x = -1.25;
    R0.traverse(o => { if (o.isMesh) o.castShadow = true }); return { g: R0, H, legs, body };
  }
  const BIG = rodent(0x7a5634, 1.0), MINI = rodent(0x9a9a9a, .09);
  makePanel(V(0, 4.3, -6), 0, 3.9, 0xffd95a, 0xffa040);
  function animR(r, t, x, z, ry, moving) { r.g.position.set(x, 0, z); r.g.rotation.y = ry; const ph = t * 8; r.legs.forEach((l, i) => l.rotation.x = moving ? Math.sin(ph + (i % 2 ? PI : 0) + (i > 1 ? PI / 2 : 0)) * .5 : 0); r.body.position.y = .55 + (moving ? Math.abs(Math.sin(ph)) * .03 : Math.sin(t * 2) * .01); r.H.rotation.set(Math.sin(t * 1.3) * .08 + (moving ? 0 : .1), Math.sin(t * .7) * .3, 0) }
  function tooth(x, y, s, kind) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = '#f2e6c8'; sg.strokeStyle = '#8a7a5a'; sg.lineWidth = 4; sg.beginPath();
    if (kind) { sg.moveTo(-20, 80); sg.quadraticCurveTo(-40, -40, 20, -90); sg.quadraticCurveTo(30, -60, 20, 80); sg.closePath(); sg.fill(); sg.stroke(); sg.fillStyle = '#e8902a'; sg.beginPath(); sg.moveTo(-28, -10); sg.quadraticCurveTo(-30, -60, 18, -88); sg.lineTo(14, -60); sg.quadraticCurveTo(-12, -40, -16, -10); sg.fill() }
    else { sg.roundRect(-55, -45, 110, 70, 18); sg.fill(); sg.stroke(); sg.fillRect(-45, 20, 30, 60); sg.fillRect(15, 20, 30, 60); sg.strokeRect(-45, 20, 30, 60); sg.strokeRect(15, 20, 30, 60) } sg.restore() }
  function draw(t) {
    const gold = '#ffd95a', gr = '#b8ff9a';
    if (t < M.when) { bgS(t, '#2a1a08', '#4a2e10', 'rgba(255,217,90,.07)'); txt('¿UN RATÓN', 360, 110, 70, '#fff'); txt('DE 30 kg?', 360, 210, 90, gold, { glow: '#ffb000' }); const k = sr(t, .6, 1.8); bar(110, 420, 500, 46, .06, '#9a9a9a'); txt('RATÓN DE HOY', 110, 390, 30, '#fff', { a: 'left' }); bar(110, 540, 500, 46, k, gold); txt('ESTE', 110, 510, 30, '#fff', { a: 'left' }) }
    else if (t < M.name) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('HACE', 360, 80, 50, gr); txt(fmt(34 * ss(ramp(t, M.when + 1.4, M.when + 2.8))), 360, 230, 200, '#fff', { glow: '#4aff6a', blur: 40 }); txt('MILLONES DE AÑOS', 360, 370, 52, gr);
      const k = sr(t, Ln.g1.end - 1.6, Ln.g1.end - 1.0); sg.globalAlpha = k; sg.fillStyle = '#ff4a3a'; sg.beginPath(); sg.arc(360, 500, 34, PI, 0); sg.lineTo(360, 570); sg.closePath(); sg.fill(); sg.fillStyle = '#fff'; sg.beginPath(); sg.arc(360, 500, 13, 0, 7); sg.fill(); pill('SUR DE TAILANDIA', 360, 640, '#2a6a3a', '#fff', 44); sg.globalAlpha = 1 }
    else if (t < M.teeth) { bgS(t, '#2a1a08', '#4a2e10', 'rgba(255,217,90,.07)'); txt('SU NOMBRE', 360, 70, 42, '#ffc890'); txt('YAKAMYS', 360, 180, 120, '#fff', { glow: '#ff8a30', blur: 36 }); txt('sirindhornae', 360, 275, 52, gold, { w: 700 });
      const k = sr(t, Ln.g2.start + 2.8, Ln.g2.start + 3.3), k2 = sr(t, Ln.g2.start + 4.4, Ln.g2.start + 4.9); sg.globalAlpha = k; pill('YAK = GIGANTE (tailandés)', 360, 430, '#7a3a1a', '#fff', 36); sg.globalAlpha = k2; pill('MYS = RATÓN (griego)', 360, 540, '#3a4a7a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.kg) { bgS(t, '#1a1410', '#2e241a', 'rgba(242,230,200,.07)'); txt('LO QUE ENCONTRARON', 360, 70, 44, '#f2e6c8'); const k1 = sr(t, M.teeth + 2.4, M.teeth + 2.8), k2 = sr(t, M.teeth + 2.8, M.teeth + 3.2);
      if (k1 > 0) tooth(220, 300, 1.5 + .6 * (1 - k1), 0); if (k2 > 0) tooth(500, 300, 1.4 + .6 * (1 - k2), 1); txt('SOLO', 360, 510, 44, '#fff'); txt('2 DIENTES', 360, 575, 70, gold, { glow: '#ffb000' }); const k = sr(t, Ln.g3.end - 1.2, Ln.g3.end - .7); sg.globalAlpha = k; pill('MINA DE KRABI', 360, 665, '#5a3a1a', '#fff', 36); sg.globalAlpha = 1 }
    else if (t < M.double) { bgS(t, '#2a1a08', '#4a2e10', 'rgba(255,217,90,.07)'); txt('CON 7 MÉTODOS', 360, 80, 52, '#ffc890'); const k = ss(ramp(t, Ln.g4.end - 2.4, Ln.g4.end - .6));
      sg.save(); sg.translate(360, 330); sg.fillStyle = '#5a5a6a'; sg.beginPath(); sg.moveTo(-110, 90); sg.lineTo(-70, -60); sg.lineTo(70, -60); sg.lineTo(110, 90); sg.closePath(); sg.fill(); sg.strokeStyle = '#5a5a6a'; sg.lineWidth = 14; sg.beginPath(); sg.arc(0, -70, 30, PI, 0); sg.stroke(); txt(Math.round(30 * k) + ' kg', 0, 20, 70, '#fff'); sg.restore();
      stampMark('≈ APROXIMADO', 360, 590, ramp(t, Ln.g4.end - .5, Ln.g4.end), '#ff5a3a', -.06, 50) }
    else if (t < M.hist) { bgS(t, '#0a2010', '#163a1a', 'rgba(184,255,154,.07)'); txt('COMPARADO CON', 360, 80, 44, gr); txt('SU ÉPOCA', 360, 140, 60, '#fff'); const k = ss(ramp(t, M.double + .5, M.double + 1.8));
      txt('OTROS ROEDORES', 90, 270, 32, '#fff', { a: 'left' }); bar(90, 295, 540, 50, .5 * k, '#9ac0ff'); txt('YAKAMYS', 90, 420, 32, '#fff', { a: 'left' }); bar(90, 445, 540, 50, k, gold); stampMark('× 2', 360, 610, ramp(t, M.double + 1.9, M.double + 2.4), '#ff5a3a', -.1, 90) }
    else if (t < M.paper) { bgS(t, '#14102a', '#241a44', 'rgba(200,180,255,.07)'); txt('SE CREÍA QUE', 360, 70, 46, '#d8c8ff'); txt('LOS GIGANTES', 360, 130, 46, '#d8c8ff'); const k = sr(t, M.hist + 4.8, M.hist + 5.4);
      sg.globalAlpha = k; pill('APARECIERON MÁS TARDE', 360, 260, '#4a3a7a', '#fff', 38); sg.globalAlpha = sr(t, M.hist + 6.2, M.hist + 6.8); pill('SOBRE TODO EN SUDAMÉRICA', 360, 370, '#4a3a7a', '#fff', 38); sg.globalAlpha = 1;
      cross(360, 315, 120, '#ff3a3a', ramp(t, Ln.g6.end - 1.2, Ln.g6.end - .4)); const k3 = sr(t, Ln.g6.end - .9, Ln.g6.end - .3); sg.globalAlpha = k3; txt('ASIA, HACE 34 M', 360, 560, 58, gold, { glow: '#ffb000' }); sg.globalAlpha = 1 }
    else { bgS(t, '#06142a', '#0e2a4a', 'rgba(140,200,255,.07)'); txt('PUBLICADO EN', 360, 80, 44, '#9fd8ff'); txt('SCIENTIFIC', 360, 180, 84, '#fff'); txt('REPORTS', 360, 270, 84, '#fff'); pill('NOVIEMBRE 2026', 360, 380, '#1f5fb0', '#fff', 40);
      ['TAILANDIA', 'CANADÁ', 'FRANCIA'].forEach((n, i) => { const a = sr(t, M.paper + 3.0 + i * .4, M.paper + 3.3 + i * .4); sg.globalAlpha = a; pill(n, 150 + i * 210, 540, '#2a6a3a', '#fff', 30); sg.globalAlpha = 1 }) }
    scanlines(.04); frameEdge('rgba(255,217,90,.6)');
  }
  const K = autoK([[0, [1.6, .7, 3.6], [0, .7, 0], 48], [M.title - .2, [-1.4, .9, 3.4], [0, .8, 0], 50], [M.title + .9, [0, 3, 3], [0, 4.3, -6], 60]],
    [M.when, M.name, M.teeth, M.kg, M.double, M.hist, M.paper],
    [[[[4, 2.4, 6], [0, .8, 0], 56], [[3, 1.6, 4], [0, .7, 0], 52], 2.2], null, null, [[[2.6, 1.0, 2.8], [.3, .5, .4], 50], [[2.2, .8, 2.4], [.4, .45, .5], 46], 2.2], null, [[[-6, 4, 6], [0, 1, -6], 60], [[-3, 2.6, 5], [0, 1, -6], 58], 2.2], null],
    [[M.endcard, [2.6, 1.4, 4], [0, .8, 0], 52], [C.dur, [-2.6, 1.6, 4.4], [0, .8, 0], 54]]);
  frame = function (t) {
    const pX = t < M.title + 1 ? lerp(-1.6, 0, ss(ramp(t, 0, 3))) : 0, mv = t < 3 || (t > M.when && t < M.when + 2.2) || (t > M.hist && t < M.hist + 2.2);
    const wx = t > M.when && t < M.when + 2.4 ? lerp(0, .8, ss(ramp(t, M.when, M.when + 2.2))) : t >= M.when + 2.4 ? .8 : pX;
    animR(BIG, t, wx > 0 ? wx - .8 : wx, 0, PI / 2 * .3 + Math.sin(t * .3) * .2, mv); animR(MINI, t, .7, .55, -.6 + Math.sin(t * .9) * .5, Math.sin(t * 2) > .3);
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .5);
    const O = { tag: .95, title: win(t, .45, M.when - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,150,60,.07)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.when, M.name, M.teeth, M.kg, M.double, M.hist, M.paper]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿LO TENDRÍAS<br>DE MASCOTA?', qs: 125, a: 'SÍ', b: 'NO', cta: 'COMENTÁ  A  o  B', nxt: 'Seguime para más <i>ciencia</i>' } : null };
    overlay(t, O);
  };
}

run([null, frame, frame, frame]);

// Virales 19/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: el falso apagón mundial del 17/11 · p2: lluvia de estrellas Leónidas · p3: cuervos que deciden el doble de rápido
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: '¿APAGÓN<br>MUNDIAL?', ts: 150, tag: 'VIRAL<b>¿VERDAD O MENTIRA?</b>', sub: '17 DE NOVIEMBRE', spk: { n: ['#ffd95a', '', 0], q: ['#7fd8ff', '', 0] } },
  2: { title: 'LLUVIA DE<br>ESTRELLAS', ts: 150, tag: 'CIELO<b>ESTA SEMANA</b>', sub: 'LEÓNIDAS 2026', spk: { n: ['#9fe8ff', '', 0], q: ['#ffd95a', '', 0] } },
  3: { title: '¿MÁS RÁPIDO<br>QUE VOS?', ts: 140, tag: 'ANIMALES<b>CIENCIA</b>', sub: 'ESTUDIO 2026', spk: { n: ['#ffd95a', '', 0], q: ['#ff9a6a', '', 0] } },
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

// ==================================================================================== PART 1 — FALSO APAGÓN MUNDIAL (ciudad de noche)
if (P == 1) {
  skyDome('#0a0f2e', '#2a2a6a', '#7a4a8a'); starField(1500, 140, .15, 1.0);
  scene.background = new THREE.Color(0x141838); scene.fog = new THREE.Fog(0x2a2a5a, 30, 120);
  hemi.color.setHex(0x8fa0ff); hemi.groundColor.setHex(0x2a2030); hemi.intensity = 1.5; R.toneMappingExposure = 1.15;
  const moon = new THREE.DirectionalLight(0xb8c8ff, 1.4); moon.position.set(-20, 30, 10); scene.add(moon);
  glowSprite(scene, 0xeef2ff, 10, -40, 45, -90); glowSprite(scene, 0x9aa8ff, 30, -40, 45, -90).material.opacity = .35;
  const ground = add(scene, new THREE.PlaneGeometry(300, 300), mat(0x1c1e2a)); ground.rotation.x = -PI / 2;
  const roadM = mat(0x2c2e3a); const road = add(scene, new THREE.PlaneGeometry(9, 300), roadM, 0, .02, 0); road.rotation.x = -PI / 2;
  for (let i = 0; i < 40; i++) { const d = add(scene, new THREE.PlaneGeometry(.25, 2), basic(0xffe08a), 0, .03, 20 - i * 6); d.rotation.x = -PI / 2 }
  // buildings with window textures (emissive, can switch off)
  const winT = tex(128, 256, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); for (let y = 8; y < h; y += 20) for (let x = 8; x < w; x += 20) { if (Math.random() < .72) { const c = Math.random() < .8 ? `rgba(255,${200 + Math.random() * 40 | 0},${110 + Math.random() * 60 | 0},1)` : 'rgba(170,220,255,1)'; g.fillStyle = c; g.fillRect(x, y, 11, 13) } } });
  const BMS = []; const BLD = [];
  for (let side of [-1, 1]) for (let i = 0; i < 16; i++) { const w = 4 + hash(i * 3 + side) * 4, d = 4 + hash(i * 7 + side) * 3, h = 8 + hash(i * 11 + side * 3) * 22; const x = side * (8 + w / 2 + hash(i * 13) * 2), z = 14 - i * 8.5;
    const tx = winT.clone(); tx.needsUpdate = true; tx.repeat.set(w / 4, h / 8); const m = new THREE.MeshLambertMaterial({ color: [0x2a3048, 0x332a40, 0x26323c][i % 3], emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: 1 }); BMS.push(m);
    const b = box(scene, w, h, d, m, x, h / 2, z, 2); BLD.push(b); if (hash(i * 5 + side) > .6) { const a = glowSprite(scene, 0xff3040, 1.2, x, h + .6, z); a.material.opacity = .8 } }
  for (let i = 0; i < 26; i++) { const x = (hash(i * 2.1) - .5) * 120, z = -80 - hash(i * 4.4) * 30, w = 6 + hash(i) * 8, h = 10 + hash(i * 9) * 40; const tx = winT.clone(); tx.needsUpdate = true; tx.repeat.set(w / 4, h / 8);
    const m = new THREE.MeshLambertMaterial({ color: 0x232842, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .8 }); BMS.push(m); box(scene, w, h, 6, m, x, h / 2, z, 0) }
  // street lamps
  const LAMPS = []; for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const z = 12 - i * 9, x = s * 5.2; const p = add(scene, G.cyl, mat(0x3a3c48), x, 2.5, z, 0); p.scale.set(.08, 5, .08); const gl = glowSprite(scene, 0xffd890, 2.6, x - s * .4, 5, z); LAMPS.push(gl) }
  // power tower (lattice)
  const TOW = grp(scene); TOW.position.set(-4, 0, -38); const stM = mat(0x8a90a8);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = box(TOW, .25, 22, .25, stM, sx * 1.4, 11, sz * 1.4, 0); l.rotation.z = -sx * .06; l.rotation.x = sz * .06 }
  for (let y = 3; y < 22; y += 3) { box(TOW, 3.2 - y * .07, .14, .14, stM, 0, y, 1.4 - y * .03, 0); box(TOW, 3.2 - y * .07, .14, .14, stM, 0, y, -1.4 + y * .03, 0) }
  for (const y of [16, 20]) box(TOW, 9, .25, .25, stM, 0, y, 0, 0);
  const WIRES = []; for (const y of [16, 20]) for (const sx of [-4.2, 4.2]) { const c = new THREE.CatmullRomCurve3([V(-60, y - 1, -38), V(-30, y - 3, -38), V(-4 + sx, y - .2, -38), V(30, y - 3, -38), V(60, y - 1, -38)]); const m = add(scene, new THREE.TubeGeometry(c, 60, .05, 4), basic(0x50566a)) }
  const SPARK = glowSprite(scene, 0x9fd8ff, 6, -4, 20, -38); SPARK.material.opacity = 0;
  makePanel(V(0, 6.2, -12), 0, 4.4, 0xffd95a, 0xffb040);
  function power(t) { // 1 = lights on
    const a = M.rumor, f = t > a + 2 && t < M.why ? (hash(Math.floor(t * 12)) > .55 ? .15 : 1) * (t > a + 4.4 && t < M.more + 3.5 ? .25 : 1) : 1;
    return t > M.on - .2 ? 1 : f }
  function draw(t) {
    const gold = '#ffd95a';
    if (t < M.rumor) { bgS(t, '#1a1030', '#2a1440', 'rgba(255,217,90,.07)'); txt('MARTES', 360, 90, 46, gold); txt('17', 360, 260, 230, '#fff', { glow: '#ffb000', blur: 40 }); txt('NOVIEMBRE 2026', 360, 420, 52, gold);
      bolt(360, 570, 1.2 + .08 * Math.sin(t * 8), '#ffe14a') }
    else if (t < M.more) { bgS(t, '#200810', '#3a0d1a', 'rgba(255,90,90,.07)'); txt('APAGÓN MUNDIAL DE', 360, 80, 44, '#ff9a9a'); const k = ss(ramp(t, M.rumor + .3, M.rumor + 2.0));
      txt(fmt(72 * k), 260, 215, 190, '#fff', { glow: '#ff3a3a', blur: 40 }); txt('HORAS', 420, 240, 60, '#ff9a9a', { a: 'left' });
      ['LUZ', 'INTERNET', 'BANCOS'].forEach((n, i) => { const m0 = Ln.d1.start + 3.3 + i * .55; const a = sr(t, m0, m0 + .3); if (a <= 0) return; sg.globalAlpha = a; const y = 400 + i * 100; pill(n, 360, y, '#5a1a24', '#fff', 46); sg.globalAlpha = 1; cross(560, y, 26, '#ff2a3a', ramp(t, m0 + .2, m0 + .6)) }) }
    else if (t < M.why) { bgS(t, '#200810', '#3a0d1a', 'rgba(255,90,90,.07)'); txt('SEGÚN EL RUMOR', 360, 80, 44, '#ff9a9a'); const k = ss(ramp(t, M.more + .4, M.more + 1.8)), k2 = ss(ramp(t, M.more + 2.2, M.more + 3.4));
      txt(fmt(33 * k), 360, 220, 160, '#fff', { glow: '#ff3a3a', blur: 36 }); txt('PAÍSES', 360, 330, 52, '#ff9a9a'); sg.globalAlpha = cl(k2 * 3); txt(fmt(90 * k2), 360, 480, 160, '#fff', { glow: '#ff3a3a', blur: 36 }); txt('DÍAS A OSCURAS', 360, 590, 52, '#ff9a9a'); sg.globalAlpha = 1;
      stampMark('¿EN SERIO?', 360, 400, ramp(t, Ln.d2.end - .9, Ln.d2.end - .3), '#ffd95a', -.16, 70) }
    else if (t < M.eas) { bgS(t, '#0a1a30', '#0e2a4a', 'rgba(120,200,255,.07)'); txt('¿DE DÓNDE SALIÓ?', 360, 90, 54, '#9fd8ff'); const k = sr(t, M.why + 1.4, M.why + 2.0);
      txt('3', 360, 330, 300 * (.7 + .3 * k), '#fff', { glow: '#2fa8ff', blur: 50 }); txt('COSAS REALES', 360, 560, 64, '#9fd8ff'); txt('MEZCLADAS', 360, 640, 44, 'rgba(255,255,255,.8)') }
    else if (t < M.kit) { bgS(t, '#0a1a30', '#0e2a4a', 'rgba(120,200,255,.07)'); txt('1', 90, 90, 110, gold, { glow: '#ffb000' }); txt('PRUEBA DE ALERTAS', 400, 70, 42, '#fff'); txt('EN EE.UU.', 400, 125, 42, '#9fd8ff');
      sg.save(); sg.translate(360, 340); for (let i = 0; i < 3; i++) { const r = 60 + i * 50 + ((t * 60) % 50); sg.strokeStyle = `rgba(255,217,90,${.8 - i * .25})`; sg.lineWidth = 8; sg.beginPath(); sg.arc(0, 0, r, -.7, .7); sg.stroke(); sg.beginPath(); sg.arc(0, 0, r, PI - .7, PI + .7); sg.stroke() }
      sg.fillStyle = '#fff'; sg.fillRect(-30, -50, 60, 100); sg.fillStyle = '#0e2a4a'; sg.beginPath(); sg.arc(0, -15, 16, 0, 7); sg.fill(); sg.restore();
      const k = sr(t, Ln.d4.end - 2.6, Ln.d4.end - 2.0); sg.globalAlpha = k; pill('SOLO RADIO Y TV', 360, 560, '#1f6fc0', '#fff', 50); txt('17 / 11 / 2026', 360, 660, 40, 'rgba(255,255,255,.75)'); sg.globalAlpha = 1 }
    else if (t < M.tv) { bgS(t, '#0a2418', '#0e3a24', 'rgba(140,255,180,.07)'); txt('2', 90, 90, 110, gold, { glow: '#ffb000' }); txt('COMISIÓN', 400, 70, 42, '#fff'); txt('EUROPEA', 400, 125, 42, '#a8ffc8');
      const k = sr(t, M.kit + 1.6, M.kit + 2.2); sg.save(); sg.translate(360, 340); sg.scale(.8 + .2 * k, .8 + .2 * k); sg.fillStyle = '#e8483a'; sg.beginPath(); sg.roundRect(-150, -100, 300, 200, 24); sg.fill(); sg.fillStyle = '#b8261c'; sg.fillRect(-50, -130, 100, 40);
      sg.fillStyle = '#fff'; sg.fillRect(-20, -60, 40, 120); sg.fillRect(-60, -20, 120, 40); sg.restore(); txt('KIT PARA', 360, 540, 50, '#a8ffc8'); txt(fmt(72 * ss(ramp(t, Ln.d5.end - 3.0, Ln.d5.end - 2.0))) + ' HORAS', 360, 625, 76, '#fff', { glow: '#2aff8a' }) }
    else if (t < M.noaa) { bgS(t, '#24180a', '#3a2a0e', 'rgba(255,220,140,.07)'); txt('3', 90, 90, 110, gold, { glow: '#ffb000' }); txt('UNA ESCENA', 400, 70, 42, '#fff'); txt('DE TELEVISIÓN', 400, 125, 42, '#ffe0a0');
      sg.save(); sg.translate(360, 350); sg.fillStyle = '#2a2a2a'; sg.beginPath(); sg.roundRect(-190, -130, 380, 260, 26); sg.fill(); const on = Math.sin(t * 30) > 0 ? 1 : .8; sg.fillStyle = `rgba(${140 * on | 0},${160 * on | 0},${200 * on | 0},1)`; sg.fillRect(-160, -100, 320, 200);
      for (let i = 0; i < 400; i++) { sg.fillStyle = `rgba(255,255,255,${hash(i + Math.floor(t * 20) * 7) * .5})`; sg.fillRect(-160 + hash(i * 3 + Math.floor(t * 20)) * 316, -100 + hash(i * 5 + Math.floor(t * 20)) * 196, 4, 4) }
      sg.fillStyle = '#1a1a1a'; sg.beginPath(); sg.roundRect(-150, -40, 300, 80, 14); sg.fill(); txt('17 DE NOVIEMBRE', 0, 2, 40, '#ffd95a'); sg.restore();
      stampMark('SIN AÑO', 360, 610, ramp(t, Ln.d6.end - .7, Ln.d6.end - .1), '#ff3a3a', -.1, 70) }
    else if (t < M.on) { bgS(t, '#0a1028', '#1a1a44', 'rgba(140,170,255,.07)'); txt('NOAA', 360, 90, 80, '#fff', { glow: '#6a8aff' }); txt('CLIMA ESPACIAL · EE.UU.', 360, 160, 36, '#a8b8ff');
      sg.save(); sg.translate(360, 360); sg.fillStyle = '#ffb020'; sg.shadowColor = '#ff9a00'; sg.shadowBlur = 50; sg.beginPath(); sg.arc(0, 0, 90, 0, 7); sg.fill(); sg.shadowBlur = 0; sg.strokeStyle = '#ffcf40'; sg.lineWidth = 8;
      for (let i = 0; i < 12; i++) { const a = i * PI / 6 + t * .3; sg.beginPath(); sg.moveTo(Math.cos(a) * 110, Math.sin(a) * 110); sg.lineTo(Math.cos(a) * 140, Math.sin(a) * 140); sg.stroke() } sg.restore();
      const k = sr(t, Ln.d7.end - 3.4, Ln.d7.end - 2.6); sg.globalAlpha = k; txt('PRONÓSTICOS DE', 360, 560, 44, '#fff'); txt('COLAPSO GLOBAL: 0', 360, 630, 56, '#ffd95a', { glow: '#ffb000' }); sg.globalAlpha = 1 }
    else { bgS(t, '#101a10', '#1a3a1a', 'rgba(170,255,140,.07)'); txt('APAGÓN MUNDIAL', 360, 120, 64, '#fff'); txt('17 / 11 / 2026', 360, 200, 44, 'rgba(255,255,255,.75)');
      bolt(360, 380, 1.4, '#ffe14a'); stampMark('FALSO', 360, 400, ramp(t, M.on + .3, M.on + .9), '#ff2a3a', -.18, 130); const k = sr(t, Ln.d8.end - 1.6, Ln.d8.end - 1.0); sg.globalAlpha = k; pill('SEGUIMOS CON LUZ', 360, 620, '#2a9a3a', '#fff', 50); sg.globalAlpha = 1 }
    scanlines(.06); frameEdge('rgba(255,217,90,.6)');
  }
  const K = path([[0, [7, 3, 18], [0, 6, -12], 60], [M.title - .2, [3, 4, 10], [0, 6.2, -12], 56], [M.title + .9, [-3, 5.6, 6], [0, 6.2, -12], 56],
    pv(M.rumor - .3, 2.0, .6, 60), pv(M.rumor + .05, 1.75, 0, 60), pv(M.more - .3, 1.68, 0, 60), [M.more + .05, [6, 14, 14], [0, 3, -20], 62], [M.more + 2.0, [-6, 12, 10], [0, 3, -20], 60],
    pv(M.more + 2.2, 1.85, -.3, 60), pv(M.why - .3, 1.72, 0, 60), pv(M.why + .05, 1.9, .5, 60), pv(M.eas - .3, 1.72, 0, 60), pv(M.eas + .05, 1.85, -.3, 60), pv(M.kit - .3, 1.72, .2, 60), pv(M.kit + .05, 1.85, -.2, 60), pv(M.tv - .3, 1.72, 0, 60), pv(M.tv + .05, 1.85, .3, 60), pv(M.noaa - .3, 1.72, 0, 60),
    [M.noaa + .05, [8, 2.4, 6], [0, 8, -30], 62], [M.noaa + 2.6, [4, 2.2, 0], [-2, 10, -30], 60], pv(M.noaa + 2.8, 1.85, 0, 60), pv(M.on - .3, 1.72, 0, 60),
    pv(M.on + .05, 1.8, 0, 60), pv(M.on + 1.8, 1.7, 0, 60), [M.on + 3.4, [9, 12, 16], [0, 4, -24], 60], [M.endcard, [0, 16, 22], [0, 4, -28], 60], [C.dur, [-8, 20, 28], [0, 4, -30], 62]]);
  frame = function (t) {
    const pw = power(t); BMS.forEach((m, i) => m.emissiveIntensity = pw * (.8 + .2 * hash(i))); LAMPS.forEach(l => l.material.opacity = pw);
    hemi.intensity = .9 + .6 * pw; SPARK.material.opacity = win(t, M.why + .3, M.eas - .2, .3, .4) * (.6 + .4 * Math.sin(t * 25));
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .7);
    const O = { tag: .95, title: win(t, .45, M.rumor - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .05, tint: pw < .5 ? 'rgba(255,40,60,.10)' : 'rgba(120,110,255,.08)',
      black: 1 - ramp(t, 0, .3), white: Math.max(flashW(t, [M.rumor, M.more, M.why, M.eas, M.kit, M.tv, M.noaa]), win(t, M.on - .05, M.on + .6, .05, .5) * .55),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿TE LO<br>CREÍSTE?', qs: 150, cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>virales</i>' } : null };
    overlay(t, O);
  };
}

// ==================================================================================== PART 2 — LEÓNIDAS (campo de noche)
if (P == 2) {
  skyDome('#060a24', '#1a2a5a', '#3a5a8a'); const STARS = starField(3200, 140, .02, 1.15, .35);
  scene.background = new THREE.Color(0x0c1430); scene.fog = new THREE.Fog(0x1c2c50, 40, 160);
  hemi.color.setHex(0x8ab0ff); hemi.groundColor.setHex(0x1a2a1a); hemi.intensity = 1.4; R.toneMappingExposure = 1.2;
  const moonL = new THREE.DirectionalLight(0xc0d0ff, 1.0); moonL.position.set(30, 25, -10); scene.add(moonL);
  // hills
  const GN = 120, gGeo = new THREE.PlaneGeometry(260, 260, GN, GN); gGeo.rotateX(-PI / 2); const gp = gGeo.attributes.position;
  for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i); gp.setY(i, Math.sin(x * .05) * 2.2 + Math.sin(z * .07 + x * .02) * 1.8 + Math.max(0, -z - 40) * .06 * (1 + Math.sin(x * .03))) }
  gGeo.computeVertexNormals(); const grassT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 1500, .25, '20,50,20') }, 40, 40);
  add(scene, gGeo, new THREE.MeshLambertMaterial({ color: 0x2a4a34, map: grassT }));
  const hY = (x, z) => Math.sin(x * .05) * 2.2 + Math.sin(z * .07 + x * .02) * 1.8 + Math.max(0, -z - 40) * .06 * (1 + Math.sin(x * .03));
  // tree, fence, little house with warm window
  const trunk = mat(0x2a1e16), leaf = mat(0x1e3a26);
  for (const [x, z, s] of [[-7, -4, 1.2], [-10, -10, 1.6], [9, -14, 1.4], [14, -6, 1.0], [-16, -20, 2]]) { const g = grp(scene); g.position.set(x, hY(x, z), z); const tr = add(g, G.cyl, trunk, 0, 1.5 * s, 0, 0); tr.scale.set(.18 * s, 3 * s, .18 * s); const c = sph(g, 1.6 * s, leaf, 0, 3.6 * s, 0, 0); c.scale.set(1.6 * s, 1.3 * s, 1.6 * s) }
  for (let i = 0; i < 14; i++) { const x = -12 + i * 1.8, z = 2.5; const p = box(scene, .12, 1.1, .12, mat(0x5a4636), x, hY(x, z) + .55, z, 0) } for (const y of [.5, .9]) box(scene, 24, .08, .06, mat(0x5a4636), -.3, hY(0, 2.5) + y, 2.5, 0);
  const H = grp(scene); H.position.set(6, hY(6, -8), -8); box(H, 4, 2.6, 3, mat(0xd8d0c0), 0, 1.3, 0, 0); const roof = add(H, new THREE.ConeGeometry(3.1, 1.6, 4), mat(0x8a3a2a), 0, 3.4, 0, 0); roof.rotation.y = PI / 4;
  box(H, .8, .7, .05, basic(0xffc860), -.9, 1.5, 1.53, 0); glowSprite(H, 0xffb040, 2.5, -.9, 1.5, 1.7).material.opacity = .6;
  // milky-way glow + moon
  for (let i = 0; i < 9; i++) { const a = i / 8; const sp = glowSprite(scene, 0x8aa0ff, 40, lerp(-110, 110, a), 70 + Math.sin(a * PI) * 50, -90 + a * 20); sp.material.opacity = .12 }
  glowSprite(scene, 0xf4f6ff, 7, 60, 50, -70); glowSprite(scene, 0xa0b0ff, 20, 60, 50, -70).material.opacity = .3;
  // meteors: radiant in the east (+x)
  const mT = tex(256, 16, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(160,220,255,0)'); gr.addColorStop(.75, 'rgba(200,240,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,1)'); g.fillStyle = gr; g.fillRect(0, 3, w, h - 6) });
  mT.wrapS = mT.wrapT = THREE.ClampToEdgeWrapping; const MET = []; const RAD = V(70, 70, -40);
  for (let i = 0; i < 140; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: mT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide })); scene.add(m); m.visible = false; const head = glowSprite(scene, 0xe8f6ff, 2.2, 0, 0, 0); MET.push({ m, head, s: i }) }
  // comet (for the explanation)
  const COM = grp(scene); const cHead = glowSprite(COM, 0xcff0ff, 6, 0, 0, 0); const cTail = []; for (let i = 1; i < 14; i++) { const s = glowSprite(COM, 0x9fd0ff, 6 + i * .7, -i * 1.6, i * .3, 0); s.material.opacity = .5 * (1 - i / 14); cTail.push(s) }
  COM.position.set(-30, 45, -80);
  const DUST = []; for (let i = 0; i < 80; i++) { const d = glowSprite(scene, 0xbfe6ff, .5, 0, 0, 0); d.material.opacity = 0; DUST.push(d) }
  makePanel(V(-2.5, 6.8, -10), .12, 4.2, 0x8fe0ff, 0x4aa0ff);
  function spawnRate(t) { if (t < M.when) return 7; if (t < M.storm + 4.3) return 1.8; if (t < M.future) return lerp(1.5, 45, sr(t, M.storm + 4.3, M.storm + 4.9)) * (1 - sr(t, M.future - 1.2, M.future)) + 1.5; return 2.0 }
  function meteors(t) {
    // deterministic schedule: meteor i fires at times based on hash, dense in storm
    const dur = .7; MET.forEach(o => { o.m.visible = false; o.head.visible = false });
    let used = 0; const slot = .16;
    for (let k = Math.floor((t - dur) / slot); k <= Math.floor(t / slot); k++) { const t0 = k * slot; const r = spawnRate(t0); const nn = Math.floor(r * slot + hash(k * 1.37)); for (let j0 = 0; j0 < nn; j0++) { if (used >= MET.length) break; const o = MET[used++]; const kk = k + j0 * .173;
      const p = (t - t0 - hash(kk * 2.9) * .1) / dur; if (p < 0 || p > 1) { used--; continue }
      const az = (hash(kk * 3.1) - .5) * 2.4, el = (hash(kk * 5.7) - .5) * 1.2; const start = RAD.clone().add(V(-20 - hash(kk) * 40, el * 30, az * 40)); const dir = start.clone().sub(RAD).normalize();
      const len = 14 + hash(kk * 7.7) * 16, head = start.clone().addScaledVector(dir, len * ss(p)); const tail = head.clone().addScaledVector(dir, -len * .6 * Math.min(1, p * 3));
      const mid = head.clone().add(tail).multiplyScalar(.5); o.m.position.copy(mid); o.m.lookAt(cam.position); const sc = head.distanceTo(tail);
      const v = head.clone().sub(tail); const vc = v.clone().project(cam), oc = V(0, 0, 0).project(cam); // orient in screen space
      const hp = head.clone().project(cam), tp = tail.clone().project(cam); o.m.rotation.z = 0; o.m.quaternion.copy(cam.quaternion); o.m.rotateZ(Math.atan2((hp.y - tp.y) * 16, (hp.x - tp.x) * 9));
      o.m.scale.set(Math.max(.01, sc), .5, 1); o.m.material.opacity = Math.sin(p * PI); o.m.visible = true; o.head.visible = true; o.head.position.copy(head); o.head.material.opacity = Math.sin(p * PI) * .9 } }
  }
  function draw(t) {
    const cy = '#9fe8ff';
    if (t < M.when) { bgS(t, '#060a24', '#10204a', 'rgba(160,220,255,.07)'); txt('VELOCIDAD', 360, 90, 50, cy); txt('71', 360, 280, 240, '#fff', { glow: '#4ab0ff', blur: 44 }); txt('km POR SEGUNDO', 360, 450, 54, cy);
      sg.strokeStyle = '#fff'; sg.lineWidth = 6; const x = ((t * 500) % 900) - 100; sg.beginPath(); sg.moveTo(x - 200, 640); sg.lineTo(x, 560); sg.stroke(); sg.fillStyle = '#fff'; sg.beginPath(); sg.arc(x, 560, 10, 0, 7); sg.fill() }
    else if (t < M.comet) { bgS(t, '#060a24', '#10204a', 'rgba(160,220,255,.07)'); txt('LEÓNIDAS 2026', 360, 80, 54, cy); sg.fillStyle = 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(60, 150, 600, 330, 24); sg.fill();
      const days = [6, 10, 14, 17, 18, 22, 26, 30]; days.forEach((d, i) => { const x = 105 + i * 73, pk = d == 17 || d == 18, a = sr(t, M.when + .5 + i * .12, M.when + .8 + i * .12); sg.globalAlpha = a; if (pk) { sg.fillStyle = '#ffd95a'; sg.beginPath(); sg.arc(x, 300, 34, 0, 7); sg.fill() } txt(String(d), x, 302, 40, pk ? '#1a1a2a' : '#fff'); sg.globalAlpha = 1 });
      txt('NOV', 360, 210, 40, 'rgba(255,255,255,.7)'); txt('ACTIVAS: 6 → 30', 360, 410, 44, '#fff'); const k = sr(t, M.when + 2.2, M.when + 2.8); sg.globalAlpha = k; pill('PICO: NOCHE DEL 17 AL 18', 360, 580, '#c89a1a', '#1a1a2a', 44); sg.globalAlpha = 1 }
    else if (t < M.speed) { bgS(t, '#0a0620', '#1a1040', 'rgba(200,180,255,.07)'); txt('NO SON ESTRELLAS', 360, 80, 52, '#ffd95a'); txt('POLVO DE UN COMETA', 360, 140, 40, '#fff');
      sg.save(); sg.translate(360, 380); sg.strokeStyle = 'rgba(160,220,255,.6)'; sg.lineWidth = 4; sg.beginPath(); sg.ellipse(40, 0, 280, 120, 0, 0, 7); sg.stroke(); sg.fillStyle = '#ffcc40'; sg.shadowColor = '#ffaa00'; sg.shadowBlur = 30; sg.beginPath(); sg.arc(-200, 0, 28, 0, 7); sg.fill(); sg.shadowBlur = 0;
      const a = t * .8; const cx = 40 + Math.cos(a) * 280, cyy = Math.sin(a) * 120; for (let i = 0; i < 40; i++) { const b = a - i * .02; sg.fillStyle = `rgba(200,240,255,${.8 - i / 50})`; sg.beginPath(); sg.arc(40 + Math.cos(b) * 280, Math.sin(b) * 120, 6 - i * .12, 0, 7); sg.fill() } sg.restore();
      txt('55P/TEMPEL-TUTTLE', 360, 570, 46, cy, { glow: '#4ab0ff' }); const k = sr(t, Ln.e2.end - 2.2, Ln.e2.end - 1.6); sg.globalAlpha = k; pill('VUELVE CADA 33 AÑOS', 360, 655, '#3a2a8a', '#fff', 40); sg.globalAlpha = 1 }
    else if (t < M.rate) { bgS(t, '#200a06', '#401a0a', 'rgba(255,180,120,.07)'); txt('ENTRA AL AIRE A', 360, 80, 48, '#ffc890'); const k = ss(ramp(t, M.speed + 2.4, M.speed + 4.4));
      txt(fmt(71 * k), 290, 250, 200, '#fff', { glow: '#ff7a30', blur: 44 }); txt('km/s', 480, 280, 64, '#ffc890', { a: 'left' }); const k2 = sr(t, M.speed + 4.6, M.speed + 5.2); sg.globalAlpha = k2; txt('= ' + fmt(255600 * ss(ramp(t, M.speed + 4.6, M.speed + 5.8))) + ' km/h', 360, 420, 66, '#fff'); sg.globalAlpha = 1;
      const k3 = sr(t, Ln.e3.end - 2.0, Ln.e3.end - 1.4); sg.globalAlpha = k3; pill('SE CALIENTA Y BRILLA', 360, 580, '#c0401a', '#fff', 48); sg.globalAlpha = 1 }
    else if (t < M.storm) { bgS(t, '#060a24', '#10204a', 'rgba(160,220,255,.07)'); txt('ESTE AÑO', 360, 90, 56, cy); txt('≈ ' + Math.round(15 * ss(ramp(t, M.rate + .5, M.rate + 1.8))), 360, 290, 220, '#fff', { glow: '#4ab0ff', blur: 44 }); txt('POR HORA', 360, 460, 64, cy); txt('CON CIELO BIEN OSCURO', 360, 600, 40, 'rgba(255,255,255,.75)') }
    else if (t < M.future) { bgS(t, '#1a0a30', '#300e50', 'rgba(220,160,255,.07)'); const k = sr(t, M.storm + .5, M.storm + 1.2); txt('TORMENTA DE', 360, 80, 48, '#e6b0ff'); txt('1966', 360, 210, 170 * (.8 + .2 * k), '#fff', { glow: '#c060ff', blur: 44 });
      const k2 = sr(t, M.storm + 3.1, M.storm + 3.5); sg.globalAlpha = k2; txt('40 – 50', 360, 400, 110, '#ffd95a', { glow: '#ffb000' }); txt('POR SEGUNDO', 360, 490, 54, '#fff'); sg.globalAlpha = sr(t, M.storm + 3.7, M.storm + 4.1); pill('DURANTE ≈ 15 MINUTOS', 360, 610, '#6a2aa0', '#fff', 42); sg.globalAlpha = 1 }
    else if (t < M.tip) { bgS(t, '#060a24', '#10204a', 'rgba(160,220,255,.07)'); txt('¿LA PRÓXIMA?', 360, 100, 60, cy); const k = sr(t, Ln.e6.start + 2.4, Ln.e6.start + 3.0); txt('2033', 360, 320, 210 * (.8 + .2 * k), '#fff', { glow: '#4ab0ff', blur: 44 }); stampMark('POSIBLE', 360, 540, ramp(t, Ln.e6.end - 1.2, Ln.e6.end - .6), '#ffd95a', -.1, 70) }
    else { bgS(t, '#06180e', '#0e2a1a', 'rgba(160,255,200,.07)'); txt('DESDE URUGUAY', 360, 80, 54, '#a8ffcc');
      sg.save(); sg.translate(360, 330); sg.strokeStyle = 'rgba(255,255,255,.6)'; sg.lineWidth = 5; sg.beginPath(); sg.arc(0, 0, 150, 0, 7); sg.stroke(); txt('N', 0, -120, 40, '#fff'); txt('S', 0, 122, 40, '#fff'); txt('O', -120, 2, 40, '#fff'); txt('E', 120, 2, 52, '#ffd95a');
      const a = lerp(-PI / 2 - .6, 0, ss(ramp(t, M.tip + 2.0, M.tip + 3.4))); sg.rotate(a); sg.fillStyle = '#ffd95a'; sg.beginPath(); sg.moveTo(100, 0); sg.lineTo(-20, -22); sg.lineTo(-20, 22); sg.fill(); sg.restore();
      const k = sr(t, Ln.e7.end - 2.6, Ln.e7.end - 2.0); sg.globalAlpha = k; txt('1 – 2 HORAS ANTES', 360, 560, 50, '#fff'); txt('DEL AMANECER', 360, 630, 50, '#ffd95a'); sg.globalAlpha = 1 }
    scanlines(.06); frameEdge('rgba(143,224,255,.6)');
  }
  const K = path([[0, [-2, 2.2, 14], [20, 22, -40], 70], [M.title - .2, [-1, 2.4, 12], [16, 20, -40], 68], [M.title + .9, [0, 3.2, 8], [-2.5, 6.5, -10], 60],
    pv(M.when - .3, 2.0, .6, 60), pv(M.when + .05, 1.75, 0, 60), pv(M.comet - .3, 1.68, 0, 60), [M.comet + .05, [-3, 3, 6], [-30, 42, -80], 64], [M.comet + 2.4, [-2, 3, 5], [-24, 40, -80], 62],
    pv(M.comet + 2.6, 1.85, -.3, 60), pv(M.speed - .3, 1.72, 0, 60), [M.speed + .05, [4, 2.6, 6], [40, 30, -40], 68], [M.speed + 2.2, [3, 2.4, 4], [40, 34, -40], 66],
    pv(M.speed + 2.4, 1.85, 0, 60), pv(M.rate - .3, 1.72, 0, 60), pv(M.rate + .05, 1.85, .3, 60), pv(M.storm - .3, 1.72, 0, 60), pv(M.storm + .05, 1.85, 0, 60), pv(M.storm + 4.4, 1.75, 0, 60),
    [M.storm + 4.8, [-4, 2.4, 10], [30, 30, -40], 72], [M.future - .4, [-2, 2.2, 8], [30, 34, -40], 70], pv(M.future - .1, 1.85, 0, 60), pv(M.tip - .3, 1.72, 0, 60),
    pv(M.tip + .05, 1.85, 0, 60), pv(Ln.e7.end - .2, 1.72, 0, 60), [M.endcard, [-1, 2.5, 12], [30, 26, -40], 70], [C.dur, [0, 2.2, 14], [36, 30, -40], 72]]);
  frame = function (t) {
    STARS.rotation.y = t * .004;
    const ck = win(t, M.comet - .3, M.speed + .5, .5, .6); COM.visible = ck > .01; COM.position.set(-30 + (t - M.comet) * 1.6, 45, -80); COM.children.forEach(c => c.material.opacity = (c === cHead ? 1 : c.material.opacity) * 1); COM.scale.setScalar(ck + .001);
    DUST.forEach((d, i) => { const k = win(t, M.speed - .2, M.rate, .6, .6); d.material.opacity = k * .7; d.position.set(20 + hash(i) * 50 - 25 + (t * 3 % 10), 20 + hash(i * 3) * 40, -60 + hash(i * 7) * 30) });
    setCam(evalPath(K, t), t, .6); cam.updateMatrixWorld(); meteors(t);
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    const O = { tag: .95, title: win(t, .45, M.when - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .05, tint: 'rgba(90,140,255,.08)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.when, M.comet, M.speed, M.rate, M.storm, M.future, M.tip]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿VISTE UNA<br>ALGUNA VEZ?', qs: 135, cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>cielo</i>' } : null };
    overlay(t, O);
  };
}


// ==================================================================================== PART 3 — CUERVOS ULTRARRÁPIDOS (parque al atardecer)
if (P == 3) {
  skyDome('#3a5aa8', '#ff9a6a', '#ffd08a'); scene.background = new THREE.Color(0xffb88a); scene.fog = new THREE.Fog(0xffb890, 30, 120);
  hemi.color.setHex(0xffe0c0); hemi.groundColor.setHex(0x5a4a3a); hemi.intensity = 1.2; R.toneMappingExposure = 1.0;
  const sun = new THREE.DirectionalLight(0xffc890, 2.4); sun.position.set(-30, 12, -40); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 120 }); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xa0b8ff, 1.7); fill.position.set(10, 8, 12); scene.add(fill);
  glowSprite(scene, 0xffe6a0, 18, -60, 18, -100); glowSprite(scene, 0xff9a50, 60, -60, 18, -100).material.opacity = .45;
  const grassT = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .2, '40,80,20') }, 50, 50);
  const ground = add(scene, new THREE.PlaneGeometry(300, 300), new THREE.MeshLambertMaterial({ color: 0x7aa04a, map: grassT })); ground.rotation.x = -PI / 2; ground.receiveShadow = true;
  const trunk = mat(0x5a3e2a), leafs = [mat(0x4a7a3a), mat(0x5a8a3a), mat(0x3e6a34)];
  for (let i = 0; i < 22; i++) { const a = hash(i * 2.3) * 2 * PI, r = 14 + hash(i * 4.1) * 30; const x = Math.cos(a) * r, z = Math.sin(a) * r - 10; if (z > 4 && Math.abs(x) < 10) continue; const s = .8 + hash(i * 6) * .9; const g = grp(scene); g.position.set(x, 0, z);
    const tr = add(g, G.cyl, trunk, 0, 1.8 * s, 0, 1); tr.scale.set(.25 * s, 3.6 * s, .25 * s); for (let k = 0; k < 3; k++) { const c = sph(g, 1, leafs[(i + k) % 3], (hash(i + k) - .5) * 1.6 * s, 4.2 * s + k * .6 * s, (hash(i * 3 + k) - .5) * 1.6 * s, 1); c.scale.setScalar((1.6 - k * .3) * s) } }
  // perch: wooden stand + table
  const wood = mat(0x8a5a36); box(scene, 3.6, .14, 1.6, wood, 0, 1.0, 0, 3); for (const sx of [-1.6, 1.6]) for (const sz of [-.65, .65]) box(scene, .12, 1.0, .12, wood, sx, .5, sz, 1);
  const perch = add(scene, G.cyl, mat(0x6a4428), 0, 1.38, .1, 1); perch.scale.set(.06, 2.6, .06); perch.rotation.z = PI / 2;
  // ---------------- crow (original stylised model)
  const CROW = grp(scene); CROW.position.set(0, 1.44, .1); const fM = new THREE.MeshStandardMaterial({ color: 0x2c3242, roughness: .4, metalness: .15, emissive: 0x0c0f18 });
  const body = sph(CROW, 1, fM, 0, .32, 0); body.scale.set(.2, .26, .32); body.rotation.x = -.5;
  const NECK = grp(CROW); NECK.position.set(0, .5, -.14); const head = sph(NECK, 1, fM, 0, .1, -.04); head.scale.set(.13, .13, .15);
  const beakM = new THREE.MeshStandardMaterial({ color: 0x22242a, roughness: .35, metalness: .3 }); const beak = add(NECK, new THREE.ConeGeometry(.05, .2, 10), beakM, 0, .07, -.24); beak.rotation.x = -PI / 2;
  for (const s of [-1, 1]) { sph(NECK, .022, basic(0x2a1a10), s * .085, .14, -.1, 0); sph(NECK, .008, basic(0xffffff), s * .093, .15, -.11, 0) }
  const WINGS = []; for (const s of [-1, 1]) { const w = sph(CROW, 1, fM, s * .17, .34, .06); w.scale.set(.06, .2, .34); w.rotation.set(-.5, 0, s * .12); WINGS.push(w) }
  const tail = box(CROW, .18, .03, .4, fM, 0, .16, .42, 1); tail.rotation.x = .5;
  for (const s of [-1, 1]) { const l = add(CROW, G.cyl, mat(0x22242a), s * .07, .02, 0, 1); l.scale.set(.018, .12, .018) }
  CROW.traverse(o => { if (o.isMesh) o.castShadow = true }); CROW.rotation.y = 0;
  // touchscreen (data panel) in front of the crow
  makePanel(V(0, 2.95, -1.7), 0, 1.6, 0xffffff, 0xffd0a0);
  const DOTS = []; for (let i = 0; i < 70; i++) DOTS.push([hash(i * 1.7), hash(i * 3.1), hash(i * 5.3) < .75 ? 1 : -1]);
  function dots(t, dir = 1, coh = .75) { sg.fillStyle = '#0c0f14'; sg.fillRect(0, 0, 720, 720); for (let i = 0; i < DOTS.length; i++) { const [x0, y0, d] = DOTS[i]; const dd = hash(i * 9.1) < coh ? dir : -dir; const x = ((x0 * 720 + dd * t * 140) % 720 + 720) % 720; sg.fillStyle = '#fff'; sg.beginPath(); sg.arc(x, 100 + y0 * 520, 9, 0, 7); sg.fill() } }
  let peck = 0;
  function draw(t) {
    const gold = '#ffd95a';
    if (t < M.lab) { bgS(t, '#2a1408', '#4a2410', 'rgba(255,200,120,.07)'); txt('DECIDE EN', 360, 90, 52, '#ffc890'); txt('LA MITAD', 360, 230, 130, '#fff', { glow: '#ff8a30', blur: 40 }); txt('DE TIEMPO', 360, 350, 70, '#ffc890'); bar(110, 470, 500, 46, .5, '#ffd95a'); txt('CUERVO', 110, 440, 30, '#fff', { a: 'left' }); bar(110, 580, 500, 46, 1, '#7ab0ff'); txt('HUMANO', 110, 550, 30, '#fff', { a: 'left' }) }
    else if (t < M.task) { bgS(t, '#0a1a2a', '#10304a', 'rgba(140,200,255,.07)'); txt('UNIVERSIDAD', 360, 90, 52, '#9fd8ff'); txt('DE TUBINGA', 360, 160, 60, '#fff'); pill('ALEMANIA', 360, 260, '#2a5a8a', '#fff', 40);
      const k = sr(t, M.lab + 2.6, M.lab + 3.2); sg.globalAlpha = k; txt('2', 230, 470, 200, gold, { glow: '#ffb000', blur: 40 }); txt('CUERVOS', 450, 470, 60, '#fff'); sg.globalAlpha = 1; txt('+ PANTALLA TÁCTIL', 360, 640, 42, '#9fd8ff') }
    else if (t < M.time) { dots(t, 1, .75); sg.fillStyle = 'rgba(0,0,0,.55)'; sg.fillRect(0, 0, 720, 90); txt('¿HACIA DÓNDE VA LA MAYORÍA?', 360, 48, 38, gold);
      const k = sr(t, Ln.f2.end - 1.4, Ln.f2.end - .9); if (k > 0) { sg.globalAlpha = k; sg.fillStyle = 'rgba(255,217,90,.25)'; sg.fillRect(380, 90, 340, 630); txt('→', 550, 420, 220, gold, { glow: '#ffb000' }); sg.globalAlpha = 1 } }
    else if (t < M.acc) { bgS(t, '#2a1408', '#4a2410', 'rgba(255,200,120,.07)'); txt('TIEMPO PROMEDIO', 360, 80, 46, '#ffc890'); const k = ss(ramp(t, M.time + 1.0, M.time + 2.6));
      txt(fmt(235 * k), 300, 220, 170, '#fff', { glow: '#ff8a30', blur: 40 }); txt('ms', 480, 245, 64, '#ffc890', { a: 'left' }); const k2 = ss(ramp(t, M.time + 3.6, M.time + 5.0));
      txt('CUERVO', 80, 380, 34, '#fff', { a: 'left' }); bar(80, 405, 560, 44, .5 * k2, '#ffd95a'); txt('HUMANOS Y MONOS', 80, 500, 34, '#fff', { a: 'left' }); bar(80, 525, 560, 44, 1 * k2, '#7ab0ff');
      stampMark('≈ LA MITAD', 360, 640, ramp(t, M.time + 4.2, M.time + 4.8), '#ff5a3a', -.08, 54) }
    else if (t < M.neur) { bgS(t, '#0a2a14', '#104a24', 'rgba(140,255,170,.07)'); txt('CON SEÑAL CLARA', 360, 90, 50, '#a8ffc0'); const k = ss(ramp(t, M.acc + 1.6, M.acc + 3.2));
      txt('≈ ' + Math.round(100 * k) + '%', 360, 300, 150, '#fff', { glow: '#2aff6a', blur: 44 }); txt('DE ACIERTOS', 360, 460, 60, '#a8ffc0'); bar(110, 560, 500, 44, k, '#2aff6a') }
    else if (t < M.myst) { bgS(t, '#1a0a2a', '#30104a', 'rgba(220,160,255,.07)'); txt('SUS NEURONAS', 360, 80, 52, '#e6b0ff'); txt('DISTINGUEN EN', 360, 140, 40, '#fff');
      const k = ss(ramp(t, M.neur + 1.6, M.neur + 2.6)); txt(fmt(70 * k) + ' ms', 360, 290, 150, '#fff', { glow: '#c060ff', blur: 40 });
      sg.strokeStyle = '#e6b0ff'; sg.lineWidth = 5; sg.beginPath(); for (let x = 60; x <= 660; x += 4) { const ph = (x - 60) / 600; const sp = Math.abs(((ph * 8 - t * 2) % 1 + 1) % 1 - .5) < .03 ? -90 : 0; const y = 520 + sp + Math.sin(x * .2 + t * 10) * 6; x == 60 ? sg.moveTo(x, y) : sg.lineTo(x, y) } sg.stroke() }
    else { bgS(t, '#2a1408', '#4a2410', 'rgba(255,200,120,.07)'); txt('¿CÓMO LO HACEN?', 360, 130, 64, '#fff'); txt('?', 360, 360, 240, gold, { glow: '#ffb000', blur: 50 });
      stampMark('REVISTA SCIENCE · NOV 2026', 360, 600, ramp(t, Ln.f6.end - 2.6, Ln.f6.end - 2.0), '#ffd95a', -.06, 34) }
    scanlines(.04); frameEdge('rgba(255,255,255,.5)');
  }
  const K = path([[0, [2.7, 2.35, -.3], [0, 1.75, -.05], 50], [M.title - .2, [2.3, 2.2, 0], [0, 1.75, -.05], 48], [M.title + .9, [2.6, 2.5, 2.2], [0, 2.2, -.8], 52],
    pv(M.lab - .3, 2.0, .3, 60), pv(M.lab + .05, 1.8, 0, 60), pv(M.task - .3, 1.72, 0, 60), [M.task + .05, [.3, 2.05, 1.5], [0, 2.7, -1.7], 54], [M.task + 3.0, [.15, 2.0, 1.15], [0, 2.75, -1.7], 52],
    pv(M.time - .3, 1.85, 0, 60), pv(M.time + .05, 1.8, -.2, 60), pv(M.acc - .3, 1.72, 0, 60), [M.acc + .05, [-1.6, 1.7, 1.4], [0, 1.7, -.2], 48], [M.acc + 1.4, [-1.2, 1.75, 1.1], [0, 1.75, -.2], 46],
    pv(M.acc + 1.6, 1.85, 0, 60), pv(M.neur - .3, 1.72, 0, 60), pv(M.neur + .05, 1.85, .2, 60), pv(M.myst - .3, 1.72, 0, 60), pv(M.myst + .05, 1.85, 0, 60), pv(Ln.f6.end - .4, 1.72, 0, 60),
    [Ln.f6.end + .3, [1.9, 2.0, -.4], [0, 1.82, -.05], 40], [M.endcard, [2.5, 2.6, 3.4], [0, 1.6, -1], 54], [C.dur, [4, 3.4, 6], [0, 1.6, -2], 58]]);
  const taps = [Ln.f2.end - 1.0, Ln.f2.end - .75, Ln.f1.start + 3.0];
  frame = function (t) {
    peck = Math.max(0, ...taps.map(a => win(t, a - .05, a + .2, .05, .12))); const look = Math.sin(t * 1.7) * .25 + Math.sin(t * 4.3) * .08;
    NECK.rotation.set(-.45 + peck * .9 + Math.sin(t * 2.2) * .05, look * (1 - peck), 0); NECK.position.z = -.14 - peck * .12;
    WINGS.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * (.12 + win(t, M.endcard + .3, C.dur, .4, .2) * Math.abs(Math.sin(t * 9)) * .6)); CROW.rotation.y = Math.sin(t * .4) * .1;
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .14 + .04 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .5);
    const O = { tag: .95, title: win(t, .45, M.lab - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(255,150,60,.08)',
      black: 1 - ramp(t, 0, .3), white: flashW(t, [M.lab, M.task, M.time, M.acc, M.neur, M.myst]),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿QUIÉN<br>GANARÍA?', qs: 150, a: 'YO', b: 'EL CUERVO', cta: 'COMENTÁ  A  o  B', nxt: 'Seguime para más <i>animales</i>' } : null };
    overlay(t, O);
  };
}

run([null, frame, frame, frame]);

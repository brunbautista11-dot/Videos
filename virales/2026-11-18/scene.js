// Virales 18/11/2026 — 3 shorts originales, todo dibujado por código (sin material de terceros).
// p1: pez de cabeza transparente (mar profundo) · p2: hipopótamos en el desierto de Arabia · p3: posible nuevo planeta enano
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P = PART;
const CFG = {
  1: { title: 'CABEZA<br>TRANSPARENTE', ts: 118, tag: 'MAR PROFUNDO<b>¿CÓMO VE?</b>', sub: 'FILMADO EN 4K', spk: { n: ['#6dffb0', '', 0], q: ['#7fd8ff', '', 0] } },
  2: { title: 'HIPOPÓTAMOS<br>EN ARABIA', ts: 150, tag: 'DESIERTO<b>¿HIPOPÓTAMOS?</b>', sub: 'HACE 125.000 AÑOS', spk: { n: ['#ffd95a', '', 0], q: ['#7ff0c0', '', 0] } },
  3: { title: '¿NUEVO<br>PLANETA ENANO?', ts: 140, tag: 'ESPACIO<b>MÁS ALLÁ DE PLUTÓN</b>', sub: 'DESCUBIERTO EN 2026', spk: { n: ['#8fd8ff', '', 0], q: ['#ffd95a', '', 0] } },
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
// ==================================================================================== PART 1 — DEEP SEA
if (P == 1) {
  const SKY = tex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a86b8'); gr.addColorStop(.35, '#145a85'); gr.addColorStop(.7, '#0a3352'); gr.addColorStop(1, '#041a2c'); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
  SKY.wrapS = SKY.wrapT = THREE.ClampToEdgeWrapping;
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(90, 32, 20), new THREE.MeshBasicMaterial({ map: SKY, side: THREE.BackSide, fog: false, depthWrite: false })));
  scene.background = new THREE.Color(0x0b3a5a); scene.fog = new THREE.FogExp2(0x0d4064, .045);
  hemi.color.setHex(0x9ad8ff); hemi.groundColor.setHex(0x0a2030); hemi.intensity = 1.6; R.toneMappingExposure = 1.15;
  const camL = new THREE.PointLight(0xe8f6ff, 9, 9, 1.4); camL.position.set(.4, .3, 0); cam.add(camL);
  const top = new THREE.DirectionalLight(0x8fd0ff, 1.2); top.position.set(2, 10, 3); scene.add(top);
  // god rays
  const rayM = new THREE.MeshBasicMaterial({ color: 0x9fe0ff, transparent: true, opacity: .05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const RAYS = []; for (let i = 0; i < 7; i++) { const m = add(scene, new THREE.ConeGeometry(1.4 + hash(i) * 1.5, 30, 16, 1, true), rayM, -10 + i * 3.4, 10, -10 - hash(i * 3) * 10); m.rotation.z = .25 - hash(i * 7) * .5; RAYS.push(m) }
  // marine snow
  const NS = 1600, sp = new Float32Array(NS * 3), base = [];
  for (let i = 0; i < NS; i++) base.push([(hash(i * 1.1) - .5) * 24, hash(i * 2.3) * 16 - 8, (hash(i * 3.7) - .5) * 24 - 4, .05 + hash(i * 5.3) * .15]);
  const snowG = new THREE.BufferGeometry(); snowG.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  scene.add(new THREE.Points(snowG, new THREE.PointsMaterial({ size: .06, map: radT, transparent: true, depthWrite: false, color: 0xdff4ff, opacity: .8 })));
  // glowing drifters (generic deep-sea strands) + jellies
  const STR = []; for (let s = 0; s < 4; s++) { const g = grp(scene); g.position.set(-6 + s * 4.5, 3 + hash(s) * 2, -9 - hash(s * 2) * 6); for (let i = 0; i < 18; i++) { const b = glowSprite(g, [0xff7ad8, 0x7affe0, 0xffd27a][s % 3], .5, 0, -i * .32, 0); b.material.opacity = .6 } STR.push(g) }
  const JEL = []; const jm = new THREE.MeshLambertMaterial({ color: 0xffb0e8, emissive: 0x6a2a5a, transparent: true, opacity: .55, side: THREE.DoubleSide });
  for (let j = 0; j < 5; j++) { const g = grp(scene); add(g, new THREE.SphereGeometry(.35, 16, 8, 0, 2 * PI, 0, PI / 2), jm); for (let k = 0; k < 6; k++) { const tt = add(g, G.cyl, jm, Math.cos(k) * .2, -.6, Math.sin(k) * .2); tt.scale.set(.012, 1.2, .012) } g.position.set(-7 + j * 3.5, -1 + hash(j * 9) * 4, -7 - hash(j * 4) * 5); g.userData.s = j; g.userData.y = g.position.y; JEL.push(g) }
  // ---------------- the fish (original stylised model)
  const FISH = grp(scene); const body = grp(FISH);
  const scaleT = tex(256, 256, (g, w, h) => { g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) for (let x = (y / 16 % 2) * 8; x < w; x += 16) { g.fillStyle = `rgba(${150 + Math.random() * 60 | 0},${120 + Math.random() * 40 | 0},90,.35)`; g.beginPath(); g.arc(x, y, 8, 0, PI); g.fill() } speck(g, w, h, 600, .2, '255,230,190') }, 2, 2);
  const bodyM = new THREE.MeshStandardMaterial({ color: 0xb89a7a, map: scaleT, roughness: .4, metalness: .5, emissive: 0x140c06 });
  const bd = sph(body, 1, bodyM, 0, -.08, -.25); bd.scale.set(.2, .25, .9);
  const finM = new THREE.MeshStandardMaterial({ color: 0xa8b8c8, transparent: true, opacity: .5, side: THREE.DoubleSide, roughness: .3, emissive: 0x182430 });
  const tail = new THREE.Shape(); tail.moveTo(0, 0); tail.lineTo(-.32, .34); tail.quadraticCurveTo(-.12, 0, -.32, -.34); tail.lineTo(0, 0);
  const tailM = add(body, new THREE.ShapeGeometry(tail), finM, 0, -.08, -1.12); tailM.rotation.y = PI / 2;
  const PECS = []; for (const s of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(.7, .35, .95, -.05); sh.quadraticCurveTo(.6, -.35, 0, -.12); const m = add(body, new THREE.ShapeGeometry(sh), finM, s * .16, -.14, 0); m.rotation.set(-PI / 2, 0, s > 0 ? -.4 : PI + .4); PECS.push(m) }
  const dors = new THREE.Shape(); dors.moveTo(0, 0); dors.lineTo(-.25, .25); dors.lineTo(-.45, 0); const dm = add(body, new THREE.ShapeGeometry(dors), finM, 0, .25, -.55); dm.rotation.y = PI / 2;
  box(body, .1, .02, .04, mat(0x2a1a14), 0, -.16, .68, 0);
  const NOS = []; for (const s of [-1, 1]) NOS.push(sph(body, .034, new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: .2 }), s * .085, -.03, .64, 0));
  const ringM = basic(0xff3a5a, { transparent: true, opacity: 0, fog: false, depthTest: false });
  const RINGS = NOS.map(n => { const r = add(body, new THREE.TorusGeometry(.09, .012, 8, 32), ringM, n.position.x, n.position.y, n.position.z + .03); r.renderOrder = 5; return r });
  const EYES = []; const eyeM = new THREE.MeshStandardMaterial({ color: 0x2aff5a, emissive: 0x18c03a, roughness: .25, metalness: .1, toneMapped: false });
  const lensM = new THREE.MeshBasicMaterial({ color: 0x7aff2a, fog: false, toneMapped: false });
  for (const s of [-1, 1]) { const piv = grp(body); piv.position.set(s * .06, .1, .3); const tube = add(piv, G.cyl, eyeM, 0, .14, 0, 0); tube.scale.set(.045, .22, .045); sph(piv, .052, lensM, 0, .23, 0, 0); const gl = glowSprite(piv, 0x7aff7a, .35, 0, .3, 0); gl.material.opacity = .55; EYES.push(piv) }
  const domeM = new THREE.MeshPhysicalMaterial({ color: 0xd8f6ff, transparent: true, opacity: .2, roughness: .05, metalness: 0, emissive: 0x0a2a3a, depthWrite: false, side: THREE.DoubleSide });
  const dome = sph(body, 1, domeM, 0, .16, .3, 0); dome.scale.set(.2, .25, .44); dome.renderOrder = 3;
  const rimM = new THREE.MeshBasicMaterial({ color: 0x9ff0ff, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false, fog: false });
  const rim = sph(body, 1, rimM, 0, .16, .3, 0); rim.scale.set(.212, .262, .455);
  // ---------------- generic ROV (original design)
  const ROV = grp(scene); { const y = mat(0xffc21a), dk = mat(0x22262c);
    box(ROV, 2.2, 1.0, 1.6, y, 0, .55, 0, 0); box(ROV, 2.3, .14, 1.7, dk, 0, 0, 0, 0); box(ROV, 2.3, .14, 1.7, dk, 0, 1.1, 0, 0);
    for (const s of [-1, 1]) { const th = add(ROV, G.cyl, dk, s * 1.3, .55, -.2); th.scale.set(.22, .5, .22); th.rotation.x = PI / 2 }
    for (const s of [-1, 1]) { glowSprite(ROV, 0xfff2c8, 1.6, s * .6, .5, .85); box(ROV, .25, .25, .1, basic(0xffffff), s * .6, .5, .82, 0) }
    sph(ROV, .2, mat(0x111111), 0, .3, .85, 0) }
  ROV.position.set(3.2, 1.4, -5.5); ROV.rotation.y = -.7;
  // ---------------- panel
  makePanel(V(-2.9, .9, -1.6), .62, 3.0, 0x39f0ff, 0x2fb8ff);
  function eyeAng(t) { const a = Ln.a5; const f = Math.max(win(t, a.start + 4.2, a.start + 6.4, .5, .5), win(t, a.start + 7.4, a.end + .6, .4, .5)); return f * PI / 2 * .95 }  // 0 = up, ~PI/2 = forward
  function draw(t) {
    const cy = '#5ff3ff';
    if (t < M.depth) { bgS(t, '#03202e', '#062f44', 'rgba(95,243,255,.08)'); const rec = Math.sin(t * 6) > 0;
      sg.fillStyle = rec ? '#ff2a3a' : 'rgba(255,42,58,.3)'; sg.beginPath(); sg.arc(90, 90, 22, 0, 7); sg.fill(); txt('REC', 175, 92, 44, '#fff');
      txt('CÁMARA', 360, 230, 56, cy); const k = sr(t, M.cam + 2.4, M.cam + 3.0); txt('4K', 360, 380, 200 * (.75 + .25 * k), '#fff', { glow: cy, blur: 40 });
      pill('CALIFORNIA · EE.UU.', 360, 560, '#0f8fb0', '#fff', 40); txt('OCTUBRE 2026', 360, 650, 36, 'rgba(255,255,255,.75)'); corners(cy) }
    else if (t < M.size) { bgS(t, '#021624', '#010a12', 'rgba(95,243,255,.06)'); const k = ss(ramp(t, M.depth + .4, M.depth + 2.8)); txt('PROFUNDIDAD', 360, 90, 50, cy);
      txt('-' + fmt(600 * k) + ' m', 360, 240, 140, '#fff', { glow: cy, blur: 36 }); txt('≈ 1.970 PIES', 360, 345, 40, 'rgba(255,255,255,.7)');
      sg.fillStyle = 'rgba(255,255,255,.1)'; sg.fillRect(120, 400, 480, 200); const lg = sg.createLinearGradient(0, 400, 0, 600); lg.addColorStop(0, '#2aa7e0'); lg.addColorStop(1, '#000814'); sg.fillStyle = lg; sg.fillRect(120, 400, 480, 200 * k);
      sg.fillStyle = '#ffd95a'; sg.beginPath(); sg.arc(360, 400 + 190 * k, 12, 0, 7); sg.fill(); txt('LUZ: CASI NADA', 360, 655, 40, '#ffd95a') }
    else if (t < M.nose) { bgS(t, '#03202e', '#062f44', 'rgba(95,243,255,.08)'); txt('TAMAÑO', 360, 90, 52, cy); const k = ss(ramp(t, M.size + .3, M.size + 1.6));
      sg.strokeStyle = '#fff'; sg.lineWidth = 6; sg.beginPath(); sg.moveTo(90, 330); sg.lineTo(90 + 540 * k, 330); sg.stroke(); for (let i = 0; i <= 15; i++) { if (i / 15 > k) break; const x = 90 + i * 36; sg.beginPath(); sg.moveTo(x, 330); sg.lineTo(x, i % 5 ? 305 : 285); sg.stroke() }
      txt('≈ 15 cm', 360, 210, 110, '#fff', { glow: cy }); const d = sr(t, M.size + 2.6, M.size + 3.4); sg.globalAlpha = d; txt('CABEZA = CÚPULA', 360, 460, 54, cy); txt('TRANSPARENTE', 360, 530, 54, cy); txt('LLENA DE LÍQUIDO', 360, 625, 40, '#fff'); sg.globalAlpha = 1 }
    else if (t < M.eyes) { bgS(t, '#200a14', '#3a0d1e', 'rgba(255,90,120,.08)'); txt('¿OJOS?', 360, 170, 120, '#fff'); const k = ramp(t, Ln.a4.end - 1.2, Ln.a4.end - .6);
      if (k > 0) { sg.strokeStyle = '#ff2a3a'; sg.lineWidth = 14; sg.beginPath(); sg.moveTo(170, 170); sg.lineTo(170 + 380 * ss(cl(k * 2)), 170); sg.stroke() }
      stampMark('NO: ¡OLFATO!', 360, 410, ramp(t, Ln.a4.end - .9, Ln.a4.end - .3), '#ff5a7a', -.1, 66); txt('SON PARA OLER', 360, 610, 46, 'rgba(255,255,255,.85)') }
    else if (t < M.rare) { bgS(t, '#03201a', '#063a2a', 'rgba(110,255,170,.08)'); txt('LOS OJOS DE VERDAD', 360, 90, 48, '#6dffb0');
      const a = eyeAng(t); sg.save(); sg.translate(360, 470); sg.strokeStyle = 'rgba(255,255,255,.6)'; sg.lineWidth = 5; sg.beginPath(); sg.ellipse(0, -40, 230, 190, 0, 0, 7); sg.stroke();
      sg.rotate(a); sg.fillStyle = '#3fff7a'; sg.shadowColor = '#3fff7a'; sg.shadowBlur = 30; sg.fillRect(-28, -170, 56, 170); sg.beginPath(); sg.arc(0, -170, 36, 0, 7); sg.fill(); sg.restore();
      txt(a < .7 ? '↑ HACIA ARRIBA' : '→ HACIA ADELANTE', 360, 640, 50, '#fff') }
    else { bgS(t, '#03202e', '#062f44', 'rgba(95,243,255,.08)'); const k1 = ss(ramp(t, M.rare + 1.2, M.rare + 3.2)), k2 = ss(ramp(t, M.rare + 3.4, M.rare + 4.6));
      txt('INMERSIONES', 200, 110, 40, cy); txt(fmt(7000 * k1), 200, 190, 90, '#fff', { glow: cy }); txt('AÑOS', 540, 110, 40, cy); txt(fmt(40 * k1), 540, 190, 90, '#fff', { glow: cy });
      txt('LO VIERON', 360, 330, 50, '#ffd95a'); txt(fmt(11 * k2), 360, 460, 190, '#fff', { glow: '#ffb000', blur: 40 }); txt('VECES', 360, 590, 56, '#ffd95a');
      if (t > M.free) { sg.fillStyle = 'rgba(3,32,46,.92)'; sg.fillRect(0, 0, 720, 720); txt('20 MIN', 360, 250, 150, '#fff', { glow: cy }); txt('DE VIDEO', 360, 370, 56, cy); stampMark('Y LO DEJARON IR', 360, 540, ramp(t, Ln.a7.end - 1.4, Ln.a7.end - .8), '#6dffb0', -.08, 54) } }
    scanlines(.08); frameEdge('rgba(95,243,255,.6)');
  }
  const K = path([[0, [1.2, .4, 2.4], [0, .1, .0], 46], [M.title - .2, [.8, .3, 1.9], [0, .1, .1], 44], [M.title + .9, [1.8, .9, 3.4], [0, .1, 0], 52],
    pv(M.cam - .3, 1.95, .6, 60), pv(M.cam + .05, 1.75, 0, 60), pv(M.depth - .3, 1.65, 0, 60), pv(M.depth + .05, 1.85, -.4, 60), pv(M.size - .3, 1.7, 0, 60),
    [M.size + .05, [1.2, -.05, 1.5], [0, -.05, -.2], 52], [M.size + 2.4, [.6, .35, 1.6], [0, .1, 0], 50], pv(M.size + 2.6, 1.85, .3, 60), pv(M.nose - .3, 1.7, 0, 60),
    [M.nose + .05, [.35, .05, 1.95], [0, -.02, .5], 42], [M.nose + 2.6, [.05, 0, 1.65], [0, -.02, .5], 40], pv(M.nose + 2.8, 1.8, 0, 60), pv(M.eyes - .3, 1.7, 0, 60),
    [M.eyes + .05, [1.8, .6, 1.3], [0, .12, .15], 44], [M.eyes + 5, [1.9, .45, 1.7], [0, .12, .15], 42], [M.rare - 1.2, [1.7, .75, 1.0], [0, .12, .15], 44],
    [M.rare + .05, [2.0, 1.0, 1.8], [2.4, 1.2, -5.0], 58], [M.rare + 1.0, [.6, 1.0, 2.6], [1.8, 1.0, -5], 58], pv(M.rare + 1.2, 1.9, 0, 60), pv(M.free - .3, 1.75, 0, 60),
    [M.free + .05, [1.4, .6, 3.4], [0, .2, -1], 56], [M.endcard, [.5, .9, 4.4], [0, .3, -3], 60], [C.dur, [0, 1.6, 5.5], [0, .6, -4], 62]]);
  frame = function (t) {
    for (let i = 0; i < NS; i++) { const b = base[i]; sp[i * 3] = b[0] + Math.sin(t * .3 + i) * .2; sp[i * 3 + 1] = ((b[1] - t * b[3] + 8) % 16 + 16) % 16 - 8; sp[i * 3 + 2] = b[2] } snowG.attributes.position.needsUpdate = true;
    RAYS.forEach((r, i) => r.material.opacity = .045 + .02 * Math.sin(t * .7 + i));
    STR.forEach((g, i) => g.rotation.z = Math.sin(t * .5 + i) * .12); JEL.forEach(g => { const s = g.userData.s; g.position.y = g.userData.y + Math.sin(t * 1.2 + s) * .2; g.scale.y = 1 + Math.sin(t * 3 + s) * .12 });
    const swim = ss(ramp(t, M.free + 1.2, M.endcard + 1.5));
    FISH.position.set(swim * -1.5, Math.sin(t * .8) * .04 + swim * .8, -swim * 6); FISH.rotation.y = Math.sin(t * .5) * .08 - swim * .4; FISH.rotation.x = -swim * .15;
    body.rotation.z = Math.sin(t * 1.1) * .03; tailM.rotation.x = Math.sin(t * 3) * .25; PECS.forEach((p, i) => p.rotation.y = Math.sin(t * 2.2 + i * PI) * .2);
    const ea = eyeAng(t); EYES.forEach(e => e.rotation.x = ea);
    const rk = win(t, M.nose + 1.0, M.eyes - .1, .3, .3); ringM.opacity = rk * (.6 + .4 * Math.sin(t * 9)); RINGS.forEach(r => r.scale.setScalar(1 + .25 * Math.sin(t * 6)));
    ROV.visible = t > M.rare - .5; ROV.position.y = 1.4 + Math.sin(t * .6) * .1;
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .22 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .9);
    const O = { tag: .95, title: win(t, .45, M.cam - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .05, tint: 'rgba(40,160,255,.10)',
      black: 1 - ramp(t, 0, .3), white: [M.depth, M.size, M.nose, M.eyes, M.rare, M.free].reduce((a, m) => Math.max(a, win(t, m - .02, m + .16, .02, .14) * .3), 0),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿BAJARÍAS<br>HASTA AHÍ?', qs: 140, cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>curiosidades</i>' } : null };
    overlay(t, O);
  };
}

// ==================================================================================== PART 2 — ARABIAN DESERT / LAKE
if (P == 2) {
  const mk = (top, mid, bot) => { const t = tex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(.6, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h) }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t };
  const skyA = new THREE.MeshBasicMaterial({ map: mk('#3d8fd0', '#a9cfe6', '#f2dcb0'), side: THREE.BackSide, fog: false, depthWrite: false });
  const skyB = new THREE.MeshBasicMaterial({ map: mk('#1f74d0', '#6fb6ea', '#d8eef0'), side: THREE.BackSide, fog: false, depthWrite: false, transparent: true, opacity: 0 });
  for (const [m, r] of [[skyA, 200], [skyB, 198]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16, 0, 2 * PI, 0, PI * .55), m); scene.add(s); const uv = s.geometry.attributes.uv, pos = s.geometry.attributes.position; for (let i = 0; i < uv.count; i++) uv.setY(i, cl(pos.getY(i) / r * 1.6)); uv.needsUpdate = true }
  scene.background = new THREE.Color(0xf0dcb4); scene.fog = new THREE.Fog(0xf2dcb0, 60, 190);
  hemi.color.setHex(0xfff2dc); hemi.groundColor.setHex(0x8a6a44); hemi.intensity = 1.1; R.toneMappingExposure = .95;
  const sun = new THREE.DirectionalLight(0xfff0d0, 2.6); sun.position.set(30, 40, 10); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 }); scene.add(sun); scene.add(sun.target); sun.target.position.set(0, 0, -6);
  glowSprite(scene, 0xfff4c0, 40, 60, 80, -150);
  const LC = V(0, 0, -26), LR = 22;
  const GN = 150, gGeo = new THREE.PlaneGeometry(240, 240, GN, GN); gGeo.rotateX(-PI / 2); const gp = gGeo.attributes.position; const GX = [], GZ = [];
  for (let i = 0; i < gp.count; i++) { GX.push(gp.getX(i)); GZ.push(gp.getZ(i)) }
  const sandT = tex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .12, '140,100,60'); for (let y = 0; y < h; y += 9) { g.fillStyle = 'rgba(160,120,70,.08)'; g.fillRect(0, y, w, 3) } }, 30, 30);
  const groundM = new THREE.MeshLambertMaterial({ color: 0xe0b070, map: sandT });
  const ground = new THREE.Mesh(gGeo, groundM); ground.receiveShadow = true; scene.add(ground);
  function hgt(x, z, dk) { const d = Math.hypot(x - LC.x, z - LC.z); const basin = -7 * (1 - ss(ramp(d, LR - 8, LR + 2)));
    const dune = Math.pow(Math.sin(x * .07 + Math.sin(z * .045) * 2.2) * .5 + .5, 2) * 6 + Math.sin(z * .11 + x * .02) * 1.1; const nearL = ramp(d, LR + 1, LR + 18);
    return basin + dune * nearL * (dk * (.3 + .7 * nearL) + (1 - dk) * .2) }
  let lastDK = -1; function setDunes(dk) { if (Math.abs(dk - lastDK) < .002) return; lastDK = dk; for (let i = 0; i < gp.count; i++) gp.setY(i, hgt(GX[i], GZ[i], dk)); gp.needsUpdate = true; gGeo.computeVertexNormals() }
  const waterT = tex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(200,240,255,${Math.random() * .6})`; g.fillRect(Math.random() * w, Math.random() * h, 8 + Math.random() * 30, 2) } }, 8, 8);
  const waterM = new THREE.MeshLambertMaterial({ color: 0x2e86b0, map: waterT, emissive: 0x0c3a52, transparent: true, opacity: .92 });
  const water = add(scene, new THREE.CircleGeometry(LR + 5, 64), waterM, LC.x, -8, LC.z); water.rotation.x = -PI / 2;
  const VEG = []; const reedM = mat(0x5f8a3a), leafM = mat(0x4f8a3e), trunkM = mat(0x6b4a2e);
  for (let i = 0; i < 90; i++) { const a = hash(i * 1.7) * 2 * PI, r = LR + 1 + hash(i * 2.9) * 6; const px = LC.x + Math.cos(a) * r, pz = LC.z + Math.sin(a) * r; if (pz > -8 && Math.abs(px) < 16) continue; const g = grp(scene); g.position.set(px, 0, pz);
    for (let k = 0; k < 4; k++) { const c = add(g, new THREE.ConeGeometry(.08, 1.6 + hash(i + k) * .8, 5), reedM, (hash(i * 3 + k) - .5) * .5, .8, (hash(i * 5 + k) - .5) * .5); c.rotation.z = (hash(i + k * 7) - .5) * .3 } g.userData.a = a; VEG.push(g) }
  for (let i = 0; i < 14; i++) { const a = hash(i * 4.1) * 2 * PI, r = LR + 8 + hash(i * 6.1) * 14; const g = grp(scene); g.position.set(LC.x + Math.cos(a) * r, 0, LC.z + Math.sin(a) * r);
    const tr = add(g, G.cyl, trunkM, 0, 1.4, 0, 1); tr.scale.set(.16, 2.8, .16); const cn = sph(g, 1, leafM, 0, 3.0, 0, 1); cn.scale.set(2.2, .6, 2.2); g.userData.a = a; VEG.push(g) }
  const ANI = [];
  function hippo(x, z, ry, s = 1) { const g = grp(scene); const m = mat(0x7a6670), mp = mat(0xb58a92); const b = sph(g, 1, m, 0, .9, 0); b.scale.set(1.0, .8, 1.7); const h = sph(g, 1, m, 0, 1.05, 1.75); h.scale.set(.75, .6, .8); const sn_ = sph(g, 1, mp, 0, .85, 2.35); sn_.scale.set(.7, .45, .45);
    for (const sx of [-1, 1]) { sph(g, .12, mat(0x111111), sx * .35, 1.5, 1.9, 0); sph(g, .14, m, sx * .4, 1.7, 1.6, 0); for (const lz of [-.9, .9]) { const l = add(g, G.cyl, m, sx * .6, .3, lz, 1); l.scale.set(.25, .6, .25) } }
    g.position.set(x, 0, z); g.rotation.y = ry; g.userData = { kind: 'hippo', s }; ANI.push(g); return g }
  function buffalo(x, z, ry) { const g = grp(scene); const m = mat(0x3d2b22), hm = mat(0xd9ccb0); const b = sph(g, 1, m, 0, 1.5, 0); b.scale.set(.75, .8, 1.5); const h = sph(g, 1, m, 0, 1.5, 1.55); h.scale.set(.42, .45, .55);
    for (const sx of [-1, 1]) { const hn = add(g, new THREE.TorusGeometry(.9, .09, 6, 16, PI * .7), hm, sx * .55, 1.95, 1.4, 1); hn.rotation.set(0, sx > 0 ? 0 : PI, .2); for (const lz of [-.9, .9]) { const l = add(g, G.cyl, m, sx * .45, .5, lz, 1); l.scale.set(.15, 1.0, .15) } }
    g.position.set(x, 0, z); g.rotation.y = ry; g.userData = { kind: 'buf', s: .75 }; ANI.push(g); return g }
  function gazelle(x, z, ry, oryx = false) { const g = grp(scene); const m = mat(oryx ? 0xe8e2d6 : 0xc8955a), w = mat(0xf4efe6), dk = mat(0x2a2420); const b = sph(g, 1, m, 0, 1.15, 0); b.scale.set(.32, .36, .8); const bl = sph(g, 1, w, 0, 1.0, 0); bl.scale.set(.28, .2, .7);
    const nk = add(g, G.cyl, m, 0, 1.6, .65, 1); nk.scale.set(.1, .7, .1); nk.rotation.x = .5; const h = sph(g, 1, oryx ? dk : m, 0, 1.95, .95); h.scale.set(.16, .16, .3);
    for (const sx of [-1, 1]) { const hn = add(g, G.cyl, dk, sx * .07, 2.35, .85, 1); hn.scale.set(.03, oryx ? 1.0 : .45, .03); hn.rotation.x = -.45; for (const lz of [-.55, .55]) { const l = add(g, G.cyl, m, sx * .15, .45, lz, 1); l.scale.set(.06, .9, .06) } }
    g.position.set(x, 0, z); g.rotation.y = ry; g.userData = { kind: 'gaz', s: .8 }; ANI.push(g); return g }
  function ostrich(x, z, ry) { const g = grp(scene); const bk = mat(0x1d1b1e), sk = mat(0xd9a7a0), wt = mat(0xf2efe8); const b = sph(g, 1, bk, 0, 1.7, 0); b.scale.set(.55, .5, .7); sph(g, .3, wt, 0, 1.85, -.6);
    const nk = add(g, G.cyl, sk, 0, 2.5, .45, 1); nk.scale.set(.07, 1.3, .07); nk.rotation.x = .25; const h = sph(g, 1, sk, 0, 3.15, .62); h.scale.set(.13, .12, .2); box(g, .06, .05, .2, mat(0x8a6a4a), 0, 3.12, .82, 0);
    for (const sx of [-1, 1]) { const l = add(g, G.cyl, sk, sx * .2, .7, 0, 1); l.scale.set(.06, 1.4, .06) }
    g.position.set(x, 0, z); g.rotation.y = ry; g.userData = { kind: 'ost', s: .8 }; ANI.push(g); return g }
  const HIP = [hippo(-3.5, -9.5, .3, .75), hippo(1.5, -11, -.4, .65), hippo(5.5, -9.5, .6, .5)];
  const BUF = [buffalo(-9, -1.5, .9), buffalo(-6.2, .5, 1.2)];
  const GAZ = [gazelle(7.5, -.5, -1.2), gazelle(9, 1, -1.0)]; const ORX = [gazelle(4.5, 2, -.6, true)];
  const OST = [ostrich(11.5, -2.8, -.7), ostrich(13, -1, -.9)];
  const GROUPS = [HIP, BUF, GAZ, ORX, OST];
  ANI.forEach(a => a.traverse(o => { if (o.isMesh) o.castShadow = true }));
  const TOOLS = []; const flM = [mat(0x9a8c7a), mat(0x7d6f62), mat(0xb5a690)];
  for (let i = 0; i < 26; i++) { const m = add(scene, new THREE.TetrahedronGeometry(.18 + hash(i) * .12, 0), flM[i % 3], -1.2 + (hash(i * 2.1) - .5) * 4, .1, 2.6 + (hash(i * 3.3) - .5) * 2.2, 1); m.rotation.set(hash(i * 5) * 3, hash(i * 7) * 3, hash(i * 9) * 3); m.scale.set(1.4, .35, .9); m.userData.d = hash(i * 11); TOOLS.push(m) }
  makePanel(V(0, 6.4, -2), 0, 4.6, 0xffd95a, 0xffb040);
  function draw(t) {
    const gold = '#ffd95a';
    if (t < M.lake) { bgS(t, '#3a2408', '#6a4210', 'rgba(255,217,90,.08)'); txt('ARABIA SAUDITA', 360, 90, 48, gold); txt('HOY', 360, 240, 200, '#fff', { glow: '#ff9a20', blur: 40 });
      sg.fillStyle = '#ffcc40'; sg.shadowColor = '#ffaa00'; sg.shadowBlur = 40; sg.beginPath(); sg.arc(610, 110, 46, 0, 7); sg.fill(); sg.shadowBlur = 0;
      sg.fillStyle = '#e8b86a'; sg.beginPath(); sg.moveTo(0, 620); for (let x = 0; x <= 720; x += 20) sg.lineTo(x, 570 + Math.sin(x * .02 + t) * 30); sg.lineTo(720, 720); sg.lineTo(0, 720); sg.fill();
      pill('EL CUARTO VACÍO', 360, 440, '#b5701a', '#fff', 46) }
    else if (t < M.animals) { bgS(t, '#062a3a', '#0a4a5a', 'rgba(120,230,255,.08)'); const k = ss(ramp(t, M.lake + .5, M.lake + 2.6)); txt('HACE', 360, 70, 44, '#9feaff');
      txt(fmt(125000 * k), 360, 170, 120, '#fff', { glow: '#2fd0ff', blur: 36 }); txt('AÑOS', 360, 260, 48, '#9feaff');
      const k2 = sr(t, M.lake + 4.2, M.lake + 4.9), k3 = sr(t, M.lake + 6.0, M.lake + 6.7);
      sg.globalAlpha = k2; txt('≈ 340 km²', 360, 400, 92, '#fff', { glow: '#2fd0ff' }); txt('DE LAGO', 360, 470, 40, '#9feaff'); sg.globalAlpha = k3; txt('29 m', 360, 580, 92, '#fff', { glow: '#2fd0ff' }); txt('DE PROFUNDIDAD', 360, 650, 40, '#9feaff'); sg.globalAlpha = 1 }
    else if (t < M.tools) { bgS(t, '#14300e', '#24501a', 'rgba(170,255,120,.08)'); txt('LAGO MUNDAFAN', 360, 80, 54, '#c8ff8a', { glow: '#6aff3a' });
      const names = ['HIPOPÓTAMOS', 'BÚFALOS GIGANTES', 'GACELAS', 'ÓRICES', 'AVESTRUCES']; names.forEach((n, i) => { const m = M['an' + i] ?? (M.animals + 2 + i); const a = sr(t, m - .1, m + .25); if (a <= 0) return; sg.globalAlpha = a; const y = 190 + i * 104; sg.fillStyle = 'rgba(255,255,255,.1)'; sg.beginPath(); sg.roundRect(80 + (1 - a) * 80, y - 42, 560, 84, 20); sg.fill(); txt('✓', 140, y + 2, 48, '#c8ff8a'); txt(n, 390, y + 2, 50, '#fff'); sg.globalAlpha = 1 }) }
    else if (t < M.poison) { bgS(t, '#2a2016', '#463626', 'rgba(255,220,170,.08)'); txt('HERRAMIENTAS DE PIEDRA', 360, 90, 42, '#ffd9a0'); const k = ss(ramp(t, M.tools + 1.2, M.tools + 3.2));
      txt('+' + fmt(5500 * k), 360, 280, 170, '#fff', { glow: '#ff9a40', blur: 36 }); for (let i = 0; i < 12; i++) { if (i / 12 > k) break; const x = 100 + i * 47; sg.fillStyle = ['#9a8c7a', '#7d6f62', '#b5a690'][i % 3]; sg.beginPath(); sg.moveTo(x, 470); sg.lineTo(x + 18, 420); sg.lineTo(x + 36, 470); sg.fill() }
      stampMark('DE PEDERNAL', 360, 600, ramp(t, M.tools + 3.4, M.tools + 4.0), '#ffb040', -.08, 56) }
    else if (t < M.green) { bgS(t, '#200a2a', '#3a0d3a', 'rgba(220,120,255,.08)'); txt('RESTOS DE', 360, 90, 48, '#e6a8ff'); txt('PLANTAS TÓXICAS', 360, 160, 64, '#fff', { glow: '#c040ff' });
      sg.save(); sg.translate(360, 350); sg.fillStyle = '#7fe05a'; for (let i = 0; i < 6; i++) { sg.rotate(PI / 3); sg.beginPath(); sg.ellipse(0, -70, 30, 70, 0, 0, 7); sg.fill() } sg.fillStyle = '#c040ff'; sg.beginPath(); sg.arc(0, 0, 30, 0, 7); sg.fill(); sg.restore();
      const k = sr(t, Ln.b5.end - 2.6, Ln.b5.end - 2.0); sg.globalAlpha = k; txt('¿VENENO', 360, 560, 72, '#fff'); txt('PARA CAZAR?', 360, 640, 60, '#e6a8ff'); sg.globalAlpha = 1 }
    else { bgS(t, '#0e3a1a', '#1a5a2a', 'rgba(170,255,120,.08)'); txt('LA ÉPOCA DE LA', 360, 100, 48, '#c8ff8a'); txt('ARABIA', 360, 230, 130, '#fff', { glow: '#3aff6a', blur: 40 }); txt('VERDE', 360, 360, 130, '#7fff8a', { glow: '#3aff6a', blur: 40 });
      stampMark('REVISTA SCIENCE · NOV 2026', 360, 560, ramp(t, Ln.b6.end - 3.2, Ln.b6.end - 2.6), '#ffd95a', -.06, 40) }
    scanlines(.06); frameEdge('rgba(255,217,90,.6)');
  }
  const P0 = pv(0, 1.9);
  const K = path([[0, [-14, 13, 34], [0, 2, -20], 58], [M.title + .9, [-6, 9, 22], [0, 3, -20], 58], [M.today - .2, [-2, 7.5, 16], [0, 3, -16], 58],
    [M.today + .05, [10, 12, 18], [0, 1, -22], 60], [M.lake - 1.5, [6, 11, 20], [0, 2, -18], 58], [M.lake - .2, P0[1], P0[2], 60],
    pv(M.lake + 1.6, 1.75, 0, 60), [M.lake + 2.4, [-8, 9, 18], [0, 0, -18], 58], [M.lake + 4.0, [-4, 8, 14], [0, 0, -16], 58], pv(M.lake + 4.2, 1.8, 0, 60), pv(M.animals - .3, 1.72, 0, 60),
    [M.animals + .05, [-4, 3.6, 7], [-1.5, .6, -8], 58], [M.an1 - .1, [-5, 3.4, 8], [-7.5, 1, -.5], 58], [M.an1 + .9, [-4, 3.4, 8], [-7, 1, -.5], 58], [M.an2 - .1, [3.5, 3.4, 8.5], [7, 1, -.5], 58], [M.an4 + .1, [8.5, 3.6, 8.5], [11, 1.2, -2], 58],
    pv(M.tools - .4, 1.85, 0, 60), pv(M.tools + 3.0, 1.72, 0, 60), [M.tools + 3.25, [1.3, 1.6, 5.4], [-1.2, 0, 2.4], 50], [M.poison + 1.2, [-.6, 1.3, 4.8], [-1.2, 0, 2.4], 48],
    pv(M.poison + 1.4, 1.85, 0, 60), pv(M.green - .3, 1.72, 0, 60), pv(M.green + .05, 1.8, 0, 60), [M.green + 3.2, [9, 6, 16], [0, 1, -18], 58], [M.endcard, [0, 10, 26], [0, 1, -20], 58], [C.dur, [-6, 14, 34], [0, 1, -20], 60]]);
  const sand = new THREE.Color(0xe0b070), green = new THREE.Color(0x9fb86a), fogA = new THREE.Color(0xf2dcb0), fogB = new THREE.Color(0xcfe6ee);
  frame = function (t) {
    const g = sr(t, M.lake + .4, M.lake + 3.2); // 0 = today, 1 = 125.000 years ago
    setDunes(1 - g); groundM.color.copy(sand).lerp(green, g * .85); skyB.opacity = g;
    scene.fog.color.copy(fogA).lerp(fogB, g); scene.background.copy(scene.fog.color);
    water.position.y = lerp(-8, -.45, sr(t, M.lake + 1.2, M.lake + 3.6)); waterT.offset.set(t * .01, t * .006);
    VEG.forEach(v => { const h0 = hash(v.userData.a); const k = sr(t, M.lake + 1.5 + h0 * 1.2, M.lake + 2.6 + h0 * 1.2); v.scale.setScalar(Math.max(.001, k)); v.visible = k > .01; v.position.y = hgt(v.position.x, v.position.z, 1 - g) });
    GROUPS.forEach((grpA, i) => { const m = M['an' + i] ?? (M.animals + 2 + i); grpA.forEach((a, j) => { const k = sr(t, m - .4 + j * .15, m + .2 + j * .15); a.visible = k > .01 && g > .5; const s = a.userData.s * ss(k);
      a.scale.setScalar(Math.max(.001, s)); const yb = a.userData.kind == 'hippo' ? -.35 : hgt(a.position.x, a.position.z, 1 - g); a.position.y = yb + (a.userData.kind == 'hippo' ? Math.sin(t * 1.5 + j) * .05 : 0) }) });
    TOOLS.forEach(m => { const k = sr(t, M.tools + .5 + m.userData.d * 2.4, M.tools + .8 + m.userData.d * 2.4); m.visible = k > .01; m.position.y = hgt(m.position.x, m.position.z, 1 - g) + .06 + (1 - k) * 1.5 });
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .2 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .7);
    const O = { tag: .95, title: win(t, .45, M.today - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: g > .5 ? 'rgba(80,200,140,.08)' : 'rgba(255,170,60,.10)',
      black: 1 - ramp(t, 0, .3), white: Math.max(win(t, M.lake + .2, M.lake + 1.0, .3, .5) * .7, ...[M.animals, M.tools, M.poison, M.green].map(m => win(t, m - .02, m + .16, .02, .14) * .3)),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿TE LO<br>IMAGINABAS?', qs: 150, cta: 'COMENTÁ  SÍ  o  NO', nxt: 'Seguime para más <i>curiosidades</i>' } : null };
    overlay(t, O);
  };
}

// ==================================================================================== PART 3 — SPACE / DWARF PLANET
if (P == 3) {
  scene.background = new THREE.Color(0x03040c); scene.fog = null; hemi.color.setHex(0x8090c0); hemi.groundColor.setHex(0x101018); hemi.intensity = .9; R.toneMappingExposure = 1.2;
  { const N = 4000, p = new Float32Array(N * 3), c = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const band = i < 1600; const u = hash(i * 1.3), v = hash(i * 2.7); let th = u * 2 * PI, ph = Math.acos(2 * v - 1); if (band) ph = PI / 2 + (hash(i * 5.1) - .5) * .35;
      const r = 150; const q = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)).applyAxisAngle(V(1, 0, 0), .9); p[i * 3] = q.x * r; p[i * 3 + 1] = q.y * r; p[i * 3 + 2] = q.z * r; const w = .6 + hash(i * 9) * .4; c[i * 3] = w; c[i * 3 + 1] = w * (.9 + hash(i) * .1); c[i * 3 + 2] = w }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(c, 3)); scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.1, map: radT, vertexColors: true, transparent: true, depthWrite: false, fog: false }))) }
  const sunP = V(-1, .3, .55).normalize().multiplyScalar(140);
  glowSprite(scene, 0xfff0c0, 9, sunP.x, sunP.y, sunP.z); glowSprite(scene, 0xffc070, 26, sunP.x, sunP.y, sunP.z).material.opacity = .5;
  const sunL = new THREE.DirectionalLight(0xfff2dc, 3.0); sunL.position.copy(sunP); scene.add(sunL);
  const plutoT = tex(512, 256, (g, w, h) => { g.fillStyle = '#c9a888'; g.fillRect(0, 0, w, h); blot(g, w, h, 70, .45, '120,80,60', 70); blot(g, w, h, 40, .4, '240,225,205', 60); speck(g, w, h, 4000, .2, '60,40,30') });
  const edT = tex(512, 256, (g, w, h) => { g.fillStyle = '#9a6f62'; g.fillRect(0, 0, w, h); blot(g, w, h, 80, .45, '70,50,50', 50); blot(g, w, h, 30, .35, '200,170,150', 40); for (let i = 0; i < 60; i++) { const x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 12; g.strokeStyle = 'rgba(40,25,25,.4)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke() } });
  const PLUTO = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({ map: plutoT, roughness: .9 })); scene.add(PLUTO);
  const ED = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({ map: edT, roughness: .95, emissive: 0x120806 })); scene.add(ED);
  const NEP = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshStandardMaterial({ color: 0x3a6ae0, roughness: .6, emissive: 0x08142a })); scene.add(NEP); NEP.position.set(16, -7, -55); 
  const edGlow = glowSprite(scene, 0xff9a7a, 3, 0, 0, 0); edGlow.material.opacity = 0;
  const ROCKS = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), mat(0x8a8078), 500); const dm = new THREE.Object3D(); const RK = [];
  for (let i = 0; i < 500; i++) RK.push([hash(i * 1.9) * 2 * PI, 18 + hash(i * 3.1) * 28, (hash(i * 4.7) - .5) * 5, .05 + hash(i * 6.3) * .22]); scene.add(ROCKS);
  const discT = tex(512, 512, (g) => { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 3; for (let r = 30; r < 256; r += 28) { g.beginPath(); g.arc(256, 256, r, 0, 7); g.stroke() } for (let a = 0; a < 12; a++) { g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.cos(a * PI / 6) * 250, 256 + Math.sin(a * PI / 6) * 250); g.stroke() } });
  const planeM = new THREE.MeshBasicMaterial({ color: 0x3aa0ff, map: discT, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const EDP = V(0, 0, -12), PLP = V(-7, -.5, -16);
  const disc = add(scene, new THREE.CircleGeometry(9, 64), planeM, EDP.x, EDP.y, EDP.z); disc.rotation.x = -PI / 2;
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffb080, transparent: true, opacity: 0, depthWrite: false, fog: false });
  const ring = add(scene, new THREE.TorusGeometry(7, .05, 8, 160), ringM, EDP.x, EDP.y, EDP.z);
  ED.position.copy(EDP); PLUTO.position.copy(PLP);
  makePanel(V(5.2, 1.0, -4), -.5, 3.4, 0x6ad8ff, 0x3a8aff);
  function draw(t) {
    const cy = '#8fd8ff';
    if (t < M.found) { bgS(t, '#060a1e', '#0e1840', 'rgba(140,200,255,.07)'); txt('PLANETAS ENANOS', 360, 80, 46, cy); txt('OFICIALES', 360, 135, 38, 'rgba(255,255,255,.75)');
      const nm = ['PLUTÓN', 'CERES', 'ERIS', 'HAUMEA', 'MAKEMAKE'], col = ['#d8b898', '#9a9a9a', '#e8e8f0', '#d8d0c8', '#c88a6a'];
      nm.forEach((n, i) => { const m = M['dw' + i] ?? 99; const a = sr(t, m - .15, m + .2); const x = i < 3 ? 130 + i * 230 : 245 + (i - 3) * 230, y = i < 3 ? 300 : 530; sg.globalAlpha = .25 + .75 * a; sg.fillStyle = col[i]; sg.beginPath(); sg.arc(x, y - 30, 52 * (.8 + .2 * a), 0, 7); sg.fill(); txt(n, x, y + 60, 34, '#fff'); sg.globalAlpha = 1 });
      txt('5', 650, 90, 90, '#ffd95a', { glow: '#ffb000' }) }
    else if (t < M.dist) { bgS(t, '#0a0620', '#1e0e40', 'rgba(200,150,255,.07)'); txt('NUEVO CANDIDATO', 360, 80, 48, '#ffb090');
      const k = sr(t, M.found + 3.2, M.found + 4.0); txt('2026', 360, 190, 90, '#fff'); txt('ED138', 360, 300, 140 * (.75 + .25 * k), '#fff', { glow: '#ff7a5a', blur: 40 });
      sg.fillStyle = '#2a2450'; sg.beginPath(); sg.moveTo(80, 640); sg.lineTo(300, 470); sg.lineTo(420, 540); sg.lineTo(640, 640); sg.fill(); sg.fillStyle = '#e8e8f0'; sg.beginPath(); sg.arc(300, 486, 40, PI, 0); sg.fill(); sg.fillRect(260, 486, 80, 22);
      pill('OBSERVATORIO VERA RUBIN · CHILE', 360, 670, '#5a3ab0', '#fff', 28) }
    else if (t < M.size) { bgS(t, '#060a1e', '#0e1840', 'rgba(140,200,255,.07)'); txt('DISTANCIA AL SOL', 360, 70, 44, cy); txt('(1 = TIERRA–SOL)', 360, 120, 30, 'rgba(255,255,255,.65)');
      const k = ss(ramp(t, M.dist + .6, M.dist + 3.0)), k2 = ss(ramp(t, Ln.c3.end - 2.4, Ln.c3.end - 1.2));
      [['TIERRA', 1, '#5ab0ff', 1], ['PLUTÓN', 40, '#d8b898', k2], ['ED138', 46, '#ff9a7a', k]].forEach(([n, v, c, kk], i) => { const y = 250 + i * 160; txt(n, 70, y - 45, 38, '#fff', { a: 'left' }); txt(fmt(v * cl(kk)), 650, y - 45, 56, c, { a: 'right' }); bar(70, y, 580, 40, v / 46 * kk, c) }) }
    else if (t < M.tilt) { bgS(t, '#060a1e', '#0e1840', 'rgba(140,200,255,.07)'); txt('TAMAÑO (DIÁMETRO)', 360, 70, 44, cy); const k = ss(ramp(t, M.size + .4, M.size + 2.6)), k2 = sr(t, Ln.c4.end - 2.0, Ln.c4.end - 1.2);
      sg.globalAlpha = .9; sg.fillStyle = '#d8b898'; sg.beginPath(); sg.arc(200, 340, Math.max(.1, 160 * k2), 0, 7); sg.fill(); sg.globalAlpha = 1; if (k2 > .1) { txt('PLUTÓN', 200, 560, 40, '#fff'); txt('≈ 2.400 km', 200, 615, 36, '#d8b898') }
      sg.setLineDash([10, 8]); sg.strokeStyle = '#ff9a7a'; sg.lineWidth = 4; sg.beginPath(); sg.arc(530, 340, Math.max(.1, 101 * k), 0, 7); sg.stroke(); sg.setLineDash([]); sg.fillStyle = '#ff9a7a'; sg.beginPath(); sg.arc(530, 340, Math.max(.1, 40 * k), 0, 7); sg.fill();
      txt('ED138', 530, 560, 40, '#fff'); txt('600 – 1.500 km', 530, 615, 34, '#ff9a7a') }
    else if (t < M.sixth) { bgS(t, '#060a1e', '#0e1840', 'rgba(140,200,255,.07)'); txt('ÓRBITA INCLINADA', 360, 80, 50, cy); const k = ss(ramp(t, M.tilt + .8, M.tilt + 3.2)); const a = 25 * PI / 180 * k;
      sg.strokeStyle = 'rgba(140,200,255,.8)'; sg.lineWidth = 6; sg.beginPath(); sg.moveTo(80, 440); sg.lineTo(640, 440); sg.stroke(); sg.strokeStyle = '#ff9a7a'; sg.lineWidth = 8; sg.beginPath(); sg.moveTo(160, 440); sg.lineTo(160 + 480 * Math.cos(a), 440 - 480 * Math.sin(a)); sg.stroke();
      sg.strokeStyle = '#ffd95a'; sg.lineWidth = 4; sg.beginPath(); sg.arc(160, 440, 170, -a, 0); sg.stroke(); txt(Math.round(25 * k) + '°', 420, 380 - 70 * k, 90, '#ffd95a', { glow: '#ffb000' });
      const k3 = sr(t, Ln.c5.end - 3.0, Ln.c5.end - 2.4); sg.globalAlpha = k3; pill('¿EMPUJÓN DE NEPTUNO?', 360, 600, '#2a5ac0', '#fff', 42); sg.globalAlpha = 1 }
    else { bgS(t, '#0a0620', '#1e0e40', 'rgba(200,150,255,.07)'); txt('FALTA CONFIRMAR', 360, 90, 50, cy); txt('CON INFRARROJO', 360, 150, 40, 'rgba(255,255,255,.75)');
      txt('¿6.º', 360, 320, 160, '#fff', { glow: '#ff7a5a', blur: 40 }); txt('PLANETA ENANO?', 360, 450, 62, '#ffb090'); stampMark('CANDIDATO', 360, 600, ramp(t, Ln.c6.end - .5, Ln.c6.end + .1), '#ffd95a', -.1, 60) }
    scanlines(.07); frameEdge('rgba(140,200,255,.6)');
  }
  const K = path([[0, [2.6, 1.0, -6.4], [0, 0, -12], 50], [M.title - .2, [1.4, .8, -7.6], [0, .1, -12], 48], [M.title + .6, [-1, 2, -2], [-2, 0, -13], 58],
    pv(M.five + .1, 2.0, -.6, 60), pv(M.five + .5, 1.72, 0, 60), pv(M.found - .3, 1.65, 0, 60), [M.found + .05, [1.8, 1.4, -6.5], [0, 0, -12], 52], [M.found + 3.4, [.9, .6, -8.2], [0, 0, -12], 46],
    pv(M.found + 3.6, 1.85, .4, 60), pv(M.dist - .3, 1.7, 0, 60), pv(M.dist + .05, 1.8, -.3, 60), pv(M.size - .3, 1.7, 0, 60),
    [M.size + .05, [-3.5, 1.0, 6], [-3.5, -.3, -14], 54], [M.size + 2.6, [-3.5, .8, 3], [-3.5, -.3, -14], 52], pv(M.size + 2.8, 1.85, 0, 60), pv(M.tilt - .3, 1.72, 0, 60),
    [M.tilt + .05, [-9, 6, 0], [0, 0, -12], 58], [M.tilt + 3.6, [-11, 3, -4], [1, -.5, -14], 56], [M.sixth - .3, [-7, 1.5, -3], [0, 0, -12], 54], pv(M.sixth + .05, 1.85, 0, 60), pv(M.endcard, 1.7, 0, 60),
    [M.endcard + .5, [2, 1.2, -5], [0, 0, -12], 56], [C.dur, [1, .6, -8.2], [0, 0, -12], 46]]);
  frame = function (t) {
    ED.rotation.y = t * .25; PLUTO.rotation.y = t * .15; ED.scale.setScalar(1.05); PLUTO.scale.setScalar(2.4);
    for (let i = 0; i < 500; i++) { const [a, r, y, s] = RK[i]; const aa = a + t * .01; dm.position.set(Math.cos(aa) * r, y, Math.sin(aa) * r - 20); dm.rotation.set(t * .3 + i, t * .2 + i * 2, 0); dm.scale.setScalar(s); dm.updateMatrix(); ROCKS.setMatrixAt(i, dm.matrix) } ROCKS.instanceMatrix.needsUpdate = true;
    const tk = win(t, M.tilt, M.sixth + .2, .6, .6); planeM.opacity = tk * .35; ringM.opacity = tk * .9; ring.rotation.set(PI / 2 - 25 * PI / 180 * ss(ramp(t, M.tilt + .8, M.tilt + 3.2)), 0, 0);
    NEP.visible = t > Ln.c5.end - 3.2; NEP.scale.setScalar(7 * sr(t, Ln.c5.end - 3.2, Ln.c5.end - 2.2) + .01); edGlow.position.copy(EDP); edGlow.material.opacity = win(t, M.found + 3.4, M.found + 6, .3, .6) * .6;
    draw(t); scrT.needsUpdate = true; PANEL.gl.material.opacity = .22 + .06 * Math.sin(t * 3);
    setCam(evalPath(K, t), t, .6);
    const O = { tag: .95, title: win(t, .45, M.five - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 330, grain: .04, tint: 'rgba(90,120,255,.08)',
      black: 1 - ramp(t, 0, .3), white: [M.found, M.dist, M.size, M.tilt, M.sixth].reduce((a, m) => Math.max(a, win(t, m - .02, m + .16, .02, .14) * .3), 0),
      end: t > M.endcard ? { k: t - M.endcard, q: '¿QUÉ NOMBRE<br>LE PONDRÍAS?', qs: 130, cta: 'COMENTÁ  TU  NOMBRE', nxt: 'Seguime para más <i>espacio</i>' } : null };
    overlay(t, O);
  };
}
run([null, frame, frame, frame]);

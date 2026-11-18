// GTA 6 — dos shorts explicativos (p1: 13 años, p2: cuánto costó). Ciudad costera ficticia al atardecer, sin material del juego.
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P1 = PART == 1;
init({ tag: '', title: P1 ? '13 AÑOS' : '¿CUÁNTO<br>COSTÓ?', titleSize: P1 ? 230 : 190, spk: { n: ['#ffd95a', '', 0], q: ['#ff6ad5', '', 0] } });
document.getElementById('tag').innerHTML = P1 ? 'GTA 6<b>¿POR QUÉ 13 AÑOS?</b>' : 'GTA 6<b>¿CUÁNTO COSTÓ?</b>';
document.querySelector('#title .p i').textContent = P1 ? '¿POR QUÉ TARDÓ TANTO?' : 'NADIE LO DICE';
rig.visible = false;
document.getElementById('sub').style.top = '1400px'; document.getElementById('who').style.top = '1340px';
// ------------------------------------------------------------------ sky, light
const SKY = tex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1b0f3f'); gr.addColorStop(.32, '#5a1d6e'); gr.addColorStop(.52, '#c7356f'); gr.addColorStop(.66, '#ff7a45'); gr.addColorStop(.74, '#ffc06a'); gr.addColorStop(1, '#ffd890'); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
SKY.wrapS = SKY.wrapT = THREE.ClampToEdgeWrapping;
const skyM = new THREE.MeshBasicMaterial({ map: SKY, side: THREE.BackSide, fog: false, depthWrite: false });
const skyS = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 24, 0, 2 * PI, 0, PI * .62), skyM); scene.add(skyS);
{ const uv = skyS.geometry.attributes.uv, pos = skyS.geometry.attributes.position; for (let i = 0; i < uv.count; i++) { const y = pos.getY(i) / 180; uv.setY(i, cl(1 - (1 - y) * .95 - .02)) } }
scene.background = new THREE.Color(0xffb070); scene.fog = new THREE.Fog(0xf08a6a, 40, 175);
hemi.color.setHex(0xffd6c0); hemi.groundColor.setHex(0x4a2c5a); hemi.intensity = 1.25;
const sun = new THREE.DirectionalLight(0xffb27a, 2.4); sun.position.set(-20, 18, -60); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 }); scene.add(sun); scene.add(sun.target); sun.target.position.set(0, 0, -10);
R.toneMappingExposure = 1.08;
const SUNT = tex(512, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(.55, '#ff9a3c'); gr.addColorStop(1, '#ff3d7f'); g.fillStyle = gr; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 7; i++) { const y = 290 + i * 30, hh = 4 + i * 3; g.fillRect(0, y, w, hh) } });
const sunD = add(scene, new THREE.PlaneGeometry(46, 46), new THREE.MeshBasicMaterial({ map: SUNT, transparent: true, fog: false, depthWrite: false }), -25, 14, -165); sunD.lookAt(0, 8, 0);
glowSprite(scene, 0xff9a50, 110, -25, 14, -160);
// ------------------------------------------------------------------ ground: ocean, beach, road, sidewalk
T.sea = tex(256, 256, (g, w, h) => { g.fillStyle = '#1d5f7e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,${180 + Math.random() * 60 | 0},150,${Math.random() * .5})`; g.fillRect(Math.random() * w, Math.random() * h, 6 + Math.random() * 22, 2) } }, 30, 30);
const sea = add(scene, new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ map: T.sea, emissive: 0x16304a }), -205, -.05, -60, 2); sea.rotation.x = -PI / 2;
T.sand = tex(256, 256, (g, w, h) => { g.fillStyle = '#e8c49a'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .18, '120,80,40') }, 6, 60);
const sand = add(scene, new THREE.PlaneGeometry(6, 400), mat(0xffffff, { map: T.sand }), -7.5, 0, -60, 2); sand.rotation.x = -PI / 2;
T.road = tex(256, 512, (g, w, h) => { g.fillStyle = '#34323a'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .25, '255,255,255'); g.fillStyle = '#f2f2f2'; g.fillRect(6, 0, 8, h); g.fillRect(w - 14, 0, 8, h); g.fillStyle = '#ffd34a'; g.fillRect(w / 2 - 9, 0, 6, h); g.fillRect(w / 2 + 3, 0, 6, h); g.fillStyle = '#e8e8e8'; for (const x of [w * .25, w * .75]) for (let y = 0; y < h; y += 128) g.fillRect(x - 3, y, 6, 64) }, 1, 40);
const road = add(scene, new THREE.PlaneGeometry(9, 400), mat(0xffffff, { map: T.road }), 0, .01, -60, 2); road.rotation.x = -PI / 2;
T.walk = tex(128, 128, (g, w, h) => { g.fillStyle = '#d9c7b8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,60,60,.35)'; g.lineWidth = 3; g.strokeRect(0, 0, 64, 64); g.strokeRect(64, 64, 64, 64) }, 4, 200);
const walkP = add(scene, new THREE.PlaneGeometry(5, 400), mat(0xffffff, { map: T.walk }), 7, .06, -60, 2); walkP.rotation.x = -PI / 2;
box(scene, .3, .15, 400, mat(0xbdb3a8), 4.5, .07, -60);
// ------------------------------------------------------------------ palms
const trunkM = mat(0x8a6240), frondM = new THREE.MeshLambertMaterial({ color: 0x2f7d4a, side: THREE.DoubleSide });
const frondG = new THREE.PlaneGeometry(3.2, .7, 6, 1); { const p = frondG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + 1.6; p.setY(i, p.getY(i) * (1 - x / 3.6)); p.setZ(i, -x * x * .12) } frondG.translate(0, 0, 0); frondG.computeVertexNormals() }
const PALMS = [];
function palm(x, z, h, s) { const g = grp(scene); g.position.set(x, 0, z); const segs = 7; let px = 0, py = 0; for (let i = 0; i < segs; i++) { const k = i / segs, y = h * k, xx = Math.sin(k * 1.4) * .9 * s; const m = add(g, G.cyl, trunkM, xx, y + h / segs / 2, 0, 1); m.scale.set(.22 - k * .07, h / segs * 1.02, .22 - k * .07); m.rotation.z = -Math.cos(k * 1.4) * .14 * s; px = xx; py = y }
  const top = grp(g); top.position.set(Math.sin(1.4) * .9 * s, h, 0); const fr = []; for (let i = 0; i < 9; i++) { const f = add(top, frondG, frondM, 0, 0, 0, 1); f.rotation.set(-.15 - (i % 2) * .25, i * 2 * PI / 9, 0, 'YXZ'); f.position.set(0, 0, 0); f.translateX(1.6); fr.push(f) } sph(top, .3, mat(0x5a3a1c), 0, 0, 0); g.userData = { top, seed: x * 3.1 + z }; PALMS.push(g) }
for (let z = 6; z > -150; z -= 9) { palm(-5.2, z, 7 + hash(z) * 2.5, 1); palm(5.4, z - 4.5, 7.5 + hash(z + 3) * 2.5, -1) }
// ------------------------------------------------------------------ buildings (art-deco pastel + neon)
const pastel = [0xf6b8c8, 0x9fe0d8, 0xf7e2a8, 0xc9b8f2, 0xffd0a8, 0xb8e6ff, 0xf2a6b8];
const winT = tex(128, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let y = 12; y < h; y += 32) for (let x = 10; x < w; x += 30) { g.fillStyle = Math.random() < .3 ? '#ffd98a' : '#5b6f8a'; g.fillRect(x, y, 18, 20) } }, 1, 1);
const neonC = [0xff3fa4, 0x2ef0ff, 0xffe14a, 0x9b5cff];
function bldg(x, z, w, d, h, i) { const g = grp(scene); g.position.set(x, 0, z); const t = winT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, w / 3), Math.max(1, h / 6));
  const body = box(g, w, h, d, new THREE.MeshLambertMaterial({ color: pastel[i % pastel.length], map: t }), 0, h / 2, 0, 3);
  box(g, w * 1.04, .4, d * 1.04, mat(0xffffff), 0, h + .2, 0, 1); if (i % 3 == 0) box(g, w * .5, h * .18, d * .5, mat(pastel[(i + 2) % 7]), 0, h + h * .09 + .4, 0, 1);
  const nm = basic(neonC[i % 4]); box(g, w * 1.02, .12, .12, nm, 0, h * .35, d / 2 + .05, 0); box(g, .12, h, .12, nm, -w / 2 - .02, h / 2, d / 2 + .02, 0); return g }
let bi = 0; for (let z = 4; z > -150; z -= 11) { const w = 6 + hash(z) * 4, h = 8 + hash(z * 1.7) * 14; bldg(12 + w / 2 - 3, z, w, 8, h, bi++) }
for (let k = 0; k < 18; k++) { const z = -40 - k * 9, h = 25 + hash(k * 5.3) * 45, w = 6 + hash(k) * 6; bldg(24 + hash(k * 2.1) * 30, z, w, w, h, bi++) }
// ------------------------------------------------------------------ cars
const CARS = []; const carCols = [0xff4f7b, 0x2ec4ff, 0xfff1d0, 0xffb43a, 0x7c5cff, 0x24d6a0, 0xffffff, 0xe23b3b];
for (let i = 0; i < 10; i++) { const g = grp(scene), dir = i % 2 ? 1 : -1; box(g, 1.8, .55, 4.2, mat(carCols[i % 8]), 0, .55, 0, 1); box(g, 1.6, .5, 2.0, mat(0x1d2633), 0, 1.05, -.2, 1);
  for (const [wx, wz] of [[-.85, 1.3], [.85, 1.3], [-.85, -1.3], [.85, -1.3]]) { const wh = add(g, G.cyl, mat(0x111111), wx, .32, wz, 1); wh.scale.set(.32, .25, .32); wh.rotation.z = PI / 2 }
  for (const s of [-1, 1]) { box(g, .3, .15, .05, basic(0xfff6d8), s * .65, .62, -2.11, 0); box(g, .3, .12, .05, basic(0xff2030), s * .65, .62, 2.11, 0) }
  g.userData = { dir, lane: dir < 0 ? -1.15 - (i % 4 == 0 ? 2.2 : 0) : 1.15 + (i % 4 == 1 ? 2.2 : 0), off: hash(i * 7.7) * 160, v: 9 + hash(i * 3.3) * 6 }; g.rotation.y = dir < 0 ? 0 : PI; CARS.push(g) }
// ------------------------------------------------------------------ gantry billboard over the road
const BZ = -16, BY = 7.6, BW = 6.4, BH = 6.4;
const scr = document.createElement('canvas'); scr.width = 720; scr.height = 720; const sg = scr.getContext('2d');
const scrT = new THREE.CanvasTexture(scr); scrT.colorSpace = THREE.SRGBColorSpace; scrT.anisotropy = 8;
const BB = grp(scene); BB.position.set(0, 0, BZ);
for (const s of [-1, 1]) { box(BB, .35, BY + BH / 2 + .3, .35, mat(0x2a2a33), s * (BW / 2 + .4), (BY + BH / 2 + .3) / 2, 0, 1) }
box(BB, BW + 1.2, BH + .6, .5, mat(0x18161f), 0, BY, -.3, 1);
const scrMesh = add(BB, new THREE.PlaneGeometry(BW, BH), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false }), 0, BY, -.03);
const frameNeon = basic(0xff3fa4); for (const [w, h, x, y] of [[BW + .5, .1, 0, BY + BH / 2 + .25], [BW + .5, .1, 0, BY - BH / 2 - .25], [.1, BH + .5, -BW / 2 - .25, BY], [.1, BH + .5, BW / 2 + .25, BY]]) box(BB, w, h, .1, frameNeon, x, y, .0, 0);
const bbGlow = glowSprite(BB, 0xff60c0, 13, 0, BY, -.6); bbGlow.material.opacity = .35;
const scrL = new THREE.PointLight(0xff8ad8, 6, 14, 1.6); scrL.position.set(0, BY, 2); BB.add(scrL);
// ------------------------------------------------------------------ money, coins, fireworks
T.cash = tex(256, 128, (g, w, h) => { g.fillStyle = '#5c8f55'; g.fillRect(0, 0, w, h); g.fillStyle = '#86b77a'; for (let y = 0; y < h; y += 10) g.fillRect(0, y, w, 6); g.fillStyle = '#d7c49a'; g.fillRect(w / 2 - 14, 0, 28, h) }, 1, 1);
const cashM = mat(0xffffff, { map: T.cash }), palletM = mat(0x8a6a44);
const STACKS = []; for (const [x, z] of [[-2.6, -12.5], [2.6, -12.5], [-1.3, -11.3], [1.3, -11.3], [0, -12.8]]) { const g = grp(scene); g.position.set(x, 0, z); box(g, 1.4, .15, 1.1, palletM, 0, .075, 0, 3); const c = box(g, 1.2, 1, .9, cashM, 0, .65, 0, 3); g.userData.c = c; STACKS.push(g) }
const coinG = new THREE.CylinderGeometry(.22, .22, .05, 20), coinM = new THREE.MeshLambertMaterial({ color: 0xffc83a, emissive: 0x6a4200 });
const COINS = []; for (let i = 0; i < 70; i++) { const m = add(scene, coinG, coinM, 0, 0, 0, 1); m.userData = { x: (hash(i * 1.3) - .5) * 9, z: BZ + 2 + (hash(i * 2.9) - .5) * 9, ph: hash(i * 5.1), sp: 3 + hash(i * 7.7) * 2, rx: hash(i) * 6, ry: hash(i + 1) * 6 }; COINS.push(m) }
const FW = []; const fwCols = [0xff4fd8, 0x4ff0ff, 0xffe14a, 0xff6a3d, 0x9b6bff];
for (let f = 0; f < 7; f++) { const g = grp(scene); g.userData = { c: V(-14 + hash(f * 3.3) * 40, 16 + hash(f * 1.9) * 12, -40 - hash(f * 4.4) * 50), dt: f * .55 + hash(f) * .3 }; const col = fwCols[f % 5];
  g.userData.sp = []; for (let i = 0; i < 46; i++) { const s = glowSprite(g, col, 1.4, 0, 0, 0); const u = hash(i * 1.7 + f), v = hash(i * 2.3 + f * 3); const th = u * 2 * PI, ph = Math.acos(2 * v - 1); s.userData.d = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)); g.userData.sp.push(s) }
  g.userData.trail = glowSprite(g, 0xfff0c0, 1.2, 0, 0, 0); FW.push(g) }
function fireworks(t, t0, on) { for (const g of FW) { const u = g.userData, lt = t - t0 - u.dt; g.visible = on && lt > 0 && lt < 3.2; if (!g.visible) continue; const c = u.c;
  if (lt < .7) { const k = lt / .7; u.trail.visible = true; u.trail.position.set(c.x, lerp(0, c.y, ss(k)), c.z); for (const s of u.sp) s.visible = false }
  else { u.trail.visible = false; const k = lt - .7, r = 7 * (1 - Math.exp(-k * 2.2)); for (const s of u.sp) { s.visible = true; s.position.set(c.x + s.userData.d.x * r, c.y + s.userData.d.y * r - k * k * .8, c.z + s.userData.d.z * r); s.material.opacity = cl(1 - k / 2.5); s.scale.setScalar(1.6 * (1 - k / 3.2) + .3) } } } }
// ------------------------------------------------------------------ billboard drawing helpers
const F = (s, w = 900) => `${w} ${s}px Inter, sans-serif`;
function txt(s, x, y, size, col, o = {}) { sg.save(); sg.font = F(size, o.w || 900); sg.textAlign = o.a || 'center'; sg.textBaseline = 'middle'; if (o.glow) { sg.shadowColor = o.glow; sg.shadowBlur = o.blur || 30 } if (o.stroke) { sg.lineWidth = o.stroke; sg.strokeStyle = '#000'; sg.strokeText(s, x, y) } sg.fillStyle = col; sg.fillText(s, x, y); sg.restore() }
function bgScreen(t, c1 = '#1a0b2e', c2 = '#3b0d4f') { const gr = sg.createLinearGradient(0, 0, 0, 720); gr.addColorStop(0, c1); gr.addColorStop(1, c2); sg.fillStyle = gr; sg.fillRect(0, 0, 720, 720);
  sg.strokeStyle = 'rgba(255,80,200,.18)'; sg.lineWidth = 2; for (let i = 0; i < 12; i++) { const y = 520 + i * i * 2.2 + ((t * 30) % 20); sg.beginPath(); sg.moveTo(0, y); sg.lineTo(720, y); sg.stroke() } for (let i = -8; i <= 8; i++) { sg.beginPath(); sg.moveTo(360 + i * 30, 520); sg.lineTo(360 + i * 140, 720); sg.stroke() } }
function scanlines(a = .12) { sg.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < 720; y += 4) sg.fillRect(0, y, 720, 2) }
function pill(s, x, y, col, tc = '#fff', size = 40) { sg.font = F(size); const w = sg.measureText(s).width + 50; sg.fillStyle = col; sg.beginPath(); sg.roundRect(x - w / 2, y - size * .75, w, size * 1.5, 16); sg.fill(); txt(s, x, y + 2, size, tc) }
function bar(x, y, w, h, k, col) { sg.fillStyle = 'rgba(255,255,255,.12)'; sg.beginPath(); sg.roundRect(x, y, w, h, h / 2); sg.fill(); sg.fillStyle = col; sg.shadowColor = col; sg.shadowBlur = 20; sg.beginPath(); sg.roundRect(x, y, Math.max(h, w * k), h, h / 2); sg.fill(); sg.shadowBlur = 0 }
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function stampMark(s, x, y, k, col = '#ff2a3a', rot = -.18) { if (k <= 0) return; sg.save(); sg.translate(x, y); sg.rotate(rot); const sc = 1 + (1 - ss(cl(k * 3))) * 1.2; sg.scale(sc, sc); sg.globalAlpha = cl(k * 4); sg.strokeStyle = col; sg.lineWidth = 9; sg.font = F(64); const w = sg.measureText(s).width + 44; sg.strokeRect(-w / 2, -48, w, 96); txt(s, 0, 4, 64, col); sg.restore() }
function clapper(x, y, s) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = '#eee'; sg.fillRect(-60, -20, 120, 80); sg.fillStyle = '#222'; sg.fillRect(-56, -16, 112, 72); sg.save(); sg.translate(-60, -24); sg.rotate(-.25); sg.fillStyle = '#eee'; sg.fillRect(0, -18, 124, 20); sg.fillStyle = '#222'; for (let i = 0; i < 5; i++) sg.fillRect(8 + i * 24, -18, 12, 20); sg.restore(); sg.restore() }
// ------------------------------------------------------------------ billboard content per part
function draw1(t) {
  if (t < M.money) { bgScreen(t); const k = sr(t, M.y2013, M.y2013 + .5); txt('SEPTIEMBRE', 360, 150, 56, '#ffd95a', { glow: '#ffb000' }); txt('2013', 360, 330, 230 * (.8 + .2 * k), '#fff', { glow: '#ff3fa4', blur: 40 }); pill('SALE GTA 5', 360, 530, '#ff3fa4', '#fff', 46); stampMark('LANZAMIENTO', 360, 640, ramp(t, M.y2013 + 1.4, M.y2013 + 2.2), '#2ef0ff', -.08) }
  else if (t < Ln.a3.start) { bgScreen(t, '#0b2318', '#0f3d2a'); const k = ss(ramp(t, M.money + .5, Ln.a2.end - .4)); txt('COPIAS VENDIDAS', 360, 120, 46, '#9dffc6'); txt('+' + fmt(220 * k), 360, 300, 210, '#fff', { glow: '#2bff88', blur: 40 }); txt('MILLONES', 360, 450, 64, '#2bff88', { glow: '#2bff88' }); bar(80, 560, 560, 46, k, '#2bff88'); txt('GTA 5 · 2013 → HOY', 360, 660, 34, 'rgba(255,255,255,.8)', { w: 700 }) }
  else if (t < M.leak) { bgScreen(t, '#0b2318', '#163b10'); txt('MODO ONLINE', 360, 110, 58, '#ffe14a', { glow: '#ffb000' }); const k = ss(ramp(t, Ln.a3.start, Ln.a3.end));
    sg.strokeStyle = '#2bff88'; sg.lineWidth = 12; sg.shadowColor = '#2bff88'; sg.shadowBlur = 24; sg.beginPath(); for (let i = 0; i <= 40 * k; i++) { const x = 70 + i * 14.5, y = 560 - i * 8.5 - Math.sin(i * .9) * 22; i ? sg.lineTo(x, y) : sg.moveTo(x, y) } sg.stroke(); sg.shadowBlur = 0;
    for (let i = 0; i < 9; i++) { const y = ((t * 120 + i * 90) % 720) - 40; txt('$', 80 + i * 70, y, 60, 'rgba(255,225,74,.35)') } pill('PLATA TODOS LOS AÑOS', 360, 650, '#ffe14a', '#1a1300', 40) }
  else if (t < M.trailer) { const gl = hash(Math.floor(t * 14)) > .7; bgScreen(t, '#2a0306', '#4a0710'); txt('FILTRACIÓN', 360 + (gl ? 12 : 0), 120, 96, '#ff2a3a', { glow: '#ff0020', blur: 36 }); txt('SEPTIEMBRE 2022', 360, 210, 42, '#fff');
    const n = Math.floor(cl(ramp(t, M.leak + .3, M.leak + 3.2)) * 20); for (let i = 0; i < 20; i++) { if (i >= n) break; const x = 70 + (i % 5) * 120, y = 280 + Math.floor(i / 5) * 78; sg.fillStyle = hash(i + Math.floor(t * 8)) > .85 ? '#ff3a4a' : '#3a2a35'; sg.fillRect(x, y, 104, 62); sg.fillStyle = '#fff'; sg.beginPath(); sg.moveTo(x + 44, y + 18); sg.lineTo(x + 66, y + 31); sg.lineTo(x + 44, y + 44); sg.fill() }
    txt('+90 VIDEOS', 360, 640, 76, '#fff', { glow: '#ff2a3a' }); if (gl) { sg.fillStyle = 'rgba(255,0,40,.25)'; sg.fillRect(0, hash(t) * 700, 720, 30) } }
  else if (t < M.delay) { bgScreen(t, '#120a24', '#2a0d3a'); const k = ss(ramp(t, M.trailer + 2.6, M.trailer + 5.6)); txt('PRIMER TRÁILER · DIC 2023', 360, 100, 38, '#ffd95a');
    sg.fillStyle = '#ff2a3a'; sg.beginPath(); sg.roundRect(250, 150, 220, 150, 40); sg.fill(); sg.fillStyle = '#fff'; sg.beginPath(); sg.moveTo(335, 185); sg.lineTo(400, 225); sg.lineTo(335, 265); sg.fill();
    txt(fmt(90000000 * k), 360, 400, 104, '#fff', { glow: '#ff3fa4', blur: 30 }); txt('VISTAS EN 24 HORAS', 360, 500, 50, '#ff9ad8'); stampMark('RÉCORD', 360, 625, ramp(t, Ln.a6.end - 1.6, Ln.a6.end - .6), '#ffe14a', -.12) }
  else if (t < M.launch) { bgScreen(t, '#160b2a', '#2c0b3a'); txt('FECHA DE SALIDA', 360, 90, 44, '#ffd95a');
    const rows = [['2025', M.st0, 'ATRASADO'], ['MAYO 2026', M.st1, 'ATRASADO'], ['NOVIEMBRE 2026', M.st2, 'CONFIRMADO']];
    rows.forEach(([s, ts, st], i) => { const y = 210 + i * 170, a = sr(t, ts - 1.4, ts - .9), ok = i == 2; sg.globalAlpha = a; sg.fillStyle = ok ? 'rgba(43,255,136,.15)' : 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(60, y - 70, 600, 140, 22); sg.fill(); txt(s, 360, y - 6, ok ? 72 : 80, '#fff'); sg.globalAlpha = 1;
      if (t > ts) { if (!ok) { sg.strokeStyle = '#ff2a3a'; sg.lineWidth = 10; sg.beginPath(); sg.moveTo(90, y); sg.lineTo(90 + 540 * ss(cl((t - ts) * 4)), y); sg.stroke() } stampMark(st, ok ? 360 : 500, y + 30, ramp(t, ts, ts + .6), ok ? '#2bff88' : '#ff2a3a', ok ? -.06 : -.18) } }) }
  else { bgScreen(t, '#2a0b3a', '#5a0d4f'); const k = sr(t, M.launch + .2, M.launch + .8); txt('YA SALE', 360, 120, 70, '#ffd95a', { glow: '#ffb000' }); txt('19', 360, 330, 270 * (.7 + .3 * k), '#fff', { glow: '#ff3fa4', blur: 50 }); txt('NOVIEMBRE 2026', 360, 520, 62, '#2ef0ff', { glow: '#2ef0ff' }); pill('GTA 6', 360, 630, '#ff3fa4', '#fff', 52) }
  scanlines();
}
function draw2(t) {
  if (t < M.gta5) { bgScreen(t, '#241303', '#3d2405'); txt('GTA 6', 360, 150, 80, '#ffd95a', { glow: '#ffb000' }); txt('US$ ???', 360 + (hash(Math.floor(t * 10)) - .5) * 8, 360, 150, '#fff', { glow: '#ffb000', blur: 36 }); pill('PRESUPUESTO SECRETO', 360, 560, '#ff3fa4', '#fff', 40) }
  else if (t < M.gta6) { bgScreen(t, '#0b2318', '#0f3d2a'); txt('GTA 5 · 2013', 360, 110, 56, '#9dffc6'); const k = ss(ramp(t, M.gta5 + 3.0, M.gta5 + 4.6)); txt('US$ ' + fmt(265 * k), 360, 300, 150, '#fff', { glow: '#2bff88', blur: 36 }); txt('MILLONES', 360, 430, 64, '#2bff88'); txt('DESARROLLO + PUBLICIDAD', 360, 520, 36, 'rgba(255,255,255,.8)', { w: 800 }); bar(80, 590, 560, 40, .13 * k, '#2bff88'); txt('escala: 2.000 M', 640, 660, 26, 'rgba(255,255,255,.5)', { a: 'right', w: 600 }) }
  else if (t < M.movie) { bgScreen(t, '#241303', '#3d2405'); txt('GTA 6 · ESTIMADO', 360, 100, 52, '#ffd95a', { glow: '#ffb000' }); const k = ss(ramp(t, M.gta6 + 1.0, M.gta6 + 4.5)); txt('US$', 360, 210, 60, '#ffe7a0'); txt(fmt(1000 * Math.min(1, k * 2)) + ' – ' + fmt(2000 * k), 360, 320, 108, '#fff', { glow: '#ffb000', blur: 36 }); txt('MILLONES', 360, 430, 64, '#ffc83a'); bar(80, 520, 560, 40, .13, '#2bff88'); txt('GTA 5', 80, 600, 30, '#9dffc6', { a: 'left' }); bar(80, 630, 560, 40, k, '#ffc83a'); txt('GTA 6', 640, 600, 30, '#ffc83a', { a: 'right' }) }
  else if (t < M.ceo) { bgScreen(t, '#160b2a', '#2c0b3a'); txt('¿EL MÁS CARO', 360, 110, 64, '#fff'); txt('DE LA HISTORIA?', 360, 185, 64, '#ffd95a', { glow: '#ffb000' }); const k = ss(ramp(t, Ln.b3.start + 2.6, Ln.b3.start + 4.2));
    clapper(170, 320, 1.1); txt('PELÍCULAS', 170, 460, 34, '#ccc'); sg.fillStyle = '#8a8a9a'; sg.fillRect(110, 640 - 110 * k, 120, 110 * k);
    txt('GTA 6', 530, 300, 60, '#ffc83a', { glow: '#ffb000' }); sg.fillStyle = '#ffc83a'; sg.shadowColor = '#ffb000'; sg.shadowBlur = 24; sg.fillRect(470, 640 - 290 * k, 120, 290 * k); sg.shadowBlur = 0; txt('(estimado)', 530, 680, 26, 'rgba(255,255,255,.6)', { w: 600 }) }
  else if (t < M.record) { bgScreen(t, '#101018', '#22222e'); txt('EL JEFE DE TAKE-TWO', 360, 140, 44, '#c9d1da'); const k = sr(t, Ln.b4.end - 1.4, Ln.b4.end - .9); sg.globalAlpha = k; txt('“FUE CARO.”', 360, 360, 120, '#fff', { glow: '#ff3fa4', blur: 30 }); sg.globalAlpha = 1; txt('¿CUÁNTO? NO LO DIJO.', 360, 560, 46, '#ff9ad8') }
  else { bgScreen(t, '#241303', '#4a2a05'); txt('GTA 5 RECAUDÓ', 360, 100, 52, '#ffd95a'); const k = ss(ramp(t, M.record + 1.6, M.record + 4.1)); txt('US$ ' + fmt(1000 * k), 360, 270, 140, '#fff', { glow: '#ffb000', blur: 36 }); txt('MILLONES', 360, 390, 64, '#ffc83a'); pill('EN SOLO 3 DÍAS', 360, 500, '#ff3fa4', '#fff', 50); stampMark('RÉCORD MUNDIAL', 360, 630, ramp(t, M.record + 4.2, M.record + 4.9), '#2bff88', -.08) }
  scanlines();
}
// ------------------------------------------------------------------ camera paths
const EYE = (x, y, z) => [x, y, z], TG = [0, BY - 1.6, BZ];
const K = P1 ? path([[0, [-26, 14, 30], [10, 14, -90], 58], [M.title + .8, [-9, 9.5, 8], [6, 11, -70], 60], [M.y2013 - .25, [-6, 8, 4], [4, 9, -60], 60],
  [M.y2013 + .05, [0, 6.2, -3.5], TG, 62], [M.money - .3, [0, 5.9, -6.2], TG, 60], [M.money + .05, [3.2, 3.2, -3.8], [0, BY - 2.2, BZ], 64], [Ln.a3.start, [1.2, 4.2, -5.5], TG, 62],
  [Ln.a3.start + .3, [-4.2, 5.4, -4.5], [0, BY - 1.3, BZ], 60], [M.leak - .3, [-2, 5.8, -6.5], TG, 58], [M.leak + .05, [0, 5.6, -5.4], TG, 60], [M.trailer - .3, [0, 5.8, -7.0], TG, 56],
  [M.trailer + .05, [2.6, 5.0, -4.2], TG, 62], [M.delay - .3, [-1.2, 5.6, -6.2], TG, 58], [M.delay + .05, [0, 5.8, -4.0], TG, 62], [M.launch - .2, [0, 5.8, -6.3], TG, 58],
  [M.launch + 1.0, [0, 6.6, -1.5], [0, BY + .4, BZ - 4], 64], [C.dur, [0, 9.5, 6], [0, BY + 3, BZ - 20], 66]])
  : path([[0, [4, 2.2, -4], [0, 1.6, -13], 64], [M.title + .8, [0, 4.5, -2], [0, 4, -14], 62], [M.gta5 - .25, [0, 5.2, -1], TG, 62],
  [M.gta5 + .05, [0, 6.0, -3.6], TG, 62], [M.gta6 - .3, [0, 5.9, -6.0], TG, 60], [M.gta6 + .05, [-3.4, 3.4, -3.6], [0, BY - 2.0, BZ], 66], [M.movie - .3, [-1.2, 4.4, -5.6], TG, 62],
  [M.movie + .05, [3.6, 5.6, -4.6], [0, BY - 1.4, BZ], 60], [M.ceo - .3, [1.2, 5.8, -6.4], TG, 58], [M.ceo + .05, [0, 5.8, -3.8], TG, 62], [M.record - .3, [0, 5.8, -6.6], TG, 56],
  [M.record + .05, [-2.4, 4.6, -3.8], TG, 64], [M.record + 4.2, [0, 5.6, -5.0], TG, 62], [C.dur, [0, 8.5, 4], [0, BY + 2, BZ - 14], 66]]);
// ------------------------------------------------------------------ frame
function frame(t) {
  T.sea.offset.set(t * .01, t * .004);
  for (const p of PALMS) { const u = p.userData; u.top.rotation.z = Math.sin(t * 1.2 + u.seed) * .05; u.top.rotation.x = Math.sin(t * .9 + u.seed * 2) * .04 }
  for (const c of CARS) { const u = c.userData; const s = (t * u.v + u.off) % 180; c.position.set(u.lane, 0, u.dir < 0 ? 40 - s : -140 + s) }
  (P1 ? draw1 : draw2)(t); scrT.needsUpdate = true; bbGlow.material.opacity = .3 + .08 * Math.sin(t * 3);
  // money stacks
  const sk = P1 ? win(t, M.money + .4, Ln.a3.end, .6, .5) * 1.0 : Math.max(win(t, M.gta5 + 2.8, M.gta6, .5, .3) * .4, win(t, M.gta6 + 1.0, M.movie + .3, 1.5, .5) * 2.6, win(t, M.record + 1.5, C.dur + 1, 1.5, .3) * 1.6);
  STACKS.forEach((g, i) => { const h = Math.max(.001, sk * (1 + hash(i * 3.3) * .5)); g.visible = sk > .01; g.userData.c.scale.y = h; g.userData.c.position.y = .15 + h / 2 });
  const rain = P1 ? win(t, M.money + 1.4, Ln.a3.end, .4, .8) : Math.max(win(t, M.gta6 + 2.8, M.movie, .4, .8), win(t, M.record + 4.0, M.endcard + .5, .3, .8));
  for (const c of COINS) { const u = c.userData; c.visible = rain > .02; if (!c.visible) continue; const y = 13 - ((t * u.sp + u.ph * 13) % 13); c.position.set(u.x, y, u.z); c.rotation.set(u.rx + t * 5, u.ry + t * 3, 0); c.scale.setScalar(rain) }
  const fwOn = P1 ? t > M.launch + .5 : t > M.record + 4.0; fireworks(t, P1 ? M.launch + .8 : M.record + 4.0, fwOn);
  const c = evalPath(K, t); const cut = Object.values(M).some(m => t > m && t < m + .12);
  setCam(c, t, .8, 0, 0);
  const leakFx = P1 && t > M.leak - .2 && t < M.trailer - .2;
  const O = { tag: .95, title: win(t, .5, (P1 ? M.y2013 : M.gta5) - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 340, grain: .05, tint: leakFx ? 'rgba(255,30,60,.22)' : 'rgba(255,120,160,.10)',
    black: Math.max(1 - ramp(t, 0, .3), Math.max(...[P1 ? M.y2013 : M.gta5].map(m => win(t, m - .25, m + .12, .12, .12) * .8))),
    white: (P1 ? [M.money, M.leak, M.trailer, M.delay, M.st0, M.st1, M.st2] : [M.gta6, M.movie, M.ceo, M.record]).reduce((a, m) => Math.max(a, win(t, m - .02, m + .16, .02, .14) * .35), 0),
    red: leakFx ? .25 + .15 * (hash(Math.floor(t * 12)) > .7) : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: P1 ? '¿VALIÓ<br>LA PENA<br>ESPERAR?' : '¿CUÁNTO<br>PAGARÍAS<br>POR JUGARLO?', qs: 128, cta: P1 ? 'COMENTÁ  SÍ  o  NO' : 'COMENTÁ  TU  PRECIO', nxt: 'Seguime para más <i>GTA 6</i>' } : null };
  overlay(t, O);
}
run([null, frame, frame]);

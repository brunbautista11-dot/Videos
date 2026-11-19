// GTA 6 lanzamiento — tres shorts (p1: récord de preventa, p2: 99 en Metacritic, p3: la noche del lanzamiento). Ciudad costera ficticia, sin material del juego.
import { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, LI, path, evalPath, setCam, rig, init, overlay, run } from './core.js';
const P1 = PART == 1, P2 = PART == 2, P3 = PART == 3;
const TT = { 1: ['17<br>MILLONES', 190, 'GTA 6<b>RÉCORD DE PREVENTA</b>', 'ANTES DE SALIR'], 2: ['99/100', 230, 'GTA 6<b>LA NOTA DE LA CRÍTICA</b>', 'EMPATE HISTÓRICO'], 3: ['SE<br>CAYÓ', 230, 'GTA 6<b>LA NOCHE DEL LANZAMIENTO</b>', 'ANTES DE GTA 6'] }[PART];
init({ tag: '', title: TT[0], titleSize: TT[1], spk: { n: [P3 ? '#7fe3ff' : P2 ? '#b9a2ff' : '#ffd95a', '', 0], q: ['#ff6ad5', '', 0] } });
document.getElementById('tag').innerHTML = TT[2];
document.querySelector('#title .p i').textContent = TT[3];
rig.visible = false;
document.getElementById('sub').style.top = '1400px'; document.getElementById('who').style.top = '1340px';
// ------------------------------------------------------------------ sky, light
const SKYP = P1 ? ['#1d3a6b', '#2f7fa6', '#7fd0c8', '#ffd27a', '#ffe7a0', '#fff3c8'] : P2 ? ['#120a3a', '#3b1d8f', '#7a4fe0', '#e46fd0', '#ffb0c8', '#ffd8e0'] : ['#06102a', '#0f2f63', '#1f5b9a', '#5a8fd0', '#ff9a7a', '#ffc69a'];
const SKY = tex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); SKYP.forEach((c, i) => gr.addColorStop([0, .32, .52, .66, .74, 1][i], c)); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
SKY.wrapS = SKY.wrapT = THREE.ClampToEdgeWrapping;
const skyM = new THREE.MeshBasicMaterial({ map: SKY, side: THREE.BackSide, fog: false, depthWrite: false });
const skyS = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 24, 0, 2 * PI, 0, PI * .62), skyM); scene.add(skyS);
{ const uv = skyS.geometry.attributes.uv, pos = skyS.geometry.attributes.position; for (let i = 0; i < uv.count; i++) { const y = pos.getY(i) / 180; uv.setY(i, cl(1 - (1 - y) * .95 - .02)) } }
scene.background = new THREE.Color(P1 ? 0xffe0a0 : P2 ? 0xffb0d0 : 0x6a8fd0); scene.fog = new THREE.Fog(P1 ? 0xf6d29a : P2 ? 0xc890e0 : 0x5a7ab8, 40, 175);
hemi.color.setHex(P3 ? 0xc8dcff : P2 ? 0xf0d0ff : 0xfff0d0); hemi.groundColor.setHex(P3 ? 0x2a3a6a : 0x4a2c5a); hemi.intensity = P3 ? 1.45 : 1.3;
const sun = new THREE.DirectionalLight(P3 ? 0xffa080 : P2 ? 0xffa0d0 : 0xffd090, P3 ? 1.9 : 2.4); sun.position.set(-20, 18, -60); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
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
const frameNeon = basic(P1 ? 0x2ef0ff : P2 ? 0xb06bff : 0xff3a4a); for (const [w, h, x, y] of [[BW + .5, .1, 0, BY + BH / 2 + .25], [BW + .5, .1, 0, BY - BH / 2 - .25], [.1, BH + .5, -BW / 2 - .25, BY], [.1, BH + .5, BW / 2 + .25, BY]]) box(BB, w, h, .1, frameNeon, x, y, .0, 0);
const bbGlow = glowSprite(BB, P1 ? 0x40e0ff : P2 ? 0xb080ff : 0xff4050, 13, 0, BY, -.6); bbGlow.material.opacity = .35;
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
function scanlines(a = .12) { sg.globalAlpha = 1; sg.fillStyle = `rgba(0,0,0,${a})`; for (let y = 0; y < 720; y += 4) sg.fillRect(0, y, 720, 2) }
function pill(s, x, y, col, tc = '#fff', size = 40) { sg.font = F(size); const w = sg.measureText(s).width + 50; sg.fillStyle = col; sg.beginPath(); sg.roundRect(x - w / 2, y - size * .75, w, size * 1.5, 16); sg.fill(); txt(s, x, y + 2, size, tc) }
function bar(x, y, w, h, k, col) { sg.fillStyle = 'rgba(255,255,255,.12)'; sg.beginPath(); sg.roundRect(x, y, w, h, h / 2); sg.fill(); sg.fillStyle = col; sg.shadowColor = col; sg.shadowBlur = 20; sg.beginPath(); sg.roundRect(x, y, Math.max(h, w * k), h, h / 2); sg.fill(); sg.shadowBlur = 0 }
const fmt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function stampMark(s, x, y, k, col = '#ff2a3a', rot = -.18) { if (k <= 0) return; sg.save(); sg.translate(x, y); sg.rotate(rot); const sc = 1 + (1 - ss(cl(k * 3))) * 1.2; sg.scale(sc, sc); sg.globalAlpha = cl(k * 4); sg.strokeStyle = col; sg.lineWidth = 9; sg.font = F(64); const w = sg.measureText(s).width + 44; sg.strokeRect(-w / 2, -48, w, 96); txt(s, 0, 4, 64, col); sg.restore() }
function clapper(x, y, s) { sg.save(); sg.translate(x, y); sg.scale(s, s); sg.fillStyle = '#eee'; sg.fillRect(-60, -20, 120, 80); sg.fillStyle = '#222'; sg.fillRect(-56, -16, 112, 72); sg.save(); sg.translate(-60, -24); sg.rotate(-.25); sg.fillStyle = '#eee'; sg.fillRect(0, -18, 124, 20); sg.fillStyle = '#222'; for (let i = 0; i < 5; i++) sg.fillRect(8 + i * 24, -18, 12, 20); sg.restore(); sg.restore() }
// ------------------------------------------------------------------ billboard content per part
function vs(x, y) { txt('VS', x, y, 40, 'rgba(255,255,255,.6)') }
function blocks(t, k) { // 4 blocks: 3 PS5, 1 Xbox
  for (let i = 0; i < 4; i++) { const x = 90 + i * 140, a = cl(k * 4 - i), ps = i < 3; sg.globalAlpha = a; sg.fillStyle = ps ? '#2f6bff' : '#2bd96b'; sg.shadowColor = sg.fillStyle; sg.shadowBlur = 24; sg.beginPath(); sg.roundRect(x, 260, 120, 200, 18); sg.fill(); sg.shadowBlur = 0; txt(ps ? 'PS5' : 'XBOX', x + 60, 360, ps ? 40 : 34, '#fff'); sg.globalAlpha = 1 } }
function draw1(t) {
  if (t < M.pre) { bgScreen(t, '#06243a', '#0b3d5a'); txt('GTA 6', 360, 130, 80, '#ffd95a', { glow: '#ffb000' }); const blink = Math.sin(t * 8) > 0; txt('17.000.000', 360 + (hash(Math.floor(t * 10)) - .5) * 6, 340, 118, '#fff', { glow: '#2ef0ff', blur: 36 }); txt('COPIAS', 360, 450, 60, '#2ef0ff'); pill(blink ? 'AÚN SIN SALIR' : 'AÚN SIN SALIR', 360, 590, blink ? '#ff3fa4' : '#c02a7a', '#fff', 44) }
  else if (t < M.money) { bgScreen(t, '#06243a', '#0b3d5a'); txt('PREVENTA · GTA 6', 360, 100, 50, '#9df3ff'); const k = ss(ramp(t, M.pre + 2.4, M.pre + 5.2)); txt(fmt(17000000 * k), 360, 290, 128, '#fff', { glow: '#2ef0ff', blur: 40 }); txt('COPIAS', 360, 410, 64, '#2ef0ff', { glow: '#2ef0ff' }); bar(80, 500, 560, 46, k, '#2ef0ff'); txt('ESTIMACIÓN · SENSOR TOWER', 360, 620, 32, 'rgba(255,255,255,.8)', { w: 700 }) }
  else if (t < M.ps5) { bgScreen(t, '#0b2318', '#0f3d2a'); txt('EQUIVALE A', 360, 110, 50, '#9dffc6'); const k = ss(ramp(t, M.money + .6, M.money + 2.8)); txt('US$', 360, 220, 64, '#c8ffd8'); txt(fmt(1650 * k), 360, 340, 170, '#fff', { glow: '#2bff88', blur: 40 }); txt('MILLONES', 360, 480, 70, '#2bff88', { glow: '#2bff88' }); for (let i = 0; i < 9; i++) { const y = ((t * 140 + i * 90) % 760) - 40; txt('$', 60 + i * 75, y, 54, 'rgba(255,225,74,.28)') } pill('ANTES DEL DÍA 1', 360, 620, '#ffe14a', '#1a1300', 40) }
  else if (t < M.gta5) { bgScreen(t, '#081433', '#0f2266'); txt('¿DÓNDE RESERVARON?', 360, 110, 52, '#fff'); const k = ramp(t, M.ps5 + .4, M.ps5 + 2.0); blocks(t, k); txt('3 DE CADA 4', 360, 550, 84, '#7fb0ff', { glow: '#2f6bff', blur: 30 }); stampMark('PS5 GANA', 360, 650, ramp(t, Ln.c3.end - .8, Ln.c3.end - .2), '#ffe14a', -.06) }
  else if (t < M.big) { bgScreen(t, '#1d1030', '#2c1450'); txt('PARA COMPARAR', 360, 90, 46, '#ffd95a'); const k = ss(ramp(t, M.gta5 + 2.0, M.gta5 + 4.2));
    txt('GTA 5', 60, 200, 48, '#ff9ad8', { a: 'left' }); txt('+' + fmt(235 * k) + ' M', 660, 200, 56, '#fff', { a: 'right' }); bar(60, 240, 600, 50, k, '#ff3fa4'); txt('EN 13 AÑOS', 60, 330, 34, 'rgba(255,255,255,.75)', { a: 'left', w: 700 });
    txt('GTA 6', 60, 430, 48, '#2ef0ff', { a: 'left' }); txt('~17 M', 660, 430, 56, '#fff', { a: 'right' }); bar(60, 470, 600, 50, .072 * k, '#2ef0ff'); txt('ANTES DE SALIR', 60, 560, 34, 'rgba(255,255,255,.75)', { a: 'left', w: 700 }); pill('Y RECIÉN EMPIEZA', 360, 650, '#ffe14a', '#1a1300', 38) }
  else if (t < M.est) { bgScreen(t, '#2a0b3a', '#4a0d5f'); txt('¿UNO DE LOS', 360, 120, 62, '#fff'); txt('MAYORES ESTRENOS', 360, 200, 62, '#ffd95a', { glow: '#ffb000' }); txt('DEL ENTRETENIMIENTO?', 360, 280, 54, '#fff');
    ['CINE', 'MÚSICA', 'SERIES'].forEach((n, i) => pill(n, 150 + i * 210, 380, 'rgba(255,255,255,.14)', 'rgba(255,255,255,.75)', 34)); const kb = sr(t, M.big + 1.8, M.big + 2.4); txt('GTA 6', 360, 545, 150 * (.6 + .4 * kb), '#ffc83a', { glow: '#ffb000', blur: 40 }); }
  else if (t < M.stock) { bgScreen(t, '#101018', '#22222e'); txt('17 M · US$ 1.650 M', 360, 260, 66, 'rgba(255,255,255,.55)'); txt('CIFRAS', 360, 120, 64, '#fff'); stampMark('ESTIMADAS', 360, 420, ramp(t, M.est + 1.0, M.est + 1.6), '#ffb000', -.1); stampMark('SIN CONFIRMAR', 360, 590, ramp(t, Ln.c5.end - 1.8, Ln.c5.end - 1.2), '#ff2a3a', .06) }
  else { bgScreen(t, '#0b2318', '#0f3d2a'); txt('TAKE-TWO EN LA BOLSA', 360, 100, 48, '#9dffc6'); const k = ss(ramp(t, M.stock + .4, M.stock + 3.4));
    sg.strokeStyle = '#2bff88'; sg.lineWidth = 12; sg.shadowColor = '#2bff88'; sg.shadowBlur = 24; sg.beginPath(); for (let i = 0; i <= 40 * k; i++) { const x = 70 + i * 14.5, y = 520 - i * 6.5 - Math.sin(i * 1.1) * 18; i ? sg.lineTo(x, y) : sg.moveTo(x, y) } sg.stroke(); sg.shadowBlur = 0;
    txt('▲ ~6%', 360, 610, 110 * (.8 + .2 * k), '#fff', { glow: '#2bff88', blur: 34 }) }
  scanlines();
}
function draw2(t) {
  const ring = (cx, cy, r, k, col) => { sg.lineWidth = 26; sg.strokeStyle = 'rgba(255,255,255,.12)'; sg.beginPath(); sg.arc(cx, cy, r, 0, 2 * PI); sg.stroke(); sg.strokeStyle = col; sg.shadowColor = col; sg.shadowBlur = 26; sg.beginPath(); sg.arc(cx, cy, r, -PI / 2, -PI / 2 + 2 * PI * k); sg.stroke(); sg.shadowBlur = 0 };
  if (t < M.meta) { bgScreen(t, '#140a33', '#2a1060'); txt('NOTA DE LA CRÍTICA', 360, 120, 52, '#c9b8ff'); txt('99', 360 + (hash(Math.floor(t * 10)) - .5) * 6, 350, 260, '#fff', { glow: '#7a4fe0', blur: 50 }); txt('/ 100', 360, 530, 70, '#b9a2ff'); pill('GTA 6', 360, 640, '#7a4fe0', '#fff', 44) }
  else if (t < M.zelda) { bgScreen(t, '#0b2318', '#0f3d2a'); txt('METACRITIC', 360, 90, 56, '#9dffc6'); const k = ss(ramp(t, M.meta + 1.0, M.meta + 3.2)); ring(360, 330, 170, .99 * k, '#2bff88'); txt(Math.round(99 * k), 360, 335, 170, '#fff', { glow: '#2bff88', blur: 30 }); txt('+140 RESEÑAS', 360, 590, 56, '#2bff88'); txt('ACLAMACIÓN UNIVERSAL', 360, 660, 32, 'rgba(255,255,255,.8)', { w: 700 }) }
  else if (t < M.x6) { bgScreen(t, '#140a33', '#2a1060'); txt('LOS ÚNICOS CON 99', 360, 90, 52, '#ffd95a', { glow: '#ffb000' }); const a1 = sr(t, M.zelda + .2, M.zelda + .7), a2 = sr(t, M.zelda + 1.8, M.zelda + 2.4);
    for (const [y, n, sub, a, c] of [[230, 'GTA 6', '2026', a1, '#7a4fe0'], [420, 'ZELDA: OCARINA', 'OF TIME · 1998', a2, '#2bb36b']]) { sg.globalAlpha = a; sg.fillStyle = 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(50, y - 75, 620, 150, 24); sg.fill(); sg.fillStyle = c; sg.beginPath(); sg.roundRect(70, y - 55, 110, 110, 18); sg.fill(); txt('99', 125, y + 2, 66, '#fff'); txt(n, 410, y - 22, n.length > 8 ? 46 : 60, '#fff'); txt(sub, 410, y + 36, 32, 'rgba(255,255,255,.75)', { w: 700 }); sg.globalAlpha = 1 }
    stampMark('EMPATE', 360, 620, ramp(t, Ln.d2.end - .3, Ln.d2.end + .3), '#ffe14a', -.08) }
  else if (t < M.ign) { bgScreen(t, '#1d1030', '#2c1450'); txt('CANTIDAD DE RESEÑAS', 360, 90, 48, '#fff'); const k = ss(ramp(t, M.x6 + 1.0, M.x6 + 4.0));
    txt('ZELDA', 60, 210, 46, '#7ff0b0', { a: 'left' }); txt('22', 660, 210, 54, '#fff', { a: 'right' }); bar(60, 250, 600, 50, .15 * Math.min(1, k * 3), '#2bb36b');
    txt('GTA 6', 60, 390, 46, '#c9b8ff', { a: 'left' }); txt(Math.round(22 + 124 * k), 660, 390, 54, '#fff', { a: 'right' }); bar(60, 430, 600, 50, .15 + .85 * k, '#9b6bff'); sg.globalAlpha = cl(k * 1.5); txt('×6', 360, 600, 150 * (.6 + .4 * k), '#ffd95a', { glow: '#ffb000', blur: 30 }) }
  else if (t < M.press) { bgScreen(t, '#2a0606', '#4a0a0a'); txt('IGN', 360, 110, 90, '#fff', { glow: '#ff2a3a', blur: 30 }); const k = sr(t, M.ign + 1.4, M.ign + 1.9); txt('10/10', 360, 320, 190 * (.7 + .3 * k), '#fff', { glow: '#ff3a4a', blur: 40 }); stampMark('PERFECTO', 360, 500, ramp(t, M.ign + 1.6, M.ign + 2.2), '#ffe14a', -.1); txt('+120 HORAS DE JUEGO', 360, 640, 42, '#ff9a9a') }
  else if (t < M.praise) { bgScreen(t, '#101018', '#22222e'); txt('LO QUE DIJO LA PRENSA', 360, 80, 44, '#c9d1da'); const a1 = sr(t, M.press + .3, M.press + .8), a2 = sr(t, Ln.d4.start + 2.6, Ln.d4.start + 3.2);
    sg.globalAlpha = a1; txt('“OBRA MAESTRA”', 360, 220, 78, '#fff', { glow: '#7a4fe0', blur: 26 }); txt('— BLOOMBERG', 360, 300, 38, '#b9a2ff'); sg.globalAlpha = a2; txt('“ÉPICA AMERICANA', 360, 430, 60, '#fff', { glow: '#ff3fa4', blur: 26 }); txt('ASOMBROSA”', 360, 500, 60, '#fff', { glow: '#ff3fa4', blur: 26 }); txt('— THE WASHINGTON POST', 360, 580, 34, '#ff9ad8'); sg.globalAlpha = 1; txt('(traducido)', 360, 670, 24, 'rgba(255,255,255,.45)', { w: 600 }) }
  else { bgScreen(t, '#140a33', '#2a1060'); txt('LO MÁS ELOGIADO', 360, 100, 56, '#ffd95a', { glow: '#ffb000' });
    [['MUNDO GIGANTE', M.k1], ['LA HISTORIA', M.k2], ['TUS DECISIONES', M.k3]].forEach(([n, tk], i) => { const y = 250 + i * 150, a = sr(t, tk - .2, tk + .2); sg.globalAlpha = .35 + .65 * a; sg.fillStyle = a > .5 ? 'rgba(43,255,136,.16)' : 'rgba(255,255,255,.07)'; sg.beginPath(); sg.roundRect(60, y - 60, 600, 120, 22); sg.fill(); txt(n, 330, y, 54, '#fff'); sg.globalAlpha = 1; if (a > 0) txt('✓', 600, y, 80 * (.6 + .4 * a), '#2bff88', { glow: '#2bff88' }) }) }
  scanlines();
}
function draw3(t) {
  if (t < M.psn) { const gl = hash(Math.floor(t * 14)) > .6; bgScreen(t, '#2a0306', '#4a0710'); txt('PLAYSTATION', 360 + (gl ? 10 : 0), 170, 76, '#fff'); txt('NETWORK', 360 - (gl ? 8 : 0), 250, 76, '#fff'); stampMark('CAÍDA', 360, 440, 1, '#ff2a3a', -.12); txt('18 NOV · HORAS ANTES', 360, 620, 40, '#ff9a9a'); if (gl) { sg.fillStyle = 'rgba(255,0,40,.25)'; sg.fillRect(0, hash(t) * 700, 720, 30) } }
  else if (t < M.dd) { bgScreen(t, '#0a1428', '#13234a'); txt('INICIAR SESIÓN', 360, 110, 56, '#fff'); sg.fillStyle = 'rgba(255,255,255,.08)'; sg.beginPath(); sg.roundRect(80, 180, 560, 300, 26); sg.fill();
    const err = t > M.psn + 2.6; if (!err) { sg.lineWidth = 14; sg.strokeStyle = '#7fe3ff'; sg.lineCap = 'round'; sg.beginPath(); sg.arc(360, 300, 60, t * 6, t * 6 + 4.2); sg.stroke(); txt('Conectando…', 360, 425, 36, 'rgba(255,255,255,.8)', { w: 700 }) }
    else { txt('⚠', 360, 290, 110, '#ff3a4a', { glow: '#ff2a3a' }); txt('SERVICIOS OCUPADOS', 360, 420, 46, '#ff6a6a') } txt('MILES DE JUGADORES', 360, 560, 46, '#fff'); txt('EE.UU. · MIÉRCOLES DE TARDE', 360, 630, 32, '#7fe3ff', { w: 800 }) }
  else if (t < M.fix) { bgScreen(t, '#2a0306', '#3a0a1a'); txt('DOWNDETECTOR', 360, 90, 56, '#ff9a9a'); const k = ss(ramp(t, M.dd + 1.0, M.dd + 3.4));
    sg.strokeStyle = '#ff3a4a'; sg.lineWidth = 10; sg.shadowColor = '#ff2a3a'; sg.shadowBlur = 20; sg.beginPath(); for (let i = 0; i <= 40 * k; i++) { const x = 60 + i * 15, sp = Math.exp(-((i - 30) ** 2) / 40), y = 470 - sp * 280 - hash(i) * 20; i ? sg.lineTo(x, y) : sg.moveTo(x, y) } sg.stroke(); sg.shadowBlur = 0;
    txt('+' + fmt(4000 * k), 360, 560, 110, '#fff', { glow: '#ff2a3a', blur: 30 }); txt('REPORTES', 360, 655, 48, '#ff6a6a') }
  else if (t < M.upd) { bgScreen(t, '#0b2318', '#0f3d2a'); const k = sr(t, M.fix + .2, M.fix + .7); sg.globalAlpha = k; txt('✓', 360, 190, 170, '#2bff88', { glow: '#2bff88', blur: 30 }); txt('SERVICIO RESTABLECIDO', 360, 340, 48, '#fff'); sg.globalAlpha = 1;
    const k2 = sr(t, Ln.e3.start + 2.0, Ln.e3.start + 2.5); sg.globalAlpha = k2; txt('¿CULPA DE GTA 6?', 360, 470, 60, '#ffd95a', { glow: '#ffb000' }); sg.globalAlpha = 1; stampMark('SIN CONFIRMAR', 360, 600, ramp(t, Ln.e3.end - 1.2, Ln.e3.end - .6), '#ff9a3a', -.06) }
  else if (t < M.gb) { bgScreen(t, '#081433', '#0f2266'); txt('PS5', 360, 100, 80, '#7fb0ff', { glow: '#2f6bff', blur: 30 }); txt('ACTUALIZACIÓN', 360, 210, 60, '#fff'); txt('DEL SISTEMA', 360, 280, 60, '#fff'); const k = ss(ramp(t, M.upd + .6, Ln.e4.end - .6)); bar(80, 380, 560, 46, k, '#2f6bff'); txt(Math.round(100 * k) + '%', 360, 470, 50, '#cfe0ff'); stampMark('OBLIGATORIA', 360, 610, ramp(t, Ln.e4.end - .4, Ln.e4.end + .2), '#ffe14a', -.08) }
  else if (t < M.nz) { bgScreen(t, '#1d1030', '#2c1450'); txt('ESPACIO NECESARIO', 360, 100, 50, '#ff9ad8'); const k = ss(ramp(t, M.gb + 1.2, M.gb + 3.2)); txt(Math.round(212 * k), 360, 300, 230, '#fff', { glow: '#ff3fa4', blur: 40 }); txt('GB', 360, 450, 80, '#ff3fa4', { glow: '#ff3fa4' });
    for (let i = 0; i < 10; i++) { sg.fillStyle = i < 10 * k ? '#ff3fa4' : 'rgba(255,255,255,.12)'; sg.beginPath(); sg.roundRect(70 + i * 59, 540, 48, 90, 8); sg.fill() } txt('HASTA', 70, 670, 26, 'rgba(255,255,255,.6)', { a: 'left', w: 700 }) }
  else { bgScreen(t, '#06243a', '#0b3d5a'); txt('NUEVA ZELANDA', 360, 100, 62, '#9df3ff', { glow: '#2ef0ff' }); const k = sr(t, M.nz + .3, M.nz + .9); txt('00:00', 360, 300, 190 * (.75 + .25 * k), '#fff', { glow: '#2ef0ff', blur: 40 }); pill('YA ESTÁN JUGANDO', 360, 470, '#2bff88', '#04210f', 46); txt('EL RESTO DEL MUNDO:', 360, 590, 36, 'rgba(255,255,255,.8)', { w: 700 }); txt('ESPERANDO…', 360, 650, 50, '#ffd95a') }
  scanlines();
}
// ------------------------------------------------------------------ camera paths (new framings for this series)
const TG = [0, BY - 1.6, BZ], TGl = [0, BY - 2.1, BZ], TGh = [0, BY - 1.2, BZ];
const KS = {
 1: [[0, [-34, 20, 12], [0, 6, -40], 56], [M.title + .8, [-12, 11, 3], [0, 7, -30], 60], [M.pre - .25, [-5, 8.0, -1], TG, 60],
  [M.pre + .05, [0, 6.0, -3.6], TG, 62], [M.money - .3, [0, 5.9, -6.2], TG, 60], [M.money + .05, [-3.4, 3.4, -4.0], TGl, 64], [M.ps5 - .3, [-1.4, 4.6, -5.8], TG, 62],
  [M.ps5 + .05, [3.8, 6.4, -4.4], TGh, 60], [M.gta5 - .3, [1.6, 6.0, -6.4], TG, 58], [M.gta5 + .05, [0, 5.8, -3.6], TG, 62], [M.big - .3, [0, 5.8, -6.6], TG, 56],
  [M.big + .05, [2.8, 3.0, -3.8], TGl, 66], [M.est - .3, [1.0, 4.6, -6.0], TG, 62], [M.est + .05, [-2.6, 5.4, -4.2], TG, 62], [M.stock - .3, [-1.0, 5.8, -6.4], TG, 58],
  [M.stock + .05, [0, 5.4, -4.0], TG, 62], [M.endcard - .2, [0, 5.8, -6.6], TG, 58], [C.dur, [8, 14, 6], [0, BY + 3, BZ - 20], 64]],
 2: [[0, [-3, 1.4, 8], [0, 9, -20], 66], [M.title + .8, [-1, 3.2, 0], [0, 8, -18], 64], [M.meta - .25, [0, 4.6, -1], TG, 62],
  [M.meta + .05, [0, 5.9, -3.8], TG, 62], [M.zelda - .3, [0, 5.9, -6.2], TG, 60], [M.zelda + .05, [3.4, 5.0, -4.0], TG, 62], [M.x6 - .3, [1.4, 5.6, -6.0], TG, 60],
  [M.x6 + .05, [0.8, 4.6, -4.4], TGh, 62], [M.ign - .3, [-1.2, 6.0, -6.4], TG, 58], [M.ign + .05, [0, 3.2, -4.4], TGl, 66], [M.press - .3, [0, 4.6, -6.4], TG, 60],
  [M.press + .05, [2.2, 5.8, -3.8], TG, 62], [M.praise - .3, [0.6, 5.8, -6.4], TG, 58], [M.praise + .05, [-2.4, 5.0, -4.0], TG, 62], [M.endcard - .2, [0, 5.8, -6.6], TG, 58], [C.dur, [-10, 12, 8], [0, BY + 2, BZ - 18], 64]],
 3: [[0, [0, 2.0, 34], [0, 6.5, -10], 52], [M.title + .8, [1.5, 3.2, 8], [0, BY, BZ], 58], [M.psn - .25, [0, 4.4, 1], TG, 60],
  [M.psn + .05, [-1.4, 5.6, -4.8], TGh, 60], [M.dd - .3, [-1.0, 6.0, -6.4], TG, 58], [M.dd + .05, [0, 5.6, -3.6], TG, 62], [M.fix - .3, [0, 5.8, -6.4], TG, 58],
  [M.fix + .05, [3.4, 3.6, -4.2], TGl, 64], [M.upd - .3, [1.2, 4.8, -6.0], TG, 62], [M.upd + .05, [-1.4, 5.0, -4.6], TG, 62], [M.gb - .3, [-0.8, 5.8, -6.4], TG, 58],
  [M.gb + .05, [0, 3.0, -4.6], TGl, 66], [M.nz - .3, [0, 4.4, -6.6], TG, 60], [M.nz + .05, [2.6, 6.2, -4.4], TGh, 60], [M.endcard - .2, [0.4, 6.2, -6.8], TG, 58], [C.dur, [0, 10, 8], [0, BY + 3, BZ - 20], 66]],
};
const K = path(KS[PART]);
const CUTS = { 1: ['pre', 'money', 'ps5', 'gta5', 'big', 'est', 'stock'], 2: ['meta', 'zelda', 'x6', 'ign', 'press', 'praise'], 3: ['psn', 'dd', 'fix', 'upd', 'gb', 'nz'] }[PART];
const FIRST = M[CUTS[0]];
// ------------------------------------------------------------------ frame
function frame(t) {
  T.sea.offset.set(t * .01, t * .004);
  for (const p of PALMS) { const u = p.userData; u.top.rotation.z = Math.sin(t * 1.2 + u.seed) * .05; u.top.rotation.x = Math.sin(t * .9 + u.seed * 2) * .04 }
  for (const c of CARS) { const u = c.userData; const s = (t * u.v + u.off) % 180; c.position.set(u.lane, 0, u.dir < 0 ? 40 - s : -140 + s) }
  [null, draw1, draw2, draw3][PART](t); scrT.needsUpdate = true; bbGlow.material.opacity = .3 + .08 * Math.sin(t * 3);
  const sk = P1 ? Math.max(win(t, M.money + .6, M.gta5, .6, .5) * 1.6, win(t, M.stock + 1.5, C.dur + 1, 1.5, .3) * 1.2) : 0;
  STACKS.forEach((g, i) => { const h = Math.max(.001, sk * (1 + hash(i * 3.3) * .5)); g.visible = sk > .01; g.userData.c.scale.y = h; g.userData.c.position.y = .15 + h / 2 });
  const rain = P1 ? Math.max(win(t, M.money + 1.2, M.ps5, .4, .8), win(t, M.stock + 2.2, M.endcard + .5, .3, .8)) : P2 ? win(t, M.ign + 1.6, M.press, .3, .8) * .8 : 0;
  for (const c of COINS) { const u = c.userData; c.visible = rain > .02; if (!c.visible) continue; const y = 13 - ((t * u.sp + u.ph * 13) % 13); c.position.set(u.x, y, u.z); c.rotation.set(u.rx + t * 5, u.ry + t * 3, 0); c.scale.setScalar(rain) }
  const fw0 = P1 ? M.stock + 2.2 : P2 ? M.praise + 1.2 : M.nz + 1.2; fireworks(t, fw0, t > fw0 - .2);
  const c = evalPath(K, t); setCam(c, t, .8, 0, 0);
  const alarm = P3 && t > M.psn - .2 && t < M.fix;
  const O = { tag: .95, title: win(t, .5, FIRST - .15, .3, .25), noSub: t > M.endcard + .1, titleY: 340, grain: .05,
    tint: alarm ? 'rgba(255,30,60,.16)' : P1 ? 'rgba(255,220,140,.08)' : P2 ? 'rgba(170,120,255,.10)' : 'rgba(80,140,255,.10)',
    black: Math.max(1 - ramp(t, 0, .3), win(t, FIRST - .25, FIRST + .12, .12, .12) * .8),
    white: CUTS.slice(1).reduce((a, m) => Math.max(a, win(t, M[m] - .02, M[m] + .16, .02, .14) * .35), 0),
    red: alarm ? .14 + .12 * (hash(Math.floor(t * 12)) > .7) : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: P1 ? '¿VOS YA<br>LO<br>COMPRASTE?' : P2 ? '¿QUÉ NOTA<br>LE<br>PONÉS?' : '¿TE<br>ANDUVO?', qs: P3 ? 150 : 124, cta: P1 ? 'COMENTÁ  SÍ  o  NO' : P2 ? 'COMENTÁ  DEL  1  AL  10' : 'CONTÁ  TU  NOCHE  ABAJO', nxt: 'Seguime para más <i>GTA 6</i>' } : null };
  overlay(t, O);
}
run([null, frame, frame, frame]);

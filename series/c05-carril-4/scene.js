// CARRIL 4 — piscina climatizada al cierre, POV de Lucía. P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, phoneScr, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'CARRIL 4', title: 'CARRIL 4', titleSize: 180, sleeve: 0xc8202a, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], cosa: ['#ff4558', 'CARRIL 4', 1], tel: ['#7dffb0', 'HUGO · TELÉFONO', 1], hugo: ['#7dffb0', 'HUGO', 0] } });
// ------------------------------------------------------------------ textures
T.tileB = tex(256, 256, (g, w, h) => { g.fillStyle = '#5fb8d0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(20,60,80,.35)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke() } speck(g, w, h, 600, .08) }, 10, 25);
T.floorP = tex(256, 256, (g, w, h) => { g.fillStyle = '#b8b2a6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke() } speck(g, w, h, 1500, .1) }, 12, 24);
T.tileW = tex(256, 256, (g, w, h) => { g.fillStyle = '#dfe6e6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,40,50,.25)'; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke() } blot(g, w, h, 10, .06, '40,60,60', 60) }, 4, 2);
T.water = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a9ab8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { g.strokeStyle = `rgba(${Math.random() < .5 ? '220,245,255' : '10,40,60'},${Math.random() * .3})`; g.lineWidth = 1 + Math.random() * 2; const x = Math.random() * w, y = Math.random() * h, l = 10 + Math.random() * 30; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 4, x + l, y); g.stroke() } }, 6, 12);
T.rope = tex(64, 256, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 4 < 2 ? '#d82a2a' : (i % 4 == 2 ? '#f2f2f2' : '#2a5ad8'); g.fillRect(0, i * 16, w, 16) } }, 1, 12);
const numT = n => tex(128, 128, (g, w, h) => { g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a3a8a'; g.font = '900 96px Inter'; g.textAlign = 'center'; g.fillText(n, 64, 100) });
T.exit = tex(256, 96, (g, w, h) => { g.fillStyle = '#0a8a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 50px Inter'; g.textAlign = 'center'; g.fillText('SALIDA', w / 2, 66) });
T.vest = tex(512, 128, (g, w, h) => { g.fillStyle = '#1a3a8a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 64px Inter'; g.textAlign = 'center'; g.fillText('VESTUARIO', w / 2, 88) });
T.emer = tex(512, 128, (g, w, h) => { g.fillStyle = '#c8141f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 46px Inter'; g.textAlign = 'center'; g.fillText('SALIDA DE EMERGENCIA', w / 2, 82) });
T.street = tex(256, 256, (g, w, h) => { g.fillStyle = '#2a2c30'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .3, '10,10,12'); blot(g, w, h, 12, .25, '120,130,150', 50) }, 10, 10);
T.call = tex(140, 300, (g, w, h) => { g.fillStyle = '#0f2a1e'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a6a5a'; g.beginPath(); g.arc(w / 2, 100, 34, 0, 7); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '900 34px Inter'; g.fillText('H', w / 2, 112); g.font = '900 22px Inter'; g.fillText('HUGO', w / 2, 170); g.font = '700 13px Inter'; g.fillText('en llamada…', w / 2, 192); g.fillStyle = '#c8141f'; g.beginPath(); g.arc(w / 2, 255, 20, 0, 7); g.fill() });
T.book = tex(256, 192, (g, w, h) => { g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, w, h); blot(g, w, h, 10, .2, '140,110,60', 60); g.fillStyle = '#3a2a1a'; g.font = '700 18px Inter'; ['15/03/1994 inauguración', 'carril 4 — no salió', '', 'de noche: VACIAR'].forEach((l, i) => g.fillText(l, 16, 40 + i * 34)); g.strokeStyle = '#8a1a1a'; g.lineWidth = 3; g.strokeRect(10, 128, 190, 40) });
// ------------------------------------------------------------------ world: pool x -4.8..4.8, z -25..0, water y = -.15; lane 4 centre x = .8
const W = grp(scene), WY = -.15, L4 = .8;
const deckM = new THREE.MeshLambertMaterial({ map: T.floorP });
for (const [x, z, w, d] of [[-7, -12.5, 4.4, 37], [7, -12.5, 4.4, 37], [0, 3, 9.6, 6], [0, -28, 9.6, 6]]) { const f = add(W, new THREE.PlaneGeometry(w, d), deckM, x, 0, z, 2); f.rotation.x = -PI / 2 }
const tileM = new THREE.MeshLambertMaterial({ map: T.tileB }); const pb = add(W, new THREE.PlaneGeometry(9.6, 25), tileM, 0, -1.9, -12.5, 2); pb.rotation.x = -PI / 2;
for (let i = 0; i < 6; i++) { const ln = add(W, new THREE.PlaneGeometry(.25, 23), basic(0x14305a), -4 + i * 1.6, -1.89, -12.5, 0); ln.rotation.x = -PI / 2 }
box(W, .1, 1.9, 25, tileM, -4.85, -.95, -12.5, 2); box(W, .1, 1.9, 25, tileM, 4.85, -.95, -12.5, 2); box(W, 9.6, 1.9, .1, tileM, 0, -.95, .05, 2); box(W, 9.6, 1.9, .1, tileM, 0, -.95, -25.05, 2);
box(W, 9.8, .08, .3, mat(0xe8e8e8), 0, .0, .2, 2); for (const s of [-1, 1]) box(W, .3, .08, 25.4, mat(0xe8e8e8), s * 4.95, 0, -12.5, 2);
const waterM = new THREE.MeshPhongMaterial({ color: 0x7ac8e0, map: T.water, transparent: true, opacity: .62, shininess: 90, specular: 0x88aabb, depthWrite: false }); const wat = add(W, new THREE.PlaneGeometry(9.6, 25), waterM, 0, WY, -12.5, 0); wat.rotation.x = -PI / 2; wat.renderOrder = 2;
const ropeM = new THREE.MeshLambertMaterial({ map: T.rope }); for (let i = 1; i < 6; i++) { const r = add(W, G.cyl, ropeM, -4.8 + i * 1.6, WY + .02, -12.5, 0); r.scale.set(.06, 25, .06); r.rotation.x = PI / 2 }
for (let i = 0; i < 6; i++) { const x = -4 + i * 1.6; box(W, .5, .7, .6, mat(0xe8e8e8), x, .35, -25.55, 1); const n = add(W, new THREE.PlaneGeometry(.32, .32), basic(0xffffff, { map: numT(String(i + 1)) }), x, .45, -25.24, 0) }
// hall
const hallM = mat(0x8a96a0); box(W, .2, 8, 40, hallM, -9.2, 4, -12, 2); box(W, .2, 8, 40, hallM, 9.2, 4, -12, 2); box(W, 18.6, 8, .2, hallM, 0, 4, -32, 2); box(W, 18.6, 8, .2, hallM, 0, 4, 7.5, 2); box(W, 18.6, .2, 40, mat(0x5a646e), 0, 8, -12, 0);
for (let i = 0; i < 6; i++) add(W, new THREE.PlaneGeometry(4, 4.5), basic(0x1a2a44), 9.08, 4.4, -26 + i * 5.4, 0).rotation.y = -PI / 2;
const exS = add(W, new THREE.PlaneGeometry(1.0, .38), basic(0xffffff, { map: T.exit }), -6, 3.0, 7.38, 0); exS.rotation.y = PI; glowSprite(W, 0x30ff80, 2.2, -6, 3.0, 7.2);
const vs = add(W, new THREE.PlaneGeometry(2.0, .5), basic(0xffffff, { map: T.vest }), 6.5, 3.0, 7.38, 0); vs.rotation.y = PI; box(W, 1.4, 2.4, .1, mat(0x3a5a8a), 6.5, 1.2, 7.35, 0);
const chair = grp(W); chair.position.set(-6.6, 0, -9); for (const [x, z] of [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]]) { const l = add(chair, G.cyl, mat(0xe8e8e8), x, 1.0, z, 1); l.scale.set(.05, 2, .05) } box(chair, 1, .1, 1, mat(0xd8202a), 0, 2.0, 0, 1); box(chair, 1, .8, .1, mat(0xd8202a), 0, 2.4, .45, 1);
const ring = add(W, new THREE.TorusGeometry(.3, .08, 10, 24), mat(0xf25a1a), -6.6, 1.3, -8.4, 1);
const CEIL = []; for (const x of [-4.5, 0, 4.5]) for (const z of [-20, -11, -2]) { const l = new THREE.PointLight(0xf4f8ff, 0, 22, 1.2); l.position.set(x, 7.5, z); W.add(l); const b = add(W, new THREE.BoxGeometry(1.2, .08, .4), basic(0xffffff), x, 7.85, z, 0); CEIL.push({ l, b }) }
const UW = []; for (let i = 0; i < 6; i++) for (const z of [-20, -12.5, -5]) { const x = -4 + i * 1.6; const l = new THREE.PointLight(0x40e0ff, 0, 7, 1.4); l.position.set(x, -1.4, z); W.add(l); const g = glowSprite(W, 0x40e0ff, 1.6, x, -1.5, z); UW.push({ l, g, lane: i + 1 }) }
const moon = new THREE.DirectionalLight(0x8aa8ff, 0); moon.position.set(30, 20, -10); scene.add(moon, moon.target);
// swimmer (strokes in the dark), hand on the edge, figure lying on the bottom
const swim = makeChar({ skin: 0x9aa8a8, shirt: 0x9aa8a8, pants: 0x1a2a3a, hair: 0x101418, style: 'short', noface: 1, h: 1.0, seed: 71 });
const SPL = [0, 1, 2].map(() => glowSprite(W, 0xdff4ff, 1.0, 0, 0, 0));
const HAND = grp(W); HAND.scale.setScalar(1.35); { const hm = mat(0xdce6e2, { emissive: 0x223330 }); const p = sph(HAND, .05, hm, 0, -.025, -.05, 0); p.scale.set(.05, .022, .055); for (let i = 0; i < 4; i++) { const f = caps(HAND, .011, .09 - Math.abs(i - 1.5) * .012, hm, -.045 + i * .03, .0, .03, 0); f.rotation.x = PI / 2 } const th = caps(HAND, .012, .07, hm, -.07, -.02, -.02, 0); th.rotation.set(1.2, 0, .6); const wr = add(HAND, G.cyl, hm, 0, -.14, -.12, 0); wr.scale.set(.035, .22, .03); wr.rotation.x = .6 }
const EYES = grp(W); for (const s of [-1, 1]) sph(EYES, .025, basic(0xd8fff8), s * .07, 0, 0, 0); const eyeG = glowSprite(EYES, 0x80fff0, .5, 0, 0, 0);
const fig = makeChar({ skin: 0xa8b8b4, shirt: 0x6a7a80, pants: 0x2a3a44, hair: 0x101418, style: 'short', h: 1.0, seed: 72 });
// locker room (x = 40), street outside (x = 40, z < -8), reception (x = 80), bathroom (x = 120)
const LR = grp(scene); LR.position.set(40, 0, 0); const twM = new THREE.MeshLambertMaterial({ map: T.tileW });
{ const f = add(LR, new THREE.PlaneGeometry(6, 10), new THREE.MeshPhongMaterial({ color: 0xa8b4b8, shininess: 80, specular: 0x556677 }), 0, 0, 0, 2); f.rotation.x = -PI / 2 }
box(LR, .1, 3, 10, twM, -3, 1.5, 0, 2); box(LR, .1, 3, 10, twM, 3, 1.5, 0, 2); box(LR, 6, .1, 10, mat(0xc8d0d0), 0, 3, 0, 0); box(LR, 6, 3, .1, twM, 0, 1.5, 5, 2);
box(LR, 2.2, 3, .1, twM, -1.9, 1.5, -5, 2); box(LR, 2.2, 3, .1, twM, 1.9, 1.5, -5, 2); box(LR, 1.6, .6, .1, twM, 0, 2.7, -5, 2);
const EDOOR = grp(LR); EDOOR.position.set(-.8, 0, -5); box(EDOOR, 1.6, 2.4, .08, mat(0x9a1a1a), .8, 1.2, 0, 1); box(EDOOR, 1.2, .06, .1, mat(0xcccccc), .8, 1.05, .08, 0);
add(LR, new THREE.PlaneGeometry(1.4, .35), basic(0xffffff, { map: T.emer }), 0, 2.65, -4.93, 0);
const SHW = []; for (let i = 0; i < 5; i++) { const z = 3 - i * 1.5; box(LR, .2, .1, .1, mat(0x999999), 2.85, 2.3, z, 0); const st = add(LR, G.cyl, new THREE.MeshBasicMaterial({ color: 0xcfe8ff, transparent: true, opacity: .35 }), 2.65, 1.15, z, 0); st.scale.set(.03, 2.3, .03); SHW.push(st); for (let k = 0; k < 3; k++) SHW.push(glowSprite(LR, 0xdde8f0, 1.8, 2.2 - k * .4, .6 + k * .7, z)) }
for (let i = 0; i < 5; i++) box(LR, .5, 1.9, .5, mat(0x3a6a9a), -2.7, .95, 3 - i * .55, 1); box(LR, .4, .45, 3.5, mat(0x8a6a4a), -1.8, .22, 1.2, 1);
const lrL = new THREE.PointLight(0xe8f4ff, 0, 12, 1.2); lrL.position.set(0, 2.8, 0); LR.add(lrL);
const STEPS = []; for (let i = 0; i < 12; i++) { const s = add(LR, new THREE.CircleGeometry(.07, 12), new THREE.MeshPhongMaterial({ color: 0x405058, transparent: true, opacity: .7, shininess: 120 }), (i % 2 ? .12 : -.12) + .3, .006, 4.2 - i * .55, 0); s.rotation.x = -PI / 2; s.scale.set(.8, 1.6, 1); STEPS.push(s) }
// street (rain)
{ const f = add(LR, new THREE.PlaneGeometry(30, 20), new THREE.MeshPhongMaterial({ map: T.street, shininess: 90, specular: 0x445566 }), 0, -.01, -16, 2); f.rotation.x = -PI / 2 } box(LR, 30, 6, .3, mat(0x4a4a50), 0, 3, -5.3, 0);
const lamp = grp(LR); lamp.position.set(2.5, 0, -11); { const p = add(lamp, G.cyl, mat(0x2a2a2a), 0, 2.5, 0, 0); p.scale.set(.06, 5, .06) } sph(lamp, .14, basic(0xffd8a0), 0, 5, 0, 0); glowSprite(lamp, 0xffb070, 3, 0, 5, 0); const stL = new THREE.PointLight(0xffc890, 0, 16, 1.2); stL.position.set(0, 4.8, 0); lamp.add(stL);
const RAIN = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xaabbcc, transparent: true, opacity: .5 })); { const a = []; for (let i = 0; i < 900; i++) { const x = (hash(i) - .5) * 16, y = hash(i + 1) * 7, z = -6 - hash(i + 2) * 16; a.push(x, y, z, x, y - .35, z) } RAIN.geometry.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)) } LR.add(RAIN);
// reception
const RC = grp(scene); RC.position.set(80, 0, 0); { const f = add(RC, new THREE.PlaneGeometry(8, 8), new THREE.MeshLambertMaterial({ map: T.floorP }), 0, 0, 0, 2); f.rotation.x = -PI / 2 }
box(RC, 8, 3, .1, mat(0xd8d0c0), 0, 1.5, -3, 2); box(RC, .1, 3, 8, mat(0xd8d0c0), -3.5, 1.5, 0, 2); box(RC, .1, 3, 8, mat(0xd8d0c0), 3.5, 1.5, 0, 2);
const gl = add(RC, new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshPhongMaterial({ color: 0x8ad8f0, transparent: true, opacity: .55, shininess: 100 }), .6, 1.7, -2.93, 0); box(RC, 2.6, 1.05, .7, mat(0x1a3a8a), 0, .52, -.6, 3); box(RC, 2.7, .05, .8, mat(0xe8e8e8), 0, 1.07, -.6, 1);
const BOOK = add(RC, new THREE.PlaneGeometry(.42, .3), new THREE.MeshLambertMaterial({ map: T.book }), .4, 1.1, -.45, 0); BOOK.rotation.x = -PI / 2; BOOK.rotation.z = -.15;
const rcL = new THREE.PointLight(0xfff4e0, 0, 12, 1.1); rcL.position.set(0, 2.8, .5); RC.add(rcL); const rcS = new THREE.DirectionalLight(0xfff0d8, 0); rcS.position.set(84, 6, 6); scene.add(rcS); rcS.target.position.set(80, 0, -1); scene.add(rcS.target);
const hugo = makeChar({ skin: 0xc89a78, shirt: 0x1a3a8a, pants: 0x2a2a30, hair: 0xbdbdbd, style: 'short', stache: 1, h: 1.0, seed: 73 });
// bathroom
const BT = grp(scene); BT.position.set(120, 0, 0); { const f = add(BT, new THREE.PlaneGeometry(4, 4), new THREE.MeshLambertMaterial({ color: 0x8a8a90 }), 0, 0, 0, 2); f.rotation.x = -PI / 2 }
box(BT, 4, 2.8, .1, twM, 0, 1.4, -2, 2); box(BT, .1, 2.8, 4, twM, -2, 1.4, 0, 2); box(BT, .1, 2.8, 4, twM, 2, 1.4, 0, 2); box(BT, 4, .1, 4, mat(0xe8e8e8), 0, 2.8, 0, 0);
for (const [x, z, w, d] of [[0, -1.75, 1.8, .1], [0, -.65, 1.8, .1], [-.9, -1.2, .1, 1.2], [.9, -1.2, .1, 1.2]]) box(BT, w, .6, d, mat(0xf2f2f2), x, .3, z, 1);
const tubW = add(BT, new THREE.PlaneGeometry(1.7, 1.0), new THREE.MeshPhongMaterial({ color: 0x5a8a90, transparent: true, opacity: .8, shininess: 120, specular: 0xaaccdd, map: T.water }), 0, .52, -1.2, 0); tubW.rotation.x = -PI / 2;
box(BT, 1.6, .02, 1.0, mat(0x2a3a3e), 0, .08, -1.2, 0); add(BT, new THREE.PlaneGeometry(.6, .8), new THREE.MeshPhongMaterial({ color: 0x8a9aa8, shininess: 100 }), 1.95, 1.6, .6, 0).rotation.y = -PI / 2;
const btL = new THREE.PointLight(0xfff0d8, 0, 8, 1.3); btL.position.set(0, 2.5, .5); BT.add(btL);
const BUB = []; for (let i = 0; i < 26; i++) BUB.push(sph(BT, .02 + hash(i) * .025, new THREE.MeshPhongMaterial({ color: 0xe8ffff, transparent: true, opacity: .7, shininess: 120 }), 0, 0, 0, 0));
const DARK = add(BT, new THREE.PlaneGeometry(.5, 1.0), basic(0x0a1418, { transparent: true, opacity: 0 }), 0, .25, -1.2, 0); DARK.rotation.x = -PI / 2;
// ------------------------------------------------------------------ environment
const cN = new THREE.Color(0x070b12), cDay = new THREE.Color(0x5a6a74);
function env(o) {
  const t = o.t, day = o.day ?? 0; bg.copy(cN).lerp(cDay, day); scene.fog.color.copy(bg); scene.fog.density = o.fogD ?? .02;
  CEIL.forEach((c, i) => { const v = (o.ceil ?? 0) * (o.flick && hash(Math.floor(t * 14) + i) < .35 ? .1 : 1); LI(c.l, v * 9); c.b.material.color.setScalar(cl(.12 + v, 0, 1)) });
  UW.forEach(u => { const v = (o.uw ?? 0) * (u.lane == 4 ? 1 : 0) * (o.flick && hash(Math.floor(t * 18) + u.lane) < .3 ? .3 : 1); LI(u.l, v * 5); u.g.material.opacity = v * .9 });
  LI(moon, o.moon ?? .35); hemi.intensity = o.hemi ?? .3; hemi.color.setHex(day ? 0xfff4e8 : 0x8aa0c8); R.toneMappingExposure = o.exp ?? 1.4; LI(flash, o.flash ?? 0);
  T.water.offset.set(t * .01, t * .02 * (o.rip ?? 1));
  LI(lrL, o.lr ?? 0); SHW.forEach(s => { if (s.isSprite) { s.material.opacity = (o.steam ?? 0) * .35; s.position.y += 0 } else s.visible = !!o.steam });
  RAIN.visible = !!o.rain; if (o.rain) RAIN.position.y = -((t * 9) % 2.5); LI(stL, o.rain ? 7 : 0); EDOOR.rotation.y = -(o.door ?? 0) * 1.6;
  STEPS.forEach((s, i) => s.visible = i < (o.steps ?? 0));
  LI(rcL, o.rc ? 4 : 0); LI(rcS, o.rc ? 2.5 : 0); LI(btL, o.bt ?? 0);
  const h = o.hand; HAND.visible = !!h; if (h) HAND.position.set(L4 + .05, (h.y ?? .07), h.z ?? .14);
  const e = o.eyes; EYES.visible = !!e; if (e) { EYES.position.set(...e.p); eyeG.material.opacity = e.a ?? .8; EYES.children.forEach(c => c.visible = (e.a ?? .8) > .05) }
}
function splash(t, z, on) { SPL.forEach((s, i) => { s.visible = on > 0; s.position.set(L4 + Math.sin(t * 5 + i * 2) * .3, WY + .12, z - .4 + i * .4); s.material.opacity = on * (.35 + .35 * Math.abs(Math.sin(t * 5 + i * 2))); s.scale.setScalar(.7 + .4 * Math.abs(Math.sin(t * 5 + i))) }) }
function swimmer(t, z, dir, on) { if (!on) { swim.g.visible = false; return } pose(swim, { t, x: L4, y: WY - .25, z, ry: dir > 0 ? 0 : PI, aL: [-PI + Math.sin(t * 5) * 2.4, .2], aR: [-PI - Math.sin(t * 5) * 2.4, .2], noblink: 1 }); swim.g.rotation.x = dir > 0 ? PI / 2 - .1 : PI / 2 - .1; swim.g.rotation.order = 'YXZ'; swim.g.rotation.y = dir > 0 ? 0 : PI; swim.g.position.y = WY - .12 }
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const E = 1.6, LANE = [L4, 0, -18];
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.2, 3.8) * .92 }; hideAll(); const lit = t >= M.on && t < M.off, scare = t > M.sting && t < M.sting + 1.1;
  K1 = K1 || path([[0, [L4 - .2, E, 2.2], [L4, -.2, -14], 54], [Ln.h1.end, [L4 - .3, E, 1.8], [L4, -.3, -9], 50], [Ln.h2.start + 1, [-1.5, E, 2.6], [-6.6, 1.6, -8.5], 56], [M.on - .01, [-1.8, E, 2.4], [-1.2, -.4, -12], 60],
    [M.on, [-2.8, 2.0, 3.6], [0, -.4, -12], 66], [Ln.h3.end, [-2.4, 2.0, 3.2], [.5, -.4, -13], 62], [Ln.y1.start, [L4 - .3, E, 1.6], [L4, -.1, -12], 56], [M.off - .01, [L4 - .2, E, 1.3], [L4, -.1, -10], 54],
    [M.off, [L4 - .2, E, 1.3], [L4, -.1, -10], 54], [Ln.h4.end, [L4 - .1, E, 1.0], [L4, -.2, -6], 50], [M.hand + .6, [L4, E, .75], [L4 + .05, -.1, .05], 54], [Ln.h5.end, [L4, E, .7], [L4 + .05, -.1, .05], 46],
    [Ln.c1.end, [L4, E, .68], [L4 + .05, -.25, -.25], 42], [M.sting, [L4, E, .68], [L4 + .05, -.25, -.3], 40], [M.sting + .2, [L4, E - .1, .6], [L4 + .05, -.3, -.3], 30], [C.dur, [L4, E - .1, .6], [L4 + .05, -.3, -.3], 28]]);
  const c = evalPath(K1, t);
  // laps in the dark: before the lights and after switching them off, approaching for the hand
  const dark1 = t < M.on, dark2 = t >= M.off && t < M.hand;
  let sz = -12, dir = 1, on = 0;
  if (dark1) { const ph = (t * 1.1) % 46; sz = ph < 23 ? -2 - ph : -25 + (ph - 23); dir = ph < 23 ? -1 : 1; on = 1 } else if (dark2) { const k = ramp(t, M.off + .8, M.hand); sz = lerp(-22, -.8, k); dir = 1; on = t > M.off + .8 ? 1 : 0 }
  swimmer(t, sz, dir, on); splash(t, sz, on);
  env({ t, ceil: lit ? 1 : 0, moon: lit ? 0 : .45, hemi: lit ? .6 : .32, exp: lit ? 1.15 : 1.5, hand: t > M.hand ? { y: .075, z: .14 } : null, eyes: t > M.sting ? { p: [L4 + .05, -.45, -.35], a: .9 } : null, rip: lit ? .3 : 1, flick: scare });
  arms(t, {});
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.4, .3, .25), titleY: 380, tint: 'rgba(40,120,160,.12)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.on - .15, M.on + .05, .1, .1), win(t, M.off - .05, M.off + .2, .05, .2)),
    white: (t > M.on && t < M.on + .12 ? .25 : 0) + (scare && t - M.sting < .09 ? .3 : 0), red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .25,
    end: ENDQ(t - M.endcard, 'LE ALUMBRÁS LA CARA', 'TE ALEJÁS DEL BORDE', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, lt = t > M.lights;
  K2 = K2 || path([[0, [L4, E, .75], [L4 + .05, -.1, .05], 46], [Ln.h1.end, [L4 - .2, E, 4.0], [L4 + .05, 0, .1], 50], [M.sink + 2, [L4 - .2, E, 4.2], [L4, 0, .1], 48],
    [M.call + 1, [L4 - .4, E, 4.6], [L4, -.3, -8], 56], [Ln.g2.end, [L4 - .5, E, 4.8], [L4, -.4, -8], 54], [M.lights + 1, [L4 - .5, E, 4.8], [L4, -1.0, -6], 52], [Ln.h4.end, [L4 - .3, E, 3.4], [L4, -1.6, -6], 40],
    [Ln.c1.end, [L4 - .2, E, 3.0], [L4, -1.6, -6], 32], [M.sting, [L4 - .2, E, 3.0], [L4, -1.2, -5.2], 32], [M.sting + .25, [L4 - .15, E, 2.9], [L4, -.8, -4.6], 24], [C.dur, [L4 - .15, E, 2.9], [L4, -.8, -4.6], 22]]);
  const c = evalPath(K2, t);
  const sinkK = sr(t, M.sink, M.sink + 1.5);
  // figure lying on the bottom of lane 4, face up; rises towards the surface at the sting
  if (lt) { const up = sr(t, M.sting - .05, M.sting + .25); pose(fig, { t, x: 0, z: 0, ry: 0, noblink: 1, glow: t > Ln.c1.start ? .7 : .15, aL: [0, .15], aR: [0, .15], eye: 1.2 }); fig.g.rotation.set(-PI / 2, 0, 0); fig.g.position.set(L4, lerp(-1.78, -.55, up), -6 + 1.6 * 0) }
  env({ t, ceil: 0, moon: .4, hemi: .3, exp: 1.45, uw: lt ? 1 : 0, hand: t < M.sink + 1.5 ? { y: .075 - sinkK * .45, z: .14 } : null, flick: scare });
  arms(t, { phone: win(t, M.call + .2, Ln.g2.end + .4, .6, .5) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  phoneScr.material.map = T.call; phoneScr.material.color.setHex(0xffffff); phoneScr.material.needsUpdate = true;
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(40,120,160,.12)', black: 1 - ramp(t, 0, .3), white: (lt && t < M.lights + .1 ? .2 : 0) + (scare && t - M.sting < .09 ? .3 : 0), red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .25,
    alert: { k: Math.min(ramp(t, Ln.h3.end - .2, Ln.h3.end + .2), 1 - ramp(t, Ln.g2.end + .2, Ln.g2.end + .6)), buzz: t < Ln.g1.start ? 1 : 0, kk: 'LLAMANDO', m: 'HUGO (ENCARGADO)', s: t > Ln.g1.start ? 'En llamada…' : 'Llamando…', col: ['#2a8a5a', '#145a34'] },
    end: ENDQ(t - M.endcard, 'SALÍS POR EL VESTUARIO', 'CORRÉS POR EL BORDE', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const lr = t >= M.locker && t < M.out, out = t >= M.out && t < M.day, day = t >= M.day && t < M.night, night = t >= M.night, scare = t > M.sting && t < M.sting + 1.1;
  const X = 40, BX = 120;
  K3 = K3 || path([[0, [5.2, E, -6], [6.5, 1.4, 7.4], 60], [M.locker - .01, [6.3, E, 4.6], [6.5, 1.4, 7.4], 58],
    [M.locker, [X - .3, E, 4.4], [X + 2.4, 1.0, 1.5], 60], [Ln.h2.start + 3.5, [X - .2, E, 3.6], [X + 2.2, 1.0, -.5], 58], [Ln.h2.end - 1.5, [X + .1, E, 2.6], [X + .3, 0, -.5], 52], [Ln.c1.start, [X + .1, E, 2.4], [X + .2, .2, -1.2], 50],
    [Ln.c1.end, [X + .1, E, 2.3], [X + .2, .4, -1.4], 46], [Ln.h3.start + 1.5, [X, E, 0], [X, 1.3, -5], 60], [M.out - .01, [X, E, -4.2], [X, 1.3, -9], 62],
    [M.out, [X, E, -5.8], [X + 1.5, 2.5, -14], 58], [Ln.h4.end, [X - .2, E, -7.2], [X + 1.5, 2.8, -16], 54]]);
  let c;
  if (day) c = { p: [80 + .2, 1.6, 1.8], yaw: PI + .05 - sr(t, M.day, Ln.g1.end) * .08, pitch: -.12, fov: 50 - sr(t, M.day, Ln.g1.end) * 6 };
  else if (night) { const k = sr(t, M.night, M.night + 4); c = { p: [BX + .2, E, lerp(2.2, .4, k)], yaw: PI, pitch: lerp(-.25, -.75, sr(t, Ln.h5.start + 2, M.bub)), fov: lerp(58, 44, sr(t, M.bub, M.sting)) - (t > M.sting ? 10 * sr(t, M.sting, M.sting + .3) : 0) } }
  else c = evalPath(K3, t);
  if (t < M.locker) env({ t, ceil: 0, uw: 1, moon: .4, hemi: .3, exp: 1.45 });
  else if (lr || out) env({ t, lr: lr ? 4 : 0, steam: lr ? 1 : 0, steps: lr ? Math.floor(ramp(t, Ln.h2.start + 4, Ln.h2.end) * 12) : 12, door: sr(t, M.out - 1.5, M.out - .3), rain: t > M.out - 1.2, moon: out ? .3 : .1, hemi: out ? .35 : .45, fogD: out ? .05 : .02, exp: 1.3, flick: lr && t > Ln.c1.start && t < Ln.c1.end + .5 });
  else if (day) { env({ t, day: 1, rc: 1, hemi: .8, exp: 1.1, moon: 0 }); pose(hugo, { t, x: 80 - .2, z: -1.4, ry: 0, look: cam.position, talk: talk('g1', t), brow: .4, aL: [-.6, .1], aR: [-.7, .1] }) }
  else env({ t, bt: 3.5 * (scare ? (hash(Math.floor(t * 16)) < .4 ? .2 : 1) : 1), hemi: .4, moon: 0, exp: 1.25 });
  if (night) { BUB.forEach((b, i) => { const on = t > M.bub - .2 + hash(i) * .5; b.visible = on; const ph = ((t * (.6 + hash(i + 3) * .5) + hash(i + 7)) % 1); b.position.set((hash(i + 1) - .5) * 1.0, lerp(.15, .53, ph), -1.2 + (hash(i + 2) - .5) * .6) }); DARK.material.opacity = sr(t, M.bub, M.sting + .3) * .85 }
  else BUB.forEach(b => b.visible = false);
  arms(t, {});
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.3 : 0)), t < M.locker - .3 || (t > Ln.h3.start + .5 && t < M.out) ? .6 : 0, (scare && t - M.sting < .3) || (t > Ln.c1.start && t < Ln.c1.start + .25) ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: day ? 'rgba(255,220,180,.06)' : 'rgba(40,120,160,.12)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .3), win(t, M.locker - .3, M.locker + .3, .25, .3), win(t, M.day - .3, M.day + .3, .25, .3), win(t, M.night - .3, M.night + .3, .25, .3)), white: scare && t - M.sting < .09 ? .3 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS TE<br>HUBIERAS METIDO<br>AL AGUA?', qs: 118, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

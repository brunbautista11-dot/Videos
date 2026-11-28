// EL PEDIDO — repartidor en moto, camino de tierra con eucaliptos, de noche. POV de Santi. P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, phoneScr, phoneL, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'EL PEDIDO', title: 'EL PEDIDO', titleSize: 168, sleeve: 0x2a2f38, skin: 0xc8946e,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], cosa: ['#ff4558', 'EL DE LA CASA', 1], sop: ['#7dffb0', 'SOPORTE · LLAMADA', 1], mama: ['#ffb36b', 'MAMÁ · LLAMADA', 1] } });
// ------------------------------------------------------------------ textures
T.dirt = tex(256, 256, (g, w, h) => { g.fillStyle = '#6a5440'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, .35, '30,22,14'); speck(g, w, h, 1500, .25, '150,130,100'); g.fillStyle = 'rgba(30,20,10,.25)'; g.fillRect(w * .22, 0, w * .12, h); g.fillRect(w * .66, 0, w * .12, h) }, 2, 60);
T.grass = tex(256, 256, (g, w, h) => { g.fillStyle = '#25331e'; g.fillRect(0, 0, w, h); speck(g, w, h, 6000, .4, '10,20,8'); speck(g, w, h, 2000, .2, '80,100,50') }, 40, 60);
T.bark = tex(128, 256, (g, w, h) => { g.fillStyle = '#b8ad98'; g.fillRect(0, 0, w, h); blot(g, w, h, 30, .35, '120,100,80', 30); for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(90,70,50,${Math.random() * .3})`; g.fillRect(Math.random() * w, Math.random() * h, 3 + Math.random() * 8, 20 + Math.random() * 60) } }, 1, 3);
T.house = tex(256, 256, (g, w, h) => { g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .25, '70,60,50', 70); speck(g, w, h, 2000, .15) }, 2, 1);
T.roof = tex(256, 256, (g, w, h) => { for (let y = 0; y < h; y += 16) { g.fillStyle = `hsl(10,${30 + Math.random() * 10}%,${22 + Math.random() * 6}%)`; g.fillRect(0, y, w, 16); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(0, y + 14, w, 2) } }, 3, 2);
// app screen (dynamic canvas on the phone)
const scC = document.createElement('canvas'); scC.width = 270; scC.height = 570; const scX = scC.getContext('2d'); const SCR = new THREE.CanvasTexture(scC); SCR.colorSpace = THREE.SRGBColorSpace; let scLast = '';
phoneScr.material.map = SCR; phoneScr.material.needsUpdate = true;
function drawScr(mode, k = 0) {
  const key = mode + Math.floor(k * 10); if (key == scLast) return; scLast = key; const g = scX, w = 270, h = 570; g.textAlign = 'center';
  g.fillStyle = mode == 'call' || mode == 'mama' ? '#0f2a1e' : '#14161c'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ff5a2a'; g.fillRect(0, 0, w, 64); g.fillStyle = '#fff'; g.font = '900 26px Inter'; g.fillText(mode == 'call' || mode == 'mama' ? 'LLAMADA' : 'REPARTO YA', w / 2, 42);
  g.fillStyle = '#fff';
  if (mode == 'new' || mode == 'new2') { g.font = '900 30px Inter'; g.fillText('NUEVO PEDIDO', w / 2, 120); g.font = '700 20px Inter'; g.fillStyle = '#aab'; g.fillText('Cliente', w / 2, 175); g.fillStyle = '#fff'; g.font = '900 46px Inter'; g.fillText('SANTI', w / 2, 225);
    g.font = '700 19px Inter'; g.fillStyle = '#aab'; g.fillText('Camino Los Eucaliptos', w / 2, 280); g.fillText('portón verde', w / 2, 306);
    if (mode == 'new2') { g.fillStyle = '#2a2d36'; g.fillRect(20, 340, w - 40, 110); g.fillStyle = '#ffd95a'; g.font = '700 20px Inter'; g.fillText('Nota del cliente:', w / 2, 375); g.font = '900 30px Inter'; g.fillText('Traé para dos.', w / 2, 420) }
    g.fillStyle = '#2aa35a'; g.fillRect(30, 480, w - 60, 60); g.fillStyle = '#fff'; g.font = '900 28px Inter'; g.fillText('ACEPTAR', w / 2, 520) }
  if (mode == 'note') { g.font = '900 26px Inter'; g.fillText('EN CAMINO', w / 2, 115); g.fillStyle = '#2a2d36'; g.fillRect(16, 150, w - 32, 250); g.fillStyle = '#ffd95a'; g.font = '700 20px Inter'; g.fillText('Nota del cliente:', w / 2, 190);
    g.fillStyle = '#fff'; g.font = '900 27px Inter'; ['No toques', 'timbre.', 'Dejalo en la', 'ventana de', 'la cocina.'].forEach((l, i) => g.fillText(l, w / 2, 235 + i * 34)) }
  if (mode == 'done') { g.fillStyle = '#2aa35a'; g.beginPath(); g.arc(w / 2, 150, 50, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2 - 22, 150); g.lineTo(w / 2 - 4, 168); g.lineTo(w / 2 + 24, 134); g.stroke();
    g.fillStyle = '#fff'; g.font = '900 34px Inter'; g.fillText('ENTREGADO', w / 2, 250); g.fillStyle = '#ffd95a'; g.font = '900 40px Inter'; g.fillText('★★★★★', w / 2, 305); g.fillStyle = '#fff'; g.font = 'italic 700 26px Inter'; g.fillText('"Gracias, Santi.', w / 2, 370); g.fillText('Volvé."', w / 2, 404) }
  if (mode == 'map') { g.fillStyle = '#1e2a22'; g.fillRect(0, 64, w, h - 64); g.strokeStyle = '#6a5a40'; g.lineWidth = 18; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 150); g.stroke(); g.fillStyle = '#3a5a3a'; for (let y = 90; y < h; y += 40) { g.beginPath(); g.arc(w / 2 - 50, y, 12, 0, 7); g.arc(w / 2 + 50, y + 20, 12, 0, 7); g.fill() }
    g.fillStyle = '#c8c0b0'; g.fillRect(w / 2 - 40, 100, 80, 50); g.fillStyle = '#ffd95a'; g.fillRect(w / 2 + 10, 115, 18, 14);
    const dot = (y, c, lab) => { g.fillStyle = c; g.beginPath(); g.arc(w / 2, y, 16, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#fff'; g.font = '900 18px Inter'; g.fillText(lab, w / 2 + 62, y + 6) };
    dot(330, '#ff5a2a', 'SANTI'); dot(330 + 44 - 40 * k, '#ff5a2a', 'SANTI') }
  if (mode == 'call' || mode == 'mama') { g.fillStyle = '#3a6a5a'; g.beginPath(); g.arc(w / 2, 200, 62, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '900 56px Inter'; g.fillText(mode == 'call' ? 'S' : 'M', w / 2, 220); g.font = '900 34px Inter'; g.fillText(mode == 'call' ? 'SOPORTE' : 'MAMÁ', w / 2, 320); g.font = '700 20px Inter'; g.fillStyle = '#aab'; g.fillText('en llamada…', w / 2, 352);
    g.fillStyle = '#c8141f'; g.beginPath(); g.arc(w / 2, 480, 36, 0, 7); g.fill() }
  SCR.needsUpdate = true;
}
// ------------------------------------------------------------------ world: dirt road along -Z (x = 0), house at z = -60
const W = grp(scene);
const road = add(W, new THREE.PlaneGeometry(4.2, 160), new THREE.MeshLambertMaterial({ map: T.dirt }), 0, .01, 0, 2); road.rotation.x = -PI / 2;
const field = add(W, new THREE.PlaneGeometry(240, 240), new THREE.MeshLambertMaterial({ map: T.grass }), 0, 0, 0, 2); field.rotation.x = -PI / 2;
const barkM = new THREE.MeshLambertMaterial({ map: T.bark }), leafM = [mat(0x1e2e22), mat(0x26382a), mat(0x18261c)];
const TREES = [];
function tree(x, z, s = 1, i = 0) { const g = grp(W); g.position.set(x, 0, z); const tr = add(g, G.cyl, barkM, 0, 6 * s, 0, 1); tr.scale.set(.28 * s, 12 * s, .28 * s); tr.rotation.z = (hash(i) - .5) * .08;
  for (let k = 0; k < 5; k++) { const l = sph(g, 1, leafM[k % 3], (hash(i * 7 + k) - .5) * 3 * s, (9 + hash(i * 3 + k) * 4) * s, (hash(i * 5 + k) - .5) * 3 * s, 0); l.scale.set(2.2 * s, 1.6 * s, 2.2 * s) } TREES.push(g); return g }
for (let i = 0; i < 34; i++) { const z = 70 - i * 4.2; if (z < -50 && z > -66) continue; tree(-4.2 - hash(i) * 1.2, z, .9 + hash(i + 9) * .3, i); tree(4.2 + hash(i + 3) * 1.2, z + 2, .9 + hash(i + 19) * .3, i + 50) }
for (let i = 0; i < 14; i++) tree(-5.8 - hash(i + 70) * 2, -40 - i * 1.6, 1, i + 90); // the grove where Santi hides (P3)
const fence = []; for (let z = 70; z > -50; z -= 3) for (const s of [-1, 1]) { const p = add(W, G.cyl, mat(0x4a3a2a), s * 2.7, .55, z, 0); p.scale.set(.05, 1.1, .05) } for (const s of [-1, 1]) for (const y of [.5, .9]) box(W, .02, .02, 120, mat(0x6a6a6a), s * 2.7, y, 10, 0);
// gate (portón verde)
const GATE = grp(W); GATE.position.set(0, 0, -52); const gM = mat(0x2f6a3a); for (const s of [-1, 1]) box(GATE, .22, 2.0, .22, mat(0x8a8478), s * 2.3, 1.0, 0, 1);
const gL = grp(GATE); gL.position.set(-2.2, 0, 0); for (let i = 0; i < 9; i++) box(gL, .05, 1.5, .05, gM, .12 + i * .24, .85, 0, 1); for (const y of [.2, 1.55]) box(gL, 2.1, .07, .06, gM, 1.05, y, 0, 1); gL.rotation.y = .5;
const gR = grp(GATE); gR.position.set(2.2, 0, 0); for (let i = 0; i < 9; i++) box(gR, .05, 1.5, .05, gM, -.12 - i * .24, .85, 0, 1); for (const y of [.2, 1.55]) box(gR, 2.1, .07, .06, gM, -1.05, y, 0, 1); gR.rotation.y = -.4;
// house (front wall at z = -57, kitchen window at x = 1.8 with a lit room behind)
const H = grp(W); H.position.set(0, 0, -60); const hM = new THREE.MeshLambertMaterial({ map: T.house });
box(H, 9, 3.2, .3, hM, 0, 1.6, -3.2, 1); box(H, .3, 3.2, 6.6, hM, -4.5, 1.6, 0, 1); box(H, .3, 3.2, 6.6, hM, 4.5, 1.6, 0, 1);
// front wall with window hole x 1.2..2.4, y 1.0..2.1
box(H, 5.7, 3.2, .3, hM, -1.65, 1.6, 3.15, 1); box(H, 2.1, 3.2, .3, hM, 3.45, 1.6, 3.15, 1); box(H, 1.2, 1.0, .3, hM, 1.8, .5, 3.15, 1); box(H, 1.2, 1.1, .3, hM, 1.8, 2.65, 3.15, 1);
for (const r of [-1, 1]) { const rf = add(H, new THREE.BoxGeometry(9.6, .15, 4.0), new THREE.MeshLambertMaterial({ map: T.roof }), 0, 3.85, r * 1.7, 1); rf.rotation.x = r * .5 }
box(H, 1.0, 2.1, .08, mat(0x3a2a1e), -1.5, 1.05, 3.32, 0); for (const x of [-3.4]) box(H, 1.1, 1.0, .06, mat(0x0a0a0c), x, 1.6, 3.32, 0);
for (const [x, y, w, h] of [[1.8, 2.1, 1.3, .08], [1.8, 1.0, 1.3, .08], [1.2, 1.55, .08, 1.15], [2.4, 1.55, .08, 1.15], [1.8, 1.55, .05, 1.1]]) box(H, w, h, .08, mat(0x5a4a3a), x, y, 3.32, 0);
// kitchen interior
const KIT = grp(H); box(KIT, 3.2, .05, 2.4, mat(0x7a6a5a), 1.8, .02, 1.7, 2); box(KIT, 3.2, 2.6, .05, mat(0xd8c098), 1.8, 1.3, .5, 2); box(KIT, .05, 2.6, 2.4, mat(0xd8c098), .2, 1.3, 1.7, 2); box(KIT, .05, 2.6, 2.4, mat(0xd8c098), 3.4, 1.3, 1.7, 2); box(KIT, 3.2, .05, 2.4, mat(0xc8b898), 1.8, 2.6, 1.7, 0);
box(KIT, 1.4, .06, .8, mat(0xe8e0d0), 1.8, .78, 2.1, 1); for (const x of [1.4, 2.2]) { const p = add(KIT, new THREE.CylinderGeometry(.13, .1, .02, 18), mat(0xf2f2ee), x, .82, 2.15, 0) } for (const [x, z] of [[1.2, 1.8], [2.4, 1.8], [1.2, 2.4], [2.4, 2.4]]) box(KIT, .05, .78, .05, mat(0x5a4030), x, .39, z, 0);
const bulb = sph(KIT, .07, basic(0xffe0a0), 1.8, 2.3, 1.6, 0); const kL = new THREE.PointLight(0xffc880, 0, 9, 1.2); kL.position.set(1.8, 2.2, 1.9); KIT.add(kL); const kG = glowSprite(KIT, 0xffb060, 1.6, 1.8, 1.55, 3.4);
const winL = new THREE.SpotLight(0xffb870, 0, 14, .7, .7, 1.2); winL.position.set(1.8, 1.6, 2.6); H.add(winL); winL.target.position.set(1.8, 0, 8); H.add(winL.target);
// sky
const moon = new THREE.DirectionalLight(0x9ab8ff, 0); moon.position.set(-30, 40, -60); scene.add(moon, moon.target); const moonS = glowSprite(W, 0xdfe8ff, 14, -40, 45, -120);
const sun = new THREE.DirectionalLight(0xffc890, 0); sun.position.set(40, 10, -80); scene.add(sun, sun.target); const sunG = glowSprite(W, 0xffa060, 60, 50, 6, -140);
const STARS = []; for (let i = 0; i < 70; i++) STARS.push(glowSprite(W, 0xffffff, .6 + hash(i) * .8, (hash(i + 1) - .5) * 220, 25 + hash(i + 2) * 50, -60 - hash(i + 3) * 80 + (hash(i + 4) < .3 ? 160 : 0)));
// motorbikes (mine parked at the gate in P2/P3; the other one)
function moto(col) { const g = grp(W); for (const z of [-.7, .7]) { const w = add(g, new THREE.TorusGeometry(.3, .09, 10, 20), mat(0x151515), 0, .36, z, 1); w.rotation.y = PI / 2 }
  box(g, .3, .35, 1.1, mat(col), 0, .7, 0, 1); box(g, .3, .12, .6, mat(0x1a1a1a), 0, .93, .25, 1); const bx = box(g, .5, .45, .45, mat(0xd8401a), 0, 1.25, .55, 1); box(g, .7, .04, .04, mat(0x222222), 0, 1.15, -.65, 0);
  const hl = glowSprite(g, 0xfff4d0, 1.4, 0, .95, -.82); const sp = new THREE.SpotLight(0xfff0d0, 0, 40, .42, .5, 1.1); sp.position.set(0, .95, -.85); g.add(sp); sp.target.position.set(0, 0, -12); g.add(sp.target); return { g, hl, sp, bx } }
const MINE = moto(0x8a1a1a), OTH = moto(0x8a1a1a);
const rider = makeChar({ skin: 0xc8946e, shirt: 0x2a2f38, pants: 0x1a1c22, hair: 0x101010, style: 'short', noface: 1, h: 1.0, seed: 61 });
const helm = sph(rider.head, .26, new THREE.MeshPhongMaterial({ color: 0x111114, shininess: 90 }), 0, .2, 0, 1); helm.scale.set(.25, .27, .27); const visor = sph(rider.head, .2, new THREE.MeshPhongMaterial({ color: 0x050507, shininess: 120, specular: 0x8899aa }), 0, .18, .09, 0); visor.scale.set(.2, .13, .19);
box(rider.up, .42, .48, .22, mat(0xd8401a), 0, .3, -.24, 1);
const figure = makeChar({ skin: 0x2a2624, shirt: 0x26201c, pants: 0x1a1816, hair: 0x15151a, style: 'short', noface: 1, h: 1.02, seed: 62 }); H.add(figure.g);
// handlebars (riding POV)
const BARS = grp(rig); { const bm = mat(0x1a1a1c); const b = add(BARS, G.cyl, bm, 0, -.37, -.7, 0); b.scale.set(.016, .8, .016); b.rotation.z = PI / 2; for (const s of [-1, 1]) { const gr = add(BARS, G.cyl, mat(0x0a0a0a), s * .34, -.37, -.7, 0); gr.scale.set(.024, .14, .024); gr.rotation.z = PI / 2; const mi = add(BARS, new THREE.CircleGeometry(.05, 16), new THREE.MeshPhongMaterial({ color: 0x8899aa, shininess: 120 }), s * .3, -.22, -.7, 0); }
  box(BARS, .22, .1, .12, mat(0x8a1a1a), 0, -.43, -.8, 0); const dial = add(BARS, new THREE.CircleGeometry(.045, 20), basic(0x2a3a4a), -.16, -.35, -.76, 0); dial.rotation.x = -.6; box(BARS, .03, .12, .03, bm, 0, -.39, -.6, 0) }
ARMP.bars = t => [[.33, -.35, -.68, -1.3, 0, .2], [-.33, -.35, -.68, -1.3, 0, -.2]];
ARMP.barsL = t => [[.33, -.35, -.68, -1.3, 0, .2], [-.33, -.35, -.68, -1.3, 0, -.2]];
function mountPhone(k = 0) { phone.visible = true; phone.position.set(0, lerp(-.27, -.12, k), lerp(-.62, -.4, k)); phone.rotation.set(lerp(-.5, -.12, k), 0, 0); phone.scale.setScalar(1.15) }
// ------------------------------------------------------------------ environment
const cN = new THREE.Color(0x0e1422), cDawn = new THREE.Color(0xd89878);
function env(o) {
  const t = o.t, dawn = o.dawn ?? 0; bg.copy(cN).lerp(cDawn, dawn); scene.fog.color.copy(bg); scene.fog.density = o.fogD ?? .028;
  LI(moon, (1 - dawn) * .9); moonS.material.opacity = 1 - dawn; LI(sun, dawn * 2); sunG.material.opacity = dawn; STARS.forEach(s => s.material.opacity = (1 - dawn) * .8);
  hemi.intensity = o.hemi ?? (.55 + dawn * .7); hemi.color.setHex(dawn ? 0xffe8d8 : 0x8ea4d0); R.toneMappingExposure = o.exp ?? 1.35;
  const k = (o.kitchen ?? 1) * (o.flick && hash(Math.floor(t * 14)) < .35 ? .15 : 1); LI(kL, k * 6); LI(winL, k * 5); bulb.material.color.setScalar(cl(k, .1, 1)); kG.material.opacity = k * .7;
  LI(flash, o.head ?? 0); flash.angle = .5; BARS.visible = !!o.bars; phoneScr.material.color.setScalar(o.scrB ?? 1); LI(phoneL, o.scr ? .6 : 0);
  const m = o.mine; MINE.g.visible = !!m; if (m) { MINE.g.position.set(...m.p); MINE.g.rotation.y = m.ry ?? 0; LI(MINE.sp, m.light ?? 0); MINE.hl.material.opacity = m.light ? .9 : 0 }
  const b = o.oth; OTH.g.visible = !!b; if (b) { OTH.g.position.set(...b.p); OTH.g.rotation.y = b.ry ?? 0; LI(OTH.sp, b.light ?? 1 * 6); OTH.hl.material.opacity = b.glow ?? .95; OTH.hl.scale.setScalar(b.gs ?? 1.4) }
  gL.rotation.y = 1.45; gR.rotation.y = -1.45;
}
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const RY = 1.5, WIN = [1.8, 1.55, -56.8], MP = [1.8, 0, -49.6];
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.2, 3.8) * .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, ride = t < M.house - .6;
  const z = ride ? lerp(62, -47.5, ss(ramp(t, 0, M.house - .6)) * .3 + ramp(t, 0, M.house - .6) * .7) : -47.5;
  const look = t < 3.4 ? 1 - sr(t, 2.4, 3.4) : win(t, M.note, Ln.h4.end + .2, .5, .5);
  K1 = K1 || path([[M.house - .6, [.4, RY, -47.5], [1.2, 1.4, -57], 56], [Ln.h5.start + 2, [.8, RY, -49.0], WIN, 48], [Ln.h5.end, [1.2, RY, -50.5], WIN, 40],
    [Ln.c1.end, [1.4, RY, -51.2], WIN, 32], [M.sting, [1.4, RY, -51.2], WIN, 30], [M.sting + .2, [1.45, RY, -51.6], WIN, 22], [C.dur, [1.45, RY, -51.6], WIN, 21]]);
  let c; if (ride) c = { p: [.4 + Math.sin(t * .4) * .15, RY, z], yaw: PI + Math.sin(t * .5) * .03, pitch: lerp(-.05, -.12, look), fov: 62 }; else c = evalPath(K1, t);
  // figure: sets the table, then turns to the window; at the sting it is at the glass
  const turn = sr(t, Ln.c1.start - .5, Ln.c1.start + .6), atWin = t > M.sting;
  pose(figure, { t, x: atWin ? 1.8 : lerp(1.3, 1.9, (Math.sin(t * .8) + 1) / 2 * (1 - turn)), z: atWin ? 2.85 : 1.55, ry: lerp(PI / 2, 0, turn), talk: talk('c1', t), aR: [-1.0 * (1 - turn), .1], aL: [-.9 * (1 - turn) - (atWin ? 1.5 : 0), .1], noblink: 1 });
  drawScr(t < M.note - .5 ? 'new' : 'note');
  env({ t, head: ride ? 12 : 0, bars: true, scr: 1, kitchen: 1, flick: scare, mine: null });
  arms(t, { bars: 1 }); mountPhone(ride ? look : 0);
  setCam(c, t, ride ? 1.2 : cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  if (ride) { cam.position.y += Math.sin(t * 9) * .012 + (hash(Math.floor(t * 20)) - .5) * .01 }
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.4, .3, .25), titleY: 380, tint: 'rgba(40,70,140,.12)', black: 1 - ramp(t, 0, .35),
    alert: { k: Math.max(Math.min(ramp(t, .1, .5), 1 - ramp(t, 3.0, 3.4)), Math.min(ramp(t, M.note, M.note + .3), 1 - ramp(t, Ln.h4.end, Ln.h4.end + .3))), buzz: t < 1.2 ? 1 : 0, kk: t < 4 ? 'REPARTO YA · 01:04' : 'NOTA DEL CLIENTE', m: t < 4 ? 'NUEVO PEDIDO: SANTI' : 'NO TOQUES TIMBRE', s: t < 4 ? 'Camino Los Eucaliptos · portón verde' : 'Dejalo en la ventana de la cocina.', col: ['#ff6a2a', '#b8360c'] },
    white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .25,
    end: ENDQ(t - M.endcard, 'ENTRÁS A LA CASA', 'LO DEJÁS Y TE VAS', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, onBike = t > M.start - .3;
  const BK = [MP[0], RY, MP[2] + .1];
  K2 = K2 || path([[0, [1.8, 1.6, -55.9], [1.8, 1.3, -49], 60], [M.start - .3, [1.7, 1.6, -50.6], [1.8, 1.2, -45], 60], [M.start, BK, [1.8, 1.3, -40], 58], [M.app - .2, BK, [1.8, 1.3, -40], 58],
    [M.app + .5, BK, { yaw: 180, pitch: -8 }, 56], [Ln.h4.end, BK, { yaw: 180, pitch: -8 }, 54],
    [M.ring + 1, BK, [1.4, 1.6, -57], 50], [Ln.y1.end, BK, [1.6, 1.5, -57], 46], [Ln.s2.end, BK, WIN, 38], [M.light + .8, [1.75, RY, -49.4], [0, 1.2, -20], 56], [Ln.h5.end, [1.75, RY, -49.4], [0, 1.1, -22], 46],
    [M.sting, [1.75, RY, -49.4], [0, 1.1, -22], 44], [M.sting + .25, [1.75, RY, -49.4], [.2, 1.1, -24], 30], [C.dur, [1.75, RY, -49.4], [.2, 1.1, -24], 28]]);
  const c = evalPath(K2, t);
  drawScr(t < M.map ? 'done' : t < M.ring ? 'map' : 'call', t < M.ring ? sr(t, M.map, M.ring) : 0);
  const near = sr(t, M.light, M.sting + .2);
  env({ t, head: 0, bars: onBike, scr: 1, kitchen: 1, mine: onBike ? null : { p: MP, ry: 0 }, oth: t > M.light ? { p: [-.3, 0, lerp(-14, -38, near)], ry: 0, light: 8, glow: 1, gs: lerp(1.6, 3.4, near) + (scare ? 2 : 0) } : null });
  if (t > M.light) { const oz = lerp(-14, -38, near); pose(rider, { t, x: -.3, y: .25, z: oz + .15, ry: 0, sit: 1, aL: [-1.25, .1], aR: [-1.25, .1] }) }
  arms(t, onBike ? { bars: t < M.app || t > M.ring ? 1 : 0, barsL: t > M.app && t < M.ring ? 1 : 0 } : { rest: 1 }); if (onBike) mountPhone(win(t, M.app, Ln.h4.end + .2, .5, .5)); else phone.visible = false;
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)) + (t > M.start && t < M.start + 3 ? 1.5 : 0), t < M.start - .3 ? .5 : 0, scare && t - M.sting < .3 ? 1 : 0);
  const sl = ['s1', 's2'].find(id => t > Ln[id].start - 1.5 && t < Ln[id].end + .4) || (t > M.ring && t < Ln.s2.end + .4 ? 's1' : null);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(40,70,140,.12)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .25,
    alert: t > M.ring - .1 && t < Ln.s2.end + .5 ? { k: Math.min(ramp(t, M.ring, M.ring + .35), 1 - ramp(t, Ln.s2.end + .1, Ln.s2.end + .5)), buzz: t < Ln.s1.start ? 1 : 0, kk: 'LLAMADA ENTRANTE', m: 'SOPORTE APP', s: t > Ln.s1.start ? 'En llamada…' : 'Llamando…', col: ['#2a8a5a', '#145a34'] }
      : { k: Math.min(ramp(t, M.app, M.app + .35), 1 - ramp(t, Ln.h3.end, Ln.h3.end + .4)), kk: 'REPARTO YA', m: 'ENTREGADO ★★★★★', s: '"Gracias, Santi. Volvé."', col: ['#ff6a2a', '#b8360c'] },
    end: ENDQ(t - M.endcard, 'ESPERÁS QUE PASE', 'CORRÉS AL CAMPO', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const dawnS = t >= M.dawn && t < M.night, night = t >= M.night, scare = t > M.sting && t < M.sting + 1.1;
  const HID = [-4.4, 1.15, -43.6];
  K3 = K3 || path([[0, HID, [0, 1.0, -30], 52], [M.pass, HID, [0, 1.0, -36], 50], [Ln.h2.start + 4, HID, [.6, 1.1, -46], 44], [Ln.h2.end, [-4.3, 1.15, -43.8], [.6, 1.2, -49.5], 44],
    [Ln.o1.end, [-4.3, 1.15, -43.9], [.6, 1.3, -49.5], 38], [M.gate + .5, [-4.3, 1.2, -43.9], [.6, 1.4, -53], 42], [M.dawn - .01, [-4.3, 1.25, -44], WIN, 40]]);
  let c;
  if (dawnS) { const z = lerp(-46, 20, ramp(t, M.dawn, M.night)); c = { p: [.4 + Math.sin(t * .4) * .12, RY, z], yaw: Math.sin(t * .5) * .03, pitch: -.05, fov: 62 } }
  else if (night) c = { p: [.8, 1.55, 30], yaw: PI, pitch: -.06, fov: 56 - (t > M.sting ? 14 * sr(t, M.sting, M.sting + .3) : 0) };
  else c = evalPath(K3, t);
  if (!dawnS && !night) {
    const arr = sr(t, M.pass, Ln.h2.start + 7), go = sr(t, M.gate, M.gate + 3.5), oz = lerp(lerp(-26, -49.4, arr), -57.5, go), ox = lerp(.4, lerp(.4, 1.0, go), 1);
    const turnH = sr(t, Ln.h2.end - 2, Ln.h2.end - .5) * (1 - sr(t, Ln.o1.end, Ln.o1.end + .6));
    env({ t, head: 0, kitchen: 1 - sr(t, Ln.h3.start + 2.2, Ln.h3.start + 2.5), mine: { p: MP, ry: 0 }, oth: { p: [ox, 0, oz], ry: 0, light: 8, glow: .95 }, gateOpen: go, exp: 1.45 });
    pose(rider, { t, x: ox, y: .25, z: oz + .15, ry: 0, sit: 1, hyAbs: -1.25 * turnH, hp: -.1 * turnH, aL: [-1.25, .1], aR: [-1.25, .1], talk: talk('o1', t) });
  } else if (dawnS) {
    drawScr('mama'); env({ t, dawn: 1, head: 0, bars: 1, scr: 1, kitchen: 0, fogD: .02, exp: 1.1 });
  } else {
    drawScr('new2'); env({ t, head: 0, scr: 1, kitchen: t > M.sting ? 1 : 0, fogD: .01, mine: { p: [2.4, 0, 28.6], ry: PI }, exp: 1.3 });
  }
  arms(t, dawnS ? { bars: 1 } : night ? { phone: 1 } : { rest: 0 }); if (dawnS) mountPhone(.45 * win(t, M.ring, Ln.m1.end, .6, .5)); else if (!night) phone.visible = false; else { phone.scale.setScalar(1) }
  if (!dawnS && !night) { rig.visible = false } else rig.visible = true;
  setCam(c, t, dawnS ? 1.1 : cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.3 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  if (dawnS) cam.position.y += Math.sin(t * 9) * .012;
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: dawnS ? 'rgba(255,170,110,.12)' : 'rgba(40,70,140,.12)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .3), win(t, M.dawn - .3, M.dawn + .3, .25, .3), win(t, M.night - .3, M.night + .3, .25, .3)), white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .2,
    alert: dawnS && t > M.ring - .1 ? { k: Math.min(ramp(t, M.ring, M.ring + .35), 1 - ramp(t, Ln.m1.end + .1, Ln.m1.end + .5)), buzz: t < Ln.m1.start ? 1 : 0, kk: 'LLAMADA ENTRANTE', m: 'MAMÁ', s: t > Ln.m1.start ? 'En llamada…' : 'Llamando…', col: ['#2a8a5a', '#145a34'] }
      : night ? { k: Math.min(ramp(t, M.notif - .1, M.notif + .25), 1 - ramp(t, M.endcard - .3, M.endcard)), buzz: t < M.notif + .8 ? 1 : 0, kk: 'REPARTO YA · 00:58', m: 'NUEVO PEDIDO: SANTI', s: 'Nota: "Traé para dos."', col: ['#ff6a2a', '#b8360c'] } : null,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS HUBIERAS<br>ENTRADO A<br>LA CASA?', qs: 118, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

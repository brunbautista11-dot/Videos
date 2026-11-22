// SURTIDOR 3 — estación de servicio en la ruta, de madrugada, POV de Bruno (playero). P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'SURTIDOR 3', title: 'SURTIDOR 3', titleSize: 170, sleeve: 0xd0502a, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], nes: ['#7dffb0', 'NÉSTOR', 0], tel: ['#ffb84d', 'NÉSTOR · TELÉFONO', 1], cosa: ['#ff4558', 'EL CHOFER', 1], julio: ['#c8b0ff', '???', 1] } });
// ------------------------------------------------------------------ textures
T.conc = tex(256, 256, (g, w, h) => { g.fillStyle = '#8a8a86'; g.fillRect(0, 0, w, h); blot(g, w, h, 30, .15, '40,40,40', 60); speck(g, w, h, 3000, .15); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h) }, 8, 6);
T.road = tex(512, 128, (g, w, h) => { g.fillStyle = '#26282c'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .25, '120,120,120'); g.fillStyle = '#e8e0c0'; g.fillRect(0, h / 2 - 3, w * .45, 6); g.fillRect(0, 4, w, 3); g.fillRect(0, h - 7, w, 3) }, 30, 1);
T.field = tex(256, 256, (g, w, h) => { g.fillStyle = '#1e2a18'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .3, '60,80,40'); blot(g, w, h, 30, .2, '10,15,8', 60) }, 40, 40);
T.sign = tex(512, 128, (g, w, h) => { g.fillStyle = '#c8301e'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 70px Inter'; g.textAlign = 'center'; g.fillText('ESTACIÓN RUTA', w / 2, 90) });
T.shop = tex(256, 256, (g, w, h) => { g.fillStyle = '#3a3d42'; g.fillRect(0, 0, w, h); const P = ['#d23a2c', '#f2c230', '#2f7fd0', '#e8e2d0', '#3aa35a']; for (let r = 0; r < 4; r++) for (let x = 4; x < w - 20; x += 22) { g.fillStyle = P[Math.floor(Math.random() * 5)]; g.fillRect(x, r * 64 + 14, 18, 44) } });
T.tag = tex(128, 48, (g, w, h) => { g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; g.font = '900 30px Inter'; g.textAlign = 'center'; g.fillText('JULIO', w / 2, 35) });
const num3 = n => tex(128, 128, (g, w, h) => { g.fillStyle = '#c8301e'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 96px Inter'; g.textAlign = 'center'; g.fillText(n, w / 2, 100) });
const dispC = document.createElement('canvas'); dispC.width = 256; dispC.height = 128; const dispX = dispC.getContext('2d'); const DISP = new THREE.CanvasTexture(dispC); DISP.colorSpace = THREE.SRGBColorSpace; let dispLast = '';
function drawDisp(txt, on) { const k = txt + on; if (k == dispLast) return; dispLast = k; const g = dispX; g.fillStyle = '#0a0f0a'; g.fillRect(0, 0, 256, 128); if (on) { g.fillStyle = '#7dff6a'; g.font = '700 22px monospace'; g.fillText('LITROS', 14, 30); g.font = '900 62px monospace'; g.textAlign = 'right'; g.fillText(txt, 244, 100); g.textAlign = 'left' } DISP.needsUpdate = true }
// ------------------------------------------------------------------ world
const W = grp(scene);
const fld = add(W, new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ map: T.field }), 0, -.03, 0, 2); fld.rotation.x = -PI / 2;
const concM = new THREE.MeshLambertMaterial({ map: T.conc }); const fc = add(W, new THREE.PlaneGeometry(26, 14), concM, 0, 0, 3.5, 2); fc.rotation.x = -PI / 2;
const road = add(W, new THREE.PlaneGeometry(400, 8), new THREE.MeshLambertMaterial({ map: T.road }), 0, .005, 14.5, 2); road.rotation.x = -PI / 2;
// canopy
const CAN = grp(W); box(CAN, 13, .5, 7.5, mat(0xe8e8e4), 0, 4.8, 4.5, 1); box(CAN, 13.1, .3, 7.6, mat(0xc8301e), 0, 4.55, 4.5, 0);
const panM = basic(0xffffff); for (const x of [-4.5, -1.5, 1.5, 4.5]) for (const z of [3, 6]) box(CAN, 1.6, .03, .6, panM, x, 4.53, z, 0);
for (const x of [-5.5, 5.5]) for (const z of [2.5, 6.5]) box(CAN, .35, 4.6, .35, mat(0xdcdcd8), x, 2.3, z, 3);
const canL = [-3.5, 3.5].map(x => { const l = new THREE.PointLight(0xf2f6ff, 0, 16, 1.0); l.position.set(x, 4.2, 4.5); W.add(l); return l });
// pumps (1..3 along X, island at z = 4.5)
const PUMPS = []; [-3.5, 0, 3.5].forEach((x, i) => { const g = grp(W); g.position.set(x, 0, 4.5); box(g, 2.2, .2, .9, mat(0x9a9a96), 0, .1, 0, 3); box(g, .7, 1.7, .45, mat(0xf0f0ec), 0, 1.05, 0, 3); box(g, .72, .3, .47, mat(0xc8301e), 0, 1.75, 0, 0);
  add(g, new THREE.PlaneGeometry(.3, .3), basic(0xffffff, { map: num3(i + 1) }), 0, 2.1, .24, 0); box(g, .32, .32, .02, mat(0xc8301e), 0, 2.1, .228, 0);
  const d = add(g, new THREE.PlaneGeometry(.5, .25), i == 2 ? new THREE.MeshBasicMaterial({ map: DISP }) : basic(0x0a0f0a), 0, 1.4, .23, 0); box(g, .1, .25, .1, mat(0x1a1a1a), .3, 1.0, .26, 0);
  PUMPS.push({ g, d }) });
const HOSE = add(W, G.cyl, mat(0x151515), 0, 0, 0, 0);
// shop (glass front at z = -1)
const SHOP = grp(W); box(SHOP, 10, .2, 6, mat(0xb8b4aa), 0, .1, -4, 2); box(SHOP, 10, 3.4, .2, mat(0xd8d4cc), 0, 1.7, -7, 2); box(SHOP, .2, 3.4, 6, mat(0xd8d4cc), -5, 1.7, -4, 2); box(SHOP, .2, 3.4, 6, mat(0xd8d4cc), 5, 1.7, -4, 2); box(SHOP, 10, .2, 6, mat(0xe0dcd4), 0, 3.4, -4, 0);
box(SHOP, 10, .6, .2, mat(0xc8301e), 0, 3.1, -1, 0); box(SHOP, 3.2, .8, .02, basic(0xffffff, { map: T.sign }), 0, 3.1, -.88, 0);
const sGlass = new THREE.MeshPhongMaterial({ color: 0x9ab8c8, transparent: true, opacity: .14, specular: 0xffffff, shininess: 80, depthWrite: false }); add(SHOP, new THREE.PlaneGeometry(10, 2.8), sGlass, 0, 1.4, -1, 0);
for (const x of [-5, -2.5, 0, 2.5, 5]) box(SHOP, .1, 2.8, .12, mat(0x6a6a6a), x, 1.4, -1, 0);
box(SHOP, 3, 1.0, .7, mat(0x7a4a2a), -1.5, .5, -3.2, 3); box(SHOP, 3.1, .06, .8, mat(0x3a3a3a), -1.5, 1.02, -3.2, 0); box(SHOP, .4, .3, .3, mat(0x222222), -2.4, 1.2, -3.3, 0);
for (const x of [-4.2, 3.6]) { box(SHOP, .5, 2, 3, mat(0x6d7178), x, 1, -4.5, 3); const p = add(SHOP, new THREE.PlaneGeometry(3, 1.9), new THREE.MeshLambertMaterial({ map: T.shop }), x + (x < 0 ? .26 : -.26), 1, -4.5, 0); p.rotation.y = x < 0 ? PI / 2 : -PI / 2 }
const shopL = new THREE.PointLight(0xfff4e0, 0, 10, 1.1); shopL.position.set(0, 3, -4); W.add(shopL); const shopM = basic(0xffffff); for (const x of [-2.5, 2.5]) box(SHOP, 1.8, .04, .3, shopM, x, 3.3, -4, 0);
// totem sign + highway lights far away
const TOT = grp(W); TOT.position.set(-8, 0, 10); box(TOT, .3, 6, .3, mat(0x555555), 0, 3, 0, 0); box(TOT, 2.2, 1.4, .3, basic(0xffffff, { map: T.sign }), 0, 6.2, 0, 0);
// sky: dawn glow on the horizon (+X / east)
const sunG = glowSprite(W, 0xffb070, 60, 120, 4, 30); const starG = new THREE.BufferGeometry(); { const a = new Float32Array(500 * 3); for (let i = 0; i < 500; i++) { const th = hash(i) * 2 * PI, ph = .1 + hash(i * 2.3) * 1.3; a[i * 3] = Math.cos(th) * Math.cos(ph) * 180; a[i * 3 + 1] = Math.sin(ph) * 180; a[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 180 } starG.setAttribute('position', new THREE.BufferAttribute(a, 3)) }
const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xcfe0ff, size: .9, transparent: true, fog: false, depthWrite: false })); W.add(stars);
const sun = new THREE.DirectionalLight(0xffd0a0, 0); sun.position.set(60, 12, 20); W.add(sun, sun.target);
// ------------------------------------------------------------------ car (faces +X, driver on -Z side towards the pumps)
const CAR = grp(W), carM = mat(0x2d4a3a), chromeM = mat(0xb8bcc0);
box(CAR, 4.4, .62, 1.8, carM, 0, .62, 0, 3); box(CAR, 4.5, .12, 1.84, chromeM, 0, .36, 0, 0); box(CAR, 2.36, .07, 1.66, carM, -.3, 1.56, 0, 1); for (const x of [-1.42, -.3, .82]) for (const z of [-.79, .79]) box(CAR, .1, .62, .06, carM, x, 1.24, z, 0);
const fogM = new THREE.MeshLambertMaterial({ color: 0xa8b4bc, transparent: true, opacity: .7, emissive: 0xffc070, emissiveIntensity: 0, depthWrite: false });
const WIN = { front: add(CAR, new THREE.PlaneGeometry(1.0, .48), fogM, .3, 1.27, -.815, 0), back: add(CAR, new THREE.PlaneGeometry(1.0, .48), fogM, -.85, 1.27, -.815, 0) };
WIN.front.rotation.y = PI; WIN.back.rotation.y = PI; const winF2 = add(CAR, new THREE.PlaneGeometry(1.0, .48), fogM, .3, 1.27, .815, 0), winB2 = add(CAR, new THREE.PlaneGeometry(1.0, .48), fogM, -.85, 1.27, .815, 0);
const ws = add(CAR, new THREE.PlaneGeometry(1.5, .5), fogM, .86, 1.24, 0, 0); ws.rotation.y = PI / 2; const rw = add(CAR, new THREE.PlaneGeometry(1.5, .5), fogM, -1.46, 1.24, 0, 0); rw.rotation.y = -PI / 2;
for (const x of [-1.4, 1.4]) for (const z of [-.86, .86]) { const w = add(CAR, G.cyl, mat(0x111111), x, .36, z, 1); w.scale.set(.36, .22, .36); w.rotation.x = PI / 2 }
const headM = basic(0x333322); for (const z of [-.6, .6]) box(CAR, .05, .18, .3, headM, 2.21, .7, z, 0); const tailM = basic(0x3a0a0a); for (const z of [-.65, .65]) box(CAR, .05, .14, .25, tailM, -2.21, .7, z, 0);
const DOOR = grp(CAR); DOOR.position.set(-.35, 0, -.9); box(DOOR, 1.0, .55, .06, carM, -.5, .65, 0, 0); box(DOOR, .08, .05, .04, chromeM, -.85, .8, -.05, 0);
const carIn = new THREE.PointLight(0xffc070, 0, 4, 1.4); carIn.position.set(-.3, 1.35, 0); CAR.add(carIn); const carGl = glowSprite(CAR, 0xffc070, 1.2, -.3, 1.5, 0);
const exhaust = Array.from({ length: 5 }, (_, i) => glowSprite(CAR, 0xb8c0c8, .6 + i * .2, -2.4 - i * .25, .35 + i * .05, .5));
const PASS = [0, 1, 2].map(i => { const c = makeChar({ skin: 0xc8b8a8, shirt: [0x3a3a4a, 0x4a3a30, 0xd0502a][i], pants: 0x2a2a2a, hair: [0x2a2a2a, 0x8a8a8a, 0x2a1a12][i], style: i == 1 ? 'bun' : 'short', h: .86, seed: 11 + i }); CAR.add(c.g); return c });
const tagM = new THREE.MeshBasicMaterial({ map: T.tag }); const TAG = add(PASS[2].up, new THREE.PlaneGeometry(.12, .045), tagM, .1, .45, .16, 0);
const driver = makeChar({ skin: 0x2a221c, shirt: 0x1c1c22, pants: 0x1a1a1a, hair: 0x15151a, style: 'hat', h: .95, seed: 14 }); CAR.add(driver.g);
// ------------------------------------------------------------------ characters outside
const NES = { skin: 0xc48a62, shirt: 0xd0502a, pants: 0x23262e, hair: 0x6a6a6a, style: 'cap', stache: 1, h: 1.0, seed: 15 };
const nestor = makeChar(NES);
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
const cN = new THREE.Color(0x05070d), cDawn = new THREE.Color(0x4a5a7a), cDay = new THREE.Color(0xb8cde0);
function env(o) {
  const day = o.day ?? 0, dawn = o.dawn ?? 0, can = (o.can ?? 1) * (1 - day * .7);
  canL.forEach(l => LI(l, can * 4.2)); panM.color.setScalar(cl(can, .1, 1)); LI(shopL, (o.shop ?? 1) * 3); shopM.color.setScalar(cl(o.shop ?? 1, .1, 1)); LI(flash, o.flash ?? 0);
  bg.copy(cN).lerp(cDawn, dawn).lerp(cDay, day); scene.fog.color.copy(bg); scene.fog.density = o.fogD ?? .02; stars.material.opacity = (1 - dawn - day) * .9;
  sunG.material.opacity = cl(dawn * .9 + day * .2); LI(sun, dawn * .8 + day * 1.8); hemi.intensity = o.hemi ?? (.3 + dawn * .4 + day * 1.0); hemi.color.setHex(day ? 0xfff2e0 : 0xa8b8e8); R.toneMappingExposure = o.exp ?? 1.1;
  const cr = o.car; CAR.visible = !!cr; if (cr) { CAR.position.set(cr.x ?? 3.5, 0, 6.6); LI(carIn, (cr.light ?? 0) * 1.6); carGl.material.opacity = (cr.light ?? 0) * .35; fogM.emissiveIntensity = (cr.light ?? 0) * .35; fogM.opacity = cr.fog ?? .55;
    headM.color.setHex(cr.head ? 0xfff2c0 : 0x333322); exhaust.forEach((e, i) => e.material.opacity = (cr.run ?? 0) * (.12 + .06 * Math.sin(o.t * 3 + i)) ); WIN.front.position.y = 1.27 - (cr.win ?? 0) * .4; DOOR.rotation.y = cr.door ?? 0 }
  drawDisp(o.disp ?? '0.00', o.dispOn ?? 1); PUMPS[2].d.material.color.setScalar(o.dispOn === 0 ? .2 : 1);
  const h = o.hose; HOSE.visible = !!h; if (h) { const a = V(4.0, 1.0, 4.76), b = V(...h), d = b.clone().sub(a); HOSE.position.copy(a).addScaledVector(d, .5); HOSE.scale.set(.03, d.length(), .03); HOSE.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()) }
}
function riders(t, o = {}) { // passengers in the back seat + driver (car-local coords)
  const L = o.look ?? null; [[-1.05, -.45], [-1.05, 0], [-1.05, .42]].forEach(([x, z], i) => { const turn = i == 2 ? (o.turn ?? 0) : 0;
    pose(PASS[i], { t, x, z: -z, y: -.04, sit: 1, ry: PI / 2 + turn * 1.9, hy: 0, noblink: 1, eye: 1.05, pupil: .7, closed: o.closed ? 1 : 0, glow: o.glow ?? 0 }); PASS[i].g.visible = !!o.show });
  pose(driver, { t, x: .1, z: -.38, y: -.2, sit: 1, ry: PI / 2, hyAbs: o.dlook ?? 0, aL: [-1.1, .1], aR: [-1.1, .1], glow: o.dglow ?? 0, noblink: 1 }); driver.g.visible = o.driver !== false }
ARMP.ear = t => [[.17, -.08, -.22, .3, -.6, .2], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.nozzle = t => [[.16, -.34, -.5, -.2, 0, .2], [-.2, -.62, -.3, 0, 0, 0]];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const CARV = [3.5, 1.1, 6.6], DWIN = [3.8, 1.3, 5.8], BWIN = [2.65, 1.27, 5.79], PUMP3 = [3.5, 1.4, 4.75];
const liters = t => { const a = M.pump + .8; if (t < a) return 0; const u = t - a, u5 = Math.max(6.5, Ln.h6.start + .3 - a); return u < 6 ? [0, 10, 40, 100][Math.min(3, Math.floor(u / 1.7))] + (u % 1.7) * 6 : u < u5 ? 100 + (u - 6) * 400 / (u5 - 6) : 500 + (u - u5) * 22 };
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  const fb = t >= M.fb && t < M.back, scare = t > M.sting && t < M.sting + 1;
  K1 = K1 || path([[0, [1.6, 1.6, -2.4], [-3, 1.0, 6.6], 54], [3.6, [1.8, 1.6, -2.4], CARV, 46], [M.fb - .01, [2.0, 1.6, -2.0], CARV, 38],
    [M.fb, [-1.2, 1.6, -5.8], [-2.2, 1.55, -3.6], 58], [M.back - .01, [-1.0, 1.6, -5.6], [-2.2, 1.6, -3.6], 50],
    [M.back, [.8, 1.6, -.4], CARV, 58], [Ln.h3.end, [4.2, 1.6, 3.4], DWIN, 56], [Ln.c1.start, [5.6, 1.7, 3.7], DWIN, 50], [Ln.h4.end, [5.6, 1.7, 3.7], DWIN, 44],
    [M.pump + .6, [4.2, 1.6, 5.4], PUMP3, 46], [Ln.h5.end, [3.9, 1.55, 5.45], PUMP3, 44], [Ln.h6.end, [3.9, 1.55, 5.45], PUMP3, 40], [Ln.c2.start + .3, [5.6, 1.7, 3.7], DWIN, 48], [M.sting, [5.4, 1.7, 3.9], DWIN, 44], [M.sting + .3, [5.2, 1.68, 4.2], DWIN, 32], [C.dur, [5.2, 1.68, 4.2], DWIN, 30]]);
  const c = evalPath(K1, t), arr = sr(t, .2, 4.2), L = liters(t);
  if (fb) {
    env({ t, day: 1, can: 0, shop: 1, car: null, exp: 1.0, dispOn: 0 });
    pose(nestor, { t, x: -2.2, z: -3.8, ry: 2.68, look: cam.position, talk: talk('n1', t), brow: .4, aR: [-.5, .1] });
  } else {
    env({ t, car: { x: lerp(-30, 3.5, 1 - (1 - arr) ** 2), run: 1, win: sr(t, Ln.c1.start - .5, Ln.c1.start + .3) * .5, light: scare ? flk(t, 14, .4, 0) : 0 }, disp: L.toFixed(2), can: scare ? flk(t, 16, .4, .2) : 1,
      hose: t > M.pump ? [2.1, .9, 5.75] : null, exp: 1.15 });
    riders(t, { show: 0, dlook: scare ? 1.3 : 0, dglow: scare ? 1 : 0 });
  }
  arms(t, { nozzle: !fb && t > M.pump ? 1 : 0 });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), t > M.back && t < Ln.h3.end ? .12 : 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 380, tint: fb ? 'rgba(255,190,120,.12)' : 'rgba(60,80,150,.14)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.fb - .35, M.fb + .25, .25, .25), win(t, M.back - .3, M.back + .3, .25, .3)),
    white: scare && t - M.sting < .09 ? .35 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .3,
    end: ENDQ(t - M.endcard, 'CORTÁS EL SURTIDOR', 'LLAMÁS A NÉSTOR', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1, lt = t > M.light;
  K2 = K2 || path([[0, [3.9, 1.55, 5.45], PUMP3, 44], [Ln.h1.start + 2.6, [3.9, 1.55, 5.45], PUMP3, 40], [M.light, [5.6, 1.7, 3.7], CARV, 50], [Ln.h2.start + 1, [1.6, 1.8, 3.4], BWIN, 52], [Ln.h2.end, [1.9, 1.75, 3.8], BWIN, 46],
    [Ln.c1.start, [5.4, 1.7, 3.9], DWIN, 44], [M.ring + .3, [5.4, 1.65, 4.0], CARV, 52], [Ln.n2.end, [5.2, 1.6, 3.4], CARV, 50], [Ln.c2.start, [5.4, 1.65, 4.0], DWIN, 46], [M.sting, [5.4, 1.7, 3.9], DWIN, 42], [M.sting + .3, [5.2, 1.68, 4.2], DWIN, 32], [C.dur, [5.2, 1.68, 4.2], DWIN, 30]]);
  const c = evalPath(K2, t);
  env({ t, car: { run: 1, win: .5, light: lt ? (scare ? flk(t, 14, .4, 0) : 1) * sr(t, M.light, M.light + .4) : 0, fog: lt ? .3 : .55 }, disp: '900.00', can: scare ? flk(t, 16, .4, .2) : 1, hose: t < Ln.h1.start + 2 ? [2.1, .9, 5.75] : null, exp: 1.15 });
  riders(t, { show: lt, dlook: t > Ln.c2.start ? (scare ? 1.3 : .5) : 0, dglow: scare ? 1 : 0 });
  arms(t, { nozzle: t < Ln.h1.start + 2 ? 1 : 0, ear: win(t, M.ring + .5, Ln.n2.end + .4, .4, .4) });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(60,80,150,.14)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .09 ? .4 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .3,
    alert: { k: Math.min(ramp(t, M.ring + .05, M.ring + .4), 1 - ramp(t, Ln.n2.end + .3, Ln.n2.end + .6)), buzz: t < Ln.n1.start ? 1 : 0, kk: 'LLAMADA', m: 'NÉSTOR · ENCARGADO', s: t > Ln.n1.start ? 'En llamada…' : 'Llamando…', col: ['#d0502a', '#8a2a10'] },
    end: ENDQ(t - M.endcard, 'LE DECÍS TU NOMBRE', 'LE MENTÍS', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const morn = t >= M.morning && t < M.sting - .2, last = t >= M.sting - .2, scare = t > M.sting && t < M.sting + 1;
  const TAGV = [2.7, 1.05, 6.15];
  K3 = K3 || path([[0, [5.4, 1.7, 3.9], DWIN, 46], [Ln.c1.end, [5.4, 1.7, 3.9], DWIN, 40], [M.door + .5, [1.6, 1.75, 3.4], BWIN, 52], [Ln.h2.end, [1.9, 1.7, 3.8], [2.6, 1.2, 6.2], 46], [Ln.h3.start + 2.5, [2.2, 1.5, 4.3], TAGV, 40], [Ln.j1.end, [2.0, 1.65, 4.0], [2.6, 1.25, 6.2], 44],
    [M.dawn + .4, [4.6, 1.6, 5.0], [8, 1.2, 8], 56], [Ln.h4.end, [4.6, 1.6, 5.0], [30, 1.5, 12], 52], [M.morning, [1.5, 1.6, 2.0], [-.3, 1.6, 4.0], 54], [M.sting - .21, [1.6, 1.6, 2.2], [-.3, 1.65, 4.0], 48],
    [M.sting - .2, [3.8, 1.55, 6.0], PUMP3, 50], [M.sting + .4, [3.7, 1.5, 5.5], PUMP3, 32], [C.dur, [3.7, 1.5, 5.4], PUMP3, 40]]);
  const c = evalPath(K3, t), dk = sr(t, M.dawn, M.dawn + 3), go = sr(t, M.dawn + 2.2, Ln.h4.end);
  if (!morn && !last) {
    env({ t, dawn: dk, car: dk < 1 || go < .99 ? { x: 3.5 + go * go * 60, run: 1, win: .5, light: 1 - go, fog: .3, door: sr(t, M.door, M.door + 1.2) * (1 - sr(t, M.dawn + 1.5, M.dawn + 2.2)) * 1.1 } : null, disp: '900.00', dispOn: 1, can: 1 - dk * .5, exp: 1.15 });
    riders(t, { show: 1, turn: sr(t, Ln.h2.end - 1.5, Ln.h2.end), dlook: 0 });
  } else if (morn) {
    env({ t, day: 1, car: null, disp: '0.00', dispOn: 0, exp: 1.0 });
    pose(nestor, { t, x: -.3, z: 4.0, ry: .9, look: cam.position, talk: talk('n1', t), brow: .5, aR: [-.3, .1] });
  } else {
    const on = sr(t, M.sting, M.sting + .25);
    env({ t, car: null, disp: on > .5 ? (t > M.sting + 1.5 ? '3.33' : '0.00') : '', dispOn: on > .5 ? 1 : 0, can: flk(t, 12, .5, .25), exp: 1.15 });
  }
  arms(t, {});
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.3 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: morn ? 'rgba(255,200,140,.1)' : 'rgba(60,80,150,.14)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .35), win(t, M.morning - .3, M.morning + .3, .25, .3), win(t, M.sting - .45, M.sting + .05, .25, .2)), white: scare && t - M.sting < .09 ? .35 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿LE HUBIERAS<br>DICHO TU<br>NOMBRE?', qs: 124, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

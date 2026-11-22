// PASILLO 7 — supermercado de noche, POV del repositor. Cámaras de seguridad = render a textura. P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, phoneScr, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'PASILLO 7', title: 'PASILLO 7', titleSize: 200, sleeve: 0xb0262c, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], rub: ['#7dffb0', 'RUBÉN', 0], cosa: ['#ff4558', '???', 1] } });
// ------------------------------------------------------------------ textures
const PAL = ['#d23a2c', '#f2c230', '#2f7fd0', '#e8e2d0', '#3aa35a', '#f07a1a', '#8a3ab0', '#c8c8c8', '#1f5f9a', '#e94f7a'];
T.prod = tex(1024, 512, (g, w, h) => { g.fillStyle = '#3a3d42'; g.fillRect(0, 0, w, h); const rh = h / 5;
  for (let r = 0; r < 5; r++) { let x = 4; const y0 = r * rh; while (x < w - 10) { const iw = 18 + Math.floor(Math.random() * 34), ih = rh * (.55 + Math.random() * .35), c = PAL[Math.floor(Math.random() * PAL.length)], n = 1 + Math.floor(Math.random() * 4);
      for (let k = 0; k < n && x < w - 10; k++) { g.fillStyle = c; g.fillRect(x, y0 + rh - 14 - ih, iw - 3, ih); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x + 2, y0 + rh - 14 - ih * .62, iw - 7, ih * .18); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + iw - 6, y0 + rh - 14 - ih, 3, ih); x += iw } x += 3 }
    g.fillStyle = '#b8bcc2'; g.fillRect(0, y0 + rh - 14, w, 14); g.fillStyle = '#f4f4f4'; for (let x2 = 30; x2 < w; x2 += 90) g.fillRect(x2, y0 + rh - 12, 26, 9) } speck(g, w, h, 3000, .1) }, 6, 1);
T.tile = tex(256, 256, (g, w, h) => { g.fillStyle = '#c9c6bd'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,80,80,.35)'; g.lineWidth = 3; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke() } blot(g, w, h, 12, .08, '60,50,40', 50); speck(g, w, h, 800, .08) }, 8, 30);
T.sign = tex(512, 160, (g, w, h) => { g.fillStyle = '#b0262c'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 64px Inter'; g.textAlign = 'center'; g.fillText('PASILLO 7', w / 2, 70); g.font = '700 34px Inter'; g.fillText('FIDEOS · ARROZ · LATAS', w / 2, 125) });
T.frost = tex(256, 256, (g, w, h) => { g.fillStyle = '#9fb4c4'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .4, '230,245,255', 60); speck(g, w, h, 2500, .4, '255,255,255') });
T.dust = tex(256, 256, (g, w, h) => { g.fillStyle = '#6a6258'; g.fillRect(0, 0, w, h); blot(g, w, h, 30, .3, '40,34,28', 60); speck(g, w, h, 2500, .2) });
T.door = tex(256, 512, (g, w, h) => { g.fillStyle = '#a7adb3'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 3); g.fillStyle = '#1d5fa0'; g.fillRect(28, 120, 200, 70); g.fillStyle = '#fff'; g.font = '900 30px Inter'; g.textAlign = 'center'; g.fillText('CÁMARA', 128, 150); g.fillText('DE FRÍO', 128, 180); blot(g, w, h, 20, .15, '40,30,20', 50) });
T.print = tex(64, 128, (g, w, h) => { g.fillStyle = 'rgba(25,20,15,.9)'; for (const [x, y] of [[20, 34], [44, 92]]) { g.beginPath(); g.ellipse(x, y, 9, 20, 0, 0, 7); g.fill() } });
T.scan = tex(256, 192, (g, w, h) => { for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y, w, 1) } g.fillStyle = 'rgba(255,60,60,.95)'; g.font = '700 15px Inter'; g.fillText('● REC', 12, 22); const gr = g.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, h * .8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const labelTex = s => tex(256, 192, (g, w, h) => { g.fillStyle = 'rgba(255,255,255,.92)'; g.font = '800 19px Inter'; g.textAlign = 'right'; g.fillText(s, w - 12, 24) });
const LBL = { c07: labelTex('CAM 07 · PASILLO 7'), c12: labelTex('CAM 12 · CÁMARA FRÍO'), c01: labelTex('CAM 01 · ENTRADA'), c03: labelTex('CAM 03 · PASILLO 6') };
// ------------------------------------------------------------------ world: store (aisle along -Z, x = 0)
const STORE = grp(scene), OFF = grp(scene), ENT = grp(scene); OFF.position.set(40, 0, 0); ENT.position.set(-40, 0, 0);
const flo = add(STORE, new THREE.PlaneGeometry(16, 60), new THREE.MeshLambertMaterial({ map: T.tile }), 0, 0, -10, 2); flo.rotation.x = -PI / 2;
const ceil = add(STORE, new THREE.PlaneGeometry(16, 60), mat(0x22252a), 0, 3.6, -10, 0); ceil.rotation.x = PI / 2;
const prodM = new THREE.MeshLambertMaterial({ map: T.prod }), metal = mat(0x6d7178);
for (const s of [-1, 1]) for (const xo of [0, 2.5]) { const x = s * (1.25 + xo); box(STORE, .62, 2.05, 13.4, metal, x, 1.02, -6.6, 3);
  for (const f of [-1, 1]) { const p = add(STORE, new THREE.PlaneGeometry(13.4, 1.95), prodM, x + f * .315, 1.02, -6.6, 0); p.rotation.y = f * PI / 2 } }
box(STORE, 1.9, .5, .05, basic(0xffffff, { map: T.sign }), 0, 2.85, -.6, 0);
const fluoM = basic(0xffffff), fluoOffM = basic(0x3a3d40), TUBES = []; for (let i = 0; i < 7; i++) TUBES.push(box(STORE, .16, .05, 1.8, fluoM, 0, 3.45, 1.2 - i * 2.4, 0));
for (const x of [-2.5, 2.5]) for (let i = 0; i < 6; i++) box(STORE, .16, .05, 1.8, fluoM, x, 3.45, .2 - i * 2.4, 0);
const fl = [0, 1, 2].map(i => { const l = new THREE.PointLight(0xe8f0ff, 0, 12, 1.2); l.position.set(0, 3.1, -1 - i * 5.0); STORE.add(l); return l });
// back wall with an opening + cold-room door at z = -14
const wallM = mat(0x8a8f96); box(STORE, 7.25, 3.6, .2, wallM, -4.375, 1.8, -14.1, 2); box(STORE, 7.25, 3.6, .2, wallM, 4.375, 1.8, -14.1, 2); box(STORE, 1.5, 1.2, .2, wallM, 0, 3.0, -14.1, 2);
const DPV = grp(STORE); DPV.position.set(-.7, 0, -13.98); const doorM = new THREE.MeshLambertMaterial({ map: T.door }); box(DPV, 1.4, 2.3, .1, doorM, .7, 1.15, 0, 1); box(DPV, .08, .5, .08, mat(0x2a2a2a), 1.25, 1.1, .1, 0);
box(STORE, .1, 2.4, .25, mat(0x5a5f66), -.75, 1.2, -13.95, 0); box(STORE, .1, 2.4, .25, mat(0x5a5f66), .75, 1.2, -13.95, 0); box(STORE, 1.6, .1, .25, mat(0x5a5f66), 0, 2.4, -13.95, 0);
const CR = grp(STORE); CR.position.set(0, 0, -15.6); const frostM = new THREE.MeshLambertMaterial({ map: T.frost, emissive: 0x6fa8ff, emissiveIntensity: .25 }), dustM = new THREE.MeshLambertMaterial({ map: T.dust });
const crWalls = [box(CR, 3, 2.6, .1, frostM, 0, 1.3, -1.5, 2), box(CR, .1, 2.6, 3, frostM, -1.5, 1.3, 0, 2), box(CR, .1, 2.6, 3, frostM, 1.5, 1.3, 0, 2), box(CR, 3, .1, 3, frostM, 0, 2.6, 0, 2)];
const crFloor = add(CR, new THREE.PlaneGeometry(3, 3), frostM, 0, .005, 0, 2); crFloor.rotation.x = -PI / 2;
for (const z of [-1.2, -.3, .6]) box(CR, .5, .06, .7, mat(0x8a929a), -1.15, .9, z, 0);
const crL = new THREE.PointLight(0x7fb4ff, 0, 7, 1.2); crL.position.set(0, 1.8, 0); CR.add(crL);
const doorGlow = glowSprite(STORE, 0x9fc8ff, 2.2, .1, 1.1, -14.1); const FOG = Array.from({ length: 8 }, (_, i) => glowSprite(STORE, 0xdfeaff, 1.2 + hash(i) * 1.2, (hash(i * 3) - .5) * 1.4, .15 + hash(i * 5) * .5, -13.6 + hash(i * 7) * 1.2));
const CRATE = grp(STORE); { const cm = mat(0x2a63c8); box(CRATE, .42, .05, .32, cm, 0, .02, 0, 1); for (const [x, z, w, d] of [[0, .15, .42, .03], [0, -.15, .42, .03], [.2, 0, .03, .32], [-.2, 0, .03, .32]]) box(CRATE, w, .28, d, cm, x, .16, z, 1) }
const PR = []; { const pm = new THREE.MeshBasicMaterial({ map: T.print, transparent: true, depthWrite: false }); for (let i = 0; i < 10; i++) { const p = add(STORE, new THREE.PlaneGeometry(.2, .42), pm, (i % 2 ? .13 : -.13) + Math.sin(i) * .04, .012, -16.2 + i * .45, 0); p.rotation.set(-PI / 2, 0, 0); PR.push(p) } }
// ------------------------------------------------------------------ world: security office (OFF)
box(OFF, 5, .02, 5, mat(0x3a3530), 0, 0, 0, 2); box(OFF, 5, 3, .1, mat(0x5d6b64), 0, 1.5, -2.2, 2); box(OFF, .1, 3, 5, mat(0x56635c), -2.2, 1.5, 0, 2); box(OFF, .1, 3, 5, mat(0x56635c), 2.2, 1.5, 0, 2); box(OFF, 5, .1, 5, mat(0x2a2c2a), 0, 3, 0, 0); box(OFF, 5, 3, .1, mat(0x5d6b64), 0, 1.5, 2.3, 2);
box(OFF, 2.6, .06, .9, mat(0x6a4a30), 0, .78, -1.6, 3); box(OFF, .06, .78, .8, mat(0x3a2a1c), -1.2, .39, -1.6, 0); box(OFF, .06, .78, .8, mat(0x3a2a1c), 1.2, .39, -1.6, 0);
const monM = [0, 1, 2, 3].map(() => new THREE.MeshBasicMaterial({ color: 0xffffff })), lblM = [0, 1, 2, 3].map(() => new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: LBL.c07 })), scanM = new THREE.MeshBasicMaterial({ map: T.scan, transparent: true, depthWrite: false });
[[-.42, 1.32], [.42, 1.32], [-.42, 1.86], [.42, 1.86]].forEach(([x, y], i) => { const g = grp(OFF); g.position.set(x, y, -1.9); box(g, .8, .55, .3, mat(0x1a1b1d), 0, 0, -.12, 0); add(g, new THREE.PlaneGeometry(.72, .48), monM[i], 0, 0, .035, 0); add(g, new THREE.PlaneGeometry(.72, .48), scanM, 0, 0, .037, 0); add(g, new THREE.PlaneGeometry(.72, .48), lblM[i], 0, 0, .039, 0) });
const termo = grp(OFF); termo.position.set(.9, .81, -1.5); add(termo, G.cyl, mat(0x2f6a4a), 0, .16, 0, 1).scale.set(.06, .32, .06); add(termo, G.cyl, mat(0x8a5a2a), -.18, .06, .05, 1).scale.set(.05, .12, .05);
const lampL = new THREE.PointLight(0xffc890, 0, 6, 1.3); lampL.position.set(-.9, 1.4, -1.3); OFF.add(lampL); const lampG = glowSprite(OFF, 0xffc890, .5, -.9, 1.15, -1.5); box(OFF, .2, .05, .2, mat(0x222222), -.9, .82, -1.5, 0); add(OFF, G.cyl, mat(0x222222), -.9, 1.0, -1.5, 0).scale.set(.015, .35, .015); add(OFF, new THREE.ConeGeometry(.12, .14, 16, 1, true), mat(0x1d3f2a, { side: THREE.DoubleSide }), -.9, 1.18, -1.5, 0);
const offL = new THREE.PointLight(0xdfe8ff, 0, 8, 1.2); offL.position.set(0, 2.8, .3); OFF.add(offL);
const chair = grp(OFF); box(chair, .5, .08, .5, mat(0x202020), 0, .45, 0, 1); box(chair, .5, .6, .06, mat(0x202020), 0, .8, .25, 1); chair.position.set(.75, 0, -.85);
box(OFF, .9, 2.1, .06, mat(0x7a5a3a), -1.2, 1.05, 2.22, 0);
// ------------------------------------------------------------------ world: entrance (ENT) for CAM 01
{ const f = add(ENT, new THREE.PlaneGeometry(14, 14), new THREE.MeshLambertMaterial({ map: T.tile }), 0, 0, 0, 2); f.rotation.x = -PI / 2; }
box(ENT, 12, 3.2, .1, mat(0x8a8f96), -7.2, 1.6, 4.0, 0); box(ENT, 12, 3.2, .1, mat(0x8a8f96), 7.2, 1.6, 4.0, 0); box(ENT, 2.4, .7, .1, mat(0x8a8f96), 0, 2.85, 4.0, 0);
const dawnM = basic(0xffe2b8); const DAWN = add(ENT, new THREE.PlaneGeometry(14, 6), dawnM, 0, 2, 7, 0); DAWN.rotation.y = PI;
const glassM = new THREE.MeshLambertMaterial({ color: 0x9fc0d0, transparent: true, opacity: .35 }); const GL = [box(ENT, 1.1, 2.4, .04, glassM, -.55, 1.2, 4.0, 0), box(ENT, 1.1, 2.4, .04, glassM, .55, 1.2, 4.0, 0)];
for (const x of [-2.2, -3.6]) box(ENT, .9, 1, .6, mat(0x4a4d52), x, .5, 1.2, 3);
const entL = new THREE.PointLight(0xffd8a0, 0, 12, 1.0); entL.position.set(0, 2.2, 5.5); ENT.add(entL); const entL2 = new THREE.PointLight(0xdfe8ff, 1.2, 10, 1.2); entL2.position.set(0, 3, 0); ENT.add(entL2);
// ------------------------------------------------------------------ characters
const UNI_OLD = { skin: 0xe0b896, shirt: 0x3f7a4a, pants: 0x2a2f2a, hair: 0x2a1a12, style: 'long', apron: 0x2f5f3a, h: .97, seed: 4 };
const marta = makeChar({ ...UNI_OLD }); const martaE = makeChar({ ...UNI_OLD, seed: 5 }); ENT.add(martaE.g);
const RUB = { skin: 0xc48a62, shirt: 0x24324a, pants: 0x1c2230, hair: 0x9a9a9a, style: 'short', stache: 1, h: 1.02, seed: 6 };
const ruben = makeChar(RUB); OFF.add(ruben.g); const ruben2 = makeChar({ ...RUB, seed: 7 });
const me = makeChar({ skin: 0xd8a47f, shirt: 0xb0262c, pants: 0x23262e, hair: 0x2a1a12, style: 'short', h: 1.0, seed: 8 });
const TORCH = new THREE.SpotLight(0xfff0d8, 0, 14, .35, .5, 1.2); scene.add(TORCH, TORCH.target);
// ------------------------------------------------------------------ CCTV (render to texture)
const RT = [0, 1].map(() => { const r = new THREE.WebGLRenderTarget(384, 288); r.texture.colorSpace = THREE.SRGBColorSpace; return r });
const ccam = new THREE.PerspectiveCamera(62, 4 / 3, .05, 80); scene.add(ccam);
const CAMS = { c07: [[.9, 3.1, -1.1], [-.2, .5, -8]], c07b: [[.8, 2.9, -1.6], [0, .9, -4.6]], c12: [[.7, 2.3, -11.4], [0, 1.0, -14]], c01: [[-40 + 2.2, 3.0, -1.5], [-40, .9, 3.5]], c03: [[3.4, 3.1, 1.2], [2.4, .5, -9]] };
function cctv(i, k, showMe) { const [p, l] = CAMS[k]; ccam.position.set(...p); ccam.lookAt(...l); rig.visible = false; OFF.visible = false; me.g.visible = false;
  if (showMe) pose(me, { t: 0, x: cam.position.x, z: cam.position.z, ry: cam.rotation.y + PI, hp: .5, aR: [-1.0, .1] });
  const e = R.toneMappingExposure; R.setRenderTarget(RT[i]); R.render(scene, ccam); R.setRenderTarget(null); R.toneMappingExposure = e; rig.visible = true; OFF.visible = true; me.g.visible = false }
function monitors(feeds, t, nz = 0) {
  feeds.forEach(([ri, lb], i) => { const m = monM[i], on = ri != null; m.map = on ? RT[ri].texture : null; const n = on ? 1 - nz * hash(Math.floor(t * 24) + i * 7) : 0; m.color.setRGB(on ? 1.1 * n : .04, on ? 1.35 * n : .05, on ? 1.15 * n : .06); m.needsUpdate = true; lblM[i].map = LBL[lb || 'c07']; lblM[i].opacity = on ? 1 : 0 }) }
const phM = phoneScr.material;
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
function env(o) {
  const L = o.fl ?? 1; fl.forEach(l => LI(l, L * 3.2)); fluoM.color.setScalar(cl(L, 0, 1)); TUBES.forEach((tb, i) => tb.material = (o.half && i % 2) || L < .05 ? fluoOffM : fluoM);
  LI(offL, o.offL ?? 0); LI(lampL, o.lamp ?? 0); lampG.material.opacity = (o.lamp ?? 0) * .5; LI(crL, o.crL ?? 0); LI(flash, o.flash ?? 0); LI(entL, o.ent ?? 0); dawnM.color.setScalar(cl(.15 + (o.ent ?? 0) * .7, 0, 1.2));
  doorGlow.material.opacity = o.dglow ?? 0; FOG.forEach((f, i) => { f.material.opacity = (o.fog ?? 0) * (.5 + .5 * Math.sin(o.t * .7 + i)); f.position.y = .15 + hash(i * 5) * .5 + Math.sin(o.t * .5 + i) * .05 });
  DPV.rotation.y = -(o.door ?? 0); const dusty = !!o.dusty; for (const w of [...crWalls, crFloor]) w.material = dusty ? dustM : frostM; frostM.emissiveIntensity = o.frostE ?? .25;
  PR.forEach(p => p.visible = dusty); const cr = o.crate; CRATE.visible = !!cr; if (cr) { CRATE.position.set(...cr.p); CRATE.rotation.set(0, cr.ry || 0, 0) }
  bg.setHex(o.bg ?? 0x05060a); scene.fog.color.copy(bg); scene.fog.density = o.fogD ?? .03; hemi.intensity = o.hemi ?? .4; hemi.color.setHex(0xdfe9ff); R.toneMappingExposure = o.exp ?? 1.1;
  const tr = o.torch; LI(TORCH, tr ? tr.k * 7 : 0); if (tr) { TORCH.position.set(...tr.p); TORCH.target.position.set(...tr.at) }
  GL[0].position.x = -.55 - (o.gl ?? 0) * 1.05; GL[1].position.x = .55 + (o.gl ?? 0) * 1.05;
}
// phone held up in front of the face (centred, above the subtitles)
function phoneUp(k) { if (k <= 0) return; phone.position.set(lerp(.035, 0, k), lerp(-.165, .045, k), lerp(-.43, -.34, k)); phone.rotation.set(lerp(-.42, 0, k), lerp(-.08, 0, k), lerp(.05, 0, k)) }
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const OX = 40, oc = (x, y, z) => [OX + x, y, z], MONC = oc(0, 1.6, -1.9);
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  const inOff = t < M.aisle, fb = t >= M.fb && t < M.back, ph = t > M.buzz + .2, scare = t > M.sting && t < M.sting + 1;
  RT[1].texture.repeat.set(.45, 1); RT[1].texture.offset.set(.275, 0);
  K1 = K1 || path([[0, oc(-.3, 1.45, .2), oc(-.42, 1.32, -1.9), 46], [M.title, oc(-.1, 1.55, -.6), oc(-.42, 1.32, -1.9), 42], [M.fb - .01, oc(-.2, 1.45, -1.15), oc(-.42, 1.32, -1.9), 34],
    [M.fb, oc(.2, 1.6, -.6), oc(-.4, 1.55, 1.9), 62], [M.back - .01, oc(.1, 1.6, -.4), oc(-.5, 1.6, 1.7), 54],
    [M.back, oc(0, 1.6, -.8), MONC, 46], [Ln.h3.start + 1.6, oc(-.15, 1.55, -1.1), oc(-.42, 1.32, -1.9), 40], [M.aisle - .01, oc(0, 1.6, -.3), oc(-1.2, 1.5, 2.2), 60],
    [M.aisle, [0, 1.62, .8], [0, 1.4, -8], 64], [Ln.h4.start + 1.6, [.05, 1.62, -1.8], [-.9, 1.3, -6], 64], [Ln.h4.start + 3.4, [-.05, 1.62, -3.2], [.9, 1.2, -7], 64], [M.buzz, [0, 1.62, -4.4], [0, 1.4, -10], 62],
    [M.buzz + 1.2, [0, 1.62, -4.5], [0, 1.2, -9], 60], [M.phone + 1.2, [0, 1.62, -4.5], [0, 1.0, -8], 56], [M.sting, [0, 1.6, -4.5], [0, 1.0, -8], 50], [C.dur, [0, 1.6, -4.5], [0, 1.0, -8], 48]]);
  const c = evalPath(K1, t), ex = t > M.sting ? flk(t, 16, .45, .05) : 1;
  if (inOff) {
    env({ t, fl: 1, offL: fb ? 2.4 : .5, lamp: fb ? .4 : 1.6, bg: 0x101214, fogD: .01, exp: fb ? 1.15 : 1.05 });
    if (fb) pose(ruben, { t, x: -.4, z: 1.4, ry: PI + .25, look: cam.position, talk: talk('r1', t), brow: .3, aR: [-.3, .2] });
    if (!fb) pose(marta, { t, x: -.55, z: -7, ry: -PI / 2, hp: .1 });
    cctv(0, 'c07'); marta.g.visible = false; monitors([[0, 'c07'], [null], [null], [null]], t, .12);
  } else {
    env({ t, fl: ex, exp: 1.1 });
    if (ph) { const shown = t > M.phone - .2; if (shown) pose(marta, { t, x: cam.position.x + .05, z: cam.position.z + .55, ry: PI, hy: scare ? 0 : .5, glow: scare ? 1 : 0, noblink: 1 }); cctv(1, 'c07b', 1); marta.g.visible = false; phM.map = RT[1].texture; phM.color.setRGB(1.1, 1.3, 1.1) } else { phM.map = null; phM.color.setHex(0x0a0a0a) }
    phM.needsUpdate = true;
  }
  arms(t, inOff ? {} : { phone: sr(t, M.buzz + .1, M.buzz + .9) }); if (!inOff) phoneUp(sr(t, M.buzz + .5, M.buzz + 1.6));
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), inOff ? 0 : (t < M.buzz ? .12 : 0), scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 330, tint: fb ? 'rgba(255,170,80,.14)' : 'rgba(60,110,90,.12)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.fb - .35, M.fb + .25, .25, .25), win(t, M.back - .3, M.back + .3, .25, .3), win(t, M.aisle - .3, M.aisle + .25, .25, .25)),
    white: scare && t - M.sting < .09 ? .35 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .3,
    alert: { k: Math.min(ramp(t, M.buzz, M.buzz + .35), 1 - ramp(t, M.phone - .5, M.phone - .2)), buzz: 1, kk: 'SEGURIDAD · APP', m: 'CAM 07 · MOVIMIENTO', s: 'Pasillo 7 · ahora', col: ['#2f8a4a', '#185a2c'] },
    end: ENDQ(t - M.endcard, 'TE DAS VUELTA', 'CORRÉS A LA OFICINA', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const inOff = t >= M.office, scare = t > M.sting && t < M.sting + 1, mon = t > M.monitors;
  RT[1].texture.repeat.set(1, 1); RT[1].texture.offset.set(0, 0);
  K2 = K2 || path([[0, [0, 1.62, -4.5], [0, 1.7, 6], 66], [M.office - .01, [0, 1.62, .5], [0, 1.7, 8], 66],
    [M.office, oc(-.6, 1.6, 1.6), oc(.6, 1.3, -.9), 64], [Ln.r1.end, oc(-.4, 1.6, .9), oc(.7, 1.3, -.9), 56], [Ln.y1.end, oc(-.3, 1.6, .7), oc(.7, 1.35, -.85), 52], [Ln.r3.end, oc(-.35, 1.6, .7), oc(.72, 1.36, -.85), 54],
    [Ln.h2.start + 1, oc(-.2, 1.6, .4), MONC, 56], [M.monitors, oc(-.1, 1.6, -.4), MONC, 48], [Ln.m1.start, oc(-.25, 1.45, -1.0), oc(-.42, 1.32, -1.9), 40], [Ln.m1.end, oc(-.3, 1.4, -1.15), oc(-.42, 1.32, -1.9), 34],
    [Ln.r4.start + .2, oc(-.6, 1.6, .3), oc(.72, 1.36, -.85), 54], [M.sting, oc(-.1, 1.6, -.7), MONC, 46], [M.sting + .4, oc(0, 1.6, -.9), MONC, 36], [C.dur, oc(0, 1.6, -.9), MONC, 34]]);
  const c = evalPath(K2, t);
  if (!inOff) env({ t, fl: flk(t, 9, .3, .25), exp: 1.1 });
  else {
    const doorK = mon ? (t < M.sting ? lerp(.25, .7, sr(t, Ln.m1.start, Ln.m1.end)) : lerp(.7, 0, sr(t, M.sting - .05, M.sting + .12))) : 0;
    env({ t, fl: .8, half: 1, offL: .5, lamp: 1.6 * (scare ? flk(t, 18, .4, .2) : 1), door: doorK, dglow: doorK * .9, fog: doorK * .5, crL: doorK * 2.5, bg: 0x101214, fogD: .01, exp: 1.05 });
    if (mon) { cctv(0, 'c12'); monitors([[0, 'c12'], [0, 'c12'], [0, 'c12'], [0, 'c12']], t, .35) } else { cctv(0, 'c07'); cctv(1, 'c03'); monitors([[0, 'c07'], [1, 'c03'], [null], [null]], t, .1) }
    const fear = Math.max(sr(t, Ln.r2.start, Ln.r3.start), sr(t, M.monitors, Ln.r4.start));
    pose(ruben, { t, x: .75, z: -.85, sit: 1, ry: t < Ln.r1.start - .4 ? PI : -2.3, look: (t > Ln.r1.start - .3 && t < Ln.h2.start) || (t > Ln.r4.start - .2) ? cam.position : V(OX, 1.6, -1.9), talk: talk('r1', t) + talk('r2', t) + talk('r3', t) + talk('r4', t), brow: .2 + fear * .7, eye: 1 + fear * .2, tremble: fear * .5, aL: [-.7, .1], aR: [-.7, .1] });
  }
  arms(t, inOff ? {} : { run: 1 });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), inOff ? 0 : 1, (scare && t - M.sting < .3 ? 1 : 0) + (!inOff ? .15 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 400, tint: 'rgba(60,110,90,.12)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.office - .2, M.office + .2, .15, .2)), white: scare && t - M.sting < .09 ? .4 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .3,
    end: ENDQ(t - M.endcard, 'LA AYUDÁS', 'TE QUEDÁS CON RUBÉN', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const six = t >= M.six && t < M.morning, morn = t >= M.morning, scare = t > M.sting && t < M.sting + 1;
  const DR = [-.5, 1.6, -10.4], DOORV = [.5, 1.0, -14.3];
  K3 = K3 || path([[0, [0, 1.62, -3], [0, 1.4, -14], 62], [Ln.h1.start + 1.4, [0, 1.62, -4.5], [-.6, 1.5, 2], 60], [Ln.h1.end, [0, 1.62, -6.5], [0, 1.4, -14], 60],
    [M.door + .6, [0, 1.62, -9.5], DOORV, 60], [Ln.h2.end, DR, DOORV, 52], [Ln.m1.end, [-.4, 1.55, -10.8], DOORV, 58], [M.crate + .3, [-.3, 1.5, -11.5], [-.4, .2, -13.0], 62], [M.crate + 1.8, [-.3, 1.45, -11.7], [.4, .3, -13.9], 60], [Ln.m2.start, [-.4, 1.5, -11.2], DOORV, 56], [M.six - .01, [-.3, 1.5, -11.5], DOORV, 48],
    [M.six, oc(0, 1.6, -.9), oc(-.42, 1.32, -1.9), 34], [Ln.h4.end - 1, oc(-.15, 1.5, -1.25), oc(-.42, 1.32, -1.9), 26], [Ln.r1.start + .2, oc(-.6, 1.6, .4), oc(.72, 1.36, -.85), 54], [M.morning - .01, oc(-.6, 1.6, .4), oc(.72, 1.36, -.85), 52],
    [M.morning, [0, 1.6, -12.2], [0, 1.2, -15.6], 60], [Ln.r2.start + .5, [0, 1.6, -13.0], [0, 1.0, -15.8], 60], [M.sting, [0, 1.55, -13.4], [0, .05, -14.8], 56], [M.sting + .4, [0, 1.5, -13.5], [0, 0, -15.0], 48], [C.dur, [0, 1.5, -13.5], [0, 0, -15.0], 46]]);
  const c = evalPath(K3, t);
  const crk = sr(t, M.crate + .4, M.crate + 2.2), crP = [lerp(-.5, .62, crk), .0, lerp(-13.0, -13.95, crk)];
  if (six) {
    env({ t, fl: .8, half: 1, offL: .6, lamp: 1.4, ent: sr(t, M.six, M.six + 1.5) * 1.6, gl: sr(t, M.six + .4, M.six + 1.6), bg: 0x101214, fogD: .01, exp: 1.05 });
    const mk = sr(t, M.six + 1.2, Ln.h4.end); pose(martaE, { t, x: lerp(-.6, .2, mk), z: lerp(.5, 5.2, mk), ry: .1, run: mk > 0 && mk < 1 ? .25 : 0, phase: t * 6, vis: mk < .98 });
    cctv(0, 'c01'); monitors([[0, 'c01'], [null], [null], [null]], t, .1);
    pose(ruben, { t, x: .75, z: -.85, sit: 1, ry: -2.6, look: t > Ln.r1.start - .3 ? cam.position : V(OX - .42, 1.32, -1.9), talk: talk('r1', t), brow: .5, smile: sr(t, Ln.r1.end - .5, Ln.r1.end + .5) * .25, aL: [-.7, .1], aR: [-.7, .1] });
  } else if (!morn) {
    const cold = sr(t, M.door, M.door + 2);
    env({ t, fl: .25, half: 1, door: .45, dglow: .4 + cold * .5, fog: .3 + cold * .5, crL: 2.8, frostE: .4, exp: 1.2, crate: { p: crP, ry: .1 },
      torch: { k: 1, p: [cam.position.x - .5, 1.5, cam.position.z + 1.0], at: [0, 1, -14.5] } });
    if (t < Ln.h1.end + .5) walk(ruben2, t, [[0, -.5, -1.4], [Ln.h1.end + .5, -.5, -5.5]], { aR: [-1.2, .1] });
    else pose(ruben2, { t, x: -.6, z: cam.position.z + 1.0, ry: PI, look: V(0, 1.1, -14), aR: [-1.2, .1], brow: .6, eye: 1.15 });
  } else {
    env({ t, fl: 1, door: 1.5, dusty: 1, crL: 2.2, dglow: 0, fog: 0, frostE: 0, exp: 1.3, crate: { p: [.62, 0, -13.95], ry: .1 }, torch: { k: .8, p: [-.4, 1.6, -12.5], at: [0, 0, -15.2] }, hemi: .8 }); crL.color.setHex(0xffe8c8);
    pose(ruben2, { t, x: -.75, z: -12.9, ry: PI + .5, look: t < Ln.r2.end ? cam.position : V(0, 0, -15), talk: talk('r2', t), aR: [-1.0, .1], brow: .5 });
  }
  arms(t, (!six && !morn) ? { reach: win(t, M.crate + .2, M.crate + 2.3, .4, .4) } : {});
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.3 : 0)), !six && !morn && t < M.door + .6 ? .1 : 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 400, tint: six ? 'rgba(255,190,120,.12)' : morn ? 'rgba(200,170,130,.12)' : 'rgba(60,110,200,.16)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .35), win(t, M.six - .3, M.six + .25, .25, .25), win(t, M.morning - .3, M.morning + .3, .25, .3)), white: scare && t - M.sting < .09 ? .4 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS LA<br>HUBIERAS<br>AYUDADO?', qs: 132, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

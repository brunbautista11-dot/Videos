// LA CARPA — camping en la laguna, POV dentro de una carpa iglú. Las tres partes (P1/P2/P3) son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'LA CARPA', title: 'LA CARPA', titleSize: 220, sleeve: 0x3c4a5a, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], nico: ['#7dffb0', 'NICO', 0], cosa: ['#ff4558', 'AFUERA', 1], radio: ['#ffb84d', 'GUARDAPARQUE · HANDY', 1] } });
// ------------------------------------------------------------------ textures
const TW = 1024, TH = 256, DU = .75 * TW;      // door centred at u = .75 (direction -Z)
const doorPath = (g, w0, h0) => { g.beginPath(); g.moveTo(DU - w0, TH); g.lineTo(DU - w0, TH - h0 + 40); g.quadraticCurveTo(DU - w0, TH - h0, DU, TH - h0); g.quadraticCurveTo(DU + w0, TH - h0, DU + w0, TH - h0 + 40); g.lineTo(DU + w0, TH) };
T.lona = tex(TW, TH, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9b46a'); gr.addColorStop(1, '#b98d4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(70,40,10,.18)'; for (let k = 0; k < 8; k++) g.fillRect(k * w / 8 + w / 16 - 3, 0, 6, h);
  g.fillStyle = '#5a6a3a'; g.fillRect(0, h - 26, w, 26); g.strokeStyle = '#6a4a1c'; g.lineWidth = 7; doorPath(g, 54, 190); g.stroke();
  g.strokeStyle = '#2a2016'; g.lineWidth = 4; g.beginPath(); g.moveTo(DU, h - 150); g.lineTo(DU, h); g.stroke(); blot(g, w, h, 40, .1, '60,40,10', 70); speck(g, w, h, 4000, .08) });
T.lonaE = tex(TW, TH, (g, w, h) => { g.fillStyle = '#5a5a5a'; g.fillRect(0, 0, w, h); const gr = g.createRadialGradient(DU, h * .8, 10, DU, h * .8, 330); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.35)'; for (let k = 0; k < 8; k++) g.fillRect(k * w / 8 + w / 16 - 4, 0, 8, h); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, h - 26, w, 26); g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 8; doorPath(g, 54, 190); g.stroke() });
T.floor = tex(256, 256, (g, w, h) => { g.fillStyle = '#2b3a46'; g.fillRect(0, 0, w, h); blot(g, w, h, 20, .2, '10,15,20', 60); speck(g, w, h, 1500, .15) }, 2, 2);
T.bagA = tex(128, 256, (g, w, h) => { g.fillStyle = '#9a2f2a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 6); speck(g, w, h, 600, .15) });
T.bagB = tex(128, 256, (g, w, h) => { g.fillStyle = '#2f5a8a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 6); speck(g, w, h, 600, .15) });
T.grass = tex(256, 256, (g, w, h) => { g.fillStyle = '#24331f'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .25, '10,20,8', 60); speck(g, w, h, 2500, .3, '70,100,45') }, 40, 40);
T.sil = tex(256, 320, (g, w, h) => { g.filter = 'blur(4px)'; g.fillStyle = '#000'; g.beginPath(); g.ellipse(128, 62, 30, 38, 0, 0, 7); g.fill(); g.fillRect(114, 90, 28, 26); g.beginPath(); g.moveTo(62, 320); g.lineTo(66, 190); g.quadraticCurveTo(66, 128, 128, 120); g.quadraticCurveTo(190, 128, 190, 190); g.lineTo(194, 320); g.fill();
  g.beginPath(); g.moveTo(70, 150); g.quadraticCurveTo(50, 210, 54, 280); g.lineTo(70, 282); g.lineTo(80, 190); g.fill(); g.beginPath(); g.moveTo(186, 150); g.quadraticCurveTo(206, 210, 202, 280); g.lineTo(186, 282); g.lineTo(176, 190); g.fill() });
T.hand = tex(128, 160, (g, w, h) => { g.filter = 'blur(4px)'; g.fillStyle = '#000'; g.beginPath(); g.ellipse(64, 100, 34, 40, 0, 0, 7); g.fill(); for (const [x, len, a] of [[36, 52, -.25], [52, 66, -.08], [70, 68, .05], [88, 58, .2]]) { g.save(); g.translate(x, 80); g.rotate(a); g.fillRect(-7, -len, 14, len); g.beginPath(); g.arc(0, -len, 7, 0, 7); g.fill(); g.restore() } g.save(); g.translate(98, 108); g.rotate(.9); g.fillRect(-7, -44, 14, 44); g.restore(); g.fillRect(44, 120, 42, 40) });
T.print = tex(64, 128, (g, w, h) => { g.fillStyle = 'rgba(8,12,10,.95)'; for (const [x, y] of [[20, 34], [44, 92]]) { g.beginPath(); g.ellipse(x, y, 9, 18, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y - 24, 7, 7, 0, 0, 7); g.fill() } });
// ------------------------------------------------------------------ world: tent (dome R = 1.5, h = 1.35, door = -Z)
const TENT = grp(scene), OUT = grp(scene);
const lonaM = new THREE.MeshLambertMaterial({ color: 0xffffff, map: T.lona, emissive: 0x000000, emissiveMap: T.lonaE, side: THREE.DoubleSide });
const dome = add(TENT, new THREE.SphereGeometry(1.5, 64, 24, 0, 2 * PI, 0, PI / 2), lonaM, 0, 0, 0, 2); dome.scale.y = .9;
const fl0 = add(TENT, new THREE.CircleGeometry(1.5, 48), mat(0xffffff, { map: T.floor }), 0, .01, 0, 2); fl0.rotation.x = -PI / 2;
for (const a of [PI / 4, -PI / 4]) { const p = add(TENT, new THREE.TorusGeometry(1.49, .012, 6, 48, PI), mat(0x2a2a2a), 0, 0, 0, 0); p.rotation.y = a; p.scale.y = .9 }
const bagM = [mat(0xffffff, { map: T.bagA }), mat(0xffffff, { map: T.bagB })];
const myBag = caps(TENT, .22, 1.8, bagM[0], .42, .13, -.25, 2); myBag.rotation.x = PI / 2; myBag.scale.set(1, 1, .55);
const nBag = caps(TENT, .24, 1.75, bagM[1], -.42, .14, .32, 2); nBag.rotation.x = PI / 2; nBag.scale.set(1.05, 1, .62);
box(TENT, .4, .1, .26, mat(0x6a6f78), -.42, .1, -.72); box(TENT, .4, .1, .26, mat(0x6a6f78), .42, .1, .68);
box(TENT, .34, .48, .24, mat(0x3a4a2a), .95, .25, .52, 3); box(TENT, .28, .2, .05, mat(0x2c381f), .95, .2, .38, 0); box(TENT, .3, .06, .26, mat(0x2a2a20), .95, .52, .52, 0);
const HANDY = grp(TENT); HANDY.position.set(.88, .56, .44); box(HANDY, .07, .16, .04, mat(0x1c1f22), 0, .08, 0, 0); box(HANDY, .015, .1, .015, mat(0x111111), .02, .2, 0, 0); box(HANDY, .05, .03, .005, basic(0x6fae7a), 0, .11, -.022, 0);
const ledM = basic(0xff2a1a), led = sph(HANDY, .008, ledM, -.022, .145, -.02, 0), ledGl = glowSprite(HANDY, 0xff3020, .12, -.022, .145, -.03);
const slider = grp(TENT); box(slider, .03, .045, .015, basic(0x8a8478), 0, 0, 0, 0);
const domeR = y => 1.5 * Math.sqrt(Math.max(0, 1 - (y / 1.35) ** 2));
const silM = new THREE.MeshBasicMaterial({ map: T.sil, transparent: true, depthWrite: false, color: 0x000000, opacity: 0 }), SIL = add(TENT, new THREE.PlaneGeometry(1.15, 1.45), silM, 0, 0, 0, 0); SIL.renderOrder = 5;
const handM = new THREE.MeshBasicMaterial({ map: T.hand, transparent: true, depthWrite: false, color: 0x000000, opacity: 0 }), HANDS = [0, 1].map(() => { const h = add(TENT, new THREE.PlaneGeometry(.26, .32), handM, 0, 0, 0, 0); h.renderOrder = 6; return h });
const spotM = new THREE.MeshBasicMaterial({ map: T.glow, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xdfe8ff, opacity: 0 }), SPOT = add(TENT, new THREE.PlaneGeometry(1.1, 1.1), spotM, 0, 0, 0, 0); SPOT.renderOrder = 4;
function onDome(o, a, y, inset = .965, tilt = 1) { const r = domeR(y) * inset; o.position.set(Math.sin(a) * r, y, -Math.cos(a) * r); o.rotation.set(0, 0, 0); o.lookAt(0, y - .45 * tilt, 0) }
const inL = new THREE.PointLight(0xff8a40, 0, 4, 1.4); inL.position.set(0, .55, -.9); TENT.add(inL);
const inB = new THREE.PointLight(0x9fb8ff, 0, 5, 1.2); inB.position.set(0, 1.0, .2); TENT.add(inB);
// ------------------------------------------------------------------ world: clearing, lagoon, fire
const gndM = new THREE.MeshLambertMaterial({ map: T.grass }), gnd = add(OUT, new THREE.PlaneGeometry(200, 200), gndM, 0, -.005, 0, 2); gnd.rotation.x = -PI / 2;
const lagM = new THREE.MeshPhongMaterial({ color: 0x0b1a28, specular: 0x9fb8ff, shininess: 90 }), lag = add(OUT, new THREE.CircleGeometry(9, 48), lagM, -1.2, .012, -14.5, 2); lag.rotation.x = -PI / 2;
for (let i = 0; i < 26; i++) { const a = i / 26 * 2 * PI; const r = add(OUT, G.sph, mat(0x3a3a32), -1.2 + Math.cos(a) * 9, .02, -14.5 + Math.sin(a) * 9, 0); r.scale.set(.5 + hash(i) * .6, .12, .4) }
const TREES = []; for (let i = 0; i < 70; i++) { const a = hash(i * 3.1) * 2 * PI, d = 7 + hash(i * 5.7) * 16, x = Math.sin(a) * d, z = -Math.cos(a) * d; if (Math.hypot(x + 1.2, z + 14.5) < 11) continue; const g = grp(OUT), h = 4 + hash(i * 2.2) * 5; g.position.set(x, 0, z); const tr = add(g, G.cyl, mat(0x2a1f16), 0, h * .2, 0); tr.scale.set(.16, h * .4, .16); add(g, new THREE.ConeGeometry(1.1 + hash(i) * .9, h * .85, 7), mat(0x172a1c), 0, h * .65, 0, 1); TREES.push(g) }
for (let i = 0; i < 24; i++) { const a = -.9 + i / 23 * 1.8, d = 26 + hash(i * 9.1) * 6, g = grp(OUT), h = 6 + hash(i * 4.4) * 6; g.position.set(-1.2 + Math.sin(a) * d, 0, -14.5 - Math.cos(a) * d); add(g, new THREE.ConeGeometry(1.8, h, 7), mat(0x101c14), 0, h * .5, 0, 0) }
const FIRE = grp(OUT); FIRE.position.set(.2, 0, -3.3);
for (let i = 0; i < 9; i++) { const a = i / 9 * 2 * PI; const s = sph(FIRE, .1, mat(0x5a5650), Math.cos(a) * .38, .06, Math.sin(a) * .38, 0); s.scale.set(.12, .08, .1) }
for (const a of [0, 1.1, 2.2]) { const l = add(FIRE, G.cyl, mat(0x2a1a10), 0, .09, 0, 0); l.scale.set(.05, .6, .05); l.rotation.set(PI / 2 - .25, a, 0) }
const embM = basic(0xff5a1a), emb = sph(FIRE, .2, embM, 0, .07, 0, 0); emb.scale.set(.22, .06, .22);
const flameM = new THREE.MeshBasicMaterial({ color: 0xff7a20, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }), FL = [0, 1, 2].map(i => add(FIRE, new THREE.ConeGeometry(.08, .32, 10, 1, true), flameM, (i - 1) * .07, .2, (i % 2) * .05, 0));
const fireGl = glowSprite(FIRE, 0xff7a2a, 2.6, 0, .4, 0), fireL = new THREE.PointLight(0xff8a3a, 0, 14, 1.4); fireL.position.set(0, .6, 0); FIRE.add(fireL);
{ const l = add(OUT, G.cyl, mat(0x4a3220), -1.0, .18, -3.9, 1); l.scale.set(.16, 1.2, .16); l.rotation.set(0, .9, PI / 2); const l2 = add(OUT, G.cyl, mat(0x4a3220), 1.25, .18, -2.5, 1); l2.scale.set(.16, 1.1, .16); l2.rotation.set(0, -.6, PI / 2) }
const starG = new THREE.BufferGeometry(); { const a = new Float32Array(400 * 3); for (let i = 0; i < 400; i++) { const th = hash(i) * 2 * PI, ph = .12 + hash(i * 2.3) * 1.2; a[i * 3] = Math.cos(th) * Math.cos(ph) * 150; a[i * 3 + 1] = Math.sin(ph) * 150; a[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 150 } starG.setAttribute('position', new THREE.BufferAttribute(a, 3)) }
const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xcfe0ff, size: .9, transparent: true, fog: false, depthWrite: false })); OUT.add(stars);
const moonS = glowSprite(OUT, 0xdfe8ff, 16, -14, 26, -80); const moonDisk = sph(OUT, 2.2, basic(0xf2f6ff, { fog: false }), -14, 26, -80, 0);
const REFL = Array.from({ length: 9 }, (_, i) => glowSprite(OUT, 0xbfd0ff, 1.6 - i * .1, -1.2 - 2.2 * (i / 9) - .4, .05, -8.5 - i * 1.35));
const MIST = Array.from({ length: 14 }, (_, i) => glowSprite(OUT, 0xcfd8e8, 7 + hash(i) * 5, -6 + hash(i * 3.3) * 12, .4, -5 - hash(i * 7.1) * 16));
const moon = new THREE.DirectionalLight(0x9fb8ff, 0); moon.position.set(-14, 26, -60); OUT.add(moon, moon.target); moon.target.position.set(0, 0, -6);
const sun = new THREE.DirectionalLight(0xffd8b0, 0); sun.position.set(20, 8, -30); OUT.add(sun, sun.target); sun.target.position.set(0, 0, -6);
const PRINTS = []; { const pm = new THREE.MeshBasicMaterial({ map: T.print, transparent: true, depthWrite: false, color: 0xffffff }); const put = (x, z, a) => { const p = add(OUT, new THREE.PlaneGeometry(.42, .84), pm, x, .015, z, 0); p.rotation.set(-PI / 2, 0, -a); PRINTS.push(p) };
  for (let i = 0; i < 20; i++) { const a = i / 20 * 2 * PI; put(Math.sin(a) * 1.85, -Math.cos(a) * 1.85, a + PI / 2) } for (let i = 0; i < 9; i++) put(-.5 - i * .1, -2.2 - i * .38, PI + .25) }
// ------------------------------------------------------------------ characters
const NICO = { skin: 0xc98d68, shirt: 0x6a3a2a, pants: 0x2b2e3a, hair: 0x1f150f, style: 'short', h: 1.0, seed: 2 };
const nico = makeChar(NICO); const LYO = grp(scene); LYO.rotation.y = 0; const LY = grp(LYO); LY.rotation.x = -PI / 2; const nicoLy = makeChar({ ...NICO, seed: 3 }); LY.add(nicoLy.g);
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo, ff = t => .8 + .12 * Math.sin(t * 13) + .08 * Math.sin(t * 29.3);
const cNight = new THREE.Color(0x060a14), cDawn = new THREE.Color(0xa9b7c6), cT = new THREE.Color();
function env(o) {
  const dawn = o.dawn ?? 0, fire = o.fire ?? 0, inside = o.inside ?? 1;
  lonaM.emissive.setHex(o.lonaC ?? 0xff7a30); lonaM.emissiveIntensity = o.lonaE ?? 0;
  LI(inL, o.inL ?? 0); LI(inB, o.inB ?? 0); LI(flash, o.flash ?? 0);
  LI(fireL, fire * 5 * ff(o.t)); fireGl.material.opacity = fire * .8 * ff(o.t + 1); flameM.opacity = fire > .55 ? .5 : 0; FL.forEach((f, i) => f.scale.set(1, (.7 + .5 * Math.abs(Math.sin(o.t * (7 + i * 2.3) + i))) * Math.max(fire, .01), 1)); embM.color.setRGB(.12 + fire * .88, .1 + fire * .28, .08 - fire * .03);
  cT.copy(cNight).lerp(cDawn, dawn); bg.copy(cT); scene.fog.color.copy(cT); scene.fog.density = o.fogD ?? lerp(.03, .02, dawn);
  LI(moon, (1 - dawn) * (o.moon ?? 1.2)); LI(sun, dawn * 1.8); moonS.material.opacity = (1 - dawn) * .8; moonDisk.visible = dawn < .5; stars.material.opacity = (1 - dawn) * .9;
  lagM.color.setHex(dawn > .5 ? 0x5a6a7a : 0x0b1a28); REFL.forEach(s => s.material.opacity = (1 - dawn) * .35); MIST.forEach((s, i) => { s.material.opacity = (o.mist ?? .1) * (.6 + .4 * Math.sin(o.t * .2 + i)) });
  hemi.intensity = o.hemi ?? (inside ? .25 : lerp(.35, 1.1, dawn)); hemi.color.setHex(dawn > .5 ? 0xe6eeff : 0x8fa4d8); R.toneMappingExposure = o.exp ?? 1.15;
  PRINTS.forEach(p => p.visible = !!o.prints); gndM.color.setScalar(1 + dawn * .9);
  const s = o.sil; silM.opacity = s ? s.k : 0; SIL.visible = !!s && s.k > .01; if (SIL.visible) { onDome(SIL, s.a, s.y ?? .5, .78); SIL.scale.setScalar(.62 * (s.s ?? 1)) }
  const hk = o.hand ?? 0; handM.opacity = hk; HANDS.forEach((h, i) => { h.visible = hk > .01 && (i == 0 || !!o.hands2); if (h.visible) onDome(h, (o.handA ?? 0) + (o.hands2 ? (i ? .17 : -.17) : 0), o.handY ?? .7, .8); h.scale.setScalar(1.05) });
  const sp = o.spot; spotM.opacity = sp ? sp.k : 0; SPOT.visible = !!sp && sp.k > .01; if (SPOT.visible) { onDome(SPOT, sp.a, sp.y ?? .7, .8); SPOT.scale.setScalar(sp.s ?? 1) }
  const sl = o.slider ?? 0, sy = lerp(1.05, .75, sl); onDome(slider, 0, sy, .99); ledM.color.setScalar(o.led ?? .25); ledGl.material.opacity = (o.led ?? 0) * .8;
}
ARMP.shake = t => [[.06, -.28 + Math.sin(t * 24) * .03, -.5, .2, 0, -.5], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.radio = t => [[.1, -.2, -.32, .35, -.3, -.2], [-.2, -.62, -.3, 0, 0, 0]];
const HR = grp(rig); box(HR, .07, .16, .04, mat(0x1c1f22), 0, 0, 0, 0); box(HR, .015, .1, .015, mat(0x111111), .02, .12, 0, 0); const hrLed = sph(HR, .008, basic(0xff3a2a), -.022, .065, .022, 0); HR.position.set(.08, -.13, -.36); HR.rotation.set(.3, -.3, -.15); HR.visible = false;
const Ec = [.4, .74, .42], DOOR = [0, .62, -1.3], NICOH = [-.42, .18, -.45], NICOS = [-.45, .86, -.25], HND = [.88, .66, .44];
const Ex = [1.45, 1.1, -1.75], LAGO = [-2.6, 1.0, -14], NICOF = [-.95, .95, -3.9];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const lying = (t, p = {}) => { pose(nicoLy, { t, x: -.42, y: -1.2, z: .16, ry: .6, closed: 1, ...p }); nBag.visible = true };
const silA = (t, a0, a1, t0, t1) => lerp(a0, a1, sr(t, t0, t1));
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  const ext = t >= M.fb && t < M.back;
  K1 = K1 || path([[0, Ec, DOOR, 74], [Ln.h1.end, Ec, DOOR, 62], [M.fb, Ex, LAGO, 74], [Ln.h2.end, [1.0, 1.08, -2.3], LAGO, 64], [Ln.n0.start + .4, Ex, NICOF, 64], [M.back - .01, Ex, NICOF, 60],
    [M.back, Ec, DOOR, 70], [Ln.f1.end, Ec, DOOR, 52], [Ln.y1.end + .2, Ec, DOOR, 54], [Ln.h3.start + 2.0, Ec, DOOR, 60], [Ln.h3.start + 3.2, Ec, NICOH, 64], [Ln.h3.end, Ec, NICOH, 56],
    [Ln.f2.start + .6, Ec, DOOR, 64], [M.walk, Ec, DOOR, 60], [M.walk + 1.4, Ec, [-1.1, .62, -.3], 66], [M.stop, Ec, [-.4, .62, -1.1], 62], [Ln.f3.start + .3, Ec, DOOR, 50], [M.sting + .2, Ec, [0, .8, -1.2], 34], [C.dur, Ec, [0, .8, -1.2], 32]]);
  const c = evalPath(K1, t), lit = t > M.light, scare = t > M.sting && t < M.sting + 1;
  const sa = t < M.walk ? -1.9 : silA(t, -1.9, 0, M.walk, M.stop), sk = t < Ln.h1.end + .2 ? .75 * sr(t, .6, 1.8) : t < M.walk ? 0 : Math.min(sr(t, M.walk, M.walk + .8), 1);
  if (ext) {
    env({ t, inside: 0, fire: 1, lonaE: 0, exp: 1.3, mist: .12 });
    pose(nico, { t, x: -1.0, z: -3.9, sit: 1, y: .05, ry: .95, look: t > Ln.n0.start - .3 ? cam.position : V(.2, .4, -3.3), talk: talk('n0', t), smile: .55, aL: [-.6, .3], aR: [-.6, .3] });
  } else {
    const glow = t < M.back ? .55 : lerp(.42, .5, sr(t, M.walk, M.stop)) * (scare ? flk(t, 18, .4, .3) : 1);
    env({ t, lonaE: glow, lonaC: 0xff8a45, inL: .35, inB: .25, flash: lit ? 3.2 : 0, sil: sk > 0 ? { a: t < M.walk ? 0 : sa, k: sk * .88, s: t > M.stop ? lerp(1, 1.25, sr(t, M.stop, M.sting)) : 1 } : null,
      hand: sr(t, M.sting - .05, M.sting + .1) * .9, handA: 0, handY: .66, slider: sr(t, M.sting - .15, M.sting + .5) * .45, exp: 1.25 });
    lying(t, { closed: 1 });
  }
  arms(t, { flash: lit && !ext ? 1 : 0 });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (ext ? .5 : 1 + (scare ? 1.5 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 520, tint: ext ? 'rgba(255,150,60,.12)' : 'rgba(40,60,130,.18)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.fb - .35, M.fb + .25, .25, .25), win(t, M.back - .3, M.back + .3, .25, .3)),
    white: scare && t - M.sting < .09 ? .4 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .3,
    end: ENDQ(t - M.endcard, 'ABRÍS EL CIERRE', 'DESPERTÁS A NICO', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const sit = t > Ln.n1.start - .25;
  K2 = K2 || path([[0, Ec, NICOH, 62], [Ln.h1.end - .2, Ec, NICOH, 56], [Ln.n1.start, Ec, NICOS, 72], [Ln.n2.end, Ec, NICOS, 66], [Ln.f1.start + .4, Ec, DOOR, 64], [Ln.h2.end, Ec, DOOR, 52], [Ln.n3.start + .2, Ec, NICOS, 66], [Ln.n3.end + .2, Ec, NICOS, 60],
    [M.radio + .6, Ec, HND, 74], [Ln.y2.end, Ec, HND, 68], [Ln.g2.end, Ec, HND, 62], [M.lamp + .6, Ec, DOOR, 62], [Ln.g3.end, Ec, DOOR, 50], [Ln.n4.start + .2, Ec, NICOS, 66], [Ln.n4.end, Ec, NICOS, 60], [M.sting + .2, Ec, [0, .8, -1.2], 40], [C.dur, Ec, [0, .8, -1.2], 36]]);
  const c = evalPath(K2, t), scare = t > M.sting && t < M.sting + 1, rOn = t > M.radio && t < Ln.g2.end + .3;
  const sk = Math.max(win(t, Ln.f1.start - .3, Ln.h2.end + .4, .5, .6), sr(t, M.lamp + .3, M.lamp + 1.0)), sa = t < M.lamp ? silA(t, .9, -.5, Ln.f1.start - .3, Ln.h2.end + .4) : 0;
  env({ t, lonaE: (t > M.lamp ? .55 + .35 * sr(t, M.lamp, M.lamp + .8) : .4) * (scare ? flk(t, 18, .4, .3) : 1), lonaC: t > M.lamp ? 0xd8e4ff : 0xff8a45, inL: .3, inB: .25 + (t > M.lamp ? .3 : 0), flash: 2.2, led: rOn ? flk(t, 6, .3, .2) : .25,
    sil: sk > .01 ? { a: sa, k: sk * (t > M.lamp ? .92 : .8), s: t > M.lamp ? 1.15 : 1 } : null, spot: t > M.lamp ? { a: lerp(-.9, .05, sr(t, M.lamp, M.lamp + 1.4)), k: .55 * sr(t, M.lamp, M.lamp + .5), y: .8, s: 1.8 } : null,
    hand: sr(t, M.sting - .05, M.sting + .08) * .95, hands2: 1, handA: 0, handY: .62, exp: 1.25 });
  if (!sit) lying(t, { closed: t < Ln.h1.end - 1 ? 1 : 0, eye: 1.1, ry: .6 + sr(t, Ln.h1.end - 1, Ln.h1.end) * .3 });
  else { nBag.visible = true; const fear = Math.max(sr(t, Ln.n3.start - .5, Ln.n3.start), sr(t, M.lamp, Ln.n4.start)); pose(nico, { t, x: -.45, z: -.25, y: -.3, sit: 1, ry: .9, look: (t > Ln.f1.start && t < Ln.n3.start - .4) || (t > M.lamp && t < Ln.n4.start - .2) ? V(0, .7, -1.3) : t > M.radio && t < M.lamp ? V(.88, .6, .44) : cam.position,
    talk: talk('n1', t) + talk('n2', t) + talk('n3', t) + talk('n4', t), brow: .3 + fear * .7, eye: 1 + fear * .25, pupil: 1 - fear * .35, tremble: fear, aL: [-.4, .25], aR: [-.4, .25] }) }
  arms(t, { flash: t > Ln.h1.end - .3 ? 1 : 0, shake: win(t, -1, Ln.h1.end - .3, .1, .3) });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), 0, (scare && t - M.sting < .3 ? 1 : 0) + (t < Ln.h1.end - .4 ? .1 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 420, tint: 'rgba(40,60,130,.18)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .09 ? .45 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .3,
    alert: { k: Math.min(ramp(t, M.radio + .05, M.radio + .4), 1 - ramp(t, Ln.g2.end + .3, Ln.g2.end + .6)), buzz: t < M.radio + 1.1 ? 1 : 0, kk: 'HANDY · CANAL 3', m: 'GUARDAPARQUE', s: t > Ln.y2.start ? 'Transmitiendo…' : 'Llamada entrante…', col: ['#d9821a', '#8a4a06'] },
    end: ENDQ(t - M.endcard, 'ABRÍS', 'LLAMÁS POR RADIO', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const out = t >= M.open + .5, Do = [0, 1.45, -2.0];
  K3 = K3 || path([[0, Ec, HND, 72], [Ln.h1.end, Ec, [0, .62, -1.3], 56], [Ln.g1.end + .3, Ec, DOOR, 50], [M.off + .4, Ec, DOOR, 56], [Ln.f1.start, Ec, DOOR, 46], [M.away + 2.5, Ec, [-1, .62, -.9], 56], [M.dawn + .5, Ec, [-.62, .68, -.3], 84], [M.open, Ec, DOOR, 60],
    [M.open + .5, [0, .9, -1.2], [0, .6, -3], 74], [Ln.h4.start + .2, [1.7, 1.75, -3.3], [0, .2, -.5], 72], [Ln.h4.start + 3.0, [1.4, 1.7, -3.1], [-.9, .05, -3.4], 70], [Ln.h4.end, [.5, 1.55, -2.4], [-1.2, .3, -6], 62], [Ln.h5.end, Do, [-1.3, .6, -6], 54], [Ln.n1.start, Do, [-1.3, 1.2, -6], 46], [M.sting + .3, Do, [-1.3, 1.45, -6.1], 26], [C.dur, Do, [-1.3, 1.45, -6.1], 24]]);
  const c = evalPath(K3, t), scare = t > M.sting && t < M.sting + 1, rOn = t < Ln.g1.end + .3, dawnK = sr(t, M.dawn, M.dawn + 2.0), lampOn = t < M.off;
  const sk = t < M.off ? .85 : t < M.away ? .6 * sr(t, M.off + .4, M.off + 1.2) : .6 * (1 - sr(t, M.away, M.away + 2.2)), sa = t < M.away ? 0 : lerp(0, -1.4, sr(t, M.away, M.away + 2.2));
  if (!out) {
    env({ t, lonaE: lampOn ? .85 : lerp(.28, .75, dawnK), lonaC: lampOn ? 0xd8e4ff : dawnK > .1 ? 0xcfdcff : 0x8fa8e0, inL: 0, inB: .3 + dawnK * .5, flash: lerp(2.2, .6, dawnK), led: rOn ? flk(t, 6, .3, .2) : .25, hemi: .25 + dawnK * .4,
      sil: sk > .01 ? { a: sa, k: sk, s: t > Ln.f1.start && t < M.away ? 1.2 : 1 } : null, spot: lampOn ? { a: .05, k: .5, y: .8, s: 1.8 } : null, slider: sr(t, M.open - .2, M.open + .4), exp: 1.25 });
    nBag.visible = true; const fear = 1 - dawnK * .6;
    pose(nico, { t, x: -.45, z: -.25, y: -.3, sit: 1, ry: .9, look: t < M.dawn ? V(0, .7, -1.3) : cam.position, brow: .4 + fear * .6, eye: 1 + fear * .2, pupil: 1 - fear * .3, tremble: fear * .8, aL: [-.4, .25], aR: [-.4, .25] });
  } else {
    env({ t, inside: 0, dawn: 1, fire: 0, lonaE: 0, prints: 1, mist: .22, exp: 1.05, fogD: .028 });
    const nt = Ln.h5.start + .2, turn = sr(t, Ln.n1.start - .4, Ln.n1.start + .4);
    if (t > nt) walk(nico, t, [[nt, -.6, -1.6], [nt + 2.6, -1.25, -5.4]], { ryEnd: PI + turn * PI, still: { lean: (1 - turn) * .35, look: turn > .5 ? cam.position : undefined, talk: talk('n1', t), aR: [-turn * 1.0, .15], smile: sr(t, M.sting - .2, M.sting + .3) * .45, glow: sr(t, M.sting, M.sting + .4) * .5, noblink: 1, eye: 1 + sr(t, M.sting, M.sting + .4) * .15 } });
  }
  const rw = win(t, Ln.h1.start + 1.6, Ln.g1.end + .4, .4, .5);
  arms(t, { radio: rw, flash: !out && t > Ln.g1.end + .5 ? 1 : 0 }); HR.visible = rw > .5; HANDY.visible = !HR.visible; hrLed.material.color.setScalar(rOn ? flk(t, 6, .3, .2) : .2);
  setCam(c, t, cl(c.fov / 55, .2, 1) * (out ? .8 : 1) * (1 + (scare ? 1.4 : 0)), out && t < Ln.h4.start ? .1 : 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 420, tint: out ? 'rgba(150,170,210,.14)' : 'rgba(40,60,130,.18)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .35), win(t, M.away + 2.6, M.dawn + .3, .4, .5) * .9), white: Math.max(win(t, M.open + .3, M.open + .8, .2, .3) * .8, scare && t - M.sting < .09 ? .45 : 0),
    alert: { k: Math.min(ramp(t, Ln.y1.start - .3, Ln.y1.start), 1 - ramp(t, Ln.g1.end + .3, Ln.g1.end + .6)), buzz: 0, kk: 'HANDY · CANAL 3', m: 'GUARDAPARQUE', s: t > Ln.g1.start ? 'Recibiendo…' : 'Transmitiendo…', col: ['#d9821a', '#8a4a06'] },
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS<br>IRÍAS<br>A VER?', qs: 140, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

// EL MUELLE — muelle de pesca de noche con niebla, POV de Tito. P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'EL MUELLE', title: 'EL MUELLE', titleSize: 170, sleeve: 0x4a5a3a, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], cosa: ['#ff4558', 'EN LA NIEBLA', 1], abu: ['#7dffb0', 'EL ABUELO', 0], tel: ['#7dffb0', 'ABUELO · TELÉFONO', 1] } });
// ------------------------------------------------------------------ textures
T.plank = tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(28,${22 + Math.random() * 10}%,${26 + Math.random() * 10}%)`; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, i * 32 + 29, w, 3) } for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(20,10,0,${Math.random() * .3})`; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.lineTo(w, y + Math.random() * 4); g.stroke() } speck(g, w, h, 800, .2) }, 1, 40);
T.water = tex(256, 256, (g, w, h) => { g.fillStyle = '#16303c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${Math.random() < .5 ? '120,160,180' : '5,15,20'},${Math.random() * .35})`; g.lineWidth = 1 + Math.random() * 2; const x = Math.random() * w, y = Math.random() * h, l = 10 + Math.random() * 40; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke() } }, 60, 60);
T.sand = tex(256, 256, (g, w, h) => { g.fillStyle = '#8a7a5e'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .25, '60,50,30') }, 30, 10);
T.letter = tex(512, 640, (g, w, h) => { g.fillStyle = '#e8dfc4'; g.fillRect(0, 0, w, h); blot(g, w, h, 20, .15, '120,90,40', 90); g.strokeStyle = 'rgba(80,110,160,.25)'; for (let y = 120; y < h; y += 56) { g.beginPath(); g.moveTo(30, y); g.lineTo(w - 30, y); g.stroke() }
  g.fillStyle = '#1a2a5a'; g.font = 'italic 700 64px Inter'; g.fillText('No le', 60, 230); g.fillText('contestes.', 60, 320); g.font = 'italic 700 50px Inter'; g.fillText('— Tito', 230, 470) });
T.wallK = tex(256, 256, (g, w, h) => { g.fillStyle = '#c8b898'; g.fillRect(0, 0, w, h); blot(g, w, h, 20, .1, '90,70,40', 80); g.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 14, h) }, 3, 2);
T.tile = tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#d8d2c4' : '#7a3a2a'; g.fillRect(i * 32, j * 32, 32, 32) } speck(g, w, h, 1000, .1) }, 3, 3);
// ------------------------------------------------------------------ world: pier along -Z, deck top at y = 1.4
const W = grp(scene), DY = 1.4;
const waterM = new THREE.MeshPhongMaterial({ color: 0x9ab0bc, map: T.water, shininess: 70, specular: 0x667788 }); const wat = add(W, new THREE.PlaneGeometry(400, 400), waterM, 0, 0, -40, 2); wat.rotation.x = -PI / 2;
const deck = add(W, new THREE.BoxGeometry(2.6, .12, 42), new THREE.MeshLambertMaterial({ map: T.plank }), 0, DY - .06, -15, 2);
const postM = mat(0x3a2c20), railM = mat(0x4a3a2a);
for (let z = 5; z >= -36; z -= 3) for (const s of [-1, 1]) { const p = add(W, G.cyl, postM, s * 1.35, .9, z, 1); p.scale.set(.09, 2.6, .09); const r = add(W, G.cyl, postM, s * 1.35, DY + .5, z, 0); r.scale.set(.05, 1.0, .05) }
for (const s of [-1, 1]) box(W, .07, .07, 42, railM, s * 1.35, DY + .95, -15, 0);
const LAMPS = [-30, -21, -12, -3].map(z => { const g = grp(W); g.position.set(1.35, DY, z); const p = add(g, G.cyl, mat(0x2a2a2a), 0, 1.6, 0, 0); p.scale.set(.05, 3.2, .05); box(g, .5, .06, .06, mat(0x2a2a2a), -.22, 3.2, 0, 0); const b = sph(g, .08, basic(0xffc080), -.45, 3.12, 0, 0); const gl = glowSprite(g, 0xffb070, 2.4, -.45, 3.1, 0); const l = new THREE.PointLight(0xffa860, 0, 11, 1.3); l.position.set(-.45, 3.0, 0); g.add(l); return { l, b, gl } });
const BENCH = grp(W); BENCH.position.set(-.9, DY, -33.6); box(BENCH, .5, .06, 1.4, mat(0x5a4030), 0, .45, 0, 3); for (const z of [-.6, .6]) box(BENCH, .45, .45, .06, mat(0x2a2a2a), 0, .22, z, 0);
const BUCKET = add(W, new THREE.CylinderGeometry(.16, .13, .3, 16), mat(0x2a5a8a), .7, DY + .15, -33.2, 1);
const sand = add(W, new THREE.PlaneGeometry(200, 40), new THREE.MeshLambertMaterial({ map: T.sand }), 0, .9, 26, 2); sand.rotation.x = -PI / 2 - .04;
box(W, 200, 2.2, 1, mat(0x7a7468), 0, 1.6, 40, 2); const city = []; for (let i = 0; i < 40; i++) city.push(glowSprite(W, i % 3 ? 0xffd090 : 0xfff0d0, 1.5 + hash(i) * 1.5, -90 + i * 4.6, 3 + hash(i + 4) * 8, 46));
// bottle (P1 hook / letter, P3 floating)
const BOT = grp(W); const bgM = new THREE.MeshPhongMaterial({ color: 0x3a8a4a, transparent: true, opacity: .75, shininess: 100, specular: 0xffffff }); add(BOT, new THREE.CylinderGeometry(.05, .05, .2, 14), bgM, 0, 0, 0, 0); add(BOT, new THREE.CylinderGeometry(.018, .045, .09, 12), bgM, 0, .14, 0, 0); add(BOT, new THREE.CylinderGeometry(.02, .02, .03, 10), mat(0x8a6a40), 0, .2, 0, 0); add(BOT, new THREE.CylinderGeometry(.03, .03, .14, 10), mat(0xe8dfc4), 0, -.01, 0, 0);
const LINE = add(W, G.cyl, basic(0xd8d8d8), 0, 0, 0, 0);
const ROD = grp(rig); const rodM = add(ROD, G.cyl, mat(0x1a1a1a), 0, 0, 0, 0); const _ra = V(.17, -.36, -.45), _rb = V(.02, .55, -2.3); { const d = _rb.clone().sub(_ra); rodM.position.copy(_ra).addScaledVector(d, .5); rodM.scale.set(.012, d.length(), .012); rodM.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()) }
const LET = add(rig, new THREE.PlaneGeometry(.21, .26), new THREE.MeshLambertMaterial({ map: T.letter }), 0, -.02, -.5, 0); const letL = new THREE.PointLight(0xfff0d0, 0, 2, 1.5); letL.position.set(0, .1, -.2); rig.add(letL);
// boat
const BOAT = grp(W), hullM = mat(0x5a3a2a); box(BOAT, 1.2, .35, 3.0, hullM, 0, .25, 0, 1); box(BOAT, 1.0, .05, 2.8, mat(0x2a1a10), 0, .4, 0, 0); box(BOAT, 1.1, .06, .25, hullM, 0, .45, .3, 0);
const bowG = glowSprite(BOAT, 0x40ff80, 1.4, 0, .9, -1.4); const bowL = new THREE.PointLight(0x40ff80, 0, 8, 1.3); bowL.position.set(0, 1.0, -1.4); BOAT.add(bowL); add(BOAT, G.cyl, mat(0x222222), 0, .65, -1.4, 0).scale.set(.03, .5, .03);
const OAR = [-1, 1].map(s => { const o = add(BOAT, G.cyl, mat(0x6a5040), s * .75, .5, .2, 0); o.scale.set(.03, 2.2, .03); o.rotation.z = s * 1.2; return o });
const rower = makeChar({ skin: 0x2a2624, shirt: 0x22262c, pants: 0x1a1a1e, hair: 0x15151a, style: 'hat', noface: 1, h: 1.0, seed: 41 }); BOAT.add(rower.g);
// kitchen (P3 morning), far away at x = 80
const K = grp(scene); K.position.set(80, 0, 0);
const kf = add(K, new THREE.PlaneGeometry(6, 6), new THREE.MeshLambertMaterial({ map: T.tile }), 0, 0, 0, 2); kf.rotation.x = -PI / 2; const kwM = new THREE.MeshLambertMaterial({ map: T.wallK });
box(K, 6, 2.8, .1, kwM, 0, 1.4, -2.5, 2); box(K, .1, 2.8, 6, kwM, -2.6, 1.4, 0, 2); box(K, .1, 2.8, 6, kwM, 2.6, 1.4, 0, 2); box(K, 6, .1, 6, mat(0xe8e0d0), 0, 2.85, 0, 0);
const winK = add(K, new THREE.PlaneGeometry(1.4, 1.0), basic(0xffc890), .8, 1.7, -2.44, 0); for (const x of [.1, .8, 1.5]) box(K, .05, 1.0, .05, mat(0x5a4030), x, 1.7, -2.42, 0); box(K, 1.5, .05, .05, mat(0x5a4030), .8, 1.7, -2.42, 0);
box(K, 1.6, .06, 1.0, mat(0x7a5030), 0, .78, -.6, 3); for (const [x, z] of [[-.7, -1], [.7, -1], [-.7, -.2], [.7, -.2]]) box(K, .06, .78, .06, mat(0x5a3a20), x, .39, z, 0);
const kL = new THREE.PointLight(0xffd0a0, 0, 8, 1.2); kL.position.set(.8, 2.0, -1.6); K.add(kL); const kSun = new THREE.SpotLight(0xffc080, 0, 10, .6, .6, 1); kSun.position.set(.8, 2.0, -2.6); K.add(kSun); kSun.target.position.set(0, .8, -.4); K.add(kSun.target);
const KBOT = grp(K); KBOT.position.set(-.25, .92, -.55); { const m = new THREE.MeshPhongMaterial({ color: 0x5a7a3a, transparent: true, opacity: .8, shininess: 60 }); add(KBOT, new THREE.CylinderGeometry(.05, .05, .2, 14), m, 0, 0, 0, 0); add(KBOT, new THREE.CylinderGeometry(.018, .045, .09, 12), m, 0, .14, 0, 0); add(KBOT, new THREE.CylinderGeometry(.03, .03, .14, 10), mat(0xc8b890), 0, -.01, 0, 0) }
// ------------------------------------------------------------------ characters + sky
const abu = makeChar({ skin: 0xc89a78, shirt: 0x4a5a3a, pants: 0x2a2a30, hair: 0x2a3a5a, style: 'cap', stache: 1, h: .98, seed: 42 });
const moon = new THREE.DirectionalLight(0x9ab8ff, 0); moon.position.set(-20, 30, -40); scene.add(moon, moon.target);
const sun = new THREE.DirectionalLight(0xffd8b0, 0); sun.position.set(30, 20, -40); scene.add(sun, sun.target); const sunG = glowSprite(W, 0xffa060, 70, 60, 8, -120);
// ------------------------------------------------------------------ environment
const cN = new THREE.Color(0x2a323c), cDay = new THREE.Color(0xb8ccd8), cDawn = new THREE.Color(0xd8a888);
function env(o) {
  const t = o.t, day = o.day ?? 0, dawn = o.dawn ?? 0, fog = o.fog ?? 1;
  bg.copy(cN).lerp(cDawn, dawn).lerp(cDay, day); scene.fog.color.copy(bg); scene.fog.density = lerp(.008, o.fogD ?? .075, fog);
  LAMPS.forEach((L, i) => { const on = (o.lamps ?? 1) * (1 - day) * (1 - dawn * .7) * (o.flick && hash(Math.floor(t * 12) + i) < .3 ? .2 : 1); LI(L.l, on * 6); L.b.material.color.setScalar(cl(on, .2, 1)); L.gl.material.opacity = on * .8 });
  LI(moon, (1 - day) * (1 - dawn) * 1.0); LI(sun, day * 2 + dawn * 1.2); sunG.material.opacity = dawn * .9 + day * .2; hemi.intensity = o.hemi ?? (.45 + day * .9 + dawn * .5); hemi.color.setHex(day || dawn ? 0xfff0e0 : 0xa8bcdc);
  R.toneMappingExposure = o.exp ?? 1.25; T.water.offset.set(t * .004, t * .012); LI(flash, o.flash ?? 0); city.forEach(c => c.material.opacity = (1 - day) * .7);
  const b = o.boat; BOAT.visible = !!b; if (b) { BOAT.position.set(b.x, Math.sin(t * 1.3) * .05, b.z); BOAT.rotation.set(Math.sin(t * 1.1) * .03, b.ry ?? .2, Math.sin(t * .9) * .04); LI(bowL, (b.light ?? 1) * 4); bowG.material.opacity = (b.light ?? 1) * .9; const st = Math.sin(t * PI / .9) * (b.row ?? 1);
    OAR.forEach((r, i) => { r.rotation.x = st * .5; r.rotation.z = (i ? 1 : -1) * (1.2 + .2 * Math.cos(t * PI / .9) * (b.row ?? 1)) });
    pose(rower, { t, x: 0, z: .5, y: .1, sit: 1, ry: b.face ?? 0, hy: b.hy ?? 0, aL: [-1.2 + st * .3, .3], aR: [-1.2 + st * .3, .3], noblink: 1 }) }
  const bo = o.bottle; BOT.visible = !!bo; if (bo) { BOT.position.set(...bo.p); BOT.rotation.set(bo.rx ?? 0, 0, bo.rz ?? 0) }
  const ln = o.line; LINE.visible = !!ln; if (ln) { const a = V(...ln[0]), b2 = V(...ln[1]), d = b2.clone().sub(a); LINE.position.copy(a).addScaledVector(d, .5); LINE.scale.set(.004, d.length(), .004); LINE.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()) }
  ROD.visible = !!o.rod; LET.visible = (o.letter ?? 0) > .01; LET.position.y = .085 - (1 - (o.letter ?? 0)) * .5; LET.position.z = -.62; LI(letL, (o.letter ?? 0) * 1.2);
  LI(kL, o.kitchen ? 2.5 : 0); LI(kSun, o.kitchen ? 6 : 0);
}
const rodTip = () => { cam.updateMatrixWorld(); return _rb.clone().applyMatrix4(cam.matrixWorld).toArray() };
ARMP.rod = t => [[.17, -.36, -.45, -.4, 0, .1], [.05, -.42, -.5, -.4, 0, -.2]];
ARMP.read = t => [[.11, -.07, -.6, 1.2, 0, -.2], [-.11, -.07, -.6, 1.2, 0, .2]];
ARMP.ear = t => [[.17, -.08, -.22, .3, -.6, .2], [-.2, -.62, -.3, 0, 0, 0]];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const EYE = DY + 1.6, END = [0, EYE, -33], SEA = [-.6, .9, -50];
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.2, 3.8) * .92 }; hideAll(); const fb = t >= M.fb && t < M.back, scare = t > M.sting && t < M.sting + 1.1;
  K1 = K1 || path([[0, [0, EYE - .3, -33.2], [0, .3, -37], 52], [3.5, [0, EYE - .3, -33.2], [0, 2.4, -36], 50], [M.fb - .01, [0, EYE - .3, -33.4], [0, 2.6, -35.6], 44],
    [M.fb, [1.0, EYE, -27.5], [.4, 2.2, -31], 50], [M.back - .01, [1.0, EYE, -28.2], [.4, 2.3, -31], 44],
    [M.back, [.3, EYE, -31], SEA, 58], [Ln.h3.end, [.1, EYE, -32.6], SEA, 54], [M.letter + .3, [0, EYE - .3, -33], [0, 1.7, -34], 50], [Ln.h4.end, [0, EYE - .3, -33], [0, 1.7, -34], 48],
    [M.bell + .6, END, SEA, 56], [Ln.c1.start, END, [-3, 1.0, -43], 50], [M.sting, [0, EYE, -33.4], [-2.8, .9, -42], 44], [M.sting + .2, [0, EYE, -33.6], [-2.6, .9, -42], 34], [C.dur, [0, EYE, -33.6], [-2.6, .9, -42], 32]]);
  const c = evalPath(K1, t);
  if (fb) {
    env({ t, day: 1, fog: 0, exp: 1.0, lamps: 0 });
    pose(abu, { t, x: .3, y: DY, z: -31.2, ry: 2.6, look: cam.position, talk: talk('a1', t), brow: .3, aR: [-.9, .1], aL: [-.4, .1] });
  } else {
    const rise = sr(t, .2, 3.2), by = lerp(.05, 2.5, rise);
    setCam(c, t, cl(c.fov / 55, .25, 1)); // update matrix for rod tip
    env({ t, fog: 1, fogD: .04, boat: t > M.bell ? { x: lerp(-8, -2.6, sr(t, M.bell, M.sting + 2)), z: -46 + 4 * sr(t, M.bell, M.sting + 2), light: t > M.sting ? 1 : .8, row: 1 } : null,
      bottle: t < M.fb ? { p: [0, by, -35.2], rz: Math.sin(t * 2) * .2 } : null, line: t < 3.6 ? [rodTip(), [0, by + .25, -35.2]] : null, rod: t < 3.6, letter: win(t, M.letter + .1, Ln.h4.end + .2, .4, .3), flick: scare });
  }
  arms(t, { rod: !fb && t < 3.6 ? 1 : 0, read: win(t, M.letter + .1, Ln.h4.end + .2, .4, .3) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.4, .3, .25), titleY: 380, tint: fb ? 'rgba(255,190,120,.12)' : 'rgba(60,90,130,.14)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.fb - .35, M.fb + .25, .25, .25), win(t, M.back - .3, M.back + .3, .25, .3)),
    white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .25,
    end: ENDQ(t - M.endcard, 'LE CONTESTÁS', 'TE QUEDÁS CALLADO', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1;
  K2 = K2 || path([[0, [0, EYE, -33.4], [-1, 1.3, -44], 40], [M.off, [0, EYE, -33.4], [-1, 1.3, -44], 44], [M.boat + 1, END, [-2, 1.0, -42], 54], [Ln.h2.end, [.2, EYE, -33.6], [-1.5, 1.0, -38.5], 48], [Ln.c1.end, [.2, EYE, -33.8], [-1.2, 1.4, -37.6], 42],
    [Ln.f1.end, [.2, EYE, -33.9], [-1.2, 1.5, -37.4], 38], [M.ring + .5, [.5, EYE - .1, -32.6], [1.2, 2.0, -28], 54], [Ln.a2.end, [.5, EYE - .1, -32.6], [1.0, 2.0, -28], 52], [Ln.f2.start + .2, [.2, EYE, -33.8], [-1.2, 1.5, -37.4], 44], [M.sting, [.2, EYE, -34.0], [-1.2, 1.5, -37.4], 40], [M.sting + .2, [.2, EYE, -34.3], [-1.2, 1.5, -37.4], 30], [C.dur, [.2, EYE, -34.3], [-1.2, 1.5, -37.4], 28]]);
  const c = evalPath(K2, t), arr = sr(t, M.boat - 1, Ln.c1.start);
  env({ t, fog: 1, fogD: .04, boat: { x: lerp(-3, -1.3, arr), z: lerp(-44, -37.4, arr), ry: lerp(.4, .05, arr), light: 1, row: 1 - sr(t, Ln.c1.start - 1, Ln.c1.start), hy: scare ? .9 : 0 }, flash: t < M.off ? 3 : 0, lamps: 1, flick: scare });
  arms(t, { flash: t < M.off + .3 ? 1 : 0, ear: win(t, M.ring + .3, Ln.a2.end + .3, .4, .4) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(60,90,130,.14)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .25,
    alert: { k: Math.min(ramp(t, M.ring + .05, M.ring + .4), 1 - ramp(t, Ln.a2.end + .3, Ln.a2.end + .6)), buzz: t < Ln.a1.start ? 1 : 0, kk: 'LLAMANDO', m: 'ABUELO', s: t > Ln.a1.start ? 'En llamada…' : 'Llamando…', col: ['#2a8a5a', '#145a34'] },
    end: ENDQ(t - M.endcard, 'LE TIRÁS LA SOGA', 'CORRÉS A LA RAMBLA', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const home = t >= M.home && t < M.night, night = t >= M.night, scare = t > M.sting && t < M.sting + 1.1;
  const running = t < M.dawn + 1.5;
  let c;
  if (running) { // endless pier: loop inside a stretch with no unique props (lamps every 9 m, posts every 3 m)
    const loop = t < M.dawn - 1.2, z = loop ? -30 + ((t * 5.2) % 18) : lerp(-30 + ((M.dawn - 1.2) * 5.2 % 18), 4.5, sr(t, M.dawn - 1.2, M.dawn + 1.5));
    c = { p: [Math.sin(t * 5.5) * .08, EYE - .05, z], yaw: Math.sin(t * .7) * .04, pitch: -.05, fov: 62 }; // facing +Z (shore)
  } else {
    K3 = K3 || path([[M.dawn + 1.5, [0, EYE - .2, 6], [0, 2.4, 10], 56], [M.dawn + 2.6, [0, EYE - .2, 6.5], [0, 2.0, -20], 56], [M.home - .01, [0, EYE - .2, 7.0], [0, 2.0, -20], 50],
      [M.home, [80.6, 1.55, 1.6], [79.9, 1.1, -.6], 52], [Ln.h5.end, [80.5, 1.5, 1.2], [79.8, 1.0, -.6], 48], [Ln.a1.start + .2, [80.4, 1.5, 1.2], [80.0, 1.2, -1.1], 46], [M.night - .01, [80.3, 1.5, 1.0], [80.0, 1.25, -1.1], 42],
      [M.night, [0, EYE, -33.2], [0, .2, -38], 50], [M.sting - .5, [0, EYE, -33.4], [-.3, .2, -41], 48], [M.sting + .3, [0, EYE, -33.4], [-1, 1.0, -46], 40], [C.dur, [0, EYE, -33.5], [-1, 1.0, -46], 36]]);
    c = evalPath(K3, t);
  }
  if (running || t < M.home) {
    const dk = sr(t, M.dawn, M.dawn + 3);
    env({ t, fog: 1 - dk * .85, fogD: .05, dawn: dk, lamps: 1, flick: t > Ln.c1.start && t < Ln.c1.end, exp: 1.25 - dk * .15 });
  } else if (home) {
    env({ t, day: 1, fog: 0, kitchen: 1, exp: 1.05, hemi: .7 });
    pose(abu, { t, x: 80.0, z: -1.15, ry: 0, sit: 1, look: cam.position, talk: talk('a1', t), brow: .3, aR: [-.9, .1], aL: [-.2, .1] });
  } else {
    const fl = ramp(t, Ln.h6.start + 4, C.dur);
    env({ t, fog: 1, fogD: .04, bottle: t > Ln.h6.start + 3 ? { p: [-.2 - fl * 1.5, .06 + Math.sin(t * 1.5) * .03, -36 - fl * 8], rx: 1.45, rz: Math.sin(t) * .2 } : null, boat: t > M.sting - .2 ? { x: -4, z: -50, light: sr(t, M.sting - .2, M.sting + .3), row: 0, face: 0 } : null, lamps: 1, flick: scare });
  }
  arms(t, { run: running && t < M.dawn + 1 ? 1 : 0 });
  if (running) setCam(c, t, 1, t < M.dawn + 1 ? .8 : 0, 0); else setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.3 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: home ? 'rgba(255,200,140,.1)' : 'rgba(60,90,130,.14)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .3), win(t, M.home - .3, M.home + .3, .25, .3), win(t, M.night - .3, M.night + .3, .25, .3)), white: scare && t - M.sting < .09 ? .3 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS LE<br>HUBIERAS<br>CONTESTADO?', qs: 124, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

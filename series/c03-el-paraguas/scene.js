// EL PARAGUAS — lavadero 24 h, noche de lluvia, POV de Sofía. Las tres partes (P1/P2/P3) son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, phoneScr, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'EL PARAGUAS', title: 'EL PARAGUAS', titleSize: 165, sleeve: 0x6a4a8a, skin: 0xe0b090,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], rosa: ['#ffb0e0', 'DOÑA ROSA', 0], tel: ['#ffb84d', 'DOÑA ROSA · TELÉFONO', 1], cosa: ['#ff4558', 'EL DEL PARAGUAS', 1] } });
// ------------------------------------------------------------------ textures
T.tile = tex(256, 256, (g, w, h) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#d8d2c4' : '#8a9aa0'; g.fillRect(i * 64, j * 64, 64, 64) } speck(g, w, h, 1500, .1); blot(g, w, h, 10, .08, '40,40,40', 40) }, 8, 8);
T.wall = tex(256, 256, (g, w, h) => { g.fillStyle = '#b9d3cf'; g.fillRect(0, 0, w, h); g.fillStyle = '#8fb3ae'; g.fillRect(0, h * .62, w, h * .38); g.fillStyle = '#6f8f8a'; g.fillRect(0, h * .62, w, 6); speck(g, w, h, 1200, .08) }, 3, 1);
T.asphalt = tex(256, 256, (g, w, h) => { g.fillStyle = '#1c1f24'; g.fillRect(0, 0, w, h); speck(g, w, h, 4000, .25, '120,120,130'); blot(g, w, h, 20, .2, '60,70,90', 50) }, 10, 10);
T.side = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a4c50'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke() } speck(g, w, h, 2000, .2) }, 12, 2);
T.sign = tex(512, 128, (g, w, h) => { g.fillStyle = '#123a6a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 64px Inter'; g.textAlign = 'center'; g.fillText('LAVADERO 24 H', w / 2, 86) });
const num = n => tex(64, 64, (g, w, h) => { g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.fillStyle = '#111'; g.font = '900 40px Inter'; g.textAlign = 'center'; g.fillText(n, 32, 46) });
T.box = tex(256, 128, (g, w, h) => { g.fillStyle = '#b08a5a'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '800 26px Inter'; g.textAlign = 'center'; g.fillText('OBJETOS PERDIDOS', w / 2, 74); speck(g, w, h, 600, .15) });
T.house = tex(512, 256, (g, w, h) => { g.fillStyle = '#2a2c34'; g.fillRect(0, 0, w, h); for (let i = 0; i < 6; i++) { const x = 20 + i * 82; g.fillStyle = i % 3 == 1 ? 'rgba(255,190,110,.75)' : '#11131a'; g.fillRect(x, 60, 50, 70); g.fillStyle = '#11131a'; g.fillRect(x, 160, 50, 60) } g.fillStyle = '#3a2a20'; g.fillRect(250, 160, 60, 96); blot(g, w, h, 20, .2, '0,0,0', 60) });
// ------------------------------------------------------------------ world: laundromat (front glass at z = 0, street towards +Z)
const IN = grp(scene), OUT = grp(scene);
const flo = add(IN, new THREE.PlaneGeometry(6.4, 6.4), new THREE.MeshLambertMaterial({ map: T.tile }), 0, 0, -3.1, 2); flo.rotation.x = -PI / 2;
const wallM = new THREE.MeshLambertMaterial({ map: T.wall }); box(IN, 6.4, 3, .1, wallM, 0, 1.5, -6.3, 2); box(IN, .1, 3, 6.4, wallM, -3.2, 1.5, -3.1, 2); box(IN, .1, 3, 6.4, wallM, 3.2, 1.5, -3.1, 2); box(IN, 6.4, .1, 6.4, mat(0xdcdcd6), 0, 3, -3.1, 0);
box(IN, 6.4, .5, .12, mat(0x123a6a), 0, 2.75, 0, 0); box(IN, 6.4, .35, .12, mat(0x8a8f96), 0, .17, 0, 0);
for (const x of [-3.15, 3.15]) box(IN, .1, 2.6, .14, mat(0x8a8f96), x, 1.3, 0, 0);
const glassM = new THREE.MeshPhongMaterial({ color: 0x9ab8c8, transparent: true, opacity: .16, specular: 0xffffff, shininess: 80, depthWrite: false });
for (const x of [-2.1, 2.1]) add(IN, new THREE.PlaneGeometry(2.0, 2.2), glassM, x, 1.45, 0, 0);
const DOORP = grp(IN); DOORP.position.set(-1.05, 0, 0); box(DOORP, 2.1, .08, .08, mat(0x8a8f96), 1.05, 2.5, 0, 0); box(DOORP, .08, 2.5, .08, mat(0x8a8f96), 2.06, 1.25, 0, 0); add(DOORP, new THREE.PlaneGeometry(2.0, 2.4), glassM, 1.05, 1.3, 0, 0); box(DOORP, .04, .35, .06, mat(0xc0c4c8), 1.85, 1.15, -.06, 0);
const KEY = grp(DOORP); KEY.position.set(1.85, 1.0, -.08); box(KEY, .04, .02, .04, mat(0xd8b050), 0, 0, 0, 0);
const BELL = grp(IN); BELL.position.set(.9, 2.45, -.12); add(BELL, new THREE.ConeGeometry(.06, .08, 12, 1, true), mat(0xd8b050, { side: THREE.DoubleSide }), 0, 0, 0, 0);
box(IN, 3.2, .6, .02, basic(0xffffff, { map: T.sign }), 0, 2.75, .07, 0);
// washers along the left wall (facing +X), numbered 1..5; dryers stacked on the back wall
const WASH = [], numT = [1, 2, 3, 4, 5].map(n => num(n));
const drumM = mat(0x2a2e33), doorRing = mat(0xc8ccd0), wGlass = new THREE.MeshPhongMaterial({ color: 0x8fb0c0, transparent: true, opacity: .25, specular: 0xffffff, shininess: 90, depthWrite: false });
const CLOTHC = [0xd04a4a, 0x3a6ad0, 0xf0f0e8, 0x2a9a6a, 0xe0c040, 0x9a5ab0];
for (let i = 0; i < 5; i++) { const g = grp(IN), z = -5.2 + i * .82; g.position.set(-2.8, 0, z); box(g, .72, .92, .74, mat(0xeef0f2), 0, .46, 0, 3); box(g, .74, .12, .76, mat(0x9aa0a6), 0, .98, 0, 0);
  const fr = grp(g); fr.position.set(.37, .52, 0); fr.rotation.y = PI / 2; const ring = add(fr, new THREE.TorusGeometry(.22, .035, 10, 32), doorRing, 0, 0, .02, 0); add(fr, new THREE.CircleGeometry(.21, 32), wGlass, 0, 0, .03, 0);
  const drum = grp(fr); drum.position.z = 0; add(drum, new THREE.CircleGeometry(.2, 24), drumM, 0, 0, .001, 0); const cl = [];
  for (let k = 0; k < 6; k++) { const s = sph(drum, .07, mat(CLOTHC[(k + i) % 6]), 0, 0, .012, 0); s.scale.set(.08, .055, .05); cl.push(s) }
  const umb = grp(drum); add(umb, new THREE.ConeGeometry(.15, .05, 8, 1, true), mat(0x0a0a0c, { side: THREE.DoubleSide }), 0, 0, .014, 0).rotation.x = PI / 2; add(umb, G.cyl, mat(0x111111), 0, 0, .016, 0).scale.set(.008, .3, .008); umb.visible = false;
  const led = sph(g, .012, basic(0x30ff70), .37, .86, .2, 0); add(g, new THREE.PlaneGeometry(.12, .12), basic(0xffffff, { map: numT[i], transparent: true }), .371, .86, -.22, 0).rotation.y = PI / 2;
  WASH.push({ g, drum, cl, umb, led, glow: glowSprite(fr, 0x8fc0ff, .7, 0, 0, -.02) }) }
for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const g = grp(IN); g.position.set(-1.6 + i * .95, .55 + j * .95, -5.95); box(g, .88, .88, .6, mat(0xdfe2e6), 0, 0, 0, 3); add(g, new THREE.TorusGeometry(.26, .03, 8, 28), doorRing, 0, .02, .31, 0); add(g, new THREE.CircleGeometry(.25, 28), drumM, 0, .02, .305, 0) }
box(IN, .5, .45, 2.4, mat(0x7a5a3a), 2.85, .23, -3.2, 3); box(IN, 1.4, .95, .6, mat(0x5a6a7a), 2.4, .48, -5.6, 3);
const LFBOX = grp(IN); LFBOX.position.set(2.4, .96, -5.55); box(LFBOX, .6, .3, .4, new THREE.MeshLambertMaterial({ map: T.box }), 0, .15, 0, 1); const LFU = [];
for (let i = 0; i < 9; i++) { const u = add(LFBOX, G.cyl, mat(0x0d0d10), -.22 + (i % 5) * .11, .45, -.12 + Math.floor(i / 5) * .2, 0); u.scale.set(.035, .55, .035); u.rotation.z = (hash(i) - .5) * .4; LFU.push(u) }
const tubeM = basic(0xffffff); for (const z of [-1.4, -4.2]) box(IN, .2, .05, 2.2, tubeM, 0, 2.95, z, 0);
const inL = [-1.5, -4.4].map(z => { const l = new THREE.PointLight(0xeef4ff, 0, 9, 1.2); l.position.set(0, 2.6, z); IN.add(l); return l });
// street
const road = add(OUT, new THREE.PlaneGeometry(60, 7), new THREE.MeshPhongMaterial({ map: T.asphalt, specular: 0x6070a0, shininess: 40 }), 0, -.02, 5.2, 2); road.rotation.x = -PI / 2;
for (const z of [.9, 9.5]) { const s = add(OUT, new THREE.PlaneGeometry(60, 1.9), new THREE.MeshLambertMaterial({ map: T.side }), 0, .02, z, 2); s.rotation.x = -PI / 2 }
const facade = add(OUT, new THREE.PlaneGeometry(30, 9), new THREE.MeshLambertMaterial({ map: T.house, emissive: 0xffffff, emissiveMap: T.house, emissiveIntensity: .25 }), 0, 4.5, 11, 0); facade.rotation.y = PI;
const LAMP = grp(OUT); LAMP.position.set(2.6, 0, 9.0); add(LAMP, G.cyl, mat(0x2a2c30), 0, 2.2, 0, 0).scale.set(.06, 4.4, .06); box(LAMP, .5, .1, .2, mat(0x2a2c30), -.2, 4.4, 0, 0);
const lampG = glowSprite(LAMP, 0xffb060, 2.4, -.35, 4.3, 0), lampL = new THREE.PointLight(0xffa850, 0, 16, 1.1); lampL.position.set(-.35, 4.1, 0); LAMP.add(lampL);
const cone = add(LAMP, new THREE.ConeGeometry(1.6, 4.2, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffa850, transparent: true, opacity: .06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), -.35, 2.15, 0, 0);
const sky = new THREE.Color();
// rain: line segments, pure function of time; drops inside the man's dry column are hidden
const NR = 1600, rainG = new THREE.BufferGeometry(), rainP = new Float32Array(NR * 6); rainG.setAttribute('position', new THREE.BufferAttribute(rainP, 3));
const rainM = new THREE.LineBasicMaterial({ color: 0xb8c8e0, transparent: true, opacity: .55, depthWrite: false }), RAIN = new THREE.LineSegments(rainG, rainM); RAIN.frustumCulled = false; OUT.add(RAIN);
function rain(t, k, dry) { RAIN.visible = k > .01; rainM.opacity = .55 * k; if (!RAIN.visible) return; for (let i = 0; i < NR; i++) { const x = (hash(i * 1.7) - .5) * 14, z = .25 + hash(i * 3.1) * 11, sp = 7 + hash(i * 5.3) * 3, y = 6 - ((t * sp + hash(i * 7.7) * 6) % 6);
  let hide = hash(i * 9.1) > k; if (dry && Math.hypot(x - dry[0], z - dry[1]) < .62 && y < 2.6) hide = true; const o = i * 6, yy = hide ? -50 : y; rainP[o] = x; rainP[o + 1] = yy; rainP[o + 2] = z; rainP[o + 3] = x - .02; rainP[o + 4] = yy + .28; rainP[o + 5] = z } rainG.attributes.position.needsUpdate = true }
// ------------------------------------------------------------------ characters
const man = makeChar({ skin: 0x231f1c, shirt: 0x2a2c34, pants: 0x1a1b20, hair: 0x0b0b0d, style: 'hat', noface: 1, h: 1.08, seed: 3 });
const UMB = grp(man.A[0]); { const u = grp(UMB); u.position.set(0, -.62, 0); add(u, G.cyl, mat(0x15151a), 0, .55, 0, 0).scale.set(.012, 1.1, .012); add(u, new THREE.ConeGeometry(.75, .35, 10, 1, true), mat(0x08080a, { side: THREE.DoubleSide }), 0, 1.15, 0, 1) }
const rosa = makeChar({ skin: 0xe0b896, shirt: 0x7a4a8a, pants: 0x3a3030, skirt: 0x3a3a4a, hair: 0xd8d8d8, style: 'bun', h: .93, seed: 5 });
const RUMB = grp(rosa.A[0]); { add(RUMB, G.cyl, mat(0x111111), 0, -.75, .05, 0).scale.set(.014, .7, .014); add(RUMB, new THREE.ConeGeometry(.07, .5, 8), mat(0x0a0a0c), 0, -.95, .05, 0) } RUMB.visible = false;
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
const cNight = new THREE.Color(0x070a12), cDay = new THREE.Color(0xc8d4e0), cDawn = new THREE.Color(0x6a7a90);
function env(o) {
  const L = o.lights ?? 1; inL.forEach(l => LI(l, L * 3.4)); tubeM.color.setScalar(cl(L, .08, 1)); LI(flash, o.flash ?? 0);
  const day = o.day ?? 0, dawn = o.dawn ?? 0; sky.copy(cNight).lerp(cDawn, dawn).lerp(cDay, day); bg.copy(sky); scene.fog.color.copy(sky); scene.fog.density = o.fogD ?? .035;
  const lamp = (o.lamp ?? 1) * (1 - day) * (1 - dawn * .7); LI(lampL, lamp * 5); lampG.material.opacity = lamp * .9; cone.material.opacity = lamp * .06;
  hemi.intensity = o.hemi ?? (.35 + day * .9 + dawn * .4); hemi.color.setHex(day ? 0xfff2e0 : 0xb8c8ff); R.toneMappingExposure = o.exp ?? 1.1;
  facade.material.emissiveIntensity = .25 * (1 - day);
  rain(o.t, o.rain ?? 0, o.dry); DOORP.rotation.y = o.door ?? 0; BELL.rotation.z = Math.sin(o.t * 30) * (o.bell ?? 0) * .4;
  WASH.forEach((w, i) => { const spin = i == 3 ? (o.spin4 ?? 0) : (o.spin ?? 0), a = o.t * 7 * spin; w.drum.rotation.z = a; w.cl.forEach((c, k) => { const b = a + k * 1.05; c.position.set(Math.cos(b) * .13, Math.sin(b) * .13 - (spin < .1 ? .08 : 0), .012); c.visible = i == 3 ? !!o.clothes4 : true });
    w.umb.visible = i == 3 && !!o.umb4; w.led.material.color.setHex(spin > .1 ? 0x30ff70 : 0x203020); w.glow.material.opacity = i == 3 ? (o.glow4 ?? 0) * .4 : 0 });
}
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const W4 = [-2.43, .52, -2.74], GL = [0, 1.5, .5], FAR = [2.2, 1.5, 8.6];
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  const fb = t >= M.fb && t < M.back, close = t > M.flick + 1.1, scare = t > M.sting && t < M.sting + 1;
  K1 = K1 || path([[0, [1.2, 1.6, -3.2], FAR, 50], [M.fb - .01, [1.1, 1.6, -2.0], FAR, 34],
    [M.fb, [.2, 1.6, -2.6], [2.3, 1.4, -5.4], 60], [M.back - .01, [.3, 1.6, -2.8], [2.3, 1.45, -5.4], 52],
    [M.back, [.9, 1.55, -4.6], W4, 62], [Ln.h3.start + 2.2, [.9, 1.55, -4.0], GL, 62], [Ln.h3.end, [1.2, 1.6, -3.0], FAR, 40], [M.flick + 1.0, [1.2, 1.6, -3.0], FAR, 42],
    [M.flick + 1.3, [.6, 1.6, -3.0], [-.4, 1.5, .5], 58], [M.knock, [.5, 1.6, -3.0], [-.3, 1.45, .5], 56], [Ln.h5.end, [.4, 1.6, -2.6], [-.3, 1.5, .5], 52], [M.bell + .4, [.4, 1.6, -2.6], [.4, 1.3, .1], 56], [M.sting, [.3, 1.6, -2.3], [-.1, 1.4, .5], 54], [M.sting + .3, [.3, 1.6, -2.1], [-.2, 1.6, .5], 44], [C.dur, [.3, 1.6, -2.1], [-.2, 1.6, .5], 42]]);
  const c = evalPath(K1, t), lt = t > M.flick && t < M.flick + 1.1 ? flk(t, 12, .5, 0) : scare ? flk(t, 16, .45, .05) : 1;
  if (fb) {
    env({ t, day: 1, rain: 0, lights: 1, exp: 1.0, lamp: 0 });
    pose(rosa, { t, x: 2.2, z: -5.0, ry: -.6, look: cam.position, talk: talk('r1', t), smile: .3, aR: [-1.3, .3], brow: Ln.r1 && t > Ln.r1.start ? .3 : 0 });
  } else {
    env({ t, rain: 1, lights: lt, spin: .6, door: sr(t, M.bell, M.bell + 1.5) * .25 - (scare ? .05 : 0), bell: win(t, M.bell, M.bell + 1.2, .05, .6), exp: 1.25 });
    const mx = close ? -.3 : 2.2, mz = close ? .6 : 8.6; pose(man, { t, x: mx, z: mz, ry: PI, aR: [-1.35, .05], hp: .1, aL: t > M.knock && t < M.knock + 1.3 ? [-1.9, -.2] : [0, 0] });
  }
  arms(t, {});
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), 0, (scare && t - M.sting < .3 ? 1 : 0) + (t > M.flick + 1.1 && t < M.flick + 1.4 ? .6 : 0));
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 380, tint: fb ? 'rgba(255,190,120,.12)' : 'rgba(60,90,170,.16)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.fb - .35, M.fb + .25, .25, .25), win(t, M.back - .3, M.back + .3, .25, .3)),
    white: scare && t - M.sting < .1 ? .55 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .3,
    end: ENDQ(t - M.endcard, 'CERRÁS CON LLAVE', 'TE ESCONDÉS', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
ARMP.key = t => [[.12, -.2, -.48, .3, 0, -.6 + Math.sin(t * 10) * .1], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.ear = t => [[.17, -.08, -.22, .3, -.6, .2], [-.2, -.62, -.3, 0, 0, 0]];
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1, ph = t > M.ring + .6 && t < Ln.r2.end + .4;
  K2 = K2 || path([[0, [.6, 1.6, -2.6], [.4, 1.1, .2], 62], [Ln.h1.end - 1.2, [.6, 1.55, -.9], [.75, 1.0, 0], 54], [Ln.m1.start, [.5, 1.6, -2.2], [-.2, 1.5, .7], 54], [Ln.m1.end, [.5, 1.6, -2.4], [-.2, 1.5, .7], 50],
    [Ln.h2.start + 1.2, [.7, 1.6, -3.4], [-.2, 1.3, .7], 58], [Ln.h2.end, [.7, 1.6, -3.6], [-.2, 1.4, .7], 54], [M.ring + .5, [.8, 1.6, -2.8], [-.3, 1.4, .7], 50],
    [Ln.r1.start + .4, [.9, 1.6, -3.2], [-1.0, .9, -4.8], 64], [Ln.r2.end, [.6, 1.6, -3.0], [-1.6, .8, -3.3], 60], [M.spin + .6, [.2, 1.45, -2.8], W4, 52], [Ln.h4.start + .5, [-1.2, 1.2, -2.74], W4, 50], [M.tap, [-1.45, 1.0, -2.74], W4, 40],
    [M.tap + .8, [-.6, 1.5, -2.9], [-.3, 1.5, .6], 56], [M.sting, [-.5, 1.55, -2.6], [-.3, 1.5, .6], 54], [M.sting + .3, [-.4, 1.55, -2.3], [-.3, 1.55, .6], 44], [C.dur, [-.4, 1.55, -2.3], [-.3, 1.55, .6], 42]]);
  const c = evalPath(K2, t);
  env({ t, rain: 1, dry: [-.3, .6], lights: scare ? flk(t, 16, .45, .05) : 1, spin: 0, spin4: t > M.spin ? 1.3 : 0, umb4: t > M.spin + 1, glow4: t > M.spin ? .3 : 0, exp: 1.1 });
  pose(man, { t, x: -.3, z: .6, ry: PI, aR: [-1.35, .05], hp: .05, aL: t > M.tap && t < M.tap + 1.5 ? [-1.9, -.2] : t > Ln.m2.start ? [-1.4, .5] : [0, 0] });
  phone.visible = false;
  arms(t, { key: win(t, Ln.h1.start + 2, Ln.h1.end + .2, .3, .3), ear: win(t, M.ring + .5, Ln.r2.end + .4, .4, .4) });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.5 : 0)), t < 2 ? .7 : 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(60,90,170,.16)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .1 ? .5 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .3,
    alert: { k: Math.min(ramp(t, M.ring + .05, M.ring + .4), 1 - ramp(t, Ln.r2.end + .3, Ln.r2.end + .6)), buzz: t < Ln.r1.start ? 1 : 0, kk: 'LLAMADA', m: 'DOÑA ROSA', s: t > Ln.r1.start ? 'En llamada…' : 'Llamando…', col: ['#7a3a9a', '#4a1a6a'] },
    end: ENDQ(t - M.endcard, 'SE LO DEVOLVÉS', 'ESPERÁS QUE PARE', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const night = t < M.dawn, scare = t > M.sting && t < M.sting + 1;
  const LOW = [1.3, .95, -5.0];
  K3 = K3 || path([[0, LOW, [.2, 1.2, .5], 58], [Ln.m1.start, [1.25, .95, -4.6], [-.3, 1.5, .5], 46], [M.night + 2, [1.3, .9, -4.8], [-.3, 1.4, .5], 54], [M.dawn - .01, [1.3, .95, -4.8], [0, 1.4, .5], 56],
    [M.dawn, [1.0, 1.6, -3.6], [0, 1.4, 4], 58], [M.rosa + .3, [1.0, 1.6, -3.4], [.2, 1.5, .5], 56], [Ln.r1.end, [.8, 1.6, -3.4], [-.6, 1.5, -1.6], 52], [M.open + 1, [.4, 1.6, -3.6], [-2.2, .8, -2.6], 56], [Ln.h4.start + 4, [.2, 1.55, -3.6], [-1.9, 1.0, -2.3], 50],
    [Ln.r2.start + .5, [.2, 1.6, -3.0], [-1.0, 1.4, -3.2], 54], [M.box + .5, [1.4, 1.6, -4.1], [2.4, 1.0, -5.55], 54], [Ln.h5.end - 1, [1.9, 1.7, -4.6], [2.4, 1.0, -5.55], 44], [M.sting + .3, [1.3, 1.6, -3.4], FAR, 48], [Ln.h6.end, [1.2, 1.6, -2.4], FAR, 34], [C.dur, [1.2, 1.6, -2.4], FAR, 32]]);
  const c = evalPath(K3, t), dk = sr(t, M.dawn, M.dawn + 1.5), rn = night ? 1 : t > M.sting - .2 ? sr(t, M.sting - .2, M.sting + 1.2) : 0;
  env({ t, rain: rn, lights: night ? .0 : 1, dawn: dk * (1 - sr(t, M.sting - .3, M.sting + .6) * .6), exp: night ? 1.35 : 1.1, spin: 0, spin4: 0, umb4: t < M.open + 1.8, clothes4: 0, hemi: night ? .4 : undefined,
    door: t > M.rosa && t < M.rosa + 2.2 ? win(t, M.rosa, M.rosa + 2.2, .5, .6) * .9 : 0, bell: win(t, M.rosa, M.rosa + 1.2, .05, .6) });
  if (night) pose(man, { t, x: -.3, z: .6, ry: PI, aR: [-1.35, .05], aL: (t % 1.8) < .9 && t > M.night ? [-1.9, -.2] : [0, 0] });
  if (t > M.sting) pose(man, { t, x: 2.2, z: 8.6, ry: PI, aR: [-1.35, .05] });
  if (t > M.rosa) { const holding = t > M.open + 1.8; RUMB.visible = holding;
    if (t < M.open) walk(rosa, t, [[M.rosa, .2, .9], [M.open - .1, -1.7, -1.9]], { ryEnd: -PI / 2 });
    else if (t < M.box) pose(rosa, { t, x: -1.7, z: -1.9, ry: t < Ln.h4.start + 4 ? -PI / 2 : PI / 2 + .4, look: t > Ln.r2.start - .3 ? cam.position : undefined, talk: talk('r2', t), aR: holding ? [-.9, .1] : [-1.3, .2], brow: .3, smile: .15 });
    else pose(rosa, { t, x: 1.3, z: -5.3, ry: PI / 2, look: cam.position, aR: [-.5, .1], brow: .4 }) }
  arms(t, {});
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1 + (scare ? 1.3 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: night ? 'rgba(40,60,150,.2)' : 'rgba(150,170,210,.12)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .35), win(t, M.dawn - .5, M.dawn + .3, .4, .4)), white: scare && t - M.sting < .12 ? .7 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOLVERÍAS<br>AL<br>LAVADERO?', qs: 128, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

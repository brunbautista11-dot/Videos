// EL DEL FAROL — ruta de noche, POV al volante. El auto queda fijo en el origen (mira a -Z) y el mundo se mueve.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, makeChar, pose, talk, hideAll, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, run } from './core.js';
init({ tag: 'EL DEL FAROL', title: 'EL DEL<br>FAROL', titleSize: 210, sleeve: 0x4a5a3a, skin: 0xc98d68,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], radio: ['#ffb84d', 'LA RADIO', 1], hombre: ['#ff4558', 'EL DEL FAROL', 1], playero: ['#7dffb0', 'EL PLAYERO', 0] } });
// ------------------------------------------------------------------ textures
T.road = tex(256, 512, (g, w, h) => { g.fillStyle = '#2e3033'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .3); speck(g, w, h, 900, .12, '255,255,255'); g.fillStyle = '#d8d2b8'; g.fillRect(8, 0, 7, h); g.fillRect(w - 15, 0, 7, h); g.fillStyle = '#e2c64a'; g.fillRect(w / 2 - 4, 40, 8, 210) }, 1, 40);
T.grass = tex(256, 256, (g, w, h) => { g.fillStyle = '#1c2a1c'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .25, '10,20,8', 60); speck(g, w, h, 2500, .3, '60,90,40') }, 60, 60);
T.km = tex(256, 160, (g, w, h) => { g.fillStyle = '#0e6b3c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 44px Inter, sans-serif'; g.fillText('RUTA 26 · KM', w / 2, 62); g.font = '900 84px Inter, sans-serif'; g.fillText('233', w / 2, 138) });
const radT = [['OFF', '#8a6226', 0], ['FM 233.0', '#ffb02e', 1]].map(([tx, c, on]) => tex(512, 256, (g, w, h) => { g.fillStyle = '#1b1e22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a4f56'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#070605'; g.fillRect(96, 28, 320, 110); g.shadowColor = c; g.shadowBlur = on ? 22 : 8; g.fillStyle = c; g.font = '900 78px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tx, w / 2, 86); g.shadowBlur = 0;
  for (const x of [48, 464]) { g.fillStyle = '#3a3f46'; g.beginPath(); g.arc(x, 84, 34, 0, 7); g.fill(); g.fillStyle = '#8a9099'; g.fillRect(x - 3, 54, 6, 26) } for (let i = 0; i < 6; i++) { g.fillStyle = '#2c3037'; g.fillRect(40 + i * 74, 170, 62, 50); g.fillStyle = on ? c : '#5a5f66'; g.font = '800 26px Inter, sans-serif'; g.fillText(String(i + 1), 71 + i * 74, 197) } }));
T.mirN = tex(256, 80, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1630'); gr.addColorStop(.5, '#131c34'); gr.addColorStop(.5, '#0a0c10'); gr.addColorStop(1, '#16181c'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#1d2024'; g.beginPath(); g.moveTo(118, 40); g.lineTo(138, 40); g.lineTo(230, h); g.lineTo(26, h); g.fill(); g.fillStyle = '#8a7a30'; g.fillRect(126, 52, 4, 10); g.fillRect(125, 68, 6, 12); g.fillStyle = '#0a1410'; for (let i = 0; i < 9; i++) { const x = i * 30 + (i > 4 ? 10 : -6); if (x > 100 && x < 150) continue; g.beginPath(); g.moveTo(x, 42); g.lineTo(x + 9, 14 + (i % 3) * 5); g.lineTo(x + 18, 42); g.fill() } });
T.gauge = tex(256, 96, (g, w, h) => { g.fillStyle = '#07090b'; g.fillRect(0, 0, w, h); for (const cx of [70, 186]) { g.strokeStyle = '#3fd0c0'; g.lineWidth = 5; g.beginPath(); g.arc(cx, 62, 40, PI, 2 * PI); g.stroke(); g.strokeStyle = '#ff5a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, 62); g.lineTo(cx + 22, 30); g.stroke() } });
T.est = tex(512, 128, (g, w, h) => { g.fillStyle = '#b3131d'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 70px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ESTACIÓN 26', w / 2, h / 2 + 4) });
// ------------------------------------------------------------------ world: road
const ROAD = grp(scene), CAR = grp(scene), ST = grp(scene);
const gr = add(ROAD, new THREE.PlaneGeometry(500, 500), mat(0xffffff, { map: T.grass }), 0, -.02, -100); gr.rotation.x = -PI / 2;
const rd = add(ROAD, new THREE.PlaneGeometry(7, 400), mat(0xffffff, { map: T.road }), -1.75, 0, -150); rd.rotation.x = -PI / 2;
const TREES = Array.from({ length: 30 }, (_, i) => { const g = grp(ROAD), s = i % 2 ? 1 : -1, h = 4 + hash(i * 3.3) * 4; const tr = add(g, G.cyl, mat(0x2a1f16), 0, h * .2, 0); tr.scale.set(.18, h * .4, .18); const cn = add(g, new THREE.ConeGeometry(1.2 + hash(i) * .8, h * .8, 7), mat(0x14261a), 0, h * .7, 0); g.userData = { x: s * (7.5 + hash(i * 7.7) * 9) - 1.75, base: i * 5.6 + hash(i * 1.9) * 3 }; return g });
const POSTS = Array.from({ length: 16 }, (_, i) => { const g = grp(ROAD); box(g, .1, .9, .1, mat(0xd8d8d0), 0, .45, 0, 0); box(g, .11, .12, .02, basic(i % 2 ? 0xff5030 : 0xffe9b0), 0, .78, .06, 0); g.userData = { x: i % 2 ? 2.3 : -5.8, base: i * 10 }; return g });
const SIGN = grp(ROAD); box(SIGN, .1, 2.2, .1, mat(0x8a8d90), 0, 1.1, 0, 0); add(SIGN, new THREE.PlaneGeometry(1.2, .75), new THREE.MeshLambertMaterial({ map: T.km, emissive: 0xffffff, emissiveMap: T.km, emissiveIntensity: .4 }), 0, 2.0, .06);
const starG = new THREE.BufferGeometry(); { const a = new Float32Array(300 * 3); for (let i = 0; i < 300; i++) { const th = hash(i) * 2 * PI, ph = .1 + hash(i * 2.3) * 1.2; a[i * 3] = Math.cos(th) * Math.cos(ph) * 150; a[i * 3 + 1] = Math.sin(ph) * 150; a[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * 150 } starG.setAttribute('position', new THREE.BufferAttribute(a, 3)) }
const stars = new THREE.Points(starG, new THREE.PointsMaterial({ color: 0xcfe0ff, size: .9, transparent: true, fog: false, depthWrite: false })); scene.add(stars);
const moon = glowSprite(scene, 0xcfdcff, 14, -40, 60, -120), sunGl = glowSprite(scene, 0xffc070, 90, 10, 6, -160);
const head = new THREE.SpotLight(0xfff0d2, 0, 120, .72, .8, 1.0); head.position.set(0, 3.6, -1); CAR.add(head); const headT = new THREE.Object3D(); headT.position.set(0, 0, -24); CAR.add(headT); head.target = headT;
const sun = new THREE.DirectionalLight(0xffd0a0, 0); sun.position.set(6, 5, -14); scene.add(sun);
// ------------------------------------------------------------------ world: car interior (driver at x = -.36)
const dkM = mat(0x17191c), body = mat(0x6e1a1e), seatM = mat(0x3a332c);
box(CAR, 1.56, .3, .5, dkM, 0, .77, -.57); box(CAR, .46, .1, .22, dkM, -.36, .95, -.5); { const p = add(CAR, new THREE.PlaneGeometry(.34, .12), basic(0xffffff, { map: T.gauge }), -.36, .93, -.385); p.rotation.x = -.35; CAR.userData.gauge = p.material }
box(CAR, 1.6, .06, 1.3, body, 0, .82, -1.48); box(CAR, 1.56, .7, .1, dkM, 0, .4, -.8);
{ const w = add(CAR, new THREE.TorusGeometry(.17, .02, 8, 24), dkM, -.36, .9, -.24); w.rotation.x = -.42; const c2 = add(CAR, G.cyl, dkM, -.36, .84, -.36); c2.scale.set(.03, .3, .03); c2.rotation.x = 1.15; box(CAR, .3, .03, .03, dkM, -.36, .9, -.24, 0) }
box(CAR, .38, .2, .06, mat(0x22252a), 0, .8, -.31); const radM = basic(0xffffff, { map: radT[0] }); { const p = add(CAR, new THREE.PlaneGeometry(.34, .17), radM, 0, .82, -.235); p.rotation.x = -.5 }
for (const s of [-1, 1]) { const p = box(CAR, .07, .92, .07, dkM, s * .73, 1.3, -.5); p.rotation.x = -.72; box(CAR, .06, .58, 1.7, mat(0x2a2623), s * .8, .76, .25); box(CAR, .07, .6, .09, dkM, s * .79, 1.33, .62) }
box(CAR, 1.6, .05, 1.9, mat(0x2a2623), 0, 1.63, .55); box(CAR, 1.5, .08, .1, dkM, 0, 1.6, -.18);
box(CAR, .27, .09, .03, dkM, 0, 1.47, -.33); const mirM = basic(0xffffff, { map: T.mirN }); add(CAR, new THREE.PlaneGeometry(.25, .075), mirM, 0, 1.47, -.312); const mirGl = glowSprite(CAR, 0xffa030, .2, 0, 1.47, -.3);
box(CAR, .44, .12, .44, seatM, .36, .5, .32); box(CAR, .44, .66, .12, seatM, .36, .9, .6); box(CAR, .24, .2, .1, seatM, .36, 1.33, .6); box(CAR, 1.4, .6, .14, seatM, 0, .85, 1.45); box(CAR, 1.56, .08, 2.6, dkM, 0, .2, .4);
const backL = new THREE.PointLight(0xffa64d, 0, 4, 1.4); backL.position.set(.1, 1.1, 1.0); CAR.add(backL); const dashL = new THREE.PointLight(0x7fd8d0, 0, 1.6, 1.5); dashL.position.set(-.36, 1.0, -.2); CAR.add(dashL); const cabL = new THREE.PointLight(0x8fa8d8, 0, 3, 1.2); cabL.position.set(-.1, 1.5, .5); CAR.add(cabL);
// ------------------------------------------------------------------ world: service station (origin = where the car stops)
box(ST, 16, .04, 13, mat(0x9a9a94), -3, .0, -.5); box(ST, 9, .3, 7.5, mat(0xf2efe6), -.8, 3.6, -.5); box(ST, 9.1, .12, 7.6, mat(0xb3131d), -.8, 3.42, -.5);
for (const [x, z] of [[-3.4, -3], [-3.4, 2], [2.6, -3], [2.6, 2]]) box(ST, .25, 3.5, .25, mat(0xe9e6dc), x, 1.75, z);
box(ST, .9, .16, 3.2, mat(0x6f6f6a), -2.4, .08, -.6); for (const z of [-1.5, .4]) { box(ST, .55, 1.5, .4, mat(0xc8141f), -2.4, .9, z); box(ST, .57, .3, .42, mat(0xf2efe6), -2.4, 1.5, z); box(ST, .3, .2, .02, basic(0x9fe8c0), -2.11, 1.2, z, 0) }
box(ST, 5, 3.2, 9, mat(0xe2d9c2), -9.5, 1.6, -.5); box(ST, .1, 1.5, 4, mat(0x24323c), -6.96, 1.4, -.5); { const p = add(ST, new THREE.PlaneGeometry(4.4, 1.1), basic(0xffffff, { map: T.est }), -6.95, 2.75, -.5); p.rotation.y = PI / 2 }
// ------------------------------------------------------------------ characters
const hombre = makeChar({ skin: 0x9a7a5c, shirt: 0x2b2622, pants: 0x1b1b1d, hair: 0x15120f, style: 'hat', h: 1.02, seed: 2 });
add(hombre.up, new THREE.ConeGeometry(.4, .75, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0x3a2b20, side: THREE.DoubleSide }), 0, .32, 0, 0);
const LAN = grp(hombre.A[1]); LAN.position.set(0, -.76, 0); for (const [x, z] of [[-.04, -.04], [.04, -.04], [-.04, .04], [.04, .04]]) box(LAN, .012, .16, .012, mat(0x0c0c0c), x, 0, z, 0); box(LAN, .11, .02, .11, mat(0x0c0c0c), 0, .09, 0, 0); box(LAN, .11, .02, .11, mat(0x0c0c0c), 0, -.09, 0, 0);
const lanCore = sph(LAN, .034, basic(0xffe2a0), 0, 0, 0, 0), lanGl = glowSprite(LAN, 0xffa030, 1.3, 0, 0, 0), lanL = new THREE.PointLight(0xffa64d, 0, 9, 1.5); LAN.add(lanL);
const playero = makeChar({ skin: 0xd8a47f, shirt: 0xe23d3d, pants: 0x22252b, hair: 0x3a2414, style: 'cap', seed: 3 });
// ------------------------------------------------------------------ environment
const cN = new THREE.Color(0x0a1122), cD = new THREE.Color(0xf0b684), cT = new THREE.Color();
const wrap = (v, r) => ((v % r) + r) % r;
function env(o) {
  const s = o.s ?? 0, dawn = o.dawn ?? 0; T.road.offset.y = s / 10;
  for (const g of TREES) g.position.set(g.userData.x, 0, 14 - wrap(g.userData.base - s, 168)); for (const g of POSTS) g.position.set(g.userData.x, 0, 8 - wrap(g.userData.base - s, 160));
  SIGN.visible = o.sign !== undefined; if (SIGN.visible) SIGN.position.set(o.signX ?? 3.9, 0, -o.sign);
  ST.visible = o.st !== undefined; if (ST.visible) ST.position.z = -o.st;
  cT.copy(cN).lerp(cD, dawn); bg.copy(cT); scene.fog.color.copy(cT); scene.fog.density = lerp(.013, .006, dawn); R.toneMappingExposure = o.exp ?? lerp(1.25, 1.05, dawn);
  hemi.intensity = lerp(.55, 1.0, dawn); hemi.color.setHex(dawn > .5 ? 0xffe6c8 : 0x9fb4e0); LI(sun, dawn * 2.2); stars.material.opacity = (1 - dawn) * .9; moon.material.opacity = (1 - dawn) * .7; sunGl.material.opacity = dawn * .8;
  LI(head, (o.head ?? 1) * 150 * (1 - dawn * .85)); LI(cabL, .5 * (1 - dawn) + (o.cab ?? 0)); const d = o.dash ?? 1; LI(dashL, d * .3 * (1 - dawn)); CAR.userData.gauge.color.setScalar(.15 + d * .9);
  radM.map = radT[o.radio ? 1 : 0]; radM.color.setScalar(o.radioI ?? 1); const mg = o.mir ?? 0; mirM.color.setHex(o.mirWarm ? 0xffb060 : dawn > .5 ? 0xffe0c0 : 0xffffff); mirGl.material.opacity = Math.min(1, mg); mirGl.scale.setScalar(o.mirS ?? .2); LI(backL, o.backL ?? 0);
  const l = o.lan ?? 0; LI(lanL, l * 7); lanGl.material.opacity = l * .9; lanCore.material.color.setScalar(.15 + l);
}
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo, lanF = t => .85 + .15 * Math.sin(t * 13) * Math.sin(t * 7.3);
ARMP.wheel = t => [[.15, -.33 + Math.sin(t * 3.1) * .004, -.46, -.5, 0, .5], [-.15, -.33 + Math.sin(t * 2.7) * .004, -.46, -.5, 0, -.5]];
function track(c, tg, w) { if (w <= 0) return; const dx = tg[0] - c.p[0], dy = tg[1] - c.p[1], dz = tg[2] - c.p[2]; let yaw = Math.atan2(dx, dz); while (yaw - c.yaw > PI) yaw -= 2 * PI; while (yaw - c.yaw < -PI) yaw += 2 * PI; c.yaw = lerp(c.yaw, yaw, w); c.pitch = lerp(c.pitch, Math.atan2(dy, Math.hypot(dx, dz)), w) }
const Ed = [-.36, 1.26, .25], F = { yaw: 180, pitch: -6 }, RAD = [0, .81, -.28], MIR = [0, 1.47, -.32], PAS = [.46, 1.3, .32], Ep = [-.52, 1.26, .34], WIN = [-1.4, 1.56, .1];
const wheelW = c => 1 - cl(Math.abs(c.yaw - PI) / .45);
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const roadside = (t, d, p = {}) => pose(hombre, { t, x: 3.0, z: -d, ry: 0, look: cam.position, aR: [0, 1.25], aL: [-.25, .1], noblink: 1, ...p });
const atWindow = (t, p = {}) => pose(hombre, { t, x: -1.62, z: .1, ry: PI / 2, lean: .14, aL: [-1.35, .1], look: cam.position, noblink: 1, ...p });
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 5.2, 5.8) * .92 }, v = 24; hideAll();
  K1 = K1 || path([[0, Ed, F, 82], [Ln.h2.start, Ed, F, 78], [Ln.h2.start + 1.5, Ed, RAD, 48], [Ln.h2.end - .9, Ed, RAD, 46], [M.see1 + .2, Ed, F, 74], [M.pass1 - 1.6, Ed, F, 46], [M.pass1 - .12, Ed, F, 50], [M.pass1 + .3, Ed, F, 72],
    [Ln.h4.start + .25, Ed, MIR, 40], [Ln.h4.end + .45, Ed, MIR, 34], [M.see2 + .7, Ed, F, 72], [M.pass2 - 1.6, Ed, F, 44], [M.pass2 - .12, Ed, F, 50], [M.pass2 + .3, Ed, F, 72], [M.radio + .7, Ed, RAD, 36], [Ln.h6.end, Ed, RAD, 27],
    [M.see3 + .7, Ed, F, 72], [Ln.h7.end, Ed, F, 42], [M.sting + 1, Ed, F, 23], [C.dur, Ed, F, 20]]);
  const c = evalPath(K1, t), n = t < M.pass1 + .6 ? 1 : t < M.pass2 + .6 ? 2 : 3, tp = n == 1 ? M.pass1 : M.pass2;
  const d = n < 3 ? v * (tp - t) : t < M.sting ? 13 + (M.sting - t) * 15 : Math.max(8.5, 13 - (t - M.sting) * 2.2), vis = n < 3 ? d > -3 && d < 150 && (n == 1 ? t > M.see1 - 1 : t > M.see2 - .5) : t > M.see3 - .5 && d < 150;
  const rise = sr(t, M.sting - .25, M.sting + .25), back = n < 3 && t > tp ? Math.max(0, 1 - (t - tp) / 2.2) : 0, rOn = t > M.radio + .25 && t < Ln.r1.end + .5;
  env({ s: v * t, sign: vis ? d + 6 : undefined, signX: 5.2, radio: 0, radioI: rOn ? flk(t, 17, .45, 2.2) : 1, lan: vis ? lanF(t) : 0, mir: back * 1.6, mirS: .012 + back * .05, dash: 1 });
  if (vis) n < 3 ? roadside(t, d) : pose(hombre, { t, x: 0, z: -d, ry: 0, hp: .55 - rise * .6, aL: [-rise * 1.25, .1], glow: rise * .9, eye: 1 + rise * .2, pupil: 1 - rise * .5, noblink: 1 });
  if (n < 3) track(c, [3.0, 1.5, -d], sr(t, tp - 2.6, tp - .7) * (1 - sr(t, tp + .05, tp + .4)) * (vis ? 1 : 0)); else track(c, [0, 1.5, -d], sr(t, M.see3 + .8, M.see3 + 2.2) * (vis ? 1 : 0));
  arms(t, { wheel: wheelW(c) }); const hit = t > M.sting && t < M.sting + 1;
  setCam(c, t, cl(c.fov / 55, .2, 1) * (1.5 + (hit ? 1.2 : 0)), 0, hit && t - M.sting < .3 ? .8 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.2, .3, .25), titleY: 420, tint: 'rgba(40,60,130,.18)', black: 1 - ramp(t, 0, .35), white: hit && t - M.sting < .09 ? .4 : 0, red: rise * .25 * (1 - sr(t, M.sting + .5, M.sting + 1.5)),
    end: ENDQ(t - M.endcard, 'FRENÁS', 'ACELERÁS', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }, v = 26; hideAll(); const SG = [3.6, 1.95, -4.2];
  K2 = K2 || path([[0, Ed, F, 40], [M.thru, Ed, F, 70], [Ln.h2.start, Ed, F, 84], [M.glow, Ed, F, 78], [M.glow + .9, Ed, MIR, 40], [Ln.h3.end, Ed, MIR, 30], [M.radio + .7, Ed, RAD, 36], [Ln.h4.end, Ed, RAD, 28], [M.die + .7, Ed, F, 74], [M.stopped - .2, Ed, F, 70],
    [Ln.h5.start + 1.4, Ed, SG, 44], [Ln.h5.end + .2, Ed, SG, 36], [M.knock + .5, Ed, WIN, 66], [Ln.m1.end, Ed, WIN, 56], [M.sting + 1, Ed, WIN, 44], [C.dur, Ed, WIN, 40]]);
  const c = evalPath(K2, t), u = cl(t - M.die, 0, 2), s = t < M.die ? v * t : v * M.die + v * (u - u * u / 4), sStop = v * M.die + v, dead = t > M.die, deadK = sr(t, M.die, M.die + 1.4);
  const d0 = 13 - t * 11, atW = t > M.knock - .2, gl = t > M.glow ? 1 : 0, hit = t > M.sting && t < M.sting + 1;
  env({ s, sign: sStop + 4.2 - s < 160 ? sStop + 4.2 - s : undefined, signX: 3.6, head: dead ? (1 - deadK) * flk(t, 19, .4, .1) : 1, dash: dead ? (1 - deadK) * flk(t, 15, .4, .2) : 1, radio: t > M.radio + .2 && !dead, radioI: flk(t, 17, .2, .5),
    exp: 1.6, mir: gl * (1.0 + .3 * Math.sin(t * 11)) * (atW ? 0 : 1), mirS: .11, mirWarm: gl && !atW, backL: gl * (atW ? 0 : 1) * lanF(t) * 2.6, lan: t < M.thru + .2 || atW ? lanF(t) : 0 });
  if (t < M.thru + .2) pose(hombre, { t, x: 0, z: -Math.max(.9, d0), ry: 0, aL: [-1.25, .1], glow: .9, eye: 1.2, pupil: .5, noblink: 1 });
  else if (atW) atWindow(t, { talk: talk('m1', t), glow: sr(t, M.sting - .1, M.sting + .3) * .8, smile: sr(t, Ln.m1.end - .5, M.sting + .2) * .6, eye: 1.1, pupil: .6 });
  arms(t, { wheel: wheelW(c) });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (dead ? .7 : 1.5) + (hit ? 1 : 0), 0, (t < M.thru ? .6 : 0) + (hit && t - M.sting < .3 ? .8 : 0) + (t > M.knock && t < M.knock + 1.2 && (t - M.knock) % .42 < .1 ? .25 : 0));
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.2, .3, .25), titleY: 420, tint: 'rgba(40,60,130,.18)', black: Math.max(sr(t, M.thru + .12, M.thru + .3) * (1 - sr(t, Ln.h2.start - .2, Ln.h2.start + .9)), ramp(-t, -.3, 0) * 0),
    white: Math.max(win(t, M.thru - .25, M.thru + .35, .2, .25) * .95, hit && t - M.sting < .09 ? .4 : 0), red: 0,
    end: ENDQ(t - M.endcard, 'LE ABRÍS', 'NO TE MOVÉS', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }, v = 26; hideAll(); const PL = [-1.45, 1.5, .2], tA = M.start + .9, tD = M.station - 2.0;
  K3 = K3 || path([[0, Ed, WIN, 52], [M.dooropen - .1, Ed, WIN, 46], [M.sit + .15, Ep, PAS, 88], [Ln.m1.end, Ep, PAS, 82], [Ln.y1.start + .3, Ed, F, 76], [Ln.y1.end, Ed, F, 74], [Ln.m2.start + .3, Ep, PAS, 82], [Ln.m2.end + .2, Ep, PAS, 74],
    [M.start + .8, Ed, F, 78], [Ln.m3.start + .4, Ep, PAS, 84], [Ln.m3.end, Ep, PAS, 80], [M.drive + .8, Ed, F, 80], [Ln.h2.end - 2.6, Ed, F, 76], [Ln.h2.end - 1.5, Ep, PAS, 82], [Ln.h2.end + .3, Ep, PAS, 78], [M.station - .3, Ed, F, 76],
    [M.station + 1.0, Ed, PL, 60], [Ln.p1.end, Ed, PL, 54], [Ln.p2.end, Ed, PL, 50], [M.reveal + .22, Ep, PAS, 88], [M.reveal + 1.6, Ep, PAS, 70], [C.dur, Ep, PAS, 66]]);
  const c = evalPath(K3, t), seated = t >= M.dooropen + .25 && t < Ln.h2.end - 3.2, rev = t >= M.reveal;
  const s = t < tA ? 0 : t < tA + 2 ? 6.5 * (t - tA) ** 2 : t < tD ? 26 + v * (t - tA - 2) : (26 + v * (tD - tA - 2)) + v * cl(t - tD, 0, 3) - v * cl(t - tD, 0, 3) ** 2 / 6, sSt = 26 + v * (tD - tA - 2) + 39;
  const dawn = sr(t, Ln.h2.start + 1.6, Ln.h2.end - 2.2), on = sr(t, M.start, M.start + .5);
  env({ s, dawn, st: sSt - s < 170 && dawn > .5 ? sSt - s : undefined, head: on * (t < M.start + .5 ? flk(t, 18, .4, .2) : 1), dash: on, radio: 0, exp: lerp(1.75, 1.15, dawn), cab: seated ? .35 : 0, lan: t < M.dooropen || seated || rev ? lanF(t) * (rev ? 1.3 : 1) : 0 });
  if (t < M.dooropen) atWindow(t, { glow: .8, smile: .6, eye: 1.1, pupil: .6 });
  else if (seated || rev) { const tn = Math.max(win(t, Ln.m2.start - .3, Ln.m2.end + .5, .5, .5), rev ? 1 : 0), pt = win(t, Ln.m3.start, Ln.m3.end + .3, .3, .4);
    pose(hombre, { t, x: .46, z: .36, y: -.2, sit: 1, ry: PI, hyAbs: tn * 1.2, talk: talk('m1', t) + talk('m2', t) + talk('m3', t), smile: Math.max(win(t, Ln.m2.start, Ln.m2.end + .6, .4, .5) * .5, rev ? .9 : 0), glow: rev ? .8 : .45, eye: rev ? 1.12 : 1, pupil: rev ? .5 : .8, noblink: 1, aL: [-.75, -.25], aR: [-pt * 1.5, 0] }) }
  if (t > M.station - 1) pose(playero, { t, x: -1.5, z: .15 - (sSt - s), ry: PI / 2, look: t > Ln.p2.start - .3 ? V(.36, 1.2, .3) : cam.position, talk: talk('p1', t) + talk('p2', t), brow: sr(t, Ln.p2.start - .4, Ln.p2.start), aR: [-sr(t, Ln.p2.start + .5, Ln.p2.start + 1.0) * 1.3, 0], smile: win(t, M.station + .8, Ln.p1.start + .8, .4, .5) * .4 });
  arms(t, { wheel: wheelW(c) }); const hit = rev && t < M.reveal + 1;
  setCam(c, t, cl(c.fov / 55, .2, 1) * (s > 0 && t < tD + 3 ? 1.5 : .7) + (hit ? 1.3 : 0), 0, (hit && t - M.reveal < .3 ? 1 : 0) + (t > M.dooropen && t < M.sit + .2 ? .2 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 330, tint: rev ? 'rgba(90,20,20,.25)' : dawn > .5 ? 'rgba(255,200,130,.16)' : 'rgba(40,60,130,.18)', grain: rev ? .17 : .1, black: Math.max(1 - ramp(t, 0, .35), win(t, M.dooropen + .05, M.dooropen + .5, .12, .25) * .85),
    white: hit && t - M.reveal < .1 ? .5 : 0, red: rev ? .2 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS<br>HUBIERAS<br>FRENADO?', qs: 132, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

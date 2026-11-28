// PROBADOR 3 — tienda de ropa en un shopping al cierre, POV de Vale. P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
import { Reflector } from './node_modules/three/examples/jsm/objects/Reflector.js';
init({ tag: 'PROBADOR 3', title: 'PROBADOR 3', titleSize: 150, sleeve: 0x1a1a1e, skin: 0xe0b090,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], cosa: ['#ff4558', 'PROBADOR 3', 1], ram: ['#7dc4ff', 'RAMIRO · HANDY', 1], ramv: ['#7dc4ff', 'RAMIRO', 0], enc: ['#ffb36b', 'LA ENCARGADA', 0] } });
// ------------------------------------------------------------------ textures
T.floor = tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(30,${18 + Math.random() * 8}%,${44 + Math.random() * 10}%)`; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, i * 32 + 30, w, 2); g.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32) } speck(g, w, h, 900, .12) }, 4, 6);
T.wall = tex(256, 256, (g, w, h) => { g.fillStyle = '#d9d2c8'; g.fillRect(0, 0, w, h); blot(g, w, h, 18, .06, '120,100,80', 90) }, 3, 1);
T.curtain = tex(256, 256, (g, w, h) => { for (let x = 0; x < w; x++) { const k = .55 + .45 * Math.sin(x / w * PI * 14) ** 2; g.fillStyle = `rgb(${Math.floor(120 * k)},${Math.floor(18 * k)},${Math.floor(30 * k)})`; g.fillRect(x, 0, 1, h) } speck(g, w, h, 500, .1) });
T.mall = tex(256, 256, (g, w, h) => { g.fillStyle = '#cfcac2'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke() } speck(g, w, h, 600, .08) }, 10, 6);
T.shutter = tex(256, 256, (g, w, h) => { for (let y = 0; y < h; y += 16) { const gr = g.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, '#9aa0a6'); gr.addColorStop(.5, '#c8ccd0'); gr.addColorStop(1, '#5a5f66'); g.fillStyle = gr; g.fillRect(0, y, w, 16) } for (let x = 8; x < w; x += 16) for (let y = 6; y < h; y += 16) { g.fillStyle = 'rgba(20,20,20,.6)'; g.fillRect(x, y, 6, 3) } speck(g, w, h, 400, .15) }, 4, 2);
const numT = n => tex(128, 128, (g, w, h) => { g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f2e6c8'; g.font = '900 92px Inter'; g.textAlign = 'center'; g.fillText(n, 64, 98) });
T.sign = tex(1024, 192, (g, w, h) => { g.fillStyle = '#111'; g.fillRect(0, 0, w, h); g.fillStyle = '#f5f0e6'; g.font = '900 120px Inter'; g.textAlign = 'center'; g.fillText('M O D A', w / 2, 140) });
T.tag = tex(256, 160, (g, w, h) => { g.fillStyle = '#f4ecd8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a1018'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#7a1018'; g.font = '900 40px Inter'; g.textAlign = 'center'; g.fillText('RESERVADO', w / 2, 66); g.font = 'italic 900 58px Inter'; g.fillText('Vale', w / 2, 130) });
T.dress = tex(128, 256, (g, w, h) => { g.fillStyle = '#7a8a6a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${200 + Math.random() * 50},${150 + Math.random() * 60},120,.35)`; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 6, 0, 7); g.fill() } blot(g, w, h, 12, .25, '60,50,30', 40) });
// ------------------------------------------------------------------ world: store x -4..4, z -7.6..2.2 (shutter), mall corridor z > 2.2
const W = grp(scene);
const fl = add(W, new THREE.PlaneGeometry(8, 10), new THREE.MeshLambertMaterial({ map: T.floor }), 0, 0, -2.7, 2); fl.rotation.x = -PI / 2;
const wallM = new THREE.MeshLambertMaterial({ map: T.wall });
box(W, 8, 3.2, .1, wallM, 0, 1.6, -7.65, 2); box(W, .1, 3.2, 10, wallM, -4.05, 1.6, -2.7, 2); box(W, .1, 3.2, 10, wallM, 4.05, 1.6, -2.7, 2); box(W, 8.2, .1, 10, mat(0xece6dc), 0, 3.22, -2.7, 0);
box(W, 8.4, 3.4, .5, mat(0x1c1c1e), 0, 4.9, 2.2, 0); add(W, new THREE.PlaneGeometry(3.4, .64), basic(0xffffff, { map: T.sign }), 0, 3.6, 2.47, 0);
for (const s of [-1, 1]) box(W, .3, 3.3, .5, mat(0x1c1c1e), s * 4.15, 1.6, 2.2, 0);
// fitting rooms (1,2,3) on the back wall
const STALL = [-1.4, 0, 1.4], CZ = -6.3; const curC = [], curO = [], stL = [];
for (const x of [-2.1, -.7, .7, 2.1]) box(W, .06, 2.4, 1.32, mat(0xe8e2d6), x, 1.2, -6.96, 3);
box(W, 4.3, .5, .06, mat(0xe8e2d6), 0, 2.65, CZ, 0); box(W, 4.2, .03, .03, mat(0x888888), 0, 2.33, CZ + .02, 0);
const curM = new THREE.MeshLambertMaterial({ map: T.curtain, side: THREE.DoubleSide });
STALL.forEach((x, i) => {
  const cc = add(W, new THREE.PlaneGeometry(1.34, 2.04), curM, x, 1.31, CZ + .01, 1); curC.push(cc);
  const co = add(W, new THREE.PlaneGeometry(.3, 2.04), curM, x + .52, 1.31, CZ + .01, 1); curO.push(co);
  add(W, new THREE.PlaneGeometry(.3, .3), basic(0xffffff, { map: numT(String(i + 1)) }), x, 2.65, CZ + .04, 0);
  box(W, .9, .05, .35, mat(0x6a5040), x, .45, -7.4, 3); add(W, new THREE.PlaneGeometry(.5, 1.6), new THREE.MeshPhongMaterial({ color: 0x8a9aa8, shininess: 90 }), x, 1.3, -7.58, 0);
  const l = new THREE.PointLight(0xf0f4ff, 0, 4, 1.4); l.position.set(x, 2.2, -6.9); W.add(l); stL.push(l) });
// shoes under curtain 3
const SHOES = grp(W); SHOES.position.set(1.4, 0, -6.5);
for (const s of [-1, 1]) { const sh = grp(SHOES); sh.position.set(s * .1, 0, 0); box(sh, .09, .06, .22, mat(0x4a1a1e), 0, .05, .02, 1); box(sh, .03, .09, .03, mat(0x2a0c0e), 0, .045, -.08, 0); const a = add(sh, G.cyl, mat(0xd8c8b8), 0, .2, -.03, 0); a.scale.set(.035, .22, .035) }
// pale hand gripping the curtain edge (P1 sting)
const HAND = grp(W); { const hm = mat(0xcfc8bc); for (let i = 0; i < 4; i++) { const f = caps(HAND, .0085, .075 - Math.abs(i - 1.5) * .008, hm, .03, .036 - i * .021, .012, 0); f.rotation.z = PI / 2 + (i - 1.5) * .06; const n = sph(HAND, .006, mat(0x9a9088), .066 - Math.abs(i - 1.5) * .008, .036 - i * .021, .018, 0); n.scale.set(.006, .006, .003) } }
HAND.position.set(1.4 - .68, 1.45, CZ + .03);
// big mirror on the left wall
const MIR = new Reflector(new THREE.PlaneGeometry(3.2, 2.3), { textureWidth: 640, textureHeight: 460, color: 0xb8bcc0, clipBias: .003 });
MIR.position.set(-3.98, 1.4, -3.4); MIR.rotation.y = PI / 2; W.add(MIR);
for (const [y, h] of [[2.58, .06], [.22, .06]]) box(W, .06, h, 3.32, mat(0xb08a40), -3.97, y, -3.4, 0); for (const z of [-5.03, -1.77]) box(W, .06, 2.42, .06, mat(0xb08a40), -3.97, 1.4, z, 0);
// racks with clothes, table, counter
const PAL = [0x2a3a5a, 0x8a2a2a, 0xd8d0c0, 0x3a5a3a, 0x1a1a1a, 0xb87a3a, 0x6a4a7a, 0xa8b8c8];
function rack(x, z, ry) { const g = grp(W); g.position.set(x, 0, z); g.rotation.y = ry; box(g, 1.8, .03, .03, mat(0x999999), 0, 1.5, 0, 0); for (const s of [-1, 1]) box(g, .03, 1.5, .03, mat(0x999999), s * .9, .75, 0, 0); for (let i = 0; i < 12; i++) box(g, .04, .75 + hash(i + x) * .2, .46, mat(PAL[Math.floor(hash(i * 3 + z) * 8)]), -.8 + i * .145, 1.08, 0, 1); return g }
rack(2.4, -.4, 0); rack(3.2, -2.8, PI / 2); rack(-2.8, -1.0, 0);
box(W, 1.4, .8, .8, mat(0x5a4030), .2, .4, -.6, 3); for (let i = 0; i < 6; i++) box(W, .32, .05 + hash(i) * .12, .26, mat(PAL[i]), -.25 + (i % 3) * .36, .84 + hash(i) * .05, -.8 + Math.floor(i / 3) * .4, 1);
box(W, 1.4, 1.0, .6, mat(0x2a2a2e), 3.0, .5, .6, 3); box(W, .4, .25, .3, mat(0x101012), 3.0, 1.12, .6, 0);
add(W, new THREE.PlaneGeometry(.5, .2), basic(0x30ff80), -3.0, 2.85, -7.58, 0); glowSprite(W, 0x30ff80, 1.2, -3.0, 2.85, -7.5);
const CEIL = [[-1.6, -1.5], [1.6, -1.5], [0, -4.6], [-2, -5.2], [2, -5.2]].map(([x, z]) => { const l = new THREE.PointLight(0xffe2b8, 0, 9, 1.3); l.position.set(x, 3.0, z); W.add(l); const b = add(W, new THREE.CircleGeometry(.12, 16), basic(0xfff2d8), x, 3.16, z, 0); b.rotation.x = PI / 2; return { l, b } });
// shutter (persiana): bottom edge at y = gap
const SHUT = add(W, new THREE.PlaneGeometry(8, 3.2), new THREE.MeshLambertMaterial({ map: T.shutter, side: THREE.DoubleSide }), 0, 1.6, 2.2, 2);
// mall corridor
const mf = add(W, new THREE.PlaneGeometry(40, 9), new THREE.MeshPhongMaterial({ map: T.mall, shininess: 60, specular: 0x333333 }), 0, 0, 6.8, 2); mf.rotation.x = -PI / 2;
box(W, 40, 3.4, .1, mat(0x3a3a40), 0, 1.7, 11.2, 2); for (let i = -3; i <= 3; i++) { const sh = add(W, new THREE.PlaneGeometry(4, 2.6), basic(0x0c1018), i * 5.2, 1.4, 11.1, 0); sh.rotation.y = PI } box(W, 40, .1, 9, mat(0x1a1a1e), 0, 4.2, 6.8, 0);
for (const s of [-1, 1]) box(W, 12, 3.4, .5, mat(0x2a2a30), s * 10.3, 1.7, 2.2, 0);
const mallL = [-6, 0, 6].map(x => { const l = new THREE.PointLight(0x8ab0ff, 0, 10, 1.4); l.position.set(x, 3.8, 6.5); W.add(l); return l });
box(W, 1.6, .45, .5, mat(0x5a5a60), -3, .22, 8.5, 3);
// ------------------------------------------------------------------ characters
const LOOK = { skin: 0xe0b090, shirt: 0x18181c, pants: 0x2a3550, hair: 0x2a1a12, style: 'long', h: .95 };
const dbl = makeChar({ ...LOOK, seed: 51 }), me = makeChar({ ...LOOK, seed: 52 });
const ram = makeChar({ skin: 0xc8946e, shirt: 0x1e2a44, pants: 0x1a1a22, hair: 0x15151a, style: 'cap', h: 1.03, seed: 53 });
const enc = makeChar({ skin: 0xd8a888, shirt: 0x7a3a4a, pants: 0x2a2a2a, skirt: 0x2a2a2a, hair: 0x6a5a50, style: 'bun', h: .93, seed: 54 });
const BAG = box(W, .45, .55, .22, mat(0x8a7050), 0, 0, 0, 1); const DRESS = add(W, new THREE.PlaneGeometry(.5, 1.1), new THREE.MeshLambertMaterial({ map: T.dress, side: THREE.DoubleSide }), 1.4, 1.45, -7.3, 1);
const TAG = add(W, new THREE.PlaneGeometry(.34, .21), new THREE.MeshLambertMaterial({ map: T.tag, side: THREE.DoubleSide }), 1.4, 1.62, CZ + .03, 0); const tagS = box(W, .005, .3, .005, mat(0x222222), 1.4, 1.87, CZ + .03, 0);
const shoeL = new THREE.PointLight(0xc8d8ff, 0, 3, 1.5); shoeL.position.set(.2, .6, 1.3); scene.add(shoeL);
const ramL = new THREE.SpotLight(0xfff4e0, 0, 14, .38, .5, 1.2); scene.add(ramL, ramL.target);
// handy (walkie-talkie) in the right hand
function armR_hand() { return rig.children.find(o => o.isGroup && o.children.length > 3 && o !== phone) }
const HANDY = grp(armR_hand());
box(HANDY, .06, .13, .035, mat(0x15161a), 0, .06, .01, 0); const ant = add(HANDY, G.cyl, mat(0x15161a), .018, .17, .01, 0); ant.scale.set(.007, .09, .007); const hLed = sph(HANDY, .006, basic(0x40ff60), -.015, .118, .03, 0);
add(HANDY, new THREE.PlaneGeometry(.04, .025), basic(0x70c070), 0, .085, .029, 0); HANDY.rotation.set(-1.2, 0, 0);
ARMP.radio = t => [[.12, -.2, -.33, 1.2, -.3, .2], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.lift = t => [[.25, -.25, -.45, -.3, 0, .3], [-.25, -.25, -.45, -.3, 0, -.3]];
// ------------------------------------------------------------------ mirror pass: what only the mirror shows
let MSTATE = null;
const _mob = MIR.onBeforeRender; MIR.onBeforeRender = function (...a) { const s = MSTATE; if (s) { for (const o of s.show) o.visible = true; for (const o of s.hide) o.visible = false } _mob.apply(this, a); if (s) { for (const o of s.show) o.visible = false; for (const o of s.hide) o.visible = true } };
// ------------------------------------------------------------------ environment
const cN = new THREE.Color(0x0c0d12), cDay = new THREE.Color(0x30302e);
function env(o) {
  const t = o.t, day = o.day ?? 0; bg.copy(cN).lerp(cDay, day); scene.fog.color.copy(bg); scene.fog.density = .015;
  CEIL.forEach((c, i) => { const v = (o.ceil ?? .35) * (o.flick && hash(Math.floor(t * 14) + i) < .35 ? .15 : 1); LI(c.l, v * 7); c.b.material.color.setScalar(cl(.15 + v, 0, 1)) });
  stL.forEach((l, i) => LI(l, (o.stall ?? [0, 0, 1])[i] * 3.5 * (o.flick && i == 2 && hash(Math.floor(t * 20)) < .3 ? .2 : 1)));
  mallL.forEach(l => LI(l, (o.mall ?? 0) * 6)); hemi.intensity = o.hemi ?? (.35 + day * .8); hemi.color.setHex(day ? 0xfff4e8 : 0xa8b4d0);
  R.toneMappingExposure = o.exp ?? 1.3; LI(flash, o.flash ?? 0);
  SHUT.position.y = 1.6 + (o.gap ?? 0); const op = o.open ?? [0, 0, 0]; curC.forEach((c, i) => { c.visible = !op[i]; curO[i].visible = !!op[i]; c.rotation.y = Math.sin(t * 1.3 + i) * .01 * (o.sway ?? 0); c.position.z = CZ + .01 + Math.sin(t * 2.1) * .015 * (o.sway ?? 0) });
  SHOES.visible = (o.shoes ?? 0) > 0; SHOES.position.set(...(o.shoesP || [1.4, 0, -6.5])); SHOES.rotation.y = o.shoesR ?? 0;
  HAND.visible = !!o.hand; DRESS.visible = !!o.dress; TAG.visible = tagS.visible = !!o.tag; TAG.rotation.z = Math.sin(t * 1.7) * .04; BAG.visible = !!o.bag;
  LI(ramL, o.ramL ? 9 : 0); HANDY.visible = !!o.handy; hLed.material.color.setHex(o.handyTx ? 0xff3030 : 0x40ff60);
  LI(shoeL, o.shoeL ?? 0); MSTATE = o.mirror || null;
}
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const E = 1.55, C3 = [1.4, 1.05, CZ], MIRC = [-3.98, 1.45, -3.2];
function meAt(c, t, p = {}) { pose(me, { t, x: c.p[0], z: c.p[2], ry: c.yaw, ...p }); me.g.visible = false }
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.2, 3.8) * .92 }; hideAll(); const fb = t >= M.fb && t < M.shoes, scare = t > M.sting && t < M.sting + 1.1;
  K1 = K1 || path([[0, [1.2, E, -1.2], C3, 50], [M.fb - .01, [1.35, E, -3.4], C3, 44],
    [M.fb, [0, E, -.2], [0, 1.1, 2.2], 60], [M.fb + 3.5, [0, E, .2], [0, .8, 2.2], 56], [M.fb + 6.5, [-.5, E, -.4], [-2.2, 1.2, -2.6], 58], [M.shoes - .01, [.2, E, -1.6], [1.6, 1.2, -4.8], 56],
    [M.shoes, [1.4, 1.2, -3.8], [1.4, .1, -6.5], 46], [Ln.h3.end - .5, [1.4, 1.0, -5.0], [1.4, .1, -6.5], 40], [Ln.y1.start + .3, [1.35, E, -4.4], C3, 52], [Ln.c1.end, [1.35, E, -4.7], [1.4, 1.2, CZ], 48],
    [M.close, [1.35, E, -4.8], [1.4, 1.3, CZ], 44], [M.sting, [1.3, E, -5.0], [1.2, 1.35, CZ], 40], [M.sting + .2, [1.25, E, -5.2], [.8, 1.4, CZ], 32], [C.dur, [1.25, E, -5.2], [.8, 1.4, CZ], 30]]);
  const c = evalPath(K1, t), down = sr(t, M.fb + .2, M.fb + 3.4);
  env({ t, ceil: fb ? .55 : .3, gap: fb ? lerp(2.6, 0, down) : 0, stall: [0, 0, 1], shoes: t >= M.shoes ? 1 : 0, sway: t > Ln.c1.start ? 1 : 0, hand: t > M.sting, flick: scare || (t > M.close && hash(Math.floor(t * 6)) < .15), exp: fb ? 1.2 : 1.35, mall: fb ? 1 : 0 });
  arms(t, { lift: fb && t < M.fb + 3.5 ? 1 : 0 });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.4, .3, .25), titleY: 380, tint: fb ? 'rgba(255,200,140,.08)' : 'rgba(120,60,90,.1)', black: Math.max(1 - ramp(t, 0, .35), win(t, M.fb - .3, M.fb + .25, .25, .25), win(t, M.shoes - .3, M.shoes + .3, .25, .3)),
    white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .25,
    end: ENDQ(t - M.endcard, 'ABRÍS LA CORTINA', 'LLAMÁS A SEGURIDAD', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, mir = t > M.mirror - .8;
  const ME = [-1.2, E, -2.0], MV = [-3.98, 1.3, -3.7];
  K2 = K2 || path([[0, [1.3, E, -4.4], C3, 48], [Ln.r2.end, [.9, E, -4.0], C3, 52], [M.mirror, ME, [-.4, 1.4, -5.6], 58], [M.mirror + 1.4, ME, MV, 56], [Ln.h2.end, [-1.3, E, -2.0], [-3.98, 1.3, -3.75], 44],
    [Ln.d1.end, [-1.4, E, -2.0], [-3.98, 1.3, -3.75], 38], [Ln.r3.end, [-1.3, E, -1.95], [-3.98, 1.45, -2.3], 48], [M.sting, [-1.3, E, -1.95], [-3.98, 1.45, -2.3], 46], [M.sting + .25, [-1.25, E, -1.95], [-3.98, 1.5, -2.25], 34], [C.dur, [-1.25, E, -1.95], [-3.98, 1.5, -2.25], 32]]);
  const c = evalPath(K2, t);
  // double: inside stall 3 (mirror only), steps out while Ramiro talks, ends right behind me
  const wk = sr(t, Ln.r3.start, M.sting + .1), dx = lerp(1.25, -.6, wk), dz = lerp(-6.42, -1.75, wk);
  pose(dbl, { t, x: dx, z: dz, ry: Math.atan2(c.p[0] - dx, c.p[2] - dz), look: V(c.p[0], 1.5, c.p[2]), talk: talk('d1', t), smile: t > Ln.d1.end ? .25 : 0, noblink: 1, aR: [-.2 - sr(t, Ln.d1.start, Ln.d1.start + .6) * .9, .1], run: wk > 0 && wk < 1 ? .25 : 0 }); dbl.g.visible = false;
  meAt(c, t, { aR: [-1.9, .5], hy: 0 });
  env({ t, ceil: .3, stall: [0, 0, 1], shoes: !mir || t < M.mirror + .3 ? 1 : 0, sway: t < M.mirror ? .6 : 0, handy: 1, handyTx: (t > Ln.y1.start && t < Ln.y1.end), flick: scare, exp: 1.4,
    mirror: { show: [me.g, dbl.g, curO[2]], hide: [curC[2], SHOES] } });
  arms(t, { radio: 1 });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  const rl = ['r1', 'r2', 'r3'].find(id => t > Ln[id].start - .3 && t < Ln[id].end + .5);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(120,60,90,.1)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .09 ? .3 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .25,
    alert: rl ? { k: Math.min(ramp(t, Ln[rl].start - .3, Ln[rl].start), 1 - ramp(t, Ln[rl].end + .2, Ln[rl].end + .5)), kk: 'HANDY · CANAL 2', m: 'SEGURIDAD', s: rl == 'r3' ? 'Cámara 4 · 2 personas' : 'Cámara 4 · local 12', col: ['#2a5a9a', '#14305a'] } : null,
    end: ENDQ(t - M.endcard, 'LEVANTÁS LA MANO', 'CORRÉS A LA PERSIANA', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const day = t >= M.day && t < M.night, night = t >= M.night, scare = t > M.sting && t < M.sting + 1.1;
  K3 = K3 || path([[0, [-.8, E, -3.2], [0, .9, 2.2], 64], [1.6, [-.2, E, -.4], [0, .7, 2.2], 64], [3.0, [0, 1.0, 1.6], [0, .5, 3.4], 66], [4.4, [0, .45, 3.6], [0, .5, 8], 64], [M.down - .3, [0, .4, 4.4], [0, .5, 8], 60],
    [M.down + .6, [.2, .35, 4.6], [0, -.05, 1.6], 56], [Ln.d1.end, [.1, .3, 4.0], [0, -.25, 1.0], 44], [Ln.r1.start, [.2, .5, 4.2], [0, .6, 1.6], 52], [Ln.r1.end, [.3, 1.0, 4.4], [2.4, 1.5, 7.5], 54],
    [Ln.h3.start + 2, [.3, .7, 2.8], [1.0, .6, -3], 52], [M.day - .01, [.5, .8, 2.3], [1.4, .8, -6.5], 44],
    [M.day, [.2, E, -3.2], [1.4, 1.1, -6.4], 50], [Ln.h4.end, [.1, E, -3.4], [1.2, 1.2, -6.4], 50], [M.night - .01, [.15, E, -3.6], [1.0, 1.3, -6.2], 48],
    [M.night, [1.2, E, -2.4], C3, 50], [Ln.h5.end - 1, [1.35, E, -4.6], [1.4, 1.55, CZ], 40], [M.sting - .2, [1.35, E, -4.8], [1.4, 1.2, CZ], 40], [M.sting + .3, [1.35, 1.2, -4.9], [1.4, .25, CZ], 34], [C.dur, [1.35, 1.2, -4.9], [1.4, .25, CZ], 32]]);
  const c = evalPath(K3, t);
  if (!day && !night) {
    const g = t < M.down ? 1.0 : lerp(1.0, 0, sr(t, M.down, Ln.d1.end)), g2 = t > Ln.h3.start ? lerp(0, .9, sr(t, Ln.h3.start, Ln.h3.start + 1.5)) : 0;
    walk(ram, t, [[Ln.r1.start - 1.2, -6, 7.5], [Ln.r1.start + .6, .9, 5.2], [Ln.h3.start, 1.0, 3.6], [Ln.h3.start + 1.5, 1.0, 3.0]], { ryEnd: PI, still: { aR: [-1.3, .1], look: t < Ln.h3.start ? cam.position : V(1.0, .8, -2), talk: talk('r1', t), brow: .5 } });
    ramL.position.set(ram.g.position.x + .25, 1.25, ram.g.position.z - .2); ramL.target.position.set(lerp(-2, 1.4, sr(t, Ln.h3.start + 1, Ln.h3.end)), .6, lerp(9, -6.5, sr(t, Ln.r1.start, Ln.h3.start + 1.5)));
    env({ t, ceil: .08, stall: [0, 0, .5], gap: Math.max(g, g2), mall: 1, ramL: t > Ln.r1.start - 1.2, shoes: t > Ln.d1.start - .5 && t < Ln.d1.end + .2 ? 1 : 0, shoesP: [.2, 0, 2.02], shoesR: PI, shoeL: t > Ln.d1.start - .5 && t < Ln.d1.end + .2 ? 2.5 : 0, open: t > Ln.h3.start ? [0, 0, 1] : [0, 0, 0], exp: 1.5, hemi: .3 });
  } else if (day) {
    env({ t, day: 1, ceil: 1, stall: [1, 1, 1], open: [0, 0, 1], dress: 1, bag: 1, exp: 1.05 });
    pose(enc, { t, x: 1.0, z: -5.6, ry: .5, look: t > Ln.e1.start - .4 ? cam.position : V(1.4, 1.0, -7), talk: talk('e1', t), brow: .35, aL: [-.8, .2], aR: [-.2, .1] });
    BAG.position.set(enc.g.position.x - .28, .55, enc.g.position.z + .12);
  } else {
    env({ t, ceil: .3, stall: [0, 0, 1], tag: 1, shoes: t > M.sting - .1 ? 1 : 0, flick: scare, exp: 1.35, sway: t > M.sting ? 1 : 0 });
  }
  arms(t, { run: t < 3.0 ? 1 : 0 });
  setCam(c, t, t < 4.4 ? 1.6 : cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.3 : 0)), t < 3 ? .8 : 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: day ? 'rgba(255,210,160,.06)' : 'rgba(120,60,90,.1)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .3), win(t, M.day - .3, M.day + .3, .25, .3), win(t, M.night - .3, M.night + .3, .25, .3)), white: scare && t - M.sting < .09 ? .3 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS HUBIERAS<br>LEVANTADO<br>LA MANO?', qs: 118, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

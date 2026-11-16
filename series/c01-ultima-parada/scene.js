// ÚLTIMA PARADA — colectivo nocturno. Las tres partes (P1/P2/P3) son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phoneScr, phoneL, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, run } from './core.js';
init({ tag: 'ÚLTIMA PARADA', title: 'ÚLTIMA<br>PARADA', titleSize: 196, sleeve: 0x2c4a7c, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], mujer: ['#d0a6ff', 'LA MUJER', 0], pa: ['#ffb84d', 'ALTAVOZ', 1], chofer: ['#ff4558', 'EL CHOFER', 1], cosa: ['#ff4558', '¿¿??', 1] } });
// ------------------------------------------------------------------ textures
T.floor = tex(256, 256, (g, w, h) => { g.fillStyle = '#34383e'; g.fillRect(0, 0, w, h); speck(g, w, h, 1500, .25); speck(g, w, h, 600, .12, '255,255,255') }, 2, 8);
T.seat = tex(128, 128, (g, w, h) => { g.fillStyle = '#2f5a8c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 26; i++) { g.fillStyle = ['#f08a2c', '#ffd23c', '#1d3c63', '#58a6d8'][i % 4]; g.fillRect(Math.random() * w, Math.random() * h, 6 + Math.random() * 16, 4) } });
const led = s => tex(1024, 180, (g, w, h) => { g.fillStyle = '#070707'; g.fillRect(0, 0, w, h); let fs = 112; do { fs -= 4; g.font = `900 ${fs}px Inter, sans-serif` } while (g.measureText(s).width > w - 70); g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = '#ff9a1a'; g.shadowBlur = 26; g.fillStyle = '#ffb02e'; g.fillText(s, w / 2, h / 2 + 6); g.shadowBlur = 0; g.fillStyle = 'rgba(0,0,0,.42)'; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h); for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3) });
const LED = { a: led('149 · CENTRO'), g1: led('1#9 · C?NT%O'), g2: led('¿¿? · ¿¿¿¿¿¿'), olv: led('PRÓX: LOS OLVIDADOS'), mar: led('PRÓX: MARTÍN') };
const eyesTex = st => tex(512, 160, (g, w, h) => { g.fillStyle = '#0b0f12'; g.fillRect(0, 0, w, h); g.fillStyle = st ? '#9a7458' : '#6e5341'; g.fillRect(80, 0, 352, h); g.fillStyle = '#14161b'; g.fillRect(60, 0, 392, 40);
  const gr = g.createLinearGradient(0, 40, 0, 96); gr.addColorStop(0, 'rgba(0,0,0,.65)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(80, 40, 352, 56);
  for (const s of [-1, 1]) { const cx = 256 + s * 80, cy = 100; g.fillStyle = st ? '#ffffff' : '#cfc9bb'; g.beginPath(); g.ellipse(cx, cy, st ? 46 : 40, st ? 33 : 8, 0, 0, 7); g.fill(); g.fillStyle = '#0a0a0a'; g.beginPath(); g.arc(cx, cy + (st ? 0 : 3), st ? 7 : 7, 0, 7); g.fill(); g.strokeStyle = '#1a1410'; g.lineWidth = 10; g.beginPath(); g.moveTo(cx - 50, cy - (st ? 52 : 24)); g.lineTo(cx + 50, cy - (st ? 52 : 24)); g.stroke() }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(246, 70, 20, 90) });
const EY = [eyesTex(0), eyesTex(1)];
T.ticket = tex(288, 512, (g, w, h) => { g.fillStyle = '#e9dfc3'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, .14, '90,60,20'); g.fillStyle = '#7a1f1f'; g.fillRect(0, 0, w, 64); g.fillStyle = '#f3ead2'; g.textAlign = 'center'; g.font = '900 38px Inter, sans-serif'; g.fillText('BOLETO · 149', w / 2, 46); g.fillStyle = '#2a2018'; g.font = '700 22px Inter, sans-serif'; g.fillText('FECHA DE VIAJE', w / 2, 104); g.fillStyle = '#b3131d'; g.font = '900 56px Inter, sans-serif'; g.fillText('14 MAR', w / 2, 162); g.font = '900 104px Inter, sans-serif'; g.fillText('1998', w / 2, 256); g.fillStyle = '#2a2018'; g.font = '700 24px Inter, sans-serif'; g.fillText('03:15 HS', w / 2, 300); g.strokeStyle = '#2a2018'; g.setLineDash([8, 8]); g.lineWidth = 3; g.strokeRect(10, 74, w - 20, h - 84); g.font = '800 23px Inter, sans-serif'; g.fillText('DESTINO:', w / 2, 420); g.fillText('LOS OLVIDADOS', w / 2, 452) });
T.map = tex(360, 760, (g, w, h) => { g.fillStyle = '#10151c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#27313f'; g.lineWidth = 14; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(0, 60 + i * 110); g.lineTo(w, 20 + i * 120); g.stroke(); g.beginPath(); g.moveTo(30 + i * 60, 0); g.lineTo(i * 62, h); g.stroke() } g.fillStyle = 'rgba(70,140,255,.25)'; g.beginPath(); g.arc(180, 330, 90, 0, 7); g.fill(); g.fillStyle = '#4c9bff'; g.beginPath(); g.arc(180, 330, 26, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 6; g.setLineDash([]); g.stroke(); g.fillStyle = '#0c0f14'; g.fillRect(0, h - 250, w, 250); g.fillStyle = '#ff5a5f'; g.textAlign = 'center'; g.font = '900 40px Inter, sans-serif'; g.fillText('SIN MOVIMIENTO', w / 2, h - 170); g.fillStyle = '#fff'; g.font = '800 54px Inter, sans-serif'; g.fillText('1 h 02 min', w / 2, h - 100); g.font = '600 26px Inter, sans-serif'; g.fillStyle = '#9fb0c4'; g.fillText('en el mismo punto', w / 2, h - 56) });
// ------------------------------------------------------------------ world: bus (front = -Z)
const BUS = grp(scene), HW = 1.25, H = 2.25, wallM = mat(0x9aa69c), darkM = mat(0x23262b), yel = mat(0xe8b923);
box(BUS, 2.5, .1, 11, mat(0xffffff, { map: T.floor }), 0, -.05, -.5); box(BUS, 2.5, .08, 11, mat(0x8f968c), 0, H + .04, -.5, 0);
for (const s of [-1, 1]) box(BUS, .04, .012, 9.4, basic(0x8a7a1a), s * .31, .006, -.3, 0);
const stripM = basic(0xffffff); for (const s of [-1, 1]) box(BUS, .14, .03, 9.6, stripM, s * .55, H - .015, -.6, 0);
const BL = [-3.6, -.2, 3.2].map(z => { const l = new THREE.PointLight(0xd6f2e2, 0, 7.5, 1.5); l.position.set(0, 1.78, z); BUS.add(l); return l });
const seg = (s, z0, z1, y0, y1, m = wallM) => box(BUS, .08, y1 - y0, z1 - z0, m, s * (HW + .04), (y0 + y1) / 2, (z0 + z1) / 2);
seg(-1, -6, 5, 0, .95); seg(-1, -6, 5, 1.9, H); seg(1, -6, 5, 1.9, H);
for (const [a, b] of [[-6, -5.55], [-4.55, -.55], [.85, 5]]) seg(1, a, b, 0, .95);
for (const z of [-5.5, -4.1, -2.7, -1.3, .1, 1.5, 2.9, 4.3]) seg(-1, z - .05, z + .05, .95, 1.9, darkM);
for (const z of [-5.55, -4.55, -3.2, -1.9, -.55, .85, 2.2, 3.6, 4.9]) seg(1, z - .05, z + .05, .95, 1.9, darkM);
for (const s of [-1, 1]) { const p = add(BUS, new THREE.PlaneGeometry(11, .95), new THREE.MeshBasicMaterial({ color: 0x1b3550, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide }), s * (HW + .03), 1.425, -.5); p.rotation.y = PI / 2 }
box(BUS, 2.5, 1.0, .08, wallM, 0, .5, 5.04); box(BUS, 2.5, .4, .08, wallM, 0, 2.05, 5.04); for (const s of [-1, 1]) box(BUS, .12, .9, .08, darkM, s * 1.19, 1.42, 5.04);
box(BUS, 2.5, .95, .55, darkM, 0, .47, -5.75); box(BUS, 2.5, .5, .1, darkM, 0, 2.0, -5.98); for (const s of [-1, 1]) box(BUS, .1, .9, .1, darkM, s * 1.2, 1.4, -5.98);
box(BUS, 1.76, .34, .06, mat(0x111214), .2, 1.98, -5.9, 0); const ledM = basic(0xffffff, { map: LED.a }); add(BUS, new THREE.PlaneGeometry(1.7, .3), ledM, .2, 1.98, -5.86);
const MIRG = grp(BUS); MIRG.position.set(-.62, 1.72, -5.7); MIRG.rotation.x = .1; box(MIRG, .66, .22, .03, mat(0x0c0d0f), 0, 0, -.02, 0); const mirM = basic(0xffffff, { map: EY[0] }); add(MIRG, new THREE.PlaneGeometry(.6, .1875), mirM, 0, 0, 0); const mirGl = glowSprite(MIRG, 0xff5a4a, 1.1, 0, 0, .05);
box(BUS, .06, 1.5, .9, mat(0x5d666e), -.2, .75, -4.6); { const w = add(BUS, G.cyl, darkM, -.72, 1.0, -5.42); w.scale.set(.2, .03, .2); w.rotation.x = 1.1 }   // driver partition + wheel
const seatM = mat(0xffffff, { map: T.seat }), frameM = mat(0x3a3f45);
function seat(x, z, wd = .43) { box(BUS, wd, .1, .42, seatM, x, .45, z, 0); box(BUS, wd, .5, .08, seatM, x, .75, z + .24, 0); box(BUS, wd, .05, .1, frameM, x, 1.02, z + .24, 0); box(BUS, .06, .42, .06, frameM, x, .2, z, 0) }
const ROWS = [-3.8, -2.95, -2.1, -1.25, -.4, .45, 1.3, 2.15, 3.0, 3.85];
for (const z of ROWS) { seat(-1.0, z); seat(-.55, z); if (z < -.9 || z > 1.1) { seat(.55, z); seat(1.0, z) } }
seat(-.65, -5.0); seat(0, 4.55, 2.3);
const pole = (x, z) => { const p = add(BUS, G.cyl, yel, x, H / 2, z); p.scale.set(.018, H, .018) };
for (const [x, z] of [[-.33, 3.24], [.33, -3.56], [.33, -.62], [.33, .92], [.33, 3.24]]) pole(x, z);
for (const s of [-1, 1]) { const r = add(BUS, G.cyl, yel, s * .33, 2.0, -.5); r.scale.set(.015, 9.6, .015); r.rotation.x = PI / 2 }
box(BUS, .07, .05, .07, yel, -.4, 1.07, .69, 0); const btnM = basic(0xc8141f); box(BUS, .036, .02, .036, btnM, -.4, 1.1, .69, 0);
function mkDoor(zc) { const ps = [-1, 1].map(s => { const p = grp(BUS); box(p, .05, 1.9, .7, mat(0x40464d), 0, .95, 0, 0); const gl = add(p, new THREE.PlaneGeometry(.5, 1.0), basic(0x0b1622), -.03, 1.25, 0); gl.rotation.y = -PI / 2; box(p, .03, 1.9, .04, yel, -.03, .95, -s * .33, 0); p.position.set(HW + .04, 0, zc + s * .35); p.userData = { s, zc }; return p }); return o => { for (const p of ps) p.position.z = p.userData.zc + p.userData.s * (.35 + .62 * o) } }
const doorMid = mkDoor(.15), doorFront = mkDoor(-5.05);
box(BUS, 1.0, .02, 1.5, mat(0x15171a), 1.75, -.3, .15, 0);                       // (nothing out there but a hint of a step)
const voidGl = [[0x4f7a8c, 4.5, 3.2, .9, .15], [0x35566e, 7, 5.5, 1.4, .6], [0x6f98a8, 2.2, 2.2, .3, -.1]].map(a => glowSprite(BUS, ...a));
for (const zc of [.15, -5.05]) { for (const s of [-1, 1]) box(BUS, .07, 1.95, .07, yel, HW, .97, zc + s * .72, 0); box(BUS, .1, .12, 1.5, mat(0x1d1f22), HW, 2.0, zc, 0); box(BUS, .02, .07, .5, basic(0x35e08a), HW - .06, 2.0, zc, 0); box(BUS, .3, .02, 1.4, basic(0x9fb8b0), HW - .1, .012, zc, 0) }
const CITY = [0, 1, 2, 3, 4, 5].map(i => glowSprite(BUS, i % 2 ? 0xffc870 : 0xffe2b0, 2.6, (i % 2 ? 1 : -1) * 4.2, 3.0, 0));
const ticket = add(BUS, new THREE.PlaneGeometry(.112, .2), basic(0xffffff, { map: T.ticket, side: THREE.DoubleSide }), -.04, 1.06, 1.27); ticket.rotation.y = -PI / 2; const tHand = sph(BUS, .04, mat(0xe0a680), -.03, .945, 1.3, 0);
phoneScr.material.map = T.map;
// ------------------------------------------------------------------ characters
const driver = makeChar({ skin: 0xb98a68, shirt: 0x54606c, pants: 0x22252b, hair: 0x1a1c22, style: 'cap', seed: 1 });
const manA = makeChar({ skin: 0xd8a47f, shirt: 0x7a5a36, pants: 0x30323a, hair: 0xa9a9a9, style: 'short', seed: 2 });
const pasB = makeChar({ skin: 0x8a5a3c, shirt: 0x8a3232, pants: 0x22252b, hair: 0x15100c, style: 'afro', seed: 3 });
const pasC = makeChar({ skin: 0xe0b08c, shirt: 0x4a7046, pants: 0x30323a, hair: 0x54301a, style: 'long', seed: 4 });
const mujer = makeChar({ skin: 0xe0a680, shirt: 0xb0303f, pants: 0x2b2e3a, hair: 0x1c1410, style: 'long', h: .96, seed: 5 });
const ME = { skin: 0xd8a47f, shirt: 0x2c4a7c, pants: 0x22252b, hair: 0x1c1410, style: 'short' };
const doble = makeChar({ ...ME, seed: 6 }), nuevo = makeChar({ ...ME, seed: 7 });
box(doble.up, .34, .3, .2, mat(0x5a2d1c), 0, .12, .24, 1); const nuevoGl = glowSprite(nuevo.up, 0xa8c8ff, .5, 0, .42, .32);
const SEATED = { sit: 1, ry: PI, aL: [-.6, -.12], aR: [-.6, -.12] };
// ------------------------------------------------------------------ environment
function env(o) {
  const li = o.li ?? [1, 1, 1]; BL.forEach((l, i) => LI(l, li[i] * (o.lI ?? 4.6))); stripM.color.setScalar(.06 + (li[0] + li[1] + li[2]) / 3 * 1.15);
  hemi.intensity = (o.hemi ?? .3) + .1; hemi.color.setHex(o.hemiC ?? 0xcfe8dc); bg.setHex(0x020304); scene.fog.color.setHex(o.fog ?? 0x04070a); scene.fog.density = o.fogD ?? .03; R.toneMappingExposure = o.exp ?? 1.2;
  doorMid(o.dm ?? 0); doorFront(o.df ?? 0); ledM.map = o.led || LED.a; ledM.color.setScalar(o.ledI ?? 1);
  const mg = o.mir ?? 0; mirM.map = mg > 0 ? EY[1] : EY[0]; mirM.color.setScalar(mg > 0 ? 1 + mg * .5 : .75); mirGl.material.opacity = mg * .35;
  CITY.forEach((s, i) => { s.material.opacity = (o.city ?? 0) * .85; s.position.z = ((i * 9.3 + (o.t ?? 0) * 11) % 55) - 30 });
  voidGl.forEach((v, i) => v.material.opacity = [.5, .35, .4][i] * (o.dm ?? 0)); ticket.visible = tHand.visible = !!o.ticket; LI(phoneL, o.phoneL ?? 0); btnM.color.setHex(o.btn ? 0xff5a4a : 0xc8141f);
}
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
const hum = (t, i) => .93 + .07 * (hash(Math.floor(t * 9) + i * 7) > .12 ? 1 : .4);
ARMP.grip = t => [[.15, -.03, -.55, -.4, 0, .2], [-.15, -.03, -.55, -.4, 0, -.2]];
ARMP.press = t => [[.13, -.06 + Math.sin(t * 9) * .004, -.52, .1, 0, -.3], [-.2, -.62, -.3, 0, 0, 0]];
const Pc = [-.55, 1.33, 1.25], SIGN = [.2, 1.98, -5.86], MIR = [-.62, 1.72, -5.7], DOOR = [1.3, 1.05, .15], WOM = [.6, 1.3, 1.08], BACK = [0, 1.1, 4.5], RB = [0, 1.3, 4.4];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.4, 4.0) * .92 }; hideAll();
  K1 = K1 || path([[0, Pc, SIGN, 30], [Ln.h1.end - .4, Pc, SIGN, 26], [Ln.h1.end + .5, Pc, [0, 1.3, -5], 80], [Ln.h2.start + .2, Pc, [0, 1.3, -5], 78],
    [Ln.h2.start + 1.7, Pc, [-1.0, 1.15, -2.1], 48], [Ln.h2.start + 3.1, Pc, [.6, 1.15, -2.95], 44], [Ln.h2.end + .2, Pc, [.95, 1.15, -1.25], 42],
    [M.pa1 + 1.0, Pc, SIGN, 30], [Ln.pa1.end, Pc, SIGN, 26], [Ln.h3.start + .9, Pc, [1.3, 1.4, -2.6], 60], [Ln.h3.end, Pc, [1.3, 1.4, -2.3], 56],
    [M.brake + .9, Pc, [.9, 1.2, -1.0], 56], [M.door + .3, Pc, DOOR, 58], [Ln.h4.end, Pc, DOOR, 44], [M.doorclose + .8, Pc, DOOR, 50],
    [Ln.m1.start + .25, Pc, WOM, 62], [Ln.m2.end, Pc, WOM, 56], [M.look + .55, Pc, [-.3, 1.5, -5], 56], [Ln.h5.end + .15, Pc, MIR, 16], [M.eyes + 1.3, Pc, MIR, 12.5], [M.pa2 + .35, Pc, MIR, 12.5],
    [M.pa2 + 1.05, Pc, SIGN, 30], [Ln.h6.end, Pc, SIGN, 26], [M.brake2 + .9, Pc, [.3, 1.2, -2], 64], [M.door2 + .4, Pc, DOOR, 62], [C.dur, Pc, DOOR, 42]]);
  const c = evalPath(K1, t), scare = t > M.eyes && t < M.eyes + 1.1, late = sr(t, M.door2, M.door2 + 1.2);
  const li = [0, 1, 2].map(i => hum(t, i) * (scare ? flk(t, 18, .4, .08) : 1) * (1 - late * .45));
  env({ t, li, city: 1 - sr(t, M.pa1 + .3, M.pa1 + 2.6), led: t < Ln.h1.end ? (hash(Math.floor(t * 8)) > .72 ? (hash(Math.floor(t * 8) + 3) > .5 ? LED.g1 : LED.g2) : LED.a) : t < M.pa1 + .55 ? LED.a : t < M.pa2 + .55 ? LED.olv : LED.mar, ledI: flk(t, 23, .06, .5),
    dm: Math.max(win(t, M.door, M.doorclose + .7, .7, .7), sr(t, M.door2, M.door2 + .8)), mir: t >= M.eyes ? .6 + .4 * sr(t, M.eyes, M.eyes + .5) : 0, hemi: .3 - late * .12 });
  pose(driver, { t, x: -.65, z: -4.98, ...SEATED, aL: [-1.2, 0], aR: [-1.2, 0] });
  if (t < M.brake + .5) pose(manA, { t: 0, x: 1.0, z: -1.25, ...SEATED });
  else if (t < M.door + 2.0) { const ex = sr(t, M.door + .75, M.door + 1.9); walk(manA, t, [[M.brake + .5, 1.0, -1.25], [M.brake + 1.1, .2, -1.1], [M.door + .1, .25, .12], [M.door + .8, 1.15, .15], [M.door + 1.9, 2.5, .15]], { y: -.45 * ex, ry0: PI, hp: .25, phase: t * 6 }) }
  pose(pasB, { t: 0, x: -1.0, z: -2.1, ...SEATED }); pose(pasC, { t: 0, x: .55, z: -2.95, ...SEATED });
  const wt = win(t, Ln.m1.start - .5, M.look + .3, .4, .5);
  pose(mujer, { t, x: .55, z: 1.3, sit: 1, ry: PI + wt * .7, look: wt > .3 ? cam.position : V(.55, 1.2, -5), talk: talk('m1', t) + talk('m2', t), brow: wt, lean: wt * .06 });
  arms(t, {}); setCam(c, t, cl(c.fov / 55, .12, 1) * (1.6 * (1 - .5 * late) + (scare ? 1.5 : 0)), 0, (t - M.eyes > 0 && t - M.eyes < .3 ? 1 : 0) + win(t, M.brake + .2, M.brake + 1.2, .2, .6) * .25 + win(t, M.brake2 + .2, M.brake2 + 1.2, .2, .6) * .25);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 500, tint: 'rgba(30,90,80,.2)', white: scare && t - M.eyes < .09 ? .45 : 0, red: sr(t, M.eyes, M.eyes + .3) * (1 - sr(t, M.pa2, M.pa2 + 1)) * .35, black: 1 - ramp(t, 0, .35), end: ENDQ(t - M.endcard, 'TE BAJÁS', 'TE QUEDÁS', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const TK = [-.04, 1.02, 1.27];
  K2 = K2 || path([[0, Pc, DOOR, 62], [Ln.h1.end, Pc, DOOR, 50], [Ln.c1.start, Pc, [-.62, 1.55, -5.2], 30], [Ln.c1.end, Pc, [-.62, 1.58, -5.2], 22],
    [Ln.h2.start + .55, Pc, [-.55, 1.0, .7], 66], [M.doorclose - .25, Pc, [-.55, 1.0, .7], 64], [M.doorclose + .35, Pc, DOOR, 60], [M.start + .3, Pc, DOOR, 56],
    [Ln.m1.start + .2, Pc, WOM, 62], [Ln.m2.end, Pc, WOM, 58], [M.ticket + .35, Pc, TK, 26], [Ln.h3.end, Pc, TK, 21.5],
    [M.map + .55, Pc, { yaw: 180, pitch: -13 }, 66], [Ln.h4.end, Pc, { yaw: 180, pitch: -13 }, 62], [M.back + 1.0, Pc, BACK, 60], [Ln.h5.end, Pc, BACK, 30], [M.sting + .6, Pc, [0, 1.2, 4.5], 15], [Ln.m3.start, Pc, [0, 1.2, 4.5], 15],
    [Ln.m3.start + .5, Pc, WOM, 60], [C.dur, Pc, WOM, 52]]);
  const c = evalPath(K2, t), scare = t > M.sting && t < M.sting + 1.0, idle = t < M.start;
  env({ t, li: [0, 1, 2].map(i => hum(t, i) * (scare ? flk(t, 18, .4, .1) : 1) * (idle ? .6 : .85)), led: LED.mar, ledI: flk(t, 23, .06, .5), dm: 1 - sr(t, M.doorclose, M.doorclose + .7), mir: 1, hemi: idle ? .2 : .26,
    ticket: t > M.ticket - .3 && t < M.map + .3, phoneL: win(t, M.map + .2, M.back + .3) * 1.3 });
  pose(driver, { t: 0, x: -.65, z: -4.98, ...SEATED, aL: [-1.2, 0], aR: [-1.2, 0] });
  pose(pasB, { t: 0, x: -1.0, z: -2.1, ...SEATED }); pose(pasC, { t: 0, x: .55, z: -2.95, ...SEATED });
  const wt = Math.max(win(t, Ln.m1.start - .5, M.map + .2, .4, .5), sr(t, Ln.m3.start - .6, Ln.m3.start)), tk = win(t, M.ticket - .3, M.map + .2, .3, .3), fear = sr(t, Ln.m3.start - .5, Ln.m3.start);
  pose(mujer, { t, x: .55, z: 1.3, sit: 1, ry: PI + wt * .7, look: wt > .3 ? cam.position : V(.55, 1.2, -5), talk: talk('m1', t) + talk('m2', t) + talk('m3', t), brow: wt, eye: 1 + fear * .3, pupil: 1 - fear * .3, lean: wt * .1, aL: [-tk * .4, tk * 1.0], tremble: fear });
  const up = sr(t, M.face, M.sting);
  pose(doble, { t: 0, x: 0, z: 4.5, ...SEATED, hp: .62 - up * .5, closed: 1, noblink: 1 });
  arms(t, { grip: win(t, Ln.h2.start + .2, M.doorclose + .2, .35, .35), phone: win(t, M.map + .15, M.back + .25, .3, .3) });
  setCam(c, t, cl(c.fov / 55, .12, 1) * ((idle ? .8 : 1.6) + (scare ? 1.5 : 0)), 0, (t - M.sting > 0 && t - M.sting < .3 ? 1.1 : 0));
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.2, .3, .25), titleY: 430, tint: 'rgba(30,90,80,.2)', black: 1 - ramp(t, 0, .4), white: scare && t - M.sting < .09 ? .45 : 0,
    alert: { k: Math.min(ramp(t, M.map + .1, M.map + .45), 1 - ramp(t, Ln.h4.end + .1, Ln.h4.end + .4)), buzz: t < M.map + 1 ? 1 : 0, kk: 'MAPA · AHORA', m: 'SIN MOVIMIENTO', s: 'Hace 1 h 02 min en el mismo punto.', col: ['#2f6fd0', '#173a78'] },
    end: ENDQ(t - M.endcard, 'LO DESPERTÁS', 'TOCÁS EL TIMBRE', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const BTN = [-.4, 1.1, .69], bo = M.blackout, rear = t >= bo;
  K3 = K3 || path([[0, Pc, BTN, 44], [1.5, Pc, BTN, 36], [M.title + .2, Pc, [0, 1.3, -5], 72], [M.walk, Pc, [0, 1.3, -5], 72],
    [M.walk + .9, [0, 1.6, 1.6], [0, 1.2, 4.5], 74], [Ln.h2.start + .8, [0, 1.6, 2.1], [0, 1.2, 4.5], 70], [Ln.h2.start + 1.5, [0, 1.6, 2.4], [0, 1.3, -4], 76], [Ln.h2.end - 1.5, [0, 1.6, 2.7], [0, 1.3, -4], 70],
    [Ln.h2.end - .5, [0, 1.6, 3.0], BACK, 66], [Ln.h3.start, [0, 1.56, 3.2], [0, 1.05, 4.5], 62], [Ln.h3.end + .3, [0, 1.5, 3.4], [0, 1.1, 4.5], 58], [M.open + 1.0, [0, 1.45, 3.45], [0, 1.2, 4.5], 46], [bo, [0, 1.42, 3.5], [0, 1.24, 4.5], 36],
    [bo + .05, RB, [0, 1.25, -5], 68], [M.brake, RB, [0, 1.25, -5], 64], [M.door + .4, RB, [1.0, 1.3, -5], 44], [M.board + .6, RB, [.5, 1.4, -4.6], 30], [Ln.h6.end, RB, [-.2, 1.35, -1], 36],
    [Ln.m1.start, RB, [0, 1.25, 1.3], 32], [Ln.m1.end, RB, [0, 1.25, 1.3], 28], [Ln.h7.end, RB, [0, 1.25, 1.0], 34], [Ln.pa.start + .5, RB, SIGN, 28], [M.end2, RB, SIGN, 24], [C.dur, RB, SIGN, 24]]);
  const c = evalPath(K3, t), out = t >= M.end2, turn = sr(t, Ln.h2.start + .9, Ln.h2.start + 1.5) * (rear ? 0 : 1), op = sr(t, M.open, M.open + .9);
  env({ t, li: [0, 1, 2].map(i => out ? 0 : hum(t, i) * (rear ? .55 * (t > M.pa ? flk(t, 16, .35, .15) : 1) : (op > 0 ? flk(t, 15, .3, .25) : .85))), led: rear && t < M.pa + .55 ? LED.a : rear ? LED.olv : LED.mar, ledI: flk(t, 23, .06, .5), df: sr(t, M.door, M.door + .7) * (1 - sr(t, M.board + 3.2, M.board + 3.9)), mir: rear ? 0 : 1,
    hemi: out ? .02 : rear ? .2 : .26, hemiC: rear ? 0xa8c4ff : 0xcfe8dc, btn: t > .35 && t < 1.7 && (t * 3 % 1) < .35 });
  pose(driver, { t: 0, x: -.65, z: -4.98, ...SEATED, aL: [-1.2, 0], aR: [-1.2, 0], hyAbs: turn * 2.6 });
  const gz = { hyAbs: turn * PI, eye: 1 + turn * .3, pupil: 1 - turn * .35, glow: turn * .5, noblink: 1 };
  pose(pasB, { t: 0, x: -1.0, z: -2.1, ...SEATED, ...gz }); pose(pasC, { t: 0, x: .55, z: -2.95, ...SEATED, ...gz });
  const tn = rear ? sr(t, Ln.m1.start - .7, Ln.m1.start) : 0;
  pose(mujer, { t, x: .55, z: 1.3, ...SEATED, ...(rear ? { look: tn > .3 ? V(-.55, 1.25, 1.3) : V(.55, 1.2, -5), talk: talk('m1', t), lean: tn * .1 } : gz) });
  if (!rear) pose(doble, { t: 0, x: 0, z: 4.5, ...SEATED, hp: .62 - op * .62, closed: op < .45, noblink: 1, eye: 1 + op * .2, pupil: 1 - op * .45, glow: op * .7, smile: sr(t, M.open + .5, M.open + 1.1) * .55, talk: talk('o1', t), hr: op * .15 });
  else if (t > M.board) { const sit = t > M.board + 5.6; if (sit) pose(nuevo, { t, x: -.55, z: 1.3, ...SEATED, hp: .35, aL: [-.9, 0], aR: [-.9, 0] }); else walk(nuevo, t, [[M.board, 2.0, -5.05], [M.board + 1.0, .25, -5.0], [M.board + 1.6, 0, -4.2], [M.board + 5.0, 0, 1.2], [M.board + 5.6, -.4, 1.3]], { hp: .4, aL: [-1.0, 0], aR: [-1.0, 0], phase: t * 6.5, y: -.3 * (1 - sr(t, M.board + .3, M.board + .9)) }); nuevoGl.material.opacity = .7 }
  arms(t, { press: rear ? 0 : win(t, .1, 1.7, .25, .3), reach: rear ? 0 : win(t, Ln.h3.start - .2, M.open + .4, .35, .4) });
  const walking = !rear && t > M.walk + .2 && t < Ln.h3.start;
  setCam(c, t, cl(c.fov / 55, .12, 1) * (rear ? .5 + sr(t, Ln.h7.start, Ln.h7.end) * 2.2 : 1.5), walking ? .35 : 0, (t - bo > -.25 && t < bo ? 1.2 : 0) + (t - M.end2 > 0 && t - M.end2 < .3 ? 1 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.1, .3, .25), titleY: 380, tint: rear ? 'rgba(30,60,140,.3)' : 'rgba(30,90,80,.2)', grain: rear ? .16 : .11,
    black: Math.max(1 - ramp(t, 0, .35), rear ? 1 - sr(t, M.wake - .4, M.wake + 1.3) : 0, out ? ramp(t, M.end2 + .1, M.end2 + .5) : 0), white: (t - bo > -.08 && t < bo) ? .7 : 0, red: !rear ? op * .25 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS TE<br>HUBIERAS<br>SUBIDO?', qs: 132, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

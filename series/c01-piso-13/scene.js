// PISO 13 — ascensor de madrugada. Las tres partes (P1/P2/P3) son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, run } from './core.js';
init({ tag: 'PISO 13', title: 'PISO 13', titleSize: 232, sleeve: 0xb8862b, skin: 0xe0b08c,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], vecino: ['#7dffb0', 'DON AURELIO', 0], portero: ['#c9d1da', 'PORTERÍA', 1], cosa: ['#ff4558', '¿¿??', 1] } });
// ------------------------------------------------------------------ textures
T.steel = tex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#8d979f'); gr.addColorStop(.5, '#aab3ba'); gr.addColorStop(1, '#87919a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 260; i++) { const y = Math.random() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (Math.random() - .5) * 4); g.stroke() } blot(g, w, h, 14, .1, '20,25,30', 70) });
T.cfloor = tex(256, 256, (g, w, h) => { g.fillStyle = '#2a2d31'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3e44'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2) g.fillRect(x * 64, y * 64, 64, 64); speck(g, w, h, 900, .2) }, 2, 2);
T.carpet = tex(256, 256, (g, w, h) => { g.fillStyle = '#5a1f26'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a3a2e'; g.lineWidth = 6; for (let i = -1; i < 3; i++) { g.strokeRect(i * 128 + 20, 20, 88, 88); g.strokeRect(i * 128 + 84, 148, 88, 88) } speck(g, w, h, 1500, .25) }, 2, 9);
T.wallp = tex(256, 256, (g, w, h) => { g.fillStyle = '#b9ad94'; g.fillRect(0, 0, w, h); g.fillStyle = '#a89b80'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 12, h); blot(g, w, h, 20, .12, '60,50,30', 80); speck(g, w, h, 800, .1) }, 9, 1);
T.wood = tex(256, 512, (g, w, h) => { g.fillStyle = '#5b3b22'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 80; i++) { const x = Math.random() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (Math.random() - .5) * 14, h); g.stroke() } g.strokeStyle = '#3d2614'; g.lineWidth = 8; g.strokeRect(34, 40, w - 68, 190); g.strokeRect(34, 270, w - 68, 200) });
T.tile = tex(256, 256, (g, w, h) => { g.fillStyle = '#e6e0d2'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9c0ac'; g.fillRect(0, 0, 128, 128); g.fillRect(128, 128, 128, 128); speck(g, w, h, 600, .08) }, 5, 4);
T.plate = tex(256, 128, (g, w, h) => { g.fillStyle = '#c9a64a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1c0c'; g.font = '900 96px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1204', w / 2, h / 2 + 6) });
const dispT = {}; const disp = (n, dir) => dispT[n + '|' + dir] || (dispT[n + '|' + dir] = tex(256, 128, (g, w, h) => { g.fillStyle = '#0a0606'; g.fillRect(0, 0, w, h); g.shadowColor = '#ff2a1a'; g.shadowBlur = 18; g.fillStyle = '#ff4a34'; g.font = '900 100px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), dir ? w / 2 + 34 : w / 2, h / 2 + 6); if (dir) { g.beginPath(); const s = dir > 0 ? -1 : 1; g.moveTo(52, h / 2 + s * 30); g.lineTo(24, h / 2 - s * 22); g.lineTo(80, h / 2 - s * 22); g.closePath(); g.fill() } }));
const panelT = [0, 1, 2, 3].map(st => tex(256, 640, (g, w, h) => { g.fillStyle = '#6f7a84'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4a535c'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  const btn = (x, y, lab, lit, col = '#ffd95a') => { g.shadowColor = col; g.shadowBlur = lit ? 26 : 0; g.fillStyle = lit ? col : '#2c3238'; g.beginPath(); g.arc(x, y, 25, 0, 7); g.fill(); g.shadowBlur = 0; g.strokeStyle = '#1b1f23'; g.lineWidth = 4; g.stroke(); g.fillStyle = lit ? '#231505' : '#cfd6dc'; g.font = '900 25px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, x, y + 2) };
  if (st >= 2) btn(128, 62, '13', 1, '#ff3a2a'); for (let i = 0; i < 6; i++) { btn(84, 140 + i * 62, 12 - i * 2, st == 1 && i == 0); btn(172, 140 + i * 62, 11 - i * 2, 0) } btn(128, 522, 'PB', st == 3);
  g.fillStyle = '#1b1f23'; for (let i = 0; i < 6; i++) g.fillRect(70 + i * 20, 572, 10, 44) }));
// ------------------------------------------------------------------ world: cabin (door = -Z)
const CAB = grp(scene), HALL = grp(scene), LOB = grp(scene), steel = mat(0xffffff, { map: T.steel }), dk = mat(0x23272c);
box(CAB, 1.6, .1, 1.6, mat(0xffffff, { map: T.cfloor }), 0, -.05, 0); box(CAB, 1.6, .1, 3.3, mat(0x9aa0a6), 0, 2.35, .8, 0);
const lampM = basic(0xffffff); box(CAB, 1.0, .02, 1.0, lampM, 0, 2.29, 0, 0); box(CAB, 1.0, .02, 1.0, lampM, 0, 2.29, 1.6, 0);
const CL = new THREE.PointLight(0xf2f6ff, 0, 7, 1.4); CL.position.set(0, 1.95, .1); CAB.add(CL);
for (const s of [-1, 1]) { box(CAB, .06, 2.3, 3.3, steel, s * .83, 1.15, .8); const r = add(CAB, G.cyl, mat(0xd9dee2), s * .74, .95, 0); r.scale.set(.02, 1.3, .02); r.rotation.x = PI / 2 }
box(CAB, 1.6, .9, .06, steel, 0, .45, .83); box(CAB, 1.6, .3, .06, steel, 0, 2.15, .83); for (const s of [-1, 1]) box(CAB, .2, 1.1, .06, steel, s * .7, 1.45, .83);
for (const [w, h, x, y] of [[1.26, .04, 0, .9], [1.26, .04, 0, 2.0], [.04, 1.1, -.61, 1.45], [.04, 1.1, .61, 1.45]]) box(CAB, w, h, .03, dk, x, y, .8, 0);
{ const p = add(CAB, new THREE.PlaneGeometry(1.2, 1.1), new THREE.MeshBasicMaterial({ color: 0x9fd0e8, transparent: true, opacity: .07, depthWrite: false }), 0, 1.45, .8); p.rotation.y = PI }
box(CAB, 1.6, .1, 1.7, mat(0xffffff, { map: T.cfloor }), 0, -.05, 1.65); box(CAB, 1.6, 2.3, .06, steel, 0, 1.15, 2.43);              // mirror room
for (const s of [-1, 1]) box(CAB, .46, 2.05, .02, mat(0xc9d0d6), s * .23, 1.02, 2.39, 0);
const mDoor = add(CAB, new THREE.PlaneGeometry(.9, 2.05), basic(0xc8ffe0), 0, 1.02, 2.37); mDoor.rotation.y = PI;
const MRL = new THREE.PointLight(0xb8ffd8, 0, 5, 1.4); MRL.position.set(0, 1.6, 2.2); CAB.add(MRL);
const BKL = new THREE.PointLight(0xb8ffd8, 0, 5, 1.4); BKL.position.set(0, 1.6, -.6); CAB.add(BKL);
for (const s of [-1, 1]) box(CAB, .35, 2.3, .06, steel, s * .625, 1.15, -.8); box(CAB, .9, .25, .06, steel, 0, 2.175, -.8);
const panelM = basic(0xffffff, { map: panelT[0] }); add(CAB, new THREE.PlaneGeometry(.22, .55), panelM, .625, 1.3, -.765);
box(CAB, .34, .17, .03, dk, 0, 2.17, -.775, 0); const dispM = basic(0xffffff, { map: disp('PB', 0) }); add(CAB, new THREE.PlaneGeometry(.3, .14), dispM, 0, 2.17, -.755);
const DP = [-1, 1].map(s => { const p = grp(CAB); box(p, .46, 2.05, .04, mat(0xffffff, { map: T.steel, color: 0xd5dbe0 }), 0, 1.025, 0, 0); box(p, .012, 2.05, .045, dk, -s * .224, 1.025, 0, 0); p.userData.s = s; return p });
// ------------------------------------------------------------------ world: hallway (floors 5 and 13)
const wallpM = mat(0xffffff, { map: T.wallp }), woodM = mat(0xffffff, { map: T.wood });
box(HALL, 2.2, .1, 9.2, mat(0xffffff, { map: T.carpet }), 0, -.05, -5.46); box(HALL, 2.2, .1, 9.2, mat(0x8c8676), 0, 2.55, -5.46, 0); box(HALL, 2.2, 2.6, .1, wallpM, 0, 1.25, -10.1);
box(HALL, .1, 2.5, 9.2, wallpM, 1.15, 1.25, -5.46); box(HALL, .1, 2.5, 4.6, wallpM, -1.15, 1.25, -7.76); box(HALL, .1, 2.5, 3.66, wallpM, -1.15, 1.25, -2.69); box(HALL, .1, .45, .96, wallpM, -1.15, 2.28, -4.99);
for (const s of [-1, 1]) box(HALL, .65, 2.5, .1, wallpM, s * .78, 1.25, -.9); box(HALL, .9, .4, .1, wallpM, 0, 2.3, -.9);
for (const [s, z] of [[1, -3.4], [1, -6.2], [-1, -2.4], [-1, -7.6]]) { box(HALL, .05, 2.0, .9, woodM, s * 1.09, 1.0, z, 0); box(HALL, .03, .1, .3, basic(0x8a6d2a), s * 1.06, 1.62, z, 0) }
const leafH = grp(HALL); leafH.position.set(-1.1, 0, -5.45); const leaf = box(leafH, .05, 2.0, .9, woodM, 0, 1.0, .45, 0); { const p = add(leafH, new THREE.PlaneGeometry(.3, .15), basic(0xffffff, { map: T.plate }), .03, 1.62, .45); p.rotation.y = PI / 2 }
const ajarP = add(HALL, new THREE.PlaneGeometry(.9, 2.05), basic(0xffb866), -1.6, 1.02, -5.0); ajarP.rotation.y = PI / 2; const ajarGl = glowSprite(HALL, 0xffa040, 2.6, -1.25, 1.2, -5.0);
const AJL = new THREE.PointLight(0xffa850, 0, 6, 1.5); AJL.position.set(-.8, 1.3, -5.0); HALL.add(AJL);
const HLm = [basic(0xffffff), basic(0xffffff)], HL = [-3.2, -7.4].map((z, i) => { const d = add(HALL, G.cyl, HLm[i], 0, 2.48, z); d.scale.set(.22, .04, .22); const l = new THREE.PointLight(0xffe2b8, 0, 8, 1.4); l.position.set(0, 2.2, z); HALL.add(l); return l });
// ------------------------------------------------------------------ world: lobby (planta baja) + its mirror image behind the wall mirror (x = 2)
const lobW = mat(0xe9e2d0);
box(LOB, 10.4, .1, 7.4, mat(0xffffff, { map: T.tile }), 2, -.05, -4.56); box(LOB, 10.4, .1, 7.4, mat(0xf2efe6), 2, 2.85, -4.56, 0);
box(LOB, .1, 2.8, 7.4, lobW, -3.05, 1.4, -4.56); box(LOB, .1, 2.8, 7.4, lobW, 7.05, 1.4, -4.56);
box(LOB, .1, 2.8, 4.41, lobW, 2.05, 1.4, -6.055); box(LOB, .1, 2.8, 1.69, lobW, 2.05, 1.4, -1.705); box(LOB, .1, .4, 1.3, lobW, 2.05, .2, -3.2); box(LOB, .1, .5, 1.3, lobW, 2.05, 2.55, -3.2);
for (const [w, h, y, z] of [[.07, 2.02, 1.35, -3.88], [.07, 2.02, 1.35, -2.52], [1.42, .07, .37, -3.2], [1.42, .07, 2.33, -3.2]]) box(LOB, .14, h, w, mat(0xc9a64a), 2.02, y, z, 0);
{ const p = add(LOB, new THREE.PlaneGeometry(1.3, 1.9), new THREE.MeshBasicMaterial({ color: 0x9fd0e8, transparent: true, opacity: .1, depthWrite: false }), 2.0, 1.35, -3.2); p.rotation.y = -PI / 2 }
box(LOB, 2.5, 2.8, .1, lobW, -1.8, 1.4, -.9); box(LOB, 1.45, 2.8, .1, lobW, 1.28, 1.4, -.9); box(LOB, .9, .7, .1, lobW, 0, 2.45, -.9);
const skyM = basic(0xdff0ff); add(LOB, new THREE.PlaneGeometry(12, 3), skyM, 2, 1.4, -8.4); for (let x = -3; x <= 7; x += 1.25) box(LOB, .08, 2.8, .08, mat(0x3a3f45), x, 1.4, -8.2);
function props(mx) { const X = x => mx ? 4 - x : x; box(LOB, 1.0, 1.1, 1.9, mat(0x6b4a2c), X(-1.75), .55, -3.9); box(LOB, 1.1, .06, 2.0, mat(0x3d2614), X(-1.75), 1.13, -3.9); box(LOB, .1, .9, 1.4, mat(0x2c5a3a), X(-2.98), 1.7, -3.9, 0);
  const pot = add(LOB, G.cyl, mat(0x8a4a2a), X(-2.5), .3, -6.6); pot.scale.set(.25, .6, .25); for (const [dx, dy, r] of [[0, .95, .38], [.2, 1.3, .3], [-.18, 1.4, .26], [.05, 1.7, .22]]) sph(LOB, r, mat(0x2f7a3a), X(-2.5 + dx), dy, -6.6); box(LOB, .5, .45, 1.5, mat(0x7a2e2e), X(-2.7), .22, -1.9) }
props(0); props(1);
const sun = new THREE.DirectionalLight(0xfff0d8, 0); sun.position.set(2, 5, -14); sun.target.position.set(2, 0, -3); LOB.add(sun, sun.target);
// ------------------------------------------------------------------ characters
const vecino = makeChar({ skin: 0xd9b08c, shirt: 0x6b4a2c, pants: 0x4a4a50, hair: 0xdcdcdc, style: 'short', h: .97, lean: .07, seed: 2 });
const ME = { skin: 0xe0b08c, shirt: 0xb8862b, pants: 0x2b2e3a, hair: 0x4a2a14, style: 'long', h: .95 };
const refl = makeChar({ ...ME, seed: 3 }), sil = makeChar({ skin: 0x040405, shirt: 0x040405, pants: 0x040405, hair: 0x040405, style: 'long', h: .95, seed: 4 });
const PORT = { skin: 0xb98a68, shirt: 0x2f5a8c, pants: 0x22252b, hair: 0x1a1c22, style: 'short', tie: 0x1b1b1d, seed: 5 }, portero = makeChar(PORT), porteroR = makeChar(PORT);
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
function env(o) {
  const lit = o.lit ?? 1; LI(CL, lit * 5.2); lampM.color.setScalar(.08 + lit * 1.2); CL.color.setHex(o.litC ?? 0xf2f6ff);
  dispM.map = disp(...(o.disp || ['PB', 0])); dispM.color.setScalar(o.dispI ?? 1); panelM.map = panelT[o.panel ?? 0]; panelM.color.setScalar(o.panelI ?? 1);
  for (const p of DP) p.position.set(p.userData.s * (.23 + .46 * (o.door ?? 0)), 0, -.85);
  const h = o.hall ?? 0; HALL.visible = h == 5 || h == 13; LOB.visible = h == 'pb'; const hl = o.hl ?? [1, 1];
  HL.forEach((l, i) => { LI(l, HALL.visible ? hl[i] * 4.5 : 0); l.color.setHex(h == 13 ? 0xb8ffd0 : 0xffe2b8); HLm[i].color.setScalar(.1 + hl[i] * 1.1) });
  const aj = HALL.visible ? (o.ajar ?? 0) : 0; leafH.rotation.y = aj * 1.25; ajarP.visible = aj > 0; ajarGl.material.opacity = aj * .5; LI(AJL, aj * 5);
  LI(sun, h == 'pb' ? 2.2 : 0); LI(MRL, (o.mdoor ?? 0) * 3); LI(BKL, (o.mdoor ?? 0) * 3); mDoor.scale.x = Math.max(.001, o.mdoor ?? 0); mDoor.visible = (o.mdoor ?? 0) > .01;
  hemi.intensity = o.hemi ?? .32; hemi.color.setHex(o.hemiC ?? 0xdfe9ff); bg.setHex(o.bg ?? 0x020203); scene.fog.color.setHex(o.fog ?? o.bg ?? 0x020203); scene.fog.density = o.fogD ?? .03; R.toneMappingExposure = o.exp ?? 1.1;
}
ARMP.press = t => [[.2, -.1 + Math.abs(Math.sin(t * 11.6)) * .02, -.5 - Math.abs(Math.sin(t * 11.6)) * .05, .15, 0, -.4], [-.2, -.62, -.3, 0, 0, 0]];
const Ec = [-.45, 1.56, .45], Eh = [.08, 1.56, .3], DOORT = [0, 1.4, -.8], PANEL = [.625, 1.3, -.76], DISP = [0, 2.17, -.76], VEC = [.48, 1.5, .05], AJ = [-1.0, 1.3, -5], MT = [-.3, 1.5, .8], Em = [-.3, 1.56, .15];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const mirrorMe = (t, c, p = {}) => pose(refl, { t, x: c.p[0], z: 1.6 - c.p[2], ry: PI, look: cam.position, ...p });
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  K1 = K1 || path([[0, Ec, [.625, 1.18, -.76], 28], [Ln.h1.end - .2, Ec, [.625, 1.42, -.76], 26], [Ln.h1.end + .6, Ec, DOORT, 74], [M.press - .9, Ec, DOORT, 72], [M.press - .2, Ec, PANEL, 48], [M.go + .1, Ec, PANEL, 46],
    [M.go + .7, Ec, DISP, 30], [M.stop5, Ec, DISP, 28], [M.open5 + .6, Ec, [0, 1.4, -1.5], 68], [M.open5 + 2.2, Ec, [.1, 1.45, -1], 64], [M.close5, Ec, VEC, 66], [Ln.y1.end + .6, Ec, VEC, 60],
    [Ln.h4.start - .1, Ec, DISP, 27], [M.thirteen + .3, Ec, DISP, 22], [Ln.h5.start + .6, Ec, [.625, 1.42, -.76], 26], [Ln.h5.end + .1, Ec, [.625, 1.46, -.76], 22],
    [M.open13 + .7, Eh, [0, 1.4, -3], 68], [Ln.h6.start, Eh, [-.2, 1.4, -4], 62], [Ln.h6.end, Eh, AJ, 36], [Ln.h7.end, Eh, AJ, 32], [Ln.v1.start + .3, Ec, VEC, 64], [Ln.v1.end, Ec, VEC, 58],
    [M.shadow + .5, Eh, AJ, 30], [M.sting + .5, Eh, [-.85, 1.4, -5], 23], [C.dur, Eh, [-.85, 1.4, -5], 21]]);
  const c = evalPath(K1, t), w4 = Ln.h4.words, t13 = t >= M.thirteen, tw = Ln.h1.words.at(-1)[1], gl = t > tw - .05 && t < Ln.h1.end + .35 && hash(Math.floor(t * 16)) > .3;
  const fl = t < M.go ? 'PB' : t < M.stop5 ? ['PB', 1, 2, 3, 4, 5][Math.min(5, Math.floor(ramp(t, M.go, M.stop5 - .15) * 6))] : t < M.close5 + 1.2 ? 5 : t < w4[0][1] ? [6, 7, 8, 9][Math.min(3, Math.floor(ramp(t, M.close5 + 1.2, w4[0][1]) * 4))] : t < w4[1][1] ? 10 : t < w4[2][1] ? 11 : t13 ? 13 : 12;
  const moving = (t > M.go && t < M.stop5) || (t > M.close5 + 1.2 && t < M.open13), d5 = win(t, M.open5, M.close5 + 1.1, 1.0, 1.0), d13 = sr(t, M.open13 + .6, M.open13 + 1.9), scare = t > M.sting && t < M.sting + 1;
  env({ lit: (t13 ? .62 * flk(t, 11, .12, .45) : .95) * (scare ? flk(t, 18, .4, .1) : 1), litC: t13 ? 0xe6fff0 : 0xf2f6ff, disp: [fl, moving ? 1 : 0], dispI: t13 ? .75 + .25 * flk(t, 20, .3, .2) : 1, panel: t < M.press ? (gl ? 2 : 0) : t13 ? 2 : 1, panelI: t13 ? 1.1 + .25 * Math.sin(t * 9) : 1,
    door: Math.max(d5, d13), hall: t13 ? 13 : 5, hl: t13 ? [flk(t, 12, .3, .15) * .7, flk(t + 3, 9, .5, .05) * .5] : [1, 1], ajar: 1, hemi: t13 ? .22 : .34, fogD: t13 ? .07 : .03, fog: t13 ? 0x06100c : 0x020203 });
  if (t > M.open5 + .4) walk(vecino, t, [[M.open5 + .5, 0, -2.6], [M.open5 + 2.3, .05, -.9], [M.open5 + 3.3, .48, .05]], { ryEnd: PI, phase: t * 5, talk: talk('v1', t), still: { t: t13 ? 0 : t, noblink: t13 ? 1 : 0 } });
  if (t > M.shadow) pose(sil, { t: 0, x: lerp(-1.45, -.72, sr(t, M.shadow, M.shadow + 1.1)), z: -4.95, ry: .12, glow: sr(t, M.shadow + .6, M.shadow + 1.4) * .9, noblink: 1, hr: .18, eye: .7, pupil: .05 });
  arms(t, { reach: win(t, M.press - .55, M.press + .45, .3, .35) });
  setCam(c, t, cl(c.fov / 55, .15, 1) * ((moving ? 1.5 : .9) + (scare ? 1.5 : 0)), 0, (t - M.thirteen > 0 && t - M.thirteen < .3 ? .6 : 0) + (scare && t - M.sting < .3 ? 1 : 0));
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 500, tint: t13 ? 'rgba(20,90,50,.22)' : 'rgba(60,80,120,.14)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .09 ? .45 : 0, red: sr(t, M.thirteen, M.thirteen + .3) * (1 - sr(t, M.open13, M.open13 + 1)) * .3,
    end: ENDQ(t - M.endcard, 'SALÍS', 'BAJÁS A PB', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const IC = [.625, 1.06, -.76];
  K2 = K2 || path([[0, Ec, [.625, 1.12, -.76], 32], [Ln.h1.end - .3, Ec, [.625, 1.15, -.76], 29], [M.close + .3, Eh, [0, 1.4, -2.5], 62], [M.go, Ec, DOORT, 58], [M.go + .9, Ec, DISP, 28], [Ln.h2.end, Ec, DISP, 22],
    [M.interbuzz + .5, Ec, IC, 34], [Ln.p1.end, Ec, IC, 30], [Ln.y1.start + .5, Ec, VEC, 66], [Ln.y1.end + .3, Ec, VEC, 62], [Ln.p2.start + .3, Ec, IC, 30], [Ln.p2.end, Ec, IC, 26], [Ln.p3.end, Ec, VEC, 60], [M.cut + 1.0, Ec, VEC, 54],
    [M.turn + 1.7, Em, MT, 68], [Ln.h3.end, Em, MT, 60], [M.sting + 1.2, Em, [-.3, 1.52, .8], 48], [C.dur, Em, [-.3, 1.52, .8], 44]]);
  const c = evalPath(K2, t), scare = t > M.sting && t < M.sting + 1, cut = t > M.cut && t < M.cut + 1, dn = t > M.go, late = sr(t, M.turn, M.turn + 1.5);
  env({ lit: .62 * flk(t, 11, .12, .5) * (cut || scare ? flk(t, 18, .4, .08) : 1) * (1 - late * .25), litC: 0xe6fff0, disp: [13, dn ? -1 : 0], dispI: .75 + .25 * flk(t, 20, .3, .2), panel: 3, panelI: 1.1 + .25 * Math.sin(t * 9),
    door: 1 - sr(t, M.close, M.close + 1.3), hall: 13, hl: [flk(t, 12, .3, .15) * .7, flk(t + 3, 9, .5, .05) * .5], ajar: 1, hemi: .22, fogD: .07, fog: 0x06100c });
  { const tn = sr(t, Ln.p3.start + .4, M.cut + .5); pose(vecino, { t: 0, x: .48, z: .05, ry: PI, noblink: 1, hyAbs: tn * 1.97, eye: 1 + tn * .25, pupil: 1 - tn * .4, smile: sr(t, M.cut, M.cut + .6) * .5 }) }
  if (t < M.close + 1.4) pose(sil, { t: 0, x: lerp(-.7, 0, sr(t, 0, 2)), z: lerp(-4.9, -2.3, sr(t, .5, M.close + 1.2)), ry: .05, glow: .9, noblink: 1, hr: .18, eye: .7, pupil: .05 });
  const fear = sr(t, Ln.h3.end - .6, M.sting + .3);
  mirrorMe(t, c, { eye: 1 + fear * .28, pupil: 1 - fear * .35, brow: 1, tremble: fear * 1.5, noblink: fear > .5 });
  arms(t, { press: win(t, -1, Ln.h1.end - .2, .1, .4) });
  setCam(c, t, cl(c.fov / 55, .15, 1) * ((dn ? 1.5 : .9) + (scare ? 1.5 : 0)), 0, (scare && t - M.sting < .3 ? 1 : 0) + (cut ? .15 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 400, tint: 'rgba(20,90,50,.22)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .09 ? .45 : 0,
    alert: { k: Math.min(ramp(t, M.interbuzz + .1, M.interbuzz + .45), 1 - ramp(t, M.cut + .2, M.cut + .5)), buzz: t < M.interbuzz + 1.3 ? 1 : 0, kk: 'INTERCOMUNICADOR · AHORA', m: cut ? 'SIN SEÑAL' : 'PORTERÍA', s: cut ? 'Llamada finalizada.' : 'Llamada entrante…', col: cut ? ['#5a6068', '#2e3238'] : ['#1f9a5b', '#0c5a34'] },
    end: ENDQ(t - M.endcard, 'TE DAS VUELTA', 'MIRÁS EL ESPEJO', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const PT = [-2.4, 1.5, -3.9], lob = t >= M.openpb, md = Math.min(sr(t, M.open13 + .5, M.open13 + 1.6), 1 - sr(t, M.close, M.close + 1.1));
  K3 = K3 || path([[0, Em, MT, 48], [Ln.h1.end, Em, MT, 44], [Ln.v1.end, Em, [-.3, 1.52, .8], 38], [Ln.v2.end, Em, [-.3, 1.52, .8], 33], [M.open13 + 1.3, Em, MT, 52], [M.steps, Em, MT, 48], [M.close + 1.0, Em, MT, 46],
    [M.down + 1.1, Ec, DISP, 34], [M.pb, Ec, DISP, 28], [M.openpb + .4, Ec, DOORT, 66], [Ln.h4.start + .3, Ec, [0, 1.4, -4], 68], [Ln.h4.end + .3, [.1, 1.56, -1.6], [-1.5, 1.45, -3.9], 64], [Ln.y1.start, [.3, 1.56, -2.4], PT, 54], [Ln.p1.end, [.3, 1.56, -2.6], PT, 48],
    [M.mirror + 1.4, [.2, 1.56, -3.0], [2, 1.4, -3.2], 72], [Ln.h5.end, [.3, 1.56, -3.05], [2, 1.4, -3.2], 68], [M.sting + 1, [.4, 1.56, -3.1], [2, 1.4, -3.2], 62], [C.dur, [.42, 1.56, -3.1], [2, 1.4, -3.2], 60]]);
  const c = evalPath(K3, t), down = t > M.down && t < M.pb, scare = t > M.sting && t < M.sting + 1, calm = sr(t, M.close + .8, M.down + 1);
  const fl = t < M.down + .4 ? 13 : t >= M.pb - .15 ? 'PB' : [12, 10, 8, 6, 4, 2, 1][Math.min(6, Math.floor(ramp(t, M.down + .4, M.pb - .15) * 7))];
  if (!lob || t < M.openpb + .01) env({ lit: lerp(.5 * flk(t, 11, .15, .45), .95, calm), litC: calm > .5 ? 0xf2f6ff : 0xe6fff0, disp: [fl, down ? -1 : 0], panel: 3, door: 0, hall: 0, mdoor: md, hemi: lerp(.2, .34, calm) });
  else { const op = sr(t, M.openpb, M.openpb + 1.2), cold = sr(t, M.sting - .2, M.sting + .4); env({ lit: .9, disp: ['PB', 0], panel: 0, door: op, hall: 'pb', hemi: .95 - cold * .45, hemiC: 0xfff3dc, bg: 0xdff0ff, fog: 0xf2ead8, fogD: .012, exp: 1.05 + (1 - sr(t, M.openpb + .2, M.openpb + 1.8)) * 1.6 - cold * .25 }); skyM.color.setScalar(1 - cold * .45) }
  const fear = 1 - calm;
  if (!lob) mirrorMe(t, c, { eye: 1.2 + fear * .1, pupil: .7, brow: 1, tremble: fear * 1.5, noblink: 1 });
  else { const pry = .66, lk = V(0, 1.5, -.8), tk = talk('p1', t), pz = { t, z: -3.9, talk: tk, brow: win(t, Ln.y1.end, Ln.p1.end + 1, .4, .6), aR: [-win(t, Ln.p1.start - .3, Ln.p1.end + .2, .4, .5) * 1.1, .2] };
    pose(portero, { ...pz, x: -2.45, ry: pry, look: lk }); pose(porteroR, { ...pz, x: 6.45, ry: -pry, look: V(4, 1.5, -.8), aR: [0, 0], aL: pz.aR }) }
  arms(t, {}); const walking = lob && t > Ln.h4.start && t < M.mirror + 1.2;
  setCam(c, t, cl(c.fov / 55, .15, 1) * (lob ? .8 + (scare ? 1.4 : 0) : down ? 1.5 : 1 + fear * .8), walking ? .12 : 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 330, tint: lob ? (t > M.sting ? 'rgba(40,60,110,.3)' : 'rgba(255,225,150,.16)') : 'rgba(20,90,50,.22)', grain: lob && t > M.sting ? .17 : .1,
    black: 1 - ramp(t, 0, .35), white: Math.max(lob ? 1 - sr(t, M.openpb + .1, M.openpb + 1.3) : sr(t, M.openpb - .25, M.openpb), scare && t - M.sting < .09 ? .5 : 0),
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS HUBIERAS<br>SALIDO EN<br>EL 13?', qs: 124, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

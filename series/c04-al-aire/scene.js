// AL AIRE — radio chica, programa de trasnoche, POV de Carolina (locutora). P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'AL AIRE', title: 'AL AIRE', titleSize: 210, sleeve: 0x6a3a5a, skin: 0xe0b090,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], cosa: ['#ff4558', 'LÍNEA 3 · CABINA B', 1], tel: ['#7dffb0', 'WALTER · TELÉFONO', 1], wal: ['#7dffb0', 'WALTER', 0] } });
// ------------------------------------------------------------------ textures
T.foam = tex(256, 256, (g, w, h) => { g.fillStyle = '#2a2c33'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { const gr = g.createLinearGradient(x, y, x + 32, y + 32); gr.addColorStop(0, '#3e414a'); gr.addColorStop(.5, '#2a2c33'); gr.addColorStop(1, '#1c1d22'); g.fillStyle = gr; g.beginPath(); g.moveTo(x + 16, y + 2); g.lineTo(x + 30, y + 16); g.lineTo(x + 16, y + 30); g.lineTo(x + 2, y + 16); g.fill() } }, 4, 3);
T.carpet = tex(256, 256, (g, w, h) => { g.fillStyle = '#3a2c2a'; g.fillRect(0, 0, w, h); speck(g, w, h, 5000, .25, '20,10,10'); blot(g, w, h, 10, .15, '0,0,0', 60) }, 6, 6);
T.wood = tex(256, 256, (g, w, h) => { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h); for (let i = 0; i < 50; i++) { g.strokeStyle = `rgba(30,15,5,${Math.random() * .35})`; g.lineWidth = 1 + Math.random() * 2; const y = Math.random() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 6, w * .7, y - 6, w, y); g.stroke() } }, 2, 1);
T.sign = tex(512, 160, (g, w, h) => { g.fillStyle = '#c8101a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#fff'; g.font = '900 100px Inter'; g.textAlign = 'center'; g.fillText('AL AIRE', w / 2, 118) });
T.poster = tex(256, 360, (g, w, h) => { g.fillStyle = '#1e3a5a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd95a'; g.font = '900 44px Inter'; g.textAlign = 'center'; g.fillText('FM 97.3', w / 2, 80); g.fillStyle = '#fff'; g.font = '700 26px Inter'; g.fillText('LA TRASNOCHE', w / 2, 130); g.fillText('de 0 a 6', w / 2, 170); blot(g, w, h, 8, .2, '0,0,0', 60) });
T.tape = tex(256, 160, (g, w, h) => { g.fillStyle = '#e8e0c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = '700 22px monospace'; g.textAlign = 'center'; g.fillText('ÚLTIMO PROGRAMA', w / 2, 46); g.fillStyle = '#b0101a'; g.font = '900 46px monospace'; g.fillText('1987', w / 2, 100); g.fillStyle = '#333'; g.fillRect(70, 112, 116, 30); g.fillStyle = '#e8e0c8'; for (const x of [96, 160]) { g.beginPath(); g.arc(x, 127, 10, 0, 7); g.fill() } });
// phone display (dynamic)
const phC = document.createElement('canvas'); phC.width = 256; phC.height = 128; const phX = phC.getContext('2d'); const PHT = new THREE.CanvasTexture(phC); PHT.colorSpace = THREE.SRGBColorSpace; let phLast = '';
function drawPh(on, txt) { const k = on + txt; if (k == phLast) return; phLast = k; const g = phX; g.fillStyle = '#0a1a10'; g.fillRect(0, 0, 256, 128); g.fillStyle = on ? '#9dff8a' : '#2a4a2a'; g.font = '900 34px monospace'; g.textAlign = 'center'; g.fillText(txt.split('|')[0], 128, 46); g.font = '700 28px monospace'; g.fillText(txt.split('|')[1] || '', 128, 86); PHT.needsUpdate = true }
// ------------------------------------------------------------------ world: studio (z > -1.7) and booth B (z < -1.7)
const W = grp(scene), foamM = new THREE.MeshLambertMaterial({ map: T.foam }), carpM = new THREE.MeshLambertMaterial({ map: T.carpet }), woodM = new THREE.MeshLambertMaterial({ map: T.wood });
const fl = add(W, new THREE.PlaneGeometry(4.2, 7), carpM, 0, 0, -1.2, 2); fl.rotation.x = -PI / 2;
box(W, 4.2, .1, 7, mat(0x202228), 0, 2.85, -1.2, 0);
for (const s of [-1, 1]) box(W, .1, 2.9, 7, foamM, s * 2.1, 1.45, -1.2, 2);
box(W, 4.2, 2.9, .1, foamM, 0, 1.45, 2.3, 2); box(W, 4.2, 2.9, .1, foamM, 0, 1.45, -4.6, 2);
// partition wall with window (x -1.2..1.2, y .95..2.15) at z = -1.7
box(W, .9, 2.9, .22, foamM, -1.65, 1.45, -1.7, 2); box(W, .9, 2.9, .22, foamM, 1.65, 1.45, -1.7, 2); box(W, 2.4, .95, .22, foamM, 0, .475, -1.7, 2); box(W, 2.4, .7, .22, foamM, 0, 2.5, -1.7, 2);
const frM = mat(0x18191c); box(W, 2.5, .06, .26, frM, 0, .95, -1.7, 0); box(W, 2.5, .06, .26, frM, 0, 2.15, -1.7, 0); for (const x of [-1.22, 1.22]) box(W, .06, 1.26, .26, frM, x, 1.55, -1.7, 0);
const glassM = new THREE.MeshPhongMaterial({ color: 0x8aa0b8, transparent: true, opacity: .12, specular: 0xffffff, shininess: 120, depthWrite: false }); add(W, new THREE.PlaneGeometry(2.4, 1.2), glassM, 0, 1.55, -1.62, 0);
add(W, new THREE.PlaneGeometry(.7, 1.0), new THREE.MeshLambertMaterial({ map: T.poster }), 2.04, 1.6, -.4, 0).rotation.y = -PI / 2;
// studio desk, console, mic, phone
box(W, 2.6, .06, .95, woodM, 0, .78, -.62, 3); box(W, .06, .78, .9, mat(0x2a1a10), -1.25, .39, -.62, 0); box(W, .06, .78, .9, mat(0x2a1a10), 1.25, .39, -.62, 0);
const CON = grp(W); CON.position.set(.25, .81, -.7); box(CON, 1.1, .07, .5, mat(0x2c2e34), 0, .035, 0, 3);
const FAD = []; for (let i = 0; i < 8; i++) { box(CON, .015, .005, .22, mat(0x0a0a0a), -.45 + i * .13, .075, .02, 0); FAD.push(box(CON, .05, .03, .03, mat(0xd8d8d8), -.45 + i * .13, .09, .08, 0)) }
const LEDS = []; for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { const m = new THREE.MeshBasicMaterial({ color: j > 3 ? 0xff3030 : j > 2 ? 0xffc030 : 0x40ff60 }); LEDS.push([add(CON, new THREE.BoxGeometry(.03, .01, .02), m, -.45 + i * .13, .075, -.2 + j * .03, 0), i, j]) }
const micArm = add(W, G.cyl, mat(0x1a1a1a), -.5, 1.0, -.62, 0); micArm.scale.set(.015, .45, .015); const MIC = grp(W); MIC.position.set(-.42, 1.2, -.36); MIC.rotation.x = -1.2;
caps(MIC, .045, .17, mat(0x2a2a2a), 0, 0, 0, 0); const pop = add(MIC, new THREE.CircleGeometry(.07, 20), new THREE.MeshLambertMaterial({ color: 0x111111, transparent: true, opacity: .6, side: THREE.DoubleSide }), 0, .16, 0, 0); pop.rotation.x = PI / 2;
const PH = grp(W); PH.position.set(-.78, .81, -.55); PH.rotation.y = .35; box(PH, .32, .06, .22, mat(0x1e1f22), 0, .03, 0, 3); const phD = add(PH, new THREE.PlaneGeometry(.18, .09), new THREE.MeshBasicMaterial({ map: PHT }), 0, .064, -.03, 0); phD.rotation.x = -PI / 2 + .25;
const lineM = new THREE.MeshBasicMaterial({ color: 0x331010 }); for (let i = 0; i < 4; i++) box(PH, .04, .015, .03, i == 2 ? lineM : mat(0x333333), -.09 + i * .06, .065, .07, 0);
const lineG = glowSprite(PH, 0xff3030, .12, .03, .08, .07);
const lampL = new THREE.PointLight(0xffb070, 0, 6, 1.3); lampL.position.set(-.95, 1.45, -.75); W.add(lampL); const LAMP = grp(W); LAMP.position.set(-1.05, .81, -.85); add(LAMP, G.cyl, mat(0x222222), 0, .3, 0, 0).scale.set(.012, .6, .012); const shade = add(LAMP, new THREE.ConeGeometry(.12, .14, 16, 1, true), mat(0x3a3a3a, { side: THREE.DoubleSide }), .08, .6, .05, 0); const bulbM = basic(0xffd8a0); sph(LAMP, .03, bulbM, .08, .55, .05, 0);
const fillL = new THREE.PointLight(0x8090c0, 0, 8, 1.2); fillL.position.set(1.2, 2.2, .8); W.add(fillL);
const ceilL = new THREE.PointLight(0xf0f4ff, 0, 10, 1.1); ceilL.position.set(0, 2.6, .3); W.add(ceilL); const ceilM = basic(0xffffff); box(W, 1.2, .03, .3, ceilM, 0, 2.79, .3, 0);
const chairS = grp(W); chairS.position.set(0, 0, .5); box(chairS, .5, .08, .5, mat(0x1a1a1a), 0, .5, 0, 3); box(chairS, .5, .6, .06, mat(0x1a1a1a), 0, .85, .25, 0);
// booth B
const fl2 = add(W, new THREE.PlaneGeometry(4.2, 2.9), mat(0x24262b), 0, .002, -3.15, 2); fl2.rotation.x = -PI / 2;
box(W, 2.2, .06, .7, woodM, 0, .78, -2.2, 3); box(W, 2.2, .72, .06, mat(0x2a1a10), 0, .4, -1.88, 0);
const CON2 = grp(W); CON2.position.set(.3, .81, -2.2); box(CON2, .9, .07, .4, mat(0x2c2e34), 0, .035, 0, 3); for (let i = 0; i < 6; i++) box(CON2, .05, .03, .03, mat(0xbcbcbc), -.35 + i * .14, .09, .05, 0);
const TAPE = grp(W); TAPE.position.set(-.35, .82, -2.15); TAPE.rotation.y = .3; box(TAPE, .2, .025, .13, mat(0x1a1a1a), 0, .012, 0, 0); const tl_ = add(TAPE, new THREE.PlaneGeometry(.18, .11), new THREE.MeshLambertMaterial({ map: T.tape }), 0, .026, 0, 0); tl_.rotation.x = -PI / 2;
const chairB = grp(W); chairB.position.set(0, 0, -2.95); box(chairB, .5, .08, .5, mat(0x1a1a1a), 0, .5, 0, 3); box(chairB, .5, .6, .06, mat(0x1a1a1a), 0, .85, -.25, 0);
const SIGN = add(W, new THREE.PlaneGeometry(1.3, .4), new THREE.MeshBasicMaterial({ map: T.sign }), 0, 2.1, -4.53, 0); const signG = glowSprite(W, 0xff2020, 3.2, 0, 2.1, -4.4);
const signL = new THREE.PointLight(0xff2a2a, 0, 7, 1.2); signL.position.set(0, 2.0, -4.0); W.add(signL);
const boothL = new THREE.PointLight(0xf0f4ff, 0, 6, 1.1); boothL.position.set(0, 2.5, -3.0); W.add(boothL);
// ------------------------------------------------------------------ characters
const ghost = makeChar({ skin: 0x2a2624, shirt: 0x1e1e24, pants: 0x18181c, hair: 0x111114, style: 'short', noface: 1, h: 1.0, seed: 31 });
const HP = grp(ghost.head); { const band = add(HP, new THREE.TorusGeometry(.23, .022, 8, 20, PI), mat(0x111111), 0, .2, 0, 0); band.rotation.z = 0; for (const s of [-1, 1]) { const cup = add(HP, G.cyl, mat(0x0c0c0c), s * .22, .14, 0, 0); cup.scale.set(.08, .06, .08); cup.rotation.z = PI / 2 } }
const gEyes = [-1, 1].map(s => glowSprite(ghost.head, 0xff3030, .09, s * .075, .21, .2));
const walter = makeChar({ skin: 0xc48a62, shirt: 0x4a5a6a, pants: 0x23262e, hair: 0x5a5a5a, style: 'short', stache: 1, h: 1.02, seed: 32 });
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
function env(o) {
  const t = o.t, studio = o.studio ?? 1, con = o.con ?? 1;
  LI(lampL, studio * 7); LI(fillL, studio * 2.2); bulbM.color.setScalar(cl(studio, .1, 1)); LI(ceilL, (o.ceil ?? 0) * 3); ceilM.color.setScalar(cl(o.ceil ?? 0, .15, 1)); LI(boothL, (o.booth ?? 0) * 2.5);
  const sg = o.sign ?? 0; SIGN.material.color.setScalar(cl(sg, .12, 1)); signG.material.opacity = sg * .55; LI(signL, sg * 4);
  for (const [m, i, j] of LEDS) { const lv = con * (.5 + .5 * Math.sin(t * (3 + i) + i * 1.7)) * (o.vu ?? .6) * 5; m.visible = j < lv }
  FAD.forEach((f, i) => f.position.z = .08 - (o.fade ?? 0) * .16 * cl((o.fade ?? 0) * 8 - i * .9));
  const ln = o.line ?? 0; lineM.color.setHex(ln && (t * 2) % 1 < .55 ? 0xff3030 : 0x331010); lineG.material.opacity = ln && (t * 2) % 1 < .55 ? .9 : 0; drawPh(con > 0 || ln, o.ph ?? 'FM 97.3|03:00');
  bg.setHex(0x050507); scene.fog.color.copy(bg); scene.fog.density = .02; hemi.intensity = o.hemi ?? .4; hemi.color.setHex(0xb0b8e0); R.toneMappingExposure = o.exp ?? 1.3;
}
function booth(t, o) {
  if (!o) { ghost.g.visible = false; return }
  const off = o.off ?? 0; // headphones off (0..1)
  pose(ghost, { t, x: 0, z: -2.95, y: .0, sit: 1, ry: 0, hp: o.hp ?? .05, hy: o.hy ?? 0, aR: [-.9 - off * 1.6, .2 + off * .3], aL: [-.9 - off * 1.6, .2 + off * .3], noblink: 1 });
  HP.position.y = off * .12; HP.position.z = off * .05; HP.visible = off < .98; gEyes.forEach(e => e.material.opacity = o.eyes ?? 0);
}
ARMP.ear = t => [[.17, -.08, -.22, .3, -.6, .2], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.fader = t => [[.18 , -.36, -.55, -.6, 0, .1], [.0, -.38, -.55, -.6, 0, -.1]];
ARMP.handset = t => [[-.02, -.25, -.5, .3, 0, -.2], [-.2, -.62, -.3, 0, 0, 0]];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const SEAT = [0, 1.25, .45], WINV = [0, 1.35, -2.8], PHV = [-.78, .85, -.55], CONV = [.25, .82, -.7];
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.2, 3.8) * .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, onair = t > M.onair;
  K1 = K1 || path([[0, [-.45, 1.2, .1], PHV, 34], [2.6, [-.4, 1.22, .2], PHV, 40], [4.2, [-.1, 1.3, 1.2], WINV, 58], [M.studio - .3, [0, 1.3, 1.1], WINV, 54], [Ln.h2.start + 4, [.3, 1.4, 1.4], [0, 1.0, -.6], 56], [M.line, SEAT, [-.3, 1.1, -1.2], 54],
    [M.line + 1.2, [-.45, 1.2, .1], PHV, 38], [M.pick + .2, [-.45, 1.2, .1], PHV, 36], [Ln.y1.start + .5, SEAT, [0, 1.25, -1.5], 50], [Ln.c1.start, SEAT, WINV, 50], [Ln.c1.end, [0, 1.25, .1], WINV, 42], [M.onair, [0, 1.25, .1], WINV, 42], [M.onair + 1.5, [0, 1.28, -.1], WINV, 38],
    [M.sting, [0, 1.28, -.2], WINV, 36], [M.sting + .2, [0, 1.3, -.6], [0, 1.25, -2.95], 30], [C.dur, [0, 1.3, -.6], [0, 1.25, -2.95], 28]]);
  const c = evalPath(K1, t);
  env({ t, studio: 1, con: 1, vu: .6, line: t > M.line - 1 && t < M.pick + .3 || t < M.studio - .2 ? 1 : 0, ph: t > M.pick && t < M.studio + 99 ? (t > M.pick ? 'LÍNEA 3|EN AIRE' : 'LÍNEA 3|CABINA B') : 'LÍNEA 3|CABINA B', sign: onair ? (scare ? flk(t, 18, .3, .4) : 1) * sr(t, M.onair, M.onair + .15) : 0 });
  if (t > M.pick && t < M.pick + 99) drawPh(1, 'LÍNEA 3|CABINA B');
  booth(t, onair ? { eyes: scare ? 1 : 0, hp: .1 } : null);
  arms(t, { handset: win(t, M.pick - .6, M.pick + .8, .4, .4) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.4, .3, .25), titleY: 380, tint: onair ? 'rgba(200,30,40,.12)' : 'rgba(255,170,100,.08)', black: 1 - ramp(t, 0, .3),
    white: scare && t - M.sting < .09 ? .35 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .3,
    end: ENDQ(t - M.endcard, 'CORTÁS LA LLAMADA', 'SEGUÍS AL AIRE', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, song = t > M.song;
  K2 = K2 || path([[0, [0, 1.28, -.1], WINV, 40], [Ln.h1.end, SEAT, WINV, 50], [M.msgs + .5, [.3, 1.35, .7], [.0, 1.0, -.9], 50], [Ln.h2.end, [.3, 1.35, .7], [-.2, 1.1, -1.4], 50], [Ln.y1.start, SEAT, WINV, 48], [Ln.c1.end, [0, 1.27, 0], WINV, 40],
    [M.ring + .4, [.2, 1.25, .5], [-.5, 1.2, -1.6], 52], [Ln.w2.end, [.2, 1.25, .5], [-.4, 1.2, -1.6], 50], [M.song + .5, [.3, 1.3, .2], CONV, 44], [Ln.h3.end, [.3, 1.3, .2], CONV, 40], [Ln.c2.start + .5, [0, 1.27, 0], WINV, 40], [M.sting, [0, 1.27, -.2], WINV, 36], [M.sting + .2, [0, 1.3, -.6], [0, 1.25, -2.95], 30], [C.dur, [0, 1.3, -.6], [0, 1.25, -2.95], 28]]);
  const c = evalPath(K2, t);
  env({ t, studio: 1, con: 1, vu: song ? 1 : .6, sign: scare ? flk(t, 18, .3, .4) : 1, ph: 'LÍNEA 3|EN AIRE' });
  booth(t, { eyes: scare ? 1 : (t > Ln.c1.start ? .25 : 0), hp: .1, hy: Math.sin(t * .6) * .05 });
  arms(t, { ear: win(t, M.ring + .4, Ln.w2.end + .3, .4, .4) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.4 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  const msg = Math.min(ramp(t, M.msgs, M.msgs + .35), 1 - ramp(t, Ln.h2.end + .3, Ln.h2.end + .6));
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(200,30,40,.12)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .09 ? .4 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .3,
    alert: msg > .001 ? { k: msg, buzz: 0, kk: 'MENSAJES DE OYENTES · ' + Math.min(47, Math.floor((t - M.msgs) * 9 + 3)), m: '¿Quién respira atrás tuyo?', s: 'Y muchos mensajes más…', col: ['#2a4a8a', '#152a55'] }
      : { k: Math.min(ramp(t, M.ring + .05, M.ring + .4), 1 - ramp(t, Ln.w2.end + .3, Ln.w2.end + .6)), buzz: t < Ln.w1.start ? 1 : 0, kk: 'LLAMADA', m: 'WALTER · OPERADOR', s: t > Ln.w1.start ? 'En llamada…' : 'Llamando…', col: ['#2a8a5a', '#145a34'] },
    end: ENDQ(t - M.endcard, 'APAGÁS LA CONSOLA', 'ENTRÁS A LA CABINA', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const dark = t > M.off && t < M.morning, morn = t >= M.morning && t < M.night, night = t >= M.night, scare = t > M.sting && t < M.sting + 1.1;
  const TAPEV = [-.35, .84, -2.15];
  K3 = K3 || path([[0, [.3, 1.3, .2], CONV, 46], [Ln.h1.end - 1.5, [.3, 1.3, .2], CONV, 42], [M.off, [0, 1.26, .3], WINV, 50], [Ln.h2.end, [0, 1.26, .1], WINV, 44], [Ln.h3.end, [0, 1.28, -.3], [0, 1.25, -2.95], 36], [M.signoff, [0, 1.28, -.5], [0, 1.25, -2.95], 30], [M.morning - .01, [0, 1.28, -.5], [0, 1.25, -2.95], 30],
    [M.morning, [-.1, 1.5, -1.55], TAPEV, 46], [Ln.h4.end, [-.2, 1.3, -1.8], TAPEV, 36], [Ln.w1.start + .3, [.3, 1.55, -1.95], [-.8, 1.5, -3.8], 50], [M.night - .01, [.3, 1.55, -1.95], [-.8, 1.55, -3.8], 46],
    [M.night, SEAT, WINV, 52], [M.sting - .6, [-.4, 1.2, .1], PHV, 40], [M.sting + .1, [-.4, 1.2, .1], PHV, 34], [M.sting + .3, [0, 1.26, .2], WINV, 36], [C.dur, [0, 1.26, .1], WINV, 32]]);
  const c = evalPath(K3, t);
  if (!morn) {
    const lit = t < M.off || night; env({ t, studio: lit ? 1 : 0, con: lit ? 1 : 0, vu: 1, fade: sr(t, .3, Ln.h1.end - 1.5), sign: night ? (t > M.sting ? flk(t, 10, .2, .3) : 0) : (t < M.signoff ? 1 : 0), line: night ? 1 : 0, ph: 'LÍNEA 3|CABINA B', hemi: dark ? .15 : night ? .3 : .4, exp: dark ? 1.5 : 1.3 });
    booth(t, night ? (t > M.sting ? { eyes: 1 } : null) : t < M.signoff ? { off: sr(t, Ln.h3.start + .5, Ln.h3.end), eyes: t > Ln.c1.start ? .8 : .2, hp: .05 } : null);
  } else {
    env({ t, studio: 1, con: 0, ceil: 1, booth: 1, sign: 0, hemi: .5, exp: 1.1 });
    pose(walter, { t, x: -.8, z: -3.8, ry: .15, look: cam.position, talk: talk('w1', t), brow: .4, aR: [-.3, .1] });
  }
  arms(t, { fader: win(t, .2, Ln.h1.end - .8, .3, .4), reach: dark ? 0 : 0 });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.3 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: morn ? 'rgba(255,200,140,.1)' : 'rgba(200,30,40,.1)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .3), win(t, M.off - .05, M.off + .25, .02, .25) * .8, win(t, M.signoff, M.morning + .3, .1, .3), win(t, M.night - .3, M.night + .3, .25, .3)), white: scare && t - M.sting < .09 ? .35 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS<br>ATENDERÍAS LA<br>LÍNEA 3?', qs: 124, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

// CAJERO 24 — cajero automático de esquina, de madrugada, POV de Matías. P1/P2/P3 son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, phone, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, flash, run } from './core.js';
init({ tag: 'CAJERO 24', title: 'CAJERO 24', titleSize: 180, sleeve: 0x3a3f4a, skin: 0xd8a47f,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], cosa: ['#ff4558', 'AFUERA', 1], tel: ['#7dffb0', 'FEDE · TELÉFONO', 1], kio: ['#ffb84d', 'LA DEL QUIOSCO', 0] } });
// ------------------------------------------------------------------ textures
T.tile = tex(256, 256, (g, w, h) => { g.fillStyle = '#b9b4a8'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = `rgba(0,0,0,${.04 + Math.random() * .06})`; g.fillRect(i * 64 + 1, j * 64 + 1, 62, 62) } speck(g, w, h, 1500, .12); g.strokeStyle = 'rgba(40,40,40,.5)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke() } }, 4, 5);
T.wall = tex(256, 256, (g, w, h) => { g.fillStyle = '#d6d2c8'; g.fillRect(0, 0, w, h); blot(g, w, h, 20, .08, '80,70,60', 70); speck(g, w, h, 1200, .08) }, 2, 2);
T.side = tex(256, 256, (g, w, h) => { g.fillStyle = '#4a4f58'; g.fillRect(0, 0, w, h); blot(g, w, h, 14, .12, '10,10,20', 70); g.fillStyle = 'rgba(255,255,255,.08)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 2) }, 1, 2);
T.walk = tex(256, 256, (g, w, h) => { g.fillStyle = '#9a958c'; g.fillRect(0, 0, w, h); speck(g, w, h, 2500, .2); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(0, 0, w, h) }, 16, 3);
T.road = tex(256, 256, (g, w, h) => { g.fillStyle = '#25272b'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .25, '110,110,110'); blot(g, w, h, 8, .2, '0,0,0', 60) }, 30, 4);
T.facade = tex(256, 256, (g, w, h) => { g.fillStyle = '#5f5a54'; g.fillRect(0, 0, w, h); blot(g, w, h, 25, .15, '20,20,20', 80); speck(g, w, h, 2000, .15); g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 1) }, 4, 3);
T.bldg = tex(256, 512, (g, w, h) => { g.fillStyle = '#2c2a2e'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const on = Math.random() < .14; g.fillStyle = on ? '#ffcf80' : '#121318'; g.fillRect(16 + c * 60, 20 + r * 62, 36, 40) } }, 1, 1);
T.sign = tex(512, 128, (g, w, h) => { g.fillStyle = '#0e3b66'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 78px Inter'; g.textAlign = 'center'; g.fillText('CAJERO 24 HS', w / 2, 92) });
T.out = tex(512, 256, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8141f'; g.font = '900 54px Inter'; g.textAlign = 'center'; g.fillText('FUERA DE', w / 2, 100); g.fillText('SERVICIO', w / 2, 160); g.fillStyle = '#222'; g.font = '700 34px Inter'; g.fillText('DESDE 2019', w / 2, 215) });
T.ply = tex(256, 256, (g, w, h) => { g.fillStyle = '#a8865a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(90,60,30,${Math.random() * .3})`; g.lineWidth = 1 + Math.random() * 3; g.beginPath(); const y = Math.random() * h; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 10, w * .6, y - 10, w, y + 5); g.stroke() } speck(g, w, h, 600, .15) });
T.kiosk = tex(256, 256, (g, w, h) => { g.fillStyle = '#3a3d42'; g.fillRect(0, 0, w, h); const P = ['#d23a2c', '#f2c230', '#2f7fd0', '#e8e2d0', '#3aa35a']; for (let r = 0; r < 4; r++) for (let x = 4; x < w - 20; x += 22) { g.fillStyle = P[Math.floor(Math.random() * 5)]; g.fillRect(x, r * 64 + 14, 18, 44) } });
T.kSign = tex(512, 128, (g, w, h) => { g.fillStyle = '#f2c230'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.font = '900 76px Inter'; g.textAlign = 'center'; g.fillText('QUIOSCO', w / 2, 92) });
// ATM screen (dynamic canvas)
const scC = document.createElement('canvas'); scC.width = 512; scC.height = 384; const scX = scC.getContext('2d'); const SCR = new THREE.CanvasTexture(scC); SCR.colorSpace = THREE.SRGBColorSpace; let scLast = '';
function wrapTxt(g, s, x, y, lh) { s.split('|').forEach((l, i) => g.fillText(l, x, y + i * lh)) }
function drawScr(mode, a = '') {
  const k = mode + a; if (k == scLast) return; scLast = k; const g = scX, w = 512, h = 384; g.textAlign = 'center';
  const bgc = { boot: '#0d4a86', hola: '#0d4a86', warn: '#7a0c12', btn: '#0d4a86', stay: '#3a0608', count: '#3a0608', ok: '#0c4a24', off: '#020304' }[mode] || '#0d4a86';
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, bgc); gr.addColorStop(1, '#03070c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  if (mode == 'off') { SCR.needsUpdate = true; return }
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 0, w, 44); g.fillStyle = '#fff'; g.font = '700 24px Inter'; g.fillText('CAJERO 24 HS  ·  ' + (a || '02:50'), w / 2, 31);
  g.fillStyle = '#fff';
  if (mode == 'boot') { g.font = '700 34px Inter'; wrapTxt(g, 'Procesando…|Aguarde un momento', w / 2, 180, 50) }
  if (mode == 'hola') { g.font = '900 64px Inter'; wrapTxt(g, 'HOLA,|MATÍAS.', w / 2, 175, 76) }
  if (mode == 'warn') { g.font = '900 60px Inter'; wrapTxt(g, 'NO TE DES|VUELTA', w / 2, 175, 72) }
  if (mode == 'btn') { g.font = '900 40px Inter'; g.fillText('¿LO DEJÁS ENTRAR?', w / 2, 120);
    for (const [y, t, c] of [[170, 'ABRIR PUERTA', '#c8141f'], [270, 'CANCELAR', '#2a4f7a']]) { g.fillStyle = c; g.fillRect(56, y, 400, 76); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(56, y, 400, 76); g.fillStyle = '#fff'; g.font = '900 40px Inter'; g.fillText(t, w / 2, y + 52) } }
  if (mode == 'stay') { g.font = '900 46px Inter'; wrapTxt(g, 'QUEDATE ADENTRO|HASTA LAS 3:00', w / 2, 170, 64) }
  if (mode == 'count') { g.font = '700 36px Inter'; g.fillText('NO ABRAS. FALTAN:', w / 2, 140); g.font = '900 120px monospace'; g.fillText(a.slice(3), w / 2, 280) }
  if (mode == 'ok') { g.font = '900 96px monospace'; g.fillText('03:00', w / 2, 170); g.font = '900 54px Inter'; g.fillText('YA SE FUE.', w / 2, 260) }
  SCR.needsUpdate = true;
}
// fog-writing on the glass
const fgC = document.createElement('canvas'); fgC.width = 512; fgC.height = 512; const fgX = fgC.getContext('2d'); const FOGT = new THREE.CanvasTexture(fgC); FOGT.colorSpace = THREE.SRGBColorSpace; let fgLast = -1;
const fogBlots = Array.from({ length: 30 }, (_, i) => [hash(i) * 512, hash(i + 50) * 512, 40 + hash(i + 99) * 80, hash(i + 7) * .25]);
function drawFog(k) { const q = Math.round(k * 40); if (q == fgLast) return; fgLast = q; const g = fgX; g.clearRect(0, 0, 512, 512); g.fillStyle = 'rgba(210,220,230,.55)'; g.fillRect(0, 0, 512, 512);
  for (const [x, y, r, a] of fogBlots) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) }
  g.save(); g.globalCompositeOperation = 'destination-out'; g.font = '900 120px Inter'; g.textAlign = 'center'; g.lineWidth = 16; g.lineCap = 'round'; g.strokeStyle = '#000';
  g.beginPath(); g.rect(0, 0, 512 * cl(k * 2), 260); g.rect(0, 260, 512 * cl(k * 2 - 1), 252); g.clip(); g.strokeText('TE', 256, 220); g.strokeText('ESPERO', 256, 380); g.restore(); FOGT.needsUpdate = true }
// receipt
T.rec = tex(256, 512, (g, w, h) => { g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.textAlign = 'center'; g.font = '700 26px monospace'; g.fillText('CAJERO 24 HS', w / 2, 50); g.fillText('--------------', w / 2, 84); g.textAlign = 'left'; g.font = '700 24px monospace';
  ['FECHA   HOY', 'HORA    03:00', 'CLIENTE MATIAS', '', 'RETIRO  $ 0', ''].forEach((l, i) => g.fillText(l, 20, 130 + i * 36)); g.fillStyle = '#b0101a'; g.font = '900 28px monospace'; g.fillText('VISITAS: 1', 20, 360); g.fillText('PROXIMA:', 20, 400); g.fillText('MAÑANA 02:50', 20, 440) });
// ------------------------------------------------------------------ world
const W = grp(scene);
const fl = add(W, new THREE.PlaneGeometry(3, 3.8), new THREE.MeshLambertMaterial({ map: T.tile }), 0, 0, -.3, 2); fl.rotation.x = -PI / 2;
const wallM = new THREE.MeshLambertMaterial({ map: T.wall }), sideM = new THREE.MeshLambertMaterial({ map: T.side });
box(W, 3, 2.8, .1, wallM, 0, 1.4, -2.25, 2); for (const s of [-1, 1]) box(W, .1, 2.8, 3.9, sideM, s * 1.55, 1.4, -.3, 2);
box(W, 3.2, .1, 3.9, mat(0xe8e6e0), 0, 2.85, -.3, 0);
const tubeM = basic(0xffffff); box(W, .16, .05, 1.6, tubeM, 0, 2.79, -.6, 0); const tubeL = new THREE.PointLight(0xe8f4ff, 0, 9, 1.1); tubeL.position.set(0, 2.55, -.5); W.add(tubeL);
// ATM
const ATM = grp(W); ATM.position.set(0, 0, -1.92);
box(ATM, 1.0, 1.8, .62, mat(0x9aa0a8), 0, .9, 0, 3); box(ATM, 1.02, .5, .64, mat(0x0e3b66), 0, 2.05, 0, 0); add(ATM, new THREE.PlaneGeometry(.95, .24), basic(0xffffff, { map: T.sign }), 0, 2.05, .325, 0);
box(ATM, .7, .52, .05, mat(0x2a2d33), 0, 1.36, .32, 0); const scr = add(ATM, new THREE.PlaneGeometry(.6, .45), new THREE.MeshBasicMaterial({ map: SCR }), 0, 1.36, .346, 0);
const shelf = box(ATM, .8, .05, .32, mat(0x60656d), 0, 1.0, .45, 3); shelf.rotation.x = .25;
for (let i = 0; i < 12; i++) box(ATM, .07, .02, .06, mat(0xd8dade), -.12 + (i % 3) * .1, 1.04 - Math.floor(i / 3) * .018, .38 + Math.floor(i / 3) * .07, 0);
const slotM = basic(0x30ff70); box(ATM, .14, .02, .02, slotM, .3, 1.12, .33, 0); box(ATM, .22, .03, .02, mat(0x111111), 0, .8, .32, 0);
const REC = add(ATM, new THREE.PlaneGeometry(.09, .18), new THREE.MeshLambertMaterial({ map: T.rec, side: THREE.DoubleSide }), .3, 1.12, .36, 0);
const scrL = new THREE.PointLight(0x7ab0ff, 0, 4, 1.4); scrL.position.set(0, 1.4, -1.1); W.add(scrL);
// front glass + door (z = 1.6)
const glassM = new THREE.MeshPhongMaterial({ color: 0x9ab8c8, transparent: true, opacity: .13, specular: 0xffffff, shininess: 90, depthWrite: false });
add(W, new THREE.PlaneGeometry(3, 2.8), glassM, 0, 1.4, 1.6, 0); const frM = mat(0x2c2e32);
for (const x of [-1.5, -.62, .62, 1.5]) box(W, .07, 2.8, .1, frM, x, 1.4, 1.6, 0); box(W, 3.1, .08, .1, frM, 0, 2.48, 1.6, 0); box(W, 3.1, .08, .12, frM, 0, .04, 1.6, 0);
const DOOR = grp(W); DOOR.position.set(-.6, 0, 1.6); box(DOOR, .05, .9, .05, mat(0xb8bcc0), 1.08, 1.1, -.08, 0);
add(DOOR, new THREE.PlaneGeometry(1.2, 2.4), glassM, .6, 1.24, 0, 0); box(DOOR, 1.2, .06, .06, frM, .6, .06, 0, 0); box(DOOR, 1.2, .06, .06, frM, .6, 2.42, 0, 0);
const FOGP = add(W, new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: FOGT, transparent: true, depthWrite: false, opacity: 0 }), 0, 1.45, 1.56, 0); FOGP.rotation.y = PI;
// boards (P3 day/night)
const BOARD = grp(W); for (let i = 0; i < 5; i++) { const b = box(BOARD, 3.0, .5, .04, new THREE.MeshLambertMaterial({ map: T.ply }), 0, .3 + i * .52, 1.68, 2); b.rotation.z = (hash(i) - .5) * .05 } add(BOARD, new THREE.PlaneGeometry(.9, .45), new THREE.MeshLambertMaterial({ map: T.out }), .4, 1.5, 1.715, 0);
// facade + street
const facM = new THREE.MeshLambertMaterial({ map: T.facade });
box(W, 6.5, 8, .3, facM, -4.75, 4, 1.78, 2); box(W, 6.5, 8, .3, facM, 4.75, 4, 1.78, 2); box(W, 3.1, 5.2, .3, facM, 0, 5.4, 1.78, 2);
add(W, new THREE.PlaneGeometry(3.4, .3), basic(0xffffff, { map: T.sign }), 0, 3.15, 1.95, 0);
const wk = add(W, new THREE.PlaneGeometry(40, 3), new THREE.MeshLambertMaterial({ map: T.walk }), 0, .02, 3.4, 2); wk.rotation.x = -PI / 2;
const rd = add(W, new THREE.PlaneGeometry(80, 9), new THREE.MeshLambertMaterial({ map: T.road }), 0, -.05, 9.4, 2); rd.rotation.x = -PI / 2;
for (let i = 0; i < 6; i++) { const b = add(W, new THREE.PlaneGeometry(7, 16), new THREE.MeshLambertMaterial({ map: T.bldg }), -18 + i * 7.3, 8, 15, 0); b.rotation.y = PI }
const LAMP = grp(W); LAMP.position.set(2.8, 0, 4.4); box(LAMP, .12, 5, .12, mat(0x3a3a3a), 0, 2.5, 0, 1); box(LAMP, .9, .08, .1, mat(0x3a3a3a), -.4, 5, 0, 0); const lampB = box(LAMP, .4, .1, .2, basic(0xffb060), -.8, 4.94, 0, 0);
const lampL = new THREE.PointLight(0xffa04a, 0, 14, 1.2); lampL.position.set(2.0, 4.7, 4.4); W.add(lampL); const lampG = glowSprite(W, 0xffa04a, 2.2, 2.0, 4.85, 4.4);
const lamp2 = new THREE.PointLight(0xffc890, 0, 9, 1.3); lamp2.position.set(-1.5, 3.2, 3.0); W.add(lamp2);
const KIO = grp(W); KIO.position.set(-4.6, 0, 3.6); box(KIO, 2.2, 2.4, 1.4, mat(0x2a6a4a), 0, 1.2, 0, 3); add(KIO, new THREE.PlaneGeometry(1.8, 1.0), new THREE.MeshLambertMaterial({ map: T.kiosk }), 0, 1.4, .71, 0); add(KIO, new THREE.PlaneGeometry(2.0, .45), new THREE.MeshLambertMaterial({ map: T.kSign }), 0, 2.2, .71, 0);
const sun = new THREE.DirectionalLight(0xfff0d8, 0); sun.position.set(-8, 14, 12); W.add(sun, sun.target);
// ------------------------------------------------------------------ characters
const thing = makeChar({ skin: 0x3a3330, shirt: 0x2a2a30, pants: 0x1c1c22, hair: 0x141416, style: 'short', noface: 1, h: 1.1, seed: 21 });
const eyesG = [-1, 1].map(s => glowSprite(thing.head, 0xff3030, .1, s * .075, .21, .2)); const eyeL = new THREE.PointLight(0xff3030, 0, 2, 2); eyeL.position.set(0, .2, .35); thing.head.add(eyeL);
const kiosk = makeChar({ skin: 0xc89a78, shirt: 0x7a3a5a, pants: 0x2a2a3a, hair: 0x8a8a8a, style: 'bun', skirt: 0x3a3a4a, h: .95, seed: 22 });
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
const cN = new THREE.Color(0x06080e), cDay = new THREE.Color(0xa8c4dc);
function env(o) {
  const day = o.day ?? 0, tube = o.tube ?? 1;
  LI(tubeL, tube * 3.4); tubeM.color.setScalar(cl(tube, .08, 1)); LI(scrL, (o.scr ?? 1) * 1.4); LI(lampL, (1 - day) * 30); LI(lamp2, (1 - day) * 10); lampB.material.color.setHex(day ? 0x777777 : 0xffb060); lampG.material.opacity = 1 - day;
  bg.copy(cN).lerp(cDay, day); scene.fog.color.copy(bg); scene.fog.density = o.fogD ?? .018; LI(sun, day * 2.2); hemi.intensity = o.hemi ?? (.28 + day * 1.1); hemi.color.setHex(day ? 0xfff2e0 : 0x9ab0e0);
  R.toneMappingExposure = o.exp ?? 1.3; DOOR.rotation.y = o.door ?? 0; BOARD.visible = !!o.board; slotM.color.setHex(o.slot === 0 ? 0x113311 : 0x30ff70);
  FOGP.material.opacity = o.fog ?? 0; if (o.fog) drawFog(o.write ?? 0); REC.visible = (o.rec ?? 0) > 0; REC.scale.y = Math.max(.01, o.rec ?? 0); REC.position.y = 1.12 - .09 * (o.rec ?? 0);
}
function stalker(t, o) { // figure outside the glass, facing in
  if (!o) { thing.g.visible = false; eyesG.forEach(e => e.material.opacity = 0); LI(eyeL, 0); return }
  const tap = o.tap ? Math.max(0, Math.sin(t * 13)) * o.tap : 0;
  pose(thing, { t, x: o.x ?? .15, z: o.z ?? 2.3, ry: PI, hy: o.hy ?? 0, hp: o.hp ?? .1, hr: o.hr ?? 0, aR: [-(o.arm ?? 1.45) - tap * .15, -.25], aL: [-(o.arm ?? 1.45), -.25], noblink: 1, tremble: o.tr ?? 0 });
  const e = o.eyes ?? 0; eyesG.forEach(s => s.material.opacity = e); LI(eyeL, e * .5);
}
ARMP.card = t => [[.12, -.2, -.62, .2, 0, -.3], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.btn = t => [[.06, -.15, -.6, .5, 0, 0], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.ear = t => [[.17, -.08, -.22, .3, -.6, .2], [-.2, -.62, -.3, 0, 0, 0]];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const SCRV = [0, 1.22, -1.57], DOORV = [.15, 1.45, 2.3], SCRC = [0, 1.5, -.3], SCRF = [.05, 1.55, .1];
const clock = (t, t0, s0) => { const s = Math.max(0, Math.floor(s0 - (t - t0))); return `02:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}` };
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 4.0, 4.6) * .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1;
  K1 = K1 || path([[0, [.2, 1.62, -.2], [-.3, 1.45, 4], 60], [2.2, [.2, 1.62, -.3], [-.2, 1.45, 4], 54], [4.6, [.1, 1.62, .3], SCRV, 56], [M.card - 2, [.1, 1.6, -.1], SCRV, 52], [M.card, [.12, 1.55, -.6], [.2, 1.1, -1.6], 52],
    [M.hola + .5, SCRC, SCRV, 50], [M.noturn + 2, SCRC, SCRV, 46], [M.look, SCRC, SCRV, 46], [M.look + 1.2, [.05, 1.55, -.4], [-.7, 1.4, .9], 52], [Ln.h5.start + 3, [.05, 1.6, -.6], DOORV, 54], [Ln.c1.end, [.08, 1.62, -.2], DOORV, 44],
    [M.buttons + .4, SCRC, SCRV, 50], [M.sting, SCRC, SCRV, 48], [M.sting + .18, [.05, 1.6, -.4], DOORV, 44], [C.dur, [.08, 1.62, -.2], DOORV, 34]]);
  const c = evalPath(K1, t);
  const mode = t < M.card + .4 ? 'off' : t < M.hola ? 'boot' : t < M.noturn ? 'hola' : t < M.buttons ? 'warn' : 'btn';
  drawScr(mode, '02:50'); scr.material.color.setScalar(mode == 'warn' ? flk(t, 6, .2, .6) : 1);
  env({ t, door: (1 - sr(t, .05, .4)) * .9, tube: scare ? flk(t, 16, .45, .1) : (t > M.look ? flk(t, 9, .06, .4) : 1), scr: mode == 'off' ? .2 : 1, slot: 1 });
  stalker(t, t > M.look - .5 ? { arm: 1.45, hp: .15, hy: Math.sin(t * .7) * .05, hr: t > Ln.c1.start ? .25 * sr(t, Ln.c1.start, Ln.c1.start + 1) : 0, eyes: t > M.sting ? 1 : t > Ln.c1.start ? .35 : 0, z: t > M.sting ? 2.05 : 2.3, tap: t > Ln.h5.end && t < Ln.c1.start ? 1 : 0 } : null);
  arms(t, { card: win(t, M.card - 1.3, M.card + .5, .5, .4) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.5 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 380, tint: 'rgba(60,90,160,.12)', black: 1 - ramp(t, 0, .3),
    white: scare && t - M.sting < .09 ? .35 : 0, red: sr(t, M.sting - .1, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.4)) * .3,
    end: ENDQ(t - M.endcard, 'LE ABRÍS', 'APRETÁS CANCELAR', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const scare = t > M.sting && t < M.sting + 1.1, off = t > M.off;
  K2 = K2 || path([[0, SCRC, SCRV, 48], [M.off + .5, SCRC, SCRV, 50], [Ln.h2.end, SCRC, SCRV, 46], [M.knock + .2, [.05, 1.6, -.6], DOORV, 50], [Ln.h3.end, [.1, 1.62, -.2], DOORV, 44],
    [M.ring + .5, [.3, 1.6, -.4], [-.6, 1.4, 1.6], 54], [Ln.e2.end, [.3, 1.6, -.4], [-.4, 1.4, 1.6], 52], [M.count + .3, SCRC, SCRV, 48], [Ln.f2.start + .3, SCRC, SCRV, 48], [Ln.f2.start + 1.4, [.08, 1.62, -.4], DOORV, 46], [M.sting, [.08, 1.62, -.3], DOORV, 42], [M.sting + .2, [.08, 1.62, -.1], DOORV, 34], [C.dur, [.08, 1.62, -.1], DOORV, 32]]);
  const c = evalPath(K2, t);
  const mode = t < M.off ? 'btn' : t < M.count ? 'stay' : 'count'; drawScr(mode, mode == 'count' ? clock(t, M.count, 120) : '02:58');
  env({ t, tube: off ? 0 : 1, scr: 1, fogD: .03, exp: 1.25, hemi: .34 });
  stalker(t, { arm: t > M.sting ? 1.6 : 1.45, hp: .12, hy: t > Ln.f1.start && t < Ln.f1.end ? .15 * Math.sin(t * 2) : 0, eyes: scare ? 1 : (t > Ln.f2.start ? .5 : .2), z: t > M.sting ? 2.0 : 2.3, tap: win(t, M.knock, M.knock + 1.4, .1, .1) + (scare ? 1.5 : 0), tr: scare ? 1 : 0 });
  arms(t, { btn: win(t, 0, Ln.h1.start + 1, .01, .4), ear: win(t, M.ring + .4, Ln.e2.end + .3, .4, .4) });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.5 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: 'rgba(60,90,160,.14)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .09 ? .4 : 0, red: sr(t, M.sting, M.sting + .2) * (1 - sr(t, M.sting + .6, M.sting + 1.3)) * .3,
    alert: { k: Math.min(ramp(t, M.ring + .05, M.ring + .4), 1 - ramp(t, Ln.e2.end + .3, Ln.e2.end + .6)), buzz: t < Ln.e1.start ? 1 : 0, kk: 'LLAMADA', m: 'FEDE', s: t > Ln.e1.start ? 'En llamada…' : 'Llamando…', col: ['#2a8a5a', '#145a34'] },
    end: ENDQ(t - M.endcard, 'ESPERÁS HASTA LAS 3', 'SALÍS CORRIENDO', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const inside = t < M.day, day = t >= M.day && t < M.night, night = t >= M.night, scare = t > M.sting && t < M.sting + 1.1;
  const SEAT = [.7, .75, -.2], OUTV = [-.6, 1.65, 7.5];
  K3 = K3 || path([[0, SEAT, SCRV, 50], [Ln.h1.end, SEAT, SCRV, 44], [M.fog + .3, SEAT, [0, 1.4, 1.6], 50], [Ln.h2.end, [.85, .74, -1.0], [0, 1.4, 1.6], 42], [M.three, [.85, .74, -1.0], [0, 1.4, 1.6], 42], [M.three + .6, [.6, 1.1, -.6], SCRV, 50], [Ln.h3.end, SCRC, SCRV, 48],
    [M.print + .4, [.2, 1.45, -.7], [.3, 1.0, -1.6], 46], [Ln.h4.end + .6, [.3, 1.35, -1.05], [.3, .95, -1.56], 46], [M.day - .01, [.3, 1.35, -1.08], [.3, .95, -1.56], 44],
    [M.day, [-1.2, 1.65, 7.0], [0, 1.5, 1.6], 50], [Ln.h5.end, [-1.4, 1.65, 6.2], [-.4, 1.5, 1.6], 46], [Ln.k1.start + .3, [-1.6, 1.65, 6.0], [-4.0, 1.5, 4.6], 46], [M.night - .01, [-1.8, 1.65, 5.8], [-4.0, 1.55, 4.6], 42],
    [M.night, OUTV, [0, 1.5, 1.6], 46], [M.sting, [-.4, 1.65, 6.5], [0, 1.5, 1.6], 40], [M.sting + .3, [-.3, 1.62, 6.2], [0, 1.5, 1.6], 32], [C.dur, [-.3, 1.62, 6.2], [0, 1.5, 1.6], 30]]);
  const c = evalPath(K3, t);
  if (inside) {
    const done = t > M.three; drawScr(done ? 'ok' : 'count', done ? '03:00' : clock(t, 0, 100));
    env({ t, tube: done && t > M.three + 1.6 ? 1 : 0, exp: 1.25, hemi: .34, fog: sr(t, M.fog, M.fog + 2) * (1 - sr(t, M.three + 1.6, M.three + 3.5)) * .95, write: ramp(t, Ln.h2.start + 2.5, Ln.h2.end), rec: sr(t, M.print, M.print + 1.6), door: t > M.three + 1.7 ? .12 * sr(t, M.three + 1.7, M.three + 2.6) : 0 });
    stalker(t, t < M.three ? { arm: 1.5, hp: .2, eyes: .3, z: 2.2, tr: .3 } : null);
  } else {
    drawScr('ok', '03:00'); env({ t, day: day ? 1 : 0, tube: 0, scr: 0, board: 1, exp: day ? 1.0 : .8, hemi: day ? undefined : .15 }); stalker(t, null);
    if (day) pose(kiosk, { t, x: -3.6, z: 4.6, ry: .3, look: cam.position, talk: talk('k1', t), brow: .4, aR: [-.4, .2] });
  }
  arms(t, { phone: night ? sr(t, Ln.h6.start + .5, Ln.h6.start + 1.4) : 0 });
  setCam(c, t, cl(c.fov / 55, .25, 1) * (1 + (scare ? 1.3 : 0)), 0, scare && t - M.sting < .3 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 380, tint: day ? 'rgba(255,200,140,.1)' : 'rgba(60,90,160,.14)', grain: scare ? .17 : .11,
    black: Math.max(1 - ramp(t, 0, .3), win(t, M.day - .3, M.day + .3, .25, .3), win(t, M.night - .3, M.night + .3, .25, .3)), white: scare && t - M.sting < .09 ? .35 : 0,
    alert: night ? { k: ramp(t, M.sting - .05, M.sting + .3), buzz: t < M.sting + 1.2 ? 1 : 0, kk: 'CAJERO 24 HS · 02:50', m: 'Hola, Matías.', s: 'Te espero.', col: ['#0e3b66', '#06203a'] } : null,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿LE HUBIERAS<br>ABIERTO LA<br>PUERTA?', qs: 124, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

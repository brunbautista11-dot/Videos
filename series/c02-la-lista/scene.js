// LA LISTA — liceo vacío de madrugada, POV del sereno. Las tres partes (P1/P2/P3) son funciones puras del tiempo.
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, hideAll, rig, flash, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, run } from './core.js';
init({ tag: 'LA LISTA', title: 'LA LISTA', titleSize: 220, sleeve: 0x2e3a4c, skin: 0xc9926c,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], profe: ['#ff4558', 'LA PROFESORA', 1], walter: ['#7dffb0', 'WALTER', 0] } });
// ------------------------------------------------------------------ textures
T.tiles = tex(256, 256, (g, w, h) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#3d4a44' : '#c9c4b4'; g.fillRect(x * 128, y * 128, 128, 128) } g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128); g.strokeRect(128, 128, 128, 128); speck(g, w, h, 1400, .18); blot(g, w, h, 10, .12, '30,30,20', 60) }, 2, 16);
const wallTex = (rx, low = '#566f63', up = '#d6cfbb') => tex(256, 512, (g, w, h) => { g.fillStyle = up; g.fillRect(0, 0, w, h); g.fillStyle = low; g.fillRect(0, h * .62, w, h * .38); g.fillStyle = '#2f3d36'; g.fillRect(0, h * .615, w, 8); blot(g, w, h, 14, .1, '60,50,30', 90); speck(g, w, h, 900, .08) }, rx, 1);
T.locker = tex(512, 512, (g, w, h) => { for (let i = 0; i < 4; i++) { const x = i * 128; g.fillStyle = ['#3e6c7c', '#3a6575', '#41707f', '#38606f'][i]; g.fillRect(x, 0, 128, h); g.strokeStyle = '#1c2f36'; g.lineWidth = 5; g.strokeRect(x + 3, 4, 122, h - 8); g.fillStyle = '#20343b'; for (let k = 0; k < 6; k++) g.fillRect(x + 30, 40 + k * 14, 68, 6); g.fillStyle = '#c9c2a8'; g.fillRect(x + 44, 150, 40, 22); g.fillStyle = '#222'; g.font = '700 16px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(String(101 + i), x + 64, 167); g.fillStyle = '#9aa3a6'; g.fillRect(x + 100, 250, 10, 46) } blot(g, w, h, 30, .18, '20,15,10', 50); speck(g, w, h, 1800, .2) }, 7.5, 1);
const skyTex = day => tex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); if (day) { gr.addColorStop(0, '#9cc8f0'); gr.addColorStop(.7, '#ffe2b0'); gr.addColorStop(1, '#ffc888') } else { gr.addColorStop(0, '#05091a'); gr.addColorStop(.7, '#12224a'); gr.addColorStop(1, '#1c2c55') } g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = day ? '#5a6a54' : '#03050a'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, h * .78 - Math.abs(Math.sin(x * .07)) * 30 - (x % 48 ? 0 : 18)); g.lineTo(w, h); g.fill();
  g.strokeStyle = day ? '#e8e2d0' : '#2a3038'; g.lineWidth = 8; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke() });
T.sky = [skyTex(0), skyTex(1)];
T.cork = tex(512, 320, (g, w, h) => { g.fillStyle = '#a7774a'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, .3, '60,30,10'); g.strokeStyle = '#4a2e18'; g.lineWidth = 18; g.strokeRect(0, 0, w, h);
  const P = [['#f2efe2', 'HORARIOS'], ['#ffe98a', 'EXÁMENES'], ['#bfe3ff', 'CLUB DE CIENCIAS'], ['#ffd0d0', 'AVISO'], ['#e0ffd0', 'BIBLIOTECA']]; P.forEach(([c, s], i) => { const x = 40 + (i % 3) * 150, y = 40 + Math.floor(i / 3) * 140; g.save(); g.translate(x + 60, y + 50); g.rotate((hash(i) - .5) * .2); g.fillStyle = c; g.fillRect(-60, -50, 120, 105); g.fillStyle = '#333'; g.font = '800 15px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(s, 0, -24); g.fillStyle = '#888'; for (let k = 0; k < 4; k++) g.fillRect(-45, -8 + k * 14, 90 - k * 12, 4); g.fillStyle = '#c8141f'; g.beginPath(); g.arc(0, -46, 6, 0, 7); g.fill(); g.restore() }) });
T.clock = tex(256, 256, (g, w, h) => { g.fillStyle = '#f4f0e4'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 12; g.stroke(); g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * PI; g.fillRect(128 + Math.sin(a) * 92 - 4, 128 - Math.cos(a) * 92 - 9, 8, 18) } g.lineCap = 'round'; g.lineWidth = 11; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 58, 128); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 128 - 86); g.stroke(); g.fillStyle = '#c8141f'; g.beginPath(); g.arc(128, 128, 9, 0, 7); g.fill() });
T.exit = tex(256, 96, (g, w, h) => { g.fillStyle = '#0f9a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#eaffef'; g.font = '900 54px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SALIDA', w / 2 + 18, h / 2 + 3); g.fillRect(18, 30, 30, 8); g.beginPath(); g.moveTo(14, 34); g.lineTo(30, 20); g.lineTo(30, 48); g.fill() });
T.plate = tex(256, 128, (g, w, h) => { g.fillStyle = '#e9e2cc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2a1a'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#2a1c0c'; g.font = '900 78px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3°B', w / 2, h / 2 + 4) });
T.woodF = tex(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#6b4a2c', '#5e4026', '#734f2f', '#654528'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, i * 32, w, 2); g.fillRect((hash(i) * w) | 0, i * 32, 2, 32) } speck(g, w, h, 1200, .18) }, 4, 4);
T.desk = tex(128, 128, (g, w, h) => { g.fillStyle = '#9a6e40'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,30,10,.35)'; for (let i = 0; i < 30; i++) { g.beginPath(); g.moveTo(0, Math.random() * h); g.lineTo(w, Math.random() * h); g.stroke() } speck(g, w, h, 300, .2) });
// chalk board states: 0 = lista, 1 = nombre borrado, 2 = nombre reescrito
const NAMES = ['Héctor Silva', 'Nelly Pereira', 'Julio Ferreira', 'Ana Duarte'];
const chalk = (g, s, x, y, sz, rot = 0, a = .9, f = 'italic 700') => { g.save(); g.translate(x, y); g.rotate(rot); g.font = `${f} ${sz}px Georgia, serif`; g.fillStyle = `rgba(245,245,235,${a})`; g.shadowColor = 'rgba(255,255,255,.4)'; g.shadowBlur = 3; g.fillText(s, 0, 0); g.restore() };
const boardT = [0, 1, 2].map(st => tex(1024, 340, (g, w, h) => { g.fillStyle = '#1f3a2c'; g.fillRect(0, 0, w, h); blot(g, w, h, 40, .14, '200,220,200', 120); speck(g, w, h, 2500, .12, '230,240,230');
  chalk(g, 'LISTA', 70, 62, 52, -.02, .95, '900'); chalk(g, '3°B  ·  turno noche', 280, 60, 36, -.01, .75); g.strokeStyle = 'rgba(240,240,230,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(66, 78); g.lineTo(560, 74); g.stroke();
  NAMES.forEach((n, i) => { const y = 118 + i * 44; chalk(g, (i + 1) + '. ' + n, 90, y, 36, (hash(i) - .5) * .03, .82); g.strokeStyle = 'rgba(240,240,230,.85)'; g.lineWidth = 5; g.beginPath(); g.moveTo(82, y - 12 + (hash(i + 3) - .5) * 6); g.lineTo(420, y - 10 + (hash(i + 5) - .5) * 8); g.stroke() });
  chalk(g, 'ausente', 470, 140, 30, -.05, .6); chalk(g, 'ausente', 480, 228, 30, .03, .6);
  const yR = 300;
  if (st == 0) chalk(g, '5. Ramón Acosta', 90, yR, 52, -.015, 1, 'italic 900');
  if (st == 1) for (let i = 0; i < 26; i++) { const x = 90 + hash(i) * 400, y = yR - 30 + hash(i + 9) * 40, r = 40 + hash(i + 2) * 50, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(210,220,210,.16)'); gr.addColorStop(1, 'rgba(210,220,210,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) }
  if (st == 2) { chalk(g, '5. RAMÓN ACOSTA', 80, yR + 4, 62, .03, 1, '900'); g.strokeStyle = 'rgba(255,255,245,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, yR + 18); g.lineTo(700, yR + 6); g.stroke() }
  chalk(g, '03:00', 860, 70, 40, .02, .7); g.fillStyle = '#3a2a1a'; g.fillRect(0, h - 10, w, 10) }));
// ------------------------------------------------------------------ world: hallway x∈[-1.6,1.6], z from +1 (entrada) to -24 (fondo)
const HALL = grp(scene), ROOM = grp(scene), HW = 1.6, HH = 3.0;
box(HALL, 3.2, .1, 25.4, mat(0xffffff, { map: T.tiles }), 0, -.05, -11.5); box(HALL, 3.4, .1, 25.4, mat(0xbdb6a4), 0, HH + .05, -11.5, 0);
const wm = rx => mat(0xffffff, { map: wallTex(rx) });
box(HALL, .1, HH, 16.4, wm(8), -HW - .05, HH / 2, -7.2); box(HALL, .1, HH, 7.4, wm(4), -HW - .05, HH / 2, -20.3); box(HALL, .1, .8, 1.2, wm(.6), -HW - .05, 2.6, -16.0);
box(HALL, .45, 1.9, 12, mat(0xffffff, { map: T.locker }), -HW + .22, .95, -7, 3); box(HALL, .47, .04, 12.02, mat(0x23343b), -HW + .22, 1.92, -7, 0);
{ const p = add(HALL, new THREE.PlaneGeometry(1.8, 1.1), mat(0xffffff, { map: T.cork }), -HW + .01, 1.55, -14.3); p.rotation.y = PI / 2 }
{ const p = add(HALL, new THREE.PlaneGeometry(.5, .25), mat(0xffffff, { map: T.plate }), -HW + .01, 2.05, -15.0); p.rotation.y = PI / 2 }
// right wall: windows every 3 m
const skyM = basic(0xffffff, { map: T.sky[0] }), WZ = [];
box(HALL, .1, 1.0, 25.4, wm(10), HW + .05, .5, -11.5); box(HALL, .1, .4, 25.4, wm(10), HW + .05, 2.8, -11.5);
for (let z = .6; z > -24.5; z -= 3) { box(HALL, .12, 1.6, .5, mat(0xd6cfbb), HW + .05, 1.8, z, 2); if (z - 1.5 > -24) { const p = add(HALL, new THREE.PlaneGeometry(2.5, 1.6), skyM, HW + .1, 1.8, z - 1.5); p.rotation.y = -PI / 2; WZ.push(z - 1.5) } }
const patchM = new THREE.MeshBasicMaterial({ map: T.glow, color: 0x6f8fd8, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false });
WZ.forEach(z => { const p = add(HALL, new THREE.PlaneGeometry(2.0, 2.6), patchM, .3, .012, z - .6); p.rotation.x = -PI / 2 });
box(HALL, 3.2, HH, .1, wm(1.2), 0, HH / 2, -24.05); box(HALL, 1.0, 2.1, .06, mat(0x5a4632), .7, 1.05, -23.98, 0);
const exitM = basic(0xffffff, { map: T.exit }); add(HALL, new THREE.PlaneGeometry(.6, .22), exitM, .7, 2.35, -23.97); const exitL = new THREE.PointLight(0x40ff90, 0, 5, 1.6); exitL.position.set(.7, 2.2, -23.6); HALL.add(exitL);
add(HALL, new THREE.CircleGeometry(.28, 28), mat(0xffffff, { map: T.clock }), -.75, 2.4, -23.97);
// entrance wall (z = +1) with glass doors
box(HALL, 1.0, HH, .1, wm(1), -1.1, HH / 2, 1.05); box(HALL, 1.0, HH, .1, wm(1), 1.1, HH / 2, 1.05); box(HALL, 1.2, .8, .1, wm(1), 0, 2.6, 1.05);
const doorSkyM = basic(0xffffff, { map: T.sky[0] }); { const p = add(HALL, new THREE.PlaneGeometry(1.2, 2.2), doorSkyM, 0, 1.1, 1.12); p.rotation.y = PI } box(HALL, .05, 2.2, .06, mat(0x2a2a2a), 0, 1.1, 1.02, 0);
// bell + clock near the entrance (right wall pillar)
const bellG = grp(HALL); bellG.position.set(HW - .02, 2.35, -.0); { const b = add(bellG, new THREE.SphereGeometry(.13, 18, 10, 0, 2 * PI, 0, PI / 2), mat(0xc8141f), -.02, 0, 0); b.rotation.z = PI / 2; box(bellG, .05, .1, .1, mat(0x333333), -.12, 0, 0, 0) }
{ const c = add(HALL, new THREE.CircleGeometry(.24, 28), mat(0xffffff, { map: T.clock }), HW - .01, 2.0, -.55); c.rotation.y = -PI / 2 }
const fixM = basic(0x2a2c30); [-3, -8, -13, -18, -22].forEach(z => box(HALL, .25, .06, 1.4, fixM, 0, HH - .03, z, 0));
const hallL = [-4, -12, -20].map(z => { const l = new THREE.PointLight(0xfff2dc, 0, 11, 1.3); l.position.set(0, 2.7, z); HALL.add(l); return l });
const spillL = new THREE.PointLight(0xdff2ff, 0, 6, 1.4); spillL.position.set(-1.2, 1.5, -16); HALL.add(spillL);
const moon = new THREE.DirectionalLight(0x7f9fe8, 0); moon.position.set(8, 6, -6); moon.target.position.set(0, 0, -10); scene.add(moon, moon.target);
const sun = new THREE.DirectionalLight(0xffd8a0, 0); sun.position.set(8, 4, -2); sun.target.position.set(0, 0, -10); scene.add(sun, sun.target);
// ------------------------------------------------------------------ world: classroom 3°B x∈[-9,-1.6], z∈[-12,-20]
box(ROOM, 7.4, .1, 8, mat(0xffffff, { map: T.woodF }), -5.3, -.05, -16); box(ROOM, 7.4, .1, 8, mat(0xd8d2c0), -5.3, HH + .05, -16, 0);
const rwm = mat(0xffffff, { map: wallTex(3, '#6b7f88', '#dcd6c4') }); box(ROOM, 7.4, HH, .1, rwm, -5.3, HH / 2, -11.95); box(ROOM, 7.4, HH, .1, rwm, -5.3, HH / 2, -20.05); box(ROOM, .1, HH, 8, rwm, -9.05, HH / 2, -16);
const boardM = basic(0xffffff, { map: boardT[0] }); { const p = add(ROOM, new THREE.PlaneGeometry(4.4, 1.46), boardM, -8.97, 1.62, -16); p.rotation.y = PI / 2 }
box(ROOM, .08, 1.6, .08, mat(0x5a3a1e), -8.96, 1.62, -13.75, 0); box(ROOM, .08, 1.6, .08, mat(0x5a3a1e), -8.96, 1.62, -18.25, 0); box(ROOM, .08, .08, 4.6, mat(0x5a3a1e), -8.96, 2.38, -16, 0); box(ROOM, .16, .05, 4.6, mat(0x5a3a1e), -8.92, .87, -16, 0);
box(ROOM, .07, .05, .16, mat(0x2a2a2a), -8.88, .92, -14.6, 0); box(ROOM, .03, .02, .08, basic(0xf0f0e8), -8.88, .9, -15.2, 0);
box(ROOM, .25, .3, .35, mat(0x2a2a2e), -8.88, 2.72, -18.6, 0); { const g2 = add(ROOM, new THREE.CircleGeometry(.11, 20), mat(0x111111), -8.74, 2.72, -18.6); g2.rotation.y = PI / 2 }
box(ROOM, .8, .78, 1.6, mat(0x6b4a2c), -7.8, .39, -17.4, 3); box(ROOM, .86, .05, 1.66, mat(0x4a3018), -7.8, .8, -17.4, 0);
const deskM = mat(0xffffff, { map: T.desk }), metal = mat(0x3a3d42), CH = {};
for (const x of [-3.3, -4.6, -5.95]) for (const z of [-13.2, -14.5, -17.5, -18.8]) { const d = grp(ROOM); d.position.set(x, 0, z); box(d, .5, .04, .62, deskM, 0, .74, 0, 3); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(d, .03, .72, .03, metal, sx * .22, .36, sz * .28, 1); box(d, .44, .02, .55, mat(0x4a3420), 0, .62, 0, 1);
  const c = grp(ROOM); c.position.set(x + .5, 0, z); box(c, .4, .04, .4, deskM, 0, .45, 0, 3); box(c, .04, .42, .38, deskM, .19, .72, 0, 1); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(c, .025, .45, .025, metal, sx * .17, .22, sz * .17, 1); CH[x + '|' + z] = c }
const firstChair = CH['-5.95|-14.5'];
const tubeM = basic(0xffffff); [[-4, -14.2], [-4, -17.8], [-7, -14.2], [-7, -17.8]].forEach(([x, z]) => { box(ROOM, .3, .06, 1.3, mat(0xcfcfcf), x, HH - .04, z, 0); box(ROOM, .08, .04, 1.22, tubeM, x, HH - .09, z, 0) });
const roomL = [[-4, -16], [-7.2, -16]].map(([x, z]) => { const l = new THREE.PointLight(0xe6f6ff, 0, 10, 1.3); l.position.set(x, 2.6, z); ROOM.add(l); return l });
const boardL = new THREE.PointLight(0xe6fff0, 0, 4, 1.4); boardL.position.set(-7.6, 2.4, -16); ROOM.add(boardL);
const doorH = grp(ROOM); doorH.position.set(-1.6, 0, -15.42); box(doorH, .05, 2.2, 1.16, mat(0x6e4b2a), 0, 1.1, -.58, 3); box(doorH, .03, .45, .5, mat(0xa9d0e8, { emissive: 0x223344 }), -.02, 1.6, -.58, 0); box(doorH, .06, .05, .14, mat(0xb8b0a0), .04, 1.0, -1.02, 0);
// ------------------------------------------------------------------ characters
const profe = makeChar({ skin: 0xd4bca8, shirt: 0xeeeeea, pants: 0x2a2a2e, skirt: 0xe8e8e4, hair: 0x15110e, style: 'bun', h: 1.02, noface: true, seed: 6 });
const walter = makeChar({ skin: 0xc9966e, shirt: 0x2f4a6a, pants: 0x2b2b30, hair: 0x5a5a5a, style: 'short', stache: 1, h: 1.0, lean: .03, seed: 7 });
// ------------------------------------------------------------------ props in hand: linterna (right), handy (left), borrador
const handR = rig.children[1], handL = rig.children[3];
const torch = grp(handR); { const b = add(torch, G.cyl, mat(0x1d1f22), 0, .025, -.09, 0); b.scale.set(.026, .22, .026); b.rotation.x = PI / 2; const hd = add(torch, G.cyl, mat(0x3a3d42), 0, .025, -.21, 0); hd.scale.set(.036, .05, .036); hd.rotation.x = PI / 2; const ln = add(torch, new THREE.CircleGeometry(.03, 18), basic(0xfff6e0), 0, .025, -.236, 0); ln.rotation.y = PI }
const walkie = grp(handL); box(walkie, .06, .12, .035, mat(0x16181b), 0, .06, -.02, 0); { const a = add(walkie, G.cyl, mat(0x111111), .02, .16, -.02, 0); a.scale.set(.006, .09, .006) } const wLed = box(walkie, .012, .012, .01, basic(0x40ff70), -.015, .105, -.04, 0);
const eraser = grp(handR); box(eraser, .07, .05, .17, mat(0x2a2a2a), 0, .02, -.08, 0); box(eraser, .072, .015, .172, mat(0xc9c2a8), 0, -.008, -.08, 0);
flash.castShadow = true; flash.shadow.mapSize.set(1024, 1024); flash.shadow.bias = -.002; flash.position.set(.16, -.24, -.62); flash.angle = .42; flash.penumbra = .6;
ARMP.torch = t => [[.17, -.33 + Math.sin(t * 1.7) * .006, -.46, .08, 0, -.08], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.walkie = t => [[.17, -.33, -.46, .08, 0, -.08], [-.09, -.22, -.42, .35, .2, .15]];
ARMP.erase = t => [[.02 + Math.sin(t * 9) * .12, -.12 + Math.cos(t * 9) * .035, -.4, .3, 0, -.2], [-.2, -.62, -.3, 0, 0, 0]];
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
function env(o) {
  const rm = o.room ?? 0; roomL.forEach(l => LI(l, rm * 6)); LI(boardL, rm * 1.6); tubeM.color.setScalar(.08 + rm * 1.2); LI(spillL, rm * (o.spill ?? 3));
  const hl = o.hallL ?? 0; hallL.forEach(l => LI(l, hl * 7)); fixM.color.setScalar(.16 + hl * 1.1);
  const day = o.day ?? 0; skyM.map = doorSkyM.map = T.sky[day > .5 ? 1 : 0]; skyM.color.setScalar(.55 + day * .6); doorSkyM.color.setScalar(.55 + day * .6);
  LI(moon, (o.moon ?? 1) * (1 - day) * .9); LI(sun, day * 2.4); patchM.color.setHex(day > .5 ? 0xffc070 : 0x6f8fd8); patchM.opacity = (o.patch ?? .5) * (day > .5 ? 1.2 : 1);
  LI(exitL, o.exit ?? 1.2); exitM.color.setScalar(.6 + (o.exit ?? 1.2) * .3); boardM.map = boardT[o.board ?? 0];
  LI(flash, (o.torch ?? 0) * 13); doorH.rotation.y = -(o.door ?? 0) * 1.45;
  hemi.intensity = o.hemi ?? .22; hemi.color.setHex(o.hemiC ?? 0x9fb4ff); bg.setHex(o.bg ?? 0x020305); scene.fog.color.setHex(o.fog ?? 0x03050a); scene.fog.density = o.fogD ?? .045; R.toneMappingExposure = o.exp ?? 1.15;
}
function props(w) { torch.visible = (w.torch || 0) + (w.walkie || 0) > .5; walkie.visible = (w.walkie || 0) > .5; eraser.visible = (w.erase || 0) > .5 }
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const BOARD = [-8.97, 1.55, -16], NAME = [-8.97, 1.12, -15.05], SPK = [-8.88, 2.72, -18.6], HALLEND = [.2, 1.5, -23.5], DOORIN = [-9, 1.35, -16];
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  const w0 = Ln.h1.end - .3, wd = M.door - .5;
  K1 = K1 || path([[0, [-.6, 1.65, .5], [HW, 2.2, -.25], 44], [2.6, [-.6, 1.65, .5], [HW, 2.15, -.3], 38], [4.4, [-.2, 1.65, .2], [0, 1.5, -12], 62], [w0, [0, 1.65, -.6], [-.2, 1.45, -14], 64],
    [w0 + 2.6, [.1, 1.65, -4.4], [-1.4, 1.2, -9], 62], [w0 + 5.0, [.2, 1.65, -8.6], [-1.0, 1.4, -17], 60], [wd, [-.2, 1.65, -14.6], [-1.6, 1.3, -16.2], 60], [M.door + .6, [-.9, 1.65, -15.95], DOORIN, 64],
    [Ln.h4.start + 1.4, [-2.4, 1.65, -16], [-5, .7, -13.4], 64], [Ln.h4.end - .3, [-2.6, 1.65, -16.1], [-5, .7, -18.6], 62], [Ln.h5.start + 1.2, [-3.2, 1.65, -16], BOARD, 56], [Ln.h5.end + .2, [-3.4, 1.65, -16], BOARD, 54],
    [Ln.h6.start + 2.0, [-5.6, 1.62, -15.8], [-8.97, 1.2, -15.6], 46], [Ln.h6.end, [-6.3, 1.6, -15.2], NAME, 42], [M.pa + .7, [-6.4, 1.62, -15.8], SPK, 50], [Ln.p2.end, [-6.4, 1.62, -15.8], SPK, 44],
    [M.turn + 1.1, [-.9, 1.65, -16.3], HALLEND, 58], [Ln.h7.end, [-.9, 1.65, -16.3], HALLEND, 38], [M.sting, [-.9, 1.65, -16.3], HALLEND, 34], [M.sting + .6, [-.9, 1.65, -16.3], [.2, 1.5, -20], 46], [C.dur, [-.9, 1.65, -16.3], [.2, 1.5, -20], 44]]);
  const c = evalPath(K1, t), inRoom = t > M.door + .3 && t < M.turn + .6, scare = t > M.sting && t < M.sting + 1, walking = t > w0 && t < wd + .2;
  const rm = t < M.door ? .9 : (scare ? flk(t, 18, .45, .05) : 1) * (t > M.turn ? .9 : 1);
  env({ room: rm * (t > Ln.p2.start ? flk(t, 9, .1, .55) : 1), spill: 3, hallL: 0, moon: 1, patch: .55, exit: 1.2, board: 0, torch: inRoom ? .35 : 1, door: .25 + .75 * sr(t, M.door, M.door + 1.2), hemi: inRoom ? .3 : .22, exp: inRoom ? 1.05 : 1.2 });
  bellG.position.x = HW - .02 + (t < 2.4 ? Math.sin(t * 150) * .004 : 0);
  if (t > M.turn) { const near = t > M.sting; pose(profe, { t, x: near ? .1 : .3, z: near ? -19.6 : -22.6, ry: PI, noblink: 1, hr: near ? .12 : 0, aR: [-.3, .1] }) }
  const w = { torch: 1 }; arms(t, w); props(w);
  setCam(c, t, cl(c.fov / 55, .2, 1) * (scare ? 2.2 : 1), walking ? .14 : 0, (scare && t - M.sting < .35 ? 1 : 0) + (t > M.turn && t < M.turn + .4 ? .3 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.3, .3, .25), titleY: 520, tint: inRoom ? 'rgba(80,170,140,.16)' : 'rgba(50,80,170,.2)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .09 ? .45 : 0,
    red: t > M.sting ? sr(t, M.sting, M.sting + .3) * .3 : 0, end: ENDQ(t - M.endcard, 'DECÍS "PRESENTE"', 'BORRÁS TU NOMBRE', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const CHAIR = [-5.45, .55, -14.5];
  K2 = K2 || path([[0, [-7.2, 1.6, -15.1], [-8.97, 1.18, -15.0], 54], [Ln.h1.end, [-7.1, 1.6, -15.2], [-8.97, 1.2, -15.05], 52], [M.off - .2, [-6.6, 1.63, -15.8], BOARD, 60], [M.off + .3, [-6.6, 1.63, -15.8], BOARD, 60],
    [Ln.h2.end, [-6.4, 1.63, -15.9], [-5, 1.0, -18.4], 64], [M.handy + .8, [-6.4, 1.63, -15.9], [-4.6, .9, -16.6], 62], [Ln.w2.start, [-6.4, 1.63, -15.9], [-4.6, .9, -16.3], 60], [Ln.w3.start + .2, [-6.6, 1.63, -15.7], CHAIR, 58], [M.cut + .6, [-6.6, 1.63, -15.6], CHAIR, 46],
    [M.board + 1.0, [-4.6, 1.62, -15.55], [-8.97, 1.3, -15.45], 54], [Ln.h3.end, [-4.9, 1.62, -15.55], [-8.97, 1.2, -15.4], 50], [Ln.c1.end, [-5.2, 1.62, -15.55], [-8.97, 1.15, -15.4], 46],
    [M.slam + .6, [-6.8, 1.63, -16], [-1.6, 1.3, -16], 54], [Ln.p1.start + .6, [-6.8, 1.63, -16], SPK, 52], [M.sting - .05, [-6.8, 1.63, -16], SPK, 48], [M.sting + .5, [-6.5, 1.63, -16.1], [-8.6, 1.35, -16.5], 56], [C.dur, [-6.5, 1.63, -16.1], [-8.6, 1.35, -16.5], 52]]);
  const c = evalPath(K2, t), dark = t > M.off, scare = t > M.sting && t < M.sting + 1;
  env({ room: dark ? 0 : 1, spill: 0, hallL: 0, moon: .8, exit: 1, board: t < 1.9 ? 0 : t < M.board - .2 ? 1 : 2, torch: dark ? sr(t, M.off + .5, M.off + 1.1) * (t > M.cut && t < M.cut + .7 ? flk(t, 20, .5, .1) : 1) : 0, door: 1 - sr(t, M.slam, M.slam + .25), hemi: dark ? .12 : .3, exp: dark ? 1.25 : 1.05 });
  { const k = sr(t, Ln.w3.start, Ln.w3.end + .8); firstChair.position.x = -5.45 + k * .22; firstChair.rotation.y = k * .18 }
  if (t > M.sting) pose(profe, { t, x: -8.45, z: -16.5, ry: -PI / 2, noblink: 1, aL: [-2.2, .2], aR: [-.2, .1] });
  const hw = win(t, M.handy - .2, M.cut + .4, .4, .4), w = t < Ln.h1.end - .2 ? { erase: 1 } : !dark ? {} : { torch: 1 - hw, walkie: hw };
  arms(t, w); props(w); wLed.visible = t > M.handy && t < M.cut;
  setCam(c, t, cl(c.fov / 55, .2, 1) * (scare ? 2.2 : 1), 0, (scare && t - M.sting < .35 ? 1 : 0) + (t > M.slam && t < M.slam + .3 ? .7 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.0, .3, .25), titleY: 420, tint: dark ? 'rgba(40,70,160,.22)' : 'rgba(80,170,140,.16)', black: 1 - ramp(t, 0, .35), white: scare && t - M.sting < .09 ? .45 : 0,
    alert: { k: Math.min(ramp(t, M.handy + .1, M.handy + .45), 1 - ramp(t, M.cut + .1, M.cut + .4)), buzz: t < M.handy + 1 ? 1 : 0, kk: 'HANDY · CANAL 2', m: 'WALTER · PORTERÍA', s: 'Hablando…', col: ['#1f9a5b', '#0c5a34'] },
    end: ENDQ(t - M.endcard, 'CONTESTÁS', 'SALÍS POR LA VENTANA', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const out = t > M.open + 1.0;
  K3 = K3 || path([[0, [-6.6, 1.63, -15.9], SPK, 50], [Ln.h1.end, [-6.6, 1.63, -15.9], BOARD, 52], [Ln.y1.end + .3, [-6.6, 1.63, -15.9], BOARD, 48], [M.on + 1.6, [-6.2, 1.63, -16], [-3, 1.7, -16], 62], [Ln.p1.end - .4, [-6.2, 1.63, -16], SPK, 54],
    [M.open + .8, [-5.4, 1.65, -16], [-1.6, 1.3, -16], 60], [M.walk + .6, [-1.4, 1.65, -16.0], [0, 1.5, -12], 62], [M.walk + 2.0, [-.1, 1.65, -14.4], [0, 1.5, 1], 64], [Ln.h3.end, [0, 1.65, -9.0], [0, 1.6, 1], 60],
    [Ln.y2.end, [0, 1.65, -7.0], [.1, 1.65, -3], 54], [M.bell + 1.0, [0, 1.65, -7.0], [.1, 1.65, -3], 48], [Ln.w2.end, [0, 1.65, -7.0], [.1, 1.68, -3.6], 40],
    [M.pass + 1.9, [-.3, 1.65, -7.0], [.6, 1.5, -11], 60], [M.turnaround - .2, [-.3, 1.65, -7.0], [-.6, 1.4, -16], 58], [M.turnaround + 1.4, [-.3, 1.65, -7.0], HALLEND, 44], [M.sting, [-.3, 1.65, -7.0], HALLEND, 30], [C.dur, [-.3, 1.65, -7.0], HALLEND, 28]]);
  const c = evalPath(K3, t), scare = t > M.sting && t < M.sting + 1, on = sr(t, M.on + .9, M.on + 1.0), day = out ? 1 : 0;
  env({ room: Math.max(on, t > M.on && t < M.on + 1 ? flk(t, 12, .6, 0) : 0), spill: 2, hallL: out ? (scare ? flk(t, 18, .5, .05) : 1) * (1 - sr(t, M.sting + .3, M.sting + 1.2) * .7) : 0, day, moon: 1, patch: out ? .45 : .5, exit: 1, board: 2, torch: t < M.on + 1 ? 1 : 0, door: sr(t, M.open, M.open + 1.4),
    hemi: out ? .55 - sr(t, M.turnaround, M.sting) * .25 : t > M.on + 1 ? .3 : .14, hemiC: out ? 0xffeedd : 0x9fb4ff, bg: out ? 0x2a2a30 : 0x020305, fog: out ? 0x3a3630 : 0x03050a, fogD: out ? .025 : .045, exp: out ? 1.05 : 1.15 });
  if (out) {
    const tk = talk('w1', t), bl = t > M.bell;
    if (t < M.pass) walk(walter, t, [[Ln.h3.start - .4, .2, .5], [Ln.h3.end + .3, .15, -3.0]], { ryEnd: PI, talk: tk, still: { look: bl ? undefined : cam.position, talk: tk, eye: 1 + sr(t, M.bell, M.bell + .8) * .2, pupil: 1 - sr(t, M.bell, M.bell + .8) * .6, noblink: bl ? 1 : 0 } });
    else walk(walter, t, [[M.pass, .15, -3.0], [M.pass + 2.6, .65, -9.5], [M.pass + 5.2, -.6, -15.6], [M.pass + 6.0, -1.5, -16.0]], { phase: t * 6, still: { vis: false } });
    pose(profe, { t, x: .3, z: -22.6, ry: PI - sr(t, Ln.h5.start + 1.2, M.sting - .2) * PI, noblink: 1, aR: [-.3, .1] });
  }
  const w = t < M.on + 1 ? { torch: 1 } : {}; arms(t, w); props(w);
  const walking = t > M.walk && t < Ln.h3.end + .3;
  setCam(c, t, cl(c.fov / 55, .2, 1) * (scare ? 2.2 : 1), walking ? .13 : 0, scare && t - M.sting < .35 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 420, tint: out ? (t > M.turnaround ? 'rgba(40,60,120,.25)' : 'rgba(255,215,150,.16)') : 'rgba(40,70,160,.22)', grain: out && t > M.sting ? .17 : .11,
    black: 1 - ramp(t, 0, .35), white: Math.max(out ? (1 - sr(t, M.open + 1, M.open + 1.8)) * .45 : 0, scare && t - M.sting < .09 ? .5 : 0),
    end: t > M.endcard ? { k: t - M.endcard, q: '¿VOS LO<br>HUBIERAS<br>FRENADO?', qs: 128, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

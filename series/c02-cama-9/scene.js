// CAMA 9 — guardia nocturna de hospital. Pasillo a lo largo de -Z, office de enfermería en z≈0.5, habitación 9 a la izquierda (x<-1.4).
import { THREE, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, sph, glowSprite, grp, hemi, makeChar, pose, talk, hideAll, rig, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, run, phoneScr } from './core.js';
init({ tag: 'CAMA 9', title: 'CAMA 9', titleSize: 250, sleeve: 0x2f8a86, skin: 0xe0b08c,
  spk: { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], viejo: ['#ff7a6b', 'CAMA 9', 1], elvira: ['#d6a8ff', 'DOÑA ELVIRA', 1], doc: ['#7dffb0', 'DR. FERREIRA', 0], cosa: ['#ff4558', '¿¿??', 1], hab8: ['#d6a8ff', 'HABITACIÓN 8', 1] } });
// ------------------------------------------------------------------ textures
T.vinyl = tex(256, 256, (g, w, h) => { g.fillStyle = '#93a39a'; g.fillRect(0, 0, w, h); speck(g, w, h, 2600, .22); speck(g, w, h, 900, .18, '255,255,255'); blot(g, w, h, 18, .1, '40,60,50', 80); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h) }, 3, 18);
T.wall = tex(128, 512, (g, w, h) => { const k = h * (1 - 1.0 / 2.8); g.fillStyle = '#dcdfd6'; g.fillRect(0, 0, w, h); g.fillStyle = '#6f9a8a'; g.fillRect(0, k, w, h - k); g.fillStyle = '#4f7a6a'; g.fillRect(0, k - 8, w, 8); blot(g, w, h, 10, .08, '60,70,60', 60); speck(g, w, h, 500, .08) }, 6, 1);
T.door = tex(256, 512, (g, w, h) => { g.fillStyle = '#c9b68f'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,50,20,.18)'; for (let i = 0; i < 60; i++) { const x = Math.random() * w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (Math.random() - .5) * 10, h); g.stroke() } g.fillStyle = '#1a2a2c'; g.fillRect(150, 70, 44, 150); g.fillStyle = '#8a8f92'; g.fillRect(0, 440, w, 40); g.fillStyle = '#6a6f72'; g.fillRect(20, 250, 30, 12) });
const plateT = {}; const plate = n => plateT[n] || (plateT[n] = tex(256, 128, (g, w, h) => { g.fillStyle = '#eef2f0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f6f62'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#1d3a34'; g.font = '900 92px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), w / 2, h / 2 + 6) }));
const panelT = {}; const panelTex = lit => { const key = lit; return panelT[key] || (panelT[key] = tex(512, 384, (g, w, h) => { g.fillStyle = '#d7dcd8'; g.fillRect(0, 0, w, h); g.fillStyle = '#20302c'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#8fe3c0'; g.font = '800 34px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('LLAMADOS · PISO 3', w / 2, 50);
  for (let i = 0; i < 12; i++) { const x = 80 + (i % 4) * 117, y = 130 + Math.floor(i / 4) * 92, on = lit[i] == '1'; g.shadowColor = '#ff2a1a'; g.shadowBlur = on ? 30 : 0; g.fillStyle = on ? '#ff3b2a' : '#3a4643'; g.beginPath(); g.roundRect(x - 46, y - 34, 92, 68, 12); g.fill(); g.shadowBlur = 0; g.fillStyle = on ? '#fff3e8' : '#9aa8a4'; g.font = '900 44px Inter, sans-serif'; g.fillText(String(i + 1), x, y + 3) } })) };
T.monitor = tex(512, 320, (g, w, h) => { g.fillStyle = '#04100c'; g.fillRect(0, 0, w, h); g.font = '700 26px Inter, sans-serif'; g.fillStyle = '#7dffb0'; g.fillText('INTERNACIÓN · PISO 3 · 04:07', 20, 40); const rows = [['7', 'VACÍA'], ['8', 'E. SOSA'], ['9', 'CERRADA · OBRAS'], ['10', 'R. PÉREZ'], ['11', 'M. LUZ'], ['12', 'VACÍA']];
  rows.forEach(([n, s], i) => { g.fillStyle = n == '9' ? '#ff6a5a' : '#bfe8d8'; g.fillText('HAB ' + n, 24, 88 + i * 38); g.fillText(s, 150, 88 + i * 38) }); g.strokeStyle = '#3fffa0'; g.lineWidth = 3; g.beginPath(); for (let x = 360; x < 500; x += 2) { const p = (x % 46) / 46; g.lineTo(x, 200 - (p > .4 && p < .48 ? 60 : p > .48 && p < .52 ? -30 : 0)) } g.stroke() });
T.curtain = tex(256, 256, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 150 + 40 * Math.sin(x / w * PI * 12); g.fillStyle = `rgb(${v * .62},${v * .86},${v * .8})`; g.fillRect(x, 0, 1, h) } speck(g, w, h, 400, .06) });
T.night = tex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1430'); gr.addColorStop(1, '#1d2a48'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(220,230,255,${Math.random() * .8})`; g.fillRect(Math.random() * w, Math.random() * h * .6, 2, 2) } const m = g.createRadialGradient(180, 70, 0, 180, 70, 60); m.addColorStop(0, 'rgba(240,246,255,1)'); m.addColorStop(.3, 'rgba(220,230,255,.9)'); m.addColorStop(.32, 'rgba(160,180,230,.3)'); m.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = m; g.fillRect(0, 0, w, h); g.fillStyle = '#05080f'; for (let x = 0; x < w; x += 22) g.fillRect(x, h - 40 - Math.random() * 50, 20, 120); g.fillStyle = '#ffd98a'; for (let i = 0; i < 9; i++) g.fillRect(Math.random() * w, h - 30 - Math.random() * 40, 4, 5) });
T.exit = tex(256, 96, (g, w, h) => { g.fillStyle = '#0c8a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#eafff2'; g.font = '900 60px Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SALIDA', w / 2, h / 2 + 4) });
T.call = tex(140, 296, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0f3a2a'); gr.addColorStop(1, '#05140e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#9fe8c0'; g.beginPath(); g.arc(w / 2, 80, 30, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '800 17px Inter, sans-serif'; g.textAlign = 'center'; g.fillText('Dr. Ferreira', w / 2, 140); g.font = '600 12px Inter, sans-serif'; g.fillText('Guardia médica', w / 2, 160); g.fillStyle = '#e3202c'; g.beginPath(); g.arc(35, 250, 18, 0, 7); g.fill(); g.fillStyle = '#20c060'; g.beginPath(); g.arc(105, 250, 18, 0, 7); g.fill() }); const callT = T.call; callT.wrapS = callT.wrapT = THREE.ClampToEdgeWrapping;
// ------------------------------------------------------------------ world: corridor
const HALL = grp(scene), ROOM = grp(scene), R8 = grp(scene);
const wallM = mat(0xffffff, { map: T.wall }), doorM = mat(0xffffff, { map: T.door }), ceilM = mat(0xb9bdb6), dk = mat(0x2a2f30);
box(HALL, 2.9, .1, 16.8, mat(0xffffff, { map: T.vinyl }), 0, -.05, -5.7); box(HALL, 2.9, .1, 16.8, ceilM, 0, 2.85, -5.7, 0);
box(HALL, 2.9, 2.8, .1, wallM, 0, 1.4, 2.65); box(HALL, 2.9, 2.8, .1, wallM, 0, 1.4, -14.05);
// left wall (hole at door 9: z -5.45..-6.55), right wall (hole at door 8: z -3.05..-4.15)
box(HALL, .1, 2.8, 8.05, wallM, -1.45, 1.4, -1.425); box(HALL, .1, 2.8, 7.45, wallM, -1.45, 1.4, -10.275); box(HALL, .1, .7, 1.1, wallM, -1.45, 2.45, -6);
box(HALL, .1, 2.8, 5.65, wallM, 1.45, 1.4, -.225); box(HALL, .1, 2.8, 9.85, wallM, 1.45, 1.4, -9.075); box(HALL, .1, .7, 1.1, wallM, 1.45, 2.45, -3.6);
for (const s of [-1, 1]) { const r = add(HALL, G.cyl, mat(0xc9cfcc), s * 1.36, .92, -5.7); r.scale.set(.025, 16.6, .025); r.rotation.x = PI / 2 }
const DOORS = [[7, -1, -2], [8, 1, -3.6], [9, -1, -6], [10, 1, -7.6], [11, -1, -10], [12, 1, -11.6]].map(([n, s, z]) => {
  const d = { n, s, z };
  if (n != 8 && n != 9) box(HALL, .04, 2.1, 1.1, doorM, s * 1.39, 1.05, z, 0);
  for (const dz of [-.58, .58]) box(HALL, .06, 2.16, .06, mat(0x9aa29e), s * 1.38, 1.08, z + dz, 0);
  { const p = add(HALL, new THREE.PlaneGeometry(.34, .17), basic(0xffffff, { map: plate(n) }), s * 1.39, 1.62, z + .86); p.rotation.y = -s * PI / 2 }
  d.m = basic(0x301010); box(HALL, .14, .12, .3, d.m, s * 1.35, 2.32, z, 0); d.gl = glowSprite(HALL, 0xff3020, 1.1, s * 1.25, 2.32, z); d.gl.material.opacity = 0;
  d.L = new THREE.PointLight(0xff2a1a, 0, 5, 1.6); d.L.position.set(s * 1.1, 2.15, z); HALL.add(d.L); return d });
const leaf9 = grp(HALL); leaf9.position.set(-1.42, 0, -5.45); box(leaf9, .05, 2.1, 1.1, doorM, 0, 1.05, -.55, 0);
const leaf8 = grp(HALL); leaf8.position.set(1.42, 0, -3.05); box(leaf8, .05, 2.1, 1.1, doorM, 0, 1.05, -.55, 0);
const underM = new THREE.MeshBasicMaterial({ color: 0xfff2d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
{ const p = add(HALL, new THREE.PlaneGeometry(.5, 1.0), underM, -1.2, .006, -6); p.rotation.x = -PI / 2 }
const UNDL = new THREE.PointLight(0xffe8c0, 0, 2.5, 1.6); UNDL.position.set(-1.2, .12, -6); HALL.add(UNDL);
// wall call unit beside door 9 (with cable)
box(HALL, .04, .16, .12, mat(0xe8ece8), -1.39, 1.2, -5.05, 0); const callBtnM = basic(0x601010); box(HALL, .02, .05, .05, callBtnM, -1.36, 1.22, -5.05, 0);
const cable = add(HALL, G.cyl, mat(0xe8e8e0), -1.36, .95, -5.05); cable.scale.set(.008, .5, .008);
// ceiling lights
const CLm = [], CLL = [-.4, -4.3, -8.2, -12].map((z, i) => { const m = basic(0xffffff); CLm.push(m); box(HALL, .6, .03, 1.2, m, 0, 2.79, z, 0); const l = new THREE.PointLight(0xd8f2e6, 0, 9, 1.3); l.position.set(0, 2.5, z); HALL.add(l); return l });
// end window + exit sign
add(HALL, new THREE.PlaneGeometry(1.6, 1.3), basic(0xffffff, { map: T.night }), 0, 1.55, -13.99); for (const x of [-.82, 0, .82]) box(HALL, .06, 1.36, .06, dk, x, 1.55, -13.97, 0);
{ add(HALL, new THREE.PlaneGeometry(.6, .22), basic(0xffffff, { map: T.exit }), 0, 2.55, -13.99); glowSprite(HALL, 0x30ff90, .9, 0, 2.55, -13.9).material.opacity = .4 }
// nurse station (counter across the left part of the corridor)
box(HALL, 1.9, 1.05, .6, mat(0xe9e6de), -.45, .525, .5); box(HALL, 2.0, .05, .7, mat(0x6a8f84), -.45, 1.07, .5);
const panelM = basic(0xffffff, { map: panelTex('000000000000') }); { const p = add(HALL, new THREE.PlaneGeometry(.4, .3), panelM, -.95, 1.26, .4); p.rotation.x = -.25; box(HALL, .44, .34, .03, dk, -.95, 1.255, .36, 0).rotation.x = -.25 }
box(HALL, .5, .34, .04, dk, -.2, 1.33, .38, 0); add(HALL, new THREE.PlaneGeometry(.46, .3), basic(0xffffff, { map: T.monitor }), -.2, 1.33, .405); box(HALL, .06, .14, .06, dk, -.2, 1.13, .38, 0);
box(HALL, .16, .1, .12, mat(0xd5d9d4), .3, 1.14, .55, 0); const icomM = basic(0x204020); box(HALL, .05, .02, .05, icomM, .3, 1.2, .55, 0); { const g = add(HALL, G.cyl, dk, .26, 1.2, .55); g.scale.set(.025, .005, .025) }
for (let i = 0; i < 3; i++) box(HALL, .22, .02 + i * .01, .3, mat([0xf2f2ee, 0x6fa0c8, 0xf2e3a0][i]), -1.15 + i * .02, 1.1 + i * .02, .65, 0);
const LAMP = new THREE.PointLight(0xffe4b8, 0, 2.6, 1.5); LAMP.position.set(-.6, 1.6, .7); HALL.add(LAMP); const scrGl = glowSprite(HALL, 0x60ffb0, .7, -.2, 1.33, .45); scrGl.material.opacity = .18;
// nurse cart (left wall between 7 and 9)
{ const c = grp(HALL); c.position.set(-1.0, 0, -3.4); box(c, .5, .85, .7, mat(0x4f7fa8), 0, .5, 0, 1); for (let i = 0; i < 4; i++) box(c, .51, .02, .66, mat(0x2c4a66), 0, .25 + i * .2, 0, 0); box(c, .54, .04, .74, mat(0xdfe6ea), 0, .95, 0, 0); for (const [x, z] of [[-.2, -.3], [.2, -.3], [-.2, .3], [.2, .3]]) sph(c, .04, dk, x, .04, z, 0); box(c, .14, .1, .2, mat(0xf2f2f2), .05, 1.02, .1, 0); const b = add(c, G.cyl, mat(0x9fd0ff, { transparent: true, opacity: .6 }), -.1, 1.05, -.15); b.scale.set(.04, .16, .04) }
// ------------------------------------------------------------------ world: room 9 (x -1.5..-5.2, z -4.3..-7.7) and room 8 (dark)
const rwall = mat(0xd6dad2);
box(ROOM, 3.8, .1, 3.5, mat(0xffffff, { map: T.vinyl }), -3.35, -.05, -6); box(ROOM, 3.8, .1, 3.5, ceilM, -3.35, 2.85, -6, 0);
box(ROOM, .1, 2.8, 3.5, rwall, -5.25, 1.4, -6); box(ROOM, 3.8, 2.8, .1, rwall, -3.35, 1.4, -4.25); box(ROOM, 3.8, 2.8, .1, rwall, -3.35, 1.4, -7.75);
add(ROOM, new THREE.PlaneGeometry(1.0, 1.1), basic(0xffffff, { map: T.night }), -5.19, 1.6, -5.0).rotation.y = PI / 2; for (const z of [-5.52, -5, -4.48]) box(ROOM, .06, 1.16, .06, dk, -5.18, 1.6, z, 0); box(ROOM, .06, .06, 1.1, dk, -5.18, 1.6, -5, 0);
// bed (head against x = -5.2)
const bedM = mat(0xeef0ec), frameM = mat(0x9aa4a8);
box(ROOM, 2.0, .12, 1.0, frameM, -4.15, .45, -6.2, 3); for (const [x, z] of [[-5.05, -5.75], [-5.05, -6.65], [-3.25, -5.75], [-3.25, -6.65]]) box(ROOM, .05, .45, .05, frameM, x, .22, z, 0);
box(ROOM, 1.95, .14, .92, bedM, -4.15, .57, -6.2, 3); box(ROOM, .06, .9, 1.0, frameM, -5.15, .75, -6.2, 1); box(ROOM, .06, .45, 1.0, frameM, -3.15, .6, -6.2, 1);
for (const s of [-1, 1]) box(ROOM, 1.0, .05, .03, frameM, -4.3, .82, -6.2 + s * .5, 0);
box(ROOM, .32, .12, .6, mat(0xf8f8f4), -4.92, .7, -6.2, 1);
const sheetUp = box(ROOM, 1.3, .34, .94, mat(0xe4ecee), -3.83, .76, -6.2, 1), sheetFlat = box(ROOM, 1.6, .04, .94, mat(0xdde8ea), -4.0, .65, -6.2, 0);
// IV stand, bedside table, curtain, obras
{ const p = add(ROOM, G.cyl, frameM, -4.75, 1.0, -6.95); p.scale.set(.015, 2.0, .015); box(ROOM, .4, .02, .02, frameM, -4.75, 2.0, -6.95, 0); box(ROOM, .1, .18, .04, mat(0xbfe4ff, { transparent: true, opacity: .55 }), -4.6, 1.85, -6.95, 0); sph(ROOM, .2, dk, -4.75, .03, -6.95, 0).scale.set(.2, .02, .2) }
box(ROOM, .4, .6, .4, mat(0xe2ded2), -4.85, .3, -5.15, 1);
add(ROOM, new THREE.PlaneGeometry(1.2, 2.0), mat(0xffffff, { map: T.curtain, side: THREE.DoubleSide }), -2.5, 1.4, -5.0); box(ROOM, 2.8, .03, .03, frameM, -3.3, 2.45, -5.0, 0);
for (const [x, z, c] of [[-2.0, -7.4, 0xe8e2d0], [-2.3, -7.5, 0xd0d8e0]]) { const k = add(ROOM, G.cyl, mat(c), x, .15, z); k.scale.set(.13, .3, .13) }
{ const lad = grp(ROOM); lad.position.set(-1.9, 0, -7.55); lad.rotation.z = .08; for (const s of [-1, 1]) box(lad, .05, 2.0, .05, mat(0x9c8a5a), s * .22, 1.0, 0, 0); for (let i = 0; i < 6; i++) box(lad, .44, .04, .04, mat(0x9c8a5a), 0, .25 + i * .32, 0, 0) }
const ROOML = new THREE.PointLight(0xcfe6ff, 0, 6, 1.4); ROOML.position.set(-3.4, 2.4, -6.0); ROOM.add(ROOML);
const moon = new THREE.SpotLight(0x9fb8ff, 0, 10, .6, .6, 1); moon.position.set(-5.6, 2.4, -4.6); moon.target.position.set(-4.0, .6, -6.2); ROOM.add(moon, moon.target);
const roomGl = glowSprite(ROOM, 0xffffff, 3, -4.2, 1.4, -6.2); roomGl.material.opacity = 0;
box(R8, 2.6, .1, 2.0, mat(0x6f7a74), 2.7, -.05, -3.6); box(R8, .1, 2.8, 2.0, rwall, 4.0, 1.4, -3.6); box(R8, 2.6, 2.8, .1, rwall, 2.7, 1.4, -2.55); box(R8, 2.6, 2.8, .1, rwall, 2.7, 1.4, -4.65);
box(R8, .9, .55, 1.8, mat(0xdfe2dc), 3.3, .3, -3.6); const R8L = new THREE.PointLight(0xffb070, 0, 4, 1.5); R8L.position.set(3.4, .9, -3.0); R8.add(R8L);
// ------------------------------------------------------------------ characters
const elvira = makeChar({ skin: 0xe8c9b0, shirt: 0xa9c4d6, pants: 0xa9c4d6, skirt: 0xa9c4d6, hair: 0xf2f2f2, style: 'bun', h: .9, lean: .1, seed: 2 });
const sheetFig = makeChar({ skin: 0xe6ecee, shirt: 0xe6ecee, pants: 0xe6ecee, hair: 0xe6ecee, style: 'short', noface: 1, h: .95, seed: 3 });
sheetFig.head.traverse(o => { if (o.isMesh && Math.abs(o.position.z - .2) < 1e-6 && Math.abs(o.position.y - .155) < 1e-6) o.visible = false });
const abuelo = makeChar({ skin: 0xd9b69a, shirt: 0xb9cfd8, pants: 0xb9cfd8, hair: 0xeeeeee, style: 'short', h: .92, seed: 4 });
// glass held by the POV hand
const glass = grp(rig); { const g1 = add(glass, G.cyl, new THREE.MeshLambertMaterial({ color: 0xe8f8ff, transparent: true, opacity: .6, emissive: 0x6a8aa0 }), 0, 0, 0, 0); g1.scale.set(.032, .1, .032); const w = add(glass, G.cyl, new THREE.MeshLambertMaterial({ color: 0x8fd0ff, transparent: true, opacity: .8, emissive: 0x3a6a9a }), 0, -.012, 0, 0); w.scale.set(.029, .07, .029) }
ARMP.glass = t => [[.09, -.2, -.46, -.2, 0, .15], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.offer = t => [[.07, -.1, -.6, -.1, 0, .1], [-.2, -.62, -.3, 0, 0, 0]];
ARMP.yank = t => [[-.06, -.2, -.6, .1, 0, .3], [-.2, -.62, -.3, 0, 0, 0]];
// ------------------------------------------------------------------ environment
const flk = (t, hz = 14, p = .25, lo = .3) => hash(Math.floor(t * hz)) > p ? 1 : lo;
function env(o) {
  const cl_ = o.ceil ?? [1, 1, 1, 1]; CLL.forEach((l, i) => { LI(l, cl_[i] * 3.2); CLm[i].color.setScalar(.12 + cl_[i] * 1.1); l.color.setHex(o.ceilC ?? 0xd8f2e6) });
  const calls = o.calls || [0, 0, 0, 0, 0, 0]; DOORS.forEach((d, i) => { const v = calls[i]; d.m.color.setRGB(.19 + v * .95, .06 + v * .14, .06 + v * .08); d.gl.material.opacity = v * .75; LI(d.L, v * (o.redI ?? 2.2)) });
  panelM.map = panelTex(o.panel || '000000000000'); underM.opacity = (o.under ?? 0) * .55; LI(UNDL, (o.under ?? 0) * 1.4);
  leaf9.rotation.y = (o.d9 ?? 0) * 1.35; leaf8.rotation.y = -(o.d8 ?? .55); ROOM.visible = (o.d9 ?? 0) > .01 || !!o.inRoom; LI(ROOML, ROOM.visible ? (o.room ?? .6) * 2.4 : 0); LI(moon, ROOM.visible ? (o.moon ?? 1) * 7 : 0); roomGl.material.opacity = o.roomGl ?? 0;
  LI(R8L, (o.r8 ?? .5) * 1.6); LI(LAMP, (o.lamp ?? 1) * 1.6); icomM.color.setHex(o.icom ? 0x40ff70 : 0x204020); callBtnM.color.setHex(o.btn9 ? 0xff3020 : 0x601010); cable.visible = !o.yanked;
  hemi.intensity = o.hemi ?? .38; hemi.color.setHex(o.hemiC ?? 0xd8ece4); bg.setHex(o.bg ?? 0x020304); scene.fog.color.setHex(o.fog ?? 0x050a08); scene.fog.density = o.fogD ?? .045; R.toneMappingExposure = o.exp ?? 1.15;
}
const Es = [-.45, 1.55, 1.35], PANEL = [-.95, 1.24, .4], HALL9 = [-1.2, 2.0, -6], ICOM = [.28, 1.14, .55], D9P = [-1.4, 1.15, -6], ELV = [1.22, 1.42, -3.75], SOCK = [-1.38, 1.15, -5.05];
const BED = [-4.1, .95, -6.2], FIG = [-4.45, 1.3, -6.2], HEAD = [-4.55, 1.3, -6.2], C8 = [1.33, 2.3, -3.6], ELVB = [1.22, 1.15, -3.75];
const ENDQ = (ek, a, b, nxt) => ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a, b, cta: 'COMENTÁ  A  o  B', nxt } : null;
const blink9 = t => hash(Math.floor(t * 2.2)) > .2 ? 1 : .15;
let K1, K2, K3;
// ================================================================== PARTE 1
function P1(t) {
  const O = { tag: sr(t, 3.6, 4.2) * .92 }; hideAll();
  const W1 = [.1, 1.55, 1.15], W2 = [.95, 1.55, .0], W3 = [.55, 1.55, -2.7], P0 = [-.1, 1.55, -4.75];
  K1 = K1 || path([[0, Es, [-1.06, 1.18, .42], 22], [Ln.h1.end - .3, Es, [-1.0, 1.21, .41], 24], [Ln.h1.end + .9, Es, HALL9, 50], [M.bell2 - .5, Es, [-.5, 1.7, -9], 56], [M.bell2 + .3, Es, PANEL, 30], [Ln.h3.start + .8, Es, PANEL, 27], [Ln.h3.end, Es, HALL9, 44],
    [M.interbuzz + .5, Es, PANEL, 36], [Ln.v2.end, Es, PANEL, 31], [M.walk + .6, W1, [.95, 1.5, -2], 62], [M.walk + 1.8, W2, [.4, 1.5, -4], 64], [M.walk + 3.4, W3, [-1.3, .4, -6], 62], [Ln.h4.end + .1, P0, [-1.35, .3, -6], 50],
    [M.elvira + .7, P0, ELVB, 66], [Ln.e1.end, P0, ELVB, 58], [Ln.y2.end, P0, ELVB, 62], [Ln.e2.end, P0, ELV, 46], [M.sting + .25, P0, D9P, 44], [C.dur, P0, D9P, 38]]);
  const c = evalPath(K1, t), walking = t > M.walk + .2 && t < Ln.h4.end, scare = t > M.sting && t < M.sting + 1.2;
  const on9 = (t < 1.6 ? 1 : t < Ln.h1.end + .2 ? blink9(t) : t > M.bell2 ? 1 : 0), p9 = on9 > .5 ? '000000001000' : '000000000000';
  env({ ceil: [.9, .75 * flk(t, 9, .15, .5), .55, .4], calls: [0, 0, on9, 0, 0, 0], panel: p9, under: sr(t, M.walk, M.walk + 2), d8: .55 + .5 * sr(t, M.elvira - .3, M.elvira + .9),
    r8: sr(t, M.elvira - .3, M.elvira + .9) * .6, icom: (t > M.interbuzz && t < Ln.v2.end + .3), btn9: t > M.bell2 });
  if (t > M.elvira - .3) pose(elvira, { t, x: 1.22, z: -3.75, ry: -2.1, look: cam.position, talk: Math.max(talk('e1', t), talk('e2', t)), brow: .6, eye: 1 + sr(t, Ln.e2.start, Ln.e2.end) * .2, aR: [-win(t, Ln.e1.start, Ln.e2.end, .4, .5) * .7, .15] });
  arms(t, { reach: win(t, M.press - .45, M.press + .5, .25, .3) });
  setCam(c, t, cl(c.fov / 55, .2, 1) * (.8 + (scare ? 1.6 : 0)), walking ? .12 : 0, scare && t - M.sting < .35 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title - .1, M.title + 2.3, .3, .25), titleY: 520, tint: 'rgba(40,110,90,.18)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .08 ? .4 : 0, red: on9 * (t < Ln.h1.end ? .18 : 0) + (scare ? .25 * (1 - ramp(t, M.sting, M.sting + 1)) : 0),
    alert: { k: Math.min(ramp(t, M.interbuzz + .05, M.interbuzz + .4), 1 - ramp(t, Ln.v2.end + .2, Ln.v2.end + .5)), buzz: t < M.interbuzz + 1 ? 1 : 0, kk: 'INTERCOMUNICADOR · 04:07', m: 'HABITACIÓN 9', s: 'Llamado de paciente…', col: ['#d4252f', '#8a0e16'] },
    end: ENDQ(t - M.endcard, 'LE LLEVÁS AGUA', 'CORTÁS EL TIMBRE', 'Lo que pasó después: <i>PARTE 2</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 2
function P2(t) {
  const O = { tag: .92 }; hideAll(); const P0 = [-.25, 1.55, -4.7], PD = [-.95, 1.55, -6.0];
  K2 = K2 || path([[0, P0, SOCK, 40], [M.yank - .3, P0, SOCK, 35], [M.yank + .6, P0, SOCK, 44], [Ln.h2.end - .4, P0, [-.1, 1.9, -12.5], 58], [M.all + .7, P0, [-.1, 2.0, -12.5], 62], [Ln.c1.end, P0, [.1, 2.0, -11], 56], [Ln.h3.end, P0, [1.2, 2.0, -6.5], 52],
    [M.ring + .8, P0, [.1, 1.25, -6.2], 60], [Ln.d2.end, P0, [.1, 1.25, -6.2], 56], [M.cut + .3, P0, D9P, 48], [M.open9 + 1.2, P0, D9P, 50], [Ln.h4.start + 1.8, PD, BED, 56], [Ln.v1.start, [-1.1, 1.55, -6.05], FIG, 36], [M.sting + .3, [-1.1, 1.55, -6.05], FIG, 26], [C.dur, [-1.1, 1.55, -6.05], FIG, 24]]);
  const c = evalPath(K2, t), all = t > M.all, scare = t > M.sting && t < M.sting + 1.2;
  const calls = all ? DOORS.map((d, i) => hash(Math.floor(t * 3 + i * 7)) > .25 ? 1 : .3) : [0, 0, 0, 0, 0, 0], pnl = all ? '111111111111' : '000000000000';
  const op = sr(t, M.open9, M.open9 + 2.2);
  env({ ceil: all ? [.5 * flk(t, 10, .3, .1), .4 * flk(t + 2, 12, .4, .05), .3 * flk(t + 5, 8, .3, .1), .2] : [.8, .6, .5, .35], calls, panel: pnl, under: 1 - op * .3, d9: op, room: .15, moon: 1.6, hemi: lerp(.38, .2, sr(t, M.open9, M.open9 + 2)), d8: .55, r8: .4, yanked: t > M.yank, redI: 2.4, fogD: all ? .06 : .045 });
  if (op > .01) { const up = sr(t, Ln.v1.start - .8, Ln.v1.end); pose(sheetFig, { t: 0, x: -4.55, y: .1, z: -6.2, ry: PI / 2, sit: 1, lean: lerp(-1.35, -.05, up), hyAbs: sr(t, M.sting - .2, M.sting + .3) * .25, aL: [-.2, .1], aR: [-.2, .1] }) }
  sheetUp.visible = true; sheetFlat.visible = false;
  arms(t, { yank: win(t, -1, M.yank, .1, .15), phone: win(t, M.ring + .4, Ln.d2.end + .4, .5, .5) }); phoneScr.material.map = callT; phoneScr.material.color.setHex(0xffffff); phoneScr.material.needsUpdate = true;
  setCam(c, t, cl(c.fov / 55, .2, 1) * (.9 + (all ? .5 : 0) + (scare ? 1.6 : 0)), t > M.open9 + 1.2 && t < Ln.v1.start ? .1 : 0, (scare && t - M.sting < .35 ? 1 : 0) + (t > M.all && t < M.all + .25 ? .5 : 0) + (t > M.yank && t < M.yank + .2 ? .4 : 0));
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 420, tint: all ? 'rgba(140,20,20,.22)' : 'rgba(40,110,90,.18)', black: 1 - ramp(t, 0, .3), white: scare && t - M.sting < .08 ? .4 : 0, red: all ? .14 + .08 * Math.sin(t * 6) : 0,
    alert: { k: Math.min(ramp(t, M.ring + .05, M.ring + .4), 1 - ramp(t, M.cut, M.cut + .35)), buzz: t < M.ring + 1.4 ? 1 : 0, kk: 'LLAMADA ENTRANTE', m: 'DR. FERREIRA', s: 'Guardia médica · interno 9', col: ['#1f9a5b', '#0c5a34'] },
    end: ENDQ(t - M.endcard, 'ENTRÁS A LA 9', 'CORRÉS A LA 8', 'El final: <i>PARTE 3</i>') });
  overlay(t, O);
}
// ================================================================== PARTE 3
function P3(t) {
  const O = { tag: .92 }; hideAll(); const PIN = [-2.75, 1.48, -6.0], PH = [-.05, 1.55, -5.4];
  K3 = K3 || path([[0, [-1.15, 1.55, -6.0], BED, 54], [Ln.h1.end, [-1.6, 1.55, -6.0], BED, 50], [Ln.h2.start + 1.6, PIN, HEAD, 46], [Ln.v1.end, PIN, HEAD, 36], [M.drink + 1.2, PIN, HEAD, 40], [Ln.v3.end, PIN, HEAD, 28],
    [M.gone + 1.0, PIN, BED, 52], [Ln.h3.end, PIN, BED, 46], [M.out + .9, [-.6, 1.55, -5.9], [1.3, 1.9, -3.6], 58], [Ln.h4.end, PH, C8, 50], [M.bell8 + .5, PH, C8, 38], [Ln.e1.start + .5, PH, ELV, 50], [Ln.h5.end, PH, ELV, 42], [M.sting + .3, PH, ELV, 30], [C.dur, PH, ELV, 27]]);
  const c = evalPath(K3, t), scare = t > M.sting && t < M.sting + 1.2, gone = t > M.gone + .3, inR = t < M.out + .5, b8 = t > M.bell8;
  env({ ceil: [.85, .7, .5, .35], calls: [0, b8 ? 1 : 0, 0, 0, 0, 0], panel: b8 ? '000000010000' : '000000000000', under: 0, d9: 1, inRoom: 1, room: gone ? .45 : .4, moon: gone ? 1.4 : 1, roomGl: gone ? .35 * (1 - sr(t, M.gone + .3, M.gone + 2.5)) : 0, d8: 1.1, r8: b8 ? .25 : .5, yanked: 1, hemi: .4 });
  if (!gone) { const awake = sr(t, Ln.v1.start - .4, Ln.v1.start + .3), reach = win(t, M.drink - .6, M.drink + 1.4, .5, .5);
    pose(abuelo, { t, x: -4.6, y: .08, z: -6.2, ry: PI / 2, sit: 1, lean: -.32 + reach * .15, closed: awake < .5, look: cam.position, smile: awake * .35 * (1 - reach), talk: Math.max(talk('v1', t), talk('v2', t), talk('v3', t)), brow: -.2 + (t > Ln.v3.start ? .7 : 0), aR: [-reach * 1.2, .1], aL: [-.15, .1] }) }
  sheetUp.visible = !gone; sheetFlat.visible = gone;
  if (t > M.sting - .4) pose(elvira, { t, x: 1.22, z: -3.75, ry: -2.1, look: cam.position, smile: sr(t, M.sting - .3, M.sting + .2) * .7, glow: sr(t, M.sting - .2, M.sting + .3) * 1.0, noblink: 1, eye: 1.1, pupil: .4 });
  const hold = !gone && t < M.drink + .2 ? 1 : 0, offer = win(t, M.drink - .9, M.drink + .3, .5, .3);
  arms(t, { glass: hold * (1 - offer), offer: hold * offer }); glass.visible = hold > 0; glass.position.set(lerp(.09, .06, offer), lerp(-.13, -.03, offer), lerp(-.47, -.61, offer));
  setCam(c, t, cl(c.fov / 55, .2, 1) * (.8 + (scare ? 1.6 : 0)), (t < Ln.h2.start + 1.6 && t > Ln.h1.end - .5) || (t > M.out && t < M.out + 1.2) ? .1 : 0, scare && t - M.sting < .35 ? 1 : 0);
  Object.assign(O, { title: win(t, M.title, M.title + 2.2, .3, .25), titleY: 420, tint: inR ? 'rgba(60,90,150,.2)' : 'rgba(40,110,90,.18)', black: 1 - ramp(t, 0, .3), white: Math.max(t > M.gone && t < M.gone + .9 ? .85 * (1 - ramp(t, M.gone + .1, M.gone + .9)) * sr(t, M.gone - .05, M.gone + .1) : 0, scare && t - M.sting < .08 ? .45 : 0), red: b8 ? .1 : 0,
    end: t > M.endcard ? { k: t - M.endcard, q: '¿LE LLEVARÍAS<br>AGUA A<br>DOÑA ELVIRA?', qs: 118, cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  overlay(t, O);
}
run([null, P1, P2, P3]);

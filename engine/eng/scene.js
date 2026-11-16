import * as THREE from 'three';
const Q = new URLSearchParams(location.search), PART = +(Q.get('p') || 1), RS = +(Q.get('rs') || 1);
const C = await (await fetch(`../tts/out/p${PART}.json`)).json();
C.L = {}; for (const l of C.lines) C.L[l.id] = l;
const M = C.marks, Ln = C.L;
// ------------------------------------------------------------------ math
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
const ss = x => { x = cl(x); return x * x * (3 - 2 * x) }, ramp = (t, a, b) => cl((t - a) / (b - a)), sr = (t, a, b) => ss(ramp(t, a, b));
const win = (t, a, b, fi = .25, fo = .25) => Math.min(sr(t, a, a + fi), 1 - sr(t, b - fo, b));
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s) };
const sn = (t, s = 0) => Math.sin(t * 1.3 + s * 7.1) * .5 + Math.sin(t * 2.9 + s * 3.3) * .3 + Math.sin(t * 5.3 + s * 1.7) * .2;
const V = (x, y, z) => new THREE.Vector3(x, y, z), PI = Math.PI;
// ------------------------------------------------------------------ renderer
const cv = document.getElementById('c'); cv.width = 720 * RS; cv.height = 1280 * RS;
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x05070c, 0.02);
const cam = new THREE.PerspectiveCamera(70, 9 / 16, 0.05, 200); cam.rotation.order = 'YXZ'; scene.add(cam);
// ------------------------------------------------------------------ textures
function tex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t;
}
const speck = (g, w, h, n, a, col = '0,0,0') => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${col},${Math.random() * a})`; const s = 1 + Math.random() * 3; g.fillRect(Math.random() * w, Math.random() * h, s, s) } };
const blot = (g, w, h, n, a, col = '0,0,0', rmax = 90) => { for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * rmax, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${Math.random() * a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) } };
const T = {};
T.floor = tex(512, 512, (g, w, h) => { g.fillStyle = '#e9e6df'; g.fillRect(0, 0, w, h); blot(g, w, h, 30, .06); speck(g, w, h, 900, .12); g.strokeStyle = '#b9b4aa'; g.lineWidth = 5; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * 256, 0); g.lineTo(i * 256, h); g.moveTo(0, i * 256); g.lineTo(w, i * 256); g.stroke() } }, 14, 20);
T.ceil = tex(256, 256, (g, w, h) => { g.fillStyle = '#d9d9d6'; g.fillRect(0, 0, w, h); speck(g, w, h, 700, .1); g.strokeStyle = '#8e8e8a'; g.lineWidth = 6; g.strokeRect(0, 0, w, h) }, 13, 18);
T.conc = tex(512, 512, (g, w, h) => { g.fillStyle = '#7d7f7c'; g.fillRect(0, 0, w, h); blot(g, w, h, 60, .16); blot(g, w, h, 30, .1, '255,255,255'); speck(g, w, h, 3000, .18); g.strokeStyle = 'rgba(20,20,20,.35)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); let x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (Math.random() - .5) * 90; y += Math.random() * 70; g.lineTo(x, y) } g.stroke() } }, 2, 1.4);
T.concF = tex(512, 512, (g, w, h) => { g.fillStyle = '#5c5d5b'; g.fillRect(0, 0, w, h); blot(g, w, h, 70, .2); speck(g, w, h, 3500, .2) }, 2, 2);
T.steel = tex(256, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#59636d'); gr.addColorStop(.5, '#6c7781'); gr.addColorStop(1, '#525b65'); g.fillStyle = gr; g.fillRect(0, 0, w, h); blot(g, w, h, 25, .2, '30,20,10', 60); speck(g, w, h, 800, .2); g.strokeStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 40; i++) { g.beginPath(); const y = Math.random() * h; g.moveTo(Math.random() * w, y); g.lineTo(Math.random() * w, y + (Math.random() - .5) * 30); g.stroke() } });
T.card = tex(256, 256, (g, w, h) => { g.fillStyle = '#b98a55'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, .12); g.fillStyle = '#d7bd8f'; g.fillRect(0, h * .44, w, h * .12); g.strokeStyle = '#7a5630'; g.lineWidth = 6; g.strokeRect(0, 0, w, h) });
T.slat = tex(64, 256, (g, w, h) => { for (let i = 0; i < 16; i++) { const gr = g.createLinearGradient(0, i * 16, 0, i * 16 + 16); gr.addColorStop(0, '#8d949b'); gr.addColorStop(.7, '#5d646b'); gr.addColorStop(1, '#2c3035'); g.fillStyle = gr; g.fillRect(0, i * 16, w, 16) } }, 6, 2);
T.sign = tex(2048, 256, (g, w, h) => { g.fillStyle = '#0c6b55'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23c'; g.fillRect(0, 0, w, 18); g.fillRect(0, h - 18, w, 18); g.font = '900 150px Inter Display, Inter, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#083e32'; g.fillText('SUPER  DON TITO', w / 2 + 6, h / 2 + 12); g.fillStyle = '#ffd23c'; g.fillText('SUPER  DON TITO', w / 2, h / 2 + 4) });
T.depo = tex(512, 160, (g, w, h) => { g.fillStyle = '#b3131d'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 78px Inter Display, Inter'; g.textAlign = 'center'; g.fillText('DEPÓSITO', w / 2, 80); g.font = '700 38px Inter'; g.fillText('SOLO PERSONAL', w / 2, 132) });
T.oferta = tex(256, 320, (g, w, h) => { g.fillStyle = '#ff7a1a'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '900 64px Inter Display, Inter'; g.textAlign = 'center'; g.fillText('OFERTA', w / 2, 80); g.font = '800 44px Inter'; g.fillText('YERBA 1KG', w / 2, 150); g.fillStyle = '#ffe94a'; g.font = '900 96px Inter Display, Inter'; g.fillText('$189', w / 2, 262) });
T.reg = tex(512, 400, (g, w, h) => { g.fillStyle = '#0d1b2a'; g.fillRect(0, 0, w, h); g.fillStyle = '#0c6b55'; g.fillRect(0, 0, w, 54); g.fillStyle = '#fff'; g.font = '800 32px Inter'; g.fillText('CAJA 3', 18, 38); g.font = '700 34px Inter'; const it = [['YERBA 1KG', '$ 289'], ['LECHE 1L', '$ 62'], ['FIDEOS 500G', '$ 58']]; it.forEach((r, i) => { g.textAlign = 'left'; g.fillText(r[0], 22, 118 + i * 54); g.textAlign = 'right'; g.fillText(r[1], w - 22, 118 + i * 54) }); g.fillStyle = '#ffd23c'; g.font = '900 54px Inter Display, Inter'; g.textAlign = 'left'; g.fillText('TOTAL', 22, 350); g.textAlign = 'right'; g.fillText('$ 409', w - 22, 350) });
T.yerba = tex(256, 256, (g, w, h) => { g.fillStyle = '#2f8f3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f6efd2'; g.fillRect(20, 60, w - 40, 130); g.fillStyle = '#1d5c26'; g.font = '900 58px Inter Display, Inter'; g.textAlign = 'center'; g.fillText('YERBA', w / 2, 122); g.font = '800 34px Inter'; g.fillText('MATE · 1 KG', w / 2, 168); g.fillStyle = '#ffd23c'; g.beginPath(); g.ellipse(w / 2, 226, 46, 14, 0, 0, 7); g.fill() });
function bld(mode) { return tex(512, 512, (g, w, h) => { g.fillStyle = mode == 'day' ? '#c9b9a4' : '#161a24'; g.fillRect(0, 0, w, h); for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const lit = mode == 'lit' && Math.random() < .16; g.fillStyle = mode == 'day' ? (Math.random() < .5 ? '#6f8fa8' : '#86a7bf') : lit ? (Math.random() < .5 ? '#ffd58a' : '#ffe7b8') : '#0b0e15'; g.fillRect(x * 64 + 14, y * 64 + 12, 36, 40) } if (mode != 'day') { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, w, h) } }, 6, 2) }
T.bLit = bld('lit'); T.bDark = bld('dark'); T.bDay = bld('day');
T.glow = tex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
function phoneTex(main, sub) { return tex(360, 760, (g, w, h) => { g.fillStyle = '#16060a'; g.fillRect(0, 0, w, h); g.fillStyle = '#d3131f'; g.fillRect(0, 0, w, 250); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(180, 44); g.lineTo(252, 170); g.lineTo(108, 170); g.closePath(); g.fill(); g.fillStyle = '#d3131f'; g.fillRect(172, 86, 16, 50); g.beginPath(); g.arc(180, 152, 9, 0, 7); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '900 34px Inter Display, Inter'; g.fillText('ALERTA EXTREMA', w / 2, 226); g.font = '900 50px Inter Display, Inter'; const words = main.split(' '); let line = '', y = 330; for (const wd of words) { if (g.measureText(line + ' ' + wd).width > 320 && line) { g.fillText(line, w / 2, y); y += 58; line = wd } else line = (line + ' ' + wd).trim() } g.fillText(line, w / 2, y); g.font = '600 30px Inter'; g.fillStyle = '#ffc9cd'; y += 70; let l2 = ''; for (const wd of sub.split(' ')) { if (g.measureText(l2 + ' ' + wd).width > 310 && l2) { g.fillText(l2, w / 2, y); y += 40; l2 = wd } else l2 = (l2 + ' ' + wd).trim() } g.fillText(l2, w / 2, y); g.fillStyle = '#3a0c11'; g.fillRect(60, h - 120, w - 120, 64); g.fillStyle = '#fff'; g.font = '800 28px Inter'; g.fillText('ACEPTAR', w / 2, h - 78) }) }
const ALERTS = [null, ['BUSQUE REFUGIO YA', 'Esto no es un simulacro.'], ['NO LE ABRA A NADIE', 'Aunque conozca la voz.'], ['IMITA VOCES', 'No responda. No abra.'], ['NO SALGA DEL REFUGIO', 'Lo que ve afuera no es real.']];
const PT = ALERTS.map(a => a && phoneTex(a[0], a[1]));
// ------------------------------------------------------------------ builders
const _m = {}; const mat = (c, o = {}) => { const k = c + JSON.stringify(o); return _m[k] || (_m[k] = new THREE.MeshLambertMaterial({ color: c, ...o })) };
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
function add(p, geo, m, x = 0, y = 0, z = 0, sh = 0) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (sh & 1) me.castShadow = true; if (sh & 2) me.receiveShadow = true; p.add(me); return me }
const box = (p, w, h, d, m, x, y, z, sh = 2) => add(p, new THREE.BoxGeometry(w, h, d), m, x, y, z, sh);
const G = { sph: new THREE.SphereGeometry(1, 20, 14), cap: new THREE.CapsuleGeometry(1, 1, 6, 14), cyl: new THREE.CylinderGeometry(1, 1, 1, 16) };
const _cg = {}; const caps = (p, r, len, m, x, y, z, sh = 1) => add(p, _cg[r + '_' + len] || (_cg[r + '_' + len] = new THREE.CapsuleGeometry(r, Math.max(.001, len - 2 * r), 6, 14)), m, x, y, z, sh);
const sph = (p, r, m, x, y, z, sh = 1) => { const me = add(p, G.sph, m, x, y, z, sh); me.scale.setScalar(r); return me };
const glowSprite = (p, col, s, x, y, z) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow, color: col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.scale.set(s, s, 1); sp.position.set(x, y, z); p.add(sp); return sp };
const grp = p => { const g = new THREE.Group(); p.add(g); return g };
// ------------------------------------------------------------------ world: store
const STORE = grp(scene), STREET = grp(scene), DEPO = grp(scene), SHARED = grp(scene);
box(STORE, 16, .1, 22, new THREE.MeshStandardMaterial({ map: T.floor, color: 0xc9c2b6, roughness: .32, metalness: .05 }), 0, -.05, -3, 2);
box(STORE, 16, .1, 22, mat(0x8c9096, { map: T.ceil }), 0, 4.25, -3, 0);
box(STORE, .2, 4.3, 22, mat(0xe8e2d2), -8, 2.1, -3); box(STORE, .2, 4.3, 22, mat(0xe8e2d2), 8, 2.1, -3);
box(STORE, 16, .5, .14, mat(0x0c6b55), 0, .25, -13.9, 0);          // back wall baseboard
// front: low wall, mullions, sign, glass
box(STORE, 16, .45, .25, mat(0x0c6b55), 0, .22, 8); box(STORE, 16, 1.2, .25, mat(0xe8e2d2), 0, 3.65, 8.05);
for (let x = -8; x <= 8; x += 2) box(STORE, .12, 2.7, .16, mat(0x0a4d3e), x, 1.75, 8, 3);
box(STORE, 16, .1, .16, mat(0x0a4d3e), 0, 3.05, 8);
const signM = add(STORE, new THREE.PlaneGeometry(9, 1.05), basic(0xffffff, { map: T.sign }), 0, 3.62, 7.9); signM.rotation.y = PI;
const glass = add(STORE, new THREE.PlaneGeometry(16, 2.6), new THREE.MeshBasicMaterial({ color: 0x9fc4ff, transparent: true, opacity: .07, depthWrite: false }), 0, 1.75, 7.98); glass.rotation.y = PI;
for (const [x, y] of [[-2.9, 1.6], [3.1, 1.9], [-5.2, 1.9], [5.4, 1.5]]) { const p = add(STORE, new THREE.PlaneGeometry(.62, .78), basic(0xffffff, { map: T.oferta }), x, y, 7.93); p.rotation.y = PI }
const shutter = box(STORE, 16, 2.7, .08, mat(0xffffff, { map: T.slat }), 0, 1.75, 8.12, 0);
// ceiling light rows
const ROWZ = [6, 1.5, -3, -7.5, -12], rows = [];
for (const z of ROWZ) { const pm = basic(0xffffff); const ps = []; for (const x of [-5.4, -1.8, 1.8, 5.4]) { box(STORE, 1.5, .06, .42, pm, x, 4.17, z, 0); ps.push(glowSprite(STORE, 0xcfe4ff, 3.4, x, 4.0, z)) } const l = new THREE.PointLight(0xeaf2ff, 0, 15, 1.6); l.position.set(0, 3.7, z); STORE.add(l); rows.push({ pm, ps, l }) }
const keyL = new THREE.SpotLight(0xfff3dd, 0, 14, .95, .7, 1.2); keyL.position.set(-.6, 4.1, 3.2); keyL.target.position.set(0, 0, 4.6); keyL.castShadow = true; keyL.shadow.mapSize.set(1024, 1024); keyL.shadow.bias = -.002; STORE.add(keyL, keyL.target);
const sun = new THREE.DirectionalLight(0xfff0d0, 0); sun.position.set(-4, 7, 16); STORE.add(sun);
// gondolas + products
const PAL = [0xe23d3d, 0xf2a71b, 0x2f8f3a, 0x2c6fd1, 0xf5f0e1, 0x8d4bc4, 0xff7a1a, 0x1fb5a8, 0xd94f93, 0xf2df3a, 0x6b4a2c];
{
  const GX = [-4.6, -1.7, 1.7, 4.6, -7.4, 7.4], items = []; const fm = mat(0xd9c23c), dm = mat(0x8c8f93);
  for (const gx of GX) { const wall = Math.abs(gx) > 7; box(STORE, wall ? .5 : .95, .14, 12.2, fm, gx, .07, -6.6); box(STORE, .06, 1.95, 12.2, dm, gx + (wall ? Math.sign(gx) * .22 : 0), 1.0, -6.6); for (const y of [.22, .68, 1.14, 1.6]) box(STORE, wall ? .5 : .95, .035, 12.2, fm, gx, y, -6.6); box(STORE, wall ? .5 : .95, 1.95, .06, dm, gx, 1.0, -.5); box(STORE, wall ? .5 : .95, 1.95, .06, dm, gx, 1.0, -12.7);
    for (const side of [-1, 1]) { if (wall && side == Math.sign(gx)) continue; for (const y of [.24, .7, 1.16, 1.62]) { let z = -12.5, col = 0, run = 0, h = .3; while (z < -.7) { if (run-- <= 0) { col = PAL[Math.floor(Math.random() * PAL.length)]; run = 2 + Math.floor(Math.random() * 5); h = .2 + Math.random() * .2 } if (Math.random() > .06) items.push([gx + side * .29, y + h / 2, z, h, col]); z += .245 } } } }
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.26, 1, .21), new THREE.MeshLambertMaterial({ color: 0xffffff }), items.length), d = new THREE.Object3D(), c = new THREE.Color();
  items.forEach((it, i) => { d.position.set(it[0], it[1], it[2]); d.scale.set(1, it[3], 1); d.updateMatrix(); im.setMatrixAt(i, d.matrix); im.setColorAt(i, c.setHex(it[4])) }); STORE.add(im);
  for (const x of [-4.6, 4.6]) { const s = add(STORE, new THREE.PlaneGeometry(1.3, .4), basic(0xffd23c), x * .0 + (x < 0 ? -3.15 : 3.15), 3.2, -1); }
}
// checkouts
function checkout(x, main) { const g = grp(STORE); g.position.set(x, 0, 0); box(g, 2.3, .9, .85, mat(0xefe9da), 0, .45, 3.95, 3); box(g, 2.3, .12, .87, mat(0x0c6b55), 0, .32, 3.95, 0); box(g, 1.5, .03, .6, mat(0x1c1d21), .3, .915, 3.95, 2); box(g, .06, .5, .06, mat(0x2a2c30), -.85, 1.15, 4.05, 1); const s = add(g, new THREE.PlaneGeometry(.52, .4), basic(0xffffff, { map: T.reg }), -.85, 1.5, 3.99); s.rotation.y = PI; box(g, .56, .44, .04, mat(0x15171b), -.85, 1.5, 4.02, 1); box(g, .1, .2, .14, mat(0x22252a), -.45, 1.02, 3.72, 1); if (main) { box(g, .2, .26, .09, mat(0xf5f0e1), .55, 1.06, 3.95, 1); box(g, .24, .1, .16, mat(0xe2b23a), .9, .98, 4.0, 1) } return g }
checkout(0, true); checkout(-2.8, false); checkout(2.8, false);
const cPhone = grp(STORE); cPhone.position.set(.42, .925, 3.62); cPhone.rotation.y = .25;
box(cPhone, .08, .012, .165, mat(0x111214), 0, 0, 0, 1); const cPhoneScr = add(cPhone, new THREE.PlaneGeometry(.072, .152), basic(0xffffff, { map: PT[1] }), 0, .0075, 0); cPhoneScr.rotation.x = -PI / 2; cPhoneScr.rotation.z = PI;
const cPhoneL = new THREE.PointLight(0xff2030, 0, 3.5, 1.5); cPhoneL.position.set(0, .25, 0); cPhone.add(cPhoneL);
// back wall with doorway (store side) + depósito sign
for (const g of [SHARED]) { box(g, 7.4, 4.3, .12, mat(0xe8e2d2), -4.3, 2.1, -13.96); box(g, 7.4, 4.3, .12, mat(0xe8e2d2), 4.3, 2.1, -13.96); box(g, 1.2, 2.0, .12, mat(0xe8e2d2), 0, 3.25, -13.96); box(g, .1, 2.3, .2, mat(0x8f1118), -.63, 1.15, -13.98); box(g, .1, 2.3, .2, mat(0x8f1118), .63, 1.15, -13.98); box(g, 1.36, .1, .2, mat(0x8f1118), 0, 2.3, -13.98); const s = add(g, new THREE.PlaneGeometry(1.5, .47), basic(0xffffff, { map: T.depo }), 0, 2.72, -13.89) }
// ------------------------------------------------------------------ world: street
const road = box(STREET, 60, .1, 70, mat(0x23262b), 0, -.1, 40, 0);
box(STREET, 60, .12, 2.4, mat(0x8a8d90), 0, -.02, 9.3, 0);
for (const s of [-1, 1]) box(STREET, 3, .12, 60, mat(0x8a8d90), s * 6, -.02, 41, 0);
for (let z = 13; z < 70; z += 4) box(STREET, .16, .02, 1.8, basic(0xd8d8c8), 0, -.04, z, 0);
const bMat = basic(0xffffff, { map: T.bLit });
for (const s of [-1, 1]) { const p = add(STREET, new THREE.PlaneGeometry(56, 16), bMat, s * 7.6, 8, 40); p.rotation.y = -s * PI / 2 }
{ const p = add(STREET, new THREE.PlaneGeometry(40, 16), bMat, 0, 8, 68); p.rotation.y = PI; for (const s of [-1, 1]) { const q = add(STREET, new THREE.PlaneGeometry(26, 16), bMat, s * 20.5, 8, 12.2); q.rotation.y = PI } }
const lamps = []; const LZ = [52, 42, 32, 22, 13.5];
for (const z of LZ) { const pair = []; for (const s of [-1, 1]) { box(STREET, .12, 5, .12, mat(0x30343a), s * 4.3, 2.5, z, 0); box(STREET, 1.2, .1, .1, mat(0x30343a), s * 3.8, 5, z, 0); const b = sph(STREET, .2, basic(0xffe2a0), s * 3.3, 4.9, z, 0); const gl = glowSprite(STREET, 0xffc870, 3.2, s * 3.3, 4.9, z); const pool = add(STREET, new THREE.CircleGeometry(4.2, 24), new THREE.MeshBasicMaterial({ map: T.glow, color: 0xffb860, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }), s * 3.0, .0, z); pool.rotation.x = -PI / 2; pair.push({ b, gl, pool }) } lamps.push(pair) }
function car(x, z, col, ry) { const g = grp(STREET); g.position.set(x, 0, z); g.rotation.y = ry; box(g, 1.7, .6, 4, mat(col), 0, .6, 0, 0); box(g, 1.5, .55, 2.1, mat(0x1b2530), 0, 1.15, -.2, 0); for (const sx of [-.85, .85]) for (const sz of [-1.3, 1.3]) { const w = add(g, G.cyl, mat(0x111111), sx, .32, sz); w.scale.set(.32, .2, .32); w.rotation.z = PI / 2 } }
car(-3.6, 17, 0x2c6fd1, 0); car(3.6, 27, 0x9a2b2b, 0); car(-3.6, 36, 0x7c8087, 0);
// ------------------------------------------------------------------ world: depósito
const wallM = mat(0xffffff, { map: T.conc });
box(DEPO, 5.2, .1, 6, mat(0xffffff, { map: T.concF }), 0, -.05, -17, 2); box(DEPO, 5.2, .1, 6, mat(0x4a4c4b), 0, 3.15, -17, 2);
box(DEPO, .1, 3.2, 6, wallM, -2.6, 1.6, -17, 2); box(DEPO, .1, 3.2, 6, wallM, 2.6, 1.6, -17, 2); box(DEPO, 5.2, 3.2, .1, wallM, 0, 1.6, -20, 2);
box(DEPO, 1.95, 3.2, .1, wallM, -1.63, 1.6, -14.08, 2); box(DEPO, 1.95, 3.2, .1, wallM, 1.63, 1.6, -14.08, 2); box(DEPO, 1.32, .86, .1, wallM, 0, 2.77, -14.08, 2);
for (const x of [-1.2, .3]) { const p = add(DEPO, G.cyl, mat(0x3d4144), x, 2.95, -17, 3); p.scale.set(.06, 6, .06); p.rotation.x = PI / 2 }
function stack(x, z, n, ry = 0) { const g = grp(DEPO); g.position.set(x, 0, z); g.rotation.y = ry; const m = mat(0xffffff, { map: T.card }); let y = 0; for (let i = 0; i < n; i++) { const h = .38 + hash(x * 7 + i) * .12; const b = box(g, .6, h, .5, m, (hash(i + x) - .5) * .06, y + h / 2, 0, 3); b.rotation.y = (hash(i * 3 + z) - .5) * .3; y += h } }
stack(-2.1, -15.0, 4); stack(-1.5, -14.75, 2, .3); stack(2.15, -17.6, 3, .2); stack(2.1, -18.3, 5, -.1); stack(1.5, -19.5, 2, .5); stack(.6, -19.55, 3); stack(-.4, -19.6, 1, .2);
{ const g = grp(DEPO); g.position.set(-2.3, 0, -17.6); for (const y of [.3, .95, 1.6, 2.25]) box(g, .5, .04, 2.4, mat(0x52575c), 0, y, 0, 3); for (const z of [-1.2, 1.2]) for (const x of [-.24, .24]) box(g, .04, 2.3, .04, mat(0x3a3e42), x, 1.15, z, 1); for (let i = 0; i < 26; i++) { const h = .18 + hash(i) * .2; box(g, .3, h, .2, mat(PAL[i % PAL.length]), 0, [.32, .97, 1.62][i % 3] + h / 2, -1.05 + (i * .083), 3) } }
box(DEPO, .5, .7, .12, mat(0x6d7379), 2.5, 1.6, -15.4, 3);                 // electrical panel
const bulbG = grp(DEPO); bulbG.position.set(0, 3.1, -16.4);
const bulbArm = grp(bulbG); { const w = add(bulbArm, G.cyl, mat(0x111111), 0, -.3, 0, 0); w.scale.set(.008, .6, .008); const sh = add(bulbArm, new THREE.ConeGeometry(.2, .14, 16, 1, true), new THREE.MeshLambertMaterial({ color: 0x2c2f33, side: THREE.DoubleSide }), 0, -.62, 0, 0) }
const bulbM = basic(0xffe9b0); const bulbS = sph(bulbArm, .05, bulbM, 0, -.7, 0, 0); const bulbGl = glowSprite(bulbArm, 0xffcf80, 1.5, 0, -.72, 0);
const bulbL = new THREE.SpotLight(0xffd9a0, 0, 12, 1.25, .55, 1.3); bulbL.position.set(0, -.68, 0); bulbL.castShadow = true; bulbL.shadow.mapSize.set(1024, 1024); bulbL.shadow.bias = -.003; bulbArm.add(bulbL); const bulbT = new THREE.Object3D(); bulbT.position.set(0, -4, 0); bulbArm.add(bulbT); bulbL.target = bulbT;
const bulbP = new THREE.PointLight(0xffc98a, 0, 9, 1.5); bulbP.position.set(0, -.8, 0); bulbArm.add(bulbP);
const depoFill = new THREE.PointLight(0x6f86a8, 0, 9, 1.4); depoFill.position.set(0, 1.4, -17.5); DEPO.add(depoFill);
// door (hinge at x=+.56), shared so it shows from both rooms
const doorH = grp(SHARED); doorH.position.set(.56, 0, -14.02); const doorJ = grp(doorH);
{ const m = new THREE.MeshLambertMaterial({ map: T.steel, color: 0xdfe6ee }), dx = -.56; for (const sx of [-.64, .64]) box(DEPO, .12, 2.34, .08, mat(0x3c4248), sx, 1.17, -14.15, 3); box(DEPO, 1.4, .12, .08, mat(0x3c4248), 0, 2.34, -14.15, 3); const P = (w, h, x, y) => box(doorJ, w, h, .06, m, dx + x, y, 0, 3);
  P(1.12, 1.5, 0, .75); P(1.12, .27, 0, 2.115); P(.32, .5, -.4, 1.74); P(.32, .5, .4, 1.74);
  for (const x of [-.12, 0, .12]) box(doorJ, .022, .5, .03, mat(0x17191c), dx + x, 1.74, 0, 1); for (const y of [1.62, 1.86]) box(doorJ, .48, .022, .03, mat(0x17191c), dx, y, 0, 1);
  for (const s of [-1, 1]) { box(doorJ, .18, .035, .07, mat(0xb9bec4), dx - .38, 1.08, s * .07, 1) } box(doorJ, .1, .16, .08, mat(0x8d7430), dx - .42, .92, 0, 0) }
const eyeGlowM = basic(0xdfe8ff, { transparent: true, opacity: 0 }); const EYES = grp(DEPO); EYES.position.set(0, 1.9, -13.78);
for (const s of [-1, 1]) { const e = sph(EYES, .0085, eyeGlowM, s * .042, 0, 0, 0); glowSprite(EYES, 0xcfd8ff, .09, s * .05, 0, .02).material.opacity = .0; } const eyesGl = glowSprite(EYES, 0x9fb4ff, .16, 0, 0, .02); eyesGl.material.opacity = 0;
// dust
const DUSTN = 90, dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(DUSTN * 3), 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xcfc6b4, size: .022, transparent: true, opacity: 0, depthWrite: false })); dust.frustumCulled = false; DEPO.add(dust);
// ------------------------------------------------------------------ lights (global)
const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x56524a, 1); scene.add(hemi);
// ------------------------------------------------------------------ characters
const eyeW = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0 }), pupM = mat(0x0a0a0a), mouthM = mat(0x3a0d12), teethM = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0 });
function makeChar(o) {
  const g = grp(scene), b = grp(g), sk = mat(o.skin), sh = mat(o.shirt), pa = mat(o.pants); const c = { g, b, o, L: [], A: [] };
  for (const s of [-1, 1]) { const l = grp(b); l.position.set(s * .1, .8, 0); caps(l, .085, .78, pa, 0, -.37, 0); box(l, .13, .08, .24, mat(0x1b1b1d), 0, -.76, .04, 1); c.L.push(l) }
  const up = grp(b); up.position.y = .8; c.up = up;
  if (o.skirt) { const s = add(up, new THREE.CylinderGeometry(.19, .3, .62, 16), mat(o.skirt), 0, -.22, 0, 1) }
  const to = caps(up, .2, .66, sh, 0, .3, 0); to.scale.set(1, 1, .74);
  if (o.tie) box(up, .06, .3, .02, mat(o.tie), 0, .36, .145, 0); if (o.apron) box(up, .26, .36, .02, mat(o.apron), 0, .24, .15, 0);
  for (const s of [-1, 1]) { const a = grp(up); a.position.set(s * .265, .54, 0); caps(a, .062, .58, sh, 0, -.27, 0); const h = sph(a, .07, sk, 0, -.6, 0, 1); c.A.push(a); a.userData.hand = h }
  const nk = add(up, G.cyl, sk, 0, .66, 0, 0); nk.scale.set(.06, .1, .06);
  const hd = grp(up); hd.position.set(0, .7, 0); hd.rotation.order = 'YXZ'; c.head = hd;
  const sk2 = sph(hd, .2, sk, 0, .18, 0, 1); sk2.scale.set(.2, .215, .2);
  c.eyes = []; for (const s of [-1, 1]) { const e = grp(hd); e.position.set(s * .078, .21, .162); sph(e, .05, eyeW, 0, 0, 0, 0); const p = sph(e, .024, pupM, 0, 0, .034, 0); e.userData.p = p; c.eyes.push(e); const br = box(hd, .09, .018, .02, mat(o.hair == 0xf2f2f2 ? 0xbdbdbd : 0x1c1410), s * .078, .285, .18, 0); br.rotation.z = -s * .12; c['brow' + s] = br }
  sph(hd, .028, sk, 0, .155, .2, 0);
  c.mouth = sph(hd, .045, mouthM, 0, .075, .178, 0); c.mouth.scale.set(.05, .014, .02);
  const sm = grp(hd); sm.position.set(0, .115, .168); const tor = add(sm, new THREE.TorusGeometry(.085, .02, 8, 20, PI), mouthM, 0, 0, 0, 0); tor.rotation.z = PI; const fill = add(sm, new THREE.CircleGeometry(.083, 20, PI, PI), mouthM, 0, 0, .004); const te = box(sm, .13, .028, .01, teethM, 0, -.016, .012, 0); sm.scale.set(1, 1, .6); sm.visible = false; c.smile = sm;
  const hm = mat(o.hair);
  if (o.style == 'bun') { const h = add(hd, new THREE.SphereGeometry(.212, 20, 12, 0, 2 * PI, 0, PI * .5), hm, 0, .2, -.012, 1); h.scale.set(1, 1.06, 1.04); h.rotation.x = -.62; sph(hd, .09, hm, 0, .4, -.12, 1) }
  else if (o.style == 'afro') { const h = sph(hd, .26, hm, 0, .27, -.05, 1); h.scale.set(.27, .24, .25) }
  else if (o.style == 'short') { const h = add(hd, new THREE.SphereGeometry(.21, 20, 12, 0, 2 * PI, 0, PI * .46), hm, 0, .195, -.01, 1) }
  else if (o.style == 'long') { const h = add(hd, new THREE.SphereGeometry(.215, 20, 12, 0, 2 * PI, 0, PI * .5), hm, 0, .195, -.01, 1); box(hd, .4, .34, .16, hm, 0, .08, -.13, 1) }
  else if (o.style == 'cap') { const h = add(hd, new THREE.SphereGeometry(.212, 20, 12, 0, 2 * PI, 0, PI * .45), hm, 0, .2, 0, 1); box(hd, .22, .02, .14, hm, 0, .29, .22, 1) }
  if (o.stache) box(hd, .11, .03, .03, mat(0x1c1410), 0, .115, .195, 0);
  if (o.yerba) { const y = box(c.A[0].userData.hand.parent, .13, .2, .075, mat(0xffffff, { map: T.yerba }), 0, -.72, .03, 1); c.yerba = y }
  g.scale.setScalar(o.h || 1); return c;
}
const lookTmp = V(0, 0, 0);
function pose(c, p = {}) {
  const t = p.t || 0, g = c.g; g.visible = p.vis !== false; if (!g.visible) return;
  g.position.set(p.x || 0, 0, p.z || 0); g.rotation.set(0, p.ry || 0, 0);
  const run = p.run || 0, ph = (p.phase ?? t * 11) + (c.o.seed || 0), sw = Math.sin(ph) * run;
  c.b.position.y = run ? Math.abs(Math.cos(ph)) * .06 * run : Math.sin(t * 1.6 + (c.o.seed || 0)) * .004;
  c.b.rotation.set((p.lean ?? c.o.lean ?? 0) + run * .22, 0, Math.sin(t * .9 + (c.o.seed || 0)) * .012 + (p.tremble ? Math.sin(t * 43) * .008 * p.tremble : 0));
  c.L[0].rotation.x = sw * .95; c.L[1].rotation.x = -sw * .95;
  const aL = p.aL || [0, 0], aR = p.aR || [0, 0];
  c.A[0].rotation.set(aR[0] - sw * 1.1 - run * .2, 0, -.07 - (aR[1] || 0)); c.A[1].rotation.set(aL[0] + sw * 1.1 - run * .2, 0, .07 + (aL[1] || 0));
  let hy = p.hy ?? 0, hp = p.hp ?? 0;
  if (p.look) { lookTmp.copy(p.look); g.worldToLocal(lookTmp); hy = cl(Math.atan2(lookTmp.x, lookTmp.z), -1.25, 1.25); hp = cl(-Math.atan2(lookTmp.y - 1.6, Math.hypot(lookTmp.x, lookTmp.z)), -.5, .6) - (p.lean ?? c.o.lean ?? 0) }
  if (p.hyAbs !== undefined) hy = p.hyAbs;
  c.head.rotation.set(hp + (p.talk ? Math.sin(t * 9) * .02 : 0), hy, p.hr || 0);
  const es = p.eye || 1, ps = p.pupil || 1; for (const e of c.eyes) { e.scale.setScalar(es); e.userData.p.scale.setScalar(.024 * ps / 1) ; e.scale.y = es * (hash(Math.floor(t * 1.0 + (c.o.seed || 0)) * 3.1) > .86 && (t % 1) < .1 && !p.noblink ? .1 : 1) }
  const smile = p.smile || 0; c.smile.visible = smile > .01; c.mouth.visible = smile < .5;
  c.smile.scale.set(.55 + .4 * smile, .45 + .45 * smile, .6); const tk = p.talk || 0;
  c.mouth.scale.set(.05 - tk * .008, .012 + tk * .034, .02); if (smile > .01 && tk) c.smile.scale.y *= 1 + tk * .25;
  const bd = p.brow || 0; c['brow-1'].position.y = c.brow1.position.y = .285 + bd * .03; c['brow-1'].rotation.z = .12 - bd * .3; c.brow1.rotation.z = -.12 + bd * .3;
}
const talk = (id, t) => { const l = Ln[id]; if (!l || t < l.start || t > l.end) return 0; for (const w of l.words) if (t >= w[1] && t <= w[2] + .04) return .3 + .7 * Math.abs(Math.sin(t * 17)); return 0 };
const VIEJA = { skin: 0xe0a680, shirt: 0x6a2fa3, pants: 0xc9b89a, skirt: 0x7d7f86, hair: 0xf2f2f2, style: 'bun', h: .86, lean: .1, yerba: 1, seed: 1 };
const vieja = makeChar(VIEJA), fig = makeChar({ ...VIEJA, seed: 5 });
const nico = makeChar({ skin: 0x8a5a3c, shirt: 0x1f9a5b, pants: 0x1d2a44, hair: 0x15100c, style: 'afro', apron: 0x0c6b55, seed: 2 });
const raul = makeChar({ skin: 0xd8a47f, shirt: 0xf2f2ee, pants: 0x22252b, hair: 0x1c1410, style: 'short', tie: 0xb3131d, stache: 1, h: 1.04, seed: 3 });
const CUST = [[0xe0b08c, 0x2c6fd1, 0x30323a, 0x3a2414, 'short'], [0x6f4630, 0xe23d3d, 0x2b3550, 0x0f0c0a, 'long'], [0xf0c7a2, 0xf2a71b, 0x4a4036, 0x7a4a1c, 'cap'], [0xc98d68, 0x1fb5a8, 0x22252b, 0x15100c, 'afro'], [0xe0b08c, 0xd94f93, 0x3b3f55, 0x54301a, 'long'], [0x8a5a3c, 0xf5f0e1, 0x30323a, 0x15100c, 'short'], [0xf0c7a2, 0x6b4a2c, 0x1d2a44, 0xd9d9d9, 'short'], [0xc98d68, 0x8d4bc4, 0x22252b, 0x3a2414, 'long'], [0xe0b08c, 0x2f8f3a, 0x4a4036, 0x15100c, 'cap'], [0x6f4630, 0xf2df3a, 0x2b3550, 0x0f0c0a, 'short'], [0xf0c7a2, 0xe23d3d, 0x30323a, 0x7a4a1c, 'long']]
  .map((a, i) => makeChar({ skin: a[0], shirt: a[1], pants: a[2], hair: a[3], style: a[4], h: .9 + hash(i * 5.3) * .18, seed: 10 + i * 1.7 }));
const SIL = [0, 1, 2, 3].map(i => makeChar({ skin: 0x06070a, shirt: 0x06070a, pants: 0x06070a, hair: 0x06070a, style: 'short', seed: 30 + i, h: .95 + i * .04 }));
const ALLCH = [vieja, fig, nico, raul, ...CUST, ...SIL];
// ------------------------------------------------------------------ POV rig
const rig = grp(cam); const sleeve = mat(0x1f9a5b), skinP = mat(0x9a6a48);
function povArm(s) { const a = { s, fore: add(rig, G.cyl, sleeve, 0, 0, 0, 0), hand: grp(rig) }; const h = sph(a.hand, .05, skinP, 0, 0, 0, 0); h.scale.set(.047, .03, .06); const th = caps(a.hand, .013, .06, skinP, -s * .045, .005, -.025, 0); th.rotation.set(1.2, 0, s * .6); for (let i = 0; i < 4; i++) { const f = caps(a.hand, .0095, .07, skinP, -s * .03 + s * i * .02, 0, -.07, 0); f.rotation.x = PI / 2 - .25 } return a }
const armR = povArm(1), armL = povArm(-1); const _a = V(0, 0, 0), _b = V(0, 0, 0), _up = V(0, 1, 0);
function setArm(a, hx, hy, hz, rx = 0, ry = 0, rz = 0) { a.hand.position.set(hx, hy, hz); a.hand.rotation.set(rx, ry, rz); _a.set(a.s * .34, -.55, .12); _b.set(hx, hy, hz + .03); const d = _b.clone().sub(_a), len = d.length(); a.fore.position.copy(_a).addScaledVector(d, .5); a.fore.scale.set(.043, len - .03, .043); a.fore.quaternion.setFromUnitVectors(_up, d.normalize()) }
const phone = grp(rig); box(phone, .078, .16, .01, mat(0x0c0d0f), 0, 0, 0, 0); const phoneScr = add(phone, new THREE.PlaneGeometry(.07, .148), basic(0xffffff, { map: PT[1] }), 0, 0, .0056, 0);
const phoneL = new THREE.PointLight(0xff3040, 0, 4, 1.5); phoneL.position.set(0, -.1, -.3); rig.add(phoneL);
const flash = new THREE.SpotLight(0xeef3ff, 0, 16, .36, .55, 1.1); flash.position.set(.12, -.2, -.3); flash.castShadow = true; flash.shadow.mapSize.set(1024, 1024); flash.shadow.bias = -.002; rig.add(flash); const flashT = new THREE.Object3D(); flashT.position.set(.0, -.02, -6); rig.add(flashT); flash.target = flashT;
const knees = grp(rig); for (const s of [-1, 1]) { const k = caps(knees, .085, .75, mat(0x1d2a44), s * .13, -.52, -.5, 0); k.rotation.x = -1.15; box(knees, .12, .09, .2, mat(0x151517), s * .13, -.72, -.98, 0) }
// arm poses: rest | counter | phone | flash | reach | beckon | run
function arms(t, w) {
  const o = { rest: 0, counter: 0, phone: 0, flash: 0, reach: 0, beckon: 0, run: 0, ...w }; const sum = Math.max(1e-6, Object.values(o).reduce((a, b) => a + b, 0)); if (sum < 1) o.rest += 1 - sum;
  const P = { rest: [[.2, -.62, -.3, 0, 0, 0], [-.2, -.62, -.3, 0, 0, 0]], counter: [[.19, -.335, -.5, -.1, .15, 0], [-.19, -.34, -.48, -.1, -.15, 0]], phone: [[.075, -.245, -.4, .6, -.2, .1], [-.2, -.6, -.3, 0, 0, 0]], flash: [[.15, -.25, -.42, .1, 0, .2], [-.2, -.62, -.3, 0, 0, 0]], reach: [[.1, -.1 + Math.sin(t * 31) * .004, -.62, .15, 0, -.4], [-.2, -.62, -.3, 0, 0, 0]], beckon: [[.18 + Math.sin(t * 13) * .05, -.1, -.6, .9, 0, -.2], [-.2, -.5, -.35, 0, 0, 0]], run: [[.2, -.36 + Math.sin(t * 11) * .1, -.42, 0, 0, 0], [-.2, -.36 - Math.sin(t * 11) * .1, -.42, 0, 0, 0]] };
  const tot = Object.values(o).reduce((a, b) => a + b, 0);
  for (const [a, i] of [[armR, 0], [armL, 1]]) { const r = [0, 0, 0, 0, 0, 0]; for (const k in o) if (o[k] > 0) for (let j = 0; j < 6; j++) r[j] += P[k][i][j] * o[k] / tot; setArm(a, ...r) }
  const pv = Math.max(o.phone, o.flash) / tot; phone.visible = pv > .3;
  if (o.flash > o.phone) { phone.position.set(.15, -.2, -.47); phone.rotation.set(-1.25, 0, .2) } else { phone.position.set(.035, -.165 - (1 - cl(o.phone / tot)) * .3, -.43); phone.rotation.set(-.42, -.08, .05) }
}
// ------------------------------------------------------------------ camera path
function path(keys) { let py = 0; return keys.map(k => { const [t, p, tg, fov] = k; let yaw, pitch; if (Array.isArray(tg)) { yaw = Math.atan2(tg[0] - p[0], tg[2] - p[2]); pitch = Math.atan2(tg[1] - p[1], Math.hypot(tg[0] - p[0], tg[2] - p[2])); while (yaw - py > PI) yaw -= 2 * PI; while (yaw - py < -PI) yaw += 2 * PI } else { yaw = tg.yaw * PI / 180; pitch = (tg.pitch || 0) * PI / 180 } py = yaw; return { t, p, yaw, pitch, fov } }) }
function evalPath(K, t) { let i = 0; while (i < K.length - 2 && t > K[i + 1].t) i++; const a = K[i], b = K[Math.min(i + 1, K.length - 1)], k = ss(ramp(t, a.t, b.t === a.t ? a.t + 1e-6 : b.t)); return { p: [0, 1, 2].map(j => lerp(a.p[j], b.p[j], k)), yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k), fov: lerp(a.fov, b.fov, k) } }
function setCam(c, t, shake = 1, bob = 0, jolt = 0) { cam.position.set(c.p[0] + sn(t * .7, 1) * .012 * shake, c.p[1] + sn(t * .9, 2) * .01 * shake + Math.abs(Math.sin(t * 11)) * .09 * bob, c.p[2]); cam.rotation.set(c.pitch + sn(t * 1.1, 3) * .012 * shake + Math.sin(t * 22) * .012 * bob + (hash(Math.floor(t * 30)) - .5) * .05 * jolt, c.yaw + PI + sn(t * .8, 4) * .014 * shake + (hash(Math.floor(t * 30) + 9) - .5) * .05 * jolt, sn(t * .6, 5) * .008 * shake + Math.sin(t * 11) * .02 * bob); cam.fov = c.fov; cam.updateProjectionMatrix() }
// ------------------------------------------------------------------ environment
const bg = new THREE.Color(); scene.background = bg;
function env(o) {
  STORE.visible = !!o.store; STREET.visible = !!o.store; DEPO.visible = !!o.depo;
  const r = o.rows || [0, 0, 0, 0, 0]; rows.forEach((w, i) => { w.l.intensity = r[i] * (o.rowI ?? 13); w.pm.color.setScalar(.04 + r[i] * 1.2); for (const s of w.ps) s.material.opacity = r[i] * .55 });
  keyL.intensity = (r[0]) * (o.keyI ?? 34); sun.intensity = o.sun || 0; hemi.intensity = o.hemi ?? .3; hemi.color.setHex(o.hemiC ?? 0xdfe9ff);
  bg.setHex(o.bg ?? 0x04060b); scene.fog.color.setHex(o.fog ?? o.bg ?? 0x04060b); scene.fog.density = o.fogD ?? .018; R.toneMappingExposure = o.exp ?? 1;
  const st = o.street || {}; lamps.forEach((pair, i) => { const on = (st.lamps ? st.lamps[i] : 0); for (const l of pair) { l.b.material.color.setHex(on ? 0xffe2a0 : 0x1a1a1a); l.gl.material.opacity = on * .9; l.pool.material.opacity = on * .5 } });
  bMat.map = st.day ? T.bDay : (st.lit ?? 0) > .5 ? T.bLit : T.bDark; bMat.color.setScalar(st.day ? 1 : (st.lit ?? 0) > .5 ? .2 + .5 * ((st.lit - .5) * 2) : .45); road.material.color.setHex(st.day ? 0x55585c : 0x23262b);
  shutter.scale.y = Math.max(.001, o.shut ?? 0); shutter.position.y = 3.1 - 1.35 * (o.shut ?? 0); shutter.visible = (o.shut ?? 0) > .002; glass.material.opacity = st.day ? .04 : .08;
  const bi = o.bulb ?? 0; bulbL.intensity = bi * 30; bulbP.intensity = bi * 5; bulbM.color.setScalar(.05 + bi * 1.4); bulbGl.material.opacity = bi * .8; bulbArm.rotation.z = o.swing ?? 0; depoFill.intensity = o.fill ?? 0;
  doorJ.rotation.y = o.door ?? 0; doorH.position.z = -14.02 + (o.doorJolt ?? 0);
  const e = o.eyes ?? 0; eyeGlowM.opacity = e * .85; eyesGl.material.opacity = e * .22; EYES.position.set((o.eyesX ?? 0), 1.8 + (o.eyesY ?? 0), -13.8); EYES.scale.y = o.eyesBlink ?? 1;
  eyeW.emissiveIntensity = teethM.emissiveIntensity = o.eyeGlow ?? 0;
  flash.intensity = (o.flash ?? 0) * 11; phoneL.color.setHex(o.phoneC ?? 0xff3040); phoneL.intensity = o.phoneL ?? 0; for (const l of [flash, phoneL, cPhoneL, keyL, sun, bulbL, bulbP, depoFill]) l.visible = l.intensity > 0.0001; knees.visible = !!o.knees;
  cPhone.visible = !!o.cPhone; cPhoneL.intensity = o.cPhoneL ?? 0; cPhoneL.visible = cPhoneL.intensity > 0; if (o.cPhone) cPhone.position.x = .42 + (o.cPhoneBuzz ? Math.sin(o.cPhoneBuzz * 190) * .004 : 0);
  if (o.alertTex) { phoneScr.material.map = PT[o.alertTex]; cPhoneScr.material.map = PT[o.alertTex] }
}
function knockJolt(t, t0, n, gap) { let j = 0; for (let i = 0; i < n; i++) { const d = t - (t0 + i * gap); if (d >= 0 && d < .25) j += Math.sin(d * 60) * Math.exp(-d * 18) * .018 } return j }
function setDust(t, events) { const a = dustGeo.attributes.position.array; let op = 0; for (let i = 0; i < DUSTN; i++) { const ev = events[i % events.length], d = t - ev - hash(i) * .08; if (d < 0 || d > 2.2) { a[i * 3 + 1] = -5; continue } op = Math.max(op, 1 - d / 2.2); a[i * 3] = (hash(i * 3.1) - .5) * 1.5 + Math.sin(d * 2 + i) * .03; a[i * 3 + 1] = 2.32 - (hash(i * 5.7) * .2) - d * (.25 + hash(i * 1.3) * .5) - d * d * .12; a[i * 3 + 2] = -14.25 - hash(i * 9.1) * .35 } dustGeo.attributes.position.needsUpdate = true; dust.material.opacity = op * .8 }
const hideAll = () => { for (const c of ALLCH) c.g.visible = false };
// ------------------------------------------------------------------ overlay
const $ = id => document.getElementById(id), D = { sub: $('sub'), who: $('who'), alert: $('alert'), title: $('title'), end: $('end'), black: $('black'), white: $('white'), red: $('red'), tag: $('tag'), grain: $('grain'), tint: $('tint') };
{ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), im = g.createImageData(512, 512); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255 } g.putImageData(im, 0, 0); D.grain.style.backgroundImage = `url(${c.toDataURL()})` }
D.tag.innerHTML = `NO ABRAS<b>PARTE ${PART}/3</b>`; D.title.querySelector('.p i').textContent = `PARTE ${PART}`;
const SPK = { yo: ['#ffe14d', 'YO', 0], in: ['#8fe3ff', '', 1], vieja: ['#d0a6ff', 'LA SEÑORA', 0], cosa: ['#ff4558', '¿¿??', 1], nico: ['#ffa94d', 'NICO', 0], raul: ['#7dffb0', 'RAÚL', 0], pa: ['#c9d1da', 'ALTAVOZ', 1] };
for (const l of C.lines) { l.chunks = []; let cur = [], n = 0; for (const w of l.words) { cur.push(w); n += w[0].length + 1; if (n > 15 || /[.?!…,:]$/.test(w[0]) && cur.length > 1) { l.chunks.push(cur); cur = []; n = 0 } } if (cur.length) { if (cur.length == 1 && l.chunks.length && cur[0][0].length < 6) l.chunks[l.chunks.length - 1].push(...cur); else l.chunks.push(cur) } }
let subKey = '';
function overlay(t, o) {
  // subtitles (latest started active line wins, PA has lowest priority)
  let L = null; for (const l of C.lines) if (t >= l.start - .05 && t < l.end + .3) { if (!L || (l.cls != 'pa' && (L.cls == 'pa' || l.start > L.start))) L = l }
  if (L && !o.noSub) { let ci = 0; for (let i = 0; i < L.chunks.length; i++) if (t >= L.chunks[i][0][1] - .06) ci = i; const ch = L.chunks[ci], sp = SPK[L.cls], key = L.id + ci;
    if (key != subKey) { subKey = key; D.sub.innerHTML = ch.map(w => `<span>${w[0].replace(/</g, '')}</span>`).join(''); D.sub.className = sp[2] ? 'it' : ''; D.who.textContent = sp[1]; D.who.style.color = sp[0] }
    const k = sr(t, ch[0][1] - .06, ch[0][1] + .08); const jit = L.cls == 'cosa' ? [(hash(Math.floor(t * 30)) - .5) * 5, (hash(Math.floor(t * 30) + 4) - .5) * 5] : [0, 0];
    D.sub.style.opacity = 1; D.who.style.opacity = sp[1] ? .95 : 0; D.sub.style.transform = `translate(${jit[0]}px,${jit[1]}px) scale(${.82 + .18 * k})`;
    [...D.sub.children].forEach((s, i) => { const w = ch[i], act = t >= w[1] - .03 && (i == ch.length - 1 || t < ch[i + 1][1] - .03), done = t >= w[1] - .03; s.style.color = act ? sp[0] : done ? '#fff' : 'rgba(255,255,255,.55)'; s.style.transform = `scale(${act ? 1.07 : 1}) translateY(${act ? -5 : 0}px)` })
  } else { D.sub.style.opacity = 0; D.who.style.opacity = 0; subKey = '' }
  // alert banner
  const a = o.alert; if (a && a.k > .001) { D.alert.style.display = 'block'; D.alert.querySelector('.m').textContent = ALERTS[a.n][0]; D.alert.querySelector('.s').textContent = ALERTS[a.n][1]; const b = a.k < 1 ? 1 + Math.sin(a.k * PI) * .06 : 1; D.alert.style.transform = `translateY(${(1 - ss(a.k)) * -520}px) scale(${b}) rotate(${(a.buzz || 0) * Math.sin(t * 95) * .7}deg)`; D.alert.style.boxShadow = `0 18px 50px rgba(0,0,0,.65),0 0 ${30 + 30 * Math.sin(t * 9)}px rgba(255,40,50,.55)` } else D.alert.style.display = 'none';
  // title
  const ti = o.title ?? 0; if (ti > .001) { D.title.style.display = 'block'; D.title.style.opacity = cl(ti * 2); D.title.style.transform = `scale(${1.5 - .5 * ss(cl(ti * 1.6))}) rotate(-3deg)`; D.title.style.top = (o.titleY ?? 560) + 'px' } else D.title.style.display = 'none';
  D.tag.style.opacity = o.tag ?? .92;
  D.black.style.opacity = o.black ?? 0; D.white.style.opacity = o.white ?? 0; D.red.style.opacity = o.red ?? 0;
  D.tint.style.background = o.tint || 'transparent'; D.grain.style.backgroundPosition = `${Math.floor(hash(t * 31) * 512)}px ${Math.floor(hash(t * 17 + 3) * 512)}px`; D.grain.style.opacity = o.grain ?? .11;
  // end card
  const e = o.end; if (e) { const k = e.k; D.end.style.display = 'block'; D.end.style.opacity = sr(k, 0, .35); const q = D.end.querySelector('.q'); q.querySelector('.b').innerHTML = q.querySelector('.f').innerHTML = e.q; q.style.transform = `scale(${1.25 - .25 * sr(k, 0, .4)}) rotate(-2deg)`;
    const A = $('oa'), B = $('ob'); A.querySelector('span').textContent = e.a || ''; B.querySelector('span').textContent = e.b || ''; A.style.display = B.style.display = e.a ? 'block' : 'none';
    A.style.transform = `translateX(${(1 - sr(k, .5, .85)) * -1100}px) scale(${1 + .03 * Math.sin(t * 5)})`; B.style.transform = `translateX(${(1 - sr(k, .75, 1.1)) * 1100}px) scale(${1 + .03 * Math.sin(t * 5 + 2)})`;
    $('cta').textContent = e.cta; $('cta').style.opacity = sr(k, 1.2, 1.5); $('cta').style.transform = `translateY(${-6 * Math.abs(Math.sin(t * 4))}px)`; $('cta').style.top = (e.a ? 1300 : 900) + 'px';
    $('nxt').innerHTML = e.nxt; $('nxt').style.opacity = sr(k, 1.6, 1.9); $('nxt').style.top = (e.a ? 1420 : 1040) + 'px' } else D.end.style.display = 'none';
}
// ================================================================== PART 1
const Pc = [0, 1.58, 2.9], VF = [0, 1.4, 4.95], WIN = [0, 1.74, -14];
let K1, K2, K3;
function P1(t) {
  const lo = M.lights_out, vj = { t, x: 0, z: 4.95, ry: PI, look: cam.position, noblink: 0 }, O = { tag: sr(t, 3.6, 4.2) * .92 };
  K1 = K1 || path([[0, Pc, [.42, .93, 3.62], 60], [M.buzz1 + .75, Pc, [.42, .93, 3.62], 56], [2.3, Pc, VF, 70], [Ln.v1.start, Pc, VF, 70], [Ln.v1.end, Pc, VF, 64], [Ln.y1.start + .35, Pc, [0, .95, 4.95], 66], [Ln.y1.end, Pc, [0, .95, 4.95], 64],
    [Ln.n1.start + .35, Pc, [-2.3, 1.55, 4.4], 62], [Ln.n1.end, Pc, [-2.3, 1.55, 4.4], 60], [M.street_out + .3, Pc, [-.6, 3.6, 30], 58], [M.street_out + 3.4, Pc, [-.5, 3.4, 30], 44], [Ln.h2.end, Pc, [-.4, 3.2, 30], 40],
    [M.panic + .35, Pc, [1.5, 1.7, 5.9], 54], [M.shutter - .1, Pc, [1.5, 1.7, 5.9], 52], [M.shutter + .5, Pc, [.5, 2.1, 8], 72], [M.run - .1, Pc, [.3, 2.0, 8], 72],
    [M.run + .5, [0, 1.6, 1.6], { yaw: 180, pitch: -3 }, 90], [M.turn - .3, [0, 1.6, -12.4], { yaw: 180, pitch: -2 }, 94], [M.turn + .35, [0, 1.6, -13.3], { yaw: 360, pitch: -2 }, 70], [Ln.y2.end, [0, 1.6, -13.4], { yaw: 360, pitch: -2 }, 68],
    [Ln.v2.start, [0, 1.6, -13.5], { yaw: 360, pitch: -3 }, 62], [Ln.v2.end, [0, 1.6, -13.7], { yaw: 360, pitch: -3 }, 46], [Ln.r2.start + .8, [0, 1.6, -13.8], { yaw: 360, pitch: -3 }, 46], [Ln.r2.start + 1.2, [0, 1.6, -14.2], { yaw: 360, pitch: -4 }, 62], [M.slam, [0, 1.6, -14.9], { yaw: 360, pitch: -2 }, 66],
    [M.slam + .05, [0, 1.56, -17.3], { yaw: 360, pitch: 3 }, 70], [M.buzz2 + .5, [0, 1.56, -17.3], { yaw: 360, pitch: -9 }, 66], [Ln.y3.end + .1, [0, 1.56, -17.3], { yaw: 360, pitch: -9 }, 64], [M.knock + .14, [0, 1.56, -17.3], { yaw: 360, pitch: 3 }, 60], [Ln.c1.start, [0, 1.56, -17.1], { yaw: 360, pitch: 3 }, 60], [Ln.c1.end, [0, 1.6, -15.9], { yaw: 360, pitch: 3 }, 54],
    [Ln.n2.start + .4, [0, 1.6, -15.9], { yaw: 398, pitch: 0 }, 58], [Ln.n2.end, [0, 1.6, -15.9], { yaw: 398, pitch: 0 }, 56], [Ln.r3.start + .4, [0, 1.6, -15.9], { yaw: 305, pitch: 1 }, 58], [Ln.r3.end + .2, [0, 1.6, -15.9], { yaw: 305, pitch: 1 }, 56],
    [M.eyes + .25, [0, 1.6, -15.9], { yaw: 360, pitch: 4 }, 52], [Ln.c2.start, [0, 1.64, -15.5], { yaw: 360, pitch: 4 }, 44], [M.sting, [0, 1.7, -15.0], { yaw: 360, pitch: 3 }, 32], [M.sting + .5, [0, 1.72, -14.9], { yaw: 360, pitch: 3 }, 29], [C.dur, [0, 1.72, -14.85], { yaw: 360, pitch: 3 }, 28]]);
  const c = evalPath(K1, t); hideAll();
  if (t < M.slam) {
    const so = M.street_out, run = t > M.run && t < M.turn, pan = t > M.panic;
    // weeping-angel lights: rows go out front->back, she is always under the nearest lit row
    const outT = [lo, lo + .5, lo + 1.0, Ln.r2.start + .9, M.slam - .12], rowsI = ROWZ.map((_, i) => t >= outT[i] ? 0 : (pan ? .78 + .22 * (hash(Math.floor(t * 14) + i) > .25 ? 1 : .3) : 1));
    if (t >= outT[0] - .12 && t < outT[0]) rowsI[0] = hash(Math.floor(t * 40)) > .5 ? 1 : .1;
    const stage = outT.filter(x => t >= x).length, VZ = [4.95, .9, -3.4, -7.6, -11.6][Math.min(stage, 4)];
    env({ store: 1, rows: rowsI, hemi: .1 + .12 * rowsI.reduce((a, b) => a + b) / 5, bg: 0x05070d, fogD: .012 + (pan ? .006 : 0), exp: 1.05,
      street: { lamps: LZ.map((_, i) => t < so + i * .55 ? 1 : 0), lit: 1 - ramp(t, so + 2.9, so + 4.4) * .9 }, shut: sr(t, M.shutter, M.shutter + 1.9),
      cPhone: t < Ln.y1.start - .3, cPhoneL: t > M.buzz1 ? 1.2 + Math.sin(t * 12) : 0, cPhoneBuzz: t > M.buzz1 && t < M.buzz1 + 2.2 ? t : 0, alertTex: 1, phoneL: win(t, Ln.y1.start - .2, Ln.y1.end + .3) * .5,
      door: t > M.run ? -1.9 + 1.9 * Math.pow(ramp(t, M.slam - .38, M.slam), 2) : 0, eyeGlow: stage >= 4 ? 1.1 : 0 });
    // vieja
    if (t < M.run + .4) { const lookBack = win(t, so + 1.6, Ln.h2.end + .3, .8, .5); pose(vieja, { ...vj, x: lookBack * .95, z: 4.95 + lookBack * .5, look: lookBack > .5 ? V(0, 2.2, 40) : cam.position, ry: PI - lookBack * 2.3, talk: talk('v1', t), aR: [-.25 - win(t, Ln.v1.start, Ln.v1.end + .2) * .9, 0], brow: win(t, Ln.v1.start, Ln.v1.end) }) }
    else if (t >= M.turn - .2) { const near = stage >= 3; pose(vieja, { ...vj, z: VZ, look: V(0, 1.6, -13.5), hr: stage >= 1 ? .22 + stage * .04 : 0, smile: stage >= 1 ? .35 + stage * .12 : 0, eye: 1 + stage * .09, pupil: stage >= 1 ? .7 : 1, talk: talk('v2', t), aR: [stage >= 1 ? -1.25 : -.2, 0], noblink: 1, lean: .1 + stage * .02 }) }
    // nico & raul
    if (t < M.run) { pose(nico, { t, x: -2.3, z: 4.45, ry: PI - .9, look: t > so + .8 && t < M.panic ? V(0, 1.6, 30) : cam.position, talk: talk('n1', t), smile: win(t, Ln.n1.start - .3, Ln.n1.end + .5) * .5, aL: [-win(t, Ln.n1.start, Ln.n1.end) * .5, win(t, Ln.n1.start, Ln.n1.end) * .5], aR: [-.9, -.25] });
      if (pan) { const rin = sr(t, M.panic - .2, M.panic + .7); pose(raul, { t, x: lerp(6.5, 1.5, rin), z: lerp(7.0, 5.9, rin), ry: t < M.shutter - .2 ? PI + .5 : .3, run: (1 - rin) * 1, look: t < M.shutter - .2 ? cam.position : V(1.5, 3, 8), talk: talk('r1', t), brow: -1, aL: [t > M.shutter - .2 ? -2.9 : -1.9 - Math.sin(t * 14) * .4, .3], aR: [t > M.shutter - .2 ? -2.9 : -.4, 0] }) } }
    else if (t < M.turn + .1) { const k = ramp(t, M.run - .2, M.turn - .1); pose(nico, { t, x: lerp(-1.6, -.45, sr(k, 0, .3)), z: lerp(1.5, -15.5, k), ry: PI, run: 1, phase: t * 13 }); pose(raul, { t, x: lerp(1.5, .5, sr(k, 0, .3)), z: lerp(5.0, -13.6, cl(k * 1.15 - .12)), ry: PI, run: 1, phase: t * 12 + 1 }) }
    // street silhouettes fleeing
    SIL.forEach((s, i) => { const t0 = so + 2.2 + i * .9 + hash(i) * .5, k = (t - t0) / (2.2 + hash(i + 3)); if (k > 0 && k < 1 && t < M.shutter + 1.5) pose(s, { t, x: lerp(i % 2 ? -9 : 9, i % 2 ? 9 : -9, k), z: 9.3 + hash(i * 2.2) * 1.2, ry: i % 2 ? PI / 2 : -PI / 2, run: 1, phase: t * 13 + i }) });
    arms(t, { counter: t < M.run ? 1 - win(t, Ln.y1.start - .35, Ln.y1.end + .3, .3, .3) : 0, phone: win(t, Ln.y1.start - .35, Ln.y1.end + .3, .3, .3), run: run ? 1 : 0, beckon: win(t, Ln.y2.start - .1, Ln.y2.end + .3, .15, .3) });
    setCam(c, t, run ? 2.5 : pan ? 1.8 : 1, run ? 1 : 0, 0);
    Object.assign(O, { alert: { n: 1, k: Math.min(ramp(t, M.buzz1 + .08, M.buzz1 + .4), 1 - ramp(t, Ln.h1.end + .5, Ln.h1.end + .8)), buzz: t < M.buzz1 + 2.3 ? 1 : 0 }, title: win(t, 1.35, 3.7, .3, .25), titleY: 520, red: (t > M.buzz1 && t < Ln.y1.end ? .25 + .2 * Math.sin(t * 12) : 0) * (1 - ramp(t, Ln.h1.end, Ln.y1.end)), tint: 'rgba(40,70,120,.18)', black: ramp(t, M.slam - .04, M.slam) });
  } else {
    const kn = [M.knock, M.knock + .62, M.knock + 1.24, M.knock2], swing = Math.sin((t - M.slam) * 2.6) * .16 * Math.exp(-(t - M.slam) * .12) + knockJolt(t, M.knock2, 1, 1) * 2;
    const flick = t > M.eyes ? (hash(Math.floor(t * 18)) > .22 ? 1 : .35) : (hash(Math.floor(t * 9)) > .05 ? 1 : .6);
    env({ depo: 1, bulb: .9 * flick * (1 - sr(t, M.sting - .1, M.sting + .3) * .75), swing, fill: 1.6, hemi: .09, bg: 0x000000, fogD: .04, exp: 1.25, alertTex: 2, eyesBlink: (t % 2.3) < .09 ? .1 : 1, phoneL: win(t, M.buzz2 + .15, Ln.y3.end + .4) * 1.2,
      doorJolt: knockJolt(t, M.knock, 3, .62) + knockJolt(t, M.knock2, 1, 1) * 1.6, eyes: sr(t, M.knock2 + .25, M.knock2 + 1.1) * (t > M.sting ? 1 : .8), eyesX: Math.sin(t * .9) * .012, eyesY: -.02 + sr(t, M.sting, M.sting + .25) * .03 });
    setDust(t, kn);
    pose(nico, { t, x: 1.5, z: -15.5, ry: PI + .9 - win(t, Ln.n2.start, Ln.r3.start, .5, .4) * .7, look: t > Ln.n2.start - .2 && t < Ln.n2.end + .3 ? cam.position : V(0, 1.7, -14), talk: talk('n2', t), brow: 1, tremble: 1, aR: [-win(t, Ln.n2.start, Ln.n2.end + .4) * 1.3, .2] });
    pose(raul, { t, x: -1.45, z: -16.1, ry: PI - .9, look: t > Ln.r3.start - .2 && t < Ln.r3.end + .2 ? cam.position : V(0, 1.7, -14), talk: talk('r3', t), brow: -1, aL: [-win(t, Ln.r3.start - .2, Ln.r3.end + .6) * 1.4, -.5] });
    arms(t, { phone: win(t, M.buzz2 + .2, Ln.y3.end + .35, .3, .3) });
    setCam(c, t, 1.5 + (t > M.knock ? 1 : 0), 0, (t - M.knock2 > 0 && t - M.knock2 < .2 ? 1 : 0) + (t - M.sting > 0 && t - M.sting < .25 ? 1.2 : 0));
    const ek = t - M.endcard;
    Object.assign(O, { black: 1 - ramp(t, M.slam + .45, M.slam + 1.1), alert: { n: 2, k: Math.min(ramp(t, M.buzz2 + .08, M.buzz2 + .4), 1 - ramp(t, Ln.y3.end + .5, Ln.y3.end + .8)), buzz: t < M.buzz2 + 2.2 ? 1 : 0 }, red: win(t, M.buzz2, Ln.y3.end, .2, .5) * (.2 + .15 * Math.sin(t * 12)), tint: 'rgba(20,60,50,.22)', white: (t - M.sting > 0 && t - M.sting < .09) ? .5 : 0,
      end: ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a: 'LE ABRÍS', b: 'NO ABRÍS', cta: 'COMENTÁ  A  o  B', nxt: 'Lo que pasó después: <i>PARTE 2</i>' } : null });
  }
  overlay(t, O);
}
// ================================================================== PART 2
const NF = [1.3, 1.6, -16.0], RF = [-1.5, 1.66, -16.5], FIGP = [-1.85, 0, -19.35];
function P2(t) {
  const O = { tag: .92 }; hideAll();
  const S0 = [-.3, 1.0, -18.5], S1 = [-.15, 1.56, -17.2];
  K2 = K2 || path([[0, S0, [0, 1.5, -14], 74], [M.knock_stop, S0, [0, 1.5, -14], 66], [Ln.n1.start - .2, S0, [.9, 1.6, -14.9], 54], [Ln.n1.end, S0, [.9, 1.6, -14.9], 52], [M.voice_nico + .5, S0, [0, 1.6, -14], 60], [M.voice_nico + 2.2, S1, WIN, 60], [Ln.c1.end, [-.1, 1.56, -16.8], WIN, 52],
    [Ln.n2.start - .15, [-.1, 1.56, -16.8], NF, 46], [Ln.n2.end + .1, [-.1, 1.56, -16.8], NF, 43], [M.buzz3 + .55, [-.1, 1.56, -16.8], [0, .9, -14], 66], [Ln.r1.start + .1, [-.1, 1.56, -16.8], [0, .9, -14], 66], [Ln.r1.start + .7, [-.1, 1.56, -16.8], RF, 56], [Ln.r1.end, [-.1, 1.56, -16.8], RF, 53],
    [M.voice_mama + .5, [-.1, 1.56, -16.8], WIN, 58], [Ln.c2.end, [0, 1.56, -15.35], [.2, 1.45, -14], 60], [Ln.h2.end, [0, 1.56, -15.25], [.2, 1.45, -14], 56], [M.flicker + .55, [0, 1.56, -15.6], [0, 2.4, -16.35], 66], [M.bulb_out + .2, [0, 1.56, -15.6], [0, 2.4, -16.35], 64], [M.bulb_out + 1.0, [0, 1.56, -16.6], [0, 1.5, -14], 70],
    [Ln.r2.start + .3, [.7, 1.56, -17.0], RF, 62], [Ln.r2.end, [.7, 1.56, -17.0], RF, 58], [M.flash_on - .1, [0, 1.56, -16.8], [0, 1.5, -14], 68], [M.flash_on + .5, [0, 1.56, -16.8], [0, 1.5, -14], 66], [M.see_nico, [0, 1.56, -17.3], NF, 62], [M.see_nico + 1.3, [0, 1.56, -17.3], NF, 60],
    [M.see_raul, [.4, 1.56, -17.1], RF, 62], [M.see_raul + .7, [.4, 1.56, -17.1], RF, 60], [M.fourth - .05, [.2, 1.56, -16.9], [FIGP[0], 1.15, FIGP[2]], 60], [M.fourth + 1.4, [-.1, 1.56, -17.0], [FIGP[0], 1.2, FIGP[2]], 44], [C.dur, [-.2, 1.56, -17.2], [FIGP[0], 1.22, FIGP[2]], 40]]);
  const c = evalPath(K2, t), kn = [.15, .85, 1.55, Ln.h1.start + 1.1, Ln.h1.start + 1.8, Ln.h1.start + 2.5, Ln.h1.end + .1, Ln.h1.end + .8];
  const dark = t >= M.bulb_out, fl = t > M.flicker && !dark ? (hash(Math.floor(t * 22)) > .45 ? 1 : .08) : 1, fo = t >= M.flash_on ? (t < M.flash_on + .25 ? (hash(Math.floor(t * 30)) > .4 ? 1 : .2) : 1) : 0;
  let dj = 0; for (const k of kn) dj += knockJolt(t, k, 1, 1);
  env({ depo: 1, bulb: dark ? 0 : .9 * fl * (hash(Math.floor(t * 7)) > .04 ? 1 : .7), swing: Math.sin(t * 2.2) * .05 + dj * 2, fill: dark ? .06 : 1.6, hemi: dark ? .014 : .09, bg: 0, fogD: .04, exp: 1.25, alertTex: 3, doorJolt: dj,
    phoneL: win(t, M.buzz3 + .15, Ln.r1.start + .5) * 1.2 + (dark && !fo ? .5 : 0), phoneC: dark ? 0x8fa8ff : 0xff3040, flash: fo, knees: t < M.voice_nico + 1.4 });
  setDust(t, kn);
  const sit = 1 - sr(t, M.voice_nico + .5, M.voice_nico + 2.0), back = sr(t, M.voice_nico, M.voice_nico + 1.6);
  pose(nico, { t, x: lerp(.9, 1.3, back), z: lerp(-14.75, -16.0, back), ry: t < Ln.n1.start - .4 ? .5 : (t < M.voice_nico ? PI + .3 : (t > Ln.n2.start - .3 && t < Ln.n2.end + .4) || t > M.see_nico - .6 ? PI + .55 : .55) , lean: t < Ln.n1.start - .4 ? .25 : 0, look: (t > Ln.n1.start - .4 && t < M.voice_nico) || (t > Ln.n2.start - .3 && t < Ln.n2.end + .4) || (t > M.see_nico - .5) ? cam.position : V(0, 1.6, -14), hyAbs: undefined, talk: talk('n1', t) + talk('n2', t), brow: 1, eye: t > M.voice_nico ? 1.25 : 1, pupil: t > M.voice_nico ? .7 : 1, tremble: t > M.voice_nico ? 1.5 : 0, smile: win(t, Ln.n1.start, M.voice_nico - .1) * .35, aL: [t > M.see_nico - .4 && t < M.see_raul ? -2.3 : 0, t > M.see_nico - .4 && t < M.see_raul ? -.5 : 0] });
  pose(raul, { t, x: -1.5, z: -16.5, ry: PI / 2 + .25, look: (t > Ln.r1.start && t < Ln.r1.end + .3) || (t > Ln.r2.start - .3 && t < Ln.r2.end + .2) || t > M.see_raul - .5 ? cam.position : V(0, 1.6, -14), talk: talk('r1', t) + talk('r2', t), brow: -1, aR: [t > M.see_raul - .4 && t < M.fourth ? -2.55 : -.5, t > M.see_raul - .4 && t < M.fourth ? -.45 : 0], aL: [-.9, 0] });
  if (t >= M.bulb_out) pose(fig, { t: 0, x: FIGP[0], z: FIGP[2], ry: PI + .5, noblink: 1, aR: [-.15, 0], lean: .16 });
  const reach = win(t, Ln.c2.start + 1.0, Ln.h2.start + .9, 1.6, 1.2);
  arms(t, { phone: win(t, M.buzz3 + .2, Ln.r1.start + .5, .3, .3), reach, flash: fo ? 1 : 0 });
  setCam(c, t, 1.4 + (t > M.voice_nico ? .6 : 0), 0, (t - M.fourth > 0 && t - M.fourth < .3 ? 1.3 : 0)); cam.position.y += 0;
  const ek = t - M.endcard;
  Object.assign(O, { title: win(t, .3, 2.5, .3, .25), titleY: 430, black: 1 - ramp(t, 0, .5), alert: { n: 3, k: Math.min(ramp(t, M.buzz3 + .08, M.buzz3 + .4), 1 - ramp(t, Ln.r1.end + .2, Ln.r1.end + .5)), buzz: t < M.buzz3 + 2.2 ? 1 : 0 }, red: win(t, M.buzz3, Ln.r1.end, .2, .5) * (.2 + .15 * Math.sin(t * 12)), tint: 'rgba(20,60,50,.22)', white: (t - M.fourth > 0 && t - M.fourth < .09) ? .45 : 0,
    end: ek > 0 ? { k: ek, q: '¿VOS QUÉ<br>HARÍAS?', a: 'LA ALUMBRÁS', b: 'APAGÁS LA LUZ', cta: 'COMENTÁ  A  o  B', nxt: 'El final: <i>PARTE 3</i>' } : null });
  overlay(t, O);
}
// ================================================================== PART 3
const CPOS = [[-1.2, 5.6, 2.9], [1.3, 5.9, -2.8], [-.45, 6.6, 3.1], [.75, 7.0, -3.0], [-1.9, 7.2, 2.6], [1.95, 7.3, -2.5], [0, 7.6, 3.14], [-2.9, 6.2, 2.2], [.75, -9, 1.57], [-.75, -5.5, -1.57], [.78, -2.2, 1.57]];
function P3(t) {
  const O = { tag: .92 }; hideAll(); const FH = [FIGP[0], 1.3, FIGP[2]], walkEnd = M.see_vieja + .3;
  K3 = K3 || path([[0, [0, 1.56, -17.0], [FIGP[0], 1.2, FIGP[2]], 46], [Ln.h1.start, [0, 1.56, -17.0], [FIGP[0], 1.2, FIGP[2]], 46], [Ln.h1.end - 2.0, [-.5, 1.5, -17.7], [FIGP[0], 1.2, FIGP[2]], 42], [Ln.h1.end - .6, [-.7, 1.45, -17.9], [FIGP[0] + .28, .72, FIGP[2] - .1], 30], [Ln.h1.end + .1, [-.7, 1.45, -17.9], [FIGP[0] + .28, .72, FIGP[2] - .1], 28],
    [M.turnhead + .7, [-.75, 1.5, -18.0], FH, 36], [M.flash_die, [-.9, 1.5, -18.2], FH, 26], [M.scream, [-.9, 1.5, -18.2], FH, 26], [M.scream + .55, [-.5, 1.5, -17.6], { yaw: 0, pitch: 0 }, 84], [M.door_open - .1, [-.1, 1.56, -16.2], { yaw: 0, pitch: 0 }, 84], [M.day, [0, 1.6, -13.6], { yaw: 0, pitch: 0 }, 80],
    [M.day + 1.2, [0, 1.6, -12.6], { yaw: 0, pitch: 2 }, 76], [Ln.h2.start + 1.6, [0, 1.6, -9.4], { yaw: 24, pitch: 0 }, 72], [Ln.h2.end - .9, [0, 1.6, -6.2], { yaw: -22, pitch: 0 }, 72], [Ln.n1.start + .3, [0, 1.6, -3.6], { yaw: 26, pitch: 0 }, 64], [Ln.n1.end - .2, [0, 1.6, -.8], { yaw: 24, pitch: 0 }, 62],
    [walkEnd, Pc, VF, 64], [Ln.v1.end, Pc, VF, 58], [M.buzz4 + .55, Pc, [0, .95, 4.95], 66], [Ln.y1.end + .1, Pc, [0, .95, 4.95], 64], [M.stare + .5, Pc, [0, 1.45, 5.5], 70], [M.stare + 1.3, Pc, [0, 1.45, 5.5], 66], [M.stare + 1.85, Pc, [1.5, 1.6, 3.6], 66], [Ln.c2.start + .1, Pc, [1.5, 1.6, 3.6], 62], [M.blackout, Pc, [0, 1.45, 5.5], 60], [C.dur, Pc, [0, 1.45, 5.5], 56]]);
  const c = evalPath(K3, t);
  if (t < M.day) {
    const th = sr(t, M.turnhead + .2, M.turnhead + 1.75), die = t >= M.flash_die, fl = die ? 0 : (t > M.flash_die - .65 ? (hash(Math.floor(t * 26)) > .45 ? 1 : .06) : 1), open = Math.pow(ramp(t, M.door_open - .12, M.door_open + .35), .6);
    env({ depo: 1, store: open > 0, rows: [1, 1, 1, 1, 1], rowI: 60, sun: 3, bulb: 0, fill: die ? .03 : .04, hemi: open > 0 ? .9 : .012, hemiC: 0xfff6e0, bg: open > 0 ? 0xffffff : 0, fog: open > 0 ? 0xfff4dc : 0, fogD: open > 0 ? .06 : .05, flash: fl, door: -1.9 * open, exp: 1 + open * 2.5, street: { day: 1 } });
    pose(fig, { t: 0, x: FIGP[0], z: FIGP[2], ry: PI + .5, hyAbs: th * (PI - .15), hp: -th * .1, hr: th * .28, smile: th > .6 ? 1 : 0, eye: 1 + th * .45, pupil: 1 - th * .45, noblink: 1, aR: [-.15, 0], lean: .16 });
    if (t > M.scream) { pose(raul, { t, x: -.9 + ramp(t, M.scream, M.door_open) * 1.2, z: -15.0, ry: .2, run: .6, aL: [-1.6, 0], aR: [-1.4, 0] }); pose(nico, { t, x: 1.3, z: -16.0, ry: .1, run: .5, tremble: 2 }) }
    arms(t, { flash: t < M.flash_die + .2 ? 1 : 0, run: t > M.scream ? 1 : 0 });
    setCam(c, t, 1.6 + (t > M.scream ? 2 : 0), t > M.scream + .5 ? .8 : 0, (t - M.scream > 0 && t - M.scream < .5 ? 1.6 : 0) + (t > M.flash_die - .65 && !die ? .25 : 0));
    const closeEyes = die && t > Ln.c1.start - .2 && t < M.scream;
    Object.assign(O, { title: win(t, .3, 2.5, .3, .25), titleY: 330, black: Math.max(1 - ramp(t, 0, .5), die && t < M.scream + .12 ? 1 : 0), tint: 'rgba(20,60,50,.22)', white: Math.max((t - M.scream > 0 && t - M.scream < .12) ? .8 : 0, sr(t, M.door_open, M.day - .1)), eyesDark: closeEyes ? sr(t, Ln.c1.start - .2, Ln.c1.start + .4) : 0 });
  } else {
    const stare = t >= M.stare, stk = sr(t, M.stare, M.stare + .25), bo = t >= M.blackout, dying = stare ? ROWZ.map((_, i) => t > M.stare + 1.0 + (4 - i) * .55 ? 0 : (hash(Math.floor(t * 16) + i) > .2 ? 1 : .5)) : [1, 1, 1, 1, 1];
    env({ store: 1, rows: bo ? [0, 0, 0, 0, 0] : dying, rowI: 13, keyI: 30, sun: bo ? 0 : 1.3 * (1 - stk * .75), hemi: bo ? .0 : .5 - stk * .32, hemiC: 0xfff3da, bg: bo ? 0 : stare ? 0x6f7f8f : 0xbfe0ff, fog: bo ? 0 : 0xf3ead6, fogD: bo ? .02 : .016, exp: bo ? 1 : 1.05 + (1 - sr(t, M.day, M.day + 1.4)) * 2.2 - stk * .2, street: { day: 1 }, shut: 0, alertTex: 4, phoneL: win(t, M.buzz4 + .2, M.stare + .3) * .5, door: -1.9, eyeGlow: bo ? 1.6 : 0 });
    const eyeP = { smile: stk, eye: 1 + stk * .4, pupil: 1 - stk * .45, noblink: stare ? 1 : 0, hr: stk * .2 };
    pose(vieja, { t: stare ? 0 : t, x: 0, z: 4.95, ry: PI, look: cam.position, talk: talk('v1', t), smile: Math.max(.45 * sr(t, M.see_vieja - 1, M.see_vieja), stk), eye: eyeP.eye, pupil: eyeP.pupil, noblink: eyeP.noblink, hr: .1 + stk * .18, aR: [-1.2, 0] });
    CUST.forEach((cu, i) => { const p = CPOS[i], front = i < 8; if (!front && t > walkEnd) return; pose(cu, { t: stare ? 0 : t, x: p[0], z: p[1], ry: stare && front ? PI : p[2], look: stare ? cam.position : undefined, hy: Math.sin(t * .5 + i) * .3, aR: [front ? -.5 - .3 * Math.sin(t * .8 + i) : -1.1, 0], aL: [i % 3 == 0 ? -1.0 : 0, 0], ...(front ? eyeP : {}) }) });
    const wk = ramp(t, M.day + .2, walkEnd), nz = lerp(-12.2, 3.6, ss(wk)) + (1 - wk) * .2, walking = t < walkEnd;
    pose(nico, { t: stare ? 0 : t, x: walking ? lerp(.85, 1.5, sr(wk, .75, 1)) : 1.5, z: walking ? Math.min(3.6, c.p[2] + 2.7) : 3.6, ry: stare ? PI + .75 : walking ? .0 : PI - .4, run: walking ? .28 : 0, phase: t * 6.5, look: stare || (t > Ln.n1.start && t < Ln.n1.end + .4) ? V(c.p[0], c.p[1], c.p[2]) : V(-2, 1.7, c.p[2] + 6), talk: talk('n1', t), brow: stare ? 0 : 1, ...(stare ? eyeP : {}) });
    arms(t, { phone: win(t, M.buzz4 + .25, M.stare + .25, .3, .3), counter: t > walkEnd ? .0 : 0 });
    setCam(c, t, bo ? .6 : 1.1 + stk, walking ? .16 : 0, 0);
    const ek = t - M.endcard;
    Object.assign(O, { white: 1 - sr(t, M.day - .05, M.day + .9), alert: { n: 4, k: Math.min(ramp(t, M.buzz4 + .08, M.buzz4 + .4), 1 - ramp(t, Ln.y1.end + .3, Ln.y1.end + .6)), buzz: t < M.buzz4 + 2.2 ? 1 : 0 }, red: win(t, M.buzz4, Ln.y1.end, .2, .5) * (.2 + .15 * Math.sin(t * 12)), tint: stare ? `rgba(60,10,20,${.25 * stk})` : 'rgba(255,225,150,.2)', grain: stare ? .16 : .08, black: bo && t > M.blackout + .75 ? ramp(t, M.blackout + .75, M.endcard) : 0,
      end: ek > 0 ? { k: ek, q: '¿VOS HUBIERAS<br>SALIDO?', cta: 'COMENTÁ  SÍ  o  NO', nxt: '<i>FIN</i>  ·  Seguime para más historias' } : null });
  }
  overlay(t, O);
}
// ------------------------------------------------------------------ driver
const PF = [null, P1, P2, P3][PART];
window.renderAt = t => { PF(t); R.render(scene, cam); R.getContext().finish(); return 1 };
window.DUR = C.dur; await document.fonts.ready; renderAt(0); window.ready = 1;

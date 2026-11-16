// Núcleo compartido de las mini-series POV (extraído del motor de NO ABRAS). Cada historia importa esto desde su scene.js
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
const cv = document.getElementById('c'); cv.width = 720 * RS; cv.height = 1280 * RS;
const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x05070c, 0.02);
const cam = new THREE.PerspectiveCamera(70, 9 / 16, 0.05, 200); cam.rotation.order = 'YXZ'; scene.add(cam);
function tex(w, h, draw, rx = 1, ry = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; return t;
}
const speck = (g, w, h, n, a, col = '0,0,0') => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${col},${Math.random() * a})`; const s = 1 + Math.random() * 3; g.fillRect(Math.random() * w, Math.random() * h, s, s) } };
const blot = (g, w, h, n, a, col = '0,0,0', rmax = 90) => { for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * rmax, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${Math.random() * a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r) } };
const T = {};
T.glow = tex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h) });
const _m = {}; const mat = (c, o = {}) => { const k = c + JSON.stringify(o); return _m[k] || (_m[k] = new THREE.MeshLambertMaterial({ color: c, ...o })) };
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
function add(p, geo, m, x = 0, y = 0, z = 0, sh = 0) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (sh & 1) me.castShadow = true; if (sh & 2) me.receiveShadow = true; p.add(me); return me }
const box = (p, w, h, d, m, x, y, z, sh = 2) => add(p, new THREE.BoxGeometry(w, h, d), m, x, y, z, sh);
const G = { sph: new THREE.SphereGeometry(1, 20, 14), cap: new THREE.CapsuleGeometry(1, 1, 6, 14), cyl: new THREE.CylinderGeometry(1, 1, 1, 16) };
const _cg = {}; const caps = (p, r, len, m, x, y, z, sh = 1) => add(p, _cg[r + '_' + len] || (_cg[r + '_' + len] = new THREE.CapsuleGeometry(r, Math.max(.001, len - 2 * r), 6, 14)), m, x, y, z, sh);
const sph = (p, r, m, x, y, z, sh = 1) => { const me = add(p, G.sph, m, x, y, z, sh); me.scale.setScalar(r); return me };
const glowSprite = (p, col, s, x, y, z) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: T.glow, color: col, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.scale.set(s, s, 1); sp.position.set(x, y, z); p.add(sp); return sp };
const grp = p => { const g = new THREE.Group(); p.add(g); return g };
const hemi = new THREE.HemisphereLight(0xdfe9ff, 0x56524a, 1); scene.add(hemi);
// ------------------------------------------------------------------ characters
const pupM = mat(0x0a0a0a), mouthM = mat(0x3a0d12); const ALLCH = [];
function makeChar(o) {
  const g = grp(scene), b = grp(g), sk = mat(o.skin), sh = mat(o.shirt), pa = mat(o.pants); const c = { g, b, o, L: [], A: [] }; const eyeW = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0 }), teethM = eyeW; c.eyeW = eyeW;
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
  if (o.style == 'hat') { const hm2 = mat(o.hair); const br = add(hd, G.cyl, hm2, 0, .33, 0, 1); br.scale.set(.36, .02, .36); const cr = add(hd, G.cyl, hm2, 0, .41, 0, 1); cr.scale.set(.2, .16, .2) }
  if (o.noface) { for (const e of c.eyes) e.visible = false; c['brow-1'].visible = c.brow1.visible = false }
  g.scale.setScalar(o.h || 1); ALLCH.push(c); return c;
}
const lookTmp = V(0, 0, 0);
function pose(c, p = {}) {
  const t = p.t || 0, g = c.g; g.visible = p.vis !== false; if (!g.visible) return; c.eyeW.emissiveIntensity = p.glow || 0;
  g.position.set(p.x || 0, p.y || 0, p.z || 0); g.rotation.set(0, p.ry || 0, 0);
  const run = p.run || 0, ph = (p.phase ?? t * 11) + (c.o.seed || 0), sw = Math.sin(ph) * run;
  c.b.position.y = run ? Math.abs(Math.cos(ph)) * .06 * run : Math.sin(t * 1.6 + (c.o.seed || 0)) * .004;
  c.b.rotation.set((p.lean ?? c.o.lean ?? 0) + run * .22, 0, Math.sin(t * .9 + (c.o.seed || 0)) * .012 + (p.tremble ? Math.sin(t * 43) * .008 * p.tremble : 0));
  c.L[0].rotation.x = sw * .95; c.L[1].rotation.x = -sw * .95; if (p.sit) { c.b.position.y -= .33; c.L[0].rotation.x = c.L[1].rotation.x = -1.5 }
  const aL = p.aL || [0, 0], aR = p.aR || [0, 0];
  c.A[0].rotation.set(aR[0] - sw * 1.1 - run * .2, 0, -.07 - (aR[1] || 0)); c.A[1].rotation.set(aL[0] + sw * 1.1 - run * .2, 0, .07 + (aL[1] || 0));
  let hy = p.hy ?? 0, hp = p.hp ?? 0;
  if (p.look) { lookTmp.copy(p.look); g.worldToLocal(lookTmp); hy = cl(Math.atan2(lookTmp.x, lookTmp.z), -1.25, 1.25); hp = cl(-Math.atan2(lookTmp.y - (p.sit ? 1.27 : 1.6), Math.hypot(lookTmp.x, lookTmp.z)), -.5, .6) - (p.lean ?? c.o.lean ?? 0) }
  if (p.hyAbs !== undefined) hy = p.hyAbs;
  c.head.rotation.set(hp + (p.talk ? Math.sin(t * 9) * .02 : 0), hy, p.hr || 0);
  const es = p.eye || 1, ps = p.pupil || 1; for (const e of c.eyes) { e.scale.setScalar(es); e.userData.p.scale.setScalar(.024 * ps / 1) ; e.scale.y = es * (hash(Math.floor(t * 1.0 + (c.o.seed || 0)) * 3.1) > .86 && (t % 1) < .1 && !p.noblink ? .1 : 1) }
  if (p.closed) for (const e of c.eyes) e.scale.y = es * .08;
  const smile = p.smile || 0; c.smile.visible = smile > .01; c.mouth.visible = smile < .5; if (c.o.noface) c.smile.visible = c.mouth.visible = false;
  c.smile.scale.set(.55 + .4 * smile, .45 + .45 * smile, .6); const tk = p.talk || 0;
  c.mouth.scale.set(.05 - tk * .008, .012 + tk * .034, .02); if (smile > .01 && tk) c.smile.scale.y *= 1 + tk * .25;
  const bd = p.brow || 0; c['brow-1'].position.y = c.brow1.position.y = .285 + bd * .03; c['brow-1'].rotation.z = .12 - bd * .3; c.brow1.rotation.z = -.12 + bd * .3;
}
const talk = (id, t) => { const l = Ln[id]; if (!l || t < l.start || t > l.end) return 0; for (const w of l.words) if (t >= w[1] && t <= w[2] + .04) return .3 + .7 * Math.abs(Math.sin(t * 17)); return 0 };
// ------------------------------------------------------------------ POV rig
const rig = grp(cam); const sleeve = new THREE.MeshLambertMaterial({ color: 0x2c4a7c }), skinP = new THREE.MeshLambertMaterial({ color: 0xd8a47f });
function povArm(s) { const a = { s, fore: add(rig, G.cyl, sleeve, 0, 0, 0, 0), hand: grp(rig) }; const h = sph(a.hand, .05, skinP, 0, 0, 0, 0); h.scale.set(.047, .03, .06); const th = caps(a.hand, .013, .06, skinP, -s * .045, .005, -.025, 0); th.rotation.set(1.2, 0, s * .6); for (let i = 0; i < 4; i++) { const f = caps(a.hand, .0095, .07, skinP, -s * .03 + s * i * .02, 0, -.07, 0); f.rotation.x = PI / 2 - .25 } return a }
const armR = povArm(1), armL = povArm(-1); const _a = V(0, 0, 0), _b = V(0, 0, 0), _up = V(0, 1, 0);
function setArm(a, hx, hy, hz, rx = 0, ry = 0, rz = 0) { a.hand.position.set(hx, hy, hz); a.hand.rotation.set(rx, ry, rz); _a.set(a.s * .34, -.55, .12); _b.set(hx, hy, hz + .03); const d = _b.clone().sub(_a), len = d.length(); a.fore.position.copy(_a).addScaledVector(d, .5); a.fore.scale.set(.043, len - .03, .043); a.fore.quaternion.setFromUnitVectors(_up, d.normalize()) }
const phone = grp(rig); box(phone, .078, .16, .01, mat(0x0c0d0f), 0, 0, 0, 0); const phoneScr = add(phone, new THREE.PlaneGeometry(.07, .148), basic(0xffffff), 0, 0, .0056, 0);
const phoneL = new THREE.PointLight(0x9fc0ff, 0, 4, 1.5); phoneL.position.set(0, -.1, -.3); rig.add(phoneL);
const flash = new THREE.SpotLight(0xeef3ff, 0, 16, .36, .55, 1.1); flash.position.set(.12, -.2, -.3); rig.add(flash); const flashT = new THREE.Object3D(); flashT.position.set(.0, -.02, -6); rig.add(flashT); flash.target = flashT;
const LI = (l, v) => { l.intensity = v; l.visible = v > 1e-4 };
// arm poses [right, left] = [x,y,z,rx,ry,rz] in camera space; stories can add their own to ARMP
const ARMP = {
  rest: t => [[.2, -.62, -.3, 0, 0, 0], [-.2, -.62, -.3, 0, 0, 0]],
  phone: t => [[.075, -.245, -.4, .6, -.2, .1], [-.2, -.6, -.3, 0, 0, 0]],
  flash: t => [[.15, -.25, -.42, .1, 0, .2], [-.2, -.62, -.3, 0, 0, 0]],
  reach: t => [[.1, -.1 + Math.sin(t * 31) * .004, -.62, .15, 0, -.4], [-.2, -.62, -.3, 0, 0, 0]],
  run: t => [[.2, -.36 + Math.sin(t * 11) * .1, -.42, 0, 0, 0], [-.2, -.36 - Math.sin(t * 11) * .1, -.42, 0, 0, 0]],
  wheel: t => [[.17, -.3, -.5, -.9, 0, .5], [-.17, -.3, -.5, -.9, 0, -.5]],
  grip: t => [[.19, -.36, -.46, -.3, .1, 0], [-.19, -.36, -.46, -.3, -.1, 0]],
};
function arms(t, w) {
  const o = { ...w }; let tot = Object.values(o).reduce((a, b) => a + b, 0); if (tot < 1) { o.rest = (o.rest || 0) + 1 - tot; tot = 1 }
  for (const [a, i] of [[armR, 0], [armL, 1]]) { const r = [0, 0, 0, 0, 0, 0]; for (const k in o) if (o[k] > 0) { const P = ARMP[k](t)[i]; for (let j = 0; j < 6; j++) r[j] += P[j] * o[k] / tot } setArm(a, ...r) }
  const ph = (o.phone || 0) / tot, fl = (o.flash || 0) / tot; phone.visible = Math.max(ph, fl) > .3;
  if (fl > ph) { phone.position.set(.15, -.2, -.47); phone.rotation.set(-1.25, 0, .2) } else { phone.position.set(.035, -.165 - (1 - cl(ph)) * .3, -.43); phone.rotation.set(-.42, -.08, .05) }
}
// ------------------------------------------------------------------ camera path
function path(keys) { let py = 0; return keys.map(k => { const [t, p, tg, fov] = k; let yaw, pitch; if (Array.isArray(tg)) { yaw = Math.atan2(tg[0] - p[0], tg[2] - p[2]); pitch = Math.atan2(tg[1] - p[1], Math.hypot(tg[0] - p[0], tg[2] - p[2])); while (yaw - py > PI) yaw -= 2 * PI; while (yaw - py < -PI) yaw += 2 * PI } else { yaw = tg.yaw * PI / 180; pitch = (tg.pitch || 0) * PI / 180 } py = yaw; return { t, p, yaw, pitch, fov } }) }
function evalPath(K, t) { let i = 0; while (i < K.length - 2 && t > K[i + 1].t) i++; const a = K[i], b = K[Math.min(i + 1, K.length - 1)], k = ss(ramp(t, a.t, b.t === a.t ? a.t + 1e-6 : b.t)); return { p: [0, 1, 2].map(j => lerp(a.p[j], b.p[j], k)), yaw: lerp(a.yaw, b.yaw, k), pitch: lerp(a.pitch, b.pitch, k), fov: lerp(a.fov, b.fov, k) } }
function setCam(c, t, shake = 1, bob = 0, jolt = 0) { cam.position.set(c.p[0] + sn(t * .7, 1) * .012 * shake, c.p[1] + sn(t * .9, 2) * .01 * shake + Math.abs(Math.sin(t * 11)) * .09 * bob, c.p[2]); cam.rotation.set(c.pitch + sn(t * 1.1, 3) * .012 * shake + Math.sin(t * 22) * .012 * bob + (hash(Math.floor(t * 30)) - .5) * .05 * jolt, c.yaw + PI + sn(t * .8, 4) * .014 * shake + (hash(Math.floor(t * 30) + 9) - .5) * .05 * jolt, sn(t * .6, 5) * .008 * shake + Math.sin(t * 11) * .02 * bob); cam.fov = c.fov; cam.updateProjectionMatrix() }
const bg = new THREE.Color(); scene.background = bg;
// walk a character through [[time,x,z],...]; p.ry0 / p.ryEnd = facing before / after; p.still = extra pose when stopped
function walk(c, t, pts, p = {}) {
  let i = 0; while (i < pts.length - 2 && t > pts[i + 1][0]) i++; const a = pts[i], b = pts[i + 1], k = ramp(t, a[0], b[0]), n = pts.length - 1;
  const moving = t > pts[0][0] && t < pts[n][0] && (a[1] != b[1] || a[2] != b[2]);
  pose(c, { t, run: moving ? .3 : 0, phase: t * 7.5, ...p, ...(moving ? {} : p.still || {}), x: lerp(a[1], b[1], k), z: lerp(a[2], b[2], k), ry: moving ? Math.atan2(b[1] - a[1], b[2] - a[2]) : t <= pts[0][0] ? (p.ry0 ?? p.ryEnd ?? 0) : (p.ryEnd ?? 0) }) }
const hideAll = () => { for (const c of ALLCH) c.g.visible = false };
// ------------------------------------------------------------------ overlay
const $ = id => document.getElementById(id), D = { sub: $('sub'), who: $('who'), alert: $('alert'), title: $('title'), end: $('end'), black: $('black'), white: $('white'), red: $('red'), tag: $('tag'), grain: $('grain'), tint: $('tint') };
{ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), im = g.createImageData(512, 512); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255 } g.putImageData(im, 0, 0); D.grain.style.backgroundImage = `url(${c.toDataURL()})` }
let SPK = {};
function init(o) {
  D.tag.innerHTML = `${o.tag}<b>PARTE ${PART}/3</b>`; D.title.querySelector('.p i').textContent = PART == 3 ? 'PARTE 3 · FINAL' : `PARTE ${PART}`;
  const gd = D.title.querySelector('.gold'); gd.querySelector('.b').innerHTML = gd.querySelector('.f').innerHTML = o.title; gd.style.fontSize = (o.titleSize || 200) + 'px'; SPK = o.spk;
  if (o.sleeve) sleeve.color.setHex(o.sleeve); if (o.skin) skinP.color.setHex(o.skin);
}
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
  // notification banner: {k, buzz, kk, m, s, col:[top,bottom]}
  const a = o.alert; if (a && a.k > .001) { D.alert.style.display = 'block'; D.alert.querySelector('.k').textContent = a.kk || ''; D.alert.querySelector('.m').textContent = a.m; D.alert.querySelector('.s').textContent = a.s || ''; const c2 = a.col || ['#e3202c', '#a30d18']; D.alert.style.background = `linear-gradient(180deg,${c2[0]},${c2[1]})`; const b = a.k < 1 ? 1 + Math.sin(a.k * PI) * .06 : 1; D.alert.style.transform = `translateY(${(1 - ss(a.k)) * -520}px) scale(${b}) rotate(${(a.buzz || 0) * Math.sin(t * 95) * .7}deg)` } else D.alert.style.display = 'none';
  // title
  const ti = o.title ?? 0; if (ti > .001) { D.title.style.display = 'block'; D.title.style.opacity = cl(ti * 2); D.title.style.transform = `scale(${1.5 - .5 * ss(cl(ti * 1.6))}) rotate(-3deg)`; D.title.style.top = (o.titleY ?? 560) + 'px' } else D.title.style.display = 'none';
  D.tag.style.opacity = o.tag ?? .92;
  D.black.style.opacity = o.black ?? 0; D.white.style.opacity = o.white ?? 0; D.red.style.opacity = o.red ?? 0;
  D.tint.style.background = o.tint || 'transparent'; D.grain.style.backgroundPosition = `${Math.floor(hash(t * 31) * 512)}px ${Math.floor(hash(t * 17 + 3) * 512)}px`; D.grain.style.opacity = o.grain ?? .11;
  // end card
  const e = o.end; if (e) { const k = e.k; D.end.style.display = 'block'; D.end.style.opacity = sr(k, 0, .35); const q = D.end.querySelector('.q'); q.querySelector('.b').innerHTML = q.querySelector('.f').innerHTML = e.q; q.querySelector('.gold').style.fontSize = (e.qs || 150) + 'px'; q.style.transform = `scale(${1.25 - .25 * sr(k, 0, .4)}) rotate(-2deg)`;
    const A = $('oa'), B = $('ob'); A.querySelector('span').textContent = e.a || ''; B.querySelector('span').textContent = e.b || ''; A.style.display = B.style.display = e.a ? 'block' : 'none';
    A.style.transform = `translateX(${(1 - sr(k, .5, .85)) * -1100}px) scale(${1 + .03 * Math.sin(t * 5)})`; B.style.transform = `translateX(${(1 - sr(k, .75, 1.1)) * 1100}px) scale(${1 + .03 * Math.sin(t * 5 + 2)})`;
    $('cta').textContent = e.cta; $('cta').style.opacity = sr(k, 1.2, 1.5); $('cta').style.transform = `translateY(${-6 * Math.abs(Math.sin(t * 4))}px)`; $('cta').style.top = (e.a ? 1300 : 960) + 'px';
    $('nxt').innerHTML = e.nxt; $('nxt').style.opacity = sr(k, 1.6, 1.9); $('nxt').style.top = (e.a ? 1420 : 1090) + 'px' } else D.end.style.display = 'none';
}
// ------------------------------------------------------------------ driver
async function run(PF) { const f = PF[PART]; window.renderAt = t => { f(t); R.render(scene, cam); R.getContext().finish(); return 1 }; window.DUR = C.dur; await document.fonts.ready; renderAt(0); window.ready = 1 }
export { THREE, PART, C, M, Ln, cl, lerp, ss, ramp, sr, win, hash, sn, V, PI, R, scene, cam, tex, speck, blot, T, mat, basic, add, box, G, caps, sph, glowSprite, grp, hemi, makeChar, pose, walk, talk, ALLCH, hideAll, rig, sleeve, skinP, phone, phoneScr, phoneL, flash, LI, ARMP, arms, path, evalPath, setCam, bg, init, overlay, run };

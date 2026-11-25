#!/usr/bin/env python3
"""EL MUELLE — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':  ('es-UY-MateoNeural',  '-4%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':    ('es-UY-MateoNeural',  '+2%',  '+2Hz',  'store',   0.95, 'yo'),
 'ABU':   ('es-AR-TomasNeural',  '-12%', '-14Hz', 'room',    0.95, 'abu'),
 'ABUT':  ('es-AR-TomasNeural',  '-8%',  '-12Hz', 'radio',   0.95, 'tel'),
 'ABUF':  ('es-AR-TomasNeural',  '-16%', '-16Hz', 'door',    1.05, 'cosa'),
 'COSA':  ('es-PY-MarioNeural',  '-14%', '-10Hz', 'far',     1.1,  'cosa'),
})

def water(d, seed=121):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    base = lp(r.standard_normal((len(t), 2)), 420) * 1.2
    sw = (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * t + r.uniform(0, 6)))[:, None] ** 2
    lap = bp(r.standard_normal((len(t), 2)), 400, 2200) * 0.25 * np.clip(np.sin(2 * np.pi * 0.42 * t)[:, None] * 2 - 1.2, 0, 1)
    return base * (0.4 + 0.6 * sw) + lap
def bell(g=1.0, f=392.0):
    k = tone(f, 5.0, 1.6, h=((2.0, .5), (2.76, .35), (3.9, .2), (5.4, .12))) * 0.35 * g
    return reverb(lp(k, 3500), 3.5, 0.6, pre=0.06, dark=2500, seed=122)
def bells(n=3, gap=2.4, g=1.0):
    o = np.zeros((int((n * gap + 9) * SR), 2))
    for i in range(n):
        b = bell(g); s = int(i * gap * SR); o[s:s + len(b)] += b
    return o
def splash(d=0.6, seed=123):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    return reverb(bp(r.standard_normal(len(t)), 300, 3000) * np.exp(-t / 0.15) * 0.6, 0.6, 0.2, seed=seed)
def oars(d, gap=1.8):
    o = np.zeros((int((d + 1) * SR), 2)); t = 0.0; i = 0
    while t < d:
        s = splash(0.7, 124 + i); a = int(t * SR); o[a:a + len(s)] += s; t += gap; i += 1
    return o
def gulls(d, seed=125):
    r = np.random.default_rng(seed); o = np.zeros((int(d * SR), 2)); t = 0.5
    while t < d - 1:
        n = int(0.35 * SR); tt = np.arange(n) / SR; f = 1500 + 700 * np.sin(np.pi * tt / 0.35)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.35) * 0.05; pan = r.uniform(.2, .8)
        s = int(t * SR); o[s:s + n, 0] += y * (1 - pan); o[s:s + n, 1] += y * pan; t += r.uniform(1.0, 2.5)
    return reverb(o, 1.0, 0.3, seed=seed)[:int(d * SR)]
def reel(d=1.6):
    t = np.arange(int(d * SR)) / SR
    y = bp(noise(d), 1500, 6000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * t))) * 0.25
    return st(fade(y, 0.02, 0.1))
def ringtone(d=2.4):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * 0.16 * ((t % 1.6) < 0.9)
    return reverb(lp(y, 3000), 0.4, 0.15, seed=126)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(reel(1.6), 0.1, 0.6); S(splash(0.8), 1.6, 0.6)
    L('h1', 'YOIN', "A las cuatro de la mañana, pescando en el muelle, saqué del agua una botella. Adentro había una carta. Con mi letra.", gap=0.4)
    tl.marks['title'] = 3.6
    fb = M('fb', 0.4, adv=True); S(sfx_whoosh(0.9), fb - 0.3, 0.5)
    L('h2', 'YOIN', "Mi abuelo pescó en ese muelle toda la vida. Siempre me decía:", gap=0.3)
    L('a1', 'ABU', "Si sale la niebla y escuchás una campana, juntá todo y volvé a casa.", gap=0.3)
    bk = M('back', 0.5, adv=True); S(sfx_whoosh(0.7), bk - 0.3, 0.5)
    L('h3', 'YOIN', "Esa noche había niebla. Y no había nadie más en el muelle.", gap=0.3)
    lt = M('letter', 0.4, adv=True); S(sfx_creak(0.8), lt, 0.25)
    L('h4', 'YOIN', "Abrí la carta. Decía: No le contestes. Y estaba firmada por mí.", gap=0.3)
    bl = M('bell', 0.5, adv=True); S(bells(1), bl, 0.9)
    L('h5', 'YOIN', "Entonces, en la niebla, sonó una campana.", gap=0.6)
    S(bells(1, g=1.2), tl.t + 0.2, 0.9)
    L('c1', 'COSA', "¿Hay alguien en el muelle? Me perdí.", gap=1.0)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    wat = water(dur) * envelope(dur, [(0, 1), (mk['fb'], 1), (mk['fb'] + .1, .5), (mk['back'], .5), (mk['back'] + .1, 1), (dur, 1)])
    day = gulls(dur) * envelope(dur, [(0, 0), (mk['fb'], 0), (mk['fb'] + .1, 1), (mk['back'], 1), (mk['back'] + .1, 0), (dur, 0)])
    dr = drone(dur, 34.6, 360, 127)
    drg = envelope(dur, [(0, 0.6), (mk['fb'], 0.0), (mk['back'], 0.0), (mk['back'] + 0.6, 0.5), (mk['letter'], 0.7), (mk['bell'], 0.9), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 128)
    sgg = envelope(dur, [(0, 0), (mk['letter'], 0), (mk['bell'] + 2, 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, wat, 1.0), (0, day, 1.0), (0, wind(dur, 129, 300) * 0.6, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['letter'], sfx_heart(dur - mk['letter'], 70, 2.5), 0.55)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_click(), 0.9, 0.6)
    L('h1', 'YOIN', "Me quedé callado. Apagué la linterna.", gap=0.3)
    tl.marks['off'] = round(tl.t - 0.6, 3); tl.marks['title'] = 2.4
    bt = M('boat', 0.6, adv=True); S(bells(1, g=0.8), bt - 0.3, 0.8)
    L('h2', 'YOIN', "De la niebla salió un bote, con una luz verde en la punta. Y alguien remando, de espaldas.", gap=0.3)
    L('c1', 'COSA', "Sé que estás ahí. Te escucho respirar.", gap=0.6)
    L('f1', 'ABUF', "Tito, soy yo, el abuelo. Ayudame a atar el bote.", gap=0.8)
    rg = M('ring', 0.5, adv=True)
    L('h3', 'YOIN', "Llamé a mi abuelo.", gap=0.1); S(ringtone(2.0), tl.t + 0.1, 0.5); W(1.9)
    L('a1', 'ABUT', "¿Tito? ¿Qué hacés despierto? Yo estoy acostado.", gap=0.2)
    L('y1', 'YO', "Abuelo... ¿dónde está tu bote?", gap=0.3)
    L('a2', 'ABUT', "¿Escuchás la campana? Salí de ese muelle. Ya.", gap=0.4)
    S(static(0.4), tl.t + 0.05, 0.4)
    L('f2', 'ABUF', "Tirame la soga, Tito.", gap=0.8)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95); S(bell(1.3), sg, 0.7)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 32.7, 340, 130)
    drg = envelope(dur, [(0, 0.7), (mk['boat'], 1.0), (mk['ring'], 0.4), (mk['sting'] - 3, 0.8), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 131)
    sgg = envelope(dur, [(0, 0.2), (mk['boat'], 0.6), (mk['ring'], 0.0), (mk['sting'] - 3, 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, water(dur, 132), 1.0), (0, wind(dur, 133, 300) * 0.6, 1.0), (mk['boat'], oars(mk['ring'] - mk['boat'] + 2), 0.6), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 84, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    tl.marks['title'] = 1.4
    S(sfx_steps(4.0, 5.5), 0.3, 0.8)
    L('h1', 'YOIN', "Corrí. Dejé la caña, el balde, todo.", gap=0.3)
    S(sfx_steps(9.0, 5.5), tl.t, 0.7)
    L('h2', 'YOIN', "Pero el muelle no se terminaba. Cada tabla era igual a la anterior.", gap=0.3)
    S(bell(1.0), tl.t, 0.8)
    L('c1', 'COSA', "Tito... te olvidaste la carta.", gap=0.6)
    L('h3', 'YOIN', "Me acordé de lo que decía. No le contestes. Y no me di vuelta.", gap=0.4)
    dw = M('dawn', 0.4, adv=True); S(sfx_riser(2.5), dw - 0.8, 0.35)
    L('h4', 'YOIN', "Hasta que pisé la arena. La niebla se levantó... y el muelle estaba vacío.", gap=0.3)
    hm = M('home', 0.6, adv=True); S(sfx_whoosh(0.8), hm - 0.2, 0.5)
    L('h5', 'YOIN', "En casa, mi abuelo me esperaba despierto. Con una botella vieja en la mano.", gap=0.3)
    L('a1', 'ABU', "A mí también me llegó una, a tu edad. Con mi letra.", gap=0.4)
    nt = M('night', 0.6, adv=True); S(sfx_whoosh(0.8), nt - 0.2, 0.5)
    L('h6', 'YOIN', "Esa noche escribí una carta. No le contestes. La metí en una botella... y la tiré al agua.", gap=0.3)
    sg = M('sting', 0.3, adv=True); S(splash(0.8), sg - 0.6, 0.6); S(bell(1.2), sg, 0.8); S(sfx_sting(0.9), sg + 0.1, 0.8)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos le hubieras contestado?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    wat = water(dur, 134) * envelope(dur, [(0, 1), (mk['home'], 1), (mk['home'] + .1, 0), (mk['night'], 0), (mk['night'] + .1, 1), (dur, 1)])
    day = gulls(dur, 135) * envelope(dur, [(0, 0), (mk['dawn'] + 1, 0), (mk['dawn'] + 2, 1), (mk['home'], 1), (mk['home'] + .1, 0), (dur, 0)])
    room = roomtone(dur, 50, 136) * envelope(dur, [(0, 0), (mk['home'], 0), (mk['home'] + .1, 1), (mk['night'], 1), (mk['night'] + .1, 0), (dur, 0)])
    dr = drone(dur, 36.7, 340, 137)
    drg = envelope(dur, [(0, 0.9), (mk['dawn'], 0.5), (mk['dawn'] + 2, 0.1), (mk['night'], 0.5), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 138)
    sgg = envelope(dur, [(0, 0.5), (mk['dawn'], 0.6), (mk['dawn'] + 1, 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 139) * envelope(dur, [(0, 0), (mk['dawn'], 0), (mk['dawn'] + 1.5, 0.45), (mk['night'] - 0.3, 0.3), (mk['night'], 0)])
    beds = [(0, wat, 1.0), (0, day, 1.0), (0, room, 0.8), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['dawn'], 100, 1.0), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

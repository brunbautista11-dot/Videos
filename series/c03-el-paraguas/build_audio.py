#!/usr/bin/env python3
"""EL PARAGUAS — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':   ('es-UY-ValentinaNeural', '-3%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':     ('es-UY-ValentinaNeural', '+3%',  '+3Hz',  'room',    0.95, 'yo'),
 'YOR':    ('es-UY-ValentinaNeural', '+6%',  '+5Hz',  'room',    1.0,  'yo'),
 'ROSA':   ('es-PY-TaniaNeural',     '-8%',  '-6Hz',  'room',    0.95, 'rosa'),
 'ROSAT':  ('es-PY-TaniaNeural',     '-6%',  '-5Hz',  'radio',   0.95, 'tel'),
 'HOMBRE': ('es-UY-MateoNeural',     '-14%', '-9Hz',  'door',    1.05, 'cosa'),
})

def rain(d, seed=61, g=1.0):
    r = np.random.default_rng(seed); n = int(d * SR)
    y = lp(r.standard_normal((n, 2)), 5000) * 0.25 + bp(r.standard_normal((n, 2)), 300, 1500) * 0.35
    drops = (r.random((n, 2)) > 0.9985).astype(float) * r.uniform(0.2, 1, (n, 2))
    y += bp(drops, 1500, 6000) * 2.5
    return y * g
def thunder(d=4.0, seed=62):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    y = lp(r.standard_normal(len(t)), 180, 3) * 6 * (np.exp(-t / 1.2) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.3 * t))))
    y[:int(0.25 * SR)] += bp(r.standard_normal(int(0.25 * SR)), 300, 3000) * np.exp(-np.arange(int(0.25 * SR)) / (0.06 * SR)) * 1.2
    return reverb(y, 3.0, 0.5, dark=1500, seed=63)
def washer(d, seed=64, spin=1.0):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    hum = engine(d, 48.0, seed, 0.3) * 0.4
    slosh = bp(r.standard_normal(len(t)), 200, 1200) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * spin * t)) ** 2 * 0.5
    thud = np.sin(2 * np.pi * 1.8 * spin * t) > 0.97
    return fade(hum + st(slosh + lp(thud.astype(float), 120) * 2.0), 0.4, 0.3)
def bell(g=0.4):
    return sfx_ding(2093.0, 4, 0.11, g)
def phone_ring(d=2.4):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * 0.18 * (((t % 1.2) < 0.8)).astype(float) * (np.sin(2 * np.pi * 20 * t) > 0)
    return reverb(lp(y, 3000), 0.5, 0.2, seed=91)
def lock():
    o = np.zeros(int(1.2 * SR)); k = add(sfx_click()[:, 0], nb(0.12, 800, 5000, 0.02, 0.7), tone(420, 0.1, 0.02) * 0.3)
    for s in (0.0, 0.45): i = int(s * SR); o[i:i + len(k)] += k
    return reverb(o, 0.5, 0.2, seed=65)
def laund(dur, seed=66):
    return roomtone(dur, 50, seed) * 1.0 + st(bp(noise(dur), 2500, 7000) * 0.004)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(0.8), 0.0, 0.4)
    L('h1', 'YOIN', "Tres de la mañana, en el lavadero. Y afuera, alguien me miraba bajo la lluvia.", gap=0.25)
    M('title', -1.8)
    fb = M('fb', 0.4, adv=True); S(sfx_whoosh(0.9), fb - 0.3, 0.5)
    L('h2', 'YOIN', "Esa tarde, doña Rosa, la dueña, me había dejado las llaves.", gap=0.3)
    L('r1', 'ROSA', "Si viene el del paraguas, no le abras. Esperá a que pare la lluvia.", gap=0.3)
    bk = M('back', 0.5, adv=True); S(sfx_whoosh(0.7), bk - 0.3, 0.5)
    L('h3', 'YOIN', "Pensé que era un chiste. Hasta que lo vi. Del otro lado de la calle. Quieto.", gap=0.3)
    fl = M('flick', 0.5, adv=True); S(sfx_flicker(1.4), fl, 0.8); W(1.2)
    L('h4', 'YOIN', "Las luces parpadearon. Y cuando volvieron... estaba pegado al vidrio.", gap=0.2)
    kn = M('knock', 0.4, adv=True); S(sfx_tap(3, 0.4, 1.0), kn, 0.9); W(1.3)
    L('m1', 'HOMBRE', "¿Me dejás pasar, Sofía? Hasta que pare.", gap=0.1)
    L('h5', 'YOIN', "Nunca le dije mi nombre.", gap=0.5)
    bl = M('bell', 0.5, adv=True); S(bell(0.5), bl, 0.8); S(sfx_creak(1.2), bl + 0.1, 0.5)
    L('h6', 'YOIN', "Y la puerta... no tenía llave.", gap=0.9)
    sg = M('sting', 0.3, adv=True); S(sfx_sting(), sg, 0.95); S(thunder(), sg, 0.6)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    rn = rain(dur) * envelope(dur, [(0, 1), (mk['fb'], 1), (mk['fb'] + 0.2, 0.0), (mk['back'], 0.0), (mk['back'] + 0.3, 1), (dur, 1)])
    amb = laund(dur) + washer(dur, 67, 0.6) * 0.25
    dr = drone(dur, 36.7, 360, 37)
    drg = envelope(dur, [(0, 0.5), (mk['fb'], 0.0), (mk['back'], 0.0), (mk['back'] + 0.6, 0.5), (mk['knock'], 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 49)
    sgg = envelope(dur, [(0, 0), (mk['flick'], 0), (mk['knock'], 0.5), (mk['bell'], 0.9), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 50) * envelope(dur, [(0, 0), (mk['fb'], 0), (mk['fb'] + 0.3, 0.35), (mk['back'], 0.35), (mk['back'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['flick'], 74, 3.0)
    beds = [(0, rn, 1.0), (0, amb, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (mk['flick'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_steps(1.6, 5.5), 0.0, 0.7); S(lock(), 2.6, 0.9)
    L('h1', 'YOIN', "Corrí a la puerta y le di dos vueltas a la llave. Él ni se movió.", gap=0.2)
    M('title', -1.8)
    L('m1', 'HOMBRE', "No hace falta, Sofía. Yo puedo esperar.", gap=0.4)
    L('h2', 'YOIN', "Entonces me di cuenta. La lluvia le caía alrededor... pero él estaba seco.", gap=0.4)
    rg = M('ring', 0.5, adv=True); S(phone_ring(2.4), rg, 0.6); W(1.6)
    L('r1', 'ROSAT', "Sofi, ¿sigue lloviendo?", gap=0.3)
    L('y1', 'YOR', "Sí. Y está acá, doña Rosa. En la puerta.", gap=0.3)
    L('r2', 'ROSAT', "No lo mires. Y no abras el lavarropas cuatro.", gap=0.4)
    sp = M('spin', 0.5, adv=True); S(sfx_clunk(), sp, 0.7)
    L('h3', 'YOIN', "El cuatro arrancó solo. Yo no había puesto nada.", gap=0.4)
    L('h4', 'YOIN', "Adentro, dando vueltas en el agua, había un paraguas negro.", gap=0.4)
    tp = M('tap', 0.3, adv=True); S(sfx_tap(2, 0.5, 1.0), tp, 0.9); W(1.0)
    L('m2', 'HOMBRE', "Tenés algo mío.", gap=0.1)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.9); S(thunder(3.5, 68), sg, 0.5)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    rn = rain(dur, 69)
    ws = washer(dur - mk['spin'], 70, 1.3)
    dr = drone(dur, 34.6, 360, 38)
    drg = envelope(dur, [(0, 0.7), (mk['ring'], 0.3), (mk['spin'], 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (261.6, 277.2, 392.0), 51)
    sgg = envelope(dur, [(0, 0.3), (mk['ring'], 0.0), (mk['spin'], 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, rn, 1.0), (0, laund(dur, 71), 1.0), (mk['spin'], ws, 0.6), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 84, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.05, 0.5); tl.marks['title'] = 1.4
    L('h1', 'YOIN', "No se lo devolví. Apagué la luz y me senté en el piso, atrás de las secadoras.", gap=0.2)
    S(sfx_click(), 2.2, 0.8)
    L('m1', 'HOMBRE', "Está bien, Sofía. La lluvia siempre vuelve.", gap=0.4)
    nt = M('night', 0.3, adv=True); S(sfx_tap(3, 0.6, 0.7), nt, 0.7)
    L('h2', 'YOIN', "Golpeó el vidrio toda la noche. Hasta que la lluvia paró.", gap=0.3)
    dw = M('dawn', 0.8, adv=True); W(0.4)
    L('h3', 'YOIN', "Cuando aclaró, ya no estaba.", gap=0.2)
    rs = M('rosa', 0.5, adv=True); S(bell(0.5), rs, 0.8)
    L('r1', 'ROSA', "Hiciste bien, nena.", gap=0.5)
    op = M('open', 0.3, adv=True); S(sfx_clunk(0.8), op, 0.6)
    L('h4', 'YOIN', "Doña Rosa sacó el paraguas del cuatro. Estaba seco. Completamente seco.", gap=0.3)
    L('r2', 'ROSA', "Cada vez que llueve, alguien se lo trae. Y él viene a buscarlo.", gap=0.4)
    bx = M('box', 0.3, adv=True)
    L('h5', 'YOIN', "En la caja de objetos perdidos había veinte paraguas negros. Todos iguales.", gap=0.3)
    sg = M('sting', 0.6, adv=True); S(thunder(4.0, 72), sg - 0.2, 0.9); S(sfx_sting(1.0), sg, 0.8)
    L('h6', 'YOIN', "Y afuera... empezó a llover otra vez.", gap=0.5)
    ec = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos volverías al lavadero?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    rn = rain(dur, 73) * envelope(dur, [(0, 1), (mk['night'] + 3, 1), (mk['dawn'], 0), (mk['sting'] - 0.3, 0), (mk['sting'] + 1.0, 1.1), (dur, 1.1)])
    birds_t = mk['dawn'] + 1.0
    dr = drone(dur, 36.7, 340, 39)
    drg = envelope(dur, [(0, 0.8), (mk['dawn'], 0.2), (mk['box'], 0.4), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 52)
    sgg = envelope(dur, [(0, 0.4), (mk['dawn'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 53) * envelope(dur, [(0, 0), (mk['dawn'], 0), (mk['dawn'] + 1, 0.45), (mk['box'], 0.3), (mk['box'] + 0.6, 0)])
    beds = [(0, rn, 1.0), (0, laund(dur, 74), 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['dawn'], 78, 1.5), 0.5)]
    for k in range(5):
        tb = birds_t + k * 2.1
        if tb < mk['sting'] - 1: S(st(fade(tone(3100 + 300 * (k % 3), 0.08, 0.04), 0.005, 0.03)) * 0.22, tb, 0.5)
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

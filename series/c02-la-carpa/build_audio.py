#!/usr/bin/env python3
"""LA CARPA — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':    ('es-UY-MateoNeural',  '-4%',  '-3Hz',  'inner',   1.0,  'in'),
 'YO':      ('es-UY-MateoNeural',  '+2%',  '+2Hz',  'room',    0.95, 'yo'),
 'YOSH':    ('es-UY-MateoNeural',  '-4%',  '+0Hz',  'whisper', 1.0,  'yo'),
 'NICO':    ('es-AR-TomasNeural',  '+2%',  '+0Hz',  'room',    0.95, 'nico'),
 'NICOSH':  ('es-AR-TomasNeural',  '-6%',  '-2Hz',  'whisper', 1.0,  'nico'),
 'NICOF':   ('es-AR-TomasNeural',  '-6%',  '-2Hz',  'far',     1.0,  'nico'),
 'FUERA':   ('es-AR-TomasNeural',  '-10%', '-5Hz',  'far',     1.0,  'cosa'),
 'FUERAC':  ('es-AR-TomasNeural',  '-14%', '-8Hz',  'door',    1.05, 'cosa'),
 'FUERAF':  ('es-UY-MateoNeural',  '-8%',  '-5Hz',  'far',     1.0,  'cosa'),
 'GUARDA':  ('es-PY-MarioNeural',  '+0%',  '-2Hz',  'radio',   0.95, 'radio'),
 'GUARDAF': ('es-PY-MarioNeural',  '-10%', '-8Hz',  'door',    1.0,  'cosa'),
})

def sfx_zip(d=0.9, g=1.0):
    t = np.arange(int(d * SR)) / SR
    teeth = (np.sin(2 * np.pi * np.cumsum(55 + 30 * np.sin(np.pi * t / d)) / SR) > 0.6).astype(float)
    y = bp(noise(d), 1800, 7000) * lp(teeth, 900) * np.sin(np.pi * t / d) ** .5
    return reverb(y * 0.7 * g, 0.3, 0.12, seed=101)
def sfx_splash(d=1.8):
    t = np.arange(int(d * SR)) / SR
    y = lp(noise(d), 2500) * np.exp(-t / 0.35) * 0.9 + bp(noise(d), 300, 1200) * np.exp(-t / 0.6) * 0.5
    dr = sum(tone(f, 0.25, 0.05) * 0.2 for f in (620, 840, 1100))
    s = int(0.25 * SR); y[s:s + len(dr)] += dr
    return reverb(y, 1.8, 0.45, dark=3000, seed=102)
def sfx_grass_steps(d, rate=2.2):
    o = np.zeros(int((d + 0.6) * SR)); t = 0.0
    while t < d:
        k = add(bp(noise(0.18), 500, 4500) * env_exp(int(0.18 * SR), 0.05) * 0.5, tone(80, 0.15, 0.03) * 0.3)
        s = int(t * SR); o[s:s + len(k)] += k[:len(o) - s]; t += 1 / rate + rng.uniform(-.05, .05)
    return reverb(o, 0.9, 0.3, dark=3000, seed=103)
def crackle(d, seed=104, dens=0.0009):
    r = np.random.default_rng(seed); n = int(d * SR)
    y = (r.random(n) > 1 - dens).astype(float) * r.uniform(0.2, 1.0, n)
    y = bp(y, 1200, 7000) * 3 + lp(r.standard_normal(n), 300) * 0.15
    return st(y)
def sfx_lona(d=1.2):
    t = np.arange(int(d * SR)) / SR
    y = bp(noise(d), 300, 2500) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 3 * t))) * np.sin(np.pi * t / d) * 0.6
    return reverb(y, 0.6, 0.2, seed=105)
def radio_on():
    return add(static(0.6)[:, 0] * 0.8, np.pad(sfx_beep(1250, 0.12)[:, 0], (int(0.02 * SR), 0)))
def night(dur, cr_pts):
    w = wind(dur, 111, 380) * 1.2
    c = crickets(dur, 112) * envelope(dur, cr_pts)
    return w + c * 2.0

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(0.8), 0.0, 0.4)
    L('h1', 'YOIN', "A las dos de la mañana, mi amigo Nico me llamó desde afuera de la carpa.", gap=0.25)
    M('title')
    fb = M('fb', 0.4, adv=True); S(sfx_whoosh(0.9), fb - 0.3, 0.5)
    L('h2', 'YOIN', "Habíamos acampado en la laguna, en el medio del monte.", gap=0.3)
    L('n0', 'NICO', "Lo mejor de acá es que no hay nadie en kilómetros.", gap=0.4)
    bk = M('back', 0.6, adv=True); S(sfx_whoosh(0.7), bk - 0.3, 0.5); W(0.5)
    L('f1', 'FUERA', "Fede... Fede, salí. Vení a ver esto.", gap=0.2)
    L('y1', 'YOSH', "¿Nico?", gap=0.6)
    lt = M('light', 0.6, adv=True); S(sfx_click(), lt, 0.9)
    L('h3', 'YOIN', "Prendí la linterna del celular. Nico estaba acá. Al lado mío. Dormido.", gap=0.3)
    L('f2', 'FUERA', "Dale, Fede. Apurate, que se va.", gap=0.6)
    wk = M('walk', 0.3, adv=True); S(sfx_grass_steps(5.0), wk, 0.8)
    L('h4', 'YOIN', "Era su voz. Igualita. Y caminaba alrededor de la carpa.", gap=0.2)
    st_ = M('stop', 0.5, adv=True); W(0.5)
    L('f3', 'FUERAC', "Sé que estás despierto. Veo tu luz.", gap=0.0)
    sg = M('sting', 0.5, adv=True); S(sfx_zip(0.7), sg - 0.1, 1.0); S(sfx_sting(), sg, 0.9)
    ec = M('endcard', 1.4, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    amb = night(dur, [(0, 1), (mk['back'], 1), (mk['back'] + 0.3, 0.0), (dur, 0.0)])
    fire = crackle(dur) * envelope(dur, [(0, 0.15), (mk['fb'], 0.15), (mk['fb'] + 0.2, 1.0), (mk['back'], 1.0), (mk['back'] + 0.2, 0.15), (dur, 0.12)])
    dr = drone(dur, 36.7, 340, 31)
    drg = envelope(dur, [(0, 0.5), (mk['fb'], 0.0), (mk['back'], 0.0), (mk['back'] + 0.5, 0.5), (mk['walk'], 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 41)
    sgg = envelope(dur, [(0, 0), (mk['light'], 0), (mk['walk'], 0.4), (mk['stop'], 0.8), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['back'], 72, 3.0)
    beds = [(0, amb, 1.0), (0, fire, 0.7), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['back'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_lona(0.8), 0.1, 0.6)
    L('h1', 'YOIN', "No abrí. Sacudí a Nico hasta que se despertó.", gap=0.2)
    M('title', -1.8)
    L('n1', 'NICOSH', "¿Qué pasa? ¿Qué hora es?", gap=0.4)
    L('y1', 'YOSH', "Shh. Hay alguien afuera. Habla igual que vos.", gap=0.3)
    L('n2', 'NICOSH', "Dejate de embromar, Fede...", gap=0.3)
    L('f1', 'FUERAF', "¡Nico! ¡Nico, ayudame! ¡Me caí al agua!", gap=0.5)
    L('h2', 'YOIN', "Ahora tenía mi voz.", gap=0.4)
    L('n3', 'NICOSH', "Ese... sos vos.", gap=0.4)
    rd = M('radio', 0.6, adv=True); S(radio_on(), rd, 0.7)
    L('g1', 'GUARDA', "Campamento de la laguna, ¿me copian?", gap=0.55)
    L('y2', 'YO', "¡Sí! ¡Hay alguien afuera de la carpa!", gap=0.3)
    a, b = L('g2', 'GUARDA', "No hay nadie más en el parque. No abran. Voy para allá.", gap=0.4)
    S(static(0.4), b + 0.05, 0.4)
    lm = M('lamp', 0.8, adv=True); W(1.2)
    L('g3', 'GUARDAF', "Ya llegué, muchachos. Pueden abrir.", gap=0.0)
    L('n4', 'NICOSH', "Fede... no se escucharon pasos.", gap=0.6)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.9); S(sfx_lona(1.0), sg, 0.8)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    amb = wind(dur, 121, 380) * 1.2
    fire = crackle(dur, 122, 0.0004) * 0.12
    dr = drone(dur, 34.6, 360, 32)
    drg = envelope(dur, [(0, 0.6), (mk['radio'], 0.3), (mk['lamp'], 0.7), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (261.6, 277.2, 392.0), 43)
    sgg = envelope(dur, [(0, 0.3), (mk['radio'], 0.0), (mk['lamp'], 0.4), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0), (mk['endcard'] - 0.6, 0.4), (mk['endcard'] + 0.3, 0)])
    hb = sfx_heart(dur, 80, 2.0)
    beds = [(0, amb, 1.0), (0, fire, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, hb, 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.05, 0.5); tl.marks['title'] = 1.4
    L('h1', 'YOIN', "No abrí. Agarré el handy y apreté el botón.", gap=0.2)
    S(radio_on(), tl.t + 0.2, 0.7)
    L('y1', 'YOSH', "¿Guardaparque? ¿Ya está acá afuera?", gap=0.5)
    a, b = L('g1', 'GUARDA', "¿Afuera? No... recién estoy saliendo de la casilla.", gap=0.6)
    S(static(0.5), b + 0.05, 0.45)
    off = M('off', 0.5, adv=True); S(sfx_click(), off, 0.6); S(sfx_riser(2.0), off + 0.2, 0.35)
    L('h2', 'YOIN', "La luz de afuera se apagó. Y del otro lado de la lona, alguien dijo:", gap=0.3)
    L('f1', 'FUERA', "Bueno. Otra noche, Fede.", gap=0.5)
    aw = M('away', 0.2, adv=True); S(sfx_grass_steps(3.0, 1.8), aw, 0.7); S(sfx_splash(), aw + 3.0, 0.8); W(3.8)
    dw = M('dawn')
    L('h3', 'YOIN', "Esperamos sin hablar hasta que aclaró.", gap=0.3)
    op = M('open', 0.3, adv=True); S(sfx_zip(1.0), op, 0.9); W(0.6)
    L('h4', 'YOIN', "Alrededor de la carpa había pisadas mojadas. Salían de la laguna... y volvían al agua.", gap=0.5)
    L('h5', 'YOIN', "Nico bajó a la orilla a lavarse la cara.", gap=0.6)
    W(0.5)
    L('n1', 'NICOF', "Fede... vení a ver esto.", gap=0.3)
    sg = M('sting', 0.35, adv=True); S(sfx_sting(1.1), sg, 0.95)
    L('h6', 'YOIN', "Las mismas palabras.", gap=0.9)
    ec = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos irías a ver?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    amb = wind(dur, 131, 380) * 1.2 + crickets(dur, 132) * 2.0 * envelope(dur, [(0, 0), (mk['away'] + 3.5, 0), (mk['away'] + 4.5, 0.8), (mk['dawn'] + 2, 0.4), (dur, 0.2)])
    dr = drone(dur, 36.7, 340, 33)
    drg = envelope(dur, [(0, 0.8), (mk['off'], 0.9), (mk['away'] + 3, 0.6), (mk['dawn'], 0.2), (mk['open'] + 1, 0.15), (mk['sting'] - 2, 0.4), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 44)
    sgg = envelope(dur, [(0, 0.4), (mk['off'], 0.7), (mk['dawn'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    beds = [(0, amb, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(mk['dawn'], 78, 1.5), 0.6)]
    for k in range(6):  # pájaros al amanecer
        tb = mk['dawn'] + 1.5 + k * 2.3
        if tb < mk['sting'] - 1: S(st(fade(tone(2900 + 350 * (k % 3), 0.09, 0.04), 0.005, 0.03)) * 0.25, tb, 0.5); S(st(fade(tone(3400, 0.07, 0.03), 0.005, 0.03)) * 0.2, tb + 0.14, 0.5)
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

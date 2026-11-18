#!/usr/bin/env python3
"""Virales 18/11/2026 — 3 shorts. p1: pez de cabeza transparente  p2: hipopótamos en el desierto de Arabia  p3: posible nuevo planeta enano"""
import sys
from audio_core import *

VO.update({
 'N':  ('es-UY-MateoNeural', '+8%', '+0Hz', 'dry', 1.0, 'n'),
 'NQ': ('es-UY-MateoNeural', '+4%', '+2Hz', 'dry', 1.0, 'q'),
})

def saw(f, d, det=0.0):
    t = np.arange(int(d * SR)) / SR; y = np.zeros_like(t)
    for k in (1, 1.003 + det, 0.997 - det):
        y += 2 * ((t * f * k) % 1) - 1
    return y / 3
def sine_pad(f, d):
    t = np.arange(int(d * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.002 * t) + .25 * np.sin(2 * np.pi * f * 3.01 * t)) / 1.75
def place(o, x, at, g=1.0):
    n = len(o); s = int(at * SR)
    if s >= n: return
    e = min(n, s + len(x)); o[s:e] += st(x)[:e - s] * g

def music(dur, style, seed=0):
    n = int(dur * SR); o = np.zeros((n, 2))
    if style == 'ocean':   # slow, deep, mysterious: soft pads + sonar pings
        bpm = 70; prog = [(110.0, (220.0, 261.6, 329.6)), (87.3, (174.6, 220.0, 261.6)), (98.0, (196.0, 246.9, 293.7)), (82.4, (164.8, 207.7, 246.9))]
    elif style == 'desert':
        bpm = 96; prog = [(146.8, (293.7, 349.2, 440.0)), (130.8, (261.6, 329.6, 392.0)), (116.5, (233.1, 293.7, 349.2)), (130.8, (261.6, 311.1, 392.0))]
    else:
        bpm = 100; prog = [(130.8, (261.6, 311.1, 392.0)), (103.8, (207.7, 261.6, 311.1)), (116.5, (233.1, 293.7, 349.2)), (98.0, (196.0, 246.9, 293.7))]
    beat = 60 / bpm; bar = 4 * beat; t0 = 0.0; i = 0
    while t0 < dur:
        root, ch = prog[i % 4]
        if style == 'ocean':
            pad = sum(sine_pad(f / 2, bar + .8) for f in ch) / 3; pad = lp(pad, 900)
        else:
            pad = sum(saw(f, bar + .3) for f in ch) / 3; pad = lp(pad, 1800 if style == 'space' else 1300)
        L = len(pad); env = np.minimum(1, np.arange(L) / (.4 * SR)) * np.minimum(1, (L - np.arange(L)) / (.5 * SR))
        place(o, pad * env, t0, .24)
        if style == 'ocean':
            bn = lp(sine_pad(root / 2, bar), 300) * env_exp(int(bar * SR), 1.2); place(o, bn, t0, .35)
            place(o, reverb(tone(1568, 1.2, .25) * .5, 2.5, .6, seed=21 + i), t0 + beat * 2, .25)
        elif style == 'desert':
            for b8 in range(8):
                bt = t0 + b8 * beat / 2
                if b8 in (0, 3, 6): place(o, lp(saw(root / 2, beat * .4), 600) * env_exp(int(beat * .4 * SR), .1), bt, .38)
            scale = [293.7, 349.2, 392.0, 440.0, 523.3, 587.3]
            r = np.random.default_rng(seed + i)
            for b8 in range(8):
                if r.random() < .55:
                    f = scale[r.integers(len(scale))]; pl = tone(f, .5, .12, ((2, .4), (3, .2))) * .3
                    place(o, pl, t0 + b8 * beat / 2, .5)
        else:
            for b16 in range(16):
                f = ch[b16 % 3] * (2 if b16 % 8 >= 4 else 1); ar = lp(saw(f, beat / 4 * .9), 2500) * env_exp(int(beat / 4 * .9 * SR), .06)
                place(o, ar, t0 + b16 * beat / 4, .12)
            for b8 in range(8):
                place(o, lp(saw(root / 2, beat / 2 * .9), 450) * env_exp(int(beat / 2 * .9 * SR), .12), t0 + b8 * beat / 2, .32)
        t0 += bar; i += 1
    # percussion
    b = 0
    while b * beat < dur:
        tt = b * beat
        if style == 'desert':
            dk = add(tone(80, .4, .12) * 1.1, nb(.06, 400, 2500, .015, .4))
            tk = add(tone(320, .2, .04) * .5, nb(.08, 1500, 6000, .02, .5))
            place(o, dk, tt, .5 if b % 2 == 0 else .3); place(o, tk, tt + beat * .5, .3); place(o, tk, tt + beat * .75, .18)
        elif style == 'space':
            place(o, add(tone(52, .4, .1) * 1.2, nb(.05, 1500, 5000, .01, .3)), tt, .5)
            place(o, nb(.06, 6000, 14000, .015, .25), tt + beat / 2, .45)
            if b % 2 == 1: place(o, add(nb(.25, 900, 6000, .07, .6), tone(190, .2, .05) * .3), tt, .3)
        b += 1
    return reverb(o, 2.4 if style == 'ocean' else 1.3, .3 if style == 'ocean' else .18, dark=4000, seed=12)

def boom(): return reverb(add(tone(48, 1.6, .5) * 1.2, nb(.5, 60, 900, .18, .6)), 1.5, .3, seed=13)
def stamp(): return reverb(add(tone(70, .5, .08) * 1.3, nb(.12, 200, 3000, .03, .9)), .6, .2, seed=14)
def ticks(d, rate=14):
    o = np.zeros(int(d * SR)); k = st(sfx_beep(2400, .02, .25))[:, 0]
    for i in range(int(d * rate)):
        s = int(i / rate * SR); o[s:s + len(k)] += k[:len(o) - s]
    return o
def sonar(): return reverb(tone(1240, 1.4, .35, ((2, .15),)) * .7, 2.8, .55, seed=16)
def bubbles(d, seed=4):
    r = np.random.default_rng(seed); o = np.zeros(int(d * SR))
    for i in range(int(d * 9)):
        f = r.uniform(500, 1400); dd = r.uniform(.04, .09); t = np.arange(int(dd * SR)) / SR
        b = np.sin(2 * np.pi * (f + 3000 * t) * t) * np.exp(-t / (dd / 3)) * r.uniform(.2, .5)
        s = int(r.uniform(0, d - .1) * SR); o[s:s + len(b)] += b
    return reverb(o, 1.2, .4, seed=17)
def chime(): return sfx_ding(1760, 2, gap=.12, g=.4)
def splash():
    return reverb(add(nb(.9, 300, 5000, .25, .7), tone(90, .4, .1) * .5), 1.0, .3, seed=18)
def wind_s(d): return wind(d, seed=88, f=700)
def whoosh_low(): return lp(sfx_whoosh(1.0), 1200) * 1.4

def bed(tl, dur, style, extra=()):
    mk = tl.marks
    mu = music(dur + 1, style)[:int(dur * SR)]
    g = envelope(dur, [(0, .45), (mk['title'] - .05, .45), (mk['title'], 1.0), (mk['endcard'], 1.0), (dur - .6, 0.0), (dur, 0.0)])
    mixdown(tl, dur, [(0, mu * g, 1.0), *extra])

# ================================================================ P1 — pez de cabeza transparente
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sonar(), 0.0, .7); S(bubbles(2.5), 0.0, .5)
    L('h1', 'N', "Este pez tiene la cabeza transparente. Y mira a través de ella.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('a1', 'N', "Se llama pez ojos de barril, y lo acaban de filmar en cuatro K, frente a California.", gap=0.1,
             show="Se llama pez ojos de barril, y lo acaban de filmar en 4K, frente a California.")
    tl.marks['cam'] = a; S(sfx_click(), a + 2.6, .6)
    a, b = L('a2', 'N', "Estaba a casi seiscientos metros de profundidad, donde casi no llega la luz.", gap=0.35,
             show="Estaba a casi 600 metros de profundidad, donde casi no llega la luz.")
    tl.marks['depth'] = a; S(whoosh_low(), a - .3, .6); S(ticks(2.4, 12), a + .4, .35); S(sonar(), b - .6, .5)
    a, b = L('a3', 'N', "Mide unos quince centímetros, y su cabeza es una cúpula transparente, llena de líquido.", gap=0.35,
             show="Mide unos 15 centímetros, y su cabeza es una cúpula transparente, llena de líquido.")
    tl.marks['size'] = a; S(sfx_whoosh(), a - .3, .5); S(chime(), a + 2.0, .4)
    a, b = L('a4', 'N', "Esos dos puntitos de adelante parecen ojos. Pero no: son para oler.", gap=0.35)
    tl.marks['nose'] = a; S(stamp(), b - .9, .6)
    a, b = L('a5', 'N', "Los ojos de verdad están adentro: son esos tubos verdes. Y pueden girar hacia arriba o hacia adelante, para seguir a su presa.", gap=0.4)
    tl.marks['eyes'] = a; S(sfx_whoosh(), a - .3, .5); S(sfx_riser(1.8), a + 3.4, .35)
    a, b = L('a6', 'N', "Los científicos hicieron unas siete mil inmersiones con robots en casi cuarenta años, y lo vieron solo once veces.", gap=0.4,
             show="Los científicos hicieron unas 7.000 inmersiones con robots en casi 40 años, y lo vieron solo 11 veces.")
    tl.marks['rare'] = a; S(ticks(2.2, 16), a + 1.6, .35); S(boom(), b - .9, .5)
    a, b = L('a7', 'N', "Lo filmaron unos veinte minutos. Y lo dejaron ir.", gap=0.35, show="Lo filmaron unos 20 minutos. Y lo dejaron ir.")
    tl.marks['free'] = a; S(bubbles(3.0, 9), a + 1.5, .6)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Vos te animarías a bajar hasta ahí?", gap=0.15)
    W(2.6); dur = tl.t
    bed(tl, dur, 'ocean')

# ================================================================ P2 — hipopótamos en Arabia
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(wind_s(3.0), 0.0, .6)
    L('h1', 'N', "En medio de uno de los desiertos más secos del mundo, vivían hipopótamos.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('b1', 'N', "Esto es el Cuarto Vacío, en el sur de Arabia Saudita: arena hasta donde llega la vista.", gap=0.1)
    tl.marks['today'] = a; S(wind_s(4.0), a, .4)
    a, b = L('b2', 'N', "Pero hace ciento veinticinco mil años, acá había un lago enorme: unos trescientos cuarenta kilómetros cuadrados, y hasta veintinueve metros de hondo.", gap=0.35,
             show="Pero hace 125.000 años, acá había un lago enorme: unos 340 kilómetros cuadrados, y hasta 29 metros de hondo.")
    tl.marks['lake'] = a; S(sfx_riser(1.4), a - .9, .4); S(ticks(2.4, 16), a + .5, .35); S(splash(), a + 2.6, .7)
    a, b = L('b3', 'N', "Es el lago Mundafan. Y en su orilla vivían hipopótamos, búfalos gigantes de cuernos largos, gacelas, órices y avestruces.", gap=0.35)
    tl.marks['animals'] = a; S(sfx_whoosh(), a - .3, .5)
    w = tl.T('b3')['words']; k = 0
    for wd in w:
        if wd[0].lower().startswith(('hipop', 'búfal', 'gacel', 'órice', 'avest')):
            tl.marks['an%d' % k] = wd[1]; S(sfx_tap(1, .3, .5), wd[1], .4); k += 1
    a, b = L('b4', 'N', "Los científicos encontraron más de cinco mil quinientas herramientas de piedra.", gap=0.35,
             show="Los científicos encontraron más de 5.500 herramientas de piedra.")
    tl.marks['tools'] = a; S(ticks(2.2, 18), a + 1.2, .35); S(stamp(), b - .2, .5)
    a, b = L('b5', 'N', "Y en algunas, restos de plantas tóxicas. Quizás usaban veneno para cazar.", gap=0.35)
    tl.marks['poison'] = a; S(sfx_sting(.6), a + 1.6, .35)
    a, b = L('b6', 'N', "Era una época de lluvias que los científicos llaman la Arabia Verde. El estudio salió este mes, en la revista Science.", gap=0.4)
    tl.marks['green'] = a; S(chime(), a + .4, .4); S(boom(), b - 1.2, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Te imaginabas un desierto con hipopótamos?", gap=0.15)
    W(2.6); dur = tl.t
    bed(tl, dur, 'desert')

# ================================================================ P3 — nuevo planeta enano
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_riser(1.6), 0.0, .45)
    L('h1', 'N', "Puede que el sistema solar tenga un nuevo planeta enano. Y está más lejos que Plutón.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .9); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('c1', 'N', "Hoy hay solo cinco planetas enanos oficiales: Plutón, Ceres, Eris, Haumea y Makemake.", gap=0.1)
    tl.marks['five'] = a
    for i, wd in enumerate([w for w in tl.T('c1')['words'][-6:] if w[0] != 'y']):
        tl.marks['dw%d' % i] = wd[1]; S(sfx_beep(1200 + i * 150, .07, .3), wd[1], .4)
    a, b = L('c2', 'N', "Pero el observatorio Vera Rubin, en Chile, encontró un candidato: dos mil veintiséis E D ciento treinta y ocho.", gap=0.35,
             show="Pero el observatorio Vera Rubin, en Chile, encontró un candidato: 2026 ED138.")
    tl.marks['found'] = a; S(sfx_whoosh(), a - .3, .5); S(boom(), a + 3.6, .5)
    a, b = L('c3', 'N', "Está a unas cuarenta y seis veces la distancia entre la Tierra y el Sol. Plutón, en promedio, está a cuarenta.", gap=0.4,
             show="Está a unas 46 veces la distancia entre la Tierra y el Sol. Plutón, en promedio, está a 40.")
    tl.marks['dist'] = a; S(ticks(2.4, 14), a + .8, .35)
    a, b = L('c4', 'N', "Mediría entre seiscientos y mil quinientos kilómetros de ancho. Plutón mide unos dos mil cuatrocientos.", gap=0.4,
             show="Mediría entre 600 y 1.500 kilómetros de ancho. Plutón mide unos 2.400.")
    tl.marks['size'] = a; S(sfx_whoosh(), a - .3, .5)
    a, b = L('c5', 'N', "Y su órbita está inclinada casi veinticinco grados, quizás por un empujón de la gravedad de Neptuno.", gap=0.4,
             show="Y su órbita está inclinada casi 25 grados, quizás por un empujón de la gravedad de Neptuno.")
    tl.marks['tilt'] = a; S(sfx_riser(1.6), a + .5, .3)
    a, b = L('c6', 'N', "Ahora falta confirmarlo con telescopios infrarrojos. Si lo logran, podría ser el sexto.", gap=0.4)
    tl.marks['sixth'] = a; S(stamp(), b - .5, .6); S(boom(), b - .5, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Qué nombre le pondrías vos?", gap=0.15)
    W(2.6); dur = tl.t
    bed(tl, dur, 'space')

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

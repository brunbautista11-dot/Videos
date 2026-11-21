#!/usr/bin/env python3
"""Virales 21/11/2026 — 3 shorts. p1: mini luna 2026 QQ8  p2: el pájaro gigante de la cueva del hobbit  p3: la araña con el primer nombre científico"""
import sys
from audio_core import *

VO.update({
 'N':  ('es-UY-MateoNeural', '+20%', '+0Hz', 'dry', 1.0, 'n'),
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

def hum_off(): return reverb(add(tone(55, 1.2, .5) * .8, nb(.4, 80, 900, .15, .5)), 1.2, .3, seed=19)
def zap(): return reverb(add(nb(.18, 2000, 9000, .04, .7), tone(1800, .12, .03) * .3), .5, .2, seed=20)
def streak(): return reverb(lp(sfx_whoosh(.5), 4000) * .9, 1.6, .4, seed=22)
def caw():
    t = np.arange(int(.32 * SR)) / SR; f = 620 - 260 * t / .32
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 + np.sin(4 * np.pi * np.cumsum(f) / SR) * .3
    return reverb(bp(y * np.minimum(1, t / .02) * np.exp(-t / .16), 400, 3000), .8, .25, seed=23)
def squeak():
    t = np.arange(int(.18 * SR)) / SR; f = 2600 + 900 * np.sin(t * 40)
    return reverb(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .01) * np.exp(-t / .07) * .35, .6, .25, seed=24)
def blast(): return reverb(add(tone(36, 2.4, .9) * 1.4, nb(1.2, 40, 1400, .5, .8)), 2.4, .4, seed=25)

def cricket(d, seed=31):
    r = np.random.default_rng(seed); o = np.zeros(int(d * SR))
    for i in range(int(d * 2.2)):
        s = int(r.uniform(0, max(.1, d - .3)) * SR)
        for k in range(3):
            t = np.arange(int(.03 * SR)) / SR; b = np.sin(2 * np.pi * 4300 * t) * np.exp(-t / .01) * .12
            ss_ = s + int(k * .05 * SR); o[ss_:ss_ + len(b)] += b[:max(0, len(o) - ss_)]
    return o
def birdcall():
    t = np.arange(int(.5 * SR)) / SR; f = 900 + 500 * np.sin(t * 30) * np.exp(-t * 3)
    return reverb(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / .02) * np.exp(-t / .2) * .4, 1.0, .3, seed=26)
def waves(d, seed=5):
    n = int(d * SR); x = nb(d, 150, 1800, d / 2, .6)[:n] if False else None
    r = np.random.default_rng(seed); w = r.standard_normal(n); w = lp(w, 900) * .5
    env = .5 + .5 * np.sin(np.arange(n) / SR * 2 * np.pi / 6.0) ** 2
    return w * env * .5

# ================================================================ P1 — la mini luna 2026 QQ8
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(streak(), 0.05, .6)
    L('h1', 'N', "La Tierra tiene una luna nueva... y es más chica que un auto.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('d1', 'N', "Se llama dos mil veintiséis, cu cu ocho. Es una mini luna: un asteroide chiquito atrapado por la Tierra.", gap=0.1,
             show="Se llama 2026 QQ8. Es una mini luna: un asteroide chiquito atrapado por la Tierra.")
    tl.marks['name'] = a; S(sfx_tap(3, .2, .4), a + 1.2, .4)
    a, b = L('d2', 'N', "La vio por primera vez el astrónomo Krisztián Sárneczky, el veinte de agosto. Y el veintinueve de octubre se hizo oficial.", gap=0.35,
             show="La vio por primera vez el astrónomo Krisztián Sárneczky, el 20 de agosto. Y el 29 de octubre se hizo oficial.")
    tl.marks['disc'] = a; S(sfx_beep(1300, .25, .3), a + .5, .4); S(stamp(), b - .6, .5)
    a, b = L('d3', 'N', "Al principio no sabían si era una roca... o un pedazo de cohete viejo. Telescopios en Hawái y en Arizona confirmaron que es natural.", gap=0.35)
    tl.marks['nat'] = a; S(zap(), a + 2.2, .4); S(stamp(), b - .5, .5)
    a, b = L('d4', 'N', "Mide entre uno y dos metros: más o menos como una persona.", gap=0.35)
    tl.marks['size'] = a; S(ticks(1.8, 14), a + .4, .3); S(sfx_tap(2, .3, .4), b - .8, .4)
    a, b = L('d5', 'N', "Quedó atrapada en abril, y va a seguir dando vueltas con nosotros hasta fin de año, o principios de dos mil veintisiete.", gap=0.35,
             show="Quedó atrapada en abril, y va a seguir dando vueltas con nosotros hasta fin de año, o principios de 2027.")
    tl.marks['stay'] = a; S(sfx_whoosh(), a - .3, .5); S(chime(), b - 1.0, .4)
    a, b = L('d6', 'N', "Tranqui: no hay ningún riesgo de choque. Lo más cerca que pasa es a unos quinientos sesenta y ocho mil kilómetros: casi una vez y media la distancia a la Luna.", gap=0.4,
             show="Tranqui: no hay ningún riesgo de choque. Lo más cerca que pasa es a unos 568.000 km: casi 1,5 veces la distancia a la Luna.")
    tl.marks['dist'] = a; S(ticks(2.4, 16), a + 3.6, .3); S(stamp(), b - .5, .5)
    a, b = L('d7', 'N', "Y no es la primera. Según algunos estudios, la Tierra podría tener hasta seis mini lunas al mismo tiempo.", gap=0.4)
    tl.marks['six'] = a; S(sfx_riser(1.8), b - 2.0, .3); S(boom(), b - .3, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Qué nombre le pondrías vos?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'space')

# ================================================================ P2 — el pájaro gigante de Flores
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(birdcall(), 0.1, .6)
    L('h1', 'N', "Este hueso esperó diecisiete años... hasta que se dieron cuenta: era de un pájaro desconocido.", gap=0.2,
      show="Este hueso esperó 17 años... hasta que se dieron cuenta: era de un pájaro desconocido.")
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('f1', 'N', "Lo sacaron en dos mil nueve de la cueva Liang Bua, en la isla de Flores, Indonesia. Ahí mismo donde apareció el famoso hobbit: el Homo floresiensis.", gap=0.1,
             show="Lo sacaron en 2009 de la cueva Liang Bua, en la isla de Flores, Indonesia. Ahí mismo donde apareció el famoso \"hobbit\": el Homo floresiensis.")
    tl.marks['cave'] = a; S(sfx_tap(2, .3, .4), a + 1.4, .4)
    a, b = L('f2', 'N', "Es solo un pedazo de hueso de la pata. Pero es más grande que el de cualquier otro pájaro conocido de su grupo.", gap=0.35)
    tl.marks['bone'] = a; S(stamp(), a + 1.6, .5)
    a, b = L('f3', 'N', "Calcularon que pesaba unos tres kilos novecientos. El único pariente que vive hoy en Flores pesa de medio kilo a un kilo doscientos.", gap=0.35,
             show="Calcularon que pesaba unos 3,9 kilos. El único pariente que vive hoy en Flores pesa de medio kilo a 1,2 kilos.")
    tl.marks['kg'] = a; S(ticks(2.0, 16), a + .8, .35); S(boom(), a + 3.0, .4)
    a, b = L('f4', 'N', "Es un megápodo: un pariente de las gallinas con un truco raro. No empolla los huevos: los entierra, y el calor del ambiente hace el trabajo.", gap=0.35)
    tl.marks['mound'] = a; S(sfx_riser(1.6), a + 2.6, .3); S(sfx_tap(3, .25, .4), b - 1.6, .4)
    a, b = L('f5', 'N', "Vivió hace entre ciento noventa mil y ciento veinte mil años.", gap=0.35,
             show="Vivió hace entre 190.000 y 120.000 años.")
    tl.marks['age'] = a; S(ticks(2.0, 14), a + .6, .3)
    a, b = L('f6', 'N', "Lo llamaron Megapodius rókusi, por Rokus Due Awe: el científico indonesio que vio que era de un pájaro.", gap=0.35,
             show="Lo llamaron Megapodius rokusi, por Rokus Due Awe: el científico indonesio que vio que era de un pájaro.")
    tl.marks['name'] = a; S(chime(), a + 2.2, .4)
    a, b = L('f7', 'N', "¿Y el hobbit se comía sus huevos? Los científicos dicen que pudo ser... pero todavía no está probado.", gap=0.4)
    tl.marks['eggs'] = a; S(sfx_whoosh(), a - .3, .5); S(stamp(), b - .6, .5)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Lo tendrías en el patio?", gap=0.15)
    W(1.4); dur = tl.t
    bed(tl, dur, 'desert', extra=[(0, st(cricket(dur)) * .5, 1.0)])

# ================================================================ P3 — la araña del primer nombre
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_tap(2, .2, .5), 0.1, .5)
    L('h1', 'N', "El primer animal con nombre científico de la historia... es una araña.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('s1', 'N', "Se llama Aráneus angulátus. La describió el sueco Carl Clerck en mil setecientos cincuenta y siete,.", gap=0.1,
             show="Se llama Araneus angulatus. La describió el sueco Carl Clerck en 1757,.")
    tl.marks['name'] = a; S(sfx_tap(2, .3, .4), a + 1.0, .4)
    a, b = L('s2', 'N', "Un año antes de que el famoso Linneo nombrara animales así, con dos palabras.", gap=0.35)
    tl.marks['lin'] = a; S(stamp(), b - .5, .5)
    a, b = L('s3', 'N', "En mil ochocientos noventa y dos, un congreso decidió que todo empezaba con Linneo... y los nombres de Clerck quedaron afuera.", gap=0.35,
             show="En 1892, un congreso decidió que todo empezaba con Linneo... y los nombres de Clerck quedaron afuera.")
    tl.marks['out'] = a; S(zap(), b - .8, .5)
    a, b = L('s4', 'N', "Pero en mil novecientos cuarenta y ocho le hicieron una excepción: la única de ese tipo en la historia.", gap=0.35,
             show="Pero en 1948 le hicieron una excepción: la única de ese tipo en la historia.")
    tl.marks['exc'] = a; S(chime(), a + 2.0, .4); S(stamp(), b - .5, .5)
    a, b = L('s5', 'N', "El problema: Clerck guardó tres arañas de muestra... y en algún momento entre mil ochocientos cincuenta y ocho y mil novecientos sesenta y cinco, desaparecieron.", gap=0.35,
             show="El problema: Clerck guardó tres arañas de muestra... y en algún momento entre 1858 y 1965, desaparecieron.")
    tl.marks['lost'] = a; S(sfx_riser(1.6), b - 1.8, .3); S(hum_off(), b - .3, .5)
    a, b = L('s6', 'N', "Así que un equipo liderado por el Museo Smithsoniano fue a una isla del mar Báltico, en Suecia.", gap=0.35)
    tl.marks['isle'] = a; S(sfx_whoosh(), a - .3, .5)
    a, b = L('s7', 'N', "Juntaron ocho arañas, leyeron su ADN, y eligieron un macho como la nueva muestra oficial: un neotipo.", gap=0.35)
    tl.marks['dna'] = a; S(ticks(1.8, 16), a + 2.0, .3); S(stamp(), b - .5, .5)
    a, b = L('s8', 'N', "Es del tamaño de un botón, y ahora se guarda en el Museo Sueco de Historia Natural, junto a otras arañas de Clerck.", gap=0.4)
    tl.marks['museum'] = a; S(chime(), b - 1.0, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Le tenés miedo a las arañas?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(waves(dur)) * .35, 1.0)])

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

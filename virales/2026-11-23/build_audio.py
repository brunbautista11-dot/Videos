#!/usr/bin/env python3
"""Virales 23/11/2026 — 3 shorts. p1: la Voyager 1 llega a un día luz  p2: Jonathan, la tortuga de 194 años y su ADN  p3: el Niño de Taung complica la evolución humana"""
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

def croak():
    t = np.arange(int(.22 * SR)) / SR; f = 420 + 80 * np.sin(t * 60)
    y = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (.5 + .5 * np.sin(2 * np.pi * 38 * t))
    return reverb(bp(y * np.minimum(1, t / .01) * np.exp(-t / .09) * .3, 300, 2200), .9, .3, seed=27)
def frogs(d, seed=41):
    r = np.random.default_rng(seed); o = np.zeros((int(d * SR), 2))
    for i in range(int(d * .8)):
        place(o, croak(), r.uniform(0, max(.1, d - .4)), r.uniform(.15, .35))
    return o
def howl():
    t = np.arange(int(1.6 * SR)) / SR; f = 160 + 90 * np.sin(np.pi * t / 1.6) + 6 * np.sin(t * 30)
    y = sum(np.sin(2 * np.pi * k * np.cumsum(f) / SR) / k for k in (1, 2, 3, 4))
    return reverb(bp(y * np.minimum(1, t / .2) * np.minimum(1, (1.6 - t) / .4) * .35, 120, 1800), 2.2, .5, seed=28)

def beep_tx():
    return sfx_ding(1320, 2, gap=.09, g=.35)
def radio(d, seed=7):
    r = np.random.default_rng(seed); n = int(d * SR); w = bp(r.standard_normal(n), 900, 3500) * .12
    return w * (.6 + .4 * np.sin(np.arange(n) / SR * 2 * np.pi * 3) ** 2)
def seawaves(d): return waves(d, seed=9)

# ================================================================ P1 — Voyager 1 a un día luz
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(beep_tx(), 0.05, .6)
    L('h1', 'N', "Hay una nave tan lejos, que un mensaje a la velocidad de la luz tarda un día entero en llegar.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('d1', 'N', "Es la Voyager uno. Salió de la Tierra en mil novecientos setenta y siete... y nunca dejó de alejarse.", gap=0.1,
             show="Es la Voyager 1. Salió de la Tierra en 1977... y nunca dejó de alejarse.")
    tl.marks['who'] = a; S(streak(), a + 1.2, .4)
    a, b = L('d2', 'N', "El dieciocho de noviembre cruzó una marca histórica: ya está a un día luz de nosotros.", gap=0.35,
             show="El 18 de noviembre cruzó una marca histórica: ya está a un día luz de nosotros.")
    tl.marks['date'] = a; S(stamp(), b - .5, .5)
    a, b = L('d3', 'N', "Son casi veintiséis mil millones de kilómetros. Y sigue volando a unos sesenta y un mil kilómetros por hora.", gap=0.35,
             show="Son casi 26.000 millones de kilómetros. Y sigue volando a unos 61.000 kilómetros por hora.")
    tl.marks['dist'] = a; S(ticks(2.2, 16), a + .6, .3); S(whoosh_low(), b - 1.6, .5)
    a, b = L('d4', 'N', "La luz va de la Tierra a la Luna en poco más de un segundo. A Neptuno, en unas cuatro horas. Y a la Voyager... en veinticuatro.", gap=0.35,
             show="La luz va de la Tierra a la Luna en poco más de un segundo. A Neptuno, en unas 4 horas. Y a la Voyager... en 24.")
    tl.marks['light'] = a; S(zap(), a + 3.4, .35); S(zap(), a + 5.4, .35); S(stamp(), b - .5, .5)
    a, b = L('d5', 'N', "Si la NASA le manda una orden, tarda un día en llegar... y la respuesta, otro día en volver.", gap=0.35)
    tl.marks['cmd'] = a; S(beep_tx(), a + .8, .4); S(beep_tx(), b - 1.2, .4)
    a, b = L('d6', 'N', "Su fuente de energía nuclear tiene casi cincuenta años, y pierde unos cuatro vatios por año. Por eso le fueron apagando aparatos, de a uno.", gap=0.35,
             show="Su fuente de energía nuclear tiene casi 50 años, y pierde unos 4 vatios por año. Por eso le fueron apagando aparatos, de a uno.")
    tl.marks['pow'] = a; S(hum_off(), b - 1.4, .5)
    a, b = L('d7', 'N', "Desde dos mil doce viaja por el espacio interestelar. Y lleva un disco de oro, con sonidos y saludos de la Tierra.", gap=0.4,
             show="Desde 2012 viaja por el espacio interestelar. Y lleva un disco de oro, con sonidos y saludos de la Tierra.")
    tl.marks['gold'] = a; S(chime(), b - 1.6, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Te subirías a un viaje así, sin vuelta?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'space', extra=[(0, st(radio(dur)) * .25, 1.0)])

# ================================================================ P2 — Jonathan, la tortuga de 194 años
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(chime(), 0.05, .4)
    L('h1', 'N', "Esta tortuga tendría ciento noventa y cuatro años... y los científicos acaban de leer el secreto de su ADN.", gap=0.2,
      show="Esta tortuga tendría 194 años... y los científicos acaban de leer el secreto de su ADN.")
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('t1', 'N', "Se llama Yónatan, y es una tortuga gigante de Aldabra. Se cree que nació alrededor de mil ochocientos treinta y dos.", gap=0.1,
             show="Se llama Jonathan, y es una tortuga gigante de Aldabra. Se cree que nació alrededor de 1832.")
    tl.marks['name'] = a; S(sfx_tap(2, .3, .4), a + 1.2, .4)
    a, b = L('t2', 'N', "Vive en Santa Elena, una isla perdida en el medio del Atlántico Sur, en los jardines de la casa del gobernador.", gap=0.35)
    tl.marks['home'] = a; S(splash(), a + 1.6, .3)
    a, b = L('t3', 'N', "Llegó desde las Seychelles hace ciento cuarenta y cuatro años, como regalo... y ya era grande.", gap=0.35,
             show="Llegó desde las Seychelles hace 144 años, como regalo... y ya era grande.")
    tl.marks['arrive'] = a; S(sfx_whoosh(), a + 1.4, .5); S(sfx_tap(3, .25, .4), b - .8, .4)
    a, b = L('t4', 'N', "Es el animal terrestre vivo más viejo que se conoce.", gap=0.35)
    tl.marks['oldest'] = a; S(stamp(), b - .4, .5)
    a, b = L('t5', 'N', "Ahora, un equipo estudió su epigenoma: las marcas químicas que prenden y apagan los genes. Y lo comparó con tortugas más jóvenes.", gap=0.35)
    tl.marks['epi'] = a; S(zap(), a + 3.0, .3); S(zap(), a + 3.8, .3)
    a, b = L('t6', 'N', "Encontraron doscientas ochenta y siete variantes genéticas ligadas a protegerse del envejecimiento: reparar el ADN, controlar la inflamación y la insulina, y frenar el cáncer.", gap=0.35,
             show="Encontraron 287 variantes genéticas ligadas a protegerse del envejecimiento: reparar el ADN, controlar la inflamación y la insulina, y frenar el cáncer.")
    tl.marks['var'] = a; S(ticks(2.0, 16), a + .9, .3)
    a, b = L('t7', 'N', "Y lo más loco: lo que repara su ADN sigue casi igual que en una tortuga joven. El estudio salió en la revista Science Advances.", gap=0.4)
    tl.marks['stable'] = a; S(chime(), b - 1.2, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Te gustaría vivir doscientos años?", gap=0.15, show="¿Te gustaría vivir 200 años?")
    W(1.6); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(seawaves(dur)) * .5, 1.0)])

# ================================================================ P3 — el Niño de Taung
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(stamp(), 0.05, .5)
    L('h1', 'N', "Un fósil de un nene de hace tres millones de años acaba de complicar la historia de la evolución humana.", gap=0.2,
      show="Un fósil de un nene de hace 3 millones de años acaba de complicar la historia de la evolución humana.")
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('k1', 'N', "Es el Niño de Taung. Lo encontraron en Sudáfrica en mil novecientos veinticuatro, y es el fósil que define a una especie: Australopítecus africánus.", gap=0.1,
             show="Es el Niño de Taung. Lo encontraron en Sudáfrica en 1924, y es el fósil que define a una especie: Australopithecus africanus.")
    tl.marks['taung'] = a; S(sfx_tap(2, .3, .4), a + 1.2, .4)
    a, b = L('k2', 'N', "Un nuevo estudio calculó su edad: entre dos coma noventa y seis y tres coma cero tres millones de años.", gap=0.35,
             show="Un nuevo estudio calculó su edad: entre 2,96 y 3,03 millones de años.")
    tl.marks['age'] = a; S(ticks(2.0, 16), a + 1.8, .3)
    a, b = L('k3', 'N', "Y es el único fósil que se puede asignar con seguridad a esa especie.", gap=0.35)
    tl.marks['only'] = a; S(stamp(), b - .5, .5)
    a, b = L('k4', 'N', "Compararon cómo crecían los dientes y el cerebro. Y varios fósiles adultos que se creían de su especie... crecían distinto.", gap=0.35)
    tl.marks['teeth'] = a; S(sfx_tap(2, .3, .4), a + 2.0, .4); S(stamp(), b - .5, .5)
    a, b = L('k5', 'N', "O sea: lo que parecía una sola especie podrían ser varias, viviendo en la misma zona de Sudáfrica.", gap=0.35)
    tl.marks['many'] = a; S(sfx_riser(1.4), a + .8, .3); S(chime(), b - 1.4, .4)
    a, b = L('k6', 'N', "¿Por qué? Por el clima. Hubo idas y vueltas entre épocas húmedas y secas, que separaban a los grupos... y a veces los volvían a juntar.", gap=0.35)
    tl.marks['clim'] = a; S(wind_s(2.4), a + 1.6, .4)
    a, b = L('k7', 'N', "Como dijo la Universidad Libre de Bruselas: nuestra familia no fue un tronco derecho... sino un arbusto enredado.", gap=0.4)
    tl.marks['bush'] = a; S(sfx_riser(1.6), b - 1.8, .3)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Sabías que tuvimos tantos parientes?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'desert', extra=[(0, st(cricket(dur)) * .3, 1.0)])

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

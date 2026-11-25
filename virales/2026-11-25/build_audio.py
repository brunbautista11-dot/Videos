#!/usr/bin/env python3
"""Virales 25/11/2026 — 3 shorts. p1: la era de hielo que frenamos  p2: carbono del núcleo en Kilauea  p3: la ballena de cara torcida"""
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


# ================================================================ P1 — la próxima era de hielo que frenamos
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(wind_s(1.5), 0.05, .5)
    L('h1', 'N', "La próxima era de hielo ya había empezado... y nosotros la frenamos.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('d1', 'N', "Hace veinte mil años, una capa de hielo tapaba casi todo Canadá. En algunos lugares tenía más de tres kilómetros de espesor.", gap=0.1,
             show="Hace 20.000 años, una capa de hielo tapaba casi todo Canadá. En algunos lugares tenía más de 3 kilómetros de espesor.")
    tl.marks['ice'] = a; S(ticks(1.6, 14), a + 4.2, .3)
    a, b = L('d2', 'N', "Hoy le queda un solo pedazo: el casquete Barnes, en la isla de Baffin, en el Ártico canadiense.", gap=0.35)
    tl.marks['barnes'] = a; S(wind_s(2.0), a + .5, .35)
    a, b = L('d3', 'N', "Ese hielo se está derritiendo... y dejó al descubierto plantas que estaban congeladas abajo, intactas.", gap=0.35)
    tl.marks['plants'] = a; S(chime(), b - 1.4, .35)
    a, b = L('d4', 'N', "Midieron su edad con carbono catorce. El hielo llegó a su mínimo hace unos tres mil años... y hace unos dos mil, volvió a crecer.", gap=0.35,
             show="Midieron su edad con carbono 14. El hielo llegó a su mínimo hace unos 3.000 años... y hace unos 2.000, volvió a crecer.")
    tl.marks['dating'] = a; S(ticks(1.8, 16), a + 2.0, .3); S(stamp(), b - .5, .5)
    a, b = L('d5', 'N', "Para los autores, ese fue el arranque de la próxima glaciación. Los modelos decían que faltaban miles de años.", gap=0.35)
    tl.marks['start'] = a; S(stamp(), a + 1.8, .5)
    a, b = L('d6', 'N', "Pero el calor del siglo veinte dio vuelta todo. Desde los años sesenta, el casquete pierde más hielo del que gana.", gap=0.35,
             show="Pero el calor del siglo XX dio vuelta todo. Desde los años 60, el casquete pierde más hielo del que gana.")
    tl.marks['stop'] = a; S(hum_off(), a + 1.6, .45)
    a, b = L('d7', 'N', "Y podría desaparecer en unos pocos siglos. El estudio es de la Universidad de Columbia y salió en la revista Science.", gap=0.4)
    tl.marks['pub'] = a; S(chime(), b - 1.4, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Vos qué preferís: más frío o más calor?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(wind(dur, seed=91, f=600)) * .35, 1.0)])

# ================================================================ P2 — carbono del núcleo saliendo por Kilauea
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(blast(), 0.05, .4)
    L('h1', 'N', "Un volcán de Hawái podría estar soltando un pedacito del centro de la Tierra.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('c1', 'N', "Para llegar al núcleo hay que atravesar el manto: casi tres mil kilómetros de roca.", gap=0.1,
             show="Para llegar al núcleo hay que atravesar el manto: casi 3.000 kilómetros de roca.")
    tl.marks['layers'] = a; S(whoosh_low(), a + 1.2, .5)
    a, b = L('c2', 'N', "Por eso, científicos de la Universidad de Columbia buscaron pistas en las rocas del volcán Kilauea.", gap=0.35)
    tl.marks['kilauea'] = a; S(hum_off(), a + 1.5, .35)
    a, b = L('c3', 'N', "Adentro de los cristales había gotitas de magma atrapadas, que guardaban su carbono original.", gap=0.35)
    tl.marks['drops'] = a; S(bubbles(1.6), a + 1.2, .5)
    a, b = L('c4', 'N', "Midieron qué tan pesado era ese carbono. En el manto normal, la marca da entre menos cinco y menos siete. En Kilauea dio menos uno. Rarísimo.", gap=0.35,
             show="Midieron qué tan pesado era ese carbono. En el manto normal, la marca da entre -5 y -7. En Kilauea dio -1. Rarísimo.")
    tl.marks['number'] = a; S(ticks(2.0, 16), a + 3.0, .3); S(stamp(), b - .6, .5)
    a, b = L('c5', 'N', "Su mejor explicación: ese carbono viene del núcleo, y sube con columnas de roca caliente desde lo más profundo.", gap=0.35)
    tl.marks['core'] = a; S(whoosh_low(), a + 2.0, .5)
    a, b = L('c6', 'N', "Y se parece al de unos meteoritos de más de cuatro mil quinientos millones de años. Pudo haber llegado así, cuando la Tierra se estaba formando.", gap=0.35,
             show="Y se parece al de unos meteoritos de más de 4.500 millones de años. Pudo haber llegado así, cuando la Tierra se estaba formando.")
    tl.marks['meteor'] = a; S(streak(), a + 1.4, .5)
    a, b = L('c7', 'N', "Ojo: todavía no está probado. Faltan más mediciones. El estudio salió en la revista PNAS.", gap=0.4,
             show="Ojo: todavía no está probado. Faltan más mediciones. El estudio salió en la revista PNAS.")
    tl.marks['caveat'] = a; S(chime(), b - 1.4, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Te animarías a ver un volcán de cerca?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'desert', extra=[(0, st(engine(dur, f0=38.0, seed=92)) * .15, 1.0)])

# ================================================================ P3 — la ballena con la cara más torcida
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sonar(), 0.05, .5)
    L('h1', 'N', "Esta ballena tenía la cara más torcida de todos los mamíferos... y no era un error.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('w1', 'N', "Se llama Escafokóguia huachafo. Era un cachalote enano, y vivió hace unos seis millones de años en lo que hoy es Perú.", gap=0.1,
             show="Se llama Scaphokogia huachafo. Era un cachalote enano, y vivió hace unos 6 millones de años en lo que hoy es Perú.")
    tl.marks['name'] = a; S(sonar(), a + 1.0, .3)
    a, b = L('w2', 'N', "Medía unos dos metros setenta. Su fósil apareció a mediados de los noventa, en el sur de Perú.", gap=0.35,
             show="Medía unos 2,70 metros. Su fósil apareció a mediados de los 90, en el sur de Perú.")
    tl.marks['size'] = a; S(ticks(1.4, 14), a + .8, .3)
    a, b = L('w3', 'N', "Lo raro: sus dos orificios para respirar estaban del lado izquierdo del cráneo. Los dos.", gap=0.35)
    tl.marks['nose'] = a; S(stamp(), b - .6, .5)
    a, b = L('w4', 'N', "Primero pensaron que el fósil se había deformado. Pero no tenía fracturas ni daños: el cráneo era así de verdad.", gap=0.35)
    tl.marks['real'] = a; S(chime(), b - 1.2, .35)
    a, b = L('w5', 'N', "Su hocico apuntaba treinta y un grados hacia abajo... y podía doblar la cabeza hasta cincuenta y cinco grados.", gap=0.35,
             show="Su hocico apuntaba 31 grados hacia abajo... y podía doblar la cabeza hasta 55 grados.")
    tl.marks['snout'] = a; S(whoosh_low(), a + 1.4, .5)
    a, b = L('w6', 'N', "¿Para qué? Buscaba comida en el fondo del mar, en aguas poco profundas. Y probablemente usaba ecolocalización, como un sonar.", gap=0.35)
    tl.marks['hunt'] = a; S(sonar(), a + 3.0, .35); S(sonar(), a + 4.2, .25)
    a, b = L('w7', 'N', "¿Y el nombre? En Perú, huachafo es algo llamativo o extravagante. El estudio es de la Universidad de Zúrich.", gap=0.4)
    tl.marks['word'] = a; S(chime(), b - 1.2, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Te gustaría verla nadar?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(bubbles(dur, seed=8)) * .25, 1.0), (0, st(seawaves(dur)) * .2, 1.0)])

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

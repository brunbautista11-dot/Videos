#!/usr/bin/env python3
"""Virales 27/11/2026 — 3 shorts. p1: el mensaje enviado con gravedad  p2: papas en suelo lunar simulado  p3: la era de hielo que el calentamiento frenó"""
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



def hum_lift(d): return st(lp(engine(d, f0=48.0, seed=95), 700)) * .5
def clank(): return reverb(add(tone(180, .35, .06) * .8, nb(.15, 800, 5000, .03, .8), tone(95, .5, .12) * .6), .8, .25, seed=29)

# ================================================================ P1 — el mensaje que atravesó una pared usando gravedad
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(clank(), 0.05, .5)
    L('h1', 'N', "Unos físicos mandaron un mensaje a través de una pared de ladrillo... usando la gravedad.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('g1', 'N', "Pasó en la Universidad de Queensland, en Australia. No usaron ondas de radio, ni luz. Usaron gravedad.", gap=0.1)
    tl.marks['who'] = a; S(zap(), b - 1.2, .35)
    a, b = L('g2', 'N', "Tomaron un ascensor viejo, de los años cincuenta, y movieron su contrapeso, de uno coma ocho toneladas, entre dos posiciones.", gap=0.35,
             show="Tomaron un ascensor viejo, de los años cincuenta, y movieron su contrapeso, de 1,8 toneladas, entre dos posiciones.")
    tl.marks['lift'] = a; S(hum_lift(2.4), a + 1.4, .5); S(clank(), b - .6, .5)
    a, b = L('g3', 'N', "Cada posición era un dígito: cero o uno. Como el lenguaje de una computadora.", gap=0.35)
    tl.marks['bits'] = a; S(ticks(1.6, 10), a + .6, .3)
    a, b = L('g4', 'N', "Del otro lado de la pared, en un baño, un aparato llamado gravímetro medía cambios minúsculos de gravedad. Y descifró la palabra: Gravity.", gap=0.35)
    tl.marks['wall'] = a; S(beep_tx(), b - 1.4, .4); S(stamp(), b - .4, .5)
    a, b = L('g5', 'N', "¿Lo bueno? Un material común no puede bloquear esa señal.", gap=0.35)
    tl.marks['why'] = a; S(stamp(), b - .5, .45)
    a, b = L('g6', 'N', "¿Lo malo? Es lentísimo: un bit por minuto. Mandar una sola palabra llevó una hora.", gap=0.35)
    tl.marks['slow'] = a; S(ticks(2.0, 6), a + 1.6, .3)
    a, b = L('g7', 'N', "Con sensores cuánticos, en teoría, podría llegar a unos quinientos metros. El estudio salió en la revista Science Advances.", gap=0.4,
             show="Con sensores cuánticos, en teoría, podría llegar a unos 500 metros. El estudio salió en la revista Science Advances.")
    tl.marks['pub'] = a; S(chime(), b - 1.4, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Mandarías un mensaje con gravedad?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'space', extra=[(0, st(engine(dur, f0=40.0, seed=93)) * .1, 1.0)])

# ================================================================ P2 — papas en suelo lunar simulado
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(streak(), 0.05, .5)
    L('h1', 'N', "Plantaron papas en una imitación de suelo lunar... y crecieron como en la Tierra.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('r1', 'N', "Lo hizo la Universidad Estatal de Oregón, en Estados Unidos. Probaron cinco simulantes: polvos que imitan el suelo de la Luna.", gap=0.1)
    tl.marks['who'] = a; S(chime(), b - 1.6, .35)
    a, b = L('r2', 'N', "Solo, ese polvo no alcanza: las plantas quedaban raquíticas, con raíces chiquitas. El truco fue mezclarlo con humus de lombriz.", gap=0.35)
    tl.marks['comp'] = a; S(squeak(), a + 3.4, .35); S(stamp(), b - .5, .45)
    a, b = L('r3', 'N', "Con un cinco a quince por ciento de humus, crecían a medias. Con un treinta por ciento... crecieron igual que en tierra de verdad.", gap=0.35,
             show="Con un 5 a 15 % de humus, crecían a medias. Con un 30 %... crecieron igual que en tierra de verdad.")
    tl.marks['pct'] = a; S(ticks(1.6, 12), a + 3.2, .3); S(stamp(), b - .5, .5)
    a, b = L('r4', 'N', "¿Y se pueden comer? Midieron las toxinas naturales de la papa, y no subieron de forma significativa.", gap=0.35)
    tl.marks['safe'] = a; S(chime(), b - .6, .4)
    a, b = L('r5', 'N', "La idea es alimentar a los astronautas del programa Artemisa, que planea una base cerca del polo sur de la Luna.", gap=0.35)
    tl.marks['base'] = a; S(whoosh_low(), a + 1.2, .45)
    a, b = L('r6', 'N', "Todavía falta resolver el polvo finísimo y algunos metales pesados.", gap=0.35)
    tl.marks['dust'] = a; S(wind(2.0, seed=97, f=900), a + .5, .3)
    a, b = L('r7', 'N', "El estudio salió en la revista npj Microgravity, y ya preparan otro con diez variedades de papa.", gap=0.4,
             show="El estudio salió en la revista npj Microgravity, y ya preparan otro con 10 variedades de papa.")
    tl.marks['pub'] = a; S(chime(), b - 1.4, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Probarías una papa de la Luna?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'desert', extra=[(0, st(engine(dur, f0=34.0, seed=96)) * .08, 1.0)])

# ================================================================ P3 — la próxima era de hielo que el calentamiento frenó
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(wind(1.5, seed=81, f=600), 0.05, .5)
    L('h1', 'N', "La próxima era de hielo... quizás ya había empezado.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('i1', 'N', "Lo dice un estudio en la revista Science, de la Universidad de Columbia, en Estados Unidos.", gap=0.1)
    tl.marks['who'] = a; S(chime(), b - 1.6, .35)
    a, b = L('i2', 'N', "Hace unos veinte mil años, una capa de hielo gigante, la Laurentida, cubría gran parte de Canadá. En partes tenía más de tres kilómetros de espesor.", gap=0.35,
             show="Hace unos 20.000 años, una capa de hielo gigante, la Laurentida, cubría gran parte de Canadá. En partes tenía más de 3 km de espesor.")
    tl.marks['lau'] = a; S(whoosh_low(), a + 2.0, .45); S(stamp(), b - .5, .45)
    a, b = L('i3', 'N', "Hoy queda un pedazo: el casquete Barnes, en la isla de Baffin, en el Ártico canadiense. Y se está derritiendo.", gap=0.35)
    tl.marks['barnes'] = a; S(bubbles(1.2), b - 1.4, .3)
    a, b = L('i4', 'N', "Al retroceder, deja a la vista plantas antiguas que estaban congeladas. Las fecharon con carbono catorce.", gap=0.35,
             show="Al retroceder, deja a la vista plantas antiguas que estaban congeladas. Las fecharon con carbono 14.")
    tl.marks['plants'] = a; S(ticks(1.6, 12), b - 2.0, .3)
    a, b = L('i5', 'N', "Y encontraron algo: hace unos tres mil años, el hielo llegó a su mínimo. Pero hace unos dos mil años... empezó a crecer otra vez.", gap=0.35,
             show="Y encontraron algo: hace unos 3.000 años, el hielo llegó a su mínimo. Pero hace unos 2.000 años... empezó a crecer otra vez.")
    tl.marks['grow'] = a; S(stamp(), b - .5, .5)
    a, b = L('i6', 'N', "Para los autores, pudo ser el comienzo de la próxima glaciación. Pero en los años sesenta, el calentamiento lo dio vuelta.", gap=0.35)
    tl.marks['stop'] = a; S(zap(), b - .8, .4)
    a, b = L('i7', 'N', "Hoy el casquete pierde más hielo del que gana... y podría desaparecer en los próximos siglos.", gap=0.4)
    tl.marks['pub'] = a; S(bubbles(1.6, seed=6), a + 1.0, .3)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Vos preferís el frío o el calor?", gap=0.15)
    W(1.6); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(wind(dur, seed=94, f=500)) * .3, 1.0)])

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

#!/usr/bin/env python3
"""Virales 20/11/2026 — 3 shorts. p1: supernova SN 2026ahvu  p2: la piedra del fondo del mar con 245 bichitos  p3: el roedor gigante de 30 kilos"""
import sys
from audio_core import *

VO.update({
 'N':  ('es-UY-MateoNeural', '+16%', '+0Hz', 'dry', 1.0, 'n'),
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

# ================================================================ P1 — supernova SN 2026ahvu
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(blast(), 0.05, .7)
    L('h1', 'N', "Una estrella explotó... y esta semana la podés ver con un telescopio chico.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('d1', 'N', "Tiene nombre de contraseña: ese ene, dos mil veintiséis, a, hache, ve, u.", gap=0.1,
             show="Tiene nombre de contraseña: SN 2026ahvu.")
    tl.marks['name'] = a; S(sfx_tap(3, .2, .4), a + 2.6, .4)
    a, b = L('d2', 'N', "Explotó en la galaxia ene ge ce mil cuatrocientos treinta y tres, a unos cincuenta millones de años luz.", gap=0.35,
             show="Explotó en la galaxia NGC 1433, a unos 50 millones de años luz.")
    tl.marks['gal'] = a; S(sfx_whoosh(), a - .3, .5); S(ticks(2.0, 14), a + 3.6, .3)
    a, b = L('d3', 'N', "O sea: esa luz salió hacia acá cuando todavía no existía ningún ser humano.", gap=0.35)
    tl.marks['old'] = a; S(stamp(), b - .5, .5)
    a, b = L('d4', 'N', "La descubrió el sistema ATLAS el dos de noviembre, cuando recién empezaba a brillar.", gap=0.35,
             show="La descubrió el sistema ATLAS el 2 de noviembre, cuando recién empezaba a brillar.")
    tl.marks['atlas'] = a; S(sfx_beep(1300, .25, .3), a + .4, .4); S(sfx_beep(1300, .25, .3), a + .8, .4)
    a, b = L('d5', 'N', "Es de tipo uno a: una enana blanca le roba materia a su estrella compañera, hasta que no aguanta más... y estalla.", gap=0.35,
             show="Es de tipo Ia: una enana blanca le roba materia a su estrella compañera, hasta que no aguanta más... y estalla.")
    tl.marks['ia'] = a; S(sfx_riser(2.2), b - 2.4, .35); S(blast(), b - .3, .6)
    a, b = L('d6', 'N', "En pocos días pasó de magnitud diecisiete a trece y media, y su pico se espera entre el dieciocho y el veintitrés de noviembre.", gap=0.4,
             show="En pocos días pasó de magnitud 17 a 13,5, y su pico se espera entre el 18 y el 23 de noviembre.")
    tl.marks['mag'] = a; S(ticks(2.4, 16), a + 1.6, .3); S(chime(), b - 1.2, .4)
    a, b = L('d7', 'N', "Además, estas explosiones sirven para medir distancias, y entender cuánto se expande el universo.", gap=0.4)
    tl.marks['ruler'] = a; S(sfx_whoosh(), a - .3, .5); S(stamp(), b - .6, .5)
    a, b = L('d8', 'N', "Está en la constelación del Reloj, en el cielo del sur. Desde Uruguay, con un telescopio chico, tenés chance.", gap=0.4)
    tl.marks['where'] = a; S(chime(), b - 1.0, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿La saldrías a buscar?", gap=0.15)
    W(1.9); dur = tl.t
    bed(tl, dur, 'space')

# ================================================================ P2 — la piedra con 245 bichitos
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sonar(), 0.0, .5); S(bubbles(2.5), 0.2, .4)
    L('h1', 'N', "Abrieron esta piedra del fondo del mar... y adentro había doscientos cuarenta y cinco bichitos.", gap=0.2,
      show="Abrieron esta piedra del fondo del mar... y adentro había 245 bichitos.")
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('f1', 'N', "No es una piedra cualquiera: es un nódulo de hierro y manganeso, del tamaño de un puño.", gap=0.1)
    tl.marks['nod'] = a; S(stamp(), a + 3.2, .45)
    a, b = L('f2', 'N', "Están en el océano Pacífico, entre cuatro mil y seis mil metros de profundidad.", gap=0.35,
             show="Están en el océano Pacífico, entre 4.000 y 6.000 metros de profundidad.")
    tl.marks['deep'] = a; S(sonar(), a + .2, .4); S(ticks(2.0, 14), a + 2.4, .3)
    a, b = L('f3', 'N', "Y crecen lentísimo: a veces, apenas unos milímetros en un millón de años.", gap=0.35)
    tl.marks['slow'] = a; S(sfx_riser(1.6), a + .6, .3); S(stamp(), b - .5, .5)
    a, b = L('f4', 'N', "Científicos del centro MARUM, en Alemania, abrieron doscientos cuarenta y cuatro nódulos y contaron más de cuatro mil cien seres diminutos.", gap=0.35,
             show="Científicos del centro MARUM, en Alemania, abrieron 244 nódulos y contaron más de 4.100 seres diminutos.")
    tl.marks['count'] = a; S(sfx_whoosh(), a - .3, .5); S(ticks(2.6, 16), a + 3.6, .3)
    a, b = L('f5', 'N', "Sobre todo gusanitos y crustáceos más chicos que un milímetro. En promedio, diecisiete por piedra. ¡Y el récord: doscientos cuarenta y cinco!", gap=0.35,
             show="Sobre todo gusanitos y crustáceos más chicos que un milímetro. En promedio, 17 por piedra. ¡Y el récord: 245!")
    tl.marks['bugs'] = a; S(bubbles(2.0, 7), a + .4, .4); S(boom(), b - 1.0, .5); S(chime(), b - .9, .4)
    a, b = L('f6', 'N', "Y lo raro: son distintos a los bichitos del barro de alrededor.", gap=0.35)
    tl.marks['diff'] = a; S(sfx_tap(2, .3, .5), b - 1.0, .4)
    a, b = L('f7', 'N', "El problema: tienen níquel, cobalto y cobre, y hay quienes los quieren minar. Si se los llevan, ese hogar no vuelve en tiempos humanos.", gap=0.4)
    tl.marks['mine'] = a; S(sfx_riser(1.8), a + 1.0, .3); S(stamp(), b - .6, .5)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Vos qué harías: dejarlos o minarlos?", gap=0.15)
    W(2.4); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(bubbles(dur, 9)) * .25, 1.0)])

# ================================================================ P3 — el roedor gigante
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(squeak(), 0.1, .6)
    L('h1', 'N', "Imaginate un ratón... del tamaño de un perro grande.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('g1', 'N', "Existió de verdad, hace unos treinta y cuatro millones de años, en lo que hoy es el sur de Tailandia.", gap=0.1,
             show="Existió de verdad, hace unos 34 millones de años, en lo que hoy es el sur de Tailandia.")
    tl.marks['when'] = a; S(ticks(2.2, 14), a + 1.6, .3)
    a, b = L('g2', 'N', "Lo llamaron Yákamis sirindórnae. Yak quiere decir gigante en tailandés, y mis, ratón en griego.", gap=0.35,
             show="Lo llamaron Yakamys sirindhornae. \"Yak\" quiere decir gigante en tailandés, y \"mys\", ratón en griego.")
    tl.marks['name'] = a; S(sfx_tap(2, .3, .4), a + 1.0, .4)
    a, b = L('g3', 'N', "¿Y sabés qué encontraron? Solo dos dientes. En una mina de Krabi.", gap=0.35)
    tl.marks['teeth'] = a; S(stamp(), a + 2.6, .5); S(stamp(), a + 3.0, .5)
    a, b = L('g4', 'N', "Pero eran tan grandes que, con siete métodos distintos, calcularon que pesaba unos treinta kilos.", gap=0.35,
             show="Pero eran tan grandes que, con 7 métodos distintos, calcularon que pesaba unos 30 kilos.")
    tl.marks['kg'] = a; S(ticks(2.0, 16), b - 2.4, .35); S(boom(), b - .4, .5)
    a, b = L('g5', 'N', "Casi el doble que los otros roedores conocidos de esa época.", gap=0.35)
    tl.marks['double'] = a; S(sfx_whoosh(), a - .2, .5); S(squeak(), b - .5, .5)
    a, b = L('g6', 'N', "Los científicos aclaran que es un cálculo aproximado. Pero cambia la historia: se creía que los roedores gigantes aparecieron más tarde, y sobre todo en Sudamérica.", gap=0.4)
    tl.marks['hist'] = a; S(sfx_riser(1.6), b - 2.6, .3); S(stamp(), b - .7, .5)
    a, b = L('g7', 'N', "El estudio salió este mes en la revista Scientific Reports, con científicos de Tailandia, Canadá y Francia.", gap=0.4)
    tl.marks['paper'] = a; S(chime(), b - 1.0, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Lo tendrías de mascota?", gap=0.15)
    W(2.2); dur = tl.t
    bed(tl, dur, 'desert')

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

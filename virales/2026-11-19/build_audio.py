#!/usr/bin/env python3
"""Virales 19/11/2026 — 3 shorts. p1: el falso apagón mundial del 17/11  p2: lluvia de estrellas Leónidas  p3: cuervos que deciden el doble de rápido"""
import sys
from audio_core import *

VO.update({
 'N':  ('es-UY-MateoNeural', '+12%', '+0Hz', 'dry', 1.0, 'n'),
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

# ================================================================ P1 — el falso apagón mundial
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(hum_off(), 0.0, .7)
    L('h1', 'N', "El diecisiete de noviembre el mundo entero se quedaba sin luz. O eso te dijeron.", gap=0.2,
      show="El 17 de noviembre el mundo entero se quedaba sin luz. O eso te dijeron.")
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('d1', 'N', "En redes se hizo viral un apagón mundial de setenta y dos horas: sin luz, sin internet y sin bancos.", gap=0.1,
             show="En redes se hizo viral un apagón mundial de 72 horas: sin luz, sin internet y sin bancos.")
    tl.marks['rumor'] = a; S(ticks(2.2, 14), a + 1.6, .35); S(zap(), b - 1.4, .5)
    a, b = L('d2', 'N', "Unos decían treinta y tres países. ¡Otros, noventa días a oscuras!", gap=0.35,
             show="Unos decían 33 países. ¡Otros, 90 días a oscuras!")
    tl.marks['more'] = a; S(sfx_whoosh(), a - .3, .5); S(stamp(), b - .8, .5)
    a, b = L('d3', 'N', "¿De dónde salió todo esto? De mezclar tres cosas reales.", gap=0.4)
    tl.marks['why'] = a; S(sfx_riser(1.4), a + .2, .35); S(stamp(), b - .3, .5)
    a, b = L('d4', 'N', "Uno: una prueba del sistema de alertas de Estados Unidos, programada para ese día, solo por radio y televisión.", gap=0.35)
    tl.marks['eas'] = a; S(sfx_beep(1050, .5, .3), a + .3, .4)
    a, b = L('d5', 'N', "Dos: la Comisión Europea recomendó tener un kit para aguantar setenta y dos horas en cualquier emergencia.", gap=0.35,
             show="Dos: la Comisión Europea recomendó tener un kit para aguantar 72 horas en cualquier emergencia.")
    tl.marks['kit'] = a; S(sfx_tap(2, .3, .5), a + .3, .4)
    a, b = L('d6', 'N', "Y tres: una escena de Los Simpsons con un apagón y la fecha diecisiete de noviembre. Pero sin año.", gap=0.35,
             show="Y tres: una escena de Los Simpsons con un apagón y la fecha 17 de noviembre. Pero sin año.")
    tl.marks['tv'] = a; S(static(1.0), a + .3, .25); S(stamp(), b - .6, .5)
    a, b = L('d7', 'N', "Y especialistas de la NOAA, que vigila las tormentas solares, aclararon que no había pronósticos de un colapso global.", gap=0.4)
    tl.marks['noaa'] = a; S(sfx_whoosh(), a - .3, .5)
    a, b = L('d8', 'N', "Llegó el diecisiete... y acá seguimos. Con luz.", gap=0.4, show="Llegó el 17... y acá seguimos. Con luz.")
    tl.marks['on'] = a; S(boom(), b - 1.0, .6); S(chime(), b - .9, .4)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Vos te lo creíste?", gap=0.15)
    W(1.9); dur = tl.t
    bed(tl, dur, 'space')

# ================================================================ P2 — Leónidas
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(crickets(3.0), 0.0, .4); S(streak(), .3, .6)
    L('h1', 'N', "Esta semana caen estrellas fugaces a setenta y un kilómetros por segundo.", gap=0.2,
      show="Esta semana caen estrellas fugaces a 71 kilómetros por segundo.")
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('e1', 'N', "Son las Leónidas. Su pico fue la noche del diecisiete al dieciocho, y siguen activas hasta el treinta de noviembre.", gap=0.1,
             show="Son las Leónidas. Su pico fue la noche del 17 al 18, y siguen activas hasta el 30 de noviembre.")
    tl.marks['when'] = a; S(chime(), a + .4, .35)
    a, b = L('e2', 'N', "Y no son estrellas: son granitos de polvo que dejó un cometa, el Témpel Tátel, que vuelve cerca del Sol cada treinta y tres años.", gap=0.35,
             show="Y no son estrellas: son granitos de polvo que dejó un cometa, el Tempel-Tuttle, que vuelve cerca del Sol cada 33 años.")
    tl.marks['comet'] = a; S(sfx_whoosh(), a - .3, .5); S(streak(), a + 2.2, .5)
    a, b = L('e3', 'N', "La Tierra cruza ese polvo, y cada granito entra al aire a unos setenta y un kilómetros por segundo. Se calienta tanto que brilla.", gap=0.35,
             show="La Tierra cruza ese polvo, y cada granito entra al aire a unos 71 kilómetros por segundo. Se calienta tanto que brilla.")
    tl.marks['speed'] = a; S(ticks(2.4, 16), a + 2.2, .35); S(streak(), b - 1.4, .6)
    a, b = L('e4', 'N', "Este año se esperan unas quince por hora, con el cielo bien oscuro.", gap=0.35,
             show="Este año se esperan unas 15 por hora, con el cielo bien oscuro.")
    tl.marks['rate'] = a; S(sfx_tap(1, .3, .5), a + 1.4, .4)
    a, b = L('e5', 'N', "Pero en mil novecientos sesenta y seis, hace justo sesenta años, cayeron de cuarenta a cincuenta por segundo, durante unos quince minutos.", gap=0.4,
             show="Pero en 1966, hace justo 60 años, cayeron de 40 a 50 por segundo, durante unos 15 minutos.")
    tl.marks['storm'] = a; S(sfx_riser(2.0), a + 1.0, .35); S(boom(), a + 4.5, .5)
    for k in range(10): S(streak(), a + 4.6 + k * .3, .25)
    a, b = L('e6', 'N', "Y hay científicos que calculan que en dos mil treinta y tres podría haber otro gran espectáculo.", gap=0.4,
             show="Y hay científicos que calculan que en 2033 podría haber otro gran espectáculo.")
    tl.marks['future'] = a; S(chime(), b - 1.0, .4)
    a, b = L('e7', 'N', "¿Querés verlas? Desde Uruguay, mirá hacia el este, una o dos horas antes de que amanezca.", gap=0.4)
    tl.marks['tip'] = a; S(streak(), b - 1.0, .6)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Alguna vez viste una estrella fugaz?", gap=0.15)
    W(1.9); dur = tl.t
    bed(tl, dur, 'ocean', extra=[(0, st(crickets(dur, seed=87)) * .18, 1.0)])

# ================================================================ P3 — cuervos ultrarrápidos
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(caw(), 0.1, .6)
    L('h1', 'N', "Este pájaro toma decisiones el doble de rápido que vos.", gap=0.2)
    t = M('title', 0.05); S(boom(), t, .8); S(sfx_whoosh(), t - .25, .6); W(1.0)
    a, b = L('f1', 'N', "Científicos de la Universidad de Tubinga, en Alemania, pusieron a prueba a dos cuervos con una pantalla táctil.", gap=0.1)
    tl.marks['lab'] = a; S(sfx_click(), a + 3.0, .5)
    a, b = L('f2', 'N', "En la pantalla se movían un montón de puntitos, y el cuervo tenía que picotear el lado hacia donde iba la mayoría.", gap=0.35)
    tl.marks['task'] = a; S(sfx_whoosh(), a - .3, .5); S(sfx_tap(2, .25, .5), b - 1.0, .5)
    a, b = L('f3', 'N', "Tardaron, en promedio, doscientos treinta y cinco milisegundos. Más o menos la mitad que los humanos y los monos en la misma prueba.", gap=0.35,
             show="Tardaron, en promedio, 235 milisegundos. Más o menos la mitad que los humanos y los monos en la misma prueba.")
    tl.marks['time'] = a; S(ticks(2.0, 18), a + 1.0, .35); S(stamp(), a + 4.2, .5)
    a, b = L('f4', 'N', "Y cuando los puntitos se veían claros, acertaban casi el cien por ciento de las veces.", gap=0.35,
             show="Y cuando los puntitos se veían claros, acertaban casi el 100% de las veces.")
    tl.marks['acc'] = a; S(chime(), b - .8, .4)
    a, b = L('f5', 'N', "Sus neuronas ya distinguían la dirección a los setenta milisegundos.", gap=0.35,
             show="Sus neuronas ya distinguían la dirección a los 70 milisegundos.")
    tl.marks['neur'] = a; S(zap(), a + 2.0, .4)
    a, b = L('f6', 'N', "¿Cómo lo hacen tan rápido? Todavía es un misterio. El estudio salió este mes en la revista Science.", gap=0.4)
    tl.marks['myst'] = a; S(sfx_riser(1.4), a, .3); S(caw(), b - .4, .5)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - .2, .6)
    L('q', 'NQ', "¿Quién ganaría: vos o el cuervo?", gap=0.15)
    W(2.6); dur = tl.t
    bed(tl, dur, 'desert')

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

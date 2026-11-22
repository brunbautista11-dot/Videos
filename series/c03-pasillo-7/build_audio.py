#!/usr/bin/env python3
"""PASILLO 7 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':   ('es-UY-MateoNeural',  '-4%',  '-3Hz',  'inner',   1.0,  'in'),
 'YO':     ('es-UY-MateoNeural',  '+3%',  '+2Hz',  'room',    0.95, 'yo'),
 'YOSH':   ('es-UY-MateoNeural',  '+8%',  '+6Hz',  'room',    1.05, 'yo'),
 'RUBEN':  ('es-PY-MarioNeural',  '-6%',  '-5Hz',  'room',    0.95, 'rub'),
 'RUBENF': ('es-PY-MarioNeural',  '-10%', '-6Hz',  'store',   0.95, 'rub'),
 'MARTA':  ('es-AR-ElenaNeural',  '-14%', '-9Hz',  'close',   1.0,  'cosa'),
 'MARTAF': ('es-AR-ElenaNeural',  '-14%', '-9Hz',  'far',     1.05, 'cosa'),
 'MARTAD': ('es-AR-ElenaNeural',  '-12%', '-8Hz',  'door',    1.0,  'cosa'),
})

def fluo(dur, seed=71):
    """zumbido de tubos fluorescentes + heladeras"""
    return roomtone(dur, 50, seed) * 1.2 + st(bp(noise(dur), 2500, 7000) * 0.005) + st(lp(noise(dur), 120) * 0.25)
def cart(d, seed=72):
    """rueditas de carrito de supermercado"""
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    y = bp(r.standard_normal(len(t)), 700, 3000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 7.3 * t) > 0.6)) * 0.25
    sq = np.sin(2 * np.pi * np.cumsum(1900 + 200 * np.sin(2 * np.pi * 1.1 * t)) / SR) * (np.sin(2 * np.pi * 0.9 * t) > 0.85) * 0.05
    return reverb(fade(y + sq, 0.2, 0.3), 1.0, 0.3, seed=73)
def frost(d, seed=74):
    """compresor de la cámara de frío + viento helado"""
    return engine(d, 50.0, seed, 0.4) * 0.35 + wind(d, seed + 1, 900) * 0.5
def crate():
    return add(sfx_clunk(1.0)[:, 0], nb(0.5, 200, 2500, 0.08, 0.6), tone(95, 0.3, 0.05) * 0.6)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(0.8), 0.0, 0.4)
    L('h1', 'YOIN', "A las tres de la mañana, la cámara del pasillo siete mostró a una mujer. El súper cerraba a las diez.", gap=0.25)
    M('title', -2.6)
    fb = M('fb', 0.4, adv=True); S(sfx_whoosh(0.9), fb - 0.3, 0.5)
    L('h2', 'YOIN', "Yo reponía de noche. Rubén, el de seguridad, me había avisado el primer día.", gap=0.3)
    L('r1', 'RUBEN', "Si ves algo raro en las cámaras, no vayas. Me llamás a mí.", gap=0.3)
    bk = M('back', 0.5, adv=True); S(sfx_whoosh(0.7), bk - 0.3, 0.5)
    L('h3', 'YOIN', "Pero Rubén estaba en el depósito. Así que fui yo.", gap=0.3)
    ai = M('aisle', 0.4, adv=True); S(cart(9.0), ai, 0.7)
    L('h4', 'YOIN', "Pasillo siete. Fideos, arroz, latas. Nadie.", gap=0.5)
    bz = M('buzz', 0.6, adv=True); S(sfx_buzz(1.2), bz, 0.8)
    L('h5', 'YOIN', "Me vibró el celular. La aplicación de las cámaras.", gap=0.2)
    ph = M('phone', 0.3, adv=True); S(sfx_riser(2.6), ph, 0.4)
    L('h6', 'YOIN', "En la pantalla estaba yo. Y atrás mío, pegada a mi espalda... ella.", gap=0.4)
    W(0.4)
    L('m1', 'MARTA', "Este pasillo es mío.", gap=0.1)
    sg = M('sting', 0.35, adv=True); S(sfx_sting(), sg, 0.95); S(sfx_flicker(1.2), sg, 0.5)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    amb = fluo(dur)
    mz = muzak(dur, 51) * envelope(dur, [(0, 0), (mk['fb'], 0), (mk['fb'] + 0.3, 0.6), (mk['back'], 0.6), (mk['back'] + 0.2, 0), (dur, 0)])
    dr = drone(dur, 34.6, 360, 34)
    drg = envelope(dur, [(0, 0.6), (mk['fb'], 0.0), (mk['back'], 0.0), (mk['back'] + 0.6, 0.4), (mk['buzz'], 0.6), (mk['phone'], 0.9), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (261.6, 277.2, 392.0), 45)
    sgg = envelope(dur, [(0, 0), (mk['buzz'], 0), (mk['phone'] + 1, 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['aisle'], 70, 3.0)
    beds = [(0, amb, 1.0), (0, mz, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['aisle'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_steps(3.0, 5.5), 0.0, 0.8)
    L('h1', 'YOIN', "No me di vuelta. Corrí hasta la oficina sin mirar atrás.", gap=0.2)
    M('title', -1.6)
    of = M('office', 0.2, adv=True); S(sfx_slam(), of, 0.7)
    L('r1', 'RUBEN', "¿Qué te pasa, Martín? Estás blanco.", gap=0.3)
    L('y1', 'YO', "Hay una mujer en el siete. Con uniforme del súper.", gap=0.3)
    L('r2', 'RUBEN', "¿Uniforme verde? ¿De los viejos?", gap=0.5)
    L('r3', 'RUBEN', "Es Marta. Era repositora acá cuando yo empecé.", gap=0.4)
    L('h2', 'YOIN', "Una noche, hace treinta años, Marta se quedó encerrada en la cámara de frío. Nunca más la encontraron.", gap=0.4)
    mn = M('monitors', 0.5, adv=True); S(sfx_flicker(1.4), mn, 0.6); S(static(0.8), mn, 0.4)
    L('h3', 'YOIN', "Y en todos los monitores apareció lo mismo. La puerta de la cámara de frío. Abierta.", gap=0.3)
    W(0.4)
    L('m1', 'MARTAD', "Martín... se trabó la puerta. Ayudame.", gap=0.2)
    L('r4', 'RUBEN', "Treinta años... y nunca había dicho un nombre.", gap=0.5)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.9); S(sfx_slam(), sg, 0.5)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    amb = fluo(dur, 75)
    dr = drone(dur, 32.7, 340, 35)
    drg = envelope(dur, [(0, 0.8), (mk['office'], 0.4), (mk['monitors'], 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 46)
    sgg = envelope(dur, [(0, 0.3), (mk['office'], 0.0), (mk['monitors'], 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(dur, 86, 2.0)
    beds = [(0, amb, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, hb, 0.5), (mk['monitors'], frost(dur - mk['monitors']), 0.3)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.05, 0.5); tl.marks['title'] = 1.4
    L('h1', 'YOIN', "Fui. Rubén vino atrás mío, con la linterna.", gap=0.2)
    dw = M('door', 0.3, adv=True); S(sfx_creak(1.6), dw, 0.6)
    L('h2', 'YOIN', "La puerta de la cámara de frío estaba entreabierta. Adentro, la escarcha brillaba.", gap=0.3)
    L('m1', 'MARTAF', "No la dejes cerrar. Por favor.", gap=0.4)
    cr = M('crate', 0.4, adv=True); S(crate(), cr + 2.2, 0.9)
    L('h3', 'YOIN', "Agarré un cajón de leche y lo trabé contra la puerta. Bien trabado.", gap=0.0)
    L('m2', 'MARTAF', "Gracias, Martín. Ya me puedo ir.", gap=0.6)
    sx = M('six', 0.5, adv=True); S(sfx_ding(1046.5, 2, 0.35, 0.35), sx, 0.5); S(sfx_hiss(1.0), sx + 0.6, 0.4)
    L('h4', 'YOIN', "A las seis se abrieron las puertas de la entrada. La cámara la mostró saliendo. Despacito. Sin mirar atrás.", gap=0.3)
    L('r1', 'RUBEN', "Treinta años... y nunca la vi irse.", gap=0.5)
    mo = M('morning', 0.5, adv=True); S(sfx_whoosh(0.8), mo - 0.2, 0.5)
    L('h5', 'YOIN', "A la mañana volvimos a la cámara de frío.", gap=0.2)
    L('r2', 'RUBENF', "Martín... esta cámara está clausurada desde el noventa y cuatro. No tiene ni luz.", gap=0.3)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(1.0), sg, 0.9)
    L('h6', 'YOIN', "Pero el cajón de leche estaba ahí. Y en el polvo del piso había pisadas. Todas salían.", gap=0.2)
    ec = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos la hubieras ayudado?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    amb = fluo(dur, 76) * envelope(dur, [(0, 1), (mk['morning'], 1), (mk['morning'] + 0.3, 0.3), (dur, 0.3)])
    fr = frost(dur, 77) * envelope(dur, [(0, 0.3), (mk['door'], 1.0), (mk['six'], 0.6), (mk['six'] + 0.5, 0), (dur, 0)])
    dr = drone(dur, 36.7, 340, 36)
    drg = envelope(dur, [(0, 0.8), (mk['door'], 1.0), (mk['six'], 0.3), (mk['morning'], 0.3), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 47)
    sgg = envelope(dur, [(0, 0.3), (mk['crate'], 0.6), (mk['six'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 48) * envelope(dur, [(0, 0), (mk['six'], 0), (mk['six'] + 1, 0.5), (mk['morning'], 0.3), (mk['morning'] + 0.5, 0)])
    beds = [(0, amb, 1.0), (0, fr, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['six'], 80, 1.5), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

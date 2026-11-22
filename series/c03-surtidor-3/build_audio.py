#!/usr/bin/env python3
"""SURTIDOR 3 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':   ('es-AR-TomasNeural',  '-4%',  '-3Hz',  'inner',   1.0,  'in'),
 'YO':     ('es-AR-TomasNeural',  '+2%',  '+2Hz',  'store',   0.95, 'yo'),
 'YOSH':   ('es-AR-TomasNeural',  '-2%',  '+0Hz',  'store',   0.95, 'yo'),
 'NESTOR': ('es-UY-MateoNeural',  '-6%',  '-6Hz',  'room',    0.95, 'nes'),
 'NESTORT':('es-UY-MateoNeural',  '-2%',  '-4Hz',  'radio',   0.95, 'tel'),
 'CHOFER': ('es-PY-MarioNeural',  '-16%', '-12Hz', 'door',    1.05, 'cosa'),
 'JULIO':  ('es-AR-TomasNeural',  '+4%',  '+12Hz', 'whisper', 1.0,  'julio'),
})

def night_road(dur, seed=81):
    return wind(dur, seed, 420) * 1.0 + crickets(dur, seed + 1) * 1.4 + roomtone(dur, 50, seed + 2) * 0.4
def pump(d, seed=83):
    t = np.arange(int(d * SR)) / SR
    hum = engine(d, 58.0, seed, 0.25) * 0.35
    ticks = np.zeros(len(t)); rate = 4 + 18 * np.minimum(1, t / 3.0)
    ph = np.cumsum(rate) / SR; idx = np.where(np.diff(np.floor(ph)) > 0)[0]
    k = tone(2400, 0.02, 0.004) * 0.25
    for i in idx:
        if i + len(k) < len(ticks): ticks[i:i + len(k)] += k
    return fade(hum + st(ticks), 0.1, 0.3)
def truck(d=5.0, seed=84):
    t = np.arange(int(d * SR)) / SR; g = np.exp(-((t - d / 2) / (d / 5)) ** 2)
    y = engine(d, 38.0, seed, 1.2) * g[:, None] * 1.2 + st(lp(noise(d), 600) * g * 0.6)
    pan = np.clip(t / d, 0, 1); y[:, 0] *= 1.3 - pan; y[:, 1] *= 0.3 + pan
    return y
def phone_ring(d=2.4):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * 0.18 * (((t % 1.2) < 0.8)).astype(float) * (np.sin(2 * np.pi * 20 * t) > 0)
    return reverb(lp(y, 3000), 0.5, 0.2, seed=91)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(0.8), 0.0, 0.4)
    L('h1', 'YOIN', "A las tres y treinta y tres, un auto paró en el surtidor tres. Con las luces apagadas.", gap=0.25)
    M('title', -2.0)
    fb = M('fb', 0.4, adv=True); S(sfx_whoosh(0.9), fb - 0.3, 0.5)
    L('h2', 'YOIN', "Yo hacía la noche en la estación de servicio de la ruta. Néstor, el encargado, me había dicho:", gap=0.3)
    L('n1', 'NESTOR', "Si para un auto viejo en el tres, atendelo rápido. Y no le des charla.", gap=0.3)
    bk = M('back', 0.5, adv=True); S(sfx_whoosh(0.7), bk - 0.3, 0.5)
    L('h3', 'YOIN', "Salí a atenderlo. Los vidrios estaban empañados. No se veía nada adentro.", gap=0.3)
    L('c1', 'CHOFER', "Llenámelo, pibe.", gap=0.4)
    L('h4', 'YOIN', "La ventanilla bajó apenas. Nunca le vi la cara.", gap=0.3)
    pm = M('pump', 0.5, adv=True); S(sfx_clunk(0.8), pm, 0.6)
    L('h5', 'YOIN', "Puse la manguera. Diez litros. Cuarenta. Cien.", gap=0.6)
    L('h6', 'YOIN', "Quinientos litros. Y el tanque no se llenaba.", gap=0.6)
    L('c2', 'CHOFER', "Tranquilo. Todavía falta.", gap=0.5)
    sg = M('sting', 0.35, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    amb = night_road(dur)
    idle = engine(dur - mk['back'], 40.0, 85, 0.5) * 0.25
    pp = pump(mk['endcard'] - mk['pump'])
    dr = drone(dur, 34.6, 360, 40)
    drg = envelope(dur, [(0, 0.6), (mk['fb'], 0.0), (mk['back'], 0.0), (mk['back'] + 0.6, 0.5), (mk['pump'], 0.7), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 54)
    sgg = envelope(dur, [(0, 0), (mk['pump'], 0), (mk['pump'] + 4, 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['back'], 70, 3.0)
    beds = [(0, amb, 1.0), (mk['back'], idle, 1.0), (mk['pump'], pp, 0.7), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['back'], hb, 0.6), (mk['fb'], truck(5.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_clunk(1.0), 0.15, 0.8)
    L('h1', 'YOIN', "Corté el surtidor. Novecientos litros. Y adentro del auto se prendió la luz.", gap=0.3)
    M('title', -1.8)
    il = tl.marks['light'] = round(tl.t - 1.2, 3)
    L('h2', 'YOIN', "En el asiento de atrás había gente. Tres personas, quietas, mirando para adelante.", gap=0.4)
    L('c1', 'CHOFER', "Me falta uno. Hay lugar.", gap=0.5)
    rg = M('ring', 0.5, adv=True); S(phone_ring(2.4), rg, 0.6); W(1.6)
    L('n1', 'NESTORT', "Bruno, ¿paró el auto del tres?", gap=0.3)
    L('y1', 'YOSH', "Sí. Está lleno de gente, Néstor.", gap=0.3)
    L('n2', 'NESTORT', "Escuchame bien. Si te pregunta el nombre, no se lo digas.", gap=0.4)
    S(static(0.4), tl.t + 0.05, 0.4)
    W(0.6)
    L('c2', 'CHOFER', "¿Cómo te llamás, pibe?", gap=0.3)
    sg = M('sting', 0.45, adv=True); S(sfx_sting(), sg, 0.9)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    amb = night_road(dur, 86)
    idle = engine(dur, 40.0, 87, 0.5) * 0.25
    dr = drone(dur, 32.7, 340, 41)
    drg = envelope(dur, [(0, 0.7), (mk['light'], 0.9), (mk['ring'], 0.4), (mk['sting'] - 2, 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 55)
    sgg = envelope(dur, [(0, 0.2), (mk['light'], 0.6), (mk['ring'], 0.0), (mk['sting'] - 2.5, 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, amb, 1.0), (0, idle, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 84, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.05, 0.5); tl.marks['title'] = 1.4
    L('h1', 'YOIN', "Le mentí. Le dije el primer nombre que se me ocurrió.", gap=0.2)
    L('y1', 'YO', "Julio. Me llamo Julio.", gap=0.4)
    L('c1', 'CHOFER', "¿Julio?... Julio ya viajó conmigo.", gap=0.5)
    dr_ = M('door', 0.4, adv=True); S(sfx_creak(1.5), dr_, 0.8)
    L('h2', 'YOIN', "La puerta de atrás se abrió sola. Y uno de los pasajeros se dio vuelta.", gap=0.2)
    L('h3', 'YOIN', "Era un pibe con el uniforme de la estación. Igual al mío. En el bolsillo decía: Julio.", gap=0.4)
    L('j1', 'JULIO', "No subas. Ya amanece.", gap=0.5)
    dw = M('dawn', 0.4, adv=True); S(sfx_riser(2.5), dw - 0.5, 0.35)
    L('h4', 'YOIN', "En el horizonte apareció la primera luz. El auto arrancó sin hacer ruido... y se borró en la ruta.", gap=0.4)
    mo = M('morning', 0.5, adv=True); S(sfx_whoosh(0.8), mo - 0.2, 0.5)
    L('h5', 'YOIN', "A las siete llegó Néstor. Le conté todo.", gap=0.3)
    L('n1', 'NESTOR', "Hoy hace un año que Julio hizo su última noche acá.", gap=0.5)
    sg = M('sting', 0.4, adv=True); S(sfx_clunk(0.9), sg - 0.1, 0.6); S(sfx_sting(1.0), sg, 0.9)
    L('h6', 'YOIN', "Esa noche, a las tres y treinta y tres... el surtidor tres se prendió solo.", gap=0.3)
    ec = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos le hubieras dicho tu nombre?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    amb = night_road(dur, 88)
    idle = engine(mk['dawn'] + 2.5, 40.0, 89, 0.5) * 0.25 * envelope(mk['dawn'] + 2.5, [(0, 1), (mk['dawn'] + 1.5, 1), (mk['dawn'] + 2.5, 0)])
    dr = drone(dur, 36.7, 340, 42)
    drg = envelope(dur, [(0, 0.8), (mk['door'], 1.0), (mk['dawn'], 0.4), (mk['morning'], 0.2), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 56)
    sgg = envelope(dur, [(0, 0.3), (mk['door'], 0.7), (mk['dawn'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 57) * envelope(dur, [(0, 0), (mk['dawn'], 0), (mk['dawn'] + 1.5, 0.45), (mk['morning'] + 2, 0.3), (mk['sting'] - 0.5, 0)])
    beds = [(0, amb, 1.0), (0, idle, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['dawn'], 80, 1.5), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

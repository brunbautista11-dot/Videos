#!/usr/bin/env python3
"""EL PEDIDO — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':  ('es-UY-MateoNeural',     '-4%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':    ('es-UY-MateoNeural',     '+2%',  '+2Hz',  'car',     0.95, 'yo'),
 'CASA':  ('es-AR-TomasNeural',     '-14%', '-12Hz', 'far',     1.1,  'cosa'),
 'OTRO':  ('es-UY-MateoNeural',     '-12%', '-8Hz',  'door',    1.05, 'cosa'),
 'SOP':   ('es-AR-ElenaNeural',     '+0%',  '+0Hz',  'radio',   0.95, 'sop'),
 'MAMA':  ('es-PY-TaniaNeural',     '-4%',  '-2Hz',  'radio',   0.95, 'mama'),
})

def notif():
    o = np.zeros((int(0.9 * SR), 2))
    for i, f in enumerate((1046.5, 1568.0)):
        k = st(fade(tone(f, 0.25, 0.08) * 0.35, 0.003, 0.05)); s = int(i * 0.14 * SR); o[s:s + len(k)] += k
    return reverb(o, 0.4, 0.15, seed=311)
def ring(d=2.4):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 659 * t) * .5 + np.sin(2 * np.pi * 784 * t) * .5) * 0.15 * ((t % 0.8) < 0.45)
    return reverb(st(lp(y, 3500)), 0.3, 0.1, seed=312)
def starter(d=1.4, seed=313):
    t = np.arange(int(d * SR)) / SR
    y = bp(noise(d), 200, 1800) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 14 * t))) * 0.35 * np.minimum(1, t / 0.05)
    y += np.sin(2 * np.pi * 70 * t) * 0.2 * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t))
    return reverb(st(fade(y, 0.01, 0.15)), 0.8, 0.2, seed=seed)
def moto(d, f0=52.0, seed=314):
    return engine(d, f0, seed, 0.7) * 0.8
def doorcreak(): return sfx_creak(1.2)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(notif(), 0.05, 0.7)
    L('h1', 'YOIN', "A la una de la mañana me entró un pedido. El cliente se llamaba igual que yo. Y la dirección era la casa donde me crié.", gap=0.35)
    tl.marks['title'] = 3.8
    L('h2', 'YOIN', "Esa casa está abandonada hace diez años. Pero de noche se gana más. Así que acepté.", gap=0.4)
    rd = M('road', 0.5, adv=True)
    L('h3', 'YOIN', "El camino de tierra estaba igual. Los eucaliptos. El portón verde.", gap=0.3)
    nt = M('note', 0.4, adv=True); S(notif(), nt, 0.5)
    L('h4', 'YOIN', "El pedido tenía una nota: No toques timbre. Dejalo en la ventana de la cocina.", gap=0.3)
    hs = M('house', 0.6, adv=True); S(sfx_motor_die(1.6, 52), hs - 0.8, 0.5)
    L('h5', 'YOIN', "La casa estaba a oscuras. Menos la cocina. Adentro, alguien estaba poniendo la mesa. Para dos.", gap=0.3)
    S(sfx_ding(2600, 2, 0.35, 0.2), tl.t + 0.2, 0.4)
    L('c1', 'CASA', "Santi, pasá. Te estaba esperando para comer.", gap=0.9)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    eng = moto(dur) * envelope(dur, [(0, 0.6), (mk['road'], 0.8), (mk['house'] - 0.8, 0.8), (mk['house'], 0), (dur, 0)])
    dr = drone(dur, 34.6, 360, 315)
    drg = envelope(dur, [(0, 0.5), (mk['road'], 0.6), (mk['note'], 0.8), (mk['house'], 1.0), (mk['sting'], 1.2), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 316)
    sgg = envelope(dur, [(0, 0), (mk['house'], 0), (mk['house'] + 3, 0.7), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, eng, 1.0), (0, crickets(dur, 317), 0.8), (0, wind(dur, 318, 400) * 0.5, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['house'], sfx_heart(dur - mk['house'], 72, 2.5), 0.55)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_steps(2.6, 4.0), 0.3, 0.6)
    L('h1', 'YOIN', "Dejé la bolsa en la ventana y volví a la moto sin mirar.", gap=0.3)
    tl.marks['title'] = 1.2
    st_ = M('start', 0.3, adv=True); S(starter(1.3), st_, 0.6); S(starter(1.1, 319), st_ + 1.6, 0.6)
    L('h2', 'YOIN', "La moto no arrancaba.", gap=0.1)
    ap = M('app', 0.4, adv=True); S(notif(), ap, 0.6)
    L('h3', 'YOIN', "Y en la app, el pedido cambió: Entregado. Cinco estrellas. Gracias, Santi. Volvé.", gap=0.3)
    mp = M('map', 0.4, adv=True); S(sfx_ding(880, 1, 0.3, 0.25), mp, 0.4)
    L('h4', 'YOIN', "En el mapa había otra moto. Pegada a la mía. Con mi nombre.", gap=0.3)
    rg = M('ring', 0.4, adv=True); S(ring(1.8), rg, 0.5); W(1.6)
    L('s1', 'SOP', "Hola, Santiago. Te llamamos de soporte. Te estamos viendo en dos lugares a la vez.", gap=0.2)
    L('y1', 'YO', "Estoy en el camino de los eucaliptos.", gap=0.3)
    L('s2', 'SOP', "Qué raro. Tu otra ubicación dice que estás adentro de la casa.", gap=0.3)
    S(static(0.4), tl.t + 0.05, 0.4)
    lt = M('light', 0.7, adv=True); S(starter(0.7, 320), lt - 0.3, 0.4)
    L('h5', 'YOIN', "Atrás mío se prendió un faro. Y escuché un motor. Igual al mío.", gap=0.3)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    eng2 = moto(dur, 50, 321) * envelope(dur, [(0, 0), (mk['light'] - 0.3, 0), (mk['light'] + 0.5, 0.8), (dur, 1.0)])
    dr = drone(dur, 32.7, 340, 322)
    drg = envelope(dur, [(0, 0.7), (mk['map'], 1.0), (mk['ring'], 0.5), (mk['light'], 0.9), (mk['sting'], 1.2), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 323)
    sgg = envelope(dur, [(0, 0.2), (mk['map'], 0.7), (mk['ring'], 0.1), (mk['light'], 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, crickets(dur, 324), 0.8), (0, wind(dur, 325, 400) * 0.5, 1.0), (0, eng2, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 86, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    tl.marks['title'] = 1.4
    S(sfx_steps(1.5, 5.5), 0.1, 0.6)
    L('h1', 'YOIN', "Me escondí entre los eucaliptos. Con el casco puesto. Sin respirar.", gap=0.3)
    ps = M('pass', 0.4, adv=True)
    L('h2', 'YOIN', "La otra moto pasó despacio. Mismo casco. Misma campera. Mi mochila. Frenó al lado de mi moto... y se dio vuelta.", gap=0.2)
    L('o1', 'OTRO', "Ya entregué yo, Santi. Andate a tu casa.", gap=0.7)
    gt = M('gate', 0.4, adv=True); S(sfx_creak(1.2), gt + 0.5, 0.4)
    L('h3', 'YOIN', "Entró por el portón verde. Y la luz de la cocina se apagó.", gap=0.3)
    dw = M('dawn', 0.6, adv=True); S(starter(0.6, 326), dw - 0.4, 0.5)
    L('h4', 'YOIN', "Mi moto arrancó a la primera. Manejé hasta que salió el sol.", gap=0.3)
    rg = M('ring', 0.4, adv=True); S(ring(1.6), rg, 0.5); W(1.4)
    L('m1', 'MAMA', "Santi, ¿anoche fuiste a la casa vieja? Me llamó la vecina. Dice que vio luz en la cocina. Y a vos, cenando.", gap=0.2)
    nt = M('night', 0.7, adv=True); S(sfx_whoosh(0.8), nt - 0.3, 0.5)
    L('h5', 'YOIN', "Esa noche, me entró un pedido nuevo.", gap=0.3)
    nf = M('notif', 0.2, adv=True); S(notif(), nf, 0.7)
    L('h6', 'YOIN', "Cliente: Santi. Nota: Traé para dos.", gap=0.2)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(0.9), sg, 0.85)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos hubieras entrado a la casa?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    eng2 = moto(dur, 50, 327) * envelope(dur, [(0, 0.5), (mk['pass'] + 2, 1.0), (mk['gate'], 0.6), (mk['gate'] + 1.5, 0), (mk['dawn'] - 0.3, 0), (mk['dawn'] + 0.3, 0.8), (mk['ring'], 0.5), (mk['night'], 0), (dur, 0)])
    night = crickets(dur, 328) * envelope(dur, [(0, 1), (mk['dawn'], 1), (mk['dawn'] + 2, 0), (mk['night'], 0), (mk['night'] + 0.2, 1), (dur, 1)])
    dr = drone(dur, 36.7, 340, 329)
    drg = envelope(dur, [(0, 0.9), (mk['gate'], 1.0), (mk['dawn'], 0.3), (mk['dawn'] + 2, 0.05), (mk['ring'] + 2, 0.5), (mk['night'], 0.7), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 330)
    sgg = envelope(dur, [(0, 0.5), (mk['pass'] + 3, 0.9), (mk['dawn'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 331) * envelope(dur, [(0, 0), (mk['dawn'], 0), (mk['dawn'] + 1.5, 0.45), (mk['ring'] + 1, 0.3), (mk['ring'] + 3, 0)])
    beds = [(0, eng2, 1.0), (0, night, 0.8), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['dawn'], 104, 1.0), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

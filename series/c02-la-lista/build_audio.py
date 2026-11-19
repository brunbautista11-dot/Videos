#!/usr/bin/env python3
"""LA LISTA — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':    ('es-AR-TomasNeural',  '-7%',  '-8Hz',  'inner', 1.0,  'in'),
 'YO':      ('es-AR-TomasNeural',  '+0%',  '-4Hz',  'room',  0.95, 'yo'),
 'YOSH':    ('es-AR-TomasNeural',  '+8%',  '+2Hz',  'room',  1.1,  'yo'),
 'PROFE':   ('es-PY-TaniaNeural',  '-10%', '-8Hz',  'pa',    0.8,  'profe'),
 'PROFEF':  ('es-PY-TaniaNeural',  '-14%', '-10Hz', 'far',   1.0,  'profe'),
 'PROFEC':  ('es-PY-TaniaNeural',  '-16%', '-12Hz', 'close', 1.05, 'profe'),
 'WALTER':  ('es-UY-MateoNeural',  '+2%',  '+0Hz',  'radio', 0.95, 'walter'),
 'WALTERR': ('es-UY-MateoNeural',  '+4%',  '+2Hz',  'room',  0.95, 'walter'),
 'WALTERX': ('es-UY-MateoNeural',  '-18%', '-10Hz', 'far',   1.0,  'walter'),
})

def sfx_bell(d=2.6):
    """timbre eléctrico de liceo en un pasillo largo"""
    t = np.arange(int(d * SR)) / SR
    ham = (np.sin(2 * np.pi * 24 * t) > 0).astype(float); ham = lp(ham, 400)
    ring = (np.sin(2 * np.pi * 1180 * t) * .6 + np.sin(2 * np.pi * 2760 * t) * .3 + np.sin(2 * np.pi * 3540 * t) * .15) * (.35 + .65 * ham)
    cl_ = bp(noise(d), 2500, 7000) * ham * .25
    y = (ring + cl_) * np.minimum(1, t / .02) * np.minimum(1, (d - t) / .08) * .5
    return reverb(y, 2.6, 0.55, dark=4500, seed=101)
def sfx_erase(d=1.6, n=4):
    t = np.arange(int(d * SR)) / SR
    g = np.abs(np.sin(np.pi * n * t / d)) ** .6
    return reverb(bp(noise(d), 600, 3500) * g * .35 + lp(noise(d), 300) * g * .2, 0.6, 0.2, seed=102)
def sfx_chirp():
    a = sfx_beep(1450, .07, .3)[:, 0]; b = sfx_beep(1900, .07, .3)[:, 0]
    return st(np.concatenate([a, np.zeros(int(.03 * SR)), b]))
def hall_air(d):
    return roomtone(d, 50, 103) * 1.2 + wind(d, 104, 300) * .25
def fluo(d):
    t = np.arange(int(d * SR)) / SR
    return st((np.sin(2 * np.pi * 100 * t) * .05 + signal.sawtooth(2 * np.pi * 200 * t) * .015 + bp(noise(d), 4000, 8000) * .01))

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_bell(2.4), 0.0, 0.9)
    L('h1', 'YOIN', "Soy sereno de un liceo. Y anoche, a las tres de la mañana, sonó el timbre del recreo.", gap=0.9)
    M('title', -1.2)
    a, b = L('h2', 'YOIN', "Once años haciendo la ronda. Nunca había sonado.", gap=0.6)
    M('walk', -2.0); S(sfx_steps(9.5, 2.1), a - 1.6, 0.55)
    L('h3', 'YOIN', "Al fondo del pasillo, el tercero B tenía la luz prendida.", gap=0.5)
    W(0.5); dr_ = M('door', 0.1, adv=True); S(sfx_creak(1.4), dr_, 0.6)
    L('h4', 'YOIN', "Los bancos estaban vacíos. Acomodados. Como esperando a alguien.", gap=0.4)
    L('h5', 'YOIN', "Y en el pizarrón, con tiza, había una lista de nombres.", gap=0.4)
    L('h6', 'YOIN', "Todos tachados. Menos el último. Ramón Acosta. Yo.", gap=0.5)
    pa = M('pa', 0.5, adv=True); S(static(0.5), pa, 0.35); S(sfx_click(), pa, 0.5)
    L('p1', 'PROFE', "Buenas noches. Voy a pasar lista.", gap=0.4)
    L('p2', 'PROFE', "Ramón Acosta.", gap=0.7)
    tr = M('turn', 0.3, adv=True); S(sfx_whoosh(0.6), tr, 0.4)
    L('h7', 'YOIN', "Al fondo del pasillo había una mujer de túnica blanca. De espaldas.", gap=0.5)
    L('e1', 'PROFEF', "Ramón Acosta... ¿ausente?", gap=0.4)
    sg_t = M('sting', 0.25, adv=True); S(sfx_sting(), sg_t, 0.9); S(sfx_flicker(1.0), sg_t, 0.5)
    ec_ = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    air = hall_air(dur)
    fl = fluo(dur) * envelope(dur, [(0, 0), (mk['door'], 0), (mk['door'] + .5, 1), (mk['turn'], 1), (mk['turn'] + .5, .4), (dur, .4)])
    dr = drone(dur, 34.6, 320, 33)
    drg = envelope(dur, [(0, 0.3), (mk['door'], 0.45), (mk['pa'], 0.7), (mk['turn'], 0.9), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur, (261.6, 277.2, 392.0), 43)
    sgg = envelope(dur, [(0, 0), (Ln_start(tl, 'h6'), 0), (mk['pa'], 0.5), (mk['turn'], 0.7), (mk['sting'], 1.3), (mk['sting'] + .2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['pa'], 72, 2.5)
    beds = [(0, air, 1.0), (0, fl, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['pa'], hb, 0.6)]
    mixdown(tl, dur, beds)

def Ln_start(tl, id): return tl.T(id)['start']

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_erase(1.8, 5), 0.05, 0.9)
    L('h1', 'YOIN', "No contesté. Agarré el borrador y borré mi nombre.", gap=0.7)
    M('title', -1.6)
    off = M('off', 0.4, adv=True); S(sfx_clunk(1.0), off, 0.9); W(0.6)
    L('h2', 'YOIN', "Las luces se apagaron. Todas juntas.", gap=0.2)
    hb_ = M('handy', 0.5, adv=True); S(sfx_chirp(), hb_, 0.7); S(static(0.6, 91), hb_ + 0.15, 0.3)
    L('w1', 'WALTER', "Ramón, ¿todo bien? Te estoy viendo en las cámaras.", gap=0.6)
    L('y1', 'YOSH', "¡Walter! Hay alguien en el tercero B.", gap=0.4)
    L('w2', 'WALTER', "En el tercero B estás vos solo, Ramón...", gap=0.5)
    L('w3', 'WALTER', "Sentado en el primer banco.", gap=0.3)
    ct = M('cut', 0.3, adv=True); S(static(0.8, 92), ct, 0.4); W(0.9)
    bd = M('board')
    L('h3', 'YOIN', "Alumbré el pizarrón. Mi nombre estaba otra vez. Escrito con mi letra.", gap=0.3)
    L('c1', 'PROFEC', "No se borra, Ramón. Nunca se borra.", gap=0.5)
    sl = M('slam', 0.3, adv=True); S(sfx_slam(), sl, 0.95)
    L('p1', 'PROFE', "Ramón Acosta. Última vez.", gap=0.8)
    sg_t = M('sting', 0.2, adv=True); S(sfx_sting(0.9), sg_t, 0.85)
    ec_ = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    air = hall_air(dur)
    fl = fluo(dur) * envelope(dur, [(0, 1), (mk['off'], 1), (mk['off'] + .05, 0), (dur, 0)])
    dr = drone(dur, 32.7, 340, 34)
    drg = envelope(dur, [(0, 0.6), (mk['off'], 0.9), (mk['handy'], 0.4), (mk['cut'], 0.8), (mk['slam'], 1.0), (dur, 0.6)])
    sg = strings(dur, (246.9, 261.6, 370.0), 44)
    sgg = envelope(dur, [(0, 0.3), (mk['off'], 0.0), (mk['cut'], 0.5), (mk['slam'], 0.9), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['off'], 76, 2.8)
    beds = [(0, air, 1.0), (0, fl, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['off'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.1, 0.5); tl.marks['title'] = 1.4
    L('h1', 'YOIN', "Contesté. Con la voz temblando.", gap=0.5)
    L('y1', 'YO', "Presente.", gap=0.4)
    on = M('on', 0.6, adv=True); S(sfx_flicker(1.2), on, 0.6); S(sfx_clunk(0.7), on + 0.9, 0.6)
    L('p1', 'PROFE', "Muy bien, Ramón. Ya se puede retirar.", gap=0.7)
    op = M('open', 0.3, adv=True); S(sfx_creak(1.6), op, 0.7); W(0.6)
    a, b = L('h2', 'YOIN', "Salí sin mirar atrás. Por las ventanas ya entraba el sol.", gap=0.2)
    M('walk', -2.6); S(sfx_steps(4.5, 2.2), a - 0.4, 0.55)
    L('h3', 'YOIN', "En la entrada estaba Walter, llegando al turno de la mañana.", gap=0.3)
    L('w1', 'WALTERR', "¡Ramón! Qué cara tenés, che.", gap=0.4)
    L('y2', 'YOSH', "Walter, no vayas al tercero B. Prometeme.", gap=0.4)
    bl = M('bell', 0.5, adv=True); S(sfx_bell(2.2), bl, 0.9); W(1.6)
    L('p2', 'PROFE', "Walter Suárez.", gap=0.3)
    L('w2', 'WALTERX', "Presente.", gap=0.7)
    ps = M('pass', 0.2, adv=True); S(sfx_steps(3.0, 2.0), ps, 0.5)
    L('h4', 'YOIN', "Pasó al lado mío sin mirarme. Y caminó hacia el tercero B.", gap=0.2)
    tn = M('turnaround', 0.4, adv=True)
    L('h5', 'YOIN', "Y al fondo del pasillo, la mujer, por primera vez, se dio vuelta.", gap=0.1)
    sg_t = M('sting', 0.3, adv=True); S(sfx_sting(1.2), sg_t, 0.95)
    ec_ = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos lo hubieras frenado?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    air = hall_air(dur)
    fl = fluo(dur) * envelope(dur, [(0, 0), (mk['on'] + .9, 0), (mk['on'] + 1.0, 1), (mk['open'] + 1, 1), (mk['open'] + 2, .3), (dur, .3)])
    dr = drone(dur, 34.6, 360, 35)
    drg = envelope(dur, [(0, 0.7), (mk['on'], 0.6), (mk['open'] + 1, 0.15), (mk['bell'], 0.2), (mk['bell'] + 1, 0.7), (mk['sting'], 1.0), (dur, 0.55)])
    sg = strings(dur, (293.7, 311.1, 466.2), 45)
    sgg = envelope(dur, [(0, 0.4), (mk['on'], 0.2), (mk['open'], 0.0), (mk['bell'], 0.0), (mk['pass'], 0.6), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    day = dur - mk['open']
    birds = crickets(day, 105) * 0.4
    beds = [(0, air, 0.8), (0, fl, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (0, sfx_heart(mk['open'], 78, 1.5), 0.6),
            (mk['open'], fade(birds, 1.5, 0.3) * envelope(day, [(0, 0), (1.5, 1), (mk['bell'] - mk['open'], 1), (mk['bell'] - mk['open'] + 1, 0), (day, 0)]), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

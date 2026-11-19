#!/usr/bin/env python3
"""CAMA 9 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':    ('es-UY-ValentinaNeural', '-3%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':      ('es-UY-ValentinaNeural', '+3%',  '+3Hz',  'room',    0.95, 'yo'),
 'YOSH':    ('es-UY-ValentinaNeural', '+12%', '+10Hz', 'room',    1.1,  'yo'),
 'VIEJO':   ('es-PY-MarioNeural',     '-16%', '-14Hz', 'pa',      0.8,  'viejo'),
 'VIEJOF':  ('es-PY-MarioNeural',     '-18%', '-16Hz', 'far',     1.05, 'viejo'),
 'VIEJOR':  ('es-PY-MarioNeural',     '-12%', '-10Hz', 'room',    0.95, 'viejo'),
 'ELVIRA':  ('es-AR-ElenaNeural',     '-14%', '-10Hz', 'whisper', 1.0,  'elvira'),
 'ELVIRAPA':('es-AR-ElenaNeural',     '-16%', '-12Hz', 'pa',      0.8,  'hab8'),
 'DOC':     ('es-AR-TomasNeural',     '+2%',  '+0Hz',  'radio',   0.95, 'doc'),
 'CORO':    ('es-UY-MateoNeural',     '-20%', '-14Hz', 'choir',   1.0,  'cosa'),
})

def call_bell(g=0.6):
    """timbre de llamado de hospital: ding-dong grave"""
    a = sfx_ding(880.0, 1, g=g); b = sfx_ding(698.5, 1, g=g)
    o = np.zeros((len(a) + int(0.38 * SR), 2)); o[:len(a)] += a; o[int(0.38 * SR):int(0.38 * SR) + len(b)] += b
    return o
def phone_ring(d=2.4):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * 0.18 * (((t % 1.2) < 0.8)).astype(float) * (np.sin(2 * np.pi * 20 * t) > 0)
    return reverb(lp(y, 3000), 0.5, 0.2, seed=91)
def gulp():
    o = np.zeros(int(1.6 * SR))
    for i in range(3):
        k = add(tone(180, 0.18, 0.04) * 0.5, nb(0.12, 300, 1500, 0.03, 0.3)); s = int((0.2 + i * 0.45) * SR); o[s:s + len(k)] += k
    return reverb(o, 0.5, 0.2, seed=92)
def chime_up(d=2.2):
    t = np.arange(int(d * SR)) / SR; o = np.zeros(len(t))
    for i, f in enumerate((523.3, 659.3, 784.0, 1046.5, 1318.5)):
        k = tone(f, d - i * 0.25, 0.6) * 0.15; s = int(i * 0.25 * SR); o[s:s + len(k)] += k
    return reverb(o, 2.5, 0.5, dark=7000, seed=93)
def ward(dur):
    """aire acondicionado + zumbido de tubos fluorescentes"""
    return roomtone(dur, 50, 61) * 1.3 + st(bp(noise(dur), 2000, 6000) * 0.004)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(call_bell(), 0.05, 0.8)
    L('h1', 'YOIN', "La habitación nueve está cerrada hace un año. Anoche sonó su timbre.", gap=0.3)
    M('title')
    L('h2', 'YOIN', "Cuatro de la mañana. Guardia de noche. Tres pacientes en todo el piso.", gap=0.6)
    b2 = M('bell2', 0.4, adv=True); S(call_bell(), b2, 0.8); W(1.0)
    L('h3', 'YOIN', "La nueve no tiene cama. Está cerrada por obras.", gap=0.2)
    ib = M('interbuzz', 0.5, adv=True); S(sfx_buzz(1.0), ib, 0.6); S(static(0.5), ib + 0.9, 0.3)
    L('v1', 'VIEJO', "Enfermera... ¿me trae un vaso de agua?", gap=1.1)
    pr = M('press', 0.3, adv=True); S(sfx_click(), pr, 0.9)
    L('y1', 'YO', "¿Quién habla?", gap=0.2)
    L('v2', 'VIEJO', "Cama nueve. Tengo mucha sed.", gap=0.6)
    wk = M('walk', 0.3, adv=True); S(sfx_steps(3.4, 2.2), wk, 0.6)
    L('h4', 'YOIN', "Fui por el pasillo. Por abajo de la puerta de la nueve salía luz.", gap=0.3)
    el = M('elvira', 0.4, adv=True); S(sfx_creak(1.2), el, 0.6)
    L('e1', 'ELVIRA', "Nena... no le lleves agua.", gap=0.6)
    L('y2', 'YO', "Doña Elvira, ¿qué hace despierta?", gap=0.4)
    L('e2', 'ELVIRA', "Si le das agua... se levanta.", gap=0.3)
    sg_t = M('sting', 0.5, adv=True); S(sfx_knock(3, 0.45, 1.3), sg_t, 0.9); S(sfx_sting(), sg_t + 0.05, 0.8)
    ec_ = M('endcard', 1.6, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 36.7, 340, 33)
    drg = envelope(dur, [(0, 0.3), (mk['interbuzz'], 0.4), (mk['walk'], 0.6), (mk['elvira'], 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur, (293.7, 311.1, 440.0), 43)
    sgg = envelope(dur, [(0, 0), (mk['interbuzz'], 0.0), (mk['walk'], 0.35), (mk['elvira'], 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['walk'], 72, 2.5)
    beds = [(0, ward(dur), 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['walk'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.1, 0.5); tl.marks['title'] = 1.6
    L('h1', 'YOIN', "No le llevé agua. Arranqué el cable del timbre de la pared.", gap=0.3)
    yk = M('yank', 0.2, adv=True); S(sfx_clunk(1.0), yk, 0.8); S(static(0.3), yk + 0.05, 0.4); W(0.9)
    L('h2', 'YOIN', "Silencio. Y entonces... se prendieron todas.", gap=0.1)
    al = M('all', 0.3, adv=True)
    for i in range(6): S(call_bell(0.5), al + i * 0.32, 0.55)
    W(0.9)
    L('c1', 'CORO', "Agua... agua...", gap=0.1)
    L('h3', 'YOIN', "Todas las habitaciones pedían lo mismo. Pero en el piso había tres pacientes.", gap=0.4)
    rg = M('ring', 0.4, adv=True); S(phone_ring(2.4), rg, 0.7); W(1.5)
    L('d1', 'DOC', "Laura, ¿por qué me llamás desde la nueve?", gap=0.2)
    L('y1', 'YOSH', "¡Yo no te llamé!", gap=0.3)
    L('d2', 'DOC', "Me sonó el busca. Dice cama nueve. Y tu nombre.", gap=0.3)
    ct = M('cut', 0.3, adv=True); S(static(0.6), ct, 0.5)
    op = M('open9', 0.6, adv=True); S(sfx_creak(1.8), op, 0.8); W(1.2)
    L('h4', 'YOIN', "La puerta de la nueve se abrió sola. Y adentro había una cama.", gap=0.2)
    L('v1', 'VIEJOF', "Laura... tengo sed.", gap=0.5)
    sg_t = M('sting', 0.2, adv=True); S(sfx_sting(), sg_t, 0.9)
    ec_ = M('endcard', 1.4, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 34.6, 360, 34)
    drg = envelope(dur, [(0, 0.6), (mk['yank'], 0.3), (mk['all'], 0.9), (mk['ring'], 0.5), (mk['cut'], 0.7), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur, (277.2, 293.7, 415.3), 44)
    sgg = envelope(dur, [(0, 0.2), (mk['yank'], 0.0), (mk['all'], 0.7), (mk['ring'], 0.1), (mk['open9'], 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['all'], 80, 3.0)
    beds = [(0, ward(dur), 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['all'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.1, 0.5); tl.marks['title'] = 1.6
    L('h1', 'YOIN', "Entré a la nueve. Con un vaso de agua en la mano.", gap=0.3)
    L('h2', 'YOIN', "En la cama había un señor. Flaquito. Con los ojos cerrados.", gap=0.5)
    L('v1', 'VIEJOR', "Gracias, nena. Hace un año que nadie me trae agua.", gap=0.6)
    dk = M('drink', 0.3, adv=True); S(gulp(), dk, 0.6); W(1.3)
    L('v2', 'VIEJOR', "Yo no pedía agua para mí. Pedía que alguien entrara.", gap=0.2)
    L('v3', 'VIEJOR', "Para avisarte de la ocho.", gap=0.4)
    gn = M('gone', 0.4, adv=True); S(chime_up(), gn, 0.6); W(1.0)
    L('h3', 'YOIN', "Parpadeé. La cama estaba vacía. Tendida. Como si nadie hubiera estado.", gap=0.2)
    ot = M('out', 0.4, adv=True); S(sfx_steps(1.6, 2.2), ot, 0.6); W(0.9)
    L('h4', 'YOIN', "Salí al pasillo. Todos los timbres apagados. Menos uno.", gap=0.1)
    b8 = M('bell8', 0.3, adv=True); S(call_bell(), b8, 0.8); W(1.0)
    L('e1', 'ELVIRAPA', "Enfermera... ¿me trae un vaso de agua?", gap=0.2)
    L('h5', 'YOIN', "Doña Elvira está en la ocho hace un año. Nunca la vi tomar agua.", gap=0.5)
    sg_t = M('sting', 0.3, adv=True); S(sfx_sting(1.2), sg_t, 0.95)
    ec_ = M('endcard', 1.4, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos le llevarías agua a doña Elvira?", gap=0.5)
    W(3.1); dur = tl.t; mk = tl.marks
    dr = drone(dur, 36.7, 360, 35)
    drg = envelope(dur, [(0, 0.6), (mk['drink'], 0.3), (mk['gone'], 0.1), (mk['out'], 0.4), (mk['bell8'], 0.8), (mk['sting'], 1.0), (dur, 0.55)])
    sg = strings(dur, (293.7, 349.2, 440.0), 45)
    sgg = envelope(dur, [(0, 0.3), (mk['drink'], 0.5), (mk['gone'], 0.6), (mk['out'], 0.0), (mk['bell8'], 0.3), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    beds = [(0, ward(dur), 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['bell8'], sfx_heart(dur - mk['bell8'], 76, 2.0), 0.6)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

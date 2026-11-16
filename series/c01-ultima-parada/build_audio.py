#!/usr/bin/env python3
"""ÚLTIMA PARADA — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':   ('es-UY-MateoNeural',     '-4%',  '-4Hz',  'inner',   1.0,  'in'),
 'YO':     ('es-UY-MateoNeural',     '+2%',  '+2Hz',  'room',    0.95, 'yo'),
 'MUJER':  ('es-AR-ElenaNeural',     '-8%',  '-8Hz',  'whisper', 1.0,  'mujer'),
 'MUJERF': ('es-AR-ElenaNeural',     '-10%', '-8Hz',  'far',     1.0,  'mujer'),
 'PA':     ('es-UY-ValentinaNeural', '-6%',  '+2Hz',  'pa',      0.7,  'pa'),
 'CHOFER': ('es-PY-MarioNeural',     '-14%', '-14Hz', 'door',    1.0,  'chofer'),
 'OTRO':   ('es-UY-MateoNeural',     '-18%', '-12Hz', 'close',   1.1,  'cosa'),
})

def bus_bed(dur, pts):
    """engine + cabin rattle following a gain curve"""
    return engine(dur, 41.0, 90) * envelope(dur, pts)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_ding(1318.5, 2, 0.38), 0.05, 0.8)
    L('h1', 'YOIN', "Nunca te subas al último colectivo sin mirar el cartel.", gap=0.45)
    M('title')
    L('h2', 'YOIN', "Tres y cuarto de la mañana. Cuatro pasajeros. Ninguno se movía.", gap=0.6)
    pa = M('pa1', 0.4, adv=True); S(sfx_ding(988, 2, 0.4), pa, 0.7)
    L('pa1', 'PA', "Próxima parada: Los Olvidados.", gap=0.95)
    L('h3', 'YOIN', "Hago este viaje hace dos años. Esa parada no existe.", gap=0.45)
    br = M('brake', 0.3, adv=True); S(sfx_brake(1.5), br, 0.7); W(1.25)
    do = M('door'); S(sfx_hiss(1.1), do, 0.9)
    L('h4', 'YOIN', "Un hombre se bajó. Afuera no había calle. No había nada.", gap=0.8)
    dc = M('doorclose', 0.3, adv=True); S(sfx_hiss(0.9), dc, 0.8); W(0.9)
    L('m1', 'MUJER', "No mires al chofer por el espejo.", gap=0.15)
    L('y1', 'YO', "¿Qué?", gap=0.3)
    L('m2', 'MUJER', "Si te ve despierto... la próxima parada es la tuya.", gap=0.25)
    lk = M('look', 0.35, adv=True); S(sfx_riser(2.3), lk, 0.5)
    L('h5', 'YOIN', "Y lo miré.", gap=0.7)
    ey = M('eyes', 0.75, adv=True); S(sfx_sting(), ey, 0.9); W(1.7)
    p2 = M('pa2'); S(sfx_ding(988, 2, 0.4), p2, 0.7)
    L('pa2', 'PA', "Próxima parada: Martín.", gap=0.95)
    L('h6', 'YOIN', "Martín... soy yo.", gap=0.5)
    b2 = M('brake2', 0.25, adv=True); S(sfx_brake(1.4), b2, 0.7); W(1.15)
    d2 = M('door2'); S(sfx_hiss(1.1), d2, 0.9); W(1.0)
    L('c1', 'CHOFER', "La suya, joven.", gap=0.1)
    ec_ = M('endcard', 0.9, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    eng = bus_bed(dur, [(0, 1.0), (mk['brake'], 1.0), (mk['brake'] + 1.2, 0.35), (mk['doorclose'], 0.35), (mk['doorclose'] + 1.2, 0.9), (mk['brake2'], 0.9), (mk['brake2'] + 1.2, 0.3), (dur, 0.25)])
    dr = drone(dur)
    drg = envelope(dur, [(0, 0.0), (mk['pa1'], 0.0), (mk['pa1'] + 2, 0.45), (mk['door'], 0.6), (mk['look'], 0.7), (mk['eyes'], 1.0), (mk['eyes'] + 0.4, 0.5), (mk['door2'], 0.9), (dur, 0.6)])
    sg = strings(dur); sgg = envelope(dur, [(0, 0), (mk['doorclose'], 0), (mk['look'], 0.4), (mk['eyes'], 1.3), (mk['eyes'] + 0.2, 0), (mk['pa2'], 0.0), (mk['door2'] + 1, 0.8), (mk['endcard'], 1.0), (mk['endcard'] + 0.3, 0.0)])
    hb = sfx_heart(mk['endcard'] - mk['look'], 74, 2.5)
    beds = [(0, eng, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['look'], hb, 0.6), (0, roomtone(dur, 100, 61), 0.4)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.1, 0.5)
    L('h1', 'YOIN', "No me bajé. Y el colectivo no arrancó.", gap=0.45)
    M('title')
    L('c1', 'CHOFER', "Es su parada, joven. Baje.", gap=1.0)
    a, b = L('h2', 'YOIN', "Me agarré del asiento. Las puertas se cerraron solas.", gap=0.5)
    tl.marks['doorclose'] = round(a + 1.9, 3); S(sfx_hiss(0.9), a + 1.9, 0.9)
    st_ = M('start', 0.4, adv=True); W(0.5)
    L('m1', 'MUJER', "Hiciste bien. Yo me bajé una vez.", gap=0.2)
    L('y1', 'YO', "¿Y qué había?", gap=0.35)
    L('m2', 'MUJER', "Mirá mi boleto.", gap=0.5)
    M('ticket', 0.15, adv=True); W(0.5)
    L('h3', 'YOIN', "El boleto era de mil novecientos noventa y ocho.", gap=0.2)
    mp = M('map', 0.45, adv=True); S(sfx_buzz(0.9), mp, 0.7)
    L('h4', 'YOIN', "Abrí el mapa. Hacía una hora que no nos movíamos del mismo punto.", gap=0.55)
    bk = M('back', 0.4, adv=True); S(sfx_riser(2.6), bk + 0.6, 0.45)
    L('h5', 'YOIN', "Entonces vi al pasajero del fondo. Dormido. Con mi campera. Con mi mochila.", gap=0.5)
    fc = M('face', 0.45, adv=True)
    a, b = L('h6', 'YOIN', "Con mi cara.", gap=0.35)
    sg_t = M('sting', 0.15, adv=True); S(sfx_sting(), sg_t, 0.9); W(1.5)
    L('m3', 'MUJER', "No lo despiertes. El que despierta a otro... se queda.", gap=0.1)
    ec_ = M('endcard', 0.9, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    eng = bus_bed(dur, [(0, 0.3), (mk['start'], 0.3), (mk['start'] + 1.3, 0.9), (mk['map'], 0.8), (mk['back'], 0.5), (dur, 0.35)])
    dr = drone(dur, 36.7, 340, 31)
    drg = envelope(dur, [(0, 0.6), (mk['doorclose'], 0.7), (mk['start'], 0.35), (mk['ticket'], 0.5), (mk['back'], 0.7), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur, (277.2, 293.7, 415.3), 41)
    sgg = envelope(dur, [(0, 0.2), (mk['title'], 0.0), (mk['ticket'], 0.0), (mk['map'], 0.35), (mk['back'], 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0.0), (mk['endcard'] - 1, 0.6), (mk['endcard'] + 0.3, 0)])
    hb = sfx_heart(mk['endcard'] - mk['back'], 78, 3.0)
    beds = [(0, eng, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['back'], hb, 0.7), (0, roomtone(dur, 100, 62), 0.4)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_click(), 0.35, 1.0); S(sfx_click(), 0.9, 1.0); S(sfx_click(), 1.3, 1.0)
    tl.marks['title'] = 1.9
    L('h1', 'YOIN', "Toqué el timbre. No sonó. Así que fui hasta el fondo.", gap=0.5)
    wk = M('walk', -0.9); S(sfx_steps(4.6, 1.7), wk + 0.5, 0.6)
    L('h2', 'YOIN', "Mientras caminaba, todos giraron la cabeza. Todos... menos él.", gap=0.6)
    L('h3', 'YOIN', "Le toqué el hombro.", gap=0.7)
    op = M('open', 0.55, adv=True); S(sfx_riser(1.9), op - 0.5, 0.5); W(1.0)
    L('o1', 'OTRO', "Por fin. Hace años que te espero.", gap=0.1)
    bo = M('blackout', 0.2, adv=True); S(sfx_sting(1.2), bo, 0.95); S(sfx_clunk(1.1), bo, 0.9)
    W(1.4); M('wake')
    L('h4', 'YOIN', "Abrí los ojos. Estaba sentado en el fondo. Y no me podía mover.", gap=0.4)
    br = M('brake', 0.3, adv=True); S(sfx_brake(1.4), br, 0.6); W(1.15)
    do = M('door'); S(sfx_hiss(1.1), do, 0.8); S(sfx_ding(1318.5, 2, 0.38), do + 0.5, 0.5)
    L('h5', 'YOIN', "El colectivo frenó en mi parada. Tres y cuarto de la mañana.", gap=0.7)
    bd = M('board', 0.2, adv=True); S(sfx_steps(3.6, 1.8), bd + 0.2, 0.45)
    L('h6', 'YOIN', "Y me vi subir. Mirando el celular. Sin mirar el cartel.", gap=0.4)
    L('m1', 'MUJERF', "No mires al chofer por el espejo.", gap=0.6)
    L('h7', 'YOIN', "Quise gritarle. Pero acá atrás... nadie tiene voz.", gap=0.5)
    p2 = M('pa', 0.4, adv=True); S(sfx_ding(988, 2, 0.4), p2, 0.6)
    L('pa', 'PA', "Próxima parada: Los Olvidados.", gap=0.95)
    e2 = M('end2', 0.35, adv=True); S(sfx_sting(1.3), e2, 1.0); S(sfx_clunk(1.2), e2, 0.9)
    ec_ = M('endcard', 1.2, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos te hubieras subido?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    eng = bus_bed(dur, [(0, 0.8), (mk['open'], 0.6), (mk['blackout'], 0.6), (mk['blackout'] + 0.1, 0.0), (mk['wake'], 0.0), (mk['wake'] + 2, 0.8), (mk['brake'], 0.8), (mk['brake'] + 1.2, 0.3), (mk['board'] + 4, 0.3), (mk['pa'], 0.9), (mk['end2'], 1.0), (mk['end2'] + 0.15, 0.0), (dur, 0.0)])
    dr = drone(dur, 36.7, 360, 32)
    drg = envelope(dur, [(0, 0.5), (mk['open'], 0.9), (mk['blackout'], 1.0), (mk['blackout'] + 0.5, 0.3), (mk['board'], 0.5), (mk['end2'], 1.0), (dur, 0.55)])
    sg = strings(dur, (293.7, 311.1, 466.2), 42)
    sgg = envelope(dur, [(0, 0.2), (mk['walk'] + 1, 0.4), (mk['open'], 0.9), (mk['blackout'], 1.4), (mk['blackout'] + 0.15, 0), (mk['board'], 0.0), (mk['pa'], 0.5), (mk['end2'], 1.5), (mk['end2'] + 0.15, 0)])
    hb = sfx_heart(mk['end2'] - mk['wake'], 66, 2.0)
    beds = [(0, eng, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['wake'], hb, 0.7), (0, roomtone(dur, 100, 63), 0.4), (mk['wake'], wind(dur - mk['wake'], 91) * 0.5, 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

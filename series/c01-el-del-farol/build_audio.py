#!/usr/bin/env python3
"""EL DEL FAROL — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':    ('es-AR-TomasNeural', '-3%',  '-4Hz',  'inner', 1.0,  'in'),
 'YO':      ('es-AR-TomasNeural', '+0%',  '+2Hz',  'car',   0.95, 'yo'),
 'RADIO':   ('es-AR-ElenaNeural', '-8%',  '-6Hz',  'radio', 0.95, 'radio'),
 'RADIOYO': ('es-AR-TomasNeural', '-3%',  '-4Hz',  'radio', 0.95, 'radio'),
 'HOMBRE':  ('es-PY-MarioNeural', '-14%', '-12Hz', 'door',  1.0,  'hombre'),
 'HOMBREC': ('es-PY-MarioNeural', '-14%', '-12Hz', 'close', 1.0,  'hombre'),
 'PLAYERO': ('es-UY-MateoNeural', '+3%',  '+3Hz',  'store', 0.95, 'playero'),
})

def car(dur, pts, seed=110):
    return (engine(dur, 52.0, seed, rough=0.7) + wind(dur, seed + 1, 700) * 0.9) * envelope(dur, pts)
def passby(g=1.0):
    d = 1.0; t = np.arange(int(d * SR)) / SR; x = t / d
    y = bp(noise(d), 200, 2400) * np.exp(-((x - 0.45) / 0.16) ** 2) * 0.9 + tone(70, d) * np.exp(-((x - 0.45) / 0.2) ** 2) * 0.5
    o = st(y); o[:, 0] *= np.linspace(0.3, 1.0, len(y)) * 0 + 0.6; o[:, 1] *= 1.1
    return reverb(o * g, 0.9, 0.3, seed=111)
def night(dur, seed=112):
    return crickets(dur, seed) * 1.2 + wind(dur, seed + 1, 350) * 0.4

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(0.9), 0.0, 0.5)
    L('h1', 'YOIN', "Si manejás de noche por la ruta 26 y ves a un hombre con un farol... no frenes.", gap=0.4)
    M('title')
    L('h2', 'YOIN', "Eso me dijeron en la estación. Me reí. Me faltaban doscientos kilómetros.", gap=0.6)
    M('see1', 0.3, adv=True)
    L('h3', 'YOIN', "En el kilómetro 233 lo vi. Parado en la banquina. Haciendo dedo.", gap=0.3)
    p1 = M('pass1', 0.5, adv=True); S(passby(), p1 - 0.45, 0.9); W(0.7)
    L('h4', 'YOIN', "No frené.", gap=0.0)
    s2 = M('see2', 0.7, adv=True); S(sfx_riser(2.6), s2 + 0.6, 0.35)
    L('h5', 'YOIN', "Diez minutos después... otra vez el cartel. Kilómetro 233. Y él.", gap=0.2)
    p2 = M('pass2', 0.55, adv=True); S(passby(), p2 - 0.45, 0.9); W(0.6)
    rd = M('radio'); S(static(1.1), rd, 0.5)
    a, b = L('r1', 'RADIO', "Si ya lo pasaste dos veces... no mires el asiento de atrás.", gap=0.95)
    S(static(0.6), b + 0.05, 0.45)
    L('h6', 'YOIN', "La radio estaba apagada.", gap=0.8)
    s3 = M('see3', 0.4, adv=True); S(sfx_riser(2.8), s3 + 2.6, 0.5)
    L('h7', 'YOIN', "La tercera vez no estaba en la banquina. Estaba en el medio de la ruta.", gap=0.3)
    sg_t = M('sting', 0.35, adv=True); S(sfx_sting(), sg_t, 0.9)
    ec_ = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    cr = car(dur, [(0, 1.0), (mk['sting'], 1.0), (mk['sting'] + 0.4, 0.6), (dur, 0.5)])
    dr = drone(dur)
    drg = envelope(dur, [(0, 0.0), (mk['see1'], 0.1), (mk['pass1'], 0.5), (mk['see2'], 0.4), (mk['pass2'], 0.7), (mk['see3'], 0.7), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur); sgg = envelope(dur, [(0, 0), (mk['see2'], 0), (mk['pass2'], 0.5), (mk['pass2'] + 0.2, 0.0), (mk['radio'] + 1, 0.3), (mk['see3'], 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['see3'], 74, 3.0)
    beds = [(0, cr, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['see3'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_riser(1.2), 0.0, 0.5); tl.marks['thru'] = 1.2; S(passby(1.3), 0.75, 1.0); S(sfx_whoosh(0.9), 1.0, 0.7)
    L('h1', 'YOIN', "Aceleré. Cerré los ojos. Y no sentí ningún golpe.", gap=0.3)
    M('title')
    L('h2', 'YOIN', "Abrí los ojos. La ruta estaba vacía.", gap=0.7)
    gl = M('glow', 0.7, adv=True); S(sfx_riser(2.6), gl + 0.4, 0.4)
    L('h3', 'YOIN', "Entonces vi una luz amarilla en el espejo. El farol... estaba en mi asiento de atrás.", gap=0.4)
    rd = M('radio', 0.4, adv=True); S(static(1.0), rd, 0.5)
    a, b = L('r1', 'RADIOYO', "Me reí. Me faltaban doscientos kilómetros.", gap=0.9)
    S(static(0.5), b + 0.05, 0.45)
    L('h4', 'YOIN', "Esa era mi voz. En la radio.", gap=0.7)
    di = M('die', 0.4, adv=True); S(sfx_motor_die(2.2, 52.0), di, 0.9); S(sfx_flicker(1.2), di + 0.3, 0.5); W(2.2)
    M('stopped')
    L('h5', 'YOIN', "El motor se apagó solo. Justo frente al cartel. Kilómetro 233.", gap=0.4)
    kn = M('knock', 0.8, adv=True); S(sfx_tap(3, 0.42), kn, 1.0); W(1.7)
    L('m1', 'HOMBRE', "Buenas noches, amigo. ¿Me acerca? Voy acá nomás.", gap=0.1)
    sg_t = M('sting', 0.25, adv=True); S(sfx_sting(), sg_t, 0.9)
    ec_ = M('endcard', 1.2, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    cr = car(dur, [(0, 1.3), (1.6, 1.0), (mk['die'], 1.0), (mk['die'] + 0.3, 0.0), (dur, 0.0)], 113)
    ng = night(dur) * envelope(dur, [(0, 0), (mk['die'] + 1, 0), (mk['stopped'], 1.0), (dur, 0.8)])
    dr = drone(dur, 36.7, 340, 31)
    drg = envelope(dur, [(0, 0.8), (2.5, 0.2), (mk['glow'], 0.3), (mk['radio'], 0.7), (mk['die'], 0.6), (mk['stopped'], 0.3), (mk['knock'], 0.6), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur, (277.2, 293.7, 415.3), 41)
    sgg = envelope(dur, [(0, 0.8), (1.3, 0.0), (mk['glow'], 0.0), (mk['glow'] + 3, 0.6), (mk['radio'], 0.3), (mk['die'], 0.6), (mk['die'] + 0.3, 0), (mk['knock'], 0.0), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['stopped'], 76, 3.0)
    beds = [(0, cr, 1.0), (0, ng, 0.5), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['stopped'], hb, 0.7)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.1, 0.5); tl.marks['title'] = 1.5
    a, b = L('h1', 'YOIN', "No me moví. No hizo falta. La puerta se abrió sola.", gap=0.45)
    do = M('dooropen', -1.3); S(sfx_creak(1.3), do, 0.9)
    si = M('sit', 0.5, adv=True); S(sfx_slam(), si, 0.45); W(0.5)
    L('m1', 'HOMBREC', "Gracias. Hace treinta años que nadie frena.", gap=0.4)
    L('y1', 'YO', "Yo... yo no frené.", gap=0.55)
    L('m2', 'HOMBREC', "Ya sé. Por eso lo elegí.", gap=0.55)
    stt = M('start', 0.5, adv=True); S(sfx_riser(1.4), stt - 0.2, 0.35); W(1.0)
    L('m3', 'HOMBREC', "Maneje. Y no pare hasta que amanezca.", gap=0.2)
    M('drive', 0.3, adv=True)
    a, b = L('h2', 'YOIN', "Manejé toda la noche sin mirarlo. Cuando salió el sol, el asiento estaba vacío.", gap=0.5)
    sta = M('station', 1.4, adv=True); S(sfx_brake(1.3), sta - 1.6, 0.5); S(sfx_ding(1318.5, 2, 0.35), sta + 0.6, 0.5); W(1.0)
    L('p1', 'PLAYERO', "¿Viene por la 26? Esa ruta está cortada hace treinta años.", gap=0.3)
    W(0.5)
    L('p2', 'PLAYERO', "¿Y el señor del farol... no se baja?", gap=0.2)
    rv = M('reveal', 0.3, adv=True); S(sfx_sting(1.25), rv, 0.95)
    ec_ = M('endcard', 1.9, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos hubieras frenado?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    cr = car(dur, [(0, 0.0), (mk['start'], 0.0), (mk['start'] + 0.5, 0.5), (mk['drive'], 0.6), (mk['drive'] + 1.5, 1.0), (mk['station'] - 1.5, 1.0), (mk['station'] + 0.8, 0.25), (mk['reveal'], 0.2), (dur, 0.1)], 114)
    ng = night(dur, 115) * envelope(dur, [(0, 1.0), (mk['start'], 1.0), (mk['drive'] + 1, 0.2), (dur, 0.0)])
    dr = drone(dur, 36.7, 360, 32)
    drg = envelope(dur, [(0, 0.7), (mk['sit'], 0.9), (mk['start'], 0.7), (mk['drive'] + 4, 0.5), (mk['station'], 0.0), (mk['reveal'] - 2.5, 0.0), (mk['reveal'], 1.0), (dur, 0.55)])
    sg = strings(dur, (293.7, 311.1, 466.2), 42)
    sgg = envelope(dur, [(0, 0.4), (mk['sit'], 1.0), (mk['sit'] + 0.2, 0.2), (mk['start'], 0.6), (mk['drive'] + 3, 0.2), (mk['station'], 0.0), (mk['reveal'] - 2.2, 0.0), (mk['reveal'], 1.5), (mk['reveal'] + 0.15, 0)])
    hb = sfx_heart(mk['drive'], 78, 1.0)
    day = dur - mk['station']
    beds = [(0, cr, 1.0), (0, ng, 0.5), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (0, hb, 0.6),
            (mk['station'], fade(roomtone(day, 100, 116) + wind(day, 117, 500) * 0.5, 0.8, 0.3), 0.4)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

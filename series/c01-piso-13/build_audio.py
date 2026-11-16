#!/usr/bin/env python3
"""PISO 13 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':    ('es-UY-ValentinaNeural', '-1%',  '-2Hz',  'inner', 1.0,  'in'),
 'YO':      ('es-UY-ValentinaNeural', '+4%',  '+4Hz',  'room',  0.95, 'yo'),
 'YOSH':    ('es-UY-ValentinaNeural', '+12%', '+12Hz', 'room',  1.1,  'yo'),
 'ELLA':    ('es-UY-ValentinaNeural', '-12%', '-6Hz',  'far',   1.0,  'cosa'),
 'VECINO':  ('es-PY-MarioNeural',     '-12%', '-10Hz', 'room',  0.95, 'vecino'),
 'VECINOC': ('es-PY-MarioNeural',     '-16%', '-12Hz', 'close', 1.05, 'vecino'),
 'PORTERO': ('es-AR-TomasNeural',     '+0%',  '+0Hz',  'pa',    0.75, 'portero'),
 'PORTERO2':('es-AR-TomasNeural',     '-4%',  '+0Hz',  'store', 0.9,  'portero'),
})

def sfx_slide(d=1.3):
    t = np.arange(int(d * SR)) / SR
    y = bp(noise(d), 200, 1800) * np.sin(np.pi * t / d) ** 1.5 * 0.5 + tone(90, d) * 0.15 * np.sin(np.pi * t / d)
    c = sfx_clunk(0.6)[:, 0]; o = np.zeros(len(y) + len(c)); o[:len(y)] += y; o[len(y) - 3000:len(y) - 3000 + len(c)] += c * 0.6
    return reverb(o, 0.6, 0.25, seed=95)
def lift(dur, pts):
    return (engine(dur, 58.0, 96, rough=0.25) * 0.8 + roomtone(dur, 100, 97) * 1.5) * envelope(dur, pts)
def bad_ding():
    a = sfx_ding(1318.5, 1, g=0.4)[:, 0]; b = pitch_layer(a, 0.71)
    return reverb(a * 0.5 + b * 0.9, 2.2, 0.5, dark=3000, seed=98)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_ding(1568, 1), 0.05, 0.7)
    L('h1', 'YOIN', "Mi edificio tiene doce pisos. Anoche, el ascensor me llevó al trece.", gap=0.45)
    M('title')
    a, b = L('h2', 'YOIN', "Llegué a las tres de la mañana. Apreté el doce. Como siempre.", gap=0.6)
    tl.marks['press'] = round(a + 2.5, 3); S(sfx_click(), a + 2.5, 1.0); S(sfx_beep(1400, 0.1), a + 2.55, 0.5)
    M('go', 0.1, adv=True); W(1.1)
    s5 = M('stop5'); S(sfx_ding(1568, 1), s5, 0.6); o5 = M('open5', 0.5, adv=True); S(sfx_slide(1.2), o5, 0.8)
    L('h3', 'YOIN', "En el quinto subió don Aurelio, el del 502. No saludó.", gap=0.6)
    c5 = M('close5', 0.1); S(sfx_slide(1.1), c5, 0.7)
    L('y1', 'YO', "Buenas noches.", gap=0.5)
    W(0.6)
    L('h4', 'YOIN', "Diez. Once. Doce... y no paró.", gap=0.1)
    th = M('thirteen', 0.3, adv=True); S(sfx_clunk(1.0), th, 0.8); S(sfx_riser(2.4), th + 0.2, 0.4)
    L('h5', 'YOIN', "En el tablero se prendió un botón que nunca había visto.", gap=0.45)
    o13 = M('open13', 0.4, adv=True); S(bad_ding(), o13, 0.8); S(sfx_slide(1.5), o13 + 0.6, 0.8); W(1.2)
    L('h6', 'YOIN', "El pasillo era igual al mío. Y la puerta de mi apartamento estaba abierta.", gap=0.2)
    L('e1', 'ELLA', "¿Hola? ¿Quién anda ahí?", gap=0.6)
    L('h7', 'YOIN', "Era mi voz.", gap=0.45)
    L('v1', 'VECINO', "No conteste. Y no salga.", gap=0.4)
    sh = M('shadow', 0.3, adv=True)
    L('e2', 'ELLA', "Dale, entrá. Te estaba esperando.", gap=0.3)
    sg_t = M('sting', 0.15, adv=True); S(sfx_sting(), sg_t, 0.9)
    ec_ = M('endcard', 0.9, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    lf = lift(dur, [(0, 0.2), (mk['go'], 0.2), (mk['go'] + 0.5, 1.0), (mk['stop5'], 1.0), (mk['stop5'] + 0.4, 0.2), (mk['close5'] + 1, 0.2), (mk['close5'] + 1.6, 1.0), (mk['open13'], 1.0), (mk['open13'] + 0.5, 0.15), (dur, 0.15)])
    dr = drone(dur)
    drg = envelope(dur, [(0, 0.0), (mk['open5'], 0.0), (mk['close5'], 0.3), (mk['thirteen'], 0.6), (mk['open13'], 0.8), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur); sgg = envelope(dur, [(0, 0), (mk['thirteen'], 0), (mk['open13'], 0.5), (mk['open13'] + 1.5, 0.25), (mk['shadow'], 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hb = sfx_heart(mk['endcard'] - mk['open13'], 74, 2.5)
    beds = [(0, lf, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['open13'], hb, 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    for i in range(7): S(sfx_click(), 0.25 + i * 0.27, 0.9)
    L('h1', 'YOIN', "No salí. Apreté planta baja hasta que me dolió el dedo.", gap=0.5)
    M('title', -2.2)
    cl_ = M('close', 0.2, adv=True); S(sfx_slide(1.4), cl_, 0.8); W(1.3)
    M('go')
    a, b = L('h2', 'YOIN', "El ascensor empezó a bajar. Pero el número no cambiaba. Trece. Trece. Trece.", gap=0.2)
    ib = M('interbuzz', 0.45, adv=True); S(sfx_buzz(1.2), ib, 0.8); S(static(0.5), ib + 1.0, 0.3)
    L('p1', 'PORTERO', "¿Hola? Portería. ¿Se quedó trancada, señorita?", gap=1.45)
    L('y1', 'YOSH', "¡Sí! Estoy en el trece, con don Aurelio.", gap=0.3)
    W(0.7)
    L('p2', 'PORTERO', "Señorita... el edificio no tiene piso trece.", gap=0.1)
    L('p3', 'PORTERO', "Y el 502 está vacío hace veinte años.", gap=0.45)
    ct = M('cut', 0.2, adv=True); S(static(0.9), ct, 0.5); S(sfx_click(), ct + 0.9, 0.8); W(1.2)
    tr = M('turn')
    a, b = L('h3', 'YOIN', "Miré el espejo del ascensor. Estaba yo... Sola.", gap=0.9)
    sg_t = M('sting', 0.1, adv=True); S(sfx_sting(), sg_t, 0.9); W(1.6)
    L('v1', 'VECINOC', "No se dé vuelta.", gap=0.0)
    ec_ = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    lf = lift(dur, [(0, 0.15), (mk['go'], 0.15), (mk['go'] + 0.6, 1.0), (mk['cut'], 1.0), (mk['turn'], 0.6), (dur, 0.5)])
    dr = drone(dur, 36.7, 340, 31)
    drg = envelope(dur, [(0, 0.7), (mk['close'], 0.5), (mk['interbuzz'], 0.35), (mk['cut'], 0.6), (mk['sting'], 1.0), (dur, 0.6)])
    sg = strings(dur, (277.2, 293.7, 415.3), 41)
    sgg = envelope(dur, [(0, 0.4), (mk['close'], 0.0), (mk['interbuzz'], 0.0), (mk['cut'], 0.4), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0), (mk['endcard'] - 0.8, 0.5), (mk['endcard'] + 0.3, 0)])
    hb = sfx_heart(mk['endcard'] - mk['cut'], 78, 3.0)
    beds = [(0, lf, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (mk['cut'], hb, 0.7)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.1, 0.5); tl.marks['title'] = 1.6
    L('h1', 'YOIN', "No me di vuelta. Lo busqué en el espejo. Y atrás mío... no había nadie.", gap=0.45)
    L('v1', 'VECINOC', "Yo también apreté planta baja. En mil novecientos ochenta y siete.", gap=0.7)
    L('v2', 'VECINOC', "Este ascensor no baja lleno. Uno de los dos se queda en el trece.", gap=0.5)
    o13 = M('open13', 0.4, adv=True); S(bad_ding(), o13, 0.7); S(sfx_slide(1.4), o13 + 0.5, 0.8); W(1.3)
    L('h2', 'YOIN', "Las puertas se abrieron atrás mío.", gap=0.2)
    L('v3', 'VECINOC', "Tranquila. A mí ya me tocaba.", gap=0.6)
    stp = M('steps', 0.3, adv=True); S(sfx_steps(2.0, 1.6), stp, 0.7); W(1.6)
    cl_ = M('close'); S(sfx_slide(1.3), cl_, 0.8); W(0.9)
    dn = M('down')
    L('h3', 'YOIN', "Y el ascensor, por fin, bajó.", gap=0.3)
    W(0.8)
    pb = M('pb'); S(sfx_ding(1568, 1), pb, 0.7); op = M('openpb', 0.5, adv=True); S(sfx_slide(1.3), op, 0.7)
    L('h4', 'YOIN', "Planta baja. Ya era de día.", gap=0.9)
    L('y1', 'YOSH', "¡Estuve trancada toda la noche!", gap=0.5)
    W(0.6)
    L('p1', 'PORTERO2', "Qué raro... otra vez se abre solo.", gap=0.0)
    mr = M('mirror', 0.4, adv=True); S(sfx_riser(2.6), mr + 0.3, 0.45)
    L('h5', 'YOIN', "Pasé frente al espejo del hall. Estaba el portero. Yo no.", gap=0.6)
    sg_t = M('sting', 0.15, adv=True); S(sfx_sting(1.2), sg_t, 0.95)
    ec_ = M('endcard', 1.4, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos hubieras salido en el trece?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    lf = lift(dur, [(0, 0.6), (mk['open13'], 0.6), (mk['open13'] + 0.5, 0.15), (mk['down'], 0.15), (mk['down'] + 0.5, 1.0), (mk['pb'], 1.0), (mk['pb'] + 0.4, 0.1), (dur, 0.05)])
    dr = drone(dur, 36.7, 360, 32)
    drg = envelope(dur, [(0, 0.7), (mk['open13'], 0.9), (mk['close'], 0.9), (mk['down'], 0.4), (mk['openpb'], 0.2), (mk['openpb'] + 0.6, 0.0), (mk['mirror'], 0.0), (mk['sting'], 1.0), (dur, 0.55)])
    sg = strings(dur, (293.7, 311.1, 466.2), 42)
    sgg = envelope(dur, [(0, 0.4), (mk['open13'], 0.9), (mk['steps'], 0.6), (mk['close'] + 1, 0.0), (mk['mirror'], 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    day = dur - mk['openpb']
    beds = [(0, lf, 1.0), (0, dr * drg, 1.0), (0, sg * sgg, 1.0), (0, sfx_heart(mk['close'], 76, 1.5), 0.6),
            (mk['openpb'], fade(crowd(day, 72) * 0.6 + roomtone(day, 100, 64), 0.8, 0.3) * envelope(day, [(0, 1), (mk['mirror'] - mk['openpb'], 1), (mk['sting'] - mk['openpb'], 0.2), (day, 0.1)]), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

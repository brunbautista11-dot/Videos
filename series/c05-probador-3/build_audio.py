#!/usr/bin/env python3
"""PROBADOR 3 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':  ('es-UY-ValentinaNeural', '-4%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':    ('es-UY-ValentinaNeural', '+2%',  '+1Hz',  'store',   0.95, 'yo'),
 'PROB':  ('es-AR-ElenaNeural',     '-14%', '-10Hz', 'door',    1.05, 'cosa'),
 'DOBLE': ('es-UY-ValentinaNeural', '-14%', '-8Hz',  'door',    1.05, 'cosa'),
 'DOBLEC':('es-UY-ValentinaNeural', '-16%', '-10Hz', 'far',     1.1,  'cosa'),
 'RAM':   ('es-UY-MateoNeural',     '+0%',  '-2Hz',  'radio',   0.95, 'ram'),
 'RAMV':  ('es-UY-MateoNeural',     '+6%',  '+2Hz',  'store',   0.95, 'ramv'),
 'ENC':   ('es-PY-TaniaNeural',     '-6%',  '-4Hz',  'room',    0.95, 'enc'),
})

def hanger(seed=211):
    r = np.random.default_rng(seed); o = np.zeros((int(0.5 * SR), 2))
    for i in range(3):
        k = tone(r.uniform(2600, 3600), 0.25, 0.04) * 0.15; s = int(i * 0.06 * SR); o[s:s + len(k)] += st(k)
    return reverb(o, 0.6, 0.2, seed=seed)
def curtain(d=0.9, seed=212):
    t = np.arange(int(d * SR)) / SR
    y = bp(noise(d), 1200, 6000) * np.sin(np.pi * t / d) ** 2 * 0.35 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t)))
    return reverb(y, 0.5, 0.15, seed=seed)
def chirp():
    a = sfx_beep(1800, 0.08, 0.25); b = static(0.25) * 0.4
    o = np.zeros((len(b), 2)); o += b; o[:len(a)] += a
    return o

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(hanger(), 0.2, 0.5)
    L('h1', 'YOIN', "El shopping ya había cerrado. Yo estaba sola en el local. Y en el probador tres había alguien.", gap=0.35)
    tl.marks['title'] = 3.6
    fb = M('fb', 0.4, adv=True); S(sfx_shutter(2.0), fb - 0.1, 0.45)
    L('h2', 'YOIN', "Trabajo en una tienda de ropa. A las diez bajo la persiana y cuento la caja. Esa noche bajé la persiana con el local vacío. Estaba segura.", gap=0.3)
    sh = M('shoes', 0.5, adv=True); S(sfx_creak(0.8), sh, 0.25)
    L('h3', 'YOIN', "Pero debajo de la cortina había unos zapatos. De mujer. Viejos. Quietos.", gap=0.3)
    L('y1', 'YO', "Disculpá... ya cerramos.", gap=0.4)
    L('c1', 'PROB', "Ya salgo. ¿Me alcanzás un talle más chico?", gap=0.6)
    L('h4', 'YOIN', "Le pregunté qué prenda se estaba probando. Y me contestó:", gap=0.4)
    cl_ = M('close', 0.3, adv=True); S(curtain(0.6), cl_, 0.4)
    L('c2', 'PROB', "La tuya. La que tenés puesta.", gap=0.5)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    room = roomtone(dur, 50, 213)
    dr = drone(dur, 34.6, 360, 214)
    drg = envelope(dur, [(0, 0.6), (mk['fb'], 0.3), (mk['shoes'], 0.8), (mk['close'], 1.0), (mk['sting'], 1.2), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 215)
    sgg = envelope(dur, [(0, 0), (mk['shoes'], 0), (mk['close'], 0.7), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, room, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['shoes'], sfx_heart(dur - mk['shoes'], 72, 2.5), 0.55)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(chirp(), 0.5, 0.5)
    L('h1', 'YOIN', "Llamé a seguridad por el handy. Sin sacarle los ojos de encima a la cortina.", gap=0.3)
    tl.marks['title'] = 1.0
    S(chirp(), tl.t + 0.2, 0.5)
    L('r1', 'RAM', "Ramiro, seguridad. ¿Qué pasa, Vale?", gap=0.4)
    L('y1', 'YO', "Hay una mujer en el probador tres. No sé cómo entró.", gap=0.3)
    S(chirp(), tl.t + 0.1, 0.4)
    L('r2', 'RAM', "Te estoy mirando por la cámara. Estás sola en el local.", gap=0.3)
    mr = M('mirror', 0.6, adv=True); S(sfx_riser(2.0), mr - 0.5, 0.3)
    L('h2', 'YOIN', "Miré el espejo grande. En el reflejo, la cortina del probador tres estaba abierta. Y adentro estaba yo. Mirándome.", gap=0.2)
    L('d1', 'DOBLE', "Vale. Vení. Probátela vos.", gap=0.6)
    S(chirp(), tl.t + 0.2, 0.4)
    L('r3', 'RAM', "Vale... ahora en la cámara hay dos. ¿Cuál sos vos? Levantá la mano.", gap=0.4)
    sg = M('sting', 0.5, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 32.7, 340, 216)
    drg = envelope(dur, [(0, 0.7), (mk['mirror'], 1.0), (mk['sting'] - 3, 0.9), (mk['sting'], 1.2), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 217)
    sgg = envelope(dur, [(0, 0.2), (mk['mirror'], 0.7), (mk['sting'] - 2, 0.6), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, roomtone(dur, 50, 218), 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 86, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    tl.marks['title'] = 1.4
    S(sfx_steps(1.6, 6.0), 0.2, 0.8); S(sfx_shutter(1.2), 1.4, 0.6)
    L('h1', 'YOIN', "Corrí a la persiana. La levanté hasta la mitad y me tiré al piso del shopping.", gap=0.3)
    dn = M('down', 0.4, adv=True); S(sfx_shutter(3.0), dn, 0.6)
    L('h2', 'YOIN', "Del otro lado, la persiana empezó a bajar sola.", gap=0.4)
    L('d1', 'DOBLEC', "Vale... no me dejes acá adentro.", gap=0.5)
    S(sfx_steps(2.0, 6.5), tl.t + 0.2, 0.6)
    L('r1', 'RAMV', "¡Vale! ¿Estás bien?", gap=1.0)
    L('h3', 'YOIN', "Ramiro llegó corriendo. Alumbramos por la persiana. El local estaba vacío.", gap=0.3)
    dy = M('day', 0.6, adv=True); S(sfx_whoosh(0.8), dy - 0.2, 0.5)
    L('h4', 'YOIN', "Al otro día, la encargada sacó una bolsa del probador tres. Ropa vieja, de otra época. Toda de mi talle.", gap=0.3)
    L('e1', 'ENC', "Esto aparece cada tanto. Siempre del talle de la chica nueva.", gap=0.4)
    nt = M('night', 0.6, adv=True); S(sfx_whoosh(0.8), nt - 0.2, 0.5)
    L('h5', 'YOIN', "Esa noche, al cerrar, había un cartelito colgado en la cortina del probador tres. Decía: Reservado. Vale.", gap=0.3)
    sg = M('sting', 0.4, adv=True); S(curtain(0.7), sg - 0.5, 0.5); S(sfx_sting(0.9), sg, 0.85)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos hubieras levantado la mano?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    mall = roomtone(dur, 60, 219) * envelope(dur, [(0, 1), (mk['day'], 1), (mk['day'] + .1, 0), (dur, 0)])
    day = muzak(dur, 220) * envelope(dur, [(0, 0), (mk['day'], 0), (mk['day'] + .2, .5), (mk['night'], .5), (mk['night'] + .1, 0), (dur, 0)])
    room = roomtone(dur, 50, 221) * envelope(dur, [(0, 0), (mk['night'], 0), (mk['night'] + .1, 1), (dur, 1)])
    dr = drone(dur, 36.7, 340, 222)
    drg = envelope(dur, [(0, 0.9), (mk['down'], 1.0), (mk['day'] - 1, 0.6), (mk['day'], 0.1), (mk['night'], 0.6), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 223)
    sgg = envelope(dur, [(0, 0.5), (mk['down'] + 2, 0.9), (mk['day'] - 1, 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    beds = [(0, mall, 1.0), (0, day, 1.0), (0, room, 0.8), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(mk['day'], 104, 1.0), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

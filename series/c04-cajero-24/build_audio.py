#!/usr/bin/env python3
"""CAJERO 24 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':  ('es-AR-TomasNeural',  '-4%',  '-3Hz',  'inner',   1.0,  'in'),
 'YO':    ('es-AR-TomasNeural',  '+2%',  '+2Hz',  'store',   0.95, 'yo'),
 'COSA':  ('es-PY-MarioNeural',  '-14%', '-10Hz', 'door',    1.05, 'cosa'),
 'FFEDE': ('es-UY-MateoNeural',  '-10%', '-6Hz',  'door',    1.05, 'cosa'),
 'FEDE':  ('es-UY-MateoNeural',  '+4%',  '+2Hz',  'radio',   0.95, 'tel'),
 'KIOSK': ('es-AR-ElenaNeural',  '-4%',  '-4Hz',  'room',    0.95, 'kio'),
})

def street(dur, seed=91):
    return wind(dur, seed, 380) * 0.9 + roomtone(dur, 100, seed + 1) * 1.1
def hum(dur, seed=92):  # fluorescent tube + ATM fan
    t = np.arange(int(dur * SR)) / SR
    y = np.sin(2 * np.pi * 120 * t) * 0.03 + np.sin(2 * np.pi * 240 * t) * 0.012 + bp(noise(dur), 2000, 6000) * 0.012
    return st(y) + lp(np.random.default_rng(seed).standard_normal((len(t), 2)), 300) * 0.08
def keys(n=4, gap=0.22):
    o = np.zeros(int((n * gap + 0.4) * SR))
    for i in range(n):
        k = sfx_beep(1450, 0.07, 0.25)[:, 0]; s = int(i * gap * SR); o[s:s + len(k)] += k
    return st(o)
def printer(d=1.8):
    t = np.arange(int(d * SR)) / SR
    y = bp(noise(d), 800, 5000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * t))) * 0.35 + signal.sawtooth(2 * np.pi * 180 * t) * 0.05
    return reverb(fade(y, 0.02, 0.1), 0.5, 0.2, seed=93)
def lock(g=1.0):
    c = sfx_clunk(g); k = sfx_click(); s0 = int(0.1 * SR); c[s0:s0 + len(k)] += k * 0.6
    return c
def ringtone(d=2.6):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 1318 * t) * 0.5 + np.sin(2 * np.pi * 1760 * t) * 0.3) * ((t % 0.5) < 0.25) * ((t % 1.6) < 1.0)
    return reverb(fade(y * 0.25, 0.01, 0.1), 0.4, 0.15, seed=94)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(lock(1.0), 0.25, 0.9)
    L('h1', 'YOIN', "A las tres menos diez entré a un cajero automático. Y la puerta de vidrio se trabó detrás mío.", gap=0.4)
    M('title', -2.2)
    at = M('atm', 0.4, adv=True); S(sfx_whoosh(0.7), at - 0.3, 0.4)
    L('h2', 'YOIN', "Volvía de un cumpleaños. Solo quería sacar plata para el taxi. Metí la tarjeta.", gap=0.2)
    cd = M('card', 0.1, adv=True); S(sfx_click(), cd, 0.6); S(sfx_beep(1450, 0.12, 0.3), cd + 0.5, 0.6)
    W(0.9); M('hola', 0.0)
    L('h3', 'YOIN', "La pantalla no decía bienvenido. Decía: Hola, Matías.", gap=0.1)
    nt = M('noturn', 0.6, adv=True); S(sfx_beep(700, 0.25, 0.35), nt, 0.7)
    L('h4', 'YOIN', "Después apareció otro mensaje. No te des vuelta.", gap=0.2)
    lk = M('look', 0.5, adv=True); S(sfx_riser(2.4), lk, 0.3)
    L('h5', 'YOIN', "De reojo lo vi. Afuera, pegado al vidrio, había alguien parado. Quieto.", gap=0.3)
    S(sfx_tap(3, 0.5, 0.9), tl.t + 0.2, 0.8); W(1.4)
    L('c1', 'COSA', "Abrime. Hace mucho frío acá afuera.", gap=0.2)
    bt = M('buttons', 0.5, adv=True); S(sfx_beep(900, 0.1, 0.3), bt, 0.6); S(sfx_beep(900, 0.1, 0.3), bt + 0.18, 0.6)
    L('h6', 'YOIN', "Y en la pantalla aparecieron dos botones.", gap=0.2)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95); S(sfx_tap(4, 0.18, 1.2), sg + 0.05, 1.0)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 34.6, 360, 60)
    drg = envelope(dur, [(0, 0.5), (mk['atm'], 0.3), (mk['hola'], 0.7), (mk['look'], 1.0), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 61)
    sgg = envelope(dur, [(0, 0), (mk['noturn'], 0), (mk['look'] + 2, 0.7), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, street(dur), 0.7), (0, hum(dur), 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['hola'], sfx_heart(dur - mk['hola'], 72, 2.5), 0.6)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_beep(900, 0.1, 0.3), 0.15, 0.6)
    L('h1', 'YOIN', "Apreté cancelar. Y se apagaron todas las luces del cajero.", gap=0.3)
    M('title', -1.6)
    of = tl.marks['off'] = round(tl.t - 1.4, 3); S(sfx_clunk(0.9), of, 0.7)
    L('h2', 'YOIN', "Solo quedó la pantalla. Quedate adentro hasta las tres.", gap=0.4)
    kn = M('knock', 0.5, adv=True); S(sfx_tap(3, 0.45, 1.0), kn, 0.9); W(1.3)
    L('f1', 'FFEDE', "Mati, soy yo, Fede. Dale, abrime, loco.", gap=0.1)
    L('h3', 'YOIN', "Era la voz de Fede. Pero Fede se había quedado en el cumpleaños.", gap=0.4)
    rg = M('ring', 0.4, adv=True); S(ringtone(2.4), rg, 0.6); W(1.5)
    L('e1', 'FEDE', "Mati, ¿dónde estás? Te fuiste sin saludar.", gap=0.2)
    L('y1', 'YO', "Fede... ¿vos estás afuera del cajero?", gap=0.3)
    L('e2', 'FEDE', "¿Qué cajero? Estoy acá, en lo de Juan.", gap=0.3)
    S(static(0.4), tl.t + 0.05, 0.4)
    ct = M('count', 0.6, adv=True); S(sfx_beep(700, 0.2, 0.3), ct, 0.6)
    L('f2', 'FFEDE', "Mati. Abrime. O la próxima vez no te aviso.", gap=0.4)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95); S(sfx_tap(5, 0.14, 1.3), sg, 1.0)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 32.7, 340, 62)
    drg = envelope(dur, [(0, 0.7), (mk['off'], 1.0), (mk['ring'], 0.4), (mk['count'], 0.9), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 63)
    sgg = envelope(dur, [(0, 0.2), (mk['knock'], 0.7), (mk['ring'], 0.0), (mk['count'], 0.5), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    hm = hum(dur) * envelope(dur, [(0, 1), (mk['off'], 1), (mk['off'] + 0.05, 0.25), (dur, 0.25)])
    beds = [(0, street(dur, 95), 0.7), (0, hm, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 84, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.05, 0.5); tl.marks['title'] = 1.4
    L('h1', 'YOIN', "Esperé. Me senté en el piso, mirando el reloj de la pantalla.", gap=0.3)
    fg = M('fog', 0.4, adv=True); S(sfx_hiss(1.4), fg, 0.25)
    L('h2', 'YOIN', "El vidrio se empañó. Y desde afuera, con un dedo, alguien escribió: Te espero.", gap=0.2)
    th = M('three', 0.6, adv=True); S(sfx_beep(1450, 0.3, 0.35), th, 0.7); S(lock(0.8), th + 1.6, 0.7)
    L('h3', 'YOIN', "A las tres en punto, la pantalla dijo: Ya se fue. La puerta hizo clic.", gap=0.3)
    pr = M('print', 0.4, adv=True); S(printer(1.8), pr, 0.7)
    L('h4', 'YOIN', "El cajero me dio un comprobante. Yo no había sacado plata.", gap=0.3)
    W(1.6)
    dy = M('day', 0.5, adv=True); S(sfx_whoosh(0.8), dy - 0.2, 0.5)
    L('h5', 'YOIN', "Al otro día volví. El cajero estaba tapiado.", gap=0.3)
    L('k1', 'KIOSK', "¿Ese cajero? No anda desde hace años, mijo. Nadie entra ahí.", gap=0.3)
    nt = M('night', 0.5, adv=True); S(sfx_whoosh(0.8), nt - 0.2, 0.5)
    L('h6', 'YOIN', "Esa noche, a las tres menos diez, me llegó un mensaje.", gap=0.3)
    sg = M('sting', 0.3, adv=True); S(sfx_buzz(1.2), sg - 0.1, 0.7); S(sfx_sting(1.0), sg + 0.1, 0.9)
    L('h7', 'YOIN', "Hola, Matías. Te espero.", gap=0.5)
    ec = M('endcard', 1.0, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos le hubieras abierto la puerta?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    dr = drone(dur, 36.7, 340, 64)
    drg = envelope(dur, [(0, 0.8), (mk['fog'], 1.0), (mk['three'], 0.5), (mk['day'], 0.15), (mk['night'], 0.6), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 65)
    sgg = envelope(dur, [(0, 0.3), (mk['fog'], 0.8), (mk['three'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 66) * envelope(dur, [(0, 0), (mk['day'], 0), (mk['day'] + 1.0, 0.4), (mk['night'] - 0.3, 0)])
    hm = hum(dur) * envelope(dur, [(0, .25), (mk['three'] + 1.6, .25), (mk['three'] + 1.7, 1), (mk['day'] - .2, 1), (mk['day'], 0), (dur, 0)])
    day = (crowd(dur, 67) * 0.4 + wind(dur, 68, 900) * 0.5) * envelope(dur, [(0, 0), (mk['day'], 0), (mk['day'] + .1, 1), (mk['night'], 1), (mk['night'] + .1, 0)])
    beds = [(0, street(dur, 96) * envelope(dur, [(0, 1), (mk['day'], 1), (mk['day'] + .1, 0), (mk['night'], 0), (mk['night'] + .1, 1)]), 0.7), (0, hm, 1.0), (0, day, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['three'], 88, 1.0), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

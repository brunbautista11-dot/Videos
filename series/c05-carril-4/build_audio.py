#!/usr/bin/env python3
"""CARRIL 4 — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':  ('es-UY-ValentinaNeural', '-4%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':    ('es-UY-ValentinaNeural', '+4%',  '+2Hz',  'far',     0.9,  'yo'),
 'AGUA':  ('es-PY-MarioNeural',     '-16%', '-12Hz', 'door',    1.05, 'cosa'),
 'AGUAF': ('es-PY-MarioNeural',     '-18%', '-12Hz', 'far',     1.1,  'cosa'),
 'AGUAC': ('es-PY-MarioNeural',     '-18%', '-12Hz', 'close',   1.1,  'cosa'),
 'HUGOT': ('es-AR-TomasNeural',     '-4%',  '-6Hz',  'radio',   0.95, 'tel'),
 'HUGO':  ('es-AR-TomasNeural',     '-8%',  '-8Hz',  'room',    0.95, 'hugo'),
})

def hall(x, seed=401): return reverb(x, 2.6, 0.5, pre=0.03, dark=3000, seed=seed)
def stroke(g=1.0, seed=402):
    r = np.random.default_rng(seed); d = 0.7; t = np.arange(int(d * SR)) / SR
    y = bp(r.standard_normal(len(t)), 250, 2600) * np.exp(-((t - 0.18) / 0.12) ** 2) * 0.7
    y += bp(r.standard_normal(len(t)), 800, 5000) * np.exp(-((t - 0.32) / 0.08) ** 2) * 0.3
    return y * g
def laps(d, gap=0.62, seed=403, pan0=.3, pan1=.7):
    o = np.zeros((int((d + 1) * SR), 2)); t = 0.0; i = 0
    while t < d:
        s = stroke(0.9 + 0.2 * (i % 2), seed + i); pan = pan0 + (pan1 - pan0) * (0.5 + 0.5 * np.sin(t * 0.5))
        a = int(t * SR); o[a:a + len(s), 0] += s * (1 - pan); o[a:a + len(s), 1] += s * pan; t += gap; i += 1
    return hall(o, seed)[:int(d * SR)]
def drip(d, seed=404):
    r = np.random.default_rng(seed); o = np.zeros(int(d * SR)); t = 0.3
    while t < d - 0.3:
        k = tone(r.uniform(900, 1700), 0.12, 0.02) * 0.2; s = int(t * SR); o[s:s + len(k)] += k; t += r.uniform(0.7, 2.2)
    return hall(o, seed)[:int(d * SR)]
def whistle():
    t = np.arange(int(0.9 * SR)) / SR
    y = np.sin(2 * np.pi * (2900 + 120 * np.sin(2 * np.pi * 34 * t)) * t) * 0.18 * np.minimum(1, t / 0.02) * (t < 0.75)
    return hall(fade(y, 0.01, 0.1), 405)
def switch(): return hall(sfx_click(), 406)
def ripple(d=2.0, seed=408):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    return hall(lp(r.standard_normal(len(t)), 600) * np.exp(-t / 0.6) * 0.5, seed)
def bubbles(d=3.0, seed=409):
    r = np.random.default_rng(seed); o = np.zeros(int(d * SR)); t = 0.1
    while t < d - 0.2:
        n = int(0.05 * SR); tt = np.arange(n) / SR; f = r.uniform(300, 700) * (1 + tt * 18)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.02) * 0.25; s = int(t * SR); o[s:s + n] += y; t += r.uniform(0.06, 0.3)
    return reverb(lp(o, 2500), 0.6, 0.2, seed=seed)
def showers(d, seed=410):
    r = np.random.default_rng(seed); return reverb(bp(r.standard_normal((int(d * SR), 2)), 1500, 9000) * 0.25, 1.0, 0.3, seed=seed)[:int(d * SR)]
def rain(d, seed=411):
    r = np.random.default_rng(seed); y = bp(r.standard_normal((int(d * SR), 2)), 800, 7000) * 0.3
    return y + lp(r.standard_normal((int(d * SR), 2)), 300) * 0.4
def ringf(d=1.8):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 425 * t)) * 0.16 * ((t % 1.2) < 0.6)
    return st(lp(y, 3000))

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    L('h1', 'YOIN', "A las once de la noche, cerrando la piscina, escuché a alguien nadando. En el carril cuatro. Y yo ya había apagado las luces.", gap=0.3)
    tl.marks['title'] = 4.0
    L('h2', 'YOIN', "Soy guardavidas en una piscina climatizada. El último turno lo cierro sola.", gap=0.4)
    on = M('on', 0.4, adv=True); S(sfx_clunk(0.7), on, 0.6); S(sfx_flicker(1.2), on, 0.3)
    L('h3', 'YOIN', "Prendí todo. El agua estaba quieta. No había nadie.", gap=0.5)
    S(whistle(), tl.t + 0.2, 0.6)
    L('y1', 'YO', "¿Hola? ¡La piscina está cerrada!", gap=1.0)
    of = M('off', 0.5, adv=True); S(sfx_clunk(0.6), of, 0.6)
    L('h4', 'YOIN', "Apagué otra vez. Y otra vez, en la oscuridad: brazadas. Ida y vuelta. Carril cuatro.", gap=0.7)
    hd = M('hand', 0.4, adv=True); S(ripple(1.5), hd - 0.2, 0.7)
    L('h5', 'YOIN', "Algo se agarró del borde. Justo a mis pies.", gap=0.3)
    L('c1', 'AGUA', "Lucía... metete. El agua está calentita.", gap=0.7)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    lp1 = laps(dur, seed=412) * envelope(dur, [(0, 1), (mk['on'] - 0.1, 1), (mk['on'], 0), (mk['off'] + 0.3, 0), (mk['off'] + 1.0, 1), (mk['hand'] - 0.3, 1), (mk['hand'], 0), (dur, 0)])
    room = roomtone(dur, 100, 413) * 0.6 + drip(dur, 414) * 0.8
    dr = drone(dur, 34.6, 360, 415)
    drg = envelope(dur, [(0, 0.7), (mk['on'], 0.3), (mk['off'], 0.8), (mk['hand'], 1.0), (mk['sting'], 1.2), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 416)
    sgg = envelope(dur, [(0, 0), (mk['off'], 0), (mk['hand'], 0.8), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, lp1, 1.0), (0, room, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['off'], sfx_heart(dur - mk['off'], 74, 2.5), 0.55)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_steps(2.0, 2.6), 0.3, 0.5)
    L('h1', 'YOIN', "Me alejé del borde. Despacio. Hasta tocar la pared.", gap=0.3)
    tl.marks['title'] = 1.2
    sk = M('sink', 0.3, adv=True); S(ripple(1.2, 417), sk, 0.5)
    L('h2', 'YOIN', "La mano se soltó. Y se hundió sin hacer ruido.", gap=0.1)
    cl_ = M('call', 0.5, adv=True)
    L('h3', 'YOIN', "Llamé a Hugo, el encargado de día.", gap=0.1); S(ringf(1.8), tl.t + 0.1, 0.5); W(1.7)
    L('g1', 'HUGOT', "¿Lucía? ¿Seguís ahí? ¿No vaciaste el carril cuatro?", gap=0.2)
    L('y1', 'YO', "¿Vaciarlo? ¿Por qué?", gap=0.3)
    L('g2', 'HUGOT', "Ese carril de noche no se usa. Nunca. No te acerques al borde. Salí por el vestuario.", gap=0.3)
    S(static(0.4), tl.t + 0.05, 0.4)
    lt = M('lights', 0.6, adv=True); S(sfx_clunk(0.8), lt, 0.7); S(sfx_buzz(1.4), lt + 0.1, 0.3)
    L('h4', 'YOIN', "Entonces se prendieron solas las luces del agua. Solo las del carril cuatro. Y en el fondo había alguien acostado. Mirándome.", gap=0.4)
    S(bubbles(2.0), tl.t, 0.5)
    L('c1', 'AGUAF', "¿Por qué no te metés, Lucía? Todos se meten.", gap=0.8)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    room = roomtone(dur, 100, 418) * 0.6 + drip(dur, 419) * 0.8
    dr = drone(dur, 32.7, 340, 420)
    drg = envelope(dur, [(0, 0.8), (mk['call'], 0.4), (mk['lights'], 1.0), (mk['sting'], 1.2), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 421)
    sgg = envelope(dur, [(0, 0.3), (mk['call'], 0.0), (mk['lights'], 0.7), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, room, 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 86, 2.0), 0.5)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    tl.marks['title'] = 1.4
    S(sfx_steps(3.0, 3.2), 0.2, 0.6)
    L('h1', 'YOIN', "Fui al vestuario. Como dijo Hugo. Sin mirar el agua.", gap=0.3)
    vs = M('locker', 0.4, adv=True); S(sfx_creak(1.0), vs - 0.2, 0.4)
    L('h2', 'YOIN', "Adentro, todas las duchas estaban abiertas. Y en el piso había huellas mojadas. Que venían detrás mío.", gap=0.3)
    L('c1', 'AGUAC', "Te mojaste, Lucía.", gap=0.6)
    L('h3', 'YOIN', "No me di vuelta. Empujé la puerta de emergencia y salí a la calle.", gap=0.4)
    out = M('out', 0.3, adv=True); S(sfx_slam(), out, 0.6)
    L('h4', 'YOIN', "Afuera llovía. Y por primera vez en toda la noche, no escuché brazadas.", gap=0.4)
    dy = M('day', 0.6, adv=True); S(sfx_whoosh(0.8), dy - 0.2, 0.5)
    L('g1', 'HUGO', "El día que se inauguró, alguien se quedó nadando en el carril cuatro. Nadie lo vio salir. Desde entonces, de noche, ese carril se vacía.", gap=0.3)
    nt = M('night', 0.6, adv=True); S(sfx_whoosh(0.8), nt - 0.2, 0.5); S(sfx_creak(1.2), nt + 0.4, 0.4)
    L('h5', 'YOIN', "Esa noche, en casa, abrí la puerta del baño. La bañadera estaba llena. Yo no la había llenado.", gap=0.6)
    bb = M('bub', 0.3, adv=True); S(bubbles(4.0, 422), bb, 0.8)
    L('h6', 'YOIN', "Y desde el fondo... subían burbujas.", gap=0.3)
    sg = M('sting', 0.5, adv=True); S(sfx_sting(0.9), sg, 0.85)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos te hubieras metido al agua?", gap=0.5)
    W(3.2); dur = tl.t; mk = tl.marks
    sh = showers(dur, 423) * envelope(dur, [(0, 0.2), (mk['locker'] - 0.3, 0.3), (mk['locker'], 1), (mk['out'], 1), (mk['out'] + 0.1, 0), (dur, 0)])
    rn = rain(dur, 424) * envelope(dur, [(0, 0), (mk['out'], 0), (mk['out'] + 0.1, 1), (mk['day'], 1), (mk['day'] + 0.1, 0), (dur, 0)])
    room = roomtone(dur, 50, 425) * envelope(dur, [(0, 0), (mk['day'], 0), (mk['day'] + .1, 1), (dur, 1)])
    dr = drone(dur, 36.7, 340, 426)
    drg = envelope(dur, [(0, 0.9), (mk['out'], 0.5), (mk['day'], 0.2), (mk['night'], 0.6), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 427)
    sgg = envelope(dur, [(0, 0.5), (mk['locker'] + 3, 0.9), (mk['out'], 0.0), (mk['bub'], 0.3), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 428) * envelope(dur, [(0, 0), (mk['out'] + 1, 0), (mk['out'] + 2.5, 0.4), (mk['day'] + 3, 0.2), (mk['night'], 0)])
    beds = [(0, sh, 1.0), (0, rn, 1.0), (0, room, 0.8), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['out'], 104, 1.0), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

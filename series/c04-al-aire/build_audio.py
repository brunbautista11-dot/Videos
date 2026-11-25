#!/usr/bin/env python3
"""AL AIRE — voces, efectos, música y tiempos de las 3 partes."""
import sys
from audio_core import *

VO.update({
 'YOIN':  ('es-UY-ValentinaNeural', '-4%',  '-2Hz',  'inner',   1.0,  'in'),
 'YO':    ('es-UY-ValentinaNeural', '+0%',  '+0Hz',  'store',   0.95, 'yo'),
 'LINEA': ('es-PY-MarioNeural',     '-16%', '-12Hz', 'radio',   1.0,  'cosa'),
 'LINEAW':('es-PY-MarioNeural',     '-18%', '-10Hz', 'whisper', 1.05, 'cosa'),
 'WALT':  ('es-UY-MateoNeural',     '+4%',  '-2Hz',  'radio',   0.95, 'tel'),
 'WALTR': ('es-UY-MateoNeural',     '-4%',  '-4Hz',  'room',    0.95, 'wal'),
})

def studio(dur, seed=101):
    t = np.arange(int(dur * SR)) / SR
    hiss = bp(np.random.default_rng(seed).standard_normal((len(t), 2)), 3000, 9000) * 0.012
    return roomtone(dur, 50, seed) * 0.7 + hiss
def blink(n=6, gap=0.5):
    o = np.zeros(int((n * gap + 0.5) * SR))
    for i in range(n):
        k = tone(1046, 0.09) * 0.2 * np.linspace(1, 0.3, int(0.09 * SR)); s = int(i * gap * SR); o[s:s + len(k)] += k
    return st(o)
def crackle(d, seed=102):
    r = np.random.default_rng(seed); n = int(d * SR)
    c = (r.random(n) > 0.9985).astype(float) * r.uniform(0.3, 1.0, n)
    return st(hp(c, 1500) * 0.5 + bp(r.standard_normal(n), 2000, 7000) * 0.015)
def oldsong(d, seed=103):
    """slow, warped old waltz on a worn record"""
    bpm = 84; beat = 60 / bpm; o = np.zeros(int((d + 3) * SR)); r = np.random.default_rng(seed)
    ch = [(220.0, 261.6, 329.6), (196.0, 246.9, 293.7), (174.6, 220.0, 261.6), (164.8, 207.7, 246.9)]
    mel = [659.3, 587.3, 523.3, 493.9, 523.3, 440.0, 415.3, 440.0, 493.9, 0, 440.0, 0]
    def note(f, dur, g):
        t = np.arange(int(dur * SR)) / SR
        return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * np.exp(-t / (dur * 0.5)) * np.minimum(1, t / 0.01) * g
    t = 0.0; bar = 0
    while t < d:
        c = ch[bar % 4]
        y = note(c[0] / 2, beat * 1.2, 0.35); s = int(t * SR); o[s:s + len(y)] += y[:len(o) - s]
        for b in (1, 2):
            for f in c[1:]:
                y = note(f, beat * 0.8, 0.12); s = int((t + b * beat) * SR); o[s:s + len(y)] += y[:len(o) - s]
        for b in range(3):
            f = mel[(bar * 3 + b) % 12]
            if f: y = note(f, beat * 1.1, 0.22); s = int((t + b * beat) * SR); o[s:s + len(y)] += y[:len(o) - s]
        t += 3 * beat; bar += 1
    n = int(d * SR); x = o[:n]
    tt = np.arange(n) / SR; wob = 1 + 0.006 * np.sin(2 * np.pi * 0.55 * tt)       # wow & flutter
    idx = np.clip(np.cumsum(wob) - 1, 0, n - 1); x = np.interp(idx, np.arange(n), x)
    x = bp(x, 300, 3200, 2)
    return reverb(x, 1.8, 0.35, dark=2800, seed=seed)[:n] + crackle(d, seed + 1)
def ringtone(d=2.4):
    t = np.arange(int(d * SR)) / SR
    y = (np.sin(2 * np.pi * 1318 * t) * 0.5 + np.sin(2 * np.pi * 1760 * t) * 0.3) * ((t % 0.5) < 0.25) * ((t % 1.6) < 1.0)
    return reverb(fade(y * 0.25, 0.01, 0.1), 0.4, 0.15, seed=104)
def ding_msg(n=4, gap=0.45):
    o = np.zeros(int((n * gap + 1) * SR))
    for i in range(n):
        k = add(tone(1568, 0.25, 0.06) * 0.25, tone(2093, 0.2, 0.05) * 0.2); s = int((i * gap + rng.uniform(0, .1)) * SR); o[s:s + len(k)] += k
    return st(o)

# ================================================================ PARTE 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(blink(5, 0.5), 0.1, 0.8)
    L('h1', 'YOIN', "A las tres de la mañana, en mi programa de radio, entró una llamada. Desde la cabina de al lado. Que estaba vacía.", gap=0.4)
    tl.marks['title'] = 3.6
    fb = M('studio', 0.4, adv=True); S(sfx_whoosh(0.8), fb - 0.3, 0.5)
    L('h2', 'YOIN', "Hago la trasnoche en una radio chica. Walter, el operador, se había ido a las dos. Estaba sola.", gap=0.3)
    ln = M('line', 0.4, adv=True); S(blink(6, 0.5), ln, 0.8)
    L('h3', 'YOIN', "En el teléfono parpadeaba la línea tres. Decía: cabina B.", gap=0.3)
    pk = M('pick', 0.3, adv=True); S(sfx_click(), pk, 0.7)
    L('y1', 'YO', "Buenas noches, estás al aire. ¿Con quién hablo?", gap=0.3)
    S(static(0.5), tl.t + 0.2, 0.35)
    L('c1', 'LINEA', "Hola, Carolina. Te estoy mirando.", gap=0.6)
    L('h4', 'YOIN', "Miré el vidrio de la cabina. Estaba oscura. Y se prendió la luz roja de al aire.", gap=0.4)
    tl.marks['onair'] = round(tl.t - 1.2, 3); S(sfx_clunk(0.8), tl.marks['onair'], 0.6); S(sfx_buzz(1.0), tl.marks['onair'] + .05, 0.2)
    L('c2', 'LINEA', "Poné mi canción. La última del programa.", gap=0.6)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 34.6, 360, 105)
    drg = envelope(dur, [(0, 0.6), (mk['studio'], 0.3), (mk['line'], 0.6), (mk['pick'], 0.8), (mk['onair'], 1.0), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (277.2, 293.7, 415.3), 106)
    sgg = envelope(dur, [(0, 0), (mk['pick'], 0), (mk['onair'], 0.8), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    beds = [(0, studio(dur), 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (mk['pick'], sfx_heart(dur - mk['pick'], 72, 2.5), 0.55)]
    mixdown(tl, dur, beds)

# ================================================================ PARTE 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_whoosh(), 0.05, 0.5)
    L('h1', 'YOIN', "Seguí al aire. Si me pasaba algo, que por lo menos alguien lo escuchara.", gap=0.3)
    M('title', -1.8)
    ms = M('msgs', 0.4, adv=True); S(ding_msg(5, 0.5), ms, 0.7)
    L('h2', 'YOIN', "Empezaron a llegar mensajes de los oyentes. Todos decían lo mismo: ¿Quién respira atrás tuyo?", gap=0.2)
    L('y1', 'YO', "¿Quién sos?", gap=0.5)
    L('c1', 'LINEA', "El que hacía este programa antes que vos. Nunca lo terminé.", gap=0.5)
    rg = M('ring', 0.5, adv=True); S(ringtone(2.4), rg, 0.6); W(1.5)
    L('w1', 'WALT', "Caro, te estoy escuchando por la radio. Apagá la consola. Ya.", gap=0.2)
    L('y2', 'YO', "¿Por qué?", gap=0.3)
    L('w2', 'WALT', "No lo dejes terminar la canción.", gap=0.3)
    S(static(0.4), tl.t + 0.05, 0.4)
    sn = M('song', 0.6, adv=True)
    L('h3', 'YOIN', "Y una canción vieja empezó a sonar sola.", gap=0.5)
    L('c2', 'LINEA', "Esta es la mía. Cuando termine, cambiamos de lugar.", gap=0.5)
    sg = M('sting', 0.4, adv=True); S(sfx_sting(), sg, 0.95)
    ec = M('endcard', 1.3, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t; mk = tl.marks
    dr = drone(dur, 32.7, 340, 107)
    drg = envelope(dur, [(0, 0.7), (mk['msgs'], 0.9), (mk['ring'], 0.4), (mk['song'], 0.7), (mk['sting'], 1.1), (dur, 0.6)])
    sgs = strings(dur, (246.9, 261.6, 370.0), 108)
    sgg = envelope(dur, [(0, 0.2), (mk['msgs'], 0.6), (mk['ring'], 0.0), (mk['song'] + 3, 0.0), (mk['sting'], 1.3), (mk['sting'] + 0.2, 0)])
    song = oldsong(dur - mk['song']) * envelope(dur - mk['song'], [(0, 0), (0.3, 1), (mk['sting'] - mk['song'], 1), (mk['sting'] - mk['song'] + .1, .5), (dur - mk['song'], .5)])
    beds = [(0, studio(dur, 109), 1.0), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, sfx_heart(dur, 84, 2.0), 0.5)]
    tl.S(song, mk['song'], 0.55)
    mixdown(tl, dur, beds)

# ================================================================ PARTE 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    tl.marks['title'] = 1.4
    L('h1', 'YOIN', "Bajé todas las perillas. La canción siguió sonando. Así que desenchufé la consola.", gap=0.3)
    of = M('off', 0.2, adv=True); S(sfx_clunk(1.0), of, 0.8)
    L('h2', 'YOIN', "Se apagó todo. Menos el cartel de al aire.", gap=0.5)
    L('h3', 'YOIN', "Adentro de la cabina, alguien se sacó los auriculares.", gap=0.4)
    L('c1', 'LINEAW', "Gracias por la compañía, Carolina. Hasta mañana.", gap=0.6)
    sx = M('signoff', 0.3, adv=True); S(sfx_buzz(0.6), sx, 0.3)
    mo = M('morning', 0.9, adv=True); S(sfx_whoosh(0.8), mo - 0.2, 0.5)
    L('h4', 'YOIN', "A las seis llegó Walter. Arriba de la consola de la cabina había un casete viejo.", gap=0.3)
    L('w1', 'WALTR', "Ese programa se cortó al aire en el ochenta y siete. Al locutor nunca más lo vieron.", gap=0.4)
    nt = M('night', 0.6, adv=True); S(sfx_whoosh(0.8), nt - 0.2, 0.5)
    L('h5', 'YOIN', "Esa noche, a las tres en punto... la línea tres volvió a parpadear.", gap=0.3)
    sg = M('sting', 0.2, adv=True); S(blink(4, 0.45), sg - 0.2, 0.8); S(sfx_sting(1.0), sg, 0.9)
    ec = M('endcard', 1.2, adv=True); S(sfx_whoosh(), ec - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos atenderías la línea tres?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    song = oldsong(mk['signoff'] + 0.5, 110) * envelope(mk['signoff'] + 0.5, [(0, 0.8), (mk['off'], 0.8), (mk['off'] + 0.05, 0.45), (mk['signoff'], 0.45), (mk['signoff'] + 0.5, 0)])
    dr = drone(dur, 36.7, 340, 111)
    drg = envelope(dur, [(0, 0.7), (mk['off'], 1.0), (mk['morning'], 0.15), (mk['night'], 0.5), (mk['sting'], 1.0), (dur, 0.6)])
    sgs = strings(dur, (293.7, 311.1, 466.2), 112)
    sgg = envelope(dur, [(0, 0.2), (mk['off'], 0.7), (mk['signoff'], 0.0), (mk['sting'] - 1.5, 0.0), (mk['sting'], 1.4), (mk['sting'] + 0.15, 0)])
    warm = strings(dur, (261.6, 329.6, 392.0), 113) * envelope(dur, [(0, 0), (mk['morning'], 0), (mk['morning'] + 1.2, 0.4), (mk['night'] - 0.3, 0)])
    room = studio(dur, 114) * envelope(dur, [(0, 1), (mk['off'], 1), (mk['off'] + .05, .3), (mk['morning'], .3), (mk['morning'] + .1, 1), (dur, 1)])
    beds = [(0, room, 1.0), (0, song, 0.7), (0, dr * drg, 1.0), (0, sgs * sgg, 1.0), (0, warm, 1.0), (0, sfx_heart(mk['morning'], 86, 1.0), 0.5)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

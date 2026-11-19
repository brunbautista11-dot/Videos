#!/usr/bin/env python3
"""GTA 6 lanzamiento — tres shorts. p1: récord de preventa  p2: 99 en Metacritic  p3: la noche del lanzamiento (PSN, update, 212 GB)"""
import sys
from audio_core import *

VO.update({
 'N':  ('es-UY-MateoNeural', '+5%', '+0Hz', 'dry', 1.0, 'n'),
 'NQ': ('es-UY-MateoNeural', '+4%', '+2Hz', 'dry', 1.0, 'q'),
})
BPM = 104; BEAT = 60 / BPM

def saw(f, d, det=0.0):
    t = np.arange(int(d * SR)) / SR; y = np.zeros_like(t)
    for k in (1, 1.003 + det, 0.997 - det):
        y += 2 * ((t * f * k) % 1) - 1
    return y / 3
def synthwave(dur, seed=0):
    """Original retro-synth bed: chords + bass + kick/hat, 104 bpm."""
    n = int(dur * SR); o = np.zeros((n, 2)); r = np.random.default_rng(seed)
    prog = [(220.0, (220.0, 261.6, 329.6)), (174.6, (174.6, 220.0, 261.6)), (130.8, (196.0, 261.6, 329.6)), (196.0, (196.0, 246.9, 293.7))]
    bar = 4 * BEAT; t0 = 0.0; i = 0
    while t0 < dur:
        root, ch = prog[i % 4]
        pad = sum(saw(f, bar + 0.3) for f in ch) / 3
        pad = lp(pad, 1400) * np.minimum(1, np.arange(len(pad)) / (0.25 * SR)) * np.minimum(1, (len(pad) - np.arange(len(pad))) / (0.3 * SR))
        s = int(t0 * SR); e = min(n, s + len(pad)); o[s:e, 0] += pad[:e - s] * 0.22; o[s:e, 1] += pad[:e - s] * 0.22
        for b8 in range(8):  # bass eighths
            bt = t0 + b8 * BEAT / 2; bn = lp(saw(root / 2, BEAT / 2 * 0.9), 500) * env_exp(int(BEAT / 2 * 0.9 * SR), 0.12)
            s = int(bt * SR); e = min(n, s + len(bn));
            if s < n: o[s:e] += bn[:e - s, None] * 0.35
        t0 += bar; i += 1
    kk = add(tone(55, 0.35, 0.09) * 1.2, nb(0.05, 1500, 5000, 0.01, 0.3))
    hh = nb(0.06, 6000, 14000, 0.015, 0.25)
    sn_ = add(nb(0.25, 900, 6000, 0.07, 0.6), tone(190, 0.2, 0.05) * 0.3)
    b = 0
    while b * BEAT < dur:
        s = int(b * BEAT * SR)
        for x, at in ((kk, s), (hh, s + int(BEAT / 2 * SR))):
            e = min(n, at + len(x))
            if at < n: o[at:e] += x[:e - at, None] * 0.55
        if b % 2 == 1:
            snr = sn_
            e = min(n, s + len(snr)); o[s:e] += snr[:e - s, None] * 0.35
        b += 1
    return reverb(o, 1.2, 0.18, dark=5000, seed=12)
def boom():
    return reverb(add(tone(48, 1.6, 0.5) * 1.2, nb(0.5, 60, 900, 0.18, 0.6)), 1.5, 0.3, seed=13)
def cash():
    a = sfx_ding(2093, 2, gap=0.09, g=0.45)[:, 0]; c = nb(0.25, 2000, 9000, 0.06, 0.3)
    o = np.zeros(len(a)); o[:len(c)] += c; return o + a
def stamp(): return reverb(add(tone(70, 0.5, 0.08) * 1.3, nb(0.12, 200, 3000, 0.03, 0.9)), 0.6, 0.2, seed=14)
def glitch(d=0.9):
    y = static(d)[:, 0] if static(d).ndim == 2 else static(d)
    t = np.arange(len(y)) / SR; return y * (np.sin(2 * np.pi * 13 * t) > 0) * 0.8
def ticks(d, rate=14):
    o = np.zeros(int(d * SR)); k = st(sfx_beep(2400, 0.02, 0.25))[:, 0]
    for i in range(int(d * rate)):
        s = int(i / rate * SR); o[s:s + len(k)] += k[:len(o) - s]
    return o
def pops(d, seed=3):
    r = np.random.default_rng(seed); o = np.zeros(int(d * SR))
    for i in range(int(d * 3)):
        s = int(r.uniform(0, d - 1.2) * SR); x = nb(1.0, 80, 2500, r.uniform(.2, .5), r.uniform(.4, .9)); o[s:s + len(x)] += x
    return reverb(o, 2.0, 0.4, seed=15)

def bed(tl, dur, extra=()):
    mk = tl.marks
    mu = synthwave(dur + 1)[:int(dur * SR)]
    g = envelope(dur, [(0, 0.35), (mk['title'] - 0.05, 0.35), (mk['title'], 1.0), (mk['endcard'], 1.0), (dur - 0.6, 0.0), (dur, 0.0)])
    mixdown(tl, dur, [(0, mu * g, 1.0), *extra])

# ================================================================ P1 — récord de preventa
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(cash(), 0.05, 0.6)
    L('h1', 'N', "Diecisiete millones de copias. Y GTA 6 todavía no había salido.", gap=0.15,
      show="17 millones de copias. Y GTA 6 todavía no había salido.")
    t = M('title', 0.05); S(boom(), t, 0.9); S(sfx_whoosh(), t - 0.25, 0.6); W(0.9)
    a, b = L('c1', 'N', "Según la consultora Sensor Tower, antes del lanzamiento ya llevaba unos diecisiete millones de copias en preventa.", gap=0.1,
             show="Según la consultora Sensor Tower, antes del lanzamiento ya llevaba unos 17 millones de copias en preventa.")
    tl.marks['pre'] = a; S(ticks(3.0, 16), a + 2.4, 0.4)
    a, b = L('c2', 'N', "Eso equivale a unos mil seiscientos cincuenta millones de dólares.", gap=0.35,
             show="Eso equivale a unos 1.650 millones de dólares.")
    tl.marks['money'] = a; S(cash(), a + 1.2, 0.7); S(sfx_whoosh(), a - 0.3, 0.5); S(boom(), b - 0.6, 0.4)
    a, b = L('c3', 'N', "Y casi tres de cada cuatro reservas fueron en PlayStation 5.", gap=0.35)
    tl.marks['ps5'] = a; S(stamp(), b - 0.8, 0.6)
    a, b = L('c4', 'N', "Para comparar: GTA 5 lleva más de doscientos treinta y cinco millones de copias, pero en trece años.", gap=0.35,
             show="Para comparar: GTA 5 lleva más de 235 millones de copias, pero en trece años.")
    tl.marks['gta5'] = a; S(sfx_whoosh(), a - 0.3, 0.5); S(ticks(2.2, 16), a + 2.0, 0.35)
    a, b = L('c4b', 'N', "Varios medios ya lo comparan con los mayores estrenos de la historia del entretenimiento.", gap=0.35)
    tl.marks['big'] = a; S(sfx_whoosh(), a - 0.3, 0.5); S(boom(), a + 2.0, 0.4)
    a, b = L('c5', 'N', "Ojo: son estimaciones. Rockstar y Take-Two no confirmaron cifras de ventas.", gap=0.35)
    tl.marks['est'] = a; S(stamp(), a + 1.0, 0.7); S(sfx_alert(), a + 0.1, 0.2)
    a, b = L('c6', 'N', "Pero en la bolsa ya festejan: las acciones de Take-Two subieron cerca de un seis por ciento.", gap=0.35,
             show="Pero en la bolsa ya festejan: las acciones de Take-Two subieron cerca de un 6%.")
    tl.marks['stock'] = a; S(sfx_riser(1.6), a + 0.4, 0.35); S(pops(4.0, 7), a + 2.2, 0.5)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'NQ', "¿Vos ya lo compraste?", gap=0.15)
    W(3.0); dur = tl.t
    bed(tl, dur)

# ================================================================ P2 — 99 en Metacritic
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(stamp(), 0.05, 0.6)
    L('h1', 'N', "Noventa y nueve sobre cien. GTA 6 empató con el juego mejor puntuado de la historia.", gap=0.15,
      show="99 sobre 100. GTA 6 empató con el juego mejor puntuado de la historia.")
    t = M('title', 0.05); S(boom(), t, 0.9); S(sfx_whoosh(), t - 0.25, 0.6); W(0.9)
    a, b = L('d1', 'N', "En Metacritic sacó un noventa y nueve, con más de ciento cuarenta reseñas de la crítica.", gap=0.1,
             show="En Metacritic sacó un 99, con más de 140 reseñas de la crítica.")
    tl.marks['meta'] = a; S(ticks(2.2, 18), a + 1.0, 0.4); S(boom(), a + 3.2, 0.5)
    a, b = L('d2', 'N', "Solo otro juego llegó a esa nota: Zelda, Ocarina of Time, de mil novecientos noventa y ocho.", gap=0.35,
             show="Solo otro juego llegó a esa nota: Zelda, Ocarina of Time, de 1998.")
    tl.marks['zelda'] = a; S(sfx_whoosh(), a - 0.3, 0.5); S(stamp(), b - 0.2, 0.7)
    a, b = L('d2b', 'N', "Aquel Zelda tenía veintidós reseñas. GTA 6, más de seis veces más.", gap=0.35,
             show="Aquel Zelda tenía 22 reseñas. GTA 6, más de seis veces más.")
    tl.marks['x6'] = a; S(ticks(1.8, 16), a + 2.3, 0.35)
    a, b = L('d3', 'N', "IGN le puso un diez perfecto, después de jugarlo más de ciento veinte horas.", gap=0.35,
             show="IGN le puso un 10 perfecto, después de jugarlo más de 120 horas.")
    tl.marks['ign'] = a; S(stamp(), a + 1.6, 0.7); S(pops(3.5, 9), a + 1.8, 0.4)
    a, b = L('d4', 'N', "Bloomberg lo llamó obra maestra. Y el Washington Post, una épica americana asombrosa.", gap=0.35)
    tl.marks['press'] = a; S(sfx_whoosh(), a - 0.3, 0.5)
    a, b = L('d5', 'N', "Lo que más elogian: el tamaño del mundo, la historia, y cómo reacciona a tus decisiones.", gap=0.35)
    tl.marks['praise'] = a; w = tl.T('d5')['words']
    for wd in w:
        if wd[0].startswith('tamaño') or wd[0].startswith('historia') or wd[0].startswith('reacciona'): S(sfx_ding(1568, 1, g=0.35), wd[1], 0.6)
    tl.marks['k1'] = next(wd[1] for wd in w if wd[0].startswith('tamaño')); tl.marks['k2'] = next(wd[1] for wd in w if wd[0].startswith('historia')); tl.marks['k3'] = next(wd[1] for wd in w if wd[0].startswith('reacciona'))
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'NQ', "¿Vos qué nota le ponés?", gap=0.15)
    W(3.0); dur = tl.t
    bed(tl, dur)

# ================================================================ P3 — la noche del lanzamiento
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(glitch(0.8), 0.0, 0.5)
    L('h1', 'N', "Horas antes de GTA 6, PlayStation Network se cayó.", gap=0.15)
    t = M('title', 0.05); S(boom(), t, 0.9); S(sfx_whoosh(), t - 0.25, 0.6); W(0.9)
    a, b = L('e1', 'N', "El miércoles de tarde, en Estados Unidos, miles de jugadores no podían iniciar sesión.", gap=0.1)
    tl.marks['psn'] = a; S(sfx_alert(), a + 2.6, 0.25)
    a, b = L('e2', 'N', "En Downdetector llegó a haber más de cuatro mil reportes.", gap=0.35,
             show="En Downdetector llegó a haber más de 4.000 reportes.")
    tl.marks['dd'] = a; S(ticks(2.4, 18), a + 1.2, 0.4); S(glitch(0.6), a + 3.4, 0.35)
    a, b = L('e3', 'N', "Se arregló en unas horas. Y ni Sony ni Rockstar dijeron que fuera culpa de GTA 6.", gap=0.35)
    tl.marks['fix'] = a; S(sfx_ding(1318.5, 2, gap=0.12, g=0.4), a + 0.3, 0.6)
    a, b = L('e4', 'N', "Además, en PS5 hay que instalar una actualización del sistema antes de poder jugar.", gap=0.35)
    tl.marks['upd'] = a; S(stamp(), b - 0.4, 0.6)
    a, b = L('e5', 'N', "Y el juego pide hasta doscientos doce gigas de espacio libre.", gap=0.35,
             show="Y el juego pide hasta 212 gigas de espacio libre.")
    tl.marks['gb'] = a; S(ticks(2.0, 16), a + 1.2, 0.35); S(boom(), b - 0.2, 0.5)
    a, b = L('e6', 'N', "Mientras tanto, en Nueva Zelanda ya estaban jugando: allá la medianoche llega horas antes.", gap=0.35)
    tl.marks['nz'] = a; S(sfx_riser(1.5), a - 0.2, 0.3); S(pops(4.0, 11), a + 1.4, 0.5)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'NQ', "¿A vos te anduvo, o te quedaste esperando?", gap=0.15)
    W(3.0); dur = tl.t
    bed(tl, dur)

if __name__ == "__main__":
    {"1": part1, "2": part2, "3": part3}[sys.argv[1]]()

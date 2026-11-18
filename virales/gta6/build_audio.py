#!/usr/bin/env python3
"""GTA 6 — dos shorts explicativos. p1: ¿por qué tardó 13 años?  p2: ¿cuánto costó?"""
import sys
from audio_core import *

VO.update({
 'N':  ('es-UY-MateoNeural', '+9%', '+0Hz', 'dry', 1.0, 'n'),
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

# ================================================================ P1 — 13 años
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_riser(1.6), 0.0, 0.5)
    L('h1', 'N', "Trece años. Eso tardó en salir GTA 6. ¿Por qué tanto?", gap=0.15)
    t = M('title', 0.05); S(boom(), t, 0.9); S(sfx_whoosh(), t - 0.25, 0.6); W(0.9)
    a, b = L('a1', 'N', "GTA 5 salió en septiembre de 2013.", gap=0.1)
    tl.marks['y2013'] = a; S(stamp(), a + 1.4, 0.6)
    a, b = L('a2', 'N', "Y nunca dejó de venderse: más de 220 millones de copias.", gap=0.35)
    tl.marks['money'] = a; S(cash(), a + 1.6, 0.7); S(sfx_whoosh(), a - 0.3, 0.5)
    L('a3', 'N', "Con su modo online dando plata todos los años, Rockstar no tenía apuro.", gap=0.25)
    a, b = L('a4', 'N', "En 2022, un hacker filtró más de 90 videos del juego en desarrollo.", gap=0.4)
    tl.marks['leak'] = a; S(glitch(0.9), a - 0.25, 0.5); S(sfx_alert(), a + 0.2, 0.25)
    L('a5', 'N', "Una de las mayores filtraciones de la historia de los videojuegos.", gap=0.2)
    a, b = L('a6', 'N', "En diciembre de 2023 salió el primer tráiler: noventa millones de vistas en 24 horas. Récord en YouTube.", gap=0.4,
             show="En diciembre de 2023 salió el primer tráiler: 90 millones de vistas en 24 horas. Récord en YouTube.")
    tl.marks['trailer'] = a; S(sfx_whoosh(), a - 0.3, 0.5); S(ticks(3.5), a + 2.6, 0.5); S(boom(), b - 1.6, 0.5)
    a, b = L('a7', 'N', "Iba a salir en 2025. Se atrasó a mayo de 2026. Y otra vez, a noviembre.", gap=0.4)
    tl.marks['delay'] = a; w = tl.T('a7')['words']
    for i, wd in enumerate(w):
        if wd[0].startswith('2025') or wd[0].startswith('2026') or wd[0].startswith('noviembre'): S(stamp(), wd[2], 0.6); tl.marks.setdefault('st%d' % len([k for k in tl.marks if k.startswith('st')]), wd[2])
    a, b = L('a8', 'N', "Y ahora sí: sale el 19 de noviembre de 2026.", gap=0.35)
    tl.marks['launch'] = a; S(pops(4.5), a + 1.2, 0.5); S(sfx_riser(1.5), a - 0.2, 0.3)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'NQ', "¿Valió la pena esperar trece años?", gap=0.15)
    W(2.6); dur = tl.t
    bed(tl, dur)

# ================================================================ P2 — cuánto costó
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(cash(), 0.05, 0.6)
    L('h1', 'N', "¿Cuánto costó hacer GTA 6? Ni Rockstar lo quiere decir.", gap=0.25)
    t = M('title', 0.05); S(boom(), t, 0.9); S(sfx_whoosh(), t - 0.25, 0.6); W(0.9)
    a, b = L('b1', 'N', "Para tener una idea: GTA 5, en 2013, costó unos 265 millones de dólares, entre desarrollo y publicidad.", gap=0.1)
    tl.marks['gta5'] = a; S(cash(), a + 3.0, 0.5)
    a, b = L('b2', 'N', "Para GTA 6, los analistas calculan entre mil y dos mil millones de dólares. Algunos hablan de más.", gap=0.4,
             show="Para GTA 6, los analistas calculan entre 1.000 y 2.000 millones de dólares. Algunos hablan de más.")
    tl.marks['gta6'] = a; S(sfx_riser(2.2), a + 0.6, 0.4); S(boom(), a + 3.0, 0.6)
    a, b = L('b3', 'N', "Si es así, sería el juego más caro de la historia. Más caro que cualquier película jamás hecha.", gap=0.35)
    tl.marks['movie'] = a; S(sfx_whoosh(), a + 2.4, 0.5)
    a, b = L('b4', 'N', "El jefe de la empresa dueña de Rockstar solo admitió una cosa: que fue caro.", gap=0.4)
    tl.marks['ceo'] = a; S(stamp(), b - 0.3, 0.6)
    a, b = L('b5', 'N', "¿Lo van a recuperar? GTA 5 recaudó mil millones de dólares en solo tres días. Récord Guinness.", gap=0.4,
             show="¿Lo van a recuperar? GTA 5 recaudó 1.000 millones de dólares en solo tres días. Récord Guinness.")
    tl.marks['record'] = a; S(ticks(2.5, 18), a + 1.6, 0.4); S(pops(4.0, 5), a + 4.2, 0.5); S(boom(), a + 4.2, 0.5)
    ec_ = M('endcard', 0.5, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'NQ', "¿Cuánto pagarías vos por jugarlo?", gap=0.15)
    W(2.6); dur = tl.t
    bed(tl, dur)

if __name__ == "__main__":
    {"1": part1, "2": part2}[sys.argv[1]]()

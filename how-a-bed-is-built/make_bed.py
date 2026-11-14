#!/usr/bin/env python3
"""Genera el short vertical animado en 3D "How it's built: the bed".

Todo se genera con código: escenas 3D (renderizador propio en common/scene3d.py),
voz neuronal Piper, subtítulos palabra a palabra, música y efectos sintetizados.

Uso:
    python3 make_bed.py [carpeta_de_trabajo] [salida.mp4]

Voz: descarga el modelo y apunta PIPER_MODEL a su .onnx (si no, usa espeak-ng):
    curl -LO https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-ryan-high.tar.gz
    tar -xzf voice-en-us-ryan-high.tar.gz --one-top-level
    PIPER_MODEL=voice-en-us-ryan-high/en-us-ryan-high.onnx python3 make_bed.py
Requisitos: python3, numpy, scipy, Pillow, piper-tts, ffmpeg.
"""
import copy
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "common"))
import audio as A  # noqa: E402
import scene3d as S3  # noqa: E402
from engine import (FPS, H, W, WHITE, YELLOW, Frame, clamp, draw_caption, ease_out, ease_out_back,  # noqa: E402
                    glow, group_words, label_font, lerp, lerp_c, smooth, text_big, text_label, vgrad)

WORK = sys.argv[1] if len(sys.argv) > 1 else "build"
OUT = sys.argv[2] if len(sys.argv) > 2 else "how-a-bed-is-built.mp4"
PIPER_MODEL = os.environ.get("PIPER_MODEL", "voices/voice-en-us-ryan-high/en-us-ryan-high.onnx")
PIPER_LENGTH = float(os.environ.get("PIPER_LENGTH", "0.95"))
LEAD = 0.12

# ---------------------------------------------------------------- colores
WOOD = (205, 152, 98)
WOOD_D = (172, 122, 74)
WOOD_WET = (150, 104, 66)
BEECH = (222, 178, 128)
STEEL = (178, 186, 198)
RUBBER = (52, 52, 58)
FELT = (120, 114, 108)
HR = (242, 214, 112)
MEM = (118, 168, 218)
COVER = (236, 234, 244)
TAPE = (58, 62, 84)
DUVET = (86, 128, 196)
SHEET = (246, 246, 242)
ACCENT = (255, 196, 60)
BG = vgrad((34, 36, 46), (12, 13, 18))


def ease_io(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def land(p):
    """Caída con pequeño rebote (0 -> 1)."""
    p = clamp(p)
    if p < 0.7:
        return (p / 0.7) ** 2
    u = (p - 0.7) / 0.3
    return 1 - 0.06 * math.sin(u * math.pi)


# ================================================================ geometría de la cama
def wood(a, b, axis, n=1, color=WOOD, **kw):
    if n > 1:
        return S3.split_box(a, b, axis, n, color, grain=axis, **kw)
    return [S3.Box(a, b, color, grain=axis, **kw)]


def g_head():
    o = []
    for x0 in (-83, 76):
        o += wood((x0, 0, -103), (x0 + 7, 100, -96), 1)
    o += wood((-76, 20, -102), (76, 35, -97), 0, 5)
    o += wood((-76, 48, -101.5), (76, 92, -97.5), 0, 5, color=WOOD_D)
    o += wood((-84, 100, -104), (84, 104, -95), 0, 5)
    return o


def g_foot():
    o = []
    for x0 in (-83, 76):
        o += wood((x0, 0, 96), (x0 + 7, 45, 103), 1)
    o += wood((-76, 20, 97), (76, 40, 102), 0, 5)
    return o


def g_rail(side):
    x0 = -81 if side < 0 else 76
    return wood((x0, 20, -96), (x0 + 5, 35, 96), 2, 6)


def g_support(side):
    x0 = -76 if side < 0 else 72
    return wood((x0, 20, -96), (x0 + 4, 24.5, 96), 2, 6, color=WOOD_D)


def g_screws(side, k):
    x = -73.4 if side < 0 else 73.4
    out = []
    for i, z in enumerate(np.linspace(-84, 84, 8)):
        if i < k:
            out.append(S3.Box((x - 0.9, 24.5, z - 0.9), (x + 0.9, 25.0, z + 0.9), STEEL, outline=False, shadow=False))
    return out


def g_beam():
    o = wood((-3, 20, -96), (3, 25, 96), 2, 6, color=WOOD_D)
    for z in (-45, 45):
        o += wood((-2, 0, z - 2), (2, 20, z + 2), 1, color=WOOD_D)
    return o


SLAT_Z = np.linspace(-87, 87, 14)


def g_slat(i, dy=0.0, bow=0.9):
    z = SLAT_Z[i]
    out = []
    n = 6
    xs = np.linspace(-74.5, 74.5, n + 1)
    for k in range(n):
        xm = (xs[k] + xs[k + 1]) / 2
        y = 25 + bow * (1 - (xm / 74.5) ** 2) + dy * (1 - (xm / 74.5) ** 2)
        internal = set()
        if k > 0:
            internal.add(0)
        if k < n - 1:
            internal.add(1)
        out.append(S3.Box((xs[k], y, z - 3.5), (xs[k + 1], y + 2.2, z + 3.5), BEECH, grain=0, internal=internal,
                          outline=False))
    return out


def g_holder(i):
    z = SLAT_Z[i]
    return [S3.Box((x0, 24.5, z - 4.6), (x0 + 1.5, 28.2, z + 4.6), RUBBER, shadow=False) for x0 in (-76, 74.5)]


SPR_X = np.linspace(-64, 64, 9)
SPR_Z = np.linspace(-84, 84, 11)


def g_springs(compress=None, grow=None, pocket=True, glow_k=0.0, y0=29.2):
    out = []
    for xa in np.linspace(-75, 75, 5)[:-1]:
        for za in np.linspace(-95, 95, 7)[:-1]:
            out.append(S3.Box((xa, 28.3, za), (xa + 37.5, y0, za + 190 / 6), FELT, outline=False))
    for i, x in enumerate(SPR_X):
        for j, z in enumerate(SPR_Z):
            h = 16.1
            if compress is not None:
                h *= compress(x, z)
            if grow is not None:
                h *= grow(i, j)
            if h < 0.5:
                continue
            out.append(S3.Helix((x, y0, z), 6.0, h, 5, pocket=(226, 220, 208) if pocket else None, glow=glow_k))
    return out


def g_layer(name):
    if name == "felt":
        return [S3.Box((-75, 45.4, -95), (75, 47, 95), FELT)]
    if name == "hr":
        return [S3.Box((-75, 47, -95), (75, 53, 95), HR)]
    if name == "mem":
        return [S3.Box((-75, 53, -95), (75, 59, 95), MEM)]
    raise KeyError(name)


def quilt_top(tape=1.0, needle=None):
    def draw(d, cam, box):
        a, b = box.a + box.offset, box.b + box.offset
        y = b[1] + 0.05
        x0, x1, z0, z1 = a[0] + 3, b[0] - 3, a[2] + 3, b[2] - 3
        col = (196, 192, 210, 255)
        for cc in np.arange(-300, 300, 16):
            for kind in (0, 1):
                if kind == 0:
                    lo, hi = max(x0, z0 + cc), min(x1, z1 + cc)
                    if hi <= lo:
                        continue
                    P = np.array([[lo, y, lo - cc], [hi, y, hi - cc]], np.float32)
                else:
                    lo, hi = max(x0, cc - z1), min(x1, cc - z0)
                    if hi <= lo:
                        continue
                    P = np.array([[lo, y, cc - lo], [hi, y, cc - hi]], np.float32)
                d.line(cam.px(P), fill=col, width=S3.SS)
        if tape > 0:
            per = [(a[0], a[2]), (b[0], a[2]), (b[0], b[2]), (a[0], b[2]), (a[0], a[2])]
            lens = [abs(per[k + 1][0] - per[k][0]) + abs(per[k + 1][1] - per[k][1]) for k in range(4)]
            total = sum(lens) * tape
            pts = [per[0]]
            for k in range(4):
                if total <= 0:
                    break
                seg = min(1.0, total / lens[k])
                p = (per[k][0] + (per[k + 1][0] - per[k][0]) * seg, per[k][1] + (per[k + 1][1] - per[k][1]) * seg)
                pts.append(p)
                total -= lens[k]
            P = np.array([[x, y, z] for x, z in pts], np.float32)
            if len(P) > 1:
                d.line(cam.px(P), fill=TAPE + (255,), width=int(2.4 * S3.SS * cam.f / 500))
            if needle is not None:
                needle.append(P[-1])
    return draw


def g_cover(wrap=1.0, tape=1.0, needle=None, dent=None):
    y1 = 61.0
    y0 = y1 - 2 - 30.7 * wrap
    top = quilt_top(tape, needle)
    if dent is not None:
        base_top = top

        def top(d, cam, box, _b=base_top):
            _b(d, cam, box)
            dent(d, cam, box)
    return [S3.Box((-76, y0, -96), (76, y1, 96), COVER, top=top, outline=True)]


def clip_below(objs, ymax):
    """Recorta las capas interiores para que no asomen dentro de la funda."""
    out = []
    for o in objs:
        if isinstance(o, S3.Box):
            if o.a[1] >= ymax - 0.01:
                continue
            if o.b[1] > ymax:
                o = copy.copy(o)
                o.b = o.b.copy()
                o.b[1] = ymax
            out.append(o)
        elif isinstance(o, S3.Helix):
            if o.c[1] >= ymax - 0.5:
                continue
            if o.c[1] + o.h > ymax:
                o = copy.copy(o)
                frac = (ymax - o.c[1]) / o.h
                o.turns = max(0.3, o.turns * frac)
                o.h = ymax - o.c[1]
            out.append(o)
        else:
            out.append(o)
    return out


def g_bedding(p_duvet=1.0, p_pillow=1.0):
    out = []
    if p_duvet > 0:
        dy = 150 * (1 - land(p_duvet))
        out += [S3.Box((-79, 61 + dy, -36), (79, 66 + dy, 99), DUVET, offset=(0, 0, 0)),
                S3.Box((-79, 61 + dy, -44), (79, 67.5 + dy, -36), SHEET)]
    if p_pillow > 0:
        dy = 150 * (1 - land(p_pillow))
        out += [S3.Box((-66, 61 + dy, -93), (-6, 73 + dy, -68), SHEET, yaw=0.05),
                S3.Box((6, 61 + dy, -93), (66, 73 + dy, -68), SHEET, yaw=-0.05)]
    return out


def moved(objs, off):
    off = np.array(off, np.float32)
    if not off.any():
        return objs
    out = []
    for o in objs:
        o2 = copy.copy(o)
        if isinstance(o, S3.Box):
            o2.offset = o.offset + off
        elif hasattr(o, "c"):
            o2.c = o.c + off
        out.append(o2)
    return out


# Explosión (dirección de cada grupo en la vista despiezada)
EXPL = {"head": (0, 20, -120), "foot": (0, 20, 120), "rail_l": (-115, 20, 0), "rail_r": (115, 20, 0),
        "supports": (0, 55, 0), "beam": (0, 35, 0), "slats": (0, 95, 0), "core": (0, 150, 0),
        "felt": (0, 178, 0), "hr": (0, 205, 0), "mem": (0, 232, 0), "cover": (0, 285, 0),
        "duvet": (0, 335, 0), "pillows": (0, 370, 0)}


def full_bed(explode=0.0, bedding=True, cover=True, springs_inside=False):
    e = ease_io(explode)
    o = []

    def add(key, objs):
        o.extend(moved(objs, np.array(EXPL[key], np.float32) * e))
    add("head", g_head())
    add("foot", g_foot())
    add("rail_l", g_rail(-1))
    add("rail_r", g_rail(1))
    add("supports", g_support(-1) + g_support(1))
    add("beam", g_beam())
    sl = []
    for i in range(14):
        sl += g_slat(i) + g_holder(i)
    add("slats", sl)
    if explode > 0 or springs_inside:
        add("core", g_springs(pocket=False))
        add("felt", g_layer("felt"))
        add("hr", g_layer("hr"))
        add("mem", g_layer("mem"))
        if cover:
            add("cover", [S3.Box((-76, 59, -96), (76, 61, 96), COVER, top=quilt_top())] if explode > 0 else g_cover())
    elif cover:
        add("cover", g_cover())
    if bedding:
        add("duvet", g_bedding(1, 0))
        add("pillows", g_bedding(0, 1))
    return o


def frame_parts(head=1, foot=1, rails=1, gap=0.0, lift=0.0):
    o = []
    if head > 0:
        o += moved(g_head(), (0, 0, -260 * (1 - ease_out(head)) - 14 * gap))
    if foot > 0:
        o += moved(g_foot(), (0, 0, 260 * (1 - ease_out(foot)) + 14 * gap))
    if rails > 0:
        o += moved(g_rail(-1), (-260 * (1 - ease_out(rails)), 12 * lift, 0))
        o += moved(g_rail(1), (260 * (1 - ease_out(rails)), 12 * lift, 0))
    return o


def base_parts(supports=1.0, beam=1.0, slats=14.0, screws=8, wobble=None):
    o = []
    if supports > 0:
        o += moved(g_support(-1) + g_support(1), (0, 120 * (1 - land(supports)), 0))
        o += g_screws(-1, screws) + g_screws(1, screws)
    if beam > 0:
        o += moved(g_beam(), (0, 120 * (1 - land(beam)), 0))
    for i in range(14):
        p = clamp(slats - i)
        if p <= 0:
            continue
        dy = 90 * (1 - land(p))
        w = wobble(i) if wobble else 0.0
        o += moved(g_slat(i, dy=w), (0, dy, 0))
        o += g_holder(i)
    return o


# ================================================================ escenario y UI
def stage(c, cam, objs, grid_alpha=55, spot=(540, 860)):
    f = Frame(BG)
    glow(f, spot[0], spot[1], 760, (70, 76, 100), 0.55)
    f.comp(S3.floor_grid(cam, W, H, alpha=grid_alpha))
    img, sh = S3.render(objs, cam, W, H)
    if sh is not None:
        f.a *= (1 - 0.55 * sh)[..., None]
    f.comp(img)
    return f


def callout(f, cam, P, text, tx, ty, alpha, color=ACCENT):
    if alpha <= 0:
        return
    x, y, _ = cam.project(np.array(P, np.float32))
    img, d = f.layer()
    a = int(255 * clamp(alpha))
    fo = label_font(36)
    tw = fo.getlength(text)
    # línea de llamada hasta el borde de la etiqueta
    ex = tx - tw / 2 - 22 if x < tx - tw / 2 else (tx + tw / 2 + 22 if x > tx + tw / 2 else x)
    ey = ty
    d.line([x, y, ex, ey], fill=color + (a,), width=4)
    d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=color + (a,), outline=(0, 0, 0, a), width=3)
    d.rounded_rectangle([tx - tw / 2 - 22, ty - 30, tx + tw / 2 + 22, ty + 30], radius=30, fill=(16, 17, 24, int(a * 0.9)),
                        outline=color + (a,), width=4)
    d.text((tx, ty), text, font=fo, fill=(255, 255, 255, a), anchor="mm")
    f.comp(img)


def callout_at(f, c, cam, P, text, tx, ty, word, nth=0, color=ACCENT, dt=-0.1):
    t0 = c.wt(word, nth=nth) + dt
    if c.t > t0:
        callout(f, cam, P, text, tx, ty, ease_out((c.t - t0) / 0.3), color)


STEPS = ["WOOD", "FRAME", "JOINTS", "SUPPORTS", "SLATS", "SPRINGS", "FOAM", "COVER", "TESTING"]


def header(f, c, step, title):
    n = len(STEPS)
    x0, x1, y = 90, W - 90, 70
    gap = 10
    sw = (x1 - x0 - gap * (n - 1)) / n
    img, d = f.layer()
    for k in range(n):
        xa = x0 + k * (sw + gap)
        d.rounded_rectangle([xa, y, xa + sw, y + 12], radius=6, fill=(255, 255, 255, 60))
        fill = 1.0 if step is not None and k < step else (clamp(c.t / c.T) if k == step else 0.0)
        if fill > 0:
            d.rounded_rectangle([xa, y, xa + sw * fill, y + 12], radius=6, fill=ACCENT + (255,))
    f.comp(img)
    pop = ease_out_back(c.t / 0.35)
    if step is not None:
        text_label(f, 540, 140, f"STEP {step + 1}", 40, ACCENT, clamp(pop * 2), stroke=5)
    text_big(f, 540, 235, title, int(110 * (0.7 + 0.3 * pop)), WHITE, clamp(pop * 2), stroke=9)


def orbit(c, yaw0, speed, pitch, dist, target=(0, 30, 0), f=2000):
    return S3.Camera(yaw0 + speed * c.g, pitch, dist, target, f=f)


# ================================================================ contexto
class Ctx:
    def __init__(self, t, T, g, words):
        self.t, self.T, self.g, self.words = t, T, g, words
        self.shake = 0.0

    def wt(self, word, default=None, nth=0):
        n = 0
        for w, a, _ in self.words:
            if w.lower().strip(".,?!'") == word:
                if n == nth:
                    return a
                n += 1
        return self.T * 0.5 if default is None else default


# ================================================================ escenas
def sc_hook(c):
    cam = orbit(c, -0.95, 0.12, 0.42, 560, (0, 38, 0))
    f = stage(c, cam, full_bed())
    pop = ease_out_back((c.t - 0.3) / 0.4)
    if c.t > 0.3:
        text_label(f, 540, 170, "HOW IT'S BUILT", 46, ACCENT, clamp(pop * 2))
        text_big(f, 540, 300, "THE BED", int(190 * (0.6 + 0.4 * pop)), WHITE, clamp(pop * 2))
    f.fill((0, 0, 0), 1 - smooth(0, 0.4, c.t))
    return f


def sc_explode(c):
    te = c.wt("apart") - 0.35
    e = smooth(te, te + 1.3, c.t)
    cam = S3.Camera(-0.95 + 0.12 * c.g, lerp(0.42, 0.3, e), lerp(560, 900, ease_io(e)), (0, lerp(38, 175, ease_io(e)), 0))
    f = stage(c, cam, full_bed(explode=e))
    if c.t > te:
        c.shake = 6 * (1 - clamp((c.t - te) / 0.5))
    return f


PLANKS = [((-40 + col * 22, row * 6.5, -95), (-22 + col * 22, row * 6.5 + 4, 95)) for row in range(5) for col in range(4)]
STICKS = [((-42, row * 6.5 + 4, z - 2), (48, row * 6.5 + 6.5, z + 2)) for row in range(4) for z in (-70, 0, 70)]


def sc_wood(c):
    tk = c.wt("kiln") - 0.3
    dry = smooth(tk, tk + 3.0, c.t)
    cam = orbit(c, 0.6, 0.1, 0.38, 380, (0, 18, 0))
    col = lerp_c(WOOD_WET, WOOD, dry)
    objs = []
    for a, b in PLANKS:
        objs += S3.split_box(a, b, 2, 5, col, grain=2)
    for a, b in STICKS:
        objs += S3.split_box(a, b, 0, 4, WOOD_D, grain=0)
    f = stage(c, cam, objs)
    header(f, c, 0, "THE WOOD")
    if c.t > tk:
        k = smooth(tk, tk + 0.6, c.t) * (1 - smooth(c.T - 1, c.T, c.t) * 0.5)
        img, d = f.layer()
        for i in range(9):
            x = 160 + i * 95
            pts = []
            for s in range(30):
                yy = 1120 - s * 18 - (c.g * 160 + i * 37) % 40
                pts.append((x + 14 * math.sin(s * 0.5 + c.g * 4 + i), yy))
            d.line(pts, fill=(255, 140, 50, 150), width=6)
        f.comp(img, k)
        glow(f, 540, 1000, 520, (255, 100, 30), 0.35 * k)
        # medidor de humedad
        v = int(round(lerp(40, 10, ease_out((c.t - tk) / 3.0))))
        cx, cy, r = 540, 520, 120
        img, d = f.layer()
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(16, 17, 24, 220), outline=(255, 255, 255, 60), width=14)
        d.arc([cx - r, cy - r, cx + r, cy + r], -90, -90 + 360 * v / 40, fill=(90, 180, 255, 255), width=14)
        f.comp(img, clamp((c.t - tk) / 0.3))
        text_big(f, cx, cy - 8, f"{v}%", 92, (150, 210, 255), clamp((c.t - tk) / 0.3), stroke=6)
        text_label(f, cx, cy + 60, "MOISTURE", 26, WHITE, clamp((c.t - tk) / 0.3), stroke=4)
    return f


def sc_cut(c):
    th, tf, tr = c.wt("headboard") - 0.15, c.wt("footboard") - 0.15, c.wt("rails") - 0.3
    cam = orbit(c, 0.7, 0.08, 0.45, 540, (0, 32, 0))
    objs = frame_parts(head=clamp((c.t - th) / 0.45), foot=clamp((c.t - tf) / 0.45), rails=clamp((c.t - tr) / 0.45),
                       gap=1.0, lift=1.0)
    f = stage(c, cam, objs)
    header(f, c, 1, "THE FRAME")
    callout_at(f, c, cam, (0, 92, -100), "HEADBOARD", 540, 470, "headboard", dt=0.3)
    callout_at(f, c, cam, (0, 38, 112), "FOOTBOARD", 760, 1280, "footboard", dt=0.3)
    callout_at(f, c, cam, (-79, 47, 20), "SIDE RAILS", 260, 1180, "rails", dt=0.15)
    return f


def sc_joints(c):
    tj = c.wt("joined") - 0.2
    tb = c.wt("brackets") - 0.2
    ts = c.wt("solid") - 0.3
    gap = 1 - smooth(tj, tj + 0.5, c.t)
    lift = 1 - land((c.t - tb) / 0.45) if c.t > tb else 1.0
    pb = ease_io((c.t - ts) / 1.4)
    cam = S3.Camera(0.75 + 0.05 * c.g, lerp(0.32, 0.45, pb), lerp(230, 560, pb),
                    tuple(lerp(np.array([-72, 28, -92]), np.array([0, 32, 0]), pb)))
    objs = frame_parts(gap=gap, lift=lift)
    hz = -14 * gap
    plates = [S3.Box((-75.9, 21, -95.5), (-75.2, 34, -88), STEEL, shadow=False, offset=(0, 12 * lift, 0)),
              S3.Box((-75, 20.5, -97 + hz), (-67, 34.5, -96.3 + hz), STEEL, shadow=False)]
    for k in range(3):
        plates.append(S3.Box((-75.4, 24 + k * 3.5, -96.4 + hz), (-74.4, 25.2 + k * 3.5, -95.6 + hz), (120, 126, 136),
                             shadow=False, outline=False))
    bolt = [S3.Cylinder((-79.5, 27.5, 99.5), 1.0, 12, STEEL, n=10, stripes=False)]
    f = stage(c, cam, objs + plates + bolt)
    header(f, c, 2, "THE JOINTS")
    callout_at(f, c, cam, (-75.5, 28, -93), "HOOK BRACKET", 700, 560, "hook", dt=0.0)
    tbo = c.wt("bolts") - 0.1
    if c.t > tbo and pb < 0.2:
        callout(f, cam, (-72, 30, -96), "BOLTS + BARREL NUTS", 600, 1180, ease_out((c.t - tbo) / 0.3) * (1 - pb * 5))
    if c.t > tb:
        c.shake = 4 * (1 - clamp((c.t - tb - 0.3) / 0.3)) if c.t > tb + 0.3 else 0.0
    return f


def sc_supports(c):
    ts = c.wt("support") - 0.25
    tc = c.wt("center") - 0.25
    sp = clamp((c.t - ts) / 0.45)
    screws = int(clamp((c.t - ts - 0.6) / 1.2) * 8.99)
    cam = orbit(c, 0.55, 0.07, 0.7, 520, (0, 25, 0))
    objs = frame_parts() + base_parts(supports=sp, beam=clamp((c.t - tc) / 0.45), slats=0, screws=screws)
    f = stage(c, cam, objs)
    header(f, c, 3, "SUPPORTS")
    callout_at(f, c, cam, (74, 24.5, 40), "SUPPORT STRIP", 760, 450, "strip", dt=0.2)
    callout_at(f, c, cam, (0, 25, -40), "CENTER BEAM", 330, 1250, "center", dt=0.35)
    return f


def slat_times(c):
    t0 = c.wt("slats") - 0.25
    return t0, 0.12


def sc_slats(c):
    t0, step = slat_times(c)
    n = clamp((c.t - t0) / step, 0, 14 + 3) / 1.0
    tb = c.wt("bends") - 0.1

    def wob(i):
        u = c.t - tb - i * 0.03
        if u < 0:
            return 0.0
        return 3.2 * abs(math.sin(u * 16)) * math.exp(-u * 2.2)
    cam = orbit(c, 0.5, 0.06, 0.55, 520, (0, 25, 0))
    slats = sum(clamp((c.t - t0 - i * step) / 0.35) for i in range(14))
    progress = [clamp((c.t - t0 - i * step) / 0.35) for i in range(14)]
    objs = frame_parts() + base_parts(slats=0)
    for i, p in enumerate(progress):
        if p <= 0:
            continue
        objs += moved(g_slat(i, dy=wob(i)), (0, 90 * (1 - land(p)), 0)) + g_holder(i)
    f = stage(c, cam, objs)
    header(f, c, 4, "THE SLATS")
    callout_at(f, c, cam, (30, 27, SLAT_Z[9]), "LAYERED BEECH", 760, 470, "beech", dt=0.1)
    callout_at(f, c, cam, (-75, 27, SLAT_Z[4]), "RUBBER HOLDERS", 300, 1240, "rubber", dt=0.1)
    _ = n, slats
    return f


def floating_mattress(c, base_y=60):
    bob = 4 * math.sin(c.g * 1.4)
    o = []
    o += moved(g_springs(pocket=False), (0, base_y + bob, 0))
    o += moved(g_layer("felt"), (0, base_y + 25 + bob * 1.2, 0))
    o += moved(g_layer("hr"), (0, base_y + 48 + bob * 1.4, 0))
    o += moved(g_layer("mem"), (0, base_y + 72 + bob * 1.6, 0))
    o += moved([S3.Box((-76, 59, -96), (76, 61, 96), COVER, top=quilt_top())], (0, base_y + 100 + bob * 1.8, 0))
    return o, bob


def sc_intro(c):
    cam = orbit(c, 0.9, 0.1, 0.32, 760, (0, 110, 0))
    objs, bob = floating_mattress(c)
    f = stage(c, cam, frame_parts() + base_parts() + objs)
    header(f, c, None, "THE MATTRESS")
    t0 = c.wt("sandwich") - 0.2
    for k, (txt, y3) in enumerate([("COVER", 160), ("MEMORY FOAM", 132), ("FOAM", 108), ("SPRINGS", 78)]):
        tk = t0 + k * 0.28
        if c.t > tk:
            callout(f, cam, (76, y3 + bob * (1.8 - k * 0.2), 30), txt, 860, 470 + k * 120, ease_out((c.t - tk) / 0.3))
    return f


def sc_coil(c):
    t0 = 0.2
    turns = 6 * ease_out((c.t - t0) / 2.6)
    th = c.wt("heat") - 0.2
    heat = smooth(th, th + 0.4, c.t) * (1 - smooth(th + 1.5, th + 2.3, c.t))
    cam = S3.Camera(0.3 + 0.35 * c.g, 0.22, 230, (0, 32, 0))
    objs = []
    if turns > 0.05:
        objs.append(S3.Helix((0, 0, 0), 15, 64 * turns / 6, max(0.05, turns), wire=1.5, glow=heat))
    spool = S3.Cylinder((-55, 70, -30), 16, 26, (120, 128, 140), n=18, spin=c.g * 4)
    objs.append(spool)
    if turns < 6:
        a = 2 * math.pi * turns
        tip = np.array([15 * math.cos(a), 64 * turns / 6, 15 * math.sin(a)], np.float32)

        def wire(d, cam, tip=tip):
            d.line(cam.px(np.array([[-55, 86, -30], tip], np.float32)), fill=STEEL + (255,),
                   width=int(1.5 * S3.SS * cam.f / 230))
        objs.append(S3.Custom((-20, 60, -10), wire))
    f = stage(c, cam, objs, grid_alpha=40)
    if heat > 0:
        x, y, _ = cam.project(np.array([0, 32, 0], np.float32))
        glow(f, x, y, 420, (255, 110, 30), 0.9 * heat)
    header(f, c, 5, "THE SPRINGS")
    callout_at(f, c, cam, (-55, 86, -30), "STEEL WIRE", 300, 520, "wire", dt=0.0)
    if c.t > th:
        callout(f, cam, (15, 40, 0), "HEAT TREATED", 760, 1180, ease_out((c.t - th) / 0.3), (255, 140, 60))
    return f


def pocket_state(c):
    ty = c.wt("so") - 0.3
    tp = c.wt("rolls") - 0.35
    you = clamp((c.t - ty) / 0.4)
    par = clamp((c.t - tp) / 0.4)
    px = -36
    pz = 25 * math.sin((c.t - tp) * 2.2) if c.t > tp else 0.0
    return you, par, (36, 0), (px, pz)


def sc_pocket(c):
    you, par, (yx, yz), (px, pz) = pocket_state(c)

    def comp(x, z):
        k = 1.0
        if you > 0:
            d = math.hypot(x - yx, z - yz)
            k -= 0.4 * land(you) * max(0.0, 1 - d / 26)
        if par > 0:
            d = math.hypot(x - px, z - pz)
            k -= 0.5 * land(par) * max(0.0, 1 - d / 28)
        return max(0.35, k)

    def grow(i, j):
        return ease_out_back((c.t - 0.1 - (i + j) * 0.035) / 0.3) if c.t < 2.5 else 1.0
    cam = orbit(c, 0.45, 0.05, 0.5, 330, (0, 32, 0))
    objs = g_springs(compress=comp, grow=grow)
    r = 13
    if you > 0:
        h = 16.1 * comp(yx, yz)
        sph = S3.Sphere((yx, 29.2 + h + r + 180 * (1 - land(you)), yz), r, (90, 150, 225))
        sph.on_top = True
        objs.append(sph)
    if par > 0:
        h = 16.1 * comp(px, pz)
        sph = S3.Sphere((px, 29.2 + h + r + 180 * (1 - land(par)), pz), r, (230, 120, 90))
        sph.on_top = True
        objs.append(sph)
    f = stage(c, cam, objs)
    header(f, c, 5, "POCKET SPRINGS")
    callout_at(f, c, cam, (SPR_X[4], 40, SPR_Z[10]), "ONE POCKET PER SPRING", 540, 1240, "own", dt=0.0)
    py3 = (px, 29.2 + 16.1 * comp(px, pz) + 2 * r, pz)
    yy3 = (yx, 29.2 + 16.1 * comp(yx, yz) + 2 * r, yz)
    you_left = cam.project(np.array(yy3, np.float32))[0] < cam.project(np.array(py3, np.float32))[0]
    if you > 0:
        callout(f, cam, yy3, "YOU", 260 if you_left else 820, 470, you)
    if par > 0:
        callout(f, cam, py3, "PARTNER", 820 if you_left else 260, 470, par, (255, 150, 120))
    return f


def foam_times(c):
    return c.wt("mixing") - 0.3, c.wt("rise") - 0.3, c.wt("memory") - 0.35


def sc_foam(c):
    tm, tr, tmem = foam_times(c)
    if c.t < tmem:
        cam = orbit(c, 0.5, 0.08, 0.3, 430, (0, 45, 0))
        hgt = lerp(4, 34, smooth(tm, tr, c.t)) + 70 * ease_out((c.t - tr) / 1.6) if c.t > tr else lerp(
            4, 34, smooth(tm, tr + 0.5, c.t))
        objs = [S3.Box((-62, 0, -52), (62, 38, -48), STEEL), S3.Box((-62, 0, 48), (62, 38, 52), STEEL),
                S3.Box((-62, 0, -48), (-58, 38, 48), STEEL), S3.Box((58, 0, -48), (62, 38, 48), STEEL),
                S3.Box((-58, 0, -48), (58, hgt, 48), HR, outline=False)]

        def streams(d, cam):
            if c.t < tr + 0.6:
                for x, col in ((-20, (90, 160, 255)), (20, (255, 150, 60))):
                    d.line(cam.px(np.array([[x, 200, 0], [x, hgt, 0]], np.float32)), fill=col + (255,),
                           width=int(3 * S3.SS * cam.f / 430))
        objs.append(S3.Custom((0, 120, 0), streams))
        f = stage(c, cam, objs)
        if tm < c.t < tr + 0.6:
            a = ease_out((c.t - tm) / 0.3)
            callout(f, cam, (-20, 150, 0), "POLYOL", 250, 470, a, (110, 170, 255))
            callout(f, cam, (20, 150, 0), "ISOCYANATE", 800, 470, a, (255, 160, 80))
        if c.t > tr:
            text_label(f, 540, 1200, "IT RISES LIKE A CAKE", 44, ACCENT, ease_out((c.t - tr - 0.4) / 0.3))
    else:
        u = c.t - tmem
        cam = orbit(c, 0.6, 0.06, 0.45, 470, (0, 45, 0))
        tmo = c.wt("mold") - 0.25
        dent_k = smooth(tmo, tmo + 0.7, c.t)
        mem = moved(g_layer("mem"), (0, 100 * (1 - land(u / 0.5)), 0))
        if dent_k > 0:
            def dent(d, cam, box, k=dent_k):
                th = np.linspace(0, 2 * np.pi, 28)
                P = np.stack([-10 + 22 * k * np.cos(th), np.full_like(th, 59.05), 20 + 22 * k * np.sin(th)], 1)
                d.polygon(cam.px(P.astype(np.float32)), fill=(84, 130, 180, 255))
            mem[0].top = dent
        objs = g_springs(pocket=False) + g_layer("felt") + g_layer("hr") + mem
        if dent_k > 0 or c.t > tmo - 0.5:
            sy = 59 + 18 - 6 * dent_k + 120 * (1 - land((c.t - tmo + 0.5) / 0.5))
            objs.append(S3.Sphere((-10, sy, 20), 18, (235, 190, 160)))
        f = stage(c, cam, objs)
        callout(f, cam, (60, 56, 60), "MEMORY FOAM", 780, 470, ease_out(u / 0.3), (130, 190, 255))
        callout(f, cam, (60, 50, 60), "HR FOAM", 300, 1240, ease_out((u - 0.2) / 0.3))
        f.fill((255, 255, 255), 0.7 * (1 - ease_out(u / 0.3)))
    header(f, c, 6, "THE FOAM")
    return f


def cover_times(c):
    return 0.15, c.wt("wraps") - 0.25, c.wt("sews") - 0.25


def sc_cover(c):
    t0, tw, ts = cover_times(c)
    wrap = smooth(tw, tw + 1.0, c.t)
    tape = clamp((c.t - ts) / 2.4)
    cam = orbit(c, 0.5, 0.09, 0.42, 470, (0, 42, 0))
    needle = []
    drop = 140 * (1 - land((c.t - t0) / 0.5))
    cov = moved(g_cover(wrap=wrap, tape=tape, needle=needle), (0, drop, 0))
    inner = [] if wrap >= 1 else clip_below(g_springs(pocket=False) + g_layer("felt") + g_layer("hr") + g_layer("mem"),
                                            cov[0].aabb()[0][1] if drop < 0.5 else 1e9)
    f = stage(c, cam, frame_parts() + base_parts() + inner + cov)
    if needle and 0 < tape < 1:
        x, y, _ = cam.project(np.array(needle[0], np.float32))
        glow(f, x, y, 60, (255, 230, 150), 1.2)
    header(f, c, 7, "THE COVER")
    callout_at(f, c, cam, (20, 61, 10), "QUILTED COVER", 760, 470, "quilted", dt=0.1)
    if c.t > ts:
        callout(f, cam, (76, 61, 40), "EDGE TAPE", 800, 1230, ease_out((c.t - ts - 0.3) / 0.3), (150, 170, 230))
    return f


def sc_test(c):
    z = 72 * math.sin(c.g * 1.5)
    cam = orbit(c, 0.62, 0.05, 0.36, 520, (0, 45, 0))
    r = 12
    roller = S3.Cylinder((0, 61 + r, z), r, 168, (150, 156, 168), n=20, spin=-z / r)
    posts = [S3.Box((x0, 0, z - 3), (x0 + 6, 76, z + 3), (95, 100, 112)) for x0 in (-96, 90)]
    axle = [S3.Box((-90, 61 + 2 * r + 0.5, z - 1.2), (-84, 61 + 2 * r + 3, z + 1.2), (95, 100, 112), shadow=False),
            S3.Box((84, 61 + 2 * r + 0.5, z - 1.2), (90, 61 + 2 * r + 3, z + 1.2), (95, 100, 112), shadow=False)]
    f = stage(c, cam, frame_parts() + base_parts() + g_cover() + [roller] + posts + axle)
    header(f, c, 8, "TESTING")
    cyc = int(30000 * ease_out(c.t / c.T))
    text_label(f, 540, 360, "CYCLES", 34, (200, 210, 230))
    text_big(f, 540, 430, f"{cyc:,}", 96, ACCENT, stroke=7)
    return f


def final_times(c):
    return c.wt("mattress") - 0.2, c.wt("duvet") - 0.25, c.wt("pillows") - 0.2, c.wt("built") - 0.3


def sc_final(c):
    tm, td, tp, tb = final_times(c)
    k = ease_io(c.t / (c.T + 1))
    cam = S3.Camera(0.4 + 1.1 * k, lerp(0.5, 0.36, k), lerp(470, 600, k), (0, 38, 0))
    objs = frame_parts() + base_parts()
    if c.t > tm:
        objs += moved(g_cover(), (0, 140 * (1 - land((c.t - tm) / 0.5)), 0))
    objs += g_bedding(clamp((c.t - td) / 0.6), clamp((c.t - tp) / 0.5))
    f = stage(c, cam, objs)
    if c.t > tb:
        pop = ease_out_back((c.t - tb) / 0.4)
        text_label(f, 540, 170, "HOW IT'S BUILT", 46, ACCENT, clamp(pop * 2))
        text_big(f, 540, 300, "THE BED", int(190 * (0.6 + 0.4 * pop)), WHITE, clamp(pop * 2))
    f.fill((0, 0, 0), smooth(c.T - 1.2, c.T, c.t))
    return f


# (escena, narración, pausa después)
BEATS = [
    (sc_hook, "You sleep on one every night. But how is a bed actually built?", 0.3),
    (sc_explode, "Let's take one apart, and build it again, from scratch.", 0.4),
    (sc_wood, "It all starts with wood. Pine, beech or oak, dried in a kiln until only about ten percent moisture is "
              "left, so it won't warp or creak later.", 0.3),
    (sc_cut, "The wood is cut into the main parts: a headboard, a footboard, and two side rails.", 0.4),
    (sc_joints, "They're joined with steel hook brackets, or bolts with barrel nuts. The frame becomes rock solid, but it "
                "can still come apart.", 0.3),
    (sc_supports, "Inside each rail, a support strip is screwed in. And on bigger beds, a center beam with legs stops "
                  "the middle from sagging.", 0.3),
    (sc_slats, "Next, the base. Curved slats of layered beech drop into rubber holders. Every slat bends slightly, "
               "working like a spring.", 0.3),
    (sc_intro, "Now, the most complex part: the mattress. It's a sandwich of layers, built from the inside out.", 0.3),
    (sc_coil, "It begins with the core. A machine coils steel wire into springs, then heat treats them so they keep "
              "their shape for years.", 0.3),
    (sc_pocket, "In a pocket spring mattress, every spring gets its own fabric pocket. So when your partner rolls "
                "over, you don't feel a thing.", 0.3),
    (sc_foam, "On top go the comfort layers. Foam is made by mixing two liquids that react and rise like a giant "
              "cake. Then comes memory foam, which softens with your body heat to mold to your shape.", 0.3),
    (sc_cover, "A quilted cover wraps around everything, and a machine sews the edge tape that seals it shut.", 0.4),
    (sc_test, "Before it leaves the factory, a heavy roller rolls over it thousands of times, simulating years of use.",
     0.3),
    (sc_final, "Frame, slats, mattress. Add sheets, a duvet, and pillows. And that's how a bed is built.", 2.2),
]

TL = []


def render_frame(n):
    g = n / FPS
    i = 0
    for k, (s, d, _, _) in enumerate(TL):
        if g >= s:
            i = k
    s, T, words, groups = TL[i]
    c = Ctx(g - s, T, g, words)
    f = BEATS[i][0](c)
    img = f.image()
    z = 1 + 0.025 * (c.t / T if i % 2 == 0 else 1 - c.t / T)
    if i > 0:
        z += 0.06 * (1 - ease_out(c.t / 0.3))
    ox = c.shake * math.sin(g * 73.0)
    oy = c.shake * math.sin(g * 91.0 + 1)
    if z != 1 or c.shake:
        zw, zh = int(W * z + 2 * abs(ox) + 2), int(H * z + 2 * abs(oy) + 2)
        big = img.resize((zw, zh), Image.BILINEAR)
        x0, y0 = int((zw - W) / 2 + ox), int((zh - H) / 2 + oy)
        img = big.crop((x0, y0, x0 + W, y0 + H))
    out = Frame(np.asarray(img, np.float32))
    draw_caption(out, groups, c.t)
    if i == 0:
        out.fill((0, 0, 0), 1 - smooth(0, 0.4, c.t))
    return np.clip(out.a, 0, 255).astype(np.uint8).tobytes()


# ================================================================ sonido
def build_audio(total, voices):
    sr = A.SR
    n = int(total * sr) + sr
    voice = np.zeros(n, np.float32)
    music = np.zeros(n, np.float32)
    drums = np.zeros(n, np.float32)
    sfx = np.zeros(n, np.float32)
    for (s, _, _, _), v in zip(TL, voices):
        if v is not None:
            A.put(voice, v, s)
    st = [s for s, _, _, _ in TL]

    def ctx(b):
        s, T, words, _ = TL[b]
        return Ctx(0, T, 0, words)

    def gt(b, word, nth=0):
        return st[b] + ctx(b).wt(word, nth=nth)

    def fx(name_fn, at, gain=1.0):
        A.put(sfx, name_fn, at, gain)

    # --- música: 100 bpm, C – Am – F – G
    beat = 0.6
    bar = beat * 4
    chords = [(130.81, 164.81, 196.0), (110.0, 130.81, 164.81), (87.31, 110.0, 130.81), (98.0, 123.47, 146.83)]
    roots = [65.41, 55.0, 43.65, 49.0]
    nbars = int(total / bar) + 2
    for b in range(nbars):
        t0 = b * bar
        ch = chords[b % 4]
        A.put(music, A.pad([x * 2 for x in ch], bar + 0.4, 0.3, 0.4, 1600, b) * 0.9, t0)
        for k in range(8):
            A.put(music, A.pluck(ch[k % 3] * 4 * (2 if k % 4 == 3 else 1), 0.8) * 0.28, t0 + k * beat / 2)
    end_drums = gt(13, "built") - 0.3
    sections = [(st[2], st[7]), (st[8], end_drums)]
    for a, b in sections:
        tt = math.ceil(a / beat) * beat
        k = 0
        while tt < b - 0.05:
            pos = k % 8
            bi = int(tt / bar) % 4
            if pos in (0, 4) or (pos == 6 and k % 16 > 8):
                A.put(drums, A.kick(), tt, 1.0)
            if pos in (2, 6):
                A.put(drums, A.snare(), tt, 0.55)
            A.put(drums, A.hat(seed=k % 7), tt, 0.35 if k % 2 else 0.2)
            A.put(drums, A.hat(seed=k % 5 + 9), tt + beat / 4, 0.12)
            A.put(music, A.bass_note(roots[bi] * (2 if pos in (3, 7) else 1)), tt, 0.9)
            tt += beat / 2
            k += 1
    # golpe final
    A.put(music, A.pad([130.81, 196.0, 261.63, 329.63, 392.0], 4.0, 0.02, 3.0, 2600, 99) * 2.0, end_drums + 0.3)

    # --- efectos sincronizados con la animación
    for b in range(1, 14):
        fx(A.whoosh(0.5, b), st[b] - 0.3, 0.35)
    fx(A.hit(), st[0] + 0.3, 0.5)
    te = gt(1, "apart") - 0.35
    fx(A.whoosh(1.2, 2, up=True), te - 0.1, 0.8)
    fx(A.boom(1.5), te + 0.1, 0.5)
    tk = gt(2, "kiln") - 0.3
    fx(A.fizz(3.0), tk, 0.25)
    for w, dt in (("headboard", 0.3), ("footboard", 0.3), ("rails", 0.15)):
        fx(A.thunk(), gt(3, w) + dt, 1.0)
    fx(A.thunk(f=120), gt(4, "joined") + 0.3, 0.9)
    fx(A.clink(), gt(4, "brackets") + 0.15, 0.9)
    fx(A.clink(), gt(4, "bolts") + 0.1, 0.6)
    ts = gt(5, "support") - 0.25
    fx(A.thunk(), ts + 0.35, 0.8)
    for k in range(8):
        fx(A.tick(k % 2 == 0), ts + 0.6 + k * 0.15, 0.5)
    fx(A.thunk(f=110), gt(5, "center") + 0.1, 0.9)
    c6 = ctx(6)
    t0, step = slat_times(c6)
    for i in range(14):
        fx(A.thunk(f=190 + 8 * i, dur=0.2), st[6] + t0 + i * step + 0.25, 0.55)
    fx(A.boing(), gt(6, "bends") - 0.1, 0.6)
    for k in range(4):
        fx(A.pop(), gt(7, "sandwich") - 0.2 + k * 0.28, 0.5)
    fx(A.sew(2.4), st[8] + 0.2, 0.35)
    fx(A.fizz(1.6), gt(8, "heat") - 0.2, 0.4)
    c9 = ctx(9)
    fx(A.thunk(f=90), st[9] + c9.wt("so") - 0.3 + 0.3, 0.7)
    fx(A.boing(), st[9] + c9.wt("so") + 0.05, 0.4)
    fx(A.thunk(f=80), st[9] + c9.wt("rolls") - 0.35 + 0.3, 0.8)
    fx(A.boing(), st[9] + c9.wt("rolls") + 0.0, 0.5)
    c10 = ctx(10)
    tm, tr, tmem = foam_times(c10)
    fx(A.fizz(tmem - tm), st[10] + tm, 0.35)
    fx(A.hit(), st[10] + tmem, 0.5)
    fx(A.thunk(f=100), st[10] + tmem + 0.35, 0.7)
    c11 = ctx(11)
    _, tw, tsw = cover_times(c11)
    fx(A.thunk(f=140), st[11] + 0.5, 0.6)
    fx(A.whoosh(0.9, 7), st[11] + tw, 0.5)
    fx(A.sew(2.4), st[11] + tsw, 0.6)
    fx(A.rumble(TL[12][1]), st[12], 0.7)
    c13 = ctx(13)
    fm, fd, fp, fb = final_times(c13)
    fx(A.thunk(f=90), st[13] + fm + 0.35, 0.9)
    fx(A.whoosh(0.8, 11, up=False), st[13] + fd, 0.4)
    fx(A.pop(), st[13] + fp + 0.35, 0.5)
    fx(A.pop(), st[13] + fp + 0.4, 0.4)
    fx(A.hit(), st[13] + fb, 0.6)

    music = A.reverb(music, 2.2, 0.3)
    bed = A.duck(music * 0.75 + drums * 0.6, voice, 0.5)
    mix = voice * 1.0 + bed * 0.3 + sfx * 0.45
    fo = int(1.5 * sr)
    e = int(total * sr)
    mix[e - fo:e] *= np.linspace(1, 0, fo, dtype=np.float32)
    mix[e:] = 0
    mix /= max(1.0, np.abs(mix).max() / 0.95)
    return np.stack([mix, mix], 1)[:e]


# ================================================================ principal
def prepare():
    os.makedirs(WORK, exist_ok=True)
    voices = []
    for i, (_, text, gap) in enumerate(BEATS):
        voices.append(A.synth_voice(text, PIPER_MODEL, PIPER_LENGTH, os.path.join(WORK, f"v{i:02d}.wav")))
        print(f"voz {i + 1}/{len(BEATS)}", flush=True)
    t = 0.0
    for (fn, text, gap), v in zip(BEATS, voices):
        words = [(w, a + LEAD, b + LEAD) for w, a, b in A.word_times(text, v)]
        dur = LEAD + len(v) / A.SR + gap
        TL.append((t, dur, words, group_words([(w.upper(), a, b) for w, a, b in words])))
        t += dur
    return t, [np.concatenate([np.zeros(int(LEAD * A.SR), np.float32), v]) for v in voices]


def main():
    total, voices = prepare()
    wav = os.path.join(WORK, "mix.wav")
    A.write_wav(wav, build_audio(total, voices))
    nframes = int(total * FPS)
    print(f"duración {total:.1f}s, {nframes} fotogramas", flush=True)
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", wav,
                           "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p",
                           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT],
                          stdin=subprocess.PIPE)
    with Pool(os.cpu_count()) as pool:
        for k, buf in enumerate(pool.imap(render_frame, range(nframes), chunksize=4)):
            ff.stdin.write(buf)
            if k % 300 == 0:
                print(f"fotograma {k}/{nframes}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("listo:", OUT)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Genera el short vertical animado en 3D "Cómo se hace: el lápiz" (en español).

Todo se genera con código: escenas 3D (common/scene3d.py), voz neuronal Kokoro en español,
subtítulos palabra a palabra, música y efectos sintetizados.

Uso:
    python3 make_lapiz.py [carpeta_de_trabajo] [salida.mp4]

Voz: descarga el modelo Kokoro y apunta KOKORO_DIR a su carpeta:
    pip install kokoro-onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
    KOKORO_DIR=. python3 make_lapiz.py
Requisitos: python3, numpy, scipy, Pillow, kokoro-onnx, ffmpeg.
"""
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
from engine import (FPS, H, W, WHITE, YELLOW, Frame, big_font, clamp, draw_caption, ease_out,  # noqa: E402
                    ease_out_back, glow, group_words, label_font, lerp, lerp_c, smooth, text_big, text_label,
                    vgrad)

WORK = sys.argv[1] if len(sys.argv) > 1 else "build"
OUT = sys.argv[2] if len(sys.argv) > 2 else "como-se-hace-un-lapiz.mp4"
KOKORO_DIR = os.environ.get("KOKORO_DIR", "kokoro")
VOICE = os.environ.get("KOKORO_VOICE", "em_alex")
SPEED = float(os.environ.get("KOKORO_SPEED", "1.05"))
LEAD = 0.12

# ---------------------------------------------------------------- colores
CEDAR = (214, 150, 104)
CEDAR_D = (184, 120, 80)
GRAPH = (62, 64, 72)
CLAY = (196, 170, 130)
STEEL = (178, 186, 198)
BRASS = (214, 196, 140)
ERASER = (242, 140, 150)
PAINT = (255, 200, 30)
WAX = (240, 226, 172)
ACCENT = (255, 196, 60)
BG = vgrad((34, 36, 46), (12, 13, 18))

# geometría (1 unidad = 1 mm)
N = 9
PITCH = 9.4
ZS = (np.arange(N) - (N - 1) / 2) * PITCH
HALF_W = N * PITCH / 2
SLAT_L = 92.0
LEAD_R = 1.0
YC = 3.6 + LEAD_R  # centro de las minas y de los lápices
PR = 4.6  # radio (a los vértices) del hexágono


def ease_io(t):
    t = clamp(t)
    return t * t * (3 - 2 * t)


def land(p):
    p = clamp(p)
    if p < 0.7:
        return (p / 0.7) ** 2
    u = (p - 0.7) / 0.3
    return 1 - 0.06 * math.sin(u * math.pi)


# ================================================================ piezas
def grooves_top(progress=1.0, glue=0.0):
    """Dibuja los canales (y el pegamento) sobre la cara superior de la tablilla."""
    def draw(d, cam, box):
        a, b = box.a + box.offset, box.b + box.offset
        y = b[1] + 0.02
        # cada tramo dibuja solo su parte del canal (la tablilla está dividida en tramos)
        for z_list, w, end, col in ((ZS, 1.1, -SLAT_L + 2 * SLAT_L * progress, (140, 92, 58, 255)),
                                    (ZS[:-1] + PITCH / 2, 0.9, -SLAT_L + 4 + (2 * SLAT_L - 8) * glue,
                                     (250, 250, 240, 255))):
            lo = max(a[0], -SLAT_L + (4 if w < 1 else 0))
            hi = min(b[0], end)
            if hi <= lo:
                continue
            for z in z_list:
                P = np.array([[lo, y, z - w], [hi, y, z - w], [hi, y, z + w], [lo, y, z + w]], np.float32)
                d.polygon(cam.px(P), fill=col)
    return draw


def slat(y0, y1, top=None, dy=0.0):
    return S3.split_box((-SLAT_L, y0 + dy, -HALF_W), (SLAT_L, y1 + dy, HALF_W), 0, 6, CEDAR, grain=0, top=top)


def lead_rod(z, x0=-SLAT_L, x1=SLAT_L, dy=0.0, color=GRAPH, y=YC):
    return S3.Cylinder(((x0 + x1) / 2, y + dy, z), LEAD_R, x1 - x0, color, n=10, stripes=False)


def end_disc(x, z, r, color, side, y=YC):
    """Disco de la mina visible en la punta cortada (solo si la cámara mira ese extremo)."""
    def draw(d, cam):
        if (cam.pos[0] - x) * side <= 0:
            return
        th = np.linspace(0, 2 * np.pi, 16)
        P = np.stack([np.full_like(th, x + 0.05 * side), y + r * np.sin(th), z + r * np.cos(th)], 1).astype(np.float32)
        d.polygon(cam.px(P), fill=color + (255,))
    c = S3.Custom((x, y, z), draw)
    c.on_top = True
    return c


def pencil(z, x0=-88.0, x1=88.0, paint=0.0, dy=0.0, dz=0.0, sharp=0.0, ferrule=0.0, eraser=0.0, stamp=0.0,
           segs=12, y=YC):
    """Lápiz hexagonal a lo largo de x. paint: avance de la pintura (0..1) desde -x."""
    o = []
    zz = z + dz
    yy = y + dy
    body0 = x0 + 18 * sharp if sharp > 0 else x0
    xs = np.linspace(body0, x1, segs + 1)
    front = lerp(body0 - 1, x1 + 1, paint)
    for k in range(segs):
        xm = (xs[k] + xs[k + 1]) / 2
        col = PAINT if xm < front else CEDAR
        o.append(S3.Cylinder((xm, yy, zz), PR, xs[k + 1] - xs[k], col, n=6, stripes=False, amb=0.55,
                             caps=(k == 0, k == segs - 1)))
    if sharp > 0:
        L = 18 * sharp
        o.append(S3.Cylinder((body0 - L / 2, yy, zz), LEAD_R + 0.3, L, CEDAR_D, n=24, stripes=False, r_end=PR * 0.92))
        lp = 6 * sharp
        o.append(S3.Cylinder((body0 - L - lp / 2, yy, zz), 0.15, lp, GRAPH, n=12, stripes=False, r_end=LEAD_R + 0.3))
    else:
        o.append(end_disc(x0, zz, LEAD_R, GRAPH, -1, y=yy))
    if ferrule > 0:
        fx = x1 + 6 + 120 * (1 - land(ferrule))
        o.append(S3.Cylinder((fx, yy, zz), PR * 0.98, 12, BRASS, n=24, stripes=True))
    else:
        o.append(end_disc(x1, zz, LEAD_R, GRAPH, 1, y=yy))
    if eraser > 0:
        ex = x1 + 12 + 4.5 + 160 * (1 - land(eraser))
        o.append(S3.Cylinder((ex, yy, zz), PR * 0.9, 9, ERASER, n=24, stripes=False))
    if stamp > 0:
        def txt(d, cam, zz=zz, yy=yy, a=stamp):
            p0 = cam.project(np.array([20, yy + PR * 0.87, zz], np.float32))
            p1 = cam.project(np.array([60, yy + PR * 0.87, zz], np.float32))
            ang = math.degrees(math.atan2(-(p1[1] - p0[1]), p1[0] - p0[0]))
            size = max(8, int(4.2 * cam.f / p0[2] * S3.SS))
            from engine import label_font as lf
            im = Image.new("RGBA", (size * 8, size * 2), (0, 0, 0, 0))
            ImageDraw.Draw(im).text((size * 4, size), "HB  LÁPIZ", font=lf(size), fill=(40, 120, 60, int(255 * a)),
                                    anchor="mm")
            im = im.rotate(ang, expand=True, resample=Image.BICUBIC)
            cx, cy = (p0[0] + p1[0]) / 2 * S3.SS, (p0[1] + p1[1]) / 2 * S3.SS
            d._image.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))
        c = S3.Custom((40, yy + PR, zz), txt)
        c.on_top = True
        o.append(c)
    return o


# ================================================================ escenario y UI
def stage(c, cam, objs, grid_alpha=55, spot=(540, 860)):
    f = Frame(BG)
    glow(f, spot[0], spot[1], 760, (70, 76, 100), 0.55)
    f.comp(S3.floor_grid(cam, W, H, step=20, extent=240, alpha=grid_alpha))
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
    ex = tx - tw / 2 - 22 if x < tx - tw / 2 else (tx + tw / 2 + 22 if x > tx + tw / 2 else x)
    d.line([x, y, ex, ty], fill=color + (a,), width=4)
    d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=color + (a,), outline=(0, 0, 0, a), width=3)
    d.rounded_rectangle([tx - tw / 2 - 22, ty - 30, tx + tw / 2 + 22, ty + 30], radius=30,
                        fill=(16, 17, 24, int(a * 0.9)), outline=color + (a,), width=4)
    d.text((tx, ty), text, font=fo, fill=(255, 255, 255, a), anchor="mm")
    f.comp(img)


def callout_at(f, c, cam, P, text, tx, ty, word, nth=0, color=ACCENT, dt=-0.1):
    t0 = c.wt(word, nth=nth) + dt
    if c.t > t0:
        callout(f, cam, P, text, tx, ty, ease_out((c.t - t0) / 0.3), color)


STEPS = ["MEZCLA", "DUREZA", "HORNO", "CERA", "MADERA", "SÁNDWICH", "CORTE", "PINTURA", "GOMA", "PUNTA"]


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
        text_label(f, 540, 140, f"PASO {step + 1}", 40, ACCENT, clamp(pop * 2), stroke=5)
    text_big(f, 540, 235, title, int(110 * (0.7 + 0.3 * pop)), WHITE, clamp(pop * 2), stroke=9)


def orbit(c, yaw0, speed, pitch, dist, target=(0, 5, 0)):
    # el giro depende del tiempo de la escena, no del total, para que cada plano quede encuadrado
    return S3.Camera(yaw0 + speed * c.t, pitch, dist, target)


class Ctx:
    def __init__(self, t, T, g, words):
        self.t, self.T, self.g, self.words = t, T, g, words
        self.shake = 0.0

    def wt(self, word, default=None, nth=0):
        n = 0
        for w, a, _ in self.words:
            if w.lower().strip(".,?!¿¡:;") == word:
                if n == nth:
                    return a
                n += 1
        return self.T * 0.5 if default is None else default


# ================================================================ escenas
def hero(c, yaw0=0.55, title=True):
    cam = S3.Camera(yaw0 + 0.1 * c.t, 0.55, 340, (6, 6, 0))
    objs = pencil(0, paint=1, sharp=1, ferrule=1, eraser=1, stamp=1)
    f = stage(c, cam, objs)
    return f, cam


def sc_hook(c):
    f, cam = hero(c)
    pop = ease_out_back((c.t - 0.3) / 0.4)
    if c.t > 0.3:
        text_label(f, 540, 140, "CÓMO SE HACE", 46, ACCENT, clamp(pop * 2))
        text_big(f, 540, 320, "EL LÁPIZ", int(190 * (0.6 + 0.4 * pop)), WHITE, clamp(pop * 2))
    tp = c.wt("plomo") - 0.1
    if c.t > tp:
        k = ease_out_back((c.t - tp) / 0.3)
        text_big(f, 540, 1180, "0 g DE PLOMO", int(110 * max(0.3, k)), (255, 90, 80), clamp(k * 2), stroke=8)
    return f


GRAINS = [(float(x), float(z), float(r)) for x, z, r in np.random.default_rng(3).uniform([-1, -1, 5.0], [1, 1, 8.0], (36, 3))]


def sc_mix(c):
    cam = orbit(c, 0.25, 0.04, 0.32, 360, (0, 30, 10))
    tm = c.wt("mezcla") - 0.2
    k = smooth(tm, tm + 2.5, c.t)
    drum = S3.Cylinder((0, 42, 0), 38, 90, STEEL, n=24, spin=c.g * 3 * (0.3 + k))
    legs = [S3.Box((x - 3, 0, -26), (x + 3, 6, 26), (95, 100, 112)) for x in (-38, 38)]
    objs = [drum] + legs
    for i, (px, pz, pr) in enumerate(GRAINS):
        s = 1 - k
        if s <= 0.02:
            break
        side = -1 if i % 2 == 0 else 1
        col = GRAPH if i % 2 == 0 else CLAY
        objs.append(S3.Sphere((side * 70 + px * 18 * s, pr * s, 60 + pz * 18 * s), pr * s, col))
    f = stage(c, cam, objs)
    header(f, c, 0, "LA MEZCLA")
    callout_at(f, c, cam, (-70, 8, 60), "GRAFITO", 250, 1200, "grafito", dt=0.0)
    callout_at(f, c, cam, (70, 8, 60), "ARCILLA", 830, 1200, "arcilla", dt=0.0, color=(230, 200, 150))
    callout_at(f, c, cam, (0, 80, 0), "AGUA", 540, 470, "agua", dt=0.0, color=(120, 190, 255))
    return f


GRADES = ["6H", "4H", "2H", "HB", "2B", "4B", "6B"]


def sc_hard(c):
    f = Frame(BG)
    glow(f, 540, 860, 760, (70, 76, 100), 0.55)
    header(f, c, 1, "LA DUREZA")
    t_clay = c.wt("arcilla") - 0.2
    t_gr = c.wt("grafito") - 0.2
    pos = 3.0
    if c.t > t_clay:
        pos = lerp(3, 0.2, ease_io((c.t - t_clay) / 0.8))
    if c.t > t_gr:
        pos = lerp(0.2, 5.8, ease_io((c.t - t_gr) / 1.0))
    img, d = f.layer()
    x0, x1 = 120, 960
    for i, gname in enumerate(GRADES):
        x = x0 + (x1 - x0) * i / 6
        dark = int(lerp(175, 25, i / 6))
        d.rounded_rectangle([x - 52, 520, x + 52, 860], radius=18, fill=(245, 243, 236, 255))
        for k in range(5):
            yy = 560 + k * 60
            d.line([(x - 34, yy + 10), (x - 10, yy - 6), (x + 12, yy + 8), (x + 34, yy - 4)],
                   fill=(dark, dark, dark + 6, 255), width=int(4 + i * 0.9))
    f.comp(img)
    for i, gname in enumerate(GRADES):
        x = x0 + (x1 - x0) * i / 6
        text_label(f, x, 900, gname, 40, WHITE)
    # proporciones
    clay = clamp(1 - pos / 6 * 0.8)
    img, d = f.layer()
    d.rounded_rectangle([140, 1010, 940, 1070], radius=30, fill=(40, 42, 52, 255))
    d.rounded_rectangle([140, 1010, 140 + 800 * clay, 1070], radius=30, fill=CLAY + (255,))
    d.rounded_rectangle([140 + 800 * clay, 1010, 940, 1070], radius=30, fill=GRAPH + (255,))
    xp = x0 + (x1 - x0) * pos / 6
    d.polygon([(xp - 24, 470), (xp + 24, 470), (xp, 505)], fill=ACCENT + (255,))
    f.comp(img)
    text_label(f, 300, 1120, "ARCILLA", 34, CLAY)
    text_label(f, 780, 1120, "GRAFITO", 34, (170, 175, 190))
    text_label(f, 270, 440, "MÁS DURA", 38, (190, 210, 255), smooth(t_clay, t_clay + 0.4, c.t))
    text_label(f, 810, 440, "MÁS OSCURA", 38, ACCENT, smooth(t_gr, t_gr + 0.4, c.t))
    return f


def sc_kiln(c):
    tx = 0.2
    te = c.wt("hornean") - 0.3
    cam = orbit(c, 0.4, 0.03, 0.3, 300, (-40, 22, 0)) if c.t < c.wt("hornean") - 0.9 else orbit(c, 0.45, 0.03, 0.42, 380, (-10, 12, 0))
    ext = [S3.Box((-140, 0, -25), (-100, 50, 25), STEEL)]
    rods = []
    grow = ease_out((c.t - tx) / 2.2)
    heat = smooth(te, te + 1.0, c.t)
    col = lerp_c(GRAPH, (255, 120, 50), heat * 0.85)
    if c.t < te - 0.6:
        L = 200 * grow
        if L > 1:
            rods.append(S3.Cylinder((-100 + L / 2, 25, 0), 2.2, L, (96, 100, 112), n=12, stripes=False))
        objs = ext + rods
    else:
        tray = [S3.Box((-100, 0, -40), (100, 4, 40), (95, 100, 112))]
        for k, z in enumerate(np.linspace(-30, 30, 8)):
            rods.append(S3.Cylinder((0, 4 + LEAD_R * 1.4, z), LEAD_R * 1.4, 184, col, n=10, stripes=False))
        objs = tray + rods
    f = stage(c, cam, objs)
    if heat > 0:
        glow(f, 540, 900, 600, (255, 100, 30), 0.8 * heat)
        temp = int(1000 * ease_out((c.t - te) / 1.6))
        text_label(f, 540, 380, "HORNO", 36, (255, 200, 160), clamp(heat * 2))
        text_big(f, 540, 460, f"{temp:,} °C".replace(",", "."), 110, (255, 150, 70), clamp(heat * 2), stroke=8,
                 glow_c=(255, 90, 20))
    header(f, c, 2, "EL HORNO")
    if c.t < te - 0.6:
        callout_at(f, c, cam, (-100, 40, 0), "EXTRUSORA", 300, 470, "empuja", dt=0.0)
    return f


def sc_wax(c):
    tw = 0.3
    cam = orbit(c, 0.45, 0.03, 0.42, 360, (0, 12, 0))
    tray = [S3.Box((-104, 0, -44), (104, 3, 44), (95, 100, 112)),
            S3.Box((-104, 3, -44), (104, 12, 44), WAX, amb=0.65)]
    dip = land((c.t - tw) / 0.9)
    gloss = smooth(tw + 0.9, tw + 1.6, c.t)
    col = lerp_c(GRAPH, (110, 118, 132), gloss)
    rods = [S3.Cylinder((0, 12 + LEAD_R * 1.4 + 70 * (1 - dip), z), LEAD_R * 1.4, 184, col, n=10, stripes=False)
            for z in np.linspace(-30, 30, 8)]
    f = stage(c, cam, tray + rods)
    header(f, c, 3, "LA CERA")
    callout_at(f, c, cam, (90, 12, 40), "BAÑO DE CERA", 780, 1220, "cera", dt=0.0, color=(240, 220, 150))
    return f


def sc_wood(c):
    cam = orbit(c, 0.45, 0.04, 0.6, 340, (0, 2, 0))
    tg = c.wt("canales") - 0.6
    prog = clamp((c.t - tg) / 1.8)
    objs = slat(0, 3.6, top=grooves_top(prog))
    f = stage(c, cam, objs)
    header(f, c, 4, "LA MADERA")
    callout_at(f, c, cam, (-60, 3.6, -HALF_W), "CEDRO", 280, 1220, "cedro", dt=0.0, color=CEDAR)
    if c.t > tg:
        callout(f, cam, (-SLAT_L + 2 * SLAT_L * prog, 3.6, ZS[4]), "9 CANALES", 800, 470, ease_out((c.t - tg) / 0.3))
    return f


def sandwich_times(c):
    return c.wt("mina") - 0.2, c.wt("pegamento") - 0.2, c.wt("encima") - 0.2


def sc_sandwich(c):
    tm, tgl, tt = sandwich_times(c)
    k = ease_io((c.t - tt - 0.6) / 1.5)
    cam = S3.Camera(0.45 + 0.04 * c.t, lerp(0.6, 0.38, k), lerp(330, 340, k), (0, 4, 0))
    glue = clamp((c.t - tgl) / 0.8)
    objs = slat(0, 3.6, top=grooves_top(1.0, glue))
    for i, z in enumerate(ZS):
        p = clamp((c.t - tm - i * 0.08) / 0.4)
        if p > 0:
            objs.append(lead_rod(z, dy=60 * (1 - land(p))))
    pt = clamp((c.t - tt) / 0.5)
    if pt > 0:
        objs += slat(3.6 + 2 * LEAD_R, 7.2 + 2 * LEAD_R, dy=90 * (1 - land(pt)))
    tp = tt + 0.6
    if c.t > tp:
        press = ease_out((c.t - tp) / 0.4)
        for xa in (-SLAT_L + 6, SLAT_L - 18):
            objs.append(S3.Box((xa, 9.2 + 30 * (1 - press), -HALF_W - 6), (xa + 12, 15 + 30 * (1 - press),
                                                                         HALF_W + 6), (95, 100, 112)))
    f = stage(c, cam, objs)
    header(f, c, 5, "EL SÁNDWICH")
    if c.t < tt + 0.2:
        callout_at(f, c, cam, (40, YC + 1, ZS[6]), "MINA", 820, 470, "mina", dt=0.4)
    else:
        callout(f, cam, (0, 9.2, 10), "SÁNDWICH", 820, 470, ease_out((c.t - tt - 0.2) / 0.3))
    if c.t < tt + 0.2:
        callout_at(f, c, cam, (-70, 3.6, ZS[2] + PITCH / 2), "PEGAMENTO", 280, 1230, "pegamento", dt=0.4,
                   color=(240, 240, 230))
    return f


def sc_cut(c):
    ts = c.wt("corta") - 0.3
    tsep = c.wt("nueve") - 0.4
    cam = orbit(c, 0.45, 0.04, 0.5, 360, (0, 4, 0))
    sweep = clamp((c.t - ts) / 1.0)
    sep = ease_out_back((c.t - tsep) / 0.6) if c.t > tsep else 0.0
    objs = []
    if sep <= 0:
        objs = slat(0, 3.6) + slat(3.6 + 2 * LEAD_R, 7.2 + 2 * LEAD_R)
    else:
        for i, z in enumerate(ZS):
            objs += pencil(z, dz=(i - 4) * 9 * sep, dy=0)
    f = stage(c, cam, objs)
    if 0 < sweep < 1 and sep <= 0:
        x = -SLAT_L + 2 * SLAT_L * sweep
        img, d = f.layer()
        for z in ZS[:-1] + PITCH / 2:
            p = cam.project(np.array([[-SLAT_L, 9.3, z], [x, 9.3, z]], np.float32))
            d.line([(p[0][0], p[1][0]), (p[0][1], p[1][1])], fill=(255, 240, 200, 255), width=4)
        f.comp(img)
        for z in ZS[:-1] + PITCH / 2:
            px, py, _ = cam.project(np.array([x, 9.3, z], np.float32))
            glow(f, px, py, 40, (255, 200, 120), 1.0)
    header(f, c, 6, "EL CORTE")
    if c.t > tsep:
        text_big(f, 540, 1200, "×9", int(150 * max(0.3, ease_out_back((c.t - tsep) / 0.4))), ACCENT,
                 clamp((c.t - tsep) * 3), stroke=8)
    return f


def sc_paint(c):
    th = c.wt("hexágono") - 0.3
    tp = c.wt("pintura") - 0.4
    tcut = c.wt("después") - 0.15
    if c.t < tcut:
        # vista de frente: los extremos hexagonales
        cam = S3.Camera(-1.2 + 0.05 * c.t, 0.22, 175, (-88, YC + 2, 0))
        objs = []
        for i, z in enumerate(ZS[2:7]):
            objs += pencil(z + (i - 2) * 9)
        f = stage(c, cam, objs)
        if c.t > th:
            pop = ease_out_back((c.t - th) / 0.35)
            text_big(f, 540, 1180, "6 LADOS", int(120 * max(0.3, pop)), ACCENT, clamp(pop * 2), stroke=8)
            text_label(f, 540, 1290, "ASÍ NO RUEDA", 40, WHITE, clamp((c.t - th - 0.3) * 3))
    else:
        u = c.t - tcut
        paint = clamp((c.t - tp) / 1.8)
        cam = S3.Camera(0.5 + 0.03 * u, 0.5, 330, (0, YC, 0))
        objs = []
        for i, z in enumerate(ZS[2:7]):
            objs += pencil(z + (i - 2) * 9, paint=clamp(paint * 1.25 - i * 0.06))
        f = stage(c, cam, objs)
        if c.t > tp:
            text_label(f, 540, 1200, "VARIAS CAPAS DE LACA", 44, PAINT, ease_out((c.t - tp - 0.3) / 0.3))
        f.fill((255, 255, 255), 0.6 * (1 - ease_out(u / 0.3)))
    header(f, c, 7, "LA PINTURA")
    return f


def sc_eraser(c):
    ts = c.wt("marca") - 0.2
    tf = c.wt("virola") - 0.2
    te = c.wt("goma") - 0.2
    cam = orbit(c, 0.55, 0.03, 0.42, 310, (25, YC, 0))
    objs = pencil(0, paint=1, stamp=smooth(ts, ts + 0.3, c.t), ferrule=clamp((c.t - tf) / 0.5),
                  eraser=clamp((c.t - te) / 0.5))
    f = stage(c, cam, objs)
    header(f, c, 8, "LA GOMA")
    callout_at(f, c, cam, (40, YC + PR, 0), "MARCA Y DUREZA", 300, 470, "marca", dt=0.2, color=(120, 200, 140))
    callout_at(f, c, cam, (94, YC + PR, 0), "VIROLA", 800, 470, "virola", dt=0.4, color=BRASS)
    callout_at(f, c, cam, (104, YC + PR, 0), "GOMA", 800, 1220, "goma", dt=0.4, color=ERASER)
    return f


SHAV = [(float(a), float(b), float(s)) for a, b, s in np.random.default_rng(9).uniform([0, -1, 0.5], [6.28, 1, 1.5], (40, 3))]


def sc_sharpen(c):
    ts = c.wt("punta") - 0.3
    sh = clamp((c.t - ts) / 0.9)
    cam = orbit(c, -0.75, 0.04, 0.42, 290, (-45, YC, 0))
    objs = pencil(0, paint=1, ferrule=1, eraser=1, stamp=1, sharp=sh)
    f = stage(c, cam, objs)
    header(f, c, 9, "LA PUNTA")
    if c.t > ts and c.t < ts + 1.8:
        u = c.t - ts
        x, y, _ = cam.project(np.array([-88 - 18 * sh, YC, 0], np.float32))
        img, d = f.layer()
        for a, b, s_ in SHAV:
            r = 30 + u * 260 * s_
            px = x + math.cos(a) * r
            py = y + math.sin(a) * r * 0.6 + 400 * u * u
            al = int(255 * clamp(1 - u / 1.8))
            d.ellipse([px - 10 * s_, py - 5 * s_, px + 10 * s_, py + 5 * s_], fill=CEDAR + (al,))
        f.comp(img)
    return f


def sc_fact(c):
    tk = c.wt("cincuenta") - 0.3
    u = clamp(c.t / c.T)
    cam = S3.Camera(0.6, 1.05, 380, (-40, 0, 0))
    dx = 60 - 120 * ease_io(u)
    objs = pencil(0, paint=1, ferrule=1, eraser=1, stamp=1, sharp=1, y=YC + 1)
    for o in objs:
        if hasattr(o, "c"):
            o.c = o.c + np.array([dx, 0, 0], np.float32)
        elif hasattr(o, "pos"):
            o.pos = o.pos + np.array([dx, 0, 0], np.float32)
    f = stage(c, cam, [], grid_alpha=40)
    # línea de grafito que va dejando la punta
    tip = -94 + dx
    xs = np.linspace(tip, 140, 160)
    P = np.stack([xs, np.zeros_like(xs), 9 * np.sin(xs / 11) + 5 * np.sin(xs / 5.3)], 1).astype(np.float32)
    px, py, _ = cam.project(P)
    img, d = f.layer()
    d.line(list(zip(px.tolist(), py.tolist())), fill=(70, 72, 82, 255), width=7, joint="curve")
    f.comp(img)
    img2, sh = S3.render(objs, cam, W, H)
    if sh is not None:
        f.a *= (1 - 0.5 * sh)[..., None]
    f.comp(img2)
    if c.t > tk:
        km = int(56 * ease_out((c.t - tk) / 1.6))
        pop = ease_out_back((c.t - tk) / 0.35)
        text_label(f, 540, 300, "UNA SOLA MINA", 42, ACCENT, clamp(pop * 2))
        text_big(f, 540, 440, f"≈ {km} KM", int(170 * (0.6 + 0.4 * pop)), WHITE, clamp(pop * 2), glow_c=(255, 150, 0))
    return f


def sc_outro(c):
    f, cam = hero(c, yaw0=-0.75)
    tb = c.wt("lápiz") - 0.3
    if c.t > tb:
        pop = ease_out_back((c.t - tb) / 0.4)
        text_label(f, 540, 140, "CÓMO SE HACE", 46, ACCENT, clamp(pop * 2))
        text_big(f, 540, 320, "EL LÁPIZ", int(190 * (0.6 + 0.4 * pop)), WHITE, clamp(pop * 2))
    f.fill((0, 0, 0), smooth(c.T - 1.2, c.T, c.t))
    return f


BEATS = [
    (sc_hook, "¿Sabías que un lápiz no tiene ni un gramo de plomo? Lo que escribe es grafito. Así se fabrica uno, "
              "paso a paso.", 0.3),
    (sc_mix, "Todo empieza con polvo de grafito, que se mezcla con arcilla y agua.", 0.3),
    (sc_hard, "La receta decide la dureza. Con más arcilla, la mina es más dura y clara. Con más grafito, es más "
              "blanda y oscura.", 0.3),
    (sc_kiln, "La pasta se empuja por un agujero diminuto, como si fuera un espagueti. Las varillas se cortan y se "
              "hornean a unos mil grados.", 0.3),
    (sc_wax, "Después se bañan en cera, para que la mina se deslice suave sobre el papel.", 0.3),
    (sc_wood, "Mientras tanto, la madera de cedro se corta en tablillas, y una máquina les talla nueve canales.", 0.3),
    (sc_sandwich, "En cada canal va una mina. Se pone pegamento, y encima otra tablilla. Es un sándwich de madera y "
                  "grafito.", 0.3),
    (sc_cut, "Cuando se seca, el sándwich se corta. Y de una sola pieza salen nueve lápices.", 0.4),
    (sc_paint, "Cada uno tiene forma de hexágono, para que no ruede de la mesa. Después recibe varias capas de "
               "pintura.", 0.3),
    (sc_eraser, "Se le estampa la marca y la dureza, y una virola de metal sujeta la goma de borrar.", 0.3),
    (sc_sharpen, "Por último, se le saca punta.", 0.4),
    (sc_fact, "Y se calcula que con una sola mina se puede trazar una línea de unos cincuenta y seis kilómetros.", 0.3),
    (sc_outro, "Así se hace un lápiz.", 2.0),
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
    if z != 1:
        zw, zh = int(W * z + 2), int(H * z + 2)
        big = img.resize((zw, zh), Image.BILINEAR)
        x0, y0 = int((zw - W) / 2), int((zh - H) / 2)
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
        A.put(voice, v, s)
    st = [s for s, _, _, _ in TL]

    def ctx(b):
        s, T, words, _ = TL[b]
        return Ctx(0, T, 0, words)

    def gt(b, word, nth=0):
        return st[b] + ctx(b).wt(word, nth=nth)

    def fx(snd, at, gain=1.0):
        A.put(sfx, snd, at, gain)

    # música: 104 bpm, Am – F – C – G
    beat = 60 / 104
    bar = beat * 4
    chords = [(110.0, 130.81, 164.81), (87.31, 110.0, 130.81), (130.81, 164.81, 196.0), (98.0, 123.47, 146.83)]
    roots = [55.0, 43.65, 65.41, 49.0]
    nbars = int(total / bar) + 2
    for b in range(nbars):
        t0 = b * bar
        ch = chords[b % 4]
        A.put(music, A.pad([x * 2 for x in ch], bar + 0.4, 0.3, 0.4, 1700, b) * 0.9, t0)
        for k in range(8):
            A.put(music, A.pluck(ch[(k * 2) % 3] * 4 * (2 if k % 4 == 2 else 1), 0.7) * 0.26, t0 + k * beat / 2)
    end_drums = gt(12, "lápiz") - 0.3
    for a, b in [(st[1], end_drums)]:
        tt = math.ceil(a / beat) * beat
        k = 0
        while tt < b - 0.05:
            pos = k % 8
            bi = int(tt / bar) % 4
            if pos in (0, 3, 4):
                A.put(drums, A.kick(), tt, 1.0 if pos != 3 else 0.6)
            if pos in (2, 6):
                A.put(drums, A.snare(), tt, 0.5)
            A.put(drums, A.hat(seed=k % 7), tt, 0.32 if k % 2 else 0.18)
            A.put(music, A.bass_note(roots[bi] * (2 if pos in (3, 7) else 1)), tt, 0.9)
            tt += beat / 2
            k += 1
    A.put(music, A.pad([110.0, 164.81, 220.0, 261.63, 329.63], 4.0, 0.02, 3.0, 2600, 99) * 2.0, end_drums + 0.3)

    for b in range(1, 13):
        fx(A.whoosh(0.5, b), st[b] - 0.3, 0.35)
    fx(A.hit(), st[0] + 0.3, 0.5)
    fx(A.hit(), gt(0, "plomo") - 0.1, 0.6)
    fx(A.rumble(TL[1][1] - 0.5), st[1] + 0.3, 0.5)
    for w in ("arcilla", "grafito"):
        fx(A.whoosh(0.6, 5, up=w == "grafito"), gt(2, w) - 0.2, 0.4)
    fx(A.sew(2.0), st[3] + 0.2, 0.25)
    te = gt(3, "hornean") - 0.3
    fx(A.fizz(2.0), te, 0.4)
    fx(A.hit(), te, 0.4)
    fx(A.thunk(f=80), st[4] + 0.3 + 0.8, 0.5)
    fx(A.fizz(1.2, 7), st[4] + 1.0, 0.3)
    fx(A.sew(1.8), gt(5, "canales") - 0.6, 0.45)
    c6 = ctx(6)
    tm, tgl, tt = sandwich_times(c6)
    for i in range(9):
        fx(A.thunk(f=240 + i * 10, dur=0.15), st[6] + tm + i * 0.08 + 0.3, 0.35)
    fx(A.thunk(f=120), st[6] + tt + 0.35, 0.8)
    fx(A.clink(), st[6] + tt + 0.95, 0.5)
    ts = gt(7, "corta") - 0.3
    fx(A.sew(1.0), ts, 0.5)
    fx(A.fizz(1.0, 3), ts, 0.4)
    fx(A.boing(), gt(7, "nueve") - 0.4, 0.5)
    fx(A.fizz(1.6, 11), gt(8, "pintura") - 0.4, 0.35)
    fx(A.clink(), gt(9, "marca") - 0.2, 0.4)
    fx(A.clink(), gt(9, "virola") + 0.2, 0.7)
    fx(A.pop(), gt(9, "goma") + 0.25, 0.7)
    fx(A.sew(0.9), gt(10, "punta") - 0.3, 0.5)
    fx(A.fizz(TL[11][1] - 0.5, 13), st[11] + 0.2, 0.18)
    fx(A.hit(), gt(11, "cincuenta") - 0.3, 0.6)
    fx(A.hit(), gt(12, "lápiz") - 0.3, 0.6)

    music = A.reverb(music, 2.2, 0.3)
    bed = A.duck(music * 0.75 + drums * 0.6, voice, 0.5)
    mix = voice * 1.0 + bed * 0.3 + sfx * 0.45
    fo = int(1.5 * sr)
    e = int(total * sr)
    mix[e - fo:e] *= np.linspace(1, 0, fo, dtype=np.float32)
    mix[e:] = 0
    mix /= max(1.0, np.abs(mix).max() / 0.95)
    return np.stack([mix, mix], 1)[:e]


def prepare():
    os.makedirs(WORK, exist_ok=True)
    voices = []
    for i, (_, text, gap) in enumerate(BEATS):
        voices.append(A.synth_voice_kokoro(text, KOKORO_DIR, VOICE, SPEED, os.path.join(WORK, f"v{i:02d}.wav")))
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

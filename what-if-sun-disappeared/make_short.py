#!/usr/bin/env python3
"""Genera el short vertical animado "What if the Sun disappeared?".

Todo se genera con código: animación fotograma a fotograma (numpy + Pillow),
voz neuronal Piper, subtítulos palabra a palabra, música y efectos sintetizados.

Uso:
    python3 make_short.py [carpeta_de_trabajo] [salida.mp4]

Voz: descarga el modelo y apunta PIPER_MODEL a su .onnx (si no, usa espeak-ng):
    curl -LO https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-ryan-high.tar.gz
    tar -xzf voice-en-us-ryan-high.tar.gz --one-top-level
    PIPER_MODEL=voice-en-us-ryan-high/en-us-ryan-high.onnx python3 make_short.py
Requisitos: python3, numpy, scipy, Pillow, piper-tts, ffmpeg.
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
from engine import (FPS, H, ICE, W, WHITE, YELLOW, Frame, Planet, Stars, Sun, clamp, draw_caption,
                    ease_out, ease_out_back, glow, grad_mix, group_words, label_font, lerp, lerp_c, smooth,
                    text_big, text_label, vgrad)

WORK = sys.argv[1] if len(sys.argv) > 1 else "build"
OUT = sys.argv[2] if len(sys.argv) > 2 else "what-if-the-sun-disappeared.mp4"
PIPER_MODEL = os.environ.get("PIPER_MODEL", "voices/voice-en-us-ryan-high/en-us-ryan-high.onnx")
PIPER_LENGTH = float(os.environ.get("PIPER_LENGTH", "0.95"))
LEAD = 0.12  # la voz entra un poco después del corte

STARS = Stars()
EARTH = Planet(seed=3)
SUN = Sun()
SPACE = vgrad((3, 4, 12), (10, 8, 26))
RNG = np.random.default_rng(42)


# ================================================================ contexto de escena
class Ctx:
    def __init__(self, t, T, g, words):
        self.t, self.T, self.g, self.words = t, T, g, words
        self.shake = 0.0

    def wt(self, word, default=None, nth=0):
        """Tiempo (local) en que se dice una palabra."""
        n = 0
        for w, a, _ in self.words:
            if w.lower().strip(".,?!") == word:
                if n == nth:
                    return a
                n += 1
        return self.T * 0.5 if default is None else default


def space(c, drift=(4, 7), alpha=1.0):
    f = Frame(SPACE)
    STARS.draw(f, c.g, alpha, drift)
    return f


def light_from(sx, sy, ex, ey, z):
    v = np.array([sx - ex, -(sy - ey), z], np.float32)
    return tuple(v / (np.linalg.norm(v) + 1e-6))


def dashed_circle(d, cx, cy, r, color, n=60, width=4, phase=0.0):
    for k in range(n):
        a0 = 360 * k / n + phase
        d.arc([cx - r, cy - r, cx + r, cy + r], a0, a0 + 360 / n * 0.55, fill=color, width=width)


# ---- escarcha en los bordes (precalculada)
def _make_frost():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.minimum.reduce([x, y, W - 1 - x, H - 1 - y]) / 260.0
    rng = np.random.default_rng(5)
    small = rng.random((H // 24 + 2, W // 24 + 2)).astype(np.float32)
    nz = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    a = np.clip((1 - d) * 1.3 - 0.25 + (nz - 0.5) * 0.6, 0, 1) ** 1.4
    img = Image.new("L", (W, H), 0)
    dd = ImageDraw.Draw(img)
    for _ in range(420):
        side = rng.integers(4)
        if side == 0:
            px, py = rng.uniform(0, W), rng.uniform(0, 160)
        elif side == 1:
            px, py = rng.uniform(0, W), rng.uniform(H - 160, H)
        elif side == 2:
            px, py = rng.uniform(0, 140), rng.uniform(0, H)
        else:
            px, py = rng.uniform(W - 140, W), rng.uniform(0, H)
        ang = rng.uniform(0, 6.28)
        ln = rng.uniform(20, 90)
        for b in range(3):
            aa = ang + b * 2.094
            dd.line([px, py, px + ln * math.cos(aa), py + ln * math.sin(aa)], fill=int(rng.uniform(90, 200)), width=2)
    a = np.clip(a + np.asarray(img, np.float32) / 255 * 0.8 * (d < 1.2), 0, 1)
    rgb = np.broadcast_to(np.array([215, 238, 255], np.float32), (H, W, 3)).copy()
    return rgb, a.astype(np.float32)


FROST = _make_frost()


def frost(f, k):
    if k > 0:
        f.over(FROST[0], FROST[1], W / 2, H / 2, k)


# ================================================================ escenas
def sc_hook(c):
    f = space(c)
    cx, cy = 540, 760
    R = 255 * (1 + 0.06 * c.t / c.T)
    a = 2.0 + 0.28 * c.g
    ex, ey = cx + 430 * math.cos(a), cy + 150 * math.sin(a)
    er = int(64 * (1 + 0.18 * math.sin(a)))
    L = light_from(cx, cy, ex, ey, -140 * math.sin(a))
    front = math.sin(a) > 0
    if not front:
        EARTH.draw(f, ex, ey, er, 0.4 * c.g, light=L, ambient=0.1)
    SUN.draw(f, cx, cy, R, c.g)
    if front:
        EARTH.draw(f, ex, ey, er, 0.4 * c.g, light=L, ambient=0.1)
    f.fill((0, 0, 0), 1 - smooth(0, 0.35, c.t))
    return f


def sc_gone(c):
    f = space(c)
    cx, cy = 540, 760
    tv = c.wt("gone") - 0.04
    pre = smooth(tv - 1.6, tv, c.t)
    R = 270 * (1 + 0.06 * pre) + math.sin(c.t * 70) * 5 * pre
    k = clamp((c.t - tv) / 0.16)
    a = 2.0 + 0.28 * c.g
    ex, ey = cx + 430 * math.cos(a), cy + 150 * math.sin(a)
    er = int(64 * (1 + 0.18 * math.sin(a)))
    L = light_from(cx, cy, ex, ey, -140 * math.sin(a))
    front = math.sin(a) > 0
    if not front:
        EARTH.draw(f, ex, ey, er, 0.4 * c.g, light=L, ambient=0.1)
    if k < 1:
        SUN.draw(f, cx, cy, R * (1 - ease_out(k)), c.g, power=1 - k * 0.5)
    if front:
        EARTH.draw(f, ex, ey, er, 0.4 * c.g, light=L, ambient=0.1)
    if c.t > tv:
        u = (c.t - tv) / 1.5
        img, d = f.layer()
        r = 40 + 1500 * ease_out(u)
        al = int(255 * clamp(1 - u))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 210, 150, al), width=int(26 * (1 - clamp(u)) + 4))
        f.comp_add(img, 1.0)
        glow(f, cx, cy, 500 * (1 - clamp(u)), (255, 200, 130), 1.4 * (1 - clamp(u * 2)))
        f.fill((255, 255, 255), 0.9 * (1 - ease_out((c.t - tv) / 0.55)))
        c.shake = 22 * (1 - clamp((c.t - tv) / 0.8))
    return f


def sc_clock(c):
    f = space(c)
    sx, sy = 540, 560
    ex, ey, er = 540, 1090, 170
    tail = lerp(sy, ey - er - 140, clamp(c.t / (c.T + 1.5)))
    # rayo de la última luz que aún viaja
    hgt = int(ey - er - tail)
    if hgt > 4:
        xs = np.arange(-150, 150, dtype=np.float32)
        prof = np.exp(-(xs / 55) ** 2)
        ys = np.linspace(0, 1, hgt, dtype=np.float32)
        vprof = np.clip(ys * 6, 0, 1)
        beam = (vprof[:, None] * prof[None, :])[..., None] * np.array([255, 190, 80], np.float32)
        f.add(beam, ex, tail + hgt / 2, 0.55)
        img, d = f.layer()
        for k in range(14):
            yy = tail + ((k * 61 + c.g * 520) % max(1, hgt))
            xx = ex + math.sin(k * 3.1) * 30
            d.ellipse([xx - 5, yy - 14, xx + 5, yy + 14], fill=(255, 240, 200, 230))
        f.comp_add(img, 1.0)
    img, d = f.layer()
    dashed_circle(d, sx, sy, 120, (255, 190, 90, 150), 40, 5, phase=c.g * 8)
    f.comp(img)
    text_label(f, sx, sy, "SUN?", 46, (255, 190, 90), 0.7)
    EARTH.draw(f, ex, ey, er, 0.35 * c.g, light=(0.0, 1.0, 0.55), city=0.3)
    ts = c.wt("sunlight") - 0.1
    if c.t >= ts:
        te = c.wt("eight") - 0.05
        secs = 500 - (int((c.t - te) * 4) if c.t > te else 0)
        pop = ease_out_back((c.t - ts) / 0.3)
        text_label(f, 540, 120, "LIGHT TRAVEL TIME", 40, (255, 220, 160), clamp(pop))
        text_big(f, 540, 260, f"{secs // 60}:{secs % 60:02d}", int(190 * (0.6 + 0.4 * pop)), YELLOW,
                 clamp(pop * 2), glow_c=(255, 150, 0))
    return f


# --- ciudad (compartida por las escenas 3 y 4)
DAY = vgrad((35, 105, 205), (165, 210, 242))
NIGHT = vgrad((2, 3, 9), (9, 11, 26))
BUILD = []
_x = -20
while _x < W + 20:
    bw = int(RNG.integers(70, 150))
    bh = int(RNG.integers(160, 520))
    wins = [(wx, wy, float(RNG.uniform(0.2, 2.6)), RNG.random() < 0.8)
            for wx in range(_x + 14, _x + bw - 24, 30) for wy in range(1300 - bh + 20, 1280, 42)]
    BUILD.append((_x, bw, bh, wins))
    _x += bw + int(RNG.integers(0, 12))
CLOUDS = [(float(RNG.uniform(0, W + 600)), float(RNG.uniform(420, 900)), float(RNG.uniform(0.6, 1.3)),
           float(RNG.uniform(12, 30))) for _ in range(6)]


def city(c, dark=0.0, moon_dark=0.0, lights_t0=None):
    f = Frame(grad_mix(DAY, NIGHT, dark))
    STARS.draw(f, c.g, dark * 0.9)
    SUN.draw(f, 820, 330, 80, c.g, power=1 - dark)
    # luna
    mk = 1 - 0.88 * moon_dark
    img, d = f.layer()
    d.ellipse([170, 360, 290, 480], fill=lerp_c((25, 25, 32), (225, 225, 215), mk) + (255,))
    for (mx, my, mr) in [(205, 395, 14), (250, 430, 10), (225, 450, 7), (262, 388, 8)]:
        d.ellipse([mx - mr, my - mr, mx + mr, my + mr], fill=lerp_c((20, 20, 26), (190, 190, 182), mk) + (255,))
    f.comp(img, 1.0 if dark < 0.5 else 1.0)
    if mk > 0.3:
        glow(f, 230, 420, 120, (200, 200, 220), 0.25 * mk)
    # nubes
    img, d = f.layer()
    for x0, y, s, sp in CLOUDS:
        x = (x0 + sp * c.g) % (W + 600) - 300
        col = lerp_c((255, 255, 255), (40, 44, 60), dark) + (230,)
        for dx, dy, r in [(0, 0, 70), (70, -25, 85), (150, 0, 70), (75, 20, 75)]:
            d.ellipse([x + dx * s - r * s, y + dy * s - r * s, x + dx * s + r * s, y + dy * s + r * s], fill=col)
    f.comp(img, 1 - 0.6 * dark)
    # pájaros
    if dark < 0.8:
        img, d = f.layer()
        for i in range(4):
            bx = (c.g * 90 + i * 170) % (W + 300) - 150
            by = 640 + i * 40 + math.sin(c.g * 2 + i) * 20
            fl = math.sin(c.g * 12 + i) * 14
            d.line([bx - 22, by - fl, bx, by, bx + 22, by - fl], fill=(25, 30, 45, 255), width=5)
        f.comp(img, 1 - dark)
    # edificios
    img, d = f.layer()
    bcol = lerp_c((48, 66, 98), (8, 10, 18), dark) + (255,)
    for x, bw, bh, wins in BUILD:
        d.rectangle([x, 1300 - bh, x + bw, H], fill=bcol)
        for wx, wy, delay, on in wins:
            lit = lights_t0 is not None and on and c.t > lights_t0 + delay
            col = (255, 205, 110, 255) if lit else lerp_c((95, 120, 160), (18, 20, 32), dark) + (255,)
            d.rectangle([wx, wy, wx + 14, wy + 22], fill=col)
    d.rectangle([0, 1290, W, H], fill=lerp_c((40, 50, 70), (6, 7, 12), dark) + (255,))
    f.comp(img)
    return f


def sc_party(c):
    f = city(c)
    rem = int(480 * (1 - clamp(c.t / c.T)))
    red = smooth(c.T - 1.6, c.T - 0.6, c.t)
    text_label(f, 540, 100, "UNTIL DARKNESS", 38, WHITE)
    text_big(f, 540, 220, f"{rem // 60}:{rem % 60:02d}", 140, lerp_c(WHITE, (255, 70, 60), red))
    return f


def sc_dark(c):
    tv = c.wt("out") - 0.08
    k = smooth(tv, tv + 1.1, c.t)
    km = smooth(tv + 1.2, tv + 2.4, c.t)
    f = city(c, dark=k, moon_dark=km, lights_t0=tv + 0.3)
    a = 1 - smooth(0, 0.6, c.t)
    text_big(f, 540, 220, "0:00", 140, (255, 70, 60), a)
    if c.t > tv:
        c.shake = 8 * (1 - clamp((c.t - tv) / 0.6))
    return f


def sc_fly(c):
    f = space(c)
    cx, cy, r, w = 540, 780, 360, 0.32
    ts = c.wt("flies") - 0.1

    def pos(tau):
        if tau < ts:
            a = w * (tau - ts)
            return cx + r * math.cos(a), cy - r * math.sin(a)
        return cx + r, cy - r * w * (tau - ts)

    img, d = f.layer()
    oa = int(170 * (1 - 0.6 * smooth(ts, ts + 1, c.t)))
    dashed_circle(d, cx, cy, r, (120, 135, 200, oa), 70, 4)
    d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], outline=(255, 190, 90, 120), width=3)
    f.comp(img)
    img, d = f.layer()
    for i in range(50):
        tau = c.t - i * 0.06
        if tau < 0:
            break
        x, y = pos(tau)
        al = int(200 * (1 - i / 50))
        rr = 10 * (1 - i / 60)
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(110, 160, 255, al))
    f.comp_add(img, 0.9)
    x, y = pos(c.t)
    EARTH.draw(f, x, y, 48, 0.5 * c.g, sun=0.0, ambient=0.3, city=1.0)
    if c.t > ts:
        text_label(f, x + 75, y + 10, "→ ∞", 44, (150, 190, 255), smooth(ts, ts + 0.4, c.t), anchor="lm")
    th = c.wt("hundred") - 0.1
    if c.t > th:
        p = ease_out((c.t - th) / 1.3)
        pop = ease_out_back((c.t - th) / 0.3)
        text_label(f, 540, 110, "EARTH'S SPEED", 40, (190, 210, 255), clamp(pop))
        text_big(f, 540, 240, f"{int(107000 * p):,} KM/H", int(130 * (0.6 + 0.4 * pop)), YELLOW, clamp(pop * 2),
                 glow_c=(255, 150, 0))
    return f


def temp_counter(f, c, t0, dur, v0, v1, y, size, label, c0=(255, 170, 60), c1=ICE):
    if c.t < t0:
        return
    p = ease_out((c.t - t0) / dur)
    pop = ease_out_back((c.t - t0) / 0.3)
    v = int(round(lerp(v0, v1, p)))
    col = lerp_c(c0, c1, p)
    text_label(f, 540, y - size * 0.62, label, 40, (200, 225, 255), clamp(pop))
    text_big(f, 540, y, f"{v:+d}°C".replace("+0", "0"), int(size * (0.6 + 0.4 * pop)), col, clamp(pop * 2),
             glow_c=tuple(int(x * 0.6) for x in col))


def sc_week(c):
    f = space(c)
    p = smooth(0, c.T, c.t)
    EARTH.draw(f, 540, 860, 330, 0.12 * c.g, sun=0.0, ambient=0.34, city=1.0 - 0.4 * p,
               frozen=0.08 + 0.32 * p, tilt=0.35)
    temp_counter(f, c, c.wt("temperature") - 0.3, 2.2, 15, -18, 280, 200, "AFTER 1 WEEK")
    frost(f, 0.55 * p)
    return f


PLANTS = [(110 + i * 143, float(RNG.uniform(380, 520)), float(RNG.uniform(0, 6.28)), (-1) ** i) for i in range(7)]
LEAF_FALL = {(i, j): float(RNG.uniform(1.0, 3.2)) for i in range(7) for j in range(4)}


def _leaf(d, x, y, ang, ln, col):
    pts = []
    for k in range(16):
        u = k / 15 * 2 * math.pi
        lx = (math.cos(u) + 1) / 2 * ln
        ly = math.sin(u) * ln * 0.28
        pts.append((x + lx * math.cos(ang) - ly * math.sin(ang), y + lx * math.sin(ang) + ly * math.cos(ang)))
    d.polygon(pts, fill=col)


def _tier(text, w, h, col):
    img = Image.new("RGBA", (w, h), col + (255,))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, w - 1, h - 1], outline=(0, 0, 0, 255), width=6)
    d.text((w / 2, h / 2), text, font=label_font(44), fill=(255, 255, 255, 255), anchor="mm",
           stroke_width=5, stroke_fill=(0, 0, 0, 255))
    return img


TIERS = [("PLANTS", 760, 110, (60, 150, 65)), ("PLANT EATERS", 580, 110, (205, 150, 60)),
         ("PREDATORS", 400, 110, (190, 65, 55))]


def sc_plants(c):
    f = Frame(vgrad((4, 6, 14), (16, 18, 34)))
    STARS.draw(f, c.g, 0.6)
    ts = c.wt("stops") - 0.2
    death = smooth(ts, ts + 2.8, c.t)
    img, d = f.layer()
    d.rectangle([0, 1180, W, H], fill=(34, 26, 22, 255))
    d.rectangle([0, 1180, W, 1192], fill=(52, 40, 32, 255))
    for i, (bx, hgt, ph, sd) in enumerate(PLANTS):
        sway = 0.06 * math.sin(c.g * 1.3 + ph) * (1 - death)
        col = lerp_c((70, 175, 75), (105, 82, 45), death) + (255,)
        x, y, ang = bx, 1185.0, -math.pi / 2 + sway
        pts = [(x, y)]
        seg = hgt / 14
        nodes = []
        for k in range(14):
            s = (k + 1) / 14
            ang += sd * death * 0.13 * s * 2.2 + sway * 0.1
            x += seg * math.cos(ang)
            y += seg * math.sin(ang)
            pts.append((x, y))
            nodes.append((x, y, ang))
        for k in range(len(pts) - 1):
            d.line([pts[k], pts[k + 1]], fill=col, width=int(12 - 7 * k / 14))
        for j, s in enumerate((0.3, 0.5, 0.7, 0.9)):
            nx, ny, na = nodes[int(s * 13)]
            side = 1 if j % 2 else -1
            la = na + side * (0.9 - 1.9 * death)
            lcol = lerp_c((80, 190, 80), (125, 95, 45), death) + (255,)
            tf = ts + LEAF_FALL[(i, j)]
            if c.t > tf and death > 0.4:
                u = c.t - tf
                ny = min(1180, ny + 0.5 * 900 * u * u)
                nx += 30 * math.sin(u * 4 + j)
                la += u * 3 * side
            _leaf(d, nx, ny, la, 75, lcol)
    f.comp(img)
    # pirámide alimentaria
    tf = c.wt("food") - 0.15
    if c.t > tf:
        tc = c.wt("collapses") - 0.05
        pop = ease_out_back((c.t - tf) / 0.35)
        img, d = f.layer()
        base_y = 650
        for k, (txt, w, h, col) in enumerate(TIERS):
            y = base_y - k * (h + 8)
            ang, dy, al = 0.0, 0.0, 1.0
            if c.t > tc:
                u = c.t - tc
                if k == 0:
                    col = lerp_c(col, (90, 70, 45), clamp(u / 0.4))
                    dy = 0
                else:
                    uu = max(0.0, u - 0.12 * k)
                    dy = 0.5 * 2600 * uu * uu
                    ang = (16 if k == 1 else -24) * uu
                    al = 1 - clamp((uu - 0.5) / 0.4)
            tier = _tier(txt, w, h, col)
            sc = max(0.05, pop)
            tier = tier.resize((max(1, int(w * sc)), max(1, int(h * sc))))
            if ang:
                tier = tier.rotate(ang, expand=True, resample=Image.BICUBIC)
            if al < 1:
                tier.putalpha(tier.getchannel("A").point(lambda v: int(v * al)))
            img.alpha_composite(tier, (int(540 - tier.width / 2), int(y + dy - tier.height / 2)))
        f.comp(img)
    return f


FLAKES = [(float(RNG.uniform(0, W)), float(RNG.uniform(0, H)), float(RNG.uniform(60, 180)), float(RNG.uniform(2, 6)),
           float(RNG.uniform(0, 6.28))) for _ in range(280)]
MOUNT = [(x, 980 - 260 * abs(math.sin(x / 210 + 1)) - 90 * abs(math.sin(x / 77))) for x in range(0, W + 41, 40)]


def snow(f, c, ymax=H, alpha=1.0):
    img, d = f.layer()
    for x0, y0, v, s, ph in FLAKES:
        y = (y0 + v * c.g) % (H + 40) - 20
        if y > ymax:
            continue
        x = (x0 + 35 * math.sin(c.g * 0.9 + ph) - 25 * c.g) % W
        d.ellipse([x - s, y - s, x + s, y + s], fill=(235, 245, 255, 220))
    f.comp(img, alpha)


def sc_year(c):
    f = Frame(vgrad((5, 8, 20), (24, 34, 60)))
    STARS.draw(f, c.g, 0.5)
    img, d = f.layer()
    d.polygon([(0, H)] + MOUNT + [(W, H)], fill=(55, 72, 100, 255))
    d.polygon([(0, H)] + [(x, y + 230 + 40 * math.sin(x / 90)) for x, y in MOUNT] + [(W, H)], fill=(150, 175, 205, 255))
    d.rectangle([0, 1300, W, H], fill=(200, 220, 240, 255))
    f.comp(img)
    snow(f, c)
    temp_counter(f, c, c.wt("minus") - 0.4, 1.8, -18, -73, 560, 250, "AFTER 1 YEAR", c0=ICE, c1=(110, 180, 255))
    frost(f, 0.8)
    return f


CRACKS = []
for _ in range(9):
    x = float(RNG.uniform(60, W - 60))
    pts = [(x, 430.0)]
    for _k in range(5):
        x += float(RNG.uniform(-35, 35))
        pts.append((x, pts[-1][1] + float(RNG.uniform(15, 35))))
    CRACKS.append(pts)
WATER = vgrad((25, 85, 140), (2, 8, 24), 430, H)
SPECKS = [(float(RNG.uniform(0, W)), float(RNG.uniform(600, H)), float(RNG.uniform(0, 6.28))) for _ in range(70)]


def sc_ocean(c):
    f = Frame(vgrad((2, 3, 8), (8, 10, 24)))
    STARS.draw(f, c.g, 0.8)
    th = 26 + 170 * ease_out(c.t / 2.6)
    ib = int(430 + th)
    f.a[430:] = WATER[430:]
    img, d = f.layer()
    for x, y, ph in SPECKS:
        yy = y + 20 * math.sin(c.g * 0.5 + ph)
        if yy > ib + 10:
            d.ellipse([x - 3, yy - 3, x + 3, yy + 3], fill=(140, 190, 230, 120))
    f.comp(img)
    tb = c.wt("blanket") - 0.2
    kb = smooth(tb, tb + 0.8, c.t)
    if kb > 0:
        ys = np.arange(300, dtype=np.float32)
        band = np.exp(-((ys - 40) / 120) ** 2)[:, None, None] * np.ones((1, W, 1), np.float32)
        f.add(band * np.array([255, 120, 40], np.float32), W / 2, ib + 150, 0.35 * kb)
        img, d = f.layer()
        for i in range(36):
            p = (c.g * 0.22 + i / 36 * 3.1) % 1.0
            x = (i * 151) % W + 20 * math.sin(c.g + i)
            if p < 0.8:
                y = lerp(H + 20, ib + 14, ease_out(p / 0.8))
                al = 255
            else:
                y = ib + 14 + (p - 0.8) / 0.2 * 90
                al = int(255 * (1 - (p - 0.8) / 0.2))
            d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=(255, 150, 60, al))
        f.comp_add(img, kb)
    img, d = f.layer()
    d.rectangle([0, 420, W, ib], fill=(205, 232, 250, 250))
    d.rectangle([0, 420, W, 436], fill=(245, 252, 255, 255))
    wave = [(x, ib + 8 * math.sin(x / 60 + c.g)) for x in range(0, W + 31, 30)]
    d.polygon([(0, ib - 2)] + wave + [(W, ib - 2)], fill=(205, 232, 250, 250))
    for pts in CRACKS:
        d.line([(x, min(y, ib)) for x, y in pts], fill=(150, 190, 220, 255), width=3)
    f.comp(img)
    text_label(f, 540, 300, "ICE", 70, (220, 240, 255), smooth(0.4, 1.0, c.t))
    text_label(f, 540, 1020, "LIQUID WATER", 56, (140, 200, 255), smooth(1.2, 1.8, c.t))
    return f


WORMS = [(float(x), float(RNG.uniform(110, 230)), float(RNG.uniform(0, 6.28)))
         for x in list(np.linspace(300, 430, 7)) + list(np.linspace(650, 790, 7))]
PLUME = [(float(RNG.uniform(0, 1)), float(RNG.uniform(-1, 1)), float(RNG.uniform(0.7, 1.3))) for _ in range(200)]
SHRIMP = [(float(RNG.uniform(0, 6.28)), float(RNG.uniform(160, 330)), float(RNG.uniform(0.3, 0.7))) for _ in range(10)]
BUBBLES = [(float(RNG.uniform(250, 830)), float(RNG.uniform(0, 1)), float(RNG.uniform(3, 8))) for _ in range(40)]


def sc_vents(c):
    f = Frame(vgrad((4, 18, 38), (0, 3, 10)))
    vx, vy = 540, 990
    # columna de humo
    img, d = f.layer()
    life = 4.5
    for ph, dr, sp in PLUME:
        age = (c.g * sp + ph * life) % life
        u = age / life
        y = vy - age * 175
        x = vx + dr * 120 * u ** 1.2 + 25 * math.sin(age * 1.8 + ph * 9)
        s = 14 + 70 * u
        col = lerp_c((150, 85, 45), (40, 44, 54), clamp(u * 3))
        d.ellipse([x - s, y - s, x + s, y + s], fill=col + (int(150 * (1 - u)),))
    f.comp(img)
    glow(f, vx, vy, 150, (255, 120, 40), 0.9 + 0.2 * math.sin(c.g * 5))
    img, d = f.layer()
    d.polygon([(400, 1640), (455, 1250), (488, 1030), (502, 990), (578, 990), (592, 1030), (625, 1250), (680, 1640)],
              fill=(58, 46, 42, 255))
    for k in range(8):
        y = 1040 + k * 70
        d.line([(495 - k * 10, y), (585 + k * 10, y + 10)], fill=(80, 64, 56, 255), width=4)
    d.ellipse([500, 978, 580, 1004], fill=(255, 150, 60, 255))
    d.polygon([(0, 1600)] + [(x, 1590 + 25 * math.sin(x / 70)) for x in range(0, W + 1, 40)] + [(W, H), (0, H)],
              fill=(30, 26, 28, 255))
    for x, hgt, ph in WORMS:
        sw = 18 * math.sin(c.g * 1.5 + ph)
        tip = (x + sw, 1610 - hgt)
        d.line([(x, 1612), (x + sw * 0.4, 1610 - hgt * 0.5), tip], fill=(230, 225, 210, 255), width=10)
        d.ellipse([tip[0] - 16, tip[1] - 26, tip[0] + 16, tip[1] + 6], fill=(215, 40, 55, 255))
    for ph, rr, sp in SHRIMP:
        a = ph + c.g * sp
        x, y = vx + rr * math.cos(a), 1250 + 0.4 * rr * math.sin(a)
        d.ellipse([x - 16, y - 7, x + 16, y + 7], fill=(240, 175, 175, 255))
    for x, ph, s in BUBBLES:
        y = 1600 - ((c.g * 0.15 + ph) % 1.0) * 1300
        d.ellipse([x - s, y - s, x + s, y + s], outline=(170, 210, 255, 200), width=2)
    f.comp(img)
    th = c.wt("hydrothermal") - 0.2
    pop = ease_out_back((c.t - th) / 0.35)
    if c.t > th:
        text_label(f, 540, 300, "HYDROTHERMAL VENT", int(58 * max(0.3, pop)), (255, 170, 100), clamp(pop * 2))
    return f


PEOPLE = [(float(RNG.uniform(250, 830)), float(RNG.uniform(0.3, 0.8)), float(RNG.uniform(0, 6.28))) for _ in range(6)]


def sc_humans(c):
    f = Frame(vgrad((2, 3, 9), (12, 14, 30), 0, 600))
    STARS.draw(f, c.g, 0.9)
    snow(f, c, ymax=560, alpha=0.8)
    tv = c.wt("volcanic") - 0.1
    kv = smooth(tv, tv + 0.6, c.t)
    img, d = f.layer()
    d.rectangle([0, 600, W, H], fill=(62, 52, 50, 255))
    for k in range(10):
        d.rectangle([0, 600 + k * 115, W, 715 + k * 115], fill=lerp_c((70, 60, 58), (50, 30, 26), k / 9) + (255,))
    d.rectangle([0, 560, W, 610], fill=(225, 238, 250, 255))
    lava = lerp_c((150, 40, 15), (255, 110, 30), 0.5 + 0.5 * math.sin(c.g * 3) * 0.5 + 0.5 * kv)
    d.polygon([(0, 1700)] + [(x, 1690 + 30 * math.sin(x / 80 + c.g)) for x in range(0, W + 1, 40)] + [(W, H), (0, H)],
              fill=lava + (255,))
    # tubería de calor
    d.rectangle([520, 1000, 560, 1700], fill=(95, 95, 108, 255))
    # pozo de acceso
    d.rectangle([760, 600, 810, 860], fill=(30, 26, 26, 255))
    for k in range(8):
        d.line([(765, 620 + k * 30), (805, 620 + k * 30)], fill=(120, 120, 130, 255), width=4)
    # hábitat
    for x0, x1 in [(150, 450), (470, 930)]:
        d.rounded_rectangle([x0, 860, x1, 1010], radius=60, fill=(80, 88, 106, 255), outline=(150, 165, 190, 255), width=6)
        d.rounded_rectangle([x0 + 22, 885, x1 - 22, 985], radius=40, fill=(255, 210, 140, 255))
    d.rectangle([440, 915, 480, 955], fill=(80, 88, 106, 255))
    for x0, sp, ph in PEOPLE:
        x = x0 + 60 * math.sin(c.g * sp + ph)
        if 440 < x < 480:
            continue
        d.ellipse([x - 11, 905, x + 11, 927], fill=(40, 34, 40, 255))
        d.rounded_rectangle([x - 13, 928, x + 13, 982], radius=10, fill=(40, 34, 40, 255))
    f.comp(img)
    glow(f, 540, 1740, 420, (255, 90, 20), 0.5 + 0.6 * kv)
    img, d = f.layer()
    for k in range(5):
        y = 1700 - ((c.g * 160 + k * 140) % 700)
        d.ellipse([528, y - 22, 552, y + 22], fill=(255, 150, 60, 230))
    f.comp_add(img, 0.9)
    glow(f, 540, 935, 360, (255, 190, 110), 0.25)
    tu = c.wt("underground") - 0.15
    if c.t > tu:
        pop = ease_out_back((c.t - tu) / 0.35)
        text_label(f, 540, 300, "UNDERGROUND", int(64 * max(0.3, pop)), (255, 210, 150), clamp(pop * 2))
    tn = c.wt("nuclear") - 0.15
    if c.t > tn:
        pop = ease_out_back((c.t - tn) / 0.4)
        r = 70 * max(0.05, pop)
        x, y = 700, 760
        glow(f, x, y, r * 2.4, (255, 220, 0), 0.6)
        img, d = f.layer()
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 214, 10, 255), outline=(0, 0, 0, 255), width=5)
        for k in range(3):
            a0 = -90 + k * 120 - 30
            d.pieslice([x - r * 0.85, y - r * 0.85, x + r * 0.85, y + r * 0.85], a0, a0 + 60, fill=(0, 0, 0, 255))
        d.ellipse([x - r * 0.24, y - r * 0.24, x + r * 0.24, y + r * 0.24], fill=(255, 214, 10, 255))
        d.ellipse([x - r * 0.15, y - r * 0.15, x + r * 0.15, y + r * 0.15], fill=(0, 0, 0, 255))
        f.comp(img)
    return f


def sc_end(c):
    f = space(c, drift=(-14, 10))
    p = ease_out(c.t / (c.T + 2))
    R = int(lerp(330, 110, p))
    EARTH.draw(f, lerp(540, 600, p), lerp(860, 760, p), R, 0.1 * c.g, sun=0.0, ambient=0.42, frozen=1.0, clouds=0.0,
               tilt=0.35)
    temp_counter(f, c, c.wt("minus") - 0.3, 2.0, -73, -240, 280, 210, "FOREVER AFTER", c0=(110, 180, 255),
                 c1=(200, 235, 255))
    tf = c.wt("forever") - 0.1
    f.fill((0, 0, 0), smooth(tf, tf + 1.8, c.t))
    return f


def sc_black(c):
    return Frame(np.zeros((H, W, 3), np.float32))


# (escena, narración, pausa después)
BEATS = [
    (sc_hook, "What if the Sun suddenly disappeared?", 0.25),
    (sc_gone, "One second, it's there. And the next... it's gone.", 0.7),
    (sc_clock, "But down here, you wouldn't notice a thing. Sunlight takes eight minutes and twenty seconds to reach us.", 0.3),
    (sc_party, "So for eight minutes, life goes on like nothing happened.", 0.25),
    (sc_dark, "Then, the lights go out. The Sun vanishes from the sky, and the Moon goes dark with it.", 0.5),
    (sc_fly, "Gravity travels at the speed of light too. So at that exact moment, Earth stops orbiting, and flies off "
             "in a straight line, at a hundred and seven thousand kilometers per hour.", 0.35),
    (sc_week, "Within a week, the average temperature drops below minus eighteen degrees.", 0.3),
    (sc_plants, "With no sunlight, photosynthesis stops. Plants die within weeks, and the food chain collapses.", 0.35),
    (sc_year, "After one year, it's minus seventy three degrees.", 0.3),
    (sc_ocean, "The oceans freeze over. But the ice acts like a blanket, keeping the water underneath liquid for "
               "thousands of years.", 0.3),
    (sc_vents, "Deep down, life around hydrothermal vents doesn't need the Sun at all. It could survive for millions "
               "of years.", 0.3),
    (sc_humans, "And us? Our best bet would be underground, near volcanic heat, or in sealed habitats running on "
                "nuclear power.", 0.35),
    (sc_end, "Eventually, Earth would settle at around minus two hundred and forty degrees. A frozen, dark world, "
             "drifting through space... forever.", 0.6),
    (sc_black, None, 1.4),
]

# se rellenan en main()
TL = []  # (inicio, duración, palabras, grupos)


def render_frame(n):
    g = n / FPS
    i = 0
    for k, (s, d, _, _) in enumerate(TL):
        if g >= s:
            i = k
    s, T, words, groups = TL[i]
    fn = BEATS[i][0]
    c = Ctx(g - s, T, g, words)
    f = fn(c)
    img = f.image()
    # cámara: zoom lento + golpe de zoom al empezar cada plano + temblor
    z = 1 + 0.035 * (c.t / T if i % 2 == 0 else 1 - c.t / T)
    if i > 0:
        z += 0.07 * (1 - ease_out(c.t / 0.3))
    ox = c.shake * math.sin(g * 73.0)
    oy = c.shake * math.sin(g * 91.0 + 1)
    if z != 1 or c.shake:
        zw, zh = int(W * z + 2 * abs(ox) + 2), int(H * z + 2 * abs(oy) + 2)
        big = img.resize((zw, zh), Image.BILINEAR)
        x0 = int((zw - W) / 2 + ox)
        y0 = int((zh - H) / 2 + oy)
        img = big.crop((x0, y0, x0 + W, y0 + H))
    out = Frame(np.asarray(img, np.float32))
    draw_caption(out, groups, c.t)
    return np.clip(out.a, 0, 255).astype(np.uint8).tobytes()


# ================================================================ música y efectos
def build_audio(total, voices):
    sr = A.SR
    n = int(total * sr) + sr
    voice = np.zeros(n, np.float32)
    music = np.zeros(n, np.float32)
    sfx = np.zeros(n, np.float32)
    for (s, d, words, _), v in zip(TL, voices):
        if v is not None:
            A.put(voice, v, s)

    def gt(beat, word, nth=0):
        s, _, words, _ = TL[beat]
        c = Ctx(0, TL[beat][1], 0, words)
        return s + c.wt(word, nth=nth)

    st = [s for s, _, _, _ in TL]
    t_gone = gt(1, "gone") - 0.04
    t_out = gt(4, "out") - 0.08
    end = total

    # A: misterio
    A.put(music, A.pad([55, 110, 130.81, 164.81], t_gone + 0.1, 1.2, 0.05, 1300, 1) * 0.9, 0)
    A.put(sfx, A.riser(2.6), t_gone - 2.6, 0.8)
    A.put(sfx, A.boom(3.5), t_gone, 1.3)
    # B: tensión
    A.put(music, A.pad([55, 58.27, 82.41, 110], st[3] - t_gone - 0.6 + 0.4, 1.5, 0.4, 600, 2) * 1.1, t_gone + 0.6)
    te = gt(2, "eight") - 0.05
    tt = te
    k = 0
    while tt < t_out - 0.1:
        A.put(sfx, A.tick(k % 2 == 0), tt, 0.35)
        tt += 0.25
        k += 1
    A.put(sfx, A.hit(), gt(2, "sunlight") - 0.1, 0.5)
    # C: vida normal
    seg = t_out - st[3]
    A.put(music, A.pad([130.81, 164.81, 196.0, 65.41], seg + 0.05, 0.4, 0.05, 1800, 3) * 0.8, st[3])
    notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63]
    tt, k = st[3], 0
    while tt < t_out - 0.1:
        A.put(music, A.pluck(notes[k % len(notes)]) * 0.5, tt)
        tt += 0.21
        k += 1
    A.put(sfx, A.sub_drop(2.4), t_out, 1.4)
    A.put(sfx, A.whoosh(0.9, 4, up=False), t_out - 0.3, 0.6)
    # D: oscuridad hasta el final
    dlen = end - (t_out + 0.7)
    A.put(music, A.pad([36.71, 73.42, 87.31, 110.0], dlen, 2.5, 3.0, 650, 4) * 1.2, t_out + 0.7)
    A.put(music, A.heartbeat(st[9] - st[5]) * 0.9, st[5])
    w = A.wind(st[10] - st[6])
    fade = np.minimum(1, np.minimum(np.arange(len(w)) / (1.5 * sr), (len(w) - np.arange(len(w))) / (1.5 * sr)))
    A.put(sfx, w * fade.astype(np.float32), st[6], 0.45)
    A.put(music, A.shimmer(st[11] - st[10]) * 0.25, st[10])
    A.put(music, A.pad([146.83, 220.0, 349.23, 293.66], end - st[12], 2.5, 3.5, 2200, 5) * 0.7, st[12])
    # golpes en los números y whoosh en los cortes
    for b in range(2, 13):
        A.put(sfx, A.whoosh(0.5, b), st[b] - 0.32, 0.35)
    for b, wd in [(5, "hundred"), (6, "temperature"), (8, "minus"), (12, "minus")]:
        A.put(sfx, A.hit(), gt(b, wd) - 0.3, 0.45)
    A.put(sfx, A.hit(), gt(7, "collapses"), 0.6)

    music = A.reverb(music, 3.0, 0.35)
    music = A.duck(music, voice, 0.55)
    mix = voice * 1.0 + music * 0.20 + sfx * 0.5
    # fundido final
    fo = int(1.2 * sr)
    mix[int(end * sr) - fo:int(end * sr)] *= np.linspace(1, 0, fo, dtype=np.float32)
    mix[int(end * sr):] = 0
    mix /= max(1.0, np.abs(mix).max() / 0.95)
    st_mix = np.stack([mix, mix], 1)
    return st_mix[:int(total * sr)]


# ================================================================ principal
def prepare():
    """Sintetiza las voces, calcula la línea de tiempo y devuelve (duración, voces)."""
    os.makedirs(WORK, exist_ok=True)
    voices = []
    for i, (_, text, gap) in enumerate(BEATS):
        if text:
            v = A.synth_voice(text, PIPER_MODEL, PIPER_LENGTH, os.path.join(WORK, f"v{i:02d}.wav"))
        else:
            v = None
        voices.append(v)
        print(f"voz {i + 1}/{len(BEATS)}", flush=True)
    t = 0.0
    for (fn, text, gap), v in zip(BEATS, voices):
        if v is None:
            TL.append((t, gap, [], []))
            t += gap
            continue
        words = [(w, a + LEAD, b + LEAD) for w, a, b in A.word_times(text, v)]
        dur = LEAD + len(v) / A.SR + gap
        TL.append((t, dur, words, group_words([(w.upper(), a, b) for w, a, b in words])))
        t += dur
    return t, voices


def main():
    total, voices = prepare()
    voices_shifted = [None if v is None else np.concatenate([np.zeros(int(LEAD * A.SR), np.float32), v]) for v in voices]
    mix = build_audio(total, voices_shifted)
    wav = os.path.join(WORK, "mix.wav")
    A.write_wav(wav, mix)
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
            if k % 150 == 0:
                print(f"fotograma {k}/{nframes}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("listo:", OUT)


if __name__ == "__main__":
    main()

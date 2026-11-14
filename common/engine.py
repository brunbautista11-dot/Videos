"""Motor de render: fotogramas en numpy + Pillow, planeta 3D, Sol, estrellas y subtítulos."""
import math
import os
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1080, 1920, 30
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")

YELLOW = (255, 214, 10)
WHITE = (255, 255, 255)
ICE = (170, 225, 255)


# ---------------------------------------------------------------- utilidades
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def smooth(a, b, x):
    """smoothstep de a a b."""
    if b == a:
        return 1.0 if x >= b else 0.0
    t = clamp((x - a) / (b - a))
    return t * t * (3 - 2 * t)


def ease_out(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_out_back(t, s=1.7):
    t = clamp(t) - 1
    return t * t * ((s + 1) * t + s) + 1


def lerp(a, b, k):
    return a + (b - a) * k


def lerp_c(c1, c2, k):
    return tuple(int(round(lerp(x, y, k))) for x, y in zip(c1, c2))


@lru_cache(maxsize=None)
def font(name, size, var=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), int(size))
    if var:
        f.set_variation_by_name(var)
    return f


def caption_font(size):
    return font("Montserrat.ttf", size, "Black")


def big_font(size):
    return font("Anton-Regular.ttf", size)


def label_font(size):
    return font("Montserrat.ttf", size, "ExtraBold")


# ---------------------------------------------------------------- fotograma
class Frame:
    """Lienzo float32 (H, W, 3) en 0..255 con utilidades de composición."""

    def __init__(self, bg):
        self.a = np.array(bg, dtype=np.float32, copy=True)

    # recorte de una caja (x0, y0, w, h) contra el lienzo
    @staticmethod
    def _clip(x0, y0, w, h):
        fx0, fy0 = max(0, x0), max(0, y0)
        fx1, fy1 = min(W, x0 + w), min(H, y0 + h)
        if fx0 >= fx1 or fy0 >= fy1:
            return None
        return fx0, fy0, fx1, fy1, fx0 - x0, fy0 - y0, fx1 - x0, fy1 - y0

    def add(self, spr, cx, cy, gain=1.0):
        """Suma aditiva de un sprite (h, w, 3) centrado en cx, cy."""
        h, w = spr.shape[:2]
        c = self._clip(int(round(cx - w / 2)), int(round(cy - h / 2)), w, h)
        if c is None or gain <= 0:
            return
        fx0, fy0, fx1, fy1, sx0, sy0, sx1, sy1 = c
        self.a[fy0:fy1, fx0:fx1] += spr[sy0:sy1, sx0:sx1] * gain

    def over(self, rgb, alpha, cx, cy, opacity=1.0):
        """Composición normal de un sprite rgb (h, w, 3) con alfa (h, w) en 0..1."""
        h, w = rgb.shape[:2]
        c = self._clip(int(round(cx - w / 2)), int(round(cy - h / 2)), w, h)
        if c is None or opacity <= 0:
            return
        fx0, fy0, fx1, fy1, sx0, sy0, sx1, sy1 = c
        al = alpha[sy0:sy1, sx0:sx1, None] * opacity
        reg = self.a[fy0:fy1, fx0:fx1]
        reg *= 1 - al
        reg += rgb[sy0:sy1, sx0:sx1] * al

    def layer(self):
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        return img, ImageDraw.Draw(img)

    def comp(self, img, opacity=1.0):
        """Compone una capa RGBA de Pillow (solo su caja ocupada)."""
        bb = img.getbbox()
        if not bb or opacity <= 0:
            return
        x0, y0, x1, y1 = bb
        la = np.asarray(img.crop(bb), dtype=np.float32)
        al = la[..., 3:4] * (opacity / 255.0)
        reg = self.a[y0:y1, x0:x1]
        reg *= 1 - al
        reg += la[..., :3] * al

    def comp_add(self, img, gain=1.0):
        bb = img.getbbox()
        if not bb:
            return
        x0, y0, x1, y1 = bb
        la = np.asarray(img.crop(bb), dtype=np.float32)
        self.a[y0:y1, x0:x1] += la[..., :3] * (la[..., 3:4] / 255.0) * gain

    def fill(self, color, alpha):
        if alpha <= 0:
            return
        self.a *= 1 - alpha
        self.a += np.array(color, np.float32) * alpha

    def image(self):
        return Image.fromarray(np.clip(self.a, 0, 255).astype(np.uint8))


# ---------------------------------------------------------------- fondos
@lru_cache(maxsize=64)
def vgrad(top, bottom, y0=0, y1=H):
    t = np.clip((np.arange(H, dtype=np.float32) - y0) / max(1, y1 - y0), 0, 1)[:, None]
    col = np.array(top, np.float32) * (1 - t) + np.array(bottom, np.float32) * t
    return np.ascontiguousarray(np.broadcast_to(col[:, None, :], (H, W, 3)))


def grad_mix(g1, g2, k):
    if k <= 0:
        return g1
    if k >= 1:
        return g2
    return g1 * (1 - k) + g2 * k


@lru_cache(maxsize=None)
def gauss(r):
    """Halo gaussiano normalizado (2r, 2r) en 0..1."""
    r = max(2, int(r))
    y, x = np.mgrid[-r:r, -r:r].astype(np.float32) + 0.5
    d2 = (x * x + y * y) / (r * r)
    return np.exp(-d2 * 4.5).astype(np.float32)


def glow(frame, cx, cy, r, color, gain=1.0):
    g = gauss(int(r))
    frame.add(g[..., None] * np.array(color, np.float32), cx, cy, gain)


class Stars:
    """Campo de estrellas en dos capas con paralaje y unas cuantas que titilan."""

    def __init__(self, seed=7):
        rng = np.random.default_rng(seed)
        self.layers = []
        for n, smin, smax, bmax in [(900, 0.6, 1.3, 150), (260, 1.0, 2.2, 255)]:
            img = np.zeros((H + 400, W + 400, 3), np.float32)
            xs = rng.integers(0, W + 400, n)
            ys = rng.integers(0, H + 400, n)
            for x, y in zip(xs, ys):
                s = rng.uniform(smin, smax)
                b = rng.uniform(60, bmax)
                tint = np.array([rng.uniform(0.8, 1.0), rng.uniform(0.85, 1.0), 1.0], np.float32)
                r = int(math.ceil(s * 2))
                yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
                k = np.exp(-(xx ** 2 + yy ** 2) / (s * s)).astype(np.float32)
                y0, y1 = max(0, y - r), min(H + 400, y + r + 1)
                x0, x1 = max(0, x - r), min(W + 400, x + r + 1)
                img[y0:y1, x0:x1] += k[y0 - (y - r):y1 - (y - r), x0 - (x - r):x1 - (x - r), None] * b * tint
            self.layers.append(img)
        self.tw = [(rng.uniform(40, W - 40), rng.uniform(40, H - 40), rng.uniform(0, 6.28), rng.uniform(1.5, 3.5))
                   for _ in range(26)]

    def draw(self, frame, g, alpha=1.0, drift=(4.0, 7.0)):
        if alpha <= 0:
            return
        for i, img in enumerate(self.layers):
            sp = 0.5 + i
            ox = int((200 + g * drift[0] * sp) % 400)
            oy = int((200 + g * drift[1] * sp) % 400)
            frame.a += img[oy:oy + H, ox:ox + W] * alpha
        for x, y, ph, sp in self.tw:
            b = (0.5 + 0.5 * math.sin(g * sp + ph)) * alpha
            glow(frame, x, y, 10, (255, 255, 255), b * 0.9)


# ---------------------------------------------------------------- ruido esférico
def sphere_noise(p, seed, octaves=(1.6, 3.2, 6.4, 12.8, 25.6), per=10, decay=0.55):
    """Ruido continuo sobre la esfera: suma de ondas planas con direcciones aleatorias."""
    rng = np.random.default_rng(seed)
    out = np.zeros(p.shape[1:], np.float32)
    amp = 1.0
    for f in octaves:
        for _ in range(per):
            k = rng.normal(size=3)
            k /= np.linalg.norm(k)
            ph = rng.uniform(0, 2 * np.pi)
            out += amp * np.sin(f * (k[0] * p[0] + k[1] * p[1] + k[2] * p[2]) + ph)
        amp *= decay
    out -= out.mean()
    out /= out.std() + 1e-6
    return out


# ---------------------------------------------------------------- planeta
class Planet:
    TW, TH = 1024, 512

    def __init__(self, seed=3):
        lat = (0.5 - (np.arange(self.TH) + 0.5) / self.TH) * np.pi
        lon = (np.arange(self.TW) + 0.5) / self.TW * 2 * np.pi
        LON, LAT = np.meshgrid(lon, lat)
        p = np.stack([np.cos(LAT) * np.sin(LON), np.sin(LAT), np.cos(LAT) * np.cos(LON)]).astype(np.float32)
        e = sphere_noise(p, seed)
        self.elev = e
        self.cloud = sphere_noise(p, seed + 11, octaves=(2.5, 5, 10, 20), per=8, decay=0.6)
        self.city = sphere_noise(p, seed + 23, octaves=(40, 80, 120), per=12, decay=0.9)
        self.abslat = np.abs(LAT).astype(np.float32) / (np.pi / 2)
        land = e > 0.35
        self.land = land
        # albedo base
        sea_deep = np.array([12, 45, 110], np.float32)
        sea_shal = np.array([30, 105, 170], np.float32)
        lowl = np.array([60, 130, 60], np.float32)
        high = np.array([140, 120, 80], np.float32)
        k_sea = np.clip((e + 1.2) / 1.55, 0, 1)[..., None]
        sea = sea_deep * (1 - k_sea) + sea_shal * k_sea
        k_l = np.clip((e - 0.35) / 1.6, 0, 1)[..., None]
        lnd = lowl * (1 - k_l) + high * k_l
        # desiertos en latitudes medias-bajas
        des = np.array([190, 165, 110], np.float32)
        kd = (np.clip(1 - np.abs(self.abslat - 0.28) * 5, 0, 1) * np.clip(self.cloud * -0.6, 0, 1))[..., None]
        lnd = lnd * (1 - kd) + des * kd
        self.albedo = np.where(land[..., None], lnd, sea).astype(np.float32)

    @staticmethod
    @lru_cache(maxsize=32)
    def _grid(R):
        n = 2 * R
        y, x = np.mgrid[0:n, 0:n].astype(np.float32)
        x = (x + 0.5 - R) / R
        y = (y + 0.5 - R) / R
        r2 = x * x + y * y
        z = np.sqrt(np.clip(1 - r2, 0, 1))
        alpha = np.clip((1 - np.sqrt(r2)) * R + 0.5, 0, 1).astype(np.float32)
        lat = np.arcsin(np.clip(-y, -1, 1))
        return x, y, z, alpha, np.arctan2(x, np.maximum(z, 1e-4)), lat, r2

    def render(self, R, rot, light=(-0.55, -0.35, 0.76), sun=1.0, frozen=0.0, city=0.0,
               ambient=0.05, clouds=1.0, tilt=0.0):
        R = int(R)
        x, y, z, alpha, lon0, lat, r2 = self._grid(R)
        # latitud/longitud reales en la superficie (con inclinación del eje)
        X, Y, Z = x, -y, z
        if tilt:
            ct, st = math.cos(tilt), math.sin(tilt)
            Y, Z = Y * ct - Z * st, Y * st + Z * ct
        lat = np.arcsin(np.clip(Y, -1, 1))
        lon = np.arctan2(X, Z) + rot
        u = ((lon / (2 * np.pi)) % 1.0 * self.TW).astype(np.int32) % self.TW
        v = np.clip(((0.5 - lat / np.pi) * self.TH).astype(np.int32), 0, self.TH - 1)
        alb = self.albedo[v, u]
        e = self.elev[v, u]
        al = self.abslat[v, u]
        # hielo: casquetes que crecen con 'frozen'
        cap = 0.78 - 0.95 * frozen + 0.08 * e
        ki = np.clip((al - cap) * 6, 0, 1)
        ki = np.maximum(ki, np.clip((frozen - 0.75) * 4, 0, 1))
        ice = np.array([225, 238, 250], np.float32)
        ice = ice * (0.82 + 0.1 * np.clip(e, -1.5, 1.5))[..., None]
        alb = alb * (1 - ki[..., None]) + ice * ki[..., None]
        # nubes
        if clouds > 0:
            cl = self.cloud[v, (u + int(rot * 30)) % self.TW]
            kc = np.clip((cl - 0.55) * 1.6, 0, 1) * 0.85 * clouds
            alb = alb * (1 - kc[..., None]) + 245 * kc[..., None]
        # luz
        L = np.array(light, np.float32)
        L /= np.linalg.norm(L)
        diff = np.clip(x * L[0] + (-y) * L[1] + z * L[2], 0, 1)
        shade = ambient + sun * diff * 1.05
        col = alb * shade[..., None]
        if ambient > 0.08:
            col *= np.array([0.85, 0.9, 1.1], np.float32)
        # luces de ciudades en el lado nocturno
        if city > 0:
            cv = self.city[v, u]
            kcit = (np.clip((cv - 1.7) * 1.5, 0, 1) * self.land[v, u] * (1 - ki) *
                    np.clip(1 - diff * 3 * sun, 0, 1) * city)
            col += kcit[..., None] * np.array([255, 190, 90], np.float32)
        # atmósfera en el borde
        rim = np.clip(1 - z, 0, 1) ** 2.5
        col += (rim * (0.25 + 0.9 * sun * np.clip(diff + 0.3, 0, 1)))[..., None] * np.array([70, 130, 255], np.float32)
        return col.astype(np.float32), alpha

    def draw(self, frame, cx, cy, R, rot, halo=True, **kw):
        rgb, al = self.render(R, rot, **kw)
        if halo:
            s = kw.get("sun", 1.0)
            glow(frame, cx, cy, R * 1.25, (60, 120, 255), 0.35 * (0.3 + s))
        frame.over(rgb, al, cx, cy)


# ---------------------------------------------------------------- Sol
class Sun:
    def __init__(self, seed=5):
        rng = np.random.default_rng(seed)
        n = 512
        y, x = np.mgrid[0:n, 0:n].astype(np.float32) / n
        g = np.zeros((n, n), np.float32)
        for f, a in [(6, 1), (13, 0.6), (27, 0.35), (55, 0.2)]:
            for _ in range(6):
                k = rng.normal(size=2)
                k = k / np.linalg.norm(k) * f * 2 * np.pi
                g += a * np.sin(k[0] * x + k[1] * y + rng.uniform(0, 6.28))
        g = (g - g.mean()) / g.std()
        self.gran = np.tile(g, (2, 2))
        self.n = n
        self.rays = [(rng.integers(3, 9), rng.uniform(0, 6.28), rng.uniform(0.2, 0.9)) for _ in range(5)]

    @staticmethod
    @lru_cache(maxsize=16)
    def _grid(R):
        S = int(R * 3.2)
        y, x = np.mgrid[-S:S, -S:S].astype(np.float32) + 0.5
        r = np.sqrt(x * x + y * y) / R
        th = np.arctan2(y, x)
        return S, x, y, r, th

    def draw(self, frame, cx, cy, R, t, power=1.0):
        if power <= 0 or R < 1:
            return
        R = max(2, int(R))
        S, x, y, r, th = self._grid(R)
        # corona con rayos animados
        mod = np.ones_like(th)
        for k, ph, sp in self.rays:
            mod += 0.12 * np.sin(k * th + ph + t * sp)
        cor = np.exp(-np.clip(r - 1, 0, None) * 2.2) * mod * (r > 0.98)
        cor += np.exp(-np.clip(r - 1, 0, None) * 0.7) * 0.35
        cor = cor * (r > 0.98)
        col = np.array([255, 150, 40], np.float32)
        frame.add(cor[..., None] * col, cx, cy, 0.9 * power)
        # disco con oscurecimiento al borde y granulación
        n = self.n
        ox = int(t * 9) % n
        oy = int(t * 6) % n
        idx_y = ((y + S) * (n / (2 * S)) + oy).astype(np.int32) % n
        idx_x = ((x + S) * (n / (2 * S)) + ox).astype(np.int32) % n
        gr = self.gran[idx_y, idx_x]
        mu = np.sqrt(np.clip(1 - r * r, 0, 1))
        inside = np.clip((1 - r) * R + 0.5, 0, 1)
        limb = 0.45 + 0.55 * mu
        disk = np.stack([np.full_like(r, 255), 205 + 45 * mu, 90 + 140 * mu ** 2], -1)
        disk *= (limb * (1 + 0.07 * gr))[..., None]
        frame.over(disk, inside * min(1.0, power), cx, cy)
        glow(frame, cx, cy, R * 1.3, (255, 200, 120), 0.6 * power)


# ---------------------------------------------------------------- textos
def text_big(frame, x, y, text, size, color, alpha=1.0, stroke=10, anchor="mm", glow_c=None):
    if alpha <= 0:
        return
    img, d = frame.layer()
    f = big_font(size)
    if glow_c:
        gimg, gd = frame.layer()
        gd.text((x, y), text, font=f, fill=glow_c + (255,), anchor=anchor)
        from PIL import ImageFilter
        gimg = gimg.filter(ImageFilter.GaussianBlur(18))
        frame.comp_add(gimg, 0.9 * alpha)
    d.text((x, y + 8), text, font=f, fill=(0, 0, 0, 140), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 140))
    d.text((x, y), text, font=f, fill=color + (255,), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 255))
    frame.comp(img, alpha)


def text_label(frame, x, y, text, size, color, alpha=1.0, stroke=6, anchor="mm"):
    if alpha <= 0:
        return
    img, d = frame.layer()
    d.text((x, y), text, font=label_font(size), fill=color + (255,), anchor=anchor,
           stroke_width=stroke, stroke_fill=(0, 0, 0, 255))
    frame.comp(img, alpha)


# ---------------------------------------------------------------- subtítulos palabra a palabra
CAP_SIZE = 92
CAP_Y = 1440
CAP_MAXW = 900


def group_words(words):
    """Agrupa las palabras en bloques de 1–3 que quepan en pantalla."""
    f = caption_font(CAP_SIZE)
    groups, cur = [], []
    for i, (w, t0, t1) in enumerate(words):
        test = " ".join([x[0] for x in cur] + [w])
        if cur and (len(cur) >= 3 or f.getlength(test) > CAP_MAXW):
            groups.append(cur)
            cur = []
        cur.append((w, t0, t1))
        if w[-1] in ".?!," and len(cur) >= 1 and i + 1 < len(words):
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    return groups


def draw_caption(frame, groups, t):
    if not groups or t < groups[0][0][1] - 0.05:
        return
    gi = 0
    for i, g in enumerate(groups):
        if t >= g[0][1] - 0.05:
            gi = i
    g = groups[gi]
    pop = ease_out_back((t - g[0][1] + 0.05) / 0.16)
    gscale = 0.75 + 0.25 * pop
    active = 0
    for i, (w, t0, _) in enumerate(g):
        if t >= t0 - 0.02:
            active = i
    sizes = []
    for i, (w, t0, _) in enumerate(g):
        k = 1.0
        if i == active:
            k = 1.0 + 0.12 * min(1.15, ease_out_back((t - t0) / 0.12))
        sizes.append(max(10, int(CAP_SIZE * gscale * k)))
    fonts = [caption_font(sz) for sz in sizes]
    widths = [fo.getlength(w) for fo, (w, _, _) in zip(fonts, g)]
    space = caption_font(CAP_SIZE).getlength(" ") * 1.15
    total = sum(widths) + space * (len(g) - 1)
    x = (W - total) / 2
    img, d = frame.layer()
    for i, (w, t0, t1) in enumerate(g):
        cx = x + widths[i] / 2
        col = YELLOW if i == active else WHITE
        d.text((cx, CAP_Y + 10), w, font=fonts[i], fill=(0, 0, 0, 170), anchor="mm", stroke_width=14,
               stroke_fill=(0, 0, 0, 170))
        d.text((cx, CAP_Y), w, font=fonts[i], fill=col + (255,), anchor="mm", stroke_width=12,
               stroke_fill=(0, 0, 0, 255))
        x += widths[i] + space
    frame.comp(img, clamp(pop * 3))

"""Renderizador 3D sencillo (estilo low-poly) sobre Pillow.

Cajas con sombreado plano y vetas de madera, muelles helicoidales, cilindros y esferas.
Ordena por profundidad (algoritmo del pintor), dibuja con supermuestreo 2x y añade
sombras suaves sobre el suelo y una rejilla en perspectiva.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SS = 2
LIGHT = np.array([-0.45, 0.85, 0.55], np.float32)
LIGHT /= np.linalg.norm(LIGHT)


def shade(color, n, amb=0.5, k=0.55):
    s = amb + k * max(0.0, float(np.dot(n, LIGHT)))
    return tuple(int(min(255, c * s)) for c in color)


class Camera:
    def __init__(self, yaw, pitch, dist, target=(0, 30, 0), f=2000, cx=540, cy=900):
        self.f, self.cx, self.cy = f, cx, cy
        t = np.array(target, np.float32)
        self.pos = t + dist * np.array([math.cos(pitch) * math.sin(yaw), math.sin(pitch),
                                        math.cos(pitch) * math.cos(yaw)], np.float32)
        fw = t - self.pos
        fw /= np.linalg.norm(fw)
        rt = np.cross(fw, [0, 1, 0])
        rt /= np.linalg.norm(rt)
        self.fw, self.rt, self.up = fw, rt, np.cross(rt, fw)

    def cam(self, P):
        d = np.asarray(P, np.float32) - self.pos
        return d @ self.rt, d @ self.up, d @ self.fw

    def project(self, P):
        x, y, z = self.cam(P)
        z = np.maximum(z, 1.0)
        return self.cx + self.f * x / z, self.cy - self.f * y / z, z

    def px(self, P):
        """Proyecta a coordenadas del lienzo supermuestreado."""
        x, y, z = self.project(P)
        return list(zip((x * SS).tolist(), (y * SS).tolist())) if np.ndim(x) else (x * SS, y * SS)


# índices de vértices: v = xi + 2*yi + 4*zi
FACES = [((0, 2, 6, 4), (-1, 0, 0), 0), ((1, 5, 7, 3), (1, 0, 0), 0),
         ((0, 4, 5, 1), (0, -1, 0), 1), ((2, 3, 7, 6), (0, 1, 0), 1),
         ((0, 1, 3, 2), (0, 0, -1), 2), ((4, 6, 7, 5), (0, 0, 1), 2)]
GRAIN_FRACS = (0.18, 0.41, 0.63, 0.86)


class Box:
    def __init__(self, a, b, color, grain=None, outline=True, internal=(), top=None, shadow=True, yaw=0.0,
                 offset=(0, 0, 0), pivot=None, amb=0.5):
        self.a = np.minimum(np.array(a, np.float32), np.array(b, np.float32))
        self.b = np.maximum(np.array(a, np.float32), np.array(b, np.float32))
        self.color, self.grain, self.outline = color, grain, outline
        self.internal = set(internal)  # índices de caras internas (no se dibujan)
        self.top = top  # función extra para dibujar sobre la cara superior
        self.shadow = shadow
        self.yaw = yaw
        self.offset = np.array(offset, np.float32)
        self.pivot = None if pivot is None else np.array(pivot, np.float32)
        self.amb = amb

    def verts(self):
        a, b = self.a, self.b
        v = np.array([[(a, b)[i & 1][0], (a, b)[(i >> 1) & 1][1], (a, b)[(i >> 2) & 1][2]] for i in range(8)],
                     np.float32)
        if self.yaw:
            c = self.pivot if self.pivot is not None else (a + b) / 2
            cy, sy = math.cos(self.yaw), math.sin(self.yaw)
            d = v - c
            v = c + np.stack([d[:, 0] * cy + d[:, 2] * sy, d[:, 1], -d[:, 0] * sy + d[:, 2] * cy], 1)
        return v + self.offset

    def rot(self, n):
        if not self.yaw:
            return np.array(n, np.float32)
        cy, sy = math.cos(self.yaw), math.sin(self.yaw)
        return np.array([n[0] * cy + n[2] * sy, n[1], -n[0] * sy + n[2] * cy], np.float32)

    def center(self):
        return (self.a + self.b) / 2 + self.offset

    def items(self, cam):
        v = self.verts()
        sx, sy, sz = cam.project(v)
        P = list(zip((sx * SS).tolist(), (sy * SS).tolist()))
        depth = float(cam.cam(self.center())[2])
        faces = []
        for fi, (idx, n, ax) in enumerate(FACES):
            if fi in self.internal:
                continue
            nw = self.rot(n)
            fc = v[list(idx)].mean(0)
            if np.dot(nw, cam.pos - fc) <= 0:
                continue
            faces.append((fi, idx, nw, ax, n))

        def draw(d):
            for fi, idx, nw, ax, n in faces:
                col = shade(self.color, nw, self.amb)
                poly = [P[i] for i in idx]
                d.polygon(poly, fill=col + (255,))
                if self.grain is not None and ax != self.grain:
                    gcol = tuple(int(c * 0.82) for c in col) + (255,)
                    # ejes dentro de la cara: el de la veta (g) y el otro (o)
                    other = 3 - ax - self.grain
                    for fr in GRAIN_FRACS:
                        p0 = self._face_point(v, idx, ax, n_sign(n, ax), self.grain, other, 0.02, fr)
                        p1 = self._face_point(v, idx, ax, n_sign(n, ax), self.grain, other, 0.98, fr)
                        q = cam.px(np.array([p0, p1]))
                        d.line(q, fill=gcol, width=max(1, int(SS * 1.2)))
                if self.outline:
                    d.line(poly + [poly[0]], fill=tuple(int(c * 0.6) for c in col) + (255,), width=SS)
                if self.top and fi == 3:
                    self.top(d, cam, self)
        return [(depth, draw)]

    def _face_point(self, v, idx, ax, sign, g, o, ug, uo):
        a, b = self.a, self.b
        p = np.zeros(3, np.float32)
        p[ax] = b[ax] if sign > 0 else a[ax]
        p[g] = a[g] + (b[g] - a[g]) * ug
        p[o] = a[o] + (b[o] - a[o]) * uo
        if self.yaw:
            c = self.pivot if self.pivot is not None else (a + b) / 2
            cy, sy = math.cos(self.yaw), math.sin(self.yaw)
            d = p - c
            p = c + np.array([d[0] * cy + d[2] * sy, d[1], -d[0] * sy + d[2] * cy], np.float32)
        return p + self.offset

    def footprint(self):
        v = self.verts()
        return v, float(v[:, 1].min())

    def aabb(self):
        v = self.verts()
        return v.min(0), v.max(0)


def n_sign(nw, ax):
    return 1 if nw[ax] > 0 else -1


def split_box(a, b, axis, n, color, **kw):
    """Divide una caja larga en tramos para que el orden por profundidad sea correcto."""
    a = np.array(a, np.float32)
    b = np.array(b, np.float32)
    out = []
    lo, hi = (0, 1) if axis == 0 else ((2, 3) if axis == 1 else (4, 5))
    for i in range(n):
        aa, bb = a.copy(), b.copy()
        aa[axis] = a[axis] + (b[axis] - a[axis]) * i / n
        bb[axis] = a[axis] + (b[axis] - a[axis]) * (i + 1) / n
        internal = set()
        if i > 0:
            internal.add(lo)
        if i < n - 1:
            internal.add(hi)
        out.append(Box(aa, bb, color, internal=internal, outline=False, **kw))
    return out


class Helix:
    def __init__(self, c, r, h, turns=5, color=(175, 185, 200), wire=0.7, pocket=None, glow=0.0):
        self.c = np.array(c, np.float32)
        self.r, self.h, self.turns, self.color, self.wire = r, h, turns, color, wire
        self.pocket = pocket
        self.glow = glow
        self.shadow = False

    def aabb(self):
        r = self.r * 1.15
        return self.c - [r, 0, r], self.c + [r, self.h, r]

    def items(self, cam):
        n = int(self.turns * 18)
        th = np.linspace(0, 2 * np.pi * self.turns, n)
        hp = np.clip(th / (2 * np.pi * self.turns), 0, 1)
        P = np.stack([self.c[0] + self.r * np.cos(th), self.c[1] + self.h * hp, self.c[2] + self.r * np.sin(th)], 1)
        sx, sy, sz = cam.project(P)
        depth = float(cam.cam(self.c + [0, self.h / 2, 0])[2])
        tow = cam.pos - self.c
        front = (np.cos(th) * tow[0] + np.sin(th) * tow[2]) > 0
        width = max(1, int(self.wire * cam.f / depth * SS))
        col = self.color
        if self.glow:
            col = tuple(int(c + (g - c) * self.glow) for c, g in zip(col, (255, 120, 40)))
        back_c = tuple(int(c * 0.55) for c in col) + (255,)
        front_c = col + (255,)
        pts = list(zip((sx * SS).tolist(), (sy * SS).tolist()))

        def draw(d):
            if self.pocket:
                self._pocket(d, cam, False)
            for want, c in ((False, back_c), (True, front_c)):
                seg = []
                for i in range(n):
                    if front[i] == want:
                        seg.append(pts[i])
                    elif seg:
                        if len(seg) > 1:
                            d.line(seg, fill=c, width=width, joint="curve")
                        seg = []
                if len(seg) > 1:
                    d.line(seg, fill=c, width=width, joint="curve")
            if self.pocket:
                self._pocket(d, cam, True)
        return [(depth, draw)]

    def _pocket(self, d, cam, front):
        col = self.pocket + (255,) if front else tuple(int(c * 0.6) for c in self.pocket) + (255,)
        R = self.r * 1.15
        th = np.linspace(0, 2 * np.pi, 25)
        tow = cam.pos - self.c
        for y in (0.0, self.h):
            P = np.stack([self.c[0] + R * np.cos(th), np.full_like(th, self.c[1] + y), self.c[2] + R * np.sin(th)], 1)
            q = cam.px(P)
            fr = (np.cos(th) * tow[0] + np.sin(th) * tow[2]) > 0
            seg = [q[i] for i in range(len(th)) if fr[i] == front]
            if len(seg) > 1:
                d.line(seg, fill=col, width=SS)
        if front:
            # silueta lateral
            ang = math.atan2(tow[2], tow[0])
            for s in (-1, 1):
                a = ang + s * math.pi / 2
                p0 = self.c + [R * math.cos(a), 0, R * math.sin(a)]
                p1 = p0 + [0, self.h, 0]
                d.line(cam.px(np.array([p0, p1])), fill=col, width=SS)


class Cylinder:
    """Cilindro a lo largo del eje x."""

    def __init__(self, c, r, length, color, n=20, spin=0.0, stripes=True, r_end=None, caps=True, amb=0.5):
        self.c = np.array(c, np.float32)
        self.r, self.L, self.color, self.n, self.spin, self.stripes = r, length, color, n, spin, stripes
        self.r1 = r if r_end is None else r_end  # radio en el extremo +x (cono si es distinto)
        self.caps = caps
        self.amb = amb
        self.shadow = True

    def aabb(self):
        R = max(self.r, self.r1)
        e = np.array([self.L / 2, R, R], np.float32)
        return self.c - e, self.c + e

    def items(self, cam):
        n = self.n
        th = np.linspace(0, 2 * np.pi, n, endpoint=False) + self.spin
        x0, x1 = self.c[0] - self.L / 2, self.c[0] + self.L / 2
        ring = np.stack([np.cos(th), np.sin(th)], 1)
        A = np.stack([np.full(n, x0), self.c[1] + ring[:, 1] * self.r, self.c[2] + ring[:, 0] * self.r], 1)
        B = np.stack([np.full(n, x1), self.c[1] + ring[:, 1] * self.r1, self.c[2] + ring[:, 0] * self.r1], 1)
        slope = (self.r - self.r1) / max(self.L, 1e-6)
        PA, PB = cam.px(A), cam.px(B)
        depth = float(cam.cam(self.c)[2])
        quads = []
        for i in range(n):
            j = (i + 1) % n
            m = (th[i] + th[j]) / 2
            nw = np.array([slope, math.sin(m), math.cos(m)], np.float32)
            nw /= np.linalg.norm(nw)
            fc = (A[i] + A[j] + B[i] + B[j]) / 4
            if np.dot(nw, cam.pos - fc) > 0:
                quads.append(([PA[i], PA[j], PB[j], PB[i]], nw, i))
        caps = []
        caps = self.caps if isinstance(self.caps, tuple) else (self.caps, self.caps)
        for P, nx, xx, rr, on in ((PA, -1, x0, self.r, caps[0]), (PB, 1, x1, self.r1, caps[1])):
            if not on or rr < 0.05:
                continue
            nw = np.array([nx, 0, 0], np.float32)
            if np.dot(nw, cam.pos - np.array([xx, self.c[1], self.c[2]])) > 0:
                caps.append((P, nw))

        def draw(d):
            for poly, nw, i in quads:
                col = shade(self.color, nw, self.amb)
                if self.stripes and i % 4 == 0:
                    col = tuple(int(c * 0.85) for c in col)
                d.polygon(poly, fill=col + (255,))
            for P, nw in caps:
                col = shade(self.color, nw, self.amb)
                d.polygon(P, fill=col + (255,), outline=tuple(int(c * 0.6) for c in col) + (255,))
        return [(depth, draw)]

    def footprint(self):
        x0, x1 = self.c[0] - self.L / 2, self.c[0] + self.L / 2
        z0, z1 = self.c[2] - self.r, self.c[2] + self.r
        v = np.array([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], np.float32)
        return v, float(self.c[1] - self.r)


class Sphere:
    def __init__(self, c, r, color):
        self.c = np.array(c, np.float32)
        self.r, self.color = r, color
        self.shadow = True

    def aabb(self):
        return self.c - self.r, self.c + self.r

    def items(self, cam):
        x, y, z = cam.project(self.c)
        rp = self.r * cam.f / z * SS
        X, Y = x * SS, y * SS

        def draw(d):
            for k, s in enumerate(np.linspace(0.55, 1.12, 9)):
                rr = rp * (1 - k / 9 * 0.75)
                ox, oy = -rp * 0.28 * k / 9, -rp * 0.32 * k / 9
                col = tuple(int(min(255, c * s)) for c in self.color) + (255,)
                d.ellipse([X + ox - rr, Y + oy - rr, X + ox + rr, Y + oy + rr], fill=col)
        return [(float(cam.cam(self.c)[2]), draw)]

    def footprint(self):
        c = self.c
        th = np.linspace(0, 2 * np.pi, 16, endpoint=False)
        v = np.stack([c[0] + self.r * np.cos(th), np.zeros(16), c[2] + self.r * np.sin(th)], 1).astype(np.float32)
        return v, float(c[1] - self.r)


class Custom:
    """Elemento con función de dibujo propia: draw(d, cam)."""

    def __init__(self, pos, fn):
        self.pos = np.array(pos, np.float32)
        self.fn = fn
        self.shadow = False

    def aabb(self):
        return self.pos - 0.5, self.pos + 0.5

    def items(self, cam):
        return [(float(cam.cam(self.pos)[2]), lambda d: self.fn(d, cam))]


# ---------------------------------------------------------------- render
def render(objs, cam, W, H, grid=True, grid_alpha=60, shadows=True):
    """Devuelve (capa RGBA de objetos, máscara de sombra float (H, W) en 0..1).

    Los objetos con on_top=True (p. ej. algo apoyado sobre los muelles) se dibujan al final."""
    img = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base = [o for o in objs if not getattr(o, "on_top", False)]
    top = sorted((o for o in objs if getattr(o, "on_top", False)), key=lambda o: -float(cam.cam(o.aabb()[0] / 2 + o.aabb()[1] / 2)[2]))
    for fn in _order(base, cam):
        fn(d)
    for o in top:
        for _, fn in o.items(cam):
            fn(d)
    img = img.resize((W, H), Image.BOX)
    sh = None
    if shadows:
        q = 4
        simg = Image.new("L", (W // q, H // q), 0)
        sd = ImageDraw.Draw(simg)
        for o in objs:
            if not getattr(o, "shadow", False) or not hasattr(o, "footprint"):
                continue
            v, ymin = o.footprint()
            k = max(0.0, 1 - ymin / 140.0)
            if k <= 0:
                continue
            g = v.copy()
            g[:, 1] = 0
            # envolvente 2D de la huella en el suelo
            sx, sy, sz = cam.project(g)
            if (sz <= 1.5).any():
                continue
            pts = np.stack([sx / q, sy / q], 1)
            hull = _hull(pts)
            if len(hull) >= 3:
                sd.polygon([tuple(p) for p in hull], fill=int(200 * k))
        simg = simg.filter(ImageFilter.GaussianBlur(5))
        sh = np.asarray(simg.resize((W, H), Image.BILINEAR), np.float32) / 255.0
    return img, sh


def _order(objs, cam):
    """Orden de dibujo exacto para cajas que no se cortan: si un plano separa dos objetos,
    el que está del lado de la cámara va delante. Si no hay plano, decide la profundidad."""
    import heapq
    items, mins, maxs = [], [], []
    for o in objs:
        it = o.items(cam)
        if not it:
            continue
        a, b = o.aabb()
        items.append(it[0])
        mins.append(a)
        maxs.append(b)
    n = len(items)
    if n == 0:
        return []
    mins = np.array(mins, np.float32)
    maxs = np.array(maxs, np.float32)
    depth = np.array([it[0] for it in items], np.float32)
    # rectángulos en pantalla (proyección de las 8 esquinas)
    corners = np.stack([np.where(np.array([(i >> k) & 1 for k in range(3)], bool), maxs, mins) for i in range(8)], 1)
    sx, sy, sz = cam.project(corners.reshape(-1, 3))
    sx, sy = sx.reshape(n, 8), sy.reshape(n, 8)
    x0, x1, y0, y1 = sx.min(1), sx.max(1), sy.min(1), sy.max(1)
    ov = (x0[:, None] < x1[None, :]) & (x0[None, :] < x1[:, None]) & (y0[:, None] < y1[None, :]) & (y0[None, :] < y1[:, None])
    np.fill_diagonal(ov, False)
    eps = 0.05
    decided = np.zeros((n, n), bool)
    front = np.zeros((n, n), bool)  # front[i, j]: i va delante de j
    cp = cam.pos
    for k in range(3):
        below = maxs[:, None, k] <= mins[None, :, k] + eps  # i por debajo de j en el eje k
        s_ = (maxs[:, None, k] + mins[None, :, k]) / 2
        m = below & ~decided
        front[m] = (cp[k] < s_)[m]
        decided |= m
        above = maxs[None, :, k] <= mins[:, None, k] + eps  # j por debajo de i
        s2 = (maxs[None, :, k] + mins[:, None, k]) / 2
        m = above & ~decided
        front[m] = (cp[k] > s2)[m]
        decided |= m
    m = ~decided
    front[m] = (depth[:, None] < depth[None, :])[m]
    # grafo: arista j -> i si i va delante de j (se dibuja j antes)
    ii, jj = np.nonzero(np.triu(ov, 1))
    indeg = np.zeros(n, int)
    adj = [set() for _ in range(n)]
    for i, j in zip(ii.tolist(), jj.tolist()):
        if front[i, j]:
            adj[j].add(i)
            indeg[i] += 1
        else:
            adj[i].add(j)
            indeg[j] += 1
    hulls = {}

    def hull(i):
        if i not in hulls:
            hulls[i] = np.array(_hull(np.stack([sx[i], sy[i]], 1)), np.float32)
        return hulls[i]

    def refine():
        """Quita aristas entre objetos cuyas siluetas reales no se solapan en pantalla."""
        changed = False
        pend = np.nonzero(~queued)[0].tolist()
        ps = set(pend)
        for u in pend:
            for v in list(adj[u]):
                if v in ps and not _poly_overlap(hull(u), hull(v)):
                    adj[u].discard(v)
                    indeg[v] -= 1
                    changed = True
        return changed
    heap = [(-float(depth[i]), i) for i in range(n) if indeg[i] == 0]
    heapq.heapify(heap)
    out, done = [], np.zeros(n, bool)
    queued = np.zeros(n, bool)
    for _, i in heap:
        queued[i] = True
    while len(out) < n:
        if not heap and refine():
            for i in np.nonzero((~queued) & (indeg <= 0))[0].tolist():
                queued[i] = True
                heapq.heappush(heap, (-float(depth[i]), i))
        if not heap:
            # ciclo: se rompe con el objeto pendiente que tenga menos dependencias sin resolver
            # (y, a igualdad, el más lejano)
            rest = np.nonzero(~queued)[0]
            key = indeg[rest] * 1e6 - depth[rest]
            i = int(rest[np.argmin(key)])
            queued[i] = True
            heapq.heappush(heap, (-float(depth[i]), i))
        _, i = heapq.heappop(heap)
        done[i] = True
        out.append(items[i][1])
        for j in adj[i]:
            indeg[j] -= 1
            if indeg[j] == 0 and not queued[j]:
                queued[j] = True
                heapq.heappush(heap, (-float(depth[j]), j))
    return out


def _poly_overlap(P, Q):
    """Prueba de ejes separadores entre dos polígonos convexos (con un pequeño margen)."""
    if len(P) < 3 or len(Q) < 3:
        return True
    for poly in (P, Q):
        e = np.roll(poly, -1, 0) - poly
        axes = np.stack([-e[:, 1], e[:, 0]], 1)
        pa = P @ axes.T
        qa = Q @ axes.T
        if np.any((pa.max(0) <= qa.min(0) + 0.5) | (qa.max(0) <= pa.min(0) + 0.5)):
            return False
    return True


def _hull(pts):
    pts = sorted(set(map(tuple, np.round(pts, 2).tolist())))
    if len(pts) < 3:
        return pts

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def floor_grid(cam, W, H, step=40, extent=480, color=(255, 255, 255), alpha=50):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i in range(-extent, extent + 1, step):
        for P in (np.array([[i, 0, -extent], [i, 0, extent]], np.float32),
                  np.array([[-extent, 0, i], [extent, 0, i]], np.float32)):
            # recorta el tramo detrás de la cámara
            ts = np.linspace(0, 1, 24)
            pts = P[0] + (P[1] - P[0]) * ts[:, None]
            sx, sy, sz = cam.project(pts)
            _, _, zc = cam.cam(pts)
            seg = []
            for k in range(len(ts)):
                if zc[k] > 20:
                    fade = max(0.0, 1 - zc[k] / 1400)
                    seg.append((sx[k], sy[k], fade))
            for k in range(len(seg) - 1):
                a = int(alpha * seg[k][2])
                d.line([seg[k][:2], seg[k + 1][:2]], fill=color + (a,), width=2)
    return img

#!/usr/bin/env python3
"""Genera el vídeo "HOW TO BUILD: Una cama".

Dibuja cada escena con Pillow, sintetiza la narración con espeak-ng
y monta todo con ffmpeg.

Uso:  python3 make_video.py [carpeta_de_trabajo] [salida.mp4]
Requisitos: python3 + Pillow, espeak-ng, ffmpeg.
"""
import math
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
WORK = sys.argv[1] if len(sys.argv) > 1 else "build"
OUT = sys.argv[2] if len(sys.argv) > 2 else "how-to-build-una-cama.mp4"
# Voz neuronal Piper (https://github.com/rhasspy/piper). Descarga la voz con:
#   curl -LO https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-es-mls_10246-low.tar.gz
# y apunta PIPER_MODEL al .onnx. Sin modelo, se usa espeak-ng.
PIPER_MODEL = os.environ.get("PIPER_MODEL", "voices/voice-es-mls_10246-low/es-mls_10246-low.onnx")
PIPER_LENGTH = "0.92"  # >1 más lento, <1 más rápido
ESPEAK = ["espeak-ng", "-v", "es", "-s", "148", "-p", "38"]
PAD = 0.6  # silencio tras cada frase (s)

# ---------- estilo ----------
BG = (24, 26, 31)
PANEL = (34, 37, 44)
INK = (236, 232, 222)
MUTED = (150, 150, 158)
ACCENT = (232, 156, 62)
WOOD = (196, 146, 94)
WOOD_D = (150, 104, 62)
STEEL = (160, 170, 182)
FOAM = (238, 214, 120)
VISCO = (130, 178, 214)
LATEX = (240, 232, 200)
FABRIC = (210, 205, 220)
RUBBER = (70, 70, 74)

FONT_DIR = "/usr/share/fonts/truetype/dejavu/"


def font(size, bold=False):
    name = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    return ImageFont.truetype(FONT_DIR + name, size)


F_TAG = font(30, True)
F_TITLE = font(72, True)
F_SUB = font(40)
F_BUL = font(40)
F_LBL = font(30)
F_LBL_B = font(30, True)
F_SMALL = font(26)


# ---------- utilidades de dibujo ----------
def base(title, part=None):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 12], fill=ACCENT)
    d.text((90, 60), "HOW TO BUILD", font=F_TAG, fill=ACCENT)
    if part:
        tw = d.textlength(part, font=F_TAG)
        d.text((W - 90 - tw, 60), part, font=F_TAG, fill=MUTED)
    if title:
        d.text((90, 110), title, font=F_TITLE, fill=INK)
    return img, d


def bullets(d, items, shown, x=90, y=270, width=760, size=F_BUL):
    for i, it in enumerate(items[:shown]):
        lines = wrap(d, it, size, width - 50)
        d.ellipse([x, y + 16, x + 16, y + 32], fill=ACCENT)
        for ln in lines:
            d.text((x + 40, y), ln, font=size, fill=INK)
            y += size.size + 12
        y += 26


def wrap(d, text, f, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= width:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def label(d, xy, text, f=F_LBL, fill=INK, anchor="mm"):
    d.text(xy, text, font=f, fill=fill, anchor=anchor)


def wood_rect(d, box, fill=WOOD):
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=fill, outline=WOOD_D, width=3)
    # vetas
    horiz = (x1 - x0) >= (y1 - y0)
    n = 4
    for i in range(1, n):
        if horiz:
            yy = y0 + (y1 - y0) * i / n
            d.line([x0 + 6, yy, x1 - 6, yy + 2], fill=WOOD_D, width=1)
        else:
            xx = x0 + (x1 - x0) * i / n
            d.line([xx, y0 + 6, xx + 2, y1 - 6], fill=WOOD_D, width=1)


def coil(d, cx, top, bottom, r, turns=5, fill=STEEL, width=5):
    pts = []
    steps = turns * 24
    for i in range(steps + 1):
        t = i / steps
        y = top + (bottom - top) * t
        x = cx + r * math.sin(t * turns * 2 * math.pi)
        pts.append((x, y))
    d.line(pts, fill=fill, width=width, joint="curve")


def bed_side(d, x, y, w, scale=1.0, layers=True):
    """Vista lateral de una cama completa."""
    s = scale
    leg_w = 40 * s
    # cabecero
    wood_rect(d, [x, y - 260 * s, x + leg_w, y + 120 * s])
    # piecero
    wood_rect(d, [x + w - leg_w, y - 60 * s, x + w, y + 120 * s])
    # larguero
    wood_rect(d, [x + leg_w, y + 10 * s, x + w - leg_w, y + 60 * s])
    # pata central
    wood_rect(d, [x + w / 2 - 12 * s, y + 60 * s, x + w / 2 + 12 * s, y + 120 * s], WOOD_D)
    # somier
    d.rectangle([x + leg_w, y - 6 * s, x + w - leg_w, y + 10 * s], fill=WOOD_D)
    if layers:
        top = y - 6 * s
        for h, c in [(70, STEEL), (22, FOAM), (26, VISCO), (16, FABRIC)]:
            d.rounded_rectangle([x + leg_w + 4, top - h * s, x + w - leg_w - 4, top],
                                radius=int(8 * s), fill=c, outline=BG, width=2)
            top -= h * s
        # almohada
        d.rounded_rectangle([x + leg_w + 20 * s, top - 34 * s, x + leg_w + 200 * s, top + 4],
                            radius=int(18 * s), fill=(245, 245, 245))


# ---------- escenas ----------
# Cada escena: (función_dibujo, [frases]). La frase i revela el paso i.
SCENES = []


def scene(*lines):
    def deco(fn):
        SCENES.append((fn, list(lines)))
        return fn
    return deco


@scene(
    "Pasamos un tercio de nuestra vida encima de ella. Pero, ¿de qué está hecha realmente una cama?",
    "Hoy vamos a construir una desde cero, pieza a pieza.",
)
def s_intro(step):
    img, d = base(None)
    d.text((90, 200), "HOW TO BUILD", font=font(110, True), fill=ACCENT)
    d.text((90, 330), "Una cama", font=font(150, True), fill=INK)
    if step >= 1:
        d.text((96, 520), "De qué está hecha, pieza a pieza", font=F_SUB, fill=MUTED)
    bed_side(d, 1000, 700, 780, 1.1)
    return img


@scene(
    "Una cama tiene tres partes principales.",
    "La estructura, el armazón que lo sostiene todo.",
    "La base o somier, la plataforma que reparte el peso.",
    "Y el colchón, la parte que toca tu cuerpo. Empecemos por abajo.",
)
def s_partes(step):
    img, d = base("Las tres partes")
    items = [("1", "Estructura", WOOD), ("2", "Base / somier", WOOD_D), ("3", "Colchón", VISCO)]
    for i, (n, t, c) in enumerate(items):
        if step >= i + 1:
            y = 300 + i * 200
            d.rounded_rectangle([90, y, 830, y + 150], radius=20, fill=PANEL)
            d.ellipse([120, y + 35, 200, y + 115], fill=c)
            label(d, (160, y + 75), n, font(44, True), BG)
            d.text((240, y + 48), t, font=font(50, True), fill=INK)
    bed_side(d, 1000, 680, 780, 1.1)
    hl = {1: (1000, 680, 1780, 800), 2: (1040, 650, 1740, 690), 3: (1040, 500, 1740, 650)}
    if step in hl:
        d.rounded_rectangle(hl[step], radius=12, outline=ACCENT, width=6)
    return img


@scene(
    "Parte uno: la estructura.",
    "Puede ser de madera maciza, como pino, haya o roble.",
    "De tablero aglomerado o MDF, más económico.",
    "O de acero tubular, muy resistente con poco peso.",
)
def s_materiales(step):
    img, d = base("Parte 1 · La estructura", "PARTE 1")
    sw = [("Madera maciza", "pino · haya · roble", WOOD), ("Aglomerado / MDF", "económico y estable", (180, 160, 130)),
          ("Acero tubular", "fuerte y ligero", STEEL)]
    for i, (t, sub, c) in enumerate(sw):
        if step >= i + 1:
            x = 90 + i * 590
            d.rounded_rectangle([x, 320, x + 540, 900], radius=24, fill=PANEL)
            if i == 0:
                wood_rect(d, [x + 60, 380, x + 480, 640])
            elif i == 1:
                d.rectangle([x + 60, 380, x + 480, 640], fill=c, outline=(140, 120, 90), width=3)
                for k in range(160):
                    px = x + 70 + (k * 37) % 400
                    py = 390 + (k * 53) % 240
                    d.ellipse([px, py, px + 5, py + 4], fill=(150, 125, 90))
            else:
                for k in range(3):
                    cy = 430 + k * 85
                    d.rounded_rectangle([x + 60, cy - 28, x + 480, cy + 28], radius=28, fill=c,
                                        outline=(110, 118, 128), width=3)
                    d.line([x + 80, cy - 12, x + 460, cy - 12], fill=(220, 226, 232), width=4)
            label(d, (x + 270, 720), t, font(42, True))
            label(d, (x + 270, 790), sub, F_LBL, MUTED)
    return img


@scene(
    "Primero se cortan las piezas: dos largueros laterales, un cabecero, un piecero y las patas.",
    "La madera se seca antes en hornos hasta un ocho a doce por ciento de humedad. Si no, se deformaría y la cama acabaría crujiendo.",
    "Después se lija, de grano grueso a fino, y se protege con barniz, laca o aceite.",
)
def s_piezas(step):
    img, d = base("Paso 1 · Cortar las piezas", "PARTE 1")
    bullets(d, ["Cortar largueros, cabecero, piecero y patas",
                "Secado en horno: 8–12 % de humedad",
                "Lijar y barnizar"], step + 1, width=820)
    wood_rect(d, [1000, 300, 1060, 760])
    label(d, (1030, 800), "Cabecero", F_SMALL, MUTED)
    wood_rect(d, [1110, 520, 1170, 760])
    label(d, (1140, 845), "Piecero", F_SMALL, MUTED)
    wood_rect(d, [1230, 330, 1830, 390])
    label(d, (1530, 420), "Larguero × 2", F_SMALL, MUTED)
    wood_rect(d, [1230, 470, 1830, 530])
    if step >= 1:
        d.rounded_rectangle([1240, 600, 1820, 760], radius=20, fill=PANEL)
        d.rectangle([1280, 640, 1440, 720], fill=(120, 60, 40))
        for k in range(4):
            d.line([1300 + k * 40, 630, 1310 + k * 40, 610], fill=(220, 120, 60), width=4)
        label(d, (1630, 680), "8–12 %", font(56, True), ACCENT)
    if step >= 2:
        for k in range(6):
            d.line([1000 + k * 18, 860, 1180 + k * 18, 860], fill=ACCENT, width=2)
        label(d, (1515, 900), "lija 80 → 120 → 180", F_LBL, ACCENT)
    return img


@scene(
    "El secreto de una cama que no se mueve está en las uniones.",
    "Los herrajes de gancho: una placa encaja en otra. Es rápido y desmontable.",
    "Los tornillos pasantes con tuerca de barril, muy firmes.",
    "Y la espiga y caja, la unión tradicional de carpintería, sin metal.",
)
def s_uniones(step):
    img, d = base("Paso 2 · Las uniones", "PARTE 1")
    bullets(d, ["Herraje de gancho", "Perno + tuerca de barril", "Espiga y caja"], step, y=300, width=700)
    # pata + larguero
    wood_rect(d, [1000, 280, 1120, 900])
    wood_rect(d, [1200, 520, 1840, 660])
    if step == 1 or step == 0:
        d.rectangle([1120, 500, 1150, 680], fill=STEEL, outline=(90, 95, 105), width=2)
        d.rectangle([1170, 500, 1200, 680], fill=STEEL, outline=(90, 95, 105), width=2)
        for k in range(3):
            d.polygon([(1150, 530 + k * 50), (1172, 545 + k * 50), (1150, 560 + k * 50)], fill=(200, 205, 212))
        if step == 1:
            label(d, (1500, 740), "gancho ↓", F_LBL_B, ACCENT)
    elif step == 2:
        d.rectangle([900, 578, 1420, 602], fill=STEEL)
        d.rectangle([880, 560, 905, 620], fill=(120, 128, 138))
        d.ellipse([1390, 560, 1450, 620], fill=(120, 128, 138), outline=INK, width=2)
        label(d, (1500, 740), "tuerca de barril", F_LBL_B, ACCENT)
    elif step == 3:
        d.rectangle([1120, 555, 1200, 625], fill=WOOD, outline=ACCENT, width=4)
        d.rectangle([1060, 555, 1120, 625], outline=ACCENT, width=4)
        label(d, (1500, 740), "espiga → caja", F_LBL_B, ACCENT)
    return img


@scene(
    "Por dentro de cada larguero se atornilla un listón de apoyo, donde descansará la base.",
    "En las camas de matrimonio se añade un travesaño central con pata, para que el centro no se hunda.",
    "Una cama doble bien hecha puede soportar más de doscientos cincuenta kilos de carga repartida.",
)
def s_apoyos(step):
    img, d = base("Paso 3 · Apoyos interiores", "PARTE 1")
    bullets(d, ["Listón de apoyo en cada larguero", "Viga central con patas", "Más de 250 kg de carga"], step + 1, width=760)
    # sección transversal
    x0, y0 = 1000, 420
    wood_rect(d, [x0, y0, x0 + 50, y0 + 220])
    wood_rect(d, [x0 + 790, y0, x0 + 840, y0 + 220])
    d.rectangle([x0 + 50, y0 + 150, x0 + 100, y0 + 200], fill=ACCENT if step == 0 else WOOD_D)
    d.rectangle([x0 + 740, y0 + 150, x0 + 790, y0 + 200], fill=ACCENT if step == 0 else WOOD_D)
    if step >= 1:
        d.rectangle([x0 + 395, y0 + 150, x0 + 445, y0 + 200], fill=ACCENT if step == 1 else WOOD_D)
        d.rectangle([x0 + 405, y0 + 200, x0 + 435, y0 + 380], fill=ACCENT if step == 1 else WOOD_D)
    d.line([x0 - 40, y0 + 380, x0 + 880, y0 + 380], fill=MUTED, width=3)
    label(d, (x0 + 420, y0 + 420), "sección transversal", F_SMALL, MUTED)
    if step >= 2:
        for k in range(5):
            ax = x0 + 120 + k * 150
            d.line([ax, 260, ax, 380], fill=ACCENT, width=6)
            d.polygon([(ax - 16, 375), (ax + 16, 375), (ax, 400)], fill=ACCENT)
        label(d, (x0 + 420, 230), "> 250 kg", font(48, True), ACCENT)
    return img


@scene(
    "Parte dos: la base. El colchón no se apoya directamente en la estructura. Necesita una base que lo sostenga, lo ventile y reparta el peso.",
    "La más común es el somier de láminas: un marco con láminas curvas de haya multicapa. La curva actúa como un muelle.",
    "Las láminas se sujetan con tacos de caucho que absorben el movimiento. Cuantas más láminas, más firme y uniforme será el apoyo.",
)
def s_somier(step):
    img, d = base("Parte 2 · El somier", "PARTE 2")
    bullets(d, ["Sostiene, ventila y reparte el peso", "Láminas curvas de haya multicapa", "Tacos de caucho · 14–28 láminas"], step + 1, width=760)
    # vista superior
    fx0, fy0, fx1, fy1 = 1000, 290, 1820, 900
    d.rectangle([fx0, fy0, fx1, fy1], outline=STEEL, width=14)
    d.line([(fx0 + fx1) / 2, fy0, (fx0 + fx1) / 2, fy1], fill=STEEL, width=10)
    n = 14
    for i in range(n):
        y = fy0 + 30 + i * (fy1 - fy0 - 60) / (n - 1)
        d.rounded_rectangle([fx0 + 30, y - 12, fx1 - 30, y + 12], radius=10, fill=WOOD, outline=WOOD_D, width=2)
        if step >= 2:
            for xx in (fx0 + 14, (fx0 + fx1) / 2, fx1 - 14):
                d.rectangle([xx - 18, y - 16, xx + 18, y + 16], fill=RUBBER)
    if step >= 1:
        # detalle lámina curva
        d.rounded_rectangle([1060, 930, 1760, 1050], radius=16, fill=PANEL)
        d.arc([1100, 960, 1720, 1100], 200, 340, fill=WOOD, width=14)
        label(d, (1410, 1030), "curva = muelle", F_SMALL, ACCENT)
    return img


@scene(
    "Parte tres: el colchón. Es un sándwich de capas, cada una con su función.",
    "El núcleo da el soporte. Las capas de confort deciden la sensación. Y la funda lo envuelve todo.",
)
def s_colchon(step):
    img, d = base("Parte 3 · El colchón", "PARTE 3")
    layers = [("Funda acolchada", FABRIC, 50), ("Viscoelástica", VISCO, 70), ("Espuma HR", FOAM, 60),
              ("Fieltro aislante", (120, 110, 100), 24), ("Núcleo de muelles", STEEL, 190)]
    y = 300
    for i, (t, c, h) in enumerate(layers):
        x_off = 0 if step == 0 else i * 6
        d.rounded_rectangle([200 + x_off, y, 1300 + x_off, y + h], radius=10, fill=c, outline=BG, width=3)
        if t.startswith("Núcleo"):
            for k in range(11):
                coil(d, 260 + k * 100 + x_off, y + 20, y + h - 20, 28, 5, (90, 98, 110), 5)
        if step >= 1:
            label(d, (1360 + x_off, y + h / 2), t, F_LBL_B, INK, "lm")
        y += h + (8 if step == 0 else 22)
    if step >= 1:
        label(d, (750, 950), "soporte · confort · protección", F_SUB, ACCENT)
    return img


@scene(
    "Empezamos por el núcleo. Una máquina enrolla alambre de acero al carbono en espirales, y luego se templan con calor para que recuperen su forma.",
    "Los muelles Bonell están unidos entre sí con alambre. Funcionan como un bloque y son económicos.",
    "Los muelles ensacados van cada uno en su propia bolsa de tela. Trabajan de forma independiente: si tu pareja se mueve, tú no lo notas.",
)
def s_muelles(step):
    img, d = base("Paso 4 · Núcleo de muelles", "PARTE 3")
    if step == 0:
        bullets(d, ["Alambre de acero al carbono", "Enrollado en espiral", "Templado al calor"], 3, width=760)
        d.ellipse([1100, 330, 1360, 590], outline=STEEL, width=26)
        d.ellipse([1185, 415, 1275, 505], fill=(90, 98, 110))
        d.line([1360, 460, 1500, 460], fill=STEEL, width=10)
        for k in range(3):
            coil(d, 1560 + k * 100, 360, 600, 34, 6)
        label(d, (1460, 700), "bobina  →  muelle", F_LBL_B, ACCENT)
        for k in range(5):
            d.line([1520 + k * 40, 820, 1530 + k * 40, 760], fill=(230, 110, 50), width=6)
        label(d, (1600, 870), "templado", F_SMALL, MUTED)
        return img
    # comparación
    for i, (t, sub) in enumerate([("Bonell", "unidos · trabajan en bloque"), ("Ensacados", "independientes · sin transmitir movimiento")]):
        x = 90 + i * 900
        active = step == i + 1
        d.rounded_rectangle([x, 300, x + 840, 940], radius=24, fill=PANEL, outline=ACCENT if active else PANEL, width=5)
        label(d, (x + 420, 360), t, font(50, True), ACCENT if active else INK)
        label(d, (x + 420, 880), sub, F_SMALL, MUTED)
        for k in range(6):
            cx = x + 120 + k * 120
            if i == 0:
                coil(d, cx, 470, 760, 40, 5)
                if k < 5:
                    d.line([cx, 470, cx + 120, 470], fill=STEEL, width=4)
                    d.line([cx, 760, cx + 120, 760], fill=STEEL, width=4)
            else:
                d.rounded_rectangle([cx - 56, 450, cx + 56, 790], radius=30, fill=(200, 196, 186), outline=(150, 146, 140), width=3)
                coil(d, cx, 480, 760, 34, 5, (110, 118, 128))
    return img


@scene(
    "Otra opción es la espuma. Se mezclan dos líquidos, poliol e isocianato. Reaccionan, generan gas y la mezcla sube formando un gran bloque de espuma de poliuretano.",
    "Después se deja curar y se corta en planchas. Se mide por densidad: cuanta más densidad, más duradera.",
    "Y el látex natural sale de la savia del árbol del caucho. Se bate, se vierte en moldes con agujeros y se vulcaniza al calor.",
)
def s_espuma(step):
    img, d = base("Paso 4 · Núcleo de espuma o látex", "PARTE 3")
    bullets(d, ["Poliol + isocianato → espuma", "Curado y corte · densidad kg/m³", "Látex: savia del árbol del caucho"], step + 1, width=760)
    if step <= 1:
        # bloque subiendo
        d.rectangle([1050, 820, 1800, 840], fill=MUTED)
        h = 220 if step == 0 else 420
        d.rounded_rectangle([1080, 820 - h, 1770, 820], radius=40 if step == 0 else 6, fill=FOAM)
        for k in range(120):
            px = 1100 + (k * 61) % 650
            py = 820 - h + 20 + (k * 37) % max(h - 40, 1)
            d.ellipse([px, py, px + 7, py + 7], fill=(215, 190, 95))
        if step == 0:
            for k in range(4):
                ax = 1180 + k * 160
                d.line([ax, 540, ax, 470], fill=ACCENT, width=5)
                d.polygon([(ax - 14, 480), (ax + 14, 480), (ax, 455)], fill=ACCENT)
        else:
            for k in range(1, 4):
                y = 820 - k * 105
                d.line([1060, y, 1790, y], fill=ACCENT, width=4)
            label(d, (1425, 900), "corte en planchas", F_LBL_B, ACCENT)
    else:
        # árbol del caucho + bloque de látex
        d.rectangle([1040, 400, 1090, 860], fill=(110, 80, 55))
        d.ellipse([920, 250, 1210, 470], fill=(70, 120, 70))
        d.line([1040, 640, 1090, 680], fill=LATEX, width=6)
        d.polygon([(1100, 700), (1150, 700), (1140, 760), (1110, 760)], fill=(180, 180, 180))
        d.rounded_rectangle([1260, 520, 1820, 760], radius=14, fill=LATEX)
        for r in range(3):
            for c in range(9):
                cx, cy = 1300 + c * 60, 570 + r * 70
                d.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=(205, 196, 160))
        label(d, (1540, 820), "látex vulcanizado", F_LBL_B, ACCENT)
    return img


@scene(
    "Sobre el núcleo van las capas de confort.",
    "La viscoelástica se ablanda con el calor del cuerpo y se adapta a su forma. Se desarrolló en los años sesenta en un proyecto relacionado con la NASA.",
    "La espuma de gel lleva partículas que hacen que dé menos calor. Encima pueden ir fibras como algodón, lana o poliéster.",
    "Y entre los muelles y las espumas se pone un fieltro aislante, para que los muelles no se noten.",
)
def s_confort(step):
    img, d = base("Paso 5 · Capas de confort", "PARTE 3")
    bullets(d, ["Viscoelástica: se adapta al cuerpo", "Gel y fibras: frescor y mullido", "Fieltro: aísla los muelles"], step, y=300, width=760)
    stack = [(STEEL, 180, "núcleo"), ((120, 110, 100), 26, "fieltro"), (FOAM, 60, "espuma HR"),
             (VISCO, 80, "viscoelástica"), ((180, 220, 210), 40, "gel / fibras")]
    y = 900
    for i, (c, h, t) in enumerate(stack):
        visible = {0: [0, 2], 1: [0, 2, 3], 2: [0, 2, 3, 4], 3: [0, 1, 2, 3, 4]}[step]
        if i in visible:
            hi = (step == 1 and i == 3) or (step == 2 and i == 4) or (step == 3 and i == 1)
            d.rounded_rectangle([1000, y - h, 1800, y], radius=10, fill=c, outline=ACCENT if hi else BG, width=6 if hi else 2)
            if i == 0:
                for k in range(7):
                    coil(d, 1060 + k * 113, y - h + 20, y - 20, 30, 5, (90, 98, 110))
            label(d, (1400, y - h / 2), t, F_LBL_B, BG)
            y -= h + 6
    if step >= 1:
        # mano presionando la viscoelástica
        d.ellipse([1180, y - 70, 1300, y + 10], fill=(235, 190, 160))
    return img


@scene(
    "Ahora la funda. Una máquina acolchadora cose la tela exterior junto a una fina capa de espuma, creando ese relieve típico de rombos.",
    "Muchas fundas llevan tratamiento antiácaros, una barrera ignífuga, y cremallera para poder lavarlas.",
    "Por último, una máquina recorre el borde y cose el ribete que une la tapa superior, la inferior y la banda lateral.",
)
def s_funda(step):
    img, d = base("Paso 6 · La funda", "PARTE 3")
    bullets(d, ["Tela acolchada en rombos", "Antiácaros · ignífuga · cremallera", "Cierre con cinta de ribete"], step + 1, width=760)
    x0, y0, x1, y1 = 1000, 300, 1820, 760
    quilt = Image.new("RGB", (x1 - x0, y1 - y0), FABRIC)
    q = ImageDraw.Draw(quilt)
    qh = y1 - y0
    for k in range(-12, 20):
        q.line([k * 70, 0, k * 70 + qh, qh], fill=(180, 174, 196), width=3)
        q.line([k * 70, qh, k * 70 + qh, 0], fill=(180, 174, 196), width=3)
    mask = Image.new("L", quilt.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, x1 - x0 - 1, qh - 1], radius=26, fill=255)
    img.paste(quilt, (x0, y0), mask)
    d.rounded_rectangle([x0, y0, x1, y1], radius=26, outline=ACCENT if step == 2 else (150, 146, 170), width=14 if step == 2 else 6)
    if step >= 1:
        d.line([x0 + 60, y1 + 60, x1 - 60, y1 + 60], fill=STEEL, width=10)
        for k in range(40):
            xx = x0 + 70 + k * 18
            d.line([xx, y1 + 52, xx, y1 + 68], fill=(110, 118, 128), width=4)
        d.rounded_rectangle([x1 - 110, y1 + 40, x1 - 60, y1 + 80], radius=8, fill=ACCENT)
        label(d, ((x0 + x1) / 2, y1 + 120), "cremallera", F_SMALL, MUTED)
    return img


@scene(
    "Antes de salir de fábrica, algunos colchones pasan pruebas de durabilidad: un rodillo de más de cien kilos los recorre miles de veces, simulando años de uso.",
    "Y muchos colchones de espuma se comprimen al vacío y se enrollan para enviarlos en una caja. Al abrirlos, recuperan su forma en unas horas.",
)
def s_calidad(step):
    img, d = base("Paso 7 · Control de calidad", "PARTE 3")
    if step == 0:
        d.rounded_rectangle([200, 640, 1720, 800], radius=20, fill=FABRIC)
        d.ellipse([760, 420, 1000, 660], fill=STEEL, outline=(90, 98, 110), width=8)
        d.ellipse([850, 510, 910, 570], fill=(90, 98, 110))
        d.line([880, 540, 880, 330], fill=STEEL, width=14)
        d.line([500, 330, 1260, 330], fill=STEEL, width=14)
        for k in (-1, 1):
            d.line([880 + k * 300, 540, 880 + k * 420, 540], fill=ACCENT, width=6)
        label(d, (880, 880), "> 100 kg  ×  miles de pasadas", F_SUB, ACCENT)
    else:
        d.rounded_rectangle([200, 420, 820, 560], radius=20, fill=FOAM)
        label(d, (510, 620), "colchón", F_LBL, MUTED)
        d.line([880, 490, 1020, 490], fill=ACCENT, width=8)
        d.polygon([(1020, 470), (1050, 490), (1020, 510)], fill=ACCENT)
        for k in range(5, 0, -1):
            r = k * 32
            d.ellipse([1240 - r, 490 - r, 1240 + r, 490 + r], outline=FOAM if k % 2 else (215, 190, 95), width=16)
        label(d, (1240, 700), "al vacío y enrollado", F_LBL, MUTED)
        d.polygon([(1460, 380), (1800, 380), (1800, 620), (1460, 620)], fill=(170, 130, 90))
        d.line([1460, 500, 1800, 500], fill=(140, 104, 70), width=6)
        label(d, (1630, 700), "en una caja", F_LBL, MUTED)
    return img


@scene(
    "Montaje final. Enganchamos los largueros al cabecero y al piecero.",
    "Colocamos el travesaño central y apoyamos el somier sobre los listones.",
    "Ponemos el colchón encima, un protector, sábanas, nórdico y almohadas.",
)
def s_montaje(step):
    img, d = base("Montaje final")
    bullets(d, ["Largueros + cabecero + piecero", "Viga central y somier", "Colchón y ropa de cama"], step + 1, y=300, width=700)
    x, y, w, s = 960, 700, 860, 1.2
    leg = 40 * s
    wood_rect(d, [x, y - 260 * s, x + leg, y + 120 * s])
    wood_rect(d, [x + w - leg, y - 60 * s, x + w, y + 120 * s])
    wood_rect(d, [x + leg, y + 10 * s, x + w - leg, y + 60 * s])
    if step >= 1:
        wood_rect(d, [x + w / 2 - 12 * s, y + 60 * s, x + w / 2 + 12 * s, y + 120 * s], WOOD_D)
        d.rectangle([x + leg, y - 6 * s, x + w - leg, y + 10 * s], fill=WOOD_D)
    if step >= 2:
        d.rounded_rectangle([x + leg + 4, y - 140 * s, x + w - leg - 4, y - 6 * s], radius=14, fill=FABRIC)
        d.rounded_rectangle([x + leg + 200, y - 170 * s, x + w - leg - 4, y - 110 * s], radius=20, fill=(120, 150, 190))
        d.rounded_rectangle([x + leg + 20, y - 190 * s, x + leg + 230, y - 130 * s], radius=26, fill=(248, 248, 248))
    return img


@scene(
    "Madera de un bosque, acero de una fundición, espuma de una reacción química, látex de un árbol tropical y tela de un telar.",
    "Todo eso, en el lugar donde descansas cada noche.",
)
def s_resumen(step):
    img, d = base("¿De qué está hecha una cama?")
    rows = [("Estructura", "madera maciza · MDF · acero · herrajes", WOOD),
            ("Base / somier", "láminas de haya · acero · caucho", WOOD_D),
            ("Núcleo", "muelles de acero · espuma HR · látex", STEEL),
            ("Confort", "viscoelástica · gel · fibras · fieltro", VISCO),
            ("Funda", "tejido acolchado · barrera ignífuga", FABRIC)]
    for i, (a, b, c) in enumerate(rows):
        y = 290 + i * 130
        d.rounded_rectangle([90, y, 1830, y + 110], radius=16, fill=PANEL)
        d.rectangle([90, y, 110, y + 110], fill=c)
        d.text((150, y + 30), a, font=font(42, True), fill=INK)
        d.text((620, y + 34), b, font=F_SUB, fill=MUTED)
    if step >= 1:
        label(d, (W / 2, 990), "HOW TO BUILD · Una cama", font(44, True), ACCENT)
    return img


# ---------- render ----------
def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def tts(text, wav):
    if os.path.exists(PIPER_MODEL):
        raw = wav + ".raw.wav"
        subprocess.run(["piper", "-m", PIPER_MODEL, "--length-scale", PIPER_LENGTH, "-f", raw],
                       input=text.encode(), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        # acorta las pausas largas que a veces mete el modelo
        run(["ffmpeg", "-y", "-i", raw, "-af",
             "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.5"
             ":stop_silence=0.35:stop_threshold=-45dB", wav])
    else:
        print("aviso: no se encontró", PIPER_MODEL, "- usando espeak-ng", flush=True)
        run(ESPEAK + ["-w", wav, text])


def duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", path])
    return float(out)


def main():
    os.makedirs(WORK, exist_ok=True)
    clips = []
    idx = 0
    for si, (fn, lines) in enumerate(SCENES):
        for step, text in enumerate(lines):
            png = os.path.join(WORK, f"{idx:03d}.png")
            wav = os.path.join(WORK, f"{idx:03d}.wav")
            mp4 = os.path.join(WORK, f"{idx:03d}.mp4")
            fn(step).save(png)
            tts(text, wav)
            dur = duration(wav) + PAD + (0.4 if step == 0 else 0)
            delay = 400 if step == 0 else 0
            vf = "format=yuv420p"
            if step == 0:
                vf = "fade=t=in:st=0:d=0.4," + vf
            if step == len(lines) - 1:
                vf = f"fade=t=out:st={dur - 0.35:.2f}:d=0.35," + vf
            run(["ffmpeg", "-y", "-loop", "1", "-framerate", "30", "-i", png, "-i", wav,
                 "-filter_complex",
                 f"[1:a]adelay={delay}|{delay},apad,aresample=48000,aformat=channel_layouts=stereo[a];[0:v]{vf}[v]",
                 "-map", "[v]", "-map", "[a]", "-t", f"{dur:.2f}",
                 "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-tune", "stillimage",
                 "-c:a", "aac", "-b:a", "160k", mp4])
            clips.append(mp4)
            idx += 1
            print(f"escena {si + 1}/{len(SCENES)} paso {step + 1}/{len(lines)}  {dur:.1f}s", flush=True)
    lst = os.path.join(WORK, "list.txt")
    with open(lst, "w") as f:
        for c in clips:
            f.write(f"file '{os.path.abspath(c)}'\n")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", OUT])
    print("listo:", OUT, f"{duration(OUT):.1f}s")


if __name__ == "__main__":
    main()

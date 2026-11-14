#!/usr/bin/env python3
"""Genera el short vertical "What if the Sun disappeared?".

Dibuja cada plano con Pillow, sintetiza la narración con espeak-ng
y monta el vídeo 1080x1920 con ffmpeg (zoom lento + subtítulos grandes).

Uso:  python3 make_short.py [carpeta_de_trabajo] [salida.mp4]
"""
import math
import os
import random
import subprocess
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1920
WORK = sys.argv[1] if len(sys.argv) > 1 else "build"
OUT = sys.argv[2] if len(sys.argv) > 2 else "what-if-the-sun-disappeared.mp4"
# Voz neuronal Piper (https://github.com/rhasspy/piper). Descarga la voz con:
#   curl -LO https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-lessac-medium.tar.gz
# y apunta PIPER_MODEL al .onnx. Sin modelo, se usa espeak-ng.
PIPER_MODEL = os.environ.get("PIPER_MODEL", "voices/voice-en-us-lessac-medium/en-us-lessac-medium.onnx")
PIPER_LENGTH = "0.92"  # >1 más lento, <1 más rápido
ESPEAK = ["espeak-ng", "-v", "en-us", "-s", "165", "-p", "35"]
PAD = 0.25
FPS = 30

FD = "/usr/share/fonts/truetype/dejavu/"
F_CAP = ImageFont.truetype(FD + "DejaVuSans-Bold.ttf", 86)
F_BIG = ImageFont.truetype(FD + "DejaVuSans-Bold.ttf", 150)
F_MED = ImageFont.truetype(FD + "DejaVuSans-Bold.ttf", 60)
F_SM = ImageFont.truetype(FD + "DejaVuSans.ttf", 44)

SPACE = (6, 8, 18)
SUN = (255, 196, 70)
EARTH_SEA = (40, 110, 200)
EARTH_LAND = (70, 160, 90)
ICE = (215, 235, 250)
YEL = (255, 214, 0)
WHITE = (250, 250, 250)


# ---------- piezas de dibujo ----------
def canvas(color=SPACE, stars=True, seed=1):
    img = Image.new("RGB", (W, H), color)
    if stars:
        d = ImageDraw.Draw(img)
        rnd = random.Random(seed)
        for _ in range(260):
            x, y = rnd.randrange(W), rnd.randrange(H)
            r = rnd.choice([1, 1, 1, 2, 2, 3])
            b = rnd.randrange(120, 255)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(b, b, b))
    return img


def glow(img, cx, cy, r, color, strength=2.2):
    layer = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(layer)
    R = int(r * strength)
    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=tuple(int(c * 0.55) for c in color))
    layer = layer.filter(ImageFilter.GaussianBlur(r * 0.8))
    return ImageChops.add(img, layer)


def sun(img, cx, cy, r):
    img = glow(img, cx, cy, r, SUN)
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SUN)
    d.ellipse([cx - r * 0.75, cy - r * 0.75, cx + r * 0.6, cy + r * 0.6], fill=(255, 225, 120))
    return img


def earth(img, cx, cy, r, frozen=0.0, dark=0.0, seed=3):
    """frozen: 0..1 cuánto hielo; dark: 0..1 cuánto se oscurece."""
    pl = Image.new("RGB", (2 * r, 2 * r), EARTH_SEA)
    d = ImageDraw.Draw(pl)
    rnd = random.Random(seed)
    for _ in range(9):
        x, y = rnd.randrange(2 * r), rnd.randrange(2 * r)
        s = rnd.randrange(r // 4, r // 2)
        d.ellipse([x - s, y - s * 0.7, x + s, y + s * 0.7], fill=EARTH_LAND)
    cap = int(r * (0.18 + 0.82 * frozen))
    d.ellipse([-r, -cap * 1.2, 3 * r, cap], fill=ICE)
    d.ellipse([-r, 2 * r - cap, 3 * r, 2 * r + cap * 1.2], fill=ICE)
    if frozen > 0.6:
        pl = Image.blend(pl, Image.new("RGB", pl.size, ICE), (frozen - 0.6) * 1.8)
    # sombreado (lado nocturno)
    sh = Image.new("L", pl.size, 0)
    ImageDraw.Draw(sh).ellipse([r * 0.55, -r * 0.2, 3.2 * r, 2.2 * r], fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(r * 0.25))
    pl = Image.composite(Image.new("RGB", pl.size, (0, 0, 0)), pl, sh)
    if dark:
        pl = Image.blend(pl, Image.new("RGB", pl.size, (8, 10, 20)), dark)
    mask = Image.new("L", pl.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, 2 * r - 1, 2 * r - 1], fill=255)
    img.paste(pl, (cx - r, cy - r), mask)
    d = ImageDraw.Draw(img)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(120, 170, 255) if not dark else (40, 50, 80), width=4)
    return img


def text_c(d, y, text, f, fill=WHITE, stroke=8):
    d.text((W / 2, y), text, font=f, fill=fill, anchor="mm", stroke_width=stroke, stroke_fill=(0, 0, 0))


def caption(img, words):
    """Subtítulo estilo short: grande, centrado, con la palabra clave en amarillo."""
    d = ImageDraw.Draw(img)
    lines, cur = [], ""
    for w in words.split():
        t = (cur + " " + w).strip()
        if d.textlength(t.replace("*", ""), font=F_CAP) < W - 140:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    y = 1430 - (len(lines) - 1) * 55
    for ln in lines:
        parts = ln.split()
        total = d.textlength(ln.replace("*", ""), font=F_CAP)
        x = (W - total) / 2
        for i, p in enumerate(parts):
            hl = p.startswith("*")
            p = p.strip("*")
            d.text((x, y), p, font=F_CAP, fill=YEL if hl else WHITE, anchor="lm",
                   stroke_width=9, stroke_fill=(0, 0, 0))
            x += d.textlength(p + " ", font=F_CAP)
        y += 110
    return img


# ---------- planos ----------
def p_hook():
    img = canvas()
    img = sun(img, 540, 620, 260)
    img = earth(img, 830, 1080, 90)
    d = ImageDraw.Draw(img)
    text_c(d, 200, "WHAT IF", F_MED, YEL)
    return img


def p_gone():
    img = canvas(seed=2)
    d = ImageDraw.Draw(img)
    d.ellipse([280, 360, 800, 880], outline=(60, 60, 80), width=6)
    for k in range(12):
        a = k * math.pi / 6
        d.line([540 + 300 * math.cos(a), 620 + 300 * math.sin(a),
                540 + 380 * math.cos(a), 620 + 380 * math.sin(a)], fill=(90, 90, 110), width=6)
    img = earth(img, 830, 1080, 90)
    return img


def p_clock():
    img = canvas(seed=4)
    img = sun(img, 540, 620, 180)
    img = earth(img, 540, 1060, 110)
    d = ImageDraw.Draw(img)
    for k in range(8):
        y = 820 + k * 18
        d.line([540, y, 540, y + 10], fill=SUN, width=6)
    text_c(d, 220, "8:20", F_BIG, YEL)
    text_c(d, 330, "minutes", F_SM, WHITE, 4)
    return img


def p_party():
    img = canvas(color=(30, 90, 170), stars=False)
    img = sun(img, 760, 380, 130)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 1000, W, H], fill=(70, 150, 80))
    for k in range(5):
        x = 140 + k * 200
        d.ellipse([x - 30, 820, x + 30, 880], fill=(30, 30, 30))
        d.line([x, 880, x, 990], fill=(30, 30, 30), width=14)
        d.line([x - 50, 990, x, 990], fill=(30, 30, 30), width=1)
        d.line([x, 990, x - 30, 1060], fill=(30, 30, 30), width=12)
        d.line([x, 990, x + 30, 1060], fill=(30, 30, 30), width=12)
        d.line([x, 910, x - 60, 950], fill=(30, 30, 30), width=10)
        d.line([x, 910, x + 60, 950], fill=(30, 30, 30), width=10)
    return img


def p_dark():
    img = canvas(color=(4, 5, 12), seed=5)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 1000, W, H], fill=(10, 14, 12))
    # luna apagándose
    d.ellipse([700, 300, 860, 460], fill=(40, 42, 50))
    text_c(d, 220, "LIGHTS OUT", F_MED, WHITE)
    return img


def p_fly():
    img = canvas(seed=6)
    d = ImageDraw.Draw(img)
    # órbita antigua
    d.ellipse([140, 300, 940, 1100], outline=(80, 80, 110), width=4)
    d.ellipse([520, 680, 560, 720], outline=(80, 80, 110), width=3)
    # trayectoria recta
    for k in range(12):
        y0 = 1100 - k * 60
        d.line([940 - k * 6, y0, 940 - k * 6, y0 - 30], fill=YEL, width=8)
    d.polygon([(890, 380), (950, 380), (920, 310)], fill=YEL)
    img = earth(img, 940, 1100, 80, dark=0.5)
    d = ImageDraw.Draw(img)
    text_c(d, 200, "107,000 km/h", F_MED, YEL)
    return img


def thermo(img, value_frac, label):
    d = ImageDraw.Draw(img)
    x, y0, y1 = 540, 300, 1150
    d.rounded_rectangle([x - 60, y0, x + 60, y1], radius=60, fill=(40, 44, 60), outline=WHITE, width=8)
    d.ellipse([x - 110, y1 - 60, x + 110, y1 + 160], fill=(80, 170, 255), outline=WHITE, width=8)
    top = y1 - (y1 - y0 - 60) * value_frac
    d.rounded_rectangle([x - 34, top, x + 34, y1 + 40], radius=34, fill=(80, 170, 255))
    for k in range(9):
        yy = y0 + 60 + k * 85
        d.line([x + 60, yy, x + 100, yy], fill=WHITE, width=5)
    text_c(d, 200, label, F_BIG, (120, 200, 255))
    return img


def p_week():
    img = canvas(color=(10, 16, 34), seed=7)
    return thermo(img, 0.55, "-18°C")


def p_plants():
    img = canvas(color=(8, 10, 16), stars=False)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 1100, W, H], fill=(40, 34, 28))
    for k in range(4):
        x = 170 + k * 250
        d.line([x, 1100, x, 760], fill=(90, 80, 50), width=12)
        for j in range(4):
            yy = 800 + j * 70
            side = -1 if j % 2 else 1
            d.ellipse([min(x + side * 10, x + side * 110), yy, max(x + side * 10, x + side * 110), yy + 40], fill=(110, 95, 50))
        d.line([x - 30, 1100, x + 30, 1100], fill=(60, 50, 30), width=6)
    text_c(d, 220, "NO PHOTOSYNTHESIS", F_MED, (180, 160, 90))
    return img


def p_year():
    img = canvas(color=(6, 10, 26), seed=8)
    return thermo(img, 0.2, "-73°C")


def p_ocean():
    img = canvas(color=(5, 8, 20), seed=9)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 520, W, 640], fill=ICE)
    for k in range(10):
        x = k * 120
        d.line([x, 520, x + 70, 640], fill=(170, 200, 225), width=4)
    for k in range(12):
        c = (12 + k * 2, 30 + k * 3, 70 + k * 4)
        d.rectangle([0, 640 + k * 100, W, 740 + k * 100], fill=c)
    text_c(d, 360, "ICE ON TOP", F_MED, ICE)
    text_c(d, 900, "liquid below", F_SM, (150, 200, 255), 4)
    return img


def p_vent():
    img = canvas(color=(10, 20, 45), stars=False)
    d = ImageDraw.Draw(img)
    d.polygon([(380, H), (480, 1050), (600, 1050), (700, H)], fill=(50, 40, 38))
    for k in range(9):
        r = 60 + k * 26
        y = 980 - k * 70
        d.ellipse([540 - r, y - r * 0.5, 540 + r, y + r * 0.5], fill=(70 + k * 6, 66 + k * 6, 70 + k * 6))
    d.ellipse([470, 1010, 610, 1080], fill=(255, 120, 40))
    for k in range(8):
        x = 300 + (k * 97) % 500
        y = 1300 + (k * 53) % 300
        d.ellipse([x, y, x + 40, y + 18], fill=(230, 120, 140))
    text_c(d, 260, "LIFE SURVIVES", F_MED, (255, 150, 90))
    return img


def p_humans():
    img = canvas(color=(4, 6, 14), seed=11)
    d = ImageDraw.Draw(img)
    d.polygon([(0, 1250), (300, 980), (540, 1150), (800, 900), (W, 1200), (W, H), (0, H)], fill=(20, 22, 30))
    d.rounded_rectangle([300, 1060, 780, 1240], radius=90, fill=(60, 66, 80), outline=(120, 140, 170), width=6)
    for k in range(4):
        d.rectangle([360 + k * 100, 1120, 420 + k * 100, 1170], fill=(255, 200, 90))
    d.ellipse([500, 920, 580, 960], fill=(255, 120, 40))
    for k in range(5):
        d.line([540, 920 - k * 50, 545 + (k % 2) * 20, 880 - k * 50], fill=(150, 150, 160), width=8)
    text_c(d, 260, "GEOTHERMAL", F_MED, (255, 180, 90))
    return img


def p_end():
    img = canvas(seed=12)
    img = earth(img, 540, 760, 260, frozen=1.0, dark=0.35)
    d = ImageDraw.Draw(img)
    text_c(d, 260, "-240°C", F_BIG, (150, 210, 255))
    return img


# (plano, narración, subtítulo con *palabra* resaltada)
BEATS = [
    (p_hook, "What if the Sun suddenly disappeared?", "What if the *Sun* *disappeared?*"),
    (p_gone, "Poof. One second it's there, the next it's gone.", "One second... *gone.*"),
    (p_clock, "But here on Earth, you wouldn't notice. Sunlight takes eight minutes and twenty seconds to reach us.",
     "Light takes *8* *minutes* to reach us"),
    (p_party, "So for eight minutes, life goes on like normal.", "For *8* *minutes,* nothing changes"),
    (p_dark, "Then the lights go out. The Sun vanishes from the sky, and the Moon goes dark with it.",
     "Then the sky goes *black*"),
    (p_fly, "Gravity travels at the speed of light too. So at that same moment, Earth stops orbiting and flies off into space in a straight line, at a hundred and seven thousand kilometers per hour.",
     "Earth flies off in a *straight* *line*"),
    (p_week, "Within a week, the average temperature drops below minus eighteen degrees.",
     "After 1 week: *-18°C*"),
    (p_plants, "With no sunlight, photosynthesis stops. Most plants die within weeks, and the food chain collapses.",
     "Plants *die,* the food chain *collapses*"),
    (p_year, "After one year, it's minus seventy three degrees.", "After 1 year: *-73°C*"),
    (p_ocean, "The oceans freeze on the surface. But that ice acts like a blanket, keeping the water below liquid for thousands of years.",
     "Ice works like a *blanket*"),
    (p_vent, "Deep down, life around hydrothermal vents doesn't need the Sun at all. It could survive for millions of years.",
     "Deep-sea life could *survive*"),
    (p_humans, "And humans? Our best chance would be underground, near volcanic heat, or in sealed habitats powered by nuclear energy.",
     "Humans? Hide near *volcanic* *heat*"),
    (p_end, "Eventually, Earth would settle at around minus two hundred and forty degrees. A frozen, dark wanderer, drifting through space forever.",
     "A frozen planet, *drifting* *forever*"),
]


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
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))


def main():
    os.makedirs(WORK, exist_ok=True)
    clips = []
    for i, (fn, text, cap) in enumerate(BEATS):
        png, wav, mp4 = (os.path.join(WORK, f"{i:02d}.{e}") for e in ("png", "wav", "mp4"))
        caption(fn(), cap).save(png)
        tts(text, wav)
        dur = duration(wav) + PAD
        frames = int(dur * FPS) + 1
        zin = i % 2 == 0  # alterna zoom de entrada y de salida
        z = f"1+0.06*on/{frames}" if zin else f"1.06-0.06*on/{frames}"
        vf = (f"scale=2160:3840,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
              f":d={frames}:s={W}x{H}:fps={FPS},format=yuv420p")
        run(["ffmpeg", "-y", "-i", png, "-i", wav, "-filter_complex",
             f"[0:v]{vf}[v];[1:a]apad,aresample=48000,aformat=channel_layouts=stereo[a]",
             "-map", "[v]", "-map", "[a]", "-t", f"{dur:.2f}",
             "-c:v", "libx264", "-preset", "medium", "-crf", "21",
             "-c:a", "aac", "-b:a", "160k", mp4])
        clips.append(mp4)
        print(f"plano {i + 1}/{len(BEATS)}  {dur:.1f}s", flush=True)
    lst = os.path.join(WORK, "list.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{os.path.abspath(c)}'\n" for c in clips)
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", OUT])
    print("listo:", OUT, f"{duration(OUT):.1f}s")


if __name__ == "__main__":
    main()

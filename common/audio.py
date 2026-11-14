"""Voz (Piper), estimación de tiempos por palabra, música y efectos sintetizados, y mezcla final."""
import math
import os
import subprocess
from fractions import Fraction

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

SR = 48000


# ---------------------------------------------------------------- voz
def synth_voice(text, model, length_scale, out_wav, espeak=None):
    raw = out_wav + ".raw.wav"
    if model and os.path.exists(model):
        subprocess.run(["piper", "-m", model, "--length-scale", str(length_scale),
                        "--sentence-silence", "0.15", "-f", raw],
                       input=text.encode(), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    else:
        print("aviso: no se encontró el modelo de voz", model, "- usando espeak-ng", flush=True)
        subprocess.run((espeak or ["espeak-ng", "-v", "en-us", "-s", "165"]) + ["-w", raw, text], check=True)
    sr, x = wavfile.read(raw)
    x = x.astype(np.float32)
    if x.ndim > 1:
        x = x.mean(1)
    x /= 32768.0
    return _post(x, sr)


def synth_voice_kokoro(text, model_dir, voice, speed, out_wav, lang="es"):
    """Voz neuronal Kokoro (kokoro-onnx). model_dir contiene kokoro-v1.0.onnx y voices-v1.0.bin."""
    from kokoro_onnx import Kokoro
    global _KOKORO
    try:
        _KOKORO
    except NameError:
        _KOKORO = None
    if _KOKORO is None:
        _KOKORO = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))
    x, sr = _KOKORO.create(text, voice=voice, speed=speed, lang=lang)
    x = np.asarray(x, np.float32)
    wavfile.write(out_wav + ".raw.wav", sr, (np.clip(x, -1, 1) * 32767).astype(np.int16))
    return _post(x, sr)


def _post(x, sr):
    fr = Fraction(SR, sr).limit_denominator(1000)
    x = resample_poly(x, fr.numerator, fr.denominator).astype(np.float32)
    x = tighten(x)
    # filtro paso alto suave + normalización
    x = sosfilt(butter(2, 70, "hp", fs=SR, output="sos"), x).astype(np.float32)
    x = x / (np.abs(x).max() + 1e-6) * 0.89
    return x


def _env(x, win=480):
    n = len(x) // win
    return np.sqrt((x[:n * win].reshape(n, win) ** 2).mean(1) + 1e-12)


def tighten(x, max_pause=0.32, win=480):
    """Recorta silencios del principio y del final y acorta pausas largas."""
    e = _env(x, win)
    thr = e.max() * 0.03
    voiced = e > thr
    if not voiced.any():
        return x
    first, last = np.argmax(voiced), len(voiced) - np.argmax(voiced[::-1])
    keep = []
    run = 0
    maxf = int(max_pause * SR / win)
    for i in range(first, last):
        if voiced[i]:
            run = 0
            keep.append(i)
        else:
            run += 1
            if run <= maxf:
                keep.append(i)
    out = np.concatenate([x[i * win:(i + 1) * win] for i in keep])
    fade = np.linspace(0, 1, 240, dtype=np.float32)
    out[:240] *= fade
    out[-240:] *= fade[::-1]
    return out


def word_times(text, x, win=240):
    """Estima cuándo empieza cada palabra repartiendo las palabras sobre los tramos con voz."""
    words = text.split()
    e = _env(x, win)
    voiced = np.where(e > e.max() * 0.05)[0]
    if len(voiced) == 0:
        voiced = np.arange(len(e))
    wts = np.array([len(w.strip(".,?!")) + 2.0 for w in words])
    cum = np.concatenate([[0], np.cumsum(wts)]) / wts.sum()
    out = []
    for i, w in enumerate(words):
        a = voiced[min(len(voiced) - 1, int(cum[i] * len(voiced)))] * win / SR
        b = voiced[min(len(voiced) - 1, int(cum[i + 1] * len(voiced)) - 1)] * win / SR
        out.append((w, float(a), float(b)))
    return out


# ---------------------------------------------------------------- síntesis básica
def t_axis(dur):
    return np.arange(int(dur * SR), dtype=np.float32) / SR


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "lp", fs=SR, output="sos"), x).astype(np.float32)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "bp", fs=SR, output="sos"), x).astype(np.float32)


def noise(dur, seed=0):
    return np.random.default_rng(seed).normal(size=int(dur * SR)).astype(np.float32) * 0.3


def osc(freq, dur, harm=((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08)), detune=0.0, seed=0):
    t = t_axis(dur)
    ph = np.random.default_rng(seed).uniform(0, 6.28)
    out = np.zeros_like(t)
    for h, a in harm:
        out += a * np.sin(2 * np.pi * freq * h * (1 + detune) * t + ph * h)
    return out


def pad(freqs, dur, attack=2.0, release=2.0, cutoff=900, seed=0):
    out = np.zeros(int(dur * SR), np.float32)
    for i, f in enumerate(freqs):
        for dt in (-0.004, 0.004):
            out += osc(f, dur, detune=dt, seed=seed + i) * 0.5
    out = lp(out, cutoff)
    env = np.ones_like(out)
    a, r = int(attack * SR), int(release * SR)
    a, r = min(a, len(out) // 2), min(r, len(out) // 2)
    env[:a] = np.linspace(0, 1, a) ** 2
    env[len(out) - r:] *= np.linspace(1, 0, r) ** 2
    return out * env / max(1, len(freqs))


def pluck(freq, dur=1.2, seed=0):
    t = t_axis(dur)
    x = (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(4 * np.pi * freq * t) + 0.15 * np.sin(6 * np.pi * freq * t))
    return (x * np.exp(-t * 4.5) * np.minimum(1, t * 400)).astype(np.float32)


def reverb(x, secs=2.5, wet=0.35, seed=3):
    n = int(secs * SR)
    ir = np.random.default_rng(seed).normal(size=n).astype(np.float32)
    ir *= np.exp(-np.linspace(0, 7, n)).astype(np.float32)
    ir = lp(ir, 5000)
    ir /= np.sqrt((ir ** 2).sum())
    y = fftconvolve(x, ir)[:len(x)].astype(np.float32)
    return x * (1 - wet) + y * wet


def put(buf, x, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * gain


# ---------------------------------------------------------------- efectos
def whoosh(dur=0.55, seed=0, up=True):
    n = noise(dur, seed)
    t = t_axis(dur)
    # barrido de un paso banda (aprox. por tramos)
    out = np.zeros_like(n)
    steps = 12
    for k in range(steps):
        a, b = int(k * len(n) / steps), int((k + 1) * len(n) / steps)
        f = 300 * (12 ** (k / steps if up else 1 - k / steps))
        out[a:b] = bp(n, f * 0.7, min(f * 1.6, 20000))[a:b]
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return out * env * 2.2


def boom(dur=3.0):
    t = t_axis(dur)
    f = 55 * np.exp(-t * 1.2) + 28
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 1.4)
    hit = lp(noise(dur, 9), 900) * np.exp(-t * 6) * 2.5
    return (body * 1.2 + hit) * np.minimum(1, t * 300)


def sub_drop(dur=2.2):
    t = t_axis(dur)
    f = 90 * np.exp(-t * 2.0) + 30
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 1.3) * np.minimum(1, t * 200)


def tick(hi=True):
    t = t_axis(0.05)
    f = 2600 if hi else 2000
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 160) + bp(noise(0.05, 4), 3000, 9000) * np.exp(-t * 200)) * 0.6


def riser(dur=2.5):
    t = t_axis(dur)
    k = t / dur
    f = 180 * (6 ** k)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * 0.25
    nz = bp(noise(dur, 6), 800, 9000) * k ** 2 * 1.5
    return (tone + nz) * k ** 1.5


def wind(dur, seed=8):
    n = lp(noise(dur, seed), 700, 2)
    t = t_axis(dur)
    m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t) * np.sin(2 * np.pi * 0.07 * t + 1)
    return n * m * 2.0


def hit(dur=1.2):
    t = t_axis(dur)
    return (lp(noise(dur, 12), 2500) * np.exp(-t * 9) * 2 + np.sin(2 * np.pi * 60 * t) * np.exp(-t * 5))


def heartbeat(dur, bpm=58):
    out = np.zeros(int(dur * SR), np.float32)
    k = t_axis(0.35)
    beat = np.sin(2 * np.pi * 48 * k) * np.exp(-k * 14)
    p = 60 / bpm
    t = 0.0
    while t < dur:
        put(out, beat, t, 1.0)
        put(out, beat, t + 0.26, 0.6)
        t += p
    return out


def shimmer(dur, seed=2):
    out = np.zeros(int(dur * SR), np.float32)
    rng = np.random.default_rng(seed)
    notes = [880, 1046.5, 1318.5, 1568, 1760]
    t = 0.0
    while t < dur:
        put(out, pluck(rng.choice(notes), 1.5) * 0.5, t)
        t += rng.uniform(0.25, 0.6)
    return out


# ---------------------------------------------------------------- mezcla
def duck(music, voice, depth=0.6):
    win = 480
    e = _env(voice, win)
    e = e / (e.max() + 1e-6)
    # ataque rápido, caída lenta
    sm = np.zeros_like(e)
    v = 0.0
    for i, x in enumerate(e):
        v = max(x, v * 0.97)
        sm[i] = v
    g = 1 - depth * np.clip(sm * 3, 0, 1)
    g = np.repeat(g, win)
    g = np.pad(g, (0, max(0, len(music) - len(g))), constant_values=1)[:len(music)]
    return music * g


def write_wav(path, stereo):
    y = np.tanh(stereo * 1.1) * 0.95
    wavfile.write(path, SR, (y * 32767).astype(np.int16))


# ---------------------------------------------------------------- efectos de taller
def thunk(dur=0.35, f=150):
    """Golpe de madera."""
    t = t_axis(dur)
    body = np.sin(2 * np.pi * f * t) * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * f * 2.3 * t) * np.exp(-t * 35)
    nz = lp(noise(dur, 21), 1800) * np.exp(-t * 45) * 3
    return (body + nz) * np.minimum(1, t * 800)


def clink(dur=0.6):
    """Golpe metálico."""
    t = t_axis(dur)
    out = np.zeros_like(t)
    for f, a, d in [(1870, 1, 9), (2710, 0.7, 12), (4130, 0.5, 16), (5390, 0.3, 20), (920, 0.4, 7)]:
        out += a * np.sin(2 * np.pi * f * t) * np.exp(-t * d)
    return out * 0.35 * np.minimum(1, t * 2000)


def boing(dur=0.7):
    t = t_axis(dur)
    f = 210 * (1 + 0.22 * np.sin(2 * np.pi * 17 * t) * np.exp(-t * 4))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 4.5) * np.minimum(1, t * 600) * 0.8


def sew(dur):
    t = t_axis(dur)
    clicks = (np.sin(2 * np.pi * 24 * t) > 0.92).astype(np.float32)
    clicks = bp(clicks, 1500, 6000) * 3
    motor = lp(np.sign(np.sin(2 * np.pi * 96 * t)).astype(np.float32), 900) * 0.25
    env = np.minimum(1, np.minimum(t * 20, (dur - t) * 20))
    return (clicks + motor) * env


def fizz(dur, seed=31):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    imp = (rng.random(n) > 0.997).astype(np.float32) * rng.uniform(0.2, 1, n).astype(np.float32)
    x = bp(imp, 2000, 9000) * 4 + bp(noise(dur, seed), 3000, 10000) * 0.4
    t = t_axis(dur)
    return x * np.minimum(1, np.minimum(t * 3, (dur - t) * 3))


def rumble(dur, seed=33):
    t = t_axis(dur)
    x = lp(noise(dur, seed), 220, 2) * 4
    return x * (0.7 + 0.3 * np.sin(2 * np.pi * 1.6 * t)) * np.minimum(1, np.minimum(t * 2, (dur - t) * 2))


def pop(dur=0.12):
    t = t_axis(dur)
    f = 700 * np.exp(-t * 18) + 250
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 30) * 0.7


def kick(dur=0.4):
    t = t_axis(dur)
    f = 110 * np.exp(-t * 28) + 45
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * np.minimum(1, t * 3000)


def snare(dur=0.2, seed=41):
    t = t_axis(dur)
    return (bp(noise(dur, seed), 900, 7000) * 3 * np.exp(-t * 22) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5)


def hat(dur=0.05, seed=43):
    t = t_axis(dur)
    return bp(noise(dur, seed), 7000, 16000) * 3 * np.exp(-t * 90)


def bass_note(freq, dur=0.28):
    t = t_axis(dur)
    x = sum((1 / h) * np.sin(2 * np.pi * freq * h * t) for h in range(1, 7))
    return lp(x.astype(np.float32), 600) * np.exp(-t * 6) * np.minimum(1, t * 400)

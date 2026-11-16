#!/usr/bin/env python3
"""Builds voices + SFX + music mix and the cue sheet for each part."""
import sys, os, json, asyncio, hashlib, subprocess, ssl
import numpy as np
from scipy import signal
from scipy.io import wavfile
import edge_tts, edge_tts.communicate as ec

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache"); os.makedirs(CACHE, exist_ok=True)
OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)
_ctx = ssl.create_default_context(cafile=os.path.expanduser("~/.ccr/ca-bundle.crt"))
for n in dir(ec):
    if isinstance(getattr(ec, n), ssl.SSLContext): setattr(ec, n, _ctx)
rng = np.random.default_rng(7)

VO = {  # voice, rate, pitch, fx, gain, subtitle class
 'YO':      ('es-UY-MateoNeural', '+0%',  '+0Hz',  'store', 1.0, 'yo'),
 'YOLOW':   ('es-UY-MateoNeural', '-10%', '-6Hz',  'room',  0.9, 'yo'),
 'YOSH':    ('es-UY-MateoNeural', '+14%', '+14Hz', 'store', 1.15,'yo'),
 'YOIN':    ('es-UY-MateoNeural', '-5%',  '-5Hz',  'inner', 1.0, 'in'),
 'VIEJA':   ('es-AR-ElenaNeural', '-7%', '-14Hz', 'store', 1.0, 'vieja'),
 'VIEJAFAR':('es-AR-ElenaNeural', '-22%', '-18Hz', 'far',   1.0, 'vieja'),
 'COSA':    ('es-AR-ElenaNeural', '-18%', '-22Hz', 'door',  1.0, 'cosa'),
 'COSAC':   ('es-AR-ElenaNeural', '-28%', '-24Hz', 'close', 1.1, 'cosa'),
 'NICO':    ('es-AR-TomasNeural', '+4%',  '+4Hz',  'store', 1.0, 'nico'),
 'NICOW':   ('es-AR-TomasNeural', '-8%',  '+2Hz',  'room',  0.85,'nico'),
 'COSANICO':('es-AR-TomasNeural', '-10%', '-10Hz', 'door',  1.0, 'cosa'),
 'RAUL':    ('es-PY-MarioNeural', '-4%',  '-8Hz',  'room',  0.95,'raul'),
 'RAULSH':  ('es-PY-MarioNeural', '+14%', '+8Hz',  'store', 1.2, 'raul'),
 'MAMA':    ('es-UY-ValentinaNeural','-18%','-8Hz','door',  1.0, 'cosa'),
 'PA':      ('es-UY-ValentinaNeural','+2%','+6Hz', 'pa',    0.6, 'pa'),
 'TODOS':   ('es-AR-ElenaNeural', '-26%', '-22Hz', 'choir', 1.2, 'cosa'),
}

# ---------------------------------------------------------------- helpers
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def lp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, o=2): return signal.sosfilt(signal.butter(o, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, a, b, o=2): return signal.sosfilt(signal.butter(o, [a, b], 'band', fs=SR, output='sos'), x, axis=0)
def st(x): return np.stack([x, x], 1) if x.ndim == 1 else x
def fade(x, a=0.01, b=0.01):
    x = x.copy(); na, nb = int(a*SR), int(b*SR)
    if na: x[:na] *= np.linspace(0, 1, na)[:, None] if x.ndim == 2 else np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)[:, None] if x.ndim == 2 else np.linspace(1, 0, nb)
    return x
def reverb(x, t60=1.2, wet=0.3, pre=0.012, dark=4000, seed=1):
    r = np.random.default_rng(seed); n = int(t60 * SR)
    ir = r.standard_normal((n, 2)) * env_exp(n, t60 / 6.9)[:, None]
    ir = lp(ir, dark); ir /= np.sqrt((ir**2).sum(0)).max()
    x = st(x); pad = np.zeros((int(pre*SR), 2))
    w = np.stack([signal.fftconvolve(x[:, c], ir[:, c]) for c in (0, 1)], 1)
    w = np.concatenate([pad, w]); out = np.zeros((len(w), 2)); out[:len(x)] += x * (1 - wet * 0.3)
    return out + w * wet
def pitch_layer(mono, factor):
    p = os.path.join(CACHE, "_pl_in.wav"); q = os.path.join(CACHE, "_pl_out.wav")
    wavfile.write(p, SR, (np.clip(mono, -1, 1) * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-af", f"asetrate={int(SR*factor)},aresample={SR},atempo={1/factor:.5f}", q], check=True)
    y = wavfile.read(q)[1].astype(np.float64) / 32768
    return y[:len(mono)] if len(y) >= len(mono) else np.pad(y, (0, len(mono) - len(y)))

# ---------------------------------------------------------------- TTS
async def _synth(voice, rate, pitch, text, mp3):
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
    words = []
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append([ch["text"], ch["offset"] / 1e7, ch["duration"] / 1e7])
    return words
def tts(spk, text):
    voice, rate, pitch = VO[spk][:3]
    key = hashlib.md5(f"{voice}|{rate}|{pitch}|{text}".encode()).hexdigest()[:14]
    mp3, js, wav = [os.path.join(CACHE, key + e) for e in (".mp3", ".json", ".wav")]
    if not (os.path.exists(wav) and os.path.exists(js)):
        for attempt in range(4):
            try:
                words = asyncio.run(_synth(voice, rate, pitch, text, mp3))
                if os.path.getsize(mp3) > 500: break
            except Exception as e:
                print("retry", e, file=sys.stderr)
        json.dump(words, open(js, "w"))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), wav], check=True)
    a = wavfile.read(wav)[1].astype(np.float64) / 32768
    words = json.load(open(js))
    idx = np.where(np.abs(a) > 0.012)[0]
    if len(idx): a = a[:min(len(a), idx[-1] + int(0.10 * SR))]
    a = a / (np.abs(a).max() + 1e-9) * 0.85
    return a, words

def voice_fx(a, fx):
    if fx == 'store':  return reverb(a, 0.9, 0.16, dark=5000, seed=2)
    if fx == 'room':   return reverb(a, 0.7, 0.22, dark=3500, seed=3)
    if fx == 'inner':
        b = a + 0.25 * lp(a, 250); return reverb(b, 1.6, 0.14, pre=0.03, dark=3000, seed=4)
    if fx == 'far':    return reverb(lp(a, 2600) * 0.75, 2.2, 0.55, pre=0.05, dark=2500, seed=5)
    if fx == 'door':
        low = pitch_layer(a, 0.72)
        b = lp(a, 950, 3) * 1.5 + lp(low, 700, 3) * 0.55
        return reverb(b, 1.8, 0.4, pre=0.02, dark=1800, seed=6)
    if fx == 'close':
        low = pitch_layer(a, 0.66)
        b = a * 0.9 + lp(a, 220) * 0.6 + low * 0.5
        o = st(b); o[:, 0] *= 1.15; o[:, 1] *= 0.6   # in the left ear
        return reverb(o, 0.5, 0.08, seed=7)
    if fx == 'pa':
        b = bp(a, 450, 3200, 3); b = np.tanh(b * 2.5) * 0.5
        d = int(0.11 * SR); c = np.pad(b, (0, d)); c[d:] += b * 0.35
        return reverb(c, 2.0, 0.45, dark=2800, seed=8)
    if fx == 'choir':
        n = len(a) + int(0.3 * SR); o = np.zeros((n, 2))
        for i, (f, dl, pan) in enumerate([(1.0, 0, .5), (0.8, .03, .1), (0.66, .06, .9), (1.18, .045, .3), (0.9, .08, .7), (1.3, .02, .6)]):
            y = a if f == 1.0 else pitch_layer(a, f)
            d = int(dl * SR); o[d:d + len(y), 0] += y * (1 - pan) * 0.5; o[d:d + len(y), 1] += y * pan * 0.5
        return reverb(o, 1.4, 0.3, dark=3000, seed=9)
    return st(a)

# ---------------------------------------------------------------- SFX
def tone(f, d, tau=None, h=()):
    t = np.arange(int(d * SR)) / SR; y = np.sin(2 * np.pi * f * t)
    for k, g in h: y += g * np.sin(2 * np.pi * f * k * t)
    return y * (env_exp(len(t), tau) if tau else 1)
def noise(d): return rng.standard_normal(int(d * SR))
def add(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def nb(d, a, b, tau, g=1.0): return bp(noise(d), a, b) * env_exp(int(d * SR), tau) * g
def sfx_alert():
    # phone vibration on the counter + harsh two-tone emergency beeps
    d = 2.6; t = np.arange(int(d * SR)) / SR
    vib = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.25 + bp(noise(d), 1500, 4000) * 0.12
    gate = ((t % 0.9) < 0.55).astype(float); gate = lp(gate, 60)
    vib = lp(vib, 2500) * gate
    beeps = (np.sin(2 * np.pi * 853 * t) + np.sin(2 * np.pi * 960 * t)) * 0.5
    bg = (((t % 0.5) < 0.3) & (t < 2.0)).astype(float); bg = lp(bg, 200)
    beeps = np.tanh(beeps * 1.6) * bg * 0.55
    return fade(reverb(vib * 0.8 + beeps, 0.6, 0.18, seed=11), 0.005, 0.2)
def sfx_knock(n=3, gapt=0.62, hard=1.0):
    o = np.zeros(int((n * gapt + 1.5) * SR))
    for i in range(n):
        k = add(tone(74, 0.5, 0.07), tone(148, 0.3, 0.035) * 0.5, nb(0.12, 300, 2200, 0.012, 0.9))
        k2 = add(tone(310, 0.7, 0.16) * 0.10, tone(487, 0.6, 0.12) * 0.06)     # metal door ring
        s = int((i * gapt + rng.uniform(0, 0.03)) * SR)
        o[s:s + len(k)] += k[:len(o) - s] * hard * (0.85 + 0.15 * (i % 2)); o[s:s + len(k2)] += k2
    return reverb(o, 1.6, 0.45, dark=2200, seed=12)
def sfx_slam():
    b = add(tone(48, 1.4, 0.22) * 1.3, tone(96, 0.8, 0.09) * 0.7, lp(noise(0.5), 1800) * env_exp(int(0.5 * SR), 0.03) * 1.2)
    m = add(tone(233, 1.4, 0.3) * 0.12, tone(377, 1.2, 0.25) * 0.08, tone(1210, 0.5, 0.08) * 0.05)
    b[:len(m)] += m
    latch = int(0.16 * SR); c = bp(noise(0.06), 2000, 6000) * env_exp(int(0.06 * SR), 0.008) * 0.5
    b[latch:latch + len(c)] += c
    return reverb(np.tanh(b), 2.6, 0.5, dark=2600, seed=13)
def sfx_shutter(d=2.3):
    t = np.arange(int(d * SR)) / SR
    r = bp(noise(d), 180, 2600) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 21 * t)))
    r *= np.minimum(1, t / 0.15) * 0.6
    r += tone(62, d) * 0.25 * (0.5 + 0.5 * np.sin(2 * np.pi * 21 * t))
    hit = sfx_slam()[:, 0] * 0.7
    o = np.zeros(len(r) + len(hit)); o[:len(r)] += r; o[len(r) - 2000:len(r) - 2000 + len(hit)] += hit
    return reverb(o, 1.3, 0.3, seed=14)
def sfx_clunk(g=1.0):
    c = add(tone(58, 0.6, 0.11) * 0.9, nb(0.05, 800, 5000, 0.006, 0.7))
    z = tone(120, 0.5, 0.2, h=((2, .5), (3, .3), (5, .2))) * 0.12
    c[:len(z)] += z * np.linspace(1, 0, len(z))
    return reverb(c * g, 2.0, 0.5, dark=3000, seed=15)
def sfx_steps(d, rate=3.4):
    o = np.zeros(int((d + 0.6) * SR)); t = 0.0; i = 0
    while t < d:
        k = add(tone(95 + 12 * (i % 2), 0.2, 0.03) * 0.8, nb(0.07, 700, 3500, 0.012, 0.45))
        s = int(t * SR); o[s:s + len(k)] += k[:len(o) - s]; t += 1 / rate + rng.uniform(-.02, .02); i += 1
    return reverb(o, 1.0, 0.3, seed=16)
def sfx_sting(big=1.0):
    d = 4.0; t = np.arange(int(d * SR)) / SR
    boom = np.sin(2 * np.pi * (38 + 30 * np.exp(-t * 9)) * t) * np.exp(-t / 0.9) * 1.2
    hitn = lp(noise(d), 500) * np.exp(-t / 0.12) * 1.3
    cl = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in (1244, 1318, 1397, 1480, 2637, 2793)) / 6
    cl *= (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)) * np.exp(-t / 1.4) * 0.3
    brass = sum(signal.sawtooth(2 * np.pi * f * t) for f in (55, 58.3, 82.4, 110.5)) / 4
    brass = lp(brass, 600) * np.minimum(1, t / 0.02) * np.exp(-t / 1.1) * 0.7
    return reverb(np.tanh((boom + hitn + cl + brass) * big), 3.2, 0.45, dark=5000, seed=17)
def sfx_riser(d=2.5):
    t = np.arange(int(d * SR)) / SR; x = t / d
    n = noise(d); sw = np.zeros_like(n); bl = 2048
    for i in range(0, len(n), bl):
        f = 300 + 5000 * (i / len(n)) ** 2
        sw[i:i + bl] = bp(n[max(0, i - bl):i + bl], f * 0.7, f * 1.3)[-len(n[i:i + bl]):]
    tn = sum(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.0 * x ** 2)) / SR) for f0 in (220, 233, 311)) / 3
    return st((sw * 0.5 + tn * 0.35) * x ** 2.2) * 0.8
def sfx_whoosh(d=0.7):
    t = np.arange(int(d * SR)) / SR; x = t / d
    return reverb(bp(noise(d), 300, 3000) * np.sin(np.pi * x) ** 2 * 0.6, 0.8, 0.3, seed=18)
def sfx_click():
    c = bp(noise(0.03), 1500, 7000) * env_exp(int(0.03 * SR), 0.004)
    return st(np.concatenate([c, np.zeros(int(0.05 * SR)), c * 0.6])) * 0.8
def sfx_flicker(d=1.6):
    t = np.arange(int(d * SR)) / SR
    g = (rng.random(int(d * 40) + 1) > 0.5).astype(float).repeat(SR // 40 + 1)[:len(t)]
    z = signal.sawtooth(2 * np.pi * 100 * t) * 0.2 + bp(noise(d), 3000, 9000) * 0.25
    return st(lp(z * g, 6000)) * 0.6
def sfx_creak(d=1.4):
    t = np.arange(int(d * SR)) / SR
    f = 180 + 140 * np.sin(2 * np.pi * 0.6 * t) + 40 * np.sin(2 * np.pi * 7 * t)
    y = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 31 * t)))
    return reverb(bp(y, 300, 2500) * np.sin(np.pi * t / d) * 0.35, 1.5, 0.4, seed=19)
def sfx_heart(d, bpm=70, accel=0.0):
    o = np.zeros(int((d + 1) * SR)); t = 0.0
    while t < d:
        for off, g in ((0, 1.0), (0.17, 0.7)):
            k = tone(52, 0.3, 0.06) * g; s = int((t + off) * SR); o[s:s + len(k)] += k
        t += 60 / (bpm + accel * t)
    return st(lp(o, 160)) * 0.9
def sfx_tapestop(x, d=1.6):
    """slow a stereo clip to a stop (muzak dying)"""
    n = int(d * SR); x = x[:int(n * 0.6)]
    pos = np.cumsum(np.linspace(1, 0, n) ** 1.2); pos = pos[pos < len(x) - 1]
    i = pos.astype(int); fr = (pos - i)[:, None]
    return x[i] * (1 - fr) + x[i + 1] * fr
def sfx_scream_hit():
    d = 1.2; t = np.arange(int(d * SR)) / SR
    y = sum(signal.sawtooth(2 * np.pi * np.cumsum(f * (1 + 0.05 * np.sin(2 * np.pi * 9 * t))) / SR) for f in (880, 932, 1245)) / 3
    return reverb(bp(y, 600, 5000) * np.minimum(1, t / 0.01) * np.exp(-t / 0.35) * 0.5, 2.0, 0.5, seed=21)

def drone(d, f0=36.7, bright=380, seed=30):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR; o = np.zeros((len(t), 2))
    for mult, g in ((1, 1.0), (1.5, 0.35), (2, 0.5), (2.02, 0.3), (3, 0.14), (4.03, 0.1)):
        for c in (0, 1):
            f = f0 * mult * (1 + 0.004 * r.standard_normal())
            o[:, c] += g * signal.sawtooth(2 * np.pi * f * t + r.uniform(0, 6)) * (0.7 + 0.3 * np.sin(2 * np.pi * r.uniform(0.05, 0.2) * t + r.uniform(0, 6)))
    o = lp(o, bright, 3)
    air = lp(r.standard_normal((len(t), 2)), 900) * 0.6 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))[:, None]
    return (o * 0.5 + air * 0.15)
def strings(d, freqs=(293.7, 311.1, 440.0), seed=40):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR; o = np.zeros((len(t), 2))
    for f in freqs:
        for k in range(4):
            ff = f * (1 + 0.006 * r.standard_normal()); c = k % 2
            o[:, c] += signal.sawtooth(2 * np.pi * ff * t + r.uniform(0, 6)) * (0.75 + 0.25 * np.sin(2 * np.pi * (9 + r.uniform(-1, 1)) * t))
    return reverb(lp(o, 2200) * 0.08, 2.5, 0.5, seed=seed)[:len(t)]
def muzak(d, seed=50):
    """cheesy supermarket bossa from ceiling speakers"""
    r = np.random.default_rng(seed); bpm = 112; beat = 60 / bpm; o = np.zeros(int((d + 2) * SR))
    chords = [(261.6, 329.6, 392.0, 493.9), (220.0, 261.6, 329.6, 392.0), (293.7, 349.2, 440.0, 523.3), (196.0, 246.9, 349.2, 440.0)]
    mel = [659.3, 587.3, 523.3, 587.3, 659.3, 784.0, 659.3, 0, 587.3, 523.3, 440.0, 523.3, 587.3, 493.9, 392.0, 0]
    def ep(f, dur, g):
        t = np.arange(int(dur * SR)) / SR
        return (np.sin(2 * np.pi * f * t + 1.5 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.2)) * np.exp(-t / (dur * 0.45))) * g
    t = 0.0; bar = 0
    while t < d:
        ch = chords[bar % 4]
        for b, on in enumerate([0, 1.5, 2.5, 3.5]):
            for f in ch:
                y = ep(f, beat * 1.2, 0.12); s = int((t + on * beat) * SR); o[s:s + len(y)] += y[:len(o) - s]
        y = ep(ch[0] / 2, beat * 1.8, 0.3)
        for on in (0, 2.5):
            s = int((t + on * beat) * SR); o[s:s + len(y)] += y[:len(o) - s]
        for b in range(8):
            f = mel[(bar * 4 + b) % 16] if b % 2 == 0 or r.random() < 0.3 else 0
            if f:
                y = ep(f, beat * 0.9, 0.2); s = int((t + b * beat / 2) * SR); o[s:s + len(y)] += y[:len(o) - s]
            sh = bp(noise(0.05), 5000, 9000) * env_exp(int(0.05 * SR), 0.01) * 0.05
            s = int((t + b * beat / 2) * SR); o[s:s + len(sh)] += sh[:len(o) - s]
        t += 4 * beat; bar += 1
    o = bp(o[:int(d * SR)], 350, 3600, 2)
    return reverb(o, 1.8, 0.4, dark=3000, seed=seed)[:int(d * SR)]
def roomtone(d, hum=100, seed=60):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    y = lp(r.standard_normal((len(t), 2)), 400) * 0.3
    y += (np.sin(2 * np.pi * hum * t) * 0.03 + np.sin(2 * np.pi * hum * 2 * t) * 0.015)[:, None]
    return y
def crowd(d, seed=70):
    r = np.random.default_rng(seed); t = np.arange(int(d * SR)) / SR
    y = bp(r.standard_normal((len(t), 2)), 250, 1800) * 0.1
    y *= (0.6 + 0.4 * lp(np.abs(r.standard_normal((len(t), 2))), 3) * 3)
    return y

# ---------------------------------------------------------------- timeline
class TL:
    def __init__(s, name):
        s.name = name; s.t = 0.0; s.lines = []; s.marks = {}; s.voice = []; s.sfx = []
    def W(s, d): s.t += d
    def M(s, name, gap=0.0, adv=False):
        s.marks[name] = round(s.t + gap, 3)
        if adv: s.t += gap
        return s.marks[name]
    def L(s, id, spk, text, gap=0.3, show=None, at=None, block=True):
        a, words = tts(spk, text)
        start = (s.t + gap) if at is None else at; dur = len(a) / SR
        fx, gain, cls = VO[spk][3:]
        s.voice.append((start, voice_fx(a, fx) * gain))
        disp = (show or text).split(); ws = []
        if len(words) == len(disp):
            ws = [[disp[i], round(start + w[1], 3), round(start + w[1] + w[2], 3)] for i, w in enumerate(words)]
        else:  # fallback: spread evenly by length
            tot = sum(len(w) + 1 for w in disp); c = 0
            for w in disp:
                ws.append([w, round(start + dur * c / tot, 3), round(start + dur * (c + len(w) + 1) / tot, 3)]); c += len(w) + 1
        s.lines.append(dict(id=id, spk=spk, cls=cls, text=show or text, start=round(start, 3), end=round(start + dur, 3), words=ws))
        if block: s.t = start + dur
        return start, start + dur
    def S(s, snd, at, gain=1.0): s.sfx.append((at, st(snd) * gain))
    def T(s, id): return next(l for l in s.lines if l['id'] == id)

def mixdown(tl, dur, beds):
    n = int(dur * SR); bed = np.zeros((n, 2)); vo = np.zeros((n, 2)); fxb = np.zeros((n, 2))
    def put(buf, x, at, g=1.0):
        s = int(at * SR)
        if s >= n or s + len(x) <= 0: return
        if s < 0: x = x[-s:]; s = 0
        x = x[:n - s]; buf[s:s + len(x)] += x * g
    for at, x, g in beds: put(bed, st(x), at, g)
    for at, x in tl.voice: put(vo, x, at)
    for at, x in tl.sfx: put(fxb, x, at)
    def strms(x, pct):
        w = int(0.3 * SR); e = np.sqrt(np.convolve((x ** 2).mean(1), np.ones(w) / w, 'same')[::w // 2]); e = e[e > 1e-4]
        return np.percentile(e, pct) if len(e) else 1e-9
    db = lambda v: round(20 * np.log10(v + 1e-9), 1)
    print("  bus levels before (voice p70, bed p90, sfx p98):", db(strms(vo, 70)), db(strms(bed, 90)), db(strms(fxb, 98)))
    vo *= 10 ** (-17 / 20) / strms(vo, 70); bed *= 10 ** (-27 / 20) / strms(bed, 90); fxb *= min(1.0, 10 ** (-11 / 20) / strms(fxb, 98))
    # duck music under voices
    e = lp(np.abs(vo).max(1), 4); duck = 1 - 0.5 * np.clip(e / 0.08, 0, 1)
    m = bed * duck[:, None] + vo * 1.05 + fxb
    m = fade(m, 0.02, 0.4)
    m = np.tanh(m * 1.1) / np.tanh(1.1) * 0.97
    wav = os.path.join(OUT, tl.name + ".wav")
    wavfile.write(wav, SR, (np.clip(m, -1, 1) * 32767).astype(np.int16))
    json.dump(dict(dur=dur, lines=tl.lines, marks=tl.marks), open(os.path.join(OUT, tl.name + ".json"), "w"), ensure_ascii=False, indent=1)
    print(tl.name, "dur", round(dur, 2)); [print(f"  {l['start']:6.2f}-{l['end']:6.2f} {l['spk']:9s} {l['text']}") for l in tl.lines]
    print("  marks", tl.marks)

def envelope(dur, pts):
    """piecewise-linear gain curve [(t,g),...] -> per-sample (n,1)"""
    t = np.arange(int(dur * SR)) / SR
    return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])[:, None]

# ================================================================ PART 1
def part1():
    tl = TL("p1"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    M('buzz1', 0.25); S(sfx_alert(), 0.25, 0.9)
    L('h1', 'YOIN', "A las nueve y cuarto, todos los celulares del súper sonaron a la vez.", gap=0.9)
    M('title', 0.0)
    L('v1', 'VIEJA', "Nene, ¿qué dice ahí? No traje los lentes.", gap=0.45)
    L('y1', 'YO', "Alerta extrema. Busque refugio... ya.", gap=0.3)
    L('n1', 'NICO', "Bah, tranqui. Debe ser un simulacro.", gap=0.25)
    so = M('street_out', 0.35)
    for i in range(5): S(sfx_clunk(0.55 + 0.1 * i), so + i * 0.55, 0.8)
    L('h2', 'YOIN', "Entonces la calle se apagó. Farol por farol. Hacia nosotros.", gap=0.55)
    W(0.25); M('panic')
    a, b = L('r1', 'RAULSH', "¡Bajen la persiana! ¡Todos al depósito, ya!", gap=0.15)
    sh = M('shutter', -1.2); S(sfx_shutter(2.0), sh, 0.6)
    run = M('run'); S(sfx_steps(2.0, 3.6), run, 0.8); W(1.9)
    M('turn')
    L('y2', 'YOSH', "¡Señora, venga!", gap=0.1)
    lo = M('lights_out', 0.15)
    for i in range(3): S(sfx_clunk(0.8), lo + i * 0.5, 0.75)
    L('v2', 'VIEJAFAR', "Me debés el vuelto, querido.", gap=0.85)
    a, b = L('r2', 'RAULSH', "¡Dejala! ¡Cerrá, cerrá!", gap=0.2)
    S(sfx_clunk(0.9), a + 0.9, 0.8)
    sl = M('slam', 0.25, adv=True); S(sfx_slam(), sl, 1.0)
    W(1.3)
    b2 = M('buzz2'); S(sfx_alert(), b2, 0.75)
    L('y3', 'YOLOW', "No le abra a nadie... aunque conozca la voz.", gap=1.2)
    W(0.7); k = M('knock'); S(sfx_knock(3, 0.62), k, 1.0); W(2.1)
    L('c1', 'COSA', "Querido... abrime. Acá afuera hace frío.", gap=0.15)
    L('n2', 'NICOW', "Es la señora. Hay que abrirle.", gap=0.45)
    L('r3', 'RAUL', "No. Nadie toca esa puerta.", gap=0.25)
    ey = M('eyes', 0.5, adv=True); S(sfx_riser(2.2), ey - 0.2, 0.55)
    k2 = M('knock2', 0.6); S(sfx_knock(1, 0.7, 1.2), k2, 1.0)
    L('c2', 'COSA', "Me debés... el vuelto.", gap=1.3)
    sg = M('sting', 0.15, adv=True); S(sfx_sting(), sg, 0.9)
    ec_ = M('endcard', 0.9, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(2.8); dur = tl.t
    mk = tl.marks
    mz = muzak(mk['lights_out'] + 3)
    cut = int(mk['lights_out'] * SR)
    mz = np.concatenate([mz[:cut], sfx_tapestop(mz[cut:], 1.8)])
    mzg = envelope(len(mz) / SR, [(0, 0.55), (mk['street_out'], 0.5), (mk['panic'], 0.3), (mk['lights_out'], 0.3), (len(mz) / SR, 0.25)])
    dr = drone(dur)
    drg = envelope(dur, [(0, 0.0), (mk['street_out'] - 0.5, 0.0), (mk['street_out'] + 2, 0.5), (mk['slam'], 0.8), (mk['slam'] + 0.3, 0.35), (mk['knock'], 0.5), (mk['sting'], 0.9), (dur, 0.55)])
    sg_ = strings(dur - mk['buzz2'])
    sgg = envelope(dur - mk['buzz2'], [(0, 0), (mk['knock'] - mk['buzz2'], 0.3), (mk['sting'] - mk['buzz2'], 1.2), (mk['sting'] - mk['buzz2'] + 0.2, 0.0)])
    hb = sfx_heart(mk['sting'] - mk['knock'], 72, 3.0)
    beds = [(0, mz * mzg, 1.0), (0, dr * drg, 1.0), (mk['buzz2'], sg_ * sgg, 1.0), (mk['knock'], hb, 0.6),
            (0, roomtone(mk['slam']) , 0.5), (mk['slam'] + 0.4, roomtone(dur - mk['slam'], 50, 61), 0.8),
            (mk['panic'] - 0.3, crowd(mk['slam'] - mk['panic'] + 0.3) * 2.0, 1.0)]
    mixdown(tl, dur, beds)

# ================================================================ PART 2
def part2():
    tl = TL("p2"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    S(sfx_knock(3, 0.7), 0.15, 1.0); M('title', 0.3); S(sfx_whoosh(), 0.2, 0.5)
    a, b = L('h1', 'YOIN', "No abrimos. Y eso golpeó la puerta durante veinte minutos.", gap=1.3)
    S(sfx_knock(3, 0.7, 0.9), a + 1.1, 0.8); S(sfx_knock(2, 0.7, 1.1), b + 0.1, 0.95)
    W(1.5); M('knock_stop'); W(0.9)
    L('n1', 'NICOW', "Paró... Se fue.", gap=0.0)
    W(0.5); M('voice_nico')
    L('c1', 'COSANICO', "Che, abrime. Soy Nico. Me quedé afuera.", gap=0.3)
    L('n2', 'NICOW', "Ese... ese soy yo.", gap=0.55)
    b3 = M('buzz3', 0.3, adv=True); S(sfx_alert(), b3, 0.7)
    L('r1', 'RAUL', "Imita voces. Que nadie le conteste.", gap=1.2)
    W(0.5); M('voice_mama')
    L('c2', 'MAMA', "Hijo... soy mamá. Vine a buscarte.", gap=0.3)
    L('h2', 'YOIN', "Mi mamá vive en Salto. A quinientos kilómetros.", gap=0.5)
    fl = M('flicker', 0.3, adv=True); S(sfx_flicker(1.5), fl, 0.8)
    bo = M('bulb_out', 1.5, adv=True); S(sfx_clunk(1.0), bo, 0.9)
    L('r2', 'RAUL', "Quietos. Somos tres. Que nadie se mueva.", gap=0.9)
    fo = M('flash_on', 0.6, adv=True); S(sfx_click(), fo, 1.0)
    a, b = L('h3', 'YOIN', "Prendí la linterna. Nico. Raúl...", gap=0.35)
    M('see_nico', a + 1.0 - tl.t + 0.0); M('see_raul', b - 0.55 - tl.t)
    S(sfx_riser(2.4), b - 0.3, 0.6)
    fth = M('fourth', 2.0, adv=True); S(sfx_sting(), fth, 0.95)
    L('h4', 'YOIN', "Entramos tres. Conté cuatro.", gap=0.9)
    ec_ = M('endcard', 0.8, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos qué harías?", gap=0.5)
    W(3.2); dur = tl.t; mk = tl.marks
    dr = drone(dur, 36.7, 340, 31)
    drg = envelope(dur, [(0, 0.6), (mk['knock_stop'], 0.5), (mk['knock_stop'] + 0.3, 0.2), (mk['voice_nico'], 0.4), (mk['bulb_out'], 0.75), (mk['bulb_out'] + 0.2, 0.3), (mk['fourth'], 0.9), (dur, 0.55)])
    sg_ = strings(dur, (277.2, 293.7, 415.3), 41)
    sgg = envelope(dur, [(0, 0), (mk['voice_nico'], 0.0), (mk['buzz3'], 0.5), (mk['voice_mama'], 0.4), (mk['bulb_out'], 1.1), (mk['bulb_out'] + 0.15, 0.0), (mk['flash_on'], 0.2), (mk['fourth'], 1.3), (mk['fourth'] + 0.2, 0.0)])
    hb = sfx_heart(mk['fourth'] - mk['bulb_out'], 80, 4.0)
    beds = [(0, dr * drg, 1.0), (0, sg_ * sgg, 1.0), (mk['bulb_out'], hb, 0.8), (0, roomtone(dur, 50, 62), 0.8)]
    mixdown(tl, dur, beds)

# ================================================================ PART 3
def part3():
    tl = TL("p3"); M, L, W, S = tl.M, tl.L, tl.W, tl.S
    M('title', 0.3); S(sfx_whoosh(), 0.2, 0.5)
    L('h1', 'YOIN', "La seguí alumbrando. Estaba de espaldas. Con la yerba en la mano.", gap=1.2)
    th = M('turnhead', 0.3, adv=True); S(sfx_creak(1.8), th, 0.9); S(sfx_riser(2.0), th, 0.5)
    W(2.0)
    fd = M('flash_die', 0.0); S(sfx_flicker(0.7), fd - 0.6, 0.8); S(sfx_click(), fd, 0.8)
    W(1.1)
    L('c1', 'COSAC', "El vuelto, querido.", gap=0.0)
    sc = M('scream', 0.1, adv=True); S(sfx_scream_hit(), sc, 0.8); S(sfx_sting(1.2), sc, 0.9)
    L('r1', 'RAULSH', "¡Afuera! ¡Afuera, ya!", gap=0.35)
    do = M('door_open', 0.15, adv=True); S(sfx_slam(), do, 0.7); S(sfx_steps(1.2, 4), do - 0.9, 0.7)
    day = M('day', 0.9, adv=True)
    L('pa', 'PA', "Estimados clientes: hoy, yerba en oferta.", gap=0.7, block=False)
    L('h2', 'YOIN', "Afuera era de día. El súper estaba lleno. Como si nada.", gap=1.3)
    L('n1', 'NICOW', "No puede ser... ¿Cuánto tiempo pasó?", gap=0.4)
    M('see_vieja', 0.2)
    L('v1', 'VIEJA', "Ahora sí, querido. Cobrame.", gap=0.6)
    b4 = M('buzz4', 0.3, adv=True); S(sfx_alert(), b4, 0.75)
    L('y1', 'YOLOW', "No salga del refugio. Lo que ve afuera... no es real.", gap=1.3)
    stp = M('stare', 0.45, adv=True)
    W(2.3)
    L('c2', 'TODOS', "Cobranos.", gap=0.0)
    bl = M('blackout', 0.1, adv=True); S(sfx_sting(1.3), bl, 1.0); S(sfx_clunk(1.2), bl, 1.0)
    ec_ = M('endcard', 1.1, adv=True); S(sfx_whoosh(), ec_ - 0.2, 0.6)
    L('q', 'YOIN', "¿Vos hubieras salido?", gap=0.5)
    W(3.6); dur = tl.t; mk = tl.marks
    dr = drone(dur, 36.7, 360, 32)
    drg = envelope(dur, [(0, 0.6), (mk['scream'], 0.9), (mk['day'], 0.9), (mk['day'] + 0.6, 0.0), (mk['buzz4'], 0.0), (mk['stare'], 0.5), (mk['blackout'], 1.0), (dur, 0.55)])
    sg_ = strings(dur, (293.7, 311.1, 466.2), 42)
    sgg = envelope(dur, [(0, 0.3), (mk['flash_die'], 1.2), (mk['flash_die'] + 0.1, 0.0), (mk['buzz4'], 0.0), (mk['stare'], 0.6), (mk['blackout'], 1.5), (mk['blackout'] + 0.15, 0)])
    mz = muzak(mk['stare'] - mk['day'] + 3, 51); cut = int((mk['stare'] - mk['day']) * SR)
    mz = np.concatenate([mz[:cut], sfx_tapestop(mz[cut:], 2.2)])
    cr = crowd(mk['stare'] - mk['day'] + 0.4, 71); cr[-int(0.4 * SR):] *= np.linspace(1, 0, int(0.4 * SR))[:, None]
    hb = sfx_heart(mk['blackout'] - mk['stare'], 84, 6)
    beds = [(0, dr * drg, 1.0), (0, sg_ * sgg, 1.0), (mk['day'], fade(mz, 0.6, 0.05), 0.6), (mk['day'], cr * 2.2, 1.0),
            (0, roomtone(mk['day'], 50, 63), 0.8), (mk['day'], roomtone(dur - mk['day'], 100, 64), 0.5), (mk['stare'], hb, 0.9)]
    mixdown(tl, dur, beds)

if __name__ == "__main__":
    for p in (sys.argv[1:] or ["1", "2", "3"]): {"1": part1, "2": part2, "3": part3}[p]()

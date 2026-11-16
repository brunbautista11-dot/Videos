# Series diarias (ciclos de 3 días)

Cada historia vive en `series/cNN-<slug>/` con `guion.md`, `scene.js` y `build_audio.py` (las TRES partes ya programadas).
El código común está en `series/lib/` (extraído del motor de NO ABRAS): `core.js` (three.js: personajes, cámara, brazos POV,
subtítulos karaoke, título dorado, tarjeta final), `index.html`, `render.py`, `audio_core.py` (voces edge-tts, efectos, mezcla).

## Preparar (sesión nueva)
```
mkdir -p /home/claude/work/eng && cd /home/claude/work/eng && npm i three@0.170
pip install --break-system-packages edge-tts playwright scipy numpy
```
## Producir la parte N de una historia (desde la raíz del repo)
```
series/run.sh audio  cNN-slug N            # voces + mezcla + tiempos
series/run.sh still  cNN-slug N 1,5,9,...  # fotogramas en /home/claude/work/cNN-slug/stills  (MIRARLOS)
series/run.sh render cNN-slug N            # -> /home/claude/work/cNN-slug/final/parte-N.mp4 (1080x1920, <95 MB)
cp /home/claude/work/cNN-slug/final/parte-N.mp4 series/cNN-slug/parte-N.mp4
```
Rinde ~0.8–1 s por fotograma con dos segmentos en paralelo (un video de 50 s ≈ 12–14 min). Renderizar de a un video por vez.
Los tiempos de cada escena salen de las marcas `M(...)` y líneas `L(...)` del audio, así que si se cambia el audio hay que volver a mirar fotogramas.

# Motor de mini-series POV de terror (Shorts 1080x1920)

Motor con el que se hizo "NO ABRAS" (3 partes). Sirve de base para cada historia nueva.

## Preparar (sesión nueva)
```
mkdir -p /home/claude/work && cp -r engine/eng engine/tts /home/claude/work/ && cp engine/mux.sh /home/claude/work/
cd /home/claude/work/eng && npm i three@0.170
pip install --break-system-packages edge-tts playwright scipy numpy
```
Necesita `/usr/bin/google-chrome` y `ffmpeg`.

## Flujo
1. `tts/build_audio.py` — guion por parte (`part1/2/3`): líneas `L(id, voz, texto)`, marcas `M(nombre)` y efectos `S(...)`.
   Genera voces neuronales (edge-tts, acento rioplatense, por el proxy de la sesión), efectos y música con numpy,
   y escribe `tts/out/pN.wav` + `tts/out/pN.json` (tiempos de cada línea, palabra y marca).
2. `eng/scene.js` — escena 3D (three.js): decorados, personajes (`makeChar`/`pose`), brazos POV, cámara por keyframes (`path`),
   luces (`env`), y overlay HTML (subtítulos karaoke, alerta, título dorado, tarjeta final). Una función por parte (`P1/P2/P3`)
   que es función pura del tiempo `t` y lee los tiempos de `pN.json`.
3. `python3 render.py still N t1,t2,...` — fotogramas de prueba en `/home/claude/work/stills` (MIRARLOS antes del render completo).
4. `python3 render.py seg N f0 f1 salida.mp4` — render por segmentos (2 en paralelo), luego `mux.sh` une y agrega el audio.
5. Comprimir: `ffmpeg -i final.mp4 -c:v libx264 -preset fast -crf 23 -maxrate 9M -bufsize 18M -c:a copy out.mp4`.

Rinde ~0.4–1.0 s por fotograma (3D a 720x1280 escalado, overlay nativo a 1080x1920).

## Para una historia nueva
Copiar `scene.js` y cambiar: decorados (sección "world"), personajes, y las funciones `P1/P2/P3`;
copiar `build_audio.py` y cambiar `part1/2/3`. Mantener: subtítulos, título dorado, tarjeta final con pregunta, voces y mezcla.

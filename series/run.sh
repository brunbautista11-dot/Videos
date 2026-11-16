#!/bin/bash
# Uso (desde la raíz del repo):
#   series/run.sh audio  <carpeta> <N>            -> voces + mezcla + tiempos (tts/out/pN.wav|json)
#   series/run.sh still  <carpeta> <N> t1,t2,...  -> fotogramas de prueba en /home/claude/work/<carpeta>/stills
#   series/run.sh render <carpeta> <N>            -> /home/claude/work/<carpeta>/final/parte-N.mp4 (ya comprimido)
set -e
REPO=$(cd "$(dirname "$0")/.." && pwd); D=$2; N=$3; W=/home/claude/work/$D
mkdir -p $W/eng $W/tts $W/seg $W/final
cp $REPO/series/lib/core.js $REPO/series/lib/index.html $REPO/series/lib/render.py $REPO/series/$D/scene.js $W/eng/
cp $REPO/series/lib/audio_core.py $REPO/series/$D/build_audio.py $W/tts/
[ -e $W/eng/node_modules ] || ln -s /home/claude/work/eng/node_modules $W/eng/node_modules
case $1 in
  audio) cd $W/tts && python3 build_audio.py $N ;;
  still) ROOT=$W python3 $W/eng/render.py still $N $4 ;;
  render)
    F=$(python3 -c "import json;print(int(json.load(open('$W/tts/out/p$N.json'))['dur']*30))"); H=$((F/2))
    ROOT=$W python3 $W/eng/render.py seg $N 0 $H $W/seg/p${N}_0.mp4 &
    ROOT=$W python3 $W/eng/render.py seg $N $H $F $W/seg/p${N}_1.mp4 &
    wait
    printf "file '$W/seg/p${N}_0.mp4'\nfile '$W/seg/p${N}_1.mp4'\n" > $W/seg/cat$N.txt
    ffmpeg -v error -y -f concat -safe 0 -i $W/seg/cat$N.txt -i $W/tts/out/p$N.wav -map 0:v -map 1:a -c:v libx264 -preset fast -crf 21 -maxrate 9M -bufsize 18M -pix_fmt yuv420p \
      -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 192k -movflags +faststart -shortest $W/final/parte-$N.mp4
    ffprobe -v error -show_entries format=duration,size -of csv=p=0 $W/final/parte-$N.mp4 ;;
esac

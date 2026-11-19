#!/bin/bash
# Uso (desde la raíz del repo): virales/2026-11-19/run.sh audio|still|render N [t1,t2,...]   (N = 1, 2 o 3)
set -e
REPO=$(cd "$(dirname "$0")/../.." && pwd); D=$REPO/virales/2026-11-19; N=$2; W=/home/claude/work/v1119
mkdir -p $W/eng $W/tts $W/seg $W/final
cp $REPO/series/lib/core.js $REPO/series/lib/index.html $REPO/series/lib/render.py $D/scene.js $W/eng/
cp $REPO/series/lib/audio_core.py $D/build_audio.py $W/tts/
[ -e $W/eng/node_modules ] || ln -s /home/claude/work/eng/node_modules $W/eng/node_modules
case $1 in
  audio) cd $W/tts && python3 build_audio.py $N ;;
  still) ROOT=$W python3 $W/eng/render.py still $N $3 ;;
  render)
    F=$(python3 -c "import json;print(int(json.load(open('$W/tts/out/p$N.json'))['dur']*30))"); H=$((F/2))
    ROOT=$W python3 $W/eng/render.py seg $N 0 $H $W/seg/p${N}_0.mp4 &
    ROOT=$W python3 $W/eng/render.py seg $N $H $F $W/seg/p${N}_1.mp4 &
    wait
    printf "file '$W/seg/p${N}_0.mp4'\nfile '$W/seg/p${N}_1.mp4'\n" > $W/seg/cat$N.txt
    ffmpeg -v error -y -f concat -safe 0 -i $W/seg/cat$N.txt -i $W/tts/out/p$N.wav -map 0:v -map 1:a -c:v libx264 -preset fast -crf 21 -maxrate 9M -bufsize 18M -pix_fmt yuv420p \
      -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 192k -movflags +faststart -shortest $W/final/viral-$N.mp4
    ffprobe -v error -show_entries format=duration,size -of csv=p=0 $W/final/viral-$N.mp4 ;;
esac

set -e
cd /home/claude/work; mkdir -p final
for p in 1 2 3; do
  printf "file 'seg/p${p}_0.mp4'\nfile 'seg/p${p}_1.mp4'\nfile 'seg/p${p}_2.mp4'\n" > cat$p.txt
  ffmpeg -v error -y -f concat -safe 0 -i cat$p.txt -c copy seg/p${p}_v.mp4
  ffmpeg -v error -y -i seg/p${p}_v.mp4 -i tts/out/p$p.wav -map 0:v -map 1:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000" -c:a aac -b:a 192k -movflags +faststart -shortest "final/NO_ABRAS_parte_$p.mp4"
  ffprobe -v error -show_entries format=duration,size -of csv=p=0 "final/NO_ABRAS_parte_$p.mp4"
done

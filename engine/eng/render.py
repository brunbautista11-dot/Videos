#!/usr/bin/env python3
"""render.py still P t1,t2,..   |   render.py seg P f0 f1 out.mp4"""
import sys, time, threading, http.server, os, subprocess
from playwright.sync_api import sync_playwright
ROOT='/home/claude/work'; FPS=30
class Q(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=ROOT,**k)
    def log_message(s,*a): pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),Q); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
mode,part=sys.argv[1],sys.argv[2]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox','--no-proxy-server','--force-color-profile=srgb','--disable-lcd-text'])
    pg=b.new_page(viewport={'width':1080,'height':1920})
    pg.on('console',lambda m: m.type=='error' and print('C',m.text,file=sys.stderr)); pg.on('pageerror',lambda e:print('PAGEERR',e,file=sys.stderr))
    pg.goto(f'http://127.0.0.1:{port}/eng/index.html?p={part}'); pg.wait_for_function('window.ready==1',timeout=120000)
    if mode=='still':
        os.makedirs(f'{ROOT}/stills',exist_ok=True)
        for ts in sys.argv[3].split(','):
            t0=time.time(); pg.evaluate(f'renderAt({ts})'); d=pg.screenshot(type='jpeg',quality=88)
            open(f'{ROOT}/stills/p{part}_{float(ts):06.2f}.jpg','wb').write(d); print(ts,round(time.time()-t0,2),flush=True)
    else:
        f0,f1,out=int(sys.argv[3]),int(sys.argv[4]),sys.argv[5]; tmp=out.replace('.mp4','.part.mp4')
        ff=subprocess.Popen(['ffmpeg','-v','error','-y','-f','image2pipe','-c:v','mjpeg','-framerate',str(FPS),'-i','-','-c:v','libx264','-crf','17','-preset','veryfast','-pix_fmt','yuv420p','-color_range','tv','-vf','scale=in_range=pc:out_range=tv','-r',str(FPS),tmp],stdin=subprocess.PIPE)
        pg.evaluate(f'renderAt({f0/FPS})'); pg.evaluate(f'renderAt({f0/FPS})'); t0=time.time()
        for f in range(f0,f1):
            pg.evaluate(f'renderAt({f/FPS})'); ff.stdin.write(pg.screenshot(type='jpeg',quality=92))
            if (f-f0)%60==0: print(part,f,f1,round((time.time()-t0)/max(1,f-f0),2),'s/f',flush=True)
        ff.stdin.close(); rc=ff.wait()
        if rc==0: os.replace(tmp,out); print('DONE',out,flush=True)
        else: sys.exit(rc)
    b.close()

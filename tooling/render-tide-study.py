"""Regenerate Tidepool's original schematic: Pillow plus an ffmpeg executable.

python tooling/render-tide-study.py --ffmpeg PATH
The result is synthetic illustrative geometry, not field observations. CC0.
No renderer is needed by a generated world; it ships the resulting small MP4.
"""
import argparse, math, pathlib, subprocess
from PIL import Image, ImageDraw
p=argparse.ArgumentParser();p.add_argument('--ffmpeg',required=True);args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'packs/media/assets/tide-study.mp4';out.parent.mkdir(parents=True,exist_ok=True)
cmd=[args.ffmpeg,'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','800x450','-r','20','-i','-','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
for n in range(160):
 im=Image.new('RGB',(800,450),'#ebe5d2');d=ImageDraw.Draw(im)
 for x in range(0,800,40):d.line((x,0,x,450),fill='#d8d2be')
 for y in range(10,450,40):d.line((0,y,800,y),fill='#d8d2be')
 shoreline=[(x,260+35*math.sin(x/125)) for x in range(0,801,4)]
 water=[(x,190+40*math.sin(x/140+n/22)) for x in range(0,801,4)]
 d.polygon(water+[(800,450),(0,450)],fill='#76b5ad')
 d.line(shoreline,fill='#16494c',width=4)
 for x,y in [(130,270),(370,253),(600,227)]:
  d.ellipse((x-6,y-6,x+6,y+6),fill='#d2684e',outline='#f7f0dc',width=2)
 d.rectangle((24,22,330,83),fill='#f8f2df');d.text((38,34),'TIDEPOOL / WATERLINE STUDY 01',fill='#16494c');d.text((38,58),'SYNTHETIC DIAGRAM - NOT FIELD DATA',fill='#16494c')
 d.text((30,422),'FIXED SURVEY MARKS / CHANGING WATERLINE',fill='#16494c')
 proc.stdin.write(im.tobytes())
proc.stdin.close();err=proc.stderr.read();status=proc.wait()
if status:raise RuntimeError(err.decode())
print(out)

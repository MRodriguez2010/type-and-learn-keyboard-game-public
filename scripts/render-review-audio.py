"""Render reviewed cue text using local eSpeak NG and FFmpeg."""
from pathlib import Path
import os,subprocess,json,sys,tempfile
from concurrent.futures import ThreadPoolExecutor

def render(row):
 path=Path(row['path'])
 if not path.is_relative_to('public/audio') or '..' in path.parts:raise ValueError(path)
 voice={'en-US':'en-us','es-419':'es-la'}[row['language']]
 path.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory() as tmp:
  wav=Path(tmp)/'cue.wav'
  args=[os.environ.get('ESPEAK_BIN','espeak-ng')]
  if os.environ.get('ESPEAK_LIBDIR'):args+=['--path='+os.environ['ESPEAK_LIBDIR']]
  subprocess.run(args+['-v',voice,'-s','145','-w',str(wav),'--stdin'],input=row['text'].encode(),check=True)
  subprocess.run(['ffmpeg','-loglevel','error','-i',wav,'-map_metadata','-1','-y','-af','apad=pad_dur=0.35','-ar','44100','-b:a','192k',path],check=True)

if __name__=='__main__':
 cues=json.loads(subprocess.check_output(['node','--experimental-strip-types','scripts/generate-voice-pack.mjs']))
 with ThreadPoolExecutor(max_workers=3) as pool:list(pool.map(render,cues))
 print('Rendered',len(cues),'educational prompts.')

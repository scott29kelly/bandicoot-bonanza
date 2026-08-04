#!/usr/bin/env node
/**
 * Generate the ElevenLabs audio pack for Bandicoot Bonanza and bake it into
 * index.html as base64 mp3 clips between the AUDIO_PACK markers.
 *
 * Usage:
 *   node tools/generate_audio_pack.mjs [options]
 *
 * The API key is read from ELEVENLABS_API_KEY — either already exported in the
 * environment, or set in a .env file at the repo root (copy .env.example).
 * .env is gitignored; the key is never written anywhere else.
 *
 * Options:
 *   --voice <id>    ElevenLabs voice id for the announcer (default: Rachel)
 *   --only <set>    Comma list of groups to (re)generate: voice,sfx,music
 *   --out <file>    Also dump the raw pack JSON here (for inspection/reuse)
 *
 * The API key is read from the environment only and is never written to disk.
 * Clips are requested at low bitrate (mp3 22.05kHz/32kbps) to keep index.html
 * small. Re-running only replaces the block between the markers; the game
 * falls back to its procedural synth for any clip that is missing.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

// load .env from the repo root if present (simple KEY=value lines, no dependency)
const envPath=path.join(root,'.env');
if(!process.env.ELEVENLABS_API_KEY&&fs.existsSync(envPath)){
  for(const line of fs.readFileSync(envPath,'utf8').split('\n')){
    const m=line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if(m&&m[2]&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');
  }
}

const API='https://api.elevenlabs.io/v1';
const KEY=process.env.ELEVENLABS_API_KEY;
if(!KEY){
  console.error('ELEVENLABS_API_KEY is not set (export it or put it in .env — see .env.example). Aborting; nothing was modified.');
  process.exit(1);
}

const args=process.argv.slice(2);
const opt=(name,dflt)=>{const i=args.indexOf('--'+name);return i>=0?args[i+1]:dflt;};
const VOICE=opt('voice','21m00Tcm4TlvDq8ikWAM'); // "Rachel" premade voice
const ONLY=(opt('only','voice,sfx,music')).split(',');
const OUT=opt('out',null);

const VOICE_LINES={
  vo_intro:'Bandicoot Bonanza! Ready... set... go!',
  vo_checkpoint:'Checkpoint!',
  vo_gameover:'Game over... better luck next time!',
  vo_victory:'You made it! Incredible!',
  vo_perfect:'Perfect run! Absolutely bonzer!'
};
const SFX={
  jump:{text:'short cartoon jump boing, bouncy and springy, video game sound effect',dur:0.7},
  doublejump:{text:'quick double boing jump with rising pitch, cartoon video game sound effect',dur:0.8},
  spin:{text:'fast spinning whoosh tornado twirl, short cartoon video game sound effect',dur:0.7},
  bounce:{text:'big springy trampoline bounce, cartoon video game sound effect',dur:0.8},
  crate:{text:'wooden crate smashing into planks, short cartoon video game sound effect',dur:0.8},
  fruit:{text:'bright sparkly fruit pickup chime, short cheerful video game collect sound',dur:0.5},
  fuse:{text:'single short fuse tick spark, tiny video game sound effect',dur:0.4},
  explosion:{text:'cartoon TNT barrel explosion with deep boom, video game sound effect',dur:1.5},
  checkpoint:{text:'magical ascending chime arpeggio, checkpoint activation, video game sound effect',dur:1.2},
  hurt:{text:'cartoon character yelp ouch, short video game hit sound',dur:0.6},
  fanfare:{text:'short triumphant victory fanfare with drums, cartoon video game jingle',dur:3},
  gameover_jingle:{text:'sad descending game over jingle, short cartoon video game music',dur:2.5}
};
const MUSIC={
  music:{text:'upbeat tropical jungle adventure video game music loop, marimba, bongos, playful flute, seamless loop',dur:20}
};

async function post(url,body){
  const res=await fetch(url,{
    method:'POST',
    headers:{'xi-api-key':KEY,'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });
  if(!res.ok){
    const t=await res.text().catch(()=> '');
    throw new Error('HTTP '+res.status+' from '+url+': '+t.slice(0,300));
  }
  return Buffer.from(await res.arrayBuffer());
}
const tts=(text)=>post(API+'/text-to-speech/'+VOICE+'?output_format=mp3_22050_32',
  {text,model_id:'eleven_multilingual_v2'});
const sfx=(text,dur)=>post(API+'/sound-generation?output_format=mp3_22050_32',
  {text,duration_seconds:dur,prompt_influence:0.5});

const pack={};
const gen=async(name,fn)=>{
  process.stdout.write('  '+name+' ... ');
  try{
    const buf=await fn();
    pack[name]=buf.toString('base64');
    console.log((buf.length/1024).toFixed(1)+' KB');
  }catch(e){
    console.log('FAILED: '+e.message+' (game will use procedural fallback)');
  }
  await new Promise(r=>setTimeout(r,400)); // gentle rate limiting
};

if(ONLY.includes('voice')){
  console.log('Voice lines (voice '+VOICE+'):');
  for(const[k,text]of Object.entries(VOICE_LINES))await gen(k,()=>tts(text));
}
if(ONLY.includes('sfx')){
  console.log('Sound effects:');
  for(const[k,v]of Object.entries(SFX))await gen(k,()=>sfx(v.text,v.dur));
}
if(ONLY.includes('music')){
  console.log('Music loop:');
  for(const[k,v]of Object.entries(MUSIC))await gen(k,()=>sfx(v.text,v.dur));
}

if(!Object.keys(pack).length){
  console.error('No clips generated; index.html left untouched.');
  process.exit(1);
}

const htmlPath=path.join(root,'index.html');
let html=fs.readFileSync(htmlPath,'utf8');
const START='/*__AUDIO_PACK_START__*/',END='/*__AUDIO_PACK_END__*/';
const a=html.indexOf(START),b=html.indexOf(END);
if(a<0||b<0){console.error('AUDIO_PACK markers not found in index.html');process.exit(1);}

// merge with any clips already baked in (so --only re-runs keep the rest)
const existing=html.slice(a+START.length,b);
const m=existing.match(/const AUDIO_PACK=(\{[\s\S]*\});/);
let merged={};
if(m){try{merged=JSON.parse(m[1]);}catch(e){merged={};}}
Object.assign(merged,pack);

const block=START+'\nconst AUDIO_PACK='+JSON.stringify(merged)+';\n'+END;
html=html.slice(0,a)+block+html.slice(b+END.length);
fs.writeFileSync(htmlPath,html);
if(OUT)fs.writeFileSync(OUT,JSON.stringify(merged));

const total=Object.values(merged).reduce((n,s)=>n+s.length*0.75,0);
console.log('\nBaked '+Object.keys(pack).length+' new clip(s), '+Object.keys(merged).length+
  ' total ('+(total/1024/1024).toFixed(2)+' MB of audio) into index.html');

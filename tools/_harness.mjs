/**
 * Shared plumbing for the review tools: browser launch, page URL, boot wait.
 *
 * The game is a single file with no build step, so there is no dev server —
 * tools address index.html directly over file://. Three.js still comes from
 * the CDN, so these tools need the network exactly as a player does.
 */
import {chromium} from 'playwright';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Parse `--flag value` / `--flag` into an object. */
export function parseArgs(argv){
  const out={};
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(!a.startsWith('--'))continue;
    const next=argv[i+1];
    if(next!==undefined&&!next.startsWith('--')){out[a.slice(2)]=next;i++;}
    else out[a.slice(2)]=true;
  }
  return out;
}

/**
 * Headless Chromium renders WebGL through SwiftShader (software) by default.
 * That is SLOW with the bloom chain but it is also perfectly repeatable, which
 * is what a build-to-build comparison needs — a shot sheet is a correctness
 * artifact, not a performance measurement. Read fps from a real browser
 * (F3 in-game), never from these captures.
 */
export async function launch(opts={}){
  return chromium.launch({
    headless: opts.headed?false:true,
    args:[
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
      '--disable-lcd-text',
      '--force-color-profile=srgb',
      '--hide-scrollbars',
      '--mute-audio'
    ]
  });
}

/** file:// URL for index.html with the given query params. */
export function gameUrl(params={}){
  const u=pathToFileURL(path.join(ROOT,'index.html'));
  for(const [k,v] of Object.entries(params)){
    if(v===undefined||v===null||v===false)continue;
    u.searchParams.set(k,v===true?'1':String(v));
  }
  return u.href;
}

/** Navigate, wait for BB.ready, and fail loudly on a boot error. */
export async function boot(page,url,timeoutMs=120000){
  page.on('pageerror',err=>console.error('[pageerror]',err.message));
  page.on('console',m=>{if(m.type()==='error')console.error('[console]',m.text());});
  page.setDefaultNavigationTimeout(timeoutMs);
  const t0=Date.now();
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.BB&&window.BB.ready,undefined,{timeout:timeoutMs,polling:100});
  const err=await page.evaluate(()=>window.BB.error);
  if(err)throw new Error('game reported a fatal error: '+err);
  console.log(`[boot] ready in ${((Date.now()-t0)/1000).toFixed(1)}s  ${url}`);
}

/**
 * Pin the world before capturing anything: a fixed timestep and a hidden DOM
 * UI. Without the fixed dt, N settle frames advance the world by a different
 * amount every run and two sheets stop being comparable.
 */
export async function pin(page,dt=1/60){
  await page.evaluate(d=>{window.BB.setFixedDt(d);window.BB.setUI(false);},dt);
}

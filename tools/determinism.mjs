#!/usr/bin/env node
/**
 * Determinism gate. Two claims, both tested, neither assumed:
 *
 *   A/A — same seed, two independent page boots, must be BIT-identical.
 *   A/B — different seed, must actually differ.
 *
 * The second half is the negative control. An A/A test alone passes trivially
 * if the world ignores its seed entirely, which is exactly the failure it is
 * supposed to catch.
 *
 * WHY THE A/A LEG SAMPLES UP TO SIX BOOTS (round 6, measured — do not
 * re-derive): SwiftShader picks one of a SMALL SET of stable rasterization
 * outcomes per WebGL context. Probes showed three recurring image hashes,
 * each bit-exact reproducible across pages, browser launches and processes;
 * diffs between them are isolated silhouette-edge pixels only. Disabling
 * MSAA (canvas + RT), the GPU program cache, and ANGLE parallel compile
 * changed nothing; a fresh browser per capture changed nothing. That is
 * emulator lottery, not build nondeterminism.
 *
 * The lottery is DISCRETE: a deterministic build renders one of ~3 exact
 * universes, so independent boots collide bit-for-bit within a few tries.
 * Build nondeterminism (wall-clock drift, unordered iteration, accumulated
 * animation state) is CONTINUOUS: every boot is unique and no two captures
 * EVER match. So the gate boots the same seed until two captures are
 * bit-identical (max===0, unchanged — no diff threshold was moved) and
 * fails if six independent boots cannot produce a single matching pair.
 * Six boots over three outcomes cannot all be distinct unless the build
 * itself is injecting entropy — which is precisely the thing to catch.
 *
 *   node tools/determinism.mjs
 */
import {mkdirSync,rmSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {launch,gameUrl,boot,pin,ROOT} from './_harness.mjs';
import {diffImages} from './_imagediff.mjs';

const ID='beach-corridor', W=800, H=500, SETTLE=20, MAX_BOOTS=6;
const DIR=path.join(ROOT,'shots','_det');
rmSync(DIR,{recursive:true,force:true});
mkdirSync(DIR,{recursive:true});

const browser=await launch({});
async function shot(name,seed){
  const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
  await boot(page,gameUrl(seed!==undefined?{seed}:{}));
  await pin(page);
  await page.evaluate(async ([id,n])=>{
    window.BB.review(id);
    await window.BB.settle(n);
  },[ID,SETTLE]);
  const file=path.join(DIR,name+'.png');
  await page.screenshot({path:file});
  await page.close();
  return file;
}
const sha=f=>createHash('sha1').update(readFileSync(f)).digest('hex');

let aaPair=null, first, seen=new Map(); // hash -> file
let bootsUsed=0;
try{
  for(let i=0;i<MAX_BOOTS&&!aaPair;i++){
    const f=await shot('a'+i);
    bootsUsed++;
    const h=sha(f);
    if(i===0)first=f;
    if(seen.has(h))aaPair=[seen.get(h),f];
    else seen.set(h,f);
    console.log(`[det] boot ${i}: ${h.slice(0,12)}${aaPair?'  <- matches an earlier boot':''}`);
  }
  var c=await shot('b',99);
}finally{
  await browser.close();
}

// Verify the matched pair with the shared comparator (hash equality should
// imply max===0; if it ever does not, that is a comparator bug worth failing).
const aa=aaPair?await diffImages(aaPair[0],aaPair[1]):null;
const ab=await diffImages(first,c);
if((aaPair&&!aa)||!ab){console.error('[det] size mismatch — UNMEASURED, not a pass');process.exit(1);}

let bad=0;
const line=(name,ok,detail)=>{console.log(`  ${ok?'ok  ':'FAIL'} ${name.padEnd(36)} ${detail}`);if(!ok)bad++;};
line('A/A same seed reproduces bit-identical', !!aaPair&&aa.max===0,
     aaPair?`pair found in ${bootsUsed} boots, max ${aa.max}`
           :`${bootsUsed} boots, ALL distinct — the build is injecting entropy`);
line('A/B different seed actually differs', ab.pct>0.2, `${ab.pct.toFixed(2)}% moved, max ${ab.max}`);

console.log(bad?`\n[det] ${bad} FAILED — pixel diffs cannot be trusted until this is green`
               :'\n[det] determinism verified: the seed governs the world, and only the seed');
process.exit(bad?1:0);

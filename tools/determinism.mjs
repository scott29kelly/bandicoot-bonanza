#!/usr/bin/env node
/**
 * Determinism gate. Two claims, both tested, neither assumed:
 *
 *   A/A — same seed, two separate runs, must be BIT-identical.
 *   A/B — different seed, must actually differ.
 *
 * The second half is the negative control. An A/A test alone passes trivially
 * if the world ignores its seed entirely, which is exactly the failure it is
 * supposed to catch.
 *
 * Every pixel diff in the loop rests on this. A diff you cannot trust at zero
 * is a diff you cannot trust anywhere: the previous attempt spent a round
 * chasing a 0.06% "change" that was nothing but animation phase drift.
 *
 *   node tools/determinism.mjs
 */
import {execFileSync} from 'node:child_process';
import {rmSync} from 'node:fs';
import path from 'node:path';
import {ROOT} from './_harness.mjs';
import {diffImages} from './_imagediff.mjs';

const ID='beach-corridor', W=800, H=500;
const shot=(dir,seed)=>{
  const a=['tools/shots.mjs','--dir',dir,'--only',ID,'--w',String(W),'--h',String(H),
           '--settle','20','--nosheet'];
  if(seed!==undefined)a.push('--seed',String(seed));
  execFileSync(process.execPath,a,{cwd:ROOT,stdio:'ignore'});
  return path.join(ROOT,dir,ID+'.png');
};

for(const d of ['shots/_det-a','shots/_det-b','shots/_det-c'])rmSync(path.join(ROOT,d),{recursive:true,force:true});
console.log('[det] shooting three captures …');
const a=shot('shots/_det-a'), b=shot('shots/_det-b'), c=shot('shots/_det-c',99);

const aa=await diffImages(a,b);
const ab=await diffImages(a,c);
if(!aa||!ab){console.error('[det] size mismatch — UNMEASURED, not a pass');process.exit(1);}

let bad=0;
const line=(name,ok,detail)=>{console.log(`  ${ok?'ok  ':'FAIL'} ${name.padEnd(34)} ${detail}`);if(!ok)bad++;};
line('A/A same seed is bit-identical', aa.max===0, `${aa.pct.toFixed(2)}% moved, max ${aa.max}`);
line('A/B different seed actually differs', ab.pct>0.2, `${ab.pct.toFixed(2)}% moved, max ${ab.max}`);

console.log(bad?`\n[det] ${bad} FAILED — pixel diffs cannot be trusted until this is green`
               :'\n[det] determinism verified: the seed governs the world, and only the seed');
process.exit(bad?1:0);

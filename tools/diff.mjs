#!/usr/bin/env node
/**
 * Pixel diff between two captures of the same framing — the A/B half of the
 * reference-delta loop, and the way to check that an effect is actually doing
 * something rather than only appearing to.
 *
 *   node tools/diff.mjs --a shots/before/crate-cluster.png --b shots/after/crate-cluster.png
 *   node tools/diff.mjs --a shots/ao-on --b shots/ao-off        (whole directories)
 *
 * Reports the share of pixels that moved, the mean and max delta, and writes
 * an amplified difference image so the change can be SEEN, not just counted.
 * A change that reads as obvious to the eye but moves 0.1% of pixels by 1/255
 * is a change you imagined.
 */
import {readdirSync, existsSync, statSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {parseArgs} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));
if(!args.a||!args.b){
  console.error('need --a <img|dir> --b <img|dir> [--out dir] [--amp N]');
  process.exit(1);
}
const AMP=Number(args.amp??8);
const OUT=String(args.out??'shots/diff');

async function diffPair(a,b,outFile){
  const [ra,rb]=await Promise.all([
    sharp(a).raw().toBuffer({resolveWithObject:true}),
    sharp(b).raw().toBuffer({resolveWithObject:true})
  ]);
  if(ra.info.width!==rb.info.width||ra.info.height!==rb.info.height){
    console.log(`  ${path.basename(a)}: SIZE MISMATCH ${ra.info.width}x${ra.info.height} vs ${rb.info.width}x${rb.info.height} — UNMEASURED`);
    return null;
  }
  const n=ra.info.width*ra.info.height, ch=ra.info.channels;
  const out=Buffer.alloc(n*3);
  let moved=0,sum=0,max=0;
  for(let i=0;i<n;i++){
    const ia=i*ch, ib=i*rb.info.channels;
    const dr=Math.abs(ra.data[ia]-rb.data[ib]);
    const dg=Math.abs(ra.data[ia+1]-rb.data[ib+1]);
    const db=Math.abs(ra.data[ia+2]-rb.data[ib+2]);
    const d=(dr+dg+db)/3;
    if(d>1)moved++;
    sum+=d; if(d>max)max=d;
    const v=Math.min(255,d*AMP);
    out[i*3]=v;out[i*3+1]=v;out[i*3+2]=v;
  }
  mkdirSync(path.dirname(outFile),{recursive:true});
  await sharp(out,{raw:{width:ra.info.width,height:ra.info.height,channels:3}}).png().toFile(outFile);
  const pct=moved/n*100;
  console.log(`  ${path.basename(a).padEnd(22)} ${pct.toFixed(2).padStart(6)}% moved   mean ${(sum/n).toFixed(2).padStart(6)}/255   max ${max.toString().padStart(3)}   -> ${outFile}`);
  return {pct,mean:sum/n,max};
}

const isDir=p=>existsSync(p)&&statSync(p).isDirectory();

if(isDir(String(args.a))&&isDir(String(args.b))){
  const files=readdirSync(String(args.a)).filter(f=>f.endsWith('.png')&&f!=='CONTACT-SHEET.png');
  let any=false;
  for(const f of files){
    const b=path.join(String(args.b),f);
    if(!existsSync(b)){console.log(`  ${f}: missing on the B side — UNMEASURED`);continue;}
    const r=await diffPair(path.join(String(args.a),f),b,path.join(OUT,f));
    if(r&&r.pct>0.5)any=true;
  }
  console.log(any?'[diff] the two sets differ materially':'[diff] the two sets are effectively identical');
}else{
  await diffPair(String(args.a),String(args.b),path.join(OUT,'diff.png'));
}

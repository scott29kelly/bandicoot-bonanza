#!/usr/bin/env node
/**
 * Atmosphere washout probe — quantifies the "midtone/distance washout" gap
 * named by the pass-19 critique, so a fog re-author can be judged by numbers
 * as well as by eye.
 *
 *   node tools/washout.mjs --dir docs/shots/pass19
 *   node tools/washout.mjs --a docs/shots/pass19 --b docs/shots/pass20
 *
 * What it measures per framing (row bands, top->bottom):
 *   BAND  rows 0-28%    sky+far silhouette band (call it FAR)
 *   BAND  rows 28-55%   far-mid field                          (MIDFAR)
 *   BAND  rows 55-100%  gameplay near field                    (NEAR)
 *
 *   sat    mean HSV saturation          — washout = saturation collapsing
 *                                         with distance
 *   val    mean HSV value               — pale-lift = value rising with
 *                                         distance while sat falls
 *   spread std dev of luma              — washout compresses value range
 *   pale   % pixels sat<0.10 && val>0.72 — the literal "washed to pale" share
 *
 * Verdict line per framing: WASHOUT if (sat FAR + 0.05 < sat NEAR) or
 * pale share > 18%, i.e. distance trades saturation for paleness.
 */
import {readdirSync, existsSync, statSync} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {parseArgs} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));

function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  return {s:mx===0?0:d/mx,v:mx,l:0.2126*r+0.7152*g+0.0722*b};
}

async function probe(file){
  const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
  const bands=[
    {name:'FAR   ',y0:0,y1:Math.round(info.height*0.28)},
    {name:'MIDFAR',y0:Math.round(info.height*0.28),y1:Math.round(info.height*0.55)},
    {name:'NEAR  ',y0:Math.round(info.height*0.55),y1:info.height}
  ];
  const out={file:path.basename(file),bands:[],pale:0,n:0};
  for(const b of bands){
    let sSum=0,vSum=0,lSum=0,l2Sum=0,n=0,pale=0;
    for(let y=b.y0;y<b.y1;y+=2)for(let x=0;x<info.width;x+=2){
      const i=(y*info.width+x)*info.channels;
      const {s,v,l}=rgbToHsv(data[i],data[i+1],data[i+2]);
      sSum+=s;vSum+=v;lSum+=l;l2Sum+=l*l;n++;
      if(s<0.10&&v>0.72)pale++;
      if(b.name==='NEAR  '){out.pale+=pale&&0;} // pale counted per-band below
    }
    const mean=lSum/n;
    b.sat=sSum/n;b.val=vSum/n;
    b.spread=Math.sqrt(Math.max(0,l2Sum/n-mean*mean));
    b.pale=pale/n*100;
    out.bands.push(b);
  }
  // whole-frame pale share
  let paleN=0,tot=0;
  for(let y=0;y<info.height;y+=2)for(let x=0;x<info.width;x+=2){
    const i=(y*info.width+x)*info.channels;
    const {s,v}=rgbToHsv(data[i],data[i+1],data[i+2]);
    if(s<0.10&&v>0.72)paleN++;
    tot++;
  }
  out.pale=paleN/tot*100;
  return out;
}

const WASH=(r)=>r.bands[0].sat+0.05<r.bands[2].sat||r.pale>18;

async function runDir(dir){
  const files=readdirSync(dir).filter(f=>f.endsWith('.png')&&f!=='CONTACT-SHEET.png').sort();
  const results=[];
  for(const f of files){
    const r=await probe(path.join(dir,f));
    results.push(r);
    console.log(`${r.file.replace('.png','').padEnd(16)} ${WASH(r)?'WASHOUT':'   ok  '}  pale ${r.pale.toFixed(1).padStart(5)}%`);
    for(const b of r.bands)
      console.log(`    ${b.name} sat ${b.sat.toFixed(3)}  val ${b.val.toFixed(3)}  spread ${b.spread.toFixed(3)}  pale ${b.pale.toFixed(1)}%`);
  }
  return results;
}

if(args.dir){
  await runDir(String(args.dir));
}else if(args.a){
  const A=await runDir(String(args.a));
  if(args.b){
    console.log('\n=== B ===');
    const B=await runDir(String(args.b));
    console.log('\n=== A->B delta (positive = saturation gained) ===');
    for(const ra of A){
      const rb=B.find(x=>x.file===ra.file);
      if(!rb)continue;
      const dFar=rb.bands[0].sat-ra.bands[0].sat;
      const dPale=ra.pale-rb.pale;
      console.log(`${ra.file.replace('.png','').padEnd(16)} FAR sat ${dFar>=0?'+':''}${dFar.toFixed(3)}   pale ${dPale>=0?'+':''}${dPale.toFixed(1)}%`);
    }
  }
}else{
  console.error('need --dir <dir>  OR  --a <dirA> [--b <dirB>]');
  process.exit(1);
}

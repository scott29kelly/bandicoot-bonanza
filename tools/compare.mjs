#!/usr/bin/env node
/**
 * Two jobs, both from the reference-delta loop in docs/QUALITY-BAR.md.
 *
 * 1. Side-by-side compositor — ours LEFT, reference RIGHT, scaled to a common
 *    height. The repo ships no reference frames (see the quality bar's note on
 *    why), so point --b at your own file in refs/.
 *
 *      node tools/compare.mjs --a shots/after/gate-hero.png --b refs/mine.png
 *
 * 2. --pillarb — the no-grey-shadow test, automated.
 *
 *      node tools/compare.mjs --pillarb shots/after/hero-closeup.png
 *
 *    Naively sampling "the darkest pixels" does NOT test this: it finds dark
 *    ALBEDO (a palm trunk in full sun) and reports it as a healthy saturated
 *    shadow, which is how a greyscale ramp passes a test it should fail.
 *
 *    So this compares like with like. Pixels are grouped into hue families,
 *    the largest family is taken (in practice the ground — sand or moss, the
 *    biggest single-material area in any framing), and within that ONE
 *    material the darkest fifth is compared against the brightest fifth. That
 *    isolates the lighting from the albedo: same material, different light.
 *
 *    Reported per framing:
 *      sat(dark) / sat(lit)  — a greyscale ramp drives sat(dark) toward zero
 *      cool shift            — (blue-red) in shadow minus (blue-red) in light,
 *                              in 0..1 units. Positive means shadow is cooler
 *                              than light, which is the whole point of the ramp.
 *
 *    Floors: sat(dark) >= 0.15 and cool shift > 0.
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {parseArgs} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));

function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  let h=0;
  if(d>1e-6){
    if(mx===r)h=((g-b)/d+6)%6;
    else if(mx===g)h=(b-r)/d+2;
    else h=(r-g)/d+4;
    h/=6;
  }
  return {h,s:mx===0?0:d/mx,v:mx};
}

async function pillarB(file){
  const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
  const BINS=16;
  const fam=Array.from({length:BINS},()=>[]);
  for(let y=0;y<info.height;y+=2)for(let x=0;x<info.width;x+=2){
    const i=(y*info.width+x)*info.channels;
    const r=data[i],g=data[i+1],b=data[i+2];
    const {h,s,v}=rgbToHsv(r,g,b);
    // Skip near-neutral pixels: their hue is noise, and the sky is a flat
    // gradient that would otherwise dominate the largest-family pick.
    if(s<0.06||v<0.04)continue;
    fam[Math.min(BINS-1,Math.floor(h*BINS))].push({r,g,b,s,v});
  }
  let best=0;
  for(let i=1;i<BINS;i++)if(fam[i].length>fam[best].length)best=i;
  const px=fam[best];
  if(px.length<400){console.log(`[pillarb] ${path.basename(file)}: not enough same-material pixels to judge`);return;}
  px.sort((a,b)=>a.v-b.v);
  const n=Math.max(1,Math.floor(px.length/5));
  const dark=px.slice(0,n), lit=px.slice(-n);
  const mean=a=>({
    r:a.reduce((t,p)=>t+p.r,0)/a.length,
    g:a.reduce((t,p)=>t+p.g,0)/a.length,
    b:a.reduce((t,p)=>t+p.b,0)/a.length,
    s:a.reduce((t,p)=>t+p.s,0)/a.length,
    v:a.reduce((t,p)=>t+p.v,0)/a.length
  });
  const D=mean(dark), L=mean(lit);
  const cool=((D.b-D.r)-(L.b-L.r))/255;
  const hueDeg=Math.round((best+0.5)/BINS*360);
  const satFail=D.s<0.15, coolFail=cool<=0;
  console.log(`[pillarb] ${path.basename(file)}  dominant material: hue ~${hueDeg}deg, ${px.length} px`);
  console.log(`          shadow  rgb(${D.r.toFixed(0)},${D.g.toFixed(0)},${D.b.toFixed(0)})  sat ${D.s.toFixed(3)}  value ${D.v.toFixed(3)}${satFail?'   <-- GREY SHADOW (fail)':''}`);
  console.log(`          lit     rgb(${L.r.toFixed(0)},${L.g.toFixed(0)},${L.b.toFixed(0)})  sat ${L.s.toFixed(3)}  value ${L.v.toFixed(3)}`);
  console.log(`          cool shift ${cool>=0?'+':''}${cool.toFixed(4)}${coolFail?'   <-- shadow is not cooler than light (fail)':''}`);
  if(satFail||coolFail)process.exitCode=1;
}

async function sideBySide(a,b,out){
  const H=1000, GUT=12;
  const [ma,mb]=await Promise.all([sharp(a).metadata(),sharp(b).metadata()]);
  const wa=Math.round(ma.width*H/ma.height), wb=Math.round(mb.width*H/mb.height);
  const [ba,bb]=await Promise.all([
    sharp(a).resize(wa,H).png().toBuffer(),
    sharp(b).resize(wb,H).png().toBuffer()
  ]);
  mkdirSync(path.dirname(out),{recursive:true});
  await sharp({create:{width:wa+GUT+wb,height:H,channels:3,background:{r:10,g:12,b:11}}})
    .composite([{input:ba,left:0,top:0},{input:bb,left:wa+GUT,top:0}])
    .png().toFile(out);
  console.log(`[compare] wrote ${out} (ours left, reference right)`);
}

if(args.pillarb){
  const files=String(args.pillarb).split(',');
  for(const f of files)await pillarB(f.trim());
}else if(args.a&&args.b){
  await sideBySide(String(args.a),String(args.b),String(args.out??'shots/compare.png'));
}else{
  console.error('need --pillarb <img[,img...]>  OR  --a <ours> --b <reference> [--out path]');
  process.exit(1);
}

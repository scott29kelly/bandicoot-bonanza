#!/usr/bin/env node
/**
 * One-off Pass 25 A/B instrument: the ramp's shadow-temperature fix measured
 * on the SAND family specifically (hue 25-70deg), because --pillarb's
 * dominant-family pick lands on the sea (hue ~191deg) in the beach framings
 * and the sea is a MeshBasicMaterial - its dark fifth is fogged depth, not
 * ramp shadow (the pass-24 probe limitation). Same dark/lit-fifth logic as
 * compare.mjs --pillarb, pinned to the warm albedo the ramp actually lights.
 *
 *   node tools/probe_sandtemp.mjs img1.png img2.png ...
 */
import path from 'node:path';
import sharp from 'sharp';

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

for(const file of process.argv.slice(2)){
  const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
  const px=[];
  for(let y=0;y<info.height;y+=2)for(let x=0;x<info.width;x+=2){
    const i=(y*info.width+x)*info.channels;
    const r=data[i],g=data[i+1],b=data[i+2];
    const {h,s,v}=rgbToHsv(r,g,b);
    const deg=h*360;
    if(deg<25||deg>70||s<0.06||v<0.04)continue;
    px.push({r,g,b,s,v});
  }
  if(px.length<400){
    console.log(`[sandtemp] ${path.basename(file)}: sand family too small (${px.length} px)`);
    continue;
  }
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
  console.log(`[sandtemp] ${path.basename(file)}  sand px ${px.length}`);
  console.log(`  shadow rgb(${D.r.toFixed(0)},${D.g.toFixed(0)},${D.b.toFixed(0)}) sat ${D.s.toFixed(3)} v ${D.v.toFixed(3)}`);
  console.log(`  lit    rgb(${L.r.toFixed(0)},${L.g.toFixed(0)},${L.b.toFixed(0)}) sat ${L.s.toFixed(3)} v ${L.v.toFixed(3)}`);
  console.log(`  cool shift ${cool>=0?'+':''}${cool.toFixed(4)}${cool<=0?'   <-- fail':''}`);
}

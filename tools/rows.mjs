#!/usr/bin/env node
/**
 * Row-profile probe: per-row mean RGB + HSV saturation/value for one shot,
 * every <step>% of height. Prints a compact table so the horizon line, the
 * far-sea band and the near field can be located numerically.
 *
 *   node tools/rows.mjs docs/shots/pass20/beach-corridor.png
 */
import sharp from 'sharp';

const file=process.argv[2];
if(!file){console.error('usage: node tools/rows.mjs <img>');process.exit(1);}
const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
function hsv(r,g,b){
  r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
  return {s:mx===0?0:(mx-mn)/mx,v:mx};
}
console.log(`# ${file}  ${info.width}x${info.height}`);
console.log('row%    r     g     b      sat    val');
const STEP=Number(process.argv[3]??4);
for(let pct=0;pct<100;pct+=STEP){
  const y0=Math.floor(info.height*pct/100),y1=Math.min(info.height,Math.floor(info.height*(pct+STEP)/100));
  let r=0,g=0,b=0,n=0;
  for(let y=y0;y<y1;y++)for(let x=0;x<info.width;x+=3){
    const i=(y*info.width+x)*info.channels;
    r+=data[i];g+=data[i+1];b+=data[i+2];n++;
  }
  r/=n;g/=n;b/=n;
  const {s,v}=hsv(r,g,b);
  console.log(`${String(pct).padStart(3)}  ${r.toFixed(0).padStart(4)} ${g.toFixed(0).padStart(5)} ${b.toFixed(0).padStart(5)}   ${s.toFixed(3)}  ${v.toFixed(3)}   rgb(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)})`);
}

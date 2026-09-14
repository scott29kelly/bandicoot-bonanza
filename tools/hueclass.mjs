#!/usr/bin/env node
/** Far-band hue-class share: gold/aqua/violet/desat for one shot's top band. */
import sharp from 'sharp';
const [file,y0p,y1p]=process.argv.slice(2);
const {data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});
const y0=Math.floor(info.height*(Number(y0p??0)/100)),y1=Math.floor(info.height*(Number(y1p??28)/100));
const cls={gold:0,aqua:0,violet:0,warm:0,other:0};let n=0;
for(let y=y0;y<y1;y++)for(let x=0;x<info.width;x+=2){
  const i=(y*info.width+x)*info.channels;
  const r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b),s=mx===0?0:(mx-mn)/mx;
  let h=0;
  if(mx-mn>1e-6){
    if(mx===r)h=((g-b)/(mx-mn)+6)%6;else if(mx===g)h=(b-r)/(mx-mn)+2;else h=(r-g)/(mx-mn)+4;
    h*=60;
  }
  if(s<0.10)cls.other++;
  else if(h>=25&&h<70)cls.gold++;
  else if(h>=150&&h<215)cls.aqua++;
  else if(h>=230&&h<320)cls.violet++;
  else if(h>=10&&h<25||(h>=70&&h<150))cls.warm++;
  else cls.other++;
  n++;
}
const out=Object.fromEntries(Object.entries(cls).map(([k,v])=>[k,(v/n*100).toFixed(1)+'%']));
console.log(`${file}  rows ${y0p??0}-${y1p??28}%`, JSON.stringify(out));

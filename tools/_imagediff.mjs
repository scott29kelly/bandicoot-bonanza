/**
 * One implementation of "how different are these two images", shared by
 * tools/diff.mjs and tools/determinism.mjs.
 *
 * Two copies of this would drift, and the determinism gate exists precisely to
 * make pixel comparisons trustworthy — it cannot rest on a second, subtly
 * different comparator.
 */
import sharp from 'sharp';
import {mkdirSync} from 'node:fs';
import path from 'node:path';

/**
 * @returns {{pct:number,mean:number,max:number}|null} null when sizes differ
 *          (reported as UNMEASURED by callers, never as "no change").
 */
export async function diffImages(a,b,outFile=null,amp=8){
  const [ra,rb]=await Promise.all([
    sharp(a).raw().toBuffer({resolveWithObject:true}),
    sharp(b).raw().toBuffer({resolveWithObject:true})
  ]);
  if(ra.info.width!==rb.info.width||ra.info.height!==rb.info.height)return null;
  const n=ra.info.width*ra.info.height, ca=ra.info.channels, cb=rb.info.channels;
  const out=outFile?Buffer.alloc(n*3):null;
  let moved=0,sum=0,max=0;
  for(let i=0;i<n;i++){
    const ia=i*ca, ib=i*cb;
    const d=(Math.abs(ra.data[ia]-rb.data[ib])+
             Math.abs(ra.data[ia+1]-rb.data[ib+1])+
             Math.abs(ra.data[ia+2]-rb.data[ib+2]))/3;
    if(d>1)moved++;
    sum+=d; if(d>max)max=d;
    if(out){const v=Math.min(255,d*amp);out[i*3]=v;out[i*3+1]=v;out[i*3+2]=v;}
  }
  if(out){
    mkdirSync(path.dirname(outFile),{recursive:true});
    await sharp(out,{raw:{width:ra.info.width,height:ra.info.height,channels:3}}).png().toFile(outFile);
  }
  return {pct:moved/n*100,mean:sum/n,max};
}

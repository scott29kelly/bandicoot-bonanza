#!/usr/bin/env node
/**
 * Pass 24 instrument: contact shadow under the hero's feet.
 *
 *   node tools/probe_shadow.mjs
 *
 * For every framing with a hero pose: project the hero's feet (rig origin) to
 * screen, scan a band of strips below/above that point, and compare the
 * darkest strip against flanking ground strips at the same distance.
 * Delta = mean(flank luminance) - mean(under luminance); a readable contact
 * shadow is delta > ~0.03. The rig origin can sit up to ~0.5u from the visual
 * contact point depending on facing (the blob is 1.55u wide, so flanks at
 * ±58px can land inside its penumbra at close range — read gate-hero's faint
 * verdict against a zoom crop before believing it).
 * Pass-23 baseline measured -0.009..-0.077 (invisible); the pass-24 fix
 * measures 0.06-0.53 on every hero framing.
 */
import {parseArgs, launch, gameUrl, boot, pin, ROOT} from './_harness.mjs';
import sharp from 'sharp';

const args=parseArgs(process.argv.slice(2));
const browser=await launch(args);
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
try{
  await boot(page,gameUrl({seed:args.seed}));
  await pin(page);
  const framings=await page.evaluate(()=>window.BB.framings);
  for(const f of framings){
    await page.evaluate(id=>window.BB.review(id),f.id);
    await page.evaluate(n=>window.BB.settle(n),10);
    const pose=await page.evaluate(()=>{
      // hero feet world -> screen
      const p=window.BB.player.pos;
      const v=new THREE.Vector3(p.x,p.y+0.06,p.z).project(window.BB.camera);
      return {x:(v.x*0.5+0.5)*1280,y:(-v.y*0.5+0.5)*800,visible:v.z<1};
    });
    if(!pose.visible||pose.y<0||pose.y>795||pose.x<60||pose.x>1220){
      console.log('[shadow]',f.id.padEnd(16),'hero feet off-frame or clipped — skip');
      continue;
    }
    const buf=await page.screenshot();
    const strip=async (cx,cy)=>{
      const {data}=await sharp(buf).extract({left:Math.round(cx-22),top:Math.round(cy-5),width:44,height:9}).raw().toBuffer({resolveWithObject:true});
      let s=0,n=0;
      for(let i=0;i<data.length;i+=4){s+=(0.2126*data[i]+0.7152*data[i+1]+0.0722*data[i+2])/255;n++;}
      return s/n;
    };
    // the projection lands on the rig origin, which can sit up to ~0.5u from
    // the visual contact point depending on facing; scan a band below the
    // projected point and take the darkest strip (the blob) vs its own flanks
    let best=null;
    for(let dy=-50;dy<=62;dy+=8){
      const under=await strip(pose.x,pose.y+dy);
      const lf=await strip(pose.x-58,pose.y+dy);
      const rt=await strip(pose.x+58,pose.y+dy);
      const d=(lf+rt)/2-under;
      if(!best||d>best.d)best={d,dy,under,flank:(lf+rt)/2};
    }
    const d=best.d;
    console.log('[shadow]',f.id.padEnd(16),'feet(',Math.round(pose.x)+','+Math.round(pose.y),')  under',best.under.toFixed(3),' flank',best.flank.toFixed(3),'  delta',d.toFixed(3),d>0.03?'READABLE':(d>0.012?'faint':'INVISIBLE'));
  }
}finally{
  try{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,1500))]);}catch(e){}
  process.exit(0);
}

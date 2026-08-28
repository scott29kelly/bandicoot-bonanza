/**
 * Materials and procedural textures. SINGLE OWNER with src/render/ — the toon
 * ramp is the lighting model, so it and the light rig are one coupled system.
 *
 * Two laws from docs/QUALITY-BAR.md live here:
 *  - Shadow is never grey. The ramp's dark texels are cool and SATURATED,
 *    so every shadowed face carries colour before any light touches it.
 *  - Every repeating texture carries breakup at two scales. The macro layer
 *    is drawn first, at 3–4 m and ~12 m frequency, then detail on top.
 */
import * as THREE from 'three';
import {rand,rnd} from '../core/rng.js';

/* ---------- the toon ramp ----------------------------------------------- */
/**
 * A colored gradientMap: three's toon shader samples this as irradiance, so
 * the dark texels TINT the shade side instead of just darkening it.
 * Shadow leans blue-green (jungle bounce), light leans warm.
 */
function makeRamp(stops){
  const data=new Uint8Array(stops.length*4);
  stops.forEach((s,i)=>{data[i*4]=s[0];data[i*4+1]=s[1];data[i*4+2]=s[2];data[i*4+3]=255;});
  const t=new THREE.DataTexture(data,stops.length,1,THREE.RGBAFormat);
  t.minFilter=t.magFilter=THREE.LinearFilter;
  t.colorSpace=THREE.NoColorSpace;
  t.needsUpdate=true;
  return t;
}
export const RAMP=makeRamp([
  [46,82,112],   // deep shade — decisively blue; warm albedo will pull it teal
  [88,126,142],  // mid shade — cool green-blue
  [214,200,168], // lit — warming up
  [255,250,238]  // full sun
]);

/** Toon material factory. Every lit surface in the game goes through here. */
export function toonMat(opts={}){
  return new THREE.MeshToonMaterial({gradientMap:RAMP,...opts});
}

/* ---------- canvas plumbing --------------------------------------------- */
function canvasTex(size,draw,{repeat=1,srgb=true}={}){
  const c=document.createElement('canvas');
  c.width=c.height=size;
  draw(c.getContext('2d'),size);
  const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(repeat,repeat);
  if(srgb)t.colorSpace=THREE.SRGBColorSpace;
  t.anisotropy=4;
  return t;
}
/**
 * A wavy stroke that WRAPS the tile edge properly. Naive `(x0+x)%s` inside
 * one path drags a lineTo clear across the canvas at the wrap — tiled 90×
 * over the sea, those jumps read as a grid burned into the water.
 */
function wavyLine(g,x0,y,len,ph,s,freq,amp){
  g.beginPath();
  let prev=null;
  for(let x=0;x<=len;x+=7){
    const wx=(x0+x)%s,wy=y+Math.sin(x*freq+ph)*amp;
    if(prev!==null&&wx<prev){g.stroke();g.beginPath();g.moveTo(0,wy);}
    else if(prev===null)g.moveTo(wx,wy);
    else g.lineTo(wx,wy);
    prev=wx;
  }
  g.stroke();
}

/** Soft macro blotches — the large-scale breakup layer under every detail. */
function blotches(g,size,n,rMin,rMax,color,aMin,aMax){
  for(let i=0;i<n;i++){
    const x=rand(0,size),y=rand(0,size),r=rand(rMin,rMax);
    const grad=g.createRadialGradient(x,y,0,x,y,r);
    grad.addColorStop(0,`rgba(${color},${rand(aMin,aMax)})`);
    grad.addColorStop(1,`rgba(${color},0)`);
    g.fillStyle=grad;
    // Draw wrapped so the tile edge carries no seam.
    for(const dx of[-size,0,size])for(const dy of[-size,0,size]){
      g.beginPath();g.arc(x+dx,y+dy,r,0,7);g.fill();
    }
  }
}

/* ---------- surfaces ----------------------------------------------------- */
export function sandTexture(){
  return canvasTex(512,(g,s)=>{
    g.fillStyle='#dcc186';g.fillRect(0,0,s,s);
    blotches(g,s,10,s*0.25,s*0.45,'170,132,78',0.18,0.32);   // ~12 m scale
    blotches(g,s,26,s*0.06,s*0.14,'240,216,160',0.16,0.3);   // ~3 m scale
    blotches(g,s,20,s*0.05,s*0.12,'160,120,76',0.10,0.2);
    blotches(g,s,6,s*0.3,s*0.5,'132,150,120',0.05,0.1);      // faint cool drift
    // Wind-ripple bands, broken and jittered so they never read as stripes.
    g.strokeStyle='rgba(150,116,70,0.13)';g.lineWidth=3;
    for(let i=0;i<38;i++){
      const y=rand(0,s),ph=rand(0,7),len=rand(s*0.3,s*0.8),x0=rand(0,s);
      wavyLine(g,x0,y,len,ph,s,0.045,5);
    }
    // Grain speckle — kept >=2px so it survives mip 0 without baking to noise.
    for(let i=0;i<2600;i++){
      const v=rand(0,1);
      g.fillStyle=v>0.5?`rgba(246,226,178,${rand(0.2,0.5)})`:`rgba(140,104,66,${rand(0.15,0.4)})`;
      g.fillRect(rand(0,s),rand(0,s),rand(2,3.4),rand(2,3.4));
    }
  },{repeat:1});
}

export function rockTexture(){
  return canvasTex(512,(g,s)=>{
    g.fillStyle='#8d7f6c';g.fillRect(0,0,s,s);
    blotches(g,s,9,s*0.28,s*0.5,'104,92,74',0.14,0.26);
    blotches(g,s,22,s*0.07,s*0.16,'157,146,124',0.12,0.24);
    blotches(g,s,16,s*0.06,s*0.13,'70,66,58',0.08,0.16);
    // Strata cracks.
    g.strokeStyle='rgba(58,52,44,0.35)';g.lineWidth=2.5;
    for(let i=0;i<26;i++){
      let x=rand(0,s),y=rand(0,s);
      g.beginPath();g.moveTo(x,y);
      for(let k=0;k<6;k++){x+=rand(-38,38);y+=rand(6,30);g.lineTo(x,y);}
      g.stroke();
    }
    blotches(g,s,14,s*0.04,s*0.1,'106,126,84',0.10,0.22); // moss creep
  });
}

export function woodTexture(){
  return canvasTex(256,(g,s)=>{
    g.fillStyle='#a8763e';g.fillRect(0,0,s,s);
    blotches(g,s,8,s*0.2,s*0.4,'139,94,47',0.12,0.22);
    const planks=4,ph=s/planks;
    for(let p=0;p<planks;p++){
      const y0=p*ph;
      // Per-plank tint so the crate never reads as one flat orange.
      g.fillStyle=`rgba(${randInt3(120,160)},${randInt3(78,102)},${randInt3(38,54)},0.35)`;
      g.fillRect(0,y0,s,ph);
      g.strokeStyle='rgba(60,38,18,0.75)';g.lineWidth=4;
      g.strokeRect(-2,y0+1,s+4,ph-2);
      g.strokeStyle='rgba(88,56,24,0.5)';g.lineWidth=2;
      for(let i=0;i<5;i++){
        const gy=y0+rand(6,ph-6),ph2=rand(0,7);
        g.beginPath();
        for(let x=0;x<=s;x+=10)g.lineTo(x,gy+Math.sin(x*0.05+ph2)*2.4);
        g.stroke();
      }
      // A knot or two per plank.
      for(let i=0;i<2;i++){
        if(rnd()<0.45)continue;
        const kx=rand(20,s-20),ky=y0+rand(10,ph-10);
        g.strokeStyle='rgba(70,44,20,0.8)';
        for(let r=2;r<9;r+=2.5){g.beginPath();g.arc(kx,ky,r,0,7);g.stroke();}
      }
    }
  });
}
function randInt3(a,b){return Math.floor(rand(a,b));}

export function barkTexture(){
  return canvasTex(256,(g,s)=>{
    g.fillStyle='#8a6a48';g.fillRect(0,0,s,s);
    blotches(g,s,8,s*0.2,s*0.4,'110,82,52',0.15,0.25);
    // Stacked frond-scar rings — the classic palm diamond banding.
    g.strokeStyle='rgba(58,42,26,0.7)';g.lineWidth=5;
    const rows=7;
    for(let r=0;r<rows;r++){
      const y=(r+0.5)*s/rows;
      g.beginPath();
      for(let x=0;x<=s;x+=6)g.lineTo(x,y+Math.sin((x/s*4+(r%2)*0.5)*Math.PI*2)*7);
      g.stroke();
    }
    blotches(g,s,18,s*0.03,s*0.07,'150,120,84',0.15,0.3);
  });
}

export function tntTexture(){
  return canvasTex(256,(g,s)=>{
    g.fillStyle='#b03024';g.fillRect(0,0,s,s);
    blotches(g,s,8,s*0.18,s*0.36,'130,42,30',0.15,0.3);
    const planks=3,ph=s/planks;
    for(let p=0;p<planks;p++){
      g.strokeStyle='rgba(70,16,12,0.8)';g.lineWidth=4;
      g.strokeRect(-2,p*ph+1,s+4,ph-2);
    }
    g.fillStyle='#f2e6c8';
    g.fillRect(s*0.14,s*0.36,s*0.72,s*0.28);
    g.strokeStyle='rgba(70,16,12,0.9)';g.lineWidth=3;
    g.strokeRect(s*0.14,s*0.36,s*0.72,s*0.28);
    g.fillStyle='#20161a';
    g.font=`900 ${Math.round(s*0.2)}px 'Trebuchet MS',sans-serif`;
    g.textAlign='center';g.textBaseline='middle';
    g.fillText('TNT',s*0.5,s*0.51);
  });
}

/**
 * Tiling ripple sheet the water scrolls — flow you can see, not assert.
 * SHORT dashes at varied angles, kept fully inside the tile: long
 * horizontal strokes chain across tiles at grazing view angles and read as
 * infinite white lines ruled over the sea.
 */
export function rippleTexture(){
  return canvasTex(256,(g,s)=>{
    g.clearRect(0,0,s,s);
    g.strokeStyle='rgba(255,255,255,0.42)';
    for(let i=0;i<52;i++){
      const len=rand(s*0.07,s*0.2);
      const x0=rand(len,s-len),y0=rand(len,s-len),a=rand(-0.45,0.45),ph=rand(0,7);
      g.save();
      g.translate(x0,y0);g.rotate(a);
      g.lineWidth=rand(1.6,3);
      g.beginPath();
      for(let x=0;x<=len;x+=6)g.lineTo(x,Math.sin(x*0.09+ph)*2.5);
      g.stroke();
      g.restore();
    }
  });
}

/**
 * Contact-shadow blob: the occlusion darkening every prop needs where it
 * meets the ground. Deep teal, not black — Pillar B applies to occlusion
 * too. One shared texture; meshes scale it per prop.
 */
let _contactTex=null;
export function contactTexture(){
  if(_contactTex)return _contactTex;
  _contactTex=canvasTex(128,(g,s)=>{
    g.clearRect(0,0,s,s);
    const grad=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);
    grad.addColorStop(0,'rgba(16,42,52,0.78)');
    grad.addColorStop(0.55,'rgba(16,42,52,0.5)');
    grad.addColorStop(1,'rgba(16,42,52,0)');
    g.fillStyle=grad;g.fillRect(0,0,s,s);
  });
  _contactTex.wrapS=_contactTex.wrapT=THREE.ClampToEdgeWrapping;
  return _contactTex;
}

/** Foam band: solid at the shore edge (v=0), breaking up as it leaves it. */
export function foamTexture(){
  return canvasTex(256,(g,s)=>{
    g.clearRect(0,0,s,s);
    const grad=g.createLinearGradient(0,0,0,s);
    grad.addColorStop(0,'rgba(255,255,255,0.95)');
    grad.addColorStop(0.55,'rgba(255,255,255,0.55)');
    grad.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle=grad;g.fillRect(0,0,s,s);
    // Bite holes out of the sheet so the outer edge is lace — but sparingly:
    // over-eaten, the band collapses to a 1 px rule tracing the island.
    g.globalCompositeOperation='destination-out';
    for(let i=0;i<110;i++){
      const x=rand(0,s),y=rand(s*0.3,s),r=rand(2,8)*(y/s);
      g.beginPath();g.arc(x,y,r,0,7);g.fill();
    }
    g.globalCompositeOperation='source-over';
  });
}

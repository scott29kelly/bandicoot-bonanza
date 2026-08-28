/**
 * The world past the corridor. Floor: >= 3 distance layers in every outdoor
 * framing — near dressing (flora.js), mid mass (jungle flanks, sea stacks),
 * far silhouette (the haze ridge). Fog GRADES these layers; it is never the
 * reason there is nothing there, so everything sits inside the fog range
 * where it still reads.
 */
import * as THREE from 'three';
import {rand} from '../core/rng.js';
import {toonMat} from '../art/materials.js';
import {mergeGeoms,xform,fbm3,vcolor,hash3} from './geo.js';
import {WATER_Y} from './masses.js';

const _c=new THREE.Color();

/** A wave-carved rock pillar with a green cap — silhouette first. */
function seaStack(x,z,h,r){
  const g=new THREE.CylinderGeometry(r*rand(0.55,0.75),r*rand(1.0,1.25),h,10,6);
  const p=g.getAttribute('position');
  for(let i=0;i<p.count;i++){
    const wx=p.getX(i),wy=p.getY(i),wz=p.getZ(i);
    // Undercut at the waterline, bulge above it — the classic stack profile.
    const t=(wy+h/2)/h;
    const cut=1-Math.exp(-Math.pow((t-0.12)*5,2))*0.35;
    const n=0.75+fbm3((wx+x)*0.4,wy*0.4,(wz+z)*0.4)*0.6;
    p.setX(i,wx*cut*n);
    p.setZ(i,wz*cut*n);
  }
  g.computeVertexNormals();
  vcolor(g,(wx,wy)=>{
    const t=(wy+h/2)/h;
    if(t>0.72)return _c.setHSL(0.30,0.5,0.17+fbm3(wx,wy,1)*0.09); // green cap
    if(t<0.2)return _c.setHSL(0.1,0.22,0.18);                     // wet base
    return _c.setHSL(0.09,0.26,0.26+fbm3(wx*0.5,wy*0.5,2)*0.09);
  });
  return xform(g,{p:[x,h/2+WATER_Y-1.5,z]});
}

/** A jungle flank: a ridge mass buried under overlapping canopy mounds. */
function jungleRidge(x,z,len,w,h,dir){
  const parts=[];
  const ridge=new THREE.SphereGeometry(1,14,10);
  xform(ridge,{s:[len/2,h,w/2]});
  const rp=ridge.getAttribute('position');
  for(let i=0;i<rp.count;i++){
    const k=0.8+fbm3(rp.getX(i)*0.08+x,rp.getY(i)*0.15,rp.getZ(i)*0.08+z)*0.5;
    rp.setXYZ(i,rp.getX(i)*k,rp.getY(i)*k,rp.getZ(i)*k);
  }
  ridge.computeVertexNormals();
  // The inner slope is the single biggest surface in most framings — it
  // needs banded canopy-scale breakup, not one lightness ramp.
  vcolor(ridge,(px,py,pz)=>_c.setHSL(
    0.27+fbm3(px*0.10,py*0.3,3)*0.09,
    0.42+fbm3(px*0.23,py*0.5,9)*0.18,
    Math.max(0.06,0.12+Math.max(0,py)/h*0.12
      +(fbm3(px*0.16,py*0.35,(pz+7)*0.16)-0.5)*0.16)));
  parts.push(ridge);
  // Canopy mounds along the crest — each hashed into its own shape.
  const N=Math.round(len*0.45);
  for(let i=0;i<N;i++){
    const t=i/N-0.5;
    const mound=new THREE.SphereGeometry(rand(2.2,4.6),8,6);
    const mp=mound.getAttribute('position');
    for(let j=0;j<mp.count;j++){
      const k=0.75+hash3(mp.getX(j)*3+i,mp.getY(j)*3,mp.getZ(j)*3)*0.5;
      mp.setXYZ(j,mp.getX(j)*k,mp.getY(j)*k*0.75,mp.getZ(j)*k);
    }
    mound.computeVertexNormals();
    // Real hue/value spread mound to mound — one green end to end is the
    // "two smooth blobs" verdict (round 1, gap 2).
    const hue=0.24+rand(0,0.13),sat=rand(0.45,0.68),base=rand(0.07,0.24);
    vcolor(mound,(px,py)=>_c.setHSL(hue+fbm3(px*0.6,py*0.6,i)*0.03,sat,
      Math.max(0.05,base+py*0.12+fbm3(px*1.4,py*1.4,i+40)*0.07)));
    // Keep every mound buried in the crest: the ridge surface at t is about
    // h*cos(t*2.4) before noise, so centring below 0.62 of it can't float.
    xform(mound,{p:[t*len,h*Math.cos(t*2.4)*rand(0.38,0.62),rand(-w*0.28,w*0.28)]});
    parts.push(mound);
  }
  const g=mergeGeoms(parts.map(p=>p.toNonIndexed()));
  return xform(g,{p:[x,WATER_Y,z],r:[0,dir,0]});
}

/**
 * A background tree: bent trunk + a star of frond blades. ~90 triangles of
 * pure silhouette — these are what make the flanks read as JUNGLE instead
 * of pudding (round-2 verdict: the mounds alone never read).
 */
function bgTree(x,z,h){
  const parts=[];
  const leanD=rand(0,Math.PI*2),lean=rand(0.3,1.1);
  const SEG=4;
  for(let s=0;s<SEG;s++){
    const t0=s/SEG,t1=(s+1)/SEG;
    const seg=new THREE.CylinderGeometry(0.16*(1-t1*0.5)*h/6,0.16*(1-t0*0.5)*h/6,h/SEG,5);
    xform(seg,{p:[Math.cos(leanD)*lean*((t0+t1)/2)**1.6,(t0+0.5/SEG)*h,
                  Math.sin(leanD)*lean*((t0+t1)/2)**1.6]});
    vcolor(seg,()=>_c.setHSL(0.08,0.3,rand(0.16,0.24)));
    parts.push(seg);
  }
  const tipX=Math.cos(leanD)*lean,tipZ=Math.sin(leanD)*lean;
  const N=randInt2(5,7);
  for(let i=0;i<N;i++){
    const a=i/N*Math.PI*2+rand(-0.3,0.3);
    const L=h*rand(0.32,0.45);
    const blade=new THREE.BufferGeometry();
    const w=L*0.16,droop=L*rand(0.25,0.5);
    blade.setAttribute('position',new THREE.Float32BufferAttribute([
      0,0,-w, 0,0,w, L,-droop*0.4,w*0.5, L*1.15,-droop,0, L,-droop*0.4,-w*0.5],3));
    blade.setIndex([0,1,2, 0,2,4, 2,3,4]);
    blade.computeVertexNormals();
    const g2=blade.toNonIndexed();
    const uv=new Float32Array(g2.getAttribute('position').count*2);
    g2.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    vcolor(g2,()=>_c.setHSL(rand(0.25,0.36),rand(0.5,0.65),rand(0.13,0.28)));
    xform(g2,{r:[0,a,rand(-0.15,0.3)],p:[tipX,h,tipZ]});
    parts.push(g2);
  }
  return xform(mergeGeoms(parts),{p:[x,WATER_Y+0.2,z]});
}
function randInt2(a,b){return Math.floor(rand(a,b+1));}

export function createBackdrop(){
  const mat=toonMat({vertexColors:true,side:THREE.DoubleSide});
  const parts=[];

  // The treeline: crowds along the feet of the near flanks, silhouetted
  // against the ridge masses, framing the corridor with actual trees.
  for(let i=0;i<26;i++){
    const z=8-i*3.6+rand(-1.4,1.4);
    bgTreeSide(parts,-1,z);
    bgTreeSide(parts,1,z);
  }
  function bgTreeSide(list,side,z){
    if(rand(0,1)<0.25)return;
    const x=side*(rand(20,30));
    list.push(bgTree(x,z+rand(-2,2),rand(4.5,9)));
  }

  // Mid layer: jungle flanks RUNNING ALONG the corridor (a ridge's long
  // axis is X, so flanks need the quarter turn) from well outside it —
  // close enough to read as terrain, far enough never to wall off a framing.
  parts.push(jungleRidge(-30,-35,90,20,12,Math.PI/2+0.1));
  parts.push(jungleRidge(32,-48,100,22,14,Math.PI/2-0.08));
  parts.push(jungleRidge(-37,-105,80,24,16,Math.PI/2+0.15));
  parts.push(jungleRidge(37,2,36,14,7,Math.PI/2-0.2));

  // Mid layer, seaward: stacks scattered off both flanks — two of them
  // planted INSIDE the corridor's sight lines so the framed shots always
  // carry a mid-distance silhouette, not just flank walls.
  for(const [x,z,h,r] of [[-52,-58,16,5],[-64,-24,10,3.4],[58,-88,20,6],
                          [48,-30,9,3],[-58,-130,14,4.5],[70,-140,11,3.6],
                          [-21,-76,9,3],[30,-108,13,4]])
    parts.push(seaStack(x,z,h,r));

  // Far layer: a haze ridge band across the horizon of the corridor, tall
  // enough to read OVER the mid flanks, still inside the fog range so it
  // silhouettes instead of vanishing.
  parts.push(jungleRidge(-40,-182,150,40,30,0.25));
  parts.push(jungleRidge(60,-172,120,36,26,-0.3));

  const mesh=new THREE.Mesh(mergeGeoms(parts),mat);
  mesh.castShadow=false;   // far out of the cascade; shadows would just crawl
  mesh.receiveShadow=false;
  return mesh;
}

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
    if(t>0.82)return _c.setHSL(0.31,0.4,0.24+fbm3(wx,wy,1)*0.08); // green cap
    if(t<0.2)return _c.setHSL(0.1,0.18,0.24);                     // wet base
    return _c.setHSL(0.09,0.22,0.34+fbm3(wx*0.5,wy*0.5,2)*0.1);
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
  vcolor(ridge,(px,py)=>_c.setHSL(0.29+fbm3(px*0.1,py*0.3,3)*0.05,0.45,
    0.15+Math.max(0,py)/h*0.12));
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
    const hue=0.24+rand(0,0.13),sat=rand(0.42,0.62),base=rand(0.10,0.20);
    vcolor(mound,(px,py)=>_c.setHSL(hue+fbm3(px*0.6,py*0.6,i)*0.03,sat,
      base+Math.max(0,py*0.10)+fbm3(px*1.4,py*1.4,i+40)*0.06));
    // Keep every mound buried in the crest: the ridge surface at t is about
    // h*cos(t*2.4) before noise, so centring below 0.62 of it can't float.
    xform(mound,{p:[t*len,h*Math.cos(t*2.4)*rand(0.38,0.62),rand(-w*0.28,w*0.28)]});
    parts.push(mound);
  }
  const g=mergeGeoms(parts.map(p=>p.toNonIndexed()));
  return xform(g,{p:[x,WATER_Y,z],r:[0,dir,0]});
}

export function createBackdrop(){
  const mat=toonMat({vertexColors:true});
  const parts=[];

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
                          [-21,-76,9,3],[24,-95,13,4]])
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

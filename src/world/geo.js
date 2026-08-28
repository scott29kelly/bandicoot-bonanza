/**
 * Shared geometry helpers for the world builders.
 *
 * The noise here is POSITIONAL, not sequential: it hashes world coordinates
 * (plus the seed) instead of pulling from the rng stream. Two builders can
 * then displace their meshes in any order without stealing each other's
 * draws, and the same vertex always lands in the same place for a seed.
 */
import * as THREE from 'three';
import {SEED} from '../core/rng.js';

const S=(SEED>>>0)%1000*0.137;

/** Deterministic value hash of a 3D point, uniform-ish in [0,1). */
export function hash3(x,y,z){
  const n=Math.sin(x*127.1+y*311.7+z*74.7+S*113.5)*43758.5453;
  return n-Math.floor(n);
}

/** Smooth value noise in [0,1) — trilinear blend of the lattice hash. */
export function noise3(x,y,z){
  const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z);
  const xf=x-xi,yf=y-yi,zf=z-zi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
  const l=(a,b,t)=>a+(b-a)*t;
  return l(
    l(l(hash3(xi,yi,zi),hash3(xi+1,yi,zi),u), l(hash3(xi,yi+1,zi),hash3(xi+1,yi+1,zi),u),v),
    l(l(hash3(xi,yi,zi+1),hash3(xi+1,yi,zi+1),u),l(hash3(xi,yi+1,zi+1),hash3(xi+1,yi+1,zi+1),u),v),
    w);
}

/** Two-octave fbm — the "breakup at two scales" the quality bar demands. */
export function fbm3(x,y,z){
  return noise3(x,y,z)*0.65+noise3(x*3.1,y*3.1,z*3.1)*0.35;
}

/**
 * Merge non-indexed geometries into one draw. Every input must carry the
 * same attribute set (position, normal, uv, and optionally color).
 */
export function mergeGeoms(input){
  // Attribute concatenation drops any index, so expand indexed inputs first.
  const list=input.map(g=>g.index?g.toNonIndexed():g);
  const has=name=>list.every(g=>g.getAttribute(name));
  const names=['position','normal','uv','color'].filter(has);
  const out=new THREE.BufferGeometry();
  for(const name of names){
    const size=list[0].getAttribute(name).itemSize;
    let total=0;
    for(const g of list)total+=g.getAttribute(name).count;
    const arr=new Float32Array(total*size);
    let off=0;
    for(const g of list){
      arr.set(g.getAttribute(name).array,off);
      off+=g.getAttribute(name).count*size;
    }
    out.setAttribute(name,new THREE.BufferAttribute(arr,size));
  }
  return out;
}

/** Apply a world-space transform to a geometry in place, then return it. */
export function xform(geom,{p=[0,0,0],r=[0,0,0],s=1}={}){
  const m=new THREE.Matrix4();
  const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0],r[1],r[2]));
  const sv=Array.isArray(s)?new THREE.Vector3(...s):new THREE.Vector3(s,s,s);
  m.compose(new THREE.Vector3(...p),q,sv);
  geom.applyMatrix4(m);
  return geom;
}

/** Displace every vertex by fn(x,y,z) -> [dx,dy,dz], then refresh normals. */
export function displace(geom,fn){
  const pos=geom.getAttribute('position');
  for(let i=0;i<pos.count;i++){
    const [dx,dy,dz]=fn(pos.getX(i),pos.getY(i),pos.getZ(i));
    pos.setXYZ(i,pos.getX(i)+dx,pos.getY(i)+dy,pos.getZ(i)+dz);
  }
  pos.needsUpdate=true;
  geom.computeVertexNormals();
  return geom;
}

/** Paint per-vertex colors with fn(x,y,z) -> THREE.Color. */
export function vcolor(geom,fn){
  const pos=geom.getAttribute('position');
  const col=new Float32Array(pos.count*3);
  const c=new THREE.Color();
  for(let i=0;i<pos.count;i++){
    c.copy(fn(pos.getX(i),pos.getY(i),pos.getZ(i)));
    col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;
  }
  geom.setAttribute('color',new THREE.BufferAttribute(col,3));
  return geom;
}

/**
 * The sea. The floor says: depth-graded colour, a shoreline band, foam at
 * contact, visible flow — "not a single translucent plane."
 *
 * Depth grading is BAKED against the real island footprints: the water
 * module is handed every solid the masses registered and paints its shallows
 * around them, so a moved island moves its own shallows.
 */
import * as THREE from 'three';
import {rand} from '../core/rng.js';
import {rippleTexture,foamTexture} from '../art/materials.js';
import {WATER_Y} from './masses.js';

// World rect the sea covers, mapped onto the depth canvas.
const X0=-300,X1=300,Z0=100,Z1=-500,SZ=1024;
const px=(wx)=>(wx-X0)/(X1-X0)*SZ;
const pz=(wz)=>(wz-Z0)/(Z1-Z0)*SZ;

function depthCanvas(islands){
  const c=document.createElement('canvas');
  c.width=c.height=SZ;
  const g=c.getContext('2d');
  g.fillStyle='#155e88';g.fillRect(0,0,SZ,SZ);

  // Macro hue drift at two scales so open water is not one value end to end.
  for(let i=0;i<26;i++){
    const x=rand(0,SZ),y=rand(0,SZ),r=rand(SZ*0.06,SZ*0.22);
    const gr=g.createRadialGradient(x,y,0,x,y,r);
    const col=i%2?'32,120,150':'10,72,110';
    gr.addColorStop(0,`rgba(${col},${rand(0.10,0.25)})`);
    gr.addColorStop(1,`rgba(${col},0)`);
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill();
  }

  const rect=(s,e)=>{ // island footprint expanded by e metres, in canvas px
    const x=px(s.minX-e),y=pz(s.minZ-e); // note: pz flips, handle via min/max
    const x2=px(s.maxX+e),y2=pz(s.maxZ+e);
    g.beginPath();
    g.roundRect(Math.min(x,x2),Math.min(y,y2),Math.abs(x2-x),Math.abs(y2-y),10);
    g.fill();
  };
  // Shallow turquoise ring, then the sandy-glow contact band, both blurred
  // so depth reads as a gradient rather than a decal. Halo width scales with
  // the island — a 10 m halo around a 4 m islet floods the channel between
  // islands and the "gap" stops reading as deep water at all.
  const halo=(s)=>Math.min(9,Math.min(s.maxX-s.minX,s.maxZ-s.minZ)*0.8);
  g.filter='blur(14px)';g.fillStyle='rgba(64,176,178,0.82)';
  for(const s of islands)rect(s,halo(s));
  g.filter='blur(6px)';g.fillStyle='rgba(130,208,192,0.7)';
  for(const s of islands)rect(s,Math.min(3,halo(s)*0.4));
  g.filter='none';

  // Sun-sparkle cells in the shallows only.
  g.strokeStyle='rgba(220,255,250,0.2)';g.lineWidth=2;
  for(const s of islands){
    const n=Math.round((s.maxX-s.minX+s.maxZ-s.minZ)*1.2);
    for(let i=0;i<n;i++){
      const wx=rand(s.minX-6,s.maxX+6),wz=rand(s.minZ-6,s.maxZ+6);
      const inside=wx>s.minX-1&&wx<s.maxX+1&&wz>s.minZ-1&&wz<s.maxZ+1;
      if(inside)continue;
      g.beginPath();
      g.arc(px(wx),pz(wz),rand(2,5),rand(0,3),rand(3.5,6.5));
      g.stroke();
    }
  }
  return c;
}

/** Rounded-rect perimeter samples: [x, z, outward-nx, outward-nz, arclen]. */
function perimeter(s,e,step=1.2){
  const minX=s.minX-e,maxX=s.maxX+e,minZ=s.minZ-e,maxZ=s.maxZ+e;
  const pts=[];
  let len=0;
  const push=(x,z,nx,nz)=>{
    if(pts.length){
      const p=pts[pts.length-1];
      len+=Math.hypot(x-p[0],z-p[1]);
    }
    pts.push([x,z,nx,nz,len]);
  };
  const walk=(x0,z0,x1,z1,nx,nz)=>{
    const d=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(d/step));
    for(let i=0;i<=n;i++)push(x0+(x1-x0)*i/n,z0+(z1-z0)*i/n,nx,nz);
  };
  walk(minX,minZ,maxX,minZ,0,-1);
  walk(maxX,minZ,maxX,maxZ,1,0);
  walk(maxX,maxZ,minX,maxZ,0,1);
  walk(minX,maxZ,minX,minZ,-1,0);
  return pts;
}

function foamRing(s,tex){
  // Band reach scales with the island: full-size rings off the 4 m gap
  // islets overlap each other and flood the channel solid white.
  const size=Math.min(s.maxX-s.minX,s.maxZ-s.minZ);
  const W=Math.min(2.2,0.9+size*0.12);   // band width, metres
  // Start against the rock skirt (its bulge + lip reach ~1.4 m past the
  // footprint) and run out through it: surf breaks ON rock. Starting
  // inside the bulge buries the band and leaves a bare polygon shoreline.
  const pts=perimeter(s,Math.min(2.0,1.2+size*0.06));
  const posArr=[],uvArr=[],idx=[];
  for(let i=0;i<pts.length;i++){
    const [x,z,nx,nz,l]=pts[i];
    posArr.push(x,0,z, x+nx*W,0,z+nz*W);
    uvArr.push(l/3.2,0, l/3.2,1);
    if(i<pts.length-1){
      const a=i*2;
      idx.push(a,a+1,a+2, a+1,a+3,a+2);
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(posArr,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvArr,2));
  geo.setIndex(idx);
  // Each ring animates its own offset, so each needs its own texture object.
  const own=tex.clone();
  // v=0 is the shore edge and must sample the SOLID end of the gradient.
  own.flipY=false;
  // CLAMP v: repeat-wrapping lets the sampler at v~1 blend back around to
  // the solid v=0 row, ruling a one-texel white line along the band's outer
  // edge — the "grid over the sea" artifact, found by painting this magenta.
  own.wrapT=THREE.ClampToEdgeWrapping;
  own.needsUpdate=true;
  const mat=new THREE.MeshBasicMaterial({map:own,transparent:true,depthWrite:false,
    opacity:0.85,fog:true,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.y=WATER_Y+0.04;
  mesh.renderOrder=2;
  return mesh;
}

export function createWater(islands){
  const group=new THREE.Group();

  const depthTex=new THREE.CanvasTexture(depthCanvas(islands));
  depthTex.colorSpace=THREE.SRGBColorSpace;
  // The canvas is painted in world coordinates (pz maps +z to +y). flipY
  // would mirror the map in z and park every shallow 380 m from its island.
  depthTex.flipY=false;
  const base=new THREE.Mesh(
    new THREE.PlaneGeometry(X1-X0,Z0-Z1),
    new THREE.MeshBasicMaterial({map:depthTex}));
  base.rotation.x=-Math.PI/2;
  base.position.set((X0+X1)/2,WATER_Y,(Z0+Z1)/2);
  base.receiveShadow=false;
  group.add(base);

  // Two ripple sheets scrolling on crossing headings = visible flow, cheap.
  const ripTex=rippleTexture();
  const rips=[];
  for(const [op,sc] of [[0.11,90],[0.07,55]]){
    const t=ripTex.clone();
    t.needsUpdate=true;
    t.repeat.set(sc,sc);
    const m=new THREE.Mesh(
      new THREE.PlaneGeometry(X1-X0,Z0-Z1),
      new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:op,
        depthWrite:false,fog:true}));
    m.rotation.x=-Math.PI/2;
    m.position.set((X0+X1)/2,WATER_Y+0.02+rips.length*0.01,(Z0+Z1)/2);
    m.renderOrder=1;
    group.add(m);
    rips.push(t);
  }

  const foamTex=foamTexture();
  const foams=[];
  for(const s of islands){
    const f=foamRing(s,foamTex);
    group.add(f);
    foams.push(f);
  }

  function update(t){
    rips[0].offset.set(t*0.014,t*0.010);
    rips[1].offset.set(-t*0.009,t*0.013);
    for(let i=0;i<foams.length;i++){
      // The lace edge breathes in and out — surf, not a painted ribbon.
      foams[i].material.map.offset.y=Math.sin(t*1.25+i*1.3)*0.10;
      foams[i].material.opacity=0.62+Math.sin(t*1.25+i*1.3+0.6)*0.14;
    }
  }
  return {group,update};
}

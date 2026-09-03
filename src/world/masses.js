/**
 * Island masses — every play surface sits on one. "Play surfaces floating as
 * bare slabs" is a banned outcome, so the slab and its foundation are ONE
 * mesh here: a flat, walkable sand top on a noise-carved rock skirt that
 * continues below the waterline. There is no code path that makes a bare
 * platform.
 */
import * as THREE from 'three';
import {fbm3,vcolor,hash3,xform,mergeGeoms} from './geo.js';
import {rand} from '../core/rng.js';
import {toonMat,sandTexture,rockTexture,foamTexture} from '../art/materials.js';

export const WATER_Y=-0.55;
const SKIRT_DEPTH=6;

let sandMat=null,cliffMat=null;
function mats(){
  if(!sandMat){
    const sand=sandTexture();
    sandMat=toonMat({map:sand,vertexColors:true});
    const rock=rockTexture();
    cliffMat=toonMat({map:rock,vertexColors:true});
  }
  return {sandMat,cliffMat};
}

const cSand=new THREE.Color(0xffffff),cSandLow=new THREE.Color(0xd8c49a),
      cSandDamp=new THREE.Color(0xb59a6c),cSandPale=new THREE.Color(0xfff3d8),
      cWet=new THREE.Color(0x7d6448),cRockHi=new THREE.Color(0xa89478),
      cRockLo=new THREE.Color(0x5c685e),_c=new THREE.Color();

/**
 * @param {object} o {x,z,w,d,topY} — footprint of the WALKABLE top.
 * @returns {{mesh:THREE.Mesh, solid:{minX,maxX,minZ,maxZ,topY}}}
 */
export function islandMass({x,z,w,d,topY=0}){
  const {sandMat,cliffMat}=mats();
  const yTop=topY,yBot=topY-1.2-SKIRT_DEPTH;
  const height=yTop-yBot;
  // Enough segments to CARVE: at 0.8/m a 4 m islet gets 3 slices and its
  // skirt comes out as smooth cake no matter what the noise says.
  const seg=(len)=>Math.max(7,Math.round(len*1.3));
  const g=new THREE.BoxGeometry(w+1.6,height,d+1.6,seg(w),seg(height),seg(d));
  g.translate(0,yTop-height/2,0);

  const pos=g.getAttribute('position');
  const halfW=(w+1.6)/2,halfD=(d+1.6)/2;
  // Small islands carve at a higher frequency — a 7 m islet worked at beach
  // wavelengths comes out as a smooth pancake with ~0.5 m of freeboard.
  const freq=0.55*THREE.MathUtils.clamp(12/Math.min(w,d),1,2.4);
  for(let i=0;i<pos.count;i++){
    const px=pos.getX(i);
    let py=pos.getY(i);
    const pz=pos.getZ(i);
    const edge=Math.max(Math.abs(px)/halfW,Math.abs(pz)/halfD); // 1 on the side walls
    if(edge>0.96&&py<yTop-0.01){
      // Cluster the side rows toward the waterline. Uniform rows put ONE
      // row in the visible freeboard, so every carve happened underwater
      // and the shore read as smooth cake (round-3 finding).
      const t=THREE.MathUtils.clamp((yTop-py)/height,0,1);
      py=yTop-Math.pow(t,1.7)*height;
      pos.setY(i,py);
    }
    // 0 at the walkable rim, 1 at the bottom of the skirt.
    const down=THREE.MathUtils.clamp((yTop-py)/height,0,1);
    if(edge>0.96){
      // Rock skirt: carve and bulge with two-scale noise, more as it
      // descends, pushed RADIALLY so corners round off — an axis-aligned
      // push leaves the box silhouette readable, which is the failed look.
      const n=fbm3((px+x)*freq,py*0.7,(pz+z)*freq)-0.5;
      // The top row keeps a sand lip proud of the rock — an undercut edge,
      // not a cake slice.
      // 0.28: at 0.45 the undercut cavity under the lip read as a hole in
      // the mesh (round-19/20, the "navy wedge" at every gap platform).
      const lip=down<0.16?0.28:0;
      const bulge=(0.3+down*1.6)*(0.55+n*2.6)+lip;
      const dirX=px/halfW,dirZ=pz/halfD;
      const dl=Math.hypot(dirX,dirZ)||1;
      pos.setX(i,px+dirX/dl*bulge);
      pos.setZ(i,pz+dirZ/dl*bulge);
      pos.setY(i,py-fbm3((px+x)*0.7,7,(pz+z)*0.7)*down*1.2);
    }else if(py>yTop-0.01){
      // The top stays walkable: dune drift only, and only near the rim.
      const rim=THREE.MathUtils.smoothstep(edge,0.55,0.96);
      pos.setY(i,py+fbm3((px+x)*0.3,3,(pz+z)*0.3)*0.5*rim-0.25*rim
                  +fbm3((px+x)*0.9,5,(pz+z)*0.9)*0.03);
    }
  }
  pos.needsUpdate=true;
  g.computeVertexNormals();
  // Faceted normals on the segmented top paint the segment grid onto the
  // sand as ruled seam lines (round-3 critic, verified in hero-closeup).
  // The interior top is near-flat by construction; say so.
  // Blend, don't switch: the hard edge<0.9 cut drew a straight lighting
  // seam across the sand (round 22, contrast-stretched crop).
  const nrmFix=g.getAttribute('normal');
  for(let i=0;i<pos.count;i++){
    const edge=Math.max(Math.abs(pos.getX(i))/halfW,Math.abs(pos.getZ(i))/halfD);
    if(pos.getY(i)>yTop-0.45&&edge<0.97){
      const k=THREE.MathUtils.smoothstep(edge,0.82,0.97);
      const nx=nrmFix.getX(i)*k,ny=nrmFix.getY(i)*k+(1-k),nz=nrmFix.getZ(i)*k;
      const l=Math.hypot(nx,ny,nz)||1;
      nrmFix.setXYZ(i,nx/l,ny/l,nz/l);
    }
  }
  nrmFix.needsUpdate=true;

  // World-scaled UVs, projected along each face's dominant axis — a single
  // top-down projection would smear the cliff texture into vertical stripes.
  const uv=g.getAttribute('uv');
  const nrm=g.getAttribute('normal');
  for(let i=0;i<pos.count;i++){
    const px=pos.getX(i)+x,py=pos.getY(i),pz=pos.getZ(i)+z;
    if(Math.abs(nrm.getY(i))>0.6)uv.setXY(i,px/9,pz/9);
    else if(Math.abs(nrm.getX(i))>Math.abs(nrm.getZ(i)))uv.setXY(i,pz/7,py/7);
    else uv.setXY(i,px/7,py/7);
  }
  uv.needsUpdate=true;

  vcolor(g,(px,py,pz)=>{
    if(py>yTop-0.35){
      // Two world-space octaves so the beach never repeats with the 9 m
      // texture tile — the tile carries grain, THIS carries the macro
      // (round-7 gap 1: large surfaces one value end to end).
      // Amplitudes up (round 20 measured the macro at ~3% luminance —
      // present, unreadable): the 12 m damp patches and 3 m pale drifts
      // now swing ~10%.
      _c.copy(cSand).lerp(cSandLow,Math.min(1,fbm3((px+x)*0.2,11,(pz+z)*0.2)*1.35));
      _c.lerp(cSandDamp,Math.min(1,Math.max(0,fbm3((px+x)*0.09,23,(pz+z)*0.09)-0.45)*2.0));
      // Pale drift stays at the old amplitude: at 1.6 the 0.45/m octave,
      // sampled on 0.77 m vertices, printed round polka dots (round 22).
      _c.lerp(cSandPale,Math.max(0,fbm3((px+x)*0.45,31,(pz+z)*0.45)-0.55)*0.9);
      // Wet-sand band where the top meets the rim — the tide got here.
      const rim=Math.max(Math.abs(px)/halfW,Math.abs(pz)/halfD);
      return _c.lerp(cWet,THREE.MathUtils.smoothstep(rim,0.78,0.98)*0.45);
    }
    if(py>WATER_Y+0.55)return _c.copy(cSandLow).lerp(cRockHi,Math.min(1,(yTop-py)/0.9));
    if(py>WATER_Y-0.8)return _c.copy(cWet); // the tide-wet band
    return _c.copy(cRockLo).lerp(cWet,THREE.MathUtils.clamp((py-yBot)/3,0,1)*0.5);
  });

  // Sides + bottom wear the cliff material; the walkable top wears sand.
  const mesh=new THREE.Mesh(g,[cliffMat,cliffMat,sandMat,cliffMat,cliffMat,cliffMat]);
  mesh.position.set(x,0,z);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  return {mesh,solid:{minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,topY:yTop}};
}

/**
 * Boulders along an island's waterline. The carved skirt shows ~0.6 m of
 * freeboard and, sun-side-away, shades to one dark band with a hard corner
 * — the "bare extruded slab" the bar bans (round-17, crop-verified on the
 * gap platforms). Half-sunk rocks break the corner and root the platform.
 */
export function shoreRocks(solid){
  const {cliffMat}=mats();
  const {minX,maxX,minZ,maxZ}=solid;
  const w=maxX-minX,d=maxZ-minZ,per=2*(w+d);
  const n=Math.round(per*0.42);
  const parts=[],collars=[];
  for(let i=0;i<n;i++){
    // walk the perimeter by arclength, jittered
    let l=(i+rand(0.1,0.9))/n*per;
    let px,pz,nx,nz;
    if(l<w){px=minX+l;pz=minZ;nx=0;nz=-1;}
    else if((l-=w)<d){px=maxX;pz=minZ+l;nx=1;nz=0;}
    else if((l-=d)<w){px=maxX-l;pz=maxZ;nx=0;nz=1;}
    else{l-=w;px=minX;pz=maxZ-l;nx=-1;nz=0;}
    const out=rand(0.9,2.2);
    const s=rand(0.28,0.75);
    const g=new THREE.IcosahedronGeometry(1,1);
    const p=g.getAttribute('position');
    for(let j=0;j<p.count;j++){
      const k=0.72+hash3(p.getX(j)*3+i,p.getY(j)*3,p.getZ(j)*3)*0.55;
      p.setXYZ(j,p.getX(j)*k,p.getY(j)*k*0.7,p.getZ(j)*k);
    }
    g.scale(s*rand(1,1.6),s,s*rand(1,1.4));
    g.rotateY(rand(0,6.3));
    // flat facets: smooth normals on a 42-vert blob read as a pebble balloon
    const g2=g.toNonIndexed();
    g2.computeVertexNormals();
    const y=WATER_Y+rand(-0.15,0.22);
    // Round 18: the whole rock came out one dark wet brown. Dry rock above
    // the tide line, wet band only where the water actually laps.
    vcolor(g2,(vx,vy)=>{
      const wet=THREE.MathUtils.clamp((WATER_Y+0.04-(vy+y))/0.22,0,1);
      return _c.copy(cRockHi).lerp(cRockLo,hash3(vx*5,vy*5,i)*0.22).lerp(cWet,wet*0.7);
    });
    const cx=px+nx*out+rand(-0.5,0.5),cz=pz+nz*out+rand(-0.5,0.5);
    xform(g2,{p:[cx,y,cz]});
    parts.push(g2);
    // Foam collar: the sea breaks around a rock, it doesn't cut it on a
    // ruler line. A ring at the waterline, solid at the rock, fading out.
    // Inner radius past the rock's widest scale (1.6 s): at 1.15 s the
    // ring passed through the rock body and lay as a grey strip on its
    // face (round 20, crop-verified).
    const r0=s*1.75,r1=r0+rand(0.35,0.6),M=12,cp=[],cu=[],ci=[];
    for(let k=0;k<=M;k++){
      const a=k/M*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a);
      const wob=1+hash3(k+i*7,i,3)*0.25;
      cp.push(cx+ca*r0,0,cz+sa*r0, cx+ca*r1*wob,0,cz+sa*r1*wob);
      cu.push(k/M*2.5,0, k/M*2.5,1);
      if(k<M){const b=k*2;ci.push(b,b+2,b+1, b+1,b+2,b+3);}
    }
    const cg=new THREE.BufferGeometry();
    cg.setAttribute('position',new THREE.Float32BufferAttribute(cp,3));
    cg.setAttribute('uv',new THREE.Float32BufferAttribute(cu,2));
    cg.setIndex(ci);
    collars.push(cg.toNonIndexed());
  }
  const group=new THREE.Group();
  const mesh=new THREE.Mesh(mergeGeoms(parts),cliffMat);
  mesh.castShadow=true;
  mesh.receiveShadow=true;
  group.add(mesh);
  if(collars.length){
    const ft=foamTexture();
    ft.flipY=false;
    ft.wrapT=THREE.ClampToEdgeWrapping; // same trap as the island rings
    ft.needsUpdate=true;
    const cm=new THREE.Mesh(mergeGeoms(collars),new THREE.MeshBasicMaterial({
      map:ft,transparent:true,depthWrite:false,opacity:0.7,fog:true,side:THREE.DoubleSide}));
    cm.position.y=WATER_Y+0.045;
    cm.renderOrder=2;
    group.add(cm);
  }
  return group;
}

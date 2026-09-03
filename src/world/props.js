/**
 * Prop families. Floor: "no prop is a single untrimmed box" — every crate is
 * frame + corner blocks + inset plank panels, so the silhouette carries its
 * own relief before any texture arrives.
 */
import * as THREE from 'three';
import {rand} from '../core/rng.js';
import {toonMat,woodTexture,tntTexture} from '../art/materials.js';
import {mergeGeoms,xform,vcolor} from './geo.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const _c=new THREE.Color();
let crateMat=null,tntMat=null,fuseMat=null;
function mats(){
  if(!crateMat){
    crateMat=toonMat({map:woodTexture(),vertexColors:true});
    tntMat=toonMat({map:tntTexture(),vertexColors:true});
    fuseMat=toonMat({color:0x4a3a30});
  }
  return {crateMat,tntMat,fuseMat};
}

const S=1.15;   // crate size — matches the old game's collision feel

function frameGeoms(size,beam){
  const parts=[];
  const h=size/2;
  const beamBox=(sx,sy,sz,p)=>{
    // Bevelled: a hard 90° frame reads as a box with lines on it; the ref
    // crates get their relief from a chamfer that catches the ramp's edge
    // (round 22, gap 9).
    const g=new RoundedBoxGeometry(sx,sy,sz,2,Math.min(sx,sy,sz)*0.2);
    // Shrink beam UVs to a small patch: default 0..1 mapping compresses
    // the texture's plank-border strokes across each thin face into a
    // dark sawtooth strip along every top edge (round-16, crop-verified).
    const uv=g.getAttribute('uv');
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*0.16+0.3,uv.getY(i)*0.16+0.55);
    parts.push(xform(g,{p}));
  };
  // 12 edge beams…
  for(const y of[-h,h])for(const z of[-h,h])beamBox(size,beam,beam,[0,y,z]);
  for(const y of[-h,h])for(const x of[-h,h])beamBox(beam,beam,size,[x,y,0]);
  for(const x of[-h,h])for(const z of[-h,h])beamBox(beam,size,beam,[x,0,z]);
  // …and 8 corner blocks proud of them.
  for(const x of[-h,h])for(const y of[-h,h])for(const z of[-h,h])
    beamBox(beam*1.7,beam*1.7,beam*1.7,[x,y,z]);
  return parts;
}

/**
 * Core casts and receives; the frame only RECEIVES. The rails stand 3 cm
 * proud of the panel, and their own shadow boundary on that panel aliased
 * into a serrated sawtooth at every top rail (round-18, crop-verified;
 * proven shadow by a ?minfx render — bias changes did nothing, PCF radius
 * and VSM are banned above). A non-casting frame has no boundary to alias;
 * the baked crevice AO already darkens under each rail, and the core's
 * silhouette covers the frame's on the ground to within 3 cm.
 */
function splitCaster(core,frameParts,mat){
  const group=new THREE.Group();
  const c=new THREE.Mesh(core.toNonIndexed(),mat);
  c.castShadow=true;c.receiveShadow=true;
  const f=new THREE.Mesh(mergeGeoms(frameParts.map(g=>g.toNonIndexed())),mat);
  f.castShadow=false;f.receiveShadow=true;
  group.add(c,f);
  return group;
}

/**
 * @returns {{mesh:THREE.Group, solid:{minX,maxX,minZ,maxZ,topY}}}
 */
export function makeCrate(x,y,z){
  mats();
  const beam=0.13;
  const parts=[];
  // Baked crevice AO: everything darkens toward the crate's base, so a
  // stack shades itself instead of floating (Pillar B: grounded).
  const ao=(y)=>0.8+0.2*THREE.MathUtils.clamp(y/S+0.5,0,1);
  // Per-crate hue drift — a stack of one identical wood reads machine-made
  const hueJ=rand(-0.012,0.016);
  // Plank core, inset behind the frame so the faces read as panels.
  const core=new THREE.BoxGeometry(S-beam*0.9,S-beam*0.9,S-beam*0.9);
  // L 0.72–0.82 (was 0.55–0.66): the vertex colour MULTIPLIES the golden
  // wood texture, and the product put lit faces at L 0.33 and shaded
  // faces on the floor (round 22, measured). Same bug class as the
  // multiply finds of rounds 7 and 16, third instance.
  vcolor(core,(px,py)=>_c.setHSL(0.08+hueJ,0.55,rand(0.72,0.82)*ao(py)));
  for(const g of frameGeoms(S,beam))
    parts.push(vcolor(g,(px,py)=>_c.setHSL(0.07+hueJ,0.5,0.52*ao(py))));
  const mesh=splitCaster(core,parts,crateMat);
  mesh.position.set(x,y+S/2-0.02,z);
  mesh.rotation.y=rand(-0.09,0.09); // hand-stacked, not machine-placed
  const hw=S/2+0.02;
  return {mesh,solid:{minX:x-hw,maxX:x+hw,minZ:z-hw,maxZ:z+hw,topY:y+S-0.02}};
}

export function makeTNT(x,y,z){
  mats();
  const parts=[];
  const ao=(y)=>0.72+0.28*THREE.MathUtils.clamp(y/S+0.5,0,1);
  const core=new THREE.BoxGeometry(S*0.92,S*0.92,S*0.92);
  vcolor(core,(px,py)=>_c.setScalar(ao(py)));
  parts.push(core);
  for(const g of frameGeoms(S*0.92,0.11))
    parts.push(vcolor(g,(px,py)=>_c.setHSL(0.0,0.55,0.30*ao(py))));
  const core2=parts.shift();
  const body=splitCaster(core2,parts,tntMat);

  // The fuse: a little pot and a bent wick. The prop's job is to promise a
  // bang later; a plain red cube promises nothing.
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,0.1,10),fuseMat);
  pot.position.y=S*0.46+0.04;
  const wickCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,S*0.46+0.08,0),
    new THREE.Vector3(0.05,S*0.46+0.22,0.02),
    new THREE.Vector3(0.14,S*0.46+0.28,0.06)]);
  const wick=new THREE.Mesh(new THREE.TubeGeometry(wickCurve,6,0.025,5),fuseMat);

  const group=new THREE.Group();
  group.add(body,pot,wick);
  group.position.set(x,y+S*0.46,z);
  group.rotation.y=rand(-0.08,0.08);
  for(const o of [pot,wick]){o.castShadow=true;o.receiveShadow=true;}
  const hw=S*0.46+0.02;
  return {mesh:group,solid:{minX:x-hw,maxX:x+hw,minZ:z-hw,maxZ:z+hw,topY:y+S*0.92-0.02}};
}

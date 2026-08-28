/**
 * The hero model — a stylized bandicoot, replacing the round-1 capsule.
 *
 * Floor (docs/QUALITY-BAR.md): distinct silhouette at portrait range —
 * markings, ears, brow, muzzle, tail and paw shapes readable, a visible
 * outline, and a contact shadow in every framing.
 *
 * Built as a pivot hierarchy so the controller can animate limbs without a
 * rig: root -> hips -> torso -> head(ears, face) / arms / legs / tail.
 * Every solid part carries an inverted-hull outline pass.
 */
import * as THREE from 'three';
import {toonMat} from '../art/materials.js';
import {vcolor,xform,mergeGeoms} from '../world/geo.js';

const FUR=0xe0661e, FUR_DARK=0xa8440f, BELLY=0xf5d9a4, GLOVE=0x7a4620,
      SHOE=0xa03418, EAR_IN=0xe8a06a, NOSE=0x241812, MUZZLE=0xf0cf9a;

const _c=new THREE.Color();
let outlineMat=null;

/** Inverted hull: same geometry, pushed out along normals, backfaces only. */
function outline(mesh,px=0.011){
  if(!outlineMat)outlineMat=new THREE.MeshBasicMaterial({color:0x2a1408,side:THREE.BackSide,toneMapped:false});
  const g=mesh.geometry.clone();
  const pos=g.getAttribute('position'),nrm=g.getAttribute('normal');
  for(let i=0;i<pos.count;i++)
    pos.setXYZ(i,pos.getX(i)+nrm.getX(i)*px,pos.getY(i)+nrm.getY(i)*px,pos.getZ(i)+nrm.getZ(i)*px);
  const o=new THREE.Mesh(g,outlineMat);
  o.castShadow=false;
  mesh.add(o);
  return mesh;
}

function part(geo,color,{shadow=true,line=true}={}){
  const m=new THREE.Mesh(geo,toonMat({color}));
  m.castShadow=shadow;
  return line?outline(m):m;
}

/** Pear-shaped torso via lathe, back stripe painted in vertex colors. */
function torsoGeom(){
  const pts=[];
  for(let i=0;i<=10;i++){
    const t=i/10;
    // radius profile: narrow shoulders, full hips
    const r=0.30*Math.sin(t*Math.PI)*(0.72+t*0.42);
    pts.push(new THREE.Vector2(Math.max(0.001,r),t*0.62));
  }
  const g=new THREE.LatheGeometry(pts,14);
  vcolor(g,(x,y,z)=>{
    // darker saturated stripe down the back (-z), cream toward the chest
    if(z<-0.12)return _c.set(FUR_DARK);
    if(z>0.14&&y<0.5)return _c.set(BELLY);
    return _c.set(0xffffff);
  });
  return g;
}

export function createHeroModel(){
  const root=new THREE.Group();
  const hips=new THREE.Group();
  hips.position.y=0.42;
  root.add(hips);

  /* torso */
  const torso=new THREE.Mesh(torsoGeom(),toonMat({color:FUR,vertexColors:true}));
  torso.castShadow=true;
  outline(torso);
  torso.position.y=-0.06;
  hips.add(torso);

  /* head */
  const head=new THREE.Group();
  head.position.set(0,0.66,0.05);
  hips.add(head);
  const skull=part(new THREE.SphereGeometry(0.21,14,12),FUR);
  skull.scale.set(1,0.92,0.98);
  head.add(skull);
  // brow ridge — the frown-forward look every mascot carries.
  // Inner face parts skip the hull: stacked outlines on the snout read as
  // an ink tangle, not a drawing.
  const brow=part(new THREE.SphereGeometry(0.115,10,8),FUR,{line:false});
  brow.position.set(0,0.09,0.13);
  brow.scale.set(1.55,0.55,0.9);
  head.add(brow);
  // long muzzle
  const muzzle=part(new THREE.SphereGeometry(0.105,10,8),MUZZLE);
  muzzle.position.set(0,-0.045,0.21);
  muzzle.scale.set(0.95,0.72,1.55);
  head.add(muzzle);
  const jaw=part(new THREE.SphereGeometry(0.08,8,7),MUZZLE,{line:false});
  jaw.position.set(0,-0.115,0.16);
  jaw.scale.set(1.0,0.6,1.1);
  head.add(jaw);
  const nose=part(new THREE.SphereGeometry(0.045,8,6),NOSE,{line:false});
  nose.position.set(0,-0.015,0.375);
  nose.scale.set(1.2,0.85,0.9);
  head.add(nose);
  // eyes: whites + pupils, set under the brow
  for(const s of[-1,1]){
    const white=new THREE.Mesh(new THREE.SphereGeometry(0.055,10,8),
      toonMat({color:0xf8f4e8}));
    white.position.set(s*0.075,0.035,0.155);
    white.scale.set(0.9,1.15,0.7);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(0.024,8,6),
      toonMat({color:0x1c4620}));
    pupil.position.set(s*0.078,0.035,0.196);
    head.add(white,pupil);
  }
  // big ears with inner-ear plates
  const ears={};
  for(const s of[-1,1]){
    const pivot=new THREE.Group();
    pivot.position.set(s*0.13,0.16,-0.02);
    const ear=part(new THREE.SphereGeometry(0.095,9,8),FUR);
    ear.scale.set(0.62,1.6,0.35);
    ear.position.y=0.1;
    const inner=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,7),toonMat({color:EAR_IN}));
    inner.scale.set(0.42,1.3,0.22);
    inner.position.set(0,0.1,0.035);
    pivot.add(ear,inner);
    pivot.rotation.z=s*-0.28;
    pivot.rotation.x=-0.12;
    head.add(pivot);
    ears[s<0?'L':'R']=pivot;
  }
  // hair spikes over the brow
  const spikes=[];
  for(let i=0;i<3;i++){
    const sp=new THREE.ConeGeometry(0.05,0.16,6);
    xform(sp,{r:[rand2(-0.5,-0.2),0,(i-1)*0.5],p:[(i-1)*0.075,0.21,0.02]});
    spikes.push(sp);
  }
  const hair=new THREE.Mesh(mergeGeoms(spikes.map(s=>s.toNonIndexed())),toonMat({color:FUR_DARK}));
  hair.castShadow=true;
  head.add(outline(hair));

  /* arms: shoulder pivots, glove paws */
  const arms={};
  for(const s of[-1,1]){
    const shoulder=new THREE.Group();
    shoulder.position.set(s*0.27,0.42,0.04);
    const arm=part(new THREE.CapsuleGeometry(0.055,0.24,4,8),FUR);
    arm.position.y=-0.14;
    const glove=part(new THREE.SphereGeometry(0.085,10,8),GLOVE);
    glove.position.y=-0.31;
    glove.scale.set(1,0.85,1.15);
    shoulder.add(arm,glove);
    shoulder.rotation.z=s*0.55; // clear of the torso silhouette
    hips.add(shoulder);
    arms[s<0?'L':'R']=shoulder;
  }

  /* legs: hip pivots, big shoes */
  const legs={};
  for(const s of[-1,1]){
    const hip=new THREE.Group();
    hip.position.set(s*0.12,-0.02,0);
    const leg=part(new THREE.CapsuleGeometry(0.06,0.2,4,8),FUR_DARK);
    leg.position.y=-0.16;
    const shoe=part(new THREE.SphereGeometry(0.1,10,8),SHOE);
    shoe.position.set(0,-0.32,0.05);
    shoe.scale.set(0.95,0.7,1.6);
    hip.add(leg,shoe);
    hips.add(hip);
    legs[s<0?'L':'R']=hip;
  }

  /* tail: tapered curve */
  const tailPivot=new THREE.Group();
  tailPivot.position.set(0,0.06,-0.24);
  const tailCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,0,0),new THREE.Vector3(0,0.10,-0.16),
    new THREE.Vector3(0,0.26,-0.24),new THREE.Vector3(0,0.4,-0.22)]);
  const tail=part(new THREE.TubeGeometry(tailCurve,8,0.032,6),FUR_DARK);
  tailPivot.add(tail);
  hips.add(tailPivot);

  return {root,hips,head,ears,arms,legs,tailPivot};
}

function rand2(a,b){return a+(b-a)*0.5;} // fixed midpoint — model is not seeded

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

// Glove albedo is CREAM, not leather-brown: round-6 verdict called the
// gloves absent — they existed, but dark brown on orange fur in shade reads
// as nothing. A glove has to contrast the fur or it isn't there.
const FUR=0xe0661e, FUR_DARK=0xa8440f, BELLY=0xf5d9a4, GLOVE=0xefe3c8,
      CUFF=0xb98a4e, SHOE=0xa03418, EAR_IN=0xe8a06a, NOSE=0x241812,
      MUZZLE=0xf0cf9a;

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
    // Belly bib, cut by ANGLE off the chest centreline, not by depth: a
    // z-cut only reads dead-on, and every framing sees the hero in 3/4 —
    // the round-6 "egg torso" was an invisible belly plus its hard rim.
    // Wide at the belly (~77°), narrowing toward the collar, wavy fur edge.
    // Past 90° at gut height: the hero-closeup framing is a straight side
    // view, and a bib that stops short of the flank centreline vanishes
    // there entirely (measured — ±77° showed zero belly pixels).
    const ang=Math.abs(Math.atan2(x,z));
    const wav=Math.sin(y*16+Math.atan2(x,z)*5)*0.10;
    if(y<0.58&&ang<1.6-Math.max(0,y-0.38)*2.6+wav)
      return _c.set(BELLY);
    // vertex colors MULTIPLY the material color, so the material must stay
    // white and the fur painted here — cream × orange material rendered as
    // orange, which is why the round-5 belly and stripe never once read
    // (found by painting the belly magenta).
    return _c.set(FUR);
  });
  return g;
}

export function createHeroModel(){
  const root=new THREE.Group();
  const hips=new THREE.Group();
  hips.position.y=0.42;
  root.add(hips);

  /* torso */
  const torso=new THREE.Mesh(torsoGeom(),toonMat({color:0xffffff,vertexColors:true}));
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
  brow.position.set(0,0.115,0.115);
  brow.scale.set(1.5,0.48,0.85);
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
  // eyes: big whites + iris + pupil — they must READ at portrait range,
  // not hide as slits under the brow (round-5 verdict).
  for(const s of[-1,1]){
    const white=new THREE.Mesh(new THREE.SphereGeometry(0.072,12,10),
      toonMat({color:0xf8f4e8}));
    white.position.set(s*0.082,0.045,0.152);
    white.scale.set(0.85,1.25,0.7);
    const iris=new THREE.Mesh(new THREE.SphereGeometry(0.034,10,8),
      toonMat({color:0x2e7a34}));
    iris.position.set(s*0.086,0.04,0.204);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(0.017,8,6),
      toonMat({color:0x120c08}));
    pupil.position.set(s*0.088,0.04,0.228);
    head.add(white,iris,pupil);
  }
  // cheek fur tufts frame the face
  for(const s of[-1,1]){
    const tuft=new THREE.ConeGeometry(0.045,0.13,6);
    xform(tuft,{r:[0,0,s*1.9],p:[s*0.2,-0.05,0.06]});
    const m=new THREE.Mesh(tuft,toonMat({color:FUR}));
    m.castShadow=true;
    head.add(m);
  }
  // big ears with inner-ear plates — thick enough to survive a profile view
  // (round-6 verdict: "flat blade ears")
  const ears={};
  for(const s of[-1,1]){
    const pivot=new THREE.Group();
    pivot.position.set(s*0.13,0.16,-0.02);
    const ear=part(new THREE.SphereGeometry(0.095,9,8),FUR);
    ear.scale.set(0.62,1.6,0.52);
    ear.position.y=0.1;
    const inner=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,7),toonMat({color:EAR_IN}));
    inner.scale.set(0.42,1.3,0.3);
    inner.position.set(0,0.1,0.045);
    pivot.add(ear,inner);
    pivot.rotation.z=s*-0.28;
    pivot.rotation.x=-0.12;
    head.add(pivot);
    ears[s<0?'L':'R']=pivot;
  }
  // mohawk crest brow-to-crown: fur events that break the skull silhouette
  const spikes=[];
  for(let i=0;i<4;i++){
    const sp=new THREE.ConeGeometry(0.058,0.16+0.05*Math.sin(i/3*Math.PI),6);
    xform(sp,{r:[rand2(-0.5,-0.2)-i*0.18,0,(i-1.5)*0.33],
              p:[(i-1.5)*0.05,0.21-i*0.015,0.06-i*0.06]});
    spikes.push(sp);
  }
  const hair=new THREE.Mesh(mergeGeoms(spikes.map(s=>s.toNonIndexed())),toonMat({color:FUR_DARK}));
  hair.castShadow=true;
  head.add(outline(hair));

  /* arms: shoulder pivots, glove paws */
  const arms={};
  for(const s of[-1,1]){
    const shoulder=new THREE.Group();
    shoulder.position.set(s*0.25,0.42,0.04);
    // a fur ball at the pivot bridges torso and arm — without it the arm
    // floats beside the narrow chest (round-6 verdict: detached tubes)
    const ball=part(new THREE.SphereGeometry(0.08,9,8),FUR,{line:false});
    const arm=part(new THREE.CapsuleGeometry(0.055,0.24,4,8),FUR);
    arm.position.y=-0.14;
    // cream glove with knuckle bumps + a leather cuff — reads as a GLOVE
    const handG=new THREE.SphereGeometry(0.085,10,8);
    handG.scale(1,0.85,1.15);
    const knuckles=[];
    for(let k=-1;k<=1;k++){
      const b=new THREE.SphereGeometry(0.032,7,6);
      b.translate(k*0.045,-0.055,0.075);
      knuckles.push(b.toNonIndexed());
    }
    const glove=part(mergeGeoms([handG.toNonIndexed(),...knuckles]),GLOVE);
    glove.position.y=-0.31;
    const cuff=part(new THREE.CylinderGeometry(0.065,0.072,0.055,9),CUFF,{line:false});
    cuff.position.y=-0.235;
    shoulder.add(ball,arm,glove,cuff);
    shoulder.rotation.z=s*0.55; // clear of the torso silhouette
    hips.add(shoulder);
    arms[s<0?'L':'R']=shoulder;
  }

  /* chest fur tufts where the bib meets the collar — silhouette breaks */
  for(const [tx,ta] of [[-0.09,0.5],[0,0],[0.09,-0.5]]){
    const tuft=new THREE.ConeGeometry(0.038,0.11,6);
    xform(tuft,{r:[2.6,0,ta],p:[tx,0.40,0.20]});
    const m=new THREE.Mesh(tuft,toonMat({color:BELLY}));
    m.castShadow=true;
    hips.add(m);
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
  // fur tip so the tail ends in a shape, not a cut tube
  const tip=part(new THREE.ConeGeometry(0.05,0.13,6),FUR_DARK,{line:false});
  tip.position.set(0,0.44,-0.21);
  tip.rotation.x=0.35;
  tailPivot.add(tail,tip);
  hips.add(tailPivot);

  return {root,hips,head,ears,arms,legs,tailPivot};
}

function rand2(a,b){return a+(b-a)*0.5;} // fixed midpoint — model is not seeded

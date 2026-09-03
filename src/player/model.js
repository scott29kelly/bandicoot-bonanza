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
      MUZZLE=0xf0cf9a, SHORTS=0x2f5d8a;

const _c=new THREE.Color(),_c2=new THREE.Color();
let outlineMat=null;

/**
 * Inverted hull: same geometry, pushed out along normals in the VERTEX
 * SHADER, backfaces only. The push grows with view distance past 3 m, so
 * the line holds roughly constant on screen — a fixed 1.1 cm hull went
 * sub-pixel at 40 px character height and MSAA broke it into a black/white
 * checker between grass blades (round 20, crop-verified at 10x).
 */
const outlineMats=new Map();
function outlineMaterial(px){
  if(outlineMats.has(px))return outlineMats.get(px);
  const m=new THREE.MeshBasicMaterial({color:0x2a1408,side:THREE.BackSide,toneMapped:false});
  m.onBeforeCompile=(sh)=>{
    sh.uniforms.uPx={value:px};
    sh.vertexShader=sh.vertexShader
      .replace('#include <common>','#include <common>\nuniform float uPx;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        {
          vec4 olMv=modelViewMatrix*vec4(position,1.0);
          float olD=clamp(length(olMv.xyz)/3.0,1.0,3.5);
          transformed+=normal*uPx*olD;
        }`);
  };
  outlineMats.set(px,m);
  return m;
}
function outline(mesh,px=0.011){
  const g=mesh.geometry;
  const o=new THREE.Mesh(g,outlineMaterial(px));
  o.castShadow=false;
  mesh.add(o);
  return mesh;
}

// Every body part carries a warm fresnel rim: the rig's directional rim
// light never separated the hero (round-6 AND round-7 verdicts) because it
// only fires when the camera opposes it; a fresnel rims every framing.
// Tuned by aliveness test (strength 5 floods the whole body, so the
// injection works): exponent 4.5 narrows the band to the silhouette edge
// and 1.1 survives AgX + the grade's S-curve, which ate 0.32 and 0.5 —
// three critics running called the hero rimless before this.
// Round 17: at exponent 4.5 the band was 2–3 px wide and the outline hull
// sat on top of half of it — a fourth critic called the hero rimless while
// edge crops showed a faint pale line. Wider band, brighter.
// 2.2 (was 1.6): round 24 measured the rim band at V 0.55 against a lit
// body of 0.65 — present, but under the body, so it never separates.
const RIM={color:0xffe4b8,strength:2.2,power:3.4};

function part(geo,color,{shadow=true,line=true}={}){
  const m=new THREE.Mesh(geo,toonMat({color,rim:RIM}));
  m.castShadow=shadow;
  return line?outline(m):m;
}

/** Pear-shaped torso via lathe, back stripe painted in vertex colors. */
function torsoGeom(){
  const pts=[];
  for(let i=0;i<=18;i++){
    const t=i/18;
    // radius profile: narrow shoulders, full hips
    const r=0.30*Math.sin(t*Math.PI)*(0.72+t*0.42);
    pts.push(new THREE.Vector2(Math.max(0.001,r),t*0.62));
  }
  // Dense: at 14 segments the belly showed polygonal shading facets at
  // portrait range (still faintly at 24 — vcolor interpolates per vertex,
  // so the wavy bib edge is only as smooth as the mesh).
  const g=new THREE.LatheGeometry(pts,30);
  vcolor(g,(x,y,z)=>{
    // Shorts band over the hips: at portrait range a naked capsule pelvis
    // was the round-9 "bath toy" read — clothing is the cheapest thing
    // that makes a mascot a CHARACTER instead of an assembly of volumes.
    if(y<0.20)return _c.set(SHORTS);
    // darker saturated stripe down the back (-z), cream toward the chest
    if(z<-0.12)return _c.set(FUR_DARK);
    // dorsal-to-flank gradient under everything else: single-tone fur was
    // the round-14 "blow-molded plastic" read — real fur darkens dorsally
    const dorsal=THREE.MathUtils.clamp((0.06-z)/0.35,0,1);
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
    return _c.set(FUR).lerp(_c2.set(FUR_DARK),dorsal*0.55);
  });
  return g;
}

export function createHeroModel(){
  const root=new THREE.Group();
  const hips=new THREE.Group();
  hips.position.y=0.42;
  root.add(hips);

  /* torso */
  const torso=new THREE.Mesh(torsoGeom(),toonMat({color:0xffffff,vertexColors:true,rim:RIM}));
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
  // mouth: a dark smile arc plus an open grin corner — the bare hairline
  // read as "a crease with no interior" (round-13). Still a drawing, not
  // modelled dentition.
  const mouth=new THREE.Mesh(
    new THREE.TorusGeometry(0.052,0.010,5,12,Math.PI*0.75),
    toonMat({color:NOSE}));
  mouth.position.set(0,-0.075,0.30);
  mouth.rotation.set(1.25,0,Math.PI/2+Math.PI*0.375);
  mouth.castShadow=false;
  const grin=new THREE.Mesh(new THREE.SphereGeometry(0.024,8,6),toonMat({color:0x30201a}));
  grin.scale.set(1.5,0.7,0.6);
  grin.position.set(0.035,-0.095,0.315);
  grin.castShadow=false;
  head.add(mouth,grin);
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
    // Wet highlight: one unlit white dot high on the pupil. A flat disc
    // eye with no glint reads as a toy (round-18, crop-verified).
    const glint=new THREE.Mesh(new THREE.SphereGeometry(0.0075,7,6),
      new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}));
    glint.position.set(s*0.088-0.007,0.05,0.241);
    glint.castShadow=false;
    head.add(white,iris,pupil,glint);
  }
  // cheek fur tufts frame the face
  // Three thin cones fanned per cheek: the single fat cone read as "an
  // orange prism poking out of the cheek" (round 23, crop-verified).
  for(const s of[-1,1]){
    const cones=[];
    for(const [dy,dz,tilt] of [[0.02,0.02,-0.35],[-0.05,0.06,0],[-0.11,0.04,0.35]]){
      const tuft=new THREE.ConeGeometry(0.024,0.12,5);
      xform(tuft,{r:[tilt,0,s*(1.75+tilt*0.5)],p:[s*0.2,dy,dz]});
      cones.push(tuft.toNonIndexed());
    }
    const m=new THREE.Mesh(mergeGeoms(cones),toonMat({color:FUR,rim:RIM}));
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
  // Tilted back up the crown, not laid over the brow — flat they read as
  // loose shards intersecting the head (round-10, crop-verified).
  const spikes=[];
  for(let i=0;i<4;i++){
    const sp=new THREE.ConeGeometry(0.055,0.17+0.05*Math.sin(i/3*Math.PI),6);
    xform(sp,{r:[-0.35-i*0.22,0,(i-1.5)*0.22],
              p:[(i-1.5)*0.045,0.235-i*0.01,0.02-i*0.055]});
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
    // Long enough that the hands clear the belly: at 0.24 the gloves hung
    // exactly behind the torso's widest band and no pose could show them.
    const arm=part(new THREE.CapsuleGeometry(0.055,0.32,4,8),FUR);
    arm.position.y=-0.18;
    // cream glove: a palm and SEPARATE fingers. The round-17 knuckle balls
    // read as "four stacked balls" at 3x — spheres sunk into a sphere have
    // no gap for the outline to run through. Capsule fingers standing off
    // the palm give the hull pass a dark line between each digit, which is
    // what makes a glove read as a hand.
    const handG=new THREE.SphereGeometry(0.08,10,8);
    handG.scale(1.1,0.75,1.0);
    const digits=[];
    for(let k=-1;k<=1;k++){
      const f=new THREE.CapsuleGeometry(0.026,0.075,3,7);
      // splay: outer fingers fan away from the middle one
      f.rotateX(-0.95);
      f.rotateZ(k*0.28);
      f.translate(k*0.058,-0.052,0.085);
      digits.push(f.toNonIndexed());
    }
    const thumb=new THREE.CapsuleGeometry(0.026,0.06,3,7);
    thumb.rotateX(-0.5);
    thumb.rotateZ(-s*1.05);
    thumb.translate(-s*0.095,-0.005,0.045);
    digits.push(thumb.toNonIndexed());
    const glove=part(mergeGeoms([handG.toNonIndexed(),...digits]),GLOVE);
    glove.position.y=-0.39;
    const cuff=part(new THREE.CylinderGeometry(0.072,0.082,0.06,9),CUFF,{line:false});
    cuff.position.y=-0.312;
    shoulder.add(ball,arm,glove,cuff);
    shoulder.rotation.z=s*0.55; // clear of the torso silhouette
    hips.add(shoulder);
    arms[s<0?'L':'R']=shoulder;
  }

  /* chest fur tufts where the bib meets the collar — silhouette breaks */
  // Five along the bib's top edge, alternating lean: a jagged fringe
  // rather than "three flat triangles lying on the belly" (round 23).
  for(const [tx,ta,ln] of [[-0.13,0.7,0.09],[-0.065,0.3,0.12],[0,0,0.1],[0.065,-0.3,0.13],[0.13,-0.7,0.08]]){
    const tuft=new THREE.ConeGeometry(0.03,ln,5);
    xform(tuft,{r:[2.5,0,ta],p:[tx,0.41,0.19]});
    const m=new THREE.Mesh(tuft,toonMat({color:BELLY,rim:RIM}));
    m.castShadow=true;
    hips.add(m);
  }

  /* hip fur tufts — silhouette breaks where the torso is widest */
  for(const s of[-1,1]){
    const tuft=new THREE.ConeGeometry(0.045,0.14,6);
    xform(tuft,{r:[0.4,0,s*2.1],p:[s*0.27,0.16,-0.04]});
    const m=new THREE.Mesh(tuft,toonMat({color:FUR,rim:RIM}));
    m.castShadow=true;
    hips.add(m);
  }

  /* spine fur fins — the egg silhouette needs breaks from the SIDE too */
  {
    const fins=[];
    for(const [fy,fz,fh] of [[0.22,-0.245,0.10],[0.36,-0.235,0.13],[0.49,-0.19,0.11]]){
      const fin=new THREE.ConeGeometry(0.042,fh,5);
      xform(fin,{r:[-2.2,0,0],p:[0,fy,fz]});
      fins.push(fin.toNonIndexed());
    }
    const m=new THREE.Mesh(mergeGeoms(fins),toonMat({color:FUR_DARK,rim:RIM}));
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
    // pant leg over the thigh — the bare torso band alone read as briefs
    // Top snug on the leg: a loose ring read as looking down INTO an open
    // boot at the orange leg (round-12, crop-verified).
    const pant=part(new THREE.CylinderGeometry(0.063,0.072,0.09,9),SHORTS,{line:false});
    pant.position.y=-0.055; // hugs the thigh — longer read as blue wellies
    // rounded cap: mid-stride the raised knee showed the cylinder's flat
    // top disc and the leg read amputated (round-16, crop-verified)
    const knee=part(new THREE.SphereGeometry(0.065,8,7),SHORTS,{line:false});
    knee.position.y=-0.02;
    knee.scale.set(1,0.8,1);
    const shoe=part(new THREE.SphereGeometry(0.1,10,8),SHOE);
    shoe.position.set(0,-0.32,0.05);
    shoe.scale.set(0.95,0.7,1.6);
    hip.add(leg,pant,knee,shoe);
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

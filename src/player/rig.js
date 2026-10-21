/**
 * The authored hero (assets/models/hero.glb, rigged by pipeline/rig.py) behind
 * the SAME pivot interface model.js exposes: {root,hips,head,ears,arms,legs,
 * tailPivot}. hero.js keeps writing Euler angles onto those pivots; apply()
 * turns them into bone rotations each frame.
 *
 * A pivot's rotation is read as a rotation in MODEL space at the joint, the
 * way a nested Group behaves. For a bone with rest model-space rotation Rw,
 * the local rotation is rest * (Rw^-1 * D * Rw): its world rotation becomes
 * D * Rw, and every child inherits it, so chains compose like the old Groups.
 *
 * The GLB's rest pose is the concept's A-pose, which is the idle pose. Each
 * pivot's NEUTRAL is the value hero.js writes at idle, so idle = rest.
 */
import * as THREE from 'three';
import {toonMat} from '../art/materials.js';
import {outlineMaterial,RIM} from './model.js';

// hero.js's idle values (see the onGround branch), per pivot.
const NEUTRAL={
  hips:[0,0,0],head:[0,0,0],tail:[0,0,0],
  ear_L:[0,0,0.28],ear_R:[0,0,-0.28],
  arm_L:[0,0,0.13],arm_R:[0,0,-0.11],
  leg_L:[0,0,0],leg_R:[0,0,0]
};
// hero.js's arm z grows as the arms rise; on the old model that raised the
// hands across the body. Here a larger |z| lifts the arm OUTWARD, the pose
// its comments describe ("arms out flat while spinning").
const ARM_Z_SIGN={arm_L:-1,arm_R:1};
const HIPS_Y=0.42;

const _q=new THREE.Quaternion(),_e=new THREE.Euler(),_v=new THREE.Vector3();

/** The outline hull with a per-vertex width from the colour attribute
 * (rig.py: 0 on whiskers and eye whites, 1 elsewhere). WO-A13. */
function maskedHullMaterial(px){
  const m=new THREE.MeshBasicMaterial({color:0x2a1408,side:THREE.BackSide,toneMapped:false});
  m.onBeforeCompile=(sh)=>{
    sh.uniforms.uPx={value:px};
    sh.vertexShader=sh.vertexShader
      .replace('#include <common>',`#include <common>
uniform float uPx;
attribute vec4 color;`)
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        {
          vec4 olMv=modelViewMatrix*vec4(position,1.0);
          float olD=clamp(length(olMv.xyz)/4.0,1.0,2.2);
          transformed+=normal*uPx*olD*color.r;
        }`);
  };
  return m;
}

function addEyes(mesh,head){
  let eyes=null;
  try{eyes=JSON.parse(mesh.userData?.eyes??'null');}catch{eyes=null;}
  if(!eyes||!head)return;
  head.updateWorldMatrix(true,false);
  const slitMat=new THREE.MeshBasicMaterial({color:0x050506});
  const glintMat=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false});
  const up=new THREE.Vector3(0,1,0);
  for(const e of Object.values(eyes)){
    const n=new THREE.Vector3(...e.n).normalize();
    const p=new THREE.Vector3(...e.p).addScaledVector(n,e.r*0.55); // clear of the eye's bulge (cat5 bulges more)
    const side=new THREE.Vector3().crossVectors(up,n).normalize();
    const g=new THREE.Group();
    g.position.copy(p);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);
    // Lens-shaped slit: narrow, about 0.8 of the iris tall (CAT_NOTES: 1/5 wide).
    const slit=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),slitMat);
    slit.scale.set(e.r*0.17,e.r*0.78,e.r*0.05);
    const glint=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),glintMat);
    glint.scale.setScalar(e.r*0.13);
    glint.position.set(e.r*0.28,e.r*0.36,e.r*0.06);
    g.add(slit,glint);
    head.add(g);
    // Into the bone's frame: the group was composed in model space.
    g.applyMatrix4(new THREE.Matrix4().copy(head.matrixWorld).invert());
  }
}

/** A copy of geo whose normals are averaged over every vertex sharing a position. */
function smoothedNormals(geo){
  const g=geo.clone(),p=g.getAttribute('position'),n=g.getAttribute('normal');
  const sum=new Map(),key=(i)=>`${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
  for(let i=0;i<p.count;i++){
    const k=key(i),s=sum.get(k)??[0,0,0];
    s[0]+=n.getX(i);s[1]+=n.getY(i);s[2]+=n.getZ(i);sum.set(k,s);
  }
  const out=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
    const s=sum.get(key(i)),l=Math.hypot(s[0],s[1],s[2])||1;
    out[i*3]=s[0]/l;out[i*3+1]=s[1]/l;out[i*3+2]=s[2]/l;
  }
  g.setAttribute('normal',new THREE.BufferAttribute(out,3));
  return g;
}

export function createRiggedHero(gltfScene){
  const root=new THREE.Group();
  const scene=gltfScene;
  root.add(scene);
  root.updateMatrixWorld(true);

  let skinned=null;
  const bones={};
  scene.traverse(o=>{
    if(o.isSkinnedMesh)skinned=o;
    if(o.isBone)bones[o.name]=o;
  });
  if(!skinned)throw new Error('hero.glb has no skinned mesh');

  // Toon body with the old rim, plus an inverted-hull outline that rides
  // the same skeleton.
  const src=skinned.material;
  // Half the old rim: the baked albedo already carries form light, and the
  // full-strength band washed the silhouette white (round 38 crop).
  // Narrower too (power 5.5): the tail top ran +0.4 L and desaturated (p03, WO-A10).
  // 0.22x / 6.5 for the black cat: on a dark albedo the rim lifted ~7x over
  // 4 px and cut the figure out like a sticker (p04, WO-A17). Then 0.45x at
  // power 8: the silhouette edge only, >=2.5x the body (p05, WO-A21); the
  // front-face teal was sky fill, now neutralised by diffuseDesat.
  // r63 (p08 WO-A33): rim 0.8x at power 7 (~2.5x the body), a cool sheen on
  // up-facing fur, a slightly warmer base.
  skinned.material=toonMat({map:src.map??null,rim:{...RIM,strength:RIM.strength*0.63,power:8.0,cap:0.32,mapBias:1.6,diffuseDesat:0.8,tint:[0.64,0.46,0.32],tintFace:[1.16,1.0,0.82],sheen:[0.115,0.132,0.15]}});
  src.dispose();
  skinned.castShadow=true;
  skinned.frustumCulled=false; // skinned bounds do not follow the pose
  // The hull needs ONE normal per position: the mesh splits its normals at
  // 60° creases, and a hull pushed along split normals tears open at every
  // crease — at range the tears read as a speckled pale fringe (p03, WO-R07).
  const hullGeo=smoothedNormals(skinned.geometry);
  const hull=new THREE.SkinnedMesh(hullGeo,hullGeo.getAttribute('color')?maskedHullMaterial(0.007):outlineMaterial(0.007));
  hull.bind(skinned.skeleton,skinned.bindMatrix);
  hull.frustumCulled=false;
  skinned.parent.add(hull);

  // Eyes (round 53, WO-A24): the generated iris has no pupil. rig.py
  // measured each eye (centre, normal, radius); a black vertical slit and a
  // catchlight ride the head bone there, as in Scott's photos (refs/cat 10).
  addEyes(skinned,bones.head);

  const rest={};
  for(const [name,b] of Object.entries(bones)){
    rest[name]={
      q:b.quaternion.clone(),
      p:b.position.clone(),
      w:b.getWorldQuaternion(new THREE.Quaternion()),
      pw:b.parent?b.parent.getWorldQuaternion(new THREE.Quaternion()):new THREE.Quaternion()
    };
  }

  const pivot=(name)=>{
    const o=new THREE.Object3D();
    const n=NEUTRAL[name]??[0,0,0];
    o.rotation.set(n[0],n[1],n[2]);
    return o;
  };
  const hips=pivot('hips');hips.position.y=HIPS_Y;
  const head=pivot('head'),tailPivot=pivot('tail');
  const ears={L:pivot('ear_L'),R:pivot('ear_R')};
  const arms={L:pivot('arm_L'),R:pivot('arm_R')};
  const legs={L:pivot('leg_L'),R:pivot('leg_R')};
  const map=[['hips',hips],['head',head],['tail',tailPivot],
    ['ear_L',ears.L],['ear_R',ears.R],['arm_L',arms.L],['arm_R',arms.R],
    ['leg_L',legs.L],['leg_R',legs.R]].filter(([n])=>bones[n]);

  function apply(){
    for(const [name,p] of map){
      const b=bones[name],r=rest[name],n=NEUTRAL[name]??[0,0,0];
      let dz=p.rotation.z-n[2];
      if(ARM_Z_SIGN[name])dz=ARM_Z_SIGN[name]*Math.abs(p.rotation.z)-ARM_Z_SIGN[name]*Math.abs(n[2]);
      _e.set(p.rotation.x-n[0],p.rotation.y-n[1],dz);
      _q.setFromEuler(_e);                                  // D, model space
      b.quaternion.copy(r.w).invert().multiply(_q).multiply(r.w); // Rw^-1 D Rw
      b.quaternion.premultiply(r.q);                        // rest * that
    }
    // The hips bob: a model-space lift, into the parent's frame.
    if(bones.hips){
      const r=rest.hips;
      _v.set(0,hips.position.y-HIPS_Y,0).applyQuaternion(_q.copy(r.pw).invert());
      bones.hips.position.copy(r.p).add(_v);
    }
  }
  apply();

  return {root,hips,head,ears,arms,legs,tailPivot,apply};
}

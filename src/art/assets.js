/**
 * Authored assets (decision 2026-10-20: the zero-asset rule is lifted).
 * Every GLB in assets/models/ is made by pipeline/gen.py + pipeline/prep.py
 * (provenance: docs/gauntlet/ASSETS.md) and is bundled INTO index.html as a
 * data URL, so players still get one file.
 *
 * prep.py normalises each model to 1 m tall, origin at the bottom centre, so
 * a builder places it by height alone. Materials are rebuilt as toon
 * materials on the baked colour map: the ramp stays the lighting model.
 *
 * `?ablate=assets` keeps the procedural builders, so one build can be shot
 * both ways for a blind A/B.
 */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ablated} from '../core/config.js';
import {toonMat} from './materials.js';
import seaStackUrl from '../../assets/models/sea-stack.glb';
import heroUrl from '../../assets/models/hero.glb';
import jungleBushUrl from '../../assets/models/jungle-bush.glb';
import jungleTreeUrl from '../../assets/models/jungle-tree.glb';

const SOURCES={
  'sea-stack':seaStackUrl,
  'hero':heroUrl,
  'jungle-bush':jungleBushUrl,
  'jungle-tree':jungleTreeUrl
};

const loaded=new Map();

/** Load every asset before the world is built. Resolves even when ablated. */
export async function loadAssets(){
  if(ablated('assets'))return;
  const loader=new GLTFLoader();
  await Promise.all(Object.entries(SOURCES).map(async([name,url])=>{
    const gltf=await loader.loadAsync(url);
    gltf.scene.traverse(o=>{
      if(!o.isMesh||o.isSkinnedMesh)return; // skinned: src/player/rig.js builds its own
      const src=o.material;
      o.material=toonMat({map:src.map??null,color:src.map?0xffffff:src.color});
      src.dispose();
    });
    const size=new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
    loaded.set(name,{scene:gltf.scene,size});
  }));
}

/** The loaded scene itself (not a copy) — for one-off assets like the hero. */
export const getAsset=(name)=>loaded.get(name)?.scene;

/** One InstancedMesh per mesh of the asset. mats: world matrices for the
 * 1 m model; colors: optional per-instance tint (multiplies the map). */
export function instanceAsset(name,mats,colors=null){
  const {scene}=loaded.get(name);
  const group=new THREE.Group();
  scene.updateMatrixWorld(true);
  scene.traverse(o=>{
    if(!o.isMesh||!mats.length)return;
    const im=new THREE.InstancedMesh(o.geometry.clone().applyMatrix4(o.matrixWorld),o.material,mats.length);
    mats.forEach((m,i)=>im.setMatrixAt(i,m));
    if(colors)colors.forEach((c,i)=>im.setColorAt(i,c));
    im.castShadow=im.receiveShadow=false;
    group.add(im);
  });
  return group;
}

/** The asset's size at 1 m height (x = width, z = depth). */
export const assetSize=(name)=>loaded.get(name).size;

/** True when the named asset is loaded and should replace its procedural twin. */
export const hasAsset=(name)=>loaded.has(name);

/** A placed copy: height h (m), yaw (rad); w (m) sets the footprint width
 * (the larger horizontal extent), otherwise the model keeps its proportions. */
export function placeAsset(name,{p=[0,0,0],h=1,w=0,yaw=0}={}){
  const {scene,size}=loaded.get(name);
  const o=scene.clone(true);
  const k=w>0?w/(h*Math.max(size.x,size.z)):1;
  o.position.set(p[0],p[1],p[2]);
  o.rotation.y=yaw;
  o.scale.set(h*k,h,h*k);
  o.traverse(m=>{if(m.isMesh){m.castShadow=false;m.receiveShadow=false;}});
  return o;
}

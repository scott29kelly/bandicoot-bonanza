/**
 * Contact-shadow blobs. The shadow map grounds nothing at crevice scale, so
 * every prop that meets the ground gets one of these under it (Pillar B:
 * "everything is grounded"). Teal-dark, never black.
 */
import * as THREE from 'three';
import {contactTexture} from '../art/materials.js';

/** One instanced disc under every spot: the tufts and rosettes left the
 * sand with nothing under them — the base measured BRIGHTER than the open
 * sand 30 px away (round 32). No rng draws, so the seeded stream holds. */
export function contactField(spots,r,opacity=0.55){
  const mesh=new THREE.InstancedMesh(new THREE.CircleGeometry(r,14),
    new THREE.MeshBasicMaterial({map:contactTexture(),transparent:true,
      depthWrite:false,opacity}),spots.length);
  const m=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2,0,0)),
        p=new THREE.Vector3(),s=new THREE.Vector3();
  for(let i=0;i<spots.length;i++){
    const [x,y,z]=spots[i];
    const k=0.75+((i*7919)%1000)/1000*0.5; // 0.75–1.25, hashed, not drawn
    p.set(x,y+0.03,z);s.set(k,k,1);
    m.compose(p,q,s);
    mesh.setMatrixAt(i,m);
  }
  mesh.renderOrder=3;
  return mesh;
}

export function contactBlob(r,opacity=1){
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,20),
    new THREE.MeshBasicMaterial({map:contactTexture(),transparent:true,
      depthWrite:false,opacity}));
  m.rotation.x=-Math.PI/2;
  m.renderOrder=3;
  return m;
}

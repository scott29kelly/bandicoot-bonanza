/**
 * Contact-shadow blobs. The shadow map grounds nothing at crevice scale, so
 * every prop that meets the ground gets one of these under it (Pillar B:
 * "everything is grounded"). Teal-dark, never black.
 */
import * as THREE from 'three';
import {contactTexture} from '../art/materials.js';

export function contactBlob(r,opacity=1){
  const m=new THREE.Mesh(new THREE.CircleGeometry(r,20),
    new THREE.MeshBasicMaterial({map:contactTexture(),transparent:true,
      depthWrite:false,opacity}));
  m.rotation.x=-Math.PI/2;
  m.renderOrder=3;
  return m;
}

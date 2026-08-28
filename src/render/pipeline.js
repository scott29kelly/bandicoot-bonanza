/**
 * Renderer, light rig, sky and fog. SINGLE OWNER with src/art/ — exposure,
 * tonemap, fog, ambient and the toon ramp are one coupled system. Sequential
 * passes only; see docs/ARCHITECTURE.md.
 */
import * as THREE from 'three';
import {MINFX} from '../core/config.js';
import {vcolor} from '../world/geo.js';

/* The beach colour script. Jungle and temple get their own stops later. */
export const PALETTE={
  skyZenith:0x3d84c8,
  skyHorizon:0xbfe4ef,
  skyGlow:0xf6ead0,       // warm band right at the waterline
  fog:0xb9d9e4,
  sunColor:0xfff0d2,
  hemiSky:0x9fd2e8,
  hemiGround:0xc8a878     // sand bounce — ambient shade stays warm from below
};

export function createPipeline(){
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(MINFX?1:Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled=!MINFX;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // AgX, once, at the end. Light intensities below are authored AGAINST this
  // tonemapper — change one and you re-author the other (pipeline law).
  renderer.toneMapping=THREE.AgXToneMapping;
  renderer.toneMappingExposure=1.12;
  // Several passes may render per frame; with autoReset on, renderer.info
  // would only report the last one. main.js calls reset() at frame top.
  renderer.info.autoReset=false;

  const scene=new THREE.Scene();
  scene.fog=new THREE.Fog(PALETTE.fog,70,190);

  /* Sky dome: vertex-colored so it rides the same AgX + fog-free path as
     everything else. A flat background color is a banned outcome. */
  const skyGeo=new THREE.SphereGeometry(340,48,24);
  const zen=new THREE.Color(PALETTE.skyZenith),hor=new THREE.Color(PALETTE.skyHorizon),
        glow=new THREE.Color(PALETTE.skyGlow),c=new THREE.Color();
  vcolor(skyGeo,(x,y,z)=>{
    const h=THREE.MathUtils.clamp(y/340,-1,1);
    const t=Math.pow(THREE.MathUtils.clamp(h,0,1),0.55);
    c.copy(hor).lerp(zen,t);
    // Warm glow fades in continuously toward the waterline — a piecewise
    // band here is exactly the old "hard white stripe at the horizon" bug.
    return c.lerp(glow,Math.exp(-Math.abs(h)*9)*0.45);
  });
  const sky=new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));
  sky.renderOrder=-100;
  scene.add(sky);

  const hemi=new THREE.HemisphereLight(PALETTE.hemiSky,PALETTE.hemiGround,0.85);
  scene.add(hemi);

  const sun=new THREE.DirectionalLight(PALETTE.sunColor,2.3);
  sun.castShadow=!MINFX;
  sun.shadow.mapSize.set(2048,2048);
  const d=26;
  sun.shadow.camera.left=-d;sun.shadow.camera.right=d;
  sun.shadow.camera.top=d;sun.shadow.camera.bottom=-d;
  sun.shadow.camera.near=4;sun.shadow.camera.far=90;
  sun.shadow.bias=-0.0004;
  sun.shadow.normalBias=0.03;
  // Changing the ortho bounds does nothing until the projection is rebuilt —
  // without this the cascade silently stays the 10 m default box.
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun,sun.target);

  /* Sun offset is FIXED; only the cascade centre moves. Light the subject,
     not the camera. */
  const OFF=new THREE.Vector3(16,26,14);
  const _right=new THREE.Vector3(),_up=new THREE.Vector3(),_dir=new THREE.Vector3(),
        _snapped=new THREE.Vector3();
  function focusSun(focus){
    // Snap the cascade centre to the shadow map's texel grid, or every
    // camera/hero move crawls the shadow edges (artifact floor: no shimmer).
    _dir.copy(OFF).normalize();
    _right.set(1,0,0).cross(_dir).normalize();
    _up.copy(_dir).cross(_right).normalize();
    const texel=(2*d)/2048*4; // 4-texel grid: PCF taps stay stable too
    const rx=Math.round(focus.dot(_right)/texel)*texel;
    const ry=Math.round(focus.dot(_up)/texel)*texel;
    const rd=focus.dot(_dir);
    _snapped.set(0,0,0)
      .addScaledVector(_right,rx).addScaledVector(_up,ry).addScaledVector(_dir,rd);
    sun.target.position.copy(_snapped);
    sun.position.copy(_snapped).add(OFF);
  }
  focusSun(new THREE.Vector3(0,0,-6));

  return {renderer,scene,sun,hemi,sky,focusSun};
}

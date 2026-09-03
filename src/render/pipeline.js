/**
 * Renderer, light rig, sky and fog. SINGLE OWNER with src/art/ — exposure,
 * tonemap, fog, ambient and the toon ramp are one coupled system. Sequential
 * passes only; see docs/ARCHITECTURE.md.
 */
import * as THREE from 'three';
import {MINFX} from '../core/config.js';
import {vcolor} from '../world/geo.js';
import {createPost} from './post.js';

/* The beach colour script. Jungle and temple get their own stops later.
 *
 * Round-2 lesson (measured, DELTA round 1): the ramp's cool texels were
 * being washed back to warm by a warm hemisphere ground bounce — shadow
 * came out the SAME hue as the light, only darker (cool shift ~0). The
 * ambient path must be decisively cool for chromatic shadow to survive
 * multiplication by warm sand albedo. */
export const PALETTE={
  skyZenith:0x3d84c8,
  skyHorizon:0xbfe4ef,
  skyGlow:0xf6ead0,       // warm band right at the waterline
  fog:0xb9d9e4,
  sunColor:0xffdd96,      // hotter key
  hemiSky:0x55a8d2,       // saturated teal — this is what shadow is made of
  hemiGround:0xa4b9a0,    // cool moss bounce, brighter and a touch warmer (round 25)
  rim:0xcfeaff            // back light that pulls silhouettes off the ground
};

export function createPipeline(){
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(MINFX?1:Math.min(window.devicePixelRatio||1,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled=!MINFX;
  // PCFSoft, tried and returned to. The round-6 penumbra claim sent this
  // through PCF+radius (dither stipple on every receiver) and then VSM
  // (round 7-8): VSM's blurred variance erases every THIN caster's shadow —
  // fronds, grass, hero limbs are double-sided sheets, and their two faces
  // land in one texel, so the palms stopped shadowing the corridor and the
  // sun's direction became unreadable (round-8 verdict, measured against
  // round 6). Crisp edges cost less than no shadows. Do not retry either.
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // AgX, once, at the end. Light intensities below are authored AGAINST this
  // tonemapper — change one and you re-author the other (pipeline law).
  // With the post chain on, the scene renders LINEAR into the float target
  // and the composite pass applies AgX + the grade; ?minfx keeps the direct
  // path and lets the renderer tonemap instead.
  renderer.toneMapping=MINFX?THREE.AgXToneMapping:THREE.NoToneMapping;
  // 1.0 (was 1.12): round 20 measured whole-frame mean L 0.46–0.56 against
  // 0.21–0.45 in the refs — the build was high-key. Exposure, not the
  // grade, so the shadow split-tone and floor keep their tuning.
  renderer.toneMappingExposure=1.0;
  // Several passes may render per frame; with autoReset on, renderer.info
  // would only report the last one. main.js calls reset() at frame top.
  renderer.info.autoReset=false;

  const scene=new THREE.Scene();
  // Far pushed 190 -> 215: the mid sea stacks were surfacing at ~80% fog
  // and reading as translucent ghosts, which is the banned "fog as the
  // reason there is nothing there". The haze ridge still silhouettes.
  scene.fog=new THREE.Fog(PALETTE.fog,70,215);

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

  // Round-3 rebalance (DELTA round 2): two critics called the frame
  // keyless. Fill was eating the key — lit:shadow was ~7:1 in linear but
  // AgX + a lifting grade compressed it to ~15% on screen. Cut fill, raise
  // the key, and let the grade add contrast back instead of lifting.
  // 0.70 (was 0.48): round 21 measured every cast-shadow face landing on
  // a plateau at L~0.10 — the wood grain on a shaded crate wall sat below
  // the floor with the wall. Same hemi colours, so the shadow stays teal;
  // more of it, so a shaded plank still carries its lines.
  const hemi=new THREE.HemisphereLight(PALETTE.hemiSky,PALETTE.hemiGround,0.80);
  scene.add(hemi);

  // Cool rim from behind-left, shadowless: separates every silhouette from
  // the ground the way the refs do. Tracks the focus with the sun.
  const rim=new THREE.DirectionalLight(PALETTE.rim,0.65);
  scene.add(rim,rim.target);

  const sun=new THREE.DirectionalLight(PALETTE.sunColor,3.3);
  sun.castShadow=!MINFX;
  // 4096: at 2048 the ~2.5 cm texels printed a checkered step pattern into
  // every penumbra on sand ("ordered dither in shadow gradients" — three
  // critics, finally traced here and not to the texture speckle).
  sun.shadow.mapSize.set(4096,4096);
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
  // Lower sun = a TIME OF DAY. At noon-high elevation the frame had no
  // readable light direction (three critics running); ~32° stretches every
  // shadow into the story the refs tell.
  const OFF=new THREE.Vector3(20,14,12);
  const RIM_OFF=new THREE.Vector3(-12,9,-20); // opposite the key, low
  const _right=new THREE.Vector3(),_up=new THREE.Vector3(),_dir=new THREE.Vector3(),
        _snapped=new THREE.Vector3();
  function focusSun(focus){
    // Snap the cascade centre to the shadow map's texel grid, or every
    // camera/hero move crawls the shadow edges (artifact floor: no shimmer).
    _dir.copy(OFF).normalize();
    _right.set(1,0,0).cross(_dir).normalize();
    _up.copy(_dir).cross(_right).normalize();
    const texel=(2*d)/4096*4; // 4-texel grid: PCF taps stay stable too
    const rx=Math.round(focus.dot(_right)/texel)*texel;
    const ry=Math.round(focus.dot(_up)/texel)*texel;
    const rd=focus.dot(_dir);
    _snapped.set(0,0,0)
      .addScaledVector(_right,rx).addScaledVector(_up,ry).addScaledVector(_dir,rd);
    sun.target.position.copy(_snapped);
    sun.position.copy(_snapped).add(OFF);
    rim.target.position.copy(focus);
    rim.position.copy(focus).add(RIM_OFF);
  }
  focusSun(new THREE.Vector3(0,0,-6));

  const post=MINFX?null:createPost(renderer);
  const draw=(cam)=>{post?post.render(scene,cam):renderer.render(scene,cam);};
  const resize=()=>{
    renderer.setSize(window.innerWidth,window.innerHeight);
    if(post)post.setSize();
  };

  return {renderer,scene,sun,hemi,sky,focusSun,draw,resize};
}

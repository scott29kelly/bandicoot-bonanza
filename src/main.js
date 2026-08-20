/**
 * Entry point.
 *
 * This is deliberately a STUB world. Its only job is to prove the instruments
 * work on a build whose output is already known, before any art exists —
 * GA-1 before GA-2 before GA-3. Builders replace src/world, src/player and
 * src/art; they must not weaken the harness contract in src/review.
 */
import * as THREE from 'three';
import {SEED, rand} from './core/rng.js';
import {MINFX, FIXED_DT} from './core/config.js';
import {buildFramings, mark} from './review/framings.js';
import {installHarness} from './review/harness.js';

const errEl=document.getElementById('error');
const uiEl=document.getElementById('ui');
const perfEl=document.getElementById('perf');

try{

/* ---------- renderer ---------------------------------------------------- */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(MINFX?1:Math.min(window.devicePixelRatio||1,2));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=!MINFX;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.AgXToneMapping;
renderer.toneMappingExposure=1.0;
// Several passes may render per frame; with autoReset on, renderer.info would
// only ever report the last one. Reset once per frame so the stats the quality
// floors are checked against are true per-frame totals.
renderer.info.autoReset=false;
document.body.appendChild(renderer.domElement);

/* ---------- scene ------------------------------------------------------- */
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x87c5e8);
scene.fog=new THREE.Fog(0x9fd0e8,40,180);

const camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,400);
camera.position.set(6,4,8);

scene.add(new THREE.HemisphereLight(0xbde8ff,0x4a6a3a,0.6));
const sun=new THREE.DirectionalLight(0xfff2d0,1.3);
sun.position.set(14,26,16);
sun.castShadow=!MINFX;
sun.shadow.mapSize.set(2048,2048);
scene.add(sun,sun.target);

/* ---------- stub world -------------------------------------------------- */
const ground=new THREE.Mesh(
  new THREE.BoxGeometry(60,2,60),
  new THREE.MeshStandardMaterial({color:0xd8c088,roughness:0.95})
);
ground.position.y=-1;
ground.receiveShadow=true;
scene.add(ground);
mark('origin',ground);

const marker=new THREE.Mesh(
  new THREE.BoxGeometry(1.2,1.8,1.2),
  new THREE.MeshStandardMaterial({color:0xd06020,roughness:0.6})
);
marker.position.y=0.9;
marker.castShadow=true;
scene.add(marker);
// A little seeded scatter, so a seed change is visible at a glance and the
// determinism claim is testable rather than asserted.
for(let i=0;i<40;i++){
  const r=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.15,0.4),0),
    new THREE.MeshStandardMaterial({color:0x8a8a80,roughness:1}));
  r.position.set(rand(-24,24),0.1,rand(-24,24));
  r.castShadow=true;
  scene.add(r);
}

/* ---------- state ------------------------------------------------------- */
const state={
  mode:'PLAY',
  enterReview(){this.mode='REVIEW';}
};

/* ---------- camera pose override ---------------------------------------- */
let pose=null;
function setPose(p){
  pose=p;
  if(p){
    focus.set(p.lookAt[0],p.lookAt[1],p.lookAt[2]);
    // Light the SUBJECT, not the camera: a shadow cascade centred on a camera
    // 20 m back puts the framing's actual subject at the soft, wrong edge.
    sun.position.set(focus.x+14,focus.y+26,focus.z+16);
    sun.target.position.copy(focus);
  }
}
const focus=new THREE.Vector3();

/* ---------- harness ----------------------------------------------------- */
const framings=buildFramings();
const {BB,tick,dtOverride}=installHarness({
  renderer,camera,scene,state,framings,setPose,
  hideUI:(hide)=>uiEl.classList.toggle('hidden',hide),
  showPerf:(on)=>{perfEl.classList.toggle('hidden',!on);perfOn=on;},
  setPlayerPos:(p)=>marker.position.set(p[0],p[1]+0.9,p[2]),
  resetClock:()=>{t=0;}
});
if(FIXED_DT>0)BB.setFixedDt(FIXED_DT);
let perfOn=/[?&]perf/i.test(location.search);
if(perfOn)perfEl.classList.remove('hidden');

window.addEventListener('keydown',e=>{
  if(e.code==='F3'){perfOn=!perfOn;perfEl.classList.toggle('hidden',!perfOn);}
});
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
});

/* ---------- loop -------------------------------------------------------- */
const clock=new THREE.Clock();
let t=0;
function frame(){
  requestAnimationFrame(frame);
  try{
    const fixed=dtOverride();
    const dt=fixed>0?fixed:Math.min(clock.getDelta(),0.033);
    t+=dt;
    renderer.info.reset();

    if(state.mode!=='REVIEW'){
      const a=t*0.25;
      camera.position.set(Math.sin(a)*9,4.2,Math.cos(a)*9);
      camera.lookAt(0,1,0);
    }
    marker.rotation.y=t*0.7;

    if(pose){
      camera.position.set(pose.p[0],pose.p[1],pose.p[2]);
      camera.lookAt(pose.lookAt[0],pose.lookAt[1],pose.lookAt[2]);
      if(camera.fov!==pose.fov){camera.fov=pose.fov;camera.updateProjectionMatrix();}
    }
    renderer.render(scene,camera);
    tick(dt);
    if(perfOn)paintPerf();
  }catch(err){
    if(window.BB)window.BB.error=err.message;
    console.error(err);
  }
}
function paintPerf(){
  const s=BB.stats;
  perfEl.textContent=`${s.fps} fps   ${s.ms.toFixed(1)} ms\n`+
    `${(s.triangles/1000).toFixed(1)}k tris\n${s.drawCalls} draws\n`+
    `${s.geometries} geo / ${s.textures} tex\nseed ${SEED}   f${s.frame}`;
}

BB.ready=true;
frame();

}catch(err){
  window.BB=window.BB||{};
  window.BB.ready=true;
  window.BB.error=err.message;
  errEl.textContent='The game failed to start: '+err.message;
  errEl.classList.remove('hidden');
  throw err;
}

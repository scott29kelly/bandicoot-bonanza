/**
 * Entry point: compose the pipeline (one owner), the world (fan-out), the
 * hero, and the review harness. Builders replace world/player/art modules;
 * they must not weaken the contract in src/review.
 */
import * as THREE from 'three';
import {SEED} from './core/rng.js';
import {FIXED_DT} from './core/config.js';
import {buildFramings} from './review/framings.js';
import {installHarness} from './review/harness.js';
import {createPipeline} from './render/pipeline.js';
import {CFG} from './game/cfg.js';
import {createState} from './game/state.js';
import {buildBeach} from './world/beach.js';
import {createHero} from './player/hero.js';

const errEl=document.getElementById('error');
const uiEl=document.getElementById('ui');
const perfEl=document.getElementById('perf');

try{

const {renderer,scene,focusSun}=createPipeline();
document.body.appendChild(renderer.domElement);
scene.fog.near=CFG.fogNear;
scene.fog.far=CFG.fogFar;

const camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,700);

const world=buildBeach(scene);
const hero=createHero(scene,world.solids,world.spawn);
const state=createState();

/* ---------- camera pose override (review) ------------------------------- */
let pose=null;
const focus=new THREE.Vector3();
function setPose(p){
  pose=p;
  if(p){
    focus.set(p.lookAt[0],p.lookAt[1],p.lookAt[2]);
    focusSun(focus); // light the SUBJECT, not the camera
  }
}

/* ---------- harness ------------------------------------------------------ */
const framings=buildFramings();
const {BB,tick,dtOverride}=installHarness({
  renderer,camera,scene,state,framings,setPose,
  hideUI:(hide)=>uiEl.classList.toggle('hidden',hide),
  showPerf:(on)=>{perfEl.classList.toggle('hidden',!on);perfOn=on;},
  setPlayerPos:(p)=>hero.setPos(p),
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

/* ---------- loop --------------------------------------------------------- */
const clock=new THREE.Clock();
const camTarget=new THREE.Vector3();
let t=0,camSnap=true;
function frame(){
  requestAnimationFrame(frame);
  try{
    const fixed=dtOverride();
    const dt=fixed>0?fixed:Math.min(clock.getDelta(),0.033);
    t+=dt;
    renderer.info.reset();

    world.update(t);

    if(state.mode!=='REVIEW'){
      hero.update(dt,t);
      camTarget.set(hero.pos.x+CFG.camOffX,hero.pos.y+CFG.camOffY,hero.pos.z+CFG.camOffZ);
      if(camSnap){camera.position.copy(camTarget);camSnap=false;}
      else camera.position.lerp(camTarget,1-Math.exp(-dt*6));
      camera.lookAt(hero.pos.x,hero.pos.y+1.2,hero.pos.z-2);
      focusSun(hero.pos);
    }else{
      hero.place(t);
    }

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

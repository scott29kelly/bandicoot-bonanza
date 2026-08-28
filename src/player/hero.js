/**
 * The hero and his controller. Physics values are the old game's proven CFG
 * (docs/GA3-PLAN.md) — the feel is not up for redesign, only the pixels.
 *
 * The model lives in model.js (articulated pivot hierarchy); this file owns
 * input, physics, the camera-facing pose, and the procedural animation that
 * keeps the character out of the "frozen jelly" failure (Pillar F).
 */
import * as THREE from 'three';
import {CFG} from '../game/cfg.js';
import {windAt} from '../world/wind.js';
import {contactBlob} from '../world/contact.js';
import {createHeroModel} from './model.js';

export function createHero(scene,solids,spawn){
  const model=createHeroModel();
  const group=model.root;
  scene.add(group);
  // Dynamic contact blob: the floor demands a shadow under the feet in
  // EVERY framing, and the cascade alone won't ground a jump.
  const blob=contactBlob(0.5);
  scene.add(blob);

  /* ---------- input ----------------------------------------------------- */
  const keys={};
  let jumpQueued=false;
  window.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(e.code==='Space'){jumpQueued=true;e.preventDefault();}
  });
  window.addEventListener('keyup',e=>{keys[e.code]=false;});
  window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});

  /* ---------- state ------------------------------------------------------ */
  const pos=new THREE.Vector3(...spawn);
  const vel=new THREE.Vector3();
  let onGround=false,coyote=0,jumpBuf=0,canDouble=false,facing=0,runPhase=0;

  function groundAt(x,z){
    let top=-Infinity;
    for(const s of solids){
      if(x>=s.minX&&x<=s.maxX&&z>=s.minZ&&z<=s.maxZ&&s.topY>top)top=s.topY;
    }
    return top;
  }

  function respawn(){
    pos.set(...spawn);vel.set(0,0,0);onGround=false;canDouble=false;
  }

  function update(dt,t){
    const ix=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
    const iz=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);
    const acc=onGround?CFG.accel:CFG.airAccel;
    if(ix||iz){
      const inv=1/Math.hypot(ix,iz);
      vel.x+=ix*inv*acc*dt;
      vel.z+=iz*inv*acc*dt;
      facing=Math.atan2(vel.x,vel.z);
    }else if(onGround){
      const f=Math.max(0,1-dt*10);
      vel.x*=f;vel.z*=f;
    }
    const sp=Math.hypot(vel.x,vel.z);
    if(sp>CFG.runSpeed){vel.x*=CFG.runSpeed/sp;vel.z*=CFG.runSpeed/sp;}

    if(jumpQueued){jumpBuf=CFG.jumpBuffer;jumpQueued=false;}
    else jumpBuf=Math.max(0,jumpBuf-dt);
    coyote=onGround?CFG.coyote:Math.max(0,coyote-dt);
    if(jumpBuf>0){
      if(coyote>0){vel.y=CFG.jumpVel;onGround=false;coyote=0;jumpBuf=0;canDouble=true;}
      else if(canDouble){vel.y=CFG.doubleJumpVel;canDouble=false;jumpBuf=0;}
    }

    vel.y-=CFG.gravity*dt;
    const prevY=pos.y;
    pos.addScaledVector(vel,dt);

    // Land on whatever solid the feet crossed this step.
    const top=groundAt(pos.x,pos.z);
    if(vel.y<=0&&prevY>=top-0.001&&pos.y<=top){
      pos.y=top;vel.y=0;onGround=true;canDouble=false;
    }else if(pos.y>top+0.001){
      onGround=false;
    }
    // Cheap side resolution: shoved out of any solid the body overlaps.
    for(const s of solids){
      if(pos.y<s.topY-0.25&&pos.y>s.topY-2.2&&
         pos.x>s.minX-0.3&&pos.x<s.maxX+0.3&&pos.z>s.minZ-0.3&&pos.z<s.maxZ+0.3){
        const dxl=pos.x-(s.minX-0.3),dxr=(s.maxX+0.3)-pos.x;
        const dzl=pos.z-(s.minZ-0.3),dzr=(s.maxZ+0.3)-pos.z;
        const m=Math.min(dxl,dxr,dzl,dzr);
        if(m===dxl)pos.x=s.minX-0.3;else if(m===dxr)pos.x=s.maxX+0.3;
        else if(m===dzl)pos.z=s.minZ-0.3;else pos.z=s.maxZ+0.3;
        if(m===dzl||m===dzr)vel.z=0;else vel.x=0;
      }
    }

    if(pos.y<CFG.killY)respawn();
    runPhase+=dt*(4+sp*1.5);
    place(t,sp);
  }

  /* ---------- procedural animation --------------------------------------- */
  function place(t,sp=0){
    group.position.copy(pos);
    group.rotation.y=facing;

    const {hips,head,ears,arms,legs,tailPivot}=model;
    const run=THREE.MathUtils.clamp(sp/CFG.runSpeed,0,1);

    if(!onGround){
      // Airborne: legs trail, arms up, a light forward tuck.
      const up=THREE.MathUtils.clamp(vel.y/CFG.jumpVel,-1,1);
      legs.L.rotation.x=0.5-up*0.3;
      legs.R.rotation.x=0.15-up*0.3;
      arms.L.rotation.z=0.9;arms.R.rotation.z=-0.9;
      arms.L.rotation.x=arms.R.rotation.x=-0.5-up*0.4;
      hips.rotation.x=0.18-up*0.12;
      hips.position.y=0.42;
    }else{
      // Grounded: run cycle scaled by speed, breathing at rest.
      const swing=Math.sin(runPhase)*run;
      legs.L.rotation.x=swing*0.85;
      legs.R.rotation.x=-swing*0.85;
      arms.L.rotation.x=-swing*0.7;
      arms.R.rotation.x=swing*0.7;
      arms.L.rotation.z=0.55+run*0.15;
      arms.R.rotation.z=-0.55-run*0.15;
      hips.rotation.x=run*0.22;
      hips.position.y=0.42+Math.abs(Math.sin(runPhase))*0.05*run
        +(1-run)*Math.sin(t*3.1)*0.008;
    }
    head.rotation.x=-hips.rotation.x*0.7; // eyes stay level while leaning
    ears.L.rotation.z=0.28+windAt(pos.x,pos.z,t)*0.08;
    ears.R.rotation.z=-0.28-windAt(pos.x,pos.z,t*1.05)*0.08;
    tailPivot.rotation.x=Math.sin(t*2.2+runPhase*0.5)*0.16;
    tailPivot.rotation.z=Math.sin(t*1.7)*0.12;

    const gy=groundAt(pos.x,pos.z);
    if(gy>-Infinity){
      const h=Math.max(0,pos.y-gy);
      const k=THREE.MathUtils.clamp(1-h/3.5,0.25,1);
      blob.position.set(pos.x,gy+0.06,pos.z);
      blob.scale.setScalar(k);
      blob.material.opacity=k;
      blob.visible=true;
    }else blob.visible=false;
  }

  function setPos(p){
    pos.set(p[0],p[1],p[2]);
    const top=groundAt(pos.x,pos.z);
    if(top>-Infinity&&Math.abs(pos.y-top)<1.5)pos.y=top;
    vel.set(0,0,0);onGround=true;facing=0;
    // The run cycle accumulates across however many PLAY frames elapsed
    // before review() — wall-clock-dependent, so it must reset with the
    // world clock or A/A captures differ by a limb pose (det gate caught it).
    runPhase=0;
    place(0);
  }

  return {group,pos,update,setPos,place};
}

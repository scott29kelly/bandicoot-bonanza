/**
 * The hero and his controller. Physics values are the old game's proven CFG
 * (docs/GA3-PLAN.md) — the feel is not up for redesign, only the pixels.
 *
 * The MODEL here is a declared round-1 placeholder: a dressed capsule so the
 * framings have a subject and a contact shadow. The real character is its own
 * workstream. The CONTROLLER is meant to be final.
 */
import * as THREE from 'three';
import {CFG} from '../game/cfg.js';
import {toonMat} from '../art/materials.js';
import {windAt} from '../world/wind.js';

export function createHero(scene,solids,spawn){
  /* ---------- placeholder body ----------------------------------------- */
  const group=new THREE.Group();
  const furMat=toonMat({color:0xd2622a});
  const bellyMat=toonMat({color:0xe8c690});
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.34,0.5,6,12),furMat);
  body.position.y=0.62;
  const belly=new THREE.Mesh(new THREE.CapsuleGeometry(0.30,0.42,5,10),bellyMat);
  belly.position.set(0,0.60,0.09);
  belly.scale.set(0.72,0.8,0.6);
  const muzzle=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.16,0.26),bellyMat);
  muzzle.position.set(0,0.98,0.3);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),toonMat({color:0x2a1c14}));
  nose.position.set(0,1.0,0.45);
  const earGeo=new THREE.ConeGeometry(0.1,0.3,7);
  const earL=new THREE.Mesh(earGeo,furMat);
  earL.position.set(-0.17,1.34,0.02);earL.rotation.z=0.25;
  const earR=new THREE.Mesh(earGeo,furMat);
  earR.position.set(0.17,1.34,0.02);earR.rotation.z=-0.25;
  const tail=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.05,0.55,6),furMat);
  tail.position.set(0,0.5,-0.4);tail.rotation.x=1.1;
  group.add(body,belly,muzzle,nose,earL,earR,tail);
  group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=false;}});
  scene.add(group);

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
  let onGround=false,coyote=0,jumpBuf=0,canDouble=false,facing=0;

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
    place(t,sp);
  }

  /** Idle/locomotion dressing on the placeholder — never frozen (Pillar F). */
  function place(t,sp=0){
    group.position.copy(pos);
    group.rotation.y=facing;
    const breathe=1+Math.sin(t*3.1)*0.015;
    body.scale.set(1,breathe,1);
    group.position.y=pos.y+(onGround?Math.abs(Math.sin(t*sp*1.4))*0.05*Math.min(1,sp/4):0);
    earL.rotation.z=0.25+windAt(pos.x,pos.z,t)*0.06;
    earR.rotation.z=-0.25+windAt(pos.x,pos.z,t*1.05)*0.06;
    tail.rotation.x=1.1+Math.sin(t*2.2)*0.1;
  }

  function setPos(p){
    pos.set(p[0],p[1],p[2]);
    const top=groundAt(pos.x,pos.z);
    if(top>-Infinity&&Math.abs(pos.y-top)<1.5)pos.y=top;
    vel.set(0,0,0);onGround=true;facing=0;
    place(0);
  }

  return {group,pos,update,setPos,place};
}

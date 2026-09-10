/**
 * Gameplay rules (M2): fruit pickup, crate and TNT breaking, checkpoints
 * and respawn. Ported from the old game (origin/claude/aaa-visual-quality
 * index.html) with the physics CFG verbatim. This module owns the game
 * counters and the HUD; the hero owns movement and reports contacts
 * through hooks (onLand, onSpin, onFall).
 *
 * No random draws here: a scripted fixed-step run must replay exactly.
 * Effects (debris, sparks, flash, trauma) are the render owner's, WO-F08.
 */
import * as THREE from 'three';
import {CFG} from './cfg.js';

const _p=new THREE.Vector3();

export function createRules({world,hero,hud}){
  const {fruit,crates,tnts,checkpoints,spawn}=world;
  const st={
    fruit:0,fruitTotal:fruit.pos.length,
    crates:0,crateTotal:crates.length+tnts.length,
    lives:CFG.lives,checkpoint:0,deaths:0,explosions:0
  };
  let respawn=[...spawn];

  const paint=()=>hud&&hud.paint(st);

  /* ---------- fruit ------------------------------------------------------ */
  function collect(i){
    if(!fruit.alive[i])return;
    fruit.hide(i);
    st.fruit++;
    paint();
  }
  // Old rule: hero centre at pos.y+0.8, pickup when d^2 < 1.35.
  function pickupAt(px,py,pz,r2){
    for(let i=0;i<fruit.pos.length;i++){
      if(!fruit.alive[i])continue;
      const f=fruit.pos[i];
      const dx=f[0]-px,dy=f[1]-py,dz=f[2]-pz;
      if(dx*dx+dy*dy+dz*dz<r2)collect(i);
    }
  }

  /* ---------- crates + TNT ---------------------------------------------- */
  function breakCrate(c){
    if(c.broken)return;
    c.broken=true;c.solid.dead=true;c.mesh.visible=false;
    st.crates++;
    paint();
  }
  function arm(t,delay=CFG.tntFuse){
    if(t.armed||t.exploded)return;
    t.armed=true;t.fuse=delay;
  }
  function explode(t){
    if(t.exploded)return;
    t.exploded=true;t.armed=false;
    t.solid.dead=true;t.mesh.visible=false;
    t.mesh.scale.setScalar(1);
    st.crates++;st.explosions++;
    const p=t.mesh.position;
    for(const c of crates)if(!c.broken&&c.mesh.position.distanceTo(p)<CFG.tntRadius)breakCrate(c);
    // Chain: the old game used rand(0.15,0.35); a fixed 0.25 keeps the
    // scripted run replayable without touching the seeded stream.
    for(const o of tnts)if(o!==t&&!o.exploded&&o.mesh.position.distanceTo(p)<CFG.tntRadius)arm(o,0.25);
    if(hero.pos.distanceTo(p)<CFG.tntRadius+0.5)die('tnt');
    paint();
  }
  function tntUpdate(dt){
    for(const t of tnts){
      if(!t.armed||t.exploded)continue;
      t.fuse-=dt;
      // The old pulse: the box swells on the fuse so a player reads "armed".
      t.mesh.scale.setScalar(1+0.08*Math.abs(Math.sin(t.fuse*16)));
      if(t.fuse<=0)explode(t);
    }
  }

  /* ---------- checkpoints ------------------------------------------------ */
  function activate(cp){
    if(cp.activated)return;
    cp.activated=true;
    cp.setLit(true);
    st.checkpoint=cp.idx;
    respawn=cp.respawn?[...cp.respawn]:[cp.x,cp.topY+0.1,cp.z+1.2];
    paint();
  }
  function checkpointUpdate(dt,t){
    const p=hero.pos;
    for(const cp of checkpoints){
      if(!cp.activated&&Math.abs(p.z-cp.z)<1.4&&Math.abs(p.x-cp.x)<7&&Math.abs(p.y-cp.topY)<2.8)activate(cp);
    }
  }

  /* ---------- lives ------------------------------------------------------ */
  function die(cause){
    st.lives--;st.deaths++;
    if(st.lives<=0)fullReset();
    else hero.respawnAt(respawn);
    paint();
  }
  function fullReset(){
    st.lives=CFG.lives;st.fruit=0;st.crates=0;st.checkpoint=0;
    respawn=[...spawn];
    fruit.reset();
    for(const c of crates){c.broken=false;c.solid.dead=false;c.mesh.visible=true;}
    for(const t of tnts){t.exploded=false;t.armed=false;t.fuse=0;t.solid.dead=false;t.mesh.visible=true;t.mesh.scale.setScalar(1);}
    for(const cp of checkpoints){cp.activated=false;cp.setLit(false);}
    hero.respawnAt(respawn);
    paint();
  }

  /* ---------- hero hooks -------------------------------------------------- */
  const hooks={
    // The hero landed on a solid. Return 'bounce' to take the crate bounce.
    onLand(solid){
      const e=solid.ent;
      if(!e)return;
      if(e.type==='crate'){breakCrate(e.obj);return 'bounce';}
      if(e.type==='tnt'){arm(e.obj);return 'bounce';}
    },
    // Called every frame the spin is active, at the hero's centre.
    onSpin(px,py,pz){
      const R=CFG.spinRadius;
      for(const c of crates){
        if(c.broken)continue;
        const m=c.mesh.position;
        if(Math.abs(m.y-py)<1.8&&(m.x-px)*(m.x-px)+(m.z-pz)*(m.z-pz)<R*R)breakCrate(c);
      }
      for(const t of tnts){
        if(t.exploded||t.armed)continue;
        const m=t.mesh.position;
        if(Math.abs(m.y-py)<1.8&&(m.x-px)*(m.x-px)+(m.z-pz)*(m.z-pz)<R*R)arm(t);
      }
      pickupAt(px,py,pz,(R+0.3)*(R+0.3));
    },
    onFall(){die('pit');}
  };

  function update(dt,t){
    _p.copy(hero.pos);
    pickupAt(_p.x,_p.y+0.8,_p.z,1.35);
    tntUpdate(dt);
    checkpointUpdate(dt,t);
  }

  /** Read-only view for tools (window.BB.game()). */
  function snapshot(){
    return {...st,respawn:[...respawn],hero:[hero.pos.x,hero.pos.y,hero.pos.z],
      tnt:tnts.map(t=>({armed:t.armed,fuse:t.fuse,exploded:t.exploded})),
      fruitAlive:Array.from(fruit.alive).filter(Boolean).length,
      cratesLeft:crates.filter(c=>!c.broken).length};
  }

  paint();
  return {hooks,update,snapshot,state:st,fullReset};
}

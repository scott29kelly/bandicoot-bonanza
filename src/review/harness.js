/**
 * window.BB — the seam every instrument in tools/ drives.
 *
 * This is a CONTRACT, not a debug convenience. A build that cannot satisfy it
 * cannot be reviewed, and an unreviewable build cannot enter the loop. See
 * docs/ARCHITECTURE.md for the interface and why each piece is load-bearing.
 */
import {SEED} from '../core/rng.js';

export function installHarness(ctx){
  const {renderer,camera,scene,state,framings,hideUI,showPerf,setPlayerPos}=ctx;
  const settles=[];
  const stats={frame:0,fps:0,ms:0,triangles:0,drawCalls:0,programs:0,geometries:0,textures:0};
  let fixedDt=0,fpsAcc=0,fpsN=0;

  const BB={
    version:'2.0.0-rebuild',
    seed:SEED,
    ready:false,
    error:null,
    stats,
    framings:framings.map(f=>({id:f.id,name:f.name,tests:f.tests,fov:f.fov})),

    /* Render exactly n more frames, then resolve. A screenshot taken before
       the scene has settled is a screenshot of a transient — a camera mid-lerp,
       a fresh shadow cascade — not of the build being judged. */
    settle(n){return new Promise(res=>settles.push({left:Math.max(1,n|0),res}));},

    /* Pin the timestep. Without this, n settle frames advance the world by a
       different amount every run and a pixel diff drowns in phase noise. */
    setFixedDt(v){fixedDt=v>0?v:0;},

    setPose(pose){ctx.setPose(pose);},
    clearPose(){ctx.setPose(null);},
    setUI(on){hideUI(!on);},
    perf(on){showPerf(!!on);},

    review(id){
      const f=framings.find(x=>x.id===id);
      if(!f)throw new Error('no such framing: '+id);
      state.enterReview();
      /* Zero the world clock. settle(n) counts FRAMES, but the number of
         frames that elapse between boot and this call depends on how fast the
         driving tool round-trips — so without this, two runs capture the same
         framing at slightly different world-times and an A/A diff is nonzero.
         Reset here and settle(n) always lands at exactly t = n*dt. */
      if(ctx.resetClock)ctx.resetClock();
      if(f.player&&setPlayerPos)setPlayerPos(f.player);
      ctx.setPose(f);
      return {id:f.id,name:f.name,tests:f.tests,p:f.p,lookAt:f.lookAt,fov:f.fov};
    }
  };

  /** Called once per frame, AFTER the render, by the main loop. */
  function tick(dt){
    const ri=renderer.info;
    stats.frame++;
    // renderer.info.autoReset is off and reset() runs at the top of the frame,
    // so these are true per-FRAME totals across every pass, not just the last.
    stats.triangles=ri.render.triangles;
    stats.drawCalls=ri.render.calls;
    stats.programs=ri.programs?ri.programs.length:0;
    stats.geometries=ri.memory.geometries;
    stats.textures=ri.memory.textures;
    fpsAcc+=dt;fpsN++;
    if(fpsAcc>=0.25){stats.fps=Math.round(fpsN/fpsAcc);stats.ms=Math.round(fpsAcc/fpsN*10000)/10;fpsAcc=0;fpsN=0;}
    for(let i=settles.length-1;i>=0;i--){
      if(--settles[i].left<=0){const r=settles[i].res;settles.splice(i,1);r();}
    }
  }

  window.BB=BB;
  return {BB,tick,dtOverride:()=>fixedDt};
}

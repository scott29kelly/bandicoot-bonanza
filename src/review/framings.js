/**
 * Composed review framings — the art-review contact sheet, in code.
 *
 * These are not gameplay cameras. Each one is composed to exercise a named
 * clause of docs/QUALITY-BAR.md, so a verdict is repeatable across builds
 * instead of re-derived by eye every round.
 *
 * WHY THEY RESOLVE FROM LIVE LEVEL DATA. Hard-coded world coordinates go stale
 * silently: the level moves, the framing keeps shooting, and the ranked delta
 * list ends up read against poses that no longer show what they claim to show.
 * Far Country hit exactly this — by the time anyone checked, not one of its
 * four written-down poses still framed the city. Every framing here takes its
 * anchor from a landmark the world builder registered, so a re-laid-out beat
 * carries its framing with it.
 */

/** Landmarks the world registers as it builds. Framings anchor to these. */
export const LM = {};
export const mark = (name, obj) => (LM[name] = obj, obj);

/**
 * @returns {Array<{id,name,tests,p,lookAt,fov,player}>}
 */
export function buildFramings(){
  const F=[];
  const add=(id,name,tests,p,lookAt,fov,player=null)=>F.push({id,name,tests,p,lookAt,fov,player});
  const at=(key,dx=0,dy=0,dz=0)=>{
    const o=LM[key];
    if(!o)throw new Error(`framing anchored to unregistered landmark "${key}"`);
    const q=o.position||o;
    return [q.x+dx,q.y+dy,q.z+dz];
  };
  // Framings are added by the world modules as their beats come online, via
  // addFraming() below. (The stub's hard-coded origin framings retired when
  // the real world landed — GA3-PLAN.md round 1.)
  void add;
  for(const f of EXTRA)F.push(typeof f==='function'?f(at):f);
  return F;
}

const EXTRA=[];
/** World modules call this as they build, so framings live beside their subject. */
export function addFraming(f){EXTRA.push(f);}

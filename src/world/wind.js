/**
 * THE wind field. One field, shared by every plant — per-object phases that
 * agree with nothing are exactly the "world is frozen jelly" failure the
 * quality bar bans (Pillar F).
 *
 * Returns a signed sway scalar; callers scale it by their own stiffness.
 * Spatial terms make gusts TRAVEL across the beach instead of pulsing it.
 */
export function windAt(x,z,t){
  return Math.sin(t*1.6+x*0.13+z*0.09)*0.6
       + Math.sin(t*0.7+x*0.045-z*0.06+1.7)*0.3
       + Math.sin(t*2.9+z*0.21)*0.1;
}

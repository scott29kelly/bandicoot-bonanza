/**
 * The one source of randomness in the build.
 *
 * Every random draw — texture speckle, foliage scatter, sway phases, particle
 * jitter — goes through here, keyed off ?seed=N. Two contact sheets are only
 * comparable if the world underneath them is the same world, and Math.random()
 * cannot promise that. Using Math.random() anywhere in src/ is a defect.
 */
const m=/[?&]seed=(-?\d+)/i.exec(location.search);
export const SEED=m?(parseInt(m[1],10)|0):0x5eed1e;

let _a=SEED>>>0;
/** Uniform [0,1). mulberry32. */
export function rnd(){
  _a=(_a+0x6D2B79F5)>>>0;
  let t=_a;
  t=Math.imul(t^(t>>>15),t|1);
  t^=t+Math.imul(t^(t>>>7),t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
}
export const rand=(a,b)=>a+rnd()*(b-a);
export const randInt=(a,b)=>Math.floor(rand(a,b+1));
export const pick=(arr)=>arr[Math.floor(rnd()*arr.length)];

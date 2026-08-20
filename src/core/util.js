export const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
export const lerp=(a,b,t)=>a+(b-a)*t;
/** Frame-rate independent smoothing factor. */
export const damp=(rate,dt)=>1-Math.exp(-rate*dt);
export function fmtTime(s){const m=Math.floor(s/60),r=Math.floor(s%60);return m+':'+(r<10?'0':'')+r;}

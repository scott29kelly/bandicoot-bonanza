/** ?minfx — shadows and post off, for slow GPUs and for ablation controls. */
export const MINFX=/[?&]minfx/i.test(location.search);
/** ?ablate=<system> — turn ONE system off so a critic can prove it matters. */
export const ABLATE=(function(){
  const m=/[?&]ablate=([a-z0-9,]+)/i.exec(location.search);
  return new Set(m?m[1].toLowerCase().split(','):[]);
})();
export const ablated=(name)=>ABLATE.has(name);

/**
 * ?fixeddt=<seconds> — pin the timestep from the FIRST frame.
 *
 * Setting this after boot is not good enough: the frames between boot and the
 * harness call advance the world by real wall-clock time, so two runs of the
 * same seed drift apart before anything is captured. Measured at 0.01% of
 * pixels — small, but it means "identical build, identical seed" was not
 * bit-identical, and a pixel diff you cannot trust at zero is a pixel diff you
 * cannot trust anywhere.
 */
export const FIXED_DT=(function(){
  const m=/[?&]fixeddt=([0-9.]+)/i.exec(location.search);
  return m?parseFloat(m[1]):0;
})();

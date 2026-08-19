/**
 * Capture verification — the "broken instruments" doctrine.
 *
 * A render farm once delivered a structurally perfect PNG: right size, valid
 * signature, matching checksum, and solid black. Every check verified the
 * FILE; nothing looked at the PICTURE. This module looks at the picture.
 *
 * It exists because that exact failure happened here on 2026-08-19: a new AO
 * pass returned full occlusion on every pixel, and tools/shots.mjs cheerfully
 * reported nine framings, plausible triangle counts and plausible draw calls
 * for a contact sheet of near-black rectangles.
 *
 * Three verdicts, never two:
 *   PASS       — decoded, and the picture is a picture
 *   FAIL       — decoded, and it is not
 *   UNMEASURED — could not decode or could not judge; NOT a pass
 *
 * Thresholds are deliberately loose. They are here to catch black frames,
 * white frames and flat frames, not to grade art — that is what the contact
 * sheet and the critics are for. Never move one to make an artifact pass.
 */
import sharp from 'sharp';

export const PASS='PASS', FAIL='FAIL', UNMEASURED='UNMEASURED';

/** Loose enough to catch only genuine breakage. */
export const GATE={
  minLuma: 0.045,   // below this the frame is black
  maxLuma: 0.965,   // above this the frame is blown out
  minStdDev: 0.020, // below this the frame is one flat colour
  minChannelSpread: 0.004 // below this the frame is a single hue with no detail
};

/**
 * Decode a captured still and judge whether it is an image at all.
 * Returns {verdict, luma, stdDev, spread, reasons[]}.
 */
export async function gateImage(file){
  let stats;
  try{
    stats=await sharp(file).stats();
  }catch(err){
    return {verdict:UNMEASURED,reasons:['could not decode: '+err.message]};
  }
  const ch=stats.channels;
  if(!ch||ch.length<3)return {verdict:UNMEASURED,reasons:['fewer than 3 channels decoded']};
  const [r,g,b]=ch;
  const luma=(0.2126*r.mean+0.7152*g.mean+0.0722*b.mean)/255;
  const stdDev=(0.2126*r.stdev+0.7152*g.stdev+0.0722*b.stdev)/255;
  const spread=(Math.abs(r.mean-g.mean)+Math.abs(g.mean-b.mean)+Math.abs(r.mean-b.mean))/(3*255);
  const reasons=[];
  if(luma<GATE.minLuma)reasons.push(`mean luminance ${luma.toFixed(4)} < ${GATE.minLuma} (black frame)`);
  if(luma>GATE.maxLuma)reasons.push(`mean luminance ${luma.toFixed(4)} > ${GATE.maxLuma} (blown out)`);
  if(stdDev<GATE.minStdDev)reasons.push(`luminance std dev ${stdDev.toFixed(4)} < ${GATE.minStdDev} (flat frame, no variance)`);
  if(stdDev<GATE.minStdDev&&spread<GATE.minChannelSpread)reasons.push(`single flat hue, spread ${spread.toFixed(4)}`);
  return {
    verdict: reasons.length?FAIL:PASS,
    luma, stdDev, spread, reasons
  };
}

/** One-line summary for a shot log. */
export function gateLine(g){
  if(g.verdict===PASS)return `PASS  luma ${g.luma.toFixed(3)} sd ${g.stdDev.toFixed(3)}`;
  if(g.verdict===FAIL)return `FAIL  ${g.reasons.join('; ')}`;
  return `UNMEASURED  ${g.reasons.join('; ')}`;
}

/**
 * Negative controls — tests that MUST fail. If a synthetic black frame passes
 * the gate, the gate is broken and every PASS it has ever issued is worthless.
 * Run before trusting a sheet.
 */
export async function selfTest(){
  const mk=(r,g,b)=>sharp({create:{width:64,height:64,channels:3,background:{r,g,b}}}).png().toBuffer();
  const cases=[
    ['solid black', await mk(0,0,0), FAIL],
    ['solid white', await mk(255,255,255), FAIL],
    ['flat mid grey', await mk(128,128,128), FAIL],
    ['flat dark blue (the AO failure)', await mk(4,12,44), FAIL]
  ];
  // A real gradient with variance must PASS, or the gate rejects everything.
  const grad=await sharp({create:{width:64,height:64,channels:3,background:{r:0,g:0,b:0}}})
    .composite([{input:Buffer.from(
      '<svg width="64" height="64"><defs><linearGradient id="g"><stop offset="0" stop-color="#102030"/><stop offset="1" stop-color="#e0d0a0"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/></svg>'
    )}]).png().toBuffer();
  cases.push(['gradient (must pass)', grad, PASS]);

  let bad=0;
  for(const [name,buf,want] of cases){
    const got=(await gateImage(buf)).verdict;
    const ok=got===want;
    if(!ok)bad++;
    console.log(`  ${ok?'ok  ':'BAD '} ${name.padEnd(34)} want ${want}, got ${got}`);
  }
  if(bad){
    console.error(`[verify] SELF-TEST FAILED (${bad}) — the gate cannot be trusted`);
    return false;
  }
  console.log('[verify] self-test passed: the gate rejects black, white and flat frames');
  return true;
}

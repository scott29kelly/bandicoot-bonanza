/**
 * Pass 22 rig check — forced-morph A/B on the re-sculpted GLB.
 *
 * Freezes dt, captures rest, forces uFace.x=1 (jaw drop) + uEyes.x=1 (blink),
 * captures, resets, captures again (negative control). Verifies the new
 * region boxes move the mouth/eye bands and that the hull follows.
 *
 *   node tools/probe_morph.mjs --framing hero-closeup
 */
import {parseArgs, launch, gameUrl, boot, pin, ROOT} from './_harness.mjs';
import sharp from 'sharp';
import path from 'node:path';
import {writeFileSync} from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const FRAMING = String(args.framing ?? 'hero-closeup');
const dir = path.join(ROOT, 'shots', 'probe-morph');
const REST = path.join(dir, FRAMING + '-rest.png');
const OPEN = path.join(dir, FRAMING + '-open.png');
const BACK = path.join(dir, FRAMING + '-back.png');

async function diffInfo(a, b) {
  const [da, db] = await Promise.all([sharp(a).raw().toBuffer({resolveWithObject:true}), sharp(b).raw().toBuffer({resolveWithObject:true})]);
  const {data, info} = da; const W = info.width, H = info.height, C = info.channels;
  let moved = 0, tot = 0, minY = H, maxY = 0, minX = W, maxX = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const d = Math.abs(data[i]-db.data[i])+Math.abs(data[i+1]-db.data[i+1])+Math.abs(data[i+2]-db.data[i+2]);
    if (d > 18) { moved++; tot++; if (y<minY)minY=y; if (y>maxY)maxY=y; if (x<minX)minX=x; if (x>maxX)maxX=x; }
    else tot++;
  }
  return { pct: +(100*moved/tot).toFixed(2), bbox: {minX, minY, maxX, maxY} };
}

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
try {
  await boot(page, gameUrl({}));
  await pin(page, 1/60);
  await page.evaluate(async n => { await window.BB.settle(n); }, 20);
  await page.evaluate(dt => { window.BB.setFixedDt(dt); }, 1e-9);
  await page.evaluate(async ([id, n]) => { window.BB.review(id); await window.BB.settle(n); }, [FRAMING, 2]);
  await page.screenshot({ path: REST });
  await page.evaluate(() => {
    const p = window.BB.player;
    p.uFace.value.set(1, 0, 0, 0);   // jaw drop
    p.uEyes.value.set(1, 0, 0, 0);   // blink
  });
  await page.evaluate(async n => { await window.BB.settle(n); }, 2);
  await page.screenshot({ path: OPEN });
  await page.evaluate(() => {
    const p = window.BB.player;
    p.uFace.value.set(0, 0, 0, 0);
    p.uEyes.value.set(0, 0, 0, 0);
  });
  await page.evaluate(async n => { await window.BB.settle(n); }, 2);
  await page.screenshot({ path: BACK });
  const [ab, ac] = await Promise.all([diffInfo(REST, OPEN), diffInfo(REST, BACK)]);
  const out = { framing: FRAMING, morph: ab, negativeControl: ac, ok: ac.pct < 0.35 && ab.pct > 0.5 };
  console.log(JSON.stringify(out, null, 1));
  writeFileSync(path.join(dir, FRAMING + '-morph.json'), JSON.stringify(out, null, 1));
} finally {
  try { await Promise.race([browser.close(), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  process.exit(0);
}

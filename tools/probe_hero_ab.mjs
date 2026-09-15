/**
 * Pass 22 hero hue-fix A/B — frozen-dt, SAME page load.
 *
 * Boots once, pins dt, applies the framing, captures state A (uHueStr=1),
 * toggles the uniform to 0 in place, settles 2 frozen frames, captures B.
 * Camera, heading and world phase are identical across A/B by construction,
 * so pixel diffs isolate the hue-fix stage exactly.
 *
 *   node tools/probe_hero_ab.mjs --framing hero-closeup
 */
import {parseArgs, launch, gameUrl, boot, pin, ROOT} from './_harness.mjs';
import sharp from 'sharp';
import path from 'node:path';
import {writeFileSync} from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const FRAMING = String(args.framing ?? 'hero-closeup');
const dir = path.join(ROOT, 'shots', 'probe-ab');
const A = path.join(dir, FRAMING + '-hue-on.png');
const B = path.join(dir, FRAMING + '-hue-off.png');

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d > 1e-6) {
    if (mx === r) h = ((g - b) / d + 6) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h, s: mx === 0 ? 0 : d / mx, v: mx };
}

async function furStats(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const fur = [];
  const cool = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    const i = (y * W + x) * C;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const { h, s, v } = rgbToHsv(r, g, b);
    if (s > 0.22 && v > 0.08 && h > 0.005 && h < 0.14) fur.push({ r, g, b, h, s, v });
    else if (s > 0.18 && v > 0.10 && h > 0.52 && h < 0.80) cool.push({ r, g, b, h, s, v });
  }
  const mean = a => a.reduce((t, p) => t + p, 0) / (a.length || 1);
  const vs = fur.map(p => p.v).sort((a, b) => a - b);
  const q = f => vs.length ? vs[Math.min(vs.length - 1, Math.floor(vs.length * f))] : 0;
  const shadow = fur.filter(p => p.v <= q(0.25));
  const rep = a => ({
    n: a.length,
    rgb: a.length ? [mean(a.map(p => p.r)), mean(a.map(p => p.g)), mean(a.map(p => p.b))].map(n => +n.toFixed(0)) : null,
    sat: +mean(a.map(p => p.s)).toFixed(3),
    hue: +(mean(a.map(p => p.h)) * 360).toFixed(1),
    val: +mean(a.map(p => p.v)).toFixed(3)
  });
  const meanC = a => a.reduce((t, p) => t + p, 0) / (a.length || 1);
  const coolRep = cool.length ? {
    n: cool.length,
    rgb: [meanC(cool.map(p => p.r)), meanC(cool.map(p => p.g)), meanC(cool.map(p => p.b))].map(n => +n.toFixed(0)),
    sat: +meanC(cool.map(p => p.s)).toFixed(3),
    hue: +(meanC(cool.map(p => p.h)) * 360).toFixed(1),
    val: +meanC(cool.map(p => p.v)).toFixed(3)
  } : null;
  return {
    furTotal: fur.length,
    coolFur: coolRep,
    vPct: { p10: +q(0.10).toFixed(3), p50: +q(0.50).toFixed(3), p90: +q(0.90).toFixed(3) },
    shadow: rep(shadow),
    shadowHueMix: shadow.length ? {
      emberLt28: +(shadow.filter(p => p.h * 360 < 28).length / shadow.length).toFixed(3),
      mud28to55: +(shadow.filter(p => p.h * 360 >= 28 && p.h * 360 < 55).length / shadow.length).toFixed(3),
      coolGt180: +(shadow.filter(p => p.h * 360 > 180).length / shadow.length).toFixed(3)
    } : null
  };
}

async function diffPct(a, b) {
  const [da, db] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer({ resolveWithObject: true })]);
  const { data, info } = da; const W = info.width, H = info.height, C = info.channels;
  let moved = 0, tot = 0;
  const movedPairs = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C;
    const d = Math.abs(data[i] - db.data[i]) + Math.abs(data[i + 1] - db.data[i + 1]) + Math.abs(data[i + 2] - db.data[i + 2]);
    if (d > 18) { moved++; if (movedPairs.length < 60000) movedPairs.push([data[i], data[i + 1], data[i + 2], db.data[i], db.data[i + 1], db.data[i + 2]]); }
    tot++;
  }
  const mean = a => a.reduce((t, p) => t + p, 0) / (a.length || 1);
  const movedPairsSorted = movedPairs.slice(0, 2000);
  const meanBefore = [0, 1, 2].map(k => +mean(movedPairs.map(p => p[k])).toFixed(1));
  const meanAfter = [0, 1, 2].map(k => +mean(movedPairs.map(p => p[3 + k])).toFixed(1));
  return {
    pct: +(100 * moved / tot).toFixed(2),
    matchedMeanBeforeRGB: meanBefore,
    matchedMeanAfterRGB: meanAfter,
    samples: movedPairsSorted.filter((_, i) => i % 250 === 0).map(p => `(${p[0]},${p[1]},${p[2]})->(${p[3]},${p[4]},${p[5]})`)
  };
}

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
try {
  await boot(page, gameUrl({}));
  await pin(page, 1 / 60);
  await page.evaluate(async n => { await window.BB.settle(n); }, 20);
  await page.evaluate(dt => { window.BB.setFixedDt(dt); }, 1e-9);
  await page.evaluate(async ([id, n]) => { window.BB.review(id); await window.BB.settle(n); }, [FRAMING, 2]);
  await page.screenshot({ path: A });
  await page.evaluate(() => { window.BB.player.uHueStr.value = 0; });
  await page.evaluate(async n => { await window.BB.settle(n); }, 2);
  await page.screenshot({ path: B });
  await page.evaluate(() => { window.BB.player.uHueStr.value = 1; });
  await page.evaluate(async n => { await window.BB.settle(n); }, 2);
  const C2 = path.join(dir, FRAMING + '-hue-on2.png');
  await page.screenshot({ path: C2 });
  const [sa, sb, sc, ab, ac] = await Promise.all([furStats(A), furStats(B), furStats(C2), diffPct(A, B), diffPct(A, C2)]);
  const out = {
    framing: FRAMING,
    hueON: sa, hueOFF: sb,
    pixelMoved_AB: ab,
    pixelMoved_AC_pct: ac.pct,
    negativeControlOK: ac.pct < 0.35
  };
  console.log(JSON.stringify(out, null, 1));
  writeFileSync(path.join(dir, FRAMING + '-ab.json'), JSON.stringify(out, null, 1));
} finally {
  try { await Promise.race([browser.close(), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  process.exit(0);
}


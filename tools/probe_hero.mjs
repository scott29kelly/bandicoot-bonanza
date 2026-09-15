/**
 * Pass 22 hero-region probe — frozen-dt same-context pixel measurements.
 *
 * Boots once, pins the timestep (1/60 settle 20, then 1e-9 settle 2), applies
 * a framing, projects hero world landmarks into screen space, captures, and
 * measures INSIDE the hero bbox only:
 *   - shadow-side fur hue/sat/rgb  (lever 4: not mud-brown, sat >= 0.15)
 *   - lit fur local contrast       (lever 1: fur value noise present)
 *   - outline contour coverage     (pass 21 floor held through the re-sculpt)
 *
 *   node probe_hero.mjs --framing hero-closeup [--out shot.png]
 */
import {parseArgs, launch, gameUrl, boot, pin, ROOT} from './_harness.mjs';
import sharp from 'sharp';
import path from 'node:path';
import {writeFileSync} from 'node:fs';

const args = parseArgs(process.argv.slice(2));
const FRAMING = String(args.framing ?? 'hero-closeup');
const OUT = String(args.out ?? path.join(ROOT, 'shots', 'probe-hero.png'));

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

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
try {
  await boot(page, gameUrl({}));
  await pin(page, 1 / 60);
  await page.evaluate(async n => { await window.BB.settle(n); }, 20);
  await page.evaluate(dt => { window.BB.setFixedDt(dt); }, 1e-9);
  const applied = await page.evaluate(async ([id, n]) => {
    const a = window.BB.review(id);
    await window.BB.settle(n);
    // Project hero landmarks into screen space while the review camera is live.
    const p = window.BB.player;
    const cam = window.BB.camera;
    const base = p.pos ? p.pos.clone() : null;
    const proj = (x, y, z) => {
      const v = new (base.constructor)(x, y, z).project(cam);
      return { x: (v.x * 0.5 + 0.5) * innerWidth, y: (1 - (v.y * 0.5 + 0.5)) * innerHeight, z: v.z };
    };
    const feet = base ? proj(base.x, base.y, base.z) : null;
    const head = base ? proj(base.x, base.y + 2.6, base.z) : null;
    return { applied: a, feet, head, dpr: devicePixelRatio };
  }, [FRAMING, 2]);
  await page.screenshot({ path: OUT });

  const { data, info } = await sharp(OUT).raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const px = (x, y) => {
    x = Math.max(0, Math.min(W - 1, x | 0)); y = Math.max(0, Math.min(H - 1, y | 0));
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const x0 = Math.max(0, Math.floor(Math.min(applied.feet.x, applied.head.x) - 260));
  const x1 = Math.min(W - 1, Math.ceil(Math.max(applied.feet.x, applied.head.x) + 260));
  const y0 = Math.max(0, Math.floor(applied.head.y - 30));
  const y1 = Math.min(H - 1, Math.ceil(applied.feet.y + 20));

  // Fur pixels: orange family, saturated enough to not be sand/skin noise.
  const fur = [];
  for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) {
    const [r, g, b] = px(x, y);
    const { h, s, v } = rgbToHsv(r, g, b);
    if (s > 0.30 && v > 0.10 && (h > 0.01 && h < 0.14)) fur.push({ x, y, r, g, b, h, s, v });
  }
  const mean = a => a.reduce((t, p) => t + p, 0) / (a.length || 1);
  const vs = fur.map(p => p.v).sort((a, b) => a - b);
  const q = f => vs.length ? vs[Math.min(vs.length - 1, Math.floor(vs.length * f))] : 0;
  const shadow = fur.filter(p => p.v <= q(0.25));
  const lit = fur.filter(p => p.v >= q(0.75));
  const pct = { p10: +q(0.10).toFixed(3), p50: +q(0.50).toFixed(3), p90: +q(0.90).toFixed(3) };
  const rep = a => ({
    n: a.length,
    rgb: a.length ? [mean(a.map(p => p.r)), mean(a.map(p => p.g)), mean(a.map(p => p.b))].map(n => +n.toFixed(0)) : null,
    sat: +mean(a.map(p => p.s)).toFixed(3),
    hue: +(mean(a.map(p => p.h)) * 360).toFixed(1),
    val: +mean(a.map(p => p.v)).toFixed(3)
  });

  // Local contrast of lit fur (fur noise <-> flat albedo)
  let lc = [], n = 0;
  for (const p of lit) {
    const [r2, g2, b2] = px(p.x + 2, p.y);
    const v2 = Math.max(r2, g2, b2) / 255;
    lc.push(Math.abs(v2 - p.v));
    if (++n >= 4000) break;
  }
  const contrast = +mean(lc).toFixed(4);

  // Outline coverage: fraction of bbox border scanlines containing a dark
  // blue-violet contour pixel (the pass-21 hull colour family)
  let rows = 0, rowsHit = 0;
  for (let y = y0; y <= y1; y += 1) {
    rows++;
    let hit = false;
    for (let x = x0; x <= x1 && !hit; x++) {
      const [r, g, b] = px(x, y);
      if (b > r + 15 && b > g + 8 && Math.max(r, g, b) < 185) hit = true;
    }
    if (hit) rowsHit++;
  }
  function v0(r, g, b) { return Math.max(r, g, b); }

  const result = {
    framing: FRAMING,
    bbox: { x0, x1, y0, y1 },
    landmarks: { feet: applied.feet, head: applied.head },
    furTotal: fur.length,
    furShadow: rep(shadow),
    furLit: rep(lit),
    litLocalContrast: contrast,
    furValuePct: pct,
    shadowHueMix: shadow.length ? {
      amberLt30: +(shadow.filter(p => p.h * 360 < 30).length / shadow.length).toFixed(3),
      brown30_50: +(shadow.filter(p => p.h * 360 >= 30 && p.h * 360 < 55).length / shadow.length).toFixed(3),
      coolGt180: +(shadow.filter(p => p.h * 360 > 180).length / shadow.length).toFixed(3)
    } : null,
    contourRowCoverage: +(rowsHit / (rows || 1)).toFixed(3)
  };
  console.log(JSON.stringify(result, null, 1));
  writeFileSync(OUT.replace(/\.png$/, '.json'), JSON.stringify(result, null, 1));
} finally {
  try { await Promise.race([browser.close(), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  process.exit(0);
}





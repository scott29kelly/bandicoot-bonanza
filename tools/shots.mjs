#!/usr/bin/env node
/**
 * Contact sheet: boot the game ONCE and capture every composed review framing
 * (see "14b. REVIEW HARNESS" in index.html) from that single boot.
 *
 * The single boot is the point. Booting per framing would give every still its
 * own procedural world — the seed makes that reproducible, but a fresh boot
 * also means a fresh camera snap and a fresh settle history, and cutting
 * between wildly different framings inside one boot is exactly what a human
 * art reviewer does. One boot, one world, one settle discipline: two sheets
 * shot from two different builds are directly comparable.
 *
 *   node tools/shots.mjs
 *   node tools/shots.mjs --dir shots/after --only gate-hero,hero-closeup
 *   node tools/shots.mjs --w 1600 --h 1000 --settle 40 --seed 12345
 *
 * Writes <dir>/<id>.png, <dir>/sheet.json, and a labelled montage at
 * <dir>/CONTACT-SHEET.png (--nosheet to skip the montage).
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {parseArgs, launch, gameUrl, boot, pin, ROOT} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));
const W=Number(args.w??1280), H=Number(args.h??800);
const SETTLE=Number(args.settle??30);
const DIR=path.resolve(ROOT,String(args.dir??'shots/current'));
const ONLY=args.only?new Set(String(args.only).split(',').map(s=>s.trim())):null;

/** Montage the stills into one labelled sheet — a reviewer looks at ONE image. */
async function montage(rows,out){
  if(!rows.length)return;
  const COLS=3, TW=640, PAD=10, LABEL=34;
  const TH=Math.round(TW*H/W);
  const cellH=TH+LABEL;
  const cols=Math.min(COLS,rows.length), lines=Math.ceil(rows.length/cols);
  const SW=cols*TW+(cols+1)*PAD, SH=lines*cellH+(lines+1)*PAD;
  const layers=[];
  for(let i=0;i<rows.length;i++){
    const x=PAD+(i%cols)*(TW+PAD), y=PAD+Math.floor(i/cols)*(cellH+PAD);
    layers.push({input:await sharp(rows[i].file).resize(TW,TH).png().toBuffer(),left:x,top:y});
    const label=`${i+1}. ${rows[i].name}`.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    const sub=`${rows[i].id}  ·  ${(rows[i].stats?.triangles/1000||0).toFixed(1)}k tris  ·  ${rows[i].stats?.drawCalls||0} draws`;
    const svg=`<svg width="${TW}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
      <text x="2" y="14" font-family="Segoe UI,sans-serif" font-size="13" font-weight="700" fill="#f3e9c8">${label}</text>
      <text x="2" y="29" font-family="Consolas,monospace" font-size="11" fill="#8fbf9a">${sub}</text></svg>`;
    layers.push({input:Buffer.from(svg),left:x,top:y+TH+2});
  }
  await sharp({create:{width:SW,height:SH,channels:3,background:{r:14,g:18,b:16}}})
    .composite(layers).png().toFile(out);
  console.log(`[shots] montage -> ${out}`);
}

const browser=await launch(args);
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
try{
  await boot(page,gameUrl({seed:args.seed,minfx:args.minfx}));
  await pin(page);

  const framings=await page.evaluate(()=>window.BB.framings);
  mkdirSync(DIR,{recursive:true});
  const rows=[];
  for(const f of framings){
    if(ONLY&&!ONLY.has(f.id))continue;
    // Re-settle at every framing. A hard cut from a portrait close-up to a
    // 25 m aerial leaves the fruit bob, the torch flicker and the fresh
    // shadow cascade mid-transition; capturing there reads as a mis-graded
    // frame rather than as the framing's actual look.
    const applied=await page.evaluate(async ([id,n])=>{
      const a=window.BB.review(id);
      await window.BB.settle(n);
      return a;
    },[f.id,SETTLE]);
    const file=path.join(DIR,f.id+'.png');
    await page.screenshot({path:file});
    const stats=await page.evaluate(()=>({...window.BB.stats}));
    rows.push({...applied,file,stats});
    console.log(`[shots] ${f.id.padEnd(16)} ${(stats.triangles/1000).toFixed(1).padStart(8)}k tris  ${String(stats.drawCalls).padStart(4)} draws  -> ${path.relative(ROOT,file)}`);
  }
  const err=await page.evaluate(()=>window.BB.error);
  if(err)console.error('[shots] WARNING — the game reported a runtime error during the sheet: '+err);
  writeFileSync(path.join(DIR,'sheet.json'),JSON.stringify({seed:await page.evaluate(()=>window.BB.seed),w:W,h:H,settle:SETTLE,rows},null,2));
  if(!args.nosheet)await montage(rows,path.join(DIR,'CONTACT-SHEET.png'));
  console.log(`[shots] ${rows.length} framings -> ${path.relative(ROOT,DIR)}`);
}finally{
  await browser.close();
}

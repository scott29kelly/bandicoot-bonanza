#!/usr/bin/env node
/**
 * Montage a folder of reference images into one labelled sheet for approval.
 *
 * The reference set is the single input the Gauntlet Loop cannot synthesise:
 * a critic given prose can only free-associate, a critic given an image can do
 * a blind A/B. Scott approves the set once; after that every round is judged
 * against it. Sheets make that approval a one-glance job instead of opening
 * fifty files.
 *
 *   node tools/refsheet.mjs --dir refs/crash --out refs/SHEET-crash.png --cols 4
 */
import {readdirSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {parseArgs, ROOT} from './_harness.mjs';

const a=parseArgs(process.argv.slice(2));
const dirs=String(a.dir).split(',').map(d=>path.resolve(ROOT,d.trim()));
const out=path.resolve(ROOT,String(a.out??'refs/SHEET.png'));
const COLS=Number(a.cols??4), TW=Number(a.tw??460), PAD=8, LABEL=20;

const items=[];
for(const d of dirs){
  const tag=path.basename(d);
  for(const f of readdirSync(d).filter(f=>/\.(jpg|jpeg|png)$/i.test(f)).sort()){
    items.push({file:path.join(d,f),label:`${tag}/${f.replace(/\.\w+$/,'')}`});
  }
}
if(!items.length)throw new Error('no images under '+dirs.join(', '));

const first=await sharp(items[0].file).metadata();
const TH=Math.round(TW*first.height/first.width);
const cell=TH+LABEL;
const rows=Math.ceil(items.length/COLS);
const W=COLS*TW+(COLS+1)*PAD, H=rows*cell+(rows+1)*PAD;

const layers=[];
for(let i=0;i<items.length;i++){
  const x=PAD+(i%COLS)*(TW+PAD), y=PAD+Math.floor(i/COLS)*(cell+PAD);
  layers.push({input:await sharp(items[i].file).resize(TW,TH,{fit:'cover'}).png().toBuffer(),left:x,top:y});
  const svg=`<svg width="${TW}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg"><text x="2" y="14" font-family="Consolas,monospace" font-size="12" fill="#cfe3d0">${items[i].label}</text></svg>`;
  layers.push({input:Buffer.from(svg),left:x,top:y+TH+2});
}
mkdirSync(path.dirname(out),{recursive:true});
await sharp({create:{width:W,height:H,channels:3,background:{r:12,g:14,b:13}}}).composite(layers).png().toFile(out);
console.log(`[refsheet] ${items.length} images -> ${path.relative(ROOT,out)} (${W}x${H})`);

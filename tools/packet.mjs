#!/usr/bin/env node
/**
 * Blind A/B packet builder (Gauntlet method §8).
 *
 *   node tools/packet.mjs --base shots/round28 --cand shots/round35 --out shots/_packets/p01 [--seed 7]
 *
 * For every framing present in BOTH directories, copies the two stills as
 * <framing>-A.png / <framing>-B.png with A/B identity randomized per pair.
 * Strips PNG metadata by re-encoding through sharp. Writes the mapping to
 * <out>.mapping.json BESIDE the packet directory (never inside it), copies
 * refs/proposed into <out>/refs, and generates NOTE.md from the sheets'
 * capture settings. Reveal the mapping only after the verdict is recorded.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).reduce((a,s,i,arr)=>{
  if(s.startsWith('--'))a.push([s.slice(2),arr[i+1]&&!arr[i+1].startsWith('--')?arr[i+1]:true]);return a;},[]));
if(!args.base||!args.cand||!args.out){console.error('usage: --base DIR --cand DIR --out DIR [--seed N]');process.exit(2);}
const BASE=path.resolve(ROOT,args.base),CAND=path.resolve(ROOT,args.cand),OUT=path.resolve(ROOT,args.out);
let st=(Number(args.seed)||Date.now())>>>0;
const rnd=()=>{st=(st+0x6D2B79F5)|0;let t=Math.imul(st^(st>>>15),1|st);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};

const stills=(d)=>fs.readdirSync(d).filter(f=>f.endsWith('.png')&&!f.startsWith('CONTACT')).map(f=>f.slice(0,-4));
const pairs=stills(BASE).filter(f=>stills(CAND).includes(f)).sort();
if(!pairs.length){console.error('no common framings');process.exit(1);}
fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(path.join(OUT,'crops'),{recursive:true});
const mapping={base:args.base,cand:args.cand,created:new Date().toISOString(),pairs:{}};
for(const p of pairs){
  const baseIsA=rnd()<0.5;
  const [aSrc,bSrc]=baseIsA?[BASE,CAND]:[CAND,BASE];
  // Re-encode: strips text chunks / metadata, keeps pixels bit-identical.
  await sharp(path.join(aSrc,p+'.png')).png({compressionLevel:6}).toFile(path.join(OUT,p+'-A.png'));
  await sharp(path.join(bSrc,p+'.png')).png({compressionLevel:6}).toFile(path.join(OUT,p+'-B.png'));
  mapping.pairs[p]={A:baseIsA?'base':'cand',B:baseIsA?'cand':'base'};
}
const refs=path.join(ROOT,'refs','proposed');
if(fs.existsSync(refs)){
  fs.mkdirSync(path.join(OUT,'refs'),{recursive:true});
  for(const f of fs.readdirSync(refs))fs.copyFileSync(path.join(refs,f),path.join(OUT,'refs',f));
}
const sheet=(d)=>{try{return JSON.parse(fs.readFileSync(path.join(d,'sheet.json'),'utf8'));}catch{return null;}};
const sb=sheet(BASE),sc=sheet(CAND);
const note=`# Capture note (factual)

Pairs: ${pairs.join(', ')}. Each pair is two captures of the same framing
from two builds; which is A and which is B is randomized per pair and the
mapping is held outside this packet.

Both sides: ${sb?.w??'?'}×${sb?.h??'?'} px, seed ${sb?.seed??'?'} / ${sc?.seed??'?'}, settle
${sb?.settle??'?'} / ${sc?.settle??'?'} frames, headless Chromium on SwiftShader, world
clock reset to 0 for review — animation phase is identical by
construction. Pixels are untouched; files were re-encoded only to strip
metadata.

Limits: stills establish visible-frame quality only (not input, motion,
audio, performance). Shadow-map texel staircase on props at portrait
range is an engine limit. The references in refs/ are not composition-
matched to these framings: they inform direction and gap ranking; they
cannot establish an A/B win.

Performance counts (from the capture sheets, for the performance row only):
${pairs.map(p=>{const a=(mapping.pairs[p].A==='base'?sb:sc)?.rows?.find(r=>r.id===p),b=(mapping.pairs[p].B==='base'?sb:sc)?.rows?.find(r=>r.id===p);return `- ${p}: A ${a?.stats?.triangles??'?'} tris / ${a?.stats?.drawCalls??'?'} draws · B ${b?.stats?.triangles??'?'} tris / ${b?.stats?.drawCalls??'?'} draws`;}).join('\n')}
`;
fs.writeFileSync(path.join(OUT,'NOTE.md'),note);
fs.writeFileSync(OUT+'.mapping.json',JSON.stringify(mapping,null,2));
console.log(`[packet] ${pairs.length} pairs -> ${path.relative(ROOT,OUT)}  (mapping sealed in ${path.relative(ROOT,OUT+'.mapping.json')})`);

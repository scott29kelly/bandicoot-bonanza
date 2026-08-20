#!/usr/bin/env node
/**
 * Bundle src/ into the single index.html a player opens.
 *
 * Players get one file; builders get many (docs/ARCHITECTURE.md). three stays
 * external and is resolved by the import map in src/shell.html, so the output
 * stays small and the CDN copy is shared.
 *
 *   node tools/build.mjs            once
 *   node tools/build.mjs --watch    rebuild on change
 */
import {build, context} from 'esbuild';
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {parseArgs, ROOT} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));
const OUT=path.join(ROOT,'index.html');
const SHELL=path.join(ROOT,'src','shell.html');

const opts={
  entryPoints:[path.join(ROOT,'src','main.js')],
  bundle:true,
  format:'esm',
  target:'es2020',
  external:['three','three/addons/*'],
  write:false,
  legalComments:'none',
  minify:!args.dev
};

async function emit(){
  const res=await build(opts);
  const js=res.outputFiles[0].text;
  const shell=readFileSync(SHELL,'utf8');
  if(!shell.includes('/*__BUNDLE__*/'))throw new Error('shell.html lost its /*__BUNDLE__*/ marker');
  writeFileSync(OUT,shell.replace('/*__BUNDLE__*/',js));
  const kb=(Buffer.byteLength(js)/1024).toFixed(1);
  console.log(`[build] ${kb} KB of bundle -> ${path.relative(ROOT,OUT)}`);
}

if(args.watch){
  const ctx=await context({...opts,plugins:[{name:'emit',setup(b){b.onEnd(()=>emit().catch(e=>console.error('[build]',e.message)));}}]});
  await ctx.watch();
  console.log('[build] watching src/ …');
}else{
  await emit();
}

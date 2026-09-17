#!/usr/bin/env node
/**
 * One-off Pass 25 sanity: minfx boot + VICTORY animation state.
 *   node tools/sanity_pass25.mjs
 */
import {launch,gameUrl} from './_harness.mjs';

const browser=await launch();
// --- minfx boot ---
{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errs=[];
  page.on('pageerror',e=>errs.push(e.message));
  await page.goto(gameUrl({minfx:1}));
  await page.waitForFunction('window.BB&&window.BB.ready',null,{timeout:60000});
  await page.waitForTimeout(3000);
  const st=await page.evaluate(()=>({
    err:window.BB.error,
    state:window.BB.game.state,
    cat:!!window.BB.player.catBones,
    bones:window.BB.player.catBones?Object.keys(window.BB.player.catBones).length:0,
    hulls:window.BB.player.catHulls?window.BB.player.catHulls.length:0
  }));
  console.log('[minfx]',JSON.stringify(st),'pageErrors:',errs.length);
  if(st.err||st.state!=='TITLE'||!st.cat||errs.length)process.exitCode=1;
  await page.close();
}
// --- VICTORY sanity ---
{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errs=[];
  page.on('pageerror',e=>errs.push(e.message));
  await page.goto(gameUrl({seed:6221086}));
  await page.waitForFunction('window.BB&&window.BB.ready',null,{timeout:60000});
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{window.BB.game.setState('VICTORY');});
  await page.waitForTimeout(1500);
  const s1=await page.evaluate(()=>({
    state:window.BB.game.state,
    clip:window.BB.player.catClipPlaying,
    t:window.BB.player.catMixer?window.BB.player.catMixer.time:0,
    hulls:window.BB.player.catHulls?window.BB.player.catHulls.length:0
  }));
  await page.waitForTimeout(1200);
  const s2=await page.evaluate(()=>({
    t:window.BB.player.catMixer?window.BB.player.catMixer.time:0,
    clip:window.BB.player.catClipPlaying
  }));
  console.log('[victory]',JSON.stringify(s1),'-> mixer t',s1.t.toFixed(3),'to',s2.t.toFixed(3),'pageErrors:',errs.length);
  if(s1.clip!=='CAT_Celebrate_Loop'||!(s2.t>s1.t)||s1.hulls!==6||errs.length)process.exitCode=1;
  await page.close();
}
await browser.close();
console.log(process.exitCode?'[sanity] FAIL':'[sanity] PASS');

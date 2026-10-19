#!/usr/bin/env node
/**
 * Scripted gameplay run (gate G7a–c). Boots the game once at a fixed
 * timestep, drives the hero with synthetic key events, and asserts the
 * rules from docs/gauntlet/CONTRACT.md §M2 through window.BB.game().
 *
 * Fixed dt means every key hold is a FRAME count, not a wall-clock time,
 * so the run replays exactly and a failure is a rules failure, not timing
 * noise. Headless SwiftShader is slow; ~600 frames take a minute or two.
 *
 *   node tools/playtest.mjs
 *   node tools/playtest.mjs --seed 7 --shot shots/play/hud.png
 */
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {parseArgs,launch,gameUrl,boot,ROOT} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));
const DT=1/60;
const browser=await launch(args);
const page=await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
let fails=0;
const results=[];
function check(name,cond,detail){
  const ok=!!cond;
  if(!ok)fails++;
  results.push({name,ok,detail});
  console.log(`[playtest] ${ok?'PASS':'FAIL'}  ${name}  ${detail??''}`);
}

try{
  await boot(page,gameUrl({seed:args.seed,fixeddt:DT}));
  await page.evaluate(()=>window.BB.setUI(true));

  const key=(code,down)=>page.evaluate(([c,d])=>{
    window.dispatchEvent(new KeyboardEvent(d?'keydown':'keyup',{code:c,bubbles:true,cancelable:true}));
  },[code,down]);
  const step=n=>page.evaluate(n=>window.BB.settle(n),n);
  const place=p=>page.evaluate(p=>window.BB.place(p),p);
  const game=()=>page.evaluate(()=>window.BB.game());
  const hud=()=>page.evaluate(()=>({
    fruit:document.getElementById('fruit-count').textContent,
    cp:document.getElementById('cp-label').textContent,
    lives:document.getElementById('lives-count').textContent}));
  const hold=async(code,n)=>{await key(code,true);await step(n);await key(code,false);};

  let g=await game();
  check('boot: counters at zero',g.fruit===0&&g.crates===0&&g.lives===3&&g.checkpoint===0,JSON.stringify({fruit:g.fruit,crates:g.crates,lives:g.lives}));
  check('boot: totals from the world',g.fruitTotal===12&&g.crateTotal===10,`fruit ${g.fruitTotal}/12 crates+tnt ${g.crateTotal}/10`);

  /* --- G7a fruit: run down the fruit row at x=-1.6, z -5..-11 ---------- */
  await place([-1.6,0,-3,Math.PI]);
  await hold('ArrowUp',110);
  await step(10);
  g=await game();
  check('fruit: row of 5 collected on contact',g.fruit===5,`fruit ${g.fruit} alive ${g.fruitAlive}`);
  let h=await hud();
  check('fruit: HUD shows count / total',h.fruit==='5',`hud fruit "${h.fruit}"`);

  /* --- G7b stomp: drop onto the centre crate of the first row ---------- */
  await place([0,3.2,-14.25]);
  await step(30);
  g=await game();
  check('stomp: landing on a crate breaks it',g.crates===1,`crates ${g.crates}`);
  check('stomp: crate bounce lifts the hero',g.hero[1]>1.2,`hero y ${g.hero[1].toFixed(2)} after 30 frames`);
  await step(70); // fall 24 frames + bounce 38 frames: down by 100
  g=await game();
  check('stomp: crate solid removed, hero back on sand',g.hero[1]<0.2&&g.hero[1]>-0.2,`hero y ${g.hero[1].toFixed(2)}`);

  /* --- G7b spin: stand beside the right crate and spin ------------------ */
  await place([3.8,0,-14]);
  await step(5);
  await key('KeyK',true);await step(3);await key('KeyK',false);
  await step(30);
  g=await game();
  check('spin: crate within spinRadius breaks',g.crates===2,`crates ${g.crates}`);

  /* --- G7c checkpoint: cross the totem line on the crate yard ---------- */
  await place([0,0,-46,Math.PI]);
  await hold('ArrowUp',40);
  await step(5);
  g=await game();h=await hud();
  check('checkpoint: totem activates when crossed',g.checkpoint===1,`checkpoint ${g.checkpoint} hero z ${g.hero[2].toFixed(1)}`);
  check('checkpoint: HUD label',h.cp==='TOTEM 1',`hud "${h.cp}"`);

  /* --- G7b TNT: stomp it, run clear, wait out the fuse ------------------ */
  await place([0,3.2,-52]);
  await step(30); // the fall lands at ~24 frames
  g=await game();
  check('tnt: stomp arms the fuse',g.tnt[0].armed&&g.tnt[0].fuse>1.5&&g.tnt[0].fuse<=2.2,`armed ${g.tnt[0].armed} fuse ${g.tnt[0].fuse.toFixed(2)}`);
  const cratesBefore=g.crates,livesBefore=g.lives;
  await hold('ArrowUp',60); // -z, deeper into the yard, away from the blast
  await step(110); // 200 frames from the drop > 24 + 132 (tntFuse 2.2 s)
  g=await game();
  check('tnt: explodes after tntFuse',g.tnt[0].exploded&&g.explosions===1,`exploded ${g.tnt[0].exploded}`);
  check('tnt: clears the 6 crates within tntRadius',g.crates===cratesBefore+7,`crates ${cratesBefore} -> ${g.crates} (6 crates + the TNT)`);
  check('tnt: hero clear of the blast keeps its lives',g.lives===livesBefore,`lives ${g.lives} hero z ${g.hero[2].toFixed(1)}`);

  /* --- G7c fall: run off gapA into the water ---------------------------- */
  const fruitBefore=(await game()).fruit;
  await place([0,0,-34,Math.PI]);
  await hold('ArrowUp',60);
  await step(60);
  g=await game();h=await hud();
  check('fall: life lost',g.lives===2&&g.deaths===1,`lives ${g.lives} deaths ${g.deaths}`);
  check('fall: respawn at the checkpoint',Math.abs(g.hero[2]-(-47.3))<0.6&&Math.abs(g.hero[0])<0.6,`hero ${g.hero.map(v=>v.toFixed(1)).join(',')} respawn ${g.respawn.map(v=>v.toFixed(1)).join(',')}`);
  // The respawn point sits under the arc fruit at (0,1.8,-47.3), so the
  // count may go UP by one on respawn; it must never drop.
  check('fall: fruit count kept',g.fruit>=fruitBefore&&g.fruit<=fruitBefore+1,`fruit ${fruitBefore} -> ${g.fruit}`);
  check('fall: HUD lives',h.lives==='2',`hud lives "${h.lives}"`);

  /* --- lives: two more falls reset the run ------------------------------- */
  for(let i=0;i<2;i++){await place([0,0,-34,Math.PI]);await hold('ArrowUp',60);await step(60);}
  g=await game();
  check('lives: zero lives resets the run',g.lives===3&&g.fruit===0&&g.checkpoint===0&&g.cratesLeft===9,`lives ${g.lives} fruit ${g.fruit} cp ${g.checkpoint} crates left ${g.cratesLeft}`);

  if(args.shot){
    const file=path.resolve(ROOT,String(args.shot));
    mkdirSync(path.dirname(file),{recursive:true});
    await place([-1.6,0,-3,Math.PI]);await hold('ArrowUp',60);await step(10);
    await page.screenshot({path:file});
    console.log(`[playtest] shot -> ${file}`);
  }
}catch(err){
  console.error('[playtest] ERROR',err);
  fails++;
}finally{
  await browser.close();
}
console.log(`[playtest] ${results.filter(r=>r.ok).length}/${results.length} PASS${fails?`, ${fails} FAIL`:''}`);
process.exit(fails?1:0);

#!/usr/bin/env node
/**
 * Draw-call census per review framing.
 *
 * tools/shots.mjs reports ONE number (renderer.info.render.calls, the true
 * per-frame total across shadow + AO depth prepass + main + post). This tool
 * answers "which object families is that number made of", so batching work
 * goes where the budget actually is instead of where the guess is.
 *
 *   node tools/profile_draws.mjs                       // all 9 framings
 *   node tools/profile_draws.mjs --only beach-corridor
 *
 * The draw estimate per drawable is: main pass (1) + AO depth prepass (1) +
 * shadow map (1 if castShadow and visible). Frustum tests replicate the
 * renderer's own culling, including r128's base-geometry-only sphere test for
 * InstancedMesh — which is also audited separately, because that test ignores
 * instanceMatrix and can silently over-cull scattered dressing far from the
 * origin (see QUALITY-BAR Pillar D).
 */
import {parseArgs, launch, gameUrl, boot, pin} from './_harness.mjs';

const args=parseArgs(process.argv.slice(2));
const ONLY=args.only?new Set(String(args.only).split(',').map(s=>s.trim())):null;

const CENSUS=()=>{
  const scene=window.BB.scene,camera=window.BB.camera;
  camera.updateMatrixWorld(true);
  const frustum=new THREE.Frustum();
  frustum.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
  const _s=new THREE.Sphere(),_m=new THREE.Matrix4(),_v=new THREE.Vector3();

  const cullTest=o=>{
    if(o.isSprite||o.isPoints&&!o.geometry.boundingSphere)return true;
    const g=o.geometry;
    if(!g)return true;
    if(!g.boundingSphere)g.computeBoundingSphere();
    _s.copy(g.boundingSphere).applyMatrix4(o.matrixWorld);
    return frustum.intersectsSphere(_s);
  };

  const fams=new Map(),mats=new Map(),inst=[];
  const famOf=o=>{
    let n=o,label=o.isInstancedMesh?'[inst] ':'';
    while(n){if(n.name&&n.name.length)return label+n.name;break;n=n.parent;}
    let r=o;while(r.parent&&r.parent!==scene)r=r.parent;
    return label+(r.type==='Scene'?o.type:r.type);
  };
  const matKey=m=>m?m.uuid:'(none)';

  (function walk(o){
    if(!o.visible)return;
    const drawable=o.isMesh||o.isPoints||o.isLine||o.isSprite;
    if(drawable){
      const vis=o.frustumCulled?cullTest(o):true;
      if(vis){
        // A mesh with a material ARRAY draws once per geometry group; that is
        // where "one platform" quietly becomes six draw calls.
        const groups=(Array.isArray(o.material)&&o.geometry.groups)?Math.max(1,o.geometry.groups.length):1;
        const shadow=!!o.castShadow;
        const f=fams.get(famOf(o))||{n:0,shadow:0,verts:0,mats:new Set(),groups:0};
        f.n++;f.groups+=groups;if(shadow)f.shadow++;f.mats.add(matKey(o.material));
        if(o.geometry&&o.geometry.attributes&&o.geometry.attributes.position)f.verts+=o.geometry.attributes.position.count;
        fams.set(famOf(o),f);
        const mk=matKey(o.material);
        const mm=mats.get(mk)||{n:0,shadow:0,fams:new Set()};
        mm.n++;if(shadow)mm.shadow++;mm.fams.add(famOf(o));
        mats.set(mk,mm);
      }
      if(o.isInstancedMesh){
        // r128 audit: renderer culls by the BASE geometry sphere at the mesh's
        // own transform. Count how many instances the camera can actually see.
        if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();
        const base=o.geometry.boundingSphere;
        let inFrustum=0,total=0;
        for(let i=0;i<o.count;i++){
          o.getMatrixAt(i,_m);
          const sx=_v.set(_m.elements[0],_m.elements[1],_m.elements[2]).length();
          _s.set(_v.set(_m.elements[12],_m.elements[13],_m.elements[14]),base.radius*sx);
          total++;
          if(frustum.intersectsSphere(_s))inFrustum++;
        }
        inst.push({name:famOf(o),count:o.count,inFrustum,rendererDraws:vis,cullRisk:inFrustum>0&&!vis});
      }
    }
    for(const c of o.children)walk(c);
  })(scene);

  const famRows=[...fams.entries()].map(([name,f])=>({name,meshes:f.n,groups:f.groups,shadow:f.shadow,est:f.groups*4,mats:f.mats.size,verts:f.verts})).sort((a,b)=>b.est-a.est);
  const matRows=[...mats.entries()].map(([uuid,m])=>({uuid,meshes:m.n,shadow:m.shadow,est:m.n*2+m.shadow,fam:[...m.fams].slice(0,2).join('|')})).sort((a,b)=>b.est-a.est);
  // Material fragmentation: how many materials are used by exactly N meshes.
  const frag=new Map();
  for(const m of matRows){const k=frag.get(m.meshes)||{mats:0,meshes:0};k.mats++;k.meshes+=m.meshes;frag.set(m.meshes,k);}
  return {
    stats:{...window.BB.stats},
    estTotal:famRows.reduce((s,r)=>s+r.est,0),
    famRows:famRows.slice(0,32),
    inst,
    frag:[...frag.entries()].sort((a,b)=>a[0]-b[0]).map(([n,k])=>({meshesPerMat:n,mats:k.mats,totalMeshes:k.meshes}))
  };
};

const browser=await launch(args);
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
try{
  await boot(page,gameUrl({seed:args.seed}));
  await pin(page);
  if(args.trace){
    await page.evaluate(()=>{
      const r=window.BB.renderer;
      const orig=r.render.bind(r);
      window.__callLog=[];
      r.render=(s,c)=>{
        const c0=r.info.render.calls,t0=r.info.render.triangles;
        orig(s,c);
        window.__callLog.push({calls:r.info.render.calls-c0,tris:r.info.render.triangles-t0});
      };
    });
  }
  const framings=await page.evaluate(()=>window.BB.framings);
  for(const f of framings){
    if(ONLY&&!ONLY.has(f.id))continue;
    await page.evaluate(async id=>{window.BB.review(id);await window.BB.settle(4);},f.id);
    if(args.trace){
      await page.evaluate(()=>{window.__callLog.length=0;});
      await page.evaluate(()=>window.BB.renderer.info.reset());
      await page.evaluate(async()=>{await window.BB.settle(1);});
      const trace=await page.evaluate(()=>({log:window.__callLog.slice(),total:window.BB.stats.drawCalls}));
      console.log(`\n=== ${f.id} — render() calls in one frame: ${trace.log.length} — total ${trace.total} draws ===`);
      trace.log.forEach((l,i)=>console.log(`  render #${String(i).padStart(2)}: ${String(l.calls).padStart(5)} draws  ${(l.tris/1000).toFixed(1)}k tris`));
    }
    const c=await page.evaluate(CENSUS);
    console.log(`\n=== ${f.id} — actual ${c.stats.drawCalls} draws / ${(c.stats.triangles/1000).toFixed(0)}k tris — census est ${c.estTotal} ===`);
    console.log('family                        meshes  grps  est  mats   verts');
    for(const r of c.famRows)
      console.log(`${r.name.slice(0,28).padEnd(28)} ${String(r.meshes).padStart(5)} ${String(r.groups).padStart(5)} ${String(r.est).padStart(5)} ${String(r.mats).padStart(5)} ${String(r.verts).padStart(7)}`);
    const risky=c.inst.filter(i=>i.cullRisk);
    if(risky.length){
      console.log('INSTANCED OVER-CULL RISK (renderer skips these while instances are in view):');
      for(const i of risky)console.log(`  ${i.name}: ${i.inFrustum}/${i.count} instances in frustum, mesh culled`);
    }
    const solo=c.frag.filter(x=>x.meshesPerMat===1)[0];
    if(solo)console.log(`material fragmentation: ${solo.mats} materials used by exactly 1 mesh each (${solo.totalMeshes} draws' worth)`);
  }
}finally{
  try{ await Promise.race([browser.close(),new Promise(r=>setTimeout(r,1500))]); }catch(e){}
  process.exit(0);
}

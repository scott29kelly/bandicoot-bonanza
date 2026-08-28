/**
 * Beats 1–3: beach start → gap jumps over water → crate yard + first TNT.
 * Layout coordinates carry over from the old game (docs/GA3-PLAN.md).
 *
 * Every named place is mark()ed and every framing registers HERE, beside the
 * beat it judges, resolving from those landmarks — never from written-down
 * world coordinates (Far Country lesson).
 */
import * as THREE from 'three';
import {rand} from '../core/rng.js';
import {mark,addFraming} from '../review/framings.js';
import {toonMat} from '../art/materials.js';
import {mergeGeoms} from './geo.js';
import {islandMass} from './masses.js';
import {createWater} from './water.js';
import {createBackdrop} from './backdrop.js';
import {makeCrate,makeTNT} from './props.js';
import {makePalm,makeFern,makeGrassField,makePebbles,makeShells,makeTwigs} from './flora.js';
import {contactBlob} from './contact.js';

/** Seeded scatter over an island top, thinning toward the corridor centre. */
function scatter(n,s,inset=0.8,avoid=[]){
  const out=[];
  let guard=n*8;
  while(out.length<n&&guard-->0){
    const x=rand(s.minX+inset,s.maxX-inset),z=rand(s.minZ+inset,s.maxZ-inset);
    // Keep the running line readable: debris thins out where the player runs.
    const mid=Math.abs(x-(s.minX+s.maxX)/2)/((s.maxX-s.minX)/2);
    if(rand(0,1)>0.35+mid*0.65)continue;
    // Nothing tall grows through a prop.
    if(avoid.some(a=>(x-a.x)*(x-a.x)+(z-a.z)*(z-a.z)<a.r*a.r))continue;
    out.push([x,s.topY,z]);
  }
  return out;
}

export function buildBeach(scene){
  const solids=[],updates=[];

  /* ---------- the islands (beats 1–3) ---------------------------------- */
  const beach=islandMass({x:0,z:-12.5,w:14,d:35});
  const gapA=islandMass({x:0,z:-35,w:7,d:4});
  const gapB=islandMass({x:0,z:-43.5,w:7,d:4});
  const yard=islandMass({x:0,z:-54.5,w:12,d:17});
  for(const m of [beach,gapA,gapB,yard]){scene.add(m.mesh);solids.push(m.solid);}
  mark('beach',beach.mesh);
  mark('gapA',gapA.mesh);
  mark('gapB',gapB.mesh);
  mark('crateYard',yard.mesh);

  /* ---------- sea + backdrop ------------------------------------------- */
  const water=createWater([beach.solid,gapA.solid,gapB.solid,yard.solid]);
  scene.add(water.group);
  updates.push(water.update);
  scene.add(createBackdrop());

  /* ---------- palms ----------------------------------------------------- */
  const avoid=[]; // grass keeps clear of every prop footprint
  const ground=(x,z,r,y=0,op=1)=>{
    const b=contactBlob(r,op);
    b.position.set(x,y+0.05,z);
    scene.add(b);
  };
  for(const [x,z,h] of [[-5.5,-4,4.5],[5.8,-9,5],[-5.2,-18,5.4],[6,-24,4.2],
                        [-6,-27.5,3.6],[-5.4,-49,4.8],[5.6,-58,5.2],[4.6,-61,3.9]]){
    const p=makePalm(x,0,z,h);
    scene.add(p.group);
    updates.push(p.update);
    avoid.push({x,z,r:1.0});
    ground(x,z,0.85);
  }

  /* ---------- crates + the first TNT ----------------------------------- */
  const crateAt=(x,y,z)=>{
    const c=makeCrate(x,y,z);
    scene.add(c.mesh);
    solids.push(c.solid);
    avoid.push({x,z,r:1.15});
    ground(x,z,1.0,y,y>0?0.55:1); // stacked crates shade the crate below
    return c;
  };
  crateAt(-1.4,0,-14);crateAt(0,0,-14);crateAt(1.4,0,-14);
  crateAt(-2.2,0,-52);crateAt(-1,0,-52);crateAt(1,0,-52);crateAt(2.2,0,-52);
  crateAt(-1.6,1.13,-52);crateAt(1.6,1.13,-52);
  const tnt=makeTNT(0,0,-52);
  scene.add(tnt.mesh);
  solids.push(tnt.solid);
  avoid.push({x:0,z:-52,r:1.15});
  ground(0,-52,0.95);
  mark('tnt1',tnt.mesh);

  /* ---------- ground cover --------------------------------------------- */
  for(const [x,z,s] of [[-6.2,-8,1.1],[6.3,-15,0.9],[-6.4,-22,1.2],[6.2,-28,0.8],
                        [-5.2,-46.5,1.0],[5.3,-52,1.1],[-5.6,-60,0.9],[2.8,-62,0.7]]){
    scene.add(makeFern(x,0,z,s));
    avoid.push({x,z,r:0.8});
    ground(x,z,0.55*s,0,0.7);
  }

  const grassSpots=[
    ...scatter(230,beach.solid,0.8,avoid),
    ...scatter(28,gapA.solid,0.5,avoid),...scatter(28,gapB.solid,0.5,avoid),
    ...scatter(120,yard.solid,0.8,avoid)];
  const grass=makeGrassField(grassSpots);
  scene.add(grass.mesh);
  updates.push(grass.update);

  const spots=(n)=>[
    ...scatter(Math.round(n*0.62),beach.solid,0.4),
    ...scatter(Math.round(n*0.07),gapA.solid,0.3),
    ...scatter(Math.round(n*0.07),gapB.solid,0.3),
    ...scatter(Math.round(n*0.24),yard.solid,0.4)];
  scene.add(makePebbles(spots(950)));
  scene.add(makeShells(spots(400)));
  scene.add(makeTwigs(spots(280)));

  /* ---------- fruit ----------------------------------------------------- */
  const fruitPos=[];
  const fruitRow=(x,y,z0,z1,n)=>{
    for(let i=0;i<n;i++){
      const z=z0+(z1-z0)*i/(n-1);
      fruitPos.push([x,y+0.55,z]);
      ground(x,z,0.24,y,0.5); // hovering fruit still throws a soft pool
    }
  };
  fruitRow(0,0,-5,-11,5);
  fruitPos.push([0,1.6,-31.5],[0,1.8,-39.2],[0,1.8,-47.3]); // arcs over the gaps
  fruitRow(3,0,-49,-55,4);
  // A wumpa is a DESIGNED object, not a sphere (round-1 verdict, gap 3):
  // squashed body + stem + two leaves, two materials via geometry groups.
  const body=new THREE.SphereGeometry(0.27,12,10);
  body.scale(1,1.14,1);
  const stem=new THREE.CylinderGeometry(0.02,0.035,0.09,6);
  stem.translate(0,0.33,0);
  const leaf=(rot)=>{
    const l=new THREE.SphereGeometry(0.09,6,4);
    l.scale(1.6,0.28,0.7);
    l.translate(0.13,0.34,0);
    const m=new THREE.Matrix4().makeRotationY(rot);
    l.applyMatrix4(new THREE.Matrix4().makeRotationZ(0.45).premultiply(m));
    return l;
  };
  const bodyGeo=body.toNonIndexed();
  const greenGeo=mergeGeoms([stem,leaf(0.4),leaf(2.8)]);
  const fruitGeo=mergeGeoms([bodyGeo,greenGeo]);
  fruitGeo.addGroup(0,bodyGeo.getAttribute('position').count,0);
  fruitGeo.addGroup(bodyGeo.getAttribute('position').count,
    greenGeo.getAttribute('position').count,1);
  // Albedo deliberately below "orange you'd pick": AgX rolls hot values to
  // cream. Emissive is a glow hint, not the colour (old DELTA, pass 3).
  const fruitMesh=new THREE.InstancedMesh(fruitGeo,[
    toonMat({color:0xd45a0e,emissive:0xff7a1a,emissiveIntensity:0.32}),
    toonMat({color:0x4e7d2a})],fruitPos.length);
  const _m=new THREE.Matrix4(),_e=new THREE.Euler(),_q=new THREE.Quaternion(),
        _v=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1);
  const phases=fruitPos.map(()=>rand(0,Math.PI*2));
  function fruitUpdate(t){
    for(let i=0;i<fruitPos.length;i++){
      const [x,y,z]=fruitPos[i];
      _v.set(x,y+Math.sin(t*2.2+phases[i])*0.11,z);
      _q.setFromEuler(_e.set(0,t*1.6+phases[i],0));
      _m.compose(_v,_q,_s);
      fruitMesh.setMatrixAt(i,_m);
    }
    fruitMesh.instanceMatrix.needsUpdate=true;
  }
  fruitUpdate(0);
  scene.add(fruitMesh);
  updates.push(fruitUpdate);

  /* ---------- framings — one per clause this slice can be judged on ----- */
  addFraming(at=>({id:'title-hero',name:'Title hero',
    tests:'Pillar E — the first frame a player sees: palms frame it, the corridor leads away, three distance layers hold',
    p:at('beach',-4.6,2.8,11.5),lookAt:at('beach',2,1.2,-11.5),fov:48,player:[0,0,-8]}));
  addFraming(at=>({id:'beach-corridor',name:'Beach corridor',
    tests:'Pillars D/E — the opening holds depth; no bare slab, no empty frame',
    p:at('beach',0,3.4,17.5),lookAt:at('crateYard',0,0.5,20),fov:52,player:[0,0,-7]}));
  addFraming(at=>({id:'hero-closeup',name:'Hero close-up',
    tests:'Pillars A/B — character silhouette and chromatic shadow at portrait range',
    p:at('beach',2.9,1.5,5.7),lookAt:at('beach',1.2,1.0,3.5),fov:38,player:[1.2,0,-9]}));
  addFraming(at=>({id:'water-gap',name:'Water gap',
    tests:'Pillars B/F — depth-graded water, foam at the shoreline, visible flow',
    p:at('gapA',8.5,1.9,7),lookAt:at('gapB',-1.5,0.4,1),fov:47,player:[0,0,-35]}));
  addFraming(at=>({id:'crate-cluster',name:'Crate cluster',
    tests:'Pillars A/C — prop relief, and ground that is dressed, not bare',
    p:at('tnt1',5.2,1.5,4.5),lookAt:at('tnt1',-0.3,0.3,-0.8),fov:44,player:[2.6,0,-50]}));

  return {
    solids,
    spawn:[0,0,-5],
    update(t){for(const u of updates)u(t);}
  };
}

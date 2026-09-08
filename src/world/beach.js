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
import {CFG} from '../game/cfg.js';
import {toonMat} from '../art/materials.js';
import {mergeGeoms} from './geo.js';
import {islandMass,shoreRocks} from './masses.js';
import {createWater} from './water.js';
import {createBackdrop} from './backdrop.js';
import {makeCrate,makeTNT} from './props.js';
import {makePalm,makeFern,makeGrassField,makeBroadleafField,
        makeFlowerField,makePebbles,makeShells,makeTwigs} from './flora.js';
import {contactBlob,contactField} from './contact.js';

/** Seeded scatter over an island top, thinning toward the corridor centre. */
function scatter(n,s,inset=0.8,avoid=[]){
  const out=[];
  let guard=n*8;
  while(out.length<n&&guard-->0){
    const x=rand(s.minX+inset,s.maxX-inset),z=rand(s.minZ+inset,s.maxZ-inset);
    // Keep the running line readable: debris thins out where the player runs.
    const mid=Math.abs(x-(s.minX+s.maxX)/2)/((s.maxX-s.minX)/2);
    if(rand(0,1)>0.5+mid*0.5)continue;
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
  for(const m of [beach,gapA,gapB,yard]){scene.add(m.mesh);solids.push(m.solid);scene.add(shoreRocks(m.solid));}
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
  // A composed palm: leans its crown over the beach-corridor camera so the
  // framing's top is closed by canopy, not empty sky (Pillar E).
  const framePalm=makePalm(2.6,0,4.6,6.5,{lean:2.3,leanDir:-Math.PI/2,yaw:0});
  scene.add(framePalm.group);
  updates.push(framePalm.update);
  ground(2.6,4.6,0.85);

  /* ---------- crates + the first TNT ----------------------------------- */
  const crateAt=(x,y,z)=>{
    const c=makeCrate(x,y,z);
    scene.add(c.mesh);
    solids.push(c.solid);
    avoid.push({x,z,r:1.15});
    // Upper crates: r 0.7 keeps the disc INSIDE the lower crate's top —
    // at 1.35 it lay past the edge and read as a black wedge on the stack
    // (round 24, crop-verified).
    ground(x,z,y>0?0.7:1.35,y,y>0?0.55:1);
    return c;
  };
  // Air between them: butted edge to edge the three read as one plank
  // fence across the title frame (round 30).
  crateAt(-1.8,0,-14);crateAt(0,0,-14.25);crateAt(1.8,0,-14);
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
    ...scatter(300,beach.solid,0.8,avoid),
    // 60 each (was 28): the water-gap foreground platform measured 75%
    // bare sand (round 25).
    // 110 each (was 60): the water-gap slab top still measured bare
    // over ~20% of the frame within 12 m (round 31).
    ...scatter(110,gapA.solid,0.5,avoid),...scatter(110,gapB.solid,0.5,avoid),
    ...scatter(120,yard.solid,0.8,avoid)];
  const grass=makeGrassField(grassSpots);
  scene.add(grass.mesh);
  updates.push(grass.update);
  scene.add(contactField(grassSpots,0.30,0.5));

  const broadSpots=[
    ...scatter(90,beach.solid,0.9,avoid),
    ...scatter(18,gapA.solid,0.6,avoid),...scatter(18,gapB.solid,0.6,avoid),
    ...scatter(45,yard.solid,0.9,avoid)];
  const broad=makeBroadleafField(broadSpots);
  scene.add(broad.mesh);
  updates.push(broad.update);
  scene.add(contactField(broadSpots,0.42,0.55));

  // Blossoms keep clear of the broadleaf clumps: a stem under a leaf
  // showed as a bare dark peg through the whorl (round 21, crop-verified).
  const flowerAvoid=[...avoid,...broadSpots.map(([x,,z])=>({x,z,r:0.75}))];
  scene.add(makeFlowerField([
    ...scatter(110,beach.solid,0.7,flowerAvoid),
    ...scatter(50,yard.solid,0.7,flowerAvoid)]));

  // Debris avoids the prop footprints too: a shell cut into a crate post
  // in the framing that judges prop relief (round 22, crop-verified).
  const spots=(n)=>[
    ...scatter(Math.round(n*0.62),beach.solid,0.4,avoid),
    // Margin 0.7 (was 0.3): a pebble on the islet lip showed as a ghost
    // polygon half inside the skirt face (round 32, crop-verified).
    ...scatter(Math.round(n*0.18),gapA.solid,0.7),
    ...scatter(Math.round(n*0.18),gapB.solid,0.7),
    ...scatter(Math.round(n*0.24),yard.solid,0.4,avoid)];
  // Pebble sockets: sand directly under a pebble measured LIGHTER than
  // beside it (round 33). Same spots, one draw set — the discs draw none.
  const pebbleSpots=spots(950);
  scene.add(makePebbles(pebbleSpots));
  scene.add(contactField(pebbleSpots,0.13,0.5));
  scene.add(makeShells(spots(400)));
  scene.add(makeTwigs(spots(280)));

  /* ---------- fruit ----------------------------------------------------- */
  const fruitPos=[];
  const fruitRow=(x,y,z0,z1,n)=>{
    for(let i=0;i<n;i++){
      const z=z0+(z1-z0)*i/(n-1);
      fruitPos.push([x,y+0.62,z]);
      ground(x,z,0.20,y,0.5); // hovering fruit still throws a soft pool
    }
  };
  // Off the centreline: on it, the corridor and title framings stack the
  // bobbing row visually ONTO the hero ("oddly clutching a fruit").
  fruitRow(-1.6,0,-5,-11,5);
  fruitPos.push([0,1.6,-31.5],[0,1.8,-39.2],[0,1.8,-47.3]); // arcs over the gaps
  fruitRow(4.3,0,-49,-55,4); // off the crate-cluster hero (round 26)
  // A wumpa is a DESIGNED object, not a sphere. Round 6 ranked the sphere
  // body as the banned outcome verbatim, stem notwithstanding — so the body
  // gets sculpted: five lobes around the axis and a stem dimple at the top.
  const body=new THREE.SphereGeometry(0.27,18,14);
  {
    const bp=body.getAttribute('position');
    for(let i=0;i<bp.count;i++){
      const x=bp.getX(i),y=bp.getY(i),z=bp.getZ(i);
      const rxz=Math.hypot(x,z);
      // 0.09: at 0.055 the lobes vanished under the toon ramp's two-step
      // shading and the fruit still read as spheres (round-8 verdict).
      const lobe=1+0.09*Math.cos(Math.atan2(z,x)*5)*(rxz/0.27);
      let ny=y*1.1;
      if(y>0)ny-=Math.exp(-Math.pow(rxz/0.09,2))*0.09; // dimple seats the stem
      bp.setXYZ(i,x*lobe,ny,z*lobe);
    }
    body.computeVertexNormals();
  }
  const stem=new THREE.CylinderGeometry(0.03,0.05,0.13,6);
  stem.translate(0,0.24,0);
  const leaf=(rot)=>{
    const l=new THREE.SphereGeometry(0.09,6,4);
    l.scale(2.1,0.32,0.9);
    l.translate(0.16,0.28,0);
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
  // cream. Emissive is a glow hint, not the colour — and at 0.42 it FLOODED
  // the shading: the round-7 sculpted lobes rendered as flat discs because
  // the glow erased the light side / shade side split. 0.16 keeps the hint.
  const fruitMesh=new THREE.InstancedMesh(fruitGeo,[
    // Warm fresnel rim: the lobes read only at the terminator; without an
    // edge highlight the fruit still "names SphereGeometry" (round 20).
    toonMat({color:0xd45a0e,emissive:0xff7a1a,emissiveIntensity:0.16,
             rim:{color:0xffe0a0,strength:1.2,power:3.2}}),
    toonMat({color:0x4e7d2a})],fruitPos.length);
  const _m=new THREE.Matrix4(),_e=new THREE.Euler(),_q=new THREE.Quaternion(),
        // 0.8: at 1.0 a wumpa at the hero's depth was 0.31 of his height
        // against form-1's ~0.15 (round 32).
        _v=new THREE.Vector3(),_s=new THREE.Vector3(0.8,0.8,0.8);
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
  // Camera pulled in and dropped: three critics running called the old
  // frame "found, not composed" — hero small, right of centre, outweighed
  // by fruit. Now he owns the lower third and the corridor leads past him.
  addFraming(at=>({id:'title-hero',name:'Title hero',
    tests:'Pillar E — the first frame a player sees: the hero is the subject, palms frame it, three distance layers hold',
    p:at('beach',-2.7,1.7,7.6),lookAt:at('beach',3.7,0.7,-5),fov:46,player:[0,0,-8,-0.5,0.85]}));
  // Low and off-axis, hero running AWAY down the corridor: the high
  // centered survey shot read as "40% empty sand foreground" and the
  // standing hero as frozen (rounds 15–16).
  addFraming(at=>({id:'beach-corridor',name:'Beach corridor',
    tests:'Pillars D/E — the opening holds depth; no bare slab, no empty frame',
    p:at('beach',1.9,2.2,16.5),lookAt:at('crateYard',-1.1,1.1,20),fov:52,player:[0.6,0,-7,0,0.6]}));
  addFraming(at=>({id:'hero-closeup',name:'Hero close-up',
    tests:'Pillars A/B — character silhouette and chromatic shadow at portrait range',
    // Lower: at 1.5 the head sat against the hill shell, the flattest
    // region in the set (round 23, composition).
    p:at('beach',2.9,1.05,5.7),lookAt:at('beach',1.2,0.85,3.5),fov:38,player:[1.2,0,-9]}));
  addFraming(at=>({id:'water-gap',name:'Water gap',
    tests:'Pillars B/F — depth-graded water, foam at the shoreline, visible flow',
    p:at('gapA',8.5,1.9,7),lookAt:at('gapB',-1.5,0.4,1),fov:47,player:[0,0,-35]}));
  // Ordinary play, not a composed shot (method §4): the follow camera at
  // its gameplay offset, hero running mid-corridor. What a player sees.
  addFraming(at=>({id:'play-camera',name:'Play camera',
    tests:'Ordinary use — the follow camera; every pillar as a player meets it',
    p:at('beach',0+CFG.camOffX,CFG.camOffY,-12+CFG.camOffZ),lookAt:at('beach',0,1.2,-14),fov:55,player:[0,0,-12,0,0.6]}));
  addFraming(at=>({id:'crate-cluster',name:'Crate cluster',
    tests:'Pillars A/C — prop relief, and ground that is dressed, not bare',
    p:at('tnt1',5.2,1.5,4.5),lookAt:at('tnt1',-0.3,0.3,-0.8),fov:44,
    // Off the camera→TNT line: at [2.6,-50] the hero covered the label.
    player:[3.2,0,-51.0,0.9,0.25]}));

  // Two more composed palms close the lid of the title and water-gap
  // frames (round 31: sky 16% / 29% of those frames, ≤1.4% in every
  // ref). Built LAST so the seeded stream ahead of them is unchanged and
  // nothing else moves.
  for(const [x,z,h,lean,leanDir] of [[-6.3,-7.5,5.2,3.2,-1.10],[5.9,-27.4,4.8,3.0,-2.18]]){
    const p=makePalm(x,0,z,h,{lean,leanDir,yaw:0});
    scene.add(p.group);
    updates.push(p.update);
    ground(x,z,0.85);
  }

  return {
    solids,
    spawn:[0,0,-5],
    update(t,heroPos){for(const u of updates)u(t,heroPos);}
  };
}

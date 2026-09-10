# Work orders

Every critic tell, test failure or observation becomes an order.
Orders are never deleted; disposition changes. Priority P1 = whole-
experience or functional, P2 = large visual, P3 = local polish.
Tactic history counts attempts per tactic (method §10): three ties or
rejections on one tactic end it; two failed implementation attempts on
one order stop that retry loop.

Status: OPEN · IN PROGRESS · CLOSED (evidence) · STALLED (tactic ended)
· DEBT (accepted, not scheduled).

## Functional

| ID | Round | Source | Problem / impact | Hypothesis / intervention | Pri | Status |
|---|---|---|---|---|---|---|
| WO-F01 | — | observation | Fruit is decorative; no collection, count or HUD | ported: `src/game/rules.js` pickup (d² < 1.35 at hero centre), `src/game/hud.js`, HUD boxes in `src/shell.html` | P1 | CLOSED (M2, 1a8e534: `tools/playtest.mjs` fruit 5/5 + HUD "5 / 12"; Scott's real-input playtest still owed under G7) |
| WO-F02 | — | observation | Crates and TNT do not break or explode | ported: stomp (hero hook onLand → 'bounce' at `crateBounce`) and spin (Shift/K, `spinRadius`) break crates; TNT arms, fuse 2.2 s, radius 4.6; solids keep a `dead` flag | P1 | CLOSED (M2, 1a8e534: playtest stomp, spin, tnt ×4 PASS) |
| WO-F03 | — | observation | No checkpoints / respawn on water fall | ported: totem at (-4.2,0,-48.5) (`makeCheckpoint`, no random draws, built last), z-line activation, respawn (0,0.1,-47.3) with fruit kept, lives 3 → reset at 0 | P1 | CLOSED (M2, 1a8e534: playtest checkpoint, fall, lives PASS) |
| WO-F08 | M2 | builder | Rules fire with NO effect: a crate vanishes, the TNT vanishes, fruit vanishes, the totem gem only recolours. The old game had debris, sparks, flash and camera trauma | render/art owner: debris burst on break, spark burst on pickup, flash + shake on explode, gem flare on activate. Keep every draw through the seeded rng AFTER scatter (or a local generator) | P2 | OPEN |
| WO-F09 | M2 | builder | Totem has no solid: the hero walks through it | add a solid to `makeCheckpoint` (or accept: it is off the path at x = -4.2) | P3 | OPEN |
| WO-F10 | M2 | builder | Death is instant: no death animation, no i-frames (`CFG.iframes` 1.4 unused), no fall-into-water splash; TNT hit teleports the hero mid-blast | port the old DYING state (1.5 s) and iframes | P2 | OPEN |
| WO-F11 | M2 | builder | Zero lives silently resets the run; no title, game-over or victory screen; no level end | port the old state machine (TITLE / PLAYING / DYING / GAMEOVER / VICTORY) once beats 4–12 exist | P2 | DEBT (declared with WO-F04) |
| WO-F12 | M2 | builder | Camera lerps ~40 m after a respawn (rate 6/s ≈ 0.7 s of flight across the water) | snap the follow camera on respawn (`camSnap=true` via a hero/rules event) | P3 | OPEN |
| WO-F13 | M2 | builder | Respawn point is a per-totem literal in `beach.js` (`cp.respawn`); the old game used (0, topY+0.1, z+1.2) | fine for beat 3; generalise when beats 4–12 add totems | P3 | DEBT |
| WO-F04 | — | observation | Beats 4–12 missing | build per `docs/GA3-PLAN.md` beat plan | P1 | DEBT (declared) |
| WO-F05 | — | observation | Keyboard/gamepad input never verified by a real playtest | Scott playtest checklist (G8) | P1 | OPEN |
| WO-F06 | — | observation | No audio | `tools/generate_audio_pack.mjs` exists; key empty | P2 | DEBT |
| WO-F07 | — | observation | Performance unmeasured on a real GPU | `?perf` run on Scott's machine, p95 | P1 | OPEN |

## Visual — whole-experience

| ID | Round | Source | Problem / impact | Hypothesis / intervention | Pri | Status | Attempts (tactic) |
|---|---|---|---|---|---|---|---|
| WO-V01 | r28–r35 | critic ×5 | Dark share <0.15 L is 1–8% vs refs 12–23%; frames read as lit dioramas | Grade floor + more casters tried; sand shade is already at ref ratio; the refs' dark quarter is undergrowth interiors and occluded hollows | P2 | STALLED | r29 floor halved (moved 0→1%), r30 canopy pools (no move), r31 form term (no move) → tactic "global darkening" ENDED after 3. Next: a different tactic — modelled dark interiors (leaf-card clusters with occluded cores) or a top-of-frame canopy layer |
| WO-V02 | r28–r35 | critic ×6 | Jungle mass reads as faceted low-poly blobs, lollipop trees on it | Crown carpet is the ceiling of the cheap approach; needs layered leaf cards with trunks | P2 | OPEN | r29 crowns 9×6 + depth darkening (still faceted) → 1 attempt (tactic "sphere crowns") |
| WO-V03 | r28–r35 | critic ×6 | Hero body primitives: belly flat, no fur silhouette, cheek fins, dot mouth, nose smear, tail fin, chest tufts as scratches | Paint tried twice; the chest wants geometry. Candidate tactic: adopt the Blender `hero.glb` from `origin/main` via GLTFLoader (needs Scott's decision) or sculpt more parts | P2 | OPEN | r29 bib gradient (no read), r31 form term (edge only), r35 warm form term (band sat 0.05→0.10) → tactic "paint the belly" ENDED after 3 |
| WO-V04 | r31, r32 | critic | Sky 15–35% of wide frames vs ≤1.4% in refs; no overhead lid | Composed palms (thin lid) tried; needs a canopy layer | P2 | OPEN | r32 two palms (title 16.7→15.8, water-gap 36.6→35.6) → 1 attempt |
| WO-V05 | r32, r33 | critic | Hero 0.13 of frame height in corridor and water-gap | Reframe those two framings (camera lower/closer) | P2 | DEBT (composition choice, revisit at M2) | 0 |
| WO-V06 | r35 | critic | No directional step on mid-facing surfaces: crate faces 0.36/0.35/0.36, jaw underside brighter than cheek | Ramp never reaches its shade band 30–80° from key; the hemi (0.80) fills it. Try: ramp texel 2 darker + hemi 0.60 with a measured face-turn ratio ≥1.5 | P2 | OPEN | 0 |
| WO-V07 | r35 | critic | Ground dressing has no spatial design: path centre as dense as banks | Path mask on scatter density (×0.3 centre, ×2 banks) | P2 | OPEN | 0 |
| WO-V08 | r29–r33 | critic | Crates identical per instance; single grain stamp | Per-instance wear, plank-end darkening, grain phase | P3 | OPEN | 0 |
| WO-V09 | M2 (p02) | critic A/B | Foreground sand has no macro variation: luma std 0.038 over the beach-corridor foreground (candidate side); ref form-1 sand carries two-scale breakup, embedded pebbles and dapple | second, larger sand octave in the vertex paint (≤0.9 pale octave rule) + canopy dapple projected onto the path | P2 | OPEN | 0 |
| WO-V10 | M2 (p02) | critic A/B | No aerial gradient between jungle layers: near hill sat 0.78 = mid jungle sat 0.78; only the far mountain drops (0.24) | render owner: per-layer desaturation with distance before the grade (ties to WO-L09) | P2 | OPEN | 0 |
| WO-V11 | M2 (p02) | critic A/B | Contact occlusion too light: under boots and crate bases the shade is ~0.75 of lit; ref form-3 drops to 0.15–0.25 under the shoes | contact blob opacity/radius curve (contact.js): darker core, same rim | P2 | OPEN | 0 |
| WO-V12 | M2 (p02) | critic A/B | Hero belly core-shadow band under-strength: luma 192 → 176 over 100 px (ratio 0.92) vs a ref gradient ≈0.4–0.5; the critic's top pick again ("hero form lighting") | this is WO-V06 (form step) applied to the hero + WO-V03 geometry; measure the belly ratio (target ≤0.55) | P2 | OPEN | 0 (WO-V03's paint tactic is ENDED; use the ramp/hemi tactic of WO-V06 or geometry) |

## Visual — local

| ID | Round | Source | Problem / impact | Hypothesis / intervention | Pri | Status | Attempts |
|---|---|---|---|---|---|---|---|
| WO-L01 | r28, r33 | critic | Sea stacks: two-tone paint, no strata/moss; shade went grey then inverted | Painted after flat normals (r29), lifted bands (r34), saturated (r35): shade sat 0.075→0.38. Remaining: strata do not read at 60 m, waterline band | P3 | IN PROGRESS | 3 (tactic "vertex paint") — at limit |
| WO-L02 | r28–r31 | critic | Foam a milky sheet over ~35% of water-gap; no wet-sand band; hard platform/water line | Halo alpha 0.6→0.5 (r29) barely moved. Next: narrow lace band at contact + wet-sand ring | P3 | OPEN | 1 |
| WO-L03 | r35 | critic | No shoreline band on beach edges (≤6 px transition) | Wet-sand darkening ring in the sand vcolor at the rim + shallow lightening | P3 | OPEN | 0 |
| WO-L04 | r28–r31 | critic | Platform skirt a flat brown face | Strata relief 0.18/paint 0.13 (r30) — "present but faint" | P3 | IN PROGRESS | 1 |
| WO-L05 | r28, r33 | critic | Pebbles: flat shards → rounded (r31) but cool grey in shade, proud of the sand | Sink 30%, warm shade via hemi ground colour | P3 | IN PROGRESS | 2 (r31 subdivide, r34 sockets) |
| WO-L06 | r29, r33, r35 | critic | Fruit: no glint, floats with no ground shadow in title/crate-cluster; 0.37 of hero height | Contact disc exists (`ground()`), but at 0.5 opacity under a hovering fruit it does not read; add a glint sprite; scale 0.8 done r33 | P3 | OPEN | 1 |
| WO-L07 | r29 | critic | Palm trunk zigzag repeat ~35 px; fronds one plane | Ring relief in the trunk geometry; two-plane fronds | P3 | OPEN | 0 |
| WO-L08 | r30, r35 | critic | Grass blades one value each; rim narrow (1–3 px) | Root colour 0.38 (r31), darker instances (r35: blade/sand 1.18→0.92). Remaining: per-blade gradient, rim width | P3 | IN PROGRESS | 2 |
| WO-L09 | r33 | critic | Water: no aerial fade at 100–300 m (grade re-saturates), no reflection of the jungle | Render owner: exclude far water from the saturation push, or fog before grade | P3 | OPEN | 0 |
| WO-L10 | r32 | critic | Blossoms read as a bar with a cross at 4 m | Petal size up, or fewer/larger blossoms | P3 | OPEN | 1 (r32 petals) |
| WO-L11 | r30 | critic | Boots and hands undesigned (fingers 3× ref size) | model.js | P3 | OPEN | 0 |
| WO-L12 | r28, r29 | critic | Sky two-band gradient; clouds flat pills | shaded cloud lumps, horizon warmth | P3 | OPEN | 0 |
| WO-L13 | r33 | critic | Canopy shade hue on sand olive (54–80°) not blue-green | hemiGround colour toward teal | P3 | OPEN | 0 |
| WO-L14 | r32 | critic | Shore rock set into the islet skirt face at the lip | shoreRocks: reject placements whose centre is inside the skirt | P3 | OPEN | 0 |
| WO-L15 | r35 | critic | Water-gap near platform tip bare (beach south tip) | scatter patch at the tip | P3 | OPEN | 0 |
| WO-L16 | r34 | critic | Twigs flat cards; tail a flat fin | cylinder twigs; tail tube already exists — check the fin read | P3 | OPEN | 0 |
| WO-L17 | M2 (p02) | critic A/B | crate-cluster (candidate): the light-green bush underside shows alternating yellow/green diagonal stripes (640–800, 165–195) — shadow acne or a light leak; the bush itself is a flat-faceted blob at sat 0.85 | check shadow bias on the bush material; the blob is WO-V02's tactic problem | P3 | OPEN | 0 |
| WO-L18 | M2 (p02) | critic A/B | title-hero (candidate): a blue-grey pebble shard sits directly under the rear boot (830–880, 690–720); the boot reads as standing on it | add the title pose footprint to the pebble avoid list (framing.player positions → avoid) | P3 | OPEN | 0 |
| WO-L19 | M2 (p02) | critic A/B | Fruit reads as a soft gradient sphere with no specular shape (title-hero 470–570, 590–700), maxV 0.91 | WO-L06's glint sprite; or a small hard highlight in the rim term | P3 | OPEN | 0 (merge with WO-L06) |

## Regressions found by A/B (packets p01 r28 vs r35; p02 r28 vs r36)

| ID | Round | Source | Problem / impact | Hypothesis / intervention | Pri | Status | Attempts |
|---|---|---|---|---|---|---|---|
| WO-R01 | M1, M2 | critic A/B ×2 | water-gap: composed palm's shadow on the near platform has a 4–5 px sawtooth edge and a near-black rectangle where it crosses the bevel (0–380, 470–560). p02 re-measured on the candidate: band (100–165, 545–580) darkest 20% rgb(10,15,17) V 0.067 sat 0.42 hue 197 — chromatic, but 848/2275 px under V 0.12 "reads as a hole"; edge steps 4–6 px | Portrait-range shadow-map texel size + the bevel's normal bias; the palm was added r32. Try: move the palm so its shadow does not cross the bevel, or a softer edge (normalBias/PCF radius — note PCF radius was banned r-early for erasing thin casters; test on this shot only) | P2 | OPEN (M3 candidate) | 0 |
| WO-R02 | M1 | critic A/B | Sea stacks: stepped strata at sat 0.68 read as yellow hatch bands (water-gap 940–1070, 170–330; hero-closeup 1000–1120, 230–300) | r34–35 lifted and saturated the bands; lower sat to ~0.45 and blur band edges by noise | P3 | OPEN | 0 (WO-L01 tactic count applies: 3, at limit — change tactic: texture instead of vertex paint) |
| WO-R03 | M1 | critic A/B | title-hero: candidate reads "thinner colour" (global sat 0.588 vs 0.647; jungle mass 0.722 vs 0.802) | WITHDRAWN (M2): builder measured mean HSV saturation of the stills — r28 0.588, r35 0.647, r36 0.648 (hero-closeup 0.598 / 0.662 / 0.662; water-gap 0.562 / 0.606 / 0.606). The p01 critic attached the numbers to the wrong side; the candidate is the MORE saturated frame, and the p02 critic preferred it for that. Lesson: measure a critic's A/B number before filing it | P3 | CLOSED (withdrawn, M2) | 0 |
| WO-R04 | M2 | critic A/B | hero-closeup: the new checkpoint totem (gem + brass band) shows at the right edge (1200–1280, 240–330) and pulls the eye off the hero; the framing lost its pair to the baseline (low-med) | move the totem (it sits at (-4.2,0,-48.5); the framing's long axis reaches it) or re-aim the framing; do NOT drop the totem — it is gameplay | P3 | OPEN | 0 |
| WO-R05 | M2 | critic A/B | hero-closeup: a grass tuft crosses the hero's shins and boots (400–560, 520–800); the feet and contact shadow are hidden. Present since the r31 grass density rise (110/gap island), first named at p02 | grass avoid disc at every framing's player position (same fix as WO-L18) | P3 | OPEN | 0 |
| WO-R06 | M2 | critic A/B | title-hero (candidate): crate shade side luma 0.278 vs baseline 0.173 — less form contrast on the crates after the r27 emissiveMap lift | this is WO-V06's face-turn ratio; measure with it | P3 | OPEN | 0 |
| WO-T01 | M1 | observation | `tools/packet.mjs` printed "?" for tri/draw counts | read `stats.triangles` / `stats.drawCalls` | P3 | CLOSED (M1, NOTE.md now lists counts) | 1 |

## Engine limits (logged, not scheduled)

- Shadow-map texel staircase on crate faces at portrait range (4096 map).
- Toon gradientMap samples red only (three r0.184): ramp colour is value
  only; shade hue comes from the hemisphere light.

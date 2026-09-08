# Work orders

Every critic tell, test failure or observation becomes an order.
Orders are never deleted; disposition changes. Priority P1 = whole-
experience or functional, P2 = large visual, P3 = local polish.
Tactic history counts attempts per tactic (method §10): three ties or
rejections on one tactic end it; two failed implementation attempts on
one order stop that retry loop.

Status: OPEN · IN PROGRESS · CLOSED (evidence) · STALLED (tactic ended)
· DEBT (accepted, not scheduled).

## Functional (never reviewed — no gameplay exists beyond movement)

| ID | Round | Source | Problem / impact | Hypothesis / intervention | Pri | Status |
|---|---|---|---|---|---|---|
| WO-F01 | — | observation | Fruit is decorative; no collection, count or HUD | port the old game's pickup + HUD from `origin/claude/aaa-visual-quality:index.html` into `src/game/` | P1 | OPEN |
| WO-F02 | — | observation | Crates and TNT do not break or explode | port break/explode rules; instanced crate removal | P1 | OPEN |
| WO-F03 | — | observation | No checkpoints / respawn on water fall | port checkpoint rules | P1 | OPEN |
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

## Regressions found by A/B (packet p01, r28 vs r35)

| ID | Round | Source | Problem / impact | Hypothesis / intervention | Pri | Status | Attempts |
|---|---|---|---|---|---|---|---|
| WO-R01 | M1 | critic A/B | water-gap: composed palm's shadow on the near platform has a 4–5 px sawtooth edge and a near-black rectangle where it crosses the bevel (0–380, 470–560) | Portrait-range shadow-map texel size + the bevel's normal bias; the palm was added r32. Try: move the palm so its shadow does not cross the bevel, or a softer edge (normalBias/PCF radius — note PCF radius was banned r-early for erasing thin casters; test on this shot only) | P2 | OPEN | 0 |
| WO-R02 | M1 | critic A/B | Sea stacks: stepped strata at sat 0.68 read as yellow hatch bands (water-gap 940–1070, 170–330; hero-closeup 1000–1120, 230–300) | r34–35 lifted and saturated the bands; lower sat to ~0.45 and blur band edges by noise | P3 | OPEN | 0 (WO-L01 tactic count applies: 3, at limit — change tactic: texture instead of vertex paint) |
| WO-R03 | M1 | critic A/B | title-hero: candidate reads "thinner colour" (global sat 0.588 vs 0.647; jungle mass 0.722 vs 0.802) | grass darkening (r35) and crown depth darkening (r29) lowered mass saturation; check the grade's saturation push against dark greens | P3 | OPEN | 0 |
| WO-T01 | M1 | observation | `tools/packet.mjs` printed "?" for tri/draw counts | read `stats.triangles` / `stats.drawCalls` | P3 | CLOSED (M1, NOTE.md now lists counts) | 1 |

## Engine limits (logged, not scheduled)

- Shadow-map texel staircase on crate faces at portrait range (4096 map).
- Toon gradientMap samples red only (three r0.184): ramp colour is value
  only; shade hue comes from the hemisphere light.

# DELTA — ranked visual gaps against the bar (rebuild)

Output of the gauntlet loop in `docs/GA3-PLAN.md`. Append-only: new rounds go
on top, closed entries move to the round that closed them, nothing is deleted.
Judged blind against `refs/proposed/` by a fresh-context critic each round.

---
## Round 32 — 2026-09-05 (gold sand, petal blossoms, dressed islets, two composed palms)

Shot from `25cf4fe`, seed `0x5eed1e`, `shots/round32/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS. Tris 506k–581k.

What landed: sand texture rotated to gold, five-petal blossoms, islet
grass 110 / broadleaf 18 / debris 0.18, composed palms over the title
and water-gap cameras.

### Critic verdict (blind, fresh context, measured) — measured

A new top find, the first in four rounds that no earlier critic named:
SCALE. Grass at the hero's depth stands 0.40 of his height (form-3:
~0.19); fruit at his depth 0.31 (form-1: ~0.15); a foreground blade
crosses his muzzle in the portrait. "Every prop is 1.7–2× too large
for him, so the hero reads as a toy dropped into a garden." Second:
vegetation not grounded — sand at a tuft base L 0.579 vs open sand
0.542, the base BRIGHTER. Third: the ink outline is on the hero only
(near-black 4.6% of his box vs 0.4% crates, 0.0% fruit) — "a sticker
pasted on a different render." Moved/not-moved paragraph with the
previous critic's numbers: dark share unchanged within 0.004; water-gap
sky 28.9→17.9% (real, the crown); lit sand darker and more saturated
by a step.

Real finds, builder-confirmed:
1. Vegetation and fruit 1.7–2× too large for the hero
   (`critic32-title-grass-tufts`, `critic32-closeup-face`).
2. Nothing under the tufts and rosettes (`critic32-bc-tuft-base`).
3. Outline on the hero only — a style decision (rounds 4–6), now the
   only outlined object in frame. Held as a debt; not fixed here.
4. Grass blades single-value planes at portrait range.
5. "A pebble buried in the platform skirt" (`critic32-wg-buried-
   pebble`) — builder: a SHORE ROCK set into the skirt face at the
   islet lip, in shade. Half a find; the debris margin is raised
   anyway.
6. Islet tops bare (the round-32 dressing shows in the sheet; the
   near slab's outer third is still bare).
7. Lollipop trees on the jungle mass (ball-on-stick at 60 m).
8. Face rig: cheek spikes, flat crest fan, dot mouth.
9. Blossoms at 4×: a bar with a cross of petals — the new flowers,
   at range.
10. Sea stacks fade to sky value in the title (L 0.58 vs sky 0.67).

Discounted: item 5 half. Sky share "by a stricter classifier" —
different classifier, not comparable to the round-31 number; only the
water-gap drop is trusted.

Self-score: character 4 · props 6 · dressing 5 · vegetation 4 · light 6
· colour 6 · water 5 · backdrop 4 · motion 5 · composition 5 ·
performance 8.

### Fixing this round (became round 33)

Grass instance height 0.45–1.1 (was 0.5–1.6), footprint 0.55–1.2;
broadleaf 0.6–1.15 (was 0.7–1.5); fruit instance scale 0.8. A
`contactField` (instanced contact discs, no rng draws) under every
grass and broadleaf spot, r 0.30 / 0.42. Islet debris margin 0.7.
Not touched: outline policy, blade shading, lollipop trees, face,
sea-stack fog contrast.

---
## Round 31 — 2026-09-05 (a form term on the hero, a five-stop ramp, rounder pebbles, air between the crates)

Shot from `423f544`, seed `0x5eed1e`, `shots/round31/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS. Tris 503k–577k.

What landed: five-stop ramp, view-space form term on rim materials,
grass root colour 0.38, subdivided warm pebbles sunk 4 cm, title crates
spaced.

### Critic verdict (blind, fresh context, measured) — measured

Told the standing items, the critic found the frame-level cause behind
them: "the stills are open-sky dioramas; the refs are enclosed rooms."
Sky-blue share at 640 px: form-1 0.000, form-3 0.004, form-2 0.014,
light-4 0.000; the stills 15.7% (title), 28.5% (corridor), 28.9%
(water-gap). "No amount of grading will make up the dark share while a
third of the frame is a 0.68-luminance gradient." Second find with
numbers: lit sand hue 49° sat 0.63 vs the ref's 35° / 0.91, and colder
than the crates (27°) — the colour script inverted. Detail energy
(mean |Laplacian|) now inside the ref band in four of five stills; "the
flatness that remains is value and hue, not detail count."

Real finds, builder-confirmed:
1. Overhead enclosure missing in the three wide shots (numbers above).
2. Sand olive, not gold; colder than the crates.
3. Belly still a disc: 0.68–0.71 for 170 px then a 20 px drop to 0.46
   at the edge — the round-31 form term is the edge band, the middle
   has no turn (`critic31-belly-hands`).
4. Nose is a smear: the one head part with no outline and no
   highlight, 6 px blur (`critic31-face`).
5. Grass blades one tone each, hard hue jumps between neighbours; the
   0.38 root shows only in the clump cores (`critic31-grass-mid`).
6. Water-gap slab top ~20% of frame bare within 12 m; dressing stops
   120 px from the edge.
7. Blossoms read as pink mushrooms: spheres on a stick at 2–4 m
   (`critic31-ground-right`).
8. "Pebbles blue-grey, sitting on the surface" — builder crop: the
   round-31 pebbles are tan and sunk; the blue-grey shards are pebbles
   in SHADE, tinted by the hemisphere sky. Half a find.
9. Palm fronds one fill, no midrib shadow, no leaflet split.
10. Rim under-strength on the arm: rim 0.57 vs lit 0.70; the refs put
    the rim above the lit value.

Discounted: none contradicted; item 8 half.

Self-score: character 4 · props 5 · dressing 5 · vegetation 4 · light 4
· colour 4 · water 3 · backdrop 4 · motion 4 · composition 4 ·
performance 8.

### Fixing this round (became round 32)

Sand texture rotated to gold: base #e4bd74, blotches warmed, the cool
drift halved. Blossoms rebuilt as five cupped petals round a gold eye.
Islet dressing: grass 110 each (was 60), broadleaf 18, debris share
0.18. Two composed palms built LAST in buildBeach (so the seeded
stream ahead of them is unchanged): one over the title camera, one over
the water-gap camera. First placement put the water-gap trunk across
the foreground and over the hero (caught on the sheet); moved to 68°
off the view axis so only the crown hangs in — and its cast shadow now
lays a 4 m dark shape across the near slab. Sky share moved little
(title 16.7→15.8%, corridor 30.4→28.9%, water-gap 36.6→35.6%): a palm
crown is a thin lid. A real lid needs a canopy layer, not more palms.
Not touched: belly mid-turn, nose, blade gradient, frond midribs, rim
strength.

---
## Round 30 — 2026-09-05 (pools of canopy shade over the corridor, deeper skirt strata)

Shot from `0538ed2`, seed `0x5eed1e`, `shots/round30/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS. Layout identical
to round 29 (the mass layer runs its own generator).

What landed: canopy-mass layer in the dapple casters, skirt strata
relief 0.18 m and paint ±0.13.

### Critic verdict (blind, fresh context, measured) — measured

Told not to repeat the five standing items without a new number, the
critic went to the hero's SHADING and found the round's real gap: a
vertical profile down the belly runs L 0.713→0.675, a 0.04 turn across
a sphere; form-3's torso runs 0.11→0.33. The cheek under the muzzle is
brighter than the cheek top. "Every bit of form on this character
comes from the 6–10 px outline, not from light." New whole-frame
number: 2nd-percentile luminance 0.09–0.18 in the stills vs 0.015–0.067
in the refs. PRESENT list held everything from round 29 plus the eye
sclera, crate faces turning (front 0.355 vs sun-facing end 0.544),
canopy shade on the corridor sand, and the skirt strata ("present but
faint").

Real finds, builder-confirmed:
1. Hero form shading flat (numbers above; `critic30-hero-closeup-hero-
   belly-hands`). Builder root cause: in the portrait framing the key
   sits on the camera side, so N·L is ~1 over the whole visible belly
   and the ramp has nothing to turn. Second root cause, found while
   fixing: three's toon shader samples only the RED channel of the
   gradientMap (`gradientmap_pars_fragment.glsl.js`, checked on the
   r0.184 CDN source) — the "coloured ramp that tints the shade" of
   round 1 never tinted anything; the cool shade has always been the
   hemisphere light. The ramp's red values are all that ever mattered.
2. Black point lifted in every frame (p2 0.09–0.18 vs ≤0.067).
3. Pebbles are faceted 20-face chunks within a few metres of the
   camera, cool grey on warm sand (`critic30-hero-closeup-pebbles-right`).
4. Boots and hands undesigned: red capsules with no sole line or toe
   cap; fingers 3× the ref's size; chest tuft "broken glass".
5. Water has no specular life: 0.0% of near-water pixels above L 0.9
   vs 62.7% in light-3's comparable region.
6. The three title-frame crates butt edge to edge and read as one
   plank fence (`critic30-title-hero-crate-row`).
7. Grass root band L 0.555 vs tip 0.593: the 0.55 base vertex colour
   is swallowed by the lit ramp; clumps read only by cast shadow.
8. Sea-stack paint two-tone at framing distance (top L 0.50, base
   0.48) — the round-29 strata do not carry 60 m.
9. Face rig decals on a smooth head; eyes are the one match.
10. Sky two-band gradient with cut-out cloud pills.

Discounted: none contradicted. "Composition 4 — hero ≥15% of frame
height in the title" repeats the round-28 item; held as a debt.

Self-score: character 3 · props 5 · dressing 4 · vegetation 4 · light 3
· colour 5 · water 3 · backdrop 4 · motion 5 · composition 4 ·
performance 7.

### Fixing this round (became round 31)

Ramp goes to five stops with a mid-value terminator texel (red 158)
so the lit half has a gradient at all — no change on the belly
profile (0.716→0.674 top to bottom), which proved the key-angle root
cause. So: a view-space FORM term on every rim material (hero, fruit):
`diffuse *= 1 − 0.42·(1 − N·V)^1.6`, a core-shadow band inside the
rim whatever the key does. Belly profile now 0.687→0.636 across the
sphere with a visible dark band at the lower-left edge; still short
of the refs' 3× swing — the rest is the key angle, a later round.
Grass root colour 0.38 (was 0.55). Pebbles subdivided once, jitter
±22% (was ±45%), warmer, sunk 4 cm. Title crates spaced 1.8 m with
the middle one set back 0.25 m. Tris +12% (573k title-hero) from the
pebbles — inside the ceiling.
Not touched: boots/hands, water specular, face, sky.

---
## Round 29 — 2026-09-05 (a dark canopy interior, a lower floor, strata on the stacks)

Shot from `fa993b9`, seed `0x5eed1e`, `shots/round29/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS. Frame min L 0.041;
title-hero pixels below L 0.2: 13.7% (was 10.8%).

What landed: grade floor halved, crown carpet darkened by depth on the
flank (9×6 spheres, ±14% jitter), sea stacks painted after the flat
normals with stepped strata and noise-gated moss ledges, chest bib fur
gradient, shallows halo alpha 0.5.

### Critic verdict (blind, fresh context, measured) — measured

Whole-frame again, now with a 12 px blur before counting: refs put
25–43% of pixels below L 0.25 and 5–17% below 0.15; the stills 2.6–7.1%
and 0.0–0.6%. "The sun exists (crisp shadows, contact shadows, a
chromatic ramp), but there are no casters big enough to make a shape."
Scores rose on colour (6), dressing (5), water (5), backdrop (5),
motion (6), composition (6), performance 8 (counts supplied). Long
PRESENT list: chromatic shadow on sand with numbers (sat 0.30, B/R
0.69 in shade vs 0.39 in sun), contact shadows, outline contours,
crate relief incl. AO in the rail-post corner, TNT lettering and fuse
pot, three plant species, debris classes named (pebbles, shells, pink
flowers, mushrooms, twigs, a striped blue shell), depth-graded water,
three distance layers, mid-stride pose, eye glint.

Real finds, builder-confirmed:
1. No shadow MASS: the corridor sand is one lit plane with only
   blade-thin shadows on it (`critic29-beach-corridor-sand`).
2. Jungle mass still faceted polyhedra with hard facet edges
   (`critic29-title-hero-jungle`); the round-29 depth darkening reads
   as interior but the lumps are still lumps.
3. Hero surface "an inflated toy": no fur break on any silhouette
   edge, ears flat lozenges, cheek fins, chest tuft reads as detached
   shards on a blank cream sphere (L 0.68–0.88, no ramp step).
4. Platform undersides: a flat brown face, L spread 0.035 over
   100×40 px, one crack stroke (`critic29-water-gap-skirt`).
5. Sea stacks: symmetric vase silhouette, two-tone paint; the new
   strata bands do not read at framing distance.
6. Sand albedo flat within 12 m: one ochre plus a 3–4 px horizontal
   stripe (the wrap texture) (`critic29-hero-closeup-sandfg`).
7. Palm trunk cylinder + chevron decal, no ring relief.
8. Foam a milky sheet L 0.69 over 200×80 px, no wet-sand band, hard
   straight platform/water line.
9. Fruit a Lambert sphere with a leaf sprite, no stem dimple.
10. Clouds flat translucent discs, no lit top / shaded base.

Discounted: "the eye has no white" — `critic29-hero-closeup-head` shows
the sclera left of each iris; small at this angle, present. "Rim +0.03
L at the crown" — measured against sky at one column; on the ears the
same crop shows the band clearly. "hero-closeup hero dead-centre" — he
stands right of centre by design (round 23).

Self-score: character 4 · props 6 · dressing 5 · vegetation 4 · light 4
· colour 6 · water 5 · backdrop 5 · motion 6 · composition 6 ·
performance 8.

### Fixing this round (became round 30)

Dapple texture gets a canopy-MASS layer (7 clusters of 3.5–5.5 m
ellipses) so the corridor sheets cast pools of shade, not only leaf
dapple. Measured: pools now land on the sand in hero-closeup and
beach-corridor, but the whole-frame share below L 0.25 did not move
(hero-closeup 15.1→14.6%, beach-corridor 8.9→8.6%): shaded sand sits
at L 0.30–0.45, above the count, and its lit:shade ratio already
matches the refs (0.70 vs 0.74, round 27). The refs' dark quarter is
undergrowth interiors and occluded hollows, not sand — that is where
round 31 has to go (dark bases under grass clumps and broadleaf, the
jungle-mass interior). Lesson: the mass layer first pulled the world
RNG and rerolled every placement downstream (a grass tuft landed on the
hero's boots in hero-closeup, caught on the sheet); it now runs its own
generator so the layout matches round 29. Island skirts: strata relief
0.12→0.18 m, strata paint ±0.06→±0.13.
Not touched: hero fur, palm, foam, fruit, clouds.

---
## Round 28 — 2026-09-05 (grain-lit shade, a dark under-canopy, a capped tail)

Shot from `d8ce837`, seed `0x5eed1e`, `shots/round28/`. Gates: build
green, det green, 5/5 PASS. Crate shaded-face mean L 0.245 (was 0.12);
canopy p5 0.123 (was 0.17); frame min L 0.071.

What landed: crate wood as emissiveMap on the shaded faces, grade floor
lowered, dark ridge shell between crowns, tail base cap, sole plates
trimmed, TNT lid UVs remapped, shallows halo thinned.

### Critic verdict (blind, fresh context, measured) — measured

The most measured verdict yet, and the first to go whole-frame: a 16-bin
luminance histogram of every still against every ref. Refs put 21–36%
of pixels below L 0.20 and 3–8% below 0.0625; the stills put 2–11%
below 0.20 and **0.0% below 0.0625** — "the floor is the bottom of the
picture in every frame". Nothing from round 27's list was repeated as
absent; the PRESENT list carried crate AO, contact shadow, gloves, thumb,
eye glint, X-braces, bent blades, dapple, fruit not blown out, and the
damp-sand octave (called by name, hue-checked).

Real finds, builder-confirmed:
1. Jungle mass reads as faceted low-poly blobs with no dark interior
   (`critic28-jungle-facets`, hero-closeup 0,0 520×300: mean L 0.357,
   min 0.133). The round-28 dark shell is there but the crown carpet
   covers it; the crowns themselves had no depth term.
2. No deep shadow anywhere: the grade floor (linear 0.011 blue) clips
   at L ~0.07, so the bottom histogram bin is empty in all five stills.
3. Sea stacks: "a faceted convex hull in desaturated tan" with a green
   vertex-gradient cap (`critic28-seastack`). The sine strata never
   read as bands; the same silhouette clones at three sizes.
4. Hero chest is one flat cream ellipse (mean L 0.628) with three
   triangles pasted on; arms smooth tubes (`critic28-hero-chest`).
5. Face still assembled primitives: flat cheek triangles, capsule
   muzzle, hard-edged mask decal, no brow mass. Eye at ref quality.
6. Foam a milky sheet over ~35% of the water in water-gap; the cliff
   meets water on a 1-px light seam with no wet band.
7. Platform foundation un-modelled: one flat brown face, two crack
   strokes.
8. Pebbles are flat 4–6-vertex shards lighter than the sand, no contact
   shadow.
9. Palm trunk a cylinder with a chevron decal; fronds one plane.
10. title-hero composition: hero 14% of frame height, camera at eye
    level, 45% empty sand and sky.

Discounted: rim light "narrow, +0.22 L over 6 px" — sampled at one row
and called under-strength, not absent; noted, not a contradiction.
Performance UNMEASURED — the tri/draw counts are on the sheet, which
the critic was told to ignore. Shadow-map staircase seen and not ranked.

Self-score: character 4 · props 6 · dressing 4 · vegetation 4 · light 3
· colour 5 · water 3 · backdrop 4 · motion 5 · composition 4 ·
performance —.

### Fixing this round (became round 29)

Grade floor halved (0.0018,0.0033,0.0055): frame min L 0.041, and
0.26–0.99% of title-hero / hero-closeup below 0.0625 (was 0.00%).
Crown carpet: 9×6 spheres with ±14% jitter (was 7×5, ±20%), base
lightness scaled by depth on the flank (0.5 at the foot), underside
0.07 (was 0.18) — pixels below L 0.2 in title-hero 10.8→13.7%. Sea
stacks painted after the flat normals: four stepped strata bands, moss
on up-facing faces gated by a noise patch (gated on the normal alone it
rendered a checkerboard — fixed before the shot), overhangs 45% darker.
Chest bib: darkening toward the bib edge and gut plus a slanted streak
field; at portrait range the toon ramp swallows most of it — logged,
the chest wants geometry, not paint. Shallows halo alpha 0.6→0.5.
Not touched: face, foundation, pebbles, palm, composition.

---
## Round 27 — 2026-09-03 (X-braces, an elbow, soles, rocks below the rim)

Shot from `fa2cac9`, seed `0x5eed1e`, `shots/round27/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: bevelled X-braces, metal fuse pot, capped shore rocks,
varied glints, fruit row off the hero, elbows, soles, uneven crest,
tilted leaf fans.

### Critic verdict (blind, fresh context, measured) — measured

Props 6 with the X-braces listed PRESENT ("X-braces with cast
shadows, chamfered corner posts with caps"); performance 8; no pit,
no identical-dash, no fruit-in-silhouette call. The most quantitative
verdict yet: canopy p5/p95 0.17/0.61 vs the refs' 0.05/0.5; every
frame's min exactly 0.101 = the grade floor.

Real finds, builder-confirmed:
1. Shaded crate faces at the floor (L 0.12; lit 0.36; ref shaded
   side 0.46): an away-facing face inside a cast shadow gets hemi
   only. Sand in shadow is fine (0.44 vs 0.57–0.68 lit, ratio 0.7 —
   the ref's is 0.74).
2. Canopy has no dark interior: nothing in a frame falls below the
   floor, so the crowns have no dark band to sit against.
3. Rim now OVER-strength: head edge 0.49→0.94 over 24 px, "reads as
   bloom".
4. Sole plates project past the boot on three sides
   (`critic27-hero-closeup-soles`; builder crop `b27-soles` agrees).
5. Tail: the TubeGeometry's open base shows as "a flat orange
   hexagonal end cap" behind the arm.
6. A cream stripe across the TNT lid: the label band wrapping onto
   the top face through the box's default UVs.
7. Shallows band "neutral grey, L 0.61, 120–150 px, reads as a fog
   slab" — the widened halo of round 26 at 0.75 alpha.

Discounted: "sand p5–p95 0.50–0.60, dapple does not read" — the
mask is sand-HUE pixels, and shadowed sand shifts to olive (h62) and
drops out of the mask, so the measurement excludes exactly the
shadow it is looking for. "Grass blades straight, no base darkening"
— two-segment bent blades with a 0.55 base vertex colour since round
25; at crate-cluster range the bend is small. "Palm trunk zigzag
repeats at 35 px" — the wavyLine ring texture; logged.

Self-score: character 4 · props 6 · dressing 4 · vegetation 3 · light 4
· colour 5 · water 5 · backdrop 5 · motion 5 · composition 5 ·
performance 8.

### Fixing this round (became round 28)

Crate material gets the wood as an emissiveMap (0x66584a): a
grain-shaped lift on the shaded faces. Grade floor lowered
(0.0035,0.0065,0.011). Ridge base shell painted dark (L 0.06–0.16)
so the gaps between crowns read as under-canopy; crown skirts 0.18.
Rim 1.9 / power 3.8. Tail base capped. Sole as a squashed sphere in
the boot's footprint. TNT lid UVs on a plain red patch. Shallows halo
0.6, contact band 0.2.

---

## Round 26 — 2026-09-03 (terraced skirts, dressed islets, fur where there were pegs)

Shot from `d184242`, seed `0x5eed1e`, `shots/round26/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: flattened cheek tufts, tucked shoulder balls, thinner
outline at range, far ridges without the carpet, dressed islets,
broadleaf hero collapse, terraced strata, wider shallows, flush TNT,
pebbles with a top.

### Critic verdict (blind, fresh context, measured) — measured

Performance 8 (386k–444k tris, 237–321 draws). Four depth layers
listed PRESENT ("near dressing, hill+palms, sea stacks, mountain
haze"). No haze-blob call, no peg call, no leaf-through-foot call.
The dark wedge on the platform was traced by the critic itself to a
fern's cast shadow ("not a hole") — the calibration note works.

Real finds, builder-confirmed:
1. A shore rock rises through the second platform's rim and its
   unlit facet reads as a pit (`critic26-wg-pit`): rock size up to
   0.75 m from a base at WATER_Y+0.22 tops the walkable surface.
2. Crates "plank fences, not crates": no X-brace (the ref crate's
   signature), no chamfer read at 8 m.
3. Fuse pot "an unshaded dark lump".
4. Hero: "arms are single straight tubes with no elbow"; boots "red
   hemispheres, no sole"; crest "four identical red triangles".
5. Water glints "identical horizontal capsule dashes".
6. Crate-cluster: foreground fruit and grass sit in the hero's
   silhouette (fruit row at x=3, hero at x=3.2).
7. Shadow terminator on the crate face is a texel staircase
   (`critic26-hc-shadow-stair`): the 1.3 cm shadow texel at 3 m.
   Known limit — PCF radius and VSM banned, cascade at d=26 already
   loses shadows past 26 m from the hero. Logged, not fixed.

Discounted: "sand shadow hue goes warm, H=34°, rgb 147/72/43" — the
sampled rectangle (crate-cluster 560,490 120×40) is the crate's
shadowed BOTTOM RAIL, i.e. wood, not sand (builder crop
`b26-shadowsample`). "Jungle mass is a shaded mound with stickers" —
the leaf fans lay tangent to the surface; tilted this round.

Self-score: character 4 · props 4 · dressing 5 · vegetation 4 · light 5
· colour 5 · water 4 · backdrop 4 · motion 5 · composition 5 ·
performance 8.

### Fixing this round (became round 27)

X-braces on the four crate side faces (bevelled diagonals). Fuse pot
as a metal cap. Shore rock size capped at 0.42 m. Glints at varied
angle and length. Fruit row moved to x=4.3; scatter thinning eased
(0.5+mid·0.5); beach grass 300. Hero: upper arm + elbow group +
forearm bent forward, sole plates under the boots, uneven crest. Leaf
fans tilted 0.35–0.8 rad off the surface.

---

## Round 25 — 2026-09-03 (blades that bend, a blob that stays inside its crate, a rim above the body)

Shot from `a487414`, seed `0x5eed1e`, `shots/round25/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: 11-blade two-segment tufts with dark bases, rim 2.2,
stacked-crate blob inside its footprint, rounder crowns, denser leaf
shell, brighter ground bounce.

### Critic verdict (blind, fresh context, measured) — measured

Light transport 6 (rim "+0.34 L over 14 px at the belly edge",
shadow sat 0.59–0.63), colour 6, props 6, composition 6, motion 5
(first score: "blade lean varies per instance"). No fruit dots, no
black wedge, no sub-pixel line calls.

Real finds, builder-confirmed:
1. Cheek tufts read as "cylinder pegs with flat end caps"; shoulders
   "a second sphere sitting on the torso" (`c25x-hc-whisker`,
   `c25-hc-torso-rim`).
2. Water-gap foreground platform 75.5% bare sand (measured).
3. Pale blue-grey blobs in the haze between stack and horizon
   (`c25x-wg-skyblobs`): the far haze ridges' crown carpet through fog.
4. Outline 2–3 px on the 120 px distant hero — ears merge into it.
5. A broadleaf passes through the hero's foot (`c25x-hc-feet-ground`).
6. Skirt strata are paint on a flat plane, not relief.
7. Water at the sand edge in beach-corridor the same blue as at 40 m.
8. TNT sits back from the crate row with a gap (S 0.92 vs 1.0).
9. Pebbles show one flat top facet (sunk 4 cm, y-scale 0.55).

Discounted: "grass blades are straight isosceles triangles" — they
are two-segment bent blades since this round (crop `b25-grass`); at
crate-cluster range the bend is small. "Hard dark trapezoid on the
sand reads as a hole" — a crisp cast shadow from the shadow map, not
geometry. "Pale facet inside the tail" — the hip tuft cone through
the tail tube; real but 10 px, logged.

Self-score: character 4 · props 6 · dressing 5 · vegetation 5 · light 6
· colour 6 · water 4 · backdrop 5 · motion 5 · composition 6.

### Fixing this round (became round 26)

Cheek tufts flattened (z 0.4); shoulder balls 0.065 tucked in;
outline distance clamp /4, max 2.2. Far haze ridges skip the crown
carpet. Gap islets: grass 60 each, broadleaf 10 each, debris 11%.
Broadleaf gets the hero collapse. Skirt strata stepped 12 cm as
terraces. Shallows halo 0.7 (was 0.45), contact band alpha 0.3. TNT
S 0.98, seated in the row. Pebbles y-scale 0.7, sunk 2.5 cm.

---

## Round 24 — 2026-09-03 (crowns on the surface, strata on the skirt, shallows with grain)

Shot from `1dc34b4` + `2b4bcbd`, seed `0x5eed1e`, `shots/round24/`.
Gates: build green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: the mound carpet placed ON sampled ridge vertices (hill
L sd 0.018→0.057 — the first time the base shell is buried), sculpted
stacks, shaded clouds, skirt strata + waterline band + rubble, mottled
2048 shallows, fanned cheek cones, chest fringe, sunk pebbles, lower
hero-closeup camera. Builder-caught before the critic: a blade at
1.2 m drew a pale line across hero-closeup after the camera dropped —
lens collapse radius 0.9→1.5 m (24b).

### Critic verdict (blind, fresh context, measured) — measured

Colour script 6 ("saturated and coherent"), composition 6, backdrop 5
(up from 3–4: "three layers exist"), props 6. The hill is no longer
"one flat value"; the complaint moved to the crowns' polygonal
silhouette at 6×4 segments.

Real finds, builder-confirmed:
1. A black wedge on the crate stack (`z24-cc-cratetop-black`): the
   stacked-crate contact blob, widened to r 1.35 in round 22, lay past
   the lower crate's edge and read as an unlit object.
2. Dotted diagonal lines across the fruit and the hero's arm
   (`z24-hc-fruit-dots`): grass blade TIPS going sub-pixel in front of
   them — the blades were single triangles to a point.
3. Rim band measured at V 0.55 against a lit body of 0.65 on the arm:
   present, under the body value.
4. Grass tufts "sparse spike stars, ground shows through every tuft".

Discounted: "crushed blue-black on the shadowed crate wall" — the
crop (`c24-hc-crate`) shows dark maroon planks with the grain legible;
the rgb 29,30,37 sample is the recessed crevice at the floor. "Foam
quad edge at (765–793,600–610)" — a pale straight edge exists in
`z24-wg-floating`; not yet traced (collar ring or island ring end).
Logged, not fixed. "Skirt has one crack line only" — strata bands are
present at 6× (round-24 builder crop); low contrast, not absent.

Self-score: character 4 · props 6 · dressing 5 · vegetation 4 · light 5
· colour 6 · water 4 · backdrop 5 · motion — · composition 6.

### Fixing this round (became round 25)

Grass blades rebuilt: 11 per tuft, two segments with a bend, a 1.2 cm
tip, vertex-colour dark base (material white × instance × vertex).
Rim 1.6→2.2. Stacked-crate blob r 0.7 (inside the footprint). Hemi
ground 0xa4b9a0. TNT fuse pot lifted off near-black. Crowns 7×5 at
4.0/m; leaf shell density 0.4.

---

## Round 23 — 2026-09-03 (crates out of the multiply, grass parts for the hero, crowns down the slope)

Shot from `74cce4b`, seed `0x5eed1e`, `shots/round23/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: crate vertex colour out of the multiply trap (third
instance), bevelled beams, hemi 0.80, grass parting under the hero,
debris avoiding props, blended island-top normals, ridge shore foam,
crown-shaded mounds over the whole slope, pink blossoms.

### Critic verdict (blind, fresh context, measured) — measured

Closed: crate sides no longer a plateau (no call; the crate scored
6 — "the best-designed thing in frame"); no grass through boots; no
shell in a post; no sand seam; hill shoreline foam listed PRESENT.
Performance 8 (335–391k tris, 241–316 draws).

Real finds, builder-confirmed:
1. Hill mass still "one flat green value with flat leaf decals"
   (hero-closeup 40,100 300×100: L sd 0.014). The 2.6/m mounds left
   the base shell visible between crowns.
2. Platform faces "a single flat brown plane" with three stray crack
   strokes (`c23-water-cliff`): no strata, no waterline band, rubble
   too far out to read as a skirt.
3. A hard 6-sided cone pokes out of the cheek as "an orange prism"
   (`c23-art-cheek-wedge`).
4. Sea stacks "8-sided faceted lathes" at 10 radial segments.
5. Ground "polka dots": one-size ovals at 12–18 px, evenly spaced
   (`c23-corridor-ground`) — the round-22 speckle ellipses, 5–8 px on
   the tile, at 0.1–0.3 alpha.
6. Shallows band "an opaque flat sheet", L sd 0.006 (`c23-water-
   foam`): the 1024 depth canvas is 0.6 m/px and the band is ~8 px.
7. Cloud "two overlapping pale ellipses, hard edge, single flat value"
   (`c23-title-cloud`).
8. Pebbles float on the plane as faceted solids.

Discounted: "sand shadow shifts warmer, B/R 0.30 vs 0.69" — the
darkest sand-hue quintile is the DAMP-SAND albedo octave in full sun
(round-22 amplitude), not cast shadow; the cast-shadow cells measure
h62 (green-olive) against lit h40. Damp octave eased anyway.

Self-score: character 4 · props 6 · dressing 5 · vegetation 4 · light 5
· colour 5 · water 5 · backdrop 4 · motion — · composition 6 ·
performance 8.

### Fixing this round (became round 24)

Mound carpet 4.5/m of 36-tri crowns (the base shell is buried). Sea
stacks 16×8 with a cap overhang and deeper noise. Clouds: 14 of 5–9
smaller puffs, undersides to 0.62 blue-grey. Skirt strata bands and a
dark waterline band; rubble 0.7/m at 0.15–1.5 m from the base.
Speckle 1.5–5 px at half alpha. Dapple at two scales. Depth canvas
2048 with mottled shallows. Cheek tufts as three thin fanned cones;
chest fringe of five. Pebbles sunk 4 cm. Hero-closeup camera lowered
so the head sits against the crates.

---

## Round 22 — 2026-09-03 (fill for the shaded planks, a knee for the whites, leaflets at the tips)

Shot from `39cc5f2`, seed `0x5eed1e`, `shots/round22/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: hemi 0.70, highlight knee, 22 cm frond-tip leaflet,
flowers clear of broadleaf, round 5–8 px sand speckle, wider crate
contact, lighter rocks; the sand pale octave pulled back after it
printed polka dots.

### Critic verdict (blind, fresh context, measured) — measured

Closed: frond-tip hairline gone (no call), stem peg gone, speckle
rects gone (the remaining "hatch" is the ripple strokes at 8x).
Performance scored for the first time (7 — "293k–307k tris, 240–314
draws, 60 fps, inside the floors"). Composition 6, dressing 6.

Real finds, builder-confirmed:
1. Crate SIDE faces in shadow: L 0.107, sd 0.004, 100% in one bin —
   a flat navy plane, grain gone. Lit crate faces only L 0.31–0.34.
   Root cause (third instance of the multiply class): the crate vertex
   colour (L 0.55–0.66) MULTIPLIES the golden wood texture, so lit
   faces land at a third and shaded faces on the floor.
2. Grass blades pass through the hero's boots in hero-closeup and
   crate-cluster (`c22-boot-grass`, `c22-cc-feet`).
3. A shell cuts into a crate corner post (`c22-tnt-base`): the debris
   scatter had no avoid list.
4. A straight lighting seam across the sand (`c22-sand-stretch`,
   contrast-stretched): the island top's forced-up normals switched
   hard at edge 0.9.
5. The hill meets the sea on a hard diagonal with no foam
   (`c22-title-shore`); only the islands had rings.
6. Hill mass "one smooth dome with flat 2-D leaf decals": the leaf
   shell reads as clip-art tangent to the dome, no under-canopy
   shadow, no overlapping crowns; hill sd 0.056–0.072.
7. Colour: full-frame hue 81–118 in every still, no accent but the
   fruit; hill base h92, the same hue as the palms.

Discounted: "no shoreline band anywhere" (islands have rings — the
claim was correct only for the hills, logged as 5). "Black gap where
the post does not meet the rail" — the post's own shadow crevice.

Self-score: character 4 · props 5 · dressing 6 · vegetation 5 · light 5
· colour 5 · water 5 · backdrop 3 · motion UNMEASURED · composition 6
· performance 7.

### Fixing this round (became round 23)

Crate vertex colour L 0.72–0.82 (frame 0.52), beams bevelled
(RoundedBoxGeometry, three addons via the import map). Hemi 0.80,
ground bounce lifted to 0x93b09a. Grass flattens within 0.6 m of the
hero (`uHero`, fed from main.js through world.update(t, hero.pos)).
Debris scatter takes the prop avoid list. Island-top normals blend
over edge 0.82–0.97 instead of switching. Ridge shore foam rings built
from the sphere equator row (`ridgeFoam`). Mounds shaded as crowns
(lit cap, dark skirt, cooler hue below), less buried; leaf shell
density 0.42→0.28; ridge hue drifts blue-green toward the base. One
blossom in four pink-violet. Sand texture dark blotches halved.

---

## Round 21 — 2026-09-03 (leaves on the hills, dapple on the sand, a line that holds its width)

Shot from `1e517f4`, seed `0x5eed1e`, `shots/round21/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: leaf shell on the near flanks, trees standing on the
sampled ridge surface, canopy dapple casters, exposure 1.0, shader-
pushed distance-scaled outline, fruit rim, louder sand macro, shallower
lip undercut, collars clear of the rocks, crate-cluster restaged.

### Critic verdict (blind, fresh context, measured) — measured

Closed: dapple "reads as a canopy, not as noise"; frond midrib and wind
lean PRESENT; five fingers, glint, contact shadow PRESENT; rim
"present, ~3–4 px, peaks L 0.71–0.81" (row-sampled). Scores: props 6,
dressing 6, water 6, composition 6 — four rows at 6 for the first time.

Real finds, builder-confirmed:
1. Shaded faces land on a PLATEAU at L≈0.10 (hero-closeup crate wall
   760,260 220×260: mean L 0.231, 62% of pixels below 0.13 — builder
   re-measured). Mechanism: MeshToon takes the shadow factor inside the
   direct term, so a cast-shadow face gets hemi only, and hemi 0.48 ×
   albedo/π lands the wall AND its grain lines under the floor.
2. Nothing reaches white: max L 0.85–0.91 per still, 0.00–0.02% of
   pixels above 0.85 (builder re-measured: 0.883 / 0.889 / 0.850).
3. Dashed hairline trailing off frond tips against the sky
   (`critic21-th-hairline`): the 4 cm tip quad goes sub-pixel at
   treeline range.
4. A flower stem stands as a bare dark peg through a broadleaf whorl
   (`critic21-hc-fern-left`): the scatter did not avoid across species.
5. Sand speckle: axis-aligned 3–4 px rects (`fillRect`) at portrait
   range — under the bar's ~5-texel floor.
6. Shore rocks read as dark brown wedges at the sand line
   (`critic21-bc-shore-notch`).

Discounted: "stray outline stroke across the belly" — the arm's hull
contour where the arm overlaps the belly, i.e. the outline doing its
job. "Pebbles are blue faceted crystals" — pebbles are warm-hued
(HSL 0.05–0.13); the blue is the cool shadow tint on them, which is
pillar B working. "Crate base has no contact AO" — the contact blob is
there (r 1.0); widened anyway.

Pillar-B note: `compare --pillarb` was re-run across rounds 17–22. Its
round-17 "shadow" sample (rgb 76,47,14, sat 0.90) was the hero's
shadowed FUR, not sand — the tool takes the darkest 20% of the
dominant hue and orange fur shares the sand's hue. On sand (rounds
20–22) it reads sat 0.60–0.62, cool shift +0.004…+0.066: both floors
pass, thinly. A 6×3 cell grid on hero-closeup sand: lit h40 s0.63
v0.70, cast shadow h62 s0.56 v0.61 — the shift is toward green (teal
hemi × orange albedo), not blue. Passing; logged so the calibration ¶
stops quoting the fur number.

Self-score: character 4 · props 6 · dressing 6 · vegetation 4 · light 4
· colour 5 · water 6 · backdrop 4 · motion UNMEASURED · composition 6.

### Fixing this round (became round 22)

Hemi 0.48→0.70 (wall region: 62%→39% of pixels below L 0.13, grain
lines back on the shaded face). Highlight knee in the grade
(`c*=1+0.24*smoothstep(0.58,0.92,l)`). Frond tip leaflet 4→22 cm wide.
Flowers avoid broadleaf spots (r 0.75). Sand speckle: 5–8 px ellipses,
700. Crate contact blob r 1.0→1.35. Shore rocks lighter. The sand pale
octave went to 1.6× amplitude and printed POLKA DOTS (0.45/m noise on
0.77 m vertices) — pulled back to 0.9 the same round, crop-verified.

---

## Round 20 — 2026-09-03 (no blade at the lens, no black anywhere, hills back to smooth)

Shot from `216a1f4`, seed `0x5eed1e`, `shots/round20/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: grass collapses at the lens, anisotropy 16, ridges smooth
with a denser mound layer, a soft teal black floor in the grade.

### Critic verdict (blind, fresh context, crop-verified, measured) — measured

The most quantitative verdict yet. Closed: "no crushed black anywhere
— 0.00% of pixels under L 0.05 in all five stills" (the floor works);
no hairline; rim "present and strong — luminance 0.48→0.82 over ~8 px"
(row-sampled); five fingers, glint, contact shadow, tail all PRESENT.

Real finds, builder-confirmed:
1. Whole-frame mean L 0.46–0.56 vs 0.21–0.45 in the refs; luminance
   sd 0.14–0.17 vs 0.18–0.30. The build is high-key and flat: one sun,
   an evenly lit sand plane, no dappling.
2. Background-tree fronds pierce the hill skin (`c20-bc-frondhill`):
   the second-rank trees were buried at a guessed height.
3. Outline breaks into a black/white checker on the distant hero
   (`c20-wg-legs`, 10x): the fixed 1.1 cm hull goes sub-pixel at 40 px
   character height.
4. The foam collar lay as a grey strip across the rock face
   (`c20-wg-foamrock`): inner radius inside the rock's widest scale.
5. The gap-platform crevice, now teal-dark instead of black, still
   reads as a hole (`c20-wg-blackwedge`, min L 0.10 = the floor).
6. Sand macro at ~3% luminance: present, unreadable (`c20-cc-sandcells`
   — "not a texel-cell artifact, I checked").
7. Fruit still names SphereGeometry at 5x (`c20-th-fruitseam`): lobes
   read only at the terminator; no edge light.
8. Crate-cluster: the hero covers the TNT label.

Biggest gap per the critic: the mid-distance mass — "a smooth,
untextured green hill with lollipop tree blobs" in four of five stills.

Discounted: "stair-stepped shadow terminator" — the 1.3 cm shadow texel
at 3 m is 3–4 px; PCF-radius and VSM are banned (pipeline note), no
cheaper fix exists this round. "Palms are sawtooth ribbons with no
midrib depth at corridor distance" — midrib present (round 17 crop).

Self-score: character 4 · props 5 · dressing 5 · vegetation 3 · light 4
· colour 4 · water 5 · backdrop 4 · motion UNMEASURED · composition 5.

### Fixing this round (became round 21)

Leaf shell: ~2000 instanced frond fans standing on sampled ridge
vertices of the four near flanks (`leafShell` in backdrop.js; ridges
now built first and expose surface samples). Second-rank trees stand
on the sampled surface (`ridgeHeightAt`). Canopy DAPPLE: two invisible
alpha-tested sheets up-sun of the corridor that only cast
(`dappleCasters`, `dappleTexture`). Exposure 1.12→1.0 (mean L
0.46–0.56 → 0.46–0.53 in the shots; sd unchanged — the dapple adds
the local contrast). Outline hull pushed in the vertex shader, scaled
with view distance past 3 m so the line holds on screen. Fruit gets a
warm fresnel rim. Sand macro amplitudes ~3×. Lip undercut 0.45→0.28.
Collar inner radius 1.15 s→1.75 s. Crate-cluster hero moved off the
camera→TNT line.

---

## Round 19 — 2026-09-03 (frames that don't cast, leaves that fold, an eye that's wet)

Shot from `0719b39`, seed `0x5eed1e`, `shots/round19/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: crate frame split off as a non-casting mesh (sawtooth
gone), folded midrib broadleaf, eye glint, dry shore rocks with foam
collars, jungle ridges flat-shaded (an experiment — see below).

### Critic verdict (blind, fresh context, crop-verified) — measured

Closed from round 18: no sawtooth call, no "raw triangles" call on the
broadleaf, eye glint listed PRESENT, rim listed PRESENT ("under-
strength, not absent" — the calibration note worked), hands PRESENT.

Three ARTIFACT finds, all real:
1. A hairline yellow-green line across the whole hero-closeup frame
   (`critic19-closeup-ground`, `b19-line-origin`): a grass blade
   edge-on at the lens. The layout re-rolled this round and put a tuft
   at the camera.
2. A pure-BLACK wedge in the crevice between a gap platform's skirt
   and a shore rock (`critic19-platform-under`, measured rgb sum 5,
   307 px). Builder probe: magenta clear colour showed 0 magenta px —
   a rendered surface, not a hole. Ambient-only surfaces (undersides,
   crevices) × mid-dark albedo land below the grade's toe. A black
   mound sliver on the title-hero hill is the same failure.
3. Fine horizontal striping on grazing-angle sand (`critic19-water-
   nearedge`). Present with shadows and post OFF (?minfx probe), so it
   is texture sampling, not lighting. Anisotropy was 4.

The flat-shaded ridge experiment FAILED: "a visibly triangulated
low-poly mesh with flat-shaded facets" (`critic19-title-hill`). A 3 m
facet is terrain, not canopy. Reverted.

Discounted: "hands have no thumb offset" (the thumb is the splayed
digit in `critic19-hero-hands`); "no contact AO under the feet" (the
hero contact blob is present, r=0.68, since round 9); sea-stack and
title-composition notes are template repeats already logged.

Self-score: character 3 · props 4 · dressing 5 · vegetation 4 · light 4
· colour 5 · water 4 · backdrop 3 · motion 4 · composition 3.

### Fixing this round (became round 20)

Grass blades within 0.9 m of the camera collapse to their root
(vertex shader, `cameraPosition`). Texture anisotropy 4→16. Ridges
back to smooth normals; the canopy relief now comes from a mound layer
at twice the density and half the size (r 1.5–3.2, 7×5), jittered
along the ridge. Grade gains a soft BLACK FLOOR — `sqrt(c²+f²)` with
a teal f, unchanged above ~0.03 — after which no still has a pixel
below rgb sum 81 (was 5). Pipeline shadow bias untouched.

---

## Round 18 — 2026-09-03 (fingers, a wider rim, canopies in clusters, rocks at the waterline)

Shot from `cfc7c6e`, seed `0x5eed1e`, `shots/round18/`. Gates: build
green, det green (pair in 2 boots, max 0), 5/5 PASS.

What landed: capsule fingers on the gloves, rim 1.6 / exponent 3.4,
three-lump background canopies, shore boulders on every island, two
additive glint sheets on the sea.

### Critic verdict (blind, fresh context, crop-verified) — measured

Hands closed: the critic lists "gloved hands with four modelled
fingers and a cuff" under PRESENT. Canopies no longer "a pentagon on
a stick". Rocks and skirt noted present ("a modelled skirt under the
play surface, not a floating slab"). Water: depth grade, foam band and
flow streaks all present.

Three real finds, all crop-confirmed by the builder:
1. Crate top rails cast a SERRATED SAWTOOTH onto the panel behind them
   (`critic18-crate-acne`). Builder traced it: a ?minfx render (no
   shadows) has no strip at all, so it is the rail's shadow boundary
   aliasing on a vertical receiver 3 cm behind the caster. Bias 0 and
   normalBias 0.05 changed nothing; PCF-radius and VSM are banned.
2. Broad-leaf plants are raw flat triangles — no fold, rib or curl
   (`critic18-crate-fgplants`). Confirmed at 3x.
3. The eye has no wet highlight (`critic18-hero-head`). Confirmed.

Discounted: "rim is a faint 1-px fringe" — `critic18-hero-rim` shows a
clear pale band inside the outline on ear and cheek; present. "Grass
blades stand straight, no wind lean" — the grass shader carries a
static +0.12 lean bias plus position-phased sway that is non-zero at
t=0; blades lean in every still. "Sand speckle is square blotches at
texel scale" — `critic18-beach-sand` shows soft ovals, no rectangles.
"Hill mass one smooth blob" — true in the render, but the ±0.35 m
canopy octave IS in the mesh; smooth normals average it away (the
sea-stack lesson from round 17, second instance).

Self-score: character 4 · props 5 · dressing 5 · vegetation 4 · light 5
· colour 4 · water 5 · backdrop 4 · motion 3 · composition 5.

### Fixing this round (became round 19)

Crate split into a casting core and a NON-casting frame (`splitCaster`
in props.js): no rail shadow boundary, no sawtooth; the baked crevice
AO carries the under-rail dark. Broadleaf rebuilt as a folded midrib
leaf with a V-fold, arch and tip droop, vertex-colour rib mask
(`leafGeom` in flora.js). Eye glint dot (unlit white sphere). Shore
rocks lightened (dry above the tide line) and given foam collars.
Jungle ridges FLAT-shaded so the canopy octave catches its own light.
Pipeline bias left at the round-9 values — it was not the cause.

---

## Round 17 — 2026-09-03 (hewn rock, capped knees, a corridor worth running down)

Shot from `068c507`, seed `0x5eed1e`, `shots/round17/`. Gates: build
green, det green (pair in N boots, max 0), 5/5 PASS.

What landed: sea stacks flat-shaded (the carving finally reads), crate
beam UVs shrunk (sawtooth strip gone), knee cap sphere, corridor
restaged off-axis with the hero mid-run.

### Critic verdict (blind, fresh context, crop-verified) — measured

The three round-16 fixes all landed: no sea-stack "lathe" call for the
first time in four rounds, no beam sawtooth, no amputated knee. The
verdict moved to the hero as the single biggest gap: "a stack of smooth
unbroken primitives" — hands read as FOUR STACKED BALLS at 3x (crop
`c17-hero-torso` — confirmed by the builder, the knuckle spheres sat
inside the palm sphere so the outline had no gap to run through).

Crop-verified and confirmed by the builder: hill trees are "one pentagon
on a stick" (`c17-title-hill-tree` — one crown sphere at 8×6 segments IS
a pentagon at that distance); the gap platforms meet the water as "a
flat top plus one vertical band in darker brown, a hard corner" — the
banned bare-slab outcome (`c17-water-shore`: the carved skirt shows only
~0.6 m of freeboard and shades to one dark band); no specular anywhere
on the water (`c17-water-far`).

Discounted: "no midrib on the fronds" — `c17-beach-hill` shows the dark
midrib stripe on the near frond. "No rim light on the hero" (FOURTH
verdict running) — builder edge crops `b17-ear-edge`/`b17-belly-edge`
show a faint pale band inside the outline: present, under-legible. At
exponent 4.5 the band is 2–3 px and the hull outline covers half of it.
Counted as "under-strength", not absent.

Self-score: character 3 · props 4 · dressing 4 · vegetation 3 · light 4
· colour 4 · water 4 · backdrop 3 · motion UNMEASURED · composition 5.
(Colour 6→4 and character 4→3 with a new critic — template drift, both
scores are in the noise; the mechanism claims are what got acted on.)

Found present (critic's own list): outline, contact shadow, saturated
cool shadow, ear/iris/brow/muzzle/crest/cuffs/tail, foam + shoreline
band, ripple flow, four debris classes, per-instance grass hue, crate
relief + nail heads + under-lip, coconuts, three distance layers, fog
grading the stacks, mid-stride pose reads as a run.

### Fixing this round (became round 18)

Hands rebuilt: palm + three capsule FINGERS standing off the palm + a
thumb, so the hull pass draws a dark line between each digit. Rim
1.1→1.6, exponent 4.5→3.4 (`rim.power` option in toonMat). Background
tree crowns are now a three-lump cluster (main + two shoulder lumps,
each its own lightness). Shore boulders: half-sunk flat-shaded rocks
along every island's waterline (`shoreRocks` in masses.js) — they
break the slab corner and root the platforms. Water sun glints: two
sparse additive dash sheets on crossing headings, opacity breathing on
separate beats (materials.js `glintTexture`, water.js). Note: the
boulders consume seeded rand() calls before the scatter, so every
downstream placement re-rolled this round — a layout change, not a bug.

---


## Round 16 — 2026-09-01 (twelve rounds of clones were one multiply)

Shot from `ab0cdf9`, seed `0x5eed1e`, `shots/round16/`. Gates: build
green, det green, 5/5 PASS.

What landed: grass/broadleaf materials WHITE (the multiply bug — the
per-instance hue spread renders for the first time since round 2),
shadow map 4096 (penumbra checker gone), title camera re-aimed.

### Critic verdict (blind, fresh context, crop-verified) — measured

The vegetation-clone complaint is GONE — the fix read; the veg row's
complaint legitimately shifted to blade SHAPE. Scores keep climbing:
motion 3→4, water 5, colour 6, composition 5. The critic's summary is
the loop's most honest yet: "passes its measured floors — the
distance to the refs is now almost entirely surface language:
texture, fur, strata, rim light."

New, crop-verified: the crate top beams carry a dark SAWTOOTH strip —
traced to the full 0–1 UV mapping compressing the wood texture's
plank-border strokes across each thin beam face. Mid-stride, the
raised knee shows the pant cylinder's flat cap and the leg reads
amputated. Sea stacks still read as smooth lathe primitives (third
verdict) — the carving is strong but smooth normals erase it.

Self-score: character 4 · props 5 · dressing 4 · vegetation 3 · light 4
· colour 6 · water 5 · backdrop 3 · motion 4 · composition 5.

### Fixing this round (became round 17)

Beam UVs shrunk to a plain patch (sawtooth gone). Knee cap sphere.
Sea stacks FLAT-shaded — normals recomputed after unsharing vertices,
so the carve reads as hewn facets instead of polished lathe. Corridor
restaged: camera low and off-axis, hero captured mid-run down the
corridor (second framing with a motion cue).

---

## Round 15 — 2026-09-01 (relief for the membrane, fur for the vinyl)

Shot from `1f936e6`, seed `0x5eed1e`, `shots/round15/`. Gates: build
green, det green, 5/5 PASS.

What landed: canopy-scale ridge surface displacement, hero dorsal fur
gradient, scalloped foam width, sand speckle rebuilt (fewer, larger,
fainter).

### Critic verdict (blind, fresh context, crop-verified) — measured

Most disciplined verdict yet — crop-confirmed gloves, contact shadows,
foam and flow before writing. First score RISES in nine rounds:
character 3→4, motion 2→3; dressing 5, composition 5.

Two claims triggered root-cause finds. "Vegetation is single-hue —
darker faces are shading, not hue": TRUE, and the cause is the same
multiply bug class as the round-7 torso — instance colors MULTIPLY
the material color, and the grass/broadleaf materials were saturated
greens, so twelve rounds of "loud per-instance hue spread" never
rendered: every hue was filtered back toward green. "Ordered dither
in sand shadow gradients" (third report): finally traced to the
2048 shadow map — ~2.5 cm texels print a checkered step pattern into
every penumbra; it was never the texture speckle.

Self-score: character 4 · props 5 · dressing 5 · vegetation 3 · light 4
· colour 5 · water 4 · backdrop 4 · motion 3 · composition 5.

### Fixing this round (became round 16)

Grass and broadleaf materials WHITE (the instance HSL values are now
the actual blade colors — the corridor finally reads as mixed ground
cover). Shadow map 2048→4096 with the focusSun texel snap updated to
match. Title camera re-aimed toward a thirds placement.

---

## Round 14 — 2026-09-01 (mid-stride, blossoms, midribs)

Shot from (this commit), seed `0x5eed1e`, `shots/round14/`. Gates:
build green, det green, 5/5 PASS — and the ground framings crossed
the 220k-tris floor for the first time (216.9k–239.9k).

What landed, against the standing round-13 list: **motion** — framings
gain an optional mid-stride capture weight (player[5]); title-hero now
catches the hero mid-run (split legs, counterswing, forward lean),
with the pose pinned against settle frames and cleared by real input.
**Character** — the mouth gains an open grin corner (the hairline arc
read as "a crease with no interior"), hip fur tufts break the widest
band of the silhouette. **Vegetation** — beach blossoms, a third
ground species in coral/cream/gold riding instanceColor; frond midribs
darken the rib line so palms stop reading as flat planes. **Backdrop**
— a third paint octave on the ridges, sampleable since the 48×30 mesh.

### Critic verdict (blind, fresh context, crop-verified) — measured

The hardened calibration paragraph (crop before claiming absence)
worked: this critic crop-CONFIRMED fruit lobes, glove fingers and the
hero contact shadow instead of claiming them missing. Verdict: large
single-value masses still dominate frame area (jungle hill, stacks);
hero body reads single-tone "blow-molded plastic"; foam an airbrushed
ribbon with no scallops; sand carries a woven repeat.

Discounted against the pixels: "hero in a symmetric A-pose in all
five shots" — title-hero is unmistakably mid-stride in the official
still. "Fruit on a bare peg" traced to a beach blossom reading as a
pin at distance (acceptable). "Crate shadow faces crush toward black"
re-templated (measured mid-brown, round 9).

Self-score: character 3 · props 5 · dressing 4 · vegetation 3 · light 3
· colour 5 · water 3 · backdrop 3 · motion 2 · composition 4.

### Fixing this round (became round 15)

Ridge SURFACE gains canopy-scale displacement (~2 m lumps at ±0.35 m
— six verdicts of "smooth green membrane" were fought with paint; the
silhouette needed the relief). Hero torso gains a dorsal-to-flank fur
gradient under the stripe/belly/shorts paint. Foam band width
scalloped along the perimeter. Sand speckle: fewer, larger, fainter —
the 2–3 px grains at 1700/tile were what the mip chain wove into the
"halftone/mat" pattern three critics reported.

---

## Round 13 — 2026-08-31 (the hero gets his hands back)

Shot from `cfd96fc`, seed `0x5eed1e`, `shots/round13/`. Gates: build
green, det green, 5/5 PASS.

What landed: arms lengthened 0.24→0.32 + near-vertical idle hang (the
gloves finally silhouette beside the shorts — took three pose
iterations), snug pant cuffs, de-insected treeline, title-hero panned
off the hill edge.

### Critic verdict (blind, fresh context, crop-verified) — measured

First verdict in six rounds with NO hands complaint — the fix read.
Biggest gap: organic surfaces still one value (hill membrane, flat
frond planes, plastic hero skin) vs the refs' painted density; hero
close range needs an open-mouth muzzle, fur-silhouette cards, joined
limb geometry.

Discounted against this build's own crops: "no contact shadow under
the hero" (blob + cast shadow present), "no rim light in any framing"
(fresnel at 1.1 visibly rims), "every tuft bolt upright" (breeze bias
verified round 9), "no foam contact" (rings hug every bank). Critics
consistently re-template these rows regardless of state; the loop's
verified-claims discipline is what keeps the signal usable.

Self-score: character 3 · props 5 · dressing 4 · vegetation 3 · light 4
· colour 6 · water 4 · backdrop 3 · motion 2 · composition 4.

### Standing top items for round 14

1 hero sculpt at portrait range (mouth interior, fur cards, joined
limbs). 2 painted density on organics (canopy texture on hill faces,
frond midribs). 3 vegetation species + per-instance read. 4 motion
legibility (the row has sat at 2 for five rounds; consider a
mid-stride capture pose per framing). 5 stray artifacts: dark polygon
spike on the title-hero hill face, thin line artifacts on water-gap
banks.

---

## Round 12 — 2026-08-31 (the hill was starving for vertices)

Shot from `4a32c60`, seed `0x5eed1e`, `shots/round12/`. Gates: build
green, det green, 5/5 PASS.

What landed: ridge mesh 48×30 (the five-round "flat hill" verdict was
a vertex-sampling failure — the octaves finally read), fresnel rim
reshaped (exponent 4.5, strength 1.1, proven live by a strength-5
flood test), mound noise eased, per-crate hue drift.

### Critic verdict (blind, fresh context, crop-verified) — measured

Mixed quality. STALE/contradicted: "hands are bare orange spheres, no
gloves" (gloves+thumb exist since round 9 — but see below), "TNT has
no fuse" (it does), "fruit are smooth spheres" (lobes verified at crop
in earlier rounds). But three NEW claims verified TRUE in my own
crops, all one root cause: in the idle pose the arms tipped back, so
the cream gloves hid exactly behind the torso's widest band — the
shoulder balls READ as stub orange hands from the front, and the real
gloves peeked out between the legs as "an unexplained cluster of cream
blobs". Also true: the pant cuffs' loose top ring read as looking down
into an open boot; treeline bgTrees read as INSECTS (long splayed
blade fans on thin leaning trunks).

Self-score: character 3 · props 5 · dressing 4 · vegetation 4 · light 5
· colour 6 · water 5 · backdrop 4 · motion 2 · composition 4.
(Colour at 6 — first row past 5 in the loop.)

### Fixing this round (became round 13)

Arms LENGTHENED (0.24→0.32 capsule — at the old length no pose could
clear the belly) and the idle hang brought near vertical, so the
gloves finally silhouette beside the blue shorts; took three pose
iterations (behind-the-belly → fig leaf → wide → vertical). Pant top
snug on the leg. bgTree blades short and few, trunks thicker.
Title-hero panned right so the hero clears the hill edge.

---

## Round 11 — 2026-08-31 (a mouth, a breeze, and an organic shoreline)

Shot from `1aa741e`, seed `0x5eed1e`, `shots/round11/`. Gates: build
green, det green, 5/5 PASS.

What landed: mouth arc, crest up the crown, rim 0.5, 30-segment torso,
pant cuffs, asymmetric idle, scalloped shallows, fbm clouds, doubled
stack strata, windswept palm crowns, framing facing yaw (title-hero
poses 3/4-front).

### Critic verdict (blind, fresh context, crop-verified) — measured

Same #1 for the fifth round: the NEAR hill one gradient. This time the
root cause fell out of measurement: the ridge sphere was 22×14
segments scaled to ~36 m — vertices 2–3 m apart — so both vcolor
octaves interpolated away across giant triangles. A sampling failure,
not a painting one; every earlier "paint it louder" fix was fighting
mesh resolution.

Also measured: "no rim light" (third verdict running) — aliveness test
at strength 5 FLOODED the hero, so the injection works; 0.32 and 0.5
simply died under AgX + the grade. Fixed by shape, not just gain:
exponent 3→4.5 narrows the band to the silhouette, strength 1.1.
Stale/discounted: "TNT has no fuse" (it does — occluded), "grass
perfectly vertical" (breeze lean landed round 9), "nose is a blurry
decal" (it is a mesh).

Self-score: character 3 · props 5 · dressing 4 · vegetation 3 · light 4
· colour 5 · water 4 · backdrop 4 · motion 2 · composition 5.

### Fixing this round (became round 12)

Ridge mesh 48×30 (the octaves finally sample), fresnel rim reshaped,
mound noise eased (rim slivers read as floating leaf shards), per-crate
hue drift.

---

## Round 10 — 2026-08-31 (the channel becomes water)

Shot from `1a49f58`, seed `0x5eed1e`, `shots/round10/`. Gates: build
green, det green, 5/5 PASS.

What landed: shallows halo 9→5 m + thinned inner band (the milky ice
shelf), anisotropic ripple stretch, blue shorts band, spine fur fins,
fruit row off the centreline, corridor camera off-axis.

### Critic verdict (blind, fresh context, crop-verified) — measured

First critic given crop tooling; most claims survived. **Biggest: flat
surfaces + character fidelity (scored 2)** — crop-verified: no mouth
at all, crest shards intersecting the brow, belly shading creases,
rim compressed below legibility by the grade (0.32 was not enough
through the S-curve), shorts reading as briefs. Water: a hard straight
diagonal "shelf edge" where the shallows rounded-rect meets deep water
— verified in the round-10 channel. Clouds crumpled into faceted paper
(per-vertex hash noise). Stacks' round-9 strata too subtle to read.
Discounted: "no rim anywhere" as absolute (it exists, under-strength),
"outline width doesn't scale with distance" (inverted hull is
world-space — it scales), "fruit is a smooth sphere" (lobes present at
crop scale in most orientations).

Self-score: character 2 · props 4 · dressing 4 · vegetation 3 · light 3
· colour 5 · water 4 · backdrop 3 · motion 2 · composition 4.

### Fixing this round (became round 11)

Hero: mouth arc under the muzzle, crest tilted up the crown, rim
0.32→0.5, torso lathe 30 segments, pant-leg cuffs (sized twice —
first pass read as blue wellies), shorts to y<0.20, idle pose made
asymmetric (turned head, unequal arms, eased heel). Water: shallows
edge SCALLOPED with perimeter circles (kills the shelf-edge seam).
Clouds: fbm displacement instead of per-vertex hash. Stacks: strata
doubled + hue drift. Palms: crowns built windswept in world space
(downwind fronds longer, heavier). Framings: player spec gains an
optional 4th element (facing yaw); title-hero poses the hero 3/4-front
into the frame. Mound spread ±0.75 tried and measured floating —
held at ±0.6.

---

## Round 9 — 2026-08-31 (the sun gets its shadows back)

Shot from `6154d99`, seed `0x5eed1e`, `shots/round9/`. Gates: build
green, det green, 5/5 PASS.

What landed: PCFSoft revert (VSM erased thin-caster shadows), glove
thumb + proud knuckles, torso lathe 24 segments, fruit lobes 0.09,
stack strata, wider mound spread, grass breeze lean, title-hero
recomposed.

### Critic verdict (blind, fresh context) — and what measurement said

Led with **"zero-texture flat materials — no-noise albedo anywhere"**.
Measured FALSE as stated: the sand carries a two-scale canvas texture
plus two world-space vcolor octaves, visible in any crop; "no contact
shadow under the hero in title-hero" is contradicted by the long cast
shadow plus blob in those pixels; "hundreds of tufts perfectly
vertical" missed the breeze lean that landed this round; "crate shadow
faces near-black" measured mid-brown. This verdict's headline is
discounted as template — but its direction (more surface information)
matches rounds 7–8 and stays on the list.

What survived verification: the WATER — the pale shallows halo (9 m,
milky mint) flooded half of every channel as an ice shelf, drowned the
foam ring in same-value white, and hid the depth grade; water has
scored 3 for three rounds and had never been addressed head-on. Also
survived: corridor composition (dead-centre symmetry; the bobbing
fruit row stacked onto the hero — "oddly clutching a fruit"), and the
portrait-range "capsule assembly" read (naked pelvis, unbroken egg
silhouette from the side).

Self-score: character 3 · props 5 · dressing 4 · vegetation 4 · light 4
· colour 5 · water 3 · backdrop 4 · motion 2 · composition 4.

### Fixing this round (became round 10)

Water: halo 9→5 m, inner band thinned and warmed, deep base kept rich
so the foam ring reads against it; ripple sheets stretched
anisotropically along their scroll heading (flow you can point at).
Hero: blue shorts band over the hips, spine fur fins. Composition:
fruit row moved off the centreline, corridor camera nudged
off-axis.

---

## Round 8 — 2026-08-31 (surfaces get their paint)

Shot from `08c6d99`, seed `0x5eed1e`, `shots/round8/`. Gates: build
green, det green (pair in 2 boots), 5/5 PASS.

What landed: second value octave on ridges and mounds; two world-space
vcolor octaves on beach tops; sand tile quieted (grid gone); baked
fresnel rim on the hero (toonMat opts.rim); fruit emissive 0.42→0.16;
horizon stacks pulled closer + fog far 215.

### Critic verdict (blind, fresh context) — and what measurement said

**Biggest gap: still the far field** — water-gap's left hill and sea
stacks one flat value; the split "at about ten metres". Partially
verified: the corridor flanks DID gain mottle, but the ridge END CAPS
(what water-gap faces) and the stack bodies stayed smooth.

The big find: **"cast-shadow coverage is sparse — four corridor palms
put no shadow on the sand, nothing in water-gap casts at all, the
sun's direction is unreadable."** Measured against round 6: REAL, and
a regression this loop introduced. VSM (adopted round 7 for penumbra)
erases every THIN caster — fronds, grass and hero limbs are
double-sided sheets whose two faces land in one shadow texel, so their
variance wipes their own shadows. Reverted to PCFSoft; crisp edges
cost less than no shadows. Logged in pipeline.js: do not retry VSM or
PCF+radius.

Also ranked: hero has no hands (gloves exist, knuckles hid inside the
palm silhouette — thumb needed) · belly shading facets (14-segment
lathe + fresnel rim amplifying edges) · no aerial perspective · flat
foam sheet · sphere-ish fruit (lobes at 0.055 vanish under the
two-step toon ramp) · cloned upright grass · bare island sides ·
title-hero still a found frame (third verdict running).

Self-score: character 3 · props 5 · dressing 5 · vegetation 4 · light 3
· colour 5 · water 3 · backdrop 3 · motion 3 · composition 4.

### Fixing this round (became round 9)

Shadows back (PCFSoft revert). Thumb + proud knuckles + bigger cuff.
Torso lathe 14→24 segments. Fruit lobes 0.055→0.09. Sea-stack strata
banding; mounds spread wider down the slopes. Grass gains a constant
+0.12 breeze lean under its wobble. Title-hero recomposed: camera in
and low, hero owns the lower third.

---

## Round 7 — 2026-08-31 (the hero was never wearing his colors)

Shot from `4d49165`, seed `0x5eed1e`, `shots/round7/`. Gates: build
green, det green (boots 0 and 2 paired bit-identically around a lottery
miss on boot 1 — the sampling gate doing its job), 5/5 PASS
(170.1k–191.5k tris; VSM's two-sided shadow pass roughly doubles
counted shadow tris).

What landed: the vertex-color multiply bug fixed (torso material white,
fur painted — the round-5 belly and stripe render for the first time),
angular belly bib, cream gloves + cuffs + knuckles, thicker ears,
4-spike crest, shoulder balls, chest tufts, tail tip; five-lobed wumpa
with stem dimple; cloud layer + corridor horizon stacks; VSM shadows
with real penumbra; rim 0.65; hero blob r=0.68.

### Critic verdict (blind, fresh context) — and what measurement said

**Biggest gap: "geometry-level dressing but zero surface-level art"** —
every large surface one flat value end to end (hero-closeup hill,
water-gap left half, crate-cluster sand). Verified: real, and the
biggest by frame area.

Claims measured before obeying: "fruit are raw spheres" STALE as
stated — the lobed mesh landed this round — but true in effect: 0.42
emissive flooded the light/shade split, so the lobes rendered as flat
discs. "Sand shows a square grid" VERIFIED — the ripple strokes and
speckle tile at the 9 m UV period. "Far layer is translucent ghost
slabs" verified — the horizon stacks surfaced at ~80% fog. "No rim
light separating hero" verified again (second critic running). "Palms
perfectly symmetric / no per-instance grass hue" partially stale —
lean and hue spread exist, but do not read at framing distance.

Ranked (condensed): 1 macro variation absent · 2 hero fidelity (paws,
expression, outline-style mismatch) · 3 ghost far layer · 4 cloned
vegetation · 5 frozen frame · 6 no hero rim · 7 water flat · 8 nothing
grounded · 9 sphere fruit (stale, see above) · 10 sand grid.

Self-score: character 3 · props 5 · dressing 4 · vegetation 3 · light 4
· colour 5 · water 3 · backdrop 3 · motion 2 · composition 5.

### Fixing this round (became round 8)

#1 macro: second value octave on ridges and canopy mounds; two
world-space vcolor octaves on the beach tops (damp + pale patches);
ripple-stroke alpha halved and speckle thinned so the 9 m tile stops
printing a grid. #6 hero rim: baked fresnel rim in toonMat (a
directional rim dies whenever the camera swings off its axis) — first
attempt rendered the hero black: injected GLSL referenced undeclared
uniforms; declarations added. #3 ghosts: horizon stacks pulled to
z≈-130 and fog far 190→215. #9 fruit emissive 0.42→0.16 so the lobes
shade.

---

## Round 6 — 2026-08-31 (midground reads as jungle, the hero gets a face)

Shot from `53a3004`, seed `0x5eed1e`, `shots/round6/`. Gates: build green,
det green (see below), 5/5 PASS (130.9k–152.1k tris, 171–243 draws).

What landed, against the round-5 top three: **midground** — lumpier fbm
ridge silhouettes, canopy mounds spread across the slopes (clamped above
the waterline; kills the "lettuce head floating in sea"), crown blobs on
the bgTrees (bare blade fans read as dead sticks), a second tree rank
climbing the slopes. **Vegetation** — frond droop with a base-to-tip
value split; `makePalm` takes lean/yaw without disturbing the rng stream.
**Character** — big readable eyes (white + iris + pupil), raised brow,
cheek tufts, thicker outline, shoulders out of the T-pose. Plus: foam
ring pulled out from under the rock bulge; a framing palm closes the
beach-corridor top; bigger fruit stems.

Det gate rewritten around measured SwiftShader behaviour: the emulator
picks one of ~3 bit-stable rasterization outcomes per WebGL context
(silhouette-edge pixels only; survives MSAA-off, cache and ANGLE-feature
disables, fresh-process launches). The A/A leg now boots the same seed
until two captures collide bit-identically (`max===0` unchanged) and
fails if six independent boots cannot produce one matching pair —
discrete emulator lottery passes, continuous build entropy cannot.
Verified green four consecutive runs, pairing on the first two boots
each time.

### Critic verdict (blind, fresh context) — and what measurement said

**Biggest gap: "the closest thing to the camera is the least designed
thing in every frame"** — the hero at portrait range is nameable
primitives with an outline, and the fruit is the banned sphere verbatim.
The calibration paragraph held: no grey-shadow template lead; the one
lighting claim made ("hard polygon-edged cast shadow, zero penumbra")
survived a pixel probe.

Claims verified before obeying: hero contact blob EXISTS but r=0.5
drowns under ground cover (claim survives perceptually); rim light
EXISTS at 0.5 but never separates the hero (survives); "no gloves" is
stale as stated — gloves existed since round 5 — but true in effect:
dark leather on orange fur reads as nothing. Verification also exposed
a real bug the critic could not have named: the torso's vertex colors
MULTIPLY its orange material color, so the round-5 belly patch and back
stripe had never rendered at all (cream × orange = orange; found by
painting the belly magenta).

Ranked (condensed): 1 hero fidelity · 2 sphere fruit (banned) · 3 two
backdrop layers + empty sky (third round at #3) · 4 paper vegetation ·
5 sheet foam, no flow · 6 no hero rim · 7 no hero contact shadow ·
8 no macro variation · 9 frozen identical idle, no wind lean ·
10 title-hero is a found frame.

Self-score: character 3 · props 5 · dressing 4 · vegetation 4 · light 5
· colour 5 · water 4 · backdrop 3 · motion 3 · composition 4.

### Fixing this round (became round 7)

#1 hero: the vertex-color multiply bug fixed (belly and stripe render
for the first time), belly cut by angle so it survives 3/4 and side
views, cream gloves + cuffs + knuckles, thicker ears, 4-spike crest,
shoulder balls, chest tufts, tail tip. #2 fruit: five lobes and a stem
dimple sculpted into the body. #3 backdrop: cloud layer (fog-free,
baked shading) + a horizon sea-stack pair dead in the corridor
sightline. Plus: VSM shadows (real penumbra — PCFSoft ignored
shadow.radius, PCF+radius dithered), rim 0.65, hero blob r=0.68.

---

## Round 5 — 2026-08-27 (the hero stops being a capsule)

Shot from `8946439`, seed `0x5eed1e`, `shots/round5/`. Gates: build
green, det green, 5/5 PASS (~126k tris title-hero). The det gate earned
its keep: the new run cycle accumulated wall-clock frames before review;
`runPhase` now resets in `setPos()` with the world clock.

What landed: articulated bandicoot in `src/player/model.js` — pivot
hierarchy (hips, head, ears, arms, legs, tail), lathe torso with
back-stripe and belly vertex colours, brow/muzzle/nose, inner-ear
plates, hair spikes, gloves and shoes, inverted-hull outlines (face
parts skip the hull). Controller: speed-scaled run cycle, air pose,
breathing idle, wind ears.

### Critic verdict (blind, fresh context)

**Biggest gap: "the midground collapses into single-value primitive
lumps"** — the ridge masses and their canopy read as one flat value the
moment the eye leaves the beach.

Ranked (condensed): paper vegetation · no overhead framing layer ·
missing crevice occlusion · water margin weak · monotone colour script ·
sphere-ish fruit · empty sky · wood-grain repeats across crates. Two
claims checked stale before obeying: the gloves and the crest DID exist
in the stills — discounted.

Self-score: character 3 · props 5 · dressing 4 · vegetation 3 · light 5
· colour 4 · water 5 · backdrop 3 · motion 4 · composition 4. (Light and
water at 5 — the first verdict not led by the lighting template since
the calibration paragraph went into the brief.)

### Fixing this round (became round 6)

#1 midground: silhouette events on the ridges — fbm lumps, canopy
mounds on the slopes, crowned bgTrees, a second climbing rank. #2
vegetation: frond droop + value split. #3 character read at distance:
eyes, brow, tufts, outline weight.

---

## Round 4 — 2026-08-27 (a time of day, and the round-3 artifacts closed)

Shot from `e31bcb3`, seed `0x5eed1e`, `shots/round4/`. Gates: build
green, det green, 5/5 PASS.

What landed, against the round-3 ranked list: sun lowered to ~32° so
shadows tell a direction (the `OFF` vector in `pipeline.js` is now a
time of day), rim raised to 0.5; the sand seam grid closed at the root
(interior top-face normals flattened in `masses.js` — faceting, not
tiling); shallows and foam pulled back from snowbank white; crate wood
gone golden (`#c98f4a`) so shaded faces stop crushing; bark rings
dropped to low contrast under the fibre streaks.

### Critic verdict (blind, fresh context)

Verdict text not preserved in full (logged late; this entry is
reconstructed from the round-5 response). The headline: with the light
story fixed, the capsule-and-cone placeholder hero became the biggest
gap in every framing that contains him — the declared debt stopped
being deferrable. That verdict became round 5 wholesale.

---

## Round 3 — 2026-08-27 (light punch, treeline, macro variation)

Shot from `103c1ec`, seed `0x5eed1e`, `shots/round3/`. Gates: build green,
det A/A bit-identical / A/B 68.19%, 5/5 PASS (103.9k–122.6k tris).

What landed: fill cut / key raised, grade rebuilt (multiplicative teal
tint + contrast S-curve + saturation), corridor treeline, banded ridge
slopes, doubled sand macro layer + wet rim, loud grass spread, broadleaf
species, waterline-clustered skirt rows.

### Critic verdict (blind, fresh context) — and what measurement said

Verdict again led with "no light story / neutral white key / shadow
saturation floor fails." **Measured: the floor PASSES decisively** —
shadow sat 0.84–0.99 (floor 0.15), cool shift +0.07…+0.27 on all three
sampled stills, lit:shadow value ~1.6:1. Third critic in a row leading
with a lighting-template paragraph; from here the ranked SPECIFICS get
verified individually and the template headline is discounted.

Claims that survived verification, ranked by what they cost:

1. No TIME OF DAY — sun at noon height leaves no readable direction.
   True and cheap: the light was correct but storyless.
2. Sand carries a ruled square grid (hero-closeup) — VERIFIED REAL:
   faceted normals on the segmented island top, not texture tiling.
3. Foam + shallows blow out to a snowbank (water-gap) — verified.
4. Crate shadow faces crush toward black — verified; wood albedo too dark.
5. Palm-trunk ring decal reads as a doodle at range — verified.
6. Backdrop still only two layers in most frames — partially true (trees
   landed but thin; far ridge reads only in beach-corridor).
7. Gap-arc fruit read as unsupported spheres against the hills.

Self-score (critic): character 2 · props 4 · dressing 4 · vegetation 3 ·
light 2 · colour 3 · water 2 · backdrop 2 · motion 2 · composition 4.
(Light/water scores contradict the instrument readings; kept for the
record, weighted accordingly.)

### Fixing this round (became round 4)

Sun lowered to ~32° (time of day), rim raised; top-face normals
flattened (grid gone, verified); shallows/foam pulled back; golden wood
albedo + AO floor raised (crush gone); bark rings at low contrast under
fibre streaks.

---

## Round 2 — 2026-08-27 (light transport, backdrop, fruit)

Shot from `4368b3a`, seed `0x5eed1e`, `shots/round2/`. Gates: build green,
det A/A bit-identical / A/B 63.78%, 5/5 PASS (89.5k–104.7k tris, 121–191
draws).

What landed: the post chain (linear HDR target, AgX + teal split-tone
grade + vibrance, `?ablate=grade`), cool ambient path + rim light, contact
blobs under every prop and the hero, baked crevice AO on crates, wumpa
stem+leaves, backdrop hue spread, sea stacks in sight lines. Measured:
sand cool shift −0.097 → **+0.258** (crate-cluster), +0.059 (title-hero).

### Critic verdict (blind, fresh context — did not see round 1)

**Biggest gap: "the image has no light in it"** — same verdict as round 1
from an independent critic. Uniform milky ambient, no hot key, weak
warm/cool split, desaturating haze; flat lighting erases the crates'
modelled relief. Measured lit-vs-shadow sand value: 0.72 vs 0.61 — the
fill (hemi + rim) plus AgX's native flatness plus the shadow-LIFTING
grade compress key contrast to ~15%. The grade fixed shadow hue but paid
for it in contrast.

Ranked (condensed): 1 flat keyless light · 2 backdrop hills still
featureless blobs (second round at #2 — mound hue spread did not read;
they need silhouette events, i.e. trees) · 3 zero macro variation on
large surfaces · 4 island sides still read slab-like · 5 cloned starburst
grass (instance hue variation too subtle to read) · 6 water flow/foam too
weak in a still · 7 fruit still read spherical, low glow · 8 palm fronds
flat zigzag · 9 "nothing is grounded" (measurably overstated — contact
blobs exist in the stills; too subtle) · 10 empty sky, no scripted mood.

Self-score: character 1 · props 5 · dressing 4 · vegetation 3 · light 2 ·
colour 3 · water 3 · backdrop 3 · motion 2 · composition 4.

### Fixing this round (top three)

#1 light punch (owner): cut fill, hotter key, contrast S-curve after AgX,
real saturation boost — stop letting the grade lift shadows brighter.
#2 backdrop: strong per-mound value contrast + low-poly tree silhouettes
on the near flanks so "jungle" reads as trees, not pudding. #3 macro
variation: stronger sand macro layer + wet rim band; grass gets loud
per-instance hue/lean/scale spread + a second species.

---

## Round 1 — 2026-08-27 (vertical slice: beats 1–3)

Shot from `da827df`, seed `0x5eed1e`, 1280×800, 30 settle frames,
`shots/round1/`. Gates: build green, det A/A bit-identical / A/B 65.25%
moved, 5/5 framings PASS (85.6k–100.7k tris, 105–153 draws).

Builder-level defects found and fixed before the critic saw anything:
stale shadow-camera projection (10 m default cascade), foam ring
outer-edge wrap artifact ("grid over the sea", diagnosed by painting the
foam magenta), ripple strokes chaining into ruled lines at grazing angles,
depth-map/foam `flipY` mirroring, jungle ridges walling off framings,
grass growing through crates.

### Critic verdict (blind, fresh context)

**The single biggest gap: the light is dead.** Milky, low-contrast wash in
all five stills; shadow is a grey-green version of the lit colour; no
occlusion in any crevice; no rim anywhere. The refs are built out of hot
golden key against deep saturated blue-green shadow.

Measured before obeying (`compare.mjs --pillarb`): the claim is right in
the way that matters, with a correction — shadow saturation is HIGH
(0.82–0.89, floor passes) but **cool shift is +0.005…−0.021**: shadow has
the same warm hue as the light, only darker. The ramp's cool texels are
being washed out by the warm hemisphere ground bounce. The failure is "no
chromatic shift", not "desaturated".

### Ranked

1. No coloured light transport (Pillar B) — warm-key/cool-shadow contract
   absent; no occlusion darkening at contacts; worst in crate-cluster,
   hero-closeup.
2. Backdrop is two smooth green blobs (Pillar D, backdrop floor) — hills
   are single-value mounds; no third distance layer reads; worst in
   water-gap, title-hero.
3. Wumpa fruit are raw orange spheres (Pillar A, banned outcome) — no
   stem, leaf, glow control or contact shadow; worst in water-gap.
4. Play surfaces read as extruded slabs (Pillar D, foundations floor) —
   flat-topped, single-colour freeboard faces, ruler edges; worst in
   water-gap.
5. Vegetation is one cloned species (Pillar C, ground-cover floor) — the
   same star-tuft repeats at identical hue; ferns too sparse to register.
6. Water margin/flow too weak to survive a still (water floor) — foam and
   ripple exist but read glassy; no sparkle, no churn.
7. No colour script (Pillar E) — one desaturated pastel band; empty sky.
8. No macro variation at two scales on any large surface (macro floor).
9. Palms read as cutouts (Pillar A) — trunk zigzag reads as decal;
   fronds lack midrib/droop weight.
10. Found framings, frozen frame (Pillars E/F) — beach-corridor is a
    centered one-point shot with an empty top third; wind does not
    survive the still.

Self-score (critic): character 2 (declared debt) · props 5 · dressing 4 ·
vegetation 3 · light 3 · colour 3 · water 3 · backdrop 2 · motion 2 ·
composition 3.

### Fixing this round (top three)

#1 light transport (render/art single owner): cool the ambient path so the
ramp's chromatic shadow survives the bounce; more contrast between key and
fill; contact darkening under every prop. #2 backdrop: macro breakup and
hue drift on the ridge masses, a genuinely distinct far silhouette layer,
sea stacks moved into the framed sight lines. #3 fruit: designed wumpa
(stem, leaves, richer albedo, controlled glow, grounding).

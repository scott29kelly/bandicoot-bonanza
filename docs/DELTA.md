# DELTA — ranked visual gaps against the bar (rebuild)

Output of the gauntlet loop in `docs/GA3-PLAN.md`. Append-only: new rounds go
on top, closed entries move to the round that closed them, nothing is deleted.
Judged blind against `refs/proposed/` by a fresh-context critic each round.

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

### Critic verdict (blind, fresh context)

Pending — appended when the round-6 critic reports.

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

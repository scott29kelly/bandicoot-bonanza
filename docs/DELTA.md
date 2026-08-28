# DELTA — ranked visual gaps against the bar (rebuild)

Output of the gauntlet loop in `docs/GA3-PLAN.md`. Append-only: new rounds go
on top, closed entries move to the round that closed them, nothing is deleted.
Judged blind against `refs/proposed/` by a fresh-context critic each round.

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

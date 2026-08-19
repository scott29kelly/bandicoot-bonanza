# DELTA — ranked visual gaps against the quality bar

The output of the reference-delta loop in [`QUALITY-BAR.md`](QUALITY-BAR.md).
Ten entries, ranked by how much each one costs the image. Append new passes;
move closed entries to the bottom rather than deleting them, so the record of
what was actually fixed survives.

---

## Pass 1 — 2026-08-19 (baseline)

Shot from `c721a5b`, seed `0x5eed1e`, 1280×800, 30 settle frames.
Sheet: [`shots/baseline-contact-sheet.png`](shots/baseline-contact-sheet.png).
Measured: 33.6k–41.5k triangles, 119–321 draw calls per framing — **6× under
the triangle floor** in every single framing.

### The headline

**The level is a set of flat slabs floating over a water plane, and the
camera can see it from anywhere.** Seven of the nine framings show at least
one platform's bare extruded underside hanging in mid-air. This is not a
dressing problem that more props would fix; the world has no *mass*. Until
the play surfaces sit on something, every other improvement lands on top of a
diorama.

### Ranked

1. **Everything floats — no foundations, no island, no ground plane.**
   (Pillar D, floor: platform foundations.) `plat()` extrudes a box and drops
   it in space. In `water-gap`, `pillar-pit`, `temple-torches` and `gate-hero`
   the slab sides and undersides are fully visible, untextured, and end in
   air. The corridor reads as cardboard on glass.

2. **The temple gate — the money shot's subject — is a flat card.**
   (Pillars A/E.) `gate-hero` frames a texture-mapped plane with a hole cut in
   it, floating, no thickness, no jambs, no reveal depth, no bottom. The
   single most-composed framing in the game has nothing in it to compose.

3. **Shadow is grey.** (Pillar B, floor: shadow colour.) `toonRamp` is
   `[68,68,68 → 255,255,255]` — pure greyscale, so every shadowed face in
   every framing is desaturated. This is the "lighting has failed" test
   failing across the whole game, and it is a four-value fix.

4. **Bloom erases the fruit.** (Pillar E, floor: emissive control.) At
   `emissiveIntensity 0.55` with a 0.82 bloom threshold, every fruit is a
   featureless white ball in all nine framings. The single most-repeated
   collectible in the game has no readable shape.

5. **Vegetation is cones.** (Pillar A, banned outcome: raw primitives.)
   `ConeGeometry` ferns and grass, 340 instances, varied only by scale and
   rotation. They read as green traffic cones, most damagingly in
   `jungle-totem` where they are the subject.

6. **Nothing is grounded.** (Pillar B.) No contact darkening anywhere: crates,
   rocks, totems and palms all sit on the surface with a hard edge and no
   occlusion. The hero's shadow is a soft blob that reads as separate from
   him.

7. **No backdrop — the world is sky, water, and the corridor.**
   (Pillar D, floor: backdrop layers.) There is exactly one distance layer.
   Fog grades into flat colour with nothing in it. `beach-corridor` and
   `pillar-pit` are mostly empty frame.

8. **Water is one translucent plane.** (Pillar F, floor: water.) No shoreline,
   no foam, no wet margin, no depth grading; the horizon meets the sky in a
   hard white band that reads as a seam. Motion is a scrolling stripe texture.

9. **Textures tile visibly and carry one frequency.** (Floor: texture
   variation.) The stone's blob-and-scribble pattern repeats openly across the
   temple platforms in `temple-torches` and `gate-hero`; sand is uniform
   speckle over the whole beach; moss is flat green.

10. **The hero has no surface.** (Pillar A, floor: hero character.) Two beige
    spheres, untextured, no markings, no fur break-up, no visible outline in
    any framing. He is the most-looked-at object in the game and carries less
    surface detail than a crate.

### Fixing this pass

Per the loop, the top three: **#1 foundations and world mass**, **#2 the
gate**, **#3 the shadow ramp** — with **#4 (bloom/fruit)** folded into #3
since both are a grade problem and the fix touches the same few values.

---

## Closed

*(nothing yet)*

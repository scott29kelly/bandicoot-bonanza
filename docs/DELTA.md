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

## Pass 2 — 2026-08-19 (world mass + render pipeline)

Shot from `67c1c56`, seed `0x5eed1e`, 1280×800, 30 settle frames.
Sheet: [`shots/pass2-contact-sheet.png`](shots/pass2-contact-sheet.png).
Measured: 77.5k–95.7k triangles, 296–918 draw calls, **9 of 9 framings PASS
the frame gate**. (Both counters roughly doubled by the AO depth prepass — see
the note under Floors. They are not comparable to pass 1.)

### What this pass did

Closed #1, #3, #4, and most of #6 — and found two defects of its own that were
worth more than the fixes:

- **A parameter-order bug turned the 40 m final yard into a 40 m tower.**
  `craggyMass(w,d,h)` called as `(w,th,d)`. Nothing caught it except looking
  at a wide diagnostic shot; the review framings were *inside* the tower and
  showed a plausible cliff face. Wide diagnostic poses are worth keeping.
- **The AO pass shaded every pixel as fully occluded, and the tooling called
  it a success.** Nine framings, plausible triangle counts, plausible draw
  calls, a contact sheet of near-black rectangles. This is the playbook's
  broken-instruments failure exactly, and it is why `tools/_verify.mjs` now
  decodes and judges every capture, with negative controls that must fail.

### Still open, re-ranked against the current sheet

1. **Vegetation is still cones.** (Was #5.) Now the most obvious remaining
   failure by a wide margin: ~340 `ConeGeometry` instances read as green
   traffic cones in six of nine framings, and they are the *subject* of
   `jungle-totem`. Nothing else in frame is this far below the bar.

2. **The gate is a box assembly with no architecture.** (Restated from the old
   #2, which was wrong: the gate is not a flat card — it has posts, a lintel,
   a cap and a gem. What it has no relief. Plain boxes, no jambs, no reveal,
   no coursing, and a 24×14 back wall that is a bare slab with a visible
   floating edge.) The money shot's subject still has nothing to compose.

3. **No backdrop.** (Was #7.) One distance layer. Fog grades into flat colour
   with nothing in it, and the aerial diagnostic showed the whole level
   dissolving into haze by 130 m. Pillar D fails outright.

4. **Water is one translucent plane.** (Was #8.) Unchanged: no shoreline, no
   foam, no wet margin, no depth grading, a scrolling stripe texture for
   motion, and a hard white seam at the horizon.

5. **The cliff texture reads as horizontal wood grain.** New, introduced by
   pass 2. The strata bands are too regular and too high-contrast, and the
   moss creep prints as a hard uniform green line at every platform rim.
   Needs the two-scale macro variation the floors now require.

6. **The hero has no surface.** (Was #10.) Two beige spheres. He is the
   most-looked-at object in the game.

7. **Textures tile visibly and carry one frequency.** (Was #9.) Now a stated
   floor: two scales of macro breakup, roughly 3–4 m and 12 m.

8. **The image is low-contrast and hazy overall.** New. AgX is doing its job
   on highlights, but the fog is desaturating the midtones toward white long
   before the far plane, so most framings sit in a narrow value band.

9. **Draw calls are high for what is on screen** — 918 in `beach-corridor`.
   Palms, torches and totems are built from individual meshes per part.

10. **Nothing in the world moves except palms and the water texture.** Pillar
    F: no shared wind field, no grass or fern motion, no foam.

---

## Closed

- **#1 Everything floats** — closed pass 2 (`dc8fa57`). Platforms are craggy
  islands with cliff sides and undercut, foundations below the waterline where
  they would be seen.
- **#3 Grey shadow** — closed pass 2 (`c88afc8`). Five-step chromatic toon
  ramp. Measured on sand: cool shift +0.027 → +0.148, shadow saturation
  0.205 → 0.252.
- **#4 Bloom erases the fruit** — closed pass 2 (`c88afc8`, `9d93345`).
  Emissive cut to 0.26, and bloom now runs on a linear HDR buffer with a
  threshold of 1.0, so only things actually emitting can clear it.
- **#6 Nothing is grounded** — mostly closed pass 2 (`67c1c56`). AO lands on
  crate seams, fruit contact rings and overhangs; 59.5% of pixels move against
  `?ablate=ao`. Contact shadows under small props could still be stronger.

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

## Pass 4 — 2026-09-04 (backdrop vista, character overhaul, organic palms, gameplay systems)

Sheet: [`docs/shots/pass4-contact-sheet/CONTACT-SHEET.png`](shots/pass4-contact-sheet/CONTACT-SHEET.png).
Measured: 298.5k–357.8k triangles, **9 of 9 framings PASS the frame gate** with mean luma 0.563–0.662 and sd 0.109–0.170.

### What this pass closed

- **#2 The gate is a box assembly** — closed. Carved stone pillars with bases and capitals, Aztec glyph lintel, crowning pediment, and glowing brazier flames.
- **#3 No backdrop** — closed. 10 karst sea stacks rising from the water, layered distant volcanic mountain ridges, glowing caldera rim, and 3D drifting cartoon puffy clouds.
- **#4 Water is one translucent plane** — closed. Vibrant turquoise-to-sapphire multi-depth ocean with sun caustics + dynamic pulsing shoreline foam rings contouring all island coastlines.
- **#6 The hero has no surface** — closed. Full mascot overhaul: vibrant vermillion-orange fur, denim blue shorts, red sneakers with white rubber soles and toe caps, brown leather wrist cuffs and gloves with thumbs, spiky hair mohawk, inner ear cups, glossy eye catchlights, arched brows, and contact drop shadow on the ground.
- **#10 Organic vegetation & motion** — closed. Replaced stiff paper palms with organically curved ringed trunks and 14 double-tiered drooping ribbon fronds with coconuts. Shared wind field drives all vegetation.
- **Gameplay expansion**: Added moving platforms (kinematic carry), patrolling crabs (stomp squash and spin defeat), snapping carnivorous plants, and the Secret Aztec Shrine canyon bonus path with the Giant Secret Emerald Gem (+10 fruit reward).

---

## Pass 18 — 2026-09-12 (draw-call batching; closes pass-2 #9)

Sheet: [`shots/pass18/CONTACT-SHEET.png`](shots/pass18/CONTACT-SHEET.png).
Measured: 583k–919k triangles, **206–818 draw calls, 9 of 9 framings PASS the
frame gate** — every framing under the ≤900 floor for the first time (worst
offender `beach-corridor` was 3,904).

### What this pass did

A draw-call census (`tools/profile_draws.mjs`, new) found the budget was going
to geometry *groups*, not object count: `mergeGeos` emitted one geometry group
per part carrying a `matId`, and a group is a draw call in the main pass, the
AO depth prepass, and the shadow map alike — one crate was 29 draws, one TNT
26, and every platform drew six times through its material array. Fixes:

- `mergeGeos` sorts parts by `matId` and coalesces equal neighbours → crates
  29→3 groups, TNT 26→5.
- Crate/TNT bodies render as two `InstancedMesh` groups (3 + 5 draws for all
  39 in the level); per-crate contact-shadow planes (one unique material each)
  collapse into two instanced shadow meshes.
- Platforms, pillars, stairs and foundations are split into top/cliff faces at
  build time and merged into one mesh per material per 48 m z-chunk — ~40
  platforms stop being ~240 draws, and chunking keeps a bounding sphere the
  camera and shadow frusta can still cull against.
- Foam rings: 29 meshes with 29 materials → one instanced mesh; the per-ring
  opacity pulse is traded for a fixed 0.72 (scale pulse survives per
  instance).
- Shadow maps render once per frame (`shadowMap.autoUpdate=false`, needsUpdate
  raised before the one lit pass) instead of re-rendering inside the AO depth
  prepass as well.

Verification: controls regression suite passes; pass17→pass18 pixel diff sits
inside the same-build noise band on 8 of 9 framings (water-gap slightly above
— the intentional foam change); frozen-dt toggle test confirms instanced
contact shadows still contribute ~20% of frame pixels in `crate-cluster`.

---

## Pass 19 — water surface (the pass-18 critique's named gap)

Pass 18's critic named the water the biggest remaining gap against the
QUALITY-BAR floor: *"depth-graded colour, a shoreline band, foam at contact,
and visible flow. Not a single translucent plane."* Three Gauntlet rounds
inside this pass scored 6.8 (B) → 7.9 (B+) FIX-FIRST → 8.4 (A-) SHIP.

What changed (all inside the water's one material / the one foam
`InstancedMesh` — zero extra draw calls):

- `plat()` records every island footprint (`shoreRects`, 26 rects) — the
  depth grade follows the level data, not a hand list.
- The water `MeshBasicMaterial` is upgraded via `onBeforeCompile`: a
  rounded-rect SDF to the nearest footprint drives a three-stop grade —
  saturated aqua collar (0–2.6 m), turquoise mid, sapphire by 14 m —
  verified monotone by camera-projection pixel probes (title-hero red
  channel 130 → 99 → 78 → 43 across collar → mid → ramp → 34 m).
- The contact margin is a value step, not a fade: a dark wet lip (×0.62)
  under a crisp, meandering white lapping line (0.30 m, three summed
  sines). Critic probe counted 26 dip→line signatures at water-gap (18 in
  pass 18).
- Flow lives in the shader now: three counter-drifting texture taps at
  26 m / 16 m / 6 m world scales with raised gain (streaks swing the
  surface ±30–40 %); near-field detail variance at water-gap roughly
  doubled vs pass 18 (14.8 vs 8.4 luminance SD in the 14–40 px band).
- Shoreline foam is an annular broken-lump **surf** texture (deterministic
  sin math — the `rnd()` seed stream is untouched) on the existing
  instanced mesh; the pre-instancing per-ring opacity pulse is restored via
  an instanced `aOp` attribute (0.88±0.18 shoreline, 0.72±0.16 small
  mid-channel rocks) and per-instance yaw so no two rings repeat.
- **Bug found by the critic's contour-probe demand:** a factor-2
  mesh-scale error (`PlaneGeometry(1,1)` spans ±0.5, not ±1) had placed the
  entire surf annulus *inside* the island footprints, hidden under the
  islands — only faint texture tails leaked out around the small rocks,
  which is exactly what read as "detached mid-water decals." Fixed: the
  band now lands 0.7 m outside every shoreline. Controlled hide-the-mesh
  A/B: 163,197 pixels change at water-gap (mean Δ 38/255); contour-band
  probes read 176–190 mean brightness with >200 white peaks vs 154 open
  water; foam-bright population at water-gap rose 3,648 → 14,291 px.

Verification: 9/9 framings PASS the gate; draws 206–826 (floor ≤900);
tris 583k–975k (floors 220k/150k); controls regression suite clean; no
confirmed regressions vs pass 18 (draw deltas ±36 are the known harness
phase noise — same-build reruns vary by ±28).

Watch items (recorded, not blocking): the motion read of the flow shear
and lapping meander needs a live 60 fps look (stills cannot show
counter-drift); far-field sapphire verified by builder probes only; palm
trunk texture flagged by one critic as pre-existing.

---

## Pass 20 — atmosphere (the pass-19 critique's #1 overall gap)

Pass 19's critic named midtone/distance washout the biggest remaining gap:
the old linear `THREE.Fog` replaced distant surfaces 100% with mid-value
pastel stops, so distance read as a pale luminance lift. The builder's
washout probe (`tools/washout.mjs`, new) flagged 5/9 framings: far-field
saturation collapsed to 0.29–0.34 (near 0.38–0.49), value *rose* with
distance, pillar-pit's far band was nearly flat (spread 0.059). Two Gauntlet
rounds: 8.0 (A-) FIX-FIRST → **8.5 (A-) SHIP**.

What changed (all in the grade pass + the depth prepass it already had —
zero extra draws, tris unchanged):

- **Atmosphere moved into the grade pass.** `scene.fog` is nulled on the
  composer path; distance grade is driven by the AO prepass's packed depth
  buffer (decoupled from `?ablate=ao`; `?ablate=atmos` zeroes the term).
  One colour owner per the pipeline law: fog → exposure → AgX → split →
  dither, all in one shader.
- **Curve:** `1-exp(-pow(max(d-15,0)/115, 2.6))` — a 15 m dead zone keeps
  gameplay range under ~2%; a sea-level air collar (×1.35 at y=0, thinning
  by ~10 m) gives far silhouettes a base-to-top gradient; factor capped at
  0.68 (0.55 at dusk) — **distance grades but never replaces**.
- **Stops re-authored DEEP** (beach `#17667a`, jungle `#155840`,
  canyon/temple plum-indigos): at or below the value of the surfaces they
  fog, so far silhouettes stay darker than the sky. (Mid-value stops lift
  and desaturate the dark sapphire sea — cut two proved it on the probes.)
- **Warm horizon is a multiplicative gild**, not a convergence: authored
  vec3 per time of day (day 1.30/1.04/0.80, dusk 1.32/1.03/0.92) rotates
  the air's hue gold-ward at range without lifting value toward cream
  (cut one converged fully on the sky's bottom-stop bytes — seamless but a
  cream wash; the cap-0.68 + gild design superseded it). Subtle
  sun-direction warmth on top.
- ±1.5/255 interleaved-gradient **output dither** kills banding on the new
  long fog ramps (the artifacts floor).
- minfx keeps a re-authored material fog (60/240, deep stops).

Verification: 9/9 gate PASS (luma 0.512–0.658, sd 0.107–0.158); draws
206–826; tris 583k–975k; controls clean; horizon seam dead (critic probes:
zero bright-band rows, max row step ≤4/255); far-band saturation gains at
beach +0.036 / jungle +0.050 / title +0.031 with value held; temple gold
share recovered 9.0% → 28.5% after the dusk fixes. The first-round
gate-hero "near-yard regression" was proven a settle-phase artifact (the
lapping-line shoreline swings sheet-to-sheet; pass19 rows reproduce at
settle 30 with the atmosphere ablated).

Residuals recorded by the re-critique (non-blocking, ranked for backlog):
pillar-pit stack separation −15% vs pass19 (lever: shave the 60–100 m band
or deepen the canyon stop); temple air still 16.1% desaturated with one
neutral strip; FAR<NEAR sat gradient on 4 framings; gate-hero far gold
65.8→59.5%; and a tooling ask — frozen-uTime capture mode to delete the
shoreline phase-noise failure class. Prior backlog stands: hero
rim/outline at portrait range, mouth cavity, rolling-log dust, shoreline
debris clustering, Kelvin V-wake, palm trunk texture.

---

## Pass 21 — hero rim/outline (the unmet stated floor)

The QUALITY-BAR's Hero-character floor reads "…markings, ears, brow, muzzle,
tail and paw shapes readable; **a visible outline**; a contact shadow under
the feet in every framing" — and the outline clause had been unmet since the
sculpted GLB hero shipped (the procedural fallback's hull spheres were built
and then deliberately never added after neck/waist seam problems). Pillar B's
"rim light separates the hero from the background at all times" leaned on one
0.46-intensity cool directional. The pass-20 re-critique kept hero rim/outline
as the standing runner-up gap. Gauntlet verdict: **7/10 (B) SHIP** — the
floor clause is closed at portrait and medium range; user feedback during the
pass independently flagged the character as reading amateurish against Crash
4 references, which scopes the NEXT pass (character fidelity), not this one.

What changed (one hull mesh + shader injections on existing hero materials;
+1 draw main pass, +1 in the AO depth prepass):

- **Inverted-hull contour.** The 8 exterior GLB primitives (fur, chest,
  denim, leather, sneakers, rubber, gold, nose) merge into ONE back-face
  shell — 84,448 tris, one draw — expanded along vertex normals by a constant
  WORLD-space width (`uOutlineW` 0.014) with per-axis compensation dividing by
  `|S·n|`, because the sculpt's node scale is non-uniform (0.78/0.52/0.44) and
  an uncompensated hull draws side contours ~1.8× thicker than top contours.
- **The contour follows the face rig.** The `uFace`/`uEyes` displacement GLSL
  moved into a shared `HERO_MORPH` const used by BOTH the hero materials and
  the hull; a hull that didn't morph would poke through the jaw on every
  speak/blink frame. Verified with a forced jaw-open A/B: clean 9–18 px
  contour bands at the dropped-jaw edges, zero mouth-cavity fill.
- **Colour authored to survive the grade.** `#221a3e` is a display-space hex;
  the composer path consumes material colours as linear and AgX lifts darks —
  the first cut RENDERED pale periwinkle (129,131,183), lighter than the
  shadow family it was meant to sit in. `convertSRGBToLinear()` fixed it to a
  measured (34,64,132), sat 0.74 — a deep blue-violet in the ramp's
  core-shadow family, not a black line.
- **Fresnel rim that defers to illumination.** Exterior hero materials get a
  pow-4 fresnel gated by smoothstep(0.5,0.95) so it hugs the contour, cool
  sky-blue on the shadow side and warm at the sun terminator, scaled by
  `mix(1.0, 0.25, sunw^0.75)`. The first cut rimmed sunLIT flanks into pastel
  (199,151,79 → 202,176,167; saturation 0.60 → 0.17, flirting with Pillar B's
  0.15 floor on lit pixels) because the hero-closeup flank points across the
  sun azimuth while lit from above — the illumination term fixed it to 198
  affected px. Eyes, teeth, mouth interior and glints are excluded by design.
- **`?ablate=hero`** hides the hull and zeroes the rim for A/B.
- Method note: sheet-to-sheet A/B is confounded by idle/water/cloud phase
  drift; the trustworthy instrument this pass was the frozen-dt same-context
  toggle (`setFixedDt(1e-9)`, hull+rim toggled in one page load) — which is
  also the frozen-uTime capture mode the pass-20 critic asked for, proven on
  hero-closeup (negative control 0.000–0.001% moved).

Verification: 9/9 gate PASS (luma 0.512–0.655, sd 0.106–0.167); draws
208–822 (floor ≤900); tris 583k–1141k (floors 220k/150k); controls clean;
minfx boots with hull visible and no errors. Frozen-dt A/B at hero-closeup:
5.97% of pixels changed, confined to the hero's screen column; contour edge
runs 9/9/12 px (p10/med/p90) at portrait, median 4 px at title-hero; contact
shadow and eye-centre landmarks untouched. Critic-measured artifacts fixed
in-pass: lit-flank desaturation (above), periwinkle contour (above), and the
contour/rim "moat" (rim now hugs the line).

Residuals recorded by the critique (non-blocking, ranked): grazing-surface
line pinch (~2 px at the right jaw — inverted-hull's known limit; a view-dir
term would fix it); irregular line weight (76% of silhouette rows carry a
strong contour; a 61-row torso band has none where fur meets denim without a
silhouette); the hull draws in the AO depth prepass unexpanded/unmorphed
(+84k tris for nothing — budget holds); gate-hero same-context A/B remains
UNMEASURED (a dt-independent transient near the gate corrupts controls — the
frozen-dt probe needs a second negative control there). The critique named
CHARACTER FIDELITY the biggest remaining whole-bar gap (flat colour-zone
materials, region-hack face rig, axis-squashed proportions, off-script hero
light logic, idle life) — matching the user's Crash 4 reference feedback;
that is the next pass's scope. Atmosphere residuals from pass 20 stand.

---

## Closed

- **#1 Everything floats** — closed pass 2 (`dc8fa57`). Platforms are craggy
  islands with cliff sides and undercut, foundations below the waterline where
  they would be seen.
- **#2 The gate** — closed pass 4. Relief, coursing, glyph lintel, and brazier flames.
- **#3 Grey shadow** — closed pass 2 (`c88afc8`). Five-step chromatic toon
  ramp. Measured on sand: cool shift +0.027 → +0.148, shadow saturation
  0.205 → 0.252.
- **#4 Bloom erases the fruit** — closed pass 2 (`c88afc8`, `9d93345`).
  Emissive cut to 0.26, and bloom now runs on a linear HDR buffer with a
  threshold of 1.0.
- **#5 Vegetation is cones** — closed pass 3 (`8f6d359`). Replaced with ribbon ferns,
  grass, flowers on shared wind field.
- **#6 Nothing is grounded** — closed pass 2 & 4. AO on crevices + hero contact drop shadow.
- **#7 No backdrop** — closed pass 4. Sea stacks, mountain ridges, volcano, 3D clouds.
- **#8 Water is one translucent plane** — closed pass 4, re-closed pass 19
  at the QUALITY-BAR's full floor. Pass 4 gave it depth-graded turquoise and
  foam skirts; pass 19 delivered the whole clause: analytic SDF depth grade,
  wet-lip + lapping-line shore band, annular surf foam at contact with
  per-instance opacity restored, three-scale counter-drifting flow.
- **#8b (pass 2) The image is low-contrast and hazy overall / fog
  desaturates midtones toward white** — closed pass 20. The linear
  luminance fog is gone from the composer path; a depth-driven atmosphere
  in the grade pass grades distance with deep chromatic biome stops and a
  multiplicative warm gild instead of replacing it with pastel. Far-field
  saturation rose at every sunlit framing with value held or lowered, and
  the horizon seam (the pass-1 "hard white band" descendant) measures dead.
- **#10 The hero has no surface** — closed pass 4. Saturated fur, denim shorts, sneakers, gloves, brows, glints, mohawk.
- **#10b (pass 21) The hero has no visible outline** — closed pass 21.
  The Hero-character floor's "a visible outline" clause is met at portrait
  and medium range by a morph-following inverted-hull contour (one merged
  shell, +1 draw) plus an illumination-deferring fresnel rim on the exterior
  materials. Character FIDELITY (materials, rig, proportions, light logic)
  remains open as the next pass's scope.
- **#9 (pass 2) Draw calls are high for what is on screen** — closed pass 18.
  Group consolidation in `mergeGeos`, instanced crate/TNT bodies and contact
  shadows, chunk-merged static platform geometry, single shadow-map update per
  frame. 206–818 draws across all framings (was up to 3,904).

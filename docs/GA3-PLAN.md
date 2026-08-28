# GA-3 — the build and the loop

GA-1 (instruments) and GA-2 (the reference bar) are done. This document
decomposes GA-3: build the same game — the 12 beats of the old level — to the
bar in `docs/QUALITY-BAR.md`, judged against the approved images in
`refs/proposed/`, one gauntlet round at a time.

## Workstreams and owners

| Workstream | Directory | Owner rule |
|---|---|---|
| Render & lighting | `src/render/` | **ONE owner.** Exposure, tonemap, fog, sky, ambient, post. Sequential passes only. |
| Art & materials | `src/art/` | **ONE owner.** Toon ramp, materials, procedural textures. Coupled to render; coordinate sequentially with it. |
| World | `src/world/` | May fan out — per beat or per prop family (masses, water, flora, props, backdrop, gate). |
| Hero | `src/player/` | May fan out — controller vs. model/rig are separable. |
| Game | `src/game/` | May fan out — state machine, HUD, pickups, checkpoints. Audio is deferred until the visual loop closes. |

The render/art single-owner rule is not negotiable. Claude-of-Duty's run
proved parallel agents on coupled lighting make frame-ruining defects worse.

## The beat plan

Same game, same order, from the old level (`git show
origin/claude/aaa-visual-quality:index.html`, section 9):

1. Beach start (spawn, palms, first crates)
2. Gap jumps over water
3. Crate yard + first TNT
4. Bounce pad up to the jungle ledge
5. Checkpoint totem 1
6. Log alley
7. Pillar hops over the pit
8. Plank bridge with TNT
9. Temple landing + checkpoint totem 2
10. Temple stairs + downhill logs
11. Final bonanza yard
12. Temple gate (the pay-off shot)

Physics baseline: the old `CFG` block (gravity 26, runSpeed 8.2, jumpVel
10.8, coyote 0.12 …) — proven feel, carried over into `src/game/cfg.js`.

## The rules every builder inherits

- Register every named place with `mark(name, obj)` as it is built.
- Register every framing with `addFraming(fn)` beside the beat it judges.
  Framings resolve from landmarks, never from written-down coordinates.
- Every random draw goes through `src/core/rng.js`. `Math.random()` in
  `src/` is a defect.
- All animation is keyed to the world clock that `review()` resets.
- Do not weaken `src/review/`. A build the instruments cannot drive cannot
  enter the loop.

## The round protocol

Every round, in order, no exceptions:

1. Build the increment. Commit.
2. `npm run build` — green.
3. `npm run det` — A/A bit-identical, A/B differs. Green.
4. `node tools/shots.mjs --dir shots/roundN` — no FAIL, no UNMEASURED.
5. A **fresh-context critic** judges `shots/roundN/CONTACT-SHEET.png`
   against `refs/proposed/` blind: it sees the goal, the refs, and the
   stills. Never builder rationale. It names the single biggest gap.
6. Measure the claim before obeying it (`tools/diff.mjs`,
   `tools/compare.mjs`, `?ablate=`).
7. Append the verdict to `docs/DELTA.md` (append-only rounds).

A round that breaks a gate is rejected before any critic sees it.
The loop ends when a critic cannot name a gap that the refs support.

## Round 1 scope — the vertical slice

Beats 1–3 (beach → water gaps → crate yard), playable:

- Island masses with modelled undersides — no floating slabs, ever,
  including in round 1.
- Water with depth grading, a shoreline band, and flow.
- Palms, ground cover, debris scatter — seeded, instanced.
- Designed crates (bevels, brackets, plank relief).
- Backdrop layers: sea, sea stacks, jungle mass, gradient sky.
- Hero capsule + full controller (run, jump, double jump, coyote, camera).
- Landmarks and five framings: `title-hero`, `beach-corridor`,
  `water-gap`, `crate-cluster`, `hero-closeup`.
- The stub `origin-*` framings retire; `tools/determinism.mjs` re-pins to
  `beach-corridor`.

Known round-1 debts, listed so no critic wastes a verdict discovering
them: the hero is a placeholder capsule (its workstream starts round 2+),
beats 4–12 do not exist yet, audio is deferred.

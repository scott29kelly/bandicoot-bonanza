# Architecture

## The one rule that shapes everything

**Players get one file. Builders get many.**

`index.html` at the repo root is a build product: one self-contained file a
player double-clicks, no install, no server. It is committed, so cloning and
opening it still works with no toolchain.

Source lives in `src/` as ES modules and is bundled by `tools/build.mjs`.

### Why not keep authoring one big file

The previous attempt was a single 358 KB `index.html`. It shipped, but it made
the Gauntlet Loop impossible to run properly: four builder agents improving the
hero, the gate, the vegetation and the backdrop in parallel would spend more
effort resolving conflicts in one file than they would on pixels. The loop's
whole economy depends on decomposing work into pieces that can be improved
independently, so the code has to decompose the same way.

The single-file *output* was never the problem. Only the single-file *source*.

## Layout

    src/
      core/      seeded rng, config, math, the frame clock
      render/    renderer, HDR pipeline, post chain, tonemap  ← ONE OWNER
      art/       toon ramp, materials, procedural textures     ← ONE OWNER
      world/     terrain, props, vegetation, water, gate       ← may fan out
      player/    controller, rig, animation                    ← may fan out
      game/      state machine, hud, audio                     ← may fan out
      review/    framings, the window.BB harness, perf hud
    tools/       instruments (see docs/QUALITY-BAR.md)
    docs/        the bar, the ranked delta list, this file
    refs/        reference imagery — gitignored, never redistributed

### Owner rules

`render/` and `art/` carry a **single owner, sequential passes only** rule.
Exposure, tonemap, fog, ambient and the toon ramp are one coupled system;
Claude-of-Duty's run made defects *worse* (60 → 66) by putting parallel agents
on coupled lighting, and a single owner then cut them 66 → 26. Everything else
may fan out.

## three.js

Modern three (0.18x) as an ES module from a pinned CDN, resolved through an
import map in the HTML shell. The previous build used r128 from 2021, which
predates three's colour-management overhaul — the single biggest source of the
"why is everything washed out" fight in that attempt.

esbuild bundles `src/` and leaves `three` external, so the output stays small
and the CDN copy is shared/cached.

## The harness is a contract, not an afterthought

`tools/*.mjs` drive the game through `window.BB`. Any build that cannot satisfy
this interface cannot be reviewed, and an unreviewable build cannot enter the
loop. It is implemented in `src/review/` before any art exists, and the stub
scene is shot with `tools/shots.mjs` to prove the instruments work on a build
whose output is known.

    window.BB.ready          boolean, set once the world is built
    window.BB.error          string | null, fatal errors surfaced not swallowed
    window.BB.seed           the active ?seed=N
    window.BB.stats          { frame, fps, ms, triangles, drawCalls, ... }
    window.BB.framings       [{ id, name, tests, fov }]
    window.BB.settle(n)      Promise, resolves after exactly n rendered frames
    window.BB.setFixedDt(dt) pin the timestep so n frames == n*dt, always
    window.BB.review(id)     compose one framing; returns what was applied
    window.BB.setPose(pose)  raw camera override
    window.BB.setUI(on)      hide DOM chrome for captures
    window.BB.perf(on)       the F3 stats overlay

Two properties of this interface are load-bearing and were learned the hard
way:

- **Seeded world.** Every random draw goes through one generator keyed off
  `?seed=N`. Two contact sheets are only comparable if the world underneath
  them is the same world.
- **Fixed timestep.** Without it, n settle frames advance the world by a
  different amount every run, and a pixel diff drowns in animation phase noise
  that has nothing to do with the change being judged.

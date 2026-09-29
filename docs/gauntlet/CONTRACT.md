# Gauntlet contract — Bandicoot Bonanza (GA-3 line)

Method: the evidence-driven Gauntlet Loop (adopted 2026-09-05, replacing
the round protocol in `docs/GA3-PLAN.md` §"The round protocol"). This
file is the contract and the acceptance ledger. Findings live in
`WORK-ORDERS.md`, the frozen critic prompt in `CRITIC-PROMPT-v1.md`,
reference provenance in `REFERENCES.md`, the handoff in `STATUS.md`.

## GOAL

A 3D jungle platformer in one HTML file: run, jump, collect fruit, break
crates, avoid TNT, cross water gaps, reach checkpoints, across the
original game's 12 beats. It should feel like a bright, chunky,
stylized AAA mascot platformer: readable platforms, a grounded hero,
lush dressing, chromatic light.

## QUALITY TARGET

Long term: `docs/QUALITY-BAR.md` (pillars A–F, numeric floors, banned
outcomes). A critic judging blind against the bar references cannot
name a gap the references support, in stills AND in ordinary play
captures, with gameplay rules working.

Next deliverable: see NEXT MILESTONE.

## REFERENCES

`REFERENCES.md`. `refs/proposed/*.jpg` (10) is the aspirational set; the
game-frame sets under `refs/crash|kena|ratchet|sackboy/` are style
references. Provenance is recorded per set; none are matched-composition
references, so they inform direction and cannot establish a controlled
A/B win on their own (method §6).

## NEXT MILESTONE (M2, opened 2026-09-10)

Make it a game: the three functional orders WO-F01..F03, ported from the
old game's rules (`origin/claude/aaa-visual-quality:index.html`) with the
physics `CFG` verbatim. Decision 2026-09-08 (Scott): gameplay rules
before the critic's top visual pick (WO-V06 + WO-R01, now M3's candidate).

Acceptance (all observable in a fixed-step scripted run,
`node tools/playtest.mjs`, AND in a real-input playtest by Scott):

1. Fruit (WO-F01): the count increments on contact with a fruit, the
   fruit disappears, and the HUD shows count / total.
2. Crates and TNT (WO-F02): a crate breaks when the hero lands on it
   (stomp, with `crateBounce`) or spins into it (`spinRadius`); its
   solid is removed so the hero falls through where it stood. TNT arms on
   stomp or spin, counts down `tntFuse` 2.2 s, then clears every crate
   within `tntRadius` 4.6 and costs a life if the hero is within
   `tntRadius` + 0.5.
3. Checkpoints (WO-F03): crossing a totem activates it (HUD label changes
   from START to TOTEM n). Falling into the water (below `killY`)
   respawns the hero at the last activated checkpoint with the fruit
   count kept and one life fewer; at zero lives the run resets.
4. Gates stay green: build, determinism (A/A bit-identical), shots.

Visual effects for these events (debris, sparks, flash, camera trauma)
are NOT in M2; they belong to the render/art owner and get their own
order (WO-F08).

## PREVIOUS MILESTONE (M1, opened 2026-09-05, closed 2026-09-08)

Establish the method's evidence loop on the accepted line:

1. A blind, randomized A/B packet of baseline vs candidate stills
   (`tools/packet.mjs`), mapping held outside the critic's reach.
2. One fresh critic run with the frozen prompt v1 on that packet:
   baseline round 28 (`d8ce837`, session start) vs candidate round 35
   (`154835c`).
3. Every critic tell recorded as a work order.
4. An ordinary-play capture added to the shot set (the follow camera,
   mid-corridor) so review is not hero-shot only.

Acceptance: the packet exists with a sealed mapping; the verdict is
recorded with A/B identities revealed only after; `WORK-ORDERS.md`
carries every tell; `shots/roundN` includes `play-camera`.

## CONSTRAINTS

- One file output (`index.html`, built by `tools/build.mjs`), zero
  external assets, three r0.184 via CDN import map (`src/shell.html`).
- Physics `CFG` verbatim from the old game (`src/game/cfg.js`).
- `render/` + `art/` are one owner; sequential passes only.
- Determinism gate (`npm run det`) and shot gate must stay green; never
  move a threshold to pass an artifact.
- Captures are SwiftShader/headless: correctness evidence, never
  performance evidence. Performance verdicts need a real GPU run.
- Git: commit each slice; never push without Scott's in-session
  go-ahead; never force-push; `origin/main` belongs to the other device.
- Budget: one builder, one milestone, one critic review, then handoff.
  Inside a milestone the builder may run the dream loop (below); its
  judge subagents do not count as the critic review.

## INNER LOOP (dream loop, adopted 2026-09-29 at the M2/M3 boundary)

Binding: `DREAM-LOOP.md`. Inside a milestone, the builder may close the
gap between one framing and one locked target image in small rounds,
scored by a fresh non-blind judge. It is builder evidence only:

- It never enters a packet, the critic prompt or `NOTE.md`.
- It never promotes a baseline or closes a work order.
- The constraints above win over any target image.
- A stalled dream loop counts as one attempt on its tactic.
- `CRITIC-PROMPT-v1.md` is unchanged.

## Acceptance ledger

| Gate | Behaviour / quality | Method | Runtime & settings | Evidence to pass | Status |
|---|---|---|---|---|---|
| G1 build | Bundle builds | `npm run build` | node 24 | green log | PASS r36 |
| G2 determinism | Seed governs world | `npm run det` | headless Chromium/SwiftShader, `?seed=` `?fixeddt=` | A/A bit-identical pair, A/B differs | PASS r36 |
| G3 stills | 6 framings render, no FAIL | `node tools/shots.mjs --dir shots/roundN` | 1280×800, settle 30 | sheet + sheet.json | PASS r36 |
| G4 ordinary play capture | Follow-camera frame mid-corridor | framing `play-camera` | as G3 | present in sheet | PASS (M1, `shots/round35/play-camera.png`) |
| G5 blind A/B | Candidate ≥ baseline, no regression | `tools/packet.mjs` + critic v1 | 5 pairs, neutral names | verdict A/B/tie per pair, mapping revealed after | RUN (M1, p01): candidate 3 / baseline 2, regressions WO-R01–R03 → not promoted. RUN (M2, p02): candidate r36 4 / baseline 1; WO-R01 persists, WO-R04–R06 new → "no regression" not met, baseline label stays r28; two straight candidate wins make r36 the baseline once WO-R01 closes |
| G6 target gap | Critic vs refs names no supported gap | critic v1 §B | as G3 | ranked list empty or unsupported | OPEN (long term) |
| G7 gameplay rules | fruit, crates, TNT, checkpoints, HUD | `node tools/playtest.mjs` (fixed-step scripted run, `?fixeddt=` + `?seed=`) + Scott's real-input playtest | headless Chromium; then a real browser | scripted run all PASS; checklist observed | SCRIPTED PASS (M2, 19/19 at 1a8e534); real-input playtest OWED (Scott) |
| G7a fruit | count increments on contact; fruit hides; HUD count/total | as G7 | as G7 | playtest.mjs `fruit` PASS | PASS scripted (M2) |
| G7b crates/TNT | stomp/spin breaks; solid removed; TNT fuse 2.2 s; radius 4.6 clears crates; hero hit costs a life | as G7 | as G7 | playtest.mjs `stomp`, `spin`, `tnt` PASS | PASS scripted (M2) |
| G7c checkpoints | totem activates; water fall respawns there; fruit kept; life lost | as G7 | as G7 | playtest.mjs `checkpoint`, `fall` PASS | PASS scripted (M2) |
| G8 real input | keyboard/gamepad paths drive the hero | manual playtest | real browser | observed | NOT STARTED |
| G9 performance | frame time p95 within budget | `?perf` on a real GPU | Scott's machine | p95 figure | NOT STARTED (headless cannot measure) |
| G10 audio | audible quality | listening checklist | real browser | recording | NOT STARTED (no audio yet) |

Known limits: shadow-map texel staircase at portrait range; the toon
gradientMap samples only its red channel (three r0.184), so ramp colour
never tints shade — the hemisphere light does.

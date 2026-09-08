# Status and handoff

Updated 2026-09-08 (session of 2026-09-05..08). Method adopted this
session; see `CONTRACT.md`.

## Where things stand

- Branch `claude/gauntlet-v2` in worktree
  `.claude/worktrees/elevenlabs-local-setup-dd4b2e`, local only, NOT
  pushed. Rounds 1–35 committed under the old protocol; M1 committed on
  top. `origin/main` (7a36b69) is the other device's Blender-asset line
  and shares no history with this branch.
- Accepted baseline for A/B comparison: **round 28 stills**
  (`shots/round28`, code `d8ce837`). Candidate reviewed: round 35
  (`shots/round35`, code `154835c`).
- All gates G1–G3 green at HEAD; G4 (play-camera capture) now PASS.

## M1 review — packet p01 (critic prompt v1, blind, randomized)

Mapping revealed after the verdict (`shots/_packets/p01.mapping.json`):

| Pair | Verdict | Winner | Confidence | Critic's evidence |
|---|---|---|---|---|
| beach-corridor | A | **candidate r35** | med | path reads as a path; sand sat 0.80 vs 0.67; palm shadow anchors foreground |
| crate-cluster | B | **candidate r35** | med | crates meet the sand with contact shading; grass no longer hides the lower row |
| hero-closeup | B | **candidate r35** | low-med | leafed fruit, third distance layer; hero itself near-identical |
| title-hero | B | **baseline r28** | low-med | more layered framing read on the r28 side; candidate "thinner colour" (sat 0.588 vs 0.647) |
| water-gap | A | **baseline r28** | med-high | candidate regression: sawtooth shadow edge (4–5 px steps) and a near-black rectangle where the composed palm's shadow crosses the platform bevel; yellow hatch bands on the sea stack |

Net: candidate 3, baseline 2. Mixed → not promoted wholesale (method
§12). Disposition: the two regressions become WO-R01 and WO-R02; the
baseline label stays at round 28 until a re-review shows no regression
on those pairs. The candidate code remains HEAD (it is the working
line); "accepted" is a comparison label, not a revert.

Critic-identified sources (recognition recorded, method §8): form-1..6
= Crash Bandicoot N. Sane Trilogy; light-1 = Ratchet & Clank: Rift
Apart; light-2 = Kena: Bridge of Spirits; light-3/4 = Sackboy: A Big
Adventure; all high confidence. So the references are official game
frames, not generated — `REFERENCES.md` updated. The packet is
therefore not fully blind to a critic who knows those games.

Rubric (packet-wide, A/B): character 5/5 · props 5/6 · dressing 5/6 ·
vegetation 4/4 · light 5/5 · colour 6/5 · water 5/5 · backdrop 5/5 ·
motion UNMEASURED · composition 5/6 · performance UNMEASURED (the
packet NOTE printed "?" for counts — `tools/packet.mjs` reads the wrong
sheet keys; fixed in WO-T01).

Highest-impact next improvement named by the critic: key-to-fill ratio
on ground and props to ~2.5–3:1 with saturated shade, together with a
shadow-edge fix so the stronger shadow does not expose the sawtooth.
This matches WO-V06 + WO-R01 and is M2's candidate.

## Verdict separation (method §11)

- Visual quality: mixed win, see table. Whole-frame gaps unchanged
  (WO-V01..V04).
- Interaction/gameplay: NOT REVIEWED — no rules exist (WO-F01..F03).
- Motion/camera: NOT REVIEWED (stills only).
- Audio: none.
- Performance: UNMEASURED on a real GPU (WO-F07). Headless tri/draw
  counts: 533k–608k / 240–345.
- Correctness: determinism gate green (A/A bit-identical, A/B differs).
- Packaging: single `index.html` builds; not run as a release on a
  real browser this session (G8).

## Launch / inspect

```bash
npm run build
```
Open `index.html` in Chrome (`start chrome index.html`). URL params:
`?seed=` `?fixeddt=` `?minfx` `?ablate=grade` `?perf`. Captures:
`node tools/shots.mjs --dir shots/X`. Blind packet:
`node tools/packet.mjs --base shots/round28 --cand shots/X --out shots/_packets/pNN --seed N`.

## Next milestone proposal (M2)

Pick ONE: (a) WO-V06 + WO-R01 — form step and shadow edge (the
critic's top pick; render owner, measurable by face-turn ratio and an
edge-step count); or (b) WO-F01..F03 — gameplay rules (functional
blockers the method ranks above polish). Recommendation: (b) first,
because no review to date has covered the game as a game, then (a).

## Manual actions needed from Scott

1. Push: `git push -u origin claude/gauntlet-v2` (non-destructive) —
   not done; needs your go-ahead.
2. Decide the two-line question: adopt the Blender `hero.glb` from
   `origin/main` into this line (WO-V03's stalled tactic), or not.
3. A real-browser playtest for G7/G8 and a `?perf` run for G9.

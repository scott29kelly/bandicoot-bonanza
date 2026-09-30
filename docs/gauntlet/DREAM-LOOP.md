# Dream loop — the inner loop (adopted 2026-09-29, at the M2/M3 boundary)

The Gauntlet Loop is the outer loop: one milestone, gates, one blind
critic, work orders, handoff. The dream loop is the inner loop: inside a
milestone, it closes the gap between ONE framing and ONE target image in
small rounds. Skill: `~/.claude/skills/dream-loop/SKILL.md` (bespoke;
idea from github.com/achimala/dream-loop, nothing installed from it).

This file binds the skill to this project. Where they differ, this file
wins. Where this file and `CONTRACT.md` differ, the contract wins.

## Why it fits

The references in `refs/` are not composition-matched, so they cannot
establish a win (`REFERENCES.md`). A dream target is generated FROM our
own still, so it IS composition-matched: same camera, same layout. It
gives the builder a concrete picture to build toward between critic
reviews.

## Roles — keep them apart

| | Dream judge (inner) | Gauntlet critic (outer) |
|---|---|---|
| Sees | target + live capture | blind A/B packet + refs |
| Blind | no | yes |
| Prompt | the brief in the skill | `CRITIC-PROMPT-v1.md`, frozen |
| Runs | every inner round | once per milestone |
| Output | score /10 + gap list | verdict per pair + tells |
| Counts as | builder evidence | acceptance evidence (G5) |

Rules:

1. A dream target, a dream verdict or a dream score NEVER enters a
   packet, the critic prompt or `NOTE.md`.
2. A dream score never promotes a baseline and never closes a work
   order. Gates and the blind packet do.
3. Every gap the dream judge names that is still open when the loop
   stops becomes a work order (source "dream judge").

## Scope per milestone

- The milestone names the framings and the work orders the dream loop
  serves. M3: `water-gap` (WO-R01), `crate-cluster` (WO-V06),
  `hero-closeup` (WO-V12, WO-V11).
- One framing at a time. Finish or stall one before the next.
- `render/` + `art/` stay ONE owner, sequential passes only.

## Files

`.dream-loop/` at the worktree root, gitignored.

```
.dream-loop/<framing-id>/baseline.png   the still the target was made from
.dream-loop/<framing-id>/target.png     locked; never regenerated mid-loop
.dream-loop/<framing-id>/target.md      prompt, tool, date, work orders
.dream-loop/<framing-id>/rNN/live.png   capture of round NN
.dream-loop/<framing-id>/rNN/verdict.md judge output, score
```

## Target

- Baseline: the latest gated still of that framing (now
  `shots/round36/<id>.png`).
- Direction: the work order text and its measurements. Nothing else.
- Must keep: camera, layout, hero pose, prop positions, HUD hidden.
- Must not ask for: anything the contract bans or cannot ship (see
  Overrides). A target that needs photoreal textures or a new hero model
  is a bad target; regenerate it before the loop starts.
- Image generation sends our still to an outside service. Scott
  approved on 2026-09-30 that Claude makes the targets with the image
  tools connected to the session. Use the image-EDIT path with the
  baseline as the reference (upload the still, then edit it), one
  variation, and run the cost estimate first when the tool offers one.
  Prefer a model built for editing an existing image
  (gemini-3-pro-image or gpt-image-2 on the creative-flow connector;
  Canva generate-image with imageReferences is the fallback). Record the
  tool, model and prompt in target.md.

## Round

```bash
npm run build
node tools/shots.mjs --only <framing-id> --dir .dream-loop/<framing-id>/rNN
```

Then rename the still to `live.png`, judge, fix, check the exit rules.
Round cap: 5 per framing per milestone.

Measure the work order's own number every round (face-turn ratio, belly
ratio, band V, edge step). The number decides; the judge's score guides.

## Tactic counting

The contract's limits still apply. One stalled dream loop (no gain of 1
point in 2 rounds, or the same gap named twice) counts as ONE attempt on
that tactic in `WORK-ORDERS.md`. Ended tactics stay ended.

## Overrides of the upstream idea

| Upstream | Here |
|---|---|
| Match the target to the pixel | Match direction and measurements. The contract, the banned outcomes and the det gate win over the target. |
| Image-to-3D services, downloaded assets | Not allowed. Contract: one file, zero external assets. |
| Generated textures and normal maps | Not allowed without Scott's decision. Textures are procedural (`src/art/materials.js`). |
| Blender models | Open question (hero.glb). Not part of the dream loop. |
| Its own preview server and capture endpoint | `tools/shots.mjs` and `window.BB`. |
| Orchestrator hands all building to subagents | The builder builds. Only the judge is a subagent. |

## End of milestone

Full gates (`build`, `det`, `shots`, `playtest`), then the blind packet
and ONE critic as before. Report dream rounds and scores in `STATUS.md`
under their own heading, apart from the critic's verdict.

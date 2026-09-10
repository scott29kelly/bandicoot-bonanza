# Status and handoff

Updated 2026-09-10 (session of 2026-09-10). M2 built, gated, reviewed;
see `CONTRACT.md` for the acceptance ledger.

## Where things stand

- Branch `claude/gauntlet-v2` in worktree
  `.claude/worktrees/elevenlabs-local-setup-dd4b2e`. Pushed through
  3e10c8c on 2026-09-08 (Scott approved). Commits since are LOCAL ONLY
  and need an in-session go-ahead: 793b081 (M2 opened), 1a8e534 (M2
  rules), plus this handoff commit.
- `origin/main` (ac912bf on 2026-09-10) is the other device's line and
  shares no history with this branch. Never merge, never push there.
- Accepted baseline for A/B comparison: still **round 28 stills**
  (`shots/round28`, code `d8ce837`). Candidate reviewed this milestone:
  round 36 (`shots/round36`, code `1a8e534`).
- Gates at HEAD: build PASS; det PASS (A/A bit-identical in 2 boots,
  A/B 78.96% moved); shots 6/6 PASS (tris 534k–610k, draws 249–354);
  `node tools/playtest.mjs` 19/19 PASS.

## M2 — gameplay rules (WO-F01..F03), commit 1a8e534

What exists now (all rules ported from the old game, `CFG` verbatim):

- `src/game/rules.js`: fruit pickup (d² < 1.35 at the hero centre,
  pos.y + 0.8); crate break on stomp (hero bounces at `crateBounce`) or
  spin (`spinRadius` 2.35, Shift or K, `spinDur`/`spinCd`); TNT arms on
  stomp or spin, pulses, explodes after `tntFuse` 2.2 s, clears crates
  within `tntRadius` 4.6, chains TNT at 0.25 s, costs a life within
  radius + 0.5; checkpoint totem activates on a z-line crossing;
  falling below `killY` costs a life and respawns at the last totem
  (fruit kept); zero lives resets the run. No random draws in rules.
- `src/game/hud.js` + HUD boxes in `src/shell.html` (fruit / total,
  crates / total, lives, CHECKPOINT: START | TOTEM n). Inside `#ui`,
  so `BB.setUI(false)` hides it for captures.
- `src/player/hero.js`: hooks `onLand(solid) → 'bounce'`, `onSpin`,
  `onFall`; solids carry `dead` (skipped) and `ent` ({type, obj});
  `respawnAt(p)`; spin pose (two turns, arms out).
- `src/world/beach.js` exposes `fruit` (pos, alive, hide, reset),
  `crates`, `tnts`, `checkpoints`; the totem (`makeCheckpoint` in
  props.js) is built LAST with no random draws, so the seeded scatter
  did not move (det gate confirms).
- `tools/playtest.mjs` (`npm run play`): fixed-step scripted run that
  drives the hero with synthetic key events via `BB.place` / `BB.game`
  (new harness seams, documented in ARCHITECTURE.md). 19 checks.
- Evidence still: `shots/round36/playtest-hud.png` (HUD after the fruit
  row: 5 / 12, 0 / 10, × 3, CHECKPOINT: START). `shots/` is gitignored.

Deviation from the handoff plan: the three orders landed as one commit,
not three, because the hero hook seam served all three at once.

## M2 review — packet p02 (critic prompt v1, blind, randomized, seed 2)

Mapping revealed after the verdict (`shots/_packets/p02.mapping.json`):

| Pair | Verdict | Winner | Confidence | Critic's evidence |
|---|---|---|---|---|
| title-hero | A | **candidate r36** | med | sat 0.648 vs 0.588; luma std 0.181 vs 0.176; sand/grass separation held; totem gem + post read as a far accent |
| hero-closeup | A | **baseline r28** | low-med | hero identical; candidate hides shins/boots under a grass tuft (400–560, 520–800) and the totem intrudes at the right edge (1200–1280, 240–330) |
| beach-corridor | A | **candidate r36** | med | path legible: sand 74% vs 61% of the bottom third |
| crate-cluster | B | **candidate r36** | med-low | crate bases and feet on visible sand with contact shadow; lit/shade split; against it 78% bare sand and a striped bush underside |
| water-gap | A | **candidate r36** | low | framing layer and dapple present; against it the WO-R01 near-black band (V 0.067, 848/2275 px < V 0.12) and 4–6 px shadow steps |

Net: candidate 4, baseline 1 (p01 was 3 / 2). G5 asks for "no
regression"; WO-R01 persists and WO-R04–R06 are new, so the baseline
label stays r28. Two straight candidate wins: r36 becomes the baseline
once WO-R01 closes (M3's candidate).

Prompt deviation recorded: one factual line naming the project directory
was prepended so relative paths resolved in the right worktree (the
subagent starts in another worktree). Nothing else was added.

Correction to the M1 record: WO-R03 ("candidate thinner colour") is
withdrawn. Builder-measured mean saturation: title-hero r28 0.588, r35
0.647, r36 0.648. The p01 critic attached the numbers to the wrong side.

The critic again inferred the build split from tri counts and shared
features (§7 of its report) — the packet is blind by name only when the
two builds differ this much. Recognition of reference sources: same as
M1 (Crash N. Sane Trilogy, Rift Apart, Kena, Sackboy), all high.

Rubric (packet-wide, A/B as the critic labelled them, NOT per build):
character 5/5 · props 5/5.5 · dressing 5/5 · vegetation 4.5/4.5 ·
light 5/5 · colour 5/4 · water 5/5 · backdrop 5/4.5 · motion UNMEASURED
· composition 6/4.5 · performance 8/8.

Highest-impact next improvement named by the critic: hero form lighting
(belly ratio 0.92 → ≈0.55) plus deeper contact occlusion under the feet
(≤0.4 of lit sand). Filed as WO-V12 + WO-V11; it is WO-V06's tactic
applied to the hero. Runner-up: leaf-frond geometry for the hill mass
(WO-V02).

## Verdict separation (method §11)

- Visual quality: candidate 4 / 1, not promoted (regressions open).
  Whole-frame gaps unchanged (WO-V01..V04); new WO-V09..V12.
- Interaction/gameplay: SCRIPTED PASS (19/19, fixed step, headless).
  Real-input playtest by Scott NOT DONE (G7/G8). Rules fire with no
  effects (WO-F08); death is instant (WO-F10).
- Motion/camera: NOT REVIEWED (stills). Respawn camera lerp WO-F12.
- Audio: none.
- Performance: UNMEASURED on a real GPU (WO-F07). Headless counts
  534k–610k tris / 249–354 draws, within QUALITY-BAR floors.
- Correctness: det gate green; playtest replays exactly.
- Packaging: single `index.html` builds (68.2 KB bundle).

## Launch / inspect

```bash
npm run build
```
Open `index.html` in Chrome (`start chrome index.html`). Controls:
arrows/WASD move, Space jump (double jump), Shift or K spin, F3 perf.
URL params: `?seed=` `?fixeddt=` `?minfx` `?ablate=grade` `?perf`.
Captures: `node tools/shots.mjs --dir shots/X`. Scripted run:
`node tools/playtest.mjs [--shot shots/X/hud.png]`. Blind packet:
`node tools/packet.mjs --base shots/round28 --cand shots/X --out shots/_packets/pNN --seed N`.

## Next milestone proposal (M3)

WO-V06 + WO-R01 (form step on ground/props/hero and the shadow-edge
fix), the critic's top pick in both reviews, now with WO-V12's belly
ratio as the measurement. Render/art owner, sequential passes only.
Small fixes that ride along without a tactic count: WO-R04 (totem out
of hero-closeup), WO-R05 + WO-L18 (avoid discs at framing player
positions), WO-F12 (camera snap on respawn).

## Manual actions needed from Scott

1. Push go-ahead for 793b081..HEAD on `claude/gauntlet-v2` (not done).
2. Real-input playtest (G7/G8): run the corridor, collect the fruit row,
   stomp and spin the first crates, arm the TNT and run clear, cross
   the totem, fall in the water once. Report anything that does not
   match CONTRACT §M2.
3. `?perf` run on a real GPU for G9 (p95 frame time).
4. Still open: adopt the Blender `hero.glb` from `origin/main` or not
   (WO-V03's geometry tactic).

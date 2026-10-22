# Status and handoff

## 2026-10-20 — authored-asset line, self-paced loop (READ FIRST)

- Branch `claude/m3-authored-assets` in the `main` checkout. PUSHED
  2026-10-20 (Scott's go-ahead) as its own branch at `a4a7c77` — not main.
  The repo is PUBLIC: rounds 38-43 were squashed into one commit before the
  push so the interim Crash-like hero is not published. The unsquashed
  history is LOCAL ONLY on `backup/m3-full-history` — never push it.
- Scott's decisions: zero-asset rule lifted (authored GLBs, must win a
  blind A/B); self-paced `/loop` rounds until he stops it; visuals first,
  then gameplay. Cadence: `CONTRACT.md` §OUTER CADENCE.
- Pipeline: `pipeline/gen.py` (ComfyUI must be open) -> `prep.py` ->
  `rig.py` (characters). Blender: `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`.
  Provenance: `ASSETS.md`.
- r37 sea stacks GLB; r38 rigged hero GLB; r39 jungle canopy (bush + tree GLBs, instanced). Self-review kept all. The
  blind packet is owed at r40 (baseline r36 code `1a8e534`, or
  `?ablate=assets` on the candidate build for an asset-only A/B).
- r40 BLIND PACKET p03 (base 3a1406f stills vs r39, seed 40): candidate
  6 / 0. Regression WO-R07 (outline fringe) blocks promotion; r39 is the
  baseline once it closes. Critic's top pick: WO-V13 value hierarchy.
  Every tell filed (WO-R07, V13–V17, A08–A12, T02, L20, X01).
- DECIDED (Scott, 2026-10-20): no trademark/copyright conflict. The hero
  becomes Scott's black cat (the yard-warz cat; refs in `refs/cat/`,
  notes `yard-warz/main/docs/CAT_NOTES.md`). r43 built it: the cat is
  the hero; the bandicoot GLB is removed.
- r42: value hierarchy (grade edge falloff, deeper canopy) WO-V13 partial.
- r44 BLIND PACKET p04 (r39 vs r43, critic v1): baseline 5 / candidate 1.
  Only the hero and the r42 edge grade differ. The cat lost on character
  fidelity judged against Crash frames; the hero change is Scott's IP
  decision and stays. The grade is a "small, real gain" and stays. Real
  cat defects filed: WO-A16 legibility (near-black), A17 rim halo, A14
  hip plate, A13 whiskers. Top pick: WO-V18 layered jungle dressing.
- METHOD CHANGE at the r44 boundary: CRITIC-PROMPT-v2.md — character is
  judged against `refs/cat/` (Scott's photos); stale sea-stack fact
  dropped. packet.mjs copies refs/cat. Use v2 from r48 on.
- r45: cat charcoal lift (A16, body L p50 0.12→0.18), rim 0.22× (A17),
  smooth arm-weight ramp; hip plate (A14) is an internal sheet, open.
- r46: big-leaf shore plants + distance LOD kept; two instanced-fill
  tactics for the bare hill skin reverted (shards, haze). Next tactic:
  a canopy texture on the ridges.
- r47: canopy texture on the ridge skin (WO-V18 tactic 3) — the flat
  green hills read as jungle; measured std up 1.4–14×.
- r48 BLIND PACKET p05 (r43 vs r47, critic v2): candidate 6 / 0; the
  canopy texture wins every frame. Regression WO-A20: the cat reads
  olive-brown (r45 lift + warm tint) — blocks promotion; r47 becomes the
  baseline once it closes. Top pick: neutral cool-black fur (WO-A20/A21).
- r49: neutral black cat (WO-A20: chroma 0.41 → 0.01, eyes keep hue),
  edge-only rim (A21). If it holds, r47+r49 becomes the baseline.
- r50: whiskers lose the outline (A13); the stride plate is a generator
  membrane — culling sandwiched faces shrank it; STALLED, next tactic is a
  cat concept with arms clear of the body.
- r51: cat re-concept with the arms clear of the body (`cat4-s88`): the
  stride plate is gone; soften blur and sheet culling off (seam lines).
- r52 BLIND PACKET p06 (r47 vs r51, critic v2): candidate 5 / 0 / tie 1.
  PROMOTED: r51 `c356def` is the ACCEPTED BASELINE (first promotion since
  r28). Deviation: one local regression (pupils, WO-R08) filed P1.
- r53: slit pupils + catchlights as geometry on the head bone (the baked
  iris had no pupil); eye zone and ear skin spared from the fur pass.
- r54: tail taper — two tactics failed (curl defeats a local shrink;
  bone scale tore the root); all reverted, WO-A27 STALLED → re-concept.
- r55: island skirts tactic 1 (free-standing boulders) reverted — they
  read as stepping stones. Next tactic: a strata texture on the skirt.
- r56: sea lowered 0.7 m (WATER_Y −1.25) — islands stand on rock plinths.
  The r56 packet was deferred to r57 (only r53 had landed since r52).
- r57 BLIND PACKET p07 (r51 vs r56, critic v2): candidate 4 / 2. Pupils
  win the hero frames; the lower sea wins water-gap but LOST the shore
  foam (WO-R09) — not promoted. Top pick: lift the jungle (WO-V23).
- r58: foam rings follow the lower waterline (WO-R09): surf breaks on
  the cliff feet again.
- r59: jungle canopy lifted (WO-V23): foliage mean +0.016 to +0.046 L.
- r60: slim-tail cat (`cat5-s88`) is the hero: raised slim tail, slit
  pupils, pink-brown ears; rig.py eye detection generalised.
- r61 BLIND PACKET p08 (r51 vs r60, critic v2): candidate 4 / 2. The face
  (pupils, ears) and the lifted canopy win; water-plane SEAMS (WO-R10,
  likely r58's larger foam rings) lose water-gap and play-camera — not
  promoted. Top pick: hero fur shading + face colours (A33, A34).
- r62: water seams fixed (WO-R10): soft inner foam edge, original band
  width, offset scaled by island size.
- r63: hero fur sheen + stronger rim (A33), face colours to the photos
  (A34); screenshot timeout 120 s (WO-T04 flake).
- r64: far-shore kerb softened (L30), stray lime leaf cards removed (L26).
- r65 BLIND PACKET p09 (r51 vs r64, critic v2): candidate 4 / 2.
  PROMOTED: r64 `3f9da05` is the ACCEPTED BASELINE (second promotion).
  Deviation: two soft regressions filed P1 (R11 coat slate at range, R12
  lifted darks). Top pick: the ground plane (WO-V28).
- r66: worn path + stronger sand macro (V28 tactic 1, partial: sand sd
  0.052 → 0.063 vs target 0.12); next ground tactic is a sand texture.
- r67: coat warm black at range (R11), darks deeper (R12).
- r68: sand detail texture (ripples, pebbles) on the beach (V28 tactic 2).
- r69: the powder keg (Scott's pick B) replaces the TNT crate.
- r70 BLIND PACKET p10 (r64 vs r69, critic v2): BASELINE 6 / 0. The sand
  went darker/orange and merged with the crates (WO-R13, r66/r68), and
  the keg reads as a hole in the crate wall (R14). Not promoted.
- r71: sand back to golden (R13): level and hue near r64, breakup kept.
- r72: keg presentation (R14) partial: keg 1.26x crate height, lid fuse
  spark + glow, solid top raised. Reads as a barrel in the crate row; in
  crate-cluster the front crate still hides most of it. Playtest 19/19.
- r73: hero fur near-black (A33).
- r74 BLIND PACKET p11 (r64 vs r73, critic v2): BASELINE 4 / 2. The
  near-black fur won both hero pairs; the keg lost every pair it is in
  (R14), and the r73 tint dulled the face colours (R15). Not promoted.
- r75: face colours back (R15): fur-only dark tint (`tintFace`).
- r76: keg out of the slot (R14): 1.2 m in front of the row, upright, skull
  to camera, soft flame sprite. Playtest 19/19.
- r77: hero separation at range (A40): sheen fade floor 0.75; ΔL 0.080.
- r78 BLIND PACKET p12 (r64 vs r77, critic v2): BASELINE 3 / 1 / 2 ties.
  The hero won the close-up (med-high). Losses: the r76 keg move re-rolled
  the dressing (sticks at the hero's feet, R16), and the keg's texture is
  torn at 3x with no hazard read at range (R14). Not promoted.
- r79: dressing back to r64 exactly (R16): rng-stable avoid + sink().
- r80: keg rebuilt in code (R14): staves, iron hoops, red band, white skull.
- r81: sand level up (x1.07) and stains fainter (V32); V33 breakup by
  value noise FAILED (sd unchanged) — next tactic is structure (debris
  drifts, path edges). The x=640 vertical seam (L24) is visible in r64-r81.
- r82 BLIND PACKET p13 (r64 vs r81, critic v2): CANDIDATE 5 / 0 / 1 tie.
  PROMOTED: r81 `a4b70f7` is the ACCEPTED BASELINE (third promotion). Won
  on the warm-black coat and the code-built keg; no candidate-only defect.
  Top pick: designed jungle leaf clusters (V34/V02).
- r83: canopy "impostor square" (V37) = bare ridge skin; hash-placed
  low-poly gap-fill clumps cover most of it (+470k tris).
- r84: jungle wall (V34) tactic 1: bigleaf on the upper flank, lit crowns
  brighter (canopy lum 0.196 -> 0.213). 4.0M tris.
- r85: sand hue toward the ref path (V39): sat 0.79 -> 0.59-0.64, L +0.05.
- r86 BLIND PACKET p14 (r81 vs r85, critic v2): CANDIDATE 6 / 0.
  PROMOTED: r85 `18b71ea` is the ACCEPTED BASELINE (fourth promotion). The
  banana crowns and the paler sand won every pair. Top pick: matte fur
  re-shade of the hero (A36, A43 rim spike).
- r87: hero rim capped (A43): edge spike 0.81 -> 0.57; separation 0.071.
- r88: sunlit lane down the corridor (V40): highlight share about x2.
- r89: ridge canopy texture posterised to two painted tones (V41).
- r90 BLIND PACKET p15 (r85 vs r89, critic v2): BASELINE 6 / 0. The r89
  posterised jungle read as a camouflage card (R17); the r87 rim cap read
  as a weaker rim (R18); the r88 lane helped hierarchy but desaturated.
  Not promoted; r85 stays. Top pick: hero sheen to neutral satin fur.
- r91: reverted r89 jungle (R17) and r87 rim cap (R18); lane golden
  (strip sat 0.54 -> 0.62).
- r92: hero sheen warm-neutral (A36): chest sat 0.32 -> 0.06.
- r93: grass banks along the path shoulders (V33), on a forked rng stream.
- r94 BLIND PACKET p16 (r85 vs r93, critic v2): CANDIDATE 4 / 1 / 1 tie.
  PROMOTED: r93 `15e8302` is the ACCEPTED BASELINE (fifth promotion). The
  golden lane + path-edge grass won the wide shots; the bank grass crowds
  the tail in hero-closeup (R19, soft). Top pick: hero shading (A45).
- r95: bank grass kept off the close-up hero spot and camera (R19).
- r96: warm-brown black fur base (A45): tint (0.72,0.46,0.26).
- r97: twigs lie flat (L37), same rng draws.
- r98 BLIND PACKET p17 (r93 vs r97, critic v2): CANDIDATE 1 / 0 / 5 ties.
  PROMOTED: r97 `06ca7ad` is the ACCEPTED BASELINE (sixth promotion).
  Top pick: massed clumps of tapered blades (L43).
- r99: tapered double-blade grass tufts (L43), same rng draws.
- r100: ghost pupil filled in the hero texture (A39); contact-AO tactic
  failed and was reverted (V42).
- DECIDED (Scott, 2026-10-22): the hero look is option 6 — brass goggles +
  canvas explorer backpack (assets-raw/adv6/concept.png). Game title DECIDED
  2026-10-22: Whisker Trek (page title + VO script renamed; the baked VO
  clip still says the old name until the audio pack is regenerated).
- Next: r101 L39 platform bed edges, r102 BLIND PACKET (base r97). (done r80) R14 keg texture/hazard read,
  r81 V33 sand, r82 BLIND PACKET. (done r76) R14 keg
  (out of the slot, sharper decal, flame sprite), r77 A40/A36, r78 BLIND
  PACKET. Pending Scott:
  the adventurer look (goggles + scarf/bandolier/vest/neckerchief), game name.
- (done r67) coat value + darks (R11, R12),
  r68 ..., r69 BLIND PACKET. Later: (done r64) hero shading + face colours
  (A33, A34), r64 ..., r65 BLIND PACKET. Later:
  lift (V23), r60 slim-tail cat (staged in assets-raw/cat5, A27), r61
  BLIND PACKET.
- 2026-10-21 Scott: (1) propose small cat accessories — four concepts made
  (bandana, goggles, collar+compass, satchel), awaiting his pick; (2) keep
  Crash-like elements only where IP-safe — builder read: rename the game
  (HIGH), restyle the TNT crate (MEDIUM), keep crates/fruit/totem (LOW).
  Awaiting his pick of a new name and a TNT restyle.
- (superseded) DECISION OWED BY SCOTT: WO-X02 — other Crash-like trade dress (title,
  X-crates, TNT, spin-fruit). Keep, or restyle and rename?
- r41: hero outline from smoothed normals (WO-R07), fur softened in
  rig.py (WO-A08), narrower rim (WO-A10), unused maps stripped (WO-A05).
- Next: r42 WO-V13 (value
  hierarchy, render owner), then palms/crates (staged in assets-raw/), island skirts/slabs (pillar D),
  palms (WO-L07), crates/TNT/totem/fruit, then gameplay WO-F08/F10/F11.


Updated 2026-09-10 (session of 2026-09-10). M2 built, gated, reviewed;
see `CONTRACT.md` for the acceptance ledger.

## Where things stand

- Branch `claude/gauntlet-v2` in worktree
  `.claude/worktrees/elevenlabs-local-setup-dd4b2e`. Pushed through
  9b9f2d9 on 2026-09-30 (Scott approved). Also pushed as `main`.
- 2026-09-30: `main` was REPLACED by this line (Scott's decision). The
  old Blender-asset main (e7db21f, 26 "Pass" render commits, hero.glb)
  is archived at `origin/archive/blender-line`; a stray commit from an
  OpenCode session is at `origin/feature/gameplay-systems` (1b3e71a).
  Push both branches together from now on. No other checkout had
  unpushed work (Scott checked every device).
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

## Method change — dream loop adopted (2026-09-29)

Scott's decision: run the dream loop inside the Gauntlet Loop for small,
granular visual passes. Set up, NOT yet run. See `DREAM-LOOP.md` and the
INNER LOOP section of `CONTRACT.md`. Skill (bespoke, hand-written):
`~/.claude/skills/dream-loop/SKILL.md`. `.dream-loop/` is gitignored.

Targets: Scott approved (2026-09-30) that Claude makes them with the
connected image tools, image-edit path from our own still. See
DREAM-LOOP.md §Target. He can still supply a target himself.

## Next milestone proposal (M3)

WO-V06 + WO-R01 (form step on ground/props/hero and the shadow-edge
fix), the critic's top pick in both reviews, now with WO-V12's belly
ratio as the measurement. Render/art owner, sequential passes only.
Small fixes that ride along without a tactic count: WO-R04 (totem out
of hero-closeup), WO-R05 + WO-L18 (avoid discs at framing player
positions), WO-F12 (camera snap on respawn).

## Manual actions needed from Scott

1. Push: done 2026-09-30 through 9b9f2d9. Further pushes need a go-ahead.
2. Real-input playtest (G7/G8): run the corridor, collect the fruit row,
   stomp and spin the first crates, arm the TNT and run clear, cross
   the totem, fall in the water once. Report anything that does not
   match CONTRACT §M2.
3. `?perf` run on a real GPU for G9 (p95 frame time).
4. Still open: adopt the Blender `hero.glb` from `origin/archive/blender-line` or not
   (WO-V03's geometry tactic).

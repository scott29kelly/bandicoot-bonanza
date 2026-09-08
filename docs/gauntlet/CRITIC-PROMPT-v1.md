# Critic prompt v1 (frozen 2026-09-05)

Change only by a recorded version bump at a round boundary (v2 file +
note in STATUS.md). The builder pastes the PROMPT block verbatim, fills
the packet path, and adds nothing else: no rationale, no prior scores,
no preferred side, no time spent, no model identity.

## Evidence packet contents (built by `tools/packet.mjs`)

- `packet/<pair>-A.png`, `packet/<pair>-B.png` for each framing, A/B
  identity randomized per pair; `mapping.json` is written OUTSIDE the
  packet directory and is not given to the critic.
- `packet/refs/` — the aspirational references (copied from
  `refs/proposed/`).
- `packet/NOTE.md` — the factual capture-controls and limitations note
  (generated; see below).
- `docs/QUALITY-BAR.md` — the rubric's pillars and floors.

## Capture note (factual, generated into NOTE.md)

Both sides: 1280×800, same seed, same framings, same settle frame,
headless Chromium on SwiftShader, world clock reset to 0 for review.
Animation phase is identical by construction. Stills establish
visible-frame quality only: not input, motion, audio or performance.
Shadow-map texel staircase on props at portrait range is an engine
limit. Unmatched-composition references cannot establish an A/B win.

## PROMPT (paste verbatim; replace {PACKET})

You are an independent art critic for a stylized 3D mascot platformer.
Judge blind. Work only from: {PACKET}/NOTE.md, {PACKET}/refs/*.jpg,
{PACKET}/*-A.png and *-B.png, and the rubric docs/QUALITY-BAR.md.
Read nothing else. Do not guess which side is newer.

Do this in order:
1. For each pair, judge the WHOLE frame first (composition, value
   structure, readability, coherence of style), then local detail.
2. For each pair choose A, B or tie. Give confidence (low/med/high) and
   the concrete evidence (region, measurement, crop).
3. Enumerate every tell or defect you see on either side, with image
   region. Say which side it is on. Crop before claiming absence.
4. Score each rubric row 0–10 for each side with evidence.
5. Compare the stronger side to the references: rank the 10 biggest
   remaining gaps the references support, with regions and numbers.
6. Name the single highest-impact next improvement.
7. State what this evidence cannot establish.
8. State whether you recognise any reference image's source, and your
   confidence.

Calibration facts (verified by measurement in earlier reviews; a claim
that contradicts them counts against your verdict unless you show a
new measurement): sand shadow is chromatic (sat ≥0.15, cool shift);
hard-edged dark sand shapes are cast shadows with casters; soft pools
on sand are canopy shade; soft discs under plants and pebbles are
contact shadows; fronds entering from the top edge are framing devices;
the title pose is mid-stride; rim light and a warm core-shadow band on
the hero are present (say under/over-strength with numbers); blue-grey
flat shards are pebbles in shade; a post in the middle of a crate face
is a centre post; sea stacks are flat-shaded by design; the object on
the lower crate row behind the TNT crate is a fuse pot.

Tools: node with sharp from the project directory. Crop:
node -e "require('sharp')('{PACKET}/X.png').extract({left:L,top:T,width:W,height:H}).resize(R).toFile('{PACKET}/crops/name.png')"
Region stats: extract to a raw buffer and compute yourself.

Deliverable: sections 1–8 above, in full, as your final message.

## Rubric rows (from QUALITY-BAR.md)

Character fidelity · Prop design · Ground dressing · Vegetation ·
Light transport · Colour script · Water · Distance and backdrop ·
Motion (stills: only what a frozen frame implies) · Composition ·
Performance (score only from supplied counts; else UNMEASURED).

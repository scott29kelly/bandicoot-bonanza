# Paste this prompt to Claude

Continue Bandicoot Bonanza in `C:\Users\scott\Documents\repos\games\bandicoot-bonanza\main`. Read the evidence packet in `docs/playtests/2026-10-18-codex/`, starting with README.md and PLAYTEST-REPORT.md. Open the actual linked screenshots, then consult ROUTE-REPORT.md, CHECKS-REPORT.md and INDEPENDENT-CRITIQUE.md. SCREENSHOT-GALLERY.html provides a local image index. Raw traces and source-manifest.json identify what was tested.

Keep the itch page private. This task is to implement and validate improvements; do not publish or upload a replacement demo. Do not change account/payment settings. Preserve unrelated local work and approved art. The tested version was branch claude/gauntlet-v2 at 3a1406f plus the existing r03 onboarding/session edits, not clean HEAD. Compare your latest code and reproduce issues before applying fixes that may already exist.

## Interpret the evidence correctly

The current game is a short beach → water gaps → crate-yard prototype, not the twelve-beat full-game plan. A normal native-key route reached the checkpoint without a death and eventually collected all 12 fruit and cleared all 10 crate/TNT targets. It also exercised TNT death, falls, checkpoint recovery and exhausted-life reset. There is no implemented completion state. This was scripted input with fixed simulation time, not an uncoached human player. Targeted tests use separately disclosed placement fixtures. Read the exact fresh results and limitations; do not infer human fun or difficulty from a bot route.

The source index rebuild matches exactly, but uses external Three.js CDN imports. The earlier r03 uploaded ZIP was a different bundled artifact. Source testing is not proof that a new export or hosted upload works.

## First pass: trustworthy interaction and a finished prototype loop

1. Resolve any confirmed visible-terrain/collision mismatch documented in the report. Use inner/outer control probes and actual input at takeoff/landing edges. A decorative skirt may extend outside collision; a surface that visually invites a landing must agree with the physics. Fix the geometry/collision contract or make the non-walkable portion unmistakable. Do not blindly widen every platform or retune jump physics from one scripted miss.
2. Fix orphaned contact shadows. After the TNT clears the stacked crates, the independent fake contact blobs remain as dark/floating bands. beach.js creates them independently; rules.js only hides the crate mesh and disables its solid. Own each blob with its prop, retire it on break, and restore exactly once on reset. Inspect fruit contacts as the same lifecycle question. Preserve legitimate environmental shadows. Provide identical-camera spin/stomp/TNT before-and-after screenshots and a repeated-reset check.
3. Give the prototype an explicit ending. The Pause text truthfully says it ends in the crate yard, but reaching the far side with 12/12 fruit and 10/10 crates produces no finish cue or payoff. Add a clear goal/arrival, short completion sequence and useful replay/explore choice. Completion should not require every collectible unless that is deliberately the objective; reward 100% separately. Test partial/full collection, completion-once, focus, replay/reset and post-finish falling.
4. Correct the FPS overlay. It derives FPS from simulation dt, which is clamped at .033 or fixed1/60. A controlled 100ms-frame-delay test showed approximately9.86 actual frames/second while the overlay displayed30 or60. Measure real frame intervals independently, label simulated timing separately, and keep deterministic stepping intact. This is not evidence that target hardware normally runs at9.86FPS; the test deliberately slowed the scheduler. Validate frame-time behavior before changing the simulation clamp.

## Preserve what works

Preserve the existing pause/input-clear behavior, trapped menu focus, recovery explanations, checkpoint resource persistence, normal jump/double-jump/coyote/buffer, spin/stomp/TNT interactions and normal retry loop. Existing regression scripts were rerun fresh. Extend meaningful checks around your changes rather than replacing them with assertions that merely mirror implementation. Do not restore old onboarding bugs or use BB.place in a claimed normal-route acceptance test.

## Production-quality pass within the current scope

- Make the playable corridor and legal landing edges easier to read. Current dense grass/pebbles/debris and strong palm shadows compete with them; the hero remains outlined and identifiable. Author quieter landing/run zones and distinct interactive silhouettes. Avoid globally removing all detail or simply adding contrast/bloom.
- Refine mascot transitions, foot contact, jump anticipation/recovery and spin timing at actual play-camera size. Preserve approved identity; proportion changes require collision/camera checks. A more elaborate still model alone does not finish animation.
- Make every important action respond clearly: fruit pickup, crate break, checkpoint activation, TNT arming/blast, damage/death and completion. Use coherent localized VFX and differentiated audio without constant full-screen shake or flash. Preserve immediate input response.
- Add the first complete audio pass with volume settings, voice limits, provenance, ambience/music that support gameplay cues, and audible testing. Current silence is deferred work, not a regression.
- Clarify HUD resource icons and reading order at small sizes and without color. Retain readable Pause/Help and recovery messages. Provide appropriate keyboard/controller settings and reduced effects for the input devices actually promised; a responsive HTML panel does not establish touchscreen gameplay.
- Profile the exact future delivery on declared hardware/browser/resolution, with real wall-clock frame times, high-DPI/resize checks, restart soak and memory trend. Keep source/CDN and bundled/offline artifacts distinct. Verify a fresh extraction offline when offline support is claimed.

Update stale documentation deliberately: QUALITY-BAR's r128/no-bundler description conflicts with current r184 modular source/build tooling. Establish the authoritative current delivery and art constraints. Geometry counts and draw-call minimums are observations, not proof of good visuals. Keep render/material ownership coordinated rather than letting independent agents fight over coupled lighting.

## Work order and evidence required

Start with verified fixes and a finished representative slice. Show before/after screenshots and measured behavior; then extend the standard to later planned beats. Use agents for independent tests and review where useful. Report confirmed passes, unresolved issues and limitations separately. Keep changes in reviewable groups and do not discard ongoing work.

Acceptance should include a normal-input run with no teleport/state grants, useful collection/replay outcomes, death and checkpoint recovery, pause/focus-loss safety, actual supported-device checks, and an exact-package startup test. Ask Scott only for unresolved approved-art choices, subjective/hardware checks you cannot perform, or eventual publication approval. Do not add an engine rewrite, multiplayer, online services, progression trees or extra levels as a substitute for fixing and finishing the existing loop.

# Source/build review notes — October 18, 2026

These are current source observations and review hypotheses. Runtime results belong in ROUTE-REPORT.md and CHECKS-REPORT.md. No implementation changes were made.

- Tested repository: `C:\Users\scott\Documents\repos\games\bandicoot-bonanza\main`, branch `claude/gauntlet-v2`, HEAD `3a1406f`, with existing uncommitted r03 onboarding/session changes. The test snapshot includes those edits. Do not discard them or assume this is clean HEAD.
- `build-consistency.json`: rebuilding the current source in memory produced exactly the current index.html, SHA256 `d762dcae9a37d613aa6b42339f85b960bb42343b574e3212fe9632f39051e03f`, 76,354 bytes. Existing source and generated file are consistent.
- Current source index imports Three.js 0.184.0 from jsDelivr. The prior delivery report describes a separately bundled r03 ZIP. Current source tests are not a fresh retest of that hosted ZIP. Do not call the hosted version network-dependent without inspecting its payload.
- Playable scope in `src/world/beach.js`: beach, gapA, gapB, crate yard. Twelve fruit, nine standard crates, one TNT, one checkpoint. Older plans describe twelve beats; missing planned beats are scope still to build, not regression evidence.
- `src/game/state.js` has PLAY/REVIEW; `rules.js` tracks counts, deaths and resets but no completion state. Pause help discloses that the prototype ends at the yard. Natural endpoint behavior needs route proof.
- `src/review/harness.js` derives FPS from simulation dt; `src/main.js` clamps real-time dt to 0.033 or uses fixed1/60 for tests. Do not interpret the overlay or software-rendered runtime as a hardware benchmark. Controlled rAF probe pending.
- `src/world/beach.js` creates separate static ground contact blobs for crates/fruit. `rules.js` hides destroyed/collected mesh records without those contact blobs. Before/after captures are needed to establish visual severity, especially upper-crate shadow discs.
- `src/world/masses.js` builds island geometry wider/deeper than its nominal collision footprint. Test whether a visibly walkable sand lip admits falls before calling this unfair collision; decorative skirts can extend legitimately beyond a solid.
- Current gameplay input is keyboard; audio is explicitly deferred in GA3-PLAN. No untested controller or sound support should be promised. Make these bounded production work items rather than pretend they regressed.
- Fresh route images inspected by root: start, first crates cleared, water-gap approach. Character retains a strong outline, but repeated detailed ground cover and high-contrast palm shadows compete with the landing corridor. Recommend authored quiet landing zones and coherent silhouettes, not more geometry as an automatic route to quality.
- Preserve current useful features: Pause/Help, keyboard focus loop, explicit recovery notices, checkpoint preservation, procedural animation, stable camera follow and outlined actor. Test them again; historical passes alone do not certify the present artifact.

The evidence package must omit source/runtime copies, dependencies and secrets. Include report, screenshots, traces, explicit limitations, and inert test scripts where useful. Keep all itch pages private and do not upload revised demos during review.

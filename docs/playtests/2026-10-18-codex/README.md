# Bandicoot Bonanza evidence — October 18, 2026

Read CLAUDE-HANDOFF.md, then PLAYTEST-REPORT.md and its screenshots.
ROUTE-REPORT.md, CHECKS-REPORT.md and INDEPENDENT-CRITIQUE.md provide methods,
repeat counts, counterarguments and limitations. SCREENSHOT-GALLERY.html indexes
all original captures. Source manifest/build receipt identify the tested artifact.

This is the current beach/gaps/crate-yard prototype, tested at 3a1406f on
claude/gauntlet-v2 with the existing uncommitted r03 onboarding/session changes.
Reproduce findings against your current source before fixing them.

The normal input route collected 12/12 fruit and 10/10 crate/TNT targets.
Confirmed issues include visible sand extending beyond collision, orphaned crate
contact shadows and FPS derived from simulation time. There is no completion
state at the prototype endpoint. Human fun/difficulty is not certified.

Source/runtime snapshots, dependencies, credentials and browser profiles are
excluded. Test scripts are retained as .mjs.txt text evidence. To rerun, restore
an executable copy outside the game's production sources and adapt local paths;
read the fixture descriptions first. snapshot/ references in historical logs mean
the isolated source copy used for testing, not a folder shipped in this packet.

No game fixes, commits, pushes, demo uploads or itch publication were performed
as part of this review. Keep itch private. Do not confuse the source HTML with
the previously bundled r03 hosted artifact.
# Authored assets — provenance

Every GLB in `assets/models/` is listed here. Made on Scott's machine,
local models only, no paid API nodes. Raw generations live in
`assets-raw/<name>/` (gitignored); rerun with the command shown.

## Models used

| Step | Model | Licence |
|---|---|---|
| Concept image | Z-Image Turbo (`z_image_turbo_bf16`) | Apache-2.0 |
| Background cutout | BiRefNet | MIT |
| Image to mesh + texture | Pixal3D + TRELLIS.2 (`trellis_2_int8_convrot`) | MIT |
| Concept from a reference photo | Qwen Image Edit 2511 (`qwen_image_edit_2511_fp8mixed`, 4-step LoRA) | Apache-2.0 |
| Cleanup, decimate, export | Blender 5.2 (`pipeline/prep.py`) | GPL tool; output is ours |

Hunyuan3D 2.1 is installed too, but its Tencent licence excludes the EU,
UK and South Korea. Do not ship its output without Scott's decision.

## Assets

| File | Round | Prompt / source | Seed | Faces | Replaces | A/B status |
|---|---|---|---|---|---|---|
| `sea-stack.glb` | 37 | "a tall tropical sea stack rock pillar, layered sandstone strata in warm ochre and terracotta, undercut at the base, lush jungle vegetation and ferns crowning the flat top, moss creeping down the sides" + house STYLE (`gen.py`) | 11 | 13,994 | `seaStack()` in `backdrop.js` (10 stacks) | self-review: kept; blind A/B owed |
| `hero.glb` (r38, REMOVED r43 — resembled a trademarked character) | 38 | concept `hero-s42`: "full body character turnaround front view of an original cartoon bandicoot mascot hero, relaxed A-pose … orange fur, cream belly and muzzle, green eyes, spiky darker tuft, large pointed ears, long striped tail, fingerless brown gloves, blue denim shorts, chunky red sneakers" + STYLE; mesh `--faces 80000 --tex 2048`, prep 30k, `rig.py` (14 bones, region-gated distance weights) | 42 | 29,997 | `createHeroModel()` (model.js), via `src/player/rig.js` | self-review: kept; blind A/B owed |
| `jungle-bush.glb` | 39 | "a dense round clump of tropical jungle foliage, overlapping big glossy elephant-ear and monstera leaves and ferns, deep emerald green with lime highlights and dark shaded gaps between leaves" + STYLE; mesh 40k, prep 2.5k faces, 512 tex | 9 | 2,493 | jungleRidge() sphere mounds (instanced, every slot ×1.4 + hash shore band) | self-review: kept; blind A/B owed |
| `jungle-tree.glb` | 39 | "a lush tropical rainforest broadleaf tree, short curved trunk with buttress roots, wide dome canopy made of many dense clusters of large glossy leaves, deep emerald and lime greens with darker shaded interior" + STYLE; mesh 40k, prep 3k faces, 512 tex | 5 | 2,991 | bgTree() lollipops (instanced) | self-review: kept; blind A/B owed |
| `hero.glb` (REPLACED r43) | 43 | Scott's black cat (decision 2026-10-20, WO-X01). Qwen Image Edit 2511 from `refs/cat/03.jpg` (Scott's own photo, yard-warz `reference/cat/`): "Turn this black cat into an original stylized 3D mascot hero … standing upright … A-pose … keep this exact cat's look: solid glossy black fur … pale yellow-green eyes with vertical slit pupils … long white whiskers, tall upright ears … long black tail … no clothes", seed 23; crop + brown patch pulled to a faint sheen (CAT_NOTES: brown is sheen only); TRELLIS.2 80k → prep 30k → `rig.py --soften 0.7 --fur-desat 0.85` (head-band recentre, blue-band desaturation) | 23 | 30,000 | the r38 bandicoot (removed from the repo) | self-review: kept; blind A/B owed at r44 |
| `bigleaf.glb` | 46 | "a large tropical understory plant cluster: a few huge glossy banana leaves and giant elephant-ear leaves on tall stems fanning outward, with ferns at the base, deep green leaves with lighter veins and dark shaded centre" + STYLE; mesh 40k, prep 3k, 512 tex | 31 | ~3,000 | 2 in 5 shore-band bush slots (new layer) | self-review: kept |
| `jungle-bush-lo.glb` | 46 | `jungle-bush` raw mesh, prep `--faces 600 --tex 256` (floors at 1,088) | 9 | 1,088 | distance LOD for clumps past |x| 34 m | self-review: kept (far only; reads as shards up close) |
| `textures/canopy.webp` | 47 | Z-Image Turbo: "seamless tileable texture, dense tropical jungle canopy seen from directly above, a carpet of overlapping large glossy leaves of many sizes, rich deep greens with lime highlights on the leaf tops and very dark shaded gaps between leaf clusters, stylized hand-painted game texture, even lighting, no horizon, no sky, no trunks, flat top-down orthographic view, fills the whole frame"; made tileable by a half-offset cross-blend, mean luma normalised to 0.5, 512² WebP | 21 | — | ridge skin vertex colour (multiplied, triplanar) | self-review: kept |
| `hero.glb` (REPLACED r51) | 51 | Scott's black cat, re-conceived with the arms clear of the body (WO-A14): Qwen Image Edit 2511 from `refs/cat/03.jpg`, "…relaxed idle pose: both arms hang down and slightly outward, about 30 degrees away from the sides, so there is a clear gap of empty background between each arm and the hips and torso … matte soft short fur … long black tail curving down and to one side away from the legs … no clothes", seed 88; TRELLIS.2 80k → prep 30k → `rig.py --soften 1.0 --fur-desat 1.0 --fur-lift 0.14` | 88 | 29,935 | the r43 cat mesh (seed 23) | self-review: kept (stride plate gone) |

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
| Cleanup, decimate, export | Blender 5.2 (`pipeline/prep.py`) | GPL tool; output is ours |

Hunyuan3D 2.1 is installed too, but its Tencent licence excludes the EU,
UK and South Korea. Do not ship its output without Scott's decision.

## Assets

| File | Round | Prompt / source | Seed | Faces | Replaces | A/B status |
|---|---|---|---|---|---|---|
| `sea-stack.glb` | 37 | "a tall tropical sea stack rock pillar, layered sandstone strata in warm ochre and terracotta, undercut at the base, lush jungle vegetation and ferns crowning the flat top, moss creeping down the sides" + house STYLE (`gen.py`) | 11 | 13,994 | `seaStack()` in `backdrop.js` (10 stacks) | self-review: kept; blind A/B owed |

"""Authored-asset generator: concept image -> cutout -> textured mesh, on the local ComfyUI.

Every step writes into assets-raw/<name>/ and is skipped when its output exists, so a run
can stop and resume. Models (all local, licences in docs/gauntlet/ASSETS.md):
  concept  z_image_turbo (Apache-2.0)
  cutout   BiRefNet (MIT)
  mesh     Pixal3D + TRELLIS.2 (MIT)

Usage:
  python pipeline/gen.py <name> "<edit instruction>" --edit ref.png   (concept from a reference)
  python pipeline/gen.py <name> "<object description>" [--seed N] [--faces N] [--tex N]
  python pipeline/gen.py <name> --image path/to/concept.png      (skip the concept step)
Then: blender -b -P pipeline/prep.py -- assets-raw/<name>/mesh.glb assets/models/<name>.glb --height H
"""
import sys, time, shutil, argparse, pathlib
from comfy import Workflow, upload, free

HERE = pathlib.Path(__file__).parent
RAW = HERE.parent / 'assets-raw'

# House style for every concept: one object, isolated, game-asset render, no text.
STYLE = ('stylized 3D game asset render in the style of a modern AAA mascot platformer, '
         'chunky readable shapes, hand-painted saturated colours, soft studio lighting, '
         'single object centred, full object in frame, plain light grey background, '
         'no text, no logo, no watermark, no ground plane, no shadow')


def log(name, msg):
    line = time.strftime('%H:%M:%S ') + f'{name}: {msg}'
    print(line, flush=True)
    with (RAW / 'gen.log').open('a', encoding='utf-8') as f:
        f.write(line + '\n')


def concept(name, desc, seed):
    dest = RAW / name / 'concept.png'
    if dest.exists():
        return dest
    wf = Workflow(HERE / 'templates/image_z_image_turbo.json')
    wf.set('CLIPTextEncode', 'text', f'{desc}. {STYLE}')
    wf.set('KSampler', 'seed', seed)
    files, t = wf.run(RAW / name, 'concept')
    log(name, f'concept in {t}s')
    return files[0]


def edit(name, source, prompt, seed):
    """Qwen Image Edit 2511 (4-step) from one reference image -> concept.png."""
    dest = RAW / name / 'concept.png'
    if dest.exists():
        return dest
    img = upload(source)
    wf = Workflow(HERE / 'templates/image_qwen_image_edit_2511.json')
    for node in wf.find('LoadImage'):
        wf.api[node]['inputs']['image'] = img  # both reference slots: the same picture
    enc = wf.find('TextEncodeQwenImageEditPlus')
    for i in [i for i in enc if wf.api[i]['inputs'].get('prompt')]:
        wf.api[i]['inputs']['prompt'] = prompt
    wf.set('Enable 4steps LoRA', 'value', True)
    wf.set('KSampler', 'seed', seed)
    files, t = wf.run(RAW / name, 'concept')
    log(name, f'edit concept in {t}s')
    return files[0]


def cutout(name, source):
    dest = RAW / name / 'cutout.png'
    if dest.exists():
        return dest
    img = upload(source)
    wf = Workflow.__new__(Workflow)
    wf.titles = {}
    wf.api = {
        '1': {'class_type': 'LoadImage', 'inputs': {'image': img}, '_meta': {'title': 'LoadImage'}},
        '2': {'class_type': 'LoadBackgroundRemovalModel', 'inputs': {'bg_removal_name': 'birefnet.safetensors'}, '_meta': {'title': 'm'}},
        '3': {'class_type': 'RemoveBackground', 'inputs': {'bg_removal_model': ['2', 0], 'image': ['1', 0]}, '_meta': {'title': 'rb'}},
        # JoinImageWithAlpha treats the mask as transparency, so the foreground mask is inverted first.
        '6': {'class_type': 'InvertMask', 'inputs': {'mask': ['3', 0]}, '_meta': {'title': 'invert'}},
        '4': {'class_type': 'JoinImageWithAlpha', 'inputs': {'image': ['1', 0], 'alpha': ['6', 0]}, '_meta': {'title': 'join'}},
        '5': {'class_type': 'SaveImage', 'inputs': {'images': ['4', 0], 'filename_prefix': 'bb/cutout'}, '_meta': {'title': 'save'}},
    }
    files, t = wf.run(RAW / name, 'cutout')
    log(name, f'cutout in {t}s')
    return files[0]


def mesh(name, source, faces, tex):
    dest = RAW / name / 'mesh.glb'
    if dest.exists():
        return dest
    free()
    img = upload(source)
    wf = Workflow(HERE / 'templates/3d_pixal3d_trellis2_image_to_model.json')
    wf.set('LoadImage', 'image', img)
    wf.set('Texture Resolution', 'value', tex)
    wf.set('DecimateMesh', 'target_face_count', faces)
    wf.set('Trellis2UpsampleStage', 'target_resolution', '1024')
    src = wf.api['322']['inputs']['model_3d']
    del wf.api['322']
    wf.api['900'] = {'class_type': 'SaveGLB', 'inputs': {'mesh': src, 'filename_prefix': 'bb/mesh'}, '_meta': {'title': 'SaveGLB'}}
    files, t = wf.run(RAW / name, 'mesh', timeout=3600)
    free()
    glb = next(f for f in files if f.suffix == '.glb')
    glb.replace(dest)  # previews are saved first, so the GLB lands as mesh-N.glb
    log(name, f'mesh in {t}s')
    return dest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('name')
    ap.add_argument('desc', nargs='?')
    ap.add_argument('--image')
    ap.add_argument('--edit', help='reference image: desc becomes an edit instruction (Qwen Image Edit)')
    ap.add_argument('--seed', type=int, default=7)
    ap.add_argument('--faces', type=int, default=40000)
    ap.add_argument('--tex', type=int, default=2048)
    ap.add_argument('--stop', choices=['concept', 'cutout', 'mesh'], default='mesh')
    a = ap.parse_args()
    (RAW / a.name).mkdir(parents=True, exist_ok=True)
    if a.edit:
        src = edit(a.name, a.edit, a.desc, a.seed)
    elif a.image:
        src = RAW / a.name / 'concept.png'
        if not src.exists():
            shutil.copy(a.image, src)
    else:
        if not a.desc:
            sys.exit('need a description or --image')
        src = concept(a.name, a.desc, a.seed)
    if a.stop == 'concept':
        print(src); return
    cut = cutout(a.name, src)
    if a.stop == 'cutout':
        print(cut); return
    print(mesh(a.name, cut, a.faces, a.tex))


if __name__ == '__main__':
    main()

"""Blender 5.2: rig a prepared hero GLB (1 m tall, origin at the feet, facing -Y in Blender).

  blender -b -P pipeline/rig.py -- <in.glb> <out.glb> [--height 1.45] [--debug out.png]

Joints are measured from the mesh, not guessed per model: hands are the widest
front vertices at hand height, ears the widest above the brow, the tail the
rearmost low vertices. Bone names are the game's pivot names (src/player/rig.js):
  hips > spine > head > ear_L / ear_R
  hips > arm_L > fore_L      hips > leg_L > shin_L      hips > tail
L is the -X side, the same convention as model.js. Skinning uses Blender's bone
heat; when that fails on a non-manifold mesh, the weights come from a voxel
remeshed proxy through a Data Transfer modifier.
"""
import bpy, bmesh, sys, argparse, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--height', type=float, default=1.45)
ap.add_argument('--debug')
ap.add_argument('--cull-sheets', type=float, default=0.0,
                help='delete faces with other surface within this distance on BOTH sides (generator membranes)')
ap.add_argument('--fur-desat', type=float, default=0.0,
                help='saturation share removed from dark pixels (V < 0.4); eyes stay vivid')
ap.add_argument('--fur-lift', type=float, default=0.0,
                help='lift dark pixels toward a blue-gray charcoal by this much (mascot read)')
ap.add_argument('--soften', type=float, default=0.5,
                help='keep this share of the albedo detail above a 3 px blur (1 = untouched)')
a = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a.src)
body = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
body.name = 'hero'
if a.cull_sheets > 0:
    # Thin membranes: where the concept's arm touched the body, the generator
    # joined them with a sheet; the stride swing exposed it as the "plate"
    # (WO-A14). A face with another surface within d on BOTH sides is
    # sandwiched inside the volume — delete it.
    import bmesh
    from mathutils.bvhtree import BVHTree
    bm = bmesh.new(); bm.from_mesh(body.data)
    bm.faces.ensure_lookup_table()
    tree = BVHTree.FromBMesh(bm)
    d = a.cull_sheets
    kill = []
    for f in bm.faces:
        c = f.calc_center_median(); n = f.normal
        if n.length < 0.5:
            continue
        o1 = c + n * 1e-4; o2 = c - n * 1e-4
        h1 = tree.ray_cast(o1, n, d); h2 = tree.ray_cast(o2, -n, d)
        if h1[0] is not None and h2[0] is not None and h1[2] != f.index and h2[2] != f.index:
            kill.append(f)
    bmesh.ops.delete(bm, geom=kill, context='FACES')
    bm.to_mesh(body.data); bm.free()
    print(f'[rig] culled {len(kill)} sandwiched faces (d={d})')

V = [body.matrix_world @ v.co for v in body.data.vertices]
# Recentre X on the head band: a long tail widens the bounding box prep.py
# centred on, and the cat's body sat 0.08 m off the origin (round 43).
_hb = [v.x for v in V if 0.6 <= v.z <= 0.85]
_cx = (min(_hb) + max(_hb)) / 2 if _hb else 0.0
if abs(_cx) > 1e-4:
    from mathutils import Matrix
    body.data.transform(Matrix.Translation((-_cx, 0, 0)))
    V = [body.matrix_world @ v.co for v in body.data.vertices]
    print(f'[rig] recentred x by {-_cx:+.3f}')


def band(z0, z1, pred=lambda v: True):
    return [v for v in V if z0 <= v.z <= z1 and pred(v)]


def mean(vs):
    s = Vector()
    for v in vs:
        s += v
    return s / max(len(vs), 1)


cy = mean(V).y  # body depth centre; front is -Y


def extreme_side(vs, side, frac=0.85):
    """Mean of the vertices on one side whose |x| is within frac of that side's max."""
    vs = [v for v in vs if v.x * side > 0]
    if not vs:
        return None
    m = max(abs(v.x) for v in vs)
    return mean([v for v in vs if abs(v.x) >= m * frac])


def width_at(z, dz=0.015):
    vs = band(z - dz, z + dz, lambda v: abs(v.y - cy) < 0.12)
    return max((abs(v.x) for v in vs), default=0.1)


J = {}
J['root'] = Vector((0, cy, 0))
J['hips'] = Vector((0, cy, 0.31))
J['spine'] = Vector((0, cy, 0.42))
J['neck'] = Vector((0, cy, 0.55))
J['crown'] = Vector((0, cy, 0.92))
torso_half = width_at(0.47)
for side, tag in ((-1, 'L'), (1, 'R')):
    hand = extreme_side(band(0.24, 0.48, lambda v: v.y <= cy + 0.04), side) or Vector((side * 0.22, cy, 0.34))
    # Per side, from the hand: generated bodies are not symmetric.
    sh = Vector((side * min(torso_half * 0.78, abs(hand.x) * 0.68), cy, 0.52))
    J['arm_' + tag] = sh
    J['fore_' + tag] = sh.lerp(hand, 0.5) + Vector((0, 0.01, 0))
    J['hand.' + tag] = hand
    legx = side * max(width_at(0.27) * 0.5, 0.05)
    J['leg_' + tag] = Vector((legx * 0.6, cy, 0.29))  # hips sit inside the wide stance
    J['shin_' + tag] = Vector((legx, cy - 0.01, 0.16))
    J['foot.' + tag] = Vector((legx, cy - 0.06, 0.03))
    ear = extreme_side(band(0.80, 1.0), side, 0.9) or Vector((side * 0.2, cy, 0.9))
    J['ear_' + tag] = Vector((side * abs(ear.x) * 0.55, cy, 0.80))
    J['eartip.' + tag] = ear
tailvs = band(0.08, 0.45, lambda v: v.y > cy + 0.10)
if tailvs:
    tip = max(tailvs, key=lambda v: (v - J['hips']).length)
else:
    tip = Vector((0.15, cy + 0.25, 0.25))
J['tail'] = Vector((0, cy + 0.06, 0.27))
J['tailtip'] = tip
for k, v in sorted(J.items()):
    print(f'[rig] {k:10s} {v.x:+.3f} {v.y:+.3f} {v.z:+.3f}')

# Armature. Roll 0 on every bone; the game composes rotations in model space,
# so the bone axes never need to agree with the old pivots.
arm_data = bpy.data.armatures.new('rig')
rig = bpy.data.objects.new('rig', arm_data)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode='EDIT')
eb = arm_data.edit_bones


def bone(name, head, tail, parent=None, deform=True):
    b = eb.new(name)
    b.head, b.tail = head, tail
    b.roll = 0
    b.use_deform = deform
    if parent:
        b.parent = eb[parent]
    return b


bone('root', J['root'], J['root'] + Vector((0, 0, 0.1)), deform=False)
bone('hips', J['hips'], J['spine'], 'root')
bone('spine', J['spine'], J['neck'], 'hips')
bone('head', J['neck'], J['crown'], 'spine')
for t in 'LR':
    bone('ear_' + t, J['ear_' + t], J['eartip.' + t], 'head')
    bone('arm_' + t, J['arm_' + t], J['fore_' + t], 'spine')
    bone('fore_' + t, J['fore_' + t], J['hand.' + t], 'arm_' + t)
    bone('leg_' + t, J['leg_' + t], J['shin_' + t], 'hips')
    bone('shin_' + t, J['shin_' + t], J['foot.' + t], 'leg_' + t)
bone('tail', J['tail'], J['tailtip'], 'hips')
bpy.ops.object.mode_set(mode='OBJECT')

# Skin. Bone heat fails on generated meshes (non-manifold shells), so the
# weights are region-gated distance weights: each vertex may only follow the
# bones of its body region, then 1/d^4 among those, top three kept.
deform = [b.name for b in arm_data.bones if b.use_deform]
segs = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in arm_data.bones if b.use_deform}


def seg_dist(p, a0, a1):
    d = a1 - a0
    t = max(0.0, min(1.0, (p - a0).dot(d) / max(d.length_squared, 1e-9)))
    return (p - (a0 + d * t)).length


def allowed(v):
    side = 'L' if v.x < 0 else 'R'
    out = ['hips', 'spine', 'head']
    if v.z > 0.76 and abs(v.x) > 0.09:
        out.append('ear_' + side)
    # Nothing above the shoulder top follows the arm: the cat's whisker sheet
    # hangs to chin height beside the shoulder, and the stride swing tore it
    # out as a cream plate (p03-p05 WO-A14, found by a hull-off capture, r50).
    if 0.22 < v.z < J['arm_' + side].z + 0.01 and abs(v.x) > abs(J['arm_' + side].x) * 0.75 and v.y < cy + 0.06:
        out += ['arm_' + side, 'fore_' + side]
    if v.z < J['hips'].z + 0.03 and v.y < cy + 0.07:
        out += ['leg_' + side, 'shin_' + side]
    if v.y > cy + 0.07 and v.z < 0.45:
        # Only past the tail's root: rump vertices near the base followed the
        # tail sway and tore a plate off the hip (p04, WO-A14).
        t0, t1 = J['tail'], J['tailtip']
        d = t1 - t0
        if (v - t0).dot(d) / max(d.length_squared, 1e-9) > 0.18:
            out.append('tail')
    return out


groups = {n: body.vertex_groups.new(name=n) for n in deform}
for i, v in enumerate(V):
    # Arm influence ramps in across the shoulder (0.75x -> 1.05x its width):
    # a hard gate split the skin between spine and arm, and the stride swing
    # opened a hole at the inner elbow (round 45).
    sh = abs(J['arm_' + ('L' if v.x < 0 else 'R')].x)
    ramp = max(0.0, min(1.0, (abs(v.x) - 0.75 * sh) / (0.30 * sh)))
    ramp = ramp * ramp * (3 - 2 * ramp)
    ws = sorted(((1.0 / (seg_dist(v, *segs[n]) ** 4 + 1e-7) * (ramp if n[:4] in ('arm_', 'fore') else 1.0), n)
                 for n in allowed(v)), reverse=True)[:3]
    if not ws or sum(w for w, _ in ws) <= 0:
        continue
    tot = sum(w for w, _ in ws)
    for w, n in ws:
        if w / tot > 0.02:
            groups[n].add([i], w / tot, 'REPLACE')
mod = body.modifiers.new('rig', 'ARMATURE'); mod.object = rig
body.parent = rig
for n in deform:
    c = sum(1 for v in body.data.vertices for g in v.groups if g.group == groups[n].index and g.weight > 0.5)
    print(f'[rig] weight {n:7s} {c:6d} verts > 0.5')

# Soften the baked fur strokes: out = blur + (src - blur) * soften. At full
# detail they read as ink hatching, 1.8x the references' micro-contrast
# (p03, WO-A08). A 3 px radius at 2048 stays inside the UV islands.
if a.soften < 1 or a.fur_desat > 0 or a.fur_lift > 0:
    import numpy as np
    for mat in body.data.materials:
        for n in (mat.node_tree.nodes if mat and mat.use_nodes else []):
            if n.type != 'TEX_IMAGE' or not n.image or not any(l.to_socket.name == 'Base Color' for l in n.outputs[0].links):
                continue
            img = n.image
            w, h = img.size
            px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
            blur = px.copy()
            for axis in (0, 1):
                acc = np.zeros_like(blur)
                for d in range(-3, 4):
                    acc += np.roll(blur, d, axis=axis)
                blur = acc / 7
            out = blur + (px - blur) * a.soften
            # Masks from the ORIGINAL albedo (round 53, p06 WO-R08/A24/A25): the
            # fur pass lifted the pupils into a grey smudge and greyed the pink
            # ear skin. Iris = yellow-green; the eye zone is the iris dilated
            # ~10 px so it covers the slit inside it; pink = ear skin and nose.
            o = px[..., :3]
            ov = o.max(axis=2); omn = o.min(axis=2); od = np.maximum(ov - omn, 1e-6)
            osat = np.where(ov > 0, (ov - omn) / np.maximum(ov, 1e-6), 0)
            orr, ogg, obb = o[..., 0], o[..., 1], o[..., 2]
            ohue = np.where(ov == orr, ((ogg - obb) / od) % 6, np.where(ov == ogg, (obb - orr) / od + 2, (orr - ogg) / od + 4)) * 60
            # Pale irises (cat5) sit below sat 0.35: 0.18 and V 0.45 catch them.
            # cat5 bakes its eyes pale cream-yellow (hue ~50, sat 0.12-0.3,
            # V > 0.6); whiskers are whiter (sat < 0.12).
            iris = (ohue > 35) & (ohue < 130) & (osat > 0.12) & (ov > 0.45)
            eye = iris.copy()
            for _ in range(10):
                eye = eye | np.roll(eye, 1, 0) | np.roll(eye, -1, 0) | np.roll(eye, 1, 1) | np.roll(eye, -1, 1)
            pink = ((ohue >= 320) | (ohue <= 40)) & (osat > 0.15) & (ov > 0.12) & (ov < 0.75)
            keep = (eye | pink)[..., None].astype(np.float32)
            print(f'[rig] masks: iris {int(iris.sum())} px, eye zone {int(eye.sum())} px, pink {int(pink.sum())} px')
            if a.fur_desat > 0:
                # Black fur, not navy: the baked blue sheen stacked with the toon
                # ramp's blue shade (round 43). Only dark pixels move.
                rgb = out[..., :3]
                v = rgb.max(axis=2, keepdims=True)
                mn = rgb.min(axis=2, keepdims=True)
                lum = (rgb * np.array([0.2126, 0.7152, 0.0722])).sum(axis=2, keepdims=True)
                # Hue in degrees, then a weight for the blue band (170-270) at any value,
                # plus every dark pixel. The eyes (yellow-green) and ear skin (pink) stay.
                r, g, bb = rgb[..., 0:1], rgb[..., 1:2], rgb[..., 2:3]
                d = np.maximum(v - mn, 1e-6)
                h = np.where(v == r, ((g - bb) / d) % 6, np.where(v == g, (bb - r) / d + 2, (r - g) / d + 4)) * 60
                blue = np.clip(1 - np.abs(h - 215) / 65, 0, 1)  # 150-280: teal sheen too (cat5 belly)
                dark = np.clip((0.45 - v) / 0.15, 0, 1)
                k = a.fur_desat * np.maximum(blue, dark) * (1 - keep)
                out[..., :3] = rgb * (1 - k) + lum * k
            if a.fur_lift > 0:
                # Charcoal, not void (p04, WO-A16): in shade the near-black body
                # read as a hole; form showed only where specular landed.
                v = out[..., :3].max(axis=2, keepdims=True)
                lw = np.clip((0.40 - v) / 0.40, 0, 1) * (1 - keep)
                out[..., :3] += lw * a.fur_lift * np.array([0.95, 0.97, 1.0])  # near-neutral: refs/cat chroma ~0.09
            # A crisp slit: dark, non-iris pixels inside the eye zone go near black.
            # The slit is darker than the iris around it but often green-tinted, so
            # it is found RELATIVE to the local iris value, not by a fixed black.
            ev = out[..., :3].max(axis=2)
            irisv = float(np.median(ev[iris])) if iris.any() else 0.6
            slit = eye & (ev < irisv * 0.62)
            out[slit, :3] *= 0.25
            print(f'[rig] eye: iris median V {irisv:.2f}, slit {int(slit.sum())} px')
            # Ear skin toward the photos' pink-brown (sat ~0.23, hue ~7).
            # Bright teal sheen patches (cat5 belly) went light grey after the
            # desat, and the grade's shadow split-tone tinted them blue: cap the
            # originally blue-teal fur at V 0.22. Whiskers are low-sat, untouched.
            teal = (ohue > 150) & (ohue < 280) & (osat > 0.15) & ~eye & ~pink
            tv = out[..., :3].max(axis=2)
            over = teal & (tv > 0.22)
            out[over, :3] *= (0.22 / np.maximum(tv[over], 1e-6))[:, None]
            print(f'[rig] teal cap: {int(over.sum())} px')
            # Iris to the photos' pale yellow-green (CAT_NOTES: lime near the pupil
            # fading to butter-yellow) when the bake came out cream (cat5).
            if iris.any():
                il = (out[iris, :3] * np.array([0.2126, 0.7152, 0.0722])).sum(axis=1, keepdims=True)
                # Pale green, sat ~0.2 (refs/cat 152,166,131 / 191,210,188; p08 WO-A34).
                out[iris, :3] = np.clip(il * np.array([0.90, 1.0, 0.80]), 0, 1)
                # Baked pupil filled with iris (r100, p17 WO-A39): the bake's own
                # pupil sits nasal of the eye centre, and the game draws the slit
                # at the centre, so the baked one read as a ghost pupil. The
                # holes of a morphological closing of the iris mask are the
                # pupil; lids and lashes lie outside the closed shape.
                closed = iris.copy()
                for _ in range(18):
                    closed = closed | np.roll(closed, 1, 0) | np.roll(closed, -1, 0) | np.roll(closed, 1, 1) | np.roll(closed, -1, 1)
                for _ in range(18):
                    closed = closed & np.roll(closed, 1, 0) & np.roll(closed, -1, 0) & np.roll(closed, 1, 1) & np.roll(closed, -1, 1)
                hole = closed & ~iris
                out[hole, :3] = np.median(out[iris, :3], axis=0)
                print(f'[rig] baked pupil filled: {int(hole.sum())} px')
            ps = pink & ~eye
            pl = (out[ps, :3] * np.array([0.2126, 0.7152, 0.0722])).sum(axis=1, keepdims=True)
            # Dark mauve, ~rgb(60,50,50) sat ~0.17 (refs/cat inner ear; p08 WO-A34:
            # the salmon 155,87,76 at sat 0.51 overshot by 3x).
            pm = float(pl.mean()) if len(pl) else 0.3
            out[ps, :3] = np.clip(np.array([0.245, 0.205, 0.205]) * (0.75 + 0.5 * pl / max(pm, 1e-3)), 0, 1)
            # Whiskers near-white (p08: p98 V 115-124 vs white in the photos):
            # bright, low-saturation pixels outside the eyes.
            wh = (ov > 0.5) & (osat < 0.2) & ~eye
            out[wh, :3] = np.maximum(out[wh, :3], 0.90)
            print(f'[rig] whiskers lifted: {int(wh.sum())} px')
            out[..., 3] = px[..., 3]
            img.pixels[:] = np.clip(out, 0, 1).ravel()
            img.update()
            print(f'[rig] processed {img.name} {img.size[0]}x{img.size[1]} detail x{a.soften}')

# The game's toon material reads only the colour map: drop the normal and
# metal/rough maps so they do not ship (WO-A05).
for mat in body.data.materials:
    if not mat or not mat.use_nodes:
        continue
    nt = mat.node_tree
    bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if bsdf:
        for name in ('Normal', 'Metallic', 'Roughness'):
            for l in list(bsdf.inputs[name].links):
                nt.links.remove(l)

# Hull mask (WO-A13): the outline hull wrapped every whisker in a dark
# 2 px line, so they read as tan ropes. Per vertex, sample the final albedo;
# bright pixels (whiskers, eye whites) get hull width 0. Stored as the colour
# attribute, which the game's hull reads and the toon body ignores.
import numpy as np
_img = None
for mat in body.data.materials:
    for n in (mat.node_tree.nodes if mat and mat.use_nodes else []):
        if n.type == 'TEX_IMAGE' and n.image and any(l.to_socket.name == 'Base Color' for l in n.outputs[0].links):
            _img = n.image
if _img is not None:
    iw, ih = _img.size
    px = np.array(_img.pixels[:], dtype=np.float32).reshape(ih, iw, 4)
    me = body.data
    uv = me.uv_layers.active.data
    lum = np.zeros(len(me.vertices)); cnt = np.zeros(len(me.vertices))
    for loop in me.loops:
        u, v = uv[loop.index].uv
        x = min(iw - 1, max(0, int((u % 1.0) * iw))); y = min(ih - 1, max(0, int((v % 1.0) * ih)))
        r, g, b, _ = px[y, x]
        lum[loop.vertex_index] += 0.2126 * r + 0.7152 * g + 0.0722 * b; cnt[loop.vertex_index] += 1
    lum /= np.maximum(cnt, 1)
    # Eyes (round 53, WO-A24): the baked iris has no pupil. Measure each eye
    # from its iris vertices (yellow-green) so the game can add a slit pupil
    # and a catchlight. Stored as mesh extras in game units, glTF Y-up.
    import json
    rgbv = np.zeros((len(me.vertices), 3))
    for loop in me.loops:
        u, v = uv[loop.index].uv
        x = min(iw - 1, max(0, int((u % 1.0) * iw))); y = min(ih - 1, max(0, int((v % 1.0) * ih)))
        rgbv[loop.vertex_index] += px[y, x, :3]
    rgbv /= np.maximum(cnt, 1)[:, None]
    vmax = rgbv.max(1); vmin = rgbv.min(1); vd = np.maximum(vmax - vmin, 1e-6)
    vsat = (vmax - vmin) / np.maximum(vmax, 1e-6)
    vh = np.where(vmax == rgbv[:, 0], ((rgbv[:, 1] - rgbv[:, 2]) / vd) % 6,
         np.where(vmax == rgbv[:, 1], (rgbv[:, 2] - rgbv[:, 0]) / vd + 2, (rgbv[:, 0] - rgbv[:, 1]) / vd + 4)) * 60
    irisv = (vh > 35) & (vh < 130) & (vsat > 0.12) & (vmax > 0.45)
    eyes = {}
    for tag, sgn in (('L', -1), ('R', 1)):
        idx = [i for i in np.nonzero(irisv)[0] if me.vertices[i].co.x * sgn > 0 and me.vertices[i].co.z > 0.6]
        if len(idx) < 8:
            continue
        P = np.array([tuple(me.vertices[i].co) for i in idx]); N = np.array([tuple(me.vertices[i].normal) for i in idx])
        # Front-facing only (Blender front is -Y): cat5 bakes whole cream
        # eyeballs, and the mean normal of a full sphere points anywhere —
        # the slit landed inside the head (round 60).
        front = N[:, 1] < -0.25
        if front.sum() >= 6:
            P, N = P[front], N[front]
        # Median centre and a 70th-percentile radius: the farthest iris vertex
        # overshot the eye and made the slit too tall (round 53).
        c = np.median(P, 0)
        # Outlier rejection: cream muzzle and whisker roots also pass the
        # iris test on some textures (cat5); keep the cluster round the eye.
        keepm = np.sqrt(((P - c) ** 2).sum(1)) < 0.05
        if keepm.sum() >= 6:
            P, N = P[keepm], N[keepm]; c = np.median(P, 0)
        n = N.mean(0); n /= max(np.linalg.norm(n), 1e-6)
        r = min(float(np.percentile(np.sqrt(((P - c) ** 2).sum(1)), 70)) * 1.1, 0.045)
        H = a.height
        eyes[tag] = {'p': [c[0] * H, c[2] * H, -c[1] * H], 'n': [n[0], n[2], -n[1]], 'r': r * H}
        print(f'[rig] eye {tag}: {len(idx)} verts, r {r * H:.3f} m')
    body['eyes'] = json.dumps(eyes)
    ca = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    for i, l in enumerate(lum):
        w = 0.0 if l > 0.45 else 1.0
        ca.data[i].color = (w, w, w, 1.0)
    me.color_attributes.active_color = ca
    print(f'[rig] hull mask: {int((lum > 0.45).sum())} bright verts get no outline')

# Scale the whole rig to game height.
rig.scale = (a.height,) * 3
bpy.ops.object.select_all(action='DESELECT')
rig.select_set(True); body.select_set(True)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

if a.debug:
    scene = bpy.context.scene
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    scene.collection.objects.link(cam)
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = a.height * 1.15
    cam.location = (0, -5, a.height / 2); cam.rotation_euler = (math.pi / 2, 0, 0)
    scene.camera = cam
    rig.show_in_front = True
    arm_data.display_type = 'STICK'
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.display.shading.color_type = 'TEXTURE'
    scene.render.resolution_x = scene.render.resolution_y = 900
    scene.render.filepath = __import__('os').path.abspath(a.debug)
    # Workbench skips armatures in final renders; draw joints as small spheres.
    for k, v in J.items():
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012 * a.height, location=v * a.height)
        s = bpy.context.active_object
        m = bpy.data.materials.new('j'); m.diffuse_color = (1, 0, 1, 1); s.data.materials.append(m)
    scene.display.shading.color_type = 'MATERIAL'
    scene.display.shading.show_xray = True
    scene.display.shading.xray_alpha = 0.45
    bpy.ops.render.render(write_still=True)
    for o in [o for o in scene.objects if o.type == 'MESH' and o is not body]:
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.objects.remove(cam, do_unlink=True)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True); rig.select_set(True)
bpy.ops.export_scene.gltf(filepath=a.dst, export_format='GLB', use_selection=True,
                          export_image_format='WEBP', export_image_quality=88,
                          export_skins=True, export_animations=False, export_yup=True, export_extras=True)
print(f'[rig] -> {a.dst}: {len(body.data.polygons)} faces, {len(deform)} deform bones')

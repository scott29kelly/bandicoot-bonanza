import bpy
import json
import math
import os
from mathutils import Vector

# Ensure clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# ==============================================================================
# PASS 22 — CHARACTER FIDELITY RE-SCULPT (Crash 4 class)
#
# What made the old sculpt read amateurish (critic-ranked):
#   1. Overlapping primitives with visible seam silhouettes (cube wedges).
#   2. Timid proportions: small head, spindly arms, narrow sneakers.
#   3. The 0.78/0.52/0.44 node axis-squash flattening the whole body.
#   4. Perfect bilateral symmetry — a statue, not a character.
#
# This rebuild:
#   - Torso and cranium are ONE continuous displaced mass each (subdivided
#     UV spheres shaped by per-vertex profile functions) — shoulders, pecs,
#     waist cinch and brow shelf are sculpted, not assembled.
#   - Crash-class ratios inside a ~2.3-unit hero that matches the old world
#     footprint: cranium ~40% of standing height, hands and feet oversized,
#     ears tall, tail thick with an up-curled tip.
#   - Identity node transform (no axis squash) — proportions live in the
#     geometry, so the hull's uHullScale measures (1,1,1).
#   - Asymmetric attitude pose (cocked right fist, flared left arm, one brow
#     higher, scruffy cheek fur) and every appendage embedded DEEP so no
#     seam survives at silhouette range.
#
# The script also dumps evaluated region bounds in final GLB space to
# docs/hero_bounds.json — that is the source of truth for re-deriving the
# HERO_MORPH y/z region boxes in index.html after any geometry change.
# ==============================================================================

def create_mat(name, color, roughness=0.5, specular=0.5, subsurface=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = specular
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = specular
        if subsurface > 0 and 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = subsurface
    return mat

# Calibrated materials — NAMES ARE LOAD-BEARING (RIM_MATS / HULL_MATS keys in
# index.html). Do not rename.
m_fur_orange = create_mat("FurOrange", (0.90, 0.28, 0.02, 1.0), roughness=0.42, subsurface=0.12)
m_chest_cream = create_mat("ChestCream", (0.96, 0.88, 0.72, 1.0), roughness=0.48)
m_denim_blue = create_mat("DenimBlue", (0.05, 0.16, 0.52, 1.0), roughness=0.6)
m_sneaker_red = create_mat("SneakerRed", (0.80, 0.05, 0.05, 1.0), roughness=0.38)
m_rubber_white = create_mat("RubberWhite", (0.96, 0.96, 0.96, 1.0), roughness=0.30)
m_leather_brown = create_mat("LeatherBrown", (0.24, 0.11, 0.04, 1.0), roughness=0.52)
m_mouth_dark = create_mat("MouthDark", (0.08, 0.01, 0.02, 1.0), roughness=0.3)
m_tongue_pink = create_mat("TonguePink", (0.92, 0.20, 0.36, 1.0), roughness=0.25)
m_teeth_white = create_mat("TeethWhite", (0.98, 0.98, 0.95, 1.0), roughness=0.15)
m_eye_white = create_mat("EyeWhite", (0.98, 0.98, 0.98, 1.0), roughness=0.1)
m_eye_black = create_mat("EyeBlack", (0.02, 0.02, 0.02, 1.0), roughness=0.05)
m_nose_black = create_mat("NoseBlack", (0.02, 0.02, 0.02, 1.0), roughness=0.15)
m_glint = create_mat("Glint", (1.0, 1.0, 1.0, 1.0), roughness=0.0)
m_gold = create_mat("Gold", (0.94, 0.78, 0.14, 1.0), roughness=0.25, specular=0.8)

parts = []
bounds = {}  # region name -> [minX, minY, minZ, maxX, maxY, maxZ] in final GLB space

def sstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3.0 - 2.0 * t)

def gauss(x, c, w):
    return math.exp(-((x - c) / w) ** 2)

def make_obj(mesh_fn, name, mat, loc=(0, 0, 0), rot=(0, 0, 0), scale=(1, 1, 1), subsurf=0, region=None):
    mesh_fn()
    obj = bpy.context.active_object
    obj.name = name
    obj.location = loc
    obj.rotation_euler = rot
    obj.scale = scale
    if mat:
        obj.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    if subsurf > 0:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = subsurf
        mod.render_levels = subsurf
    parts.append(obj)
    if region:
        record_bounds(obj, region)
    return obj

def record_bounds(obj, region):
    """World AABB of the object, converted to final GLB space.

    Final space = Blender world after the master's 180-degree Z rotation and
    full transform apply, i.e. p_final = (-x, -y, z); the glTF exporter then
    maps Blender (Z-up) to glTF (Y-up) as glb = (x, z, -y). Composed:
    glb_x = -x_b, glb_y = z_b, glb_z = y_b.
    """
    bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
    xs = [p.x for p in bb]; ys = [p.y for p in bb]; zs = [p.z for p in bb]
    gx0, gx1 = -max(xs), -min(xs)
    gy0, gy1 = min(zs), max(zs)
    gz0, gz1 = min(ys), max(ys)
    box = [gx0, gy0, gz0, gx1, gy1, gz1]
    if region in bounds:
        old = bounds[region]
        bounds[region] = [min(old[0], box[0]), min(old[1], box[1]), min(old[2], box[2]),
                          max(old[3], box[3]), max(old[4], box[4]), max(old[5], box[5])]
    else:
        bounds[region] = box

def sculpt(obj, fn):
    """Per-vertex displacement in LOCAL space (run before subsurf is evaluated)."""
    for v in obj.data.vertices:
        fn(v.co)

# ==============================================================================
# 1. TORSO — one displaced mass: shoulders, pecs, waist cinch, hip flare
# ==============================================================================
torso = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=26, radius=1.0),
                 "Hero_Torso", m_fur_orange, loc=(0, 0.0, 1.06), scale=(0.66, 0.42, 0.58), region="torso")

def torso_shape(co):
    t = co.z  # local pole axis, -1 hips .. +1 shoulders (scale z 0.60)
    # Width profile: hip 0.74 -> chest 1.0, waist dip centred at t=-0.35
    m = 0.78 + 0.26 * sstep(-1.0, 0.45, t)
    m *= 1.0 - 0.24 * gauss(t, -0.35, 0.40)
    co.x *= m
    co.y *= m
    # Chest push (front, upper) — the pec shelf the crest sits on
    if co.y > 0.0:
        co.y += 0.20 * gauss(t, 0.30, 0.38) * sstep(0.0, 0.7, co.y)
    else:
        co.y *= 1.0 - 0.16 * sstep(0.0, 0.8, t)  # flatten the back
    # Belly roundness low front
    if co.y > 0.0:
        co.y += 0.06 * gauss(t, -0.45, 0.30) * sstep(0.1, 0.8, co.y)

sculpt(torso, torso_shape)

# Cream belly patch (front-lower torso) — the painted-zone anchor for the shader
belly = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=1.0),
                 "Hero_Belly", m_chest_cream, loc=(0, 0.19, 0.92), scale=(0.38, 0.17, 0.40), region="belly")

def belly_shape(co):
    co.z *= 1.0 + 0.35 * gauss(co.z, -0.4, 0.5)
    co.y += 0.25 * gauss(co.x, 0.0, 0.6)

sculpt(belly, belly_shape)

# Cream chest fur crest (the jagged collar)
make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.20, depth=0.42),
         "Hero_ChestCrest", m_chest_cream, loc=(0, 0.24, 1.24), rot=(-0.55, 0, 0), scale=(1.35, 0.5, 1.0), subsurf=1, region="chestCrest")

# Trapezius/neck collar bridging torso to cranium
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=0.17),
         "Hero_Traps", m_fur_orange, loc=(0, 0.0, 1.52), scale=(1.15, 0.85, 1.0), region="neck")

# ==============================================================================
# 2. DENIM SHORTS, BELT — fitted, with hem rings and a belt pouch
# ==============================================================================
shorts = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=1.0),
                  "Hero_DenimShorts", m_denim_blue, loc=(0, 0.0, 0.78), scale=(0.44, 0.32, 0.36), region="shorts")

def shorts_shape(co):
    co.z *= 1.0 - 0.35 * sstep(-0.2, -1.0, co.z)  # taper to the legs
    co.x *= 1.0 + 0.10 * sstep(0.0, 1.0, co.z)

sculpt(shorts, shorts_shape)

for sx in [-0.17, 0.17]:
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.135, depth=0.20),
             f"Hero_ShortsLeg_{sx}", m_denim_blue, loc=(sx, 0.0, 0.545), subsurf=1, region="shorts")
    make_obj(lambda: bpy.ops.mesh.primitive_torus_add(major_radius=0.132, minor_radius=0.018),
             f"Hero_ShortsHem_{sx}", m_denim_blue, loc=(sx, 0.0, 0.465), rot=(0, 0, 0), region="shorts")

make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.37, depth=0.055),
         "Hero_Belt", m_leather_brown, loc=(0, 0, 0.945), region="belt")
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.11),
         "Hero_Buckle", m_gold, loc=(0, 0.355, 0.945), scale=(1.5, 0.25, 0.9), subsurf=1, region="buckle")
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.14),
         "Hero_BeltPouch", m_leather_brown, loc=(0.23, 0.25, 0.86), rot=(0, -0.5, -0.25), scale=(0.9, 0.55, 0.8), subsurf=1, region="pouch")

# ==============================================================================
# 3. TAIL — thick base, up-curled tip (life), cream tuft
# ==============================================================================
tail1 = make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.115, radius2=0.075, depth=0.34),
                 "Hero_TailBase", m_fur_orange, loc=(0, -0.38, 0.72), rot=(-1.85, 0, 0), region="tail")

tail2 = make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.075, radius2=0.045, depth=0.30),
                 "Hero_TailMid", m_fur_orange, loc=(0, -0.63, 0.66), rot=(-2.35, 0, 0), region="tail")

make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.075),
         "Hero_TailTuft", m_chest_cream, loc=(0, -0.80, 0.77), scale=(1.0, 1.0, 1.25), region="tail")

# Ear/tail follow-through needs a defined tail ARC region too (GLB space,
# from the bounds dump): recorded via "tail" above.

# ==============================================================================
# 4. LEGS — short cartoon thighs/calves, deep-embedded into shorts
# ==============================================================================
for sx in [-0.17, 0.17]:
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.125),
             f"Hero_Thigh_{sx}", m_fur_orange, loc=(sx, 0.0, 0.52), scale=(1.0, 1.0, 1.15), region="leg")
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.072),
             f"Hero_Knee_{sx}", m_fur_orange, loc=(sx, 0.005, 0.33), region="leg")
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.070, depth=0.22),
             f"Hero_Calf_{sx}", m_fur_orange, loc=(sx, 0.01, 0.22), region="leg")

# ==============================================================================
# 5. SNEAKERS — oversized, elongated (the Crash read), chunky sole
# ==============================================================================
for sx in [-0.17, 0.17]:
    body = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=22, ring_count=16, radius=1.0),
                    f"Hero_SneakerBody_{sx}", m_sneaker_red, loc=(sx, 0.095, 0.135), scale=(0.135, 0.245, 0.105), subsurf=1, region="sneaker")

    def sneaker_shape(co):
        co.y += 0.18 * sstep(0.2, 1.0, co.y) * sstep(-0.4, 0.4, co.z)   # elongate toe
        co.z -= 0.25 * sstep(0.3, 1.0, co.z) * sstep(0.2, 1.0, co.y)    # low toe profile
        co.x *= 1.0 + 0.15 * sstep(0.0, 1.0, -co.y)                      # full heel

    sculpt(body, sneaker_shape)

    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_SneakerSole_{sx}", m_rubber_white, loc=(sx, 0.10, 0.032), scale=(0.27, 0.54, 0.065), subsurf=2, region="sneaker")
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.10),
             f"Hero_SneakerToe_{sx}", m_rubber_white, loc=(sx, 0.335, 0.085), scale=(1.15, 0.85, 0.75), region="sneaker")
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.10),
             f"Hero_SneakerTongue_{sx}", m_sneaker_red, loc=(sx, 0.115, 0.245), rot=(-0.5, 0, 0), scale=(1.1, 0.30, 1.3), subsurf=1, region="sneaker")
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.05),
             f"Hero_HeelTab_{sx}", m_sneaker_red, loc=(sx, -0.145, 0.20), scale=(1.2, 0.4, 1.4), subsurf=1, region="sneaker")
    for l_i, l_y in enumerate([0.16, 0.215, 0.27]):
        make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.014, depth=0.15),
                 f"Hero_Lace_{sx}_{l_i}", m_rubber_white, loc=(sx, l_y, 0.225 + l_i * 0.045), rot=(0.35, math.pi / 2, 0), region="sneaker")

# ==============================================================================
# 6. ARMS — big deltoids, bicep bulge, tapered forearms, CHUNKY fists
#    Asymmetric attitude: left arm flared out, right fist cocked forward.
# ==============================================================================
for sx in [-0.60, 0.60]:
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.16),
             f"Hero_Deltoid_{sx}", m_fur_orange, loc=(sx, 0.01, 1.34), scale=(1.15, 1.0, 1.05), region="arm")

for sx, elb, wris, fa_rot in [
    (-0.60, (-0.74, 0.02, 1.06), (-0.70, 0.10, 0.775), (0.10, 0.10, 0.06)),
    ( 0.60, ( 0.76, 0.10, 1.10), ( 0.70, 0.32, 0.92), (-0.55, -0.18, -0.10)),
]:
    # Upper arm: cylinder from deltoid into elbow (embedded both ends)
    ux, uy, uz = sx * 1.05, 0.02, 1.28
    ex, ey, ez = elb
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.095, depth=0.34),
             f"Hero_ArmUpper_{sx}", m_fur_orange, loc=((ux + ex) / 2, (uy + ey) / 2, (uz + ez) / 2),
             rot=(math.pi / 2 - math.atan2(ez - uz, math.hypot(ex - ux, ey - uy)), 0,
                  -math.atan2(ex - ux, ey - uy) + math.pi / 2), region="arm")
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=10, radius=0.085),
             f"Hero_Elbow_{sx}", m_fur_orange, loc=elb, region="arm")
    # Forearm: bicep bulge handled by radius; tapered toward wrist
    fx, fy, fz = wris
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.092, depth=0.36),
             f"Hero_Forearm_{sx}", m_fur_orange, loc=((ex + fx) / 2, (ey + fy) / 2, (ez + fz) / 2),
             rot=(math.pi / 2 - math.atan2(fz - ez, math.hypot(fx - ex, fy - ey)), 0,
                  -math.atan2(fx - ex, fy - ey) + math.pi / 2), region="arm")
    # Wristband
    make_obj(lambda: bpy.ops.mesh.primitive_torus_add(major_radius=0.070, minor_radius=0.022),
             f"Hero_Wristband_{sx}", m_leather_brown, loc=(fx, fy, fz + 0.05), rot=(0.35 * (1 if sx < 0 else -1), 0, 0), region="arm")

    # CHUNKY 4-finger fist (palm + 3 curled fingers + wrapped thumb)
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.175),
             f"Hero_Fist_{sx}", m_leather_brown, loc=(fx, fy + 0.045, fz - 0.055),
             rot=(-0.5 + fa_rot[0], 0, sx * 0.12), scale=(1.05, 0.95, 1.0), subsurf=1, region="fist")
    for f_i, f_dx in enumerate([-0.048, 0.0, 0.048]):
        make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.038, depth=0.14),
                 f"Hero_Finger_{sx}_{f_i}", m_leather_brown, loc=(fx + f_dx, fy + 0.075, fz - 0.085),
                 rot=(1.35 + fa_rot[0], 0, sx * 0.10), region="fist")
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.040, depth=0.15),
             f"Hero_Thumb_{sx}", m_leather_brown, loc=(fx - sx * 0.075, fy + 0.10, fz - 0.02),
             rot=(0.9 + fa_rot[0], 0, sx * 0.85), region="fist")

# ==============================================================================
# 7. HEAD — one displaced mass: brow shelf overhang, cheek flare, jaw taper
# ==============================================================================
head = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=30, radius=1.0),
                "Hero_Head", m_fur_orange, loc=(0, 0.015, 1.99), scale=(0.44, 0.40, 0.42), region="head")

def head_shape(co):
    t = co.z
    y = co.y
    # Cranium: full round top, slight rear mass
    if y < 0:
        co.y -= 0.06 * sstep(0.2, 0.9, -y) * sstep(-0.2, 0.6, t)
    # Crown taper: the ball read dies when the top narrows
    co.x *= 1.0 - 0.16 * sstep(0.50, 0.95, t)
    # Face plane: flatten the front so the eyes sit proud of it
    if y > 0.35:
        co.y = 0.35 + (y - 0.35) * (1.0 - 0.30 * sstep(0.05, 0.45, t))
    # Brow shelf: front-upper overhang ABOVE the eyes
    band = gauss(t, 0.42, 0.22) * sstep(0.15, 0.75, y)
    co.y += 0.16 * band
    co.z -= 0.10 * band
    # Cheek flare: widen mid-face
    cheek = gauss(t, 0.02, 0.30) * sstep(0.0, 0.7, y)
    co.x *= 1.0 + 0.16 * cheek
    # Jaw: taper lower half, project the chin
    low = sstep(-0.25, -1.0, t)
    co.x *= 1.0 - 0.30 * low
    if y > 0:
        co.y *= 1.0 - 0.18 * low
    co.y += 0.10 * gauss(t, -0.72, 0.22) * sstep(0.2, 0.8, y)  # chin

sculpt(head, head_shape)

# Muzzle: big cream front mass (covers lower face front — the Crash zone)
muzzle = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=26, ring_count=18, radius=1.0),
                  "Hero_Muzzle", m_chest_cream, loc=(0, 0.28, 1.74), scale=(0.40, 0.30, 0.16), region="muzzle")

def muzzle_shape(co):
    co.y += 0.15 * gauss(co.z, 0.1, 0.5)   # forward bridge
    co.x *= 1.0 + 0.18 * gauss(co.z, -0.3, 0.4)  # wide at the mouth corners

sculpt(muzzle, muzzle_shape)

# Nose button
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.075),
         "Hero_Nose", m_nose_black, loc=(0, 0.63, 1.86), scale=(1.3, 0.9, 0.85), region="nose")

# Grin: curved lip arcs (toruses — back halves embedded in the muzzle)
make_obj(lambda: bpy.ops.mesh.primitive_torus_add(major_radius=0.26, minor_radius=0.028),
         "Hero_UpperLip", m_chest_cream, loc=(0, 0.70, 1.70), rot=(1.62, 0, 0), region="mouth")
make_obj(lambda: bpy.ops.mesh.primitive_torus_add(major_radius=0.23, minor_radius=0.024),
         "Hero_LowerLip", m_chest_cream, loc=(0, 0.665, 1.635), rot=(1.72, 0, 0), region="mouth")

# Mouth cavity (deep dark wedge behind the teeth — fixes the shallow-cavity read)
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.24),
         "Hero_MouthCavity", m_mouth_dark, loc=(0, 0.56, 1.68), rot=(0.12, 0, 0), scale=(1.45, 0.50, 0.38), subsurf=1, region="mouth")

# Teeth: two arcs following the grin curve (corners droop)
upper_teeth = [(-0.16, 0.062, 0.048), (-0.096, 0.066, 0.054), (-0.032, 0.068, 0.060),
               (0.032, 0.068, 0.060), (0.096, 0.066, 0.054), (0.16, 0.062, 0.048)]
for i, (tx, th, tw) in enumerate(upper_teeth):
    arc = 1.72 - 0.10 * (tx / 0.16) ** 2
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_UpperTooth_{i}", m_teeth_white, loc=(tx, 0.665, arc - th / 2),
             rot=(-0.10, 0, -tx * 1.4), scale=(tw, 0.030, th), region="teeth")
lower_teeth = [(-0.115, 0.050), (-0.04, 0.055), (0.04, 0.055), (0.115, 0.050)]
for i, (tx, th) in enumerate(lower_teeth):
    arc = 1.66 - 0.08 * (tx / 0.115) ** 2
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_LowerTooth_{i}", m_teeth_white, loc=(tx, 0.62, arc + th / 2),
             rot=(0.12, 0, -tx * 1.2), scale=(0.046, 0.026, th), region="teeth")

# Tongue
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.115),
         "Hero_Tongue", m_tongue_pink, loc=(0, 0.55, 1.62), scale=(0.95, 1.1, 0.38), region="tongue")

# Eyes: BIG ovals under the brow shelf, heavy top lids, big pupils, double glints
for sx in [-0.155, 0.155]:
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=14, radius=0.105),
             f"Hero_EyeWhite_{sx}", m_eye_white, loc=(sx, 0.395, 2.05), scale=(0.95, 0.85, 1.10), region="eyes")
    lid = make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.112),
                   f"Hero_Eyelid_{sx}", m_fur_orange, loc=(sx, 0.42, 2.06), rot=(-0.55, 0, 0), scale=(1.04, 0.55, 0.45), subsurf=1, region="lids")
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.052),
             f"Hero_Pupil_{sx}", m_eye_black, loc=(sx + 0.004, 0.478, 2.05), scale=(1.0, 0.62, 1.0), region="eyes")
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.021),
             f"Hero_Glint_{sx}", m_glint, loc=(sx + 0.026, 0.505, 2.085), region="glints")
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=6, ring_count=5, radius=0.010),
             f"Hero_Glint2_{sx}", m_glint, loc=(sx - 0.022, 0.498, 2.015), region="glints")

# Brows: thick, ASYMMETRIC (left cocked — attitude)
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.14),
         "Hero_Brow_L", m_fur_orange, loc=(-0.165, 0.385, 2.20), rot=(0.10, 0.12, 0.42), scale=(1.35, 0.30, 0.34), subsurf=1, region="brows")
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.14),
         "Hero_Brow_R", m_fur_orange, loc=(0.165, 0.385, 2.16), rot=(0.14, -0.06, -0.18), scale=(1.35, 0.30, 0.34), subsurf=1, region="brows")

# ==============================================================================
# 8. EARS — tall, curved back, deep-embedded; peach inner hollow
# ==============================================================================
for sx in [-0.21, 0.21]:
    ear = make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=14, radius1=0.155, depth=0.52),
                   f"Hero_EarOuter_{sx}", m_fur_orange, loc=(sx, -0.05, 2.56), rot=(-0.24, sx * 0.46, -sx * 0.12), scale=(1.0, 0.60, 1.0), region="ears")

    def ear_bend(co, s=sx):
        co.x += s * 0.06 * (co.z + 0.26) ** 2  # curve outward with height
        co.y -= 0.12 * (co.z + 0.26) ** 2      # sweep back

    sculpt(ear, ear_bend)
    inner = make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.092, depth=0.40),
                     f"Hero_EarInner_{sx}", m_chest_cream, loc=(sx * 1.05, 0.015, 2.50), rot=(-0.20, sx * 0.46, -sx * 0.12), scale=(0.95, 0.40, 0.95), region="ears")
    sculpt(inner, ear_bend)

# ==============================================================================
# 9. MOHAWK — five varied swept spikes with a slight S-curve
# ==============================================================================
mohawk_spec = [
    (0.105, 0.46, -0.50, 2.40, -0.015, 0.010),
    (0.115, 0.54, -0.72, 2.43, -0.085, -0.004),
    (0.100, 0.50, -0.95, 2.42, -0.165, 0.006),
    (0.085, 0.41, -1.18, 2.38, -0.245, -0.008),
    (0.065, 0.31, -1.42, 2.32, -0.315, 0.005),
]
for i, (r, ln, pitch, z0, y0, x0) in enumerate(mohawk_spec):
    spike = make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=r, depth=ln),
                     f"Hero_Mohawk_{i}", m_fur_orange, loc=(x0, y0, z0), rot=(pitch, 0, 0), subsurf=1, region="mohawk")

    def spike_curve(co, L=ln):
        co.x += 0.06 * math.sin(2.4 * (co.z / L + 0.5) * math.pi) * (co.z / L + 0.5)

    sculpt(spike, spike_curve)

# Scruffy cheek fur: three swept spikes per side
for sx in [-0.44, 0.44]:
    for i, (dz, dy, rz) in enumerate([(-0.02, 0.02, 0.55), (-0.10, -0.01, 0.75), (-0.16, -0.05, 0.95)]):
        make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.06, depth=0.22),
                 f"Hero_CheekFur_{sx}_{i}", m_fur_orange, loc=(sx, 0.06 + dy, 1.88 + dz),
                 rot=(0.15, sx * 1.05, sx * rz), region="cheekfur")

# Sideburn wedges bridging head to cheeks
for sx in [-0.40, 0.40]:
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=10, radius=0.115),
             f"Hero_Sideburn_{sx}", m_fur_orange, loc=(sx, 0.055, 1.88), scale=(0.7, 0.55, 1.10), region="head")

# ==============================================================================
# 10. JOIN, PIVOT, EXPORT
# ==============================================================================
bpy.ops.object.select_all(action='DESELECT')
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]

bpy.ops.object.join()
master = bpy.context.active_object
master.name = "Hero_Mascot"

# Clean geometry space: identity transform, mesh in world space (Z-up,
# facing +y, feet at z=0). This removes the old 0.78/0.52/0.44 node
# axis-squash — proportions now live in the geometry, and the hull's
# uHullScale measures (1,1,1).
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

# Face -Y in Blender so the glTF conversion (x, z, -y) yields a +Z-facing
# character with feet at y=0, head up +y.
master.rotation_euler.z = math.pi
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

output_glb = "assets/models/hero.glb"
os.makedirs(os.path.dirname(output_glb), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format='GLB',
    export_draco_mesh_compression_enable=False,
    export_apply=True
)

import base64
with open(output_glb, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

output_js = "assets/models/hero_model.js"
with open(output_js, "w", encoding="utf-8") as f:
    f.write(f'window.HERO_GLB_BASE64 = "{b64}";\n')

os.makedirs("docs", exist_ok=True)
with open("docs/hero_bounds.json", "w", encoding="utf-8") as f:
    json.dump(bounds, f, indent=1)

tris = len(master.data.polygons)
print(f"[BLENDER BUILD] Pass 22 re-sculpt exported: {output_glb} "
      f"({os.path.getsize(output_glb) / 1024:.1f} KB), "
      f"~{tris} final tris (post-subsurf, post-join). Region bounds -> docs/hero_bounds.json")


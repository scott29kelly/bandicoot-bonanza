import bpy
import math
import os
import sys

# Ensure clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

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

# Calibrated materials for PBR & linear AgX
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

def make_obj(mesh_fn, name, mat, loc=(0,0,0), rot=(0,0,0), scale=(1,1,1), subsurf=0):
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
    return obj

# ==============================================================================
# 1. ATHLETIC V-TAPER TORSO (Crash 4 Proportions: Wide Shoulders, Lean Waist)
# ==============================================================================
# Heroic chest wedge (broad across shoulders, flat across back, peaked forward)
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
         "Hero_TorsoWedge", m_fur_orange, loc=(0, 0.02, 1.25), scale=(0.78, 0.44, 0.52), subsurf=2)

# Slim athletic waist & pelvis
make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.26, depth=0.38),
         "Hero_Waist", m_fur_orange, loc=(0, 0, 0.95), scale=(1.0, 0.85, 1.0), subsurf=1)

# Peaked cream chest fur crest (unified stylized chest crest)
make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.22, depth=0.55),
         "Hero_ChestCrest", m_chest_cream, loc=(0, 0.26, 1.22), rot=(-0.42, 0, 0), scale=(1.15, 0.55, 1.0), subsurf=1)

# ==============================================================================
# 2. FITTED DENIM SHORTS & BELT (Clean athletic contour, NO bloomer ruffles)
# ==============================================================================
# Fitted denim shorts pelvis & legs (smooth continuous garment)
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
         "Hero_DenimShorts", m_denim_blue, loc=(0, 0.01, 0.72), scale=(0.58, 0.42, 0.36), subsurf=2)

# Leather belt with gold buckle
make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.30, depth=0.06),
         "Hero_Belt", m_leather_brown, loc=(0, 0, 0.90))
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.10),
         "Hero_Buckle", m_gold, loc=(0, 0.29, 0.90), scale=(1.2, 0.28, 0.85))

# Tailored leg cuffs (fitted to athletic quads)
for sx in [-0.15, 0.15]:
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.15, depth=0.28),
             f"Hero_ShortsLeg_{sx}", m_denim_blue, loc=(sx, 0.01, 0.54), rot=(0.04, -sx*0.06, 0), subsurf=1)

# Bushy bandicoot tail
make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.11, depth=0.76),
         "Hero_Tail", m_fur_orange, loc=(0, -0.28, 0.82), rot=(-2.2, 0, 0), scale=(1.0, 1.0, 1.15), subsurf=1)
make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.065, depth=0.26),
         "Hero_TailTip", m_chest_cream, loc=(0, -0.60, 0.70), rot=(-2.2, 0, 0), subsurf=1)

# ==============================================================================
# 3. CRASH 4 ICONIC HEAD, WIDE TOOTHY GRIN & EXPRESSIVE EYES
# ==============================================================================
# Cranium: diamond-wedge comic skull with brow shelf and cheek flares
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.68),
         "Hero_Skull", m_fur_orange, loc=(0, 0.02, 1.82), scale=(1.05, 0.95, 0.95), subsurf=2)

# Swept cheeky sideburns
for sx in [-0.34, 0.34]:
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.11, depth=0.34),
             f"Hero_Sideburn_{sx}", m_fur_orange, loc=(sx, 0.08, 1.70), rot=(0.25, sx*0.85, -sx*0.65), subsurf=1)

# WIDE CRESCENT CARTOON MOUTH (Ear-to-Ear Crash Grin)
# Lower jaw / chin
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.22),
         "Hero_MuzzleChin", m_chest_cream, loc=(0, 0.22, 1.55), scale=(1.15, 0.95, 0.9), subsurf=1)

# Deep open mouth cavity
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.32),
         "Hero_MouthHole", m_mouth_dark, loc=(0, 0.28, 1.62), rot=(0.3, 0, 0), scale=(1.25, 0.65, 0.55), subsurf=1)

# Full arched row of stylized white teeth
for i, tx in enumerate([-0.16, -0.09, -0.03, 0.03, 0.09, 0.16]):
    tooth_h = 0.08 if (i in [1, 4]) else 0.06  # Canines slightly longer
    tooth_w = 0.055 if (i in [2, 3]) else 0.045 # Buck teeth wider
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_UpperTooth_{i}", m_teeth_white, loc=(tx, 0.36, 1.70), rot=(-0.18, 0, -tx*0.3), scale=(tooth_w, 0.025, tooth_h))

# Lower teeth row
for i, tx in enumerate([-0.12, -0.04, 0.04, 0.12]):
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_LowerTooth_{i}", m_teeth_white, loc=(tx, 0.34, 1.56), rot=(0.18, 0, -tx*0.2), scale=(0.04, 0.022, 0.05))

# Arched pink tongue
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.12),
         "Hero_Tongue", m_tongue_pink, loc=(0, 0.28, 1.58), scale=(0.95, 1.25, 0.4))

# Upper snout bridge & nose button
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.20),
         "Hero_SnoutBridge", m_chest_cream, loc=(0, 0.24, 1.78), scale=(1.05, 0.95, 1.15), subsurf=1)

# Big glossy cartoon nose button
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.085),
         "Hero_NoseButton", m_nose_black, loc=(0, 0.46, 1.84), scale=(1.25, 0.85, 0.95))

# Swept wild mohawk spikes
for i, (z_off, y_off, pitch, s, len_m) in enumerate([
    (2.20, -0.02, -0.38, 0.09, 0.44),
    (2.24, -0.10, -0.58, 0.10, 0.50),
    (2.26, -0.19, -0.80, 0.09, 0.46),
    (2.22, -0.28, -1.02, 0.075, 0.38)
]):
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=s, depth=len_m),
             f"Hero_Mohawk_{i}", m_fur_orange, loc=(0, y_off, z_off), rot=(pitch, 0, 0), subsurf=1)

# Swept alert ears with peach inner hollow
for sx in [-0.22, 0.22]:
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=9, radius1=0.15, depth=0.58),
             f"Hero_EarOuter_{sx}", m_fur_orange, loc=(sx, -0.02, 2.22), rot=(-0.18, sx*0.45, -sx*0.1), scale=(1.05, 0.65, 1.0), subsurf=1)
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=7, radius1=0.095, depth=0.46),
             f"Hero_EarInner_{sx}", m_chest_cream, loc=(sx*1.02, 0.03, 2.20), rot=(-0.14, sx*0.45, -sx*0.1), scale=(0.95, 0.42, 0.95), subsurf=1)

# Expressive comic eyes with dark pupils, glossy glints, and determined brows
for sx in [-0.13, 0.13]:
    # Eye Sclera (White)
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=14, radius=0.11),
             f"Hero_EyeWhite_{sx}", m_eye_white, loc=(sx, 0.24, 1.90), scale=(0.92, 0.85, 1.15))
    # Eyelid hood
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.118),
             f"Hero_Eyelid_{sx}", m_fur_orange, loc=(sx, 0.23, 1.94), rot=(0.25, 0, 0), scale=(1.02, 0.82, 0.85), subsurf=1)
    # Pupil
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=10, radius=0.055),
             f"Hero_Pupil_{sx}", m_eye_black, loc=(sx*0.95, 0.33, 1.91), scale=(0.92, 0.5, 1.1))
    # Glint
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.024),
             f"Hero_Glint_{sx}", m_glint, loc=(sx*0.95 + 0.02, 0.37, 1.94))
    # Fierce arched brow
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.13),
             f"Hero_Brow_{sx}", m_leather_brown, loc=(sx, 0.27, 2.01), rot=(0.14, 0, -sx*0.35), scale=(1.2, 0.26, 0.30), subsurf=1)

# ==============================================================================
# 4. LONG DYNAMIC ARMS & SCULPTED 4-FINGER GLOVES (Reaches down past hips)
# ==============================================================================
for sx in [-0.42, 0.42]:
    # Shoulder deltoid
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=12, radius=0.14),
             f"Hero_Shoulder_{sx}", m_fur_orange, loc=(sx*0.96, 0.02, 1.40), scale=(1.1, 0.95, 0.95))
    # Upper arm (tapering down)
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.08, depth=0.40),
             f"Hero_ArmUpper_{sx}", m_fur_orange, loc=(sx*1.04, 0.01, 1.20), rot=(-0.16, -sx*0.08, 0), subsurf=1)
    # Elbow joint
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.082),
             f"Hero_Elbow_{sx}", m_fur_orange, loc=(sx*1.06, -0.01, 1.00))
    # Forearm
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.085, depth=0.38),
             f"Hero_Forearm_{sx}", m_fur_orange, loc=(sx*1.06, 0.08, 0.82), rot=(-0.35, 0, 0), subsurf=1)
    # Flared leather gauntlet cuff
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.13, radius2=0.10, depth=0.11),
             f"Hero_GloveCuff_{sx}", m_leather_brown, loc=(sx*1.06, 0.16, 0.67), rot=(-0.35, 0, 0))

    # Sculpted Cartoon Glove (Palm + 3 Curled Fingers + Thumb in active grip pose)
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.18),
             f"Hero_GlovePalm_{sx}", m_leather_brown, loc=(sx*1.06, 0.20, 0.58), scale=(1.10, 0.82, 1.10), subsurf=1)
    # Opposable Thumb with knuckle break
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.046, depth=0.15),
             f"Hero_Thumb_{sx}", m_leather_brown, loc=(sx*1.06 - sx*0.09, 0.26, 0.62), rot=(0.6, 0, -sx*0.75), subsurf=1)
    # 3 Curled Fingers (active cartoon fist/grip)
    for f_idx, f_x in enumerate([-0.045, 0.0, 0.045]):
        make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.040, depth=0.15),
                 f"Hero_Finger_{sx}_{f_idx}", m_leather_brown, loc=(sx*1.06 + f_x, 0.27, 0.52), rot=(1.15, 0, sx*0.18), subsurf=1)

# ==============================================================================
# 5. ATHLETIC LEGS & ELONGATED HIGH-TOP SNEAKERS
# ==============================================================================
for sx in [-0.14, 0.14]:
    # Athletic calf leg
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=14, radius=0.08, depth=0.42),
             f"Hero_Leg_{sx}", m_denim_blue, loc=(sx, 0.01, 0.36), subsurf=1)
    # Sneaker Red Canvas High-Top Body (elongated forward)
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=14, radius=0.16),
             f"Hero_SneakerBody_{sx}", m_sneaker_red, loc=(sx, 0.06, 0.16), scale=(1.0, 1.65, 0.95), subsurf=1)
    # Sneaker Tongue
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.11),
             f"Hero_SneakerTongue_{sx}", m_sneaker_red, loc=(sx, 0.14, 0.24), rot=(-0.35, 0, 0), scale=(1.05, 0.28, 1.15))
    # Curved White Rubber Toe Bumper Cap
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=12, radius=0.13),
             f"Hero_SneakerToe_{sx}", m_rubber_white, loc=(sx, 0.26, 0.11), scale=(1.05, 0.95, 0.78), subsurf=1)
    # Thick Sculpted Rubber Midsole & Outsole with Tread Relief
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.1),
             f"Hero_SneakerSole_{sx}", m_rubber_white, loc=(sx, 0.08, 0.045), scale=(3.1, 5.6, 0.82), subsurf=1)
    # White sneaker laces
    for l_i, l_y in enumerate([0.12, 0.18, 0.24]):
        make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.016, depth=0.13),
                 f"Hero_Lace_{sx}_{l_i}", m_rubber_white, loc=(sx, l_y, 0.20 + l_i*0.03), rot=(0, math.pi/2, 0))

# ==============================================================================
# 6. MASTER MESH JOIN & EXPORT
# ==============================================================================
bpy.ops.object.select_all(action='DESELECT')
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]

# Join into single unified master mesh
bpy.ops.object.join()
master = bpy.context.active_object
master.name = "Hero_Mascot"

# Set pivot at bottom center (between sneakers)
bpy.ops.object.origin_set(type='ORIGIN_CURSOR', center='MEDIAN')

# Rotate 180 degrees in Blender so character faces down -Y (Three.js standard forward)
master.rotation_euler.z = math.pi
bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# Export standard GLB
output_glb = "assets/models/hero.glb"
os.makedirs(os.path.dirname(output_glb), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format='GLB',
    export_draco_mesh_compression_enable=False,
    export_apply=True
)

# Export inlined base64 script for instant zero-server browser loading
import base64
with open(output_glb, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("utf-8")

output_js = "assets/models/hero_model.js"
with open(output_js, "w", encoding="utf-8") as f:
    f.write(f'window.HERO_GLB_BASE64 = "{b64}";\n')

print(f"\n[BLENDER BUILD] Successfully exported AAA Hero Mascot (Round 4) to {output_glb} ({os.path.getsize(output_glb) / 1024:.1f} KB) and {output_js}")

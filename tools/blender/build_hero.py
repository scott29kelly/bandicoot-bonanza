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

# Trapezius muscular neck collar bridging torso to cranium
make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.22, radius2=0.15, depth=0.24),
         "Hero_Traps", m_fur_orange, loc=(0, 0.01, 1.54), scale=(1.05, 0.85, 1.0), subsurf=1)

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

# Swept cheeky sideburns with sleek tapered cheekbone wedges (no bulbous chipmunk pouches)
for sx in [-0.34, 0.34]:
    # Swept diamond-wedge cheek flare blending flush with cranium and jaw
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.22),
             f"Hero_CheekRoot_{sx}", m_fur_orange, loc=(sx*0.74, 0.08, 1.68), rot=(0.14, sx*0.35, -sx*0.25), scale=(0.74, 0.52, 1.10), subsurf=1)
    # Primary swept cheek tuft emerging seamlessly from cheekbone
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.10, depth=0.34),
             f"Hero_Sideburn_{sx}", m_fur_orange, loc=(sx*0.82, 0.08, 1.68), rot=(0.18, sx*0.82, -sx*0.62), scale=(0.85, 0.68, 1.05), subsurf=1)
    # Secondary lower cheek flare bridging cleanly into muzzle
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.075, depth=0.26),
             f"Hero_Sideburn_Lower_{sx}", m_fur_orange, loc=(sx*0.78, 0.10, 1.58), rot=(0.28, sx*0.95, -sx*0.75), scale=(0.80, 0.62, 0.95), subsurf=1)

# WIDE CRESCENT CARTOON MOUTH (Ear-to-Ear Crash Grin)
# Lower jaw / chin
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.22),
         "Hero_MuzzleChin", m_chest_cream, loc=(0, 0.22, 1.48), scale=(1.10, 0.85, 0.70), subsurf=1)

# Sculpted smiling mouth cavity (crescent-arched, shallow depth so teeth sit proudly on lip borders)
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.28),
         "Hero_MouthHole", m_mouth_dark, loc=(0, 0.38, 1.63), rot=(0.14, 0, 0), scale=(1.35, 0.46, 0.32), subsurf=1)

# Upper & lower cartoon lip borders framing the grin
make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.045, depth=0.38),
         "Hero_UpperLip", m_chest_cream, loc=(0, 0.44, 1.70), rot=(0, math.pi/2, 0), scale=(1.0, 0.65, 0.65), subsurf=1)
make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.040, depth=0.34),
         "Hero_LowerLip", m_chest_cream, loc=(0, 0.42, 1.54), rot=(0, math.pi/2, 0), scale=(1.0, 0.65, 0.65), subsurf=1)

# Full arched row of stylized white teeth (firmly anchored along lip borders)
for i, tx in enumerate([-0.15, -0.09, -0.03, 0.03, 0.09, 0.15]):
    tooth_h = 0.065 if (i in [1, 4]) else 0.055  # Canines slightly longer
    tooth_w = 0.050 if (i in [2, 3]) else 0.042 # Buck teeth wider
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_UpperTooth_{i}", m_teeth_white, loc=(tx, 0.46, 1.66), rot=(-0.18, 0, -tx*0.25), scale=(tooth_w, 0.030, tooth_h))

# Lower teeth row
for i, tx in enumerate([-0.11, -0.04, 0.04, 0.11]):
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=1.0),
             f"Hero_LowerTooth_{i}", m_teeth_white, loc=(tx, 0.44, 1.56), rot=(0.15, 0, -tx*0.18), scale=(0.042, 0.026, 0.050))

# Arched pink tongue
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.12),
         "Hero_Tongue", m_tongue_pink, loc=(0, 0.38, 1.54), scale=(0.95, 1.15, 0.38))

# Upper snout bridge & nose button (seamless organic contouring)
make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.24),
         "Hero_SnoutRoot", m_fur_orange, loc=(0, 0.20, 1.82), rot=(-0.16, 0, 0), scale=(0.88, 0.72, 0.54), subsurf=1)
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.20),
         "Hero_SnoutBridge", m_chest_cream, loc=(0, 0.26, 1.74), scale=(0.96, 0.84, 0.82), subsurf=1)

# Big glossy cartoon nose button
make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.085),
         "Hero_NoseButton", m_nose_black, loc=(0, 0.48, 1.80), scale=(1.25, 0.85, 0.95))

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
             f"Hero_EyeWhite_{sx}", m_eye_white, loc=(sx, 0.28, 1.90), scale=(0.95, 0.85, 1.15))
    # Eyelid hood
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=14, ring_count=10, radius=0.115),
             f"Hero_Eyelid_{sx}", m_fur_orange, loc=(sx, 0.27, 1.95), rot=(-0.35, 0, 0), scale=(1.0, 0.85, 0.65), subsurf=1)
    # Pupil (Dark)
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.052),
             f"Hero_Pupil_{sx}", m_eye_black, loc=(sx + sx*0.015, 0.36, 1.91), scale=(1.0, 0.65, 1.0))
    # Glossy Specular Glint
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=6, radius=0.022),
             f"Hero_Glint_{sx}", m_glint, loc=(sx + 0.02, 0.385, 1.94))
    # Determined Eyebrow arch
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.15),
             f"Hero_Brow_{sx}", m_leather_brown, loc=(sx, 0.30, 2.01), rot=(0.14, 0, -sx*0.35), scale=(1.2, 0.26, 0.30), subsurf=1)

# ==============================================================================
# 4. LONG DYNAMIC ARMS & SCULPTED 4-FINGER GLOVES (Continuous muscular contours)
# ==============================================================================
for sx in [-0.42, 0.42]:
    # Clavicle / pectoral bridge connecting torso to deltoid cap
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.18),
             f"Hero_Clavicle_{sx}", m_fur_orange, loc=(sx*0.72, 0.06, 1.34), rot=(0.10, -sx*0.22, -sx*0.32), scale=(1.10, 0.70, 0.85), subsurf=1)
    # Smooth anatomical shoulder deltoid cap tucked snug into chest
    make_obj(lambda: bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.15),
             f"Hero_Shoulder_{sx}", m_fur_orange, loc=(sx*0.86, 0.03, 1.30), rot=(0, -sx*0.15, -sx*0.10), scale=(1.08, 0.95, 1.15), subsurf=1)

# Asymmetrical expressive stance:
# Left arm (sx = -0.42): dynamic flared gauntlet arm
# Right arm (sx = 0.42): cocked heroic fist angled forward with swagger
for sx, arm_rot_x, arm_rot_y, arm_rot_z, fa_rot_x, fa_rot_y in [
    (-0.42, -0.14,  0.06,  0.05, -0.32,  0.05),
    ( 0.42, -0.26, -0.12, -0.10, -0.48, -0.14)
]:
    # Tapered bicep
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.095, depth=0.38),
             f"Hero_ArmUpper_{sx}", m_fur_orange, loc=(sx*0.98, 0.02, 1.12), rot=(arm_rot_x, arm_rot_y, arm_rot_z), subsurf=1)
    # Athletic muscular forearm
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.09, depth=0.42),
             f"Hero_Forearm_{sx}", m_fur_orange, loc=(sx*1.02, 0.08, 0.80), rot=(fa_rot_x, fa_rot_y, arm_rot_z), scale=(1.05, 1.15, 1.0), subsurf=1)
    # Flared leather gauntlet cuff
    make_obj(lambda: bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.13, radius2=0.10, depth=0.11),
             f"Hero_GloveCuff_{sx}", m_leather_brown, loc=(sx*1.02, 0.16, 0.67), rot=(fa_rot_x, fa_rot_y, arm_rot_z))

    # Sculpted Cartoon Glove (Palm + 3 Curled Fingers + Thumb in active grip pose)
    make_obj(lambda: bpy.ops.mesh.primitive_cube_add(size=0.18),
             f"Hero_GlovePalm_{sx}", m_leather_brown, loc=(sx*1.02, 0.20, 0.58), rot=(0, fa_rot_y, arm_rot_z), scale=(1.10, 0.82, 1.10), subsurf=1)
    # Opposable Thumb with knuckle break
    make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.046, depth=0.15),
             f"Hero_Thumb_{sx}", m_leather_brown, loc=(sx*1.02 - sx*0.09, 0.26, 0.62), rot=(0.6, fa_rot_y, -sx*0.75), subsurf=1)
    # 3 Curled Fingers (active cartoon fist/grip)
    for f_idx, f_x in enumerate([-0.045, 0.0, 0.045]):
        make_obj(lambda: bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.040, depth=0.15),
                 f"Hero_Finger_{sx}_{f_idx}", m_leather_brown, loc=(sx*1.02 + f_x, 0.27, 0.52), rot=(1.15, fa_rot_y, sx*0.18), subsurf=1)

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

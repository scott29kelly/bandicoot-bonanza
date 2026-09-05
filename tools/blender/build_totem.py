import bpy
import math
import os
import sys
import base64

# Reset Blender to clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

def create_mat(name, color, roughness=0.5, specular=0.5, metallic=0.0, emissive=None, emission_strength=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = specular
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = specular
        if emissive and 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emissive
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = emission_strength
    return mat

# Crash 4 Saturated Tropical Aztec / Tiki Idol Palette (Calibrated for AgX)
m_dark_timber = create_mat("TotemDarkTimber", (0.22, 0.10, 0.04, 1.0), roughness=0.65)
m_light_timber = create_mat("TotemLightTimber", (0.46, 0.25, 0.09, 1.0), roughness=0.52)
m_chisel_crevice = create_mat("TotemCrevice", (0.04, 0.02, 0.01, 1.0), roughness=0.95)
m_mouth_dark = create_mat("TotemMouthDark", (0.02, 0.01, 0.01, 1.0), roughness=0.98)
m_teeth_ivory = create_mat("TotemTeethIvory", (0.96, 0.92, 0.80, 1.0), roughness=0.28)
m_gold_trim = create_mat("TotemGoldTrim", (0.84, 0.62, 0.18, 1.0), roughness=0.68, metallic=0.15)
m_jade_glow = create_mat("TotemJadeGlow", (0.12, 0.88, 0.58, 1.0), roughness=0.25, emissive=(0.04, 0.32, 0.20, 1.0), emission_strength=0.55)
m_moss = create_mat("TotemMoss", (0.20, 0.58, 0.12, 1.0), roughness=0.65)

parts = []

def make_cube(name, mat, loc, scale, rot=(0,0,0)):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    parts.append(obj)
    return obj

def make_cyl(name, mat, loc, radius, depth, rot=(0,0,0), verts=16):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=loc)
    obj = bpy.context.active_object
    obj.name = name
    obj.rotation_euler = rot
    obj.data.materials.append(mat)
    parts.append(obj)
    return obj

def make_octa(name, mat, loc, radius, scale=(1,1,1), rot=(0,0,0)):
    mesh = bpy.data.meshes.new(name)
    verts = [
        (0, 0, radius),
        (0, 0, -radius),
        (radius, 0, 0),
        (-radius, 0, 0),
        (0, radius, 0),
        (0, -radius, 0)
    ]
    faces = [
        (0, 2, 4), (0, 4, 3), (0, 3, 5), (0, 5, 2),
        (1, 4, 2), (1, 3, 4), (1, 5, 3), (1, 2, 5)
    ]
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.scale = scale
    obj.rotation_euler = rot
    if mat:
        obj.data.materials.append(mat)
    parts.append(obj)
    return obj

# ==============================================================================
# 1. STEPPED AZTEC PEDESTAL BASE (z = 0.0 to 0.55)
# ==============================================================================
# Tier 1 (Wide ground base)
make_cube("Base_Tier1", m_dark_timber, (0, 0, 0.125), (1.46, 1.46, 0.25))
# Tier 1 corner foot brackets
for sx in [-1, 1]:
    for sy in [-1, 1]:
        make_cube(f"Base_Corner_{sx}_{sy}", m_gold_trim, (sx * 0.68, sy * 0.68, 0.125), (0.20, 0.20, 0.27))
        # Moss creeping on pedestal corners
        make_cube(f"Base_Moss_{sx}_{sy}", m_moss, (sx * 0.60, sy * 0.60, 0.26), (0.35, 0.35, 0.04))

# Tier 2 (Middle step with carved geometric relief band)
make_cube("Base_Tier2", m_light_timber, (0, 0, 0.36), (1.30, 1.30, 0.22))
# Decorative stepped Aztec chevrons on front face of tier 2
for cx in [-0.42, 0, 0.42]:
    make_cube(f"Base_Deco_{cx}", m_gold_trim, (cx, 0.66, 0.36), (0.20, 0.04, 0.14))

# Tier 3 (Collar under torso)
make_cube("Base_Tier3", m_dark_timber, (0, 0, 0.52), (1.18, 1.18, 0.10))

# ==============================================================================
# 2. LOWER BODY / CHEST TIER (z = 0.57 to 1.12)
# ==============================================================================
# Main torso core
make_cube("Torso_Core", m_light_timber, (0, 0, 0.84), (1.10, 1.10, 0.54))

# Carved stylized tribal forearms folded across belly
for sx in [-1, 1]:
    # Upper arm block
    make_cube(f"Arm_Upper_{sx}", m_dark_timber, (sx * 0.58, 0, 0.88), (0.16, 0.96, 0.42))
    # Forearm coming around to front
    make_cube(f"Arm_Fore_{sx}", m_light_timber, (sx * 0.34, 0.57, 0.74), (0.42, 0.14, 0.16))
    # Carved claw hands clutching tribal center
    make_cube(f"Arm_Hand_{sx}", m_dark_timber, (sx * 0.12, 0.58, 0.74), (0.12, 0.15, 0.14))

# Tribal Aztec Sun Medallion on chest
make_cyl("Chest_Medallion", m_gold_trim, (0, 0.57, 0.94), radius=0.20, depth=0.08, rot=(math.pi/2, 0, 0), verts=16)
# Glowing jade core gem in center of medallion
make_octa("Chest_Jade", m_jade_glow, (0, 0.62, 0.94), radius=0.09, scale=(1, 0.6, 1))

# ==============================================================================
# 3. EXPRESSIVE CARVED TIKI HEAD & MOUTH (z = 1.12 to 2.10)
# ==============================================================================
# Head block core
make_cube("Head_Core", m_dark_timber, (0, 0, 1.55), (1.16, 1.16, 0.88))

# Big deep carved gaping mouth cavity (front face)
make_cube("Mouth_Cavity", m_mouth_dark, (0, 0.50, 1.30), (0.86, 0.28, 0.38))
# Recessed mouth backplate shadow
make_cube("Mouth_Back", m_chisel_crevice, (0, 0.42, 1.30), (0.82, 0.14, 0.34))

# Carved Sharp Fangs (Ivory bone teeth on upper and lower jaw!)
# 4 Upper teeth pointing downward
for i, tx in enumerate([-0.32, -0.11, 0.11, 0.32]):
    tooth_len = 0.16 if (i == 0 or i == 3) else 0.12  # Long corner canine fangs!
    make_cube(f"Tooth_Top_{i}", m_teeth_ivory, (tx, 0.62, 1.44 - tooth_len/2), (0.11, 0.10, tooth_len), rot=(0.1, 0, 0))

# 4 Lower teeth pointing upward
for i, tx in enumerate([-0.30, -0.10, 0.10, 0.30]):
    tooth_len = 0.14 if (i == 0 or i == 3) else 0.10
    make_cube(f"Tooth_Bot_{i}", m_teeth_ivory, (tx, 0.62, 1.16 + tooth_len/2), (0.10, 0.10, tooth_len), rot=(-0.1, 0, 0))

# Chiseled Broad Wooden Nose (flared wedge between eyes and mouth)
make_cube("Nose_Bridge", m_light_timber, (0, 0.64, 1.56), (0.24, 0.18, 0.28), rot=(-0.15, 0, 0))
# Aztec gold nose ring / bar across nostrils
make_cyl("Nose_Bar", m_gold_trim, (0, 0.69, 1.48), radius=0.05, depth=0.36, rot=(0, math.pi/2, 0), verts=12)

# Heavy Fierce Brow Ridge (angled down in center for iconic mascot grimace)
for sx in [-1, 1]:
    make_cube(f"Brow_{sx}", m_light_timber, (sx * 0.28, 0.64, 1.76), (0.56, 0.22, 0.18), rot=(0, sx * 0.20, 0))
# Center brow furrow wedge
make_cube("Brow_Center", m_dark_timber, (0, 0.62, 1.74), (0.18, 0.20, 0.16))

# Carved Eye Sockets & Glowing Jade Eyes
for sx in [-1, 1]:
    # Socket shadow cavity
    make_cube(f"Eye_Socket_{sx}", m_mouth_dark, (sx * 0.28, 0.56, 1.62), (0.34, 0.18, 0.24))
    # Piercing glowing jade eye crystal!
    make_octa(f"Eye_Jade_{sx}", m_jade_glow, (sx * 0.28, 0.60, 1.62), radius=0.12, scale=(1.2, 0.6, 0.9), rot=(0.2, 0, 0))

# Tribal Wooden Ear Spools / Plugs on head sides
for sx in [-1, 1]:
    # Wooden spool rim
    make_cyl(f"Ear_Spool_{sx}", m_light_timber, (sx * 0.64, 0, 1.54), radius=0.22, depth=0.20, rot=(0, math.pi/2, 0), verts=16)
    # Jade center insert
    make_cyl(f"Ear_Jade_{sx}", m_jade_glow, (sx * 0.73, 0, 1.54), radius=0.14, depth=0.06, rot=(0, math.pi/2, 0), verts=14)

# ==============================================================================
# 4. AZTEC FEATHER CREST CROWN & GEM CHALICE (z = 2.00 to 2.85)
# ==============================================================================
# Crown base collar (dark carved timber foundation with front gold relief)
make_cube("Crown_Base", m_dark_timber, (0, 0, 2.04), (1.24, 1.24, 0.10))
make_cube("Crown_Base_Trim", m_gold_trim, (0, 0.63, 2.04), (1.04, 0.04, 0.06))

# Stepped Headdress Feathers / Crest
# Tall center feather plume
make_cube("Crest_Center", m_light_timber, (0, 0, 2.32), (0.32, 0.14, 0.46))
make_cube("Crest_Center_Trim", m_gold_trim, (0, 0.08, 2.32), (0.18, 0.04, 0.38))

# Flared side feather steps
for sx in [-1, 1]:
    make_cube(f"Crest_Mid_{sx}", m_dark_timber, (sx * 0.34, 0, 2.26), (0.28, 0.14, 0.36), rot=(0, sx * 0.15, 0))
    make_cube(f"Crest_Out_{sx}", m_light_timber, (sx * 0.60, 0, 2.18), (0.24, 0.14, 0.26), rot=(0, sx * 0.30, 0))

# 4 Carved Wooden Chalice Claws holding the floating gem basin
claw_radius = 0.42
for i, ca in enumerate([0, math.pi/2, math.pi, math.pi*3/2]):
    cx = math.cos(ca) * claw_radius
    cy = math.sin(ca) * claw_radius
    make_cube(f"Chalice_Claw_{i}", m_gold_trim, (cx, cy, 2.38), (0.12, 0.12, 0.36), rot=(-math.sin(ca)*0.35, math.cos(ca)*0.35, 0))

# Chalice Basin Bowl
make_cyl("Chalice_Bowl", m_dark_timber, (0, 0, 2.22), radius=0.48, depth=0.16, verts=16)

# ==============================================================================
# 5. GLOWING FACETED JADE CROWN GEM (z = 2.68)
# ==============================================================================
# Master faceted floating checkpoint gem
make_octa("Checkpoint_Gem_Core", m_jade_glow, (0, 0, 2.68), radius=0.34, scale=(1.0, 1.0, 1.28), rot=(0, 0, math.pi/4))
# Accent faceted diamond belt around gem equator
make_octa("Checkpoint_Gem_Belt", m_jade_glow, (0, 0, 2.68), radius=0.36, scale=(1.12, 1.12, 0.42), rot=(0, 0, 0))

# ==============================================================================
# FINALIZE, BAKE ROTATION, AND EXPORT
# ==============================================================================
# Separate body and crown gem parts so the crown gem can bob & spin dynamically in Three.js
body_parts = [p for p in parts if not p.name.startswith("Checkpoint_Gem")]
gem_parts = [p for p in parts if p.name.startswith("Checkpoint_Gem")]

bpy.ops.object.select_all(action='DESELECT')
for p in body_parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = body_parts[0]
bpy.ops.object.shade_smooth()
bpy.ops.object.join()
body_master = bpy.context.active_object
body_master.name = "Totem_Body"

bpy.ops.object.select_all(action='DESELECT')
for p in gem_parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = gem_parts[0]
bpy.ops.object.shade_smooth()
bpy.ops.object.join()
gem_master = bpy.context.active_object
gem_master.name = "Totem_Crown_Gem"

# Apply 180° rotation around Z so front (+Y in Blender) faces Three.js +Z (towards camera & player)
for obj in [body_master, gem_master]:
    obj.rotation_euler.z = math.pi
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)

# Select both for export
bpy.ops.object.select_all(action='DESELECT')
body_master.select_set(True)
gem_master.select_set(True)

# Export GLB
output_glb = "assets/models/totem.glb"
bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format='GLB',
    export_apply=True
)

# Export base64 companion JS
with open(output_glb, "rb") as f:
    b64_totem = base64.b64encode(f.read()).decode("utf-8")

output_js = "assets/models/totem_model.js"
with open(output_js, "w", encoding="utf-8") as f:
    f.write(f'window.TOTEM_GLB_BASE64 = "{b64_totem}";\n')

size_kb = os.path.getsize(output_glb) / 1024
print(f"\n[TOTEM BUILD] Exported {output_glb} ({size_kb:.1f} KB)")
print(f"[TOTEM BUILD] Exported inlined base64 to {output_js}")

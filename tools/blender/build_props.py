import bpy
import math
import os
import sys

# Ensure clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

def create_mat(name, color, roughness=0.5, specular=0.5, metallic=0.0, emissive=None):
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
                bsdf.inputs['Emission Strength'].default_value = 1.0
    return mat

m_wood_frame = create_mat("WoodFrame", (0.55, 0.32, 0.12, 1.0), roughness=0.55)
m_wood_plank = create_mat("WoodPlank", (0.68, 0.44, 0.20, 1.0), roughness=0.50)
m_iron_bracket = create_mat("IronBracket", (0.18, 0.16, 0.15, 1.0), roughness=0.35, metallic=0.7)
m_brass_rivet = create_mat("BrassRivet", (0.75, 0.58, 0.18, 1.0), roughness=0.25, metallic=0.85)

m_tnt_red = create_mat("TntRed", (0.76, 0.12, 0.08, 1.0), roughness=0.52)
m_tnt_label = create_mat("TntLabel", (0.94, 0.88, 0.74, 1.0), roughness=0.45)
m_tnt_text = create_mat("TntText", (0.12, 0.02, 0.02, 1.0), roughness=0.35)
m_fuse_wick = create_mat("FuseWick", (0.28, 0.24, 0.18, 1.0), roughness=0.7)
m_spark_glow = create_mat("SparkGlow", (1.0, 0.5, 0.1, 1.0), roughness=0.1, emissive=(1.0, 0.4, 0.05, 1.0))

def build_crate_mesh(is_tnt=False, size=1.15):
    parts = []
    hs = size / 2.0
    f_thick = size * 0.11  # frame thickness
    
    # 1. Recessed Center Core Box (Plank interior)
    bpy.ops.mesh.primitive_cube_add(size=size * 0.94, location=(0, 0, 0))
    core = bpy.context.active_object
    core.name = "Crate_Core"
    core.data.materials.append(m_tnt_red if is_tnt else m_wood_plank)
    parts.append(core)

    # 2. 12 Beveled Outer Edge Frame Rails
    # 4 Vertical rails
    for sx in [-1, 1]:
        for sy in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx * (hs - f_thick/2), sy * (hs - f_thick/2), 0))
            rail = bpy.context.active_object
            rail.scale = (f_thick, f_thick, size)
            rail.data.materials.append(m_wood_frame)
            parts.append(rail)

    # 4 Horizontal Top rails & 4 Horizontal Bottom rails
    for sz in [-1, 1]:
        for sx in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx * (hs - f_thick/2), 0, sz * (hs - f_thick/2)))
            rail = bpy.context.active_object
            rail.scale = (f_thick, size, f_thick)
            rail.data.materials.append(m_wood_frame)
            parts.append(rail)
        for sy in [-1, 1]:
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, sy * (hs - f_thick/2), sz * (hs - f_thick/2)))
            rail = bpy.context.active_object
            rail.scale = (size, f_thick, f_thick)
            rail.data.materials.append(m_wood_frame)
            parts.append(rail)

    # 3. Diagonal Braces on 4 vertical faces
    brace_w = f_thick * 0.8
    brace_t = f_thick * 0.45
    brace_len = math.sqrt(2 * (size - f_thick*2)**2) * 1.05
    for rot_y, sx, sy in [(0, 0, hs - brace_t/2), (math.pi, 0, -hs + brace_t/2)]:
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, sy, 0))
        brace1 = bpy.context.active_object
        brace1.scale = (brace_w, brace_t, brace_len)
        brace1.rotation_euler = (0, math.pi/4, 0)
        brace1.data.materials.append(m_wood_frame)
        parts.append(brace1)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx, sy, 0))
        brace2 = bpy.context.active_object
        brace2.scale = (brace_w, brace_t, brace_len)
        brace2.rotation_euler = (0, -math.pi/4, 0)
        brace2.data.materials.append(m_wood_frame)
        parts.append(brace2)

    # 4. 8 Forged Iron Corner Brackets & Rivets
    b_size = f_thick * 1.6
    for sx in [-1, 1]:
        for sy in [-1, 1]:
            for sz in [-1, 1]:
                bpy.ops.mesh.primitive_cube_add(size=1.0, location=(sx*(hs - b_size/4), sy*(hs - b_size/4), sz*(hs - b_size/4)))
                bracket = bpy.context.active_object
                bracket.scale = (b_size, b_size, b_size)
                bracket.data.materials.append(m_iron_bracket)
                parts.append(bracket)
                # Brass rivet dot
                bpy.ops.mesh.primitive_uv_sphere_add(radius=f_thick*0.22, location=(sx*(hs + 0.01), sy*(hs - b_size/2), sz*(hs - b_size/2)))
                rivet = bpy.context.active_object
                rivet.data.materials.append(m_brass_rivet)
                parts.append(rivet)

    # 5. TNT Specific: Embossed TNT Label plate on front/back & Fuse on top
    if is_tnt:
        for sy in [-1, 1]:
            # Cream label rectangle
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, sy * (hs + 0.015), 0))
            lbl = bpy.context.active_object
            lbl.scale = (size * 0.72, 0.02, size * 0.32)
            lbl.data.materials.append(m_tnt_label)
            parts.append(lbl)
            # Black "TNT" block plate
            bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, sy * (hs + 0.025), 0))
            txt = bpy.context.active_object
            txt.scale = (size * 0.58, 0.02, size * 0.22)
            txt.data.materials.append(m_tnt_text)
            parts.append(txt)

        # Fuse wick on top center
        bpy.ops.mesh.primitive_cylinder_add(radius=0.035, depth=0.22, location=(0, 0, hs + 0.10))
        wick = bpy.context.active_object
        wick.rotation_euler = (0.2, 0.15, 0)
        wick.data.materials.append(m_fuse_wick)
        parts.append(wick)

        # Glowing spark tip
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.045, location=(0.04, 0.03, hs + 0.22))
        spark = bpy.context.active_object
        spark.data.materials.append(m_spark_glow)
        parts.append(spark)

    # Select all parts, smooth and join
    bpy.ops.object.select_all(action='DESELECT')
    for p in parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.shade_smooth()
    bpy.ops.object.join()
    master = bpy.context.active_object
    master.name = "TNT_Crate" if is_tnt else "Wooden_Crate"
    return master

# Build Wooden Crate
crate = build_crate_mesh(is_tnt=False)
output_crate_glb = "assets/models/crate.glb"
bpy.ops.export_scene.gltf(filepath=output_crate_glb, export_format='GLB', export_apply=True)

# Build TNT Crate
bpy.ops.object.delete(use_global=False)
tnt = build_crate_mesh(is_tnt=True)
output_tnt_glb = "assets/models/tnt.glb"
bpy.ops.export_scene.gltf(filepath=output_tnt_glb, export_format='GLB', export_apply=True)

# Export base64 JS pack for crates & TNT
import base64
with open(output_crate_glb, "rb") as f:
    b64_crate = base64.b64encode(f.read()).decode("utf-8")
with open(output_tnt_glb, "rb") as f:
    b64_tnt = base64.b64encode(f.read()).decode("utf-8")

output_props_js = "assets/models/props_model.js"
with open(output_props_js, "w", encoding="utf-8") as f:
    f.write(f'window.CRATE_GLB_BASE64 = "{b64_crate}";\n')
    f.write(f'window.TNT_GLB_BASE64 = "{b64_tnt}";\n')

print(f"\n[PROPS BUILD] Exported {output_crate_glb} ({os.path.getsize(output_crate_glb)/1024:.1f} KB)")
print(f"[PROPS BUILD] Exported {output_tnt_glb} ({os.path.getsize(output_tnt_glb)/1024:.1f} KB)")
print(f"[PROPS BUILD] Exported inlined base64 to {output_props_js}")

import bpy
import math
import os
import sys
import base64
import random

# Reset Blender to clean scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Deterministic seed for reproducible organic bark sculpting
random.seed(4242)

def create_mat(name, color, roughness=0.5, specular=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        if 'Specular IOR Level' in bsdf.inputs:
            bsdf.inputs['Specular IOR Level'].default_value = specular
        elif 'Specular' in bsdf.inputs:
            bsdf.inputs['Specular'].default_value = specular
    return mat

# Saturated Crash 4 Tropical Redwood / Ironwood Palette
m_bark_deep = create_mat("BarkDeep", (0.28, 0.14, 0.06, 1.0), roughness=0.72)
m_bark_warm = create_mat("BarkWarm", (0.44, 0.24, 0.10, 1.0), roughness=0.62)
m_bark_highlight = create_mat("BarkHighlight", (0.58, 0.35, 0.16, 1.0), roughness=0.55)
m_fissure = create_mat("BarkFissure", (0.14, 0.07, 0.03, 1.0), roughness=0.88)
m_end_wood = create_mat("EndWood", (0.86, 0.64, 0.30, 1.0), roughness=0.42)
m_end_ring = create_mat("EndRing", (0.52, 0.30, 0.12, 1.0), roughness=0.48)
m_end_core = create_mat("EndCore", (0.32, 0.18, 0.08, 1.0), roughness=0.55)
m_moss = create_mat("MossClump", (0.20, 0.58, 0.12, 1.0), roughness=0.60)

parts = []

LENGTH = 9.5
RADIUS = 0.72
HALF_L = LENGTH / 2.0

# ==============================================================================
# 1. CONTINUOUS SOLID TRUNK CORE (Organic slightly fluted cross section)
# ==============================================================================
# Solid trunk foundation with bevel
bpy.ops.mesh.primitive_cylinder_add(
    vertices=24,
    radius=RADIUS * 0.94,
    depth=LENGTH * 0.995,
    location=(0, 0, 0),
    rotation=(0, math.pi / 2, 0)
)
trunk = bpy.context.active_object
trunk.name = "Trunk_Body"
trunk.data.materials.append(m_bark_deep)
parts.append(trunk)

# ==============================================================================
# 2. ORGANIC STAGGERED BARK PLATES (No mechanical slats!)
# ==============================================================================
# Instead of 16 continuous full-length strips, create 10 overlapping bark sectors,
# each broken into 4 to 6 irregular staggered puzzle plates along the length.
NUM_SECTORS = 11
for sec in range(NUM_SECTORS):
    angle_center = (sec / NUM_SECTORS) * (math.pi * 2)
    # Staggered plate cuts along X
    num_cuts = random.randint(4, 6)
    cut_points = sorted([random.uniform(-HALF_L * 0.88, HALF_L * 0.88) for _ in range(num_cuts - 1)])
    cut_spans = [-HALF_L * 0.96] + cut_points + [HALF_L * 0.96]

    for c_idx in range(len(cut_spans) - 1):
        x_start = cut_spans[c_idx]
        x_end = cut_spans[c_idx + 1]
        span_len = (x_end - x_start) * 0.94  # Slight natural gap at plate ends
        if span_len < 0.35:
            continue
        center_x = (x_start + x_end) / 2.0

        # Organic plate angle jitter and radial thickness
        plate_ang = angle_center + random.uniform(-0.04, 0.04)
        r_thick = RADIUS * random.uniform(0.045, 0.075)
        r_dist = RADIUS * 0.94 + r_thick * 0.5

        py = math.cos(plate_ang) * r_dist
        pz = math.sin(plate_ang) * r_dist
        arc_width = (math.pi * 2 * RADIUS / NUM_SECTORS) * random.uniform(0.92, 1.08)

        # Alternating rich warm tones
        plate_mat = m_bark_highlight if ((sec + c_idx) % 3 == 0) else m_bark_warm

        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(center_x, py, pz)
        )
        plate = bpy.context.active_object
        plate.name = f"BarkPlate_{sec}_{c_idx}"
        plate.scale = (span_len, arc_width, r_thick)
        plate.rotation_euler = (plate_ang, random.uniform(-0.02, 0.02), random.uniform(-0.02, 0.02))
        plate.data.materials.append(plate_mat)
        parts.append(plate)

# ==============================================================================
# 3. CHISELED BURLS & BRANCH STUMPS (Organically rooted)
# ==============================================================================
# Burl swellings on the trunk
burls = [
    (-3.1, 1.1, 0.45, 0.28),
    (-0.8, -2.4, 0.52, 0.32),
    (1.6, 2.6, 0.48, 0.30),
    (3.4, -0.7, 0.42, 0.26)
]
for bx, ba, bw, bh in burls:
    by = math.cos(ba) * (RADIUS * 0.97)
    bz = math.sin(ba) * (RADIUS * 0.97)
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=12,
        ring_count=8,
        radius=bh,
        location=(bx, by, bz)
    )
    burl = bpy.context.active_object
    burl.scale = (bw / bh, 1.0, 0.65)
    burl.rotation_euler = (ba, 0, 0)
    burl.data.materials.append(m_bark_warm)
    parts.append(burl)

# 3 Sculpted Cut Branch Stumps with flared collars
stump_defs = [
    (-2.4, 0.85, 0.32, 0.22),
    (0.6, -1.95, 0.28, 0.19),
    (2.8, 2.35, 0.34, 0.21)
]
for sx, sa, slen, srad in stump_defs:
    # Flared collar at base of branch
    cy = math.cos(sa) * (RADIUS * 0.96)
    cz = math.sin(sa) * (RADIUS * 0.96)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=14,
        radius=srad * 1.35,
        depth=0.12,
        location=(sx, cy, cz)
    )
    collar = bpy.context.active_object
    collar.rotation_euler = (sa - math.pi / 2, 0, 0)
    collar.data.materials.append(m_bark_deep)
    parts.append(collar)

    # Branch stub body
    by = math.cos(sa) * (RADIUS + slen * 0.45)
    bz = math.sin(sa) * (RADIUS + slen * 0.45)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12,
        radius=srad,
        depth=slen,
        location=(sx, by, bz)
    )
    stub = bpy.context.active_object
    stub.rotation_euler = (sa - math.pi / 2, 0, 0)
    stub.data.materials.append(m_bark_warm)
    parts.append(stub)

    # Exposed cut face with concentric heartwood
    fy = math.cos(sa) * (RADIUS + slen * 0.92)
    fz = math.sin(sa) * (RADIUS + slen * 0.92)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=10,
        radius=srad * 0.84,
        depth=0.035,
        location=(sx, fy, fz)
    )
    face = bpy.context.active_object
    face.rotation_euler = (sa - math.pi / 2, 0, 0)
    face.data.materials.append(m_end_wood)
    parts.append(face)

# ==============================================================================
# 4. CHISELED END CAPS WITH RECESSED GROWTH RINGS (Both ends)
# ==============================================================================
for side in [-1, 1]:
    cap_x = side * HALF_L

    # Chiseled outer bark lip / beveled collar
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=RADIUS * 1.02,
        depth=0.14,
        location=(side * (HALF_L - 0.06), 0, 0),
        rotation=(0, math.pi / 2, 0)
    )
    lip = bpy.context.active_object
    lip.data.materials.append(m_bark_deep)
    parts.append(lip)

    # Recessed honey end-grain disc
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=RADIUS * 0.90,
        depth=0.04,
        location=(cap_x, 0, 0),
        rotation=(0, math.pi / 2, 0)
    )
    disc = bpy.context.active_object
    disc.data.materials.append(m_end_wood)
    parts.append(disc)

    # Concentric growth rings (subtly stepped for 3D depth)
    rings = [
        (RADIUS * 0.72, 0.045, m_end_ring),
        (RADIUS * 0.54, 0.050, m_end_wood),
        (RADIUS * 0.36, 0.055, m_end_ring),
        (RADIUS * 0.18, 0.060, m_end_core)
    ]
    for r_rad, r_depth, r_mat in rings:
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=20,
            radius=r_rad,
            depth=r_depth,
            location=(cap_x + side * (r_depth - 0.04) * 0.5, 0, 0),
            rotation=(0, math.pi / 2, 0)
        )
        ring_obj = bpy.context.active_object
        ring_obj.data.materials.append(r_mat)
        parts.append(ring_obj)

    # Organic V-groove check crack cut into cut face
    for crack_a in [0.72, -2.1]:
        bpy.ops.mesh.primitive_cube_add(
            size=1.0,
            location=(
                cap_x + side * 0.02,
                math.cos(crack_a) * (RADIUS * 0.40),
                math.sin(crack_a) * (RADIUS * 0.40)
            )
        )
        crack = bpy.context.active_object
        crack.scale = (0.06, 0.045, RADIUS * 0.45)
        crack.rotation_euler = (crack_a + math.pi / 2, 0, 0)
        crack.data.materials.append(m_fissure)
        parts.append(crack)

# ==============================================================================
# 5. ORGANIC CLUSTERED MOSS PATCHES (Nestled in fissures and at stump bases)
# ==============================================================================
moss_clusters = [
    # (x, angle, size_x, size_arc)
    (-3.6, 0.4, 0.85, 0.38),
    (-2.1, 1.2, 0.65, 0.32),
    (-0.4, -1.8, 0.92, 0.42),
    (1.2, 0.1, 0.78, 0.35),
    (2.5, 2.5, 0.60, 0.30),
    (3.8, -0.9, 0.82, 0.36)
]
for mx, ma, msx, msa in moss_clusters:
    # 2-3 overlapping rounded moss mounds per cluster
    for m_sub in range(3):
        sub_x = mx + (m_sub - 1) * 0.18
        sub_a = ma + (m_sub - 1) * 0.08
        my = math.cos(sub_a) * (RADIUS * 0.99)
        mz = math.sin(sub_a) * (RADIUS * 0.99)
        bpy.ops.mesh.primitive_uv_sphere_add(
            segments=10,
            ring_count=8,
            radius=0.14,
            location=(sub_x, my, mz)
        )
        moss_mound = bpy.context.active_object
        moss_mound.scale = (msx * 0.45, msa * 0.55, 0.35)
        moss_mound.rotation_euler = (sub_a, 0, 0)
        moss_mound.data.materials.append(m_moss)
        parts.append(moss_mound)

# ==============================================================================
# FINALIZE, SMOOTH, AND EXPORT
# ==============================================================================
bpy.ops.object.select_all(action='DESELECT')
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.shade_smooth()
bpy.ops.object.join()

master = bpy.context.active_object
master.name = "Rolling_Log_Sculpted"

# Export GLB
output_glb = "assets/models/rolling_log.glb"
bpy.ops.export_scene.gltf(
    filepath=output_glb,
    export_format='GLB',
    export_apply=True
)

# Export base64 companion JS
with open(output_glb, "rb") as f:
    b64_log = base64.b64encode(f.read()).decode("utf-8")

output_js = "assets/models/log_model.js"
with open(output_js, "w", encoding="utf-8") as f:
    f.write(f'window.LOG_GLB_BASE64 = "{b64_log}";\n')

size_kb = os.path.getsize(output_glb) / 1024
print(f"\n[ORGANIC LOG BUILD] Exported {output_glb} ({size_kb:.1f} KB)")
print(f"[ORGANIC LOG BUILD] Exported inlined base64 to {output_js}")

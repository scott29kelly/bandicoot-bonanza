"""Blender 5.2: turn a raw generated GLB into a game-ready one.

  blender -b -P pipeline/prep.py -- <in.glb> <out.glb> [--faces N] [--tex N] [--yaw DEG]

- Joins all meshes, applies transforms, recentres: origin at the bottom centre, +Y up.
- Normalises to 1 m tall, so the game scales by the height it wants.
- Decimates to --faces (default 12000) and smooth-shades with auto smooth by angle.
- Downsizes the base-colour texture to --tex (default 1024) and exports it as WebP.
"""
import bpy, sys, argparse
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('dst')
ap.add_argument('--faces', type=int, default=12000)
ap.add_argument('--tex', type=int, default=1024)
ap.add_argument('--yaw', type=float, default=0.0)
a = ap.parse_args(argv)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=a.src)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
bpy.context.view_layer.objects.active = meshes[0]
if len(meshes) > 1:
    bpy.ops.object.join()
obj = bpy.context.active_object
obj.parent = None
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
# Drop the importer's empties so only the mesh exports.
for o in list(bpy.context.scene.objects):
    if o is not obj:
        bpy.data.objects.remove(o, do_unlink=True)

if a.yaw:
    import math
    obj.rotation_euler[2] = math.radians(a.yaw)
    bpy.ops.object.transform_apply(rotation=True)

# Decimate first, then measure.
faces = len(obj.data.polygons)
if faces > a.faces:
    m = obj.modifiers.new('dec', 'DECIMATE')
    m.ratio = a.faces / faces
    bpy.ops.object.modifier_apply(modifier=m.name)

# Bounds in Blender space (Z up). Origin -> bottom centre, height -> 1.
bb = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
lo = Vector((min(v.x for v in bb), min(v.y for v in bb), min(v.z for v in bb)))
hi = Vector((max(v.x for v in bb), max(v.y for v in bb), max(v.z for v in bb)))
centre = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
obj.data.transform(__import__('mathutils').Matrix.Translation(-centre))
s = 1.0 / max(hi.z - lo.z, 1e-6)
obj.scale = (s, s, s)
bpy.ops.object.transform_apply(scale=True)

bpy.ops.object.shade_smooth_by_angle(angle=1.0472)  # 60 degrees: soft forms, crisp creases

for mat in obj.data.materials:
    if not mat or not mat.use_nodes:
        continue
    for n in mat.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and max(n.image.size) > a.tex:
            n.image.scale(a.tex, a.tex)

bpy.ops.export_scene.gltf(filepath=a.dst, export_format='GLB', use_selection=False,
                          export_image_format='WEBP', export_image_quality=85,
                          export_apply=True, export_yup=True)
print(f'[prep] {a.src} -> {a.dst}: {len(obj.data.polygons)} faces, footprint '
      f'{(hi.x - lo.x) * s:.2f} x {(hi.y - lo.y) * s:.2f} per 1 m height')

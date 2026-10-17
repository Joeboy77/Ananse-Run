import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

ARM_MIN_X = 0.2
ARM_MIN_Z = 1.1
ARM_MAX_Z = 1.36
SHOULDER = Vector((0.2, 0.0, 1.25))
ARM_SCALE = 0.8
ARM_DROP_DEGREES = 84
ARM_OFFSET = Vector((-0.035, -0.03, -0.1))


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(argv) < 2:
        raise SystemExit("usage: blender --background --python prepare_character.py -- <model.glb> <name>")
    return argv[0], argv[1]


def import_body(path):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for mesh in meshes:
        mesh.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    if len(meshes) > 1:
        bpy.ops.object.join()
    body = bpy.context.view_layer.objects.active
    for obj in list(bpy.context.scene.objects):
        if obj is not body:
            bpy.data.objects.remove(obj, do_unlink=True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    return body


def in_arm(point):
    return abs(point.x) > ARM_MIN_X and ARM_MIN_Z < point.z < ARM_MAX_Z


def arm_matrix(side):
    pivot = Vector((side * SHOULDER.x, SHOULDER.y, SHOULDER.z))
    target = pivot + Vector((side * ARM_OFFSET.x, ARM_OFFSET.y, ARM_OFFSET.z))
    rotation = Matrix.Rotation(math.radians(side * ARM_DROP_DEGREES), 4, "Y")
    return Matrix.Translation(target) @ rotation @ Matrix.Scale(ARM_SCALE, 4) @ Matrix.Translation(-pivot)


def make_extra_arms(body, name):
    arms = body.copy()
    arms.data = body.data.copy()
    arms.name = f"{name}_extra_arms"
    bpy.context.scene.collection.objects.link(arms)
    mesh = bmesh.new()
    mesh.from_mesh(arms.data)
    outside = [face for face in mesh.faces if not in_arm(face.calc_center_median())]
    bmesh.ops.delete(mesh, geom=outside, context="FACES")
    matrices = {1: arm_matrix(1), -1: arm_matrix(-1)}
    for vert in mesh.verts:
        vert.co = matrices[1 if vert.co.x > 0 else -1] @ vert.co
    mesh.normal_update()
    mesh.to_mesh(arms.data)
    mesh.free()
    return arms


def select_only(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.hide_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj


def main():
    source, name = args()
    folder = os.path.dirname(os.path.abspath(source))
    body = import_body(source)
    body.name = name
    arms = make_extra_arms(body, name)

    select_only(arms)
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(folder, f"{name}_extra_arms.glb"),
        export_format="GLB",
        use_selection=True,
    )

    select_only(body)
    bpy.ops.export_scene.fbx(
        filepath=os.path.join(folder, f"{name}_mesh.fbx"),
        use_selection=True,
        object_types={"MESH"},
        path_mode="COPY",
        embed_textures=True,
    )

    arms.hide_set(True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(folder, f"{name}.blend"))
    print(f"PREPARED {name}: body {len(body.data.polygons)} faces, arms {len(arms.data.polygons)} faces")


main()

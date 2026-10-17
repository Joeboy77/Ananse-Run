import os
import sys

import bpy

ROOT_BONE = "mixamorig:Hips"
BASE_CLIP = "idle"
IN_PLACE = {"run", "jump", "slide", "strafe_left", "strafe_right", "stumble", "menu_idle"}


def args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(argv) < 3:
        raise SystemExit(
            "usage: blender --background --python combine_animations.py -- <fbx folder> <textured.glb> <output.glb>"
        )
    return argv[0], argv[1], argv[2]


def import_fbx(path):
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.fbx(filepath=path)
    added = [obj for obj in bpy.context.scene.objects if obj not in before]
    armature = next(obj for obj in added if obj.type == "ARMATURE")
    return armature, added


def remove_objects(objects):
    for obj in objects:
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if data is not None and data.users == 0:
            if isinstance(data, bpy.types.Mesh):
                bpy.data.meshes.remove(data)
            elif isinstance(data, bpy.types.Armature):
                bpy.data.armatures.remove(data)


def action_fcurves(action):
    if hasattr(action, "fcurves") and len(action.fcurves) > 0:
        return list(action.fcurves)
    curves = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for channelbag in strip.channelbags:
                curves.extend(channelbag.fcurves)
    return curves


def remove_drift(action, horizontal_indices):
    path = f'pose.bones["{ROOT_BONE}"].location'
    for curve in action_fcurves(action):
        if curve.data_path != path or curve.array_index not in horizontal_indices:
            continue
        points = curve.keyframe_points
        if len(points) < 2:
            continue
        start_frame, start_value = points[0].co
        end_frame, end_value = points[-1].co
        span = end_frame - start_frame or 1
        slope = (end_value - start_value) / span
        for point in points:
            shift = slope * (point.co[0] - start_frame) + start_value
            point.co[1] -= shift
            point.handle_left[1] -= shift
            point.handle_right[1] -= shift
        curve.update()


def vertical_index(armature):
    bone = armature.data.bones[ROOT_BONE]
    axes = [bone.matrix_local.col[i].xyz for i in range(3)]
    world = [(armature.matrix_world.to_3x3() @ axis).normalized() for axis in axes]
    return max(range(3), key=lambda i: abs(world[i].z))


def apply_texture(mesh, textured_path):
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=textured_path)
    added = [obj for obj in bpy.context.scene.objects if obj not in before]
    source = next(obj for obj in added if obj.type == "MESH")
    material = source.data.materials[0]
    mesh.data.materials.clear()
    mesh.data.materials.append(material)
    remove_objects(added)


def main():
    folder, textured, output = args()
    bpy.ops.wm.read_factory_settings(use_empty=True)

    clips = sorted(name[:-4] for name in os.listdir(folder) if name.lower().endswith(".fbx"))
    if BASE_CLIP not in clips:
        raise SystemExit(f"{BASE_CLIP}.fbx is required in {folder}")

    base, base_objects = import_fbx(os.path.join(folder, f"{BASE_CLIP}.fbx"))
    base.name = "Armature"
    mesh = next(obj for obj in base_objects if obj.type == "MESH")
    mesh.name = "Ananse"
    upward = vertical_index(base)
    horizontal = {i for i in range(3) if i != upward}

    actions = {}
    base.animation_data.action.name = BASE_CLIP
    actions[BASE_CLIP] = base.animation_data.action

    for clip in clips:
        if clip == BASE_CLIP:
            continue
        armature, added = import_fbx(os.path.join(folder, f"{clip}.fbx"))
        action = armature.animation_data.action
        action.name = clip
        actions[clip] = action
        armature.animation_data.action = None
        remove_objects(added)

    for clip, action in actions.items():
        action.use_fake_user = True
        if clip in IN_PLACE:
            remove_drift(action, horizontal)

    apply_texture(mesh, textured)

    animation = base.animation_data
    animation.action = None
    for clip, action in actions.items():
        track = animation.nla_tracks.new()
        track.name = clip
        start = int(action.frame_range[0])
        strip = track.strips.new(clip, start, action)
        strip.name = clip
        track.mute = True

    bpy.ops.object.select_all(action="DESELECT")
    base.select_set(True)
    mesh.select_set(True)
    bpy.context.view_layer.objects.active = base
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format="GLB",
        use_selection=True,
        export_animation_mode="NLA_TRACKS",
        export_apply=True,
    )
    bpy.ops.wm.save_as_mainfile(filepath=os.path.splitext(output)[0] + "_rigged.blend")
    print(f"COMBINED {len(actions)} clips: {', '.join(sorted(actions))}; vertical axis index {upward}")


main()

# Owner guide: art, accounts and audio

Claude Code gives these steps at the right time and adapts them if anything has changed. Software menus change between versions; if a button is not where a step says, describe what you see.

## Tools to install (Phase 0)

- Node.js (current LTS) from nodejs.org. Check with `node -v`.
- Git from git-scm.com. Check with `git --version`.
- VS Code from code.visualstudio.com.
- Claude Code (docs.claude.com).
- Google Chrome on the computer, for developer tools.
- A GitHub account with a private repository for the project.
- Blender (latest stable) from blender.org. Free. Needed from Phase 2.
- Chrome on the phone. Phone and computer on the same Wi-Fi or hotspot when testing.

## Learning Blender basics (before or during Phase 2)

Spend 2 to 4 hours on free YouTube beginner tutorials covering:

- Moving around the 3D view (orbit, pan, zoom).
- Selecting, moving, rotating and scaling objects.
- Edit mode basics: vertices, edges, faces.
- Applying a material and a texture.
- Importing and exporting FBX and glTF files.
- Playing an animation on the timeline.

Sculpting, rendering and the Blender game engine are not needed.

## Creating, rigging and animating Ananse

**Step A: Character brief.** Agree with Claude Code on Ananse's look in writing: age, build, skin tone, clothing (for example a cloth wrap in kente-inspired colours and a small leather pouch of stories), the four arms, face and expression. Slightly cartoonish proportions: larger head, hands and feet.

**Step B: Concept art.** 3 to 5 front and side reference images. Draw them, ask a local illustrator (best for a real product, clear ownership), or use an AI image tool and check that commercial use is allowed. Needed: a front view and a side view in T-pose or A-pose on a plain background.

**Step C: Build the 3D model.** Pick one route:

- Route 1, AI 3D generation (fastest): upload the front concept to a tool such as Meshy or Tripo, stylised or cartoon mode. Check the licence allows commercial use on your plan. Download as GLB or FBX.
- Route 2, licensed base model: buy or download a stylised character with a commercial licence (for example Sketchfab, filtered by licence), then change clothing, colours and face in Blender.
- Route 3, commission an artist: best quality, costs money. Give them the brief and concept art.

**Step D: Clean the model in Blender.**

- Import the model (File → Import).
- Turn on Scene Statistics and check the triangle count. Target under 15,000. If higher, add a Decimate modifier, lower the ratio until under budget, apply it.
- Face the -Y direction (Blender front view), stand on the ground at the origin, about 1.8 units tall.
- Apply all transforms (Object → Apply → All Transforms).
- Delete hidden extra objects, cameras or lights from the import.

**Step E: The extra arms.** Mixamo only understands two arms. Keep the main model with two arms for rigging. Model the extra pair as a separate object; Claude Code attaches it to the chest bone in code and animates it procedurally (tucked in while running, reaching out during Web Swing). Save as `ananse_extra_arms.glb`.

**Step F: Textures.** One texture set at 1024 x 1024 or smaller. With many materials, ask Claude Code to walk you through baking to one texture, or keep flat colours (suits the stylised look and performs best).

**Step G: Export for rigging.** File → Export → FBX, "Selected Objects" ticked, mesh only. Name it `ananse_mesh.fbx`.

**Step H: Auto-rig on Mixamo.**

- Go to mixamo.com and sign in with a free Adobe account.
- Upload `ananse_mesh.fbx`.
- Place markers on chin, wrists, elbows, knees and groin; choose the standard skeleton.
- Check the preview. If clothes stretch badly, fix the mesh in Blender and re-upload.

**Step I: Download the animations.** Download each as FBX: "With Skin" for the first, "Without Skin" for the rest. Tick "In Place" for anything that moves forward.

| Game animation             | Search on Mixamo                                | Settings       |
| -------------------------- | ----------------------------------------------- | -------------- |
| idle                       | Happy Idle, or an idle with attitude            | Loop           |
| run                        | Fast Run, or Running                            | In Place, loop |
| jump                       | Running Jump, or Jump                           | In Place       |
| slide                      | Running Slide, or Running Dive Roll             | In Place       |
| strafe_left / strafe_right | Left Strafe / Right Strafe, or a quick side hop | In Place       |
| stumble                    | Stumble, or Stumble Backwards                   | In Place       |
| crash                      | Falling Back Death, or a dramatic fall          | Once           |
| swing                      | Hanging Idle, or Flying                         | Loop           |
| victory                    | Victory, or Dancing                             | Loop           |
| menu_idle                  | Looking Around or Bored                         | Loop           |

**Step J: Combine the animations in Blender.**

- Import the skinned FBX first, then each animation FBX.
- In the Action Editor (Dope Sheet) or NLA Editor, put every animation as a named action on the single skinned armature. Name each action exactly as in the table (for example `run`).
- Delete the extra armatures from the "Without Skin" imports.
- Ask Claude Code for a Blender Python script that does this automatically if the manual way is confusing.

**Step K: Export as GLB.** File → Export → glTF 2.0, format GLB. Include selected objects, mesh, armature, all actions. Name it `ananse.glb`.

**Step L: Check it.** Drag `ananse.glb` into gltf-viewer.donmccurdy.com and check every animation plays and textures show.

**Step M: Hand over.** Put `ananse.glb`, `ananse_extra_arms.glb` and the concept images in `assets-src/characters/ananse/`. Tell Claude Code: "Ananse is ready in assets-src/characters/ananse."

Repeat A to M later for Ntikuma, Aso and Osebo the leopard. The leopard is not humanoid, so Mixamo cannot rig it; find a licensed animated big cat model instead.

## Props for Kejetia Market (Phase 4)

Claude Code produces a full prop list with triangle budgets. Core set:

- **Obstacles:** tomato crates, basin, gari sacks, dog, awning pole, cloth line, hanging signboard, trotro, kiosk, chair stack, push truck, okada.
- **Environment:** stall with umbrella (3 to 4 variations), road and gutter tiles, building fronts (4 to 6 variations), signboards, skyline backdrop.
- **Pickups:** gold dust, gold weights, 3D power-up icons.

Claude Code can generate simple props as Blender Python scripts; AI 3D tools can produce the rest. Review the look, then save files in `assets-src/props/` with clear names (for example `obstacle_trotro.glb`).

**Licences:** for every file not made by you or Claude Code, record source, author and licence in `assets-src/LICENSES.md`. Commercial-use licences only (for example CC0, or CC-BY with credit).

## Supabase setup (Phase 6)

- Create an account at supabase.com and a new project in the region closest to Ghana (usually Europe).
- Enable Anonymous sign-ins and the Google provider (Claude Code walks you through the Google Cloud console).
- Copy the Project URL and anon public key into `.env.local`. Never share the service role key in chat or commit it.

## Music and sound (Phase 7)

- Best: an original highlife or Afrobeats loop with talking drum from a Ghanaian musician or producer, with a simple written agreement giving the right to use it in the game.
- Sound effects: licensed libraries (for example CC0 packs) or your own recordings, such as real market ambience.
- Record every source and licence in `assets-src/LICENSES.md`.

# Making Ananse: step by step

Your full task list for Owner Tasks 1 and 2: from nothing to a rigged, animated Ananse in the game. Do the parts in order. Each part ends with a check, so you know it worked before moving on. If anything on screen looks different from these steps, describe what you see to Claude Code.

Time guide: Parts 1–2 take an afternoon, Parts 3–5 a day, Parts 6–10 a day.

---

## Part 1: Get ready (about 3 hours)

1. Go to **blender.org/download**, download Blender for macOS (pick Apple Silicon or Intel to match your Mac), open the file and drag Blender into Applications.
2. Open Blender once to check it starts.
3. Watch a free beginner series on YouTube (search "Blender beginner tutorial"). Only learn:
   - Orbit, pan and zoom the 3D view.
   - Select objects; move (G), rotate (R), scale (S).
   - Switch between Object mode and Edit mode (Tab).
   - File → Import and File → Export.
   - Play an animation on the timeline (Space).
4. Create a free **Adobe account** (for Mixamo, Part 7) and an account on **meshy.ai** (Part 3).

**Check:** you can import any model, rotate around it and export it again.

---

## Part 2: Concept art (Step B)

You need **one front image and one side image** of Ananse standing with arms straight out (T-pose), on a plain white background. The character brief is in `docs/CHARACTER_BRIEF.md`.

**Option A: a local illustrator (best quality, clear ownership).** Send them the character brief and ask for a "front and side turnaround, T-pose, plain background, stylised cartoon 3D look like Subway Surfers". Get written permission to use the art in the game.

**Option B: an AI image tool (fastest).**

1. Use a tool whose terms allow commercial use (check the pricing or terms page).
2. Use this prompt:
   > Stylised 3D cartoon character turnaround, front view and side view, T-pose, arms straight out, plain white background, full body head to feet. Wiry Ghanaian man in his 40s, warm dark-brown skin, sly half-grin, clever eyes, slightly oversized head, hands and feet. Kente-inspired cloth wrap in gold, green and red over one shoulder with a subtle spider-web pattern, simple sandals, small leather pouch at the hip, bead headband. Subway Surfers style, bright colours, chunky shapes, clean lines.
3. Generate several, pick the best, and crop out a clean **front view** image (just the front, whole body visible, nothing cut off).

Do **not** draw four arms. The extra arms are made separately in Part 5.

**Save** the images as `assets-src/characters/ananse/concept_front.png` and `concept_side.png`.

**Check:** the front image shows the whole body, arms out, on a plain background.

---

## Part 3: Turn the concept into a 3D model (Step C)

1. Go to **meshy.ai** → **Image to 3D** → upload `concept_front.png`.
2. Settings, if offered:
   - Style: **cartoon / stylised**.
   - Topology: **triangle**. Target polycount: **about 10,000–15,000**.
   - **Symmetry: on.** **T-pose / A-pose: on.**
   - Texture: on.
3. Generate. If the result looks wrong (missing hands, merged legs), generate again or try a cleaner front image.
4. Download as **GLB**.
5. **Licence:** check that your Meshy plan allows commercial use. Some free plans require a credit line. Write the source, your plan and the licence in `assets-src/LICENSES.md`.
6. Save the download as `assets-src/characters/ananse/ananse_raw.glb`.

(Tripo is a good alternative with the same steps.)

**Check:** drag the GLB into **gltf-viewer.donmccurdy.com**. You see a coloured Ananse standing in a T-pose.

---

## Part 4: Clean the model in Blender (Steps D and F)

1. Open Blender. Press **A** to select everything in the starting scene, then **X → Delete** (removes the default cube, camera and light).
2. **File → Import → glTF 2.0** → pick `ananse_raw.glb`.
3. Turn on statistics: click the **Viewport Overlays** dropdown (top right of the 3D view, the two-circles icon) → tick **Statistics**. The triangle count appears at the top left.
4. **If there are several mesh pieces** (body, wrap, pouch), select them all (click one, Shift-click the rest) and press **Ctrl+J** to join them into one object. Mixamo needs a single mesh.
5. **If triangles are over 15,000:** with the mesh selected, open the **Properties** panel (right side) → **wrench icon (Modifiers)** → **Add Modifier → Generate → Decimate**. Lower **Ratio** until the triangle count is under 15,000 (for example 0.5). Click the small dropdown arrow on the modifier → **Apply**.
6. **Face the right way:** **View → Viewpoint → Front**. You should see Ananse's face. If you see his back, press **R**, then **Z**, then type **180** and press Enter.
7. **Stand on the ground at the centre:** still in the front view, move him (**G**) so his feet sit on the red horizontal line (the ground) and he is centred on the green vertical line. Press **N**, open the **Item** tab, and set **Location X and Y to 0**.
8. **Size:** in the same Item tab, look at **Dimensions Z**. It should be about **1.8 m**. If not, press **S** and type the factor (for example, if Z is 0.9, type 2) then Enter. (The game also fixes the size, so close is fine.)
9. **Apply everything:** **Object → Apply → All Transforms**.
10. Delete anything else that came with the import (extra empties, cameras or lights) in the **Outliner** (top right list): right-click → Delete.
11. **Textures:** leave them as they are. The game shrinks them to 1024 px automatically.
12. **File → Save As** → `assets-src/characters/ananse/ananse.blend`.

**Check:** one mesh object, under 15,000 triangles, facing you in front view, feet on the ground at the centre.

---

## Part 5: The extra arms (Step E)

The main body keeps two arms (Mixamo can only rig two). The second pair is a separate small model.

1. Select Ananse. **Shift+D**, then right-click (makes a copy in place).
2. With the copy selected, press **Tab** (Edit mode). Press **3** for face select. Go to **View → Viewpoint → Front** and press **Option+Z** to turn on X-ray (so selections go through to the back).
3. Press **A** to select all. Then hold **Ctrl** and drag a box over each arm, from shoulder to hand. Ctrl-dragging **deselects**, so now everything except the arms is selected.
4. Press **X → Faces**. Only the two arms remain.
5. Press **A** to select all, then **S**, type **0.8**, Enter (a little smaller).
6. Press **Tab** to go back to Object mode.
7. Turn the arms down along the body: **R**, **Y**, type **70**, Enter (try **-70** if they go the wrong way). Then move them (**G**) so the shoulders sit a little below the real shoulders, against the ribs.
8. Right-click → **Rename** (or double-click in the Outliner) → `ananse_extra_arms`.
9. Export only the arms: select the arms object only → **File → Export → glTF 2.0** → Format **glTF Binary (.glb)** → open **Include** and tick **Selected Objects** → save as `assets-src/characters/ananse/ananse_extra_arms.glb`.
10. **Hide** the arms (click the eye icon in the Outliner) so they do not go to Mixamo.

**Check:** `ananse_extra_arms.glb` opens in gltf-viewer and shows two small arms.

---

## Part 6: Export for rigging (Step G)

1. Select **only** the Ananse body.
2. **File → Export → FBX**.
3. Settings: tick **Limit to → Selected Objects**; Object Types: **Mesh** only; Path Mode: **Copy**, and click the small **box icon next to it (Embed Textures)** so it turns blue.
4. Save as `assets-src/characters/ananse/ananse_mesh.fbx`.

---

## Part 7: Auto-rig on Mixamo (Step H)

1. Go to **mixamo.com** and sign in with your Adobe account.
2. Click **Upload Character** → choose `ananse_mesh.fbx`.
3. If he appears lying down or facing away, use the rotate buttons until he stands facing you. Click **Next**.
4. Drag the coloured circles onto: **chin**, **wrists**, **elbows**, **knees** and **groin**. Keep **Use Symmetry** on. Skeleton LOD: **Standard Skeleton (65)**. Click **Next**.
5. Wait for the preview. He should move cleanly.
   - If the cloth wrap or arms stretch badly: move the markers and try again, or in Blender separate the arms a little more from the body and re-export.

**Check:** the preview animation looks right.

---

## Part 8: Download the animations (Step I)

Make a folder `assets-src/characters/ananse/mixamo/`. For each row: search for it in Mixamo, click it, adjust if needed, then **Download**.

**Download settings:**

- Format: **FBX Binary (.fbx)**
- Skin: **With Skin** for the **first one only (idle)**; **Without Skin** for all the others
- Frames per second: **30**
- Keyframe reduction: **none**
- Tick **In Place** (right-side panel, when it exists) for anything that moves forward

| Save the file as       | Search Mixamo for        | Settings |
| ---------------------- | ------------------------ | -------- |
| `idle.fbx` (With Skin) | Happy Idle               | Loop     |
| `run.fbx`              | Fast Run                 | In Place |
| `jump.fbx`             | Running Jump             | In Place |
| `slide.fbx`            | Running Slide            | In Place |
| `strafe_left.fbx`      | Left Strafe              | In Place |
| `strafe_right.fbx`     | Right Strafe             | In Place |
| `stumble.fbx`          | Stumble Backwards        | In Place |
| `crash.fbx`            | Falling Back Death       | —        |
| `swing.fbx`            | Hanging Idle (or Flying) | —        |
| `victory.fbx`          | Victory                  | —        |
| `menu_idle.fbx`        | Looking Around           | —        |

**Check:** 11 FBX files in the folder, `idle.fbx` is the only "With Skin" one.

---

## Part 9: Put all the animations on one Ananse (Step J)

If this part gets confusing, tell Claude Code "give me the Blender script for Step J" and it will do the whole part automatically.

1. Start a new Blender file (**File → New → General**), select all (**A**) and delete (**X**).
2. **File → Import → FBX** → `idle.fbx`. This brings in Ananse with his skeleton (the "armature").
3. At the bottom, change the **Timeline** area to the **Dope Sheet** (click the editor-type dropdown at its top left) and then switch the Dope Sheet mode to **Action Editor**.
4. Click Ananse's armature (the skeleton, in the Outliner). The Action Editor shows its action (a name like `Armature|mixamo.com|Layer0`). Click the name and rename it to **`idle`**. Click the **shield icon** next to it (Fake User) so Blender keeps it.
5. **File → Import → FBX** → `run.fbx`. A second armature appears.
6. Click the **new** armature. In the Action Editor, rename its action to **`run`** and click the **shield icon**.
7. Delete the new armature: select it in the Outliner → right-click → **Delete Hierarchy**. The `run` action stays because of the shield.
8. Repeat steps 5–7 for every other file, naming each action exactly as the file name: `jump`, `slide`, `strafe_left`, `strafe_right`, `stumble`, `crash`, `swing`, `victory`, `menu_idle`.
9. To test: click the main armature, pick an action from the Action Editor dropdown, and press **Space** to play it. He should animate.
10. **File → Save As** → `assets-src/characters/ananse/ananse_rigged.blend`.

**Check:** the Action Editor dropdown lists all 11 names, spelled exactly as in the table, and each one plays on the main Ananse.

---

## Part 10: Export the game file (Step K)

1. Select the Ananse mesh **and** the armature (click one, Shift-click the other in the Outliner).
2. **File → Export → glTF 2.0**.
3. Settings:
   - Format: **glTF Binary (.glb)**
   - Include: tick **Selected Objects**
   - Data → Mesh: tick **Apply Modifiers**
   - Animation: on. Mode: **Actions** (exports every action)
4. Save as `assets-src/characters/ananse/ananse.glb`.

---

## Part 11: Check it (Step L)

1. Drag `ananse.glb` into **gltf-viewer.donmccurdy.com**. Open the animation list and play each one. The textures should show.
2. In a terminal in the project folder:
   ```
   npm run assets
   ```
   Read the report. You want: no **over budget** line, no **missing animations** line, and "All assets look good."
3. Preview him in the game:

   ```
   npm run dev
   ```

   Open: http://localhost:5173/?debug=1&model=/assets/characters/ananse/ananse.glb&arms=/assets/characters/ananse/ananse_extra_arms.glb

   Play a run. Watch: running, jumping, sliding, switching lanes, a stumble, a crash, and a Web Swing (the extra arms should reach out).

**Check:** he plays every animation in the game, and the debug panel shows FPS near 60.

---

## Part 12: Hand over (Step M)

Make sure `assets-src/characters/ananse/` contains `ananse.glb`, `ananse_extra_arms.glb` and the concept images, then tell Claude Code:

> Ananse is ready in assets-src/characters/ananse.

Claude Code then adds him to the game permanently, lines up his collision box, decides on an outline with you, and runs Checkpoint C1.

---

## Later

The same Parts 2–12 make **Ntikuma** and **Aso**. **Osebo the leopard** is different: Mixamo cannot rig animals, so you look for a licensed, already-animated big cat model (Claude Code helps you check it in Phase 4).

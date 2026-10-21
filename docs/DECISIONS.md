# Decisions

Dated log of design and tech decisions. Newest at the top.

## 2026-10-17 (Phase 4 props)

- **Props are stretched to fit their collision box exactly**, so what you see is what you hit. Each obstacle gets a random-looking but fixed variant number to pick between props of the same type.
- **`npm run assets` writes `src/game/assetIndex.json`**; the game only loads props listed there, so missing files never break loading.
- **Prop textures 512 px** (characters 1024 px).
- **Prop triangle limit 3,300** (the brief's 3,000 plus 10%), because Meshy overshoots the requested Poly Count slightly.
- **`npm run assets` skips models without textures**, so grey Meshy downloads never reach the game.
- **Okada collision box turned sideways:** 1.8 long across the road, 0.8 deep, 1.6 tall. It faces its direction of travel.
- **Vehicles:** oncoming trotros face the player; parked trotros show their back.

## 2026-10-17 (Phase 3 complete)

- **Cartoon outline on Ananse:** a back-face "inverted hull" copy of each mesh, pushed out 1.4 cm along its normals in dark brown, works with skinning. Costs about 15% in the CPU-rendered test; it will be switched off on the Low quality tier.
- **Props pipeline (Phase 4):** ChatGPT image → Meshy → GLB, no Blender. The game will fit each prop to its collision box.

## 2026-10-17 (Ananse model)

- **Ananse base model:** Meshy Image to 3D (Meshy 7.1) from the ChatGPT concept, Meshy Pro private licence. 10,379 triangles, one mesh, 1.8 m, faces forward.
- **Parts 4–6 of the owner guide are scripted** (`scripts/blender/prepare_character.py`, run with Blender in the background) after the manual extra-arms steps proved hard for a first-time Blender user. The script cuts the arms (|x| > 0.2 m, 1.1–1.36 m high), scales them to 80%, turns them 84° down and tucks them against the ribs.

- **Animations:** 11 Mixamo clips downloaded With Skin. `combine_animations.py` keeps the idle skeleton, strips the extra meshes, removes horizontal drift from the hips in run, jump, slide, strafes, stumble and menu idle, restores the Meshy material (Mixamo drops it), and exports one GLB with an animation per clip.
- **Source files in git:** concept art, `ananse_raw.glb`, the Mixamo FBX downloads (~69 MB) and `ananse.glb` are committed. Generated `*.blend` and `*_mesh.fbx` files are ignored; the scripts recreate them.

## 2026-10-17 (Phase 3 preparation)

- **Meshopt instead of Draco:** meshopt also compresses animations, decodes faster, and its decoder ships with drei.
- **WebP textures instead of KTX2 for now:** KTX2 needs the separate `toktx` program installed. Our textures are tiny (one 1024 px set per character), so WebP is fine. Revisit in Phase 8 if GPU memory is tight.
- **New dev dependencies for `npm run assets`:** `@gltf-transform/core`, `@gltf-transform/functions` and `@gltf-transform/extensions` (glTF processing), `meshoptimizer` (mesh compression), `sharp` (texture resizing and WebP).
- **Models are scaled to 1.8 units automatically** and turned to face down the track, so small export scale mistakes do not break the game.
- **Toon shading:** every material is converted to a three-step cartoon material. An outline is decided after seeing the real Ananse.
- **Missing animations fall back** to the closest clip (for example swing → jump → run), so a partial export still plays.
- **The capsule stays as a fallback** if the model is missing or fails to load.
- **Pipeline tested with the Khronos CesiumMan sample (CC-BY 4.0)** kept outside the repo; nothing from it is committed.

## 2026-10-17 (Phase 2)

- **"Activate stored power-up" = shield charms.** The brief lists a double-tap / E control but no stored item. Charms are bought in the shop (300 gold) and give a Gye Nyame Shield on demand, like hoverboards in Subway Surfers.
- **Shield is not upgradeable:** it lasts until hit, so "last longer" does not apply. The other four timed power-ups have 5 upgrade levels each (250 to 5,000 gold).
- **Sankofa:** the game records a snapshot of the whole run every 0.25 s; continuing restores the one from 2 s before the crash and gives 1 s of protection. New players start with 1 token. The offer lasts 5 s; rewards are applied once the run truly ends.
- **Web Swing:** lifts Ananse to 5.5 units, lays a gold trail that switches lanes every 10 coins, and clears obstacles near the landing spot when it ends, plus 1 s of protection.
- **Missions:** nine templates (per-run and lifetime). Each set has three; targets grow 50% per set. Each mission pays 100 + 50 × set gold. Finishing a set adds +1 multiplier (max x30) and a Sankofa token.
- **Daily reward:** 50, 75, 100, 150, 200, 250, 400 gold; every 7th day also gives a Sankofa token. Missing days halves the streak instead of resetting it.
- **Gold weights:** six weights, at most one spawn chance per power-up slot (6%), only ones not yet found. A full set pays 1,000 gold. Their proverbs are in `src/content/culture.ts`, all `verified: false`; the UI only says "awaiting cultural review" until the owner verifies them.
- **Difficulty:** levels start at 0, 20, 60, 120 and 180 s. Chunks at the current level are 3× as likely, one level below 2×.
- **Oncoming trotros** start moving 60 units away at +8 units/s; the path checker treats their lane as blocked 26 units before their start. **Okadas** cross at 7 units/s from 34 units away, are 1.6 tall, and can be jumped.
- **Roof step-up tolerance 0.4:** landing on a roof or crate counts if your feet are within 0.4 of its top, so ramps work at top speed.
- **Chaser placement:** shown low at the bottom corner, on the side away from Ananse, so it never blocks the track.
- **Story pages** moved to Phase 5 with the Collection screen.
- **Saving:** IndexedDB with no extra library (about 40 lines). Writes are queued so the last save wins. Nothing is written until the saved profile has loaded.

## 2026-10-17 (Phase 1)

- **Simulation is plain TypeScript** (`src/game/loop/simulation.ts`), stepped at 60 Hz by a fixed stepper. React components only read its state each frame and write to Three.js objects. Fully unit tested without a browser.
- **Head-on vs side hits:** a hit counts as a side clip when the player was already level with the obstacle on the previous step but not overlapping sideways (lane switch into it) or vertically (bumping from below). Everything else is a head-on crash. A side clip bounces the player back to the previous lane, with 0.3 s of grace against repeat side clips.
- **Low obstacles and platforms are walkable:** landing on top of crates or a roof is allowed rather than counted as a crash.
- **Speed ramp:** the brief's values (+0.6 every 10 s from 12 to 32) reach max after about 5.5 minutes, not 4. Kept as written with a smooth ease-out over the last 4 units/s; to be tuned at Checkpoint A.
- **Intro state deferred to Phase 5:** the camera swoop belongs with the 3D menu. Phase 1 goes Menu → Running directly.
- **Best score is kept in memory only** until IndexedDB saving lands in Phase 2.
- **`?seed=<number>` URL option** replays the same track layout, for reproducing feedback.
- **Lint allows `!` non-null assertions:** `noUncheckedIndexedAccess` is on, and per-frame loops index arrays whose bounds are known; runtime guards there would only add cost.
- **Greybox colours:** red = jump over, blue = slide under, dark = change lane, green = platform you can run on.

## 2026-10-17

- **Build tool: Vite, not Next.js.** A WebGL game gains nothing from server rendering or file routing; the menu is the game world, so there are no page changes. Vite ships less framework code and outputs static files that suit the PWA setup.
- **Styling: CSS Modules + CSS-variable design tokens** (`src/styles/tokens.css`). Game screens are bespoke and animated with Framer Motion; scoped CSS keeps markup clean and the bundle small. Tailwind considered and not chosen.
- **Node 20.19 supported.** Owner stays on Node 20.19.6 for now. Node 20 is past end of life, so upgrade to the current LTS before launch. This pins Vitest to 4.x (Vitest 5 needs Node 22).
- **TypeScript 6.0.** TypeScript 7 is not yet supported by typescript-eslint.
- **React 19.3.** React Three Fiber 9.8 supports React `>=19 <19.4`.
- **No code comments; no co-author trailers in commits.** Owner preference.
- **Bundle split into react, r3f and three chunks** via Rolldown `codeSplitting`, so engine code caches separately from game code.

## Dependencies

| Package                                                                                                                        | Reason                                  |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| three, @react-three/fiber, @react-three/drei                                                                                   | 3D rendering with React (locked stack)  |
| zustand                                                                                                                        | Game and UI state, usable outside React |
| framer-motion                                                                                                                  | Screen transitions and UI animation     |
| howler                                                                                                                         | Reliable mobile audio                   |
| vite, @vitejs/plugin-react                                                                                                     | Build tool and React fast refresh       |
| typescript, @types/*                                                                                                           | Strict typing                           |
| eslint, @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, eslint-config-prettier | Linting                                 |
| prettier                                                                                                                       | Formatting                              |
| vitest                                                                                                                         | Unit tests for game logic               |

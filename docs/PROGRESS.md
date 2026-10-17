# Progress

## Phase 0: Project setup

- [x] Vite + React + TypeScript (strict) project with the planned folder structure
- [x] React Three Fiber, drei, Zustand, Framer Motion, Howler installed
- [x] ESLint, Prettier and Vitest configured (`npm run check`)
- [x] Docs created: CLAUDE.md, PLAN, GAME_DESIGN, ARCHITECTURE, ART_GUIDE, TESTING, FEEDBACK, DECISIONS, PROGRESS
- [x] `src/config/tuning.ts`, `src/game/assets.ts` manifest, `src/content/culture.ts`
- [x] Debug panel with FPS, min FPS, frame time, draw calls, triangles, memory (`?debug=1`)
- [x] Capsule scene: ground, three lanes, capsule, sky colour, fog
- [x] Phone access script (`npm run dev:phone`)
- [x] Git set up and pushed to GitHub
- [x] OWNER TASK 0: tools installed (Node, Git, VS Code, Chrome, Blender later)
- [x] Checkpoint 0: capsule scene seen on computer and phone

## Phase 1: Greybox runner

- [x] Fixed-timestep loop, run state machine, floating origin
- [x] Player: three lanes, lane switch, jump, slide, input buffering, swipe and keyboard
- [x] Follow camera: lag, tilt, speed FOV, shake on stumble and crash
- [x] Chunk generator: 10 greybox chunks, pooling, guaranteed path (validated by tests)
- [x] Instanced gold dust and counter
- [x] Crash and stumble, speed ramp, distance score
- [x] Instant restart, basic start and game-over overlays
- [x] TEST CHECKPOINT A (approved 2026-10-17)

## Phase 2: Gameplay systems

- [x] Power-ups: Web Swing, Gye Nyame Shield, Kente Magnet, Talking Drum, Spring Web, with HUD timers
- [x] Sankofa continue: 2-second rewind with a 5-second offer countdown
- [x] Shield charms: stored shields activated by double-tap or E
- [x] Chaser placeholder: visible at run start and after a stumble, drops back after clean running
- [x] Moving obstacles (oncoming trotro, crossing okada), ramps, rooftop running
- [x] Difficulty curve: five levels over the first three minutes, 19 chunks, no repeats of the last four
- [x] Missions (three per set), multiplier levels, gold weights, daily reward with gentle streak reset
- [x] Shop: upgrades, Sankofa tokens, shield charms, characters and outfits with equip
- [x] Local saving to IndexedDB after every run, purchase and claim
- [x] Unit tests (122 total)
- [x] TEST CHECKPOINT B (approved 2026-10-17)
- [ ] Story pages unlocked by missions (moved to Phase 5 with the Collection screen)

## Phase 3: Ananse comes alive

- [x] Character brief agreed (`docs/CHARACTER_BRIEF.md`)
- [x] `npm run assets`: meshopt compression, WebP textures at 1024 px, triangle and animation report
- [x] Character loader: toon shading, auto height, animation crossfades, run speed scaling, capsule fallback
- [x] Extra arms attached to the chest bone, tucked while running, reaching out during Web Swing
- [x] Preview any exported model with `?debug=1&model=...&arms=...`
- [x] Re-export guide for the owner (`docs/ART_GUIDE.md`)
- [x] OWNER TASK 1: Ananse concept art (ChatGPT) and model (Meshy Pro)
- [x] OWNER TASK 2: Mixamo rig and 11 animations
- [x] Blender scripts: `prepare_character.py` (extra arms + Mixamo FBX), `combine_animations.py` (one GLB, in-place, textures)
- [x] Ananse added to the asset manifest (931 KB, 10,379 triangles, 11 clips)
- [x] Toon outline: dark inverted-hull outline on Ananse and the extra arms (`?debug=1&outline=0` to compare)
- [x] TEST CHECKPOINT C1 (approved 2026-10-17)

## Phase 4: Kejetia Market

- [x] Prop list with prompts and triangle budgets (`docs/PROPS.md`)
- [ ] OWNER TASK 3: Batch 1 obstacles (10 props)
- [ ] OWNER TASK 3: Batch 2 scenery (7 props)
- [ ] Prop loader that fits each model to its collision box, greybox fallback
- [ ] Environment: road, gutters, stalls, buildings, sky backdrop
- [ ] Golden-hour lighting, fog, fake shadows
- [ ] Osebo the leopard chaser
- [ ] Particles: gold sparkle, slide dust, web strands
- [ ] Graphics quality tiers and auto benchmark (outline off on Low)
- [ ] TEST CHECKPOINT C2

## Phase 5: UI/UX

- [ ] TEST CHECKPOINT D

## Phase 6: Accounts

- [ ] TEST CHECKPOINT D2

## Phase 7: Audio and juice

## Phase 8: Performance and PWA

- [ ] TEST CHECKPOINT E

## Phase 9: Launch

- [ ] TEST CHECKPOINT F

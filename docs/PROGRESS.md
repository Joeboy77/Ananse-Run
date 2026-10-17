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
- [ ] TEST CHECKPOINT B (waiting for owner feedback)
- [ ] Story pages unlocked by missions (moved to Phase 5 with the Collection screen)

## Phase 3: Ananse comes alive

- [ ] TEST CHECKPOINT C1

## Phase 4: Kejetia Market

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

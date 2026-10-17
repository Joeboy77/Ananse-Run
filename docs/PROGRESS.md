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
- [ ] OWNER TASK 0: tools installed (Node, Git, VS Code, Chrome, Blender later)
- [ ] Checkpoint 0: capsule scene seen on computer and phone

## Phase 1: Greybox runner

- [x] Fixed-timestep loop, run state machine, floating origin
- [x] Player: three lanes, lane switch, jump, slide, input buffering, swipe and keyboard
- [x] Follow camera: lag, tilt, speed FOV, shake on stumble and crash
- [x] Chunk generator: 10 greybox chunks, pooling, guaranteed path (validated by tests)
- [x] Instanced gold dust and counter
- [x] Crash and stumble, speed ramp, distance score
- [x] Instant restart, basic start and game-over overlays
- [ ] TEST CHECKPOINT A (waiting for owner feedback)

## Phase 2: Gameplay systems

- [ ] Power-ups
- [ ] Chaser placeholder
- [ ] Moving obstacles, ramps, rooftops
- [ ] Difficulty curve
- [ ] Missions, multiplier, gold weights, daily reward
- [ ] Shop logic and IndexedDB save
- [ ] Unit tests
- [ ] TEST CHECKPOINT B

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

# Decisions

Dated log of design and tech decisions. Newest at the top.

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

# Decisions

Dated log of design and tech decisions. Newest at the top.

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

# Ananse Run

A web-only 3D endless runner rooted in Ashanti folklore. Ananse the trickster runs through Kejetia Market, dodging obstacles, collecting gold dust and using his webs to stay ahead of the creatures he tricked. Plays like Subway Surfers (three lanes, swipe, jump, slide), looks like a premium stylised 3D game, opens instantly in a browser.

## Session start

1. Read this file, `docs/PROGRESS.md` and the newest entries in `docs/FEEDBACK.md`.
2. Say in two or three lines where the project stands and what you will do next.

## Current phase

**Phase 0: Project setup.** See `docs/PROGRESS.md`.

## Docs

| File                   | Contents                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| `docs/PLAN.md`         | Phase-by-phase build plan, who does what                                 |
| `docs/GAME_DESIGN.md`  | Game design: loop, controls, tuning, world, power-ups, UI flow, audio    |
| `docs/ARCHITECTURE.md` | Stack, game loop rule, folders, core systems, saving, performance budget |
| `docs/ART_GUIDE.md`    | Owner tasks: tools, Blender, Ananse pipeline, props, Supabase, audio     |
| `docs/TESTING.md`      | How to run, how to give feedback, checkpoint checklists                  |
| `docs/FEEDBACK.md`     | Owner test feedback                                                      |
| `docs/DECISIONS.md`    | Dated log of design and tech decisions                                   |
| `docs/PROGRESS.md`     | Phase checklist, ticked as tasks finish                                  |

## Locked decisions

Do not change without asking the owner and logging in `docs/DECISIONS.md`.

| Decision       | Choice                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------- |
| Product type   | A real, public product, free to play                                                               |
| Platform       | Web only, installable as a PWA. No app stores                                                      |
| Genre          | 3D endless runner, three lanes                                                                     |
| Art direction  | Stylised 3D (bright, cartoon-shaded, chunky shapes), premium polish, not realism                   |
| Team           | The owner and Claude Code. The owner does character modelling, rigging and animation with guidance |
| Login          | No login wall. Silent anonymous account, optional upgrade to a linked account later                |
| Launch scope   | One world (Kejetia Market), full UI/UX, saving, power-ups, audio                                   |
| Target devices | Mid-range Android phones in Ghana first, then desktop and iPhone                                   |
| Timeline       | No fixed deadline. Phase by phase                                                                  |

## Quality bar

- Smooth: steady 60 fps on a mid-range Android (about 4 GB RAM, Snapdragon 6-series or Helio G-series), never below 45 fps.
- Fast: first playable screen under 5 s on 4G. Initial download under 10 MB.
- Instant: Play to running under 1 s. Restart after a crash under 1 s.
- Juicy: every action has visual, audio and camera feedback.
- Respectful: culture shown accurately and with pride (`docs/GAME_DESIGN.md`, Culture section).

## Owner

Product owner, animator and tester. Computing student with solid React, Next.js, TypeScript and Framer Motion experience, little 3D or game-dev experience. Explain in plain language, briefly.

## Working rules

- Plan before coding. At the start of each phase, list the tasks and the files you expect to touch.
- Small steps. After each task, run `npm run check` and fix errors before moving on. Commit after each working task with a clear message.
- **No comments in code.**
- **Commits and pushes carry no co-author trailer.** Plain commit messages only.
- Never leave the game broken at the end of a session.
- Placeholders first: boxes, capsules, simple colours until real art arrives. Asset paths live only in `src/game/assets.ts`, so art swaps need no code changes.
- Every gameplay number lives in `src/config/tuning.ts`.
- Stop at every TEST CHECKPOINT. Give the exact commands, URL, what to test and the checklist from `docs/TESTING.md`. Then wait. Do not start the next phase until feedback is processed.
- Process feedback: read `docs/FEEDBACK.md`, group into must-fix, should-fix and ideas, fix the must-fix items, confirm what changed, log design changes in `docs/DECISIONS.md`.
- When an OWNER TASK is due, explain why, give the steps from `docs/ART_GUIDE.md` adapted to the current state, and say exactly where to put files and what to say when done.
- Check performance with the debug panel (`?debug=1`) after every visual change.
- No new dependencies without a one-line reason in `docs/DECISIONS.md`.
- Do not invent cultural facts. Cultural text goes in `src/content/culture.ts` with `verified: false`, flagged to the owner. Unverified content is never shown as fact in the UI.
- Security: never commit secrets. Use `.env.local`, keep `.env.example` current. Supabase row-level security on every table.
- Keep `docs/PROGRESS.md` current after every task.

## Code conventions

- Vite + React 19 + TypeScript strict. Import from `src` with the `@/` alias.
- The game loop lives outside React: per-frame work happens in `useFrame` or plain TypeScript systems that mutate Three.js objects. Never `setState` per frame. HUD reads Zustand with throttled updates (about 10 per second).
- Styling: CSS Modules per component, design tokens as CSS variables in `src/styles/tokens.css`.
- Named exports. One component per file. Files for components in PascalCase, everything else camelCase.
- Pure game logic has Vitest tests next to it (`*.test.ts`).

## Commands

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Dev server at http://localhost:5173                 |
| `npm run dev:phone` | Dev server reachable from a phone on the same Wi-Fi |
| `npm run check`     | Type check, lint and unit tests                     |
| `npm run build`     | Production build                                    |
| `npm run format`    | Format all files with Prettier                      |

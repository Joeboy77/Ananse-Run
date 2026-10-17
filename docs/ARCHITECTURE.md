# Architecture

## Stack

| Layer             | Choice                                                      | Why                                                 |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| Build tool        | Vite + TypeScript (strict)                                  | Fast, simple, no server rendering needed for a game |
| 3D                | Three.js via React Three Fiber and drei                     | Uses the owner's React skills; mature ecosystem     |
| UI                | React + Framer Motion, CSS Modules with CSS-variable tokens | The owner knows Framer Motion                       |
| State             | Zustand                                                     | Fast, and works outside React for the game loop     |
| Collision         | Custom lane-based AABB checks (no physics engine)           | Faster and more predictable for an endless runner   |
| Audio             | Howler.js                                                   | Reliable on mobile browsers                         |
| Backend           | Supabase (anonymous auth, Postgres, RLS, Edge Functions)    | Free tier, anonymous sign-in, account linking       |
| Hosting           | Vercel or Cloudflare Pages                                  | Free tier, global CDN                               |
| PWA               | vite-plugin-pwa                                             | Offline play and install to home screen             |
| 3D assets         | glTF/GLB, Draco or Meshopt, KTX2 textures                   | Small downloads, fast decoding                      |
| Testing           | Vitest (logic), Playwright (smoke tests)                    |                                                     |
| Analytics (later) | PostHog or Plausible                                        | Know where players drop off                         |

## Key rule: the game loop lives outside React

React renders the scene graph once. All per-frame movement happens in `useFrame` callbacks or plain TypeScript systems that change Three.js objects directly. Never call React `setState` every frame. The HUD reads from the Zustand store with throttled selectors, updating at most about 10 times per second.

## Folder structure

```
ananse-run/
  CLAUDE.md
  docs/              PLAN, GAME_DESIGN, ARCHITECTURE, ART_GUIDE, TESTING, FEEDBACK, DECISIONS, PROGRESS
  assets-src/        owner drops raw art here (.blend, .fbx, textures)
  public/assets/     optimised, game-ready GLB, KTX2, audio
  scripts/           asset optimisation scripts (gltf-transform)
  src/
    main.tsx, App.tsx
    config/          tuning.ts (every gameplay number), graphics.ts, budgets.ts
    content/         culture.ts, missions.ts, characters.ts
    game/
      assets.ts      asset manifest (the only place asset paths live)
      runtime.ts     the single running game: simulation + stepper + commands
      core/          seeded rng, math helpers
      loop/          fixed-timestep update, speed curve, simulation, run phases
      track/         lanes, chunk definitions, generator, object pools
      player/        controller, input buffer, animation state
      obstacles/     types, collision boxes
      powerups/      one file per power-up
      chaser/
      camera/        follow cam, shake, transitions
      fx/            particles, trails, post-processing
    scenes/          World, RunScene, run/ (driver, camera rig, instanced views)
    ui/              screens/, components/, hud/, transitions/
    store/           gameStore, profileStore, settingsStore
    services/        save (local + cloud), auth, leaderboard, audio
    styles/          tokens.css, global.css
    debug/           performance probe and panel (enabled with ?debug=1)
  supabase/          migrations, functions
```

## Core systems

- **Fixed-timestep loop:** simulation steps at 60 Hz while rendering runs at the device rate. Gameplay is identical on fast and slow devices.
- **Floating origin:** Ananse stays near z = 0 and the world moves toward him. Chunks are recycled. No floating-point drift in long runs.
- **Chunk-based track:** hand-designed chunks about 40 units long. Each lists its obstacles, gold patterns, power-up slots and a difficulty tag. The generator picks the next chunk by current difficulty and guarantees a possible path. 4 to 5 chunks alive at once.
- **Object pooling:** obstacles, gold and particles are pooled, never created or destroyed mid-run.
- **Instancing:** gold dust and repeated props use `InstancedMesh`.
- **Collision:** each obstacle has a lane, a height class (low, high, full, platform) and a box. The player box changes with jump and slide.
- **Run state machine:** Menu → Intro → Running → Stumbled → Crashed → (Sankofa → Running) or GameOver.
- **Animation:** crossfades between idle, run, jump, slide, strafe left/right, stumble, crash and swing, driven by player state.
- **Graphics quality tiers:** Auto picks a tier from a quick benchmark in the first seconds. Low disables shadows, post-processing and distant props, and lowers the pixel ratio. High adds bloom, soft shadows and more particles.
- **Asset loading:** a core pack (menu, Ananse, first chunks, UI) loads first. Everything else streams in the background.

## Saving and accounts

- **Local save:** all progress (gold, unlocks, upgrades, best score, missions, settings) saved to IndexedDB after every run and purchase. Works fully offline.
- **Silent anonymous account:** on first launch with a connection, Supabase anonymous sign-in gives a real user ID without a form. The local save syncs to the profiles table.
- **Account upgrade:** after a meaningful moment (first character unlock, a big new best, or 3 days of play), a friendly prompt offers "Save your progress forever" with Google or email. Linking keeps the same user ID. Easy to dismiss, shown at most once every few days.
- **Conflict rule:** merge local and cloud by taking the maximum of earned values (gold earned, unlocks, best score). Each save has a `save_version`.
- **Account deletion:** available from the Profile screen.

## Leaderboard integrity

- Only linked accounts appear on leaderboards.
- Scores are submitted through a Supabase Edge Function, never a direct table insert.
- The server checks run duration against distance at known speeds, gold against the possible maximum for the distance, and rate-limits submissions.
- Later, if needed: record input seeds and replay runs on the server.

## Performance budget

Checked at every test checkpoint with `?debug=1`. Values also live in `src/config/budgets.ts`.

| Metric                       | Budget                                              |
| ---------------------------- | --------------------------------------------------- |
| Frame rate on target phone   | 60 fps target, 45 fps minimum                       |
| Draw calls during a run      | Under 120 on High, under 70 on Low                  |
| Triangles in view            | Under 300k on High, under 120k on Low               |
| Initial download (core pack) | Under 10 MB                                         |
| Ananse model                 | Under 15k triangles, one 1024 px texture set        |
| Prop models                  | 300 to 3,000 triangles each, shared texture atlases |
| JS bundle (gzipped)          | Under 600 KB                                        |
| Memory                       | Under 400 MB on mobile                              |

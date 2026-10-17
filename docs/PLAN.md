# Build plan

Each phase lists its goal, what Claude Code does, what the owner does, and when it counts as done. Test checkpoints are where the owner plays, checks and comments (see `TESTING.md`).

## Phase 0: Project setup

**Goal:** an empty but well-organised project that runs in the browser.

Claude Code:

- Create the Vite + React + TypeScript project with the folder structure from `ARCHITECTURE.md`.
- Install and configure React Three Fiber, drei, Zustand, Framer Motion, Howler, ESLint, Prettier and Vitest.
- Create the docs files, `tuning.ts`, the asset manifest and the debug panel (FPS, draw calls, triangles).
- Show a simple 3D scene: a ground plane, a capsule and a sky colour. Make it run on a phone over local Wi-Fi.
- Set up Git and the private GitHub repository.

**OWNER TASK 0:** install the tools in `ART_GUIDE.md` (Tools to install) and create a GitHub account if needed.

**Done when:** the owner sees the capsule scene on both computer and phone.

## Phase 1: Greybox runner (the feel)

**Goal:** the core run feels great with placeholder shapes. The most important phase; everything else builds on how it feels.

Claude Code:

- Fixed-timestep loop, run state machine and floating origin.
- Player capsule: three lanes with smooth lane switches, jump, slide, input buffering, swipe and keyboard controls.
- Follow camera with slight lag, tilt on lane switch and a field-of-view increase with speed.
- Chunk generator with 8 to 10 greybox chunks (coloured boxes for low, high and full obstacles, plus platforms), pooling, and a guaranteed path.
- Gold dust pickups (instanced) with a counter.
- Crash and stumble logic, speed ramp, score by distance.
- Instant restart, plus a very basic start and game-over overlay.

**TEST CHECKPOINT A:** game feel.

**Done when:** the owner rates the controls and camera feel "good" on their phone, and the must-fix list is empty.

## Phase 2: Gameplay systems

**Goal:** all the game rules are in place, still with placeholder art.

Claude Code:

- All power-ups with timers and simple placeholder effects.
- Chaser (a placeholder shape) that appears on stumble and drops back.
- Moving obstacles (oncoming trotro, crossing okada), ramps and running on rooftops.
- Difficulty curve: chunk selection by difficulty and speed.
- Missions system, multiplier levels, gold weight collectibles and the daily reward logic.
- Shop logic: upgrades, Sankofa tokens, unlocks. Local saving to IndexedDB.
- Unit tests for the scoring, saving, mission and generator rules.

**OWNER TASK 1 (in parallel):** Ananse concept and model, `ART_GUIDE.md` Steps A to F.

**TEST CHECKPOINT B:** gameplay and balance.

**Done when:** a 3-minute run feels fair, varied and increasingly hard, and every power-up works.

## Phase 3: Ananse comes alive (art pipeline)

**Goal:** the real Ananse, rigged and animated, replaces the capsule.

**OWNER TASK 2:** finish `ART_GUIDE.md` Steps G to M (rigging, animations, export).

Claude Code:

- Build the asset optimisation script (gltf-transform: Draco or Meshopt compression, KTX2 textures, resizing) as `npm run assets`.
- Load Ananse, set up the animation state machine and crossfades, and line up the collision box with the model.
- Add the toon or stylised shading, outline if chosen, and the extra arms visible during Web Swing.
- Write a short guide for the owner on how to re-export after changes.

**TEST CHECKPOINT C1:** character check.

## Phase 4: Kejetia Market world

**Goal:** the greybox becomes a beautiful market.

**OWNER TASK 3:** gather or generate the props in `ART_GUIDE.md` and check every licence.

Claude Code:

- Replace greybox obstacles with real props, matching collision boxes.
- Build the environment: road surface, stalls, umbrellas, signboards, skyline and background layers. Texture atlases and instancing.
- Golden-hour lighting, fog for depth, baked or fake shadows where real-time shadows cost too much.
- Osebo the leopard chaser model and animation (licensed asset).
- Particles: gold sparkle, dust from slides, web strands.
- Graphics quality tiers and the auto benchmark.

**TEST CHECKPOINT C2:** world look and performance.

## Phase 5: UI/UX and transitions

**Goal:** every screen from `GAME_DESIGN.md`, polished and animated.

Claude Code:

- A design system (colours, type, spacing, buttons, cards, icons) inspired by kente colours and Adinkra shapes, stored as tokens.
- The 3D menu scene with Ananse idling and the camera swoop into the run.
- All screens, the HUD, and screen transitions with Framer Motion. Reduced-motion support.
- Game-over flow with the Sankofa countdown and a "new best" celebration.
- Shareable score card image (generated in the browser).
- Onboarding: the first run shows swipe hints in context, not a tutorial screen.

**OWNER TASK 4:** choose the game logo direction and fonts from the 2 to 3 options presented.

**TEST CHECKPOINT D:** UI/UX flow.

## Phase 6: Saving, accounts and leaderboards

**OWNER TASK 5:** create a Supabase project and provide the project URL and anon key. Never paste the service role key into chat.

Claude Code:

- Supabase tables (profiles, saves, scores) with row-level security, plus migrations.
- Anonymous sign-in, cloud sync with the merge rule, and offline queueing.
- The account upgrade flow (Google and email) and its prompt logic.
- The score submission Edge Function with checks, plus weekly and all-time leaderboards.
- Account deletion.

**TEST CHECKPOINT D2:** saving.

## Phase 7: Audio and juice

**OWNER TASK 6:** find or commission the music and sound effects, and check licences.

Claude Code: integrate audio with Howler, dynamic music intensity, pitch-rising combo sounds, screen shake, hit-stop on crash, squash and stretch, power-up visual effects. Add the volume settings.

## Phase 8: Performance, PWA and hardening

Claude Code:

- Profile on the target phone and tune until the performance budget is met.
- PWA: manifest, icons, offline caching and the install prompt.
- Handle tab switching (auto-pause), screen rotation, low memory, and WebGL context loss.
- Error reporting, and an in-game "Report a problem" button.
- Playwright smoke tests: the game loads, a run starts, a run ends, progress saves.

**TEST CHECKPOINT E:** real-device testing with the owner plus 3 to 5 friends on different phones.

## Phase 9: Launch

Claude Code: deployment to Vercel or Cloudflare, custom domain setup, privacy policy and terms drafts for the owner to review, credits screen, basic analytics, meta tags and social preview image, and a launch checklist.

**OWNER TASK 7:** buy the domain, review the legal pages (ideally with someone who knows Ghana's Data Protection Act), get the cultural content reviewed, and run a closed beta with 10 to 20 players.

**TEST CHECKPOINT F:** beta feedback, then launch.

## After launch

- World 2: Cocoa Farm (chaser: Onini the python).
- World 3: The Forest (chaser: the Mmoboro hornets, plus Mmoatia).
- Event world: Lake Bosomtwe at dusk.
- Twi language option.
- Seasonal festival events and outfits.
- Optional cosmetic purchases with Paystack and mobile money.

## Who does what

| Phase         | Claude Code                                             | Owner                                | Checkpoint           |
| ------------- | ------------------------------------------------------- | ------------------------------------ | -------------------- |
| 0 Setup       | Project scaffold, docs, debug panel                     | Install tools                        | Scene shows on phone |
| 1 Greybox     | Core run, controls, camera, chunks, gold                | Test                                 | A: Feel              |
| 2 Systems     | Power-ups, chaser, missions, shop, local save           | Start Ananse concept and model (A–F) | B: Gameplay          |
| 3 Ananse      | Asset pipeline, animation system, shading               | Rig, animate and export Ananse (G–M) | C1: Character        |
| 4 Kejetia     | World build, lighting, chaser, particles, quality tiers | Props and licences                   | C2: World            |
| 5 UI/UX       | Design system, menus, transitions, HUD, score card      | Pick logo and fonts                  | D: Flow              |
| 6 Accounts    | Supabase, sync, linking, leaderboards                   | Create Supabase project              | D2: Saving           |
| 7 Audio       | Audio and juice                                         | Music and sound effects              | Part of E            |
| 8 Performance | Optimisation, PWA, hardening, tests                     | Recruit testers                      | E: Devices           |
| 9 Launch      | Deploy, legal drafts, analytics                         | Domain, reviews, beta                | F: Beta              |

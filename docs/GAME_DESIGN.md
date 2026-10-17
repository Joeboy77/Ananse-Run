# Game design

## Pitch

Ananse, the trickster of Akan folklore, has tricked Onini the python, Osebo the leopard and the Mmoboro hornets to buy all the world's stories from Nyame, the sky god. Now they want revenge. Ananse runs through Kejetia market, cocoa farms and the forest, dodging obstacles, collecting gold dust, and using his wits and webs to stay ahead.

It plays like Subway Surfers: three lanes, swipe to switch lanes, jump and slide, the run speeds up until you crash. It looks like a premium stylised 3D game and opens instantly in a browser.

## Core loop

- The player taps Play. The camera swoops from the menu scene behind Ananse and the run starts with no loading screen.
- Ananse runs forward automatically, and the speed slowly increases.
- The player switches lanes, jumps and slides to avoid obstacles while collecting gold dust.
- Power-ups appear and help for a few seconds.
- Hitting an obstacle head-on ends the run. A side clip makes Ananse stumble and the chaser closes in; a second stumble within a few seconds ends the run.
- The game-over screen shows score, gold, best score, and offers Sankofa (continue) or instant restart.
- Gold dust is spent in the shop on characters, outfits and power-up upgrades. Missions give reasons to play again.

## Controls

| Action                   | Mobile                                          | Desktop                  |
| ------------------------ | ----------------------------------------------- | ------------------------ |
| Move left / right        | Swipe left / right                              | Left/Right arrows or A/D |
| Jump                     | Swipe up                                        | Up arrow, W or Space     |
| Slide / roll             | Swipe down (also cancels a jump and drops fast) | Down arrow or S          |
| Activate stored power-up | Double-tap                                      | E                        |
| Pause                    | Pause button                                    | Esc or P                 |

Inputs are buffered for about 150 ms, so a swipe made just before landing still counts. Swipe detection needs a minimum distance (about 30 px) and ignores taps.

## Starting tuning values

All live in `src/config/tuning.ts`.

| Parameter              | Start value             | Notes                           |
| ---------------------- | ----------------------- | ------------------------------- |
| Lane width             | 2.5 units               | Three lanes at x = -2.5, 0, 2.5 |
| Starting speed         | 12 units/s              |                                 |
| Max speed              | 32 units/s              | Reached after about 4 minutes   |
| Speed ramp             | +0.6 units/s every 10 s | Ease out near the max           |
| Lane switch time       | 0.12 s                  | Smoothly eased, not instant     |
| Jump height / duration | 2.6 units / 0.6 s       |                                 |
| Slide duration         | 0.6 s                   |                                 |
| Gold dust value        | 1 per pickup            | Doubled by the Talking Drum     |

## World 1: Kejetia Market (launch world)

A busy, colourful market street at golden hour, with the Kumasi skyline in the distance.

- **Low obstacles (jump over):** stacked tomato crates, a market woman's basin on the ground, sacks of gari, a sleeping dog.
- **High obstacles (slide under):** an awning pole across the lane, cloth lines with kente and wax prints, a hanging signboard.
- **Full blockers (change lanes):** a parked trotro, a kiosk, a stack of plastic chairs, a push truck.
- **Moving obstacles:** a trotro coming toward you in a lane, an okada crossing lanes.
- **Platforms:** trotro roofs and kiosk roofs, reached with ramps or jumps.
- **Background detail:** stall umbrellas, hawkers with head pans, Ghanaian-style signboards, flags, birds. Decoration only, cheap to render.

## Chasers

One chaser is visible behind Ananse at the start of each run and after every stumble. In World 1 the chaser is Osebo the leopard. Onini the python and the Mmoboro hornets are saved for later worlds. The chaser drops back off-screen after a few seconds of clean running.

## Collectibles

- **Gold dust:** the main currency, placed in lines and arcs that guide the player's path.
- **Gold weights (abrammuo):** rare. Each reveals a short Akan proverb with an English meaning. A full set gives a reward. Proverbs must be checked by the owner before release.
- **Story pages:** fragments of Ananse tales, unlocked as missions are completed.

## Power-ups

| Power-up             | Effect                                                                              | Duration  |
| -------------------- | ----------------------------------------------------------------------------------- | --------- |
| Web Swing            | Swings above the lanes on webs, collecting gold, untouchable                        | 6 s       |
| Gye Nyame Shield     | Absorbs one crash                                                                   | Until hit |
| Kente Magnet         | Pulls in gold dust from all lanes                                                   | 10 s      |
| Talking Drum         | Doubles score and gold. Music tempo lifts                                           | 10 s      |
| Spring Web           | Super-jumps for higher pickups                                                      | 8 s       |
| Sankofa (consumable) | After a crash: rewind 2 s and continue. Earned through missions or bought with gold | One use   |

Each power-up can be upgraded in the shop to last longer.

## Characters and cosmetics

- **Ananse:** default. A man with subtle spider features: four arms (extra pair tucked in, visible when he swings), a sly grin, a cloth wrap, a small bag of stories.
- **Ntikuma**, Ananse's son. Unlocked with gold.
- **Aso**, Ananse's wife. Unlocked with gold.
- **Outfits:** kente festival wear, batakari smock, market-day outfit.
- **Trails:** the glow left behind while running, such as gold dust or Adinkra symbols.
- At launch extra characters may reuse Ananse's skeleton and animations with different models and textures.

## Progression and retention

- **Missions:** three active at a time (for example "Collect 500 gold dust in one run"). Completing a set raises the score multiplier level.
- **Daily reward:** gold for consecutive days, streaks reset gently.
- Best score and personal stats.
- **Leaderboards:** weekly and all-time, linked accounts only, server-checked scores.
- No ads and no purchases at launch. Optional cosmetic purchases (Paystack, mobile money) after launch, with owner approval.

## Culture and content guidelines

- Ananse stories and the folklore creatures are shared heritage. Playful and affectionate, never mocking.
- Every Twi word, proverb, Adinkra meaning and place detail lives in `src/content/culture.ts`, marked `verified: false` until the owner confirms it. Unverified content is never presented as fact in the UI.
- Adinkra symbols are used with their correct meanings.
- No sacred objects (for example the Golden Stool) as items, power-ups or decorations.
- Ghanaian street details (trotros, signboards, food) feel familiar and loving, not stereotypes.
- Before launch, at least one person knowledgeable in Akan culture reviews the text content.

## UI/UX principles

The target is a polished mobile game: the player never waits, never gets lost, and every screen change is animated.

- One tap to play. No splash wall, no terms gate, no login before the first run. A short, dismissible privacy notice can appear on the menu.
- The menu is the game world. Ananse idles in the market behind the menu UI. Tapping Play animates the camera into the run with no scene change and no loading screen.
- Every transition is animated, 200 to 400 ms with easing. Nothing appears suddenly.
- Thumb-friendly: main buttons in the bottom half, at least 48 px tall. Works in portrait on phones.
- Readable: high contrast, a playful display font for headings, a clean sans-serif elsewhere.
- Responsive: phone portrait first, then landscape, tablet and desktop.
- Accessible: reduced-motion setting, separate music and sound volume, colour-blind-safe power-up signals, big-text option.

## Screens

| Screen           | Contents                                                                                                                                       | Goes to                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Boot             | Logo with animated gold-dust shimmer while core assets load (under 3 s)                                                                        | Home                                               |
| Home (3D menu)   | Play, best score, gold, missions, shop, characters, settings, profile                                                                          | Run, Shop, Characters, Missions, Settings, Profile |
| Run HUD          | Score, gold, multiplier, active power-up timers, pause                                                                                         | Pause, Game Over                                   |
| Pause            | Resume, restart, settings, quit to home                                                                                                        | Run, Home, Settings                                |
| Game Over        | Score, gold earned, new best animation, mission progress, Sankofa continue (5 s countdown), restart, home, share score card                    | Run, Home                                          |
| Shop             | Power-up upgrades, Sankofa tokens, outfits                                                                                                     | Home                                               |
| Characters       | 3D character turntable, unlock with gold, equip                                                                                                | Home                                               |
| Missions         | Active missions, progress, rewards, multiplier level                                                                                           | Home                                               |
| Collection       | Gold weights with proverbs, story pages                                                                                                        | Home                                               |
| Profile and save | Guest status, "Save your progress" with Google or email, stats                                                                                 | Home                                               |
| Settings         | Music and sound volume, graphics quality (Auto/Low/High), reduced motion, controls hint, language (English first, Twi later), privacy, credits | Home                                               |

## Audio

- **Music:** a highlife or Afrobeats-inspired loop with talking drum that builds during the run. Original or properly licensed.
- **Sound effects:** gold pickup (rising pitch for combos), lane-switch whoosh, jump, slide, power-up pickup and expiry, crash, stumble, leopard growl, UI taps.
- Audio starts after the first user tap, as browsers require.

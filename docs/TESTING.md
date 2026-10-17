# Testing guide

## How to run the game

On your computer:

1. Open a terminal in the project folder.
2. First time only: `npm install`.
3. Run `npm run dev` and open http://localhost:5173 in Chrome.
4. Add `?debug=1` to the address to show the performance panel.

On your phone (most important):

1. Connect phone and computer to the same Wi-Fi or hotspot.
2. Run `npm run dev:phone`. The terminal shows a "Network" address like `http://192.168.x.x:5173`.
3. Type that address into Chrome on your phone.
4. If it does not load, ask Claude Code. It is usually a firewall setting on the computer.

Simulating a phone: in Chrome press F12 (Cmd+Option+I on Mac), click the device toolbar icon and pick a phone. In the Performance tab, throttle the CPU (4x slowdown) to imitate a cheaper phone. Helpful, but never a replacement for a real phone.

## How to give feedback

After each test, add an entry to `docs/FEEDBACK.md` with this template, or paste the same text into Claude Code. Short is fine; specific is what matters.

```
## Checkpoint A – 2026-10-20 – Tecno Spark 20, Chrome

Overall feel (1-5): 3
What felt good:
- Lane switching is smooth
Problems:
- [MUST] Jump does not register if I swipe while landing
- [SHOULD] Camera feels too close; hard to see obstacles coming
- [IDEA] Coins could make a sound that rises in pitch
Performance: FPS mostly 55-60, drops to 40 when many coins appear
Screenshots/video: (attach or describe)
```

| Tag      | Meaning                                                            |
| -------- | ------------------------------------------------------------------ |
| [MUST]   | Broken, or badly hurts the experience. Fixed before the next phase |
| [SHOULD] | Clearly worse than it should be. Fix soon                          |
| [IDEA]   | Suggestion or nice-to-have. Logged with a proposed time            |

Say which device and browser, what you did just before the problem, and whether it happens every time. A screen recording from the phone is the most useful thing you can give. If unsure whether something is a bug, report it anyway.

## What happens after feedback

- Claude Code replies with a grouped list: fix now, later, and questions.
- It fixes the [MUST] items and says what changed.
- You retest only those items and mark them fixed or not fixed.
- When the [MUST] list is empty and you say "approved", the next phase begins.

## Checkpoint 0: setup

- The capsule scene shows on the computer at http://localhost:5173.
- The capsule scene shows on the phone through the Network address.
- With `?debug=1`, the panel shows FPS near 60 on both.

## Checkpoint A: game feel (after Phase 1)

Play at least 10 runs on the phone and 5 on the computer. Rate each line 1 to 5 and comment on anything below 4.

- Swipes always do what I meant (left, right, up, down). No missed or wrong swipes.
- Lane switching feels quick but not jumpy.
- Jump height and timing feel natural. I can clear low obstacles when I time it right.
- Sliding under high obstacles works, and a swipe down in the air drops me quickly.
- The camera lets me see obstacles early enough to react.
- The speed-up feels exciting, not unfair.
- Crashes feel fair: I understand why I crashed.
- Restarting is instant.
- Keyboard controls work on the computer.
- FPS (with `?debug=1`) stays near 60 on my phone. Note the lowest number.

## Checkpoint B: gameplay (after Phase 2)

- Each power-up appears, works, shows its timer and ends correctly. Test each at least twice.
- The chaser appears on a stumble, and a second stumble ends the run.
- Moving obstacles (oncoming trotro, okada) are fair and readable.
- Running on rooftops and using ramps works.
- Runs stay varied: no repeated sections.
- Difficulty: harder after 1 minute, hard but possible after 3 minutes.
- Gold, missions and daily reward counts are correct. Close and reopen the browser: progress is still there.
- Shop purchases deduct gold correctly and upgrades work.
- Sankofa continue works and costs a token.

## Checkpoints C1 and C2: character and world (after Phases 3 and 4)

- Ananse looks like the concept art and fits the style.
- Every animation plays at the right time; blends are smooth (no snapping or sliding feet).
- The extra arms appear during Web Swing and look right.
- The collision box matches what I see: no crashing into thin air, no passing through obstacles.
- The market looks lively and readable: obstacles stand out from decoration at speed.
- Obstacle types are readable at a glance (jump, slide, or switch lane).
- The leopard chaser looks and moves well.
- Lighting and colours feel warm and Ghanaian.
- FPS on the phone stays above 45 on Auto quality. Note any drops and what was on screen.
- A fresh load on mobile data reaches the menu in under about 5 seconds.

## Checkpoints D and D2: UI/UX and saving (after Phases 5 and 6)

Flow test: complete each journey and note any confusion or slowness.

- First-time player: open → play immediately → crash → restart → return home.
- Spend gold: home → shop → buy an upgrade → back → play and see it work.
- Unlock and equip a character → see them in the menu and the run.
- Pause mid-run → settings → change volume → resume.
- Save progress: play as guest → link with Google → open on another device or browser → sign in → progress is there.
- Offline: turn off data → open the game (after it has been opened once) → play → turn data on → progress syncs.

Polish checks:

- Every screen change is animated. Nothing pops in.
- Buttons are easy to tap with a thumb and give feedback.
- Text is readable on a small phone and in bright light.
- Works in portrait and landscape, on phone and laptop.
- With reduced motion on, big animations are calmer.
- The save prompt appears at a sensible moment and is easy to dismiss.
- The leaderboard shows my score after linking my account.

## Checkpoint E: real devices (after Phase 8)

Recruit 3 to 5 friends with different phones, including at least one cheap Android and, if possible, one iPhone. Each plays for 10 minutes, then answers:

- What phone do you have?
- Did it load quickly? Did anything look broken?
- Did the controls feel right? Was anything confusing?
- Did it lag or stutter at any point?
- Would you play it again tomorrow? Why or why not?
- What was the best and the worst thing about it?

Collect answers in `docs/FEEDBACK.md`, one heading per tester. Also test installing to the home screen, switching apps mid-run (it should pause), rotating the phone, and a slow connection.

## Checkpoint F: closed beta (Phase 9)

- Invite 10 to 20 players with a short form (questions from Checkpoint E plus "How likely are you to share it with a friend, 0 to 10?").
- Watch analytics: how many finish a first run, how many return the next day, where people quit.
- Fix all [MUST] issues, then launch publicly.

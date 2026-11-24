# Cap Flick: Implementation Tasks

Spec: `docs/srs.md`. Do the tasks in order; each ends in a state where `npm run typecheck` passes.

## T1. Game model and rules (pure, no React)
Files: `src/game/types.ts`, `src/game/constants.ts`, `src/game/engine.ts`
- [ ] Replace dice types with: `Vec {x,y}`, `Player {id, name, colorIndex, hits, flicks}`, `Cap {pos, vel, moving}`, `GameState {status, players, active, cap, lastResult: 'hit'|'miss'|null, targetScore}`, `GameConfig {playerNames, targetScore}`.
- [ ] Constants from SRS §6 (board size, radii, start positions, drag/power/friction/stop/wall values). Keep `PLAYER_COLORS`, `playerColor`; put yellow first, red second. Drop dice constants.
- [ ] `createPlayers(cfg)`, `startPos(playerIndex)`, `launchVelocity(dragVector)` (FR-7, FR-9: returns null under `MIN_DRAG`), `isHit(pos)` (FR-15), `applyResult(state, hit)` (FR-16 to FR-18: add hit, count flick, set winner or pass turn).
- Covers FR-2, FR-3, FR-7, FR-9, FR-15 to FR-18.

## T2. Physics step (pure)
File: `src/game/physics.ts`
- [ ] `step(cap, dt): Cap` with friction (FR-12) and wall bounce (FR-13).
- [ ] `simulate(cap)` helper for tests: runs fixed steps until stopped, returns final cap.
- Covers FR-12 to FR-14.

## T3. Self-check for engine and physics
File: `scripts/check-engine.ts` (run with `npx tsx`, or compile through `tsc` if tsx is not available; no new dependency in `package.json`)
- [ ] Asserts: centre inside target is a hit, just outside is a miss; drag below `MIN_DRAG` gives null; a launched cap always stops; cap never leaves the board; reaching `targetScore` sets status `results`; turns alternate on hit and miss.
- [ ] Add `"check": "tsx scripts/check-engine.ts"` to scripts only if `tsx` is already reachable via `npx` without install; otherwise document the command in README.

## T4. Board component
File: `src/components/Board.tsx` (replaces `PlayerBoard.tsx`, `Dice.tsx`, `DiceRollAnimation.tsx`)
- [ ] SVG with `viewBox` of the board units: paper background, target circle, two start circles, two score columns of `targetScore` slots (filled slots in player colour), both caps (FR-4, FR-5).
- [ ] Pointer handlers on the active cap: `pointerdown` + `setPointerCapture`, `pointermove` updates aim line (FR-8), `pointerup` calls `onFlick(dragVector)`. Convert screen to board units with `getScreenCTM().inverse()`. `touch-action: none` on the SVG (FR-11). Ignore input while moving (FR-10).
- [ ] "Hit!" / "Miss" flash near the target (FR-16).

## T5. Game loop in App
File: `src/App.tsx`
- [ ] Replace `handleRoll` with `handleFlick(drag)`: get velocity, set cap moving.
- [ ] `useEffect` running `requestAnimationFrame` while the cap moves, advancing `step` with a fixed `dt` accumulator (FR-14, NFR-1). On stop: `applyResult`, then after 800 ms reset cap to the next player's start (FR-17).
- [ ] Remove `ROLL_MS`, `freshId` and dice-specific state.

## T6. Screens
- [ ] `GameSetup.tsx`: two name fields, target score stepper 3–10 (FR-2). Remove player-count and stack-size controls.
- [ ] `GameBoard.tsx`: header with `TurnIndicator` (FR-6, `aria-live="polite"`), `Board`, Quit button with `confirm()` (FR-21).
- [ ] `GameResults.tsx`: winner card, both columns, flick counts, Play again / New game (FR-19, FR-20). Drop ranking and tie code.
- [ ] `HomeScreen.tsx`: title "Cap Flick", one-line rules, New game button (FR-1).

## T7. Clean up and docs
- [ ] Delete unused dice components and engine functions (`rollDice`, `applyRoll`, `computeRankings`, `currentTotal`).
- [ ] README: rename to Cap Flick, one-paragraph rules, point to `docs/srs.md`.
- [ ] `index.html` `<title>`.

## T8. Tune and verify
- [ ] `npm run dev`; tune `POWER` and `FRICTION` so roughly 1 in 3 flicks hit (SRS §6).
- [ ] Check on a 320 px wide viewport and on a touch device or touch emulation (NFR-2, FR-11).
- [ ] Walk through SRS §8 acceptance list.
- [ ] `npm run typecheck && npm run lint && npm run build` (NFR-6).

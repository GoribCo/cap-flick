# Cap Flick: Software Requirements Specification

Source: `docs/game2.mp4` (paper game, 87 s, no audio used). Rules below are read from frames taken every 0.5 s.

## 1. What the video shows

- A sheet of paper with one large **target circle** in the middle.
- Each player has a **start circle** on their own short edge: red at the top, yellow at the bottom.
- Each player has a **score column** of 6 small circles along a long edge: yellow on the left, red on the right.
- Each player flicks one bottle cap with a finger from their start circle toward the target.
- If the cap stops inside the target circle, the player puts a spare cap of their colour in the next empty slot of their score column.
- After every flick the cap goes back to its start circle and the other player flicks.
- Red fills all 6 slots first (yellow has 5) and wins.

## 2. Product scope

A browser game for 2 players on one device (hot seat), built in the existing React + TypeScript + Vite app.
It replaces the Dice Race game. The phone is the paper: player 1 at the bottom, player 2 at the top.

Out of scope for v1: online play, AI opponent, more than 2 players, sound, accounts, Supabase.

## 3. Definitions

| Term | Meaning |
|------|---------|
| Board | The play area, portrait, fixed aspect ratio 9:16, scaled to fit the screen. |
| Cap | A player's round token, radius `CAP_R`. |
| Start circle | Where a player's cap rests before each flick. |
| Target | The centre circle, radius `TARGET_R`. |
| Flick | One shot: drag back from the cap, release to launch. |
| Hit | The cap stops with its centre inside the target. |
| Score column | 6 slots per player; one fills per hit. |

## 4. Functional requirements

### Setup
- **FR-1** Home screen with a "New game" button (reuse `HomeScreen`).
- **FR-2** Setup screen: two player names (defaults "Yellow", "Red") and target score, 3 to 10, default 6.
- **FR-3** Player 1 (yellow, bottom) flicks first.

### Board
- **FR-4** Draw the board: target circle at the centre, each start circle 10 % in from its short edge, each score column along its long edge (player 1 left, player 2 right), as in the video.
- **FR-5** The active player's cap and start circle are highlighted; the other cap is shown dimmed at its start circle.
- **FR-6** A turn banner names the active player (reuse `TurnIndicator`).

### Flick
- **FR-7** The active player presses on their cap, drags away from the target direction, and releases. Launch direction is opposite to the drag; launch speed is proportional to drag length, capped at `MAX_DRAG`.
- **FR-8** While dragging, show an aim line from the cap in the launch direction, with length showing power.
- **FR-9** A drag shorter than `MIN_DRAG` on release is cancelled and is not a turn.
- **FR-10** Only the active player's cap accepts input, and only while no cap is moving.
- **FR-11** Works with mouse and touch (pointer events). Page must not scroll or zoom while dragging.

### Motion
- **FR-12** The cap moves in a straight line and slows by constant friction until speed is below `STOP_V`, then stops.
- **FR-13** The cap bounces off the board edges (velocity component reversed, damped by `WALL_DAMP`).
  Reason: on paper a cap that leaves the sheet is a miss; on a screen bounding it is simpler and the cap still loses speed. See open question Q2.
- **FR-14** Physics uses a fixed time step so results do not depend on frame rate.

### Scoring and turns
- **FR-15** When the cap stops, it is a **hit** if the distance from its centre to the target centre is less than `TARGET_R`.
- **FR-16** On a hit, fill the player's next score slot and show "Hit!". On a miss, show "Miss".
- **FR-17** After ~800 ms the cap returns to its start circle and the turn passes to the other player.
- **FR-18** The first player to fill all slots wins at once. No tie is possible.

### Results
- **FR-19** Results screen shows the winner, both score columns and the number of flicks each player took, with confetti (reuse `GameResults` shell and `Confetti`).
- **FR-20** "Play again" (same names) and "New game" (back to home) buttons.
- **FR-21** A "Quit" button during play returns to setup after a confirm.

## 5. Non-functional requirements

- **NFR-1** 60 fps on a mid-range phone; physics loop on `requestAnimationFrame`.
- **NFR-2** Playable from 320 px wide; board scales, no horizontal scroll.
- **NFR-3** No new runtime dependencies. Board drawn with SVG (or canvas), physics written by hand.
- **NFR-4** Game rules and physics live in pure functions in `src/game/`, separate from React, so they can be tested.
- **NFR-5** Turn banner and result text readable by screen readers (`aria-live`). Buttons reachable by keyboard.
- **NFR-6** `npm run typecheck`, `npm run lint` and `npm run build` pass.

## 6. Tuning constants (starting values, board units 0–100 wide, 0–178 tall)

| Name | Value | Note |
|------|-------|------|
| `CAP_R` | 4 | |
| `TARGET_R` | 14 | Video target is ~3.5× cap radius. |
| `START_Y` | 18 / 160 | Top / bottom start circle centres. |
| `MAX_DRAG` | 30 | Board units of drag at full power. |
| `MIN_DRAG` | 3 | |
| `POWER` | tuned so full power from start reaches the far wall | |
| `FRICTION` | tuned so a ~60 % drag stops near the target | |
| `STOP_V` | 0.5 units/s | |
| `WALL_DAMP` | 0.6 | |

Tuning target: a new player hits about 1 flick in 3.

## 7. Open questions (defaults chosen; change if you disagree)

- **Q1** Cap resting on the target line: the video does not show a clear rule. Default: centre inside counts.
- **Q2** Off-board: default bounce (FR-13). Alternative: leaving the board is a miss.
- **Q3** Cap-to-cap collision: the opponent's cap sits at its own start, far from the target, so v1 ignores collisions.
- **Q4** At ~72 s a red cap is briefly put in yellow's column and taken back. Read as a slip, not a rule (no "steal").
- **Q5** Fairness: player 1 always gets one extra chance if they reach the target score first. The video does the same. No catch-up turn in v1.

## 8. Acceptance

1. Two people on one phone can play a full game to 6 by dragging and releasing caps.
2. A cap that stops with its centre in the target always scores; one that stops outside never does.
3. Turns alternate after every flick, hit or miss.
4. The game ends the moment one column is full and shows that player as winner.
5. NFR-6 commands pass.

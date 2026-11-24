// Run: npm run check (Node 22.18+ strips types natively, no tsx needed)
import assert from 'node:assert/strict';
import { applyResult, isHit, launchVelocity, newGame, startPos } from '../src/game/engine.ts';
import { simulate } from '../src/game/physics.ts';
import { BOARD_H, BOARD_W, CAP_R, MIN_DRAG, TARGET, TARGET_R } from '../src/game/constants.ts';

// hit test
assert.ok(isHit(TARGET));
assert.ok(isHit({ x: TARGET.x + TARGET_R - CAP_R - 0.01, y: TARGET.y }));
assert.ok(!isHit({ x: TARGET.x + TARGET_R - CAP_R + 0.01, y: TARGET.y })); // touching the line is a miss

// short drag cancels
assert.equal(launchVelocity({ x: 0, y: MIN_DRAG - 0.1 }), null);
assert.ok(launchVelocity({ x: 0, y: MIN_DRAG }));

// launched caps always stop and never leave the board, from every seat, many angles and powers
for (let p = 0; p < 6; p++) {
  for (let a = 0; a < 360; a += 15) {
    for (const len of [5, 18, 30, 60]) {
      const vel = launchVelocity({ x: Math.cos((a * Math.PI) / 180) * len, y: Math.sin((a * Math.PI) / 180) * len })!;
      const end = simulate({ pos: startPos(p), vel, moving: true }, (c) => {
        assert.ok(c.pos.x >= CAP_R && c.pos.x <= BOARD_W - CAP_R && c.pos.y >= CAP_R && c.pos.y <= BOARD_H - CAP_R);
      });
      assert.equal(end.moving, false);
    }
  }
}

// ~60 % drag straight at the target from the bottom start lands in it (tuning sanity)
const toTarget = simulate({ pos: startPos(0), vel: launchVelocity({ x: 0, y: 17 })!, moving: true });
assert.ok(isHit(toTarget.pos), `60% drag ended at ${JSON.stringify(toTarget.pos)}`);

// turns rotate on hit and miss; reaching targetScore ends the game
let s = newGame({ playerNames: ['A', 'B', 'C'], targetScore: 6 });
assert.equal(s.active, 0);
s = applyResult(s, true);
assert.equal(s.active, 1);
s = applyResult(s, false);
assert.equal(s.active, 2);
s = applyResult(s, false);
assert.equal(s.active, 0);
assert.deepEqual(s.cap.pos, startPos(0));
for (let i = 0; i < 5; i++) {
  s = applyResult(s, true);
  if (s.status === 'results') break;
  s = applyResult(applyResult(s, false), false);
}
assert.equal(s.status, 'results');
assert.equal(s.players[0].hits, 6);
assert.equal(s.players[0].flicks, 6);
assert.equal(s.players[1].flicks, 5);

// targetScore and player count are clamped to the allowed ranges
assert.equal(newGame({ playerNames: ['A', 'B'], targetScore: 99 }).targetScore, 12);
assert.equal(newGame({ playerNames: Array(9).fill('x'), targetScore: 6 }).players.length, 6);

console.log('check-engine: all assertions passed');

import type { Cap } from './types.ts';
import { BOARD_H, BOARD_W, CAP_R, DT, FRICTION, STOP_V, WALL_DAMP } from './constants.ts';

/** Advance one step: constant friction (FR-12), damped bounce off the board edges (FR-13). */
export function step(cap: Cap, dt: number): Cap {
  if (!cap.moving) return cap;
  const speed = Math.hypot(cap.vel.x, cap.vel.y);
  const next = speed - FRICTION * dt;
  if (next < STOP_V) return { ...cap, vel: { x: 0, y: 0 }, moving: false };

  const k = next / speed;
  let vx = cap.vel.x * k;
  let vy = cap.vel.y * k;
  let x = cap.pos.x + vx * dt;
  let y = cap.pos.y + vy * dt;

  if (x < CAP_R) [x, vx] = [CAP_R, -vx * WALL_DAMP];
  else if (x > BOARD_W - CAP_R) [x, vx] = [BOARD_W - CAP_R, -vx * WALL_DAMP];
  if (y < CAP_R) [y, vy] = [CAP_R, -vy * WALL_DAMP];
  else if (y > BOARD_H - CAP_R) [y, vy] = [BOARD_H - CAP_R, -vy * WALL_DAMP];

  return { pos: { x, y }, vel: { x: vx, y: vy }, moving: true };
}

/** Run fixed steps until the cap stops. onStep sees every intermediate cap. */
export function simulate(cap: Cap, onStep?: (c: Cap) => void): Cap {
  let c = cap;
  for (let i = 0; c.moving && i < 100_000; i++) {
    c = step(c, DT);
    onStep?.(c);
  }
  return c;
}

import type { Cap, GameConfig, GameState, Player, Vec } from './types.ts';
import {
  CAP_R,
  DEFAULT_TARGET,
  MAX_DRAG,
  MAX_PLAYERS,
  MAX_TARGET,
  MIN_DRAG,
  MIN_PLAYERS,
  MIN_TARGET,
  PLAYER_COLORS,
  POWER,
  START_X,
  START_Y,
  TARGET,
  TARGET_R,
} from './constants.ts';

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function defaultName(i: number): string {
  return PLAYER_COLORS[i].name;
}

export function defaultConfig(): GameConfig {
  return { playerNames: [defaultName(0), defaultName(1)], targetScore: DEFAULT_TARGET };
}

export function createPlayers(cfg: GameConfig): Player[] {
  const count = clamp(cfg.playerNames.length, MIN_PLAYERS, MAX_PLAYERS);
  return Array.from({ length: count }, (_, i) => ({
    id: uid('p'),
    name: cfg.playerNames[i]?.trim() || defaultName(i),
    colorIndex: i,
    hits: 0,
    flicks: 0,
  }));
}

/** Player 0 bottom centre, 1 top centre, then further seats left/right of centre on alternating sides. */
export function startPos(playerIndex: number): Vec {
  const bottom = playerIndex % 2 === 0;
  const seat = Math.floor(playerIndex / 2);
  // mirror the top row so each top seat faces its bottom counterpart diagonally
  const x = bottom ? START_X[seat] : 100 - START_X[seat];
  return { x, y: bottom ? START_Y.bottom : START_Y.top };
}

export function restingCap(playerIndex: number): Cap {
  return { pos: startPos(playerIndex), vel: { x: 0, y: 0 }, moving: false };
}

export function newGame(cfg: GameConfig): GameState {
  return {
    status: 'playing',
    players: createPlayers(cfg),
    active: 0,
    cap: restingCap(0),
    lastResult: null,
    targetScore: clamp(cfg.targetScore, MIN_TARGET, MAX_TARGET),
  };
}

/** Drag is pointer minus cap centre; the cap launches the opposite way. Null if too short (FR-9). */
export function launchVelocity(drag: Vec): Vec | null {
  const len = Math.hypot(drag.x, drag.y);
  if (len < MIN_DRAG) return null;
  const speed = POWER * Math.min(len, MAX_DRAG);
  return { x: (-drag.x / len) * speed, y: (-drag.y / len) * speed };
}

/** Hit only when the whole cap is inside the target, not touching its line. */
export function isHit(pos: Vec): boolean {
  return Math.hypot(pos.x - TARGET.x, pos.y - TARGET.y) + CAP_R < TARGET_R;
}

/** Score the active player's flick, then end the game or pass the turn with a fresh cap. */
export function applyResult(state: GameState, hit: boolean): GameState {
  const players = state.players.map((p, i) =>
    i === state.active ? { ...p, hits: p.hits + (hit ? 1 : 0), flicks: p.flicks + 1 } : p
  );
  if (players[state.active].hits >= state.targetScore) {
    return { ...state, players, lastResult: null, status: 'results' };
  }
  const active = (state.active + 1) % players.length;
  return { ...state, players, active, cap: restingCap(active), lastResult: null };
}

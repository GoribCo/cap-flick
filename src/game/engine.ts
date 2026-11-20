import type { DiceResult, GameConfig, Player, PlayerRanking } from './types';
import { DEFAULT_STACK, MAX_PLAYERS, MAX_STACK, MIN_PLAYERS, MIN_STACK } from './constants';

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createPlayers(config: GameConfig): Player[] {
  const safeCount = clamp(config.playerCount, MIN_PLAYERS, MAX_PLAYERS);
  return Array.from({ length: safeCount }, (_, i) => ({
    id: uid('p'),
    name: config.playerNames[i]?.trim() || `Player ${i + 1}`,
    colorIndex: i,
    scoops: [],
    finished: false,
    rollsTaken: 0,
  }));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function rollDice(): DiceResult {
  return (Math.floor(Math.random() * 6) + 1) as DiceResult;
}

export function currentTotal(player: Player): number {
  return player.scoops[player.scoops.length - 1] ?? 0;
}

/** Add the roll to the running total and fill the next scoop. Returns a new player. */
export function applyRoll(player: Player, roll: DiceResult, stackSize: number): Player {
  const before = currentTotal(player);
  const scoops = [...player.scoops, before + roll];
  return { ...player, scoops, rollsTaken: player.rollsTaken + 1, finished: scoops.length >= stackSize };
}

/** Highest final total wins. Equal totals share a rank. */
export function computeRankings(players: Player[]): PlayerRanking[] {
  const sorted = [...players].sort((a, b) => currentTotal(b) - currentTotal(a));
  return sorted.map((player) => ({
    player,
    total: currentTotal(player),
    rank: 1 + sorted.filter((p) => currentTotal(p) > currentTotal(player)).length,
  }));
}

export function defaultConfig(): GameConfig {
  return {
    playerCount: MIN_PLAYERS,
    stackSize: clamp(DEFAULT_STACK, MIN_STACK, MAX_STACK),
    playerNames: ['Player 1', 'Player 2'],
  };
}

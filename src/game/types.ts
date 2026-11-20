export type GameStatus = 'home' | 'setup' | 'playing' | 'results';

export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

export type DiceResult = DiceFace;

export interface Player {
  id: string;
  name: string;
  colorIndex: number;
  /** Running totals, one per filled scoop, bottom (next to the cone) first. */
  scoops: number[];
  finished: boolean;
  /** Total dice rolls taken by this player. */
  rollsTaken: number;
}

export interface PlayerRanking {
  player: Player;
  rank: number;
  total: number;
}

export interface GameState {
  status: GameStatus;
  players: Player[];
  activePlayerIndex: number;
  turnNumber: number;
  rankings: PlayerRanking[];
  /** Latest dice value rolled, null at the start of a turn. */
  lastRoll: DiceResult | null;
  /** Human-readable feedback for the most recent action. */
  message: string;
  /** Whether the dice is currently animating. */
  rolling: boolean;
  /** Scoops per cone for this game. */
  stackSize: number;
}

export interface GameConfig {
  playerCount: number;
  stackSize: number;
  playerNames: string[];
}

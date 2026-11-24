export type GameStatus = 'home' | 'setup' | 'playing' | 'results';

export interface Vec {
  x: number;
  y: number;
}

export interface Player {
  id: string;
  name: string;
  colorIndex: number;
  hits: number;
  flicks: number;
}

export interface Cap {
  pos: Vec;
  vel: Vec;
  moving: boolean;
}

export interface GameState {
  status: GameStatus;
  players: Player[];
  /** Index of the player whose turn it is. */
  active: number;
  /** The active player's cap. Other caps rest at their start circles. */
  cap: Cap;
  /** Set while the result of the last flick is shown, null otherwise. */
  lastResult: 'hit' | 'miss' | null;
  targetScore: number;
}

export interface GameConfig {
  /** One name per player; its length is the player count. */
  playerNames: string[];
  targetScore: number;
}

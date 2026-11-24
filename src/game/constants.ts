export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;

/** Score circles per player. */
export const MIN_TARGET = 6;
export const MAX_TARGET = 12;
export const DEFAULT_TARGET = 6;

// Board units (SRS §6): 0–100 wide, 0–178 tall.
export const BOARD_W = 100;
export const BOARD_H = 178;
export const CAP_R = 4;
export const START_R = 6;
export const TARGET = { x: 50, y: 89 } as const;
export const TARGET_R = 14;
/** Even players start at the bottom, odd players at the top (SRS: player 1 bottom, player 2 top). */
export const START_Y = { top: 26, bottom: 152 } as const;
/** Start x per seat on a side; seat 0 is the centre like the video. */
export const START_X = [50, 31, 69] as const;

export const MAX_DRAG = 30;
export const MIN_DRAG = 3;
/** Launch speed per board unit of drag. Full drag travels ~175 units, 60 % drag ~63 (start to target). */
export const POWER = 6.85;
/** Constant deceleration, units/s². */
export const FRICTION = 120;
export const STOP_V = 0.5;
export const WALL_DAMP = 0.6;
/** Fixed physics step, seconds. */
export const DT = 1 / 120;
export const RESULT_MS = 800;

export interface PlayerColor {
  name: string;
  text: string;
  bg: string;
  bgSoft: string;
  ring: string;
  gradient: string;
  solid: string;
  border: string;
}

export const PLAYER_COLORS: PlayerColor[] = [
  {
    name: 'Yellow',
    text: 'text-gold-700',
    bg: 'bg-gold-500',
    bgSoft: 'bg-gold-100',
    ring: 'ring-gold-400',
    gradient: 'from-gold-300 to-gold-600',
    solid: '#efad1f',
    border: 'border-gold-300',
  },
  {
    name: 'Red',
    text: 'text-red-600',
    bg: 'bg-red-500',
    bgSoft: 'bg-red-100',
    ring: 'ring-red-400',
    gradient: 'from-red-400 to-red-600',
    solid: '#ef4444',
    border: 'border-red-300',
  },
  {
    name: 'Blue',
    text: 'text-sky-600',
    bg: 'bg-sky-500',
    bgSoft: 'bg-sky-100',
    ring: 'ring-sky-400',
    gradient: 'from-sky-400 to-sky-600',
    solid: '#0ea5e9',
    border: 'border-sky-300',
  },
  {
    name: 'Green',
    text: 'text-felt-600',
    bg: 'bg-felt-500',
    bgSoft: 'bg-felt-100',
    ring: 'ring-felt-400',
    gradient: 'from-felt-400 to-felt-600',
    solid: '#229c6a',
    border: 'border-felt-300',
  },
  {
    name: 'Violet',
    text: 'text-violet-600',
    bg: 'bg-violet-500',
    bgSoft: 'bg-violet-100',
    ring: 'ring-violet-400',
    gradient: 'from-violet-400 to-violet-600',
    solid: '#8b5cf6',
    border: 'border-violet-300',
  },
  {
    name: 'Orange',
    text: 'text-orange-600',
    bg: 'bg-orange-500',
    bgSoft: 'bg-orange-100',
    ring: 'ring-orange-400',
    gradient: 'from-orange-400 to-orange-600',
    solid: '#f97316',
    border: 'border-orange-300',
  },
];

export function playerColor(index: number): PlayerColor {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

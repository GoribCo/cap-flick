import { memo, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import type { Player } from '@/game/types';
import { playerColor } from '@/game/constants';
import { currentTotal } from '@/game/engine';

/** Hand-drawn waffle cone, like the marker drawing in the video. */
export function Cone({ width = 64 }: { width?: number }) {
  return (
    <svg width={width} height={width * 1.05} viewBox="0 0 64 67" aria-hidden className="shrink-0">
      <defs>
        <clipPath id="cone-body">
          <path d="M5 9 L59 9 L47 64 L17 64 Z" />
        </clipPath>
      </defs>
      <path d="M5 9 L59 9 L47 64 L17 64 Z" fill="#f1c88c" />
      <g clipPath="url(#cone-body)" stroke="#a0522d" strokeWidth="1.6" opacity="0.75">
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`a${i}`} x1={-20 + i * 10} y1="0" x2={20 + i * 10} y2="70" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`b${i}`} x1={84 - i * 10} y1="0" x2={44 - i * 10} y2="70" />
        ))}
      </g>
      <path d="M5 9 L59 9 L47 64 L17 64 Z" fill="none" stroke="#3b2414" strokeWidth="2.4" strokeLinejoin="round" />
      <ellipse cx="32" cy="9" rx="28" ry="6" fill="#f8e3c2" stroke="#3b2414" strokeWidth="2.4" />
    </svg>
  );
}

interface ScoopStackProps {
  player: Player;
  stackSize: number;
  active?: boolean;
  /** animate the newest scoop */
  fresh?: boolean;
  winner?: boolean;
  /** scoop height in px */
  size: number;
}

/** Scoop height that keeps every cone on screen: tall stacks and many players get smaller scoops. */
function scoopSize(stackSize: number, playerCount: number, viewportWidth: number) {
  const byHeight = stackSize <= 8 ? 46 : stackSize <= 11 ? 38 : 32;
  // each column needs about 1.35 * h plus ~14px of padding; leave ~70px for page and paper margins
  const byWidth = Math.floor((Math.min(viewportWidth, 768) - 70) / playerCount / 1.35 - 11);
  return Math.max(24, Math.min(byHeight, byWidth));
}

function useViewportWidth() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w;
}

function ScoopStackBase({ player, stackSize, active = false, fresh = false, winner = false, size }: ScoopStackProps) {
  const color = playerColor(player.colorIndex);
  const h = size;
  const w = Math.round(h * 1.35);
  const filled = player.scoops.length;
  const top = filled - 1;

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl px-1 pb-1 pt-2 sm:px-2 transition-colors ${
        active ? 'bg-black/[0.04]' : ''
      }`}
      aria-label={`${player.name}: ${filled} of ${stackSize} scoops, total ${currentTotal(player)}`}
    >
      <span
        className="mb-2 max-w-[6.5rem] truncate font-hand text-lg sm:text-xl leading-none"
        style={{
          color: color.solid,
          // highlighter stroke under the active player's name
          backgroundImage: active ? `linear-gradient(transparent 55%, ${color.solid}33 55%)` : undefined,
        }}
      >
        {player.name}
      </span>

      {/* top scoop is drawn first; the stack sits on the cone */}
      <div className="flex flex-col items-center">
        {Array.from({ length: stackSize }, (_, k) => {
          const i = stackSize - 1 - k;
          const value = player.scoops[i];
          const isFilled = value !== undefined;
          const isNext = active && i === filled;
          const isFresh = fresh && i === top;
          const isWin = winner && i === top;
          return (
            <div
              key={i}
              className={`relative flex items-center justify-center rounded-[50%] border-[3px] bg-white font-hand leading-none ${
                isFresh ? 'animate-popIn' : ''
              } ${isNext ? 'animate-pulse' : ''}`}
              style={{
                width: w,
                height: h,
                marginBottom: -Math.round(h * 0.18),
                zIndex: stackSize - i,
                borderColor: color.solid,
                opacity: isFilled || isNext ? 1 : 0.4,
                borderStyle: isNext ? 'dashed' : 'solid',
                color: color.solid,
                fontSize: h * 0.55,
                boxShadow: isWin ? '0 0 0 4px #ef4444' : undefined,
              }}
            >
              {isFilled ? value : ''}
            </div>
          );
        })}
      </div>
      <div className="relative" style={{ zIndex: 0 }}>
        <Cone width={Math.round(w * 1.1)} />
        {winner && (
          <Star
            className="absolute -right-5 -top-3 h-8 w-8 animate-popIn fill-orange-400 text-orange-500"
            strokeWidth={1.5}
          />
        )}
      </div>
      <span className="mt-1 font-hand text-lg leading-none text-slate-500">
        = <span className="text-2xl text-slate-800">{currentTotal(player)}</span>
      </span>
    </div>
  );
}

export const ScoopStack = memo(ScoopStackBase);

interface PaperBoardProps {
  players: Player[];
  stackSize: number;
  activeId?: string;
  freshId?: string | null;
  winnerIds?: string[];
}

/** The sheet of paper on the table, one cone per player, like the video. */
export function PaperBoard({ players, stackSize, activeId, freshId, winnerIds = [] }: PaperBoardProps) {
  const size = scoopSize(stackSize, players.length, useViewportWidth());
  return (
    <div className="scroll-area overflow-x-auto rounded-3xl bg-[#fdfcf8] shadow-[0_18px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
      <div className="mx-auto flex w-max items-end gap-0.5 px-2 py-4 sm:gap-4 sm:px-6">
        {players.map((p) => (
          <ScoopStack
            key={p.id}
            player={p}
            stackSize={stackSize}
            active={p.id === activeId}
            fresh={p.id === freshId}
            winner={winnerIds.includes(p.id)}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}

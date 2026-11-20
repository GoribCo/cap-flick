import { memo } from 'react';
import type { Player } from '@/game/types';
import { playerColor } from '@/game/constants';
import { currentTotal } from '@/game/engine';

interface TurnIndicatorProps {
  player: Player;
  stackSize: number;
  turnNumber: number;
  rolling: boolean;
}

function TurnIndicatorBase({ player, stackSize, turnNumber, rolling }: TurnIndicatorProps) {
  const color = playerColor(player.colorIndex);
  const filled = player.scoops.length;

  return (
    <div
      key={player.id}
      className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${color.gradient} px-4 py-3 text-white shadow-pop animate-bannerIn`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg font-extrabold no-select">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-extrabold sm:text-lg">
          {player.name}'s turn{rolling ? ' · rolling…' : ''}
        </div>
        <div className="text-xs font-bold text-white/85">
          Scoop {Math.min(filled + 1, stackSize)} of {stackSize} · Round {turnNumber}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/75">Total</span>
        <span className="font-hand text-3xl leading-none tabular-nums">{currentTotal(player)}</span>
      </div>
    </div>
  );
}

export const TurnIndicator = memo(TurnIndicatorBase);

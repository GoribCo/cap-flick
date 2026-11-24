import { memo } from 'react';
import type { Player } from '@/game/types';
import { playerColor } from '@/game/constants';

interface TurnIndicatorProps {
  player: Player;
  targetScore: number;
}

function TurnIndicatorBase({ player, targetScore }: TurnIndicatorProps) {
  const color = playerColor(player.colorIndex);

  return (
    <div
      key={player.id}
      aria-live="polite"
      className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${color.gradient} px-4 py-2.5 text-white shadow-pop animate-bannerIn`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 text-lg font-extrabold no-select">
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-extrabold sm:text-lg">{player.name}'s turn</div>
        <div className="text-xs font-bold text-white/85">Drag back from your cap, let go to flick</div>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/75">Hits</span>
        <span className="font-hand text-2xl leading-none tabular-nums">
          {player.hits}/{targetScore}
        </span>
      </div>
    </div>
  );
}

export const TurnIndicator = memo(TurnIndicatorBase);

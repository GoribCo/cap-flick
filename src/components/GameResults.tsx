import { Home, RotateCcw, Trophy, Crown, Medal } from 'lucide-react';
import type { Player, PlayerRanking } from '@/game/types';
import { playerColor } from '@/game/constants';
import { PaperBoard } from './PlayerBoard';

interface GameResultsProps {
  rankings: PlayerRanking[];
  players: Player[];
  stackSize: number;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

const MEDAL: Record<number, { icon: React.ReactNode; chip: string }> = {
  1: { icon: <Crown className="h-5 w-5" />, chip: 'bg-gold-400/20 text-gold-300' },
  2: { icon: <Medal className="h-5 w-5" />, chip: 'bg-slate-300/20 text-slate-200' },
  3: { icon: <Medal className="h-5 w-5" />, chip: 'bg-amber-600/20 text-amber-400' },
};

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th'];

export function GameResults({ rankings, players, stackSize, onPlayAgain, onNewGame }: GameResultsProps) {
  const winners = rankings.filter((r) => r.rank === 1);
  const tie = winners.length > 1;
  const wColor = playerColor(winners[0].player.colorIndex);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-felt-800 via-felt-900 to-felt-950 px-4 py-8">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/25 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-gold-300 animate-bannerIn">
          <Trophy className="h-7 w-7" />
          <h1 className="font-display text-3xl font-bold text-white">{tie ? "It's a tie!" : 'We have a winner!'}</h1>
        </div>

        <div
          className={`w-full rounded-3xl bg-gradient-to-br ${wColor.gradient} p-5 text-center text-white shadow-pop ring-4 ring-gold-400 animate-bannerIn`}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">{tie ? 'Winners' : 'Winner'}</div>
          <div className="font-display text-3xl font-bold">{winners.map((w) => w.player.name).join(' & ')}</div>
          <div className="mt-2 inline-flex items-baseline gap-1.5 rounded-full bg-white/25 px-4 py-1 font-bold">
            Final total <span className="font-hand text-3xl leading-none">{winners[0].total}</span>
          </div>
        </div>

        <div className="w-full">
          <PaperBoard players={players} stackSize={stackSize} winnerIds={winners.map((w) => w.player.id)} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <h2 className="px-1 text-xs font-extrabold uppercase tracking-wider text-white/50">Final ranking</h2>
          {rankings.map((r, i) => {
            const color = playerColor(r.player.colorIndex);
            const medal = MEDAL[r.rank];
            return (
              <div
                key={r.player.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 animate-slideInRight"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color.bg} font-extrabold text-white no-select`}
                >
                  {medal ? medal.icon : r.rank}
                </div>
                <div className="min-w-0 flex-1 truncate font-extrabold text-white">{r.player.name}</div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${medal?.chip ?? 'bg-white/10 text-white/70'}`}
                >
                  {ORDINAL[r.rank]}
                </span>
                <span className="w-12 shrink-0 text-right font-hand text-3xl leading-none text-white tabular-nums">
                  {r.total}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            onClick={onPlayAgain}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-lucky-400 to-lucky-600 px-6 py-4 text-base font-extrabold text-white shadow-pop transition-all hover:scale-[1.02] active:scale-95"
          >
            <RotateCcw className="h-5 w-5" /> Play Again
          </button>
          <button
            onClick={onNewGame}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-base font-extrabold text-white transition-all hover:bg-white/20 active:scale-95"
          >
            <Home className="h-5 w-5" /> New Game
          </button>
        </div>
      </div>
    </div>
  );
}

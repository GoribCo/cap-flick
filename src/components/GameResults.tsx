import { Home, RotateCcw, Trophy } from 'lucide-react';
import type { GameState } from '@/game/types';
import { playerColor } from '@/game/constants';

interface GameResultsProps {
  state: GameState;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export function GameResults({ state, onPlayAgain, onNewGame }: GameResultsProps) {
  const { players, targetScore } = state;
  // the game ends on the winner's flick, so the winner is still the active player
  const winner = players[state.active];
  const wColor = playerColor(winner.colorIndex);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-felt-800 via-felt-900 to-felt-950 px-4 py-8">
      <div className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-500/25 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-gold-300 animate-bannerIn">
          <Trophy className="h-7 w-7" />
          <h1 className="font-display text-3xl font-bold text-white">We have a winner!</h1>
        </div>

        <div
          aria-live="polite"
          className={`w-full rounded-3xl bg-gradient-to-br ${wColor.gradient} p-5 text-center text-white shadow-pop ring-4 ring-gold-400 animate-bannerIn`}
        >
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">Winner</div>
          <div className="font-display text-3xl font-bold">{winner.name}</div>
          <div className="mt-2 inline-flex items-baseline gap-1.5 rounded-full bg-white/25 px-4 py-1 font-bold">
            {targetScore} hits in <span className="font-hand text-3xl leading-none">{winner.flicks}</span> flicks
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          {players.map((p, i) => {
            const color = playerColor(p.colorIndex);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 animate-slideInRight"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={`h-4 w-4 shrink-0 rounded-full ${color.bg}`} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-extrabold text-white">{p.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1" aria-label={`${p.hits} of ${targetScore} hits`}>
                    {Array.from({ length: targetScore }, (_, j) => (
                      <span
                        key={j}
                        className="h-3 w-3 rounded-full border-2"
                        style={{ borderColor: color.solid, background: j < p.hits ? color.solid : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
                <span className="shrink-0 text-right text-xs font-bold text-white/70">
                  <span className="font-hand text-2xl text-white tabular-nums">{p.flicks}</span> flicks
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

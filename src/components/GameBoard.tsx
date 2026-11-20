import { useEffect } from 'react';
import { Dices, Home, LogOut } from 'lucide-react';
import type { GameState } from '@/game/types';
import { playerColor } from '@/game/constants';
import { TurnIndicator } from './TurnIndicator';
import { PaperBoard } from './PlayerBoard';
import { DiceRollAnimation } from './DiceRollAnimation';

interface GameBoardProps {
  state: GameState;
  freshId: string | null;
  onRoll: () => void;
  onQuit: () => void;
  onHome: () => void;
}

export function GameBoard({ state, freshId, onRoll, onQuit, onHome }: GameBoardProps) {
  const active = state.players[state.activePlayerIndex];
  const color = playerColor(active.colorIndex);
  const canRoll = !state.rolling;

  // Space or Enter rolls, so a shared device needs no aiming.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === ' ' || e.key === 'Enter') && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        onRoll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onRoll]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-felt-800 via-felt-900 to-felt-950">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-felt-950/70 px-3 py-2.5 backdrop-blur-md">
        <button
          onClick={onHome}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          aria-label="Home"
        >
          <Home className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-white">
          <Dices className="h-4 w-4 text-gold-300" />
          <span className="font-display text-base font-bold">Dice Race</span>
        </div>
        <button
          onClick={onQuit}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" /> Quit
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4 sm:px-4">
        <TurnIndicator
          player={active}
          stackSize={state.stackSize}
          turnNumber={state.turnNumber}
          rolling={state.rolling}
        />

        <div className="mt-4">
          <PaperBoard
            players={state.players}
            stackSize={state.stackSize}
            activeId={active.id}
            freshId={freshId}
          />
        </div>

        <p className="mt-3 text-center text-[11px] font-semibold text-white/45">
          Roll, add it to your last scoop, write the new total. Full cones? Biggest total wins!
        </p>
      </main>

      {/* Dice + roll button stay in thumb reach */}
      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-felt-950/85 px-3 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 sm:gap-5">
          <div className="shrink-0">
            <DiceRollAnimation rolling={state.rolling} value={state.lastRoll ?? 6} size={64} showLabel={false} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              key={state.message}
              className="min-h-[1.5rem] text-center font-hand text-lg leading-tight text-white animate-floatUp"
            >
              {state.message}
            </div>
            <button
              onClick={onRoll}
              disabled={!canRoll}
              className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xl font-extrabold text-white shadow-pop transition-all ${
                canRoll
                  ? `bg-gradient-to-r ${color.gradient} hover:scale-[1.02] active:scale-95 animate-glow`
                  : 'cursor-not-allowed bg-white/10 opacity-60'
              }`}
            >
              <Dices className="h-6 w-6" />
              {state.rolling ? 'Rolling…' : `ROLL, ${active.name.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

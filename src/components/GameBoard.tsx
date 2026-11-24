import { LogOut, Target } from 'lucide-react';
import type { GameState, Vec } from '@/game/types';
import { TurnIndicator } from './TurnIndicator';
import { Board } from './Board';

interface GameBoardProps {
  state: GameState;
  onFlick: (drag: Vec) => void;
  onQuit: () => void;
}

export function GameBoard({ state, onFlick, onQuit }: GameBoardProps) {
  const quit = () => {
    if (window.confirm('Quit this game?')) onQuit();
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-felt-800 via-felt-900 to-felt-950">
      <header className="flex items-center justify-between border-b border-white/10 bg-felt-950/70 px-3 py-2">
        <div className="flex items-center gap-2 text-white">
          <Target className="h-4 w-4 text-gold-300" />
          <span className="font-display text-base font-bold">Cap Flick</span>
        </div>
        <button
          onClick={quit}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20 active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" /> Quit
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-3 py-3">
        <TurnIndicator player={state.players[state.active]} targetScore={state.targetScore} />
        <Board state={state} onFlick={onFlick} />
      </main>
    </div>
  );
}

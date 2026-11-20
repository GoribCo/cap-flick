import { useEffect, useState } from 'react';
import type { GameConfig, GameState } from '@/game/types';
import {
  applyRoll,
  computeRankings,
  createPlayers,
  currentTotal,
  defaultConfig,
  rollDice,
} from '@/game/engine';
import { HomeScreen } from '@/components/HomeScreen';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { GameResults } from '@/components/GameResults';
import { Confetti } from '@/components/Confetti';

const ROLL_MS = 1000;

function freshInitialState(): GameState {
  return {
    status: 'home',
    players: [],
    activePlayerIndex: 0,
    turnNumber: 1,
    rankings: [],
    lastRoll: null,
    message: '',
    rolling: false,
    stackSize: defaultConfig().stackSize,
  };
}

export default function App() {
  const [state, setState] = useState<GameState>(freshInitialState);
  const [config, setConfig] = useState<GameConfig>(defaultConfig);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const startSetup = () => setState((s) => ({ ...s, status: 'setup' }));
  const cancelSetup = () => setState((s) => ({ ...s, status: 'home' }));

  const startGame = (cfg: GameConfig) => {
    setConfig(cfg);
    const players = createPlayers(cfg);
    setState({
      status: 'playing',
      players,
      activePlayerIndex: 0,
      turnNumber: 1,
      rankings: [],
      lastRoll: null,
      message: `${players[0].name}, roll the dice!`,
      rolling: false,
      stackSize: cfg.stackSize,
    });
    setFreshId(null);
  };

  const handleRoll = () => {
    if (state.rolling || state.status !== 'playing') return;
    const idx = state.activePlayerIndex;
    const roller = state.players[idx];
    const roll = rollDice();

    setState((s) => ({ ...s, rolling: true, lastRoll: roll, message: '' }));
    setFreshId(null);

    window.setTimeout(() => {
      setFreshId(roller.id);
      setState((s) => {
        const players = s.players.map((p, i) => (i === idx ? applyRoll(p, roll, s.stackSize) : p));
        const before = currentTotal(s.players[idx]);
        const math = `${roller.name} rolled ${roll}: ${before} + ${roll} = ${before + roll}`;

        if (players.every((p) => p.finished)) {
          return { ...s, players, rolling: false, message: math, rankings: computeRankings(players), status: 'results' };
        }

        const nextIdx = (idx + 1) % players.length;
        return {
          ...s,
          players,
          rolling: false,
          message: `${math} · ${players[nextIdx].name}'s turn`,
          activePlayerIndex: nextIdx,
          turnNumber: nextIdx === 0 ? s.turnNumber + 1 : s.turnNumber,
        };
      });
    }, ROLL_MS);
  };

  useEffect(() => {
    if (state.status !== 'results') return;
    setCelebrate(true);
    const t = window.setTimeout(() => setCelebrate(false), 5000);
    return () => window.clearTimeout(t);
  }, [state.status]);

  const newGame = () => setState(freshInitialState());
  const quitToSetup = () => setState((s) => ({ ...s, status: 'setup' }));

  const screen = state.status;
  const activePlayer = state.players[state.activePlayerIndex];

  return (
    <>
      {screen === 'home' && <HomeScreen onNewGame={startSetup} />}
      {screen === 'setup' && <GameSetup initial={config} onCancel={cancelSetup} onStart={startGame} />}
      {screen === 'playing' && activePlayer && (
        <GameBoard state={state} freshId={freshId} onRoll={handleRoll} onQuit={quitToSetup} onHome={newGame} />
      )}
      {screen === 'results' && state.rankings.length > 0 && (
        <>
          {celebrate && <Confetti />}
          <GameResults
            rankings={state.rankings}
            players={state.players}
            stackSize={state.stackSize}
            onPlayAgain={() => startGame(config)}
            onNewGame={newGame}
          />
        </>
      )}
    </>
  );
}

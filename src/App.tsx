import { useEffect, useRef, useState } from 'react';
import type { GameConfig, GameState, Vec } from '@/game/types';
import { applyResult, defaultConfig, isHit, launchVelocity, newGame, restingCap } from '@/game/engine';
import { step } from '@/game/physics';
import { DT, RESULT_MS } from '@/game/constants';
import { HomeScreen } from '@/components/HomeScreen';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { GameResults } from '@/components/GameResults';
import { Confetti } from '@/components/Confetti';

function homeState(): GameState {
  return {
    status: 'home',
    players: [],
    active: 0,
    cap: restingCap(0),
    lastResult: null,
    targetScore: defaultConfig().targetScore,
  };
}

export default function App() {
  const [state, setState] = useState<GameState>(homeState);
  const [config, setConfig] = useState<GameConfig>(defaultConfig);
  const [celebrate, setCelebrate] = useState(false);

  const startGame = (cfg: GameConfig) => {
    setConfig(cfg);
    setState(newGame(cfg));
  };

  const handleFlick = (drag: Vec) => {
    const vel = launchVelocity(drag);
    if (!vel) return;
    setState((s) =>
      s.cap.moving || s.lastResult ? s : { ...s, cap: { ...s.cap, vel, moving: true } }
    );
  };

  // Physics loop: fixed DT steps, independent of frame rate (FR-14).
  const capRef = useRef(state.cap);
  capRef.current = state.cap;
  const moving = state.cap.moving;
  useEffect(() => {
    if (!moving) return;
    let cap = capRef.current;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      acc += Math.min((now - last) / 1000, 0.1); // clamp so a background tab does not jump
      last = now;
      while (acc >= DT && cap.moving) {
        cap = step(cap, DT);
        acc -= DT;
      }
      const c = cap;
      setState((s) => (c.moving ? { ...s, cap: c } : { ...s, cap: c, lastResult: isHit(c.pos) ? 'hit' : 'miss' }));
      if (cap.moving) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [moving]);

  // Show the result, then score it and pass the turn (FR-16, FR-17).
  const lastResult = state.lastResult;
  useEffect(() => {
    if (!lastResult) return;
    const t = window.setTimeout(() => setState((s) => applyResult(s, lastResult === 'hit')), RESULT_MS);
    return () => window.clearTimeout(t);
  }, [lastResult]);

  useEffect(() => {
    if (state.status !== 'results') return;
    setCelebrate(true);
    const t = window.setTimeout(() => setCelebrate(false), 5000);
    return () => window.clearTimeout(t);
  }, [state.status]);

  const goHome = () => setState(homeState());
  const toSetup = () => setState((s) => ({ ...s, status: 'setup', cap: restingCap(0), lastResult: null }));

  return (
    <>
      {state.status === 'home' && <HomeScreen onNewGame={toSetup} />}
      {state.status === 'setup' && <GameSetup initial={config} onCancel={goHome} onStart={startGame} />}
      {state.status === 'playing' && <GameBoard state={state} onFlick={handleFlick} onQuit={toSetup} />}
      {state.status === 'results' && (
        <>
          {celebrate && <Confetti />}
          <GameResults state={state} onPlayAgain={() => startGame(config)} onNewGame={goHome} />
        </>
      )}
    </>
  );
}

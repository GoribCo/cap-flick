import { useRef, useState } from 'react';
import type { GameState, Vec } from '@/game/types';
import {
  BOARD_H,
  BOARD_W,
  CAP_R,
  MAX_DRAG,
  START_R,
  TARGET,
  TARGET_R,
  playerColor,
} from '@/game/constants';
import { startPos } from '@/game/engine';

interface BoardProps {
  state: GameState;
  onFlick: (drag: Vec) => void;
}

const SLOT_R = 3;
const SLOT_TOP = 36;
const SLOT_BOTTOM = 142;

/** Score column x: even players along the left edge, odd along the right, inward per extra seat. */
function columnX(i: number) {
  const k = Math.floor(i / 2);
  return i % 2 === 0 ? 4.5 + k * 7.5 : BOARD_W - 4.5 - k * 7.5;
}

/** Slot j's y; bottom players fill from the bottom, top players from the top. */
function slotY(i: number, j: number, n: number) {
  const y = SLOT_TOP + ((SLOT_BOTTOM - SLOT_TOP) * j) / (n - 1);
  return i % 2 === 0 ? SLOT_BOTTOM + SLOT_TOP - y : y;
}

export function Board({ state, onFlick }: BoardProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<Vec | null>(null);
  const { players, active, cap, lastResult, targetScore } = state;
  const canFlick = !cap.moving && lastResult === null;

  const toBoard = (e: React.PointerEvent): Vec => {
    const m = svgRef.current?.getScreenCTM()?.inverse();
    if (!m) return cap.pos;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: p.x, y: p.y };
  };
  const dragFrom = (e: React.PointerEvent): Vec => {
    const p = toBoard(e);
    return { x: p.x - cap.pos.x, y: p.y - cap.pos.y };
  };

  const onDown = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!canFlick) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x: 0, y: 0 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag) setDrag(dragFrom(e));
  };
  const onUp = (e: React.PointerEvent) => {
    if (!drag) return;
    setDrag(null);
    onFlick(dragFrom(e));
  };

  // aim line: opposite the drag, length shows power
  const dragLen = drag ? Math.hypot(drag.x, drag.y) : 0;
  const aimLen = Math.min(dragLen, MAX_DRAG) * 1.5;
  const aimEnd =
    drag && dragLen > 0
      ? { x: cap.pos.x - (drag.x / dragLen) * aimLen, y: cap.pos.y - (drag.y / dragLen) * aimLen }
      : null;
  const activeColor = playerColor(players[active].colorIndex).solid;

  return (
    <div className="mx-auto" style={{ width: 'min(100%, calc((100dvh - 10rem) * 0.5618))' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
        className="block w-full rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.35)] no-select"
        style={{ touchAction: 'none' }}
        role="img"
        aria-label={`Board. ${players.map((p) => `${p.name} ${p.hits} of ${targetScore}`).join(', ')}`}
      >
        <rect width={BOARD_W} height={BOARD_H} rx={3} fill="#fdfcf8" />
        <circle cx={TARGET.x} cy={TARGET.y} r={TARGET_R} fill="none" stroke="#efad1f" strokeWidth={1.2} className="target-glow" />

        {players.map((p, i) => {
          const color = playerColor(p.colorIndex).solid;
          const s = startPos(i);
          return (
            <g key={p.id}>
              <circle
                cx={s.x}
                cy={s.y}
                r={START_R}
                fill="none"
                stroke={color}
                strokeWidth={i === active ? 1 : 0.5}
                opacity={i === active ? 1 : 0.5}
              />
              {Array.from({ length: targetScore }, (_, j) => (
                <circle
                  key={j}
                  cx={columnX(i)}
                  cy={slotY(i, j, targetScore)}
                  r={SLOT_R}
                  fill={j < p.hits ? color : 'none'}
                  stroke={color}
                  strokeWidth={0.4}
                  className={j === p.hits - 1 ? 'animate-popIn' : undefined}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
              ))}
              {i !== active && (
                <circle cx={s.x} cy={s.y} r={CAP_R} fill={color} opacity={0.4} />
              )}
              <text
                x={s.x}
                y={s.y + START_R + 5}
                textAnchor="middle"
                fontSize={i === active ? 4.4 : 3.6}
                fontWeight={i === active ? 800 : 600}
                fill={i === active ? color : '#64748b'}
                className={i === active ? 'name-glow font-display' : 'font-display'}
                style={{ color }}
              >
                {/* shortcut: names cut at 8 chars so side-by-side seats do not overlap */}
                {p.name.length > 8 ? `${p.name.slice(0, 7)}…` : p.name}
              </text>
            </g>
          );
        })}

        {aimEnd && (
          <line
            x1={cap.pos.x}
            y1={cap.pos.y}
            x2={aimEnd.x}
            y2={aimEnd.y}
            stroke={activeColor}
            strokeWidth={0.8}
            strokeDasharray="2 1.5"
            strokeLinecap="round"
          />
        )}

        <circle cx={cap.pos.x} cy={cap.pos.y} r={CAP_R} fill={activeColor} stroke="#fff" strokeWidth={0.8} />
        {/* bigger invisible grab area for fingers */}
        <circle
          cx={cap.pos.x}
          cy={cap.pos.y}
          r={CAP_R * 2.5}
          fill="transparent"
          style={{ cursor: canFlick ? 'grab' : 'default' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => setDrag(null)}
        />

        {lastResult && (
          <text
            key={`${state.players[active].flicks}-${lastResult}`}
            x={TARGET.x}
            y={TARGET.y - TARGET_R - 4}
            textAnchor="middle"
            fontSize={9}
            fontWeight={800}
            fill={lastResult === 'hit' ? '#16a34a' : '#64748b'}
            className="font-display animate-popIn"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            {lastResult === 'hit' ? 'Hit!' : 'Miss'}
          </text>
        )}
      </svg>
    </div>
  );
}

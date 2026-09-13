/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * InteractiveLaneTurn (DRI-56): multi-lane turning. The learner's car waits in
 * a turning lane at the bottom of the intersection; dashed guide lines lead
 * into the two lanes of the new road. Tap the lane the car must arrive in.
 * Right answer: the car drives the arc into that lane and the next intersection
 * loads. Wrong answer: the rule that decides it, in one sentence.
 *
 * Geometry: 300x300 viewBox, roads 120 wide (x and y 90..210), two lanes per
 * direction, 30 each. The approach is from the bottom heading north, so our
 * lanes are x 150..180 (inner, next to the centre line) and x 180..210 (outer).
 * Turning left lands on the westbound half of the west road (y 90..150),
 * turning right on the eastbound half of the east road (y 150..210).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, RotateCcw, GitFork, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { RealCar } from './SimulatorComponents';
import { LANE_TURN_SCENARIOS, type LaneSide, type LaneTurnScenario } from '../../data/laneTurnScenarios';

const LANE = 30;
const ROAD_MIN = 90;
const ROAD_MAX = 210;
const CENTER = 150;
/** x centre of the approach lanes */
const APPROACH_X: Record<LaneSide, number> = { inner: 165, outer: 195 };
const CAR_START_Y = 262;

function targetLane(turn: 'left' | 'right', side: LaneSide) {
  // Left turn: westbound half is north (y 90..150). inner = next to centre line = y 120..150.
  // Right turn: eastbound half is south (y 150..210). inner = y 150..180.
  if (turn === 'left') {
    const y0 = side === 'inner' ? 120 : 90;
    return { x0: 0, x1: ROAD_MIN, y0, y1: y0 + LANE, cy: y0 + LANE / 2, carX: 42 };
  }
  const y0 = side === 'inner' ? 150 : 180;
  return { x0: ROAD_MAX, x1: 300, y0, y1: y0 + LANE, cy: y0 + LANE / 2, carX: 258 };
}

/** Quadratic guide line from an approach lane into a target lane. */
function guidePath(turn: 'left' | 'right', from: LaneSide, to: LaneSide) {
  const sx = APPROACH_X[from];
  const t = targetLane(turn, to);
  const ex = turn === 'left' ? ROAD_MIN : ROAD_MAX;
  // control point: continue north to the target lane's height, then bend
  return `M ${sx} ${ROAD_MAX} Q ${sx} ${t.cy} ${ex} ${t.cy}`;
}

export default function InteractiveLaneTurn({
  onComplete,
  language,
  scenarios: propScenarios,
  hideSuccessOverlay = false,
  onRoundResult,
}: {
  onComplete: () => void;
  language: 'de' | 'en';
  scenarios?: LaneTurnScenario[];
  hideSuccessOverlay?: boolean;
  onRoundResult?: (r: { wrongTaps: number; durationMs: number }) => void;
}) {
  const t = TRANSLATIONS[language].maneuvers.interactive.laneTurn;
  const scenarios = useMemo(() => propScenarios && propScenarios.length ? propScenarios : LANE_TURN_SCENARIOS, [propScenarios]);
  const [index, setIndex] = useState(0);
  const scenario = scenarios[index];
  const [chosen, setChosen] = useState<LaneSide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const wrongRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const sides: LaneSide[] = scenario.turningLanes === 2 ? ['inner', 'outer'] : [scenario.carLane];
  const target = targetLane(scenario.turn, scenario.correct);
  const startX = APPROACH_X[scenario.carLane];
  const endRotate = scenario.turn === 'left' ? -180 : 0;
  const midX = scenario.turn === 'left' ? startX - 25 : startX + 25;

  const handleTap = (side: LaneSide) => {
    if (chosen || isSuccess) return;
    if (startRef.current === null) startRef.current = Date.now();
    if (side !== scenario.correct) {
      wrongRef.current += 1;
      setError(t.errors[scenario.reasonKey]);
      later(() => setError(null), 2600);
      return;
    }
    setError(null);
    setChosen(side);
    const isLast = index >= scenarios.length - 1;
    later(() => {
      if (isLast) {
        setIsSuccess(true);
        onRoundResult?.({ wrongTaps: wrongRef.current, durationMs: Date.now() - (startRef.current ?? Date.now()) });
        return;
      }
      setFlash(true);
      later(() => {
        setFlash(false);
        setChosen(null);
        setIndex(index + 1);
      }, 900);
    }, 1500);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIndex(0);
    setChosen(null);
    setError(null);
    setFlash(false);
    setIsSuccess(false);
    wrongRef.current = 0;
    startRef.current = null;
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 shadow-inner" data-testid="lane-turn-trainer">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
            <GitFork className="h-3 w-3" />
          </div>
          {t.title}
        </h4>
        <div className="flex items-center gap-2">
          <span data-testid="lane-turn-progress" className="rounded-lg bg-slate-200 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {t.progress(index + 1, scenarios.length)}
          </span>
          <button onClick={reset} data-testid="lane-turn-reset" className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" title="Reset">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.instructions}</p>
      <p className="text-xs font-semibold text-blue-600 dark:text-blue-300" data-testid="lane-turn-your-lane">
        {scenario.turningLanes === 1 ? t.singleLane : t.yourLane(scenario.carLane, scenario.turn)}
      </p>

      <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-xl border-4 border-slate-300 bg-emerald-100 dark:border-slate-700">
        <svg data-testid="lane-turn-svg" data-scenario={scenario.id} viewBox="0 0 300 300" className="h-full w-full">
          {/* roads */}
          <rect x={ROAD_MIN} y="0" width={ROAD_MAX - ROAD_MIN} height="300" fill="#334155" />
          <rect x="0" y={ROAD_MIN} width="300" height={ROAD_MAX - ROAD_MIN} fill="#334155" />
          {/* centre lines */}
          <line x1={CENTER} y1="0" x2={CENTER} y2={ROAD_MIN} stroke="#fbbf24" strokeWidth="2" />
          <line x1={CENTER} y1={ROAD_MAX} x2={CENTER} y2="300" stroke="#fbbf24" strokeWidth="2" />
          <line x1="0" y1={CENTER} x2={ROAD_MIN} y2={CENTER} stroke="#fbbf24" strokeWidth="2" />
          <line x1={ROAD_MAX} y1={CENTER} x2="300" y2={CENTER} stroke="#fbbf24" strokeWidth="2" />
          {/* lane dividers */}
          {[120, 180].map((v) => (
            <g key={v}>
              <line x1={v} y1="0" x2={v} y2={ROAD_MIN} stroke="#fff" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.7" />
              <line x1={v} y1={ROAD_MAX} x2={v} y2="300" stroke="#fff" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.7" />
              <line x1="0" y1={v} x2={ROAD_MIN} y2={v} stroke="#fff" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.7" />
              <line x1={ROAD_MAX} y1={v} x2="300" y2={v} stroke="#fff" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.7" />
            </g>
          ))}
          {/* stop line of the approach */}
          <line x1={CENTER} y1={ROAD_MAX} x2={ROAD_MAX} y2={ROAD_MAX} stroke="#fff" strokeWidth="3" />
          {/* turning arrows on the approach lanes */}
          {sides.map((s) => {
            const x = APPROACH_X[s];
            const dir = scenario.turn === 'left' ? -1 : 1;
            return (
              <g key={`arrow-${s}`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9">
                <line x1={x} y1={292} x2={x} y2={272} />
                <path d={`M ${x} 272 Q ${x} 264 ${x + dir * 10} 264`} />
                <path d={`M ${x + dir * 6} 259 L ${x + dir * 11} 264 L ${x + dir * 6} 269`} />
              </g>
            );
          })}
          {/* guide lines through the intersection */}
          {sides.map((s) => (
            <path
              key={`guide-${s}`}
              d={guidePath(scenario.turn, s, scenario.turningLanes === 2 ? s : scenario.correct)}
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              opacity={scenario.turningLanes === 2 ? 0.75 : 0.35}
            />
          ))}
          {/* tappable target lanes */}
          {(['inner', 'outer'] as LaneSide[]).map((side) => {
            const l = targetLane(scenario.turn, side);
            const isChosen = chosen === side;
            return (
              <g key={`zone-${side}`} data-testid={`lane-zone-${side}`} onClick={() => handleTap(side)} style={{ cursor: chosen || isSuccess ? 'default' : 'pointer' }}>
                <motion.rect
                  x={l.x0}
                  y={l.y0}
                  width={l.x1 - l.x0}
                  height={l.y1 - l.y0}
                  fill={isChosen ? '#22c55e' : '#3b82f6'}
                  animate={{ opacity: isChosen ? 0.55 : chosen ? 0.08 : [0.22, 0.42, 0.22] }}
                  transition={isChosen || chosen ? { duration: 0.3 } : { repeat: Infinity, duration: 1.8 }}
                />
                <text x={(l.x0 + l.x1) / 2} y={l.cy + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" style={{ pointerEvents: 'none' }}>
                  {side === 'inner' ? t.laneLabelInner : t.laneLabelOuter}
                </text>
              </g>
            );
          })}
          {/* the learner's car */}
          <motion.g
            key={scenario.id}
            data-testid="lane-turn-car"
            initial={{ x: startX, y: CAR_START_Y, rotate: -90 }}
            animate={chosen
              ? { x: [startX, startX, midX, target.carX], y: [CAR_START_Y, ROAD_MAX - 10, target.cy + (scenario.turn === 'left' ? 15 : -15), target.cy], rotate: [-90, -90, scenario.turn === 'left' ? -135 : -45, endRotate] }
              : { x: startX, y: CAR_START_Y, rotate: -90 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            <RealCar variant="blue" indicator={scenario.turn} scale={0.4} />
          </motion.g>
        </svg>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-testid="lane-turn-error"
              className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-xl border-2 border-white/20 bg-red-500 p-3 text-center text-xs font-bold leading-snug text-white shadow-2xl"
            >
              <div className="flex items-start justify-center gap-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 stroke-[3px]" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
          {flash && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-testid="lane-turn-flash"
              className="pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-xl border-2 border-white/20 bg-emerald-500 p-3 text-center text-sm font-bold text-white shadow-2xl"
            >
              <div className="flex items-center justify-center gap-2">
                <Check className="h-4 w-4 stroke-[3px]" />
                {t.correct}
              </div>
            </motion.div>
          )}
          {isSuccess && !hideSuccessOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-600/95 p-6 text-center text-white backdrop-blur-sm"
            >
              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl">
                <Check className="h-12 w-12 stroke-[3px]" />
              </motion.div>
              <h3 className="mb-2 text-2xl font-black">{t.successTitle}</h3>
              <p className="mb-6 font-medium leading-relaxed text-blue-50">{t.successMessage}</p>
              <button
                onClick={onComplete}
                data-testid="lane-turn-continue-btn"
                className="rounded-xl bg-white px-8 py-3 text-lg font-black text-blue-600 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {t.continue}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 rounded-2xl border-2 border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/30 dark:bg-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40">
          <Info className="h-5 w-5" />
        </div>
        <p className={cn('text-sm font-medium leading-snug text-slate-700 dark:text-slate-300')} data-testid="lane-turn-fact">
          {t.facts[scenario.reasonKey]}
        </p>
      </div>
    </div>
  );
}

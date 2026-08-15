/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * CockpitTrainer (DRI-11): guided "moving off & shifting" simulator.
 * Drivebase-style: draggable clutch pedal, H-pattern gear selector,
 * brake/accelerator hold buttons, live speed/RPM/gear readouts and an
 * ENGINE -> CLUTCH -> GEARBOX power-flow strip. Step tasks come from
 * src/data/cockpitTrainer.ts; strings from maneuvers.interactive.cockpit.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Power, AlertTriangle, Cog, Zap, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import {
  STEPS,
  GEAR_TOP_SPEED,
  IDLE_RPM,
  MAX_RPM,
  STALL_RPM,
  TICK_MS,
  powerFactor,
  type CockpitSimState,
  type ManualGear,
  type AutoGear,
  type TrainerMode,
} from '../../data/cockpitTrainer';

interface Props {
  onComplete: () => void;
  onScore?: (pct: number) => void;
  language: 'de' | 'en';
  mode?: TrainerMode;
}

const INITIAL_STATE: CockpitSimState = {
  engineOn: false,
  stalled: false,
  rpm: 0,
  speed: 0,
  gear: 'N',
  autoGear: 'P',
  clutch: 0,
  brake: false,
  gas: false,
};

const MANUAL_GEARS: Array<{ gear: ManualGear; col: number; row: number }> = [
  { gear: 1, col: 0, row: 0 },
  { gear: 2, col: 0, row: 2 },
  { gear: 3, col: 1, row: 0 },
  { gear: 4, col: 1, row: 2 },
  { gear: 5, col: 2, row: 0 },
  { gear: 6, col: 2, row: 2 },
  { gear: 'R', col: 3, row: 0 },
];

const AUTO_GEARS: AutoGear[] = ['P', 'R', 'N', 'D'];

export default function CockpitTrainer({ onComplete, onScore, language, mode: initialMode = 'manual' }: Props) {
  const t = TRANSLATIONS[language];
  const tc = t.maneuvers.interactive.cockpit;

  const [mode, setMode] = useState<TrainerMode>(initialMode);
  const [sim, setSim] = useState<CockpitSimState>(INITIAL_STATE);
  const [stepIndex, setStepIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState(false);
  const scoreSent = useRef(false);
  const pedalRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const steps = STEPS[mode];
  const step = steps[stepIndex];

  const flash = useCallback((msg: string, isMistake = false) => {
    setMessage(msg);
    if (isMistake) {
      setMistakes((m) => m + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, []);

  const resetSim = useCallback((nextMode: TrainerMode) => {
    setMode(nextMode);
    setSim(INITIAL_STATE);
    setStepIndex(0);
    setMistakes(0);
    setMessage(null);
    setFinished(false);
    scoreSent.current = false;
  }, []);

  // ---- simulation tick ----
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setSim((s) => {
        if (!s.engineOn) {
          // engine off: coast down
          const speed = Math.max(0, s.speed - (s.brake ? 4 : 0.5));
          return { ...s, rpm: 0, speed: Math.round(speed * 10) / 10 };
        }

        let rpm = s.rpm;
        let speed = s.speed;

        if (mode === 'manual') {
          const pf = powerFactor(s.clutch, s.gear);
          const top = typeof s.gear === 'number' ? GEAR_TOP_SPEED[s.gear] : s.gear === 'R' ? 10 : 0;

          if (pf > 0 && top > 0) {
            // engaged: engine rpm is coupled to wheel speed + slip
            const wheelRpm = IDLE_RPM * 0.6 + (speed / top) * (MAX_RPM - IDLE_RPM);
            const throttleRpm = s.gas ? MAX_RPM * 0.6 : IDLE_RPM;
            rpm = rpm + (Math.max(wheelRpm * pf + throttleRpm * (1 - pf), s.gas ? IDLE_RPM : wheelRpm) - rpm) * 0.25;
            const targetSpeed = s.gas ? top : s.brake ? 0 : Math.min(top * 0.25, 8);
            const accel = pf * (s.gas ? 1.6 : 0.7);
            speed = speed + Math.sign(targetSpeed - speed) * Math.min(Math.abs(targetSpeed - speed), accel);
            if (s.brake) speed = Math.max(0, speed - 3.5);
            // stall: clutch engaged past biting point at crawling speed without gas
            if (rpm < STALL_RPM || (pf > 0.55 && speed < 4 && !s.gas)) {
              return { ...s, engineOn: false, stalled: true, rpm: 0, speed: Math.max(0, speed - 1) };
            }
          } else {
            // disengaged / neutral: rpm follows throttle only, car coasts
            const target = s.gas ? MAX_RPM * 0.55 : IDLE_RPM;
            rpm = rpm + (target - rpm) * 0.25;
            speed = Math.max(0, speed - (s.brake ? 3.5 : 0.35));
          }
        } else {
          // automatic: D creeps, gas accelerates, brake stops; P/N no drive
          const drive = s.autoGear === 'D' || s.autoGear === 'R';
          const top = s.autoGear === 'D' ? 60 : s.autoGear === 'R' ? 10 : 0;
          const target = !drive || s.brake ? 0 : s.gas ? top : 7; // creep at 7
          speed = speed + Math.sign(target - speed) * Math.min(Math.abs(target - speed), s.gas ? 1.8 : 1.0);
          if (s.brake) speed = Math.max(0, speed - 3.5);
          rpm = rpm + ((s.gas && drive ? 2600 : IDLE_RPM) - rpm) * 0.25;
        }

        return { ...s, rpm: Math.round(rpm), speed: Math.round(Math.max(0, speed) * 10) / 10 };
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [mode, finished]);

  // ---- stall side effect (message + mistake), tracked via sim.stalled edge ----
  const prevStalled = useRef(false);
  useEffect(() => {
    if (sim.stalled && !prevStalled.current) {
      flash(tc.msgs.stall, true);
    }
    prevStalled.current = sim.stalled;
  }, [sim.stalled, flash, tc.msgs.stall]);

  // ---- step completion ----
  useEffect(() => {
    if (finished || !step) return;
    if (step.isDone(sim)) {
      setMessage(null);
      if (stepIndex + 1 >= steps.length) {
        setFinished(true);
        if (!scoreSent.current) {
          scoreSent.current = true;
          onScore?.(Math.max(0, 100 - mistakes * 10));
        }
      } else {
        setStepIndex((i) => i + 1);
      }
    }
  }, [sim, step, stepIndex, steps.length, finished, mistakes, onScore]);

  // ---- controls ----
  const handleEngine = () => {
    setSim((s) => {
      if (s.engineOn) return { ...s, engineOn: false, rpm: 0 };
      if (mode === 'manual' && (s.clutch < 90 || !s.brake)) {
        flash(tc.msgs.needClutchStart);
        return s;
      }
      if (mode === 'automatic' && !s.brake) {
        flash(tc.msgs.needBrakeStart);
        return s;
      }
      setMessage(null);
      return { ...s, engineOn: true, stalled: false, rpm: IDLE_RPM };
    });
  };

  const handleManualGear = (gear: ManualGear) => {
    setSim((s) => {
      if (s.gear === gear) return s;
      if (s.engineOn && s.clutch < 90) {
        flash(tc.msgs.grind, true);
        return s;
      }
      setMessage(null);
      return { ...s, gear };
    });
  };

  const handleAutoGear = (autoGear: AutoGear) => {
    setSim((s) => {
      if (s.autoGear === autoGear) return s;
      if (!s.brake && (s.autoGear === 'P' || s.autoGear === 'N')) {
        flash(tc.msgs.needBrakeShift);
        return s;
      }
      setMessage(null);
      return { ...s, autoGear };
    });
  };

  // stable refs so the keyboard effect never captures stale handlers
  const handleEngineRef = useRef(handleEngine);
  handleEngineRef.current = handleEngine;
  const handleManualGearRef = useRef(handleManualGear);
  handleManualGearRef.current = handleManualGear;
  const handleAutoGearRef = useRef(handleAutoGear);
  handleAutoGearRef.current = handleAutoGear;

  const setClutchFromPointer = useCallback((clientY: number) => {
    const el = pedalRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.height <= 0) return;
    const ratio = (clientY - rect.top) / rect.height;
    const clutch = Math.round(Math.min(100, Math.max(0, ratio * 100)));
    setSim((s) => ({ ...s, clutch }));
  }, []);

  const onPedalPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setClutchFromPointer(e.clientY);
  };
  const onPedalPointerMove = (e: React.PointerEvent) => {
    if (draggingRef.current) setClutchFromPointer(e.clientY);
  };
  const onPedalPointerUp = () => {
    draggingRef.current = false;
  };

  // Toggle, not press-and-hold: a single mouse cursor cannot hold the brake
  // while clicking the engine button (real-world bug found in preview).
  const togglePedal = (key: 'brake' | 'gas') => {
    setSim((s) => ({ ...s, [key]: !s[key] }));
  };

  // Keyboard controls (desktop): keys give real hold semantics that a single
  // mouse cursor cannot. B=brake, Space=gas, arrows=clutch, E=engine,
  // 1-6/N/R (manual) or P/R/N/D (automatic) = gears.
  useEffect(() => {
    if (finished) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();
      if (k === 'b') {
        setSim((s) => (s.brake ? s : { ...s, brake: true }));
      } else if (k === ' ') {
        e.preventDefault();
        setSim((s) => (s.gas ? s : { ...s, gas: true }));
      } else if (k === 'e' && !e.repeat) {
        handleEngineRef.current();
      } else if (k === 'arrowdown' && mode === 'manual') {
        e.preventDefault();
        setSim((s) => ({ ...s, clutch: Math.min(100, s.clutch + 8) }));
      } else if (k === 'arrowup' && mode === 'manual') {
        e.preventDefault();
        setSim((s) => ({ ...s, clutch: Math.max(0, s.clutch - 8) }));
      } else if (!e.repeat) {
        if (mode === 'manual') {
          if (/^[1-6]$/.test(k)) handleManualGearRef.current(Number(k) as ManualGear);
          else if (k === 'n') handleManualGearRef.current('N');
          else if (k === 'r') handleManualGearRef.current('R');
        } else {
          if (k === 'p') handleAutoGearRef.current('P');
          else if (k === 'r') handleAutoGearRef.current('R');
          else if (k === 'n') handleAutoGearRef.current('N');
          else if (k === 'd') handleAutoGearRef.current('D');
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'b') setSim((s) => ({ ...s, brake: false }));
      if (k === ' ') setSim((s) => ({ ...s, gas: false }));
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [mode, finished]);

  const pf = mode === 'manual' ? powerFactor(sim.clutch, sim.gear) : sim.autoGear === 'D' || sim.autoGear === 'R' ? 1 : 0;
  const powerPct = sim.engineOn ? Math.round(pf * 100) : 0;
  const powerState = powerPct === 0 ? tc.power.none : powerPct >= 85 ? tc.power.engaged : tc.power.slipping;
  const stepStrings = (tc.steps[mode] as Record<string, { title: string; hint: string }>)[step?.id ?? ''];
  const score = Math.max(0, 100 - mistakes * 10);

  return (
    <div className={cn('flex flex-col gap-4 rounded-2xl bg-white shadow-sm dark:bg-slate-900/50', shake && 'animate-[shake_0.4s_ease-in-out]')}>
      <style>{'@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}'}</style>

      {/* Header: mode toggle + step banner */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white">{tc.title}</h4>
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {(['manual', 'automatic'] as const).map((m) => (
              <button
                key={m}
                data-testid={`cockpit-mode-${m}`}
                onClick={() => resetSim(m)}
                className={cn(
                  'rounded-lg px-3 py-1 text-xs font-bold transition',
                  mode === m ? 'bg-blue-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {m === 'manual' ? tc.modeManual : tc.modeAutomatic}
              </button>
            ))}
          </div>
        </div>

        {!finished && stepStrings && (
          <div data-testid="cockpit-step" className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/20">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
              {tc.stepLabel} {stepIndex + 1}/{steps.length}
            </p>
            <p className="mt-0.5 font-bold text-slate-900 dark:text-white">{stepStrings.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{stepStrings.hint}</p>
          </div>
        )}

        {/* progress segments */}
        <div className="mt-3 flex gap-1.5">
          {steps.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i < stepIndex || finished ? 'bg-emerald-500' : i === stepIndex ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* feedback banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            data-testid="cockpit-message"
            className="mx-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* readout row */}
      <div className="mx-4 grid grid-cols-4 gap-2">
        {/* push-start button, like a real car */}
        <div className="flex items-center justify-center">
          <button
            data-testid="cockpit-engine"
            onClick={handleEngine}
            aria-pressed={sim.engineOn}
            className={cn(
              'relative h-16 w-16 rounded-full p-[3px] transition-all active:scale-95',
              'bg-[conic-gradient(from_210deg,#94a3b8,#334155,#64748b,#1e293b,#94a3b8)]',
              sim.engineOn
                ? 'shadow-[0_0_18px_rgba(45,212,191,0.55)]'
                : 'shadow-[0_4px_10px_rgba(0,0,0,0.35)]'
            )}
          >
            <span
              className={cn(
                'flex h-full w-full flex-col items-center justify-center rounded-full leading-none transition-colors',
                'bg-[radial-gradient(circle_at_35%_28%,#334155,#0f172a_60%,#020617)]',
                sim.engineOn ? 'ring-2 ring-inset ring-teal-400/70' : 'ring-1 ring-inset ring-slate-600/60'
              )}
            >
              <span className="text-[6px] font-bold tracking-[0.15em] text-slate-400">ENGINE</span>
              <span className={cn('my-0.5 text-[9px] font-black tracking-widest', sim.engineOn ? 'text-teal-300 [text-shadow:0_0_8px_rgba(45,212,191,0.8)]' : 'text-slate-200')}>
                START
              </span>
              <span className="text-[6px] font-bold tracking-[0.15em] text-slate-400">STOP</span>
            </span>
          </button>
        </div>
        {[
          { label: tc.readouts.speed, value: Math.round(sim.speed), testid: 'cockpit-speed' },
          { label: tc.readouts.rpm, value: sim.rpm, testid: 'cockpit-rpm' },
          { label: tc.readouts.gear, value: mode === 'manual' ? String(sim.gear) : sim.autoGear, testid: 'cockpit-gear-display' },
        ].map((r) => (
          <div
            key={r.label}
            className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"
          >
            <span
              data-testid={r.testid}
              className={cn(
                'text-lg font-black tabular-nums transition-colors',
                sim.engineOn ? 'text-blue-600 dark:text-cyan-300 dark:[text-shadow:0_0_10px_rgba(103,232,249,0.5)]' : 'text-slate-400 dark:text-slate-500'
              )}
            >
              {r.value}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{r.label}</span>
          </div>
        ))}
      </div>

      {/* power flow strip */}
      <div className="mx-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <span>{powerState}</span>
          <span data-testid="cockpit-power">{powerPct}% {tc.power.label}</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {[{ icon: Power, label: tc.power.engine }, { icon: Cog, label: tc.power.clutch }, { icon: Zap, label: tc.power.gearbox }].map((n, i) => (
            <div key={n.label} className="flex flex-1 items-center gap-1">
              <div className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
                sim.engineOn && (i === 0 || powerPct > 0)
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-500 shadow-[0_0_12px_rgba(34,211,238,0.45)] dark:text-cyan-300'
                  : 'border-slate-300 text-slate-400 dark:border-slate-600'
              )}>
                <n.icon className={cn('h-4 w-4', i === 0 && sim.engineOn && 'animate-pulse')} />
              </div>
              {i < 2 && (
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-950">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-200"
                    style={{ width: `${sim.engineOn ? (i === 0 ? 100 : powerPct) : 0}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* controls: clutch pedal (manual) + gear selector */}
      <div className="mx-4 grid grid-cols-[96px_1fr] gap-3">
        {mode === 'manual' ? (
          <div className="rounded-xl border border-cyan-500/25 bg-gradient-to-b from-slate-50 to-slate-100 p-2 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] dark:border-cyan-400/25 dark:from-slate-800 dark:to-slate-950">
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tc.controls.pedalTravel}</span>
              <span data-testid="cockpit-clutch-value" className="text-xs font-black tabular-nums text-cyan-600 dark:text-cyan-300">{sim.clutch}%</span>
            </div>
            <div
              ref={pedalRef}
              data-testid="cockpit-clutch"
              onPointerDown={onPedalPointerDown}
              onPointerMove={onPedalPointerMove}
              onPointerUp={onPedalPointerUp}
              className="relative mt-1 h-36 cursor-grab touch-none select-none"
            >
              {/* front-perspective pedal (reference style): pad depresses away as travel grows */}
              <svg viewBox="0 0 80 150" className="pointer-events-none absolute inset-y-0 left-0 h-full w-[70%]">
                <defs>
                  <linearGradient id="padFace" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#475569" />
                    <stop offset="0.35" stopColor="#1e293b" />
                    <stop offset="1" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="padTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#94a3b8" />
                    <stop offset="1" stopColor="#475569" />
                  </linearGradient>
                  <linearGradient id="stem" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#64748b" />
                    <stop offset="0.5" stopColor="#cbd5e1" />
                    <stop offset="1" stopColor="#334155" />
                  </linearGradient>
                </defs>
                {(() => {
                  const depth = sim.clutch * 0.32; // pad sinks up to ~32px
                  const shrink = 1 - sim.clutch * 0.0016; // and recedes slightly
                  const padY = 14 + depth;
                  return (
                    <g>
                      {/* stem from pad bottom to floor pivot */}
                      <rect x="36" y={padY + 58} width="8" height={Math.max(6, 134 - (padY + 58))} rx="3" fill="url(#stem)" />
                      <ellipse cx="40" cy="138" rx="14" ry="5" fill="#020617" opacity="0.6" />
                      <g transform={`translate(40 ${padY}) scale(${shrink}) translate(-40 ${-padY})`}>
                        {/* top face (depth cue) */}
                        <path d={`M18 ${padY} L62 ${padY} L58 ${padY + 8} L22 ${padY + 8} Z`} fill="url(#padTop)" />
                        {/* front face */}
                        <rect x="16" y={padY + 6} width="48" height="52" rx="8" fill="url(#padFace)" stroke="#0ea5e9" strokeWidth="1.5" />
                        {/* grip ribs */}
                        <line x1="24" y1={padY + 18} x2="56" y2={padY + 18} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                        <line x1="24" y1={padY + 48} x2="56" y2={padY + 48} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                        <text x="40" y={padY + 37} textAnchor="middle" fontSize="8" fontWeight="800" letterSpacing="1.5" fill="#e2e8f0">
                          {tc.controls.clutch.toUpperCase()}
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>
              {/* travel track with thumb (right side, like the reference) */}
              <div className="absolute right-2 top-1 bottom-1 w-1.5 rounded-full bg-slate-200 shadow-inner dark:bg-slate-950">
                <span className="absolute -top-0.5 -left-4 text-[7px] font-bold text-slate-400">0</span>
                <span className="absolute -bottom-0.5 -left-6 text-[7px] font-bold text-slate-400">100</span>
                <div
                  className="absolute inset-x-0 top-0 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 transition-[height] duration-75"
                  style={{ height: `${sim.clutch}%` }}
                />
                <div
                  className="absolute left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] ring-2 ring-white/80 transition-[top] duration-75 dark:ring-slate-900"
                  style={{ top: `calc(${sim.clutch}% - 7px)` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
            {AUTO_GEARS.map((g) => (
              <button
                key={g}
                data-testid={`cockpit-gear-${g}`}
                onClick={() => handleAutoGear(g)}
                className={cn(
                  'flex-1 rounded-lg text-sm font-black transition',
                  sim.autoGear === g ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                )}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {/* gear selector */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tc.controls.gearLabel}</span>
          {mode === 'manual' ? (
            <div className="relative mt-2 grid grid-cols-4 grid-rows-3 place-items-center gap-y-0 rounded-xl bg-slate-100 p-2 shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)] dark:bg-slate-950 dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
              {/* H-gate: horizontal middle slot + vertical slots per column */}
              <div className="pointer-events-none absolute inset-x-5 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-300 shadow-inner dark:bg-slate-800" />
              {[0, 1, 2, 3].map((col) => (
                <div
                  key={col}
                  className="pointer-events-none absolute inset-y-3 w-1.5 rounded-full bg-slate-300 shadow-inner dark:bg-slate-800"
                  style={{ left: `calc(${(col + 0.5) * 25}% - 3px)` }}
                />
              ))}
              {MANUAL_GEARS.map(({ gear, col, row }) => (
                <button
                  key={String(gear)}
                  data-testid={`cockpit-gear-${gear}`}
                  onClick={() => handleManualGear(gear)}
                  style={{ gridColumn: col + 1, gridRow: row + 1 }}
                  className={cn(
                    'z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-all',
                    sim.gear === gear
                      ? 'scale-110 bg-[radial-gradient(circle_at_35%_30%,#60a5fa,#2563eb_60%,#1e3a8a)] text-white shadow-[0_4px_10px_rgba(37,99,235,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                      : 'bg-[radial-gradient(circle_at_35%_30%,#f8fafc,#cbd5e1_70%,#94a3b8)] text-slate-600 shadow-[0_3px_6px_rgba(0,0,0,0.25)] dark:bg-[radial-gradient(circle_at_35%_30%,#64748b,#334155_65%,#0f172a)] dark:text-slate-200'
                  )}
                >
                  {gear}
                </button>
              ))}
              <button
                data-testid="cockpit-gear-N"
                onClick={() => handleManualGear('N')}
                style={{ gridColumn: 2, gridRow: 2 }}
                className={cn(
                  'z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-all',
                  sim.gear === 'N'
                    ? 'scale-110 bg-[radial-gradient(circle_at_35%_30%,#60a5fa,#2563eb_60%,#1e3a8a)] text-white shadow-[0_4px_10px_rgba(37,99,235,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)]'
                    : 'bg-[radial-gradient(circle_at_35%_30%,#f8fafc,#cbd5e1_70%,#94a3b8)] text-blue-600 shadow-[0_3px_6px_rgba(0,0,0,0.25)] dark:bg-[radial-gradient(circle_at_35%_30%,#64748b,#334155_65%,#0f172a)] dark:text-cyan-300'
                )}
              >
                N
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {tc.steps.automatic[step?.id as keyof typeof tc.steps.automatic]?.hint ?? ''}
            </p>
          )}
        </div>
      </div>

      {/* brake / gas — toggle pedals (latched visual state) */}
      <div className="mx-4 mb-1 grid grid-cols-2 gap-3">
        <button
          data-testid="cockpit-brake"
          onClick={() => togglePedal('brake')}
          aria-pressed={sim.brake}
          className={cn(
            'select-none rounded-xl border py-4 text-sm font-black uppercase tracking-widest transition-all',
            sim.brake
              ? 'translate-y-0.5 border-red-400 bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]'
              : 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-200 text-slate-500 shadow-[0_3px_0_rgba(100,116,139,0.35)] dark:border-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300 dark:shadow-[0_3px_0_rgba(0,0,0,0.5)]'
          )}
        >
          {tc.controls.brake}
        </button>
        <button
          data-testid="cockpit-gas"
          onClick={() => togglePedal('gas')}
          aria-pressed={sim.gas}
          className={cn(
            'select-none rounded-xl border py-4 text-sm font-black uppercase tracking-widest transition-all',
            sim.gas
              ? 'translate-y-0.5 border-emerald-400 bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]'
              : 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-200 text-slate-500 shadow-[0_3px_0_rgba(100,116,139,0.35)] dark:border-slate-600 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300 dark:shadow-[0_3px_0_rgba(0,0,0,0.5)]'
          )}
        >
          {tc.controls.gas}
        </button>
      </div>

      {/* keyboard hint (desktop only) */}
      <p className="mx-4 mb-3 hidden text-center text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 sm:block">
        {mode === 'manual' ? tc.keysHintManual : tc.keysHintAutomatic}
      </p>

      {/* completion */}
      {finished && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 pt-0">
          <div className="mb-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{tc.completed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tc.mistakesLabel}: {mistakes} · {tc.scoreLabel}: {score}%
              </p>
            </div>
            <button
              onClick={() => resetSim(mode)}
              className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {tc.restartStep}
            </button>
          </div>
          <button
            data-testid="cockpit-continue"
            onClick={onComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            <Check className="h-5 w-5" />
            {tc.finish}
          </button>
        </motion.div>
      )}
    </div>
  );
}

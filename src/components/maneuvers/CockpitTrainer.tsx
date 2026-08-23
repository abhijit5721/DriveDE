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
import { Check, Power, AlertTriangle, Cog, Zap, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { engineSound, haptic } from '../../utils/cockpitFeedback';
import { CockpitWindshield } from './SimulatorComponents';
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
  distance: 0,
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

/** slot position (%) inside the gate box; N sits on the middle rail */
const GATE_POS: Record<string, { x: number; y: number }> = {
  1: { x: 12.5, y: 18 },
  2: { x: 12.5, y: 82 },
  3: { x: 37.5, y: 18 },
  4: { x: 37.5, y: 82 },
  5: { x: 62.5, y: 18 },
  6: { x: 62.5, y: 82 },
  R: { x: 87.5, y: 18 },
  N: { x: 37.5, y: 50 },
};

/** real H-shifter path: vertical to the middle rail, across, then into the slot */
function gatePath(from: ManualGear, to: ManualGear): Array<{ x: number; y: number }> {
  const a = GATE_POS[String(from)];
  const b = GATE_POS[String(to)];
  const path: Array<{ x: number; y: number }> = [];
  if (a.y !== 50) path.push({ x: a.x, y: 50 });
  if (a.x !== b.x) path.push({ x: b.x, y: 50 });
  if (b.y !== 50) path.push({ x: b.x, y: b.y });
  return path.length ? path : [b];
}

const AUTO_GEARS: AutoGear[] = ['P', 'R', 'N', 'D'];

/** Footwell-style 3D pedal (racing-game look): pad + stem that visibly
 *  depresses when pressed. Used for brake (wide pad) and accelerator (tall). */
function FootPedal({ id, label, pressed, accent, wide, onClick, testid }: {
  id: string;
  label: string;
  pressed: boolean;
  accent: 'red' | 'teal';
  wide?: boolean;
  onClick: () => void;
  testid: string;
}) {
  const depth = pressed ? 14 : 0;
  const glow = accent === 'red' ? 'rgba(248,113,113,0.55)' : 'rgba(45,212,191,0.55)';
  const stroke = accent === 'red' ? '#f87171' : '#2dd4bf';
  const padW = wide ? 56 : 38;
  const padH = wide ? 40 : 60;
  const padX = 40 - padW / 2;
  const padY = 16 + depth;
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        'flex flex-col items-center rounded-xl border p-2 transition-all',
        pressed
          ? 'border-transparent bg-slate-100 dark:bg-slate-950'
          : 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:to-slate-950'
      )}
      style={pressed ? { boxShadow: `inset 0 2px 10px rgba(0,0,0,0.35), 0 0 14px ${glow}` } : undefined}
    >
      <svg viewBox="0 0 80 120" className="h-24 w-16">
        <defs>
          <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#475569" />
            <stop offset="0.35" stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#94a3b8" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
          <linearGradient id={`${id}-stem`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#64748b" />
            <stop offset="0.5" stopColor="#cbd5e1" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
        </defs>
        {/* stem + floor shadow */}
        <rect x="36" y={padY + padH} width="8" height={Math.max(6, 106 - (padY + padH))} rx="3" fill={`url(#${id}-stem)`} />
        <ellipse cx="40" cy="112" rx={wide ? 20 : 14} ry="5" fill="#020617" opacity="0.55" />
        {/* pad with depth cue */}
        <g transform={`scale(${pressed ? 0.96 : 1})`} style={{ transformOrigin: '40px 60px', transition: 'transform 0.1s' }}>
          <path d={`M${padX + 3} ${padY} L${padX + padW - 3} ${padY} L${padX + padW - 6} ${padY + 7} L${padX + 6} ${padY + 7} Z`} fill={`url(#${id}-top)`} />
          <rect x={padX} y={padY + 5} width={padW} height={padH} rx="7" fill={`url(#${id}-face)`} stroke={pressed ? stroke : '#475569'} strokeWidth="1.5" />
          {[0.3, 0.55, 0.8].map((f) => (
            <line
              key={f}
              x1={padX + 7}
              y1={padY + 5 + padH * f}
              x2={padX + padW - 7}
              y2={padY + 5 + padH * f}
              stroke="#475569"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
      <span
        className={cn(
          'mt-1 text-[9px] font-black uppercase tracking-widest transition-colors',
          pressed ? (accent === 'red' ? 'text-red-500 dark:text-red-400' : 'text-teal-600 dark:text-teal-300') : 'text-slate-400'
        )}
      >
        {label}
      </span>
    </button>
  );
}

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
  const [soundOn, setSoundOn] = useState(true);
  const scoreSent = useRef(false);
  const pedalRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  // gear-knob animation: knob travels through the gate like a real shifter
  const [knobPos, setKnobPos] = useState(GATE_POS.N);
  const knobTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevGearRef = useRef<ManualGear>('N');

  useEffect(() => {
    if (mode !== 'manual') return;
    const from = prevGearRef.current;
    const to = sim.gear;
    if (from === to) return;
    prevGearRef.current = to;
    knobTimers.current.forEach(clearTimeout);
    knobTimers.current = [];
    const waypoints = gatePath(from, to);
    waypoints.forEach((p, i) => {
      knobTimers.current.push(setTimeout(() => setKnobPos(p), i * 110));
    });
  }, [sim.gear, mode]);

  useEffect(() => () => knobTimers.current.forEach(clearTimeout), []);

  // decode the engine samples while the user reads the first step, so the
  // very first ignition press plays the real recording
  useEffect(() => {
    engineSound.warmup();
  }, []);

  // sound follows engine state + RPM; engine stops on unmount
  useEffect(() => {
    engineSound.setMuted(!soundOn);
  }, [soundOn]);
  // edge-triggered engine sound: React may re-run state updaters, so side
  // effects live here, firing exactly once per actual state transition
  const prevEngineOn = useRef(false);
  useEffect(() => {
    if (sim.engineOn && !prevEngineOn.current) {
      engineSound.startEngine();
      haptic.start();
    } else if (!sim.engineOn && prevEngineOn.current) {
      engineSound.stopEngine();
    }
    prevEngineOn.current = sim.engineOn;
  }, [sim.engineOn]);
  useEffect(() => {
    if (sim.engineOn) engineSound.setRpm(sim.rpm);
  }, [sim.rpm, sim.engineOn]);
  useEffect(() => () => engineSound.stopEngine(true), []);

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
    setKnobPos(GATE_POS.N);
    prevGearRef.current = 'N';
  }, []);

  // ---- simulation tick ----
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => {
      setSim((s) => {
        if (!s.engineOn) {
          // engine off: coast down
          const speed = Math.round(Math.max(0, s.speed - (s.brake ? 4 : 0.5)) * 10) / 10;
          return { ...s, rpm: 0, speed, distance: s.distance + speed * 0.004 };
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

        const nextSpeed = Math.round(Math.max(0, speed) * 10) / 10;
        return { ...s, rpm: Math.round(rpm), speed: nextSpeed, distance: s.distance + nextSpeed * 0.004 };
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [mode, finished]);

  // ---- stall side effect (message + mistake), tracked via sim.stalled edge ----
  const prevStalled = useRef(false);
  useEffect(() => {
    if (sim.stalled && !prevStalled.current) {
      flash(tc.msgs.stall, true);
      engineSound.stall();
      haptic.stall();
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
        engineSound.grind();
        haptic.grind();
        return s;
      }
      setMessage(null);
      engineSound.click();
      haptic.tick();
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
      engineSound.click();
      haptic.tick();
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
    haptic.tick();
    setSim((s) => {
      const next = !s[key];
      // brake friction sound when braking from speed (games-style squeal)
      if (key === 'brake' && next && s.engineOn && s.speed > 15) {
        engineSound.brakeSqueal(s.speed);
      }
      return { ...s, [key]: next };
    });
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
        setSim((s) => {
          if (s.brake) return s;
          if (s.engineOn && s.speed > 15) engineSound.brakeSqueal(s.speed);
          return { ...s, brake: true };
        });
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
          <div className="flex items-center gap-2">
          <button
            data-testid="cockpit-sound"
            onClick={() => setSoundOn((v) => !v)}
            aria-pressed={soundOn}
            aria-label={language === 'de'
              ? (soundOn ? 'Ton an' : 'Ton aus')
              : (soundOn ? 'Sound on' : 'Sound off')}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-lg transition',
              soundOn ? 'bg-blue-600/10 text-blue-600 dark:text-cyan-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
            )}
          >
            {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
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
        </div>

        {!finished && stepStrings && (
          <div data-testid="cockpit-step" className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/20">
            <p className="text-xs font-semibold text-muted">
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

      {/* windshield: first-person road view driven by the sim (DRI-13) */}
      <div className="mx-4 h-28 overflow-hidden rounded-xl border border-slate-200 shadow-inner dark:border-slate-700">
        <CockpitWindshield distance={sim.distance} speed={sim.speed} engineOn={sim.engineOn} />
      </div>

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
            <div className="relative mt-2 h-32 rounded-xl bg-slate-100 shadow-[inset_0_2px_8px_rgba(0,0,0,0.08)] dark:bg-slate-950 dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
              {/* H-gate slots: middle rail + one vertical slot per column */}
              <div className="pointer-events-none absolute inset-x-[8%] top-1/2 h-2 -translate-y-1/2 rounded-full bg-slate-300 shadow-inner dark:bg-slate-800" />
              {[12.5, 37.5, 62.5, 87.5].map((x) => (
                <div
                  key={x}
                  className="pointer-events-none absolute inset-y-[14%] w-2 rounded-full bg-slate-300 shadow-inner dark:bg-slate-800"
                  style={{ left: `calc(${x}% - 4px)` }}
                />
              ))}
              {/* slot tap targets with position labels */}
              {[...MANUAL_GEARS, { gear: 'N' as ManualGear, col: 1, row: 1 }].map(({ gear }) => {
                const pos = GATE_POS[String(gear)];
                const isCurrent = sim.gear === gear;
                return (
                  <button
                    key={String(gear)}
                    data-testid={`cockpit-gear-${gear}`}
                    onClick={() => handleManualGear(gear)}
                    aria-label={`${tc.controls.gearLabel}: ${gear}`}
                    className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <span
                      className={cn(
                        'text-xs font-black transition-colors',
                        isCurrent ? 'text-transparent' : 'text-slate-400 dark:text-slate-500'
                      )}
                    >
                      {gear}
                    </span>
                  </button>
                );
              })}
              {/* THE shift knob: one physical knob travelling through the gate */}
              <div
                data-testid="cockpit-knob"
                className="pointer-events-none absolute z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_28%,#e2e8f0,#64748b_45%,#1e293b_80%,#0f172a)] text-xs font-black text-white shadow-[0_6px_14px_rgba(0,0,0,0.5),inset_0_2px_3px_rgba(255,255,255,0.5)] transition-[left,top] duration-100 ease-linear"
                style={{ left: `${knobPos.x}%`, top: `${knobPos.y}%` }}
              >
                <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">{String(sim.gear)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {tc.steps.automatic[step?.id as keyof typeof tc.steps.automatic]?.hint ?? ''}
            </p>
          )}
        </div>
      </div>

      {/* brake / gas — footwell 3D pedals, click-to-latch */}
      <div className="mx-4 mb-1 grid grid-cols-2 gap-3">
        <FootPedal
          id="brakePedal"
          testid="cockpit-brake"
          label={tc.controls.brake}
          pressed={sim.brake}
          accent="red"
          wide
          onClick={() => togglePedal('brake')}
        />
        <FootPedal
          id="gasPedal"
          testid="cockpit-gas"
          label={tc.controls.gas}
          pressed={sim.gas}
          accent="teal"
          onClick={() => togglePedal('gas')}
        />
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

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

  const holdProps = (key: 'brake' | 'gas') => ({
    onPointerDown: () => setSim((s) => ({ ...s, [key]: true })),
    onPointerUp: () => setSim((s) => ({ ...s, [key]: false })),
    onPointerLeave: () => setSim((s) => ({ ...s, [key]: false })),
  });

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
        <button
          data-testid="cockpit-engine"
          onClick={handleEngine}
          className={cn(
            'flex flex-col items-center justify-center rounded-xl border p-2 transition',
            sim.engineOn
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          )}
        >
          <Power className="h-5 w-5" />
          <span className="mt-1 text-[9px] font-bold uppercase tracking-wider">{tc.controls.engineBtn}</span>
        </button>
        {[
          { label: tc.readouts.speed, value: Math.round(sim.speed), testid: 'cockpit-speed' },
          { label: tc.readouts.rpm, value: sim.rpm, testid: 'cockpit-rpm' },
          { label: tc.readouts.gear, value: mode === 'manual' ? String(sim.gear) : sim.autoGear, testid: 'cockpit-gear-display' },
        ].map((r) => (
          <div key={r.label} className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
            <span data-testid={r.testid} className="text-lg font-black tabular-nums text-slate-900 dark:text-white">{r.value}</span>
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
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2',
                sim.engineOn && (i === 0 || powerPct > 0)
                  ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                  : 'border-slate-300 text-slate-400 dark:border-slate-600'
              )}>
                <n.icon className="h-4 w-4" />
              </div>
              {i < 2 && (
                <div className="relative h-1 flex-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
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
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{tc.controls.clutch}</span>
            <div
              ref={pedalRef}
              data-testid="cockpit-clutch"
              onPointerDown={onPedalPointerDown}
              onPointerMove={onPedalPointerMove}
              onPointerUp={onPedalPointerUp}
              className="relative mt-2 h-36 w-10 cursor-grab touch-none rounded-full bg-slate-200 dark:bg-slate-700"
            >
              <div
                className="absolute inset-x-0 bottom-0 rounded-full bg-blue-500/30 transition-[height] duration-75"
                style={{ height: `${sim.clutch}%` }}
              />
              <div
                className="absolute left-1/2 h-6 w-12 -translate-x-1/2 rounded-lg border-2 border-white bg-blue-600 shadow-md transition-[top] duration-75"
                style={{ top: `calc(${sim.clutch}% - 12px)` }}
              />
            </div>
            <span data-testid="cockpit-clutch-value" className="mt-2 text-xs font-black tabular-nums text-slate-900 dark:text-white">{sim.clutch}%</span>
            <span className="text-[9px] text-slate-400">{tc.controls.pedalTravel}</span>
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
            <div className="relative mt-2 grid grid-cols-4 grid-rows-3 place-items-center gap-y-0">
              {/* H-pattern rails */}
              <div className="pointer-events-none absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 bg-slate-300 dark:bg-slate-600" />
              {MANUAL_GEARS.map(({ gear, col, row }) => (
                <button
                  key={String(gear)}
                  data-testid={`cockpit-gear-${gear}`}
                  onClick={() => handleManualGear(gear)}
                  style={{ gridColumn: col + 1, gridRow: row + 1 }}
                  className={cn(
                    'z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition',
                    sim.gear === gear ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-white text-slate-500 shadow dark:bg-slate-700 dark:text-slate-300'
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
                  'z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition',
                  sim.gear === 'N' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-white text-blue-500 shadow dark:bg-slate-700'
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

      {/* brake / gas */}
      <div className="mx-4 mb-1 grid grid-cols-2 gap-3">
        <button
          data-testid="cockpit-brake"
          {...holdProps('brake')}
          className={cn(
            'select-none rounded-xl border py-4 text-sm font-black uppercase tracking-widest transition',
            sim.brake
              ? 'border-red-300 bg-red-100 text-red-700 dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-300'
              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          )}
        >
          {tc.controls.brake}
        </button>
        <button
          data-testid="cockpit-gas"
          {...holdProps('gas')}
          className={cn(
            'select-none rounded-xl border py-4 text-sm font-black uppercase tracking-widest transition',
            sim.gas
              ? 'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300'
              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
          )}
        >
          {tc.controls.gas}
        </button>
      </div>

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

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PreDriveCheckTrainer (DRI-12): the cockpit half of the Abfahrtkontrolle.
 * Phase A "find the control": prompted taps on an SVG cockpit interior.
 * Phase B "warning lamp quiz": scored multiple choice on lamp meanings.
 * Strings live under maneuvers.interactive.preDrive (keys are the data model).
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { haptic } from '../../utils/cockpitFeedback';

interface Props {
  onComplete: () => void;
  onScore?: (pct: number) => void;
  language: 'de' | 'en';
}

const CONTROL_ORDER = ['indicatorStalk', 'wiperStalk', 'lightSwitch', 'fogRear', 'hazard', 'horn', 'defrostRear', 'handbrake'] as const;
const LAMP_ORDER = ['oil', 'battery', 'coolant', 'brake', 'abs', 'airbag', 'engine', 'fogRearLamp'] as const;

/** small warning-lamp glyphs, iconic rather than photoreal */
function LampGlyph({ id, className }: { id: string; className?: string }) {
  const common = { fill: 'none', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const color = ['oil', 'battery', 'coolant', 'brake', 'airbag'].includes(id) ? '#ef4444' : '#f59e0b';
  return (
    <svg viewBox="0 0 48 48" className={className} stroke={color}>
      {id === 'oil' && (
        <g {...common}>
          <path d="M10 28 h18 l6 -8 M14 28 v-6 h8" />
          <path d="M8 34 c0 -3 3 -6 3 -6 s3 3 3 6 a3 3 0 0 1 -6 0Z" fill={color} />
          <path d="M12 28 a10 8 0 0 0 20 6" />
        </g>
      )}
      {id === 'battery' && (
        <g {...common}>
          <rect x="10" y="16" width="28" height="20" rx="2" />
          <path d="M16 12 v4 M32 12 v4 M16 26 h6 M29 26 h6 M32 23 v6" />
        </g>
      )}
      {id === 'coolant' && (
        <g {...common}>
          <path d="M24 10 v16 M24 26 a5 5 0 1 0 0.01 0" />
          <path d="M8 38 q4 -4 8 0 t8 0 t8 0 t8 0" />
        </g>
      )}
      {id === 'brake' && (
        <g {...common}>
          <circle cx="24" cy="24" r="12" />
          <path d="M8 14 a20 20 0 0 0 0 20 M40 14 a20 20 0 0 1 0 20" />
          <path d="M24 17 v9 M24 30 v1.5" strokeWidth="3" />
        </g>
      )}
      {id === 'abs' && (
        <g {...common}>
          <circle cx="24" cy="24" r="12" />
          <path d="M8 14 a20 20 0 0 0 0 20 M40 14 a20 20 0 0 1 0 20" />
          <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="800" fill={color} stroke="none">ABS</text>
        </g>
      )}
      {id === 'airbag' && (
        <g {...common}>
          <circle cx="30" cy="30" r="9" />
          <circle cx="16" cy="16" r="4" fill={color} stroke="none" />
          <path d="M16 22 v8 q0 4 4 4 h2" />
        </g>
      )}
      {id === 'engine' && (
        <g {...common}>
          <path d="M14 20 h6 v-4 h10 l4 4 h4 v12 h-4 l-4 4 H18 l-4 -4 h-4 v-8 h4Z" />
        </g>
      )}
      {id === 'fogRearLamp' && (
        <g {...common}>
          <path d="M16 14 a12 12 0 0 0 0 20" />
          <path d="M22 16 h14 M22 24 h14 M22 32 h14" strokeDasharray="3 3" />
        </g>
      )}
    </svg>
  );
}

/** clickable regions on the cockpit interior */
const CONTROL_POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  indicatorStalk: { x: 60, y: 108, w: 52, h: 18 },
  wiperStalk: { x: 208, y: 108, w: 52, h: 18 },
  lightSwitch: { x: 24, y: 156, w: 40, h: 40 },
  fogRear: { x: 30, y: 200, w: 28, h: 16 },
  hazard: { x: 300, y: 96, w: 36, h: 26 },
  horn: { x: 138, y: 128, w: 44, h: 30 },
  defrostRear: { x: 300, y: 132, w: 36, h: 26 },
  handbrake: { x: 322, y: 186, w: 56, h: 24 },
};

export default function PreDriveCheckTrainer({ onComplete, onScore, language }: Props) {
  const t = TRANSLATIONS[language];
  const tp = t.maneuvers.interactive.preDrive;

  const [phase, setPhase] = useState<'controls' | 'lamps' | 'done'>('controls');
  const [controlIdx, setControlIdx] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [lampIdx, setLampIdx] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreSent, setScoreSent] = useState(false);

  const target = CONTROL_ORDER[controlIdx];
  const lamp = LAMP_ORDER[lampIdx];

  // stable 3-option sets: correct meaning + the next two lamps' meanings
  const lampOptions = useMemo(() => {
    return LAMP_ORDER.map((l, i) => {
      const distractors = [LAMP_ORDER[(i + 3) % LAMP_ORDER.length], LAMP_ORDER[(i + 5) % LAMP_ORDER.length]];
      const opts = [l, ...distractors];
      // deterministic shuffle by index so the correct answer isn't always first
      return i % 3 === 0 ? opts : i % 3 === 1 ? [opts[1], opts[0], opts[2]] : [opts[2], opts[1], opts[0]];
    });
  }, []);

  const handleControlTap = (id: string) => {
    if (phase !== 'controls' || foundIds.includes(id)) return;
    if (id === target) {
      haptic.tick();
      const nextFound = [...foundIds, id];
      setFoundIds(nextFound);
      setWrongFlash(false);
      if (controlIdx + 1 >= CONTROL_ORDER.length) {
        setPhase('lamps');
      } else {
        setControlIdx(controlIdx + 1);
      }
    } else {
      haptic.grind();
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 900);
    }
  };

  const handleLampAnswer = (optionId: string) => {
    if (answered) return;
    setAnswered(optionId);
    if (optionId === lamp) {
      haptic.tick();
      setCorrectCount((c) => c + 1);
    } else {
      haptic.grind();
    }
  };

  const nextLamp = () => {
    setAnswered(null);
    if (lampIdx + 1 >= LAMP_ORDER.length) {
      const finalCorrect = correctCount;
      const pct = Math.round((finalCorrect / LAMP_ORDER.length) * 100);
      if (!scoreSent) {
        setScoreSent(true);
        onScore?.(pct);
      }
      setPhase('done');
    } else {
      setLampIdx(lampIdx + 1);
    }
  };

  const controlStrings = (tp.controls as Record<string, { name: string; desc: string }>);
  const lampStrings = (tp.lamps as Record<string, { name: string; meaning: string }>);
  const quizPct = Math.round((correctCount / LAMP_ORDER.length) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white shadow-sm dark:bg-slate-900/50">
      {/* header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white">{tp.title}</h4>
          <span data-testid="predrive-phase" className="text-xs font-bold text-blue-500">
            {phase === 'controls'
              ? `${tp.phaseControls} · ${foundIds.length}/${CONTROL_ORDER.length}`
              : phase === 'lamps'
                ? `${tp.phaseLamps} · ${Math.min(lampIdx + 1, LAMP_ORDER.length)}/${LAMP_ORDER.length}`
                : tp.completed}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{
              width: `${phase === 'controls' ? (foundIds.length / (CONTROL_ORDER.length + LAMP_ORDER.length)) * 100 : phase === 'lamps' ? ((CONTROL_ORDER.length + lampIdx) / (CONTROL_ORDER.length + LAMP_ORDER.length)) * 100 : 100}%`,
            }}
          />
        </div>
      </div>

      {phase === 'controls' && (
        <>
          {/* prompt */}
          <div
            data-testid="predrive-prompt"
            className={cn(
              'mx-4 rounded-xl border p-3 transition-colors',
              wrongFlash
                ? 'border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10'
                : 'border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/20'
            )}
          >
            {wrongFlash ? (
              <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {tp.wrongTap}
              </p>
            ) : (
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                <span className="mr-1 text-xs font-bold uppercase tracking-wider text-blue-500">{tp.promptLabel}</span>
                {controlStrings[target]?.name}
              </p>
            )}
          </div>

          {/* cockpit interior */}
          <div className="mx-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <svg viewBox="0 0 400 230" className="w-full bg-gradient-to-b from-slate-700 to-slate-900">
              {/* windshield sliver + dash top */}
              <rect x="0" y="0" width="400" height="34" fill="#38bdf8" opacity="0.25" />
              <path d="M0 34 L400 34 L400 74 Q200 96 0 74 Z" fill="#1e293b" />
              {/* instrument cluster */}
              <rect x="92" y="52" width="136" height="34" rx="10" fill="#0f172a" stroke="#334155" />
              <circle cx="118" cy="69" r="12" fill="#020617" stroke="#475569" />
              <circle cx="160" cy="69" r="12" fill="#020617" stroke="#475569" />
              <circle cx="202" cy="69" r="12" fill="#020617" stroke="#475569" />
              {/* steering column + wheel */}
              <rect x="120" y="86" width="80" height="80" rx="38" fill="none" stroke="#0f172a" strokeWidth="16" />
              <rect x="120" y="86" width="80" height="80" rx="38" fill="none" stroke="#334155" strokeWidth="12" />
              {/* stalks */}
              <g>
                <rect x={CONTROL_POS.indicatorStalk.x} y={CONTROL_POS.indicatorStalk.y} width={CONTROL_POS.indicatorStalk.w} height="10" rx="5" fill="#475569" />
                <circle cx={CONTROL_POS.indicatorStalk.x + 6} cy={CONTROL_POS.indicatorStalk.y + 5} r="7" fill="#334155" />
              </g>
              <g>
                <rect x={CONTROL_POS.wiperStalk.x} y={CONTROL_POS.wiperStalk.y} width={CONTROL_POS.wiperStalk.w} height="10" rx="5" fill="#475569" />
                <circle cx={CONTROL_POS.wiperStalk.x + CONTROL_POS.wiperStalk.w - 6} cy={CONTROL_POS.wiperStalk.y + 5} r="7" fill="#334155" />
              </g>
              {/* horn pad */}
              <ellipse cx="160" cy="143" rx="24" ry="16" fill="#1e293b" stroke="#475569" />
              <text x="160" y="147" textAnchor="middle" fontSize="9" fontWeight="700" fill="#94a3b8">PUSH</text>
              {/* light switch dial + fog button */}
              <circle cx="44" cy="176" r="20" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <rect x="41" y="160" width="6" height="14" rx="3" fill="#94a3b8" />
              <circle cx="44" cy="176" r="26" fill="none" stroke="#334155" strokeDasharray="3 5" />
              <rect x={CONTROL_POS.fogRear.x} y={CONTROL_POS.fogRear.y} width={CONTROL_POS.fogRear.w} height={CONTROL_POS.fogRear.h} rx="4" fill="#0f172a" stroke="#475569" />
              <text x={CONTROL_POS.fogRear.x + 14} y={CONTROL_POS.fogRear.y + 12} textAnchor="middle" fontSize="9" fill="#f59e0b">≡O</text>
              {/* centre console buttons */}
              <rect x="288" y="86" width="60" height="130" rx="10" fill="#111c2e" stroke="#334155" />
              <rect x={CONTROL_POS.hazard.x} y={CONTROL_POS.hazard.y} width={CONTROL_POS.hazard.w} height={CONTROL_POS.hazard.h} rx="5" fill="#1e293b" stroke="#ef4444" />
              <path d={`M${CONTROL_POS.hazard.x + 18} ${CONTROL_POS.hazard.y + 6} l8 14 h-16 Z`} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
              <rect x={CONTROL_POS.defrostRear.x} y={CONTROL_POS.defrostRear.y} width={CONTROL_POS.defrostRear.w} height={CONTROL_POS.defrostRear.h} rx="5" fill="#1e293b" stroke="#475569" />
              <text x={CONTROL_POS.defrostRear.x + 18} y={CONTROL_POS.defrostRear.y + 18} textAnchor="middle" fontSize="12" fill="#f59e0b">♨</text>
              {/* handbrake lever */}
              <rect x={CONTROL_POS.handbrake.x} y={CONTROL_POS.handbrake.y + 8} width={CONTROL_POS.handbrake.w} height="10" rx="5" fill="#334155" transform={`rotate(-12 ${CONTROL_POS.handbrake.x} ${CONTROL_POS.handbrake.y + 12})`} />
              <circle cx={CONTROL_POS.handbrake.x + 52} cy={CONTROL_POS.handbrake.y + 2} r="8" fill="#1e293b" stroke="#475569" />
              {/* invisible tap targets + found markers */}
              {CONTROL_ORDER.map((id) => {
                const p = CONTROL_POS[id];
                const isFound = foundIds.includes(id);
                return (
                  <g key={id} onClick={() => handleControlTap(id)} data-testid={`predrive-control-${id}`} style={{ cursor: 'pointer' }}>
                    <rect x={p.x - 6} y={p.y - 6} width={p.w + 12} height={p.h + 12} fill="transparent" />
                    {isFound && (
                      <g transform={`translate(${p.x + p.w / 2} ${p.y - 8})`}>
                        <circle r="8" fill="#10b981" />
                        <path d="M-3.5 0 l2.5 3 l5 -6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </>
      )}

      {phase === 'lamps' && (
        <div className="mx-4 mb-2">
          <div className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
            <LampGlyph id={lamp} className="h-16 w-16" />
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{tp.lampQuestion}</p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {lampOptions[lampIdx].map((optionId, i) => {
              const isCorrect = optionId === lamp;
              const isChosen = answered === optionId;
              return (
                <button
                  key={optionId}
                  data-testid={`predrive-option-${i}`}
                  onClick={() => handleLampAnswer(optionId)}
                  className={cn(
                    'rounded-xl border p-3 text-left text-xs font-medium transition',
                    answered
                      ? isCorrect
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : isChosen
                          ? 'border-red-400 bg-red-50 text-red-800 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-300'
                          : 'border-slate-200 text-slate-400 dark:border-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  )}
                >
                  {lampStrings[optionId]?.meaning}
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3">
                <p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {answered === lamp ? tp.correct : tp.wrong} <strong>{lampStrings[lamp]?.name}:</strong> {lampStrings[lamp]?.meaning}
                </p>
                <button
                  data-testid="predrive-next"
                  onClick={nextLamp}
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95"
                >
                  {tp.next}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 pt-0">
          <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="font-bold text-slate-900 dark:text-white">{tp.completed}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {tp.scoreLabel}: {quizPct}%
            </p>
          </div>
          <button
            data-testid="predrive-continue"
            onClick={onComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            <Check className="h-5 w-5" />
            {tp.finish}
          </button>
        </motion.div>
      )}
    </div>
  );
}

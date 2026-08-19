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
          <path d="M24 8 v14 M24 22 a4.5 4.5 0 1 0 0.01 0" />
          <path d="M10 34 q3.5 -3.5 7 0 t7 0 t7 0 t7 0" />
          <path d="M10 40 q3.5 -3.5 7 0 t7 0 t7 0 t7 0" />
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
          <path d="M16 12 a12 12 0 0 1 0 24" />
          <path d="M22 17 h16 M22 24 h16 M22 31 h16" />
          <path d="M31 12 q-3 4 0 8 t0 8 t0 8" />
        </g>
      )}
    </svg>
  );
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

/** analogue dial: 240° sweep from 150° (min) clockwise to 390° (max) */
function Gauge({ cx, cy, r, values, labelEvery, needleAt, redFrom, caption }: {
  cx: number; cy: number; r: number; values: number[]; labelEvery: number;
  needleAt: number; redFrom?: number; caption: string;
}) {
  const maxV = values[values.length - 1];
  const angle = (v: number) => 150 + (v / maxV) * 240;
  const needle = polar(cx, cy, r - 9, angle(needleAt));
  const red = redFrom !== undefined
    ? { a: polar(cx, cy, r - 4, angle(redFrom)), b: polar(cx, cy, r - 4, angle(maxV)) }
    : null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#pdDial)" stroke="#475569" strokeWidth="1.5" />
      {values.map((v, i) => {
        const outer = polar(cx, cy, r - 3, angle(v));
        const inner = polar(cx, cy, r - (i % labelEvery === 0 ? 8 : 6), angle(v));
        const tPos = polar(cx, cy, r - 13, angle(v));
        return (
          <g key={v}>
            <line x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#94a3b8" strokeWidth={i % labelEvery === 0 ? 1.6 : 0.8} />
            {i % labelEvery === 0 && (
              <text x={tPos.x} y={tPos.y + 1.8} textAnchor="middle" fontSize="5" fontWeight="700" fill="#cbd5e1">{v}</text>
            )}
          </g>
        );
      })}
      {red && (
        <path d={`M${red.a.x} ${red.a.y} A${r - 4} ${r - 4} 0 0 1 ${red.b.x} ${red.b.y}`} fill="none" stroke="#ef4444" strokeWidth="2.5" />
      )}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="3.5" fill="#334155" stroke="#64748b" strokeWidth="1" />
      <text x={cx} y={cy + r - 6} textAnchor="middle" fontSize="4.5" fill="#64748b">{caption}</text>
    </g>
  );
}

/** clickable regions on the cockpit interior (viewBox 400x300) */
const CONTROL_POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  indicatorStalk: { x: 52, y: 180, w: 46, h: 13 },
  wiperStalk: { x: 222, y: 180, w: 46, h: 13 },
  lightSwitch: { x: 16, y: 150, w: 42, h: 42 },
  fogRear: { x: 22, y: 202, w: 30, h: 18 },
  hazard: { x: 300, y: 142, w: 38, h: 28 },
  horn: { x: 128, y: 190, w: 64, h: 44 },
  defrostRear: { x: 344, y: 142, w: 38, h: 28 },
  handbrake: { x: 328, y: 252, w: 58, h: 28 },
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

          {/* cockpit interior: LHD driver's view */}
          <div className="mx-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <svg viewBox="0 0 400 300" className="w-full">
              <defs>
                <linearGradient id="pdSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7dd3fc" />
                  <stop offset="1" stopColor="#e0f2fe" />
                </linearGradient>
                <linearGradient id="pdDash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#334155" />
                  <stop offset="0.25" stopColor="#1e293b" />
                  <stop offset="1" stopColor="#0b1220" />
                </linearGradient>
                <radialGradient id="pdDial">
                  <stop offset="0.6" stopColor="#0b1220" />
                  <stop offset="1" stopColor="#1e293b" />
                </radialGradient>
                <linearGradient id="pdRim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#475569" />
                  <stop offset="1" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* windshield: sky, fields, road ahead */}
              <rect width="400" height="58" fill="url(#pdSky)" />
              <rect y="38" width="400" height="20" fill="#86efac" opacity="0.55" />
              <path d="M172 58 L196 38 L206 38 L248 58 Z" fill="#94a3b8" />
              <path d="M200.5 41 l1 4 M204 48 l1.5 6" stroke="#f8fafc" strokeWidth="1.5" />
              {/* A-pillars + rear-view mirror */}
              <path d="M0 0 L30 0 L6 58 L0 58 Z" fill="#0f172a" />
              <path d="M400 0 L370 0 L394 58 L400 58 Z" fill="#0f172a" />
              <rect x="178" y="3" width="44" height="13" rx="4" fill="#0f172a" stroke="#334155" />
              <rect x="181" y="6" width="38" height="7" rx="2" fill="#38bdf8" opacity="0.5" />

              {/* dashboard body + defroster vents */}
              <path d="M0 58 Q200 86 400 58 L400 300 L0 300 Z" fill="url(#pdDash)" />
              {[70, 250].map((vx) => (
                <g key={vx} fill="#0b1220" opacity="0.8">
                  {[0, 1, 2, 3].map((i) => (
                    <rect key={i} x={vx + i * 18} y={67 + i * 0.6} width="12" height="4" rx="2" />
                  ))}
                </g>
              ))}

              {/* instrument binnacle: tacho, LCD, speedo, warning-lamp strip */}
              <path d="M68 96 Q160 62 252 96 L252 152 Q160 172 68 152 Z" fill="#0b1220" stroke="#334155" strokeWidth="1.5" />
              <Gauge cx={113} cy={120} r={28} values={[0, 1, 2, 3, 4, 5, 6, 7, 8]} labelEvery={2} needleAt={0.9} redFrom={6.5} caption="x1000/min" />
              <Gauge cx={207} cy={120} r={28} values={[0, 30, 60, 90, 120, 150, 180, 210, 240]} labelEvery={2} needleAt={0} caption="km/h" />
              {(['#ef4444', '#ef4444', '#f59e0b', '#f59e0b', '#10b981'] as const).map((c, i) => (
                <circle key={i} cx={148 + i * 6} cy={96} r="2.2" fill={c} opacity="0.9" />
              ))}
              <rect x="146" y="102" width="28" height="28" rx="3" fill="#020617" stroke="#1e293b" />
              <text x="160" y="114" textAnchor="middle" fontSize="7" fontWeight="700" fill="#38bdf8">P</text>
              <text x="160" y="125" textAnchor="middle" fontSize="5" fill="#64748b">84210 km</text>

              {/* stalks (behind the wheel) */}
              <g>
                <rect x={CONTROL_POS.indicatorStalk.x} y={CONTROL_POS.indicatorStalk.y + 2} width={CONTROL_POS.indicatorStalk.w} height="9" rx="4.5" fill="#475569" />
                <rect x={CONTROL_POS.indicatorStalk.x} y={CONTROL_POS.indicatorStalk.y + 2} width="12" height="9" rx="4.5" fill="#334155" />
                <path d={`M${CONTROL_POS.indicatorStalk.x + 22} ${CONTROL_POS.indicatorStalk.y - 3} l-5 3 l5 3 Z`} fill="#4ade80" />
                <path d={`M${CONTROL_POS.indicatorStalk.x + 28} ${CONTROL_POS.indicatorStalk.y - 3} l5 3 l-5 3 Z`} fill="#4ade80" />
              </g>
              <g>
                <rect x={CONTROL_POS.wiperStalk.x} y={CONTROL_POS.wiperStalk.y + 2} width={CONTROL_POS.wiperStalk.w} height="9" rx="4.5" fill="#475569" />
                <rect x={CONTROL_POS.wiperStalk.x + CONTROL_POS.wiperStalk.w - 12} y={CONTROL_POS.wiperStalk.y + 2} width="12" height="9" rx="4.5" fill="#334155" />
                <path d={`M${CONTROL_POS.wiperStalk.x + 16} ${CONTROL_POS.wiperStalk.y - 1} a8 8 0 0 1 14 0`} fill="none" stroke="#94a3b8" strokeWidth="1.2" />
              </g>

              {/* steering wheel: flat-bottom rim, sculpted spokes with button
                  pods, squarish airbag pad with badge (modern Audi/BMW style) */}
              <g>
                {/* rim: 240° arc through the top + flat bottom chord */}
                <path d="M201.3 271 A72 72 0 1 0 118.7 271 Z" fill="none" stroke="#0b1220" strokeWidth="17" strokeLinejoin="round" />
                <path d="M201.3 271 A72 72 0 1 0 118.7 271 Z" fill="none" stroke="url(#pdRim)" strokeWidth="11" strokeLinejoin="round" />
                {/* stitching hint on the upper rim */}
                <path d="M104 178 A72 72 0 0 1 216 178" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2 3" opacity="0.7" />
                {/* horizontal spokes, tapered toward the rim */}
                <path d="M92 206 L134 199 L134 227 L92 225 Z" fill="#1e293b" stroke="#0b1220" strokeWidth="1.5" />
                <path d="M228 206 L186 199 L186 227 L228 225 Z" fill="#1e293b" stroke="#0b1220" strokeWidth="1.5" />
                {/* bottom spoke into the flat section, with metallic trim */}
                <path d="M150 234 L170 234 L167 268 L153 268 Z" fill="#1e293b" stroke="#0b1220" strokeWidth="1.5" />
                <rect x="152" y="256" width="16" height="4" rx="2" fill="#64748b" />
                {/* multifunction button pods */}
                {[118, 176].map((px) => (
                  <g key={px}>
                    <rect x={px} y="197" width="26" height="32" rx="7" fill="#0b1220" stroke="#334155" strokeWidth="1" />
                    <circle cx={px + 13} cy={205} r="3" fill="#334155" />
                    <rect x={px + 7} y={211} width="12" height="4" rx="2" fill="#334155" />
                    <rect x={px + 7} y={218} width="12" height="4" rx="2" fill="#334155" />
                  </g>
                ))}
                {/* airbag pad (horn) with metallic badge */}
                <rect x="134" y="191" width="52" height="46" rx="15" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
                <path d="M140 196 q20 -6 40 0" fill="none" stroke="#475569" strokeWidth="1.2" opacity="0.8" />
                <circle cx="160" cy="212" r="9" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <text x="160" y="215.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#cbd5e1">D</text>
              </g>

              {/* light switch dial + rear fog button (left of column) */}
              <g>
                <circle cx="37" cy="170" r="19" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="37" cy="170" r="24" fill="none" stroke="#334155" strokeDasharray="2 4" />
                <rect x="34.5" y="154" width="5" height="12" rx="2.5" fill="#94a3b8" />
                <text x="16" y="152" fontSize="6" fontWeight="700" fill="#94a3b8">0</text>
                <path d="M52 146 a6 6 0 0 0 0 12" fill="none" stroke="#94a3b8" strokeWidth="1.3" />
                <path d="M54 148 h6 M54 152 h6 M54 156 h6" stroke="#94a3b8" strokeWidth="1.3" />
              </g>
              <g>
                <rect x={CONTROL_POS.fogRear.x} y={CONTROL_POS.fogRear.y} width={CONTROL_POS.fogRear.w} height={CONTROL_POS.fogRear.h} rx="4" fill="#0f172a" stroke="#475569" />
                <path d={`M${CONTROL_POS.fogRear.x + 9} ${CONTROL_POS.fogRear.y + 4} a7 7 0 0 0 0 11`} fill="none" stroke="#f59e0b" strokeWidth="1.4" />
                <path d={`M${CONTROL_POS.fogRear.x + 12} ${CONTROL_POS.fogRear.y + 6} h9 M${CONTROL_POS.fogRear.x + 12} ${CONTROL_POS.fogRear.y + 9} h9 M${CONTROL_POS.fogRear.x + 12} ${CONTROL_POS.fogRear.y + 12} h9`} stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="2 1.5" />
              </g>

              {/* centre console: vents, screen, buttons, climate, gear, handbrake */}
              <rect x="292" y="72" width="96" height="222" rx="12" fill="#0d1626" stroke="#334155" strokeWidth="1.5" />
              {[300, 346].map((vx) => (
                <g key={vx}>
                  <rect x={vx} y={80} width={34} height={13} rx={3} fill="#020617" stroke="#1e293b" />
                  <path d={`M${vx + 4} 86.5 h26`} stroke="#334155" strokeWidth="1.5" />
                </g>
              ))}
              <rect x="300" y="100" width="80" height="36" rx="4" fill="#020617" stroke="#1e293b" />
              <path d="M306 130 q16 -18 34 -10 t 36 -14" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <circle cx="354" cy="114" r="2.5" fill="#38bdf8" />
              <rect x={CONTROL_POS.hazard.x} y={CONTROL_POS.hazard.y} width={CONTROL_POS.hazard.w} height={CONTROL_POS.hazard.h} rx="5" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
              <path d={`M${CONTROL_POS.hazard.x + 19} ${CONTROL_POS.hazard.y + 6} l9 15 h-18 Z`} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinejoin="round" />
              <path d={`M${CONTROL_POS.hazard.x + 19} ${CONTROL_POS.hazard.y + 10} l5.5 9 h-11 Z`} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x={CONTROL_POS.defrostRear.x} y={CONTROL_POS.defrostRear.y} width={CONTROL_POS.defrostRear.w} height={CONTROL_POS.defrostRear.h} rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <rect x={CONTROL_POS.defrostRear.x + 8} y={CONTROL_POS.defrostRear.y + 8} width={22} height={13} rx="4" fill="none" stroke="#f59e0b" strokeWidth="1.3" />
              <path d={`M${CONTROL_POS.defrostRear.x + 13} ${CONTROL_POS.defrostRear.y + 18} q2 -3 0 -6 M${CONTROL_POS.defrostRear.x + 19} ${CONTROL_POS.defrostRear.y + 18} q2 -3 0 -6 M${CONTROL_POS.defrostRear.x + 25} ${CONTROL_POS.defrostRear.y + 18} q2 -3 0 -6`} fill="none" stroke="#f59e0b" strokeWidth="1.3" />
              {[318, 364].map((kx, i) => (
                <g key={kx}>
                  <circle cx={kx} cy={200} r="13" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                  <rect x={kx - 2} y={189} width="4" height="9" rx="2" fill="#94a3b8" />
                  {i === 0 && (
                    <>
                      <path d={`M${kx - 15} 208 a16 16 0 0 1 5 -11`} fill="none" stroke="#3b82f6" strokeWidth="2" />
                      <path d={`M${kx + 15} 208 a16 16 0 0 0 -5 -11`} fill="none" stroke="#ef4444" strokeWidth="2" />
                    </>
                  )}
                </g>
              ))}
              {/* gear lever + boot */}
              <path d="M302 274 l10 -14 h10 l10 14 Z" fill="#0b1220" stroke="#1e293b" />
              <rect x="315" y="242" width="4" height="20" fill="#334155" />
              <circle cx="317" cy="240" r="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              {/* handbrake lever */}
              <g transform="rotate(-12 336 272)">
                <rect x="336" y="266" width="48" height="9" rx="4.5" fill="#334155" />
                <rect x="336" y="266" width="18" height="9" rx="4.5" fill="#1e293b" />
                <circle cx="382" cy="270.5" r="4" fill="#94a3b8" />
              </g>
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

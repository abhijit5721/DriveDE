/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * TrainerLadder (DRI-52): three rungs above the public trainer. People finish
 * sequences they can see: 1 right before left (tick when done), 2 roundabout
 * (opens after rung 1), 3 parking (locked, "with a free account"). Tapping the
 * locked rung is the signup prompt's second entrance.
 */
import { Check, Lock } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translations';

export type Rung = 1 | 2 | 3;

interface TrainerLadderProps {
  language: 'de' | 'en';
  active: Rung;
  done: { 1: boolean; 2: boolean };
  onSelect: (rung: Rung) => void;
}

export function TrainerLadder({ language, active, done, onSelect }: TrainerLadderProps) {
  const t = TRANSLATIONS[language].common.publicTrainer.ladder;
  const rungs: Array<{ rung: Rung; label: string; state: 'done' | 'active' | 'open' | 'closed' | 'locked' }> = [
    { rung: 1, label: t.rung1, state: active === 1 ? 'active' : done[1] ? 'done' : 'open' },
    { rung: 2, label: t.rung2, state: active === 2 ? 'active' : done[2] ? 'done' : done[1] ? 'open' : 'closed' },
    { rung: 3, label: t.rung3, state: 'locked' },
  ];

  return (
    <ol className="mb-3 grid grid-cols-3 gap-2" data-testid="trainer-ladder" aria-label={t.title}>
      {rungs.map(({ rung, label, state }) => {
        const clickable = state === 'open' || state === 'done' || state === 'locked';
        const base = 'flex w-full flex-col items-start gap-1 rounded-xl border px-2.5 py-2 text-left transition';
        const look =
          state === 'active' ? 'border-blue-500 bg-blue-600/20 text-white'
          : state === 'done' ? 'border-emerald-600/60 bg-emerald-600/10 text-emerald-200 hover:bg-emerald-600/20'
          : state === 'open' ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700'
          : state === 'locked' ? 'border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
          : 'border-slate-800 bg-slate-900 text-slate-500';
        return (
          <li key={rung} className="min-w-0">
            <button
              type="button"
              onClick={() => clickable && onSelect(rung)}
              disabled={!clickable && state !== 'active'}
              aria-current={state === 'active' ? 'step' : undefined}
              data-testid={`ladder-rung-${rung}`}
              data-state={state}
              data-done={rung !== 3 && done[rung] ? 'true' : 'false'}
              className={`${base} ${look} ${state === 'active' ? 'cursor-default' : ''}`}
            >
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider sm:text-[11px]">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${state === 'done' ? 'bg-emerald-500 text-white' : state === 'active' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'}`}>
                  {/* a finished rung keeps its tick even while it is being replayed */}
                  {rung !== 3 && done[rung] ? <Check className="h-3 w-3 stroke-[3px]" /> : state === 'locked' ? <Lock className="h-3 w-3" /> : rung}
                </span>
                {t.step(rung)}
              </span>
              <span className="text-xs font-bold leading-tight sm:text-sm">{label}</span>
              <span className="text-[11px] leading-tight text-slate-400">
                {state === 'locked' ? t.locked : state === 'closed' ? t.opensAfter : state === 'done' ? t.done : state === 'active' ? t.now : t.open}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PublicTrainer (DRI-44, DRI-50): the right-before-left trainer, playable from
 * the landing page without an account. After a completed round the visitor is
 * asked one question, the date of their practical exam, which becomes a
 * countdown and a practice plan. Only then does the account prompt appear,
 * phrased as keeping that plan. Nothing is persisted while anonymous; the exam
 * date travels into the signup call so the dashboard can show it after login.
 */
import { useEffect, useState } from 'react';
import { X, ArrowRight, RotateCcw, CalendarDays } from 'lucide-react';
import InteractiveVorfahrt from '../maneuvers/InteractiveVorfahrt';
import { PUBLIC_TRAINER_SCENARIOS } from '../../data/publicTrainerScenarios';
import { TRANSLATIONS } from '../../data/translations';
import { trackFunnel } from '../../services/AnalyticsService';
import { buildExamPlan, todayISO } from '../../utils/examPlan';

interface PublicTrainerProps {
  language: 'de' | 'en';
  onClose: () => void;
  /** Called when the visitor chooses to keep their result; examDate is YYYY-MM-DD or null. */
  onSignup: (examDate: string | null) => void;
}

type Step = 'trainer' | 'exam' | 'keep';

export function PublicTrainer({ language, onClose, onSignup }: PublicTrainerProps) {
  const t = TRANSLATIONS[language].common.publicTrainer;
  const [round, setRound] = useState(1);
  const [step, setStep] = useState<Step>('trainer');
  const [examDate, setExamDate] = useState<string>('');
  const [chosenDate, setChosenDate] = useState<string | null>(null);

  // Escape closes, body scroll locks while open (same contract as the demo modal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const handleComplete = () => {
    trackFunnel('trainer_complete', { trainer: 'vorfahrt', round });
    // First round: ask for the exam date. Later rounds: straight to the keep prompt.
    setStep(chosenDate === null && round === 1 ? 'exam' : 'keep');
  };

  const answerExam = (date: string | null) => {
    setChosenDate(date);
    const plan = buildExamPlan(date, round);
    trackFunnel('exam_date_entered', { hasDate: !!date, pace: plan.pace, daysLeft: plan.daysLeft ?? -1 });
    trackFunnel('signup_prompt_shown', { round, hasDate: !!date });
    setStep('keep');
  };

  const handleOneMore = () => {
    setStep('trainer');
    setRound((r) => r + 1);
  };

  const handleKeep = () => {
    trackFunnel('signup_started', { from: 'trainer', round, hasDate: !!chosenDate });
    trackFunnel('result_saved', { round, hasDate: !!chosenDate });
    onSignup(chosenDate);
  };

  const plan = buildExamPlan(chosenDate, round);
  const planLine = chosenDate && plan.pace === 'past'
    ? t.examPast
    : chosenDate && plan.perWeek !== null
      ? t.planWithDate(plan.remaining, plan.perWeek)
      : t.planNoDate(plan.remaining);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={t.title} data-testid="public-trainer">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative flex w-full max-w-2xl max-h-[95vh] flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6">
          <div>
            <h2 className="text-lg font-black text-white sm:text-xl">{t.title}</h2>
            <p className="mt-1 text-sm text-slate-300">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.close}
            data-testid="public-trainer-close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative overflow-y-auto px-3 pb-4 sm:px-5">
          {/* key remounts the trainer for another round; the component keeps its own state otherwise */}
          <InteractiveVorfahrt
            key={round}
            language={language}
            scenarios={PUBLIC_TRAINER_SCENARIOS}
            onComplete={handleComplete}
          />

          {step === 'exam' && (
            <div
              className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-slate-950/90 p-6 text-center backdrop-blur-sm"
              data-testid="public-trainer-exam"
            >
              <CalendarDays className="h-9 w-9 text-blue-400" />
              <p className="max-w-md text-xl font-bold text-white sm:text-2xl">{t.examQuestion}</p>
              <p className="max-w-md text-sm text-slate-300">{t.examHint}</p>
              <input
                type="date"
                min={todayISO()}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                aria-label={t.examQuestion}
                data-testid="exam-date-input"
                className="w-full max-w-xs rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-base text-white outline-none focus:border-blue-500"
              />
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <button
                  onClick={() => answerExam(examDate || null)}
                  disabled={!examDate}
                  data-testid="exam-continue"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t.examContinue}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => answerExam(null)}
                  data-testid="exam-not-booked"
                  className="text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
                >
                  {t.examNotBooked}
                </button>
              </div>
            </div>
          )}

          {step === 'keep' && (
            <div
              className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-slate-950/90 p-6 text-center backdrop-blur-sm"
              data-testid="public-trainer-prompt"
            >
              {chosenDate && plan.daysLeft !== null && plan.pace !== 'past' && (
                <p className="text-3xl font-black text-blue-300 sm:text-4xl" data-testid="public-trainer-countdown">
                  {t.daysLeft(plan.daysLeft)}
                </p>
              )}
              <p className="max-w-md text-sm text-slate-200" data-testid="public-trainer-plan">{planLine}</p>
              <p className="max-w-md pt-2 text-xl font-bold text-white sm:text-2xl">{chosenDate ? t.keepPrompt : t.savePrompt}</p>
              <p className="max-w-md text-sm text-slate-300">{chosenDate ? t.keepHint : t.saveHint}</p>
              <button
                onClick={handleKeep}
                data-testid="public-trainer-signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-500 hover:scale-105 active:scale-95"
              >
                {chosenDate ? t.keepCta : t.saveCta}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleOneMore}
                data-testid="public-trainer-again"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                {t.oneMore}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

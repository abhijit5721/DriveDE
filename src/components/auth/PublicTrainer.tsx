/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PublicTrainer (DRI-44, DRI-50, DRI-51): the right-before-left trainer,
 * playable from the landing page without an account.
 *
 * Flow: round -> result card (score, time, comparison with other learners, the
 * mistake explained) -> one question, the practical exam date -> countdown and
 * practice plan -> account prompt phrased as keeping that plan. The exam
 * question and the prompt sit under the card, never over the simulator.
 * Nothing is persisted while anonymous except one anonymous result row; the
 * exam date travels into the signup call so the dashboard can show it.
 */
import { useEffect, useRef, useState } from 'react';
import { X, ArrowRight, RotateCcw, CalendarDays, Timer, Target, Info, Check } from 'lucide-react';
import InteractiveVorfahrt from '../maneuvers/InteractiveVorfahrt';
import { PUBLIC_TRAINER_SCENARIOS } from '../../data/publicTrainerScenarios';
import { TRANSLATIONS } from '../../data/translations';
import { trackFunnel } from '../../services/AnalyticsService';
import { submitTrainerResult, type TrainerComparison } from '../../services/TrainerResultService';
import { buildExamPlan, todayISO } from '../../utils/examPlan';
import { tapScore, formatSeconds } from '../../utils/trainerResult';
import type { TrainerRoundResult } from '../../types';

interface PublicTrainerProps {
  language: 'de' | 'en';
  onClose: () => void;
  /** Called when the visitor chooses to keep their result; examDate is YYYY-MM-DD or null. */
  onSignup: (examDate: string | null) => void;
}

type Step = 'trainer' | 'exam' | 'keep';

export function PublicTrainer({ language, onClose, onSignup }: PublicTrainerProps) {
  const t = TRANSLATIONS[language].common.publicTrainer;
  const facts = TRANSLATIONS[language].maneuvers.interactive.priority.facts as Record<string, string>;
  const [round, setRound] = useState(1);
  const [step, setStep] = useState<Step>('trainer');
  const [result, setResult] = useState<TrainerRoundResult | null>(null);
  const [comparison, setComparison] = useState<TrainerComparison | null>(null);
  const [examDate, setExamDate] = useState<string>('');
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const roundRef = useRef(round);
  roundRef.current = round;
  const scrollerRef = useRef<HTMLDivElement>(null);

  // A phone user has often scrolled inside the trainer to reach the cars; the
  // result card must start at the top, not wherever that scroll left off.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [step]);

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

  const handleRoundResult = (r: TrainerRoundResult) => {
    setResult(r);
    setComparison(null);
    trackFunnel('trainer_complete', { trainer: 'vorfahrt', round, scenarios: r.scenarios, wrongTaps: r.wrongTaps, durationMs: r.durationMs });
    // The visitor's own numbers render right away; the comparison line lands when the API answers.
    const thisRound = round;
    void submitTrainerResult(r).then((c) => {
      // Ignore a late answer if the visitor already started another round.
      if (c && c.percentile !== null && roundRef.current === thisRound) setComparison(c);
    });
    // First round: ask for the exam date. Later rounds: straight to the keep prompt.
    if (chosenDate === null && round === 1) {
      setStep('exam');
    } else {
      trackFunnel('signup_prompt_shown', { round, hasDate: !!chosenDate });
      setStep('keep');
    }
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
    setResult(null);
    setComparison(null);
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

  const score = result ? tapScore(result) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={t.title} data-testid="public-trainer">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative flex w-full max-w-2xl max-h-[95vh] flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className={`flex items-start justify-between gap-4 px-5 sm:px-6 ${step === 'trainer' ? 'pt-5 pb-3' : 'pt-4 pb-2'}`}>
          <div>
            <h2 className="text-lg font-black text-white sm:text-xl">{step === 'trainer' ? t.title : t.resultTitle}</h2>
            {step === 'trainer' && <p className="mt-1 text-sm text-slate-300">{t.subtitle}</p>}
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

        <div ref={scrollerRef} className="relative overflow-y-auto px-3 pb-3 sm:px-5 sm:pb-4">
          {step === 'trainer' ? (
            // key remounts the trainer for another round; the component keeps its own state otherwise
            <InteractiveVorfahrt
              key={round}
              language={language}
              scenarios={PUBLIC_TRAINER_SCENARIOS}
              onComplete={() => undefined}
              onRoundResult={handleRoundResult}
              hideSuccessOverlay
              autoAdvance
            />
          ) : (
            <div className="flex flex-col gap-3" data-testid="public-trainer-result">
              {/* Result card */}
              {result && score && (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3.5 text-left sm:p-4">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                    <p className="flex items-center gap-2 text-sm font-bold text-white sm:text-base" data-testid="public-trainer-score">
                      <Target className="h-5 w-5 text-blue-400" />
                      {t.resultScore(score.correct, score.total)}
                    </p>
                    <p className="flex items-center gap-2 text-sm font-bold text-white sm:text-base" data-testid="public-trainer-time">
                      <Timer className="h-5 w-5 text-blue-400" />
                      {t.resultTime(formatSeconds(result.durationMs, language))}
                    </p>
                  </div>
                  {comparison && comparison.percentile !== null && (
                    <p className="mt-2 text-sm font-semibold text-blue-300" data-testid="public-trainer-percentile">
                      {t.fasterThan(comparison.percentile)}
                    </p>
                  )}
                  <div className="mt-2.5 flex gap-3 rounded-xl bg-slate-900/70 p-2.5 sm:p-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                      {result.wrongTaps > 0 ? <Info className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </div>
                    <div className="space-y-1 text-sm leading-snug" data-testid="public-trainer-mistake">
                      <p className="font-bold text-white">{result.wrongTaps > 0 ? t.yourMistake : t.flawless}</p>
                      <p className="text-slate-300">{facts[result.factKey]}</p>
                      {result.wrongTaps > 0 && <p className="font-semibold text-amber-300">{t.examConsequence}</p>}
                      {result.mistakes.length > 1 && <p className="text-slate-400">{t.moreMistakes(result.mistakes.length - 1)}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 'exam' && (
                <div className="flex flex-col items-center gap-2.5 px-2 pb-1 text-center" data-testid="public-trainer-exam">
                  <CalendarDays className="h-6 w-6 text-blue-400" />
                  <p className="max-w-md text-lg font-bold text-white sm:text-xl">{t.examQuestion}</p>
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
                      className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3 text-base font-bold text-white shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
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
                <div className="flex flex-col items-center gap-2.5 px-2 pb-1 text-center" data-testid="public-trainer-prompt">
                  {chosenDate && plan.daysLeft !== null && plan.pace !== 'past' && (
                    <p className="text-2xl font-black text-blue-300 sm:text-3xl" data-testid="public-trainer-countdown">
                      {t.daysLeft(plan.daysLeft)}
                    </p>
                  )}
                  <p className="max-w-md text-sm text-slate-200" data-testid="public-trainer-plan">{planLine}</p>
                  <p className="max-w-md pt-1 text-lg font-bold text-white sm:text-xl">{chosenDate ? t.keepPrompt : t.savePrompt}</p>
                  <p className="max-w-md text-sm text-slate-300">{chosenDate ? t.keepHint : t.saveHint}</p>
                  <button
                    onClick={handleKeep}
                    data-testid="public-trainer-signup"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-blue-500 hover:scale-105 active:scale-95"
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
          )}
        </div>
      </div>
    </div>
  );
}

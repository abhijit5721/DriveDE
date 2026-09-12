/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PublicTrainer (DRI-44, DRI-50, DRI-51, DRI-52, DRI-54): trainers playable
 * from the landing page without an account.
 *
 * Ladder: 1 right before left (three intersections) -> result card (score,
 * time, comparison, mistake explained, share) -> one question, the practical
 * exam date -> countdown and plan -> account prompt phrased as keeping that
 * plan, with "next: roundabout" as the way on. 2 roundabout -> prompt again.
 * 3 parking is locked; tapping it opens the prompt naming what unlocks.
 * Ladder progress and the exam date live in sessionStorage so closing and
 * reopening the overlay within the visit keeps the ticks. One anonymous result
 * row per round is the only thing that leaves the browser.
 */
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { X, ArrowRight, RotateCcw, CalendarDays, Timer, Target, Info, Check, Share2, Lock } from 'lucide-react';
import InteractiveVorfahrt from '../maneuvers/InteractiveVorfahrt';
import { TrainerLadder, type Rung } from './TrainerLadder';
import { PUBLIC_TRAINER_SCENARIOS } from '../../data/publicTrainerScenarios';
import { TRANSLATIONS } from '../../data/translations';
import { trackFunnel } from '../../services/AnalyticsService';
import { submitTrainerResult, type TrainerComparison } from '../../services/TrainerResultService';
import { buildExamPlan, todayISO } from '../../utils/examPlan';
import { tapScore, formatSeconds } from '../../utils/trainerResult';
import { drawShareCard, shareResultCard } from '../../utils/shareCard';
import type { TrainerRoundResult } from '../../types';

const InteractiveRoundabout = lazy(() => import('../maneuvers/InteractiveRoundabout'));
const InteractiveParking = lazy(() => import('../maneuvers/InteractiveParking'));

interface PublicTrainerProps {
  language: 'de' | 'en';
  onClose: () => void;
  /** Called when the visitor chooses to keep their result; examDate is YYYY-MM-DD or null. */
  onSignup: (examDate: string | null) => void;
  /** DRI-45: which rung to open on (a landing tile chose it). 3 opens the locked prompt. */
  initialRung?: Rung;
}

type Step = 'trainer' | 'exam' | 'keep';
type PromptReason = 'result' | 'roundabout' | 'locked';

const SESSION_KEY = 'drivede.publicLadder.v1';
interface LadderSession { done1: boolean; done2: boolean; examDate: string | null; }

function readSession(): LadderSession {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return { done1: !!p.done1, done2: !!p.done2, examDate: typeof p.examDate === 'string' ? p.examDate : null };
    }
  } catch { /* private mode or no storage */ }
  return { done1: false, done2: false, examDate: null };
}

function writeSession(s: LadderSession) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function PublicTrainer({ language, onClose, onSignup, initialRung }: PublicTrainerProps) {
  const t = TRANSLATIONS[language].common.publicTrainer;
  const facts = TRANSLATIONS[language].maneuvers.interactive.priority.facts as Record<string, string>;
  const [session] = useState<LadderSession>(() => readSession());
  const [done1, setDone1] = useState(session.done1);
  const [done2, setDone2] = useState(session.done2);
  const [rung, setRung] = useState<Rung>(
    initialRung === 2 ? 2 : initialRung === 1 ? 1 : session.done1 && !session.done2 ? 2 : 1
  );
  const [round, setRound] = useState(1);
  const [step, setStep] = useState<Step>(initialRung === 3 ? 'keep' : 'trainer');
  const [reason, setReason] = useState<PromptReason>(initialRung === 3 ? 'locked' : 'result');
  const [result, setResult] = useState<TrainerRoundResult | null>(null);
  const [comparison, setComparison] = useState<TrainerComparison | null>(null);
  const [examDate, setExamDate] = useState<string>('');
  const [chosenDate, setChosenDate] = useState<string | null>(session.examDate);
  const [askedExam, setAskedExam] = useState(session.examDate !== null);
  const roundRef = useRef(round);
  roundRef.current = round;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const shareCanvasRef = useRef<HTMLCanvasElement>(null);
  const [shareState, setShareState] = useState<'idle' | 'busy' | 'done'>('idle');

  useEffect(() => { writeSession({ done1, done2, examDate: chosenDate }); }, [done1, done2, chosenDate]);

  // A phone user has often scrolled inside the trainer to reach the cars; the
  // result card must start at the top, not wherever that scroll left off.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
  }, [step, rung]);

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

  const openPrompt = (why: PromptReason) => {
    setReason(why);
    trackFunnel('signup_prompt_shown', { round, hasDate: !!chosenDate, reason: why, rung });
    setStep('keep');
  };

  const handleRoundResult = (r: TrainerRoundResult) => {
    setResult(r);
    setComparison(null);
    setDone1(true);
    trackFunnel('trainer_complete', { trainer: 'vorfahrt', round, scenarios: r.scenarios, wrongTaps: r.wrongTaps, durationMs: r.durationMs });
    // The visitor's own numbers render right away; the comparison line lands when the API answers.
    const thisRound = round;
    void submitTrainerResult(r).then((c) => {
      // Ignore a late answer if the visitor already started another round.
      if (c && c.percentile !== null && roundRef.current === thisRound) setComparison(c);
    });
    // First finished round: ask for the exam date. Afterwards straight to the prompt.
    if (!askedExam) {
      setStep('exam');
    } else {
      openPrompt('result');
    }
  };

  const handleRoundaboutComplete = () => {
    setDone2(true);
    setResult(null);
    trackFunnel('trainer_complete', { trainer: 'roundabout', round });
    if (!askedExam) {
      setStep('exam');
    } else {
      openPrompt('roundabout');
    }
  };

  const answerExam = (date: string | null) => {
    setChosenDate(date);
    setAskedExam(true);
    const plan = buildExamPlan(date, round);
    trackFunnel('exam_date_entered', { hasDate: !!date, pace: plan.pace, daysLeft: plan.daysLeft ?? -1 });
    openPrompt(rung === 2 ? 'roundabout' : 'result');
  };

  const startRung = (next: Rung) => {
    if (next === 3) {
      trackFunnel('ladder_locked_tap', { rung, hasDate: !!chosenDate });
      setResult(null);
      openPrompt('locked');
      return;
    }
    trackFunnel('ladder_rung_started', { rung: next, fromRung: rung });
    setRung(next);
    setStep('trainer');
    setResult(null);
    setComparison(null);
    setShareState('idle');
    setRound((r) => r + 1);
  };

  const handleOneMore = () => startRung(rung);

  // DRI-54: the result as an image for the driving-school group chat.
  const handleShare = async () => {
    if (!result || !shareCanvasRef.current || shareState === 'busy') return;
    setShareState('busy');
    const s = tapScore(result);
    const data = {
      language,
      correct: s.correct,
      total: s.total,
      seconds: formatSeconds(result.durationMs, language),
      comparison: comparison && comparison.percentile !== null ? t.fasterThan(comparison.percentile) : null,
    };
    drawShareCard(shareCanvasRef.current, data);
    const method = await shareResultCard(shareCanvasRef.current, data);
    trackFunnel('share_click', { method, round, hasDate: !!chosenDate });
    setShareState(method === 'webshare' || method === 'none' ? 'idle' : 'done');
  };

  const handleKeep = () => {
    trackFunnel('signup_started', { from: reason === 'locked' ? 'locked_rung' : 'trainer', round, hasDate: !!chosenDate, rung });
    trackFunnel('result_saved', { round, hasDate: !!chosenDate });
    onSignup(chosenDate);
  };

  // Trainers done so far count toward the plan (1 or 2 of the 11).
  const doneCount = (done1 ? 1 : 0) + (done2 ? 1 : 0);
  const plan = buildExamPlan(chosenDate, doneCount);
  const planLine = chosenDate && plan.pace === 'past'
    ? t.examPast
    : chosenDate && plan.perWeek !== null
      ? t.planWithDate(plan.remaining, plan.perWeek)
      : t.planNoDate(plan.remaining);

  const score = result ? tapScore(result) : null;
  const headerTitle = step === 'trainer' ? (rung === 2 ? t.ladder.rung2 : t.title) : t.resultTitle;

  // Prompt copy depends on why it opened
  const promptTitle = reason === 'locked' ? t.ladder.unlockPrompt : chosenDate ? t.keepPrompt : t.savePrompt;
  const promptHint = reason === 'locked' ? t.ladder.unlockHint : chosenDate ? t.keepHint : t.saveHint;
  const promptCta = reason === 'locked' ? t.ladder.unlockCta : chosenDate ? t.keepCta : t.saveCta;

  const fallback = <div className="h-64 animate-pulse rounded-2xl bg-slate-800/60" />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={t.title} data-testid="public-trainer">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative flex w-full max-w-2xl max-h-[95vh] flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className={`flex items-start justify-between gap-4 px-5 sm:px-6 ${step === 'trainer' ? 'pt-4 pb-2' : 'pt-4 pb-2'}`}>
          <div>
            <h2 className="text-lg font-black text-white sm:text-xl">{headerTitle}</h2>
            {step === 'trainer' && rung === 1 && <p className="mt-1 text-sm text-slate-300">{t.subtitle}</p>}
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
          {step === 'trainer' && (
            <TrainerLadder language={language} active={rung} done={{ 1: done1, 2: done2 }} onSelect={startRung} />
          )}

          {step === 'trainer' && rung === 1 && (
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
          )}

          {step === 'trainer' && rung === 2 && (
            <Suspense fallback={fallback}>
              <div data-testid="public-roundabout">
                <InteractiveRoundabout key={round} language={language} onComplete={handleRoundaboutComplete} />
              </div>
            </Suspense>
          )}

          {step !== 'trainer' && (
            <div className="flex flex-col gap-3" data-testid="public-trainer-result">
              {/* Result card (rung 1 only) */}
              {result && score && (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3.5 text-left sm:p-4">
                  <div className="flex items-start justify-between gap-3">
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
                    {/* DRI-54: the result as an image for the driving-school group chat */}
                    <button
                      onClick={handleShare}
                      disabled={shareState === 'busy'}
                      data-testid="public-trainer-share"
                      title={t.shareHint}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                    >
                      <Share2 className="h-4 w-4 text-blue-300" />
                      {t.share}
                    </button>
                  </div>
                  {shareState === 'done' && (
                    <p className="mt-1.5 text-xs text-emerald-300" data-testid="public-trainer-share-hint">{t.shareDone}</p>
                  )}
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
                  {/* Offscreen drawing surface for the share image */}
                  <canvas ref={shareCanvasRef} className="hidden" width={1080} height={1350} aria-hidden="true" />
                </div>
              )}

              {/* Roundabout done: a short line instead of a card */}
              {!result && reason === 'roundabout' && step === 'keep' && (
                <p className="flex items-center gap-2 rounded-2xl border border-emerald-700/60 bg-emerald-600/10 p-3 text-sm font-semibold text-emerald-200" data-testid="public-roundabout-done">
                  <Check className="h-4 w-4" />
                  {t.ladder.roundaboutDone}
                </p>
              )}

              {/* Locked rung: the parking trainer's first frame behind a lock */}
              {reason === 'locked' && step === 'keep' && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-700" data-testid="public-locked-preview">
                  <div className="pointer-events-none max-h-56 overflow-hidden opacity-60 grayscale" aria-hidden="true">
                    <Suspense fallback={fallback}>
                      <InteractiveParking language={language} onComplete={() => undefined} />
                    </Suspense>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                    <span className="flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-sm font-bold text-white">
                      <Lock className="h-4 w-4 text-blue-300" />
                      {t.ladder.rung3}: {t.ladder.locked}
                    </span>
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
                  {reason !== 'locked' && <p className="max-w-md text-sm text-slate-200" data-testid="public-trainer-plan">{planLine}</p>}
                  <p className="max-w-md pt-1 text-lg font-bold text-white sm:text-xl">{promptTitle}</p>
                  <p className="max-w-md text-sm text-slate-300">{promptHint}</p>
                  <button
                    onClick={handleKeep}
                    data-testid="public-trainer-signup"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-blue-500 hover:scale-105 active:scale-95"
                  >
                    {promptCta}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
                    {/* DRI-52: the way on is the next rung, not the account */}
                    {done1 && !done2 && (
                      <button
                        onClick={() => startRung(2)}
                        data-testid="public-trainer-next-rung"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 transition hover:text-white"
                      >
                        {t.ladder.nextRung}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}
                    {reason !== 'locked' && (
                      <button
                        onClick={handleOneMore}
                        data-testid="public-trainer-again"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition hover:text-white"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t.oneMore}
                      </button>
                    )}
                    {reason === 'locked' && (
                      <button
                        onClick={() => startRung(done1 && !done2 ? 2 : 1)}
                        data-testid="public-trainer-back"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition hover:text-white"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t.ladder.back}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

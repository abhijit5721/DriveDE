/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PublicTrainer (DRI-44): the right-before-left trainer, playable from the
 * landing page without an account. Nothing is persisted while anonymous; the
 * only account prompt appears after a completed round.
 */
import { useEffect, useState } from 'react';
import { X, ArrowRight, RotateCcw } from 'lucide-react';
import InteractiveVorfahrt from '../maneuvers/InteractiveVorfahrt';
import { PUBLIC_TRAINER_SCENARIOS } from '../../data/publicTrainerScenarios';
import { TRANSLATIONS } from '../../data/translations';
import { trackFunnel } from '../../services/AnalyticsService';

interface PublicTrainerProps {
  language: 'de' | 'en';
  onClose: () => void;
  onSignup: () => void;
}

export function PublicTrainer({ language, onClose, onSignup }: PublicTrainerProps) {
  const t = TRANSLATIONS[language].common.publicTrainer;
  const [round, setRound] = useState(1);
  const [done, setDone] = useState(false);

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
    trackFunnel('signup_prompt_shown', { round });
    setDone(true);
  };

  const handleOneMore = () => {
    setDone(false);
    setRound((r) => r + 1);
  };

  const handleSignup = () => {
    trackFunnel('signup_started', { from: 'trainer', round });
    onSignup();
  };

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

          {done && (
            <div
              className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-slate-950/85 p-6 text-center backdrop-blur-sm"
              data-testid="public-trainer-prompt"
            >
              <p className="max-w-md text-xl font-bold text-white sm:text-2xl">{t.savePrompt}</p>
              <p className="max-w-md text-sm text-slate-300">{t.saveHint}</p>
              <button
                onClick={handleSignup}
                data-testid="public-trainer-signup"
                className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-500 hover:scale-105 active:scale-95"
              >
                {t.saveCta}
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

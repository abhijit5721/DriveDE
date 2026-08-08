/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Clock, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

interface TrialEndedModalProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

/**
 * Shown exactly once, the first time the app opens after the 7-day trial
 * lapsed. Without it the trial just stops working silently and the user is
 * left wondering why features are locked.
 */
export function TrialEndedModal({ onUpgrade, onDismiss }: TrialEndedModalProps) {
  const { language, userProgress } = useAppStore();
  const isDe = language === 'de';

  const drives = userProgress.drivingSessions.length;
  const lessons = userProgress.completedLessons.length;
  const minutes = userProgress.totalDrivingMinutes || 0;
  const hours = Math.floor(minutes / 60);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" data-testid="trial-ended-modal">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onDismiss} />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl"
      >
        <button
          onClick={onDismiss}
          aria-label={isDe ? 'Schließen' : 'Close'}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
          <Clock className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold text-white">
          {isDe ? 'Deine Pro-Testphase ist beendet' : 'Your Pro trial has ended'}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {isDe
            ? 'Dein Fortschritt bleibt gespeichert — nur die Pro-Funktionen sind jetzt gesperrt.'
            : 'Your progress is safe — only the Pro features are locked now.'}
        </p>

        {(drives > 0 || lessons > 0) && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              {isDe ? 'In diesen 7 Tagen' : 'In those 7 days'}
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              {drives > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {isDe
                    ? `${drives} ${drives === 1 ? 'Fahrt' : 'Fahrten'} aufgezeichnet${hours > 0 ? ` (${hours}h)` : ''}`
                    : `${drives} ${drives === 1 ? 'drive' : 'drives'} tracked${hours > 0 ? ` (${hours}h)` : ''}`}
                </div>
              )}
              {lessons > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {isDe
                    ? `${lessons} ${lessons === 1 ? 'Lektion' : 'Lektionen'} abgeschlossen`
                    : `${lessons} ${lessons === 1 ? 'lesson' : 'lessons'} completed`}
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onUpgrade}
          data-testid="trial-ended-upgrade"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 active:scale-[0.98]"
        >
          {isDe ? 'Pro behalten' : 'Keep Pro'}
          <ArrowRight className="h-5 w-5" />
        </button>
        <button
          onClick={onDismiss}
          className="mt-3 w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-slate-300"
        >
          {isDe ? 'Kostenlos weitermachen' : 'Continue for free'}
        </button>
      </motion.div>
    </div>
  );
}

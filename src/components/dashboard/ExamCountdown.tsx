/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * ExamCountdown (DRI-50): days until the practical exam plus the practice pace
 * needed to finish the remaining trainers in time. Reads and writes the exam
 * date in the store; renders a one-line prompt to set it when there is none.
 */
import { CalendarDays } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { buildExamPlan, todayISO } from '../../utils/examPlan';

export function ExamCountdown() {
  const { examDate, setExamDate, language, userProgress } = useAppStore();
  const t = TRANSLATIONS[language].common.publicTrainer;
  const isDe = language === 'de';
  const plan = buildExamPlan(examDate, userProgress.completedLessons.length);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md" data-testid="exam-countdown">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 shrink-0 text-blue-100" />
          <div>
            {examDate && plan.daysLeft !== null && plan.pace !== 'past' ? (
              <p className="text-lg font-black leading-tight">{t.daysLeft(plan.daysLeft)}</p>
            ) : examDate && plan.pace === 'past' ? (
              <p className="text-sm font-semibold leading-tight text-blue-50">{t.examPast}</p>
            ) : (
              <p className="text-sm font-semibold leading-tight text-blue-50">{t.examQuestion}</p>
            )}
            {examDate && plan.perWeek !== null && (
              <p className="mt-0.5 text-xs text-blue-100/90">{t.planWithDate(plan.remaining, plan.perWeek)}</p>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-blue-100">
          <span className="sr-only">{t.examQuestion}</span>
          <input
            type="date"
            min={todayISO()}
            value={examDate ?? ''}
            onChange={(e) => setExamDate(e.target.value || null)}
            aria-label={isDe ? 'Prüfungsdatum' : 'Exam date'}
            data-testid="exam-countdown-input"
            className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs text-white outline-none focus:border-white/60"
          />
        </label>
      </div>
    </div>
  );
}

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Exam countdown and practice plan (DRI-50). Pure functions so the landing
 * page, the dashboard and the tests all compute the same numbers.
 */

/** Interactive trainers in the curriculum today (lessons with isInteractive: true). */
export const TOTAL_TRAINERS = 11;

/** Whole days from `now` to the exam date (YYYY-MM-DD), negative when it has passed. */
export function daysUntil(examDate: string, now: Date = new Date()): number {
  const [y, m, d] = examDate.split('-').map(Number);
  if (!y || !m || !d) return NaN;
  const exam = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam - today) / 86400000);
}

export interface ExamPlan {
  daysLeft: number | null;
  remaining: number;
  /** Trainers per week needed to finish before the exam; null without a date or when the exam has passed. */
  perWeek: number | null;
  /** 'urgent' under 14 days, 'soon' under 45, otherwise 'relaxed'; 'none' without a date, 'past' after the exam. */
  pace: 'none' | 'past' | 'urgent' | 'soon' | 'relaxed';
}

export function buildExamPlan(examDate: string | null, doneTrainers: number, now: Date = new Date(), total = TOTAL_TRAINERS): ExamPlan {
  const remaining = Math.max(0, total - Math.max(0, doneTrainers));
  if (!examDate) return { daysLeft: null, remaining, perWeek: null, pace: 'none' };
  const daysLeft = daysUntil(examDate, now);
  if (Number.isNaN(daysLeft)) return { daysLeft: null, remaining, perWeek: null, pace: 'none' };
  if (daysLeft < 0) return { daysLeft, remaining, perWeek: null, pace: 'past' };
  const weeks = Math.max(1, daysLeft / 7);
  const perWeek = remaining === 0 ? 0 : Math.max(1, Math.ceil(remaining / weeks));
  const pace = daysLeft < 14 ? 'urgent' : daysLeft < 45 ? 'soon' : 'relaxed';
  return { daysLeft, remaining, perWeek, pace };
}

/** Today as YYYY-MM-DD in local time, for the date input's minimum. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

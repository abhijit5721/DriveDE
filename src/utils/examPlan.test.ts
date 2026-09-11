import { describe, it, expect } from 'vitest';
import { daysUntil, buildExamPlan, todayISO, TOTAL_TRAINERS } from './examPlan';

const NOW = new Date(2026, 8, 11, 22, 30); // 11 Sep 2026, late evening local time

describe('examPlan', () => {
  it('counts whole days regardless of the time of day', () => {
    expect(daysUntil('2026-09-12', NOW)).toBe(1);
    expect(daysUntil('2026-09-11', NOW)).toBe(0);
    expect(daysUntil('2026-10-18', NOW)).toBe(37);
    expect(daysUntil('2026-09-01', NOW)).toBe(-10);
  });

  it('returns NaN for garbage dates instead of throwing', () => {
    expect(Number.isNaN(daysUntil('not-a-date', NOW))).toBe(true);
    expect(buildExamPlan('nope', 1, NOW).pace).toBe('none');
  });

  it('builds a plan with a date: remaining trainers spread over the weeks left', () => {
    const plan = buildExamPlan('2026-10-18', 1, NOW); // 37 days, 10 trainers left
    expect(plan.daysLeft).toBe(37);
    expect(plan.remaining).toBe(TOTAL_TRAINERS - 1);
    expect(plan.perWeek).toBe(2); // 10 / 5.29 weeks -> ceil 2
    expect(plan.pace).toBe('soon');
  });

  it('never suggests less than one per week and flags urgency under two weeks', () => {
    const plan = buildExamPlan('2026-09-20', 1, NOW); // 9 days
    expect(plan.pace).toBe('urgent');
    expect(plan.perWeek).toBe(8); // 10 trainers over 1.29 weeks -> ceil 8
    expect(buildExamPlan('2026-09-14', 1, NOW).perWeek).toBe(10); // 3 days counts as one full week
  });

  it('handles no date, a passed exam and everything already done', () => {
    expect(buildExamPlan(null, 3, NOW)).toEqual({ daysLeft: null, remaining: 8, perWeek: null, pace: 'none' });
    expect(buildExamPlan('2026-09-01', 1, NOW).pace).toBe('past');
    expect(buildExamPlan('2026-12-01', 11, NOW).perWeek).toBe(0);
  });

  it('formats today for the date input minimum', () => {
    expect(todayISO(NOW)).toBe('2026-09-11');
    expect(todayISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Result-card arithmetic for the public trainer (DRI-51). Pure, so the card
 * and its tests agree on every number.
 */
import type { TrainerRoundResult } from '../types';

/** Correct taps out of all taps: every car was tapped correctly once, plus the wrong taps. */
export function tapScore(result: Pick<TrainerRoundResult, 'cars' | 'wrongTaps'>): { correct: number; total: number } {
  const correct = Math.max(0, result.cars);
  return { correct, total: correct + Math.max(0, result.wrongTaps) };
}

/** Seconds with one decimal, locale-aware separator: "4,2" (de) or "4.2" (en). */
export function formatSeconds(durationMs: number, language: 'de' | 'en'): string {
  const seconds = Math.max(0, durationMs) / 1000;
  const fixed = seconds.toFixed(1);
  return language === 'de' ? fixed.replace('.', ',') : fixed;
}

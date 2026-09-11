/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * TrainerResultService (DRI-51): sends one anonymous round result to
 * /api/trainer-result and returns the visitor's percentile among everyone who
 * played the same scenario. Never throws and never blocks the UI: the caller
 * shows its own numbers immediately and adds the comparison line if and when
 * this resolves. Nothing identifying is sent.
 */
import type { TrainerRoundResult } from '../types';

export interface TrainerComparison {
  /** Share of other players who were slower, 0..100; null until the scenario has enough rows. */
  percentile: number | null;
  total: number;
}

const TIMEOUT_MS = 2500;

export async function submitTrainerResult(result: TrainerRoundResult): Promise<TrainerComparison | null> {
  if (typeof fetch !== 'function') return null;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;
  try {
    const res = await fetch('/api/trainer-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId: result.scenarioId,
        cars: result.cars,
        wrongTaps: result.wrongTaps,
        durationMs: result.durationMs,
      }),
      signal: controller?.signal,
      keepalive: true,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const percentile = typeof data?.percentile === 'number' ? Math.max(0, Math.min(100, Math.round(data.percentile))) : null;
    const total = typeof data?.total === 'number' ? data.total : 0;
    return { percentile, total };
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

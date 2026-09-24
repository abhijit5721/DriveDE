/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * securePrompt.ts
 *
 * When to ask an anonymous user (DRI-60) to add an email. Not on arrival, but at
 * the moments they have something to lose: the first logged drive, the first
 * finished lesson, and the last two days of the trial. Each moment is used once,
 * a dismissal buys three quiet days, and the ask appears at most three times in
 * total. The bookkeeping lives in localStorage because an anonymous account only
 * exists on this device anyway.
 */

export type SecureTrigger = 'first_drive' | 'first_lesson' | 'trial_ending';

export interface SecurePromptState {
  shown: SecureTrigger[];
  lastDismissedAt: string | null;
}

export interface SecurePromptInput {
  isAnonymous: boolean;
  lessons: number;
  drives: number;
  onTrial: boolean;
  trialDaysLeft: number;
}

export const SECURE_PROMPT_KEY = 'drivede_secure_prompt';
export const MAX_PROMPTS = 3;
export const QUIET_AFTER_DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

const EMPTY: SecurePromptState = { shown: [], lastDismissedAt: null };

export function readPromptState(): SecurePromptState {
  try {
    const raw = localStorage.getItem(SECURE_PROMPT_KEY);
    if (!raw) return { ...EMPTY };
    const v = JSON.parse(raw) as Partial<SecurePromptState>;
    return {
      shown: Array.isArray(v.shown) ? v.shown.filter((s): s is SecureTrigger => ['first_drive', 'first_lesson', 'trial_ending'].includes(s)) : [],
      lastDismissedAt: typeof v.lastDismissedAt === 'string' ? v.lastDismissedAt : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

function writePromptState(state: SecurePromptState): void {
  try { localStorage.setItem(SECURE_PROMPT_KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
}

/** The moment to ask now, or null. Order: a drive is worth the most, then a lesson, then the trial end. */
export function pickTrigger(input: SecurePromptInput, state: SecurePromptState, now: Date = new Date()): SecureTrigger | null {
  if (!input.isAnonymous) return null;
  if (state.shown.length >= MAX_PROMPTS) return null;
  if (state.lastDismissedAt) {
    const since = now.getTime() - new Date(state.lastDismissedAt).getTime();
    if (Number.isFinite(since) && since < QUIET_AFTER_DISMISS_MS) return null;
  }
  const due: SecureTrigger[] = [];
  if (input.drives >= 1) due.push('first_drive');
  if (input.lessons >= 1) due.push('first_lesson');
  if (input.onTrial && input.trialDaysLeft > 0 && input.trialDaysLeft <= 2) due.push('trial_ending');
  return due.find((t) => !state.shown.includes(t)) ?? null;
}

export function markPromptShown(trigger: SecureTrigger): void {
  const state = readPromptState();
  if (!state.shown.includes(trigger)) writePromptState({ ...state, shown: [...state.shown, trigger] });
}

export function markPromptDismissed(now: Date = new Date()): void {
  writePromptState({ ...readPromptState(), lastDismissedAt: now.toISOString() });
}

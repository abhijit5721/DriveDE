/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * securePrompt.ts
 *
 * When to ask an anonymous user (DRI-60) to add an email. Not on arrival, but at
 * the moments they have something to lose: the first logged drive, the first
 * finished lesson, the first answered exam situation (inline card), the last two
 * days of the trial and the first visit after it ended. Each moment is used once,
 * a dismissal buys three quiet days, and the ask appears at most four times in
 * total. 'checkout' is the user's own action (buying a pass) and skips the cap and
 * the quiet period. The bookkeeping lives in localStorage because an anonymous
 * account only exists on this device anyway. The trial itself is never touched here.
 */

export type SecureTrigger = 'first_drive' | 'first_lesson' | 'first_situation' | 'trial_ending' | 'trial_ended' | 'checkout';
/** Where the form was opened from; 'account' is the Konto page, which is not a prompt. */
export type SecureSource = SecureTrigger | 'account';

const TRIGGERS: SecureTrigger[] = ['first_drive', 'first_lesson', 'first_situation', 'trial_ending', 'trial_ended', 'checkout'];
const SOURCES: string[] = [...TRIGGERS, 'account'];

export interface SecurePromptState {
  shown: SecureTrigger[];
  lastDismissedAt: string | null;
  /** Email a code or link was sent to and not confirmed yet, so the form can show the code step again. */
  pendingEmail: string | null;
  /** Where the pending ask came from, read back for account_secured after a Google redirect or a link. */
  pendingTrigger: SecureSource | null;
}

export interface SecurePromptInput {
  isAnonymous: boolean;
  lessons: number;
  drives: number;
  onTrial: boolean;
  trialDaysLeft: number;
  /** The trial ran out (trial_ends_at in the past, no pass). */
  trialExpired?: boolean;
  /** Exam situations answered so far on this device. */
  situationsAnswered?: number;
}

export const SECURE_PROMPT_KEY = 'drivede_secure_prompt';
export const MAX_PROMPTS = 4;
export const QUIET_AFTER_DISMISS_MS = 3 * 24 * 60 * 60 * 1000;

const EMPTY: SecurePromptState = { shown: [], lastDismissedAt: null, pendingEmail: null, pendingTrigger: null };

export function readPromptState(): SecurePromptState {
  try {
    const raw = localStorage.getItem(SECURE_PROMPT_KEY);
    if (!raw) return { ...EMPTY };
    const v = JSON.parse(raw) as Partial<SecurePromptState>;
    return {
      shown: Array.isArray(v.shown) ? v.shown.filter((s): s is SecureTrigger => TRIGGERS.includes(s)) : [],
      lastDismissedAt: typeof v.lastDismissedAt === 'string' ? v.lastDismissedAt : null,
      pendingEmail: typeof v.pendingEmail === 'string' && v.pendingEmail ? v.pendingEmail : null,
      pendingTrigger: typeof v.pendingTrigger === 'string' && SOURCES.includes(v.pendingTrigger) ? v.pendingTrigger as SecureSource : null,
    };
  } catch {
    return { ...EMPTY };
  }
}

function writePromptState(state: SecurePromptState): void {
  try { localStorage.setItem(SECURE_PROMPT_KEY, JSON.stringify(state)); } catch { /* storage blocked */ }
}

/**
 * The moment to ask now, or null. Order: the trial that just ended, a drive (worth the
 * most), a lesson, a first situation, then the last trial days. 'checkout' is never
 * picked here: the paywall opens it itself.
 */
export function pickTrigger(input: SecurePromptInput, state: SecurePromptState, now: Date = new Date()): SecureTrigger | null {
  if (!input.isAnonymous) return null;
  if (state.shown.length >= MAX_PROMPTS) return null;
  if (state.lastDismissedAt) {
    const since = now.getTime() - new Date(state.lastDismissedAt).getTime();
    if (Number.isFinite(since) && since < QUIET_AFTER_DISMISS_MS) return null;
  }
  const due: SecureTrigger[] = [];
  if (input.trialExpired) due.push('trial_ended');
  if (input.drives >= 1) due.push('first_drive');
  if (input.lessons >= 1) due.push('first_lesson');
  if ((input.situationsAnswered ?? 0) >= 1) due.push('first_situation');
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

/** The email a code was sent to (cleared with null once confirmed or abandoned), and where the ask came from. */
export function setPendingSecure(email: string | null, trigger: SecureSource | null): void {
  const state = readPromptState();
  writePromptState({ ...state, pendingEmail: email, pendingTrigger: email ? trigger : state.pendingTrigger });
}

/** Remember the source of an ask that leaves the page (Google redirect). */
export function setPendingTrigger(trigger: SecureSource | null): void {
  writePromptState({ ...readPromptState(), pendingTrigger: trigger });
}

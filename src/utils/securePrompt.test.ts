import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MAX_PROMPTS, SECURE_PROMPT_KEY, markPromptDismissed, markPromptShown, pickTrigger, readPromptState } from './securePrompt';

// Node's experimental localStorage global shadows jsdom's here (no clear()), so use a plain map.
const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (k: string) => map.get(k) ?? null,
    key: (i: number) => [...map.keys()][i] ?? null,
    removeItem: (k: string) => { map.delete(k); },
    setItem: (k: string, v: string) => { map.set(k, String(v)); },
  } as Storage;
};

const base = { isAnonymous: true, lessons: 0, drives: 0, onTrial: true, trialDaysLeft: 6 };
const fresh = { shown: [], lastDismissedAt: null };

describe('pickTrigger', () => {
  it('never asks a user who already has an email', () => {
    expect(pickTrigger({ ...base, isAnonymous: false, lessons: 3, drives: 2 }, fresh)).toBeNull();
  });

  it('does not ask before there is anything to lose', () => {
    expect(pickTrigger(base, fresh)).toBeNull();
  });

  it('asks after the first lesson, and prefers the first drive when both exist', () => {
    expect(pickTrigger({ ...base, lessons: 1 }, fresh)).toBe('first_lesson');
    expect(pickTrigger({ ...base, lessons: 1, drives: 1 }, fresh)).toBe('first_drive');
  });

  it('asks in the last two trial days only', () => {
    expect(pickTrigger({ ...base, trialDaysLeft: 3 }, fresh)).toBeNull();
    expect(pickTrigger({ ...base, trialDaysLeft: 2 }, fresh)).toBe('trial_ending');
    expect(pickTrigger({ ...base, trialDaysLeft: 0, onTrial: false }, fresh)).toBeNull();
  });

  it('uses each moment once', () => {
    expect(pickTrigger({ ...base, lessons: 2 }, { shown: ['first_lesson'], lastDismissedAt: null })).toBeNull();
    expect(pickTrigger({ ...base, lessons: 2, drives: 1 }, { shown: ['first_lesson'], lastDismissedAt: null })).toBe('first_drive');
  });

  it('stays quiet for three days after a dismissal', () => {
    const now = new Date('2026-09-24T12:00:00Z');
    const oneDayAgo = new Date(now.getTime() - 86_400_000).toISOString();
    const fourDaysAgo = new Date(now.getTime() - 4 * 86_400_000).toISOString();
    expect(pickTrigger({ ...base, drives: 1 }, { shown: ['first_lesson'], lastDismissedAt: oneDayAgo }, now)).toBeNull();
    expect(pickTrigger({ ...base, drives: 1 }, { shown: ['first_lesson'], lastDismissedAt: fourDaysAgo }, now)).toBe('first_drive');
  });

  it(`asks at most ${MAX_PROMPTS} times`, () => {
    expect(pickTrigger({ ...base, lessons: 1, drives: 1, trialDaysLeft: 1 }, { shown: ['first_drive', 'first_lesson', 'trial_ending'], lastDismissedAt: null })).toBeNull();
  });
});

describe('prompt bookkeeping', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });

  it('remembers what was shown and when it was dismissed', () => {
    markPromptShown('first_lesson');
    markPromptShown('first_lesson');
    markPromptDismissed(new Date('2026-09-24T12:00:00Z'));
    expect(readPromptState()).toEqual({ shown: ['first_lesson'], lastDismissedAt: '2026-09-24T12:00:00.000Z' });
  });

  it('survives garbage in storage', () => {
    localStorage.setItem(SECURE_PROMPT_KEY, '{"shown":["nonsense",5],"lastDismissedAt":3}');
    expect(readPromptState()).toEqual({ shown: [], lastDismissedAt: null });
    localStorage.setItem(SECURE_PROMPT_KEY, 'not json');
    expect(readPromptState()).toEqual({ shown: [], lastDismissedAt: null });
  });
});

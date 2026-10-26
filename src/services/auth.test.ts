/**
 * DRI-60: the anonymous-session helpers.
 *
 * The Supabase client is mocked per case, so these tests cover the three ways
 * signInAnonymously can end: no client, the project refusing, and success.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { User } from '@supabase/supabase-js';

const mock = vi.hoisted(() => ({
  isSupabaseConfigured: true,
  signInAnonymously: vi.fn(),
  mayHaveSession: false,
  getSupabaseFail: false,
  loadedCbs: [] as Array<() => void>,
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
}));

vi.mock('../lib/supabase', () => ({
  get isSupabaseConfigured() { return mock.isSupabaseConfigured; },
  getSupabase: () => {
    if (mock.getSupabaseFail) return Promise.reject(new Error('chunk load failed'));
    return Promise.resolve(mock.isSupabaseConfigured ? { auth: { signInAnonymously: mock.signInAnonymously, onAuthStateChange: mock.onAuthStateChange } } : null);
  },
  onSupabaseLoaded: (cb: () => void) => {
    mock.loadedCbs.push(cb);
    return () => { mock.loadedCbs = mock.loadedCbs.filter((c) => c !== cb); };
  },
  mayHaveSupabaseSession: () => mock.mayHaveSession,
}));

import { isAnonymousUser, signInAnonymously, subscribeToAuthChanges } from './auth';

const user = (extra: Partial<User>): User => ({
  id: 'u1', aud: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-09-22T00:00:00Z', ...extra,
} as User);

describe('isAnonymousUser', () => {
  it('is true only for a user Supabase marks anonymous', () => {
    expect(isAnonymousUser(user({ is_anonymous: true }))).toBe(true);
    expect(isAnonymousUser(user({ is_anonymous: false, email: 'a@b.de' }))).toBe(false);
    expect(isAnonymousUser(user({ email: 'a@b.de' }))).toBe(false);
    expect(isAnonymousUser(null)).toBe(false);
    expect(isAnonymousUser(undefined)).toBe(false);
  });
});

describe('subscribeToAuthChanges', () => {
  beforeEach(() => {
    mock.isSupabaseConfigured = true;
    mock.mayHaveSession = true;
    mock.getSupabaseFail = false;
    mock.loadedCbs = [];
    mock.onAuthStateChange.mockClear();
  });

  it('retries attach when the client loads after a failed first attempt', async () => {
    mock.getSupabaseFail = true;
    const stop = subscribeToAuthChanges(() => undefined);
    await new Promise((r) => setTimeout(r, 0));
    expect(mock.onAuthStateChange).not.toHaveBeenCalled();
    expect(mock.loadedCbs).toHaveLength(1);

    mock.getSupabaseFail = false;
    mock.loadedCbs.forEach((cb) => cb());
    await new Promise((r) => setTimeout(r, 0));
    expect(mock.onAuthStateChange).toHaveBeenCalledTimes(1);

    stop();
    expect(mock.loadedCbs).toHaveLength(0);
  });
});

describe('signInAnonymously', () => {
  beforeEach(() => { mock.isSupabaseConfigured = true; mock.signInAnonymously.mockReset(); });

  it('reports an error instead of throwing when Supabase is not configured', async () => {
    mock.isSupabaseConfigured = false;
    const result = await signInAnonymously();
    expect(result.user).toBeUndefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(mock.signInAnonymously).not.toHaveBeenCalled();
  });

  it('reports the project error when anonymous sign-ins are disabled', async () => {
    mock.signInAnonymously.mockResolvedValue({ data: { user: null, session: null }, error: new Error('Anonymous sign-ins are disabled') });
    const result = await signInAnonymously();
    expect(result.user).toBeUndefined();
    expect(result.error?.message).toMatch(/disabled/);
  });

  it('returns the anonymous user on success', async () => {
    const anon = user({ is_anonymous: true });
    mock.signInAnonymously.mockResolvedValue({ data: { user: anon, session: {} }, error: null });
    const result = await signInAnonymously();
    expect(result.error).toBeUndefined();
    expect(result.user?.id).toBe('u1');
    expect(isAnonymousUser(result.user)).toBe(true);
  });
});

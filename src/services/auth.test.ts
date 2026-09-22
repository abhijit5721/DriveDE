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
}));

vi.mock('../lib/supabase', () => ({
  get isSupabaseConfigured() { return mock.isSupabaseConfigured; },
  get supabase() { return mock.isSupabaseConfigured ? { auth: { signInAnonymously: mock.signInAnonymously } } : null; },
}));

import { isAnonymousUser, signInAnonymously } from './auth';

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

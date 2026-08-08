import { describe, it, expect } from 'vitest';
import { deriveIsPremium, isSubscriptionActive } from './entitlement';

const NOW = new Date('2026-08-05T12:00:00Z');
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * 86400000).toISOString();

describe('isSubscriptionActive', () => {
  it('treats a null expiry as lifetime', () => {
    expect(isSubscriptionActive({ status: 'active', expires_at: null }, NOW)).toBe(true);
  });

  it('accepts an unexpired pass', () => {
    expect(isSubscriptionActive({ status: 'active', expires_at: daysFromNow(5) }, NOW)).toBe(true);
  });

  it('rejects a lapsed pass', () => {
    expect(isSubscriptionActive({ status: 'active', expires_at: daysFromNow(-1) }, NOW)).toBe(false);
  });

  it('rejects a non-active status even when unexpired', () => {
    expect(isSubscriptionActive({ status: 'cancelled', expires_at: daysFromNow(10) }, NOW)).toBe(false);
  });

  it('rejects a malformed expiry rather than granting access', () => {
    expect(isSubscriptionActive({ status: 'active', expires_at: 'not-a-date' }, NOW)).toBe(false);
  });
});

describe('deriveIsPremium', () => {
  it('THE REVENUE LEAK: an expired 30-day pass does NOT grant Pro even though is_premium is still true', () => {
    expect(deriveIsPremium(true, [{ status: 'active', expires_at: daysFromNow(-1) }], NOW)).toBe(false);
  });

  it('keeps Pro while a 90-day pass is still valid', () => {
    expect(deriveIsPremium(true, [{ status: 'active', expires_at: daysFromNow(45) }], NOW)).toBe(true);
  });

  it('keeps Pro forever for a lifetime purchase', () => {
    expect(deriveIsPremium(true, [{ status: 'active', expires_at: null }], NOW)).toBe(true);
  });

  it('honours a manual grant when the user never purchased anything', () => {
    expect(deriveIsPremium(true, [], NOW)).toBe(true);
    expect(deriveIsPremium(true, null, NOW)).toBe(true);
  });

  it('does not grant Pro to a free user with no purchases', () => {
    expect(deriveIsPremium(false, [], NOW)).toBe(false);
    expect(deriveIsPremium(null, undefined, NOW)).toBe(false);
  });

  it('repeat customer: one lapsed pass plus one active pass keeps Pro', () => {
    expect(deriveIsPremium(true, [
      { status: 'expired', expires_at: daysFromNow(-40) },
      { status: 'active', expires_at: daysFromNow(20) },
    ], NOW)).toBe(true);
  });

  it('repeat customer: all passes lapsed revokes Pro', () => {
    expect(deriveIsPremium(true, [
      { status: 'expired', expires_at: daysFromNow(-70) },
      { status: 'expired', expires_at: daysFromNow(-10) },
    ], NOW)).toBe(false);
  });

  it('a purchase record overrides a stale is_premium=false flag', () => {
    expect(deriveIsPremium(false, [{ status: 'active', expires_at: daysFromNow(10) }], NOW)).toBe(true);
  });
});

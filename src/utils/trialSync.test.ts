import { describe, it, expect } from 'vitest';
import { resolveTrial } from './trialSync';

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

describe('resolveTrial', () => {
  it('THE ABUSE CASE: a wiped device re-adopts the original expired trial instead of getting a new one', () => {
    const server = { trialStartedAt: iso(30), trialEndsAt: iso(23), intendedPlan: '90-days' };
    const { effective, needsPush } = resolveTrial(server, null);
    expect(effective.trialStartedAt).toBe(server.trialStartedAt);
    expect(new Date(effective.trialEndsAt!).getTime()).toBeLessThan(Date.now()); // still expired
    expect(needsPush).toBe(false);
  });

  it('a device that writes a fresh later trial cannot override the earlier server one', () => {
    const server = { trialStartedAt: iso(30), trialEndsAt: iso(23) };
    const local = { trialStartedAt: iso(1), trialEndsAt: iso(-6) }; // "new" trial started yesterday
    const { effective, needsPush } = resolveTrial(server, local);
    expect(effective.trialStartedAt).toBe(server.trialStartedAt);
    expect(needsPush).toBe(false);
  });

  it('pushes a locally started trial when the account has none yet', () => {
    const local = { trialStartedAt: iso(1), trialEndsAt: iso(-6), intendedPlan: '30-days' };
    const { effective, needsPush } = resolveTrial(null, local);
    expect(effective).toEqual(local);
    expect(needsPush).toBe(true);
  });

  it('pushes when the local trial is genuinely older than the server record', () => {
    const server = { trialStartedAt: iso(2), trialEndsAt: iso(-5) };
    const local = { trialStartedAt: iso(6), trialEndsAt: iso(-1) };
    const { effective, needsPush } = resolveTrial(server, local);
    expect(effective.trialStartedAt).toBe(local.trialStartedAt);
    expect(needsPush).toBe(true);
  });

  it('returns an empty trial when neither side has one', () => {
    const { effective, needsPush } = resolveTrial(null, { trialStartedAt: null, trialEndsAt: null });
    expect(effective.trialStartedAt).toBeNull();
    expect(needsPush).toBe(false);
  });

  it('keeps the local intended plan when the server has not recorded one', () => {
    const server = { trialStartedAt: iso(3), trialEndsAt: iso(-4), intendedPlan: null };
    const local = { trialStartedAt: iso(3), trialEndsAt: iso(-4), intendedPlan: 'lifetime' };
    expect(resolveTrial(server, local).effective.intendedPlan).toBe('lifetime');
  });

  it('ignores malformed timestamps rather than trusting them', () => {
    const server = { trialStartedAt: 'garbage', trialEndsAt: 'garbage' };
    const local = { trialStartedAt: iso(2), trialEndsAt: iso(-5) };
    const { effective, needsPush } = resolveTrial(server, local);
    expect(effective.trialStartedAt).toBe(local.trialStartedAt);
    expect(needsPush).toBe(true);
  });
});

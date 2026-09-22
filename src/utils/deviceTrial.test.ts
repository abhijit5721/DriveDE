import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DEVICE_TRIAL_KEY, isDeviceTrialExpired, readDeviceTrial, recordDeviceTrial } from './deviceTrial';

// Node's own experimental localStorage global shadows jsdom's here and has no clear(),
// so the tests run against a plain in-memory Storage.
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

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();
const clearCookie = () => { document.cookie = `${DEVICE_TRIAL_KEY}=; Max-Age=0; Path=/`; };

describe('deviceTrial', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); clearCookie(); });

  it('has nothing on a fresh device', () => {
    expect(readDeviceTrial()).toBeNull();
    expect(isDeviceTrialExpired(null)).toBe(false);
  });

  it('records the trial in localStorage and in a cookie', () => {
    const start = iso(1);
    recordDeviceTrial({ trialStartedAt: start, trialEndsAt: iso(-6) });
    expect(readDeviceTrial()?.startedAt).toBe(start);
    expect(document.cookie).toContain(DEVICE_TRIAL_KEY);
    localStorage.clear();
    expect(readDeviceTrial()).not.toBeNull(); // the cookie copy survives
    clearCookie();
    expect(readDeviceTrial()).toBeNull();
  });

  it('survives the store being wiped but not the cookie', () => {
    recordDeviceTrial({ trialStartedAt: iso(2), trialEndsAt: iso(-5) });
    localStorage.removeItem(DEVICE_TRIAL_KEY);
    expect(readDeviceTrial()).not.toBeNull();
  });

  it('never replaces an earlier start with a later one', () => {
    const first = iso(10);
    recordDeviceTrial({ trialStartedAt: first, trialEndsAt: iso(3) });
    recordDeviceTrial({ trialStartedAt: iso(1), trialEndsAt: iso(-6) });
    expect(readDeviceTrial()?.startedAt).toBe(first);
  });

  it('ignores incomplete or garbage values', () => {
    recordDeviceTrial({ trialStartedAt: null, trialEndsAt: null });
    expect(readDeviceTrial()).toBeNull();
    localStorage.setItem(DEVICE_TRIAL_KEY, '{"startedAt":"garbage","endsAt":"x"}');
    expect(readDeviceTrial()).toBeNull();
  });

  it('knows when the recorded trial is over', () => {
    expect(isDeviceTrialExpired({ startedAt: iso(10), endsAt: iso(3) })).toBe(true);
    expect(isDeviceTrialExpired({ startedAt: iso(1), endsAt: iso(-6) })).toBe(false);
  });
});

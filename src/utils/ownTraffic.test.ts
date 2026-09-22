import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OWN_TRAFFIC_KEY, applyOwnTrafficFlagFromUrl, isOwnTraffic } from './ownTraffic';

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

describe('ownTraffic', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); vi.spyOn(console, 'info').mockImplementation(() => {}); });

  it('counts a normal visitor', () => {
    expect(isOwnTraffic()).toBe(false);
    expect(applyOwnTrafficFlagFromUrl('?lang=de&utm_source=reddit')).toBe(false);
  });

  it('?noanalytics marks the device and the mark sticks across visits', () => {
    expect(applyOwnTrafficFlagFromUrl('?noanalytics')).toBe(true);
    expect(localStorage.getItem(OWN_TRAFFIC_KEY)).toBe('1');
    expect(applyOwnTrafficFlagFromUrl('?lang=de')).toBe(true);
  });

  it('?analytics=on removes the mark', () => {
    applyOwnTrafficFlagFromUrl('?noanalytics');
    expect(applyOwnTrafficFlagFromUrl('?analytics=on')).toBe(false);
    expect(isOwnTraffic()).toBe(false);
  });

  it('never throws when storage is blocked', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    expect(isOwnTraffic()).toBe(false);
    expect(applyOwnTrafficFlagFromUrl('?noanalytics')).toBe(false);
  });
});

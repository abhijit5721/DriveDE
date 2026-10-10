import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EXAM_SCENARIOS } from '../data/examScenarios';
import { PROTOCOL_KEY, areaRatings, bestRatios, loadProtocol, ratingFor, recordAttempt } from './examProtocol';

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
const zebra = EXAM_SCENARIOS.find((s) => s.id === 'zebrastreifen')!;
const rvl = EXAM_SCENARIOS.find((s) => s.id === 'rechts-vor-links')!;

describe('exam protocol', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });

  it('rating scale: our thresholds', () => {
    expect(ratingFor(1)).toBe('very-good');
    expect(ratingFor(0.9)).toBe('very-good');
    expect(ratingFor(0.8)).toBe('good');
    expect(ratingFor(0.5)).toBe('sufficient');
    expect(ratingFor(0.49)).toBe('insufficient');
  });

  it('records per-area tallies from a free answer and sums them across situations', () => {
    // zebra: everything except the two observation points "wait" and "recheck"
    recordAttempt(zebra, 4 / 6, (id) => !['wait', 'recheck'].includes(id));
    // right before left: everything
    recordAttempt(rvl, 1, () => true);
    const r = Object.fromEntries(areaRatings().map((a) => [a.area, a]));
    expect(r.observation.scenarios).toBe(2);
    expect(r.observation.got).toBe(1 + 4); // zebra 1 of 3, rvl 4 of 4
    expect(r.observation.total).toBe(3 + 4);
    expect(r.observation.rating).toBe('sufficient'); // 5/7 = 0.71
  });

  it('keeps the best attempt per situation and never downgrades', () => {
    recordAttempt(zebra, 1, () => true);
    recordAttempt(zebra, 0.5, (id) => id === 'speed');
    expect(bestRatios()[zebra.id]).toBe(1);
    expect(loadProtocol()[zebra.id].areas.speed).toEqual({ got: 2, total: 2 }); // the first, better attempt stays
  });

  it('step mode records the ratio without area data; a later free answer with the same ratio adds the areas', () => {
    recordAttempt(zebra, 0.8);
    expect(areaRatings().every((a) => a.rating === null)).toBe(true);
    recordAttempt(zebra, 0.8, () => true);
    expect(areaRatings().find((a) => a.area === 'speed')!.rating).toBe('very-good');
  });

  it('migrates the old best-ratio map', () => {
    localStorage.setItem('drivede-scenario-results', JSON.stringify({ zebrastreifen: 0.83 }));
    expect(bestRatios()[zebra.id]).toBe(0.83);
    expect(localStorage.getItem(PROTOCOL_KEY)).toBeNull(); // read-only migration until the next attempt
  });

  it('never throws when storage is blocked', () => {
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } });
    expect(() => recordAttempt(zebra, 1, () => true)).not.toThrow();
    expect(areaRatings().every((a) => a.rating === null)).toBe(true);
  });
});

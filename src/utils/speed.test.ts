import { describe, it, expect } from 'vitest';
import { initialSpeedState, nextSpeed, metresBetween, type SpeedFix } from './speed';

// Hamburg, moving roughly north: 0.00001° latitude is about 1.11 m
const base = { lat: 53.55, lng: 10.0 };
const fix = (i: number, over: Partial<SpeedFix> = {}): SpeedFix => ({ lat: base.lat, lng: base.lng, timestamp: 1_000_000 + i * 1000, speed: null, ...over });

function run(fixes: SpeedFix[]) {
  let s = initialSpeedState();
  const out: number[] = [];
  for (const f of fixes) { s = nextSpeed(s, f); out.push(s.kmh); }
  return out;
}

describe('live speed readout', () => {
  it('uses the phone\'s GPS speed and shows a move-off at once', () => {
    expect(run([fix(0, { speed: 0 }), fix(1, { speed: 8.33 })])).toEqual([0, 30]);
  });

  it('drops to 0 immediately when the car stops, instead of averaging down', () => {
    const out = run([fix(0, { speed: 13.9 }), fix(1, { speed: 13.9 }), fix(2, { speed: 5 }), fix(3, { speed: 0.4 }), fix(4, { speed: 0 })]);
    expect(out[1]).toBe(50);
    expect(out[3]).toBe(0); // 0.4 m/s is below walking pace
    expect(out[4]).toBe(0);
  });

  it('smooths lightly while moving but follows braking within a reading or two', () => {
    const out = run([fix(0, { speed: 13.9 }), fix(1, { speed: 13.9 }), fix(2, { speed: 8.3 }), fix(3, { speed: 8.3 })]);
    expect(out[1]).toBe(50);
    expect(out[2]).toBeLessThanOrEqual(38); // most of the way to 30 after one reading
    expect(out[3]).toBeLessThanOrEqual(33);
  });

  it('a GPS jump is not a speed', () => {
    const out = run([fix(0, { speed: 13.9 }), fix(1, { speed: 13.9 }), fix(2, { speed: 200 })]);
    expect(out[2]).toBe(50);
  });

  it('without a GPS speed it measures against the previous fix and ignores jitter when stopped', () => {
    // 14 m per second north = 50 km/h for three fixes, then a 2.5 m wobble at rest
    const north = (m: number) => base.lat + (m / 111_320);
    const out = run([
      fix(0), fix(1, { lat: north(14) }), fix(2, { lat: north(28) }), fix(3, { lat: north(42) }),
      fix(4, { lat: north(43.5), accuracy: 8 }), fix(5, { lat: north(42), accuracy: 8 }), fix(6, { lat: north(44), accuracy: 8 }),
    ]);
    expect(out[0]).toBe(0);
    expect(out[1]).toBeGreaterThanOrEqual(48); expect(out[1]).toBeLessThanOrEqual(52);
    expect(out[3]).toBeGreaterThanOrEqual(48); expect(out[3]).toBeLessThanOrEqual(52);
    expect(out.slice(4)).toEqual([0, 0, 0]);
  });

  it('the fallback uses the previous fix, not an older recorded point', () => {
    const north = (m: number) => base.lat + (m / 111_320);
    let s = initialSpeedState();
    s = nextSpeed(s, fix(0));
    s = nextSpeed(s, fix(1, { lat: north(14) }));
    // 2 m further after 1 s: inside the noise, so 0 (the old code measured 2 m against the last logged point forever)
    s = nextSpeed(s, fix(2, { lat: north(16) }));
    expect(s.kmh).toBe(0);
  });

  it('a negative or missing platform speed falls back without crashing', () => {
    expect(run([fix(0, { speed: -1 }), fix(1, { speed: undefined })])).toEqual([0, 0]);
  });

  it('metresBetween is about right', () => {
    expect(Math.round(metresBetween(base, { lat: base.lat + 0.001, lng: base.lng }))).toBe(111);
  });
});

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Speed shown on the live drive screen (8 Oct, founder report: the readout lagged the
 * car and still showed a speed after stopping).
 *
 * The phone's own GPS speed (Doppler based) is the best source; position deltas are
 * only the fallback. Three rules keep the readout honest:
 *   1. below walking pace the speed is 0 at once, never averaged down (car
 *      speedometers also sit on 0 below about 3 km/h);
 *   2. light smoothing only while moving, and never across a stop;
 *   3. the fallback measures against the previous GPS fix, not the last recorded route
 *      point, and treats movement inside the GPS noise as standing still.
 * Car speedometers read 2 to 5 km/h above the true speed by law; GPS shows the true
 * speed, so the screen labels it as GPS.
 */

export interface SpeedFix {
  lat: number;
  lng: number;
  /** ms since epoch; the fix's own timestamp when the platform gives one */
  timestamp: number;
  /** m/s from the platform, null/undefined/negative when unavailable */
  speed?: number | null;
  /** position accuracy in metres */
  accuracy?: number | null;
}

export interface SpeedState {
  lastFix: SpeedFix | null;
  /** last shown speed in km/h */
  kmh: number;
}

/** Below this the car is standing (1.0 m/s = 3.6 km/h). */
export const STANDSTILL_MS = 1.0;
/** Nothing on a road is faster; a jump above it is a GPS error. */
const MAX_PLAUSIBLE_KMH = 250;

export const initialSpeedState = (): SpeedState => ({ lastFix: null, kmh: 0 });

/** Distance in metres between two fixes (haversine). */
export function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Raw speed in m/s for this fix, or null when it cannot be known. */
function rawSpeedMs(state: SpeedState, fix: SpeedFix): number | null {
  if (fix.speed !== null && fix.speed !== undefined && fix.speed >= 0 && Number.isFinite(fix.speed)) return fix.speed;
  const prev = state.lastFix;
  if (!prev) return null;
  const dt = (fix.timestamp - prev.timestamp) / 1000;
  if (dt <= 0) return null;
  const d = metresBetween(prev, fix);
  // movement inside the GPS noise is no movement: a stopped car wanders a few metres
  const noise = Math.max(2, 0.3 * (fix.accuracy ?? 10));
  if (d < noise) return 0;
  return d / dt;
}

/**
 * Next display speed. Returns the new state; read `kmh` from it.
 * Pure, so the rules above are unit-tested without a phone.
 */
export function nextSpeed(state: SpeedState, fix: SpeedFix): SpeedState {
  const raw = rawSpeedMs(state, fix);
  let kmh = state.kmh;
  if (raw !== null) {
    const rawKmh = raw * 3.6;
    if (raw < STANDSTILL_MS) {
      kmh = 0; // rule 1: stopped means 0 now, not in five seconds
    } else if (rawKmh > MAX_PLAUSIBLE_KMH) {
      kmh = state.kmh; // rule: a GPS jump is not a speed
    } else if (state.kmh === 0) {
      kmh = Math.round(rawKmh); // moving off: show it at once
    } else {
      kmh = Math.round(0.4 * state.kmh + 0.6 * rawKmh); // rule 2: light smoothing while moving
    }
  }
  return { lastFix: fix, kmh };
}

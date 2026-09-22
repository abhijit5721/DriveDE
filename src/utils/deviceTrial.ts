/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * deviceTrial.ts
 *
 * One anonymous trial per device (DRI-60 follow-up).
 *
 * The trial is anchored to the account on the server, but an anonymous account
 * costs one click, so signing out and clicking "Jetzt kostenlos starten" again
 * would hand out a fresh 7 days. This marker remembers on the device that the
 * free trial has been used. It lives in localStorage and, as a second copy, in
 * a cookie, so neither the app's own sign-out nor clearing IndexedDB (where
 * the store lives) removes it. Clearing all site data or a private window
 * still defeats it; that is the limit of what a web app can do without
 * fingerprinting, which we do not want.
 *
 * While the marker's trial is still running, a new anonymous account adopts
 * its dates instead of starting over. Once it has expired, the free CTAs open
 * the account form instead of another anonymous account.
 */

export interface DeviceTrial {
  startedAt: string;
  endsAt: string;
}

export const DEVICE_TRIAL_KEY = 'drivede_device_trial';
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60; // the longest browsers honour

const parse = (raw: string | null | undefined): DeviceTrial | null => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<DeviceTrial>;
    if (typeof value.startedAt !== 'string' || typeof value.endsAt !== 'string') return null;
    if (Number.isNaN(new Date(value.startedAt).getTime()) || Number.isNaN(new Date(value.endsAt).getTime())) return null;
    return { startedAt: value.startedAt, endsAt: value.endsAt };
  } catch {
    return null;
  }
};

const readCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie.split('; ').find((c) => c.startsWith(`${DEVICE_TRIAL_KEY}=`));
  return hit ? decodeURIComponent(hit.slice(DEVICE_TRIAL_KEY.length + 1)) : null;
};

/** The trial recorded on this device, whichever copy survived; the earliest start wins. */
export function readDeviceTrial(): DeviceTrial | null {
  let local: DeviceTrial | null = null;
  try { local = parse(localStorage.getItem(DEVICE_TRIAL_KEY)); } catch { /* storage blocked */ }
  const cookie = parse(readCookie());
  if (local && cookie) {
    return new Date(local.startedAt) <= new Date(cookie.startedAt) ? local : cookie;
  }
  return local ?? cookie;
}

/** Remembers the trial on this device. Never replaces an earlier start. */
export function recordDeviceTrial(trial: { trialStartedAt: string | null; trialEndsAt: string | null }): void {
  if (!trial.trialStartedAt || !trial.trialEndsAt) return;
  const existing = readDeviceTrial();
  const next: DeviceTrial = existing && new Date(existing.startedAt) <= new Date(trial.trialStartedAt)
    ? existing
    : { startedAt: trial.trialStartedAt, endsAt: trial.trialEndsAt };
  const raw = JSON.stringify(next);
  try { localStorage.setItem(DEVICE_TRIAL_KEY, raw); } catch { /* storage blocked */ }
  if (typeof document !== 'undefined') {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${DEVICE_TRIAL_KEY}=${encodeURIComponent(raw)}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  }
}

export function isDeviceTrialExpired(trial: DeviceTrial | null, now: Date = new Date()): boolean {
  if (!trial) return false;
  return new Date(trial.endsAt) <= now;
}

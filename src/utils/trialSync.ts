/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * trialSync.ts
 *
 * Reconciles the locally stored trial with the one recorded on the account.
 *
 * The trial used to live only in the browser's IndexedDB, so clearing site data
 * or switching devices produced an endless supply of fresh 7-day trials. The
 * server copy is therefore authoritative: whichever start is EARLIEST wins, so
 * a wiped device re-adopts the original (possibly already expired) trial
 * instead of starting a new one.
 */

export interface TrialState {
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  intendedPlan?: string | null;
}

export interface TrialResolution {
  /** The trial the app should use from now on */
  effective: TrialState;
  /** True when the server has no record yet and the local trial must be pushed up */
  needsPush: boolean;
}

const time = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
};

export function resolveTrial(server: TrialState | null, local: TrialState | null): TrialResolution {
  const serverStart = time(server?.trialStartedAt);
  const localStart = time(local?.trialStartedAt);

  // Nothing recorded anywhere
  if (serverStart === null && localStart === null) {
    return { effective: { trialStartedAt: null, trialEndsAt: null, intendedPlan: local?.intendedPlan ?? null }, needsPush: false };
  }

  // Only local knows about it (trial started offline, or before this feature) — push it up
  if (serverStart === null && localStart !== null) {
    return { effective: { ...local! }, needsPush: true };
  }

  // Only the server knows — the device was wiped or is new. Adopt it, expired or not.
  if (serverStart !== null && localStart === null) {
    return { effective: { ...server! }, needsPush: false };
  }

  // Both exist: the earliest start is the real one, so a reset device cannot
  // extend its trial by writing a later start.
  const earliestIsServer = (serverStart as number) <= (localStart as number);
  return {
    effective: earliestIsServer
      ? { ...server!, intendedPlan: server!.intendedPlan ?? local?.intendedPlan ?? null }
      : { ...local! },
    needsPush: !earliestIsServer,
  };
}

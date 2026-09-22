/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * ownTraffic.ts
 *
 * Keeps the founder's own devices and our automated checks out of the traffic
 * numbers. Vercel Web Analytics counts every page load and derives "visitors"
 * from IP + browser + day, so the founder alone shows up as several visitors a
 * day. Opening the site once with ?noanalytics stores a flag on that device;
 * from then on Vercel Analytics, PostHog and GA4 receive nothing from it.
 * ?analytics=on removes the flag again. Test scripts set the same flag.
 */

export const OWN_TRAFFIC_KEY = 'drivede_own_traffic';

export function isOwnTraffic(): boolean {
  try { return localStorage.getItem(OWN_TRAFFIC_KEY) === '1'; } catch { return false; }
}

/** Reads ?noanalytics / ?analytics=on from the current URL and stores the decision. */
export function applyOwnTrafficFlagFromUrl(search: string = typeof window !== 'undefined' ? window.location.search : ''): boolean {
  const params = new URLSearchParams(search);
  try {
    if (params.has('noanalytics')) {
      localStorage.setItem(OWN_TRAFFIC_KEY, '1');
      console.info('[Analytics] This device is marked as own traffic and is not counted. Open ?analytics=on to undo.');
    } else if (params.get('analytics') === 'on') {
      localStorage.removeItem(OWN_TRAFFIC_KEY);
      console.info('[Analytics] This device is counted again.');
    }
  } catch { /* storage blocked: nothing to remember */ }
  return isOwnTraffic();
}

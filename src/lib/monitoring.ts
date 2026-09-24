/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * monitoring.ts
 *
 * Sentry, loaded after the first paint. The SDK with session replay is ~270 KB, and
 * it used to sit in the first-load bundle of every landing visit, delaying the
 * first text on a phone by seconds. Now it is fetched as its own chunk once the
 * browser is idle (or after 3 s at the latest). Errors reported through
 * captureException before that are queued and sent once it is ready; uncaught
 * errors in those first seconds are not seen, which is the accepted trade-off.
 */

type SentryModule = typeof import('@sentry/react');

let sentry: SentryModule | null = null;
const pending: Array<[unknown, Record<string, unknown> | undefined]> = [];
const MAX_PENDING = 10;

async function load(): Promise<void> {
  const S = await import('@sentry/react');
  S.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    enabled: !import.meta.env.DEV, // Only send events in production/preview, not during local dev
    environment: import.meta.env.MODE,
    integrations: [
      S.browserTracingIntegration(),
      S.replayIntegration({
        maskAllText: true,    // GDPR: mask all text in replays
        blockAllMedia: false,
      }),
    ],
    // Performance monitoring
    tracesSampleRate: 0.1,         // Sample 10% of transactions for performance
    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Always replay sessions where an error occurred
    // Environmental noise, not product bugs: some browsers (private mode,
    // storage restrictions, extensions) reject service-worker registration with
    // a bare "Rejected" from the generated registerSW.js. Nothing we can act on.
    ignoreErrors: [
      /^Rejected$/,
    ],
    beforeSend(event) {
      const frames = event.exception?.values?.[0]?.stacktrace?.frames;
      if (frames?.some((f) => f.filename?.includes('registerSW.js'))) {
        return null; // drop anything originating in the SW registration shim
      }
      return event;
    },
  });
  sentry = S;
  for (const [err, extra] of pending.splice(0)) S.captureException(err, extra ? { extra } : undefined);
}

/**
 * Starts Sentry well after the page is usable. Call once from main.tsx.
 * First version (idle, max 3 s) moved Sentry out of the first paint but ran its
 * ~470 KB chunk right when visitors start tapping: blocking time on the live site
 * went from 179 to 541 ms (Lighthouse, 24 Sep). Now: after the load event, then
 * 5 s, then the next idle moment.
 */
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;
  const start = () => { void load().catch((err) => console.warn('[Monitoring] Sentry failed to load:', err)); };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
  const later = () => window.setTimeout(() => (idle ? idle(start, { timeout: 5000 }) : start()), 5000);
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later, { once: true });
}

/** Reports an error; queued until Sentry has loaded. */
export function captureException(err: unknown, extra?: Record<string, unknown>): void {
  if (sentry) { sentry.captureException(err, extra ? { extra } : undefined); return; }
  if (pending.length < MAX_PENDING) pending.push([err, extra]);
}

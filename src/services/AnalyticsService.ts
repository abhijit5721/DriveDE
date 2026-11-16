/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * AnalyticsService.ts
 * 
 * Handles conditional injection of tracking scripts (GA4, Meta Pixel, PostHog)
 * based on user's GDPR cookie consent preferences.
 *
 * Landing-page funnel events (DRI-46), sent cookie-free through Vercel Web
 * Analytics and mirrored to PostHog once the visitor has consented:
 *   try_click            visitor opened the public trainer from the hero
 *   trainer_complete     visitor finished a round (props: trainer, round)
 *   signup_prompt_shown  the "save your result" prompt appeared
 *   signup_started       visitor tapped a signup CTA (props: from)
 *   anonymous_start      free CTA opened the app on an anonymous account (props: from, resumed) (DRI-60)
 *   anonymous_blocked    free CTA opened the form instead: this device's trial is used up (props: from)
 *   secure_prompt_shown  the "add an email" sheet appeared for an anonymous user (props: trigger)
 *   secure_prompt_dismissed  it was closed with "Später" or the X (props: trigger)
 *   google_started       a "Mit Google" button was tapped (props: from)
 *   google_completed     back from Google and signed in (props: new_account, flow: sign_in for a new sign-in, link for an anonymous account that linked Google, after_conflict: true when it follows a secure_conflict_shown)
 *   secure_conflict_shown  linking Google failed because that Google account already has a DriveDE account, the sheet appeared (props: via, trigger)
 *   secure_conflict_signin the conflict sheet's "Sign in with Google" was tapped (props: via, trigger)
 *   secure_conflict_dismissed the conflict sheet was closed to continue as guest (props: via, trigger)
 *   auth_error           Google/Supabase returned an error in the URL (props: code, description, replay: true when code is bad_oauth_state)
 *   secure_prompt_shown  the add-an-email ask appeared (props: trigger, placement: sheet|inline|paywall)
 *   secure_prompt_dismissed the ask was closed with "Später" (props: trigger)
 *   secure_code_submitted an emailed 8-digit code was entered (props: ok)
 *   secure_email_error   adding the email failed (props: trigger, code)
 *   account_secured      an anonymous account now has an email or Google identity (props: via, trigger, trial_state: running|expired, trial_day)
 *   first_step_click     a new user used the dashboard's first-step card (props: action, lesson)
 *   scenario_answered    an exam situation answer was checked (props: scenario, covered, total)
 *   scenario_minitest    the quick check after it was answered (props: scenario, correct)
 *   scenario_ai_feedback detailed AI feedback was requested (props: scenario, ok, reason)
 *   scenario_steps       the step order was checked (props: scenario, right, total, mistakes)
 *   exam_deeplink        the app opened a situation from its public page /pruefung/<id>/ (props: scenario)
 *   email_added          an anonymous user asked to add an email or Google: the code or link was requested, not yet confirmed (props: via, from)
 *   paywall_shown        the paywall opened (props: anonymous, trial_state: running|expired|none)
 *   checkout_started     a Stripe checkout session is being requested, once per startCheckout call (props: tier)
 *   purchase_completed   back from Stripe and the account is now premium (no props)
 * Every event carries utm_source / utm_campaign from the landing URL.
 */

// PostHog is ~230 KB and only runs after cookie consent, so it is fetched then, as its
// own chunk, instead of sitting in the first-load bundle of every landing visit.
import type { PostHog } from 'posthog-js';
import { track } from '@vercel/analytics';
import { useAppStore } from '../store/useAppStore';
import { isInternalHost, isOwnTraffic } from '../utils/ownTraffic';

// Configuration from environment variables
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

// Keys a Supabase auth redirect puts in the URL fragment or query. Session tokens must never
// reach an analytics tool, so every outgoing URL goes through scrubAuthUrl.
const AUTH_URL_KEYS = new Set([
  'access_token', 'refresh_token', 'provider_token', 'provider_refresh_token',
  'expires_in', 'expires_at', 'token_type', 'token_hash',
  'code', 'error', 'error_code', 'error_description',
]);

function isAuthKey(seg: string): boolean {
  const raw = seg.split('=')[0];
  let key = raw;
  try { key = decodeURIComponent(raw); } catch { /* keep raw */ }
  return AUTH_URL_KEYS.has(key);
}

function hasAuthKey(part: string): boolean {
  return part.split('&').some(isAuthKey);
}

/** True when the URL carries auth redirect params in its fragment or query. */
export function hasAuthUrlParams(url: string): boolean {
  const hashIdx = url.indexOf('#');
  const hash = hashIdx >= 0 ? url.slice(hashIdx + 1) : '';
  const beforeHash = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  const qIdx = beforeHash.indexOf('?');
  const query = qIdx >= 0 ? beforeHash.slice(qIdx + 1) : '';
  return hasAuthKey(hash) || hasAuthKey(query);
}

/**
 * Drops auth redirect params from a URL: the whole fragment when it holds any of them
 * (a plain #plan survives), and those keys from the query. Never throws.
 */
export function scrubAuthUrl(url: string): string {
  try {
    if (!hasAuthUrlParams(url)) return url;
    const hashIdx = url.indexOf('#');
    let hash = hashIdx >= 0 ? url.slice(hashIdx) : '';
    let rest = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
    if (hash && hasAuthKey(hash.slice(1))) hash = '';
    const qIdx = rest.indexOf('?');
    if (qIdx >= 0) {
      const kept = rest.slice(qIdx + 1).split('&').filter((seg) => seg && !isAuthKey(seg));
      rest = rest.slice(0, qIdx) + (kept.length ? `?${kept.join('&')}` : '');
    }
    return rest + hash;
  } catch {
    const idx = url.indexOf('#');
    return idx >= 0 && /access_token=|refresh_token=/.test(url) ? url.slice(0, idx) : url;
  }
}

/** Scrubs one analytics string value: auth URL params are dropped, bare tokens are redacted. */
export function scrubAnalyticsValue(value: string): string {
  let out = value;
  if (hasAuthUrlParams(out)) out = scrubAuthUrl(out);
  if (/access_token=|refresh_token=|provider_token=|token_hash=/.test(out)) return '[redacted]';
  return out;
}

// Initial tracking waits on this when the page loads from an auth redirect, so the
// first $pageview never sees the token fragment. Resolved at once otherwise.
let authUrlGate: Promise<void> = Promise.resolve();

async function waitForAuthUrlCleanup(): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let sessionRead = false;
  try {
    await Promise.race([
      (async () => {
        // dynamic: supabase.ts stays out of the entry chunk
        const { getSupabase } = await import('../lib/supabase');
        const client = await getSupabase();
        // null client: Supabase is not configured, nothing will read the URL
        await client?.auth.getSession();
        sessionRead = true;
      })().catch(() => undefined),
      new Promise<void>((resolve) => { timer = setTimeout(resolve, 8000); }),
    ]);
  } catch { /* gate still resolves below */ }
  if (timer) clearTimeout(timer);
  // Only clean the URL once Supabase has read the tokens. On timeout or failure the URL is
  // left alone (stripping it would lose the sign-in); the gate still resolves so analytics
  // can start, and each sink scrubs its own URL.
  if (!sessionRead) return;
  try {
    if (hasAuthUrlParams(window.location.href)) {
      history.replaceState(history.state, '', scrubAuthUrl(window.location.href));
    }
  } catch { /* history unavailable */ }
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: any;
  }
}

let posthog: PostHog | null = null;

class AnalyticsService {
  private scriptsLoaded = {
    analytics: false,
    marketing: false,
    posthog: false
  };

  /**
   * Initializes the subscription to the store's cookie settings.
   */
  public init() {
    // The founder's devices and our test runs: no PostHog, GA4 or Meta at all.
    if (isOwnTraffic() || isInternalHost()) {
      console.log('[AnalyticsService] Own traffic or staging/preview/local host, analytics stay off.');
      return;
    }
    if (typeof window === 'undefined') return;

    if (hasAuthUrlParams(window.location.href)) authUrlGate = waitForAuthUrlCleanup();

    // Wait for store hydration before initial check
    const unsubHydration = useAppStore.subscribe(
      (state) => state.isHydrated,
      (isHydrated) => {
        if (isHydrated) {
          console.log('[AnalyticsService] Store hydrated, running initial sync...');
          const settings = useAppStore.getState().cookieSettings;
          void authUrlGate.then(() => this.syncTracking(settings));
          unsubHydration(); // Only need this once
        }
      },
      { fireImmediately: true }
    );

    // Listen for future changes specifically to cookieSettings
    useAppStore.subscribe(
      (state) => state.cookieSettings,
      (settings) => {
        console.log('[AnalyticsService] Consent changed:', settings);
        void authUrlGate.then(() => this.syncTracking(settings));
      }
    );
  }

  private syncTracking(settings: { analytics: boolean; marketing: boolean }) {
    // Analytics (GA4)
    if (settings.analytics) {
      this.loadGA4();
    } else {
      this.disableGA4();
    }

    // PostHog — loaded alongside GA4 as an analytics tool
    if (settings.analytics) {
      this.loadPostHog();
    } else {
      this.disablePostHog();
    }

    // Marketing (Meta Pixel)
    if (settings.marketing) {
      this.loadMetaPixel();
    } else {
      this.disableMetaPixel();
    }
  }

  // --- PostHog Implementation ---
  private loadPostHog() {
    if (this.scriptsLoaded.posthog || !POSTHOG_KEY) return;

    console.log('[AnalyticsService] Loading PostHog...');
    this.scriptsLoaded.posthog = true;

    void import('posthog-js').then(({ default: ph }) => {
      // consent may have been withdrawn while the chunk was loading
      if (!this.scriptsLoaded.posthog) return;
      posthog = ph;
      ph.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only', // Only create profiles for identified (logged-in) users
        capture_pageview: true,
        capture_pageleave: true,
        session_recording: {
          maskAllInputs: true,    // GDPR: mask all input fields in session recordings
          maskTextSelector: '.ph-mask', // Allow masking specific elements with class
        },
        persistence: 'localStorage+cookie',
        // Keep session tokens from an auth redirect URL out of every captured event.
        before_send: (event) => {
          if (!event) return event;
          for (const bag of [event.properties, event.$set, event.$set_once] as Array<Record<string, unknown> | undefined>) {
            if (!bag || typeof bag !== 'object') continue;
            for (const k of Object.keys(bag)) {
              const v = bag[k];
              if (typeof v === 'string') {
                const clean = scrubAnalyticsValue(v);
                if (clean !== v) bag[k] = clean;
              }
            }
          }
          return event;
        },
        loaded: (instance) => {
          // In development, disable sending events to keep data clean
          if (import.meta.env.DEV) {
            instance.opt_out_capturing();
            console.log('[AnalyticsService] PostHog loaded in DEV mode — event capture disabled.');
          }
        }
      });
    }).catch((err) => console.warn('[AnalyticsService] PostHog failed to load:', err));
  }

  private disablePostHog() {
    if (!this.scriptsLoaded.posthog) return;

    console.log('[AnalyticsService] Disabling PostHog...');
    posthog?.opt_out_capturing();
    posthog?.reset();
    this.scriptsLoaded.posthog = false;
  }

  /** True once the visitor has consented and PostHog is initialised. */
  public isPostHogLoaded(): boolean {
    return this.scriptsLoaded.posthog;
  }

  /**
   * Call this when a user logs in to tie their events to their identity.
   * @param userId - The Supabase user UUID
   * @param email - The user's email address
   */
  public identifyUser(userId: string, email: string) {
    if (!this.scriptsLoaded.posthog) return;
    console.log(`[AnalyticsService] Identifying PostHog user: ${email}`);
    posthog?.identify(userId, { email });
  }

  /**
   * Call this when a user signs out to reset their identity.
   */
  public resetUser() {
    if (!this.scriptsLoaded.posthog) return;
    console.log('[AnalyticsService] Resetting PostHog identity.');
    posthog?.reset();
  }

  // --- GA4 Implementation ---
  private loadGA4() {
    if (this.scriptsLoaded.analytics || !GA4_MEASUREMENT_ID) return;
    
    console.log('[AnalyticsService] Loading GA4...');
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    script.id = 'gtag-js';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = (...args: any[]) => {
      window.dataLayer.push(args);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, {
      page_location: scrubAuthUrl(window.location.href),
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    this.scriptsLoaded.analytics = true;
  }

  private disableGA4() {
    if (!this.scriptsLoaded.analytics) return;
    
    console.log('[AnalyticsService] Disabling GA4 tracking...');
    
    // Remove scripts
    document.getElementById('gtag-js')?.remove();
    
    // Set 'opt-out' cookie for GA4 (standard way)
    (window as any)[`ga-disable-${GA4_MEASUREMENT_ID}`] = true;
    
    // Best effort cleanup of cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.startsWith('_ga') || name.startsWith('_gid')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      }
    }

    this.scriptsLoaded.analytics = false;
  }

  // --- Meta Pixel Implementation ---
  private loadMetaPixel() {
    if (this.scriptsLoaded.marketing || !META_PIXEL_ID) return;
    
    console.log('[AnalyticsService] Loading Meta Pixel...');
    
    // Standard Meta Pixel snippet logic (minimal)
    const f = window as any;
    if (f.fbq) return;
    const n: any = (f.fbq = (...args: any[]) => {
      if (n.callMethod) {
        n.callMethod(...args);
      } else {
        n.queue.push(args);
      }
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.id = 'meta-pixel-js';
    document.head.appendChild(script);

    f.fbq('init', META_PIXEL_ID);
    f.fbq('track', 'PageView');

    this.scriptsLoaded.marketing = true;
  }

  private disableMetaPixel() {
    if (!this.scriptsLoaded.marketing) return;
    
    console.log('[AnalyticsService] Disabling Meta Pixel...');
    
    document.getElementById('meta-pixel-js')?.remove();
    delete (window as any).fbq;
    
    // Cleanup Pixel cookies
    document.cookie = `_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    
    this.scriptsLoaded.marketing = false;
  }
}

export const analyticsService = new AnalyticsService();

export type FunnelEvent =
  | 'try_click'
  | 'trainer_complete'
  | 'exam_date_entered'
  | 'signup_prompt_shown'
  | 'signup_started'
  | 'result_saved'
  | 'share_click'
  | 'ladder_rung_started'
  | 'ladder_locked_tap'
  | 'anonymous_start'
  | 'anonymous_blocked'
  | 'secure_prompt_shown'
  | 'secure_prompt_dismissed'
  | 'secure_code_submitted'
  | 'secure_email_error'
  | 'email_added'
  | 'google_started'
  | 'google_completed'
  | 'secure_conflict_shown'
  | 'secure_conflict_signin'
  | 'secure_conflict_dismissed'
  | 'auth_error'
  | 'account_secured'
  | 'first_step_click'
  | 'scenario_answered'
  | 'scenario_minitest'
  | 'scenario_ai_feedback'
  | 'scenario_steps'
  | 'exam_deeplink'
  | 'paywall_shown'
  | 'checkout_started'
  | 'purchase_completed';

/**
 * Landing-page funnel event. Vercel Web Analytics needs no consent (no cookies,
 * no personal data); PostHog only receives it when the visitor has opted in.
 * Never throws: analytics must not be able to break the page.
 */
export function trackFunnel(event: FunnelEvent, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || isOwnTraffic() || isInternalHost()) return;
  const params = new URLSearchParams(window.location.search);
  const enriched = {
    ...props,
    utm_source: params.get('utm_source') ?? 'direct',
    utm_campaign: params.get('utm_campaign') ?? '',
  };
  try { track(event, enriched); } catch { /* analytics must never break the page */ }
  try { if (analyticsService.isPostHogLoaded()) posthog?.capture(event, enriched); } catch { /* same */ }
}

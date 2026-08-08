/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * entitlement.ts
 *
 * Single source of truth for "does this user have Pro right now?" when
 * hydrating from Supabase.
 *
 * The Stripe webhook sets profiles_secure.is_premium = true on purchase and
 * nothing clears it, so that flag alone would make every 30/90-day pass behave
 * like a lifetime licence. Purchase history is therefore authoritative whenever
 * it exists; the flag is only a fallback for users who never bought anything
 * (manual grants, legacy accounts).
 */

export interface SubscriptionRow {
  status?: string | null;
  /** null means lifetime — no expiry */
  expires_at?: string | null;
}

export function isSubscriptionActive(sub: SubscriptionRow, now: Date = new Date()): boolean {
  if (sub.status !== 'active') return false;
  if (!sub.expires_at) return true; // lifetime
  const expiry = new Date(sub.expires_at);
  if (Number.isNaN(expiry.getTime())) return false; // malformed date is never entitlement
  return expiry > now;
}

export function deriveIsPremium(
  profileIsPremium: boolean | null | undefined,
  subscriptions: SubscriptionRow[] | null | undefined,
  now: Date = new Date()
): boolean {
  const rows = subscriptions || [];
  if (rows.length === 0) return !!profileIsPremium;
  return rows.some((s) => isSubscriptionActive(s, now));
}

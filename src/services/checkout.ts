/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * checkout.ts
 *
 * Single entry point to Stripe Checkout, shared by the in-app Paywall and the
 * "buy now" path from the landing page pricing table. Redirects the browser to
 * Stripe on success; the caller decides what to do with a failure.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type Tier = '30-days' | '90-days' | 'lifetime';

export type CheckoutResult =
  | { ok: true }
  | { ok: false; reason: 'not-configured' | 'no-user' | 'no-url' | 'error'; error?: unknown };

export async function startCheckout(tier: Tier, language: string): Promise<CheckoutResult> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, reason: 'not-configured' };

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, reason: 'no-user' };

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { tier, language },
    });
    if (error) throw error;

    if (!data?.url) return { ok: false, reason: 'no-url' };
    window.location.href = data.url;
    return { ok: true };
  } catch (error) {
    console.error('[Checkout] Failed to start session:', error);
    return { ok: false, reason: 'error', error };
  }
}

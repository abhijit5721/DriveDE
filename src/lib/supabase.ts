/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// supabase-js is ~100 KB gzipped and landing trainers need no account, so the client
// is created on first use through a dynamic import instead of living in the entry chunk.
let clientPromise: Promise<SupabaseClient | null> | null = null;
let clientLoaded = false;
const loadedListeners = new Set<() => void>();

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }),
      )
      .then((client) => {
        clientLoaded = true;
        loadedListeners.forEach((cb) => cb());
        return client;
      })
      .catch((err) => {
        // allow a retry (offline chunk fetch) instead of caching the failure
        clientPromise = null;
        throw err;
      });
  }
  return clientPromise;
}

/** Runs cb once the client exists (immediately if it already does). Returns an unsubscribe. */
export function onSupabaseLoaded(cb: () => void): () => void {
  if (clientLoaded) {
    cb();
    return () => undefined;
  }
  loadedListeners.add(cb);
  return () => {
    loadedListeners.delete(cb);
  };
}

/**
 * True when there is something for the client to restore: a persisted supabase-js
 * session in localStorage, or an OAuth/magic-link return in the URL (detectSessionInUrl).
 * When false the client load can wait until the first auth or sync call.
 */
export function mayHaveSupabaseSession(): boolean {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) return true;
    }
  } catch {
    // storage blocked: be safe and load the client
    return true;
  }
  const { search, hash } = window.location;
  return /[?&]code=|[?&]error=|access_token=|refresh_token=|[#&]error=/.test(search + hash);
}

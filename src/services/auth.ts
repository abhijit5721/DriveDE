/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { Provider, Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';
import { toast } from 'react-hot-toast';

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session ?? null;
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user ?? null;
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

export async function signInWithProvider(provider: Provider): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  const platform = Capacitor.getPlatform();
  const isNative = platform === 'android' || platform === 'ios';
  console.log('[Auth] Detected Platform:', platform);
  console.log('[Auth] Is Native:', isNative);

  if (isNative && provider === 'google') {
    try {
      console.log('[Auth] Attempting Native Google Sign-In');
      toast.loading('Opening native sign-in...', { id: 'auth-loading' });
      
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      
      // Ensure we have a valid client ID. This must be the WEB client ID from Google Console
      const WEB_CLIENT_ID = '712119605930-5q3uukgohlqb6h2h37o8bp7fe6o8rjml.apps.googleusercontent.com';
      
      console.log('[Auth] Initializing GoogleAuth with ID:', WEB_CLIENT_ID);
      try {
        await GoogleAuth.initialize({
          clientId: WEB_CLIENT_ID,
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      } catch (initErr) {
        console.warn('[Auth] GoogleAuth.initialize warning (might already be init):', initErr);
      }

      console.log('[Auth] GoogleAuth plugin initialized. Calling signIn()...');
      const googleUser = await GoogleAuth.signIn();
      console.log('[Auth] Native Google Sign-In success, idToken present:', !!googleUser.authentication.idToken);
      
      if (!googleUser.authentication.idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }

      toast.loading('Connecting to Supabase...', { id: 'auth-loading' });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleUser.authentication.idToken,
      });

      if (error) throw error;
      console.log('[Auth] Supabase Session established via Native Token');
      toast.success('Successfully logged in!', { id: 'auth-loading' });
      return;
    } catch (err: any) {
      console.error('[Auth] Native Google Sign-In failed:', err);
      toast.error(`Native Sign-In failed: ${err.message || 'Unknown error'}`, { id: 'auth-loading' });
      // We do NOT fall back here if the user explicitly wants no browser.
      // But if it's a "Plugin not implemented" error, it means we are definitely on a platform that Capacitor doesn't recognize as native or the plugin is missing.
      throw err;
    }
  }

  console.log('[Auth] Falling back to Web/Browser flow. isNative:', isNative);
  toast.loading('Opening browser for sign-in...', { id: 'auth-loading' });
  const redirectUrl = isNative ? 'de.drivede.app://auth-callback' : window.location.origin;
  console.log('[Auth] Using redirectUrl:', redirectUrl);

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: isNative,
    },
  });

  if (error) {
    throw error;
  }

  // Note: For native non-Google OAuth, we previously manually opened the browser.
  // However, Supabase's signInWithOAuth with skipBrowserRedirect: true 
  // might not return a data.url if the provider isn't configured for it.
  // For now, we focus on the Native Google flow which is browser-less.
}

export function subscribeToAuthChanges(callback: (session: Session | null) => void) {
  if (!isSupabaseConfigured || !supabase) {
    return () => undefined;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session ?? null);
  });

  return () => subscription.unsubscribe();
}

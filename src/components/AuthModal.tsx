import { useMemo, useState } from 'react';
import { LogIn, Mail, Lock, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { signInWithProvider } from '../services/auth';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

type AuthMode = 'signin' | 'signup';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const { language } = useAppStore();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const copy = useMemo(() => {
    const isDe = language === 'de';
    return {
      title: mode === 'signin'
        ? isDe ? 'Mit Konto fortfahren' : 'Continue with account'
        : isDe ? 'Konto erstellen' : 'Create account',
      subtitle: isDe
        ? 'Optional: Melde dich an, um deinen Fortschritt künftig in der Cloud zu synchronisieren.'
        : 'Optional: Sign in to sync your progress to the cloud in the future.',
      email: isDe ? 'E-Mail' : 'Email',
      password: isDe ? 'Passwort' : 'Password',
      confirmPassword: isDe ? 'Passwort bestätigen' : 'Confirm password',
      signin: isDe ? 'Anmelden' : 'Sign in',
      signup: isDe ? 'Registrieren' : 'Sign up',
      switchToSignup: isDe ? 'Noch kein Konto? Registrieren' : 'No account yet? Sign up',
      switchToSignin: isDe ? 'Schon ein Konto? Anmelden' : 'Already have an account? Sign in',
      continueGuest: isDe ? 'Als Gast fortfahren' : 'Continue as guest',
      continueGoogle: isDe ? 'Mit Google fortfahren' : 'Continue with Google',
      socialDivider: isDe ? 'oder mit E-Mail fortfahren' : 'or continue with email',
      socialHint: isDe
        ? 'Google-Login muss zusätzlich im Supabase-Dashboard aktiviert werden.'
        : 'Google login must also be enabled in your Supabase dashboard.',
      notConfigured: isDe
        ? 'Supabase ist noch nicht konfiguriert. Lokaler Gastmodus bleibt aktiv.'
        : 'Supabase is not configured yet. Local guest mode remains active.',
      signupSuccess: isDe
        ? 'Konto erstellt. Bitte bestätige ggf. deine E-Mail und melde dich danach an.'
        : 'Account created. Please confirm your email if required, then sign in.',
      passwordMismatch: isDe ? 'Die Passwörter stimmen nicht überein.' : 'Passwords do not match.',
      passwordShort: isDe ? 'Bitte mindestens 6 Zeichen verwenden.' : 'Please use at least 6 characters.',
      genericError: isDe ? 'Anmeldung fehlgeschlagen.' : 'Authentication failed.',
    };
  }, [language, mode]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured || !supabase) {
      setError(copy.notConfigured);
      return;
    }

    setLoading(true);

    try {
      await signInWithProvider('google');
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.genericError;
      setError(message || copy.genericError);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!isSupabaseConfigured || !supabase) {
      setError(copy.notConfigured);
      return;
    }

    if (password.length < 6) {
      setError(copy.passwordShort);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;
        setSuccess(copy.signupSuccess);
        setMode('signin');
        setConfirmPassword('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.genericError;
      setError(message || copy.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{copy.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{copy.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{copy.notConfigured}</p>
          </div>
        )}

        <div className="mb-4 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[13px] font-bold text-slate-700 shadow-sm dark:bg-slate-100">G</span>
            {copy.continueGoogle}
          </button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">{copy.socialHint}</p>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
              {copy.socialDivider}
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{copy.email}</span>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                placeholder="name@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{copy.password}</span>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </label>

          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{copy.confirmPassword}</span>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            {success}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-all',
              'bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signin' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'signin' ? copy.signin : copy.signup}
          </button>

          <button
            onClick={() => {
              setError(null);
              setSuccess(null);
              setMode(mode === 'signin' ? 'signup' : 'signin');
            }}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {mode === 'signin' ? copy.switchToSignup : copy.switchToSignin}
          </button>

          <button
            onClick={onClose}
            className="w-full rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {copy.continueGuest}
          </button>
        </div>
      </div>
    </div>
  );
}

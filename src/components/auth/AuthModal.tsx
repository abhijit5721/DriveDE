import { useMemo, useState } from 'react';
import { LogIn, Mail, Lock, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { signInWithProvider } from '../../services/auth';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef } from 'react';

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Cloudflare Turnstile Site Key (Testing key that always passes)
  // REPLACE THIS with your real Site Key from Cloudflare Dashboard
  const TURNSTILE_SITE_KEY = '1x00000000000000000000AA';

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
      passwordShort: isDe ? 'Passwort muss mindestens 8 Zeichen lang sein.' : 'Password must be at least 8 characters.',
      passwordComplexity: isDe 
        ? 'Passwort muss Groß-/Kleinschreibung, Zahlen und Sonderzeichen enthalten.' 
        : 'Password must include uppercase, lowercase, numbers, and symbols.',
      emailInvalid: isDe ? 'Bitte eine gültige E-Mail-Adresse angeben.' : 'Please provide a valid email address.',
      captchaMissing: isDe ? 'Bitte bestätige, dass du kein Roboter bist.' : 'Please complete the CAPTCHA.',
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      setError(copy.emailInvalid);
      return;
    }

    // Password validation (only for signup or strict signin)
    if (mode === 'signup') {
      if (password.length < 8) {
        setError(copy.passwordShort);
        return;
      }

      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        setError(copy.passwordComplexity);
        return;
      }

      if (password !== confirmPassword) {
        setError(copy.passwordMismatch);
        return;
      }
    }

    if (!captchaToken) {
      setError(copy.captchaMissing);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken: captchaToken,
          }
        });

        if (signInError) throw signInError;
        onClose();
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: captchaToken,
          }
        });

        if (signUpError) throw signUpError;
        setSuccess(copy.signupSuccess);
        setMode('signin');
        setConfirmPassword('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.genericError;
      setError(message || copy.genericError);
      // Reset CAPTCHA on error
      turnstileRef.current?.reset();
      setCaptchaToken(null);
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
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                fill="#EA4335"
              />
            </svg>
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

          {/* Cloudflare Turnstile CAPTCHA */}
          <div className="flex justify-center pt-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => {
                setCaptchaToken(null);
                setError(isDE ? 'CAPTCHA Fehler. Bitte versuche es erneut.' : 'CAPTCHA error. Please try again.');
              }}
              options={{
                theme: 'light',
                size: 'normal',
              }}
            />
          </div>
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

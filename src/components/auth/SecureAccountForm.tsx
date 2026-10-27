/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * SecureAccountForm.tsx
 *
 * The "add an email" form for anonymous users, shared by the bottom sheet, the inline
 * card in the exam simulation, the paywall and the Konto page. Google first, then an
 * email, then the 8-digit code from the mail (the link in the mail works too). No
 * password: the anonymous account is upgraded in place, so id, progress and trial stay.
 * Resend is limited to once per 60 s and 3 sends per device.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { secureAnonymousAccount, secureAnonymousWithGoogle, verifySecureCode, type SecureErrorKey } from '../../services/auth';
import { trackFunnel } from '../../services/AnalyticsService';
import { readPromptState, setPendingSecure, setPendingTrigger, type SecureSource } from '../../utils/securePrompt';
import GoogleLogo from '../../assets/google-logo.svg';

const SENDS_KEY = 'drivede_secure_sends';
const MAX_SENDS = 3;
const RESEND_MS = 60_000;

function readSends(): { count: number; last: number } {
  try {
    const v = JSON.parse(localStorage.getItem(SENDS_KEY) || '{}');
    return { count: Number(v.count) || 0, last: Number(v.last) || 0 };
  } catch {
    return { count: 0, last: 0 };
  }
}

function recordSend(): void {
  try { localStorage.setItem(SENDS_KEY, JSON.stringify({ count: readSends().count + 1, last: Date.now() })); } catch { /* storage blocked */ }
}

/** Seconds until the next send is allowed; Infinity once the device has used all of them. */
function waitSeconds(): number {
  const { count, last } = readSends();
  if (count >= MAX_SENDS) return Infinity;
  return Math.max(0, Math.ceil((last + RESEND_MS - Date.now()) / 1000));
}

interface FormProps {
  trigger: SecureSource;
  /** 'dark' for the Konto page card, 'light' (default) for surfaces that follow the theme. */
  tone?: 'light' | 'dark';
  /** The account now has an email (code confirmed). Google comes back through a redirect instead. */
  onSecured?: () => void;
  /** Called when the user leaves for the sign-in dialog, so a floating host can close itself. */
  onLeave?: () => void;
  testPrefix?: string;
}

export function SecureAccountForm({ trigger, tone = 'light', onSecured, onLeave, testPrefix = 'secure-sheet' }: FormProps) {
  const language = useAppStore((s) => s.language);
  const t = TRANSLATIONS[language].account;
  const dark = tone === 'dark';
  const [pending] = useState(() => readPromptState().pendingEmail);
  const [email, setEmail] = useState(pending ?? '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'done'>(pending ? 'code' : 'email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SecureErrorKey | null>(null);
  const [wait, setWait] = useState(() => waitSeconds());

  useEffect(() => {
    if (step !== 'code') return;
    const timer = window.setInterval(() => setWait(waitSeconds()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  const fail = (key: SecureErrorKey) => {
    setError(key);
    trackFunnel('secure_email_error', { trigger, code: key });
  };

  const requestCode = async () => {
    if (waitSeconds() > 0) { setWait(waitSeconds()); fail('rate_limited'); return false; }
    setLoading(true);
    const result = await secureAnonymousAccount(email);
    setLoading(false);
    if (result.error) { fail(result.error); return false; }
    recordSend();
    setWait(waitSeconds());
    setPendingSecure(email.trim().toLowerCase(), trigger);
    return true;
  };

  const submitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(await requestCode())) return;
    trackFunnel('email_added', { via: 'email', from: trigger === 'account' ? 'account' : `prompt_${trigger}` });
    setCode('');
    setStep('code');
  };

  const resend = async () => {
    setError(null);
    await requestCode();
  };

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await verifySecureCode(email, code);
    setLoading(false);
    trackFunnel('secure_code_submitted', { ok: !result.error });
    if (result.error) { fail(result.error); return; }
    setStep('done');
    onSecured?.();
  };

  const google = async () => {
    setError(null);
    setLoading(true);
    setPendingTrigger(trigger);
    trackFunnel('google_started', { from: `secure_${trigger}` });
    const result = await secureAnonymousWithGoogle();
    if (result.error) { fail(result.error); setLoading(false); return; }
    trackFunnel('email_added', { via: 'google', from: trigger === 'account' ? 'account' : `prompt_${trigger}` });
    // the browser is now redirecting to Google
  };

  const otherEmail = () => {
    setPendingSecure(null, trigger);
    setError(null);
    setCode('');
    setStep('email');
  };

  const signIn = () => {
    window.dispatchEvent(new CustomEvent('drivede:open-auth'));
    onLeave?.();
  };

  const input = dark
    ? 'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400'
    : 'w-full rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:text-white';
  const muted = dark ? 'text-slate-300' : 'text-muted';
  const link = dark ? 'text-slate-200 hover:text-white' : 'text-muted hover:text-slate-900 dark:hover:text-white';
  const errorText = error ? (error === 'unavailable' ? t.secureUnavailable : t.secureErrors[error]) : null;

  if (step === 'done') {
    return (
      <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" data-testid={`${testPrefix}-sent`}>
        {t.secureDone}
      </p>
    );
  }

  const errorBlock = errorText && (
    <div className="space-y-1.5">
      <p className="text-xs text-red-600 dark:text-red-400" data-testid={`${testPrefix}-error`}>{errorText}</p>
      {(error === 'email_exists' || error === 'identity_already_exists') && (
        <button type="button" onClick={signIn} data-testid={`${testPrefix}-signin`} className="text-xs font-semibold text-blue-600 underline dark:text-blue-400">
          {t.secureSignInExisting}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-2">
      {step === 'email' ? (
        <>
          <button
            type="button"
            onClick={google}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-70"
          >
            <img src={GoogleLogo} alt="" className="h-4 w-4" />
            {t.continueWithGoogle}
          </button>
          <p className={`text-center text-xs ${muted}`}>{t.secureOr}</p>
          <form onSubmit={submitEmail} className="space-y-2">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t.secureEmailLabel}
              aria-label={t.secureEmailLabel}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid={`${testPrefix}-email`}
              className={input}
            />
            {errorBlock}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {t.secureCta}
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={confirm} className="space-y-2">
          <p className={`text-sm ${muted}`} data-testid={`${testPrefix}-code-hint`}>{t.secureCodeSent.replace('{email}', email)}</p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{8}"
            maxLength={8}
            required
            autoComplete="one-time-code"
            placeholder={t.secureCodeLabel}
            aria-label={t.secureCodeLabel}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            data-testid={`${testPrefix}-code`}
            className={`${input} tracking-[0.3em]`}
          />
          {errorBlock}
          <button
            type="submit"
            disabled={loading || code.length !== 8}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {t.secureConfirm}
          </button>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold">
            <button type="button" onClick={resend} disabled={loading || wait > 0} className={`${link} disabled:opacity-50`} data-testid={`${testPrefix}-resend`}>
              {wait > 0 && Number.isFinite(wait) ? t.secureResendWait.replace('{s}', String(wait)) : t.secureResend}
            </button>
            <button type="button" onClick={otherEmail} className={link}>{t.secureOtherEmail}</button>
          </div>
        </form>
      )}
      <p className={`text-center text-[11px] ${muted}`}>{t.secureFooter}</p>
    </div>
  );
}

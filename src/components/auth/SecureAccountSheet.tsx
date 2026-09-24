/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * SecureAccountSheet.tsx
 *
 * DRI-60 follow-up: a small sheet at the bottom of the screen that asks an
 * anonymous user to add an email at a moment they have something to lose (see
 * utils/securePrompt). The app stays visible and usable behind it, "Später"
 * closes it, and the form does the same as the one on the Konto page.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { secureAnonymousAccount, secureAnonymousWithGoogle } from '../../services/auth';
import { trackFunnel } from '../../services/AnalyticsService';
import { markPromptDismissed, markPromptShown, pickTrigger, readPromptState, type SecureTrigger } from '../../utils/securePrompt';
import GoogleLogo from '../../assets/google-logo.svg';

interface SheetProps {
  trigger: SecureTrigger;
  onClose: () => void;
}

export function SecureAccountSheet({ trigger, onClose }: SheetProps) {
  const language = useAppStore((s) => s.language);
  const t = TRANSLATIONS[language].account;
  const copy = t.securePrompt[trigger];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const dismiss = () => {
    if (!sent) {
      markPromptDismissed();
      trackFunnel('secure_prompt_dismissed', { trigger });
    }
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await secureAnonymousAccount(email, password);
    setLoading(false);
    if (result.error) { setError(result.error === 'unavailable' ? t.secureUnavailable : result.error); return; }
    trackFunnel('email_added', { via: 'email', from: `prompt_${trigger}` });
    setSent(true);
  };

  const google = async () => {
    setError(null);
    setLoading(true);
    trackFunnel('google_started', { from: `secure_${trigger}` });
    const result = await secureAnonymousWithGoogle();
    if (result.error) { setError(result.error === 'unavailable' ? t.secureUnavailable : result.error); setLoading(false); return; }
    trackFunnel('email_added', { via: 'google', from: `prompt_${trigger}` });
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="false"
      aria-labelledby="secure-sheet-title"
      data-testid="secure-account-sheet"
      data-trigger={trigger}
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      className="fixed inset-x-3 bottom-24 z-[90] mx-auto max-w-md rounded-3xl border border-line bg-surface p-5 shadow-2xl lg:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.securePrompt.close}
        className="absolute right-3 top-3 rounded-full p-2 text-muted hover:bg-surface-raised"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="rounded-2xl bg-amber-100 p-2.5 dark:bg-amber-900/40">
          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 id="secure-sheet-title" className="text-base font-bold text-slate-900 dark:text-white">{copy.title}</h3>
          <p className="mt-1 text-sm text-muted">{copy.body}</p>
        </div>
      </div>

      {sent ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" data-testid="secure-sheet-sent">
          {t.secureSent}
        </p>
      ) : (
        <>
          <ul className="mt-3 space-y-1">
            {t.securePrompt.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                {b}
              </li>
            ))}
          </ul>

          <form onSubmit={submit} className="mt-4 space-y-2">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder={t.secureEmailLabel}
              aria-label={t.secureEmailLabel}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="secure-sheet-email"
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:text-white"
            />
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder={t.securePasswordLabel}
              aria-label={t.securePasswordLabel}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="secure-sheet-password"
              className="w-full rounded-xl border border-line bg-surface-raised px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:text-white"
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400" data-testid="secure-sheet-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {t.secureCta}
            </button>
          </form>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={google}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-70"
            >
              <img src={GoogleLogo} alt="" className="h-4 w-4" />
              Google
            </button>
            <button
              type="button"
              onClick={dismiss}
              data-testid="secure-sheet-later"
              className="rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-surface-raised"
            >
              {t.securePrompt.later}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

/**
 * Decides whether the sheet is due. Mounted once in App, it waits for a quiet
 * moment (no live drive, no tour or consent screen, a short delay so the lesson
 * or achievement animation finishes) before showing it.
 */
export function SecureAccountPrompt() {
  const authStatus = useAppStore((s) => s.authStatus);
  const isAnonymous = useAppStore((s) => s.authIsAnonymous);
  const lessons = useAppStore((s) => s.userProgress.completedLessons.length);
  const drives = useAppStore((s) => s.userProgress.drivingSessions.length);
  const acceptedPrivacy = useAppStore((s) => s.userProgress.hasAcceptedPrivacy);
  const onboarded = useAppStore((s) => s.hasCompletedOnboarding);
  const activeSession = useAppStore((s) => s.activeSession);
  // The first lesson usually unlocks "Getting Started"; its full-screen overlay goes first.
  const achievementPending = useAppStore((s) => s.recentAchievements.length > 0);
  const onTrial = useAppStore((s) => s.isOnTrial());
  const trialDaysLeft = useAppStore((s) => s.getRemainingTrialDays());
  const [open, setOpen] = useState<SecureTrigger | null>(null);

  const quiet = authStatus === 'signed_in' && isAnonymous && acceptedPrivacy && onboarded && !activeSession && !achievementPending;
  const due = quiet ? pickTrigger({ isAnonymous, lessons, drives, onTrial, trialDaysLeft }, readPromptState()) : null;

  useEffect(() => {
    if (!due || open) return;
    const timer = window.setTimeout(() => {
      markPromptShown(due);
      trackFunnel('secure_prompt_shown', { trigger: due });
      setOpen(due);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [due, open]);

  // A drive starting or the account getting an email closes the sheet.
  useEffect(() => {
    if (open && (!isAnonymous || activeSession)) setOpen(null);
  }, [open, isAnonymous, activeSession]);

  return open ? <SecureAccountSheet trigger={open} onClose={() => setOpen(null)} /> : null;
}

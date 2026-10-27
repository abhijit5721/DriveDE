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
 * closes it. The form (Google, email, code) is shared in SecureAccountForm; this
 * file also holds the inline card for the exam simulation and the prompt scheduler.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { trackFunnel } from '../../services/AnalyticsService';
import { markPromptDismissed, markPromptShown, pickTrigger, readPromptState, type SecureTrigger } from '../../utils/securePrompt';
import { SecureAccountForm } from './SecureAccountForm';

interface SheetProps {
  trigger: SecureTrigger;
  onClose: () => void;
  /** Called once the emailed code is confirmed (the paywall continues to checkout from here). */
  onSecured?: () => void;
  placement?: 'sheet' | 'paywall';
}

export function SecureAccountSheet({ trigger, onClose, onSecured, placement = 'sheet' }: SheetProps) {
  const language = useAppStore((s) => s.language);
  const t = TRANSLATIONS[language].account;
  const copy = t.securePrompt[trigger];

  useEffect(() => {
    trackFunnel('secure_prompt_shown', { trigger, placement });
  }, [trigger, placement]);

  const dismiss = () => {
    // 'checkout' is the user's own action: closing it buys no quiet period
    if (trigger !== 'checkout') markPromptDismissed();
    trackFunnel('secure_prompt_dismissed', { trigger });
    onClose();
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
      className="fixed inset-x-3 bottom-24 z-[90] mx-auto max-h-[80vh] max-w-md overflow-y-auto rounded-3xl border border-line bg-surface p-5 shadow-2xl lg:bottom-6"
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

      <div className="mt-4">
        <SecureAccountForm trigger={trigger} onSecured={onSecured} onLeave={onClose} />
      </div>
      <button
        type="button"
        onClick={dismiss}
        data-testid="secure-sheet-later"
        className="mt-2 w-full rounded-2xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-surface-raised"
      >
        {t.securePrompt.later}
      </button>
    </motion.div>
  );
}

/**
 * Inline card for the exam simulation, shown under the first result of an anonymous
 * user (trigger 'first_situation'). Not a floating sheet: it sits in the page flow and
 * is only decided once, when it mounts, so answering again does not bring it back.
 */
export function SecureInlineCard() {
  const language = useAppStore((s) => s.language);
  const isAnonymous = useAppStore((s) => s.authIsAnonymous);
  const t = TRANSLATIONS[language].account;
  const [visible, setVisible] = useState(() =>
    isAnonymous && pickTrigger({ isAnonymous, lessons: 0, drives: 0, onTrial: false, trialDaysLeft: 0, situationsAnswered: 1 }, readPromptState()) === 'first_situation');

  useEffect(() => {
    if (!visible) return;
    markPromptShown('first_situation');
    trackFunnel('secure_prompt_shown', { trigger: 'first_situation', placement: 'inline' });
  }, [visible]);

  // the account got its email while the card was open
  if (!visible || !isAnonymous) return null;
  const copy = t.securePrompt.first_situation;
  return (
    <section className="rounded-2xl border border-white/10 bg-white p-4 text-slate-900 shadow-lg" data-testid="secure-inline-card" data-trigger="first_situation">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-amber-100 p-2.5">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-base font-bold">{copy.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{copy.body}</p>
        </div>
      </div>
      <div className="mt-4">
        <SecureAccountForm trigger="first_situation" testPrefix="secure-inline" />
      </div>
      <button
        type="button"
        onClick={() => { markPromptDismissed(); trackFunnel('secure_prompt_dismissed', { trigger: 'first_situation' }); setVisible(false); }}
        data-testid="secure-inline-later"
        className="mt-2 w-full rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100"
      >
        {t.securePrompt.later}
      </button>
    </section>
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
  const trialEndsAt = useAppStore((s) => s.trialEndsAt);
  const isPremium = useAppStore((s) => s.isPremium);
  const [open, setOpen] = useState<SecureTrigger | null>(null);

  const quiet = authStatus === 'signed_in' && isAnonymous && acceptedPrivacy && onboarded && !activeSession && !achievementPending;
  // A trial that ran out (never reset or extended here); 'first_situation' is left to the inline card in the exam simulation.
  const trialExpired = !!trialEndsAt && !onTrial && !isPremium;
  const due = quiet ? pickTrigger({ isAnonymous, lessons, drives, onTrial, trialDaysLeft, trialExpired }, readPromptState()) : null;

  useEffect(() => {
    if (!due || open) return;
    const timer = window.setTimeout(() => {
      markPromptShown(due);
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

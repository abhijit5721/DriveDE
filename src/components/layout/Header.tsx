/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Moon, Sun, Globe, Crown, LogOut, Clock } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';

interface HeaderProps {
  onSignOut?: () => void;
  onTabChange?: (tab: any) => void;
}

export function Header({ onSignOut, onTabChange }: HeaderProps) {
  const {
    language, darkMode, setLanguage, toggleDarkMode, authStatus, authIsAnonymous,
    isProActive, isOnTrial, getRemainingTrialDays
  } = useAppStore();
  const t = TRANSLATIONS[language].common;
  const ta = TRANSLATIONS[language].account;

  const proActive = isProActive();
  // Trial users get a countdown instead of the crown — a PRO badge would imply
  // they own something they don't, and hides that access is running out.
  const onTrial = isOnTrial();
  const trialDaysLeft = getRemainingTrialDays();

  return (
    <header className="sticky top-0 z-40 bg-surface pt-safe border-b border-line lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3">
        {/* Name on top, status badges on the line below (in place of the subtitle): on a
            phone the name, trial badge, Gast badge and three icon buttons do not fit in
            one row, and the badges wrapped or slid under the globe button (26 Sep). */}
        <div className="flex min-w-0 items-center gap-3 text-left animate-fade-in-up">
          <button
            onClick={() => onTabChange?.('home')}
            className="flex-shrink-0 active:scale-95 transition-all"
            aria-label="Go to Home"
          >
            <Logo className="h-10 w-10" />
          </button>
          <div className="min-w-0">
            <button onClick={() => onTabChange?.('home')} tabIndex={-1} className="block">
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">DriveDE</h1>
            </button>
            <div className="mt-1 flex items-center gap-1.5">
                {onTrial ? (
                  <span
                    data-testid="trial-badge"
                    className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                  >
                    <Clock className="h-2.5 w-2.5" />
                    <span className="notranslate">
                      {language === 'de' ? `TEST · ${trialDaysLeft}T` : `TRIAL · ${trialDaysLeft}d`}
                    </span>
                  </span>
                ) : proActive ? (
                  <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                    <Crown className="h-2.5 w-2.5" />
                    <span className="notranslate">PRO</span>
                  </span>
                ) : null}
              {/* DRI-60: an anonymous account is one browser wipe away from being lost;
                  this badge is the always-available way to the Konto form. */}
              {authStatus === 'signed_in' && authIsAnonymous && (
                <button
                  onClick={() => onTabChange?.('account')}
                  data-testid="guest-badge"
                  aria-label={ta.guestBadgeLabel}
                  className="shrink-0 whitespace-nowrap rounded-full border border-amber-400/60 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 active:scale-95 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  {ta.guestBadge}
                </button>
              )}
              {!onTrial && !proActive && !(authStatus === 'signed_in' && authIsAnonymous) && (
                <p className="truncate text-[11px] font-bold text-muted uppercase tracking-widest">
                  {t.appSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            aria-label={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-raised text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 border border-line shadow-sm"
          >
            <Globe className="h-5 w-5" />
          </button>

          {authStatus === 'signed_in' && (
            <button
              onClick={onSignOut}
              aria-label={t.nav.signOut}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-raised text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 border border-line shadow-sm"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? t.nav.lightMode : t.nav.darkMode}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-raised text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 border border-line shadow-sm"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}

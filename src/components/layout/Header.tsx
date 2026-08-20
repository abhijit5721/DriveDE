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
    language, darkMode, setLanguage, toggleDarkMode, authStatus,
    isProActive, isOnTrial, getRemainingTrialDays
  } = useAppStore();
  const t = TRANSLATIONS[language].common;

  const proActive = isProActive();
  // Trial users get a countdown instead of the crown — a PRO badge would imply
  // they own something they don't, and hides that access is running out.
  const onTrial = isOnTrial();
  const trialDaysLeft = getRemainingTrialDays();

  return (
    <header className="sticky top-0 z-40 bg-surface pt-safe border-b border-line lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-left animate-fade-in-up">
          <button
            onClick={() => onTabChange?.('home')}
            className="group flex items-center gap-3 active:scale-95 transition-all"
            aria-label="Go to Home"
          >
            <Logo className="h-10 w-10 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">DriveDE</h1>
                {onTrial ? (
                  <span
                    data-testid="trial-badge"
                    className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm"
                  >
                    <Clock className="h-2.5 w-2.5" />
                    <span className="notranslate">
                      {language === 'de' ? `TEST · ${trialDaysLeft}T` : `TRIAL · ${trialDaysLeft}d`}
                    </span>
                  </span>
                ) : proActive ? (
                  <span className="flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                    <Crown className="h-2.5 w-2.5" />
                    <span className="notranslate">PRO</span>
                  </span>
                ) : null}
              </div>
              <p className="truncate text-[11px] font-bold text-muted uppercase tracking-widest mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </button>
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
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 border border-line shadow-sm"
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

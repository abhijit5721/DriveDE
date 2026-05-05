/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Moon, Sun, Globe, Crown, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

interface HeaderProps {
  onSignOut?: () => void;
  onTabChange?: (tab: any) => void;
}

export function Header({ onSignOut, onTabChange }: HeaderProps) {
  const { language, darkMode, setLanguage, toggleDarkMode, isPremium, authStatus } = useAppStore();
  const t = TRANSLATIONS[language].common;

  return (
    <header className="sticky top-0 z-40 glass pt-safe border-b border-white/10 dark:border-white/5 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-left animate-fade-in-up">
          <button
            onClick={() => onTabChange?.('home')}
            className="group flex items-center gap-3 focus:outline-none active:scale-95 transition-all"
            aria-label="Go to Home"
          >
            <div className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3',
              isPremium 
                ? 'bg-premium-gold shadow-orange-500/20' 
                : 'bg-premium-blue shadow-blue-500/20'
            )}>
              {isPremium ? (
                <Crown className="h-6 w-6 text-white" />
              ) : (
                <span className="text-xl">🚗</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">DriveDE</h1>
                {isPremium && (
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
                    <Crown className="h-2.5 w-2.5" />
                    PRO
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-80 mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </button>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all hover:bg-white/20 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 border border-white/20 dark:border-white/5 shadow-sm"
          >
            <Globe className="h-5 w-5" />
          </button>

          {authStatus === 'signed_in' && (
            <button
              onClick={onSignOut}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all hover:scale-110 active:scale-95 border border-white/20 dark:border-white/5 shadow-sm"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all hover:bg-white/20 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 border border-white/20 dark:border-white/5 shadow-sm"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-blue-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}

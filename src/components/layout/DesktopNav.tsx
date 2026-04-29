/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Home, BookOpen, Wrench, ClipboardList, User, Star, Trophy, Sun, Moon, Crown, Wallet, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { TabType } from '../../types';
import { TRANSLATIONS } from '../../data/translations';

interface DesktopNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSignOut?: () => void;
}

export function DesktopNav({ activeTab, onTabChange, onSignOut }: DesktopNavProps) {
  const { language, setLanguage, darkMode, toggleDarkMode, isPremium, userProgress, authStatus } = useAppStore();
  const t = TRANSLATIONS[language as 'de' | 'en'];

  const navItems = [
    { id: 'home', label: t.common.nav.home, icon: Home },
    { id: 'curriculum', label: t.common.nav.curriculum, icon: BookOpen },
    { id: 'maneuvers', label: t.common.nav.maneuvers, icon: Wrench },
    { id: 'achievements', label: t.common.nav.achievements, icon: Trophy },
    { id: 'tracker', label: t.common.nav.tracker, icon: ClipboardList },
    { id: 'finance', label: t.common.nav.finance, icon: Wallet },
    { id: 'review', label: t.common.nav.review, icon: Star },
    { id: 'account', label: t.common.nav.account, icon: User },
  ] as const;

  const mistakesCount = (userProgress.incorrectQuestions || []).length;

  return (
    <aside 
      role="navigation"
      aria-label={t.common.nav.mainNav}
      className="hidden lg:flex flex-col h-screen w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 glass sticky top-0"
    >
      <div className="p-6">
        <button 
          onClick={() => onTabChange('home')}
          className="group flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none"
          aria-label="Go to Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-premium-blue text-white shadow-lg shadow-blue-500/20">
            <Crown className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">DriveDE</h2>
              {isPremium && (
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-black text-white shadow-lg shadow-orange-500/20">
                  <Crown className="h-2.5 w-2.5" />
                  PRO
                </span>
              )}
            </div>
          </div>
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-1.5" role="tablist">
          {navItems.map((item, index) => (
            <li key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <button
                role="tab"
                aria-selected={activeTab === item.id}
                aria-label={item.label}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center w-full gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-all duration-300 group
                  ${activeTab === item.id
                    ? 'bg-premium-blue text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:translate-x-1'
                  }`}
              >
                <div className="relative">
                  <item.icon className={`h-5 w-5 transition-colors duration-300 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
                  {item.id === 'review' && mistakesCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                      {mistakesCount}
                    </span>
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {activeTab === item.id && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex flex-col gap-3">
          {isPremium && (
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 animate-pulse-slow">
              <Crown className="h-4 w-4" />
              DriveDE Pro Member
            </div>
          )}

          <div 
            className="flex p-1 glass-card rounded-xl"
            role="group"
            aria-label={t.common.nav.languageSelect}
          >
            <button
              onClick={() => setLanguage('de')}
              aria-label="Auf Deutsch wechseln"
              aria-pressed={language === 'de'}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                language === 'de'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLanguage('en')}
              aria-label="Switch to English"
              aria-pressed={language === 'en'}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={toggleDarkMode}
            aria-label={darkMode ? t.common.nav.lightMode : t.common.nav.darkMode}
            className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-white/50 dark:text-slate-400 dark:hover:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-600" />
              )}
              {darkMode ? t.common.nav.lightMode : t.common.nav.darkMode}
            </div>
          </button>
          
          {authStatus === 'signed_in' && (
            <button
              onClick={onSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              {t.common.nav.signOut}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

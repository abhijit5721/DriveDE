/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Home, BookOpen, ParkingSquare, Trophy, ClipboardList, UserRound, Wallet } from 'lucide-react';
import type { TabType } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language as 'de' | 'en'];

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.common.nav.home, icon: <Home className="h-5 w-5" /> },
    { id: 'curriculum', label: t.common.nav.curriculum, icon: <BookOpen className="h-5 w-5" /> },
    { id: 'maneuvers', label: t.common.nav.maneuvers, icon: <ParkingSquare className="h-5 w-5" /> },
    { id: 'achievements', label: t.common.nav.achievements, icon: <Trophy className="h-5 w-5" /> },
    { id: 'tracker', label: t.common.nav.tracker, icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'finance', label: t.common.nav.finance, icon: <Wallet className="h-5 w-5" /> },
    { id: 'account', label: t.common.nav.account, icon: <UserRound className="h-5 w-5" /> },
  ];

  return (
    <nav 
      role="navigation"
      aria-label={t.common.nav.mobileNav}
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 dark:border-white/5 pb-safe"
    >
      <div className="px-1 pt-2 pb-1">
        <div className="flex items-center justify-around" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id || (tab.id === 'tracker' && activeTab === 'history')}
              aria-label={tab.label}
              data-testid={tab.id === 'tracker' ? 'nav-tracker' : tab.id === 'account' ? 'nav-account' : undefined}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'group relative flex flex-1 flex-col items-center gap-1 transition-all duration-300 py-1 active:scale-90',
                activeTab === tab.id || (tab.id === 'tracker' && activeTab === 'history')
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-500 ease-spring',
                  (activeTab === tab.id || (tab.id === 'tracker' && activeTab === 'history'))
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110 -translate-y-1' 
                    : 'bg-white/5 dark:bg-slate-800/40'
                )}
              >
                <div className={cn(
                  'transition-transform duration-300',
                  (activeTab === tab.id || (tab.id === 'tracker' && activeTab === 'history')) ? 'scale-110' : 'group-hover:scale-110'
                )}>
                  {tab.icon}
                </div>
              </div>
              <span className={cn(
                'text-[8px] font-black uppercase tracking-widest transition-all duration-300 leading-none',
                (activeTab === tab.id || (tab.id === 'tracker' && activeTab === 'history')) ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-75'
              )}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

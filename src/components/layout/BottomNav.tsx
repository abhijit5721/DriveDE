/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Home, BookOpen, ParkingSquare, Trophy, ClipboardList, UserRound, Star, Wallet } from 'lucide-react';
import type { TabType } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { language, userProgress } = useAppStore();
  const t = TRANSLATIONS[language as 'de' | 'en'];
  const mistakesCount = (userProgress.incorrectQuestions || []).length;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.common.nav.home, icon: <Home className="h-5 w-5" /> },
    { id: 'curriculum', label: t.common.nav.curriculum, icon: <BookOpen className="h-5 w-5" /> },
    { id: 'maneuvers', label: t.common.nav.maneuvers, icon: <ParkingSquare className="h-5 w-5" /> },
    { id: 'achievements', label: t.common.nav.achievements, icon: <Trophy className="h-5 w-5" /> },
    { id: 'review', label: t.common.nav.review, icon: <Star className="h-5 w-5" /> },
    { id: 'tracker', label: t.common.nav.tracker, icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'finance', label: t.common.nav.finance, icon: <Wallet className="h-5 w-5" /> },
    { id: 'account', label: t.common.nav.account, icon: <UserRound className="h-5 w-5" /> },
  ];

  return (
    <nav 
      role="navigation"
      aria-label={t.common.nav.mobileNav}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/50 glass dark:border-slate-800/50"
    >
      <div className="px-0.5 pt-1" style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-1 min-w-0 flex-col items-center gap-0.5 transition-all duration-300 py-1 px-0',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              <div
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
                  activeTab === tab.id ? 'bg-blue-100/50 dark:bg-blue-900/30 scale-110' : 'bg-transparent'
                )}
              >
                {tab.icon}
                {tab.id === 'review' && mistakesCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-950">
                    {mistakesCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[7px] font-black uppercase tracking-tighter whitespace-nowrap transition-all duration-300 px-0.5',
                activeTab === tab.id ? 'opacity-100 h-auto translate-y-0' : 'opacity-0 h-0 translate-y-1'
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

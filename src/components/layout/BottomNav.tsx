/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Home, BookOpen, ParkingSquare, ClipboardList, UserRound, Star, Wallet } from 'lucide-react';
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
      <div className="px-1 pt-1" style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-around" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-1 min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-all duration-300',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 scale-105'
                  : 'text-slate-500 dark:text-slate-500'
              )}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center rounded-xl p-1.5 transition-all duration-300',
                  activeTab === tab.id ? 'bg-blue-100/50 dark:bg-blue-900/30' : 'bg-transparent'
                )}
              >
                {tab.icon}
                {tab.id === 'review' && mistakesCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {mistakesCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full text-center transition-opacity duration-300',
                activeTab === tab.id ? 'opacity-100' : 'opacity-70'
              )}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="h-1 w-1 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

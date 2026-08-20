/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Home, BookOpen, ParkingSquare, ClipboardList, UserRound } from 'lucide-react';
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

  // 5 destinations with always-visible labels. Achievements and Finance are
  // reachable from Account (and the dashboard cards); 7 icon-only tabs at
  // 390px forced users to memorize glyphs.
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t.common.nav.home, icon: <Home className="h-5 w-5" /> },
    { id: 'curriculum', label: t.common.nav.curriculum, icon: <BookOpen className="h-5 w-5" /> },
    { id: 'maneuvers', label: t.common.nav.maneuvers, icon: <ParkingSquare className="h-5 w-5" /> },
    { id: 'tracker', label: t.common.nav.tracker, icon: <ClipboardList className="h-5 w-5" /> },
    { id: 'account', label: t.common.nav.account, icon: <UserRound className="h-5 w-5" /> },
  ];

  return (
    <nav
      role="navigation"
      aria-label={t.common.nav.mobileNav}
      data-tour="nav"
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-line pb-safe"
    >
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id || (tab.id === 'tracker' && activeTab === 'history');
          return (
            <button
              key={tab.id}
              aria-current={active ? 'page' : undefined}
              aria-label={tab.label}
              data-testid={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition-colors',
                active
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                  : 'text-muted hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              {tab.icon}
              <span className="text-xs font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { Home, BookOpen, ParkingSquare, ClipboardList, UserRound, Trophy, Star } from 'lucide-react';
import type { TabType } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; labelDe: string; labelEn: string; icon: React.ReactNode }[] = [
  { id: 'home', labelDe: 'Start', labelEn: 'Home', icon: <Home className="h-5 w-5" /> },
  { id: 'curriculum', labelDe: 'Plan', labelEn: 'Plan', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'review', labelDe: 'Review', labelEn: 'Review', icon: <Star className="h-5 w-5" /> },
  { id: 'tracker', labelDe: 'Log', labelEn: 'Log', icon: <ClipboardList className="h-5 w-5" /> },
  { id: 'account', labelDe: 'Konto', labelEn: 'Account', icon: <UserRound className="h-5 w-5" /> },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { language, userProgress } = useAppStore();
  const isDE = language === 'de';
  const mistakesCount = (userProgress.incorrectQuestions || []).length;

  return (
    <nav 
      role="navigation"
      aria-label={isDE ? 'Mobile Navigation' : 'Mobile Navigation'}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/95"
    >
      <div className="overflow-x-auto px-2 py-2 scrollbar-hide">
        <div className="flex min-w-max items-center justify-around gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={isDE ? tab.labelDe : tab.labelEn}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-200',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center rounded-lg p-1.5 transition-all duration-200',
                  activeTab === tab.id && 'bg-blue-100 dark:bg-blue-900/50'
                )}
              >
                {tab.icon}
                {tab.id === 'review' && mistakesCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {mistakesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">
                {isDE ? tab.labelDe : tab.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

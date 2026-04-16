import { Home, BookOpen, ParkingSquare, ClipboardList, UserRound, Trophy } from 'lucide-react';
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
  { id: 'achievements', labelDe: 'Erfolge', labelEn: 'Awards', icon: <Trophy className="h-5 w-5" /> },
  { id: 'tracker', labelDe: 'Log', labelEn: 'Log', icon: <ClipboardList className="h-5 w-5" /> },
  { id: 'account', labelDe: 'Konto', labelEn: 'Account', icon: <UserRound className="h-5 w-5" /> },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const language = useAppStore((state) => state.language);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/95">
      <div className="overflow-x-auto px-2 py-2 scrollbar-hide">
        <div className="flex min-w-max items-center justify-start gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-200',
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-lg p-1.5 transition-all duration-200',
                  activeTab === tab.id && 'bg-blue-100 dark:bg-blue-900/50'
                )}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium whitespace-nowrap">
                {language === 'de' ? tab.labelDe : tab.labelEn}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

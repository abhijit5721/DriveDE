import { Home, BookOpen, Wrench, ClipboardList, User, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { TabType } from '../types';

interface DesktopNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function DesktopNav({ activeTab, onTabChange }: DesktopNavProps) {
  const { language } = useAppStore();
  const isDE = language === 'de';

  const navItems = [
    { id: 'home', label: isDE ? 'Übersicht' : 'Dashboard', icon: Home },
    { id: 'curriculum', label: isDE ? 'Lehrplan' : 'Curriculum', icon: BookOpen },
    { id: 'maneuvers', label: isDE ? 'Manöver' : 'Maneuvers', icon: Wrench },
    { id: 'tracker', label: isDE ? 'Fahrtenbuch' : 'Tracker', icon: ClipboardList },
    { id: 'review', label: isDE ? 'Review' : 'Review', icon: Star },
    { id: 'account', label: isDE ? 'Konto' : 'Account', icon: User },
  ] as const;

  return (
    <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800">
      <div className="p-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">DriveDE</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`flex items-center w-full gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors
                  ${activeTab === item.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

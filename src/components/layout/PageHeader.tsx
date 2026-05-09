/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
}

export function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass pt-safe border-b border-white/10 dark:border-white/5">
      <div className="flex items-center gap-4 p-4 lg:px-6">
        <button
          onClick={onBack}
          className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 transition-all hover:bg-white/20 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 border border-white/20 dark:border-white/5 shadow-sm"
        >
          <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <h1 className="flex-1 line-clamp-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none animate-fade-in-up">
          {title}
        </h1>
      </div>
    </header>
  );
}

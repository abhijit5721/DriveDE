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
    <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-slate-200 bg-white/95 p-4 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/95">
      <button
        onClick={onBack}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 truncate text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h1>
    </header>
  );
}

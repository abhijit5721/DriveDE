/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Shield, FileText, Scale, Building2, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';

interface LegalHubProps {
  onOpenPage: (page: 'privacy' | 'terms' | 'gdpr' | 'impressum' | 'disclaimer') => void;
}

export function LegalHub({ onOpenPage }: LegalHubProps) {
  const language = useAppStore((state) => state.language);
  const t = TRANSLATIONS[language];

  const items = [
    {
      id: 'privacy' as const,
      icon: Shield,
      title: t.legal.privacy,
      subtitle: t.legal.hub.items.privacy,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      id: 'terms' as const,
      icon: FileText,
      title: t.legal.terms,
      subtitle: t.legal.hub.items.terms,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    {
      id: 'gdpr' as const,
      icon: Scale,
      title: t.legal.gdpr,
      subtitle: t.legal.hub.items.gdpr,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      id: 'impressum' as const,
      icon: Building2,
      title: t.legal.impressum,
      subtitle: t.legal.hub.items.impressum,
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
      id: 'disclaimer' as const,
      icon: AlertTriangle,
      title: t.legal.disclaimer,
      subtitle: t.legal.hub.items.disclaimer,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Scale className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.legal.hub.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t.legal.hub.desc}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onOpenPage(item.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.subtitle}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

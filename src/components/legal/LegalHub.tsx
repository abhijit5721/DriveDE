import { Shield, FileText, Scale, Building2, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface LegalHubProps {
  onOpenPage: (page: 'privacy' | 'terms' | 'gdpr' | 'impressum' | 'disclaimer') => void;
}

export function LegalHub({ onOpenPage }: LegalHubProps) {
  const language = useAppStore((state) => state.language);
  const isDE = language === 'de';

  const items = [
    {
      id: 'privacy' as const,
      icon: Shield,
      title: isDE ? 'Datenschutzerklärung' : 'Privacy Policy',
      subtitle: isDE
        ? 'Wie Daten verarbeitet, gespeichert und geschützt werden'
        : 'How data is processed, stored, and protected',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      id: 'terms' as const,
      icon: FileText,
      title: isDE ? 'AGB / Nutzungsbedingungen' : 'Terms & Conditions',
      subtitle: isDE
        ? 'Regeln für Nutzung, Haftung und Inhalte'
        : 'Rules for usage, liability, and content',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    {
      id: 'gdpr' as const,
      icon: Scale,
      title: isDE ? 'DSGVO & Betroffenenrechte' : 'GDPR & Data Rights',
      subtitle: isDE
        ? 'Auskunft, Löschung, Berichtigung und Datenexport'
        : 'Access, deletion, rectification, and data export rights',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      id: 'impressum' as const,
      icon: Building2,
      title: isDE ? 'Impressum' : 'Imprint / Legal Notice',
      subtitle: isDE
        ? 'Anbieterkennzeichnung nach deutschem Recht'
        : 'Provider and legal notice information under German law',
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
      id: 'disclaimer' as const,
      icon: AlertTriangle,
      title: isDE ? 'Haftungsausschluss & Sicherheitshinweis' : 'Disclaimer & Safety Notice',
      subtitle: isDE
        ? 'Wichtige Hinweise zur Nutzung der App'
        : 'Important usage and safety limitations of the app',
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
              {isDE ? 'Rechtliches & Datenschutz' : 'Legal & Privacy'}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {isDE
                ? 'Diese Seite bündelt die wichtigsten rechtlichen Informationen für einen Beta- oder Launch-Betrieb in Deutschland und der EU. Bitte ergänze vor Veröffentlichung deine echten Kontaktdaten und finalen Unternehmensangaben.'
                : 'This page bundles the key legal information needed for beta or launch operation in Germany and the EU. Before publishing, replace placeholders with your real contact and company details.'}
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

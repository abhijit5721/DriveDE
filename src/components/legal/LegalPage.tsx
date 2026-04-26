/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Mail, MapPin, Phone, Shield, FileText, Scale, Building2, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { PageHeader } from '../layout/PageHeader';
import { TRANSLATIONS } from '../../data/translations';

interface LegalPageProps {
  page: 'privacy' | 'terms' | 'gdpr' | 'impressum' | 'disclaimer';
  onBack: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

export function LegalPage({ page, onBack }: LegalPageProps) {
  const language = useAppStore((state) => state.language);
  const t = TRANSLATIONS[language];
  const lc = t.legal.legalContent;

  const pageMeta = {
    privacy: {
      title: t.legal.privacy,
      icon: Shield,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    terms: {
      title: t.legal.terms,
      icon: FileText,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
    gdpr: {
      title: t.legal.gdpr,
      icon: Scale,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    impressum: {
      title: t.legal.impressum,
      icon: Building2,
      color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
    disclaimer: {
      title: t.legal.disclaimer,
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    },
  }[page];

  const Icon = pageMeta.icon;

  const renderContent = () => {
    switch (page) {
      case 'privacy':
        return (
          <div className="space-y-4">
            <Section title={t.legal.sections.controller}>
              <p>{t.legal.placeholders.controller}</p>
            </Section>
            <Section title={t.legal.sections.processedData}>
              <ul className="list-disc space-y-2 pl-5">
                {lc.privacy.processedData.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Section>
            <Section title={t.legal.sections.purpose}>
              <p>{lc.privacy.purpose}</p>
            </Section>
            <Section title={t.legal.sections.storage}>
              <p>{lc.privacy.storage}</p>
            </Section>
            <Section title={t.legal.sections.legalBases}>
              <ul className="list-disc space-y-2 pl-5">
                {lc.privacy.legalBases.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Section>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4">
            <Section title={t.legal.sections.scope}>
              <p>{lc.terms.scope}</p>
            </Section>
            <Section title={t.legal.sections.noSubstitute}>
              <p>{lc.terms.noSubstitute}</p>
            </Section>
            <Section title={t.legal.sections.useOfContent}>
              <p>{lc.terms.useOfContent}</p>
            </Section>
            <Section title={t.legal.sections.availability}>
              <p>{lc.terms.availability}</p>
            </Section>
            <Section title={t.legal.sections.limitation}>
              <p>{lc.terms.limitation}</p>
            </Section>
          </div>
        );
      case 'gdpr':
        return (
          <div className="space-y-4">
            <Section title={t.legal.sections.yourRights}>
              <ul className="list-disc space-y-2 pl-5">
                {lc.gdpr.yourRights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </Section>
            <Section title={t.legal.sections.howToExercise}>
              <p>{lc.gdpr.howToExercise}</p>
            </Section>
            <Section title={t.legal.sections.complaint}>
              <p>{lc.gdpr.complaint}</p>
            </Section>
          </div>
        );
      case 'impressum':
        return (
          <div className="space-y-4">
            <Section title={t.legal.sections.provider}>
              <p>{t.legal.placeholders.imprint}</p>
            </Section>
            <Section title={t.legal.sections.contact}>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Musterstraße 1, 10115 Berlin</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@drivede.app</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />+49 30 00000000</div>
              </div>
            </Section>
            <Section title={t.legal.sections.notice}>
              <p>{t.legal.placeholders.notice}</p>
            </Section>
          </div>
        );
      case 'disclaimer':
        return (
          <div className="space-y-4">
            <Section title={t.legal.sections.safety}>
              <p>{lc.disclaimer.safety}</p>
            </Section>
            <Section title={t.legal.sections.noGuarantee}>
              <p>{lc.disclaimer.noGuarantee}</p>
            </Section>
            <Section title={t.legal.sections.sources}>
              <p>{lc.disclaimer.sources}</p>
            </Section>
          </div>
        );
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <PageHeader title={pageMeta.title} onBack={onBack} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 mt-4">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pageMeta.color}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{pageMeta.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t.legal.placeholders.launchReady}
            </p>
          </div>
        </div>
      </section>

      {renderContent()}
    </div>
  );
}

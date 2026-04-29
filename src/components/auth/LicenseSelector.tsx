/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import React, { useMemo } from 'react';
import { Car, Cog, Zap, CheckCircle, ArrowRight, BadgeCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { cn } from '../../utils/cn';

export const LicenseSelector: React.FC = () => {
  const {
    learningPath,
    transmissionType,
    setLearningPath,
    setTransmissionType,
    setLicenseType,
    language,
  } = useAppStore();

  const t = TRANSLATIONS[language].licenseSelector;

  const canContinue = useMemo(() => {
    return Boolean(learningPath && transmissionType);
  }, [learningPath, transmissionType]);

  const handleContinue = () => {
    if (!learningPath || !transmissionType) return;

    if (learningPath === 'umschreibung') {
      setLicenseType(transmissionType === 'manual' ? 'umschreibung-manual' : 'umschreibung-automatic');
      return;
    }

    setLicenseType(transmissionType);
  };

  return (
    <div className="py-2">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.pathTitle.split('.')[1]?.trim() || t.pathTitle}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={cn(
            'h-1.5 flex-1 rounded-full transition-colors duration-500',
            learningPath ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
          )} />
          <div className={cn(
            'h-1.5 flex-1 rounded-full transition-colors duration-500',
            transmissionType ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
          )} />
        </div>
      </div>

      <div className="grid gap-8">
        {/* Step 1: Learning Path */}
        <section>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => {
                setLearningPath('standard');
                setTransmissionType(null);
              }}
              className={cn(
                'group relative rounded-3xl border-2 p-6 text-left transition-all duration-300',
                learningPath === 'standard'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xl dark:bg-blue-900/10'
                  : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              {learningPath === 'standard' && (
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30">
                <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">{t.standard.title}</h3>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.standard.description}</p>
              
              <div className="space-y-2">
                {t.standard.features.map((feature: string) => (
                  <div key={feature} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </button>

            <button
              onClick={() => {
                setLearningPath('umschreibung');
                setTransmissionType(null);
              }}
              className={cn(
                'group relative rounded-3xl border-2 p-6 text-left transition-all duration-300',
                learningPath === 'umschreibung'
                  ? 'border-purple-600 bg-purple-50/50 shadow-xl dark:bg-purple-900/10'
                  : 'border-slate-200 bg-white hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              {learningPath === 'umschreibung' && (
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30">
                <BadgeCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">{t.conversion.title}</h3>
              <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.conversion.description}</p>
              
              <div className="space-y-2">
                {t.conversion.features.map((feature: string) => (
                  <div key={feature} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          </div>
        </section>

        {/* Step 2: Transmission */}
        <section className={cn(
          'transition-all duration-500',
          !learningPath ? 'pointer-events-none opacity-40 grayscale' : 'opacity-100'
        )}>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.transmissionTitle.split('.')[1]?.trim() || t.transmissionTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {learningPath === 'umschreibung' ? t.conversionNote : t.standardNote}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => setTransmissionType('manual')}
              className={cn(
                'group relative rounded-3xl border-2 p-6 text-left transition-all duration-300',
                transmissionType === 'manual'
                  ? 'border-orange-500 bg-orange-50/50 shadow-xl dark:bg-orange-900/10'
                  : 'border-slate-200 bg-white hover:border-orange-300 dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              {transmissionType === 'manual' && (
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
                <Cog className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{t.manual.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.manual.description}</p>
            </button>

            <button
              onClick={() => setTransmissionType('automatic')}
              className={cn(
                'group relative rounded-3xl border-2 p-6 text-left transition-all duration-300',
                transmissionType === 'automatic'
                  ? 'border-blue-500 bg-blue-50/50 shadow-xl dark:bg-blue-900/10'
                  : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              {transmissionType === 'automatic' && (
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">{t.automatic.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.automatic.description}</p>
            </button>
          </div>
        </section>

        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <button
            onClick={() => useAppStore.getState().setLanguage(language === 'de' ? 'en' : 'de')}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <span>{language === 'de' ? '🇬🇧 English' : '🇩🇪 Deutsch'}</span>
          </button>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={cn(
              'flex items-center gap-2 rounded-2xl px-8 py-4 text-lg font-black transition-all active:scale-95',
              canContinue
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
                : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800'
            )}
          >
            {t.continue}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

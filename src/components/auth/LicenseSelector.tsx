/**
 * (c) 2026 DriveDE. All rights reserved.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Cog, Zap, CheckCircle, ArrowRight, Shield, Globe } from 'lucide-react';
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
    <div className="flex min-h-[80vh] flex-col justify-between px-2 pb-10 pt-4">
      <div className="space-y-10">
        {/* Header Section */}
        <header className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20"
          >
            <Shield className="h-7 w-7" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.pathTitle.split('.')[1]?.trim() || t.pathTitle}
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
        </header>

        {/* Step 1: Learning Path Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              id: 'standard',
              title: t.standard.title,
              desc: t.standard.description,
              icon: Car,
              features: t.standard.features,
              color: 'blue'
            },
            {
              id: 'umschreibung',
              title: t.conversion.title,
              desc: t.conversion.description,
              icon: Globe,
              features: t.conversion.features,
              color: 'purple'
            }
          ].map((path, idx) => (
            <motion.button
              key={path.id}
              data-testid={`path-${path.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setLearningPath(path.id as any);
                setTransmissionType(null);
              }}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-[2.5rem] border-2 p-8 text-left transition-all duration-500',
                learningPath === path.id
                  ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10'
                  : 'border-slate-100 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl transition-colors',
                  learningPath === path.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                )}>
                  <path.icon className="h-8 w-8" />
                </div>
                {learningPath === path.id && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </motion.div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{path.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{path.desc}</p>
              </div>

              <AnimatePresence>
                {learningPath === path.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-6 space-y-2 overflow-hidden"
                  >
                    {path.features.slice(0, 2).map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {f}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Step 2: Transmission Type Selection */}
        <AnimatePresence>
          {learningPath && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {t.transmissionTitle.split('.')[1]?.trim() || t.transmissionTitle}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {learningPath === 'umschreibung' ? t.conversionNote : t.standardNote}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: 'manual', title: t.manual.title, icon: Cog, color: 'orange' },
                  { id: 'automatic', title: t.automatic.title, icon: Zap, color: 'blue' }
                ].map((type) => (
                  <button
                    key={type.id}
                    data-testid={`${type.id}-btn`}
                    onClick={() => setTransmissionType(type.id as any)}
                    className={cn(
                      'flex items-center gap-4 rounded-[1.75rem] border-2 p-5 transition-all duration-300',
                      transmissionType === type.id
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                        : 'border-slate-100 bg-white hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900'
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl',
                      transmissionType === type.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                    )}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <span className={cn(
                      'font-bold',
                      transmissionType === type.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                    )}>
                      {type.title}
                    </span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <footer className="mt-12 flex items-center justify-between gap-6">
        <button
          onClick={() => useAppStore.getState().setLanguage(language === 'de' ? 'en' : 'de')}
          className="rounded-2xl bg-slate-100 px-6 py-4 text-sm font-bold uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-400"
        >
          {language === 'de' ? 'EN' : 'DE'}
        </button>

        <button
          onClick={handleContinue}
          data-testid="license-continue-btn"
          disabled={!canContinue}
          className={cn(
            'flex flex-1 items-center justify-center gap-3 rounded-[1.75rem] py-5 text-lg font-bold transition-all active:scale-95',
            canContinue
              ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02]'
              : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800'
          )}
        >
          {t.continue}
          <ArrowRight className="h-6 w-6" />
        </button>
      </footer>
    </div>
  );
};

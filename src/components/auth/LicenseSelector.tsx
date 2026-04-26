/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import React, { useMemo } from 'react';
import { Car, Cog, Zap, CheckCircle, Info, ArrowRight, BadgeCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl bg-white/10 backdrop-blur-sm p-5 md:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">{t.pathTitle}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setLearningPath('standard');
                  setTransmissionType(null);
                }}
                aria-label={t.standard.title}
                aria-pressed={learningPath === 'standard'}
                className={`relative rounded-2xl bg-white p-6 text-left transition-all duration-300 ${
                  learningPath === 'standard' ? 'ring-4 ring-green-500 shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {learningPath === 'standard' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Car className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t.standard.title}</h3>
                    <p className="text-sm text-gray-500">{t.standard.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-600">{t.standard.description}</p>
                <div className="mt-4 space-y-2">
                  {t.standard.features.map((feature: string) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
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
                aria-label={t.conversion.title}
                aria-pressed={learningPath === 'umschreibung'}
                className={`relative rounded-2xl bg-white p-6 text-left transition-all duration-300 ${
                  learningPath === 'umschreibung' ? 'ring-4 ring-green-500 shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
              >
                {learningPath === 'umschreibung' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <BadgeCheck className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t.conversion.title}</h3>
                    <p className="text-sm text-gray-500">{t.conversion.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-600">{t.conversion.description}</p>
                <div className="mt-4 space-y-2">
                  {t.conversion.features.map((feature: string) => (
                    <div key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 md:p-6 shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">{t.transmissionTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {learningPath === 'umschreibung' ? t.conversionNote : t.standardNote}
              </p>
              {!learningPath && (
                <p className="mt-2 text-xs font-medium text-amber-600">
                  {t.choosePathFirst}
                </p>
              )}
            </div>

            <div className={`grid md:grid-cols-2 gap-4 ${!learningPath ? 'pointer-events-none opacity-50' : ''}`}>
              <button
                onClick={() => setTransmissionType('manual')}
                aria-label={t.manual.title}
                aria-pressed={transmissionType === 'manual'}
                className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                  transmissionType === 'manual'
                    ? 'border-orange-500 bg-orange-50 shadow-lg'
                    : 'border-slate-200 hover:border-orange-300'
                }`}
              >
                {transmissionType === 'manual' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Cog className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t.manual.title}</h3>
                    <p className="text-sm text-gray-500">{t.manual.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-600">{t.manual.description}</p>
              </button>

              <button
                onClick={() => setTransmissionType('automatic')}
                aria-label={t.automatic.title}
                aria-pressed={transmissionType === 'automatic'}
                className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                  transmissionType === 'automatic'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {transmissionType === 'automatic' && (
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{t.automatic.title}</h3>
                    <p className="text-sm text-gray-500">{t.automatic.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-600">{t.automatic.description}</p>
              </button>
            </div>
          </section>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 my-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
            <p className="text-blue-100 text-sm">
              {learningPath === 'umschreibung' ? t.conversionNote : t.standardNote}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-4 font-bold transition-all ${
              canContinue
                ? 'bg-white text-blue-700 shadow-lg hover:scale-[1.02]'
                : 'bg-white/20 text-white/60 cursor-not-allowed'
            }`}
          >
            {t.continue}
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => useAppStore.getState().setLanguage(language === 'de' ? 'en' : 'de')}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span className="text-xl">{language === 'de' ? '🇬🇧' : '🇩🇪'}</span>
            <span>{language === 'de' ? t.switchToEnglish : t.switchToGerman}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

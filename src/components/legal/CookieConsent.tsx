/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Check, X, Cookie } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { cn } from '../../utils/cn';

export function CookieConsent() {
  const { language, cookieSettings, setCookieSettings } = useAppStore();
  const [showDetails, setShowDetails] = useState(false);
  
  // Local state for customization before saving
  const [tempSettings, setTempSettings] = useState({
    analytics: cookieSettings.analytics,
    marketing: cookieSettings.marketing
  });

  if (cookieSettings.hasSet) return null;

  const handleAcceptAll = () => {
    setCookieSettings({
      analytics: true,
      marketing: true,
      hasSet: true
    });
  };

  const handleRejectAll = () => {
    setCookieSettings({
      analytics: false,
      marketing: false,
      hasSet: true
    });
  };

  const handleSavePreferences = () => {
    setCookieSettings({
      ...tempSettings,
      hasSet: true
    });
  };

  const t = TRANSLATIONS[language].cookieConsent;

  return (
    <AnimatePresence>
      <div className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 lg:p-8 pointer-events-none">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="mx-auto max-w-4xl w-full pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

            {!showDetails ? (
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                  <Cookie className="h-8 w-8" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-white mb-2">{t.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                    {t.description}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => setShowDetails(true)}
                      data-testid="cookie-customize"
                      className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-400 transition hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      {t.customize}
                    </button>
                    <button
                      onClick={handleRejectAll}
                      data-testid="cookie-reject-non-essential"
                      className="px-6 py-3 text-sm font-bold text-white transition rounded-xl bg-white/5 hover:bg-white/10"
                    >
                      {t.rejectNonEssential}
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      data-testid="cookie-accept-all"
                      className="px-8 py-3 text-sm font-black text-white transition rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                      {t.acceptAll}
                    </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowDetails(false)}
                      className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <h3 className="text-xl font-bold text-white">{t.customize}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <Shield className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {/* Essential */}
                  <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:bg-white/10">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-emerald-400">
                      <Check className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{t.essential.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t.alwaysOn}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.essential.desc}</p>
                    </div>
                  </div>

                  {/* Analytics */}
                  <div 
                    onClick={() => setTempSettings(s => ({ ...s, analytics: !s.analytics }))}
                    className={cn(
                      'flex items-start gap-4 rounded-2xl border p-4 transition cursor-pointer',
                      tempSettings.analytics ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      tempSettings.analytics ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                    )}>
                      <Check className={cn('h-5 w-5 transition', tempSettings.analytics ? 'opacity-100 scale-100' : 'opacity-0 scale-50')} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{t.analytics.title}</span>
                        <div className={cn(
                          'w-10 h-5 rounded-full relative transition-colors duration-200',
                          tempSettings.analytics ? 'bg-blue-600' : 'bg-slate-700'
                        )}>
                          <div className={cn(
                            'absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200',
                            tempSettings.analytics ? 'translate-x-5' : 'translate-x-0'
                          )} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.analytics.desc}</p>
                    </div>
                  </div>

                  {/* Marketing */}
                  <div 
                    onClick={() => setTempSettings(s => ({ ...s, marketing: !s.marketing }))}
                    className={cn(
                      'flex items-start gap-4 rounded-2xl border p-4 transition cursor-pointer',
                      tempSettings.marketing ? 'border-purple-500/30 bg-purple-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <div className={cn(
                      'mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      tempSettings.marketing ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
                    )}>
                      <Check className={cn('h-5 w-5 transition', tempSettings.marketing ? 'opacity-100 scale-100' : 'opacity-0 scale-50')} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{t.marketing.title}</span>
                        <div className={cn(
                          'w-10 h-5 rounded-full relative transition-colors duration-200',
                          tempSettings.marketing ? 'bg-purple-600' : 'bg-slate-700'
                        )}>
                          <div className={cn(
                            'absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200',
                            tempSettings.marketing ? 'translate-x-5' : 'translate-x-0'
                          )} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{t.marketing.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-6 py-4 text-sm font-bold text-slate-400 transition hover:text-white bg-white/5 rounded-2xl"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    data-testid="cookie-save-preferences"
                    className="flex-[2] px-8 py-4 text-sm font-black text-white transition rounded-2xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    {t.save}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

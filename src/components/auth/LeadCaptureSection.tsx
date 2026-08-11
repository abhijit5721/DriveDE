/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useMemo } from 'react';
import { Mail, Download, CheckCircle2, AlertCircle, FileText, ShieldCheck, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { UMSCHREIBUNG_COUNTRIES } from '../../data/umschreibungCountries';
import { cn } from '../../utils/cn';

/**
 * DRI-7: Lead magnet form — collects emails into the `marketing_leads` table
 * (via /api/lead, which also emails the checklist) in exchange for the
 * Free German Driving Exam Checklist.
 * Mounted just above the footer on the landing page.
 */
export function LeadCaptureSection() {
  const { language } = useAppStore();
  const isDe = language === 'de';

  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const sortedCountries = useMemo(
    () =>
      [...UMSCHREIBUNG_COUNTRIES].sort((a, b) =>
        isDe ? a.nameDe.localeCompare(b.nameDe, 'de') : a.nameEn.localeCompare(b.nameEn, 'en')
      ),
    [isDe]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), language, country: country || null }),
      });

      if (!response.ok) throw new Error(`Lead API failed with ${response.status}`);

      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('[LeadCapture] Failed to save lead:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="lead-magnet" className="relative z-10 bg-slate-50 px-6 py-24 border-t border-slate-100">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-sm">
          {/* Background glow */}

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-blue-600">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  {isDe ? 'Fast geschafft!' : 'You\'re almost there!'}
                </h3>
                <p className="text-slate-500 max-w-md">
                  {isDe
                    ? 'Wir senden dir die kostenlose Prüfungs-Checkliste in Kürze per E-Mail zu. Prüfe auch deinen Spam-Ordner.'
                    : 'Your free exam checklist is on its way to your inbox. Don\'t forget to check your spam folder.'
                  }
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-blue-600 border border-slate-200">
                  <FileText className="h-8 w-8" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 sm:text-4xl leading-tight">
                  {isDe
                    ? 'Hol dir deine kostenlose Checkliste für die deutsche Fahrprüfung'
                    : 'Get Your Free German Driving Exam Checklist'
                  }
                </h2>
                <p className="mt-4 text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
                  {isDe
                    ? 'Alle Prüfungspunkte, häufige Fehler und Umschreibungs-Dokumente, kompakt direkt in dein Postfach.'
                    : 'Every exam checkpoint, common mistakes, and Umschreibung documents, straight to your inbox.'
                  }
                </p>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 items-center">
                  {/* Country selector — tailors the checklist to the Umschreibung tier */}
                  <div className="relative group w-full sm:max-w-md text-left">
                    <label className="mb-1.5 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      {isDe ? 'Woher stammt dein aktueller Führerschein? (optional)' : 'Where is your current license from? (optional)'}
                    </label>
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-600" />
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        data-testid="lead-country-select"
                        className="w-full appearance-none rounded-2xl bg-white border border-slate-300 py-4 pl-12 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                      >
                        <option value="">
                          {isDe ? '🆕 Ich mache meinen ersten Führerschein' : '🆕 I\'m getting my first license'}
                        </option>
                        {sortedCountries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {isDe ? c.nameDe : c.nameEn}
                          </option>
                        ))}
                        <option value="XX">
                          {isDe ? '🌐 Anderes Land' : '🌐 Other country'}
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                  <div className="relative group flex-1 sm:max-w-md">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-blue-600" />
                    <input
                      required
                      type="email"
                      placeholder={isDe ? 'deine@email.de' : 'your@email.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="lead-email-input"
                      className="w-full rounded-2xl bg-white border border-slate-300 py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    data-testid="lead-submit-btn"
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md transition-all active:scale-95',
                      status === 'submitting' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-500 hover:scale-105'
                    )}
                  >
                    {status === 'submitting' ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        {isDe ? 'Gratis-Guide laden' : 'Download Free Guide'}
                      </>
                    )}
                  </button>
                  </div>
                </form>

                {status === 'error' && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {isDe
                      ? 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.'
                      : 'Something went wrong. Please try again later.'
                    }
                  </p>
                )}

                <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                  {isDe
                    ? '100% DSGVO-konform. Kein Spam, jederzeit abmeldbar.'
                    : '100% GDPR compliant. No spam, unsubscribe anytime.'
                  }
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

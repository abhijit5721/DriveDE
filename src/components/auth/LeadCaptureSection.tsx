/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { Mail, Download, CheckCircle2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { cn } from '../../utils/cn';

/**
 * DRI-7: Lead magnet form — collects emails into the `marketing_leads` table
 * in exchange for the Free German Driving Exam Checklist.
 * Mounted just above the footer on the landing page.
 */
export function LeadCaptureSection() {
  const { language } = useAppStore();
  const isDe = language === 'de';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('marketing_leads')
        .insert({
          email: email.trim().toLowerCase(),
          source: 'landing_lead_magnet',
          language,
        });

      // 23505 = unique_violation → email already registered; treat as success
      if (error && error.code !== '23505') throw error;

      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error('[LeadCapture] Failed to save lead:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="lead-magnet" className="relative z-10 bg-slate-950/90 px-6 py-24 backdrop-blur-xl border-t border-slate-800">
      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-slate-900/95 to-slate-900 p-8 md:p-12 shadow-2xl shadow-emerald-500/10">
          {/* Background glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {isDe ? 'Fast geschafft!' : 'You\'re almost there!'}
                </h3>
                <p className="text-slate-400 max-w-md">
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
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileText className="h-8 w-8" />
                </div>

                <h2 className="text-2xl font-bold text-white sm:text-4xl leading-tight">
                  {isDe
                    ? 'Hol dir deine kostenlose Checkliste für die deutsche Fahrprüfung'
                    : 'Get Your Free German Driving Exam Checklist'
                  }
                </h2>
                <p className="mt-4 text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
                  {isDe
                    ? 'Alle Prüfungspunkte, häufige Fehler und Umschreibungs-Dokumente — kompakt als PDF direkt in dein Postfach.'
                    : 'Every exam checkpoint, common mistakes, and Umschreibung documents — as a compact PDF straight to your inbox.'
                  }
                </p>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <div className="relative group flex-1 sm:max-w-md">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-emerald-400" />
                    <input
                      required
                      type="email"
                      placeholder={isDe ? 'deine@email.de' : 'your@email.com'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="lead-email-input"
                      className="w-full rounded-2xl bg-slate-900/60 border border-white/10 py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    data-testid="lead-submit-btn"
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-600/30 transition-all active:scale-95',
                      status === 'submitting' ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-500 hover:scale-105'
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
                </form>

                {status === 'error' && (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-400">
                    <AlertCircle className="h-4 w-4" />
                    {isDe
                      ? 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.'
                      : 'Something went wrong. Please try again later.'
                    }
                  </p>
                )}

                <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
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

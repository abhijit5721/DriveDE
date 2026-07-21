/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PlanPickerScreen.tsx
 *
 * Shown after the user clicks "Get Started" on the landing page.
 * User picks a plan → clicks "Start My 7-Day Free Trial" → trial clock starts
 * → they proceed to LicenseSelector → main app.
 *
 * The chosen plan is persisted so the Paywall pre-selects it at expiry.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Sparkles, Check, ArrowRight, ShieldCheck, Zap, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { Logo } from '../common/Logo';

type Plan = '30-days' | '90-days' | 'lifetime';

interface PlanPickerScreenProps {
  onComplete: () => void;
}

const PLAN_CONFIG = {
  'de': {
    badge: 'KOSTENLOS STARTEN',
    headline: 'Wähle deinen Plan',
    subline: '7 Tage kostenlos testen — dann entscheide dich',
    plans: {
      '30-days': {
        label: '30-Tage-Pass',
        tag: 'EINSTEIGER',
        tagColor: 'bg-slate-700 text-slate-300',
        price: '€9.99',
        period: 'nach der Testversion',
        highlight: 'Perfekt zum Kennenlernen',
        color: 'from-slate-700 to-slate-800',
        borderSelected: 'border-slate-400',
      },
      '90-days': {
        label: '90-Tage-Pass',
        tag: '⭐ BELIEBT',
        tagColor: 'bg-amber-500 text-amber-950',
        price: '€19.99',
        period: 'nach der Testversion',
        highlight: 'Ideal für die Fahrausbildung',
        color: 'from-blue-700 to-blue-800',
        borderSelected: 'border-blue-400',
      },
      'lifetime': {
        label: 'Lifetime-Zugang',
        tag: 'BESTES ANGEBOT',
        tagColor: 'bg-emerald-500 text-emerald-950',
        price: '€29.99',
        period: 'einmalig, für immer',
        highlight: 'Einmal zahlen, immer nutzen',
        color: 'from-emerald-700 to-emerald-800',
        borderSelected: 'border-emerald-400',
      },
    },
    features: [
      '📍 GPS Live-Fahrtracking',
      '⚡ Echtzeit-Tempolimit-Warnungen',
      '🤖 KI-Fahrtanalyse nach jeder Fahrt',
      '🅿️ 3D-Einparktrainer (Simulation)',
      '📊 Fortschritts- & Fahrbereitschafts-Score',
    ],
    cta: '7 Tage kostenlos starten',
    ctaSub: 'Keine Kreditkarte erforderlich · Jederzeit kündbar',
    guarantee: 'Kein Risiko',
    guaranteeDesc: 'Teste alle Pro-Funktionen 7 Tage lang komplett kostenlos.',
    back: 'Zurück',
  },
  'en': {
    badge: 'START FOR FREE',
    headline: 'Choose your plan',
    subline: 'Try everything free for 7 days — then decide',
    plans: {
      '30-days': {
        label: '30-Day Pass',
        tag: 'STARTER',
        tagColor: 'bg-slate-700 text-slate-300',
        price: '€9.99',
        period: 'after trial',
        highlight: 'Perfect to get started',
        color: 'from-slate-700 to-slate-800',
        borderSelected: 'border-slate-400',
      },
      '90-days': {
        label: '90-Day Pass',
        tag: '⭐ POPULAR',
        tagColor: 'bg-amber-500 text-amber-950',
        price: '€19.99',
        period: 'after trial',
        highlight: 'Ideal for your driving course',
        color: 'from-blue-700 to-blue-800',
        borderSelected: 'border-blue-400',
      },
      'lifetime': {
        label: 'Lifetime Access',
        tag: 'BEST VALUE',
        tagColor: 'bg-emerald-500 text-emerald-950',
        price: '€29.99',
        period: 'one-time, forever',
        highlight: 'Pay once, use forever',
        color: 'from-emerald-700 to-emerald-800',
        borderSelected: 'border-emerald-400',
      },
    },
    features: [
      '📍 GPS Live Driving Tracker',
      '⚡ Real-Time Speed Limit Alerts',
      '🤖 AI Debrief After Every Drive',
      '🅿️ 3D Parking Simulator',
      '📊 Progress & Readiness Score',
    ],
    cta: 'Start My 7-Day Free Trial',
    ctaSub: 'No credit card required · Cancel anytime',
    guarantee: 'Zero Risk',
    guaranteeDesc: 'Try all Pro features free for 7 full days.',
    back: 'Back',
  },
};

const planOrder: Plan[] = ['30-days', '90-days', 'lifetime'];
const planIcons = {
  '30-days': Clock,
  '90-days': Calendar,
  'lifetime': Sparkles,
};

export function PlanPickerScreen({ onComplete }: PlanPickerScreenProps) {
  const { language, startFreeTrial } = useAppStore();
  const [selected, setSelected] = useState<Plan>('90-days');
  const [loading, setLoading] = useState(false);

  const t = PLAN_CONFIG[language] || PLAN_CONFIG['de'];

  const handleStart = () => {
    setLoading(true);
    // Start trial with chosen plan — clock starts NOW
    startFreeTrial(selected);
    // Brief delay for visual feedback, then proceed
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col overflow-y-auto">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-6 py-5 shrink-0">
        <Logo size="sm" />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onComplete}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          {t.back}
        </motion.button>
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center px-4 pb-8 pt-2">

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 mb-5">
            <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-bold text-blue-300 tracking-[0.2em] uppercase">{t.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3 italic">
            {t.headline}
          </h1>
          <p className="text-slate-400 text-base font-medium">{t.subline}</p>
        </motion.div>

        {/* Plan cards */}
        <div className="w-full max-w-2xl space-y-3 mb-8">
          {planOrder.map((plan, i) => {
            const cfg = t.plans[plan];
            const Icon = planIcons[plan];
            const isSelected = selected === plan;

            return (
              <motion.button
                key={plan}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                onClick={() => setSelected(plan)}
                className={cn(
                  'relative w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group',
                  isSelected
                    ? `bg-gradient-to-r ${cfg.color} ${cfg.borderSelected} shadow-lg`
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                )}
              >
                {/* Selected glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                )}

                {/* Radio indicator */}
                <div className={cn(
                  'relative shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                  isSelected ? 'border-white bg-white' : 'border-slate-500 bg-transparent'
                )}>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-2.5 h-2.5 rounded-full bg-slate-900"
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Icon */}
                <div className={cn(
                  'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={cn(
                      'text-sm font-bold transition-colors',
                      isSelected ? 'text-white' : 'text-slate-200'
                    )}>
                      {cfg.label}
                    </span>
                    <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', cfg.tagColor)}>
                      {cfg.tag}
                    </span>
                  </div>
                  <p className={cn(
                    'text-[11px] font-medium transition-colors',
                    isSelected ? 'text-white/70' : 'text-slate-500'
                  )}>
                    {cfg.highlight}
                  </p>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  <div className={cn(
                    'text-xl font-bold italic tracking-tight transition-colors',
                    isSelected ? 'text-white' : 'text-slate-300'
                  )}>
                    {cfg.price}
                  </div>
                  <div className={cn(
                    'text-[10px] font-medium transition-colors',
                    isSelected ? 'text-white/60' : 'text-slate-500'
                  )}>
                    {cfg.period}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Features included */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full max-w-2xl mb-8"
        >
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
            {language === 'de' ? 'Im Test inklusive' : 'Included in trial'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {t.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center gap-2.5"
              >
                <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-blue-400 stroke-[3px]" />
                </div>
                <span className="text-xs font-medium text-slate-300">{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-2xl space-y-4"
        >
          <button
            onClick={handleStart}
            disabled={loading}
            className={cn(
              'group relative w-full h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-2xl shadow-blue-600/30',
              'text-white font-bold text-lg italic tracking-tight transition-all duration-300',
              'flex items-center justify-center gap-3 overflow-hidden',
              'disabled:opacity-80 transform hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t.cta}</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4 stroke-[3px]" />
                </div>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500 font-medium">{t.ctaSub}</p>

          {/* Guarantee */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8">
            <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.guarantee}</p>
              <p className="text-[11px] text-slate-500 font-medium">{t.guaranteeDesc}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

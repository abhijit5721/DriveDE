/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Check, X, Clock, Calendar, Sparkles, ArrowRight, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../../data/translations';

type Tier = '30-days' | '90-days' | 'lifetime';

export const Paywall: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setPremium } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<Tier>('90-days');
  const [isLoading, setIsLoading] = useState(false);

  const t = TRANSLATIONS[language].instructor.paywall;

  const tierIcons = {
    '30-days': Clock,
    '90-days': Calendar,
    'lifetime': Sparkles,
  };

  const tierPrices = {
    '30-days': 9.99,
    '90-days': 19.99,
    'lifetime': 29.99,
  };

  const handleSubscribe = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(true);
      setTimeout(() => {
        setPremium(true);
        setIsLoading(false);
        onClose();
        toast.success(language === 'de' ? 'Pro (Demo) aktiviert! Viel Erfolg!' : 'Pro (Demo) activated! Good luck!');
      }, 1500);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(language === 'de' ? 'Bitte erstelle ein Konto, um Pro freizuschalten.' : 'Please create an account to unlock Pro.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          tier: selectedTier, 
          language
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(language === 'de' ? 'Zahlungsfehler. Bitte versuche es später erneut.' : 'Payment error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(59,130,246,0.2)] overflow-hidden flex flex-col"
      >
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Header Section */}
        <div className="relative pt-10 px-10 pb-6 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              <span className="text-[10px] font-black text-blue-300 tracking-[0.2em] uppercase">{t.badge}</span>
            </motion.div>
            <button 
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter italic leading-tight mb-2">
            {t.title}
          </h2>
          <p className="text-slate-400 text-base sm:text-lg font-medium max-w-md">
            {t.subtitle}
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 pt-2 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            
            {/* Features (Left side on large screens) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                {t.features.map((feature: string, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center gap-3.5 group"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30 group-hover:scale-110 transition-transform">
                      <Check className="h-3 w-3 text-blue-400 stroke-[3px]" />
                    </div>
                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{feature}</span>
                  </motion.div>
                ))}
              </div>

              {/* Success Badge */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-3xl bg-slate-800/40 border border-white/5 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white italic">{t.moneyBack}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{t.moneyBackDesc}</p>
                </div>
              </motion.div>
            </div>

            {/* Pricing Selection (Right side on large screens) */}
            <div className="lg:col-span-3 space-y-3">
              {(Object.keys(t.tiers) as Tier[]).map((key, index) => {
                const Icon = tierIcons[key];
                const tierInfo = t.tiers[key];
                const price = tierPrices[key];
                const isSelected = selectedTier === key;
                return (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    onClick={() => setSelectedTier(key)}
                    className={cn(
                      'w-full flex items-center gap-5 p-5 rounded-[2rem] border-2 transition-all duration-500 relative group overflow-hidden',
                      isSelected 
                        ? 'bg-blue-600 border-blue-500 shadow-[0_20px_40px_rgba(59,130,246,0.25)] scale-[1.02]' 
                        : 'bg-slate-800/40 border-white/5 hover:border-white/10 hover:bg-slate-800/60'
                    )}
                  >
                    {/* Background Shine */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    )}

                    <div className={cn(
                      'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500',
                      isSelected ? 'bg-white text-blue-600 rotate-3 scale-110 shadow-lg' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                    )}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn('text-[10px] font-black uppercase tracking-[0.2em]', isSelected ? 'text-blue-100' : 'text-slate-500')}>
                          {tierInfo.label}
                        </span>
                        {key === '90-days' && (
                          <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-amber-400/20">
                            {t.recommended}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={cn('text-3xl font-black italic tracking-tighter', isSelected ? 'text-white' : 'text-slate-100')}>
                          €{price}
                        </span>
                        <span className={cn('text-xs font-bold', isSelected ? 'text-blue-100/70' : 'text-slate-500')}>
                          {tierInfo.period}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="mt-12 space-y-6">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className={cn(
                'group relative w-full h-20 bg-white hover:bg-blue-50 rounded-[1.5rem] shadow-2xl shadow-blue-600/10 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-4 overflow-hidden'
              )}
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    key="loader"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="w-7 h-7 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" 
                  />
                ) : (
                  <motion.div 
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-4"
                  >
                    <span className="text-xl font-black text-slate-900 italic tracking-tight">{t.cta}</span>
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:translate-x-1.5 transition-transform">
                      <ArrowRight className="w-4 h-4 text-white stroke-[3px]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <CreditCard className="w-3.5 h-3.5" />
                  {t.secure}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t.trust}
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-slate-500 text-xs font-bold hover:text-white transition-colors uppercase tracking-[0.2em]"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

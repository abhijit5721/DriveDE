import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Star, Check, X, Clock, Calendar, Shield, Zap, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';

type Tier = '30-days' | '90-days' | 'lifetime';

export const Paywall: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setPremium } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<Tier>('90-days');
  const [isLoading, setIsLoading] = useState(false);

  const tiers = {
    '30-days': {
      price: 9.99,
      period: { de: 'für 30 Tage', en: 'for 30 days' },
      icon: Clock,
      label: { de: 'Standard', en: 'Standard' }
    },
    '90-days': {
      price: 19.99,
      period: { de: 'für 90 Tage', en: 'for 90 days' },
      icon: Calendar,
      label: { de: 'Beliebt', en: 'Most Popular' },
      popular: true
    },
    'lifetime': {
      price: 29.99,
      period: { de: 'Einmalig / Lifetime', en: 'One-time / Lifetime' },
      icon: Sparkles,
      label: { de: 'Early Adopter', en: 'Early Adopter' }
    }
  };

  const handleSubscribe = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Local development fallback
      setIsLoading(true);
      setTimeout(() => {
        setPremium(true);
        setIsLoading(false);
        onClose();
        toast.success(language === 'de' ? 'Premium (Demo) aktiviert!' : 'Premium (Demo) activated!');
      }, 1500);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(language === 'de' ? 'Bitte melden Sie sich an, um Pro freizuschalten.' : 'Please sign in to unlock Pro.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          tier: selectedTier, 
          language,
          user_id: user.id 
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(language === 'de' ? 'Zahlungsfehler. Bitte versuchen Sie es später erneut.' : 'Payment error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = {
    de: {
      title: 'DriveDE Pro freischalten',
      subtitle: 'Wähle deinen Plan und bestehe die Prüfung beim ersten Mal',
      features: [
        'Alle 25+ Video-Lektionen & Animationen',
        'Unbegrenzter Fahrstunden-Tracker',
        'Alle Spezial-Manöver & Umschreibung-Tools',
        'Interaktive Prüfungssimulation (Sprachausgabe)',
        'Detaillierte PDF-Checklisten & Protokolle'
      ],
      button: 'Jetzt Pro werden',
      cancel: 'Vielleicht später',
      secure: 'Sichere Zahlung via Stripe'
    },
    en: {
      title: 'Unlock DriveDE Pro',
      subtitle: 'Pick your plan and pass your exam on the first try',
      features: [
        'All 25+ video lessons & animations',
        'Unlimited driving lesson tracker',
        'All special maneuvers & conversion tools',
        'Interactive exam simulation (Voice)',
        'Detailed PDF checklists & reports'
      ],
      button: 'Unlock Pro Now',
      cancel: 'Maybe later',
      secure: 'Secure payment via Stripe'
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Floating background elements for premium feel */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 sm:p-10 relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Star className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-8">
            {(Object.entries(tiers) as [Tier, typeof tiers['30-days']][]).map(([key, tier]) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={cn(
                    "relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                    isSelected 
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-4 ring-blue-500/10" 
                      : "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    isSelected ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {tier.label[language]}
                      </span>
                      {tier.popular && (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          {language === 'de' ? 'Bester Wert' : 'Best Value'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xl font-black text-slate-900 dark:text-white italic">€{tier.price}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{tier.period[language]}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-500 rounded-full p-1 shadow-sm">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-slate-700/50">
            <ul className="space-y-3">
              {t.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="group relative w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-slate-400 border-t-white dark:border-slate-200 dark:border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <>
                {t.button}
                <Sparkles className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              {t.secure}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 text-xs font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-widest"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

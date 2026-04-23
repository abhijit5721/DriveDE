import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Star, Check, X, Clock, Calendar, Shield, Zap, Sparkles, Users, Trophy, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';

type Tier = '30-days' | '90-days' | 'lifetime';

export const Paywall: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setPremium } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<Tier>('90-days');
  const [isLoading, setIsLoading] = useState(false);

  const tiers: Record<string, any> = {
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
        'GPS Live-Tracking & Streckenverlauf',
        'AI Fahr-Coach & Fehler-Analyse',
        'Finanzielle Prognosen & Spar-Strategien',
        'Alle Video-Lektionen & Animationen',
        'Fahrlehrer-Review (PDF & Druck)'
      ],
      button: 'Jetzt Pro werden',
      cancel: 'Vielleicht später',
      secure: 'Sichere Zahlung via Stripe'
    },
    en: {
      title: 'Unlock DriveDE Pro',
      subtitle: 'Pick your plan and pass your exam on the first try',
      features: [
        'GPS Live Tracking & Route Maps',
        'AI Driving Coach & Fault Analysis',
        'Financial Projections & Cost Strategy',
        'All Video Lessons & Animations',
        'Instructor Review (PDF & Print)'
      ],
      button: 'Unlock Pro Now',
      cancel: 'Maybe later',
      secure: 'Secure payment via Stripe'
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Floating background elements for premium feel */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 relative scrollbar-hide">
          <div className="flex items-center gap-4 mb-6 transition-all">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {t.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                  {t.subtitle}
                </p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 rounded-full animate-pulse">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-bold text-green-600 dark:text-green-400">
                    {language === 'de' ? '142 gerade online' : '142 online now'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-800/40 dark:border-slate-700/50">
              <Users className="w-4 h-4 text-blue-500 mb-1" />
              <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">2.5k+</span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter mt-1">
                {language === 'de' ? 'Nutzer' : 'Users'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-800/40 dark:border-slate-700/50">
              <Trophy className="w-4 h-4 text-amber-500 mb-1" />
              <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">94%</span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter mt-1">
                {language === 'de' ? 'Erfolg' : 'Success'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-slate-800/40 dark:border-slate-700/50">
              <Globe className="w-4 h-4 text-emerald-500 mb-1" />
              <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">16+</span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter mt-1">
                {language === 'de' ? 'Städte' : 'Cities'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mb-6">
            {(Object.entries(tiers) as [Tier, typeof tiers['30-days']][]).map(([key, tier]) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={cn(
                    'relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-left',
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-4 ring-blue-500/10' 
                      : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0',
                    isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  )}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        {tier.label[language]}
                      </span>
                      {tier.popular && (
                        <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase whitespace-nowrap shrink-0">
                          {language === 'de' ? 'Vorteil' : 'Value'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white italic">€{tier.price}</span>
                      <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">{tier.period[language]}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="bg-blue-500 rounded-full p-1 shadow-sm shrink-0">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-4 sm:p-6 mb-6 border border-slate-100 dark:border-slate-700/50">
            <ul className="space-y-2 sm:space-y-3">
              {t.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500" />
                  </div>
                  <span className="text-[11px] sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="group relative w-full h-14 sm:h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-base sm:text-lg rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden"
          >
            {isLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-slate-400 border-t-white dark:border-slate-200 dark:border-t-slate-800 rounded-full animate-spin" />
            ) : (
              <>
                {t.button}
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-5 sm:mt-6 flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              {t.secure}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-xs font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase tracking-widest"
            >
              {t.cancel}
            </button>

            {/* Institutional Trust Badge */}
            <div className="flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm">
                <Shield className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                {language === 'de' 
                  ? 'Basierend auf aktuellen TÜV / DEKRA Prüfungsrichtlinien 2026' 
                  : 'Based on current 2026 TÜV / DEKRA exam guidelines'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

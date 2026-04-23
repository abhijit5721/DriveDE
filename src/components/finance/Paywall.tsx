import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Check, X, Clock, Calendar, Sparkles, ArrowRight, CreditCard, ShieldCheck, Zap, Star, Crown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

type Tier = '30-days' | '90-days' | 'lifetime';

interface TierInfo {
  price: number;
  period: { de: string; en: string };
  icon: React.ElementType;
  label: { de: string; en: string };
  description: { de: string; en: string };
  popular?: boolean;
}

export const Paywall: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { language, setPremium } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<Tier>('90-days');
  const [isLoading, setIsLoading] = useState(false);

  const isDE = language === 'de';

  const tiers: Record<Tier, TierInfo> = {
    '30-days': {
      price: 9.99,
      period: { de: 'für 30 Tage', en: 'for 30 days' },
      icon: Clock,
      label: { de: 'Starter', en: 'Starter' },
      description: { de: 'Perfekt zum Ausprobieren', en: 'Perfect for a quick start' }
    },
    '90-days': {
      price: 19.99,
      period: { de: '90 Tage Fokus', en: '90 Day Focus' },
      icon: Calendar,
      label: { de: 'Meistgewählt', en: 'Most Popular' },
      description: { de: 'Beste Prüfungsvorbereitung', en: 'Best exam preparation' },
      popular: true
    },
    'lifetime': {
      price: 29.99,
      period: { de: 'Lebenslanger Zugriff', en: 'Lifetime Access' },
      icon: Sparkles,
      label: { de: 'Rundum Sorglos', en: 'Ultimate' },
      description: { de: 'Für immer dein Begleiter', en: 'Your companion forever' }
    }
  };

  const handleSubscribe = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(true);
      setTimeout(() => {
        setPremium(true);
        setIsLoading(false);
        onClose();
        toast.success(isDE ? 'Pro (Demo) aktiviert! Viel Erfolg!' : 'Pro (Demo) activated! Good luck!');
      }, 1500);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error(isDE ? 'Bitte erstelle ein Konto, um Pro freizuschalten.' : 'Please create an account to unlock Pro.');
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
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(isDE ? 'Zahlungsfehler. Bitte versuche es später erneut.' : 'Payment error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = {
    de: {
      title: 'DriveDE Pro',
      badge: 'PREMIUM FREISCHALTEN',
      subtitle: 'Deine Abkürzung zum Führerschein',
      features: [
        'GPS Live-Tracking & Fehler-Analyse',
        'AI Fahr-Coach & Individuelle Tipps',
        'Alle Video-Lektionen & 3D-Szenarien',
        'Exklusives PDF Fahrlehrer-Review',
        'Priorisierter Cloud-Sync & Support'
      ],
      cta: 'Jetzt Pro freischalten',
      cancel: 'Vielleicht später',
      secure: 'Sicher via Stripe',
      trust: 'TÜV / DEKRA Richtlinien 2026'
    },
    en: {
      title: 'DriveDE Pro',
      badge: 'UNLOCK PREMIUM',
      subtitle: 'Your shortcut to the license',
      features: [
        'GPS Live Tracking & Fault Analysis',
        'AI Driving Coach & Custom Tips',
        'All Video Lessons & 3D Scenarios',
        'Exclusive PDF Instructor Review',
        'Priority Cloud Sync & Support'
      ],
      cta: 'Unlock Pro Now',
      cancel: 'Maybe later',
      secure: 'Secure Stripe Checkout',
      trust: '2026 TÜV / DEKRA guidelines'
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl overflow-hidden">
      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden opacity-50 pointer-events-none">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [-100, 100, -100],
            y: [-100, 100, -100],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[120px]"
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            x: [100, -100, 100],
            y: [100, -100, 100],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-indigo-600/20 blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/40 border border-white/10 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row"
      >
        {/* Header/Hero Section (Left side on desktop) */}
        <div className="relative w-full lg:w-[40%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
                <span className="text-[10px] font-black text-blue-100 tracking-[0.2em] uppercase">{t.badge}</span>
              </motion.div>
              <button 
                onClick={onClose}
                className="lg:hidden p-2 rounded-2xl bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[0.9] mb-4 italic">
              {t.title} <span className="text-blue-500">PRO</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
              {t.subtitle}
            </p>

            <div className="space-y-4">
              {t.features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <Check className="h-3 w-3 text-blue-400 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-white italic uppercase tracking-wider">{isDE ? 'Geld-Zurück-Garantie' : 'Money-Back Guarantee'}</p>
                <p className="text-[10px] text-slate-500 font-bold leading-tight">{isDE ? '100% Sicherheit für deinen Erfolg' : '100% safety for your success'}</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
              <Star className="w-3 h-3 fill-slate-600" />
              {t.trust}
            </p>
          </div>
        </div>

        {/* Pricing & Selection (Right side on desktop) */}
        <div className="relative flex-1 p-8 lg:p-12 flex flex-col bg-slate-900/40">
          <button 
            onClick={onClose}
            className="hidden lg:flex absolute top-8 right-8 p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <LayoutGroup>
              <div className="space-y-4 mb-8">
                {(Object.entries(tiers) as [Tier, TierInfo][]).map(([key, tier]) => {
                  const Icon = tier.icon;
                  const isSelected = selectedTier === key;
                  const isLifetime = key === 'lifetime';
                  
                  return (
                    <motion.button
                      key={key}
                      layout
                      onClick={() => setSelectedTier(key)}
                      className={cn(
                        'w-full relative flex items-center gap-6 p-6 rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden',
                        isSelected 
                          ? isLifetime 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.3)]'
                            : 'bg-blue-600 border-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.3)]' 
                          : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                      )}
                    >
                      {/* Active Indicator Line */}
                      {isSelected && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/40"
                        />
                      )}

                      <div className={cn(
                        'w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500',
                        isSelected 
                          ? 'bg-white text-slate-900 scale-110 shadow-xl' 
                          : 'bg-slate-800 text-slate-400 group-hover:scale-105'
                      )}>
                        {isLifetime && isSelected ? <Crown className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={cn(
                            'text-[10px] font-black uppercase tracking-[0.2em]', 
                            isSelected ? 'text-white/70' : 'text-slate-500'
                          )}>
                            {tier.label[language]}
                          </span>
                          {tier.popular && (
                            <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                              {isDE ? 'EMPFOHLEN' : 'RECOMMENDED'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={cn('text-3xl font-black italic tracking-tighter', isSelected ? 'text-white' : 'text-slate-100')}>
                            €{tier.price}
                          </span>
                          <span className={cn('text-xs font-bold', isSelected ? 'text-white/60' : 'text-slate-500')}>
                            {tier.period[language]}
                          </span>
                        </div>
                      </div>

                      {/* Selection Glow */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>

            {/* CTA Button */}
            <div className="space-y-4">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={cn(
                  'group relative w-full h-20 rounded-[2rem] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xl',
                  selectedTier === 'lifetime' 
                    ? 'bg-white text-slate-900 hover:bg-amber-50' 
                    : 'bg-white text-slate-900 hover:bg-blue-50'
                )}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div 
                      key="loader"
                      className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" 
                    />
                  ) : (
                    <motion.div 
                      key="text"
                      className="flex items-center justify-center gap-4"
                    >
                      <span className="text-xl font-black italic tracking-tight">{t.cta}</span>
                      <div className={cn(
                        'h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-2',
                        selectedTier === 'lifetime' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      )}>
                        <ArrowRight className="w-5 h-5 stroke-[3px]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <CreditCard className="w-3 h-3" />
                    {t.secure}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                >
                  {t.cancel}
                </button>
              </div>
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

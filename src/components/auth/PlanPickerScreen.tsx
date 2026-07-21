/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PlanPickerScreen.tsx
 *
 * Flow:
 * Step 1 (Plan Selection): User picks 30-Day, 90-Day, or Lifetime.
 * Step 2 (Account Creation): User enters email & password (or Google).
 * Step 3 (Email Confirmation): New signups must verify their email link before accessing dashboard.
 * Upon verification/sign-in, 7-day trial activates and user enters app.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Sparkles, Check, ArrowRight, ShieldCheck, Zap, X, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { Logo } from '../common/Logo';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { signInWithProvider, isEmailRegisteredLocally, registerEmailLocally } from '../../services/auth';

type Plan = '30-days' | '90-days' | 'lifetime';
type ScreenStep = 'plan' | 'signup' | 'confirm_email';

interface PlanPickerScreenProps {
  initialPlan?: Plan;
  onComplete: () => void;
}

const PLAN_CONFIG = {
  'de': {
    badge: 'KOSTENLOS STARTEN',
    headline: 'Wähle deinen Plan',
    subline: '7 Tage kostenlos testen — danach selbst entscheiden',
    signupHeadline: 'Erstelle dein Konto',
    signupSubline: 'Melde dich an, um deine 7-Tage Pro Testversion zu aktivieren.',
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
    ctaPlan: 'Weiter zur kostenlosen Registrierung',
    ctaSignup: 'Konto erstellen & Bestätigen',
    ctaSub: 'Keine Kreditkarte erforderlich · Jederzeit kündbar',
    guarantee: 'Kein Risiko',
    guaranteeDesc: 'Teste alle Pro-Funktionen 7 Tage lang komplett kostenlos.',
    back: 'Zurück',
    changePlan: 'Plan ändern',
    emailLabel: 'E-Mail-Adresse',
    passwordLabel: 'Passwort (mind. 8 Zeichen)',
    googleBtn: 'Mit Google fortfahren',
    divider: 'oder mit E-Mail registrieren',
    alreadyAccount: 'Schon ein Konto? Hier anmelden',
    emailRequired: 'Bitte gib eine gültige E-Mail-Adresse ein.',
    passwordRequired: 'Passwort muss mindestens 8 Zeichen lang sein.',
    confirmTitle: 'Bitte E-Mail-Adresse bestätigen',
    confirmSubline: 'Wir haben einen Bestätigungslink gesendet an:',
    confirmDesc: 'Klicke auf den Link in deiner E-Mail, um dein Konto zu aktivieren und deine 7-Tage Pro Testversion zu starten.',
    confirmDoneBtn: 'Ich habe meine E-Mail bestätigt → Anmelden',
    confirmSimulateBtn: 'Bestätigung simulieren & Trial starten →',
    resendLink: 'Bestätigungslink erneut senden',
    resendSuccess: 'Bestätigungslink wurde erneut gesendet.',
    changeEmail: 'E-Mail-Adresse ändern',
  },
  'en': {
    badge: 'START FOR FREE',
    headline: 'Choose your plan',
    subline: 'Try everything free for 7 days — then decide',
    signupHeadline: 'Create your account',
    signupSubline: 'Sign up to activate your 7-day unlimited Pro trial.',
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
    ctaPlan: 'Continue to Free Signup',
    ctaSignup: 'Create Account & Confirm',
    ctaSub: 'No credit card required · Cancel anytime',
    guarantee: 'Zero Risk',
    guaranteeDesc: 'Try all Pro features free for 7 full days.',
    back: 'Back',
    changePlan: 'Change Plan',
    emailLabel: 'Email address',
    passwordLabel: 'Password (min. 8 chars)',
    googleBtn: 'Continue with Google',
    divider: 'or register with email',
    alreadyAccount: 'Already have an account? Sign in',
    emailRequired: 'Please enter a valid email address.',
    passwordRequired: 'Password must be at least 8 characters long.',
    confirmTitle: 'Please confirm your email address',
    confirmSubline: 'We sent a confirmation link to:',
    confirmDesc: 'Click the link in your email to activate your account and start your 7-day Pro trial.',
    confirmDoneBtn: 'I\'ve confirmed my email → Sign in',
    confirmSimulateBtn: 'Simulate Confirmation & Start Trial →',
    resendLink: 'Resend confirmation link',
    resendSuccess: 'Confirmation link has been resent.',
    changeEmail: 'Change email address',
  },
};

const planOrder: Plan[] = ['30-days', '90-days', 'lifetime'];
const planIcons = {
  '30-days': Clock,
  '90-days': Calendar,
  'lifetime': Sparkles,
};

export function PlanPickerScreen({ initialPlan = '90-days', onComplete }: PlanPickerScreenProps) {
  const { language, startFreeTrial, setAuthState, setIntendedPlan } = useAppStore();
  const [step, setStep] = useState<ScreenStep>('plan');
  const [selected, setSelected] = useState<Plan>(initialPlan);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const t = PLAN_CONFIG[language] || PLAN_CONFIG['de'];
  const activePlan = t.plans[selected];
  const isDe = language === 'de';

  const handleGoToSignup = () => {
    setStep('signup');
    setError(null);
  };

  const handleSignupSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const cleanEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(t.emailRequired);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordRequired);
      return;
    }

    // Check if user tries to SIGN UP with an email that is already registered
    if (!isExistingUser && (isEmailRegisteredLocally(cleanEmail) || useAppStore.getState().authEmail?.toLowerCase() === cleanEmail)) {
      setIsExistingUser(true);
      setError(isDe 
        ? 'Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich mit deinem Passwort an.' 
        : 'An account with this email address already exists. Please sign in with your password.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (isExistingUser) {
          // Signing in existing confirmed user
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (signInErr) throw signInErr;
          const user = data.user;
          registerEmailLocally(cleanEmail);
          setAuthState(user?.email || cleanEmail, 'signed_in', user?.user_metadata?.full_name || null, user?.id || null);
          startFreeTrial(selected);
          setTimeout(() => {
            setLoading(false);
            onComplete();
          }, 400);
        } else {
          // Creating NEW account in Supabase
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
            },
          });

          if (signUpErr) {
            const msg = signUpErr.message.toLowerCase();
            if (msg.includes('already registered') || msg.includes('already exists') || signUpErr.status === 422) {
              setIsExistingUser(true);
              registerEmailLocally(cleanEmail);
              throw new Error(isDe 
                ? 'Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich an.' 
                : 'An account with this email address already exists. Please sign in instead.');
            }
            throw signUpErr;
          }

          if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            setIsExistingUser(true);
            registerEmailLocally(cleanEmail);
            throw new Error(isDe 
              ? 'Ein Konto mit dieser E-Mail-Adresse existiert bereits. Bitte melde dich an oder verwende Google.' 
              : 'An account with this email address already exists. Please sign in instead or use Google.');
          }

          registerEmailLocally(cleanEmail);
          setIntendedPlan(selected);

          // If session is NOT active yet, email confirmation link was sent
          if (!data.session || data.user?.email_confirmed_at === null) {
            setPendingConfirmEmail(cleanEmail);
            setStep('confirm_email');
            setLoading(false);
            return;
          }

          // If session is immediately active (e.g. auto-confirm enabled on Supabase)
          const user = data.user;
          setAuthState(user?.email || cleanEmail, 'signed_in', user?.user_metadata?.full_name || null, user?.id || null);
          startFreeTrial(selected);
          setTimeout(() => {
            setLoading(false);
            onComplete();
          }, 400);
        }
      } else {
        // Local / Offline fallback mode: Require confirmation step first
        registerEmailLocally(cleanEmail);
        setIntendedPlan(selected);
        setPendingConfirmEmail(cleanEmail);
        setStep('confirm_email');
        setLoading(false);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      setError(message);
      setLoading(false);
    }
  };

  const handleSimulateLocalConfirmation = () => {
    const cleanEmail = pendingConfirmEmail || email || 'user@drivede.de';
    setAuthState(cleanEmail, 'signed_in', cleanEmail.split('@')[0], `local-${Date.now()}`);
    startFreeTrial(selected);
    onComplete();
  };

  const handleResendConfirmation = async () => {
    setError(null);
    setInfoMessage(null);
    if (isSupabaseConfigured && supabase && pendingConfirmEmail) {
      try {
        const { error: resendErr } = await supabase.auth.resend({
          type: 'signup',
          email: pendingConfirmEmail,
        });
        if (resendErr) throw resendErr;
        setInfoMessage(t.resendSuccess);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resend confirmation email.');
      }
    } else {
      setInfoMessage(t.resendSuccess);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      // Offline fallback
      const mockEmail = 'google-user@drivede.de';
      registerEmailLocally(mockEmail);
      setAuthState(mockEmail, 'signed_in', 'Google User', `google-${Date.now()}`);
      startFreeTrial(selected);
      onComplete();
      return;
    }

    setLoading(true);
    try {
      await signInWithProvider('google');
      startFreeTrial(selected);
      setTimeout(() => setLoading(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google authentication failed.';
      setError(message);
      setLoading(false);
    }
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
        {step !== 'plan' ? (
          <button
            onClick={() => setStep('plan')}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.changePlan}
          </button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onComplete}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            {t.back}
          </motion.button>
        )}
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center px-4 pb-8 pt-2">

        <AnimatePresence mode="wait">
          {step === 'plan' && (
            <motion.div
              key="step-plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Hero text */}
              <div className="text-center mb-8 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 mb-5">
                  <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                  <span className="text-[10px] font-bold text-blue-300 tracking-[0.2em] uppercase">{t.badge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3 italic">
                  {t.headline}
                </h1>
                <p className="text-slate-400 text-base font-medium">{t.subline}</p>
              </div>

              {/* Plan cards */}
              <div className="w-full space-y-3 mb-8">
                {planOrder.map((plan, i) => {
                  const cfg = t.plans[plan];
                  const Icon = planIcons[plan];
                  const isSelected = selected === plan;

                  return (
                    <motion.button
                      key={plan}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08, duration: 0.3 }}
                      onClick={() => setSelected(plan)}
                      className={cn(
                        'relative w-full flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group',
                        isSelected
                          ? `bg-gradient-to-r ${cfg.color} ${cfg.borderSelected} shadow-lg`
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                      )}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                      )}

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

                      <div className={cn(
                        'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

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
              <div className="w-full mb-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
                  {language === 'de' ? 'Im Test inklusive' : 'Included in trial'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {t.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-blue-400 stroke-[3px]" />
                      </div>
                      <span className="text-xs font-medium text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="w-full space-y-4">
                <button
                  onClick={handleGoToSignup}
                  className={cn(
                    'group relative w-full h-16 bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-2xl shadow-blue-600/30',
                    'text-white font-bold text-lg italic tracking-tight transition-all duration-300',
                    'flex items-center justify-center gap-3 overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  <span>{t.ctaPlan}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 stroke-[3px]" />
                  </div>
                </button>

                <p className="text-center text-[11px] text-slate-500 font-medium">{t.ctaSub}</p>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/8">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.guarantee}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{t.guaranteeDesc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'signup' && (
            <motion.div
              key="step-signup"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
            >
              {/* Plan badge summary */}
              <div className="flex items-center justify-between p-3.5 mb-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{activePlan.label} ({activePlan.price})</p>
                    <p className="text-[10px] text-blue-300 font-medium">7 Tage kostenlos freigeschaltet</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="text-[10px] font-bold text-blue-400 hover:underline uppercase"
                >
                  {t.changePlan}
                </button>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {isExistingUser ? (language === 'de' ? 'Anmelden' : 'Sign In') : t.signupHeadline}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">{t.signupSubline}</p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.emailLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5">{t.passwordLabel}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isExistingUser ? (language === 'de' ? 'Anmelden & Trial starten' : 'Sign In & Start Trial') : t.ctaSignup}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.divider}</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t.googleBtn}</span>
              </button>

              {/* Mode Toggle */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setIsExistingUser(!isExistingUser)}
                  className="text-xs text-slate-400 hover:text-white font-medium transition-colors"
                >
                  {isExistingUser
                    ? (language === 'de' ? 'Noch kein Konto? Registrieren' : 'Need an account? Sign up')
                    : t.alreadyAccount}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'confirm_email' && (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center"
            >
              {/* Mail Icon */}
              <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-5 text-blue-400">
                <Mail className="w-8 h-8 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                {t.confirmTitle}
              </h2>

              <p className="text-xs text-slate-400 mb-3 font-medium">
                {t.confirmSubline}
              </p>

              <div className="inline-block px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 font-bold text-xs mb-5 break-all">
                {pendingConfirmEmail || email}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {t.confirmDesc}
              </p>

              {infoMessage && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                {isSupabaseConfigured && supabase ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsExistingUser(true);
                      setStep('signup');
                    }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t.confirmDoneBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateLocalConfirmation}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t.confirmSimulateBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.resendLink}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="text-xs text-slate-400 hover:text-white font-medium transition-colors pt-2"
                >
                  {t.changeEmail}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

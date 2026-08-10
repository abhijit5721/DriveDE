/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * PlanPickerScreen.tsx
 *
 * Premium UI/UX Plan Selection & Account Creation Pipeline:
 * Step 1 (Plan Selection): High-converting cards with daily cost breakdown, savings badges & 7-day trial timeline.
 * Step 2 (Account Creation): 1-click email registration with real-time password criteria checklist.
 * Step 3 (Email Confirmation): Mandatory verification screen ensuring valid user accounts.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Crown, Check, ArrowRight, ShieldCheck, Zap, X, Mail, Lock, AlertCircle, ArrowLeft, CheckCircle2, RefreshCw, Shield } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { Logo } from '../common/Logo';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { signInWithProvider, isEmailRegisteredLocally, registerEmailLocally } from '../../services/auth';
import { validatePassword, getPasswordErrorMessage } from '../../utils/validation';

type Plan = '30-days' | '90-days' | 'lifetime';
type ScreenStep = 'plan' | 'signup' | 'confirm_email';

interface PlanPickerScreenProps {
  initialPlan?: Plan;
  initialStep?: ScreenStep;
  initialIsExistingUser?: boolean;
  /** 'buy' when the user arrived from a pricing CTA and goes to Stripe after signup */
  intent?: 'trial' | 'buy';
  onComplete: () => void;
  onCancel?: () => void;
}

const PLAN_CONFIG = {
  'de': {
    badge: '✨ 7 TAGE TESTVERSION • 100% KOSTENLOS',
    headline: 'Wähle deinen passenden Pro-Plan',
    subline: 'Teste alle KI-Funktionen, 3D-Simulationen & GPS-Tracking 7 Tage lang kostenlos.',
    signupHeadline: 'Erstelle dein Konto',
    signupSubline: 'Melde dich an, um deine 7-Tage Pro Testversion zu aktivieren.',
    plans: {
      '30-days': {
        label: '30-Tage-Pass',
        tag: 'EINSTEIGER',
        tagColor: 'bg-slate-100 text-slate-600 border border-slate-300',
        price: '€9.99',
        dailyPrice: '€0.33 / Tag',
        period: 'nach 7 Tagen Testphase',
        highlight: 'Perfekt für die letzten Wochen vor der Fahrprüfung',
        color: 'from-slate-100 via-white to-slate-50',
        borderSelected: 'border-slate-400 shadow-slate-500/10',
        accentGlow: 'from-slate-500/10 to-transparent',
      },
      '90-days': {
        label: '90-Tage-Pass',
        tag: '🔥 BELIEBTESTE WAHL',
        tagColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black',
        price: '€19.99',
        dailyPrice: '€0.22 / Tag',
        saveBadge: '33% SPAREN',
        period: 'nach 7 Tagen Testphase',
        highlight: 'Deckt deine gesamte Fahrschulausbildung ab',
        color: 'from-blue-50 via-white to-blue-100/60',
        borderSelected: 'border-blue-500 shadow-blue-500/25',
        accentGlow: 'from-blue-500/10 to-transparent',
      },
      'lifetime': {
        label: 'Lifetime-Zugang',
        tag: '👑 BESTES ANGEBOT',
        tagColor: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black',
        price: '€29.99',
        dailyPrice: 'Einmalig · Für immer',
        saveBadge: 'MAXIMALER WERT',
        period: 'einmalig, kein Abo',
        highlight: 'Einmal zahlen, für immer auf allen Geräten nutzen',
        color: 'from-emerald-50 via-white to-emerald-100/60',
        borderSelected: 'border-emerald-500 shadow-emerald-500/25',
        accentGlow: 'from-emerald-500/10 to-transparent',
      },
    },
    features: [
      { text: 'GPS Live-Fahrtracking & Fahrtenbuch', badge: 'GPS' },
      { text: 'Echtzeit-Tempolimit-Warnungen (OpenStreetMap)', badge: 'Echtzeit' },
      { text: 'KI-Fahrlehrer Auswertungen nach jeder Fahrt', badge: 'KI' },
      { text: '3D-Einparktrainer & Prüfungs-Simulationen', badge: '3D' },
      { text: 'Fahrbereitschafts- & Fortschritts-Score', badge: 'Score' },
    ],
    ctaPlan: (planLabel: string) => `Mit ${planLabel} 7 Tage kostenlos testen →`,
    ctaSignup: 'Konto erstellen & 7 Tage Pro testen',
    ctaSub: 'Keine Kreditkarte erforderlich · Sofortiger Zugriff · Jederzeit kündbar',
    guarantee: '100% Risikofrei testen',
    guaranteeDesc: 'Du kannst innerhalb der 7 Tage jederzeit mit einem Klick kündigen.',
    timelineTitle: 'So funktioniert deine Testphase:',
    timelineSteps: [
      { step: '1', title: 'Heute', desc: '7 Tage Pro kostenlos freischalten' },
      { step: '2', title: 'Tag 5', desc: 'Erinnerungs-Hinweis per E-Mail' },
      { step: '3', title: 'Tag 7', desc: 'Pro-Pass wählen oder einfach beenden' },
    ],
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
    ratingText: '🔒 Sichere Zahlung via Stripe · 100% DSGVO-konform',
  },
  'en': {
    badge: '✨ 7-DAY TRIAL • 100% FREE',
    headline: 'Choose your perfect Pro plan',
    subline: 'Test all AI features, 3D simulations & GPS tracking free for 7 full days.',
    signupHeadline: 'Create your account',
    signupSubline: 'Sign up to activate your 7-day unlimited Pro trial.',
    plans: {
      '30-days': {
        label: '30-Day Pass',
        tag: 'STARTER',
        tagColor: 'bg-slate-100 text-slate-600 border border-slate-300',
        price: '€9.99',
        dailyPrice: '€0.33 / day',
        period: 'after 7-day trial',
        highlight: 'Perfect for quick prep in your final driving weeks',
        color: 'from-slate-100 via-white to-slate-50',
        borderSelected: 'border-slate-400 shadow-slate-500/10',
        accentGlow: 'from-slate-500/10 to-transparent',
      },
      '90-days': {
        label: '90-Day Pass',
        tag: '🔥 MOST POPULAR',
        tagColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black',
        price: '€19.99',
        dailyPrice: '€0.22 / day',
        saveBadge: 'SAVE 33%',
        period: 'after 7-day trial',
        highlight: 'Covers your entire driving school course',
        color: 'from-blue-50 via-white to-blue-100/60',
        borderSelected: 'border-blue-500 shadow-blue-500/25',
        accentGlow: 'from-blue-500/10 to-transparent',
      },
      'lifetime': {
        label: 'Lifetime Access',
        tag: '👑 BEST VALUE',
        tagColor: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black',
        price: '€29.99',
        dailyPrice: 'One-time · Forever',
        saveBadge: 'MAX VALUE',
        period: 'one-time, no subscription',
        highlight: 'Pay once, use forever across all your devices',
        color: 'from-emerald-50 via-white to-emerald-100/60',
        borderSelected: 'border-emerald-500 shadow-emerald-500/25',
        accentGlow: 'from-emerald-500/10 to-transparent',
      },
    },
    features: [
      { text: 'GPS Live Driving Tracker & Logbook', badge: 'GPS' },
      { text: 'Real-Time Speed Limit Alerts (OpenStreetMap)', badge: 'Live' },
      { text: 'AI Instructor Debriefing After Every Drive', badge: 'AI' },
      { text: '3D Parking Simulator & Exam Scenarios', badge: '3D' },
      { text: 'Exam Readiness & Progress Analytics', badge: 'Score' },
    ],
    ctaPlan: (planLabel: string) => `Start 7-Day Free Trial with ${planLabel} →`,
    ctaSignup: 'Create Account & Start 7-Day Trial',
    ctaSub: 'No credit card required · Instant access · Cancel anytime',
    guarantee: '100% Risk-Free Trial',
    guaranteeDesc: 'Cancel anytime during the 7 days with a single click.',
    timelineTitle: 'How your free trial works:',
    timelineSteps: [
      { step: '1', title: 'Today', desc: 'Unlock 7 Days of Pro free' },
      { step: '2', title: 'Day 5', desc: 'Friendly reminder notification' },
      { step: '3', title: 'Day 7', desc: 'Keep Pro or simply stop' },
    ],
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
    ratingText: '🔒 Secure payment via Stripe · 100% GDPR compliant',
  },
};

const planOrder: Plan[] = ['30-days', '90-days', 'lifetime'];
const planIcons = {
  '30-days': Clock,
  '90-days': Calendar,
  'lifetime': Crown,
};

export function PlanPickerScreen({ initialPlan = '90-days', initialStep = 'signup', initialIsExistingUser = false, intent = 'trial', onComplete, onCancel }: PlanPickerScreenProps) {
  const { language, startFreeTrial, setAuthState, setIntendedPlan } = useAppStore();
  const [step, setStep] = useState<ScreenStep>(initialStep);
  const [selected, setSelected] = useState<Plan>(initialPlan);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(initialIsExistingUser);
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

    if (!isExistingUser) {
      const passValidation = validatePassword(password);
      if (!passValidation.isValid) {
        setError(getPasswordErrorMessage(passValidation, language));
        return;
      }
    } else {
      if (password.length < 6) {
        setError(isDe ? 'Passwort muss mindestens 6 Zeichen lang sein.' : 'Password must be at least 6 characters.');
        return;
      }
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

          // If session is immediately active
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
    <div className="h-full w-full bg-slate-50 flex flex-col overflow-y-auto selection:bg-blue-500/30">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-200/50 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-200/50 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between px-4 sm:px-8 py-5 shrink-0 z-10">
        <Logo size="sm" />
        {step !== 'plan' ? (
          <button
            onClick={() => setStep('plan')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-all hover:bg-slate-100 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.changePlan}
          </button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={onCancel || onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold uppercase tracking-wider transition-all hover:bg-slate-100 shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            {t.back}
          </motion.button>
        )}
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col items-center px-3 sm:px-6 pb-12 pt-1 sm:pt-4 z-10">

        <AnimatePresence mode="wait">
          {step === 'plan' && (
            <motion.div
              key="step-plan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Hero text */}
              <div className="text-center mb-6 sm:mb-8 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 mb-3 sm:mb-4">
                  <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-black text-blue-700 tracking-wider uppercase">{t.badge}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
                  {t.headline}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">{t.subline}</p>
              </div>

              {/* Plan cards */}
              <div className="w-full space-y-3 sm:space-y-3.5 mb-6 sm:mb-8">
                {planOrder.map((plan, i) => {
                  const cfg = t.plans[plan];
                  const Icon = planIcons[plan];
                  const isSelected = selected === plan;

                  return (
                    <motion.button
                      key={plan}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 + i * 0.08, duration: 0.35 }}
                      onClick={() => setSelected(plan)}
                      className={cn(
                        'relative w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden group transform active:scale-[0.99]',
                        isSelected
                          ? `bg-gradient-to-r ${cfg.color} ${cfg.borderSelected} scale-[1.01]`
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      )}
                    >
                      {/* Selection Glow Sheen */}
                      {isSelected && (
                        <div className={cn('absolute inset-0 bg-gradient-to-r opacity-50 pointer-events-none', cfg.accentGlow)} />
                      )}

                      {/* Radio Selector */}
                      <div className={cn(
                        'relative shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                        isSelected ? 'border-slate-900 bg-slate-900 shadow-md' : 'border-slate-300 bg-white'
                      )}>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-2.5 h-2.5 rounded-full bg-white"
                            />
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Icon */}
                      <div className={cn(
                        'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md',
                        isSelected ? 'bg-slate-900/10 text-slate-900' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Main Label & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn(
                            'text-sm sm:text-base font-bold transition-colors truncate',
                            isSelected ? 'text-slate-900' : 'text-slate-700'
                          )}>
                            {cfg.label}
                          </span>
                          <span className={cn('text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm', cfg.tagColor)}>
                            {cfg.tag}
                          </span>
                        </div>
                        <p className={cn(
                          'text-[11px] sm:text-xs font-medium transition-colors truncate',
                          isSelected ? 'text-slate-600' : 'text-slate-500'
                        )}>
                          {cfg.highlight}
                        </p>
                      </div>

                      {/* Pricing & Daily Rate Breakdown */}
                      <div className="shrink-0 text-right">
                        <div className={cn(
                          'text-xl sm:text-2xl font-black tracking-tight transition-colors',
                          isSelected ? 'text-slate-900' : 'text-slate-700'
                        )}>
                          {cfg.price}
                        </div>
                        <div className={cn(
                          'text-[10px] sm:text-xs font-bold transition-colors',
                          isSelected ? 'text-emerald-600' : 'text-slate-500'
                        )}>
                          {cfg.dailyPrice}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Trial Assurance Timeline */}
              <div className="w-full mb-6 sm:mb-8 rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3 text-center flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.timelineTitle}</span>
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {t.timelineSteps.map((s, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black text-xs flex items-center justify-center mb-1.5 shadow-sm">
                        {s.step}
                      </div>
                      <p className="text-xs font-bold text-slate-900 mb-0.5">{s.title}</p>
                      <p className="text-[10px] text-slate-500 leading-tight font-medium hidden sm:block">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features included */}
              <div className="w-full mb-6 sm:mb-8">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">
                  {isDe ? 'In deinem 7-Tage-Testpaket enthalten:' : 'Included in your 7-day trial package:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {t.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200">
                      <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3px]" />
                      </div>
                      <span className="text-xs font-medium text-slate-700 flex-1">{f.text}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wider shrink-0">
                        {f.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA & Rating Footer */}
              <div className="w-full space-y-3.5">
                <button
                  onClick={handleGoToSignup}
                  className={cn(
                    'group relative w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-2xl shadow-blue-600/30',
                    'text-white font-black text-base sm:text-lg tracking-tight transition-all duration-300',
                    'flex items-center justify-center gap-3 overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]'
                  )}
                >
                  <span>{t.ctaPlan(activePlan.label)}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 stroke-[3px]" />
                  </div>
                </button>

                <p className="text-center text-[11px] text-slate-600 font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.ctaSub}</span>
                </p>

                <p className="text-center text-xs text-slate-500 font-semibold pt-1">
                  {t.ratingText}
                </p>
              </div>
            </motion.div>
          )}

          {step === 'signup' && (
            <motion.div
              key="step-signup"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl"
            >
              {/* Plan badge summary */}
              <div className="flex items-center justify-between p-3.5 mb-6 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{activePlan.label} ({activePlan.price})</p>
                    <p className="text-[10px] text-blue-700 font-medium">
                      {intent === 'buy'
                        ? (language === 'de' ? 'Einmalzahlung — inkl. 7 Tage Pro ab sofort' : 'One-time payment — includes Pro from day one')
                        : (language === 'de' ? '7 Tage kostenlos freigeschaltet' : 'Unlocked free for 7 days')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                >
                  {t.changePlan}
                </button>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {isExistingUser ? (language === 'de' ? 'Anmelden' : 'Sign In') : t.signupHeadline}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {intent === 'buy'
                    ? (language === 'de'
                        ? 'Erstelle dein Konto — danach geht es direkt zur sicheren Zahlung.'
                        : 'Create your account — then you go straight to secure checkout.')
                    : t.signupSubline}
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.emailLabel}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.passwordLabel}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {!isExistingUser && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {isDe ? 'Passwortanforderungen:' : 'Password requirements:'}
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-[11px] font-medium">
                        {[
                          { ok: validatePassword(password).hasMinLength, label: isDe ? 'Mind. 8 Zeichen' : 'Min 8 characters' },
                          { ok: validatePassword(password).hasUpper, label: isDe ? 'Großbuchstabe (A-Z)' : 'Uppercase (A-Z)' },
                          { ok: validatePassword(password).hasLower, label: isDe ? 'Kleinbuchstabe (a-z)' : 'Lowercase (a-z)' },
                          { ok: validatePassword(password).hasNumber, label: isDe ? 'Zahl (0-9)' : 'Number (0-9)' },
                          { ok: validatePassword(password).hasSpecial, label: isDe ? 'Sonderzeichen (!@#$)' : 'Special char (!@#$)' },
                        ].map((item, idx) => (
                          <div key={idx} className={cn('flex items-center gap-1.5', item.ok ? 'text-emerald-600 font-bold' : 'text-slate-500')}>
                            <span className="text-xs">{item.ok ? '✓' : '•'}</span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {intent === 'buy'
                          ? (language === 'de' ? 'Konto erstellen & zur Zahlung' : 'Create Account & Continue to Payment')
                          : isExistingUser
                            ? (language === 'de' ? 'Anmelden & Trial starten' : 'Sign In & Start Trial')
                            : t.ctaSignup}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.divider}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
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
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
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
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl text-center"
            >
              {/* Mail Icon */}
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-5 text-blue-600">
                <Mail className="w-8 h-8 animate-pulse" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                {t.confirmTitle}
              </h2>

              <p className="text-xs text-slate-500 mb-3 font-medium">
                {t.confirmSubline}
              </p>

              <div className="inline-block px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs mb-5 break-all">
                {pendingConfirmEmail || email}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                {t.confirmDesc}
              </p>

              {infoMessage && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
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
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
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
                  className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-600 text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.resendLink}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('signup')}
                  className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors pt-2"
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

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Car, BadgeCheck, Zap, Users, Shield, 
  Menu, X, ArrowRight, Play, CheckCircle2, Cog,
  Star, ChevronDown, Check, MapPin, Award,
  Globe, Heart, ArrowUpRight, ShieldCheck, Coins, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { ContactForm } from '../common/ContactForm';
import { Logo } from '../common/Logo';
import { PlanPickerScreen } from './PlanPickerScreen';
import { startCheckout } from '../../services/checkout';
import { TestimonialsSection } from './TestimonialsSection';
import { LeadCaptureSection } from './LeadCaptureSection';

export function Welcome() {
  const { 
    language, setLanguage, setHasVisited, licenseType,
    authStatus, userProgress 
  } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [selectedPlanForPicker, setSelectedPlanForPicker] = useState<'30-days' | '90-days' | 'lifetime'>('90-days');
  const [pickerInitialStep, setPickerInitialStep] = useState<'plan' | 'signup'>('plan');
  const [pickerInitialIsExistingUser, setPickerInitialIsExistingUser] = useState(false);
  // Set when the user arrived from a pricing CTA — they intend to buy that tier now
  const [purchaseIntent, setPurchaseIntent] = useState<'30-days' | '90-days' | 'lifetime' | null>(null);
  
  const t = TRANSLATIONS[language];
  const isDe = language === 'de';

  // A signed-in user always sees "Back to Dashboard" (they'll hit LicenseSelector if no path chosen).
  const isReturningUser = (authStatus === 'signed_in') ||
    (licenseType !== null && (userProgress.completedLessons.length > 0 || userProgress.drivingSessions.length > 0));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = (
    plan?: '30-days' | '90-days' | 'lifetime',
    step: 'plan' | 'signup' = 'plan',
    isExistingUser = false,
    intent: 'trial' | 'buy' = 'trial'
  ) => {
    if (isReturningUser) {
      setHasVisited(true);
      return;
    }
    if (plan) {
      setSelectedPlanForPicker(plan);
    }
    setPurchaseIntent(intent === 'buy' && plan ? plan : null);
    setPickerInitialStep(step);
    setPickerInitialIsExistingUser(isExistingUser);
    setShowPlanPicker(true);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignInClick = () => {
    handleStart('90-days', 'signup', true);
  };

  const handlePlanPickerComplete = async () => {
    // Someone who clicked a pricing CTA meant to buy, not to start a trial.
    // The trial is started regardless, so abandoning Stripe still leaves them
    // with the full 7 days rather than nothing.
    if (purchaseIntent) {
      const result = await startCheckout(purchaseIntent, language);
      if (result.ok) return; // browser is navigating to Stripe
      console.warn('[Welcome] Direct checkout unavailable, entering app on trial:', result.reason);
    }
    setHasVisited(true);
  };

  const navLinks = useMemo(() => [
    { name: isDe ? 'Startseite' : t.common.home, href: '#' },
    { name: isDe ? 'Warum DriveDE' : 'Why DriveDE', href: '#problem-solution' },
    { name: isDe ? 'So funktioniert\'s' : 'How It Works', href: '#how-it-works' },
    { name: isDe ? 'Funktionen' : t.common.features, href: '#features' },
    { name: isDe ? 'Preise' : 'Pricing', href: '#pricing' },
    { name: isDe ? 'Über uns' : 'About', href: '#about' },
    { name: isDe ? 'Karriere' : 'Careers', href: '#careers' },
    { name: 'FAQ', href: '#faq' },
  ], [isDe, t]);

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const faqs = [
    {
      q: isDe ? 'Wie hilft mir DriveDE Geld zu sparen?' : 'How does DriveDE help me save money?',
      a: isDe
        ? 'In Deutschland kostet eine Fahrstunde bis zu 95€. Indem du Manöver (wie Einparken) in der 3D-Simulation vorbereitest und deine Fahrfehler per GPS analysierst, brauchst du weniger Fahrstunden und bestehst im ersten Anlauf.'
        : 'In Germany, driving lessons cost up to €95/hour. By mentally mastering maneuvers via 3D simulations and reviewing GPS mistake telemetry, students take fewer extra hours and pass on their 1st attempt.'
    },
    {
      q: isDe ? 'Ersetzt DriveDE meine Fahrschule?' : 'Does DriveDE replace my driving school?',
      a: isDe 
        ? 'Nein, DriveDE ist die perfekte Ergänzung zu deinen praktischen Fahrstunden. Die App trackt deine Fahrten per GPS, gibt dir KI-Auswertungen und bereitet dich optimal auf deine Prüfung vor.' 
        : 'No, DriveDE is the ideal companion app for your practical driving lessons. It tracks your drives via GPS, provides AI debriefings, and systematically prepares you to pass your exam.'
    },
    {
      q: isDe ? 'Funktioniert DriveDE auch für die Umschreibung?' : 'Does DriveDE work for foreign license conversion (Umschreibung)?',
      a: isDe 
        ? 'Ja! DriveDE hat einen eigenen Umschreibungspfad, der speziell auf Fahrer mit ausländischem Führerschein abgestimmt ist.' 
        : 'Yes! DriveDE features a dedicated Umschreibung mode tailored specifically for foreign license holders converting to a German driving license.'
    },
    {
      q: isDe ? 'Funktioniert die Ortung und Geschwindigkeitswarnung automatisch?' : 'Does GPS tracking and speed limit detection work automatically?',
      a: isDe 
        ? 'Ja. Sobald du vor deiner Fahrstunde auf "Start" tippst, erfasst DriveDE deine Route, erkennt Geschwindigkeitsbegrenzungen und warnt dich bei Fehlern.' 
        : 'Yes. Once you tap "Start" before your drive, DriveDE automatically logs your route, matches OpenStreetMap speed limits, and warns you of potential mistakes.'
    },
    {
      q: isDe ? 'Welche Führerscheinklassen werden unterstützt?' : 'Which license classes are supported?',
      a: isDe 
        ? 'Wir unterstützen Klasse B (Schaltgetriebe & Automatik), B197 sowie den Umschreibungspfad.' 
        : 'We support Class B (Manual & Automatic), B197, and Foreign License Conversion (Umschreibung).'
    }
  ];

  // Every paid pass unlocks the identical feature set — the tiers differ only in
  // how long that access lasts. Keep this list single-sourced so the pricing
  // table can never drift from what the app actually gates.
  const proFeatures = [
    isDe ? 'Unbegrenztes GPS Live Fahrtenbuch' : 'Unlimited GPS Live Driving Tracker',
    isDe ? 'OpenStreetMap Tempolimit-Warnungen' : 'OpenStreetMap Speed Limit Warnings',
    isDe ? 'KI-Fahrlehrer Auswertungen' : 'AI Instructor Debriefings',
    isDe ? '3D Manöversimulationen (Einparken, Autobahn)' : '3D Maneuver Simulations (Einparken, Autobahn)',
    isDe ? 'Prüfungsreife-Anzeige & Fehleranalyse' : 'Exam Readiness Score & Mistake Analysis',
    isDe ? 'Fahrlehrer PDF Berichtsexport' : 'Fahrlehrer PDF Report Exports',
    isDe ? 'Kostenrechner & Gefahren-Hotspots' : 'Budget Estimator & Mistake Hotspots',
    isDe ? 'Vollständiger Theorie-Lehrplan' : 'Full Theory Curriculum',
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-900 selection:bg-blue-500/30 text-slate-100">
      {/* Plan Picker Overlay — shown after "Get Started" click */}
      {showPlanPicker && (
        <div className="fixed inset-0 z-[100] animate-fade-in overflow-hidden">
          <PlanPickerScreen 
            initialPlan={selectedPlanForPicker} 
            initialStep={pickerInitialStep}
            initialIsExistingUser={pickerInitialIsExistingUser}
            intent={purchaseIntent ? 'buy' : 'trial'}
            onComplete={handlePlanPickerComplete}
            onCancel={() => setShowPlanPicker(false)} 
          />
        </div>
      )}
      {/* Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
          alt="Driving Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/65 to-slate-950/95" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-slate-900/90 backdrop-blur-md py-3 shadow-xl border-b border-white/10' : 'bg-transparent py-6'
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 transition hover:opacity-80 active:scale-95"
          >
            <Logo className="h-10 w-10 select-none drop-shadow-[0_4px_8px_rgba(59,130,246,0.3)]" />
            <span className="text-xl font-bold tracking-tighter text-white">
              Drive<span className="text-blue-500">DE</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className="text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                {link.name}
              </a>
            ))}
            {isReturningUser ? (
              <button 
                onClick={() => handleStart()}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-600/20"
              >
                {t.common.backToDashboard}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSignInClick}
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition"
                >
                  {isDe ? 'Anmelden' : 'Sign In'}
                </button>
                <button 
                  onClick={() => handleStart('90-days', 'plan')}
                  className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  {t.common.startNow}
                </button>
              </div>
            )}

            {/* Language Switcher Desktop */}
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700/50 pl-4">
              <button onClick={() => setLanguage('de')} className={cn('px-2.5 py-1 text-xs font-bold rounded-lg transition-all', language === 'de' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white')}>DE</button>
              <button onClick={() => setLanguage('en')} className={cn('px-2.5 py-1 text-xs font-bold rounded-lg transition-all', language === 'en' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-white')}>EN</button>
            </div>
          </div>

          <button className="text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900 p-6 shadow-2xl md:hidden border-b border-slate-800">
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)} className="text-lg font-bold text-white">{link.name}</a>
              ))}
              <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
                <span className="text-xs font-bold text-slate-400">Language:</span>
                <button onClick={() => setLanguage('de')} className={cn('px-3 py-1 text-xs font-bold rounded-lg', language === 'de' ? 'bg-blue-500 text-white' : 'text-slate-400')}>DE</button>
                <button onClick={() => setLanguage('en')} className={cn('px-3 py-1 text-xs font-bold rounded-lg', language === 'en' ? 'bg-blue-500 text-white' : 'text-slate-400')}>EN</button>
              </div>
              {isReturningUser ? (
                <button onClick={() => handleStart()} className="rounded-xl bg-emerald-600 py-3.5 text-lg font-bold text-white">
                  {t.common.backToDashboard}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button onClick={handleSignInClick} className="rounded-xl bg-slate-800 py-3 text-base font-bold text-white border border-slate-700">
                    {isDe ? 'Anmelden' : 'Sign In'}
                  </button>
                  <button onClick={() => handleStart('90-days', 'plan')} className="rounded-xl bg-blue-600 py-3.5 text-lg font-bold text-white">
                    {t.common.startNow}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-28 text-center pb-16">
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 max-w-4xl">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
            <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse fill-emerald-400" />
            {isDe ? '7 Tage Pro Testversion inklusive • Keine Kreditkarte nötig' : 'Includes 7-Day Free Pro Trial • No Credit Card Required'}
          </div>

          <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl leading-tight">
            {t.welcome.hero.titlePrefix}
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              {t.welcome.hero.titleHighlight}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl font-normal leading-relaxed">
            {t.welcome.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button 
              onClick={() => handleStart()}
              data-testid="welcome-start-btn"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/40 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
            >
              {isReturningUser ? t.common.backToDashboard : t.common.getStartedFree}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-8 py-5 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/20 border border-white/10"
            >
              <Play className="h-5 w-5 text-blue-400" />
              {t.common.watchDemo}
            </button>
          </div>

          {/* Social Proof Trust Stars */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-slate-400 text-sm font-medium">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <span>
              <strong>4.9/5</strong> {isDe ? 'Bewertung von 1.200+ Fahrschülern in Deutschland' : 'Rating from 1,200+ Students in Germany'}
            </span>
            {/* Urgency Badge (DRI-8) — static count for now; consider wiring to a real weekly signup count later */}
            <span
              data-testid="urgency-badge"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-md"
            >
              🎉 {isDe ? '47 Fahrschüler diese Woche beigetreten' : '47 students joined this week'}
            </span>
          </div>
        </div>

        {/* 📱 3D Glass Interactive App Mockup Showcase */}
        <div className="mt-16 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900/90 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition hover:border-blue-500/30">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 pb-3 pt-1 text-left">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="ml-4 text-xs font-mono text-slate-400">drivede.app/dashboard</span>
          </div>

          {/* Inner App Dashboard Screen Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 text-left">
            {/* Live GPS Tracker Preview Card */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-950/30 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  {isDe ? 'Live GPS Aktiv' : 'Live GPS Active'}
                </span>
                <span className="text-xl font-black text-amber-400">50 km/h</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">München Autobahn A99</p>
              <p className="text-xs text-slate-400">{isDe ? 'OpenStreetMap Tempolimit Abgleich' : 'OpenStreetMap Speed Limit Match'}</p>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-4/5 bg-gradient-to-r from-blue-500 to-emerald-400" />
              </div>
            </div>

            {/* Exam Readiness Gauge Card */}
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-5 backdrop-blur-xl text-center flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-emerald-400 mb-1">94%</div>
              <p className="text-sm font-bold text-white">{isDe ? 'Bestehenschance' : 'Exam Chance'}</p>
              <p className="text-xs text-emerald-400 font-semibold mt-1">{isDe ? 'Hohe Bestehenschance!' : 'High Chance of Passing!'}</p>
              <span className="mt-3 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {isDe ? 'Bereit für die Fahrprüfung' : 'Ready for Fahrprüfung'}
              </span>
            </div>

            {/* AI Briefing Preview Card */}
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-purple-400 fill-purple-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-purple-300">{isDe ? 'KI-Fahrlehrer Auswertung' : 'AI Instructor Briefing'}</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                {isDe 
                  ? '"Perfekter Schulterblick beim Rechtsabbiegen! Achte beim Auffahren auf die Autobahn noch etwas mehr auf den Abstand."'
                  : '"Great Schulterblick execution on right turns! Focus on maintaining distance during Highway merging."'
                }
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 💡 Problem vs Solution: Why Driving in Germany Costs €3,000+ */}
      <section id="problem-solution" className="relative z-10 bg-slate-950/90 px-6 py-24 backdrop-blur-xl border-t border-white/10">
        <div className="mx-auto max-w-6xl text-left">
          <div className="text-center mb-16">
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest">
              {isDe ? 'Das 3.000€+ Fahrschul-Problem' : 'The €3,000+ Driving School Problem'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl leading-tight">
              {isDe ? 'Weniger Fahrstunden bezahlen.' : 'Spend Less on Driving Hours.'} <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{isDe ? 'Schneller bestehen.' : 'Pass Faster.'}</span>
            </h2>
            <p className="mt-4 text-slate-300 max-w-2xl mx-auto text-base">
              {isDe 
                ? 'In Deutschland kostet eine Fahrstunde bis zu 95€. Die meisten Fahrschüler brauchen 35–45+ Stunden, weil sie rein nach Versuch und Irrtum lernen.'
                : 'In Germany, driving lessons (Fahrstunden) cost up to €95 per hour. Most students take 35–45+ hours because they learn purely by trial and error.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Old Way (Expensive & Slow) */}
            <div className="rounded-3xl border border-red-500/30 bg-red-950/20 p-8 text-left backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 font-black text-xl">
                    ✕
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{isDe ? 'Der alte teure Weg' : 'The Old Expensive Way'}</h3>
                    <p className="text-xs text-red-400 font-semibold">{isDe ? 'Ohne DriveDE' : 'Without DriveDE'}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-red-950/40 p-4 border border-red-500/20">
                    <Coins className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{isDe ? '3.200€+ Gesamtkosten' : '€3,200+ Total Spent'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{isDe ? 'Durchschnittlich 35 bis 45+ Fahrstunden zu je 75€–95€ pro Stunde.' : 'Average student takes 35 to 45+ Fahrstunden at €75–€95 per hour.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-red-950/40 p-4 border border-red-500/20">
                    <Clock className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{isDe ? '38% Durchfallquote beim 1. Versuch' : '38% First-Time Failure Rate'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{isDe ? 'Durchfallen kostet 600€+ für Pflicht-Zusatzstunden und Prüfungsgebühren.' : 'Failing your practical exam costs €600+ in mandatory extra lessons and re-test fees.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-red-950/40 p-4 border border-red-500/20">
                    <Shield className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{isDe ? 'Keine Transparenz' : 'No Progress Visibility'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{isDe ? 'Keine objektiven Daten, ob du wirklich prüfungsreif bist.' : 'Zero objective data on whether you are truly exam ready — leaving you dependent on guesswork.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DriveDE Way (Smart, Fast & Saves €1,000+) */}
            <div className="relative rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 via-slate-900/95 to-slate-900 p-8 text-left shadow-2xl shadow-emerald-500/15 backdrop-blur-xl flex flex-col justify-between">
              <span className="absolute -top-4 right-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 px-4 py-1 text-xs font-bold text-slate-950 shadow-md">
                {isDe ? 'DER DRIVEDE VORTEIL' : 'THE DRIVEDE ADVANTAGE'}
              </span>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{isDe ? 'Der smarte DriveDE Weg' : 'The DriveDE Smart Way'}</h3>
                    <p className="text-xs text-emerald-400 font-bold">{isDe ? 'Geld sparen & beim 1. Versuch bestehen' : 'Save Money & Pass First Try'}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-950/40 p-4 border border-emerald-500/30">
                    <Coins className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{isDe ? '800€ – 1.200€ an Fahrstunden sparen' : 'Save €800 – €1,200 in Driving Hours'}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{isDe ? 'Bereite Manöver gedanklich mit 3D-Simulationen vor, um weniger Fahrstunden zu benötigen.' : 'Practice maneuvers mentally with 3D simulations before stepping into the car to reduce total driving hours.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-950/40 p-4 border border-emerald-500/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{isDe ? 'Kein Durchfallen wegen Tempolimit' : 'Zero Speed Limit Exam Failures'}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{isDe ? 'Echtzeit OpenStreetMap GPS-Warnungen verhindern die häufigste Ursache für Prüfungsausfälle.' : 'Real-time OpenStreetMap GPS limit matching prevents the #1 cause of practical test disqualification.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-emerald-950/40 p-4 border border-emerald-500/30">
                    <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">{isDe ? '100% objektive Prüfungsreife' : '100% Objective Exam Readiness Score'}</p>
                      <p className="text-xs text-slate-300 mt-0.5">{isDe ? 'Erkenne genau den Tag, an dem du 90%+ Prüfungsreife erreichst.' : 'Know the exact day you hit 90%+ readiness to schedule your Fahrprüfung with zero doubt.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📚 "More than a theory app" — intercepts Theorie-App search intent and reframes it */}
          <div className="mt-16 mx-auto max-w-3xl rounded-3xl border border-blue-500/20 bg-blue-950/20 p-8 text-center backdrop-blur-xl">
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest">
              {isDe ? 'Mehr als eine Theorie-App' : 'More Than a Theory App'}
            </span>
            <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              {isDe
                ? 'Führerschein Theorie-Apps bringen dich nur bis zur Theorieprüfung'
                : 'Theory apps only get you through the theory exam'}
            </h3>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              {isDe
                ? 'Der wirklich teure Teil beginnt danach: die praktischen Fahrstunden. Was dein Fahrlehrer dir beibringt — Schulterblick, Einparken, Auffahren auf die Autobahn — findest du in keiner Theorie-App und kaum im Internet erklärt.'
                : 'The truly expensive part starts after: your practical driving lessons. What your instructor teaches you — Schulterblick, parking maneuvers, Autobahn merging — isn\'t in any theory app, and searching the internet for it lesson by lesson gets you nowhere.'}
            </p>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-semibold">
              {isDe
                ? 'DriveDE bringt genau dieses Wissen auf dein Handy: Theorie lernen und die praktische Fahrprüfung meistern — alles in einer App.'
                : 'DriveDE puts exactly that knowledge at your fingertips: learn theory and master the practical exam — everything in one app.'}
            </p>
          </div>
        </div>
      </section>

      {/* 🌍 Expat / Umschreibung Social Proof (DRI-5) */}
      <TestimonialsSection />

      {/* 🚀 How It Works Section */}
      <section id="how-it-works" className="relative z-10 bg-slate-950/80 px-6 py-24 backdrop-blur-xl border-t border-white/10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest">
              {isDe ? 'Einfacher 3-Schritte Ablauf' : 'Simple 3-Step Process'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{isDe ? 'So funktioniert DriveDE' : 'How DriveDE Works'}</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              {isDe 
                ? 'Von deiner ersten Fahrstunde bis zum Erhalt deines Führerscheins.'
                : 'From your very first Fahrstunde to receiving your official Führerschein.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: isDe ? 'Fahrstunden aufzeichnen' : 'Track Driving Lessons',
                desc: isDe 
                  ? 'Tippe vor deiner Fahrstunde auf Start. GPS zeichnet Route, Tempolimits und Fehler auf.'
                  : 'Tap Start during your Fahrstunde. GPS logs route, speed limits, and traffic signs in real time.',
                icon: MapPin,
                color: 'from-blue-500 to-indigo-600'
              },
              {
                step: '02',
                title: isDe ? 'KI-Fehleranalyse & 3D' : 'AI Mistake Debriefings',
                desc: isDe 
                  ? 'Nutze KI-Auswertungen und 3D-Manöversimulationen (Einparken) zur gezielten Vorbereitung.'
                  : 'Review post-drive briefings & 3D maneuver simulations (Einparken, Autobahn) before your next lesson.',
                icon: Zap,
                color: 'from-purple-500 to-indigo-600'
              },
              {
                step: '03',
                title: isDe ? 'Prüfung sicher bestehen' : 'Pass Your Fahrprüfung',
                desc: isDe 
                  ? 'Verfolge deine Prüfungsreife bis 100% und gehe voller Selbstvertrauen in die Fahrprüfung.'
                  : 'Monitor your Exam Readiness Gauge until you hit 100% confidence and get your license.',
                icon: Award,
                color: 'from-emerald-500 to-teal-600'
              }
            ].map((s, i) => (
              <div key={i} className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-left transition hover:border-blue-500/40 hover:scale-[1.02]">
                <div className={cn('mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-xl', s.color)}>
                  <s.icon className="h-7 w-7" />
                </div>
                <span className="absolute top-8 right-8 text-4xl font-black text-slate-800">{s.step}</span>
                <h3 className="mb-3 text-xl font-bold text-white">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mid-Page CTA (DRI-6) */}
          <div className="mt-14 text-center">
            <button
              onClick={() => handleStart()}
              data-testid="cta-how-it-works"
              className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
            >
              {isReturningUser ? t.common.backToDashboard : (isDe ? 'Jetzt kostenlos starten' : 'Start Free Today')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-xs text-slate-500">
              {isDe ? '7 Tage Pro Testversion • Keine Kreditkarte nötig' : '7-Day Free Pro Trial • No Credit Card Required'}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-slate-900 px-6 py-24 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-5xl">{t.welcome.features.title}</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">{t.welcome.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: t.welcome.features.aiCoaching.title, desc: t.welcome.features.aiCoaching.desc },
              { icon: BadgeCheck, title: t.welcome.features.maneuverReplay.title, desc: t.welcome.features.maneuverReplay.desc },
              { icon: Users, title: t.welcome.features.instructorSync.title, desc: t.welcome.features.instructorSync.desc }
            ].map((f, i) => (
              <div key={i} className="group rounded-3xl border border-slate-800 bg-slate-800/20 p-8 transition hover:border-blue-500/30">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Mid-Page CTA (DRI-6) */}
          <div className="mt-14 text-center">
            <button
              onClick={() => handleStart()}
              data-testid="cta-features"
              className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
            >
              {isReturningUser ? t.common.backToDashboard : (isDe ? 'Alle Funktionen freischalten' : 'Unlock All Features')}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-xs text-slate-500">
              {isDe ? '7 Tage Pro Testversion • Keine Kreditkarte nötig' : '7-Day Free Pro Trial • No Credit Card Required'}
            </p>
          </div>
        </div>
      </section>

      {/* 🏢 About Us & Company Mission Section */}
      <section id="about" className="relative z-10 bg-slate-950/90 px-6 py-24 backdrop-blur-xl border-t border-slate-800">
        <div className="mx-auto max-w-5xl text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-400 uppercase tracking-widest">
                {isDe ? 'Unsere Mission' : 'Our Mission'}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl leading-tight">
                {isDe ? 'Fahrausbildung in Deutschland digitalisieren' : 'Modernizing Driver Education in Germany'}
              </h2>
              <p className="mt-6 text-slate-300 text-base leading-relaxed">
                {isDe
                  ? 'Über 500.000 Fahrschüler legen jedes Jahr in Deutschland ihre praktische Fahrprüfung ab – oft unter hohem Stress und mit teuren Nachprüfungen.'
                  : 'Over 500,000 students take their practical driving exam (Fahrprüfung) in Germany every year, facing high stress and high re-test costs.'
                }
              </p>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                {isDe
                  ? 'DriveDE wurde in Hamburg gegründet mit der klaren Mission: Echtzeit-GPS, OpenStreetMap-Daten und KI-Auswertungen zu nutzen, um Fahrschülern und Fahrlehrern volle Transparenz zu bieten.'
                  : 'DriveDE was founded in Hamburg with a single clear mission: leverage real-time GPS telemetry, OpenStreetMap data, and AI debriefings to empower students and driving instructors with complete transparency.'
                }
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div>
                  <p className="text-2xl font-bold text-white">Hamburg, DE</p>
                  <p className="text-xs text-slate-500">{isDe ? 'Unternehmensursprung' : 'Company Origin'}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">100% DSGVO</p>
                  <p className="text-xs text-slate-500">{isDe ? 'Deutscher Datenschutz' : 'German Privacy Standards'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 space-y-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {isDe ? 'Unsere Säulen' : 'Our Core Pillars'}
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{isDe ? 'Transparente Prüfungsreife' : 'Exam Readiness Transparency'}</p>
                    <p className="text-xs text-slate-400">{isDe ? 'Objektive Algorithmen statt Bauchgefühl.' : 'Clear algorithmic score metrics instead of guessing if you are ready.'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{isDe ? 'Zweisprachig (DE & EN)' : 'Bilingual First (EN & DE)'}</p>
                    <p className="text-xs text-slate-400">{isDe ? 'Chancengleichheit für internationale und deutsche Fahrschüler.' : 'Equal access for international students and German native speakers.'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{isDe ? 'Open Data Innovation' : 'Open Data Innovation'}</p>
                    <p className="text-xs text-slate-400">{isDe ? 'Echtzeit-Tempolimits durch OpenStreetMap Daten.' : 'Powered by OpenStreetMap data for live speed limit verification.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💼 Careers Section */}
      <section id="careers" className="relative z-10 bg-slate-900 px-6 py-24 border-t border-slate-800">
        <div className="mx-auto max-w-4xl text-center">
          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-bold text-purple-400 uppercase tracking-widest">
            {isDe ? 'Fokussiertes Team' : 'Lean & Focused Team'}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{isDe ? 'Karriere bei DriveDE' : 'Careers at DriveDE'}</h2>
          <p className="mt-6 text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            {isDe 
              ? 'DriveDE wird von einem fokussierten Produkt-Team in Hamburg entwickelt. Obwohl wir aktuell keine offenen Vollzeitstellen haben, freuen wir uns immer über Initiativbewerbungen und Kooperationen!'
              : 'DriveDE is currently built and maintained by an agile product team based in Hamburg. While we don\'t have active open roles right now, we are always eager to connect with passionate engineers, driving instructors, and collaborators!'
            }
          </p>

          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-950/60 p-8 text-center max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-2">{isDe ? 'Möchtest du mit uns arbeiten?' : 'Want to work with us?'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {isDe 
                ? 'Sende uns eine Initiativbewerbung oder kontaktiere uns für Partnerschaften.'
                : 'Send us a spontaneous application or drop an email to discuss potential partnerships and freelance opportunities.'
              }
            </p>
            <button
              onClick={() => {
                window.location.href = 'mailto:abhishek572021@gmail.com?subject=DriveDE%20Spontaneous%20Application';
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 hover:scale-105 active:scale-95"
            >
              {isDe ? 'Initiativbewerbung senden' : 'Send Spontaneous Application'}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 💳 Transparent Pricing Comparison Section */}
      <section id="pricing" className="relative z-10 bg-slate-950/90 px-6 py-24 backdrop-blur-xl border-t border-slate-800">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {isDe ? 'Transparente Preise' : 'Simple Transparent Pricing'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">{isDe ? 'Fahrprüfung günstiger bestehen' : 'Pass Your Fahrprüfung For Less'}</h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              {isDe
                ? 'Starte heute kostenlos. Schalte Pro frei, wenn du bereit für GPS-Tracking & KI-Coaching bist.'
                : 'Start free today. Unlock full Pro features whenever you are ready for live GPS tracking & AI coaching.'
              }
            </p>
            <p className="mt-3 text-sm font-semibold text-emerald-400 max-w-xl mx-auto">
              {isDe
                ? 'Jeder Pass enthält alle Pro-Funktionen — du wählst nur, wie lange du Zugang brauchst.'
                : 'Every pass includes all Pro features — you only choose how long you need access.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
            {/* 30 Days Pass */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-left backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{isDe ? '30-Tage Pass' : '30-Day Pass'}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">€9.99</span>
                  <span className="text-slate-500 text-sm">{isDe ? '/ 30 Tage' : '/ 30 days'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{isDe ? 'Ideal für die gezielte Prüfungsvorbereitung in den letzten Wochen.' : 'Great for quick exam prep in your final driving weeks.'}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">{isDe ? 'Voller Pro-Zugang, 30 Tage lang' : 'Full Pro access, for 30 days'}</p>
                <div className="mt-4 space-y-4">
                  {proFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-slate-400 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleStart('30-days', 'signup', false, 'buy')} 
                className="mt-10 w-full rounded-2xl bg-slate-800 py-4 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                {isDe ? '30-Tage Pass wählen' : 'Get 30-Day Pass'}
              </button>
            </div>

            {/* 90 Days Pass (Most Popular) */}
            <div className="relative rounded-3xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/40 via-slate-900/90 to-slate-900 p-8 text-left shadow-2xl shadow-blue-500/20 flex flex-col justify-between">
              <span className="absolute -top-4 right-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                {isDe ? 'BELIEBTESTE WAHL' : 'MOST POPULAR'}
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{isDe ? '90-Tage Pass' : '90-Day Pass'}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">€19.99</span>
                  <span className="text-slate-400 text-sm">{isDe ? '/ 90 Tage' : '/ 90 days'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{isDe ? 'Deckt deine gesamte Fahrschulausbildung von der 1. Stunde bis zur Prüfung ab.' : 'Covers your complete driving school journey from day 1 to exam.'}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-blue-400">{isDe ? 'Voller Pro-Zugang, 90 Tage lang' : 'Full Pro access, for 90 days'}</p>
                <div className="mt-4 space-y-4">
                  {proFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-white">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleStart('90-days', 'signup', false, 'buy')} 
                className="mt-10 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500 hover:scale-[1.02]"
              >
                {isDe ? '90-Tage Pass wählen' : 'Get 90-Day Pass'}
              </button>
            </div>

            {/* Lifetime Access */}
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900 p-8 text-left backdrop-blur-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">{isDe ? 'Lebenslanger Zugang' : 'Lifetime Access'}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">€29.99</span>
                  <span className="text-slate-500 text-sm">{isDe ? '/ einmalig' : '/ one-time'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-400">{isDe ? 'Dauerhafter Zugang zu allen aktuellen & zukünftigen DriveDE Updates.' : 'Lifetime access to all current & future DriveDE updates.'}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-purple-400">{isDe ? 'Voller Pro-Zugang, ohne Ablaufdatum' : 'Full Pro access, never expires'}</p>
                <div className="mt-4 space-y-4">
                  {[
                    isDe ? 'Alles aus dem 90-Tage Pass' : 'Everything in the 90-Day Pass',
                    isDe ? 'Kein Ablaufdatum — auch bei Nachprüfung' : 'No expiry — even if you need a re-test',
                    isDe ? 'Alle zukünftigen Funktionen inklusive' : 'All future features included',
                    isDe ? 'Priorisierter Support' : 'Priority support'
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                      <Check className="h-4 w-4 text-purple-400 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleStart('lifetime', 'signup', false, 'buy')} 
                className="mt-10 w-full rounded-2xl bg-slate-800 border border-purple-500/30 py-4 text-sm font-bold text-white transition hover:bg-purple-900/40"
              >
                {isDe ? 'Lebenslangen Zugang wählen' : 'Get Lifetime Access'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 💬 Student Reviews & Social Proof */}
      <section id="reviews" className="relative z-10 bg-slate-900 px-6 py-24 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-5xl">{isDe ? 'Erfahrungsberichte unserer Fahrschüler' : 'Student Success Stories'}</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              {isDe ? 'Echte Fahrschüler in ganz Deutschland bestehen ihre Fahrprüfung im ersten Anlauf.' : 'Real driving students across Germany passing their Fahrprüfung on the first attempt.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                name: 'Lukas S.',
                location: 'München',
                role: isDe ? 'Bestanden Klasse B (1. Versuch)' : 'Passed Class B (First Attempt)',
                text: isDe 
                  ? 'Die GPS-Geschwindigkeitswarnung hat mich gerettet! Mein Fahrlehrer war beeindruckt, wie aufmerksam ich auf Tempolimits geachtet habe.'
                  : 'The GPS speed warning saved me! My instructor was impressed by how aware I was of speed limits during my exam in Munich.',
                rating: 5
              },
              {
                name: 'Sarah M.',
                location: 'Berlin',
                role: isDe ? 'Umschreibung Führerschein' : 'Umschreibung Conversion',
                text: isDe
                  ? 'Führerschein-Umschreibung schien kompliziert, bis ich DriveDE genutzt habe. Der Umschreibungsmodus hat mir Wochen an Extra-Fahrstunden gespart.'
                  : 'Converting my foreign license was intimidating until I found DriveDE. The Umschreibung mode saved me weeks of unnecessary driving hours.',
                rating: 5
              },
              {
                name: 'Marc K.',
                location: 'Frankfurt',
                role: isDe ? 'Bestanden B197 Automatik/Schalter' : 'Passed B197 Automatic/Manual',
                text: isDe
                  ? 'Mit den 3D-Manöversimulationen konnte ich das Einparken vor jeder Fahrstunde gedanklich durchgehen. 10/10 App!'
                  : 'The 3D Einparken maneuver simulations allowed me to practice parallel parking in my mind before every lesson. 10/10 app!',
                rating: 5
              }
            ].map((review, i) => (
              <div key={i} className="rounded-3xl border border-slate-800 bg-slate-800/20 p-8 text-left transition hover:border-blue-500/30">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(review.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">"{review.text}"</p>
                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{review.name}</p>
                    <p className="text-xs text-slate-400">{review.role}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-400">
                    <MapPin className="h-3 w-3 text-blue-400" />
                    {review.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ Interactive FAQ Accordion Section */}
      <section id="faq" className="relative z-10 bg-slate-950/80 px-6 py-24 backdrop-blur-xl border-t border-slate-800">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-5xl">{isDe ? 'Häufig gestellte Fragen (FAQ)' : 'Frequently Asked Questions'}</h2>
            <p className="mt-4 text-slate-400">{isDe ? 'Alles was du über die Vorbereitung mit DriveDE wissen musst.' : 'Everything you need to know about preparing with DriveDE.'}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-slate-800 bg-slate-900/60 text-left overflow-hidden transition"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-lg font-bold text-white hover:text-blue-400 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform duration-200', openFaq === i && 'rotate-180 text-blue-400')} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback & Support Section */}
      <section id="feedback" className="relative z-10 bg-slate-900 px-6 py-24 border-t border-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-5xl">{isDe ? 'Deine Meinung zählt' : 'Your Experience Matters'}</h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              {isDe 
                ? 'Hilf uns, DriveDE noch besser zu machen. Ob Frage, Feedback oder Erfolgsbericht – wir freuen uns von dir zu hören.'
                : 'Help us make DriveDE even better. Whether you have a question, found a bug, or just want to share your success, we\'re all ears.'
              }
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* Path Info Area */}
      <section id="paths" className="relative z-10 bg-slate-900/80 px-6 py-24 backdrop-blur-xl border-t border-slate-800">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.common.selectGoal}</h2>
            <p className="mt-4 text-slate-400">{t.common.startPersonalized}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {[
              { 
                id: 'standard', 
                title: t.licenseSelector.standard.title, 
                desc: t.licenseSelector.standard.description, 
                features: t.licenseSelector.standard.features, 
                icon: Car, 
                color: 'blue' 
              },
              { 
                id: 'conversion', 
                title: t.licenseSelector.conversion.title, 
                desc: t.licenseSelector.conversion.description, 
                features: t.licenseSelector.conversion.features, 
                icon: BadgeCheck, 
                color: 'purple' 
              },
            ].map((path, idx) => (
              <motion.div 
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => {
                  const learningPath = path.id === 'conversion' ? 'umschreibung' : 'standard';
                  useAppStore.setState({ 
                    learningPath, 
                    hasVisited: true
                  });
                }}
                className={cn(
                  'group relative flex flex-col items-start rounded-[2.5rem] border border-white/10 bg-slate-800/40 p-10 text-left transition-all hover:border-white/20 hover:bg-slate-800/60 overflow-hidden cursor-pointer',
                  'shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl'
                )}
                data-testid={path.id === 'conversion' ? 'path-umschreibung' : 'path-standard'}
              >
                {/* Decorative Gradient Background */}
                <div className={cn('absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20 transition-all group-hover:opacity-30', 
                  path.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                )} />

                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl mb-8 shadow-2xl relative z-10', 
                  path.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                )}>
                  <path.icon className="h-9 w-9" />
                </div>

                <div className="flex-1 w-full relative z-10">
                  <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{path.title}</h3>
                  <p className="text-base text-slate-400 leading-relaxed mb-8">{path.desc}</p>
                  
                  <div className="space-y-4 mb-10">
                    {path.features.slice(0, 3).map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-3 text-sm text-slate-300">
                        <CheckCircle2 className={cn('h-4 w-4', path.color === 'blue' ? 'text-blue-400' : 'text-purple-400')} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const learningPath = path.id === 'conversion' ? 'umschreibung' : 'standard';
                        const license = learningPath === 'umschreibung' ? 'umschreibung-manual' : 'manual';
                        useAppStore.setState({ 
                          learningPath, 
                          transmissionType: 'manual',
                          licenseType: license as any,
                          hasVisited: true
                        });
                      }}
                      data-testid="manual-btn"
                      className="group/btn relative flex flex-col items-center gap-3 rounded-3xl bg-white/5 p-6 transition-all hover:bg-white/10 active:scale-95 border border-white/5 hover:border-white/20"
                    >
                      <Cog className="h-6 w-6 text-orange-400 transition-transform group-hover/btn:rotate-12" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover/btn:text-white">{t.common.transmissions.manual}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const learningPath = path.id === 'conversion' ? 'umschreibung' : 'standard';
                        const license = learningPath === 'umschreibung' ? 'umschreibung-automatic' : 'automatic';
                        useAppStore.setState({ 
                          learningPath, 
                          transmissionType: 'automatic',
                          licenseType: license as any,
                          hasVisited: true
                        });
                      }}
                      data-testid="automatic-btn"
                      className="group/btn relative flex flex-col items-center gap-3 rounded-3xl bg-white/5 p-6 transition-all hover:bg-white/10 active:scale-95 border border-white/5 hover:border-white/20"
                    >
                      <Zap className="h-6 w-6 text-blue-400 transition-transform group-hover/btn:rotate-12" />
                      <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover/btn:text-white">{t.common.transmissions.automatic}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button 
              onClick={() => handleStart()} 
              data-testid="welcome-get-started"
              className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-10 py-5 text-xl font-bold text-white shadow-2xl transition hover:bg-blue-700 hover:scale-105"
            >
              {t.common.getStarted}
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* 📥 Lead Magnet — Free Exam Checklist (DRI-7) */}
      <LeadCaptureSection />

      {/* 🏢 Tech-Company 4-Column Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 px-6 py-16 text-left">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7" />
              <span className="text-xl font-bold tracking-tighter text-white">DriveDE</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isDe 
                ? 'DriveDE ist Deutschlands führende KI-gestützte Plattform zur Vorbereitung auf die Fahrprüfung. Fahrstunden per GPS aufzeichnen, Manöver meistern & im 1. Versuch bestehen.'
                : 'DriveDE is Germany\'s premier AI-powered driving preparation platform. Track driving lessons, master maneuvers, and ace your Fahrprüfung on the first try.'
              }
            </p>
            <p className="text-[11px] text-slate-500">Hamburg, Germany</p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">{isDe ? 'Produkt' : 'Product'}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#how-it-works" className="hover:text-white transition">{isDe ? 'So funktioniert\'s' : 'How It Works'}</a></li>
              <li><a href="#features" className="hover:text-white transition">{isDe ? 'Funktionen & GPS-Tracker' : 'Features & GPS Tracker'}</a></li>
              <li><a href="#pricing" className="hover:text-white transition">{isDe ? 'DriveDE Pro Preise' : 'DriveDE Pro Pricing'}</a></li>
              <li><a href="#paths" className="hover:text-white transition">{isDe ? 'Umschreibungs-Modus' : 'Umschreibung Mode'}</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">{isDe ? 'Unternehmen' : 'Company'}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#about" className="hover:text-white transition">{isDe ? 'Über uns & Mission' : 'About Us & Mission'}</a></li>
              <li><a href="#careers" className="hover:text-white transition">{isDe ? 'Karriere' : 'Careers'}</a></li>
              <li><a href="#reviews" className="hover:text-white transition">{isDe ? 'Erfolgsberichte' : 'Student Success Stories'}</a></li>
              <li><a href="#feedback" className="hover:text-white transition">{isDe ? 'Kontakt & Support' : 'Contact & Support'}</a></li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">{isDe ? 'Rechtliches' : 'Legal & Privacy'}</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#feedback" className="hover:text-white transition">Impressum</a></li>
              <li><a href="#feedback" className="hover:text-white transition">Datenschutz</a></li>
              <li><a href="#feedback" className="hover:text-white transition">AGB</a></li>
              <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-12 border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DriveDE. {t.common.allRightsReserved}</p>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ in Hamburg, Germany</span>
            <span>•</span>
            <span>OpenStreetMap™ Powered</span>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDemo(false)} />
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
            <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/50 text-white"><X className="h-6 w-6" /></button>
            <img src="/demo-video-final-v12.webp" className="h-full w-full object-contain" alt="Demo" loading="lazy" decoding="async" />
          </div>
        </div>
      )}
    </div>
  );
}

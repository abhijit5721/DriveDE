/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Car, BadgeCheck, Zap, Users, Shield,
  Menu, X, ArrowRight, Play, CheckCircle2, Cog,
  ChevronDown, Check, MapPin, Award,
  Globe, ShieldCheck, Coins, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { ContactForm } from '../common/ContactForm';
import { Logo } from '../common/Logo';
import { PlanPickerScreen } from './PlanPickerScreen';
import { startCheckout, setPendingPurchase, clearPendingPurchase, consumePendingPurchase } from '../../services/checkout';
import { TestimonialsSection } from './TestimonialsSection';
import { LeadCaptureSection } from './LeadCaptureSection';
import { PwaInstallHint } from '../common/PwaInstallHint';
import { PhoneFrame, MonitorFrame } from '../common/DeviceFrames';
import { LegalPage } from '../legal/LegalPage';
import type { LegalPageType } from '../../types';

export function Welcome() {
  const { 
    language, setLanguage, setHasVisited, licenseType,
    authStatus, userProgress 
  } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoEnded, setDemoEnded] = useState(false);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [selectedPlanForPicker, setSelectedPlanForPicker] = useState<'30-days' | '90-days' | 'lifetime'>('90-days');
  const [pickerInitialStep, setPickerInitialStep] = useState<'plan' | 'signup'>('plan');
  const [pickerInitialIsExistingUser, setPickerInitialIsExistingUser] = useState(false);
  const [legalPage, setLegalPage] = useState<LegalPageType | null>(null);
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

  // Demo modal: Escape closes, body scroll locks while open
  useEffect(() => {
    if (!showDemo) {
      setDemoEnded(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowDemo(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showDemo]);

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
    const buying = intent === 'buy' && plan ? plan : null;
    setPurchaseIntent(buying);
    // Also park it in sessionStorage: Google sign-in reloads the whole page,
    // which would otherwise wipe the intent before checkout can start.
    if (buying) setPendingPurchase(buying); else clearPendingPurchase();
    setPickerInitialStep(step);
    setPickerInitialIsExistingUser(isExistingUser);
    setShowPlanPicker(true);
    // Give the overlay a history entry so the browser Back button closes it
    // instead of leaving the site (DRI-14 review feedback).
    window.history.pushState({ planPicker: true }, '', '#plan');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPopState = () => setShowPlanPicker(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const closePlanPicker = () => {
    setShowPlanPicker(false);
    if (window.location.hash === '#plan') window.history.back();
  };

  const handleSignInClick = () => {
    handleStart('90-days', 'signup', true);
  };

  const handlePlanPickerComplete = async () => {
    // Someone who clicked a pricing CTA meant to buy, not to start a trial.
    // The trial is started regardless, so abandoning Stripe still leaves them
    // with the full 7 days rather than nothing.
    const tier = purchaseIntent ?? consumePendingPurchase();
    if (tier) {
      clearPendingPurchase();
      const result = await startCheckout(tier, language);
      if (result.ok) return; // browser is navigating to Stripe
      console.warn('[Welcome] Direct checkout unavailable, entering app on trial:', result.reason);
    }
    setHasVisited(true);
  };

  const navLinks = useMemo(() => [
    { name: isDe ? 'Warum DriveDE' : 'Why DriveDE', href: '#problem-solution' },
    { name: isDe ? 'So funktioniert\'s' : 'How It Works', href: '#how-it-works' },
    { name: isDe ? 'Preise' : 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ], [isDe]);

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
    <div className="relative min-h-screen w-full bg-white selection:bg-blue-500/30 text-slate-900">
      {/* Plan Picker Overlay — shown after "Get Started" click */}
      {showPlanPicker && (
        <div className="fixed inset-0 z-[100] animate-fade-in overflow-hidden">
          <PlanPickerScreen 
            initialPlan={selectedPlanForPicker} 
            initialStep={pickerInitialStep}
            initialIsExistingUser={pickerInitialIsExistingUser}
            intent={purchaseIntent ? 'buy' : 'trial'}
            onComplete={handlePlanPickerComplete}
            onCancel={closePlanPicker} 
          />
        </div>
      )}
      {/* Navigation */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm border-b border-slate-200' : 'bg-transparent py-6'
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 transition hover:opacity-80 active:scale-95"
          >
            <Logo className="h-10 w-10 select-none drop-shadow-[0_4px_8px_rgba(59,130,246,0.3)]" />
            <span className="text-xl font-bold tracking-tighter text-slate-900">
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
                className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                {link.name}
              </a>
            ))}
            {isReturningUser ? (
              <button 
                onClick={() => handleStart()}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-95 shadow-md"
              >
                {t.common.backToDashboard}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSignInClick}
                  className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  {isDe ? 'Anmelden' : 'Sign In'}
                </button>
                <button 
                  onClick={() => handleStart('90-days', 'plan')}
                  className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-md"
                >
                  {t.common.startNow}
                </button>
              </div>
            )}

            {/* Language Switcher Desktop */}
            <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-4">
              <button onClick={() => setLanguage('de')} className={cn('px-2.5 py-1 text-xs font-bold rounded-lg transition-all', language === 'de' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900')}>DE</button>
              <button onClick={() => setLanguage('en')} className={cn('px-2.5 py-1 text-xs font-bold rounded-lg transition-all', language === 'en' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900')}>EN</button>
            </div>
          </div>

          <button className="text-slate-900 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white p-6 shadow-2xl md:hidden border-b border-slate-200">
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)} className="text-lg font-bold text-slate-900">{link.name}</a>
              ))}
              <div className="flex items-center gap-2 border-t border-slate-200 pt-4">
                <span className="text-xs font-bold text-slate-500">Language:</span>
                <button onClick={() => setLanguage('de')} className={cn('px-3 py-1 text-xs font-bold rounded-lg', language === 'de' ? 'bg-blue-600 text-white' : 'text-slate-500')}>DE</button>
                <button onClick={() => setLanguage('en')} className={cn('px-3 py-1 text-xs font-bold rounded-lg', language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500')}>EN</button>
              </div>
              {isReturningUser ? (
                <button onClick={() => handleStart()} className="rounded-xl bg-blue-600 py-3.5 text-lg font-bold text-white">
                  {t.common.backToDashboard}
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <button onClick={handleSignInClick} className="rounded-xl bg-slate-900 py-3 text-base font-bold text-white">
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
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            {isDe ? '7 Tage Pro Testversion inklusive • Keine Kreditkarte nötig' : 'Includes 7-Day Free Pro Trial • No Credit Card Required'}
          </div>

          <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-tight">
            {t.welcome.hero.titlePrefix}
            <span className="block mt-2 text-blue-600">
              {t.welcome.hero.titleHighlight}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl font-normal leading-relaxed">
            {t.welcome.hero.subtitle}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button 
              onClick={() => handleStart()}
              data-testid="welcome-start-btn"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
            >
              {isReturningUser ? t.common.backToDashboard : t.common.getStartedFree}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-5 text-lg font-bold text-slate-900 transition hover:bg-slate-50 border border-slate-200 shadow-sm"
            >
              <Play className="h-5 w-5 text-blue-600" />
              {t.common.watchDemo}
            </button>
          </div>

          {/* Trust strip — only claims that are verifiably true */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-500 text-sm font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              {isDe ? '100% DSGVO-konform' : '100% GDPR compliant'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-500" />
              {isDe ? 'Entwickelt in Hamburg' : 'Built in Hamburg'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-slate-500" />
              {isDe ? 'Deutsch & Englisch' : 'German & English'}
            </span>
          </div>
        </div>

        {/* Real app screenshots — the actual product, not a mockup.
            Desktop gets the dashboard in a browser frame; phones get the
            mobile app view in a phone frame (a scaled desktop shot would be
            unreadable at 390px). */}
        <div className="relative mt-16 mb-10 hidden w-full max-w-5xl px-8 sm:block">
          {/* Desktop in a monitor */}
          <MonitorFrame>
            <img
              src={isDe ? '/screenshots/app-dashboard-de.webp' : '/screenshots/app-dashboard-en.webp'}
              alt={isDe ? 'DriveDE Dashboard mit Prüfungsreife-Anzeige und Wochen-Analyse' : 'DriveDE dashboard with exam readiness score and weekly analysis'}
              className="w-full"
              width="1600"
              height="1059"
              loading="eager"
              decoding="async"
            />
          </MonitorFrame>
          {/* Phone overlapping the corner — same app, same state, on mobile */}
          <PhoneFrame className="absolute -bottom-6 right-0 w-[170px] rotate-3 md:-right-4 md:w-[200px]">
            <img
              src={isDe ? '/screenshots/app-mobile-de.webp' : '/screenshots/app-mobile-en.webp'}
              alt={isDe ? 'DriveDE App auf dem Smartphone' : 'DriveDE app on a phone'}
              className="w-full"
              width="680"
              height="1472"
              loading="eager"
              decoding="async"
            />
          </PhoneFrame>
        </div>
        <PhoneFrame className="mx-auto mt-14 w-full max-w-[280px] sm:hidden">
          <img
            src={isDe ? '/screenshots/app-mobile-de.webp' : '/screenshots/app-mobile-en.webp'}
            alt={isDe ? 'DriveDE App auf dem Smartphone mit Prüfungsreife-Anzeige' : 'DriveDE app on a phone with exam readiness score'}
            className="w-full"
            width="680"
            height="1472"
            loading="eager"
            decoding="async"
          />
        </PhoneFrame>
      </main>

      {/* 💡 Problem vs Solution: Why Driving in Germany Costs €3,000+ */}
      <section id="problem-solution" className="relative z-10 bg-white px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-6xl text-left">
          <div className="text-center mb-16">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-widest">
              {isDe ? 'Das 3.000€+ Fahrschul-Problem' : 'The €3,000+ Driving School Problem'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl leading-tight">
              {isDe ? 'Weniger Fahrstunden bezahlen.' : 'Spend Less on Driving Hours.'} <span>{isDe ? 'Schneller bestehen.' : 'Pass Faster.'}</span>
            </h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-base">
              {isDe 
                ? 'In Deutschland kostet eine Fahrstunde bis zu 95€. Die meisten Fahrschüler brauchen 35–45+ Stunden, weil sie rein nach Versuch und Irrtum lernen.'
                : 'In Germany, driving lessons (Fahrstunden) cost up to €95 per hour. Most students take 35–45+ hours because they learn purely by trial and error.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Old Way (Expensive & Slow) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-left relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-red-600 font-black text-xl">
                    ✕
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{isDe ? 'Der alte teure Weg' : 'The Old Expensive Way'}</h3>
                    <p className="text-xs text-red-600 font-semibold">{isDe ? 'Ohne DriveDE' : 'Without DriveDE'}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <Coins className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{isDe ? '3.200€+ Gesamtkosten' : '€3,200+ Total Spent'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{isDe ? 'Durchschnittlich 35 bis 45+ Fahrstunden zu je 75€–95€ pro Stunde.' : 'Average student takes 35 to 45+ Fahrstunden at €75–€95 per hour.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <Clock className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{isDe ? '38% Durchfallquote beim 1. Versuch' : '38% First-Time Failure Rate'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{isDe ? 'Durchfallen kostet 600€+ für Pflicht-Zusatzstunden und Prüfungsgebühren.' : 'Failing your practical exam costs €600+ in mandatory extra lessons and re-test fees.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <Shield className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{isDe ? 'Keine Transparenz' : 'No Progress Visibility'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{isDe ? 'Keine objektiven Daten, ob du wirklich prüfungsreif bist.' : 'Zero objective data on whether you are truly exam ready, leaving you dependent on guesswork.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DriveDE Way (Smart, Fast & Saves €1,000+) */}
            <div className="relative rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm flex flex-col justify-between">
              <span className="absolute -top-4 right-8 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                {isDe ? 'DER DRIVEDE VORTEIL' : 'THE DRIVEDE ADVANTAGE'}
              </span>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-blue-600 font-black text-xl">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{isDe ? 'Der smarte DriveDE Weg' : 'The DriveDE Smart Way'}</h3>
                    <p className="text-xs text-blue-600 font-bold">{isDe ? 'Geld sparen & beim 1. Versuch bestehen' : 'Save Money & Pass First Try'}</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <Coins className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{isDe ? '800€ – 1.200€ an Fahrstunden sparen' : 'Save €800 – €1,200 in Driving Hours'}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{isDe ? 'Bereite Manöver gedanklich mit 3D-Simulationen vor, um weniger Fahrstunden zu benötigen.' : 'Practice maneuvers mentally with 3D simulations before stepping into the car to reduce total driving hours.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{isDe ? 'Kein Durchfallen wegen Tempolimit' : 'Zero Speed Limit Exam Failures'}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{isDe ? 'Echtzeit OpenStreetMap GPS-Warnungen verhindern die häufigste Ursache für Prüfungsausfälle.' : 'Real-time OpenStreetMap GPS limit matching prevents the #1 cause of practical test disqualification.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <Award className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{isDe ? '100% objektive Prüfungsreife' : '100% Objective Exam Readiness Score'}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{isDe ? 'Erkenne genau den Tag, an dem du 90%+ Prüfungsreife erreichst.' : 'Know the exact day you hit 90%+ readiness to schedule your Fahrprüfung with zero doubt.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 📚 "More than a theory app" — intercepts Theorie-App search intent and reframes it */}
          <div className="mt-16 mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-widest">
              {isDe ? 'Mehr als eine Theorie-App' : 'More Than a Theory App'}
            </span>
            <h3 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
              {isDe
                ? 'Führerschein Theorie-Apps bringen dich nur bis zur Theorieprüfung'
                : 'Theory apps only get you through the theory exam'}
            </h3>
            <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
              {isDe
                ? 'Der wirklich teure Teil beginnt danach: die praktischen Fahrstunden. Was dein Fahrlehrer dir beibringt (Schulterblick, Einparken, Auffahren auf die Autobahn) findest du in keiner Theorie-App und kaum im Internet erklärt.'
                : 'The truly expensive part starts after: your practical driving lessons. What your instructor teaches you (Schulterblick, parking maneuvers, Autobahn merging) isn\'t in any theory app, and searching the internet for it lesson by lesson gets you nowhere.'}
            </p>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-semibold">
              {isDe
                ? 'DriveDE bringt genau dieses Wissen auf dein Handy: Theorie lernen und die praktische Fahrprüfung meistern. Alles in einer App.'
                : 'DriveDE puts exactly that knowledge at your fingertips: learn theory and master the practical exam. Everything in one app.'}
            </p>
          </div>
        </div>
      </section>

      {/* 🌍 Expat / Umschreibung Social Proof (DRI-5) */}
      <TestimonialsSection />

      {/* 🚀 How It Works Section */}
      <section id="how-it-works" className="relative z-10 bg-slate-50 px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-widest">
              {isDe ? 'Einfacher 3-Schritte Ablauf' : 'Simple 3-Step Process'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">{isDe ? 'So funktioniert DriveDE' : 'How DriveDE Works'}</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
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
                icon: MapPin
              },
              {
                step: '02',
                title: isDe ? 'KI-Fehleranalyse & 3D' : 'AI Mistake Debriefings',
                desc: isDe 
                  ? 'Nutze KI-Auswertungen und 3D-Manöversimulationen (Einparken) zur gezielten Vorbereitung.'
                  : 'Review post-drive briefings & 3D maneuver simulations (Einparken, Autobahn) before your next lesson.',
                icon: Zap
              },
              {
                step: '03',
                title: isDe ? 'Prüfung sicher bestehen' : 'Pass Your Fahrprüfung',
                desc: isDe 
                  ? 'Verfolge deine Prüfungsreife bis 100% und gehe voller Selbstvertrauen in die Fahrprüfung.'
                  : 'Monitor your Exam Readiness Gauge until you hit 100% confidence and get your license.',
                icon: Award
              }
            ].map((s, i) => (
              <div key={i} className="relative rounded-3xl border border-slate-200 bg-white shadow-sm p-8 text-left transition hover:border-slate-300 hover:scale-[1.02]">
                <div className={'mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md'}>
                  <s.icon className="h-7 w-7" />
                </div>
                <span className="absolute top-8 right-8 text-4xl font-black text-slate-200">{s.step}</span>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mid-Page CTA (DRI-6) */}
          <div className="mt-14 text-center">
            <button
              onClick={() => handleStart()}
              data-testid="cta-how-it-works"
              className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
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

      {/* 📱 Inside the app — three real screens (DRI-14: show, don't tell) */}
      <section id="app-preview" className="relative z-10 bg-slate-50 px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-widest">
              {isDe ? 'Ein Blick in die App' : 'A look inside the app'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">
              {isDe ? 'Die App in Aktion' : 'See the app in action'}
            </h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
              {isDe ? 'Echte Screenshots: genau so sieht die App nach der Anmeldung aus.' : 'Actual screenshots: exactly what you\'ll see after signing up.'}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {[
              {
                shot: 'tracker',
                title: isDe ? 'GPS Live-Tracking' : 'Live GPS tracking',
                desc: isDe ? 'Route, Tempolimits und Fehler während jeder Fahrstunde.' : 'Route, speed limits and mistakes during every lesson.',
              },
              {
                shot: 'dashboard',
                title: isDe ? 'Prüfungsreife auf einen Blick' : 'Exam readiness at a glance',
                desc: isDe ? 'Wisse genau, wann du bereit für die Fahrprüfung bist.' : 'Know exactly when you are ready for the exam.',
              },
              {
                shot: 'curriculum',
                title: isDe ? 'Interaktiver Lehrplan' : 'Interactive curriculum',
                desc: isDe ? 'Lektionen aus echten Fahrstunden, nicht nur Theoriefragen.' : 'Lessons built from real driving lessons, not just theory quizzes.',
              },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <PhoneFrame className="w-full max-w-[240px]">
                  <img
                    src={`/screenshots/shot-${item.shot}-${isDe ? 'de' : 'en'}.webp`}
                    alt={item.title}
                    className="w-full"
                    width="680"
                    height="1472"
                    loading="lazy"
                    decoding="async"
                  />
                </PhoneFrame>
                <h3 className="mt-5 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 max-w-[260px] text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
          {/* second entry point to the demo video for readers below the fold */}
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowDemo(true)}
              data-testid="watch-demo-inline"
              className="group inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-sm transition hover:border-slate-300 hover:text-blue-600"
            >
              <Play className="h-4 w-4 text-slate-500" />
              {isDe ? 'Demo ansehen (49 Sekunden)' : 'Watch the demo (49 seconds)'}
            </button>
          </div>
        </div>
      </section>

      {/* 🚗 CTA split banner — bright daylight driving photo, no scrim (light-theme treatment) */}
      <section className="relative z-10 bg-white px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="grid overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/10 md:grid-cols-2">
            <div className="flex flex-col items-start justify-center px-8 py-14 text-left sm:px-12 lg:px-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
                {isDe ? 'Bereit für deine Fahrprüfung?' : 'Ready for your Fahrprüfung?'}
              </h2>
              <p className="max-w-md text-slate-500 text-sm sm:text-base mb-8">
                {isDe
                  ? 'Starte heute deine 7-Tage Pro Testversion. Keine Kreditkarte nötig.'
                  : 'Start your 7-day free Pro trial today. No credit card required.'}
              </p>
              <button
                onClick={() => handleStart()}
                data-testid="cta-photo-banner"
                className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-blue-500 hover:scale-105 active:scale-95"
              >
                {isDe ? 'Jetzt kostenlos starten' : 'Get Started Free'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="relative min-h-[280px] md:min-h-[380px]">
              <img
                src="https://images.unsplash.com/photo-1553782097-130fef5d3e27?q=80&w=1200&auto=format&fit=crop"
                alt={isDe ? 'Fahrstunde: Fahrschüler und Fahrlehrer im Auto bei Tageslicht' : 'Driving lesson: student and instructor in the car in daylight'}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-white px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-5xl">{t.welcome.features.title}</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">{t.welcome.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: t.welcome.features.aiCoaching.title, desc: t.welcome.features.aiCoaching.desc },
              { icon: BadgeCheck, title: t.welcome.features.maneuverReplay.title, desc: t.welcome.features.maneuverReplay.desc },
              { icon: Users, title: t.welcome.features.instructorSync.title, desc: t.welcome.features.instructorSync.desc }
            ].map((f, i) => (
              <div key={i} className="group rounded-3xl border border-slate-200 bg-white shadow-sm p-8 transition hover:border-slate-300">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-blue-600">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Mid-Page CTA (DRI-6) */}
          <div className="mt-14 text-center">
            <button
              onClick={() => handleStart()}
              data-testid="cta-features"
              className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
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

      {/* 💳 Transparent Pricing Comparison Section */}
      <section id="pricing" className="relative z-10 bg-white px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
              {isDe ? 'Transparente Preise' : 'Simple Transparent Pricing'}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">{isDe ? 'Fahrprüfung günstiger bestehen' : 'Pass Your Fahrprüfung For Less'}</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              {isDe
                ? 'Starte heute kostenlos. Schalte Pro frei, wenn du bereit für GPS-Tracking & KI-Coaching bist.'
                : 'Start free today. Unlock full Pro features whenever you are ready for live GPS tracking & AI coaching.'
              }
            </p>
            <p className="mt-3 text-sm font-semibold text-blue-600 max-w-xl mx-auto">
              {isDe
                ? 'Jeder Pass enthält alle Pro-Funktionen. Du wählst nur, wie lange du Zugang brauchst.'
                : 'Every pass includes all Pro features. You only choose how long you need access.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
            {/* 30 Days Pass */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{isDe ? '30-Tage Pass' : '30-Day Pass'}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">€9.99</span>
                  <span className="text-slate-500 text-sm">{isDe ? '/ 30 Tage' : '/ 30 days'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{isDe ? 'Ideal für die gezielte Prüfungsvorbereitung in den letzten Wochen.' : 'Great for quick exam prep in your final driving weeks.'}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">{isDe ? 'Voller Pro-Zugang, 30 Tage lang' : 'Full Pro access, for 30 days'}</p>
                <div className="mt-4 space-y-4">
                  {proFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-600">
                      <Check className="h-4 w-4 text-slate-500 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleStart('30-days', 'signup', false, 'buy')} 
                className="mt-10 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                {isDe ? '30-Tage Pass wählen' : 'Get 30-Day Pass'}
              </button>
            </div>

            {/* 90 Days Pass (Most Popular) */}
            <div className="relative rounded-3xl border-2 border-blue-500 bg-white p-8 text-left shadow-sm flex flex-col justify-between">
              <span className="absolute -top-4 right-8 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-md">
                {isDe ? 'BELIEBTESTE WAHL' : 'MOST POPULAR'}
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">{isDe ? '90-Tage Pass' : '90-Day Pass'}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">€19.99</span>
                  <span className="text-slate-500 text-sm">{isDe ? '/ 90 Tage' : '/ 90 days'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{isDe ? 'Deckt deine gesamte Fahrschulausbildung von der 1. Stunde bis zur Prüfung ab.' : 'Covers your complete driving school journey from day 1 to exam.'}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-blue-600">{isDe ? 'Voller Pro-Zugang, 90 Tage lang' : 'Full Pro access, for 90 days'}</p>
                <div className="mt-4 space-y-4">
                  {proFeatures.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-900">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleStart('90-days', 'signup', false, 'buy')} 
                className="mt-10 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-md transition hover:bg-blue-500 hover:scale-[1.02]"
              >
                {isDe ? '90-Tage Pass wählen' : 'Get 90-Day Pass'}
              </button>
            </div>

            {/* Lifetime Access */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 text-left flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{isDe ? 'Lebenslanger Zugang' : 'Lifetime Access'}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">€29.99</span>
                  <span className="text-slate-500 text-sm">{isDe ? '/ einmalig' : '/ one-time'}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{isDe ? 'Dauerhafter Zugang zu allen aktuellen & zukünftigen DriveDE Updates.' : 'Lifetime access to all current & future DriveDE updates.'}</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-500">{isDe ? 'Voller Pro-Zugang, ohne Ablaufdatum' : 'Full Pro access, never expires'}</p>
                <div className="mt-4 space-y-4">
                  {[
                    isDe ? 'Alles aus dem 90-Tage Pass' : 'Everything in the 90-Day Pass',
                    isDe ? 'Kein Ablaufdatum, auch bei Nachprüfung' : 'No expiry, even if you need a re-test',
                    isDe ? 'Alle zukünftigen Funktionen inklusive' : 'All future features included',
                    isDe ? 'Priorisierter Support' : 'Priority support'
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-600">
                      <Check className="h-4 w-4 text-slate-500 shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleStart('lifetime', 'signup', false, 'buy')} 
                className="mt-10 w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                {isDe ? 'Lebenslangen Zugang wählen' : 'Get Lifetime Access'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ❓ Interactive FAQ Accordion Section */}
      <section id="faq" className="relative z-10 bg-slate-50 px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-5xl">{isDe ? 'Häufig gestellte Fragen (FAQ)' : 'Frequently Asked Questions'}</h2>
            <p className="mt-4 text-slate-500">{isDe ? 'Alles was du über die Vorbereitung mit DriveDE wissen musst.' : 'Everything you need to know about preparing with DriveDE.'}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-slate-200 bg-white shadow-sm text-left overflow-hidden transition"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-lg font-bold text-slate-900 hover:text-blue-600 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn('h-5 w-5 text-slate-500 transition-transform duration-200', openFaq === i && 'rotate-180 text-slate-500')} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-100/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Path Info Area */}
      <section id="paths" className="relative z-10 bg-slate-50 px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{t.common.selectGoal}</h2>
            <p className="mt-4 text-slate-500">{t.common.startPersonalized}</p>
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
                color: 'blue' 
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
                  'group relative flex flex-col items-start rounded-[2.5rem] border border-slate-200 bg-white p-10 text-left transition-all hover:border-slate-300 overflow-hidden cursor-pointer',
                  'shadow-xl shadow-slate-900/5'
                )}
                data-testid={path.id === 'conversion' ? 'path-umschreibung' : 'path-standard'}
              >

                <div className={cn('flex h-16 w-16 items-center justify-center rounded-2xl mb-8 relative z-10', 
                  'bg-slate-100 text-blue-600 border border-slate-200'
                )}>
                  <path.icon className="h-9 w-9" />
                </div>

                <div className="flex-1 w-full relative z-10">
                  <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">{path.title}</h3>
                  <p className="text-base text-slate-500 leading-relaxed mb-8">{path.desc}</p>
                  
                  <div className="space-y-4 mb-10">
                    {path.features.slice(0, 3).map((feature: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-3 text-sm text-slate-600">
                        <CheckCircle2 className={cn('h-4 w-4', 'text-blue-600')} />
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
                      className="group/btn relative flex flex-col items-center gap-3 rounded-3xl bg-slate-100 p-6 transition-all hover:bg-slate-200 active:scale-95 border border-slate-200 hover:border-slate-300"
                    >
                      <Cog className="h-6 w-6 text-slate-500 transition-transform group-hover/btn:rotate-12" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover/btn:text-slate-900">{t.common.transmissions.manual}</span>
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
                      className="group/btn relative flex flex-col items-center gap-3 rounded-3xl bg-slate-100 p-6 transition-all hover:bg-slate-200 active:scale-95 border border-slate-200 hover:border-slate-300"
                    >
                      <Zap className="h-6 w-6 text-blue-600 transition-transform group-hover/btn:rotate-12" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-600 group-hover/btn:text-slate-900">{t.common.transmissions.automatic}</span>
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

      {/* Feedback & Support Section */}
      <section id="feedback" className="relative z-10 bg-white px-6 py-24 border-t border-slate-100">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-5xl">{isDe ? 'Deine Meinung zählt' : 'Your Experience Matters'}</h2>
            <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
              {isDe 
                ? 'Hilf uns, DriveDE noch besser zu machen. Ob Frage, Feedback oder Erfolgsbericht – wir freuen uns von dir zu hören.'
                : 'Help us make DriveDE even better. Whether you have a question, found a bug, or just want to share your success, we\'re all ears.'
              }
            </p>
          </div>
          
          <ContactForm />
        </div>
      </section>

      {/* 📥 Lead Magnet — Free Exam Checklist (DRI-7) */}
      <LeadCaptureSection />

      {/* 🏢 Tech-Company 4-Column Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-slate-50 px-6 py-16 text-left">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="h-7 w-7" />
              <span className="text-xl font-bold tracking-tighter text-slate-900">DriveDE</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isDe 
                ? 'DriveDE ist Deutschlands führende KI-gestützte Plattform zur Vorbereitung auf die Fahrprüfung. Fahrstunden per GPS aufzeichnen, Manöver meistern & im 1. Versuch bestehen.'
                : 'DriveDE is Germany\'s premier AI-powered driving preparation platform. Track driving lessons, master maneuvers, and ace your Fahrprüfung on the first try.'
              }
            </p>
            <p className="text-[11px] text-slate-500">Hamburg, Germany</p>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">{isDe ? 'Produkt' : 'Product'}</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#how-it-works" className="hover:text-slate-900 transition">{isDe ? 'So funktioniert\'s' : 'How It Works'}</a></li>
              <li><a href="#features" className="hover:text-slate-900 transition">{isDe ? 'Funktionen & GPS-Tracker' : 'Features & GPS Tracker'}</a></li>
              <li><a href="#pricing" className="hover:text-slate-900 transition">{isDe ? 'DriveDE Pro Preise' : 'DriveDE Pro Pricing'}</a></li>
              <li><a href="#paths" className="hover:text-slate-900 transition">{isDe ? 'Umschreibungs-Modus' : 'Umschreibung Mode'}</a></li>
              <li><a href={isDe ? '/blog/' : '/blog/en/'} className="hover:text-slate-900 transition">Blog & Guides</a></li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">{isDe ? 'Unternehmen' : 'Company'}</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><a href="#expat-stories" className="hover:text-slate-900 transition">{isDe ? 'Für Expats & Umschreibung' : 'For Expats & Umschreibung'}</a></li>
              <li><a href="#feedback" className="hover:text-slate-900 transition">{isDe ? 'Kontakt & Support' : 'Contact & Support'}</a></li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-4">{isDe ? 'Rechtliches' : 'Legal & Privacy'}</h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li><button onClick={() => setLegalPage('impressum')} className="hover:text-slate-900 transition">Impressum</button></li>
              <li><button onClick={() => setLegalPage('privacy')} className="hover:text-slate-900 transition">{isDe ? 'Datenschutz' : 'Privacy Policy'}</button></li>
              <li><button onClick={() => setLegalPage('terms')} className="hover:text-slate-900 transition">{isDe ? 'AGB' : 'Terms'}</button></li>
              <li><a href="#faq" className="hover:text-slate-900 transition">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl mt-12 border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DriveDE. {t.common.allRightsReserved}</p>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ in Hamburg, Germany</span>
            <span>•</span>
            <span>OpenStreetMap™ Powered</span>
          </div>
        </div>
      </footer>

      {legalPage && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-100">
          <div className="mx-auto max-w-3xl px-4 py-8">
            <LegalPage page={legalPage} onBack={() => setLegalPage(null)} />
          </div>
        </div>
      )}

      <PwaInstallHint />

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDemo(false)} />
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
            <button onClick={() => setShowDemo(false)} aria-label={isDe ? 'Schließen' : 'Close'} className="absolute top-4 right-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/50 text-white"><X className="h-6 w-6" /></button>
            <video
              ref={demoVideoRef}
              key={isDe ? 'de' : 'en'}
              src={isDe ? '/demo-de.mp4' : '/demo-en.mp4'}
              poster={isDe ? '/demo-poster-de.webp' : '/demo-poster-en.webp'}
              controls
              autoPlay
              playsInline
              preload="none"
              className="h-full w-full object-contain"
              data-testid="demo-video"
              onEnded={() => setDemoEnded(true)}
              onPlay={() => setDemoEnded(false)}
            >
              {isDe ? 'Dein Browser kann dieses Video nicht abspielen.' : 'Your browser cannot play this video.'}
            </video>
            {/* end-of-video CTA — the moment of highest intent */}
            {demoEnded && (
              <div className="absolute inset-0 z-[106] flex flex-col items-center justify-center gap-5 bg-slate-950/85 backdrop-blur-sm">
                <p className="max-w-md px-6 text-center text-xl font-bold text-white sm:text-2xl">
                  {isDe ? 'Bereit, es selbst auszuprobieren?' : 'Ready to try it yourself?'}
                </p>
                <button
                  onClick={() => { setShowDemo(false); handleStart(); }}
                  data-testid="demo-cta"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-500 hover:scale-105 active:scale-95"
                >
                  {isDe ? 'Jetzt kostenlos starten' : 'Start Free Trial'}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => { setDemoEnded(false); demoVideoRef.current?.play(); }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition hover:text-white"
                >
                  <Play className="h-4 w-4" />
                  {isDe ? 'Nochmal ansehen' : 'Watch again'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { 
  Car, BadgeCheck, Cog, Zap, Users, Trophy, Shield, 
  Star, ChevronRight, Menu, X, ArrowRight, Play, CheckCircle2 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

export function Welcome() {
  const { language, setLicenseType, setHasVisited, licenseType, authStatus } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDE = language === 'de';

  // Strict check for returning user status
  const isReturningUser = licenseType !== null && licenseType !== undefined;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelect = (type: 'manual' | 'automatic' | 'umschreibung-manual' | 'umschreibung-automatic') => {
    setLicenseType(type);
    setHasVisited(true);
  };

  const navLinks = [
    { name: isDE ? 'Home' : 'Home', href: '#' },
    { name: isDE ? 'Funktionen' : 'Features', href: '#features' },
    { name: isDE ? 'Erfolgsgeschichten' : 'Success Stories', href: '#success' },
    { name: isDE ? 'Über uns' : 'About', href: '#about' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-900 selection:bg-blue-500/30">
      {/* Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="file:///C:/Users/abhij/.gemini/antigravity/brain/ecfe8d6c-977d-46a5-b284-6fe4f34b7f6d/drivede_hero_background_1776721458946_1776807807642.png"
          alt="Driving Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/95" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-slate-900/90 backdrop-blur-md py-3 shadow-xl" : "bg-transparent py-6"
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              Drive<span className="text-blue-500">DE</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                {link.name}
              </a>
            ))}
            {isReturningUser ? (
              <button 
                onClick={() => setHasVisited(true)}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95"
              >
                {isDE ? 'Zum Dashboard' : 'Back to Dashboard'}
              </button>
            ) : (
              <button 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                {isDE ? 'Pfad wählen' : 'Start Now'}
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900 p-6 shadow-2xl md:hidden">
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-lg font-bold text-white">{link.name}</a>
              ))}
              {isReturningUser && (
                <button 
                  onClick={() => setHasVisited(true)}
                  className="rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white transition hover:bg-emerald-700"
                >
                  {isDE ? 'Zum Dashboard' : 'Back to Dashboard'}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-20 text-center lg:pt-0">
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md">
            <Shield className="h-3 w-3" />
            {isDE ? 'Von Experten empfohlen 2026' : 'Recommended by Experts 2026'}
          </div>

          <h1 className="mt-8 text-5xl font-black tracking-tight text-white sm:text-7xl">
            {isDE ? 'Der schnellste Weg zum' : 'The fastest way to your'}
            <span className="block mt-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {isDE ? 'deutschen Führerschein' : 'German Driving License'}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            {isDE
              ? 'Prüfungsreife mit KI-Coaching, interaktiven Manövern und digitalem Fahrtenbuch.'
              : 'Test readiness with AI Coaching, interactive maneuvers, and a smart digital driving log.'}
          </p>

          {/* Social Proof Container */}
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img 
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} 
                    className="h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800"
                    alt="User"
                  />
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">2,500+</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{isDE ? 'Zufriedene Schüler' : 'Happy Students'}</p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-700/50 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">94% {isDE ? 'Bestehensquote' : 'Pass Rate'}</p>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">{isDE ? 'Erster Versuch' : 'First Attempt'}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {isReturningUser ? (
              <button 
                onClick={() => setHasVisited(true)}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
              >
                {isDE ? 'Zurück zum Dashboard' : 'Back to Dashboard'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button 
                onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
              >
                {isDE ? 'Jetzt kostenlos starten' : 'Get Started Free'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-8 py-5 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/10">
              <Play className="h-5 w-5 text-blue-400" />
              {isDE ? 'Demo ansehen' : 'Watch Demo'}
            </button>
          </div>
        </div>
      </main>

      {/* Path Selection Area (Scroll-to Target) */}
      <section className="relative z-10 bg-slate-900/80 px-6 py-24 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              {isDE ? 'Wähle dein Ziel' : 'Select your Goal'}
            </h2>
            <p className="mt-4 text-slate-400">
              {isDE ? 'Starte personalisiert auf dich zugeschnitten' : 'Start personalized to your specific path'}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { id: 'manual', title: isDE ? 'Führerschein (Schaltung)' : 'New License (Manual)', desc: isDE ? 'Der reguläre Weg der Klasse B' : 'The classic way for Class B', icon: Cog, color: 'orange' },
              { id: 'automatic', title: isDE ? 'Führerschein (Automatik)' : 'New License (Automatic)', desc: isDE ? 'Klasse B197 - Modern & stressfrei' : 'Modern, stress-free B197 path', icon: Zap, color: 'blue' },
              { id: 'umschreibung-manual', title: isDE ? 'Umschreibung (Schaltung)' : 'Conversion (Manual)', desc: isDE ? 'Gültigen Führerschein anerkennen' : 'Convert existing foreign license', icon: BadgeCheck, color: 'purple' },
              { id: 'umschreibung-automatic', title: isDE ? 'Umschreibung (Automatik)' : 'Conversion (Automatic)', desc: isDE ? 'Einfache Umschreibung ohne Kupplung' : 'Easy conversion, no clutch tension', icon: BadgeCheck, color: 'emerald' },
            ].map((path) => (
              <button
                key={path.id}
                onClick={() => handleSelect(path.id as any)}
                className="group relative flex flex-col items-start gap-4 rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8 text-left transition-all hover:border-blue-500/50 hover:bg-slate-800/80 active:scale-[0.98]"
              >
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner",
                  path.color === 'orange' && "bg-orange-500/10 text-orange-500",
                  path.color === 'blue' && "bg-blue-500/10 text-blue-500",
                  path.color === 'purple' && "bg-purple-500/10 text-purple-500",
                  path.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                )}>
                  <path.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{path.title}</h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed">{path.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                  {isDE ? 'Hier starten' : 'Start here'}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2 grayscale transition hover:grayscale-0">
             <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white">
              <Car className="h-5 w-5" />
            </div>
            <span className="text-lg font-black tracking-tighter text-slate-400">
              Drive<span className="text-slate-500">DE</span>
            </span>
          </div>
          
          <div className="flex gap-8">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Shield className="h-3 w-3" />
              TÜV / DEKRA
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <CheckCircle2 className="h-3 w-3" />
              GDPR Compliant
            </div>
          </div>

          <p className="text-[10px] text-slate-600">
            © 2026 DriveDE AI. All rights reserved. Professional Driver Training Technology.
          </p>
        </div>
      </footer>
    </div>
  );
}

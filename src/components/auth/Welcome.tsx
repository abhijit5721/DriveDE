import { useState, useEffect } from 'react';
import { 
  Car, BadgeCheck, Cog, Zap, Users, Trophy, Shield, 
  Star, ChevronRight, Menu, X, ArrowRight, Play, CheckCircle2, Languages 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

export function Welcome() {
  const { language, setLanguage, setLicenseType, setHasVisited, licenseType } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
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
    console.log(`[Welcome] User selected license type: ${type}`);
  };

  const navLinks = [
    { name: isDE ? 'Home' : 'Home', href: '#' },
    { name: isDE ? 'Funktionen' : 'Features', href: '#features' },
    { name: isDE ? 'Erfolgsgeschichten' : 'Success Stories', href: '#success' },
    { name: isDE ? 'Über uns' : 'About', href: '#about' },
  ];

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
    console.log(`[Welcome] Navigation link clicked: ${href}`);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-900 selection:bg-blue-500/30">
      {/* Background with Overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop"
          alt="Driving Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/95" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-slate-900/90 backdrop-blur-md py-3 shadow-xl' : 'bg-transparent py-6'
      )}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 transition hover:opacity-80 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
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
                onClick={() => setHasVisited(true)}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95"
              >
                {isDE ? 'Zum Dashboard' : 'Back to Dashboard'}
              </button>
            ) : (
              <button 
                onClick={() => document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                {isDE ? 'Pfad wählen' : 'Start Now'}
              </button>
            )}

            {/* Language Switcher Desktop */}
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700/50 pl-4">
              <button
                onClick={() => setLanguage('de')}
                className={cn(
                  'px-2 py-1 text-[10px] font-black rounded-lg transition-all',
                  isDE ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
                )}
              >
                DE
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-2 py-1 text-[10px] font-black rounded-lg transition-all',
                  !isDE ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'
                )}
              >
                EN
              </button>
            </div>
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
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className="text-lg font-bold text-white"
                >
                  {link.name}
                </a>
              ))}
              {isReturningUser ? (
                <button 
                  onClick={() => setHasVisited(true)}
                  className="rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white transition hover:bg-emerald-700"
                >
                  {isDE ? 'Zum Dashboard' : 'Back to Dashboard'}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTimeout(() => document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition hover:bg-blue-700"
                >
                  {isDE ? 'Jetzt starten' : 'Start Now'}
                </button>
              )}

              {/* Language Switcher Mobile */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-6">
                <div className="flex items-center gap-2 text-slate-400">
                  <Languages className="h-5 w-5" />
                  <span className="text-sm font-bold">{isDE ? 'Sprache' : 'Language'}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('de')}
                    className={cn(
                      'px-4 py-2 text-xs font-black rounded-xl transition-all',
                      isDE ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    DEUTSCH
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      'px-4 py-2 text-xs font-black rounded-xl transition-all',
                      !isDE ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    ENGLISH
                  </button>
                </div>
              </div>
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
                onClick={() => document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
              >
                {isDE ? 'Jetzt kostenlos starten' : 'Get Started Free'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            <button 
              onClick={() => setShowDemo(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-8 py-5 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/10"
            >
              <Play className="h-5 w-5 text-blue-400" />
              {isDE ? 'Demo ansehen' : 'Watch Demo'}
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-white sm:text-5xl">
              {isDE ? 'Intelligente Funktionen' : 'Smart Features'}
            </h2>
            <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
              {isDE 
                ? 'Alles was du brauchst um deine Prüfung im ersten Anlauf zu bestehen.' 
                : 'Everything you need to pass your exam on the first attempt.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { 
                icon: Zap, 
                title: isDE ? 'KI Coaching' : 'AI Coaching', 
                desc: isDE ? 'Erhalte Echtzeit-Feedback zu deinem Fahrstil und erkenne Fehler bevor sie teuer werden.' : 'Get real-time feedback on your driving style and spot mistakes before they become costly.'
              },
              { 
                icon: BadgeCheck, 
                title: isDE ? 'Manöver-Wiederholung' : 'Maneuver Replay', 
                desc: isDE ? 'Schau dir deine Einpark- und Autobahnmanöver in der 3D-Vorschau an.' : 'Review your parking and highway maneuvers in a smooth 3D-style preview.'
              },
              { 
                icon: Users, 
                title: isDE ? 'Fahrlehrer-Synchronisation' : 'Instructor Sync', 
                desc: isDE ? 'Teile deinen Fortschritt direkt mit deinem Fahrlehrer für gezieltere Fahrstunden.' : 'Share your progress directly with your instructor for more focused driving lessons.'
              }
            ].map((f, i) => (
              <div key={i} className="group rounded-3xl border border-slate-800 bg-slate-800/20 p-8 transition hover:border-blue-500/30">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success" className="relative z-10 bg-slate-800/30 px-6 py-24 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-white sm:text-5xl">
              {isDE ? 'Schüler-Feedback' : 'Student Success'}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Lukas S.', role: isDE ? 'Frisch bestanden' : 'Just Passed', text: isDE ? 'Dank der KI-Analyse wusste ich genau, worauf ich bei der Prüfung achten muss. 10/10!' : 'Thanks to the AI analysis, I knew exactly what to look out for during the exam. 10/10!' },
              { name: 'Sarah M.', role: isDE ? 'Umschreibung' : 'Conversion', text: isDE ? 'Die Umschreibung war so einfach. Das digitale Fahrtenbuch hat mir extrem viel Zeit gespart.' : 'The conversion path was so easy. The digital logbook saved me so much time.' },
              { name: 'Marc K.', role: isDE ? 'Theorie & Praxis' : 'Theory & Practical', text: isDE ? 'Beste App auf dem Markt. Die Manöver-Simulationen sind Gold wert!' : 'Best app on the market. The maneuver simulations are worth their weight in gold!' }
            ].map((t, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-700/50 p-6 shadow-xl">
                <div className="mb-4 flex text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mb-6 text-slate-300 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 flex items-center justify-center font-bold text-blue-400 text-xs">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-black">{isDE ? 'Über DriveDE' : 'About DriveDE'}</h2>
          <p className="mt-6 text-lg text-blue-100 leading-relaxed">
            {isDE 
              ? 'Unsere Mission ist es, die Fahrausbildung in Deutschland zu digitalisieren. Wir kombinieren modernste KI-Technologie mit jahrzehntelanger Expertise, um dich sicherer und schneller in den Straßenverkehr zu bringen.'
              : 'Our mission is to digitize driver education in Germany. We combine cutting-edge AI technology with decades of expertise to get you on the road safer and faster.'}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-8 opacity-80 uppercase text-[10px] font-bold tracking-widest">
            <span>Engineering in Berlin</span>
            <span>Expert Data</span>
            <span>Privacy First</span>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDemo(false)} />
            <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/50 text-white backdrop-blur-md hover:bg-slate-900"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative h-full w-full bg-slate-950">
               {/* Real Demo Video */}
               <img 
                 src="/demo-video-final-v12.webp"
                 className="h-full w-full object-contain"
                 alt="DriveDE Demo Video"
               />
            </div>
          </div>
        </div>
      )}

      {/* Path Selection Area (Scroll-to Target) */}
      <section id="paths" className="relative z-10 bg-slate-900/80 px-6 py-24 backdrop-blur-xl">
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
                onClick={() => handleSelect(path.id as Parameters<typeof handleSelect>[0])}
                className="group relative flex flex-col items-start gap-4 rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8 text-left transition-all hover:border-blue-500/50 hover:bg-slate-800/80 active:scale-[0.98]"
              >
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner',
                  path.color === 'orange' && 'bg-orange-500/10 text-orange-500',
                  path.color === 'blue' && 'bg-blue-500/10 text-blue-500',
                  path.color === 'purple' && 'bg-purple-500/10 text-purple-500',
                  path.color === 'emerald' && 'bg-emerald-500/10 text-emerald-500',
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

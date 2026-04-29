/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Car, BadgeCheck, Zap, Users, Shield, 
  Star, Menu, X, ArrowRight, Play, CheckCircle2 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

export function Welcome() {
  const { 
    language, setLanguage, setHasVisited, licenseType,
    authStatus, userProgress 
  } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  const t = TRANSLATIONS[language];

  // A signed-in user always sees "Back to Dashboard" (they'll hit LicenseSelector if no path chosen).
  const isReturningUser = (authStatus === 'signed_in') ||
    (licenseType !== null && (userProgress.completedLessons.length > 0 || userProgress.drivingSessions.length > 0));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    setHasVisited(true);
    console.log('[Welcome] User entering app dashboard');
  };

  const navLinks = useMemo(() => [
    { name: t.common.home, href: '#' },
    { name: t.common.features, href: '#features' },
    { name: t.common.successStories, href: '#success' },
    { name: t.common.about, href: '#about' },
  ], [t]);

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
                onClick={handleStart}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-95"
              >
                {t.common.backToDashboard}
              </button>
            ) : (
              <button 
                onClick={() => document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
              >
                {t.common.startNow}
              </button>
            )}

            {/* Language Switcher Desktop */}
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700/50 pl-4">
              <button onClick={() => setLanguage('de')} className={cn('px-2 py-1 text-[10px] font-black rounded-lg transition-all', language === 'de' ? 'bg-blue-500 text-white' : 'text-slate-400')}>DE</button>
              <button onClick={() => setLanguage('en')} className={cn('px-2 py-1 text-[10px] font-black rounded-lg transition-all', language === 'en' ? 'bg-blue-500 text-white' : 'text-slate-400')}>EN</button>
            </div>
          </div>

          <button className="text-white md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900 p-6 shadow-2xl md:hidden">
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleNavLinkClick(e, link.href)} className="text-lg font-bold text-white">{link.name}</a>
              ))}
              <button onClick={handleStart} className="rounded-xl bg-blue-600 py-4 text-lg font-bold text-white">
                {isReturningUser ? t.common.backToDashboard : t.common.startNow}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-20 text-center lg:pt-0">
        <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md">
            <Shield className="h-3 w-3" />
            {t.welcome.hero.badge}
          </div>

          <h1 className="mt-8 text-5xl font-black tracking-tight text-white sm:text-7xl">
            {t.welcome.hero.titlePrefix}
            <span className="block mt-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              {t.welcome.hero.titleHighlight}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            {t.welcome.hero.subtitle}
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button 
              onClick={() => document.getElementById('paths')?.scrollIntoView({ behavior: 'smooth' })}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
            >
              {isReturningUser ? t.common.backToDashboard : t.common.getStartedFree}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-8 py-5 text-lg font-bold text-white backdrop-blur-md transition hover:bg-white/10"
            >
              <Play className="h-5 w-5 text-blue-400" />
              {t.common.watchDemo}
            </button>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black text-white sm:text-5xl">{t.welcome.features.title}</h2>
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
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success" className="relative z-10 bg-slate-800/30 px-6 py-24 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-black text-white mb-16">{t.welcome.success.title}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {t.welcome.success.stories.map((story, i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-700/50 p-6 text-left">
                <div className="mb-4 flex text-amber-500">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mb-6 text-slate-300 italic">"{story.text}"</p>
                <p className="text-sm font-bold text-white">{story.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Path Info Area */}
      <section id="paths" className="relative z-10 bg-slate-900/80 px-6 py-24 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white sm:text-4xl">{t.common.selectGoal}</h2>
            <p className="mt-4 text-slate-400">{t.common.startPersonalized}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { id: 'standard', title: t.licenseSelector.standard.title, desc: t.licenseSelector.standard.description, features: t.licenseSelector.standard.features, icon: Car, color: 'blue' },
              { id: 'conversion', title: t.licenseSelector.conversion.title, desc: t.licenseSelector.conversion.description, features: t.licenseSelector.conversion.features, icon: BadgeCheck, color: 'purple' },
            ].map((path) => (
              <div key={path.id} className="group relative flex flex-col items-start rounded-3xl border border-slate-700/50 bg-slate-800/40 p-8 text-left transition-all hover:border-blue-500/50">
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl mb-6', path.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500')}>
                  <path.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">{path.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">{path.desc}</p>
                  <div className="space-y-3">
                    {path.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button onClick={handleStart} className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-10 py-5 text-xl font-black text-white shadow-2xl transition hover:bg-blue-700 hover:scale-105">
              {t.common.getStarted}
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-900 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Car className="h-5 w-5 text-white" />
            <span className="text-lg font-black tracking-tighter text-white">DriveDE</span>
          </div>
          <p className="text-[10px] text-slate-600">© 2026 DriveDE AI. {t.common.allRightsReserved}</p>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDemo(false)} />
          <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
            <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 z-[110] flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/50 text-white"><X className="h-6 w-6" /></button>
            <img src="/demo-video-final-v12.webp" className="h-full w-full object-contain" alt="Demo" />
          </div>
        </div>
      )}
    </div>
  );
}

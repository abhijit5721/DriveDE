/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * OnboardingTour.tsx
 *
 * An interactive guided tour overlay for new users.
 * Highlights key Dashboard sections with a spotlight + tooltip card.
 * Uses the same premium glassmorphism, framer-motion, and design patterns
 * as AchievementOverlay and the rest of the app.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { syncAllData } from '../../services/supabaseSync';
import { cn } from '../../utils/cn';

import type { TabType } from '../../types';

const TOUR_STEPS: { target: string; tab: TabType }[] = [
  { target: 'readiness', tab: 'home' },
  { target: 'tour-curriculum', tab: 'curriculum' },
  { target: 'tour-maneuvers', tab: 'maneuvers' },
  { target: 'tour-tracker', tab: 'tracker' },
  { target: 'tour-account', tab: 'account' }
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const { language, setHasCompletedOnboarding, setActiveTab, activeTab } = useAppStore();
  const t = TRANSLATIONS[language];
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const totalSteps = TOUR_STEPS.length;
  const isWelcome = currentStep === -1;
  const isLastStep = currentStep === totalSteps - 1;

  // Delayed mount to let Dashboard animations finish
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Check if we need to switch tabs before updating the spotlight
  useEffect(() => {
    if (currentStep >= 0 && currentStep < totalSteps) {
      const step = TOUR_STEPS[currentStep];
      if (activeTab !== step.tab) {
        setActiveTab(step.tab);
      }
    }
  }, [currentStep, activeTab, setActiveTab, totalSteps]);

  // Calculate spotlight position for current step
  const updateSpotlight = useCallback(() => {
    if (currentStep < 0 || currentStep >= totalSteps) {
      setSpotlight(null);
      return;
    }

    const step = TOUR_STEPS[currentStep];
    const target = document.querySelector(`[data-tour="${step.target}"]`);
    
    if (!target) {
      setSpotlight(null);
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 12;

    setSpotlight({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Position tooltip above or below based on available space
    const viewportMid = window.innerHeight / 2;
    setTooltipPosition(rect.top > viewportMid ? 'top' : 'bottom');

    // Scroll element into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentStep, totalSteps]);

  // Handle polling for target elements when switching tabs
  useEffect(() => {
    if (currentStep < 0 || currentStep >= totalSteps) return;
    
    // Set an interval to poll for the DOM element to appear after tab switches
    const interval = setInterval(() => {
      const target = document.querySelector(`[data-tour="${TOUR_STEPS[currentStep].target}"]`);
      if (target) {
        updateSpotlight();
        clearInterval(interval);
      }
    }, 100);

    // Initial check
    updateSpotlight();

    return () => clearInterval(interval);
  }, [currentStep, updateSpotlight, totalSteps, activeTab]);

  useEffect(() => {
    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, true);
    return () => {
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight, true);
    };
  }, [updateSpotlight]);

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
    setTimeout(() => {
      setHasCompletedOnboarding(true);
      setActiveTab('home');
      
      // Sync immediately so the user doesn't see the tour again on next login
      const state = useAppStore.getState();
      if (state.authStatus === 'signed_in') {
        syncAllData(state).catch(console.error);
      }
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Dark overlay with spotlight cutout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: spotlight
              ? undefined
              : 'rgba(2, 6, 23, 0.75)',
            boxShadow: spotlight
              ? '0 0 0 9999px rgba(2, 6, 23, 0.75), inset 0 0 0 0 transparent'
              : undefined,
          }}
        >
          {/* Spotlight cutout using a positioned element with massive box-shadow */}
          {spotlight && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute rounded-3xl"
              style={{
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.75)',
                border: '2px solid rgba(59, 130, 246, 0.5)',
              }}
            >
              {/* Pulsing ring animation */}
              <div
                className="absolute inset-0 rounded-3xl animate-pulse"
                style={{
                  boxShadow: '0 0 20px 4px rgba(59, 130, 246, 0.3)',
                }}
              />
            </motion.div>
          )}
        </motion.div>

        {/* Welcome Card (centered, no spotlight) */}
        <AnimatePresence mode="wait">
          {isWelcome && (
            <motion.div
              key="welcome"
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <div className="relative w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-8 text-center shadow-2xl overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

                {/* Animated Icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 12 }}
                  className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/30"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-900">
                    <span className="text-5xl">🚗</span>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 text-blue-500 shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">
                    DriveDE Tour
                  </h3>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {t.onboarding.welcome}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    {t.onboarding.welcomeDesc}
                  </p>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition hover:shadow-blue-600/40 flex items-center justify-center gap-2"
                >
                  {t.onboarding.next}
                  <ChevronRight className="h-4 w-4" />
                </motion.button>

                <button
                  onClick={handleFinish}
                  className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {t.onboarding.skip}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step Tooltip Cards */}
          {!isWelcome && spotlight && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, y: tooltipPosition === 'bottom' ? -15 : 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: tooltipPosition === 'bottom' ? -15 : 15, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-4 right-4 mx-auto max-w-sm"
              style={{
                ...(tooltipPosition === 'bottom'
                  ? { top: Math.min(spotlight.top + spotlight.height + 20, window.innerHeight - 240) }
                  : { top: Math.max(spotlight.top - 220, 16) }),
              }}
            >
              <div className="relative rounded-[2rem] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 p-6 shadow-2xl shadow-black/30 overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl" />

                {/* Close button */}
                <button
                  onClick={handleFinish}
                  className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 pr-8 tracking-tight">
                    {t.onboarding.steps[currentStep]?.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-5 font-medium">
                    {t.onboarding.steps[currentStep]?.desc}
                  </p>

                  {/* Step Progress + Actions */}
                  <div className="flex items-center justify-between">
                    {/* Step Dots */}
                    <div className="flex items-center gap-1.5">
                      {TOUR_STEPS.map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{
                            width: i === currentStep ? 20 : 6,
                            backgroundColor: i === currentStep
                              ? '#3b82f6'
                              : i < currentStep
                                ? '#60a5fa'
                                : '#334155',
                          }}
                          transition={{ duration: 0.3 }}
                          className="h-1.5 rounded-full"
                        />
                      ))}
                      <span className="ml-2 text-[10px] font-bold text-slate-500 tabular-nums">
                        {currentStep + 1} {t.onboarding.stepOf} {totalSteps}
                      </span>
                    </div>

                    {/* Next/Finish Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleNext}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all',
                        isLastStep
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-600/30'
                      )}
                    >
                      {isLastStep ? t.onboarding.finish : t.onboarding.next}
                      {!isLastStep && <ChevronRight className="h-3.5 w-3.5" />}
                    </motion.button>
                  </div>
                </div>

                {/* Arrow pointer */}
                <div
                  className={cn(
                    'absolute left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-slate-900/95 border-white/10',
                    tooltipPosition === 'bottom'
                      ? '-top-2 border-l border-t'
                      : '-bottom-2 border-r border-b'
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

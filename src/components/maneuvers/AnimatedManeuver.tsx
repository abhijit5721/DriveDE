/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
import { MANEUVER_STEPS } from '../../data/maneuvers';
import { GlobalDefinitions, TopDownCar, VisionCone, SteeringWheelOverlay, InstructionPopup, GrassBackground } from './SimulatorComponents';

interface AnimatedManeuverProps {
  type: 'parallel-parking' | 'reverse-parking' | 'three-point-turn' | 'emergency-brake' | 'roundabout' | 'highway-merge';
  language?: 'de' | 'en';
}

// Helper to interpolate between two numbers
const lerp = (start: number, end: number, t: number) => start + (end - start) * (t / 100);

// SVG Transform Template to ensure unitless values for production stability
const svgTransformTemplate = ({ x, y, rotate }: any) => `translate(${x}, ${y}) rotate(${rotate})`;

/**
 * Parallel Parking Animation Logic
 */
const ParallelParkingAnimation: React.FC<{ progress: number, step: number }> = ({ progress, step }) => {
  const states = useMemo(() => [
    { x: 40, y: 185, rotation: 0, indicator: 'none' as const },
    { x: 40, y: 185, rotation: 0, indicator: 'none' as const },
    { x: 40, y: 260, rotation: 0, indicator: 'right' as const },
    { x: 40, y: 260, rotation: 0, indicator: 'right' as const },
    { x: 80, y: 310, rotation: 45, indicator: 'right' as const },
    { x: 80, y: 310, rotation: 45, indicator: 'right' as const },
    { x: 110, y: 350, rotation: 0, indicator: 'none' as const },
  ], []);

  const state = useMemo(() => {
    if (step >= states.length - 1) return states[states.length - 1];
    const s1 = states[step];
    const s2 = states[step + 1];
    return {
      x: lerp(s1.x, s2.x, progress),
      y: lerp(s1.y, s2.y, progress),
      rotation: lerp(s1.rotation, s2.rotation, progress),
      indicator: s1.indicator
    };
  }, [step, progress, states]);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full rounded-2xl shadow-inner bg-slate-800">
      <GlobalDefinitions />
      <GrassBackground />
      <rect x="0" y="100" width="400" height="300" fill="url(#roadTexture)" />
      <rect x="0" y="380" width="400" height="20" fill="#4ade80" />
      <g transform="translate(110, 200)"><TopDownCar color="#64748b" /></g>
      <g transform="translate(110, 500)"><TopDownCar color="#64748b" /></g>
      
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transformTemplate={svgTransformTemplate}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      >
        <VisionCone side={state.indicator === 'right' ? 'right' : 'round'} opacity={0.3} />
        <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} />
      </motion.g>

      <SteeringWheelOverlay rotation={state.rotation * 4} />
    </svg>
  );
};

/**
 * Reverse Parking Animation Logic
 */
const ReverseParkingAnimation: React.FC<{ progress: number, step: number }> = ({ progress, step }) => {
  const states = useMemo(() => [
    { x: 200, y: 150, rotation: -90, indicator: 'right' as const },
    { x: 200, y: 150, rotation: -90, indicator: 'right' as const },
    { x: 200, y: 220, rotation: -90, indicator: 'right' as const },
    { x: 250, y: 280, rotation: -45, indicator: 'right' as const },
    { x: 320, y: 320, rotation: 0, indicator: 'right' as const },
    { x: 320, y: 320, rotation: 0, indicator: 'none' as const },
    { x: 320, y: 350, rotation: 0, indicator: 'none' as const },
  ], []);

  const state = useMemo(() => {
    if (step >= states.length - 1) return states[states.length - 1];
    const s1 = states[step];
    const s2 = states[step + 1];
    return {
      x: lerp(s1.x, s2.x, progress),
      y: lerp(s1.y, s2.y, progress),
      rotation: lerp(s1.rotation, s2.rotation, progress),
      indicator: s1.indicator
    };
  }, [step, progress, states]);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full rounded-2xl shadow-inner bg-slate-800">
      <GlobalDefinitions />
      <rect x="0" y="0" width="400" height="400" fill="url(#roadTexture)" />
      <g stroke="#ffffff44" strokeWidth="2" strokeDasharray="5,5">
        <line x1="280" y1="280" x2="400" y2="280" />
        <line x1="280" y1="380" x2="400" y2="380" />
      </g>
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transformTemplate={svgTransformTemplate}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      >
        <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} reverseLights={step > 1} />
      </motion.g>
    </svg>
  );
};

/**
 * Three Point Turn Animation Logic
 */
const ThreePointTurnAnimation: React.FC<{ progress: number, step: number }> = ({ progress, step }) => {
  const states = useMemo(() => [
    { x: 300, y: 350, rotation: -90, indicator: 'none' as const },
    { x: 300, y: 350, rotation: -90, indicator: 'left' as const },
    { x: 100, y: 250, rotation: -160, indicator: 'left' as const },
    { x: 100, y: 250, rotation: -160, indicator: 'right' as const },
    { x: 250, y: 320, rotation: -45, indicator: 'right' as const },
    { x: 250, y: 320, rotation: -45, indicator: 'left' as const },
    { x: 100, y: 100, rotation: 90, indicator: 'none' as const },
  ], []);

  const state = useMemo(() => {
    if (step >= states.length - 1) return states[states.length - 1];
    const s1 = states[step];
    const s2 = states[step + 1];
    return {
      x: lerp(s1.x, s2.x, progress),
      y: lerp(s1.y, s2.y, progress),
      rotation: lerp(s1.rotation, s2.rotation, progress),
      indicator: s1.indicator
    };
  }, [step, progress, states]);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full rounded-2xl shadow-inner bg-slate-800">
      <GlobalDefinitions />
      <rect x="0" y="100" width="400" height="200" fill="url(#roadTexture)" />
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transformTemplate={svgTransformTemplate}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      >
        <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} reverseLights={step === 4} />
      </motion.g>
    </svg>
  );
};

/**
 * Emergency Brake Animation Logic
 */
const EmergencyBrakeAnimation: React.FC<{ progress: number, step: number }> = ({ progress, step }) => {
  const state = useMemo(() => {
    if (step < 2) return { x: 50 + (step * 100) + (progress * 1), y: 200, brake: false };
    if (step === 2) return { x: 250 + (progress * 0.2), y: 200, brake: true };
    return { x: 270, y: 200, brake: false };
  }, [step, progress]);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full rounded-2xl shadow-inner bg-slate-800">
      <GlobalDefinitions />
      <rect x="0" y="150" width="400" height="100" fill="url(#roadTexture)" />
      <motion.g
        animate={{ x: state.x, y: state.y }}
        transformTemplate={svgTransformTemplate}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      >
        <TopDownCar color="#3b82f6" brakeLights={state.brake} isUser={true} rotation={90} />
      </motion.g>
      {step === 1 && (
        <motion.text
          x="200" y="100"
          textAnchor="middle"
          fill="#ef4444"
          className="text-3xl font-black italic"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
        >
          GEFAHR! STOPP!
        </motion.text>
      )}
    </svg>
  );
};

/**
 * Roundabout Animation Logic
 */
const RoundaboutAnimation: React.FC<{ progress: number, step: number }> = ({ progress, step }) => {
  const state = useMemo(() => {
    const center = { x: 200, y: 200 };
    const radius = 80;
    if (step === 0) return { x: 200, y: 350 - (progress * 0.5), rotation: 0, indicator: 'none' as const };
    if (step === 1) return { x: 200, y: 300, rotation: 0, indicator: 'none' as const };
    if (step === 2) return { x: 200 + (progress * 0.3), y: 300 - (progress * 0.2), rotation: 45, indicator: 'none' as const };
    if (step === 3) {
      const angle = (progress * 1.8) - 45;
      const rad = (angle * Math.PI) / 180;
      return {
        x: center.x + Math.cos(rad) * radius,
        y: center.y + Math.sin(rad) * radius,
        rotation: angle + 90,
        indicator: 'none' as const
      };
    }
    if (step === 4) return { x: 120, y: 200, rotation: 180, indicator: 'right' as const };
    return { x: 50, y: 200, rotation: 180, indicator: 'none' as const };
  }, [step, progress]);

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full rounded-2xl shadow-inner bg-slate-800">
      <GlobalDefinitions />
      <circle cx="200" cy="200" r="120" fill="url(#roadTexture)" />
      <circle cx="200" cy="200" r="60" fill="#064e3b" stroke="#059669" strokeWidth="4" />
      <rect x="180" y="320" width="40" height="80" fill="url(#roadTexture)" />
      <rect x="0" y="180" width="80" height="40" fill="url(#roadTexture)" />
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transformTemplate={svgTransformTemplate}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      >
        <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} />
      </motion.g>
    </svg>
  );
};

const AnimatedManeuver: React.FC<AnimatedManeuverProps> = ({ type, language = 'de' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  const steps = MANEUVER_STEPS[type] || [];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      const currentDuration = steps[currentStep]?.duration || 2000;
      const progressIncrement = 100 / (currentDuration / 100);
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentStep < steps.length - 1) {
              setCurrentStep(s => s + 1);
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + progressIncrement;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps]);

  const handleReset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const renderAnimation = () => {
    switch (type) {
      case 'parallel-parking': return <ParallelParkingAnimation progress={progress} step={currentStep} />;
      case 'reverse-parking': return <ReverseParkingAnimation progress={progress} step={currentStep} />;
      case 'three-point-turn': return <ThreePointTurnAnimation progress={progress} step={currentStep} />;
      case 'emergency-brake': return <EmergencyBrakeAnimation progress={progress} step={currentStep} />;
      case 'roundabout': return <RoundaboutAnimation progress={progress} step={currentStep} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-3xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl" ref={containerRef}>
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/20">
            <span className="text-sm font-bold">{currentStep + 1}</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide uppercase">
              {language === 'de' ? 'Aktueller Schritt' : 'Current Step'}
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              {currentStep + 1} / {steps.length}
            </p>
          </div>
        </div>
        <button onClick={() => setShowHelp(!showHelp)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
          <HelpCircle size={18} />
        </button>
      </div>
      <div className="relative flex-1 min-h-[300px] bg-slate-950/50 group overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={type} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="w-full h-full p-4">
            {renderAnimation()}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {isPlaying && <InstructionPopup text={language === 'de' ? steps[currentStep].description : steps[currentStep].descriptionEn} />}
        </AnimatePresence>
        <AnimatePresence>
          {showHelp && (
            <motion.div initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(8px)' }} exit={{ opacity: 0, backdropFilter: 'blur(0px)' }} className="absolute inset-0 bg-slate-900/60 z-50 p-8 flex flex-col items-center justify-center text-center">
              <HelpCircle className="text-blue-400 mb-4" size={48} />
              <h4 className="text-white font-bold text-xl mb-2">Simulations-Hilfe</h4>
              <p className="text-slate-300 max-w-xs mb-6">Beobachte die Animation genau. Achte auf Blinker, Schulterblick und die Position des Fahrzeugs.</p>
              <button onClick={() => setShowHelp(false)} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors">Verstanden</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-6 bg-white/5 border-t border-white/5 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.round(((currentStep + progress / 100) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" initial={false} animate={{ width: `${((currentStep + progress / 100) / steps.length) * 100}%` }} transition={{ type: 'tween', ease: 'linear', duration: 0.1 }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => { if (currentStep > 0) { setCurrentStep(s => s - 1); setProgress(0); } }} disabled={currentStep === 0} className="p-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:bg-blue-400 transition-all active:scale-95 group">
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={() => { if (currentStep < steps.length - 1) { setCurrentStep(s => s + 1); setProgress(0); } }} disabled={currentStep === steps.length - 1} className="p-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90">
            <ChevronRight size={20} />
          </button>
          <button onClick={handleReset} className="p-3 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all active:scale-90">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedManeuver;

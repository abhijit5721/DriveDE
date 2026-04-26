/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * AnimatedManeuver.tsx
 * 
 * Interactive 3D-style animations for driving maneuvers (parking, three-point turns, etc).
 * Uses Framer Motion for state interpolation and SVG for top-down rendering.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalDefinitions, TopDownCar, VisionCone, SteeringWheelOverlay, InstructionPopup } from './SimulatorComponents';
import { MANEUVER_STEPS } from '../../data/maneuvers';
import { TRANSLATIONS } from '../../data/translations';

interface AnimatedManeuverProps {
  type: 'parallel-parking' | 'reverse-parking' | 'three-point-turn' | 'emergency-brake' | 'roundabout' | 'highway-merge';
  language: 'de' | 'en';
}

const AnimatedManeuver: React.FC<AnimatedManeuverProps> = ({ type, language }) => {
  const t = TRANSLATIONS[language];
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const steps = useMemo(() => MANEUVER_STEPS[type] || [], [type]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && steps.length > 0) {
      const currentDuration = steps[currentStep]?.duration || 2000;
      const progressIncrement = 100 / (currentDuration / 50);
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
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps]);

  const handleReset = () => {
    setCurrentStep(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
    }
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
    }
  };

  const renderAnimation = () => {
    const props = { step: currentStep, progress, t };
    switch (type) {
      case 'parallel-parking': return <ParallelParkingAnimation {...props} />;
      case 'reverse-parking': return <ReverseParkingAnimation {...props} />;
      case 'three-point-turn': return <ThreePointTurnAnimation {...props} />;
      case 'emergency-brake': return <EmergencyBrakeAnimation {...props} />;
      case 'roundabout': return <RoundaboutAnimation {...props} />;
      case 'highway-merge': return <HighwayMergeAnimation {...props} />;
      default: return null;
    }
  };

  return (
    <div className="bg-[#030712] rounded-3xl overflow-hidden border border-[#1e293b] shadow-2xl">
      <GlobalDefinitions />
      <div className="relative bg-[#020617] p-6">
        <div className="aspect-video rounded-2xl overflow-hidden flex items-center justify-center border border-[#1e293b] shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-[#030712] relative group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.05),transparent_60%)] pointer-events-none" />
          {renderAnimation()}
        </div>
        <div className="absolute top-10 right-10 bg-[#38BDF8] text-[#030712] px-4 py-1.5 rounded-full text-sm font-black shadow-[0_0_20px_rgba(56,189,248,0.4)]">
          {currentStep + 1} <span className="opacity-50 mx-1">/</span> {steps.length}
        </div>
      </div>

      <div className="px-8 py-6 bg-[#030712] border-t border-[#1e293b]">
        <div className="text-slate-100 text-center font-bold text-xl min-h-[3.5rem] flex items-center justify-center">
          {language === 'de' ? steps[currentStep]?.description : steps[currentStep]?.descriptionEn}
        </div>
        <div className="mt-6 h-2 bg-[#1e293b] rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.6)]"
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 p-6 bg-[#020617] border-t border-[#1e293b]">
        <button onClick={handleReset} className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-[#38BDF8] hover:border-[#38BDF8]/50 transition-all shadow-lg active:scale-95 group">
          <RotateCcw size={22} className="group-hover:rotate-[-45deg] transition-transform" />
        </button>
        <button onClick={handlePrevStep} disabled={currentStep === 0} className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-[#38BDF8] shadow-lg disabled:opacity-20 active:scale-95">
          <ChevronLeft size={22} />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="p-5 rounded-3xl bg-[#38BDF8] text-[#030712] hover:scale-105 shadow-[0_0_25px_rgba(56,189,248,0.3)] transition-all active:scale-95">
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="translate-x-0.5" fill="currentColor" />}
        </button>
        <button onClick={handleNextStep} disabled={currentStep === steps.length - 1} className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-[#38BDF8] shadow-lg disabled:opacity-20 active:scale-95">
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="flex gap-3 p-6 overflow-x-auto bg-[#030712] no-scrollbar">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => { setCurrentStep(index); setProgress(0); setIsPlaying(false); }}
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
              index === currentStep ? 'bg-[#38BDF8] text-[#030712] shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-110' : 'bg-[#0f172a] text-slate-500 border border-[#1e293b]'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

interface AnimationProps {
  step: number;
  progress: number;
  t: any;
}

// Animation Components
const ParallelParkingAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  const getInterpolatedState = () => {
    const states = [
      { x: 30, y: 90, rotation: 0, wheel: 0, indicator: 'none' as const },       // 0: Start
      { x: 150, y: 90, rotation: 0, wheel: 0, indicator: 'none' as const },      // 1: Driving
      { x: 330, y: 90, rotation: 0, wheel: 0, indicator: 'right' as const },    // 2: Next to front car
      { x: 330, y: 90, rotation: 0, wheel: 60, indicator: 'right' as const },    // 3: Turn wheel right
      { x: 260, y: 120, rotation: -35, wheel: 60, indicator: 'right' as const },  // 4: Backing in
      { x: 260, y: 120, rotation: -35, wheel: -60, indicator: 'right' as const }, // 5: Counter-steer
      { x: 200, y: 150, rotation: 0, wheel: -60, indicator: 'right' as const },  // 6: Straightening
      { x: 200, y: 150, rotation: 0, wheel: 0, indicator: 'none' as const },      // 7: Done
      { x: 200, y: 150, rotation: 0, wheel: 0, indicator: 'none' as const },      // 8: Done
    ];

    const current = states[step] || states[0];
    const next = states[step + 1] || current;

    const p = progress / 100;
    return {
      x: current.x + (next.x - current.x) * p,
      y: current.y + (next.y - current.y) * p,
      rotation: current.rotation + (next.rotation - current.rotation) * p,
      wheel: current.wheel + (next.wheel - current.wheel) * p,
      indicator: p > 0.5 ? next.indicator : current.indicator
    };
  };

  const state = getInterpolatedState();
  
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.checkSurroundings} />}
        {step === 4 && <InstructionPopup text={t.maneuvers.interactive.simulator.steerAndReverse} />}
        {step === 6 && <InstructionPopup text={t.maneuvers.interactive.simulator.counterSteer} />}
      </AnimatePresence>
      
      <svg viewBox="0 0 400 250" className="w-full h-full">
        {/* Grass */}
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        {/* Road */}
        <rect x="0" y="50" width="400" height="180" fill="#334155" />
        {/* Curb */}
        <rect x="0" y="210" width="400" height="40" fill="#94a3b8" />
        <rect x="0" y="210" width="400" height="4" fill="#64748b" />

        {/* Parked Cars */}
        <g transform="translate(70, 185)"><TopDownCar color="#94a3b8" /></g>
        <g transform="translate(330, 185)"><TopDownCar color="#94a3b8" /></g>

        {/* Path Arrow */}
        {step >= 3 && step <= 6 && (
          <path d="M 295 90 Q 260 120 200 190" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="8,8" opacity="0.4" />
        )}

        {/* User Car */}
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} />
          <AnimatePresence>
            {step === 1 && (
              <g transform="translate(0, -10)">
                <VisionCone side="round" opacity={0.4} />
              </g>
            )}
            {step === 4 && <VisionCone side="left" opacity={0.6} />}
          </AnimatePresence>
        </g>
        <SteeringWheelOverlay rotation={state.wheel} />
      </svg>
    </div>
  );
};

const ReverseParkingAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  const getInterpolatedState = () => {
    const states = [
      { x: 40, y: 70, rotation: 0, wheel: 0, indicator: 'none' as const },
      { x: 140, y: 70, rotation: 0, wheel: 0, indicator: 'right' as const },
      { x: 320, y: 70, rotation: 0, wheel: 0, indicator: 'right' as const },
      { x: 280, y: 110, rotation: -45, wheel: 60, indicator: 'right' as const },
      { x: 220, y: 160, rotation: -90, wheel: 60, indicator: 'right' as const },
      { x: 220, y: 200, rotation: -90, wheel: 0, indicator: 'none' as const },
      { x: 220, y: 200, rotation: -90, wheel: 0, indicator: 'none' as const },
    ];

    const current = states[step] || states[0];
    const next = states[step + 1] || current;
    const p = progress / 100;

    return {
      x: current.x + (next.x - current.x) * p,
      y: current.y + (next.y - current.y) * p,
      rotation: current.rotation + (next.rotation - current.rotation) * p,
      wheel: current.wheel + (next.wheel - current.wheel) * p,
      indicator: p > 0.5 ? next.indicator : current.indicator
    };
  };

  const state = getInterpolatedState();

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.checkSurroundings} />}
        {step === 3 && <InstructionPopup text={t.maneuvers.interactive.simulator.shoulderCheckRight} />}
      </AnimatePresence>
      
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="0" width="400" height="150" fill="#334155" />
        
        {/* Parking Slots (Bottom row) */}
        {[60, 140, 220, 300, 380].map(x => (
          <g key={x}>
            <line x1={x - 40} y1={150} x2={x - 40} y2={250} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" />
            <line x1={x + 40} y1={150} x2={x + 40} y2={250} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" />
          </g>
        ))}
        
        {/* Stationary Cars */}
        <g transform="translate(140, 200) rotate(-90)"><TopDownCar color="#94a3b8" /></g>
        <g transform="translate(300, 200) rotate(-90)"><TopDownCar color="#94a3b8" /></g>

        {/* User Car */}
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} />
          <AnimatePresence>
            {step === 1 && <VisionCone side="round" opacity={0.4} />}
            {step === 3 && <VisionCone side="right" opacity={0.6} />}
          </AnimatePresence>
        </g>
        <SteeringWheelOverlay rotation={state.wheel} />
      </svg>
    </div>
  );
};

const ThreePointTurnAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  const getInterpolatedState = () => {
    const states = [
      { x: 350, y: 155, rotation: 0, wheel: 0, indicator: 'none' as const },
      { x: 300, y: 155, rotation: 0, wheel: 0, indicator: 'left' as const },
      { x: 300, y: 155, rotation: 0, wheel: -90, indicator: 'left' as const },
      { x: 150, y: 105, rotation: -150, wheel: -90, indicator: 'left' as const },
      { x: 150, y: 105, rotation: -150, wheel: 90, indicator: 'right' as const },
      { x: 250, y: 170, rotation: -60, wheel: 90, indicator: 'right' as const },
      { x: 250, y: 170, rotation: -60, wheel: -90, indicator: 'left' as const },
      { x: 50, y: 120, rotation: -180, wheel: 0, indicator: 'none' as const },
    ];

    const current = states[step] || states[0];
    const next = states[step + 1] || current;
    const p = progress / 100;

    return {
      x: current.x + (next.x - current.x) * p,
      y: current.y + (next.y - current.y) * p,
      rotation: current.rotation + (next.rotation - current.rotation) * p,
      wheel: current.wheel + (next.wheel - current.wheel) * p,
      indicator: p > 0.5 ? next.indicator : current.indicator
    };
  };

  const state = getInterpolatedState();

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.shoulderCheckLeft} />}
        {step === 3 && <InstructionPopup text={t.maneuvers.interactive.simulator.fullCheckAndSignalRight} />}
        {step === 5 && <InstructionPopup text={t.maneuvers.interactive.simulator.shoulderCheckLeft} />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="70" width="400" height="110" fill="#334155" />
        <rect x="0" y="70" width="400" height="2" fill="#94a3b8" />
        <rect x="0" y="178" width="400" height="2" fill="#94a3b8" />
        
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} scale={0.8} />
          <AnimatePresence>
            {step === 1 && <VisionCone side="left" opacity={0.6} />}
            {step === 3 && <VisionCone side="round" opacity={0.4} />}
            {step === 5 && <VisionCone side="left" opacity={0.6} />}
          </AnimatePresence>
        </g>
        <SteeringWheelOverlay rotation={state.wheel} />
      </svg>
    </div>
  );
};

const EmergencyBrakeAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  const getInterpolatedState = () => {
    const states = [
      { x: 40, y: 145, speed: 30, brake: false },
      { x: 120, y: 145, speed: 30, brake: false },
      { x: 160, y: 145, speed: 10, brake: true },
      { x: 180, y: 145, speed: 0, brake: true },
      { x: 180, y: 145, speed: 0, brake: false },
    ];

    const current = states[step] || states[0];
    const next = states[step + 1] || current;
    const p = progress / 100;

    return {
      x: current.x + (next.x - current.x) * p,
      y: current.y + (next.y - current.y) * p,
      speed: current.speed + (next.speed - current.speed) * p,
      brake: p > 0.1 ? next.brake : current.brake
    };
  };

  const state = getInterpolatedState();

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.dangerEmergencyBrake} />}
        {step === 4 && <InstructionPopup text={t.maneuvers.interactive.simulator.checkBeforeDrive} />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="80" width="400" height="90" fill="#334155" />
        <line x1="0" y1="125" x2="400" y2="125" stroke="white" strokeWidth="1" strokeDasharray="10,10" opacity="0.2" />

        <g transform={`translate(${state.x}, ${state.y})`}>
          <TopDownCar color="#3b82f6" isUser={true} brakeLights={state.brake} scale={0.8} />
          {step === 4 && <VisionCone side="round" opacity={0.5} />}
        </g>

        {/* Speedometer */}
        <g transform="translate(330, 190)">
          <circle r="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <path d="M -30 0 A 30 30 0 1 1 30 0" fill="none" stroke="#1e293b" strokeWidth="4" />
          <motion.line
            animate={{ rotate: (state.speed / 50) * 180 - 90 }}
            x1="0" y1="0" x2="0" y2="-25"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text textAnchor="middle" y="25" fill="#38BDF8" className="text-xl font-black">{Math.round(state.speed)}</text>
          <text textAnchor="middle" y="38" fill="#64748b" className="text-[8px] font-bold">KM/H</text>
        </g>
      </svg>
    </div>
  );
};

const RoundaboutAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  const getCarState = () => {
    const cx = 200;
    const cy = 125;
    const r = 65;
    const p = progress / 100;

    switch (step) {
      case 0: return { x: 212, y: 220 - 25 * p, rotation: -90, indicator: 'none' as const };
      case 1: return { x: 212, y: 195, rotation: -90, indicator: 'none' as const };
      case 2: { // Enter
        const startAngle = 90;
        const endAngle = 45;
        const angle = startAngle + (endAngle - startAngle) * p;
        return { 
          x: cx + r * Math.cos(angle * Math.PI / 180),
          y: cy + r * Math.sin(angle * Math.PI / 180),
          rotation: angle - 90,
          indicator: 'none' as const
        };
      }
      case 3: { // Circulate
        const startAngle = 45;
        const endAngle = -180;
        const angle = startAngle + (endAngle - startAngle) * p;
        return {
          x: cx + r * Math.cos(angle * Math.PI / 180),
          y: cy + r * Math.sin(angle * Math.PI / 180),
          rotation: angle - 90,
          indicator: 'none' as const
        };
      }
      case 4: { // Signal
        const angle = -180;
        return {
          x: cx + r * Math.cos(angle * Math.PI / 180),
          y: cy + r * Math.sin(angle * Math.PI / 180),
          rotation: angle - 90,
          indicator: 'right' as const
        };
      }
      case 5: { // Exit
        const startX = 135;
        const endX = -50;
        return { x: startX + (endX - startX) * p, y: 125, rotation: -180, indicator: 'right' as const };
      }
      default: return { x: 212, y: 220, rotation: -90, indicator: 'none' as const };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.tracker.priorityCheck || t.maneuvers.interactive.simulator.checkSurroundings} />}
        {step === 4 && <InstructionPopup text={t.maneuvers.interactive.simulator.signalRightAndShoulder} />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <circle cx="200" cy="125" r="90" fill="#334155" />
        <circle cx="200" cy="125" r="40" fill="#ecfdf5" />
        <rect x="175" y="180" width="50" height="70" fill="#334155" />
        <rect x="0" y="100" width="130" height="50" fill="#334155" />
        
        {/* Yield Line */}
        <line x1="175" y1="185" x2="225" y2="185" stroke="#fff" strokeWidth="3" strokeDasharray="4,4" />

        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} scale={0.7} />
          <AnimatePresence>
            {step === 1 && <VisionCone side="left" opacity={0.6} />}
            {step === 4 && <VisionCone side="right" opacity={0.6} />}
          </AnimatePresence>
        </g>
      </svg>
    </div>
  );
};

const HighwayMergeAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  const getInterpolatedState = () => {
    const states = [
      { x: 40, y: 190, rotation: -5, speed: 40, indicator: 'none' as const },
      { x: 120, y: 180, rotation: -8, speed: 70, indicator: 'left' as const },
      { x: 250, y: 130, rotation: -12, speed: 95, indicator: 'left' as const },
      { x: 420, y: 110, rotation: 0, speed: 110, indicator: 'none' as const },
    ];

    const current = states[step] || states[0];
    const next = states[step + 1] || current;
    const p = progress / 100;

    return {
      x: current.x + (next.x - current.x) * p,
      y: current.y + (next.y - current.y) * p,
      rotation: current.rotation + (next.rotation - current.rotation) * p,
      speed: current.speed + (next.speed - current.speed) * p,
      indicator: p > 0.5 ? next.indicator : current.indicator
    };
  };

  const state = getInterpolatedState();

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.signalLeftAndAccelerate} />}
        {step === 2 && <InstructionPopup text={t.maneuvers.interactive.simulator.mirrorAndShoulderLeft} />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="40" width="400" height="100" fill="#334155" />
        <line x1="0" y1="90" x2="400" y2="90" stroke="#fff" strokeWidth="2" strokeDasharray="15,15" opacity="0.3" />
        <path d="M 0 210 Q 150 200 400 150" fill="#334155" />
        <line x1="150" y1="180" x2="400" y2="140" stroke="#fff" strokeWidth="3" strokeDasharray="8,8" opacity="0.5" />

        <g transform="translate(320, 65)"><TopDownCar color="#94a3b8" scale={0.8} /></g>

        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} scale={0.8} />
          {step === 2 && <VisionCone side="left" opacity={0.6} />}
        </g>

        {/* Speed Bar */}
        <g transform="translate(20, 20)">
          <rect width="100" height="10" rx="5" fill="#1e293b" opacity="0.2" />
          <motion.rect animate={{ width: (state.speed / 120) * 100 }} height="10" rx="5" fill="#38BDF8" />
          <text x="110" y="10" fill="#1e293b" className="text-[10px] font-black">{Math.round(state.speed)} KM/H</text>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedManeuver;

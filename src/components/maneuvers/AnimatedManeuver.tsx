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
import { GlobalDefinitions, RealCar, VisionCone, SteeringWheelOverlay, InstructionPopup, GrassBackground, Building, Tree } from './SimulatorComponents';
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
        <div className="absolute top-10 right-10 bg-[#38BDF8] text-[#030712] px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(56,189,248,0.4)]">
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
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
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

// ---- shared bicycle-model motion engine ----
// Cars sweep exact circular arcs (like a real steered vehicle) instead of
// sliding between keyframes. Poses chain across steps so every segment
// starts exactly where the previous one ended.
type Pose = { x: number; y: number; h: number };
type Motion =
  | { kind: 'straight'; to: { x: number; y: number } }
  | { kind: 'coast'; dist: number } // along current heading; negative = reverse
  | { kind: 'arc'; steer: 'left' | 'right'; rev: boolean; R: number; dh: number }
  | { kind: 'hold' };
type MotionStep = { m: Motion; w: number }[];

const advancePose = (pose: Pose, m: Motion, p: number): Pose => {
  if (m.kind === 'hold' || p <= 0) return pose;
  if (m.kind === 'straight') {
    return { x: pose.x + (m.to.x - pose.x) * p, y: pose.y + (m.to.y - pose.y) * p, h: pose.h };
  }
  if (m.kind === 'coast') {
    const t = (pose.h * Math.PI) / 180;
    return { x: pose.x + m.dist * p * Math.cos(t), y: pose.y + m.dist * p * Math.sin(t), h: pose.h };
  }
  const t0 = (pose.h * Math.PI) / 180;
  // turning-circle center sits on the side the wheels point
  const side = m.steer === 'left' ? 1 : -1;
  const cx = pose.x + side * m.R * Math.sin(t0);
  const cy = pose.y - side * m.R * Math.cos(t0);
  // heading: fwd-left and rev-right rotate CCW (negative), the others CW
  const sign = (m.steer === 'left') !== m.rev ? -1 : 1;
  const a0 = Math.atan2(pose.y - cy, pose.x - cx);
  const a = a0 + sign * ((m.dh * Math.PI) / 180) * p;
  return { x: cx + m.R * Math.cos(a), y: cy + m.R * Math.sin(a), h: pose.h + sign * m.dh * p };
};

const advanceParts = (pose: Pose, parts: MotionStep, p: number): Pose => {
  let acc = 0;
  for (const { m, w } of parts) {
    if (p <= acc) break;
    const local = Math.min((p - acc) / w, 1);
    pose = advancePose(pose, m, local);
    acc += w;
  }
  return pose;
};

const smoothstep = (v: number) => v * v * (3 - 2 * v);

const chainPose = (start: Pose, steps: MotionStep[], step: number, easedP: number): Pose => {
  let pose = { ...start };
  for (let i = 0; i < step && i < steps.length; i++) pose = advanceParts(pose, steps[i], 1);
  return advanceParts(pose, steps[step] || [{ m: { kind: 'hold' }, w: 1 }], easedP);
};

// Animation Components
const ParallelParkingAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  // Pull up beside the front parked car, reverse in with right lock,
  // counter-steer at 45 degrees, settle 30cm off the curb.
  const START = { x: 10, y: 150, h: 0 };
  const STEPS: MotionStep[] = [
    [{ m: { kind: 'straight', to: { x: 330, y: 150 } }, w: 1 }],               // 0: stop beside parked car
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 1: 360 check
    [{ m: { kind: 'coast', dist: -20 }, w: 1 }],                               // 2: reverse to align rear axle
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 3: wheel right
    [{ m: { kind: 'arc', steer: 'right', rev: true, R: 72, dh: 38 }, w: 1 }],  // 4: back into the gap
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 5: counter-steer at 45
    [                                                                          // 6: straighten, roll back level
      { m: { kind: 'arc', steer: 'left', rev: true, R: 72, dh: 38 }, w: 0.75 },
      { m: { kind: 'coast', dist: -12 }, w: 0.25 },
    ],
  ];
  const p = smoothstep(Math.min(Math.max(progress, 0), 100) / 100);
  const pose = chainPose(START, STEPS, step, p);
  const lerp = (a: number, b: number) => a + (b - a) * p;
  let wheel = 0;
  let indicator: 'left' | 'right' | 'none' = 'none';
  let reverse = false;
  switch (step) {
    case 0: indicator = p > 0.7 ? 'right' : 'none'; break;
    case 1: indicator = 'right'; break;
    case 2: indicator = 'right'; reverse = true; break;
    case 3: indicator = 'right'; wheel = lerp(0, 60); reverse = true; break;
    case 4: indicator = 'right'; wheel = 60; reverse = true; break;
    case 5: indicator = 'right'; wheel = lerp(60, -60); reverse = true; break;
    case 6: indicator = p > 0.8 ? 'none' : 'right'; wheel = lerp(-60, 0); reverse = p < 0.8; break;
  }
  const state = { x: pose.x, y: pose.y, rotation: pose.h, wheel, indicator, reverse };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.checkSurroundings} />}
        {step === 4 && <InstructionPopup text={t.maneuvers.interactive.simulator.steerAndReverse} />}
        {step === 6 && <InstructionPopup text={t.maneuvers.interactive.simulator.counterSteer} />}
      </AnimatePresence>
      
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <GrassBackground />
        
        {/* Environment */}
        <Building x={8} y={2} width={68} height={46} />
        <Building x={328} y={2} width={68} height={46} />
        <Tree x={120} y={26} size={38} />
        <Tree x={290} y={23} size={32} />
        {/* Road */}
        <rect x="0" y="50" width="400" height="180" fill="url(#roadTexture)" />
        {/* Edge line + parking-lane marking */}
        <line x1="0" y1="55" x2="400" y2="55" stroke="#fff" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="128" x2="400" y2="128" stroke="#fff" strokeWidth="2" strokeDasharray="14,10" opacity="0.35" />
        {/* Curb + sidewalk with paving joints */}
        <rect x="0" y="210" width="400" height="40" fill="#a8b1bd" />
        <rect x="0" y="210" width="400" height="4" fill="#64748b" />
        {[...Array(20)].map((_, i) => (
          <line key={i} x1={i * 21} y1={214} x2={i * 21} y2={250} stroke="#8b95a3" strokeWidth="1.5" opacity="0.7" />
        ))}

        {/* Parked Cars */}
        <g transform="translate(70, 185)"><RealCar variant="navy" /></g>
        <g transform="translate(330, 185)"><RealCar variant="sand" /></g>

        {/* Path Arrow */}
        {step >= 3 && step <= 6 && (
          <path d="M 310 150 Q 285 172 210 181" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="8,8" opacity="0.4" />
        )}

        {/* User Car */}
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <RealCar indicator={state.indicator} reverseLights={state.reverse} />
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
  // Drive past the bay, reverse straight, then a clean 90-degree right-lock
  // arc into the slot, finishing with a straight roll to center.
  const START = { x: 30, y: 70, h: 0 };
  const STEPS: MotionStep[] = [
    [{ m: { kind: 'straight', to: { x: 320, y: 70 } }, w: 1 }],                // 0: drive past the space
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 1: 360 check
    [{ m: { kind: 'coast', dist: -35 }, w: 1 }],                               // 2: reverse straight
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 3: wheel right
    [{ m: { kind: 'arc', steer: 'right', rev: true, R: 65, dh: 90 }, w: 1 }],  // 4: swing into the slot
    [{ m: { kind: 'coast', dist: -40 }, w: 1 }],                               // 5: straighten and roll back
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 6: centered
  ];
  const p = smoothstep(Math.min(Math.max(progress, 0), 100) / 100);
  const pose = chainPose(START, STEPS, step, p);
  const lerp = (a: number, b: number) => a + (b - a) * p;
  let wheel = 0;
  let indicator: 'left' | 'right' | 'none' = 'none';
  let reverse = false;
  switch (step) {
    case 0: indicator = p > 0.5 ? 'right' : 'none'; break;
    case 1: indicator = 'right'; break;
    case 2: indicator = 'right'; reverse = true; break;
    case 3: indicator = 'right'; wheel = lerp(0, 60); reverse = true; break;
    case 4: indicator = 'right'; wheel = 60; reverse = true; break;
    case 5: wheel = lerp(60, 0); reverse = true; break;
    case 6: break;
  }
  const state = { x: pose.x, y: pose.y, rotation: pose.h, wheel, indicator, reverse };


  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.checkSurroundings} />}
        {step === 3 && <InstructionPopup text={t.maneuvers.interactive.simulator.shoulderCheckRight} />}
      </AnimatePresence>
      
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <GrassBackground />
        
        {/* Parking Lot Surface */}
        <rect x="0" y="0" width="400" height="210" fill="url(#roadTexture)" />
        <rect x="0" y="210" width="400" height="15" fill="#a8b1bd" /> {/* Sidewalk */}
        {[...Array(20)].map((_, i) => (
          <line key={i} x1={i * 21} y1={210} x2={i * 21} y2={225} stroke="#8b95a3" strokeWidth="1.5" opacity="0.7" />
        ))}
        
        {/* Environment - Buildings on Grass */}
        <Building x={20} y={220} width={40} height={30} type="house" />
        <Building x={340} y={220} width={40} height={30} type="store" />
        <Tree x={120} y={235} size={30} />
        <Tree x={265} y={238} size={26} />
        
        {/* Parking Slots (Bottom row) */}
        {[60, 140, 220, 300, 380].map(x => (
          <g key={x}>
            <line x1={x - 40} y1={140} x2={x - 40} y2={210} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" />
            <line x1={x + 40} y1={140} x2={x + 40} y2={210} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" />
          </g>
        ))}
        
        {/* Stationary Cars */}
        <g transform="translate(140, 180) rotate(-90)"><RealCar variant="bordeaux" /></g>
        <g transform="translate(300, 180) rotate(-90)"><RealCar variant="sand" /></g>

        {/* User Car */}
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <RealCar indicator={state.indicator} reverseLights={state.reverse} />
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
  // Geometry tuned for the 400x250 road (curbs at x=143/255).
  const START = { x: 233, y: 222, h: -90 };
  const STEPS: MotionStep[] = [
    [{ m: { kind: 'straight', to: { x: 236, y: 200 } }, w: 1 }],               // 0: pull over right, signal left
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 1: mirror + shoulder check left
    [{ m: { kind: 'arc', steer: 'left', rev: false, R: 54, dh: 80 }, w: 1 }],  // 2: forward arc to left curb
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 3: reverse gear, signal right, look around
    [{ m: { kind: 'arc', steer: 'right', rev: true, R: 38, dh: 66 }, w: 1 }],  // 4: reverse arc to right curb
    [{ m: { kind: 'hold' }, w: 1 }],                                           // 5: first gear, signal left, shoulder check
    [                                                                          // 6: cross the center line, settle into own lane
      { m: { kind: 'coast', dist: 65 }, w: 0.55 },
      { m: { kind: 'arc', steer: 'left', rev: false, R: 44, dh: 34 }, w: 0.45 },
    ],
  ];
  const p = smoothstep(Math.min(Math.max(progress, 0), 100) / 100);
  const pose = chainPose(START, STEPS, step, p);

  // wheel / indicator / reverse choreography synced to the step texts
  const lerp = (a: number, b: number) => a + (b - a) * p;
  let wheel = 0;
  let indicator: 'left' | 'right' | 'none' = 'none';
  let reverse = false;
  switch (step) {
    case 0: indicator = p > 0.5 ? 'left' : 'none'; break;
    case 1: indicator = 'left'; wheel = p > 0.6 ? lerp(0, -90) : 0; break;
    case 2: indicator = 'left'; wheel = -90; break;
    case 3: indicator = p > 0.4 ? 'right' : 'left'; wheel = lerp(-90, 90); reverse = p > 0.3; break;
    case 4: indicator = 'right'; wheel = 90; reverse = true; break;
    case 5: indicator = p > 0.4 ? 'left' : 'right'; wheel = lerp(90, -35); break;
    case 6: indicator = p > 0.6 ? 'none' : 'left'; wheel = lerp(-35, 0); break;
  }

  const state = { x: pose.x, y: pose.y, rotation: pose.h, wheel, indicator, reverse };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.maneuvers.interactive.simulator.shoulderCheckLeft} />}
        {step === 3 && <InstructionPopup text={t.maneuvers.interactive.simulator.fullCheckAndSignalRight} />}
        {step === 5 && <InstructionPopup text={t.maneuvers.interactive.simulator.shoulderCheckLeft} />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <GrassBackground />
        
        {/* Road with Texture */}
        <rect x="145" y="0" width="110" height="250" fill="url(#roadTexture)" />
        
        {/* Environment Details */}
        <Building x={28} y={16} width={94} height={64} type="house" />
        <Building x={268} y={150} width={106} height={74} type="office" />
        <Building x={282} y={28} width={78} height={56} type="store" />
        <Tree x={92} y={128} size={40} />
        <Tree x={45} y={205} size={34} />
        <Tree x={330} y={112} size={36} />
        {/* Center Line */}
        <line x1="200" y1="0" x2="200" y2="250" stroke="#94a3b8" strokeWidth="2" strokeDasharray="10,10" opacity="0.3" />
        {/* Curbs + edge lines */}
        <rect x="143" y="0" width="2" height="250" fill="#94a3b8" />
        <rect x="255" y="0" width="2" height="250" fill="#94a3b8" />
        <line x1="149" y1="0" x2="149" y2="250" stroke="#fff" strokeWidth="2" opacity="0.5" />
        <line x1="251" y1="0" x2="251" y2="250" stroke="#fff" strokeWidth="2" opacity="0.5" />
        
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <RealCar indicator={state.indicator} reverseLights={state.reverse} scale={0.8} />
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
    const raw = Math.min(Math.max(progress, 0), 100) / 100;
    // braking decelerates: fast at first, dying to a stop (ease-out);
    // everything else uses smoothstep
    const p = step === 2 || step === 3 ? 1 - (1 - raw) * (1 - raw) : smoothstep(raw);

    return {
      x: current.x + (next.x - current.x) * p,
      y: current.y + (next.y - current.y) * p,
      speed: current.speed + (next.speed - current.speed) * p,
      brake: raw > 0.1 ? next.brake : current.brake
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
        <GrassBackground />
        
        {/* Environment */}
        <Building x={8} y={6} width={76} height={62} type="apartment" />
        <Building x={94} y={12} width={64} height={50} type="house" />
        <Building x={238} y={2} width={112} height={72} type="office" />
        <Building x={290} y={178} width={92} height={64} type="store" />
        <Tree x={180} y={38} size={34} />
        <Tree x={80} y={205} size={38} />

        <rect x="0" y="80" width="400" height="90" fill="url(#roadTexture)" />
        <line x1="0" y1="84" x2="400" y2="84" stroke="#fff" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="166" x2="400" y2="166" stroke="#fff" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="125" x2="400" y2="125" stroke="white" strokeWidth="2" strokeDasharray="12,10" opacity="0.35" />

        <g transform={`translate(${state.x}, ${state.y})`}>
          <RealCar brakeLights={state.brake} scale={0.8} />
          {step === 4 && <VisionCone side="round" opacity={0.5} />}
        </g>

        {/* Speedometer */}
        <g transform="translate(330, 200)">
          <circle r="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <path d="M -30 0 A 30 30 0 1 1 30 0" fill="none" stroke="#1e293b" strokeWidth="4" />
          <motion.line
            animate={{ rotate: (state.speed / 50) * 180 - 90 }}
            x1="0" y1="0" x2="0" y2="-25"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text textAnchor="middle" y="25" fill="#38BDF8" className="text-xl font-bold">{Math.round(state.speed)}</text>
          <text textAnchor="middle" y="38" fill="#64748b" className="text-[8px] font-bold">KM/H</text>
        </g>
      </svg>
    </div>
  );
};

const RoundaboutAnimation: React.FC<AnimationProps> = ({ step, progress, t }) => {
  // Ring lane: radius 65 around (200,125), circulated counterclockwise as
  // seen from above (German Kreisverkehr). Heading on the ring = phi - 90.
  const CX = 200, CY = 125, R = 65;
  const p = smoothstep(Math.min(Math.max(progress, 0), 100) / 100);

  const onRing = (phi: number) => ({
    x: CX + R * Math.cos((phi * Math.PI) / 180),
    y: CY + R * Math.sin((phi * Math.PI) / 180),
    h: phi - 90,
  });

  const getCarState = () => {
    let pose: Pose;
    let indicator: 'left' | 'right' | 'none' = 'none';
    switch (step) {
      case 0: // approach the yield line
        pose = { x: 212, y: 232 - 36 * p, h: -90 };
        break;
      case 1: // yield, look left
        pose = { x: 212, y: 196, h: -90 };
        break;
      case 2: { // merge onto the ring (short blend curve)
        const t2 = p;
        const P0 = { x: 212, y: 196 }, P1 = { x: 212, y: 188 }, P2 = onRing(60);
        const a = 1 - t2;
        const x = a * a * P0.x + 2 * a * t2 * P1.x + t2 * t2 * P2.x;
        const y = a * a * P0.y + 2 * a * t2 * P1.y + t2 * t2 * P2.y;
        const dx = 2 * a * (P1.x - P0.x) + 2 * t2 * (P2.x - P1.x);
        const dy = 2 * a * (P1.y - P0.y) + 2 * t2 * (P2.y - P1.y);
        pose = { x, y, h: (Math.atan2(dy, dx) * 180) / Math.PI };
        break;
      }
      case 3: // circulate: past the east and north exits
        pose = onRing(60 - 105 * p);
        break;
      case 4: // keep circling, signal right before your exit
        pose = onRing(-45 - 45 * p);
        indicator = 'right';
        break;
      case 5: { // exit west: S-curve off the ring into the westbound lane
        const start: Pose = { x: 200, y: 60, h: -180 };
        const EXIT: MotionStep = [
          { m: { kind: 'arc', steer: 'left', rev: false, R: 60, dh: 55 }, w: 0.4 },
          { m: { kind: 'arc', steer: 'right', rev: false, R: 60, dh: 55 }, w: 0.4 },
          { m: { kind: 'coast', dist: 70 }, w: 0.2 },
        ];
        pose = advanceParts(start, EXIT, p);
        indicator = p < 0.6 ? 'right' : 'none';
        break;
      }
      default:
        pose = { x: 212, y: 232, h: -90 };
    }
    return { x: pose.x, y: pose.y, rotation: pose.h, indicator };
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text={t.tracker.priorityCheck || t.maneuvers.interactive.simulator.checkSurroundings} />}
        {step === 4 && <InstructionPopup text={t.maneuvers.interactive.simulator.signalRightAndShoulder} />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <GrassBackground />
        
        {/* Environment */}
        <Building x={6} y={6} width={88} height={60} type="store" />
        <Building x={306} y={6} width={88} height={60} type="house" />
        <Building x={6} y={184} width={88} height={60} type="office" />
        <Building x={306} y={184} width={88} height={60} type="apartment" />
        <Tree x={115} y={45} size={32} />
        <Tree x={300} y={215} size={30} />

        {/* Roundabout Structure */}
        <circle cx="200" cy="125" r="95" fill="url(#roadTexture)" />
        <circle cx="200" cy="125" r="45" fill="url(#grassPattern)" stroke="#cbd5e1" strokeWidth="4" />
        
        {/* Road Entries */}
        <rect x="175" y="180" width="50" height="70" fill="url(#roadTexture)" />
        <rect x="175" y="0" width="50" height="70" fill="url(#roadTexture)" />
        <rect x="0" y="100" width="130" height="50" fill="url(#roadTexture)" />
        <rect x="270" y="100" width="130" height="50" fill="url(#roadTexture)" />
        
        {/* Center Island: tree + edge lines */}
        <Tree x={200} y={125} size={46} />
        <circle cx="200" cy="125" r="92" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
        <circle cx="200" cy="125" r="48" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4" />
        
        {/* Yield Lines */}
        <line x1="175" y1="185" x2="225" y2="185" stroke="#fff" strokeWidth="3" strokeDasharray="4,4" />

        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <RealCar indicator={state.indicator} scale={0.7} />
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
  // The car follows the exact quadratic bezier of the acceleration lane
  // (M 0 220 Q 150 210 400 120), heading derived from the curve tangent.
  const P0 = { x: 0, y: 220 }, P1 = { x: 150, y: 210 }, P2 = { x: 400, y: 120 };
  const RANGES: [number, number][] = [
    [0.05, 0.32], // 0: enter acceleration lane
    [0.32, 0.56], // 1: signal left, build speed
    [0.56, 0.78], // 2: mirror + shoulder check
    [0.78, 1.04], // 3: merge into flowing traffic
  ];
  const SPEEDS = [[40, 70], [70, 95], [95, 105], [105, 120]];
  const p = smoothstep(Math.min(Math.max(progress, 0), 100) / 100);

  const getInterpolatedState = () => {
    const [t0, t1] = RANGES[step] || RANGES[0];
    const u = t0 + (t1 - t0) * p;
    const a = 1 - u;
    const x = a * a * P0.x + 2 * a * u * P1.x + u * u * P2.x;
    const y = a * a * P0.y + 2 * a * u * P1.y + u * u * P2.y;
    const dx = 2 * a * (P1.x - P0.x) + 2 * u * (P2.x - P1.x);
    const dy = 2 * a * (P1.y - P0.y) + 2 * u * (P2.y - P1.y);
    const [s0, s1] = SPEEDS[step] || SPEEDS[0];
    return {
      x,
      y,
      rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
      speed: s0 + (s1 - s0) * p,
      indicator: (step === 1 && p > 0.3) || step === 2 ? ('left' as const) : ('none' as const),
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
        <GrassBackground />
        
        {/* Environment Details */}
        <Building x={30} y={20} width={60} height={40} type="office" />
        <Building x={100} y={10} width={50} height={30} type="house" />
        <Building x={340} y={170} width={40} height={50} type="apartment" />
        <Building x={270} y={180} width={50} height={40} type="store" />
        <Tree x={200} y={30} size={34} />
        <Tree x={180} y={215} size={30} />

        {/* Main Highway */}
        <rect x="0" y="40" width="400" height="100" fill="url(#roadTexture)" />
        <line x1="0" y1="44" x2="400" y2="44" stroke="#fff" strokeWidth="2" opacity="0.5" />
        <line x1="0" y1="90" x2="400" y2="90" stroke="#fff" strokeWidth="2" strokeDasharray="15,15" opacity="0.35" />
        
        {/* Acceleration Lane (Ramp) */}
        <path 
          d="M 0 220 Q 150 210 400 120" 
          fill="none" 
          stroke="url(#roadTexture)" 
          strokeWidth="45" 
          strokeLinecap="round"
        />
        <path 
          d="M 150 185 Q 250 170 400 120" 
          fill="none" 
          stroke="#fff" 
          strokeWidth="2" 
          strokeDasharray="8,8" 
          opacity="0.6"
        />

        {/* Highway Traffic with varied colors */}
        <g transform="translate(320, 65)"><RealCar variant="red" scale={0.8} /></g>
        <g transform="translate(100, 65)"><RealCar variant="green" scale={0.8} /></g>

        {/* User Car */}
        <g transform={`translate(${state.x}, ${state.y}) rotate(${state.rotation})`}>
          <RealCar indicator={state.indicator} scale={0.8} />
          {step === 2 && <VisionCone side="left" opacity={0.6} />}
        </g>

        {/* Speed Bar */}
        <g transform="translate(20, 20)">
          <rect width="100" height="10" rx="5" fill="#1e293b" opacity="0.2" />
          <motion.rect animate={{ width: (state.speed / 120) * 100 }} height="10" rx="5" fill="#38BDF8" />
          <text x="110" y="10" fill="#1e293b" className="text-[10px] font-bold">{Math.round(state.speed)} KM/H</text>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedManeuver;

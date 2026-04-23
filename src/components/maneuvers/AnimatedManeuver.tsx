import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationStep {
  id: number;
  description: string;
  descriptionEn: string;
  duration: number; // in ms
}

interface AnimatedManeuverProps {
  type: 'parallel-parking' | 'reverse-parking' | 'three-point-turn' | 'emergency-brake' | 'roundabout' | 'highway-merge';
  language: 'de' | 'en';
}

const GlobalDefinitions = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
    <defs>
      {/* Simple Glass Reflection */}
      <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
        <stop offset="100%" stopColor="white" stopOpacity="0.1" />
      </linearGradient>

      {/* Vision Cone Gradient */}
      <radialGradient id="visionGradient" cx="0%" cy="50%" r="100%" fx="0%" fy="50%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
      </radialGradient>

      {/* Indicator Pulse */}
      <radialGradient id="indicatorGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FACC15" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
      </radialGradient>

      {/* Shadow */}
      <filter id="flatShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dx="1" dy="1" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <style>
      {`
        @keyframes blink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 1; }
        }
        .blinker {
          animation: blink 0.5s infinite step-end;
        }
      `}
    </style>
  </svg>
);

const TopDownCar: React.FC<{
  color: string;
  indicator?: 'left' | 'right' | 'hazard' | 'none';
  brakeLights?: boolean;
  rotation?: number;
  scale?: number;
  isUser?: boolean;
}> = ({ color, indicator = 'none', brakeLights = false, rotation = 0, scale = 1, isUser = false }) => (
  <g transform={`scale(${scale}) rotate(${rotation})`} filter="url(#flatShadow)">
    {/* Body - Horizontal: Headlights face right at 0 deg */}
    <rect x="-35" y="-18" width="70" height="36" rx="8" fill={color} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
    
    {/* Windshields */}
    <rect x="0" y="-14" width="15" height="28" rx="2" fill="#1e293b" />   {/* Front Windshield */}
    <rect x="-30" y="-14" width="10" height="28" rx="2" fill="#1e293b" />  {/* Rear Window */}
    
    {/* Glass Reflection */}
    <rect x="0" y="-14" width="15" height="28" rx="2" fill="url(#glassReflection)" opacity="0.3" />

    {/* Roof */}
    <rect x="-20" y="-12" width="20" height="24" rx="4" fill="rgba(0,0,0,0.1)" />

    {/* Headlights (Pointing Right) */}
    <rect x="32" y="-15" width="4" height="8" rx="1" fill="#f8fafc" />
    <rect x="32" y="7" width="4" height="8" rx="1" fill="#f8fafc" />

    {/* Tail Lights / Brake Lights (on the Left) */}
    <rect x="-36" y="-15" width="4" height="8" rx="1" fill={brakeLights ? '#ef4444' : '#991b1b'} />
    <rect x="-36" y="7" width="4" height="8" rx="1" fill={brakeLights ? '#ef4444' : '#991b1b'} />

    {/* Indicators */}
    {(indicator === 'left' || indicator === 'hazard') && (
      <g className="blinker">
        <circle cx="30" cy="-13" r="3" fill="#FACC15" />
        <circle cx="-34" cy="-13" r="3" fill="#FACC15" />
      </g>
    )}
    {(indicator === 'right' || indicator === 'hazard') && (
      <g className="blinker">
        <circle cx="30" cy="13" r="3" fill="#FACC15" />
        <circle cx="-34" cy="13" r="3" fill="#FACC15" />
      </g>
    )}

    {/* User Indicator (Ring) */}
    {isUser && (
      <circle cx="0" cy="0" r="45" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4,4" opacity="0.4" />
    )}
  </g>
);

const VisionCone: React.FC<{
  side: 'left' | 'right' | 'round';
  opacity?: number;
}> = ({ side, opacity = 1 }) => {
  const rotation = side === 'left' ? -60 : side === 'right' ? 60 : 0;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transform={`rotate(${rotation})`}
    >
      {side === 'round' ? (
        <circle cx="0" cy="0" r="80" fill="url(#visionGradient)" opacity="0.6" />
      ) : (
        <path
          d="M 0 0 L 100 -40 A 100 100 0 0 1 100 40 Z"
          fill="url(#visionGradient)"
          opacity="0.8"
          transform={`translate(0, ${side === 'left' ? -20 : 20}) rotate(${side === 'left' ? -90 : 90})`}
        />
      )}
    </motion.g>
  );
};

const InstructionPopup: React.FC<{ text: string }> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-2xl rounded-2xl px-6 py-3 border border-slate-200 z-50 flex items-center gap-3 whitespace-nowrap"
  >
    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
    <span className="text-slate-800 font-bold text-lg">{text}</span>
  </motion.div>
);

const SteeringWheelOverlay: React.FC<{ rotation: number }> = ({ rotation }) => (
  <g transform="translate(360, 45)">
    <circle r="22" fill="#1e293b" />
    <motion.g animate={{ rotate: rotation }} transition={{ type: 'spring', damping: 15 }}>
      <circle r="20" fill="none" stroke="#64748b" strokeWidth="4" />
      <rect x="-2" y="-20" width="4" height="12" rx="1" fill="#38BDF8" />
      <rect x="-2" y="-2" width="4" height="4" rx="1" fill="#fff" />
      <line x1="-18" y1="0" x2="18" y2="0" stroke="#64748b" strokeWidth="2" />
    </motion.g>
  </g>
);


const AnimatedManeuver: React.FC<AnimatedManeuverProps> = ({ type, language }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const animations: Record<string, AnimationStep[]> = {
    'parallel-parking': [
      { id: 0, description: 'Neben dem parkenden Fahrzeug anhalten (ca. 50cm Abstand)', descriptionEn: 'Stop next to parked car (approx. 50cm gap)', duration: 2000 },
      { id: 1, description: 'Rundum-Blick durchführen, beide Seiten und den Heckraum prüfen', descriptionEn: 'Perform a 360° check, scanning both sides and the rear area', duration: 1800 },
      { id: 2, description: 'Rückwärts fahren bis Hinterachse auf Höhe des hinteren Stoßfängers', descriptionEn: 'Reverse until rear axle aligns with rear bumper', duration: 2500 },
      { id: 3, description: 'Lenkrad nach rechts einschlagen (ca. 45°)', descriptionEn: 'Turn steering wheel right (approx. 45°)', duration: 2000 },
      { id: 4, description: 'Langsam rückwärts in die Lücke fahren', descriptionEn: 'Slowly reverse into the gap', duration: 3000 },
      { id: 5, description: 'Gegenlenken wenn Fahrzeug im 45° Winkel steht', descriptionEn: 'Counter-steer when car is at 45° angle', duration: 2000 },
      { id: 6, description: 'Gerade ausrichten, max. 30cm vom Bordstein', descriptionEn: 'Straighten up, max 30cm from curb', duration: 2000 },
    ],
    'reverse-parking': [
      { id: 0, description: 'An der Parklücke vorbeifahren, Blinker rechts setzen', descriptionEn: 'Drive past parking space, signal right', duration: 2000 },
      { id: 1, description: 'Rundum-Blick durchführen und die Umgebung vollständig prüfen', descriptionEn: 'Perform a full 360° check and scan the surroundings completely', duration: 1800 },
      { id: 2, description: 'Rückwärtsgang einlegen, langsam zurücksetzen', descriptionEn: 'Engage reverse, slowly back up', duration: 2000 },
      { id: 3, description: 'Lenkrad nach rechts einschlagen', descriptionEn: 'Turn steering wheel right', duration: 2000 },
      { id: 4, description: 'In die Lücke einfahren, auf Markierungen achten', descriptionEn: 'Enter space, watch for markings', duration: 3000 },
      { id: 5, description: 'Fahrzeug gerade ausrichten', descriptionEn: 'Straighten the vehicle', duration: 2000 },
      { id: 6, description: 'Mittig in der Lücke positionieren', descriptionEn: 'Position centered in space', duration: 1500 },
    ],
    'three-point-turn': [
      { id: 0, description: 'Rechts ranfahren, Blinker links setzen', descriptionEn: 'Pull over right, signal left', duration: 1500 },
      { id: 1, description: 'Spiegel- & Schulterblick links!', descriptionEn: 'Mirror & shoulder check left!', duration: 1500 },
      { id: 2, description: 'Einschlagen und bis zum Bordstein vorfahren', descriptionEn: 'Full lock left and drive to curb', duration: 2500 },
      { id: 3, description: 'Rückwärtsgang, Blinker RECHTS, Rundum-Blick!', descriptionEn: 'Reverse gear, signal RIGHT, 360° check!', duration: 2000 },
      { id: 4, description: 'Rückwärts bis zum gegenüberliegenden Bordstein', descriptionEn: 'Reverse to opposite curb', duration: 2500 },
      { id: 5, description: 'Ersten Gang, Blinker LINKS, Schulterblick!', descriptionEn: 'First gear, signal LEFT, shoulder check!', duration: 2000 },
      { id: 6, description: 'Fahrt in Gegenrichtung fortsetzen', descriptionEn: 'Continue in opposite direction', duration: 2000 },
    ],
    'emergency-brake': [
      { id: 0, description: 'Konstante Fahrt (ca. 30 km/h)', descriptionEn: 'Constant driving (approx. 30 km/h)', duration: 2000 },
      { id: 1, description: 'Kommando "GEFAHR! STOPP!" vom Prüfer', descriptionEn: 'Instructor command: "DANGER! STOP!"', duration: 1000 },
      { id: 2, description: 'Schlagartige Vollbremsung (Kupplung + Bremse)', descriptionEn: 'Sudden full braking (clutch + brake)', duration: 1500 },
      { id: 3, description: 'Fahrzeug halten bis zum Stillstand', descriptionEn: 'Hold vehicle until full stop', duration: 1500 },
      { id: 4, description: 'Umfeld prüfen vor erneutem Anfahren', descriptionEn: 'Check surroundings before moving off', duration: 2000 },
    ],
    'roundabout': [
      { id: 0, description: 'An den Kreisverkehr heranfahren', descriptionEn: 'Approach the roundabout', duration: 2000 },
      { id: 1, description: 'Vorfahrt beachten, links prüfen!', descriptionEn: 'Yield, check left!', duration: 2000 },
      { id: 2, description: 'Einfahren (OHNE Blinken!)', descriptionEn: 'Enter (WITHOUT signaling!)', duration: 2000 },
      { id: 3, description: 'Im Kreisel fahren', descriptionEn: 'Drive in roundabout', duration: 2500 },
      { id: 4, description: 'Blinker RECHTS & Schulterblick!', descriptionEn: 'Signal RIGHT & shoulder check!', duration: 2000 },
      { id: 5, description: 'Kreisverkehr verlassen', descriptionEn: 'Exit roundabout', duration: 2000 },
    ],
    'highway-merge': [
      { id: 0, description: 'Beschleunigungsstreifen befahren', descriptionEn: 'Enter acceleration lane', duration: 2000 },
      { id: 1, description: 'Blinker LINKS, Geschwindigkeit aufbauen', descriptionEn: 'Signal LEFT, build speed', duration: 2000 },
      { id: 2, description: 'Spiegel- & Schulterblick links!', descriptionEn: 'Mirror & shoulder check left!', duration: 2000 },
      { id: 3, description: 'In den fließenden Verkehr einordnen', descriptionEn: 'Merge into flowing traffic', duration: 2500 },
    ],
  };

  const steps = animations[type] || [];

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
    switch (type) {
      case 'parallel-parking': return <ParallelParkingAnimation step={currentStep} progress={progress} />;
      case 'reverse-parking': return <ReverseParkingAnimation step={currentStep} progress={progress} />;
      case 'three-point-turn': return <ThreePointTurnAnimation step={currentStep} progress={progress} />;
      case 'emergency-brake': return <EmergencyBrakeAnimation step={currentStep} progress={progress} />;
      case 'roundabout': return <RoundaboutAnimation step={currentStep} progress={progress} />;
      case 'highway-merge': return <HighwayMergeAnimation step={currentStep} progress={progress} />;
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

// Animation Components
const ParallelParkingAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 100, y: 140, rotation: 0, wheel: 0, indicator: 'none' as const };
      case 1: return { x: 100, y: 140, rotation: 0, wheel: 0, indicator: 'hazard' as const };
      case 2: return { x: 180, y: 140, rotation: 0, wheel: 0, indicator: 'right' as const };
      case 3: return { x: 230, y: 155, rotation: 30, wheel: 45, indicator: 'right' as const };
      case 4: return { x: 280, y: 175, rotation: 25, wheel: 45, indicator: 'right' as const };
      case 5: return { x: 300, y: 190, rotation: 5, wheel: -45, indicator: 'right' as const };
      case 6: return { x: 260, y: 195, rotation: 0, wheel: 0, indicator: 'none' as const };
      default: return { x: 100, y: 140, rotation: 0, wheel: 0, indicator: 'none' as const };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text="Umfeld beobachten (360° Check)!" />}
        {step === 3 && <InstructionPopup text="Schulterblick & Einschlagen!" />}
        {step === 5 && <InstructionPopup text="Gegenlenken!" />}
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
        <g transform="translate(100, 180)"><TopDownCar color="#94a3b8" /></g>
        <g transform="translate(340, 180)"><TopDownCar color="#94a3b8" /></g>

        {/* Path Arrow */}
        {step >= 2 && step <= 4 && (
          <path d="M 180 140 Q 250 140 300 195" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="8,8" opacity="0.4" />
        )}

        {/* User Car */}
        <motion.g animate={{ x: state.x, y: state.y, rotate: state.rotation }} transition={{ type: 'spring', damping: 20 }}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} />
          <AnimatePresence>
            {step === 1 && (
              <g transform="translate(0, -10)">
                <VisionCone side="round" opacity={0.4} />
              </g>
            )}
            {step === 3 && <VisionCone side="left" opacity={0.6} />}
          </AnimatePresence>
        </motion.g>
        <SteeringWheelOverlay rotation={state.wheel} />
      </svg>
    </div>
  );
};

const ReverseParkingAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 100, y: 180, rotation: 0, wheel: 0, indicator: 'none' as const };
      case 1: return { x: 205, y: 180, rotation: 0, wheel: 0, indicator: 'hazard' as const };
      case 2: return { x: 270, y: 180, rotation: 0, wheel: 0, indicator: 'right' as const };
      case 3: return { x: 240, y: 140, rotation: -45, wheel: 60, indicator: 'right' as const };
      case 4: return { x: 210, y: 80, rotation: -90, wheel: 60, indicator: 'right' as const };
      case 5: return { x: 210, y: 50, rotation: -90, wheel: 0, indicator: 'none' as const };
      case 6: return { x: 210, y: 40, rotation: -90, wheel: 0, indicator: 'none' as const };
      default: return { x: 100, y: 180, rotation: 0, wheel: 0, indicator: 'none' as const };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text="Rundum-Blick durchführen!" />}
        {step === 3 && <InstructionPopup text="Schulterblick RECHTS!" />}
      </AnimatePresence>
      
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="120" width="400" height="130" fill="#334155" />
        
        {/* Parking Slots */}
        {[100, 150, 210, 270, 330].map(x => (
          <g key={x}>
            <line x1={x} y1={140} x2={x} y2={250} stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,4" />
          </g>
        ))}
        
        {/* Stationary Cars */}
        <g transform="translate(155, 40) rotate(-90)"><TopDownCar color="#94a3b8" /></g>
        <g transform="translate(265, 40) rotate(-90)"><TopDownCar color="#94a3b8" /></g>

        {/* User Car */}
        <motion.g animate={{ x: state.x, y: state.y, rotate: state.rotation }} transition={{ type: 'spring', damping: 25 }}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} />
          <AnimatePresence>
            {step === 1 && <VisionCone side="round" opacity={0.4} />}
            {step === 3 && <VisionCone side="right" opacity={0.6} />}
          </AnimatePresence>
        </motion.g>
        <SteeringWheelOverlay rotation={state.wheel} />
      </svg>
    </div>
  );
};

const ThreePointTurnAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 50, y: 155, rotation: 0, wheel: 0, indicator: 'left' as const };
      case 1: return { x: 80, y: 155, rotation: 0, wheel: -90, indicator: 'left' as const };
      case 2: return { x: 150, y: 80, rotation: -80, wheel: -90, indicator: 'left' as const };
      case 3: return { x: 150, y: 80, rotation: -80, wheel: 90, indicator: 'right' as const };
      case 4: return { x: 180, y: 170, rotation: 60, wheel: 90, indicator: 'right' as const };
      case 5: return { x: 180, y: 170, rotation: 180, wheel: -90, indicator: 'left' as const };
      case 6: return { x: 50, y: 105, rotation: 180, wheel: 0, indicator: 'none' as const };
      default: return { x: 50, y: 155, rotation: 0, wheel: 0, indicator: 'none' as const };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text="Schulterblick LINKS!" />}
        {step === 3 && <InstructionPopup text="Rundum-Blick & RECHTS blinken!" />}
        {step === 5 && <InstructionPopup text="Schulterblick vor Abfahrt!" />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="70" width="400" height="110" fill="#334155" />
        <rect x="0" y="70" width="400" height="2" fill="#94a3b8" />
        <rect x="0" y="178" width="400" height="2" fill="#94a3b8" />
        
        <motion.g animate={{ x: state.x, y: state.y, rotate: state.rotation }} transition={{ type: 'spring', damping: 25 }}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} scale={0.8} />
          <AnimatePresence>
            {step === 1 && <VisionCone side="left" opacity={0.6} />}
            {step === 3 && <VisionCone side="round" opacity={0.4} />}
            {step === 5 && <VisionCone side="left" opacity={0.6} />}
          </AnimatePresence>
        </motion.g>
        <SteeringWheelOverlay rotation={state.wheel} />
      </svg>
    </div>
  );
};

const EmergencyBrakeAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 50, y: 145, rotation: 0, speed: 30, brake: false };
      case 1: return { x: 120, y: 145, rotation: 0, speed: 30, brake: false };
      case 2: return { x: 160, y: 145, rotation: 0, speed: 10, brake: true };
      case 3: return { x: 175, y: 145, rotation: 0, speed: 0, brake: true };
      case 4: return { x: 175, y: 145, rotation: 0, speed: 0, brake: false };
      default: return { x: 50, y: 145, rotation: 0, speed: 30, brake: false };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text="🚨 GEFAHR! VOLLBREMSUNG! 🚨" />}
        {step === 4 && <InstructionPopup text="Umfeld prüfen!" />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="80" width="400" height="90" fill="#334155" />
        <line x1="0" y1="125" x2="400" y2="125" stroke="white" strokeWidth="1" strokeDasharray="10,10" opacity="0.2" />

        <motion.g animate={{ x: state.x, y: state.y }} transition={{ type: 'spring', stiffness: 100, damping: 20 }}>
          <TopDownCar color="#3b82f6" isUser={true} brakeLights={state.brake} scale={0.8} />
          {step === 4 && <VisionCone side="round" opacity={0.5} />}
        </motion.g>

        {/* Speedometer */}
        <g transform="translate(330, 190)">
          <circle r="40" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <motion.path
            d="M -30 0 A 30 30 0 1 1 30 0"
            fill="none"
            stroke="#1e293b"
            strokeWidth="4"
          />
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

const RoundaboutAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarState = () => {
    const cx = 200;
    const cy = 125;
    const r = 65;
    switch (step) {
      case 0: return { x: 212, y: 220, rotation: -90, indicator: 'none' as const };
      case 1: return { x: 212, y: 195, rotation: -90, indicator: 'none' as const };
      case 2: { // Enter
        const angleEnter = 90 - 45 * progress;
        return { 
          x: cx + r * Math.cos(angleEnter * Math.PI / 180),
          y: cy + r * Math.sin(angleEnter * Math.PI / 180),
          rotation: angleEnter - 90,
          indicator: 'none' as const
        };
      }
      case 3: { // Circulate (Counter-clockwise movement around from bottom towards top)
        const angleCirc = 45 - 225 * progress;
        return {
          x: cx + r * Math.cos(angleCirc * Math.PI / 180),
          y: cy + r * Math.sin(angleCirc * Math.PI / 180),
          rotation: angleCirc - 90,
          indicator: 'none' as const
        };
      }
      case 4: return { x: 265, y: 112, rotation: 0, indicator: 'right' as const };
      case 5: return { x: 265 + 100 * progress, y: 112, rotation: 0, indicator: 'right' as const };
      default: return { x: 212, y: 220, rotation: -90, indicator: 'none' as const };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text="Links prüfen (Vorfahrt gewähren)!" />}
        {step === 4 && <InstructionPopup text="Blinker RECHTS & Schulterblick!" />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <circle cx="200" cy="125" r="90" fill="#334155" />
        <circle cx="200" cy="125" r="40" fill="#ecfdf5" />
        <rect x="175" y="180" width="50" height="70" fill="#334155" />
        <rect x="270" y="100" width="130" height="50" fill="#334155" />
        
        {/* Yield Line */}
        <line x1="175" y1="185" x2="225" y2="185" stroke="#fff" strokeWidth="3" strokeDasharray="4,4" />

        <motion.g animate={{ x: state.x, y: state.y, rotate: state.rotation }} transition={{ type: 'spring', damping: 25 }}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} scale={0.7} />
          <AnimatePresence>
            {step === 1 && <VisionCone side="left" opacity={0.6} />}
            {step === 4 && <VisionCone side="right" opacity={0.6} />}
          </AnimatePresence>
        </motion.g>
      </svg>
    </div>
  );
};

const HighwayMergeAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 50, y: 180, rotation: -5, speed: 40, indicator: 'none' as const };
      case 1: return { x: 120, y: 175, rotation: -10, speed: 70, indicator: 'left' as const };
      case 2: return { x: 250, y: 135, rotation: -15, speed: 95, indicator: 'left' as const };
      case 3: return { x: 380, y: 115, rotation: 0, speed: 100, indicator: 'none' as const };
      default: return { x: 50, y: 180, rotation: -5, speed: 40, indicator: 'none' as const };
    }
  };
  const state = getCarState();
  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden">
      <AnimatePresence>
        {step === 1 && <InstructionPopup text="Blinker LINKS & Gas geben!" />}
        {step === 2 && <InstructionPopup text="Spiegel- & Schulterblick!" />}
      </AnimatePresence>
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="0" y="0" width="400" height="250" fill="#ecfdf5" />
        <rect x="0" y="40" width="400" height="100" fill="#334155" />
        <line x1="0" y1="90" x2="400" y2="90" stroke="#fff" strokeWidth="2" strokeDasharray="15,15" opacity="0.3" />
        <path d="M 0 210 Q 150 200 400 150" fill="#334155" />
        <line x1="150" y1="180" x2="400" y2="140" stroke="#fff" strokeWidth="3" strokeDasharray="8,8" opacity="0.5" />

        <g transform="translate(300, 65)"><TopDownCar color="#94a3b8" scale={0.8} /></g>

        <motion.g animate={{ x: state.x, y: state.y, rotate: state.rotation }} transition={{ type: 'spring', damping: 25 }}>
          <TopDownCar color="#3b82f6" indicator={state.indicator} isUser={true} scale={0.8} />
          {step === 2 && <VisionCone side="left" opacity={0.6} />}
        </motion.g>

        {/* Speed Bar */}
        <g transform="translate(20, 200)">
          <rect width="100" height="10" rx="5" fill="#1e293b" />
          <motion.rect animate={{ width: (state.speed / 120) * 100 }} height="10" rx="5" fill="#38BDF8" />
          <text x="110" y="10" fill="#1e293b" className="text-[10px] font-black">{state.speed} KM/H</text>
        </g>
      </svg>
    </div>
  );
};

export default AnimatedManeuver;

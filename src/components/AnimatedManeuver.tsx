import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

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

const HorizontalCarIllustration: React.FC<{
  color: string;
  scale?: number;
  opacity?: number;
}> = ({ color, scale = 1, opacity = 1 }) => (
  <g transform={`scale(${scale})`} opacity={opacity}>
    <defs>
      <linearGradient id="carBodyH" x1="0" y1="-1" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
        <stop offset="35%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#111827" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id="glassH" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E2F2FF" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
    </defs>
    <ellipse cx="1" cy="3" rx="35" ry="16" fill="#020617" opacity="0.18" />
    <path
      d="M -34 -6 C -31 -12 -24 -16 -12 -18 L 14 -18 C 23 -17 30 -13 34 -7 L 38 -1 L 38 7 C 35 13 28 17 16 18 L -12 18 C -24 17 -31 13 -35 7 L -38 1 L -38 -1 Z"
      fill="url(#carBodyH)"
      stroke="#0F172A"
      strokeWidth="1.6"
    />
    <path
      d="M -18 -11 C -13 -15 -7 -16 0 -16 C 8 -16 15 -15 19 -11 L 24 -4 L 24 4 L 19 11 C 15 15 8 16 0 16 C -7 16 -13 15 -18 11 L -24 4 L -24 -4 Z"
      fill="url(#glassH)"
      stroke="#64748B"
      strokeWidth="1"
      opacity="0.96"
    />
    <path d="M -4 -15 L -4 15" stroke="#64748B" strokeWidth="1" />
    <path d="M -22 0 L 22 0" stroke="#64748B" strokeWidth="1" opacity="0.55" />
    <path d="M -30 -9 C -25 -12 -20 -13 -12 -13" stroke="#FFFFFF" strokeOpacity="0.24" strokeWidth="2" fill="none" />
    <rect x="-27" y="-19" width="11" height="5" rx="2.5" fill="#111827" />
    <rect x="14" y="-19" width="11" height="5" rx="2.5" fill="#111827" />
    <rect x="-27" y="14" width="11" height="5" rx="2.5" fill="#111827" />
    <rect x="14" y="14" width="11" height="5" rx="2.5" fill="#111827" />
    <circle cx="-35" cy="-6" r="2.4" fill="#DC2626" />
    <circle cx="-35" cy="6" r="2.4" fill="#DC2626" />
    <circle cx="35" cy="-6" r="2.4" fill="#F8FAFC" />
    <circle cx="35" cy="6" r="2.4" fill="#F8FAFC" />
    <circle cx="-16" cy="0" r="1.8" fill="#111827" opacity="0.25" />
    <circle cx="16" cy="0" r="1.8" fill="#111827" opacity="0.25" />
  </g>
);

const VerticalCarIllustration: React.FC<{
  color: string;
  scale?: number;
  opacity?: number;
}> = ({ color, scale = 1, opacity = 1 }) => (
  <g transform={`scale(${scale})`} opacity={opacity}>
    <defs>
      <linearGradient id="carBodyV" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
        <stop offset="38%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#0F172A" stopOpacity="0.32" />
      </linearGradient>
      <linearGradient id="glassV" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#E2F2FF" />
        <stop offset="100%" stopColor="#94A3B8" />
      </linearGradient>
    </defs>
    <ellipse cx="1" cy="4" rx="16" ry="35" fill="#020617" opacity="0.18" />
    <path
      d="M -9 -31 C -14 -28 -17 -21 -17 -10 L -17 10 C -17 21 -14 28 -9 31 L -3 34 L 3 34 L 9 31 C 14 28 17 21 17 10 L 17 -10 C 17 -21 14 -28 9 -31 L 3 -34 L -3 -34 Z"
      fill="url(#carBodyV)"
      stroke="#0F172A"
      strokeWidth="1.6"
    />
    <path
      d="M -12 -16 C -14 -12 -15 -7 -15 0 C -15 7 -14 12 -12 16 L -5 22 L 5 22 L 12 16 C 14 12 15 7 15 0 C 15 -7 14 -12 12 -16 L 5 -22 L -5 -22 Z"
      fill="url(#glassV)"
      stroke="#64748B"
      strokeWidth="1"
      opacity="0.96"
    />
    <path d="M -13 0 L 13 0" stroke="#64748B" strokeWidth="1" />
    <path d="M 0 -21 L 0 21" stroke="#64748B" strokeWidth="1" opacity="0.55" />
    <path d="M -7 -27 C -10 -24 -11 -19 -11 -13" stroke="#FFFFFF" strokeOpacity="0.24" strokeWidth="2" fill="none" />
    <rect x="-19" y="-25" width="5" height="11" rx="2.5" fill="#111827" />
    <rect x="14" y="-25" width="5" height="11" rx="2.5" fill="#111827" />
    <rect x="-19" y="14" width="5" height="11" rx="2.5" fill="#111827" />
    <rect x="14" y="14" width="5" height="11" rx="2.5" fill="#111827" />
    <circle cx="-6" cy="-31" r="2.4" fill="#F8FAFC" />
    <circle cx="6" cy="-31" r="2.4" fill="#F8FAFC" />
    <circle cx="-6" cy="31" r="2.4" fill="#DC2626" />
    <circle cx="6" cy="31" r="2.4" fill="#DC2626" />
  </g>
);

const VisionCone: React.FC<{
  angle: number;
  sweep: number;
  opacity?: number;
}> = ({ angle, sweep, opacity = 0.2 }) => (
  <motion.path
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    d={`M 0 0 L ${100 * Math.cos((angle - sweep/2) * Math.PI / 180)} ${100 * Math.sin((angle - sweep/2) * Math.PI / 180)} A 100 100 0 0 1 ${100 * Math.cos((angle + sweep/2) * Math.PI / 180)} ${100 * Math.sin((angle + sweep/2) * Math.PI / 180)} Z`}
    fill="url(#visionGradient)"
  />
);

const SteeringWheelOverlay: React.FC<{ rotation: number }> = ({ rotation }) => (
  <g transform="translate(360, 40)">
    <circle r="18" fill="#1e293b" stroke="#475569" strokeWidth="2" />
    <motion.g animate={{ rotate: rotation }} transition={{ type: "spring", stiffness: 60 }}>
      <circle r="14" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <rect x="-2" y="-14" width="4" height="28" fill="#94a3b8" rx="1" />
      <rect x="-14" y="-2" width="28" height="4" fill="#94a3b8" rx="1" />
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
      { id: 0, description: 'Rechts ranfahren, Blinker links setzen', descriptionEn: 'Pull over right, signal left', duration: 2000 },
      { id: 1, description: 'Schulterblick links, auf Verkehr achten', descriptionEn: 'Left shoulder check, watch traffic', duration: 1500 },
      { id: 2, description: 'Anfahren, Lenkrad ganz nach links einschlagen', descriptionEn: 'Start moving, full left steering lock', duration: 2000 },
      { id: 3, description: 'Bis kurz vor den Bordstein fahren', descriptionEn: 'Drive to just before the curb', duration: 2500 },
      { id: 4, description: 'Anhalten, Rückwärtsgang einlegen', descriptionEn: 'Stop, engage reverse', duration: 1500 },
      { id: 5, description: 'Schulterblick, Lenkrad ganz nach rechts', descriptionEn: 'Shoulder check, full right steering lock', duration: 2000 },
      { id: 6, description: 'Rückwärts bis kurz vor Bordstein', descriptionEn: 'Reverse to just before curb', duration: 2500 },
      { id: 7, description: 'Vorwärtsgang, geradeaus weiterfahren', descriptionEn: 'First gear, continue straight', duration: 2000 },
    ],
    'emergency-brake': [
      { id: 0, description: 'Fahren mit ca. 30 km/h', descriptionEn: 'Driving at approx. 30 km/h', duration: 2000 },
      { id: 1, description: 'Signal vom Fahrlehrer kommt', descriptionEn: 'Instructor gives signal', duration: 1000 },
      { id: 2, description: 'Sofort Kupplung + Bremse gleichzeitig voll treten – kein Schulterblick nach hinten', descriptionEn: 'Immediately press clutch + brake together with full force – no rear shoulder check', duration: 1800 },
      { id: 3, description: 'Lenkrad festhalten, ABS arbeitet (Pulsieren normal)', descriptionEn: 'Hold steering wheel, ABS working (pulsing normal)', duration: 2000 },
      { id: 4, description: 'Fahrzeug stabil halten, bis es vollständig steht', descriptionEn: 'Keep the vehicle stable until it has fully stopped', duration: 1800 },
      { id: 5, description: 'Nach dem Stillstand vor erneutem Anfahren Spiegel + Schulterblick', descriptionEn: 'After stopping, check mirrors + shoulder check before moving off again', duration: 2200 },
    ],
    'roundabout': [
      { id: 0, description: 'Kreisverkehr erkennen (Schild 215), Geschwindigkeit reduzieren', descriptionEn: 'Recognize roundabout (sign 215), reduce speed', duration: 2000 },
      { id: 1, description: 'KEIN Blinken beim Einfahren!', descriptionEn: 'NO signaling when entering!', duration: 2000 },
      { id: 2, description: 'Vorfahrt beachten - Fahrzeuge IM Kreisel haben Vorfahrt', descriptionEn: 'Yield - vehicles IN roundabout have right of way', duration: 2500 },
      { id: 3, description: 'Bei freier Fahrt in den Kreisel einfahren', descriptionEn: 'Enter roundabout when clear', duration: 2000 },
      { id: 4, description: 'Im Kreisel fahren (gegen den Uhrzeigersinn)', descriptionEn: 'Drive in roundabout (counter-clockwise)', duration: 2500 },
      { id: 5, description: 'VOR der Ausfahrt: Blinker RECHTS setzen!', descriptionEn: 'BEFORE exit: Signal RIGHT!', duration: 2000 },
      { id: 6, description: 'Schulterblick, Kreisel verlassen', descriptionEn: 'Shoulder check, exit roundabout', duration: 2000 },
    ],
    'highway-merge': [
      { id: 0, description: 'Auf Beschleunigungsstreifen fahren', descriptionEn: 'Enter acceleration lane', duration: 2000 },
      { id: 1, description: 'Blinker links setzen', descriptionEn: 'Signal left', duration: 1500 },
      { id: 2, description: 'Beschleunigen auf Autobahngeschwindigkeit (mind. 80 km/h)', descriptionEn: 'Accelerate to highway speed (min. 80 km/h)', duration: 3000 },
      { id: 3, description: 'Verkehr beobachten über Spiegel', descriptionEn: 'Monitor traffic via mirrors', duration: 2000 },
      { id: 4, description: 'Schulterblick links durchführen', descriptionEn: 'Left shoulder check', duration: 1500 },
      { id: 5, description: 'Passende Lücke finden und einfädeln', descriptionEn: 'Find suitable gap and merge', duration: 2500 },
      { id: 6, description: 'Blinker aus, auf rechter Spur bleiben', descriptionEn: 'Cancel signal, stay in right lane', duration: 2000 },
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

  // SVG Animation Components
  const renderAnimation = () => {
    switch (type) {
      case 'parallel-parking':
        return <ParallelParkingAnimation step={currentStep} progress={progress} />;
      case 'reverse-parking':
        return <ReverseParkingAnimation step={currentStep} progress={progress} />;
      case 'three-point-turn':
        return <ThreePointTurnAnimation step={currentStep} progress={progress} />;
      case 'emergency-brake':
        return <EmergencyBrakeAnimation step={currentStep} progress={progress} />;
      case 'roundabout':
        return <RoundaboutAnimation step={currentStep} progress={progress} />;
      case 'highway-merge':
        return <HighwayMergeAnimation step={currentStep} progress={progress} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* Animation Display */}
      <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-black p-4">
        <div className="aspect-video rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] bg-[#0f172a] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)] pointer-events-none" />
          {renderAnimation()}
        </div>
        
        {/* Step indicator */}
        <div className="absolute top-6 right-6 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
          {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Step Description */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="text-white text-center font-medium text-lg min-h-[3rem] transition-all duration-300"
        >
          {language === 'de' ? steps[currentStep]?.description : steps[currentStep]?.descriptionEn}
        </div>
        
        {/* Progress bar */}
        <div 
          className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={language === 'de' ? 'Fortschritt des aktuellen Schritts' : 'Current step progress'}
        >
          <div 
            className="h-full bg-blue-500 transition-all duration-50 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-900 border-t border-gray-800">
        <button
          onClick={handleReset}
          aria-label={language === 'de' ? 'Animation zurücksetzen' : 'Reset animation'}
          className="p-3 rounded-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600 transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          aria-label={language === 'de' ? 'Vorheriger Schritt' : 'Previous step'}
          className="p-3 rounded-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying 
            ? (language === 'de' ? 'Animation pausieren' : 'Pause animation') 
            : (language === 'de' ? 'Animation abspielen' : 'Play animation')}
          aria-pressed={isPlaying}
          className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1}
          aria-label={language === 'de' ? 'Nächster Schritt' : 'Next step'}
          className="p-3 rounded-full bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 hover:border-gray-600 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Step thumbnails */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-gray-900">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => {
              setCurrentStep(index);
              setProgress(0);
              setIsPlaying(false);
            }}
            aria-label={language === 'de' ? `Gehe zu Schritt ${index + 1}` : `Go to step ${index + 1}`}
            aria-current={index === currentStep ? 'step' : undefined}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              index === currentStep
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110'
                : index < currentStep
                ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// Animated SVG Components
const ParallelParkingAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 280, y: 70, rotation: 0, wheel: 0 };
      case 1: return { x: 280, y: 70, rotation: 0, wheel: 0 };
      case 2: return { x: 280, y: 90, rotation: 0, wheel: 0 };
      case 3: return { x: 280, y: 110, rotation: 0, wheel: 45 };
      case 4: return { x: 250, y: 145, rotation: 35, wheel: 45 };
      case 5: return { x: 225, y: 175, rotation: 20, wheel: -45 };
      case 6: return { x: 220, y: 180, rotation: 0, wheel: 0 };
      default: return { x: 280, y: 70, rotation: 0, wheel: 0 };
    }
  };

  const state = getCarState();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <linearGradient id="streetSurface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B4453" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
        <linearGradient id="sidewalkSurface" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="100%" stopColor="#6B7280" />
        </linearGradient>
        <radialGradient id="visionGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Road */}
      <rect x="0" y="0" width="400" height="250" fill="url(#streetSurface)" />
      
      {/* Curb + sidewalk */}
      <rect x="140" y="140" width="260" height="110" fill="url(#sidewalkSurface)" />
      <rect x="140" y="140" width="260" height="10" fill="#D1D5DB" />
      
      {/* Parked cars */}
      <g>
        <g transform="translate(300, 185)">
          <HorizontalCarIllustration color="#2563EB" scale={0.9} />
        </g>
        <g transform="translate(180, 185)">
          <HorizontalCarIllustration color="#7C3AED" scale={0.9} />
        </g>
      </g>
      
      {/* Your car - Pivoting from rear axle (approx -20px from center) */}
      <motion.g
        animate={{ 
          x: state.x, 
          y: state.y, 
          rotate: state.rotation 
        }}
        transition={{ type: "spring", damping: 20, stiffness: 45 }}
        style={{ transformOrigin: "20px 0px" }}
      >
        <HorizontalCarIllustration color="#EF4444" scale={0.82} />
        
        {/* Dynamic Vision Cones */}
        <AnimatePresence>
          {step === 1 && (
            <g transform="translate(30, 0)">
              {/* Checking mirrors and shoulder */}
              <g transform="rotate(-40)"><VisionCone angle={0} sweep={60} /></g>
              <g transform="rotate(40)"><VisionCone angle={0} sweep={60} /></g>
              <g transform="rotate(180)"><VisionCone angle={0} sweep={90} opacity={0.3} /></g>
            </g>
          )}
        </AnimatePresence>
      </motion.g>

      {/* Steering Wheel HUD Overlay */}
      <SteeringWheelOverlay rotation={state.wheel} />
      
      {/* Distance indicators */}
      <AnimatePresence>
        {step === 0 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <line x1="255" y1="58" x2="255" y2="155" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
            <text x="245" y="115" fill="#22C55E" fontSize="10" fontWeight="bold">50cm</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
};

const ReverseParkingAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 200, y: 40, rotation: 0, wheel: 0 };
      case 1: return { x: 200, y: 50, rotation: 0, wheel: 0 };
      case 2: return { x: 200, y: 70, rotation: 0, wheel: 0 };
      case 3: return { x: 200, y: 90, rotation: 0, wheel: 60 };
      case 4: return { x: 210, y: 150, rotation: 70, wheel: 60 };
      case 5: return { x: 210, y: 190, rotation: 20, wheel: -60 };
      case 6: return { x: 210, y: 200, rotation: 0, wheel: 0 };
      default: return { x: 200, y: 40, rotation: 0, wheel: 0 };
    }
  };

  const state = getCarState();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <linearGradient id="lotSurface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
        <radialGradient id="visionGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Parking lot */}
      <rect x="0" y="0" width="400" height="250" fill="url(#lotSurface)" />
      
      {/* Parking lines */}
      {[120, 180, 240, 300].map(x => (
        <line key={x} x1={x} y1={120} x2={x} y2={250} stroke="#F8FAFC" strokeWidth="3" opacity="0.3" />
      ))}
      
      {/* Target space highlight */}
      <rect x="182" y="125" width="56" height="120" fill="#22C55E" opacity="0.1" />
      
      {/* Other parked cars */}
      <g transform="translate(150, 195)"><VerticalCarIllustration color="#6366F1" scale={0.95} /></g>
      <g transform="translate(270, 195)"><VerticalCarIllustration color="#8B5CF6" scale={0.95} /></g>
      
      {/* Your car */}
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transition={{ type: "spring", damping: 22, stiffness: 40 }}
      >
        <VerticalCarIllustration color="#EF4444" scale={0.9} />
        
        {/* Turn signal */}
        {step >= 0 && step <= 2 && (
          <motion.circle 
            cx="18" cy="-28" r="4" fill="#FDE047"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        
        {/* Vision Cones */}
        <AnimatePresence>
          {step === 1 && (
            <g transform="translate(0, -30)">
              <g transform="rotate(-90)"><VisionCone angle={0} sweep={160} /></g>
              <g transform="rotate(90)"><VisionCone angle={0} sweep={160} /></g>
              <g transform="rotate(0)"><VisionCone angle={0} sweep={120} opacity={0.3} /></g>
            </g>
          )}
        </AnimatePresence>
      </motion.g>

      <SteeringWheelOverlay rotation={state.wheel} />
    </svg>
  );
};

const ThreePointTurnAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 320, y: 175, rotation: 0, wheel: 0 };
      case 1: return { x: 320, y: 175, rotation: 0, wheel: 0 };
      case 2: return { x: 200, y: 140, rotation: -30, wheel: -90 };
      case 3: return { x: 130, y: 125, rotation: -50, wheel: -90 };
      case 4: return { x: 130, y: 125, rotation: -50, wheel: 0 };
      case 5: return { x: 155, y: 150, rotation: -20, wheel: 90 };
      case 6: return { x: 180, y: 175, rotation: 0, wheel: 90 };
      case 7: return { x: 180, y: 175, rotation: 180, wheel: 0 };
      default: return { x: 320, y: 175, rotation: 0, wheel: 0 };
    }
  };

  const state = getCarState();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <radialGradient id="visionGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Road */}
      <rect x="0" y="100" width="400" height="100" fill="#334155" />
      <line x1="0" y1="150" x2="400" y2="150" stroke="#FDE047" strokeWidth="2" strokeDasharray="20,10" opacity="0.5" />
      
      {/* Curbs */}
      <rect x="0" y="90" width="400" height="10" fill="#475569" />
      <rect x="0" y="200" width="400" height="10" fill="#475569" />
      
      {/* Your car */}
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transition={{ type: "spring", damping: 20, stiffness: 35 }}
        style={{ transformOrigin: step === 5 || step === 6 ? "-20px 0px" : "20px 0px" }}
      >
        <HorizontalCarIllustration color="#EF4444" scale={0.82} />
        
        {/* Turn signals */}
        {(step === 0 || step === 2) && (
          <motion.circle 
            cx="-30" cy="0" r="3" fill="#FDE047"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        
        {/* Vision Cones */}
        <AnimatePresence>
          {(step === 1 || step === 5) && (
            <g transform="translate(0, 0)">
              <VisionCone angle={state.rotation - 90} sweep={120} />
              <VisionCone angle={state.rotation + 90} sweep={120} />
            </g>
          )}
        </AnimatePresence>
      </motion.g>

      <SteeringWheelOverlay rotation={state.wheel} />
    </svg>
  );
};

const EmergencyBrakeAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 320, speed: 30, pedal: 0 };
      case 1: return { x: 260, speed: 30, pedal: 0 };
      case 2: return { x: 200, speed: 20, pedal: 100 };
      case 3: return { x: 150, speed: 10, pedal: 100 };
      case 4: return { x: 120, speed: 5, pedal: 100 };
      case 5: return { x: 120, speed: 0, pedal: 0 };
      default: return { x: 320, speed: 30, pedal: 0 };
    }
  };

  const state = getCarState();
  const isBraking = step >= 2;

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <linearGradient id="visionGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Road with moving stripes logic handled by framer-motion indirectly via step change */}
      <rect x="0" y="0" width="400" height="250" fill="#1e293b" />
      <rect x="0" y="100" width="400" height="100" fill="#334155" />
      
      <motion.line 
        x1="0" y1="150" x2="400" y2="150" 
        stroke="#FDE047" strokeWidth="2" strokeDasharray="20,10"
        animate={{ strokeDashoffset: step < 2 ? [0, -60] : 0 }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Speedometer HUD */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="80" height="40" rx="8" fill="#0f172a" stroke="#1e293b" />
        <motion.text 
          x="40" y="28" textAnchor="middle" 
          animate={{ fill: isBraking ? "#ef4444" : "#22c55e" }}
          className="text-lg font-bold"
        >
          {state.speed} km/h
        </motion.text>
      </g>
      
      {/* Your car */}
      <motion.g
        animate={{ x: state.x, y: 150 }}
        transition={{ 
          type: "spring", 
          damping: isBraking ? 15 : 25, 
          stiffness: isBraking ? 30 : 50 
        }}
      >
        <HorizontalCarIllustration color="#EF4444" scale={0.95} />
        
        {/* Brake lights */}
        {isBraking && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <rect x="-33" y="-9" width="6" height="8" rx="2" fill="#ef4444" className="filter blur-[1px]" />
            <rect x="-33" y="1" width="6" height="8" rx="2" fill="#ef4444" className="filter blur-[1px]" />
          </motion.g>
        )}
      </motion.g>
      
      {/* Pedal HUD */}
      <AnimatePresence>
        {isBraking && (
          <motion.g 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            transform="translate(300, 20)"
          >
            <rect x="0" y="0" width="90" height="50" rx="8" fill="#0f172a" />
            <motion.rect 
              x="10" y="10" width="30" height="30" rx="4" fill="#ef4444"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <motion.rect 
              x="50" y="10" width="30" height="30" rx="4" fill="#3b82f6"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Warning Signal */}
      <AnimatePresence>
        {step === 1 && (
          <motion.g 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 1.5, opacity: 0 }}
            transform="translate(200, 70)"
          >
            <circle r="25" fill="#f59e0b" opacity="0.4" />
            <text textAnchor="middle" y="8" fontSize="24">⚠️</text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
};

const RoundaboutAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 200, y: 220, rotation: -90, wheel: 0 };
      case 1: return { x: 200, y: 210, rotation: -90, wheel: 0 };
      case 2: return { x: 200, y: 195, rotation: -90, wheel: 0 };
      case 3: return { x: 235, y: 175, rotation: -45, wheel: 30 };
      case 4: return { x: 255, y: 110, rotation: -135, wheel: -30 };
      case 5: return { x: 235, y: 80, rotation: -180, wheel: 0 };
      case 6: return { x: 280, y: 125, rotation: 180, wheel: 30 };
      default: return { x: 200, y: 220, rotation: -90, wheel: 0 };
    }
  };

  const state = getCarState();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <radialGradient id="roundGrass" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </radialGradient>
        <radialGradient id="visionGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Background */}
      <rect x="0" y="0" width="400" height="250" fill="#0f172a" />
      
      {/* Roundabout circle */}
      <circle cx="200" cy="125" r="82" fill="#334155" stroke="#475569" strokeWidth="2" />
      <circle cx="200" cy="125" r="37" fill="url(#roundGrass)" />
      
      {/* Entry/Exit roads */}
      <rect x="180" y="180" width="40" height="70" fill="#334155" />
      <rect x="280" y="105" width="120" height="40" fill="#334155" />
      
      {/* Your car */}
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transition={{ type: "spring", damping: 25, stiffness: 40 }}
      >
        <HorizontalCarIllustration color="#EF4444" scale={0.5} />
        
        {/* Vision Cones */}
        <AnimatePresence>
          {(step === 2 || step === 6) && (
            <g transform="rotate(45)"><VisionCone angle={-180} sweep={120} /></g>
          )}
        </AnimatePresence>

        {/* Turn signal RIGHT when exiting */}
        {step >= 5 && (
          <motion.circle 
            cx="16" cy="7" r="3" fill="#FDE047"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
      </motion.g>

      {/* Warning: No signal when entering */}
      {step === 1 && (
        <g transform="translate(240, 180)">
          <rect x="0" y="0" width="120" height="40" rx="8" fill="#EF4444" />
          <text x="60" y="18" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">⚠️ KEIN Blinken</text>
          <text x="60" y="32" textAnchor="middle" fill="#FFF" fontSize="10">beim Einfahren!</text>
        </g>
      )}

      {/* Signal right when exiting */}
      {step === 5 && (
        <g transform="translate(280, 60)">
          <rect x="0" y="0" width="110" height="40" rx="8" fill="#22C55E" />
          <text x="55" y="18" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">✓ Blinker RECHTS</text>
          <text x="55" y="32" textAnchor="middle" fill="#FFF" fontSize="10">vor Ausfahrt!</text>
        </g>
      )}

      <SteeringWheelOverlay rotation={state.wheel} />
    </svg>
  );
};

const HighwayMergeAnimation: React.FC<{ step: number; progress: number }> = ({ step }) => {
  const getCarState = () => {
    switch (step) {
      case 0: return { x: 50, y: 180, rotation: -10, speed: 40, wheel: 0 };
      case 1: return { x: 120, y: 170, rotation: -5, speed: 60, wheel: 0 };
      case 2: return { x: 220, y: 165, rotation: 0, speed: 85, wheel: 0 };
      case 3: return { x: 300, y: 165, rotation: 0, speed: 90, wheel: 0 };
      case 4: return { x: 340, y: 155, rotation: -15, speed: 95, wheel: -20 };
      case 5: return { x: 380, y: 80, rotation: 0, speed: 100, wheel: 0 };
      case 6: return { x: 420, y: 80, rotation: 0, speed: 100, wheel: 0 };
      default: return { x: 50, y: 180, rotation: -10, speed: 40, wheel: 0 };
    }
  };

  const state = getCarState();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <radialGradient id="visionGradient" cx="0%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Highway background */}
      <rect x="0" y="0" width="400" height="250" fill="#0f172a" />
      <rect x="0" y="40" width="400" height="80" fill="#334155" />
      <line x1="0" y1="80" x2="400" y2="80" stroke="#94a3b8" strokeWidth="1" strokeDasharray="20,20" />
      
      {/* Acceleration lane */}
      <path d="M 0 200 Q 150 180 400 150" stroke="#334155" strokeWidth="40" fill="none" />
      
      {/* Other highway traffic */}
      <motion.g animate={{ x: [-100, 500] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
        <g transform="translate(0, 60)"><HorizontalCarIllustration color="#6366f1" scale={0.7} opacity={0.5} /></g>
      </motion.g>

      {/* Your car */}
      <motion.g
        animate={{ x: state.x, y: state.y, rotate: state.rotation }}
        transition={{ type: "spring", damping: 30, stiffness: 50 }}
      >
        <HorizontalCarIllustration color="#EF4444" scale={0.8} />
        
        {/* Indicators */}
        {step >= 1 && step <= 5 && (
          <motion.circle 
            cx="32" cy="-6" r="3" fill="#FDE047"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* Vision Cones */}
        <AnimatePresence>
          {(step === 3 || step === 4) && (
            <g transform="rotate(-30)"><VisionCone angle={180} sweep={90} /></g>
          )}
        </AnimatePresence>
      </motion.g>

      {/* Speedometer Overlay */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="80" height="35" rx="6" fill="#1e293b" opacity="0.8" />
        <text x="40" y="24" textAnchor="middle" fill="#22c55e" fontWeight="bold">{state.speed} km/h</text>
      </g>

      <SteeringWheelOverlay rotation={state.wheel} />
    </svg>
  );
};

export default AnimatedManeuver;

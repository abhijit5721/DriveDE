import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

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
        <p className="text-white text-center font-medium text-lg min-h-[3rem]">
          {language === 'de' ? steps[currentStep]?.description : steps[currentStep]?.descriptionEn}
        </p>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-900 border-t border-gray-800">
        <button
          onClick={handleReset}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
        >
          <RotateCcw size={20} />
        </button>
        
        <button
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1}
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
              index === currentStep
                ? 'bg-blue-600 text-white scale-110'
                : index < currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-400'
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
  const getCarPosition = () => {
    switch (step) {
      case 0: return { x: 280, y: 80, rotation: 0 };
      case 1: return { x: 280, y: 80, rotation: 0 };
      case 2: return { x: 280, y: 100 + (progress * 0.3), rotation: 0 };
      case 3: return { x: 280, y: 130, rotation: progress * 0.25 };
      case 4: return { x: 280 - (progress * 0.5), y: 130 + (progress * 0.4), rotation: 25 + (progress * 0.15) };
      case 5: return { x: 230, y: 170, rotation: 40 - (progress * 0.4) };
      case 6: return { x: 220, y: 175, rotation: 0 };
      default: return { x: 280, y: 80, rotation: 0 };
    }
  };

  const pos = getCarPosition();

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
      </defs>
      {/* Road */}
      <rect x="0" y="0" width="400" height="250" fill="url(#streetSurface)" />
      <path d="M0 42 H400" stroke="#475569" strokeWidth="1" opacity="0.28" />
      <path d="M0 88 H400" stroke="#475569" strokeWidth="1" opacity="0.2" />
      <path d="M0 206 H400" stroke="#0F172A" strokeWidth="1" opacity="0.25" />
      
      {/* Curb + sidewalk */}
      <rect x="140" y="140" width="260" height="110" fill="url(#sidewalkSurface)" />
      <rect x="140" y="140" width="260" height="10" fill="#D1D5DB" />
      <path d="M140 152 H400" stroke="#4B5563" strokeWidth="1" opacity="0.35" />
      
      {/* Parked cars */}
      <g>
        {/* Front car */}
        <g transform="translate(300, 175)">
          <HorizontalCarIllustration color="#2563EB" scale={0.9} />
        </g>

        {/* Rear car */}
        <g transform="translate(180, 175)">
          <HorizontalCarIllustration color="#7C3AED" scale={0.9} />
        </g>
      </g>
      
      {/* Parking space indicator */}
      <rect x="215" y="148" width="50" height="4" fill="#22C55E" opacity="0.8" />
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
        <HorizontalCarIllustration color="#EF4444" scale={0.82} />
        {/* Direction indicator */}
        <polygon points="32,-4 39,0 32,4" fill="#FDE047" />

        {/* Shoulder check indicator */}
        {step === 1 && (
          <g>
            <circle cx="10" cy="-24" r="12" fill="#FDE047" opacity="0.3">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1s" repeatCount="indefinite" />
            </circle>
            <text x="10" y="-20" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">👀</text>
          </g>
        )}
      </g>
      
      {/* Distance indicators */}
      {step === 0 && (
        <g>
          <line x1="255" y1="68" x2="255" y2="155" stroke="#22C55E" strokeWidth="2" strokeDasharray="4" />
          <text x="245" y="115" fill="#22C55E" fontSize="10" fontWeight="bold">50cm</text>
        </g>
      )}
      
      {/* Final position check */}
      {step === 6 && (
        <g>
          <line x1="195" y1="175" x2="195" y2="148" stroke="#22C55E" strokeWidth="2" />
          <text x="170" y="145" fill="#22C55E" fontSize="8" fontWeight="bold">≤30cm ✓</text>
        </g>
      )}
      
      {/* Labels */}
      <text x="20" y="20" fill="#9CA3AF" fontSize="12">🚗 {step === 0 ? 'Start Position' : ''}</text>
    </svg>
  );
};

const ReverseParkingAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarPosition = () => {
    switch (step) {
      case 0: return { x: 200, y: 50, rotation: 0 };
      case 1: return { x: 200, y: 50, rotation: 0 };
      case 2: return { x: 200, y: 70 + (progress * 0.3), rotation: 0 };
      case 3: return { x: 200, y: 100, rotation: progress * 0.4 };
      case 4: return { x: 200, y: 100 + (progress * 0.6), rotation: 40 };
      case 5: return { x: 200, y: 160, rotation: 40 - (progress * 0.4) };
      case 6: return { x: 200, y: 170, rotation: 0 };
      default: return { x: 200, y: 50, rotation: 0 };
    }
  };

  const pos = getCarPosition();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <linearGradient id="lotSurface" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
      </defs>
      {/* Parking lot */}
      <rect x="0" y="0" width="400" height="250" fill="url(#lotSurface)" />
      <path d="M0 50 H400" stroke="#64748B" strokeWidth="1" opacity="0.16" />
      <path d="M0 95 H400" stroke="#64748B" strokeWidth="1" opacity="0.12" />
      
      {/* Parking lines */}
      <line x1="120" y1="120" x2="120" y2="250" stroke="#F8FAFC" strokeWidth="3" opacity="0.9" />
      <line x1="180" y1="120" x2="180" y2="250" stroke="#F8FAFC" strokeWidth="3" opacity="0.9" />
      <line x1="240" y1="120" x2="240" y2="250" stroke="#F8FAFC" strokeWidth="3" opacity="0.9" />
      <line x1="300" y1="120" x2="300" y2="250" stroke="#F8FAFC" strokeWidth="3" opacity="0.9" />
      
      {/* Target space highlight */}
      <rect x="182" y="125" width="56" height="120" fill="#22C55E" opacity="0.2" />
      
      {/* Other parked cars */}
      <g transform="translate(150, 185)">
        <VerticalCarIllustration color="#6366F1" scale={0.95} />
      </g>
      <g transform="translate(270, 185)">
        <VerticalCarIllustration color="#8B5CF6" scale={0.95} />
      </g>
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
        <VerticalCarIllustration color="#EF4444" scale={0.9} />
        
        {/* Turn signal */}
        {step >= 0 && step <= 2 && (
          <circle cx="18" cy="-28" r="4" fill="#FDE047">
            <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
        
        {/* Shoulder check */}
        {step === 1 && (
          <circle cx="0" cy="-44" r="15" fill="#FDE047" opacity="0.4">
            <animate attributeName="r" values="15;20;15" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
      
      {/* Arrow showing direction */}
      {step >= 2 && step <= 5 && (
        <path d="M 210 90 L 210 130 L 220 130 L 200 150 L 180 130 L 190 130 L 190 90 Z" 
              fill="#22C55E" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
};

const ThreePointTurnAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarPosition = () => {
    switch (step) {
      case 0: return { x: 320, y: 175, rotation: 0 };
      case 1: return { x: 320, y: 175, rotation: 0 };
      case 2: return { x: 280 - (progress * 1.5), y: 175 - (progress * 0.5), rotation: -progress * 0.5 };
      case 3: return { x: 130, y: 125, rotation: -50 };
      case 4: return { x: 130, y: 125, rotation: -50 };
      case 5: return { x: 130 + (progress * 0.5), y: 125 + (progress * 0.5), rotation: -50 + (progress * 0.5) };
      case 6: return { x: 180, y: 175, rotation: 0 };
      case 7: return { x: 80 + (progress * 0.5), y: 175, rotation: 180 };
      default: return { x: 320, y: 175, rotation: 0 };
    }
  };

  const pos = getCarPosition();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      {/* Road */}
      <rect x="0" y="100" width="400" height="100" fill="#4B5563" />
      <line x1="0" y1="150" x2="400" y2="150" stroke="#FDE047" strokeWidth="2" strokeDasharray="20,10" />
      
      {/* Curbs */}
      <rect x="0" y="90" width="400" height="15" fill="#6B7280" />
      <rect x="0" y="195" width="400" height="15" fill="#6B7280" />
      
      {/* Sidewalks */}
      <rect x="0" y="0" width="400" height="90" fill="#9CA3AF" />
      <rect x="0" y="210" width="400" height="40" fill="#9CA3AF" />
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
        <HorizontalCarIllustration color="#EF4444" scale={0.82} />
        
        {/* Turn signals */}
        {(step === 0 || step === 2 || step === 3) && (
          <circle cx="-30" cy="0" r="3" fill="#FDE047">
            <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
        
        {/* Shoulder check indicator */}
        {(step === 1 || step === 4) && (
          <g>
            <circle cx="-36" cy="-18" r="12" fill="#FDE047" opacity="0.5">
              <animate attributeName="r" values="12;16;12" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <text x="-36" y="-15" textAnchor="middle" fontSize="10">👀</text>
          </g>
        )}
      </g>
      
      {/* Movement arrows */}
      {step >= 2 && step <= 3 && (
        <path d="M 300 175 Q 200 140 130 125" stroke="#22C55E" strokeWidth="3" fill="none" strokeDasharray="8,4">
          <animate attributeName="stroke-dashoffset" values="0;-24" dur="1s" repeatCount="indefinite" />
        </path>
      )}
      
      {step >= 5 && step <= 6 && (
        <path d="M 130 125 Q 160 150 180 175" stroke="#3B82F6" strokeWidth="3" fill="none" strokeDasharray="8,4">
          <animate attributeName="stroke-dashoffset" values="0;24" dur="1s" repeatCount="indefinite" />
        </path>
      )}
      
      {/* Step label */}
      <text x="20" y="30" fill="#374151" fontSize="12" fontWeight="bold">
        {step <= 3 ? '1. Vorwärts nach links' : step <= 6 ? '2. Rückwärts' : '3. Weiterfahren'}
      </text>
    </svg>
  );
};

const EmergencyBrakeAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarPosition = () => {
    const baseX = 320 - (step * 50) - (step >= 2 ? progress * 0.5 : 0);
    return { x: Math.max(100, baseX), y: 150 };
  };

  const pos = getCarPosition();
  const isBraking = step >= 2;
  const speed = step === 0 ? 30 : step === 1 ? 30 : Math.max(0, 30 - (step - 2) * 10 - progress * 0.1);

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      {/* Road */}
      <rect x="0" y="100" width="400" height="100" fill="#4B5563" />
      <line x1="0" y1="150" x2="400" y2="150" stroke="#FDE047" strokeWidth="2" strokeDasharray="20,10">
        {step < 2 && <animate attributeName="stroke-dashoffset" values="0;-60" dur="0.5s" repeatCount="indefinite" />}
      </line>
      
      {/* Curb */}
      <rect x="0" y="195" width="400" height="10" fill="#6B7280" />
      
      {/* Speed indicator */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="80" height="40" rx="8" fill="#1F2937" />
        <text x="40" y="28" textAnchor="middle" fill={isBraking ? '#EF4444' : '#22C55E'} fontSize="18" fontWeight="bold">
          {Math.round(speed)} km/h
        </text>
      </g>
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y})`}>
        <HorizontalCarIllustration color="#EF4444" scale={0.95} />
        
        {/* Brake lights */}
        {isBraking && (
          <>
            <rect x="-33" y="-9" width="6" height="8" rx="2" fill="#FF0000">
              <animate attributeName="opacity" values="1;0.5;1" dur="0.2s" repeatCount="indefinite" />
            </rect>
            <rect x="-33" y="1" width="6" height="8" rx="2" fill="#FF0000">
              <animate attributeName="opacity" values="1;0.5;1" dur="0.2s" repeatCount="indefinite" />
            </rect>
          </>
        )}
        
        {/* Tire marks */}
        {isBraking && step >= 3 && (
          <>
            <rect x="30" y="-12" width={50 + progress} height="4" fill="#1F2937" opacity="0.7" />
            <rect x="30" y="8" width={50 + progress} height="4" fill="#1F2937" opacity="0.7" />
          </>
        )}
      </g>
      
      {/* Instructor signal */}
      {step === 1 && (
        <g transform="translate(200, 80)">
          <circle cx="0" cy="0" r="30" fill="#FDE047" opacity="0.8">
            <animate attributeName="r" values="25;35;25" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <text x="0" y="8" textAnchor="middle" fontSize="24">⚠️</text>
        </g>
      )}
      
      {/* Pedal indicators */}
      {step >= 2 && (
        <g transform="translate(300, 20)">
          <rect x="0" y="0" width="90" height="50" rx="8" fill="#1F2937" />
          <rect x="10" y="10" width="30" height="30" rx="4" fill="#EF4444" opacity={isBraking ? 1 : 0.3}>
            <animate attributeName="opacity" values="1;0.7;1" dur="0.3s" repeatCount="indefinite" />
          </rect>
          <text x="25" y="50" textAnchor="middle" fill="#FFF" fontSize="8">BRAKE</text>
          <rect x="50" y="10" width="30" height="30" rx="4" fill="#3B82F6" opacity={isBraking ? 1 : 0.3}>
            <animate attributeName="opacity" values="1;0.7;1" dur="0.3s" repeatCount="indefinite" />
          </rect>
          <text x="65" y="50" textAnchor="middle" fill="#FFF" fontSize="8">CLUTCH</text>
        </g>
      )}
      
      {/* ABS indicator */}
      {step >= 3 && step < 5 && (
        <g transform="translate(30, 80)">
          <rect x="0" y="0" width="60" height="30" rx="6" fill="#FDE047" />
          <text x="30" y="20" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">ABS</text>
          <animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite" />
        </g>
      )}
      
      {/* Complete stop indicator */}
      {step >= 5 && (
        <g transform="translate(pos.x - 30, 100)">
          <circle cx={pos.x} cy="60" r="25" fill="#22C55E" opacity="0.8" />
          <text x={pos.x} y="65" textAnchor="middle" fill="#FFF" fontSize="20">✓</text>
        </g>
      )}
    </svg>
  );
};

const RoundaboutAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  // Calculate car position along the roundabout path
  const getCarTransform = () => {
    const centerX = 200;
    const centerY = 125;
    const radius = 60;
    
    switch (step) {
      case 0:
      case 1:
        return { x: 200, y: 220 - (progress * 0.3), rotation: 0 };
      case 2:
        return { x: 200, y: 190, rotation: 0 };
      case 3: {
        // Enter roundabout
        const angle = Math.PI / 2 - (progress / 100) * (Math.PI / 4);
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          rotation: -90 + (progress * 0.45)
        };
      }
      case 4: {
        // Drive in roundabout
        const angle = Math.PI / 4 - (progress / 100) * (Math.PI / 2);
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          rotation: -45 - (progress * 0.9)
        };
      }
      case 5: {
        // Prepare to exit
        const angle = -Math.PI / 4 - (progress / 100) * (Math.PI / 4);
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          rotation: -135 - (progress * 0.45)
        };
      }
      case 6: {
        // Exit
        return {
          x: 280 + (progress * 0.5),
          y: 125,
          rotation: -180
        };
      }
      default:
        return { x: 200, y: 220, rotation: 0 };
    }
  };

  const pos = getCarTransform();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <radialGradient id="roundGrass" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="100%" stopColor="#16A34A" />
        </radialGradient>
        <linearGradient id="roundRoad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4B5563" />
          <stop offset="100%" stopColor="#1F2937" />
        </linearGradient>
      </defs>
      {/* Background */}
      <rect x="0" y="0" width="400" height="250" fill="#64748B" />
      <rect x="0" y="0" width="400" height="250" fill="#84CC16" opacity="0.18" />
      
      {/* Roundabout circle */}
      <circle cx="200" cy="125" r="82" fill="url(#roundRoad)" stroke="#E5E7EB" strokeWidth="4" />
      <circle cx="200" cy="125" r="37" fill="url(#roundGrass)" /> {/* Center island */}
      <circle cx="200" cy="125" r="20" fill="#65A30D" opacity="0.75" />
      
      {/* Entry/Exit roads */}
      <rect x="180" y="180" width="40" height="70" fill="#374151" />
      <rect x="280" y="105" width="120" height="40" fill="#374151" />
      <rect x="0" y="105" width="120" height="40" fill="#374151" />
      <rect x="180" y="0" width="40" height="50" fill="#374151" />
      
      {/* Road markings */}
      <line x1="200" y1="200" x2="200" y2="250" stroke="#FDE047" strokeWidth="2" strokeDasharray="8,4" />
      <line x1="280" y1="125" x2="400" y2="125" stroke="#FDE047" strokeWidth="2" strokeDasharray="8,4" />
      
      {/* Yield sign */}
      <g transform="translate(165, 190)">
        <polygon points="15,0 30,26 0,26" fill="#FFF" stroke="#EF4444" strokeWidth="3" />
        <text x="15" y="20" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">!</text>
      </g>
      
      {/* Direction arrows in roundabout */}
      <g opacity="0.6">
        <path d="M 240 85 A 50 50 0 0 0 200 65" stroke="#FFF" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
        <path d="M 160 85 A 50 50 0 0 0 140 125" stroke="#FFF" strokeWidth="2" fill="none" />
      </g>
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
        <HorizontalCarIllustration color="#EF4444" scale={0.5} />
        
        {/* NO turn signal when entering (steps 0-3) */}
        {/* Turn signal RIGHT when exiting (steps 5-6) */}
        {step >= 5 && (
          <circle cx="16" cy="7" r="3" fill="#FDE047">
            <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
      </g>
      
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
      
      {/* Sign 215 indicator */}
      <g transform="translate(160, 210)">
        <circle cx="15" cy="15" r="15" fill="#FFF" stroke="#000" strokeWidth="2" />
        <path d="M 15 8 A 7 7 0 1 1 15 22" stroke="#000" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
      </g>
    </svg>
  );
};

const HighwayMergeAnimation: React.FC<{ step: number; progress: number }> = ({ step, progress }) => {
  const getCarPosition = () => {
    switch (step) {
      case 0: return { x: 50, y: 180, speed: 50 };
      case 1: return { x: 80, y: 175, speed: 60 };
      case 2: return { x: 120 + (progress * 0.5), y: 165 - (progress * 0.1), speed: 70 + (progress * 0.2) };
      case 3: return { x: 180, y: 155, speed: 90 };
      case 4: return { x: 200, y: 150, speed: 100 };
      case 5: return { x: 230 + (progress * 0.5), y: 140 - (progress * 0.15), speed: 110 };
      case 6: return { x: 300, y: 125, speed: 120 };
      default: return { x: 50, y: 180, speed: 50 };
    }
  };

  const pos = getCarPosition();

  return (
    <svg viewBox="0 0 400 250" className="w-full h-full">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="highwayGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#52525B" />
          <stop offset="100%" stopColor="#27272A" />
        </linearGradient>
      </defs>
      {/* Sky/background */}
      <rect x="0" y="0" width="400" height="250" fill="url(#skyGrad)" />
      <rect x="0" y="170" width="400" height="80" fill="#84CC16" opacity="0.5" />
      
      {/* Highway lanes */}
      <polygon points="0,100 400,80 400,180 0,220" fill="url(#highwayGrad)" />
      
      {/* Lane markings */}
      <line x1="0" y1="130" x2="400" y2="110" stroke="#FFF" strokeWidth="3" />
      <line x1="0" y1="160" x2="400" y2="140" stroke="#FFF" strokeWidth="2" strokeDasharray="20,15">
        <animate attributeName="stroke-dashoffset" values="0;-70" dur="0.5s" repeatCount="indefinite" />
      </line>
      <line x1="0" y1="190" x2="400" y2="170" stroke="#FFF" strokeWidth="2" strokeDasharray="20,15">
        <animate attributeName="stroke-dashoffset" values="0;-70" dur="0.5s" repeatCount="indefinite" />
      </line>
      
      {/* Acceleration lane */}
      <polygon points="0,220 150,190 200,160 200,180 150,210 0,240" fill="#4B5563" />
      <line x1="0" y1="230" x2="180" y2="185" stroke="#FDE047" strokeWidth="3" />
      
      {/* Other cars on highway */}
      <g transform="translate(280, 115) rotate(-2)">
        <HorizontalCarIllustration color="#6366F1" scale={0.62} />
      </g>
      <g transform="translate(150, 135) rotate(-2)">
        <HorizontalCarIllustration color="#8B5CF6" scale={0.62} />
      </g>
      
      {/* Your car */}
      <g transform={`translate(${pos.x}, ${pos.y}) rotate(-5)`}>
        <HorizontalCarIllustration color="#EF4444" scale={0.62} />
        
        {/* Turn signal */}
        {step >= 1 && step <= 5 && (
          <circle cx="-22" cy="-10" r="3" fill="#FDE047">
            <animate attributeName="opacity" values="1;0;1" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
        
        {/* Shoulder check indicator */}
        {step === 4 && (
          <g>
            <circle cx="-28" cy="-22" r="15" fill="#FDE047" opacity="0.4">
              <animate attributeName="r" values="12;18;12" dur="0.8s" repeatCount="indefinite" />
            </circle>
            <text x="-28" y="-19" textAnchor="middle" fontSize="12">👀</text>
          </g>
        )}
      </g>
      
      {/* Speed indicator */}
      <g transform="translate(20, 20)">
        <rect x="0" y="0" width="100" height="45" rx="8" fill="#1F2937" opacity="0.9" />
        <text x="50" y="20" textAnchor="middle" fill="#9CA3AF" fontSize="10">Geschwindigkeit</text>
        <text x="50" y="38" textAnchor="middle" fill={pos.speed >= 80 ? '#22C55E' : '#FDE047'} fontSize="16" fontWeight="bold">
          {Math.round(pos.speed)} km/h
        </text>
      </g>
      
      {/* Minimum speed reminder */}
      {step === 2 && (
        <g transform="translate(250, 20)">
          <rect x="0" y="0" width="130" height="35" rx="8" fill="#3B82F6" />
          <text x="65" y="22" textAnchor="middle" fill="#FFF" fontSize="11" fontWeight="bold">
            Mind. 80 km/h! 🚗💨
          </text>
        </g>
      )}
      
      {/* Mirror check indicators */}
      {step === 3 && (
        <g transform="translate(250, 200)">
          <rect x="0" y="0" width="140" height="40" rx="8" fill="#1F2937" opacity="0.9" />
          <text x="70" y="15" textAnchor="middle" fill="#FFF" fontSize="10">Spiegel prüfen:</text>
          <text x="70" y="32" textAnchor="middle" fill="#22C55E" fontSize="12">🪞 Innen + Links + Rechts</text>
        </g>
      )}
    </svg>
  );
};

export default AnimatedManeuver;

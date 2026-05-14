/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, RotateCcw, Play } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translations';
import { TrafficSignIcon } from '../common/TrafficSignIcon';
import { cn } from '../../utils/cn';

import { SimulatorScenario } from '../../types';

const CAR_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#10b981',
  white: '#f8fafc',
  silver: '#94a3b8',
};

const CAR_PATHS: Record<string, Record<string, string>> = {
  bottom: {
    straight: 'M 170 300 L 170 0',
    left: 'M 170 300 Q 170 130 0 130',
    right: 'M 170 300 Q 170 170 300 170',
  },
  top: {
    straight: 'M 130 0 L 130 300',
    left: 'M 130 0 Q 130 170 300 170',
    right: 'M 130 0 Q 130 130 0 130',
  },
  left: {
    straight: 'M 0 170 L 300 170',
    left: 'M 0 170 Q 130 170 130 300',
    right: 'M 0 170 Q 170 170 170 0',
  },
  right: {
    straight: 'M 300 130 L 0 130',
    left: 'M 300 130 Q 170 130 170 0',
    right: 'M 300 130 Q 130 130 130 300',
  },
};

const POSITION_MAP: Record<string, { x: number; y: number; rotate: number; targetX: number; targetY: number }> = {
  bottom: { x: 170, y: 260, rotate: 0,   targetX: 170, targetY: 40  },
  top:    { x: 130, y: 40,  rotate: 180, targetX: 130, targetY: 260 },
  left:   { x: 40,  y: 170, rotate: 90,  targetX: 260, targetY: 170 },
  right:  { x: 260, y: 130, rotate: 270, targetX: 40,  targetY: 130 },
};

// Exit point + final heading angle for each positionKey × turn combination.
// Endpoints read from CAR_PATHS bezier endpoints. Rotate = heading at exit (0=up,90=right,180=down,270=left).
const TURN_ENDPOINTS: Record<string, Record<string, { x: number; y: number; rotate: number; midX: number; midY: number }>> = {
  bottom: {
    straight: { x: 170, y:   0, rotate:   0, midX: 170, midY: 130 },
    left:     { x:   0, y: 130, rotate: -90, midX: 170, midY: 130 },
    right:    { x: 300, y: 170, rotate:  90, midX: 170, midY: 170 },
  },
  top: {
    straight: { x: 130, y: 300, rotate: 180, midX: 130, midY: 170 },
    left:     { x: 300, y: 170, rotate:  90, midX: 130, midY: 170 },
    right:    { x:   0, y: 130, rotate: -90, midX: 130, midY: 130 },
  },
  left: {
    straight: { x: 300, y: 170, rotate:  90, midX: 130, midY: 170 },
    left:     { x: 130, y: 300, rotate: 180, midX: 130, midY: 170 },
    right:    { x: 170, y:   0, rotate:   0, midX: 170, midY: 170 },
  },
  right: {
    straight: { x:   0, y: 130, rotate: -90, midX: 170, midY: 130 },
    left:     { x: 170, y:   0, rotate:   0, midX: 170, midY: 130 },
    right:    { x: 130, y: 300, rotate: 180, midX: 130, midY: 130 },
  },
};

// Signs placed on the right shoulder of the road, before the stop/yield line, facing the driver.
const SIGN_POSITION_MAP: Record<string, { x: number; y: number; rotate: number }> = {
  bottom: { x: 195, y: 228, rotate: 0   },   // car from bottom → sign east of lane, before top stop-line
  top:    { x: 105, y: 72,  rotate: 180 },   // car from top    → sign west of lane, before bottom stop-line
  left:   { x: 72,  y: 195, rotate: 90  },   // car from left   → sign south of lane, before right stop-line
  right:  { x: 228, y: 105, rotate: 270 },   // car from right  → sign north of lane, before left stop-line
};
export default function InteractiveVorfahrt({ 
  onComplete, 
  language,
  scenario: propScenario,
  scenarios: propScenarios
}: { 
  onComplete: () => void; 
  language: 'de' | 'en';
  scenario?: SimulatorScenario;
  scenarios?: SimulatorScenario[];
}) {
  const t = TRANSLATIONS[language];
  
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const scenarios = useMemo(() => {
    const list = propScenarios || [];
    if (propScenario) {
      // Avoid duplicates if propScenario is also in propScenarios
      if (!list.find(s => s.id === propScenario.id)) {
        return [propScenario, ...list];
      }
    }
    return list.length > 0 ? list : [{
      id: 'rvl-default',
      factKey: 'rvl',
      cars: [
        { id: 'blue-car', color: 'blue', positionKey: 'right', order: 0, labelKey: 'blueCar' },
        { id: 'red-car', color: 'red', positionKey: 'bottom', order: 1, labelKey: 'redCar' },
      ]
    } as SimulatorScenario];
  }, [propScenario, propScenarios]);

  const scenario = scenarios[currentScenarioIndex];
  
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [animatingCar, setAnimatingCar] = useState<string | null>(null);
  const [hoveredCar, setHoveredCar] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const translatedCars = useMemo(() => scenario.cars.map(car => ({
    ...car,
    ...POSITION_MAP[car.positionKey],
    label: (t.maneuvers.interactive.priority.labels as any)[car.labelKey] || car.labelKey,
    colorValue: CAR_COLORS[car.color]
  })), [scenario.cars, t.maneuvers.interactive.priority.labels]);

  const handleCarClick = (carId: string) => {
    if (isSuccess || animatingCar) return;

    const clickedCar = translatedCars.find(c => c.id === carId)!;
    const expectedCar = translatedCars.find(c => c.order === selectedOrder.length)!;

    if (clickedCar.id === expectedCar.id) {
      setAnimatingCar(carId);
      setError(null);
      
      setTimeout(() => {
        setSelectedOrder(prev => [...prev, carId]);
        setAnimatingCar(null);
        
        if (selectedOrder.length + 1 === translatedCars.length) {
          setIsSuccess(true);
        }
      }, 800);
    } else {
      setError(t.maneuvers.interactive.priority.error(expectedCar.label));
    }
  };

  const reset = () => {
    setSelectedOrder([]);
    setError(null);
    setIsSuccess(false);
    setAnimatingCar(null);
    setShowExplanation(false);
  };

  const switchScenario = (index: number) => {
    setCurrentScenarioIndex(index);
    reset();
  };


  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50 shadow-inner">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
            <Play className="h-3 w-3 fill-current" />
          </div>
          {t.maneuvers.interactive.priority.title}
        </h4>
        <div className="flex items-center gap-2">
          {scenarios.length > 1 && (
            <div className="mr-2 flex items-center gap-1 rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
              {scenarios.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => switchScenario(idx)}
                  data-testid={`scenario-switch-${idx}`}
                  className={cn(
                    'h-6 w-6 rounded-md text-[10px] font-bold transition-all',
                    currentScenarioIndex === idx
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-300 dark:text-slate-400 dark:hover:bg-slate-700'
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={reset}
            data-testid="simulator-reset-btn"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
          {t.maneuvers.interactive.priority.instructions}
        </p>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all border',
            showExplanation 
              ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
          )}
        >
          <Info className="h-3.5 w-3.5" />
          {showExplanation ? 'Hide Rules' : 'Show Rules'}
        </button>
      </div>

      {/* Simulator Viewport */}
      <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl bg-emerald-900/10 dark:bg-emerald-900/5 mx-auto border-4 border-slate-200 dark:border-slate-800 shadow-xl">
        <svg data-testid="simulator-svg" viewBox="0 0 300 300" className="h-full w-full">
          {/* Grass/Background */}
          <rect x="0" y="0" width="300" height="300" fill="currentColor" className="text-emerald-100 dark:text-emerald-900/20" />
          
          {/* Roads */}
          {/* Roads */}
          <rect x="110" y="0" width="80" height="300" fill="#334155" />
          <rect x="0" y="110" width="300" height="80" fill="#334155" />
          
          {/* Intersection Box */}
          <rect x="110" y="110" width="80" height="80" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />

          {/* Bending Priority Road Visualization (Lane-aware) */}
          {scenario.bendingConfig && (
            <motion.path
              d={scenario.bendingConfig.path === 'bottom-right' 
                ? 'M 170 300 Q 170 170 300 170' 
                : scenario.bendingConfig.path === 'bottom-left'
                ? 'M 170 300 Q 170 130 0 130'
                : scenario.bendingConfig.path === 'top-right'
                ? 'M 130 0 Q 130 170 300 170'
                : 'M 130 0 Q 130 130 0 130'
              }
              fill="none"
              stroke="#fbbf24"
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
          )}

          {/* Lane Markings */}
          {/* Lane Markings (Through Intersection) */}
          <line x1="150" y1="0" x2="150" y2="300" stroke="white" strokeWidth="1.5" strokeDasharray="8,8" opacity="0.25" />
          <line x1="0" y1="150" x2="300" y2="150" stroke="white" strokeWidth="1.5" strokeDasharray="8,8" opacity="0.25" />

          {/* Stop Lines / Yield Lines */}
          <line x1="110" y1="110" x2="190" y2="110" stroke="white" strokeWidth="3" opacity="0.8" />
          <line x1="110" y1="190" x2="190" y2="190" stroke="white" strokeWidth="3" opacity="0.8" />
          <line x1="110" y1="110" x2="110" y2="190" stroke="white" strokeWidth="3" opacity="0.8" />
          <line x1="190" y1="110" x2="190" y2="190" stroke="white" strokeWidth="3" opacity="0.8" />

          {/* Priority Groups Visualization (Lane-aware) */}
          {showExplanation && (
            <g opacity="0.25">
              {scenario.bendingConfig && (
                <path
                  d={scenario.bendingConfig.path === 'bottom-right' 
                    ? 'M 170 300 Q 170 170 300 170' 
                    : scenario.bendingConfig.path === 'bottom-left'
                    ? 'M 170 300 Q 170 130 0 130'
                    : scenario.bendingConfig.path === 'top-right'
                    ? 'M 130 0 Q 130 170 300 170'
                    : 'M 130 0 Q 130 130 0 130'
                  }
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="50"
                  strokeLinecap="round"
                />
              )}
            </g>
          )}

          {/* Car Paths (on Hover or Selection) */}
          {translatedCars.map(car => {
            const isHovered = hoveredCar === car.id;
            const isSelected = selectedOrder.includes(car.id);
            const path = CAR_PATHS[car.positionKey]?.[car.turn || 'straight'];
            
            if (!path) return null;
            
            return (
              <motion.path
                key={`path-${car.id}`}
                d={path}
                fill="none"
                stroke={car.colorValue}
                strokeWidth="4"
                strokeDasharray="8,4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: isHovered || (isSelected && animatingCar === car.id) ? 1 : 0, 
                  opacity: isHovered || (isSelected && animatingCar === car.id) ? 0.8 : 0 
                }}
                transition={{ duration: 0.5 }}
              />
            );
          })}

          {/* Traffic Signs — placed on road shoulder before stop line, facing driver */}
          {scenario.signs?.map((sign: any, idx: number) => {
            const signId = sign.type === 'priority' ? 'sign-priority-road' : `sign-${sign.type}`;
            const pos = SIGN_POSITION_MAP[sign.position as string];
            return (
              <g key={`sign-${idx}`} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotate})`}>
                {showExplanation && (
                   <circle r="28" fill={sign.type === 'priority' || sign.type === 'bending-priority' ? '#22c55e' : '#94a3b8'} opacity="0.2" />
                )}
                {(() => {
                  const isCompound = sign.type === 'bending-priority' || sign.type === 'stop-bending' || sign.type === 'yield-bending';
                  const foWidth = isCompound ? 50 : 44;
                  const foHeight = isCompound ? 104 : 44;
                  const foX = isCompound ? -25 : -22;
                  const foY = isCompound ? -27 : -22;
                  return (
                    <foreignObject x={foX} y={foY} width={foWidth} height={foHeight}>
                      <div className="flex h-full w-full items-start justify-center">
                        <TrafficSignIcon 
                          noFrame 
                          sign={{ 
                            id: signId, 
                            titleDe: '', 
                            titleEn: '', 
                            descriptionDe: '', 
                            descriptionEn: '', 
                            variant: sign.variant 
                          } as any} 
                        />
                      </div>
                    </foreignObject>
                  );
                })()}
              </g>
            );
          })}

          {/* Cars */}
          {translatedCars.map(car => {
             const isMoved = selectedOrder.includes(car.id);
             const isCurrentAnimation = animatingCar === car.id;
             const turn = car.turn || 'straight';
             const posEps = TURN_ENDPOINTS[car.positionKey] ?? TURN_ENDPOINTS['bottom'];
             const ep = posEps[turn] ?? posEps['straight'] ?? { x: car.targetX, y: car.targetY, rotate: car.rotate, midX: car.x, midY: car.y };
             const animateProps = isCurrentAnimation || isMoved
               ? {
                   x: [car.x, ep.midX, ep.x],
                   y: [car.y, ep.midY, ep.y],
                   rotate: [car.rotate, car.rotate, ep.rotate],
                   opacity: [1, 1, 0],
                 }
               : { x: car.x, y: car.y, rotate: car.rotate, opacity: 1 };
             
             return (
               <motion.g
                 key={car.id}
                 data-testid={`car-${car.id}`}
                 initial={{ x: car.x, y: car.y, rotate: car.rotate, opacity: 1 }}
                 animate={animateProps}
                 transition={{ duration: 0.9, ease: 'easeInOut' }}
                 style={{ cursor: isMoved ? 'default' : 'pointer' }}
                 onClick={() => handleCarClick(car.id)}
                 onMouseEnter={() => setHoveredCar(car.id)}
                 onMouseLeave={() => setHoveredCar(null)}
               >
                 {/* Priority Indicator in Explanation Mode */}
                 {showExplanation && (
                   <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}>
                     <circle cx='0' cy='0' r='18' fill='white' stroke={car.order === selectedOrder.length ? '#3b82f6' : '#94a3b8'} strokeWidth='2' opacity='0.9' />
                     <text x='0' y='5' textAnchor='middle' fontSize='14' fontWeight='900' fill={car.order === selectedOrder.length ? '#3b82f6' : '#94a3b8'}>
                       {car.order + 1}
                     </text>
                   </motion.g>
                 )}
                 {/* Car Shadow */}
                 <rect x="-16" y="-22" width="32" height="46" rx="8" fill="black" opacity="0.3" transform="translate(3, 3)" />
                 
                 {/* Side Mirrors */}
                 <rect x="-15" y="-6" width="4" height="6" rx="2" fill={car.colorValue} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
                 <rect x="11" y="-6" width="4" height="6" rx="2" fill={car.colorValue} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />

                 {/* Car Body */}
                 <path d="M -10 -20 C -12 -20 -13 -15 -13 0 C -13 15 -12 20 -10 20 L 10 20 C 12 20 13 15 13 0 C 13 -15 12 -20 10 -20 Z" fill={car.colorValue} stroke="rgba(0,0,0,0.2)" strokeWidth="1" className="shadow-lg" />
                 
                 {/* Front Windshield */}
                 <path d="M -10 -8 C -11 -13 11 -13 10 -8 L 8 -3 Q 0 -5 -8 -3 Z" fill="#1e293b" />
                 
                 {/* Rear Windshield */}
                 <path d="M -8 11 C -9 14 9 14 8 11 L 7 6 Q 0 8 -7 6 Z" fill="#1e293b" />
                 
                 {/* Roof Top Edge Shading */}
                 <rect x="-10" y="-7" width="20" height="15" rx="3" fill="black" opacity="0.1" />
                 
                 {/* Headlights */}
                 <rect x="-9" y="-20" width="5" height="2" rx="1" fill="#fef08a" />
                 <rect x="4" y="-20" width="5" height="2" rx="1" fill="#fef08a" />

                 {/* Taillights */}
                 <rect x="-9" y="18" width="5" height="2" rx="1" fill="#ef4444" />
                 <rect x="4" y="18" width="5" height="2" rx="1" fill="#ef4444" />

                 {/* Blinkers */}
                 {turn === 'left' && (
                   <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}>
                     <circle cx="-11" cy="-18" r="6" fill="#f97316" opacity="0.6" style={{ filter: 'blur(1px)' }} />
                     <circle cx="-11" cy="-18" r="2.5" fill="#fbd38d" />
                     <circle cx="-11" cy="17" r="6" fill="#f97316" opacity="0.6" style={{ filter: 'blur(1px)' }} />
                     <circle cx="-11" cy="17" r="2.5" fill="#fbd38d" />
                   </motion.g>
                 )}
                 {turn === 'right' && (
                   <motion.g animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}>
                     <circle cx="11" cy="-18" r="6" fill="#f97316" opacity="0.6" style={{ filter: 'blur(1px)' }} />
                     <circle cx="11" cy="-18" r="2.5" fill="#fbd38d" />
                     <circle cx="11" cy="17" r="6" fill="#f97316" opacity="0.6" style={{ filter: 'blur(1px)' }} />
                     <circle cx="11" cy="17" r="2.5" fill="#fbd38d" />
                   </motion.g>
                 )}
                 
                 {/* Interaction Hint */}
                 {!isMoved && !isCurrentAnimation && (
                    <motion.circle 
                      cx="0" 
                      cy="0" 
                      r="25" 
                      stroke="white" 
                      strokeWidth="2" 
                      fill="none"
                      style={{ pointerEvents: 'none' }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                 )}
               </motion.g>
             );
          })}
        </svg>

        {/* Feedback Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-x-4 bottom-4 rounded-xl bg-red-500 p-3 text-center text-sm font-bold text-white shadow-2xl z-20 border-2 border-white/20"
            >
              <div className="flex items-center justify-center gap-2">
                <X className="h-4 w-4 stroke-[3px]" />
                {error}
              </div>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/95 p-6 text-center text-white backdrop-blur-sm z-30"
            >
              <motion.div 
                initial={{ scale: 0.5, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl"
              >
                <Check className="h-12 w-12 stroke-[3px]" />
              </motion.div>
              <h3 className="mb-2 text-2xl font-black">
                {t.maneuvers.interactive.priority.successTitle}
              </h3>
              <p className="mb-6 text-blue-50 font-medium leading-relaxed">
                {t.maneuvers.interactive.priority.successMessage}
              </p>
              <button 
                onClick={onComplete}
                data-testid="simulator-continue-btn"
                className="group relative flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-lg font-black text-blue-600 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {t.maneuvers.interactive.priority.continue}
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  →
                </motion.span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Educational Fact Card */}
      <div className="flex gap-4 rounded-2xl border-2 border-blue-100 bg-white p-4 dark:border-blue-900/30 dark:bg-slate-800 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40">
          <Info className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-blue-600 opacity-70">
            {t.maneuvers.interactive.priority.didYouKnow}
          </p>
          <p className="text-sm font-medium leading-snug text-slate-700 dark:text-slate-300">
            {(t.maneuvers.interactive.priority.facts as any)[scenario.factKey]}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, RotateCcw, Play } from 'lucide-react';
import { TRANSLATIONS } from '../../data/translations';
import { TrafficSignIcon } from '../common/TrafficSignIcon';

interface Car {
  id: string;
  color: 'blue' | 'red' | 'yellow' | 'green' | 'white' | 'silver';
  positionKey: 'top' | 'right' | 'bottom' | 'left';
  order: number;
  labelKey: string;
  turn?: 'left' | 'right' | 'straight';
}

interface Sign {
  type: 'priority' | 'yield' | 'stop' | 'bending-priority' | 'yield-bending' | 'stop-bending';
  position: 'top' | 'right' | 'bottom' | 'left';
  rotation?: number;
  variant?: string;
}

interface Scenario {
  id: string;
  cars: Car[];
  factKey: 'rvl' | 'bending' | 'stop' | 'yield';
  signs?: Sign[];
  bendingConfig?: {
    path: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
}

const CAR_COLORS = {
  blue: '#3b82f6',
  red: '#ef4444',
  yellow: '#f59e0b',
  green: '#10b981',
  white: '#f8fafc',
  silver: '#94a3b8',
};

const POSITION_MAP = {
  right: { x: 260, y: 150, rotate: 0, targetX: 40, targetY: 150 },
  bottom: { x: 150, y: 260, rotate: -90, targetX: 150, targetY: 40 },
  left: { x: 40, y: 150, rotate: 180, targetX: 260, targetY: 150 },
  top: { x: 150, y: 40, rotate: 90, targetX: 150, targetY: 260 },
};

const SIGN_POSITION_MAP = {
  right: { x: 210, y: 80 },
  bottom: { x: 210, y: 210 },
  left: { x: 80, y: 210 },
  top: { x: 80, y: 80 },
};

export default function InteractiveVorfahrt({ 
  onComplete, 
  language,
  scenario: propScenario 
}: { 
  onComplete: () => void; 
  language: 'de' | 'en';
  scenario?: Scenario;
}) {
  const t = TRANSLATIONS[language];
  
  // Default scenario if none provided (Right before Left)
  const defaultScenario: Scenario = {
    id: 'rvl-default',
    factKey: 'rvl',
    cars: [
      { id: 'blue-car', color: 'blue', positionKey: 'right', order: 0, labelKey: 'blueCar' },
      { id: 'red-car', color: 'red', positionKey: 'bottom', order: 1, labelKey: 'redCar' },
    ]
  };

  const scenario = propScenario || defaultScenario;
  
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [animatingCar, setAnimatingCar] = useState<string | null>(null);

  const translatedCars = useMemo(() => scenario.cars.map(car => ({
    ...car,
    ...POSITION_MAP[car.positionKey],
    label: (t.maneuvers.interactive.priority.labels as any)[car.labelKey] || car.labelKey,
    colorValue: CAR_COLORS[car.color]
  })), [scenario.cars, t.maneuvers.interactive.priority.labels, language]);

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
        <button 
          onClick={reset}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
        {t.maneuvers.interactive.priority.instructions}
      </p>

      {/* Simulator Viewport */}
      <div className="relative aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl bg-emerald-900/10 dark:bg-emerald-900/5 mx-auto border-4 border-slate-200 dark:border-slate-800 shadow-xl">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          {/* Grass/Background */}
          <rect x="0" y="0" width="300" height="300" fill="currentColor" className="text-emerald-100 dark:text-emerald-900/20" />
          
          {/* Roads */}
          <rect x="110" y="0" width="80" height="300" fill="#334155" />
          <rect x="0" y="110" width="300" height="80" fill="#334155" />
          
          {/* Bending Priority Road Visualization */}
          {scenario.bendingConfig && (
            <motion.path
              d={scenario.bendingConfig.path === 'bottom-right' 
                ? 'M 150 300 Q 150 150 300 150' 
                : scenario.bendingConfig.path === 'bottom-left'
                ? 'M 150 300 Q 150 150 0 150'
                : scenario.bendingConfig.path === 'top-right'
                ? 'M 150 0 Q 150 150 300 150'
                : 'M 150 0 Q 150 150 0 150'
              }
              fill="none"
              stroke="#fbbf24"
              strokeWidth="12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
            />
          )}

          {/* Lane Markings */}
          <line x1="150" y1="0" x2="150" y2="300" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.3" />
          <line x1="0" y1="150" x2="300" y2="150" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.3" />

          {/* Stop Lines / Yield Lines */}
          <line x1="110" y1="110" x2="190" y2="110" stroke="white" strokeWidth="3" opacity="0.8" />
          <line x1="110" y1="190" x2="190" y2="190" stroke="white" strokeWidth="3" opacity="0.8" />
          <line x1="110" y1="110" x2="110" y2="190" stroke="white" strokeWidth="3" opacity="0.8" />
          <line x1="190" y1="110" x2="190" y2="190" stroke="white" strokeWidth="3" opacity="0.8" />

          {/* Traffic Signs */}
          {scenario.signs?.map((sign, idx) => {
            const signId = sign.type === 'priority' ? 'sign-priority-road' : `sign-${sign.type}`;
            return (
              <g key={`sign-${idx}`} transform={`translate(${SIGN_POSITION_MAP[sign.position].x}, ${SIGN_POSITION_MAP[sign.position].y}) scale(0.6)`}>
                <foreignObject x="-25" y="-25" width="50" height="50">
                  <div className="flex items-center justify-center">
                    <TrafficSignIcon sign={{ id: signId, titleDe: '', titleEn: '', descriptionDe: '', descriptionEn: '', variant: sign.variant } as any} />
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Cars */}
          {translatedCars.map(car => {
             const isMoved = selectedOrder.includes(car.id);
             const isCurrentAnimation = animatingCar === car.id;
             
             return (
               <motion.g
                 key={car.id}
                 initial={{ x: car.x, y: car.y, rotate: car.rotate }}
                 animate={isCurrentAnimation || isMoved 
                   ? { x: car.targetX, y: car.targetY, opacity: 0 } 
                   : { x: car.x, y: car.y, rotate: car.rotate, opacity: 1 }
                 }
                 transition={{ duration: 0.8, ease: 'easeInOut' }}
                 style={{ cursor: isMoved ? 'default' : 'pointer' }}
                 onClick={() => handleCarClick(car.id)}
               >
                 {/* Car Shadow */}
                 <rect x="-14" y="-22" width="28" height="44" rx="6" fill="black" opacity="0.2" transform="translate(2, 2)" />
                 
                 {/* Car Body */}
                 <rect x="-12" y="-20" width="24" height="40" rx="4" fill={car.colorValue} className="shadow-lg" />
                 
                 {/* Roof Detail */}
                 <rect x="-9" y="-12" width="18" height="20" rx="2" fill="white" opacity="0.15" />
                 
                 {/* Windows */}
                 <rect x="-10" y="-15" width="20" height="8" rx="1.5" fill="white" opacity="0.3" />
                 <rect x="-10" y="8" width="20" height="4" rx="1" fill="white" opacity="0.2" />
                 
                 {/* Headlights */}
                 <rect x="-10" y="-21" width="6" height="3" rx="1" fill="#fef08a" />
                 <rect x="4" y="-21" width="6" height="3" rx="1" fill="#fef08a" />
                 
                 {/* Interaction Hint */}
                 {!isMoved && !isCurrentAnimation && (
                    <motion.circle 
                      cx="0" 
                      cy="0" 
                      r="25" 
                      stroke="white" 
                      strokeWidth="2" 
                      fill="none"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                 )}

                 {/* Click Target (Larger) */}
                 <circle cx="0" cy="0" r="35" fill="transparent" />
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

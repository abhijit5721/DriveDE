import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, RotateCcw, Play } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Car {
  id: string;
  color: string;
  position: { x: number; y: number; rotate: number };
  target: { x: number; y: number };
  order: number;
  labelEn: string;
  labelDe: string;
}

export default function InteractiveVorfahrt({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const isDE = language === 'de';
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [animatingCar, setAnimatingCar] = useState<string | null>(null);

  const cars: Car[] = [
    {
      id: 'red',
      color: '#ef4444',
      position: { x: 50, y: 150, rotate: 90 }, // Coming from Bottom
      target: { x: 50, y: -50 },
      order: 1,
      labelDe: 'Auto Blau (Rechts)',
      labelEn: 'Blue Car (Right)',
    },
    {
       id: 'blue',
       color: '#3b82f6',
       position: { x: 150, y: 50, rotate: 0 }, // Coming from Right
       target: { x: -50, y: 50 },
       order: 0,
       labelDe: 'Auto Rot (Links)',
       labelEn: 'Red Car (Left)',
    }
  ];

  /* 
     Scenario: Right before Left
     Blue car is on the right of the Red car.
     Blue car goes first (Order 0), Blue car is 'red' in my simplified logic below 
     Wait, let's fix the IDs to match labels.
  */

  const scenarioCars: Car[] = [
    {
      id: 'blue-car',
      color: '#3b82f6',
      position: { x: 260, y: 150, rotate: 0 }, // Coming from Right
      target: { x: 40, y: 150 },
      order: 0,
      labelDe: 'Blaues Auto (von Rechts)',
      labelEn: 'Blue Car (from Right)',
    },
    {
      id: 'red-car',
      color: '#ef4444',
      position: { x: 150, y: 260, rotate: -90 }, // Coming from Bottom
      target: { x: 150, y: 40 },
      order: 1,
      labelDe: 'Rotes Auto (von Unten)',
      labelEn: 'Red Car (from Bottom)',
    }
  ];

  const handleCarClick = (carId: string) => {
    if (isSuccess || animatingCar) return;

    const clickedCar = scenarioCars.find(c => c.id === carId)!;
    const expectedCar = scenarioCars.find(c => c.order === selectedOrder.length)!;

    if (clickedCar.id === expectedCar.id) {
      setAnimatingCar(carId);
      setError(null);
      
      // Simulate animation
      setTimeout(() => {
        setSelectedOrder(prev => [...prev, carId]);
        setAnimatingCar(null);
        
        if (selectedOrder.length + 1 === scenarioCars.length) {
          setIsSuccess(true);
        }
      }, 800);
    } else {
      setError(isDE 
        ? `Falsch! Beachte die 'Rechts vor Links' Regel. Das ${isDE ? expectedCar.labelDe : expectedCar.labelEn} hat Vorrang.`
        : `Incorrect! Remember 'Right before Left'. The ${expectedCar.labelEn} has priority.`
      );
      // Haptic feedback or shake could go here
    }
  };

  const reset = () => {
    setSelectedOrder([]);
    setError(null);
    setIsSuccess(false);
    setAnimatingCar(null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Play className="h-4 w-4 text-blue-500" />
          {isDE ? 'Mini-Simulator: Wer darf zuerst?' : 'Mini-Simulator: Who goes first?'}
        </h4>
        <button 
          onClick={reset}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        {isDE 
          ? 'Klicke auf die Fahrzeuge in der richtigen Reihenfolge.'
          : 'Click on the vehicles in the correct order.'}
      </p>

      {/* SVG Intersections */}
      <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 mx-auto border-4 border-slate-300 dark:border-slate-700">
        {/* Road Layout */}
        <svg viewBox="0 0 300 300" className="h-full w-full">
          {/* Main Roads */}
          <rect x="110" y="0" width="80" height="300" fill="#475569" />
          <rect x="0" y="110" width="300" height="80" fill="#475569" />
          
          {/* Lane Markings */}
          <line x1="150" y1="0" x2="150" y2="300" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.3" />
          <line x1="0" y1="150" x2="300" y2="150" stroke="white" strokeWidth="2" strokeDasharray="10,10" opacity="0.3" />

          {/* Interaction Area Indicators */}
          {scenarioCars.map(car => {
             const isMoved = selectedOrder.includes(car.id);
             const isCurrentAnimation = animatingCar === car.id;
             
             return (
               <motion.g
                 key={car.id}
                 initial={car.position}
                 animate={isCurrentAnimation ? { ...car.target, opacity: 0 } : isMoved ? { ...car.target, opacity: 0 } : car.position}
                 transition={{ duration: 0.8, ease: "easeInOut" }}
                 style={{ cursor: isMoved ? 'default' : 'pointer' }}
                 onClick={() => handleCarClick(car.id)}
               >
                 {/* Car Shadow */}
                 <rect x="-12" y="-20" width="24" height="40" rx="4" fill="black" opacity="0.2" transform="translate(12, 20)" />
                 
                 {/* Car Body */}
                 <rect x="-12" y="-20" width="24" height="40" rx="4" fill={car.color} />
                 
                 {/* Windows */}
                 <rect x="-10" y="-15" width="20" height="10" rx="2" fill="white" opacity="0.3" />
                 
                 {/* Click Target (Larger) */}
                 <circle cx="0" cy="0" r="30" fill="transparent" />
                 
                 {!isMoved && !isCurrentAnimation && (
                    <motion.circle 
                      cx="0" 
                      cy="0" 
                      r="15" 
                      stroke="white" 
                      strokeWidth="2" 
                      fill="none"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                 )}
               </motion.g>
             );
          })}
        </svg>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-2 bottom-2 rounded-lg bg-red-500 p-2 text-center text-xs font-medium text-white shadow-lg"
            >
              <div className="flex items-center justify-center gap-1">
                <X className="h-3 w-3" />
                {error}
              </div>
            </motion.div>
          )}

          {isSuccess && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/90 p-4 text-center text-white"
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600"
              >
                <Check className="h-8 w-8" />
              </motion.div>
              <h3 className="text-lg font-bold">
                {isDE ? 'Super!' : 'Excellent!'}
              </h3>
              <p className="mb-4 text-sm opacity-90">
                {isDE 
                  ? 'Du hast die Vorfahrtsregel korrekt angewendet.'
                  : 'You applied the right-of-way rule correctly.'}
              </p>
              <button 
                onClick={onComplete}
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-lg hover:bg-slate-100"
              >
                {isDE ? 'Lektion fortsetzen' : 'Continue Lesson'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/20">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>{isDE ? 'Wusstest du?' : 'Did you know?'}</strong><br />
          {isDE 
            ? 'In Deutschland gilt an Kreuzungen ohne Schilder immer "Rechts vor Links". Wer von rechts kommt, darf zuerst fahren.'
            : 'In Germany, at intersections without signs, "Right before Left" always applies. Whoever comes from the right has priority.'}
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, Play, Info, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function InteractiveRoundabout({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const isDE = language === 'de';
  const [phase, setPhase] = useState<'entry' | 'inside' | 'exit' | 'success'>('entry');
  const [isBlinking, setIsBlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = () => {
    if (phase === 'success') return;

    if (phase === 'entry') {
      if (isBlinking) {
        setError(isDE 
          ? 'Falsch! Beim Einfahren in den Kreisverkehr darf NICHT geblinkt werden.' 
          : 'Incorrect! You must NOT signal when entering the roundabout.'
        );
      } else {
        setError(null);
        setPhase('inside');
      }
    } else if (phase === 'inside') {
      // User needs to blink to exit
      if (!isBlinking) {
        setError(isDE 
          ? 'Warte! Du musst blinken, um anzuzeigen, dass du den Kreisverkehr am nächsten Ausgang verlässt.' 
          : 'Wait! You must signal to indicate you are leaving the roundabout at the next exit.'
        );
      } else {
        setError(null);
        setPhase('exit');
        setTimeout(() => {
          setPhase('success');
        }, 1500);
      }
    }
  };

  const reset = () => {
    setPhase('entry');
    setIsBlinking(false);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <RotateCcw className="h-4 w-4 text-orange-500" />
          {isDE ? 'Kreisverkehr-Meister' : 'Roundabout Master'}
        </h4>
        <button 
          onClick={reset}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
        <div className={cn("px-2 py-1 rounded-full border", phase === 'entry' ? "bg-orange-500 text-white border-orange-500" : "bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800")}>
          1. {isDE ? 'Einfahren' : 'Entry'}
        </div>
        <div className={cn("px-2 py-1 rounded-full border", phase === 'inside' ? "bg-orange-500 text-white border-orange-500" : "bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800")}>
          2. {isDE ? 'Im Kreisel' : 'Inside'}
        </div>
        <div className={cn("px-2 py-1 rounded-full border", phase === 'exit' ? "bg-orange-500 text-white border-orange-500" : "bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800")}>
          3. {isDE ? 'Ausfahren' : 'Exit'}
        </div>
      </div>

      {/* Roundabout SVG */}
      <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 mx-auto border-4 border-slate-300 dark:border-slate-700">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          {/* Grass/Island Center */}
          <circle cx="150" cy="150" r="140" fill="#334155" />
          <circle cx="150" cy="150" r="60" fill="#15803d" />
          
          {/* Roads */}
          <rect x="120" y="0" width="60" height="300" fill="#334155" />
          <rect x="0" y="120" width="300" height="60" fill="#334155" />
          
          {/* Lane Markings */}
          <circle cx="150" cy="150" r="100" stroke="white" strokeWidth="2" strokeDasharray="10,10" fill="none" opacity="0.2" />

          {/* Indicator Arrows */}
          <g opacity="0.4">
            <path d="M 150 280 L 150 240 M 145 250 L 150 240 L 155 250" stroke="white" fill="none" strokeWidth="2" />
            <path d="M 240 150 L 280 150 M 270 145 L 280 150 L 270 155" stroke="white" fill="none" strokeWidth="2" />
          </g>

          {/* Car */}
          <motion.g
            initial={{ x: 150, y: 280, rotate: -90 }}
            animate={
              phase === 'entry' ? { x: 150, y: 280, rotate: -90 } :
              phase === 'inside' ? { 
                rotate: [270, 360], 
                x: 150, 
                y: 150 
              } :
              phase === 'exit' ? { 
                rotate: 360,
                x: [150, 340],
                y: 150
              } :
              { x: 340, y: 150, rotate: 0 }
            }
            transition={{
              rotate: { duration: phase === 'inside' ? 2 : 0.5, ease: "linear" },
              x: { duration: 0.8 },
              y: { duration: 0.8 }
            }}
            className="origin-center"
            style={{ originX: "150px", originY: "150px" }}
          >
            {/* The car itself is offset from the rotation center */}
            <g transform={phase === 'entry' ? "translate(110, -10)" : "translate(100, -10)"}>
              <rect width="30" height="20" rx="4" fill="#ef4444" />
              <rect x="22" y="2" width="6" height="4" rx="1" fill="white" opacity="0.6" /> {/* Headlights */}
              <rect x="22" y="14" width="6" height="4" rx="1" fill="white" opacity="0.6" />
              
              {/* Blinker */}
              {isBlinking && (
                <motion.circle 
                  cx="25" cy="18" r="4" 
                  fill="#f59e0b"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              )}
            </g>
          </motion.g>
        </svg>

        {/* Feedback Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-2 bottom-2 rounded-lg bg-red-500 p-2 text-center text-[10px] font-bold text-white shadow-lg z-10"
            >
              {error}
            </motion.div>
          )}

          {phase === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-green-600/90 p-4 text-center text-white"
            >
              <Check className="h-12 w-12 mb-2" />
              <h3 className="text-xl font-bold">{isDE ? 'Super!' : 'Great!'}</h3>
              <p className="text-sm opacity-90 mb-4">{isDE ? 'Du beherrschst den Kreisverkehr.' : 'You mastered the roundabout.'}</p>
              <button 
                onClick={onComplete}
                className="w-full bg-white text-green-600 py-3 rounded-xl font-bold shadow-lg"
              >
                {isDE ? 'Lektion fortsetzen' : 'Continue Lesson'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsBlinking(!isBlinking)}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2",
            isBlinking 
              ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" 
              : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
          )}
        >
          <div className={cn("h-2 w-2 rounded-full", isBlinking ? "bg-white animate-pulse" : "bg-slate-300")} />
          {isDE ? 'Blinker Rechts' : 'Signal Right'}
        </button>
        
        <button
          onClick={handleAction}
          disabled={phase === 'success'}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Play className="h-4 w-4" />
          {phase === 'entry' ? (isDE ? 'Einfahren' : 'Enter') : (isDE ? 'Fahren / Ausfahren' : 'Drive / Exit')}
        </button>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/20">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <div className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>{isDE ? 'Merksatz:' : 'Key Rule:'}</strong><br />
          {isDE 
            ? 'Rein ohne blinken, raus mit blinken! Wer im Kreis ist, hat Vorfahrt.'
            : 'Enter without signal, exit with signal! Those inside have the right of way.'}
        </div>
      </div>
    </div>
  );
}

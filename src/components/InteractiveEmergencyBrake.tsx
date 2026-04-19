import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, RotateCcw, Zap, Timer } from 'lucide-react';
import { cn } from '../utils/cn';

export default function InteractiveEmergencyBrake({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const isDE = language === 'de';
  const [gameState, setGameState] = useState<'idle' | 'driving' | 'signal' | 'braked' | 'failed'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const signalStartTime = useRef<number>(0);
  const [distance, setDistance] = useState(0);

  const startTest = () => {
    setGameState('driving');
    setReactionTime(null);
    setDistance(0);
    
    // Random signal delay between 2 and 5 seconds
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      setGameState((prev) => {
        if (prev === 'driving') {
          signalStartTime.current = Date.now();
          return 'signal';
        }
        return prev;
      });
    }, delay);
  };

  const brake = () => {
    if (gameState === 'signal') {
      const time = Date.now() - signalStartTime.current;
      setReactionTime(time);
      if (time < 700) {
        setGameState('braked');
        // Add a slight delay before completion to let them see the result
        setTimeout(() => {
          // Stay in braked state for summary, but user can complete
        }, 1000);
      } else {
        setGameState('failed');
      }
    } else if (gameState === 'driving') {
      // Braked too early
      setGameState('failed');
    }
  };

  const reset = () => {
    setGameState('idle');
    setReactionTime(null);
    setDistance(0);
  };

  // Distance animation during driving
  useEffect(() => {
    let interval: any;
    if (gameState === 'driving' || gameState === 'signal') {
      interval = setInterval(() => {
        setDistance(prev => prev + 2);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Zap className="h-4 w-4 text-yellow-500" />
          {isDE ? 'Gefahrenbremsung Training' : 'Emergency Braking Training'}
        </h4>
        <button 
          onClick={reset}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-800 border-2 border-slate-700">
        {/* Road and Environment */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="h-24 bg-slate-700" /> {/* Ground */}
          <div 
            className="absolute bottom-12 h-2 w-full flex gap-10"
            style={{ transform: `translateX(${- (distance % 80)}px)` }}
          >
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-full w-20 bg-white opacity-40 shrink-0" />
            ))}
          </div>
        </div>

        {/* Trees/Background moving */}
        <div 
          className="absolute bottom-24 flex gap-32"
          style={{ transform: `translateX(${- (distance % 300)}px)` }}
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 w-8 bg-green-900 rounded-t-full opacity-30 shrink-0" />
          ))}
        </div>

        {/* Static Car (First Person View Hood/Dashboard) */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900 to-transparent flex flex-col items-center justify-end p-4">
          <div className="w-64 h-12 bg-slate-800 rounded-t-[100px] border-x-8 border-t-4 border-slate-700" />
          <div className="flex gap-8 mt-2">
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
              <div className="text-[6px] text-blue-400">30</div>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-slate-700 bg-slate-900" />
          </div>
        </div>

        {/* Signal Overlay */}
        <AnimatePresence>
          {gameState === 'signal' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="bg-red-600 px-8 py-4 rounded-xl border-4 border-white shadow-2xl animate-pulse">
                <h2 className="text-4xl font-black text-white italic tracking-tighter">
                  {isDE ? 'HALT!' : 'STOP!'}
                </h2>
              </div>
            </motion.div>
          )}

          {gameState === 'braked' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-green-600/90 p-4 text-center text-white z-20"
            >
              <Check className="h-12 w-12 mb-2" />
              <h3 className="text-xl font-bold">{isDE ? 'Perfekt gebremst!' : 'Perfect Braking!'}</h3>
              <div className="mt-4 flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Timer className="h-4 w-4" />
                <span className="font-mono text-lg">{reactionTime}ms</span>
              </div>
              <p className="mt-2 text-xs opacity-80">
                {isDE 
                  ? 'Reaktionszeit unter 700ms ist Prüfungs-Standard.' 
                  : 'Reaction time below 700ms is the exam standard.'}
              </p>
              <button 
                onClick={onComplete}
                className="mt-6 w-full bg-white text-green-600 py-3 rounded-xl font-bold shadow-lg"
              >
                {isDE ? 'Lektion fortsetzen' : 'Continue Lesson'}
              </button>
            </motion.div>
          )}

          {gameState === 'failed' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-red-600/90 p-4 text-center text-white z-20"
            >
              <AlertCircle className="h-12 w-12 mb-2" />
              <h3 className="text-xl font-bold">{isDE ? 'Zu langsam!' : 'Too slow!'}</h3>
              {reactionTime && (
                <div className="mt-2 text-lg font-mono">{reactionTime}ms</div>
              )}
              <p className="mt-1 text-sm">
                {reactionTime 
                  ? (isDE ? 'Du musst schneller reagieren.' : 'You must react faster.')
                  : (isDE ? 'Nicht zu früh bremsen!' : 'Do not brake too early!')
                }
              </p>
              <button 
                onClick={reset}
                className="mt-4 bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-bold"
              >
                {isDE ? 'Nochmal versuchen' : 'Try Again'}
              </button>
            </motion.div>
          )}

          {gameState === 'idle' && (
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10"
            >
              <button 
                onClick={startTest}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
              >
                <Zap className="h-5 w-5 fill-current" />
                {isDE ? 'Test Starten' : 'Start Test'}
              </button>
              <p className="mt-4 text-xs text-white/70 text-center px-6">
                {isDE 
                  ? 'Bereit machen... Drücke auf BREMSEN sobald du den Befehl siehst!' 
                  : 'Get ready... Press BRAKE as soon as you see the command!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel */}
      <button
        onClick={brake}
        disabled={gameState === 'braked' || gameState === 'failed'}
        className={cn(
          "w-full py-8 rounded-2xl font-black text-2xl transition-all shadow-xl active:scale-95 border-b-8 mb-2",
          gameState === 'signal'
            ? "bg-red-500 border-red-700 text-white animate-bounce shadow-red-500/50"
            : "bg-slate-200 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-900"
        )}
      >
        {isDE ? 'BREMSEN' : 'BRAKE'}
      </button>

      <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3 dark:border-amber-900/30 dark:bg-amber-900/20">
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
        <div className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>{isDE ? 'Tipp für die Prüfung:' : 'Exam Tip:'}</strong><br />
          {isDE 
            ? 'In der Prüfung musst du "schlagartig" bremsen. Das ABS muss regeln, und das Auto muss wirklich quietschen/vibrieren!'
            : 'In the exam, you must brake "abruptly". The ABS must kick in, and the car must really screech or vibrate!'}
        </div>
      </div>
    </div>
  );
}

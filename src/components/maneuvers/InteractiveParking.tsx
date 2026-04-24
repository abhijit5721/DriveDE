import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, Info } from 'lucide-react';
import { cn } from '../../utils/cn';


type ParkingPhase = 'start' | 'align' | 'steering-in' | 'backing-in' | 'steering-out' | 'final' | 'failed';

export default function InteractiveParking({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const isDE = language === 'de';
  const [phase, setPhase] = useState<ParkingPhase>('start');
  const [hint, setHint] = useState<string>('');

  useEffect(() => {
    switch (phase) {
      case 'start':
        setHint(isDE ? 'Fahre vorwärts, bis du neben dem blauen Auto stehst.' : 'Drive forward until you are next to the blue car.');
        break;
      case 'align':
        setHint(isDE ? 'Klicke "STOPP", wenn deine Hinterachse auf Höhe des Hecks vom blauen Auto ist.' : 'Click "STOP" when your rear axle aligns with the blue car’s rear.');
        break;
      case 'steering-in':
        setHint(isDE ? 'Schlage das Lenkrad voll nach RECHTS ein.' : 'Turn the steering wheel fully to the RIGHT.');
        break;
      case 'backing-in':
        setHint(isDE ? 'Fahre rückwärts, bis du das hintere Auto im linken Spiegel siehst.' : 'Reverse until you see the car behind in your left mirror.');
        break;
      case 'steering-out':
        setHint(isDE ? 'Schlage das Lenkrad nun voll nach LINKS ein.' : 'Now turn the steering wheel fully to the LEFT.');
        break;
      case 'final':
        setHint(isDE ? 'Perfekt geparkt! Der Abstand zum Bordstein passt.' : 'Perfectly parked! The distance to the curb is correct.');
        break;
    }
  }, [phase, isDE]);

  const handleAction = () => {
    if (phase === 'start') setPhase('align');
    else if (phase === 'align') setPhase('steering-in');
    else if (phase === 'steering-in') setPhase('backing-in');
    else if (phase === 'backing-in') setPhase('steering-out');
    else if (phase === 'steering-out') {
      setPhase('final');
    }
  };

  const handleReset = () => {
    setPhase('start');
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Info className="h-4 w-4 text-blue-500" />
          {isDE ? 'Parallel-Parken Simulator' : 'Parallel Parking Simulator'}
        </h4>
        <button onClick={handleReset} className="rounded-full p-2 text-slate-400 hover:bg-slate-200">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-slate-200 border-2 border-slate-300 dark:bg-slate-800 dark:border-slate-700">
        {/* The Curb */}
        <div className="absolute top-0 h-10 w-full bg-slate-400 border-b-4 border-slate-500 dark:bg-slate-700 dark:border-slate-600">
          <div className="flex h-full w-full opacity-20">
             {[...Array(10)].map((_, i) => <div key={i} className="w-1 border-r border-white h-full ml-10" />) }
          </div>
        </div>

        {/* Road Markings */}
        <div className="absolute top-24 w-full border-t border-white/10 border-dashed h-1" />

        {/* Existing Cars (Parked parallel to curb) */}
        {/* Front Car */}
        <div className="absolute top-12 left-[280px] h-16 w-32 bg-slate-500 rounded-lg shadow-lg border border-slate-400">
           <div className="absolute right-1 inset-y-2 w-3 bg-white/20 rounded-sm" /> {/* Windshield */}
           <div className="absolute left-1 inset-y-3 w-1 bg-red-500/50 rounded-full" /> {/* Tail lights */}
        </div>
        
        {/* Rear Car */}
        <div className="absolute top-12 left-8 h-16 w-32 bg-blue-600 rounded-lg shadow-lg border border-blue-500">
           <div className="absolute right-1 inset-y-2 w-3 bg-white/30 rounded-sm" />
           <div className="absolute left-1 inset-y-3 w-1 bg-red-500/50 rounded-full" />
        </div>

        {/* The User Car */}
        <motion.div
           layout
           initial={false}
           animate={{
             top: phase === 'final' ? 12 : phase === 'steering-out' ? 18 : phase === 'backing-in' ? 45 : 85,
             left: phase === 'align' ? 280 : phase === 'steering-in' ? 280 : phase === 'backing-in' ? 200 : phase === 'steering-out' ? 150 : phase === 'final' ? 145 : 0,
             rotate: phase === 'backing-in' ? 35 : phase === 'steering-out' ? 15 : 0
           }}
           transition={{ duration: 1.5, ease: 'easeInOut' }}
           className="absolute h-16 w-32 bg-emerald-500 rounded-lg shadow-2xl z-20 border-2 border-emerald-400 flex items-center justify-center"
        >
           {/* Details */}
           <div className="absolute right-1 inset-y-2 w-3 bg-emerald-300 rounded-sm opacity-50" />
           <div className="absolute left-1 inset-y-3 w-1 bg-red-400 rounded-full" />
           
           {/* Steering Indicator */}
           {(phase === 'steering-in' || phase === 'steering-out') && (
             <motion.div 
               animate={{ rotate: phase === 'steering-in' ? 90 : -90 }}
               className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center"
             >
                <div className="h-8 w-8 rounded-full border-4 border-white flex items-center justify-center bg-emerald-500 shadow-lg">
                   <div className="h-4 w-1 bg-white" />
                </div>
             </motion.div>
           )}
        </motion.div>

        {/* Guidance Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="rounded-xl bg-white/90 p-3 shadow-xl backdrop-blur-sm dark:bg-slate-900/90">
             <p className="text-xs font-bold text-slate-800 dark:text-white">{hint}</p>
          </div>
        </div>
      </div>

      {/* Controller */}
      <div className="flex flex-col gap-2">
        <AnimatePresence mode="wait">
          {phase === 'final' ? (
            <motion.button
              key="finish"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onComplete}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-white shadow-lg"
            >
              <Check className="h-5 w-5" />
              {isDE ? 'Lektion beenden' : 'Complete Lesson'}
            </motion.button>
          ) : (
            <button
              onClick={handleAction}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold text-white shadow-lg transition-all active:scale-95',
                phase === 'align' || phase === 'backing-in' ? 'bg-red-500' : 'bg-blue-600'
              )}
            >
              {phase === 'start' && (isDE ? 'Anfahren' : 'Start Engine')}
              {phase === 'align' && (isDE ? 'STOPP' : 'STOP')}
              {phase === 'steering-in' && (isDE ? 'Einschlagen ↷' : 'Turn Wheel ↷')}
              {phase === 'backing-in' && (isDE ? 'STOPP' : 'STOP')}
              {phase === 'steering-out' && (isDE ? 'Gegenlenken ↶' : 'Counter-steer ↶')}
            </button>
          )}
        </AnimatePresence>

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/20">
          <div className="flex gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
              {isDE 
                ? 'Wichtig: In der Prüfung musst du beim Rückwärtsfahren immer einen Rundumblick machen. Im Simulator konzentrieren wir uns auf die Orientierungspunkte.' 
                : 'Important: In the exam, you must always perform an all-around scan when reversing. In the simulator, we focus on the reference points.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

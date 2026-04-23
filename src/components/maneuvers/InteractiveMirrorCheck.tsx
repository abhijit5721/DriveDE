import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, ArrowLeft, ArrowRight, ShieldCheck, Info, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Step {
  id: string;
  labelDe: string;
  labelEn: string;
  order: number;
}

const STEPS: Step[] = [
  { id: 'mirror-inner', labelDe: 'Innenspiegel', labelEn: 'Interior Mirror', order: 0 },
  { id: 'mirror-outer', labelDe: 'Außenspiegel', labelEn: 'Side Mirror', order: 1 },
  { id: 'blinker', labelDe: 'Blinker setzen', labelEn: 'Set Indicator', order: 2 },
  { id: 'shoulder', labelDe: 'Schulterblick', labelEn: 'Shoulder Check', order: 3 },
];

export default function InteractiveMirrorCheck({ 
  onComplete, 
  language,
  direction = 'left' 
}: { 
  onComplete: () => void; 
  language: 'de' | 'en';
  direction?: 'left' | 'right';
}) {
  const isDE = language === 'de';
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleStepClick = (stepId: string) => {
    if (showSuccess) return;

    const currentStepIndex = completedSteps.length;
    const expectedStep = STEPS[currentStepIndex];

    if (stepId === expectedStep.id) {
      setCompletedSteps(prev => [...prev, stepId]);
      setError(null);
      
      if (completedSteps.length + 1 === STEPS.length) {
        setShowSuccess(true);
      }
    } else {
      setError(isDE 
        ? `Falsch! Die richtige Reihenfolge ist entscheidend. Als nächstes: ${isDE ? expectedStep.labelDe : expectedStep.labelEn}`
        : `Incorrect! The sequence is critical. Next: ${expectedStep.labelEn}`
      );
    }
  };

  /* const reset = () => {
    setCompletedSteps([]);
    setError(null);
    setShowSuccess(false);
  }; */

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white overflow-hidden relative">
      <div className="flex items-center justify-between z-10">
        <div>
          <h4 className="text-lg font-bold flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            {isDE ? 'Blickführung & Absicherung' : 'Scanning & Safety Sequence'}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {isDE 
              ? `Spurwechsel/Abbiegen nach ${direction === 'left' ? 'Links' : 'Rechts'}` 
              : `${direction === 'left' ? 'Left' : 'Right'} Lane Change/Turn`}
          </p>
        </div>
      </div>

      {/* Visual Simulation Area */}
      <div className="relative aspect-video w-full rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-inner">
        {/* Road View (Background) */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-slate-700/50 flex flex-col items-center justify-center border-b border-slate-600">
           <div className="w-full h-1 bg-white/20 mb-1" />
           <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Road Ahead</p>
           <div className="w-full h-1 bg-white/20 mt-1" />
        </div>

        {/* Dashboard Components */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-slate-900 p-4">
          
          {/* Interior Mirror */}
          <button
            onClick={() => handleStepClick('mirror-inner')}
            className={cn(
              'absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-8 rounded-lg border-2 transition-all flex items-center justify-center gap-2 overflow-hidden',
              completedSteps.includes('mirror-inner') 
                ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'bg-slate-800/80 border-slate-500 hover:border-blue-400'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent pointer-events-none" />
            <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">
              {isDE ? 'Innenspiegel' : 'Interior'}
            </span>
            {completedSteps.includes('mirror-inner') && <Check className="h-3 w-3 text-green-400" />}
          </button>

          {/* Side Mirror */}
          <button
            onClick={() => handleStepClick('mirror-outer')}
            className={cn(
              'absolute top-4 w-12 h-16 rounded-l-2xl border-2 transition-all flex flex-col items-center justify-center gap-1',
              direction === 'left' ? 'left-0' : 'right-0 rotate-180',
              completedSteps.includes('mirror-outer') 
                ? 'bg-green-500/20 border-green-500' 
                : 'bg-slate-800 border-slate-500 hover:border-blue-400'
            )}
          >
             <div className={cn('text-[8px] font-bold uppercase -rotate-90 whitespace-nowrap', direction === 'right' && 'rotate-90')}>
               Side Mirror
             </div>
             {completedSteps.includes('mirror-outer') && <Check className="h-3 w-3 text-green-400" />}
          </button>

          {/* Indicator Lever */}
          <button
            onClick={() => handleStepClick('blinker')}
            className={cn(
              'absolute bottom-4 left-1/4 w-16 h-4 rounded-full border-2 transition-all flex items-center justify-center',
              completedSteps.includes('blinker') 
                ? 'bg-amber-500/20 border-amber-500' 
                : 'bg-slate-800 border-slate-500 hover:border-blue-400'
            )}
          >
            <motion.div 
               animate={completedSteps.includes('blinker') ? { x: direction === 'left' ? -5 : 5, opacity: [1, 0, 1] } : {}}
               transition={{ repeat: Infinity, duration: 0.5 }}
               className="text-amber-500"
            >
              {direction === 'left' ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
            </motion.div>
          </button>

          {/* Shoulder Area */}
          <button
            onClick={() => handleStepClick('shoulder')}
            className={cn(
              'absolute bottom-4 right-1/4 group transition-all',
              completedSteps.includes('shoulder') ? 'opacity-100' : 'opacity-60 hover:opacity-100'
            )}
          >
            <div className={cn(
              'p-3 rounded-full border-2 flex flex-col items-center gap-1',
              completedSteps.includes('shoulder') ? 'bg-green-500/20 border-green-500' : 'bg-slate-800 border-slate-500'
            )}>
              <div className="flex items-center gap-1 text-[9px] font-bold">
                <RotateCcw className="h-3 w-3" />
                {isDE ? 'Schulterblick' : 'Shoulder Check'}
              </div>
              {completedSteps.includes('shoulder') && <Check className="h-3 w-3 text-green-400" />}
            </div>
            {/* Blind Spot Indicator */}
            {!completedSteps.includes('shoulder') && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              />
            )}
          </button>

        </div>

        {/* Status Text overlay */}
        <div className="absolute top-4 left-4 pointer-events-none">
           <div className="flex gap-1">
             {STEPS.map(step => (
               <div 
                 key={step.id} 
                 className={cn(
                   'h-1.5 w-6 rounded-full transition-all',
                   completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-slate-600'
                 )} 
               />
             ))}
           </div>
        </div>

        {/* Feedback Overlays */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-4 top-4 rounded-xl bg-red-500/90 p-3 text-sm font-bold flex items-center gap-2 backdrop-blur-sm shadow-xl"
            >
              <X className="h-5 w-5" />
              {error}
            </motion.div>
          )}

          {showSuccess && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-blue-600/95 flex flex-col items-center justify-center p-6 text-center z-20"
            >
              <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-2xl">
                <ShieldCheck className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {isDE ? 'Prüfungsreif!' : 'Exam Ready!'}
              </h3>
              <p className="text-blue-100 text-sm mb-6">
                {isDE 
                  ? 'Du hast die 3-S-Blick-Routine perfekt im Griff. So bestehst du jeden Spurwechsel.' 
                  : 'You have mastered the sequence perfectly. This is how you pass every lane change.'}
              </p>
              <button
                onClick={onComplete}
                className="w-full py-4 bg-white text-blue-600 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform"
              >
                {isDE ? 'Lektion fortsetzen' : 'Continue Lesson'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
         <div className="flex gap-3">
            <div className="h-5 w-5 text-blue-400 shrink-0">
               <Info className="h-full w-full" />
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
               <strong className="text-white">{isDE ? 'Der 3-S-Blick:' : 'The 3-S-Scan:'}</strong>
               <p className="mt-1">
                 {isDE 
                   ? 'Zuerst die Übersicht (Innenspiegel), dann die Absicherung (Außenspiegel), dann die Absicht anzeigen (Blinker) und unmittelbar vor dem Wechsel der Schulterblick für den Toten Winkel.' 
                   : 'First overview (interior mirror), then safety (side mirror), then indicate intention (blinker) and immediately before the change, the shoulder check for the blind spot.'}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

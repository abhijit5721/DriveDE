/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, Play, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

/**
 * The circulating lane, sampled as keyframes.
 *
 * Germany drives on the right, so a roundabout is taken anticlockwise with the
 * island on the driver's left. A car arriving from the south joins at the six
 * o'clock point heading east and leaves by the east arm a quarter turn later.
 * Angles are measured in SVG space (y grows downward), so the sweep runs from
 * 90 degrees (south) down to 0 (east) and the heading is the tangent, angle - 90.
 */
const LANE_RADIUS = 117; // centre of the circular lane, which runs from r=95 to r=140
const ARC_ANGLES = Array.from({ length: 9 }, (_, i) => 90 - (90 * i) / 8);
const ARC_X = ARC_ANGLES.map((a) => 150 + LANE_RADIUS * Math.cos((a * Math.PI) / 180));
const ARC_Y = ARC_ANGLES.map((a) => 150 + LANE_RADIUS * Math.sin((a * Math.PI) / 180));
const ARC_ROTATE = ARC_ANGLES.map((a) => a - 90);

export default function InteractiveRoundabout({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const t = TRANSLATIONS[language];
  const rt = t.maneuvers.interactive.roundabout;
  
  const [phase, setPhase] = useState<'entry' | 'inside' | 'exit' | 'success'>('entry');
  const [isBlinking, setIsBlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = () => {
    if (phase === 'success') return;

    if (phase === 'entry') {
      if (isBlinking) {
        setError(rt.errorEntry);
      } else {
        setError(null);
        setPhase('inside');
      }
    } else if (phase === 'inside') {
      if (!isBlinking) {
        setError(rt.errorExit);
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
          {rt.title}
        </h4>
        <button 
          onClick={reset}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
        <div className={cn('px-2 py-1 rounded-full border', phase === 'entry' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800')}>
          1. {rt.entry}
        </div>
        <div className={cn('px-2 py-1 rounded-full border', phase === 'inside' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800')}>
          2. {rt.inside}
        </div>
        <div className={cn('px-2 py-1 rounded-full border', phase === 'exit' ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-200 text-slate-500 border-transparent dark:bg-slate-800')}>
          3. {rt.exit}
        </div>
      </div>

      <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 mx-auto border-4 border-slate-300 dark:border-slate-700">
        <svg viewBox="0 0 300 300" className="h-full w-full">
          {/* Single-lane roundabout as built in Germany: one circular lane, no lane
              markings inside it. The light band around the island is the Innenring,
              the paved overrun strip that long vehicles may cross. A dashed circle
              here would read as a two-lane roundabout fed by a one-lane road. */}
          {/* Draw order matters: the four approach roads go down first, then the
              circular carriageway covers them, then the Innenring and the island.
              Painting the roads last put a crossroads straight through the island. */}
          <rect x="120" y="0" width="60" height="300" fill="#334155" />
          <rect x="0" y="120" width="300" height="60" fill="#334155" />
          <circle cx="150" cy="150" r="140" fill="#334155" />
          <circle cx="150" cy="150" r="95" fill="#94a3b8" />
          <circle cx="150" cy="150" r="85" fill="#15803d" />
          <g opacity="0.4">
            <path d="M 150 280 L 150 240 M 145 250 L 150 240 L 155 250" stroke="white" fill="none" strokeWidth="2" />
            <path d="M 240 150 L 280 150 M 270 145 L 280 150 L 270 155" stroke="white" fill="none" strokeWidth="2" />
          </g>
          {/* The car is drawn around its own centre so x, y and rotate are literal:
              the centre of the car sits at (x, y) and rotate is its heading. */}
          <motion.g
            initial={{ x: 150, y: 252, rotate: -90 }}
            animate={
              phase === 'entry' ? { x: 150, y: 252, rotate: -90 } :
              phase === 'inside' ? { x: ARC_X, y: ARC_Y, rotate: ARC_ROTATE } :
              phase === 'exit' ? { x: [ARC_X[8], 340], y: 150, rotate: [-90, 0] } :
              { x: 340, y: 150, rotate: 0 }
            }
            transition={{ duration: phase === 'inside' ? 2 : 0.8, ease: 'linear' }}
            style={{ originX: '0px', originY: '0px' }}
          >
            <rect x="-15" y="-10" width="30" height="20" rx="4" fill="#ef4444" />
            <rect x="7" y="-8" width="6" height="4" rx="1" fill="white" opacity="0.6" />
            <rect x="7" y="4" width="6" height="4" rx="1" fill="white" opacity="0.6" />
            {isBlinking && (
              <motion.circle
                cx="10" cy="8" r="4"
                fill="#f59e0b"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            )}
          </motion.g>
        </svg>

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
              <h3 className="text-xl font-bold">{rt.success}</h3>
              <p className="text-sm opacity-90 mb-4">{rt.mastered}</p>
              <button
                onClick={onComplete}
                data-testid="roundabout-continue-btn"
                className="w-full bg-white text-green-600 py-3 rounded-xl font-bold shadow-lg"
              >
                {t.maneuvers.interactive.priority.continue}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsBlinking(!isBlinking)}
          data-testid="roundabout-signal-btn"
          className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all border-2',
            isBlinking 
              ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
          )}
        >
          <div className={cn('h-2 w-2 rounded-full', isBlinking ? 'bg-white animate-pulse' : 'bg-slate-300')} />
          {rt.signalRight}
        </button>
        
        <button
          onClick={handleAction}
          data-testid="roundabout-action-btn"
          disabled={phase === 'success'}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Play className="h-4 w-4" />
          {phase === 'entry' ? rt.entry : rt.driveExit}
        </button>
      </div>

      <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/20">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <div className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
          <strong>{rt.ruleTitle}</strong><br />
          {rt.ruleText}
        </div>
      </div>
    </div>
  );
}

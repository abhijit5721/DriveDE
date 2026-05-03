/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, RotateCcw, Zap, Timer } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

import { GlobalDefinitions, SideViewCar, SideViewTree, GrassBackground } from './SimulatorComponents';

export default function InteractiveEmergencyBrake({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const t = TRANSLATIONS[language];
  const et = t.maneuvers.interactive.emergencyBrake;
  
  const [gameState, setGameState] = useState<'idle' | 'driving' | 'signal' | 'braked' | 'failed'>('idle');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const signalStartTime = useRef<number>(0);
  const [distance, setDistance] = useState(0);

  const startTest = () => {
    setGameState('driving');
    setReactionTime(null);
    setDistance(0);
    
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
      } else {
        setGameState('failed');
      }
    } else if (gameState === 'driving') {
      setGameState('failed');
    }
  };

  const reset = () => {
    setGameState('idle');
    setReactionTime(null);
    setDistance(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'driving' || gameState === 'signal') {
      interval = setInterval(() => {
        setDistance(prev => prev + 5);
      }, 30);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-[#030712] p-6 border border-[#1e293b] shadow-2xl">
      <GlobalDefinitions />
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-3 font-black text-slate-100 text-lg uppercase tracking-wider">
          <Zap className="h-5 w-5 text-[#38BDF8]" />
          {et.title}
        </h4>
        <button 
          onClick={reset}
          className="rounded-2xl p-2.5 text-slate-400 hover:bg-[#1e293b] hover:text-[#38BDF8] transition-all"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[#1e293b] bg-[#020617] shadow-inner">
        <svg viewBox="0 0 400 225" className="w-full h-full">
          <GrassBackground />
          
          <g style={{ transform: `translateX(${- (distance * 0.5 % 400)}px)` }}>
            {[0, 100, 200, 300, 400, 500].map(x => (
              <g key={x} transform={`translate(${x}, 60) scale(1.5)`}>
                <SideViewTree />
              </g>
            ))}
          </g>

          {/* Road */}
          <rect y="140" width="400" height="85" fill="url(#roadTexture)" />
          <rect y="140" width="400" height="2" fill="#94a3b8" opacity="0.3" />
          
          {/* Lane Markings */}
          <g style={{ transform: `translateX(${- (distance % 100)}px)` }}>
            {[0, 100, 200, 300, 400, 500].map(x => (
              <rect key={x} x={x} y="180" width="40" height="4" fill="white" opacity="0.2" />
            ))}
          </g>

          {/* User Car */}
          <g transform="translate(60, 125) scale(0.8)">
            <SideViewCar color="#3b82f6" brakeLights={gameState === 'braked'} />
          </g>

          {/* Speed Indicator */}
          <g transform="translate(350, 190)">
            <circle r="25" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <text textAnchor="middle" y="5" fill="#38BDF8" className="text-sm font-black">30</text>
            <text textAnchor="middle" y="15" fill="#64748b" className="text-[6px] font-bold">KM/H</text>
          </g>
        </svg>

        <AnimatePresence>
          {gameState === 'signal' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 bg-red-600/20 backdrop-blur-sm"
            >
              <div className="bg-red-600 px-10 py-6 rounded-3xl border-4 border-white shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse">
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase">
                  {et.stop}
                </h2>
              </div>
            </motion.div>
          )}

          {(gameState === 'braked' || gameState === 'failed') && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                'absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md p-6 text-center text-white z-20',
                gameState === 'braked' ? 'bg-emerald-600/90' : 'bg-red-600/90'
              )}
            >
              {gameState === 'braked' ? (
                <>
                  <div className="bg-white/20 p-4 rounded-full mb-4">
                    <Check className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{et.success}</h3>
                  <div className="mt-6 flex items-center gap-3 bg-white text-emerald-600 px-6 py-3 rounded-2xl shadow-xl">
                    <Timer className="h-6 w-6" />
                    <span className="font-black text-3xl">{reactionTime}ms</span>
                  </div>
                  <button 
                    onClick={onComplete}
                    className="mt-8 w-full max-w-xs bg-white text-emerald-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                  >
                    {t.common.continue || 'CONTINUE'}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-white/20 p-4 rounded-full mb-4">
                    <AlertCircle className="h-12 w-12" />
                  </div>
                  <h3 className='text-2xl font-black uppercase tracking-tight'>
                    {reactionTime ? 'TOO SLOW!' : 'TOO EARLY!'}
                  </h3>
                  {reactionTime && (
                    <div className="mt-6 flex items-center gap-3 bg-white/20 px-6 py-3 rounded-2xl">
                      <Timer className="h-5 w-5" />
                      <span className="font-black text-2xl">{reactionTime}ms</span>
                    </div>
                  )}
                  <button 
                    onClick={reset}
                    className="mt-8 w-full max-w-xs bg-white text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                  >
                    TRY AGAIN
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Start Overlay for Idle state */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-md bg-slate-950/40 rounded-2xl">
              <button 
                onClick={startTest}
                className="bg-[#38BDF8] text-[#030712] px-12 py-6 rounded-3xl font-black text-xl shadow-[0_0_50px_rgba(56,189,248,0.4)] hover:scale-110 transition-all flex items-center gap-3 uppercase tracking-wider"
              >
                <Zap className="h-6 w-6 fill-current" />
                {et.startTest}
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={brake}
        disabled={gameState === 'braked' || gameState === 'failed'}
        className={cn(
          'w-full py-8 rounded-3xl font-black text-3xl transition-all shadow-2xl active:scale-95 border-b-8 mb-2 uppercase tracking-widest',
          gameState === 'signal'
            ? 'bg-red-600 border-red-800 text-white animate-bounce shadow-[0_0_40px_rgba(220,38,38,0.4)]'
            : 'bg-[#1e293b] border-[#0f172a] text-slate-500'
        )}
      >
        {et.brake}
      </button>

      <div className="flex gap-4 rounded-2xl border border-[#1e293b] bg-[#020617] p-5">
        <AlertCircle className="h-6 w-6 shrink-0 text-amber-500" />
        <div className="text-sm leading-relaxed text-slate-400">
          <strong className="text-amber-500 uppercase tracking-tighter text-xs">{et.examTip}</strong><br />
          {et.tipText}
        </div>
      </div>
    </div>
  );
}

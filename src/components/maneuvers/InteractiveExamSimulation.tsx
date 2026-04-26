/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle2, Volume2, VolumeX, ArrowRight, Car } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

export default function InteractiveExamSimulation({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const t = TRANSLATIONS[language];
  const xt = t.exam;
  const scenarios = xt.scenarios;
  
  const [gameState, setGameState] = useState<'intro' | 'active' | 'finished'>('intro');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [mistakes, setMistakes] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentScenario = scenarios[scenarioIndex];

  useEffect(() => {
    if (gameState === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('finished');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'de' ? 'de-DE' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    setGameState('active');
    speak(currentScenario.situation);
  };

  const handleOptionSelect = (option: any) => {
    if (feedback) return;
    
    setFeedback(option.feedback);
    if (!option.isCorrect) {
      setMistakes(prev => prev + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      if (scenarioIndex < scenarios.length - 1) {
        setScenarioIndex(prev => prev + 1);
        const next = scenarios[scenarioIndex + 1];
        speak(next.situation);
      } else {
        setGameState('finished');
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-2xl text-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20" />
          <img src="/images/examiner.png" alt="Examiner" className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover shadow-2xl" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-4">{xt.title}</h3>
        <p className="text-slate-400 mb-8 max-w-sm">
          {xt.desc}
        </p>
        <button 
          onClick={handleStart}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-white"
        >
          {xt.start}
        </button>
      </div>
    );
  }

  if (gameState === 'finished') {
    const passed = mistakes === 0;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-2xl text-white">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {passed ? (
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 mx-auto" />
          ) : (
            <AlertTriangle className="w-20 h-20 text-red-500 mb-4 mx-auto" />
          )}
          <h3 className="text-3xl font-bold mb-2">
            {passed ? xt.passed : xt.failed}
          </h3>
          <p className="text-slate-400 mb-8">
            {passed ? xt.excellent : xt.practice}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-xl">
              <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Time Left</span>
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Mistakes</span>
              <span className="text-xl font-bold text-red-400">{mistakes}</span>
            </div>
          </div>
          <button 
            onClick={onComplete}
            className="w-full bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-white"
          >
            {xt.finish}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono font-bold text-white">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
            <AlertTriangle className={cn('w-4 h-4', mistakes > 0 ? 'text-red-500' : 'text-slate-500')} />
            <span className="text-sm font-mono font-bold text-white">{mistakes}</span>
          </div>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                feedback.includes('Fehler') || feedback.includes('Failed') || feedback.includes('Durchgefallen') || feedback.includes('Gefährlich') ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
              )}>
                {feedback.includes('Fehler') || feedback.includes('Failed') || feedback.includes('Durchgefallen') || feedback.includes('Gefährlich') ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>
              <p className="text-xl font-bold text-white leading-tight">{feedback}</p>
            </motion.div>
          ) : (
            <motion.div 
              key={currentScenario.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col h-full"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
                <div className="mb-6 relative">
                   <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl" />
                   <img src="/images/examiner.png" className="w-20 h-20 rounded-full border-2 border-white/20 object-cover" alt="Examiner" />
                   <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-slate-900"
                   >
                     <Volume2 className="w-3 h-3 text-white" />
                   </motion.div>
                </div>
                <p className="text-lg font-medium text-slate-100 max-w-md mx-auto leading-relaxed">
                  {currentScenario.situation}
                </p>
              </div>

              <div className="space-y-3 mt-auto">
                {currentScenario.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt)}
                    className="w-full group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left overflow-hidden"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <ArrowRight className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-200 group-hover:text-white">
                      {opt.text}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-3 bg-slate-900 border-t border-white/5 flex items-center justify-between opacity-50">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vehicle Simulation Active</span>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Feedback</span>
        </div>
      </div>
    </div>
  );
}

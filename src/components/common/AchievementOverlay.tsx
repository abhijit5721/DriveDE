/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAppStore } from '../../store/useAppStore';
import { achievements } from '../../data/achievements';
import { Trophy, CheckCircle2 } from 'lucide-react';

export const AchievementOverlay: React.FC = () => {
  const { recentAchievements, popAchievement } = useAppStore();
  const [currentAchievement, setCurrentAchievement] = useState<typeof achievements[0] | null>(null);
  const [show, setShow] = useState(false);


  useEffect(() => {
    if (recentAchievements.length > 0 && !show) {
      const id = recentAchievements[0];
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        setCurrentAchievement(achievement);
        setShow(true);
        
        // Premium Confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      } else {
        // Skip invalid achievement
        popAchievement();
      }
    }
  }, [recentAchievements, show, popAchievement]);

  const handleClose = () => {
    setShow(false);
    // Wait for exit animation
    setTimeout(() => {
      popAchievement();
      setCurrentAchievement(null);
    }, 500);
  };

  if (!currentAchievement) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 p-8 text-center shadow-2xl pointer-events-auto overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />

            {/* Icon Circle */}
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20"
            >
              <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-slate-900">
                <span className="text-5xl">{currentAchievement.icon}</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -right-2 -top-2 rounded-full bg-white p-1.5 text-amber-500 shadow-lg"
              >
                <Trophy className="h-5 w-5" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-2">
                Achievement Unlocked
              </h3>
              <h2 className="text-2xl font-bold text-white mb-3">
                {currentAchievement.title}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {currentAchievement.description}
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition hover:shadow-blue-600/40"
            >
              Awesome!
            </motion.button>
            
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-500">
              <CheckCircle2 className="h-3 w-3" />
              <span>Added to your profile</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

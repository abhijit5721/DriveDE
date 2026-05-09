/**
 * (c) 2026 DriveDE. All rights reserved.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

export const MobileSplash: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          ease: [0, 0.71, 0.2, 1.01]
        }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          {/* Animated rings around the logo */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-8 rounded-full border border-blue-500/20"
          />
          <motion.div 
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-16 rounded-full border border-blue-500/10"
          />
          
          <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/40">
            <Car className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold tracking-tighter text-white"
          >
            Drive<span className="text-blue-500">DE</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500"
          >
            Driving Excellence
          </motion.p>
        </div>
      </motion.div>

      {/* Loading Progress Bar at the bottom */}
      <div className="absolute bottom-16 left-12 right-12 h-1 overflow-hidden rounded-full bg-slate-800">
        <motion.div 
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
        />
      </div>
    </div>
  );
};

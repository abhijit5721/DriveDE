/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Building: React.FC<{ 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  type?: 'house' | 'office' | 'store' | 'apartment',
  color?: string
}> = ({ x, y, width, height, type = 'house', color }) => {
  const getTheme = () => {
    if (color) return { base: color, roof: '#475569', windows: '#e2e8f0' };
    switch (type) {
      case 'office': return { base: '#334155', roof: '#1e293b', windows: '#38BDF8' };
      case 'store': return { base: '#f59e0b', roof: '#b45309', windows: '#fef3c7' };
      case 'apartment': return { base: '#3b82f6', roof: '#1d4ed8', windows: '#eff6ff' };
      default: return { base: '#ef4444', roof: '#991b1b', windows: '#fee2e2' }; // house (red/brick)
    }
  };

  const theme = getTheme();

  return (
    <g transform={`translate(${x}, ${y})`} filter="url(#buildingShadow)">
      {/* Base */}
      <rect width={width} height={height} fill={theme.base} rx="4" />
      
      {/* Roof/Top with depth */}
      <rect width={width} height={height * 0.15} fill={theme.roof} rx="2" />
      
      {/* Window Grid */}
      <g opacity="0.8">
        {[0.2, 0.5, 0.8].map(py => (
          py > 0.2 && (
            <g key={py}>
              <rect x={width * 0.2} y={height * py} width={width * 0.2} height={height * 0.15} fill={theme.windows} rx="1" />
              <rect x={width * 0.6} y={height * py} width={width * 0.2} height={height * 0.15} fill={theme.windows} rx="1" />
            </g>
          )
        ))}
      </g>

      {/* Subtle details */}
      <rect x={width * 0.45} y={height * 0.8} width={width * 0.1} height={height * 0.2} fill={theme.roof} opacity="0.3" />
    </g>
  );
};

export const GrassBackground: React.FC = () => (
  <rect width="100%" height="100%" fill="url(#grassPattern)" />
);

export const GlobalDefinitions = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
        <stop offset="100%" stopColor="white" stopOpacity="0.1" />
      </linearGradient>

      <radialGradient id="visionGradient" cx="0%" cy="50%" r="100%" fx="0%" fy="50%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
      </radialGradient>

      <radialGradient id="indicatorGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
      </radialGradient>

      <filter id="carShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="3" dy="3" stdDeviation="4" floodOpacity="0.4" />
      </filter>

      <pattern id="grassPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#064e3b" />
        <circle cx="20" cy="20" r="1" fill="#065f46" />
        <path d="M 10 10 L 12 5 M 20 30 L 22 25 M 35 15 L 37 10" stroke="#065f46" strokeWidth="1" fill="none" opacity="0.3" />
      </pattern>

      <pattern id="roadTexture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="#1e293b" />
        <circle cx="50" cy="50" r="1" fill="#334155" opacity="0.1" />
      </pattern>

      <filter id="buildingShadow">
        <feDropShadow dx="4" dy="4" stdDeviation="6" floodOpacity="0.3" />
      </filter>
    </defs>
  </svg>
);

export const TopDownCar: React.FC<{
  color: string;
  indicator?: 'left' | 'right' | 'hazard' | 'none';
  brakeLights?: boolean;
  reverseLights?: boolean;
  rotation?: number;
  scale?: number;
  isUser?: boolean;
}> = ({ color, indicator = 'none', brakeLights = false, reverseLights = false, rotation = 0, scale = 1, isUser = false }) => {
  const bodyId = useMemo(() => `body-grad-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 5)}`, [color]);
  
  return (
    <g transform={`scale(${scale}) rotate(${rotation})`} filter="url(#carShadow)">
      <defs>
        <linearGradient id={bodyId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="45%" stopColor={color} />
          <stop offset="55%" stopColor="white" stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>

      {/* Tires with detail */}
      {[
        { x: 18, y: -21 }, { x: 18, y: 15 },
        { x: -30, y: -21 }, { x: -30, y: 15 }
      ].map((pos, idx) => (
        <rect key={idx} x={pos.x} y={pos.y} width="12" height="7" rx="2" fill="#020617" />
      ))}

      {/* Main Body */}
      <rect x="-35" y="-18" width="70" height="36" rx="10" fill={`url(#${bodyId})`} />
      
      {/* Glossy Overlay */}
      <rect x="-35" y="-18" width="70" height="18" rx="10" fill="white" opacity="0.15" />
      <rect x="-32" y="-15" width="64" height="30" rx="8" stroke="white" strokeWidth="0.5" opacity="0.1" fill="none" />

      {/* Windows with reflection */}
      <g>
        <path d="M 10 -14 L 24 -11 L 24 11 L 10 14 Z" fill="#0f172a" />
        <path d="M 11 -12 L 20 -10 L 20 10 L 11 12 Z" fill="white" opacity="0.05" />
        <rect x="-26" y="-13" width="10" height="26" rx="2" fill="#0f172a" />
      </g>

      {/* Headlights (Front) */}
      <rect x="32" y="-15" width="4" height="9" rx="2" fill="#f8fafc" />
      <rect x="32" y="6" width="4" height="9" rx="2" fill="#f8fafc" />
      
      {/* Active Light Beams */}
      <g opacity="0.15">
        <path d="M 36 -15 L 70 -35 L 70 5 L 36 -6 Z" fill="#f8fafc" />
        <path d="M 36 6 L 70 -5 L 70 35 L 36 15 Z" fill="#f8fafc" />
      </g>

      {/* Tail Lights */}
      <rect x="-36" y="-14" width="3" height="8" rx="1" fill={brakeLights ? '#ff0000' : '#7f1d1d'} className={brakeLights ? 'animate-pulse' : ''} />
      <rect x="-36" y="6" width="3" height="8" rx="1" fill={brakeLights ? '#ff0000' : '#7f1d1d'} className={brakeLights ? 'animate-pulse' : ''} />
      
      {reverseLights && (
        <g opacity="0.8">
          <rect x="-36" y="-5" width="3" height="4" rx="1" fill="white" />
          <rect x="-36" y="1" width="3" height="4" rx="1" fill="white" />
        </g>
      )}

      {/* Indicators */}
      <AnimatePresence>
        {(indicator === 'left' || indicator === 'hazard') && (
          <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
            <circle cx="30" cy="-14" r="4" fill="#fbbf24" />
            <circle cx="-32" cy="-14" r="4" fill="#fbbf24" />
            <circle cx="30" cy="-14" r="10" fill="url(#indicatorGlow)" />
          </motion.g>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(indicator === 'right' || indicator === 'hazard') && (
          <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
            <circle cx="30" cy="14" r="4" fill="#fbbf24" />
            <circle cx="-32" cy="14" r="4" fill="#fbbf24" />
            <circle cx="30" cy="14" r="10" fill="url(#indicatorGlow)" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* User Focus Ring */}
      {isUser && (
        <motion.circle
          cx="0" cy="0" r="50"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="1.5"
          strokeDasharray="5,5"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
          opacity="0.4"
        />
      )}
    </g>
  );
};

export const VisionCone: React.FC<{
  side: 'left' | 'right' | 'round';
  opacity?: number;
}> = ({ side, opacity = 1 }) => {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {side === 'round' ? (
        <circle cx="0" cy="0" r="90" fill="url(#visionGradient)" opacity="0.4" />
      ) : (
        <path
          d="M 0 0 L 110 -45 A 110 110 0 0 1 110 45 Z"
          fill="url(#visionGradient)"
          opacity="0.6"
          transform={`translate(0, ${side === 'left' ? -20 : 20}) rotate(${side === 'left' ? -90 : 90})`}
        />
      )}
    </motion.g>
  );
};

export const SteeringWheelOverlay: React.FC<{ rotation: number }> = ({ rotation }) => (
  <g transform="translate(360, 45)">
    <circle r="25" className="fill-slate-900/80 backdrop-blur-sm" />
    <motion.g animate={{ rotate: rotation }} transition={{ type: 'spring', damping: 12, stiffness: 80 }}>
      <circle r="20" fill="none" stroke="#475569" strokeWidth="4" />
      <rect x="-2" y="-20" width="4" height="12" rx="1" fill="#38BDF8" className="shadow-lg shadow-sky-500/50" />
      <rect x="-2" y="-2" width="4" height="4" rx="1" fill="#fff" />
      <path d="M -18 0 L 18 0 M 0 0 L 0 18" stroke="#475569" strokeWidth="2.5" />
    </motion.g>
  </g>
);

export const InstructionPopup: React.FC<{ text: string }> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.95 }}
    transition={{ type: 'spring', damping: 20 }}
    className="absolute top-8 left-1/2 -translate-x-1/2 glass px-8 py-4 rounded-3xl border border-white/20 z-50 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
      <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
    </div>
    <span className="text-white font-black text-lg tracking-tight">{text}</span>
  </motion.div>
);

export const SideViewCar: React.FC<{ color: string; brakeLights?: boolean }> = ({ color, brakeLights }) => (
  <g filter="url(#carShadow)">
    {/* Body */}
    <path d="M 0 40 L 10 20 L 40 20 L 50 35 L 120 35 L 130 55 L 0 55 Z" fill={color} />
    <path d="M 10 20 L 40 20 L 50 35 L 10 35 Z" fill="#cbd5e1" opacity="0.6" />
    
    {/* Wheels */}
    <circle cx="25" cy="55" r="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="105" cy="55" r="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    
    {/* Headlight */}
    <rect x="125" y="40" width="5" height="8" fill="#fef3c7" rx="1" />
    
    {/* Brake Light */}
    <rect x="0" y="40" width="5" height="8" fill={brakeLights ? '#ef4444' : '#7f1d1d'} rx="1" />
  </g>
);

export const SideViewTree: React.FC = () => (
  <g>
    <rect x="8" y="30" width="4" height="20" fill="#451a03" />
    <circle cx="10" cy="20" r="15" fill="#065f46" />
    <circle cx="15" cy="15" r="10" fill="#064e3b" />
  </g>
);

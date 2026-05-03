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

      <filter id="carShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dx="2" dy="2" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.3" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <pattern id="grassPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#15803d" />
        <path d="M 10 10 L 12 5 M 20 30 L 22 25 M 35 15 L 37 10" stroke="#166534" strokeWidth="1" fill="none" />
      </pattern>

      <pattern id="roadTexture" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="#334155" />
        <rect width="100" height="100" fill="url(#noise)" opacity="0.05" />
      </pattern>

      <filter id="buildingShadow">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
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
  const bodyId = useMemo(() => `body-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`, [color]);
  
  return (
    <g transform={`scale(${scale}) rotate(${rotation})`}>
      <defs>
        <linearGradient id={bodyId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <rect x="-36" y="-16" width="72" height="38" rx="10" fill="black" opacity="0.2" transform="translate(2, 2)" />

      {/* Tires */}
      <rect x="18" y="-21" width="12" height="6" rx="2" fill="#111827" />
      <rect x="18" y="15" width="12" height="6" rx="2" fill="#111827" />
      <rect x="-30" y="-21" width="12" height="6" rx="2" fill="#111827" />
      <rect x="-30" y="15" width="12" height="6" rx="2" fill="#111827" />

      {/* Main Body with Shading */}
      <rect x="-35" y="-18" width="70" height="36" rx="9" fill={color} />
      
      {/* 3D Highlight Overlay */}
      <rect x="-35" y="-18" width="70" height="18" rx="9" fill="white" opacity="0.1" />
      <rect x="-35" y="0" width="70" height="18" rx="9" fill="black" opacity="0.1" />

      {/* Body Lines */}
      <path d="M 12 -18 L 12 18" stroke="rgba(0,0,0,0.2)" strokeWidth="1" /> {/* Hood */}
      <path d="M -20 -18 L -20 18" stroke="rgba(0,0,0,0.2)" strokeWidth="1" /> {/* Trunk */}

      {/* Windows */}
      <path d="M 8 -14 L 22 -11 L 22 11 L 8 14 Z" fill="#1e293b" /> {/* Front */}
      <rect x="-26" y="-13" width="8" height="26" rx="2" fill="#1e293b" /> {/* Rear */}
      <rect x="-16" y="-16.5" width="22" height="2.5" rx="1" fill="#1e293b" /> {/* Left */}
      <rect x="-16" y="14" width="22" height="2.5" rx="1" fill="#1e293b" /> {/* Right */}

      {/* Roof */}
      <rect x="-18" y="-12" width="28" height="24" rx="4" fill="white" opacity="0.1" />
      
      {/* Lights */}
      <g>
        {/* Headlights (Front) */}
        <rect x="31" y="-14" width="5" height="8" rx="2" fill="#f8fafc" />
        <rect x="31" y="6" width="5" height="8" rx="2" fill="#f8fafc" />
        {/* Light Beams */}
        <path d="M 36 -14 L 60 -25 L 60 -3 L 36 -6 Z" fill="white" opacity="0.1" />
        <path d="M 36 6 L 60 3 L 60 25 L 36 14 Z" fill="white" opacity="0.1" />
      </g>

      {/* Tail Lights (Rear) */}
      <rect x="-36" y="-14" width="3" height="8" rx="1" fill={brakeLights ? '#ef4444' : '#991b1b'} />
      <rect x="-36" y="6" width="3" height="8" rx="1" fill={brakeLights ? '#ef4444' : '#991b1b'} />
      
      {/* Reverse Lights */}
      {reverseLights && (
        <g>
          <rect x="-36" y="-5" width="3" height="4" rx="1" fill="white" />
          <rect x="-36" y="1" width="3" height="4" rx="1" fill="white" />
        </g>
      )}

      {/* Indicators */}
      <AnimatePresence>
        {(indicator === 'left' || indicator === 'hazard') && (
          <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
            <circle cx="28" cy="-14" r="3.5" fill="#fbbf24" />
            <circle cx="-32" cy="-14" r="3.5" fill="#fbbf24" />
            <circle cx="28" cy="-14" r="8" fill="url(#indicatorGlow)" />
            <circle cx="-32" cy="-14" r="8" fill="url(#indicatorGlow)" />
          </motion.g>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(indicator === 'right' || indicator === 'hazard') && (
          <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}>
            <circle cx="28" cy="14" r="3.5" fill="#fbbf24" />
            <circle cx="-32" cy="14" r="3.5" fill="#fbbf24" />
            <circle cx="28" cy="14" r="8" fill="url(#indicatorGlow)" />
            <circle cx="-32" cy="14" r="8" fill="url(#indicatorGlow)" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Selection Ring */}
      {isUser && (
        <motion.circle
          cx="0" cy="0" r="48"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeDasharray="4,4"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          opacity="0.3"
        />
      )}
    </g>
  );
};

export const VisionCone: React.FC<{
  side: 'left' | 'right' | 'round';
  opacity?: number;
}> = ({ side, opacity = 1 }) => {
  const rotation = side === 'left' ? -60 : side === 'right' ? 60 : 0;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transform={`rotate(${rotation})`}
    >
      {side === 'round' ? (
        <circle cx="0" cy="0" r="80" fill="url(#visionGradient)" opacity="0.6" />
      ) : (
        <path
          d="M 0 0 L 100 -40 A 100 100 0 0 1 100 40 Z"
          fill="url(#visionGradient)"
          opacity="0.8"
          transform={`translate(0, ${side === 'left' ? -20 : 20}) rotate(${side === 'left' ? -90 : 90})`}
        />
      )}
    </motion.g>
  );
};

export const SteeringWheelOverlay: React.FC<{ rotation: number }> = ({ rotation }) => (
  <g transform="translate(360, 45)">
    <circle r="22" fill="#1e293b" />
    <motion.g animate={{ rotate: rotation }} transition={{ type: 'spring', damping: 15 }}>
      <circle r="20" fill="none" stroke="#64748b" strokeWidth="4" />
      <rect x="-2" y="-20" width="4" height="12" rx="1" fill="#38BDF8" />
      <rect x="-2" y="-2" width="4" height="4" rx="1" fill="#fff" />
      <line x1="-18" y1="0" x2="18" y2="0" stroke="#64748b" strokeWidth="2" />
    </motion.g>
  </g>
);

export const InstructionPopup: React.FC<{ text: string }> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur shadow-2xl rounded-2xl px-6 py-3 border border-slate-200 z-50 flex items-center gap-3 whitespace-nowrap"
  >
    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
    <span className="text-slate-800 font-bold text-lg">{text}</span>
  </motion.div>
);

export const SideViewCar: React.FC<{ color: string; brakeLights?: boolean }> = ({ color, brakeLights }) => (
  <g filter="url(#carShadow)">
    {/* Body */}
    <path d="M 0 40 L 10 20 L 40 20 L 50 35 L 120 35 L 130 55 L 0 55 Z" fill={color} />
    <path d="M 10 20 L 40 20 L 50 35 L 10 35 Z" fill="#cbd5e1" opacity="0.6" /> {/* Windows */}
    
    {/* Wheels */}
    <circle cx="25" cy="55" r="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="105" cy="55" r="10" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    
    {/* Headlight */}
    <rect x="125" y="40" width="5" height="8" fill="#fef3c7" rx="1" />
    
    {/* Brake Light */}
    {brakeLights && (
      <rect x="0" y="40" width="5" height="8" fill="#ef4444" rx="1" className="animate-pulse" />
    )}
  </g>
);

export const SideViewTree: React.FC = () => (
  <g>
    <rect x="8" y="30" width="4" height="20" fill="#78350f" />
    <circle cx="10" cy="20" r="15" fill="#15803d" />
    <circle cx="15" cy="15" r="10" fill="#166534" />
  </g>
);

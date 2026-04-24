import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    </defs>
  </svg>
);

export const TopDownCar: React.FC<{
  color: string;
  indicator?: 'left' | 'right' | 'hazard' | 'none';
  brakeLights?: boolean;
  rotation?: number;
  scale?: number;
  isUser?: boolean;
}> = ({ color, indicator = 'none', brakeLights = false, rotation = 0, scale = 1, isUser = false }) => {
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

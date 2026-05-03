/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { motion } from 'framer-motion';
import { Zap, Eye, RotateCw, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';

interface SimulatorRadarProps {
  stats: {
    vorfahrt: boolean;
    roundabout: boolean;
    mirrors: boolean;
    braking: boolean;
  };
  language: 'de' | 'en';
}

export function SimulatorRadar({ stats, language }: SimulatorRadarProps) {
  const t = TRANSLATIONS[language];
  
  // Define axes (4 points)
  const points = [
    { label: t.tracker.radar.reaction, value: stats.braking ? 100 : 20, icon: Zap },
    { label: t.tracker.radar.priority, value: stats.vorfahrt ? 100 : 20, icon: ShieldCheck },
    { label: t.tracker.radar.scan, value: stats.mirrors ? 100 : 20, icon: Eye },
    { label: t.tracker.radar.roundabout, value: stats.roundabout ? 100 : 20, icon: RotateCw },
  ];

  const size = 160;
  const center = size / 2;
  const radius = center - 20;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * (2 * Math.PI)) / 4 - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const pathContent = points
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.value);
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ') + ' Z';

  const gridPath = (value: number) => 
    points
      .map((_, i) => {
        const { x, y } = getCoordinates(i, value);
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[200px] w-full max-w-[240px] group">
        {/* SVG Components */}
        <svg height="200" width="100%" className="overflow-visible">
          <defs>
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sweep-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Glowing Center */}
          <circle cx={center} cy={center} r={radius} fill="url(#radar-glow)" />
          
          {/* Grid Background */}
          {[100, 60, 20].map((v) => (
            <path
              key={v}
              d={gridPath(v)}
              className="fill-none stroke-blue-500/20 dark:stroke-white/10"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis Lines */}
          {points.map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="stroke-blue-500/20 dark:stroke-white/10"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Mastery Polygon */}
          <motion.path
            initial={{ d: gridPath(20), opacity: 0 }}
            animate={{ d: pathContent, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="fill-blue-500/20 stroke-blue-400 dark:fill-blue-500/30 dark:stroke-blue-400"
            strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.5))' }}
          />

          {/* Radar Sweep Animation */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            style={{ originX: `${center}px`, originY: `${center}px` }}
          >
            <line 
              x1={center} y1={center} x2={center} y2={center - radius} 
              className="stroke-blue-400/50" strokeWidth="2"
            />
            <path 
              d={`M ${center} ${center} L ${center} ${center - radius} A ${radius} ${radius} 0 0 1 ${center + radius * 0.5} ${center - radius * 0.8} Z`}
              fill="url(#sweep-gradient)"
              opacity="0.5"
            />
          </motion.g>

          {/* Data Points */}
          {points.map((p, i) => {
            const { x, y } = getCoordinates(i, p.value);
            return (
              <motion.g key={i}>
                {p.value === 100 && (
                  <motion.circle
                    cx={x} cy={y} r="8"
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="fill-emerald-400/20"
                  />
                )}
                <motion.circle
                  cx={x} cy={y} r="4"
                  className={cn(
                    'stroke-white dark:stroke-slate-900 shadow-xl',
                    p.value === 100 ? 'fill-emerald-400' : 'fill-blue-500'
                  )}
                  strokeWidth="2"
                />
              </motion.g>
            );
          })}
        </svg>

        {/* Labels & Icons Overlay */}
        {points.map((p, i) => {
          const { x, y } = getCoordinates(i, 118);
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center gap-1 transition-transform group-hover:scale-110"
              style={{
                left: `${(x / size) * 100}%`,
                top: `${(y / size) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-2xl shadow-xl border transition-all duration-500',
                p.value === 100 
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' 
                  : 'glass-card border-white/20 text-blue-400 dark:text-blue-300'
              )}>
                <Icon className={cn('h-4 w-4', p.value === 100 && 'animate-pulse')} />
              </div>
              <span className={cn(
                'text-[9px] font-black uppercase tracking-widest leading-none',
                p.value === 100 ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              )}>
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 flex gap-6 animate-fade-in-up">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {t.tracker.radar.mastered}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            {t.tracker.radar.practice}
          </span>
        </div>
      </div>
    </div>
  );
}

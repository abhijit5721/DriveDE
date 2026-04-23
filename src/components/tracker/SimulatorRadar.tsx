import { motion } from 'framer-motion';
import { Zap, Eye, RotateCw, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

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
  const isDE = language === 'de';
  
  // Define axes (4 points)
  // Top: Braking, Right: Vorfahrt, Bottom: Mirrors, Left: Roundabout
  const points = [
    { label: isDE ? 'Reaktion' : 'Reaction', value: stats.braking ? 100 : 20, icon: Zap },
    { label: isDE ? 'Vorfahrt' : 'Priority', value: stats.vorfahrt ? 100 : 20, icon: ShieldCheck },
    { label: isDE ? 'Blick' : 'Scan', value: stats.mirrors ? 100 : 20, icon: Eye },
    { label: isDE ? 'Kreisel' : 'Roundabout', value: stats.roundabout ? 100 : 20, icon: RotateCw },
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
      <div className="relative h-[200px] w-full max-w-[240px]">
        {/* SVG Components */}
        <svg height="200" width="100%" className="overflow-visible">
          {/* Grid Background */}
          {[100, 60, 20].map((v) => (
            <path
              key={v}
              d={gridPath(v)}
              className="fill-none stroke-blue-500/10 dark:stroke-white/10"
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
                className="stroke-blue-500/10 dark:stroke-white/10"
                strokeWidth="1"
              />
            );
          })}

          {/* Mastery Polygon */}
          <motion.path
            initial={{ d: gridPath(20), opacity: 0 }}
            animate={{ d: pathContent, opacity: 1 }}
            transition={{ duration: 1, ease: 'circOut' }}
            className="fill-blue-400/20 stroke-blue-400 dark:fill-blue-500/30 dark:stroke-blue-400"
            strokeWidth="3"
            style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' }}
          />

          {/* Data Points */}
          {points.map((p, i) => {
            const { x, y } = getCoordinates(i, p.value);
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                className={cn(
                  'stroke-white dark:stroke-slate-900 transition-colors',
                  p.value === 100 ? 'fill-emerald-400' : 'fill-blue-400'
                )}
                strokeWidth="2"
              />
            );
          })}
        </svg>

        {/* Labels & Icons Overlay */}
        {points.map((p, i) => {
          const { x, y } = getCoordinates(i, 115);
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center gap-0.5"
              style={{
                left: `${(x / size) * 100}%`,
                top: `${(y / size) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-lg shadow-sm border',
                p.value === 100 
                  ? 'bg-emerald-500 border-emerald-400 text-white' 
                  : 'bg-white/10 border-white/20 text-blue-200'
              )}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/70">
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-white/60">Mastered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-400" />
          <span className="text-[10px] font-bold text-white/60">Practice</span>
        </div>
      </div>
    </div>
  );
}

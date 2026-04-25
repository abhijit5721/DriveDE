/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Droplets, Thermometer, Battery, Droplet, Gauge } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Hotspot {
  id: string;
  nameDe: string;
  nameEn: string;
  descriptionDe: string;
  descriptionEn: string;
  x: number; // %
  y: number; // %
  icon: React.ElementType;
}

const hotspots: Hotspot[] = [
  {
    id: 'oil',
    nameDe: 'Ölmessstab',
    nameEn: 'Oil Dipstick',
    descriptionDe: 'Zum Prüfen des Motorölstands. Der Stand muss zwischen MIN und MAX liegen.',
    descriptionEn: 'To check the engine oil level. The level must be between MIN and MAX.',
    x: 45,
    y: 50,
    icon: Droplet,
  },
  {
    id: 'coolant',
    nameDe: 'Kühlwasser',
    nameEn: 'Coolant',
    descriptionDe: 'Niemals bei heißem Motor öffnen! Verbrennungsgefahr.',
    descriptionEn: 'Never open when the engine is hot! Danger of burns.',
    x: 75,
    y: 35,
    icon: Thermometer,
  },
  {
    id: 'washer',
    nameDe: 'Scheibenwischwasser',
    nameEn: 'Washer Fluid',
    descriptionDe: 'Blauer Deckel. Wichtig für gute Sicht, besonders im Winter mit Frostschutz.',
    descriptionEn: 'Blue cap. Important for good visibility, especially in winter with antifreeze.',
    x: 20,
    y: 30,
    icon: Droplets,
  },
  {
    id: 'brake',
    nameDe: 'Bremsflüssigkeit',
    nameEn: 'Brake Fluid',
    descriptionDe: 'Wenn der Stand sinkt, sofort in die Werkstatt. Sicherheitssystem!',
    descriptionEn: 'If the level drops, go to the workshop immediately. Safety system!',
    x: 48,
    y: 15,
    icon: Gauge,
  },
  {
    id: 'battery',
    nameDe: 'Batterie',
    nameEn: 'Battery',
    descriptionDe: 'Prüfen auf festen Sitz der Pole und Sauberkeit.',
    descriptionEn: 'Check for tight terminals and cleanliness.',
    x: 82,
    y: 75,
    icon: Battery,
  },
];

export default function InteractiveTechCheck({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const isDE = language === 'de';
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const handleHotspotClick = (id: string) => {
    if (!foundIds.includes(id)) {
      setFoundIds([...foundIds, id]);
    }
    const hotspot = hotspots.find(h => h.id === id);
    if (hotspot) setActiveHotspot(hotspot);
  };

  const progress = (foundIds.length / hotspots.length) * 100;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white shadow-sm dark:bg-slate-900/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-slate-900 dark:text-white">
            {isDE ? 'Fahrzeugtechnik-Check' : 'Vehicle Tech Check'}
          </h4>
          <span className="text-xs font-bold text-blue-500">
            {foundIds.length} / {hotspots.length} {isDE ? 'gefunden' : 'found'}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-blue-500"
          />
        </div>
      </div>

      <div className="relative p-2">
        {/* Engine Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100">
          <img 
            src="/images/engine_bay.png" 
            alt="Engine Bay" 
            className="h-full w-full object-cover opacity-90 brightness-110"
          />
          
          {/* Overlay Darken */}
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

          {/* Hotspots */}
          {hotspots.map((h) => {
            const isFound = foundIds.includes(h.id);
            const Icon = h.icon;
            return (
              <button
                key={h.id}
                onClick={() => handleHotspotClick(h.id)}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                className={cn(
                  'absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all shadow-lg',
                  isFound 
                    ? 'bg-emerald-500 border-white text-white scale-110 z-10' 
                    : 'bg-white/40 border-white/60 text-slate-800 backdrop-blur-sm hover:scale-125 hover:bg-white hover:z-10'
                )}
              >
                {isFound ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                
                {/* Ping Animation for unfound */}
                {!isFound && (
                  <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-25 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Panel */}
      <div className="min-h-[140px] p-4">
        <AnimatePresence mode="wait">
          {activeHotspot ? (
            <motion.div
              key={activeHotspot.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white shadow-md">
                  <activeHotspot.icon className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white">
                    {isDE ? activeHotspot.nameDe : activeHotspot.nameEn}
                  </h5>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {isDE ? activeHotspot.descriptionDe : activeHotspot.descriptionEn}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 dark:border-slate-800">
              <div className="flex flex-col items-center gap-2 text-center text-slate-400">
                <Info className="h-8 w-8 opacity-20" />
                <p className="text-xs font-medium">
                  {isDE 
                    ? 'Klicke auf die Markierungen im Motorraum, um mehr zu erfahren.' 
                    : 'Click on the markers in the engine bay to learn more.'}
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Button */}
      {foundIds.length === hotspots.length && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 pt-0"
        >
          <button
            onClick={onComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            <Check className="h-5 w-5" />
            {isDE ? 'Technik-Check bestanden!' : 'Tech Check Passed!'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * NavigationHUD – Google-Maps-style fullscreen overlay shown while
 * live tracking is active. All helpers are self-contained so this
 * component has no circular dependency on Tracker.tsx.
 */
import React, { useMemo, useEffect } from 'react';
import {
  MapContainer, TileLayer, Polyline, Marker, Popup, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Pause, Navigation,
  Play,
  CornerUpLeft, CornerUpRight, MoveUp, 
  X, MoreVertical, Navigation2
} from 'lucide-react';
import { cn } from '../../utils/cn';

/* ── Fix default Leaflet icon URLs for Vite/webpack ──────────────── */
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

/* ── Types ──────────────────────────────────────────────────────── */
interface GPSPoint { lat: number; lng: number; }
interface MistakeGroup { type: string; count: number; label: string; }

export interface NavigationHUDProps {
  gpsPoints: GPSPoint[];
  currentSpeed: number;
  currentLimit: number | null;
  elapsedTime: number;
  currentDistance: number;
  safetyScore: number;
  mistakeGroups: MistakeGroup[];
  isPaused: boolean;
  destinationCoords: { lat: number; lng: number } | null;
  destinationLabel?: string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onLogProblem: () => void;
  showMistakeSuccess: boolean;
  // New props for Google Maps style
  nextInstruction?: string;
  distanceToNextTurn?: string;
  nextRoadName?: string;
  currentRoadName?: string;
  eta?: string;
  t: {
    pause: string;
    resume: string;
    stop: string;
    problem: string;
    saved: string;
    safetyScore: string;
    yourDestination: string;
  };
}

/* ── Pure helpers ───────────────────────────────────────────────── */
function formatTime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function calcBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/* ── Leaflet icons ──────────────────────────────────────────────── */
function makeCarIcon(rotationDeg: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      transform: rotate(${rotationDeg}deg);
      width:48px; height:48px;
      display:flex; align-items:center; justify-content:center;
      filter: drop-shadow(0 4px 10px rgba(59,130,246,0.6));
    ">
      <svg viewBox="0 0 24 24" width="44" height="44" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 21l9-3 9 3-9-19z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

const flagIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px; height:32px;
    display:flex; align-items:center; justify-content:center;
    filter: drop-shadow(0 4px 10px rgba(239,68,68,0.5));
  ">
    <svg viewBox="0 0 24 24" width="28" height="28" fill="#ef4444" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="white" stroke-width="2"/>
      <line x1="4" y1="22" x2="4" y2="15" stroke="white" stroke-width="2"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function getInstructionIcon(instruction: string, size: string = 'h-10 w-10') {
  const lower = instruction.toLowerCase();
  const className = cn(size, 'text-white');
  if (lower.includes('left')) return <CornerUpLeft className={className} />;
  if (lower.includes('right')) return <CornerUpRight className={className} />;
  return <MoveUp className={className} />;
}

/* ── Inner map helper: keep map panned to latest point ─────────── */
function MapFollower({ point, isStarting }: { point: [number, number], isStarting: boolean }) {
  const map = useMap();
  useEffect(() => { 
    map.panTo(point, { animate: true, duration: isStarting ? 1.5 : 0.8 }); 
  }, [map, point, isStarting]);
  return null;
}

/* ── Speed-limit sign (German Straßenschild style) ──────────────── */
function SpeedSign({ limit, speeding }: { limit: number; speeding: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className={cn(
        'flex h-14 w-14 select-none flex-col items-center justify-center rounded-full border-[5px] bg-white shadow-2xl',
        speeding ? 'border-red-600 animate-pulse' : 'border-red-600'
      )}
    >
      <span className={cn('text-[20px] font-black leading-none', speeding ? 'text-red-600' : 'text-slate-900')}>
        {limit}
      </span>
    </motion.div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  gpsPoints, currentSpeed, currentLimit, elapsedTime, currentDistance,
  safetyScore, mistakeGroups, isPaused, destinationCoords, destinationLabel,
  onPause, onResume, onStop, onLogProblem, showMistakeSuccess, t,
  nextInstruction = 'Take the exit toward Pacific Blvd East',
  distanceToNextTurn = '20 m',
  nextRoadName = 'Cambie St',
  currentRoadName = 'W 2nd Ave',
  eta = '22:43'
}) => {
  const [isStartingSplash, setIsStartingSplash] = React.useState(true);
  const [startingPhase, setStartingPhase] = React.useState<'finding' | '3' | '2' | '1' | 'go'>('finding');

  const hasRoute  = gpsPoints.length > 0;
  const isSpeeding = !!(currentLimit && currentSpeed > currentLimit);

  // Handle starting animation lifecycle (Google Maps style)
  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 600));
      setStartingPhase('3');
      await new Promise(r => setTimeout(r, 600));
      setStartingPhase('2');
      await new Promise(r => setTimeout(r, 600));
      setStartingPhase('1');
      await new Promise(r => setTimeout(r, 600));
      setStartingPhase('go');
      await new Promise(r => setTimeout(r, 800));
      setIsStartingSplash(false);
    };
    sequence();
  }, []);

  const latLng = useMemo<[number, number]>(() =>
    hasRoute
      ? [gpsPoints[gpsPoints.length - 1].lat, gpsPoints[gpsPoints.length - 1].lng]
      : [52.52, 13.405],
  [gpsPoints.length, hasRoute]);

  const bearing = useMemo(() =>
    gpsPoints.length > 1
      ? calcBearing(
          gpsPoints[gpsPoints.length - 2].lat, gpsPoints[gpsPoints.length - 2].lng,
          gpsPoints[gpsPoints.length - 1].lat, gpsPoints[gpsPoints.length - 1].lng,
        )
      : 0,
  [gpsPoints.length]);

  const carIcon = useMemo(() => makeCarIcon(bearing), [bearing]);

  const scoreColor =
    safetyScore >= 80 ? 'text-emerald-500' :
    safetyScore >= 50 ? 'text-amber-500'   : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 font-sans"
    >
      {/* ═══════════ TOP INSTRUCTION BAR ═══════════════════════════════ */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="absolute left-0 right-0 top-0 z-[100] bg-[#00897B] pb-3 pt-10 shadow-lg"
      >
        <div className="flex items-start px-6">
          <div className="mr-5 flex flex-col items-center">
            {getInstructionIcon(nextInstruction || '')}
            <span className="mt-1 text-lg font-black text-white">{distanceToNextTurn}</span>
          </div>
          <div className="flex-1 pt-1">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70">Next Road</span>
            <h1 className="text-2xl font-black leading-tight text-white">{nextRoadName}</h1>
          </div>
        </div>
        
        {/* Lane indicators */}
        <div className="mt-4 flex items-center justify-center gap-4 border-t border-white/10 pt-3">
          <div className="flex flex-col items-center opacity-40">
             <CornerUpLeft className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col items-center">
             <MoveUp className="h-4 w-4 text-white" />
             <div className="mt-1 h-1 w-4 rounded-full bg-white" />
          </div>
          <div className="flex flex-col items-center">
             <MoveUp className="h-4 w-4 text-white" />
             <div className="mt-1 h-1 w-4 rounded-full bg-white" />
          </div>
          <div className="flex flex-col items-center opacity-40">
             <CornerUpRight className="h-4 w-4 text-white" />
          </div>
        </div>
      </motion.div>

      {/* ═══════════ MAP SECTION ═══════════════════════════════════ */}
      <div className="relative flex-1 overflow-hidden">
        {hasRoute ? (
          <div className={cn(
            'h-full w-full transition-all duration-[2000ms] ease-in-out',
            !isStartingSplash && 'origin-bottom [transform:perspective(1500px)_rotateX(35deg)_scale(1.2)]'
          )}>
            <MapContainer
              key="nav-hud-map"
              center={latLng}
              zoom={isStartingSplash ? 15 : 19}
              zoomControl={false}
              attributionControl={false}
              preferCanvas={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={20}
              />
              <Polyline
                positions={gpsPoints.map(p => [p.lat, p.lng])}
                color="#00A0E9"
                weight={10}
                opacity={0.9}
              />
              {destinationCoords && (
                <Marker
                  position={[destinationCoords.lat, destinationCoords.lng]}
                  icon={flagIcon}
                >
                  <Popup>{destinationLabel || t.yourDestination}</Popup>
                </Marker>
              )}
              <Marker position={latLng} icon={carIcon} />
              <MapFollower point={latLng} isStarting={isStartingSplash} />
            </MapContainer>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-slate-900">
            <motion.div
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 ring-4 ring-blue-500/30"
            >
              <Navigation className="h-7 w-7 text-blue-400" />
            </motion.div>
            <p className="text-sm font-semibold text-slate-400">Acquiring GPS signal…</p>
          </div>
        )}

        {/* ── Floating Map Overlays ─────────────────────────────────── */}
        
        {/* Current Road Label */}
        <div className="absolute bottom-4 left-1/2 z-[110] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-[#3b82f6] px-4 py-1.5 shadow-xl">
             <Navigation2 className="h-3 w-3 fill-white text-white" />
             <span className="text-[11px] font-black uppercase tracking-tight text-white">{currentRoadName}</span>
          </div>
        </div>

        {/* Speed Limit Sign */}
        <div className="absolute left-6 top-64 z-[110]">
          <AnimatePresence>
            {currentLimit != null && (
              <SpeedSign key="sign" limit={currentLimit} speeding={isSpeeding} />
            )}
          </AnimatePresence>
        </div>

        {/* Recenter Button */}
        <div className="absolute top-[350px] right-6 z-[120]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#00897B] shadow-2xl transition-all"
          >
            <Navigation className="h-6 w-6 fill-[#00897B]" />
          </motion.button>
        </div>

        {/* Problem Button */}
        <div className="absolute top-[420px] right-6 z-[120]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onLogProblem}
            data-testid="problem-btn"
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full shadow-2xl backdrop-blur-md transition-all',
              showMistakeSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            <AlertTriangle className="h-6 w-6" />
          </motion.button>
        </div>
      </div>

      {/* ═══════════ BOTTOM SHEET ═════════════════════════════════════ */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        className="relative z-[100] flex flex-col rounded-t-[32px] bg-white px-6 pb-10 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
      >
        {/* Handle */}
        <div className="mx-auto mb-4 mt-1 h-1.5 w-12 rounded-full bg-slate-200" />

        {/* Stats Section */}
        <div className="flex items-center justify-between pb-6">
          <button 
            onClick={onStop}
            data-testid="stop-tracking-btn"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-[#00897B]">2 min</span>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="text-sm font-bold">{(currentDistance/1000).toFixed(1)} <span className="text-xs font-medium opacity-60">km</span></span>
              <span className="text-slate-300">•</span>
              <span className="text-sm font-bold">{eta}</span>
            </div>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm">
             <MoreVertical className="h-6 w-6" />
          </div>
        </div>

        {/* Instruction Banner */}
        <div className="flex items-start gap-5 border-t border-slate-100 pt-6">
          <div className="mt-1 rounded-xl bg-slate-100 p-2">
            {getInstructionIcon(nextInstruction || '', 'h-7 w-7 text-[#00897B]')}
          </div>
          <div className="flex-1">
            <p className="text-lg font-black leading-tight text-slate-900">
              {nextInstruction}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-400">
              {distanceToNextTurn}
            </p>
          </div>
          <div className="mt-1">
            <Navigation2 className="h-6 w-6 text-[#00897B] fill-[#00897B]" />
          </div>
        </div>

        {/* Driving Stats Row (Compact) */}
        <div className="mt-8 flex items-center justify-around rounded-2xl bg-slate-50 py-4">
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Speed</span>
              <span className={cn('text-xl font-black', isSpeeding ? 'text-red-500' : 'text-slate-900')}>
                {currentSpeed} <span className="text-xs font-bold text-slate-400">km/h</span>
              </span>
           </div>
           <div className="h-8 w-px bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
              <span 
                data-testid="safety-score-value"
                className={cn('text-xl font-black', scoreColor)}
              >
                {safetyScore}%
              </span>
            </div>
           <div className="h-8 w-px bg-slate-200" />
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
              <span className="text-xl font-black text-slate-900">
                {formatTime(elapsedTime)}
              </span>
           </div>
        </div>

        {/* Mistakes Section (only if any) */}
        <AnimatePresence>
          {mistakeGroups.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 flex flex-wrap gap-2 overflow-hidden"
            >
              {mistakeGroups.map((g, i) => (
                <span key={i} className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {g.label} {g.count > 1 && `×${g.count}`}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pause/Resume Toggle */}
        <div className="mt-6 flex gap-3">
           <button 
             onClick={isPaused ? onResume : onPause}
             data-testid="pause-tracking-btn"
             className={cn(
               'flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all shadow-md',
               isPaused ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
             )}
           >
             {isPaused ? <Play className="h-4 w-4 fill-white" /> : <Pause className="h-4 w-4 fill-slate-600" />}
             {isPaused ? 'Resume' : 'Pause Session'}
           </button>
        </div>
      </motion.div>

      {/* Starting Splash */}
      <AnimatePresence>
        {isStartingSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[5000] flex flex-col items-center justify-center bg-slate-950"
          >
            <motion.div 
              key={startingPhase}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="text-[160px] font-black italic leading-none text-white tracking-tighter">
                {startingPhase === 'finding' ? '...' : startingPhase.toUpperCase()}
              </div>
              <p className="mt-4 text-2xl font-black uppercase tracking-[0.4em] text-[#00897B]">
                {startingPhase === 'finding' ? 'Locating' : 'Ready'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NavigationHUD;

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
  X, MoreVertical, Navigation2, Square, Signal
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getTileConfig } from '../../utils/mapTiles';
import { useAppStore } from '../../store/useAppStore';

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
  onExit: () => void;
  showMistakeSuccess: boolean;
  // New props for Google Maps style
  nextInstruction?: string;
  distanceToNextTurn?: string;
  nextRoadName?: string;
  currentRoadName?: string;
  eta?: string;
  signalQuality?: 'excellent' | 'good' | 'poor';
  t: {
    pause: string;
    resume: string;
    stop: string;
    problem: string;
    saved: string;
    safetyScore: string;
    yourDestination: string;
    stopAndSave?: string;
    logMistake?: string;
    exitNav?: string;
    recenter?: string;
    nextRoad?: string;
    score?: string;
    duration?: string;
    etaLabel?: string;
    moreOptions?: string;
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

/* ── Speedometer Gauge ────────────────────────────────────────── */
function SpeedometerGauge({ speed, limit, isSpeeding }: { speed: number; limit: number | null; isSpeeding: boolean }) {
  const percentage = limit ? Math.min((speed / (limit * 1.2)) * 100, 100) : (speed / 120) * 100;
  const strokeColor = isSpeeding ? '#ef4444' : (limit && speed > limit - 10) ? '#f59e0b' : '#10b981';
  
  return (
    <div className="relative flex items-center justify-center h-32 w-32">
      <svg className="h-full w-full -rotate-90 transform">
        <circle
          cx="64" cy="64" r="58"
          stroke="currentColor" strokeWidth="8" fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        <motion.circle
          cx="64" cy="64" r="58"
          stroke={strokeColor} strokeWidth="8" fill="transparent"
          strokeDasharray="364.4"
          initial={{ strokeDashoffset: 364.4 }}
          animate={{ strokeDashoffset: 364.4 - (364.4 * percentage) / 100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 60 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-4xl font-black tracking-tighter', isSpeeding ? 'text-red-500' : 'text-slate-900 dark:text-white')}>
          {speed}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">km/h</span>
      </div>
    </div>
  );
}

/* ── Speed-limit sign (German Straßenschild style) ──────────────── */
function SpeedSign({ limit, speeding, currentSpeed }: { limit: number; speeding: boolean; currentSpeed: number }) {
  const delta = currentSpeed - limit;
  return (
    <div className="flex flex-col items-center gap-2" data-testid="hud-speed-sign">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={cn(
          'flex h-16 w-16 select-none flex-col items-center justify-center rounded-full border-[6px] bg-white shadow-2xl',
          speeding ? 'border-red-600 ring-4 ring-red-600/20' : 'border-red-600'
        )}
      >
        <span className={cn('text-[24px] font-black leading-none', speeding ? 'text-red-600' : 'text-slate-900')}>
          {limit}
        </span>
      </motion.div>
      {speeding && (
        <motion.div
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="rounded-md bg-red-600 px-2 py-0.5 shadow-lg"
        >
          <span className="text-sm font-black text-white">+{delta} km/h</span>
        </motion.div>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export const NavigationHUD: React.FC<NavigationHUDProps> = ({
  gpsPoints, currentSpeed, currentLimit, elapsedTime, currentDistance,
  safetyScore, mistakeGroups, isPaused, destinationCoords, destinationLabel,
  onPause, onResume, onStop, onLogProblem, onExit, showMistakeSuccess,
  nextInstruction = '',
  distanceToNextTurn = '',
  nextRoadName = '',
  currentRoadName = '',
  eta = '',
  signalQuality = 'good',
  t
}) => {
  const darkMode = useAppStore((s) => s.darkMode);
  const tiles = getTileConfig(darkMode);
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
  [gpsPoints, hasRoute]);

  const bearing = useMemo(() =>
    gpsPoints.length > 1
      ? calcBearing(
          gpsPoints[gpsPoints.length - 2].lat, gpsPoints[gpsPoints.length - 2].lng,
          gpsPoints[gpsPoints.length - 1].lat, gpsPoints[gpsPoints.length - 1].lng,
        )
      : 0,
  [gpsPoints]);

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
      {/* ═══════════ TOP INSTRUCTION BAR (single navigation source) ═══ */}
      {(nextInstruction || nextRoadName) && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute left-0 right-0 top-0 z-[100] bg-blue-600 pb-3 pt-10 shadow-lg dark:bg-blue-700"
        >
          <div className="flex items-start px-6">
            <div className="mr-5 flex flex-col items-center">
              {getInstructionIcon(nextInstruction || '')}
              {distanceToNextTurn && (
                <span className="mt-1 text-lg font-bold text-white">{distanceToNextTurn}</span>
              )}
            </div>
            <div className="flex-1 pt-1">
              <span className="text-xs font-bold uppercase tracking-widest text-white/70">{t.nextRoad || 'Next road'}</span>
              {nextRoadName && (
                <h1 className="text-2xl font-bold leading-tight text-white">{nextRoadName}</h1>
              )}
            </div>
          </div>
        </motion.div>
      )}

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
                key={tiles.url}
                attribution={tiles.attribution}
                url={tiles.url}
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
        <div className="absolute bottom-4 left-1/2 z-[110] flex -translate-x-1/2 flex-col items-center gap-1.5">
          {currentRoadName && (
            <div className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-1.5 shadow-xl">
               <Navigation2 className="h-3 w-3 fill-white text-white" />
               <span className="text-sm font-bold uppercase tracking-tight text-white">{currentRoadName}</span>
            </div>
          )}

          {/* Signal Indicator */}
          <div className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest shadow-lg transition-colors',
            signalQuality === 'excellent' ? 'bg-emerald-500 text-white' :
            signalQuality === 'good' ? 'bg-amber-500 text-white' :
            'bg-red-500 text-white animate-pulse'
          )}>
            <Signal className="h-3 w-3" />
            {signalQuality}
          </div>
        </div>

        {/* Speed Limit Sign */}
        <div className="absolute left-6 top-64 z-[110]">
          <AnimatePresence>
            {currentLimit != null && (
              <SpeedSign key="sign" limit={currentLimit} speeding={isSpeeding} currentSpeed={currentSpeed} />
            )}
          </AnimatePresence>
        </div>

        {/* Recenter Button */}
        <div className="absolute top-[350px] right-6 z-[120]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label={t.recenter || 'Recenter map'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-2xl transition-all dark:bg-slate-800 dark:text-blue-400"
          >
            <Navigation className="h-6 w-6 fill-current" />
          </motion.button>
        </div>

        {/* Problem Button (hero action: log a mistake) */}
        <div className="absolute top-[420px] right-6 z-[120]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onLogProblem}
            data-testid="problem-btn"
            aria-label={t.logMistake || 'Log mistake'}
            className={cn(
              'flex min-h-14 items-center justify-center gap-2 rounded-full px-5 shadow-2xl transition-all',
              showMistakeSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
            )}
          >
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm font-bold">
              {showMistakeSuccess ? t.saved : (t.logMistake || 'Log mistake')}
            </span>
          </motion.button>
        </div>
      </div>

      {/* ═══════════ BOTTOM SHEET ═════════════════════════════════════ */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        className="relative z-[100] flex flex-col rounded-t-[32px] bg-white px-6 pb-10 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] dark:bg-slate-900"
      >
        {/* Handle */}
        <div className="mx-auto mb-4 mt-1 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />

        {/* Stats Section */}
        <div className="flex items-center justify-between pb-6">
          <button
            onClick={onExit}
            data-testid="minimize-navigation-btn"
            aria-label={t.exitNav || 'Exit navigation'}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm active:scale-95 transition-transform dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            title={t.exitNav || 'Exit navigation'}
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {(currentDistance/1000).toFixed(1)} <span className="text-lg font-bold">km</span>
            </span>
            {eta && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-sm font-bold uppercase tracking-wider">{t.etaLabel || 'ETA'}</span>
                <span className="text-sm font-bold">{eta}</span>
              </div>
            )}
          </div>

          <div
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
             <MoreVertical className="h-6 w-6" />
          </div>
        </div>

        {/* Driving Stats Row (Compact) */}
        <div className="flex items-center justify-around rounded-3xl border border-slate-100 bg-slate-50 py-6 dark:border-slate-700/60 dark:bg-slate-800/60">
           <div className="flex flex-col items-center">
              <SpeedometerGauge speed={currentSpeed} limit={currentLimit} isSpeeding={isSpeeding} />
           </div>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.score || 'Score'}</span>
              <span
                data-testid="safety-score-value"
                className={cn('text-xl font-bold', scoreColor)}
              >
                {safetyScore}%
              </span>
            </div>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
           <div className="flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.duration || 'Duration'}</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
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
                <span key={i} className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  {g.label} {g.count > 1 && `×${g.count}`}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
           {/* Hero action: log a mistake */}
           <button
             onClick={onLogProblem}
             aria-label={t.logMistake || 'Log mistake'}
             className={cn(
               'flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-md transition-all active:scale-[0.98]',
               showMistakeSuccess
                 ? 'bg-emerald-500 text-white'
                 : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
             )}
           >
             <AlertTriangle className="h-5 w-5" />
             {showMistakeSuccess ? t.saved : (t.logMistake || 'Log mistake')}
           </button>

           <div className="flex gap-3">
             <button
               onClick={isPaused ? onResume : onPause}
               data-testid="pause-tracking-btn"
               className={cn(
                 'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-all shadow-md',
                 isPaused ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
               )}
             >
               {isPaused ? <Play className="h-4 w-4 fill-white" /> : <Pause className="h-4 w-4 fill-current" />}
               {isPaused ? t.resume : t.pause}
             </button>

             <button
               onClick={onStop}
               data-testid="stop-tracking-btn"
               className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 text-sm font-bold text-red-600 transition-all shadow-md active:scale-95 dark:bg-red-900/20 dark:text-red-400"
             >
               <Square className="h-4 w-4 fill-current" />
               {t.stopAndSave || 'Stop & Save'}
             </button>
           </div>
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
              <div className="text-[160px] font-bold italic leading-none text-white tracking-tighter">
                {startingPhase === 'finding' ? '...' : startingPhase.toUpperCase()}
              </div>
              <p className="mt-4 text-2xl font-bold uppercase tracking-[0.4em] text-blue-500">
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

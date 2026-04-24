/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * Tracker.tsx
 * 
 * This is the central component for managing driving sessions.
 * It provides:
 * 1. Live GPS tracking and speed monitoring.
 * 2. Real-time mistake detection (simulated and manual).
 * 3. History of previous sessions with route playback.
 * 4. Manual session logging for users without GPS access.
 */

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrivingSession, DrivingMistake, GPSPoint } from '../../types';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, Clock, Calendar, Car, MapPin, Route, X, Play, 
  Pause, Square, Crown, Pencil, AlertTriangle, Zap, Footprints, Eye, 
  Signal, Search, Undo2, Wind, RefreshCcw, CornerUpRight, 
  Gauge, ChevronRight, ChevronDown, GraduationCap, Lock, Info 
} from 'lucide-react';
import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { EmptyState } from '../common/EmptyState';
import { updateSpatialCache, findNearestFeature, SpatialCacheData } from '../../services/spatialCache';

interface PhotonFeature {
  properties: {
    name: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
  release(): Promise<void>;
}

interface NominatimResponse {
  address: {
    suburb?: string;
    town?: string;
    city?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface DeviceMotionEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

// Leaflet imports for Map rendering
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// @ts-expect-error - Internal Leaflet icon property access
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

/**
 * Small helper to keep the map centered on the latest point during live tracking.
 */
const MapBoundsSimple = ({ points }: { points: { lat: number, lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.panTo([points[points.length-1].lat, points[points.length-1].lng], { animate: true });
    }
  }, [points, map]);
  return null;
};

/**
 * Calculates the bearing (compass direction) between two GPS points.
 * Used to rotate the car icon on the map.
 */
const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;

  const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
            Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

/**
 * Component to fit bounds automatically for RouteMap.
 */
const MapBounds = ({ playbackIndex, polyline, route }: { 
  playbackIndex: number | null, 
  polyline: [number, number][], 
  route: NonNullable<DrivingSession['route']> 
}) => {
  const map = useMap();
  useEffect(() => {
    if (playbackIndex === null) {
      if (polyline.length > 0) {
        const bounds = L.latLngBounds(polyline);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else if (route[playbackIndex]) {
      const point = route[playbackIndex];
      map.panTo([point.lat, point.lng], { animate: true });
    }
  }, [map, playbackIndex, polyline, route]);
  return null;
};

/**
 * Component to display a static route map with playback functionality.
 * Used in the session history list expanded view.
 */
const RouteMap = ({ route, mistakes, language }: { route: NonNullable<DrivingSession['route']>, mistakes?: DrivingMistake[], language: string }) => {
  const isDE = language === 'de';
  
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!route || route.length < 2) return;

    if (isPlaying && playbackIndex !== null) {
      playbackTimeoutRef.current = setTimeout(() => {
        if (playbackIndex < route.length - 1) {
          setPlaybackIndex(playbackIndex + 1);
        } else {
          setIsPlaying(false);
          setPlaybackIndex(null);
        }
      }, 1000); 
    }
    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, [isPlaying, playbackIndex, route]);

  if (!route || route.length < 2) return null;

  const startPoint = [route[0].lat, route[0].lng] as [number, number];
  const endPoint = [route[route.length-1].lat, route[route.length-1].lng] as [number, number];
  const polyline = route.map(p => [p.lat, p.lng] as [number, number]);

  const handleTogglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setPlaybackIndex(0);
      setIsPlaying(true);
    }
  };

  const getMistakeIcon = (type: DrivingMistake['type']) => {
    let color = '#ef4444'; // default red
    if (type === 'harsh_braking') color = '#f97316'; // orange
    if (type === 'rapid_acceleration') color = '#3b82f6'; // blue
    if (type === 'wrong_way') color = '#c026d3'; // vivid magenta
    if (type === 'roundabout_signal') color = '#3b82f6'; // blue
    if (type === 'curve_speeding') color = '#ea580c'; // orange
    if (type === 'aggressive_cornering') color = '#e11d48'; // rose
    if (type === 'right_before_left') color = '#4f46e5'; // indigo
    if (type === 'school_zone_speeding') color = '#d97706'; // amber
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const currentPlaybackPoint = playbackIndex !== null ? [route[playbackIndex].lat, route[playbackIndex].lng] as [number, number] : null;

  const blinkingDotIcon = L.divIcon({
    className: 'playback-dot-icon',
    html: `
      <div style="position: relative; display: flex; items-center; justify-center;">
        <div style="position: absolute; width: 24px; height: 24px; background: rgba(153, 27, 27, 0.4); border-radius: 50%; animation: pulse-dot 2s infinite ease-out;"></div>
        <div style="width: 12px; height: 12px; background: #991b1b; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(153, 27, 27, 0.5); z-index: 10;"></div>
      </div>
      <style>
        @keyframes pulse-dot {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      </style>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 dark:bg-slate-900/80">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <MapPin className="h-3 w-3" />
          {isDE ? 'Streckenverlauf (Echtzeit)' : 'Live Route Trace'}
        </span>
        <button 
          onClick={handleTogglePlayback}
          className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
        >
          {isPlaying ? (
            <><Pause className="h-3 w-3" /> {isDE ? 'Pause' : 'Pause'}</>
          ) : (
            <><Play className="h-3 w-3" /> {isDE ? 'Abspielen' : 'Replay'}</>
          )}
        </button>
      </div>
      <div className="h-[250px] w-full z-0">
        <MapContainer 
          center={startPoint} 
          zoom={15} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
          preferCanvas={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds playbackIndex={playbackIndex} polyline={polyline} route={route} />
          <Polyline positions={polyline} color="#3b82f6" weight={4} opacity={0.7} />
          
          <Marker position={startPoint}>
             <Popup>{isDE ? 'Startpunkt' : 'Start Point'}</Popup>
          </Marker>
          <Marker position={endPoint}>
             <Popup>{isDE ? 'Endpunkt' : 'End Point'}</Popup>
          </Marker>

          {currentPlaybackPoint && (
            <Marker 
              position={currentPlaybackPoint} 
              icon={blinkingDotIcon} 
              zIndexOffset={1000}
            />
          )}

          {mistakes?.map((m, i) => m && m.location && m.type && (
            <Marker key={i} position={[m.location.lat, m.location.lng]} icon={getMistakeIcon(m.type)}>
              <Popup>
                <div className="text-xs font-bold">
                  {m.type === 'speeding' && (isDE ? 'Geschwindigkeitsüberschreitung' : 'Speeding')}
                  {m.type === 'harsh_braking' && (isDE ? 'Starkes Bremsen' : 'Harsh Braking')}
                  {m.type === 'rapid_acceleration' && (isDE ? 'Starke Beschleunigung' : 'Rapid Acceleration')}
                  {m.type === 'shoulder_check' && (isDE ? 'Schulterblick vergessen' : 'Missed Shoulder Check')}
                  {m.type === 'signal' && (isDE ? 'Blinker vergessen' : 'Missed Signal')}
                  {m.type === 'priority' && (isDE ? 'Vorfahrtsfehler' : 'Priority Violation')}
                  {m.type === 'stop_sign' && (isDE ? 'Stoppschild überfahren' : 'Stop Sign Violation')}
                  {m.type === 'wrong_way' && (isDE ? '⛔ Falschfahrer' : '⛔ Wrong Way Driving')}
                  {m.type === 'illegal_turn' && (isDE ? '⛔ Unzulässiges Abbiegen' : '⛔ Illegal Turn / Entry')}
                  {m.type === 'roundabout_signal' && (isDE ? '🔄 Kreisverkehr: Blinker' : '🔄 Roundabout: Signal')}
                  {m.type === 'curve_speeding' && (isDE ? '⚠️ Unangepasste Geschwind.' : '⚠️ Speed in Curve')}
                  {m.type === 'aggressive_cornering' && (isDE ? '🏎️ Aggressives Kurvenfahren' : '🏎️ Aggressive Cornering')}
                  {m.type === 'right_before_left' && (isDE ? '👉 Rechts vor Links' : '👉 Right-Before-Left')}
                  {m.type === 'school_zone_speeding' && (isDE ? '🏫 Schulzone' : '🏫 School Zone')}
                  {m.type === 'other' && (isDE ? 'Sonstiger Fehler' : 'Other Mistake')}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

interface TrackerProps {
  onOpenPaywall?: () => void;
}

export function Tracker({ onOpenPaywall }: TrackerProps) {
  const { 
    language, licenseType, userProgress, addDrivingSession, 
    updateDrivingSession, removeDrivingSession, clearDrivingHistory, 
    setHourlyRate45, isPremium,
    activeSession, startActiveSession, pauseActiveSession, 
    resumeActiveSession, updateActiveSession, stopActiveSession
  } = useAppStore();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  
  const isDE = language === 'de';
  const isUmschreibung = licenseType === 'umschreibung';

  const normalMinutes = userProgress.drivingSessions
    .filter(s => s.type === 'normal')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalSpending = userProgress.drivingSessions
    .reduce((sum, s) => {
      const duration = Number(s.duration) || 0;
      const rate = Number(userProgress.hourlyRate45) || 0;
      return sum + (duration / 45) * rate;
    }, 0);

  const getMistakeLabel = useCallback((type: DrivingMistake['type']) => {
    const labels: Record<string, { de: string, en: string }> = {
      speeding: { de: 'Geschw.-Überschreitung', en: 'Speeding' },
      harsh_braking: { de: 'Starkes Bremsen', en: 'Harsh Braking' },
      rapid_acceleration: { de: 'Starke Beschleunigung', en: 'Rapid Accel.' },
      shoulder_check: { de: 'Schulterblick vergessen', en: 'Missed Shoulder Check' },
      signal: { de: 'Blinker vergessen', en: 'Missed Signal' },
      priority: { de: 'Vorfahrtsfehler', en: 'Priority Violation' },
      stop_sign: { de: 'Stoppschild überfahren', en: 'Stop Sign Violation' },
      wrong_way: { de: 'Falschfahrer', en: 'Wrong Way Driving' },
      illegal_turn: { de: 'Unzulässiges Abbiegen', en: 'Illegal Turn' },
      idling: { de: 'Motor laufen gelassen', en: 'Engine Idling' },
      roundabout_signal: { de: 'Kreisverkehr Blinker', en: 'Roundabout Signal' },
      curve_speeding: { de: 'Geschw. in Kurve', en: 'Curve Speeding' },
      aggressive_cornering: { de: 'Aggressives Kurvenfahren', en: 'Aggressive Cornering' },
      right_before_left: { de: 'Rechts vor Links', en: 'Right-Before-Left' },
      school_zone_speeding: { de: 'Schulzone Speeding', en: 'School Zone Spd.' },
      other: { de: 'Sonstiger Fehler', en: 'Other Mistake' }
    };
    return isDE ? labels[type]?.de || type : labels[type]?.en || type;
  }, [isDE]);

  const getTypeIcon = (type: DrivingSession['type']) => {
    switch (type) {
      case 'nacht': return <Clock className="h-4 w-4" />;
      case 'autobahn': return <Zap className="h-4 w-4" />;
      case 'ueberland': return <Wind className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: DrivingSession['type']) => {
    switch (type) {
      case 'nacht': return isDE ? 'Nachtfahrt' : 'Night';
      case 'autobahn': return isDE ? 'Autobahn' : 'Highway';
      case 'ueberland': return isDE ? 'Überland' : 'Country';
      default: return isDE ? 'Übungsstunde' : 'Practice';
    }
  };

  const formatDate = (dateStr: string, showTime: boolean = false) => {
    if (!dateStr) return '---';
    
    // Try parsing directly (works for ISO strings like '2026-04-22T14:30:00Z')
    let d = new Date(dateStr);
    
    // If invalid (can happen with simple 'YYYY-MM-DD' in some browsers), try normalization
    if (isNaN(d.getTime())) {
      const normalizedDate = dateStr.replace(/-/g, '/').split('T')[0];
      d = new Date(normalizedDate);
    }
    
    // Final fallback: if still invalid, return raw but try to truncate if it's an ISO string
    if (isNaN(d.getTime())) {
      return dateStr.split('T')[0];
    }

    const datePart = d.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    if (showTime && dateStr.includes('T')) {
      const timePart = d.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${datePart} • ${timePart}`;
    }

    return datePart;
  };


  const getTypeColor = (type: DrivingSession['type']) => {
    switch (type) {
      case 'nacht': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400';
      case 'autobahn': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'ueberland': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const TRIAL_LIMIT = 3; 
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(userProgress.hourlyRate45.toString());
  const [newSession, setNewSession] = useState<Partial<DrivingSession>>({
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    type: 'normal' as DrivingSession['type'],
    notes: '',
    instructorName: '',
    totalDistance: undefined,
    locationSummary: ''
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [gpsPoints, setGpsPoints] = useState<NonNullable<DrivingSession['route']>>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);
  const [currentMistakes, setCurrentMistakes] = useState<DrivingMistake[]>([]);
  const [activeStopSign, setActiveStopSign] = useState<{lat: number, lng: number, id: string} | null>(null);
  const [hasStoppedAtSign, setHasStoppedAtSign] = useState(false);
  const lastWrongWayLogRef = useRef<number>(0);
  const lastIllegalTurnLogRef = useRef<number>(0);
  const stationaryStartRef = useRef<number | null>(null);
  const lastIdlingLogRef = useRef<number>(0);
  const lastRvlCheckRef = useRef<number>(0);
  // --- PERSISTENT REFS ---
  // Used to maintain data across simulation loops or component re-renders
  const cumulativeMistakesRef = useRef<DrivingMistake[]>([]);
  const cumulativeRouteRef = useRef<GPSPoint[]>([]);
  const lastMotionLogRef = useRef<number>(0);
  const lastSchoolCheckRef = useRef<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchRef = useRef<number | null>(null);
  const limitCheckRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationStepRef = useRef<number>(0);
  const [showManualLog, setShowManualLog] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [targetDestination, setTargetDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);

  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Release wake lock on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(console.error);
      }
    };
  }, []);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinel> } }).wakeLock.request('screen');
      } catch (err) {
        console.warn('[Tracker] Wake Lock error:', err);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn('[Tracker] Wake Lock release error:', err);
      }
    }
  };
  
  // Spatial Worker Instance
  const spatialWorker = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new Worker(new URL('../../workers/spatial.worker.ts', import.meta.url));
    }
    return null;
  }, []);

  const [spatialCache, setSpatialCache] = useState<SpatialCacheData | null>(null);
  const lastCacheUpdateRef = useRef<number>(0);

  /**
   * Centralized logging helper for driving mistakes.
   * Updates both UI state and persistent ref.
   */
  const logMistake = useCallback((mistake: DrivingMistake) => {
    cumulativeMistakesRef.current = [...cumulativeMistakesRef.current, mistake];
    setCurrentMistakes(prev => [...prev, mistake]);
    updateActiveSession({ mistakes: cumulativeMistakesRef.current });
  }, [updateActiveSession]);

  /**
   * Centralized logging helper for GPS points.
   */
  const logRoutePoint = useCallback((point: GPSPoint) => {
    cumulativeRouteRef.current = [...(cumulativeRouteRef.current || []), point];
    setGpsPoints(prev => [...prev, point]);
    updateActiveSession({ route: cumulativeRouteRef.current });
  }, [updateActiveSession]);

  const handleEditOpen = useCallback((session: DrivingSession) => {
    setEditingSessionId(session.id);
    setNewSession({
      date: session.date,
      duration: session.duration,
      type: session.type,
      notes: session.notes || '',
      instructorName: session.instructorName || '',
      totalDistance: session.totalDistance,
      locationSummary: session.locationSummary || '',
      route: session.route,
      mistakes: session.mistakes,
    });
    setShowAddForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowAddForm(false);
    setEditingSessionId(null);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      duration: 45,
      type: 'normal',
      notes: '',
      instructorName: '',
      totalDistance: undefined,
      locationSummary: '',
    });
  }, []);

  // --- HYDRATION / RECOVERY ---
  useEffect(() => {
    if (activeSession && !isTimerRunning) {
      setElapsedTime(Math.floor((Date.now() - (activeSession.startTime || Date.now()) - activeSession.pausedDuration) / 1000));
      setCurrentDistance(activeSession.currentDistance);
      setGpsPoints(activeSession.route);
      setCurrentMistakes(activeSession.mistakes);
      cumulativeMistakesRef.current = activeSession.mistakes;
      cumulativeRouteRef.current = activeSession.route;
      setIsTimerRunning(!activeSession.isPaused);
      setIsSimulationMode(activeSession.isSimulation);
      setTargetDestination(activeSession.targetDestination || '');
      setDestinationCoords(activeSession.destinationCoords || null);
      
      if (!activeSession.isPaused) {
        requestWakeLock();
      }
    }
  }, [activeSession, isTimerRunning]);

  // Sync distance to global state
  useEffect(() => {
    if (isTimerRunning && Math.abs(currentDistance - (activeSession?.currentDistance || 0)) > 0.1) {
      updateActiveSession({ currentDistance });
    }
  }, [currentDistance, isTimerRunning, activeSession, updateActiveSession]);

  // Resync timer on visibility change (when user unlocks phone)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTimerRunning && activeSession?.startTime) {
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - activeSession.startTime - activeSession.pausedDuration) / 1000);
        setElapsedTime(Math.max(0, elapsedSinceStart));
        
        // Re-request wake lock if we lost it
        if (!activeSession.isPaused) {
          requestWakeLock();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerRunning, activeSession]);

  const handleAddSession = useCallback(() => {
    if (!newSession.duration || newSession.duration <= 0) {
      toast.error(isDE ? 'Bitte Dauer eingeben' : 'Please enter duration');
      return;
    }

    if (editingSessionId) {
      updateDrivingSession(editingSessionId, newSession);
      toast.success(isDE ? 'Fahrt aktualisiert' : 'Session updated');
    } else {
      addDrivingSession(newSession as Omit<DrivingSession, 'id'>);
      toast.success(isDE ? 'Fahrt gespeichert' : 'Session saved');
    }
    handleCloseForm();
  }, [newSession, editingSessionId, isDE, updateDrivingSession, addDrivingSession, handleCloseForm]);

  const handleRemoveSession = useCallback((id: string) => {
    if (window.confirm(isDE ? 'Möchtest du diese Fahrt wirklich löschen?' : 'Are you sure you want to delete this session?')) {
      removeDrivingSession(id);
      toast.success(isDE ? 'Fahrt gelöscht' : 'Session deleted');
    }
  }, [isDE, removeDrivingSession]);

  // --- AUTOCOMPLETE: SEARCH SUGGESTIONS ---
  // Fetches address suggestions as the user types a destination
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Delay search until 3+ characters are typed
      if (targetDestination.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const langCode = language === 'de' ? 'de' : 'en';
        // Add geographical bias (prioritize results near user)
        const biasLat = gpsPoints.length > 0 ? gpsPoints[gpsPoints.length - 1].lat : 52.52;
        const biasLon = gpsPoints.length > 0 ? gpsPoints[gpsPoints.length - 1].lng : 13.405;
        
        const response = await fetch(
          `https://photon.komoot.io/api?q=${encodeURIComponent(targetDestination)}&limit=5&lang=${langCode}&lat=${biasLat}&lon=${biasLon}`
        );
        const data = await response.json();
        if (data.features) {
          setSuggestions(data.features);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('[Tracker] Error fetching suggestions:', error);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300); // Debounce to save API calls
    return () => clearTimeout(timer);
  }, [targetDestination, language, gpsPoints]);

  // Click outside listener to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCarMarkerIcon = (rotation: number) => {
    return L.divIcon({
      className: 'car-marker-icon',
      html: `
        <div style="transform: rotate(${rotation}deg); transition: transform 0.5s ease; width: 34px; height: 18px; background: #3b82f6; border: 2px solid white; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; position: relative; overflow: visible;">
          <!-- Body Detail -->
          <div style="position: absolute; right: 6px; width: 10px; height: 12px; background: #1e293b; border-radius: 1px; opacity: 0.8;"></div>
          <!-- Headlights -->
          <div style="position: absolute; right: -3px; top: 1px; width: 5px; height: 4px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 5px #fef08a;"></div>
          <div style="position: absolute; right: -3px; bottom: 1px; width: 5px; height: 4px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 5px #fef08a;"></div>
          <!-- Brake Lights -->
          <div style="position: absolute; left: -2px; top: 2px; width: 4px; height: 4px; background: #ef4444; border-radius: 1px;"></div>
          <div style="position: absolute; left: -2px; bottom: 2px; width: 4px; height: 4px; background: #ef4444; border-radius: 1px;"></div>
        </div>
      `,
      iconSize: [34, 18],
      iconAnchor: [17, 9]
    });
  };

  /**
   * Renders a custom 🏁 finish flag marker.
   */
  const getFlagMarkerIcon = () => {
    return L.divIcon({
      className: 'flag-marker-icon',
      html: `
        <div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));">
          <div style="background: white; border: 3px solid #1e293b; border-radius: 12px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 20px; animation: bounce-flag 2s infinite ease-in-out;">
            🏁
          </div>
        </div>
        <style>
          @keyframes bounce-flag {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
        </style>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  };

  const checkNearbyStopSign = useCallback(async (lat: number, lng: number) => {
    if (spatialCache) {
      spatialWorker?.postMessage({
        type: 'findNearest',
        data: {
          position: { lat, lng },
          features: spatialCache.features,
          tagFilter: { key: 'highway', value: 'stop' }
        }
      });
      return;
    }

    try {
      const query = `[out:json];node(around:25,${lat},${lng})["highway"="stop"];out;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const sign = data.elements[0];
        if (!activeStopSign || activeStopSign.id !== sign.id.toString()) {
          setActiveStopSign({
            lat: sign.lat,
            lng: sign.lon,
            id: sign.id.toString()
          });
          setHasStoppedAtSign(false);
          toast(isDE ? 'Stoppschild voraus!' : 'Stop Sign Ahead!', { icon: <Info className="h-4 w-4" />, id: 'stop-sign-alert' });
        }
      }
    } catch (e) {
      console.error('[Tracker] Stop sign fetch failed:', e);
    }
  }, [activeStopSign, isDE, spatialCache, spatialWorker]);

  // Handle worker responses for findNearest
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.type === 'findNearest' && e.data.result) {
        const feature = e.data.result;
        const tagFilter = e.data.tagFilter;

        if (tagFilter?.key === 'highway' && tagFilter?.value === 'stop') {
          if (!activeStopSign || activeStopSign.id !== feature.id.toString()) {
            setActiveStopSign({
              lat: feature.lat,
              lng: feature.lon,
              id: feature.id.toString()
            });
            setHasStoppedAtSign(false);
            toast(isDE ? 'Stoppschild voraus!' : 'Stop Sign Ahead!', { icon: <Info className="h-4 w-4" />, id: 'stop-sign-alert' });
          }
        }
      }
    };
    spatialWorker?.addEventListener('message', onMessage);
    return () => spatialWorker?.removeEventListener('message', onMessage);
  }, [spatialWorker, activeStopSign, isDE]);

  // Update spatial cache on movement
  useEffect(() => {
    if (!isTimerRunning || gpsPoints.length === 0) return;
    const lastPoint = gpsPoints[gpsPoints.length - 1];
    
    if (Date.now() - lastCacheUpdateRef.current > 30000) {
      lastCacheUpdateRef.current = Date.now();
      updateSpatialCache(lastPoint.lat, lastPoint.lng).then(setSpatialCache);
    }
  }, [gpsPoints, isTimerRunning]);

  const checkWrongWayDriving = useCallback(async (lat: number, lng: number, travelBearing: number) => {
    if (Date.now() - lastWrongWayLogRef.current < 30000) return;
    if (currentSpeed < 10) return;

    if (spatialCache) {
      // Find the nearest way in the cache that is oneway or a residential street
      const nearestWay = findNearestFeature(lat, lng, spatialCache, (f) => f.type === 'way' && (f.tags?.oneway === 'yes' || !!f.tags?.highway), 0.03);
      if (nearestWay && nearestWay.geometry) {
        spatialWorker?.postMessage({
          type: 'wrongWayCheck',
          data: { travelBearing, roadNodes: nearestWay.geometry }
        });
      }
      return;
    }

    try {
      const query = `[out:json];way(around:20,${lat},${lng})[oneway=yes];out geom 1;`;
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await response.json();

      if (!data.elements || data.elements.length === 0) return;

      const way = data.elements[0];
      const nodes = way.geometry as { lat: number; lon: number }[];
      if (!nodes || nodes.length < 2) return;

      // Delegate the math to the worker
      spatialWorker?.postMessage({
        type: 'wrongWayCheck',
        data: { travelBearing, roadNodes: nodes }
      });

      const onWorkerMessage = (e: MessageEvent) => {
        if (e.data.type === 'wrongWayCheck' && e.data.result === true) {
          lastWrongWayLogRef.current = Date.now();
          toast.error(
            isDE ? '⛔ Falschfahrer erkannt! Sofort anhalten!' : '⛔ Wrong Way! Stop immediately!',
            { position: 'bottom-center', duration: 6000 }
          );
          logMistake({
            type: 'wrong_way',
            timestamp: Date.now(),
            location: { lat, lng }
          });
        }
      };

      spatialWorker?.addEventListener('message', onWorkerMessage, { once: true });
    } catch (e) {
      console.error('[Tracker] Wrong way check error:', e);
    }
  }, [currentSpeed, isDE, logMistake, spatialWorker, spatialCache]);

  const checkIllegalTurn = useCallback(async (lat: number, lng: number) => {
    if (Date.now() - lastIllegalTurnLogRef.current < 20000) return;
    if (currentSpeed < 5) return;

    try {
      const query = `[out:json];way(around:15,${lat},${lng})[~"^(access|motor_vehicle|footway)$"~"^(no|private|pedestrian)$"];out tags;`;
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        lastIllegalTurnLogRef.current = Date.now();
        const tag = data.elements[0].tags;
        const reason = tag.footway === 'pedestrian' ? (isDE ? 'Fußgängerzone' : 'Pedestrian Zone') 
                     : tag.access === 'private' ? (isDE ? 'Privatweg' : 'Private Access')
                     : (isDE ? 'Einfahrt verboten' : 'Illegal Turn / Entry');

        toast.error(
          `${isDE ? '⛔ Unzulässiges Abbiegen!' : '⛔ Illegal Turn!'} (${reason})`,
          { position: 'bottom-center', duration: 6000 }
        );

        logMistake({
          type: 'illegal_turn',
          timestamp: Date.now(),
          location: { lat, lng }
        });
      }
    } catch (error) {
      console.error('[Tracker] Illegal turn check failed:', error);
    }
  }, [currentSpeed, isDE, logMistake]);

  const checkRightBeforeLeft = useCallback(async (lat: number, lng: number) => {
    if (Date.now() - lastRvlCheckRef.current < 30000) return;
    if (currentSpeed < 10) return;

    try {
      const query = `[out:json];way(around:15,${lat},${lng})["highway"~"residential|living_street"]->.w;node(w.w)(around:10,${lat},${lng})->.n;way(bn.n)["highway"~"residential|living_street"]->.i;(.i; - .w;);out count;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(4000) });
      const data = await response.json();
      
      if (data.count && data.count > 0) {
        if (currentSpeed > 22) { 
          lastRvlCheckRef.current = Date.now();
          toast.error(
            isDE ? '👉 Rechts vor Links beachten! (Zu schnell)' : '👉 Watch Right-Before-Left! (Too fast)',
            { position: 'bottom-center', duration: 7000 }
          );
          logMistake({
            type: 'right_before_left',
            timestamp: Date.now(),
            location: { lat, lng },
            speed: currentSpeed
          });
        }
      }
    } catch (error) {
      console.error('[Tracker] RVL check failed:', error);
    }
  }, [currentSpeed, isDE, logMistake]);

  const checkSchoolArea = useCallback(async (lat: number, lng: number) => {
    if (Date.now() - lastSchoolCheckRef.current < 30000) return;
    
    try {
      const query = `[out:json];(node(around:60,${lat},${lng})["amenity"~"school|kindergarten"];node(around:60,${lat},${lng})["leisure"="playground"];);out count;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(4000) });
      const data = await response.json();
      
      if (data.count && data.count > 0) {
        if (currentSpeed > 32) {
          lastSchoolCheckRef.current = Date.now();
          toast.error(
            isDE ? '🏫 Vorsicht: Schulzone / Spielplatz! (Max 30 empfohlen)' : '🏫 Caution: School Zone / Playground! (Max 30 recommended)',
            { position: 'bottom-center', duration: 7000, icon: '🏫' }
          );
          logMistake({
            type: 'school_zone_speeding',
            speed: currentSpeed,
            limit: 30,
            timestamp: Date.now(),
            location: { lat, lng }
          });
        }
      }
    } catch (error) {
      console.error('[Tracker] School check failed:', error);
    }
  }, [currentSpeed, isDE, logMistake]);

  const fetchSpeedLimit = useCallback(async (lat: number, lng: number) => {
    try {
      const query = `[out:json];way(around:30,${lat},${lng})[maxspeed];out tags;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const limit = parseInt(data.elements[0].tags.maxspeed);
        if (!isNaN(limit)) {
          setCurrentLimit(limit);
          return limit;
        }
      }
      return null;
    } catch (error) {
      console.error('[Tracker] Speed limit fetch failed:', error);
      return null;
    }
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearchDestination = async () => {
    if (!targetDestination.trim()) return;
    setIsSearchingDestination(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(targetDestination)}&format=json&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        setDestinationCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        toast.success(isDE ? 'Ziel gefunden!' : 'Destination found!');
      } else {
        toast.error(isDE ? 'Ziel nicht gefunden' : 'Destination not found');
      }
    } catch (e) {
      console.error('[Tracker] Reverse geocoding search failed:', e);
      toast.error(isDE ? 'Suche fehlgeschlagen' : 'Search failed');
    } finally {
      setIsSearchingDestination(false);
    }
  };

  const handleSaveRate = () => {
    const rate = parseFloat(tempRate) || 0;
    if (rate <= 0) {
      toast.error(isDE ? 'Bitte geben Sie einen gültigen Betrag ein' : 'Please enter a valid amount');
      return;
    }
    setHourlyRate45(rate);
    setIsEditingRate(false);
    toast.success(isDE ? 'Stundensatz aktualisiert!' : 'Rate updated!');
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      if (!isSimulationMode) {
        limitCheckRef.current = setInterval(() => {
          setGpsPoints(currentPoints => {
            if (currentPoints.length > 1) {
              const lastPoint = currentPoints[currentPoints.length - 1];
              const prevPoint = currentPoints[currentPoints.length - 2];
              fetchSpeedLimit(lastPoint.lat, lastPoint.lng);
              checkNearbyStopSign(lastPoint.lat, lastPoint.lng);
              const bearing = calculateBearing(prevPoint.lat, prevPoint.lng, lastPoint.lat, lastPoint.lng);
              checkWrongWayDriving(lastPoint.lat, lastPoint.lng, bearing);
              checkIllegalTurn(lastPoint.lat, lastPoint.lng);
              checkRightBeforeLeft(lastPoint.lat, lastPoint.lng);
              checkSchoolArea(lastPoint.lat, lastPoint.lng);
            }
            return currentPoints;
          });
        }, 10000);

        if ('geolocation' in navigator && isPremium) {
          watchRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude: lat, longitude: lng, speed } = position.coords;
              const newPoint = { lat, lng, timestamp: Date.now() };
              
              setGpsPoints(prev => {
                const lastPoint = prev[prev.length - 1];
                let currentKmh = 0;

                if (speed !== null) {
                  currentKmh = Math.round(speed * 3.6);
                } else if (lastPoint) {
                  const distKm = calculateDistance(lastPoint.lat, lastPoint.lng, lat, lng);
                  const timeHours = (newPoint.timestamp - lastPoint.timestamp) / 3600000;
                  if (timeHours > 0) {
                    currentKmh = Math.round(distKm / timeHours);
                  }
                }

                setCurrentSpeed(currentKmh);

                if (lastPoint) {
                  const dist = calculateDistance(lastPoint.lat, lastPoint.lng, lat, lng);
                  if (dist > 0.005) {
                    setCurrentDistance(d => d + dist);
                    logRoutePoint(newPoint);
                    return [...prev, newPoint];
                  }
                  return prev;
                }
                logRoutePoint(newPoint);
                return [newPoint];
              });
            },
            (error) => {
              console.error('[Tracker] GPS Error:', error);
              if (error.code === 1) {
                toast.error(isDE ? 'Standortzugriff verweigert. Bitte aktiviere GPS in den Einstellungen.' : 'Location access denied. Please enable GPS in settings.');
              } else {
                toast.error(isDE ? 'GPS-Fehler. Bitte überprüfe deine Verbindung.' : 'GPS error. Please check your connection.');
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }

      const handleMotion = (event: DeviceMotionEvent) => {
        if (!isPremium || isSimulationMode) return;
        
        const acc = event.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        const totalAcc = Math.sqrt(x*x + y*y + z*z);

        if ((totalAcc > 4.0 || Math.abs(x) > 3.0) && Date.now() - lastMotionLogRef.current > 10000) {
          lastMotionLogRef.current = Date.now();
          
          navigator.geolocation.getCurrentPosition((pos) => {
            const isCornering = Math.abs(x) > 3.0 && Math.abs(x) > Math.abs(y);
            const isBraking = !isCornering && y < -3.0;
            
            let type: DrivingMistake['type'] = 'rapid_acceleration';
            let messageDE = 'Starke Beschleunigung erkannt!';
            let messageEN = 'Rapid acceleration detected!';

            if (isCornering) {
              type = 'aggressive_cornering';
              messageDE = '🏎️ Fliehkraft: Aggressives Kurvenfahren!';
              messageEN = '🏎️ High G-Force: Aggressive Cornering!';
            } else if (isBraking) {
              type = 'harsh_braking';
              messageDE = 'Starkes Bremsen erkannt!';
              messageEN = 'Harsh braking detected!';
            }
            
            logMistake({
              type,
              timestamp: Date.now(),
              location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
            });

            toast.error(isDE ? messageDE : messageEN, { position: 'bottom-center', duration: 4000 });
          });
        }
      };

      window.addEventListener('devicemotion', handleMotion as EventListener);
      return () => {
        window.removeEventListener('devicemotion', handleMotion as EventListener);
        if (timerRef.current) clearInterval(timerRef.current);
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        if (limitCheckRef.current) clearInterval(limitCheckRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (limitCheckRef.current) clearInterval(limitCheckRef.current);
    }
  }, [isTimerRunning, isSimulationMode, fetchSpeedLimit, checkNearbyStopSign, checkWrongWayDriving, checkIllegalTurn, checkRightBeforeLeft, checkSchoolArea, isPremium, isDE, logRoutePoint, logMistake, currentSpeed]);

  useEffect(() => {
    if (!isTimerRunning || gpsPoints.length === 0) return;

    const lastPoint = gpsPoints[gpsPoints.length - 1];

    if (activeStopSign) {
      if (currentSpeed === 0) {
        setHasStoppedAtSign(true);
      }

      const distFromSign = calculateDistance(lastPoint.lat, lastPoint.lng, activeStopSign.lat, activeStopSign.lng);
      
      if (distFromSign > 0.03 && gpsPoints.length > 3) { 
        if (!hasStoppedAtSign) {
          toast.error(isDE ? 'Stoppschild überfahren!' : 'Stop Sign Violation!', { position: 'bottom-center' });
          logMistake({
            type: 'stop_sign',
            timestamp: Date.now(),
            location: { lat: activeStopSign.lat, lng: activeStopSign.lng }
          });
        }
        setActiveStopSign(null);
        setHasStoppedAtSign(false);
      }
    }

    if (currentLimit && currentSpeed > currentLimit + 5) {
      setCurrentMistakes(prev => {
        const lastMistake = prev[prev.length - 1];
        if (!lastMistake || (Date.now() - lastMistake.timestamp > 30000) || lastMistake.type !== 'speeding') {
          toast.error(isDE ? `Geschwindigkeitsüberschreitung! (Limit: ${currentLimit})` : `Speeding! (Limit: ${currentLimit})`, { position: 'bottom-center' });
          
          const mistakeObj: DrivingMistake = {
            type: 'speeding',
            speed: currentSpeed,
            limit: currentLimit,
            timestamp: Date.now(),
            location: { lat: lastPoint.lat, lng: lastPoint.lng }
          };
          
          logMistake(mistakeObj);
          return [...prev, mistakeObj];
        }
        return prev;
      });
    }

    const IDLING_THRESHOLD = isSimulationMode ? 15000 : 60000;
    
    if (currentSpeed === 0) {
      if (stationaryStartRef.current === null) {
        stationaryStartRef.current = Date.now();
      } else {
        const idlingDuration = Date.now() - stationaryStartRef.current;
        const timeSinceLastLog = Date.now() - lastIdlingLogRef.current;

        if (idlingDuration > IDLING_THRESHOLD && timeSinceLastLog > 120000) {
          toast.error(isDE ? 'Umweltschutz: Motor abstellen!' : 'Eco: Stop Engine!', { 
            position: 'bottom-center',
            icon: '🌱'
          });
          
          logMistake({
            type: 'idling',
            timestamp: Date.now(),
            location: { lat: lastPoint.lat, lng: lastPoint.lng }
          });
          
          lastIdlingLogRef.current = Date.now();
        }
      }
    } else {
      stationaryStartRef.current = null;
      lastIdlingLogRef.current = 0;
    }
  }, [gpsPoints, currentSpeed, currentLimit, activeStopSign, hasStoppedAtSign, isTimerRunning, isDE, isSimulationMode, logMistake]);

  const handleStartTimer = async () => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    setGpsPoints([]);
    setCurrentMistakes([]);
    cumulativeMistakesRef.current = [];
    cumulativeRouteRef.current = [];
    setCurrentDistance(0);
    setElapsedTime(0);
    
    // Global session start
    startActiveSession(
      newSession.type || 'normal', 
      isSimulationMode, 
      targetDestination, 
      destinationCoords
    );

    requestWakeLock();
    lastWrongWayLogRef.current = 0;
    lastIllegalTurnLogRef.current = 0;
    stationaryStartRef.current = null;
    lastIdlingLogRef.current = 0;

    const MotionEvent = DeviceMotionEvent as unknown as DeviceMotionEventStatic;
    if (typeof MotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await MotionEvent.requestPermission();
        if (permissionState !== 'granted') {
          toast.error(isDE ? 'Bewegungssensoren-Zugriff verweigert' : 'Motion sensor access denied');
        }
      } catch (e) {
        console.error('Motion permission error', e);
      }
    }

    if (isSimulationMode) {
      const mockPoints = [
        { lat: 52.5200, lng: 13.4050, speed: 20, limit: 50 },
        { lat: 52.5205, lng: 13.4055, speed: 15, limit: 50 },
        { lat: 52.5210, lng: 13.4060, speed: 25, limit: 50 },
        { lat: 52.5220, lng: 13.4075, speed: 40, limit: 50 },
        { lat: 52.5230, lng: 13.4090, speed: 55, limit: 50 },
        { lat: 52.5225, lng: 13.4150, speed: 15, limit: 30 },
        { lat: 52.5220, lng: 13.4155, speed: 20, limit: 30 },
        { lat: 52.5215, lng: 13.4150, speed: 20, limit: 30 },
        { lat: 52.5212, lng: 13.4140, speed: 25, limit: 30 },
        { lat: 52.5210, lng: 13.4130, speed: 35, limit: 50 },
        { lat: 52.5205, lng: 13.4120, speed: 50, limit: 50 },
        { lat: 52.5200, lng: 13.4110, speed: 50, limit: 50 },
        { lat: 52.5190, lng: 13.4100, speed: 30, limit: 50 },
        { lat: 52.5180, lng: 13.4090, speed: 40, limit: 50 },
        { lat: 52.5175, lng: 13.4080, speed: 45, limit: 50 },
        { lat: 52.5170, lng: 13.4070, speed: 45, limit: 50 },
        { lat: 52.5233, lng: 13.4095, speed: 0, limit: 50 },
        { lat: 52.5233, lng: 13.4095, speed: 0, limit: 50 },
        { lat: 52.5233, lng: 13.4095, speed: 0, limit: 50 },
        { lat: 52.5233, lng: 13.4095, speed: 0, limit: 50 },
        { lat: 52.5240, lng: 13.4110, speed: 35, limit: 30 },
        { lat: 52.5242, lng: 13.4115, speed: 32, limit: 30 },
        { lat: 52.5245, lng: 13.4120, speed: 32, limit: 30 },
        { lat: 52.5248, lng: 13.4125, speed: 35, limit: 30 },
        { lat: 52.5255, lng: 13.4135, speed: 45, limit: 50 },
        { lat: 52.5258, lng: 13.4140, speed: 42, limit: 50 },
        { lat: 52.5262, lng: 13.4150, speed: 40, limit: 50 },
        { lat: 52.5265, lng: 13.4160, speed: 50, limit: 50 },
        { lat: 52.5240, lng: 13.4120, speed: 30, limit: 30 },
        { lat: 52.5235, lng: 13.4135, speed: 15, limit: 30 },
        { lat: 52.5230, lng: 13.4145, speed: 10, limit: 30 },
        { lat: 52.5228, lng: 13.4148, speed:  5, limit: 30 },
      ];

      simulationStepRef.current = 0;
      simulationIntervalRef.current = setInterval(() => {
        const currentStep = simulationStepRef.current;
        
        if (currentStep >= mockPoints.length) {
          simulationStepRef.current = 0;
          setGpsPoints([]);
          setActiveStopSign(null);
          setHasStoppedAtSign(false);
          lastIllegalTurnLogRef.current = 0;
          lastWrongWayLogRef.current = 0;
          toast(isDE ? 'Simulation wird wiederholt...' : 'Simulation looping...', { icon: '🔄' });
          return;
        }

        const point = mockPoints[currentStep];
        const newTrackPoint = { lat: point.lat, lng: point.lng, timestamp: Date.now() };
        setGpsPoints(prev => [...prev, newTrackPoint]);
        cumulativeRouteRef.current = [...cumulativeRouteRef.current, newTrackPoint];
        setCurrentSpeed(point.speed);
        setCurrentLimit(point.limit);

        if (currentStep === 0) {
          setActiveStopSign({ lat: 52.52005, lng: 13.40505, id: 'mock-stop-1' });
          toast(isDE ? '🛑 Stoppschild voraus!' : '🛑 Stop Sign Ahead!', { id: 'mock-stop-toast' });
        }

        if (currentStep === 28) {
          toast.dismiss();
          toast.error(isDE ? '⛔ FALSCHFAHRER ERKANNT! Sofort anhalten!' : '⛔ WRONG WAY! Stop immediately!', { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'wrong_way', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 30) {
          toast.error(isDE ? '⛔ Unzulässiges Abbiegen! (Fußgängerzone)' : '⛔ Illegal Turn! (Pedestrian Zone)', { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'illegal_turn', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 8) {
          toast.error(isDE ? '⛔ Kreisverkehr: Blinker beim Ausfahren vergessen!' : '⛔ Roundabout: Missed Exit Signal!', { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'roundabout_signal', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }
        
        if (currentStep === 11) {
          toast.error(isDE ? '⚠️ Unangepasste Geschwindigkeit (Kurve)!' : '⚠️ Inappropriate Speed (Curve)!', { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'curve_speeding', speed: point.speed, limit: 30, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }
        
        if (currentStep === 14) {
          toast.error(isDE ? '🏎️ Fliehkraft: Aggressives Kurvenfahren / Spurwechsel!' : '🏎️ High G-Force: Aggressive Cornering!', { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'aggressive_cornering', speed: point.speed, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 22) {
          toast.error(isDE ? '👉 Rechts vor Links missachtet! (Wohngebiet)' : '👉 Right-Before-Left Violation! (Residential)', { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'right_before_left', speed: point.speed, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 25) {
          toast.error(isDE ? '🏫 Zu schnell in Schulzone! (Max 30 empfohlen)' : '🏫 Speeding in School Zone! (Max 30 recommended)', { position: 'bottom-center', duration: 8000, icon: '🏫' });
          logMistake({ type: 'school_zone_speeding', speed: point.speed, limit: 30, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 19) {
          toast.error(isDE ? '🌱 Umweltschutz: Motor abstellen bei längerem Halt!' : '🌱 Eco: Stop engine during long stationary periods!', { position: 'bottom-center', duration: 8000, icon: '🌱' });
          logMistake({ type: 'idling', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep > 0) {
          const prev = mockPoints[currentStep - 1];
          const dist = calculateDistance(prev.lat, prev.lng, point.lat, point.lng);
          setCurrentDistance(d => d + (dist * 100));
        }

        simulationStepRef.current += 1;
      }, 1500);
    }

    setIsTimerRunning(true);
    toast(
      isSimulationMode 
        ? (isDE ? 'Simulation gestartet...' : 'Simulation started...') 
        : (isDE ? 'Fahrt-Timer & Sensoren gestartet!' : 'Drive timer & Sensors started!'), 
      { icon: isSimulationMode ? '🎮' : '🚀' }
    );
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    pauseActiveSession();
    releaseWakeLock();
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    toast(isDE ? 'Timer pausiert' : 'Timer paused', { icon: '⏸️' });
  };

  const handleResumeTimer = () => {
    setIsTimerRunning(true);
    resumeActiveSession();
    requestWakeLock();
    toast(isDE ? 'Timer fortgesetzt' : 'Timer resumed', { icon: '▶️' });
  };

  const handleStopTimer = async () => {
    setIsTimerRunning(false);
    setShowSuggestions(false);
    setSuggestions([]);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    const durationInMinutes = Math.max(1, Math.round(elapsedTime / 60));
    
    let locationSummary = '';
    if (gpsPoints.length > 0) {
      try {
        const startPoint = gpsPoints[0];
        const endPoint = gpsPoints[gpsPoints.length - 1];
        
        const [startRes, endRes] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${startPoint.lat}&lon=${startPoint.lng}&format=json`).then(r => r.json()),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${endPoint.lat}&lon=${endPoint.lng}&format=json`).then(r => r.json())
        ]);

        const getShortLoc = (data: NominatimResponse) => data.address.suburb || data.address.town || data.address.city || data.address.village || '';
        const startLoc = getShortLoc(startRes);
        const endLoc = getShortLoc(endRes);

        if (startLoc && endLoc && startLoc !== endLoc) {
          locationSummary = `${startLoc} → ${endLoc}`;
        } else {
          locationSummary = startLoc || endLoc || '';
        }
      } catch (e) {
        console.error('[Tracker] Geocoding final summary failed:', e);
      }
    }

    setNewSession(prev => ({
      ...prev,
      duration: durationInMinutes,
      date: activeSession?.startTime ? new Date(activeSession.startTime).toISOString() : new Date().toISOString(),
      totalDistance: Math.round(currentDistance * 10) / 10,
      route: cumulativeRouteRef.current,
      locationSummary: locationSummary || undefined,
      mistakes: cumulativeMistakesRef.current,
      isSimulation: isSimulationMode
    }));
    setShowAddForm(true);
    setShowManualLog(false);
    setElapsedTime(0);
    stopActiveSession();
    releaseWakeLock();
    toast.success(isDE ? 'Bereit zum Speichern!' : 'Ready to save!');
  };

  const handleManualMistake = (type: DrivingMistake['type']) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const mistakeObj: DrivingMistake = {
        type,
        timestamp: Date.now(),
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
      };
      logMistake(mistakeObj);
      toast.error(isDE ? 'Fehler manuell hinzugefügt' : 'Mistake added manually', { position: 'bottom-center' });
    });
    setShowManualLog(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isDE ? 'Fahrtenbuch' : 'Driving Log'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isDE ? 'Dokumentiere deine Fahrstunden' : 'Track your driving lessons'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (!isPremium) {
                onOpenPaywall?.();
              } else {
                if (window.confirm(isDE ? 'Möchtest du wirklich eine simulierte Fahrt mit Leaflet-Karte und Fehlverhaltens-Daten hinzufügen?' : 'Do you want to add a simulated drive with Leaflet Map and mistake data?')) {
                  addDrivingSession({
                    date: new Date().toISOString().split('T')[0],
                    duration: 45,
                    type: 'normal',
                    notes: 'Simulated Drive with Leaflet Maps & Mixed Mistakes',
                    instructorName: 'AI Safety Auditor',
                    totalDistance: 1.2,
                    route: [],
                    locationSummary: 'Berlin, Mitte',
                    mistakes: [],
                    isSimulation: true
                  });
                  toast.success('Advanced Simulation Added!');
                }
              }
            }}
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/20"
          >
            {!isPremium && <Lock className="h-3 w-3" />}
            {isDE ? 'Simulation' : 'Simulate'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-600 dark:shadow-blue-900/30"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <span className="text-xl font-bold">€</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isDE ? 'Fahrschul-Tarif' : 'Driving School Rate'}
              </p>
              {isEditingRate ? (
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    autoFocus
                    className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <span className="text-sm font-bold text-slate-400">/ 45 min</span>
                  <button 
                    onClick={handleSaveRate}
                    className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-bold text-white hover:bg-blue-600"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingRate(true)}
                  className="mt-0.5 text-lg font-black text-slate-900 hover:text-blue-500 dark:text-white dark:hover:text-blue-400"
                >
                  €{userProgress.hourlyRate45.toFixed(2)} <span className="text-xs font-bold text-slate-400">/ 45 min</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-xl dark:from-slate-800 dark:to-slate-900">
        {showManualLog && isTimerRunning && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm p-4"
          >
            <div className="mb-4 flex items-center justify-between w-full">
              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                {isDE ? 'Fehler manuell erfassen' : 'Log Manual Mistake'}
              </h4>
              <button onClick={() => setShowManualLog(false)} className="rounded-full bg-slate-800 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <button onClick={() => handleManualMistake('shoulder_check')} className="flex flex-col items-center gap-1 rounded-xl bg-slate-800 p-3 text-xs font-bold transition-colors hover:bg-slate-700">
                <Eye className="h-5 w-5 text-blue-400" />
                {isDE ? 'Schulterblick' : 'Shoulder Check'}
              </button>
              <button onClick={() => handleManualMistake('signal')} className="flex flex-col items-center gap-1 rounded-xl bg-slate-800 p-3 text-xs font-bold transition-colors hover:bg-slate-700">
                <Signal className="h-5 w-5 text-amber-400" />
                {isDE ? 'Blinker' : 'Signal'}
              </button>
              <button onClick={() => handleManualMistake('priority')} className="flex flex-col items-center gap-1 rounded-xl bg-slate-800 p-3 text-xs font-bold transition-colors hover:bg-slate-700">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {isDE ? 'Vorfahrt' : 'Priority'}
              </button>
              <button onClick={() => handleManualMistake('stop_sign')} className="flex flex-col items-center gap-1 rounded-xl bg-slate-800 p-3 text-xs font-bold transition-colors hover:bg-slate-700">
                <Square className="h-5 w-5 text-red-600" />
                {isDE ? 'Stoppschild' : 'Stop Sign'}
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-300" />
            <h3 className="font-semibold">{isDE ? 'Live-Fahrt-Timer' : 'Live Drive Timer'}</h3>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 mr-2">
               <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                 {isDE ? 'Simulation' : 'Demo Mode'}
               </span>
               <button 
                 onClick={() => setIsSimulationMode(!isSimulationMode)}
                 className={cn(
                   'relative h-4 w-8 rounded-full transition-colors',
                   isSimulationMode ? 'bg-indigo-600' : 'bg-slate-700'
                 )}
               >
                 <div className={cn(
                   'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all',
                   isSimulationMode ? 'left-4.5' : 'left-0.5'
                 )} />
               </button>
             </div>
             {isTimerRunning && (
               <button 
                 onClick={() => setShowManualLog(true)}
                 className="flex h-8 items-center gap-1.5 rounded-full bg-red-500/20 px-3 text-[10px] font-black uppercase tracking-widest text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
               >
                 <AlertTriangle className="h-3 w-3" />
                 {isDE ? 'Problem!' : 'Problem!'}
               </button>
             )}
          </div>
        </div>

        {isTimerRunning && gpsPoints.length > 0 && (
          <div className="mt-3 h-56 w-full overflow-hidden rounded-xl border border-white/10 ring-1 ring-white/10 shadow-inner">
            <MapContainer 
              center={[gpsPoints[gpsPoints.length-1].lat, gpsPoints[gpsPoints.length-1].lng]} 
              zoom={17} 
              zoomControl={false}
              attributionControl={false}
              preferCanvas={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={gpsPoints.map(p => [p.lat, p.lng])} color="#3b82f6" weight={4} opacity={0.8} />
              
              {destinationCoords && (
                <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={getFlagMarkerIcon()}>
                  <Popup>{isDE ? 'Dein Ziel' : 'Your Destination'}</Popup>
                </Marker>
              )}

              <Marker 
                position={[gpsPoints[gpsPoints.length-1].lat, gpsPoints[gpsPoints.length-1].lng]} 
                icon={getCarMarkerIcon(gpsPoints.length > 1 
                  ? (calculateBearing(
                      gpsPoints[gpsPoints.length-2].lat, gpsPoints[gpsPoints.length-2].lng,
                      gpsPoints[gpsPoints.length-1].lat, gpsPoints[gpsPoints.length-1].lng
                    ) - 90)
                  : -90
                )}
              />
              <MapBoundsSimple points={gpsPoints} />
            </MapContainer>
          </div>
        )}

        {/* Destination Search Input */}
        {!isTimerRunning && (
          <div className="mt-4 px-1">
            <div className="relative group">
              <input
                type="text"
                placeholder={isDE ? 'Ziel (z.B. Berlin Hbf)' : 'Destination (e.g. Berlin Hbf)'}
                value={targetDestination}
                onChange={(e) => setTargetDestination(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchDestination()}
                className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-28 py-2.5 text-sm text-white placeholder:text-slate-400/60 focus:bg-white/10 focus:border-indigo-500/50 outline-none transition-all placeholder:text-[10px] sm:placeholder:text-sm"
              />
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <button 
                onClick={handleSearchDestination}
                disabled={isSearchingDestination}
                className="absolute right-2 top-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white hover:bg-indigo-500 transition-all border border-indigo-400/20 shadow-lg shadow-indigo-500/20"
              >
                {isSearchingDestination ? '...' : (isDE ? 'SUCHEN' : 'SEARCH')}
              </button>

              {/* Autocomplete Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/20 bg-slate-900/90 backdrop-blur-md shadow-2xl"
                  >
                    {suggestions.map((feature, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const name = feature.properties.name;
                          const city = feature.properties.city || feature.properties.state || '';
                          const country = feature.properties.country || '';
                          const label = `${name}${city ? ', ' + city : ''}${country ? ', ' + country : ''}`;
                          
                          setTargetDestination(label);
                          setDestinationCoords({
                            lat: feature.geometry.coordinates[1],
                            lng: feature.geometry.coordinates[0]
                          });
                          setShowSuggestions(false);
                          setSuggestions([]);
                        }}
                        className="flex w-full flex-col px-4 py-3 text-left transition-colors hover:bg-white/10 border-b border-white/5 last:border-0"
                      >
                        <span className="text-sm font-bold text-white">
                          {feature.properties.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {[
                            feature.properties.city,
                            feature.properties.state,
                            feature.properties.country
                          ].filter(Boolean).join(', ')}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <div className="my-4 flex flex-col items-center">
          <div className="text-5xl font-bold tracking-tighter">
            {formatTime(elapsedTime)}
          </div>
          {isTimerRunning && (
            <div className="mt-2 w-full max-w-[200px]">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-slate-400 mb-1">
                <span>{isDE ? 'Sicherheits-Score' : 'Safety Score'}</span>
                <span>{Math.max(0, 100 - (currentMistakes.length * 10))}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    currentMistakes.length < 2 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                    currentMistakes.length < 5 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  initial={{ width: '100%' }}
                  animate={{ width: `${Math.max(0, 100 - (currentMistakes.length * 10))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-white/10 pt-4">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isDE ? 'Strecke' : 'Dist.'}
            </p>
            <p className="text-lg font-bold">{currentDistance.toFixed(1)} <span className="text-xs font-medium opacity-60">km</span></p>
          </div>
          <div className="text-center border-l border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isDE ? 'Tempo' : 'Speed'}
            </p>
            <p className="text-lg font-bold">{currentSpeed} <span className="text-xs font-medium opacity-60">km/h</span></p>
          </div>
          <div className="text-center border-l border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {isDE ? 'Limit' : 'Limit'}
            </p>
            <div className={cn(
              'text-lg font-bold flex items-center justify-center gap-1',
              currentLimit && currentSpeed > currentLimit ? 'text-red-400' : 'text-white'
            )}>
              {currentLimit || '--'}
              {currentLimit && (
                <div className="h-4 w-4 rounded-full border-2 border-red-500 bg-white flex items-center justify-center">
                  <span className="text-[8px] font-black text-slate-900">{currentLimit}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isPremium && isTimerRunning && (
          <p className="mt-2 text-[10px] text-slate-400 italic text-center">
            {isDE ? 'Live-Tracking aktiv (Basis-Modus)' : 'Live tracking active (Basic mode)'}
          </p>
        )}
        {/* Primary Control Actions (Integrated) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {isTimerRunning ? (
            <button
              onClick={handlePauseTimer}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white transition-all hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Pause className="h-4 w-4" />
              {isDE ? 'Pause' : 'Pause'}
            </button>
          ) : (
            <button
              onClick={() => {
                if (activeSession && activeSession.isPaused) {
                  handleResumeTimer();
                } else {
                  const liveSessionCount = userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length;
                  if (!isPremium && liveSessionCount >= TRIAL_LIMIT) {
                    onOpenPaywall?.();
                  } else {
                    handleStartTimer();
                  }
                }
              }}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all shadow-lg active:scale-95',
                (!isPremium && userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length >= TRIAL_LIMIT && !(activeSession && activeSession.isPaused))
                  ? 'bg-amber-500/90 hover:bg-amber-600 shadow-amber-500/20'
                  : (activeSession && activeSession.isPaused) ? 'bg-indigo-500/90 hover:bg-indigo-600 shadow-indigo-500/20' : 'bg-green-500/90 hover:bg-green-600 shadow-green-500/20'
              )}
            >
              {(activeSession && activeSession.isPaused) ? (
                <>
                  <Play className="h-4 w-4" />
                  {isDE ? 'Fortsetzen' : 'Resume'}
                </>
              ) : (!isPremium && userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length >= TRIAL_LIMIT ? (
                <>
                  <Crown className="h-4 w-4" />
                  {isDE ? 'Tracking (Pro)' : 'Tracking (Pro)'}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {isDE ? 'Start Live' : 'Start Live'}
                </>
              ))}
            </button>
          )}
          <button
            onClick={handleStopTimer}
            disabled={elapsedTime === 0 && !isTimerRunning}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 active:scale-95"
          >
            <Square className="h-4 w-4" />
            {isDE ? 'Stopp & Speichern' : 'Stop & Save'}
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{isDE ? 'Gesamt' : 'Total'}</span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
            {Math.floor(userProgress.totalDrivingMinutes / 60)}h {userProgress.totalDrivingMinutes % 60}m
          </p>
        </div>

        <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Car className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-tight">{isDE ? 'Normal' : 'Regular'}</span>
          </div>
          <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">
            {Math.floor(normalMinutes / 45)}
          </p>
        </div>

        <div className="rounded-xl bg-blue-500 p-3 shadow-lg shadow-blue-500/20 dark:bg-blue-600">
          <div className="flex items-center gap-1.5 text-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-tight">{isDE ? 'Kosten' : 'Cost'}</span>
          </div>
          <p className="mt-2 text-lg font-black text-white italic">
            €{totalSpending.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Special Drives Requirements */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        {isUmschreibung ? (
          <>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {isDE ? 'Umschreibung: Fahrpraxis-Überblick' : 'Conversion: Practice Overview'}
            </h3>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/40 dark:bg-purple-900/10">
              <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                {isDE ? 'Keine gesetzlichen Pflicht-Sonderfahrten' : 'No legal mandatory special drives'}
              </p>
              <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
                {isDE
                  ? 'Bei der Umschreibung gibt es in der Regel keine vorgeschriebenen 5-4-3 Sonderfahrten. Dein Fahrlehrer kann trotzdem Übungsstunden für Autobahn, Überland oder Nacht empfehlen.'
                  : 'For license conversion, the usual 5-4-3 special drives are generally not legally required. Your instructor may still recommend country road, highway, or night practice.'}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { type: 'ueberland' as const, icon: '🛣️' },
                { type: 'autobahn' as const, icon: '🛤️' },
                { type: 'nacht' as const, icon: '🌙' },
              ].map((item) => {
                const minutes = userProgress.specialDrivingMinutes[item.type];
                return (
                  <div key={item.type} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-700/40">
                    <div className="mb-1 text-lg">{item.icon}</div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{getTypeLabel(item.type)}</p>
                    <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{Math.floor(minutes / 45)}×45</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {isDE ? 'Pflicht-Sonderfahrten' : 'Required Special Drives'}
            </h3>
            
            <div className="space-y-4">
              {[
                { type: 'ueberland' as const, required: 5, icon: '🛣️' },
                { type: 'autobahn' as const, required: 4, icon: '🛤️' },
                { type: 'nacht' as const, required: 3, icon: '🌙' },
              ].map((item) => {
                const minutes = userProgress.specialDrivingMinutes[item.type];
                const completed = Math.floor(minutes / 45);
                const progress = Math.min(100, (completed / item.required) * 100);

                return (
                  <div key={item.type}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      <span className={cn(
                        'text-xs font-medium',
                        completed >= item.required 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500'
                      )}>
                        {completed}/{item.required} × 45 min
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          progress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        )}
                        initial={{ width: '0%' }}
                        whileInView={{ width: `${progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {isDE
                ? '* Gesetzliche Pflichtfahrten (§ 5 Fahrschüler-Ausbildungsordnung): 5×45min Überland, 4×45min Autobahn, 3×45min Nacht'
                : '* Legal special drives (§ 5 FahrschAusbO): 5×45min country roads, 4×45min highway, 3×45min night'}
            </p>
          </>
        )}
      </div>

      {/* Session List */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
            {isDE ? 'Fahrtenbuch' : 'Driving Logbook'}
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {userProgress.drivingSessions.length} {isDE ? 'Einträge' : 'Entries'}
          </span>
        </div>

        {userProgress.drivingSessions.length === 0 ? (
          <EmptyState
            icon={<Car className="h-10 w-10 text-slate-400 dark:text-slate-500" />}
            title={isDE ? 'Keine Fahrstunden' : 'No Driving Sessions'}
            message={isDE ? 'Hier werden deine eingetragenen Fahrstunden angezeigt.' : 'Your logged driving sessions will appear here.'}
            action={
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-blue-600 hover:shadow-lg active:scale-95"
              >
                <Plus className="h-4 w-4" />
                {isDE ? 'Fahrstunde eintragen' : 'Log First Session'}
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {userProgress.drivingSessions
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((session) => {
                const isExpanded = expandedSessionId === session.id;
                return (
                <div
                  key={session.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border transition-all duration-300',
                    isExpanded 
                      ? 'border-blue-200 bg-blue-50/10 shadow-lg dark:border-blue-900/50 dark:bg-blue-900/10' 
                      : 'border-slate-100 bg-white shadow-sm hover:border-blue-100 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800'
                  )}
                >
                  {/* Collapsible Header */}
                  <div 
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                        getTypeColor(session.type),
                        isExpanded ? 'scale-110 shadow-md' : ''
                      )}>
                        {getTypeIcon(session.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {getTypeLabel(session.type)}
                          </span>
                          <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                             {session.duration} min
                          </span>
                          {session.route && session.route.length > 30 && (
                            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                              {isDE ? 'SIMULIERT' : 'SIMULATED'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-0.5 whitespace-nowrap">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(session.date, true)}
                          </div>
                          {session.instructorName && (
                            <span className="flex items-center gap-0.5 truncate uppercase tracking-tighter opacity-80">
                              <div className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                              {session.instructorName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {userProgress.hourlyRate45 > 0 && !isExpanded && (
                        <span className="hidden sm:block text-xs font-black text-green-600 dark:text-green-500">
                          €{(( (Number(session.duration) || 0) / 45) * (Number(userProgress.hourlyRate45) || 0)).toFixed(2)}
                        </span>
                      )}
                      {!isExpanded && session.route && (Array.isArray(session.route) ? session.route.length > 0 : false) && (
                        <div className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 dark:bg-slate-900',
                          'group-hover/header:bg-blue-50 group-hover/header:text-blue-500'
                        )}>
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 dark:bg-slate-900"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                      {!isExpanded && (
                        <div className={cn(
                          'h-2 w-2 rounded-full',
                          ((session.mistakes?.length || 0) < 2) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                          ((session.mistakes?.length || 0) < 5) ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                        )} />
                      )}
                    </div>

                  </div>

                  {/* Collapsible Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div className="border-t border-slate-100/50 p-4 pt-4 dark:border-slate-700/50">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                            {session.totalDistance && (
                              <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                                <Route className="h-3.5 w-3.5" />
                                {session.totalDistance} km
                              </div>
                            )}
                            {session.locationSummary && (
                              <div className="flex items-center gap-1 opacity-80">
                                <MapPin className="h-3.5 w-3.5" />
                                {session.locationSummary}
                              </div>
                            )}
                            {userProgress.hourlyRate45 > 0 && (
                              <div className="ml-auto font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                €{(( (Number(session.duration) || 0) / 45) * (Number(userProgress.hourlyRate45) || 0)).toFixed(2)}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm border border-slate-100 dark:border-slate-700 dark:bg-slate-800">
                              <div className={cn(
                                'h-2 w-2 rounded-full',
                                ((session.mistakes?.length || 0) < 2) ? 'bg-green-500' : 
                                ((session.mistakes?.length || 0) < 5) ? 'bg-yellow-500' : 'bg-red-500'
                              )} />
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {isDE ? 'Sicherheits-Fahrweise' : 'Safety Balance'}: {Math.max(0, 100 - ((session.mistakes || []).length * 8))}%
                              </span>
                            </div>
                            {(session.mistakes || []).some(m => m.type === 'idling') && (
                              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                                <Wind className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {isDE ? 'Öko-Fahrweise' : 'Eco Friendly'}
                                </span>
                              </div>
                            )}
                          </div>

                          {session.notes && (
                            <div className="mt-4 rounded-2xl bg-slate-50/50 p-3 text-xs text-slate-600 border border-slate-100/50 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800">
                              <p className="font-bold uppercase tracking-widest text-[8px] text-slate-400 mb-2">{isDE ? 'NOTIZEN' : 'NOTES'}</p>
                              {session.notes}
                            </div>
                          )}

                          {session.route && Array.isArray(session.route) && session.route.length > 0 && (
                            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner bg-slate-50 dark:bg-slate-900/50">
                              {isPremium ? (
                                <RouteMap route={session.route} mistakes={Array.isArray(session.mistakes) ? session.mistakes : []} language={language} />
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                      {isDE ? 'Streckenverlauf verfügbar' : 'Route Map Available'}
                                    </p>
                                    <p className="max-w-[200px] text-[10px] text-slate-500">
                                      {isDE ? 'Upgrade auf Pro, um deine gefahrene Strecke auf der Karte zu sehen.' : 'Upgrade to Pro to view your driven route on the map.'}
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onOpenPaywall?.(); }}
                                    className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-1.5 text-[10px] font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                                  >
                                    <Crown className="h-3 w-3 text-amber-300" />
                                    {isDE ? 'PRO FREISCHALTEN' : 'UNLOCK PRO'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {session.mistakes && Array.isArray(session.mistakes) && session.mistakes.length > 0 ? (
                            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/20 p-4 dark:border-red-900/30 dark:bg-red-900/10">
                              <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                                  <AlertTriangle className="h-4 w-4" />
                                  {isDE ? 'FAHRFEHLER ANALYSE' : 'DRIVING FAULT ANALYSIS'}
                                </div>
                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600 dark:bg-red-900/40 dark:text-red-400">
                                  {session.mistakes.filter(m => m && m.type).length}
                                </span>
                              </div>
                              {isPremium ? (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {session.mistakes.reduce((acc, mistake) => {
                                    if (!mistake || !mistake.type) return acc;
                                    const existing = acc.find(m => m.type === mistake.type);
                                    if (existing) {
                                      existing.count = (existing.count || 1) + 1;
                                      if (mistake.speed && (!existing.speed || mistake.speed > existing.speed)) {
                                        existing.speed = mistake.speed; 
                                      }
                                    } else {
                                      acc.push({ ...mistake, count: 1 });
                                    }
                                    return acc;
                                  }, [] as (DrivingMistake & { count?: number })[]).map((mistake, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-sm border border-slate-100/50 dark:bg-slate-800 dark:border-slate-700/50">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                          {mistake.type === 'speeding' && <Zap className="h-3.5 w-3.5 text-red-500" />}
                                          {mistake.type === 'harsh_braking' && <Footprints className="h-3.5 w-3.5 text-orange-500" />}
                                          {mistake.type === 'rapid_acceleration' && <Zap className="h-3.5 w-3.5 text-blue-500" />}
                                          {mistake.type === 'shoulder_check' && <Eye className="h-3.5 w-3.5 text-indigo-500" />}
                                          {mistake.type === 'signal' && <Signal className="h-3.5 w-3.5 text-amber-500" />}
                                          {mistake.type === 'priority' && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
                                          {mistake.type === 'stop_sign' && <Square className="h-3.5 w-3.5 text-red-600" />}
                                          {mistake.type === 'wrong_way' && <Route className="h-3.5 w-3.5 text-fuchsia-600" />}
                                          {mistake.type === 'illegal_turn' && <Undo2 className="h-3.5 w-3.5 text-fuchsia-500" />}
                                          {mistake.type === 'idling' && <Wind className="h-3.5 w-3.5 text-emerald-500" />}
                                          {mistake.type === 'roundabout_signal' && <RefreshCcw className="h-3.5 w-3.5 text-blue-600" />}
                                          {mistake.type === 'curve_speeding' && <CornerUpRight className="h-3.5 w-3.5 text-orange-600" />}
                                          {mistake.type === 'aggressive_cornering' && <Gauge className="h-3.5 w-3.5 text-rose-500" />}
                                          {mistake.type === 'right_before_left' && <ChevronRight className="h-3.5 w-3.5 text-blue-500" />}
                                          {mistake.type === 'school_zone_speeding' && <GraduationCap className="h-3.5 w-3.5 text-amber-600" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                            {getMistakeLabel(mistake.type)}
                                          </span>
                                          {mistake.count && mistake.count > 1 && (
                                            <span className="text-[9px] font-black text-rose-500">
                                              {mistake.count}x {isDE ? 'Vorkommen' : 'Occurrences'}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      {mistake.speed && (
                                        <div className="flex flex-col items-end">
                                          <span className="text-[10px] font-black text-red-600">
                                            {mistake.speed}
                                          </span>
                                          <span className="text-[8px] font-bold opacity-50">km/h</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-4 p-2">
                                  <p className="text-[10px] text-slate-600 dark:text-slate-400">
                                    {isDE ? 'Upgrade auf Pro für detaillierte Fehler-Analyse und Verbesserungstipps.' : 'Upgrade to Pro for detailed mistake analysis and improvement tips.'}
                                  </p>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); onOpenPaywall?.(); }}
                                    className="flex shrink-0 items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-[9px] font-black text-red-600 dark:bg-red-900/40 dark:text-red-400"
                                  >
                                    <Lock className="h-3 w-3" />
                                    {isDE ? 'DETAILS SEHEN' : 'SEE DETAILS'}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-green-50/50 p-4 border border-green-100 dark:bg-green-900/10 dark:border-green-900/20">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-sm">
                                <Plus className="h-4 w-4 rotate-45" />
                              </div>
                              <div className="flex flex-col">
                                <p className="text-xs font-bold text-green-700 dark:text-green-500">
                                  {isDE ? 'Keine nennenswerten Fehler' : 'No Critical Mistakes'}
                                </p>
                                <p className="text-[10px] text-green-600/80">
                                  {isDE ? 'Sehr sichere Fahrt!' : 'Excellent driving performance!'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Detail Footer Actions */}
                          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100/50 pt-4 dark:border-slate-800">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditOpen(session); }}
                              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-blue-900/30"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {isDE ? 'SITZUNG BEARBEITEN' : 'EDIT SESSION'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRemoveSession(session.id); }}
                              className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-[10px] font-bold text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isDE ? 'LÖSCHEN' : 'DELETE'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                );
              })}
          </div>
        )}
      </div>


          {userProgress.drivingSessions.length > 0 && (
            <div className="mt-8 flex justify-center border-t border-slate-100 pt-6 dark:border-slate-800">
              <button
                onClick={() => {
                  if (window.confirm(isDE ? 'Möchtest du wirklich alle Fahrstunden löschen?' : 'Are you sure you want to delete all driving sessions?')) {
                    clearDrivingHistory();
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-600 transition-all hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                {isDE ? 'Fahrtenbuch zurücksetzen' : 'Clear All History'}
              </button>
            </div>
          )}
      
      {/* Add Session Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          {/* On mobile: sheet slides up from bottom. On desktop: centered modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex w-full flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 sm:max-w-md shadow-2xl"
            style={{
              height: 'auto',
              maxHeight: '85dvh',
            }}
          >
            
            {/* Header (Sticky) */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingSessionId 
                  ? (isDE ? 'Fahrstunde bearbeiten' : 'Edit Driving Session')
                  : (isDE ? 'Fahrstunde eintragen' : 'Log Driving Session')}
              </h3>
              <button
                onClick={handleCloseForm}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Datum' : 'Date'}
                </label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Art der Fahrt' : 'Drive Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['normal', 'ueberland', 'autobahn', 'nacht'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewSession({ ...newSession, type })}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        newSession.type === type
                          ? getTypeColor(type) + ' ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                      )}
                    >
                      {getTypeIcon(type)}
                      {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isDE ? 'Dauer (Minuten)' : 'Duration (minutes)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: Math.max(0, parseInt(e.target.value, 10)) || 0 })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {isDE ? 'Distanz (km)' : 'Distance (km)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newSession.totalDistance || ''}
                    onChange={(e) => setNewSession({ ...newSession, totalDistance: Math.max(0, parseFloat(e.target.value)) || undefined })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Fahrlehrer (optional)' : 'Instructor (optional)'}
                </label>
                <input
                  type="text"
                  value={newSession.instructorName}
                  onChange={(e) => setNewSession({ ...newSession, instructorName: e.target.value })}
                  placeholder={isDE ? 'Name' : 'Name'}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Ort / Stadt' : 'Location / City'}
                </label>
                <input
                  type="text"
                  value={newSession.locationSummary || ''}
                  onChange={(e) => setNewSession({ ...newSession, locationSummary: e.target.value })}
                  placeholder={isDE ? 'z.B. Berlin, Mitte' : 'e.g. Berlin, Mitte'}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isDE ? 'Notizen (optional)' : 'Notes (optional)'}
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder={isDE ? 'Was hast du gelernt?' : 'What did you learn?'}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Footer (Sticky) — always visible above safe area */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={handleAddSession}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-blue-700 active:scale-[0.98]"
              >
                {editingSessionId 
                  ? (isDE ? 'ÄNERUNGEN SPEICHERN' : 'SAVE CHANGES')
                  : (isDE ? 'FAHRSTUNDE SPEICHERN' : 'SAVE SESSION')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

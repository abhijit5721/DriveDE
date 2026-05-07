/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DrivingSession, DrivingMistake, GPSPoint } from '../../types';
import toast from 'react-hot-toast';
import { 
  Trash2, Clock, Car, MapPin, X, Play, 
  Pause, Square, Crown, Pencil, AlertTriangle, Zap, Footprints, Eye, 
  Signal, Search, Wind, RefreshCcw, CornerUpRight, 
  Gauge, ChevronRight, ChevronDown, Info,
  View, Ban, AlertCircle, MoreHorizontal, ShieldCheck, Database,
  ShieldAlert, Check, Cloud, CheckCircle2,
  Navigation, TrendingDown, Repeat2, Flame, GraduationCap, RotateCcw
} from 'lucide-react';
import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { EmptyState } from '../common/EmptyState';

import { updateSpatialCache, findNearestFeature, SpatialCacheData } from '../../services/spatialCache';
import { syncAllData } from '../../services/supabaseSync';

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
  const t = TRANSLATIONS[language as 'de' | 'en'];
  
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
    if (type === 'speeding') color = '#dc2626'; // strong red
    
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
          {t.tracker.liveRouteTrace}
        </span>
        <button 
          onClick={handleTogglePlayback}
          className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
        >
            {isPlaying ? (
              <><Pause className="h-3 w-3" /> {t.common.pause}</>
            ) : (
              <><Play className="h-3 w-3" /> {t.common.replay}</>
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
             <Popup>{t.tracker.startPoint}</Popup>
          </Marker>
          <Marker position={endPoint}>
             <Popup>{t.tracker.endPoint}</Popup>
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
                  {m.type === 'speeding' && t.tracker.mistakes.speeding}
                  {m.type === 'harsh_braking' && t.tracker.mistakes.harshBraking}
                  {m.type === 'rapid_acceleration' && t.tracker.mistakes.rapidAcceleration}
                  {m.type === 'shoulder_check' && t.tracker.mistakes.shoulderCheck}
                  {m.type === 'signal' && t.tracker.mistakes.signal}
                  {m.type === 'priority' && t.tracker.mistakes.priority}
                  {m.type === 'stop_sign' && t.tracker.mistakes.stopSign}
                  {m.type === 'wrong_way' && t.tracker.mistakes.wrongWay}
                  {m.type === 'illegal_turn' && t.tracker.mistakes.illegalTurn}
                  {m.type === 'roundabout_signal' && t.tracker.mistakes.roundaboutSignal}
                  {m.type === 'curve_speeding' && t.tracker.mistakes.curveSpeeding}
                  {m.type === 'aggressive_cornering' && t.tracker.mistakes.aggressiveCornering}
                  {m.type === 'right_before_left' && t.tracker.mistakes.rightBeforeLeft}
                  {m.type === 'school_zone_speeding' && t.tracker.mistakes.schoolZone}
                  {m.type === 'other' && t.tracker.mistakes.other}
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
    language, userProgress, addDrivingSession, 
    updateDrivingSession, removeDrivingSession, clearDrivingHistory,
    setHourlyRate45, isPremium,
    activeSession, startActiveSession, pauseActiveSession, 
    resumeActiveSession, updateActiveSession, stopActiveSession,
    activeTab, setActiveTab,
    isHydrated: storeHydrated, setAcceptedPrivacy,
    authStatus, updateMistakeStatus
  } = useAppStore();

  const [isHydrated, setHydrated] = useState(storeHydrated);

  useEffect(() => {
    if (storeHydrated) {
      setHydrated(true);
    } else {
      // Safety fallback: if store doesn't hydrate in 2s, proceed anyway
      const timer = setTimeout(() => setHydrated(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [storeHydrated]);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const t = TRANSLATIONS[language as 'de' | 'en'];
  


  const getMistakeLabel = useCallback((type: string) => {
    const camelType = type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    return (t.tracker.mistakes as any)[camelType] || 
           (t.tracker.mistakes as any)[type] || 
           type;
  }, [t]);

  const getMistakeIconComponent = (type: string) => {
    switch (type) {
      case 'priority':            return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      case 'stop_sign':           return <Square className="h-3.5 w-3.5 text-red-600" />;
      case 'right_before_left':   return <CornerUpRight className="h-3.5 w-3.5 text-amber-500" />;
      case 'wrong_way':           return <Ban className="h-3.5 w-3.5 text-red-700" />;
      case 'shoulder_check':      return <Eye className="h-3.5 w-3.5 text-blue-400" />;
      case 'mirror_check':        return <View className="h-3.5 w-3.5 text-slate-400" />;
      case 'signal':              return <Signal className="h-3.5 w-3.5 text-amber-400" />;
      case 'pedestrian_safety':   return <Footprints className="h-3.5 w-3.5 text-purple-400" />;
      case 'speeding':            return <Gauge className="h-3.5 w-3.5 text-red-400" />;
      case 'harsh_braking':       return <TrendingDown className="h-3.5 w-3.5 text-orange-500" />;
      case 'roundabout_signal':   return <RotateCcw className="h-3.5 w-3.5 text-blue-400" />;
      case 'curve_speeding':      return <Navigation className="h-3.5 w-3.5 text-yellow-500" />;
      case 'aggressive_cornering':return <Repeat2 className="h-3.5 w-3.5 text-pink-500" />;
      case 'idling':              return <Flame className="h-3.5 w-3.5 text-green-500" />;
      case 'illegal_turn':        return <Ban className="h-3.5 w-3.5 text-red-500" />;
      case 'school_zone_speeding':return <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />;
      default:                    return <MoreHorizontal className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const getTypeIcon = (type: DrivingSession['type']) => {
    switch (type) {
      case 'nacht': return <Clock className="h-4 w-4" />;
      case 'autobahn': return <Zap className="h-4 w-4" />;
      case 'ueberland': return <Wind className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: DrivingSession['type']) => {
    return t.tracker.types[type] || type;
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
      default: return 'text-blue-600 bg-blue-50 dark:blue-900/20 dark:text-blue-400';
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
    locationSummary: '',
    isSimulation: false
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [gpsPoints, setGpsPoints] = useState<NonNullable<DrivingSession['route']>>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);
  const [currentMistakes, setCurrentMistakes] = useState<DrivingMistake[]>([]);
  const [activeStopSign, setActiveStopSign] = useState<{lat: number, lng: number, id: string} | null>(null);
  const [showMistakeSuccess, setShowMistakeSuccess] = useState(false);
  const [hasStoppedAtSign, setHasStoppedAtSign] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const lastRvlCheckRef = useRef(0);
  const lastSchoolCheckRef = useRef(0);
  const lastWrongWayLogRef = useRef(0);
  const lastIllegalTurnLogRef = useRef(0);
  const lastMotionLogRef = useRef(0);
  const motionBufferRef = useRef<{ x: number, y: number, z: number, total: number }[]>([]);
  const BUFFER_SIZE = 5;
  const stationaryStartRef = useRef<number | null>(null);
  const lastIdlingLogRef = useRef<number>(0);
  const cumulativeMistakesRef = useRef<DrivingMistake[]>([]);
  const cumulativeRouteRef = useRef<GPSPoint[]>([]);

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
  const [faultSourceFilter, setFaultSourceFilter] = useState<'all' | 'auto' | 'manual'>('all');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [isDeviceMounted, setIsDeviceMounted] = useState(false);
  const [isMountConfirmed, setIsMountConfirmed] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (authStatus === 'signed_in') {
        syncAllData(useAppStore.getState()).catch(console.error);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Also sync on unmount
    };
  }, [authStatus]);

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
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
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
  
  const spatialWorker = useMemo(() => {
    if (typeof window !== 'undefined') {
      return new Worker(new URL('../../workers/spatial.worker.ts', import.meta.url));
    }
    return null;
  }, []);

  const [spatialCache, setSpatialCache] = useState<SpatialCacheData | null>(null);
  const lastCacheUpdateRef = useRef<number>(0);

  const logMistake = useCallback((mistake: DrivingMistake) => {
    const mistakeWithStatus: DrivingMistake = { 
      ...mistake, 
      status: 'pending',
      source: mistake.source || 'auto' 
    };
    cumulativeMistakesRef.current = [...cumulativeMistakesRef.current, mistakeWithStatus];
    setCurrentMistakes(prev => [...prev, mistakeWithStatus]);
    updateActiveSession({ mistakes: cumulativeMistakesRef.current });
  }, [updateActiveSession]);

  const handleManualMistake = (type: DrivingMistake['type']) => {
    setShowManualLog(false);
    if (!isTimerRunning) return;
    
    try {
      const lastPoint = cumulativeRouteRef.current[cumulativeRouteRef.current.length - 1];
      const loc = lastPoint ? { lat: lastPoint.lat, lng: lastPoint.lng } : { lat: 0, lng: 0 };
      
      const mistakeObj: DrivingMistake = {
        type,
        timestamp: Date.now(),
        location: loc,
        speed: currentSpeed,
        limit: currentLimit || undefined,
        source: 'manual'
      };
      
      logMistake(mistakeObj);
      
      setShowMistakeSuccess(true);
      setTimeout(() => setShowMistakeSuccess(false), 2000);
      
      toast.success(t.tracker.mistakeAddedManually, { position: 'bottom-center', icon: '📝' });
    } catch (error) {
      console.error('[Tracker] Manual mistake log failed:', error);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm(t.tracker.deleteConfirm || 'Are you sure you want to PERMANENTLY delete all driving history? (Art. 17 GDPR - Right to Erasure)')) {
      clearDrivingHistory();
      toast.success('All data has been purged successfully.');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(userProgress.drivingSessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `drivede_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    toast.success('History exported successfully (Art. 20 GDPR)');
  };

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
      isSimulation: false,
    });
  }, []);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current && activeSession && !isTimerRunning) {
      isInitialMount.current = false;
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
    } else if (activeSession) {
      isInitialMount.current = false;
    }
  }, [activeSession, isTimerRunning]);

  useEffect(() => {
    if (isTimerRunning && Math.abs(currentDistance - (activeSession?.currentDistance || 0)) > 0.1) {
      updateActiveSession({ currentDistance });
    }
  }, [currentDistance, isTimerRunning, activeSession, updateActiveSession]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTimerRunning && activeSession?.startTime) {
        const now = Date.now();
        const elapsedSinceStart = Math.floor((now - activeSession.startTime - activeSession.pausedDuration) / 1000);
        setElapsedTime(Math.max(0, elapsedSinceStart));
        
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
      toast.error(t.tracker.enterDurationError);
      return;
    }

    try {
      if (editingSessionId) {
        updateDrivingSession(editingSessionId, newSession);
        toast.success(t.tracker.sessionUpdated);
      } else {
        addDrivingSession(newSession as Omit<DrivingSession, 'id'>);
        toast.success(t.tracker.sessionSaved);
      }
      handleCloseForm();
    } catch (error) {
      console.error('[Tracker] Error saving session:', error);
      toast.error('Error saving session');
    }
  }, [newSession, editingSessionId, updateDrivingSession, addDrivingSession, handleCloseForm, t.tracker]);

  const handleRemoveSession = useCallback((id: string) => {
    if (window.confirm(t.tracker.deleteConfirm)) {
      removeDrivingSession(id);
      toast.success(t.tracker.sessionDeleted);
    }
  }, [removeDrivingSession, t.tracker]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (targetDestination.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const langCode = language === 'de' ? 'de' : 'en';
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

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [targetDestination, language, gpsPoints]);

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
          <div style="position: absolute; right: 6px; width: 10px; height: 12px; background: #1e293b; border-radius: 1px; opacity: 0.8;"></div>
          <div style="position: absolute; right: -3px; top: 1px; width: 5px; height: 4px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 5px #fef08a;"></div>
          <div style="position: absolute; right: -3px; bottom: 1px; width: 5px; height: 4px; background: #fef08a; border-radius: 1px; box-shadow: 0 0 5px #fef08a;"></div>
          <div style="position: absolute; left: -2px; top: 2px; width: 4px; height: 4px; background: #ef4444; border-radius: 1px;"></div>
          <div style="position: absolute; left: -2px; bottom: 2px; width: 4px; height: 4px; background: #ef4444; border-radius: 1px;"></div>
        </div>
      `,
      iconSize: [34, 18],
      iconAnchor: [17, 9]
    });
  };

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
      const query = `[out:json];node(around:40,${lat},${lng})["highway"="stop"];out;`;
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
          toast(t.tracker.stopSignAhead, { icon: <Info className="h-4 w-4" />, id: 'stop-sign-alert' });
        }
      }
    } catch (e) {
      console.error('[Tracker] Stop sign fetch failed:', e);
    }
  }, [activeStopSign, t, spatialCache, spatialWorker]);

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
            toast(t.tracker.stopSignAhead, { icon: <Info className="h-4 w-4" />, id: 'stop-sign-alert' });
          }
        }
      }
    };
    spatialWorker?.addEventListener('message', onMessage);
    return () => spatialWorker?.removeEventListener('message', onMessage);
  }, [spatialWorker, activeStopSign, t]);

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

      spatialWorker?.postMessage({
        type: 'wrongWayCheck',
        data: { travelBearing, roadNodes: nodes }
      });

      const onWorkerMessage = (e: MessageEvent) => {
        if (e.data.type === 'wrongWayCheck' && e.data.result === true) {
          lastWrongWayLogRef.current = Date.now();
          toast.error(
            t.tracker.wrongWayAlert,
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
  }, [currentSpeed, t, logMistake, spatialWorker, spatialCache]);

  const checkIllegalTurn = useCallback(async (lat: number, lng: number) => {
    if (Date.now() - lastIllegalTurnLogRef.current < 20000) return;
    if (currentSpeed < 5) return;

    try {
      const query = `[out:json];way(around:15,${lat},${lng})[~"^(access|motor_vehicle|footway)$"~"^(no|private|pedestrian)$"];out tags;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(5000) });
      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        lastIllegalTurnLogRef.current = Date.now();
        const tag = data.elements[0].tags;
        const reason = tag.footway === 'pedestrian' ? t.tracker.pedestrianZone
                     : tag.access === 'private' ? t.tracker.privateAccess
                     : t.tracker.entryForbidden;

        toast.error(
          `${t.tracker.illegalTurn} (${reason})`,
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
  }, [currentSpeed, t, logMistake]);

  const checkRightBeforeLeft = useCallback(async (lat: number, lng: number) => {
    if (Date.now() - lastRvlCheckRef.current < 30000) return;
    if (currentSpeed < 10) return;

    try {
      const query = `[out:json];way(around:30,${lat},${lng})["highway"~"residential|living_street"]->.w;node(w.w)(around:15,${lat},${lng})->.n;way(bn.n)["highway"~"residential|living_street"]->.i;(.i; - .w;);out count;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(4000) });
      const data = await response.json();
      
      if (data.count && data.count > 0) {
        if (currentSpeed > 22) { 
          lastRvlCheckRef.current = Date.now();
          toast.error(
            t.tracker.rightBeforeLeftAlert,
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
  }, [currentSpeed, t, logMistake]);

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
            t.tracker.schoolZoneCaution,
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
  }, [currentSpeed, t, logMistake]);

  const fetchSpeedLimit = useCallback(async (lat: number, lng: number) => {
    try {
      const query = `[out:json];way(around:50,${lat},${lng})[highway];out tags;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const tags = data.elements[0].tags;
        let limit = parseInt(tags.maxspeed);

        if (isNaN(limit)) {
          if (tags['maxspeed:type'] === 'DE:urban' || tags.highway === 'residential') {
            limit = 50;
          } else if (tags['maxspeed:type'] === 'DE:living_street' || tags.highway === 'living_street') {
            limit = 7;
          } else if (tags.highway === 'motorway') {
            limit = 130;
          }
        }

        if (tags['maxspeed:conditional']) {
          const cond = tags['maxspeed:conditional'];
          const match = cond.match(/^(\d+)\s*@\s*\(([^)]+)\)$/);
          if (match) {
            const condLimit = parseInt(match[1]);
            const timeRange = match[2];
            const now = new Date();
            const hour = now.getHours();
            
            if (timeRange.includes('-')) {
              const [start, end] = timeRange.split('-').map((timePart: string) => parseInt(timePart.split(':')[0]));
              const isNight = start > end 
                ? (hour >= start || hour < end)
                : (hour >= start && hour < end);
              
              if (isNight) limit = condLimit;
            }
          }
        }

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
        toast.success(t.tracker.destinationFound);
      } else {
        toast.error(t.tracker.destinationNotFound);
      }
    } catch (e) {
      console.error('[Tracker] Reverse geocoding search failed:', e);
      toast.error(t.tracker.searchFailed);
    } finally {
      setIsSearchingDestination(false);
    }
  };

  const handleSaveRate = () => {
    const rate = parseFloat(tempRate) || 0;
    if (rate <= 0) {
      toast.error(t.tracker.invalidAmountError);
      return;
    }
    setHourlyRate45(rate);
    setIsEditingRate(false);
    toast.success(t.tracker.rateUpdated);
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

        const liveSessionCount = userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length;
        const hasTrial = !isPremium && liveSessionCount < TRIAL_LIMIT;
        const canTrackLive = isPremium || hasTrial;

        if ('geolocation' in navigator && canTrackLive) {
          watchRef.current = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude: lat, longitude: lng, speed, accuracy } = position.coords;
              
              if (accuracy && accuracy > 20) {
                console.warn(`[Tracker] Skipping low accuracy point: ${accuracy}m`);
                return;
              }

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
                toast.error(t.tracker.gpsDenied);
              } else {
                toast.error(t.tracker.gpsError);
              }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }

      const handleMotion = (event: DeviceMotionEvent) => {
        const liveSessionCount = userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length;
        const hasTrial = !isPremium && liveSessionCount < TRIAL_LIMIT;
        const canDetectMotion = isPremium || hasTrial;
        
        if (!canDetectMotion || isSimulationMode) return;
        
        const acc = event.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        const totalAcc = Math.sqrt(x*x + y*y + z*z);

        motionBufferRef.current.push({ x, y, z, total: totalAcc });
        if (motionBufferRef.current.length > BUFFER_SIZE) {
          motionBufferRef.current.shift();
        }

        if (motionBufferRef.current.length < BUFFER_SIZE) return;

        const avg = motionBufferRef.current.reduce((acc, curr) => ({
          x: acc.x + curr.x,
          y: acc.y + curr.y,
          z: acc.z + curr.z,
          total: acc.total + curr.total
        }), { x: 0, y: 0, z: 0, total: 0 });

        // Compliance Art. 5(1)(c) DSGVO: On-device data minimization.
        // We only process high-frequency raw data in a local buffer for event detection.
        // Raw sensor streams are never persisted or transmitted.
        const avgX = avg.x / BUFFER_SIZE;
        const avgY = avg.y / BUFFER_SIZE;
        const avgTotal = avg.total / BUFFER_SIZE;

        if ((avgTotal > 6.0 || Math.abs(avgX) > 4.5) && Date.now() - lastMotionLogRef.current > 10000) {
          lastMotionLogRef.current = Date.now();
          
          navigator.geolocation.getCurrentPosition((pos) => {
            const isCornering = Math.abs(avgX) > 4.5 && Math.abs(avgX) > Math.abs(avgY);
            const isBraking = !isCornering && avgY < -4.5;
            
            let type: DrivingMistake['type'] = 'rapid_acceleration';
            if (isCornering) {
              type = 'aggressive_cornering';
            } else if (isBraking) {
              type = 'harsh_braking';
            }
            
            logMistake({
              type,
              timestamp: Date.now(),
              location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
            });

            toast.error(t.tracker[type === 'aggressive_cornering' ? 'aggressiveCorneringAlert' : type === 'harsh_braking' ? 'harshBrakingAlert' : 'rapidAccelAlert'], { position: 'bottom-center', duration: 4000 });
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
  }, [isTimerRunning, isSimulationMode, fetchSpeedLimit, checkNearbyStopSign, checkWrongWayDriving, checkIllegalTurn, checkRightBeforeLeft, checkSchoolArea, isPremium, t, logRoutePoint, logMistake, currentSpeed]);

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
          toast.error(t.tracker.stopSignViolation, { position: 'bottom-center' });
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
          toast.error(t.tracker.speedingAlert(currentLimit!), { position: 'bottom-center' });
          
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
          toast.error(t.tracker.ecoStopEngine, { 
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
  }, [gpsPoints, currentSpeed, currentLimit, activeStopSign, hasStoppedAtSign, isTimerRunning, t, isSimulationMode, logMistake]);

  const handleStartTimer = async (skipMountCheck = false, skipPrivacyCheck = false) => {
    if (!skipPrivacyCheck && !userProgress.hasAcceptedPrivacy) {
      setShowPrivacyInfo(true);
      toast(t.tracker.privacyConsentRequired || 'Please review and accept the Privacy & Data policy first.', { icon: 'ℹ️' });
      return;
    }

    const liveSessionCount = userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length;
    const hasTrial = !isPremium && liveSessionCount < TRIAL_LIMIT;
    const canStartLive = isPremium || hasTrial;

    if (!canStartLive && !isSimulationMode) {
      if (onOpenPaywall) {
        onOpenPaywall();
      } else {
        toast.error(t.common.proOnlyFeature || 'Pro only feature');
      }
      return;
    }

    if (!isDeviceMounted && !skipMountCheck) {
      setShowSafetyWarning(true);
      return;
    }

    setIsTimerRunning(true);
    toast(
      isSimulationMode 
        ? t.tracker.simulationStarted 
        : t.tracker.sensorsStarted, 
      { icon: isSimulationMode ? '🎮' : '🚀' }
    );

    setShowSuggestions(false);
    setSuggestions([]);
    
    setGpsPoints([]);
    setCurrentMistakes([]);
    cumulativeMistakesRef.current = [];
    cumulativeRouteRef.current = [];
    setCurrentDistance(0);
    setElapsedTime(0);
    
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

    const MotionEvent = DeviceMotionEvent as unknown as any;
    if (typeof MotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await MotionEvent.requestPermission();
        if (permissionState !== 'granted') {
          toast.error(t.tracker.motionSensorDenied);
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
          toast(t.tracker.simulationLooping, { icon: '🔄' });
          return;
        }

        const point = mockPoints[currentStep];
        const newTrackPoint = { lat: point.lat, lng: point.lng, timestamp: Date.now() };
        
        logRoutePoint(newTrackPoint);
        
        setCurrentSpeed(point.speed);
        setCurrentLimit(point.limit);

        if (currentStep === 0) {
          setActiveStopSign({ lat: 52.52005, lng: 13.40505, id: 'mock-stop-1' });
          toast(t.tracker.stopSignAhead, { id: 'mock-stop-toast' });
        }

        if (currentStep === 28) {
          toast.dismiss();
          toast.error(t.tracker.wrongWayAlert, { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'wrong_way', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 30) {
          toast.error(`${t.tracker.illegalTurn} (${t.tracker.pedestrianZone})`, { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'illegal_turn', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 8) {
          toast.error(t.tracker.mistakes.roundaboutSignal, { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'roundabout_signal', timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }
        
        if (currentStep === 11) {
          toast.error(t.tracker.mistakes.curveSpeeding, { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'curve_speeding', speed: point.speed, limit: 30, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }
        
        if (currentStep === 14) {
          toast.error(t.tracker.mistakes.aggressiveCornering, { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'aggressive_cornering', speed: point.speed, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 22) {
          toast.error(t.tracker.mistakes.rightBeforeLeft, { position: 'bottom-center', duration: 8000 });
          logMistake({ type: 'right_before_left', speed: point.speed, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 25) {
          toast.error(t.tracker.schoolZoneCaution, { position: 'bottom-center', duration: 8000, icon: '🏫' });
          logMistake({ type: 'school_zone_speeding', speed: point.speed, limit: 30, timestamp: Date.now(), location: { lat: point.lat, lng: point.lng } });
        }

        if (currentStep === 19) {
          toast.error(t.tracker.ecoStopEngine, { position: 'bottom-center', duration: 8000, icon: '🌱' });
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
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    pauseActiveSession();
    releaseWakeLock();
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    toast(t.tracker.timerPaused, { icon: '⏸️' });
  };

  const handleResumeTimer = () => {
    setIsTimerRunning(true);
    resumeActiveSession();
    requestWakeLock();
    toast(t.tracker.timerResumed, { icon: '▶️' });
  };

  const handleStopTimer = async () => {
    setIsTimerRunning(false);
    setShowSuggestions(false);
    setSuggestions([]);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    const durationInMinutes = Math.max(1, Math.round(elapsedTime / 60));
    
    setNewSession(prev => ({
      ...prev,
      duration: durationInMinutes,
      date: (activeSession?.startTime ? new Date(activeSession.startTime) : new Date()).toISOString().split('T')[0],
      totalDistance: Math.round(currentDistance * 10) / 10,
      route: cumulativeRouteRef.current,
      mistakes: cumulativeMistakesRef.current,
      isSimulation: activeSession?.isSimulation ?? isSimulationMode
    }));
    setShowAddForm(true);
    setShowManualLog(false);
    setElapsedTime(0);
    stopActiveSession();
    releaseWakeLock();
    toast.success(t.tracker.readyToSave);

    if (gpsPoints.length > 0) {
      try {
        const startPoint = gpsPoints[0];
        const endPoint = gpsPoints[gpsPoints.length - 1];
        
        Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${startPoint.lat}&lon=${startPoint.lng}&format=json`).then(r => r.json()),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${endPoint.lat}&lon=${endPoint.lng}&format=json`).then(r => r.json())
        ]).then(([startRes, endRes]) => {
          const getShortLoc = (data: any) => data.address?.suburb || data.address?.town || data.address?.city || data.address?.village || '';
          const startLoc = getShortLoc(startRes);
          const endLoc = getShortLoc(endRes);

          let locationSummary = '';
          if (startLoc && endLoc && startLoc !== endLoc) {
            locationSummary = `${startLoc} → ${endLoc}`;
          } else {
            locationSummary = startLoc || endLoc || '';
          }
          
          if (locationSummary) {
            setNewSession(prev => ({
              ...prev,
              locationSummary
            }));
          }
        }).catch(e => console.error('[Tracker] Geocoding background failed:', e));
      } catch (e) {
        console.error('[Tracker] Geocoding setup failed:', e);
      }
    }
  };




  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!isHydrated) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-blue-500/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.tracker.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.tracker.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('tracker')}
            data-testid="tab-tracker"
            className={cn(
              'px-6 py-2 text-sm font-bold rounded-xl transition-all',
              activeTab === 'tracker'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            )}
          >
            {t.tracker.tabTracker || 'Tracker'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            data-testid="tab-history"
            className={cn(
              'px-6 py-2 text-sm font-bold rounded-xl transition-all',
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            )}
          >
            {t.tracker.tabHistory || 'History'}
          </button>
        </div>
      </div>

      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <span className="text-xl font-bold">€</span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t.tracker.drivingSchoolRate}
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
                        {t.common.ok}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-slate-300" />
                <h3 className="font-semibold">{t.tracker.liveTimerTitle}</h3>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 mr-2">
                   <button
                     onClick={() => setShowPrivacyInfo(true)}
                     className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-700/50 text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                     title="Privacy & Data Transparency"
                   >
                     <ShieldCheck className="h-3.5 w-3.5" />
                   </button>
                   <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {t.tracker.simulationMode}
                   </span>
                   <button 
                     onClick={() => !isTimerRunning && setIsSimulationMode(!isSimulationMode)}
                     disabled={isTimerRunning}
                     data-testid="sim-toggle"
                     className={cn(
                       'relative h-4 w-8 rounded-full transition-colors',
                       isSimulationMode ? 'bg-indigo-600' : 'bg-slate-700',
                       isTimerRunning && 'opacity-50 cursor-not-allowed'
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
                     data-testid="problem-btn"
                     className={cn(
                       'flex h-8 items-center gap-1.5 rounded-full px-3 text-[10px] font-black uppercase tracking-widest border transition-all',
                       showMistakeSuccess 
                         ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                         : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                     )}
                   >
                     {showMistakeSuccess ? (
                       <>
                         <RefreshCcw className="h-3 w-3 animate-spin-slow" />
                         {t.common.saved || 'SAVED'}
                       </>
                     ) : (
                       <>
                         <AlertTriangle className="h-3 w-3" />
                         {t.common.problem}
                       </>
                     )}
                   </button>
                 )}
              </div>
            </div>

            {isTimerRunning && gpsPoints.length > 0 && (
              <div className="relative z-0 mt-3 h-56 w-full overflow-hidden rounded-xl border border-white/10 ring-1 ring-white/10 shadow-inner">
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
                      <Popup>{t.tracker.yourDestination}</Popup>
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

            {!isTimerRunning && (
              <div className="mt-4 px-1">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder={t.tracker.destinationPlaceholder}
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
                    {isSearchingDestination ? '...' : t.common.search}
                  </button>

                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
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
                    <span>{t.tracker.safetyScore}</span>
                    <span data-testid="safety-score-value">{Math.max(0, 100 - (cumulativeMistakesRef.current.length * 10))}%</span>
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
                  {t.tracker.distance}
                </p>
                <p className="text-lg font-bold">{currentDistance.toFixed(1)} <span className="text-xs font-medium opacity-60">km</span></p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t.tracker.speed}
                </p>
                <p className="text-lg font-bold">{currentSpeed} <span className="text-xs font-medium opacity-60">km/h</span></p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t.tracker.limit}
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
            
            {/* Live Mistakes List */}
            {currentMistakes.length > 0 && (
              <div className="mt-6 w-full animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center justify-between mb-3 px-1">
                   <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                     {t.tracker.mistakeLog}
                   </h5>
                   <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">
                     {currentMistakes.length} {t.tracker.mistakesCount}
                   </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const groups: Record<string, { type: string, count: number }> = {};
                    currentMistakes.forEach(m => {
                      if (!groups[m.type]) {
                        groups[m.type] = { type: m.type, count: 0 };
                      }
                      groups[m.type].count++;
                    });
                    
                    return Object.values(groups).map((group, idx) => (
                      <div 
                        key={idx} 
                        className="group flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 pl-2 pr-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-white/10"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                          {getMistakeIconComponent(group.type)}
                        </div>
                        <span>{getMistakeLabel(group.type)}</span>
                        {group.count > 1 && (
                          <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500/20 px-1 text-[9px] font-black text-red-400">
                            ×{group.count}
                          </span>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              {isTimerRunning ? (
                <button
                  onClick={handlePauseTimer}
                  data-testid="pause-tracking-btn"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white transition-all hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Pause className="h-4 w-4" />
                  {t.common.pause}
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
                  data-testid={(activeSession && activeSession.isPaused) ? 'resume-tracking-btn' : 'start-tracking-btn'}
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
                      {t.common.resume}
                    </>
                  ) : (!isPremium && userProgress.drivingSessions.filter(s => s.route && s.route.length > 0).length >= TRIAL_LIMIT ? (
                    <>
                      <Crown className="h-4 w-4" />
                      {t.tracker.trackingPro}
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {t.tracker.startLive}
                    </>
                  ))}
                </button>
              )}
              <button
                onClick={handleStopTimer}
                disabled={elapsedTime === 0 && !isTimerRunning}
                data-testid="stop-tracking-btn"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/90 backdrop-blur-md px-4 py-3 text-sm font-bold text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 active:scale-95"
              >
                <Square className="h-4 w-4" />
                {t.common.stopAndSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
              {t.tracker.historyTitle || 'History'}
            </h3>
            <div className="flex items-center gap-2">
              {userProgress.drivingSessions.some(s => s.mistakes?.some(m => !m.status || m.status === 'pending')) && (
                <button
                  onClick={() => {
                    userProgress.drivingSessions.forEach(s => {
                      s.mistakes?.forEach(m => {
                        if (!m.status || m.status === 'pending') {
                          updateMistakeStatus(s.id, m.timestamp, 'confirmed');
                        }
                      });
                    });
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-black uppercase tracking-tight text-blue-600 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {language === 'de' ? 'ALLE OK' : 'ALL OK'}
                </button>
              )}

              {authStatus === 'signed_in' && (
                <button 
                  onClick={async () => {
                    setSyncing(true);
                    setSyncError(null);
                    try {
                      await syncAllData(useAppStore.getState());
                    } catch (e) {
                      setSyncError(language === 'de' ? 'Sync fehlgeschlagen' : 'Sync failed');
                    } finally {
                      setSyncing(false);
                    }
                  }}
                  disabled={syncing}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  <RefreshCcw className={cn('h-3 w-3', syncing && 'animate-spin')} />
                  {syncing ? '...' : 'Sync'}
                </button>
              )}

              <button
                onClick={handleExportData}
                data-testid="export-history-btn"
                className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <Database className="h-3 w-3" />
                Export JSON
              </button>
              <button
                onClick={handleClearHistory}
                data-testid="purge-data-btn"
                className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
                Purge All
              </button>
            </div>
          </div>
          
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
            {[
              { id: 'all', label: language === 'de' ? 'Alle Fehler' : 'All Faults', icon: <AlertTriangle className="h-3 w-3" /> },
              { id: 'auto', label: language === 'de' ? 'Auto-Detektiert' : 'Auto-Detected', icon: <Zap className="h-3 w-3" /> },
              { id: 'manual', label: language === 'de' ? 'Manuell' : 'Manual Entry', icon: <Pencil className="h-3 w-3" /> }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFaultSourceFilter(filter.id as any)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold transition-all',
                  faultSourceFilter === filter.id 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700/50'
                )}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>

          {syncError && (
            <div className="mx-1 mb-4 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-[10px] font-bold text-red-600 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400 uppercase tracking-widest animate-in fade-in slide-in-from-top-1 duration-300">
              <AlertCircle className="h-3 w-3" />
              {syncError}
            </div>
          )}
          {userProgress.drivingSessions.length === 0 ? (
            <EmptyState
              icon={<Car className="h-8 w-8 text-slate-400" />}
              title={t.tracker.noSessionsTitle || 'No sessions yet'}
              message={t.tracker.noSessionsMessage || 'Start your first live driving session to track your progress.'}
            />
          ) : (
            <div className="space-y-4">
              {[...userProgress.drivingSessions]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div 
                      className="cursor-pointer p-4"
                      onClick={() => setExpandedSessionId(expandedSessionId === session.id ? null : session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-xl',
                            getTypeColor(session.type)
                          )}>
                            {getTypeIcon(session.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 dark:text-white">
                                {getTypeLabel(session.type)}
                              </h4>
                              {session.syncStatus === 'synced' ? (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400 flex items-center gap-1">
                                  <Cloud className="h-2 w-2" />
                                  {t.tracker.published || 'Published'}
                                </span>
                              ) : (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-600 dark:bg-amber-900/10 dark:text-amber-400">
                                  {t.tracker.pendingSync || 'Syncing...'}
                                </span>
                              )}
                              {session.isSimulation && (
                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                                  SIM
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDate(session.date, true)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right mr-2">
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {session.duration} <span className="text-[10px] font-bold text-slate-400">min</span>
                            </p>
                            <div className="flex items-center justify-end gap-2">
                              {session.mistakes && session.mistakes.length > 0 && (
                                <div className="flex h-4 items-center gap-1 rounded bg-red-50 px-1 dark:bg-red-900/20">
                                  <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
                                  <span className="text-[8px] font-black text-red-600 dark:text-red-400">
                                    {session.mistakes.length}
                                  </span>
                                </div>
                              )}
                              {session.totalDistance !== undefined && (
                                <p className="text-[10px] font-bold text-slate-500">
                                  {session.totalDistance.toFixed(1)} km
                                </p>
                              )}
                            </div>
                          </div>
                          {expandedSessionId === session.id ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                        </div>
                      </div>

                      {session.locationSummary && (
                        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {session.locationSummary}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {expandedSessionId === session.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-slate-50 bg-slate-50/30 p-4 dark:border-slate-800/50 dark:bg-slate-900/30"
                        >
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                {t.tracker.cost || 'Cost'}
                              </p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">
                                €{((session.duration / 45) * userProgress.hourlyRate45).toFixed(2)}
                              </p>
                            </div>
                            <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                                {t.tracker.mistakesCount || 'Mistakes'}
                              </p>
                              <p className={cn(
                                'text-lg font-black',
                                (session.mistakes?.length || 0) === 0 ? 'text-green-500' : 'text-red-500'
                              )}>
                                {session.mistakes?.length || 0}
                              </p>
                            </div>
                          </div>

                          {/* Route Map (Premium Gated) */}
                          {session.route && session.route.length >= 2 && (
                            isPremium ? (
                              <RouteMap 
                                route={session.route} 
                                mistakes={session.mistakes} 
                                language={language} 
                              />
                            ) : (
                              <div className="relative overflow-hidden rounded-xl bg-slate-100 p-8 text-center dark:bg-slate-800/50">
                                <div className="absolute inset-0 bg-slate-200/10 backdrop-blur-[1px]" />
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                                    <MapPin className="h-6 w-6" />
                                  </div>
                                  <p className="mb-4 text-xs font-medium text-slate-600 dark:text-slate-400 max-w-[200px] mx-auto">
                                    {t.tracker.routeMapUpgradeNote}
                                  </p>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onOpenPaywall?.(); }}
                                    className="rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-blue-600/20 active:scale-95"
                                  >
                                    {t.tracker.unlockPro}
                                  </button>
                                </div>
                              </div>
                            )
                          )}

                          {/* Mistakes List (Premium Gated) */}
                          {session.mistakes && session.mistakes.length > 0 && (
                            <div className="mt-4">
                              <div className="mb-3 flex items-center justify-between">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  {((t.tracker as any).mistakeLog as string) || 'Mistake Log'}
                                </h5>
                                {!isPremium && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                                    PRO Analysis
                                  </span>
                                )}
                              </div>
                              
                              {isPremium ? (
                                <div className="grid grid-cols-1 gap-2">
                                  {(() => {
                                    const filteredMistakes = session.mistakes.filter(m => 
                                      faultSourceFilter === 'all' || 
                                      (m.source === faultSourceFilter) || 
                                      (faultSourceFilter === 'auto' && !m.source)
                                    );
                                    const pendingMistakes = filteredMistakes.filter(m => !m.status || m.status === 'pending');
                                    const confirmedMistakes = filteredMistakes.filter(m => m.status === 'confirmed');
                                    
                                    const groups: Record<string, { type: string, source: 'auto' | 'manual', count: number, latest: number }> = {};
                                    confirmedMistakes.forEach(m => {
                                      const source = m.source || 'auto';
                                      const key = `${m.type}-${source}`;
                                      if (!groups[key]) {
                                        groups[key] = { type: m.type, source, count: 0, latest: m.timestamp };
                                      }
                                      groups[key].count++;
                                      if (m.timestamp > groups[key].latest) {
                                        groups[key].latest = m.timestamp;
                                      }
                                    });

                                    return (
                                      <div className="space-y-4">
                                        {pendingMistakes.length > 0 && (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                                              <span className="text-[9px] font-black uppercase tracking-tighter text-amber-600 dark:text-amber-400">
                                                {language === 'de' ? 'ÜBERPRÜFUNG ERFORDERLICH' : 'NEEDS REVIEW'}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                              {pendingMistakes.map((m, idx) => (
                                                <div key={`pending-${idx}`} className="flex items-center justify-between rounded-xl bg-amber-50/50 p-2 text-xs shadow-sm ring-1 ring-amber-100 dark:bg-amber-900/10 dark:ring-amber-900/20">
                                                  <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-800">
                                                      {getMistakeIconComponent(m.type)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{getMistakeLabel(m.type)}</span>
                                                        <span className={cn(
                                                          'rounded px-1 py-0.5 text-[7px] font-black uppercase tracking-widest',
                                                          (m.source === 'manual') 
                                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/20'
                                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                        )}>
                                                          {m.source === 'manual' ? 'Manual' : 'Auto'}
                                                        </span>
                                                      </div>
                                                      <span className="text-[8px] font-medium text-slate-400">
                                                        {new Date(m.timestamp).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-1">
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); updateMistakeStatus(session.id, m.timestamp, 'rejected'); }}
                                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition hover:bg-red-50 hover:text-red-500 dark:bg-slate-800 dark:hover:bg-red-900/20"
                                                      title={t.common.reject}
                                                    >
                                                      <X className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); updateMistakeStatus(session.id, m.timestamp, 'confirmed'); }}
                                                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
                                                      title={t.common.approve}
                                                    >
                                                      <Check className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {Object.keys(groups).length > 0 && (
                                          <div className="space-y-2">
                                            {pendingMistakes.length > 0 && (
                                              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                                {language === 'de' ? 'BESTÄTIGTES PROTOKOLL' : 'VERIFIED LOG'}
                                              </span>
                                            )}
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                              {Object.values(groups)
                                                .sort((a, b) => b.latest - a.latest)
                                                .map((group, idx) => (
                                                  <div 
                                                    key={`verified-${idx}`} 
                                                    className="flex items-center justify-between rounded-xl bg-white p-2.5 text-xs shadow-sm ring-1 ring-slate-100 transition-all hover:ring-slate-200 dark:bg-slate-800 dark:ring-slate-700/50 dark:hover:ring-slate-700"
                                                  >
                                                    <div className="flex items-center gap-3">
                                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                                        {getMistakeIconComponent(group.type)}
                                                      </div>
                                                      <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                          <span className="font-bold text-slate-700 dark:text-slate-200">
                                                            {getMistakeLabel(group.type)}
                                                          </span>
                                                          <span className={cn(
                                                            'rounded px-1 py-0.5 text-[7px] font-black uppercase tracking-widest',
                                                            (group.source === 'manual') 
                                                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-500/20'
                                                              : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                          )}>
                                                            {group.source === 'manual' ? 'Manual' : 'Auto'}
                                                          </span>
                                                        </div>
                                                        <span className="text-[9px] font-medium text-slate-400">
                                                          {group.count > 1 ? `${group.count}x · ` : ''} 
                                                          {new Date(group.latest).toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                      </div>
                                                    </div>
                                                    {group.count > 1 && (
                                                      <div className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-slate-50 px-2 dark:bg-slate-900/50">
                                                        <span className="text-[10px] font-black text-slate-400">
                                                          ×{group.count}
                                                        </span>
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-700">
                                  <p className="mb-2 text-[10px] font-medium text-slate-500 italic">
                                    {t.tracker.faultAnalysisUpgradeNote}
                                  </p>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); onOpenPaywall?.(); }}
                                    className="text-[10px] font-bold text-blue-600 hover:underline dark:text-blue-400"
                                  >
                                    {t.tracker.seeDetails}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Notes */}
                          {session.notes && (
                            <div className="mt-4">
                              <h5 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {((t.tracker as any).notes as string) || 'Notes'}
                              </h5>
                              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                "{session.notes}"
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                              onClick={() => handleRemoveSession(session.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditOpen(session)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Safety Warning Modal (§ 23 StVO Compliance) */}
      <AnimatePresence>
        {showSafetyWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="safety-warning-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
                  <ShieldAlert className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              
              <h3 className="mb-2 text-center text-2xl font-black text-slate-900 dark:text-white">
                Safety Protocol: StVO § 23 Compliance
              </h3>
              
              <p className="mb-6 text-center text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                In Germany, using a mobile phone while driving is prohibited unless it is secured in a mount. 
                Confirm your device is properly mounted before starting the tracking session.
              </p>

              <div className="mb-8 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <label className="flex cursor-pointer items-start gap-3">
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      data-testid="mount-confirmation-checkbox"
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-slate-600 dark:bg-slate-800"
                      checked={isMountConfirmed}
                      onChange={(e) => setIsMountConfirmed(e.target.checked)}
                    />
                    <Check className="pointer-events-none absolute h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    I confirm that my smartphone is secured in a suitable vehicle mount and I will not operate it while driving.
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (isMountConfirmed) {
                      setIsDeviceMounted(true);
                      setShowSafetyWarning(false);
                      handleStartTimer(true);
                    }
                  }}
                  disabled={!isMountConfirmed}
                  data-testid="confirm-mount-btn"
                  className={cn(
                    'w-full rounded-2xl py-4 font-black text-white shadow-lg transition-all active:scale-95',
                    isMountConfirmed 
                      ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900' 
                      : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                  )}
                >
                  Confirm & Start
                </button>
                <button
                  onClick={() => setShowSafetyWarning(false)}
                  className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrivacyInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900"
            >
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
                  <ShieldCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <h3 className="mb-2 text-center text-2xl font-black text-slate-900 dark:text-white">
                Privacy & Data Policy
              </h3>
              
              <div className="mb-6 max-h-[300px] overflow-y-auto pr-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                <p className="mb-4">
                  To provide real-time driving analysis, DriveDE processes your GPS and motion sensor data locally on your device and via secure cloud services.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Local Processing:</strong> All route tracking and speed analysis happens on-device.</li>
                  <li><strong>Automated Analysis:</strong> Specific driving events (mistakes) may be analyzed using anonymized telemetry.</li>
                  <li><strong>GDPR Compliance:</strong> You have the right to export or delete your data at any time via the Account tab.</li>
                </ul>
                <p className="mt-4 font-bold text-slate-900 dark:text-slate-100">
                  Legal Basis: Art. 6 (1) (b) GDPR - Performance of contract.
                </p>
              </div>

              <div className="mb-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <label className="flex cursor-pointer items-start gap-3">
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      data-testid="privacy-consent-checkbox"
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white transition-all checked:border-blue-500 checked:bg-blue-500 dark:border-slate-600 dark:bg-slate-800"
                      checked={privacyConsent}
                      onChange={(e) => setPrivacyConsent(e.target.checked)}
                    />
                    <Check className="pointer-events-none absolute h-4 w-4 scale-0 text-white transition-transform peer-checked:scale-100" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    I have read the Privacy Policy and I agree to the processing of my location and sensor data for driving analysis.
                  </span>
                </label>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    if (privacyConsent) {
                      setAcceptedPrivacy(true);
                      setShowPrivacyInfo(false);
                      handleStartTimer(true, true);
                    }
                  }}
                  disabled={!privacyConsent}
                  data-testid="accept-privacy-btn"
                  className={cn(
                    'w-full rounded-2xl py-4 font-black text-white shadow-lg transition-all active:scale-95',
                    privacyConsent 
                      ? 'bg-blue-600 hover:bg-blue-500' 
                      : 'bg-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                  )}
                >
                  I Agree & Accept
                </button>
                <button
                  onClick={() => setShowPrivacyInfo(false)}
                  className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPremium && !isSimulationMode && isTimerRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] pointer-events-none"
          >
            <div className="rounded-full bg-slate-900/80 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white border border-white/10 shadow-2xl animate-pulse">
              Safe Driving Mode Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Session Modal */}
      {showAddForm && (
        <div 
          data-testid="add-session-modal"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
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
                  ? t.tracker.editSessionTitle
                  : t.tracker.addSessionTitle}
              </h3>
              <button
                onClick={handleCloseForm}
                data-testid="close-add-session-btn"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.tracker.dateLabel}
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
                  {t.tracker.driveTypeLabel}
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
                    {t.tracker.durationLabel}
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
                    {t.tracker.distanceLabel}
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
                  {t.tracker.instructorLabel}
                </label>
                <input
                  type="text"
                  value={newSession.instructorName}
                  onChange={(e) => setNewSession({ ...newSession, instructorName: e.target.value })}
                  placeholder={t.common.name}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.tracker.locationLabel}
                </label>
                <input
                  type="text"
                  value={newSession.locationSummary || ''}
                  onChange={(e) => setNewSession({ ...newSession, locationSummary: e.target.value })}
                  placeholder={t.tracker.locationPlaceholder}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t.common.notes} (optional)
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder={t.tracker.notesPlaceholder}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Footer (Sticky) — always visible above safe area */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <button
                onClick={handleAddSession}
                data-testid="save-session-btn"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-600 hover:to-blue-700 active:scale-[0.98]"
              >
                {editingSessionId 
                  ? t.common.saveChanges
                  : t.common.saveSession}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Manual Log Modal */}
      <AnimatePresence>
        {showManualLog && (
          <motion.div 
            data-testid="manual-log-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900 border border-white/10 sm:max-w-md shadow-2xl p-6"
            >
              <div className="mb-6 flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {t.tracker.manualLogTitle}
                  </h4>
                </div>
                <button 
                  onClick={() => setShowManualLog(false)} 
                  className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 overflow-y-auto max-h-[60dvh] pr-1 custom-scrollbar">
                <button 
                  onClick={() => handleManualMistake('priority')} 
                  data-testid="manual-mistake-priority"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.priority}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('stop_sign')} 
                  data-testid="manual-mistake-stop_sign"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <Square className="h-6 w-6 text-red-600" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.stopSign}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('right_before_left')} 
                  data-testid="manual-mistake-right_before_left"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <CornerUpRight className="h-6 w-6 text-amber-500" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.rightBeforeLeft}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('wrong_way')} 
                  data-testid="manual-mistake-wrong_way"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <Ban className="h-6 w-6 text-red-700" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.wrongWay}</span>
                </button>

                <button 
                  onClick={() => handleManualMistake('shoulder_check')} 
                  data-testid="manual-mistake-shoulder_check"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <Eye className="h-6 w-6 text-blue-400" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.shoulderCheck}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('mirror_check')} 
                  data-testid="manual-mistake-mirror_check"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                   <View className="h-6 w-6 text-slate-400" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.mirrorCheck}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('signal')} 
                  data-testid="manual-mistake-signal"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <Signal className="h-6 w-6 text-amber-400" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.signal}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('pedestrian_safety')} 
                  data-testid="manual-mistake-pedestrian_safety"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                   <Footprints className="h-6 w-6 text-purple-400" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.pedestrianSafety}</span>
                </button>

                <button 
                  onClick={() => handleManualMistake('speeding')} 
                  data-testid="manual-mistake-speeding"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <Gauge className="h-6 w-6 text-red-400" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.speeding}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('harsh_braking')} 
                  data-testid="manual-mistake-harsh_braking"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                   <AlertCircle className="h-6 w-6 text-orange-500" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.harshBraking}</span>
                </button>
                <button 
                  onClick={() => handleManualMistake('other')} 
                  data-testid="manual-mistake-other"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/5 p-4 text-[10px] font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 border border-white/5"
                >
                  <MoreHorizontal className="h-6 w-6 text-slate-500" />
                  <span className="text-center leading-tight">{t.tracker.mistakes.other}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

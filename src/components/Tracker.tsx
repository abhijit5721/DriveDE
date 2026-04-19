import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock, Calendar, Car, MapPin, Moon, Route, X, Play, Pause, Square, Crown, Pencil } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType } from '../utils/license';
import { EmptyState } from './EmptyState';
import type { DrivingSession } from '../types';

const RoutePreview = ({ route, language }: { route: NonNullable<DrivingSession['route']>, language: string }) => {
  if (route.length < 2) return null;

  // Find bounds
  const lats = route.map(p => p.lat);
  const lngs = route.map(p => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  const width = 200;
  const height = 120;
  const padding = 10;

  // Scale points to SVG space
  const scale = (val: number, min: number, max: number, range: number) => {
    const diff = max - min;
    if (diff === 0) return range / 2;
    return padding + ((val - min) / diff) * (range - 2 * padding);
  };

  const points = route.map(p => ({
    x: scale(p.lng, minLng, maxLng, width),
    y: height - scale(p.lat, minLat, maxLat, height) // Flip Y for SVG
  }));

  const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  const isDE = language === 'de';

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          {isDE ? 'Streckenverlauf' : 'Route Trace'}
        </span>
        <div className="flex gap-2">
           <div className="flex items-center gap-1">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
             <span className="text-[9px] text-slate-400">{isDE ? 'Start' : 'Start'}</span>
           </div>
           <div className="flex items-center gap-1">
             <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
             <span className="text-[9px] text-slate-400">{isDE ? 'Ende' : 'End'}</span>
           </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-4">
        <svg width={width} height={height} className="drop-shadow-sm">
          <path
            d={pathData}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          {/* Start Point */}
          <circle cx={points[0].x} cy={points[0].y} r="4" fill="#10b981" />
          {/* End Point */}
          <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r="4" fill="#ef4444" />
        </svg>
      </div>
    </div>
  );
};

export function Tracker({ onOpenPaywall }: TrackerProps) {
  const { language, userProgress, addDrivingSession, updateDrivingSession, removeDrivingSession, setHourlyRate45, licenseType, isPremium } = useAppStore();
  const SESSION_LIMIT = 3;
  const hasReachedLimit = !isPremium && userProgress.drivingSessions.length >= SESSION_LIMIT;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(userProgress.hourlyRate45.toString());

  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    duration: 45,
    type: 'normal' as DrivingSession['type'],
    notes: '',
    instructorName: '',
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [gpsPoints, setGpsPoints] = useState<DrivingSession['route']>([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchRef = useRef<number | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isDE = language === 'de';
  const isUmschreibung = getLearningPathFromLicenseType(licenseType) === 'umschreibung';

  const totalSpending = (userProgress.totalDrivingMinutes / 45) * userProgress.hourlyRate45;

  const handleSaveRate = () => {
    const rate = parseFloat(tempRate) || 0;
    setHourlyRate45(rate);
    setIsEditingRate(false);
    toast.success(isDE ? 'Stundensatz aktualisiert!' : 'Rate updated!');
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      // Start GPS Tracking
      if ("geolocation" in navigator && isPremium) {
        watchRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude: lat, longitude: lng, speed } = position.coords;
            const newPoint = { lat, lng, timestamp: Date.now() };
            
            setGpsPoints(prev => {
              const lastPoint = prev[prev.length - 1];
              if (lastPoint) {
                const dist = calculateDistance(lastPoint.lat, lastPoint.lng, lat, lng);
                if (dist > 0.005) { // Only add if moved > 5 meters to save space
                  setCurrentDistance(d => d + dist);
                  return [...prev, newPoint];
                }
                return prev;
              }
              return [newPoint];
            });

            if (speed !== null) {
              setCurrentSpeed(Math.round(speed * 3.6)); // m/s to km/h
            }
          },
          (error) => console.error('GPS Error:', error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [isTimerRunning, isPremium]);

  const handleStartTimer = () => {
    setElapsedTime(0);
    setCurrentDistance(0);
    setGpsPoints([]);
    setIsTimerRunning(true);
    toast(isDE ? 'Fahrt-Timer & GPS gestartet!' : 'Drive timer & GPS started!', { icon: '️🛰️' });
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    toast(isDE ? 'Timer pausiert' : 'Timer paused', { icon: '⏸️' });
  };

  const handleStopTimer = async () => {
    setIsTimerRunning(false);
    const durationInMinutes = Math.max(1, Math.round(elapsedTime / 60));
    
    // Optional: Get location summary via reverse geocoding if we have points
    let locationSummary = '';
    if (gpsPoints.length > 0) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${gpsPoints[0].lat}&lon=${gpsPoints[0].lng}&format=json`);
        const data = await response.json();
        locationSummary = data.address.city || data.address.town || data.address.suburb || '';
        if (data.address.suburb && data.address.city) locationSummary = `${data.address.city}, ${data.address.suburb}`;
      } catch (e) {
        console.error('Geocoding failed');
      }
    }

    setNewSession(prev => ({
      ...prev,
      duration: durationInMinutes,
      date: new Date().toISOString().split('T')[0],
      totalDistance: Math.round(currentDistance * 10) / 10,
      route: gpsPoints,
      locationSummary: locationSummary || undefined
    }));
    setShowAddForm(true);
    setElapsedTime(0);
    toast.success(isDE ? 'Bereit zum Speichern!' : 'Ready to save!');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getTypeLabel = (type: DrivingSession['type']) => {
    const labels = {
      normal: { de: 'Normal', en: 'Regular' },
      ueberland: { de: 'Überland', en: 'Country' },
      autobahn: { de: 'Autobahn', en: 'Highway' },
      nacht: { de: 'Nacht', en: 'Night' },
    };
    return isDE ? labels[type].de : labels[type].en;
  };

  const getTypeIcon = (type: DrivingSession['type']) => {
    switch (type) {
      case 'normal': return <Car className="h-4 w-4" />;
      case 'ueberland': return <Route className="h-4 w-4" />;
      case 'autobahn': return <MapPin className="h-4 w-4" />;
      case 'nacht': return <Moon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: DrivingSession['type']) => {
    switch (type) {
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'ueberland': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'autobahn': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
      case 'nacht': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
    }
  };

  const handleAddSession = () => {
    if (editingSessionId) {
      updateDrivingSession(editingSessionId, newSession);
      toast.success(isDE ? 'Fahrstunde aktualisiert!' : 'Session updated!');
    } else {
      addDrivingSession(newSession);
      toast.success(isDE ? 'Fahrstunde gespeichert!' : 'Session saved!');
    }
    handleCloseForm();
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingSessionId(null);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      duration: 45,
      type: 'normal',
      notes: '',
      instructorName: '',
    });
  };

  const handleEditOpen = (session: DrivingSession) => {
    setEditingSessionId(session.id);
    setNewSession({
      date: session.date,
      duration: session.duration,
      type: session.type,
      notes: session.notes,
      instructorName: session.instructorName || '',
    });
    setShowAddForm(true);
  };

  const handleRemoveSession = (sessionId: string) => {
    removeDrivingSession(sessionId);
    toast.error(isDE ? 'Fahrstunde gelöscht' : 'Session deleted');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(isDE ? 'de-DE' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const normalMinutes = userProgress.drivingSessions
    .filter(s => s.type === 'normal')
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isDE ? 'Fahrtenbuch' : 'Driving Log'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isDE
              ? 'Dokumentiere deine Fahrstunden'
              : 'Track your driving lessons'}
          </p>
        </div>
        <button
          onClick={() => {
            if (hasReachedLimit) {
              onOpenPaywall();
            } else {
              setShowAddForm(true);
            }
          }}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg transition-all",
            hasReachedLimit 
              ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-amber-900/30"
              : "bg-blue-500 hover:bg-blue-600 shadow-blue-200 dark:shadow-blue-900/30"
          )}
        >
          {hasReachedLimit ? <Crown className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {/* Cost Settings */}
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
                    className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-bold focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
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

      {/* Live Timer */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white shadow-xl dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-300" />
            <h3 className="font-semibold">{isDE ? 'Live-Fahrt-Timer' : 'Live Drive Timer'}</h3>
          </div>
          {isTimerRunning && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
        </div>
        <div className="my-4 flex flex-col items-center">
          <div className="text-5xl font-bold tracking-tighter">
            {formatTime(elapsedTime)}
          </div>
          
          {isPremium && (
            <div className="mt-4 grid w-full grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {isDE ? 'Strecke' : 'Distance'}
                </p>
                <p className="text-xl font-bold">{currentDistance.toFixed(1)} <span className="text-sm font-medium opacity-60">km</span></p>
              </div>
              <div className="text-center border-l border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {isDE ? 'Tempo' : 'Speed'}
                </p>
                <p className="text-xl font-bold">{currentSpeed} <span className="text-sm font-medium opacity-60">km/h</span></p>
              </div>
            </div>
          )}

          {!isPremium && isTimerRunning && (
            <p className="mt-2 text-[10px] text-slate-400 italic">
              {isDE ? 'Upgrade für GPS & Routen-Tracking' : 'Upgrade for GPS & Route tracking'}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isTimerRunning ? (
            <button
              onClick={handlePauseTimer}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              <Pause className="h-4 w-4" />
              {isDE ? 'Pause' : 'Pause'}
            </button>
          ) : (
            <button
              onClick={() => {
                if (hasReachedLimit) {
                  onOpenPaywall();
                } else {
                  handleStartTimer();
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
            >
              <Play className="h-4 w-4" />
              {isDE ? 'Start' : 'Start'}
            </button>
          )}
          <button
            onClick={handleStopTimer}
            disabled={elapsedTime === 0 && !isTimerRunning}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
          {isDE ? 'Letzte Fahrstunden' : 'Recent Sessions'}
        </h3>

        {userProgress.drivingSessions.length === 0 ? (
          <EmptyState
            icon={<Car className="h-10 w-10 text-slate-400 dark:text-slate-500" />}
            title={isDE ? 'Keine Fahrstunden' : 'No Driving Sessions'}
            message={isDE ? 'Hier werden deine eingetragenen Fahrstunden angezeigt.' : 'Your logged driving sessions will appear here.'}
            action={
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                <Plus className="h-4 w-4" />
                {isDE ? 'Erste Fahrstunde hinzufügen' : 'Add First Session'}
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {userProgress.drivingSessions
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    getTypeColor(session.type)
                  )}>
                    {getTypeIcon(session.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {getTypeLabel(session.type)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {session.duration} min
                      </span>
                      {userProgress.hourlyRate45 > 0 && (
                        <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400">
                          €{((session.duration / 45) * userProgress.hourlyRate45).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.date)}
                      </div>
                      {session.totalDistance && (
                        <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                          <Route className="h-3 w-3" />
                          {session.totalDistance} km
                        </div>
                      )}
                      {session.locationSummary && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.locationSummary}
                        </div>
                      )}
                      {session.instructorName && (
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-slate-300" />
                          {session.instructorName}
                        </div>
                      )}
                    </div>
                    {session.notes && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {session.notes}
                      </p>
                    )}
                    {session.route && session.route.length > 0 && (
                      <RoutePreview route={session.route} language={language} />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditOpen(session)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/30"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveSession(session.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 max-h-[85vh]">
            
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value, 10) || 0 })}
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
                    value={newSession.totalDistance || ''}
                    onChange={(e) => setNewSession({ ...newSession, totalDistance: parseFloat(e.target.value) || undefined })}
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

            {/* Footer (Sticky) */}
            <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-700">
              <button
                onClick={handleAddSession}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
              >
                {editingSessionId 
                  ? (isDE ? 'Änderungen speichern' : 'Save Changes')
                  : (isDE ? 'Fahrstunde speichern' : 'Save Session')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

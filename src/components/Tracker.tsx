import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock, Calendar, Car, MapPin, Moon, Route, X, Play, Pause, Square, Crown, Pencil, AlertTriangle, Zap, Footprints, Eye, Signal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType } from '../utils/license';
import { EmptyState } from './EmptyState';
import type { DrivingSession, DrivingMistake } from '../types';

import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapBoundsSimple = ({ points }: { points: { lat: number, lng: number }[] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.panTo([points[points.length-1].lat, points[points.length-1].lng], { animate: true });
    }
  }, [points, map]);
  return null;
};

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

const RouteMap = ({ route, mistakes, language }: { route: NonNullable<DrivingSession['route']>, mistakes?: DrivingMistake[], language: string }) => {
  if (route.length < 2) return null;
  const isDE = language === 'de';
  const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const startPoint = [route[0].lat, route[0].lng] as [number, number];
  const endPoint = [route[route.length-1].lat, route[route.length-1].lng] as [number, number];
  const polyline = route.map(p => [p.lat, p.lng] as [number, number]);

  useEffect(() => {
    if (isPlaying && playbackIndex !== null) {
      playbackTimeoutRef.current = setTimeout(() => {
        if (playbackIndex < route.length - 1) {
          setPlaybackIndex(playbackIndex + 1);
        } else {
          setIsPlaying(false);
          setPlaybackIndex(null);
        }
      }, 1000); // Even slower playback as requested
    }
    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, [isPlaying, playbackIndex, route.length]);

  const handleTogglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setPlaybackIndex(0);
      setIsPlaying(true);
    }
  };

  // Component to fit bounds automatically
  const MapBounds = () => {
    const map = useMap();
    useEffect(() => {
      if (playbackIndex === null) {
        const bounds = L.latLngBounds(polyline);
        map.fitBounds(bounds, { padding: [20, 20] });
      } else {
        const point = route[playbackIndex];
        map.panTo([point.lat, point.lng], { animate: true });
      }
    }, [map, playbackIndex]);
    return null;
  };

  const getMistakeIcon = (type: DrivingMistake['type']) => {
    let color = '#ef4444'; // default red
    if (type === 'harsh_braking') color = '#f97316'; // orange
    if (type === 'rapid_acceleration') color = '#3b82f6'; // blue
    if (type === 'wrong_way') color = '#c026d3'; // vivid magenta
    
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
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds />
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

          {mistakes?.map((m, i) => m.location && (
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
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);
  const [currentMistakes, setCurrentMistakes] = useState<DrivingMistake[]>([]);
  const [activeStopSign, setActiveStopSign] = useState<{lat: number, lng: number, id: string} | null>(null);
  const [hasStoppedAtSign, setHasStoppedAtSign] = useState(false);
  const lastWrongWayLogRef = useRef<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchRef = useRef<number | null>(null);
  const limitCheckRef = useRef<NodeJS.Timeout | null>(null);
  const lastMotionLogRef = useRef<number>(0);
  const [showManualLog, setShowManualLog] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkNearbyStopSign = async (lat: number, lng: number) => {
    try {
      // Look for stop signs within 25m
      const query = `[out:json];node(around:25,${lat},${lng})["highway"="stop"];out;`;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.elements && data.elements.length > 0) {
        const sign = data.elements[0];
        // Only trigger if it's a new sign to avoid double counting
        if (!activeStopSign || activeStopSign.id !== sign.id.toString()) {
          setActiveStopSign({
            lat: sign.lat,
            lng: sign.lon,
            id: sign.id.toString()
          });
          setHasStoppedAtSign(false);
          toast.info(isDE ? 'Stoppschild voraus!' : 'Stop Sign Ahead!');
        }
      }
    } catch (e) {
      console.error('Stop sign fetch failed');
    }
  };

  // ─── Wrong Way Driving Detection ───────────────────────────────────────────
  // Queries Overpass for oneway roads at the car's position, extracts geometry,
  // computes the road's bearing, then compares against the car's travel bearing.
  // If the angle difference is >120° the car is driving against traffic.
  const checkWrongWayDriving = async (lat: number, lng: number, travelBearing: number) => {
    // 30-second cooldown to avoid toast spam
    if (Date.now() - lastWrongWayLogRef.current < 30000) return;
    if (currentSpeed < 10) return; // ignore while nearly stopped

    try {
      // Fetch the nearest one-way road WITH geometry so we can compute its direction
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

      // Use the first two nodes to determine the road's legal travel direction
      const roadBearing = calculateBearing(
        nodes[0].lat, nodes[0].lon,
        nodes[1].lat, nodes[1].lon
      );

      // Angle difference between road direction and car's travel direction
      let angleDiff = Math.abs(travelBearing - roadBearing);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      // >120° means the car is travelling broadly against the legal direction
      if (angleDiff > 120) {
        lastWrongWayLogRef.current = Date.now();
        toast.error(
          isDE ? '⛔ Falschfahrer erkannt! Sofort anhalten!' : '⛔ Wrong Way! Stop immediately!',
          { position: 'bottom-center', duration: 6000 }
        );
        setCurrentMistakes(prev => [...prev, {
          type: 'wrong_way',
          timestamp: Date.now(),
          location: { lat, lng }
        }]);
      }
    } catch (e) {
      // Network errors are silently ignored — non-critical sensor
    }
  };

  const fetchSpeedLimit = async (lat: number, lng: number) => {
    try {
      // Overpass API query for nearest way with maxspeed
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
    } catch (e) {
      console.error('Speed limit fetch failed');
      return null;
    }
  };

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

      // Start periodic API checks (every 10 seconds)
      limitCheckRef.current = setInterval(() => {
        if (gpsPoints.length > 1) {
          const lastPoint = gpsPoints[gpsPoints.length - 1];
          const prevPoint = gpsPoints[gpsPoints.length - 2];
          fetchSpeedLimit(lastPoint.lat, lastPoint.lng);
          checkNearbyStopSign(lastPoint.lat, lastPoint.lng);
          // Compute travel bearing for wrong-way check
          const bearing = calculateBearing(prevPoint.lat, prevPoint.lng, lastPoint.lat, lastPoint.lng);
          checkWrongWayDriving(lastPoint.lat, lastPoint.lng, bearing);
        }
      }, 10000);

      // Start GPS Tracking
      if ("geolocation" in navigator && isPremium) {
        watchRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude: lat, longitude: lng, speed } = position.coords;
            const newPoint = { lat, lng, timestamp: Date.now() };
            const currentKmh = speed !== null ? Math.round(speed * 3.6) : 0;
            
            setCurrentSpeed(currentKmh);
            
            setGpsPoints(prev => {
              const lastPoint = prev[prev.length - 1];
              if (lastPoint) {
                const dist = calculateDistance(lastPoint.lat, lastPoint.lng, lat, lng);
                if (dist > 0.005) { // Only add if moved > 5 meters
                  setCurrentDistance(d => d + dist);
                  return [...prev, newPoint];
                }
                return prev;
              }
              return [newPoint];
            });
          },
          (error) => console.error('GPS Error:', error),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }

      // Start Motion Auditor (Accelerometer)
      const handleMotion = (event: DeviceMotionEvent) => {
        if (!isPremium || isSimulationMode) return;
        
        const acc = event.acceleration;
        if (!acc) return;

        const x = acc.x || 0;
        const y = acc.y || 0;
        const z = acc.z || 0;
        const totalAcc = Math.sqrt(x*x + y*y + z*z);

        // Threshold for "harsh" driving: 4.0 m/s^2
        if (totalAcc > 4.0 && Date.now() - lastMotionLogRef.current > 10000) {
          lastMotionLogRef.current = Date.now();
          
          navigator.geolocation.getCurrentPosition((pos) => {
            const isBraking = y < -3.0; // Simplistic guess
            const type = isBraking ? 'harsh_braking' : 'rapid_acceleration';
            
            setCurrentMistakes(prev => [...prev, {
              type,
              timestamp: Date.now(),
              location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
            }]);

            toast.error(
              isDE 
                ? (isBraking ? 'Starkes Bremsen erkannt!' : 'Starke Beschleunigung erkannt!')
                : (isBraking ? 'Harsh braking detected!' : 'Rapid acceleration detected!'),
              { position: 'bottom-center' }
            );
          });
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
        if (timerRef.current) clearInterval(timerRef.current);
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
        if (limitCheckRef.current) clearInterval(limitCheckRef.current);
      };
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      if (limitCheckRef.current) clearInterval(limitCheckRef.current);
    }
  }, [isTimerRunning]);

  // Safety Auditing Hook (Reactive to Speed & Location)
  useEffect(() => {
    if (!isTimerRunning || gpsPoints.length === 0) return;

    const lastPoint = gpsPoints[gpsPoints.length - 1];

    // 1. Stop Sign Monitoring
    if (activeStopSign) {
      if (currentSpeed === 0) {
        setHasStoppedAtSign(true);
      }

      const distFromSign = calculateDistance(lastPoint.lat, lastPoint.lng, activeStopSign.lat, activeStopSign.lng);
      if (distFromSign > 0.04) { // 40 meters away
        if (!hasStoppedAtSign) {
          toast.error(isDE ? 'Stoppschild überfahren!' : 'Stop Sign Violation!', { position: 'bottom-center' });
          setCurrentMistakes(prev => [...prev, {
            type: 'stop_sign' as any,
            timestamp: Date.now(),
            location: { lat: activeStopSign.lat, lng: activeStopSign.lng }
          }]);
        }
        setActiveStopSign(null);
        setHasStoppedAtSign(false);
      }
    }

    // 2. Speeding Monitoring
    if (currentLimit && currentSpeed > currentLimit + 5) {
      setCurrentMistakes(prev => {
        const lastMistake = prev[prev.length - 1];
        // 30 second cooldown between speeding mistakes of the same type
        if (!lastMistake || (Date.now() - lastMistake.timestamp > 30000) || lastMistake.type !== 'speeding') {
          toast.error(isDE ? `Geschwindigkeitsüberschreitung! (Limit: ${currentLimit})` : `Speeding! (Limit: ${currentLimit})`, { position: 'bottom-center' });
          return [...prev, {
            type: 'speeding',
            speed: currentSpeed,
            limit: currentLimit,
            timestamp: Date.now(),
            location: { lat: lastPoint.lat, lng: lastPoint.lng }
          }];
        }
        return prev;
      });
    }
  }, [gpsPoints, currentSpeed, currentLimit, activeStopSign, hasStoppedAtSign, isTimerRunning, isDE]);

  const handleStartTimer = async () => {
    // Request Motion permission for iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState !== 'granted') {
          toast.error(isDE ? 'Bewegungssensoren-Zugriff verweigert' : 'Motion sensor access denied');
        }
      } catch (e) {
        console.error('Motion permission error', e);
      }
    }

    if (isSimulationMode) {
      // — Route layout —
      // Steps 0-4:  Normal drive, stop sign ignored → violation fires at step 4
      // Step 6:     Car reverses into a one-way street → wrong-way violation fires
      const stopLat = 52.5205;
      const stopLng = 13.4055;
      const mockPoints = [
        { lat: 52.5200, lng: 13.4050, speed: 20, limit: 50 },  // step 0: approaching stop sign
        { lat: stopLat,  lng: stopLng,  speed: 15, limit: 50 }, // step 1: at stop sign – SHOULD stop
        { lat: 52.5210, lng: 13.4060, speed: 25, limit: 50 },  // step 2: rolled through
        { lat: 52.5220, lng: 13.4075, speed: 40, limit: 50 },  // step 3: accelerating away
        { lat: 52.5230, lng: 13.4090, speed: 55, limit: 50 },  // step 4: >50m past sign → stop sign violation fires
        { lat: 52.5237, lng: 13.4105, speed: 40, limit: 50 },  // step 5: continues
        { lat: 52.5240, lng: 13.4120, speed: 30, limit: 30 },  // step 6: new zone — wrong-way toast fires here
        { lat: 52.5235, lng: 13.4135, speed: 15, limit: 30 },  // step 7: slowing
        { lat: 52.5230, lng: 13.4145, speed: 10, limit: 30 },  // step 8: almost stopped
        { lat: 52.5228, lng: 13.4148, speed:  5, limit: 30 },  // step 9: end
      ];

      let step = 0;
      simulationIntervalRef.current = setInterval(() => {
        if (step >= mockPoints.length) {
          if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
          return;
        }

        const point = mockPoints[step];
        setGpsPoints(prev => [...prev, { lat: point.lat, lng: point.lng, timestamp: Date.now() }]);
        setCurrentSpeed(point.speed);
        setCurrentLimit(point.limit);

        // Step 0: place stop sign one step ahead
        if (step === 0) {
          setActiveStopSign({ lat: stopLat, lng: stopLng, id: 'mock-stop-1' });
          setHasStoppedAtSign(false);
          toast.info(isDE ? '🛑 Stoppschild voraus!' : '🛑 Stop Sign Ahead!');
        }

        // Step 6: simulate wrong-way driving alert
        if (step === 6) {
          toast.error(
            isDE ? '⛔ Falschfahrer erkannt! Sofort anhalten!' : '⛔ Wrong Way! Stop immediately!',
            { position: 'bottom-center', duration: 6000 }
          );
          setCurrentMistakes(prev => [...prev, {
            type: 'wrong_way',
            timestamp: Date.now(),
            location: { lat: point.lat, lng: point.lng }
          }]);
        }

        if (step > 0) {
          const prev = mockPoints[step - 1];
          const dist = calculateDistance(prev.lat, prev.lng, point.lat, point.lng);
          setCurrentDistance(d => d + dist);
        }

        step++;
      }, 3000);
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
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    toast(isDE ? 'Timer pausiert' : 'Timer paused', { icon: '⏸️' });
  };

  const handleStopTimer = async () => {
    setIsTimerRunning(false);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
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
      locationSummary: locationSummary || undefined,
      mistakes: currentMistakes
    }));
    setShowAddForm(true);
    setShowManualLog(false);
    setElapsedTime(0);
    toast.success(isDE ? 'Bereit zum Speichern!' : 'Ready to save!');
  };

  const handleManualMistake = (type: DrivingMistake['type']) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setCurrentMistakes(prev => [...prev, {
        type,
        timestamp: Date.now(),
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
      }]);
      toast.error(
        isDE ? 'Fehler manuell hinzugefügt' : 'Mistake added manually',
        { position: 'bottom-center' }
      );
    });
    setShowManualLog(false);
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
      totalDistance: session.totalDistance,
      route: session.route,
      locationSummary: session.locationSummary,
      mistakes: session.mistakes
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              const mockRoute = [
                { lat: 52.5200, lng: 13.4050, timestamp: Date.now() },
                { lat: 52.5210, lng: 13.4060, timestamp: Date.now() + 10000 },
                { lat: 52.5220, lng: 13.4080, timestamp: Date.now() + 20000 },
                { lat: 52.5215, lng: 13.4100, timestamp: Date.now() + 30000 },
                { lat: 52.5205, lng: 13.4110, timestamp: Date.now() + 40000 },
              ];
              const mockMistakes: DrivingMistake[] = [
                { type: 'speeding', speed: 58, limit: 50, timestamp: Date.now(), location: mockRoute[1] },
                { type: 'harsh_braking', timestamp: Date.now() + 15000, location: mockRoute[2] },
                { type: 'shoulder_check', timestamp: Date.now() + 25000, location: mockRoute[3] },
              ];
              addDrivingSession({
                date: new Date().toISOString().split('T')[0],
                duration: 45,
                type: 'normal',
                notes: 'Simulated Drive with Leaflet Maps & Mixed Mistakes',
                instructorName: 'AI Safety Auditor',
                totalDistance: 1.2,
                route: mockRoute,
                locationSummary: 'Berlin, Mitte',
                mistakes: mockMistakes
              });
              toast.success('Advanced Simulation Added!');
            }}
            className="flex h-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/20"
          >
            Simulate Drive
          </button>
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

      {/* Live Timer & Manual Log HUD */}
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
                   "relative h-4 w-8 rounded-full transition-colors",
                   isSimulationMode ? "bg-indigo-600" : "bg-slate-700"
                 )}
               >
                 <div className={cn(
                   "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all",
                   isSimulationMode ? "left-4.5" : "left-0.5"
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
             {isTimerRunning && <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
          </div>
        </div>

        {/* Real-time Map Monitoring (Always Available) */}
        {isTimerRunning && gpsPoints.length > 0 && (
          <div className="mt-3 h-24 w-full overflow-hidden rounded-xl border border-white/10 opacity-80">
            <MapContainer 
              center={[gpsPoints[gpsPoints.length-1].lat, gpsPoints[gpsPoints.length-1].lng]} 
              zoom={16} 
              zoomControl={false}
              attributionControl={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={gpsPoints.map(p => [p.lat, p.lng])} color="#3b82f6" weight={3} />
              <Marker position={[gpsPoints[gpsPoints.length-1].lat, gpsPoints[gpsPoints.length-1].lng]} />
              <MapBoundsSimple points={gpsPoints} />
            </MapContainer>
          </div>
        )}

        <div className="my-4 flex flex-col items-center">
          <div className="text-5xl font-bold tracking-tighter">
            {formatTime(elapsedTime)}
          </div>
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
              "text-lg font-bold flex items-center justify-center gap-1",
              currentLimit && currentSpeed > currentLimit ? "text-red-400" : "text-white"
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
                if (hasReachedLimit && !isSimulationMode) {
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
                      <RouteMap route={session.route} mistakes={session.mistakes} language={language} />
                    )}
                    {session.mistakes && session.mistakes.length > 0 ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-4 w-4" />
                            {isDE ? 'Detail-Analyse' : 'Detailed Analysis'}
                          </div>
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-600 dark:bg-red-900/40 dark:text-red-400">
                            {session.mistakes.length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {session.mistakes.map((mistake, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg bg-white/50 p-2 text-xs dark:bg-slate-900/50">
                              <div className="flex items-center gap-2">
                                {mistake.type === 'speeding' && <Zap className="h-3.5 w-3.5 text-red-500" />}
                                {mistake.type === 'harsh_braking' && <Footprints className="h-3.5 w-3.5 text-orange-500" />}
                                {mistake.type === 'rapid_acceleration' && <Zap className="h-3.5 w-3.5 text-blue-500" />}
                                {mistake.type === 'shoulder_check' && <Eye className="h-3.5 w-3.5 text-indigo-500" />}
                                {mistake.type === 'signal' && <Signal className="h-3.5 w-3.5 text-amber-500" />}
                                {mistake.type === 'priority' && <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />}
                                {mistake.type === 'stop_sign' && <Square className="h-3.5 w-3.5 text-red-600" />}
                                {mistake.type === 'wrong_way' && <Route className="h-3.5 w-3.5 text-fuchsia-600" />}
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {mistake.type === 'speeding' && (isDE ? 'Geschwindigkeits-Überschreitung' : 'Speeding Violation')}
                                  {mistake.type === 'harsh_braking' && (isDE ? 'Starkes Bremsen' : 'Harsh Braking')}
                                  {mistake.type === 'rapid_acceleration' && (isDE ? 'Starke Beschleunigung' : 'Rapid Acceleration')}
                                  {mistake.type === 'shoulder_check' && (isDE ? 'Schulterblick vergessen' : 'Missed Shoulder Check')}
                                  {mistake.type === 'signal' && (isDE ? 'Blinker vergessen' : 'Missed Signal')}
                                  {mistake.type === 'priority' && (isDE ? 'Vorfahrtsfehler' : 'Priority Violation')}
                                  {mistake.type === 'stop_sign' && (isDE ? 'Stoppschild überfahren' : 'Stop Sign Violation')}
                                  {mistake.type === 'wrong_way' && (isDE ? '⛔ Falschfahrer' : '⛔ Wrong Way Driving')}
                                  {mistake.type === 'other' && (isDE ? 'Sonstiger Fehler' : 'Other Mistake')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {mistake.speed && (
                                  <span className="font-black text-red-600">
                                    {mistake.speed} <span className="text-[10px] font-normal opacity-70">km/h</span>
                                  </span>
                                )}
                                {mistake.timestamp && (
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {new Date(mistake.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : session.route && session.route.length > 0 && (
                      <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-900/10">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                          <Plus className="h-3.5 w-3.5 rotate-45" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-700 dark:text-green-400">
                            {isDE ? 'Keine Fehler erkannt' : 'No mistakes detected'}
                          </p>
                          <p className="text-[10px] text-green-600/80 dark:text-green-500/80">
                            {isDE ? 'Sichere Fahrweise beibehalten!' : 'Keep up the safe driving!'}
                          </p>
                        </div>
                      </div>
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          {/* On mobile: sheet slides up from bottom. On desktop: centered modal */}
          <div className="flex w-full flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-slate-800 sm:max-w-md sm:rounded-2xl"
            style={{
              maxHeight: 'calc(100dvh - 80px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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

            {/* Footer (Sticky) — always visible above safe area */}
            <div className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-700">
              <button
                onClick={handleAddSession}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
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

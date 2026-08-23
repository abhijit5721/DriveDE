import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, AlertTriangle } from 'lucide-react';
import type { MistakeHotspot } from '../../types';
import { getRiskColor, fetchHotspots } from '../../services/hotspotsService';
import { TRANSLATIONS } from '../../data/translations';
import { useAppStore } from '../../store/useAppStore';
import { getTileConfig } from '../../utils/mapTiles';

interface HotspotMapProps {
  lat?: number;
  lng?: number;
  onClose?: () => void;
}

// Labels come from translations (t.tracker.mistakes, camelCase keys); the
// previous parallel emoji map here drifted from the app's lucide icon system.
const toCamel = (type: string) => type.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true });
  }, [map, lat, lng]);
  return null;
}

export function HotspotMap({ lat = 52.52, lng = 13.405, onClose }: HotspotMapProps) {
  const [hotspots, setHotspots] = useState<MistakeHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MistakeHotspot | null>(null);
  const { language, darkMode } = useAppStore();
  const t = TRANSLATIONS[language as 'de' | 'en'] ?? TRANSLATIONS.de;
  const tiles = getTileConfig(darkMode);
  const mistakeLabel = (type: string) =>
    (t.tracker.mistakes as Record<string, string>)[toCamel(type)] ||
    (t.tracker.mistakes as Record<string, string>)[type] ||
    type;

  useEffect(() => {
    setLoading(true);
    fetchHotspots({ lat, lng, radius: 10, limit: 30 })
      .then((result) => setHotspots(result.hotspots))
      .catch(() => setHotspots([]))
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const riskBadgeClass = (score: number) => {
    if (score >= 7) return 'bg-red-500 text-white';
    if (score >= 4) return 'bg-orange-500 text-white';
    if (score >= 2) return 'bg-yellow-500 text-black';
    return 'bg-green-500 text-white';
  };

  const riskLabel = (score: number) => {
    if (score >= 7) return t.dashboard.hotspotsCritical;
    if (score >= 4) return t.dashboard.hotspotsHigh;
    if (score >= 2) return t.dashboard.hotspotsMedium;
    return t.dashboard.hotspotsLow;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.dashboard.hotspotsNearby}</h2>
          {!loading && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {hotspots.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-10">
            <div className="text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">{t.dashboard.hotspotsLoading}</p>
            </div>
          </div>
        ) : hotspots.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-10">
            <div className="text-center px-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto dark:bg-slate-800">
                <AlertTriangle className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">{t.dashboard.hotspotsEmpty}</p>
            </div>
          </div>
        ) : null}

        <MapContainer
          center={[lat, lng]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          preferCanvas={true}
        >
          <TileLayer
            key={tiles.url}
            attribution={tiles.attribution}
            url={tiles.url}
          />
          <MapCenter lat={lat} lng={lng} />

          {hotspots.map((spot) => {
            const color = getRiskColor(spot.risk_score);
            return (
              <CircleMarker
                key={spot.id}
                center={[spot.lat, spot.lng]}
                radius={Math.max(6, Math.min(20, spot.total_incidents * 2 + spot.risk_score * 2))}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.4,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelected(spot),
                }}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-bold text-sm mb-1">{mistakeLabel(spot.mistake_type)}</p>
                    <div className="text-xs space-y-0.5 text-slate-600">
                      <p>{spot.total_incidents} {t.dashboard.hotspotsIncidents}</p>
                      <p>{spot.unique_drivers} {t.dashboard.hotspotsDrivers}</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {selected && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-700 max-w-sm mx-auto">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${riskBadgeClass(selected.risk_score)}`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {mistakeLabel(selected.mistake_type)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${riskBadgeClass(selected.risk_score)}`}>
                    {riskLabel(selected.risk_score)} ({selected.risk_score.toFixed(1)})
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {selected.total_incidents} {t.dashboard.hotspotsIncidents}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {selected.unique_drivers} {t.dashboard.hotspotsDrivers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { MapPin, Crown, ChevronRight } from 'lucide-react';
import type { MistakeHotspot } from '../../types';
import { fetchHotspots, getRiskColor } from '../../services/hotspotsService';
import { TRANSLATIONS } from '../../data/translations';
import { useAppStore } from '../../store/useAppStore';

interface HotspotPanelProps {
  lat?: number;
  lng?: number;
  onOpenMap?: () => void;
  onOpenPaywall?: () => void;
}

export function HotspotPanel({ lat = 52.52, lng = 13.405, onOpenMap, onOpenPaywall }: HotspotPanelProps) {
  const { isPremium } = useAppStore();
  const [hotspots, setHotspots] = useState<MistakeHotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const language = useAppStore((s) => s.language);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (!isPremium) return;
    setLoading(true);
    fetchHotspots({ lat, lng, radius: 15, limit: 5 })
      .then((r) => setHotspots(r.hotspots))
      .catch(() => setHotspots([]))
      .finally(() => setLoading(false));
  }, [lat, lng, isPremium]);

  if (!isPremium) {
    return (
      <button
        onClick={onOpenPaywall}
        className="group flex w-full items-center justify-between rounded-3xl glass p-6 text-left transition-all hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.99]"
      >
        <div className="flex items-start gap-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/30 transition-all duration-300 group-hover:scale-110">
            <MapPin className="h-7 w-7 text-red-500" />
            <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg border-2 border-slate-900">
              <Crown className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t.dashboard.hotspots}
              </p>
              <span className="rounded-lg bg-amber-50/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                Pro
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {t.dashboard.hotspotsDesc}
            </p>
          </div>
        </div>
        <div className="ml-2 mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-red-500 group-hover:text-white transition-all">
          <ChevronRight className="h-5 w-5" />
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-3xl glass overflow-hidden">
      <button
        onClick={onOpenMap}
        className="flex w-full items-center justify-between p-6 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 group"
      >
        <div className="flex items-start gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/30 transition-all duration-300 group-hover:scale-110">
            <MapPin className="h-7 w-7 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {t.dashboard.hotspots}
              </p>
              <span className="rounded-lg bg-red-50/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-red-500/20 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                Pro
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {t.dashboard.hotspotsDesc}
            </p>
          </div>
        </div>
        <div className="ml-2 mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-red-500 group-hover:text-white transition-all">
          <ChevronRight className="h-5 w-5" />
        </div>
      </button>

      {loading ? (
        <div className="px-6 pb-5">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      ) : hotspots.length > 0 ? (
        <div className="px-6 pb-5 space-y-2">
          {hotspots.slice(0, 4).map((spot) => {
            const color = getRiskColor(spot.risk_score);
            return (
              <div
                key={spot.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/30"
              >
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">
                    {spot.mistake_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {spot.total_incidents} {t.dashboard.hotspotsIncidents} · {spot.unique_drivers} {t.dashboard.hotspotsDrivers}
                  </p>
                </div>
                <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
                  {spot.risk_score.toFixed(1)}
                </span>
              </div>
            );
          })}
          <button
            onClick={onOpenMap}
            className="w-full rounded-xl bg-slate-50 py-2.5 text-center text-xs font-bold text-blue-600 transition-colors hover:bg-slate-100 dark:bg-slate-800/30 dark:text-blue-400 dark:hover:bg-slate-800/50"
          >
            {t.dashboard.viewAll} →
          </button>
        </div>
      ) : (
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-slate-400">{t.dashboard.hotspotsEmpty}</p>
        </div>
      )}
    </div>
  );
}
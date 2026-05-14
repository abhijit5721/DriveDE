import type { MistakeHotspot } from '../types';

export interface HotspotsParams {
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  types?: string[];
}

export interface HotspotsResult {
  hotspots: MistakeHotspot[];
  count: number;
  loadedAt: number;
}

const cache = new Map<string, { data: MistakeHotspot[]; expires: number }>();
const DEFAULT_TTL = 5 * 60 * 1000;

function cacheKey(params: HotspotsParams): string {
  return `${params.lat ?? 0}_${params.lng ?? 0}_${params.radius ?? 10}_${params.limit ?? 20}_${(params.types ?? []).join(',')}`;
}

export async function fetchHotspots(params: HotspotsParams = {}): Promise<HotspotsResult> {
  const key = cacheKey(params);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return { hotspots: cached.data, count: cached.data.length, loadedAt: cached.expires };
  }

  const url = new URL('/api/hotspots', window.location.origin);
  if (params.lat != null) url.searchParams.set('lat', String(params.lat));
  if (params.lng != null) url.searchParams.set('lng', String(params.lng));
  if (params.radius != null) url.searchParams.set('radius', String(params.radius));
  if (params.limit != null) url.searchParams.set('limit', String(params.limit));
  if (params.types && params.types.length > 0) {
    url.searchParams.set('types', params.types.join(','));
  }

  try {
    const res = await fetch(url.toString(), {
      credentials: 'omit',
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return { hotspots: [], count: 0, loadedAt: Date.now() };
    }

    const json: HotspotsResult = await res.json();
    json.loadedAt = Date.now();
    cache.set(key, { data: json.hotspots ?? [], expires: Date.now() + DEFAULT_TTL });
    return json;
  } catch {
    return { hotspots: [], count: 0, loadedAt: Date.now() };
  }
}

export function getRiskLabel(score: number): string {
  if (score >= 7) return 'critical';
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export function getRiskColor(score: number): string {
  if (score >= 7) return '#ef4444';
  if (score >= 4) return '#f97316';
  if (score >= 2) return '#eab308';
  return '#22c55e';
}
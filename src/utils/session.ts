import { DrivingSession, GPSPoint, DrivingMistake } from '../types';

interface RawSession {
  id: string;
  external_id?: string;
  session_date: string;
  duration_minutes: number;
  category: string;
  notes?: string;
  instructor_name?: string;
  route?: GPSPoint[];
  mistakes?: DrivingMistake[];
  total_distance?: number;
  location_summary?: string;
}

/**
 * Deduplicates and merges driving sessions from multiple sources.
 * Tier 1: Match by exact external_id.
 * Tier 2: Match by similarity (Date, Duration, Category, Distance, Instructor).
 */
export const deduplicateSessions = (sessions: RawSession[]): DrivingSession[] => {
  if (!sessions || sessions.length === 0) return [];

  // Tier 1: Merge by Exact External ID
  const idMap = new Map<string, RawSession>();
  sessions.forEach(r => {
    const key = r.external_id || r.id;
    const existing = idMap.get(key);
    // Keep the one with more data (e.g. location summary)
    if (!existing || (!existing.location_summary && r.location_summary)) {
      idMap.set(key, r);
    }
  });

  // Tier 2: Merge by Similarity
  const similarityMap = new Map<string, RawSession>();
  Array.from(idMap.values()).forEach(r => {
    const dateStr = new Date(r.session_date).toISOString().split('T')[0];
    const dist = Math.round(r.total_distance || 0);
    const simKey = `${dateStr}_${r.duration_minutes}_${r.category}_${dist}_${r.location_summary || ''}_${r.instructor_name || ''}`;
    
    if (!similarityMap.has(simKey)) {
      similarityMap.set(simKey, r);
    }
  });

  return Array.from(similarityMap.values()).map(s => ({
    id: s.id,
    date: s.session_date,
    duration: s.duration_minutes,
    type: s.category === 'night' ? 'nacht' : s.category as DrivingSession['type'],
    notes: s.notes || '',
    instructorName: s.instructor_name || '',
    route: s.route || [],
    mistakes: s.mistakes || [],
    totalDistance: s.total_distance || 0,
    locationSummary: s.location_summary || ''
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertCircle, 
  TrendingUp,
  BarChart2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Car
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DrivingSession } from '../../types';
import { Skeleton } from '../common/Skeleton';
import { getAllLessons, chapters } from '../../data/curriculum';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../../utils/license';
import { filterLessonsForSelection } from '../../utils/contentFilter';

interface PublicReportProps {
  userId: string;
  onBack: () => void;
}

export const PublicReport: React.FC<PublicReportProps> = ({ userId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profile: any;
    sessions: DrivingSession[];
    completedLessons: string[];
  } | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      
      try {
        const [{ data: profile }, { data: sessions }, { data: lessons }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('driving_sessions').select('*').eq('user_id', userId).order('session_date', { ascending: false }),
          supabase.from('lesson_progress').select('*').eq('user_id', userId).eq('status', 'completed')
        ]);

        // --- Precision De-duplication Engine ---
        const allRows = sessions || [];
        
        // Tier 1: Merge by Exact External ID
        // (Handles duplicates of the exact same sync record)
        const idMap = new Map<string, any>();
        allRows.forEach(r => {
          const key = r.external_id || r.id;
          const existing = idMap.get(key);
          if (!existing || (!existing.location_summary && r.location_summary)) {
            idMap.set(key, r);
          }
        });

        // Tier 2: Merge by Similarity (Date + Duration + Category + Distance + Location + Instructor)
        // (Handles the same session uploaded with different IDs while preserving back-to-back lessons)
        const similarityMap = new Map<string, any>();
        Array.from(idMap.values()).forEach(r => {
          const dateStr = new Date(r.session_date).toISOString().split('T')[0];
          const dist = Math.round(r.total_distance || 0);
          // Key includes Instructor to distinguish sessions with same stats but different teachers
          const simKey = `${dateStr}_${r.duration_minutes}_${r.category}_${dist}_${r.location_summary || ''}_${r.instructor_name || ''}`;
          
          if (!similarityMap.has(simKey)) {
            similarityMap.set(simKey, r);
          }
        });

        const finalRows = Array.from(similarityMap.values());

        setData({
          profile,
          sessions: finalRows.map(s => ({
            id: s.id,
            date: s.session_date,
            duration: s.duration_minutes,
            type: s.category === 'night' ? 'nacht' : s.category,
            notes: s.notes || '',
            instructorName: s.instructor_name || '',
            route: s.route || [],
            mistakes: s.mistakes || [],
            totalDistance: s.total_distance || 0,
            locationSummary: s.location_summary || ''
          })).sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
          completedLessons: (lessons || []).map(l => l.lesson_id)
        });
      } catch (e) {
        console.error('Failed to fetch public report', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6 space-y-6">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Report Not Found</h1>
        <p className="text-slate-400 mb-8">This link may be expired or the user ID is invalid.</p>
        <button 
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
        >
          Return to App
        </button>
      </div>
    );
  }

  const totalMinutes = data.sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedLessonsCount = data.completedLessons.length;
  
  // Get dynamic total lessons based on profile
  const lPath = data.profile?.learning_path || 'standard';
  const tType = data.profile?.transmission_type || 'automatic';
  
  // Convert Supabase enums to app types if needed
  const learningPath = lPath === 'conversion' ? 'umschreibung' : 'standard';
  const visibleLessons = filterLessonsForSelection(getAllLessons(), tType, learningPath);
  const totalVisibleLessons = visibleLessons.length || 50;

  // Filter the user's completed IDs to only those that exist in visibleLessons
  const validCompletedLessonsCount = data.completedLessons.filter(id => 
    visibleLessons.some(l => l.id === id)
  ).length;

  // Smarter "Readiness" calculation
  // 1. Quantity Base (40% Theory, 60% Experience)
  const theoryProgress = Math.min(1, validCompletedLessonsCount / totalVisibleLessons);
  const experienceProgress = Math.min(1, totalMinutes / 1200); // 20 hours base for full experience
  let score = (theoryProgress * 40) + (experienceProgress * 60);

  // 2. Quality Penalty (Recent Faults)
  // Look at the last 5 sessions or all if less
  const recentSessionsCount = data.sessions.slice(0, 5);
  const totalRecentMistakes = recentSessionsCount.reduce((acc, s) => acc + (s.mistakes?.length || 0), 0);
  
  // Penalty: -3% per recent mistake, capped at -30%
  const penalty = Math.min(30, totalRecentMistakes * 3);
  const readiness = Math.round(Math.max(0, score - penalty));

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-white/5 p-4 flex items-center gap-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 hover:opacity-80 transition active:scale-95 text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20">
             <Car className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Drive<span className="text-blue-500">DE</span></h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">Instructor Review</p>
          </div>
        </button>
        <div className="ml-auto">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Readiness Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold uppercase tracking-widest text-blue-100">Exam Readiness</span>
              <TrendingUp className="h-5 w-5 text-blue-100" />
            </div>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-6xl font-black">{readiness}%</span>
              <span className="text-blue-100 mb-2 font-medium">Ready</span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000" 
                style={{ width: `${readiness}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-blue-100">
              Based on {totalMinutes >= 45 ? `${Math.round(totalMinutes / 45)} units` : `${totalMinutes} minutes`} and {validCompletedLessonsCount}/{totalVisibleLessons} theory lessons.
            </p>
          </div>
          <Zap className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10 rotate-12" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-white/5 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Total Time</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
          </div>
          <div className="rounded-2xl bg-slate-900 border border-white/5 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <BarChart2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Theory</span>
            </div>
            <div className="text-2xl font-bold text-white">{validCompletedLessonsCount}/{totalVisibleLessons}</div>
          </div>
        </div>

        {/* AI Insight Section */}
        <div className="rounded-3xl bg-slate-900 border border-white/5 p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            AI Training Insights
          </h3>
          <div className="space-y-4">
            {data.sessions.length > 0 ? (
              <>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Strong Consistency</p>
                    <p className="text-xs text-slate-400 mt-1">Maintaining steady progress across {data.sessions.length} recorded sessions.</p>
                  </div>
                </div>
                
                {/* Find most common mistake */}
                {(() => {
                  const allMistakes = data.sessions.flatMap(s => s.mistakes);
                  const counts: Record<string, number> = {};
                  allMistakes.forEach(m => {
                    if (m && m.type) {
                      counts[m.type] = (counts[m.type] || 0) + 1;
                    }
                  });
                  const topMistake = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
                  
                  if (topMistake) {
                    return (
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Focus Area: {topMistake[0].replace(/_/g, ' ')}</p>
                          <p className="text-xs text-slate-400 mt-1">Detected {topMistake[1]} instances. Recommended focus for next lesson.</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <p className="text-slate-500 text-sm italic">No driving sessions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Session History */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Recent Sessions</h3>
          <div className="space-y-3">
            {data.sessions.slice(0, 50).map((session) => (
              <div key={session.id} className="space-y-2">
                <div 
                  onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                  className="rounded-2xl bg-slate-900 border border-white/5 p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  <div className={`p-3 rounded-xl ${
                    session.type === 'autobahn' ? 'bg-indigo-500/10 text-indigo-400' :
                    session.type === 'ueberland' ? 'bg-emerald-500/10 text-emerald-400' :
                    session.type === 'nacht' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {session.locationSummary || (session.type.charAt(0).toUpperCase() + session.type.slice(1))}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(session.date).toLocaleDateString()}
                      <span className="text-slate-700">•</span>
                      {session.duration} min
                    </div>
                  </div>
                  {(session.mistakes?.length || 0) > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase">
                      <AlertCircle className="h-3 w-3" />
                      {session.mistakes?.length || 0}
                    </div>
                  )}
                </div>

                {/* Expanded Fault Details */}
                {expandedSession === session.id && (session.mistakes?.length || 0) > 0 && (
                  <div className="mx-4 p-4 rounded-xl bg-slate-800/30 border-x border-b border-white/5 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Fault Details</p>
                    {session.mistakes.map((m: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        <span className="font-medium capitalize">{m.type?.replace(/_/g, ' ') || 'General Mistake'}</span>
                        {m.timestamp && (
                          <span className="text-slate-500 text-[10px] ml-auto">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    ))}
                    {session.notes && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Notes</p>
                        <p className="text-xs text-slate-400 italic">{session.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 flex gap-3">
          <Info className="h-5 w-5 text-slate-500 shrink-0" />
          <p className="text-[10px] text-slate-500 leading-relaxed">
            This report is a data-driven summary intended for professional driving instruction review. 
            Privacy protected by DriveDE. Data sync expires automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

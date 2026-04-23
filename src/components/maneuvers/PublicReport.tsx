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
  Car,
  Activity,
  Flame,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DrivingSession } from '../../types';
import { Skeleton } from '../common/Skeleton';
import { getAllLessons, chapters } from '../../data/curriculum';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../../utils/license';
import { filterLessonsForSelection } from '../../utils/contentFilter';
import { cn } from '../../utils/cn';

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
  const [selectedFault, setSelectedFault] = useState<string | null>(null);

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

  // --- Practical Analytics ---
  // 1. Sonderfahrten Progress (Units)
  const sonderfahrten = {
    ueberland: { current: Math.floor(data.sessions.filter(s => s.type === 'ueberland').reduce((acc, s) => acc + s.duration, 0) / 45), target: 5 },
    autobahn: { current: Math.floor(data.sessions.filter(s => s.type === 'autobahn').reduce((acc, s) => acc + s.duration, 0) / 45), target: 4 },
    nacht: { current: Math.floor(data.sessions.filter(s => s.type === 'nacht').reduce((acc, s) => acc + s.duration, 0) / 45), target: 3 }
  };

  // 2. Skill Weaknesses (Aggregated Faults)
  const faultMap = new Map<string, number>();
  data.sessions.forEach(s => {
    s.mistakes?.forEach(m => {
      // mistakes is DrivingMistake[] so we use m.type
      const faultType = typeof m === 'string' ? m : m.type;
      faultMap.set(faultType, (faultMap.get(faultType) || 0) + 1);
    });
  });
  
  const formatFaultName = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const sortedFaults = Array.from(faultMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // --- AI Briefing Engine ---
  const generateBriefing = () => {
    const name = data.profile?.display_name || 'The student';
    const missingSonderfahrten = Object.entries(sonderfahrten)
      .filter(([_, stats]) => stats.current < stats.target)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1));

    let briefing = `${name} is showing ${readiness >= 75 ? 'excellent' : readiness >= 50 ? 'consistent' : 'steady'} progress with a ${readiness}% practical readiness score. `;
    
    if (missingSonderfahrten.length > 0) {
      briefing += `Focus should shift towards ${missingSonderfahrten.join(', ')} hours, which are currently below legal requirements. `;
    } else {
      briefing += "All mandatory special driving hours are completed, meaning the focus can now be 100% on exam simulation. ";
    }

    if (sortedFaults.length > 0) {
      const mainFault = formatFaultName(sortedFaults[0][0]);
      briefing += `Tactically, the next session should prioritize ${mainFault} to eliminate recurring errors observed in recent tracking data.`;
    }

    return briefing;
  };

  // --- Trend Calculation ---
  const calculateTrend = () => {
    if (data.sessions.length < 2) return null;
    
    const sorted = [...data.sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const recent = sorted.slice(-3); // Last 3 sessions
    const previous = sorted.slice(0, -3).slice(-3); // 3 sessions before that
    
    const avgMistakes = (sessions: DrivingSession[]) => {
      if (sessions.length === 0) return 0;
      return sessions.reduce((acc, s) => acc + (s.mistakes?.length || 0), 0) / sessions.length;
    };

    const recentAvg = avgMistakes(recent);
    const prevAvg = avgMistakes(previous);

    if (previous.length === 0) return { type: 'neutral', value: 0 };
    
    const diff = prevAvg - recentAvg; // Positive means fewer mistakes now (improving)
    const percent = Math.round((diff / (prevAvg || 1)) * 100);

    return {
      type: diff > 0 ? 'improving' : diff < 0 ? 'regressing' : 'neutral',
      value: Math.abs(percent)
    };
  };

  const trend = calculateTrend();

  const faultAdvice: Record<string, string> = {
    speeding: "Focus on regular speedometer checks, especially in 30km/h zones. Anticipate speed limit changes ahead.",
    harsh_braking: "Maintain a larger following distance and look further ahead to anticipate traffic flow changes earlier.",
    signal: "Remember the 'Look-Signal-Maneuver' sequence. Always signal at least 3 seconds before turning or changing lanes.",
    priority: "Review 'Right before Left' rules. Slow down when approaching intersections with limited visibility.",
    shoulder_check: "Make the 'Schulterblick' more obvious. It must be done for every turn, lane change, and when pulling out.",
    stop_sign: "Ensure a complete 3-second stop. The wheels must stop moving entirely before proceeding.",
    right_before_left: "Always slow down and look right at unmarked T-junctions and intersections.",
    school_zone_speeding: "Be extra vigilant near schools. Speed limits here are strictly enforced during exam hours."
  };

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
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">Review</p>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                {data.profile?.display_name || 'Student'}
              </p>
            </div>
          </div>
        </button>
        <div className="ml-auto">
          <ShieldCheck className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* AI Instructor Briefing */}
        <div className="rounded-3xl bg-slate-900 border border-blue-500/20 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24 text-blue-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Instructor Briefing</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
              "{generateBriefing()}"
            </p>
          </div>
        </div>

        {/* Readiness Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 text-white font-black text-xl">
                {data.profile?.display_name?.[0] || 'S'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {data.profile?.display_name || 'Student'}
        {/* Readiness Card & Trend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold uppercase tracking-wider text-blue-100">Practical Readiness</span>
                <Activity className="h-6 w-6 text-blue-200" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black">{readiness}%</span>
                <span className="text-sm text-blue-100 font-medium opacity-80">Score</span>
              </div>
              <div className="mt-6 h-3 w-full rounded-full bg-blue-900/30 overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all duration-1000" 
                  style={{ width: `${readiness}%` }}
                />
              </div>
              <p className="mt-4 text-xs text-blue-100 font-medium">
                Based on {data.sessions.length} sessions and {validCompletedLessonsCount}/{totalVisibleLessons} theory units.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 border border-white/5 p-6 flex flex-col justify-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Driving Trend</div>
            {trend ? (
              <div className="space-y-2">
                <div className={cn(
                  "flex items-center gap-2 text-2xl font-black",
                  trend.type === 'improving' ? "text-emerald-500" : trend.type === 'regressing' ? "text-rose-500" : "text-slate-400"
                )}>
                  {trend.type === 'improving' ? <TrendingUp className="h-6 w-6" /> : trend.type === 'regressing' ? <TrendingDown className="h-6 w-6" /> : <Minus className="h-6 w-6" />}
                  {trend.type === 'neutral' ? 'Stable' : `${trend.value}%`}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {trend.type === 'improving' ? 'Fault frequency decreased vs. previous sessions.' : 
                   trend.type === 'regressing' ? 'Fault frequency increased. More focus needed.' : 
                   'Consistency maintained across recent sessions.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Need more sessions to calculate trend.</p>
            )}
          </div>
        </div>

        {/* Special Driving Hours (Sonderfahrten) */}
        <div className="rounded-3xl bg-slate-900 border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Special Driving Hours
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase">German Requirements</span>
          </div>
          
          <div className="space-y-6">
            {[
              { label: 'Überland (Cross-country)', key: 'ueberland', color: 'bg-emerald-500', icon: '🛣️' },
              { label: 'Autobahn (Highway)', key: 'autobahn', color: 'bg-blue-500', icon: '🏎️' },
              { label: 'Nachtfahrt (Night)', key: 'nacht', color: 'bg-purple-500', icon: '🌙' },
            ].map((item) => {
              const stats = sonderfahrten[item.key as keyof typeof sonderfahrten];
              const progress = Math.min(100, (stats.current / stats.target) * 100);
              return (
                <div key={item.key}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-semibold text-slate-200">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{stats.current} / {stats.target} units</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", item.color)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practical Skills Focus */}
        {sortedFaults.length > 0 && (
          <div className="rounded-3xl bg-slate-900 border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Practical Skills Focus</h3>
            </div>
            <div className="space-y-3">
              {sortedFaults.map(([fault, count], i) => (
                <div key={i} className="rounded-xl border bg-white/5 border-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-sm">
                        {count}
                      </div>
                      <span className="text-sm text-slate-200 font-bold uppercase tracking-tight">{formatFaultName(fault)}</span>
                    </div>
                    <Flame className="h-4 w-4 text-orange-500/50" />
                  </div>
                  
                  <div className="p-3 rounded-lg bg-slate-800/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5 text-orange-400">
                      <Info className="h-3 w-3" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Instructor Focus</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {faultAdvice[fault] || "Review this maneuver in the next lesson. Focus on awareness and early preparation."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

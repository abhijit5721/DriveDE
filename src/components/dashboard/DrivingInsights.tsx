import { TrendingUp, Target, ChevronRight, Zap, Calendar, Wind, Star, Lock, Crown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';

interface DrivingInsightsProps {
  onDirectLessonSelect: (lessonId: string) => void;
  onOpenPaywall?: () => void;
}

export function DrivingInsights({ onDirectLessonSelect, onOpenPaywall }: DrivingInsightsProps) {
  const { language, userProgress, transmissionType, isPremium } = useAppStore();
  const drivingSessions = (Array.isArray(userProgress?.drivingSessions) ? userProgress.drivingSessions : [])
    .filter(s => s.instructorName !== 'AI Safety Auditor' && !s.isSimulation);

  const isDE = language === 'de';

  if (drivingSessions.length === 0) return null;

  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  
  // Sort and filter sessions within the last 7 days
  const sortedSessions = [...drivingSessions].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  const thisWeekSessions = sortedSessions.filter(s => {
    if (!s.date) return false;
    const sessionTime = new Date(s.date).getTime();
    return (now - sessionTime) < ONE_WEEK;
  });

  const lastWeekSessions = sortedSessions.filter(s => {
    if (!s.date) return false;
    const time = new Date(s.date).getTime();
    return (now - time) >= ONE_WEEK && (now - time) < (2 * ONE_WEEK);
  });

  const thisWeekMinutes = thisWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const lastWeekMinutes = lastWeekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  
  const minuteDiff = thisWeekMinutes - lastWeekMinutes;
  const isUp = minuteDiff >= 0;

  // Aggregate Mistakes for recommendations - FOCUS ON RECENT (LAST 7 DAYS)
  const mistakeCounts = thisWeekSessions.reduce((acc, s) => {
    (s.mistakes || []).forEach(m => {
      if (m && m.type) {
        acc[m.type] = (acc[m.type] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Mapping mistakes to lesson IDs - Precision fixed for curriculum alignment
  const lessonMap: Record<string, string> = {
    'speeding': 'special-1',
    'shoulder_check': 'basics-1b',
    'priority': 'city-1',
    'right_before_left': 'city-1',
    'idling': 'exam-1',
    'eco_driving': 'exam-1',
    'roundabout_signal': 'city-3',
    'stop_sign': 'city-2',
    'signal': 'basics-1b',
    'harsh_braking': transmissionType === 'automatic' ? 'maneuver-4a' : 'maneuver-4',
    'harsh_cornering': 'basics-4',
    'school_zone': 'city-1',
    'school_zone_speeding': 'city-1',
    'curve_speeding': 'special-1',
    'aggressive_cornering': 'special-1',
    'wrong_way': 'city-1',
    'illegal_turn': 'city-5',
    'pedestrian_safety': 'city-4'
  };

  const topMistakes = Object.entries(mistakeCounts)
    .sort(([, a], [, b]) => b - a)
    .filter(([type]) => lessonMap[type]) // Only show mistakes we can accurately map to a lesson
    .slice(0, 5);


  const getMistakeLabel = (type: string) => {
    switch (type) {
      case 'speeding': return isDE ? 'Geschwindigkeit' : 'Speeding';
      case 'shoulder_check': return isDE ? 'Schulterblick' : 'Shoulder Check';
      case 'priority': return isDE ? 'Vorfahrt' : 'Priority';
      case 'right_before_left': return isDE ? 'Rechts vor Links' : 'Right-Before-Left';
      case 'idling': return isDE ? 'Umweltschutz' : 'Eco/Idling';
      case 'roundabout_signal': return isDE ? 'Kreisverkehr' : 'Roundabout Signal';
      case 'harsh_braking': return isDE ? 'Harte Bremsung' : 'Harsh Braking';
      case 'harsh_cornering': return isDE ? 'Kurvenverhalten' : 'Harsh Cornering';
      case 'school_zone': return isDE ? 'Schulzone' : 'School Zone';
      case 'school_zone_speeding': return isDE ? 'Schulzone (+km/h)' : 'School Zone Speed';
      case 'curve_speeding': return isDE ? 'Geschw. in Kurve' : 'Cornering Speed';
      case 'aggressive_cornering': return isDE ? 'G-Kräfte Kurve' : 'Aggressive Cornering';
      case 'wrong_way': return isDE ? 'Falschfahrer' : 'Wrong Way';
      case 'illegal_turn': return isDE ? 'Abbiegefehler' : 'Illegal Turn';
      default: return type.replace(/_/g, ' ');
    }
  };

  // Real data for bars (last 7 days)
  const barData = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  thisWeekSessions.forEach(s => {
    if (s.date) {
      const day = (new Date(s.date).getDay() + 6) % 7;
      barData[day] += (s.duration || 0);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {isDE ? 'Wöchentliche Analyse' : 'Weekly Insights'}
        </h3>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
          <Star className="h-3 w-3 fill-current" />
          AI Coach
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekly Progress Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isDE ? 'Wochen-Aktivität' : 'Weekly Activity'}
                </p>
                <p className="text-[10px] text-slate-500">{isDE ? 'Letzte 7 Tage' : 'Last 7 Days'}</p>
              </div>
            </div>
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
              isUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
            )}>
              <TrendingUp className={cn('h-3 w-3', !isUp && 'rotate-180')} />
              {isUp ? '+' : ''}{Math.round(minuteDiff / 60)}h
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-16">
            {barData.map((val, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t-sm bg-slate-100 dark:bg-slate-700 relative group/bar cursor-pointer"
                style={{ height: `${Math.max(10, Math.min(100, (val / 120) * 100))}%` }}
              >
                <div className="absolute inset-x-0 bottom-0 top-0 bg-blue-500 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-sm" />
                {i === todayIndex && <div className="absolute inset-x-0 bottom-0 top-0 bg-indigo-600 rounded-t-sm" />}
                
                {/* TOOLTIP */}
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/bar:block bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20 shadow-xl font-bold animate-in fade-in zoom-in-95 duration-200">
                  {Math.floor(val / 60)}h {val % 60}m
                </div>
              </div>
            ))}
          </div>
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px] dark:bg-slate-800/40 opacity-0 hover:opacity-100 transition-opacity">
               <button 
                onClick={onOpenPaywall}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
               >
                 <Crown className="h-3 w-3 text-amber-400" />
                 {isDE ? 'Werte freischalten' : 'Unlock Insights'}
               </button>
            </div>
          )}
          <div className="mt-2 flex justify-between text-[8px] font-bold uppercase tracking-tighter text-slate-400">
            {dayNames.map((name, i) => (
              <span key={i} className={cn(i === todayIndex && 'text-indigo-600 dark:text-indigo-400 font-black')}>
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* AI Focus Areas Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {isDE ? 'Fokus-Themen' : 'Focus Areas'}
              </p>
              <p className="text-[10px] text-slate-500">
                {isDE ? 'Basierend auf deinen Fahrern' : 'Based on your driving history'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {isPremium ? (
              topMistakes.length > 0 ? topMistakes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {getMistakeLabel(type)}
                    </span>
                    <span className="text-[10px] text-slate-400">({count}x)</span>
                  </div>
                  <button
                    onClick={() => onDirectLessonSelect(lessonMap[type] || 'basics-0')}
                    className="group flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {isDE ? 'Lektion wiederholen' : 'Review Lesson'}
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <Zap className="h-8 w-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-emerald-600">
                    {isDE ? 'Perfekt! Keine Fehler-Häufung.' : 'Perfect! No recurring faults.'}
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Lock className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-medium text-slate-400 px-4">
                  {isDE ? 'Die KI-Fehleranalyse ist für Pro-Mitglieder verfügbar.' : 'AI mistake analysis is available for Pro members.'}
                </p>
                <button 
                  onClick={onOpenPaywall}
                  className="mt-3 text-[10px] font-black text-indigo-600 underline"
                >
                  {isDE ? 'PRO FREISCHALTEN' : 'UNLOCK PRO'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Efficiency & Environment Card */}
      {mistakeCounts['idling'] > 0 && isPremium && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 dark:border-emerald-900/30 dark:bg-emerald-900/10">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                {isDE ? 'Eco-Coach Insight' : 'Eco-Coach Insight'}
              </p>
              <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                {isDE 
                  ? `Du hast in dieser Woche ${mistakeCounts['idling']}x den Motor unnötig laufen lassen. Das kostet ca. 1.2L Kraftstoff pro Stunde und ist ein Prüfungsfehler.` 
                  : `You left the engine idling ${mistakeCounts['idling']}x this week. This wastes ~1.2L of fuel per hour and is recorded as an environmental fault in the exam.`}
              </p>
              <button 
                onClick={() => onDirectLessonSelect('exam-1')}
                className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700 underline underline-offset-4 dark:text-emerald-300"
              >
                {isDE ? 'Energiesparende Fahrweise lernen' : 'Learn energy-saving driving'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

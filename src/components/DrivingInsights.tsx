import React from 'react';
import { TrendingUp, Target, Clock, ChevronRight, AlertTriangle, Zap, Calendar, Wind, Star } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import type { DrivingMistake } from '../types';

interface DrivingInsightsProps {
  onDirectLessonSelect: (lessonId: string) => void;
}

export function DrivingInsights({ onDirectLessonSelect }: DrivingInsightsProps) {
  const { language, userProgress, isPremium } = useAppStore();
  const { drivingSessions } = userProgress;
  const isDE = language === 'de';

  // Sort sessions by date (newest first)
  const sortedSessions = [...drivingSessions].sort((a, b) => b.date - a.date);
  
  // Calculate Weekly Stats
  const now = Date.now();
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
  const thisWeekSessions = sortedSessions.filter(s => (now - s.date) < ONE_WEEK);
  const lastWeekSessions = sortedSessions.filter(s => (now - s.date) >= ONE_WEEK && (now - s.date) < (2 * ONE_WEEK));

  const thisWeekMinutes = thisWeekSessions.reduce((acc, s) => acc + s.duration, 0);
  const lastWeekMinutes = lastWeekSessions.reduce((acc, s) => acc + s.duration, 0);
  
  const minuteDiff = thisWeekMinutes - lastWeekMinutes;
  const isUp = minuteDiff >= 0;

  // Aggregate Mistakes for recommendations
  const mistakeCounts = drivingSessions.reduce((acc, s) => {
    s.mistakes.forEach(m => {
      if (m && m.type) {
        acc[m.type] = (acc[m.type] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const topMistakes = Object.entries(mistakeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Mapping mistakes to lesson IDs
  const lessonMap: Record<string, string> = {
    'speeding': 'basics-4',
    'shoulder_check': 'basics-1a',
    'priority': 'basics-5',
    'right_before_left': 'basics-5',
    'idling': 'basics-1a',
    'roundabout_signal': 'basics-7',
    'stop_sign': 'basics-5',
    'signal': 'basics-1b'
  };

  const getMistakeLabel = (type: string) => {
    switch (type) {
      case 'speeding': return isDE ? 'Geschwindigkeit' : 'Speeding';
      case 'shoulder_check': return isDE ? 'Schulterblick' : 'Shoulder Check';
      case 'priority': return isDE ? 'Vorfahrt' : 'Priority';
      case 'right_before_left': return isDE ? 'Rechts vor Links' : 'Right-Before-Left';
      case 'idling': return isDE ? 'Umweltschutz' : 'Eco/Idling';
      case 'roundabout_signal': return isDE ? 'Kreisverkehr' : 'Roundabout';
      default: return type.replace(/_/g, ' ');
    }
  };

  if (drivingSessions.length === 0) return null;

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
                <p className="text-[10px] text-slate-500">Letzte 7 Tage</p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              isUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-red-50 text-red-600 dark:bg-red-900/20"
            )}>
              <TrendingUp className={cn("h-3 w-3", !isUp && "rotate-180")} />
              {isUp ? '+' : ''}{Math.round(minuteDiff / 60)}h
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-16">
            {[45, 60, 30, 90, 45, 0, thisWeekMinutes % 120].map((val, i) => (
              <div 
                key={i} 
                className="flex-1 rounded-t-sm bg-slate-100 dark:bg-slate-700 relative group/bar"
                style={{ height: `${Math.max(10, (val / 120) * 100)}%` }}
              >
                <div className="absolute inset-x-0 bottom-0 top-0 bg-blue-500 opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-sm" />
                {i === 6 && <div className="absolute inset-x-0 bottom-0 top-0 bg-indigo-600 rounded-t-sm" />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[8px] font-bold uppercase tracking-tighter text-slate-400">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span className="text-indigo-600">Today</span>
          </div>
        </div>

        {/* AI Focus Areas Card */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
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
            {topMistakes.length > 0 ? topMistakes.map(([type, count]) => (
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
            )}
          </div>
        </div>
      </div>

      {/* Efficiency & Environment Card */}
      {mistakeCounts['idling'] > 0 && (
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
                onClick={() => onDirectLessonSelect('basics-1a')}
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

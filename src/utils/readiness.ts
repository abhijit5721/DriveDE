/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { DrivingSession } from '../types';

/**
 * Calculates a student's total exam readiness score.
 * A hybrid model that balances:
 * 1. Curriculm Completion (Theory) - 30% weight
 * 2. Legal Requirements (Sonderfahrten) - 30% weight
 * 3. Driving Performance (Mistake Stability) - 40% weight
 */
export const calculateTotalReadiness = (
  sessions: DrivingSession[], 
  completedLessonsCount: number,
  totalLessons: number
) => {
  if (!sessions || sessions.length === 0) {
    // If no driving has happened, readiness is purely based on theory, but capped low
    const theoryScore = Math.min(100, (completedLessonsCount / (totalLessons || 1)) * 100);
    return Math.round(theoryScore * 0.3); // Max 30% if theory is done but no driving
  }

  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  
  // 1. Theory Component (30%)
  const theoryScore = Math.min(100, (completedLessonsCount / (totalLessons || 1)) * 100);
  
  // 2. Legal Component (30%)
  const legalRequirementMinutes = 12 * 45;
  const legalScore = Math.min(100, (totalMinutes / legalRequirementMinutes) * 100);
  
  // 3. Performance Component (40%)
  // Penalty based on recent mistakes (last 3 sessions)
  const recentSessions = sessions.slice(0, 3);
  const recentMistakes = recentSessions.reduce((acc, s) => acc + (s.mistakes?.length || 0), 0);
  const avgRecentMistakes = recentMistakes / (recentSessions.length || 1);
  const performanceScore = Math.max(0, 100 - (avgRecentMistakes * 20));
  
  // Weighted Result
  const score = (theoryScore * 0.3) + (legalScore * 0.3) + (performanceScore * 0.4);
  
  return Math.round(score);
};

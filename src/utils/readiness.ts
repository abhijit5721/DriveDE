/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { DrivingSession, DrivingMistake } from '../types';

const MISTAKE_WEIGHTS: Record<string, number> = {
  wrong_way: 5,
  stop_sign: 5,
  pedestrian_safety: 5,
  school_zone_speeding: 5,
  aggressive_cornering: 5,
  speeding: 3,
  priority: 3,
  right_before_left: 3,
  signal: 3,
  shoulder_check: 3,
  mirror_check: 3,
  harsh_braking: 1,
  rapid_acceleration: 1,
  illegal_turn: 1,
  idling: 1,
  roundabout_signal: 1,
  curve_speeding: 1,
  other: 1,
};

const getWeightedMistakeCount = (mistakes?: DrivingMistake[]): number => {
  if (!mistakes) return 0;
  return mistakes.reduce((sum, m) => {
    if (m.status === 'rejected') return sum;
    return sum + (MISTAKE_WEIGHTS[m.type] || 1);
  }, 0);
};

export interface ReadinessBreakdown {
  score: number;
  theory: number;
  legal: number;
  performance: number;
  trend: number;
  trendDirection: 'improving' | 'stable' | 'regressing';
  recentSessionsAnalyzed: number;
}

export const calculateTotalReadiness = (
  sessions: DrivingSession[],
  completedLessonsCount: number,
  totalLessons: number
): ReadinessBreakdown => {
  const SESSIONS_TO_ANALYZE = 5;

  const theoryScore = Math.min(100, (completedLessonsCount / (totalLessons || 1)) * 100);

  if (!sessions || sessions.length === 0) {
    const score = Math.round(theoryScore);
    return {
      score,
      theory: Math.round(theoryScore),
      legal: 0,
      performance: 0,
      trend: 0,
      trendDirection: 'stable',
      recentSessionsAnalyzed: 0,
    };
  }

  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const legalRequirementMinutes = 12 * 45;
  const legalScore = Math.min(100, (totalMinutes / legalRequirementMinutes) * 100);

  const recentSessions = sessions.slice(0, SESSIONS_TO_ANALYZE);
  const totalWeightedMistakes = recentSessions.reduce(
    (acc, s) => acc + getWeightedMistakeCount(s.mistakes),
    0
  );
  const avgWeightedMistakes = totalWeightedMistakes / (recentSessions.length || 1);
  const performanceScore = Math.max(0, 100 - (avgWeightedMistakes * 10));

  const recentHalf = recentSessions.slice(0, 3);
  const previousHalf = recentSessions.slice(3, 5);

  let trend = 0;
  let trendDirection: 'improving' | 'stable' | 'regressing' = 'stable';

  if (previousHalf.length > 0 && recentSessions.length >= 4) {
    const recentScore = recentHalf.reduce((acc, s) => acc + getWeightedMistakeCount(s.mistakes), 0) / recentHalf.length;
    const previousScore = previousHalf.reduce((acc, s) => acc + getWeightedMistakeCount(s.mistakes), 0) / previousHalf.length;

    const improvement = previousScore > 0 ? ((previousScore - recentScore) / previousScore) * 100 : 0;

    if (improvement > 15) {
      trend = 10;
      trendDirection = 'improving';
    } else if (improvement < -15) {
      trend = -5;
      trendDirection = 'regressing';
    }
  }

  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (theoryScore * 0.25) +
        (legalScore * 0.25) +
        (performanceScore * 0.40) +
        trend
      )
    )
  );

  return {
    score,
    theory: Math.round(theoryScore),
    legal: Math.round(legalScore),
    performance: Math.round(performanceScore),
    trend,
    trendDirection,
    recentSessionsAnalyzed: recentSessions.length,
  };
};
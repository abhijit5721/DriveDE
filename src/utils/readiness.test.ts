/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { describe, it, expect } from 'vitest';
import { calculateTotalReadiness } from './readiness';
import { DrivingSession } from '../types';

describe('calculateTotalReadiness', () => {
  it('should return 0 for no sessions', () => {
    const result = calculateTotalReadiness([], 0, 10);
    expect(result.score).toBe(0);
    expect(result.legal).toBe(0);
    expect(result.recentSessionsAnalyzed).toBe(0);
  });

  it('should reflect legal hour progress', () => {
    const sessions = Array(12).fill({
      duration: 45,
      mistakes: [],
      type: 'ueberland'
    }) as DrivingSession[];

    const result = calculateTotalReadiness(sessions, 0, 10);
    expect(result.score).toBe(90);
  });

  it('should penalize recent mistakes heavily', () => {
    const sessionsWithMistakes: DrivingSession[] = [
      {
        id: '1',
        duration: 45,
        mistakes: Array(5).fill({ type: 'speeding', timestamp: Date.now() }),
        date: '',
        type: 'normal',
        notes: '',
        instructorName: '',
        route: [],
        totalDistance: 0,
        locationSummary: ''
      }
    ];

    const result = calculateTotalReadiness(sessionsWithMistakes, 10, 10);
    expect(result.score).toBeLessThan(40);
  });

  it('should weight critical mistakes higher', () => {
    const normalMistakes: DrivingSession[] = [
      {
        id: '1',
        duration: 45,
        mistakes: [{ type: 'harsh_braking', timestamp: Date.now() }],
        date: '',
        type: 'normal',
        notes: '',
        instructorName: '',
        route: [],
        totalDistance: 0,
        locationSummary: ''
      }
    ];

    const criticalMistakes: DrivingSession[] = [
      {
        id: '1',
        duration: 45,
        mistakes: [{ type: 'wrong_way', timestamp: Date.now() }],
        date: '',
        type: 'normal',
        notes: '',
        instructorName: '',
        route: [],
        totalDistance: 0,
        locationSummary: ''
      }
    ];

    const normalScore = calculateTotalReadiness(normalMistakes, 10, 10);
    const criticalScore = calculateTotalReadiness(criticalMistakes, 10, 10);

    expect(criticalScore.score).toBeLessThan(normalScore.score);
  });
});
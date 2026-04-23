import { describe, it, expect } from 'vitest';
import { calculateTotalReadiness } from './readiness';
import { DrivingSession } from '../types';

describe('calculateTotalReadiness', () => {
  it('should return 0 for a brand new student', () => {
    expect(calculateTotalReadiness([], 0, 10)).toBe(0);
  });

  it('should reflect theory progress', () => {
    // 100% theory, 0% practical
    const score = calculateTotalReadiness([], 10, 10);
    // Theory is 30% weight, so 100% theory should be ~30 points
    expect(score).toBe(30);
  });

  it('should reflect legal hour progress', () => {
    // 0% theory, 100% legal hours (12 * 45 mins), 100% performance (no mistakes)
    const sessions: DrivingSession[] = Array(12).fill({
      duration: 45,
      mistakes: []
    });
    
    const score = calculateTotalReadiness(sessions as any, 0, 10);
    // Legal (30%) + Performance (40%) = 70%
    expect(score).toBe(70);
  });

  it('should penalize recent mistakes heavily', () => {
    const sessionsWithMistakes: DrivingSession[] = [
      { id: '1', duration: 45, mistakes: [{}, {}, {}, {}, {}] as any, date: '', type: 'normal', notes: '', instructorName: '', route: [], totalDistance: 0, locationSummary: '' }
    ];
    
    const score = calculateTotalReadiness(sessionsWithMistakes, 10, 10);
    // Theory (30) + Legal (~2) + Performance (should be low)
    expect(score).toBeLessThan(40);
  });
});

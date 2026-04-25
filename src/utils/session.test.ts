/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { describe, it, expect } from 'vitest';
import { deduplicateSessions, RawSession } from './session';

describe('deduplicateSessions', () => {
  it('should remove exact duplicates based on external_id', () => {
    const rawSessions = [
      { id: '1', external_id: 'ext-123', session_date: '2026-04-23T12:00:00Z', duration_minutes: 45, category: 'city' },
      { id: '2', external_id: 'ext-123', session_date: '2026-04-23T12:00:00Z', duration_minutes: 45, category: 'city' }
    ];

    const result = deduplicateSessions(rawSessions);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should remove "similarity" duplicates (same date, duration, category, distance)', () => {
    const rawSessions = [
      { id: '1', session_date: '2026-04-23T10:00:00Z', duration_minutes: 60, category: 'highway', total_distance: 15.5 },
      { id: '2', session_date: '2026-04-23T10:00:00Z', duration_minutes: 60, category: 'highway', total_distance: 15.5 }
    ];

    const result = deduplicateSessions(rawSessions);
    expect(result).toHaveLength(1);
  });

  it('should preserve back-to-back lessons with different instructors', () => {
    const rawSessions: RawSession[] = [
      { id: '1', session_date: '2026-04-23T10:00:00Z', duration_minutes: 45, category: 'normal', instructor_name: 'John' },
      { id: '2', session_date: '2026-04-23T10:00:00Z', duration_minutes: 45, category: 'normal', instructor_name: 'Jane' }
    ];

    const result = deduplicateSessions(rawSessions);
    expect(result).toHaveLength(2);
  });

  it('should handle empty input gracefully', () => {
    expect(deduplicateSessions([])).toEqual([]);
    expect(deduplicateSessions(null as unknown as RawSession[])).toEqual([]);
  });
});

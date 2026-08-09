/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';

// Mock supabaseSync to prevent network calls during store testing
vi.mock('../services/supabaseSync', () => ({
  ensureProfileFromState: vi.fn().mockResolvedValue(undefined),
  syncCompletedLesson: vi.fn().mockResolvedValue(undefined),
  syncDrivingSession: vi.fn().mockResolvedValue(undefined),
  syncQuizAttempt: vi.fn().mockResolvedValue(undefined),
  deleteDrivingSessionFromCloud: vi.fn().mockResolvedValue(undefined),
  clearDrivingHistoryFromCloud: vi.fn().mockResolvedValue(undefined),
  resetAllDataFromCloud: vi.fn().mockResolvedValue(undefined),
}));

// Mock idb-keyval to prevent real IndexedDB interactions
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { resetProgress } = useAppStore.getState();
    resetProgress();
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const state = useAppStore.getState();
    expect(state.activeTab).toBe('home');
    // The initial language follows the browser locale (DRI-14 persona fix):
    // German browsers get 'de', everything else 'en'. jsdom reports en-US.
    const expected = navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en';
    expect(state.language).toBe(expected);
    expect(state.userProgress.hourlyRate45).toBe(60);
  });

  it('derives the initial language from the browser locale rule', () => {
    const rule = (locale: string) => (locale.toLowerCase().startsWith('de') ? 'de' : 'en');
    expect(rule('de-DE')).toBe('de');
    expect(rule('de-AT')).toBe('de');
    expect(rule('en-US')).toBe('en');
    expect(rule('hi-IN')).toBe('en');
    expect(rule('tr-TR')).toBe('en');
  });

  it('should initialize with default cookie settings', () => {
    const state = useAppStore.getState();
    expect(state.cookieSettings.essential).toBe(true);
    expect(state.cookieSettings.analytics).toBe(false);
    expect(state.cookieSettings.marketing).toBe(false);
    expect(state.cookieSettings.hasSet).toBe(false);
  });

  it('should update cookie settings', () => {
    const { setCookieSettings } = useAppStore.getState();
    setCookieSettings({ analytics: true, hasSet: true });
    
    const state = useAppStore.getState();
    expect(state.cookieSettings.analytics).toBe(true);
    expect(state.cookieSettings.hasSet).toBe(true);
    expect(state.cookieSettings.essential).toBe(true);
  });

  it('should update active tab', () => {
    const { setActiveTab } = useAppStore.getState();
    setActiveTab('tracker');
    expect(useAppStore.getState().activeTab).toBe('tracker');
  });

  it('should update finance settings atomically', async () => {
    const { updateFinanceSettings } = useAppStore.getState();
    const newCosts = { registration: 400 };
    const newRate = 65;

    updateFinanceSettings(newCosts, newRate);

    const state = useAppStore.getState();
    expect(state.userProgress.fixedCosts.registration).toBe(400);
    expect(state.userProgress.hourlyRate45).toBe(65);
  });

  it('should track completed lessons', () => {
    const { completeLesson } = useAppStore.getState();
    completeLesson('lesson-1');
    
    const state = useAppStore.getState();
    expect(state.userProgress.completedLessons).toContain('lesson-1');
  });

  it('should manage driving sessions correctly', () => {
    const { addDrivingSession } = useAppStore.getState();
    const session = {
      date: '2026-04-24',
      duration: 90,
      type: 'normal' as const,
      notes: 'Test session',
      instructorName: 'John',
      route: [],
      mistakes: [],
      totalDistance: 10,
    };

    addDrivingSession(session);
    
    const state = useAppStore.getState();
    expect(state.userProgress.drivingSessions.length).toBe(1);
    expect(state.userProgress.totalDrivingMinutes).toBe(90);
  });
});

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureProfileFromState, processSyncQueue } from './supabaseSync';
import { supabase } from '../lib/supabase';
import { get as getIDB, set as setIDB } from 'idb-keyval';
import type { AppState } from '../types';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(),
      select: vi.fn(),
      delete: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
}));

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
}));

describe('supabaseSync', () => {
  const mockState = {
    authUserId: 'user_123',
    learningPath: 'standard',
    transmissionType: 'manual',
    language: 'de',
    darkMode: false,
    userProgress: {
      incorrectQuestions: [],
      hourlyRate45: 60,
      fixedCosts: {},
    },
  } as unknown as AppState;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
      writable: true
    });
  });

  it('should add to queue when sync fails', async () => {
    // Mock user ID
    vi.mocked(supabase!.auth.getUser).mockResolvedValue({ data: { user: { id: 'user_123' } }, error: null } as any);
    
    // Mock a network failure (return error from supabase)
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Network Error' } });
    vi.mocked(supabase!.from).mockReturnValue({ upsert: mockUpsert } as any);

    // Mock empty queue initially
    vi.mocked(getIDB).mockResolvedValue([]);

    vi.useFakeTimers();
    
    const syncPromise = ensureProfileFromState(mockState);
    vi.runAllTimers();
    await syncPromise;

    // Verify it tried to upsert
    expect(mockUpsert).toHaveBeenCalled();
    
    // Verify it added to the queue (setIDB called with queue key)
    expect(setIDB).toHaveBeenCalledWith('drivede-sync-queue', expect.arrayContaining([
      expect.objectContaining({ type: 'profile' })
    ]));

    vi.useRealTimers();
  });

  it('should process the queue when online', async () => {
    // Mock a task in the queue
    const mockTask = {
      id: 'task-1',
      type: 'lesson',
      payload: { lessonId: 'lesson-1' },
      timestamp: Date.now(),
      retryCount: 0
    };
    vi.mocked(getIDB).mockResolvedValue([mockTask]);

    // Mock success for the task
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase!.from).mockReturnValue({ 
      upsert: mockUpsert,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    } as any);

    await processSyncQueue();

    // Verify it called upsert for the lesson
    expect(mockUpsert).toHaveBeenCalled();
    
    // Verify queue was cleared (setIDB called with empty array)
    expect(setIDB).toHaveBeenCalledWith('drivede-sync-queue', []);
  });

  it('should apply exponential backoff and skip tasks within backoff window', async () => {
    // Mock a task that failed recently
    const recentTask = {
      id: 'task-backoff',
      type: 'lesson',
      payload: { lessonId: 'lesson-1' },
      timestamp: Date.now() - 500, // Created 500ms ago
      retryCount: 1, // backoff window = 2^1 * 1000 = 2000ms
      lastAttemptTimestamp: Date.now() - 500 // Last attempted 500ms ago
    };
    vi.mocked(getIDB).mockResolvedValue([recentTask]);

    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase!.from).mockReturnValue({ 
      upsert: mockUpsert
    } as any);

    await processSyncQueue();

    // Verify it did NOT attempt to sync the lesson because of backoff
    expect(mockUpsert).not.toHaveBeenCalled();
    
    // Verify queue was saved with the task still in it
    expect(setIDB).toHaveBeenCalledWith('drivede-sync-queue', [recentTask]);
  });

  it('should deduplicate profile sync tasks in the queue when offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
      writable: true
    });

    vi.mocked(supabase!.auth.getUser).mockResolvedValue({ data: { user: { id: 'user_123' } }, error: null } as any);
    
    // Mock getIDB to return an existing profile task in queue
    const existingTask = {
      id: 'profile-existing-id',
      type: 'profile' as const,
      payload: { state: { ...mockState, darkMode: false } },
      timestamp: Date.now() - 5000,
      retryCount: 0
    };
    
    // Mock upsert to fail so it gets queued
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Network Error' } });
    vi.mocked(supabase!.from).mockReturnValue({ upsert: mockUpsert } as any);
    
    let savedQueue: any[] = [];
    vi.mocked(getIDB).mockImplementation(async (key) => {
      if (key === 'drivede-sync-queue') return [existingTask];
      return null;
    });
    vi.mocked(setIDB).mockImplementation(async (key, val) => {
      if (key === 'drivede-sync-queue') savedQueue = val;
    });

    vi.useFakeTimers();

    const syncPromise = ensureProfileFromState({ ...mockState, darkMode: true });
    vi.runAllTimers();
    await syncPromise;

    // Verify that instead of appending, the existing task was replaced or updated
    expect(savedQueue.length).toBe(1);
    expect(savedQueue[0].payload.state.darkMode).toBe(true); // Should have updated value
    
    vi.useRealTimers();
  });
});

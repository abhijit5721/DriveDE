import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureProfileFromState, processSyncQueue, getCurrentUserId } from './supabaseSync';
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
    learningPath: 'fahrschule',
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
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'user_123' } } });
    
    // Mock a network failure (return error from supabase)
    const mockUpsert = vi.fn().mockResolvedValue({ error: { message: 'Network Error' } });
    (supabase.from as any).mockReturnValue({ upsert: mockUpsert });

    // Mock empty queue initially
    (getIDB as any).mockResolvedValue([]);

    // We need to wait for the debounce (or mock it)
    // For testing, we'll just call the performSync logic indirectly or mock the timer
    // Actually, ensureProfileFromState returns a promise that resolves after the timer fires
    // But since it's a 2s timer, we should probably mock setTimeout
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
    (getIDB as any).mockResolvedValue([mockTask]);

    // Mock success for the task
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ 
      upsert: mockUpsert,
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    });

    await processSyncQueue();

    // Verify it called upsert for the lesson
    expect(mockUpsert).toHaveBeenCalled();
    
    // Verify queue was cleared (setIDB called with empty array)
    expect(setIDB).toHaveBeenCalledWith('drivede-sync-queue', []);
  });
});

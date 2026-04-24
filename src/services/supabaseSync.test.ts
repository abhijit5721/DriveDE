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
});

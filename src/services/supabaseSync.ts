/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

/**
 * supabaseSync.ts
 * 
 * Middleware-style service for synchronizing local store data with Supabase.
 * Most functions check for an active user session before attempting sync.
 */

import type { LicenseType, AppState, DrivingSession, LearningPathType, TransmissionType } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { get as getIDB, set as setIDB, del as delIDB } from 'idb-keyval';

// --- SYNC QUEUE TYPES ---

type SyncTaskType = 'profile' | 'lesson' | 'session' | 'quiz' | 'delete_session' | 'clear_history';

interface SyncTask {
  id: string;
  type: SyncTaskType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  lastAttemptTimestamp?: number;
}

const QUEUE_KEY = 'drivede-sync-queue';
let isProcessing = false;

// --- MAPPING HELPERS ---
// These ensure that local TS types match the naming conventions and constraints of the DB.

const mapLearningPathToDb = (path: LearningPathType): 'standard' | 'conversion' =>
  path === 'umschreibung' ? 'conversion' : 'standard';

const mapTransmissionToDb = (type: TransmissionType): 'manual' | 'automatic' =>
  type === 'manual' ? 'manual' : 'automatic';

const mapTrackerCategoryToDb = (type: DrivingSession['type']): 'normal' | 'ueberland' | 'autobahn' | 'night' => {
  if (type === 'nacht') return 'night';
  return type;
};

// --- QUEUE MANAGEMENT ---

async function getQueue(): Promise<SyncTask[]> {
  const queue = await getIDB(QUEUE_KEY);
  return (queue as SyncTask[]) || [];
}

async function saveQueue(queue: SyncTask[]) {
  await setIDB(QUEUE_KEY, queue);
}

async function addToQueue(type: SyncTaskType, payload: Record<string, unknown>) {
  let queue = await getQueue();

  if (type === 'profile') {
    const existingIndex = queue.findIndex(t => t.type === 'profile');
    if (existingIndex !== -1) {
      queue[existingIndex] = {
        ...queue[existingIndex],
        payload,
        timestamp: Date.now(),
        retryCount: 0,
        lastAttemptTimestamp: undefined
      };
      await saveQueue(queue);
      console.log(`[SyncQueue] Profile task updated in-place. Queue length: ${queue.length}`);
      return;
    }
  } else if (type === 'clear_history') {
    queue = queue.filter(t => t.type !== 'session' && t.type !== 'delete_session');
  }

  const task: SyncTask = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0
  };
  queue.push(task);
  await saveQueue(queue);
  console.log(`[SyncQueue] Task added: ${type}. Queue length: ${queue.length}`);
}

/**
 * Processes the offline sync queue.
 */
export async function processSyncQueue() {
  if (isProcessing || !navigator.onLine) return;
  
  const queue = await getQueue();
  if (queue.length === 0) return;

  isProcessing = true;
  console.log(`[SyncQueue] Processing ${queue.length} pending tasks...`);
  const remainingTasks: SyncTask[] = [];

  try {
    for (const task of queue) {
      const backoffMs = Math.min(Math.pow(2, task.retryCount) * 1000, 60000);
      if (task.lastAttemptTimestamp && (Date.now() - task.lastAttemptTimestamp) < backoffMs) {
        remainingTasks.push(task);
        continue;
      }

      try {
        let success = false;
        let result = { error: null as any };
        
        switch (task.type) {
          case 'lesson':
            result = await syncCompletedLesson(task.payload.lessonId as string, true);
            break;
          case 'session':
            result = await syncDrivingSession(task.payload.session as DrivingSession, task.payload.transmissionType as TransmissionType, true);
            break;
          case 'quiz':
            result = await syncQuizAttempt(task.payload.quizId as string, task.payload.score as number, true);
            break;
          case 'profile':
            result = await ensureProfileFromState(task.payload.state as AppState, true);
            break;
          case 'delete_session':
            result = await deleteDrivingSessionFromCloud(task.payload.sessionId as string, true);
            break;
          case 'clear_history':
            result = await clearDrivingHistoryFromCloud(true);
            break;
        }

        success = !result || !result.error;

        if (!success) {
          if (task.retryCount < 5) {
            task.retryCount++;
            task.lastAttemptTimestamp = Date.now();
            remainingTasks.push(task);
          } else {
            console.warn(`[SyncQueue] Task ${task.id} exceeded max retries. Dropped.`);
          }
        }
      } catch (error) {
        console.warn(`[SyncQueue] Task failed: ${task.id}`, error);
        if (task.retryCount < 5) {
          task.retryCount++;
          task.lastAttemptTimestamp = Date.now();
          remainingTasks.push(task);
        } else {
          console.warn(`[SyncQueue] Task ${task.id} exceeded max retries. Dropped.`);
        }
      }
    }

    await saveQueue(remainingTasks);
  } finally {
    isProcessing = false;
  }
}

// --- CORE SYNC FUNCTIONS ---

export async function getCurrentUserId() {
  if (!supabase) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

let profileSyncTimer: NodeJS.Timeout | null = null;

/**
 * Syncs the global application state (settings, progress, etc) to the profiles table.
 * Includes a 2-second debounce to prevent spamming the database with high-frequency updates.
 */
export async function ensureProfileFromState(state: AppState, isRetry: boolean = false): Promise<{ error: any }> {
  if (profileSyncTimer && !isRetry) {
    clearTimeout(profileSyncTimer);
  }

  return new Promise<{ error: any }>((resolve) => {
    const performSync = async () => {
      if (!isSupabaseConfigured || !supabase) {
        resolve({ error: new Error('Supabase not configured') });
        return;
      }
      
      const userId = await getCurrentUserId();
      if (!userId) {
        resolve({ error: new Error('No user session') });
        return;
      }

      console.log('[DB-Sync] Starting profile sync for user:', userId);

      const { error } = await supabase.from('profiles_secure').upsert({
        id: userId,
        learning_path: mapLearningPathToDb(state.learningPath),
        transmission_type: mapTransmissionToDb(state.transmissionType),
        language: state.language,
        theme: state.darkMode ? 'dark' : 'light',
        incorrect_questions: state.userProgress.incorrectQuestions || [],
        unlocked_achievements: state.userProgress.unlockedAchievements || [],
        hourly_rate_45: state.userProgress.hourlyRate45,
        fixed_costs: state.userProgress.fixedCosts,
        is_public_report_enabled: state.isPublicReportEnabled,
        has_completed_onboarding: state.hasCompletedOnboarding,
      });

      if (error) {
        console.error('[DB-Sync] FAILED to sync profile:', error.message);
        if (!isRetry) {
          await addToQueue('profile', { state });
        }
        resolve({ error });
      } else {
        console.log('[DB-Sync] Profile sync successful!');
        resolve({ error: null });
      }
    };

    if (isRetry) {
      void performSync();
    } else {
      profileSyncTimer = setTimeout(() => {
        void performSync();
      }, 2000);
    }
  });
}

export async function syncCompletedLesson(lessonId: string, isRetry = false): Promise<{ error: any }> {
  if (!isSupabaseConfigured || !supabase) return { error: new Error('Supabase not configured') };
  const userId = await getCurrentUserId();
  
  if (!userId) {
    if (!isRetry) await addToQueue('lesson', { lessonId });
    return { error: new Error('No user session') };
  }

  const { error } = await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    status: 'completed',
    completed_at: new Date().toISOString()
  }, { onConflict: 'user_id,lesson_id' });

  if (error) {
    if (!isRetry) {
      await addToQueue('lesson', { lessonId });
    }
    return { error };
  }
  return { error: null };
}

export async function syncDrivingSession(session: DrivingSession, transmissionType: TransmissionType, isRetry = false): Promise<{ error: any }> {
  if (!isSupabaseConfigured || !supabase) return { error: new Error('Supabase not configured') };
  const userId = await getCurrentUserId();

  if (!userId) {
    if (!isRetry) await addToQueue('session', { session, transmissionType });
    return { error: new Error('No user session') };
  }

  const { error } = await supabase.from('driving_sessions').upsert({
    user_id: userId,
    external_id: session.id,
    session_date: session.date,
    duration_minutes: session.duration,
    category: mapTrackerCategoryToDb(session.type),
    notes: session.notes,
    instructor_name: session.instructorName,
    route: session.route,
    mistakes: session.mistakes,
    total_distance: session.totalDistance,
    location_summary: session.locationSummary,
    transmission_type: mapTransmissionToDb(transmissionType)
  }, {
    onConflict: 'user_id,external_id'
  });

  if (error) {
    console.error('[DB-Sync] FAILED to sync driving session:', error.message);
    if (!isRetry) await addToQueue('session', { session, transmissionType });
    // Update local store with error status
    const { useAppStore } = await import('../store/useAppStore');
    useAppStore.getState().updateDrivingSession(session.id, { syncStatus: 'error' });
    return { error };
  } else {
    console.log('[DB-Sync] Driving session sync successful:', session.id);
    // Update local store with synced status
    const { useAppStore } = await import('../store/useAppStore');
    useAppStore.getState().updateDrivingSession(session.id, { syncStatus: 'synced' });
    return { error: null };
  }
}

export async function syncQuizAttempt(quizId: string, score: number, isRetry = false): Promise<{ error: any }> {
  if (!isSupabaseConfigured || !supabase) return { error: new Error('Supabase not configured') };
  const userId = await getCurrentUserId();

  if (!userId) {
    if (!isRetry) await addToQueue('quiz', { quizId, score });
    return { error: new Error('No user session') };
  }

  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    quiz_id: quizId,
    score: score,
    completed_at: new Date().toISOString()
  });

  if (error) {
    if (!isRetry) {
      await addToQueue('quiz', { quizId, score });
    }
    return { error };
  }
  return { error: null };
}

export async function hydrateFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [lessonsResult, sessionsResult, quizAttemptsResult] = await Promise.all([
    supabase.from('lesson_progress').select('*').eq('user_id', userId),
    supabase.from('driving_sessions').select('*').eq('user_id', userId),
    supabase.from('quiz_attempts').select('*').eq('user_id', userId),
  ]);

  console.log(`[DB-Sync] Hydrating for user: ${userId}`);
  
  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles_secure')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('[DB-Sync] Profile query error:', profileError.message);
  } else if (!profile) {
    console.warn('[DB-Sync] No profile found for user. If this is a new user, the signup trigger should create one shortly.');
  } else {
    console.log('[DB-Sync] Profile found, is_premium:', profile.is_premium);
  }

  // 2. Fetch purchases. A user can buy more than once, so read all rows —
  // `.maybeSingle()` would error out for repeat customers.
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (subError) {
    console.error('[DB-Sync] Subscription query error:', subError.message);
  }

  const now = new Date();
  // expires_at === null means lifetime
  const hasActiveSubscription = (subscriptions || []).some(
    (s) => s.status === 'active' && (!s.expires_at || new Date(s.expires_at) > now)
  );

  // Entitlement rule: once a user has purchase history, that history is the
  // source of truth — otherwise an expired 30/90-day pass stays premium forever
  // because profiles.is_premium is never set back to false. Users with no
  // purchase rows fall back to is_premium so manual/legacy grants still work.
  const hasPurchaseHistory = (subscriptions || []).length > 0;
  const isPremium = hasPurchaseHistory ? hasActiveSubscription : !!profile?.is_premium;

  console.log('[DB-Sync] Entitlement:', {
    purchases: subscriptions?.length || 0,
    hasActiveSubscription,
    profileFlag: !!profile?.is_premium,
    FINAL_isPremium: isPremium,
  });

  const lessons = lessonsResult.data;
  const sessions = sessionsResult.data;
  const quizAttempts = quizAttemptsResult.data;

  console.log('[DB-Sync] Hydration counts:', { 
    lessons: lessons?.length || 0,
    sessions: sessions?.length || 0,
    quizAttempts: quizAttempts?.length || 0
  });

  // Map DB values back to frontend types
  const dbLearningPath = profile?.learning_path; // 'standard' | 'conversion'
  const dbTransmissionType = profile?.transmission_type; // 'manual' | 'automatic'

  // Derive the licenseType from learning_path + transmission_type
  let licenseType: LicenseType | null = null;
  if (dbLearningPath === 'conversion') {
    licenseType = dbTransmissionType === 'automatic' ? 'umschreibung-automatic' : 'umschreibung-manual';
  } else if (dbLearningPath === 'standard') {
    licenseType = dbTransmissionType === 'automatic' ? 'automatic' : 'manual';
  }

  return {
    profile: profile ? { ...profile, is_premium: isPremium } : (isPremium ? { is_premium: true } : null),
    licenseType,
    learningPath: (dbLearningPath === 'conversion' ? 'umschreibung' : (dbLearningPath === 'standard' ? 'standard' : null)) as LearningPathType | null,
    transmissionType: (dbTransmissionType ?? null) as TransmissionType | null,
    lessons: lessons ?? [],
    hasCompletedOnboarding: profile?.has_completed_onboarding ?? null,
    sessions: (sessions ?? []).map(s => ({
      id: s.external_id || s.id,
      date: s.session_date || '',
      duration: Number(s.duration_minutes) || 0,
      type: s.category === 'night' ? 'nacht' : (s.category || 'normal'),
      notes: s.notes || '',
      instructorName: s.instructor_name || '',
      route: s.route || [],
      mistakes: s.mistakes || [],
      totalDistance: Number(s.total_distance) || 0,
      locationSummary: s.location_summary || ''
    })),
    quizAttempts: quizAttempts ?? [],
    incorrectQuestions: profile?.incorrect_questions ?? [],
    unlockedAchievements: profile?.unlocked_achievements ?? [],
    hourlyRate45: Number(profile?.hourly_rate_45) || 60,
    fixedCosts: profile?.fixed_costs ?? {
      registration: 350,
      theoryExam: 25,
      practicalExam: 116,
      learningMaterial: 50,
      firstAid: 40,
      visionTest: 7,
    },
    isPublicReportEnabled: profile?.is_public_report_enabled ?? true,
  };
}

export async function syncAllData(state: AppState) {
  if (!isSupabaseConfigured || !supabase) return;
  
  // First process any pending offline tasks
  await processSyncQueue();

  const userId = await getCurrentUserId();
  if (!userId) return;

  console.log('[DB-Sync] Starting ultra-optimized batch sync...');
  
  // 1. Sync Profile (Await this as it ensures the user exists in profiles)
  await ensureProfileFromState(state);
  
  const syncTasks: Promise<unknown>[] = [];

  // 2. Batch Sync Lessons (Single Request)
  if (state.userProgress.completedLessons.length > 0) {
    const lessonData = state.userProgress.completedLessons.map(id => ({
      user_id: userId,
      lesson_id: id,
      status: 'completed' as const,
      completed_at: new Date().toISOString()
    }));
    syncTasks.push(Promise.resolve(supabase.from('lesson_progress').upsert(lessonData, { onConflict: 'user_id,lesson_id' })));
  }

  if (state.userProgress.drivingSessions.length > 0) {
    const sessionData = state.userProgress.drivingSessions.map(s => ({
      external_id: s.id, 
      user_id: userId,
      session_date: s.date,
      duration_minutes: s.duration,
      category: mapTrackerCategoryToDb(s.type),
      notes: s.notes,
      instructor_name: s.instructorName,
      route: s.route,
      mistakes: s.mistakes,
      total_distance: s.totalDistance,
      location_summary: s.locationSummary,
      transmission_type: mapTransmissionToDb(state.transmissionType)
    }));
    syncTasks.push(Promise.resolve(supabase.from('driving_sessions').upsert(sessionData, { onConflict: 'user_id,external_id' })));
  }

  const results = await Promise.allSettled(syncTasks);
  const someFailed = results.some(r => r.status === 'rejected');
  
  if (!someFailed) {
    console.log('[DB-Sync] All data synchronized with cloud.');
  } else {
    console.warn('[DB-Sync] Some data failed to synchronize.');
  }
}

export async function deleteDrivingSessionFromCloud(sessionId: string, isRetry = false): Promise<{ error: any }> {
  if (!isSupabaseConfigured || !supabase) return { error: new Error('Supabase not configured') };
  const userId = await getCurrentUserId();
  if (!userId) {
    if (!isRetry) await addToQueue('delete_session', { sessionId });
    return { error: new Error('No user session') };
  }

  const { error } = await supabase.from('driving_sessions').delete().eq('id', sessionId).eq('user_id', userId);
  if (error) {
    if (!isRetry) await addToQueue('delete_session', { sessionId });
    return { error };
  }
  return { error: null };
}

export async function clearDrivingHistoryFromCloud(isRetry = false): Promise<{ error: any }> {
  if (!isSupabaseConfigured || !supabase) return { error: new Error('Supabase not configured') };
  const userId = await getCurrentUserId();
  if (!userId) {
    if (!isRetry) await addToQueue('clear_history', {});
    return { error: new Error('No user session') };
  }

  const { error } = await supabase.from('driving_sessions').delete().eq('user_id', userId);
  if (error) {
    if (!isRetry) await addToQueue('clear_history', {});
    return { error };
  }
  return { error: null };
}

export async function resetAllDataFromCloud() {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  console.log('[GDPR] Initiating full account erasure for user:', userId);

  // 1. Delete all associated data in parallel
  const results = await Promise.allSettled([
    supabase.from('lesson_progress').delete().eq('user_id', userId),
    supabase.from('driving_sessions').delete().eq('user_id', userId),
    supabase.from('quiz_attempts').delete().eq('user_id', userId),
    supabase.from('profiles_secure').delete().eq('id', userId),
    supabase.from('subscriptions').delete().eq('user_id', userId)
  ]);

  const someFailed = results.some(r => r.status === 'rejected');
  if (someFailed) {
    console.error('[GDPR] Some data erasure tasks failed.');
    throw new Error('Partial data erasure. Please contact support to ensure complete removal.');
  }

  console.log('[GDPR] Account data successfully erased from Supabase.');
  
  // 2. Local Purge
  try {
    await delIDB('drivede-storage');
    await delIDB('drivede-sync-queue');
    localStorage.clear();
    console.log('[GDPR] Local storage and IndexedDB cleared.');
  } catch (err) {
    console.error('[GDPR] Local purge failed:', err);
    // We don't throw here as the cloud deletion (the critical part) succeeded.
  }
}

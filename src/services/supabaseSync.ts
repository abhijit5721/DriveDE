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
import { get as getIDB, set as setIDB } from 'idb-keyval';

// --- SYNC QUEUE TYPES ---

type SyncTaskType = 'profile' | 'lesson' | 'session' | 'quiz' | 'delete_session' | 'clear_history';

interface SyncTask {
  id: string;
  type: SyncTaskType;
  payload: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = 'drivede-sync-queue';

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
  const queue = await getQueue();
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
  if (!navigator.onLine) return;
  
  const queue = await getQueue();
  if (queue.length === 0) return;

  console.log(`[SyncQueue] Processing ${queue.length} pending tasks...`);
  const remainingTasks: SyncTask[] = [];

  for (const task of queue) {
    try {
      let success = false;
      
      switch (task.type) {
        case 'lesson':
          await syncCompletedLesson(task.payload.lessonId as string, true);
          success = true;
          break;
        case 'session':
          await syncDrivingSession(task.payload.session as DrivingSession, task.payload.transmissionType as TransmissionType, true);
          success = true;
          break;
        case 'quiz':
          await syncQuizAttempt(task.payload.quizId as string, task.payload.score as number, true);
          success = true;
          break;
        case 'profile':
          await ensureProfileFromState(task.payload.state as AppState, true);
          success = true;
          break;
        case 'delete_session':
          await deleteDrivingSessionFromCloud(task.payload.sessionId as string);
          success = true;
          break;
        case 'clear_history':
          await clearDrivingHistoryFromCloud();
          success = true;
          break;
      }

      if (!success && task.retryCount < 5) {
        task.retryCount++;
        remainingTasks.push(task);
      }
    } catch (error) {
      console.warn(`[SyncQueue] Task failed: ${task.id}`, error);
      if (task.retryCount < 5) {
        task.retryCount++;
        remainingTasks.push(task);
      }
    }
  }

  await saveQueue(remainingTasks);
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
export async function ensureProfileFromState(state: AppState, isRetry: boolean = false) {
  if (profileSyncTimer && !isRetry) {
    clearTimeout(profileSyncTimer);
  }

  return new Promise<void>((resolve) => {
    const performSync = async () => {
      if (!isSupabaseConfigured || !supabase) {
        resolve();
        return;
      }
      
      const userId = await getCurrentUserId();
      if (!userId) {
        resolve();
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
        hourly_rate_45: state.userProgress.hourlyRate45,
        fixed_costs: state.userProgress.fixedCosts,
      });

      if (error) {
        console.error('[DB-Sync] FAILED to sync profile:', error.message);
        if (!isRetry) {
          await addToQueue('profile', { state });
        }
      } else {
        console.log('[DB-Sync] Profile sync successful!');
      }
      resolve();
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

export async function syncCompletedLesson(lessonId: string, isRetry = false) {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  
  if (!userId) {
    if (!isRetry) await addToQueue('lesson', { lessonId });
    return;
  }

  const { error } = await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    status: 'completed',
    completed_at: new Date().toISOString()
  }, { onConflict: 'user_id,lesson_id' });

  if (error && !isRetry) {
    await addToQueue('lesson', { lessonId });
  }
}

export async function syncDrivingSession(session: DrivingSession, transmissionType: TransmissionType, isRetry = false) {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();

  if (!userId) {
    if (!isRetry) await addToQueue('session', { session, transmissionType });
    return;
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

  if (error && !isRetry) {
    await addToQueue('session', { session, transmissionType });
  }
}

export async function syncQuizAttempt(quizId: string, score: number, isRetry = false) {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();

  if (!userId) {
    if (!isRetry) await addToQueue('quiz', { quizId, score });
    return;
  }

  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    quiz_id: quizId,
    score: score,
    completed_at: new Date().toISOString()
  });

  if (error && !isRetry) {
    await addToQueue('quiz', { quizId, score });
  }
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

  // 2. Fetch Subscription (fallback)
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (subError) {
    console.error('[DB-Sync] Subscription query error:', subError.message);
  }
  
  const hasActiveSubscription = subscription && (!subscription.expires_at || new Date(subscription.expires_at) > new Date());
  console.log('[DB-Sync] Subscription check:', { 
    found: !!subscription, 
    hasActive: !!hasActiveSubscription,
    expires_at: subscription?.expires_at 
  });

  const isPremium = !!(profile?.is_premium || hasActiveSubscription);
  console.log('[DB-Sync] FINAL isPremium status:', isPremium);

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
    hourlyRate45: Number(profile?.hourly_rate_45) || 60,
    fixedCosts: profile?.fixed_costs ?? {
      registration: 350,
      theoryExam: 25,
      practicalExam: 116,
      learningMaterial: 50,
      firstAid: 40,
      visionTest: 7,
    },
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

  // 3. Batch Sync Driving Sessions (Already optimized by external_id)
  if (state.userProgress.drivingSessions.length > 0) {
    const sessionData = state.userProgress.drivingSessions.map(s => ({
      id: s.id,
      user_id: userId,
      date: s.date,
      duration: s.duration,
      type: mapTrackerCategoryToDb(s.type),
      notes: s.notes,
      instructor_name: s.instructorName,
      route: s.route,
      mistakes: s.mistakes,
      total_distance: s.totalDistance,
      location_summary: s.locationSummary,
      transmission_type: mapTransmissionToDb(state.transmissionType)
    }));
    syncTasks.push(Promise.resolve(supabase.from('driving_sessions').upsert(sessionData)));
  }

  await Promise.allSettled(syncTasks);
  console.log('[DB-Sync] All data synchronized with cloud.');
}

export async function deleteDrivingSessionFromCloud(sessionId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) {
    await addToQueue('delete_session', { sessionId });
    return;
  }

  const { error } = await supabase.from('driving_sessions').delete().eq('id', sessionId).eq('user_id', userId);
  if (error) {
    await addToQueue('delete_session', { sessionId });
  }
}

export async function clearDrivingHistoryFromCloud() {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) {
    await addToQueue('clear_history', {});
    return;
  }

  const { error } = await supabase.from('driving_sessions').delete().eq('user_id', userId);
  if (error) {
    await addToQueue('clear_history', {});
  }
}

export async function resetAllDataFromCloud() {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  await Promise.allSettled([
    supabase.from('lesson_progress').delete().eq('user_id', userId),
    supabase.from('driving_sessions').delete().eq('user_id', userId),
    supabase.from('quiz_attempts').delete().eq('user_id', userId)
  ]);
}

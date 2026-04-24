/**
 * supabaseSync.ts
 * 
 * Middleware-style service for synchronizing local store data with Supabase.
 * Most functions check for an active user session before attempting sync.
 */

import type { AppState, DrivingSession, LearningPathType, TransmissionType } from '../types';
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
      }

      if (!success && task.retryCount < 5) {
        task.retryCount++;
        remainingTasks.push(task);
      }
    } catch (error) {
      console.warn(`[SyncQueue] Task ${task.id} failed:`, error);
      if (task.retryCount < 5) {
        task.retryCount++;
        remainingTasks.push(task);
      }
    }
  }

  await saveQueue(remainingTasks);
}

// Add online listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[SyncQueue] Back online! Processing queue...');
    processSyncQueue();
  });
}

/**
 * Retrieves the currently authenticated user's ID.
 */
async function getCurrentUserId() {
  if (!isSupabaseConfigured || !supabase) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

/**
 * Syncs the global application state (settings, progress, etc) to the profiles table.
 */
export async function ensureProfileFromState(state: AppState) {
  console.log('[DB-Sync] Starting profile sync...');
  if (!isSupabaseConfigured || !supabase) {
    console.log('[DB-Sync] Configuration missing or incomplete');
    return;
  }
  const userId = await getCurrentUserId();
  if (!userId) {
    console.log('[DB-Sync] No user ID found');
    return;
  }

  console.log('[DB-Sync] Syncing for user:', userId);

  const { error } = await supabase.from('profiles').upsert({
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
    // Profile sync is often high frequency, we might not want to queue EVERY change
    // but the final state should definitely be synced.
  } else {
    console.log('[DB-Sync] Profile sync successful!');
  }
}

export async function syncCompletedLesson(lessonId: string, isRetry = false) {
  if (!isSupabaseConfigured || !supabase) return;
  
  if (!navigator.onLine && !isRetry) {
    await addToQueue('lesson', { lessonId });
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    status: 'completed',
    completed_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,lesson_id'
  });

  if (error) {
    console.warn('[DriveDE] Failed to sync lesson progress', error.message);
    if (!isRetry) await addToQueue('lesson', { lessonId });
  }
}

export async function syncDrivingSession(session: DrivingSession, transmissionType: TransmissionType, isRetry = false) {
  if (!isSupabaseConfigured || !supabase) return;

  if (!navigator.onLine && !isRetry) {
    await addToQueue('session', { session, transmissionType });
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) return;

  // First Attempt: Full sync with enhanced fields using upsert on external_id
  const { error: fullError } = await supabase.from('driving_sessions').upsert({
    user_id: userId,
    external_id: session.id, // Store local timestamp ID
    session_date: session.date,
    duration_minutes: session.duration,
    category: mapTrackerCategoryToDb(session.type),
    transmission_type: mapTransmissionToDb(transmissionType),
    notes: session.notes,
    route: session.route,
    mistakes: session.mistakes,
    total_distance: session.totalDistance,
    location_summary: session.locationSummary,
    instructor_name: session.instructorName || null,
  }, { 
    onConflict: 'user_id,external_id' 
  });

  if (fullError) {
    console.warn('[DriveDE] Full sync failed, attempting basic fallback save...', fullError.message);
    
    // Check if it's a "column missing" type error
    if (fullError.code === '42703' || fullError.message.includes('column')) {
       // Second Attempt: Basic sync with original columns only
       const { error: basicError } = await supabase.from('driving_sessions').upsert({
         user_id: userId,
         external_id: session.id,
         session_date: session.date,
         duration_minutes: session.duration,
         category: mapTrackerCategoryToDb(session.type),
         transmission_type: mapTransmissionToDb(transmissionType),
         notes: session.notes,
       }, { 
         onConflict: 'user_id,external_id' 
       });

       if (basicError) {
         console.error('[DriveDE] CRITICAL: Both full and fallback sync failed.', basicError);
        } else {
          console.info('[DriveDE] Basic fallback sync completed successfully.');
        }
    } else {
      console.error('[DriveDE] Sync failed with a non-schema error:', fullError);
      if (!isRetry) await addToQueue('session', { session, transmissionType });
    }
  } else {
    console.log('[DriveDE] Full session synced successfully.');
  }
}

export async function deleteDrivingSessionFromCloud(sessionId: string) {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('driving_sessions')
    .delete()
    .eq('user_id', userId)
    .eq('id', sessionId);

  if (error) {
    console.warn('[DriveDE] Failed to delete driving session', error.message);
  }
}

export async function clearDrivingHistoryFromCloud() {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('driving_sessions')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('[DriveDE] Failed to clear cloud driving history:', error.message);
  } else {
    console.log('[DriveDE] Cloud driving history cleared successfully.');
  }
}

export async function resetAllDataFromCloud() {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const results = await Promise.all([
    supabase.from('driving_sessions').delete().eq('user_id', userId),
    supabase.from('lesson_progress').delete().eq('user_id', userId),
    supabase.from('quiz_attempts').delete().eq('user_id', userId),
  ]);

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.warn('[DriveDE] Reset cloud data had some errors:', errors);
  } else {
    console.log('[DriveDE] All cloud data reset successfully.');
  }
}

export async function syncQuizAttempt(quizId: string, score: number, isRetry = false) {
  if (!isSupabaseConfigured || !supabase) return;

  if (!navigator.onLine && !isRetry) {
    await addToQueue('quiz', { quizId, score });
    return;
  }

  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase.from('quiz_attempts').insert({
    user_id: userId,
    question_id: quizId,
    lesson_id: null,
    selected_option_id: `score:${score}`,
    is_correct: score >= 80,
  });

  if (error) {
    console.warn('[DriveDE] Failed to sync quiz attempt', error.message);
    if (!isRetry) await addToQueue('quiz', { quizId, score });
  }
}

export async function hydrateFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const [{ data: profile }, { data: lessons }, { data: sessions }, { data: quizAttempts }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('lesson_progress').select('*').eq('user_id', userId),
    supabase.from('driving_sessions').select('*').eq('user_id', userId),
    supabase.from('quiz_attempts').select('*').eq('user_id', userId),
  ]);

  return {
    profile: profile ?? null,
    lessons: lessons ?? [],
    sessions: (sessions ?? []).map(s => ({
      id: s.external_id,
      date: s.session_date,
      duration: s.duration_minutes,
      type: s.category === 'night' ? 'nacht' : s.category, // Map back to frontend enum
      notes: s.notes || '',
      instructorName: s.instructor_name || '',
      route: s.route || [],
      mistakes: s.mistakes || [],
      totalDistance: s.total_distance || 0,
      locationSummary: s.location_summary || ''
    })),
    quizAttempts: quizAttempts ?? [],
    incorrectQuestions: profile?.incorrect_questions ?? [],
    hourlyRate45: profile?.hourly_rate_45 ?? 60,
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
  
  // 3. Batch Sync Driving Sessions (Single Request)
  if (state.userProgress.drivingSessions.length > 0) {
    const sessionData = state.userProgress.drivingSessions.map(session => ({
      user_id: userId,
      external_id: session.id, // Store local timestamp ID
      session_date: session.date,
      duration_minutes: session.duration,
      category: mapTrackerCategoryToDb(session.type),
      transmission_type: mapTransmissionToDb(state.transmissionType),
      notes: session.notes,
      route: session.route,
      mistakes: session.mistakes,
      total_distance: session.totalDistance,
      location_summary: session.locationSummary,
      instructor_name: session.instructorName || null,
    }));
    
    syncTasks.push(Promise.resolve(supabase.from('driving_sessions').upsert(sessionData, { onConflict: 'user_id,external_id' })));
  }
  
  // Execute remaining syncs in parallel (max 2-3 requests total)
  const results = await Promise.all(syncTasks) as Array<{ error: { message: string } | null }>;
  const errors = results.filter(r => r.error).map(r => r.error?.message);
  
  if (errors.length > 0) {
    console.error('[DB-Sync] Batch sync encountered errors:', errors);
  } else {
    console.log('[DB-Sync] Batch sync complete!');
  }
}

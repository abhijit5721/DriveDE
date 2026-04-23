/**
 * supabaseSync.ts
 * 
 * Middleware-style service for synchronizing local store data with Supabase.
 * Most functions check for an active user session before attempting sync.
 */

import type { AppState, DrivingSession, LearningPathType, TransmissionType } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

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
  } else {
    console.log('[DB-Sync] Profile sync successful!');
  }
}

export async function syncCompletedLesson(lessonId: string) {
  if (!isSupabaseConfigured || !supabase) return;
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
  }
}

export async function syncDrivingSession(session: DrivingSession, transmissionType: TransmissionType) {
  if (!isSupabaseConfigured || !supabase) return;
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

export async function syncQuizAttempt(quizId: string, score: number) {
  if (!isSupabaseConfigured || !supabase) return;
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
      id: s.id,
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
  const userId = await getCurrentUserId();
  if (!userId) return;

  console.log('[DB-Sync] Starting ultra-optimized batch sync...');
  
  // 1. Sync Profile (Await this as it ensures the user exists in profiles)
  await ensureProfileFromState(state);
  
  const syncTasks: Promise<any>[] = [];

  // 2. Batch Sync Lessons (Single Request)
  if (state.userProgress.completedLessons.length > 0) {
    const lessonData = state.userProgress.completedLessons.map(id => ({
      user_id: userId,
      lesson_id: id,
      status: 'completed' as const,
      completed_at: new Date().toISOString()
    }));
    syncTasks.push(supabase.from('lesson_progress').upsert(lessonData, { onConflict: 'user_id,lesson_id' }));
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
    
    syncTasks.push(supabase.from('driving_sessions').upsert(sessionData, { onConflict: 'user_id,external_id' }));
  }
  
  // Execute remaining syncs in parallel (max 2-3 requests total)
  await Promise.all(syncTasks);
  console.log('[DB-Sync] Batch sync complete!');
}

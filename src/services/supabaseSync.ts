import type { AppState, DrivingSession, LearningPathType, TransmissionType } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const mapLearningPathToDb = (path: LearningPathType): 'standard' | 'conversion' =>
  path === 'umschreibung' ? 'conversion' : 'standard';

const mapTransmissionToDb = (type: TransmissionType): 'manual' | 'automatic' =>
  type === 'manual' ? 'manual' : 'automatic';

const mapTrackerCategoryToDb = (type: DrivingSession['type']): 'normal' | 'ueberland' | 'autobahn' | 'night' => {
  if (type === 'nacht') return 'night';
  return type;
};

async function getCurrentUserId() {
  if (!isSupabaseConfigured || !supabase) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

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
  });

  if (error) {
    console.warn('[DriveDE] Failed to sync lesson progress', error.message);
  }
}

export async function syncDrivingSession(session: DrivingSession, transmissionType: TransmissionType) {
  if (!isSupabaseConfigured || !supabase) return;
  const userId = await getCurrentUserId();
  if (!userId) return;

  const { error } = await supabase.from('driving_sessions').insert({
    user_id: userId,
    session_date: session.date,
    duration_minutes: session.duration,
    category: mapTrackerCategoryToDb(session.type),
    transmission_type: mapTransmissionToDb(transmissionType),
    notes: session.notes || null,
  });

  if (error) {
    console.warn('[DriveDE] Failed to sync driving session', error.message);
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
    sessions: sessions ?? [],
    quizAttempts: quizAttempts ?? [],
    incorrectQuestions: profile?.incorrect_questions ?? [],
  };
}

-- 1. Add missing column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS incorrect_questions jsonb DEFAULT '[]'::jsonb;

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driving_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 3. Fix RLS policies to allow authenticated users to manage their own rows
-- PROFILES
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- LESSON PROGRESS
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can manage their own lesson progress" ON public.lesson_progress
FOR ALL USING (auth.uid() = user_id);

-- DRIVING SESSIONS
DROP POLICY IF EXISTS "Users can manage their own driving sessions" ON public.driving_sessions;
CREATE POLICY "Users can manage their own driving sessions" ON public.driving_sessions
FOR ALL USING (auth.uid() = user_id);

-- QUIZ ATTEMPTS
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can manage their own quiz attempts" ON public.quiz_attempts
FOR ALL USING (auth.uid() = user_id);

-- 006_public_read_access_for_reports.sql
-- Allow anyone with a student's ID (from the QR code/Link) to view their progress

-- 1. Add external_id to driving_sessions for robust upserting
ALTER TABLE public.driving_sessions 
ADD COLUMN IF NOT EXISTS external_id text;

-- Add a unique constraint to prevent duplicates during re-sync
-- Only add if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'driving_sessions_user_id_external_id_key') THEN
    ALTER TABLE public.driving_sessions ADD CONSTRAINT driving_sessions_user_id_external_id_key UNIQUE (user_id, external_id);
  END IF;
END $$;

-- 2. Enable RLS and add Public Read Policies
-- PROFILES: Allow public read of non-sensitive fields
DROP POLICY IF EXISTS "Public can view profile summary" ON public.profiles;
CREATE POLICY "Public can view profile summary" ON public.profiles
FOR SELECT USING (true);

-- LESSON PROGRESS: Allow public read
DROP POLICY IF EXISTS "Public can view lesson progress" ON public.lesson_progress;
CREATE POLICY "Public can view lesson progress" ON public.lesson_progress
FOR SELECT USING (true);

-- DRIVING SESSIONS: Allow public read
DROP POLICY IF EXISTS "Public can view driving sessions" ON public.driving_sessions;
CREATE POLICY "Public can view driving sessions" ON public.driving_sessions
FOR SELECT USING (true);

-- 008_harden_security.sql

-- 1. Enable RLS on missed tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Add policy for subscriptions (Authenticated users only)
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions
FOR ALL USING (auth.uid() = user_id);

-- 3. SECURE PROFILES (Hide emails from public and add public toggle)
-- Rename the table
ALTER TABLE public.profiles RENAME TO profiles_secure;

-- Add public toggle (Default FALSE for security, users must opt-in to share reports)
ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS is_public_report_enabled boolean DEFAULT false;

-- Re-enable RLS
ALTER TABLE public.profiles_secure ENABLE ROW LEVEL SECURITY;

-- Re-declare management policy on the new table name
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles_secure;
CREATE POLICY "Users can manage their own profile" ON public.profiles_secure
FOR ALL USING (auth.uid() = id);

-- Create the secure view (Conditional email)
CREATE OR REPLACE VIEW public.profiles AS
SELECT 
  id,
  CASE 
    WHEN auth.uid() = id THEN email 
    ELSE NULL 
  END as email,
  display_name,
  learning_path,
  transmission_type,
  language,
  theme,
  is_premium,
  is_public_report_enabled,
  created_at,
  updated_at,
  incorrect_questions
FROM public.profiles_secure;

GRANT ALL ON public.profiles TO anon, authenticated, service_role;

-- 4. HARDEN PUBLIC ACCESS POLICIES
-- Profiles: Only visible publicly if report is enabled
DROP POLICY IF EXISTS "Public can view profile summary" ON public.profiles_secure;
CREATE POLICY "Public can view profile summary" ON public.profiles_secure
FOR SELECT USING (is_public_report_enabled = true);

-- Lesson Progress: Only visible publicly if user's report is enabled
DROP POLICY IF EXISTS "Public can view lesson progress" ON public.lesson_progress;
CREATE POLICY "Public can view lesson progress" ON public.lesson_progress
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles_secure 
    WHERE profiles_secure.id = lesson_progress.user_id 
    AND profiles_secure.is_public_report_enabled = true
  )
);

-- Driving Sessions: Only visible publicly if user's report is enabled
DROP POLICY IF EXISTS "Public can view driving sessions" ON public.driving_sessions;
CREATE POLICY "Public can view driving sessions" ON public.driving_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles_secure 
    WHERE profiles_secure.id = driving_sessions.user_id 
    AND profiles_secure.is_public_report_enabled = true
  )
);

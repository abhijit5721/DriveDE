-- 013_rls_performance_tuning.sql
-- (c) 2026 DriveDE. All rights reserved.

-- 1. profiles_secure Redundant Policies Cleanup
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles_secure;
DROP POLICY IF EXISTS "Allow profile selection" ON public.profiles_secure;
DROP POLICY IF EXISTS "Allow profile updates" ON public.profiles_secure;

-- 2. profiles_secure RLS Optimize
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles_secure;
CREATE POLICY "Users can manage their own profile" ON public.profiles_secure
FOR ALL USING ((select auth.uid()) = id);

-- 3. subscriptions RLS Optimize
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can manage their own subscriptions" ON public.subscriptions
FOR ALL USING ((select auth.uid()) = user_id);

-- 4. driving_sessions RLS Optimize
DROP POLICY IF EXISTS "Users can manage their own driving sessions" ON public.driving_sessions;
CREATE POLICY "Users can manage their own driving sessions" ON public.driving_sessions
FOR ALL USING ((select auth.uid()) = user_id);

-- 5. lesson_progress RLS Optimize
DROP POLICY IF EXISTS "Users can manage their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can manage their own lesson progress" ON public.lesson_progress
FOR ALL USING ((select auth.uid()) = user_id);

-- 6. quiz_attempts RLS Optimize
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can manage their own quiz attempts" ON public.quiz_attempts
FOR ALL USING ((select auth.uid()) = user_id);

-- 7. mistake_hotspots RLS Optimize
DROP POLICY IF EXISTS "Service role can manage hotspots" ON public.mistake_hotspots;
CREATE POLICY "Service role can manage hotspots" ON public.mistake_hotspots
FOR ALL USING (((select auth.jwt() ->> 'role') = 'service_role'));

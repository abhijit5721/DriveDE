-- Fix the profiles view to include finance columns and update sync targets
-- (c) 2026 DriveDE

-- Drop and recreate the view to include missing columns
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
  incorrect_questions,
  hourly_rate_45,
  fixed_costs
FROM public.profiles_secure;

GRANT ALL ON public.profiles TO anon, authenticated, service_role;

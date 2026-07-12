-- 014_onboarding_sync.sql
-- (c) 2026 DriveDE. All rights reserved.

-- 1. Add column to profiles_secure
ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean DEFAULT false;

-- 2. Update profiles view
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
  fixed_costs,
  has_completed_onboarding
FROM public.profiles_secure;

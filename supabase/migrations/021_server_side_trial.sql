-- 021: Make the free trial server-side (GRO / anti-abuse)
--
-- The 7-day trial lived only in the browser's IndexedDB, so clearing site data
-- or switching devices handed out an unlimited supply of fresh trials. The
-- trial always starts *after* signup, so it can be anchored to the account.
-- The earliest recorded start wins (see sync logic), making the trial
-- one-per-account instead of one-per-device.

ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;
ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE public.profiles_secure ADD COLUMN IF NOT EXISTS intended_plan text;

ALTER TABLE public.profiles_secure DROP CONSTRAINT IF EXISTS valid_intended_plan;
ALTER TABLE public.profiles_secure ADD CONSTRAINT valid_intended_plan
  CHECK (intended_plan IS NULL OR intended_plan IN ('30-days', '90-days', 'lifetime'));

-- Recreate the public view so clients can read their own trial state.
-- CREATE OR REPLACE VIEW can only APPEND columns — reordering or renaming an
-- existing one fails ("cannot change name of view column"). So this repeats
-- migration 014's column list verbatim and adds the trial columns at the end.
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
  has_completed_onboarding,
  trial_started_at,
  trial_ends_at,
  intended_plan
FROM public.profiles_secure;

GRANT ALL ON public.profiles TO anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends ON public.profiles_secure(trial_ends_at);

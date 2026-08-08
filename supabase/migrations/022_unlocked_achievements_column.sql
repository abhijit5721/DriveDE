-- 022: Bring unlocked_achievements under migration control
--
-- The column was added to production's profiles_secure out-of-band (no
-- migration), so the freshly-migrated staging database lacked it and every
-- profile sync failed with a 400. Also: no environment's `profiles` view
-- exposed the column, so achievements written by the sync were never read
-- back on hydration (they always fell back to device-local state).

ALTER TABLE public.profiles_secure
  ADD COLUMN IF NOT EXISTS unlocked_achievements text[] DEFAULT '{}';

-- Append to the view (CREATE OR REPLACE VIEW may only append columns; this
-- repeats migration 021's list verbatim and adds the new column at the end).
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
  intended_plan,
  unlocked_achievements
FROM public.profiles_secure;

GRANT ALL ON public.profiles TO anon, authenticated, service_role;

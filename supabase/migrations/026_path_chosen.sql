-- 026: Remember whether the learner actually chose a licence path
--
-- learning_path and transmission_type are NOT NULL with defaults ('standard',
-- 'automatic'), so every new profile row, including the one the signup trigger
-- creates for an anonymous account (DRI-60), already looks like a complete choice.
-- The app loaded those defaults on sign-in and skipped the licence selector.
-- path_chosen is set by the app only once licence, path and transmission are all
-- picked; hydration ignores the stored path while it is false.

ALTER TABLE public.profiles_secure
  ADD COLUMN IF NOT EXISTS path_chosen boolean NOT NULL DEFAULT false;

-- Accounts with an email came through the old flow and have used the app with the
-- path they have; keep it. Anonymous accounts (all from 22 Sep on) never chose.
UPDATE public.profiles_secure p
SET path_chosen = true
FROM auth.users u
WHERE u.id = p.id
  AND coalesce(u.is_anonymous, false) = false
  AND p.path_chosen = false;

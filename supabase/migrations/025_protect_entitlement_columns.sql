-- 025: Entitlement columns are server-owned (DRI-60 follow-up, anti-abuse)
--
-- Every signed-in client (email or anonymous) can UPDATE its own profiles row
-- through the public view, and the "manage own" policies never restricted
-- columns. So with the publishable key from the bundle and the user's own JWT,
-- a single REST call could set is_premium = true or push trial_ends_at years
-- ahead, and a self-inserted subscriptions row with status 'active' and no
-- expiry read as a lifetime licence. Since anonymous sign-in makes an account a
-- one-click affair, these columns are now written only by the server:
--
--   * is_premium          : never changed by a client JWT (Stripe webhook uses service_role)
--   * trial_started_at    : a client may set it once, not in the future; afterwards frozen
--   * trial_ends_at       : always derived, start + 7 days; the client's value is ignored
--   * subscriptions       : clients may read and (for account deletion) delete, never write
--
-- Service-role calls, SECURITY DEFINER triggers and pg_cron carry no client
-- role and pass through untouched.

CREATE OR REPLACE FUNCTION public.protect_entitlement_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_role text := coalesce(auth.jwt() ->> 'role', '');
BEGIN
  IF client_role NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_premium := false;
    IF NEW.trial_started_at IS NOT NULL THEN
      NEW.trial_started_at := least(NEW.trial_started_at, now());
      NEW.trial_ends_at := NEW.trial_started_at + interval '7 days';
    ELSE
      NEW.trial_ends_at := NULL;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE from a client
  NEW.is_premium := OLD.is_premium;

  IF OLD.trial_started_at IS NOT NULL THEN
    -- A trial is on record: it can neither restart nor move.
    NEW.trial_started_at := OLD.trial_started_at;
    NEW.trial_ends_at := OLD.trial_ends_at;
  ELSIF NEW.trial_started_at IS NOT NULL THEN
    -- First record of the trial: accept the start (never in the future), derive the end.
    NEW.trial_started_at := least(NEW.trial_started_at, now());
    NEW.trial_ends_at := NEW.trial_started_at + interval '7 days';
  ELSE
    NEW.trial_ends_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_entitlement_columns ON public.profiles_secure;
CREATE TRIGGER trg_protect_entitlement_columns
  BEFORE INSERT OR UPDATE ON public.profiles_secure
  FOR EACH ROW EXECUTE FUNCTION public.protect_entitlement_columns();

-- subscriptions: purchase history is written by the Stripe webhook only.
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can read their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read their own subscriptions" ON public.subscriptions
  FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
  FOR DELETE USING ((select auth.uid()) = user_id);

-- 020: Stop expired passes from granting Pro forever
--
-- The Stripe webhook sets profiles_secure.is_premium = true on purchase but
-- nothing ever set it back, so a 30-day pass behaved like a lifetime licence.
-- This function marks lapsed subscriptions 'expired' and clears is_premium for
-- users whose only entitlement came from a purchase that has now lapsed.
-- Called daily by /api/drip and run once here to repair existing data.

CREATE OR REPLACE FUNCTION public.expire_stale_subscriptions()
RETURNS TABLE (expired_subscriptions integer, downgraded_profiles integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subs_count integer;
  profiles_count integer;
BEGIN
  WITH lapsed AS (
    UPDATE public.subscriptions
    SET status = 'expired', updated_at = now()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < now()
    RETURNING 1
  )
  SELECT count(*)::integer INTO subs_count FROM lapsed;

  WITH downgraded AS (
    UPDATE public.profiles_secure p
    SET is_premium = false, updated_at = now()
    WHERE p.is_premium = true
      -- only users whose premium came from a purchase (protects manual grants)
      AND EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.user_id = p.id)
      AND NOT EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.user_id = p.id
          AND s.status = 'active'
          AND (s.expires_at IS NULL OR s.expires_at > now())
      )
    RETURNING 1
  )
  SELECT count(*)::integer INTO profiles_count FROM downgraded;

  RETURN QUERY SELECT subs_count, profiles_count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_subscriptions() FROM public, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires
  ON public.subscriptions(status, expires_at);

-- Repair pass over existing data
SELECT public.expire_stale_subscriptions();

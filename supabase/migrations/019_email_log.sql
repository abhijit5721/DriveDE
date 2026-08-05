-- 019: Email log for drip campaigns (GRO-8)
-- One row per (email, campaign) — the idempotency guard that guarantees a
-- given drip email is never sent twice. A row with campaign 'unsubscribed'
-- acts as a suppression entry: no further marketing email of any kind.

CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid primary key default gen_random_uuid(),
  email text NOT NULL,
  campaign text NOT NULL,
  sent_at timestamptz NOT NULL default now(),
  CONSTRAINT unique_email_campaign UNIQUE (email, campaign)
);

CREATE INDEX IF NOT EXISTS idx_email_log_email ON public.email_log(email);

-- RLS: server-side only (API routes use the direct postgres connection);
-- clients have no business reading or writing the send log.
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage email log" ON public.email_log;
CREATE POLICY "Service role can manage email log" ON public.email_log
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

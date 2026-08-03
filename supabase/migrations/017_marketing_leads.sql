-- 017: Marketing Leads for Landing Page Lead Capture (DRI-7)
-- Stores emails collected from the "Free German Driving Exam Checklist" lead magnet.

CREATE TABLE IF NOT EXISTS public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL default 'landing_lead_magnet',
  language text NOT NULL default 'en',
  created_at timestamptz NOT NULL default now(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_language CHECK (language IN ('en', 'de')),
  -- Prevent duplicate signups per source
  CONSTRAINT unique_email_per_source UNIQUE (email, source)
);

CREATE INDEX IF NOT EXISTS idx_marketing_leads_created ON public.marketing_leads(created_at DESC);

-- RLS: anonymous visitors may insert (lead capture form), but only the
-- service role can read/manage the list — leads must never leak to clients.
ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.marketing_leads;
CREATE POLICY "Anyone can submit a lead" ON public.marketing_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage leads" ON public.marketing_leads;
CREATE POLICY "Service role can manage leads" ON public.marketing_leads
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

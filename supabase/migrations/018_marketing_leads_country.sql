-- 018: Country-specific lead capture (DRI-7 follow-up)
-- Stores the ISO 3166-1 alpha-2 code of the country the lead's current
-- license is from, so the checklist email can be tier-specific (Anlage 11 FeV)
-- and leads can be segmented by origin country.
-- NULL = first-time license (no foreign license). 'XX' = unlisted country.

ALTER TABLE public.marketing_leads ADD COLUMN IF NOT EXISTS country text;

ALTER TABLE public.marketing_leads DROP CONSTRAINT IF EXISTS valid_country;
ALTER TABLE public.marketing_leads ADD CONSTRAINT valid_country
  CHECK (country IS NULL OR country ~ '^[A-Z]{2}$');

CREATE INDEX IF NOT EXISTS idx_marketing_leads_country ON public.marketing_leads(country);

-- 023: Close the direct-insert spam surface on marketing_leads
--
-- Migration 017 allowed anon INSERTs because the lead form originally wrote
-- to the table straight from the browser. The form now posts to /api/lead
-- (which connects server-side and enforces a 24h per-email send cooldown),
-- so the anonymous PostgREST write path is nothing but an open spam vector.

DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.marketing_leads;

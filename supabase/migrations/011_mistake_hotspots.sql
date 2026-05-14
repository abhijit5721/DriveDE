-- 011: Mistake Hotspots for Feature 13
-- Aggregates community mistake locations for Pro users

CREATE TABLE IF NOT EXISTS public.mistake_hotspots (
  id uuid primary key default gen_random_uuid(),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  mistake_type text NOT NULL,
  city text,
  total_incidents integer NOT NULL default 1,
  unique_drivers integer NOT NULL default 1,
  risk_score double precision NOT NULL default 0,
  last_updated timestamptz NOT NULL default now(),
  created_at timestamptz NOT NULL default now(),
  CONSTRAINT valid_lat CHECK (lat >= -90 AND lat <= 90),
  CONSTRAINT valid_lng CHECK (lng >= -180 AND lng <= 180),
  CONSTRAINT valid_risk CHECK (risk_score >= 0 AND risk_score <= 10)
);

CREATE INDEX IF NOT EXISTS idx_hotspots_location ON public.mistake_hotspots USING gist (
  geog::geometry
);
CREATE INDEX IF NOT EXISTS idx_hotspots_type ON public.mistake_hotspots(mistake_type);
CREATE INDEX IF NOT EXISTS idx_hotspots_city ON public.mistake_hotspots(city);
CREATE INDEX IF NOT EXISTS idx_hotspots_risk ON public.mistake_hotspots(risk_score DESC);

-- RLS: world-readable for authenticated users, writable only by service role
ALTER TABLE public.mistake_hotspots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read hotspots" ON public.mistake_hotspots;
CREATE POLICY "Anyone can read hotspots" ON public.mistake_hotspots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage hotspots" ON public.mistake_hotspots;
CREATE POLICY "Service role can manage hotspots" ON public.mistake_hotspots
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to auto-update last_updated
CREATE OR REPLACE FUNCTION public.set_hotspots_updated()
RETURNS trigger AS $$
BEGIN
  new.last_updated = now();
  new.created_at = COALESCE(new.created_at, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hotspots_updated ON public.mistake_hotspots;
CREATE TRIGGER trg_hotspots_updated
  BEFORE INSERT OR UPDATE ON public.mistake_hotspots
  FOR EACH ROW EXECUTE FUNCTION public.set_hotspots_updated();
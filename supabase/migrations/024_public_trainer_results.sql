-- 024: Anonymous results of the landing-page trainer (DRI-51)
--
-- One row per finished round of the public right-before-left trainer. Written
-- only by /api/trainer-result (server side, DATABASE_URL role) and read back as
-- aggregate percentiles ("faster than 61% of learners here"). No identifiers of
-- any kind: no user id, no IP, no user agent, no session key.

CREATE TABLE IF NOT EXISTS public.public_trainer_results (
  id           BIGSERIAL PRIMARY KEY,
  scenario_id  TEXT NOT NULL CHECK (char_length(scenario_id) <= 64),
  correct      BOOLEAN NOT NULL,
  wrong_taps   SMALLINT NOT NULL DEFAULT 0 CHECK (wrong_taps BETWEEN 0 AND 50),
  duration_ms  INTEGER NOT NULL CHECK (duration_ms BETWEEN 300 AND 600000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS public_trainer_results_scenario_duration_idx
  ON public.public_trainer_results (scenario_id, duration_ms);

-- No PostgREST access at all: the anon and authenticated roles get nothing,
-- the API talks to Postgres directly with the connection-string role.
ALTER TABLE public.public_trainer_results ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_trainer_results FROM anon, authenticated;

-- Per-IP write throttle for the endpoint (10 writes per minute). The key is a
-- salted, daily-rotating hash, so rows cannot be joined back to an address
-- later; rows older than an hour are purged opportunistically on write.
CREATE TABLE IF NOT EXISTS public.public_trainer_rate_limit (
  ip_hash       TEXT PRIMARY KEY,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT now(),
  hits          INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.public_trainer_rate_limit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.public_trainer_rate_limit FROM anon, authenticated;

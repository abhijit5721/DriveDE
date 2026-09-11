/**
 * (c) 2026 DriveDE. All rights reserved.
 *
 * POST /api/trainer-result (DRI-51)
 *
 * Stores one anonymous result of the landing-page trainer and answers with the
 * visitor's percentile among everyone who played the same scenario:
 * "Faster than 61% of learners here". The percentile is withheld until the
 * scenario has 200 rows, so early numbers are not noise dressed up as data.
 *
 * Body:    { scenarioId: string, cars: number, wrongTaps: number, durationMs: number }
 * Reply:   { ok: true, total: number, percentile: number | null }
 *
 * Abuse guard: 10 writes per minute per IP, keyed by a salted hash that
 * rotates daily. Nothing that identifies the visitor reaches the results table.
 */
import postgres from 'postgres';
import { createHash } from 'node:crypto';

const MIN_ROWS_FOR_PERCENTILE = 200;
const MAX_WRITES_PER_MINUTE = 10;
const SCENARIO_ID = /^[a-z0-9-]{1,64}$/;

function clientIp(req: any): string {
  const fwd = req.headers?.['x-forwarded-for'];
  const first = typeof fwd === 'string' ? fwd.split(',')[0].trim() : Array.isArray(fwd) ? fwd[0] : '';
  return first || (typeof req.headers?.['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : '') || req.socket?.remoteAddress || 'unknown';
}

function ipHash(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || process.env.DATABASE_URL || 'drivede';
  const day = new Date().toISOString().slice(0, 10);
  return createHash('sha256').update(`${salt}|${day}|${ip}`).digest('hex').slice(0, 32);
}

function asInt(value: unknown, min: number, max: number): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  return i < min || i > max ? null : i;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const scenarioId = typeof body.scenarioId === 'string' && SCENARIO_ID.test(body.scenarioId) ? body.scenarioId : null;
  const cars = asInt(body.cars, 1, 8);
  const wrongTaps = asInt(body.wrongTaps, 0, 50);
  const durationMs = asInt(body.durationMs, 300, 600000);
  if (!scenarioId || cars === null || wrongTaps === null || durationMs === null) {
    return res.status(400).json({ error: 'Invalid result' });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[TrainerResult] DATABASE_URL env var is not set.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const sql = postgres(connectionString, { max: 1, prepare: false });
  const hash = ipHash(clientIp(req));

  try {
    // Sliding one-minute window per hashed IP. The row is created or bumped
    // atomically, so parallel requests cannot slip past the limit together.
    const [limit] = await sql<{ hits: number }[]>`
      INSERT INTO public.public_trainer_rate_limit (ip_hash, window_start, hits)
      VALUES (${hash}, now(), 1)
      ON CONFLICT (ip_hash) DO UPDATE SET
        hits = CASE WHEN public_trainer_rate_limit.window_start < now() - interval '1 minute'
                    THEN 1 ELSE public_trainer_rate_limit.hits + 1 END,
        window_start = CASE WHEN public_trainer_rate_limit.window_start < now() - interval '1 minute'
                            THEN now() ELSE public_trainer_rate_limit.window_start END
      RETURNING hits
    `;
    if (limit.hits > MAX_WRITES_PER_MINUTE) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Too many results, try again in a minute' });
    }
    if (Math.random() < 0.05) {
      await sql`DELETE FROM public.public_trainer_rate_limit WHERE window_start < now() - interval '1 hour'`;
    }

    await sql`
      INSERT INTO public.public_trainer_results (scenario_id, correct, wrong_taps, duration_ms)
      VALUES (${scenarioId}, ${wrongTaps === 0}, ${wrongTaps}, ${durationMs})
    `;

    const [agg] = await sql<{ total: number; slower: number }[]>`
      SELECT count(*)::int AS total,
             count(*) FILTER (WHERE duration_ms > ${durationMs})::int AS slower
      FROM public.public_trainer_results
      WHERE scenario_id = ${scenarioId}
    `;
    const percentile = agg.total >= MIN_ROWS_FOR_PERCENTILE ? Math.round((agg.slower / agg.total) * 100) : null;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true, total: agg.total, percentile });
  } catch (error: any) {
    console.error('[TrainerResult] Failed:', error?.message || error);
    return res.status(500).json({ error: 'Could not store result' });
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}

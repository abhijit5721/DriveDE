/**
 * (c) 2026 DriveDE. All rights reserved.
 *
 * Shared abuse guards for the anonymous mail endpoints (api/lead.ts, api/contact.ts):
 * atomic per-IP hourly limiter on the existing public.public_trainer_rate_limit table
 * (hashed IP, RATE_LIMIT_SALT), body size cap, honeypot and email-domain check.
 *
 * The table is keyed by ip_hash only, so each endpoint gets its own counter through a
 * scope prefix in the key ('lead|...', 'contact|...'). No migration needed.
 */
import postgres from 'postgres';
import { createHash } from 'node:crypto';

export const MAX_BODY_BYTES = 4096;

export function clientIp(req: any): string {
  const fwd = req.headers?.['x-forwarded-for'];
  const first = typeof fwd === 'string' ? fwd.split(',')[0].trim() : Array.isArray(fwd) ? fwd[0] : '';
  return first || (typeof req.headers?.['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : '') || req.socket?.remoteAddress || 'unknown';
}

export function rateLimitKey(scope: string, ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || process.env.DATABASE_URL || 'drivede';
  const day = new Date().toISOString().slice(0, 10);
  return scope + '|' + createHash('sha256').update(`${salt}|${day}|${ip}`).digest('hex').slice(0, 26);
}

/** Counts this hit and reports whether the hashed IP is over `max` per hour for `scope`.
 *  Skipped (open) when DATABASE_URL is unset or the database is unreachable. */
export async function overLimit(scope: string, ip: string, max: number): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 5, prepare: false });
  try {
    const key = rateLimitKey(scope, ip);
    const rows = await sql`
      INSERT INTO public.public_trainer_rate_limit (ip_hash, window_start, hits)
      VALUES (${key}, now(), 1)
      ON CONFLICT (ip_hash) DO UPDATE SET
        hits = CASE WHEN public_trainer_rate_limit.window_start < now() - interval '1 hour'
                    THEN 1 ELSE public_trainer_rate_limit.hits + 1 END,
        window_start = CASE WHEN public_trainer_rate_limit.window_start < now() - interval '1 hour'
                            THEN now() ELSE public_trainer_rate_limit.window_start END
      RETURNING hits`;
    return Number(rows[0]?.hits ?? 0) > max;
  } catch {
    return false;
  } finally {
    await sql.end({ timeout: 2 }).catch(() => undefined);
  }
}

/** True when the request body is over 4 KB (declared length or parsed size). */
export function bodyTooLarge(req: any): boolean {
  const declared = Number(req.headers?.['content-length']);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return true;
  const body = req.body;
  if (body == null) return false;
  try {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    return Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES;
  } catch {
    return true;
  }
}

/** Hidden "website" field: humans leave it empty, bots fill it. */
export function honeypotFilled(body: any): boolean {
  const v = body?.website;
  return v != null && String(v).trim() !== '';
}

/** Email whose domain part has at least one dot with text on both sides. */
export function hasDottedDomain(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 1) return false;
  const domain = email.slice(at + 1);
  return /^[^.\s]+(\.[^.\s]+)+$/.test(domain);
}

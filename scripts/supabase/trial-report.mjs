#!/usr/bin/env node
/**
 * DRI-60 watch: how the anonymous trial is being used (read-only).
 *
 *   node scripts/supabase/trial-report.mjs [project-ref]   (default: production)
 *
 * Counts anonymous vs. secured accounts, trials running / expired, and how many
 * anonymous accounts expired without ever adding an email. Runs one SQL query
 * through the Management API with the CLI login token (~/.supabase/access-token
 * or SUPABASE_ACCESS_TOKEN). Decision rule agreed 22 Sep: stay with the plain
 * 7-day anonymous trial (option A) unless expired-without-email accounts pile
 * up week over week, then switch to the two-stage trial (option B).
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ref = process.argv[2] || 'zgmhkvpctiineanjmvga';
let token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) { try { token = readFileSync(join(homedir(), '.supabase', 'access-token'), 'utf8').trim(); } catch { /* none */ } }
if (!token) { console.error('no Supabase access token found'); process.exit(2); }

const sql = `
with acc as (
  select u.id, u.is_anonymous, u.created_at, u.last_sign_in_at,
         p.trial_started_at, p.trial_ends_at, p.is_premium
  from auth.users u
  left join public.profiles_secure p on p.id = u.id
)
select
  count(*)                                                          as accounts_total,
  count(*) filter (where is_anonymous)                              as anonymous_now,
  count(*) filter (where not is_anonymous)                          as with_email,
  count(*) filter (where created_at > now() - interval '7 days')    as created_last_7d,
  count(*) filter (where is_anonymous and created_at > now() - interval '7 days') as anonymous_last_7d,
  count(*) filter (where trial_ends_at > now())                     as trials_running,
  count(*) filter (where trial_ends_at <= now())                    as trials_expired,
  count(*) filter (where is_anonymous and trial_ends_at <= now())   as expired_without_email,
  count(*) filter (where is_anonymous and last_sign_in_at < now() - interval '30 days') as anonymous_idle_30d,
  count(*) filter (where is_premium)                                as premium
from acc;`;

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
});
if (!res.ok) { console.error(`query ${res.status}: ${await res.text()}`); process.exit(1); }
const [row] = await res.json();
console.log(`trial report ${new Date().toISOString().slice(0, 10)} (${ref})`);
for (const [k, v] of Object.entries(row)) console.log(`  ${k.padEnd(24)} ${v}`);

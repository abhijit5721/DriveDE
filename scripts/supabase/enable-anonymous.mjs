#!/usr/bin/env node
/**
 * DRI-60: switch anonymous sign-ins and manual identity linking on for one
 * Supabase project, through the Management API. Changes only these two flags.
 *
 *   node scripts/supabase/enable-anonymous.mjs <project-ref> [--token <pat>] [--check]
 *
 * Token lookup order: --token, SUPABASE_ACCESS_TOKEN, ~/.supabase/access-token
 * (the CLI login). Staging lives in a different Supabase account than the CLI
 * login, so for it pass a personal access token from that account.
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const ref = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--token'));
const tokenArg = args.includes('--token') ? args[args.indexOf('--token') + 1] : undefined;
const checkOnly = args.includes('--check');
if (!ref) { console.error('usage: enable-anonymous.mjs <project-ref> [--token <pat>] [--check]'); process.exit(2); }

let token = tokenArg || process.env.SUPABASE_ACCESS_TOKEN;
if (!token) { try { token = readFileSync(join(homedir(), '.supabase', 'access-token'), 'utf8').trim(); } catch { /* none */ } }
if (!token) { console.error('no Supabase access token found'); process.exit(2); }

const url = `https://api.supabase.com/v1/projects/${ref}/config/auth`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const pick = (c) => ({ external_anonymous_users_enabled: c.external_anonymous_users_enabled, security_manual_linking_enabled: c.security_manual_linking_enabled });

const before = await fetch(url, { headers });
if (!before.ok) { console.error(`GET ${before.status}: ${await before.text()}`); process.exit(1); }
console.log('before', pick(await before.json()));
if (checkOnly) process.exit(0);

const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify({ external_anonymous_users_enabled: true, security_manual_linking_enabled: true }) });
if (!res.ok) { console.error(`PATCH ${res.status}: ${await res.text()}`); process.exit(1); }
const after = await fetch(url, { headers });
console.log('after ', pick(await after.json()));

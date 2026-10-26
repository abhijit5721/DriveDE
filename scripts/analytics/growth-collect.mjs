// Collects the web side of the DriveDE Growth Board: Vercel Web Analytics (7 and 28 days,
// referrers, top pages), the PostHog weekly funnel (production only, via the logged-in 9222
// Chrome), the Supabase trial report and Search Console totals (same Chrome), plus daily rows and
// 7 / 14 / 30 day ranges (with the period before) for the board's date filter. Writes JSON files
// to ~/.claude/dashboards/growth/. Social posts and the schedule come from Metricool and are
// written by Claude from the MCP answers. Usage: node scripts/analytics/growth-collect.mjs
import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const OUT = path.join(os.homedir(), '.claude', 'dashboards', 'growth');
mkdirSync(OUT, { recursive: true });
const now = new Date();
const iso = (d) => d.toISOString();
const dayAgo = (n) => { const d = new Date(now.getTime() - n * 864e5); d.setUTCHours(0, 0, 0, 0); return d; };

// Vercel
const P = 'prj_Ung8mpRsv7AWAXsRECj62erXtoOu', T = 'team_6TSdiy5nuL2LngvlEY6YKvus';
const vapi = (p) => { const out = execSync(`npx vercel api "/web-analytics/v2/${p}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); return JSON.parse(out.slice(out.indexOf('{'))); };
const q = (days, extra = '') => `projectId=${P}&teamId=${T}&environment=production&filter=%7B%7D&tz=Europe%2FBerlin&from=${iso(dayAgo(days))}&to=${iso(now)}${extra}`;
const web = [];
for (const days of [7, 28]) {
  const o = vapi(`overview?${q(days)}`);
  web.push({ window: `${days}d`, page_views: o.total, visitors: o.devices });
}
const refs = (vapi(`stats?${q(28, '&type=referrer&limit=12')}`).data || []).map((r) => ({ referrer: r.key || r.name || '(direct)', visitors_28d: r.devices, views_28d: r.total }));
const paths = (vapi(`stats?${q(28, '&type=path&limit=15')}`).data || []).map((r) => ({ path: r.key || r.name, visitors_28d: r.devices, views_28d: r.total }));
writeFileSync(path.join(OUT, 'web.json'), JSON.stringify(web));
writeFileSync(path.join(OUT, 'referrers.json'), JSON.stringify(refs));
writeFileSync(path.join(OUT, 'pages.json'), JSON.stringify(paths));
console.log('vercel', JSON.stringify(web));

// Per-range numbers for the board's 7 / 14 / 30 day filter, each with the period before it.
// Vercel refuses spans over 31 days on the Hobby plan, so there is no exact 90-day visitor count.
const RANGES = [7, 14, 30];
const day = (d) => d.toISOString().slice(0, 10);
const span = (from, to, extra = '') => `projectId=${P}&teamId=${T}&environment=production&filter=%7B%7D&tz=Europe%2FBerlin&from=${iso(from)}&to=${iso(to)}${extra}`;
const tryV = (p) => { try { return vapi(p); } catch { return null; } };
const webRanges = [], refRanges = [], pageRanges = [];
for (const n of RANGES) {
  const cur = vapi(`overview?${span(dayAgo(n), now)}`), prev = tryV(`overview?${span(dayAgo(2 * n), dayAgo(n))}`);
  webRanges.push({ range: `${n}d`, start: day(dayAgo(n)), end: day(now), visitors: cur.devices, page_views: cur.total, prev_visitors: prev ? prev.devices : null, prev_page_views: prev ? prev.total : null });
  for (const r of vapi(`stats?${span(dayAgo(n), now, '&type=referrer&limit=12')}`).data || []) refRanges.push({ range: `${n}d`, referrer: r.key || '(direct)', visitors: r.devices, views: r.total });
  for (const r of vapi(`stats?${span(dayAgo(n), now, '&type=path&limit=15')}`).data || []) pageRanges.push({ range: `${n}d`, path: r.key, visitors: r.devices, views: r.total });
}
writeFileSync(path.join(OUT, 'web_ranges.json'), JSON.stringify(webRanges));
writeFileSync(path.join(OUT, 'referrer_ranges.json'), JSON.stringify(refRanges));
writeFileSync(path.join(OUT, 'page_ranges.json'), JSON.stringify(pageRanges));
// Daily visitors: the Hobby plan answers at most 31 days per timeseries call, so 90 days come in
// three calls; days already in the previous file are kept, so the history grows.
let webDaily = [];
try { webDaily = JSON.parse(readFileSync(path.join(OUT, 'web_daily.json'), 'utf8')); } catch { /* first run */ }
const byDay = new Map(webDaily.map((r) => [r.day, r]));
for (const k of [60, 30, 0]) {
  for (const r of vapi(`timeseries?${span(dayAgo(k + 30), k ? dayAgo(k) : now)}`).data?.groups?.all || []) byDay.set(r.key, { day: r.key, visitors: r.devices, page_views: r.total });
}
writeFileSync(path.join(OUT, 'web_daily.json'), JSON.stringify([...byDay.values()].sort((a, b) => a.day.localeCompare(b.day))));
console.log('vercel ranges', JSON.stringify(webRanges.map((r) => [r.range, r.visitors, r.prev_visitors])), 'days', byDay.size);

// Supabase trial report (parse the script's key/value lines)
const tr = execSync('node scripts/supabase/trial-report.mjs', { encoding: 'utf8', cwd: path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..', '..') });
const accounts = {};
for (const m of tr.matchAll(/^\s+(\w+)\s+(\d+)$/gm)) accounts[m[1]] = Number(m[2]);
accounts.snapshot = iso(now).slice(0, 10);
writeFileSync(path.join(OUT, 'accounts.json'), JSON.stringify([accounts]));
console.log('accounts', JSON.stringify(accounts));

// New accounts per day and per range, same own_traffic rule as the trial report
let sbToken = process.env.SUPABASE_ACCESS_TOKEN;
if (!sbToken) sbToken = readFileSync(path.join(os.homedir(), '.supabase', 'access-token'), 'utf8').trim();
const sbq = async (sql) => { const r = await fetch('https://api.supabase.com/v1/projects/zgmhkvpctiineanjmvga/database/query', { method: 'POST', headers: { Authorization: `Bearer ${sbToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sql }) }); if (!r.ok) throw new Error(`supabase ${r.status}: ${await r.text()}`); return r.json(); };
const REAL = `coalesce(raw_user_meta_data->>'own_traffic', '') <> 'true'`;
const signupsDaily = await sbq(`select to_char(created_at at time zone 'Europe/Berlin', 'YYYY-MM-DD') as day, count(*)::int as accounts, (count(*) filter (where not is_anonymous))::int as with_email from auth.users where ${REAL} and created_at > now() - interval '90 days' group by 1 order by 1`);
writeFileSync(path.join(OUT, 'signups_daily.json'), JSON.stringify(signupsDaily));
const signupRanges = await sbq(RANGES.map((n) => `select '${n}d' as range, (count(*) filter (where created_at >= '${iso(dayAgo(n))}'))::int as accounts, (count(*) filter (where created_at >= '${iso(dayAgo(2 * n))}' and created_at < '${iso(dayAgo(n))}'))::int as prev_accounts, (count(*) filter (where created_at >= '${iso(dayAgo(n))}' and not is_anonymous))::int as with_email, (count(*) filter (where created_at >= '${iso(dayAgo(2 * n))}' and created_at < '${iso(dayAgo(n))}' and not is_anonymous))::int as prev_with_email from auth.users where ${REAL}`).join(' union all '));
writeFileSync(path.join(OUT, 'signup_ranges.json'), JSON.stringify(signupRanges));
console.log('signups', JSON.stringify(signupRanges));

// PostHog weekly funnel + Search Console, through the 9222 Chrome
// Raw CDP on one tab: Playwright's connectOverCDP hangs on Chrome's omnibox browser_ui targets
const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
const tab = targets.find((t) => t.type === 'page' && t.url.startsWith('https://eu.posthog.com/'))
  || await (await fetch('http://127.0.0.1:9222/json/new?https://eu.posthog.com/project/238369/home', { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = no; });
let seq = 0; const waiting = new Map();
ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (waiting.has(msg.id)) { waiting.get(msg.id)(msg); waiting.delete(msg.id); } };
const cdp = (method, params = {}) => new Promise((ok) => { const id = ++seq; waiting.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });
const page = {
  goto: (url) => cdp('Page.navigate', { url }),
  waitForTimeout: (ms) => new Promise((r) => setTimeout(r, ms)),
  evaluate: async (fn, arg) => { const r = await cdp('Runtime.evaluate', { expression: `(${fn})(${JSON.stringify(arg ?? null)})`, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'evaluate failed'); return r.result.result.value; },
  close: async () => ws.close(),
};
await page.goto('https://eu.posthog.com/project/238369/home');
await page.waitForTimeout(6000);
const csrf = ((await cdp('Network.getCookies', { urls: ['https://eu.posthog.com'] })).result.cookies.find((c) => c.name === 'posthog_csrftoken') || {}).value || '';
const hogql = (query) => page.evaluate(async ([q, csrf]) => { const r = await fetch('/api/projects/238369/query/', { method: 'POST', headers: { 'X-CSRFToken': csrf, 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ query: { kind: 'HogQLQuery', query: q } }) }); const j = await r.json(); return r.ok ? j : { error: j }; }, [query, csrf]);
const PROD = `properties.$current_url like 'https://www.drivede.app%'`;
const fw = await hogql(`select toStartOfWeek(timestamp) as week, uniq(person_id) as visitors, uniqIf(person_id, event='try_click') as tried_trainer, uniqIf(person_id, event='trainer_complete') as finished_trainer, uniqIf(person_id, event='anonymous_start') as opened_app, uniqIf(person_id, event='signup_prompt_shown') as saw_prompt, uniqIf(person_id, event='signup_started') as signup_started, uniqIf(person_id, event='email_added') as email_added from events where ${PROD} and timestamp > now() - interval 12 week group by week order by week`);
const funnel = (fw.results || []).map((r) => ({ week: String(r[0]).slice(0, 10), visitors: r[1], tried_trainer: r[2], finished_trainer: r[3], opened_app: r[4], saw_prompt: r[5], signup_started: r[6], email_added: r[7] }));
writeFileSync(path.join(OUT, 'funnel_weekly.json'), JSON.stringify(funnel));
console.log('funnel weeks', funnel.length);
const ai = await hogql(`select toStartOfWeek(timestamp) as week, uniqIf(person_id, properties.utm_source = 'chatgpt.com' or properties.$referring_domain ilike '%chatgpt%') as chatgpt, uniqIf(person_id, properties.$referring_domain ilike '%google%') as google, uniqIf(person_id, properties.$referring_domain ilike '%facebook%') as facebook, uniqIf(person_id, properties.$referring_domain ilike '%reddit%') as reddit from events where ${PROD} and event = '$pageview' and timestamp > now() - interval 12 week group by week order by week`);
writeFileSync(path.join(OUT, 'sources_weekly.json'), JSON.stringify((ai.results || []).map((r) => ({ week: String(r[0]).slice(0, 10), chatgpt: r[1], google: r[2], facebook: r[3], reddit: r[4] }))));
// Funnel per range (exact unique people, not a sum of days) and the period before it
const STEPS = [['visitors', 'true'], ['tried_trainer', "event='try_click'"], ['finished_trainer', "event='trainer_complete'"], ['opened_app', "event='anonymous_start'"], ['saw_prompt', "event='signup_prompt_shown'"], ['signup_started', "event='signup_started'"], ['email_added', "event='email_added'"]];
const ts = (d) => `toDateTime('${iso(d).slice(0, 19).replace('T', ' ')}', 'UTC')`;
const funnelRanges = [];
for (const n of RANGES) {
  const cols = STEPS.flatMap(([k, c]) => [`uniqIf(person_id, ${c} and timestamp >= ${ts(dayAgo(n))}) as ${k}`, `uniqIf(person_id, ${c} and timestamp < ${ts(dayAgo(n))}) as prev_${k}`]);
  const res = await hogql(`select ${cols.join(', ')} from events where ${PROD} and timestamp >= ${ts(dayAgo(2 * n))}`);
  if (!res.results) throw new Error(`posthog funnel ${n}d: ${JSON.stringify(res.error).slice(0, 300)}`);
  const row = { range: `${n}d` }; res.columns.forEach((c, i) => { row[c] = res.results[0][i]; }); funnelRanges.push(row);
}
writeFileSync(path.join(OUT, 'funnel_ranges.json'), JSON.stringify(funnelRanges));
const sd = await hogql(`select toDate(timestamp) as day, uniqIf(person_id, properties.utm_source = 'chatgpt.com' or properties.$referring_domain ilike '%chatgpt%') as chatgpt, uniqIf(person_id, properties.$referring_domain ilike '%google%') as google, uniqIf(person_id, properties.$referring_domain ilike '%facebook%') as facebook, uniqIf(person_id, properties.$referring_domain ilike '%reddit%') as reddit, uniqIf(person_id, properties.$referring_domain ilike '%instagram%') as instagram from events where ${PROD} and event = '$pageview' and timestamp > now() - interval 91 day group by day order by day`);
writeFileSync(path.join(OUT, 'sources_daily.json'), JSON.stringify((sd.results || []).map((r) => ({ day: String(r[0]).slice(0, 10), chatgpt: r[1], google: r[2], facebook: r[3], reddit: r[4], instagram: r[5] }))));
console.log('funnel ranges', JSON.stringify(funnelRanges.map((r) => [r.range, r.visitors, r.prev_visitors])), 'source days', (sd.results || []).length);

// Search Console: 28-day totals and top queries
await page.goto('https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.drivede.app%2F&num_of_days=28');
await page.waitForTimeout(9000);
const t = await page.evaluate(() => document.body.innerText);
const num = (label) => { const m = t.match(new RegExp(label + '\\s*\\n\\s*([\\d.,]+k?)')); if (!m) return null; const v = m[1].replace(',', ''); return v.endsWith('k') ? Math.round(parseFloat(v) * 1000) : Number(v); };
const search = [{ window: '28d', clicks: num('Total clicks'), impressions: num('Total impressions'), ctr: (t.match(/Average CTR\s*\n\s*([\d.]+)%/) || [])[1], position: (t.match(/Average position\s*\n\s*([\d.]+)/) || [])[1], snapshot: iso(now).slice(0, 10) }];
const qs = []; const qi = t.indexOf('Top queries'); const block = t.slice(qi, qi + 2000).split('\n').map((s) => s.trim()).filter(Boolean);
for (let i = 0; i < block.length - 2; i++) { if (/^\d+$/.test(block[i + 1]) && /^\d+$/.test(block[i + 2]) && !/^\d+$/.test(block[i]) && !/Top queries|Clicks|Impressions/.test(block[i])) { qs.push({ query: block[i], clicks: Number(block[i + 1]), impressions: Number(block[i + 2]) }); i += 2; } }
writeFileSync(path.join(OUT, 'search.json'), JSON.stringify(search));
writeFileSync(path.join(OUT, 'queries.json'), JSON.stringify(qs.slice(0, 10)));
console.log('search', JSON.stringify(search[0]), 'queries', qs.length);
await page.goto('https://eu.posthog.com/project/238369/home');
await page.close();

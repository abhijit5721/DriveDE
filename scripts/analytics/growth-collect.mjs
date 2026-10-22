// Collects the web side of the DriveDE Growth Board: Vercel Web Analytics (7 and 28 days,
// referrers, top pages), the PostHog weekly funnel (production only, via the logged-in 9222
// Chrome), the Supabase trial report and Search Console totals (same Chrome). Writes JSON files
// to ~/.claude/dashboards/growth/. Social posts and the schedule come from Metricool and are
// written by Claude from the MCP answers. Usage: node scripts/analytics/growth-collect.mjs
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';

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

// Supabase trial report (parse the script's key/value lines)
const tr = execSync('node scripts/supabase/trial-report.mjs', { encoding: 'utf8', cwd: path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..', '..') });
const accounts = {};
for (const m of tr.matchAll(/^\s+(\w+)\s+(\d+)$/gm)) accounts[m[1]] = Number(m[2]);
accounts.snapshot = iso(now).slice(0, 10);
writeFileSync(path.join(OUT, 'accounts.json'), JSON.stringify([accounts]));
console.log('accounts', JSON.stringify(accounts));

// PostHog weekly funnel + Search Console, through the 9222 Chrome
const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 30000 });
const ctx = b.contexts()[0]; const page = await ctx.newPage();
await page.setViewportSize({ width: 1400, height: 900 });
await page.goto('https://eu.posthog.com/project/238369/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
const csrf = (await ctx.cookies('https://eu.posthog.com')).find((c) => c.name === 'posthog_csrftoken')?.value || '';
const hogql = (query) => page.evaluate(async ([q, csrf]) => { const r = await fetch('/api/projects/238369/query/', { method: 'POST', headers: { 'X-CSRFToken': csrf, 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ query: { kind: 'HogQLQuery', query: q } }) }); const j = await r.json(); return r.ok ? j : { error: j }; }, [query, csrf]);
const PROD = `properties.$current_url like 'https://www.drivede.app%'`;
const fw = await hogql(`select toStartOfWeek(timestamp) as week, uniq(person_id) as visitors, uniqIf(person_id, event='try_click') as tried_trainer, uniqIf(person_id, event='trainer_complete') as finished_trainer, uniqIf(person_id, event='anonymous_start') as opened_app, uniqIf(person_id, event='signup_prompt_shown') as saw_prompt, uniqIf(person_id, event='signup_started') as signup_started, uniqIf(person_id, event='email_added') as email_added from events where ${PROD} and timestamp > now() - interval 12 week group by week order by week`);
const funnel = (fw.results || []).map((r) => ({ week: String(r[0]).slice(0, 10), visitors: r[1], tried_trainer: r[2], finished_trainer: r[3], opened_app: r[4], saw_prompt: r[5], signup_started: r[6], email_added: r[7] }));
writeFileSync(path.join(OUT, 'funnel_weekly.json'), JSON.stringify(funnel));
console.log('funnel weeks', funnel.length);
const ai = await hogql(`select toStartOfWeek(timestamp) as week, uniqIf(person_id, properties.utm_source = 'chatgpt.com' or properties.$referring_domain ilike '%chatgpt%') as chatgpt, uniqIf(person_id, properties.$referring_domain ilike '%google%') as google, uniqIf(person_id, properties.$referring_domain ilike '%facebook%') as facebook, uniqIf(person_id, properties.$referring_domain ilike '%reddit%') as reddit from events where ${PROD} and event = '$pageview' and timestamp > now() - interval 12 week group by week order by week`);
writeFileSync(path.join(OUT, 'sources_weekly.json'), JSON.stringify((ai.results || []).map((r) => ({ week: String(r[0]).slice(0, 10), chatgpt: r[1], google: r[2], facebook: r[3], reddit: r[4] }))));

// Search Console: 28-day totals and top queries
await page.goto('https://search.google.com/search-console/performance/search-analytics?resource_id=https%3A%2F%2Fwww.drivede.app%2F&num_of_days=28', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(9000);
const t = await page.evaluate(() => document.body.innerText);
const num = (label) => { const m = t.match(new RegExp(label + '\\s*\\n\\s*([\\d.,]+k?)')); if (!m) return null; const v = m[1].replace(',', ''); return v.endsWith('k') ? Math.round(parseFloat(v) * 1000) : Number(v); };
const search = [{ window: '28d', clicks: num('Total clicks'), impressions: num('Total impressions'), ctr: (t.match(/Average CTR\s*\n\s*([\d.]+)%/) || [])[1], position: (t.match(/Average position\s*\n\s*([\d.]+)/) || [])[1], snapshot: iso(now).slice(0, 10) }];
const qs = []; const qi = t.indexOf('Top queries'); const block = t.slice(qi, qi + 2000).split('\n').map((s) => s.trim()).filter(Boolean);
for (let i = 0; i < block.length - 2; i++) { if (/^\d+$/.test(block[i + 1]) && /^\d+$/.test(block[i + 2]) && !/^\d+$/.test(block[i]) && !/Top queries|Clicks|Impressions/.test(block[i])) { qs.push({ query: block[i], clicks: Number(block[i + 1]), impressions: Number(block[i + 2]) }); i += 2; } }
writeFileSync(path.join(OUT, 'search.json'), JSON.stringify(search));
writeFileSync(path.join(OUT, 'queries.json'), JSON.stringify(qs.slice(0, 10)));
console.log('search', JSON.stringify(search[0]), 'queries', qs.length);
await page.close(); await b.close();

// PostHog (EU, project 238369) through the logged-in session of the port 9222 Chrome.
// HogQL is sent with fetch from inside the PostHog page so the cookie, CSRF token and
// Referer are all right (page.request from Playwright fails the CSRF referer check).
// Only production events (www.drivede.app) are counted: PostHog also records every
// Vercel preview URL, which is mostly our own testing.
// Usage: node scripts/analytics/posthog-overview.mjs [--days 28]
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const DAYS = Number(argv[argv.indexOf('--days') + 1] || 28);
const PROJECT = 238369;
const PROD = `properties.$current_url like 'https://www.drivede.app%'`;
const WIN = `timestamp > now() - interval ${DAYS} day`;

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 20000 });
const ctx = b.contexts()[0];
const page = ctx.pages()[0] || (await ctx.newPage());
await page.goto(`https://eu.posthog.com/project/${PROJECT}/home`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
if (page.url().includes('/login')) { console.log('PostHog session expired: log in once in the port 9222 Chrome.'); await b.close(); process.exit(1); }
const csrf = (await ctx.cookies('https://eu.posthog.com')).find((c) => c.name === 'posthog_csrftoken')?.value || '';

const hogql = async (name, query) => {
  const j = await page.evaluate(async ([q, csrf, project]) => {
    const r = await fetch(`/api/projects/${project}/query/`, { method: 'POST', headers: { 'X-CSRFToken': csrf, 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ query: { kind: 'HogQLQuery', query: q } }) });
    return { ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) };
  }, [query, csrf, PROJECT]);
  console.log(`\n== ${name}`);
  if (!j.ok) { console.log('error', j.status, JSON.stringify(j.body).slice(0, 200)); return; }
  console.log('  ' + (j.body.columns || []).join(' | '));
  for (const row of (j.body.results || []).slice(0, 30)) console.log('  ' + row.map((v) => String(v).slice(0, 70)).join(' | '));
};

console.log(`PostHog, production only, last ${DAYS} days`);
await hogql('visitors and funnel (persons)', `select uniq(person_id) as visitors, uniqIf(person_id, event='try_click') as tried_trainer, uniqIf(person_id, event='trainer_complete') as finished_trainer, uniqIf(person_id, event='anonymous_start') as opened_app, uniqIf(person_id, event='signup_prompt_shown') as saw_account_prompt, uniqIf(person_id, event='signup_started') as signup_started, uniqIf(person_id, event='email_added') as email_added, uniqIf(person_id, event='google_completed') as google_done from events where ${PROD} and ${WIN}`);
await hogql('custom events', `select event, count() as n, uniq(person_id) as persons from events where ${PROD} and ${WIN} and event not like '$%' group by event order by persons desc`);
await hogql('referrers', `select coalesce(nullIf(properties.$referring_domain, ''), '(direct)') as ref, uniq(person_id) as persons from events where event = '$pageview' and ${PROD} and ${WIN} group by ref order by persons desc limit 12`);
await hogql('utm', `select properties.utm_source as src, properties.utm_medium as med, properties.utm_campaign as camp, uniq(person_id) as persons from events where ${PROD} and ${WIN} and properties.utm_source is not null group by src, med, camp order by persons desc limit 12`);
await hogql('device and browser', `select properties.$device_type as device, properties.$browser as browser, uniq(person_id) as persons from events where event='$pageview' and ${PROD} and ${WIN} group by device, browser order by persons desc limit 8`);
await hogql('rage clicks', `select properties.$el_text as element, count() as n from events where event = '$rageclick' and ${PROD} and ${WIN} group by element order by n desc limit 8`);
await hogql('per week', `select toStartOfWeek(timestamp) as week, uniq(person_id) as visitors, uniqIf(person_id, event='anonymous_start') as opened_app from events where ${PROD} and timestamp > now() - interval 10 week group by week order by week`);
await b.close();

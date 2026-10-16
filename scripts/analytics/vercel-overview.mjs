// Vercel Web Analytics for drivede.app through the Vercel CLI's API passthrough
// (`npx vercel api`), which carries the CLI login. The internal web-analytics endpoints
// accept it, so no dashboard browser session is needed (the old version drove the port
// 9222 Chrome and died whenever that session was logged out).
// Prints visitors, page views, top paths, referrers, countries, funnel events, devices.
// Usage: node scripts/analytics/vercel-overview.mjs [--days 7]
// Numbers before 2026-09-22 include the founder's own visits and our automated checks.
// Only "/" shows up under path: the static blog and /pruefung pages do not load the
// analytics script, so their views are not counted here (Search Console has them).
import { execSync } from 'node:child_process';

const argv = process.argv.slice(2);
const DAYS = Number(argv[argv.indexOf('--days') + 1] || 7);
const TEAM = 'team_6TSdiy5nuL2LngvlEY6YKvus';
const PROJECT = 'prj_Ung8mpRsv7AWAXsRECj62erXtoOu';
const to = new Date();
const from = new Date(to.getTime() - DAYS * 86_400_000);
from.setUTCHours(0, 0, 0, 0);
const q = (extra = '') => `projectId=${PROJECT}&teamId=${TEAM}&environment=production&filter=%7B%7D&tz=Europe%2FBerlin&from=${from.toISOString()}&to=${to.toISOString()}${extra}`;

const api = (path) => {
  // the query string holds & characters, so the URL is quoted for the Windows shell
  const out = execSync(`npx vercel api "/web-analytics/v2/${path}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  return JSON.parse(out.slice(out.indexOf('{')));
};

const overview = api(`overview?${q()}`);
console.log(`Vercel Analytics, last ${DAYS} days (${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)})`);
console.log(`  ${overview.total} page views, ${overview.devices} visitors`);
for (const type of ['path', 'referrer', 'country', 'event_name', 'device_type']) {
  const s = api(`stats?${q(`&type=${type}&limit=15`)}`);
  const rows = (s.data ?? []).map((r) => `${r.key ?? r.name}: ${r.total} views, ${r.devices} visitors`);
  console.log(`\n${type}\n  ` + (rows.length ? rows.join('\n  ') : '(none)'));
}

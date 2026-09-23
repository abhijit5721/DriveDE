// Vercel Web Analytics for drivede.app through the logged-in dashboard session on the
// port 9222 Chrome (the public REST API has no analytics endpoint). Prints visitors, page
// views, top paths, referrers, countries and the funnel events for a window.
// Usage: node scripts/analytics/vercel-overview.mjs [--days 7]
// Numbers before 2026-09-22 include the founder's own visits and our automated checks.
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const DAYS = Number(argv[argv.indexOf('--days') + 1] || 7);
const TEAM = 'team_6TSdiy5nuL2LngvlEY6YKvus';
const PROJECT = 'drive-de';
const to = new Date(); const from = new Date(to.getTime() - DAYS * 86_400_000);
const q = (extra = '') => `environment=production&filter=%7B%7D&projectId=${PROJECT}&teamId=${TEAM}&tz=Europe%2FBerlin&from=${from.toISOString()}&to=${to.toISOString()}${extra}`;

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 20000 });
const p = await b.contexts()[0].newPage();
await p.goto('https://vercel.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
const get = async (path) => {
  const r = await p.request.get(`https://vercel.com/api/web-analytics/v2/${path}`);
  if (!r.ok()) return { error: r.status() };
  return r.json();
};
const overview = await get(`overview?${q()}`);
console.log(`Vercel Analytics, last ${DAYS} days (${from.toISOString().slice(0, 10)} to ${to.toISOString().slice(0, 10)})`);
console.log('overview', JSON.stringify(overview?.data ?? overview));
for (const type of ['path', 'referrer', 'country', 'event_name', 'device_type']) {
  const s = await get(`stats?${q(`&type=${type}&limit=12`)}`);
  const rows = (s?.data ?? []).map((r) => `${r.key ?? r.name ?? r[type]}: ${r.total ?? r.visitors ?? r.count}${r.devices != null ? ` (${r.devices} visitors)` : ''}`);
  console.log(`\n${type}\n  ` + (rows.length ? rows.join('\n  ') : JSON.stringify(s).slice(0, 200)));
}
const ts = await get(`timeseries?${q()}`);
const series = Array.isArray(ts?.data) ? ts.data : (Array.isArray(ts?.data?.data) ? ts.data.data : []);
const perDay = new Map();
for (const d of series) {
  const day = String(d.key ?? d.date ?? d.timestamp ?? '').slice(0, 10);
  const cur = perDay.get(day) ?? { v: 0, pv: 0 };
  cur.v += Number(d.devices ?? d.visitors ?? 0); cur.pv += Number(d.total ?? d.pageviews ?? 0);
  perDay.set(day, cur);
}
const days = [...perDay].map(([day, c]) => `${day} ${c.v}v/${c.pv}pv`);
console.log('\nper day (hourly buckets summed, visitors may double-count across hours)\n  ' + (days.length ? days.join('\n  ') : JSON.stringify(ts).slice(0, 300)));
await p.close(); await b.close();

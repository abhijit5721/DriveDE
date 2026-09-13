// Find the personal account's recent comments in given subs from its own profile (9223),
// then open each permalink from the DriveDE Chrome (9222) and report whether other users
// see it or "removed by moderator". Usage: node scripts/reddit/removed-check.mjs startups indiehackers
import { chromium } from 'playwright';
const subs = process.argv.slice(2).map((s) => s.toLowerCase());
const own = await chromium.connectOverCDP('http://127.0.0.1:9223', { timeout: 15000 });
const p1 = await own.contexts()[0].newPage();
await p1.goto('https://www.reddit.com/user/Then-Big4461/comments/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await p1.waitForTimeout(6000);
const links = await p1.evaluate((subs) => {
  const out = [];
  for (const a of document.querySelectorAll('a[href*="/comments/"]')) {
    const href = a.getAttribute('href') || '';
    const m = href.match(/^\/r\/([^/]+)\/comments\/([a-z0-9]+)\/[^/]*\/([a-z0-9]+)\/?/);
    if (m && subs.includes(m[1].toLowerCase()) && !out.some((o) => o.href === href)) out.push({ sub: m[1], href });
  }
  return out;
}, subs);
await p1.close();
await own.close();
console.log('own profile comment permalinks:', JSON.stringify(links));
const other = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 15000 });
const p2 = await other.contexts()[0].newPage();
for (const l of links) {
  await p2.goto('https://www.reddit.com' + l.href, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p2.waitForTimeout(6000);
  const r = await p2.evaluate(() => {
    const t = document.body.innerText;
    const mine = [...document.querySelectorAll('shreddit-comment')].filter((c) => c.getAttribute('author') === 'Then-Big4461').length;
    return { mine, removed: /removed by moderator/i.test(t), deleted: /Comment deleted by user/i.test(t) };
  });
  console.log(l.sub, l.href, JSON.stringify(r));
}
await p2.close();
await other.close();

// Read the founder's Facebook notifications and the state of our group posts and join
// requests (read-only, port 9222 Chrome). Prints what needs an action.
// Usage: node scripts/outreach/fb-notifications.mjs
import { chromium } from 'playwright';

const GROUP_POSTS = {
  'Indians in Berlin': 'https://www.facebook.com/groups/2606668189644850/posts/4375409869437331/',
};
const PENDING_JOINS = {
  'Führerschein (4.1k)': 'https://www.facebook.com/groups/1361195243915123',
  'berlin EXPATS': 'https://www.facebook.com/groups/berlinexpats',
  'Munich Indians': 'https://www.facebook.com/groups/168266226545074',
  'Indians in Frankfurt (private)': 'https://www.facebook.com/groups/1487927254783433',
};
const OWN_POST_GROUPS = {
  'Indians in Germany/Deutschland': 'https://www.facebook.com/groups/ghotrarobin',
};

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 30000 });
const p = await b.contexts()[0].newPage();
await p.setViewportSize({ width: 1400, height: 1000 });

await p.goto('https://www.facebook.com/notifications/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(7000);
const notifs = await p.evaluate(() => [...document.querySelectorAll('a[role="link"]')]
  .map(a => ({ t: (a.innerText || '').replace(/\s+/g, ' ').replace(/Join groupDismiss|Dismiss/g, '').trim(), h: a.href }))
  .filter(x => x.t.length > 20 && /group|post|comment|reacted|approved|declined|request|Führerschein|DriveDE|driving/i.test(x.t))
  .filter((x, i, arr) => arr.findIndex(y => y.h === x.h) === i)
  .slice(0, 15));
console.log('NOTIFICATIONS');
for (const n of notifs) console.log(' -', n.t.slice(0, 160));

for (const [name, url] of Object.entries(OWN_POST_GROUPS)) {
  for (const tab of ['my_posted_content', 'my_pending_content', 'my_declined_content']) {
    await p.goto(`${url}/${tab}/`, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(6000);
    const t = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    const hasB = t.includes('If you are doing the German driving licence');
    const stats = (t.match(/(\d+)\s*(comments?|Kommentare?)|(\d+)\s*(shares?)|(\d+)\s*(reactions?)/gi) || []).join(', ');
    if (hasB) console.log(`POST B in ${name}: ${tab.replace('my_', '').replace('_content', '')} ${stats ? '(' + stats + ')' : ''}`);
  }
}

for (const [name, url] of Object.entries(GROUP_POSTS)) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(8000);
  for (const el of await p.locator('div[role="button"]').filter({ hasText: /^View more comments|^See more$/ }).all()) await el.click().catch(() => {});
  const comments = await p.evaluate(() => [...document.querySelectorAll('div[role="article"]')].map(a => a.innerText.replace(/\s+/g, ' ').trim()).filter(t => t.length > 15 && t.length < 900).slice(0, 12));
  console.log(`\nTHREAD ${name}: ${comments.length} comment blocks`);
  for (const c of comments) console.log(' -', c.slice(0, 220));
}

console.log('\nJOIN REQUESTS');
for (const [name, url] of Object.entries(PENDING_JOINS)) {
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(6000);
  const state = await p.evaluate(() => (document.body.innerText.match(/Cancel request|Requested|Your membership is pending|Join group|Joined|Write something|Invite/i) || ['?'])[0]);
  console.log(` - ${name}: ${/Write something|Joined|Invite/i.test(state) ? 'MEMBER' : /Cancel|Requested|pending/i.test(state) ? 'pending' : state}`);
}
await p.close(); await b.close();

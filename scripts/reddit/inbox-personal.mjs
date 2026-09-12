// Notifications + karma of the founder's personal account (Chrome on 9223).
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9223', { timeout: 15000 });
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
await page.goto('https://www.reddit.com/notifications/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(5000);
const who = await page.evaluate(() => document.querySelector('#expand-user-drawer-button') ? 'logged in' : 'NOT logged in');
const items = await page.evaluate(() => {
  const t = document.body.innerText.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n');
  const i = t.indexOf('Notifications');
  return t.slice(i, i + 1500).split('\n').filter(Boolean).slice(0, 40);
});
console.log('PERSONAL', who);
console.log(items.join('\n'));
await page.goto('https://www.reddit.com/user/Then-Big4461/', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(4000);
const karma = await page.evaluate(() => { const m = document.body.innerText.replace(/\s+/g, ' ').match(/(\d[\d,.]*)\s*Karma/); return m ? m[0] : 'karma not found'; });
console.log('PERSONAL KARMA:', karma);
await page.close(); await browser.close();

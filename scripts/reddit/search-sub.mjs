// Search one subreddit for several queries and print de-duplicated posts as JSON.
// Usage: node scripts/reddit/search-sub.mjs <port> <sub> <t: day|week|month> "<query>" ["<query>" ...]
import { chromium } from 'playwright';
const [port, sub, t, ...queries] = process.argv.slice(2);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 15000 });
const page = await browser.contexts()[0].newPage();
const seen = new Map();
for (const q of queries) {
  const url = `https://www.reddit.com/r/${sub}/search/?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&t=${t}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4500);
    for (let i = 0; i < 2; i++) { await page.mouse.wheel(0, 3000); await page.waitForTimeout(1200); }
    const rows = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('search-telemetry-tracker, [data-testid="search-post-unit"], faceplate-tracker[noun="post"]')) {
        const a = el.querySelector('a[href*="/comments/"]');
        if (!a) continue;
        const href = a.getAttribute('href');
        const text = el.innerText.replace(/\s+/g, ' ').trim();
        out.push({ href, text: text.slice(0, 260) });
      }
      if (out.length === 0) {
        for (const a of document.querySelectorAll('a[href*="/comments/"]')) {
          const text = (a.closest('[data-testid], article, div')?.innerText || a.innerText).replace(/\s+/g, ' ').trim();
          if (text.length > 20) out.push({ href: a.getAttribute('href'), text: text.slice(0, 260) });
        }
      }
      return out;
    });
    let added = 0;
    for (const r of rows) {
      const m = r.href.match(/\/comments\/([a-z0-9]+)\//);
      if (!m) continue;
      if (!seen.has(m[1])) { seen.set(m[1], { id: m[1], url: 'https://www.reddit.com' + r.href.split('?')[0], text: r.text, q }); added++; }
    }
    console.error(`q="${q}": ${rows.length} rows, ${added} new`);
  } catch (e) {
    console.error(`q="${q}" ERR ${e.message.split('\n')[0]}`);
  }
}
console.log(JSON.stringify([...seen.values()], null, 1));
await page.close();
await browser.close();

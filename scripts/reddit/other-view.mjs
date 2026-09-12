// View threads from the OTHER logged-in account and report whether a given author's
// comments are visible there (a filtered or mod-removed comment is hidden from everyone else).
// Usage: node scripts/reddit/other-view.mjs <port> <author> <threadUrl...>
import { chromium } from 'playwright';
const [port, author, ...urls] = process.argv.slice(2);
const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { timeout: 15000 });
const page = await browser.contexts()[0].newPage();
for (const url of urls) {
  try {
    await page.goto(url.includes('?') ? url : `${url}?sort=new`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);
    const r = await page.evaluate((a) => {
      const all = [...document.querySelectorAll('shreddit-comment')];
      const mine = all.filter((c) => c.getAttribute('author') === a);
      const removed = document.body.innerText.includes('Comment removed by moderator');
      return { total: all.length, mine: mine.length, removedMarker: removed, starts: mine.map((c) => (c.querySelector('[slot="comment"]')?.innerText || '').replace(/\s+/g, ' ').slice(0, 70)) };
    }, author);
    console.log(url.replace('https://www.reddit.com', ''), JSON.stringify(r));
  } catch (e) {
    console.log(url, 'ERR', e.message.split('\n')[0]);
  }
}
await page.close();
await browser.close();

// Scan Reddit for live threads where a DriveDE answer would be genuinely useful.
// Uses the real Chrome (CDP 9222). Handles both old.reddit and new reddit DOM,
// and logs what each page actually looked like so a zero can be diagnosed.
import { chromium } from 'playwright';
const QUERIES = [
  { sub: 'germany', q: 'driving licence OR driving license OR Führerschein OR Fahrschule' },
  { sub: 'germany', q: 'driving test OR Fahrprüfung OR practical exam' },
  { sub: 'germany', q: 'convert license OR Umschreibung OR "Anlage 11"' },
  { sub: 'Berlin', q: 'driving licence OR Fahrschule OR driving test' },
  { sub: 'hamburg', q: 'Fahrschule OR Führerschein OR driving' },
  { sub: 'Munich', q: 'driving licence OR Fahrschule OR driving test' },
  { sub: 'expats', q: 'Germany driving licence OR Germany driving test' },
  { sub: 'Fahrschule', q: '' },
];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
const seen = new Set();
const out = [];
for (const { sub, q } of QUERIES) {
  const url = q
    ? `https://www.reddit.com/r/${sub}/search/?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&t=month`
    : `https://www.reddit.com/r/${sub}/new/`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const info = await page.evaluate(() => {
      const rows = [];
      // new reddit
      for (const e of document.querySelectorAll('shreddit-post')) {
        rows.push({
          title: e.getAttribute('post-title') || e.querySelector('[slot="title"]')?.textContent?.trim() || '',
          url: e.getAttribute('permalink') || '',
          comments: e.getAttribute('comment-count') || '',
          when: e.getAttribute('created-timestamp') || '',
        });
      }
      // search result cards on new reddit
      if (!rows.length) {
        for (const a of document.querySelectorAll('a[data-testid="post-title"], a[data-testid="post-title-text"]')) {
          rows.push({ title: a.textContent.trim(), url: a.getAttribute('href') || '', comments: '', when: '' });
        }
      }
      // old reddit fallback
      if (!rows.length) {
        for (const e of document.querySelectorAll('.search-result, .thing.link')) {
          const a = e.querySelector('a.search-title, a.title');
          rows.push({
            title: a?.textContent?.trim() ?? '',
            url: a?.getAttribute('href') ?? '',
            comments: e.querySelector('.search-comments, .comments')?.textContent?.trim() ?? '',
            when: e.querySelector('time')?.getAttribute('datetime') ?? '',
          });
        }
      }
      return { rows: rows.filter((r) => r.title), url: location.href, peek: document.body.innerText.replace(/\s+/g, ' ').slice(0, 220) };
    });
    console.error(`${sub}: ${info.rows.length} rows @ ${info.url}\n   peek: ${info.peek}`);
    for (const r of info.rows) {
      const full = r.url.startsWith('http') ? r.url : 'https://www.reddit.com' + r.url;
      const key = full.replace(/\/$/, '');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ sub, ...r, url: full });
    }
  } catch (e) {
    console.error(`${sub}: ERROR ${e.message.slice(0, 80)}`);
  }
}
await page.close();
await browser.close();
console.log(JSON.stringify(out, null, 1));

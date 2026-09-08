// Fetch full text of shortlisted Reddit threads (read-only) via CDP Chrome,
// using the public .json endpoint which the real browser can load.
import { chromium } from 'playwright';
// Usage: node scripts/reddit/threads.mjs <id> [<id> ...]   (falls back to the list below)
const ARG_IDS = process.argv.slice(2).map((s) => s.replace(/^.*comments\//, '').split('/')[0]).filter(Boolean);
const IDS = ARG_IDS.length ? ARG_IDS : [
  '1vxev5s', // I failed my first practical driving exam
  '1vozwx3', // Failed practical 4 times in Leipzig
  '1w4i2kc', // Driving license tips
  '1wa3yo6', // How often did you have your driving classes
  '1uudo2x', // How many extra practical lessons
  '1w68jzg', // New German driving licence rule (18 Aug 2026)
  '1w54sz1', // EU licence exchanged from non-EU, after 18 Aug 2026
  '1vzvo0a', // Courses and exams in English, Bonn
  '1vnof5g', // Super anxious theory exam
  '1w2ix02', // r/hamburg Fahrschule mehrsprachig
  '1vyvj4s', // r/hamburg Americans exception states
  '1vx2041', // r/hamburg Fahrschule Wandsbek
];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
const out = [];
for (const id of IDS) {
  try {
    await page.goto(`https://www.reddit.com/comments/${id}.json?limit=8&depth=1&raw_json=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const txt = await page.evaluate(() => document.body.innerText);
    const data = JSON.parse(txt);
    const p = data[0].data.children[0].data;
    const comments = (data[1]?.data?.children ?? [])
      .filter((c) => c.kind === 't1')
      .slice(0, 6)
      .map((c) => ({ author: c.data.author, score: c.data.score, body: (c.data.body || '').slice(0, 400) }));
    out.push({
      id,
      sub: p.subreddit,
      title: p.title,
      author: p.author,
      created: new Date(p.created_utc * 1000).toISOString().slice(0, 10),
      score: p.score,
      num_comments: p.num_comments,
      locked: p.locked,
      archived: p.archived,
      url: 'https://www.reddit.com' + p.permalink,
      body: (p.selftext || '').slice(0, 1400),
      comments,
    });
    console.error(`${id}: ok (${p.num_comments} comments)`);
  } catch (e) {
    console.error(`${id}: ERROR ${e.message.slice(0, 100)}`);
  }
  await page.waitForTimeout(1200);
}
await page.close();
await browser.close();
console.log(JSON.stringify(out, null, 1));

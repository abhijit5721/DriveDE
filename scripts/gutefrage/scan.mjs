// Scan gutefrage.net for fresh learner-driver questions, the same way scripts/reddit/scan.mjs
// scans the driving subreddits. Uses the automation Chrome on port 9222 (gutefrage returns 403 to
// plain fetchers). Source: the community feed "Verkehrsregeln, Führerschein & Fahrschule", which is
// sorted newest first (about five questions a day, 20 cards per page load). Every card newer than
// --hours is opened for its full text and existing answers. Prints JSON. Never posts anything.
// Usage: node scripts/gutefrage/scan.mjs [--hours 48] [--max 25]
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i === -1 ? d : argv[i + 1]; };
const HOURS = Number(opt('--hours', 48));
const MAX = Number(opt('--max', 25));
const FEEDS = [
  'https://www.gutefrage.net/fahrzeuge-mobilitaet-logistik/verkehrsregeln-fuehrerschein-fahrschule',
];
const CDP = process.env.CDP_URL || 'http://127.0.0.1:9222';

const browser = await chromium.connectOverCDP(CDP, { timeout: 15000 });
const page = await browser.contexts()[0].newPage();

async function acceptConsent() {
  try { await page.getByRole('button', { name: /Accept all|Alle akzeptieren/i }).first().click({ timeout: 2500 }); await page.waitForTimeout(1000); } catch {}
}

// 1. Read the feed cards (author, time, title, preview, answer count).
const cutoff = Date.now() - HOURS * 3600 * 1000;
const cards = new Map();
for (const feed of FEEDS) {
  try {
    await page.goto(feed, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    await acceptConsent();
    for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 4000); await page.waitForTimeout(1500); }
    const items = await page.evaluate(() => [...document.querySelectorAll('article.ListingElement')].map((a) => ({
      href: a.querySelector('a[href^="/frage/"]')?.getAttribute('href')?.split('#')[0].split('?')[0],
      dt: a.querySelector('time[datetime]')?.getAttribute('datetime'),
      text: a.innerText,
    })).filter((x) => x.href && x.dt));
    for (const it of items) {
      const created = Date.parse(it.dt);
      if (Number.isNaN(created) || created < cutoff) continue;
      const lines = it.text.split('\n').map((s) => s.trim()).filter(Boolean);
      const m = it.text.match(/(\d+) Antworten|Noch keine Antworten|\b1 Antwort\b/);
      if (!cards.has(it.href)) cards.set(it.href, { href: it.href, created, author: lines[0] || '', answers: m ? (m[1] ? Number(m[1]) : (m[0].startsWith('Noch') ? 0 : 1)) : null });
    }
  } catch (e) { console.error(`feed ${feed}: ${e.message.split('\n')[0]}`); }
}
console.error(`${cards.size} questions newer than ${HOURS}h`);

// 2. Open each fresh question for the full text and the existing answers.
const out = [];
for (const c of [...cards.values()].sort((a, b) => b.created - a.created).slice(0, MAX)) {
  try {
    await page.goto(`https://www.gutefrage.net${c.href}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2000);
    await acceptConsent();
    const q = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText?.trim() || '';
      const body = document.body.innerText;
      const start = body.indexOf(h1.slice(0, 25));
      const section = start === -1 ? '' : body.slice(start, start + 8000);
      const qEnd = section.indexOf('\nAntworten\n');
      const question = qEnd === -1 ? section.slice(h1.length, h1.length + 1500) : section.slice(h1.length, qEnd);
      const aStart = section.indexOf('Am besten bewertet\n');
      const aEnd = section.indexOf('Antwort schreiben');
      const answersText = aStart === -1 ? '' : section.slice(aStart + 19, aEnd === -1 ? undefined : aEnd);
      const blocks = answersText.split(/\nHilfreich\n[\s\S]*?Nicht hilfreich\n?/).map((s) => s.trim()).filter((s) => s.length > 20).slice(0, 8);
      return { title: h1, question: question.trim().slice(0, 1800), answerBlocks: blocks.map((s) => s.slice(0, 700)) };
    });
    out.push({
      title: q.title,
      url: `https://www.gutefrage.net${c.href}`,
      author: c.author,
      created: new Date(c.created).toISOString(),
      ageHours: Math.round((Date.now() - c.created) / 3600000),
      answers: c.answers,
      question: q.question,
      existingAnswers: q.answerBlocks,
    });
  } catch (e) { console.error(`${c.href}: ${e.message.split('\n')[0]}`); }
}
console.log(JSON.stringify(out, null, 1));
await page.close();
await browser.close();

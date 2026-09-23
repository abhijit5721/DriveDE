// Send a join request to Facebook groups from the founder's logged-in Chrome (port 9222).
// If the group asks membership questions, agreement checkboxes are ticked and free-text
// questions get the one honest line below (the founder is a learner in Hamburg). Everything
// the group asked and everything we answered is printed, so the founder can see it.
// Usage: node scripts/outreach/fb-join.mjs <group-url> [<group-url> ...]
import { chromium } from 'playwright';

const ANSWER = 'Ich bin Fahrschüler in Hamburg, die praktische Prüfung steht noch aus, und möchte mich hier zu Prüfung und Fahrstunden austauschen.';
const urls = process.argv.slice(2);
if (!urls.length) { console.error('usage: fb-join.mjs <group-url> ...'); process.exit(1); }

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 30000 });
const p = await b.contexts()[0].newPage();
for (const url of urls) {
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForTimeout(7000);
    const name = (await p.title()).replace(/^\(\d+\)\s*/, '').replace(/\s*\|.*$/, '');
    const joinBtn = p.locator('div[role="button"], button').filter({ hasText: /^Join group$|^Gruppe beitreten$|^Join$/ }).first();
    if (!(await joinBtn.count())) {
      const state = await p.evaluate(() => (document.body.innerText.match(/Joined|Mitglied|Request(ed| sent)|Anfrage gesendet|Cancel request|Anfrage zurückziehen/i) || ['no join button'])[0]);
      console.log(`${name}: ${state}`); continue;
    }
    await joinBtn.click();
    await p.waitForTimeout(4000);
    const dialog = p.locator('div[role="dialog"]').filter({ hasText: /question|Frage|rules|Regeln|agree|zustimm|Submit|Senden/i }).last();
    if (await dialog.count()) {
      const asked = (await dialog.innerText()).replace(/\s+/g, ' ').slice(0, 700);
      console.log(`${name}: membership questions -> ${asked}`);
      for (const cb of await dialog.locator('input[type="checkbox"], div[role="checkbox"]').all()) { await cb.click().catch(() => {}); }
      for (const ta of await dialog.locator('textarea, div[role="textbox"][contenteditable="true"]').all()) { await ta.click(); await p.keyboard.insertText(ANSWER); }
      const submit = dialog.locator('div[role="button"], button').filter({ hasText: /^Submit$|^Senden$|^Absenden$|^Done$|^Fertig$/ }).last();
      if (await submit.count()) await submit.click();
      await p.waitForTimeout(4000);
      console.log(`${name}: answered with "${ANSWER}"`);
    }
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(6000);
    const after = await p.evaluate(() => (document.body.innerText.match(/Joined|Mitglied|Request sent|Requested|Anfrage gesendet|Cancel request|Join group/i) || ['unknown'])[0]);
    console.log(`${name}: now "${after}"`);
  } catch (e) { console.log(`${url}: ERROR ${e.message.split('\n')[0]}`); }
}
await p.close(); await b.close();

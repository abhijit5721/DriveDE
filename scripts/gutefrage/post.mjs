// Post approved gutefrage answers from a drafts JSON file through the logged-in automation Chrome
// (port 9222, account u/drivede). Draft shape: { KEY: { url, text } }. Paragraphs separated by
// blank lines. Verifies by reloading the question and looking for our username above the text.
// Usage: node scripts/gutefrage/post.mjs --file drafts.json G1 [G2 ...]
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const fi = argv.indexOf('--file');
if (fi === -1) { console.error('usage: post.mjs --file drafts.json KEY...'); process.exit(1); }
const DRAFTS = JSON.parse(readFileSync(argv[fi + 1], 'utf8'));
const keys = argv.filter((_, i) => i !== fi && i !== fi + 1);
const ME = process.env.GF_USER || 'drivede';

const browser = await chromium.connectOverCDP(process.env.CDP_URL || 'http://127.0.0.1:9222', { timeout: 15000 });
const page = await browser.contexts()[0].newPage();

for (const k of keys) {
  const d = DRAFTS[k];
  if (!d?.url || !d?.text) { console.log(k, 'missing draft'); continue; }
  try {
    await page.goto(d.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    try { await page.getByRole('button', { name: /Accept all|Alle akzeptieren/i }).first().click({ timeout: 2000 }); } catch {}
    // Open the answer composer: the blue "Antworten" button under the question, or the inline field.
    const openBtn = page.getByRole('button', { name: /^Antworten$/ }).first();
    if (await openBtn.count()) { await openBtn.click({ timeout: 5000 }).catch(() => {}); await page.waitForTimeout(1200); }
    const box = page.locator('[contenteditable="true"], textarea[placeholder*="Antwort"]').first();
    await box.waitFor({ timeout: 15000 });
    await box.click();
    const paras = d.text.split('\n\n');
    for (let i = 0; i < paras.length; i++) {
      await page.keyboard.insertText(paras[i]);
      if (i < paras.length - 1) { await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); }
    }
    await page.waitForTimeout(800);
    const submit = page.getByRole('button', { name: /^Absenden$|Antwort absenden|Antworten$/ }).last();
    await submit.click({ timeout: 10000 });
    await page.waitForTimeout(6000);
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000 + attempt * 3000);
      ok = await page.evaluate(({ me, needle }) => {
        const t = document.body.innerText;
        return t.includes(needle) && [...document.querySelectorAll(`a[href="/nutzer/${me}"]`)].length > 1;
      }, { me: ME, needle: d.text.slice(0, 40) });
    }
    console.log(`${k}: ${ok ? 'POSTED (verified on page)' : 'NOT CONFIRMED'} ${d.url}`);
    if (!ok) await page.screenshot({ path: `demo-video/gf-${k}-unconfirmed.png` }).catch(() => {});
  } catch (e) {
    console.log(`${k}: ERROR ${e.message.slice(0, 160)}`);
    await page.screenshot({ path: `demo-video/gf-${k}-error.png` }).catch(() => {});
  }
}
await page.close();
await browser.close();

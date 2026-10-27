// Reply underneath a specific commenter's comment (not a top-level comment).
// Usage: node scripts/reddit/reply.mjs [--personal] --file drafts.json KEY...
// drafts.json entries need { url, replyTo: "<author>", text }.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { findOwnComment } from './own-comment.mjs';

const argv = process.argv.slice(2);
const personal = argv.includes('--personal');
const fi = argv.indexOf('--file');
if (fi === -1) { console.error('usage: reply.mjs [--personal] --file drafts.json KEY...'); process.exit(1); }
const DRAFTS = JSON.parse(readFileSync(argv[fi + 1], 'utf8'));
const keys = argv.filter((a, i) => a !== '--personal' && i !== fi && i !== fi + 1);
const ME = personal ? (process.env.REDDIT_PERSONAL || 'Then-Big4461') : 'abhi_in_germany';

const browser = await chromium.connectOverCDP(personal ? 'http://127.0.0.1:9223' : 'http://127.0.0.1:9222', { timeout: 15000 });
const page = await browser.contexts()[0].newPage();

for (const k of keys) {
  const d = DRAFTS[k];
  if (!d || !d.replyTo) { console.log(k, 'missing draft or replyTo'); continue; }
  try {
    await page.goto(d.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);
    // replyTo may be an author name or a comment thing id (t1_...) when the author has several comments.
    const target = page.locator(d.replyTo.startsWith('t1_') ? `shreddit-comment[thingid="${d.replyTo}"]` : `shreddit-comment[author="${d.replyTo}"]`).first();
    if (!(await target.count())) { console.log(`${k}: no comment by ${d.replyTo} found`); continue; }
    // Duplicate guard: never reply twice under the same comment (the founder may have answered by hand).
    // Also look up the same draft text via thread ?sort=new and the own profile (big threads hide older comments).
    const already = await target.locator(`shreddit-comment[author="${ME}"]`).count();
    if (already > 0 && !argv.includes('--allow-duplicate')) { console.log(`${k}: SKIPPED, ${ME} already replied under ${d.replyTo}`); continue; }
    if (!argv.includes('--allow-duplicate')) {
      const dup = await findOwnComment(browser.contexts()[0], { me: ME, url: d.url, needle: d.text.slice(0, 40) });
      if (dup.found) { console.log(`${k}: SKIPPED, ${ME} already posted this text in ${d.url} (comment ${dup.commentId} via ${dup.via})`); continue; }
    }
    await target.scrollIntoViewIfNeeded();
    // The Reply control is inside the comment's own action row (shadow DOM pierced by CSS locators).
    const replyBtn = target.locator('button:has-text("Reply"), [aria-label="Reply"], faceplate-tracker[noun="reply"] button').first();
    await replyBtn.click();
    await page.waitForTimeout(1500);
    const box = target.locator('[contenteditable="true"]').first();
    await box.waitFor({ timeout: 15000 });
    await box.click();
    const paras = d.text.split('\n\n');
    for (let i = 0; i < paras.length; i++) {
      await page.keyboard.insertText(paras[i]);
      if (i < paras.length - 1) { await page.keyboard.press('Enter'); await page.keyboard.press('Enter'); }
    }
    await page.keyboard.press('Control+Home');
    await page.waitForTimeout(600);
    const submit = target.locator('shreddit-composer button[type="submit"]').first();
    if (await submit.count()) await submit.click(); else await target.getByRole('button', { name: /^Comment$/ }).first().click();
    await page.waitForTimeout(6000);
    // Verify: a comment by us whose text starts like the draft exists (thread ?sort=new or own profile).
    let ok = false;
    for (let attempt = 0; attempt < 3 && !ok; attempt++) {
      await page.waitForTimeout(3000 + attempt * 3000);
      ok = (await findOwnComment(browser.contexts()[0], { me: ME, url: d.url, needle: d.text.slice(0, 40) })).found;
    }
    console.log(`${k}: ${ok ? 'REPLIED' : 'NOT CONFIRMED'} under ${d.replyTo} on ${d.url}`);
  } catch (e) {
    console.log(`${k}: ERROR ${e.message.slice(0, 140)}`);
    await page.screenshot({ path: `c:/Users/abhij/Downloads/DriveDE/demo-video/reply-${k}-error.png`, timeout: 15000 }).catch(() => {});
  }
}
await page.close();
await browser.close();

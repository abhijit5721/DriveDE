// Reply as the founder's Facebook account (anonymous posting inside the group keeps the
// ChummySeal2 alias) under a comment on one of our own group posts. Uses the logged-in
// Chrome on port 9222. Verifies by reloading and finding the text in the thread.
// Usage: node scripts/outreach/fb-reply.mjs <post-url> "<comment author to reply to>" --file text.txt
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [postUrl, author, flag, file] = process.argv.slice(2);
if (!postUrl || !author || flag !== '--file' || !file) { console.error('usage: fb-reply.mjs <post-url> "<author>" --file text.txt'); process.exit(1); }
const text = readFileSync(file, 'utf8').trim();

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 20000 });
const p = await b.contexts()[0].newPage();
await p.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(8000);

// duplicate guard: our text already in the thread?
const already = await p.evaluate((needle) => document.body.innerText.includes(needle), text.slice(0, 60));
if (already) { console.log('ALREADY POSTED, nothing sent'); await p.close(); await b.close(); process.exit(0); }

const comment = p.locator('div[role="article"]').filter({ hasText: author }).first();
await comment.waitFor({ timeout: 15000 });
await comment.locator('div[role="button"]').filter({ hasText: /^Reply$|^Antworten$/ }).first().click();
await p.waitForTimeout(2500);
const box = p.locator('div[role="textbox"][contenteditable="true"]').last();
await box.waitFor({ timeout: 15000 });
await box.click();
await p.keyboard.insertText(text);
await p.waitForTimeout(1500);
await p.keyboard.press('Enter');
await p.waitForTimeout(6000);
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForTimeout(8000);
const posted = await p.evaluate((needle) => document.body.innerText.includes(needle), text.slice(0, 60));
console.log(posted ? 'POSTED and visible after reload' : 'NOT FOUND after reload, check manually');
await p.screenshot({ path: 'scripts/outreach/fb-reply-result.png' });
await p.close(); await b.close();

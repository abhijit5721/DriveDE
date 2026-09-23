// Send one TikTok DM from the DriveDE account (@drivede20, logged in on the port 9222 Chrome).
// Opens the profile, uses its Message button, types the text, sends, and verifies the text is
// in the thread. Refuses to send when the same text is already in the thread.
// Usage: node scripts/outreach/tiktok-dm.mjs <handle> --file text.txt
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const [handle, flag, file] = process.argv.slice(2);
if (!handle || flag !== '--file' || !file) { console.error('usage: tiktok-dm.mjs <handle> --file text.txt'); process.exit(1); }
const text = readFileSync(file, 'utf8').trim();
const needle = text.slice(0, 40);

const b = await chromium.connectOverCDP('http://127.0.0.1:9222', { timeout: 30000 });
const p = await b.contexts()[0].newPage();
await p.goto(`https://www.tiktok.com/@${handle}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(6000);
const me = await p.evaluate(() => !!document.querySelector('[data-e2e="profile-icon"]'));
if (!me) { console.log('NOT logged in on TikTok, nothing sent'); await p.close(); await b.close(); process.exit(1); }
const msgBtn = p.locator('[data-e2e="message-button"]').first();
if (!(await msgBtn.count())) { console.log(`no Message button on @${handle} (DMs closed to non-friends), nothing sent`); await p.close(); await b.close(); process.exit(1); }
await msgBtn.click();
await p.waitForTimeout(6000);
console.log('thread url', p.url());
if (await p.evaluate((n) => document.body.innerText.includes(n), needle)) { console.log('ALREADY SENT, nothing sent'); await p.close(); await b.close(); process.exit(0); }
const box = p.locator('[data-e2e="message-input-area"] [contenteditable="true"], div[contenteditable="true"][role="textbox"], .public-DraftEditor-content').first();
await box.waitFor({ timeout: 15000 });
await box.click();
await p.keyboard.insertText(text);
await p.waitForTimeout(1500);
const send = p.locator('[data-e2e="message-send"]').first();
if (await send.count()) await send.click(); else await p.keyboard.press('Enter');
await p.waitForTimeout(5000);
const sent = await p.evaluate((n) => document.body.innerText.includes(n), needle);
console.log(sent ? `SENT to @${handle}, text visible in the thread` : 'text not visible in the thread, check manually');
await p.screenshot({ path: 'scripts/outreach/tiktok-dm-result.png', timeout: 8000 }).catch(() => {});
await p.close(); await b.close();

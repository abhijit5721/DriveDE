// Finish a YouTube Studio draft (created by upload.mjs when a step failed):
// opens "Edit draft" for the tutorial title, sets "not made for kids", walks
// Details -> Video elements -> Checks -> Visibility, sets Public and publishes.
// Usage: node scripts/youtube/finish-draft.mjs <de|en> [--dry] [--cdp url]
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const lang = args.find((a) => /^(de|en)$/.test(a));
if (!lang) { console.error('usage: finish-draft.mjs <de|en> [--dry]'); process.exit(1); }
const dry = args.includes('--dry');
const cdp = args.includes('--cdp') ? args[args.indexOf('--cdp') + 1] : (process.env.CDP_URL || 'http://127.0.0.1:9226');
const CHANNEL = 'UC7vTRoaxnGKv_aQRFtPGErQ';
const ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUT = path.join(ROOT, 'demo-video', 'out');
const md = readFileSync(path.join(ROOT, 'demo-video', 'tutorials', 'app-walkthrough', 'youtube.md'), 'utf8');
const section = md.split(lang === 'de' ? '\n## German\n' : '\n## English\n')[1].split('\n## ')[0];
const title = section.match(/^Title[^:]*:\s*(.+)$/m)[1].trim();

const b = await chromium.connectOverCDP(cdp, { timeout: 30000 });
const ctx = b.contexts()[0];
const page = ctx.pages()[0] || (await ctx.newPage());
page.setDefaultTimeout(60000);
const shot = (n) => page.screenshot({ path: path.join(OUT, `yt-${lang}-${n}.png`) }).catch(() => {});
const scrimGone = async () => {
  await page.waitForFunction(() => {
    const s = document.querySelector('ytcp-uploads-dialog .dialog-scrim');
    return !s || getComputedStyle(s).display === 'none' || getComputedStyle(s).visibility === 'hidden' || s.getClientRects().length === 0;
  }, null, { timeout: 120000 }).catch(() => {});
};

await page.goto(`https://studio.youtube.com/channel/${CHANNEL}/videos/upload`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
const row = page.locator('ytcp-video-row').filter({ hasText: title }).first();
await row.waitFor({ state: 'visible' });
await row.hover();
const edit = row.locator('text=Edit draft').first();
if (await edit.isVisible().catch(() => false)) await edit.click();
else await row.locator('#video-title, a#video-title').first().click();
await page.locator('ytcp-uploads-dialog #title-textarea, ytcp-uploads-dialog #next-button').first().waitFor({ state: 'visible' });
await page.waitForTimeout(3000);
console.log('draft dialog open');

await scrimGone();
const kids = page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first();
await kids.scrollIntoViewIfNeeded();
await kids.click({ force: true });
console.log('not for kids set');
await shot('d1-details');

for (let i = 0; i < 3; i++) {
  await scrimGone();
  const next = page.locator('ytcp-uploads-dialog #next-button').first();
  await next.waitFor({ state: 'visible' });
  await next.click({ force: true });
  await page.waitForTimeout(3000);
  console.log('next', i + 1);
}
await scrimGone();
const pub = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
await pub.waitFor({ state: 'visible' });
await pub.click({ force: true });
await page.waitForTimeout(1500);
await shot('d2-visibility');

const progress = page.locator('ytcp-uploads-dialog .progress-label, ytcp-video-upload-progress .label').first();
for (let i = 0; i < 180; i++) {
  const t = (await progress.innerText().catch(() => '')).trim();
  if (i % 6 === 0) console.log('progress:', t || '(none)');
  const done = page.locator('ytcp-uploads-dialog #done-button').first();
  const enabled = await done.isEnabled().catch(() => false);
  if (enabled && !/Uploading|hochgeladen|\d+%/i.test(t)) break;
  await page.waitForTimeout(5000);
}

if (dry) { console.log('DRY RUN: stopping before Publish'); await b.close(); process.exit(0); }
await page.locator('ytcp-uploads-dialog #done-button').first().click({ force: true });
await page.waitForTimeout(6000);
await shot('d3-published');
const href = await page.locator('ytcp-uploads-dialog a[href*="youtu.be"], ytcp-video-info a[href*="youtu"], a[href*="youtu.be"]').first().getAttribute('href').catch(() => '');
console.log('PUBLISHED', href);
const close = page.locator('ytcp-uploads-dialog #close-button, ytcp-uploads-still-processing-dialog #close-button').first();
if (await close.isVisible().catch(() => false)) await close.click({ force: true });
await b.close();

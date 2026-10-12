// Upload a tutorial video to the DriveDE YouTube channel through YouTube Studio
// in a CDP Chrome (the Google account that owns the channel must be signed in).
// Usage: node scripts/youtube/upload.mjs <de|en> [--dry] [--cdp http://127.0.0.1:9226]
//   --dry fills everything and stops before the final Publish.
// Metadata: demo-video/tutorials/app-walkthrough/youtube.md (title, description, tags);
// chapters appended from demo-video/out/tutorial-<lang>-chapters.txt.
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const lang = args.find((a) => /^(de|en)$/.test(a));
if (!lang) { console.error('usage: upload.mjs <de|en> [--dry] [--cdp url]'); process.exit(1); }
const dry = args.includes('--dry');
const cdp = args.includes('--cdp') ? args[args.indexOf('--cdp') + 1] : (process.env.CDP_URL || 'http://127.0.0.1:9226');
const CHANNEL = 'UC7vTRoaxnGKv_aQRFtPGErQ';
const ROOT = path.resolve(import.meta.dirname, '..', '..');
const OUT = path.join(ROOT, 'demo-video', 'out');
const video = path.join(OUT, `tutorial-${lang}.mp4`);
const chaptersFile = path.join(OUT, `tutorial-${lang}-chapters.txt`);
if (!existsSync(video)) { console.error('missing', video); process.exit(1); }

// Pull title / description / tags from youtube.md
const md = readFileSync(path.join(ROOT, 'demo-video', 'tutorials', 'app-walkthrough', 'youtube.md'), 'utf8');
const section = md.split(lang === 'de' ? '\n## German\n' : '\n## English\n')[1].split('\n## ')[0];
const title = section.match(/^Title[^:]*:\s*(.+)$/m)[1].trim();
const description = section.split(/^Description:\s*$/m)[1].split(/^Chapters?:|^Kapitel:/m)[0].trim();
const tags = section.match(/^Tags:\s*(.+)$/m)[1].split(',').map((t) => t.trim()).filter(Boolean);
const chapters = existsSync(chaptersFile) ? readFileSync(chaptersFile, 'utf8').trim() : '';
const fullDescription = chapters ? `${description}\n\n${lang === 'de' ? 'Kapitel' : 'Chapters'}:\n${chapters}` : description;
console.log('title:', title, `(${title.length} chars)`);
console.log('description:', fullDescription.length, 'chars;', tags.length, 'tags');
if (title.length > 100) { console.error('title too long'); process.exit(1); }

const b = await chromium.connectOverCDP(cdp, { timeout: 30000 });
const ctx = b.contexts()[0];
const page = ctx.pages()[0] || (await ctx.newPage());
page.setDefaultTimeout(60000);
const shot = (n) => page.screenshot({ path: path.join(OUT, `yt-${lang}-${n}.png`) }).catch(() => {});

await page.goto(`https://studio.youtube.com/channel/${CHANNEL}/videos/upload?d=ud`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);
if (!page.url().includes(CHANNEL)) {
  console.error('not on the DriveDE channel; url =', page.url());
  await shot('wrong-channel');
  process.exit(2);
}

// File picker
const fileInput = page.locator('ytcp-uploads-file-picker input[type=file], input[type=file]').first();
await fileInput.waitFor({ state: 'attached' });
await fileInput.setInputFiles(video);
console.log('file selected');
await page.locator('#title-textarea #textbox').waitFor({ state: 'visible' });
await page.waitForTimeout(3000);

// Title + description (contenteditable; select-all then type to replace the auto title)
const setRich = async (sel, text) => {
  const box = page.locator(sel).first();
  await box.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await box.fill(text).catch(async () => { await page.keyboard.insertText(text); });
};
await setRich('#title-textarea #textbox', title);
await setRich('#description-textarea #textbox', fullDescription);
console.log('title/description set');

const scrimGone = async () => {
  await page.waitForFunction(() => {
    const s = document.querySelector('ytcp-uploads-dialog .dialog-scrim');
    return !s || getComputedStyle(s).display === 'none' || getComputedStyle(s).visibility === 'hidden' || s.getClientRects().length === 0;
  }, null, { timeout: 120000 }).catch(() => {});
};

// Not made for kids
await scrimGone();
await page.locator('tp-yt-paper-radio-button[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]').first().click({ force: true });

// Show more -> tags, language
const more = page.locator('ytcp-button#toggle-button, #toggle-button').first();
if (await more.isVisible().catch(() => false)) {
  await more.click();
  await page.waitForTimeout(1500);
  const tagInput = page.locator('#tags-container input, ytcp-free-text-chip-bar input').first();
  if (await tagInput.isVisible().catch(() => false)) {
    await tagInput.click();
    await tagInput.fill(tags.join(',') + ',');
    console.log('tags set');
  }
  const langDrop = page.locator('#language ytcp-dropdown-trigger, ytcp-form-language-input ytcp-dropdown-trigger').first();
  if (await langDrop.isVisible().catch(() => false)) {
    await langDrop.click();
    const want = lang === 'de' ? /^German$/ : /^English$/;
    const item = page.locator('tp-yt-paper-item, ytcp-text-menu tp-yt-paper-item').filter({ hasText: want }).first();
    if (await item.isVisible({ timeout: 5000 }).catch(() => false)) { await item.click(); console.log('language set'); }
    else await page.keyboard.press('Escape');
  }
}
await shot('1-details');

// Next x3 (Video elements, Checks, Visibility)
for (let i = 0; i < 3; i++) {
  await scrimGone();
  await page.locator('ytcp-uploads-dialog #next-button').first().click({ force: true });
  await page.waitForTimeout(3000);
}
await scrimGone();
await page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first().click({ force: true });
await page.waitForTimeout(1000);
await shot('2-visibility');

// Wait until upload has finished (the progress label says "Upload complete" / "Checks complete")
const progress = page.locator('ytcp-uploads-dialog .progress-label, ytcp-video-upload-progress .label').first();
for (let i = 0; i < 180; i++) {
  const t = (await progress.innerText().catch(() => '')).trim();
  if (i % 6 === 0) console.log('progress:', t || '(none)');
  const enabled = await page.locator('ytcp-uploads-dialog #done-button').first().isEnabled().catch(() => false);
  if (enabled && !/Uploading|hochgeladen|\d+%/i.test(t)) break;
  await page.waitForTimeout(5000);
}

if (dry) { console.log('DRY RUN: stopping before Publish'); await b.close(); process.exit(0); }

await page.locator('ytcp-uploads-dialog #done-button').first().click({ force: true });
await page.waitForTimeout(5000);
await shot('3-published');
const link = await page.locator('a.ytcp-video-info, #share-url, a[href*="youtu.be"]').first().innerText().catch(() => '');
const href = await page.locator('a[href*="youtu.be"], a[href*="youtube.com/watch"]').first().getAttribute('href').catch(() => '');
console.log('PUBLISHED', link || href);
const close = page.locator('#close-button, ytcp-button#close-button').first();
if (await close.isVisible().catch(() => false)) await close.click();
await b.close();

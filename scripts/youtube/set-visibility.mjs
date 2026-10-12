// Change a video's visibility in YouTube Studio through the CDP Chrome (port 9226).
// Usage: node scripts/youtube/set-visibility.mjs <videoId> <PRIVATE|UNLISTED|PUBLIC>
import { chromium } from 'playwright';

const [id, vis] = process.argv.slice(2);
if (!id || !/^(PRIVATE|UNLISTED|PUBLIC)$/.test(vis || '')) { console.error('usage: set-visibility.mjs <videoId> <PRIVATE|UNLISTED|PUBLIC>'); process.exit(1); }
const cdp = process.env.CDP_URL || 'http://127.0.0.1:9226';
const b = await chromium.connectOverCDP(cdp, { timeout: 30000 });
const ctx = b.contexts()[0];
const page = ctx.pages()[0] || (await ctx.newPage());
page.setDefaultTimeout(60000);

await page.goto(`https://studio.youtube.com/video/${id}/edit`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
const trigger = page.locator('ytcp-video-metadata-visibility #visibility-text, ytcp-video-metadata-visibility #content').first();
await trigger.waitFor({ state: 'visible' });
await trigger.click({ force: true });
await page.waitForTimeout(1500);
await page.locator(`tp-yt-paper-radio-button[name="${vis}"]`).first().click({ force: true });
await page.waitForTimeout(1000);
const done = page.locator('ytcp-video-visibility-select #save-button, #done-button, ytcp-button#save-button').first();
if (await done.isVisible().catch(() => false)) await done.click({ force: true });
await page.waitForTimeout(1500);
const save = page.locator('ytcp-button#save, #save').first();
await save.waitFor({ state: 'visible' });
await save.click({ force: true });
await page.waitForTimeout(4000);
await page.screenshot({ path: `demo-video/out/yt-vis-${id}.png` }).catch(() => {});
const txt = await page.locator('ytcp-video-metadata-visibility').first().innerText().catch(() => '');
console.log('visibility now:', txt.replace(/\s+/g, ' ').trim());
await b.close();

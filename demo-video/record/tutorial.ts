/**
 * App walkthrough tutorial recorder (demo-video/tutorials/app-walkthrough/script.md).
 *
 * Real-time screencast capture (the cockpit technique): each scene drives the app on the
 * wallclock, frames are pushed by Page.startScreencast with timestamps, and assemble.mjs
 * resamples them to 30 fps through frames.json. Phone viewport 390x844 at 3x, dark mode.
 * Frames land in frames/tut-<scene>-<lang>/. Scene bodies: tutorial-scenes.ts; clip
 * lengths: src/tutorialClips.json (shared with the Remotion composition).
 *
 * Prereq: app dev server on http://localhost:5173 (localhost auto-grants Pro).
 * Run: node --experimental-strip-types record/tutorial.ts [scene,scene] [de|en]
 */
import { chromium, type Page, type CDPSession } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { makeScenes, clipSeconds, type Lang } from './tutorial-scenes.ts';

// localhost auto-grants Pro; TUT_BASE=http://127.0.0.1:5173 records the real trial state (still own traffic)
const BASE = process.env.TUT_BASE || 'http://localhost:5173';
const FPS = 30;
const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const FRAMES_DIR = path.join(ROOT, '..', 'frames');
const FIXTURE = path.join(ROOT, '..', 'fixtures', 'seed-state.json');

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function seed(page: Page, lang: Lang, overrides: Record<string, unknown> = {}, fresh = false) {
  await page.goto(`${BASE}/robots.txt`);
  if (fresh) {
    await page.evaluate(() => new Promise<void>((res) => { const r = indexedDB.deleteDatabase('keyval-store'); r.onsuccess = () => res(); r.onerror = () => res(); r.onblocked = () => res(); }));
    await page.evaluate(() => { localStorage.clear(); localStorage.setItem('drivede_own_traffic', '1'); });
    return;
  }
  const fixture = JSON.parse(await readFile(FIXTURE, 'utf-8'));
  Object.assign(fixture.state, { language: lang, darkMode: true, activeTab: 'home', hasVisited: true, dashboardIntroPlayed: true, cookieSettings: { essential: true, analytics: false, marketing: false, hasSet: true } }, overrides);
  await page.evaluate((val) => new Promise<void>((res, rej) => {
    const open = indexedDB.open('keyval-store');
    open.onupgradeneeded = () => open.result.createObjectStore('keyval');
    open.onsuccess = () => { const tx = open.result.transaction('keyval', 'readwrite'); tx.objectStore('keyval').put(val, 'drivede-storage'); tx.oncomplete = () => { open.result.close(); res(); }; tx.onerror = () => rej(tx.error); };
    open.onerror = () => rej(open.error);
  }), JSON.stringify(fixture));
  await page.evaluate(() => localStorage.setItem('drivede_own_traffic', '1'));
}

async function enterApp(page: Page, lang: Lang) {
  await page.goto(`${BASE}/?lang=${lang}`, { waitUntil: 'networkidle' });
  const start = page.getByTestId('welcome-start-btn');
  if (await start.first().isVisible().catch(() => false)) await start.first().click();
  await page.getByTestId('nav-home').first().waitFor({ state: 'attached', timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await sleep(800);
}

const click = (page: Page, testId: string) => page.evaluate((id) => { const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`); if (!el) throw new Error(`no ${id}`); el.click(); }, testId);
const scrollTo = (page: Page, y: number) => page.evaluate((v) => window.scrollTo({ top: v, behavior: 'smooth' }), y);
const scrollInto = (page: Page, testId: string) => page.evaluate((id) => document.querySelector(`[data-testid="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), testId);

/** Capture frames for `seconds` while running `drive` on the wallclock. */
async function capture(page: Page, cdp: CDPSession, dir: string, seconds: number, drive: () => Promise<void>) {
  await mkdir(dir, { recursive: true });
  const frames: Array<{ file: string; ts: number }> = [];
  let seq = 0;
  const onFrame = async (e: { data: string; metadata: { timestamp?: number }; sessionId: number }) => {
    const file = `frame_${String(seq++).padStart(4, '0')}.png`;
    frames.push({ file, ts: e.metadata.timestamp ?? Date.now() / 1000 });
    await writeFile(path.join(dir, file), Buffer.from(e.data, 'base64'));
    cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {});
  };
  cdp.on('Page.screencastFrame', onFrame);
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 1170, maxHeight: 2532, everyNthFrame: 1 });
  const t0 = Date.now();
  await drive();
  const left = t0 + seconds * 1000 - Date.now();
  if (left > 0) await sleep(left);
  else console.warn(`  scene ran ${(-left / 1000).toFixed(1)}s over its ${seconds}s clip`);
  cdp.off('Page.screencastFrame', onFrame);
  await cdp.send('Page.stopScreencast').catch(() => {});
  // frames arrive only when the page changes; the end timestamp lets assemble hold the last one
  const end = frames.length ? frames[0].ts + (Date.now() - t0) / 1000 : 0;
  await writeFile(path.join(dir, 'frames.json'), JSON.stringify({ t0: t0 / 1000, end, fps: FPS, frames }));
  if (frames.length < 10) throw new Error(`only ${frames.length} frames captured`);
  console.log(`  ${frames.length} frames over ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

const scenes = makeScenes({ seed, enterApp, capture, click, scrollTo, scrollInto, sleep, base: BASE });
const clips = await clipSeconds();
const argScenes = (process.argv[2] ? process.argv[2].split(',') : Object.keys(scenes)).filter((s) => s in scenes);
const lang = (process.argv[3] as Lang) || 'de';
const browser = await chromium.launch();
for (const name of argScenes) {
  const label = `tut-${name}-${lang}`;
  console.log(`\n=== recording ${label} (${clips[name]}s) ===`);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: lang === 'de' ? 'de-DE' : 'en-US' });
  const page = await context.newPage();
  try {
    const cdp = await context.newCDPSession(page);
    await scenes[name](page, cdp, path.join(FRAMES_DIR, label), lang, context, clips[name]);
    console.log(`=== ${label} done ===`);
  } catch (err) {
    console.error(`!!! ${label} FAILED:`, err);
    await page.screenshot({ path: path.join(FRAMES_DIR, `${label}-error.png`) }).catch(() => {});
    process.exitCode = 1;
  } finally {
    await context.close();
  }
}
await browser.close();

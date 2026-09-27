/**
 * Landing-page app screenshots (public/screenshots/app-*.webp, shot-*.webp) and the copies the demo
 * video's devices scene uses (demo-video/public/devices/). Rendered from the current
 * app with the demo fixture state, so the landing page never shows an old design
 * again (the 9 Aug set still had the electric blue, orange PRO badge and 7-tab bar).
 *
 * Needs the dev server on http://localhost:5173 (localhost, the store auto-grants Pro
 * there). Run: node scripts/app-screenshots.mjs
 */
import { chromium } from 'playwright';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const BASE = 'http://localhost:5173';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(ROOT, 'public', 'screenshots');
const VIDEO_DEVICES = path.join(ROOT, 'demo-video', 'public', 'devices');
const FIXTURE = path.join(ROOT, 'demo-video', 'fixtures', 'seed-state.json');

// width/height match the <img> attributes in Welcome.tsx
const PHONE = { viewport: { width: 340, height: 736 }, scale: 2, mobile: true };

/** Click by data-testid through the DOM (the first match; nav ids exist in both navs). */
const tap = (page, id) => page.evaluate((i) => {
  const el = document.querySelector(`[data-testid="${i}"]`);
  if (!el) throw new Error(`no [data-testid="${i}"]`);
  el.click();
}, id);

// app-* : hero monitor + phone (also used by the demo video's devices scene)
// shot-*: the three phones in "Die App in Aktion"
const SHOTS = [
  { name: 'app-dashboard', viewport: { width: 1280, height: 847 }, scale: 1.25, mobile: false, video: true },
  { name: 'app-mobile', ...PHONE, video: true },
  { name: 'shot-dashboard', ...PHONE },
  {
    name: 'shot-curriculum', ...PHONE,
    prepare: async (page) => {
      await tap(page, 'nav-curriculum');
      await page.waitForTimeout(1800);
      await page.evaluate(() => { const el = document.querySelector('div.overflow-y-auto.overscroll-contain'); if (el) el.scrollTop = 0; window.scrollTo(0, 0); });
    },
  },
  {
    // live drive screen in simulation: route, speed, one logged mistake (the shipped manual log)
    name: 'shot-tracker', ...PHONE,
    prepare: async (page) => {
      await page.addStyleTag({ content: '#_rht_toaster{display:none!important} [data-testid="hud-speed-sign"]{display:none!important}' });
      await tap(page, 'nav-tracker');
      await page.waitForTimeout(1200);
      await tap(page, 'sim-toggle');
      await page.waitForTimeout(400);
      await tap(page, 'start-tracking-btn');
      await page.waitForTimeout(800);
      await tap(page, 'mount-confirmation-checkbox');
      await page.waitForTimeout(200);
      await tap(page, 'confirm-mount-btn');
      await page.waitForTimeout(7000); // map tiles + first sim steps
      await tap(page, 'problem-btn');
      await page.waitForTimeout(700);
      await tap(page, 'manual-mistake-shoulder_check');
      await page.waitForTimeout(4000); // "saved" flash clears
      // the voice-guidance toast sits over the distance line; hide it for the still
      await page.evaluate(() => document.querySelectorAll('div').forEach((d) => {
        if (typeof d.className === 'string' && d.className.includes('mt-48') && /Sprachansage|Voice guidance/.test(d.textContent || '')) d.style.display = 'none';
      }));
    },
  },
];

async function seed(page, lang) {
  const fixture = JSON.parse(await readFile(FIXTURE, 'utf-8'));
  Object.assign(fixture.state, {
    language: lang,
    darkMode: true, // dark shots read better in the monitor and phone frames (founder, 27 Sep)
    activeTab: 'home',
    dashboardIntroPlayed: true,
    hasVisited: true,
  });
  await page.goto(`${BASE}/robots.txt`);
  await page.evaluate((val) => new Promise((resolve, reject) => {
    const open = indexedDB.open('keyval-store');
    open.onupgradeneeded = () => open.result.createObjectStore('keyval');
    open.onsuccess = () => {
      const tx = open.result.transaction('keyval', 'readwrite');
      tx.objectStore('keyval').put(val, 'drivede-storage');
      tx.oncomplete = () => { open.result.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    };
    open.onerror = () => reject(open.error);
  }), JSON.stringify(fixture));
}

const browser = await chromium.launch();
await mkdir(VIDEO_DEVICES, { recursive: true });
for (const lang of ['de', 'en']) {
  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: shot.scale,
      isMobile: shot.mobile,
      hasTouch: shot.mobile,
      locale: lang === 'de' ? 'de-DE' : 'en-US',
    });
    const page = await context.newPage();
    await seed(page, lang);
    await page.goto(`${BASE}/?lang=${lang}&noanalytics`, { waitUntil: 'networkidle' });
    // hasVisited opens the app shell directly; the landing start button only shows otherwise
    await page.getByTestId('welcome-start-btn').click({ timeout: 4000 }).catch(() => undefined);
    await page.getByTestId('nav-home').first().waitFor({ state: 'attached', timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3500); // gauge sweep and card intros settle
    if (shot.prepare) await shot.prepare(page);
    const png = path.join(OUT, `${shot.name}-${lang}.png`);
    await page.screenshot({ path: png });
    const webp = path.join(OUT, `${shot.name}-${lang}.webp`);
    execFileSync('python', ['-c', `from PIL import Image; Image.open(r'${png}').convert('RGB').save(r'${webp}', 'WEBP', quality=82, method=6)`]);
    if (shot.video) await copyFile(webp, path.join(VIDEO_DEVICES, `${shot.name}-${lang}.webp`));
    await (await import('node:fs/promises')).unlink(png);
    console.log(`wrote ${shot.name}-${lang}.webp`);
    await context.close();
  }
}
await browser.close();

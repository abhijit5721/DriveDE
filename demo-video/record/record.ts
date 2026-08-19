/**
 * DriveDE demo footage recorder (DRI-17).
 *
 * Playwright + CDP virtual-time frame stepping (timecut technique):
 * freezes the page clock, then grants 1000/30 ms budgets and captures one
 * PNG per budget — JS timers, rAF, framer-motion AND CSS transitions all
 * advance deterministically. Frames land in frames/<scene>-<lang>/.
 *
 * Prereq: app dev server on http://localhost:5173 (localhost, NOT 127.0.0.1 —
 * the store's auto-Pro check is strict `hostname === 'localhost'`).
 * Run: npm run record [-- tracker,readiness en]
 */
import { chromium, type Page, type CDPSession } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://localhost:5173';
const FPS = 30;
const FRAMES_PER_SCENE = 300; // 10s of output footage per clip
const ROOT = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const FRAMES_DIR = path.join(ROOT, '..', 'frames');
const FIXTURE = path.join(ROOT, '..', 'fixtures', 'seed-state.json');

type Lang = 'de' | 'en';
type SceneName = 'tracker' | 'readiness' | 'curriculum' | 'maneuvers' | 'cockpit';

// ---------- helpers ----------

async function seedState(page: Page, lang: Lang) {
  const fixture = JSON.parse(await readFile(FIXTURE, 'utf-8'));
  fixture.state.language = lang;
  const value = JSON.stringify(fixture);
  await page.goto(`${BASE}/robots.txt`);
  await page.evaluate((val) => {
    return new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('keyval-store');
      open.onupgradeneeded = () => open.result.createObjectStore('keyval');
      open.onsuccess = () => {
        const tx = open.result.transaction('keyval', 'readwrite');
        tx.objectStore('keyval').put(val, 'drivede-storage');
        tx.oncomplete = () => { open.result.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
      open.onerror = () => reject(open.error);
    });
  }, value);
}

async function enterApp(page: Page, lang: Lang) {
  await page.goto(`${BASE}/?lang=${lang}`, { waitUntil: 'networkidle' });
  const start = page.getByTestId('welcome-start-btn');
  await start.waitFor({ state: 'visible', timeout: 15000 });
  await start.click(); // isReturningUser => straight to the app shell
  await page.getByTestId('nav-home').first().waitFor({ state: 'attached', timeout: 15000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

/** Dispatch a DOM click directly — Playwright's actionability checks hang
 *  under paused virtual time (they wait on rAF ticks that never come). */
async function evalClick(page: Page, testId: string) {
  await page.evaluate((id) => {
    const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
    if (!el) throw new Error(`evalClick: [data-testid="${id}"] not found`);
    el.click();
  }, testId);
}

async function freeze(cdp: CDPSession) {
  await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' });
}

type VtPolicy = 'advance' | 'pauseIfNetworkFetchesPending';

/** Grant one frame's budget of virtual time; resolves when it expires.
 *  Falls back after a real-time timeout so a stuck network fetch can't
 *  stall the whole recording. Default policy 'advance' ignores pending
 *  fetches (app screens fire Supabase/analytics requests that otherwise
 *  stall every frame); the tracker scene opts into the pause policy so
 *  map tiles stay deterministic. */
function stepVirtualTime(cdp: CDPSession, budgetMs: number, policy: VtPolicy = 'advance'): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
    timer = setTimeout(() => {
      console.warn('  [warn] virtual time budget stalled; forcing advance');
      finish();
    }, 3000);
    cdp.once('Emulation.virtualTimeBudgetExpired', finish);
    cdp.send('Emulation.setVirtualTimePolicy', { policy, budget: budgetMs }).catch(finish);
  });
}

/** Frame capture via Page.startScreencast — the renderer PUSHES frames as it
 *  produces them, so nothing ever blocks waiting for a screenshot (polling
 *  Page.captureScreenshot hangs intermittently under paused virtual time
 *  whenever a persistent rAF loop keeps the compositor dirty).
 *  After each virtual-time grant we wait briefly for a fresh frame; if none
 *  arrives the screen didn't change and the previous frame is reused. */
async function captureFrames(
  page: Page,
  cdp: CDPSession,
  dir: string,
  count: number,
  budgetMs: number,
  policy: VtPolicy = 'advance',
  perFrame?: (frame: number) => Promise<void>,
  freshWaitMs = 300,
) {
  await mkdir(dir, { recursive: true });

  let latest: Buffer | null = null;
  let frameSeq = 0;
  const waiters: Array<() => void> = [];
  const onFrame = (e: { data: string; sessionId: number }) => {
    latest = Buffer.from(e.data, 'base64');
    frameSeq++;
    cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {});
    while (waiters.length) waiters.shift()!();
  };
  cdp.on('Page.screencastFrame', onFrame);
  await cdp.send('Page.startScreencast', {
    format: 'png',
    maxWidth: 1170,
    maxHeight: 2532,
    everyNthFrame: 1,
  });

  const waitForNewFrame = (since: number, timeoutMs: number) =>
    new Promise<void>((resolve) => {
      if (frameSeq > since) return resolve();
      const t = setTimeout(resolve, timeoutMs);
      waiters.push(() => { clearTimeout(t); resolve(); });
    });

  try {
    // screencast sends an initial frame on start
    await waitForNewFrame(0, 3000);
    for (let i = 0; i < count; i++) {
      if (perFrame) await perFrame(i);
      const before = frameSeq;
      await stepVirtualTime(cdp, budgetMs, policy);
      await waitForNewFrame(before, freshWaitMs);
      if (!latest) throw new Error('screencast produced no frames');
      await writeFile(path.join(dir, `frame_${String(i).padStart(4, '0')}.png`), latest);
      if (i % 60 === 0) console.log(`  frame ${i}/${count}`);
    }
  } finally {
    cdp.off('Page.screencastFrame', onFrame);
    await cdp.send('Page.stopScreencast').catch(() => {});
  }
}

/** Exact-sync variant for gameplay scenes: after each virtual-time step the
 *  frame is fetched with Page.captureScreenshot (1:1 with DOM state). The
 *  screencast stays on purely as a fallback source if a screenshot call
 *  hangs (it can, under persistent rAF — not the case on the trainer page,
 *  but never block the run on that assumption). */
async function captureFramesExact(
  page: Page,
  cdp: CDPSession,
  dir: string,
  count: number,
  budgetMs: number,
  perFrame?: (frame: number) => Promise<void>,
) {
  await mkdir(dir, { recursive: true });
  let latest: Buffer | null = null;
  const onFrame = (e: { data: string; sessionId: number }) => {
    latest = Buffer.from(e.data, 'base64');
    cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {});
  };
  cdp.on('Page.screencastFrame', onFrame);
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 1170, maxHeight: 2532, everyNthFrame: 1 });
  let fallbacks = 0;
  try {
    for (let i = 0; i < count; i++) {
      if (perFrame) await perFrame(i);
      await stepVirtualTime(cdp, budgetMs, 'advance');
      const shot = await Promise.race([
        cdp.send('Page.captureScreenshot', { format: 'png' }).then((r) => Buffer.from(r.data, 'base64')),
        new Promise<null>((res) => setTimeout(() => res(null), 1500)),
      ]);
      const buf = shot ?? latest;
      if (!buf) throw new Error('no frame available');
      if (!shot) fallbacks++;
      await writeFile(path.join(dir, `frame_${String(i).padStart(4, '0')}.png`), buf);
      if (i % 60 === 0) console.log(`  frame ${i}/${count}`);
    }
  } finally {
    cdp.off('Page.screencastFrame', onFrame);
    await cdp.send('Page.stopScreencast').catch(() => {});
    if (fallbacks) console.warn(`  [warn] ${fallbacks}/${count} frames used stale screencast fallback`);
  }
}

// ---------- scenes ----------

const scenes: Record<SceneName, (page: Page, cdp: CDPSession, dir: string) => Promise<void>> = {
  /** Live GPS tracking in sim mode: moving map, speed HUD, mistake toasts. */
  async tracker(page, cdp, dir) {
    // automatic mistake detection is not enabled in production: hide the
    // sim's detection UI (toasts + speed-limit sign) so the demo only shows
    // shipped behavior (route recording + speed readout)
    await page.addStyleTag({ content: '#_rht_toaster{display:none!important} [data-testid="hud-speed-sign"]{display:none!important}' });
    await evalClick(page, 'nav-tracker');
    await page.waitForTimeout(1200);
    await evalClick(page, 'sim-toggle');
    await page.waitForTimeout(400);
    await evalClick(page, 'start-tracking-btn');
    await page.waitForTimeout(600);
    // device-mount safety modal (isDeviceMounted is never persisted)
    await evalClick(page, 'mount-confirmation-checkbox');
    await page.waitForTimeout(200);
    await evalClick(page, 'confirm-mount-btn');
    // HUD + Leaflet: let tiles load and the sim take its first steps in REAL time
    await page.waitForTimeout(6000);
    await freeze(cdp);
    // 3x time compression: 300 frames x 100ms = 30s of sim (~20 mock points, 4 scripted mistakes)
    await captureFrames(page, cdp, dir, FRAMES_PER_SCENE, 100, 'pauseIfNetworkFetchesPending');
  },

  /** Exam-readiness gauge sweeping to 74% — captured from frame 0. */
  async readiness(page, cdp, dir) {
    // fixture parks activeTab on 'finance'; freeze BEFORE navigating home
    await page.waitForTimeout(1000);
    await freeze(cdp);
    await evalClick(page, 'nav-home');
    await captureFrames(page, cdp, dir, FRAMES_PER_SCENE, 1000 / FPS);
  },

  /** Curriculum quest path scrolling smoothly. The scroll is driven from
   *  Node between frames — an in-page infinite rAF loop keeps the compositor
   *  perpetually dirty under paused virtual time and hangs captureScreenshot. */
  async curriculum(page, cdp, dir) {
    await evalClick(page, 'nav-curriculum');
    await page.waitForTimeout(1800); // mount + quest-mode auto scrollIntoView (350ms) settles
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>('div.overflow-y-auto.overscroll-contain');
      if (!el) throw new Error('curriculum scroll container not found');
      el.scrollTop = 0;
    });
    await freeze(cdp);
    await captureFrames(page, cdp, dir, FRAMES_PER_SCENE, 1000 / FPS, 'advance', async (i) => {
      await page.evaluate((y) => {
        const el = document.querySelector<HTMLElement>('div.overflow-y-auto.overscroll-contain')!;
        el.scrollTop = y;
      }, i * 8);
    });
  },

  /** Cockpit trainer gameplay for the vertical Short (GRO-5 video #11):
   *  attempt 1 dumps the clutch and stalls, attempt 2 moves off cleanly and
   *  shifts to 2nd. Driven entirely by synthetic keyboard events at scripted
   *  frame numbers, so the stall lands at a deterministic timestamp for the
   *  Remotion caption/SFX timeline. ~23s at true speed. */
  async cockpit(page, cdp, dir) {
    // navigate: curriculum -> list view -> chapter 1 -> basics-2 (manual)
    await evalClick(page, 'nav-curriculum');
    await page.waitForTimeout(1500);
    await evalClick(page, 'view-list');
    await page.waitForTimeout(600);
    const lessonVisible = await page.evaluate(() => !!document.querySelector('[data-testid="lesson-basics-2"]'));
    if (!lessonVisible) {
      await evalClick(page, 'chapter-chapter-1');
      await page.waitForTimeout(400);
    }
    await evalClick(page, 'lesson-basics-2');
    await page.waitForTimeout(1800);
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="cockpit-step"]');
      if (!el) throw new Error('cockpit trainer not mounted');
      el.scrollIntoView({ block: 'start' });
    });
    await page.waitForTimeout(600);

    const key = (k: string, type: 'keydown' | 'keyup' = 'keydown') =>
      page.evaluate(([kk, tt]) => {
        window.dispatchEvent(new KeyboardEvent(tt as string, { key: kk as string, bubbles: true }));
      }, [k, type]);

    // frame-indexed action script (30fps, real-time budgets)
    const actions = new Map<number, Array<() => Promise<unknown>>>();
    const at = (frame: number, fn: () => Promise<unknown>) => {
      const list = actions.get(frame) ?? [];
      list.push(fn);
      actions.set(frame, list);
    };
    const rapid = (from: number, count: number, k: string) => {
      for (let i = 0; i < count; i++) at(from + i, () => key(k));
    };

    // --- attempt 1: stall ---
    rapid(30, 13, 'ArrowDown');            // clutch to the floor
    at(48, () => key('b'));                 // hold brake
    at(56, () => key('e'));                 // ignition
    at(96, () => key('1'));                 // 1st gear
    at(104, () => key('b', 'keyup'));       // brake off
    rapid(112, 13, 'ArrowUp');              // dump the clutch, no gas -> stall
    // ~frame 130-190: stall shake + message holds on screen
    // --- attempt 2: clean move-off ---
    rapid(196, 13, 'ArrowDown');            // clutch back down
    at(212, () => key('b'));
    at(220, () => key('e'));                // restart
    at(230, () => key('1'));                // back into 1st (no-op if kept)
    at(238, () => key('b', 'keyup'));
    at(244, () => key(' '));                // gas on (held from here)
    // ease the clutch through the bite point
    rapid(252, 5, 'ArrowUp');               // 100 -> 60 (bite)
    rapid(290, 4, 'ArrowUp');               // 60 -> 28, car creeps
    rapid(320, 4, 'ArrowUp');               // fully out, accelerating
    // shift to 2nd once 1st tops out
    rapid(430, 13, 'ArrowDown');
    at(446, () => key('2'));
    // ease the clutch back out over ~a second — dumping it at 2nd-gear rpm
    // occasionally stalls the sim (a checkpoint once caught exactly that)
    for (let i = 0; i < 13; i++) at(452 + i * 2, () => key('ArrowUp'));
    // cruise in 2nd to the end; release gas late so speed holds
    at(676, () => key(' ', 'keyup'));
    // beat assertions woven into the timeline
    at(80, async () => {
      const st = await readState();
      if (!st.includes('2/6') && !st.includes('3/6')) throw new Error(`beat: engine not running at f80: ${st.slice(0, 100)}`);
    });
    at(165, async () => {
      const st = await readState();
      if (!/stalled|abgew/i.test(st)) throw new Error(`beat: stall missing at f165: ${st.slice(0, 100)}`);
    });
    at(560, async () => {
      const speed = Number(await page.evaluate(() => document.querySelector('[data-testid="cockpit-speed"]')?.textContent ?? 0));
      if (speed < 15) throw new Error(`beat: not driving at f560 (speed ${speed})`);
    });

    const readState = () =>
      page.evaluate(() => {
        const g = (id: string) => document.querySelector(`[data-testid="${id}"]`)?.textContent ?? '';
        return `${g('cockpit-step')} | msg=${g('cockpit-message')} | speed=${g('cockpit-speed')}`;
      });

    // REAL-TIME capture: the frozen-clock technique desyncs badly on this
    // interactive scene (renderer stalls; >50% stale frames). The sim runs on
    // real timers anyway, so record live: schedule the key script on the
    // wallclock, stream screencast frames with timestamps, resample to 30fps
    // in assemble via the frames.json timing manifest.
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
    const frameMs = 1000 / FPS;
    const sorted = [...actions.entries()].sort((a, b) => a[0] - b[0]);
    for (const [frame, fns] of sorted) {
      const due = t0 + frame * frameMs;
      const wait = due - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      for (const fn of fns) await fn();
    }
    // mid-run beat assertions (never trust a silent take)
    // run out the clip to 700 frames of wallclock
    const endWait = t0 + 700 * frameMs - Date.now();
    if (endWait > 0) await new Promise((r) => setTimeout(r, endWait));
    cdp.off('Page.screencastFrame', onFrame);
    await cdp.send('Page.stopScreencast').catch(() => {});
    await writeFile(path.join(dir, 'frames.json'), JSON.stringify({ t0: t0 / 1000, fps: FPS, frames }));

    // validate the story beats from sim state AFTER the drive
    const st = await readState();
    console.log(`  final: ${st.slice(0, 140)}`);
    const final = await page.evaluate(() => Number(document.querySelector('[data-testid="cockpit-speed"]')?.textContent ?? 0));
    if (final < 15) throw new Error(`cockpit final speed ${final} — attempt 2 never got moving`);
    if (frames.length < 200) throw new Error(`only ${frames.length} screencast frames captured`);
  },

  /** 3D maneuver animation (parallel parking) playing. */
  async maneuvers(page, cdp, dir) {
    await evalClick(page, 'nav-maneuvers');
    await page.waitForTimeout(1200);
    // open the "Animierte Anleitungen" player (buttons have aria-labels, no testids)
    const openBtn = page.getByRole('button', { name: /Animation für Einparken öffnen|Open Parallel animation/ }).first();
    await openBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await openBtn.click();
    await page.waitForTimeout(800);
    // play button: the sky-blue (#38BDF8) control in AnimatedManeuver — no testid, find by bg color
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll<HTMLElement>('button'));
      const play = btns.find((b) => {
        const bg = getComputedStyle(b).backgroundColor;
        return bg === 'rgb(56, 189, 248)';
      });
      if (!play) return false;
      play.scrollIntoView({ block: 'center' });
      play.click();
      return true;
    });
    if (!clicked) {
      await page.screenshot({ path: path.join(dir, '..', 'maneuvers-debug.png') });
      throw new Error('maneuvers: play button (#38BDF8) not found — see maneuvers-debug.png');
    }
    await page.waitForTimeout(300);
    await freeze(cdp);
    await captureFrames(page, cdp, dir, FRAMES_PER_SCENE, 1000 / FPS);
  },
};

// ---------- main ----------

const argScenes = (process.argv[2]?.split(',') as SceneName[] | undefined) ?? (Object.keys(scenes) as SceneName[]);
const argLangs = (process.argv[3]?.split(',') as Lang[] | undefined) ?? (['en', 'de'] as Lang[]);

const browser = await chromium.launch();
for (const lang of argLangs) {
  for (const sceneName of argScenes) {
    const label = `${sceneName}-${lang}`;
    console.log(`\n=== recording ${label} ===`);
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: sceneName === 'cockpit' ? 2 : 3,
      isMobile: true,
      hasTouch: true,
      locale: lang === 'de' ? 'de-DE' : 'en-US',
    });
    const page = await context.newPage();
    try {
      await seedState(page, lang);
      await enterApp(page, lang);
      const cdp = await context.newCDPSession(page);
      await scenes[sceneName](page, cdp, path.join(FRAMES_DIR, label));
      console.log(`=== ${label} done ===`);
    } catch (err) {
      console.error(`!!! ${label} FAILED:`, err);
      await page.screenshot({ path: path.join(FRAMES_DIR, `${label}-error.png`) }).catch(() => {});
      process.exitCode = 1;
    } finally {
      await context.close();
    }
  }
}
await browser.close();

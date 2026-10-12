/** Scene bodies of the tutorial recorder; the clip lengths live in src/tutorialClips.json. */
import type { Page, CDPSession, BrowserContext } from 'playwright';
import { readFile } from 'node:fs/promises';

export type Lang = 'de' | 'en';
export type Tools = {
  seed: (page: Page, lang: Lang, overrides?: Record<string, unknown>, fresh?: boolean) => Promise<void>;
  enterApp: (page: Page, lang: Lang) => Promise<void>;
  capture: (page: Page, cdp: CDPSession, dir: string, seconds: number, drive: () => Promise<void>) => Promise<void>;
  click: (page: Page, testId: string) => Promise<void>;
  scrollTo: (page: Page, y: number) => Promise<void>;
  scrollInto: (page: Page, testId: string) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  base: string;
};
export type Scene = (page: Page, cdp: CDPSession, dir: string, lang: Lang, ctx: BrowserContext, secs: number) => Promise<void>;

const ANSWER: Record<Lang, string> = {
  de: 'Ich beobachte früh beide Gehwege und fahre langsam heran. Die Fußgängerin will queren, also halte ich vor dem Zebrastreifen an und lasse sie gehen. Erst wenn der Überweg frei ist, fahre ich weiter.',
  en: 'I watch both pavements early and approach slowly. The pedestrian wants to cross, so I stop before the crossing and let her go. Only when the crossing is clear do I drive on.',
};

export function makeScenes(T: Tools): Record<string, Scene> {
  const { seed, enterApp, capture, click, scrollTo, scrollInto, sleep, base } = T;
  const openSim = async (page: Page) => {
    await page.locator('[data-tour="exam-sim"] button').first().click();
    await page.getByTestId('scenario-zebrastreifen').waitFor({ state: 'visible' });
  };
  /** The Konto tab is a lazy chunk; load it once so the recording never shows the skeleton. */
  const warmAccount = async (page: Page) => {
    await click(page, 'nav-account');
    await page.getByText(/Kosten und Budget|Costs and budget/).first().waitFor({ state: 'visible', timeout: 60000 });
    await click(page, 'nav-home');
    await sleep(800);
  };
  const simScroll = (page: Page, top: number) => page.evaluate((v) => document.querySelector('[data-testid="exam-simulation"]')?.scrollTo({ top: v, behavior: 'smooth' }), top);
  return {
    /** s01: landing hero, scroll a little. Fresh visitor. */
    async landing(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang, {}, true);
      await page.goto(`${base}/?lang=${lang}`, { waitUntil: 'networkidle' });
      await page.getByTestId('cookie-reject-non-essential').click({ timeout: 12000 }).catch(() => console.warn('  cookie banner not seen'));
      await sleep(800);
      await capture(page, cdp, dir, secs, async () => { await sleep(4000); await scrollTo(page, 420); await sleep(5000); await scrollTo(page, 900); await sleep(5000); await scrollTo(page, 0); });
    },
    /** s02: start free, choose the class, land on the dashboard with the first-step card. */
    async start(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang, {}, true);
      await page.goto(`${base}/?lang=${lang}`, { waitUntil: 'networkidle' });
      await page.getByTestId('cookie-reject-non-essential').click({ timeout: 12000 }).catch(() => console.warn('  cookie banner not seen'));
      await sleep(500);
      // the free start signs in anonymously: answer Supabase auth locally so no account is created
      const uid = '00000000-0000-4000-8000-00000000t0t0'.replace('t0t0', '0001');
      const user = { id: uid, aud: 'authenticated', role: 'authenticated', email: '', is_anonymous: true, app_metadata: {}, user_metadata: { own_traffic: true }, created_at: new Date().toISOString() };
      await _ctx.route('**/auth/v1/**', (route) => {
        const url = route.request().url();
        if (url.includes('/auth/v1/signup')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ access_token: 'tutorial', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'tutorial', user }) });
        if (url.includes('/auth/v1/user')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) });
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      });
      await _ctx.route('**/rest/v1/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await capture(page, cdp, dir, secs, async () => {
        await sleep(1200);
        await page.getByTestId('mobile-menu-toggle').click();
        await sleep(1200);
        await page.locator('button:visible', { hasText: /Jetzt kostenlos starten|Get Started Free/i }).first().click();
        await page.getByTestId('license-continue-btn').waitFor({ state: 'visible', timeout: 20000 });
        await sleep(2000);
        await click(page, 'path-standard'); await sleep(1200);
        await scrollInto(page, 'manual-btn'); await sleep(500);
        await click(page, 'manual-btn'); await sleep(1200);
        await scrollInto(page, 'license-continue-btn'); await sleep(400);
        await click(page, 'license-continue-btn');
        await sleep(3500);
        // dark mode for the rest of the recording (fresh accounts start light)
        await page.evaluate(() => { const s = (window as any).__drivedeStore?.getState?.(); if (s && !s.darkMode) s.toggleDarkMode?.(); });
        await sleep(3000);
        await scrollTo(page, 300); await sleep(3000); await scrollTo(page, 0);
      });
    },
    /** s03: the Prüfungssimulation list with the examiner card. */
    async simlist(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang); await enterApp(page, lang);
      // the simulation is a lazy chunk: load it once so the recording never shows "Loading"
      await openSim(page); await click(page, 'exam-simulation-back'); await sleep(800);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(1200);
        await openSim(page);
        await sleep(4500);
        await simScroll(page, 380);
        await sleep(4500);
        await simScroll(page, 0);
      });
    },
    /** s04: step mode on the zebra crossing, one mistake included, then the result. */
    async steps(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang); await enterApp(page, lang);
      await openSim(page);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(800);
        await click(page, 'scenario-zebrastreifen');
        await sleep(2500);
        for (const k of ['s0', 's1', 'm0', 's2', 's3', 's4']) { await scrollInto(page, `card-${k}`); await sleep(350); await click(page, `card-${k}`); await sleep(850); }
        await scrollInto(page, 'steps-check'); await sleep(600);
        await click(page, 'steps-check');
        await sleep(1200);
        await page.evaluate(() => document.querySelector('[data-testid="steps-result"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        await sleep(4000);
        await page.evaluate(() => document.querySelector('[data-testid="exam-simulation"]')?.scrollBy({ top: 420, behavior: 'smooth' }));
      });
    },
    /** s05: free answer typed, the grid, detailed AI feedback (real response from production). */
    async free(page, cdp, dir, lang, ctx, secs) {
      await seed(page, lang); await enterApp(page, lang);
      // the dev server has no /api: answer the probe, and serve a real grading fetched from production
      let real: any = null;
      try {
        const r = await fetch('https://www.drivede.app/api/grade-scenario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenarioId: 'zebrastreifen', answer: ANSWER[lang], language: lang }) });
        real = await r.json();
      } catch { /* offline: the button then shows the unavailable note */ }
      console.log('  AI feedback from production:', real?.ok ? 'ok' : `unavailable ${JSON.stringify(real).slice(0, 120)}`);
      await ctx.route('**/api/grade-scenario', (route) => route.request().method() === 'GET'
        ? route.fulfill({ status: 200, contentType: 'application/json', body: '{"enabled":true}' })
        : route.fulfill({ status: real?.ok ? 200 : 503, contentType: 'application/json', body: JSON.stringify(real?.ok ? real : { ok: false, reason: 'unavailable' }) }));
      await openSim(page);
      await click(page, 'scenario-zebrastreifen');
      await page.getByTestId('mode-write').waitFor({ state: 'visible' });
      await capture(page, cdp, dir, secs, async () => {
        await sleep(600);
        await click(page, 'mode-write');
        await sleep(800);
        await page.getByTestId('scenario-answer').click();
        await page.getByTestId('scenario-answer').pressSequentially(ANSWER[lang], { delay: 24 });
        await sleep(500);
        await click(page, 'scenario-grade');
        await sleep(2000);
        await scrollInto(page, 'competence-grid');
        await sleep(3500);
        await scrollInto(page, 'scenario-ai-btn');
        await sleep(600);
        await click(page, 'scenario-ai-btn');
        await sleep(2000);
        await scrollInto(page, 'scenario-ai');
        await sleep(4000);
      });
    },
    /** s06: the learner's protocol on the list, then the dashboard breakdown. */
    async protocol(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang);
      await page.evaluate(() => localStorage.setItem('drivede-exam-protocol', JSON.stringify({
        zebrastreifen: { ratio: 1, at: Date.now(), areas: { observation: { got: 3, total: 3 }, speed: { got: 2, total: 2 }, position: { got: 1, total: 1 } } },
        'rechts-vor-links': { ratio: 0.67, at: Date.now(), areas: { observation: { got: 3, total: 4 }, speed: { got: 1, total: 2 } } },
        kreisverkehr: { ratio: 0.83, at: Date.now(), areas: { observation: { got: 2, total: 2 }, speed: { got: 2, total: 2 }, communication: { got: 1, total: 2 } } },
      })));
      await enterApp(page, lang);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(800);
        await openSim(page);
        await sleep(5500);
        await click(page, 'exam-simulation-back');
        await sleep(1200);
        await page.locator('[data-tour="readiness"]').getByText(/\d+%$/).first().click();
        await sleep(1800);
        await page.evaluate(() => document.querySelector('[data-testid="dashboard-protocol"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await sleep(5000);
      });
    },
    /** s07: Manöver tab, the parallel parking animation. */
    async maneuvers(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang); await enterApp(page, lang);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(600);
        await click(page, 'nav-maneuvers');
        await sleep(2500);
        const openBtn = page.getByRole('button', { name: /Animation für .*öffnen|Open .* animation/ }).first();
        await openBtn.scrollIntoViewIfNeeded(); await sleep(600);
        await openBtn.click();
        await sleep(1000);
        await page.evaluate(() => { const b = document.querySelector<HTMLElement>('[data-testid="maneuver-play"]'); b?.scrollIntoView({ block: 'center' }); b?.click(); });
        await sleep(9000);
      });
    },
    /** s08: a drive in simulation mode, then stop and the save sheet. */
    async tracker(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang); await enterApp(page, lang);
      await page.addStyleTag({ content: '#_rht_toaster{display:none!important}' });
      await click(page, 'nav-tracker');
      await sleep(1500);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(800);
        await click(page, 'sim-toggle'); await sleep(500);
        const startBtn = page.getByRole('button', { name: /Tracking starten|Start Live/i }).first();
        await startBtn.scrollIntoViewIfNeeded(); await sleep(500);
        await startBtn.click(); await sleep(800);
        await click(page, 'mount-confirmation-checkbox'); await sleep(300);
        await click(page, 'confirm-mount-btn');
        await sleep(8000);
        await click(page, 'stop-tracking-btn');
        await sleep(6000);
      });
    },
    /** s09: the history with past drives, then the costs tab. */
    async history(page, cdp, dir, lang, _ctx, secs) {
      await seed(page, lang); await enterApp(page, lang);
      await warmAccount(page);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(600);
        await click(page, 'nav-tracker');
        await sleep(1200);
        await click(page, 'tab-history');
        await sleep(3500);
        await scrollTo(page, 500); await sleep(2500);
        await click(page, 'nav-account');
        await sleep(1200);
        await page.getByText(/Kosten und Budget|Costs and budget/).first().click();
        await sleep(4500);
      });
    },
    /** s10: secure the account, then the Pro passes. */
    async account(page, cdp, dir, lang, _ctx, secs) {
      if (!base.includes('127.0.0.1')) throw new Error('account scene needs TUT_BASE=http://127.0.0.1:5173 (localhost forces Pro, hiding the trial)');
      await seed(page, lang, { isPremium: false, trialStartedAt: new Date().toISOString(), trialEndsAt: new Date(Date.now() + 6 * 864e5).toISOString() });
      await enterApp(page, lang);
      await warmAccount(page);
      // the paywall is a lazy chunk too: open it once, then come back fresh
      await click(page, 'trial-banner'); await sleep(5000);
      await enterApp(page, lang);
      await capture(page, cdp, dir, secs, async () => {
        await sleep(600);
        await click(page, 'nav-account');
        await sleep(5500);
        await scrollTo(page, 420); await sleep(2500);
        await click(page, 'nav-home'); await sleep(1000);
        await scrollInto(page, 'trial-banner'); await sleep(2500);
        // the trial ends (while on trial the banner opens nothing, Pro is active): the app
        // shows its "trial ended" moment, and the upgrade button opens the real Pro passes
        await page.evaluate(() => { const s = (window as any).__drivedeStore?.getState?.(); s?.adoptTrial?.({ trialStartedAt: new Date(Date.now() - 8 * 864e5).toISOString(), trialEndsAt: new Date(Date.now() - 864e5).toISOString() }); });
        await sleep(1500);
        await page.getByTestId('trial-ended-upgrade').click({ timeout: 8000 }).catch(() => console.warn('  trial-ended modal not shown'));
        await sleep(7000);
      });
    },
  };
}

export const clipSeconds = async (): Promise<Record<string, number>> => JSON.parse(await readFile(new URL('../src/tutorialClips.json', import.meta.url), 'utf-8'));

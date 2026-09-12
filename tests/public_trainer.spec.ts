import { test, expect, type Page } from '@playwright/test';

/**
 * DRI-44 / DRI-47: the landing-page trainer is playable without an account.
 * A visitor opens it from the hero, completes a round by tapping the cars in
 * priority order, meets the signup prompt only then, and can close or replay.
 * No auth request may be made anywhere in that path.
 */

async function openLanding(page: Page, lang: 'de' | 'en') {
  await page.goto(`/?lang=${lang}`);
  const cookie = page.getByTestId('cookie-accept-all');
  if (await cookie.isVisible({ timeout: 4000 }).catch(() => false)) {
    await cookie.click();
  }
}

/**
 * Scenario 1 is plain right-before-left: the car from the right (blue) goes
 * first, then red. The two taps are deliberately immediate: since DRI-48 a
 * tap during the 800 ms drive-off is queued and played next, not dropped, so a
 * confident learner tapping fast must still complete the round. Since DRI-51
 * the round ends on the result card, there is no separate continue button.
 */
/** The three public intersections in play order with the correct tap sequence for each. */
const ROUND: Array<[scenarioId: string, taps: string[]]> = [
  ['public-rvl', ['car-blue-car', 'car-red-car']],
  ['public-bending', ['car-blue-car', 'car-red-car']],
  ['public-stop', ['car-red-car', 'car-blue-car']],
];

async function completeRound(page: Page) {
  for (const [scenarioId, taps] of ROUND) {
    // The trainer auto-advances after a green flash; wait for the next intersection to be on screen.
    await expect(page.locator(`[data-testid="simulator-svg"][data-scenario="${scenarioId}"]`)).toBeVisible({ timeout: 5000 });
    for (const car of taps) await page.getByTestId(car).click();
  }
  await expect(page.getByTestId('public-trainer-result')).toBeVisible({ timeout: 5000 });
}

test('hero leads with the trainer CTA and keeps the account entry in the header', async ({ page }) => {
  await openLanding(page, 'en');
  const tryBtn = page.getByTestId('welcome-try-btn');
  await expect(tryBtn).toBeVisible();
  await expect(tryBtn).toContainText(/right-before-left trainer/i);
  // The old hero start button moved into the header; the test id stays reachable.
  await expect(page.getByTestId('welcome-start-btn')).toBeAttached();
  await expect(page.getByText('Free, no account needed, done in two minutes.')).toBeVisible();
});

test('German hero copy', async ({ page }) => {
  await openLanding(page, 'de');
  await expect(page.getByTestId('welcome-try-btn')).toContainText('Rechts-vor-links Trainer ausprobieren');
  await expect(page.getByText('Kostenlos, ohne Anmeldung, in zwei Minuten erledigt.')).toBeVisible();
});

test('a visitor completes a round with no account and only then sees the signup prompt', async ({ page }) => {
  const authCalls: string[] = [];
  page.on('request', (r) => {
    if (/\/auth\/v1\//.test(r.url())) authCalls.push(r.url());
  });

  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();

  const overlay = page.getByTestId('public-trainer');
  await expect(overlay).toBeVisible();
  await expect(page.getByTestId('simulator-svg')).toBeVisible();
  // Nothing about the account before the round
  await expect(page.getByTestId('public-trainer-prompt')).toHaveCount(0);

  await completeRound(page);

  // DRI-50: one question first, the exam date. Skipping it is a single tap.
  const examStep = page.getByTestId('public-trainer-exam');
  await expect(examStep).toBeVisible();
  await expect(examStep).toContainText('When is your practical exam?');
  await expect(page.getByTestId('exam-continue')).toBeDisabled();
  await expect(page.getByTestId('public-trainer-prompt')).toHaveCount(0);
  await page.getByTestId('exam-not-booked').click();

  const prompt = page.getByTestId('public-trainer-prompt');
  await expect(prompt).toBeVisible();
  await expect(page.getByTestId('public-trainer-countdown')).toHaveCount(0);
  await expect(page.getByTestId('public-trainer-plan')).toContainText('10 trainers still open');
  await expect(page.getByTestId('public-trainer-signup')).toContainText('Continue for free');

  // "One more round" resets the trainer instead of asking for an account again
  await page.getByTestId('public-trainer-again').click();
  await expect(prompt).toHaveCount(0);
  await expect(page.getByTestId('simulator-svg')).toBeVisible();

  // The second round goes straight to the prompt, the question is not repeated
  await completeRound(page);
  await expect(page.getByTestId('public-trainer-exam')).toHaveCount(0);
  await expect(prompt).toBeVisible();

  expect(authCalls, 'the anonymous trainer path must not call auth').toEqual([]);
});

test('the signup CTA after a round opens the normal signup flow', async ({ page }) => {
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  await completeRound(page);
  await page.getByTestId('exam-not-booked').click();
  await page.getByTestId('public-trainer-signup').click();
  await expect(page.getByTestId('public-trainer')).toHaveCount(0);
  await expect(page.getByText(/Choose your perfect Pro plan|Create your account|Sign up/i).first()).toBeVisible({ timeout: 10000 });
});

test('an exam date becomes a countdown, a weekly plan and travels into the app state (DRI-50)', async ({ page }) => {
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  await completeRound(page);

  // 30 days from today, formatted for the native date input
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await page.getByTestId('exam-date-input').fill(iso);
  await expect(page.getByTestId('exam-continue')).toBeEnabled();
  await page.getByTestId('exam-continue').click();

  await expect(page.getByTestId('public-trainer-countdown')).toHaveText('30 days until your exam.');
  // 10 trainers left over 4.3 weeks -> 3 a week
  await expect(page.getByTestId('public-trainer-plan')).toContainText('At 3 a week you finish before the date.');
  await expect(page.getByText('Keep your plan and countdown?')).toBeVisible();
  await page.getByTestId('public-trainer-signup').click();

  // The date is now in the persisted store (idb-keyval, IndexedDB) so the dashboard can count down after login
  await expect.poll(async () =>
    page.evaluate(() => new Promise<string | null>((resolve) => {
      const open = indexedDB.open('keyval-store');
      open.onerror = () => resolve(null);
      open.onsuccess = () => {
        const db = open.result;
        if (!db.objectStoreNames.contains('keyval')) return resolve(null);
        const req = db.transaction('keyval').objectStore('keyval').get('drivede-storage');
        req.onerror = () => resolve(null);
        req.onsuccess = () => {
          const raw = req.result as string | undefined;
          resolve(raw ? JSON.parse(raw).state?.examDate ?? null : null);
        };
      };
    }))
  ).toBe(iso);
});

test('result card: own numbers at once, comparison line when the API answers, no card before the round (DRI-51)', async ({ page }) => {
  const posted: any[] = [];
  await page.route('**/api/trainer-result', async (route) => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, total: 250, percentile: 61 }) });
  });

  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  await expect(page.getByTestId('public-trainer-result')).toHaveCount(0);
  await completeRound(page);

  await expect(page.getByTestId('public-trainer-score')).toHaveText('6 of 6 correct');
  await expect(page.getByTestId('public-trainer-time')).toHaveText(/^\d+\.\d seconds$/);
  await expect(page.getByTestId('public-trainer-mistake')).toContainText('No mistakes.');
  // Flawless: the card teaches the last intersection's rule
  await expect(page.getByTestId('public-trainer-mistake')).toContainText('STOP sign');
  await expect(page.getByTestId('public-trainer-percentile')).toHaveText('Faster than 61% of learners here.');

  expect(posted).toHaveLength(1);
  expect(posted[0]).toEqual({ scenarioId: 'set-3-public-rvl', cars: 6, wrongTaps: 0, durationMs: expect.any(Number) });
  expect(Object.keys(posted[0]).sort()).toEqual(['cars', 'durationMs', 'scenarioId', 'wrongTaps']);
});

test('result card explains the mistake with the exam consequence after a wrong tap (DRI-51)', async ({ page }) => {
  await page.route('**/api/trainer-result', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, total: 3, percentile: null }) }));
  await openLanding(page, 'de');
  await page.getByTestId('welcome-try-btn').click();
  await expect(page.getByTestId('simulator-progress')).toHaveText('Kreuzung 1 von 3');
  // Red first is wrong at the first intersection: blue comes from the right
  await page.getByTestId('car-red-car').click();
  await completeRound(page);

  await expect(page.getByTestId('public-trainer-score')).toHaveText('6 von 7 richtig');
  await expect(page.getByTestId('public-trainer-time')).toHaveText(/^\d+,\d Sekunden$/);
  const mistake = page.getByTestId('public-trainer-mistake');
  await expect(mistake).toContainText('Dein Fehler, erklärt');
  await expect(mistake).toContainText('Rechts vor Links');
  await expect(mistake).toContainText('In der Prüfung beendet dieser Fehler die Fahrt und kostet rund 600 Euro.');
  // Only one intersection had a mistake, so no "further intersections" line
  await expect(mistake).not.toContainText('weitere');
  // Under 200 rows: time only, no percentile
  await expect(page.getByTestId('public-trainer-percentile')).toHaveCount(0);
  // The exam question sits under the card
  await expect(page.getByTestId('public-trainer-exam')).toBeVisible();
});

test('a round runs through all three intersections with a flash between them (DRI-51)', async ({ page }) => {
  await page.route('**/api/trainer-result', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, total: 1, percentile: null }) }));
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();

  await expect(page.getByTestId('simulator-progress')).toHaveText('Intersection 1 of 3');
  // No manual scenario tabs in the public trainer
  await expect(page.getByTestId('scenario-switch-1')).toHaveCount(0);

  await page.getByTestId('car-blue-car').click();
  await page.getByTestId('car-red-car').click();
  await expect(page.getByTestId('simulator-next-flash')).toContainText('Correct! Next intersection.');
  await expect(page.getByTestId('simulator-progress')).toHaveText('Intersection 2 of 3');
  await expect(page.getByTestId('public-trainer-result')).toHaveCount(0);

  // Wrong tap at the second and third intersections: two mistakes, one explained, the other counted
  await page.getByTestId('car-red-car').click();
  await page.getByTestId('car-blue-car').click();
  await page.getByTestId('car-red-car').click();
  await expect(page.getByTestId('simulator-progress')).toHaveText('Intersection 3 of 3');
  await page.getByTestId('car-blue-car').click();
  await page.getByTestId('car-red-car').click();
  await page.getByTestId('car-blue-car').click();

  await expect(page.getByTestId('public-trainer-result')).toBeVisible({ timeout: 5000 });
  await expect(page.getByTestId('public-trainer-score')).toHaveText('6 of 8 correct');
  const mistake = page.getByTestId('public-trainer-mistake');
  await expect(mistake).toContainText('bending priority road');
  await expect(mistake).toContainText('One more intersection also had a wrong tap.');
});

test('share button renders the result card image and copies the caption when Web Share is unavailable (DRI-54)', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'download interception is flaky on WebKit; the share sheet path is checked on a real phone');
  await page.route('**/api/trainer-result', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, total: 250, percentile: 61 }) }));
  // No Web Share API, capture clipboard writes
  await page.addInitScript(() => {
    // @ts-expect-error test stub
    delete navigator.share;
    (window as any).__copied = [];
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async (s: string) => { (window as any).__copied.push(s); } }, configurable: true });
  });
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  await completeRound(page);

  const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
  await page.getByTestId('public-trainer-share').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('drivede-result.png');
  const path = await download.path();
  const { size } = await import('node:fs').then((fs) => fs.promises.stat(path!));
  expect(size).toBeGreaterThan(20000);

  await expect(page.getByTestId('public-trainer-share-hint')).toHaveText('Image saved, text copied. Paste it into WhatsApp.');
  const copied = await page.evaluate(() => (window as any).__copied as string[]);
  expect(copied).toHaveLength(1);
  expect(copied[0]).toMatch(/^Right before left, roundabout, stop sign: 6 of 6 correct in \d+\.\d seconds\. Can you beat that\? https:\/\/drivede\.app\/\?utm_source=share/);
});

test('German exam-date step', async ({ page }) => {
  await openLanding(page, 'de');
  await page.getByTestId('welcome-try-btn').click();
  await completeRound(page);
  await expect(page.getByTestId('public-trainer-exam')).toContainText('Wann ist deine praktische Prüfung?');
  await expect(page.getByTestId('exam-not-booked')).toHaveText('Noch nicht gebucht');
  await page.getByTestId('exam-not-booked').click();
  await expect(page.getByText('Ergebnis speichern und weiterüben?')).toBeVisible();
});

test('close button and Escape both close the trainer and restore scrolling', async ({ page }) => {
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  await expect(page.getByTestId('public-trainer')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  await page.getByTestId('public-trainer-close').click();
  await expect(page.getByTestId('public-trainer')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');

  await page.getByTestId('welcome-try-btn').click();
  await expect(page.getByTestId('public-trainer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('public-trainer')).toHaveCount(0);
});

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
 * confident learner tapping fast must still complete the round.
 */
async function completeRound(page: Page) {
  await page.getByTestId('car-blue-car').click();
  await page.getByTestId('car-red-car').click();
  const cont = page.getByTestId('simulator-continue-btn');
  await expect(cont).toBeVisible({ timeout: 5000 });
  return cont;
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

  const cont = await completeRound(page);
  await cont.click();

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
  const cont2 = await completeRound(page);
  await cont2.click();
  await expect(page.getByTestId('public-trainer-exam')).toHaveCount(0);
  await expect(prompt).toBeVisible();

  expect(authCalls, 'the anonymous trainer path must not call auth').toEqual([]);
});

test('the signup CTA after a round opens the normal signup flow', async ({ page }) => {
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  const cont = await completeRound(page);
  await cont.click();
  await page.getByTestId('exam-not-booked').click();
  await page.getByTestId('public-trainer-signup').click();
  await expect(page.getByTestId('public-trainer')).toHaveCount(0);
  await expect(page.getByText(/Choose your perfect Pro plan|Create your account|Sign up/i).first()).toBeVisible({ timeout: 10000 });
});

test('an exam date becomes a countdown, a weekly plan and travels into the app state (DRI-50)', async ({ page }) => {
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  const cont = await completeRound(page);
  await cont.click();

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

test('German exam-date step', async ({ page }) => {
  await openLanding(page, 'de');
  await page.getByTestId('welcome-try-btn').click();
  const cont = await completeRound(page);
  await cont.click();
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

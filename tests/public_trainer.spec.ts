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
 * first, then red. The simulator locks input for ~800 ms while a car drives
 * off, and a tap during that window is dropped, so the second tap waits for
 * the lock and retries until the success card appears.
 */
async function completeRound(page: Page) {
  await page.getByTestId('car-blue-car').click();
  await page.waitForTimeout(1000);
  const cont = page.getByTestId('simulator-continue-btn');
  for (let attempt = 0; attempt < 4; attempt++) {
    // Once the success card is up it covers the cars, so never click again after it appears.
    await page.getByTestId('car-red-car').click({ trial: false, timeout: 5000 }).catch(() => {});
    // isVisible() returns immediately; waitFor actually gives the 800 ms animation time to finish.
    const shown = await cont.waitFor({ state: 'visible', timeout: 2500 }).then(() => true).catch(() => false);
    if (shown) return cont;
  }
  await expect(cont).toBeVisible();
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

  const prompt = page.getByTestId('public-trainer-prompt');
  await expect(prompt).toBeVisible();
  await expect(page.getByTestId('public-trainer-signup')).toBeVisible();

  // "One more round" resets the trainer instead of asking for an account again
  await page.getByTestId('public-trainer-again').click();
  await expect(prompt).toHaveCount(0);
  await expect(page.getByTestId('simulator-svg')).toBeVisible();

  expect(authCalls, 'the anonymous trainer path must not call auth').toEqual([]);
});

test('the signup CTA after a round opens the normal signup flow', async ({ page }) => {
  await openLanding(page, 'en');
  await page.getByTestId('welcome-try-btn').click();
  const cont = await completeRound(page);
  await cont.click();
  await page.getByTestId('public-trainer-signup').click();
  await expect(page.getByTestId('public-trainer')).toHaveCount(0);
  await expect(page.getByText(/Choose your perfect Pro plan|Create your account|Sign up/i).first()).toBeVisible({ timeout: 10000 });
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

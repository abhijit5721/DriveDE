import { test, expect, type Page } from '@playwright/test';

/**
 * Onboarding tour (26 Sep founder report): it opened together with the cookie banner,
 * and step 2 showed only the dark scrim with no card, so nobody could get past it.
 * The tour now waits for the cookie choice and the privacy consent and every step shows a card with Weiter.
 */
test.describe.configure({ timeout: 120_000 });

type Store = { getState: () => Record<string, (...a: unknown[]) => unknown> };

async function enterBeforeTour(page: Page) {
  await page.goto('/?lang=de');
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expect(page.getByTestId('license-continue-btn')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(4500); // local dev: wait out App's 4 s auth fallback
  await page.evaluate(() => {
    const s = (window as unknown as { __drivedeStore: Store }).__drivedeStore.getState();
    s.setAuthState?.(null, 'signed_in', null, 'local-anon-test', true);
    s.setLicenseType?.('manual');
    s.setLearningPath?.('standard');
    s.setTransmissionType?.('manual');
    s.setAcceptedPrivacy?.(false);
    s.setHasCompletedOnboarding?.(false);
  });
}

test('the tour waits for the privacy consent and the cookie banner, then every step can be passed', async ({ page }) => {
  await enterBeforeTour(page);
  // privacy consent (Deine Daten, deine Kontrolle) is open on top of the cookie banner: no tour yet
  await expect(page.getByTestId('accept-privacy-btn')).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2500);
  await expect(page.getByTestId('tour-skip')).toHaveCount(0);
  await page.getByTestId('privacy-consent-checkbox').check();
  await page.getByTestId('accept-privacy-btn').click();

  // still no tour while the cookie banner is unanswered
  const banner = page.getByTestId('cookie-accept-all');
  await expect(banner).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(2500);
  await expect(page.getByTestId('tour-skip')).toHaveCount(0);
  await banner.click();
  await expect(page.getByTestId('tour-skip')).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: 'Weiter' }).first().click();

  for (let step = 1; step <= 5; step++) {
    const card = page.getByTestId('tour-step-card');
    await expect(card).toBeVisible({ timeout: 5000 });
    await expect(card).toContainText(`${step}`);
    await card.getByRole('button').last().click();
    await page.waitForTimeout(600);
  }
  await expect(page.getByTestId('tour-step-card')).toHaveCount(0, { timeout: 5000 });
  const done = await page.evaluate(() => (window as unknown as { __drivedeStore: { getState: () => { hasCompletedOnboarding: boolean } } }).__drivedeStore.getState().hasCompletedOnboarding);
  expect(done).toBe(true);
});

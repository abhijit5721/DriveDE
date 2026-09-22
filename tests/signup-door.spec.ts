import { test, expect, type Page } from '@playwright/test';

/**
 * DRI-59 / DRI-60: what happens behind every call to action.
 *
 * Free CTAs open the app itself on an anonymous account, no form (DRI-60). In this
 * local build Supabase is not configured, so the app uses the same simulated
 * session the signup form already uses offline; the network path is covered by
 * the fallback logic in Welcome.tsx and by the Supabase project switch.
 * Pricing CTAs still open the account form with the plan preselected, because
 * there the person genuinely intends to buy.
 * Run: npx playwright test tests/signup-door.spec.ts
 */
test.describe.configure({ timeout: 120_000 });

const ROUND: Array<[string, string[]]> = [
  ['public-rvl', ['car-blue-car', 'car-red-car']],
  ['public-bending', ['car-blue-car', 'car-red-car']],
  ['public-stop', ['car-red-car', 'car-blue-car']],
];

async function tap(page: Page, id: string) {
  const el = page.getByTestId(id);
  await el.click({ timeout: 5000 }).catch(() => el.click({ force: true }));
}

async function open(page: Page) {
  await page.goto('/?lang=de');
  await page.getByTestId('cookie-accept-all').click({ timeout: 4000 }).catch(() => undefined);
}

/** The app opened directly: the licence chooser is the first in-app screen, and there is no form. */
async function expectInsideApp(page: Page) {
  await expect(page.getByTestId('license-continue-btn')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('input[type="email"]')).toHaveCount(0);
  await expect(page.getByText(/Wähle deinen passenden Pro-Plan|Erstelle dein Konto/)).toHaveCount(0);
}

test('a "Jetzt kostenlos starten" button opens the app, not a form', async ({ page }) => {
  await open(page);
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expectInsideApp(page);
});

test('the trainer account door opens the app and keeps the exam date', async ({ page }) => {
  await open(page);
  await page.getByTestId('welcome-try-btn').click();
  for (const [scenarioId, taps] of ROUND) {
    await expect(page.locator(`[data-testid="simulator-svg"][data-scenario="${scenarioId}"]`)).toBeVisible({ timeout: 10000 });
    for (const car of taps) await tap(page, car);
  }
  await expect(page.getByTestId('public-trainer-result')).toBeVisible({ timeout: 20000 });
  await page.getByTestId('exam-not-booked').click();
  await page.getByTestId('public-trainer-more').getByRole('button').click();
  await expect(page.getByTestId('public-locked-preview')).toBeVisible();
  await page.getByTestId('public-trainer-signup').click();
  await expectInsideApp(page);
});

test('a pricing CTA still opens the account form with the plan preselected', async ({ page }) => {
  await open(page);
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const buy = page.locator('#pricing button').filter({ hasText: /Pass|wählen|Jetzt|kaufen|starten/i }).first();
  await buy.click();
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
  // the buy path names the plan and its price, which is right: here a purchase is intended
  await expect(page.getByText(/Einmalzahlung/).first()).toBeVisible();
});

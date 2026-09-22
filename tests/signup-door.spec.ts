import { test, expect, type Page } from '@playwright/test';

// Visual check for DRI-59: every free CTA must open the account form, never the Pro price list.
// Run: npx playwright test tests/signup-door.spec.ts --project="Mobile Android (Pixel 7)"
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

/** The screen that appears must be the account form, not the price list. */
async function expectAccountForm(page: Page, shot: string) {
  await expect(page.getByText(/Choose your perfect Pro plan|Wähle deinen|Pro-Plan/i)).toHaveCount(0);
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
  // No price inside the signup card on a free path: nothing is being bought yet.
  // Scoped to the card, because the landing page behind the overlay still has pricing.
  const card = page.locator('div').filter({ has: page.locator('input[type="email"]') }).last();
  await expect(card.getByText(/€\s?\d|\d+[.,]\d\d\s?€/)).toHaveCount(0);
  await expect(page.getByText(/7 Tage Pro, kostenlos|7 days of Pro, free/)).toBeVisible();
  await page.screenshot({ path: `demo-video/${shot}.png` });
}

test('a "Jetzt kostenlos starten" button opens the account form', async ({ page }) => {
  await open(page);
  // whichever one is on screen for this viewport: header on desktop, mid-page on mobile
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expectAccountForm(page, 'door-free-cta');
});

test('the trainer account door opens the account form', async ({ page }) => {
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
  await expectAccountForm(page, 'door-trainer');
});

test('a pricing CTA still opens its own flow', async ({ page }) => {
  await open(page);
  await page.locator('#pricing').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  // pricing buttons pass their step explicitly, so they must be unaffected by the default change
  const buy = page.locator('#pricing button').filter({ hasText: /Pass|wählen|Jetzt|kaufen|starten/i }).first();
  await buy.click();
  await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'demo-video/door-pricing.png' });
});

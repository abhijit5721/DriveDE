import { test, expect, type Page } from '@playwright/test';

/**
 * First-step card on the dashboard (26 Sep): a new user with no lesson and no drive
 * sees one obvious action, the right-of-way exercise; the card goes away after the
 * first finished lesson. Uses the dev-only store hook for the account state.
 */
test.describe.configure({ timeout: 120_000 });

type Store = { getState: () => Record<string, (...a: unknown[]) => unknown> & { selectedLesson?: { id: string } | null } };

async function enterAsNewUser(page: Page) {
  await page.goto('/?lang=de');
  await page.getByTestId('cookie-accept-all').click({ timeout: 4000 }).catch(() => undefined);
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expect(page.getByTestId('license-continue-btn')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(4500); // local dev: wait out App's 4 s auth fallback (see secure-prompt.spec)
  await page.evaluate(() => {
    const s = (window as unknown as { __drivedeStore: Store }).__drivedeStore.getState();
    s.setAuthState?.(null, 'signed_in', null, 'local-anon-test', true);
    s.setLicenseType?.('manual');
    s.setLearningPath?.('standard');
    s.setTransmissionType?.('manual');
    s.setHasCompletedOnboarding?.(true);
    s.setAcceptedPrivacy?.(true);
  });
}

test('a new user sees the first-step card, and it opens the right-of-way exercise', async ({ page }) => {
  await enterAsNewUser(page);
  const card = page.getByTestId('first-step-card');
  await expect(card).toBeVisible({ timeout: 10000 });
  await expect(card.getByText('Starte mit Rechts vor links')).toBeVisible();
  await card.getByTestId('first-step-start').click();
  await expect(page.locator('[data-testid="simulator-svg"], [data-testid^="vorfahrt"]').first()).toBeVisible({ timeout: 15000 });
});

test('the card is gone once the first lesson is done', async ({ page }) => {
  await enterAsNewUser(page);
  await expect(page.getByTestId('first-step-card')).toBeVisible({ timeout: 10000 });
  await page.evaluate(() => { (window as unknown as { __drivedeStore: Store }).__drivedeStore.getState().completeLesson('basics-1'); });
  await page.getByRole('button', { name: /Awesome|Super|Klasse|Weiter/ }).first().click({ timeout: 8000 }).catch(() => undefined);
  await expect(page.getByTestId('first-step-card')).toHaveCount(0, { timeout: 8000 });
});

import { test, expect, type Page } from '@playwright/test';

/**
 * DRI-60 follow-up: the "add an email" sheet for anonymous users.
 * Local dev has no Supabase, so the free CTA creates the same simulated anonymous
 * session the production code falls back to. The sheet must stay away on arrival,
 * show up after the first finished lesson, and stay quiet after "Später".
 * Run: npx playwright test tests/secure-prompt.spec.ts
 */
test.describe.configure({ timeout: 120_000 });

type StoreHandle = { getState: () => Record<string, (...a: unknown[]) => unknown> & { userProgress: { completedLessons: string[] } } };

async function enterAppAnonymously(page: Page) {
  await page.goto('/?lang=de');
  await page.evaluate(() => { try { localStorage.removeItem('drivede_secure_prompt'); } catch { /* ignore */ } });
  await page.getByTestId('cookie-accept-all').click({ timeout: 4000 }).catch(() => undefined);
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expect(page.getByTestId('license-continue-btn')).toBeVisible({ timeout: 15000 });
  // Without Supabase, App's 4 s "auth never answered" fallback resets the session to
  // guest (production answers first). Wait it out, then set the anonymous session
  // again, plus licence, tour and consent: the states the prompt waits for.
  await page.waitForTimeout(4500);
  await page.evaluate(() => {
    const s = (window as unknown as { __drivedeStore: StoreHandle }).__drivedeStore.getState();
    s.setAuthState?.(null, 'signed_in', null, 'local-anon-test', true);
    s.setLicenseType?.('new');
    s.setLearningPath?.('standard');
    s.setTransmissionType?.('manual');
    s.setHasCompletedOnboarding?.(true);
    s.setAcceptedPrivacy?.(true);
  });
}

async function completeFirstLesson(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __drivedeStore: StoreHandle }).__drivedeStore.getState().completeLesson('basics-1');
  });
}

test('no sheet on arrival, sheet after the first lesson, quiet after "Später"', async ({ page }) => {
  await enterAppAnonymously(page);
  await page.waitForTimeout(4000);
  await expect(page.getByTestId('secure-account-sheet')).toHaveCount(0);

  await completeFirstLesson(page);
  const sheet = page.getByTestId('secure-account-sheet');
  // the achievement overlay for the first lesson comes first, the sheet only after it
  const awesome = page.getByRole('button', { name: /Awesome|Super|Klasse|Weiter/ }).first();
  await expect(awesome).toBeVisible({ timeout: 8000 });
  await page.waitForTimeout(3500);
  await expect(sheet).toHaveCount(0);
  await awesome.click();
  await expect(sheet).toBeVisible({ timeout: 8000 });
  await expect(sheet).toHaveAttribute('data-trigger', 'first_lesson');
  await expect(sheet.getByText('Erste Lektion geschafft')).toBeVisible();
  await expect(sheet.getByTestId('secure-sheet-email')).toBeVisible();

  await sheet.getByTestId('secure-sheet-later').click();
  await expect(sheet).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('drivede_secure_prompt') || '{}'));
  expect(saved.shown).toEqual(['first_lesson']);
  expect(typeof saved.lastDismissedAt).toBe('string');

  // a second lesson inside the quiet period asks nothing
  await page.evaluate(() => { (window as unknown as { __drivedeStore: StoreHandle }).__drivedeStore.getState().completeLesson('basics-2'); });
  await page.waitForTimeout(4000);
  await expect(page.getByTestId('secure-account-sheet')).toHaveCount(0);
});

test('the Gast badge in the header leads to the Konto form', async ({ page }) => {
  await enterAppAnonymously(page);
  const badge = page.getByTestId('guest-badge');
  await expect(badge).toBeVisible({ timeout: 8000 });
  await badge.click();
  await expect(page.getByTestId('account-secure-panel')).toBeVisible({ timeout: 8000 });
});

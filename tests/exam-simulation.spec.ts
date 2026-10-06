import { test, expect } from '@playwright/test';

/**
 * Exam simulation on a phone (26 Sep founder report): the back button sat under the
 * iPhone notch, so users had to rotate the phone to leave. The screen is now a
 * full-screen layer with safe-area padding; this checks it covers the viewport and
 * that the back button returns to the dashboard.
 */
test.describe.configure({ timeout: 120_000 });
test('exam simulation fills the phone screen and its back button works', async ({ page }) => {
  await page.goto('/?lang=de');
  await page.getByTestId('cookie-accept-all').click({ timeout: 4000 }).catch(() => undefined);
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expect(page.getByTestId('license-continue-btn')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(4500);
  await page.evaluate(() => {
    const s = (window as any).__drivedeStore.getState();
    s.setAuthState?.(null, 'signed_in', null, 'local-anon-test', true);
    s.setLicenseType?.('manual'); s.setLearningPath?.('standard'); s.setTransmissionType?.('manual');
    s.setHasCompletedOnboarding?.(true); s.setAcceptedPrivacy?.(true);
  });
  await page.waitForTimeout(2000);
  const card = page.locator('[data-tour="exam-sim"] button').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await card.click();
  await page.waitForTimeout(2500);
  const sim = page.getByTestId('exam-simulation');
  await expect(sim).toBeVisible();
  const box = await sim.boundingBox();
  const vp = page.viewportSize()!;
  expect(box!.height).toBeGreaterThanOrEqual(vp.height - 1); // fills the screen, no white half
  const back = page.getByTestId('exam-simulation-back');
  await expect(back).toBeInViewport();
  await back.click();
  await expect(sim).toHaveCount(0);
  await expect(page.locator('[data-tour="exam-sim"]')).toBeVisible();
});

test('an exam situation: type an answer, see covered points, the model answer and the quick check', async ({ page }) => {
  await page.goto('/?lang=de');
  await page.getByTestId('cookie-accept-all').click({ timeout: 4000 }).catch(() => undefined);
  await page.locator('button:visible', { hasText: 'Jetzt kostenlos starten' }).first().click();
  await expect(page.getByTestId('license-continue-btn')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(4500);
  await page.evaluate(() => {
    const s = (window as any).__drivedeStore.getState();
    s.setAuthState?.(null, 'signed_in', null, 'local-anon-test', true);
    s.setLicenseType?.('manual'); s.setLearningPath?.('standard'); s.setTransmissionType?.('manual');
    s.setHasCompletedOnboarding?.(true); s.setAcceptedPrivacy?.(true);
  });
  await page.waitForTimeout(1500);
  await page.locator('[data-tour="exam-sim"] button').first().click();
  await expect(page.getByTestId('scenario-list')).toBeVisible();
  await page.getByTestId('scenario-zebrastreifen').click();
  await page.getByTestId('scenario-answer').fill('Ich fahre langsam heran und beobachte den Gehweg. Wenn sie queren will, halte ich vor dem Zebrastreifen an und warte, bis sie drüben ist.');
  await page.getByTestId('scenario-grade').click();
  await expect(page.getByTestId('scenario-result')).toBeVisible();
  await expect(page.getByTestId('scenario-score')).toContainText('5 von 6');
  await page.getByTestId('minitest-option-1').click();
  await expect(page.getByTestId('scenario-minitest')).toContainText('Richtig');
  // back to the list shows the saved result
  await page.getByTestId('exam-simulation-back').click();
  await expect(page.getByTestId('scenario-zebrastreifen')).toContainText('83%');
});


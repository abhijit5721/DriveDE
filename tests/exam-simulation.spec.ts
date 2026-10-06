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

async function openZebra(page: import('@playwright/test').Page) {
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
  await page.getByTestId('scenario-zebrastreifen').click();
  await page.getByTestId('scenario-answer').fill('Ich fahre langsam heran. Wenn sie queren will, halte ich an.');
  await page.getByTestId('scenario-grade').click();
  await expect(page.getByTestId('scenario-result')).toBeVisible();
}

test('detailed AI feedback: shown on request, adds points the on-device check missed', async ({ page }) => {
  await page.route('**/api/grade-scenario', (route) => route.request().method() === 'GET' ? route.fulfill({ status: 200, contentType: 'application/json', body: '{"enabled":true}' }) : route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, points: [
      { id: 'observe', covered: false }, { id: 'speed', covered: true }, { id: 'yield', covered: true },
      { id: 'position', covered: true }, { id: 'wait', covered: false }, { id: 'recheck', covered: false },
    ], feedback: 'Du fährst langsam heran und lässt sie gehen, gut.', better: 'Ich halte vor dem Zebrastreifen an.' }),
  }));
  await openZebra(page);
  await expect(page.getByTestId('scenario-score')).toContainText('2 von 6');
  await expect(page.getByTestId('scenario-ai')).toContainText('KI-Dienst');
  await page.getByTestId('scenario-ai-btn').click();
  await expect(page.getByTestId('scenario-ai-feedback')).toContainText('lässt sie gehen');
  await expect(page.getByTestId('scenario-ai-feedback')).toContainText('So könntest du es sagen');
  await expect(page.getByTestId('scenario-score')).toContainText('3 von 6');
});

test('detailed AI feedback: a used-up quota keeps the on-device result', async ({ page }) => {
  await page.route('**/api/grade-scenario', (route) => route.request().method() === 'GET' ? route.fulfill({ status: 200, contentType: 'application/json', body: '{"enabled":true}' }) : route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ ok: false, reason: 'limit' }) }));
  await openZebra(page);
  await page.getByTestId('scenario-ai-btn').click();
  await expect(page.getByTestId('scenario-ai-error')).toContainText('aufgebraucht');
  await expect(page.getByTestId('scenario-score')).toContainText('2 von 6');
});

test('without a Groq key the detailed-feedback button is not shown', async ({ page }) => {
  await page.route('**/api/grade-scenario', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{"enabled":false}' }));
  await openZebra(page);
  await expect(page.getByTestId('scenario-ai')).toHaveCount(0);
});

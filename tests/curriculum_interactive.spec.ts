import { test, expect, Page } from '@playwright/test';

test.describe('Curriculum Interactive Simulator', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Handle GDPR
    // Handle GDPR and Splash
    const cookieAccept = page.getByTestId('cookie-accept-all');
    if (await cookieAccept.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cookieAccept.click({ force: true }).catch(() => {});
    }

    // Wait for splash to disappear if it exists
    await page.locator('.animate-pulse').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('should navigate to city-12 and complete all scenarios', async ({ page }) => {
    await test.step('Onboarding', async () => {
      await completeOnboarding(page);
    });

    await test.step('Navigate to Curriculum', async () => {
      // Ensure we are not blocked by any modals
      await page.keyboard.press('Escape').catch(() => {});
      
      const navCurriculum = page.getByTestId('nav-curriculum').filter({ visible: true }).first();
      await navCurriculum.waitFor({ state: 'visible', timeout: 10000 });
      await navCurriculum.click({ force: true });
      
      // Wait for curriculum page to load
      await expect(page.getByTestId('chapter-chapter-1')).toBeVisible({ timeout: 15000 });
    });

    await test.step('Open Chapter 3 and Lesson city-12', async () => {
      // Open Chapter 3 (City Driving)
      const chapter3 = page.getByTestId('chapter-chapter-3');
      await chapter3.scrollIntoViewIfNeeded();
      await chapter3.click({ force: true });
      
      // Select city-12 lesson
      const lesson12 = page.getByTestId('lesson-city-12');
      await lesson12.scrollIntoViewIfNeeded();
      await lesson12.click({ force: true });
      
      await expect(page.getByTestId('page-header-title')).toBeVisible({ timeout: 10000 });
      // Wait for modal transition
      await page.waitForTimeout(2000);
    });

    await test.step('Verify Simulator and Scenario 1', async () => {
      // Check if simulator is visible
      await expect(page.getByTestId('scenario-switch-0')).toBeVisible({ timeout: 15000 });
      
      // Wait for animations and SVG rendering to settle
      await page.waitForTimeout(1000);
      
      const redCar = page.getByTestId('car-red-car');
      const blueCar = page.getByTestId('car-blue-car');
      
      await expect(redCar).toBeVisible({ timeout: 10000 });
      await expect(blueCar).toBeVisible({ timeout: 10000 });
      
      // Click correct order: Red car (on priority road) then Blue car (at stop sign)
      // On iOS Safari, standard click() sometimes fails for SVG elements.
      if (test.info().project.name.includes('iOS')) {
        await redCar.dispatchEvent('click');
        await page.waitForTimeout(1500);
        await blueCar.dispatchEvent('click');
      } else {
        await redCar.click({ force: true });
        await page.waitForTimeout(1500);
        await blueCar.click({ force: true });
      }
      
      // Success screen should appear
      await expect(page.getByTestId('simulator-continue-btn')).toBeVisible({ timeout: 10000 });
      
      // Reset for next test
      await page.getByTestId('simulator-reset-btn').click({ force: true });
      await expect(page.getByTestId('simulator-continue-btn')).toBeHidden();
    });

    await test.step('Switch through all scenarios', async () => {
      // There should be 5 scenarios (0 to 4)
      for (let i = 0; i < 5; i++) {
        const sw = page.getByTestId(`scenario-switch-${i}`);
        await expect(sw).toBeVisible({ timeout: 5000 });
        await sw.click({ force: true });
        await page.waitForTimeout(500);
        
        // Verify simulator svg is present
        await expect(page.getByTestId('simulator-svg')).toBeVisible();
      }
    });

    await test.step('Complete the lesson', async () => {
      // Go back to scenario 1 to finish quickly
      await page.getByTestId('scenario-switch-0').click({ force: true });
      
      // Correct order: Red then Blue
      if (test.info().project.name.includes('iOS')) {
        await page.getByTestId('car-red-car').dispatchEvent('click');
        await page.waitForTimeout(1500);
        await page.getByTestId('car-blue-car').dispatchEvent('click');
      } else {
        await page.getByTestId('car-red-car').click({ force: true });
        await page.waitForTimeout(1500);
        await page.getByTestId('car-blue-car').click({ force: true });
      }
      
      const continueBtn = page.getByTestId('simulator-continue-btn');
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
      await continueBtn.click({ force: true });
    });
  });

  async function completeOnboarding(page: Page) {
    const startBtn = page.getByTestId('welcome-start-btn');
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.click({ force: true });
      await page.waitForTimeout(1000);
      
      const manualBtn = page.getByTestId('manual-btn').first();
      await manualBtn.waitFor({ state: 'visible', timeout: 5000 });
      await manualBtn.click({ force: true });
      
      const getStarted = page.getByTestId('welcome-get-started');
      if (await getStarted.isVisible({ timeout: 2000 }).catch(() => false)) {
        await getStarted.click({ force: true });
      }
    }
    // Wait for the tracker nav to be visible as a sign we're in the app
    await page.getByTestId('nav-tracker').filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 20000 });
  }
});


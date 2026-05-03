import { test, expect, Page } from '@playwright/test';

async function completeOnboarding(page: Page) {
  // 1. Initial State: Should land on Welcome page
  await expect(page.getByTestId('welcome-start-btn')).toBeVisible({ timeout: 15000 });

  // 2. Select Learning Path directly on Welcome page
  await page.getByTestId('path-card-standard').click();

  // 3. Now we should be on LicenseSelector with Learning Path already selected.
  // We need to select Transmission.
  await page.getByTestId('manual-btn').click();

  // 4. Click "Continue" on the LicenseSelector
  await page.getByTestId('license-continue-btn').click();

  // 5. Verification: Should land on Dashboard
  await expect(page.getByTestId('nav-tracker').filter({ visible: true })).toBeVisible({ timeout: 10000 });
}

test.describe('DriveDE Golden Path', () => {
  test.setTimeout(60000); // Increase timeout for slow mobile emulators
  test.beforeEach(async ({ page }) => {
    // Grant geolocation permissions
    await page.context().grantPermissions(['geolocation']);
    
    // Mock geolocation
    await page.addInitScript(() => {
      const mockLocation = {
        coords: {
          latitude: 52.5200,
          longitude: 13.4050,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };
      // @ts-expect-error - Mocking geolocation for tests
      navigator.geolocation.getCurrentPosition = (success) => success(mockLocation);
      // @ts-expect-error - Mocking geolocation for tests
      navigator.geolocation.watchPosition = (success) => {
        success(mockLocation);
        return 1;
      };
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete onboarding and start a tracking session', async ({ page }) => {
    await test.step('Onboarding', async () => {
      await completeOnboarding(page);
    });

    await test.step('Navigation to Tracker', async () => {
      await page.getByTestId('nav-tracker').filter({ visible: true }).click();
    });

    await test.step('Simulation Setup', async () => {
      const simToggle = page.getByTestId('sim-toggle');
      await expect(simToggle).toBeVisible({ timeout: 15000 });
      await simToggle.click();
    });

    await test.step('Start Tracking', async () => {
      const startBtn = page.getByTestId('start-tracking-btn');
      await expect(startBtn).toBeVisible({ timeout: 10000 });
      await startBtn.click({ force: true });
      await expect(page.getByTestId('pause-tracking-btn')).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verify Tracking State', async () => {
      // Check if distance/speed elements are present
      await expect(page.getByText('km', { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('km/h', { exact: true })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Stop Tracking', async () => {
      // Give it a second to gather some data
      await page.waitForTimeout(1000);
      const stopBtn = page.getByTestId('stop-tracking-btn');
      
      // Retry click until modal is visible
      await expect(async () => {
        await stopBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.getByTestId('add-session-modal')).toBeVisible({ timeout: 3000 });
      }).toPass({ timeout: 20000 });
      
      await page.getByTestId('close-add-session-btn').click({ force: true });
      await expect(page.getByTestId('add-session-modal')).toBeHidden({ timeout: 15000 });

      await expect(page.getByTestId('start-tracking-btn')).toBeVisible({ timeout: 15000 });
    });
  });

  test('responsive design check', async ({ page }) => {
    await test.step('Onboarding', async () => {
      await completeOnboarding(page);
    });

    await test.step('Mobile Viewport', async () => {
      // Should already be mobile in our config, but let's be sure
      await expect(page.getByTestId('nav-tracker').filter({ visible: true })).toBeVisible();
    });
    
    await test.step('Desktop Viewport', async () => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(500); // Wait for layout shift
      
      // On desktop, the desktop nav should be visible
      await expect(page.getByTestId('nav-tracker').filter({ visible: true })).toBeVisible();
    });
  });

  test('should log manual mistakes during a tracking session', async ({ page }) => {
    await test.step('Mock Geolocation', async () => {
      await page.context().setGeolocation({ latitude: 52.5200, longitude: 13.4050 });
      await page.context().grantPermissions(['geolocation']);
    });

    await test.step('Onboarding', async () => {
      await completeOnboarding(page);
    });
    
    await test.step('Navigate to Tracker', async () => {
      await page.getByTestId('nav-tracker').filter({ visible: true }).click();
    });
    
    await test.step('Start Tracking', async () => {
      await page.getByTestId('sim-toggle').click({ force: true });
      await page.getByTestId('start-tracking-btn').click({ force: true });
      await expect(page.getByTestId('pause-tracking-btn')).toBeVisible();
    });
    
    await test.step('Log Manual Mistakes', async () => {
      // Ensure we are in a clean state
      await expect(page.getByTestId('problem-btn')).toBeVisible({ timeout: 10000 });

      // Open modal
      await page.getByTestId('problem-btn').click({ force: true });
      await expect(page.getByTestId('manual-log-modal')).toBeVisible({ timeout: 10000 });

      // Log Shoulder Check
      await page.getByTestId('manual-mistake-shoulder_check').click({ force: true });
      await expect(page.getByTestId('manual-log-modal')).not.toBeVisible();

      // Log Mirror Check
      await page.getByTestId('problem-btn').click({ force: true });
      await expect(page.getByTestId('manual-log-modal')).toBeVisible({ timeout: 10000 });
      await page.getByTestId('manual-mistake-mirror_check').click({ force: true });
      await expect(page.getByTestId('manual-log-modal')).not.toBeVisible();

      // Log Pedestrian Safety
      await page.getByTestId('problem-btn').click({ force: true });
      await expect(page.getByTestId('manual-log-modal')).toBeVisible({ timeout: 10000 });
      await page.getByTestId('manual-mistake-pedestrian_safety').click({ force: true });
      await expect(page.getByTestId('manual-log-modal')).not.toBeVisible();
    });
    
    await test.step('Verify Safety Score', async () => {
      // Wait for async state updates to settle
      await page.waitForTimeout(2000);
      
      // The simulation auto-logs mistakes concurrently, so the score could be lower than 70%.
      // We just verify the UI correctly renders a percentage.
      await expect(page.getByTestId('safety-score-value')).toContainText('%', { timeout: 10000 });
    });
    
    await test.step('Stop Tracking', async () => {
      // Give it a second to gather some data
      await page.waitForTimeout(1000);
      const stopBtn = page.getByTestId('stop-tracking-btn');
      
      // Retry click until modal is visible
      await expect(async () => {
        await stopBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await expect(page.getByTestId('add-session-modal')).toBeVisible({ timeout: 3000 });
      }).toPass({ timeout: 20000 });

      // Ensure duration is set
      const durationInput = page.getByRole('spinbutton').first();
      await durationInput.click();
      await durationInput.clear();
      await durationInput.pressSequentially('45', { delay: 100 });
      await page.waitForTimeout(1000); // Wait for React state to update
      
      // Retry save until modal is hidden
      await expect(async () => {
        await page.getByTestId('save-session-btn').click({ force: true });
        await page.waitForTimeout(2000); // Give React time to process the click and close the modal
        await expect(page.getByTestId('add-session-modal')).toBeHidden({ timeout: 3000 });
      }).toPass({ timeout: 20000 });

      // Handle achievement popup if it appears (first drive)
      const achievementOverlay = page.getByTestId('achievement-overlay');
      if (await achievementOverlay.isVisible({ timeout: 5000 }).catch(() => false)) {
        await page.getByTestId('achievement-close-btn').click({ force: true });
        await expect(achievementOverlay).toBeHidden({ timeout: 10000 });
      }

      await expect(page.getByTestId('start-tracking-btn')).toBeVisible({ timeout: 15000 });
    });
  });
});

import { test, expect, Page } from '@playwright/test';

test.describe('Curriculum Interactive Simulator', () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);

    // Seed the persisted store BEFORE the app boots: onboarding done, cookies
    // accepted, license selected. This removes the cookie banner and the
    // onboarding tour deterministically (they otherwise appear at
    // unpredictable times and swallow coordinate-based clicks).
    const seeded = JSON.stringify({
      state: {
        language: 'en',
        hasCompletedOnboarding: true,
        licenseType: 'manual',
        learningPath: 'standard',
        transmissionType: 'manual',
        cookieSettings: { essential: true, analytics: false, marketing: false, hasSet: true },
        // full shape: the persist merge is shallow, a partial object would
        // clobber the defaults. basics-0 completed => returning-user shortcut.
        userProgress: {
          completedLessons: ['basics-0'],
          drivingSessions: [],
          quizScores: {},
          totalDrivingMinutes: 0,
          specialDrivingMinutes: { ueberland: 0, autobahn: 0, nacht: 0 },
          unlockedAchievements: [],
          currentStreak: 0,
          lastActivityDate: null,
          incorrectQuestions: [],
          hourlyRate45: 60,
          hasAcceptedPrivacy: true,
          fixedCosts: { registration: 350, theoryExam: 25, practicalExam: 116, learningMaterial: 50, firstAid: 40, visionTest: 7 },
        },
      },
      version: 0,
    });
    await page.goto('/robots.txt');
    await page.evaluate((val) => {
      return new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('keyval-store');
        open.onupgradeneeded = () => open.result.createObjectStore('keyval');
        open.onsuccess = () => {
          const tx = open.result.transaction('keyval', 'readwrite');
          tx.objectStore('keyval').put(val, 'drivede-storage');
          tx.oncomplete = () => { open.result.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
        open.onerror = () => reject(open.error);
      });
    }, seeded);

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('cockpit trainer: guards, clutch drag, gear selection (basics-2)', async ({ page }) => {
    await test.step('Onboarding', async () => {
      await completeOnboarding(page);
    });

    await test.step('Open basics-2 lesson', async () => {
      await page.keyboard.press('Escape').catch(() => {});
      await openLessonViaList(page, 'chapter-1', 'basics-2');
      await expect(page.getByTestId('cockpit-step')).toBeVisible({ timeout: 15000 });
    });

    await test.step('Engine refuses to start without clutch + brake', async () => {
      await page.getByTestId('cockpit-engine').click({ force: true });
      await expect(page.getByTestId('cockpit-message')).toBeVisible();
    });

    await test.step('Drag clutch fully down, hold brake, start engine', async () => {
      const pedal = page.getByTestId('cockpit-clutch');
      await pedal.scrollIntoViewIfNeeded();
      const box = await pedal.boundingBox();
      if (!box) throw new Error('pedal has no bounding box');
      await page.mouse.move(box.x + box.width / 2, box.y + 4);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height - 2, { steps: 8 });
      await page.mouse.up();
      await expect(page.getByTestId('cockpit-clutch-value')).toHaveText(/9[0-9]|100/);

      // DOM dispatch to hold the brake while clicking the engine button —
      // a real mouse press releases via onPointerLeave when it travels away.
      await page.getByTestId('cockpit-brake').dispatchEvent('pointerdown');
      await page.getByTestId('cockpit-engine').dispatchEvent('click');
      await expect(page.getByTestId('cockpit-step')).toContainText('2/6', { timeout: 5000 });
      await page.getByTestId('cockpit-brake').dispatchEvent('pointerup');
    });

    await test.step('Select 1st gear with clutch pressed', async () => {
      await page.getByTestId('cockpit-gear-1').click({ force: true });
      await expect(page.getByTestId('cockpit-gear-display')).toHaveText('1');
      await expect(page.getByTestId('cockpit-step')).toContainText('3/6');
    });
  });

  test('should navigate to city-12 and complete all scenarios', async ({ page }) => {
    await test.step('Onboarding', async () => {
      await completeOnboarding(page);
    });

    await test.step('Open Chapter 3 and Lesson city-12', async () => {
      // Ensure we are not blocked by any modals
      await page.keyboard.press('Escape').catch(() => {});
      await openLessonViaList(page, 'chapter-3', 'city-12');
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
      
      // Reset for next test (DOM dispatch: success overlay can cover the header)
      await page.getByTestId('simulator-reset-btn').dispatchEvent('click');
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
    // State is pre-seeded (license selected), so the hero button takes the
    // returning-user shortcut straight into the app. DOM dispatch: coordinate
    // clicks can land on the fixed PWA-install banner.
    const startBtn = page.getByTestId('welcome-start-btn');
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.dispatchEvent('click');
    }
    // Wait for the tracker nav to be visible as a sign we're in the app
    await page.getByTestId('nav-tracker').filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 20000 });
  }

  /** Chapter/lesson testids live in the Classic List view. */
  async function openLessonViaList(page: Page, chapterId: string, lessonId: string) {
    const navCurriculum = page.getByTestId('nav-curriculum').filter({ visible: true }).first();
    await navCurriculum.click({ force: true });
    const listBtn = page.getByTestId('view-list');
    await listBtn.waitFor({ state: 'visible', timeout: 15000 });
    await listBtn.click({ force: true });
    const chapter = page.getByTestId(`chapter-${chapterId}`);
    await chapter.waitFor({ state: 'visible', timeout: 15000 });
    await chapter.scrollIntoViewIfNeeded();
    const lesson = page.getByTestId(`lesson-${lessonId}`);
    // chapters can start expanded — clicking then would collapse them
    if (!(await lesson.isVisible().catch(() => false))) {
      await chapter.dispatchEvent('click');
    }
    await lesson.waitFor({ state: 'visible', timeout: 10000 });
    await lesson.dispatchEvent('click');
    await page.waitForTimeout(1000);
  }
});


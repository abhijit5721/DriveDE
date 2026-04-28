/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { AppState } from '../types';
import { achievements } from '../data/achievements';

export function checkAndUnlockAchievements(state: AppState): string[] {
  const { userProgress } = state;
  const newlyUnlocked: string[] = [];

  achievements.forEach((achievement) => {
    if (!userProgress.unlockedAchievements.includes(achievement.id)) {
      if (achievement.criteria(userProgress)) {
        newlyUnlocked.push(achievement.id);
      }
    }
  });

  return newlyUnlocked;
}

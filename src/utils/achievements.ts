import { useAppStore } from '../store/useAppStore';
import { achievements } from '../data/achievements';
import toast from 'react-hot-toast';

export function checkAndUnlockAchievements() {
  const { userProgress, unlockAchievement } = useAppStore.getState();

  achievements.forEach((achievement) => {
    if (!userProgress.unlockedAchievements.includes(achievement.id)) {
      if (achievement.criteria(userProgress)) {
        unlockAchievement(achievement.id);
        toast.success(`Achievement Unlocked: ${achievement.title}`, {
          icon: achievement.icon,
        });
      }
    }
  });
}

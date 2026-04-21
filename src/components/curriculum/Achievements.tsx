import { useAppStore } from '../../store/useAppStore';
import { achievements } from '../../data/achievements';
import { cn } from '../../utils/cn';
import { Lock } from 'lucide-react';

export function Achievements() {
  const { userProgress } = useAppStore();
  // Add a fallback for unlockedAchievements to prevent crashes with old stored data
  const unlockedAchievements = userProgress.unlockedAchievements || [];

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Achievements
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your progress and unlock new milestones.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                'rounded-2xl p-4 text-center transition-all',
                isUnlocked
                  ? 'bg-white shadow-lg dark:bg-slate-800'
                  : 'bg-slate-100 dark:bg-slate-800/50'
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full text-4xl',
                  isUnlocked
                    ? 'bg-green-100 dark:bg-green-900/50'
                    : 'bg-slate-200 dark:bg-slate-700'
                )}
              >
                {isUnlocked ? (
                  <span>{achievement.icon}</span>
                ) : (
                  <Lock className="h-8 w-8 text-slate-400" />
                )}
              </div>
              <h3
                className={cn(
                  'font-semibold',
                  isUnlocked
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {achievement.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {achievement.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

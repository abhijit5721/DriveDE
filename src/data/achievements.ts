import { UserProgress } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: (progress: UserProgress) => boolean;
}

export const achievements: Achievement[] = [
  {
    id: 'first_drive',
    title: 'First Drive',
    description: 'Log your first driving session.',
    icon: '🚗',
    criteria: (progress) => progress.drivingSessions.length > 0,
  },
  {
    id: 'drive_5_sessions',
    title: 'Road Warrior',
    description: 'Log 5 driving sessions.',
    icon: '🛣️',
    criteria: (progress) => progress.drivingSessions.length >= 5,
  },
  {
    id: 'complete_first_lesson',
    title: 'Getting Started',
    description: 'Complete your first lesson.',
    icon: '🎓',
    criteria: (progress) => progress.completedLessons.length > 0,
  },
  {
    id: 'complete_all_maneuvers',
    title: 'Maneuver Master',
    description: 'Complete all maneuver lessons.',
    icon: '🅿️',
    criteria: (progress) => {
      const maneuverIds = ['maneuver-1', 'maneuver-2', 'maneuver-3', 'maneuver-4'];
      return maneuverIds.every(id => progress.completedLessons.includes(id));
    },
  },
  {
    id: 'log_night_drive',
    title: 'Night Owl',
    description: 'Log your first night drive.',
    icon: '🌙',
    criteria: (progress) => progress.drivingSessions.some((s) => s.type === 'nacht'),
  },
  {
    id: 'log_highway_drive',
    title: 'Highway Star',
    description: 'Log your first highway drive.',
    icon: '🛤️',
    criteria: (progress) => progress.drivingSessions.some((s) => s.type === 'autobahn'),
  },
];

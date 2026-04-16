import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { checkAndUnlockAchievements } from '../utils/achievements';
import type {
  AppState,
  DrivingSession,
  Language,
  LicenseType,
  LearningPathType,
  TransmissionType,
} from '../types';
import {
  ensureProfileFromState,
  syncCompletedLesson,
  syncDrivingSession,
  syncQuizAttempt,
} from '../services/supabaseSync';

const initialProgress = {
  completedLessons: [],
  drivingSessions: [],
  quizScores: {},
  totalDrivingMinutes: 0,
  specialDrivingMinutes: {
    ueberland: 0,
    autobahn: 0,
    nacht: 0,
  },
  unlockedAchievements: [],
  currentStreak: 0,
  lastActivityDate: null,
};

const deriveSelectionState = (type: LicenseType) => {
  let learningPath: LearningPathType = null;
  let transmissionType: TransmissionType = null;

  if (type === 'manual') {
    learningPath = 'standard';
    transmissionType = 'manual';
  } else if (type === 'automatic') {
    learningPath = 'standard';
    transmissionType = 'automatic';
  } else if (type === 'umschreibung') {
    learningPath = 'umschreibung';
    transmissionType = null;
  } else if (type === 'umschreibung-manual') {
    learningPath = 'umschreibung';
    transmissionType = 'manual';
  } else if (type === 'umschreibung-automatic') {
    learningPath = 'umschreibung';
    transmissionType = 'automatic';
  }

  return { learningPath, transmissionType };
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isYesterday = (date1: Date, date2: Date) => {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'de',
      darkMode: false,
      licenseType: null,
      learningPath: null,
      transmissionType: null,
      isPremium: false,
      authEmail: null,
      authDisplayName: null,
      authStatus: 'guest',
      userProgress: initialProgress,
      hasVisited: false,

      setHasVisited: (hasVisited: boolean) => set({ hasVisited }),

      setLanguage: (lang: Language) =>
        set((state) => {
          const nextState = { ...state, language: lang };
          void ensureProfileFromState(nextState as AppState);
          return { language: lang };
        }),

      toggleDarkMode: () =>
        set((state) => {
          const nextState = { ...state, darkMode: !state.darkMode };
          console.log('Toggling dark mode to:', nextState.darkMode);
          void ensureProfileFromState(nextState as AppState);
          return { darkMode: !state.darkMode };
        }),

      setLicenseType: (type: LicenseType) =>
        set((state) => {
          const derived = deriveSelectionState(type);
          const nextState = {
            ...state,
            licenseType: type,
            ...derived,
          };
          void ensureProfileFromState(nextState as AppState);
          return {
            licenseType: type,
            ...derived,
          };
        }),

      setLearningPath: (path: LearningPathType) =>
        set((state) => {
          const licenseType =
            path === null
              ? null
              : path === 'standard'
                ? state.transmissionType === 'manual'
                  ? 'manual'
                  : state.transmissionType === 'automatic'
                    ? 'automatic'
                    : null
                : state.transmissionType === 'manual'
                  ? 'umschreibung-manual'
                  : state.transmissionType === 'automatic'
                    ? 'umschreibung-automatic'
                    : 'umschreibung';

          const nextState = {
            ...state,
            learningPath: path,
            licenseType,
          };
          void ensureProfileFromState(nextState as AppState);
          return { learningPath: path, licenseType };
        }),

      setTransmissionType: (type: TransmissionType) =>
        set((state) => {
          const licenseType =
            type === null
              ? state.learningPath === 'umschreibung'
                ? 'umschreibung'
                : null
              : state.learningPath === 'umschreibung'
                ? type === 'manual'
                  ? 'umschreibung-manual'
                  : 'umschreibung-automatic'
                : type;

          const nextState = {
            ...state,
            transmissionType: type,
            licenseType,
          };
          void ensureProfileFromState(nextState as AppState);
          return { transmissionType: type, licenseType };
        }),

      setPremium: (premium: boolean) =>
        set((state) => {
          const nextState = { ...state, isPremium: premium };
          void ensureProfileFromState(nextState as AppState);
          return { isPremium: premium };
        }),

      setAuthState: (authEmail, authStatus, authDisplayName) =>
        set(() => ({
          authEmail,
          authStatus,
          authDisplayName,
        })),

      unlockAchievement: (achievementId: string) =>
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            unlockedAchievements: [
              ...state.userProgress.unlockedAchievements,
              achievementId,
            ],
          },
        })),
      
      updateStreak: () => {
        const state = get();
        const today = new Date();
        const lastActivity = state.userProgress.lastActivityDate ? new Date(state.userProgress.lastActivityDate) : null;

        if (lastActivity && isSameDay(lastActivity, today)) {
          return; // Already active today
        }

        let newStreak = state.userProgress.currentStreak;
        if (lastActivity && isYesterday(lastActivity, today)) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        set({
          userProgress: {
            ...state.userProgress,
            currentStreak: newStreak,
            lastActivityDate: today.toISOString(),
          },
        });
      },

      completeLesson: (lessonId: string) => {
        const state = get();
        const completedLessons = state.userProgress.completedLessons.includes(lessonId)
          ? state.userProgress.completedLessons
          : [...state.userProgress.completedLessons, lessonId];

        if (!state.userProgress.completedLessons.includes(lessonId)) {
          void syncCompletedLesson(lessonId);
        }

        set({
          userProgress: {
            ...state.userProgress,
            completedLessons,
          },
        });
        
        get().updateStreak();
        checkAndUnlockAchievements();
      },

      addDrivingSession: (session: Omit<DrivingSession, 'id'>) => {
        const state = get();
        const newSession: DrivingSession = {
          ...session,
          id: Date.now().toString(),
        };

        const newSpecialMinutes = { ...state.userProgress.specialDrivingMinutes };
        if (session.type === 'ueberland') {
          newSpecialMinutes.ueberland += session.duration;
        } else if (session.type === 'autobahn') {
          newSpecialMinutes.autobahn += session.duration;
        } else if (session.type === 'nacht') {
          newSpecialMinutes.nacht += session.duration;
        }

        void syncDrivingSession(newSession, state.transmissionType);

        set({
          userProgress: {
            ...state.userProgress,
            drivingSessions: [...state.userProgress.drivingSessions, newSession],
            totalDrivingMinutes: state.userProgress.totalDrivingMinutes + session.duration,
            specialDrivingMinutes: newSpecialMinutes,
          },
        });

        get().updateStreak();
        checkAndUnlockAchievements();
      },

      removeDrivingSession: (sessionId: string) =>
        set((state) => {
          const session = state.userProgress.drivingSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const newSpecialMinutes = { ...state.userProgress.specialDrivingMinutes };
          if (session.type === 'ueberland') {
            newSpecialMinutes.ueberland -= session.duration;
          } else if (session.type === 'autobahn') {
            newSpecialMinutes.autobahn -= session.duration;
          } else if (session.type === 'nacht') {
            newSpecialMinutes.nacht -= session.duration;
          }

          return {
            userProgress: {
              ...state.userProgress,
              drivingSessions: state.userProgress.drivingSessions.filter((s) => s.id !== sessionId),
              totalDrivingMinutes: state.userProgress.totalDrivingMinutes - session.duration,
              specialDrivingMinutes: newSpecialMinutes,
            },
          };
        }),

      setQuizScore: (quizId: string, score: number) =>
        set((state) => {
          void syncQuizAttempt(quizId, score);
          return {
            userProgress: {
              ...state.userProgress,
              quizScores: {
                ...state.userProgress.quizScores,
                [quizId]: score,
              },
            },
          };
        }),

      resetProgress: () =>
        set({
          userProgress: initialProgress,
        }),
    }),
    {
      name: 'drivede-storage',
    }
  )
);

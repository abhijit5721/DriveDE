/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * useAppStore.ts
 * 
 * Central Zustand store for global application state.
 * Handles:
 * 1. User progress tracking (lessons, sessions, scores).
 * 2. App settings (Language, Dark Mode, License Type).
 * 3. Persistence via LocalStorage.
 * 4. Cloud synchronization triggers for Supabase.
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get as getIDB, set as setIDB, del as delIDB } from 'idb-keyval';
import { checkAndUnlockAchievements } from '../utils/achievements';
import type {
  AppState,
  Language,
  LicenseType,
  LearningPathType,
  TransmissionType,
  UserProgress,
} from '../types';
import {
  ensureProfileFromState,
  syncCompletedLesson,
  syncDrivingSession,
  deleteDrivingSessionFromCloud,
  syncQuizAttempt,
  resetAllDataFromCloud,
  clearDrivingHistoryFromCloud,
} from '../services/supabaseSync';

/**
 * Helper: returns true when running on localhost (for dev testing).
 */
const isLocalhost = () =>
  typeof window !== 'undefined' && window.location.hostname === 'localhost';

/**
 * Default initial state for a new user progress tracker.
 */
const initialProgress: UserProgress = {
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
  incorrectQuestions: [],
  hourlyRate45: 60,
  fixedCosts: {
    registration: 350,
    theoryExam: 25,
    practicalExam: 116,
    learningMaterial: 50,
    firstAid: 40,
    visionTest: 7,
  },
};

/**
 * Helper to derive default selection state based on license type.
 */
const deriveSelectionState = (type: LicenseType) => {
  if (type === 'manual') {
    return {
      learningPath: 'standard' as const,
      transmissionType: 'manual' as const,
    };
  }
  if (type === 'automatic') {
    return {
      learningPath: 'standard' as const,
      transmissionType: 'automatic' as const,
    };
  }
  if (type === 'umschreibung' || type === 'umschreibung-manual' || type === 'umschreibung-automatic') {
    return {
      learningPath: 'umschreibung' as const,
      transmissionType: (type === 'umschreibung-automatic' ? 'automatic' : 'manual') as TransmissionType,
    };
  }
  return {
    learningPath: null,
    transmissionType: null,
  };
};

/**
 * Custom storage for Zustand using idb-keyval (IndexedDB).
 * This allows storing larger datasets (like route coordinates) without hitting the 5MB localStorage limit.
 */
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await getIDB(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await setIDB(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await delIDB(name);
  },
};

/**
 * Helper to check if two dates are the same day.
 */
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Helper to check if date1 is exactly one day before date2.
 */
const isYesterday = (date1: Date, date2: Date) => {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'de',
      darkMode: false,
      licenseType: null,
      learningPath: null,
      transmissionType: null,
      isPremium: isLocalhost(),
      authEmail: null,
      authDisplayName: null,
      authUserId: null,
      authStatus: 'guest',
      userProgress: initialProgress,
      activeSession: null,
      hasVisited: false,
      activeTab: 'home',

      setActiveTab: (tab) => set({ activeTab: tab }),

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
              : path === 'umschreibung'
                ? 'manual'
                : state.licenseType || 'manual';
          
          const nextState = {
            ...state,
            learningPath: path,
            licenseType: licenseType as LicenseType,
          };
          void ensureProfileFromState(nextState as AppState);
          return {
            learningPath: path,
            licenseType: licenseType as LicenseType,
          };
        }),

      setTransmissionType: (type: TransmissionType) =>
        set((state) => {
          const nextState = { ...state, transmissionType: type };
          void ensureProfileFromState(nextState as AppState);
          return { transmissionType: type };
        }),

      setPremium: (isPremium: boolean) => set({ isPremium }),

      setAuthState: (email, status, displayName, userId) =>
        set((state) => ({
          authEmail: email,
          authStatus: status,
          authDisplayName: displayName,
          authUserId: userId,
          // On localhost keep premium for dev testing.
          // In production, revoke premium on sign-out; on sign-in the DB
          // hydration in App.tsx sets isPremium from the profile's is_premium flag.
          isPremium: isLocalhost()
            ? true
            : status === 'guest'
              ? false
              : state.isPremium,
        })),

      unlockAchievement: (id) =>
        set((state) => {
          if (state.userProgress.unlockedAchievements.includes(id)) return state;
          return {
            userProgress: {
              ...state.userProgress,
              unlockedAchievements: [...state.userProgress.unlockedAchievements, id],
            },
          };
        }),

      updateStreak: () =>
        set((state) => {
          const now = new Date();
          const lastDate = state.userProgress.lastActivityDate
            ? new Date(state.userProgress.lastActivityDate)
            : null;

          if (!lastDate) {
            return {
              userProgress: {
                ...state.userProgress,
                currentStreak: 1,
                lastActivityDate: now.toISOString(),
              },
            };
          }

          if (isSameDay(now, lastDate)) return state;

          const newStreak = isYesterday(lastDate, now) ? state.userProgress.currentStreak + 1 : 1;

          return {
            userProgress: {
              ...state.userProgress,
              currentStreak: newStreak,
              lastActivityDate: now.toISOString(),
            },
          };
        }),

      completeLesson: (lessonId) =>
        set((state) => {
          if (state.userProgress.completedLessons.includes(lessonId)) return state;

          const nextProgress = {
            ...state.userProgress,
            completedLessons: [...state.userProgress.completedLessons, lessonId],
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          // Check for achievements
          const newlyUnlocked = checkAndUnlockAchievements(nextState as AppState);
          if (newlyUnlocked.length > 0) {
            nextProgress.unlockedAchievements = [
              ...nextProgress.unlockedAchievements,
              ...newlyUnlocked,
            ];
          }

          void syncCompletedLesson(lessonId);
          void ensureProfileFromState(nextState as AppState);

          return { userProgress: nextProgress };
        }),

      addDrivingSession: (session) =>
        set((state) => {
          const newSession = {
            ...session,
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };

          const nextProgress = {
            ...state.userProgress,
            drivingSessions: [newSession, ...state.userProgress.drivingSessions],
            totalDrivingMinutes: (Number(state.userProgress.totalDrivingMinutes) || 0) + (Number(session.duration) || 0),
          };

          if (session.type !== 'normal') {
            const key = session.type as keyof typeof state.userProgress.specialDrivingMinutes;
            nextProgress.specialDrivingMinutes = {
              ...nextProgress.specialDrivingMinutes,
              [key]: nextProgress.specialDrivingMinutes[key] + Number(session.duration),
            };
          }

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          // Check for achievements
          const newlyUnlocked = checkAndUnlockAchievements(nextState as AppState);
          if (newlyUnlocked.length > 0) {
            nextProgress.unlockedAchievements = [
              ...nextProgress.unlockedAchievements,
              ...newlyUnlocked,
            ];
          }

          void syncDrivingSession(newSession, state.transmissionType);
          void ensureProfileFromState(nextState as AppState);

          return { userProgress: nextProgress };
        }),

      updateDrivingSession: (sessionId, updates) =>
        set((state) => {
          const sessionIndex = state.userProgress.drivingSessions.findIndex((s) => s.id === sessionId);
          if (sessionIndex === -1) return state;

          const oldSession = state.userProgress.drivingSessions[sessionIndex];
          const updatedSession = { ...oldSession, ...updates };
          const newSessions = [...state.userProgress.drivingSessions];
          newSessions[sessionIndex] = updatedSession;

          // Recalculate totals
          let totalMins = 0;
          const specialMins = { ueberland: 0, autobahn: 0, nacht: 0 };

          newSessions.forEach((s) => {
            const d = Number(s.duration) || 0;
            totalMins += d;
            if (s.type !== 'normal') {
              const key = s.type as keyof typeof specialMins;
              specialMins[key] += d;
            }
          });

          const nextProgress = {
            ...state.userProgress,
            drivingSessions: newSessions,
            totalDrivingMinutes: totalMins,
            specialDrivingMinutes: specialMins,
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void syncDrivingSession(updatedSession, state.transmissionType);
          void ensureProfileFromState(nextState as AppState);

          return { userProgress: nextProgress };
        }),

      removeDrivingSession: (sessionId) =>
        set((state) => {
          const session = state.userProgress.drivingSessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const newSessions = state.userProgress.drivingSessions.filter((s) => s.id !== sessionId);

          // Recalculate totals
          let totalMins = 0;
          const specialMins = { ueberland: 0, autobahn: 0, nacht: 0 };

          newSessions.forEach((s) => {
            const d = Number(s.duration) || 0;
            totalMins += d;
            if (s.type !== 'normal') {
              const key = s.type as keyof typeof specialMins;
              specialMins[key] += d;
            }
          });

          const nextProgress = {
            ...state.userProgress,
            drivingSessions: newSessions,
            totalDrivingMinutes: totalMins,
            specialDrivingMinutes: specialMins,
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void deleteDrivingSessionFromCloud(sessionId);
          void ensureProfileFromState(nextState as AppState);

          return { userProgress: nextProgress };
        }),

      setQuizScore: (quizId, score) =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            quizScores: {
              ...state.userProgress.quizScores,
              [quizId]: Math.max(state.userProgress.quizScores[quizId] || 0, score),
            },
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          // Check for achievements
          const newlyUnlocked = checkAndUnlockAchievements(nextState as AppState);
          if (newlyUnlocked.length > 0) {
            nextProgress.unlockedAchievements = [
              ...nextProgress.unlockedAchievements,
              ...newlyUnlocked,
            ];
          }

          void syncQuizAttempt(quizId, score);
          void ensureProfileFromState(nextState as AppState);

          return { userProgress: nextProgress };
        }),

      addMistake: (questionId) =>
        set((state) => {
          if (state.userProgress.incorrectQuestions.includes(questionId)) return state;

          const nextProgress = {
            ...state.userProgress,
            incorrectQuestions: [...state.userProgress.incorrectQuestions, questionId],
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void ensureProfileFromState(nextState as AppState);
          return { userProgress: nextProgress };
        }),

      removeMistake: (questionId) =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            incorrectQuestions: state.userProgress.incorrectQuestions.filter((id) => id !== questionId),
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void ensureProfileFromState(nextState as AppState);
          return { userProgress: nextProgress };
        }),

      setHourlyRate45: (rate) =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            hourlyRate45: rate,
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void ensureProfileFromState(nextState as AppState);
          return { userProgress: nextProgress };
        }),

      updateFixedCosts: (costs) =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            fixedCosts: { ...state.userProgress.fixedCosts, ...costs },
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void ensureProfileFromState(nextState as AppState);
          return { userProgress: nextProgress };
        }),

      updateFinanceSettings: (costs, rate) =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            fixedCosts: { ...state.userProgress.fixedCosts, ...costs },
            hourlyRate45: rate !== undefined ? rate : state.userProgress.hourlyRate45,
          };

          const nextState = {
            ...state,
            userProgress: nextProgress,
          };

          void ensureProfileFromState(nextState as AppState);
          return { userProgress: nextProgress };
        }),

      resetProgress: () => {
        // NEW: Reset cloud data as well
        resetAllDataFromCloud();
        set({
          userProgress: initialProgress,
          licenseType: null,
          learningPath: null,
          transmissionType: null,
          isPremium: isLocalhost(),
          activeTab: 'home',
          hasVisited: false,
          activeSession: null,
        });
      },

      clearDrivingHistory: () =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            drivingSessions: [],
            totalDrivingMinutes: 0,
            specialDrivingMinutes: { ueberland: 0, autobahn: 0, nacht: 0 },
          };
          const nextState = {
            ...state,
            userProgress: nextProgress,
          };
          void ensureProfileFromState(nextState as AppState);
          // NEW: Clear cloud history as well
          clearDrivingHistoryFromCloud();
          return { userProgress: nextProgress };
        }),

      enableDemoMode: () =>
        set((state) => {
          const demoSessions = [
            {
              id: 'demo-1',
              date: new Date().toISOString(),
              duration: 90,
              type: 'ueberland' as const,
              notes: 'Demo: Perfect countryside drive.',
              instructorName: 'Demo Instructor',
              route: [],
              mistakes: [],
              totalDistance: 15.5,
            },
            {
              id: 'demo-2',
              date: new Date(Date.now() - 86400000).toISOString(),
              duration: 45,
              type: 'nacht' as const,
              notes: 'Demo: Night driving practice.',
              instructorName: 'Demo Instructor',
              route: [],
              mistakes: [],
              totalDistance: 8.2,
            },
          ];

          const nextProgress = {
            ...state.userProgress,
            drivingSessions: demoSessions,
            totalDrivingMinutes: 135,
            specialDrivingMinutes: {
              ueberland: 90,
              autobahn: 0,
              nacht: 45,
            },
          };

          return {
            userProgress: nextProgress,
            isPremium: true,
          };
        }),

      startActiveSession: (type, isSimulation, targetDestination, destinationCoords) =>
        set({
          activeSession: {
            startTime: Date.now(),
            isPaused: false,
            pausedDuration: 0,
            lastPauseTimestamp: null,
            currentDistance: 0,
            route: [],
            mistakes: [],
            type,
            isSimulation,
            targetDestination,
            destinationCoords,
          }
        }),

      pauseActiveSession: () =>
        set((state) => {
          if (!state.activeSession || state.activeSession.isPaused) return state;
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: true,
              lastPauseTimestamp: Date.now(),
            }
          };
        }),

      resumeActiveSession: () =>
        set((state) => {
          if (!state.activeSession || !state.activeSession.isPaused || !state.activeSession.lastPauseTimestamp) return state;
          const additionalPausedTime = Date.now() - state.activeSession.lastPauseTimestamp;
          return {
            activeSession: {
              ...state.activeSession,
              isPaused: false,
              pausedDuration: state.activeSession.pausedDuration + additionalPausedTime,
              lastPauseTimestamp: null,
            }
          };
        }),

      updateActiveSession: (updates) =>
        set((state) => {
          if (!state.activeSession) return state;
          return {
            activeSession: {
              ...state.activeSession,
              ...updates,
            }
          };
        }),

      stopActiveSession: () => set({ activeSession: null }),
    }),
    {
      name: 'drivede-storage',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        language: state.language,
        darkMode: state.darkMode,
        licenseType: state.licenseType,
        learningPath: state.learningPath,
        transmissionType: state.transmissionType,
        isPremium: state.isPremium,
        authEmail: state.authEmail,
        authDisplayName: state.authDisplayName,
        authUserId: state.authUserId,
        authStatus: state.authStatus,
        userProgress: state.userProgress,
        activeSession: state.activeSession,
        hasVisited: state.hasVisited,
        activeTab: state.activeTab,
      }),
      onRehydrateStorage: () => (_, error) => {
        if (error) {
          console.error('[Store] Hydration failed (possible corruption):', error);
          // In a real app, we might trigger a state reset or alert the user here.
        } else {
          console.log('[Store] Hydration successful.');
        }
      },
    }
  )
);

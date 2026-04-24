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
  DrivingSession,
  Language,
  LicenseType,
  LearningPathType,
  TransmissionType,
  UserProgress,
} from '@/types';
import {
  ensureProfileFromState,
  syncCompletedLesson,
  syncDrivingSession,
  deleteDrivingSessionFromCloud,
  syncQuizAttempt,
} from '../services/supabaseSync';

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
 * Automatically sets the correct LearningPath and TransmissionType based on the selected license.
 */
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

/**
 * Helper to check if two dates fall on the same calendar day.
 */
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
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
    (set, get) => ({
      language: 'de',
      darkMode: false,
      licenseType: null,
      learningPath: null,
      transmissionType: null,
      isPremium: typeof window !== 'undefined' && window.location.hostname === 'localhost',
      authEmail: null,
      authDisplayName: null,
      authUserId: null,
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

      setAuthState: (email, status, displayName = null, userId = null) =>
        set(() => ({ 
          authEmail: email, 
          authStatus: status, 
          authDisplayName: displayName,
          authUserId: userId
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

      updateDrivingSession: (sessionId: string, updatedFields: Partial<DrivingSession>) => {
        const state = get();
        const sessionIndex = state.userProgress.drivingSessions.findIndex((s) => s.id === sessionId);
        if (sessionIndex === -1) return;

        const oldSession = state.userProgress.drivingSessions[sessionIndex];
        const newSession = { ...oldSession, ...updatedFields };

        const newSessions = [...state.userProgress.drivingSessions];
        newSessions[sessionIndex] = newSession;

        // Recalculate totals
        let totalMinutes = 0;
        const specialMinutes = { ueberland: 0, autobahn: 0, nacht: 0 };

        newSessions.forEach(s => {
          totalMinutes += s.duration;
          if (s.type === 'ueberland') specialMinutes.ueberland += s.duration;
          else if (s.type === 'autobahn') specialMinutes.autobahn += s.duration;
          else if (s.type === 'nacht') specialMinutes.nacht += s.duration;
        });

        void syncDrivingSession(newSession, state.transmissionType);

        set({
          userProgress: {
            ...state.userProgress,
            drivingSessions: newSessions,
            totalDrivingMinutes: totalMinutes,
            specialDrivingMinutes: specialMinutes,
          },
        });
      },

      removeDrivingSession: (sessionId: string) => {
        const state = get();
        const session = state.userProgress.drivingSessions.find((s) => s.id === sessionId);
        if (!session) return;

        void deleteDrivingSessionFromCloud(sessionId);

        const newSpecialMinutes = { ...state.userProgress.specialDrivingMinutes };
        if (session.type === 'ueberland') {
          newSpecialMinutes.ueberland -= session.duration;
        } else if (session.type === 'autobahn') {
          newSpecialMinutes.autobahn -= session.duration;
        } else if (session.type === 'nacht') {
          newSpecialMinutes.nacht -= session.duration;
        }

        set({
          userProgress: {
            ...state.userProgress,
            drivingSessions: state.userProgress.drivingSessions.filter((s) => s.id !== sessionId),
            totalDrivingMinutes: state.userProgress.totalDrivingMinutes - session.duration,
            specialDrivingMinutes: newSpecialMinutes,
          },
        });
      },

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

      addMistake: (questionId: string) =>
        set((state) => {
          const currentMistakes = Array.isArray(state.userProgress.incorrectQuestions) 
            ? state.userProgress.incorrectQuestions 
            : [];
            
          if (currentMistakes.includes(questionId)) return state;
          
          const nextMistakes = [...currentMistakes, questionId];
          const nextState = {
            ...state,
            userProgress: {
              ...state.userProgress,
              incorrectQuestions: nextMistakes,
            },
          };
          void ensureProfileFromState(nextState as AppState);
          return {
            userProgress: {
              ...state.userProgress,
              incorrectQuestions: nextMistakes,
            },
          };
        }),

      removeMistake: (questionId: string) =>
        set((state) => {
          const currentMistakes = Array.isArray(state.userProgress.incorrectQuestions) 
            ? state.userProgress.incorrectQuestions 
            : [];

          const nextMistakes = currentMistakes.filter((id) => id !== questionId);
          const nextState = {
            ...state,
            userProgress: {
              ...state.userProgress,
              incorrectQuestions: nextMistakes,
            },
          };
          void ensureProfileFromState(nextState as AppState);
          return {
            userProgress: {
              ...state.userProgress,
              incorrectQuestions: nextMistakes,
            },
          };
        }),
      
      setHourlyRate45: (rate: number) =>
        set((state) => {
          const nextState = {
            ...state,
            userProgress: {
              ...state.userProgress,
              hourlyRate45: rate,
            },
          };
          void ensureProfileFromState(nextState as AppState);
          return {
            userProgress: {
              ...state.userProgress,
              hourlyRate45: rate,
            },
          };
        }),

      updateFixedCosts: (costs: Partial<UserProgress['fixedCosts']>) => {
        get().updateFinanceSettings(costs);
      },

      updateFinanceSettings: (costs: Partial<UserProgress['fixedCosts']>, rate?: number) =>
        set((state) => {
          const nextCosts = { ...state.userProgress.fixedCosts, ...costs };
          const nextRate = rate !== undefined ? rate : state.userProgress.hourlyRate45;
          
          const nextState = {
            ...state,
            userProgress: {
              ...state.userProgress,
              fixedCosts: nextCosts,
              hourlyRate45: nextRate,
            },
          };
          void ensureProfileFromState(nextState as AppState);
          return {
            userProgress: {
              ...state.userProgress,
              fixedCosts: nextCosts,
              hourlyRate45: nextRate,
            },
          };
        }),

      resetProgress: () => {
        // NEW: Reset cloud data as well
        import('../services/supabaseSync').then(m => m.resetAllDataFromCloud());
        set({
          userProgress: initialProgress,
          isPremium: typeof window !== 'undefined' && window.location.hostname === 'localhost',
          licenseType: null,
          learningPath: null,
          transmissionType: null,
          hasVisited: false,
        });
      },

      clearDrivingHistory: () =>
        set((state) => {
          const nextProgress = {
            ...state.userProgress,
            drivingSessions: [],
            totalDrivingMinutes: 0,
            specialDrivingMinutes: {
              ueberland: 0,
              autobahn: 0,
              nacht: 0,
            },
          };
          const nextState = {
            ...state,
            userProgress: nextProgress,
          };
          void ensureProfileFromState(nextState as AppState);
          // NEW: Clear from cloud as well
          import('../services/supabaseSync').then(m => m.clearDrivingHistoryFromCloud());
          return { userProgress: nextProgress };
        }),

      enableDemoMode: () => {
        const now = new Date();
        const demoSessions: DrivingSession[] = [
          {
            id: 'demo-1',
            date: new Date(now.getTime() - 10 * 86400000).toISOString(),
            duration: 90,
            type: 'ueberland',
            notes: 'Fahrt über Landstraßen, Vorbeifahrt an landwirtschaftlichen Fahrzeugen geübt.',
            instructorName: 'Hans Müller',
            totalDistance: 45.2,
            locationSummary: 'Potsdam & Umland',
            mistakes: [],
          },
          {
            id: 'demo-2',
            date: new Date(now.getTime() - 7 * 86400000).toISOString(),
            duration: 135,
            type: 'autobahn',
            notes: 'A115 Richtung Dreilinden. Auffahren und Überholen bei hohem Verkehrsaufkommen.',
            instructorName: 'Hans Müller',
            totalDistance: 120.5,
            locationSummary: 'A115 Autobahn',
            mistakes: [
              { type: 'speeding', speed: 128, limit: 120, timestamp: now.getTime() - 7 * 86400000 + 1500000 }
            ],
          },
          {
            id: 'demo-3',
            date: new Date(now.getTime() - 3 * 86400000).toISOString(),
            duration: 45,
            type: 'normal',
            notes: 'Stadtverkehr, Rechts vor Links und Zebrastreifen.',
            instructorName: 'Hans Müller',
            totalDistance: 12.8,
            locationSummary: 'Berlin Mitte',
            route: [
              { lat: 52.5200, lng: 13.4050, timestamp: 0 },
              { lat: 52.5210, lng: 13.4060, timestamp: 60000 },
              { lat: 52.5220, lng: 13.4070, timestamp: 120000 },
            ],
            mistakes: [
              { type: 'signal', timestamp: now.getTime() - 3 * 86400000 + 500000 },
              { type: 'stop_sign', timestamp: now.getTime() - 3 * 86400000 + 900000 }
            ]
          },
          {
            id: 'demo-4',
            date: new Date(now.getTime() - 1 * 86400000).toISOString(),
            duration: 90,
            type: 'nacht',
            notes: 'Nachtfahrt bei Regen. Abblendlicht und Fernlicht-Einsatz.',
            instructorName: 'Hans Müller',
            totalDistance: 65.0,
            locationSummary: 'Berlin Spandau',
            mistakes: []
          }
        ];

        set({
          licenseType: 'manual',
          learningPath: 'standard',
          transmissionType: 'manual',
          isPremium: true,
          hasVisited: true,
          userProgress: {
            ...get().userProgress,
            completedLessons: ['l-grundlagen-1', 'l-grundlagen-2', 'l-vorfahrt-1', 'l-autobahn-1'],
            drivingSessions: demoSessions,
            totalDrivingMinutes: 360,
            specialDrivingMinutes: {
              ueberland: 90,
              autobahn: 135,
              nacht: 90,
            },
            unlockedAchievements: ['first-drive', 'highway-hero', 'night-owl'],
            currentStreak: 5,
            quizScores: {
              'q-vorfahrt': 95,
              'q-technik': 100
            }
          }
        });
      },
    }),
    {
      name: 'drivede-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name): Promise<string | null> => {
          // 1. Try to get from IndexedDB first
          const value = await getIDB(name);
          if (value) return value as string;

          // 2. Fallback to localStorage for one-time migration
          if (typeof window !== 'undefined') {
            const legacyValue = localStorage.getItem(name);
            if (legacyValue) {
              console.log('Migrating legacy localStorage data to IndexedDB...');
              await setIDB(name, legacyValue);
              // We don't remove immediately to be safe, but you could:
              // localStorage.removeItem(name);
              return legacyValue;
            }
          }
          return null;
        },
        setItem: async (name, value): Promise<void> => {
          await setIDB(name, value);
        },
        removeItem: async (name): Promise<void> => {
          await delIDB(name);
        },
      } as StateStorage)),
    }
  )
);

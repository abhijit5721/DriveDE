/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

// Types for DriveDE App

export type Language = 'de' | 'en';
export type TransmissionType = 'manual' | 'automatic' | null;
export type LearningPathType = 'standard' | 'umschreibung' | null;
export type LicenseType =
  | 'manual'
  | 'automatic'
  | 'umschreibung'
  | 'umschreibung-manual'
  | 'umschreibung-automatic'
  | null;

export interface Chapter {
  id: string;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  icon: string;
  lessons: Lesson[];
  progress: number;
}

export interface Lesson {
  id: string;
  chapterId: string;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  completed: boolean;
  steps?: ManeuverStep[];
  tips?: Tip[];
  guidedPoints?: GuidedPoint[];
  scenarios?: LessonScenario[];
  scenarioSectionTitleDe?: string;
  scenarioSectionTitleEn?: string;
  scenarioSectionSubtitleDe?: string;
  scenarioSectionSubtitleEn?: string;
  trafficSigns?: TrafficSign[];
  glossary?: GlossaryTerm[];
  examinerCommands?: ExaminerCommand[];
  quiz?: QuizQuestion[];
  // License-specific content
  licenseType?: 'manual' | 'automatic' | 'both';
  learningPath?: 'standard' | 'umschreibung' | 'both';
  manualOnly?: boolean;
  automaticOnly?: boolean;
  isPremium?: boolean;
  isInteractive?: boolean;
}

export interface ManeuverStep {
  id: number;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  icon: string;
  critical?: boolean;
}

export interface Tip {
  id: string;
  titleDe: string;
  titleEn: string;
  contentDe: string;
  contentEn: string;
  type: 'warning' | 'info' | 'success';
}

export interface GuidedPoint {
  id: string;
  titleDe: string;
  titleEn: string;
  contentDe: string;
  contentEn: string;
  emphasis?: 'look' | 'priority' | 'speed' | 'exam' | 'safety';
}

export interface LessonScenario {
  id: string;
  titleDe: string;
  titleEn: string;
  situationDe: string;
  situationEn: string;
  steps: ManeuverStep[];
  mistakes?: Tip[];
}

export interface TrafficSign {
  id: string;
  code?: string;
  titleDe: string;
  titleEn: string;
  descriptionDe: string;
  descriptionEn: string;
  category?: 'priority' | 'warning' | 'mandatory' | 'pedestrian' | 'parking' | 'motorway' | 'traffic-light' | 'vehicle-check';
}

export interface GlossaryTerm {
  id: string;
  german: string;
  english: string;
  noteDe?: string;
  noteEn?: string;
}

export interface ExaminerCommand {
  id: string;
  commandDe: string;
  commandEn: string;
  noteDe?: string;
  noteEn?: string;
}

export interface QuizQuestion {
  id: string;
  questionDe: string;
  questionEn: string;
  options: QuizOption[];
  correctOptionId: string;
  explanationDe: string;
  explanationEn: string;
}

export interface QuizOption {
  id: string;
  textDe: string;
  textEn: string;
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface DrivingMistake {
  type: 'speeding' | 'harsh_braking' | 'rapid_acceleration' | 'signal' | 'priority' | 'stop_sign' | 'shoulder_check' | 'wrong_way' | 'illegal_turn' | 'idling' | 'roundabout_signal' | 'curve_speeding' | 'aggressive_cornering' | 'right_before_left' | 'school_zone_speeding' | 'other';
  speed?: number;
  limit?: number;
  timestamp: number;
  location?: { lat: number; lng: number };
}

export interface DrivingSession {
  id: string;
  date: string;
  duration: number; // in minutes
  type: 'normal' | 'ueberland' | 'autobahn' | 'nacht';
  notes: string;
  instructorName?: string;
  totalDistance?: number; // km
  route?: GPSPoint[];
  locationSummary?: string; // e.g. "Berlin, Mitte"
  mistakes?: DrivingMistake[];
  isSimulation?: boolean;
}

export interface ActiveSession {
  startTime: number | null;
  isPaused: boolean;
  pausedDuration: number; // cumulative paused time in ms
  lastPauseTimestamp: number | null;
  currentDistance: number;
  route: GPSPoint[];
  mistakes: DrivingMistake[];
  type: DrivingSession['type'];
  isSimulation: boolean;
  targetDestination?: string;
  destinationCoords?: { lat: number; lng: number } | null;
}

export interface UserProgress {
  completedLessons: string[];
  drivingSessions: DrivingSession[];
  quizScores: Record<string, number>;
  totalDrivingMinutes: number;
  specialDrivingMinutes: {
    ueberland: number;
    autobahn: number;
    nacht: number;
  };
  unlockedAchievements: string[];
  currentStreak: number;
  lastActivityDate: string | null;
  incorrectQuestions: string[];
  hourlyRate45: number;
  fixedCosts: {
    registration: number;
    theoryExam: number;
    practicalExam: number;
    learningMaterial: number;
    firstAid: number;
    visionTest: number;
  };
}

export interface AppState {
  language: Language;
  darkMode: boolean;
  licenseType: LicenseType;
  learningPath: LearningPathType;
  transmissionType: TransmissionType;
  isPremium: boolean;
  authEmail: string | null;
  authDisplayName: string | null;
  authUserId: string | null;
  authStatus: 'guest' | 'signed_in';
  userProgress: UserProgress;
  activeSession: ActiveSession | null;
  hasVisited: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  setHasVisited: (hasVisited: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setLicenseType: (type: LicenseType) => void;
  setLearningPath: (path: LearningPathType) => void;
  setTransmissionType: (type: TransmissionType) => void;
  setPremium: (isPremium: boolean) => void;
  setAuthState: (authEmail: string | null, authStatus: 'guest' | 'signed_in', authDisplayName: string | null, authUserId: string | null) => void;
  unlockAchievement: (achievementId: string) => void;
  updateStreak: () => void;
  completeLesson: (lessonId: string) => void;
  addDrivingSession: (session: Omit<DrivingSession, 'id'>) => void;
  updateDrivingSession: (sessionId: string, session: Partial<DrivingSession>) => void;
  removeDrivingSession: (sessionId: string) => void;
  setQuizScore: (quizId: string, score: number) => void;
  addMistake: (questionId: string) => void;
  removeMistake: (questionId: string) => void;
  setHourlyRate45: (rate: number) => void;
  updateFixedCosts: (costs: Partial<UserProgress['fixedCosts']>) => void;
  updateFinanceSettings: (costs: Partial<UserProgress['fixedCosts']>, rate?: number) => void;
  resetProgress: () => void;
  clearDrivingHistory: () => void;
  enableDemoMode: () => void;
  
  // Active Session Management
  startActiveSession: (type: DrivingSession['type'], isSimulation: boolean, targetDestination?: string, destinationCoords?: { lat: number; lng: number } | null) => void;
  pauseActiveSession: () => void;
  resumeActiveSession: () => void;
  updateActiveSession: (updates: Partial<ActiveSession>) => void;
  stopActiveSession: () => void;
}

export type TabType = 'home' | 'curriculum' | 'maneuvers' | 'tracker' | 'achievements' | 'review' | 'legal' | 'account' | 'finance';

export type LegalPageType = 'privacy' | 'terms' | 'gdpr' | 'impressum' | 'disclaimer';

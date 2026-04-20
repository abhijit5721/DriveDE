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

export interface DrivingMistake {
  type: 'speeding' | 'harsh_braking' | 'rapid_acceleration' | 'signal' | 'priority' | 'stop_sign' | 'shoulder_check' | 'wrong_way' | 'illegal_turn' | 'idling' | 'roundabout_signal' | 'curve_speeding' | 'aggressive_cornering' | 'other';
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
  route?: { lat: number; lng: number; timestamp: number }[];
  locationSummary?: string; // e.g. "Berlin, Mitte"
  mistakes?: DrivingMistake[];
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
  authStatus: 'guest' | 'signed_in';
  userProgress: UserProgress;
  hasVisited: boolean;
  setHasVisited: (hasVisited: boolean) => void;
  setLanguage: (lang: Language) => void;
  toggleDarkMode: () => void;
  setLicenseType: (type: LicenseType) => void;
  setLearningPath: (path: LearningPathType) => void;
  setTransmissionType: (type: TransmissionType) => void;
  setPremium: (isPremium: boolean) => void;
  setAuthState: (authEmail: string | null, authStatus: 'guest' | 'signed_in', authDisplayName: string | null) => void;
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
  resetProgress: () => void;
}

export type TabType = 'home' | 'curriculum' | 'maneuvers' | 'tracker' | 'achievements' | 'review' | 'legal' | 'account';

export type LegalPageType = 'privacy' | 'terms' | 'gdpr' | 'impressum' | 'disclaimer';

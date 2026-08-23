/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Curriculum.tsx
 *
 * Visual Learning Path / Quest Map (Duolingo & Babbel Style):
 * Renders all chapters (1 through 5) as a continuous interactive milestone quest path
 * with German rule quick-pills, slide-over lesson preview drawers, readiness impact counters,
 * persistent view preferences, auto-scrolling to active left-off nodes, and smart chapter accordion states.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Check, Lock, Cog, Zap,
  Settings2, BadgeCheck, Crown, Activity,
  Play, ArrowRight, Layers, TrendingUp, Compass,
  View, Eye, ClipboardCheck, Gauge, Target, Mountain,
  ParkingSquare, Car, RefreshCcw, RotateCcw, AlertOctagon,
  AlertTriangle, Ruler, Footprints, Bike, ArrowLeftRight,
  Route, Ambulance, Siren, MessageSquare, Trophy,
  Building2, BookOpen
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { chapters } from '../../data/curriculum';
import { cn } from '../../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../../utils/license';
import { filterChaptersForSelection } from '../../utils/contentFilter';
import type { Lesson, Chapter } from '../../types';

interface CurriculumProps {
  onLessonSelect: (lesson: Lesson) => void;
}

// German rule badges mapped to specific lesson topics across all chapters
const GERMAN_RULE_BADGES: Record<string, { labelDe: string; labelEn: string; icon: LucideIcon }> = {
  'basics-0': { labelDe: 'Umschreibung: Schnellstart & Prüfungsregeln', labelEn: 'Conversion: Germany Quickstart', icon: BadgeCheck },
  'basics-1': { labelDe: 'Sitzposition & Spiegel', labelEn: 'Seating & Mirror Setup', icon: View },
  'basics-1b': { labelDe: 'Schulterblick (Pflicht)', labelEn: 'Schulterblick Check', icon: Eye },
  'basics-1a': { labelDe: 'Fahrzeug-Sicherheitskontrolle', labelEn: 'Pre-Drive Safety Check', icon: ClipboardCheck },
  'basics-2': { labelDe: 'Kupplung & Anfahren (Schalter)', labelEn: 'Clutch & Moving Off (Manual)', icon: Cog },
  'basics-2a': { labelDe: 'Wählhebel & Anfahren (Automatik)', labelEn: 'Gear Selector & Moving Off (Auto)', icon: Zap },
  'basics-3': { labelDe: 'Schaltpraxis & Gänge', labelEn: 'Shifting Technique', icon: Gauge },
  'basics-3a': { labelDe: 'Fahrmodi & Tiptronic', labelEn: 'Drive Modes & Override', icon: Zap },
  'basics-4': { labelDe: 'Lenkradhaltung (9 & 3 Uhr)', labelEn: 'Steering Wheel Control', icon: Target },
  'basics-5': { labelDe: 'Berganfahren (Handbremse)', labelEn: 'Hill Start (Manual)', icon: Mountain },
  'basics-5a': { labelDe: 'Berganfahren (Hill-Hold)', labelEn: 'Hill Start (Auto)', icon: Mountain },

  'maneuver-1': { labelDe: 'Parallel-Einparken (3D)', labelEn: 'Parallel Parking (3D)', icon: ParkingSquare },
  'maneuver-2': { labelDe: 'Rückwärts-Einparken (3D)', labelEn: 'Reverse Parking (3D)', icon: ParkingSquare },
  'maneuver-3': { labelDe: 'Wenden in 3 Zügen', labelEn: 'Three-Point Turn', icon: RefreshCcw },
  'maneuver-4': { labelDe: 'Gefahrenbremsung (Schaltwagen)', labelEn: 'Emergency Stop (Manual)', icon: AlertOctagon },
  'maneuver-4a': { labelDe: 'Gefahrenbremsung (Automatik)', labelEn: 'Emergency Stop (Auto)', icon: AlertOctagon },

  'city-1': { labelDe: 'Rechts vor Links (StVO §8)', labelEn: 'Right-Before-Left Priority', icon: AlertTriangle },
  'city-2': { labelDe: 'Abknickende Vorfahrt & Linksabbiegen', labelEn: 'Priority Roads & Left Turns', icon: Ruler },
  'city-3': { labelDe: 'Kreisverkehr (Zeichen 215)', labelEn: 'Roundabout & Indicators', icon: RotateCcw },
  'city-4': { labelDe: 'Zebrastreifen (Zeichen 266)', labelEn: 'Zebra Crossing Priority', icon: Footprints },
  'city-5': { labelDe: 'Abbiegen & Radweg-Check', labelEn: 'Right Turn Bike Check', icon: Bike },
  'city-6': { labelDe: 'Spurwechsel im Verkehr', labelEn: 'Dense Traffic Lane Change', icon: ArrowLeftRight },

  'hwy-1': { labelDe: 'Einfädelungsstreifen (Autobahn)', labelEn: 'Autobahn Ramp Merging', icon: Route },
  'hwy-2': { labelDe: 'Rechtsfahrgebot & Überholen', labelEn: 'Keep-Right Rule & Passing', icon: Car },
  'hwy-3': { labelDe: 'Rettungsgasse bilden (StVO §11)', labelEn: 'Emergency Corridor', icon: Ambulance },

  'exam-1': { labelDe: 'Die 5 Häufigsten Durchfallgründe', labelEn: 'Top 5 Exam Fail Traps', icon: Siren },
  'exam-2': { labelDe: 'Prüferanweisung: "Die Nächste Links"', labelEn: 'Examiner Commands', icon: MessageSquare },
  'exam-3': { labelDe: '100% Praktische Simulation', labelEn: 'Full Exam Simulation', icon: Trophy },
};

export function Curriculum({ onLessonSelect }: CurriculumProps) {
  const { 
    language, userProgress, licenseType, setLicenseType, isProActive,
    curriculumViewMode, setCurriculumViewMode 
  } = useAppStore();
  const proActive = isProActive();
  const t = TRANSLATIONS[language];
  const isDe = language === 'de';

  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // --- DERIVED LICENSE STATE ---
  const learningPath = getLearningPathFromLicenseType(licenseType);
  const transmissionType = getTransmissionFromLicenseType(licenseType);

  const isManualSelection = transmissionType === 'manual' && learningPath === 'standard';
  const isAutomaticSelection = transmissionType === 'automatic' && learningPath === 'standard';
  const isConversionManualSelection = licenseType === 'umschreibung-manual';
  const isConversionAutomaticSelection = licenseType === 'umschreibung-automatic';

  // Filtered chapters for current path
  const filteredChapters = useMemo((): Chapter[] => {
    return filterChaptersForSelection(chapters, transmissionType, learningPath);
  }, [transmissionType, learningPath]);

  // Total lessons count and total completed
  const totalLessons = useMemo(() => {
    return filteredChapters.reduce((sum, ch) => sum + ch.lessons.length, 0);
  }, [filteredChapters]);

  const completedCount = useMemo(() => {
    const validIds = new Set(filteredChapters.flatMap(ch => ch.lessons.map(l => l.id)));
    return userProgress.completedLessons.filter(id => validIds.has(id)).length;
  }, [filteredChapters, userProgress.completedLessons]);

  const overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Identify next uncompleted active lesson node along path
  const activeLessonId = useMemo(() => {
    for (const chapter of filteredChapters) {
      for (const lesson of chapter.lessons) {
        if (!userProgress.completedLessons.includes(lesson.id)) {
          return lesson.id;
        }
      }
    }
    return filteredChapters[0]?.lessons[0]?.id || null;
  }, [filteredChapters, userProgress.completedLessons]);

  // Identify chapter containing active lesson (for auto-expanding active chapter while completed/future chapters stay closed)
  const activeChapterId = useMemo(() => {
    for (const chapter of filteredChapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === activeLessonId) {
          return chapter.id;
        }
      }
    }
    return filteredChapters[0]?.id || 'chapter-1';
  }, [filteredChapters, activeLessonId]);

  const [expandedChapter, setExpandedChapter] = useState<string | null>(activeChapterId);

  // Update expanded chapter when active chapter changes
  useEffect(() => {
    setExpandedChapter(activeChapterId);
  }, [activeChapterId]);

  const activeNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (curriculumViewMode === 'quest' && activeNodeRef.current) {
      const timer = setTimeout(() => {
        activeNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [curriculumViewMode, activeLessonId]);

  const getChapterIcon = (chapterId: string): LucideIcon => {
    switch (chapterId) {
      case 'chapter-1': return Car;
      case 'chapter-2': return ParkingSquare;
      case 'chapter-3': return Building2;
      case 'chapter-4': return Route;
      case 'chapter-5': return Trophy;
      default: return BookOpen;
    }
  };

  const getLessonBadge = (lesson: Lesson) => {
    if (lesson.isPremium && !proActive) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
          <Crown className="h-3 w-3" />
          <span className="notranslate">Pro</span>
        </span>
      );
    }
    if (lesson.manualOnly) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <Cog className="h-3 w-3" />
          <span>{t.curriculum.manualBadge}</span>
        </span>
      );
    }
    if (lesson.automaticOnly) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400">
          <Zap className="h-3 w-3" />
          <span>{t.curriculum.autoBadge}</span>
        </span>
      );
    }
    if (lesson.isInteractive) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-700 dark:text-blue-400">
          <Activity className="h-3 w-3" />
          <span>{t.curriculum.interactiveBadge}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & License Type Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
              {isDe ? 'Fahrlehrplan 2026' : 'Curriculum 2026'}
            </span>
            <span className="text-xs font-bold text-muted">• {completedCount}/{totalLessons} {isDe ? 'Lektionen' : 'Lessons'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.curriculum.title}
          </h1>
        </div>

        {/* View Mode Switcher (Persisted Preference) & Path Settings */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              data-testid="view-quest"
              onClick={() => setCurriculumViewMode('quest')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 min-h-11 rounded-lg text-xs font-bold transition-all',
                curriculumViewMode === 'quest'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isDe ? 'Quest Map' : 'Quest Map'}</span>
            </button>
            <button
              data-testid="view-list"
              onClick={() => setCurriculumViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 min-h-11 rounded-lg text-xs font-bold transition-all',
                curriculumViewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isDe ? 'Klassisch' : 'Classic List'}</span>
            </button>
          </div>

          <button
            onClick={() => setShowLicenseModal(true)}
            aria-label={t.curriculum.changeLicense}
            className="flex items-center gap-2 px-3 py-2 min-h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Settings2 className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">
              {learningPath === 'umschreibung' ? 'Umschreibung' : transmissionType === 'manual' ? 'Schalter' : 'Automatik'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl bg-surface border border-line p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {learningPath === 'umschreibung'
                  ? (isDe ? 'Umschreibung ausländischer Führerschein' : 'Foreign License Conversion (Germany)')
                  : (isDe ? 'Führerschein Klasse B Ausbildungsplan' : 'Class B Driving License Curriculum')}
              </p>
              <p className="text-xs text-muted font-medium">
                {/* This header shows lesson-completion percent only. Calling it
                    exam readiness contradicted the dashboard's readiness score
                    (a different metric from utils/readiness.ts). */}
                {isDe ? 'Gesamtfortschritt im Lehrplan' : 'Overall curriculum progress'}
              </p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 p-0.5 border border-line">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-blue-600"
          />
        </div>
      </div>

      {/* 2. Visual Quest Map View for ALL Chapters */}
      {curriculumViewMode === 'quest' ? (
        <div className="space-y-10 relative pt-2">
          {filteredChapters.map((chapter, cIdx) => {
            const completedInChapter = chapter.lessons.filter(l =>
              userProgress.completedLessons.includes(l.id)
            ).length;
            const chapterProgress = chapter.lessons.length > 0 
              ? Math.round((completedInChapter / chapter.lessons.length) * 100)
              : 0;

            const isChapterCompleted = chapterProgress === 100;
            const ChapterIcon = getChapterIcon(chapter.id);
            const previousChapter = cIdx > 0 ? filteredChapters[cIdx - 1] : null;
            const hasCompletedInPrevious = previousChapter?.lessons.some(l =>
              userProgress.completedLessons.includes(l.id)
            );
            const isPreviousAllPremium = previousChapter?.lessons.every(l => l.isPremium);
            const isChapterUnlocked = cIdx === 0 || hasCompletedInPrevious || (isPreviousAllPremium && !proActive);

            return (
              <div key={chapter.id} className="relative">
                {/* Chapter Quest Banner Header */}
                <div className="sticky top-16 z-20 mb-6 p-4 rounded-2xl bg-surface border border-line shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ChapterIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                          {isDe ? `KAPITEL ${cIdx + 1}` : `CHAPTER ${cIdx + 1}`}
                        </span>
                        {isChapterCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {isDe ? 'ABGESCHLOSSEN' : 'COMPLETED'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white">
                        {isDe ? chapter.titleDe : chapter.titleEn}
                      </h2>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-blue-700 dark:text-blue-400">{completedInChapter}/{chapter.lessons.length}</span>
                    <p className="text-xs text-muted font-medium">{isDe ? 'Lektionen' : 'Lessons'}</p>
                  </div>
                </div>

                {/* Chapter Quest Nodes Path (Left-aligned timeline track to avoid text overlays) */}
                <div className="relative space-y-4 pl-14 py-2">
                  {/* Connecting Line background running strictly behind left milestone circles */}
                  <div className="absolute top-7 bottom-7 left-6 w-1 bg-slate-200 dark:bg-slate-700 rounded-full" />

                  {chapter.lessons.map((lesson, lIdx) => {
                    const isLessonCompleted = userProgress.completedLessons.includes(lesson.id);
                    const isCurrentActive = lesson.id === activeLessonId;
                    const previousLesson = lIdx > 0 ? chapter.lessons[lIdx - 1] : null;
                    const isPreviousCompleted = !previousLesson || userProgress.completedLessons.includes(previousLesson.id);
                    const canSkipPrevious = previousLesson?.isPremium && !proActive;
                    const isLessonUnlocked = isChapterUnlocked && (lIdx === 0 || isPreviousCompleted || canSkipPrevious);
                    const isLockedForFreeUser = lesson.isPremium && !proActive;

                    const ruleBadge = GERMAN_RULE_BADGES[lesson.id];

                    return (
                      <motion.div
                        key={lesson.id}
                        ref={isCurrentActive ? activeNodeRef : null}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: lIdx * 0.05 }}
                        className="relative z-10 flex items-center gap-4 w-full"
                      >
                        {/* Milestone Node Button (sitting on the left timeline track) */}
                        <div className="relative shrink-0 -ml-14">
                          {isCurrentActive && (
                            <div className="absolute -inset-2.5 rounded-full bg-blue-500/30 animate-ping opacity-75 pointer-events-none" />
                          )}

                          <button
                            onClick={() => onLessonSelect(lesson)}
                            aria-label={isDe ? lesson.titleDe : lesson.titleEn}
                            className={cn(
                              'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md',
                              isCurrentActive
                                ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 shadow-blue-500/30'
                                : isLessonCompleted
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/20'
                                : isLessonUnlocked && !isLockedForFreeUser
                                ? 'bg-surface-raised border border-line text-muted hover:border-slate-300 dark:hover:border-slate-600'
                                : 'bg-surface-raised border border-line text-slate-400 dark:text-slate-600'
                            )}
                          >
                            {isLessonCompleted ? (
                              <Check className="w-5 h-5 stroke-[3px]" />
                            ) : isCurrentActive ? (
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            ) : isLockedForFreeUser ? (
                              <Crown className="w-4 h-4 text-amber-400" />
                            ) : !isLessonUnlocked ? (
                              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            ) : (
                              <span>{lIdx + 1}</span>
                            )}
                          </button>

                          {/* Active "Start Here" Floating Badge */}
                          {isCurrentActive && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-lg whitespace-nowrap">
                              {isDe ? 'Start' : 'Start'}
                            </div>
                          )}
                        </div>

                        {/* Node Card Content (sitting cleanly to the right of node) */}
                        <button
                          type="button"
                          onClick={() => onLessonSelect(lesson)}
                          className={cn(
                            'flex-1 w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left',
                            isCurrentActive
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500/40 hover:border-blue-400 shadow-sm'
                              : isLessonCompleted
                              ? 'bg-surface border-emerald-500/30 hover:border-emerald-500/50'
                              : 'bg-surface border-line hover:border-slate-300 dark:hover:border-slate-600'
                          )}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {isDe ? lesson.titleDe : lesson.titleEn}
                            </h3>
                            {getLessonBadge(lesson)}
                          </div>

                          <p className="text-xs text-muted line-clamp-1 mb-2">
                            {isDe ? lesson.descriptionDe : lesson.descriptionEn}
                          </p>

                          {/* German Rule Pill Badge */}
                          {ruleBadge && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-surface-raised border border-line text-xs font-bold text-slate-600 dark:text-slate-300">
                              <ruleBadge.icon className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                              <span>{isDe ? ruleBadge.labelDe : ruleBadge.labelEn}</span>
                            </div>
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 3. Classic List View (Completed Chapters CLOSED with green badge, Active Chapter OPEN) */
        <div className="space-y-4">
          {filteredChapters.map((chapter, cIdx) => {
            const completedInChapter = chapter.lessons.filter(l =>
              userProgress.completedLessons.includes(l.id)
            ).length;
            const isChapterCompleted = chapter.lessons.length > 0 && completedInChapter === chapter.lessons.length;
            const isExpanded = expandedChapter === chapter.id;
            const ChapterIcon = getChapterIcon(chapter.id);

            return (
              <div key={chapter.id} className="rounded-2xl bg-surface border border-line overflow-hidden">
                <button
                  data-testid={`chapter-${chapter.id}`}
                  onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-raised transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      <ChapterIcon className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-muted uppercase tracking-wider">
                          {isDe ? `KAPITEL ${cIdx + 1}` : `CHAPTER ${cIdx + 1}`}
                        </span>
                        {isChapterCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {isDe ? '100% ABGESCHLOSSEN' : '100% COMPLETED'}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {isDe ? chapter.titleDe : chapter.titleEn}
                      </h3>
                      <p className="text-xs text-muted">{completedInChapter}/{chapter.lessons.length} {isDe ? 'Lektionen' : 'Lessons'}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-muted transition-transform', isExpanded && 'rotate-180')} />
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-2 border-t border-line">
                    {chapter.lessons.map((lesson) => {
                      const isLessonCompleted = userProgress.completedLessons.includes(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          data-testid={`lesson-${lesson.id}`}
                          onClick={() => onLessonSelect(lesson)}
                          className={cn(
                            'w-full p-3 min-h-11 rounded-xl border text-left flex items-center justify-between transition-all',
                            isLessonCompleted
                              ? 'bg-surface-raised border-emerald-500/30 hover:border-emerald-500/50'
                              : 'bg-surface-raised border-line hover:border-blue-500/40'
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{isDe ? lesson.titleDe : lesson.titleEn}</p>
                              {isLessonCompleted && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                            </div>
                            <p className="text-xs text-muted">{isDe ? lesson.descriptionDe : lesson.descriptionEn}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. License Selector Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-sm rounded-3xl bg-surface border border-line p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                {t.curriculum.changeLicense}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setLicenseType('manual');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                    isManualSelection
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                      : 'border-line hover:border-slate-300 dark:hover:border-slate-600 bg-surface-raised'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Cog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.curriculum.manual}
                    </p>
                    <p className="text-xs text-muted">
                      {t.curriculum.manualDesc}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setLicenseType('automatic');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                    isAutomaticSelection
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-line hover:border-slate-300 dark:hover:border-slate-600 bg-surface-raised'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.curriculum.automatic}
                    </p>
                    <p className="text-xs text-muted">
                      {t.curriculum.automaticDesc}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setLicenseType('umschreibung-manual');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                    isConversionManualSelection || isConversionAutomaticSelection
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-line hover:border-slate-300 dark:hover:border-slate-600 bg-surface-raised'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.curriculum.conversionManual}
                    </p>
                    <p className="text-xs text-muted">
                      {t.curriculum.conversionManualDesc}
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowLicenseModal(false)}
                className="mt-5 w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-3 min-h-11 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.common.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

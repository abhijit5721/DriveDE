/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Curriculum.tsx
 *
 * Visual Learning Path / Quest Map (Duolingo & Babbel Style):
 * Chapter 1 (Basics - Conversion: Germany Quickstart) rendered as an interactive 
 * milestone quest path with German rule quick-pills, slide-over lesson preview drawers, 
 * readiness impact counters, and progress rings.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, Check, Lock, Cog, Zap, 
  Settings2, BadgeCheck, Crown, Activity, X,
  Play, ArrowRight, Layers, TrendingUp, Clock, Compass
} from 'lucide-react';
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

// German rule badges mapped to specific lesson topics
const GERMAN_RULE_BADGES: Record<string, { labelDe: string; labelEn: string; icon: string }> = {
  'lesson-1': { labelDe: 'Sitzposition & Spiegel', labelEn: 'Seating & Mirror Setup', icon: '🪞' },
  'lesson-2': { labelDe: 'Schulterblick & Spiegel', labelEn: 'Schulterblick Check', icon: '👀' },
  'lesson-3': { labelDe: 'Vorfahrt (Rechts vor Links)', labelEn: 'Right-Before-Left Priority', icon: '⚠️' },
  'lesson-4': { labelDe: 'Spurwechsel & Blinken', labelEn: 'Lane Change & Indicators', icon: '↔️' },
  'lesson-5': { labelDe: 'Grüner Pfeil (Zeichen 720)', labelEn: 'Green Arrow Signal', icon: '🚦' },
  'lesson-6': { labelDe: 'Fahrzeug-Sicherheitskontrolle', labelEn: 'Pre-Drive Safety Check', icon: '🔍' },
  'lesson-7': { labelDe: 'Kreisverkehr (Zeichen 215)', labelEn: 'Roundabout Rules', icon: '🔄' },
  'lesson-8': { labelDe: 'Fußgängerüberweg (Zeichen 266)', labelEn: 'Zebra Crossing Priority', icon: '🚶' },
  'lesson-9': { labelDe: 'Parallel-Einparken 3D', labelEn: 'Parallel Parking 3D', icon: '🅿️' },
  'lesson-10': { labelDe: 'Rückwärts-Einparken 3D', labelEn: 'Reverse Parking 3D', icon: '🚗' },
  'lesson-11': { labelDe: 'Wenden in 3 Zügen', labelEn: 'Three-Point Turn', icon: '🔄' },
  'lesson-12': { labelDe: 'Gefahrenbremsung (Abstoppen)', labelEn: 'Emergency Stop Braking', icon: '⚡' },
  'lesson-13': { labelDe: 'Autobahn Einfädelungsstreifen', labelEn: 'Autobahn Ramp Merging', icon: '🛣️' },
  'lesson-14': { labelDe: 'Landstraße & Kurven', labelEn: 'Country Road & Passing', icon: '🌲' },
  'lesson-15': { labelDe: 'Nachtfahrt & Fernlicht', labelEn: 'Night Drive & High Beams', icon: '🌙' },
  'lesson-16': { labelDe: 'Prüfungssimulation 100%', labelEn: 'Full Exam Simulation', icon: '🏆' },
};

export function Curriculum({ onLessonSelect }: CurriculumProps) {
  const { language, userProgress, licenseType, setLicenseType, isProActive } = useAppStore();
  const proActive = isProActive();
  const t = TRANSLATIONS[language];
  const isDe = language === 'de';

  const [expandedChapter, setExpandedChapter] = useState<string | null>('chapter-2');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [selectedLessonForDrawer, setSelectedLessonForDrawer] = useState<Lesson | null>(null);
  const [viewMode, setViewMode] = useState<'quest' | 'list'>('quest');

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

  // Separate Chapter 1 (Basics & Germany Conversion Quickstart) from remaining chapters
  const chapter1 = useMemo(() => filteredChapters[0], [filteredChapters]);
  const otherChapters = useMemo(() => filteredChapters.slice(1), [filteredChapters]);

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

  const getChapterIcon = (chapterId: string) => {
    switch (chapterId) {
      case 'chapter-1': return '🇩🇪';
      case 'chapter-2': return '🅿️';
      case 'chapter-3': return '🏙️';
      case 'chapter-4': return '🛣️';
      case 'chapter-5': return '🏆';
      default: return '📚';
    }
  };

  const getLessonBadge = (lesson: Lesson) => {
    if (lesson.isPremium && !proActive) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
          <Crown className="h-3 w-3" />
          <span>Pro</span>
        </span>
      );
    }
    if (lesson.manualOnly) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[10px] font-bold text-orange-400">
          <Cog className="h-3 w-3" />
          <span>{t.curriculum.manualBadge}</span>
        </span>
      );
    }
    if (lesson.automaticOnly) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400">
          <Zap className="h-3 w-3" />
          <span>{t.curriculum.autoBadge}</span>
        </span>
      );
    }
    if (lesson.isInteractive) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
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
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {isDe ? 'Fahrlehrplan 2026' : 'Curriculum 2026'}
            </span>
            <span className="text-xs font-bold text-slate-400">• {completedCount}/{totalLessons} {isDe ? 'Lektionen' : 'Lessons'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.curriculum.title}
          </h1>
        </div>

        {/* View Mode Toggle & Path Settings */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('quest')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'quest'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isDe ? 'Quest Map' : 'Quest Map'}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                viewMode === 'list'
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
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Settings2 className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">
              {learningPath === 'umschreibung' ? 'Umschreibung' : transmissionType === 'manual' ? 'Schalter' : 'Automatik'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/20 p-4 sm:p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {learningPath === 'umschreibung'
                  ? (isDe ? '🇩🇪 Umschreibung ausländischer Führerschein' : '🇩🇪 Foreign License Conversion (Germany)')
                  : (isDe ? '🚗 Führerschein Klasse B Ausbildungsplan' : '🚗 Class B Driving License Curriculum')}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {isDe ? 'Gesamtfortschritt & Prüfungsbereitschaft' : 'Overall Progress & Exam Readiness'}
              </p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-blue-400">{overallProgress}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950/80 p-0.5 border border-slate-800">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 shadow-md shadow-blue-500/20"
          />
        </div>
      </div>

      {/* 2. Visual Quest Map View */}
      {viewMode === 'quest' ? (
        <div className="space-y-8 relative pt-2">
          
          {/* CHAPTER 1: BASICS & GERMAN DRIVING RULES QUEST PATH */}
          {chapter1 && (() => {
            const completedInCh1 = chapter1.lessons.filter(l =>
              userProgress.completedLessons.includes(l.id)
            ).length;
            const ch1Progress = Math.round((completedInCh1 / chapter1.lessons.length) * 100);
            const isCh1Completed = ch1Progress === 100;

            return (
              <div className="relative">
                {/* Chapter 1 Quest Banner */}
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 shadow-2xl backdrop-blur-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl shadow-inner">
                      {learningPath === 'umschreibung' ? '🇩🇪' : '🚗'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                          {isDe ? 'KAPITEL 1 • GRUNDLAGEN' : 'CHAPTER 1 • FUNDAMENTALS'}
                        </span>
                        {isCh1Completed && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {isDe ? 'ABGESCHLOSSEN' : 'COMPLETED'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base sm:text-xl font-extrabold text-white">
                        {isDe ? chapter1.titleDe : chapter1.titleEn}
                      </h2>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-blue-400">{completedInCh1}/{chapter1.lessons.length}</span>
                    <p className="text-[10px] text-slate-400 font-medium">{isDe ? 'Lektionen' : 'Lessons'}</p>
                  </div>
                </div>

                {/* Chapter 1 Quest Nodes Path */}
                <div className="relative space-y-4 pl-14 py-2">
                  {/* Connecting Line background running strictly behind left milestone circles */}
                  <div className="absolute top-7 bottom-7 left-6 w-1 bg-gradient-to-b from-blue-500/60 via-indigo-500/40 to-emerald-500/40 rounded-full" />

                  {chapter1.lessons.map((lesson, lIdx) => {
                    const isLessonCompleted = userProgress.completedLessons.includes(lesson.id);
                    const isCurrentActive = lesson.id === activeLessonId;
                    const previousLesson = lIdx > 0 ? chapter1.lessons[lIdx - 1] : null;
                    const isPreviousCompleted = !previousLesson || userProgress.completedLessons.includes(previousLesson.id);
                    const canSkipPrevious = previousLesson?.isPremium && !proActive;
                    const isLessonUnlocked = lIdx === 0 || isPreviousCompleted || canSkipPrevious;
                    const isLockedForFreeUser = lesson.isPremium && !proActive;

                    const ruleBadge = GERMAN_RULE_BADGES[lesson.id];

                    return (
                      <motion.div
                        key={lesson.id}
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
                            onClick={() => {
                              if (isLessonUnlocked && !isLockedForFreeUser) {
                                onLessonSelect(lesson);
                              } else {
                                setSelectedLessonForDrawer(lesson);
                              }
                            }}
                            className={cn(
                              'relative w-12 h-12 rounded-xl border-2 flex items-center justify-center text-base font-bold transition-all duration-300 transform shadow-xl',
                              isCurrentActive
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-white text-white scale-110 shadow-blue-500/50'
                                : isLessonCompleted
                                ? 'bg-emerald-600 border-emerald-400 text-white hover:scale-105'
                                : isLessonUnlocked && !isLockedForFreeUser
                                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-blue-400 hover:scale-105'
                                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60'
                            )}
                          >
                            {isLessonCompleted ? (
                              <Check className="w-5 h-5 stroke-[3px]" />
                            ) : isCurrentActive ? (
                              <Play className="w-5 h-5 fill-white ml-0.5" />
                            ) : isLockedForFreeUser ? (
                              <Crown className="w-4 h-4 text-amber-400" />
                            ) : !isLessonUnlocked ? (
                              <Lock className="w-4 h-4 text-slate-600" />
                            ) : (
                              <span>{lIdx + 1}</span>
                            )}
                          </button>

                          {/* Active "Start Here" Floating Badge */}
                          {isCurrentActive && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider shadow-lg whitespace-nowrap animate-bounce">
                              🎯 {isDe ? 'Start' : 'Start'}
                            </div>
                          )}
                        </div>

                        {/* Node Card Content (sitting cleanly to the right of node) */}
                        <div
                          onClick={() => setSelectedLessonForDrawer(lesson)}
                          className={cn(
                            'flex-1 p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer text-left',
                            isCurrentActive
                              ? 'bg-blue-950/40 border-blue-500/40 hover:border-blue-400 shadow-lg shadow-blue-500/10'
                              : isLessonCompleted
                              ? 'bg-slate-900/60 border-emerald-500/20 hover:border-emerald-500/40'
                              : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                          )}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <h3 className="text-xs sm:text-sm font-bold text-white">
                              {isDe ? lesson.titleDe : lesson.titleEn}
                            </h3>
                            {getLessonBadge(lesson)}
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">
                            {isDe ? lesson.descriptionDe : lesson.descriptionEn}
                          </p>

                          {/* German Rule Pill Badge */}
                          {ruleBadge && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                              <span>{ruleBadge.icon}</span>
                              <span>{isDe ? ruleBadge.labelDe : ruleBadge.labelEn}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* SUBSEQUENT CHAPTERS (CHAPTERS 2 TO 5) ACCORDION LIST */}
          <div className="pt-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
              {isDe ? 'Weitere Kapitel im Ausbildungsplan' : 'Next Chapters in Curriculum'}
            </h3>

            {otherChapters.map((chapter, cIdx) => {
              const completedInChapter = chapter.lessons.filter(l =>
                userProgress.completedLessons.includes(l.id)
              ).length;
              const chapterProgress = chapter.lessons.length > 0 
                ? Math.round((completedInChapter / chapter.lessons.length) * 100)
                : 0;

              const isExpanded = expandedChapter === chapter.id;
              const isCompleted = chapterProgress === 100;

              return (
                <div key={chapter.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
                  <button
                    onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getChapterIcon(chapter.id)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {isDe ? `KAPITEL ${cIdx + 2}` : `CHAPTER ${cIdx + 2}`}
                          </span>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                              ✓ {isDe ? 'FERTIG' : 'DONE'}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-white text-sm sm:text-base">
                          {isDe ? chapter.titleDe : chapter.titleEn}
                        </h3>
                        <p className="text-[11px] text-slate-400">{completedInChapter}/{chapter.lessons.length} {isDe ? 'Lektionen' : 'Lessons'}</p>
                      </div>
                    </div>
                    <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-2 border-t border-slate-800/80">
                      {chapter.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => onLessonSelect(lesson)}
                          className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-white">{isDe ? lesson.titleDe : lesson.titleEn}</p>
                              {getLessonBadge(lesson)}
                            </div>
                            <p className="text-[10px] text-slate-400">{isDe ? lesson.descriptionDe : lesson.descriptionEn}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* 3. Classic List View */
        <div className="space-y-4">
          {filteredChapters.map((chapter, cIdx) => {
            const completedInChapter = chapter.lessons.filter(l =>
              userProgress.completedLessons.includes(l.id)
            ).length;
            const isExpanded = expandedChapter === chapter.id;

            return (
              <div key={chapter.id} className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getChapterIcon(chapter.id)}</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isDe ? `KAPITEL ${cIdx + 1}` : `CHAPTER ${cIdx + 1}`}
                      </span>
                      <h3 className="font-bold text-white text-base">
                        {isDe ? chapter.titleDe : chapter.titleEn}
                      </h3>
                      <p className="text-xs text-slate-400">{completedInChapter}/{chapter.lessons.length} {isDe ? 'Lektionen' : 'Lessons'}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform', isExpanded && 'rotate-180')} />
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 space-y-2 border-t border-slate-800/80">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => onLessonSelect(lesson)}
                        className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{isDe ? lesson.titleDe : lesson.titleEn}</p>
                          <p className="text-[10px] text-slate-400">{isDe ? lesson.descriptionDe : lesson.descriptionEn}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Slide-Over Lesson Details Drawer */}
      <AnimatePresence>
        {selectedLessonForDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    {isDe ? 'Lektionsübersicht' : 'Lesson Overview'}
                  </span>
                  <button
                    onClick={() => setSelectedLessonForDrawer(null)}
                    className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-xl font-extrabold text-white mb-2">
                  {isDe ? selectedLessonForDrawer.titleDe : selectedLessonForDrawer.titleEn}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {isDe ? selectedLessonForDrawer.descriptionDe : selectedLessonForDrawer.descriptionEn}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>{isDe ? 'Dauer' : 'Duration'}</span>
                    </div>
                    <p className="text-sm font-bold text-white">⏱️ ~8 Min</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isDe ? 'Prüfungsreife' : 'Readiness'}</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">+15% Score</p>
                  </div>
                </div>

                {/* German Rules Highlights */}
                {GERMAN_RULE_BADGES[selectedLessonForDrawer.id] && (
                  <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 mb-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5">
                      {isDe ? '🇩🇪 Deutsche Straßenregel' : '🇩🇪 German Road Rule'}
                    </p>
                    <p className="text-xs font-bold text-white">
                      {isDe ? GERMAN_RULE_BADGES[selectedLessonForDrawer.id].labelDe : GERMAN_RULE_BADGES[selectedLessonForDrawer.id].labelEn}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => {
                    const l = selectedLessonForDrawer;
                    setSelectedLessonForDrawer(null);
                    onLessonSelect(l);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isDe ? 'Lektion jetzt starten' : 'Start Lesson Now'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. License Selector Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="mb-4 text-lg font-bold text-white">
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
                      ? 'border-orange-500 bg-orange-950/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                    <Cog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {t.curriculum.manual}
                    </p>
                    <p className="text-xs text-slate-400">
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
                      ? 'border-blue-500 bg-blue-950/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {t.curriculum.automatic}
                    </p>
                    <p className="text-xs text-slate-400">
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
                      ? 'border-purple-500 bg-purple-950/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {t.curriculum.conversionManual}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t.curriculum.conversionManualDesc}
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowLicenseModal(false)}
                className="mt-5 w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700"
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

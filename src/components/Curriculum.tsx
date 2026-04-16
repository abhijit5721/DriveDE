import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Check, Lock, Cog, Zap, Settings2, BadgeCheck, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { chapters } from '../data/curriculum';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../utils/license';
import { filterChaptersForSelection } from '../utils/contentFilter';
import { EmptyState } from './EmptyState';
import type { Lesson, Chapter } from '../types';

interface CurriculumProps {
  onLessonSelect: (lesson: Lesson) => void;
}

export function Curriculum({ onLessonSelect }: CurriculumProps) {
  const { language, userProgress, licenseType, setLicenseType } = useAppStore();
  const [expandedChapter, setExpandedChapter] = useState<string | null>('chapter-1');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const isDE = language === 'de';
  const learningPath = getLearningPathFromLicenseType(licenseType);
  const transmissionType = getTransmissionFromLicenseType(licenseType);
  const isManualSelection = transmissionType === 'manual' && learningPath === 'standard';
  const isAutomaticSelection = transmissionType === 'automatic' && learningPath === 'standard';
  const isConversionManualSelection = licenseType === 'umschreibung-manual';
  const isConversionAutomaticSelection = licenseType === 'umschreibung-automatic';

  const filteredChapters = useMemo((): Chapter[] => {
    return filterChaptersForSelection(chapters, transmissionType, learningPath);
  }, [transmissionType, learningPath]);

  const getChapterIcon = (chapterId: string) => {
    switch (chapterId) {
      case 'chapter-1': return '🚗';
      case 'chapter-2': return '🅿️';
      case 'chapter-3': return '🏙️';
      case 'chapter-4': return '🛣️';
      case 'chapter-5': return '🏆';
      default: return '📚';
    }
  };

  const getLessonBadge = (lesson: Lesson) => {
    if (lesson.id === 'basics-1a') {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          <BadgeCheck className="h-3 w-3" />
          {isDE ? 'Prüfung' : 'Exam'}
        </span>
      );
    }
    if (lesson.manualOnly) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
          <Cog className="h-3 w-3" />
          {isDE ? 'Schaltung' : 'Manual'}
        </span>
      );
    }
    if (lesson.automaticOnly) {
      return (
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
          <Zap className="h-3 w-3" />
          {isDE ? 'Automatik' : 'Auto'}
        </span>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div 
      className="space-y-4 pb-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* License Type Indicator */}
      <motion.button
        onClick={() => setShowLicenseModal(true)}
        className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-md transition-transform hover:scale-[1.02]"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            {learningPath === 'umschreibung' ? (
              <BadgeCheck className="h-6 w-6" />
            ) : transmissionType === 'manual' ? (
              <Cog className="h-6 w-6" />
            ) : (
              <Zap className="h-6 w-6" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium opacity-90">
              {isDE ? 'Führerscheinpfad' : 'License Path'}
            </p>
            <p className="text-lg font-bold">
              {learningPath === 'umschreibung'
                ? transmissionType === 'manual'
                  ? (isDE ? 'Umschreibung · Schaltgetriebe' : 'Conversion · Manual')
                  : (isDE ? 'Umschreibung · Automatik' : 'Conversion · Automatic')
                : transmissionType === 'manual'
                  ? (isDE ? 'Klasse B (Schaltgetriebe)' : 'Class B (Manual)')
                  : (isDE ? 'Klasse B197 (Automatik)' : 'Class B197 (Automatic)')}
            </p>
          </div>
        </div>
        <Settings2 className="h-5 w-5 opacity-80" />
      </motion.button>

      {/* License Switch Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-slate-800"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? 'Führerscheinklasse ändern' : 'Change License Class'}
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setLicenseType('manual');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    isManualSelection
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 hover:border-orange-300 dark:border-slate-700'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/50">
                    <Cog className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {isDE ? 'Schaltgetriebe' : 'Manual Transmission'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isDE ? 'Klasse B - Kupplung & Schalten' : 'Class B - Clutch & Shifting'}
                    </p>
                  </div>
                  {isManualSelection && (
                    <Check className="ml-auto h-5 w-5 text-orange-600" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setLicenseType('automatic');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    isAutomaticSelection
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 hover:border-blue-300 dark:border-slate-700'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {isDE ? 'Automatik' : 'Automatic'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isDE ? 'Klasse B197 - Ohne Kupplung' : 'Class B197 - No Clutch'}
                    </p>
                  </div>
                  {isAutomaticSelection && (
                    <Check className="ml-auto h-5 w-5 text-blue-600" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setLicenseType('umschreibung-manual');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    isConversionManualSelection
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 hover:border-purple-300 dark:border-slate-700'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
                    <BadgeCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {isDE ? 'Umschreibung · Schaltgetriebe' : 'Conversion · Manual'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isDE ? 'Keine Pflichtstunden, aber mit Schaltung' : 'No mandatory hours, but with manual transmission'}
                    </p>
                  </div>
                  {isConversionManualSelection && (
                    <Check className="ml-auto h-5 w-5 text-purple-600" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setLicenseType('umschreibung-automatic');
                    setShowLicenseModal(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    isConversionAutomaticSelection
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 hover:border-purple-300 dark:border-slate-700'
                  )}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/50">
                    <BadgeCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {isDE ? 'Umschreibung · Automatik' : 'Conversion · Automatic'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {isDE ? 'Keine Pflichtstunden, nur Automatik-Inhalte' : 'No mandatory hours, automatic-only content'}
                    </p>
                  </div>
                  {isConversionAutomaticSelection && (
                    <Check className="ml-auto h-5 w-5 text-purple-600" />
                  )}
                </button>
              </div>

              <button
                onClick={() => setShowLicenseModal(false)}
                className="mt-4 w-full rounded-lg bg-slate-100 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                {isDE ? 'Schließen' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="mb-6" variants={itemVariants}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isDE ? 'Lehrplan' : 'Curriculum'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {learningPath === 'umschreibung'
            ? isDE
              ? 'Fokussierter Deutschland-Pfad für Umschreibung: deutsche Prüfungsfallen, Vorfahrtsregeln, Schulterblick und Prüfer-Kommandos.'
              : 'Focused Germany path for license conversion: German exam traps, right-of-way rules, shoulder checks, and examiner commands.'
            : isDE
              ? 'Vollständiger Lernpfad von Grundlagen über Manöver bis zur praktischen Prüfung.'
              : 'Complete learning path from basics through maneuvers to the practical exam.'}
        </p>
      </motion.div>

      {/* Progress Overview */}
      {filteredChapters.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={<BookOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />}
            title={isDE ? 'Keine Lektionen' : 'No Lessons'}
            message={isDE ? 'Für diesen Lernpfad sind noch keine Lektionen verfügbar. Schau bald wieder vorbei!' : 'No lessons are available for this learning path yet. Check back soon!'}
          />
        </motion.div>
      ) : (
        <motion.div 
          className="relative mb-6"
          variants={containerVariants}
        >
          <div className="absolute left-6 top-0 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
          <div className="relative space-y-4">
            {filteredChapters.map((chapter, index) => {
              const completedInChapter = chapter.lessons.filter(l =>
                userProgress.completedLessons.includes(l.id)
              ).length;
              const chapterProgress = chapter.lessons.length > 0 
                ? Math.round((completedInChapter / chapter.lessons.length) * 100)
                : 0;
              const isExpanded = expandedChapter === chapter.id;
              const isCompleted = chapterProgress === 100;
              const isUnlocked = index === 0 || filteredChapters[index - 1].lessons.some(l =>
                userProgress.completedLessons.includes(l.id)
              );

              return (
                <motion.div key={chapter.id} variants={itemVariants}>
                  <button
                    onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                    disabled={!isUnlocked}
                    className={cn(
                      'relative flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all',
                      isUnlocked
                        ? 'bg-white shadow-sm hover:shadow-md dark:bg-slate-800'
                        : 'bg-slate-50 opacity-60 dark:bg-slate-800/50'
                    )}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl',
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/50'
                          : isUnlocked
                          ? 'bg-blue-100 dark:bg-blue-900/50'
                          : 'bg-slate-200 dark:bg-slate-700'
                      )}
                    >
                      {isUnlocked ? getChapterIcon(chapter.id) : <Lock className="h-5 w-5 text-slate-400" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {isDE ? chapter.titleDe : chapter.titleEn}
                        </h3>
                        {isCompleted && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {isDE ? chapter.descriptionDe : chapter.descriptionEn}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            )}
                            style={{ width: `${chapterProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">
                          {completedInChapter}/{chapter.lessons.length}
                        </span>
                      </div>
                    </div>

                    {isUnlocked && (
                      <motion.div 
                        className="transition-transform"
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                      >
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      </motion.div>
                    )}
                  </button>

                  {/* Lessons List */}
                  <AnimatePresence>
                    {isExpanded && isUnlocked && (
                      <motion.div 
                        key={chapter.id}
                        className="ml-14 mt-2 space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {chapter.lessons.map((lesson, lessonIndex) => {
                          const isLessonCompleted = userProgress.completedLessons.includes(lesson.id);
                          const isPreviousCompleted = lessonIndex === 0 ||
                            userProgress.completedLessons.includes(chapter.lessons[lessonIndex - 1].id);
                          const isLessonUnlocked = lessonIndex === 0 || isPreviousCompleted;

                          return (
                            <motion.button
                              key={lesson.id}
                              onClick={() => isLessonUnlocked && onLessonSelect(lesson)}
                              disabled={!isLessonUnlocked}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all',
                                isLessonUnlocked
                                  ? 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700'
                                  : 'bg-slate-50 opacity-50 dark:bg-slate-800/50'
                              )}
                              variants={itemVariants}
                            >
                              <div
                                className={cn(
                                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                                  isLessonCompleted
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                                    : isLessonUnlocked
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700'
                                )}
                              >
                                {isLessonCompleted ? (
                                  <Check className="h-4 w-4" />
                                ) : isLessonUnlocked ? (
                                  <span className="text-sm font-medium">{lessonIndex + 1}</span>
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                                    {isDE ? lesson.titleDe : lesson.titleEn}
                                  </h4>
                                  {getLessonBadge(lesson)}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {isDE ? lesson.descriptionDe : lesson.descriptionEn}
                                </p>
                              </div>
                              {isLessonUnlocked && (
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              )}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

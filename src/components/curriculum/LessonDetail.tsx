/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
  BookOpen,
  Eye,
  RotateCcw,
  RotateCw,
  ArrowRight,
  ArrowUp,
  Search,
  Target,
  Square,
  AlignCenter,
  Circle,
  Lock,
  Activity,
  CornerDownRight,
  Film,
  ScanSearch,
  Shield,
  Gauge,
  GraduationCap,
  Zap,
  Volume2,
  Car,
  Trophy,
  Wrench,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { ParkingDiagram } from '../maneuvers/ParkingDiagram';
import AnimatedManeuver from '../maneuvers/AnimatedManeuver';
import { TrafficSignIcon } from '../common/TrafficSignIcon';
import { PageHeader } from '../layout/PageHeader';
import InteractiveVorfahrt from '../maneuvers/InteractiveVorfahrt';
import InteractiveMirrorCheck from '../maneuvers/InteractiveMirrorCheck';
import InteractiveRoundabout from '../maneuvers/InteractiveRoundabout';
import InteractiveEmergencyBrake from '../maneuvers/InteractiveEmergencyBrake';
import InteractiveParking from '../maneuvers/InteractiveParking';
import InteractiveTechCheck from '../maneuvers/InteractiveTechCheck';
import InteractiveExamSimulation from '../maneuvers/InteractiveExamSimulation';
import type { Lesson } from '../../types';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
}

type AnimationType = 'parallel-parking' | 'reverse-parking' | 'three-point-turn' | 'emergency-brake' | 'roundabout' | 'highway-merge';

const getAnimationType = (lessonId: string): AnimationType | null => {
  const mapping: Record<string, AnimationType> = {
    'maneuver-1': 'parallel-parking',
    'maneuver-2': 'reverse-parking',
    'maneuver-3': 'three-point-turn',
    'maneuver-4': 'emergency-brake',
    'city-4': 'roundabout',
    'special-2': 'highway-merge',
  };
  return mapping[lessonId] || null;
};

export function LessonDetail({ lesson, onBack }: LessonDetailProps) {
  const { language, completeLesson, userProgress } = useAppStore();
  const isDE = language === 'de';
  const [activeLessonTab, setActiveLessonTab] = useState<'learn' | 'rules' | 'quiz'>('learn');
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const [rulesSubFilter, setRulesSubFilter] = useState<'all' | 'commands' | 'vocab' | 'signs' | 'scenarios'>('all');
  const [speakingCommandId, setSpeakingCommandId] = useState<string | null>(null);

  const handleSpeakCommand = (commandId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    setSpeakingCommandId(commandId);
    utterance.onend = () => setSpeakingCommandId(null);
    utterance.onerror = () => setSpeakingCommandId(null);
    window.speechSynthesis.speak(utterance);
  };

  const t = TRANSLATIONS[language];
  const isCompleted = userProgress.completedLessons.includes(lesson.id);
  const animationType = getAnimationType(lesson.id);

  const hasRulesTab = Boolean(
    (lesson.glossary && lesson.glossary.length > 0) ||
    (lesson.examinerCommands && lesson.examinerCommands.length > 0) ||
    (lesson.trafficSigns && lesson.trafficSigns.length > 0) ||
    (lesson.guidedPoints && lesson.guidedPoints.length > 0) ||
    (lesson.scenarios && lesson.scenarios.length > 0)
  );

  const hasQuizTab = Boolean(lesson.quiz && lesson.quiz.length > 0);

  const getStepIcon = (iconName: string, className = 'h-8 w-8') => {
    switch (iconName) {
      case 'Search': return <Search className={className} />;
      case 'ArrowRight': return <ArrowRight className={className} />;
      case 'ArrowLeft': return <ArrowLeft className={className} />;
      case 'ArrowUp': return <ArrowUp className={className} />;
      case 'Eye': return <Eye className={className} />;
      case 'RotateCcw': return <RotateCcw className={className} />;
      case 'RotateCw': return <RotateCw className={className} />;
      case 'AlignCenter': return <AlignCenter className={className} />;
      case 'CheckCircle': return <CheckCircle className={className} />;
      case 'Target': return <Target className={className} />;
      case 'CornerDownRight': return <CornerDownRight className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'Circle': return <Circle className={className} />;
      case 'Grip': return <Lock className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Lock': return <Lock className={className} />;
      case 'Square': return <Square className={className} />;
      case 'Gauge': return <Gauge className={className} />;
      default: return <Circle className={className} />;
    }
  };

  const getGuidedPointIcon = (emphasis?: string) => {
    switch (emphasis) {
      case 'look':
        return <ScanSearch className="h-5 w-5" />;
      case 'priority':
        return <Shield className="h-5 w-5" />;
      case 'speed':
        return <Gauge className="h-5 w-5" />;
      case 'exam':
        return <GraduationCap className="h-5 w-5" />;
      case 'safety':
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  const handleNextStep = () => {
    if (lesson.steps && currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (lesson.quiz && lesson.quiz.length > 0) {
      setShowQuiz(true);
    } else {
      completeLesson(lesson.id);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizAnswer = (optionId: string) => {
    setSelectedAnswer(optionId);
    setShowExplanation(true);
  };

  const handleFinish = () => {
    if (lesson.quiz && lesson.quiz.length > 0 && !showQuiz) {
      setShowQuiz(true);
    } else {
      completeLesson(lesson.id);
      onBack();
    }
  };

  const isVorfahrtLesson = lesson.isInteractive && (lesson.id === 'city-1' || lesson.id === 'city-2' || lesson.id === 'city-12');
  const isMirrorLesson = ['city-5', 'city-6'].includes(lesson.id);
  const isRoundaboutLesson = lesson.id === 'city-3';
  const isEmergencyBrakeLesson = lesson.id.startsWith('maneuver-4');
  const isParkingLesson = lesson.id === 'maneuver-1';
  const isTechLesson = lesson.id === 'basics-1a';
  const isExamSim = lesson.id === 'exam-sim';

  if (showQuiz && lesson.quiz && lesson.quiz.length > 0) {
    const question = lesson.quiz[0];
    const isCorrect = selectedAnswer === question.correctOptionId;

    return (
      <div className="pb-6">
        <PageHeader title={t.curriculum.quiz} onBack={() => setShowQuiz(false)} />

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800 mt-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {language === 'de' ? question.questionDe : question.questionEn}
          </h3>

          <div className="mt-4 space-y-2">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => !showExplanation && handleQuizAnswer(option.id)}
                disabled={showExplanation}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all',
                  showExplanation
                    ? option.id === question.correctOptionId
                      ? 'bg-green-100 ring-2 ring-green-500 dark:bg-green-900/30'
                      : option.id === selectedAnswer
                      ? 'bg-red-100 ring-2 ring-red-500 dark:bg-red-900/30'
                      : 'bg-slate-100 dark:bg-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    showExplanation && option.id === question.correctOptionId
                      ? 'bg-green-500 text-white'
                      : showExplanation && option.id === selectedAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-slate-700 dark:bg-slate-600 dark:text-white'
                  )}
                >
                  {option.id.toUpperCase()}
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {language === 'de' ? option.textDe : option.textEn}
                </span>
              </button>
            ))}
          </div>

          {showExplanation && (
            <div
              className={cn(
                'mt-4 rounded-xl p-4',
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-red-50 dark:bg-red-900/20'
              )}
            >
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={cn(
                    'font-semibold',
                    isCorrect
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                  )}
                >
                  {isCorrect
                    ? t.curriculum.correct
                    : t.curriculum.incorrect}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                {language === 'de' ? question.explanationDe : question.explanationEn}
              </p>
            </div>
          )}

          {showExplanation && (
            <button
              onClick={handleFinish}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
            >
              {t.curriculum.completeLesson}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-12 space-y-6">
      {/* 1. Header & Quick Back */}
      <PageHeader title={isDE ? lesson.titleDe : lesson.titleEn} onBack={onBack} />

      {/* 2. Premium Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          {isDE ? lesson.descriptionDe : lesson.descriptionEn}
        </p>

        {/* Quick Metrics Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            ⏱️ ~8 Min
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            +15% {isDE ? 'Prüfungsreife' : 'Exam Score'}
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              {isDE ? 'Abgeschlossen' : 'Completed'}
            </span>
          )}
          {lesson.learningPath === 'both' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/15 border border-blue-500/30 text-xs font-bold text-blue-400">
              🇩🇪 {isDE ? 'Umschreibung & Ersterwerb' : 'Conversion & Standard'}
            </span>
          )}
        </div>
      </div>

      {/* 3. Segmented 3-Tab Workspace Switcher */}
      <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveLessonTab('learn')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5',
            activeLessonTab === 'learn'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isDE ? 'Lernen & Praxis' : 'Learn & Practice'}</span>
        </button>

        {hasRulesTab && (
          <button
            onClick={() => setActiveLessonTab('rules')}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5',
              activeLessonTab === 'rules'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Shield className="w-4 h-4" />
            <span>{isDE ? 'Regeln & Prüfer' : 'Examiner & Rules'}</span>
          </button>
        )}

        {hasQuizTab && (
          <button
            onClick={() => setActiveLessonTab('quiz')}
            className={cn(
              'flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5',
              activeLessonTab === 'quiz'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isDE ? 'Wissensprüfung' : 'Knowledge Quiz'}</span>
          </button>
        )}
      </div>

      {/* --- TAB 1: LEARN & PRACTICE --- */}
      {activeLessonTab === 'learn' && (
        <div className="space-y-6">
          {/* Interactive Vorfahrt Simulator */}
          {isVorfahrtLesson && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.interactiveSimulator}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.masterSituation}
                  </p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <InteractiveVorfahrt 
                  key={lesson.id}
                  onComplete={handleFinish} 
                  language={language} 
                  scenario={lesson.simulatorScenario}
                  scenarios={lesson.simulatorScenarios}
                />
              </div>
            </div>
          )}

          {/* Interactive Mirror Check Section */}
          {isMirrorLesson && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                  <Eye className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.shoulderScan}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.scanningSequence}
                  </p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <InteractiveMirrorCheck 
                  onComplete={handleFinish} 
                  language={language}
                  direction={lesson.id === 'city-5' ? 'right' : 'left'} 
                />
              </div>
            </div>
          )}

          {/* Interactive Roundabout Section */}
          {isRoundaboutLesson && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.roundaboutCheck}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.signalingRules}
                  </p>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <InteractiveRoundabout onComplete={handleFinish} language={language} />
              </div>
            </div>
          )}

          {/* Interactive Emergency Brake Section */}
          {isEmergencyBrakeLesson && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.emergencyBrakeCheck}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.reactionTimeTraining}
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <InteractiveEmergencyBrake onComplete={handleFinish} language={language} />
              </div>
            </div>
          )}

          {/* Interactive Parking Section */}
          {isParkingLesson && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.parkingCheck}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.parallelParkingStep}
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <InteractiveParking onComplete={handleFinish} language={language} />
              </div>
            </div>
          )}

          {/* Interactive Tech Check Section */}
          {isTechLesson && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.vehicleCheck}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.techKnowledge}
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
                <InteractiveTechCheck onComplete={handleFinish} language={language} />
              </div>
            </div>
          )}

          {/* Interactive Exam Simulation Section */}
          {isExamSim && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.curriculum.examSimulation}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.expertFeedback}
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
                <InteractiveExamSimulation onComplete={handleFinish} language={language} />
              </div>
            </div>
          )}

          {/* Instructor Tips & Practical How-To Instructions */}
          {lesson.tips && lesson.tips.length > 0 && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {isDE ? '💡 Experten-Tipps & Praxishinweise' : '💡 Expert Tips & Instructions'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isDE ? 'Wichtige Ratschläge vom Fahrlehrer für die Praxis' : 'Key practical advice from driving instructors'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {lesson.tips.map((tip) => (
                  <div
                    key={tip.id}
                    className={cn(
                      'rounded-2xl p-4 border space-y-1.5 shadow-md',
                      tip.type === 'warning'
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : tip.type === 'success'
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    )}
                  >
                    <p className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>{tip.type === 'warning' ? '⚠️' : tip.type === 'success' ? '✅' : '💡'}</span>
                      <span>{isDE ? tip.titleDe : tip.titleEn}</span>
                    </p>
                    <p className="text-xs leading-relaxed text-slate-300">
                      {isDE ? tip.contentDe : tip.contentEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Guided Walkthrough */}
          {lesson.steps && lesson.steps.length > 0 && (
            <div className="space-y-4">
              {/* Progress Dots */}
              <div className="flex justify-center gap-2 py-1">
                {lesson.steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      idx === currentStep
                        ? 'w-8 bg-blue-500'
                        : idx < currentStep
                        ? 'w-2 bg-emerald-500'
                        : 'w-2 bg-slate-800'
                    )}
                  />
                ))}
              </div>

              {/* Animation Toggle Button */}
              {animationType && (
                <button
                  onClick={() => setShowAnimation(!showAnimation)}
                  className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-bold text-sm transition-all',
                    showAnimation
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                  )}
                >
                  <Film className="h-4 w-4" />
                  {showAnimation
                    ? t.curriculum.animationHide
                    : t.curriculum.animationWatch}
                </button>
              )}

              {/* Animated Guide */}
              {showAnimation && animationType && (
                <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl">
                  <AnimatedManeuver type={animationType} language={language} />
                </div>
              )}

              {/* Current Step Card */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    {t.curriculum.step} {currentStep + 1} / {lesson.steps.length}
                  </span>
                  {lesson.steps[currentStep].critical && (
                    <span className="flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {t.curriculum.critical}
                    </span>
                  )}
                </div>

                {/* Diagram Visualization */}
                {lesson.id.startsWith('maneuver') && !showAnimation && (
                  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
                    <ParkingDiagram
                      type={
                        lesson.id === 'maneuver-1' ? 'parallel' :
                        lesson.id === 'maneuver-2' ? 'reverse' :
                        lesson.id === 'maneuver-3' ? 'threepoint' :
                        'emergency'
                      }
                      step={currentStep}
                    />
                  </div>
                )}

                {/* Step Icon */}
                <div
                  className={cn(
                    'mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg',
                    lesson.steps[currentStep].critical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  )}
                >
                  {getStepIcon(lesson.steps[currentStep].icon)}
                </div>

                <h3 className="text-center text-lg sm:text-xl font-extrabold text-white">
                  {isDE
                    ? lesson.steps[currentStep].titleDe
                    : lesson.steps[currentStep].titleEn}
                </h3>

                <p className="text-center text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isDE
                    ? lesson.steps[currentStep].descriptionDe
                    : lesson.steps[currentStep].descriptionEn}
                </p>

                {/* Step Navigation Bar */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl transition-all border',
                      currentStep === 0
                        ? 'bg-slate-950 border-slate-800/50 text-slate-700'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={handleNextStep}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {currentStep === lesson.steps.length - 1
                      ? hasQuizTab
                        ? t.curriculum.goToQuiz
                        : t.curriculum.complete
                      : t.curriculum.nextStep}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Step Overview List */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t.curriculum.allSteps}
                </h4>
                <div className="space-y-2">
                  {lesson.steps.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(idx)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all border',
                        idx === currentStep
                          ? 'bg-blue-950/40 border-blue-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black',
                          idx < currentStep
                            ? 'bg-emerald-600 text-white'
                            : idx === currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        )}
                      >
                        {idx < currentStep ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold flex-1">
                        {isDE ? step.titleDe : step.titleEn}
                      </span>
                      {step.critical && (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Direct Complete Button for lessons without steps or quiz */}
          {(!lesson.steps || lesson.steps.length === 0) && hasQuizTab && (
            <button
              onClick={() => setActiveLessonTab('quiz')}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isDE ? 'Zur Wissensprüfung' : 'Go to Knowledge Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {(!lesson.steps || lesson.steps.length === 0) && !hasQuizTab && (
            <button
              onClick={handleFinish}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{isDE ? 'Lektion abschließen' : 'Complete Lesson'}</span>
            </button>
          )}
        </div>
      )}

      {/* --- TAB 2: EXAMINER & RULES --- */}
      {activeLessonTab === 'rules' && hasRulesTab && (
        <div className="space-y-6">
          {/* Sub-Category Filter Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setRulesSubFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0',
                rulesSubFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-900 hover:text-slate-200'
              )}
            >
              {isDE ? 'Alle Inhalte' : 'All Topics'}
            </button>

            {lesson.examinerCommands && lesson.examinerCommands.length > 0 && (
              <button
                onClick={() => setRulesSubFilter('commands')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
                  rulesSubFilter === 'commands'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40'
                )}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{isDE ? '🗣️ Prüfer-Befehle' : '🗣️ Examiner Commands'}</span>
              </button>
            )}

            {lesson.glossary && lesson.glossary.length > 0 && (
              <button
                onClick={() => setRulesSubFilter('vocab')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
                  rulesSubFilter === 'vocab'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-blue-950/40 text-blue-300 border border-blue-500/20 hover:border-blue-500/40'
                )}
              >
                <Info className="w-3.5 h-3.5" />
                <span>{isDE ? '💡 Vokabeln' : '💡 Key Vocabulary'}</span>
              </button>
            )}

            {lesson.trafficSigns && lesson.trafficSigns.length > 0 && (
              <button
                onClick={() => setRulesSubFilter('signs')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
                  rulesSubFilter === 'signs'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-500/20 hover:border-amber-500/40'
                )}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isDE ? '🛑 Verkehrszeichen' : '🛑 Traffic Signs'}</span>
              </button>
            )}

            {lesson.scenarios && lesson.scenarios.length > 0 && (
              <button
                onClick={() => setRulesSubFilter('scenarios')}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5',
                  rulesSubFilter === 'scenarios'
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-red-950/40 text-red-300 border border-red-500/20 hover:border-red-500/40'
                )}
              >
                <Target className="w-3.5 h-3.5" />
                <span>{isDE ? '⚠️ Fallen & Traps' : '⚠️ Traps & Scenarios'}</span>
              </button>
            )}
          </div>

          {/* SECTION 1: EXAMINER VOICE COMMAND AUDIO CARDS */}
          {lesson.examinerCommands && lesson.examinerCommands.length > 0 && (rulesSubFilter === 'all' || rulesSubFilter === 'commands') && (
            <div className="rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-500/30 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 font-bold">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{t.curriculum.typicalExaminer}</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                        TÜV / DEKRA
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {t.curriculum.examinerSub}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {lesson.examinerCommands.map((command) => (
                  <div key={command.id} className="rounded-2xl border border-indigo-500/25 bg-slate-950/90 p-4.5 space-y-3 shadow-lg">
                    {/* Header + Speech Audio Play Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider">
                          🗣️ PRÜFER
                        </span>
                        <div>
                          <p className="text-base sm:text-lg font-black text-white notranslate leading-snug" translate="no">
                            "{command.commandDe}"
                          </p>
                          <p className="text-xs font-semibold text-slate-400 italic mt-0.5">
                            ({command.commandEn})
                          </p>
                        </div>
                      </div>

                      {/* Interactive German Speech Synthesis Button */}
                      <button
                        onClick={() => handleSpeakCommand(command.id, command.commandDe)}
                        className={cn(
                          'shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border',
                          speakingCommandId === command.id
                            ? 'bg-indigo-600 text-white border-indigo-400 animate-pulse'
                            : 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 hover:text-white'
                        )}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{speakingCommandId === command.id ? (isDE ? 'Spielt...' : 'Playing...') : (isDE ? 'Anhören' : 'Listen')}</span>
                      </button>
                    </div>

                    {/* Examiner Expectation Action Guide */}
                    {(command.noteDe || command.noteEn) && (
                      <div className="rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/20 p-3.5 text-xs text-indigo-200 leading-relaxed space-y-1">
                        <div className="flex items-center gap-1.5 font-extrabold text-indigo-400 uppercase tracking-wider text-[11px]">
                          <span>🎯</span>
                          <span>{isDE ? 'WAS DER PRÜFER ZWINGEND ERWARTET:' : 'WHAT THE EXAMINER EXPECTS:'}</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {isDE ? command.noteDe : command.noteEn}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: GERMAN VOCABULARY FLASHCARDS */}
          {lesson.glossary && lesson.glossary.length > 0 && (rulesSubFilter === 'all' || rulesSubFilter === 'vocab') && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold">
                  <Info className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {t.curriculum.keyTerms}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.glossarySub}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {lesson.glossary.map((term) => (
                  <div key={term.id} className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-2.5 hover:border-slate-700 transition-all shadow-md">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <p className="text-base font-extrabold text-blue-400 notranslate" translate="no">
                        {term.german}
                      </p>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                        DE TERMINOLOGY
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-200">{term.english}</p>
                    {(term.noteDe || term.noteEn) && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] leading-relaxed text-amber-200/90 flex items-start gap-1.5 bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                        <span className="text-amber-400 font-extrabold shrink-0">💡 Examen-Tipp:</span>
                        <span>{isDE ? term.noteDe : term.noteEn}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2.5: GUIDED POINTS */}
          {lesson.guidedPoints && lesson.guidedPoints.length > 0 && (rulesSubFilter === 'all' || rulesSubFilter === 'vocab') && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 font-bold">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {t.curriculum.guidedPoints}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.guidedPointsSub}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {lesson.guidedPoints.map((point) => (
                  <div
                    key={point.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                        {getGuidedPointIcon(point.emphasis)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {isDE ? point.titleDe : point.titleEn}
                        </p>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                          {isDE ? point.contentDe : point.contentEn}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: STVO TRAFFIC SIGNS & TECH INSPECTOR */}
          {lesson.trafficSigns && lesson.trafficSigns.length > 0 && (rulesSubFilter === 'all' || rulesSubFilter === 'signs') && (
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                  {lesson.trafficSigns[0]?.category === 'vehicle-check' ? (
                    <Wrench className="h-5 w-5" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {lesson.trafficSigns[0]?.category === 'vehicle-check'
                      ? (isDE ? 'Fahrzeugkontrolle & Technik' : 'Vehicle Check & Tech')
                      : t.curriculum.importantSigns}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lesson.trafficSigns[0]?.category === 'vehicle-check'
                      ? (isDE ? 'Wichtige Kontrollen vor der Prüfung' : 'Important pre-drive test checks')
                      : t.curriculum.signsSub}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {lesson.trafficSigns.map((sign) => (
                  <div
                    key={sign.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <TrafficSignIcon sign={sign} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-extrabold text-white leading-tight">
                            {isDE ? sign.titleDe : sign.titleEn}
                          </p>
                          {sign.code && (
                            <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-300">
                              {sign.code}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                          {isDE ? sign.descriptionDe : sign.descriptionEn}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: EXAM TRAPS & TYPICAL SCENARIOS */}
          {lesson.scenarios && lesson.scenarios.length > 0 && (rulesSubFilter === 'all' || rulesSubFilter === 'scenarios') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-400" />
                <h4 className="text-base font-extrabold text-white">
                  {isDE
                    ? (lesson.scenarioSectionTitleDe || t.curriculum.typicalScenarios)
                    : (lesson.scenarioSectionTitleEn || t.curriculum.typicalScenarios)}
                </h4>
              </div>

              {lesson.scenarios.map((scenario) => (
                <div 
                  key={scenario.id} 
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl space-y-4 p-5"
                >
                  <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm sm:text-base font-extrabold text-white">
                        {isDE ? scenario.titleDe : scenario.titleEn}
                      </h5>
                      <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">
                        {isDE ? scenario.situationDe : scenario.situationEn}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {scenario.steps.map((step, idx) => (
                      <div key={`${scenario.id}-${step.id}`} className="flex gap-3 items-start p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-black',
                          step.critical 
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                            : 'bg-indigo-600 text-white'
                        )}>
                          {step.icon ? getStepIcon(step.icon, 'h-4 w-4') : (idx + 1)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm font-extrabold text-white">
                              {isDE ? step.titleDe : step.titleEn}
                            </p>
                            {step.critical && (
                              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider border border-red-500/30">
                                ⚠️ EXAM FAIL TRAP
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                            {isDE ? step.descriptionDe : step.descriptionEn}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 3: KNOWLEDGE QUIZ --- */}
      {activeLessonTab === 'quiz' && hasQuizTab && lesson.quiz && lesson.quiz.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {(() => {
            const currentQuiz = lesson.quiz[0];
            return (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    {t.curriculum.quiz}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  {isDE ? currentQuiz.questionDe : currentQuiz.questionEn}
                </h3>

                <div className="space-y-2.5 pt-2">
                  {currentQuiz.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !showExplanation && handleQuizAnswer(option.id)}
                      disabled={showExplanation}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all border',
                        showExplanation
                          ? option.id === currentQuiz.correctOptionId
                            ? 'bg-emerald-950/60 border-emerald-500/60 text-white'
                            : option.id === selectedAnswer
                            ? 'bg-red-950/60 border-red-500/60 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          : 'bg-slate-950 border-slate-800 hover:border-blue-500/40 text-slate-200'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black',
                          showExplanation && option.id === currentQuiz.correctOptionId
                            ? 'bg-emerald-500 text-white'
                            : showExplanation && option.id === selectedAnswer
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-800 text-slate-300'
                        )}
                      >
                        {option.id.toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold flex-1">
                        {isDE ? option.textDe : option.textEn}
                      </span>
                    </button>
                  ))}
                </div>

                {showExplanation && (
                  <div
                    className={cn(
                      'rounded-2xl p-4 border space-y-2',
                      selectedAnswer === currentQuiz.correctOptionId
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    )}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                      {selectedAnswer === currentQuiz.correctOptionId ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span>{t.curriculum.correct}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                          <span>{t.curriculum.incorrect}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                      {isDE ? currentQuiz.explanationDe : currentQuiz.explanationEn}
                    </p>
                  </div>
                )}

                {showExplanation && (
                  <button
                    onClick={handleFinish}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-sm text-white shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.curriculum.completeLesson}</span>
                  </button>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

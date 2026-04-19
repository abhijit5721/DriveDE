import { useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  CheckCircle,
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
  Car,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { ParkingDiagram } from './ParkingDiagram';
import AnimatedManeuver from './AnimatedManeuver';
import { TrafficSignIcon } from './TrafficSignIcon';
import { PageHeader } from './PageHeader';
import InteractiveVorfahrt from './InteractiveVorfahrt';
import InteractiveMirrorCheck from './InteractiveMirrorCheck';
import InteractiveRoundabout from './InteractiveRoundabout';
import InteractiveEmergencyBrake from './InteractiveEmergencyBrake';
import InteractiveParking from './InteractiveParking';
import type { Lesson } from '../types';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isSimulatorComplete, setIsSimulatorComplete] = useState(false);

  const isDE = language === 'de';
  const isCompleted = userProgress.completedLessons.includes(lesson.id);
  const animationType = getAnimationType(lesson.id);

  const getStepIcon = (iconName: string) => {
    const iconClass = 'h-8 w-8';
    switch (iconName) {
      case 'Search': return <Search className={iconClass} />;
      case 'ArrowRight': return <ArrowRight className={iconClass} />;
      case 'ArrowLeft': return <ArrowLeft className={iconClass} />;
      case 'ArrowUp': return <ArrowUp className={iconClass} />;
      case 'Eye': return <Eye className={iconClass} />;
      case 'RotateCcw': return <RotateCcw className={iconClass} />;
      case 'RotateCw': return <RotateCw className={iconClass} />;
      case 'AlignCenter': return <AlignCenter className={iconClass} />;
      case 'CheckCircle': return <CheckCircle className={iconClass} />;
      case 'Target': return <Target className={iconClass} />;
      case 'CornerDownRight': return <CornerDownRight className={iconClass} />;
      case 'AlertTriangle': return <AlertTriangle className={iconClass} />;
      case 'Circle': return <Circle className={iconClass} />;
      case 'Grip': return <Lock className={iconClass} />;
      case 'Activity': return <Activity className={iconClass} />;
      case 'Lock': return <Lock className={iconClass} />;
      case 'Square': return <Square className={iconClass} />;
      case 'Gauge': return <Gauge className={iconClass} />;
      case 'Info': return <Info className={iconClass} />;
      default: return <Circle className={iconClass} />;
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
    completeLesson(lesson.id);
    onBack();
  };

  const isVorfahrtLesson = lesson.id === 'city-1';
  const isMirrorLesson = ['city-5', 'city-6'].includes(lesson.id);
  const isRoundaboutLesson = lesson.id === 'city-3';
  const isEmergencyBrakeLesson = lesson.id.startsWith('maneuver-4');
  const isParkingLesson = lesson.id === 'maneuver-1';

  if (showQuiz && lesson.quiz && lesson.quiz.length > 0) {
    const question = lesson.quiz[0];
    const isCorrect = selectedAnswer === question.correctOptionId;

    return (
      <div className="pb-6">
        <PageHeader title={isDE ? 'Quiz' : 'Quiz'} onBack={() => setShowQuiz(false)} />

        <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800 mt-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {isDE ? question.questionDe : question.questionEn}
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
                  {isDE ? option.textDe : option.textEn}
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
                    ? isDE ? 'Richtig!' : 'Correct!'
                    : isDE ? 'Falsch!' : 'Incorrect!'}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                {isDE ? question.explanationDe : question.explanationEn}
              </p>
            </div>
          )}

          {showExplanation && (
            <button
              onClick={handleFinish}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
            >
              {isDE ? 'Lektion abschließen' : 'Complete Lesson'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <PageHeader title={isDE ? lesson.titleDe : lesson.titleEn} onBack={onBack} />

      <div className="mb-6 mt-4">
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isDE ? lesson.descriptionDe : lesson.descriptionEn}
        </p>
      </div>

      {/* Interactive Simulator Section */}
      {isVorfahrtLesson && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isDE ? 'Interaktiver Simulator' : 'Interactive Simulator'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDE 
                  ? 'Meistere die Situation, um die Lektion abzuschließen' 
                  : 'Master the situation to complete the lesson'}
              </p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <InteractiveVorfahrt onComplete={() => setIsSimulatorComplete(true)} language={language} />
            
            {isSimulatorComplete && (
              <div className="mx-4 mb-4">
                <button
                  onClick={handleFinish}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-green-600 py-4 font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {isDE ? 'Lektion erfolgreich abgeschlossen!' : 'Lesson Successfully Completed!'}
                  </div>
                </button>
              </div>
            )}
          </div>
          
          {!isSimulatorComplete && (
            <p className="mt-4 text-center text-sm font-medium text-amber-600 dark:text-amber-400">
              {isDE 
                ? '💡 Löse den Simulator oben, um fortzufahren' 
                : '💡 Solve the simulator above to proceed'}
            </p>
          )}
        </div>
      )}

      {/* Interactive Mirror Check Section */}
      {isMirrorLesson && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'de' ? 'Praxis-Check: Schulterblick' : 'Practical Check: Shoulder Scan'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'de' ? 'Trainiere die lebenswichtige Blickfolge' : 'Practice the life-saving scanning sequence'}
              </p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <InteractiveMirrorCheck 
              onComplete={() => setIsSimulatorComplete(true)} 
              language={language}
              direction={lesson.id === 'city-5' ? 'right' : 'left'} 
            />
            
            {isSimulatorComplete && (
              <div className="mx-4 mb-4">
                <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  {language === 'de' ? 'Blickfolge korrekt trainiert!' : 'Scanning sequence trained correctly!'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Roundabout Section */}
      {isRoundaboutLesson && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'de' ? 'Praxis-Check: Kreisverkehr' : 'Practical Check: Roundabout'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'de' ? 'Meistere die Blinkregeln im Kreisel' : 'Master signaling rules in the circle'}
              </p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <InteractiveRoundabout onComplete={() => setIsSimulatorComplete(true)} language={language} />
            
            {isSimulatorComplete && (
              <div className="mx-4 mb-4">
                <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Check className="h-5 w-5" />
                  {language === 'de' ? 'Kreisverkehr erfolgreich beendet!' : 'Roundabout successfully completed!'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Emergency Brake Section */}
      {isEmergencyBrakeLesson && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'de' ? 'Praxis-Check: Gefahrenbremsung' : 'Practical Check: Emergency Brake'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'de' ? 'Reaktionszeit & Vollbremsung trainieren' : 'Train reaction time & full emergency brake'}
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 p-4">
            <InteractiveEmergencyBrake onComplete={() => setIsSimulatorComplete(true)} language={language} />
          </div>
        </div>
      )}

      {/* Interactive Parking Section */}
      {isParkingLesson && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'de' ? 'Praxis-Check: Einparken' : 'Practical Check: Parking'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'de' ? 'Parallel-Parken Schritt für Schritt' : 'Parallel parking step by step'}
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 p-4">
            <InteractiveParking onComplete={() => setIsSimulatorComplete(true)} language={language} />
          </div>
        </div>
      )}

      {/* Steps Visualization */}
      {lesson.steps && lesson.steps.length > 0 && (
        <>
          {/* Progress Dots */}
          <div className="mb-4 flex justify-center gap-2">
            {lesson.steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  idx === currentStep
                    ? 'w-8 bg-blue-500'
                    : idx < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                )}
              />
            ))}
          </div>

          {/* Animation Toggle Button */}
          {animationType && (
            <div className="mb-4">
              <button
                onClick={() => setShowAnimation(!showAnimation)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all',
                  showAnimation
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                )}
              >
                <Film className="h-5 w-5" />
                {showAnimation
                  ? (isDE ? 'Animation ausblenden' : 'Hide Animation')
                  : (isDE ? '🎬 Animation ansehen' : '🎬 Watch Animation')}
              </button>
            </div>
          )}

          {/* Animated Guide */}
          {showAnimation && animationType && (
            <div className="mb-4">
              <AnimatedManeuver type={animationType} language={language} />
            </div>
          )}

          {/* Current Step Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isDE ? 'Schritt' : 'Step'} {currentStep + 1}/{lesson.steps.length}
              </span>
              {lesson.steps[currentStep].critical && (
                <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  <AlertTriangle className="h-3 w-3" />
                  {isDE ? 'Wichtig!' : 'Critical!'}
                </span>
              )}
            </div>

            {/* Diagram Visualization (static) */}
            {lesson.id.startsWith('maneuver') && !showAnimation && (
              <div className="mb-4 rounded-xl bg-slate-100 p-3 dark:bg-slate-700">
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

            {/* Step Visual */}
            <div
              className={cn(
                'mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full',
                lesson.steps[currentStep].critical
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              {getStepIcon(lesson.steps[currentStep].icon)}
            </div>

            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900 dark:text-white">
              {isDE
                ? lesson.steps[currentStep].titleDe
                : lesson.steps[currentStep].titleEn}
            </h3>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              {isDE
                ? lesson.steps[currentStep].descriptionDe
                : lesson.steps[currentStep].descriptionEn}
            </p>

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                  currentStep === 0
                    ? 'bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={handleNextStep}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700"
              >
                {currentStep === lesson.steps.length - 1
                  ? lesson.quiz && lesson.quiz.length > 0
                    ? isDE ? 'Zum Quiz' : 'Go to Quiz'
                    : isDE ? 'Abschließen' : 'Complete'
                  : isDE ? 'Nächster Schritt' : 'Next Step'}
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Step Overview */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              {isDE ? 'Alle Schritte' : 'All Steps'}
            </h4>
            <div className="space-y-2">
              {lesson.steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-all',
                    idx === currentStep
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      idx < currentStep
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    )}
                  >
                    {idx < currentStep ? <Check className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      idx === currentStep
                        ? 'font-medium text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {isDE ? step.titleDe : step.titleEn}
                  </span>
                  {step.critical && (
                    <AlertTriangle className="ml-auto h-4 w-4 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Glossary */}
      {lesson.glossary && lesson.glossary.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                {isDE ? 'Wichtige Begriffe' : 'Key Terms'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Deutsch und Englisch für Unterricht und Prüfung' : 'German and English for lessons and exam situations'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {lesson.glossary.map((term) => (
              <div key={term.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{term.german}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{term.english}</p>
                {(term.noteDe || term.noteEn) && (
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {isDE ? term.noteDe : term.noteEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examiner Commands */}
      {lesson.examinerCommands && lesson.examinerCommands.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                {isDE ? 'Typische Prüferanweisungen' : 'Typical Examiner Commands'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Originalformulierung verstehen und sicher umsetzen' : 'Understand the original wording and act on it calmly'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {lesson.examinerCommands.map((command) => (
              <div key={command.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{command.commandDe}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{command.commandEn}</p>
                {(command.noteDe || command.noteEn) && (
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {isDE ? command.noteDe : command.noteEn}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traffic Signs */}
      {lesson.trafficSigns && lesson.trafficSigns.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                {isDE ? 'Wichtige Verkehrszeichen' : 'Important Traffic Signs'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isDE ? 'Zeichen, die in dieser Situation häufig relevant sind' : 'Signs often relevant in this situation'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {lesson.trafficSigns.map((sign) => (
              <div
                key={sign.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <TrafficSignIcon sign={sign} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold leading-tight text-slate-900 dark:text-white">
                        {isDE ? sign.titleDe : sign.titleEn}
                      </p>
                      {sign.code && (
                        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {sign.code}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                      {isDE ? sign.descriptionDe : sign.descriptionEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guided Points */}
      {lesson.guidedPoints && lesson.guidedPoints.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isDE ? 'Geführte Lernpunkte' : 'Guided Learning Points'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDE ? 'Prüfungsrelevante Beobachtungs- und Handlungspunkte' : 'Exam-relevant observation and action points'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {lesson.guidedPoints.map((point) => (
              <div
                key={point.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
                    {getGuidedPointIcon(point.emphasis)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {isDE ? point.titleDe : point.titleEn}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {isDE ? point.contentDe : point.contentEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guided Scenarios */}
      {lesson.scenarios && lesson.scenarios.length > 0 && (
        <div className="mt-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isDE
                ? (lesson.scenarioSectionTitleDe || 'Typische Fahrsituationen')
                : (lesson.scenarioSectionTitleEn || 'Typical Driving Scenarios')}
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {isDE
                ? (lesson.scenarioSectionSubtitleDe || 'Schritt-für-Schritt für knifflige Praxis-Situationen')
                : (lesson.scenarioSectionSubtitleEn || 'Step-by-step guidance for tricky practical situations')}
            </p>
            {!lesson.scenarioSectionTitleDe && !lesson.scenarioSectionTitleEn && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {isDE ? 'Ampel' : 'Traffic lights'}
                </span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {isDE ? 'Spur & Straßenform' : 'Lanes & road shape'}
                </span>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {isDE ? 'Sonderregeln' : 'Special rules'}
                </span>
              </div>
            )}
          </div>

          {lesson.scenarios.map((scenario) => (
            <div key={scenario.id} className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-white">
                    {isDE ? scenario.titleDe : scenario.titleEn}
                  </h5>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {isDE ? scenario.situationDe : scenario.situationEn}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {scenario.steps.map((step, idx) => (
                  <div key={`${scenario.id}-${step.id}`} className="flex gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                      step.critical ? 'bg-red-500' : 'bg-indigo-500'
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {isDE ? step.titleDe : step.titleEn}
                        </p>
                        {step.critical && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {isDE ? 'Wichtig' : 'Critical'}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {isDE ? step.descriptionDe : step.descriptionEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {scenario.mistakes && scenario.mistakes.length > 0 && (
                <div className="mt-4 rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
                  <div className="mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm font-semibold">
                      {isDE ? 'Häufige Fehler in dieser Situation' : 'Common mistakes in this scenario'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {scenario.mistakes.map((mistake) => (
                      <div key={mistake.id}>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                          {isDE ? mistake.titleDe : mistake.titleEn}
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          {isDE ? mistake.contentDe : mistake.contentEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips Section */}
      {lesson.tips && lesson.tips.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Tipps vom Fahrlehrer' : 'Instructor Tips'}
          </h4>
          {lesson.tips.map((tip) => (
            <div
              key={tip.id}
              className={cn(
                'rounded-xl p-4',
                tip.type === 'warning'
                  ? 'bg-red-50 dark:bg-red-900/20'
                  : tip.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-blue-50 dark:bg-blue-900/20'
              )}
            >
              <div className="flex items-start gap-3">
                {tip.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                ) : tip.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                  <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                )}
                <div>
                  <p
                    className={cn(
                      'font-medium',
                      tip.type === 'warning'
                        ? 'text-red-800 dark:text-red-300'
                        : tip.type === 'success'
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-blue-800 dark:text-blue-300'
                    )}
                  >
                    {isDE ? tip.titleDe : tip.titleEn}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      tip.type === 'warning'
                        ? 'text-red-700 dark:text-red-400'
                        : tip.type === 'success'
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-blue-700 dark:text-blue-400'
                    )}
                  >
                    {isDE ? tip.contentDe : tip.contentEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete Button for lessons without steps */}
      {(!lesson.steps || lesson.steps.length === 0) && !isCompleted && (
        <button
          onClick={() => {
            completeLesson(lesson.id);
            onBack();
          }}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700"
        >
          {isDE ? 'Als gelernt markieren' : 'Mark as Learned'}
        </button>
      )}
    </div>
  );
}

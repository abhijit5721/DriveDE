/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { ChevronRight, RotateCcw, Trophy, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { TRANSLATIONS } from '../../data/translations';
import { scenarios } from '../../data/scenarios';

interface ScenarioQuizProps {
  onClose: () => void;
}

export function ScenarioQuiz({ onClose }: ScenarioQuizProps) {
  const { language, setQuizScore, addMistake, removeMistake } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const t = TRANSLATIONS[language];
  const scenario = scenarios[currentIndex];

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    setShowResult(true);
    if (optionId === scenario.correctId) {
      setScore((prev) => prev + 1);
      removeMistake(scenario.id);
    } else {
      addMistake(scenario.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Persist score before showing complete screen
      const finalScore = score;
      const percentage = Math.round((finalScore / scenarios.length) * 100);
      setQuizScore('main-scenarios', percentage);
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setIsComplete(false);
  };

  if (isComplete) {
    const percentage = Math.round((score / scenarios.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center dark:bg-slate-800">
          <div className={cn(
            'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full',
            isPassing ? 'bg-green-100 dark:bg-green-900/50' : 'bg-amber-100 dark:bg-amber-900/50'
          )}>
            <Trophy className={cn(
              'h-10 w-10',
              isPassing ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
            )} />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isPassing ? t.quiz.greatJob : t.quiz.keepPracticing}
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t.quiz.resultsSummary(score, scenarios.length)}
          </p>

          <div className="mt-4 text-5xl font-bold text-slate-900 dark:text-white">
            {percentage}%
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleRestart}
              aria-label={t.quiz.restartAria}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="h-4 w-4" />
              {t.quiz.retry}
            </button>
            <button
              onClick={onClose}
              aria-label={t.quiz.closeAria}
              className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all hover:bg-blue-600"
            >
              {t.quiz.done}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{scenario.icon}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {language === 'de' ? scenario.titleDe : scenario.titleEn}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label={t.quiz.closeX}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Progress */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / scenarios.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {currentIndex + 1}/{scenarios.length}
            </span>
          </div>

          {/* Situation */}
          <div className="mb-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {language === 'de' ? scenario.situationDe : scenario.situationEn}
            </p>
          </div>

          {/* Question */}
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            {language === 'de' ? scenario.questionDe : scenario.questionEn}
          </h3>

          {/* Options */}
          <div className="space-y-2">
            {scenario.options.map((option) => {
              const isCorrect = option.id === scenario.correctId;
              const isSelected = option.id === selectedAnswer;

              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  disabled={showResult}
                  aria-label={language === 'de' ? `Option ${option.id.toUpperCase()}: ${option.textDe}` : `Option ${option.id.toUpperCase()}: ${option.textEn}`}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all',
                    showResult
                      ? isCorrect
                        ? 'bg-green-100 ring-2 ring-green-500 dark:bg-green-900/30'
                        : isSelected
                        ? 'bg-red-100 ring-2 ring-red-500 dark:bg-red-900/30'
                        : 'bg-slate-100 dark:bg-slate-700'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      showResult && isCorrect
                        ? 'bg-green-500 text-white'
                        : showResult && isSelected
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
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className={cn(
              'mt-4 rounded-xl p-4',
              selectedAnswer === scenario.correctId
                ? 'bg-green-50 dark:bg-green-900/20'
                : 'bg-amber-50 dark:bg-amber-900/20'
            )}>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {language === 'de' ? scenario.explanationDe : scenario.explanationEn}
              </p>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={handleNext}
              aria-label={currentIndex < scenarios.length - 1 ? t.quiz.nextQuestionAria : t.quiz.showResultsAria}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all hover:bg-blue-600"
            >
              {currentIndex < scenarios.length - 1
                ? t.quiz.nextQuestion
                : t.quiz.showResults}
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ChevronRight, RotateCcw, Trophy, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';

interface Scenario {
  id: string;
  titleDe: string;
  titleEn: string;
  situationDe: string;
  situationEn: string;
  questionDe: string;
  questionEn: string;
  options: {
    id: string;
    textDe: string;
    textEn: string;
  }[];
  correctId: string;
  explanationDe: string;
  explanationEn: string;
  icon: string;
}

const scenarios: Scenario[] = [
  {
    id: 's1',
    titleDe: 'Kreisverkehr',
    titleEn: 'Roundabout',
    situationDe: 'Sie nähern sich einem Kreisverkehr. Es sind bereits Fahrzeuge im Kreisverkehr.',
    situationEn: 'You are approaching a roundabout. There are already vehicles in the roundabout.',
    questionDe: 'Was ist die richtige Reihenfolge?',
    questionEn: 'What is the correct sequence?',
    options: [
      { id: 'a', textDe: 'Blinken, einfahren, Vorfahrt erzwingen', textEn: 'Signal, enter, force right of way' },
      { id: 'b', textDe: 'Warten, freie Lücke abwarten, ohne Blinker einfahren, beim Ausfahren blinken', textEn: 'Wait, find gap, enter without signal, signal when exiting' },
      { id: 'c', textDe: 'Rechts blinken, sofort einfahren', textEn: 'Signal right, enter immediately' },
    ],
    correctId: 'b',
    explanationDe: 'Im Kreisverkehr haben die Fahrzeuge IM Kreis Vorfahrt. Beim Einfahren nicht blinken, beim Ausfahren rechts blinken.',
    explanationEn: 'Vehicles IN the roundabout have right of way. Do not signal when entering, signal right when exiting.',
    icon: '🔄',
  },
  {
    id: 's2',
    titleDe: 'Rechts vor Links',
    titleEn: 'Right Before Left',
    situationDe: 'Sie fahren auf einer gleichrangigen Straße. Von rechts kommt ein Fahrzeug.',
    situationEn: 'You are driving on an equal-priority road. A vehicle is coming from the right.',
    questionDe: 'Wer hat Vorfahrt?',
    questionEn: 'Who has right of way?',
    options: [
      { id: 'a', textDe: 'Ich habe Vorfahrt', textEn: 'I have right of way' },
      { id: 'b', textDe: 'Das Fahrzeug von rechts hat Vorfahrt', textEn: 'The vehicle from the right has right of way' },
      { id: 'c', textDe: 'Wer zuerst da war', textEn: 'Whoever arrived first' },
    ],
    correctId: 'b',
    explanationDe: 'Rechts vor Links! Das Fahrzeug von rechts hat immer Vorfahrt auf gleichrangigen Straßen.',
    explanationEn: 'Right before left! The vehicle from the right always has right of way on equal-priority roads.',
    icon: '➡️',
  },
  {
    id: 's3',
    titleDe: 'Zebrastreifen',
    titleEn: 'Pedestrian Crossing',
    situationDe: 'Ein Fußgänger wartet am Zebrastreifen. Sie sind 30m entfernt.',
    situationEn: 'A pedestrian is waiting at the crosswalk. You are 30m away.',
    questionDe: 'Wie verhalten Sie sich?',
    questionEn: 'How do you behave?',
    options: [
      { id: 'a', textDe: 'Weiterfahren, der Fußgänger wartet ja noch', textEn: 'Continue driving, the pedestrian is still waiting' },
      { id: 'b', textDe: 'Hupen um den Fußgänger zu warnen', textEn: 'Honk to warn the pedestrian' },
      { id: 'c', textDe: 'Anhalten und dem Fußgänger Vorrang gewähren', textEn: 'Stop and give the pedestrian right of way' },
    ],
    correctId: 'c',
    explanationDe: 'Fußgänger haben am Zebrastreifen IMMER Vorrang. Sie müssen anhalten, sobald ein Fußgänger erkennbar warten möchte.',
    explanationEn: 'Pedestrians ALWAYS have right of way at crosswalks. You must stop as soon as a pedestrian visibly wants to cross.',
    icon: '🚶',
  },
  {
    id: 's4',
    titleDe: 'Autobahn-Auffahrt',
    titleEn: 'Highway Merge',
    situationDe: 'Sie fahren auf die Autobahn auf. Der Beschleunigungsstreifen endet in 200m.',
    situationEn: 'You are merging onto the highway. The acceleration lane ends in 200m.',
    questionDe: 'Was tun Sie?',
    questionEn: 'What do you do?',
    options: [
      { id: 'a', textDe: 'Langsam fahren und auf eine Lücke warten', textEn: 'Drive slowly and wait for a gap' },
      { id: 'b', textDe: 'Auf Autobahngeschwindigkeit beschleunigen, Schulterblick, einfädeln', textEn: 'Accelerate to highway speed, shoulder check, merge' },
      { id: 'c', textDe: 'Am Ende des Streifens anhalten wenn keine Lücke da ist', textEn: 'Stop at the end if there is no gap' },
    ],
    correctId: 'b',
    explanationDe: 'Auf dem Beschleunigungsstreifen müssen Sie auf Autobahngeschwindigkeit beschleunigen! Schulterblick nicht vergessen!',
    explanationEn: 'You must accelerate to highway speed on the acceleration lane! Don\'t forget the shoulder check!',
    icon: '🛤️',
  },
  {
    id: 's5',
    titleDe: 'Nachtfahrt',
    titleEn: 'Night Driving',
    situationDe: 'Sie fahren nachts auf einer Landstraße. Gegenverkehr kommt.',
    situationEn: 'You are driving at night on a country road. Oncoming traffic is approaching.',
    questionDe: 'Wann müssen Sie abblenden?',
    questionEn: 'When must you dip your lights?',
    options: [
      { id: 'a', textDe: 'Sobald der Gegenverkehr sichtbar wird', textEn: 'As soon as oncoming traffic is visible' },
      { id: 'b', textDe: 'Erst wenn der Gegenverkehr blendet', textEn: 'Only when oncoming traffic blinds you' },
      { id: 'c', textDe: 'Fernlicht anlassen, der andere muss abblenden', textEn: 'Keep high beams on, the other must dip' },
    ],
    correctId: 'a',
    explanationDe: 'Sie müssen abblenden BEVOR der Gegenverkehr geblendet wird! Fernlicht nur wenn kein Gegenverkehr.',
    explanationEn: 'You must dip your lights BEFORE oncoming traffic is blinded! High beams only when no oncoming traffic.',
    icon: '🌙',
  },
];

interface ScenarioQuizProps {
  onClose: () => void;
}

export function ScenarioQuiz({ onClose }: ScenarioQuizProps) {
  const { language } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const isDE = language === 'de';
  const scenario = scenarios[currentIndex];

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
    setShowResult(true);
    if (optionId === scenario.correctId) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
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
            {isPassing
              ? isDE ? 'Sehr gut!' : 'Great Job!'
              : isDE ? 'Weiter üben!' : 'Keep Practicing!'}
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isDE
              ? `Du hast ${score} von ${scenarios.length} richtig beantwortet`
              : `You got ${score} out of ${scenarios.length} correct`}
          </p>

          <div className="mt-4 text-5xl font-bold text-slate-900 dark:text-white">
            {percentage}%
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleRestart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="h-4 w-4" />
              {isDE ? 'Nochmal' : 'Retry'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all hover:bg-blue-600"
            >
              {isDE ? 'Fertig' : 'Done'}
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
              {isDE ? scenario.titleDe : scenario.titleEn}
            </span>
          </div>
          <button
            onClick={onClose}
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
              {isDE ? scenario.situationDe : scenario.situationEn}
            </p>
          </div>

          {/* Question */}
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            {isDE ? scenario.questionDe : scenario.questionEn}
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
                    {isDE ? option.textDe : option.textEn}
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
                {isDE ? scenario.explanationDe : scenario.explanationEn}
              </p>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={handleNext}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 font-semibold text-white transition-all hover:bg-blue-600"
            >
              {currentIndex < scenarios.length - 1
                ? isDE ? 'Weiter' : 'Next'
                : isDE ? 'Ergebnis anzeigen' : 'Show Results'}
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

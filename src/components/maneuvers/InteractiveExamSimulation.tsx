import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, CheckCircle2, Volume2, VolumeX, ArrowRight, Car } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ExamScenario {
  id: string;
  situationDe: string;
  situationEn: string;
  options: {
    id: string;
    textDe: string;
    textEn: string;
    isCorrect: boolean;
    feedbackDe: string;
    feedbackEn: string;
  }[];
}

const scenarios: ExamScenario[] = [
  {
    id: 'start',
    situationDe: 'Der Prüfer setzt sich ins Auto. "Guten Tag. Bitte bereiten Sie sich für die Abfahrt vor."',
    situationEn: 'The examiner enters the car. "Good day. Please prepare yourself for departure."',
    options: [
      {
        id: 'o1',
        textDe: 'Motor starten und sofort losfahren.',
        textEn: 'Start the engine and drive off immediately.',
        isCorrect: false,
        feedbackDe: 'Fehler! Erst Spiegel und Sitz einstellen, dann anschnallen.',
        feedbackEn: 'Error! Adjust mirrors and seat first, then buckle up.',
      },
      {
        id: 'o2',
        textDe: 'Sitz/Spiegel prüfen, Anschnallen, Motor starten.',
        textEn: 'Check seat/mirrors, buckle up, start engine.',
        isCorrect: true,
        feedbackDe: 'Richtig. Sicherheit geht vor.',
        feedbackEn: 'Correct. Safety first.',
      }
    ]
  },
  {
    id: 'right-of-way',
    situationDe: 'Sie kommen an eine Kreuzung ohne Schilder (Rechts vor Links). Von rechts nähert sich ein Fahrzeug.',
    situationEn: 'You approach an intersection without signs (Right before Left). A vehicle is approaching from the right.',
    options: [
      {
        id: 'o1',
        textDe: 'Anhalten und das andere Fahrzeug vorlassen.',
        textEn: 'Stop and let the other vehicle pass.',
        isCorrect: true,
        feedbackDe: 'Korrekt. Rechts vor Links beachtet.',
        feedbackEn: 'Correct. Observed Right before Left.',
      },
      {
        id: 'o2',
        textDe: 'Zügig weiterfahren, da man selbst schneller ist.',
        textEn: 'Continue quickly as you are faster.',
        isCorrect: false,
        feedbackDe: 'Durchgefallen! Vorfahrt missachtet.',
        feedbackEn: 'Failed! Disregarded right-of-way.',
      }
    ]
  },
  {
    id: 'tempo-30',
    situationDe: 'Sie biegen in eine Straße ein und sehen das Schild "Zone 30". Ihr Tacho zeigt 45 km/h.',
    situationEn: 'You turn into a street and see the "Zone 30" sign. Your speedometer shows 45 km/h.',
    options: [
      {
        id: 'o1',
        textDe: 'Sofort auf 30 km/h abbremsen.',
        textEn: 'Brake immediately to 30 km/h.',
        isCorrect: true,
        feedbackDe: 'Richtig. In Zonen muss das Limit exakt eingehalten werden.',
        feedbackEn: 'Correct. Limts must be kept exactly in zones.',
      },
      {
        id: 'o2',
        textDe: 'Ausrollen lassen, bis man 35 km/h erreicht.',
        textEn: 'Let the car coast until you reach 35 km/h.',
        isCorrect: false,
        feedbackDe: 'Fehler! Zu schnell in der 30er Zone.',
        feedbackEn: 'Error! Too fast in the 30 zone.',
      }
    ]
  },
  {
    id: 'school-bus',
    situationDe: 'Ein Schulbus hält vor Ihnen mit eingeschalteter Warnblinkanlage.',
    situationEn: 'A school bus stops in front of you with hazard lights on.',
    options: [
      {
        id: 'o1',
        textDe: 'Nur mit Schrittgeschwindigkeit (4-7 km/h) vorbeifahren, falls gefahrlos möglich.',
        textEn: 'Only pass at walking speed (4-7 km/h) if safe to do so.',
        isCorrect: true,
        feedbackDe: 'Korrekt. Besondere Vorsicht bei Schulbussen!',
        feedbackEn: 'Correct. Special caution with school buses!',
      },
      {
        id: 'o2',
        textDe: 'Mit normaler Stadtgeschwindigkeit (50 km/h) überholen.',
        textEn: 'Overtake at normal city speed (50 km/h).',
        isCorrect: false,
        feedbackDe: 'Durchgefallen! Lebensgefährliche Situation für Kinder.',
        feedbackEn: 'Failed! Life-threatening situation for children.',
      }
    ]
  },
  {
    id: 'zebra-crossing',
    situationDe: 'Ein Fußgänger nähert sich erkennbar einem Zebrastreifen.',
    situationEn: 'A pedestrian is clearly approaching a zebra crossing.',
    options: [
      {
        id: 'o1',
        textDe: 'Anhalten und den Fußgänger überqueren lassen.',
        textEn: 'Stop and let the pedestrian cross.',
        isCorrect: true,
        feedbackDe: 'Richtig. Fußgänger haben hier Vorrang.',
        feedbackEn: 'Correct. Pedestrians have priority here.',
      },
      {
        id: 'o2',
        textDe: 'Kurz hupen und zügig weiterfahren.',
        textEn: 'Honk briefly and continue quickly.',
        isCorrect: false,
        feedbackDe: 'Durchgefallen! Vorrang missachtet.',
        feedbackEn: 'Failed! Disregarded priority.',
      }
    ]
  },
  {
    id: 'emergency-vehicle',
    situationDe: 'Sie hören ein Martinshorn und sehen blaues Blinklicht im Rückspiegel.',
    situationEn: 'You hear a siren and see blue flashing lights in your rearview mirror.',
    options: [
      {
        id: 'o1',
        textDe: 'Blinker setzen, Geschwindigkeit reduzieren und Platz machen.',
        textEn: 'Use indicator, reduce speed and make space.',
        isCorrect: true,
        feedbackDe: 'Korrekt. Einsatzfahrzeuge müssen sofort vorbei.',
        feedbackEn: 'Correct. Emergency vehicles must pass immediately.',
      },
      {
        id: 'o2',
        textDe: 'Schneller fahren, um nicht im Weg zu sein.',
        textEn: 'Drive faster so you are not in the way.',
        isCorrect: false,
        feedbackDe: 'Fehler! Das behindert das Einsatzfahrzeug.',
        feedbackEn: 'Error! This obstructs the emergency vehicle.',
      }
    ]
  },
  {
    id: 'cyclist-overtake',
    situationDe: 'Sie möchten einen Radfahrer innerhalb der Ortschaft überholen.',
    situationEn: 'You want to overtake a cyclist within a built-up area.',
    options: [
      {
        id: 'o1',
        textDe: 'Mindestens 1,5 Meter Seitenabstand einhalten.',
        textEn: 'Keep at least 1.5 meters lateral distance.',
        isCorrect: true,
        feedbackDe: 'Sehr gut. Abstand ist gesetzlich vorgeschrieben.',
        feedbackEn: 'Very good. Distance is legally required.',
      },
      {
        id: 'o2',
        textDe: 'Eng vorbeifahren, damit der Gegenverkehr nicht behindert wird.',
        textEn: 'Pass closely so oncoming traffic is not hindered.',
        isCorrect: false,
        feedbackDe: 'Durchgefallen! Gefährdung des Radfahrers.',
        feedbackEn: 'Failed! Endangering the cyclist.',
      }
    ]
  },
  {
    id: 'left-turn',
    situationDe: 'Sie wollen links abbiegen. Es kommt Gegenverkehr geradeaus entgegen.',
    situationEn: 'You want to turn left. Oncoming traffic is coming straight ahead.',
    options: [
      {
        id: 'o1',
        textDe: 'Den Gegenverkehr erst durchfahren lassen.',
        textEn: 'Let oncoming traffic pass first.',
        isCorrect: true,
        feedbackDe: 'Korrekt. Linksabbieger müssen warten.',
        feedbackEn: 'Correct. Left turners must wait.',
      },
      {
        id: 'o2',
        textDe: 'Schnell vor dem Gegenverkehr abbiegen.',
        textEn: 'Turn quickly before oncoming traffic.',
        isCorrect: false,
        feedbackDe: 'Durchgefallen! Vorfahrt erzwingen ist verboten.',
        feedbackEn: 'Failed! Forcing right-of-way is forbidden.',
      }
    ]
  },
  {
    id: 'stop-sign',
    situationDe: 'Sie kommen an ein STOPP-Schild mit einer Haltelinie.',
    situationEn: 'You approach a STOP sign with a stop line.',
    options: [
      {
        id: 'o1',
        textDe: 'An der Haltelinie komplett zum Stillstand kommen (3 Sek.).',
        textEn: 'Come to a complete standstill at the stop line (3 sec).',
        isCorrect: true,
        feedbackDe: 'Richtig. "Rollen" gilt als durchgefallen.',
        feedbackEn: 'Correct. "Rolling" counts as failed.',
      },
      {
        id: 'o2',
        textDe: 'Langsam ranrollen und weiterfahren, wenn frei ist.',
        textEn: 'Roll slowly up and continue if clear.',
        isCorrect: false,
        feedbackDe: 'Durchgefallen! Stopp-Pflicht missachtet.',
        feedbackEn: 'Failed! Disregarded stop duty.',
      }
    ]
  },
  {
    id: 'autobahn-merge',
    situationDe: 'Sie befinden sich auf dem Beschleunigungsstreifen der Autobahn.',
    situationEn: 'You are on the acceleration lane of the highway.',
    options: [
      {
        id: 'o1',
        textDe: 'Kräftig beschleunigen und mit passendem Tempo einfädeln.',
        textEn: 'Accelerate strongly and merge with appropriate speed.',
        isCorrect: true,
        feedbackDe: 'Korrekt. Zügiges Auffahren ist sicherer.',
        feedbackEn: 'Correct. Rapid entry is safer.',
      },
      {
        id: 'o2',
        textDe: 'Am Anfang des Streifens anhalten und auf eine Lücke warten.',
        textEn: 'Stop at the beginning of the lane and wait for a gap.',
        isCorrect: false,
        feedbackDe: 'Gefährlich! Das führt oft zu Auffahrunfällen.',
        feedbackEn: 'Dangerous! This often leads to rear-end collisions.',
      }
    ]
  },
  {
    id: 'finish-park',
    situationDe: 'Der Prüfer sagt: "Suchen Sie sich eine Parklücke und stellen Sie das Fahrzeug ab."',
    situationEn: 'The examiner says: "Find a parking space and park the vehicle."',
    options: [
      {
        id: 'o1',
        textDe: 'Lücke suchen, Blinken, Sichern, Einparken, Motor aus, Sichern.',
        textEn: 'Find gap, signal, secure, park, engine off, secure.',
        isCorrect: true,
        feedbackDe: 'Perfekt. Herzlichen Glückwunsch, Sie haben bestanden!',
        feedbackEn: 'Perfect. Congratulations, you passed!',
      },
      {
        id: 'o2',
        textDe: 'Einfach auf den Gehweg stellen und rausspringen.',
        textEn: 'Just park on the sidewalk and jump out.',
        isCorrect: false,
        feedbackDe: 'Durchgefallen auf den letzten Metern!',
        feedbackEn: 'Failed at the last meters!',
      }
    ]
  }
];

export default function InteractiveExamSimulation({ onComplete, language }: { onComplete: () => void; language: 'de' | 'en' }) {
  const isDE = language === 'de';
  const [gameState, setGameState] = useState<'intro' | 'active' | 'finished'>('intro');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds
  const [mistakes, setMistakes] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentScenario = scenarios[scenarioIndex];

  useEffect(() => {
    if (gameState === 'active' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('finished');
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft]);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isDE ? 'de-DE' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    setGameState('active');
    speak(isDE ? currentScenario.situationDe : currentScenario.situationEn);
  };

  const handleOptionSelect = (option: ExamScenario['options'][number]) => {
    if (feedback) return;
    
    setFeedback(isDE ? option.feedbackDe : option.feedbackEn);
    if (!option.isCorrect) {
      setMistakes(prev => prev + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      if (scenarioIndex < scenarios.length - 1) {
        setScenarioIndex(prev => prev + 1);
        const next = scenarios[scenarioIndex + 1];
        speak(isDE ? next.situationDe : next.situationEn);
      } else {
        setGameState('finished');
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-2xl text-white">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20" />
          <img src="/images/examiner.png" alt="Examiner" className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover shadow-2xl" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-4">{isDE ? 'Bist du bereit für deine Prüfung?' : 'Are you ready for your exam?'}</h3>
        <p className="text-slate-400 mb-8 max-w-sm">
          {isDE 
            ? 'In dieser 15-minütigen Simulation musst du schnell und sicher auf Prüfungsfragen und Verkehrssituationen reagieren.' 
            : 'In this 15-minute simulation, you must react quickly and safely to exam questions and traffic situations.'}
        </p>
        <button 
          onClick={handleStart}
          className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-white"
        >
          {isDE ? 'Simulation starten' : 'Start Simulation'}
        </button>
      </div>
    );
  }

  if (gameState === 'finished') {
    const passed = mistakes === 0;
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900 rounded-2xl text-white">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {passed ? (
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 mx-auto" />
          ) : (
            <AlertTriangle className="w-20 h-20 text-red-500 mb-4 mx-auto" />
          )}
          <h3 className="text-3xl font-bold mb-2">
            {passed 
              ? (isDE ? 'Prüfung Bestanden!' : 'Exam Passed!') 
              : (isDE ? 'Leider nicht bestanden' : 'Unfortunately Not Passed')}
          </h3>
          <p className="text-slate-400 mb-8">
            {passed 
              ? (isDE ? 'Hervorragend! Du bist bereit für die echte Prüfung.' : 'Excellent! You are ready for the real exam.') 
              : (isDE ? 'Übe die kritischen Situationen noch einmal.' : 'Practice the critical situations again.')}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-xl">
              <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Time Left</span>
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <span className="block text-xs uppercase text-slate-500 font-bold tracking-wider mb-1">Mistakes</span>
              <span className="text-xl font-bold text-red-400">{mistakes}</span>
            </div>
          </div>
          <button 
            onClick={onComplete}
            className="w-full bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-white"
          >
            {isDE ? 'Abschließen' : 'Finish Lesson'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[500px]">
      {/* HUD Header */}
      <div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-mono font-bold text-white">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10">
            <AlertTriangle className={cn('w-4 h-4', mistakes > 0 ? 'text-red-500' : 'text-slate-500')} />
            <span className="text-sm font-mono font-bold text-white">{mistakes}</span>
          </div>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-white/5 rounded-full text-slate-400">
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <AnimatePresence mode="wait">
          {feedback ? (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                feedback.includes('Fehler') || feedback.includes('Failed') ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
              )}>
                {feedback.includes('Fehler') || feedback.includes('Failed') ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
              </div>
              <p className="text-xl font-bold text-white leading-tight">{feedback}</p>
            </motion.div>
          ) : (
            <motion.div 
              key={currentScenario.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col h-full"
            >
              {/* Situation Display */}
              <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
                <div className="mb-6 relative">
                   <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl" />
                   <img src="/images/examiner.png" className="w-20 h-20 rounded-full border-2 border-white/20 object-cover" alt="Examiner" />
                   <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-slate-900"
                   >
                     <Volume2 className="w-3 h-3 text-white" />
                   </motion.div>
                </div>
                <p className="text-lg font-medium text-slate-100 max-w-md mx-auto leading-relaxed">
                  {isDE ? currentScenario.situationDe : currentScenario.situationEn}
                </p>
              </div>

              {/* Options HUD */}
              <div className="space-y-3 mt-auto">
                {currentScenario.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt)}
                    className="w-full group relative flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all text-left overflow-hidden"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <ArrowRight className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-slate-200 group-hover:text-white">
                      {isDE ? opt.textDe : opt.textEn}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Footer */}
      <div className="p-3 bg-slate-900 border-t border-white/5 flex items-center justify-between opacity-50">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vehicle Simulation Active</span>
        </div>
        <div className="flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Feedback</span>
        </div>
      </div>
    </div>
  );
}

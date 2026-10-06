/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Prüfungssimulation (6 Oct): the learner reads an exam situation, hears the examiner's
 * instruction and explains in their own words, typed or spoken, what they would do.
 * The answer is checked on the device (utils/scenarioGrader.ts): which key points were
 * covered, which are missing, risky statements, the model answer and the StVO paragraph,
 * then a short multiple-choice question. No server, no AI, no running costs. The first
 * three situations are free, the rest come with Pro (trial included).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, Lock, Mic, MicOff, RotateCcw, Volume2, X, AlertTriangle, BookOpen } from 'lucide-react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { EXAM_SCENARIOS, type ExamScenario } from '../../data/examScenarios';
import { gradeAnswer, type GradeResult } from '../../utils/scenarioGrader';
import { useAppStore } from '../../store/useAppStore';
import { trackFunnel } from '../../services/AnalyticsService';
import { cn } from '../../utils/cn';

interface ExamSimulationProps {
  onBack: () => void;
  onOpenPaywall?: () => void;
}

const RESULTS_KEY = 'drivede-scenario-results';

function loadResults(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || '{}'); } catch { return {}; }
}
function saveResult(id: string, ratio: number) {
  try {
    const all = loadResults();
    all[id] = Math.max(all[id] ?? 0, ratio);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
  } catch { /* storage blocked: progress just is not remembered */ }
}

type SpeechRec = {
  lang: string; continuous: boolean; interimResults: boolean;
  start: () => void; stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null;
};
function speechRecognitionCtor(): (new () => SpeechRec) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function ExamSimulation({ onBack, onOpenPaywall }: ExamSimulationProps) {
  const { language, isProActive } = useAppStore();
  const de = language === 'de';
  const pro = isProActive();
  const [results, setResults] = useState<Record<string, number>>(loadResults);
  const [current, setCurrent] = useState<ExamScenario | null>(null);

  useEffect(() => () => { TextToSpeech.stop().catch(() => undefined); }, []);

  const open = (s: ExamScenario) => {
    if (!s.free && !pro) { onOpenPaywall?.(); return; }
    setCurrent(s);
  };

  const next = useMemo(() => {
    if (!current) return null;
    const i = EXAM_SCENARIOS.findIndex((s) => s.id === current.id);
    return EXAM_SCENARIOS[i + 1] ?? null;
  }, [current]);

  return (
    // Full-screen layer with safe-area padding (iPhone notch, 26 Sep)
    <div
      className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-brand-surface text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="exam-simulation"
    >
      <header className="flex items-center gap-3 p-4">
        <button
          onClick={() => (current ? setCurrent(null) : onBack())}
          aria-label={de ? 'Zurück' : 'Back'}
          data-testid="exam-simulation-back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:bg-white/15 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{current ? current.title[language] : 'Prüfungssimulation'}</h2>
          {!current && <p className="text-xs text-blue-100/70">{de ? 'Erkläre, was du tust. Die App prüft deine Antwort.' : 'Explain what you would do. The app checks your answer.'}</p>}
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8">
        {current ? (
          <ScenarioView
            key={current.id}
            scenario={current}
            de={de}
            language={language}
            next={next}
            nextLocked={!!next && !next.free && !pro}
            onNext={() => next && open(next)}
            onBackToList={() => setCurrent(null)}
            onGraded={(id, ratio) => { saveResult(id, ratio); setResults(loadResults()); }}
          />
        ) : (
          <ul className="space-y-3" data-testid="scenario-list">
            {EXAM_SCENARIOS.map((s, i) => {
              const locked = !s.free && !pro;
              const best = results[s.id];
              return (
                <li key={s.id}>
                  <button
                    onClick={() => open(s)}
                    data-testid={`scenario-${s.id}`}
                    className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10 active:scale-[0.99]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm font-bold">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{s.title[language]}</span>
                      <span className="block truncate text-xs text-blue-100/70">„{s.examiner.de}“</span>
                    </span>
                    {locked ? (
                      <span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold"><Lock className="h-3 w-3" />Pro</span>
                    ) : best !== undefined ? (
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold">{Math.round(best * 100)}%</span>
                    ) : (
                      <ArrowRight className="h-5 w-5 text-blue-200" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ScenarioView({ scenario, de, language, next, nextLocked, onNext, onBackToList, onGraded }: {
  scenario: ExamScenario; de: boolean; language: 'de' | 'en'; next: ExamScenario | null; nextLocked: boolean;
  onNext: () => void; onBackToList: () => void; onGraded: (id: string, ratio: number) => void;
}) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const usedMic = useRef(false);
  const Rec = speechRecognitionCtor();

  useEffect(() => () => { recRef.current?.stop(); }, []);

  const speak = () => {
    TextToSpeech.stop().catch(() => undefined);
    TextToSpeech.speak({ text: scenario.examiner.de, lang: 'de-DE', rate: 0.9, pitch: 1, volume: 1, category: 'ambient' }).catch(() => undefined);
  };

  const toggleMic = () => {
    if (!Rec) return;
    if (listening) { recRef.current?.stop(); return; }
    const rec = new Rec();
    rec.lang = de ? 'de-DE' : 'en-US';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) text += e.results[i][0].transcript;
      if (text) setAnswer((a) => (a ? `${a.trim()} ${text.trim()}` : text.trim()));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); setListening(true); usedMic.current = true; } catch { setListening(false); }
  };

  const grade = () => {
    recRef.current?.stop();
    const r = gradeAnswer(scenario, answer);
    setResult(r);
    onGraded(scenario.id, r.total ? r.covered / r.total : 0);
    trackFunnel('scenario_answered', { scenario: scenario.id, covered: r.covered, total: r.total, voice: usedMic.current });
  };

  const retry = () => { setResult(null); setChoice(null); };

  const pick = (i: number) => {
    if (choice !== null) return;
    setChoice(i);
    trackFunnel('scenario_minitest', { scenario: scenario.id, correct: i === scenario.miniTest.correct });
  };

  return (
    <div className="space-y-4">
      {/* Situation and the examiner's instruction */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm leading-relaxed text-blue-50">{scenario.situation[language]}</p>
        <div className="mt-4 flex items-start gap-3 rounded-xl bg-white/10 p-3">
          <button onClick={speak} aria-label={de ? 'Anweisung vorlesen' : 'Read the instruction aloud'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 transition hover:bg-blue-700 active:scale-95">
            <Volume2 className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">{de ? 'Der Prüfer sagt' : 'The examiner says'}</p>
            <p className="font-bold">„{scenario.examiner.de}“</p>
            {!de && <p className="text-sm italic text-blue-100/70">"{scenario.examiner.en}"</p>}
          </div>
        </div>
      </section>

      {!result ? (
        <section className="space-y-3">
          <div>
            <p className="text-sm font-bold">{de ? 'Erkläre Schritt für Schritt, was du tust:' : 'Explain step by step what you would do:'}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-100/80">
              {scenario.questions.map((q, i) => <li key={i}>{q[language]}</li>)}
            </ul>
          </div>
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              data-testid="scenario-answer"
              placeholder={de ? 'Zum Beispiel: Ich beobachte früh ... dann ...' : 'For example: I watch early ... then ...'}
              className="w-full resize-y rounded-2xl border border-white/15 bg-white/10 p-4 pr-14 text-base text-white placeholder:text-blue-100/40 focus:border-blue-400 focus:outline-none"
            />
            {Rec && (
              <button
                onClick={toggleMic}
                aria-label={listening ? (de ? 'Aufnahme stoppen' : 'Stop recording') : (de ? 'Antwort sprechen' : 'Speak your answer')}
                data-testid="scenario-mic"
                className={cn('absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95', listening ? 'animate-pulse bg-red-500' : 'bg-blue-600 hover:bg-blue-700')}
              >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
          </div>
          {listening && <p className="text-xs text-blue-100/80">{de ? 'Ich höre zu. Sprich ganz normal, tippe dann auf das Mikrofon.' : 'Listening. Speak normally, then tap the microphone.'}</p>}
          <button
            onClick={grade}
            disabled={answer.trim().length < 15}
            data-testid="scenario-grade"
            className="w-full rounded-xl bg-blue-600 py-4 text-base font-bold transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-40"
          >
            {de ? 'Antwort prüfen' : 'Check my answer'}
          </button>
          <p className="text-center text-[11px] text-blue-100/50">{de ? 'Die Prüfung läuft auf deinem Gerät. Deine Antwort bleibt dort und wird nicht gesendet.' : 'The check runs on your device. Your answer stays there and is not sent anywhere.'}</p>
        </section>
      ) : (
        <section className="space-y-4" data-testid="scenario-result">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-blue-200">{de ? 'Deine Antwort' : 'Your answer'}</p>
            <p className="mt-1 text-2xl font-bold" data-testid="scenario-score">
              {result.covered} {de ? 'von' : 'of'} {result.total} {de ? 'Punkten' : 'points'}
            </p>
            <ul className="mt-3 space-y-2">
              {scenario.keyPoints.map((p) => {
                const st = result.points.find((x) => x.id === p.id)!.status;
                return (
                  <li key={p.id} className="flex items-start gap-2 text-sm">
                    {st === 'covered'
                      ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      : <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
                    <span className={st === 'covered' ? 'text-white' : 'text-blue-100/80'}>
                      {p.label[language]}
                      {st === 'negated' && <span className="text-red-300"> {de ? '(du hast das verneint)' : '(you said the opposite)'}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
            {result.hints.map((h, i) => (
              <p key={i} className="mt-3 flex items-start gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />{h[language]}
              </p>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-blue-200">{de ? 'So klingt eine gute Antwort' : 'A strong answer'}</p>
            <p className="mt-2 text-sm leading-relaxed">{scenario.modelAnswer[language]}</p>
            <p className="mt-3 flex items-start gap-2 text-xs text-blue-100/70"><BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />{scenario.law[language]}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="scenario-minitest">
            <p className="text-sm font-bold text-blue-200">{de ? 'Kurztest' : 'Quick check'}</p>
            <p className="mt-2 text-sm">{scenario.miniTest.question[language]}</p>
            <div className="mt-3 space-y-2">
              {scenario.miniTest.options.map((o, i) => {
                const isRight = i === scenario.miniTest.correct;
                const chosen = choice === i;
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    data-testid={`minitest-option-${i}`}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition',
                      choice === null ? 'border-white/15 bg-white/5 hover:bg-white/10'
                        : isRight ? 'border-emerald-400/60 bg-emerald-400/10'
                        : chosen ? 'border-red-400/60 bg-red-400/10' : 'border-white/10 opacity-60',
                    )}
                  >
                    <span className="font-bold">{String.fromCharCode(65 + i)})</span>
                    <span>{o[language]}</span>
                  </button>
                );
              })}
            </div>
            {choice !== null && (
              <p className="mt-3 text-sm text-blue-50">
                <span className="font-bold">{choice === scenario.miniTest.correct ? (de ? 'Richtig. ' : 'Correct. ') : (de ? 'Nicht ganz. ' : 'Not quite. ')}</span>
                {scenario.miniTest.explanation[language]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={retry} className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold transition hover:bg-white/10">
              <RotateCcw className="h-4 w-4" />{de ? 'Nochmal antworten' : 'Answer again'}
            </button>
            {next ? (
              <button onClick={onNext} data-testid="scenario-next" className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold transition hover:bg-blue-700">
                {nextLocked && <Lock className="h-4 w-4" />}{de ? 'Nächste Situation' : 'Next situation'}<ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={onBackToList} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold transition hover:bg-blue-700">
                {de ? 'Zur Übersicht' : 'All situations'}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

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
import { ArrowRight, Check, ChevronLeft, Lock, Mic, MicOff, RotateCcw, Volume2, X, AlertTriangle, BookOpen, Sparkles, Loader2, ListOrdered, PenLine, ClipboardList } from 'lucide-react';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { EXAM_SCENARIOS, type ExamScenario } from '../../data/examScenarios';
import { gradeAnswer, type GradeResult } from '../../utils/scenarioGrader';
import { CompetenceGrid, ExamEvaluationInfo } from './ExamEvaluationInfo';
import { useAppStore } from '../../store/useAppStore';
import { trackFunnel } from '../../services/AnalyticsService';
import { cn } from '../../utils/cn';

interface ExamSimulationProps {
  onBack: () => void;
  onOpenPaywall?: () => void;
  /** Situation to open at once (deep link from its public page); unknown ids show the list. */
  initialScenarioId?: string | null;
}

const RESULTS_KEY = 'drivede-scenario-results';

// Detailed AI feedback (api/grade-scenario, Groq free plan): a few per device and day so
// one person cannot use up the shared daily quota. The server limits per IP as well.
const AI_KEY = 'drivede-ai-feedback';
const AI_PER_DAY = 5;
function aiUsedToday(): number {
  try {
    const v = JSON.parse(localStorage.getItem(AI_KEY) || '{}');
    return v.day === new Date().toISOString().slice(0, 10) ? Number(v.count) || 0 : 0;
  } catch { return 0; }
}
function countAiUse() {
  try { localStorage.setItem(AI_KEY, JSON.stringify({ day: new Date().toISOString().slice(0, 10), count: aiUsedToday() + 1 })); } catch { /* not remembered */ }
}
type AiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; covered: Set<string>; feedback: string; better: string }
  | { status: 'error'; reason: 'limit' | 'unavailable' };

// Step mode (DRI-73): the right steps and the tempting mistakes as cards, shuffled once
// per attempt; the learner taps them in the order they would act. Mistakes are marked
// 'm<i>', steps 's<i>'.
type Card = { key: string; text: string };
function shuffledCards(scenario: ExamScenario, language: 'de' | 'en', seed: number): Card[] {
  const cards: Card[] = [
    ...scenario.steps.map((t, i) => ({ key: `s${i}`, text: t[language] })),
    ...scenario.mistakes.map((m, i) => ({ key: `m${i}`, text: m.text[language] })),
  ];
  // deterministic shuffle (mulberry32) so a re-render never reorders the cards mid-attempt
  let a = seed >>> 0;
  const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
  return cards;
}
type StepVerdict = 'right' | 'wrong-place' | 'mistake';
/** Per picked card: right place, right step at the wrong place, or a mistake. Missing steps are listed. */
function gradeSteps(scenario: ExamScenario, picked: string[]) {
  const verdicts: StepVerdict[] = picked.map((k, i) => (k.startsWith('m') ? 'mistake' : k === `s${i}` ? 'right' : 'wrong-place'));
  const missing = scenario.steps.map((_, i) => `s${i}`).filter((k) => !picked.includes(k));
  const right = verdicts.filter((v) => v === 'right').length;
  return { verdicts, missing, right, total: scenario.steps.length, mistakes: verdicts.filter((v) => v === 'mistake').length };
}

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

export default function ExamSimulation({ onBack, onOpenPaywall, initialScenarioId = null }: ExamSimulationProps) {
  const { language, isProActive } = useAppStore();
  const de = language === 'de';
  const pro = isProActive();
  const [results, setResults] = useState<Record<string, number>>(loadResults);
  // the detailed-feedback button only shows when the server has a Groq key
  const [aiEnabled, setAiEnabled] = useState(false);
  useEffect(() => {
    fetch('/api/grade-scenario').then((r) => (r.ok ? r.json() : null)).then((j) => setAiEnabled(j?.enabled === true)).catch(() => undefined);
  }, []);
  const [current, setCurrent] = useState<ExamScenario | null>(null);
  // "So bewertet der Prüfer": the examiner's protocol explained (data/examEvaluation.ts)
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => () => { TextToSpeech.stop().catch(() => undefined); }, []);

  const open = (s: ExamScenario) => {
    if (!s.free && !pro) { onOpenPaywall?.(); return; }
    setCurrent(s);
  };

  useEffect(() => {
    const s = initialScenarioId ? EXAM_SCENARIOS.find((x) => x.id === initialScenarioId) : undefined;
    if (s) open(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScenarioId]);

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
          onClick={() => (showInfo ? setShowInfo(false) : current ? setCurrent(null) : onBack())}
          aria-label={de ? 'Zurück' : 'Back'}
          data-testid="exam-simulation-back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 transition hover:bg-white/15 active:scale-95"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{showInfo ? (de ? 'So bewertet der Prüfer' : 'How the examiner grades') : current ? current.title[language] : 'Prüfungssimulation'}</h2>
          {!current && !showInfo && <p className="text-xs text-blue-100/70">{de ? 'Erkläre, was du tust. Die App prüft deine Antwort.' : 'Explain what you would do. The app checks your answer.'}</p>}
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-8">
        {/* the explainer overlays the current view instead of replacing it, so a result survives a look at it */}
        {showInfo && <ExamEvaluationInfo language={language} />}
        <div className={cn(showInfo && 'hidden')}>
        {current ? (
          <ScenarioView
            key={current.id}
            scenario={current}
            aiEnabled={aiEnabled}
            de={de}
            language={language}
            next={next}
            nextLocked={!!next && !next.free && !pro}
            onNext={() => next && open(next)}
            onBackToList={() => setCurrent(null)}
            onGraded={(id, ratio) => { saveResult(id, ratio); setResults(loadResults()); }}
            onInfo={() => setShowInfo(true)}
          />
        ) : (
          <>
          <button
            onClick={() => setShowInfo(true)}
            data-testid="exam-info-btn"
            className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-blue-400/30 bg-blue-600/20 p-4 text-left transition hover:bg-blue-600/30"
          >
            <ClipboardList className="h-6 w-6 shrink-0 text-blue-200" />
            <span className="min-w-0">
              <span className="block font-bold">{de ? 'So bewertet der Prüfer' : 'How the examiner grades'}</span>
              <span className="block text-xs text-blue-100/70">{de ? 'Das elektronische Prüfprotokoll, die 8 Fahraufgaben, die 5 Kompetenzbereiche' : 'The electronic test protocol, the 8 driving tasks, the 5 competence areas'}</span>
            </span>
          </button>
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
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function ScenarioView({ scenario, aiEnabled, de, language, next, nextLocked, onNext, onBackToList, onGraded, onInfo }: {
  scenario: ExamScenario; aiEnabled: boolean; de: boolean; language: 'de' | 'en'; next: ExamScenario | null; nextLocked: boolean;
  onNext: () => void; onBackToList: () => void; onGraded: (id: string, ratio: number) => void; onInfo: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<GradeResult | null>(null);
  // 'steps' (tap the cards in order) is the easy entry; 'write' is the free answer
  const [mode, setMode] = useState<'steps' | 'write'>('steps');
  const [seed, setSeed] = useState(() => Date.now());
  const [picked, setPicked] = useState<string[]>([]);
  const [stepResult, setStepResult] = useState<ReturnType<typeof gradeSteps> | null>(null);
  const cards = useMemo(() => shuffledCards(scenario, language, seed), [scenario, language, seed]);
  const [choice, setChoice] = useState<number | null>(null);
  const [ai, setAi] = useState<AiState>({ status: 'idle' });
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

  const retry = () => { setResult(null); setStepResult(null); setPicked([]); setSeed(Date.now()); setChoice(null); setAi({ status: 'idle' }); };

  const toggleCard = (key: string) => {
    if (stepResult) return;
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  };
  const checkSteps = () => {
    const g = gradeSteps(scenario, picked);
    setStepResult(g);
    onGraded(scenario.id, g.total ? g.right / g.total : 0);
    trackFunnel('scenario_steps', { scenario: scenario.id, right: g.right, total: g.total, mistakes: g.mistakes });
  };

  const askAi = async () => {
    if (aiUsedToday() >= AI_PER_DAY) { setAi({ status: 'error', reason: 'limit' }); return; }
    setAi({ status: 'loading' });
    countAiUse();
    try {
      const r = await fetch('/api/grade-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id, answer, language }),
      });
      const j = await r.json().catch(() => ({}));
      if (j?.ok) {
        setAi({ status: 'done', covered: new Set((j.points as { id: string; covered: boolean }[]).filter((x) => x.covered).map((x) => x.id)), feedback: j.feedback, better: j.better });
        trackFunnel('scenario_ai_feedback', { scenario: scenario.id, ok: true });
      } else {
        setAi({ status: 'error', reason: j?.reason === 'limit' ? 'limit' : 'unavailable' });
        trackFunnel('scenario_ai_feedback', { scenario: scenario.id, ok: false, reason: String(j?.reason ?? r.status) });
      }
    } catch {
      setAi({ status: 'error', reason: 'unavailable' });
    }
  };

  // a point counts when the on-device check or the AI feedback found it
  const isCovered = (id: string) => result?.points.find((x) => x.id === id)?.status === 'covered' || (ai.status === 'done' && ai.covered.has(id));
  const coveredCount = result ? scenario.keyPoints.filter((p) => isCovered(p.id)).length : 0;

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

      {/* Mode switch: steps (easy entry, no typing) or free answer */}
      {!result && !stepResult && (
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1" role="tablist">
          {([['steps', ListOrdered, de ? 'Schritte ordnen' : 'Order the steps'], ['write', PenLine, de ? 'Frei antworten' : 'Free answer']] as const).map(([m, Icon, label]) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              data-testid={`mode-${m}`}
              onClick={() => setMode(m)}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition', mode === m ? 'bg-blue-600 text-white shadow' : 'text-blue-100/70 hover:bg-white/5')}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      )}

      {mode === 'steps' && !stepResult && (
        <section className="space-y-3" data-testid="step-mode">
          <p className="text-sm font-bold">{de ? 'Tippe die Schritte in der Reihenfolge an, in der du sie machst.' : 'Tap the steps in the order you would do them.'}</p>
          <p className="text-xs text-blue-100/70">{de ? `${scenario.steps.length} Schritte sind richtig, ${scenario.mistakes.length} Karten sind Fehler und gehören nicht dazu. Nochmal antippen entfernt eine Karte.` : `${scenario.steps.length} steps are right, ${scenario.mistakes.length} cards are mistakes and do not belong. Tap again to remove a card.`}</p>
          <ul className="space-y-2">
            {cards.map((c) => {
              const pos = picked.indexOf(c.key);
              return (
                <li key={c.key}>
                  <button
                    onClick={() => toggleCard(c.key)}
                    data-testid={`card-${c.key}`}
                    aria-pressed={pos !== -1}
                    className={cn('flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition active:scale-[0.99]', pos !== -1 ? 'border-blue-400/60 bg-blue-600/25' : 'border-white/15 bg-white/5 hover:bg-white/10')}
                  >
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', pos !== -1 ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-100/60')}>{pos !== -1 ? pos + 1 : ''}</span>
                    <span>{c.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            onClick={checkSteps}
            disabled={picked.length < 2}
            data-testid="steps-check"
            className="w-full rounded-xl bg-blue-600 py-4 text-base font-bold transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-40"
          >
            {de ? 'Reihenfolge prüfen' : 'Check the order'}
          </button>
        </section>
      )}

      {stepResult && (
        <section className="space-y-4" data-testid="steps-result">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-blue-200">{de ? 'Deine Reihenfolge' : 'Your order'}</p>
            <p className="mt-1 text-2xl font-bold" data-testid="steps-score">
              {stepResult.right} {de ? 'von' : 'of'} {stepResult.total} {de ? 'Schritten an der richtigen Stelle' : 'steps in the right place'}
            </p>
            <ol className="mt-3 space-y-2">
              {picked.map((k, i) => {
                const v = stepResult.verdicts[i];
                const card = cards.find((c) => c.key === k)!;
                const mistake = k.startsWith('m') ? scenario.mistakes[Number(k.slice(1))] : null;
                return (
                  <li key={k} className="flex items-start gap-2 text-sm">
                    {v === 'right' ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : v === 'wrong-place' ? <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 rotate-90 text-amber-300" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />}
                    <span>
                      <span className={v === 'right' ? 'text-white' : 'text-blue-100/80'}>{i + 1}. {card.text}</span>
                      {v === 'wrong-place' && <span className="text-amber-200"> {de ? `(richtig, aber Schritt ${scenario.steps.findIndex((_, j) => `s${j}` === k) + 1})` : `(right, but step ${scenario.steps.findIndex((_, j) => `s${j}` === k) + 1})`}</span>}
                      {mistake && <span className="block text-red-200">{mistake.why[language]}{mistake.severe && <span className="ml-1 rounded bg-red-500/30 px-1.5 py-0.5 text-[11px] font-bold text-red-100">{de ? 'schwerer Fehler' : 'severe mistake'}</span>}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
            {stepResult.missing.length > 0 && (
              <p className="mt-3 text-sm text-blue-100/80">
                <span className="font-bold">{de ? 'Fehlt: ' : 'Missing: '}</span>
                {stepResult.missing.map((k) => scenario.steps[Number(k.slice(1))][language]).join(', ')}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-blue-200">{de ? 'Die richtige Reihenfolge' : 'The right order'}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {scenario.steps.map((t, i) => <li key={i}>{t[language]}</li>)}
            </ol>
            <p className="mt-3 flex items-start gap-2 text-xs text-blue-100/70"><BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />{scenario.law[language]}</p>
            <button onClick={onInfo} className="mt-3 text-xs font-bold text-blue-200 hover:text-white">{de ? 'So bewertet der Prüfer →' : 'How the examiner grades →'}</button>
          </div>
        </section>
      )}

      {mode === 'write' && !result ? (
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
          <p className="text-center text-[11px] text-blue-100/50">{de ? 'Die Prüfung läuft auf deinem Gerät. Beim Mikrofon wandelt dein Browser die Sprache in Text um, z. B. über Google oder Apple.' : 'The check runs on your device. With the microphone, your browser turns speech into text, e.g. via Google or Apple.'}</p>
        </section>
      ) : mode === 'write' && result ? (
        <section className="space-y-4" data-testid="scenario-result">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-bold text-blue-200">{de ? 'Deine Antwort' : 'Your answer'}</p>
            <p className="mt-1 text-2xl font-bold" data-testid="scenario-score">
              {coveredCount} {de ? 'von' : 'of'} {result.total} {de ? 'Punkten' : 'points'}
            </p>
            <ul className="mt-3 space-y-2">
              {scenario.keyPoints.map((p) => {
                const raw = result.points.find((x) => x.id === p.id)!.status;
                const st = isCovered(p.id) ? 'covered' : raw;
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
            <CompetenceGrid scenario={scenario} language={language} isCovered={isCovered} onInfo={onInfo} />
            {result.hints.map((h, i) => (
              <p key={i} className="mt-3 flex items-start gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-100">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />{h[language]}
              </p>
            ))}
          </div>

          {/* Detailed AI feedback on request (Groq free plan via our server) */}
          {aiEnabled && <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="scenario-ai">
            {ai.status === 'idle' && (
              <>
                <button onClick={askAi} data-testid="scenario-ai-btn" className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-blue-600/20 py-3 text-sm font-bold transition hover:bg-blue-600/30">
                  <Sparkles className="h-4 w-4" />{de ? 'Ausführliches Feedback (KI)' : 'Detailed feedback (AI)'}
                </button>
                <p className="mt-2 text-center text-[11px] text-blue-100/50">{de ? 'Deine Antwort wird zur Auswertung an unseren KI-Dienst gesendet und nicht gespeichert.' : 'Your answer is sent to our AI service for grading and is not stored.'}</p>
              </>
            )}
            {ai.status === 'loading' && (
              <p className="flex items-center justify-center gap-2 py-2 text-sm text-blue-100/80"><Loader2 className="h-4 w-4 animate-spin" />{de ? 'Deine Antwort wird ausgewertet ...' : 'Grading your answer ...'}</p>
            )}
            {ai.status === 'done' && (
              <div data-testid="scenario-ai-feedback">
                <p className="flex items-center gap-2 text-sm font-bold text-blue-200"><Sparkles className="h-4 w-4" />Feedback</p>
                <p className="mt-2 text-sm leading-relaxed">{ai.feedback}</p>
                {ai.better && (
                  <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm"><span className="font-bold">{de ? 'So könntest du es sagen: ' : 'You could say: '}</span>{ai.better}</p>
                )}
              </div>
            )}
            {ai.status === 'error' && (
              <p className="text-sm text-blue-100/80" data-testid="scenario-ai-error">
                {ai.reason === 'limit'
                  ? (de ? 'Für heute sind die KI-Auswertungen aufgebraucht. Dein Ergebnis oben gilt trotzdem, morgen geht es weiter.' : 'AI feedback is used up for today. Your result above still counts; it is back tomorrow.')
                  : (de ? 'Die KI-Auswertung ist gerade nicht erreichbar. Dein Ergebnis oben gilt trotzdem.' : 'AI feedback is not reachable right now. Your result above still counts.')}
              </p>
            )}
          </div>}

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
      ) : null}

      {/* After the step check: the same quick check and buttons as the free answer */}
      {stepResult && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4" data-testid="scenario-minitest">
            <p className="text-sm font-bold text-blue-200">{de ? 'Kurztest' : 'Quick check'}</p>
            <p className="mt-2 text-sm">{scenario.miniTest.question[language]}</p>
            <div className="mt-3 space-y-2">
              {scenario.miniTest.options.map((o, i) => {
                const isRight = i === scenario.miniTest.correct;
                const chosen = choice === i;
                return (
                  <button key={i} onClick={() => pick(i)} data-testid={`minitest-option-${i}`}
                    className={cn('flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition',
                      choice === null ? 'border-white/15 bg-white/5 hover:bg-white/10' : isRight ? 'border-emerald-400/60 bg-emerald-400/10' : chosen ? 'border-red-400/60 bg-red-400/10' : 'border-white/10 opacity-60')}>
                    <span className="font-bold">{String.fromCharCode(65 + i)})</span><span>{o[language]}</span>
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
              <RotateCcw className="h-4 w-4" />{de ? 'Nochmal' : 'Try again'}
            </button>
            <button onClick={() => { retry(); setMode('write'); }} data-testid="steps-to-write" className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold transition hover:bg-white/10">
              <PenLine className="h-4 w-4" />{de ? 'Jetzt frei antworten' : 'Now answer freely'}
            </button>
            {next ? (
              <button onClick={onNext} data-testid="scenario-next" className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold transition hover:bg-blue-700">
                {nextLocked && <Lock className="h-4 w-4" />}{de ? 'Nächste Situation' : 'Next situation'}<ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={onBackToList} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold transition hover:bg-blue-700">
                {de ? 'Zur Übersicht' : 'All situations'}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

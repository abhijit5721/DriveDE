/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * "So bewertet der Prüfer": the examiner's electronic test protocol explained (8 Oct),
 * from TÜV SÜD's official explainer and the Fahraufgabenkatalog. Content lives in
 * data/examEvaluation.ts and is shared with the public page /pruefung/so-bewertet-der-pruefer/.
 * Also exports the CompetenceGrid shown under every result in the Prüfungssimulation.
 */
import { AlertTriangle, Check, ExternalLink, X } from 'lucide-react';
import { COMPETENCE_AREAS, DRIVING_TASKS, EXAM_EVALUATION, type CompetenceArea } from '../../data/examEvaluation';
import { RATING_LABEL, type AreaRating } from '../../utils/examProtocol';
import type { ExamScenario } from '../../data/examScenarios';
import { cn } from '../../utils/cn';

type Lang = 'de' | 'en';

export function ExamEvaluationInfo({ language }: { language: Lang }) {
  const de = language === 'de';
  const E = EXAM_EVALUATION;
  return (
    <div className="space-y-4" data-testid="exam-evaluation-info">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm leading-relaxed text-blue-50">{E.intro[language]}</p>
      </section>
      {E.sections.map((s, i) => (
        <section key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-bold text-blue-200">{s.h[language]}</h3>
          {s.p.map((p, j) => <p key={j} className="mt-2 text-sm leading-relaxed">{p[language]}</p>)}
          {i === 1 && (
            <ol className="mt-3 space-y-1.5 text-sm">
              {DRIVING_TASKS.map((t) => (
                <li key={t.n} className="flex gap-2">
                  <span className="w-5 shrink-0 font-bold text-blue-200">{t.n}</span>
                  <span>
                    {t.title[language]}
                    {t.parts.length > 0 && <span className="block text-xs text-blue-100/70">{t.parts.map((p) => p[language]).join(' · ')}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {i === 2 && (
            <ul className="mt-3 space-y-2 text-sm">
              {COMPETENCE_AREAS.map((a) => (
                <li key={a.id}><span className="font-bold">{a.label[language]}:</span> <span className="text-blue-100/80">{a.desc[language]}</span></li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-blue-100/70">
        <p>{E.source[language]}</p>
        <a href={E.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-bold text-blue-200 hover:text-white">
          <ExternalLink className="h-3.5 w-3.5" />{de ? 'Erklärvideo von TÜV SÜD ansehen (YouTube)' : 'Watch TÜV SÜD\'s explainer (YouTube)'}
        </a>
      </section>
    </div>
  );
}

/**
 * The result of one situation, filed the way the examiner's protocol files it: per
 * Fahrkompetenzbereich, with severe mistakes marked.
 */
export function CompetenceGrid({ scenario, language, isCovered, onInfo }: {
  scenario: ExamScenario; language: Lang; isCovered: (id: string) => boolean; onInfo?: () => void;
}) {
  const de = language === 'de';
  const areas = COMPETENCE_AREAS.filter((a) => scenario.keyPoints.some((p) => p.area === a.id));
  const severeMissed = scenario.keyPoints.filter((p) => p.severe && !isCovered(p.id));
  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3" data-testid="competence-grid">
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">{de ? 'Im Prüfprotokoll des Prüfers' : 'In the examiner\'s protocol'}</p>
      <ul className="mt-2 space-y-1.5">
        {areas.map((a) => {
          const pts = scenario.keyPoints.filter((p) => p.area === a.id);
          const got = pts.filter((p) => isCovered(p.id)).length;
          const all = got === pts.length;
          return (
            <li key={a.id} className="flex items-center justify-between gap-3 text-sm" data-testid={`area-${a.id as CompetenceArea}`}>
              <span className="flex items-center gap-2">
                {all ? <Check className="h-4 w-4 shrink-0 text-emerald-400" /> : <X className="h-4 w-4 shrink-0 text-red-400" />}
                <span className={cn(all ? 'text-white' : 'text-blue-100/80')}>{a.label[language]}</span>
              </span>
              <span className="shrink-0 tabular-nums text-blue-100/70">{got} / {pts.length}</span>
            </li>
          );
        })}
      </ul>
      {severeMissed.length > 0 && (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/15 p-2.5 text-sm text-red-100" data-testid="severe-note">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
          <span>
            <span className="font-bold">{de ? 'Schwerer Fehler: ' : 'Severe mistake: '}</span>
            {severeMissed.map((p) => p.label[language]).join('; ')}. {de ? 'Im echten Protokoll kann das die Prüfung beenden.' : 'In the real protocol this can end the test.'}
          </span>
        </p>
      )}
      {onInfo && (
        <button onClick={onInfo} data-testid="grid-info" className="mt-3 text-xs font-bold text-blue-200 hover:text-white">
          {de ? 'So bewertet der Prüfer →' : 'How the examiner grades →'}
        </button>
      )}
    </div>
  );
}

/**
 * The learner's own protocol: one line per Fahrkompetenzbereich with the examiner's
 * rating words, summed over all situations answered freely. Hidden until there is data.
 */
export function ProtocolRatings({ language, ratings, compact = false }: { language: Lang; ratings: AreaRating[]; compact?: boolean }) {
  const de = language === 'de';
  const withData = ratings.filter((r) => r.rating);
  if (withData.length === 0) return null;
  const tone = (r: AreaRating['rating']) => r === 'very-good' || r === 'good' ? 'text-emerald-400' : r === 'sufficient' ? 'text-amber-300' : 'text-red-300';
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/5 p-4', compact ? '' : 'mb-4')} data-testid="protocol-ratings">
      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200">{de ? 'Dein Prüfprotokoll bisher' : 'Your protocol so far'}</p>
      <ul className="mt-2 space-y-1.5">
        {ratings.map((r) => {
          const a = COMPETENCE_AREAS.find((x) => x.id === r.area)!;
          return (
            <li key={r.area} className="flex items-center justify-between gap-3 text-sm" data-testid={`rating-${r.area}`}>
              <span className="text-blue-50">{a.label[language]}</span>
              {r.rating
                ? <span className={cn('shrink-0 font-bold', tone(r.rating))}>{RATING_LABEL[r.rating][language]} <span className="font-normal text-blue-100/60">({r.got}/{r.total})</span></span>
                : <span className="shrink-0 text-xs text-blue-100/50">{de ? 'noch keine Daten' : 'no data yet'}</span>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-blue-100/50">{de ? 'Skala wie beim Prüfer, Schwellen von uns: ab 90 % sehr gut, ab 75 % gut, ab 50 % ausreichend. Zählt frei beantwortete Situationen, beste Antwort je Situation.' : 'The examiner\'s scale, our thresholds: 90 % very good, 75 % good, 50 % sufficient. Counts freely answered situations, best answer per situation.'}</p>
    </div>
  );
}

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * The learner's own Prüfprotokoll (10 Oct): results of the Prüfungssimulation kept per
 * situation and per Fahrkompetenzbereich, and summed into the rating scale the examiner
 * uses after the drive (sehr gut, gut, ausreichend, nicht ausreichend). Stored on the
 * device; the best attempt per situation counts, like a learner who has improved.
 *
 * The thresholds are ours, not the examiner's: the catalogue gives no percentages. They
 * are stated as such wherever the rating is shown.
 */
import type { CompetenceArea } from '../data/examEvaluation';
import type { ExamScenario } from '../data/examScenarios';

export const PROTOCOL_KEY = 'drivede-exam-protocol';
/** Older key that held only a best ratio per situation (6 to 9 Oct). */
const LEGACY_RESULTS_KEY = 'drivede-scenario-results';

export type AreaTally = { got: number; total: number };
export interface ScenarioRecord {
  /** best covered/total ratio, 0..1 */
  ratio: number;
  /** per-area tallies of the attempt that set the best ratio (free answers only) */
  areas: Partial<Record<CompetenceArea, AreaTally>>;
  /** ms since epoch of that attempt */
  at: number;
}
export type Protocol = Record<string, ScenarioRecord>;

export type Rating = 'very-good' | 'good' | 'sufficient' | 'insufficient';

export const RATING_LABEL: Record<Rating, { de: string; en: string }> = {
  'very-good': { de: 'sehr gut', en: 'very good' },
  good: { de: 'gut', en: 'good' },
  sufficient: { de: 'ausreichend', en: 'sufficient' },
  insufficient: { de: 'nicht ausreichend', en: 'insufficient' },
};

export function loadProtocol(): Protocol {
  try {
    const raw = localStorage.getItem(PROTOCOL_KEY);
    if (raw) return JSON.parse(raw) as Protocol;
    // migrate the old best-ratio map once
    const legacy = JSON.parse(localStorage.getItem(LEGACY_RESULTS_KEY) || '{}') as Record<string, number>;
    const out: Protocol = {};
    for (const [id, ratio] of Object.entries(legacy)) out[id] = { ratio, areas: {}, at: 0 };
    return out;
  } catch {
    return {};
  }
}

function save(p: Protocol) {
  try { localStorage.setItem(PROTOCOL_KEY, JSON.stringify(p)); } catch { /* storage blocked: not remembered */ }
}

/**
 * Record an attempt. With `isCovered` (free answer) the per-area tallies are kept;
 * step mode passes only the ratio. The best ratio per situation wins; ties keep the
 * attempt that has area data.
 */
export function recordAttempt(scenario: ExamScenario, ratio: number, isCovered?: (id: string) => boolean): Protocol {
  const p = loadProtocol();
  const prev = p[scenario.id];
  const areas: ScenarioRecord['areas'] = {};
  if (isCovered) {
    for (const kp of scenario.keyPoints) {
      const t = (areas[kp.area] ??= { got: 0, total: 0 });
      t.total += 1;
      if (isCovered(kp.id)) t.got += 1;
    }
  }
  const better = !prev || ratio > prev.ratio || (ratio === prev.ratio && isCovered && Object.keys(prev.areas).length === 0);
  if (better) p[scenario.id] = { ratio, areas, at: Date.now() };
  save(p);
  return p;
}

/** Best ratio per situation, for the list (0..1). */
export function bestRatios(p: Protocol = loadProtocol()): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, r] of Object.entries(p)) out[id] = r.ratio;
  return out;
}

export function ratingFor(ratio: number): Rating {
  if (ratio >= 0.9) return 'very-good';
  if (ratio >= 0.75) return 'good';
  if (ratio >= 0.5) return 'sufficient';
  return 'insufficient';
}

export interface AreaRating { area: CompetenceArea; got: number; total: number; scenarios: number; rating: Rating | null }

/** Per competence area across all situations with area data; rating null without data. */
export function areaRatings(p: Protocol = loadProtocol()): AreaRating[] {
  const order: CompetenceArea[] = ['observation', 'position', 'speed', 'communication', 'handling'];
  return order.map((area) => {
    let got = 0, total = 0, scenarios = 0;
    for (const r of Object.values(p)) {
      const t = r.areas[area];
      if (!t || t.total === 0) continue;
      got += t.got; total += t.total; scenarios += 1;
    }
    return { area, got, total, scenarios, rating: total ? ratingFor(got / total) : null };
  });
}

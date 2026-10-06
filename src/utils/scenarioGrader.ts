/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * On-device grading for the Prüfungssimulation: checks a free-text (typed or dictated)
 * answer against a scenario's key points. Plain pattern matching, no server and no AI,
 * so it is free to run, private and deterministic. A match next to a negation ("ich
 * halte nicht an", "I would not stop") does not count, and contradiction patterns flag
 * risky statements.
 */
import type { ExamScenario } from '../data/examScenarios';

export type PointStatus = 'covered' | 'missing' | 'negated';

export interface GradeResult {
  points: { id: string; status: PointStatus }[];
  covered: number;
  total: number;
  hints: { de: string; en: string }[];
}

/** Lower case, German umlauts folded, punctuation turned into single spaces; sentence
 *  ends stay as a lone "." so a negation never reaches into the next sentence. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[’']/g, ' ')
    .replace(/[.!?;]+/g, ' . ')
    .replace(/[^a-z0-9.]+/g, ' ')
    .replace(/( \.)+/g, ' .')
    .replace(/^[ .]+|[ .]+$/g, '')
    .trim();
}

const NEGATORS = new Set(['nicht', 'kein', 'keine', 'keinen', 'keinem', 'keiner', 'nie', 'niemals', 'not', 'no', 'never', 'dont', 'don', 'doesnt', 'didnt', 'wont', 'cannot', 'cant', 'nor']);

/** True when a negation word sits within 3 words before or 2 words after the match
 *  (German puts "nicht" after the verb: "ich halte nicht an"). */
function negatedAt(text: string, start: number, end: number): boolean {
  // widen the match to whole words: pattern stems like "wink" end inside "winke"
  while (start > 0 && text[start - 1] !== ' ') start--;
  while (end < text.length && text[end] !== ' ') end++;
  // the window stops at a sentence end
  const beforeWords = text.slice(0, start).trim().split(' ').filter(Boolean);
  const cut = beforeWords.lastIndexOf('.');
  const before = beforeWords.slice(cut + 1).slice(-3);
  const inside = text.slice(start, end).split(' ').filter(Boolean);
  const afterWords = text.slice(end).trim().split(' ').filter(Boolean);
  const stop = afterWords.indexOf('.');
  const after = (stop === -1 ? afterWords : afterWords.slice(0, stop)).slice(0, 2);
  // a negation inside a split-verb match counts too: "ich halte nicht an"
  return [...before, ...inside, ...after].some((w) => NEGATORS.has(w));
}

/** First pattern match in the text, or null; with requireAffirmative a negated match is reported as such. */
function findMatch(text: string, patterns: string[]): { negated: boolean } | null {
  let negatedHit = false;
  for (const src of patterns) {
    const re = new RegExp(src, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (!negatedAt(text, m.index, m.index + m[0].length)) return { negated: false };
      negatedHit = true;
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  return negatedHit ? { negated: true } : null;
}

export function gradeAnswer(scenario: ExamScenario, answer: string): GradeResult {
  const text = normalize(answer);
  const points = scenario.keyPoints.map((p) => {
    if (p.allowNegation) {
      // the point is itself a "do not": any match counts, negated or not
      const hit = p.patterns.some((src) => new RegExp(src).test(text));
      return { id: p.id, status: (hit ? 'covered' : 'missing') as PointStatus };
    }
    const m = findMatch(text, p.patterns);
    return { id: p.id, status: (!m ? 'missing' : m.negated ? 'negated' : 'covered') as PointStatus };
  });
  const hints = scenario.contradictions
    .filter((c) => {
      const m = findMatch(text, c.patterns);
      return m !== null && !m.negated;
    })
    .map((c) => c.hint);
  return { points, covered: points.filter((p) => p.status === 'covered').length, total: points.length, hints };
}

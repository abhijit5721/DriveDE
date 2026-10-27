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
 *  ends stay as a lone "." and clause commas as a lone "," so a negation never reaches
 *  into the next sentence or clause. Decimal commas ("1,5 m") become a space as before. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[’']/g, ' ')
    .replace(/[.!?;]+/g, ' . ')
    .replace(/(\d),(?=\d)/g, '$1 ')
    .replace(/,+/g, ' , ')
    .replace(/[^a-z0-9.,]+/g, ' ')
    .replace(/( [.,])+/g, (m) => (m.includes('.') ? ' .' : ' ,'))
    .replace(/^[ .,]+|[ .,]+$/g, '')
    .trim();
}

const NEGATORS = new Set(['nicht', 'kein', 'keine', 'keinen', 'keinem', 'keiner', 'nie', 'niemals', 'not', 'no', 'never', 'dont', 'don', 'doesnt', 'didnt', 'wont', 'cannot', 'cant', 'nor']);
/** A negator right after one of these is elliptic or conditional ("wenn nicht, rechts vor
 *  links", "if not", "sonst nicht", "ob er kommt oder nicht") and does not negate the match. */
const CONDITIONALS = new Set(['wenn', 'falls', 'sofern', 'sonst', 'ansonsten', 'andernfalls', 'oder', 'if', 'otherwise', 'else', 'or']);
const BREAKS = new Set(['.', ',']);

/** Negation words a pattern spells out itself ("nicht (zu )?dicht"): in a match they are
 *  the point, not a negation of it. */
const ownNegators = new Map<string, Set<string>>();
function negatorsIn(src: string): Set<string> {
  let set = ownNegators.get(src);
  if (!set) {
    set = new Set(src.replace(/\\[a-z]/gi, ' ').split(/[^a-z]+/).filter((w) => NEGATORS.has(w)));
    ownNegators.set(src, set);
  }
  return set;
}

/** True when a negation word sits within 3 words before or 2 words after the match
 *  (German puts "nicht" after the verb: "ich halte nicht an"). */
function negatedAt(text: string, start: number, end: number, own: Set<string>): boolean {
  // widen the match to whole words: pattern stems like "wink" end inside "winke"
  while (start > 0 && text[start - 1] !== ' ') start--;
  while (end < text.length && text[end] !== ' ') end++;
  const words = (s: string) => s.trim().split(' ').filter(Boolean);
  // the window stops at a sentence end or a clause comma
  const beforeAll = words(text.slice(0, start));
  let cut = beforeAll.length - 1;
  while (cut >= 0 && !BREAKS.has(beforeAll[cut])) cut--;
  const clause = beforeAll.slice(cut + 1);
  const inside = words(text.slice(start, end));
  const afterAll = words(text.slice(end));
  const stop = afterAll.findIndex((w) => BREAKS.has(w));
  const after = (stop === -1 ? afterAll : afterAll.slice(0, stop)).slice(0, 2);
  const negates = (w: string, prev: string | undefined) => NEGATORS.has(w) && !(prev && CONDITIONALS.has(prev));
  if (clause.some((w, i) => i >= clause.length - 3 && negates(w, clause[i - 1]))) return true;
  // a negation inside a split-verb match counts too ("ich halte nicht an"), unless the
  // pattern itself spells it out
  const tail = [clause[clause.length - 1], ...inside];
  if (inside.some((w, i) => !own.has(w) && negates(w, tail[i]))) return true;
  const lead = [inside[inside.length - 1], ...after];
  return after.some((w, i) => negates(w, lead[i]));
}

/** First affirmative pattern match in the text, or null; a match found only negated is reported as such. */
function findMatch(text: string, patterns: string[]): { negated: boolean } | null {
  let negatedHit = false;
  for (const src of patterns) {
    const re = new RegExp(src, 'g');
    const own = negatorsIn(src);
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (!negatedAt(text, m.index, m.index + m[0].length, own)) return { negated: false };
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

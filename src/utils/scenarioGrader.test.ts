import { describe, it, expect } from 'vitest';
import { EXAM_SCENARIOS } from '../data/examScenarios';
import { gradeAnswer, normalize } from './scenarioGrader';

const scenario = (id: string) => EXAM_SCENARIOS.find((s) => s.id === id)!;
const status = (r: ReturnType<typeof gradeAnswer>, id: string) => r.points.find((p) => p.id === id)!.status;

describe('normalize', () => {
  it('folds umlauts and punctuation', () => {
    expect(normalize('Ich überprüfe, ob der Überweg frei ist!')).toBe('ich ueberpruefe ob der ueberweg frei ist');
    expect(normalize("I don't stop")).toBe('i don t stop');
    expect(normalize('Ich winke nicht. Erst dann!')).toBe('ich winke nicht . erst dann');
  });
});

describe('gradeAnswer', () => {
  it('a full German answer to the zebra crossing covers every point', () => {
    const r = gradeAnswer(scenario('zebrastreifen'), 'Ich beobachte früh den Gehweg und fahre langsam heran. Die Fußgängerin will queren, also halte ich vor dem Zebrastreifen an und warte, bis sie drüben ist. Bevor ich weiterfahre, schaue ich noch einmal.');
    expect(r.covered).toBe(r.total);
    expect(r.hints).toHaveLength(0);
  });

  it('the founder-style English answer gets most points and misses the stop position', () => {
    const r = gradeAnswer(scenario('zebrastreifen'), 'I slow down and look left and right. If the pedestrian wants to cross I stop and let her go. If there is no pedestrian coming, then I slowly go ahead.');
    expect(status(r, 'speed')).toBe('covered');
    expect(status(r, 'yield')).toBe('covered');
    expect(status(r, 'position')).toBe('missing');
  });

  it('a negated statement does not count', () => {
    const r = gradeAnswer(scenario('zebrastreifen'), 'Ich halte nicht an, sie steht ja noch auf dem Gehweg.');
    expect(status(r, 'yield')).toBe('negated');
    const en = gradeAnswer(scenario('zebrastreifen'), "I don't stop because she is still on the pavement.");
    expect(status(en, 'yield')).toBe('negated');
  });

  it('waving the pedestrian across is flagged', () => {
    const r = gradeAnswer(scenario('zebrastreifen'), 'Ich halte an und winke sie rüber.');
    expect(r.hints.length).toBe(1);
  });

  it('roundabout: "no indicator when entering" counts, "indicate when entering" is flagged', () => {
    const good = gradeAnswer(scenario('kreisverkehr'), 'Beim Einfahren blinke ich nicht, vor der Ausfahrt blinke ich rechts.');
    expect(status(good, 'noSignal')).toBe('covered');
    expect(status(good, 'exitSignal')).toBe('covered');
    expect(good.hints).toHaveLength(0);
    const bad = gradeAnswer(scenario('kreisverkehr'), 'I indicate left when entering the roundabout.');
    expect(status(bad, 'noSignal')).toBe('missing');
    expect(bad.hints.length).toBeGreaterThan(0);
  });

  it('lane change: claiming mirrors are enough is flagged', () => {
    const r = gradeAnswer(scenario('spurwechsel'), 'Ich schaue nur in den Spiegel und blinke dann.');
    expect(status(r, 'shoulder')).toBe('missing');
    expect(r.hints.length).toBe(1);
  });

  it('an empty answer covers nothing', () => {
    const r = gradeAnswer(scenario('rechts-vor-links'), '');
    expect(r.covered).toBe(0);
  });

  it('every pattern in every scenario compiles', () => {
    for (const s of EXAM_SCENARIOS) {
      for (const p of s.keyPoints) for (const src of p.patterns) expect(() => new RegExp(src)).not.toThrow();
      for (const c of s.contradictions) for (const src of c.patterns) expect(() => new RegExp(src)).not.toThrow();
    }
  });

  it('the model answer of every scenario covers all its own key points', () => {
    for (const s of EXAM_SCENARIOS) {
      for (const lang of ['de', 'en'] as const) {
        const r = gradeAnswer(s, s.modelAnswer[lang]);
        const missing = r.points.filter((p) => p.status !== 'covered').map((p) => p.id);
        expect({ id: s.id, lang, missing }).toEqual({ id: s.id, lang, missing: [] });
        expect({ id: s.id, lang, hints: r.hints.length }).toEqual({ id: s.id, lang, hints: 0 });
      }
    }
  });
});

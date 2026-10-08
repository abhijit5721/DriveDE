/**
 * (c) 2026 DriveDE. All rights reserved.
 *
 * How the practical exam is evaluated (8 Oct). Source: TÜV SÜD's official explainer
 * "Explaining video about the practical driving test in Germany" (18 Oct 2022,
 * youtu.be/3Oxq727_6k0) and the Fahraufgabenkatalog of the TÜV | DEKRA arge tp 21,
 * which is part of the Prüfungsrichtlinie. Used by the Prüfungssimulation (result grid
 * and the "So bewertet der Prüfer" explainer) and by the public pages.
 */
import type { Bilingual } from './examScenarios';

/** The five Fahrkompetenzbereiche the examiner rates in the elektronisches Prüfprotokoll. */
export type CompetenceArea = 'observation' | 'position' | 'speed' | 'communication' | 'handling';

export const COMPETENCE_AREAS: { id: CompetenceArea; label: Bilingual; short: Bilingual; desc: Bilingual }[] = [
  { id: 'observation', label: { de: 'Verkehrsbeobachtung', en: 'Observation of traffic' }, short: { de: 'Beobachtung', en: 'Observation' }, desc: { de: 'Schaust du rechtzeitig, in die richtige Richtung und auch über die Schulter? Erkennst du Vorfahrt, Fußgänger und Radfahrer früh genug?', en: 'Do you look in time, in the right direction and over your shoulder? Do you recognise priority, pedestrians and cyclists early enough?' } },
  { id: 'position', label: { de: 'Fahrzeugpositionierung', en: 'Positioning of the vehicle' }, short: { de: 'Position', en: 'Position' }, desc: { de: 'Fahrstreifen, Einordnen, Seitenabstand, wo du anhältst.', en: 'Lane, moving over, side distance, where you stop.' } },
  { id: 'speed', label: { de: 'Geschwindigkeitsanpassung', en: 'Adaptation of speed' }, short: { de: 'Tempo', en: 'Speed' }, desc: { de: 'Passt dein Tempo zur Situation: bremsbereit heranfahren, Schrittgeschwindigkeit, rechtzeitig anhalten, zügig beschleunigen?', en: 'Does your speed fit the situation: approaching ready to brake, walking pace, stopping in time, accelerating briskly?' } },
  { id: 'communication', label: { de: 'Kommunikation', en: 'Communication' }, short: { de: 'Kommunikation', en: 'Communication' }, desc: { de: 'Blinker rechtzeitig und richtig, kein Blinken im Kreisverkehr beim Einfahren, keine Handzeichen an Fußgänger, kein Hupen.', en: 'Indicator in time and correct, no indicating when entering a roundabout, no hand signals to pedestrians, no honking.' } },
  { id: 'handling', label: { de: 'Fahrzeugbedienung', en: 'Handling of the vehicle' }, short: { de: 'Bedienung', en: 'Handling' }, desc: { de: 'Kupplung, Bremse, Lenkung, Gangwahl: ruckfrei, ohne Abwürgen, mit ruhigen Lenkbewegungen.', en: 'Clutch, brake, steering, gear choice: smooth, no stalling, calm steering.' } },
];

/** The eight Fahraufgaben of the catalogue (class B), as shown in TÜV SÜD's explainer. */
export const DRIVING_TASKS: { n: number; title: Bilingual; parts: Bilingual[] }[] = [
  { n: 1, title: { de: 'Ein- und Ausfädeln, Fahrstreifenwechsel', en: 'Entering and leaving zip merge, change of lane' }, parts: [{ de: 'Einfädeln (z. B. Autobahnauffahrt)', en: 'Zip merge (e.g. joining the Autobahn)' }, { de: 'Ausfädeln', en: 'Leaving zip merge' }, { de: 'Fahrstreifenwechsel', en: 'Change of lane' }] },
  { n: 2, title: { de: 'Kurven', en: 'Curves' }, parts: [] },
  { n: 3, title: { de: 'Vorbeifahren, Überholen', en: 'Passing, overtaking' }, parts: [{ de: 'Vorbeifahren an Hindernissen und Engstellen', en: 'Passing stationary objects and bottlenecks' }, { de: 'Überholen anderer Verkehrsteilnehmer', en: 'Overtaking other road users' }] },
  { n: 4, title: { de: 'Kreuzungen, Einmündungen, Einfahren', en: 'Crossroads, junctions, entering roads' }, parts: [{ de: 'Überqueren', en: 'Crossing' }, { de: 'Rechts abbiegen', en: 'Turning right' }, { de: 'Links abbiegen', en: 'Turning left' }, { de: 'Einfahren in eine Straße', en: 'Entering a road' }] },
  { n: 5, title: { de: 'Kreisverkehr', en: 'Roundabout' }, parts: [] },
  { n: 6, title: { de: 'Schienenverkehr', en: 'Rail traffic' }, parts: [{ de: 'Bahnübergänge', en: 'Driving near and crossing railway tracks' }, { de: 'Straßenbahn und Gleise', en: 'Nearing a tram and tram tracks' }] },
  { n: 7, title: { de: 'Haltestellen und Fußgängerüberwege', en: 'Stops (public transport) and pedestrian crossings' }, parts: [{ de: 'Bus- und Straßenbahnhaltestellen', en: 'Nearing and passing bus and tram stops' }, { de: 'Fußgängerüberwege', en: 'Nearing and crossing pedestrian crossings' }] },
  { n: 8, title: { de: 'Geradeausfahren', en: 'Driving straight' }, parts: [] },
];

/** The explainer text, one paragraph per section. */
export const EXAM_EVALUATION: { title: Bilingual; intro: Bilingual; sections: { h: Bilingual; p: Bilingual[] }[]; source: Bilingual; videoUrl: string } = {
  title: { de: 'So bewertet der Prüfer: das elektronische Prüfprotokoll', en: 'How the examiner grades: the electronic test protocol' },
  intro: {
    de: 'Seit 2021 bewertet der Prüfer die praktische Prüfung nach einem festen Katalog und trägt alles auf einem Tablet ein, dem elektronischen Prüfprotokoll (ePP). Wer weiß, was dort steht, weiß, worauf es in jeder Situation ankommt.',
    en: 'Since 2021 the examiner grades the practical test against a fixed catalogue and records everything on a tablet, the electronic test protocol (ePP). If you know what is on it, you know what matters in every situation.',
  },
  sections: [
    { h: { de: 'Vor der Fahrt', en: 'Before the drive' }, p: [
      { de: 'Der Prüfer stellt sich vor, prüft deinen Ausweis und ob die vorgeschriebene Ausbildung abgeschlossen ist. Dann bittet er dich, Sitz, Spiegel und alles Persönliche einzustellen, und beobachtet, ob du an alles denkst. Das Ergebnis trägt er bereits ins Protokoll ein. Es folgt die Abfahrtkontrolle: Du zeigst stichprobenartig, dass das Fahrzeug in Ordnung ist. Danach erklärt er den Ablauf und wünscht dir Erfolg.', en: 'The examiner introduces himself, checks your ID and whether the prescribed training is complete. Then he asks you to adjust the seat, mirrors and everything personal, and watches whether you think of everything. That result already goes into the protocol. Next comes the safety check: you show, by sample, that the vehicle is in proper condition. Then he explains the procedure and wishes you success.' },
    ] },
    { h: { de: 'Die acht Fahraufgaben', en: 'The eight driving tasks' }, p: [
      { de: 'Der Fahraufgabenkatalog beschreibt acht Fahraufgaben, einige mit Teilaufgaben: Ein- und Ausfädeln und Fahrstreifenwechsel, Kurven, Vorbeifahren und Überholen, Kreuzungen und Einmündungen, Kreisverkehr, Schienenverkehr, Haltestellen und Fußgängerüberwege, Geradeausfahren. Dazu kommen die Grundfahraufgaben wie Einparken und Gefahrbremsung. Für jede Aufgabe steht im Katalog, welches Verhalten erwartet wird, und für Sonderfälle gibt es Unterklassen, zum Beispiel Linksabbiegen bei rechts vor links, mit Schildern, mit Ampel oder mit Polizist.', en: 'The catalogue of driving tasks describes eight driving tasks, some with partial tasks: entering and leaving zip merges and changing lanes, curves, passing and overtaking, crossroads and junctions, roundabouts, rail traffic, stops and pedestrian crossings, driving straight. Added to that are the basic driving tasks such as parking and the emergency stop. For each task the catalogue states the expected behaviour, and for special cases there are subclasses, for example turning left with right before left, with signs, with traffic lights or with a police officer.' },
    ] },
    { h: { de: 'Die fünf Kompetenzbereiche', en: 'The five areas of driving competence' }, p: [
      { de: 'Jede Anforderung gehört zu einem von fünf Bereichen: Verkehrsbeobachtung, Fahrzeugpositionierung, Geschwindigkeitsanpassung, Kommunikation und Fahrzeugbedienung. Dazu kommt umweltbewusstes Fahren. Genau diese Spalten sieht der Prüfer auf seinem Tablet, und in der Prüfungssimulation siehst du nach jeder Antwort, welche Spalte du getroffen hast.', en: 'Every requirement belongs to one of five areas: observation of traffic, positioning of the vehicle, adaptation of speed, communication and handling of the vehicle. Environmentally friendly driving is added to that. These are exactly the columns the examiner sees on the tablet, and in the exam simulation you see after every answer which column you hit.' },
    ] },
    { h: { de: 'Was ein Fehler wiegt', en: 'What a mistake weighs' }, p: [
      { de: 'Der Katalog nennt für jede Aufgabe Beispiele für überdurchschnittliche Leistungen, für leichte Fehler und für schwere Fehler, darunter solche, die zum sofortigen Abbruch der Prüfung führen. Entscheidend ist das Gefährdungspotenzial. Für manche Kriterien gibt es Richtwerte zu Abständen, Geschwindigkeiten und Korrekturzeiten. Jemandem die Vorfahrt nehmen oder einen Fußgänger gefährden wiegt schwer; ein zu zögerliches Anfahren ist eine Bemerkung.', en: 'For each task the catalogue gives examples of above-average performance, minor mistakes and severe mistakes, including those that end the test at once. The hazard potential is decisive. For some criteria there are guide values for distances, speeds and correction times. Taking someone\'s priority or endangering a pedestrian weighs heavily; a hesitant start is a remark.' },
    ] },
    { h: { de: 'Was der Prüfer während der Fahrt tut', en: 'What the examiner does during the drive' }, p: [
      { de: 'Er beobachtet und trägt nur Ereignisse ein, gute wie schlechte, mit wenigen Tipps auf dem Tablet. Fährst du wie erwartet, muss er nichts eintragen. Machst du einen Fehler, versucht er später, eine ähnliche Situation noch einmal herbeizuführen, um zu sehen, ob es ein einmaliger Fehler war oder ein wiederkehrender. Das nennt sich adaptive Prüfstrategie: Der weitere Verlauf der Prüfung hängt davon ab, was bisher passiert ist. Praktisch heißt das: Ein Fehler ist nicht das Ende, aber derselbe Fehler zweimal wiegt schwer.', en: 'He observes and records only events, good and bad, with a few taps on the tablet. If you drive as expected, there is nothing to record. If you make a mistake, he later tries to bring about a similar situation again, to see whether it was a one-off or a recurring mistake. This is called the adaptive test strategy: the further course of the test depends on what has happened so far. In practice: one mistake is not the end, but the same mistake twice weighs heavily.' },
    ] },
    { h: { de: 'Die Bewertung und das Feedback', en: 'The grading and the feedback' }, p: [
      { de: 'Nach der Fahrt bewertet der Prüfer jede Fahraufgabe und jeden Kompetenzbereich über alle Situationen hinweg mit sehr gut, gut, ausreichend oder nicht ausreichend und entscheidet dann über bestanden oder nicht bestanden. Er sagt dir das Ergebnis, erklärt seine Bewertung der fünf Bereiche und der entscheidenden Fahraufgaben an konkreten Ereignissen und gibt dir Tipps. Kurz danach bekommst du ein schriftliches Feedback, meist elektronisch: die Gesamtbewertung der fünf Bereiche und der acht Aufgaben, Hinweise zu allem, was nicht sehr gut war, und die einzelnen besonders guten Leistungen und Fehler. Das gilt nach bestandener wie nach nicht bestandener Prüfung.', en: 'After the drive the examiner rates every driving task and every competence area across all situations as very good, good, sufficient or insufficient, and then decides passed or failed. He tells you the result, explains his rating of the five areas and the decisive driving tasks with concrete events, and gives you tips. Shortly after, you receive written feedback, usually electronically: the overall rating of the five areas and the eight tasks, notes on everything that was not very good, and the individual particularly good performances and mistakes. That applies after a passed and after a failed test.' },
    ] },
    { h: { de: 'Was das für dich heißt', en: 'What that means for you' }, p: [
      { de: 'Übe die Situationen aus dem Katalog, nicht irgendwelche. Achte in jeder Situation auf die fünf Bereiche, vor allem auf die Beobachtung: Der Prüfer sieht, wohin du schaust. Und wenn dir ein Fehler passiert: ruhig weiterfahren und ihn beim nächsten Mal nicht wiederholen, denn genau das prüft er.', en: 'Practise the situations from the catalogue, not random ones. In every situation pay attention to the five areas, above all observation: the examiner sees where you look. And if a mistake happens: keep driving calmly and do not repeat it next time, because that is exactly what he tests.' },
    ] },
  ],
  source: { de: 'Quelle: Erklärvideo von TÜV SÜD zur praktischen Fahrerlaubnisprüfung (Oktober 2022) und der Fahraufgabenkatalog der TÜV | DEKRA arge tp 21, Teil der Prüfungsrichtlinie. Die Beschreibung ist unsere Zusammenfassung; maßgeblich sind die Richtlinie und die Fahrerlaubnis-Verordnung.', en: 'Source: TÜV SÜD\'s explainer video on the practical driving test (October 2022) and the catalogue of driving tasks of the TÜV | DEKRA arge tp 21, part of the examination guidelines. This description is our summary; the guidelines and the Fahrerlaubnis-Verordnung are authoritative.' },
  videoUrl: 'https://www.youtube.com/watch?v=3Oxq727_6k0',
};

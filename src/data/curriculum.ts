import type { Chapter, Lesson, ManeuverStep, Tip, QuizQuestion, GuidedPoint, LessonScenario, TrafficSign } from '../types';

// Shared data
const maneuverTips: Tip[] = [
  // ... (existing tips)
];

// Chapter 1: Basics
const basicsLessons: Lesson[] = [
  { id: 'basics-0', titleDe: 'Umschreibung: Schnellstart', /*...,*/ isPremium: false },
  { id: 'basics-1', titleDe: 'Sitzposition & Spiegel', /*...,*/ isPremium: false },
  { id: 'basics-1a', titleDe: 'Fahrzeugcheck & Technikfragen', /*...,*/ isPremium: true },
  { id: 'basics-1b', titleDe: 'Schulterblick: Pflichtsituationen', /*...,*/ isPremium: false },
  { id: 'basics-2', titleDe: 'Anfahren & Anhalten (Schaltung)', /*...,*/ manualOnly: true, isPremium: false },
  { id: 'basics-2a', titleDe: 'Anfahren & Anhalten (Automatik)', /*...,*/ automaticOnly: true, isPremium: false },
  { id: 'basics-3', titleDe: 'Schalten & Kupplungstechnik', /*...,*/ manualOnly: true, isPremium: true },
  { id: 'basics-3a', titleDe: 'Fahrmodi & Tiptronic', /*...,*/ automaticOnly: true, isPremium: true },
  { id: 'basics-4', titleDe: 'Lenkradführung', /*...,*/ isPremium: true },
  { id: 'basics-5', titleDe: 'Anfahren am Berg (Schaltung)', /*...,*/ manualOnly: true, isPremium: true },
  { id: 'basics-5a', titleDe: 'Anfahren am Berg (Automatik)', /*...,*/ automaticOnly: true, isPremium: true },
];

// Chapter 2: Maneuvers
const maneuverLessons: Lesson[] = [
  { id: 'maneuver-1', titleDe: 'Einparken längs (Parallel)', /*...,*/ isPremium: false },
  { id: 'maneuver-2', titleDe: 'Einparken rückwärts', /*...,*/ isPremium: true },
  { id: 'maneuver-3', titleDe: 'Wenden (Drei-Punkt-Wende)', /*...,*/ isPremium: true },
  { id: 'maneuver-4', titleDe: 'Gefahrenbremsung (Schaltung)', /*...,*/ manualOnly: true, isPremium: true },
  { id: 'maneuver-4a', titleDe: 'Gefahrenbremsung (Automatik)', /*...,*/ automaticOnly: true, isPremium: true },
];

// Chapter 3: City Driving
const cityLessons: Lesson[] = [
  { id: 'city-1', titleDe: 'Rechts vor Links', /*...,*/ isPremium: false },
  { id: 'city-2', titleDe: 'Ampelkreuzungen & Linksabbiegen', /*...,*/ isPremium: false },
  { id: 'city-3', titleDe: 'Kreisverkehr', /*...,*/ isPremium: true },
  { id: 'city-4', titleDe: 'Zebrastreifen & Fußgänger', /*...,*/ isPremium: true },
  { id: 'city-5', titleDe: 'Rechtsabbiegen', /*...,*/ isPremium: true },
  { id: 'city-5a', titleDe: 'Verkehrsberuhigter Bereich & Zone 30', /*...,*/ isPremium: true },
  { id: 'city-5b', titleDe: 'Reißverschlussverfahren', /*...,*/ isPremium: true },
  { id: 'city-5c', titleDe: 'Bushaltestelle & §20 StVO', /*...,*/ isPremium: true },
  { id: 'city-6', titleDe: 'Spurwechsel', /*...,*/ isPremium: true },
  { id: 'city-7', titleDe: 'Halten vs. Parken', /*...,*/ isPremium: true },
  { id: 'city-8', titleDe: 'Einfahren aus Grundstücken (§ 10 StVO)', /*...,*/ isPremium: true },
  { id: 'city-9', titleDe: 'Bahnübergänge', /*...,*/ isPremium: true },
  { id: 'city-10', titleDe: 'Einsatzfahrzeuge & Blaulicht', /*...,*/ isPremium: true },
  { id: 'city-11', titleDe: 'Überholen von Radfahrern', /*...,*/ isPremium: true },
];

// Chapter 4: Special Drives
const specialLessons: Lesson[] = [
  { id: 'special-1', titleDe: 'Überlandfahrt', /*...,*/ isPremium: true },
  { id: 'special-2', titleDe: 'Autobahnfahrt', /*...,*/ isPremium: true },
  { id: 'special-2a', titleDe: 'Autobahn-Sonderregeln', /*...,*/ isPremium: true },
  { id: 'special-3', titleDe: 'Nachtfahrt', /*...,*/ isPremium: true },
  { id: 'special-4', titleDe: 'Gefahrenlehre & defensives Fahren', /*...,*/ isPremium: true },
];

// Chapter 5: Exam Prep
const examLessons: Lesson[] = [
  { id: 'exam-1', titleDe: 'Umweltbewusstes Fahren', /*...,*/ isPremium: true },
  { id: 'exam-1a', titleDe: 'Fahrzeug sicher verlassen', /*...,*/ isPremium: true },
  { id: 'exam-2', titleDe: 'Prüfungsangst bewältigen', /*...,*/ isPremium: false },
  { id: 'exam-2a', titleDe: 'Sofortiges Nichtbestehen vermeiden', /*...,*/ isPremium: true },
  { id: 'exam-3', titleDe: 'Prüfungs-Checkliste', /*...,*/ isPremium: false },
];

export const chapters: Chapter[] = [
  { id: 'chapter-1', titleDe: 'Grundstufe', /*...,*/ lessons: basicsLessons },
  { id: 'chapter-2', titleDe: 'Grundfahraufgaben', /*...,*/ lessons: maneuverLessons },
  { id: 'chapter-3', titleDe: 'Aufbaustufe', /*...,*/ lessons: cityLessons },
  { id: 'chapter-4', titleDe: 'Sonderfahrten', /*...,*/ lessons: specialLessons },
  { id: 'chapter-5', titleDe: 'Reifestufe & Prüfung', /*...,*/ lessons: examLessons },
];

export const getAllLessons = (): Lesson[] => {
  return chapters.flatMap((chapter) => chapter.lessons);
};

// ... (rest of the file)

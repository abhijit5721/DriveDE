/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { Chapter, Lesson, ManeuverStep, QuizQuestion, GuidedPoint, LessonScenario, TrafficSign } from '../types';
import { TRANSLATIONS } from './translations';

// Helper to map scenarios from translations
const getScenario = (id: string, arrayName: 'scenarios' | 'vehicleCheckScenarios' = 'scenarios'): LessonScenario => {
  const deArray = TRANSLATIONS.de.curriculumData[arrayName] as any[];
  const enArray = TRANSLATIONS.en.curriculumData[arrayName] as any[];
  
  const de = deArray?.find(s => s.id === id);
  const en = enArray?.find(s => s.id === id);
  
  if (!de || !en) {
    console.warn(`Scenario not found: ${id} in ${arrayName}`);
    return {
      id,
      titleDe: id,
      titleEn: id,
      situationDe: '',
      situationEn: '',
      steps: []
    };
  }
  
  return {
    id,
    titleDe: de.title,
    titleEn: en.title,
    situationDe: de.situation,
    situationEn: en.situation,
    steps: de.steps.map((step: any, idx: number) => ({
      id: idx + 1,
      titleDe: step.title,
      titleEn: en.steps[idx]?.title || step.title,
      descriptionDe: step.description,
      descriptionEn: en.steps[idx]?.description || step.description,
      icon: step.icon || 'Circle',
      critical: step.critical || false,
    })),
    mistakes: de.mistakes?.map((m: any, idx: number) => ({
      id: `m-${idx}`,
      titleDe: m.title,
      titleEn: en.mistakes?.[idx]?.title || m.title,
      contentDe: m.content,
      contentEn: en.mistakes?.[idx]?.content || m.content,
      type: 'warning'
    })),
  };
};

// Helper to map guided points from translations
const getGuidedPoints = (key: keyof typeof TRANSLATIONS.de.curriculumData.guidedPoints, prefix: string): GuidedPoint[] => {
  const dePoints = TRANSLATIONS.de.curriculumData.guidedPoints[key];
  const enPoints = TRANSLATIONS.en.curriculumData.guidedPoints[key];
  
  return dePoints.map((point, index) => ({
    id: `${prefix}-${index}`,
    titleDe: point.title,
    titleEn: enPoints[index].title,
    contentDe: point.content,
    contentEn: enPoints[index].content,
    emphasis: 'safety',
  }));
};

// Helper to map traffic signs from translations
const getTrafficSign = (id: string, overrides: Partial<TrafficSign> = {}): TrafficSign => {
  const de = (TRANSLATIONS.de.curriculumData.trafficSigns as any)?.[id];
  const en = (TRANSLATIONS.en.curriculumData.trafficSigns as any)?.[id];
  
  return {
    id,
    titleDe: de?.title || '',
    titleEn: en?.title || de?.title || '',
    descriptionDe: de?.description || '',
    descriptionEn: en?.description || de?.description || '',
    ...overrides
  };
};


const getLessonStrings = (id: string) => {
  const de = (TRANSLATIONS.de.curriculumData as any).lessons[id];
  const en = (TRANSLATIONS.en.curriculumData as any).lessons[id];
  
  if (!de) return { titleDe: id, titleEn: id, descriptionDe: '', descriptionEn: '' };

  const result: any = {
    titleDe: de.title || '',
    titleEn: en?.title || de.title || '',
    descriptionDe: de.description || '',
    descriptionEn: en?.description || de.description || '',
  };

  if (de.tips) {
    result.tips = de.tips.map((tip: any, index: number) => ({
      ...tip,
      titleDe: tip.title,
      titleEn: en?.tips?.[index]?.title || tip.title,
      contentDe: tip.content,
      contentEn: en?.tips?.[index]?.content || tip.content,
    }));
  }

  if (de.guidedPoints) {
    result.guidedPoints = de.guidedPoints.map((gp: any, index: number) => ({
      ...gp,
      titleDe: gp.title,
      titleEn: en?.guidedPoints?.[index]?.title || gp.title,
      contentDe: gp.content,
      contentEn: en?.guidedPoints?.[index]?.content || gp.content,
    }));
  }

  if (de.glossary) {
    result.glossary = de.glossary.map((item: any, index: number) => ({
      ...item,
      german: item.german || item.term || '',
      english: en?.glossary?.[index]?.german || en?.glossary?.[index]?.term || item.german || item.term || '',
      noteDe: item.noteDe || item.note || '',
      noteEn: en?.glossary?.[index]?.noteDe || en?.glossary?.[index]?.note || item.noteDe || item.note || '',
    }));
  }

  if (de.examinerCommands) {
    result.examinerCommands = de.examinerCommands.map((cmd: any, index: number) => ({
      ...cmd,
      commandDe: cmd.commandDe || cmd.command || '',
      commandEn: en?.examinerCommands?.[index]?.commandDe || en?.examinerCommands?.[index]?.command || cmd.commandDe || cmd.command || '',
      noteDe: cmd.noteDe || cmd.note || '',
      noteEn: en?.examinerCommands?.[index]?.noteDe || en?.examinerCommands?.[index]?.note || cmd.noteDe || cmd.note || '',
    }));
  }

  if (de.scenarioSectionTitle) {
    result.scenarioSectionTitleDe = de.scenarioSectionTitle;
    result.scenarioSectionTitleEn = en?.scenarioSectionTitle || de.scenarioSectionTitle;
  }
  if (de.scenarioSectionSubtitle) {
    result.scenarioSectionSubtitleDe = de.scenarioSectionSubtitle;
    result.scenarioSectionSubtitleEn = en?.scenarioSectionSubtitle || de.scenarioSectionSubtitle;
  }

  // Scenarios mapping
  if (de.scenarios) {
    result.scenarios = de.scenarios.map((scenario: any, sIdx: number) => {
      const enScenario = en?.scenarios?.[sIdx];
      return {
        id: scenario.id,
        titleDe: scenario.title,
        titleEn: enScenario?.title || scenario.title,
        situationDe: scenario.situation,
        situationEn: enScenario?.situation || scenario.situation,
        steps: scenario.steps.map((step: any, stepIdx: number) => {
          const enStep = enScenario?.steps?.[stepIdx];
          return {
            id: step.id,
            titleDe: step.title,
            titleEn: enStep?.title || step.title,
            descriptionDe: step.description,
            descriptionEn: enStep?.description || step.description,
            icon: step.icon,
            critical: step.critical,
          };
        }),
      };
    });
  }

  return result;
};

// Helper to map arrays from curriculumData
const getTranslatedArray = <T>(
  arrayName: keyof typeof TRANSLATIONS.de.curriculumData,
  mapper: (de: any, en: any, index: number) => T
): T[] => {
  const de = TRANSLATIONS.de.curriculumData[arrayName] as any[];
  const en = TRANSLATIONS.en.curriculumData[arrayName] as any[];
  if (!de || !en) return [];
  return de.map((item, index) => mapper(item, en[index], index));
};

// Helper to map steps from curriculumData
const getSteps = (
  arrayName: keyof typeof TRANSLATIONS.de.curriculumData,
  icons: string[],
  criticalFlags: boolean[]
): ManeuverStep[] => {
  return getTranslatedArray(arrayName, (de, en, index) => ({
    id: index + 1,
    titleDe: de.title,
    titleEn: en?.title || de.title,
    descriptionDe: de.description,
    descriptionEn: en?.description || de.description,
    icon: icons[index] || 'CheckCircle',
    critical: criticalFlags[index] || false,
  }));
};

// Parallel Parking Steps
const parallelParkingSteps: ManeuverStep[] = getSteps(
  'parallelParkingSteps',
  ['Search', 'ArrowRight', 'Eye', 'RotateCcw', 'RotateCw', 'AlignCenter', 'CheckCircle'],
  [false, false, true, true, false, false, true]
);

// Reverse Parking Steps
const reverseParkingSteps: ManeuverStep[] = getSteps(
  'reverseParkingSteps',
  ['Target', 'Eye', 'CornerDownRight', 'Search', 'AlignCenter', 'CheckCircle'],
  [false, true, false, false, false, false]
);

// Three-Point Turn Steps
const threePointTurnSteps: ManeuverStep[] = getSteps(
  'threePointTurnSteps',
  ['Eye', 'ArrowLeft', 'Square', 'RotateCw', 'Square', 'ArrowUp'],
  [true, false, false, true, false, false]
);

// Emergency Braking Steps for MANUAL
const emergencyBrakingStepsManual: ManeuverStep[] = getSteps(
  'emergencyBrakingStepsManual',
  ['Gauge', 'Eye', 'Zap', 'Activity', 'Move', 'Wind', 'RefreshCw'],
  [false, true, true, false, false, false, true]
);

// Emergency Braking Steps for AUTOMATIC
const emergencyBrakingStepsAutomatic: ManeuverStep[] = getSteps(
  'emergencyBrakingStepsAutomatic',
  ['Gauge', 'Eye', 'Zap', 'Move', 'Wind', 'RefreshCw'],
  [false, true, true, false, false, true]
);









const leftTurnGuidedPoints: GuidedPoint[] = TRANSLATIONS.de.curriculumData.leftTurnGuidedPoints.map((item, index) => ({
  id: `left-turn-gp${index + 1}`,
  titleDe: item.title,
  titleEn: TRANSLATIONS.en.curriculumData.leftTurnGuidedPoints[index].title,
  contentDe: item.content,
  contentEn: TRANSLATIONS.en.curriculumData.leftTurnGuidedPoints[index].content,
  emphasis: (['safety', 'look', 'priority', 'exam', 'priority', 'safety', 'exam'] as const)[index],
}));

const germanRoadGlossary = TRANSLATIONS.de.curriculumData.glossary.map((item, index) => ({
  id: `glossary-${item.term.toLowerCase().replace(/[^a-z]/g, '-')}`,
  german: item.term,
  english: TRANSLATIONS.en.curriculumData.glossary[index].term,
  noteDe: item.note,
  noteEn: TRANSLATIONS.en.curriculumData.glossary[index].note,
}));

const examinerCommandsCore = TRANSLATIONS.de.curriculumData.examinerCommands.map((item, index) => ({
  id: `cmd-${index}`,
  commandDe: item.command,
  commandEn: TRANSLATIONS.en.curriculumData.examinerCommands[index].command,
  noteDe: item.note,
  noteEn: TRANSLATIONS.en.curriculumData.examinerCommands[index].note,
}));

const signGreenArrow: TrafficSign = {
  id: 'sign-green-arrow',
  code: 'Zeichen 720',
  titleDe: TRANSLATIONS.de.curriculumData.trafficSigns.greenArrow.title,
  titleEn: TRANSLATIONS.en.curriculumData.trafficSigns.greenArrow.title,
  descriptionDe: TRANSLATIONS.de.curriculumData.trafficSigns.greenArrow.description,
  descriptionEn: TRANSLATIONS.en.curriculumData.trafficSigns.greenArrow.description,
  category: 'traffic-light',
};

const signGreenArrowSignal: TrafficSign = {
  id: 'sign-green-arrow-signal',
  code: 'Lichtzeichen',
  titleDe: TRANSLATIONS.de.curriculumData.trafficSigns.greenArrowSignal.title,
  titleEn: TRANSLATIONS.en.curriculumData.trafficSigns.greenArrowSignal.title,
  descriptionDe: TRANSLATIONS.de.curriculumData.trafficSigns.greenArrowSignal.description,
  descriptionEn: TRANSLATIONS.en.curriculumData.trafficSigns.greenArrowSignal.description,
  category: 'traffic-light',
};

const leftTurnScenarios: LessonScenario[] = TRANSLATIONS.de.curriculumData.scenarios
  .filter(s => s.id.startsWith('left-turn-'))
  .map(s => getScenario(s.id));


const rightBeforeLeftGuidedPoints: GuidedPoint[] = getGuidedPoints('rightBeforeLeft', 'rvl-gp');


const laneChangeGuidedPoints: GuidedPoint[] = getGuidedPoints('laneChange', 'lane-gp');


const signRoundabout: TrafficSign = {
  id: 'sign-roundabout',
  code: 'Zeichen 215',
  titleDe: 'Kreisverkehr',
  titleEn: 'Roundabout',
  descriptionDe: 'Zeigt einen Kreisverkehr an. Zusammen mit Zeichen 205 haben Fahrzeuge im Kreisverkehr Vorfahrt.',
  descriptionEn: 'Indicates a roundabout. Together with sign 205, vehicles in the roundabout have priority.',
  category: 'mandatory',
};

const signYield: TrafficSign = {
  id: 'sign-yield',
  code: 'Zeichen 205',
  titleDe: 'Vorfahrt gewähren',

  titleEn: 'Yield',
  descriptionDe: 'Sie müssen dem Querverkehr oder dem Verkehr im Kreisverkehr Vorfahrt gewähren.',
  descriptionEn: 'You must yield to cross traffic or traffic already in the roundabout.',
  category: 'priority',
};

const signPedestrianCrossing: TrafficSign = {
  id: 'sign-crosswalk',
  code: 'Zeichen 350',
  titleDe: 'Fußgängerüberweg',

  titleEn: 'Pedestrian Crossing',
  descriptionDe: 'Markiert einen Zebrastreifen. Fußgänger haben hier Vorrang.',
  descriptionEn: 'Marks a zebra crossing. Pedestrians have priority here.',
  category: 'pedestrian',
};

const signPriorityRoadBending: TrafficSign = {
  id: 'sign-bending-priority',
  code: 'Zeichen 306',
  titleDe: 'Vorfahrtstraße mit Verlauf',

  titleEn: 'Priority Road with Course',
  descriptionDe: 'Die dicke Linie zeigt, wie die Vorfahrtstraße verläuft. Beim Verlassen oder Folgen gelten Blink- und Wartepflichten je nach Fahrtrichtung.',
  descriptionEn: 'The thick line shows how the priority road bends. Depending on your route, signaling and yielding duties apply.',
  category: 'priority',
};

const signMotorway: TrafficSign = {
  id: 'sign-motorway',
  code: 'Zeichen 330.1',
  titleDe: 'Autobahn',

  titleEn: 'Motorway',
  descriptionDe: 'Beginn einer Autobahn. Es gelten die Regeln für die Autobahn, inklusive Einfädeln und Mindestgeschwindigkeit des Fahrzeugs.',
  descriptionEn: 'Start of a motorway. Motorway rules apply, including merging and suitable vehicle speed.',
  category: 'motorway',
};

const signNoStopping: TrafficSign = {
  id: 'sign-no-stopping',
  code: 'Zeichen 283',
  titleDe: 'Absolutes Halteverbot',

  titleEn: 'No Stopping',
  descriptionDe: 'Hier dürfen Sie nicht halten. Wichtig bei Parkplatzsuche und Einparkaufgaben.',
  descriptionEn: 'You may not stop here. Important during parking searches and parking tasks.',
  category: 'parking',
};

const signParking: TrafficSign = {
  id: 'sign-parking',
  code: 'Zeichen 314',
  titleDe: 'Parken',

  titleEn: 'Parking',
  descriptionDe: 'Kennzeichnet erlaubte Parkflächen oder Parkzonen.',
  descriptionEn: 'Marks permitted parking areas or parking zones.',
  category: 'parking',
};

const roundaboutGuidedPoints: GuidedPoint[] = getGuidedPoints('roundabout', 'rb-gp');

// Roundabout Scenarios
const roundaboutScenarios: LessonScenario[] = [
  getScenario('rb-standard-entry'),
  getScenario('rb-no-signs'),
];


const zebraGuidedPoints: GuidedPoint[] = getGuidedPoints('zebra', 'zebra-gp');

// Zebra Crossing Scenarios
const zebraScenarios: LessonScenario[] = [
  getScenario('zebra-child-waiting'),
  getScenario('zebra-hidden-pedestrian'),
];


const rightTurnGuidedPoints: GuidedPoint[] = getGuidedPoints('rightTurn', 'rt-gp');

// Right Turn Scenarios
const rightTurnScenarios: LessonScenario[] = [
  getScenario('rt-bike-lane'),
  getScenario('rt-pedestrian-green'),
];


const parkingGuidedPoints: GuidedPoint[] = getGuidedPoints('parking', 'park-gp');

const parkingScenarios: LessonScenario[] = [
  getScenario('park-tight-space'),
  getScenario('park-no-stopping-zone'),
];



const highwayMergeScenarios: LessonScenario[] = [
  getScenario('hwy-strong-acceleration'),
  getScenario('hwy-missed-exit'),
];

const countryRoadScenarios: LessonScenario[] = [
  getScenario('country-forest-area'),
  getScenario('country-narrow-curve'),
];



const nightDrivingGuidedPoints: GuidedPoint[] = getGuidedPoints('nightDriving', 'night-gp');





// Quiz Questions - Based on official German driving exam content
// Quiz Questions - Lesson Specific
const basicsQuiz: QuizQuestion[] = [
  {
    id: 'quiz-seat',
    questionDe: 'Wie prüfen Sie die richtige Entfernung zum Lenkrad?',
    questionEn: 'How do you check the correct distance to the steering wheel?',
    options: [
      { id: 'a', textDe: 'Arme voll durchgestreckt', textEn: 'Arms fully extended' },
      { id: 'b', textDe: 'Handgelenke liegen bei gestreckten Armen oben auf dem Lenkradkranz auf', textEn: 'Wrists rest on top of the steering wheel rim with arms extended' },
      { id: 'c', textDe: 'Oberkörper so nah wie möglich am Lenkrad', textEn: 'Upper body as close as possible to the steering wheel' },
    ],
    correctOptionId: 'b',
    explanationDe: 'Die Handgelenke sollten bei gestreckten Armen oben auf dem Kranz liegen, damit die Arme beim Greifen in der 9-und-3-Uhr-Stellung leicht gebeugt sind.',
    explanationEn: 'Your wrists should rest on the top of the rim with arms extended, so your arms are slightly bent when gripping in the 9-and-3 o\'clock position.',
  }
];

const mirrorQuiz: QuizQuestion[] = [
  {
    id: 'quiz-sb',
    questionDe: 'Wann ist ein Schulterblick in Deutschland zwingend erforderlich?',
    questionEn: 'When is a shoulder check mandatory in Germany?',
    options: [
      { id: 'a', textDe: 'Nur beim Rückwärtsfahren', textEn: 'Only when reversing' },
      { id: 'b', textDe: 'Vor jedem Abbiegen, Fahrstreifenwechsel und beim Anfahren', textEn: 'Before every turn, lane change, and when moving off' },
      { id: 'c', textDe: 'Gar nicht, wenn die Spiegel groß sind', textEn: 'Not at all if the mirrors are large' },
    ],
    correctOptionId: 'b',
    explanationDe: 'Der Schulterblick sichert den "Toten Winkel" ab, den Spiegel nicht erfassen können.',
    explanationEn: 'The shoulder check secures the "blind spot" that mirrors cannot capture.',
  }
];

const techQuiz: QuizQuestion[] = [
  {
    id: 'quiz-oil',
    questionDe: 'Wie prüfen Sie den Motorölstand korrekt?',
    questionEn: 'How do you correctly check the engine oil level?',
    options: [
      { id: 'a', textDe: 'Bei laufendem Motor', textEn: 'With the engine running' },
      { id: 'b', textDe: 'Auf ebener Fläche, Motor aus, kurz warten, Peilstab nutzen', textEn: 'On level ground, engine off, wait briefly, use dipstick' },
      { id: 'c', textDe: 'Nur wenn die Warnleuchte brennt', textEn: 'Only when the warning light is on' },
    ],
    correctOptionId: 'b',
    explanationDe: 'Für eine genaue Messung muss das Öl in die Wanne zurücklaufen und das Fahrzeug gerade stehen.',
    explanationEn: 'For an accurate measurement, the oil must drain back into the pan and the vehicle must be level.',
  }
];

const maneuverQuiz: QuizQuestion[] = [
  {
    id: 'quiz-park-1',
    questionDe: 'Wie viele Korrekturzüge sind beim Einparken in der Prüfung erlaubt?',
    questionEn: 'How many correction moves are allowed during parking in the exam?',
    options: [
      { id: 'a', textDe: 'Maximal 2', textEn: 'Maximum 2' },
      { id: 'b', textDe: 'Beliebig viele', textEn: 'As many as you like' },
      { id: 'c', textDe: 'Keine', textEn: 'None' },
    ],
    correctOptionId: 'a',
    explanationDe: 'In der praktischen Prüfung sind pro Grundfahraufgabe maximal 2 Korrekturzüge zulässig.',
    explanationEn: 'In the practical exam, a maximum of 2 correction moves are permitted per basic maneuver.',
  }
];

const emergencyBrakeQuiz: QuizQuestion[] = [
  {
    id: 'quiz-eb-1',
    questionDe: 'Was ist bei der Gefahrenbremsung im Schaltwagen entscheidend?',
    questionEn: 'What is crucial during emergency braking in a manual car?',
    options: [
      { id: 'a', textDe: 'Sanft bremsen', textEn: 'Brake gently' },
      { id: 'b', textDe: 'Kupplung und Bremse schlagartig gleichzeitig voll durchtreten', textEn: 'Press clutch and brake abruptly and fully at the same time' },
      { id: 'c', textDe: 'Erst Schulterblick machen', textEn: 'First perform a shoulder check' },
    ],
    correctOptionId: 'b',
    explanationDe: 'Sofortige maximale Verzögerung ist das Ziel. Der Fahrlehrer sichert nach hinten ab.',
    explanationEn: 'Immediate maximum deceleration is the goal. The instructor secures the area behind.',
  }
];

const cityQuiz: QuizQuestion[] = [
  {
    id: 'quiz-rvl',
    questionDe: 'Wo gilt die Regel "Rechts vor Links"?',
    questionEn: 'Where does the "Right before Left" rule apply?',
    options: [
      { id: 'a', textDe: 'An allen Kreuzungen', textEn: 'At all intersections' },
      { id: 'b', textDe: 'An Kreuzungen ohne vorfahrtregelnde Verkehrszeichen oder Ampeln', textEn: 'At intersections without priority signs or traffic lights' },
      { id: 'c', textDe: 'Nur in Sackgassen', textEn: 'Only in dead-end streets' },
    ],
    correctOptionId: 'b',
    explanationDe: 'Rechts vor Links (§ 8 StVO) gilt immer dann, wenn keine andere Regelung (Schilder, Ampeln, Polizei) vorhanden ist.',
    explanationEn: 'Right before Left (§ 8 StVO) always applies when no other regulation (signs, lights, police) is present.',
  },
  {
    id: 'quiz-roundabout',
    questionDe: 'Wann müssen Sie im Kreisverkehr (Zeichen 215) blinken?',
    questionEn: 'When must you signal in a roundabout (Sign 215)?',
    options: [
      { id: 'a', textDe: 'Beim Einfahren', textEn: 'When entering' },
      { id: 'b', textDe: 'Beim Ausfahren', textEn: 'When exiting' },
      { id: 'c', textDe: 'Beides', textEn: 'Both' },
    ],
    correctOptionId: 'b',
    explanationDe: 'In Deutschland wird beim Einfahren in den Kreisel NICHT geblinkt. Erst beim Verlassen ist das Blinken nach rechts Pflicht.',
    explanationEn: 'In Germany, you do NOT signal when entering the roundabout. Signaling right is mandatory only when exiting.',
  }
];


// Vehicle Check Visuals
const vehicleCheckVisuals: TrafficSign[] = [
  getTrafficSign('visual-dipstick', { code: 'CHECK', category: 'vehicle-check' }),
  getTrafficSign('visual-tyre', { code: '1.6 MM', category: 'vehicle-check' }),
  getTrafficSign('visual-dashboard', { code: 'ROT / GELB', category: 'vehicle-check' }),
  getTrafficSign('visual-lights', { code: 'LIGHTS', category: 'vehicle-check' }),
];

const vehicleCheckScenarios: LessonScenario[] = [
  getScenario('vehicle-check-oil-dipstick', 'vehicleCheckScenarios'),
  getScenario('vehicle-check-tyres', 'vehicleCheckScenarios'),
  getScenario('vehicle-check-dashboard', 'vehicleCheckScenarios'),
  getScenario('vehicle-check-lights', 'vehicleCheckScenarios'),
  getScenario('vehicle-check-safety-equipment', 'vehicleCheckScenarios'),
];

const vehicleCheckGuidedPoints: GuidedPoint[] = getGuidedPoints('vehicleCheck', 'vehicle-check-gp');

// Lessons Data
const basicsLessons: Lesson[] = [
  {
    id: 'basics-0',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-0'),
    completed: false,
    licenseType: 'both',
    learningPath: 'umschreibung',
    isPremium: true,
    glossary: [...germanRoadGlossary],
    examinerCommands: [...examinerCommandsCore],
    quiz: cityQuiz,
  },
  {
    id: 'basics-1',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-1'),
    completed: false,
    licenseType: 'both',
    isPremium: false,
    quiz: basicsQuiz,
  },
  {
    id: 'basics-1b',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-1b'),
    completed: false,
    licenseType: 'both',
    isPremium: false,
    quiz: mirrorQuiz,
  },
  {
    id: 'basics-1a',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-1a'),
    completed: false,
    licenseType: 'both',
    isPremium: true,
    isInteractive: true,
    scenarios: vehicleCheckScenarios,
    guidedPoints: vehicleCheckGuidedPoints,
    trafficSigns: vehicleCheckVisuals,
    quiz: techQuiz,
  },
  {
    id: 'basics-2',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-2'),
    completed: false,
    manualOnly: true,
    licenseType: 'manual',
    isPremium: false,
    quiz: basicsQuiz,
  },
  {
    id: 'basics-2a',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-2a'),
    completed: false,
    automaticOnly: true,
    licenseType: 'automatic',
    isPremium: false,
    quiz: basicsQuiz,
  },
  {
    id: 'basics-3',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-3'),
    completed: false,
    manualOnly: true,
    licenseType: 'manual',
    isPremium: true,
    quiz: basicsQuiz,
  },
  {
    id: 'basics-3a',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-3a'),
    completed: false,
    automaticOnly: true,
    licenseType: 'automatic',
    isPremium: true,
    quiz: basicsQuiz,
  },
  {
    id: 'basics-4',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-4'),
    completed: false,
    licenseType: 'both',
    isPremium: true,
    quiz: basicsQuiz,
  },
  {
    id: 'basics-5',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-5'),
    completed: false,
    manualOnly: true,
    licenseType: 'manual',
    isPremium: true,
  },
  {
    id: 'basics-5a',
    chapterId: 'chapter-1',
    ...getLessonStrings('basics-5a'),
    completed: false,
    automaticOnly: true,
    licenseType: 'automatic',
    isPremium: true,
  },
];

const maneuverLessons: Lesson[] = [
  {
    id: 'maneuver-1',
    chapterId: 'chapter-2',
    ...getLessonStrings('maneuver-1'),
    completed: false,
    isPremium: false,
    isInteractive: true,
    steps: parallelParkingSteps,
    guidedPoints: parkingGuidedPoints,
    scenarios: parkingScenarios,
    trafficSigns: [signParking, signNoStopping],
    quiz: maneuverQuiz,
  },
  {
    id: 'maneuver-2',
    chapterId: 'chapter-2',
    ...getLessonStrings('maneuver-2'),
    completed: false,
    isPremium: true,
    steps: reverseParkingSteps,
    guidedPoints: parkingGuidedPoints,
    scenarios: parkingScenarios,
    trafficSigns: [signParking, signNoStopping],
    quiz: maneuverQuiz,
  },
  {
    id: 'maneuver-3',
    chapterId: 'chapter-2',
    ...getLessonStrings('maneuver-3'),
    completed: false,
    isPremium: true,
    steps: threePointTurnSteps,
    quiz: maneuverQuiz,
  },
  {
    id: 'maneuver-4',
    chapterId: 'chapter-2',
    ...getLessonStrings('maneuver-4'),
    completed: false,
    manualOnly: true,
    licenseType: 'manual',
    isPremium: true,
    isInteractive: true,
    steps: emergencyBrakingStepsManual,
    quiz: emergencyBrakeQuiz,
  },
  {
    id: 'maneuver-4a',
    chapterId: 'chapter-2',
    ...getLessonStrings('maneuver-4a'),
    completed: false,
    automaticOnly: true,
    licenseType: 'automatic',
    isPremium: true,
    isInteractive: true,
    steps: emergencyBrakingStepsAutomatic,
    quiz: emergencyBrakeQuiz,
  },
];

const cityLessons: Lesson[] = [
  {
    id: 'city-1',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-1'),
    completed: false,
    isPremium: false,
    isInteractive: true,
    guidedPoints: rightBeforeLeftGuidedPoints,
    scenarios: [
      getScenario('rvl-hidden-right'),
    ],
    quiz: cityQuiz,
  },
  {
    id: 'city-2',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-2'),
    completed: false,
    isPremium: false,
    guidedPoints: leftTurnGuidedPoints,
    scenarios: leftTurnScenarios,
    trafficSigns: [signPriorityRoadBending, signGreenArrow, signGreenArrowSignal],
    quiz: cityQuiz,
  },
  {
    id: 'city-3',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-3'),
    completed: false,
    isPremium: true,
    isInteractive: true,
    guidedPoints: roundaboutGuidedPoints,
    scenarios: roundaboutScenarios,
    trafficSigns: [signRoundabout, signYield],
    quiz: cityQuiz,
  },
  {
    id: 'city-4',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-4'),
    completed: false,
    isPremium: true,
    guidedPoints: zebraGuidedPoints,
    scenarios: zebraScenarios,
    trafficSigns: [signPedestrianCrossing],
    quiz: cityQuiz,
  },
  {
    id: 'city-5',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-5'),
    completed: false,
    isPremium: true,
    isInteractive: true,
    guidedPoints: rightTurnGuidedPoints,
    scenarios: rightTurnScenarios,
    trafficSigns: [signPedestrianCrossing],
    quiz: mirrorQuiz,
  },
  {
    id: 'city-5a',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-5a'),
    completed: false,
    learningPath: 'both',
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'city-5b',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-5b'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'city-5c',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-5c'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'city-6',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-6'),
    completed: false,
    isPremium: true,
    isInteractive: true,
    guidedPoints: laneChangeGuidedPoints,
    quiz: mirrorQuiz,
  },
  {
    id: 'city-7',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-7'),
    completed: false,
    isPremium: true,
  },
  {
    id: 'city-8',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-8'),
    completed: false,
    isPremium: true,
  },
  {
    id: 'city-9',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-9'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'city-10',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-10'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'city-11',
    chapterId: 'chapter-3',
    ...getLessonStrings('city-11'),
    completed: false,
    isPremium: true,
  },
];

const specialLessons: Lesson[] = [
  {
    id: 'special-1',
    chapterId: 'chapter-4',
    ...getLessonStrings('special-1'),
    scenarios: countryRoadScenarios,
    quiz: cityQuiz,
  },
  {
    id: 'special-2',
    chapterId: 'chapter-4',
    ...getLessonStrings('special-2'),
    completed: false,
    isPremium: true,
    trafficSigns: [signMotorway],
    scenarios: highwayMergeScenarios,
    quiz: cityQuiz,
  },
  {
    id: 'special-2a',
    chapterId: 'chapter-4',
    ...getLessonStrings('special-2a'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'special-3',
    chapterId: 'chapter-4',
    ...getLessonStrings('special-3'),
    completed: false,
    isPremium: true,
    guidedPoints: nightDrivingGuidedPoints,
    quiz: cityQuiz,
  },
  {
    id: 'special-4',
    chapterId: 'chapter-4',
    ...getLessonStrings('special-4'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
];

const examLessons: Lesson[] = [
  {
    id: 'exam-1',
    chapterId: 'chapter-5',
    ...getLessonStrings('exam-1'),
    completed: false,
    isPremium: true,
    quiz: basicsQuiz,
  },
  {
    id: 'exam-1a',
    chapterId: 'chapter-5',
    ...getLessonStrings('exam-1a'),
    completed: false,
    isPremium: true,
    quiz: mirrorQuiz,
  },
  {
    id: 'exam-2',
    chapterId: 'chapter-5',
    ...getLessonStrings('exam-2'),
    completed: false,
    isPremium: true,
    quiz: basicsQuiz,
  },
  {
    id: 'exam-2a',
    chapterId: 'chapter-5',
    ...getLessonStrings('exam-2a'),
    completed: false,
    isPremium: true,
    quiz: cityQuiz,
  },
  {
    id: 'exam-3',
    chapterId: 'chapter-5',
    ...getLessonStrings('exam-3'),
    completed: false,
    isPremium: true,
    quiz: basicsQuiz,
  },
  {
    id: 'exam-sim',
    chapterId: 'chapter-5',
    ...getLessonStrings('exam-sim'),
    completed: false,
    isPremium: true,
    isInteractive: true,
  },
];

// Chapters Data
export const chapters: Chapter[] = [
  {
    id: 'chapter-1',
    titleDe: 'Grundstufe',
    titleEn: 'Basics',
    descriptionDe: 'Deutschland-Schnellstart, Schulterblick, Fahrzeugcheck und – je nach Pfad – Fahrzeugbedienung',
    descriptionEn: 'Germany quick start, shoulder checks, vehicle check, and—depending on the path—vehicle operation',
    icon: 'Car',
    lessons: basicsLessons,
    progress: 0,
  },
  {
    id: 'chapter-2',
    titleDe: 'Grundfahraufgaben',
    titleEn: 'Basic Maneuvers',
    descriptionDe: 'Einparken, Wenden und Gefahrenbremsung',
    descriptionEn: 'Parking, turning and emergency braking',
    icon: 'ParkingSquare',
    lessons: maneuverLessons,
    progress: 0,
  },
  {
    id: 'chapter-3',
    titleDe: 'Aufbaustufe',
    titleEn: 'City Driving',
    descriptionDe: 'Vorfahrtsregeln, Ampeln, Kreisverkehr, Fußgänger',
    descriptionEn: 'Right-of-way, traffic lights, roundabouts, pedestrians',
    icon: 'Building2',
    lessons: cityLessons,
    progress: 0,
  },
  {
    id: 'chapter-4',
    titleDe: 'Sonderfahrten',
    titleEn: 'Special Drives',
    descriptionDe: 'Überland, Autobahn und Nachtfahrten',
    descriptionEn: 'Country roads, highway and night driving',
    icon: 'Route',
    lessons: specialLessons,
    progress: 0,
  },
  {
    id: 'chapter-5',
    titleDe: 'Reifestufe & Prüfung',
    titleEn: 'Exam Preparation',
    descriptionDe: 'Umweltbewusstes Fahren und Prüfungsvorbereitung',
    descriptionEn: 'Eco-driving and exam preparation',
    icon: 'Trophy',
    lessons: examLessons,
    progress: 0,
  },
];

export const getAllLessons = (): Lesson[] => {
  return chapters.flatMap((chapter) => chapter.lessons);
};

export const getLessonById = (lessonId: string): Lesson | undefined => {
  return getAllLessons().find((lesson) => lesson.id === lessonId);
};

export const getChapterById = (chapterId: string): Chapter | undefined => {
  return chapters.find((chapter) => chapter.id === chapterId);
};

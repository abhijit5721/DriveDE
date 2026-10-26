/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Exam situations for the Prüfungssimulation (6 Oct): the learner reads a traffic
 * situation, hears the examiner's instruction and explains in their own words (typed or
 * spoken) what they would do. The answer is checked on the device against the key points
 * below, no server and no AI, so it costs nothing to run and the feedback is the same
 * every time. Patterns are written for normalized text (lower case, ä→ae, ö→oe, ü→ue,
 * ß→ss, punctuation removed), see utils/scenarioGrader.ts.
 *
 * Every key point and model answer follows the cited StVO paragraph. Change the law text
 * only together with the paragraph reference.
 */

export interface Bilingual { de: string; en: string }

export type CompetenceArea = 'observation' | 'position' | 'speed' | 'communication' | 'handling';

export interface KeyPoint {
  id: string;
  label: Bilingual;
  /** The Fahrkompetenzbereich the examiner would file this under (elektronisches Prüfprotokoll). */
  area: CompetenceArea;
  /** Missing this is a severe mistake by the catalogue's hazard logic (can end the test). */
  severe?: boolean;
  /** Regex sources tested against the normalized answer; any match covers the point. */
  patterns: string[];
  /** The point itself is a "do not" (no indicator when entering): a negation is expected. */
  allowNegation?: boolean;
}

export interface MiniTest {
  question: Bilingual;
  options: Bilingual[];
  correct: number;
  explanation: Bilingual;
}

export interface ExamScenario {
  id: string;
  free: boolean;
  title: Bilingual;
  situation: Bilingual;
  /** The examiner speaks German in the exam; the English line is the translation. */
  examiner: Bilingual;
  questions: Bilingual[];
  keyPoints: KeyPoint[];
  /** Phrases that point to a wrong or risky answer (checked with the same negation rule). */
  contradictions: { patterns: string[]; hint: Bilingual; area?: CompetenceArea; severe?: boolean }[];
  /** Level 1 (step mode): the right sequence as short cards, in order. */
  steps: Bilingual[];
  /** Tempting wrong cards mixed into the step mode, each with the reason it is wrong. */
  mistakes: { text: Bilingual; why: Bilingual; area?: CompetenceArea; severe?: boolean }[];
  modelAnswer: Bilingual;
  law: Bilingual;
  miniTest: MiniTest;
}

const SLOW = ['langsam', 'brems', 'reduz', 'verzoeger', 'vom gas', 'maessig', 'tempo raus', 'slow', 'brak', 'reduc', 'decelerat', 'off the gas', 'ease off', 'lower (my )?speed'];
// German separable verbs split: "halte ich vor dem Zebrastreifen an"
const STOP_WAIT = ['anhalt', 'halte\\w* (\\w+ ){0,5}an\\b', 'stoppe', 'stehen bleib', 'bleibe\\w* (\\w+ ){0,3}stehen', 'warte', '\\bstop', '\\bwait', 'halt\\b'];
const LOOK_LEFT = ['(nach )?links (schau|blick|guck|achte)', '(schau|blick|guck)\\w* (\\w+ ){0,3}(nach )?links', 'look(ing)? (to the )?left', 'check(ing)? (the )?left'];
const LOOK_RIGHT = ['(nach )?rechts (schau|blick|guck|achte)', '(schau|blick|guck)\\w* (\\w+ ){0,3}(nach )?rechts', 'look(ing)? (to the )?right', 'check(ing)? (the )?right'];
const SHOULDER = ['schulterblick', 'ueber die schulter', 'tote?n? winkel', 'shoulder', 'blind spot'];
const MIRROR = ['spiegel', 'mirror'];
const LOOK_BOTH = ['links und rechts', 'rechts und links', 'beide seiten', 'beide richtungen', 'nach beiden', 'left and right', 'right and left', 'both (sides|directions|ways)', 'in both'];

export const EXAM_SCENARIOS: ExamScenario[] = [
  {
    id: 'zebrastreifen',
    free: true,
    title: { de: 'Zebrastreifen', en: 'Zebra crossing' },
    situation: {
      de: 'Du fährst in einer Tempo-30-Zone. Vor dir liegt ein Zebrastreifen. Eine Fußgängerin steht am Rand des Überwegs und schaut auf die Straße.',
      en: 'You are driving in a 30 km/h zone. Ahead is a zebra crossing. A pedestrian is standing at the edge of the crossing, looking at the road.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Worauf achtest du?', en: 'What do you check?' },
      { de: 'Wie passt du dein Tempo an?', en: 'How do you adjust your speed?' },
      { de: 'Wann und wo hältst du an?', en: 'When and where do you stop?' },
      { de: 'Was prüfst du, bevor du weiterfährst?', en: 'What do you check before driving on?' },
    ],
    keyPoints: [
      { id: 'observe', area: 'observation', label: { de: 'Früh beobachten: Gehwege links und rechts am Überweg', en: 'Observe early: the pavements on both sides of the crossing' }, patterns: ['beobacht', 'schaue?', 'blick', 'guck', 'achte auf', 'gehweg', '\\blook', '\\bcheck', 'observ', '\\bwatch', '\\bscan', 'pavement', 'sidewalk'] },
      { id: 'speed', area: 'speed', label: { de: 'Mit mäßiger Geschwindigkeit heranfahren, bremsbereit', en: 'Approach at moderate speed, ready to brake' }, patterns: SLOW },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Fußgänger, die erkennbar queren wollen, gehen lassen und anhalten', en: 'Stop and let pedestrians who clearly want to cross go' }, patterns: [...STOP_WAIT, 'vortritt', 'vorrang', 'durchlassen', 'gehen lassen', 'lasse\\w* (\\w+ ){0,2}gehen', 'rueber lassen', 'give way', 'let (her|him|them|the pedestrian)', 'priority'] },
      { id: 'position', area: 'position', label: { de: 'Vor dem Zebrastreifen halten, nicht darauf', en: 'Stop before the crossing, not on it' }, patterns: ['vor dem (zebrastreifen|ueberweg|streifen)', 'vor der haltelinie', '(before|in front of) the (zebra|crossing|stripes)'] },
      { id: 'wait', area: 'observation', label: { de: 'Warten, bis der Überweg frei ist', en: 'Wait until the crossing is clear' }, patterns: ['bis .{0,40}(drueben|rueber|ueberquert|vorbei|frei|andere seite|gegangen)', '(erst )?wenn .{0,40}(frei|drueben|ueberquert|vorbei)', 'until .{0,40}(crossed|across|clear|other side|passed|gone)', 'when .{0,40}(clear|crossed|across|free)'] },
      { id: 'recheck', area: 'observation', label: { de: 'Vor dem Anfahren noch einmal umschauen', en: 'Check again before moving off' }, patterns: ['(wieder|erneut|nochmal|noch einmal) .{0,20}(beobacht|schau|pruef|kontroll|umschau|blick)', '(schau|blick|pruef|kontroll|beobacht)\\w* .{0,15}(wieder|erneut|nochmal|noch einmal)', 'bevor ich .{0,20}(los|weiter|anfahr)', '(check|look) again', 'before (driving|moving|pulling|going) (off|on|away)', 'before i (continue|drive|go|move)'] },
    ],
    contradictions: [
      { patterns: ['wink', 'handzeichen', '\\bwave', 'gesture'], hint: { de: 'Fußgänger nicht herüberwinken: Du kannst nicht sehen, ob von der anderen Seite jemand kommt.', en: 'Do not wave pedestrians across: you cannot see whether someone is coming from the other side.' } },
      { patterns: ['hupe', 'hupen', 'honk', 'horn'], hint: { de: 'Hupen ist hier falsch: Fußgänger haben Vorrang.', en: 'Honking is wrong here: pedestrians have priority.' } },
      { patterns: ['ueberhol', 'overtak'], hint: { de: 'Vor einem Zebrastreifen darfst du nicht überholen.', en: 'Overtaking at a zebra crossing is not allowed.' } },
    ],
    steps: [
      { de: 'Früh beide Gehwege am Überweg beobachten', en: 'Watch both pavements at the crossing early' },
      { de: 'Tempo reduzieren, bremsbereit sein', en: 'Slow down, be ready to brake' },
      { de: 'Vor dem Zebrastreifen anhalten', en: 'Stop before the zebra crossing' },
      { de: 'Warten, bis der Überweg frei ist', en: 'Wait until the crossing is clear' },
      { de: 'Erneut umschauen und weiterfahren', en: 'Check again and drive on' },
    ],
    mistakes: [
      { area: 'communication', text: { de: 'Die Fußgängerin herüberwinken', en: 'Wave the pedestrian across' }, why: { de: 'Du kannst nicht sehen, ob von der anderen Seite jemand kommt.', en: 'You cannot see whether someone is coming from the other side.' } },
      { area: 'communication', severe: true, text: { de: 'Kurz hupen, damit sie wartet', en: 'Honk briefly so she waits' }, why: { de: 'Fußgänger, die queren wollen, haben am Zebrastreifen Vorrang.', en: 'Pedestrians who want to cross have priority at a zebra crossing.' } },
    ],
    modelAnswer: {
      de: 'Ich beobachte früh beide Gehwege am Zebrastreifen und fahre mit mäßiger Geschwindigkeit heran, bremsbereit. Da die Fußgängerin erkennbar queren will, halte ich vor dem Zebrastreifen an und lasse sie gehen. Ich winke sie nicht herüber. Erst wenn der Überweg frei ist, schaue ich mich noch einmal um und fahre weiter.',
      en: 'I watch both pavements at the crossing early and approach at moderate speed, ready to brake. Because the pedestrian clearly wants to cross, I stop before the crossing and let her go. I do not wave her across. Only when the crossing is clear do I check again and drive on.',
    },
    law: { de: '§ 26 StVO: An Fußgängerüberwegen haben Fußgänger, die ihn erkennbar benutzen wollen, Vorrang. Heranfahren nur mit mäßiger Geschwindigkeit, Überholen verboten.', en: '§ 26 StVO: at zebra crossings, pedestrians who clearly want to use them have priority. Approach only at moderate speed; overtaking is prohibited.' },
    miniTest: {
      question: { de: 'Du fährst mit 25 km/h auf den Zebrastreifen zu. Ein Fußgänger steht einen Meter vom Überweg entfernt auf dem Gehweg und schaut auf die Straße. Was tust du?', en: 'You approach the zebra crossing at 25 km/h. A pedestrian stands on the pavement one metre from the crossing, looking at the road. What do you do?' },
      options: [
        { de: 'Mit 25 km/h weiterfahren, er steht ja noch auf dem Gehweg', en: 'Continue at 25 km/h, he is still on the pavement' },
        { de: 'Langsamer werden und anhaltebereit sein', en: 'Slow down and be ready to stop' },
        { de: 'Bei jedem Zebrastreifen sofort anhalten', en: 'Stop immediately at every zebra crossing' },
      ],
      correct: 1,
      explanation: { de: 'Er könnte queren wollen, also langsamer werden und bereit sein anzuhalten. Will er erkennbar queren, hältst du an. Ohne querende Fußgänger musst du nicht anhalten.', en: 'He might want to cross, so slow down and be ready to stop. If he clearly wants to cross, you stop. With nobody crossing you do not have to stop.' },
    },
  },
  {
    id: 'rechts-vor-links',
    free: true,
    title: { de: 'Rechts vor links', en: 'Right before left' },
    situation: {
      de: 'Wohngebiet, Tempo 30. Die nächste Kreuzung hat keine Schilder, keine Ampel und keine Markierung. Von rechts nähert sich ein Auto.',
      en: 'Residential area, 30 km/h. The next junction has no signs, no traffic lights and no markings. A car is approaching from the right.',
    },
    examiner: { de: 'An der nächsten Kreuzung bitte geradeaus.', en: 'Go straight on at the next junction, please.' },
    questions: [
      { de: 'Welche Vorfahrtsregel gilt hier?', en: 'Which right-of-way rule applies?' },
      { de: 'Wie fährst du an die Kreuzung heran?', en: 'How do you approach the junction?' },
      { de: 'In welche Richtung schaust du zuerst?', en: 'Which way do you look first?' },
      { de: 'Wer fährt zuerst?', en: 'Who goes first?' },
    ],
    keyPoints: [
      // "keine Schilder" / "no signs" is itself a negation, so negations are expected here
      { id: 'rule', area: 'observation', label: { de: 'Erkennen: keine Schilder, also rechts vor links', en: 'Recognise: no signs, so right before left' }, allowNegation: true, patterns: ['rechts vor links', 'right before left', 'keine (schilder|zeichen|vorfahrtsschilder)', 'no (signs|markings)', 'unmarked', 'ungeregelt'] },
      { id: 'speed', area: 'speed', label: { de: 'Langsam heranfahren, bremsbereit', en: 'Approach slowly, ready to brake' }, patterns: SLOW },
      { id: 'right', area: 'observation', label: { de: 'Zuerst nach rechts schauen', en: 'Look right first' }, patterns: [...LOOK_RIGHT, '(zuerst|erst) .{0,15}rechts', 'right first'] },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Dem Auto von rechts Vorfahrt lassen', en: 'Give way to the car from the right' }, patterns: ['von rechts .{0,40}(vorfahrt|vorrang|lass|zuerst|vor)', '(lasse|warte) .{0,40}(rechts)', 'vorfahrt (gewaehr|lass)', 'give way', '\\byield', '(car|vehicle|traffic) (from|on) the right .{0,40}(first|priority|go|right of way)', 'let .{0,30}right'] },
      { id: 'left', area: 'observation', label: { de: 'Auch nach links schauen', en: 'Look left as well' }, patterns: [...LOOK_LEFT, 'left side'] },
      { id: 'others', area: 'observation', label: { de: 'Auf Radfahrer und Fußgänger achten', en: 'Watch for cyclists and pedestrians' }, patterns: ['radfahr', 'fahrrad', 'fussgaeng', 'cyclist', 'bike', 'pedestrian'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'fahre (einfach )?durch', 'drive (straight )?through'], hint: { de: 'Das Auto von rechts hat Vorfahrt, nicht du.', en: 'The car from the right has priority, not you.' } },
    ],
    steps: [
      { de: 'Erkennen: keine Schilder, also rechts vor links', en: 'Recognise: no signs, so right before left' },
      { de: 'Langsam und bremsbereit heranfahren', en: 'Approach slowly, ready to brake' },
      { de: 'Zuerst nach rechts schauen', en: 'Look right first' },
      { de: 'Dem Auto von rechts Vorfahrt lassen', en: 'Give way to the car from the right' },
      { de: 'Nach links schauen, kurz vor dem Einfahren noch einmal nach rechts', en: 'Look left, then right again just before entering' },
      { de: 'Geradeaus weiterfahren', en: 'Go straight on' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Zügig durchfahren, die eigene Straße ist breiter', en: 'Drive straight through, your road is wider' }, why: { de: 'Ohne Schilder gibt die Breite der Straße keine Vorfahrt.', en: 'Without signs, a wider road gives no priority.' } },
      { area: 'observation', severe: true, text: { de: 'Nur nach links schauen', en: 'Look only to the left' }, why: { de: 'Der Verkehr von rechts hat Vorfahrt, dort schaust du zuerst.', en: 'Traffic from the right has priority, so you look there first.' } },
    ],
    modelAnswer: {
      de: 'Die Kreuzung hat keine Schilder, also gilt rechts vor links. Ich fahre langsam und bremsbereit heran, schaue zuerst nach rechts und lasse dem Auto von rechts die Vorfahrt. Ich schaue auch nach links und achte auf Radfahrer und Fußgänger. Kurz vor dem Einfahren schaue ich noch einmal nach rechts, dann fahre ich geradeaus weiter.',
      en: 'The junction has no signs, so right before left applies. I approach slowly and ready to brake, look right first and give way to the car from the right. I also look left and watch for cyclists and pedestrians. Just before entering I look right once more, then I go straight on.',
    },
    law: { de: '§ 8 Abs. 1 StVO: An Kreuzungen und Einmündungen hat Vorfahrt, wer von rechts kommt, sofern nichts anderes geregelt ist.', en: '§ 8 (1) StVO: at junctions, whoever comes from the right has priority unless signs or lights say otherwise.' },
    miniTest: {
      question: { de: 'An einer ungeregelten Kreuzung kommt ein Auto von links, von rechts kommt niemand. Wer fährt zuerst?', en: 'At an unmarked junction a car comes from the left, nobody from the right. Who goes first?' },
      options: [
        { de: 'Das Auto von links', en: 'The car from the left' },
        { de: 'Du, aber vorsichtig und bremsbereit', en: 'You, but carefully and ready to brake' },
        { de: 'Wer schneller ist', en: 'Whoever is faster' },
      ],
      correct: 1,
      explanation: { de: 'Du kommst für das Auto von links von rechts, also hast du Vorfahrt. Fahr trotzdem bremsbereit, falls der andere sie dir nicht lässt.', en: 'For the car on the left you come from the right, so you have priority. Still drive ready to brake in case the other driver does not give way.' },
    },
  },
  {
    id: 'kreisverkehr',
    free: true,
    title: { de: 'Kreisverkehr', en: 'Roundabout' },
    situation: {
      de: 'Du näherst dich einem Kreisverkehr mit den Schildern „Kreisverkehr“ und „Vorfahrt gewähren“. Im Kreis fährt bereits ein Auto.',
      en: 'You are approaching a roundabout with the signs "roundabout" and "give way". A car is already driving in the roundabout.',
    },
    examiner: { de: 'Im Kreisverkehr bitte die zweite Ausfahrt.', en: 'Take the second exit at the roundabout, please.' },
    questions: [
      { de: 'Wer hat Vorfahrt?', en: 'Who has priority?' },
      { de: 'Blinkst du beim Einfahren?', en: 'Do you indicate when entering?' },
      { de: 'Was tust du vor der Ausfahrt?', en: 'What do you do before the exit?' },
    ],
    keyPoints: [
      { id: 'speed', area: 'speed', label: { de: 'Langsam heranfahren, bremsbereit', en: 'Approach slowly, ready to brake' }, patterns: SLOW },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Dem Verkehr im Kreis Vorfahrt lassen', en: 'Give way to traffic in the roundabout' }, patterns: ['(im kreis|im kreisverkehr|kreisend)\\w* .{0,40}(vorfahrt|vorrang|zuerst|lass)', 'vorfahrt (gewaehr|lass)', 'warte .{0,30}(kreis|auto)', 'traffic (in|on|inside) the roundabout .{0,40}(priority|first|right of way)', 'give way', '\\byield'] },
      { id: 'left', area: 'observation', label: { de: 'Beim Einfahren nach links schauen', en: 'Look left when entering' }, patterns: [...LOOK_LEFT, 'from the left'] },
      { id: 'noSignal', area: 'communication', label: { de: 'Beim Einfahren nicht blinken', en: 'Do not indicate when entering' }, allowNegation: true, patterns: ['(nicht|kein|ohne) (zu )?blink', 'blink\\w* (ich |man )?nicht', 'blink\\w* .{0,25}einfahr\\w* .{0,10}nicht', 'einfahr\\w* .{0,25}(nicht|kein|ohne) (zu )?blink', '(do not|dont|don t|not|no|never) (indicat|signal|blink)', 'without (indicating|signalling|signaling)', 'no indicator'] },
      { id: 'exitSignal', area: 'communication', label: { de: 'Vor der Ausfahrt rechts blinken', en: 'Indicate right before the exit' }, patterns: ['rechts blink', 'blinker (nach )?rechts', 'blinke .{0,20}rechts', 'indicat\\w* (to the )?right', 'signal\\w* (to the )?right', 'right indicator'] },
      { id: 'exitWatch', area: 'observation', label: { de: 'An der Ausfahrt auf Radfahrer und Fußgänger achten', en: 'Watch for cyclists and pedestrians at the exit' }, patterns: ['radfahr', 'fahrrad', 'fussgaeng', 'cyclist', 'bike', 'pedestrian', ...SHOULDER] },
    ],
    contradictions: [
      { patterns: ['(beim|vor dem) einfahr\\w* .{0,15}(links |rechts )?blink', 'blinke? (beim|vor dem) einfahr', 'indicate (left |right )?(when|before|while) entering', 'signal (left |right )?(when|before|while) entering'], hint: { de: 'Beim Einfahren in den Kreisverkehr ist Blinken nicht erlaubt.', en: 'Indicating when entering the roundabout is not allowed.' } },
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)'], hint: { de: 'Mit „Vorfahrt gewähren“ hat der Verkehr im Kreis Vorfahrt.', en: 'With the give-way sign, traffic in the roundabout has priority.' } },
    ],
    steps: [
      { de: 'Langsam und bremsbereit heranfahren', en: 'Approach slowly, ready to brake' },
      { de: 'Nach links schauen: der Verkehr im Kreis hat Vorfahrt', en: 'Look left: traffic in the roundabout has priority' },
      { de: 'Ohne Blinker einfahren', en: 'Enter without indicating' },
      { de: 'Vor der Ausfahrt rechts blinken', en: 'Indicate right before the exit' },
      { de: 'Schulterblick rechts, auf Radfahrer und Fußgänger achten', en: 'Shoulder check right, watch for cyclists and pedestrians' },
      { de: 'Ausfahren', en: 'Leave the roundabout' },
    ],
    mistakes: [
      { area: 'communication', text: { de: 'Beim Einfahren links blinken', en: 'Indicate left when entering' }, why: { de: 'Blinken beim Einfahren in den Kreisverkehr ist nicht erlaubt.', en: 'Indicating when entering a roundabout is not allowed.' } },
      { area: 'speed', severe: true, text: { de: 'Vor dem Auto im Kreis einfahren', en: 'Enter in front of the car in the roundabout' }, why: { de: 'Mit „Vorfahrt gewähren“ hat der Verkehr im Kreis Vorrang.', en: 'With the give-way sign, traffic in the roundabout has priority.' } },
    ],
    modelAnswer: {
      de: 'Ich fahre langsam und bremsbereit heran. Das Schild „Vorfahrt gewähren“ zeigt: Der Verkehr im Kreis hat Vorfahrt, also schaue ich nach links und lasse das Auto im Kreis fahren. Beim Einfahren blinke ich nicht. Vor der zweiten Ausfahrt blinke ich rechts, mache einen Schulterblick und achte auf Radfahrer und Fußgänger an der Ausfahrt.',
      en: 'I approach slowly and ready to brake. The give-way sign shows that traffic in the roundabout has priority, so I look left and let the car in the roundabout go. I do not indicate when entering. Before the second exit I indicate right, do a shoulder check and watch for cyclists and pedestrians at the exit.',
    },
    law: { de: '§ 9a Abs. 1 StVO: Mit den Zeichen 215 und 205 hat der Verkehr im Kreis Vorfahrt, beim Einfahren ist Blinken unzulässig. Das Verlassen ist Abbiegen (§ 9 Abs. 1 StVO) und wird rechtzeitig rechts angezeigt.', en: '§ 9a (1) StVO: with signs 215 and 205 the traffic in the roundabout has priority, and indicating when entering is not allowed. Leaving is a turn (§ 9 (1) StVO) and is indicated right in good time.' },
    miniTest: {
      question: { de: 'Wie blinkst du im Kreisverkehr?', en: 'How do you indicate at a roundabout?' },
      options: [
        { de: 'Links beim Einfahren', en: 'Left when entering' },
        { de: 'Rechts beim Einfahren und bei der Ausfahrt', en: 'Right when entering and at the exit' },
        { de: 'Nicht beim Einfahren, rechts vor der Ausfahrt', en: 'Not when entering, right before the exit' },
      ],
      correct: 2,
      explanation: { de: 'Beim Einfahren ist Blinken unzulässig, das Verlassen zeigst du rechtzeitig rechts an.', en: 'Indicating when entering is not allowed; you indicate right in good time before leaving.' },
    },
  },
  {
    id: 'spurwechsel',
    free: false,
    title: { de: 'Spurwechsel nach links', en: 'Changing lanes to the left' },
    situation: {
      de: 'Stadtstraße mit zwei Fahrstreifen in deine Richtung. Du fährst rechts, weiter vorne musst du links abbiegen. Hinter dir links fahren Autos.',
      en: 'City road with two lanes in your direction. You are in the right lane and need to turn left further ahead. Cars are driving behind you in the left lane.',
    },
    examiner: { de: 'An der übernächsten Kreuzung bitte links abbiegen.', en: 'Turn left at the second junction, please.' },
    questions: [
      { de: 'Was machst du vor dem Spurwechsel, in welcher Reihenfolge?', en: 'What do you do before changing lanes, in which order?' },
      { de: 'Wann wechselst du?', en: 'When do you change?' },
    ],
    keyPoints: [
      { id: 'inner', area: 'observation', label: { de: 'Innenspiegel', en: 'Interior mirror' }, patterns: ['innenspiegel', 'rueckspiegel', 'interior mirror', 'rear ?view mirror', 'inside mirror'] },
      { id: 'outer', area: 'observation', label: { de: 'Linker Außenspiegel', en: 'Left side mirror' }, patterns: ['aussenspiegel', 'seitenspiegel', 'linke\\w* spiegel', 'side mirror', 'wing mirror', 'left mirror', 'door mirror'] },
      { id: 'signal', area: 'communication', label: { de: 'Rechtzeitig links blinken', en: 'Indicate left in good time' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'shoulder', area: 'observation', severe: true, label: { de: 'Schulterblick nach links', en: 'Shoulder check to the left' }, patterns: SHOULDER },
      { id: 'gap', area: 'position', severe: true, label: { de: 'Nur wechseln, wenn eine ausreichende Lücke da ist', en: 'Change only when there is a big enough gap' }, patterns: ['luecke', 'platz', 'frei', 'abstand', 'niemand (gefaehrd|behinder)', '\\bgap', 'space', 'clear', 'safe distance', 'without (endangering|cutting|forcing)'] },
      { id: 'early', area: 'position', label: { de: 'Früh und flüssig einordnen', en: 'Move over early and smoothly' }, patterns: ['rechtzeitig', 'frueh', 'einordn', 'zuegig', 'fluessig', 'in good time', 'early', 'smooth'] },
    ],
    contradictions: [
      { patterns: ['ohne schulterblick', 'nur (in den |die )?spiegel', 'without (a )?shoulder', 'only (the |my )?mirror'], hint: { de: 'Spiegel allein reichen nicht: Der tote Winkel braucht einen Schulterblick.', en: 'Mirrors alone are not enough: the blind spot needs a shoulder check.' } },
    ],
    steps: [
      { de: 'Innenspiegel', en: 'Interior mirror' },
      { de: 'Linker Außenspiegel', en: 'Left side mirror' },
      { de: 'Links blinken', en: 'Indicate left' },
      { de: 'Schulterblick nach links', en: 'Shoulder check to the left' },
      { de: 'Bei ausreichender Lücke zügig wechseln', en: 'Change smoothly when the gap is big enough' },
    ],
    mistakes: [
      { area: 'observation', severe: true, text: { de: 'Nur in den Spiegel schauen und wechseln', en: 'Only check the mirror and change' }, why: { de: 'Der tote Winkel braucht einen Schulterblick.', en: 'The blind spot needs a shoulder check.' } },
      { area: 'communication', text: { de: 'Erst wechseln, dann blinken', en: 'Change first, then indicate' }, why: { de: 'Der Blinker kündigt den Wechsel vorher an.', en: 'The indicator announces the change beforehand.' } },
    ],
    modelAnswer: {
      de: 'Ich ordne mich früh links ein. Ich schaue in den Innenspiegel, dann in den linken Außenspiegel, blinke links und mache einen Schulterblick nach links in den toten Winkel. Ich wechsle erst, wenn eine ausreichend große Lücke da ist und ich niemanden behindere, und dann zügig und gleichmäßig.',
      en: 'I move over to the left early. I check the interior mirror, then the left side mirror, indicate left and do a shoulder check to the left into the blind spot. I only change when there is a big enough gap and I do not hinder anyone, and then smoothly and steadily.',
    },
    law: { de: '§ 7 Abs. 5 StVO: Ein Fahrstreifen darf nur gewechselt werden, wenn eine Gefährdung anderer ausgeschlossen ist. Der Wechsel ist rechtzeitig und deutlich mit dem Blinker anzukündigen.', en: '§ 7 (5) StVO: you may only change lanes if endangering others is ruled out. The change must be announced clearly and in good time with the indicator.' },
    miniTest: {
      question: { de: 'Welche Reihenfolge ist richtig?', en: 'Which order is right?' },
      options: [
        { de: 'Blinker, Spiegel, Schulterblick, wechseln', en: 'Indicator, mirrors, shoulder check, change' },
        { de: 'Innenspiegel, Außenspiegel, Blinker, Schulterblick, wechseln', en: 'Interior mirror, side mirror, indicator, shoulder check, change' },
        { de: 'Schulterblick, Blinker, wechseln', en: 'Shoulder check, indicator, change' },
      ],
      correct: 1,
      explanation: { de: 'Erst die Lage im Spiegel prüfen, dann blinken, dann direkt vor dem Wechsel der Schulterblick in den toten Winkel.', en: 'First check the situation in the mirrors, then indicate, then the shoulder check into the blind spot right before changing.' },
    },
  },
  {
    id: 'rechts-abbiegen-radweg',
    free: false,
    title: { de: 'Rechts abbiegen mit Radweg', en: 'Turning right across a cycle lane' },
    situation: {
      de: 'Du willst an einer Kreuzung rechts abbiegen. Rechts neben dir verläuft ein Radweg geradeaus. An der Straße, in die du abbiegst, wollen Fußgänger queren.',
      en: 'You want to turn right at a junction. A cycle lane runs straight on to your right. Pedestrians want to cross the road you are turning into.',
    },
    examiner: { de: 'An der nächsten Kreuzung bitte rechts abbiegen.', en: 'Turn right at the next junction, please.' },
    questions: [
      { de: 'Wie bereitest du das Abbiegen vor?', en: 'How do you prepare the turn?' },
      { de: 'Auf wen musst du achten?', en: 'Who do you have to watch for?' },
      { de: 'Wer hat Vorrang?', en: 'Who has priority?' },
    ],
    keyPoints: [
      { id: 'signal', area: 'communication', label: { de: 'Rechtzeitig rechts blinken', en: 'Indicate right in good time' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'speed', area: 'position', label: { de: 'Langsam werden, rechts einordnen', en: 'Slow down, keep to the right' }, patterns: [...SLOW, 'einordn'] },
      { id: 'shoulder', area: 'observation', severe: true, label: { de: 'Rechter Spiegel, kurz vor dem Abbiegen Schulterblick nach rechts', en: 'Right mirror, shoulder check to the right just before turning' }, patterns: [...SHOULDER, 'rechte\\w* spiegel', 'right mirror'] },
      { id: 'cyclists', area: 'observation', severe: true, label: { de: 'Radfahrern auf dem Radweg Vorrang lassen, aus beiden Richtungen', en: 'Let cyclists on the cycle lane go first, from both directions' }, patterns: ['(radfahr|fahrrad|radweg)\\w* .{0,70}(vorrang|vorfahrt|vortritt|zuerst|durch|lass|warte)', '(warte|lasse) .{0,40}(radfahr|fahrrad)', '(cyclist|bike|cycle)\\w* .{0,40}(priority|first|right of way|pass|go)', '(wait for|let) .{0,30}(cyclist|bike)'] },
      { id: 'pedestrians', area: 'observation', severe: true, label: { de: 'Querenden Fußgängern Vorrang lassen', en: 'Let crossing pedestrians go first' }, patterns: ['fussgaeng\\w* .{0,40}(vorrang|vortritt|zuerst|lass|warte)', '(warte|lasse) .{0,40}fussgaeng', 'pedestrian\\w* .{0,40}(priority|first|right of way|cross|go)', '(wait for|let) .{0,30}pedestrian'] },
      { id: 'wait', area: 'speed', label: { de: 'Wenn nötig anhalten und warten', en: 'Stop and wait if necessary' }, patterns: STOP_WAIT },
    ],
    contradictions: [
      { patterns: ['vor dem radfahrer .{0,20}abbieg', 'schnell .{0,15}abbieg', 'cut in front', 'turn (quickly )?before the (cyclist|bike)'], hint: { de: 'Nicht vor dem Radfahrer abbiegen: Er fährt geradeaus und hat Vorrang.', en: 'Do not turn in front of the cyclist: they are going straight on and have priority.' } },
    ],
    steps: [
      { de: 'Innenspiegel und rechter Außenspiegel, dann rechtzeitig rechts blinken', en: 'Interior and right mirror, then indicate right in good time' },
      { de: 'Langsamer werden und möglichst weit rechts einordnen', en: 'Slow down and keep as far right as possible' },
      { de: 'Kurz vor dem Abbiegen Schulterblick nach rechts', en: 'Shoulder check to the right just before turning' },
      { de: 'Radfahrer auf dem Radweg aus beiden Richtungen durchfahren lassen', en: 'Let cyclists on the cycle lane pass, from both directions' },
      { de: 'Querende Fußgänger gehen lassen', en: 'Let crossing pedestrians go' },
      { de: 'Abbiegen', en: 'Turn' },
    ],
    mistakes: [
      { area: 'observation', severe: true, text: { de: 'Schnell vor dem Radfahrer abbiegen', en: 'Turn quickly in front of the cyclist' }, why: { de: 'Der Radfahrer fährt geradeaus und hat Vorrang.', en: 'The cyclist is going straight on and has priority.' } },
      { area: 'observation', severe: true, text: { de: 'Nur in den Spiegel schauen, kein Schulterblick', en: 'Only check the mirror, no shoulder check' }, why: { de: 'Radfahrer im toten Winkel siehst du nur mit dem Schulterblick. Abbiegeunfälle entstehen genau so.', en: 'A cyclist in the blind spot is only seen with a shoulder check. That is exactly how turning accidents happen.' } },
    ],
    modelAnswer: {
      de: 'Ich schaue in den Innenspiegel und den rechten Außenspiegel, blinke rechtzeitig rechts, werde langsamer und ordne mich möglichst weit rechts ein. Kurz vor dem Abbiegen mache ich einen Schulterblick nach rechts, denn auf dem Radweg kann jemand geradeaus kommen, auch entgegen der Fahrtrichtung. Radfahrer geradeaus und Fußgänger, die die Straße queren, haben Vorrang. Wenn nötig halte ich an und warte, dann biege ich ab.',
      en: 'I check the interior mirror and the right mirror, indicate right in good time, slow down and keep as far right as possible. Just before turning I do a shoulder check to the right, because someone may come straight on along the cycle lane, also against the direction of traffic. Cyclists going straight on and pedestrians crossing the road have priority. If necessary I stop and wait, then I turn.',
    },
    law: { de: '§ 9 Abs. 1 StVO: Vor dem Einordnen und nochmals vor dem Abbiegen auf den nachfolgenden Verkehr achten. § 9 Abs. 3 StVO: Wer abbiegt, muss Radfahrer auf Radwegen in gleicher Richtung durchfahren lassen und auf Fußgänger besondere Rücksicht nehmen, wenn nötig warten.', en: '§ 9 (1) StVO: watch the traffic behind you before moving over and again before turning. § 9 (3) StVO: when turning you must let cyclists on cycle lanes going the same way through and take special care of pedestrians, waiting if necessary.' },
    miniTest: {
      question: { de: 'Du blinkst rechts. Auf dem Radweg kommt von hinten ein Radfahrer, der geradeaus fährt. Was tust du?', en: 'You are indicating right. A cyclist comes up from behind on the cycle lane, going straight on. What do you do?' },
      options: [
        { de: 'Schnell vor ihm abbiegen', en: 'Turn quickly in front of him' },
        { de: 'Ihn vorbeifahren lassen, dann abbiegen', en: 'Let him pass, then turn' },
        { de: 'Hupen, damit er bremst', en: 'Honk so he brakes' },
      ],
      correct: 1,
      explanation: { de: 'Der Radfahrer fährt geradeaus und hat Vorrang. Du wartest, bis er vorbei ist.', en: 'The cyclist is going straight on and has priority. You wait until he has passed.' },
    },
  },
  {
    id: 'schulbus',
    free: false,
    title: { de: 'Schulbus mit Warnblinklicht', en: 'School bus with hazard lights' },
    situation: {
      de: 'Ein Schulbus hält an einer Haltestelle auf deiner Seite und hat das Warnblinklicht eingeschaltet. Kinder steigen aus.',
      en: 'A school bus has stopped at a stop on your side of the road with its hazard lights on. Children are getting off.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Was bedeutet das Warnblinklicht für dich?', en: 'What do the hazard lights mean for you?' },
      { de: 'Wie schnell darfst du vorbeifahren?', en: 'How fast may you pass?' },
      { de: 'Worauf achtest du?', en: 'What do you watch for?' },
    ],
    keyPoints: [
      { id: 'hazard', area: 'observation', label: { de: 'Warnblinklicht erkennen: besondere Regeln', en: 'Recognise the hazard lights: special rules apply' }, patterns: ['warnblink', 'hazard', 'flashing', 'blinkt'] },
      { id: 'walking', area: 'speed', severe: true, label: { de: 'Nur mit Schrittgeschwindigkeit vorbeifahren', en: 'Pass only at walking speed' }, patterns: ['schritt', '4 (bis|7)', 'walking (pace|speed)', 'very slow', 'ganz langsam', 'sehr langsam'] },
      { id: 'children', area: 'observation', label: { de: 'Mit Kindern rechnen, die auf die Straße laufen', en: 'Expect children running into the road' }, patterns: ['kind', 'schueler', 'fahrgaest', 'child', 'kids', 'pupil', 'passenger'] },
      { id: 'distance', area: 'position', label: { de: 'Ausreichend Seitenabstand', en: 'Enough side distance' }, patterns: ['abstand', 'distance', 'space', 'clearance', 'gap'] },
      { id: 'wait', area: 'speed', label: { de: 'Wenn nötig anhalten und warten', en: 'Stop and wait if necessary' }, patterns: STOP_WAIT },
      { id: 'noOvertake', area: 'position', severe: true, label: { de: 'Einen Bus mit Warnblinklicht, der sich der Haltestelle nähert, nicht überholen', en: 'Do not overtake a bus approaching the stop with hazard lights on' }, allowNegation: true, patterns: ['(nicht|kein) .{0,10}ueberhol', 'ueberhol\\w* (ich |man )?nicht', 'ueberholverbot', '(not|no|dont|don t|never) .{0,10}overtak'] },
    ],
    contradictions: [
      { patterns: ['(normal|zuegig|schnell) .{0,15}vorbei', 'ueberhole den bus', '(pass|overtake) .{0,15}(quickly|normally)', 'hupe', 'honk'], hint: { de: 'Am haltenden Bus mit Warnblinklicht nur mit Schrittgeschwindigkeit vorbei, nie zügig.', en: 'Past a stopped bus with hazard lights only at walking speed, never briskly.' } },
    ],
    steps: [
      { de: 'Warnblinklicht am Bus erkennen', en: 'Notice the bus\'s hazard lights' },
      { de: 'Auf Schrittgeschwindigkeit verlangsamen', en: 'Slow down to walking speed' },
      { de: 'Mit Kindern rechnen, die auf die Straße laufen', en: 'Expect children running into the road' },
      { de: 'Mit ausreichendem Seitenabstand vorbeifahren', en: 'Pass with enough side distance' },
      { de: 'Wenn nötig anhalten und warten', en: 'Stop and wait if necessary' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Zügig vorbeifahren, solange niemand auf der Straße ist', en: 'Pass briskly while nobody is in the road' }, why: { de: 'Am haltenden Bus mit Warnblinklicht nur Schrittgeschwindigkeit.', en: 'Past a stopped bus with hazard lights only at walking speed.' } },
      { area: 'position', severe: true, text: { de: 'Den Bus überholen, bevor er hält', en: 'Overtake the bus before it stops' }, why: { de: 'Busse mit Warnblinklicht vor der Haltestelle darfst du nicht überholen.', en: 'You may not overtake a bus approaching a stop with hazard lights on.' } },
    ],
    modelAnswer: {
      de: 'Der Bus hat das Warnblinklicht an, also gelten besondere Regeln. Ich fahre nur mit Schrittgeschwindigkeit und mit ausreichendem Seitenabstand vorbei und rechne damit, dass Kinder vor oder hinter dem Bus auf die Straße laufen. Wenn nötig halte ich an und warte. Einen Bus, der sich mit Warnblinklicht der Haltestelle nähert, überhole ich nicht.',
      en: 'The bus has its hazard lights on, so special rules apply. I pass only at walking speed and with enough side distance, and I expect children to run into the road in front of or behind the bus. If necessary I stop and wait. I do not overtake a bus that is approaching the stop with its hazard lights on.',
    },
    law: { de: '§ 20 Abs. 3 und 4 StVO: Busse mit Warnblinklicht vor Haltestellen nicht überholen. An haltenden Bussen mit Warnblinklicht nur mit Schrittgeschwindigkeit vorbei, auch im Gegenverkehr auf derselben Fahrbahn, wenn nötig warten.', en: '§ 20 (3) and (4) StVO: do not overtake buses approaching a stop with hazard lights on. Pass stopped buses with hazard lights only at walking speed, oncoming traffic on the same carriageway too, and wait if necessary.' },
    miniTest: {
      question: { de: 'Ein Bus mit Warnblinklicht hält auf der Gegenseite derselben Fahrbahn. Was gilt für dich?', en: 'A bus with hazard lights stops on the opposite side of the same carriageway. What applies to you?' },
      options: [
        { de: 'Nichts, er steht ja auf der anderen Seite', en: 'Nothing, it is on the other side' },
        { de: 'Schrittgeschwindigkeit beim Vorbeifahren, wenn nötig warten', en: 'Walking speed when passing, wait if necessary' },
        { de: 'Immer anhalten, bis der Bus losfährt', en: 'Always stop until the bus leaves' },
      ],
      correct: 1,
      explanation: { de: 'Die Schrittgeschwindigkeit gilt auch für den Gegenverkehr auf derselben Fahrbahn. Kinder können auch auf deine Seite laufen.', en: 'Walking speed also applies to oncoming traffic on the same carriageway. Children may run across to your side too.' },
    },
  },
  {
    id: 'autobahn-auffahren',
    free: false,
    title: { de: 'Auf die Autobahn auffahren', en: 'Joining the Autobahn' },
    situation: {
      de: 'Du bist auf dem Beschleunigungsstreifen. Auf dem rechten Fahrstreifen der Autobahn fahren Autos mit etwa 100 km/h.',
      en: 'You are on the acceleration lane. Cars are driving at about 100 km/h in the right lane of the Autobahn.',
    },
    examiner: { de: 'Fahren Sie bitte auf die Autobahn auf.', en: 'Please join the Autobahn.' },
    questions: [
      { de: 'Wie nutzt du den Beschleunigungsstreifen?', en: 'How do you use the acceleration lane?' },
      { de: 'Was prüfst du vor dem Einfädeln?', en: 'What do you check before merging?' },
      { de: 'Wer hat Vorrang?', en: 'Who has priority?' },
    ],
    keyPoints: [
      { id: 'accelerate', area: 'speed', label: { de: 'Auf die Geschwindigkeit der Autobahn beschleunigen', en: 'Accelerate to the speed of the Autobahn traffic' }, patterns: ['beschleunig', 'gas geben', '(tempo|geschwindigkeit) an(pass|gleich)', 'accelerat', 'speed up', 'match (the )?speed', 'up to speed'] },
      { id: 'mirror', area: 'observation', label: { de: 'Früh in den linken Spiegel schauen', en: 'Check the left mirror early' }, patterns: [...MIRROR, 'beobacht', 'observ', 'watch the traffic'] },
      { id: 'signal', area: 'communication', label: { de: 'Links blinken', en: 'Indicate left' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'shoulder', area: 'observation', label: { de: 'Schulterblick nach links', en: 'Shoulder check to the left' }, patterns: SHOULDER },
      { id: 'gap', area: 'position', label: { de: 'In eine Lücke einfädeln', en: 'Merge into a gap' }, patterns: ['luecke', 'einfaedel', 'einordn', '\\bgap', 'merge', 'space'] },
      { id: 'priority', area: 'position', severe: true, label: { de: 'Der Verkehr auf der Autobahn hat Vorfahrt', en: 'Traffic on the Autobahn has priority' }, patterns: ['(autobahn|durchgehend|fliessend)\\w* .{0,30}(vorfahrt|vorrang)', 'vorfahrt (gewaehr|lass|achten)', 'nicht (erzwing|behinder|draengel)', '(traffic|cars) on the (autobahn|motorway|highway) .{0,30}(priority|right of way|first)', '(not|dont|don t) (force|cut)'] },
    ],
    contradictions: [
      { patterns: ['reissverschluss', 'zipper', 'zip merge'], hint: { de: 'Das Reißverschlussverfahren gilt hier nicht: Der Verkehr auf der Autobahn hat Vorfahrt.', en: 'The zip rule does not apply here: traffic on the Autobahn has priority.' } },
      { patterns: ['langsam (auf|ein)', 'slowly merge', 'merge slowly'], hint: { de: 'Zu langsames Auffahren ist gefährlich: Nutze den Beschleunigungsstreifen zum Beschleunigen.', en: 'Joining too slowly is dangerous: use the acceleration lane to speed up.' } },
    ],
    steps: [
      { de: 'Auf dem Beschleunigungsstreifen beschleunigen', en: 'Accelerate on the acceleration lane' },
      { de: 'Früh in den linken Spiegel schauen', en: 'Check the left mirror early' },
      { de: 'Links blinken', en: 'Indicate left' },
      { de: 'Schulterblick nach links', en: 'Shoulder check to the left' },
      { de: 'In eine passende Lücke einfädeln', en: 'Merge into a suitable gap' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Am Ende des Streifens anhalten und warten', en: 'Stop at the end of the lane and wait' }, why: { de: 'Anhalten ist gefährlich: Nutze den Streifen zum Beschleunigen.', en: 'Stopping is dangerous: use the lane to speed up.' } },
      { area: 'position', severe: true, text: { de: 'Auf das Reißverschlussverfahren vertrauen', en: 'Rely on the zip rule' }, why: { de: 'Der Reißverschluss gilt nur, wenn ein Fahrstreifen endet. Hier hat der Verkehr auf der Autobahn Vorfahrt.', en: 'The zip rule only applies where a lane ends. Here the traffic on the Autobahn has priority.' } },
    ],
    modelAnswer: {
      de: 'Ich nutze den Beschleunigungsstreifen und beschleunige auf die Geschwindigkeit des Verkehrs. Dabei schaue ich früh in den linken Spiegel, blinke links und mache einen Schulterblick nach links. Der Verkehr auf der Autobahn hat Vorfahrt, also fädle ich zügig in eine passende Lücke ein, ohne jemanden zu behindern.',
      en: 'I use the acceleration lane and speed up to the speed of the traffic. While doing that I check the left mirror early, indicate left and do a shoulder check to the left. Traffic on the Autobahn has priority, so I merge smoothly into a suitable gap without hindering anyone.',
    },
    law: { de: '§ 18 Abs. 3 StVO: Der Verkehr auf der durchgehenden Fahrbahn hat Vorfahrt.', en: '§ 18 (3) StVO: traffic on the through carriageway has priority.' },
    miniTest: {
      question: { de: 'Wer hat Vorrang beim Auffahren auf die Autobahn?', en: 'Who has priority when you join the Autobahn?' },
      options: [
        { de: 'Du, es gilt das Reißverschlussverfahren', en: 'You, the zip rule applies' },
        { de: 'Der Verkehr auf der Autobahn', en: 'The traffic on the Autobahn' },
        { de: 'Wer schneller ist', en: 'Whoever is faster' },
      ],
      correct: 1,
      explanation: { de: 'Der Verkehr auf der durchgehenden Fahrbahn hat Vorfahrt. Du passt dich an und fädelst in eine Lücke ein.', en: 'Traffic on the through carriageway has priority. You adapt and merge into a gap.' },
    },
  },
  {
    id: 'hindernis',
    free: false,
    title: { de: 'Hindernis auf deiner Seite', en: 'Obstacle on your side' },
    situation: {
      de: 'Auf deiner Fahrbahnseite parkt ein Lieferwagen. Die Straße ist zu schmal für dich und den Gegenverkehr gleichzeitig. Ein Auto kommt dir entgegen.',
      en: 'A delivery van is parked on your side of the road. The road is too narrow for you and the oncoming traffic at the same time. A car is coming towards you.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Wer darf zuerst fahren?', en: 'Who may go first?' },
      { de: 'Wo hältst du, wenn du warten musst?', en: 'Where do you stop if you have to wait?' },
      { de: 'Was tust du beim Vorbeifahren?', en: 'What do you do when passing?' },
    ],
    keyPoints: [
      { id: 'oncoming', area: 'speed', severe: true, label: { de: 'Der Gegenverkehr hat Vorrang', en: 'Oncoming traffic has priority' }, patterns: ['gegenverkehr .{0,40}(vorrang|vorfahrt|zuerst|durch|lass|vor)', '(lasse|warte) .{0,40}(gegenverkehr|entgegen)', 'oncoming .{0,40}(first|priority|go|pass|right of way)', '(let|wait for) .{0,30}oncoming'] },
      { id: 'wait', area: 'position', label: { de: 'Mit Abstand vor dem Hindernis warten', en: 'Wait at a distance behind the obstacle' }, patterns: [...STOP_WAIT, ...SLOW] },
      { id: 'mirror', area: 'observation', label: { de: 'Spiegel und Schulterblick vor dem Ausscheren', en: 'Mirror and shoulder check before pulling out' }, patterns: [...MIRROR, ...SHOULDER] },
      { id: 'signal', area: 'communication', label: { de: 'Ausscheren und Einordnen mit dem Blinker anzeigen', en: 'Indicate when pulling out and back in' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'distance', area: 'position', label: { de: 'Etwa einen Meter Seitenabstand (Türen)', en: 'About one metre side distance (doors)' }, patterns: ['abstand', 'meter', '1 m', '\\bdistance', 'space', 'door', 'tuer'] },
      { id: 'people', area: 'observation', label: { de: 'Mit Personen am Lieferwagen rechnen', en: 'Expect people at the van' }, patterns: ['fussgaeng', 'person', 'fahrer', 'aussteig', 'pedestrian', 'people', 'someone', 'driver', 'step out'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'zwaeng', 'squeeze'], hint: { de: 'Das Hindernis ist auf deiner Seite, also lässt du den Gegenverkehr zuerst fahren.', en: 'The obstacle is on your side, so you let the oncoming traffic go first.' } },
    ],
    steps: [
      { de: 'Erkennen: der Gegenverkehr hat Vorrang', en: 'Recognise: oncoming traffic has priority' },
      { de: 'Langsamer werden, mit Abstand hinter dem Hindernis warten', en: 'Slow down, wait at a distance behind the obstacle' },
      { de: 'Spiegel und links blinken', en: 'Mirror and indicate left' },
      { de: 'Schulterblick nach links', en: 'Shoulder check to the left' },
      { de: 'Mit etwa einem Meter Abstand vorbeifahren', en: 'Pass with about one metre of distance' },
      { de: 'Rechts blinken und wieder einordnen', en: 'Indicate right and move back in' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Zügig vorbei, bevor der Gegenverkehr da ist', en: 'Hurry past before the oncoming car arrives' }, why: { de: 'Das Hindernis ist auf deiner Seite, also wartest du.', en: 'The obstacle is on your side, so you wait.' } },
      { area: 'position', text: { de: 'Dicht am Lieferwagen vorbeifahren', en: 'Pass close to the van' }, why: { de: 'Türen können sich öffnen, halte etwa einen Meter Abstand.', en: 'Doors can open; keep about one metre away.' } },
    ],
    modelAnswer: {
      de: 'Das Hindernis ist auf meiner Seite, also hat der Gegenverkehr Vorrang. Ich werde langsamer und halte mit Abstand hinter dem Lieferwagen, damit ich später gut vorbeikomme. Wenn die Gegenseite frei ist, schaue ich in den Spiegel, blinke links, mache einen Schulterblick und fahre mit etwa einem Meter Seitenabstand vorbei, weil sich Türen öffnen oder Personen aussteigen können. Danach blinke ich rechts und ordne mich wieder ein.',
      en: 'The obstacle is on my side, so oncoming traffic has priority. I slow down and stop at a distance behind the van so I can pull out easily later. When the other side is clear, I check the mirror, indicate left, do a shoulder check and pass with about one metre of side distance, because doors can open or people can step out. Then I indicate right and move back in.',
    },
    law: { de: '§ 6 StVO: Wer an einem Hindernis auf der Fahrbahn links vorbeifahren will, muss entgegenkommende Fahrzeuge durchfahren lassen, außer die Zeichen 208 und 308 regeln den Vorrang anders. Ausscheren und Wiedereinordnen zeigst du rechtzeitig mit dem Blinker an (§ 5 Abs. 4a StVO).', en: '§ 6 StVO: whoever wants to pass an obstacle on the road must let oncoming vehicles through, unless signs 208 and 308 set the priority differently. Pulling out and moving back in are announced in good time with the indicator (§ 5 (4a) StVO).' },
    miniTest: {
      question: { de: 'Das Hindernis steht auf der Seite des Gegenverkehrs. Wer muss warten?', en: 'The obstacle is on the oncoming side. Who has to wait?' },
      options: [
        { de: 'Du', en: 'You' },
        { de: 'Der Gegenverkehr', en: 'The oncoming driver' },
        { de: 'Wer zuerst da ist', en: 'Whoever gets there first' },
      ],
      correct: 1,
      explanation: { de: 'Warten muss, auf dessen Seite das Hindernis steht. Bleib trotzdem bremsbereit, falls der andere nicht wartet.', en: 'Whoever has the obstacle on their side has to wait. Stay ready to brake in case the other driver does not.' },
    },
  },

  // Batch 1 (DRI-64): the situations learners fail most, by the TÜV/DEKRA failure reasons
  // (right of way, turning, observation, pedestrians, speed).
  {
    id: 'linksabbiegen-gegenverkehr',
    free: false,
    title: { de: 'Links abbiegen mit Gegenverkehr', en: 'Turning left with oncoming traffic' },
    situation: {
      de: 'Innerorts, Ampelkreuzung mit Grün für dich. Du willst links abbiegen. Dir kommen Autos entgegen, die geradeaus fahren. In der Straße, in die du abbiegst, wollen Fußgänger queren.',
      en: 'In town, a junction with traffic lights, green for you. You want to turn left. Cars are coming towards you going straight on. Pedestrians want to cross the road you are turning into.',
    },
    examiner: { de: 'An der Ampel bitte links abbiegen.', en: 'Turn left at the lights, please.' },
    questions: [
      { de: 'Wie bereitest du das Abbiegen vor?', en: 'How do you prepare the turn?' },
      { de: 'Wer hat Vorrang?', en: 'Who has priority?' },
      { de: 'Wo wartest du, und wie stehen die Räder?', en: 'Where do you wait, and how are the wheels pointing?' },
    ],
    keyPoints: [
      { id: 'prepare', area: 'observation', label: { de: 'Innenspiegel, linker Außenspiegel, dann rechtzeitig links blinken', en: 'Interior mirror, left mirror, then indicate left in good time' }, patterns: [...MIRROR, 'blink', 'indicat', 'signal'] },
      { id: 'position', area: 'position', label: { de: 'Zur Mitte hin einordnen', en: 'Move over towards the centre' }, patterns: ['einordn', '(zur|in der|an die|an der) mitte', 'mittig', 'move (over )?(to|towards) the (centre|center|middle)', 'centre line', 'center line', 'middle of'] },
      { id: 'oncoming', area: 'speed', severe: true, label: { de: 'Gegenverkehr, der geradeaus fährt oder rechts abbiegt, durchfahren lassen', en: 'Let oncoming traffic going straight on or turning right through' }, patterns: ['gegenverkehr .{0,40}(vorrang|vorfahrt|zuerst|durch|lass|vor\\b|warte)', '(lasse|warte) .{0,40}(gegenverkehr|entgegen)', 'oncoming .{0,40}(first|priority|go|pass|through|right of way)', '(let|wait for) .{0,30}oncoming'] },
      { id: 'wait', area: 'position', label: { de: 'In die Kreuzung einfahren und mit geraden Rädern warten', en: 'Enter the junction and wait with the wheels straight' }, patterns: ['(raeder|lenkung|reifen) .{0,15}gerade', 'gerade\\w* .{0,15}(raeder|lenkung|reifen)', 'nicht einschlag', 'wheels? .{0,15}straight', 'straight .{0,15}wheels?', '(not|dont|don t|without) (turn|steer)\\w* (the )?(wheel|steering)'] },
      { id: 'shoulder', area: 'observation', severe: true, label: { de: 'Vor dem Abbiegen Schulterblick nach links', en: 'Shoulder check to the left before turning' }, patterns: SHOULDER },
      { id: 'pedestrians', area: 'observation', severe: true, label: { de: 'Querenden Fußgängern und Radfahrern Vorrang lassen', en: 'Let crossing pedestrians and cyclists go first' }, patterns: ['(fussgaeng|radfahr)\\w* .{0,40}(vorrang|vortritt|zuerst|lass|warte|gehen)', '(warte|lasse) .{0,40}(fussgaeng|radfahr)', '(pedestrian|cyclist)\\w* .{0,40}(priority|first|right of way|cross|go)', '(wait for|let) .{0,30}(pedestrian|cyclist)'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'vor dem gegenverkehr .{0,15}abbieg', 'schnell .{0,15}(vor|durch)', '(quickly|before) the oncoming'], hint: { de: 'Beim Linksabbiegen hat der Gegenverkehr Vorrang, auch bei Grün.', en: 'When turning left, oncoming traffic has priority, even at green.' } },
      { patterns: ['raeder .{0,10}(nach links|eingeschlagen)', '(schlage|lenke) .{0,20}(ein|links) .{0,20}(warte|stehe)', 'wheels turned', 'turn the wheels while'], hint: { de: 'Beim Warten die Räder gerade halten: Wirst du aufgefahren, schiebt es dich sonst in den Gegenverkehr.', en: 'Keep the wheels straight while waiting: if you are hit from behind, turned wheels push you into oncoming traffic.' } },
    ],
    steps: [
      { de: 'Innenspiegel, linker Außenspiegel, rechtzeitig links blinken', en: 'Interior mirror, left mirror, indicate left in good time' },
      { de: 'Schulterblick links, zur Mitte hin einordnen und langsamer werden', en: 'Shoulder check left, move over towards the centre and slow down' },
      { de: 'Bei Grün in die Kreuzung einfahren, Räder gerade, warten', en: 'At green, enter the junction, wheels straight, wait' },
      { de: 'Gegenverkehr geradeaus und entgegenkommende Rechtsabbieger durchfahren lassen', en: 'Let oncoming traffic going straight on and oncoming right-turners through' },
      { de: 'Schulterblick links, Fußgänger und Radfahrer in der Zielstraße gehen lassen', en: 'Shoulder check left, let pedestrians and cyclists in the target road go' },
      { de: 'In einer Lücke zügig abbiegen', en: 'Turn briskly in a gap' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Schnell vor dem Gegenverkehr abbiegen, die Ampel ist ja grün', en: 'Turn quickly in front of the oncoming traffic, the light is green' }, why: { de: 'Grün gibt dir keinen Vorrang vor dem Gegenverkehr. Wer links abbiegt, muss Entgegenkommende durchfahren lassen.', en: 'Green gives you no priority over oncoming traffic. Whoever turns left must let oncoming vehicles through.' } },
      { area: 'position', text: { de: 'Mit eingeschlagenen Rädern in der Kreuzung warten', en: 'Wait in the junction with the wheels turned' }, why: { de: 'Bei einem Auffahrunfall schieben eingeschlagene Räder dich in den Gegenverkehr.', en: 'In a rear-end collision, turned wheels push you into oncoming traffic.' } },
    ],
    modelAnswer: {
      de: 'Ich schaue in den Innenspiegel und den linken Außenspiegel, blinke rechtzeitig links und ordne mich zur Mitte hin ein. Bei Grün fahre ich in die Kreuzung ein und warte dort mit geraden Rädern. Der Gegenverkehr hat Vorrang, egal ob er geradeaus fährt oder rechts abbiegt, also lasse ich ihn durchfahren. Vor dem Abbiegen mache ich einen Schulterblick nach links und lasse Fußgänger und Radfahrer, die die Zielstraße queren, zuerst gehen. In einer Lücke biege ich zügig ab.',
      en: 'I check the interior mirror and the left mirror, indicate left in good time and move over towards the centre. At green I enter the junction and wait there with the wheels straight. Oncoming traffic has priority, whether going straight on or turning right, so I let it through. Before turning I do a shoulder check to the left and let pedestrians and cyclists crossing the target road go first. In a gap I turn briskly.',
    },
    law: { de: '§ 9 Abs. 1 StVO: Wer links abbiegt, ordnet sich bis zur Mitte ein, zeigt das rechtzeitig an und achtet vor dem Einordnen und nochmals vor dem Abbiegen auf den nachfolgenden Verkehr. § 9 Abs. 3 StVO: Entgegenkommende Fahrzeuge durchfahren lassen, auf Fußgänger besondere Rücksicht nehmen, wenn nötig warten. § 9 Abs. 4 StVO: Auch entgegenkommende Rechtsabbieger haben Vorrang.', en: '§ 9 (1) StVO: whoever turns left moves over towards the centre, indicates in good time and watches the traffic behind before moving over and again before turning. § 9 (3) StVO: let oncoming vehicles through, take special care of pedestrians, wait if necessary. § 9 (4) StVO: oncoming right-turners also have priority.' },
    miniTest: {
      question: { de: 'Du wartest bei Grün in der Kreuzung auf eine Lücke. Die Ampel springt auf Gelb und dann Rot, du stehst noch in der Kreuzung. Was tust du?', en: 'You are waiting in the junction at green for a gap. The light turns amber, then red, and you are still inside the junction. What do you do?' },
      options: [
        { de: 'Stehen bleiben, bis es wieder Grün wird', en: 'Stay put until it turns green again' },
        { de: 'Die Kreuzung räumen und abbiegen, sobald der Gegenverkehr steht', en: 'Clear the junction and turn as soon as the oncoming traffic has stopped' },
        { de: 'Rückwärts aus der Kreuzung fahren', en: 'Reverse out of the junction' },
      ],
      correct: 1,
      explanation: { de: 'Wer bei Grün eingefahren ist, darf und muss die Kreuzung räumen. Der Gegenverkehr hält bei Rot an, dann biegst du ab.', en: 'Whoever entered at green may and must clear the junction. The oncoming traffic stops at red, then you turn.' },
    },
  },
  {
    id: 'abknickende-vorfahrt',
    free: false,
    title: { de: 'Abknickende Vorfahrtsstraße', en: 'Priority road that bends' },
    situation: {
      de: 'Du fährst auf einer Vorfahrtsstraße. Das Schild „Vorfahrtsstraße“ hat ein Zusatzzeichen: Die Vorfahrtsstraße knickt an der nächsten Kreuzung nach links ab, geradeaus geht eine Nebenstraße weiter. Von rechts wartet ein Auto in der Nebenstraße.',
      en: 'You are driving on a priority road. The priority road sign has a supplementary plate: the priority road bends left at the next junction, a side road continues straight on. A car is waiting in the side road on the right.',
    },
    examiner: { de: 'Folgen Sie bitte der Vorfahrtsstraße.', en: 'Follow the priority road, please.' },
    questions: [
      { de: 'Was zeigt das Zusatzzeichen?', en: 'What does the supplementary plate show?' },
      { de: 'Musst du blinken, obwohl du Vorfahrt hast?', en: 'Do you have to indicate even though you have priority?' },
      { de: 'Worauf achtest du beim Abbiegen?', en: 'What do you watch for when turning?' },
    ],
    keyPoints: [
      { id: 'recognise', area: 'observation', label: { de: 'Zusatzzeichen lesen: Die Vorfahrt knickt nach links ab', en: 'Read the plate: the priority road bends left' }, patterns: ['zusatz', 'abknick', 'knickt', 'verlauf', 'nach links (ab|weiter|fuehrt|geht)', '(plate|sign) .{0,30}(bend|left)', 'bends? (to the )?left', 'turns? (to the )?left', 'priority road .{0,30}(goes|continues) left'] },
      { id: 'signal', area: 'communication', severe: true, label: { de: 'Links blinken, denn du biegst ab', en: 'Indicate left, because you are turning' }, patterns: ['links blink', 'blinke? .{0,15}links', 'blinker (nach )?links', 'indicat\\w* (to the )?left', 'signal\\w* (to the )?left', 'left indicator'] },
      { id: 'position', area: 'position', label: { de: 'Zur Mitte hin einordnen', en: 'Move over towards the centre' }, patterns: ['einordn', '(zur|in der|an die|an der) mitte', 'mittig', 'move (over )?(to|towards) the (centre|center|middle)', 'centre line', 'center line', 'middle of'] },
      { id: 'priority', area: 'speed', label: { de: 'Das Auto von rechts in der Nebenstraße muss warten, du hast Vorfahrt', en: 'The car on the right in the side road has to wait, you have priority' }, patterns: ['(ich|wir) (habe|haben) (die )?vorfahrt', 'nebenstrasse .{0,40}(warte|vorfahrt gewaehr|wartepflicht)', 'muss (er |es |das auto )?warten', 'i have (the )?(priority|right of way)', 'side road .{0,40}(wait|give way|yield)', '(has|have) to (wait|give way|yield)'] },
      { id: 'observe', area: 'observation', label: { de: 'Trotzdem bremsbereit, Blickkontakt: Lässt er dich wirklich?', en: 'Still ready to brake, eye contact: is he really letting you go?' }, patterns: ['bremsbereit', 'blickkontakt', 'ob er .{0,20}(wartet|haelt|steht|laesst)', 'nicht (darauf )?verlass', 'ready to brake', 'eye contact', '(whether|if) (he|the car|the driver) .{0,20}(wait|stop|let)', '(not|dont|don t) (rely|trust|assume)'] },
      { id: 'speed', area: 'speed', label: { de: 'Tempo für die Kurve reduzieren', en: 'Reduce speed for the bend' }, patterns: SLOW },
      { id: 'others', area: 'observation', label: { de: 'Beim Abbiegen auf Fußgänger und Radfahrer achten', en: 'Watch for pedestrians and cyclists when turning' }, patterns: ['fussgaeng', 'radfahr', 'fahrrad', 'pedestrian', 'cyclist', 'bike', ...SHOULDER] },
    ],
    contradictions: [
      { patterns: ['(nicht|kein|ohne) (zu )?blink', 'blink\\w* (ich |man )?nicht', '(do not|dont|don t|not|no|never) (indicat|signal|blink)', 'without (indicating|signalling|signaling)'], hint: { de: 'Wer der abknickenden Vorfahrtsstraße folgt, biegt ab und muss blinken.', en: 'Whoever follows the bending priority road is turning and must indicate.' } },
      { patterns: ['rechts vor links', 'right before left', 'vorfahrt (gewaehr|lass)', 'give way', '\\byield'], hint: { de: 'Du bleibst auf der Vorfahrtsstraße: Die Nebenstraße muss warten, nicht du.', en: 'You stay on the priority road: the side road has to wait, not you.' } },
    ],
    steps: [
      { de: 'Zusatzzeichen lesen: Vorfahrt knickt nach links ab', en: 'Read the plate: the priority bends left' },
      { de: 'Spiegel, rechtzeitig links blinken, zur Mitte hin einordnen', en: 'Mirrors, indicate left in good time, move over towards the centre' },
      { de: 'Tempo für die Kurve reduzieren', en: 'Reduce speed for the bend' },
      { de: 'Auto von rechts: Es muss warten, du bleibst bremsbereit', en: 'Car on the right: it has to wait, you stay ready to brake' },
      { de: 'Schulterblick, Fußgänger und Radfahrer beachten', en: 'Shoulder check, watch for pedestrians and cyclists' },
      { de: 'Der Vorfahrtsstraße nach links folgen', en: 'Follow the priority road to the left' },
    ],
    mistakes: [
      { area: 'communication', severe: true, text: { de: 'Nicht blinken, du folgst ja nur der Straße', en: 'Not indicate, you are only following the road' }, why: { de: 'Der Verkehr sieht nur, dass du abbiegst. Blinken ist Pflicht, auch auf der Vorfahrtsstraße.', en: 'Other road users only see that you are turning. Indicating is mandatory, even on the priority road.' } },
      { area: 'speed', text: { de: 'Dem Auto von rechts Vorfahrt lassen, rechts vor links', en: 'Give way to the car on the right, right before left' }, why: { de: 'Die Nebenstraße hat „Vorfahrt gewähren“. Du bist auf der Vorfahrtsstraße und fährst zuerst.', en: 'The side road has a give-way sign. You are on the priority road and go first.' } },
    ],
    modelAnswer: {
      de: 'Das Zusatzzeichen zeigt, dass die Vorfahrtsstraße nach links abknickt. Ich schaue in die Spiegel, blinke rechtzeitig links, weil ich abbiege, und ordne mich zur Mitte hin ein. Ich reduziere das Tempo für die Kurve. Das Auto von rechts in der Nebenstraße muss warten, ich habe Vorfahrt. Trotzdem bleibe ich bremsbereit und suche Blickkontakt, ob er wirklich wartet. Mit einem Schulterblick achte ich auf Fußgänger und Radfahrer, dann folge ich der Vorfahrtsstraße nach links.',
      en: 'The plate shows that the priority road bends left. I check the mirrors, indicate left in good time, because I am turning, and move over towards the centre. I reduce speed for the bend. The car on the right in the side road has to wait, I have priority. Still I stay ready to brake and look for eye contact to see whether he really waits. With a shoulder check I watch for pedestrians and cyclists, then I follow the priority road to the left.',
    },
    law: { de: 'Zeichen 306 mit Zusatzzeichen 1002-10 ff.: Die Vorfahrtsstraße folgt dem fetten Strich. Wer ihr an der Knickstelle folgt, biegt ab und muss blinken (§ 9 Abs. 1 StVO). Die Nebenstraßen haben Zeichen 205 oder 206 und müssen warten (§ 8 Abs. 1 StVO).', en: 'Sign 306 with plate 1002-10 ff.: the priority road follows the thick line. Whoever follows it round the bend is turning and must indicate (§ 9 (1) StVO). The side roads have sign 205 or 206 and have to wait (§ 8 (1) StVO).' },
    miniTest: {
      question: { de: 'Du fährst an der Knickstelle geradeaus in die Nebenstraße weiter. Was gilt?', en: 'At the bend you carry straight on into the side road. What applies?' },
      options: [
        { de: 'Du hast Vorfahrt vor allen, du kommst ja von der Vorfahrtsstraße', en: 'You have priority over everyone, you are coming from the priority road' },
        { de: 'Du verlässt die Vorfahrtsstraße und musst dem Verkehr auf ihr Vorfahrt gewähren', en: 'You leave the priority road and must give way to the traffic on it' },
        { de: 'Du musst rechts blinken', en: 'You must indicate right' },
      ],
      correct: 1,
      explanation: { de: 'Wer geradeaus die Vorfahrtsstraße verlässt, muss dem Verkehr auf der Vorfahrtsstraße Vorfahrt gewähren. Dabei wird nicht geblinkt.', en: 'Whoever leaves the priority road straight on must give way to the traffic on the priority road. No indicator is used for that.' },
    },
  },
  {
    id: 'gruenpfeil',
    free: false,
    title: { de: 'Grünpfeil an der roten Ampel', en: 'Green arrow sign at a red light' },
    situation: {
      de: 'Du willst an einer Ampelkreuzung rechts abbiegen. Die Ampel zeigt Rot. Neben dem roten Licht ist das Grünpfeil-Schild angebracht. Von links kommt auf dem Radweg ein Radfahrer, Fußgänger queren die Straße, in die du abbiegen willst.',
      en: 'You want to turn right at a junction with traffic lights. The light is red. Next to the red light is the green arrow sign. A cyclist is coming from the left on the cycle path, pedestrians are crossing the road you want to turn into.',
    },
    examiner: { de: 'An der Ampel bitte rechts abbiegen.', en: 'Turn right at the lights, please.' },
    questions: [
      { de: 'Was erlaubt das Grünpfeil-Schild, und unter welcher Bedingung?', en: 'What does the green arrow sign allow, and on what condition?' },
      { de: 'Wo hältst du an?', en: 'Where do you stop?' },
      { de: 'Wer hat Vorrang?', en: 'Who has priority?' },
    ],
    keyPoints: [
      { id: 'stop', area: 'speed', severe: true, label: { de: 'Zuerst an der Haltlinie anhalten, wie bei Rot', en: 'First stop at the stop line, as at red' }, patterns: ['halte?linie', 'stop line', 'stopping line', '(zuerst|erst|vorher|davor|immer) .{0,20}(anhalt|halte|stoppe)', '(anhalt|halte|stoppe)\\w* .{0,20}(zuerst|erst|vorher|an der ampel|bei rot)', '(first|always|must) (come to a )?(stop|halt)', 'stop (first|completely|at the red)', 'come to a (complete )?(stop|halt|standstill)'] },
      { id: 'allowed', area: 'observation', label: { de: 'Der Grünpfeil erlaubt das Rechtsabbiegen bei Rot nach dem Halt', en: 'The green arrow allows turning right at red after the stop' }, patterns: ['gruenpfeil', 'gruener pfeil', 'pfeil .{0,30}(erlaubt|darf|abbieg)', 'green arrow', 'arrow .{0,30}(allow|may|permit|turn)'] },
      { id: 'signal', area: 'communication', label: { de: 'Rechts blinken', en: 'Indicate right' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'cross', area: 'observation', severe: true, label: { de: 'Querverkehr von links hat Vorrang, auch Radfahrer auf dem Radweg', en: 'Cross traffic from the left has priority, cyclists on the cycle path too' }, patterns: ['(von links|querverkehr|radfahr|fahrrad)\\w* .{0,50}(vorrang|vorfahrt|vortritt|zuerst|durch|lass|warte|behinder)', '(warte|lasse) .{0,40}(links|querverkehr|radfahr|fahrrad)', '(from the left|cross traffic|cyclist|bike)\\w* .{0,40}(priority|first|right of way|pass|go|hinder)', '(wait for|let) .{0,30}(cyclist|bike|cross traffic|traffic from the left)'] },
      { id: 'pedestrians', area: 'observation', severe: true, label: { de: 'Querende Fußgänger gehen lassen', en: 'Let crossing pedestrians go' }, patterns: ['fussgaeng\\w* .{0,40}(vorrang|vortritt|zuerst|lass|warte|gehen)', '(warte|lasse) .{0,40}fussgaeng', 'pedestrian\\w* .{0,40}(priority|first|right of way|cross|go)', '(wait for|let) .{0,30}pedestrian'] },
      { id: 'careful', area: 'speed', label: { de: 'Aus dem Stand vorsichtig abbiegen, niemanden behindern oder gefährden', en: 'Turn carefully from standstill, hindering or endangering nobody' }, patterns: ['vorsichtig', 'langsam', 'schritt', 'niemand\\w* (zu )?(behinder|gefaehrd)', 'ohne .{0,20}(behinder|gefaehrd)', 'careful', 'slowly', 'walking pace', '(without|not) (hindering|endangering|obstructing)', 'nobody is (hindered|endangered)'] },
    ],
    contradictions: [
      { patterns: ['ohne (anzuhalten|zu halten|halt|zu stoppen)', '(nicht|kein) .{0,10}(anhalt|halten)', '(ohne|nicht) .{0,10}(anzuhalten|stoppen)', 'rolle', 'without stopping', '(dont|don t|do not|no need to) stop', 'roll (through|round|around)'], hint: { de: 'Der Grünpfeil ist keine grüne Ampel: Zuerst anhalten, dann abbiegen.', en: 'The green arrow is not a green light: stop first, then turn.' } },
      { patterns: ['wie (bei )?gruen', 'ist gruen', '(like|same as|as if) (it were |it was )?green', 'is green'], hint: { de: 'Das Grünpfeil-Schild ist ein Schild, keine Ampel. Du bleibst wartepflichtig gegenüber allen anderen.', en: 'The green arrow is a sign, not a light. You still have to give way to everyone else.' } },
    ],
    steps: [
      { de: 'Spiegel, rechts blinken, rechts einordnen, an der Haltlinie anhalten', en: 'Mirrors, indicate right, position on the right, stop at the stop line' },
      { de: 'Nach links schauen: Querverkehr und Radfahrer auf dem Radweg haben Vorrang', en: 'Look left: cross traffic and cyclists on the cycle path have priority' },
      { de: 'Querende Fußgänger gehen lassen', en: 'Let crossing pedestrians go' },
      { de: 'Schulterblick rechts', en: 'Shoulder check right' },
      { de: 'Aus dem Stand vorsichtig abbiegen', en: 'Turn carefully from standstill' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Langsam um die Ecke rollen, ohne anzuhalten', en: 'Roll slowly round the corner without stopping' }, why: { de: 'Beim Grünpfeil ist das Anhalten an der Haltlinie Pflicht. Ohne Halt ist es ein Rotlichtverstoß.', en: 'With the green arrow, stopping at the stop line is mandatory. Without stopping it counts as running a red light.' } },
      { area: 'observation', severe: true, text: { de: 'Nach dem Halt zügig abbiegen, der Grünpfeil gibt dir Vorrang', en: 'After stopping, turn briskly, the green arrow gives you priority' }, why: { de: 'Der Grünpfeil gibt keinen Vorrang. Querverkehr, Radfahrer und Fußgänger haben weiterhin Vorrang.', en: 'The green arrow gives no priority. Cross traffic, cyclists and pedestrians still have priority.' } },
    ],
    modelAnswer: {
      de: 'Das Grünpfeil-Schild erlaubt mir, bei Rot nach rechts abzubiegen, aber nur nach dem Halt. Ich blinke rechts und halte zuerst an der Haltlinie an. Dann schaue ich nach links: Der Querverkehr und der Radfahrer auf dem Radweg haben Vorrang, ich lasse sie durch. Die querenden Fußgänger lasse ich gehen. Nach einem Schulterblick biege ich aus dem Stand vorsichtig ab, ohne jemanden zu behindern oder zu gefährden.',
      en: 'The green arrow sign allows me to turn right at red, but only after stopping. I indicate right and first stop at the stop line. Then I look left: the cross traffic and the cyclist on the cycle path have priority, I let them pass. I let the crossing pedestrians go. After a shoulder check I turn carefully from standstill, without hindering or endangering anyone.',
    },
    law: { de: '§ 37 Abs. 2 Nr. 1 StVO: Mit dem Grünpfeil (Zeichen 720) darf bei Rot rechts abgebogen werden, nachdem an der Haltlinie angehalten wurde (ohne Haltlinie: vor der Ampel, an der Sichtlinie) und wenn niemand behindert oder gefährdet wird, insbesondere nicht der Verkehr aus der freigegebenen Richtung und Fußgänger und Radfahrer.', en: '§ 37 (2) no. 1 StVO: with the green arrow (sign 720) you may turn right at red after stopping at the stop line (without a line: before the light, at the sight line) and only if nobody is hindered or endangered, in particular not the traffic with green and pedestrians and cyclists.' },
    miniTest: {
      question: { de: 'Du stehst an der Haltlinie, die Ampel ist rot, der Grünpfeil ist da. Von links kommt kein Auto, aber ein Radfahrer auf dem Radweg. Was tust du?', en: 'You are at the stop line, the light is red, the green arrow is there. No car comes from the left, but a cyclist on the cycle path does. What do you do?' },
      options: [
        { de: 'Abbiegen, der Grünpfeil gilt für mich', en: 'Turn, the green arrow applies to me' },
        { de: 'Den Radfahrer durchlassen, dann abbiegen', en: 'Let the cyclist pass, then turn' },
        { de: 'Hupen, damit er wartet', en: 'Honk so he waits' },
      ],
      correct: 1,
      explanation: { de: 'Der Radfahrer fährt bei Grün und hat Vorrang. Du biegst erst ab, wenn du niemanden behinderst.', en: 'The cyclist is riding at green and has priority. You only turn when you hinder nobody.' },
    },
  },
  {
    id: 'bahnuebergang',
    free: false,
    title: { de: 'Bahnübergang mit Andreaskreuz und Blinklicht', en: 'Level crossing with Saint Andrew\'s cross and flashing light' },
    situation: {
      de: 'Landstraße. Vor dir ein Bahnübergang mit Andreaskreuz, Halbschranken und Lichtzeichen. Gerade beginnt das rote Licht zu blinken, die Schranken sind noch oben. Hinter dir fährt ein Auto.',
      en: 'Country road. Ahead is a level crossing with a Saint Andrew\'s cross, half barriers and light signals. The red light has just started flashing, the barriers are still up. A car is driving behind you.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Was bedeutet das rote Blinklicht?', en: 'What does the flashing red light mean?' },
      { de: 'Wo hältst du an?', en: 'Where do you stop?' },
      { de: 'Wann darfst du weiterfahren?', en: 'When may you drive on?' },
    ],
    keyPoints: [
      { id: 'approach', area: 'speed', label: { de: 'Mit mäßiger Geschwindigkeit und bremsbereit heranfahren', en: 'Approach at moderate speed, ready to brake' }, patterns: [...SLOW, 'maessig', 'bremsbereit', 'moderate', 'ready to brake'] },
      { id: 'red', area: 'observation', severe: true, label: { de: 'Rotes Blinklicht heißt: Halt, ein Zug kommt', en: 'Flashing red means: stop, a train is coming' }, patterns: ['(rot|blink)\\w* .{0,40}(halt|anhalt|stopp|zug)', 'zug .{0,20}(kommt|naht|faehrt)', '(red|flashing)\\w* .{0,40}(stop|halt|train)', 'train (is )?(coming|approaching)'] },
      { id: 'stop', area: 'position', severe: true, label: { de: 'Vor dem Andreaskreuz oder der Haltlinie anhalten, nicht auf den Gleisen', en: 'Stop before the cross or the stop line, not on the tracks' }, patterns: ['vor (dem |der )?(andreaskreuz|halte?linie|schranke|kreuz)', 'nicht auf (den|die) (gleise|schienen)', '(before|in front of|at) the (cross|stop line|barrier|line)', 'not on the (tracks|rails)', 'clear of the (tracks|rails)'] },
      { id: 'priority', area: 'speed', label: { de: 'Der Zug hat immer Vorrang', en: 'The train always has priority' }, patterns: ['(zug|bahn|schiene)\\w* .{0,30}(vorrang|vorfahrt|immer)', 'train\\w* .{0,30}(priority|right of way|always)'] },
      { id: 'noOvertake', area: 'position', label: { de: 'Vor dem Bahnübergang nicht überholen', en: 'No overtaking before the crossing' }, allowNegation: true, patterns: ['(nicht|kein) .{0,10}ueberhol', 'ueberhol\\w* .{0,30}nicht', 'ueberholverbot', '(not|no|dont|don t|never) .{0,10}overtak'] },
      { id: 'proceed', area: 'observation', label: { de: 'Erst weiterfahren, wenn das Blinklicht aus ist und die Schranken offen sind, und nur wenn dahinter Platz ist', en: 'Only drive on when the light is off and the barriers are open, and only if there is space beyond' }, patterns: ['(erst|wenn|sobald|nachdem) .{0,40}(aus|erlischt|offen|oben|hoch|frei)', '(platz|raum|stau) .{0,30}(dahinter|hinter dem|jenseits)', '(only|once|when|after) .{0,40}(off|stops flashing|open|up|raised|clear)', '(space|room|queue) .{0,30}(beyond|after|other side|behind the crossing)'] },
      { id: 'lookTracks', area: 'observation', label: { de: 'Vor dem Überqueren nach links und rechts auf die Gleise schauen (Gegenzug)', en: 'Look left and right along the tracks before crossing (a second train)' }, patterns: ['(links und rechts|rechts und links) .{0,30}(gleis|schiene|zug)', '(gleis|schiene)\\w* .{0,30}(links und rechts|rechts und links|beide)', 'gegenzug', 'zweite\\w* zug', '(left and right|right and left|both directions) .{0,30}(track|rail|train)', '(track|rail)\\w* .{0,30}(left and right|right and left|both directions)', 'second train', 'another train'] },
    ],
    contradictions: [
      { patterns: ['(schnell|zuegig|noch) .{0,15}(rueber|drueber|ueber die|hinueber)', '(bevor|ehe) .{0,20}(schranke|sich senkt|zu)', 'schaff', '(quickly|still|before the barrier) .{0,20}(cross|across|over|make it)', 'make it (across|over)', 'beat the (train|barrier)'], hint: { de: 'Niemals bei Blinklicht noch über den Übergang fahren, auch wenn die Schranken oben sind. Ein Zug braucht Hunderte Meter zum Bremsen.', en: 'Never cross while the light is flashing, even with the barriers still up. A train needs hundreds of metres to stop.' } },
    ],
    steps: [
      { de: 'Mit mäßiger Geschwindigkeit und bremsbereit heranfahren', en: 'Approach at moderate speed, ready to brake' },
      { de: 'Rotes Blinklicht erkennen: Halt, ein Zug kommt', en: 'See the flashing red: stop, a train is coming' },
      { de: 'Innenspiegel, früh und sanft bremsen (Auto hinter dir)', en: 'Interior mirror, brake early and gently (car behind you)' },
      { de: 'Vor der Haltlinie oder dem Andreaskreuz anhalten', en: 'Stop before the stop line or the cross' },
      { de: 'Warten, bis das Blinklicht aus ist und die Schranken wieder oben sind', en: 'Wait until the light is off and the barriers are up again' },
      { de: 'Nach links und rechts auf die Gleise schauen, nur weiterfahren, wenn hinter dem Übergang Platz ist', en: 'Look left and right along the tracks, only drive on if there is space beyond the crossing' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Schnell noch rüberfahren, die Schranken sind ja noch oben', en: 'Quickly cross, the barriers are still up' }, why: { de: 'Rotes Blinklicht bedeutet Halt, unabhängig von der Schranke. Der Zug ist schon unterwegs.', en: 'Flashing red means stop, regardless of the barrier. The train is already on its way.' } },
      { area: 'position', severe: true, text: { de: 'Bei Stau direkt hinter dem Vordermann auf den Gleisen anhalten', en: 'In a queue, stop right behind the car ahead, on the tracks' }, why: { de: 'Auf den Gleisen darfst du nie stehen. Bei Stau fährst du erst auf den Übergang, wenn du ihn sicher wieder verlassen kannst.', en: 'You must never stand on the tracks. In a queue you only enter the crossing when you can clear it for sure.' } },
    ],
    modelAnswer: {
      de: 'Ich fahre mit mäßiger Geschwindigkeit und bremsbereit heran und überhole vor dem Bahnübergang nicht. Das rote Blinklicht bedeutet Halt, ein Zug kommt, und der Zug hat immer Vorrang. Ich schaue in den Innenspiegel wegen des Autos hinter mir, bremse früh und sanft und halte vor der Haltlinie an, damit ich nicht auf den Gleisen stehe. Ich fahre erst weiter, wenn das Blinklicht aus ist und die Schranken wieder oben sind, und nur, wenn hinter dem Übergang Platz ist. Vorher schaue ich nach links und rechts auf die Gleise, weil ein zweiter Zug kommen kann.',
      en: 'I approach at moderate speed, ready to brake, and I do not overtake before the crossing. The flashing red light means stop, a train is coming, and the train always has priority. I check the interior mirror because of the car behind me, brake early and gently and stop before the stop line so that I stay clear of the tracks. I only drive on once the light is off and the barriers are up again, and only if there is space beyond the crossing. Before that I look left and right along the tracks, because a second train may come.',
    },
    law: { de: '§ 19 StVO: Schienenfahrzeuge haben Vorrang. Bahnübergängen nähert man sich mit mäßiger Geschwindigkeit. Warten muss, wer rotes Blinklicht, gelbes oder rotes Licht sieht oder wenn sich die Schranken senken oder geschlossen sind. Zwischen Zeichen 151 (Bahnübergang) und dem Übergang darf nicht überholt werden. § 11 Abs. 1 StVO sinngemäß: Nicht auf den Übergang fahren, wenn man dort warten müsste.', en: '§ 19 StVO: rail vehicles have priority. Approach level crossings at moderate speed. You must wait at flashing red, at amber or red lights, or when the barriers are lowering or closed. Between the level-crossing sign 151 and the crossing, overtaking is prohibited. § 11 (1) StVO by analogy: do not enter the crossing if you would have to wait on it.' },
    miniTest: {
      question: { de: 'Die Schranken sind oben, kein Licht blinkt, aber hinter dem Übergang steht ein Stau bis an die Gleise. Was tust du?', en: 'The barriers are up, no light is flashing, but a queue beyond the crossing reaches back to the tracks. What do you do?' },
      options: [
        { de: 'Vor dem Übergang warten, bis dahinter Platz ist', en: 'Wait before the crossing until there is space beyond it' },
        { de: 'Auf die Gleise fahren und im Stau mitwarten', en: 'Drive onto the tracks and wait in the queue' },
        { de: 'Langsam auf den Übergang fahren und hupen', en: 'Drive slowly onto the crossing and honk' },
      ],
      correct: 0,
      explanation: { de: 'Du darfst nur auf den Übergang fahren, wenn du ihn sicher verlassen kannst. Sonst wartest du davor.', en: 'You may only enter the crossing if you can leave it for sure. Otherwise you wait before it.' },
    },
  },
  {
    id: 'strassenbahnhaltestelle',
    free: false,
    title: { de: 'Straßenbahn an der Haltestelle ohne Insel', en: 'Tram at a stop without an island' },
    situation: {
      de: 'Stadtstraße. Die Gleise liegen in der Fahrbahnmitte. Vor dir hält eine Straßenbahn an einer Haltestelle ohne Haltestelleninsel. Fahrgäste steigen aus und gehen über deinen Fahrstreifen zum Gehweg.',
      en: 'City road. The tram tracks run in the middle of the road. Ahead, a tram has stopped at a stop without a platform island. Passengers get off and walk across your lane to the pavement.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Darfst du an der haltenden Straßenbahn vorbeifahren?', en: 'May you pass the stopped tram?' },
      { de: 'Wie schnell, und mit welchem Abstand?', en: 'How fast, and at what distance?' },
      { de: 'Was gilt für die Fahrgäste?', en: 'What applies to the passengers?' },
    ],
    keyPoints: [
      { id: 'recognise', area: 'observation', label: { de: 'Haltende Bahn ohne Insel erkennen: Fahrgäste kommen über die Fahrbahn', en: 'Notice the stopped tram without an island: passengers cross the road' }, patterns: ['(keine|ohne) (haltestellen)?insel', 'fahrgaest', 'steig', 'ueber (die|meine|den) (fahrbahn|spur|fahrstreifen)', '(no|without an?) island', 'passenger', 'getting (off|on)', 'cross\\w* (my|the) (lane|road)'] },
      { id: 'walking', area: 'speed', severe: true, label: { de: 'Nur mit Schrittgeschwindigkeit rechts vorbeifahren', en: 'Pass on the right only at walking speed' }, patterns: ['schritt', 'walking (pace|speed)', 'sehr langsam', 'ganz langsam', 'very slow'] },
      { id: 'distance', area: 'position', label: { de: 'So viel Abstand, dass niemand gefährdet wird', en: 'Enough distance that nobody is endangered' }, patterns: ['abstand', 'distance', 'space', 'clearance', 'gap', 'room'] },
      { id: 'passengers', area: 'observation', severe: true, label: { de: 'Ein- und aussteigende Fahrgäste nicht behindern oder gefährden, wenn nötig warten', en: 'Do not hinder or endanger passengers getting on or off, wait if necessary' }, patterns: ['fahrgaest\\w* .{0,40}(nicht behinder|nicht gefaehrd|vorrang|vortritt|warte|lass|gehen)', '(warte|lasse) .{0,40}(fahrgaest|aussteig|einsteig)', 'passenger\\w* .{0,40}(not (be )?(hinder|endanger)|priority|first|wait|let|go|cross)', '(wait for|let) .{0,30}passenger', 'nobody .{0,20}(hindered|endangered)', ...STOP_WAIT] },
      { id: 'noLeft', area: 'position', label: { de: 'Nicht links an der Bahn vorbei, nur wenn die Gleise zu weit rechts liegen', en: 'Not past the tram on the left, only if the tracks are too far right' }, allowNegation: true, patterns: ['(nicht|kein|nie) .{0,15}links (vorbei|ueberhol)', 'links .{0,15}(nicht|verboten|unzulaessig)', 'rechts (an ihr |daran |an der bahn )?vorbei', '(not|never|no) .{0,15}(on|to) the left', 'pass\\w* .{0,15}on the right', 'on the right (side)?'] },
    ],
    contradictions: [
      { patterns: ['(normal|zuegig|schnell|30|50) .{0,15}vorbei', '(pass|drive) .{0,15}(quickly|normally|briskly)', 'hupe', 'honk'], hint: { de: 'An einer haltenden Straßenbahn ohne Insel nur mit Schrittgeschwindigkeit vorbei.', en: 'Past a stopped tram without an island only at walking speed.' } },
      { patterns: ['links (an ihr |daran |an der bahn |an der strassenbahn )?(vorbei|ueberhol)', 'ueberhole .{0,20}links', '(pass|overtake) .{0,20}on the left'], hint: { de: 'Schienenfahrzeuge werden rechts überholt. Links nur, wenn die Gleise so weit rechts liegen, dass rechts kein Platz ist.', en: 'Rail vehicles are passed on the right. Left only when the tracks are so far right that there is no room on the right.' } },
    ],
    steps: [
      { de: 'Haltende Bahn ohne Insel erkennen', en: 'Notice the stopped tram without an island' },
      { de: 'Auf Schrittgeschwindigkeit verlangsamen', en: 'Slow down to walking speed' },
      { de: 'Aussteigende Fahrgäste über die Fahrbahn gehen lassen', en: 'Let passengers walk across the road' },
      { de: 'Wenn nötig anhalten und warten', en: 'Stop and wait if necessary' },
      { de: 'Rechts mit viel Abstand vorbeifahren', en: 'Pass on the right with plenty of distance' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Mit 30 km/h vorbeifahren, solange gerade niemand auf der Straße ist', en: 'Pass at 30 km/h while nobody is in the road' }, why: { de: 'Solange Fahrgäste ein- oder aussteigen, gilt Schrittgeschwindigkeit, und ohne Insel treten sie direkt auf deine Fahrbahn.', en: 'While passengers are getting on or off, walking speed applies, and without an island they step straight onto your lane.' } },
      { area: 'position', severe: true, text: { de: 'Links an der Bahn vorbeifahren', en: 'Pass the tram on the left' }, why: { de: 'Schienenfahrzeuge werden rechts überholt, links nur in Ausnahmefällen.', en: 'Rail vehicles are passed on the right, left only in exceptional cases.' } },
    ],
    modelAnswer: {
      de: 'Die Straßenbahn hält an einer Haltestelle ohne Insel, die Fahrgäste kommen über meine Fahrbahn. Ich darf rechts an ihr vorbei, aber nur mit Schrittgeschwindigkeit und mit so viel Abstand, dass niemand gefährdet wird. Die aussteigenden Fahrgäste lasse ich gehen, ich behindere sie nicht. Wenn nötig, halte ich an und warte. Ich fahre nicht links an der Bahn vorbei.',
      en: 'The tram has stopped at a stop without an island, the passengers cross my lane. I may pass it on the right, but only at walking speed and with enough distance that nobody is endangered. I let the passengers getting off go, I do not hinder them. If necessary I stop and wait. I do not pass the tram on the left.',
    },
    law: { de: '§ 20 Abs. 1 StVO: An haltenden Straßenbahnen und Linienbussen darf, auch im Gegenverkehr, nur vorsichtig vorbeigefahren werden. § 20 Abs. 2 StVO: Steigen Fahrgäste ein oder aus, darf rechts nur mit Schrittgeschwindigkeit und nur in so großem Abstand vorbeigefahren werden, dass eine Gefährdung ausgeschlossen ist. Ein- und Aussteigende dürfen nicht behindert werden; wenn nötig ist zu warten. § 5 Abs. 7 StVO: Schienenfahrzeuge werden rechts überholt.', en: '§ 20 (1) StVO: pass stopped trams and scheduled buses carefully, also from the opposite direction. § 20 (2) StVO: while passengers get on or off, you may pass on the right only at walking speed and at a distance that rules out danger. People getting on and off must not be hindered; wait if necessary. § 5 (7) StVO: rail vehicles are passed on the right.' },
    miniTest: {
      question: { de: 'Die Straßenbahn fährt wieder an, die Türen sind zu, kein Fahrgast mehr auf der Straße. Was gilt jetzt?', en: 'The tram pulls away, doors closed, no passenger in the road any more. What applies now?' },
      options: [
        { de: 'Weiter Schrittgeschwindigkeit, bis ich die Haltestelle passiert habe', en: 'Keep walking speed until I have passed the stop' },
        { de: 'Normal weiterfahren, Fahrgäste beachten, die noch nachkommen könnten', en: 'Continue normally, watching for late passengers' },
        { de: 'Die Bahn sofort links überholen', en: 'Overtake the tram on the left at once' },
      ],
      correct: 1,
      explanation: { de: 'Die Schrittgeschwindigkeit gilt für die haltende Bahn. Fährt sie an, fährst du angepasst weiter und achtest auf Nachzügler.', en: 'Walking speed applies to the stopped tram. Once it moves off you continue at an adapted speed and watch for latecomers.' },
    },
  },
  {
    id: 'radfahrer-ueberholen',
    free: false,
    title: { de: 'Radfahrer überholen', en: 'Overtaking a cyclist' },
    situation: {
      de: 'Landstraße, Tempo 100. Vor dir fährt ein Radfahrer mit etwa 20 km/h am rechten Rand. Die Straße ist schmal, in der Ferne kommt dir ein Auto entgegen.',
      en: 'Country road, 100 km/h limit. A cyclist is riding at about 20 km/h on the right edge ahead of you. The road is narrow, and a car is coming towards you in the distance.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus. Wenn es die Verkehrslage zulässt, dürfen Sie überholen.', en: 'Please continue straight ahead. If the traffic situation allows it, you may overtake.' },
    questions: [
      { de: 'Wie viel Seitenabstand brauchst du hier?', en: 'How much side distance do you need here?' },
      { de: 'Was muss passen, bevor du überholst?', en: 'What has to be right before you overtake?' },
      { de: 'Was tust du, wenn es nicht geht?', en: 'What do you do if it is not possible?' },
    ],
    keyPoints: [
      { id: 'distance', area: 'position', severe: true, label: { de: 'Außerorts mindestens 2 m Seitenabstand (innerorts 1,5 m)', en: 'Outside town at least 2 m side distance (1.5 m in town)' }, patterns: ['2 ?m', 'zwei meter', '1 ?5 ?m', 'anderthalb', 'two met', '1 5 met', 'one and a half'] },
      { id: 'oncoming', area: 'observation', severe: true, label: { de: 'Nur überholen, wenn der Gegenverkehr es zulässt und die Strecke übersichtlich ist', en: 'Only overtake when oncoming traffic allows it and the view is clear' }, patterns: ['gegenverkehr', 'uebersicht', 'einseh', 'frei(e)? (strecke|sicht|strasse)', 'oncoming', 'clear (view|road|stretch)', 'can see (far|ahead)', 'visibility'] },
      { id: 'wait', area: 'speed', label: { de: 'Sonst hinter dem Radfahrer bleiben und warten', en: 'Otherwise stay behind the cyclist and wait' }, patterns: ['hinter .{0,20}(radfahr|ihm|bleib)', 'dahinter bleib', 'warte', 'abwarten', '(stay|remain|wait) behind', '\\bwait', 'hold back'] },
      { id: 'keepDistance', area: 'position', label: { de: 'Dahinter genug Abstand halten und mit Schlenkern rechnen', en: 'Keep enough distance behind him and expect swerving' }, patterns: ['(genug|ausreichend|grossen|viel) abstand', 'abstand .{0,30}(hinter|zum radfahr|zu ihm)', 'schlenker', 'ausweich', 'schlagloch', 'enough distance', 'distance behind', 'swerv', 'wobbl', 'pothole'] },
      { id: 'check', area: 'observation', label: { de: 'Spiegel, links blinken, Schulterblick', en: 'Mirrors, indicate left, shoulder check' }, patterns: [...MIRROR, 'blink', 'indicat', 'signal', ...SHOULDER] },
      { id: 'brisk', area: 'speed', label: { de: 'Zügig überholen, aber höchstens 100 km/h', en: 'Overtake briskly, but at most 100 km/h' }, patterns: ['zuegig', 'schnell', 'kurz', 'beschleunig', 'brisk', 'quick', 'accelerat', 'decisive', 'promptly'] },
      { id: 'return', area: 'position', label: { de: 'Erst wieder einordnen, wenn der Radfahrer im Innenspiegel ganz zu sehen ist', en: 'Only move back in once the cyclist is fully visible in the interior mirror' }, patterns: ['(wieder )?einordn', 'einscher', '(rechts )?blink\\w* .{0,20}(rechts|zurueck|wieder)', 'nicht schneid', 'ohne .{0,10}schneid', 'move (back )?in', 'pull (back )?in', 'return to (my|the) lane', '(not|without) cutting'] },
    ],
    contradictions: [
      { patterns: ['(dicht|knapp|eng) .{0,20}vorbei', '(halben|1 ?m|einen meter)', 'close(ly)? past', 'one met', 'half a met', 'squeeze'], hint: { de: 'Zu wenig Abstand: Außerorts sind 2 m Pflicht, innerorts 1,5 m.', en: 'Too little distance: 2 m is mandatory outside town, 1.5 m in town.' } },
      { patterns: ['trotz (des )?gegenverkehr', 'obwohl .{0,20}entgegen', 'despite (the )?oncoming', 'even though .{0,20}oncoming', 'hupe', 'honk'], hint: { de: 'Mit Gegenverkehr und 2 m Abstand reicht die schmale Straße nicht. Dann wartest du.', en: 'With oncoming traffic and 2 m of distance, the narrow road is not wide enough. Then you wait.' } },
    ],
    steps: [
      { de: 'Hinter dem Radfahrer bleiben, Abstand halten', en: 'Stay behind the cyclist, keep your distance' },
      { de: 'Prüfen: Strecke übersichtlich, Gegenverkehr lässt es zu, kein Überholverbot', en: 'Check: clear view, oncoming traffic allows it, no overtaking ban' },
      { de: 'Innenspiegel, Außenspiegel, links blinken, Schulterblick', en: 'Interior mirror, side mirror, indicate left, shoulder check' },
      { de: 'Mit mindestens 2 m Seitenabstand zügig vorbei', en: 'Pass briskly with at least 2 m of side distance' },
      { de: 'Radfahrer im Innenspiegel ganz sehen, rechts blinken, einordnen', en: 'See the whole cyclist in the interior mirror, indicate right, move back in' },
    ],
    mistakes: [
      { area: 'position', severe: true, text: { de: 'Mit einem Meter Abstand in der eigenen Spur vorbeifahren', en: 'Pass within your own lane with one metre of distance' }, why: { de: 'Außerorts sind mindestens 2 m Seitenabstand vorgeschrieben. Das geht auf einer schmalen Straße nur über die Gegenfahrbahn.', en: 'Outside town at least 2 m of side distance is required. On a narrow road that only works by using the oncoming lane.' } },
      { area: 'observation', severe: true, text: { de: 'Trotz Gegenverkehr überholen, der Radfahrer ist ja langsam', en: 'Overtake despite the oncoming car, the cyclist is slow' }, why: { de: 'Mit Gegenverkehr bleibt kein Platz für 2 m Abstand. Du wartest, bis die Gegenfahrbahn frei ist.', en: 'With oncoming traffic there is no room for 2 m of distance. You wait until the oncoming lane is clear.' } },
    ],
    modelAnswer: {
      de: 'Ich bleibe zunächst mit genug Abstand hinter dem Radfahrer und warte, denn er kann einen Schlenker machen. Außerorts brauche ich mindestens 2 m Seitenabstand, auf dieser schmalen Straße muss ich dafür auf die Gegenfahrbahn. Ich überhole nur, wenn die Strecke übersichtlich ist und der Gegenverkehr vorbei ist. Dann schaue ich in den Innenspiegel und den Außenspiegel, blinke links, mache einen Schulterblick und überhole zügig, ohne schneller als 100 km/h zu fahren. Erst wenn ich den Radfahrer im Innenspiegel ganz sehe, blinke ich rechts und ordne mich wieder ein, ohne ihn zu schneiden.',
      en: 'First I stay behind the cyclist with enough distance and wait, because he may swerve. Outside town I need at least two metres of side distance, and on this narrow road that means using the oncoming lane. I only overtake when there is a clear view and the oncoming car has passed. Then I check the interior mirror and the side mirror, indicate left, do a shoulder check and overtake briskly, without going faster than 100 km/h. Only when I can see the whole cyclist in the interior mirror do I indicate right and move back in, without cutting in.',
    },
    law: { de: '§ 5 Abs. 4 StVO: Beim Überholen von Radfahrern, Fußgängern und Elektrokleinstfahrzeugen innerorts mindestens 1,5 m, außerorts mindestens 2 m Seitenabstand. § 5 Abs. 2 StVO: Überholen nur, wenn jede Behinderung des Gegenverkehrs ausgeschlossen ist und die Übersicht reicht.', en: '§ 5 (4) StVO: when overtaking cyclists, pedestrians and e-scooters, keep at least 1.5 m of side distance in town and at least 2 m outside town. § 5 (2) StVO: overtake only when any hindrance to oncoming traffic is ruled out and the view is sufficient.' },
    miniTest: {
      question: { de: 'Innerorts überholst du einen Radfahrer. Wie viel Seitenabstand ist mindestens vorgeschrieben?', en: 'In town you overtake a cyclist. What is the minimum side distance required?' },
      options: [
        { de: '1 Meter', en: '1 metre' },
        { de: '1,5 Meter', en: '1.5 metres' },
        { de: '2 Meter', en: '2 metres' },
      ],
      correct: 1,
      explanation: { de: 'Innerorts mindestens 1,5 m, außerorts mindestens 2 m. Reicht der Platz nicht, darfst du nicht überholen.', en: 'In town at least 1.5 m, outside town at least 2 m. If there is not enough room, you may not overtake.' },
    },
  },
  {
    id: 'tempo-30-zone',
    free: false,
    title: { de: 'Tempo-30-Zone', en: '30 km/h zone' },
    situation: {
      de: 'Du biegst von einer Hauptstraße in ein Wohngebiet ab. Am Anfang steht das Schild „Zone 30“. Links und rechts parken Autos, ein Ball rollt zwischen den parkenden Autos hervor. An den Kreuzungen stehen keine Schilder.',
      en: 'You turn off a main road into a residential area. At the entrance is the sign "Zone 30". Cars are parked on both sides, and a ball rolls out from between the parked cars. There are no signs at the junctions.',
    },
    examiner: { de: 'Fahren Sie bitte durch das Wohngebiet, an der dritten Kreuzung rechts.', en: 'Please drive through the residential area and turn right at the third junction.' },
    questions: [
      { de: 'Was bedeutet das Zonenschild, und wie lange gilt es?', en: 'What does the zone sign mean, and how long does it apply?' },
      { de: 'Welche Vorfahrtsregel gilt an den Kreuzungen?', en: 'Which right-of-way rule applies at the junctions?' },
      { de: 'Was bedeutet der Ball für dich?', en: 'What does the ball mean for you?' },
    ],
    keyPoints: [
      { id: 'limit', area: 'speed', severe: true, label: { de: 'Höchstens 30 km/h, bis das Zonenende-Schild kommt', en: 'At most 30 km/h until the end-of-zone sign' }, patterns: ['30', 'dreissig', 'thirty', 'zone'] },
      { id: 'rvl', area: 'observation', severe: true, label: { de: 'In der Zone gilt rechts vor links, an jeder Kreuzung nach rechts schauen', en: 'Right before left applies in the zone, look right at every junction' }, patterns: ['rechts vor links', 'right before left', 'von rechts .{0,30}(vorfahrt|vorrang)', '(from|on) the right .{0,30}(priority|right of way)'] },
      { id: 'ball', area: 'observation', severe: true, label: { de: 'Ball heißt Kind: sofort bremsbereit, Tempo stark reduzieren', en: 'A ball means a child: ready to brake at once, reduce speed sharply' }, patterns: ['kind', 'child', 'kid', 'ball'] },
      { id: 'speed', area: 'speed', label: { de: 'Langsam und bremsbereit zwischen den parkenden Autos', en: 'Slow and ready to brake between the parked cars' }, patterns: [...SLOW, 'bremsbereit', 'ready to brake', 'cover(ing)? the brake'] },
      { id: 'parked', area: 'observation', label: { de: 'Mit Sichtbehinderung durch parkende Autos rechnen', en: 'Expect the parked cars to block your view' }, patterns: ['park', 'sicht', 'verdeckt', 'lueck', '(blocked|limited|poor) (view|visibility)', 'cannot see', 'can t see', 'gaps? between'] },
      { id: 'doorDistance', area: 'position', label: { de: 'Etwa 1 m Abstand zu den parkenden Autos, an Kreuzungen langsam vortasten', en: 'About 1 m from the parked cars, edge forward slowly at junctions' }, patterns: ['1 ?m', 'einen meter', 'ein meter', 'abstand .{0,30}park', 'park\\w* .{0,30}abstand', 'tuer', 'vortast', 'herantast', 'one met', '1 met', 'distance .{0,30}parked', 'parked .{0,30}distance', 'door', 'edge forward', 'creep', 'inch forward'] },
      { id: 'signal', area: 'communication', label: { de: 'Vor dem Rechtsabbiegen Spiegel, blinken, Schulterblick', en: 'Before turning right: mirrors, indicate, shoulder check' }, patterns: ['blink', 'indicat', 'signal', ...SHOULDER] },
    ],
    contradictions: [
      { patterns: ['(40|50) ?km', 'mit 50', 'at 50', 'forty', 'fifty'], hint: { de: 'In der Zone gilt 30 km/h, bis das Ende der Zone angezeigt wird.', en: 'In the zone 30 km/h applies until the end of the zone is signed.' } },
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', '(breite|meine) strasse .{0,20}vorfahrt'], hint: { de: 'Ohne Schilder gilt rechts vor links, auch wenn deine Straße breiter aussieht.', en: 'Without signs, right before left applies, even if your road looks wider.' } },
    ],
    steps: [
      { de: 'Zone-30-Schild erkennen: ab hier höchstens 30 km/h', en: 'See the Zone 30 sign: at most 30 km/h from here' },
      { de: 'Ball: sofort bremsbereit, mit einem Kind rechnen', en: 'Ball: ready to brake at once, expect a child' },
      { de: 'Langsam mit etwa 1 m Abstand zu den parkenden Autos fahren, Lücken beobachten', en: 'Drive slowly about 1 m from the parked cars, watch the gaps' },
      { de: 'An jeder Kreuzung rechts vor links: langsam vortasten, nach rechts schauen', en: 'At every junction right before left: edge forward slowly, look right' },
      { de: 'Vor der dritten Kreuzung Spiegel, rechts blinken, rechts einordnen, Schulterblick', en: 'Before the third junction: mirrors, indicate right, keep right, shoulder check' },
      { de: 'Rechts abbiegen', en: 'Turn right' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Weiter mit 50 km/h, das Schild galt nur für die erste Straße', en: 'Carry on at 50 km/h, the sign only applied to the first street' }, why: { de: 'Das Zonenschild gilt für das ganze Gebiet bis zum Zonenende-Schild.', en: 'The zone sign applies to the whole area until the end-of-zone sign.' } },
      { area: 'observation', severe: true, text: { de: 'Am Ball vorbeifahren, es ist ja kein Kind zu sehen', en: 'Drive past the ball, no child is in sight' }, why: { de: 'Hinter einem Ball kommt oft ein Kind. Du bremst sofort und fährst nur noch Schrittgeschwindigkeit, bis die Lage klar ist.', en: 'A child often follows a ball. You brake at once and keep to walking speed until the situation is clear.' } },
    ],
    modelAnswer: {
      de: 'Das Schild Zone 30 bedeutet, dass im ganzen Gebiet höchstens 30 km/h gilt, bis das Zonenende-Schild kommt. Der Ball zwischen den parkenden Autos bedeutet, dass ein Kind hinterherlaufen kann, also bremse ich sofort und fahre langsam und bremsbereit weiter. Die parkenden Autos nehmen mir die Sicht, deshalb beobachte ich die Lücken, halte etwa einen Meter Abstand zu den parkenden Autos und taste mich an den Kreuzungen langsam vor. An den Kreuzungen gibt es keine Schilder, es gilt rechts vor links, ich schaue an jeder Kreuzung nach rechts. Vor der dritten Kreuzung schaue ich in die Spiegel, blinke rechts, mache einen Schulterblick und biege ab.',
      en: 'The Zone 30 sign means at most 30 km/h applies in the whole area until the end-of-zone sign. The ball between the parked cars means a child may run after it, so I brake at once and continue slowly, ready to brake. The parked cars block my view, so I watch the gaps, keep about one metre from the parked cars and edge forward slowly at the junctions. There are no signs at the junctions, right before left applies, and I look right at every junction. Before the third junction I check the mirrors, indicate right, do a shoulder check and turn.',
    },
    law: { de: 'Zeichen 274.1 (Beginn einer Tempo-30-Zone): Höchstgeschwindigkeit 30 km/h bis Zeichen 274.2. In Tempo-30-Zonen gibt es in der Regel keine Vorfahrtsschilder (§ 45 Abs. 1c StVO), also gilt rechts vor links (§ 8 Abs. 1 StVO). § 3 Abs. 2a StVO: Gegenüber Kindern durch Verminderung der Geschwindigkeit und Bremsbereitschaft eine Gefährdung ausschließen.', en: 'Sign 274.1 (start of a 30 zone): maximum speed 30 km/h until sign 274.2. 30 zones normally have no priority signs (§ 45 (1c) StVO), so right before left applies (§ 8 (1) StVO). § 3 (2a) StVO: towards children, rule out danger by reducing speed and being ready to brake.' },
    miniTest: {
      question: { de: 'In der Tempo-30-Zone kommt eine Kreuzung mit einem Auto von links. Schilder gibt es keine. Wer fährt zuerst?', en: 'In the 30 zone you reach a junction with a car coming from the left. There are no signs. Who goes first?' },
      options: [
        { de: 'Das Auto von links, in Zonen gilt links vor rechts', en: 'The car from the left, in zones left before right applies' },
        { de: 'Du, denn du kommst für das andere Auto von rechts', en: 'You, because for the other car you come from the right' },
        { de: 'Wer zuerst an der Kreuzung ist', en: 'Whoever reaches the junction first' },
      ],
      correct: 1,
      explanation: { de: 'Rechts vor links: Für das Auto von links kommst du von rechts. Fahr trotzdem bremsbereit.', en: 'Right before left: for the car on the left you come from the right. Still drive ready to brake.' },
    },
  },
  {
    id: 'autobahn-verlassen',
    free: false,
    title: { de: 'Die Autobahn verlassen', en: 'Leaving the Autobahn' },
    situation: {
      de: 'Du fährst auf dem rechten Fahrstreifen der Autobahn mit 120 km/h. Die Ankündigungstafel hast du vor 1000 m gesehen, jetzt zeigt die Bake mit drei Streifen: noch 300 m bis zu deiner Ausfahrt. Die Ausfahrt endet in einer engen Kurve.',
      en: 'You are driving in the right lane of the Autobahn at 120 km/h. You saw the advance sign 1000 m ago, and now the three-stripe countdown marker shows 300 m to your exit. The exit ends in a tight bend.',
    },
    examiner: { de: 'Verlassen Sie bitte die Autobahn an der nächsten Ausfahrt.', en: 'Please leave the Autobahn at the next exit.' },
    questions: [
      { de: 'Wann blinkst du, und wann bremst du?', en: 'When do you indicate, and when do you brake?' },
      { de: 'Wofür ist der Verzögerungsstreifen da?', en: 'What is the deceleration lane for?' },
      { de: 'Warum ist der Blick auf den Tacho wichtig?', en: 'Why is a look at the speedometer important?' },
    ],
    keyPoints: [
      { id: 'early', area: 'observation', label: { de: 'Ankündigungstafel und Baken beachten, früh rechts einordnen', en: 'Note the advance sign and the countdown markers, move to the right early' }, patterns: ['ankuendig', 'tafel', 'bake', '300', 'rechtzeitig', 'frueh', 'rechts (ein|halt|bleib)', 'advance', 'sign', 'marker', 'early', 'in good time', 'right lane', 'keep right'] },
      { id: 'signal', area: 'communication', label: { de: 'Spiegel, rechtzeitig rechts blinken, Schulterblick rechts', en: 'Mirrors, indicate right in good time, shoulder check right' }, patterns: ['blink', 'indicat', 'signal', ...MIRROR, ...SHOULDER] },
      { id: 'noBrake', area: 'speed', severe: true, label: { de: 'Auf der durchgehenden Fahrbahn nicht abbremsen', en: 'Do not brake on the through carriageway' }, allowNegation: true, patterns: ['(nicht|kein|ohne) .{0,25}(brems|verzoeger|langsamer)', '(brems|verzoeger)\\w* .{0,20}(nicht|erst)', '(not|dont|don t|no|never|without) .{0,25}(brak|slow)', '(brake|slow)\\w* .{0,20}(not|only)', 'keep (my|the) speed'] },
      { id: 'decelerate', area: 'speed', severe: true, label: { de: 'Erst auf dem Verzögerungsstreifen das Tempo reduzieren', en: 'Only reduce speed on the deceleration lane' }, patterns: ['(verzoegerungs|ausfaedelungs|ausfahr)\\w* .{0,40}(brems|langsam|reduz|tempo|verzoeger)', '(brems|langsam|reduz|verzoeger)\\w* .{0,40}(verzoegerungs|ausfaedelungs|ausfahr|streifen)', '(deceleration|exit|slip) (lane|road)\\w* .{0,40}(brak|slow|reduc|speed)', '(brak|slow|reduc)\\w* .{0,40}(deceleration|exit|slip) (lane|road)'] },
      { id: 'tacho', area: 'observation', label: { de: 'Auf den Tacho schauen: Nach der Autobahn täuscht das Gefühl', en: 'Look at the speedometer: after the Autobahn your sense of speed is off' }, patterns: ['tacho', 'speedo', 'gefuehl', 'taeusch', 'unterschaetz', 'feels? slow', 'misjudg', 'underestimat', 'sense of speed'] },
      { id: 'curve', area: 'speed', label: { de: 'Tempo für die enge Kurve anpassen', en: 'Adapt speed for the tight bend' }, patterns: ['kurve', 'bend', 'curve', 'turn at the end'] },
    ],
    contradictions: [
      { patterns: ['(auf|noch auf) der (autobahn|fahrbahn|rechten spur) .{0,20}(brems|langsam)', '(brems|langsam)\\w* .{0,20}(schon |bereits )?(vor|auf) der (autobahn|ausfahrt|fahrbahn)', '(brake|slow) .{0,20}(on|before) the (autobahn|motorway|highway|main carriageway)', 'before (reaching|the start of) the (exit|deceleration)'], hint: { de: 'Nicht auf der Autobahn bremsen: Der Verkehr hinter dir rechnet nicht damit. Verzögert wird auf dem Verzögerungsstreifen.', en: 'Do not brake on the Autobahn: traffic behind you does not expect it. You slow down on the deceleration lane.' } },
      { patterns: ['(spaet|kurz vor|erst an der ausfahrt) .{0,20}(rueber|wechsel|einordn)', 'last (moment|second)', 'cut across', 'ueber die sperrflaeche', 'over the (hatched|chevron)'], hint: { de: 'Zu späte Spurwechsel oder Fahren über die Sperrfläche sind gefährlich und ein schwerer Fehler.', en: 'Late lane changes or driving over the hatched area are dangerous and a severe mistake.' } },
    ],
    steps: [
      { de: 'Ankündigungstafel und Baken: im rechten Fahrstreifen bleiben', en: 'Advance sign and countdown markers: stay in the right lane' },
      { de: 'Spiegel, rechtzeitig rechts blinken', en: 'Mirrors, indicate right in good time' },
      { de: 'Schulterblick rechts, mit unverändertem Tempo auf den Verzögerungsstreifen wechseln', en: 'Shoulder check right, move onto the deceleration lane without changing speed' },
      { de: 'Erst dort bremsen, Tacho im Blick', en: 'Brake only there, eye on the speedometer' },
      { de: 'Tempo für die enge Kurve anpassen', en: 'Adapt speed for the tight bend' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Schon auf der Autobahn auf 80 km/h abbremsen', en: 'Brake down to 80 km/h while still on the Autobahn' }, why: { de: 'Auf der durchgehenden Fahrbahn wird nicht gebremst. Das Tempo nimmst du auf dem Verzögerungsstreifen weg.', en: 'You do not brake on the through carriageway. You lose the speed on the deceleration lane.' } },
      { area: 'position', severe: true, text: { de: 'Im letzten Moment über die Sperrfläche in die Ausfahrt ziehen', en: 'Pull across the hatched area into the exit at the last moment' }, why: { de: 'Sperrflächen dürfen nicht befahren werden, und der späte Wechsel gefährdet den Verkehr hinter dir.', en: 'Hatched areas must not be driven on, and the late change endangers the traffic behind you.' } },
    ],
    modelAnswer: {
      de: 'Ich beachte die Ankündigungstafel und die Baken und bleibe früh im rechten Fahrstreifen. Ich schaue in die Spiegel, blinke rechtzeitig rechts und mache einen Schulterblick nach rechts. Auf der durchgehenden Fahrbahn bremse ich nicht, ich wechsle mit unverändertem Tempo auf den Verzögerungsstreifen und reduziere erst dort das Tempo. Dabei schaue ich auf den Tacho, weil mich das Gefühl nach der Autobahn täuscht. Für die enge Kurve am Ende der Ausfahrt passe ich das Tempo an.',
      en: 'I note the advance sign and the countdown markers and stay in the right lane early. I check the mirrors, indicate right in good time and do a shoulder check to the right. I do not brake on the through carriageway, I move onto the deceleration lane at the same speed and only reduce speed there. While doing so I look at the speedometer, because after the Autobahn my sense of speed is off. For the tight bend at the end of the exit I adapt my speed.',
    },
    law: { de: '§ 7 Abs. 5 StVO: Den Fahrstreifenwechsel rechtzeitig und deutlich ankündigen. § 7a Abs. 3 StVO: Auf dem Ausfädelungsstreifen (Verzögerungsstreifen) darf langsamer gefahren werden als auf der durchgehenden Fahrbahn. § 18 Abs. 7 und 10 StVO: Wenden und Rückwärtsfahren sind verboten, die Autobahn wird nur an gekennzeichneten Ausfahrten (Zeichen 333) verlassen. Zeichen 448 (Ankündigungstafel, 1000 m) und 450 (Baken, 300/200/100 m). Sperrflächen (Zeichen 298) dürfen nicht befahren werden.', en: '§ 7 (5) StVO: announce the lane change clearly and in good time. § 7a (3) StVO: on the deceleration lane you may drive slower than on the through carriageway. § 18 (7) and (10) StVO: turning around and reversing are prohibited, you leave the Autobahn only at signed exits (sign 333). Sign 448 (advance sign, 1000 m) and 450 (countdown markers, 300/200/100 m). Hatched areas (sign 298) must not be driven on.' },
    miniTest: {
      question: { de: 'Du hast die Ausfahrt verpasst. Was tust du?', en: 'You have missed your exit. What do you do?' },
      options: [
        { de: 'Auf dem Standstreifen zurücksetzen', en: 'Reverse on the hard shoulder' },
        { de: 'Bis zur nächsten Ausfahrt weiterfahren', en: 'Carry on to the next exit' },
        { de: 'Langsam fahren und über die Sperrfläche in die Ausfahrt', en: 'Slow down and cut over the hatched area into the exit' },
      ],
      correct: 1,
      explanation: { de: 'Rückwärtsfahren und Wenden sind auf der Autobahn verboten. Du fährst zur nächsten Ausfahrt.', en: 'Reversing and turning around are prohibited on the Autobahn. You drive on to the next exit.' },
    },
  },
  {
    id: 'ueberholen-landstrasse',
    free: false,
    title: { de: 'Überholen auf der Landstraße', en: 'Overtaking on a country road' },
    situation: {
      de: 'Landstraße, Tempo 100, lange gerade Strecke. Vor dir fährt ein LKW mit 60 km/h. Die Mittellinie ist unterbrochen. Weit vorne, hinter der Geraden, kommt eine Kuppe.',
      en: 'Country road, 100 km/h limit, a long straight stretch. A lorry is driving at 60 km/h ahead of you. The centre line is broken. Far ahead, after the straight, there is a crest.',
    },
    examiner: { de: 'Wenn es sicher geht, überholen Sie bitte den LKW.', en: 'If it is safe, please overtake the lorry.' },
    questions: [
      { de: 'Was prüfst du, bevor du ausscherst?', en: 'What do you check before pulling out?' },
      { de: 'Wie schnell darfst du beim Überholen höchstens fahren?', en: 'What is the maximum speed when overtaking?' },
      { de: 'Wann ist der Überholvorgang beendet?', en: 'When is the overtaking manoeuvre finished?' },
    ],
    keyPoints: [
      { id: 'keepBack', area: 'position', label: { de: 'Vorher genug Abstand zum LKW halten, um die Strecke einsehen zu können', en: 'Keep enough distance behind the lorry to see the road ahead' }, patterns: ['(genug|ausreichend|grossen|viel) abstand', 'abstand .{0,30}(lkw|lastwagen|zum|hinter)', 'nicht (zu )?dicht', 'nicht auffahr', 'enough distance', 'distance behind', 'not (too )?close', 'hang back', 'stay back'] },
      { id: 'view', area: 'observation', severe: true, label: { de: 'Übersicht prüfen: kein Gegenverkehr, Strecke bis zur Kuppe reicht', en: 'Check the view: no oncoming traffic, enough road before the crest' }, patterns: ['gegenverkehr', 'uebersicht', 'einseh', 'frei', 'kuppe', 'reicht', 'oncoming', 'clear', 'crest', 'enough (road|room|distance)', 'can see'] },
      { id: 'allowed', area: 'observation', label: { de: 'Kein Überholverbot: unterbrochene Linie, kein Schild', en: 'No overtaking ban: broken line, no sign' }, patterns: ['unterbrochen', 'ueberholverbot', 'linie', 'schild', 'erlaubt', 'broken', 'dashed', 'overtaking ban', 'no (sign|solid)', 'allowed', 'permitted', 'solid line'] },
      { id: 'check', area: 'observation', severe: true, label: { de: 'Innenspiegel, Außenspiegel, links blinken, Schulterblick', en: 'Interior mirror, side mirror, indicate left, shoulder check' }, patterns: [...MIRROR, 'blink', 'indicat', 'signal', ...SHOULDER] },
      { id: 'speed', area: 'speed', label: { de: 'Zügig mit deutlich höherem Tempo, aber höchstens 100 km/h', en: 'Briskly with clearly higher speed, but at most 100 km/h' }, patterns: ['100', 'hundert', 'hundred', 'zuegig', 'deutlich (schneller|hoeher)', 'wesentlich', 'beschleunig', 'brisk', 'accelerat', 'clearly faster', 'much faster', 'significantly'] },
      { id: 'distance', area: 'position', label: { de: 'Ausreichend Seitenabstand zum LKW', en: 'Enough side distance to the lorry' }, patterns: ['seitenabstand', 'abstand', 'side distance', 'distance', 'space', 'clearance'] },
      { id: 'return', area: 'position', label: { de: 'Rechts blinken und erst einordnen, wenn der LKW ganz im Innenspiegel ist', en: 'Indicate right and move back in only when the whole lorry is in the interior mirror' }, patterns: ['(wieder )?einordn', 'einscher', 'rechts blink', 'nicht schneid', 'ohne .{0,10}schneid', 'move (back )?in', 'pull (back )?in', 'return to (my|the) lane', '(not|without) cutting'] },
    ],
    contradictions: [
      { patterns: ['(110|120|130|140)', 'ueber 100', 'schneller als 100', 'kurz (mal )?schneller', 'over 100', 'faster than 100', 'above 100', 'exceed'], hint: { de: 'Auch beim Überholen gilt die Höchstgeschwindigkeit. Reicht 100 km/h nicht, wird nicht überholt.', en: 'The speed limit applies while overtaking too. If 100 km/h is not enough, you do not overtake.' } },
      { patterns: ['(an|vor|in) der kuppe', '(kurz vor|in) der kurve', '(at|near|before) the crest', 'in the (bend|curve)', 'durchgezogen', 'solid line .{0,20}(cross|over)'], hint: { de: 'An Kuppen, in Kurven und bei durchgezogener Linie ist Überholen verboten, weil du den Gegenverkehr nicht sehen kannst.', en: 'At crests, in bends and across a solid line, overtaking is prohibited, because you cannot see oncoming traffic.' } },
    ],
    steps: [
      { de: 'Übersicht prüfen: Gegenverkehr, Kuppe, Linie, Schilder', en: 'Check the view: oncoming traffic, crest, line, signs' },
      { de: 'Innenspiegel, Außenspiegel, links blinken, Schulterblick', en: 'Interior mirror, side mirror, indicate left, shoulder check' },
      { de: 'Ausscheren und zügig beschleunigen, höchstens 100 km/h', en: 'Pull out and accelerate briskly, at most 100 km/h' },
      { de: 'Mit ausreichendem Seitenabstand vorbeifahren', en: 'Pass with enough side distance' },
      { de: 'LKW ganz im Innenspiegel: rechts blinken, einordnen', en: 'Whole lorry in the interior mirror: indicate right, move back in' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Kurz auf 120 km/h beschleunigen, damit es schneller geht', en: 'Briefly accelerate to 120 km/h to get it done faster' }, why: { de: 'Die Höchstgeschwindigkeit gilt auch beim Überholen. Ein Tempoverstoß ist in der Prüfung ein schwerer Fehler.', en: 'The speed limit applies when overtaking too. Speeding is a severe mistake in the test.' } },
      { area: 'observation', severe: true, text: { de: 'Bei der Kuppe noch überholen, es kam ja lange nichts entgegen', en: 'Still overtake at the crest, nothing has come the other way for ages' }, why: { de: 'Hinter der Kuppe siehst du nichts. Überholen ist dort verboten.', en: 'You cannot see beyond the crest. Overtaking there is prohibited.' } },
    ],
    modelAnswer: {
      de: 'Ich halte vorher genug Abstand zum LKW, damit ich die Strecke einsehen kann. Dann prüfe ich die Übersicht: Es kommt kein Gegenverkehr, und die gerade Strecke reicht bis vor die Kuppe. Die Mittellinie ist unterbrochen und es gibt kein Überholverbot, also ist Überholen erlaubt. Ich schaue in den Innenspiegel und den Außenspiegel, blinke links und mache einen Schulterblick. Dann schere ich aus und beschleunige zügig, aber höchstens auf 100 km/h, und fahre mit ausreichendem Seitenabstand am LKW vorbei. Wenn ich den LKW ganz im Innenspiegel sehe, blinke ich rechts und ordne mich wieder ein, ohne ihn zu schneiden.',
      en: 'First I keep enough distance behind the lorry so that I can see the road ahead. Then I check the view: there is no oncoming traffic, and the straight stretch is long enough, with the crest still far away. The centre line is broken and there is no overtaking ban, so overtaking is allowed. I check the interior mirror and the side mirror, indicate left and do a shoulder check. Then I pull out and accelerate briskly, but to at most 100 km/h, and pass the lorry with enough side distance. When I can see the whole lorry in the interior mirror, I indicate right and move back in, without cutting in.',
    },
    law: { de: '§ 5 StVO: Überholen nur, wenn übersehbar ist, dass während des ganzen Vorgangs jede Behinderung des Gegenverkehrs ausgeschlossen ist, und mit wesentlich höherer Geschwindigkeit. Bei unklarer Verkehrslage, an Kuppen, in unübersichtlichen Kurven und bei Zeichen 276 oder durchgezogener Linie (Fahrstreifenbegrenzung Zeichen 295, einseitig Zeichen 296) ist Überholen verboten. § 3 Abs. 3 StVO: außerorts höchstens 100 km/h für Pkw.', en: '§ 5 StVO: overtake only when it is clear that oncoming traffic will not be hindered during the whole manoeuvre, and at a clearly higher speed. Overtaking is prohibited in unclear situations, at crests, in blind bends and with sign 276 or a solid line (sign 295, one-sided sign 296). § 3 (3) StVO: outside town at most 100 km/h for cars.' },
    miniTest: {
      question: { de: 'Ein Auto vor dir fährt 90 km/h. Darfst du es auf der Landstraße überholen?', en: 'A car ahead of you is doing 90 km/h. May you overtake it on the country road?' },
      options: [
        { de: 'Ja, mit 120 km/h geht das schnell', en: 'Yes, at 120 km/h it is quick' },
        { de: 'Nein, mit höchstens 100 km/h fehlt der nötige Geschwindigkeitsunterschied', en: 'No, at most 100 km/h the necessary speed difference is missing' },
        { de: 'Ja, wenn ich hupe', en: 'Yes, if I honk' },
      ],
      correct: 1,
      explanation: { de: 'Überholen verlangt eine wesentlich höhere Geschwindigkeit, und die 100 km/h darfst du nicht überschreiten. Also bleibst du dahinter.', en: 'Overtaking requires a clearly higher speed, and you may not exceed 100 km/h. So you stay behind.' },
    },
  },
  {
    id: 'reissverschluss',
    free: false,
    title: { de: 'Fahrstreifen endet: Reißverschluss', en: 'Lane ends: the zip rule' },
    situation: {
      de: 'Zweispurige Stadtstraße, dichter Verkehr. Das Schild zeigt: Dein linker Fahrstreifen endet in 200 m. Auf dem rechten Fahrstreifen fahren die Autos langsam hintereinander.',
      en: 'Two-lane city road, dense traffic. The sign shows that your left lane ends in 200 m. In the right lane, cars are driving slowly in a line.',
    },
    examiner: { de: 'Fahren Sie bitte weiter geradeaus.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Wo fädelst du ein: sofort oder am Ende des Fahrstreifens?', en: 'Where do you merge: at once or at the end of the lane?' },
      { de: 'Wer muss wen einfädeln lassen?', en: 'Who has to let whom in?' },
      { de: 'Wie zeigst du den Wechsel an?', en: 'How do you signal the change?' },
    ],
    keyPoints: [
      { id: 'zip', area: 'observation', label: { de: 'Erkennen: Fahrstreifen endet, es gilt das Reißverschlussverfahren', en: 'Recognise: lane ends, the zip rule applies' }, patterns: ['reissverschluss', 'zip', 'zipper', 'abwechselnd', 'alternat', 'in turn', 'one by one', 'take turns'] },
      { id: 'late', area: 'position', label: { de: 'Bis zum Ende des Fahrstreifens fahren, nicht zu früh wechseln', en: 'Drive to the end of the lane, do not change too early' }, patterns: ['bis (zum|ans|an das) ende', 'bis (zur|an die) (engstelle|verengung)', 'unmittelbar vor', 'erst (am|kurz vor dem) ende', 'nicht (zu )?frueh', '(to|until|up to) the end', '(at|right before) the (end|bottleneck|merge point|narrowing)', 'not (too )?early', 'use the (whole|full) lane'] },
      { id: 'signal', area: 'communication', label: { de: 'Rechtzeitig rechts blinken', en: 'Indicate right in good time' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'check', area: 'observation', label: { de: 'Spiegel und Schulterblick nach rechts', en: 'Mirrors and shoulder check to the right' }, patterns: [...MIRROR, ...SHOULDER] },
      { id: 'noForce', area: 'position', severe: true, label: { de: 'Nicht erzwingen: abwechselnd einfädeln, Tempo an die Spur anpassen', en: 'Do not force it: merge in turn, match the speed of the lane' }, patterns: ['nicht (erzwing|draeng|hinein ?zwaeng)', 'ohne (zu )?(erzwing|draeng)', 'erzwing\\w* .{0,10}nichts', 'anpass', 'passe\\w* .{0,30} an\\b', 'luecke', '(not|without|dont|don t) (forc|push|squeez)', 'match', 'adapt', '\\bgap'] },
      { id: 'right', area: 'speed', label: { de: 'Auf dem durchgehenden Streifen: ein Fahrzeug einfädeln lassen', en: 'In the through lane: let one vehicle in' }, patterns: ['(lasse|laesst) .{0,30}(einfaedel|rein|hinein|einscher)', 'ein (auto|fahrzeug) .{0,20}(rein|hinein|einfaedel)', 'durchgehend', '(let|allow) .{0,20}(one|a) (car|vehicle)', 'let .{0,20}(in|merge)', 'through lane'] },
    ],
    contradictions: [
      { patterns: ['(sofort|gleich|so frueh wie moeglich|moeglichst frueh) .{0,20}(wechsel|rueber|einordn|einfaedel)', '(wechsel|rueber|einordn|einfaedel)\\w* .{0,20}(sofort|gleich|moeglichst frueh|so frueh wie moeglich)', '(at once|immediately|as early as possible|straight away) .{0,20}(change|merge|move)', '(change|merge|move) .{0,20}(at once|immediately|as early as possible|straight away)'], hint: { de: 'Zu frühes Einfädeln verschenkt Platz und erzeugt Stau. Der Reißverschluss beginnt erst an der Engstelle.', en: 'Merging too early wastes space and causes queues. The zip starts at the bottleneck.' } },
      { patterns: ['ich habe (die )?vorfahrt', 'muessen mich (rein|hinein)', 'i have (the )?(priority|right of way)', 'they (have to|must) let me'], hint: { de: 'Du hast keine Vorfahrt. Der durchgehende Streifen lässt abwechselnd einen hinein, nicht mehr.', en: 'You have no priority. The through lane lets one in at a time, not more.' } },
    ],
    steps: [
      { de: 'Schild erkennen: linker Streifen endet, Reißverschluss', en: 'See the sign: left lane ends, zip rule' },
      { de: 'Bis zur Engstelle im eigenen Streifen bleiben', en: 'Stay in your own lane up to the bottleneck' },
      { de: 'Spiegel, rechtzeitig rechts blinken', en: 'Mirrors, indicate right in good time' },
      { de: 'Schulterblick rechts, Tempo anpassen', en: 'Shoulder check right, match the speed' },
      { de: 'An der Engstelle abwechselnd einfädeln, ohne zu drängen', en: 'Merge in turn at the bottleneck, without pushing' },
    ],
    mistakes: [
      { area: 'position', text: { de: 'Gleich nach dem Schild rüberwechseln, um sicherzugehen', en: 'Change over right after the sign, to be safe' }, why: { de: 'Das verschenkt 200 m Fahrstreifen und erzeugt Stau. Erlaubt ist es, aber eingefädelt wird am besten erst an der Engstelle.', en: 'That wastes 200 m of lane and causes a queue. It is allowed, but the best place to merge is the bottleneck.' } },
      { area: 'communication', severe: true, text: { de: 'Am Ende hineindrängen, die anderen müssen dich ja lassen', en: 'Push in at the end, the others have to let you' }, why: { de: 'Der Reißverschluss erlaubt dir ein Einfädeln im Wechsel, nicht das Erzwingen. Du passt Tempo und Lücke an.', en: 'The zip rule lets you merge in turn, not force your way in. You match the speed and the gap.' } },
    ],
    modelAnswer: {
      de: 'Das Schild zeigt, dass mein linker Fahrstreifen endet, also gilt das Reißverschlussverfahren. Ich bleibe bis zum Ende des Fahrstreifens in meiner Spur und wechsle nicht zu früh. Ich schaue in die Spiegel, blinke rechtzeitig rechts und mache einen Schulterblick. An der Engstelle fädle ich abwechselnd ein, passe mein Tempo an die rechte Spur an und erzwinge nichts. Wäre ich auf dem durchgehenden Streifen, würde ich ein Fahrzeug einfädeln lassen.',
      en: 'The sign shows that my left lane ends, so the zip rule applies. I stay in my lane until the end of the lane and do not change too early. I check the mirrors, indicate right in good time and do a shoulder check. At the bottleneck I merge in turn, match my speed to the right lane and do not force anything. If I were in the through lane, I would let one vehicle in.',
    },
    law: { de: 'Zeichen 531 (Einengungstafel). § 7 Abs. 4 StVO: Endet ein Fahrstreifen, müssen die Fahrzeuge auf dem durchgehenden Fahrstreifen den Fahrzeugen des endenden Streifens unmittelbar vor Beginn der Verengung den Übergang im Wechsel ermöglichen (Reißverschlussverfahren). § 7 Abs. 5 StVO: Der Fahrstreifenwechsel ist rechtzeitig und deutlich anzukündigen, andere dürfen nicht gefährdet werden.', en: 'Sign 531 (lane reduction). § 7 (4) StVO: where a lane ends, vehicles in the through lane must let vehicles from the ending lane merge in turn immediately before the start of the narrowing (zip rule). § 7 (5) StVO: the lane change must be announced clearly and in good time, and nobody may be endangered.' },
    miniTest: {
      question: { de: 'Du bist auf dem durchgehenden Streifen. An der Engstelle wollen zwei Autos hintereinander vor dir einfädeln. Was tust du?', en: 'You are in the through lane. At the bottleneck two cars in a row want to merge in front of you. What do you do?' },
      options: [
        { de: 'Beide hineinlassen, sicher ist sicher', en: 'Let both in, better safe than sorry' },
        { de: 'Eins hineinlassen, das zweite fädelt hinter dir ein', en: 'Let one in, the second merges behind you' },
        { de: 'Keins hineinlassen, du warst zuerst da', en: 'Let neither in, you were there first' },
      ],
      correct: 1,
      explanation: { de: 'Reißverschluss heißt im Wechsel: eins vor dir, eins hinter dir.', en: 'Zip rule means in turn: one in front of you, one behind you.' },
    },
  },
  {
    id: 'verkehrsberuhigter-bereich',
    free: false,
    title: { de: 'Verkehrsberuhigter Bereich', en: 'Traffic-calmed area (home zone)' },
    situation: {
      de: 'Du fährst in einen verkehrsberuhigten Bereich (blaues Schild mit spielenden Kindern). Die Straße hat keinen Gehweg, Kinder spielen mit einem Ball, ein Fußgänger geht in der Mitte der Straße. Am Ende des Bereichs mündet die Straße in eine Hauptstraße.',
      en: 'You enter a traffic-calmed area (blue sign with children playing). The street has no pavement, children are playing with a ball, a pedestrian is walking in the middle of the street. At the end of the area the street joins a main road.',
    },
    examiner: { de: 'Fahren Sie bitte durch den Bereich und am Ende nach rechts.', en: 'Please drive through the area and turn right at the end.' },
    questions: [
      { de: 'Wie schnell darfst du hier fahren?', en: 'How fast may you drive here?' },
      { de: 'Wer darf die Straße benutzen, und wer hat Vorrang?', en: 'Who may use the street, and who has priority?' },
      { de: 'Was gilt beim Verlassen des Bereichs?', en: 'What applies when leaving the area?' },
    ],
    keyPoints: [
      { id: 'walking', area: 'speed', severe: true, label: { de: 'Nur Schrittgeschwindigkeit', en: 'Walking speed only' }, patterns: ['schritt', 'walking (pace|speed)', '4 (bis|7)', 'sehr langsam', 'very slow'] },
      { id: 'pedestrians', area: 'observation', severe: true, label: { de: 'Fußgänger und spielende Kinder dürfen die ganze Straße nutzen; du darfst sie weder gefährden noch behindern', en: 'Pedestrians and playing children may use the whole street; you must neither endanger nor hinder them' }, patterns: ['(fussgaeng|kind)\\w* .{0,50}(ganze|gesamte|vorrang|vortritt|duerfen|spielen|ueberall)', 'spiel\\w* .{0,20}erlaubt', 'vorrang', '(pedestrian|child)\\w* .{0,50}(whole|entire|priority|allowed|play|anywhere)', 'priority'] },
      { id: 'patience', area: 'speed', label: { de: 'Nicht behindern, nicht gefährden: wenn nötig warten', en: 'Do not hinder or endanger them: wait if necessary' }, patterns: ['nicht (behinder|gefaehrd|draeng)', 'ohne .{0,15}(behinder|gefaehrd)', ...STOP_WAIT, 'geduld', '(not|without|never) (hinder|endanger|push|rush)', 'patien'] },
      { id: 'ball', area: 'observation', label: { de: 'Beim Ball mit Kindern rechnen, bremsbereit', en: 'Expect children with the ball, ready to brake' }, patterns: ['ball', 'kind', 'child', 'kid', 'bremsbereit', 'ready to brake'] },
      { id: 'exit', area: 'observation', severe: true, label: { de: 'Beim Verlassen: Vorfahrt achten wie beim Ausfahren aus einem Grundstück, rechts blinken', en: 'When leaving: give way as when leaving a driveway, indicate right' }, patterns: ['(verlass|ausfahr|ende|hauptstrasse)\\w* .{0,60}(vorfahrt|wartepflicht|warten|grundstueck|achten|vorrang|gewaehr)', '(vorfahrt|wartepflicht) .{0,40}(verlass|ausfahr|ende|hauptstrasse)', 'grundstueck', '(leav|exit|end|main road)\\w* .{0,60}(give way|yield|wait|driveway|priority)', '(give way|yield) .{0,40}(leav|exit|end|main road)', 'driveway'] },
      { id: 'parking', area: 'position', label: { de: 'Parken nur auf gekennzeichneten Flächen', en: 'Park only in marked spaces' }, patterns: ['park', 'gekennzeichnet', 'marked (space|bay|area)', 'designated'] },
    ],
    contradictions: [
      { patterns: ['(20|30) ?km', 'mit 30', 'at (20|30)', 'thirty', 'twenty'], hint: { de: 'Im verkehrsberuhigten Bereich gilt Schrittgeschwindigkeit, also etwa 4 bis 7 km/h, nicht 20 oder 30.', en: 'In the traffic-calmed area walking speed applies, about 4 to 7 km/h, not 20 or 30.' } },
      { patterns: ['hupe', 'honk', 'horn', 'auf (den|die) (gehweg|seite) (schick|verweis)', 'make (them|the children) move'], hint: { de: 'Hier gehört die Straße den Fußgängern. Du wartest, bis sie Platz machen.', en: 'Here the street belongs to the pedestrians. You wait until they make room.' } },
      { patterns: ['ich habe (die )?vorfahrt', 'rechts vor links', 'i have (the )?(priority|right of way)', 'right before left'], hint: { de: 'Beim Verlassen des Bereichs hast du keine Vorfahrt: Du musst wie aus einem Grundstück ausfahren und allen Vorfahrt gewähren.', en: 'When leaving the area you have no priority: you exit as from a driveway and give way to everyone.' } },
    ],
    steps: [
      { de: 'Schild erkennen: Schrittgeschwindigkeit', en: 'See the sign: walking speed' },
      { de: 'Fußgänger und Kinder nutzen die ganze Straße, du darfst sie weder gefährden noch behindern', en: 'Pedestrians and children use the whole street, you must neither endanger nor hinder them' },
      { de: 'Ball und Kinder: bremsbereit, wenn nötig anhalten', en: 'Ball and children: ready to brake, stop if necessary' },
      { de: 'Am Ende rechts blinken, Schulterblick rechts, wie aus einem Grundstück ausfahren', en: 'At the end indicate right, shoulder check right, exit as from a driveway' },
      { de: 'Allen Verkehrsteilnehmern auf der Hauptstraße Vorfahrt gewähren', en: 'Give way to everyone on the main road' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Mit 20 km/h durchfahren, das ist ja schon langsam', en: 'Drive through at 20 km/h, that is already slow' }, why: { de: 'Schrittgeschwindigkeit sind etwa 4 bis 7 km/h. 20 km/h ist hier deutlich zu schnell.', en: 'Walking speed is about 4 to 7 km/h. 20 km/h is far too fast here.' } },
      { area: 'observation', severe: true, text: { de: 'Am Ende rechts vor links anwenden, es ist ja eine Kreuzung', en: 'Apply right before left at the end, it is a junction after all' }, why: { de: 'Wer den Bereich verlässt, ist wartepflichtig wie beim Ausfahren aus einem Grundstück, egal von welcher Seite der Verkehr kommt.', en: 'Whoever leaves the area has to wait as when exiting a driveway, no matter which side the traffic comes from.' } },
    ],
    modelAnswer: {
      de: 'Das Schild zeigt einen verkehrsberuhigten Bereich, also fahre ich nur Schrittgeschwindigkeit. Fußgänger und spielende Kinder dürfen hier die ganze Straße nutzen. Ich behindere und gefährde sie nicht. Wenn nötig, warte ich. Beim Ball rechne ich mit Kindern und bleibe bremsbereit. Parken dürfte ich nur auf gekennzeichneten Flächen. Beim Verlassen des Bereichs blinke ich rechts, mache einen Schulterblick nach rechts und muss wie beim Ausfahren aus einem Grundstück allen auf der Hauptstraße Vorfahrt gewähren.',
      en: 'The sign shows a traffic-calmed area, so I drive at walking speed only. Pedestrians and playing children may use the whole street here. I do not hinder or endanger them and wait if necessary. With the ball I expect children and stay ready to brake. I could only park in marked spaces. When leaving the area I indicate right, do a shoulder check to the right and have to give way to everyone on the main road, as when exiting a driveway.',
    },
    law: { de: 'Zeichen 325.1 (§ 42 StVO, Anlage 3): Schrittgeschwindigkeit, Fußgänger dürfen die Straße in ganzer Breite benutzen, Kinderspiele sind überall erlaubt, Fahrzeuge dürfen Fußgänger weder gefährden noch behindern und müssen wenn nötig warten; Parken nur auf gekennzeichneten Flächen. § 10 StVO: Wer aus einem verkehrsberuhigten Bereich auf die Straße einfährt, hat sich so zu verhalten, dass eine Gefährdung anderer ausgeschlossen ist, erforderlichenfalls muss man sich einweisen lassen; praktisch heißt das: wartepflichtig gegenüber allen.', en: 'Sign 325.1 (§ 42 StVO, annex 3): walking speed, pedestrians may use the full width of the street, children may play anywhere, vehicles must neither endanger nor hinder pedestrians and must wait if necessary; parking only in marked spaces. § 10 StVO: whoever enters the road from a traffic-calmed area must rule out endangering others, if necessary with someone guiding them; in practice that means giving way to everyone.' },
    miniTest: {
      question: { de: 'Am Ende des verkehrsberuhigten Bereichs kommt von links ein Auto auf der Hauptstraße. Wer fährt zuerst?', en: 'At the end of the traffic-calmed area a car comes from the left on the main road. Who goes first?' },
      options: [
        { de: 'Du, denn du kommst von rechts', en: 'You, because you come from the right' },
        { de: 'Das Auto auf der Hauptstraße, du bist wartepflichtig', en: 'The car on the main road, you have to wait' },
        { de: 'Wer schneller ist', en: 'Whoever is faster' },
      ],
      correct: 1,
      explanation: { de: 'Beim Verlassen des Bereichs gilt § 10: Du bist wartepflichtig gegenüber allen, wie beim Ausfahren aus einem Grundstück.', en: 'When leaving the area § 10 applies: you have to give way to everyone, as when exiting a driveway.' },
    },
  },
  {
    id: 'polizist-handzeichen',
    free: false,
    title: { de: 'Handzeichen eines Polizisten', en: 'Hand signals from a police officer' },
    situation: {
      de: 'Kreuzung, die Ampel ist ausgefallen. Ein Polizist regelt den Verkehr in der Mitte der Kreuzung. Er steht mit der Brust zu dir und hat beide Arme seitlich ausgestreckt. Die Vorfahrtsschilder zeigen, dass du eigentlich Vorfahrt hättest.',
      en: 'Junction, the traffic lights have failed. A police officer is directing traffic in the middle of the junction. He is facing you with his chest and has both arms stretched out to the sides. The priority signs would normally give you priority.',
    },
    examiner: { de: 'An der Kreuzung bitte geradeaus.', en: 'Go straight on at the junction, please.' },
    questions: [
      { de: 'Was gilt: der Polizist, die Ampel oder die Schilder?', en: 'What applies: the officer, the lights or the signs?' },
      { de: 'Was bedeutet seine Haltung für dich?', en: 'What does his posture mean for you?' },
      { de: 'Wann darfst du fahren?', en: 'When may you go?' },
    ],
    keyPoints: [
      { id: 'priority', area: 'observation', severe: true, label: { de: 'Zeichen des Polizisten gehen vor Ampeln, Schildern und Vorfahrtsregeln', en: 'The officer\'s signals override lights, signs and right-of-way rules' }, patterns: ['polizist\\w* .{0,50}(vor|vorrang|gilt|gelten|wichtiger|zuerst|ueber)', '(vor|ueber) (den |der |die )?(ampel|schild|zeichen|regel)', '(officer|police|policeman)\\w* .{0,50}(override|priority|precedence|first|before|above|apply|applies|takes|trump)', '(over|before|above|instead of) (the )?(lights|signs|rules)'] },
      { id: 'halt', area: 'speed', severe: true, label: { de: 'Brust oder Rücken zu dir heißt Halt: anhalten', en: 'Chest or back towards you means stop: halt' }, patterns: ['(brust|ruecken)\\w* .{0,40}(halt|rot|anhalt|stopp|warte)', '(halt|anhalt|stopp)\\w* .{0,30}(brust|ruecken)', 'wie (bei )?rot', '(chest|back|front|facing me)\\w* .{0,40}(stop|halt|red|wait)', '(stop|halt)\\w* .{0,30}(chest|back|facing)', '(like|as at|means) red', ...STOP_WAIT] },
      { id: 'position', area: 'position', label: { de: 'Vor der Kreuzung anhalten, nicht in ihr', en: 'Stop before the junction, not inside it' }, patterns: ['vor der (kreuzung|haltelinie|einmuendung)', 'nicht in (der|die) kreuzung', '(before|in front of|at) the (junction|intersection|stop line|crossing)', 'not (in|inside|into) the (junction|intersection)'] },
      { id: 'go', area: 'observation', label: { de: 'Seitlich zu dir (Arm in deine Richtung) heißt Frei: fahren', en: 'Side towards you (arm in your direction) means go: drive' }, patterns: ['(seite|seitlich|arm)\\w* .{0,40}(frei|gruen|fahren|darf)', '(frei|gruen|fahren)\\w* .{0,30}(seite|seitlich|arm)', '(side|sideways|arm)\\w* .{0,40}(go|green|free|may drive|proceed)', '(go|green|proceed)\\w* .{0,30}(side|sideways|arm)'] },
      { id: 'attention', area: 'observation', label: { de: 'Ein Arm hoch heißt Achtung: vor der Kreuzung warten, in der Kreuzung räumen', en: 'One arm raised means attention: wait before the junction, clear it if inside' }, patterns: ['(arm|hand) (nach )?(oben|hoch)', 'hoch(gestreckt|gehalten)', 'achtung', 'gelb', 'raeum', '(arm|hand) (raised|up|held up)', 'raise\\w* (an |one |his )?(arm|hand)', 'attention', 'amber', 'yellow', 'clear the (junction|intersection)'] },
      { id: 'careful', area: 'speed', label: { de: 'Auf das Zeichen hin vorsichtig anfahren, auf Fußgänger und Querverkehr achten', en: 'On the signal, move off carefully, watching pedestrians and cross traffic' }, patterns: ['vorsichtig', 'langsam', 'fussgaeng', 'querverkehr', 'careful', 'slowly', 'pedestrian', 'cross traffic', 'other (traffic|vehicles)'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'schild\\w* .{0,20}(gilt|gelten|zaehl)', 'i have (the )?(priority|right of way)', '(sign|signs) .{0,20}(apply|count|still)', 'ignore'], hint: { de: 'Die Schilder gelten nicht, solange der Polizist regelt. Seine Zeichen gehen vor.', en: 'The signs do not apply while the officer is directing. His signals come first.' } },
      { patterns: ['(brust|ruecken|chest|back)\\w* .{0,30}(fahren|frei|gruen|go|green|drive)', 'durchfahr', 'drive through'], hint: { de: 'Brust oder Rücken zu dir bedeutet Halt, wie eine rote Ampel.', en: 'Chest or back towards you means stop, like a red light.' } },
    ],
    steps: [
      { de: 'Erkennen: Der Polizist regelt, seine Zeichen gehen vor Ampel und Schildern', en: 'Recognise: the officer is directing, his signals override lights and signs' },
      { de: 'Brust zu dir: Halt, vor der Kreuzung anhalten', en: 'Chest towards you: stop before the junction' },
      { de: 'Den Polizisten beobachten und auf sein Zeichen warten', en: 'Watch the officer and wait for his signal' },
      { de: 'Dreht er sich zur Seite (Arm in deine Richtung): frei', en: 'When he turns sideways (arm towards you): go' },
      { de: 'Vorsichtig anfahren, auf Fußgänger und Querverkehr achten', en: 'Move off carefully, watching pedestrians and cross traffic' },
    ],
    mistakes: [
      { area: 'observation', severe: true, text: { de: 'Weiterfahren, die Schilder geben dir Vorfahrt', en: 'Carry on, the signs give you priority' }, why: { de: 'Zeichen und Weisungen der Polizei gehen allen anderen Regeln vor. Die Brust zu dir ist ein Haltegebot.', en: 'Police signals and instructions override all other rules. His chest towards you is a stop order.' } },
      { area: 'speed', text: { de: 'Beim Armzeichen sofort zügig losfahren', en: 'Drive off briskly as soon as he signals' }, why: { de: 'Auch mit Freigabe fährst du vorsichtig an. Fußgänger und Nachzügler aus dem Querverkehr können noch in der Kreuzung sein.', en: 'Even when cleared, you move off carefully. Pedestrians and stragglers from the cross traffic may still be in the junction.' } },
    ],
    modelAnswer: {
      de: 'Der Polizist regelt den Verkehr, und seine Zeichen gehen vor der Ampel und den Schildern. Er steht mit der Brust zu mir, das bedeutet Halt wie bei Rot, also halte ich vor der Kreuzung an, nicht in ihr. Ich beobachte ihn und warte. Hebt er einen Arm hoch, heißt das Achtung, wie Gelb, dann warte ich weiter vor der Kreuzung. Wenn er sich zur Seite dreht und der Arm in meine Richtung zeigt, ist das Frei. Dann fahre ich vorsichtig an und achte auf Fußgänger und Querverkehr.',
      en: 'The officer is directing traffic, and his signals override the lights and the signs. He is facing me with his chest, which means stop like red, so I stop before the junction, not inside it. I watch him and wait. If he raises an arm, that means attention, like amber, and I keep waiting before the junction. When he turns sideways and the arm points in my direction, that means go. Then I move off carefully and watch for pedestrians and cross traffic.',
    },
    law: { de: '§ 36 StVO: Die Zeichen und Weisungen der Polizeibeamten sind zu befolgen; sie gehen allen anderen Anordnungen und Regeln vor. Seitlich ausgestreckte Arme quer zur Fahrtrichtung bedeuten Halt für den Verkehr von vorn und hinten; ein hochgehobener Arm bedeutet „Achtung, vor der Kreuzung warten“. Die Zeichen entbinden nicht von der Sorgfaltspflicht (§ 36 Abs. 1 Satz 2 StVO).', en: '§ 36 StVO: signals and instructions of police officers must be obeyed; they take precedence over all other orders and rules. Arms stretched out sideways across your direction of travel mean stop for traffic from the front and behind; a raised arm means "attention, wait before the junction". The signals do not release you from your duty of care (§ 36 (1) sentence 2 StVO).' },
    miniTest: {
      question: { de: 'Der Polizist hebt einen Arm senkrecht nach oben, während du schon in der Kreuzung bist. Was tust du?', en: 'The officer raises one arm straight up while you are already inside the junction. What do you do?' },
      options: [
        { de: 'Sofort anhalten, wo ich bin', en: 'Stop at once where I am' },
        { de: 'Die Kreuzung zügig räumen', en: 'Clear the junction promptly' },
        { de: 'Zurücksetzen bis vor die Kreuzung', en: 'Reverse back to before the junction' },
      ],
      correct: 1,
      explanation: { de: 'Arm hoch heißt Achtung: Wer noch vor der Kreuzung ist, wartet; wer schon in ihr ist, räumt sie.', en: 'Arm up means attention: whoever is still before the junction waits; whoever is already inside clears it.' },
    },
  },
  {
    id: 'vorfahrt-gewaehren',
    free: false,
    title: { de: 'Vorfahrt gewähren (Zeichen 205)', en: 'Give way (sign 205)' },
    situation: {
      de: 'Du näherst dich einer Einmündung. Rechts steht das Zeichen „Vorfahrt gewähren“ (Zeichen 205), auf der Fahrbahn ist eine Wartelinie (Zeichen 341) markiert. Die Querstraße ist die Vorfahrtsstraße. Von links nähert sich ein Auto, von rechts kommt auf dem Radweg neben der Vorfahrtsstraße ein Radfahrer.',
      en: 'You approach a T-junction. On the right is the “give way” sign (sign 205), and a give-way line (sign 341) is marked on the road. The road ahead is the priority road. A car approaches from the left, a cyclist comes from the right on the cycle path beside the priority road.',
    },
    examiner: { de: 'Biegen Sie an der Einmündung bitte rechts ab.', en: 'Turn right at the junction, please.' },
    questions: [
      { de: 'Was bedeutet das Schild für dich?', en: 'What does the sign mean for you?' },
      { de: 'Wohin schaust du, bevor du einbiegst?', en: 'Where do you look before you turn in?' },
      { de: 'Wann darfst du einbiegen?', en: 'When may you turn in?' },
    ],
    keyPoints: [
      { id: 'recognise', area: 'observation', label: { de: 'Zeichen 205 früh erkennen: Du musst Vorfahrt gewähren', en: 'Spot sign 205 early: you have to give way' }, patterns: ['zeichen 205', 'vorfahrt gewaehren', 'dreieck', 'wartepflicht', 'sign 205', 'give way', 'yield', 'triangle'] },
      { id: 'speed', area: 'speed', label: { de: 'Tempo reduzieren, bremsbereit, so dass man erkennt: Ich warte', en: 'Reduce speed and be ready to brake, so others can see: I will wait' }, patterns: SLOW },
      { id: 'look', area: 'observation', label: { de: 'In beide Richtungen der Vorfahrtsstraße schauen', en: 'Look both ways along the priority road' }, patterns: [...LOOK_BOTH, ...LOOK_LEFT, ...LOOK_RIGHT] },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Fahrzeugen und Radfahrern auf der Vorfahrtsstraße die Vorfahrt lassen', en: 'Let vehicles and cyclists on the priority road go first' }, patterns: ['vorfahrt (lassen|gewaehr)', 'lasse\\w* (\\w+ ){0,6}vorfahrt', 'lasse\\w* (\\w+ ){0,4}(vorbei|durch|zuerst|fahren)', 'gewaehre', 'vorrang', '(let|give) (\\w+ ){0,4}(pass|go|way|priority|first|through)', 'give way to', 'yield to'] },
      { id: 'gap', area: 'speed', label: { de: 'Erst einbiegen, wenn ich weder gefährde noch wesentlich behindere', en: 'Turn in only when I neither endanger nor substantially hinder anyone' }, patterns: ['gefaehrd', 'behinder', 'luecke', 'frei ist', 'endanger', 'hinder', 'obstruct', 'gap', 'is clear'] },
      { id: 'signal', area: 'communication', label: { de: 'Rechtzeitig rechts blinken', en: 'Indicate right in good time' }, patterns: ['blink', 'indicat', 'signal'] },
      { id: 'others', area: 'observation', label: { de: 'Beim Rechtsabbiegen Schulterblick, auf Radfahrer und Fußgänger achten', en: 'Shoulder check when turning right, watch for cyclists and pedestrians' }, patterns: [...SHOULDER, 'radfahr', 'fussgaeng', 'cyclist', 'pedestrian'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'rechts vor links', 'right before left'], hint: { de: 'Mit Zeichen 205 hast du keine Vorfahrt: Rechts vor links gilt hier nicht, die Querstraße fährt zuerst.', en: 'With sign 205 you do not have priority: right before left does not apply, the road ahead goes first.' } },
      { patterns: ['schnell .{0,15}(davor|vor ihm|vor dem)', 'vor dem (auto|fahrzeug|radfahrer) .{0,10}(einbieg|rein|durch)', '(quickly|before the) (car|cyclist|vehicle)', 'before (he|she|it) (gets|arrives|reaches)'], hint: { de: 'Nicht vor dem Querverkehr einbiegen: Wer wartepflichtig ist, darf nur fahren, wenn er niemanden gefährdet oder wesentlich behindert.', en: 'Do not squeeze in ahead of the cross traffic: whoever must give way may only go if nobody is endangered or substantially hindered.' } },
    ],
    steps: [
      { de: 'Zeichen 205 erkennen, Tempo reduzieren, bremsbereit', en: 'Spot sign 205, reduce speed, be ready to brake' },
      { de: 'Spiegel, rechtzeitig rechts blinken', en: 'Mirrors, indicate right in good time' },
      { de: 'Nach links und rechts auf die Vorfahrtsstraße schauen', en: 'Look left and right along the priority road' },
      { de: 'Ist die Sicht schlecht: vorsichtig vortasten, bis du die Straße übersiehst', en: 'If the view is poor: edge forward carefully until you can see the road' },
      { de: 'Schulterblick rechts, Radfahrer und Fußgänger beachten', en: 'Shoulder check right, watch for cyclists and pedestrians' },
      { de: 'Einbiegen, wenn niemand gefährdet oder wesentlich behindert wird', en: 'Turn in when nobody is endangered or substantially hindered' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Zügig einbiegen, das Auto von links wird schon etwas bremsen', en: 'Turn in briskly, the car from the left will brake a little' }, why: { de: 'Wer warten muss, darf nur fahren, wenn er niemanden gefährdet oder wesentlich behindert. Muss der Vorfahrtberechtigte deinetwegen bremsen, ist das eine Vorfahrtverletzung.', en: 'Whoever must give way may only go if nobody is endangered or substantially hindered. If the driver with priority has to brake because of you, that is a right-of-way violation.' } },
      { area: 'observation', text: { de: 'Nur nach links schauen, von rechts kommt ohnehin nichts', en: 'Only look left, nothing comes from the right anyway' }, why: { de: 'Auch von rechts kommen Auto und Radfahrer auf der Vorfahrtsstraße. Du schaust in beide Richtungen.', en: 'Cars and cyclists also come from the right on the priority road. You look both ways.' } },
    ],
    modelAnswer: {
      de: 'Ich erkenne das Zeichen 205: Ich muss Vorfahrt gewähren. Deshalb reduziere ich das Tempo und bin bremsbereit, damit man sieht, dass ich warte. Ich schaue in den Spiegel und blinke rechtzeitig rechts. Dann schaue ich nach links und rechts auf die Vorfahrtsstraße und lasse das Auto und den Radfahrer zuerst vorbei. Ist die Sicht eingeschränkt, taste ich mich vorsichtig vor. Mit einem Schulterblick achte ich auf Radfahrer und Fußgänger. Ich biege erst ein, wenn ich niemanden gefährde oder wesentlich behindere.',
      en: 'I spot sign 205: I have to give way. So I reduce speed and stay ready to brake, so others see that I will wait. I check the mirror and indicate right in good time. Then I look left and right along the priority road and let the car and the cyclist pass first. If my view is limited, I edge forward carefully. With a shoulder check I watch for cyclists and pedestrians. I only turn in when nobody is endangered or substantially hindered by me.',
    },
    law: { de: '§ 41 Abs. 1 StVO i. V. m. Anlage 2 lfd. Nr. 2 (Zeichen 205): „Wer ein Fahrzeug führt, muss Vorfahrt gewähren.“ § 8 Abs. 2 StVO: „Wer die Vorfahrt zu beachten hat, muss rechtzeitig durch sein Fahrverhalten, insbesondere durch mäßige Geschwindigkeit, erkennen lassen, dass gewartet wird. Es darf nur weitergefahren werden, wenn übersehen werden kann, dass wer die Vorfahrt hat, weder gefährdet noch wesentlich behindert wird. Kann das nicht übersehen werden, weil die Straßenstelle unübersichtlich ist, so darf sich vorsichtig in die Kreuzung oder Einmündung hineingetastet werden, bis die Übersicht gegeben ist.“ Die Vorfahrt gilt auch für Radfahrer auf dem Radweg neben der Vorfahrtsstraße.', en: '§ 41 (1) StVO with annex 2 no. 2 (sign 205): whoever drives a vehicle must give way. § 8 (2) StVO: whoever must give way has to show in good time by how they drive, in particular by moderate speed, that they will wait. They may only drive on if they can see that whoever has priority is neither endangered nor substantially hindered. If they cannot see this because the spot is unclear, they may edge carefully into the crossing or junction until they have a clear view. The priority also covers cyclists on the cycle path beside the priority road.' },
    miniTest: {
      question: { de: 'Du stehst am Zeichen 205, ein Auto von links hat den rechten Blinker an. Was tust du?', en: 'You are at sign 205, a car from the left has its right indicator on. What do you do?' },
      options: [
        { de: 'Einfahren, er biegt ja ab', en: 'Pull out, he is turning off' },
        { de: 'Warten, bis sicher ist, dass er wirklich abbiegt', en: 'Wait until it is certain that he really turns' },
        { de: 'Hupen und losfahren', en: 'Honk and drive off' },
      ],
      correct: 1,
      explanation: { de: 'Ein Blinker allein ist keine Garantie. Du fährst erst, wenn du sicher siehst, dass er abbiegt und niemand gefährdet wird.', en: 'An indicator alone is no guarantee. You only go when you can see for certain that he is turning and nobody is endangered.' },
    },
  },
  {
    id: 'stoppschild',
    free: false,
    title: { de: 'Stoppschild (Zeichen 206)', en: 'Stop sign (sign 206)' },
    situation: {
      de: 'Du kommst an eine Kreuzung mit Stoppschild (Zeichen 206). Die Haltlinie liegt ein Stück vor der Kreuzung, parkende Autos und eine Hecke verdecken die Sicht auf die Querstraße. Die Querstraße ist die Vorfahrtsstraße.',
      en: 'You come to a crossing with a stop sign (sign 206). The stop line is some way before the crossing, parked cars and a hedge block the view of the cross road. The cross road is the priority road.',
    },
    examiner: { de: 'Fahren Sie bitte an der Kreuzung geradeaus weiter.', en: 'Please drive straight ahead at the crossing.' },
    questions: [
      { de: 'Wo und wie hältst du an?', en: 'Where and how do you stop?' },
      { de: 'Was machst du, wenn du an der Haltlinie nichts siehst?', en: 'What do you do if you cannot see anything at the stop line?' },
      { de: 'Wer fährt zuerst?', en: 'Who goes first?' },
    ],
    keyPoints: [
      { id: 'speed', area: 'speed', label: { de: 'Früh bremsen, gleichmäßig zum Stehen kommen', en: 'Brake early, come to a smooth stop' }, patterns: SLOW },
      { id: 'stop', area: 'speed', severe: true, label: { de: 'Vollständig anhalten, bis das Fahrzeug steht', en: 'Come to a full stop until the vehicle is stationary' }, patterns: ['stillstand', 'komplett', 'vollstaendig', 'zum stehen', 'steht\\b', 'full stop', 'complete stop', 'completely', 'standstill', 'come to a (full |complete )?(stop|halt)'] },
      { id: 'line', area: 'position', label: { de: 'An der Haltlinie anhalten, ohne Haltlinie dort, wo die Querstraße zu übersehen ist', en: 'Stop at the stop line, without a line where the cross road can be seen' }, patterns: ['halte?linie', 'sichtlinie', 'stop line', 'sight line', 'where .{0,30}(see|view|visible)', 'wo .{0,30}(uebersehen|einsehen|sehen)'] },
      { id: 'creep', area: 'position', label: { de: 'Reicht die Sicht an der Haltlinie nicht, danach vorsichtig bis zur Sichtlinie vortasten und dort wenn nötig erneut anhalten', en: 'If the view from the line is poor, then edge forward carefully to the sight line and stop there again if needed' }, patterns: ['vortast', 'hineintast', 'taste\\w* (\\w+ ){0,8}vor\\b', 'vorsichtig (vor|ran|heran|hinein|weiter)', 'creep', 'edge (forward|up)', 'inch (forward|up)', 'carefully (forward|ahead)'] },
      { id: 'look', area: 'observation', label: { de: 'In beide Richtungen schauen, auch auf Radfahrer und Fußgänger', en: 'Look both ways, also for cyclists and pedestrians' }, patterns: [...LOOK_BOTH, ...LOOK_LEFT, ...LOOK_RIGHT, 'radfahr', 'cyclist'] },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Nach dem Halt dem Querverkehr die Vorfahrt lassen', en: 'After stopping, give way to the cross traffic' }, patterns: ['vorfahrt (lassen|gewaehr)', 'lasse\\w* (\\w+ ){0,6}vorfahrt', 'lasse\\w* (\\w+ ){0,4}(vorbei|durch|zuerst)', 'gewaehre', 'vorrang', 'give way', 'yield', 'priority', '(let|wait for) (\\w+ ){0,4}(pass|first|through)'] },
    ],
    contradictions: [
      { patterns: ['(durch|weiter|drueber)rollen', 'rolle (durch|weiter|drueber)', 'langsam (durch|drueber|weiter)', 'ohne (anzuhalten|zu halten|halt)', 'rolling (stop|through)', 'roll (through|past|over)', 'without (stopping|a stop)', 'slow(ly)? (through|past)'], hint: { de: 'Am Stoppschild genügt Langsamfahren nicht: Das Fahrzeug muss stehen.', en: 'At a stop sign slowing down is not enough: the vehicle must be stationary.' } },
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'rechts vor links', 'right before left'], hint: { de: 'Am Stoppschild hat der Querverkehr Vorfahrt, rechts vor links gilt hier nicht.', en: 'At a stop sign the cross traffic has priority, right before left does not apply here.' } },
    ],
    steps: [
      { de: 'Stoppschild erkennen, früh bremsen', en: 'Spot the stop sign, brake early' },
      { de: 'An der Haltlinie anhalten, bis das Fahrzeug steht', en: 'Stop at the stop line until the vehicle is stationary' },
      { de: 'Reicht die Sicht nicht: vorsichtig bis zur Sichtlinie vortasten, dort wenn nötig erneut anhalten', en: 'If the view is poor: edge forward carefully to the sight line, stop there again if needed' },
      { de: 'Nach links und rechts schauen, Radfahrer und Fußgänger beachten', en: 'Look left and right, watch for cyclists and pedestrians' },
      { de: 'Querverkehr durchfahren lassen', en: 'Let the cross traffic through' },
      { de: 'Erst fahren, wenn niemand gefährdet oder wesentlich behindert wird', en: 'Only go when nobody is endangered or substantially hindered' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Fast stehen bleiben und weiterrollen, es kommt ja nichts', en: 'Almost stop and roll on, nothing is coming anyway' }, why: { de: 'Das Stoppschild verlangt den vollständigen Halt. Nur kurz langsam werden zählt als Stoppschild missachtet.', en: 'The stop sign demands a full stop. Merely slowing down counts as ignoring the stop sign.' } },
      { area: 'position', text: { de: 'Direkt hinter der Haltlinie weiterfahren, auch ohne Sicht', en: 'Drive on right after the stop line, even without a view' }, why: { de: 'Wenn die Sicht an der Haltlinie fehlt, tastest du dich nach dem Halt vorsichtig vor, bis du die Querstraße siehst.', en: 'If the view at the line is blocked, you edge forward after stopping until you can see the cross road.' } },
    ],
    modelAnswer: {
      de: 'Ich bremse früh und gleichmäßig und halte an der Haltlinie vollständig an, bis das Fahrzeug steht. Ist die Sicht dort schlecht, taste ich mich danach vorsichtig bis zur Sichtlinie vor, wo ich die Querstraße übersehe, und halte dort wenn nötig erneut an. Fehlt die Haltlinie, halte ich dort an, wo ich die Querstraße übersehen kann. Ich schaue nach links und rechts, auch auf Radfahrer und Fußgänger. Der Querverkehr hat Vorfahrt, ich lasse ihn zuerst durchfahren und fahre erst, wenn niemand gefährdet oder wesentlich behindert wird.',
      en: 'I brake early and smoothly and come to a full stop at the stop line, until the vehicle is stationary. If the view there is poor, I then edge forward carefully to the sight line, where I can see the cross road, and stop there again if needed. If the line is missing, I stop where I can see the cross road. I look left and right, also for cyclists and pedestrians. The cross traffic has priority, I let it through first and only go when nobody is endangered or substantially hindered.',
    },
    law: { de: '§ 41 Abs. 1 StVO i. V. m. Anlage 2 lfd. Nr. 3 (Zeichen 206): „Wer ein Fahrzeug führt, muss anhalten und Vorfahrt gewähren.“ „Ist keine Haltlinie (Zeichen 294) vorhanden, ist dort anzuhalten, wo die andere Straße zu übersehen ist.“ Anlage 2 lfd. Nr. 67 (Zeichen 294): „Wer ein Fahrzeug führt, muss hier anhalten. Erforderlichenfalls ist an der Stelle, wo die Straße eingesehen werden kann, in die eingefahren werden soll (Sichtlinie), erneut anzuhalten.“ Danach gilt § 8 Abs. 2 StVO: nur weiterfahren, wenn wer die Vorfahrt hat, weder gefährdet noch wesentlich behindert wird.', en: '§ 41 (1) StVO with annex 2 no. 3 (sign 206): whoever drives a vehicle must stop and give way. If there is no stop line (sign 294), stop where the other road can be seen. Annex 2 no. 67 (sign 294): whoever drives a vehicle must stop here. If necessary, stop again at the point where the road you are entering can be seen (sight line). After that § 8 (2) StVO applies: only drive on if whoever has priority is neither endangered nor substantially hindered.' },
    miniTest: {
      question: { de: 'Du stehst am Stoppschild an der Haltlinie, siehst aber wegen eines Lieferwagens nichts von links. Was tust du?', en: 'You are at the stop sign at the stop line, but a van blocks your view to the left. What do you do?' },
      options: [
        { de: 'Gas geben, damit du schnell querst', en: 'Accelerate so you cross quickly' },
        { de: 'Dich im Schritttempo vortasten, bis du die Straße siehst', en: 'Creep forward at walking pace until you can see the road' },
        { de: 'Hupen, damit dich der Querverkehr bemerkt', en: 'Honk so the cross traffic notices you' },
      ],
      correct: 1,
      explanation: { de: 'Nach dem Halt darfst du dich vortasten, bis du die Querstraße übersiehst, und hältst dort wenn nötig erneut an (Sichtlinie). Dabei bleibst du bremsbereit und gewährst weiter Vorfahrt.', en: 'After stopping you may edge forward until you can see the cross road, and stop there again if needed (sight line). You stay ready to brake and keep giving way.' },
    },
  },
  {
    id: 'ampel-ausgefallen',
    free: false,
    title: { de: 'Ampel ausgefallen oder gelb blinkend', en: 'Traffic light out of order or flashing amber' },
    situation: {
      de: 'Du näherst dich einer Ampelkreuzung. Die Ampel ist ausgefallen, sie blinkt gelb. An deinem Mast hängt das Zeichen „Vorfahrt gewähren“ (Zeichen 205), die Querstraße hat Zeichen 306 (Vorfahrtsstraße). Von links nähert sich ein Auto.',
      en: 'You approach a junction with traffic lights. The light is out of order and flashes amber. On your pole is the “give way” sign (sign 205), the cross road has sign 306 (priority road). A car approaches from the left.',
    },
    examiner: { de: 'Fahren Sie bitte geradeaus über die Kreuzung.', en: 'Please drive straight across the junction.' },
    questions: [
      { de: 'Was sagt die Ampel jetzt?', en: 'What does the light say now?' },
      { de: 'Was regelt dann die Vorfahrt?', en: 'What then regulates priority?' },
      { de: 'Und wenn keine Schilder da wären?', en: 'And if there were no signs?' },
    ],
    keyPoints: [
      { id: 'recognise', area: 'observation', label: { de: 'Erkennen: Die Ampel ist ausgefallen oder blinkt gelb, sie regelt die Vorfahrt nicht, gelbes Blinklicht warnt nur', en: 'Recognise: the light is out of order or flashing amber, it does not regulate priority, flashing amber only warns' }, patterns: ['ausgefallen', 'dunkel', 'blinkt gelb', 'gelb blink', 'gelbes? blink', 'ampel (ist |)aus', 'out of (order|service)', 'flashing (amber|yellow)', 'flashes? (amber|yellow)', 'amber flash', 'switched off', 'not working', 'has failed', 'dead'] },
      { id: 'signs', area: 'observation', label: { de: 'Verkehrszeichen und Vorfahrtsregeln gelten wieder', en: 'Traffic signs and priority rules apply again' }, patterns: ['verkehrszeichen', 'schild', 'zeichen 205', 'vorfahrtsregel', 'vorfahrtsschild', 'traffic signs?', '\\bsigns?\\b', 'sign 205', 'priority (rules|signs)', 'right of way rules'] },
      { id: 'speed', area: 'speed', label: { de: 'Tempo reduzieren, bremsbereit, mit besonderer Vorsicht heranfahren', en: 'Reduce speed, be ready to brake, approach with particular care' }, patterns: SLOW },
      { id: 'look', area: 'observation', label: { de: 'In beide Richtungen schauen', en: 'Look both ways' }, patterns: [...LOOK_BOTH, ...LOOK_LEFT, ...LOOK_RIGHT] },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Dem Querverkehr auf der Vorfahrtsstraße die Vorfahrt lassen', en: 'Give way to the cross traffic on the priority road' }, patterns: ['vorfahrt (lassen|gewaehr)', 'lasse\\w* (\\w+ ){0,6}vorfahrt', 'lasse\\w* (\\w+ ){0,4}(vorbei|durch|zuerst)', 'gewaehre', 'vorrang', 'give way', 'yield', '(let|wait for) (\\w+ ){0,4}(pass|first|through)'] },
      { id: 'fallback', area: 'observation', label: { de: 'Ohne Schilder gilt rechts vor links', en: 'Without signs right before left applies' }, patterns: ['rechts vor links', 'right before left', 'right[- ]hand rule', 'from the right'] },
    ],
    contradictions: [
      { patterns: ['ampel (gilt|zeigt|ist) gruen', 'gelb heisst (fahren|frei|weiter|durch)', 'einfach durch', 'just (drive|go) (through|on)', 'amber means (go|drive)', 'treat it as green'], hint: { de: 'Eine ausgefallene oder gelb blinkende Ampel gibt keine Fahrerlaubnis: Verkehrszeichen und Vorfahrtsregeln gelten.', en: 'A failed or flashing amber light gives no permission to go: signs and priority rules apply.' } },
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)'], hint: { de: 'Hier hast du keine Vorfahrt: Zeichen 205 verpflichtet dich zu warten.', en: 'You do not have priority here: sign 205 obliges you to wait.' } },
    ],
    steps: [
      { de: 'Erkennen: Ampel ausgefallen, sie regelt nichts', en: 'Recognise: light out of order, it regulates nothing' },
      { de: 'Tempo reduzieren, bremsbereit heranfahren', en: 'Reduce speed, approach ready to brake' },
      { de: 'Verkehrszeichen lesen: Zeichen 205 am Mast', en: 'Read the signs: sign 205 on the pole' },
      { de: 'Nach links und rechts schauen', en: 'Look left and right' },
      { de: 'Dem Querverkehr die Vorfahrt lassen', en: 'Give way to the cross traffic' },
      { de: 'Erst fahren, wenn die Kreuzung frei ist', en: 'Only go when the junction is clear' },
    ],
    mistakes: [
      { area: 'observation', severe: true, text: { de: 'Mit Tempo durchfahren, blinkt ja gelb, also Vorsicht und weiter', en: 'Drive through at speed, it flashes amber, so care and carry on' }, why: { de: 'Gelbes Blinken erteilt keine Vorfahrt. Es gelten die Verkehrszeichen, hier musst du dem Querverkehr Vorfahrt lassen.', en: 'Flashing amber grants no priority. The signs apply, here you must give way to the cross traffic.' } },
      { area: 'observation', text: { de: 'Das Schild übersehen und einfach rechts vor links anwenden', en: 'Overlook the sign and simply apply right before left' }, why: { de: 'Rechts vor links gilt nur ohne Schilder. Hier regelt Zeichen 205 die Vorfahrt.', en: 'Right before left only applies without signs. Here sign 205 regulates priority.' } },
    ],
    modelAnswer: {
      de: 'Die Ampel ist ausgefallen und blinkt gelb, sie regelt also nichts. Ich reduziere das Tempo und fahre bremsbereit heran, mit besonderer Vorsicht. Jetzt gelten die Verkehrszeichen: An meinem Mast hängt Zeichen 205. Ich schaue nach links und rechts und lasse dem Querverkehr auf der Vorfahrtsstraße die Vorfahrt. Erst wenn die Kreuzung frei ist, fahre ich. Fehlen Schilder, gilt rechts vor links.',
      en: 'The light is out of order and flashes amber, so it regulates nothing. I reduce speed and approach ready to brake, with particular care. Now the traffic signs apply: there is sign 205 on my pole. I look left and right and give way to the cross traffic on the priority road. Only when the junction is clear do I go. If signs are missing, right before left applies.',
    },
    law: { de: '§ 37 Abs. 1 Satz 1 StVO: „Lichtzeichen gehen Vorrangregeln und Vorrang regelnden Verkehrszeichen vor.“ Eine dunkle oder nur gelb blinkende Ampel gibt kein Wechsellichtzeichen nach § 37 Abs. 2 StVO. Dann gelten die Verkehrszeichen (hier Zeichen 205, § 8 Abs. 1 Satz 2 Nr. 1 und Abs. 2 StVO), ohne Zeichen „rechts vor links“ (§ 8 Abs. 1 Satz 1 StVO). § 38 Abs. 3 Satz 1 StVO: „Gelbes Blinklicht warnt vor Gefahren.“', en: '§ 37 (1) sentence 1 StVO: light signals take precedence over priority rules and priority signs. A dark light or one that only flashes amber gives no alternating light signal under § 37 (2) StVO. Then the traffic signs apply (here sign 205, § 8 (1) sentence 2 no. 1 and (2) StVO), without signs “right before left” (§ 8 (1) sentence 1 StVO). § 38 (3) sentence 1 StVO: flashing amber light warns of danger.' },
    miniTest: {
      question: { de: 'Die Ampel ist komplett dunkel, an der Kreuzung gibt es keine Schilder. Wer fährt zuerst?', en: 'The traffic light is completely dark, there are no signs at the junction. Who goes first?' },
      options: [
        { de: 'Wer zuerst da ist', en: 'Whoever arrives first' },
        { de: 'Wer von rechts kommt', en: 'Whoever comes from the right' },
        { de: 'Wer geradeaus fährt', en: 'Whoever goes straight on' },
      ],
      correct: 1,
      explanation: { de: 'Ohne Ampel und Schilder gilt rechts vor links. Ist ein Polizeibeamter vor Ort, gelten dessen Zeichen.', en: 'Without lights or signs right before left applies. If a police officer is on site, their signals apply.' },
    },
  },
  {
    id: 'gelb-vor-kreuzung',
    free: false,
    title: { de: 'Gelb kurz vor der Kreuzung', en: 'Amber shortly before the junction' },
    situation: {
      de: 'Innerorts, du fährst mit 50 km/h auf eine Ampel zu. Die Ampel springt auf Gelb, die Haltlinie ist noch ein Stück entfernt. Hinter dir folgt ein Auto.',
      en: 'In town, you approach a traffic light at 50 km/h. The light turns amber, the stop line is still some distance away. A car follows behind you.',
    },
    examiner: { de: 'Fahren Sie bitte geradeaus weiter.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Was bedeutet Gelb?', en: 'What does amber mean?' },
      { de: 'Wovon hängt deine Entscheidung ab?', en: 'What does your decision depend on?' },
      { de: 'Wann fährst du noch durch?', en: 'When do you still drive through?' },
    ],
    keyPoints: [
      { id: 'mirror', area: 'observation', label: { de: 'Blick in den Rückspiegel: Wie dicht folgt das Auto hinter mir?', en: 'Check the rear-view mirror: how close is the car behind?' }, patterns: [...MIRROR, 'hinter mir', 'hintermann', 'behind (me|us)', 'car behind', 'traffic behind'] },
      { id: 'judge', area: 'observation', label: { de: 'Entfernung zur Haltlinie und Bremsweg einschätzen', en: 'Judge the distance to the stop line and the braking distance' }, patterns: ['bremsweg', 'entfernung', 'abstand zur', 'einschaetz', 'beurteil', 'distance', 'braking distance', 'estimate', 'judge', 'assess'] },
      { id: 'stop', area: 'speed', label: { de: 'Gelb heißt vor der Haltlinie warten: Bremse ich gefahrlos, halte ich an', en: 'Amber means wait before the stop line: if I can brake safely, I stop' }, patterns: ['halte?linie', 'gefahrlos', 'sicher (anhalt|halt|brems)', 'anhalt', 'stop line', 'safely', 'stop before', 'come to a stop', 'brake'] },
      { id: 'clear', area: 'speed', label: { de: 'Kann ich nicht mehr gefahrlos anhalten, fahre ich zügig durch, ohne zu beschleunigen', en: 'If I can no longer stop safely, I drive through briskly without accelerating' }, patterns: ['zuegig', 'durchfahren', 'durch die kreuzung', 'ohne (zu )?beschleunig', 'drive (on |through)', 'briskly', 'continue through', 'without accelerating'] },
      { id: 'red', area: 'speed', severe: true, label: { de: 'Bei Rot an der Haltlinie warten', en: 'Wait at the stop line at red' }, patterns: ['\\brot\\b', 'rotlicht', '\\bred\\b'] },
    ],
    contradictions: [
      { patterns: ['gas geben', 'beschleunig(e|en) .{0,15}(damit|um)', 'gelb heisst (gas|schneller)', 'speed up', 'accelerate to', 'floor it', 'step on it'], hint: { de: 'Gelb ist kein Signal zum Beschleunigen: Fahre nicht schneller, um die Ampel zu erwischen.', en: 'Amber is not a signal to speed up: do not accelerate to beat the light.' } },
      { patterns: ['vollbremsung', 'voll bremsen', 'hart bremsen', 'emergency brak', 'slam on', 'brake hard'], hint: { de: 'Eine Vollbremsung ohne Not gefährdet den Hintermann. Entscheide früh und bremse gleichmäßig.', en: 'Hard braking without need endangers the car behind. Decide early and brake smoothly.' } },
    ],
    steps: [
      { de: 'Gelb erkennen: Rückspiegel, wie dicht ist der Hintermann?', en: 'Notice amber: rear-view mirror, how close is the car behind?' },
      { de: 'Entfernung zur Haltlinie und Bremsweg einschätzen', en: 'Judge the distance to the stop line and the braking distance' },
      { de: 'Kann ich gefahrlos anhalten: gleichmäßig bremsen und vor der Haltlinie anhalten', en: 'If I can stop safely: brake smoothly and stop before the stop line' },
      { de: 'Geht das nicht mehr gefahrlos: zügig durchfahren, nicht beschleunigen', en: 'If that is no longer safe: drive through briskly, do not accelerate' },
      { de: 'Bei Rot an der Haltlinie warten', en: 'At red wait at the stop line' },
    ],
    mistakes: [
      { area: 'speed', text: { de: 'Gas geben, um noch bei Gelb durchzukommen', en: 'Accelerate to get through while it is still amber' }, why: { de: 'Gelb ordnet das Warten vor der Kreuzung an. Beschleunigen riskiert Rot und Querverkehr.', en: 'Amber orders you to wait before the junction. Accelerating risks running red and meeting cross traffic.' } },
      { area: 'speed', severe: true, text: { de: 'Eine Vollbremsung, obwohl der Hintermann dicht folgt', en: 'Slam on the brakes although the car behind follows closely' }, why: { de: 'Das gefährdet den Hintermann, und ohne zwingenden Grund darfst du nicht stark bremsen (§ 4 Abs. 1 Satz 2 StVO). Kannst du nicht mehr gefahrlos halten, fährst du zügig durch.', en: 'That endangers the car behind, and you must not brake hard without a compelling reason (§ 4 (1) sentence 2 StVO). If you cannot stop safely any more, you drive through briskly.' } },
    ],
    modelAnswer: {
      de: 'Bei Gelb schaue ich in den Rückspiegel, wie dicht mein Hintermann folgt, und schätze die Entfernung zur Haltlinie und meinen Bremsweg ein. Gelb heißt: vor der Haltlinie warten. Kann ich gefahrlos bremsen, bremse ich gleichmäßig und halte an. Kann ich nicht mehr gefahrlos anhalten, fahre ich zügig durch die Kreuzung, ohne zu beschleunigen. Zeigt die Ampel Rot, warte ich an der Haltlinie.',
      en: 'At amber I check the rear-view mirror to see how close the car behind is, and I judge the distance to the stop line and my braking distance. Amber means: wait before the stop line. If I can brake safely, I brake smoothly and stop. If I can no longer stop safely, I drive briskly through the junction without accelerating. If the light shows red, I wait at the stop line.',
    },
    law: { de: '§ 37 Abs. 2 Nr. 1 StVO: „Gelb ordnet an: ‚Vor der Kreuzung auf das nächste Zeichen warten‘.“ „Rot ordnet an: ‚Halt vor der Kreuzung‘.“ Gehalten wird an der Haltlinie (Zeichen 294, Anlage 2 lfd. Nr. 67). § 4 Abs. 1 Satz 2 StVO: „Wer vorausfährt, darf nicht ohne zwingenden Grund stark bremsen.“ Dass durchfahren darf, wer bei Gelb mit normaler Bremsung nicht mehr vor der Haltlinie zum Stehen kommt, steht nicht im Wortlaut der StVO, sondern folgt aus der Rechtsprechung. Wer bei Rot einfährt, begeht einen Rotlichtverstoß.', en: '§ 37 (2) no. 1 StVO: amber orders “wait before the junction for the next signal”. Red orders “stop before the junction”. You stop at the stop line (sign 294, annex 2 no. 67). § 4 (1) sentence 2 StVO: whoever drives ahead must not brake hard without a compelling reason. That you may drive on if normal braking at amber no longer stops you before the stop line is not in the wording of the StVO, it comes from case law. Entering at red is a red-light offence.' },
    miniTest: {
      question: { de: 'Du fährst 50 km/h auf eine grüne Ampel zu. Sie springt auf Gelb, die Haltlinie ist noch gut 60 Meter entfernt, der Hintermann ist weit weg. Was tust du?', en: 'You drive 50 km/h towards a green light. It turns amber, the stop line is still a good 60 metres away, the car behind is far away. What do you do?' },
      options: [
        { de: 'Gleichmäßig bremsen und anhalten', en: 'Brake smoothly and stop' },
        { de: 'Beschleunigen, damit du noch durchkommst', en: 'Accelerate so you get through' },
        { de: 'Hupen und durchfahren', en: 'Honk and drive through' },
      ],
      correct: 0,
      explanation: { de: 'Bei 50 km/h reichen gut 60 Meter für eine normale Bremsung. Kannst du gefahrlos anhalten, tust du das. Beschleunigen oder Hupen sind falsch.', en: 'At 50 km/h a good 60 metres is enough for normal braking. If you can stop safely, you do. Accelerating or honking is wrong.' },
    },
  },
  {
    id: 'linksabbiegen-ampel-ohne-pfeil',
    free: false,
    title: { de: 'Links abbiegen bei Grün ohne Pfeil', en: 'Turning left at green without an arrow' },
    situation: {
      de: 'Ampelkreuzung, deine Ampel zeigt Grün (runde Scheibe, kein Pfeil). Du willst links abbiegen. Der Gegenverkehr hat ebenfalls Grün und fährt geradeaus. In der Straße, in die du abbiegst, haben Fußgänger gleichzeitig Grün. Hinter dir wartet ein Auto.',
      en: 'Junction with traffic lights, your light shows green (round disc, no arrow). You want to turn left. Oncoming traffic also has green and goes straight on. Pedestrians have green at the same time in the road you turn into. A car waits behind you.',
    },
    examiner: { de: 'Biegen Sie an der Ampel bitte links ab.', en: 'Please turn left at the lights.' },
    questions: [
      { de: 'Was bedeutet das Grün ohne Pfeil für dich?', en: 'What does green without an arrow mean for you?' },
      { de: 'Wo wartest du, und worauf achtest du?', en: 'Where do you wait, and what do you watch for?' },
      { de: 'Was machst du, wenn die Ampel umschaltet?', en: 'What do you do if the light changes?' },
    ],
    keyPoints: [
      { id: 'noarrow', area: 'observation', allowNegation: true, label: { de: 'Grün ohne Pfeil: Der Gegenverkehr hat auch Grün, ich bin nicht geschützt', en: 'Green without an arrow: oncoming traffic has green too, I am not protected' }, patterns: ['ohne (gruenen )?pfeil', 'kein(en)? (gruenen )?pfeil', 'gruener kreis', 'runde\\w* (scheibe|gruen)', 'ungeschuetzt', 'green (circle|disc|light) without', 'without (an |the )?(green )?arrow', 'no (green )?arrow', 'not protected', 'unprotected'] },
      { id: 'prepare', area: 'communication', label: { de: 'Innenspiegel, linker Außenspiegel, rechtzeitig links blinken', en: 'Interior mirror, left mirror, indicate left in good time' }, patterns: [...MIRROR, 'blink', 'indicat'] },
      { id: 'position', area: 'position', label: { de: 'Zur Mitte hin einordnen', en: 'Move over towards the centre' }, patterns: ['einordn', '(zur|in der|an die|an der) mitte', 'mittig', 'move (over )?(to|towards) the (centre|center|middle)', 'centre line', 'center line', 'middle of'] },
      { id: 'wait', area: 'position', label: { de: 'In die Kreuzung einfahren, Räder gerade, auf eine Lücke warten', en: 'Enter the junction, wheels straight, wait for a gap' }, patterns: ['(raeder|lenkung|reifen) .{0,15}gerade', 'gerade\\w* .{0,15}(raeder|lenkung|reifen)', 'wheels? .{0,15}straight', 'straight .{0,15}wheels?'] },
      { id: 'oncoming', area: 'speed', severe: true, label: { de: 'Gegenverkehr, der geradeaus fährt oder rechts abbiegt, durchfahren lassen', en: 'Let oncoming traffic going straight on or turning right through' }, patterns: ['gegenverkehr .{0,40}(vorrang|vorfahrt|zuerst|durch|lass|vor\\b|warte)', '(lasse|warte) .{0,40}(gegenverkehr|entgegen)', 'oncoming .{0,40}(first|priority|go|pass|through|right of way)', '(let|wait for) .{0,30}oncoming'] },
      { id: 'pedestrians', area: 'observation', severe: true, label: { de: 'Fußgängern in der Zielstraße Vorrang lassen', en: 'Let pedestrians in the target road go first' }, patterns: ['fussgaeng\\w* .{0,40}(vorrang|vortritt|zuerst|lass|warte|gehen)', '(warte|lasse) .{0,40}fussgaeng', 'pedestrian\\w* .{0,40}(priority|first|right of way|cross|go)', '(wait for|let) .{0,30}pedestrian'] },
      { id: 'shoulder', area: 'observation', label: { de: 'Vor dem Abbiegen Schulterblick links', en: 'Shoulder check left before turning' }, patterns: SHOULDER },
      { id: 'clear', area: 'position', label: { de: 'Wechselt die Ampel, während ich warte, räume ich die Kreuzung', en: 'If the light changes while I wait, I clear the junction' }, patterns: ['raeum', 'kreuzung frei', 'zuegig (ab|raus|durch)', 'clear(ing)? the (junction|intersection)', 'leave the (junction|intersection)', 'get out of the (junction|intersection)'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'gruen gibt mir', 'green gives me', 'schnell .{0,15}(vor|durch)', '(quickly|before) the oncoming'], hint: { de: 'Grün ohne Pfeil gibt dir keinen Vorrang vor dem Gegenverkehr.', en: 'Green without an arrow gives you no priority over oncoming traffic.' } },
      { patterns: ['raeder .{0,10}(nach links|eingeschlagen)', '(schlage|lenke) .{0,20}(ein|links) .{0,20}(warte|stehe)', 'wheels turned', 'turn the wheels while'], hint: { de: 'Beim Warten die Räder gerade halten: Wirst du aufgefahren, schiebt es dich sonst in den Gegenverkehr.', en: 'Keep the wheels straight while waiting: if you are hit from behind, turned wheels push you into oncoming traffic.' } },
    ],
    steps: [
      { de: 'Ampel lesen: Grün ohne Pfeil, der Gegenverkehr fährt mit', en: 'Read the light: green without an arrow, oncoming traffic goes too' },
      { de: 'Spiegel, rechtzeitig links blinken, zur Mitte hin einordnen', en: 'Mirrors, indicate left in good time, move over towards the centre' },
      { de: 'Bei Grün in die Kreuzung einfahren, Räder gerade, warten', en: 'At green, enter the junction, wheels straight, wait' },
      { de: 'Gegenverkehr durchfahren lassen', en: 'Let oncoming traffic through' },
      { de: 'Schulterblick links, Fußgänger in der Zielstraße gehen lassen', en: 'Shoulder check left, let pedestrians in the target road go' },
      { de: 'Abbiegen oder bei Gelb und Rot die Kreuzung räumen', en: 'Turn, or at amber and red clear the junction' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Mit Schwung abbiegen, die Ampel ist grün', en: 'Turn with momentum, the light is green' }, why: { de: 'Grün ohne Pfeil gibt dir keinen Vorrang. Der Gegenverkehr und die Fußgänger haben ebenfalls Grün und gehen vor.', en: 'Green without an arrow gives you no priority. Oncoming traffic and pedestrians also have green and come first.' } },
      { area: 'position', text: { de: 'Vor der Kreuzung an der Haltlinie stehen bleiben, bis alles frei ist', en: 'Stay at the stop line before the junction until everything is clear' }, why: { de: 'Dann kommst du bei dichtem Gegenverkehr kaum zum Abbiegen und hältst den Verkehr hinter dir auf. Du fährst bei Grün bis zum Wartepunkt in die Kreuzung ein, damit du nach dem Umschalten noch abbiegen kannst.', en: 'Then in dense oncoming traffic you hardly get to turn and you hold up the traffic behind you. At green you enter the junction up to the waiting point, so you can still turn after the light changes.' } },
    ],
    modelAnswer: {
      de: 'Die Ampel zeigt Grün ohne Pfeil, ich bin also nicht geschützt: Der Gegenverkehr hat auch Grün. Ich schaue in den Innenspiegel und den linken Außenspiegel, blinke rechtzeitig links und ordne mich zur Mitte hin ein. Bei Grün fahre ich in die Kreuzung ein und warte dort mit geraden Rädern. Ich lasse den Gegenverkehr durchfahren. Mit einem Schulterblick nach links prüfe ich den Raum neben mir und lasse die Fußgänger in der Zielstraße zuerst gehen. Schaltet die Ampel um, räume ich die Kreuzung zügig, sobald der Gegenverkehr steht.',
      en: 'The light shows green without an arrow, so I am not protected: oncoming traffic has green too. I check the interior mirror and the left mirror, indicate left in good time and move over towards the centre. At green I enter the junction and wait there with the wheels straight. I let the oncoming traffic through. With a shoulder check to the left I look at the space beside me and let the pedestrians in the target road go first. If the light changes, I clear the junction briskly as soon as the oncoming traffic has stopped.',
    },
    law: { de: '§ 9 Abs. 1 StVO: Wer links abbiegen will, ordnet sich bis zur Mitte ein, zeigt es rechtzeitig an und achtet vor dem Einordnen und nochmals vor dem Abbiegen auf den nachfolgenden Verkehr. § 9 Abs. 3 StVO: Entgegenkommende Fahrzeuge durchfahren lassen; „auf zu Fuß Gehende ist besondere Rücksicht zu nehmen; wenn nötig, ist zu warten“. § 9 Abs. 4 Satz 1 StVO: Auch entgegenkommende Rechtsabbieger durchfahren lassen. § 37 Abs. 2 Nr. 1 StVO: „Grün: ‚Der Verkehr ist freigegeben‘. Er kann nach den Regeln des § 9 abbiegen.“ Dass du nach dem Umschalten die Kreuzung zügig räumst, steht nicht im Wortlaut der StVO, es ist gefestigte Praxis und Rechtsprechung; auch beim Räumen gilt weiter § 9 Abs. 3.', en: '§ 9 (1) StVO: whoever turns left moves over towards the centre, indicates in good time and watches the traffic behind before moving over and again before turning. § 9 (3) StVO: let oncoming vehicles through, take special care of pedestrians, wait if necessary. § 9 (4) sentence 1 StVO: also let oncoming right-turners through. § 37 (2) no. 1 StVO: green means traffic may go, turning follows the rules of § 9. Clearing the junction briskly after the light changes is not in the wording of the StVO, it is established practice and case law; § 9 (3) still applies while you clear it.' },
    miniTest: {
      question: { de: 'Du stehst in der Kreuzung und willst links abbiegen. Die Ampel wird gelb, der Gegenverkehr fährt noch. Was tust du?', en: 'You stand in the junction wanting to turn left. The light turns amber, oncoming traffic still drives. What do you do?' },
      options: [
        { de: 'Stehen bleiben, bis es wieder Grün wird', en: 'Stay put until it turns green again' },
        { de: 'Abbiegen, sobald der Gegenverkehr anhält, und dabei Fußgänger beachten', en: 'Turn as soon as the oncoming traffic stops, watching for pedestrians' },
        { de: 'Geradeaus mitfahren', en: 'Drive straight on with the traffic' },
      ],
      correct: 1,
      explanation: { de: 'Du räumst die Kreuzung, sobald der Gegenverkehr steht. Fußgänger, die noch Grün hatten, gehen weiter vor.', en: 'You clear the junction as soon as the oncoming traffic has stopped. Pedestrians who still had green go first.' },
    },
  },
  {
    id: 'grundstueck-ausfahrt',
    free: false,
    title: { de: 'Ausfahren aus Grundstück oder Feldweg', en: 'Leaving a driveway or a field track' },
    situation: {
      de: 'Du stehst in einer Grundstücksausfahrt. Zwischen dir und der Straße liegen ein Gehweg und ein Radweg, ein abgesenkter Bordstein, rechts eine Hecke. Auf dem Gehweg geht ein Fußgänger, auf dem Radweg kommt ein Radfahrer, auf der Straße fährt ein Auto.',
      en: 'You are in a driveway. Between you and the road are a pavement and a cycle path, a lowered kerb, a hedge on the right. A pedestrian walks on the pavement, a cyclist comes along the cycle path, a car drives on the road.',
    },
    examiner: { de: 'Fahren Sie bitte aus der Einfahrt und biegen Sie rechts auf die Straße ab.', en: 'Please leave the driveway and turn right onto the road.' },
    questions: [
      { de: 'Wer hat Vorrang?', en: 'Who has priority?' },
      { de: 'Wie fährst du heraus?', en: 'How do you drive out?' },
      { de: 'Was machst du, wenn du nichts siehst?', en: 'What do you do if you cannot see?' },
    ],
    keyPoints: [
      { id: 'speed', area: 'speed', label: { de: 'Sehr langsam, im Schritttempo ausfahren', en: 'Drive out very slowly, at walking pace' }, patterns: [...SLOW, 'schritt', 'walking pace'] },
      { id: 'stop', area: 'position', label: { de: 'Vor dem Gehweg und Radweg anhalten, wenn dort jemand kommt', en: 'Stop before the pavement and cycle path if someone comes' }, patterns: ['vor dem (gehweg|radweg|buergersteig|fussweg)', '(before|in front of) the (pavement|sidewalk|cycle path|footpath|bike path)', 'anhalt', 'halte', '\\bstop'] },
      { id: 'look', area: 'observation', label: { de: 'In beide Richtungen schauen, auch auf Gehweg und Radweg', en: 'Look both ways, also at the pavement and the cycle path' }, patterns: [...LOOK_BOTH, ...LOOK_LEFT, ...LOOK_RIGHT, 'gehweg', 'radweg', 'pavement', 'cycle path'] },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Fußgängern, Radfahrern und dem fließenden Verkehr Vorrang lassen, niemanden gefährden', en: 'Let pedestrians, cyclists and the flowing traffic go first, endanger nobody' }, patterns: ['(fussgaeng|radfahr|verkehr)\\w* .{0,40}(vorrang|vortritt|zuerst|lass|warte|gehen|durch)', '(warte|lasse) .{0,40}(fussgaeng|radfahr|verkehr)', 'gefaehrd', '(pedestrian|cyclist|traffic)\\w* .{0,40}(priority|first|right of way|go|pass)', '(wait for|let) .{0,30}(pedestrian|cyclist|traffic)', 'endanger'] },
      { id: 'help', area: 'observation', label: { de: 'Bei verdeckter Sicht vorsichtig vortasten oder mich einweisen lassen', en: 'If the view is blocked, edge forward carefully or have someone guide me' }, patterns: ['einweis', 'helfer', 'vortast', 'hineintast', 'vorsichtig (vor|ran|heran|hinein|raus)', 'guide', 'spotter', 'creep', 'edge (forward|out)', 'inch (forward|out)'] },
      { id: 'signal', area: 'communication', label: { de: 'Rechtzeitig rechts blinken', en: 'Indicate right in good time' }, patterns: ['blink', 'indicat', 'signal'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'rechts vor links', 'right before left'], hint: { de: 'Aus einem Grundstück hast du keinen Vorrang: Du musst eine Gefährdung ausschließen. Aus einem Feldweg hast du keine Vorfahrt.', en: 'Leaving a driveway you have no priority: you must rule out any danger. Coming out of a field track you have no right of way.' } },
      { patterns: ['hupe', 'hupen', 'honk', 'horn'], hint: { de: 'Hupen ersetzt nicht das Schauen und Warten: Du musst eine Gefährdung ausschließen.', en: 'Honking does not replace looking and waiting: you must rule out any danger.' } },
    ],
    steps: [
      { de: 'Rechtzeitig rechts blinken', en: 'Indicate right in good time' },
      { de: 'Im Schritttempo bis kurz vor den Gehweg rollen', en: 'Roll at walking pace up to just before the pavement' },
      { de: 'Nach links und rechts schauen, auf Fußgänger und Radfahrer achten', en: 'Look left and right, watch for pedestrians and cyclists' },
      { de: 'Sicht verdeckt: vorsichtig vortasten oder einweisen lassen', en: 'View blocked: edge forward carefully or have someone guide you' },
      { de: 'Fußgänger, Radfahrer und fließenden Verkehr vorbeilassen, vor der Fahrbahn wenn nötig nochmals anhalten', en: 'Let pedestrians, cyclists and the flowing traffic pass, stop again before the carriageway if needed' },
      { de: 'Erst einfahren, wenn eine Gefährdung ausgeschlossen ist', en: 'Only pull out when any danger is ruled out' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Zügig herausfahren, auf der Straße kommt ja nur ein Auto', en: 'Pull out briskly, only one car is coming on the road' }, why: { de: 'Du darfst erst fahren, wenn eine Gefährdung ausgeschlossen ist. Der fließende Verkehr hat Vorrang.', en: 'You may only go when any danger is ruled out. The flowing traffic has priority.' } },
      { area: 'observation', text: { de: 'Nur auf die Straße achten, der Gehweg ist unwichtig', en: 'Only watch the road, the pavement does not matter' }, why: { de: 'Auf Gehweg und Radweg sind Fußgänger und Radfahrer, auch aus beiden Richtungen. Sie haben Vorrang.', en: 'Pedestrians and cyclists use the pavement and cycle path, from both directions. They have priority.' } },
    ],
    modelAnswer: {
      de: 'Ich blinke rechtzeitig rechts und fahre im Schritttempo heraus. Fußgänger, Radfahrer und der fließende Verkehr haben Vorrang, ich darf niemanden gefährden. Vor dem Gehweg halte ich an, wenn dort jemand kommt, und schaue nach links und rechts, auch auf Gehweg und Radweg. Ist die Sicht durch die Hecke verdeckt, taste ich mich vorsichtig vor oder lasse mich einweisen. Vor der Fahrbahn halte ich wenn nötig noch einmal an und fahre erst ein, wenn alle durch sind und niemand gefährdet wird.',
      en: 'I indicate right in good time and drive out at walking pace. Pedestrians, cyclists and the flowing traffic have priority, and I must endanger nobody. I stop before the pavement if someone comes there, and I look left and right, also at the pavement and cycle path. If the hedge blocks my view, I edge forward carefully or have someone guide me. Before the carriageway I stop again if needed and only pull out when everyone has passed and nobody is endangered.',
    },
    law: { de: '§ 10 Satz 1 und 2 StVO: „Wer aus einem Grundstück, aus einer Fußgängerzone (Zeichen 242.1 und 242.2), aus einem verkehrsberuhigten Bereich (Zeichen 325.1 und 325.2) auf die Straße oder von anderen Straßenteilen oder über einen abgesenkten Bordstein hinweg auf die Fahrbahn einfahren oder vom Fahrbahnrand anfahren will, hat sich dabei so zu verhalten, dass eine Gefährdung anderer Verkehrsteilnehmer ausgeschlossen ist; erforderlichenfalls muss man sich einweisen lassen. Die Absicht einzufahren oder anzufahren ist rechtzeitig und deutlich anzukündigen; dabei sind die Fahrtrichtungsanzeiger zu benutzen.“ Feld- oder Waldweg: § 8 Abs. 1 Satz 2 Nr. 2 StVO, rechts vor links gilt nicht für Fahrzeuge, die aus einem Feld- oder Waldweg auf eine andere Straße kommen. Du bist wartepflichtig nach § 8 Abs. 2 StVO.', en: '§ 10 sentences 1 and 2 StVO: whoever wants to drive out of a property, a pedestrian zone (signs 242.1 and 242.2) or a traffic-calmed area (signs 325.1 and 325.2) onto the road, or from other parts of the road or over a lowered kerb onto the carriageway, or pull away from the kerb, must behave so that any danger to other road users is ruled out; if necessary, they must have someone guide them. The intention to pull out or pull away must be announced in good time and clearly, using the indicators. Field or forest track: § 8 (1) sentence 2 no. 2 StVO, right before left does not apply to vehicles coming from a field or forest track onto another road. You must give way under § 8 (2) StVO.' },
    miniTest: {
      question: { de: 'Du kommst aus einem Feldweg auf eine Landstraße. Von rechts nähert sich ein Auto. Wer hat Vorfahrt?', en: 'You come out of a field track onto a country road. A car approaches from the right. Who has priority?' },
      options: [
        { de: 'Du, weil du von links kommst', en: 'You, because you come from the left' },
        { de: 'Das Auto, weil es von rechts kommt', en: 'The car, because it comes from the right' },
        { de: 'Das Auto auf der Landstraße, denn aus dem Feldweg hast du keine Vorfahrt', en: 'The car on the country road, because coming out of a field track you have no priority' },
      ],
      correct: 2,
      explanation: { de: 'Aus einem Feld- oder Waldweg gilt rechts vor links nicht (§ 8 Abs. 1 Satz 2 Nr. 2 StVO). Der Verkehr auf der Straße hat Vorfahrt, egal aus welcher Richtung er kommt.', en: 'Coming out of a field or forest track right before left does not apply (§ 8 (1) sentence 2 no. 2 StVO). The traffic on the road has priority, whichever direction it comes from.' },
    },
  },
  {
    id: 'ende-vorfahrtstrasse',
    free: false,
    title: { de: 'Ende der Vorfahrtsstraße (Zeichen 307)', en: 'End of priority road (sign 307)' },
    situation: {
      de: 'Du fährst auf einer Vorfahrtsstraße. Vor einer Kreuzung steht das Zeichen „Ende der Vorfahrtsstraße“ (Zeichen 307). An der Kreuzung gibt es keine weiteren Schilder und keine Ampel. Von rechts nähert sich ein Auto.',
      en: 'You drive on a priority road. Before a crossing is the sign “end of priority road” (sign 307). The crossing has no other signs and no traffic light. A car approaches from the right.',
    },
    examiner: { de: 'Fahren Sie bitte geradeaus weiter.', en: 'Please continue straight ahead.' },
    questions: [
      { de: 'Was bedeutet das Schild?', en: 'What does the sign mean?' },
      { de: 'Wer hat an dieser Kreuzung Vorfahrt?', en: 'Who has priority at this crossing?' },
      { de: 'Worauf achtest du?', en: 'What do you watch for?' },
    ],
    keyPoints: [
      { id: 'recognise', area: 'observation', label: { de: 'Zeichen 307 erkennen: Meine Vorfahrt endet', en: 'Spot sign 307: my priority ends' }, patterns: ['zeichen 307', 'ende der vorfahrt', 'vorfahrt endet', 'sign 307', 'end of (the )?priority', 'priority (road )?ends'] },
      { id: 'speed', area: 'speed', label: { de: 'Tempo reduzieren, bremsbereit heranfahren', en: 'Reduce speed, approach ready to brake' }, patterns: SLOW },
      { id: 'rule', area: 'observation', label: { de: 'Ab hier gelten die allgemeinen Regeln: rechts vor links, wenn keine Schilder oder Ampel etwas anderes regeln', en: 'From here the general rules apply: right before left, unless signs or lights say otherwise' }, patterns: ['rechts vor links', 'allgemeine\\w* (regel|vorfahrt)', 'right before left', 'general (rule|priority)', 'right[- ]hand rule'] },
      { id: 'signs', area: 'observation', label: { de: 'An der Kreuzung auf weitere Schilder und Markierungen achten', en: 'Check the crossing for further signs and markings' }, patterns: ['schilder', 'verkehrszeichen', '(weitere|andere)\\w* zeichen', 'markierung', 'ampel', 'signs', 'markings', 'traffic light'] },
      { id: 'right', area: 'observation', label: { de: 'Nach rechts schauen', en: 'Look right' }, patterns: [...LOOK_RIGHT, 'von rechts', 'from the right'] },
      { id: 'yield', area: 'speed', severe: true, label: { de: 'Dem Auto von rechts die Vorfahrt lassen', en: 'Give way to the car from the right' }, patterns: ['vorfahrt (lassen|gewaehr)', 'lasse\\w* (\\w+ ){0,6}vorfahrt', 'lasse\\w* (\\w+ ){0,4}(vorbei|durch|zuerst|fahren)', 'gewaehre', 'vorrang', 'give way', 'yield', '(let|wait for) (\\w+ ){0,4}(pass|first|through)', 'from the right .{0,30}(priority|first|goes)'] },
      { id: 'left', area: 'observation', label: { de: 'Auch nach links schauen', en: 'Look left as well' }, patterns: LOOK_LEFT },
    ],
    contradictions: [
      { patterns: ['ich habe (noch )?(die )?vorfahrt', 'i (still )?have (the )?(priority|right of way)', 'vorfahrt (bleibt|gilt weiter)', 'priority (stays|continues)'], hint: { de: 'Zeichen 307 beendet deine Vorfahrt: Ohne weitere Schilder gilt an der Kreuzung rechts vor links.', en: 'Sign 307 ends your priority: without further signs right before left applies at the crossing.' } },
      { patterns: ['mit tempo (durch|weiter)', 'gleiche\\w* (tempo|geschwindigkeit)', 'same speed', 'at full speed', 'without slowing'], hint: { de: 'Nach Zeichen 307 verlierst du die Vorfahrt: Fahre langsamer, bremsbereit heran.', en: 'After sign 307 you lose priority: slow down and approach ready to brake.' } },
    ],
    steps: [
      { de: 'Zeichen 307 erkennen: Die Vorfahrt endet', en: 'Spot sign 307: the priority ends' },
      { de: 'Tempo reduzieren, bremsbereit', en: 'Reduce speed, ready to brake' },
      { de: 'Kreuzung auf Schilder, Ampel und Markierungen prüfen', en: 'Check the crossing for signs, lights and markings' },
      { de: 'Nach rechts schauen: Es gilt rechts vor links', en: 'Look right: right before left applies' },
      { de: 'Auch nach links schauen, Fußgänger und Radfahrer beachten', en: 'Look left as well, watch for pedestrians and cyclists' },
      { de: 'Dem Auto von rechts die Vorfahrt lassen, dann weiterfahren', en: 'Give way to the car from the right, then drive on' },
    ],
    mistakes: [
      { area: 'speed', severe: true, text: { de: 'Mit unverändertem Tempo durchfahren, ich komme ja von der Vorfahrtsstraße', en: 'Drive through at the same speed, I come from the priority road' }, why: { de: 'Zeichen 307 hebt deine Bevorrechtigung auf. Ab der Kreuzung hat das Auto von rechts Vorfahrt.', en: 'Sign 307 cancels your priority. From the crossing the car from the right has priority.' } },
      { area: 'observation', text: { de: 'Nur auf Schilder achten und nicht nach rechts schauen', en: 'Only look at signs and not to the right' }, why: { de: 'Ohne weitere Schilder entscheidet der Verkehr von rechts. Du musst ihn sehen, um Vorfahrt zu gewähren.', en: 'Without further signs the traffic from the right decides. You have to see it to give way.' } },
    ],
    modelAnswer: {
      de: 'Ich erkenne das Zeichen 307: Meine Vorfahrt endet. Ich reduziere das Tempo und fahre bremsbereit heran. An der Kreuzung achte ich auf weitere Schilder und Markierungen. Fehlen sie, gilt rechts vor links. Ich schaue nach rechts und schaue auch nach links und lasse dem Auto von rechts die Vorfahrt. Erst danach fahre ich weiter.',
      en: 'I spot sign 307: my priority ends. I reduce speed and approach ready to brake. At the crossing I check for further signs and markings. If they are missing, right before left applies. I look to the right and I look left as well, and give way to the car from the right. Only then do I drive on.',
    },
    law: { de: '§ 42 StVO i. V. m. Anlage 3 lfd. Nr. 3 (Zeichen 307): Ende der Vorfahrtstraße. Anlage 3 lfd. Nr. 2 (Zeichen 306): Vorfahrt besteht bis zum nächsten Zeichen 205, 206 oder 307. Danach gilt § 8 Abs. 1 Satz 1 StVO: „An Kreuzungen und Einmündungen hat die Vorfahrt, wer von rechts kommt.“ Das gilt nicht, wenn die Vorfahrt durch Verkehrszeichen besonders geregelt ist (Zeichen 205, 206, 301, 306, § 8 Abs. 1 Satz 2 Nr. 1 StVO). Eine Ampel geht allem vor (§ 37 Abs. 1 StVO).', en: '§ 42 StVO with annex 3 no. 3 (sign 307): end of priority road. Annex 3 no. 2 (sign 306): priority lasts until the next sign 205, 206 or 307. After that § 8 (1) sentence 1 StVO applies: at crossings and junctions, whoever comes from the right has priority. This does not apply when priority is specially regulated by signs (signs 205, 206, 301, 306, § 8 (1) sentence 2 no. 1 StVO). A traffic light takes precedence over all of these (§ 37 (1) StVO).' },
    miniTest: {
      question: { de: 'Nach Zeichen 307 erkennst du an der Querstraße die Rückseite eines Zeichens 205 (auf der Spitze stehendes Dreieck). Ein Auto kommt von rechts. Wer fährt zuerst?', en: 'After sign 307 you recognise the back of a sign 205 (triangle standing on its point) on the cross road. A car comes from the right. Who goes first?' },
      options: [
        { de: 'Du, weil die Querstraße Vorfahrt gewähren muss', en: 'You, because the cross road has to give way' },
        { de: 'Das Auto von rechts', en: 'The car from the right' },
        { de: 'Wer zuerst da ist', en: 'Whoever arrives first' },
      ],
      correct: 0,
      explanation: { de: 'Schilder gehen rechts vor links vor (§ 8 Abs. 1 Satz 2 Nr. 1 StVO). Muss die Querstraße nach Zeichen 205 warten, hast du Vorfahrt, auch wenn das Zeichen 307 davorsteht. Du bleibst trotzdem bremsbereit. Prüfe immer die Schilder an der Kreuzung selbst.', en: 'Signs take precedence over right before left (§ 8 (1) sentence 2 no. 1 StVO). If the cross road must wait under sign 205, you have priority, even with sign 307 before it. You still stay ready to brake. Always check the signs at the crossing itself.' },
    },
  },
  {
    id: 'linksabbieger-gegenueber',
    free: false,
    title: { de: 'Zwei Linksabbieger gegenüber', en: 'Two left-turners facing each other' },
    situation: {
      de: 'Ampelkreuzung ohne Linksabbiegerpfeil, beide Richtungen haben Grün. Du willst links abbiegen. Dir gegenüber wartet ein zweites Auto, das ebenfalls links abbiegen will. Hinter ihm fährt weiterer Gegenverkehr geradeaus. In der Zielstraße queren Fußgänger.',
      en: 'Junction with traffic lights and no left-turn arrow, both directions have green. You want to turn left. Opposite you waits a second car that also wants to turn left. Behind it more oncoming traffic goes straight on. Pedestrians cross in the target road.',
    },
    examiner: { de: 'Biegen Sie an der Ampel bitte links ab.', en: 'Please turn left at the lights.' },
    questions: [
      { de: 'Wie biegst du ab, wenn dir ein Linksabbieger gegenübersteht?', en: 'How do you turn when a left-turner faces you?' },
      { de: 'Wann biegst du anders ab?', en: 'When do you turn differently?' },
      { de: 'Auf wen wartest du?', en: 'Who do you wait for?' },
    ],
    keyPoints: [
      { id: 'prepare', area: 'communication', label: { de: 'Innenspiegel, linker Außenspiegel, rechtzeitig links blinken', en: 'Interior mirror, left mirror, indicate left in good time' }, patterns: [...MIRROR, 'blink', 'indicat'] },
      { id: 'position', area: 'position', label: { de: 'Zur Mitte hin einordnen', en: 'Move over towards the centre' }, patterns: ['einordn', '(zur|in der|an die|an der) mitte', 'mittig', 'move (over )?(to|towards) the (centre|center|middle)', 'centre line', 'center line', 'middle of'] },
      { id: 'shoulder', area: 'observation', label: { de: 'Vor dem Abbiegen Schulterblick links', en: 'Shoulder check left before turning' }, patterns: SHOULDER },
      { id: 'tangent', area: 'position', label: { de: 'Voreinander (tangential) abbiegen, ohne die Kreuzungsmitte zu umfahren', en: 'Turn in front of each other (tangentially), without going round the centre of the junction' }, patterns: ['voreinander', 'tangential', 'in front of each other', 'tangent'] },
      { id: 'exception', area: 'position', label: { de: 'Erfordern Verkehrslage oder Gestaltung der Kreuzung (etwa Markierungen) es, biege ich erst ab, wenn wir aneinander vorbeigefahren sind (hintereinander)', en: 'If the traffic situation or the layout of the junction (such as markings) requires it, I only turn once we have passed each other (behind each other)' }, patterns: ['markierung', 'verkehrslage', 'gestaltung', 'hintereinander', 'aneinander vorbei', 'kreuzungsmitte', 'marking', 'traffic situation', 'layout', 'behind each other', 'one behind the other', 'passed each other', '(round|around) the (centre|center)'] },
      { id: 'oncoming', area: 'speed', severe: true, label: { de: 'Gegenverkehr geradeaus durchfahren lassen, auch den hinter dem Gegenüber', en: 'Let oncoming traffic going straight on through, also the traffic behind the other car' }, patterns: ['gegenverkehr .{0,40}(vorrang|vorfahrt|zuerst|durch|lass|vor\\b|warte)', '(lasse|warte) .{0,40}(gegenverkehr|entgegen)', 'oncoming .{0,40}(first|priority|go|pass|through|right of way)', '(let|wait for) .{0,30}oncoming'] },
      { id: 'pedestrians', area: 'observation', severe: true, label: { de: 'Fußgängern in der Zielstraße Vorrang lassen', en: 'Let pedestrians in the target road go first' }, patterns: ['fussgaeng\\w* .{0,40}(vorrang|vortritt|zuerst|lass|warte|gehen)', '(warte|lasse) .{0,40}fussgaeng', 'pedestrian\\w* .{0,40}(priority|first|right of way|cross|go)', '(wait for|let) .{0,30}pedestrian'] },
    ],
    contradictions: [
      { patterns: ['ich habe (die )?vorfahrt', 'i have (the )?(priority|right of way)', 'ich (fahre|biege) zuerst', 'i (go|turn) first'], hint: { de: 'Gegenüber stehende Linksabbieger haben gleichen Rang: Sie müssen aufeinander achten und dürfen den Gegenverkehr nicht behindern.', en: 'Facing left-turners have equal rank: they must watch each other and not hinder oncoming traffic.' } },
      { patterns: ['hupe', 'hupen', 'honk', 'horn'], hint: { de: 'Hupen löst die Situation nicht: Verständigt euch durch Fahrverhalten und Blickkontakt.', en: 'Honking does not solve the situation: communicate by how you drive and by eye contact.' } },
    ],
    steps: [
      { de: 'Spiegel, rechtzeitig links blinken, zur Mitte hin einordnen', en: 'Mirrors, indicate left in good time, move over towards the centre' },
      { de: 'Bei Grün in die Kreuzung einfahren und warten, Räder gerade', en: 'At green, enter the junction and wait, wheels straight' },
      { de: 'Gegenverkehr geradeaus durchfahren lassen, auch den hinter dem Gegenüber', en: 'Let oncoming traffic going straight on through, also the traffic behind the other car' },
      { de: 'Mit dem Gegenüber Blickkontakt suchen, voreinander (tangential) abbiegen', en: 'Seek eye contact with the other driver, turn in front of each other (tangentially)' },
      { de: 'Schulterblick links, Fußgänger in der Zielstraße gehen lassen', en: 'Shoulder check left, let pedestrians in the target road go' },
      { de: 'Erfordern Verkehrslage oder Gestaltung der Kreuzung es, erst nach dem Vorbeifahren (hintereinander) abbiegen', en: 'If the traffic situation or the junction layout requires it, turn only after passing each other (behind each other)' },
    ],
    mistakes: [
      { area: 'position', text: { de: 'Immer die Kreuzungsmitte umfahren, damit es sicher ist', en: 'Always drive round the centre of the junction to be safe' }, why: { de: 'Die Regel ist voreinander abbiegen. Hintereinander ist die Ausnahme, wenn Verkehrslage oder Gestaltung der Kreuzung es erfordern.', en: 'The rule is to turn in front of each other. Behind each other is the exception, when the traffic situation or the junction layout requires it.' } },
      { area: 'speed', severe: true, text: { de: 'Schnell abbiegen, weil das Gegenüber verdeckt, was hinter ihm kommt', en: 'Turn quickly because the other car hides what comes behind it' }, why: { de: 'Verdeckter Gegenverkehr hat Vorrang. Biege erst ab, wenn du ihn siehst und niemanden gefährdest.', en: 'Hidden oncoming traffic has priority. Only turn once you can see it and endanger nobody.' } },
    ],
    modelAnswer: {
      de: 'Ich schaue in den Innenspiegel und den linken Außenspiegel, blinke rechtzeitig links und ordne mich zur Mitte hin ein. Bei Grün fahre ich in die Kreuzung ein und warte mit geraden Rädern. Ich lasse den Gegenverkehr geradeaus durchfahren, auch den hinter dem Gegenüber. Der andere Linksabbieger und ich biegen voreinander ab, also tangential, ohne die Kreuzungsmitte zu umfahren. Erfordern die Verkehrslage oder die Gestaltung der Kreuzung, etwa eine Markierung, etwas anderes, biege ich hintereinander ab. Nach einem Schulterblick nach links lasse ich die Fußgänger in der Zielstraße zuerst gehen.',
      en: 'I check the interior mirror and the left mirror, indicate left in good time and move over towards the centre. At green I enter the junction and wait with the wheels straight. I let the oncoming traffic going straight on through, also the traffic behind the other car. The other left-turner and I turn in front of each other, tangentially, without going round the centre of the junction. If the traffic situation or the junction layout, such as a marking, requires otherwise, I turn behind each other. After a shoulder check to the left I let the pedestrians in the target road go first.',
    },
    law: { de: '§ 9 Abs. 1 StVO: Wer links abbiegen will, ordnet sich bis zur Mitte ein und achtet vor dem Einordnen und nochmals vor dem Abbiegen auf den nachfolgenden Verkehr. § 9 Abs. 3 StVO: Entgegenkommende Fahrzeuge durchfahren lassen (Satz 1); „auf zu Fuß Gehende ist besondere Rücksicht zu nehmen; wenn nötig, ist zu warten“ (Satz 3). § 9 Abs. 4 Satz 1 StVO: Auch entgegenkommende Rechtsabbieger durchfahren lassen. § 9 Abs. 4 Satz 2 StVO: „Einander entgegenkommende Fahrzeuge, die jeweils nach links abbiegen wollen, müssen voreinander abbiegen, es sei denn, die Verkehrslage oder die Gestaltung der Kreuzung erfordern, erst dann abzubiegen, wenn die Fahrzeuge aneinander vorbeigefahren sind.“', en: '§ 9 (1) StVO: whoever turns left moves over towards the centre and watches the traffic behind before moving over and again before turning. § 9 (3) StVO: let oncoming vehicles through (sentence 1); take special care of pedestrians, wait if necessary (sentence 3). § 9 (4) sentence 1 StVO: also let oncoming right-turners through. § 9 (4) sentence 2 StVO: oncoming vehicles that each want to turn left must turn in front of each other, unless the traffic situation or the layout of the junction requires them to turn only once they have passed each other.' },
    miniTest: {
      question: { de: 'Du und ein Gegenüber wollt beide links abbiegen. Auf der Fahrbahn ist eine Markierung, die zum Umfahren der Kreuzungsmitte zwingt. Wie biegst du ab?', en: 'You and an oncoming driver both want to turn left. A marking on the road forces you to go round the centre of the junction. How do you turn?' },
      options: [
        { de: 'Trotzdem voreinander, die Regel gilt immer', en: 'In front of each other anyway, the rule always applies' },
        { de: 'Hintereinander, der Markierung folgend', en: 'Behind each other, following the marking' },
        { de: 'Gar nicht, du wartest auf Rot', en: 'Not at all, you wait for red' },
      ],
      correct: 1,
      explanation: { de: 'Die Gestaltung der Kreuzung, hier die Markierung, ist die Ausnahme von der Regel: Du folgst ihr und biegst hintereinander ab.', en: 'The junction layout, here the marking, is the exception to the rule: you follow it and turn behind each other.' },
    },
  },
];

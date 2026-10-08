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
];

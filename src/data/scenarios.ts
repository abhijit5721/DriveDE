export interface Scenario {
  id: string;
  titleDe: string;
  titleEn: string;
  situationDe: string;
  situationEn: string;
  questionDe: string;
  questionEn: string;
  options: {
    id: string;
    textDe: string;
    textEn: string;
  }[];
  correctId: string;
  explanationDe: string;
  explanationEn: string;
  icon: string;
}

export const scenarios: Scenario[] = [
  {
    id: 's1',
    titleDe: 'Kreisverkehr',
    titleEn: 'Roundabout',
    situationDe: 'Sie nähern sich einem Kreisverkehr. Es sind bereits Fahrzeuge im Kreisverkehr.',
    situationEn: 'You are approaching a roundabout. There are already vehicles in the roundabout.',
    questionDe: 'Was ist die richtige Reihenfolge?',
    questionEn: 'What is the correct sequence?',
    options: [
      { id: 'a', textDe: 'Blinken, einfahren, Vorfahrt erzwingen', textEn: 'Signal, enter, force right of way' },
      { id: 'b', textDe: 'Warten, freie Lücke abwarten, ohne Blinker einfahren, beim Ausfahren blinken', textEn: 'Wait, find gap, enter without signal, signal when exiting' },
      { id: 'c', textDe: 'Rechts blinken, sofort einfahren', textEn: 'Signal right, enter immediately' },
    ],
    correctId: 'b',
    explanationDe: 'Im Kreisverkehr haben die Fahrzeuge IM Kreis Vorfahrt. Beim Einfahren nicht blinken, beim Ausfahren rechts blinken.',
    explanationEn: 'Vehicles IN the roundabout have right of way. Do not signal when entering, signal right when exiting.',
    icon: '🔄',
  },
  {
    id: 's2',
    titleDe: 'Rechts vor Links',
    titleEn: 'Right Before Left',
    situationDe: 'Sie fahren auf einer gleichrangigen Straße. Von rechts kommt ein Fahrzeug.',
    situationEn: 'You are driving on an equal-priority road. A vehicle is coming from the right.',
    questionDe: 'Wer hat Vorfahrt?',
    questionEn: 'Who has right of way?',
    options: [
      { id: 'a', textDe: 'Ich habe Vorfahrt', textEn: 'I have right of way' },
      { id: 'b', textDe: 'Das Fahrzeug von rechts hat Vorfahrt', textEn: 'The vehicle from the right has right of way' },
      { id: 'c', textDe: 'Wer zuerst da war', textEn: 'Whoever arrived first' },
    ],
    correctId: 'b',
    explanationDe: 'Rechts vor Links! Das Fahrzeug von rechts hat immer Vorfahrt auf gleichrangigen Straßen.',
    explanationEn: 'Right before left! The vehicle from the right always has right of way on equal-priority roads.',
    icon: '➡️',
  },
  {
    id: 's3',
    titleDe: 'Zebrastreifen',
    titleEn: 'Pedestrian Crossing',
    situationDe: 'Ein Fußgänger wartet am Zebrastreifen. Sie sind 30m entfernt.',
    situationEn: 'A pedestrian is waiting at the crosswalk. You are 30m away.',
    questionDe: 'Wie verhalten Sie sich?',
    questionEn: 'How do you behave?',
    options: [
      { id: 'a', textDe: 'Weiterfahren, der Fußgänger wartet ja noch', textEn: 'Continue driving, the pedestrian is still waiting' },
      { id: 'b', textDe: 'Hupen um den Fußgänger zu warnen', textEn: 'Honk to warn the pedestrian' },
      { id: 'c', textDe: 'Anhalten und dem Fußgänger Vorrang gewähren', textEn: 'Stop and give the pedestrian right of way' },
    ],
    correctId: 'c',
    explanationDe: 'Fußgänger haben am Zebrastreifen IMMER Vorrang. Sie müssen anhalten, sobald ein Fußgänger erkennbar warten möchte.',
    explanationEn: 'Pedestrians ALWAYS have right of way at crosswalks. You must stop as soon as a pedestrian visibly wants to cross.',
    icon: '🚶',
  },
  {
    id: 's4',
    titleDe: 'Autobahn-Auffahrt',
    titleEn: 'Highway Merge',
    situationDe: 'Sie fahren auf die Autobahn auf. Der Beschleunigungsstreifen endet in 200m.',
    situationEn: 'You are merging onto the highway. The acceleration lane ends in 200m.',
    questionDe: 'Was tun Sie?',
    questionEn: 'What do you do?',
    options: [
      { id: 'a', textDe: 'Langsam fahren und auf eine Lücke warten', textEn: 'Drive slowly and wait for a gap' },
      { id: 'b', textDe: 'Auf Autobahngeschwindigkeit beschleunigen, Schulterblick, einfädeln', textEn: 'Accelerate to highway speed, shoulder check, merge' },
      { id: 'c', textDe: 'Am Ende des Streifens anhalten wenn keine Lücke da ist', textEn: 'Stop at the end if there is no gap' },
    ],
    correctId: 'b',
    explanationDe: 'Auf dem Beschleunigungsstreifen müssen Sie auf Autobahngeschwindigkeit beschleunigen! Schulterblick nicht vergessen!',
    explanationEn: 'You must accelerate to highway speed on the acceleration lane! Don\'t forget the shoulder check!',
    icon: '🛤️',
  },
  {
    id: 's5',
    titleDe: 'Nachtfahrt',
    titleEn: 'Night Driving',
    situationDe: 'Sie fahren nachts auf einer Landstraße. Gegenverkehr kommt.',
    situationEn: 'You are driving at night on a country road. Oncoming traffic is approaching.',
    questionDe: 'Wann müssen Sie abblenden?',
    questionEn: 'When must you dip your lights?',
    options: [
      { id: 'a', textDe: 'Sobald der Gegenverkehr sichtbar wird', textEn: 'As soon as oncoming traffic is visible' },
      { id: 'b', textDe: 'Erst wenn der Gegenverkehr blendet', textEn: 'Only when oncoming traffic blinds you' },
      { id: 'c', textDe: 'Fernlicht anlassen, der andere muss abblenden', textEn: 'Keep high beams on, the other must dip' },
    ],
    correctId: 'a',
    explanationDe: 'Sie müssen abblenden BEVOR der Gegenverkehr geblendet wird! Fernlicht nur wenn kein Gegenverkehr.',
    explanationEn: 'You must dip your lights BEFORE oncoming traffic is blinded! High beams only when no oncoming traffic.',
    icon: '🌙',
  },
];

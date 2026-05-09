/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

export interface ExamCommand {
  de: string;
  en: string;
}

export const examCommands: ExamCommand[] = [
  // Standard turns and navigation
  { de: 'Fahren Sie bitte die nächste Straße links.', en: 'Please take the next street on the left.' },
  { de: 'An der nächsten Kreuzung, bitte rechts abbiegen.', en: 'At the next intersection, please turn right.' },
  { de: 'Wir fahren geradeaus, bis ich etwas anderes sage.', en: 'We\'ll keep going straight until I say otherwise.' },
  { de: 'Bitte wenden Sie bei der nächsten Gelegenheit.', en: 'Please turn around at the next opportunity.' },
  { de: 'An der Ampel, bitte links abbiegen.', en: 'At the traffic light, please turn left.' },
  { de: 'Nehmen Sie die zweite Ausfahrt im Kreisverkehr.', en: 'Take the second exit at the roundabout.' },
  { de: 'Wir folgen der abknickenden Vorfahrtsstraße.', en: 'We follow the bending priority road.' },
  { de: 'Biegen Sie in die nächste Einfahrt auf der rechten Seite ein.', en: 'Turn into the next driveway on the right.' },

  // Maneuvers
  { de: 'Suchen Sie sich eine geeignete Stelle zum Rückwärts-Einparken.', en: 'Find a suitable spot for reverse parking.' },
  { de: 'Wir machen jetzt eine Gefahrbremsung.', en: 'We are going to perform an emergency stop now.' },
  { de: 'Bitte parken Sie vorwärts in eine Parklücke auf der linken Seite.', en: 'Please park forward into a parking space on the left.' },
  { de: 'Wenden Sie bitte in drei Zügen.', en: 'Please turn around in three points (3-point turn).' },
  { de: 'Parken Sie bitte parallel zum Fahrbahnrand ein.', en: 'Please park parallel to the curb.' },

  // Highway (Autobahn)
  { de: 'Wir fahren jetzt auf die Autobahn. Bitte beschleunigen Sie auf die Richtgeschwindigkeit.', en: 'We are now entering the highway. Please accelerate to the recommended speed.' },
  { de: 'Bitte wechseln Sie auf den linken Fahrstreifen.', en: 'Please change to the left lane.' },
  { de: 'Überholen Sie bitte den LKW vor uns.', en: 'Please overtake the truck in front of us.' },
  { de: 'Verlassen Sie die Autobahn an der nächsten Ausfahrt.', en: 'Exit the highway at the next exit.' },
  { de: 'Fahren Sie bitte auf den nächsten Parkplatz.', en: 'Please pull into the next parking lot.' },

  // Specific instructions
  { de: 'Fahren Sie bitte in die Zone 30 ein.', en: 'Please enter the 30 km/h zone.' },
  { de: 'Beachten Sie das Verkehrszeichen \'Rechts vor Links\'.', en: 'Observe the \'Right before Left\' priority rule.' },
  { de: 'Die Prüfung ist jetzt beendet. Fahren Sie bitte zurück zum Ausgangspunkt.', en: 'The exam is now over. Please drive back to the starting point.' },
  { de: 'Halten Sie bitte am rechten Fahrbahnrand an.', en: 'Please pull over to the right curb.' },
  { de: 'Fahren Sie bei der nächsten Möglichkeit wieder los.', en: 'Start driving again when possible.' },
];

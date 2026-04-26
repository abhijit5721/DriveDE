/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * maneuvers.ts
 * 
 * Centralized data for driving maneuvers used in the simulator.
 */

export interface AnimationStep {
  id: number;
  description: string;
  descriptionEn: string;
  duration: number; // in ms
}

export const MANEUVER_STEPS: Record<string, AnimationStep[]> = {
  'parallel-parking': [
    { id: 0, description: 'Neben dem parkenden Fahrzeug anhalten (ca. 50cm Abstand)', descriptionEn: 'Stop next to parked car (approx. 50cm gap)', duration: 2000 },
    { id: 1, description: 'Rundum-Blick durchführen, beide Seiten und den Heckraum prüfen', descriptionEn: 'Perform a 360° check, scanning both sides and the rear area', duration: 1800 },
    { id: 2, description: 'Rückwärts fahren bis Hinterachse auf Höhe des hinteren Stoßfängers', descriptionEn: 'Reverse until rear axle aligns with rear bumper', duration: 2500 },
    { id: 3, description: 'Lenkrad nach rechts einschlagen (ca. 45°)', descriptionEn: 'Turn steering wheel right (approx. 45°)', duration: 2000 },
    { id: 4, description: 'Langsam rückwärts in die Lücke fahren', descriptionEn: 'Slowly reverse into the gap', duration: 3000 },
    { id: 5, description: 'Gegenlenken wenn Fahrzeug im 45° Winkel steht', descriptionEn: 'Counter-steer when car is at 45° angle', duration: 2000 },
    { id: 6, description: 'Gerade ausrichten, max. 30cm vom Bordstein', descriptionEn: 'Straighten up, max 30cm from curb', duration: 2000 },
  ],
  'reverse-parking': [
    { id: 0, description: 'An der Parklücke vorbeifahren, Blinker rechts setzen', descriptionEn: 'Drive past parking space, signal right', duration: 2000 },
    { id: 1, description: 'Rundum-Blick durchführen und die Umgebung vollständig prüfen', descriptionEn: 'Perform a full 360° check and scan the surroundings completely', duration: 1800 },
    { id: 2, description: 'Rückwärtsgang einlegen, langsam zurücksetzen', descriptionEn: 'Engage reverse, slowly back up', duration: 2000 },
    { id: 3, description: 'Lenkrad nach rechts einschlagen', descriptionEn: 'Turn steering wheel right', duration: 2000 },
    { id: 4, description: 'In die Lücke einfahren, auf Markierungen achten', descriptionEn: 'Enter space, watch for markings', duration: 3000 },
    { id: 5, description: 'Fahrzeug gerade ausrichten', descriptionEn: 'Straighten the vehicle', duration: 2000 },
    { id: 6, description: 'Mittig in der Lücke positionieren', descriptionEn: 'Position centered in space', duration: 1500 },
  ],
  'three-point-turn': [
    { id: 0, description: 'Rechts ranfahren, Blinker links setzen', descriptionEn: 'Pull over right, signal left', duration: 1500 },
    { id: 1, description: 'Spiegel- & Schulterblick links!', descriptionEn: 'Mirror & shoulder check left!', duration: 1500 },
    { id: 2, description: 'Einschlagen und bis zum Bordstein vorfahren', descriptionEn: 'Full lock left and drive to curb', duration: 2500 },
    { id: 3, description: 'Rückwärtsgang, Blinker RECHTS, Rundum-Blick!', descriptionEn: 'Reverse gear, signal RIGHT, 360° check!', duration: 2000 },
    { id: 4, description: 'Rückwärts bis zum gegenüberliegenden Bordstein', descriptionEn: 'Reverse to opposite curb', duration: 2500 },
    { id: 5, description: 'Ersten Gang, Blinker LINKS, Schulterblick!', descriptionEn: 'First gear, signal LEFT, shoulder check!', duration: 2000 },
    { id: 6, description: 'Fahrt in Gegenrichtung fortsetzen', descriptionEn: 'Continue in opposite direction', duration: 2000 },
  ],
  'emergency-brake': [
    { id: 0, description: 'Konstante Fahrt (ca. 30 km/h)', descriptionEn: 'Constant driving (approx. 30 km/h)', duration: 2000 },
    { id: 1, description: 'Kommando "GEFAHR! STOPP!" vom Prüfer', descriptionEn: 'Instructor command: "DANGER! STOP!"', duration: 1000 },
    { id: 2, description: 'Schlagartige Vollbremsung (Kupplung + Bremse)', descriptionEn: 'Sudden full braking (clutch + brake)', duration: 1500 },
    { id: 3, description: 'Fahrzeug halten bis zum Stillstand', descriptionEn: 'Hold vehicle until full stop', duration: 1500 },
    { id: 4, description: 'Umfeld prüfen vor erneutem Anfahren', descriptionEn: 'Check surroundings before moving off', duration: 2000 },
  ],
  'roundabout': [
    { id: 0, description: 'An den Kreisverkehr heranfahren', descriptionEn: 'Approach the roundabout', duration: 2000 },
    { id: 1, description: 'Vorfahrt beachten, links prüfen!', descriptionEn: 'Yield, check left!', duration: 2000 },
    { id: 2, description: 'Einfahren (OHNE Blinken!)', descriptionEn: 'Enter (WITHOUT signaling!)', duration: 2000 },
    { id: 3, description: 'Im Kreisel fahren', descriptionEn: 'Drive in roundabout', duration: 2500 },
    { id: 4, description: 'Blinker RECHTS & Schulterblick!', descriptionEn: 'Signal RIGHT & shoulder check!', duration: 2000 },
    { id: 5, description: 'Kreisverkehr verlassen', descriptionEn: 'Exit roundabout', duration: 2000 },
  ],
  'highway-merge': [
    { id: 0, description: 'Beschleunigungsstreifen befahren', descriptionEn: 'Enter acceleration lane', duration: 2000 },
    { id: 1, description: 'Blinker LINKS, Geschwindigkeit aufbauen', descriptionEn: 'Signal LEFT, build speed', duration: 2000 },
    { id: 2, description: 'Spiegel- & Schulterblick links!', descriptionEn: 'Mirror & shoulder check left!', duration: 2000 },
    { id: 3, description: 'In den fließenden Verkehr einordnen', descriptionEn: 'Merge into flowing traffic', duration: 2500 },
  ],
};

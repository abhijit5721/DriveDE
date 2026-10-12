# Tutorial: DriveDE in 4 Minuten (App-Walkthrough)

Format: 1920x1080, screen recordings of the app (phone frame centred on navy, like the landing
demo, or full desktop view), short title cards between sections, free TTS voice
(de-DE-FlorianMultilingualNeural), subtitles aligned per scene. Target length 4:00.
English version from the same recordings with en-US-AndrewNeural.

Rules: only what the app does today; no "3D", no automatic mistake detection, no app-store
claims; the founder is a learner, never "ich habe bestanden"; no em or en dashes on screen;
on-screen text shorter than the narration.

| # | Visual (recording) | On-screen text | Narration (DE) | ~s |
|---|---|---|---|---|
| 1 | Title card, then the landing page hero with the 600 € line and "Jetzt kostenlos starten" | DriveDE: die App für die praktische Prüfung | Ein Fehlversuch in der praktischen Prüfung kostet schnell bis zu 600 Euro. DriveDE ist die App für die Zeit zwischen den Fahrstunden: Situationen vorher üben, die Fahrstunde danach nachbereiten und sehen, woran du noch arbeiten musst. Hier zeige ich dir in vier Minuten, wie sie funktioniert. | 20 |
| 2 | Tap "Jetzt kostenlos starten", choose Klasse B Schaltgetriebe, the dashboard appears with the "Dein erster Schritt" card | Start ohne Anmeldung | Du startest ohne Anmeldung. Du wählst deine Klasse, Schaltung oder Automatik oder die Umschreibung eines ausländischen Führerscheins, und bist auf dem Dashboard. Oben siehst du deinen ersten Schritt, unten deine Prüfungsreife. Die wächst mit jeder Übung und jeder Fahrstunde. | 22 |
| 3 | Open the Prüfungssimulation from the dashboard, show the list of 8 situations and the "So bewertet der Prüfer" card | Prüfungssimulation | Das Herzstück ist die Prüfungssimulation. Acht Situationen aus der praktischen Prüfung, vom Zebrastreifen bis zur Autobahnauffahrt, drei davon kostenlos. Und eine Erklärung, wie der Prüfer wirklich bewertet. | 18 |
| 4 | Open Zebrastreifen, step mode: tap cards in order including one mistake, check, show the result with the right order and the severe badge | Schritte in die richtige Reihenfolge bringen | Du liest die Situation, hörst, was der Prüfer sagt, und tippst die Schritte in der Reihenfolge an, in der du sie machen würdest. Zwei Karten sind Fehler. Nach dem Prüfen siehst du, was richtig war, was an der falschen Stelle stand und welcher Fehler in der echten Prüfung schwer wiegt. | 26 |
| 5 | Switch to "Frei antworten", speak an answer with the microphone (or type), check, show the point list, the grid "Im Prüfprotokoll des Prüfers" and the AI feedback button | Oder in eigenen Worten | Wer weiter ist, antwortet frei: tippen oder einfach ins Mikrofon sprechen. Die App prüft deine Antwort auf dem Handy und zeigt, welche Punkte du getroffen hast, sortiert nach den fünf Bereichen, die der Prüfer auf seinem Tablet bewertet. Auf Wunsch gibt es dazu ein ausführliches Feedback mit einem Satz, wie du es besser sagen könntest. | 28 |
| 6 | Back to the list: "Dein Prüfprotokoll bisher" with ratings; then the dashboard readiness breakdown showing the same | Deine Bewertung wie beim Prüfer | Mit jeder Situation füllt sich dein eigenes Prüfprotokoll: sehr gut, gut, ausreichend oder nicht ausreichend, Bereich für Bereich. Dieselbe Skala, die der Prüfer nach der Fahrt verwendet. So weißt du vor der Prüfung, wo du stehst. | 20 |
| 7 | Manöver tab: the four cards, open Längsparken, play the animated guide a few steps | Manöver Schritt für Schritt | Im Bereich Manöver gehst du die Grundfahraufgaben Schritt für Schritt durch: Längsparken, Querparken, Wenden, Gefahrbremsung. Jede Animation zeigt die Referenzpunkte, an denen du dich im Auto orientierst. | 18 |
| 8 | Fahrten tab: tap "Tracking starten", the mount confirmation, the live screen with map and speed (simulation), then "Stopp & Speichern" and the mistake log sheet after the drive | Fahrstunde aufzeichnen | Vor der Fahrstunde tippst du auf Tracking starten und legst das Handy weg. Es zeichnet Route und Fahrzeit im Hintergrund auf. Die Fehler trägst du nach der Fahrt ein, wenn der Motor aus ist: Schulterblick vergessen, Vorfahrt, Blinker. Während der Fahrt wird das Handy nicht bedient. | 24 |
| 9 | Verlauf: a past drive with its mistakes; the Kosten tab with the budget estimate | Nachbereiten und Kosten im Blick | Im Verlauf siehst du jede Fahrstunde mit ihren Fehlern und erkennst, was sich wiederholt. Und im Bereich Kosten rechnet die App mit, wie viele Fahrstunden noch anstehen und was dich die Prüfung voraussichtlich kostet. | 18 |
| 10 | Konto tab: "Konto sichern" with E-Mail and Google; then the Pro passes screen | Konto sichern, Pro später | Dein Fortschritt liegt zuerst nur auf deinem Gerät. Mit einer E-Mail oder Google sicherst du ihn und kommst auch vom Laptop aus wieder rein. Die ersten sieben Tage hast du alles kostenlos. Danach gibt es Pro-Pässe ab 9,99 Euro, einmalig, kein Abo. | 20 |
| 11 | End card: drivede.app, the situation pages URL, "Kommentare" | drivede.app | Probier es aus auf drivede.app, kostenlos und ohne Anmeldung. Wenn dir eine Situation fehlt, schreib sie in die Kommentare. Viel Erfolg bei der Prüfung. | 14 |

Total ~3:48.

## Production notes
- All recordings come from the app in dark mode with the demo fixture state (`demo-video/fixtures/seed-state.json`), via the existing recorder; new scenes needed for the simulation (list, step mode, free answer with grid, protocol ratings), the Manöver guide, the tracker (sim mode, existing), Verlauf, Kosten, Konto and the Pro passes.
- Microphone scene: the recorder cannot speak; record the typed answer and say "tippen oder sprechen" in the narration, with the mic button visible.
- AI feedback scene: use a real response from the live endpoint, not a mock.
- Title cards: Remotion, landing-demo style. Subtitles from TTS output, per-scene padding.
- YouTube package: title "DriveDE in 4 Minuten: praktische Prüfung üben, Fahrstunden nachbereiten", description with links to drivede.app and drivede.app/pruefung, chapters from the scene starts, thumbnail: phone with the Prüfungssimulation result and the line "Was der Prüfer sehen will".
- English version: same recordings in English UI (?lang=en), narration translated, URLs with ?lang=en and /exam.

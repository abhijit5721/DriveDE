# Tutorial 1: So bewertet der Prüfer (das elektronische Prüfprotokoll)

Format: 1920x1080, screen recordings of DriveDE plus simple title cards, free TTS voice
(de-DE-FlorianMultilingualNeural, same as the landing demo), subtitles aligned per scene.
Length target: 3:30. English version from the same scenes with en-US-AndrewNeural.
Source of every claim: TÜV SÜD's explainer video (Oct 2022) and the Fahraufgabenkatalog;
the summary text is `api/_lib/examEvaluation.ts`, already reviewed.

Rules: no em or en dashes in on-screen text; the founder is a learner, never "ich habe bestanden";
on-screen text shorter than the narration.

| # | Visual | On-screen text | Narration (DE) | ~s |
|---|---|---|---|---|
| 1 | Title card, navy, DriveDE logo. Then a slow push on the examiner's tablet still from the TÜV SÜD video is NOT used (copyright); instead our own mock of the ePP columns | So bewertet der Prüfer | In der praktischen Prüfung sitzt der Prüfer hinten rechts und tippt auf ein Tablet. Was er dort einträgt, entscheidet über bestanden oder nicht. Die meisten Fahrschüler sehen es erst nach der Prüfung. Hier erfährst du vorher, was drinsteht. | 16 |
| 2 | Title card: "Seit 2021: das elektronische Prüfprotokoll" with the five column names appearing one by one | Verkehrsbeobachtung, Fahrzeugpositionierung, Geschwindigkeitsanpassung, Kommunikation, Fahrzeugbedienung | Seit 2021 läuft die Prüfung nach einem festen Katalog, dem Fahraufgabenkatalog. Jede Anforderung gehört zu einem von fünf Bereichen: Verkehrsbeobachtung, also wohin du schaust. Fahrzeugpositionierung, also Spur und Abstand. Geschwindigkeitsanpassung. Kommunikation, also Blinker und Rücksicht. Und Fahrzeugbedienung, also Kupplung, Bremse und Lenkung. Dazu kommt umweltbewusstes Fahren. | 30 |
| 3 | Title card: the eight driving tasks as a list, highlighting as narrated | Die acht Fahraufgaben | Der Katalog beschreibt acht Fahraufgaben: Fahrstreifenwechsel und Einfädeln, Kurven, Vorbeifahren und Überholen, Kreuzungen und Einmündungen, Kreisverkehr, Schienenverkehr, Haltestellen und Fußgängerüberwege, Geradeausfahren. Dazu die Grundfahraufgaben wie Einparken und Gefahrbremsung. Für jede Aufgabe steht im Katalog, was der Prüfer sehen will. | 26 |
| 4 | Screen recording: DriveDE Prüfungssimulation list, open "Zebrastreifen", step mode, tap the cards in order, check | Beispiel: Zebrastreifen | Nehmen wir den Zebrastreifen. Eine Fußgängerin steht am Rand. Der Prüfer erwartet: früh beobachten, mit mäßiger Geschwindigkeit heranfahren, vor dem Überweg anhalten, warten, bis er frei ist, und vor dem Anfahren noch einmal schauen. In DriveDE kannst du die Schritte in der richtigen Reihenfolge antippen und siehst sofort, was gefehlt hat. | 28 |
| 5 | Screen recording: the result with the grid "Im Prüfprotokoll des Prüfers", then a severe note (answer that forgets to let her cross) | Schwerer Fehler: kann die Prüfung beenden | Das Ergebnis zeigt dir die Punkte so, wie der Prüfer sie einträgt: pro Bereich. Und es zeigt, was wirklich schwer wiegt. Der Fußgängerin nicht den Vorrang lassen ist kein kleiner Fehler. Im echten Protokoll kann das die Prüfung beenden. Winken, damit sie geht, ist übrigens auch falsch: Du siehst nicht, ob von der anderen Seite jemand kommt. | 28 |
| 6 | Title card: "Ein Fehler ist nicht das Ende" with a simple diagram: mistake, then the same situation again later | Adaptive Prüfstrategie | Jetzt das Wichtigste aus dem Erklärvideo von TÜV SÜD: Machst du einen Fehler, versucht der Prüfer später, eine ähnliche Situation noch einmal herbeizuführen. Er will sehen, ob es ein einmaliger Fehler war oder ob er sich wiederholt. Das heißt: Ein Fehler ist nicht das Ende. Ruhig weiterfahren und ihn beim nächsten Mal nicht wiederholen, denn genau das prüft er. | 30 |
| 7 | Title card: the rating scale "sehr gut, gut, ausreichend, nicht ausreichend", then screen recording of "Dein Prüfprotokoll bisher" in the app | Die Bewertung | Nach der Fahrt bewertet der Prüfer jeden Bereich und jede Aufgabe mit sehr gut, gut, ausreichend oder nicht ausreichend. Danach bekommst du ein schriftliches Feedback, meist elektronisch. In DriveDE siehst du dieselbe Skala schon beim Üben, Bereich für Bereich, damit du weißt, woran du noch arbeiten musst. | 26 |
| 8 | Screen recording: the public page /pruefung/so-bewertet-der-pruefer/ scrolling, then end card with the URL | drivede.app/pruefung | Alle acht Situationen und die ganze Erklärung findest du kostenlos auf drivede.app slash pruefung, und die Prüfungssimulation in der App, ohne Anmeldung. Wenn du eine Situation willst, die noch fehlt, schreib sie in die Kommentare. Viel Erfolg bei der Prüfung. | 22 |

Total ~3:26.

## Production notes
- Scenes 4, 5, 7 and 8 are recorded from the app with the existing recorder (`demo-video/record/record.ts`, dark mode, 1920x1080 for a desktop tutorial rather than the phone frame; or phone frame centred on a navy background to match the landing demo).
- Title cards: Remotion compositions in the landing-demo style (navy, Inter, blue accent).
- TTS per scene with edge-tts (`record/make-vo.py` pattern), subtitles from the TTS output, per-scene padding so audio never drifts.
- YouTube package: title "So bewertet der Prüfer in der Fahrprüfung: das elektronische Prüfprotokoll erklärt", description with the public page link and the TÜV SÜD source, chapters from the scene starts, thumbnail: tablet columns mock plus the line "Was der Prüfer wirklich einträgt".
- English version: same scenes, narration translated, URL drivede.app/exam.

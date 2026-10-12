# YouTube package: app walkthrough

Published 2026-10-12 on the DriveDE channel (UC7vTRoaxnGKv_aQRFtPGErQ, @drivedeapp):
German https://youtu.be/K30-sJGcSYU, English https://youtu.be/_iZaKGSRnh8 (with music bed).
The first uploads without music (DmsAuhKQKmo, jUhAxrbdm_s) are set to private, not deleted.
Visibility changes: `scripts/youtube/set-visibility.mjs <videoId> <PRIVATE|UNLISTED|PUBLIC>`.
Upload path: `scripts/youtube/upload.mjs <lang>` through the CDP Chrome on port 9226
(`C:\Users\abhij\drivede-social\chrome-abhijit-profile`, signed in to the channel's Google account
by hand once; copied cookies do not survive the move). If a step fails after the file is in,
`scripts/youtube/finish-draft.mjs <lang>` picks the draft up and publishes it. `list.mjs` lists the channel content.

Files (gitignored, in `demo-video/out/`): `tutorial-de.mp4` (1920x1080, soft subtitles muxed),
`tutorial-de.srt`, `tutorial-de-chapters.txt`; English: `tutorial-en.mp4`, `tutorial-en.srt`,
`tutorial-en-chapters.txt`. Rebuild: see "How to rebuild" below.

## German

Title (max 100): DriveDE in 3 Minuten: praktische Prüfung üben, Fahrstunden nachbereiten

Description:

Ein Fehlversuch in der praktischen Prüfung kostet schnell bis zu 600 Euro. DriveDE ist die App für die Zeit zwischen den Fahrstunden: Prüfungssituationen vorher üben, die Fahrstunde danach nachbereiten und sehen, woran du noch arbeiten musst.

In diesem Video siehst du die ganze App: die Prüfungssimulation mit acht Situationen aus der Prüfung (Schritte ordnen oder frei antworten, auf Wunsch mit ausführlichem Feedback), dein eigenes Prüfprotokoll nach dem Schema des Prüfers, die Manöver Schritt für Schritt, das Aufzeichnen einer Fahrstunde mit Fehlerprotokoll, Verlauf und Kosten, und wie du dein Konto sicherst.

Kostenlos und ohne Anmeldung ausprobieren: https://www.drivede.app
Alle Prüfungssituationen zum Nachlesen: https://www.drivede.app/pruefung/
So bewertet der Prüfer (elektronisches Prüfprotokoll): https://www.drivede.app/pruefung/so-bewertet-der-pruefer/

Welche Situation fehlt dir? Schreib sie in die Kommentare.

Kapitel: paste `out/tutorial-de-chapters.txt` (one line per chapter, starts with 00:00).

Tags: Fahrschule, praktische Prüfung, Führerschein Klasse B, Prüfungssimulation, Fahrprüfung bestehen, Fahrstunden, Prüfer, Prüfprotokoll, DriveDE

Thumbnail: phone with the free-answer result (points list plus the grid "Im Prüfprotokoll des Prüfers") on navy, line "Was der Prüfer sehen will". Source still: `out/tut-still-free.png` or a frame from `public/tut-free-de.mp4` around second 14.

## English

Title: DriveDE in 3 minutes: practise the German driving test, review your lessons

Description:

A failed practical test in Germany can quickly cost up to 600 euros. DriveDE is the app for the time between lessons: practise the test situations beforehand, review each lesson afterwards and see what still needs work.

This video shows the whole app: the exam simulation with eight situations from the test (order the steps or answer freely, with detailed feedback on request), your own test protocol on the examiner's scale, the manoeuvres step by step, recording a lesson with a mistake log, history and costs, and how to secure your account.

Try it free, no registration: https://www.drivede.app/?lang=en
All test situations to read: https://www.drivede.app/exam/
How the examiner grades: https://www.drivede.app/exam/how-the-examiner-grades/

Which situation are you missing? Tell us in the comments.

Chapters: paste `out/tutorial-en-chapters.txt`.

Tags: German driving test, Fahrschule, driving licence Germany, practical test, exam simulation, expats Germany, DriveDE

## How to rebuild

1. App dev server: `npx vite --port 5173 --strictPort --host` in the repo root (localhost auto-grants Pro; the account scene is recorded against 127.0.0.1 so the trial state shows).
2. Narration: `python record/make-vo-tutorial.py de` (and `en`); writes `public/vo-tut/<lang>/` and `src/tutorialTimings.<lang>.json`. The service answers 403 now and then; the script retries.
3. Recordings: `node --experimental-strip-types record/tutorial.ts all de` for all scenes (any name that is not a scene means all), then `TUT_BASE=http://127.0.0.1:5173 node --experimental-strip-types record/tutorial.ts account de`. Clip lengths live in `src/tutorialClips.json`.
4. Clips: `node record/assemble.mjs tut-` (frames to `public/tut-<scene>-<lang>.mp4`).
5. Render: `npx remotion render tutorial-de out/tutorial-de-raw.mp4 --codec=h264 --crf=18 --color-space=bt709`.
6. Subtitles and chapters: `python record/make-tutorial-srt.py de`.
7. Final file: `ffmpeg -i out/tutorial-de-raw.mp4 -i out/tutorial-de.srt -map 0 -map 1 -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 160k -c:s mov_text -metadata:s:s:0 language=deu -movflags +faststart out/tutorial-de.mp4`.

Rules kept: only current features, no 3D or auto-detection claims, no app store, the founder is a learner, no dashes in on-screen text.

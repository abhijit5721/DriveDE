# gutefrage: how u/drivede answers (agreed 17 Oct 2026)

Account: u/drivede, Business profile since 22 Sep 2026, profile link to drivede.app. Logged in on the port 9222 Chrome (Google sign-in). Scan: `node scripts/gutefrage/scan.mjs`. Post: `node scripts/gutefrage/post.mjs --file <drafts.json> KEY` after the founder approves the key.

## Which questions

Answer only where DriveDE has the best answer:
- practical exam situations (Vorfahrt, Abbiegen, Kreisverkehr, Bahnübergang, Grünpfeil, Überholen and the rest of /pruefung/)
- how the examiner grades, schwere Fehler, the electronic protocol
- theory point rules (Ersterwerb vs Erweiterung, the 5-point rule)
- Umschreibung of a foreign licence

Skip: Fahrschule recommendations, price complaints, fines and Bußgeld disputes, used cars, motorcycles, opinion threads.

## Pacing

- Daily scan, at most two answers a day (the ceiling that has held since September).
- Never answer a question that already has a correct, complete answer; add only when something is missing or wrong.
- Check first that no answer from the founder or from u/drivede exists (post.mjs has a duplicate guard for the account).

## Links

- Link only when a specific page is the answer, roughly every third practical-test answer: `drivede.app/pruefung/<id>?ref=gutefrage`, introduced as the source ("ausführlich mit dem Gesetzestext").
- Never link the landing page or the app from an answer. Never write "für mehr Tipps" or any sign-off that advertises. The profile carries the general link.
- Plain text domain, no utm parameters, no shorteners.

## Tone

German, du-Form, two to four short paragraphs, the StVO or FeV paragraph named when it decides the answer. No em dashes. Sell nothing. The founder is a learner, so never "als Fahrlehrer" or "ich habe bestanden".

## Measuring

The /pruefung pages now carry Vercel Web Analytics, so `?ref=gutefrage` shows as a referrer source in `node scripts/analytics/vercel-overview.mjs`. Review after four weeks of linked answers: if gutefrage still brings nobody, stop and move the time to the Facebook groups, which do send visitors.

## Log

| Date | Question | Link used | Result |
|---|---|---|---|
| 2026-10-17 | Wieso A1 Probeprüfung nicht bestanden? (Erweiterung 20/6 vs Ersterwerb 30/10, 5-Punkte-Regel) | none | posted, verified |

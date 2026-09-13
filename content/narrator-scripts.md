# Narrator scripts for talking-head reels/shorts

Written for AI-avatar or founder-filmed delivery. Each sentence is a natural
cut point (avatar tools cap clip length; generate per sentence or pair and
stitch). Target: 35-40 seconds spoken, ~95 words. Hook lands inside 2 seconds.
Every claim must stay true to the app and the blog (no invented stats).

## Script 1: Why 1 in 3 fail (EN)

HOOK (0-3s, look straight into camera):
"One in three people fail the German driving test. Here is why."

BODY:
"It is almost never the driving. It is observation."
"Number one: right before left. One missed priority check at an unmarked intersection, and the exam is over."
"Number two: the shoulder check. The examiner sits behind you. If they cannot SEE your head turn, it did not happen."
"Number three: speed discipline. Too fast in a 30 zone fails you. So does creeping along scared."
"Every failed attempt costs about six hundred euros."

CTA:
"So do not guess whether you are ready. Measure it. Link in bio."

## Script 1: Warum jeder Dritte durchfällt (DE)

HOOK:
"Jeder Dritte fällt durch die praktische Prüfung. Und zwar deshalb."

BODY:
"Es liegt fast nie am Fahren. Es liegt an der Beobachtung."
"Nummer eins: rechts vor links. Ein übersehener Vorfahrtscheck an einer unmarkierten Kreuzung, und die Prüfung ist vorbei."
"Nummer zwei: der Schulterblick. Der Prüfer sitzt hinter dir. Wenn er deine Kopfdrehung nicht SIEHT, zählt sie nicht."
"Nummer drei: das Tempo. Zu schnell in der 30er-Zone fällst du durch. Ängstliches Schleichen genauso."
"Jeder Fehlversuch kostet rund sechshundert Euro."

CTA:
"Also rate nicht, ob du bereit bist. Miss es. Link in Bio."

## Production notes

- Vertical 1080x1920. Avatar/face in upper two-thirds; captions land lower third.
- Voice: founder's own phone recording preferred (quiet room, phone at arm's
  length, read each sentence twice, keep the better take). Natural > polished.
- B-roll cutaways every 2 sentences if using the app footage (readiness gauge,
  tracker HUD) to hide avatar stitching seams.
- REQUIRED: mark as AI-generated on every platform when using an avatar
  (Metricool: tiktokData.isAigc, instagramData.isAiGenerated,
  youtubeData.isAiGeneratedContent = true).
- Fact anchors: 1-in-3 fail rate and 600 EUR retake cost match
  /blog/fahrpruefung-durchgefallen/ - keep numbers in sync if those change.

---

## The Examiner - Episode 1: "Right before left: who goes first?" (quiz + answer)

Format: recurring synthetic presenter ("The Examiner", our avatar), quiz video
+ answer video 2 days later. Diagram drawn in Remotion with exact geometry,
never AI-generated signage. AI labels mandatory on every post.

### Video A: The Quiz (EN, ~22s + end card)

1. Three cars. No signs, no lights. Who goes first?
2. You are the blue car, going straight. Red comes from your right. Green comes from your left.
3. Unmarked intersection. That means: right before left.
4. So, in what order do the three cars go? Answer tomorrow. Follow so you do not miss it.

### Video B: The Answer (EN, ~26s + end card)

1. The answer: red goes first. Then you. Green goes last.
2. Right before left: whoever comes from your right has priority.
3. Red is to your right, so red goes before you. You are to green's right, so you go before green.
4. In the exam, one missed priority check here ends the test on the spot.
5. Train it until it is reflex. Free at drivede.app. Link in bio.

---

## The Examiner - Episode 3: "Two lanes turn left. Which lane do you land in?" (quiz + answer)

Format as ep. 1: the synthetic presenter (Flow character "DriveDE Instructor")
for hook, setup and cliffhanger; the intersection itself is a Remotion
exact-geometry diagram (two left-turn lanes, two target lanes, dashed guide
lines), never generated footage. Geometry matches `InteractiveLaneTurn`:
approach from the bottom, target road to the left, inner lane next to the
centre line. Worked example in the caption only: Oststeinbeker Weg /
Glinder Strasse, Hamburg (no creator footage). AI labels on every post.

### Video A: The Quiz (EN, ~22s + end card)

1. Two lanes turn left at the same time. You are in the right one.
2. The new road has two lanes. Left lane or right lane: where must you arrive?
3. Get it wrong here and the examiner writes down "lane change inside the intersection".
4. Which lane? Answer tomorrow. Follow so you do not miss it.

### Video B: The Answer (EN, ~26s + end card)

1. The answer: lane to lane. Right turning lane, right target lane. Inner stays inner, outer stays outer.
2. The dashed guide lines are not decoration. You follow yours and no other.
3. One turning lane, two target lanes? Then keep right, unless arrows or lines say otherwise.
4. Turning right with two lanes: shoulder check to the right from both lanes. Both cross the cycle path.
5. Train the lane choice free at drivede.app. Link in bio.

### Video A: Das Quiz (DE)

1. Zwei Spuren biegen gleichzeitig links ab. Du bist in der rechten.
2. Die Zielstraße hat zwei Fahrstreifen. Links oder rechts: wo musst du ankommen?
3. Wer das falsch macht, bekommt vom Prüfer "Spurwechsel in der Kreuzung" notiert.
4. Welche Spur? Antwort morgen. Folge uns, damit du sie nicht verpasst.

### Video B: Die Antwort (DE)

1. Die Antwort: Spur zu Spur. Rechte Abbiegespur, rechter Fahrstreifen. Innen bleibt innen, außen bleibt außen.
2. Die gestrichelten Leitlinien sind keine Deko. Du folgst deiner und keiner anderen.
3. Eine Abbiegespur, zwei Fahrstreifen? Dann rechts halten, außer Pfeile oder Linien sagen etwas anderes.
4. Zweispurig rechts abbiegen: Schulterblick nach rechts aus beiden Spuren. Beide kreuzen den Radweg.
5. Übe die Spurwahl kostenlos auf drivede.app. Link in Bio.

Production checklist: Flow clips for hook and cliffhanger (12 credits each,
inspect a mid-frame for character drift), Chatterbox VO per sentence, Remotion
composition `examiner-ep3-quiz` / `examiner-ep3-answer` reusing the ep. 1
layout with the lane-turn diagram, render with `--concurrency=1`, re-encode any
Veo clip to constant 30 fps first, schedule via Metricool with isAigc /
isAiGenerated / isAiGeneratedContent true, answer video two days after the quiz.

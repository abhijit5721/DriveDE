# Narration for the app walkthrough tutorial (demo-video/tutorials/app-walkthrough/script.md).
# One MP3 + VTT per scene -> public/vo-tut/<lang>/sNN.mp3, and the measured durations ->
# src/tutorialTimings.<lang>.json for the Remotion composition (scene = audio + pause).
import asyncio, json, subprocess, sys
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
LANG = sys.argv[1] if len(sys.argv) > 1 else "de"
OUT = ROOT / "public" / "vo-tut" / LANG
VOICE = {"de": "de-DE-FlorianMultilingualNeural", "en": "en-US-AndrewNeural"}[LANG]
PAUSE = 0.8

DE = [
  ("s01", "Ein Fehlversuch in der praktischen Prüfung kostet schnell bis zu 600 Euro. DriveDE ist die App für die Zeit zwischen den Fahrstunden: Situationen vorher üben, die Fahrstunde danach nachbereiten und sehen, woran du noch arbeiten musst. Hier zeige ich dir in gut drei Minuten, wie sie funktioniert."),
  ("s02", "Du startest ohne Anmeldung. Du wählst deine Klasse, Schaltung oder Automatik oder die Umschreibung eines ausländischen Führerscheins, und bist auf dem Dashboard. Oben siehst du deinen ersten Schritt, unten deine Prüfungsreife. Die wächst mit jeder Übung und jeder Fahrstunde."),
  ("s03", "Das Herzstück ist die Prüfungssimulation. Acht Situationen aus der praktischen Prüfung, vom Zebrastreifen bis zur Autobahnauffahrt, drei davon kostenlos. Und eine Erklärung, wie der Prüfer wirklich bewertet."),
  ("s04", "Du liest die Situation, hörst, was der Prüfer sagt, und tippst die Schritte in der Reihenfolge an, in der du sie machen würdest. Zwei Karten sind Fehler. Nach dem Prüfen siehst du, was richtig war, was an der falschen Stelle stand und welcher Fehler in der echten Prüfung schwer wiegt."),
  ("s05", "Wer weiter ist, antwortet frei: tippen oder einfach ins Mikrofon sprechen. Die App prüft deine Antwort auf dem Handy und zeigt, welche Punkte du getroffen hast, sortiert nach den fünf Bereichen, die der Prüfer auf seinem Tablet bewertet. Auf Wunsch gibt es dazu ein ausführliches Feedback mit einem Satz, wie du es besser sagen könntest."),
  ("s06", "Mit jeder Situation füllt sich dein eigenes Prüfprotokoll: sehr gut, gut, ausreichend oder nicht ausreichend, Bereich für Bereich. Dieselbe Skala, die der Prüfer nach der Fahrt verwendet. So weißt du vor der Prüfung, wo du stehst."),
  ("s07", "Im Bereich Manöver gehst du die Grundfahraufgaben Schritt für Schritt durch: Längsparken, Querparken, Wenden, Gefahrbremsung. Jede Animation zeigt die Referenzpunkte, an denen du dich im Auto orientierst."),
  ("s08", "Vor der Fahrstunde tippst du auf Tracking starten und legst das Handy weg. Es zeichnet Route und Fahrzeit im Hintergrund auf. Die Fehler trägst du nach der Fahrt ein, wenn der Motor aus ist: Schulterblick vergessen, Vorfahrt, Blinker. Während der Fahrt wird das Handy nicht bedient."),
  ("s09", "Im Verlauf siehst du jede Fahrstunde mit ihren Fehlern und erkennst, was sich wiederholt. Und im Bereich Kosten rechnet die App mit, wie viele Fahrstunden noch anstehen und was dich die Prüfung voraussichtlich kostet."),
  ("s10", "Dein Fortschritt liegt zuerst nur auf deinem Gerät. Mit einer E-Mail oder Google sicherst du ihn und kommst auch vom Laptop aus wieder rein. Die ersten sieben Tage hast du alles kostenlos. Danach gibt es Pro-Pässe ab 9,99 Euro, einmalig, kein Abo."),
  ("s11", "Probier es aus auf drive dee ee punkt app, kostenlos und ohne Anmeldung. Wenn dir eine Situation fehlt, schreib sie in die Kommentare. Viel Erfolg bei der Prüfung."),
]
EN = [
  ("s01", "A failed practical test can quickly cost up to 600 euros. DriveDE is the app for the time between lessons: practise the situations beforehand, review each lesson afterwards and see what still needs work. In a little over three minutes I will show you how it works."),
  ("s02", "You start without registering. You pick your class, manual or automatic, or the conversion of a foreign licence, and you are on the dashboard. At the top you see your first step, below it your exam readiness. It grows with every exercise and every lesson."),
  ("s03", "The heart of the app is the exam simulation. Eight situations from the practical test, from the zebra crossing to joining the Autobahn, three of them free. And an explanation of how the examiner really grades."),
  ("s04", "You read the situation, hear what the examiner says, and tap the steps in the order you would do them. Two cards are mistakes. After checking you see what was right, what was in the wrong place, and which mistake weighs heavily in the real test."),
  ("s05", "If you are further along, answer freely: type, or simply speak into the microphone. The app checks your answer on your phone and shows which points you hit, sorted by the five areas the examiner rates on the tablet. On request you also get detailed feedback with a sentence on how to say it better."),
  ("s06", "With every situation your own test protocol fills up: very good, good, sufficient or insufficient, area by area. The same scale the examiner uses after the drive. So you know where you stand before the test."),
  ("s07", "In the manoeuvres section you go through the basic driving tasks step by step: parallel parking, reverse parking, turning, the emergency stop. Each animation shows the reference points you use inside the car."),
  ("s08", "Before the lesson you tap start tracking and put the phone away. It records the route and the driving time in the background. You enter the mistakes after the drive, with the engine off: missed shoulder check, right of way, indicator. The phone is never used while driving."),
  ("s09", "In the history you see every lesson with its mistakes and spot what repeats. And in the costs section the app works out how many lessons are still ahead and what the test will probably cost you."),
  ("s10", "Your progress lives only on your device at first. With an email or Google you secure it and can get back in from a laptop too. The first seven days you have everything for free. After that there are Pro passes from 9.99 euros, one-time, no subscription."),
  ("s11", "Try it at drive dee ee dot app, free and without registration. If a situation you need is missing, write it in the comments. Good luck with your test."),
]
LINES = {"de": DE, "en": EN}[LANG]
ONLY = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None  # regenerate only these ids

def duration(p: Path) -> float:
    out = subprocess.check_output(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(p)])
    return float(json.loads(out)["format"]["duration"])

async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    timings = []
    for sid, text in LINES:
        dest = OUT / f"{sid}.mp3"
        if ONLY and sid not in ONLY:
            timings.append({"id": sid, "audio": round(duration(dest), 3), "seconds": round(duration(dest) + PAUSE, 3)})
            continue
        for attempt in range(8):  # the service answers 403 now and then; a retry goes through
            try:
                tts = edge_tts.Communicate(text, VOICE, rate="+2%")
                await tts.save(str(dest), str(OUT / f"{sid}.vtt"))
                break
            except Exception as e:  # noqa: BLE001
                print(f"{sid}: retry {attempt + 1} ({str(e)[:40]})")
                await asyncio.sleep(4)
        else:
            raise SystemExit(f"{sid}: TTS failed")
        d = duration(dest)
        timings.append({"id": sid, "audio": round(d, 3), "seconds": round(d + PAUSE, 3)})
        print(f"{sid}: {d:.2f}s")
    (ROOT / "src" / f"tutorialTimings.{LANG}.json").write_text(json.dumps({"fps": 30, "pause": PAUSE, "scenes": timings}, indent=1), encoding="utf-8")
    print("total", round(sum(t["seconds"] for t in timings), 1), "s")

asyncio.run(main())

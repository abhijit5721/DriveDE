# Voice-over for the Prüfungssimulation feature short (src/ShortSimulation.tsx).
# One MP3 per line per language -> public/vo-short-sim/<lang>/<id>.mp3
# Usage: python record/make-vo-short-sim.py [de|en]
import asyncio, sys
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "vo-short-sim"
VOICES = {"en": "en-US-AndrewNeural", "de": "de-DE-FlorianMultilingualNeural"}
LINES = {
    "en": {
        "hook": "New in DriveDE: the exam simulation. Twenty situations from the German practical test.",
        "steps": "Tap the steps in the right order, and the app checks them at once.",
        "free": "Or explain in your own words what you would do. Your answer is graded the way the examiner grades.",
        "cta": "Free, no account needed. drive dee ee dot app.",
    },
    "de": {
        "hook": "Neu in DriveDE: die Prüfungssimulation. Zwanzig Situationen aus der praktischen Prüfung.",
        "steps": "Tippe die Schritte in der richtigen Reihenfolge an, die App prüft sie sofort.",
        "free": "Oder erkläre in eigenen Worten, was du tust. Deine Antwort wird bewertet wie beim Prüfer.",
        "cta": "Kostenlos, ohne Konto. drive dee ee punkt app.",
    },
}

async def main(langs):
    for lang in langs:
        (OUT / lang).mkdir(parents=True, exist_ok=True)
        for key, text in LINES[lang].items():
            path = OUT / lang / f"{key}.mp3"
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(text, VOICES[lang], rate="+4%").save(str(path))
                    break
                except Exception as e:  # the service answers 403 now and then
                    if attempt == 3:
                        raise
                    await asyncio.sleep(3)
            print(lang, key, path.stat().st_size, "bytes")

langs = [a for a in sys.argv[1:] if a in ("de", "en")] or ["de", "en"]
asyncio.run(main(langs))

# Generate voiceover narration with Microsoft neural TTS (edge-tts).
# One MP3 per scene per language -> demo-video/public/vo/<lang>/<scene>.mp3
# Scene windows (s): hook 5, tracker/readiness/curriculum/maneuvers 8, cta 8.
import asyncio, json, subprocess, sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "vo"

VOICES = {"en": "en-US-AndrewNeural", "de": "de-DE-FlorianMultilingualNeural"}

LINES = {
    "en": {
        "hook": "Meet DriveDE, your practice partner for the German driving test.",
        "tracker": "Track every real driving lesson with GPS, and log mistakes with a single tap for your review afterwards.",
        "readiness": "After each drive, your exam readiness updates, so you can see what still needs work.",
        "curriculum": "Follow a structured path through every chapter, every Sonderfahrt, and every maneuver.",
        "maneuvers": "And go through every maneuver step by step, before you're in the real car.",
        "devices": "It runs in your browser, on phone and laptop.",
        "cta": "A failed test can quickly cost up to 600 euros. Start free at drive dee ee dot app.",
    },
    "de": {
        "hook": "Das ist DriveDE, dein Übungspartner für die Führerscheinprüfung.",
        "tracker": "Tracke jede echte Fahrstunde per GPS und halte Fehler mit einem Tipp für die Auswertung fest.",
        "readiness": "Nach jeder Fahrt aktualisiert sich deine Prüfungsreife, so siehst du, woran du noch arbeiten musst.",
        "curriculum": "Folge einem klaren Weg durch alle Kapitel, Sonderfahrten und Manöver.",
        "maneuvers": "Und geh jedes Manöver Schritt für Schritt durch, bevor du im echten Auto sitzt.",
        "devices": "Läuft im Browser, auf Handy und Laptop.",
        "cta": "Ein Fehlversuch kostet schnell bis zu 600 Euro. Starte kostenlos auf drive dee eeh punkt app.",
    },
}

WINDOWS = {"hook": 5.0, "tracker": 8.0, "readiness": 8.0, "curriculum": 8.0, "maneuvers": 7.0, "devices": 4.0, "cta": 9.0}

async def gen(lang: str, scene: str, text: str) -> None:
    dest = OUT / lang / f"{scene}.mp3"
    dest.parent.mkdir(parents=True, exist_ok=True)
    tts = edge_tts.Communicate(text, VOICES[lang], rate="+4%")
    await tts.save(str(dest))

def duration(p: Path) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(p)
    ])
    return float(json.loads(out)["format"]["duration"])

async def main() -> None:
    failed = False
    for lang, scenes in LINES.items():
        for scene, text in scenes.items():
            await gen(lang, scene, text)
            d = duration(OUT / lang / f"{scene}.mp3")
            limit = WINDOWS[scene] - 0.4  # leave breathing room before scene cut
            status = "OK " if d <= limit else "TOO LONG"
            if d > limit:
                failed = True
            print(f"{status} {lang}/{scene}: {d:.2f}s (window {WINDOWS[scene]}s)")
    sys.exit(1 if failed else 0)

asyncio.run(main())

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
        "hook": "Meet DriveDE — the fastest way to your German driving license.",
        "tracker": "Track every real driving lesson with GPS: live speed limits, and every mistake caught automatically.",
        "readiness": "After each drive, your exam readiness score updates — so you know exactly when you're ready. No gut feeling.",
        "curriculum": "Follow a structured path through every chapter, every Sonderfahrt, and every maneuver.",
        "maneuvers": "And practice parking in 3D — before you're in the real car.",
        "cta": "DriveDE saves you 800 to 1200 euros on lessons. Start your free 7 day trial at drive dee ee dot app.",
    },
    "de": {
        "hook": "Das ist DriveDE — der schnellste Weg zum deutschen Führerschein.",
        "tracker": "Tracke jede echte Fahrstunde per GPS: Tempolimits in Echtzeit und automatische Fehlererkennung.",
        "readiness": "Nach jeder Fahrt aktualisiert sich dein Prüfungs-Score — du weißt genau, wann du bereit bist. Kein Bauchgefühl.",
        "curriculum": "Folge einem klaren Weg durch alle Kapitel, Sonderfahrten und Manöver.",
        "maneuvers": "Und übe das Einparken in 3D — bevor du im echten Auto sitzt.",
        "cta": "DriveDE spart dir 800 bis 1200 Euro an Fahrstunden. Teste Pro 7 Tage kostenlos — auf drive dee eeh punkt app.",
    },
}

WINDOWS = {"hook": 5.0, "tracker": 8.0, "readiness": 8.0, "curriculum": 8.0, "maneuvers": 7.0, "cta": 9.0}

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

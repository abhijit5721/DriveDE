# Subtitles and YouTube chapters for the tutorial from the per-scene TTS boundaries.
# edge-tts writes sentence boundaries (offset/duration in 100 ns units) per scene; each scene
# starts at the sum of the previous scene lengths (max of narration+pause and clip length),
# and its audio starts 6 frames in (see src/Tutorial.tsx).
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANG = sys.argv[1] if len(sys.argv) > 1 else "de"
FPS = 30
AUDIO_OFFSET = 6 / FPS
CLIP = {"s01": "landing", "s02": "start", "s03": "simlist", "s04": "steps", "s05": "free", "s06": "protocol", "s07": "maneuvers", "s08": "tracker", "s09": "history", "s10": "account", "s11": None}
CHAPTER = {
    "de": ["Intro", "Start ohne Anmeldung", "Prüfungssimulation", "Schritte ordnen", "Frei antworten und KI-Feedback", "Dein Prüfprotokoll", "Manöver", "Fahrstunde aufzeichnen", "Verlauf und Kosten", "Konto und Pro", "Probier es aus"],
    "en": ["Intro", "Start without registering", "Exam simulation", "Order the steps", "Free answer and AI feedback", "Your test protocol", "Manoeuvres", "Record a lesson", "History and costs", "Account and Pro", "Try it"],
}[LANG]

timings = json.loads((ROOT / "src" / f"tutorialTimings.{LANG}.json").read_text(encoding="utf-8"))
clips = json.loads((ROOT / "src" / "tutorialClips.json").read_text(encoding="utf-8"))

def ts(sec: float) -> str:
    ms = int(round(sec * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"

def chap(sec: float) -> str:
    s = int(sec)
    return f"{s // 60:02d}:{s % 60:02d}"

cues, chapters, start = [], [], 0.0
for i, scene in enumerate(timings["scenes"]):
    sid = scene["id"]
    clip = CLIP[sid]
    length = max(scene["seconds"], clips.get(clip, 0) if clip else 0)
    length = round(length * FPS) / FPS
    chapters.append(f"{chap(start)} {CHAPTER[i]}")
    for line in (ROOT / "public" / "vo-tut" / LANG / f"{sid}.vtt").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        b = json.loads(line)
        if b.get("type") != "SentenceBoundary":
            continue
        a = start + AUDIO_OFFSET + b["offset"] / 1e7
        e = a + b["duration"] / 1e7
        cues.append((a, min(e, start + length), b["text"]))
    start += length

srt = "\n".join(f"{n}\n{ts(a)} --> {ts(e)}\n{t}\n" for n, (a, e, t) in enumerate(cues, 1))
out = ROOT / "out" / f"tutorial-{LANG}.srt"
out.parent.mkdir(exist_ok=True)
out.write_text(srt, encoding="utf-8")
(ROOT / "out" / f"tutorial-{LANG}-chapters.txt").write_text("\n".join(chapters) + "\n", encoding="utf-8")
print(f"{len(cues)} cues, total {chap(start)} -> {out}")
print("\n".join(chapters))

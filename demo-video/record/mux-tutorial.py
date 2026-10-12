# Final pass for the tutorial: video from the Remotion render (its audio dropped, because the
# chunked render adds AAC priming per chunk), audio rebuilt from the per-scene narration with
# each scene padded to its exact length (no drift), soft subtitles muxed. One encode.
# Usage: python record/mux-tutorial.py de
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANG = sys.argv[1] if len(sys.argv) > 1 else "de"
FPS = 30
LEAD = 0.2  # audio starts 6 frames into each scene (src/Tutorial.tsx)
CLIP = {"s01": "landing", "s02": "start", "s03": "simlist", "s04": "steps", "s05": "free", "s06": "protocol", "s07": "maneuvers", "s08": "tracker", "s09": "history", "s10": "account", "s11": None}

timings = json.loads((ROOT / "src" / f"tutorialTimings.{LANG}.json").read_text(encoding="utf-8"))
clips = json.loads((ROOT / "src" / "tutorialClips.json").read_text(encoding="utf-8"))
raw = ROOT / "out" / f"tutorial-{LANG}-raw.mp4"
srt = ROOT / "out" / f"tutorial-{LANG}.srt"
out = ROOT / "out" / f"tutorial-{LANG}.mp4"

inputs, filters, labels, total = ["-i", str(raw)], [], [], 0.0
for i, scene in enumerate(timings["scenes"]):
    clip = CLIP[scene["id"]]
    length = round(max(scene["seconds"], clips.get(clip, 0) if clip else 0) * FPS) / FPS
    inputs += ["-i", str(ROOT / "public" / "vo-tut" / LANG / f"{scene['id']}.mp3")]
    n = i + 1
    filters.append(f"[{n}:a]aresample=48000,adelay={int(LEAD * 1000)}|{int(LEAD * 1000)},apad=whole_dur={length:.4f},atrim=0:{length:.4f}[a{n}]")
    labels.append(f"[a{n}]")
    total += length
filters.append("".join(labels) + f"concat=n={len(labels)}:v=0:a=1[vo]")
# music bed: public/music.mp3 (45 s, pre-ducked to -28 LUFS) looped under the narration at 60 %,
# which lands it roughly 10 dB below the voice; fade in 1 s, fade out over the last 3 s.
MUSIC = len(labels) + 1
inputs += ["-stream_loop", "-1", "-i", str(ROOT / "public" / "music.mp3")]
filters.append(f"[{MUSIC}:a]aresample=48000,atrim=0:{total:.4f},volume=0.6,afade=t=in:d=1,afade=t=out:st={total - 3:.4f}:d=3[mus]")
filters.append("[vo][mus]amix=inputs=2:duration=first:normalize=0[aout]")

cmd = ["ffmpeg", "-y", "-v", "error", *inputs, "-i", str(srt),
       "-filter_complex", ";".join(filters),
       "-map", "0:v:0", "-map", "[aout]", "-map", f"{MUSIC + 1}:s:0",
       "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-pix_fmt", "yuv420p",
       "-c:a", "aac", "-b:a", "160k", "-c:s", "mov_text", "-metadata:s:s:0", f"language={'deu' if LANG == 'de' else 'eng'}",
       "-movflags", "+faststart", str(out)]
subprocess.run(cmd, check=True)
probe = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,nb_frames", "-of", "json", str(out)])
info = json.loads(probe)
print(f"scenes total {total:.2f}s; file {out.name}: {info['format']['duration']}s, {out.stat().st_size / 1e6:.1f} MB")
for s in info["streams"]:
    print(" ", s["codec_type"], s["codec_name"], s.get("width", ""), s.get("height", ""), s.get("nb_frames", ""))

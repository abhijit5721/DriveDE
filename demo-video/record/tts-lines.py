# Reads a JSON list [{key, text, voice: "de"|"en", file}] on stdin and writes one MP3 per
# line with edge-tts (Microsoft neural voices). Retries the occasional 403.
import asyncio, json, sys
import edge_tts

VOICES = {"en": "en-US-AndrewNeural", "de": "de-DE-FlorianMultilingualNeural"}

async def main(jobs):
    for j in jobs:
        for attempt in range(4):
            try:
                await edge_tts.Communicate(j["text"], VOICES[j["voice"]], rate="+3%").save(j["file"])
                break
            except Exception:
                if attempt == 3:
                    raise
                await asyncio.sleep(3)

asyncio.run(main(json.loads(sys.stdin.read())))

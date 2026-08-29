# Free AI-avatar pipeline (verified 2026-08-29)

Goal: talking-head reels/shorts at zero cost, licence-clean for commercial
use. Founder decision 2026-08-29: do NOT use the founder's photo or voice for
now - the presenter is a fully synthetic face (FLUX.1-schnell, Apache 2.0)
speaking Chatterbox TTS narration. Local machine cannot run the models (512MB
VRAM), so generation happens on Google Colab's free T4 GPU.

READY TO RUN: content/DriveDE_Avatar_SoulX.ipynb - upload to Colab, Runtime ->
T4 GPU, Run all, download drivede-avatar-en.mp4. It fetches the committed face
(content/social-media/avatar-face.png) and narration
(content/social-media/narration-en-full.wav) from the repo automatically.
Install/patch recipe adapted from the AIQUEST community notebook
(TeamAIQ/Colab-notebooks): keeps Colab's torch, xformers instead of
flash_attn (T4 is Turing - flash_attn 2.x needs Ampere+), and replaces the
broken mediapipe CPUFaceHandler with an OpenCV DNN face detector.

## The stack (all commercially safe)

| Step | Tool | Licence |
|---|---|---|
| Talking-head video | SoulX-FlashHead-Lite 1.3B (Soul AI Lab) | Apache 2.0 |
| Voice (preferred) | Founder's own phone recording | n/a |
| Voice (TTS alternative) | Chatterbox Multilingual (Resemble AI), German + English, clones from ~10s of own voice | MIT |
| Fallback video model | EchoMimicV3 (Ant Group), better expressiveness, much slower | Apache 2.0 |
| Captions + composite | faster-whisper + ffmpeg (done locally by Claude) | OSS |

Explicitly RULED OUT on licence: Sonic (non-commercial), HunyuanVideo-Avatar
(licence excludes EU use), LivePortrait (InsightFace dep non-commercial),
F5-TTS weights (CC-BY-NC), Edge-TTS (MS ToS forbids commercial), XTTS-v2
(CPML non-commercial). HeyGen/Hedra free tiers: watermarked, no commercial
rights. HF Spaces for these models are mostly build-broken right now; use
Colab, not Spaces.

## Founder inputs (one-time, ~15 minutes)

1. PHOTO: front-facing head-and-shoulders, even daylight, plain background,
   mouth closed, camera at eye level, at least 1024px. No glasses glare.
2. VOICE: quiet room, phone ~20cm from mouth, no auto-gain apps. Read each
   script sentence twice (keep the better take), energetic delivery - the
   model mirrors audio energy in head motion. Scripts: content/narrator-scripts.md.
   Export as WAV or m4a, one file per language.

## Colab run (per clip, ~5-15 min generation on free T4)

1. Open a fresh Colab notebook, Runtime -> Change runtime type -> T4 GPU.
2. Use the SoulX-FlashHead-Lite notebook from TeamAIQ/Colab-notebooks
   (github.com/TeamAIQ/Colab-notebooks), or clone
   github.com/Soul-AILab/SoulX-FlashHead and follow its README inference cmd.
3. Upload the photo + the language's audio file, run, download the MP4.
4. First run downloads ~few GB of weights (add ~10 min). Colab free gives
   roughly 15-30 GPU hours/week; budget 2-4 finished clips per sitting.
5. SoulX generates unlimited length - NO stitching needed for a 35s clip.

## Post (Claude does this locally)

- ffmpeg composite to 1080x1920, burned-in captions from the script,
  app-footage cutaways (readiness gauge / tracker) at sentence boundaries.
- Schedule via Metricool with the MANDATORY AI labels:
  tiktokData.isAigc = true, instagramData.isAiGenerated = true,
  youtubeData.isAiGeneratedContent = true.

## Honest quality expectation

Good enough for TikTok/Reels at 720p with captions and cuts. Not
study-it-fullscreen perfect: hair edges, teeth shimmer, occasional flat
blinks. Commercial HeyGen (~25 EUR/mo, no watermark, 1080p, ~3 min
turnaround) is one visible tier better and saves ~a workday/month of
pipeline fiddling - rational upgrade IF the avatar reels get traction.
Prototype free first, pay only on evidence.

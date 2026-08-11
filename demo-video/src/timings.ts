/** Single source of truth for scene timing — imported by the composition AND record/qa.mjs. */
export const FPS = 30;

export const SCENES = {
  hook:       { from: 0,    dur: 150 }, // 5s — wordmark + headline over readiness footage
  tracker:    { from: 150,  dur: 240 }, // 8s
  readiness:  { from: 390,  dur: 240 },
  curriculum: { from: 630,  dur: 240 },
  maneuvers:  { from: 870,  dur: 210 }, // 7s (short narration)
  devices:    { from: 1080, dur: 120 }, // 4s — one account, every device
  cta:        { from: 1200, dur: 270 }, // 9s end card (long narration)
} as const;

export const TOTAL_FRAMES = 1470; // 49s @ 30fps
export const TRANSITION_FRAMES = 15;

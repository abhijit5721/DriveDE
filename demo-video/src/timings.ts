/** Single source of truth for scene timing — imported by the composition AND record/qa.mjs. */
export const FPS = 30;

export const SCENES = {
  hook:       { from: 0,    dur: 150 }, // 5s — headline over readiness footage, zoomed out
  tracker:    { from: 150,  dur: 240 }, // 8s
  readiness:  { from: 390,  dur: 240 },
  curriculum: { from: 630,  dur: 240 },
  maneuvers:  { from: 870,  dur: 240 },
  cta:        { from: 1110, dur: 240 }, // 8s end card
} as const;

export const TOTAL_FRAMES = 1350; // 45s @ 30fps
export const TRANSITION_FRAMES = 15;

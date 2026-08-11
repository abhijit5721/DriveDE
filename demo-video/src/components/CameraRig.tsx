import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

/** One camera position: at `at` frames into the scene, spring toward
 *  centering canvas-space point (cx, cy) at zoom `scale`. */
export type Shot = { at: number; scale: number; cx: number; cy: number };

export const CameraRig: React.FC<{ shots: Shot[]; children: React.ReactNode }> = ({ shots, children }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  let { scale, cx, cy } = shots[0];
  for (let i = 1; i < shots.length; i++) {
    const s = shots[i];
    const p = spring({
      frame: frame - s.at,
      fps,
      config: { damping: 200, stiffness: 60 }, // no overshoot, ~1s settle
    });
    scale = interpolate(p, [0, 1], [scale, s.scale]);
    cx = interpolate(p, [0, 1], [cx, s.cx]);
    cy = interpolate(p, [0, 1], [cy, s.cy]);
  }

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${width / 2 - cx * scale}px, ${height / 2 - cy * scale}px) scale(${scale})`,
        transformOrigin: '0 0',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

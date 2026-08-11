import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { Background } from '../components/Background.tsx';
import { CameraRig, type Shot } from '../components/CameraRig.tsx';
import { PhoneFrame, PHONE_W, PHONE_H } from '../components/PhoneFrame.tsx';
import { Caption } from '../components/Caption.tsx';

export const PHONE_X = (1920 - PHONE_W) / 2;
export const PHONE_Y = (1080 - PHONE_H) / 2;

/** Map a point in app-CSS coordinates (390x844 viewport) to canvas space. */
export const appPoint = (x: number, y: number) => ({
  cx: PHONE_X + 15 + (x * 396) / 390,
  cy: PHONE_Y + 15 + (y * 858) / 844,
});

export const FeatureScene: React.FC<{
  clip: string;
  caption: string;
  shots: Shot[];
  startFrom?: number;
}> = ({ clip, caption, shots, startFrom = 0 }) => {
  return (
    <AbsoluteFill>
      <Background />
      <CameraRig shots={shots}>
        <PhoneFrame x={PHONE_X} y={PHONE_Y}>
          <OffthreadVideo
            src={staticFile(clip)}
            startFrom={startFrom}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </PhoneFrame>
      </CameraRig>
      <Caption text={caption} />
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { Background } from '../components/Background.tsx';
import { PhoneFrame } from '../components/PhoneFrame.tsx';
import { PHONE_X, PHONE_Y } from './FeatureScene.tsx';

const { fontFamily } = loadFont();

/** Opening: headline center-stage, readiness footage small and dimmed behind. */
export const Hook: React.FC<{ clip: string; text: string }> = ({ clip, text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 5, fps, config: { damping: 200, stiffness: 70 } });
  const y = interpolate(p, [0, 1], [50, 0]);
  const opacity = interpolate(p, [0, 1], [0, 1]);
  const drift = interpolate(frame, [0, 150], [1.0, 1.06]); // slow push-in on the phone

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ transform: `scale(${0.72 * drift})`, transformOrigin: '50% 42%', opacity: 0.45, filter: 'blur(1px)' }}>
        <PhoneFrame x={PHONE_X} y={PHONE_Y}>
          <OffthreadVideo src={staticFile(clip)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </PhoneFrame>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h1
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.15,
            color: '#f8fafc',
            maxWidth: 1400,
            textAlign: 'center',
            transform: `translateY(${y}px)`,
            opacity,
            textShadow: '0 8px 40px rgba(2,6,23,0.9)',
          }}
        >
          {text}
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

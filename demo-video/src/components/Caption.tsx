import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

/** Lower-third caption pill with spring slide-up. Highlights €-amounts and numbers in emerald. */
export const Caption: React.FC<{ text: string; delay?: number }> = ({ text, delay = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 80 } });
  const y = interpolate(p, [0, 1], [40, 0]);
  const opacity = interpolate(p, [0, 1], [0, 1]);

  const parts = text.split(/(€?\d[\d.,–%-]*\s?€?|GPS|3D|KI|AI)/g);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 72,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.25,
          color: '#f8fafc',
          background: 'rgba(2,6,23,0.72)',
          border: '1px solid rgba(148,163,184,0.25)',
          borderRadius: 24,
          padding: '20px 44px',
          maxWidth: 1300,
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
        }}
      >
        {parts.map((part, i) =>
          /^(€?\d|GPS|3D|KI|AI)/.test(part) ? (
            <span key={i} style={{ color: '#34d399', fontWeight: 800 }}>{part}</span>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </div>
    </div>
  );
};

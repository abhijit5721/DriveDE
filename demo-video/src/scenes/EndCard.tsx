import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';
import { Background } from '../components/Background.tsx';

const { fontFamily } = loadFont();

export const EndCard: React.FC<{ title: string; sub: string; domain: string }> = ({ title, sub, domain }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) => {
    const p = spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 80 } });
    return {
      transform: `translateY(${interpolate(p, [0, 1], [36, 0])}px)`,
      opacity: interpolate(p, [0, 1], [0, 1]),
    };
  };

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', fontFamily, gap: 36 }}>
        {/* wordmark */}
        <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: -1, ...enter(0) }}>
          <span style={{ color: '#f8fafc' }}>Drive</span>
          <span style={{ color: '#3b82f6' }}>DE</span>
        </div>
        <h1
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: '#f8fafc',
            maxWidth: 1400,
            textAlign: 'center',
            lineHeight: 1.12,
            margin: 0,
            ...enter(8),
          }}
        >
          {title.split(/(€?\d[\d.,–]*\s?€?)/g).map((part, i) =>
            /^€?\d/.test(part) ? (
              <span key={i} style={{ color: '#34d399' }}>{part}</span>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            )
          )}
        </h1>
        <p style={{ fontSize: 42, fontWeight: 600, color: '#94a3b8', margin: 0, ...enter(16) }}>{sub}</p>
        <div
          style={{
            marginTop: 20,
            fontSize: 40,
            fontWeight: 800,
            color: '#fff',
            background: '#2563eb',
            borderRadius: 20,
            padding: '22px 64px',
            boxShadow: '0 24px 60px -12px rgba(37,99,235,0.55)',
            ...enter(24),
          }}
        >
          {domain}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

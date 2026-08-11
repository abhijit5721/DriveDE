import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Background } from '../components/Background.tsx';
import { Caption } from '../components/Caption.tsx';
import type { Lang } from '../copy.ts';

/**
 * "One account, every device": desktop dashboard in a monitor frame with the
 * phone overlapping — mirrors the landing-page hero. Static screenshots with
 * a slow push-in; no recorded footage needed.
 */
export const DevicesScene: React.FC<{ lang: Lang; caption: string }> = ({ lang, caption }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 120], [1.0, 1.07]);

  const monitorW = 1240;
  const monitorH = Math.round((monitorW * 1059) / 1600) + 36; // screenshot ratio + bezel
  const phoneW = 240;
  const phoneH = Math.round((phoneW * 844) / 390) + 24;

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', transform: `scale(${zoom})`, marginBottom: 60 }}>
          {/* monitor */}
          <div
            style={{
              width: monitorW,
              borderRadius: 28,
              padding: 18,
              background: 'linear-gradient(145deg, rgba(148,163,184,0.7) 0%, #1e293b 45%, #020617 100%)',
              boxShadow: '0 60px 120px -30px rgba(2,6,23,0.7)',
            }}
          >
            <div style={{ borderRadius: 14, overflow: 'hidden', background: '#020617' }}>
              <Img src={staticFile(`devices/app-dashboard-${lang}.webp`)} style={{ width: '100%', display: 'block' }} />
            </div>
          </div>
          {/* stand */}
          <div style={{ margin: '0 auto', width: 150, height: 64, background: 'linear-gradient(180deg, #1e293b, #0f172a)', clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)' }} />
          <div style={{ margin: '0 auto', width: 300, height: 12, borderRadius: 8, background: '#1e293b' }} />
          {/* phone overlapping bottom-right */}
          <div
            style={{
              position: 'absolute',
              right: -70,
              bottom: -20,
              width: phoneW,
              height: phoneH,
              borderRadius: 40,
              padding: 6,
              background: 'linear-gradient(145deg, rgba(148,163,184,0.9) 0%, #334155 40%, #020617 100%)',
              boxShadow: '0 40px 80px -20px rgba(2,6,23,0.8)',
            }}
          >
            <div style={{ width: '100%', height: '100%', borderRadius: 34, overflow: 'hidden', background: '#000', border: '6px solid #000' }}>
              <Img src={staticFile(`devices/app-mobile-${lang}.webp`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Caption text={caption} />
    </AbsoluteFill>
  );
};

import React from 'react';
import { AbsoluteFill } from 'remotion';

/** Dark brand backdrop: slate-950 -> blue-950 radial + faint grain (masks banding). */
export const Background: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(1200px 800px at 30% 20%, #172554 0%, #0f172a 45%, #020617 100%)',
      }}
    />
    <AbsoluteFill
      style={{
        opacity: 0.05,
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%272%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
      }}
    />
  </AbsoluteFill>
);

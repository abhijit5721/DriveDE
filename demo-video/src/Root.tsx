import React from 'react';
import { Composition } from 'remotion';
import { DemoVideo } from './DemoVideo.tsx';
import { ShortCockpit, SHORT_FRAMES } from './ShortCockpit.tsx';
import { FPS, TOTAL_FRAMES } from './timings.ts';

export const Root: React.FC = () => (
  <>
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={lang}
        id={`demo-${lang}`}
        component={DemoVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ lang }}
      />
    ))}
    {(['de', 'en'] as const).map((lang) => (
      <Composition
        key={`short-${lang}`}
        id={`short-cockpit-${lang}`}
        component={ShortCockpit}
        durationInFrames={SHORT_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ lang }}
      />
    ))}
  </>
);

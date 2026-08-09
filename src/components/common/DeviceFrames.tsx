/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * Pure-CSS device mockups (DRI-14): screenshots read as hardware, not as
 * bordered rectangles. No image assets — bezels, stand, notch and buttons are
 * all elements, so they stay crisp at any size and cost zero bytes.
 */

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Body */}
      <div className="relative overflow-hidden rounded-[2.2rem] border-[6px] border-slate-950 bg-slate-950 shadow-[0_25px_60px_rgba(0,0,0,0.65)] ring-1 ring-slate-700/60">
        {/* Dynamic island — kept small so it sits in the header's empty middle
            instead of covering the app's own wordmark */}
        <div className="absolute left-1/2 top-1.5 z-10 h-[10px] w-12 -translate-x-1/2 rounded-full bg-black/90" />
        {children}
      </div>
      {/* Side buttons */}
      <div className="absolute -left-[2px] top-[18%] h-8 w-[3px] rounded-l-md bg-slate-700" />
      <div className="absolute -left-[2px] top-[30%] h-12 w-[3px] rounded-l-md bg-slate-700" />
      <div className="absolute -right-[2px] top-[22%] h-16 w-[3px] rounded-r-md bg-slate-700" />
    </div>
  );
}

export function MonitorFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Screen with bezel */}
      <div className="w-full overflow-hidden rounded-2xl border-[10px] border-slate-950 bg-slate-950 shadow-[0_25px_60px_rgba(0,0,0,0.65)] ring-1 ring-slate-700/60">
        {children}
      </div>
      {/* Stand */}
      <div className="h-9 w-24 bg-gradient-to-b from-slate-800 to-slate-900 [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
      <div className="h-2 w-44 rounded-full bg-slate-800" />
    </div>
  );
}

/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { ReactNode } from 'react';
import { cn } from '../../utils/cn';

/**
 * Pure-CSS device mockups (DRI-14): screenshots read as hardware, not as
 * bordered rectangles. The phone gets a chamfered metallic edge (gradient
 * catching light top-left), a black bezel, dynamic island and side buttons —
 * the "3D render" look without a single image asset.
 */

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {/* Metallic chamfer — the light-catching outer edge */}
      <div className="rounded-[2.9rem] bg-gradient-to-br from-slate-400/90 via-slate-700 to-slate-950 p-[3px] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.35)]">
        {/* Black bezel body */}
        <div className="relative overflow-hidden rounded-[2.7rem] bg-slate-950 p-[7px]">
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[2.15rem]">
            {/* Dynamic island — small so it sits in the header's empty middle */}
            <div className="absolute left-1/2 top-2 z-10 h-[12px] w-14 -translate-x-1/2 rounded-full bg-black" />
            {children}
            {/* Subtle screen glass reflection */}
            <div className="pointer-events-none absolute inset-0 rounded-[2.15rem] bg-gradient-to-tr from-transparent via-transparent to-white/[0.045]" />
          </div>
        </div>
      </div>
      {/* Side buttons sitting on the metallic edge */}
      <div className="absolute -left-[2px] top-[17%] h-7 w-[3px] rounded-l-md bg-slate-500/80" />
      <div className="absolute -left-[2px] top-[26%] h-11 w-[3px] rounded-l-md bg-slate-500/80" />
      <div className="absolute -right-[2px] top-[21%] h-14 w-[3px] rounded-r-md bg-slate-500/80" />
    </div>
  );
}

export function MonitorFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Screen: thin metallic edge, then bezel */}
      <div className="w-full rounded-2xl bg-gradient-to-b from-slate-600 via-slate-800 to-slate-900 p-[2px] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.35)]">
        <div className="overflow-hidden rounded-[calc(1rem-2px)] border-[9px] border-slate-950 bg-slate-950">
          {children}
        </div>
      </div>
      {/* Stand */}
      <div className="h-9 w-24 bg-gradient-to-b from-slate-700 to-slate-900 [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)]" />
      <div className="h-2.5 w-48 rounded-full bg-gradient-to-b from-slate-700 to-slate-900" />
    </div>
  );
}

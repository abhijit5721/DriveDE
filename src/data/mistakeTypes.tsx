/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * mistakeTypes.tsx
 *
 * Single registry for driving-mistake types: lucide icon, accent color and
 * manual-log grouping. Tracker (badges + manual-log modal), HotspotMap and
 * any future surface must consume this instead of keeping parallel
 * icon/label maps (they drifted: harsh_braking once had two different icons).
 * Labels stay in translations.ts under t.tracker.mistakes (camelCase keys).
 */

import {
  AlertTriangle, Square, CornerUpRight, Ban, Eye, View, Footprints, Gauge,
  TrendingDown, RotateCcw, Navigation, Repeat2, Flame, GraduationCap,
  MoreHorizontal, ArrowBigLeftDash,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface MistakeMeta {
  Icon: LucideIcon;
  /** accent classes; red/amber only where the mistake is safety-critical */
  color: string;
}

export const MISTAKE_META: Record<string, MistakeMeta> = {
  priority:             { Icon: AlertTriangle,    color: 'text-red-500' },
  stop_sign:            { Icon: Square,           color: 'text-red-600' },
  right_before_left:    { Icon: CornerUpRight,    color: 'text-amber-500' },
  wrong_way:            { Icon: Ban,              color: 'text-red-700' },
  shoulder_check:       { Icon: Eye,              color: 'text-blue-500' },
  mirror_check:         { Icon: View,             color: 'text-slate-500 dark:text-slate-400' },
  // a dashed direction arrow reads as a turn indicator; lucide's Signal is cell bars
  signal:               { Icon: ArrowBigLeftDash, color: 'text-amber-500' },
  pedestrian_safety:    { Icon: Footprints,       color: 'text-amber-600' },
  speeding:             { Icon: Gauge,            color: 'text-red-500' },
  harsh_braking:        { Icon: TrendingDown,     color: 'text-amber-600' },
  roundabout_signal:    { Icon: RotateCcw,        color: 'text-blue-500' },
  curve_speeding:       { Icon: Navigation,       color: 'text-amber-500' },
  aggressive_cornering: { Icon: Repeat2,          color: 'text-red-500' },
  idling:               { Icon: Flame,            color: 'text-emerald-500' },
  illegal_turn:         { Icon: Ban,              color: 'text-red-500' },
  school_zone_speeding: { Icon: GraduationCap,    color: 'text-amber-600' },
  other:                { Icon: MoreHorizontal,   color: 'text-slate-500' },
};

export function getMistakeMeta(type: string): MistakeMeta {
  return MISTAKE_META[type] ?? MISTAKE_META.other;
}

/** Manual-log modal grouping: scanned under stress, so 3 labeled clusters
 *  beat 11 flat tiles. Order within a group = rough frequency. */
export const MANUAL_MISTAKE_GROUPS: { id: string; de: string; en: string; types: string[] }[] = [
  { id: 'rules',       de: 'Vorfahrt & Regeln', en: 'Right of way & rules', types: ['priority', 'right_before_left', 'stop_sign', 'wrong_way'] },
  { id: 'observation', de: 'Beobachtung',       en: 'Observation',          types: ['shoulder_check', 'mirror_check', 'signal', 'pedestrian_safety'] },
  { id: 'control',     de: 'Tempo & Kontrolle', en: 'Speed & control',      types: ['speeding', 'harsh_braking', 'other'] },
];

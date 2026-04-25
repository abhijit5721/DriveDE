/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Play, Film, Wrench, Lock } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { chapters } from '../../data/curriculum';
import { cn } from '../../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../../utils/license';
import { filterLessonsForSelection } from '../../utils/contentFilter';
import { EmptyState } from '../common/EmptyState';
import type { Lesson } from '../../types';
import AnimatedManeuver from './AnimatedManeuver';

interface ManeuversProps {
  onLessonSelect: (lesson: Lesson) => void;
  onOpenPaywall?: () => void;
}

type AnimationType = 'parallel-parking' | 'reverse-parking' | 'three-point-turn' | 'emergency-brake' | 'roundabout' | 'highway-merge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export function Maneuvers({ onLessonSelect, onOpenPaywall }: ManeuversProps) {
  const { language, licenseType, isPremium } = useAppStore();
  const isDE = language === 'de';
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType | null>(null);
  const transmissionType = getTransmissionFromLicenseType(licenseType);
  const learningPath = getLearningPathFromLicenseType(licenseType);

  // Get only maneuver lessons (chapter 2)
  const maneuverChapter = chapters.find(ch => ch.id === 'chapter-2');
  const maneuvers = filterLessonsForSelection(maneuverChapter?.lessons || [], transmissionType, learningPath);

  const getManeuverIcon = (lessonId: string) => {
    switch (lessonId) {
      case 'maneuver-1': return '🅿️'; // Parallel parking
      case 'maneuver-2': return '⬇️'; // Reverse parking
      case 'maneuver-3': return '🔄'; // Three-point turn
      case 'maneuver-4': return '🛑'; // Emergency braking
      default: return '🚗';
    }
  };

  const getManeuverColor = (lessonId: string) => {
    switch (lessonId) {
      case 'maneuver-1': return 'from-blue-500 to-blue-600';
      case 'maneuver-2': return 'from-purple-500 to-purple-600';
      case 'maneuver-3': return 'from-orange-500 to-orange-600';
      case 'maneuver-4': return 'from-red-500 to-red-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <motion.div 
      className="space-y-6 pb-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {isDE ? 'Grundfahraufgaben' : 'Basic Maneuvers'}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isDE
            ? 'Schritt-für-Schritt Anleitungen für die Prüfung'
            : 'Step-by-step guides for the exam'}
        </p>
      </motion.div>

      {/* Maneuver Cards Grid */}
      {maneuvers.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            icon={<Wrench className="h-10 w-10 text-slate-400 dark:text-slate-500" />}
            title={isDE ? 'Keine Manöver' : 'No Maneuvers'}
            message={isDE ? 'Für diesen Lernpfad sind keine speziellen Grundfahraufgaben erforderlich.' : 'No special maneuvers are required for this learning path.'}
          />
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 gap-3"
          variants={containerVariants}
        >
          {maneuvers.map((maneuver) => (
            <motion.button
              key={maneuver.id}
              onClick={() => onLessonSelect(maneuver)}
              aria-label={isDE 
                ? `${maneuver.titleDe}: ${maneuver.steps?.length || 0} Schritte ansehen` 
                : `${maneuver.titleEn}: View ${maneuver.steps?.length || 0} steps`}
              className="group relative overflow-hidden rounded-2xl p-4 text-left"
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-90',
                getManeuverColor(maneuver.id)
              )} />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="mb-3 text-3xl">{getManeuverIcon(maneuver.id)}</div>
                  {maneuver.isPremium && (
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      Pro
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white">
                  {isDE ? maneuver.titleDe : maneuver.titleEn}
                </h3>
                <p className="mt-1 text-xs text-white/80">
                  {maneuver.steps?.length || 0} {isDE ? 'Schritte' : 'steps'}
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-white">
                  <Play className="h-3 w-3" />
                  {isDE ? 'Starten' : 'Start'}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Quick Tips Section */}
      <motion.div 
        className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
        variants={itemVariants}
      >
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
          {isDE ? 'Wichtige Hinweise' : 'Important Tips'}
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <span className="text-xl">👀</span>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {isDE ? 'Rundum-Blick + Schulterblick!' : '360° check + shoulder check!'}
              </p>
              <p className="mt-0.5 text-xs text-red-700 dark:text-red-400">
                {isDE
                  ? 'Vor jedem Rückwärtsweg Rundum-Blick, bei Spurwechsel und Richtungswechsel klarer Schulterblick'
                  : 'Before every reverse movement use a 360° check; for lane or direction changes show a clear shoulder check'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <span className="text-xl">🐌</span>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {isDE ? 'Langsam fahren' : 'Drive Slowly'}
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                {isDE
                  ? 'Bei Manövern gilt: Geschwindigkeit = Kontrolle'
                  : 'For maneuvers: Speed = Control'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <span className="text-xl">✅</span>
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {isDE ? 'Korrigieren erlaubt' : 'Corrections Allowed'}
              </p>
              <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                {isDE
                  ? 'Rangieren ist bei der Prüfung kein Problem'
                  : 'Adjusting position is fine in the exam'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exam Checklist */}
      <motion.div 
        className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
        variants={itemVariants}
      >
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">
          {isDE ? 'Prüfungs-Checkliste' : 'Exam Checklist'}
        </h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {[
            { de: '✓ Beobachten → Blinken → Schulterblick → Manöver', en: '✓ Observe → Signal → Shoulder check → Maneuver' },
            { de: '✓ Kupplung am Schleifpunkt halten', en: '✓ Hold clutch at biting point' },
            { de: '✓ Orientierungspunkte nutzen', en: '✓ Use reference points' },
            { de: '✓ Ruhe bewahren, Zeit lassen', en: '✓ Stay calm, take your time' },
          ].map((item, idx) => (
            <li key={idx}>{isDE ? item.de : item.en}</li>
          ))}
        </ul>
      </motion.div>

      {/* Video Animations Section */}
      <motion.div 
        className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
        variants={itemVariants}
      >
        <div className="flex items-center gap-2 mb-4">
          <Film className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Animierte Anleitungen' : 'Animated Guides'}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { id: 'parallel-parking' as AnimationType, label: isDE ? 'Einparken' : 'Parallel', icon: '🅿️' },
            { id: 'reverse-parking' as AnimationType, label: isDE ? 'Rückwärts' : 'Reverse', icon: '⬇️' },
            { id: 'three-point-turn' as AnimationType, label: isDE ? 'Wenden' : '3-Point', icon: '🔄' },
            { id: 'emergency-brake' as AnimationType, label: isDE ? 'Notbremse' : 'Emergency', icon: '🛑' },
            { id: 'roundabout' as AnimationType, label: isDE ? 'Kreisverkehr' : 'Roundabout', icon: '🔵' },
            { id: 'highway-merge' as AnimationType, label: isDE ? 'Autobahn' : 'Highway', icon: '🛣️' },
          ].map((anim) => (
            <button
              key={anim.id}
              onClick={() => {
                if (isPremium) {
                  setSelectedAnimation(selectedAnimation === anim.id ? null : anim.id);
                } else {
                  onOpenPaywall?.();
                }
              }}
              aria-label={isDE ? `Animation für ${anim.label} ${selectedAnimation === anim.id ? 'schließen' : 'öffnen'}` : `${selectedAnimation === anim.id ? 'Close' : 'Open'} ${anim.label} animation`}
              aria-pressed={selectedAnimation === anim.id}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-lg p-3 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800',
                selectedAnimation === anim.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              )}
            >
              {!isPremium && (
                <div className="absolute right-1 top-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm">
                  <Lock className="h-2.5 w-2.5 text-amber-500" />
                </div>
              )}
              <span className="text-xl" aria-hidden="true">{anim.icon}</span>
              <span className="text-xs font-semibold">{anim.label}</span>
            </button>
          ))}
        </div>

        {selectedAnimation && (
          <AnimatedManeuver type={selectedAnimation} language={language} />
        )}
      </motion.div>
    </motion.div>
  );
}

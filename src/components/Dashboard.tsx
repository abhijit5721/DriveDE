import { Car, BookOpen, Clock, ChevronRight, Target, Cog, Zap, Crown, RefreshCcw, BadgeCheck, ClipboardCheck, Scale, Cloud, LogIn, Flame, Mic } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { chapters, getAllLessons } from '../data/curriculum';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../utils/license';
import { filterChaptersForSelection, filterLessonsForSelection } from '../utils/contentFilter';
import type { TabType } from '../types';
import { ExamReadinessGauge } from './ExamReadinessGauge';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
  onChangePath: () => void;
  onOpenPaywall: () => void;
  onStartSimulation: () => void;
  onDirectLessonSelect: (lessonId: string) => void;
  onOpenAuth?: () => void;
}

export function Dashboard({ onNavigate, onChangePath, onOpenPaywall, onStartSimulation, onDirectLessonSelect, onOpenAuth }: DashboardProps) {
  const { language, userProgress, licenseType, isPremium, authStatus, authEmail } = useAppStore();
  const learningPath = getLearningPathFromLicenseType(licenseType);
  const transmissionType = getTransmissionFromLicenseType(licenseType);

  const visibleLessons = filterLessonsForSelection(getAllLessons(), transmissionType, learningPath);
  const visibleChapters = filterChaptersForSelection(chapters, transmissionType, learningPath).filter(
    (chapter) => chapter.lessons.length > 0
  );
  const totalLessons = visibleLessons.length;
  const completedLessons = userProgress.completedLessons.length;
  
  // Weighted Progress Calculation: 70% Lessons, 30% Quizzes
  const activeLessonsPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const mainQuizScore = userProgress.quizScores['main-scenarios'] || 0;
  
  const progressPercent = Math.round((activeLessonsPercent * 0.7) + (mainQuizScore * 0.3));

  const totalHours = Math.floor(userProgress.totalDrivingMinutes / 60);
  const totalMinutes = userProgress.totalDrivingMinutes % 60;

  const isDE = language === 'de';
  const isUmschreibung = learningPath === 'umschreibung';

  const requiredSpecial = {
    ueberland: 225,
    autobahn: 180,
    nacht: 135,
  };

  const specialProgress = {
    ueberland: Math.min(100, Math.round((userProgress.specialDrivingMinutes.ueberland / requiredSpecial.ueberland) * 100)),
    autobahn: Math.min(100, Math.round((userProgress.specialDrivingMinutes.autobahn / requiredSpecial.autobahn) * 100)),
    nacht: Math.min(100, Math.round((userProgress.specialDrivingMinutes.nacht / requiredSpecial.nacht) * 100)),
  };

  const pathConfig = isUmschreibung
    ? {
        title: isDE ? 'Umschreibung' : 'License Conversion',
        subtitle:
          transmissionType === 'manual'
            ? isDE
              ? 'Mit Schaltwagen-Prüfung und Fokus auf deutsche Regeln'
              : 'With manual exam car and focus on German rules'
            : isDE
              ? 'Mit Automatik-Prüfung und Fokus auf deutsche Regeln'
              : 'With automatic exam car and focus on German rules',
        badgeClass: 'bg-purple-100 dark:bg-purple-900/30',
        iconClass: 'bg-purple-200 dark:bg-purple-800',
        textClass: 'text-purple-800 dark:text-purple-200',
        subtextClass: 'text-purple-600 dark:text-purple-400',
        icon: <BadgeCheck className="h-5 w-5 text-purple-700 dark:text-purple-300" />,
      }
    : transmissionType === 'manual'
      ? {
          title: isDE ? 'Klasse B - Schaltgetriebe' : 'Class B - Manual',
          subtitle: isDE ? 'Mit Kupplung & Gangschaltung' : 'With clutch & gear stick',
          badgeClass: 'bg-orange-100 dark:bg-orange-900/30',
          iconClass: 'bg-orange-200 dark:bg-orange-800',
          textClass: 'text-orange-800 dark:text-orange-200',
          subtextClass: 'text-orange-600 dark:text-orange-400',
          icon: <Cog className="h-5 w-5 text-orange-700 dark:text-orange-300" />,
        }
      : {
          title: isDE ? 'Klasse B197 - Automatik' : 'Class B197 - Automatic',
          subtitle: isDE ? 'Automatisches Getriebe' : 'Automatic transmission',
          badgeClass: 'bg-blue-100 dark:bg-blue-900/30',
          iconClass: 'bg-blue-200 dark:bg-blue-800',
          textClass: 'text-blue-800 dark:text-blue-200',
          subtextClass: 'text-blue-600 dark:text-blue-400',
          icon: <Zap className="h-5 w-5 text-blue-700 dark:text-blue-300" />,
        };

  return (
    <div className="space-y-6 pb-6">
      {/* Premium Hero Section: Exam Readiness & Path */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/50 dark:bg-slate-800 dark:shadow-none">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                {pathConfig.title}
              </span>
              <p className="text-sm text-blue-100/80">
                {isDE ? 'Dein Lernfortschritt' : 'Your Learning Progress'}
              </p>
            </div>
            <button
              onClick={onChangePath}
              aria-label={isDE ? 'Lernpfad ändern' : 'Change learning path'}
              className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>

            <ExamReadinessGauge 
              progress={progressPercent}
              label={isDE ? 'Prüfungschance' : 'Exam Score'}
              subLabel={isDE 
? 'Kombination aus Lektionen & Tests' 
: 'Combined Lessons & Quiz Score'}
              className="w-full"
            />
          </div>
        
        {/* Quick Progress Bar (Alternative visualization) */}
        {!isPremium && (
          <div className="border-t border-slate-100 p-4 dark:border-slate-700">
            <button
              onClick={onOpenPaywall}
              aria-label={isDE ? 'Premium freischalten' : 'Unlock Premium'}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 transition-transform hover:scale-[1.01] dark:from-amber-900/10 dark:to-orange-900/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40">
                  <Crown className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">DriveDE Pro</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {isDE ? 'Alle Funktionen freischalten' : 'Unlock all premium features'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-amber-500" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={onStartSimulation}
          aria-label={isDE ? 'Prüfungssimulation starten' : 'Start Exam Simulation'}
          className="group flex w-full items-center justify-between rounded-2xl bg-slate-900 p-5 text-white shadow-lg transition-all hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 group-hover:scale-110 transition-transform">
              <Mic className="h-6 w-6" />
              {!isPremium && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 shadow-sm">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-bold">{isDE ? 'Prüfungssimulation' : 'Exam Simulation'}</p>
              <p className="text-xs text-slate-400">
                {isDE ? 'Echte Prüfungsfragen und Zeitdruck' : 'Real exam questions and time pressure'}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isDE ? 'Fahrstunden' : 'Driving Hours'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {totalHours}h {totalMinutes}m
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isDE ? 'Kapitel' : 'Chapters'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {visibleChapters.filter((ch) => ch.lessons.some((l) => userProgress.completedLessons.includes(l.id))).length}/{visibleChapters.length}
              </p>
            </div>
          </div>
        </div>

        <div className={cn(
          "rounded-2xl bg-white p-4 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 transition-all",
          userProgress.currentStreak === 0 ? "opacity-50 grayscale" : ""
        )}>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {isDE ? 'Serie' : 'Streak'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {userProgress.currentStreak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isUmschreibung && (
        <button
          onClick={() => onDirectLessonSelect('basics-0')}
          aria-label={isDE ? 'Umschreibung Schnellstart: Zu deutschen Prüfungsfallen springen' : 'Conversion Quick Start: Jump to German exam traps'}
          className="w-full rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-purple-900/40 dark:from-purple-900/20 dark:to-indigo-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/40">
              <BadgeCheck className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h3 className="min-w-0 flex-1 text-base font-bold text-slate-900 dark:text-white">
                  {isDE ? 'Umschreibung Schnellstart' : 'Conversion Quick Start'}
                </h3>
                <div className="flex items-center gap-2">
                  {!isPremium && (
                    <span className="inline-flex rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                      Pro
                    </span>
                  )}
                  <span className="inline-flex rounded-full bg-purple-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-purple-800 dark:bg-purple-800/60 dark:text-purple-100">
                    {isDE ? 'Deutschland-Fokus' : 'Germany Focus'}
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-purple-500 dark:text-purple-300" />
                </div>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isDE
                  ? 'Springe direkt zu deutschen Prüfungsfallen: Grüner Pfeil, Rechts-vor-links-Ausnahmen, Schulterblick-Pflichten, Spielstraße vs. Zone 30 und Sofort-Durchfallen-Kriterien.'
                  : 'Jump straight to German exam traps: green arrow, right-before-left exceptions, shoulder-check duties, traffic-calmed zones vs. Zone 30, and instant-fail criteria.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  isDE ? 'Grüner Pfeil' : 'Green Arrow',
                  isDE ? 'Schulterblick' : 'Shoulder Check',
                  isDE ? 'Rechts-vor-links' : 'Right-before-left',
                  isDE ? 'Sofort durchgefallen' : 'Instant fail',
                ].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-purple-700 shadow-sm dark:bg-slate-800/80 dark:text-purple-200"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <button
          onClick={() => onNavigate('maneuvers')}
          aria-label={isDE ? 'Manöver: Grundfahraufgaben und Animationen ansehen' : 'Maneuvers: View basic maneuvers and animations'}
          className="group relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Zap className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isDE ? 'Manöver' : 'Maneuvers'}
                </p>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:bg-blue-900/30">
                  {isDE ? 'Animationen' : 'Animations'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {isDE
                  ? 'Grundfahraufgaben wie Einparken und Wenden.'
                  : 'Basic maneuvers like parking and turning.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('legal')}
          aria-label={isDE ? 'Rechtliches & DSGVO: Datenschutz und Impressum ansehen' : 'Legal & GDPR: View privacy and imprint'}
          className="group relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Scale className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isDE ? 'Rechtliches & DSGVO' : 'Legal & GDPR'}
                </p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:bg-emerald-900/30">
                  {isDE ? 'Pflicht' : 'Required'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {isDE
                  ? 'Datenschutz, Impressum und Launch-Checks.'
                  : 'Privacy, imprint, and launch readiness.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onDirectLessonSelect('basics-1a')}
          aria-label={isDE ? 'Fahrzeugtechnik: Reifen, Lichter und Kontrollleuchten lernen' : 'Vehicle Tech: Learn about tires, lights, and indicators'}
          className="group relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Target className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isDE ? 'Fahrzeugtechnik' : 'Vehicle Tech'}
                </p>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:bg-amber-900/30">
                  {isDE ? 'Prüfung' : 'Exam'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {isDE
                  ? 'Reifen, Lichter und Kontrollleuchten.'
                  : 'Tires, lights, and check indicators.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('review')}
          aria-label={isDE ? 'Fahrlehrer-Review-Paket: Fortschritt als PDF exportieren' : 'Instructor Review Pack: Export progress as PDF'}
          className="group relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 lg:col-span-2"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isDE ? 'Fahrlehrer-Review-Paket' : 'Instructor Review Pack'}
                </p>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-600 dark:bg-indigo-900/30">
                  {isDE ? 'PDF Export' : 'PDF Export'}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {isDE
                  ? 'Lehrplan und Fortschritt zum Teilen mit dem Fahrlehrer exportieren.'
                  : 'Export curriculum and progress to share with your instructor.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isUmschreibung
                ? isDE
                  ? 'Praxis-Check'
                  : 'Conversion Checks'
                : isDE
                  ? 'Sonderfahrten'
                  : 'Special Drives'}
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {isUmschreibung
                ? isDE
                  ? 'Fokus-Themen'
                  : 'Required Areas'
                : isDE
                  ? 'Gesetzliche Pflicht'
                  : 'Mandatory Hours'}
            </p>
          </div>
        </div>

        {isUmschreibung ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                icon: '👀',
                title: isDE ? 'Schulterblick' : 'Shoulder check',
                text: isDE ? 'Immer ausführen.' : 'Always perform.',
              },
              {
                icon: '🚦',
                title: isDE ? 'Vorfahrt' : 'Right-of-way',
                text: isDE ? 'Rechts-vor-links.' : 'Right-before-left.',
              },
              {
                icon: '📝',
                title: isDE ? 'Routine' : 'Routine',
                text: isDE ? 'Ruhige Fahrweise.' : 'Calm driving.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.title}</p>
                </div>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { key: 'ueberland', labelDe: 'Überland', labelEn: 'Country', required: '5×45', icon: <Target className="h-3.5 w-3.5" /> },
              { key: 'autobahn', labelDe: 'Autobahn', labelEn: 'Highway', required: '4×45', icon: <Zap className="h-3.5 w-3.5" /> },
              { key: 'nacht', labelDe: 'Nacht', labelEn: 'Night', required: '3×45', icon: <Clock className="h-3.5 w-3.5" /> },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <span className="text-slate-400">{item.icon}</span>
                    <span>{isDE ? item.labelDe : item.labelEn}</span>
                  </div>
                  <span className="font-mono text-slate-400">
                    {Math.floor(userProgress.specialDrivingMinutes[item.key as keyof typeof userProgress.specialDrivingMinutes] / 45)}/{item.required.split('×')[0]} {isDE ? 'Std' : 'hrs'}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      specialProgress[item.key as keyof typeof specialProgress] >= 100 
                        ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                        : 'bg-indigo-500'
                    )}
                    style={{ width: `${specialProgress[item.key as keyof typeof specialProgress]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {isDE ? 'Weiter lernen' : 'Continue Learning'}
          </h3>
          <button
            onClick={() => onNavigate('curriculum')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            {isDE ? 'Alle Lektionen' : 'View All'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {visibleChapters.slice(0, 3).map((chapter) => {
            const chapterCompleted = chapter.lessons.filter((l) => userProgress.completedLessons.includes(l.id)).length;
            const chapterProgress = chapter.lessons.length > 0
              ? Math.round((chapterCompleted / chapter.lessons.length) * 100)
              : 0;

            const Icon = chapter.id === 'chapter-1' ? Car :
                         chapter.id === 'chapter-2' ? Target :
                         chapter.id === 'chapter-3' ? Zap :
                         chapter.id === 'chapter-4' ? BookOpen : Flame;

            return (
              <button
                key={chapter.id}
                onClick={() => onNavigate('curriculum')}
                aria-label={isDE ? `${chapter.titleDe}: Fortschritt ${chapterProgress}%` : `${chapter.titleEn}: Progress ${chapterProgress}%`}
                className="group flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-900 dark:group-hover:bg-indigo-900/30">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate dark:text-white">
                    {isDE ? chapter.titleDe : chapter.titleEn}
                  </h4>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${chapterProgress}%` }} />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{chapterProgress}%</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold">
              {isDE ? 'Prüfungs-Pro-Tipp' : 'Exam Pro Tip'}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-indigo-100">
              {isUmschreibung
                ? isDE
                  ? 'Der Schulterblick ist entscheidend. Führe ihn deutlich und sichtbar aus.'
                  : 'The shoulder check is vital. Execute it clearly and visibly.'
                : isDE
                  ? 'Schulterblick ist der häufigste Fehler! Üben Sie ihn bei jedem Spurwechsel.'
                  : 'Shoulder check is the most common mistake! Practice it with every lane change.'}
            </p>
          </div>
        </div>
      </div>
      {/* Footer Status: Cloud Sync */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <button
          onClick={() => onOpenAuth?.()}
          aria-label={isDE ? 'Kontoeinstellungen' : 'Account Settings'}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
            authStatus === 'signed_in' 
              ? "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" 
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {authStatus === 'signed_in' ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="h-3.5 w-3.5" />
              {isDE ? 'Cloud-Sync aktiv' : 'Cloud sync active'}
            </>
          ) : (
            <>
              <LogIn className="h-3.5 w-3.5" />
              {isDE ? 'Anmelden für Cloud-Sync' : 'Sign in for Cloud Sync'}
            </>
          )}
        </button>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          DriveDE v1.2.0 • {isDE ? 'Präzise Fahrvorbereitung' : 'Precision Driving Prep'}
        </p>
      </div>
    </div>
  );
}

import { Car, BookOpen, Clock, ChevronRight, Target, Cog, Zap, Crown, RefreshCcw, BadgeCheck, ClipboardCheck, Scale, Cloud, LogIn, Flame, Mic } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { chapters, getAllLessons } from '../data/curriculum';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../utils/license';
import { filterChaptersForSelection, filterLessonsForSelection } from '../utils/contentFilter';
import type { TabType } from '../types';

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
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
      <div className="grid grid-cols-1 gap-3">
        <div className={cn('rounded-xl p-4', pathConfig.badgeClass)}>
          <div className="flex items-start gap-3">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', pathConfig.iconClass)}>
              {pathConfig.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={cn('text-xs font-semibold uppercase tracking-wide', pathConfig.subtextClass)}>
                    {isDE ? 'Aktueller Pfad' : 'Current Path'}
                  </p>
                  <p className={cn('text-base font-bold', pathConfig.textClass)}>{pathConfig.title}</p>
                  <p className={cn('text-xs', pathConfig.subtextClass)}>{pathConfig.subtitle}</p>
                </div>
                <button
                  onClick={onChangePath}
                  className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-200"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {isDE ? 'Ändern' : 'Change'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {!isPremium && (
          <button
            onClick={onOpenPaywall}
            className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white shadow-lg shadow-blue-200/60 transition-transform hover:scale-[1.01] dark:border-blue-800 dark:shadow-blue-900/30"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{isDE ? 'DriveDE Pro' : 'DriveDE Pro'}</p>
                <p className="text-xs text-blue-100">
                  {isDE
                    ? 'Paywall jetzt sichtbar öffnen und Premium-Funktionen ansehen'
                    : 'Open paywall now and view premium features'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/90" />
          </button>
        )}
      </div>

      <button
        onClick={onStartSimulation}
        className="flex w-full items-center justify-between rounded-xl bg-slate-900 p-4 text-white shadow-lg transition-transform hover:scale-[1.01] dark:bg-slate-800"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{isDE ? 'Prüfungssimulation' : 'Exam Simulation'}</p>
            <p className="text-xs text-slate-300">
              {isDE ? 'Teste dein Wissen unter Prüfungsbedingungen' : 'Test your knowledge under exam conditions'}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300" />
      </button>

      <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-blue-100">
              {isDE ? 'Willkommen zurück!' : 'Welcome back!'}
            </p>
            <h2 className="mt-1 text-xl font-bold">
              {isDE ? 'Dein Fortschritt' : 'Your Progress'}
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <Car className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span>{isDE ? 'Lektionen abgeschlossen' : 'Lessons completed'}</span>
            <span className="font-semibold">{completedLessons}/{totalLessons}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-center text-lg font-bold">{progressPercent}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => onOpenAuth?.()}
          className="w-full rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-sky-900/40 dark:from-sky-900/20 dark:to-blue-900/10 sm:col-span-2"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/40">
              {authStatus === 'signed_in' ? (
                <Cloud className="h-6 w-6 text-sky-700 dark:text-sky-300" />
              ) : (
                <LogIn className="h-6 w-6 text-sky-700 dark:text-sky-300" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-slate-900 dark:text-white sm:text-base">
                  {authStatus === 'signed_in'
                    ? isDE
                      ? 'Cloud-Synchronisierung aktiv'
                      : 'Cloud sync active'
                    : isDE
                      ? 'Gastmodus oder Konto'
                      : 'Guest mode or account'}
                </p>
                <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-sky-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-800 dark:bg-sky-800/60 dark:text-sky-100">
                  {authStatus === 'signed_in'
                    ? isDE
                      ? 'Verbunden'
                      : 'Connected'
                    : isDE
                      ? 'Optional'
                      : 'Optional'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {authStatus === 'signed_in'
                  ? authEmail || (isDE ? 'Dein Fortschritt kann künftig mit der Cloud synchronisiert werden.' : 'Your progress can now be synced with the cloud in the future.')
                  : isDE
                    ? 'Du kannst als Gast weiterlernen oder optional ein Konto erstellen, um Fortschritt später zu synchronisieren.'
                    : 'You can continue as a guest or optionally create an account to sync progress later.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-sky-500 dark:text-sky-300" />
          </div>
        </button>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDE ? 'Fahrstunden' : 'Driving Hours'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {totalHours}h {totalMinutes}m
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50">
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isDE ? 'Kapitel' : 'Chapters'}
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {visibleChapters.filter((ch) => ch.lessons.some((l) => userProgress.completedLessons.includes(l.id))).length}/{visibleChapters.length}
              </p>
            </div>
          </div>
        </div>
        
        {userProgress.currentStreak > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/50">
                <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isDE ? 'Aktuelle Serie' : 'Current Streak'}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {userProgress.currentStreak} {userProgress.currentStreak > 1 ? (isDE ? 'Tage' : 'days') : (isDE ? 'Tag' : 'day')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isUmschreibung && (
        <button
          onClick={() => onDirectLessonSelect('basics-0')}
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

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <button
          onClick={() => onNavigate('legal')}
          className="w-full rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-emerald-900/40 dark:from-emerald-900/20 dark:to-teal-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <Scale className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-slate-900 dark:text-white sm:text-base">
                  {isDE ? 'DSGVO, Datenschutz & Rechtliches' : 'GDPR, Privacy & Legal'}
                </p>
                <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-emerald-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-800 dark:bg-emerald-800/60 dark:text-emerald-100">
                  {isDE ? 'Pflicht' : 'Required'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isDE
                  ? 'Vor dem Launch wichtige Seiten prüfen: Datenschutz, AGB, DSGVO-Rechte, Impressum und Haftungsausschluss.'
                  : 'Review mandatory launch pages: privacy policy, terms, GDPR rights, imprint, and disclaimer.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-300" />
          </div>
        </button>

        <button
          onClick={() => onDirectLessonSelect('basics-1a')}
          className="w-full rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-amber-900/40 dark:from-amber-900/20 dark:to-orange-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
              <Target className="h-6 w-6 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-slate-900 dark:text-white sm:text-base">
                  {isDE ? 'Prüfungsrelevant: Fahrzeugcheck & Technikfragen' : 'Exam essential: Vehicle Check & Technical Questions'}
                </p>
                <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-amber-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800 dark:bg-amber-800/60 dark:text-amber-100">
                  {isDE ? 'Wichtig' : 'Must Know'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isDE
                  ? 'Ölstand, Reifenprofil, Warnleuchten, Beleuchtung, Warndreieck, Warnweste und typische Prüferfragen.'
                  : 'Oil level, tyre tread, warning lights, lighting, warning triangle, safety vest, and common examiner questions.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('review')}
          className="w-full rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-left shadow-sm transition-all hover:shadow-md dark:border-blue-900/40 dark:from-blue-900/20 dark:to-indigo-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40">
              <ClipboardCheck className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-slate-900 dark:text-white sm:text-base">
                  {isDE ? 'Fahrlehrer-Review-Paket' : 'Instructor Review Pack'}
                </p>
                <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-blue-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-800 dark:bg-blue-800/60 dark:text-blue-100">
                  {isDE ? 'Teilen' : 'Share'}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {isDE
                  ? 'Lehrplan, Beispiellektionen, Manöver, Bewertungsraster, Screen-Beschreibungen und Quizfragen als PDF vorbereiten.'
                  : 'Prepare curriculum, sample lessons, maneuvers, rubric, screen descriptions, and quiz questions as a PDF.'}
              </p>
            </div>
            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
          </div>
        </button>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {isUmschreibung
              ? isDE
                ? 'Praxis-Check für Umschreibung'
                : 'Conversion Practice Check'
              : isDE
                ? 'Sonderfahrten'
                : 'Special Drives'}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isUmschreibung
              ? isDE
                ? 'Keine gesetzlichen Pflichtstunden'
                : 'No legal mandatory hours'
              : isDE
                ? 'Pflichtfahrten'
                : 'Required drives'}
          </span>
        </div>

        {isUmschreibung ? (
          <div className="space-y-3">
            {[
              {
                icon: '👀',
                title: isDE ? 'Schulterblick' : 'Shoulder check',
                text: isDE ? 'Bei Spurwechsel, Anfahren und Abbiegen sichtbar ausführen.' : 'Clearly perform it during lane changes, moving off, and turning.',
              },
              {
                icon: '🚦',
                title: isDE ? 'Deutsche Vorfahrt' : 'German right-of-way',
                text: isDE ? 'Rechts-vor-links, Kreisverkehr und Fußgängerüberwege sicher beherrschen.' : 'Master right-before-left, roundabouts, and pedestrian crossings.',
              },
              {
                icon: '📝',
                title: isDE ? 'Prüfungsroutine' : 'Exam routine',
                text: isDE ? 'Blickführung, Spiegelkontrolle und ruhige Kommunikation trainieren.' : 'Practice visual scanning, mirror checks, and calm communication.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-purple-100 bg-purple-50 p-3 dark:border-purple-900/40 dark:bg-purple-900/10">
                <div className="flex items-start gap-3">
                  <div className="text-lg">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { key: 'ueberland', labelDe: 'Überland', labelEn: 'Country', required: '5×45', icon: '🛣️' },
              { key: 'autobahn', labelDe: 'Autobahn', labelEn: 'Highway', required: '4×45', icon: '🛤️' },
              { key: 'nacht', labelDe: 'Nacht', labelEn: 'Night', required: '3×45', icon: '🌙' },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {isDE ? item.labelDe : item.labelEn}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {Math.floor(userProgress.specialDrivingMinutes[item.key as keyof typeof userProgress.specialDrivingMinutes] / 45)}/{item.required.split('×')[0]} {isDE ? 'Std.' : 'hrs'}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      specialProgress[item.key as keyof typeof specialProgress] >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    )}
                    style={{ width: `${specialProgress[item.key as keyof typeof specialProgress]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {isDE ? 'Weiter lernen' : 'Continue Learning'}
          </h3>
          <button
            onClick={() => onNavigate('curriculum')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {isDE ? 'Alle anzeigen' : 'View all'}
          </button>
        </div>

        <div className="space-y-2">
          {visibleChapters.slice(0, 3).map((chapter) => {
            const chapterCompleted = chapter.lessons.filter((l) => userProgress.completedLessons.includes(l.id)).length;
            const chapterProgress = chapter.lessons.length > 0
              ? Math.round((chapterCompleted / chapter.lessons.length) * 100)
              : 0;

            return (
              <button
                key={chapter.id}
                onClick={() => onNavigate('curriculum')}
                className="flex w-full items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md dark:bg-slate-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl dark:bg-blue-900/50">
                  {chapter.id === 'chapter-1' && '🚗'}
                  {chapter.id === 'chapter-2' && '🅿️'}
                  {chapter.id === 'chapter-3' && '🏙️'}
                  {chapter.id === 'chapter-4' && '🛣️'}
                  {chapter.id === 'chapter-5' && '🏆'}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {isDE ? chapter.titleDe : chapter.titleEn}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${chapterProgress}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{chapterProgress}%</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
            <Target className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-200">
              {isDE ? 'Prüfungstipp' : 'Exam Tip'}
            </h4>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
              {isUmschreibung
                ? isDE
                  ? 'Bei der Umschreibung scheitern viele nicht am Fahren selbst, sondern an deutschen Prüfungsdetails wie Schulterblick, Spiegelroutine und klarer Vorfahrtsbeachtung.'
                  : 'In license conversion exams, many fail not because of driving itself, but because of German exam details like shoulder checks, mirror routine, and strict right-of-way handling.'
                : isDE
                  ? 'Schulterblick ist der häufigste Fehler bei der praktischen Prüfung! Üben Sie ihn bei jedem Fahrspurwechsel und Rückwärtsfahren.'
                  : 'Shoulder check is the most common mistake in the practical exam! Practice it with every lane change and reversing.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

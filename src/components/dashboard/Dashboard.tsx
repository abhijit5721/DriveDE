/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { Car, BookOpen, Clock, ChevronRight, Target, Cog, Zap, Crown, RefreshCcw, BadgeCheck, ClipboardCheck, LogIn, Flame, Mic, Cloud } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { chapters, getAllLessons } from '../../data/curriculum';
import { cn } from '../../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../../utils/license';
import { filterChaptersForSelection, filterLessonsForSelection } from '../../utils/contentFilter';
import type { TabType } from '../../types';
import { ExamReadinessGauge } from './ExamReadinessGauge';
import { TRANSLATIONS } from '../../data/translations';
import { DrivingInsights } from './DrivingInsights';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
  onChangePath: () => void;
  onOpenPaywall: () => void;
  onStartSimulation: () => void;
  onDirectLessonSelect: (lessonId: string) => void;
  onOpenAuth?: () => void;
}

export function Dashboard({ onNavigate, onChangePath, onOpenPaywall, onStartSimulation, onDirectLessonSelect, onOpenAuth }: DashboardProps) {
  const { language, userProgress, licenseType, isPremium, authStatus } = useAppStore();
  const t = TRANSLATIONS[language];
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

  const totalHours = Math.floor((Number(userProgress.totalDrivingMinutes) || 0) / 60);
  const totalMinutes = (Number(userProgress.totalDrivingMinutes) || 0) % 60;

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
        title: t.dashboard.conversionPath.title,
        subtitle: transmissionType === 'manual' 
          ? t.dashboard.conversionPath.subtitleManual 
          : t.dashboard.conversionPath.subtitleAuto,
        badgeClass: 'bg-purple-100 dark:bg-purple-900/30',
        iconClass: 'bg-purple-200 dark:bg-purple-800',
        textClass: 'text-purple-800 dark:text-purple-200',
        subtextClass: 'text-purple-600 dark:text-purple-400',
        icon: <BadgeCheck className="h-5 w-5 text-purple-700 dark:text-purple-300" />,
      }
    : transmissionType === 'manual'
      ? {
          title: t.dashboard.manualPath.title,
          subtitle: t.dashboard.manualPath.subtitle,
          badgeClass: 'bg-orange-100 dark:bg-orange-900/30',
          iconClass: 'bg-orange-200 dark:bg-orange-800',
          textClass: 'text-orange-800 dark:text-orange-200',
          subtextClass: 'text-orange-600 dark:text-orange-400',
          icon: <Cog className="h-5 w-5 text-orange-700 dark:text-orange-300" />,
        }
      : {
          title: t.dashboard.automaticPath.title,
          subtitle: t.dashboard.automaticPath.subtitle,
          badgeClass: 'bg-blue-100 dark:bg-blue-900/30',
          iconClass: 'bg-blue-200 dark:bg-blue-800',
          textClass: 'text-blue-800 dark:text-blue-200',
          subtextClass: 'text-blue-600 dark:text-blue-400',
          icon: <Zap className="h-5 w-5 text-blue-700 dark:text-blue-300" />,
        };

  return (
    <div className="space-y-8 pb-10 animate-scale-in">
      {/* Premium Hero Section: Exam Readiness & Path */}
      <div className="overflow-hidden rounded-3xl glass shadow-2xl shadow-blue-500/10 animate-fade-in-up">
        <div className="bg-premium-blue p-8 text-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col gap-1.5">
                <span className="inline-flex items-center rounded-lg bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] border border-white/10">
                  {pathConfig.title}
                </span>
                <p className="text-sm font-medium text-blue-100/90">
                  {t.dashboard.learningProgress}
                </p>
              </div>
              <button
                onClick={onChangePath}
                aria-label={t.dashboard.changePath}
                className="rounded-xl bg-white/10 p-2.5 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110 active:scale-95 border border-white/10"
              >
                <RefreshCcw className="h-5 w-5" />
              </button>
            </div>

            <ExamReadinessGauge 
              progress={progressPercent}
              label={t.dashboard.examChance}
              subLabel={t.dashboard.combinedScore}
              className="w-full"
            />
          </div>
        </div>
        
        {!isPremium && (
          <div className="border-t border-white/10 p-5 bg-white/5 dark:bg-slate-900/5">
            <button
              onClick={onOpenPaywall}
              aria-label={t.dashboard.unlockPro}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-5 text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-slow"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
                  <Crown className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-base font-black tracking-tight">DriveDE Pro</p>
                  <p className="text-xs font-medium text-orange-50">
                    {t.dashboard.unlockPro}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-white/70" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <button
          onClick={onStartSimulation}
          aria-label={t.dashboard.examSimulation}
          className="group flex w-full items-center justify-between rounded-2xl bg-premium-dark p-6 text-white shadow-2xl transition-all hover:translate-y-[-2px] hover:shadow-slate-900/30 active:scale-[0.99]"
        >
          <div className="flex items-center gap-5 text-left">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all duration-300">
              <Mic className="h-7 w-7 text-blue-400" />
              {!isPremium && (
                <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg border-2 border-slate-900">
                  <Crown className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">{t.dashboard.examSimulation}</p>
              <p className="text-sm text-slate-400 font-medium">
                {t.dashboard.simulationDesc}
              </p>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            <ChevronRight className="h-6 w-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      {/* Core Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {[
          { 
            icon: Clock, 
            label: t.dashboard.drivingHours, 
            value: `${totalHours}h ${totalMinutes}m`,
            color: 'emerald',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
            text: 'text-emerald-600 dark:text-emerald-400'
          },
          { 
            icon: BookOpen, 
            label: t.dashboard.chapters, 
            value: `${visibleChapters.filter((ch) => ch.lessons.some((l) => userProgress.completedLessons.includes(l.id))).length}/${visibleChapters.length}`,
            color: 'purple',
            bg: 'bg-purple-50 dark:bg-purple-950/40',
            text: 'text-purple-600 dark:text-purple-400'
          },
          { 
            icon: Flame, 
            label: t.dashboard.streak, 
            value: userProgress.currentStreak,
            color: 'orange',
            bg: 'bg-orange-50 dark:bg-orange-950/40',
            text: 'text-orange-600 dark:text-orange-400',
            disabled: userProgress.currentStreak === 0
          }
        ].map((stat, i) => (
          <div key={i} className={cn(
            'glass-card rounded-3xl p-5 shadow-sm transition-all hover:scale-[1.03]',
            stat.disabled ? 'opacity-50 grayscale' : ''
          )}>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm border border-black/5 dark:border-white/5', stat.bg, stat.text)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-1">
                  {stat.label}
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* AI Driving Insights & Weekly Stats */}
      <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <DrivingInsights onDirectLessonSelect={onDirectLessonSelect} />
      </div>

      {isUmschreibung && (
        <button
          onClick={() => onDirectLessonSelect('basics-0')}
          aria-label={t.dashboard.conversionQuickstart}
          className="w-full rounded-3xl glass border-purple-500/20 p-6 text-left shadow-xl transition-all hover:translate-y-[-2px] hover:shadow-purple-500/10 group animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/40 group-hover:scale-110 transition-transform">
              <BadgeCheck className="h-8 w-8 text-purple-700 dark:text-purple-300" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  {t.dashboard.conversionQuickstart}
                </h3>
                <div className="flex items-center gap-2">
                  {!isPremium && (
                    <span className="inline-flex rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-amber-500/30">
                      Pro
                    </span>
                  )}
                  <span className="inline-flex rounded-lg bg-purple-100 dark:bg-purple-900/50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {t.dashboard.germanyFocus}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                {t.dashboard.jumpToTraps}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  t.dashboard.pills.greenArrow,
                  t.dashboard.pills.shoulderCheck,
                  t.dashboard.pills.priority,
                  t.dashboard.pills.instantFail,
                ].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-lg bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-500/10 shadow-sm"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        {[
          {
            id: 'maneuvers',
            title: t.dashboard.maneuvers,
            desc: t.dashboard.maneuversDesc,
            icon: Zap,
            badge: t.dashboard.animations,
            color: 'blue',
            onClick: () => onNavigate('maneuvers')
          },
          {
            id: 'tech',
            title: t.dashboard.tech,
            desc: t.dashboard.techDesc,
            icon: Target,
            badge: t.dashboard.exam,
            color: 'amber',
            onClick: () => onDirectLessonSelect('basics-1a')
          },
          {
            id: 'review',
            title: t.dashboard.reviewPack,
            desc: t.dashboard.reviewDesc,
            icon: ClipboardCheck,
            badge: t.dashboard.pdfExport,
            color: 'indigo',
            fullWidth: true,
            onClick: () => onNavigate('review')
          }
        ].map((card) => (
          <button
            key={card.id}
            onClick={card.onClick}
            className={cn(
              'group relative overflow-hidden rounded-3xl glass p-6 text-left transition-all hover:translate-y-[-2px] hover:shadow-xl active:scale-[0.99]',
              card.fullWidth && 'lg:col-span-2'
            )}
          >
            <div className="flex items-start gap-5">
              <div className={cn(
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110',
                card.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                card.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
              )}>
                <card.icon className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {card.title}
                  </p>
                  <span className={cn(
                    'rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border',
                    card.color === 'blue' ? 'bg-blue-50/50 text-blue-600 border-blue-500/20' :
                    card.color === 'amber' ? 'bg-amber-50/50 text-amber-600 border-amber-500/20' :
                    'bg-indigo-50/50 text-indigo-600 border-indigo-500/20'
                  )}>
                    {card.badge}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {card.desc}
                </p>
              </div>
              <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-3xl glass p-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <div className="mb-6">
          <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {isUmschreibung ? t.dashboard.practiceCheck : t.dashboard.specialDrives}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mt-1">
            {isUmschreibung ? t.dashboard.focusThemes : t.dashboard.mandatoryHours}
          </p>
        </div>

        {isUmschreibung ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: '👀', ...t.dashboard.conversionChecks[0] },
              { icon: '🚦', ...t.dashboard.conversionChecks[1] },
              { icon: '📝', ...t.dashboard.conversionChecks[2] },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl glass-card p-5 transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 dark:bg-slate-800/50 text-xl shadow-sm">
                    {item.icon}
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">{item.title}</p>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {[
              { key: 'ueberland', label: t.dashboard.specialDriveTypes.ueberland, required: '5×45', icon: Target },
              { key: 'autobahn', label: t.dashboard.specialDriveTypes.autobahn, required: '4×45', icon: Zap },
              { key: 'nacht', label: t.dashboard.specialDriveTypes.nacht, required: '3×45', icon: Clock },
            ].map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">{item.label}</span>
                  </div>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    {Math.floor(userProgress.specialDrivingMinutes[item.key as keyof typeof userProgress.specialDrivingMinutes] / 45)}/{item.required.split('×')[0]} {t.dashboard.hoursSuffix}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900/50 p-0.5 border border-black/5 dark:border-white/5">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)',
                      specialProgress[item.key as keyof typeof specialProgress] >= 100 
                        ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' 
                        : 'bg-premium-blue'
                    )}
                    style={{ width: `${specialProgress[item.key as keyof typeof specialProgress]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            {t.dashboard.continueLearning}
          </h3>
          <button
            onClick={() => onNavigate('curriculum')}
            className="group flex items-center gap-1.5 text-xs font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
          >
            {t.dashboard.viewAll}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {visibleChapters.slice(0, 3).map((chapter) => {
            const chapterCompleted = chapter.lessons.filter((l) => userProgress.completedLessons.includes(l.id)).length;
            const chapterProgress = chapter.lessons.length > 0
              ? Math.round((chapterCompleted / chapter.lessons.length) * 100)
              : 0;

            const Icon = chapter.id === 'chapter-1' ? Car :
                         chapter.id === 'chapter-2' ? Target :
                         chapter.id === 'chapter-3' ? Zap :
                         chapter.id === 'chapter-4' ? BookOpen : Flame;

            const chapterTitle = language === 'de' ? chapter.titleDe : chapter.titleEn;

            return (
              <button
                key={chapter.id}
                onClick={() => onNavigate('curriculum')}
                aria-label={`${chapterTitle}: Fortschritt ${chapterProgress}%`}
                className="group flex w-full items-center gap-5 rounded-3xl glass p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.99] hover:shadow-xl"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:bg-premium-blue group-hover:text-white transition-all duration-300 shadow-inner">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black tracking-tight text-slate-900 dark:text-white truncate mb-2">
                    {chapterTitle}
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900 shadow-inner">
                      <div className="h-full rounded-full bg-premium-blue transition-all duration-1000" style={{ width: `${chapterProgress}%` }} />
                    </div>
                    <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400 min-w-[3ch]">{chapterProgress}%</span>
                  </div>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 group-hover:bg-blue-500/10 transition-colors">
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-premium-indigo p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex items-start gap-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              {t.dashboard.proTip}
            </h4>
            <p className="text-sm font-medium leading-relaxed text-indigo-100/90">
              {isUmschreibung ? t.dashboard.tips.conversion : t.dashboard.tips.regular}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Status: Cloud Sync */}
      <div className="mt-16 flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: '900ms' }}>
        <button
          onClick={() => onOpenAuth?.()}
          aria-label={t.dashboard.accountSettings}
          className={cn(
            'flex items-center gap-3 rounded-full px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm hover:scale-105 active:scale-95',
            authStatus === 'signed_in' 
              ? 'bg-emerald-50/50 text-emerald-700 border-emerald-500/20 dark:bg-emerald-900/10 dark:text-emerald-400' 
              : 'bg-white/50 text-slate-500 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'
          )}
        >
          {authStatus === 'signed_in' ? (
            <>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="h-4 w-4" />
              {t.dashboard.cloudSyncActive}
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              {t.dashboard.signInForSync}
            </>
          )}
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-[0.3em] text-slate-300 dark:text-slate-600 uppercase">
            DriveDE v1.2.0 • {t.dashboard.precisionPrep}
          </p>
        </div>
      </div>
    </div>
  );
}

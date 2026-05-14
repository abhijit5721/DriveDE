/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { X, TrendingUp, TrendingDown, Minus, BookOpen, Car, Target, Info } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../utils/cn';
import type { ReadinessBreakdown } from '../../utils/readiness';

interface ReadinessBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  readinessData: ReadinessBreakdown;
  language: 'de' | 'en';
}

export function ReadinessBreakdownModal({ isOpen, onClose, readinessData, language }: ReadinessBreakdownModalProps) {
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const components = [
    { label: language === 'de' ? 'Theorie' : 'Theory', value: readinessData.theory, color: 'bg-blue-500', icon: BookOpen },
    { label: language === 'de' ? 'Fahrstunden' : 'Driving Hours', value: readinessData.legal, color: 'bg-emerald-500', icon: Car },
    { label: language === 'de' ? 'Fahrleistung' : 'Performance', value: readinessData.performance, color: 'bg-amber-500', icon: Target },
  ];

  const getTrendIcon = () => {
    switch (readinessData.trendDirection) {
      case 'improving': return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'regressing': return <TrendingDown className="h-5 w-5 text-rose-500" />;
      default: return <Minus className="h-5 w-5 text-slate-400" />;
    }
  };

  const getAdvice = () => {
    const advices: string[] = [];

    if (readinessData.theory < 80) {
      advices.push(language === 'de'
        ? 'Theorie-Lektionen abschließen'
        : 'Complete theory lessons');
    }
    if (readinessData.legal < 80) {
      advices.push(language === 'de'
        ? 'Mehr Fahrstunden absolvieren'
        : 'Complete more driving hours');
    }
    if (readinessData.performance < 70) {
      advices.push(language === 'de'
        ? 'Fehler in letzter Zeit reduzieren'
        : 'Reduce recent mistakes');
    }
    if (readinessData.trendDirection === 'regressing') {
      advices.push(language === 'de'
        ? 'Konzentration verbessern'
        : 'Improve focus while driving');
    }

    if (advices.length === 0) {
      advices.push(language === 'de'
        ? 'Weiter so! Du bist auf dem richtigen Weg.'
        : 'Keep going! You\'re on the right track.');
    }

    return advices;
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-md">
        <div className="relative w-full rounded-3xl bg-slate-900 border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />
            {language === 'de' ? 'Readiness-Analyse' : 'Readiness Analysis'}
          </h3>

          <div className="space-y-4 mb-6">
            {components.map((comp) => (
              <div key={comp.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <comp.icon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300">{comp.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{comp.value}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', comp.color)}
                    style={{ width: `${comp.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-white/5 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              {getTrendIcon()}
              <span className="text-sm font-medium text-slate-300">
                {language === 'de' ? 'Trend' : 'Trend'}
              </span>
              <span className={cn(
                'ml-auto text-sm font-bold',
                readinessData.trendDirection === 'improving' ? 'text-emerald-500' :
                readinessData.trendDirection === 'regressing' ? 'text-rose-500' : 'text-slate-400'
              )}>
                {readinessData.trendDirection === 'stable' ? (
                  language === 'de' ? 'Stabil' : 'Stable'
                ) : (
                  `${readinessData.trend >= 0 ? '+' : ''}${readinessData.trend}%`
                )}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {readinessData.trendDirection === 'improving'
                ? (language === 'de' ? 'Fehlerquote sinkt!' : 'Fault frequency decreasing!')
                : readinessData.trendDirection === 'regressing'
                ? (language === 'de' ? 'Mehr Fokus benötigt' : 'More focus needed')
                : (language === 'de' ? 'Konsistente Leistung' : 'Consistent performance')}
            </p>
          </div>

          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
              {language === 'de' ? 'Empfehlungen' : 'Recommendations'}
            </p>
            <ul className="space-y-1.5">
              {getAdvice().map((advice, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  {advice}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition border border-white/5"
          >
            {language === 'de' ? 'Schließen' : 'Close'}
          </button>
        </div>
      </div>
    </>
  );
}
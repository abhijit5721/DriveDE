/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { X, Car, BadgeCheck, Cog, Zap, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { TRANSLATIONS } from '../../data/translations';
import { cn } from '../../utils/cn';

interface PathSelectorModalProps {
  onClose: () => void;
}

export function PathSelectorModal({ onClose }: PathSelectorModalProps) {
  const { language, learningPath, transmissionType } = useAppStore();
  const t = TRANSLATIONS[language];

  const handleSelect = (path: 'standard' | 'umschreibung', transmission: 'manual' | 'automatic') => {
    const license = path === 'umschreibung' 
      ? (transmission === 'manual' ? 'umschreibung-manual' : 'umschreibung-automatic')
      : transmission;
    
    useAppStore.setState({
      learningPath: path,
      transmissionType: transmission,
      licenseType: license as any,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />

        <div className="relative z-10 flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.common.selectGoal}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.common.startPersonalized}</p>
          </div>
          <button 
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 relative z-10">
          {/* Standard Path */}
          <div className={cn(
            'group flex flex-col rounded-3xl border-2 p-6 transition-all duration-300',
            learningPath === 'standard' 
              ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10' 
              : 'border-slate-100 bg-slate-50/50 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900/50'
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{t.licenseSelector.standard.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-auto">
              <button
                onClick={() => handleSelect('standard', 'manual')}
                className={cn(
                  'flex items-center justify-between rounded-xl p-4 transition-all active:scale-95 border',
                  learningPath === 'standard' && transmissionType === 'manual'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Cog className="h-4 w-4" />
                  <span className="text-sm font-bold">{t.common.transmissions.manual}</span>
                </div>
                {learningPath === 'standard' && transmissionType === 'manual' && <CheckCircle2 className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => handleSelect('standard', 'automatic')}
                className={cn(
                  'flex items-center justify-between rounded-xl p-4 transition-all active:scale-95 border',
                  learningPath === 'standard' && transmissionType === 'automatic'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-bold">{t.common.transmissions.automatic}</span>
                </div>
                {learningPath === 'standard' && transmissionType === 'automatic' && <CheckCircle2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Umschreibung Path */}
          <div className={cn(
            'group flex flex-col rounded-3xl border-2 p-6 transition-all duration-300',
            learningPath === 'umschreibung' 
              ? 'border-purple-600 bg-purple-50/30 dark:bg-purple-900/10' 
              : 'border-slate-100 bg-slate-50/50 hover:border-purple-200 dark:border-slate-800 dark:bg-slate-900/50'
          )}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/20">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">{t.licenseSelector.conversion.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-auto">
              <button
                onClick={() => handleSelect('umschreibung', 'manual')}
                className={cn(
                  'flex items-center justify-between rounded-xl p-4 transition-all active:scale-95 border',
                  learningPath === 'umschreibung' && transmissionType === 'manual'
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Cog className="h-4 w-4" />
                  <span className="text-sm font-bold">{t.common.transmissions.manual}</span>
                </div>
                {learningPath === 'umschreibung' && transmissionType === 'manual' && <CheckCircle2 className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => handleSelect('umschreibung', 'automatic')}
                className={cn(
                  'flex items-center justify-between rounded-xl p-4 transition-all active:scale-95 border',
                  learningPath === 'umschreibung' && transmissionType === 'automatic'
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-bold">{t.common.transmissions.automatic}</span>
                </div>
                {learningPath === 'umschreibung' && transmissionType === 'automatic' && <CheckCircle2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center relative z-10">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-4">
            {t.welcome.hero.badge}
          </p>
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            {t.common.saveChanges}
          </button>
        </div>
      </div>
    </div>
  );
}

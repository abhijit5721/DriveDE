import { Moon, Sun, Globe, Crown, Cog, Zap, BadgeCheck, Cloud, LogIn, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from '../utils/license';

interface HeaderProps {
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export function Header({ onOpenAuth, onSignOut }: HeaderProps) {
  const { language, darkMode, setLanguage, toggleDarkMode, licenseType, isPremium, authEmail, authStatus } = useAppStore();

  const learningPath = getLearningPathFromLicenseType(licenseType);
  const transmissionType = getTransmissionFromLicenseType(licenseType);

  const pathLabel =
    learningPath === 'umschreibung'
      ? language === 'de'
        ? 'Umschreibung'
        : 'Conversion'
      : language === 'de'
        ? 'Fahrschule'
        : 'Training';

  const transmissionLabel =
    transmissionType === 'manual'
      ? language === 'de'
        ? 'Manuell'
        : 'Manual'
      : transmissionType === 'automatic'
        ? language === 'de'
          ? 'Automatik'
          : 'Auto'
        : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/95 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
            <span className="text-lg font-bold text-white">🚗</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">DriveDE</h1>
              {pathLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {learningPath === 'umschreibung' ? <BadgeCheck className="h-3 w-3" /> : <Cog className="h-3 w-3" />}
                  {pathLabel}
                </span>
              )}
              {transmissionLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {transmissionType === 'manual' && <Cog className="h-3 w-3" />}
                  {transmissionType === 'automatic' && <Zap className="h-3 w-3" />}
                  {transmissionLabel}
                </span>
              )}
              {isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <Crown className="h-3 w-3" />
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'de' ? 'Fahrschule App' : 'Driving School App'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:flex">
            <Cloud className="h-3.5 w-3.5" />
            {authStatus === 'signed_in'
              ? authEmail || (language === 'de' ? 'Cloud aktiv' : 'Cloud active')
              : language === 'de'
                ? 'Gastmodus'
                : 'Guest mode'}
          </div>

          <button
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              'bg-slate-100 text-slate-700 hover:bg-slate-200',
              'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            {language.toUpperCase()}
          </button>

          <button
            onClick={authStatus === 'signed_in' ? onSignOut : onOpenAuth}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
              authStatus === 'signed_in'
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {authStatus === 'signed_in' ? <LogOut className="h-3.5 w-3.5" /> : <LogIn className="h-3.5 w-3.5" />}
              {authStatus === 'signed_in'
                ? language === 'de'
                  ? 'Abmelden'
                  : 'Sign out'
                : language === 'de'
                  ? 'Anmelden'
                  : 'Sign in'}
          </button>

          <button
            onClick={toggleDarkMode}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-all',
              'bg-slate-100 text-slate-700 hover:bg-slate-200',
              'dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

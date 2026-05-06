/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import { useState } from 'react';
import { User, LogIn, LogOut, Cloud, ShieldCheck, Globe, Moon, Sun, RefreshCcw, FileText, RotateCcw, AlertCircle, CheckCircle2, Crown, ChevronRight, Zap, Share2, X, Shield, Download } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/cn';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signInWithProvider } from '../../services/auth';
import GoogleLogo from '../../assets/google-logo.svg';
import { syncAllData } from '../../services/supabaseSync';
import { QRCodeCanvas } from 'qrcode.react';
import { AnimatePresence, motion } from 'framer-motion';
import { TRANSLATIONS } from '../../data/translations';

interface AccountProps {
  onOpenAuth: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<boolean>;
  onChangePath: () => void;
  onOpenLegal: () => void;
}

export function Account({ onOpenAuth, onSignOut, onDeleteAccount, onChangePath, onOpenLegal }: AccountProps) {
  const {
    language,
    darkMode,
    toggleDarkMode,
    setLanguage,
    authStatus,
    authEmail,
    authDisplayName,
    authUserId,
    userProgress,
    learningPath,
    transmissionType,
    resetProgress,
    enableDemoMode,
    isPremium,
    setHasVisited,
    licenseType,
    isPublicReportEnabled,
    setPublicReportEnabled,
  } = useAppStore();
  
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const t = TRANSLATIONS[language].account;
  const lt = TRANSLATIONS[language].licenseSelector;
  
  const completedLessons = userProgress.completedLessons.length;
  const drivingHours = Math.floor(userProgress.totalDrivingMinutes / 60);
  const drivingMinutes = userProgress.totalDrivingMinutes % 60;

  const handleGoogleSignIn = async () => {
    setAuthMessage(null);
    setAuthError(null);

    if (!isSupabaseConfigured) {
      setAuthError(t.errors.googleNotConfigured);
      return;
    }

    setAuthLoading(true);

    try {
      await signInWithProvider('google');
      setAuthMessage(t.openingGoogle);
    } catch (error) {
      setAuthError(
        error instanceof Error && error.message
          ? error.message
          : t.errors.googleFail
      );
      setAuthLoading(false);
      return;
    }

    setAuthLoading(false);
  };

  const handleOpenShare = async () => {
    if (authStatus !== 'signed_in') {
      setAuthError(t.errors.shareSignIn);
      return;
    }
    
    setAuthLoading(true);
    await syncAllData(useAppStore.getState());
    setAuthLoading(false);

    const baseUrl = window.location.origin + window.location.pathname;
    
    if (authUserId) {
      setShareUrl(`${baseUrl}?report=${authUserId}`);
      setShowShareModal(true);
    } else {
      setAuthError(t.errors.userNotFound);
    }
  };

  const handleFullErasure = async () => {
    setDeleteLoading(true);
    try {
      const success = await onDeleteAccount();
      if (success) {
        setShowDeleteModal(false);
      } else {
        setAuthError(language === 'de' ? 'Löschen fehlgeschlagen.' : 'Deletion failed.');
      }
    } catch (error) {
      setAuthError(language === 'de' ? 'Ein Fehler ist aufgetreten.' : 'An error occurred.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: {
        email: authEmail,
        displayName: authDisplayName,
        userId: authUserId,
        licenseType,
        learningPath,
        transmissionType,
        isPremium
      },
      progress: userProgress,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drivede-data-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const pathLabel =
    learningPath === 'umschreibung'
      ? lt.conversion.title
      : lt.standard.title;

  const transmissionLabel =
    transmissionType === 'manual'
      ? lt.manual.title
      : transmissionType === 'automatic'
        ? lt.automatic.title
        : t.notSelectedYet;

  return (
    <div className="space-y-6 pb-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-xl dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            {authStatus === 'signed_in' ? <Cloud className="h-7 w-7" /> : <User className="h-7 w-7" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
              {t.title}
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold leading-tight truncate">
              {authStatus === 'signed_in'
                 ? authDisplayName
                : t.guestMode}
              {isPremium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  <Crown className="h-3 w-3" />
                  PRO
                </span>
              )}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300 truncate">
              {authStatus === 'signed_in'
                ? authEmail
                : t.guestDesc}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {authStatus === 'signed_in' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={onSignOut}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                <LogOut className="h-4 w-4" />
                {t.signOut}
              </button>

              <button
                onClick={async () => {
                  setAuthLoading(true);
                  try {
                    await syncAllData(useAppStore.getState());
                    setAuthMessage(t.syncSuccess);
                    setTimeout(() => setAuthMessage(null), 3000);
                  } catch (e) {
                    setAuthError('Sync failed. Please try again.');
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                disabled={authLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCcw className={cn('h-4 w-4', authLoading && 'animate-spin')} />
                {authLoading ? '...' : t.syncNow}
              </button>

              <button
                onClick={handleOpenShare}
                className="col-span-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Share2 className="h-4 w-4" />
                {t.shareWithInstructor}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <img src={GoogleLogo} alt="Google" className="h-5 w-5" />
                  {authLoading
                    ? t.openingGoogle
                    : t.continueWithGoogle}
                </button>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={onOpenAuth}
                    data-testid="account-signin-email"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    <LogIn className="h-4 w-4" />
                    {t.signInEmail}
                  </button>

                  <button
                    onClick={onOpenAuth}
                    data-testid="account-signup-btn"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {t.continueGuest}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                {t.guestNote}
              </p>
            </>
          )}

          {authError && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          {authMessage && (
            <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{authMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.learningPath}</p>
          <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{pathLabel}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{transmissionLabel}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.progress}</p>
          <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{completedLessons} {t.lessons}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{drivingHours}h {drivingMinutes}m {t.drivingTime}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {t.profileSettings}
        </h3>
        <div className="mt-4 space-y-3">
          <button
            onClick={toggleDarkMode}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                {darkMode ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.darkMode}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {darkMode ? t.active : t.disabled}
                </p>
              </div>
            </div>
            <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', darkMode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200')}>
              {darkMode ? t.on : t.off}
            </span>
          </button>

          <button
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                <Globe className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{TRANSLATIONS[language].common.language}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.languageActive}</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {language.toUpperCase()}
            </span>
          </button>
          
          {authStatus === 'signed_in' && (
            <button
              onClick={async () => {
                const newValue = !isPublicReportEnabled;
                setPublicReportEnabled(newValue);
                // Force sync to update RLS via profile
                setAuthLoading(true);
                try {
                  await syncAllData(useAppStore.getState());
                } catch (e) {
                  console.error('Failed to sync visibility update', e);
                } finally {
                  setAuthLoading(false);
                }
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                  <Shield className={cn('h-5 w-5', isPublicReportEnabled ? 'text-blue-500' : 'text-slate-400')} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.publicReportToggle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t.publicReportToggleDesc}
                  </p>
                </div>
              </div>
              <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', isPublicReportEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200')}>
                {isPublicReportEnabled ? t.on : t.off}
              </span>
            </button>
          )}

          <button
            onClick={onChangePath}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                <RefreshCcw className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.changePath}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.changePathDesc}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              console.log('[Account] Navigating to Landing Page...');
              setHasVisited(false);
            }}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.viewLanding}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.viewLandingDesc}</p>
              </div>
            </div>
          </button>

          <button
            onClick={handleExportData}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                <Download className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {language === 'de' ? 'Meine Daten exportieren' : 'Export My Data'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'de' ? 'Laden Sie eine Kopie Ihrer Daten herunter (JSON)' : 'Download a copy of your data (JSON)'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={resetProgress}
            className="flex w-full items-center justify-between rounded-xl border border-rose-200 px-4 py-3 text-left transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                <RotateCcw className="h-5 w-5 text-rose-600 dark:text-rose-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.resetProgress}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.resetProgressDesc}</p>
              </div>
            </div>
          </button>
          
          {authStatus === 'signed_in' && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex w-full items-center justify-between rounded-xl border border-rose-200 px-4 py-3 text-left transition hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                  <Shield className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {language === 'de' ? 'Account & Daten löschen' : 'Delete Account & Data'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'de' ? 'Unwiderrufliche Löschung gemäß DSGVO Art. 17' : 'Irrevocable erasure as per GDPR Art. 17'}
                  </p>
                </div>
              </div>
            </button>
          )}

          <div className="pt-2">
            <div className="mb-2 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.developerTools}</p>
            </div>
            <button
              onClick={enableDemoMode}
              className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3 text-left transition hover:bg-blue-50 dark:border-blue-900/40 dark:hover:bg-blue-900/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.enableDemo}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.enableDemoDesc}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={onOpenLegal}
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm transition hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-900/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
              <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{t.privacyLegal}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">{t.privacyLegalDesc}</p>
            </div>
          </div>
        </button>

      </div>

      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-white/10 p-8 text-center shadow-2xl"
            >
              <button 
                onClick={() => setShowShareModal(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400">
                <Share2 className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {t.shareModal.title}
              </h3>
              <p className="text-sm text-slate-400 mb-8">
                {t.shareModal.desc}
              </p>

              <div className="mx-auto mb-8 flex items-center justify-center rounded-3xl bg-white p-6 shadow-inner">
                <QRCodeCanvas 
                  value={shareUrl} 
                  size={200}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: '/favicon.ico',
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    {t.shareModal.directLink}
                  </p>
                  <p className="text-xs text-blue-400 truncate font-mono">
                    {shareUrl}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert(t.shareModal.linkCopied);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition"
                >
                  {t.shareModal.copyLink}
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 mx-auto mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-center text-xl font-bold text-slate-900 dark:text-white mb-2">
                {language === 'de' ? 'Daten unwiderruflich löschen?' : 'Delete data permanently?'}
              </h3>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">
                {language === 'de' 
                  ? 'Alle Ihre Fahrstunden, Statistiken und Profileinstellungen werden sofort und dauerhaft von unseren Servern gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.' 
                  : 'All your driving sessions, statistics, and profile settings will be immediately and permanently deleted from our servers. This action cannot be undone.'}
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFullErasure}
                  disabled={deleteLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-bold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <RefreshCcw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="h-5 w-5" />
                      {language === 'de' ? 'Jetzt alles löschen' : 'Delete everything now'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="w-full py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  {language === 'de' ? 'Abbrechen' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

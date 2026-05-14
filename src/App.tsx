/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * App.tsx
 * 
 * Root component of the DriveDE application.
 * Manages:
 * 1. App-level layout (Tabs, Headers, Navigation).
 * 2. Authentication state & Supabase data synchronization.
 * 3. Conditional rendering based on license selection (Welcome/LicenseSelector vs Dashboard).
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { useAppStore } from './store/useAppStore';
import { supabase } from './lib/supabase';
import { hydrateFromSupabase, syncDrivingSession, syncCompletedLesson, ensureProfileFromState } from './services/supabaseSync';
import { checkAndUnlockAchievements } from './utils/achievements';
import { signOut, subscribeToAuthChanges } from './services/auth';
import { chapters } from './data/curriculum';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopNav } from './components/layout/DesktopNav';
import { Dashboard } from './components/dashboard/Dashboard';
const Welcome = lazy(() => import('./components/auth/Welcome').then(m => ({ default: m.Welcome })));
const LicenseSelector = lazy(() => import('./components/auth/LicenseSelector').then(m => ({ default: m.LicenseSelector })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));
import { MobileSplash } from './components/common/MobileSplash';
import { ReadinessBreakdownModal } from './components/dashboard/ReadinessBreakdownModal';
import { calculateTotalReadiness } from './utils/readiness';
import { getAllLessons } from './data/curriculum';
import { filterLessonsForSelection } from './utils/contentFilter';
import { getLearningPathFromLicenseType, getTransmissionFromLicenseType } from './utils/license';


// Lazy loaded routes
const Curriculum = lazy(() => import('./components/curriculum/Curriculum').then(m => ({ default: m.Curriculum })));
const Maneuvers = lazy(() => import('./components/maneuvers/Maneuvers').then(m => ({ default: m.Maneuvers })));
const Tracker = lazy(() => import('./components/tracker/Tracker').then(m => ({ default: m.Tracker })));
const Achievements = lazy(() => import('./components/curriculum/Achievements').then(m => ({ default: m.Achievements })));
const ExamSimulation = lazy(() => import('./components/maneuvers/ExamSimulation'));
const LessonDetail = lazy(() => import('./components/curriculum/LessonDetail').then(m => ({ default: m.LessonDetail })));
const InstructorReview = lazy(() => import('./components/maneuvers/InstructorReview').then(m => ({ default: m.InstructorReview })));
const LegalHub = lazy(() => import('./components/legal/LegalHub').then(m => ({ default: m.LegalHub })));
const LegalPage = lazy(() => import('./components/legal/LegalPage').then(m => ({ default: m.LegalPage })));
const Account = lazy(() => import('./components/auth/Account').then(m => ({ default: m.Account })));
const BudgetEstimator = lazy(() => import('./components/finance/BudgetEstimator').then(m => ({ default: m.BudgetEstimator })));
const Paywall = lazy(() => import('./components/finance/Paywall').then(m => ({ default: m.Paywall })));
import { Skeleton } from './components/common/Skeleton';
import { AchievementOverlay } from './components/common/AchievementOverlay';
import type { TabType, Lesson, LegalPageType } from './types';
import { PublicReport } from './components/maneuvers/PublicReport';
import { PathSelectorModal } from './components/auth/PathSelectorModal';
import { CookieConsent } from './components/legal/CookieConsent';
import { PrivacyConsentModal } from './components/legal/PrivacyConsentModal';
import { TRANSLATIONS } from './data/translations';
import { HotspotMap } from './components/dashboard/HotspotMap';


export default function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExamSimulation, setShowExamSimulation] = useState(false);
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [showHotspotMap, setShowHotspotMap] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const {
    darkMode,
    userProgress,
    hasVisited,
    licenseType,
    learningPath,
    transmissionType,
    setAcceptedPrivacy,
    isPremium,
    authStatus,
    setAuthState,
    setHasVisited,
    logoutCleanup,
    activeTab,
    setActiveTab,
    language,
  } = useAppStore();

  const learningPathVal = getLearningPathFromLicenseType(licenseType);
  const transmissionTypeVal = getTransmissionFromLicenseType(licenseType);
  const visibleLessons = filterLessonsForSelection(getAllLessons(), transmissionTypeVal, learningPathVal);
  const totalLessons = visibleLessons.length;
  const completedLessons = userProgress.completedLessons.length;

  const readinessData = calculateTotalReadiness(
    userProgress.drivingSessions,
    completedLessons,
    totalLessons
  );
  
  const [reportUserId, setReportUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reportId = params.get('report');
      if (reportId) {
        console.log(`[App] Public report view detected for ID: ${reportId}`);
        return reportId;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] App is back online, processing sync queue...');
      import('./services/supabaseSync').then(m => m.processSyncQueue());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Visibility] App became visible, processing sync...');
        import('./services/supabaseSync').then(m => m.processSyncQueue());
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // dedicated OTA update check
    if (Capacitor.isNativePlatform()) {
      const runUpdateCheck = async () => {
        try {
          const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
          
          // Silent background sync for production
          await (CapacitorUpdater as any).sync();
        } catch (e) {
          // Silent fail in production
        }
      };
      
      // Delay to ensure UI and storage are ready
      setTimeout(runUpdateCheck, 5000);
    }

    // Deep Link Listener for Native Platforms (OAuth redirects)
    let urlListener: any;
    console.log('[App] Setting up DeepLink listener. Native:', Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      // Handle app already open
      urlListener = CapacitorApp.addListener('appUrlOpen', async (data) => {
        handleDeepLink(data.url);
      });

      // Handle app being launched from scratch via URL
      CapacitorApp.getLaunchUrl().then((launchUrl) => {
        if (launchUrl?.url) {
          console.log('[DeepLink] Initial launch URL detected:', launchUrl.url);
          handleDeepLink(launchUrl.url);
        }
      });
    }

    async function handleDeepLink(urlStr: string) {
      console.log('[DeepLink] Received URL:', urlStr);
      
      if (urlStr.includes('access_token=') || urlStr.includes('error=')) {
        console.log('[DeepLink] OAuth relevant URL detected. Starting session recovery...');
        setIsAuthLoading(true);
        
        try {
          // Normalize the URL for parsing (replace fragment with query if needed)
          const normalizedUrlStr = urlStr.includes('#') ? urlStr.replace('#', '?') : urlStr;
          const url = new URL(normalizedUrlStr);
          
          // Try to extract from both search params and manually from hash fragment
          const hashPart = urlStr.split('#')[1] || '';
          const hashParams = new URLSearchParams(hashPart);
          
          const accessToken = hashParams.get('access_token') || url.searchParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || url.searchParams.get('refresh_token');
          const error = hashParams.get('error') || url.searchParams.get('error');
          const errorDescription = hashParams.get('error_description') || url.searchParams.get('error_description');

          console.log('[DeepLink] Extracted params:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            error: error || 'none' 
          });

          if (error) {
            console.error('[DeepLink] OAuth error from provider:', error, errorDescription);
            toast.error(`Login error: ${errorDescription || error}`);
          } else if (accessToken && refreshToken && supabase) {
            console.log('[DeepLink] Tokens found. Setting Supabase session...');
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('[DeepLink] Supabase setSession failed:', sessionError.message);
              toast.error('Failed to restore session');
            } else {
              console.log('[DeepLink] Session restored successfully for user:', data.user?.email);
              toast.success('Successfully logged in!');
              setShowAuthModal(false);
            }
          } else {
            console.warn('[DeepLink] No usable tokens found in URL fragment or query');
          }
        } catch (err) {
          console.error('[DeepLink] URL processing failed unexpectedly:', err);
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        console.log('[DeepLink] Non-auth URL ignored.');
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (urlListener) urlListener.remove();
    };
  }, []);


  // --- AUTH & DATA SYNC LOGIC ---
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (session) => {
      try {
        const isNewUser = !useAppStore.getState().authEmail && !!session?.user;
        
        if (session?.user) {
          const { user } = session;
          const displayName = user.user_metadata?.full_name || user.email || null;
          console.log(`[App] Auth state changed: ${user.email} (ID: ${user.id})`);
          setAuthState(user.email || null, 'signed_in', displayName, user.id);
          setShowAuthModal(false); // Close modal on success
          
          // Fetch remote data to hydrate the UI quickly
          const remoteData = await hydrateFromSupabase().catch(err => {
            console.error('[App] Hydration failed:', err);
            return null;
          });

          if (remoteData) {
            console.log('[App] State hydrated from Supabase. isPremium:', remoteData.profile?.is_premium);
            useAppStore.setState((state) => {
                const combinedCompletedLessons = Array.from(new Set([
                    ...state.userProgress.completedLessons,
                    ...(remoteData.lessons?.map(l => l.lesson_id) || [])
                ]));
                
                // Track existing sessions to avoid duplicates
                const existingSessionIds = new Set(state.userProgress.drivingSessions.map(s => s.id));

                const remoteSessions = (remoteData.sessions || [])
                    .filter(s => !existingSessionIds.has(s.id))
                    .map(s => ({
                        id: s.id,
                        date: s.date,
                        duration: s.duration,
                        type: s.type,
                        notes: s.notes || '',
                        instructorName: s.instructorName || '',
                        route: s.route || [],
                        mistakes: s.mistakes || [],
                        totalDistance: s.totalDistance || 0,
                        locationSummary: s.locationSummary || undefined
                    }));

                const combinedSessions = [...state.userProgress.drivingSessions, ...remoteSessions];
                
                let totalDrivingMinutes = 0;
                const specialDrivingMinutes = { ueberland: 0, autobahn: 0, nacht: 0 };
                
                combinedSessions.forEach(s => {
                    const duration = Number(s.duration) || 0;
                    totalDrivingMinutes += duration;
                    if (s.type === 'ueberland') specialDrivingMinutes.ueberland += duration;
                    if (s.type === 'autobahn') specialDrivingMinutes.autobahn += duration;
                    if (s.type === 'nacht') specialDrivingMinutes.nacht += duration;
                });

                // Robust premium check: true if remote is true, otherwise keep local if it was already true (though DB is truth)
                const isPremium = remoteData.profile?.is_premium ?? state.isPremium;

                const finalUserProgress = {
                    ...state.userProgress,
                    completedLessons: combinedCompletedLessons,
                    drivingSessions: combinedSessions,
                    unlockedAchievements: Array.from(new Set([
                        ...(state.userProgress.unlockedAchievements || []),
                        ...(remoteData.unlockedAchievements || [])
                    ])),
                    incorrectQuestions: Array.from(new Set([
                        ...(state.userProgress.incorrectQuestions || []),
                        ...(remoteData.incorrectQuestions || [])
                    ])),
                    totalDrivingMinutes,
                    specialDrivingMinutes,
                    hourlyRate45: remoteData.hourlyRate45,
                    fixedCosts: remoteData.fixedCosts
                };

                // SILENTLY unlock achievements that are already met but not marked as unlocked
                // This prevents them from "popping" at the wrong time (e.g. when marking a lesson)
                const tempState = { 
                    ...state, 
                    isPremium, 
                    userProgress: finalUserProgress 
                } as any;
                const silentAchievements = checkAndUnlockAchievements(tempState);
                if (silentAchievements.length > 0) {
                    finalUserProgress.unlockedAchievements = Array.from(new Set([
                        ...finalUserProgress.unlockedAchievements,
                        ...silentAchievements
                    ]));
                }

                return {
                    isPremium,
                    isPublicReportEnabled: remoteData.isPublicReportEnabled,
                    licenseType: remoteData.licenseType || state.licenseType,
                    learningPath: remoteData.learningPath || state.learningPath,
                    transmissionType: remoteData.transmissionType || state.transmissionType,
                    userProgress: finalUserProgress
                };
            });
          }

          // Unblock the UI immediately after critical hydration
          setIsAuthLoading(false);

          // Run background tasks non-blockingly
          (async () => {
            try {
              const currentState = useAppStore.getState();
              await ensureProfileFromState(currentState);
              
              if (isNewUser) {
                console.log('[App] New user detected, migrating local progress to cloud in background...');
                const localProgress = currentState.userProgress;
                // Run syncs concurrently instead of serially
                const lessonSyncs = localProgress.completedLessons.map(lessonId => syncCompletedLesson(lessonId));
                const sessionSyncs = localProgress.drivingSessions.map(session => syncDrivingSession(session, currentState.transmissionType));
                
                await Promise.all([...lessonSyncs, ...sessionSyncs]);
                console.log('[App] Background migration complete.');
              }
            } catch (bgError) {
              console.error('[App] Background sync error:', bgError);
            }
          })();

        } else {
          // If there is no session, just set auth state to guest.
          setAuthState(null, 'guest', null, null);
          setIsAuthLoading(false);
        }
      } catch (error) {
        console.error('[App] Auth subscription error:', error);
        setAuthState(null, 'guest', null, null);
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setAuthState, logoutCleanup]);

  // Handle post-payment success refresh (Web & Mobile)
  useEffect(() => {
    const triggerHydration = async () => {
      const remoteData = await hydrateFromSupabase();
      if (remoteData?.profile?.is_premium) {
        useAppStore.setState({ isPremium: true });
        // Clear the URL param without refreshing (Web)
        if (typeof window !== 'undefined' && window.location.search) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    // 1. Web Check (URL Params)
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id') && useAppStore.getState().authStatus === 'signed_in') {
      triggerHydration();
    }

    // 2. Mobile Check (Capacitor Deep Links & Back Button)
    const initMobileFeatures = async () => {
      try {
        const { App } = await import('@capacitor/app');
        const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
        
        // Let Capgo know the app is healthy (critical for auto-rollbacks)
        CapacitorUpdater.notifyAppReady();

        // Update listeners for visual feedback
        (CapacitorUpdater as any).addListener('downloadProgress', (data: any) => {
          const lang = useAppStore.getState().language || 'de';
          const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS].common.updates;
          toast.loading(`${t.downloading} (${data.percent}%)`, { id: 'capgo-update' });
        });

        (CapacitorUpdater as any).addListener('updateApplied', () => {
          const lang = useAppStore.getState().language || 'de';
          const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS].common.updates;
          toast.success(t.ready, { id: 'capgo-update', duration: 10000 });
        });


        
        // Deep Links
        App.addListener('appUrlOpen', (data: { url: string }) => {
          console.log('[App] Deep link received:', data.url);
          if (data.url.includes('checkout/success')) {
            triggerHydration();
          }
        });

        // Hardware Back Button
        App.addListener('backButton', ({ canGoBack }) => {
          console.log('[App] Hardware back button pressed');
          
          // 1. Priority: Close Modals
          if (showAuthModal) {
            setShowAuthModal(false);
            return;
          }
          if (showPaywall) {
            setShowPaywall(false);
            return;
          }
          if (showPathSelector) {
            setShowPathSelector(false);
            return;
          }

          // 2. Secondary: Detail Views
          if (selectedLesson) {
            setSelectedLesson(null);
            return;
          }
          if (selectedLegalPage) {
            setSelectedLegalPage(null);
            return;
          }
          if (showExamSimulation) {
            setShowExamSimulation(false);
            return;
          }

          // 3. Navigation: Back to Dashboard if on another tab
          if (activeTab !== 'home') {
            setActiveTab('home');
            return;
          }

          // 4. Default: Let the OS handle it (minimize/exit)
          if (!canGoBack) {
            App.exitApp();
          }
        });

      } catch {
        console.log('[App] Capacitor App plugin not found, skipping mobile-only features.');
      }
    };
    initMobileFeatures();
  }, [showAuthModal, showPaywall, showPathSelector, selectedLesson, selectedLegalPage, showExamSimulation, activeTab, setActiveTab]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLessonSelect = (lesson: Lesson) => {
    if (lesson.isPremium && !isPremium) {
      setShowPaywall(true);
      return;
    }
    setSelectedLesson(lesson);
  };

  const handleDirectLessonSelect = (lessonId: string) => {
    const allLessons = chapters.flatMap(c => c.lessons);
    const lesson = allLessons.find(l => l.id === lessonId);
    if (lesson) {
      if (lesson.isPremium && !isPremium) {
        setShowPaywall(true);
        return;
      }
      setSelectedLesson(lesson);
    }
  };

  const handleLessonBack = () => {
    setSelectedLesson(null);
  };

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
    // Clearing selectedLesson here ensures that manual navigation via Sidebar/BottomNav
    // takes the user back to the tab's main view even if they were deep in a lesson.
    setSelectedLesson(null);
    setSelectedLegalPage(null);
  };

  const handleOpenLegalPage = (page: LegalPageType) => {
    setActiveTab('legal');
    setSelectedLesson(null);
    setSelectedLegalPage(page);
  };

  const handleBackToLegalHub = () => {
    setActiveTab('legal');
    setSelectedLegalPage(null);
  };

  const handleChangePath = () => {
    setShowPathSelector(true);
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    logoutCleanup();
    setHasVisited(false);
  };

  const handleDeleteAccount = async () => {
    try {
      const { resetAllDataFromCloud } = await import('./services/supabaseSync');
      await resetAllDataFromCloud();
      await signOut();
      logoutCleanup();
      setHasVisited(false);
      return true;
    } catch (error) {
      console.error('[GDPR] Account deletion failed:', error);
      return false;
    }
  };

  const hasCompleteSelection = !!licenseType && !!learningPath && !!transmissionType;
  const isDetailPage = selectedLesson !== null || selectedLegalPage !== null;

  const renderContent = () => {
    if (selectedLesson) {
      return (
        <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
          <LessonDetail 
            lesson={selectedLesson} 
            onBack={handleLessonBack} 
          />
        </Suspense>
      );
    }

    if (activeTab === 'legal' && selectedLegalPage) {
      return (
        <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
          <LegalPage page={selectedLegalPage} onBack={handleBackToLegalHub} />
        </Suspense>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            onNavigate={handleNavigate}
            onChangePath={handleChangePath}
            onOpenPaywall={() => setShowPaywall(true)}
            onStartSimulation={() => setShowExamSimulation(true)}
            onDirectLessonSelect={handleDirectLessonSelect}
            onOpenAuth={handleOpenAuth}
            onOpenReadiness={() => setShowReadinessModal(true)}
            onOpenHotspots={() => setShowHotspotMap(true)}
          />
        );
      case 'curriculum':
        return (
          <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
            <Curriculum onLessonSelect={handleLessonSelect} />
          </Suspense>
        );
      case 'maneuvers':
        return (
          <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
            <Maneuvers 
              onLessonSelect={handleLessonSelect}
              onOpenPaywall={() => setShowPaywall(true)}
            />
          </Suspense>
        );
      case 'tracker':
      case 'history': // 'history' is a sub-tab inside Tracker — render Tracker, which handles it internally
        return (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center p-8"><Skeleton className="h-full w-full rounded-2xl" /></div>}>
            <Tracker onOpenPaywall={() => setShowPaywall(true)} />
          </Suspense>
        );
      case 'achievements':
        return (
          <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
            <Achievements />
          </Suspense>
        );
      case 'finance':
        return (
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center p-8"><Skeleton className="h-full w-full rounded-2xl" /></div>}>
            <BudgetEstimator onOpenPaywall={() => setShowPaywall(true)} />
          </Suspense>
        );
      case 'legal':
        return (
          <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
            <LegalHub onOpenPage={handleOpenLegalPage} />
          </Suspense>
        );
      case 'account':
        return (
          <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
            <Account 
              onOpenAuth={handleOpenAuth} 
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
              onChangePath={handleChangePath}
              onOpenLegal={() => handleOpenLegalPage('privacy')}
            />
          </Suspense>
        );
      case 'review':
        return (
          <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>}>
            <InstructorReview onBack={() => setActiveTab('maneuvers')} />
          </Suspense>
        );
      default:
        return <Dashboard onNavigate={handleNavigate} onChangePath={handleChangePath} onOpenPaywall={() => setShowPaywall(true)} onStartSimulation={() => setShowExamSimulation(true)} onDirectLessonSelect={handleDirectLessonSelect} onOpenAuth={handleOpenAuth} onOpenReadiness={() => setShowReadinessModal(true)} onOpenHotspots={() => setShowHotspotMap(true)} />;
    }
  };


  const renderAppContent = () => {
    if (reportUserId) {
      return <PublicReport userId={reportUserId} onBack={() => setReportUserId(null)} />;
    }

    if (isAuthLoading && authStatus !== 'guest') {
      return <MobileSplash />;
    }

    // Native bypass: Mobile users never see the landing page
    const isNative = Capacitor.isNativePlatform() || (typeof window !== 'undefined' && ((window as any).Capacitor?.isNativePlatform?.() || (window as any).isNativePlatform === true));
    
    if (!hasVisited && !isNative) {
      return (
        <Suspense fallback={<div className="h-screen bg-slate-900" />}>
          <Welcome />
        </Suspense>
      );
    }

    if (!hasCompleteSelection) {
      return (
        <Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-slate-950">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-blue-600/20" />
          </div>
        }>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl">
              <LicenseSelector />
            </div>
          </div>
        </Suspense>
      );
    }

    if (showExamSimulation) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
          <ExamSimulation onBack={() => setShowExamSimulation(false)} />
        </Suspense>
      );
    }

    return (
      <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-900 capacitor-app">
        <div className="flex h-full">
          <DesktopNav activeTab={activeTab} onTabChange={handleNavigate} onSignOut={handleSignOut} />
          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain" style={{ height: '100dvh', WebkitOverflowScrolling: 'touch' }}>
            {!isDetailPage && (
              <Header 
                onSignOut={handleSignOut} 
                onTabChange={handleNavigate} 
              />
            )}
            <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6 pb-32 lg:pb-6">
              <div className="mx-auto max-w-4xl">
                <Suspense fallback={
                  <div className="space-y-4 w-full h-full animate-pulse">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                }>
                  <div 
                    key={`${activeTab}-${selectedLesson?.id || 'none'}-${selectedLegalPage || 'none'}`}
                    className="animate-scale-in"
                  >
                    {renderContent()}
                  </div>
                </Suspense>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:hidden">
          <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
        </div>

        {showAuthModal && (
          <Suspense fallback={null}>
            <AuthModal onClose={() => setShowAuthModal(false)} />
          </Suspense>
        )}
        {showPathSelector && <PathSelectorModal onClose={() => setShowPathSelector(false)} />}

        {showPaywall && !isPremium && (
          <Suspense fallback={null}>
            <Paywall onClose={() => setShowPaywall(false)} />
          </Suspense>
        )}

        <ReadinessBreakdownModal
          isOpen={showReadinessModal}
          onClose={() => setShowReadinessModal(false)}
          readinessData={readinessData}
          language={language}
        />

        <PrivacyConsentModal 
          isOpen={!userProgress.hasAcceptedPrivacy && hasVisited && authStatus !== 'guest'} 
          onAccept={() => setAcceptedPrivacy(true)}
          onOpenPrivacyPolicy={() => {
            setActiveTab('legal');
            setSelectedLegalPage('privacy');
          }}
        />

        {showHotspotMap && <HotspotMap onClose={() => setShowHotspotMap(false)} />}
      </div>
    );
  };

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#334155',
            color: '#fff',
          },
        }}
      />
      
      {renderAppContent()}

      {!Capacitor.isNativePlatform() && <CookieConsent />}
      <AchievementOverlay />
    </>
  );
}

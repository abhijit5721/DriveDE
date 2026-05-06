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
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { hydrateFromSupabase, syncDrivingSession, syncCompletedLesson, ensureProfileFromState } from './services/supabaseSync';
import { signOut, subscribeToAuthChanges } from './services/auth';
import { chapters } from './data/curriculum';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopNav } from './components/layout/DesktopNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { Welcome } from './components/auth/Welcome';
import { Paywall } from './components/finance/Paywall';
import { AuthModal } from './components/auth/AuthModal';
import { LicenseSelector } from './components/auth/LicenseSelector';


// Lazy loaded routes
const Curriculum = lazy(() => import('./components/curriculum/Curriculum').then(m => ({ default: m.Curriculum })));
const Maneuvers = lazy(() => import('./components/maneuvers/Maneuvers').then(m => ({ default: m.Maneuvers })));
const Tracker = lazy(() => import('./components/tracker/Tracker').then(m => ({ default: m.Tracker })));
const Achievements = lazy(() => import('./components/curriculum/Achievements').then(m => ({ default: m.Achievements })));
const ExamSimulation = lazy(() => import('./components/maneuvers/ExamSimulation').then(m => ({ default: m.ExamSimulation })));
const LessonDetail = lazy(() => import('./components/curriculum/LessonDetail').then(m => ({ default: m.LessonDetail })));
const InstructorReview = lazy(() => import('./components/maneuvers/InstructorReview').then(m => ({ default: m.InstructorReview })));
const LegalHub = lazy(() => import('./components/legal/LegalHub').then(m => ({ default: m.LegalHub })));
const LegalPage = lazy(() => import('./components/legal/LegalPage').then(m => ({ default: m.LegalPage })));
const Account = lazy(() => import('./components/auth/Account').then(m => ({ default: m.Account })));
const BudgetEstimator = lazy(() => import('./components/finance/BudgetEstimator').then(m => ({ default: m.BudgetEstimator })));
import { Skeleton } from './components/common/Skeleton';
import { AchievementOverlay } from './components/common/AchievementOverlay';
import type { TabType, Lesson, LegalPageType } from './types';
import { PublicReport } from './components/maneuvers/PublicReport';
import { PathSelectorModal } from './components/auth/PathSelectorModal';
import { CookieConsent } from './components/legal/CookieConsent';
import { PrivacyConsentModal } from './components/legal/PrivacyConsentModal';


export default function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExamSimulation, setShowExamSimulation] = useState(false);
  const [showPathSelector, setShowPathSelector] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const {
    darkMode,
    licenseType,
    isPremium,
    authStatus,
    setAuthState,
    hasVisited,
    setHasVisited,
    logoutCleanup,
    activeTab,
    setActiveTab,
    userProgress,
    setAcceptedPrivacy,
    learningPath,
    transmissionType,
  } = useAppStore();
  
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
      if (document.visibilityState === 'hidden') {
        console.log('[App] App backgrounded, triggering emergency sync...');
        import('./services/supabaseSync').then(m => m.processSyncQueue());
      }
    };
    
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

                return {
                    isPremium,
                    isPublicReportEnabled: remoteData.isPublicReportEnabled,
                    licenseType: remoteData.licenseType || state.licenseType,
                    learningPath: remoteData.learningPath || state.learningPath,
                    transmissionType: remoteData.transmissionType || state.transmissionType,
                    userProgress: {
                        ...state.userProgress,
                        completedLessons: combinedCompletedLessons,
                        drivingSessions: combinedSessions,
                        incorrectQuestions: Array.from(new Set([
                            ...(state.userProgress.incorrectQuestions || []),
                            ...(remoteData.incorrectQuestions || [])
                        ])),
                        totalDrivingMinutes,
                        specialDrivingMinutes,
                        hourlyRate45: remoteData.hourlyRate45,
                        fixedCosts: remoteData.fixedCosts
                    }
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

    // 2. Mobile Check (Capacitor Deep Links)
    const initDeepLinks = async () => {
      try {
        const { App } = await import('@capacitor/app');
        App.addListener('appUrlOpen', (data: { url: string }) => {
          console.log('[App] Deep link received:', data.url);
          // Example: drivede://checkout/success?session_id=...
          if (data.url.includes('checkout/success')) {
            triggerHydration();
          }
        });
      } catch {
        console.log('[App] Capacitor App plugin not found, skipping deep link listener.');
      }
    };
    initDeepLinks();
  }, []);

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
        <LessonDetail 
          lesson={selectedLesson} 
          onBack={handleLessonBack} 
        />
      );
    }

    if (activeTab === 'legal' && selectedLegalPage) {
      return <LegalPage page={selectedLegalPage} onBack={handleBackToLegalHub} />;
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
          />
        );
      case 'curriculum':
        return <Curriculum onLessonSelect={handleLessonSelect} />;
      case 'maneuvers':
        return (
          <Maneuvers 
            onLessonSelect={handleLessonSelect}
            onOpenPaywall={() => setShowPaywall(true)}
          />
        );
      case 'tracker':
      case 'history': // 'history' is a sub-tab inside Tracker — render Tracker, which handles it internally
        return <Tracker onOpenPaywall={() => setShowPaywall(true)} />;
      case 'achievements':
        return <Achievements />;
      case 'finance':
        return <BudgetEstimator onOpenPaywall={() => setShowPaywall(true)} />;
      case 'legal':
        return <LegalHub onOpenPage={handleOpenLegalPage} />;
      case 'account':
        return (
          <Account 
            onOpenAuth={handleOpenAuth} 
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            onChangePath={handleChangePath}
            onOpenLegal={() => handleOpenLegalPage('privacy')}
          />
        );
      case 'review':
        return <InstructorReview onBack={() => setActiveTab('maneuvers')} />;
      default:
        return <Dashboard onNavigate={handleNavigate} onChangePath={handleChangePath} onOpenPaywall={() => setShowPaywall(true)} onStartSimulation={() => setShowExamSimulation(true)} onDirectLessonSelect={handleDirectLessonSelect} onOpenAuth={handleOpenAuth} />;
    }
  };


  const renderAppContent = () => {
    if (reportUserId) {
      return <PublicReport userId={reportUserId} onBack={() => setReportUserId(null)} />;
    }

    if (isAuthLoading && authStatus !== 'guest') {
      return (
        <div className="flex h-screen items-center justify-center bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
            <p className="text-sm text-slate-400">Loading your profile...</p>
          </div>
        </div>
      );
    }

    if (!hasVisited) {
      return <Welcome />;
    }

    if (!hasCompleteSelection) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <LicenseSelector />
          </div>
        </div>
      );
    }

    if (showExamSimulation) {
      return <ExamSimulation onBack={() => setShowExamSimulation(false)} />;
    }

    return (
      <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-900">
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

        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        {showPathSelector && <PathSelectorModal onClose={() => setShowPathSelector(false)} />}

        {showPaywall && !isPremium && (
          <Paywall onClose={() => setShowPaywall(false)} />
        )}

        <PrivacyConsentModal 
          isOpen={!userProgress.hasAcceptedPrivacy && hasVisited && authStatus !== 'guest'} 
          onAccept={() => setAcceptedPrivacy(true)}
          onOpenPrivacyPolicy={() => {
            setActiveTab('legal');
            setSelectedLegalPage('privacy');
          }}
        />
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

      <CookieConsent />
      <AchievementOverlay />
    </>
  );
}

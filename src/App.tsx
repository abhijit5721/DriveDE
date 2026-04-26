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

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { hydrateFromSupabase, syncDrivingSession, syncCompletedLesson, ensureProfileFromState } from './services/supabaseSync';
import { signOut, subscribeToAuthChanges } from './services/auth';
import { chapters } from './data/curriculum';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { DesktopNav } from './components/layout/DesktopNav';
import { Dashboard } from './components/dashboard/Dashboard';
import { Curriculum } from './components/curriculum/Curriculum';
import { Maneuvers } from './components/maneuvers/Maneuvers';
import { Tracker } from './components/tracker/Tracker';
import { Achievements } from './components/curriculum/Achievements';
import { ExamSimulation } from './components/maneuvers/ExamSimulation';
import { LessonDetail } from './components/curriculum/LessonDetail';
import { Welcome } from './components/auth/Welcome';
import { Paywall } from './components/finance/Paywall';
import { InstructorReview } from './components/maneuvers/InstructorReview';
import { LegalHub } from './components/legal/LegalHub';
import { LegalPage } from './components/legal/LegalPage';
import { AuthModal } from './components/auth/AuthModal';
import { Account } from './components/auth/Account';
import { AccountSkeleton } from './components/auth/AccountSkeleton';
import { BudgetEstimator } from './components/finance/BudgetEstimator';
import { Skeleton } from './components/common/Skeleton';
import type { TabType, Lesson, LegalPageType } from './types';
import {LicenseSelector} from './components/auth/LicenseSelector';
import { PublicReport } from './components/maneuvers/PublicReport';


export default function App() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExamSimulation, setShowExamSimulation] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const {
    darkMode,
    licenseType,
    isPremium,
    setLicenseType,
    setLearningPath,
    setTransmissionType,
    setAuthState,
    hasVisited,
    setHasVisited,
    resetProgress,
    activeTab,
    setActiveTab,
  } = useAppStore();
  
  const [reportUserId, setReportUserId] = useState<string | null>(null);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get('report');
    if (reportId) {
      setReportUserId(reportId);
      console.log(`[App] Public report view detected for ID: ${reportId}`);
    }
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
          
          const remoteData = await hydrateFromSupabase().catch(err => {
            console.error('[App] Hydration failed:', err);
            return null;
          });
        if (remoteData) {
          console.log('[App] State hydrated from Supabase');
        }
        
        // Ensure profile exists in DB immediately upon login
        const currentState = useAppStore.getState();
        await ensureProfileFromState(currentState);
        
        if (isNewUser) {
          console.log('[App] New user detected, migrating local progress to cloud...');
          // First sign-in: sync local session progress to cloud
          const localProgress = useAppStore.getState().userProgress;
          for (const lessonId of localProgress.completedLessons) {
            await syncCompletedLesson(lessonId);
          }
          for (const drivingSession of localProgress.drivingSessions) {
            await syncDrivingSession(drivingSession, useAppStore.getState().transmissionType);
          }
        }

        if (remoteData && useAppStore.getState().authStatus === 'signed_in') {
            useAppStore.setState((state) => {
                const combinedCompletedLessons = Array.from(new Set([
                    ...state.userProgress.completedLessons,
                    ...remoteData.lessons.map(l => l.lesson_id)
                ]));
                
                // Track existing sessions to avoid duplicates
                const existingSessionIds = new Set(state.userProgress.drivingSessions.map(s => s.id));

                // remoteData.sessions is already mapped to frontend format by hydrateFromSupabase
                const remoteSessions = remoteData.sessions
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

                return {
                    isPremium: !!remoteData.profile?.is_premium,
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
        } else {
          setAuthState(null, 'guest', null, null);
        }
      } catch (error) {
        console.error('[App] Auth subscription error:', error);
        setAuthState(null, 'guest', null, null);
      } finally {
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setAuthState]);

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
    setSelectedLesson(null);
    setActiveTab('home');
    setLearningPath(null);
    setTransmissionType(null);
    setLicenseType(null);
    setHasVisited(false);
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthState(null, 'guest', null, null);
    resetProgress();
    setHasVisited(false);
  };

  if (reportUserId) {
    return <PublicReport userId={reportUserId} onBack={() => setReportUserId(null)} />;
  }

  if (!hasVisited) {

    return <Welcome />;
  }

  const hasCompleteSelection =
    licenseType === 'manual' ||
    licenseType === 'automatic' ||
    licenseType === 'umschreibung-manual' ||
    licenseType === 'umschreibung-automatic';

  if (isAuthLoading && !hasCompleteSelection) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Skeleton className="h-32 w-64 rounded-2xl" />
      </div>
    );
  }

  if (!hasCompleteSelection) {
    return <LicenseSelector />;
  }

  if (showExamSimulation) {
    return <ExamSimulation onBack={() => setShowExamSimulation(false)} />;
  }

  const isDetailPage = selectedLesson !== null || selectedLegalPage !== null || activeTab === 'review';

  const renderContent = () => {
    if (isAuthLoading) {
      if (activeTab === 'account') {
        return <AccountSkeleton />;
      }
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      );
    }

    if (selectedLesson) {
      return <LessonDetail lesson={selectedLesson} onBack={handleLessonBack} />;
    }

    if (activeTab === 'legal') {
      if (selectedLegalPage) {
        return <LegalPage page={selectedLegalPage} onBack={handleBackToLegalHub} />;
      }
      return <LegalHub onOpenPage={handleOpenLegalPage} />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onChangePath={handleChangePath}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenAuth={handleOpenAuth}
            onStartSimulation={() => {
              if (isPremium) {
                setShowExamSimulation(true);
              } else {
                setShowPaywall(true);
              }
            }}
            onDirectLessonSelect={handleDirectLessonSelect}
          />
        );
      case 'curriculum':
        return <Curriculum onLessonSelect={handleLessonSelect} />;
      case 'maneuvers':
        return <Maneuvers onLessonSelect={handleLessonSelect} onOpenPaywall={() => setShowPaywall(true)} />;
      case 'tracker':
        return <Tracker onOpenPaywall={() => setShowPaywall(true)} />;
      case 'achievements':
        return <Achievements />;
      case 'finance':
        return <BudgetEstimator onOpenPaywall={() => setShowPaywall(true)} />;
      case 'review':
        return <InstructorReview onBack={() => setActiveTab('home')} onOpenPaywall={() => setShowPaywall(true)} />;
      case 'account':
        return (
          <Account
            onOpenAuth={handleOpenAuth}
            onSignOut={handleSignOut}
            onChangePath={handleChangePath}
            onOpenLegal={() => setActiveTab('legal')}
            onOpenReview={() => setActiveTab('review')}
          />
        );
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onChangePath={handleChangePath}
            onOpenPaywall={() => setShowPaywall(true)}
            onOpenAuth={handleOpenAuth}
            onStartSimulation={() => {
              if (isPremium) {
                setShowExamSimulation(true);
              } else {
                setShowPaywall(true);
              }
            }}
            onDirectLessonSelect={handleDirectLessonSelect}
          />
        );
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-slate-900">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#334155',
            color: '#fff',
          },
        }}
      />
      <div className="flex h-full">
        <DesktopNav activeTab={activeTab} onTabChange={handleNavigate} onSignOut={handleSignOut} />
        <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain" style={{ height: '100dvh', WebkitOverflowScrolling: 'touch' }}>
          {!isDetailPage && <Header onOpenAuth={handleOpenAuth} onSignOut={handleSignOut} />}
          <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6 pb-32 lg:pb-6">
            <div className="mx-auto max-w-4xl">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
      <div className="lg:hidden">
        <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showPaywall && !isPremium && (
        <Paywall onClose={() => setShowPaywall(false)} />
      )}
    </div>
  );
}

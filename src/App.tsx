import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { hydrateFromSupabase, syncDrivingSession, syncCompletedLesson, ensureProfileFromState } from './services/supabaseSync';
import { signOut, subscribeToAuthChanges } from './services/auth';
import { chapters } from './data/curriculum';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import { Dashboard } from './components/Dashboard';
import { Curriculum } from './components/Curriculum';
import { Maneuvers } from './components/Maneuvers';
import { Tracker } from './components/Tracker';
import { Achievements } from './components/Achievements';
import { ExamSimulation } from './components/ExamSimulation';
import { LessonDetail } from './components/LessonDetail';
import { Welcome } from './components/Welcome';
import { Paywall } from './components/Paywall';
import { InstructorReview } from './components/InstructorReview';
import { LegalHub } from './components/LegalHub';
import { LegalPage } from './components/LegalPage';
import { AuthModal } from './components/AuthModal';
import { Account } from './components/Account';
import { AccountSkeleton } from './components/AccountSkeleton';
import { Skeleton } from './components/Skeleton';
import type { TabType, Lesson, LegalPageType } from './types';
import {LicenseSelector} from "@/components/LicenseSelector.tsx";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
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
  } = useAppStore();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (session) => {
      const isNewUser = !useAppStore.getState().authEmail && !!session?.user;
      
      if (session?.user) {
        const { user } = session;
        const displayName = user.user_metadata?.full_name || user.email || null;
        setAuthState(user.email || null, 'signed_in', displayName);
        
        const remoteData = await hydrateFromSupabase();
        
        // Ensure profile exists in DB immediately upon login
        const currentState = useAppStore.getState();
        await ensureProfileFromState(currentState);
        
        if (isNewUser) {
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
                const existingSessionKeys = new Set(state.userProgress.drivingSessions.map(s => 
                    `${s.date}-${s.duration}`
                ));

                // remoteData.sessions is already mapped to frontend format by hydrateFromSupabase
                const remoteSessions = remoteData.sessions
                    .filter(s => !existingSessionKeys.has(`${s.date}-${s.duration}`))
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
                let specialDrivingMinutes = { ueberland: 0, autobahn: 0, nacht: 0 };
                
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
                        specialDrivingMinutes
                    }
                };
            });
        }

      } else {
        setAuthState(null, 'guest', null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setAuthState]);

  // Handle post-payment success refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id') && useAppStore.getState().authStatus === 'signed_in') {
      const triggerHydration = async () => {
        const remoteData = await hydrateFromSupabase();
        if (remoteData?.profile?.is_premium) {
          useAppStore.setState({ isPremium: true });
          // Clear the URL param without refreshing
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      triggerHydration();
    }
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
    // Don't auto-reset selectedLesson here because it breaks direct lesson selection
    // that triggers a navigation. Instead, selectedLesson is cleared by handleLessonBack
    // or when explicitly choosing a new lesson.
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
    setAuthState(null, 'guest', null);
    resetProgress();
    setHasVisited(false);
  };

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
        return <Maneuvers onLessonSelect={handleLessonSelect} />;
      case 'tracker':
        return <Tracker onOpenPaywall={() => setShowPaywall(true)} />;
      case 'achievements':
        return <Achievements />;
      case 'review':
        return <InstructorReview onBack={() => setActiveTab('home')} />;
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
        <DesktopNav activeTab={activeTab} onTabChange={handleNavigate} />
        <div className="flex h-screen flex-1 flex-col overflow-y-auto">
          {!isDetailPage && <Header onOpenAuth={handleOpenAuth} onSignOut={handleSignOut} />}
          <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6 pb-24 lg:pb-6">
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

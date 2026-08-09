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
import { App as CapacitorApp, AppLaunchUrl } from '@capacitor/app';
import { useAppStore } from './store/useAppStore';
import { supabase } from './lib/supabase';
import { hydrateFromSupabase, syncDrivingSession, syncCompletedLesson, ensureProfileFromState } from './services/supabaseSync';
import { checkAndUnlockAchievements } from './utils/achievements';
import { resolveTrial } from './utils/trialSync';
import { startCheckout, consumePendingPurchase } from './services/checkout';
import { syncStructuredData } from './utils/seoSchema';
import { signOut, subscribeToAuthChanges } from './services/auth';
import { analyticsService } from './services/AnalyticsService';
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
const TrialEndedModal = lazy(() => import('./components/finance/TrialEndedModal').then(m => ({ default: m.TrialEndedModal })));
import { Skeleton } from './components/common/Skeleton';
import { AchievementOverlay } from './components/common/AchievementOverlay';
import type { TabType, Lesson, LegalPageType } from './types';
import { PublicReport } from './components/maneuvers/PublicReport';
import { PathSelectorModal } from './components/auth/PathSelectorModal';
import { CookieConsent } from './components/legal/CookieConsent';
import { PrivacyConsentModal } from './components/legal/PrivacyConsentModal';
import { TRANSLATIONS } from './data/translations';
import { HotspotMap } from './components/dashboard/HotspotMap';
import { OnboardingTour } from './components/onboarding/OnboardingTour';


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
    isProActive,
    isPremium,
    authStatus,
    setAuthState,
    setHasVisited,
    logoutCleanup,
    activeTab,
    setActiveTab,
    language,
    hasCompletedOnboarding,
    trialStartedAt,
    trialEndsAt,
    trialEndedAcknowledged,
    acknowledgeTrialEnded,
  } = useAppStore();

  // Google sign-in redirects the page away and back, so a purchase intent that
  // started on the landing page can only be resumed here, once the session
  // exists again. Runs once per sign-in; consuming the token prevents repeats.
  useEffect(() => {
    if (authStatus !== 'signed_in' || isPremium) return;
    const tier = consumePendingPurchase();
    if (!tier) return;
    console.log('[App] Resuming checkout after OAuth redirect:', tier);
    startCheckout(tier, language).then(result => {
      if (!result.ok) console.warn('[App] Could not resume checkout:', result.reason);
    });
  }, [authStatus, isPremium, language]);

  // The trial ran out, the user didn't buy, and they haven't been told yet.
  const showTrialEnded =
    hasVisited &&
    !isPremium &&
    !trialEndedAcknowledged &&
    !!trialStartedAt &&
    !!trialEndsAt &&
    new Date(trialEndsAt) <= new Date();

  // Use isProActive() which accounts for both paid premium AND active trial
  const proActive = isProActive();

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

  // ?lang=en|de overrides the stored language (hreflang alternate URLs + shareable English links).
  // Applied both immediately and after persist rehydration, which would otherwise
  // asynchronously restore the previously stored language and win the race.
  useEffect(() => {
    const langParam = new URLSearchParams(window.location.search).get('lang');
    if (langParam !== 'en' && langParam !== 'de') return;
    useAppStore.setState({ language: langParam });
    const unsub = useAppStore.persist?.onFinishHydration?.(() => {
      useAppStore.setState({ language: langParam });
    });
    return unsub;
  }, []);

  // Keep document title, meta description, and <html lang> in sync with the app
  // language — the static index.html defaults are German; English visitors (and
  // Google crawling the ?lang=en alternate) get the English versions.
  useEffect(() => {
    const isDe = language === 'de';
    document.title = isDe
      ? 'Führerschein App kostenlos – Fahrschule, Theorie & Fahrprüfung | DriveDE'
      : 'Free German Driving License App – Theory, Practical Exam & Umschreibung | DriveDE';
    document.documentElement.lang = isDe ? 'de' : 'en';
    document.querySelector('meta[name="description"]')?.setAttribute(
      'content',
      isDe
        ? 'Die kostenlose Führerschein App für Deutschland: Theorie lernen, Fahrstunden per GPS tracken und die Fahrprüfung im 1. Versuch bestehen. Auch auf Englisch.'
        : 'The free app for your German driving license: learn theory, track driving lessons via GPS, and pass your Fahrprüfung on the first try. Includes Umschreibung guidance for foreign licenses.'
    );
    syncStructuredData(language);
  }, [language]);

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
      urlListener = CapacitorApp.addListener('appUrlOpen', async (data: { url: string }) => {
        handleDeepLink(data.url);
      });

      // Handle app being launched from scratch via URL
      CapacitorApp.getLaunchUrl().then((launchUrl: AppLaunchUrl | undefined) => {
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
    // Safety timeout: if Supabase is paused/unreachable the auth callback may
    // never fire. After 4 s we fall back to guest mode so the app is usable.
    const fallbackTimer = setTimeout(() => {
      setIsAuthLoading((prev) => {
        if (prev) {
          console.warn('[App] Auth callback did not fire within 4s — Supabase may be paused. Falling back to guest mode.');
          setAuthState(null, 'guest', null, null);
          return false;
        }
        return prev;
      });
    }, 4000);

    const unsubscribe = subscribeToAuthChanges(async (session) => {
      clearTimeout(fallbackTimer);
      try {
        const isNewUser = !useAppStore.getState().authEmail && !!session?.user;
        
        if (session?.user) {
          const { user } = session;
          const displayName = user.user_metadata?.full_name || user.email || null;
          console.log(`[App] Auth state changed: ${user.email} (ID: ${user.id})`);
          setAuthState(user.email || null, 'signed_in', displayName, user.id);
          setShowAuthModal(false); // Close modal on success
          // Identify user in PostHog so sessions are linked to their account
          analyticsService.identifyUser(user.id, user.email || '');
          
          // Fetch remote data to hydrate the UI quickly
          const remoteData = await hydrateFromSupabase().catch(err => {
            console.error('[App] Hydration failed:', err);
            return null;
          });

          if (remoteData) {
            console.log('[App] State hydrated from Supabase. isPremium:', remoteData.profile?.is_premium);
            useAppStore.setState((state) => {
                // REMOTE IS SOURCE OF TRUTH on login.
                // Remote lessons override local - avoids divergence between devices.
                const remoteLessonIds = remoteData.lessons?.map(l => l.lesson_id) || [];
                
                // For lessons: if we have remote data, use it as truth.
                // If remote has none yet (brand new account), keep local so offline progress isn't lost.
                const combinedCompletedLessons = remoteLessonIds.length > 0
                    ? Array.from(new Set([
                        ...remoteLessonIds,
                        // Only add local lessons that haven't been synced yet (offline additions)
                        ...state.userProgress.completedLessons.filter(id => !remoteLessonIds.includes(id))
                      ]))
                    : state.userProgress.completedLessons;

                // For sessions: remote is truth. Deduplicate by session ID.
                const remoteSessions = (remoteData.sessions || []).map(s => ({
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

                // Add local-only sessions not yet synced to remote (offline sessions)
                const remoteSessionIds = new Set(remoteSessions.map(s => s.id));
                const localOnlySessions = state.userProgress.drivingSessions.filter(s => !remoteSessionIds.has(s.id));
                const combinedSessions = [...remoteSessions, ...localOnlySessions];

                let totalDrivingMinutes = 0;
                const specialDrivingMinutes = { ueberland: 0, autobahn: 0, nacht: 0 };
                
                combinedSessions.forEach(s => {
                    const duration = Number(s.duration) || 0;
                    totalDrivingMinutes += duration;
                    if (s.type === 'ueberland') specialDrivingMinutes.ueberland += duration;
                    if (s.type === 'autobahn') specialDrivingMinutes.autobahn += duration;
                    if (s.type === 'nacht') specialDrivingMinutes.nacht += duration;
                });

                // Robust premium check: DB is truth
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

                // The account's trial record wins over the device's, so clearing
                // storage or switching devices can't mint a fresh 7-day trial.
                const { effective: trial, needsPush } = resolveTrial(
                    remoteData.serverTrial ?? null,
                    { trialStartedAt: state.trialStartedAt, trialEndsAt: state.trialEndsAt, intendedPlan: state.intendedPlan },
                    remoteData.profile?.created_at ?? null
                );
                if (needsPush && !isPremium) {
                    import('./services/supabaseSync').then(m => m.pushTrialToSupabase(trial));
                }

                return {
                    isPremium,
                    // Clear stale trial data when DB confirms paid Pro, otherwise
                    // adopt the reconciled (account-level) trial.
                    ...(isPremium
                        ? { trialStartedAt: null, trialEndsAt: null }
                        : {
                            trialStartedAt: trial.trialStartedAt,
                            trialEndsAt: trial.trialEndsAt,
                            intendedPlan: (trial.intendedPlan ?? state.intendedPlan) as typeof state.intendedPlan,
                          }),
                    isPublicReportEnabled: remoteData.isPublicReportEnabled,
                    licenseType: remoteData.licenseType || state.licenseType,
                    learningPath: remoteData.learningPath || state.learningPath,
                    transmissionType: remoteData.transmissionType || state.transmissionType,
                    hasCompletedOnboarding: remoteData.hasCompletedOnboarding ?? state.hasCompletedOnboarding,
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
      clearTimeout(fallbackTimer);
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
        App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
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
    if (lesson.isPremium && !proActive) {
      setShowPaywall(true);
      return;
    }
    setSelectedLesson(lesson);
  };

  const handleDirectLessonSelect = (lessonId: string) => {
    const allLessons = chapters.flatMap(c => c.lessons);
    const lesson = allLessons.find(l => l.id === lessonId);
    if (lesson) {
      if (lesson.isPremium && !proActive) {
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
    analyticsService.resetUser(); // Clear PostHog identity before logging out
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

        {showPaywall && !proActive && (
          <Suspense fallback={null}>
            <Paywall onClose={() => setShowPaywall(false)} />
          </Suspense>
        )}

        {/* One explicit "your trial ended" moment — otherwise Pro just stops
            working and the user is left guessing why things are locked. */}
        {showTrialEnded && (
          <Suspense fallback={null}>
            <TrialEndedModal
              onUpgrade={() => { acknowledgeTrialEnded(); setShowPaywall(true); }}
              onDismiss={acknowledgeTrialEnded}
            />
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
      {hasVisited && !hasCompletedOnboarding && <OnboardingTour />}
    </>
  );
}

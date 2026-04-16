import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';
import { hydrateFromSupabase } from './services/supabaseSync';
import { signOut, subscribeToAuthChanges } from './services/auth';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import { Dashboard } from './components/Dashboard';
import { Curriculum } from './components/Curriculum';
import { Maneuvers } from './components/Maneuvers';
import { Tracker } from './components/Tracker';
import { LessonDetail } from './components/LessonDetail';
import { LicenseSelector } from './components/LicenseSelector';
import { Paywall } from './components/Paywall';
import { InstructorReview } from './components/InstructorReview';
import { LegalHub } from './components/LegalHub';
import { LegalPage } from './components/LegalPage';
import { AuthModal } from './components/AuthModal';
import { Account } from './components/Account';
import { AccountSkeleton } from './components/AccountSkeleton';
import { Skeleton } from './components/Skeleton';
import type { TabType, Lesson, LegalPageType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLegalPage, setSelectedLegalPage] = useState<LegalPageType | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const {
    darkMode,
    licenseType,
    isPremium,
    setLicenseType,
    setLearningPath,
    setTransmissionType,
    setAuthState,
  } = useAppStore();

  useEffect(() => {
    const { unsubscribe } = subscribeToAuthChanges((session) => {
      if (session?.user) {
        const { user } = session;
        const displayName = user.user_metadata?.full_name || user.email;
        setAuthState(user.email, 'signed_in', displayName);
        void hydrateFromSupabase();
      } else {
        setAuthState(null, 'guest', null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setAuthState]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!isPremium && licenseType) {
      const timer = setTimeout(() => {
        setShowPaywall(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isPremium, licenseType]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonBack = () => {
    setSelectedLesson(null);
  };

  const handleNavigate = (tab: TabType) => {
    setActiveTab(tab);
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
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthState(null, 'guest', null);
  };

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
          />
        );
      case 'curriculum':
        return <Curriculum onLessonSelect={handleLessonSelect} />;
      case 'maneuvers':
        return <Maneuvers onLessonSelect={handleLessonSelect} />;
      case 'tracker':
        return <Tracker />;
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
          />
        );
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900">
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
          <Header onOpenAuth={handleOpenAuth} onSignOut={handleSignOut} />
          <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6">
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
